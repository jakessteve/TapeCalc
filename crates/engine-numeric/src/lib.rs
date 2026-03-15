//! # Numeric Evaluation Engine
//!
//! Uses the custom HC TapCalc parser for expression evaluation.
//! Provides both simple evaluation and context-aware evaluation
//! (with angle units and variables).

use hc_tapcalc_core::types::CalcResult;
use hc_tapcalc_parser::{evaluate, evaluate_ctx, EvalContext};

/// Evaluate a numeric expression string and return a `CalcResult`.
///
/// # Examples
///
/// ```
/// use hc_tapcalc_engine_numeric::eval_numeric;
/// use hc_tapcalc_core::types::CalcResult;
/// match eval_numeric("2 + 3") {
///     CalcResult::Numeric(v) => assert_eq!(v, 5.0),
///     _ => panic!("expected numeric"),
/// }
/// ```
pub fn eval_numeric(input: &str) -> CalcResult {
    match evaluate(input) {
        Ok(result) => CalcResult::Numeric(result),
        Err(e) => CalcResult::Error(e),
    }
}

/// Evaluate a numeric expression with context (angle unit, variables).
///
/// # Examples
///
/// ```
/// use hc_tapcalc_engine_numeric::eval_numeric_ctx;
/// use hc_tapcalc_core::types::CalcResult;
/// use hc_tapcalc_parser::EvalContext;
/// let ctx = EvalContext::default();
/// match eval_numeric_ctx("sqrt(16)", &ctx) {
///     CalcResult::Numeric(v) => assert_eq!(v, 4.0),
///     _ => panic!("expected numeric"),
/// }
/// ```
pub fn eval_numeric_ctx(input: &str, ctx: &EvalContext) -> CalcResult {
    match evaluate_ctx(input, ctx) {
        Ok(result) => CalcResult::Numeric(result),
        Err(e) => CalcResult::Error(e),
    }
}

// Re-export for convenience
pub use hc_tapcalc_parser::{AngleUnit, EvalContext as NumericContext};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_arithmetic() {
        match eval_numeric("2 + 3 * 4") {
            CalcResult::Numeric(v) => assert_eq!(v, 14.0),
            other => panic!("Expected Numeric, got {other:?}"),
        }
    }

    #[test]
    fn test_scientific_functions() {
        match eval_numeric("sqrt(16)") {
            CalcResult::Numeric(v) => assert_eq!(v, 4.0),
            other => panic!("Expected Numeric, got {other:?}"),
        }
    }

    #[test]
    fn test_invalid_expression() {
        match eval_numeric("2 +* 3") {
            CalcResult::Error(_) => {} // Expected
            other => panic!("Expected Error, got {other:?}"),
        }
    }

    #[test]
    fn test_trig_degrees() {
        let ctx = EvalContext {
            angle_unit: AngleUnit::Degrees,
            ..Default::default()
        };
        match eval_numeric_ctx("sin(30)", &ctx) {
            CalcResult::Numeric(v) => assert!((v - 0.5).abs() < 1e-10),
            other => panic!("Expected Numeric, got {other:?}"),
        }
    }

    #[test]
    fn test_power() {
        match eval_numeric("2^8") {
            CalcResult::Numeric(v) => assert_eq!(v, 256.0),
            other => panic!("Expected Numeric, got {other:?}"),
        }
    }

    #[test]
    fn test_parentheses() {
        match eval_numeric("(2 + 3) * (4 + 5)") {
            CalcResult::Numeric(v) => assert_eq!(v, 45.0),
            other => panic!("Expected Numeric, got {other:?}"),
        }
    }

    #[test]
    fn test_constants() {
        match eval_numeric("pi") {
            CalcResult::Numeric(v) => assert!((v - std::f64::consts::PI).abs() < 1e-10),
            other => panic!("Expected Numeric, got {other:?}"),
        }
    }
}
