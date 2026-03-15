//! Abstract Syntax Tree and recursive-descent Pratt parser for calculator expressions.
//!
//! Supports: arithmetic (+, -, *, /, ^, %), unary (-, √), functions (sin, cos, ...),
//! constants (π, e), implicit multiplication (e.g., 2π, 3(4+5)), and parentheses.

use crate::lexer::Token;

/// An AST node representing a mathematical expression.
#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    /// A numeric literal (e.g., 42, 3.14).
    Number(f64),
    /// A binary operation (e.g., 2 + 3).
    BinaryOp {
        op: BinaryOp,
        lhs: Box<Expr>,
        rhs: Box<Expr>,
    },
    /// A unary operation (e.g., -5, √9).
    UnaryOp {
        op: UnaryOp,
        operand: Box<Expr>,
    },
    /// A function call (e.g., sin(45), log(100)).
    FunctionCall {
        name: String,
        args: Vec<Expr>,
    },
    /// A named variable (e.g., x, ans).
    Variable(String),
    /// A constant (π, e).
    Constant(ConstantKind),
}

/// Binary operators.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BinaryOp {
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Modulo,
}

/// Unary operators.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UnaryOp {
    Negate,
    SquareRoot,
    Reciprocal,
    Factorial,
}

/// Mathematical constants.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConstantKind {
    Pi,
    E,
}

// ── Pratt Parser ────────────────────────────────────────────────────────────

/// Parser state wrapping the token stream.
struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    fn new(tokens: Vec<Token>) -> Self {
        Self { tokens, pos: 0 }
    }

    /// Peek at the current token without consuming it.
    fn peek(&self) -> &Token {
        self.tokens.get(self.pos).unwrap_or(&Token::Eof)
    }

    /// Consume the current token and advance.
    fn advance(&mut self) -> Token {
        let tok = self.tokens.get(self.pos).cloned().unwrap_or(Token::Eof);
        self.pos += 1;
        tok
    }

    /// Expect and consume a specific token, or return an error.
    fn expect(&mut self, expected: &Token) -> Result<(), String> {
        let tok = self.advance();
        if std::mem::discriminant(&tok) == std::mem::discriminant(expected) {
            Ok(())
        } else {
            Err(format!("Expected {expected:?}, got {tok:?}"))
        }
    }

    /// Parse a complete expression (entry point).
    fn parse_expression(&mut self, min_bp: u8) -> Result<Expr, String> {
        // ── Prefix / Atom ────────────────────────────────────────────
        let mut lhs = match self.advance() {
            Token::Number(n) => Expr::Number(n),
            Token::Minus => {
                // Unary negation — bind tighter than addition but looser than power
                let rhs = self.parse_expression(9)?; // prefix binding power
                Expr::UnaryOp {
                    op: UnaryOp::Negate,
                    operand: Box::new(rhs),
                }
            }
            Token::LeftParen => {
                let expr = self.parse_expression(0)?;
                self.expect(&Token::RightParen)?;
                expr
            }
            Token::Identifier(name) => {
                // Check for constants
                match name.as_str() {
                    "pi" | "PI" => Expr::Constant(ConstantKind::Pi),
                    "e" if !matches!(self.peek(), Token::LeftParen) => {
                        Expr::Constant(ConstantKind::E)
                    }
                    _ => {
                        // Function call or variable
                        if matches!(self.peek(), Token::LeftParen) {
                            self.advance(); // consume '('
                            let mut args = Vec::new();
                            if !matches!(self.peek(), Token::RightParen) {
                                args.push(self.parse_expression(0)?);
                                while matches!(self.peek(), Token::Comma) {
                                    self.advance(); // consume ','
                                    args.push(self.parse_expression(0)?);
                                }
                            }
                            self.expect(&Token::RightParen)?;
                            Expr::FunctionCall { name, args }
                        } else {
                            Expr::Variable(name)
                        }
                    }
                }
            }
            tok => return Err(format!("Unexpected token: {tok:?}")),
        };

        // ── Postfix & Infix (Pratt loop) ─────────────────────────────
        loop {
            let op = match self.peek() {
                Token::Plus => Some((BinaryOp::Add, 1, 2)),       // left-assoc
                Token::Minus => Some((BinaryOp::Subtract, 1, 2)), // left-assoc
                Token::Star => Some((BinaryOp::Multiply, 3, 4)),  // left-assoc
                Token::Slash => Some((BinaryOp::Divide, 3, 4)),   // left-assoc
                Token::Percent => Some((BinaryOp::Modulo, 3, 4)), // left-assoc
                Token::Caret => Some((BinaryOp::Power, 6, 5)),    // right-assoc
                // Implicit multiplication: number followed by identifier or '('
                Token::LeftParen | Token::Identifier(_) => {
                    // Only if lhs could be a multiplicand
                    Some((BinaryOp::Multiply, 3, 4))
                }
                Token::Number(_) => {
                    // e.g., "2 3" is unusual but we don't want implicit mul for bare numbers
                    None
                }
                _ => None,
            };

            if let Some((op, l_bp, r_bp)) = op {
                if l_bp < min_bp {
                    break;
                }
                // For implicit multiplication, don't consume the token
                let is_implicit = matches!(
                    self.peek(),
                    Token::LeftParen | Token::Identifier(_)
                ) && !matches!(
                    self.peek(),
                    Token::Plus | Token::Minus | Token::Star | Token::Slash | Token::Caret | Token::Percent
                );

                if !is_implicit {
                    self.advance(); // consume the operator token
                }

                let rhs = self.parse_expression(r_bp)?;
                lhs = Expr::BinaryOp {
                    op,
                    lhs: Box::new(lhs),
                    rhs: Box::new(rhs),
                };
            } else {
                break;
            }
        }

        Ok(lhs)
    }
}

/// Parse a token stream into an AST using Pratt parsing.
pub fn parse(tokens: Vec<Token>) -> Result<Expr, String> {
    let mut parser = Parser::new(tokens);
    let expr = parser.parse_expression(0)?;

    // Ensure we consumed all tokens (except Eof)
    if !matches!(parser.peek(), Token::Eof) {
        return Err(format!("Unexpected trailing token: {:?}", parser.peek()));
    }
    Ok(expr)
}

// ── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::lexer::tokenize;

    fn parse_str(input: &str) -> Result<Expr, String> {
        let tokens = tokenize(input)?;
        parse(tokens)
    }

    #[test]
    fn test_single_number() {
        assert_eq!(parse_str("42").unwrap(), Expr::Number(42.0));
    }

    #[test]
    fn test_addition() {
        let expr = parse_str("2 + 3").unwrap();
        assert_eq!(
            expr,
            Expr::BinaryOp {
                op: BinaryOp::Add,
                lhs: Box::new(Expr::Number(2.0)),
                rhs: Box::new(Expr::Number(3.0)),
            }
        );
    }

    #[test]
    fn test_operator_precedence() {
        // 2 + 3 * 4 should be 2 + (3 * 4)
        let expr = parse_str("2 + 3 * 4").unwrap();
        assert_eq!(
            expr,
            Expr::BinaryOp {
                op: BinaryOp::Add,
                lhs: Box::new(Expr::Number(2.0)),
                rhs: Box::new(Expr::BinaryOp {
                    op: BinaryOp::Multiply,
                    lhs: Box::new(Expr::Number(3.0)),
                    rhs: Box::new(Expr::Number(4.0)),
                }),
            }
        );
    }

    #[test]
    fn test_parentheses() {
        // (2 + 3) * 4
        let expr = parse_str("(2 + 3) * 4").unwrap();
        assert_eq!(
            expr,
            Expr::BinaryOp {
                op: BinaryOp::Multiply,
                lhs: Box::new(Expr::BinaryOp {
                    op: BinaryOp::Add,
                    lhs: Box::new(Expr::Number(2.0)),
                    rhs: Box::new(Expr::Number(3.0)),
                }),
                rhs: Box::new(Expr::Number(4.0)),
            }
        );
    }

    #[test]
    fn test_unary_negation() {
        let expr = parse_str("-5").unwrap();
        assert_eq!(
            expr,
            Expr::UnaryOp {
                op: UnaryOp::Negate,
                operand: Box::new(Expr::Number(5.0)),
            }
        );
    }

    #[test]
    fn test_function_call() {
        let expr = parse_str("sin(45)").unwrap();
        assert_eq!(
            expr,
            Expr::FunctionCall {
                name: "sin".to_string(),
                args: vec![Expr::Number(45.0)],
            }
        );
    }

    #[test]
    fn test_nested_expression() {
        // sin(2 + 3)
        let expr = parse_str("sin(2 + 3)").unwrap();
        assert_eq!(
            expr,
            Expr::FunctionCall {
                name: "sin".to_string(),
                args: vec![Expr::BinaryOp {
                    op: BinaryOp::Add,
                    lhs: Box::new(Expr::Number(2.0)),
                    rhs: Box::new(Expr::Number(3.0)),
                }],
            }
        );
    }

    #[test]
    fn test_right_associative_power() {
        // 2^3^4 should be 2^(3^4)
        let expr = parse_str("2^3^4").unwrap();
        assert_eq!(
            expr,
            Expr::BinaryOp {
                op: BinaryOp::Power,
                lhs: Box::new(Expr::Number(2.0)),
                rhs: Box::new(Expr::BinaryOp {
                    op: BinaryOp::Power,
                    lhs: Box::new(Expr::Number(3.0)),
                    rhs: Box::new(Expr::Number(4.0)),
                }),
            }
        );
    }

    #[test]
    fn test_constant_pi() {
        assert_eq!(parse_str("pi").unwrap(), Expr::Constant(ConstantKind::Pi));
    }

    #[test]
    fn test_constant_e() {
        assert_eq!(parse_str("e").unwrap(), Expr::Constant(ConstantKind::E));
    }

    #[test]
    fn test_complex_expression() {
        // 2 * sin(pi / 6) + 1
        let expr = parse_str("2 * sin(pi / 6) + 1").unwrap();
        // Should parse as (2 * sin(pi / 6)) + 1
        match expr {
            Expr::BinaryOp { op: BinaryOp::Add, .. } => {} // correct top-level
            other => panic!("Expected Add at top level, got {other:?}"),
        }
    }
}
