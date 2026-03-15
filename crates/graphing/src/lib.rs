//! # Graphing Engine (v0.1 Scaffold)
//!
//! Provides function evaluation for plotting.
//! The actual rendering will be done in the Slint UI using point data.

use hc_tapcalc_parser::{EvalContext, evaluate_ctx};

/// A point on a 2D graph.
#[derive(Debug, Clone, Copy)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

/// Evaluate a function string over a range of x values.
///
/// Returns a series of (x, y) points suitable for plotting.
///
/// # Examples
///
/// ```
/// use hc_tapcalc_graphing::evaluate_function;
/// let points = evaluate_function("x^2", -1.0, 1.0, 3).unwrap();
/// assert_eq!(points.len(), 3);
/// assert!((points[0].y - 1.0).abs() < 1e-10); // (-1)^2 = 1
/// assert!((points[1].y - 0.0).abs() < 1e-10); // (0)^2 = 0
/// assert!((points[2].y - 1.0).abs() < 1e-10); // (1)^2 = 1
/// ```
pub fn evaluate_function(
    expression: &str,
    x_min: f64,
    x_max: f64,
    num_points: usize,
) -> Result<Vec<Point>, String> {
    if num_points < 2 {
        return Err("Need at least 2 points".to_string());
    }
    if x_min >= x_max {
        return Err("x_min must be less than x_max".to_string());
    }

    let step = (x_max - x_min) / (num_points - 1) as f64;
    let mut points = Vec::with_capacity(num_points);

    for i in 0..num_points {
        let x = x_min + step * i as f64;
        let mut ctx = EvalContext::default();
        ctx.variables.insert("x".to_string(), x);

        match evaluate_ctx(expression, &ctx) {
            Ok(y) => {
                if y.is_finite() {
                    points.push(Point { x, y });
                }
                // Skip non-finite values (asymptotes, etc.)
            }
            Err(_) => {
                // Skip evaluation errors at specific points
            }
        }
    }

    Ok(points)
}

/// Find approximate y-intercept (x=0).
pub fn y_intercept(expression: &str) -> Result<f64, String> {
    let mut ctx = EvalContext::default();
    ctx.variables.insert("x".to_string(), 0.0);
    evaluate_ctx(expression, &ctx)
}

/// Find approximate x-intercepts by sign change detection.
pub fn x_intercepts(
    expression: &str,
    x_min: f64,
    x_max: f64,
    resolution: usize,
) -> Result<Vec<f64>, String> {
    let points = evaluate_function(expression, x_min, x_max, resolution)?;
    let mut zeros = Vec::new();

    for w in points.windows(2) {
        let p0 = w[0];
        let p1 = w[1];
        if p0.y.signum() != p1.y.signum() {
            // Linear interpolation for approximate zero
            let t = p0.y.abs() / (p0.y.abs() + p1.y.abs());
            let x_zero = p0.x + t * (p1.x - p0.x);
            zeros.push(x_zero);
        }
    }

    Ok(zeros)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_linear_function() {
        let points = evaluate_function("2 * x + 1", -5.0, 5.0, 11).unwrap();
        assert_eq!(points.len(), 11);
        // At x=0, y should be 1
        let mid = &points[5]; // x=0
        assert!((mid.x).abs() < 0.01);
        assert!((mid.y - 1.0).abs() < 0.01);
    }

    #[test]
    fn test_quadratic() {
        let points = evaluate_function("x^2", -3.0, 3.0, 7).unwrap();
        assert_eq!(points.len(), 7);
        // At x=0, y=0
        let mid = &points[3]; // x=0
        assert!(mid.y.abs() < 0.01);
    }

    #[test]
    fn test_y_intercept() {
        let y = y_intercept("3 * x + 7").unwrap();
        assert!((y - 7.0).abs() < 0.01);
    }

    #[test]
    fn test_x_intercepts() {
        // y = x - 2 has zero at x=2
        let zeros = x_intercepts("x - 2", -5.0, 5.0, 1000).unwrap();
        assert_eq!(zeros.len(), 1);
        assert!((zeros[0] - 2.0).abs() < 0.02);
    }

    #[test]
    fn test_invalid_range() {
        let result = evaluate_function("x", 5.0, -5.0, 10);
        assert!(result.is_err());
    }
}
