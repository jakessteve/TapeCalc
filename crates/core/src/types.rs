//! Shared types and newtypes for HC TapCalc.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Unique identifier for a tape entry.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct EntryId(u64);

impl EntryId {
    /// Generate a new unique entry ID.
    pub fn new() -> Self {
        use std::sync::atomic::{AtomicU64, Ordering};
        static COUNTER: AtomicU64 = AtomicU64::new(1);
        Self(COUNTER.fetch_add(1, Ordering::Relaxed))
    }
}

impl Default for EntryId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for EntryId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "#{}", self.0)
    }
}

/// The result of evaluating an expression.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CalcResult {
    /// Numeric result.
    Numeric(f64),
    /// Symbolic/text result (e.g., "x^2 + 1").
    Symbolic(String),
    /// Error during evaluation.
    Error(String),
    /// Not yet evaluated.
    Pending,
}

impl fmt::Display for CalcResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CalcResult::Numeric(val) => {
                if val.fract() == 0.0 && val.abs() < 1e15 {
                    write!(f, "{}", *val as i64)
                } else {
                    write!(f, "{val}")
                }
            }
            CalcResult::Symbolic(s) => write!(f, "{s}"),
            CalcResult::Error(e) => write!(f, "Error: {e}"),
            CalcResult::Pending => write!(f, "..."),
        }
    }
}

/// Angle unit for trigonometric functions.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum AngleUnit {
    #[default]
    Degrees,
    Radians,
    Gradians,
}
