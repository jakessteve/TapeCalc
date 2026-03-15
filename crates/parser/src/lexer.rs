//! Lexer — tokenizes raw input strings into a token stream.

/// A token produced by the lexer.
#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Number(f64),
    Plus,
    Minus,
    Star,
    Slash,
    Caret,
    Percent,
    LeftParen,
    RightParen,
    Comma,
    Identifier(String),
    Eof,
}

/// Tokenize an input string into a sequence of tokens.
pub fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();

    while let Some(&ch) = chars.peek() {
        match ch {
            ' ' | '\t' | '\r' | '\n' => {
                chars.next();
            }
            '0'..='9' | '.' => {
                let mut num_str = String::new();
                while let Some(&c) = chars.peek() {
                    if c.is_ascii_digit() || c == '.' {
                        num_str.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                let num: f64 = num_str
                    .parse()
                    .map_err(|_| format!("Invalid number: {num_str}"))?;
                tokens.push(Token::Number(num));
            }
            '+' => { tokens.push(Token::Plus); chars.next(); }
            '-' => { tokens.push(Token::Minus); chars.next(); }
            '*' => { tokens.push(Token::Star); chars.next(); }
            '/' => { tokens.push(Token::Slash); chars.next(); }
            '^' => { tokens.push(Token::Caret); chars.next(); }
            '%' => { tokens.push(Token::Percent); chars.next(); }
            '(' => { tokens.push(Token::LeftParen); chars.next(); }
            ')' => { tokens.push(Token::RightParen); chars.next(); }
            ',' => { tokens.push(Token::Comma); chars.next(); }
            'a'..='z' | 'A'..='Z' | '_' => {
                let mut ident = String::new();
                while let Some(&c) = chars.peek() {
                    if c.is_alphanumeric() || c == '_' {
                        ident.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                tokens.push(Token::Identifier(ident));
            }
            _ => return Err(format!("Unexpected character: '{ch}'")),
        }
    }

    tokens.push(Token::Eof);
    Ok(tokens)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tokenize_simple() {
        let tokens = tokenize("2 + 3").unwrap();
        assert_eq!(
            tokens,
            vec![Token::Number(2.0), Token::Plus, Token::Number(3.0), Token::Eof]
        );
    }

    #[test]
    fn test_tokenize_function() {
        let tokens = tokenize("sin(45)").unwrap();
        assert_eq!(
            tokens,
            vec![
                Token::Identifier("sin".to_string()),
                Token::LeftParen,
                Token::Number(45.0),
                Token::RightParen,
                Token::Eof,
            ]
        );
    }
}
