//! Tape data model — the heart of HC TapCalc.
//!
//! A tape is an ordered list of entries that supports live editing,
//! auto-recalculation, variables, subtotals, and grand totals.

use crate::types::{CalcResult, EntryId};
use serde::{Deserialize, Serialize};

/// A single entry on the calculator tape.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TapeEntry {
    /// Unique identifier for this entry.
    pub id: EntryId,
    /// The raw input expression (e.g., "2 + 3", "sin(45)").
    pub input: String,
    /// The computed result (or error).
    pub result: CalcResult,
    /// Optional text note/label for this entry.
    pub note: Option<String>,
    /// Whether this entry is a subtotal marker.
    pub is_subtotal: bool,
    /// Line number (1-indexed, auto-assigned).
    pub line_number: u32,
}

/// The full tape state, containing all entries and metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tape {
    /// Ordered list of tape entries.
    pub entries: Vec<TapeEntry>,
    /// Name/title of this tape session.
    pub name: String,
    /// Whether the tape has unsaved changes.
    #[serde(skip)]
    pub is_dirty: bool,
}

impl Tape {
    /// Create a new empty tape with the given name.
    ///
    /// # Examples
    ///
    /// ```
    /// use hc_tapcalc_core::tape::Tape;
    /// let tape = Tape::new("My Tape");
    /// assert_eq!(tape.name, "My Tape");
    /// assert!(tape.entries.is_empty());
    /// ```
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            entries: Vec::new(),
            name: name.into(),
            is_dirty: false,
        }
    }

    /// Add a new entry to the tape and trigger recalculation.
    pub fn push_entry(&mut self, input: String) -> &TapeEntry {
        let line_number = self.entries.len() as u32 + 1;
        let entry = TapeEntry {
            id: EntryId::new(),
            input,
            result: CalcResult::Pending,
            note: None,
            is_subtotal: false,
            line_number,
        };
        self.entries.push(entry);
        self.is_dirty = true;
        self.entries.last().unwrap()
    }

    /// Recalculate all entries from scratch.
    /// This is called after any edit to maintain consistency.
    pub fn recalculate(&mut self) {
        // TODO: Integrate with expression evaluator
        // For now, mark all as pending
        for entry in &mut self.entries {
            entry.result = CalcResult::Pending;
        }
    }

    /// Compute the grand total of all numeric results.
    pub fn grand_total(&self) -> f64 {
        self.entries
            .iter()
            .filter_map(|e| match &e.result {
                CalcResult::Numeric(val) => Some(*val),
                _ => None,
            })
            .sum()
    }

    /// Get the number of entries.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Check if the tape is empty.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_tape_is_empty() {
        let tape = Tape::new("Test");
        assert!(tape.is_empty());
        assert_eq!(tape.len(), 0);
        assert_eq!(tape.name, "Test");
    }

    #[test]
    fn test_push_entry() {
        let mut tape = Tape::new("Test");
        tape.push_entry("2 + 3".to_string());
        assert_eq!(tape.len(), 1);
        assert!(tape.is_dirty);
        assert_eq!(tape.entries[0].line_number, 1);
    }
}
