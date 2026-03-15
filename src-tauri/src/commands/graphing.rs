//! Graphing commands — function evaluation and intercept detection.

use hc_tapcalc_graphing as graphing;

use super::types::GraphPoint;

/// Evaluate a function expression over an x-range and return plot points.
#[tauri::command]
pub fn evaluate_graph_function(
    expression: String,
    x_min: f64,
    x_max: f64,
    num_points: usize,
) -> Result<Vec<GraphPoint>, String> {
    graphing::evaluate_function(&expression, x_min, x_max, num_points)
        .map(|pts| pts.into_iter().map(|p| GraphPoint { x: p.x, y: p.y }).collect())
}

/// Find the y-intercept (value at x=0) of an expression.
#[tauri::command]
pub fn graph_y_intercept(expression: String) -> Result<f64, String> {
    graphing::y_intercept(&expression)
}

/// Find approximate x-intercepts by sign-change detection.
#[tauri::command]
pub fn graph_x_intercepts(
    expression: String,
    x_min: f64,
    x_max: f64,
    resolution: usize,
) -> Result<Vec<f64>, String> {
    graphing::x_intercepts(&expression, x_min, x_max, resolution)
}
