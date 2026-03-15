//! AST evaluator — walks the AST and computes numeric results.
//!
//! Supports configurable angle units (DEG/RAD/GRAD) and a rich set of
//! mathematical functions including trig, hyperbolic, logarithmic, and more.

use crate::ast::{BinaryOp, ConstantKind, Expr, UnaryOp};
use serde::{Deserialize, Serialize};
use std::f64::consts;

/// Angle unit for trigonometric functions.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum AngleUnit {
    #[default]
    Degrees,
    Radians,
    Gradians,
}

/// Evaluation context (angle units, variables, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalContext {
    pub angle_unit: AngleUnit,
    pub variables: std::collections::HashMap<String, f64>,
    pub last_answer: Option<f64>,
}

impl Default for EvalContext {
    fn default() -> Self {
        Self {
            angle_unit: AngleUnit::Degrees,
            variables: std::collections::HashMap::new(),
            last_answer: None,
        }
    }
}

impl EvalContext {
    /// Convert from the configured angle unit to radians.
    fn to_radians(&self, value: f64) -> f64 {
        match self.angle_unit {
            AngleUnit::Radians => value,
            AngleUnit::Degrees => value.to_radians(),
            AngleUnit::Gradians => value * consts::PI / 200.0,
        }
    }

    /// Convert from radians to the configured angle unit.
    fn radians_to_unit(&self, value: f64) -> f64 {
        match self.angle_unit {
            AngleUnit::Radians => value,
            AngleUnit::Degrees => value.to_degrees(),
            AngleUnit::Gradians => value * 200.0 / consts::PI,
        }
    }
}

/// Evaluate an AST node to a numeric result.
pub fn evaluate_ast(expr: &Expr) -> Result<f64, String> {
    evaluate_with_context(expr, &EvalContext::default())
}

/// Evaluate an AST node with a given context (angle unit, variables).
pub fn evaluate_with_context(expr: &Expr, ctx: &EvalContext) -> Result<f64, String> {
    match expr {
        Expr::Number(n) => Ok(*n),
        Expr::Constant(kind) => match kind {
            ConstantKind::Pi => Ok(consts::PI),
            ConstantKind::E => Ok(consts::E),
        },
        Expr::BinaryOp { op, lhs, rhs } => {
            let l = evaluate_with_context(lhs, ctx)?;
            let r = evaluate_with_context(rhs, ctx)?;
            match op {
                BinaryOp::Add => Ok(l + r),
                BinaryOp::Subtract => Ok(l - r),
                BinaryOp::Multiply => Ok(l * r),
                BinaryOp::Divide => {
                    if r == 0.0 {
                        Err("Division by zero".to_string())
                    } else {
                        Ok(l / r)
                    }
                }
                BinaryOp::Power => Ok(l.powf(r)),
                BinaryOp::Modulo => {
                    if r == 0.0 {
                        Err("Modulo by zero".to_string())
                    } else {
                        Ok(l % r)
                    }
                }
            }
        }
        Expr::UnaryOp { op, operand } => {
            let val = evaluate_with_context(operand, ctx)?;
            match op {
                UnaryOp::Negate => Ok(-val),
                UnaryOp::SquareRoot => {
                    if val < 0.0 {
                        Err("Square root of negative number".to_string())
                    } else {
                        Ok(val.sqrt())
                    }
                }
                UnaryOp::Reciprocal => {
                    if val == 0.0 {
                        Err("Reciprocal of zero".to_string())
                    } else {
                        Ok(1.0 / val)
                    }
                }
                UnaryOp::Factorial => {
                    if val < 0.0 || val.fract() != 0.0 {
                        Err("Factorial requires non-negative integer".to_string())
                    } else {
                        Ok(factorial(val as u64)? as f64)
                    }
                }
            }
        }
        Expr::FunctionCall { name, args } => {
            let n_args = args.len();
            match name.as_str() {
                // ── Single-arg trig (angle-aware) ────────────────────
                "sin" => {
                    ensure_args(name, n_args, 1)?;
                    let a = ctx.to_radians(evaluate_with_context(&args[0], ctx)?);
                    Ok(a.sin())
                }
                "cos" => {
                    ensure_args(name, n_args, 1)?;
                    let a = ctx.to_radians(evaluate_with_context(&args[0], ctx)?);
                    Ok(a.cos())
                }
                "tan" => {
                    ensure_args(name, n_args, 1)?;
                    let a = ctx.to_radians(evaluate_with_context(&args[0], ctx)?);
                    Ok(a.tan())
                }
                // ── Inverse trig (returns in configured unit) ────────
                "asin" => {
                    ensure_args(name, n_args, 1)?;
                    let v = evaluate_with_context(&args[0], ctx)?;
                    Ok(ctx.radians_to_unit(v.asin()))
                }
                "acos" => {
                    ensure_args(name, n_args, 1)?;
                    let v = evaluate_with_context(&args[0], ctx)?;
                    Ok(ctx.radians_to_unit(v.acos()))
                }
                "atan" => {
                    ensure_args(name, n_args, 1)?;
                    let v = evaluate_with_context(&args[0], ctx)?;
                    Ok(ctx.radians_to_unit(v.atan()))
                }
                // ── Hyperbolic ───────────────────────────────────────
                "sinh" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.sinh())
                }
                "cosh" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.cosh())
                }
                "tanh" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.tanh())
                }
                // ── Logarithmic ──────────────────────────────────────
                "ln" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.ln())
                }
                "log" | "log10" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.log10())
                }
                "log2" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.log2())
                }
                "exp" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.exp())
                }
                // ── Other functions ──────────────────────────────────
                "sqrt" => {
                    ensure_args(name, n_args, 1)?;
                    let v = evaluate_with_context(&args[0], ctx)?;
                    if v < 0.0 {
                        Err("Square root of negative number".to_string())
                    } else {
                        Ok(v.sqrt())
                    }
                }
                "abs" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.abs())
                }
                "ceil" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.ceil())
                }
                "floor" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.floor())
                }
                "round" => {
                    ensure_args(name, n_args, 1)?;
                    Ok(evaluate_with_context(&args[0], ctx)?.round())
                }
                // ── Multi-arg ────────────────────────────────────────
                "max" => {
                    if args.is_empty() {
                        return Err("max() requires at least 1 argument".to_string());
                    }
                    let mut result = f64::NEG_INFINITY;
                    for arg in args {
                        let v = evaluate_with_context(arg, ctx)?;
                        if v > result {
                            result = v;
                        }
                    }
                    Ok(result)
                }
                "min" => {
                    if args.is_empty() {
                        return Err("min() requires at least 1 argument".to_string());
                    }
                    let mut result = f64::INFINITY;
                    for arg in args {
                        let v = evaluate_with_context(arg, ctx)?;
                        if v < result {
                            result = v;
                        }
                    }
                    Ok(result)
                }
                _ => Err(format!("Unknown function: '{name}'")),
            }
        }
        Expr::Variable(name) => {
            // Special variable: "ans" → last answer
            if name == "ans" || name == "ANS" {
                return ctx
                    .last_answer
                    .ok_or_else(|| "No previous answer".to_string());
            }
            ctx.variables
                .get(name)
                .copied()
                .ok_or_else(|| format!("Variable '{name}' not defined"))
        }
    }
}

/// Validate argument count for a function call.
fn ensure_args(name: &str, got: usize, expected: usize) -> Result<(), String> {
    if got != expected {
        Err(format!(
            "Function '{name}' expects {expected} argument(s), got {got}"
        ))
    } else {
        Ok(())
    }
}

/// Compute factorial for non-negative integers.
fn factorial(n: u64) -> Result<u64, String> {
    // Guard against overflow — cap at 20!
    if n > 20 {
        return Err("Factorial overflow: n! is only supported for n ≤ 20".to_string());
    }
    Ok((1..=n).product())
}

// ── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::Expr;

    #[test]
    fn test_eval_number() {
        assert_eq!(evaluate_ast(&Expr::Number(42.0)).unwrap(), 42.0);
    }

    #[test]
    fn test_eval_add() {
        let expr = Expr::BinaryOp {
            op: BinaryOp::Add,
            lhs: Box::new(Expr::Number(2.0)),
            rhs: Box::new(Expr::Number(3.0)),
        };
        assert_eq!(evaluate_ast(&expr).unwrap(), 5.0);
    }

    #[test]
    fn test_eval_div_by_zero() {
        let expr = Expr::BinaryOp {
            op: BinaryOp::Divide,
            lhs: Box::new(Expr::Number(1.0)),
            rhs: Box::new(Expr::Number(0.0)),
        };
        assert!(evaluate_ast(&expr).is_err());
    }

    #[test]
    fn test_angle_unit_degrees() {
        let ctx = EvalContext {
            angle_unit: AngleUnit::Degrees,
            ..Default::default()
        };
        let expr = Expr::FunctionCall {
            name: "sin".to_string(),
            args: vec![Expr::Number(30.0)],
        };
        let result = evaluate_with_context(&expr, &ctx).unwrap();
        assert!((result - 0.5).abs() < 1e-10);
    }

    #[test]
    fn test_angle_unit_radians() {
        let ctx = EvalContext {
            angle_unit: AngleUnit::Radians,
            ..Default::default()
        };
        let expr = Expr::FunctionCall {
            name: "sin".to_string(),
            args: vec![Expr::Constant(ConstantKind::Pi)],
        };
        let result = evaluate_with_context(&expr, &ctx).unwrap();
        assert!(result.abs() < 1e-10); // sin(π) ≈ 0
    }

    #[test]
    fn test_variable_lookup() {
        let mut ctx = EvalContext::default();
        ctx.variables.insert("x".to_string(), 42.0);
        let expr = Expr::Variable("x".to_string());
        assert_eq!(evaluate_with_context(&expr, &ctx).unwrap(), 42.0);
    }

    #[test]
    fn test_ans_variable() {
        let mut ctx = EvalContext::default();
        ctx.last_answer = Some(99.0);
        let expr = Expr::Variable("ans".to_string());
        assert_eq!(evaluate_with_context(&expr, &ctx).unwrap(), 99.0);
    }

    #[test]
    fn test_end_to_end_parse_eval() {
        use crate::ast::parse;
        use crate::lexer::tokenize;

        let tokens = tokenize("2 + 3 * 4").unwrap();
        let ast = parse(tokens).unwrap();
        let result = evaluate_ast(&ast).unwrap();
        assert_eq!(result, 14.0);
    }

    #[test]
    fn test_end_to_end_sin_degrees() {
        use crate::ast::parse;
        use crate::lexer::tokenize;

        let tokens = tokenize("sin(90)").unwrap();
        let ast = parse(tokens).unwrap();
        let ctx = EvalContext {
            angle_unit: AngleUnit::Degrees,
            ..Default::default()
        };
        let result = evaluate_with_context(&ast, &ctx).unwrap();
        assert!((result - 1.0).abs() < 1e-10);
    }
}
