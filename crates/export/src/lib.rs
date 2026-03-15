//! # Export Engine
//!
//! Exports tape data to JSON, plain text, and CSV formats.
//! Future: PDF export via printpdf.

use hc_tapcalc_core::tape::Tape;
use hc_tapcalc_core::types::CalcResult;

/// Export tape to pretty-printed JSON.
///
/// # Examples
///
/// ```
/// use hc_tapcalc_export::export_json;
/// use hc_tapcalc_core::tape::Tape;
/// let tape = Tape::new("Test");
/// let json = export_json(&tape).unwrap();
/// assert!(json.contains("Test"));
/// ```
pub fn export_json(tape: &Tape) -> Result<String, String> {
    serde_json::to_string_pretty(tape).map_err(|e| e.to_string())
}

/// Import tape from JSON string.
///
/// # Examples
///
/// ```
/// use hc_tapcalc_export::{export_json, import_json};
/// use hc_tapcalc_core::tape::Tape;
/// let tape = Tape::new("Roundtrip");
/// let json = export_json(&tape).unwrap();
/// let loaded = import_json(&json).unwrap();
/// assert_eq!(loaded.name, "Roundtrip");
/// ```
pub fn import_json(json: &str) -> Result<Tape, String> {
    serde_json::from_str(json).map_err(|e| e.to_string())
}

/// Export tape to plain text (human-readable).
///
/// # Examples
///
/// ```
/// use hc_tapcalc_export::export_text;
/// use hc_tapcalc_core::tape::Tape;
/// let tape = Tape::new("Demo");
/// let text = export_text(&tape);
/// assert!(text.contains("Demo"));
/// assert!(text.contains("Total"));
/// ```
pub fn export_text(tape: &Tape) -> String {
    let mut out = String::new();
    out.push_str(&format!("── {} ──\n", tape.name));
    out.push_str(&format!("{} entries\n\n", tape.entries.len()));

    for entry in &tape.entries {
        let result_str = match &entry.result {
            CalcResult::Numeric(v) => format!("{v}"),
            CalcResult::Symbolic(s) => s.clone(),
            CalcResult::Error(e) => format!("ERROR: {e}"),
            CalcResult::Pending => "...".to_string(),
        };
        out.push_str(&format!(
            "  {:>3}. {} = {}\n",
            entry.line_number, entry.input, result_str
        ));
        if let Some(note) = &entry.note {
            out.push_str(&format!("       # {note}\n"));
        }
    }

    let total = tape.grand_total();
    out.push_str(&format!("\n  Σ Total = {total}\n"));
    out
}

/// Export tape to CSV format.
///
/// # Examples
///
/// ```
/// use hc_tapcalc_export::export_csv;
/// use hc_tapcalc_core::tape::Tape;
/// let tape = Tape::new("Test");
/// let csv = export_csv(&tape);
/// assert!(csv.starts_with("Line,Expression,Result,Note\n"));
/// ```
pub fn export_csv(tape: &Tape) -> String {
    let mut out = String::new();
    out.push_str("Line,Expression,Result,Note\n");

    for entry in &tape.entries {
        let result_str = match &entry.result {
            CalcResult::Numeric(v) => format!("{v}"),
            CalcResult::Symbolic(s) => s.clone(),
            CalcResult::Error(e) => format!("ERROR: {e}"),
            CalcResult::Pending => "...".to_string(),
        };

        // Escape CSV fields
        let input_escaped = csv_escape(&entry.input);
        let result_escaped = csv_escape(&result_str);
        let note_escaped = csv_escape(entry.note.as_deref().unwrap_or(""));

        out.push_str(&format!(
            "{},{},{},{}\n",
            entry.line_number, input_escaped, result_escaped, note_escaped
        ));
    }

    out
}

/// Escape a string for CSV (wraps in quotes if needed).
fn csv_escape(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hc_tapcalc_core::tape::Tape;
    use hc_tapcalc_core::types::CalcResult;

    fn make_test_tape() -> Tape {
        let mut tape = Tape::new("Test");
        tape.push_entry("2 + 3".to_string());
        if let Some(entry) = tape.entries.last_mut() {
            entry.result = CalcResult::Numeric(5.0);
        }
        tape.push_entry("10 * 4".to_string());
        if let Some(entry) = tape.entries.last_mut() {
            entry.result = CalcResult::Numeric(40.0);
        }
        tape
    }

    #[test]
    fn test_json_roundtrip() {
        let tape = make_test_tape();
        let json = export_json(&tape).unwrap();
        let restored = import_json(&json).unwrap();
        assert_eq!(restored.entries.len(), 2);
        assert_eq!(restored.name, "Test");
    }

    #[test]
    fn test_text_export() {
        let tape = make_test_tape();
        let text = export_text(&tape);
        assert!(text.contains("2 + 3"));
        assert!(text.contains("10 * 4"));
        assert!(text.contains("Total"));
    }

    #[test]
    fn test_csv_export() {
        let tape = make_test_tape();
        let csv = export_csv(&tape);
        assert!(csv.starts_with("Line,Expression,Result,Note\n"));
        assert!(csv.contains("2 + 3"));
        assert!(csv.contains("10 * 4"));
    }

    #[test]
    fn test_csv_escape_with_comma() {
        let result = csv_escape("hello, world");
        assert_eq!(result, "\"hello, world\"");
    }

    #[test]
    fn test_csv_escape_plain() {
        let result = csv_escape("hello");
        assert_eq!(result, "hello");
    }
}
