//! # HC TapCalc Parser
//!
//! Expression parser supporting numeric arithmetic, scientific functions,
//! constants, variables, and (future) symbolic/LaTeX input.
//!
//! ## Architecture
//! ```text
//! Input String → Lexer → Token Stream → AST Parser (Pratt) → Expr AST → Evaluator → f64
//! ```

pub mod ast;
pub mod eval;
pub mod lexer;

// Re-export key types for convenience
pub use ast::{parse, BinaryOp, ConstantKind, Expr, UnaryOp};
pub use eval::{evaluate_ast, evaluate_with_context, AngleUnit, EvalContext};

/// Parse and evaluate a numeric expression string with default context (degrees).
///
/// # Examples
/// ```
/// use hc_tapcalc_parser::evaluate;
/// assert_eq!(evaluate("2 + 3").unwrap(), 5.0);
/// ```
pub fn evaluate(input: &str) -> Result<f64, String> {
    let tokens = lexer::tokenize(input)?;
    let ast_node = ast::parse(tokens)?;
    eval::evaluate_ast(&ast_node)
}

/// Parse and evaluate with a custom context (angle units, variables).
pub fn evaluate_ctx(input: &str, ctx: &EvalContext) -> Result<f64, String> {
    let tokens = lexer::tokenize(input)?;
    let ast_node = ast::parse(tokens)?;
    eval::evaluate_with_context(&ast_node, ctx)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evaluate_simple() {
        assert_eq!(evaluate("2 + 3").unwrap(), 5.0);
    }

    #[test]
    fn test_evaluate_precedence() {
        assert_eq!(evaluate("2 + 3 * 4").unwrap(), 14.0);
    }

    #[test]
    fn test_evaluate_parens() {
        assert_eq!(evaluate("(2 + 3) * 4").unwrap(), 20.0);
    }

    #[test]
    fn test_evaluate_negative() {
        assert_eq!(evaluate("-5 + 3").unwrap(), -2.0);
    }

    #[test]
    fn test_evaluate_power() {
        assert_eq!(evaluate("2^10").unwrap(), 1024.0);
    }

    #[test]
    fn test_evaluate_sqrt() {
        assert_eq!(evaluate("sqrt(16)").unwrap(), 4.0);
    }

    #[test]
    fn test_evaluate_sin_degrees() {
        let ctx = EvalContext {
            angle_unit: AngleUnit::Degrees,
            ..Default::default()
        };
        let result = evaluate_ctx("sin(30)", &ctx).unwrap();
        assert!((result - 0.5).abs() < 1e-10);
    }

    #[test]
    fn test_evaluate_pi() {
        let result = evaluate("pi").unwrap();
        assert!((result - std::f64::consts::PI).abs() < 1e-10);
    }

    #[test]
    fn test_evaluate_complex() {
        // (10 + 5) / 3
        let result = evaluate("(10 + 5) / 3").unwrap();
        assert_eq!(result, 5.0);
    }

    #[test]
    fn test_evaluate_error() {
        assert!(evaluate("2 +* 3").is_err());
    }
}
