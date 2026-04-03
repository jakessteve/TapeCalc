//! Helper functions — formatting, persistence, display building, sanitization.

use hc_tapcalc_core::tape::Tape;
use hc_tapcalc_core::types::CalcResult;
use hc_tapcalc_engine_numeric::eval_numeric_ctx;
use hc_tapcalc_parser::AngleUnit;

use super::state::AppState;
use super::types::{CalcDisplay, TapeEntryDto, TapeState};

use std::sync::atomic::{AtomicBool, Ordering};

// ─── Formatting ──────────────────────────────────────────────────────────────

pub fn format_result(result: &CalcResult) -> String {
    match result {
        CalcResult::Numeric(v) => {
            if v.is_nan() || v.is_infinite() {
                return if v.is_nan() {
                    "Error".to_string()
                } else if v.is_sign_positive() {
                    "∞".to_string()
                } else {
                    "−∞".to_string()
                };
            }
            if v.fract() == 0.0 && v.abs() < 1e15 {
                format_with_separators(*v as i64)
            } else {
                let formatted = format!("{:.6}", v);
                let trimmed = formatted.trim_end_matches('0');
                let trimmed = trimmed.trim_end_matches('.');
                if let Some((int_part, dec_part)) = trimmed.split_once('.') {
                    let is_negative = int_part.starts_with('-');
                    let abs_int: i64 = int_part.parse().unwrap_or(0);
                    let int_formatted =
                        format_with_separators(if is_negative { -abs_int.abs() } else { abs_int });
                    format!("{}.{}", int_formatted, dec_part)
                } else {
                    let int_val: i64 = trimmed.parse().unwrap_or(0);
                    format_with_separators(int_val)
                }
            }
        }
        CalcResult::Symbolic(s) => s.clone(),
        CalcResult::Error(e) => format!("Error: {e}"),
        CalcResult::Pending => "...".to_string(),
    }
}

pub fn format_with_separators(n: i64) -> String {
    let is_negative = n < 0;
    let s = n.unsigned_abs().to_string();
    let mut result = String::new();
    for (i, ch) in s.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            result.push(',');
        }
        result.push(ch);
    }
    let formatted: String = result.chars().rev().collect();
    if is_negative {
        format!("-{formatted}")
    } else {
        formatted
    }
}

// ─── Tape DTO Conversion ─────────────────────────────────────────────────────

pub fn tape_to_dto(tape: &Tape) -> TapeState {
    TapeState {
        entries: tape
            .entries
            .iter()
            .map(|e| TapeEntryDto {
                line_number: e.line_number,
                input: e.input.clone(),
                result: format_result(&e.result),
                is_error: matches!(e.result, CalcResult::Error(_)),
                is_subtotal: e.is_subtotal,
                note: e.note.clone().unwrap_or_default(),
                operand_notes: e.operand_notes.clone(),
            })
            .collect(),
        grand_total: format_result(&CalcResult::Numeric(tape.grand_total())),
    }
}

// ─── Display Builder ─────────────────────────────────────────────────────────

/// P1-1: Uses cached tape DTO when tape hasn't changed.
pub fn build_display(state: &mut AppState) -> CalcDisplay {
    let preview = if !state.calc.expression.is_empty() && !state.calc.just_evaluated {
        let mut expr = state.calc.to_eval_string();
        for _ in 0..state.calc.open_parens {
            expr.push(')');
        }
        match eval_numeric_ctx(&expr, &state.calc.eval_context) {
            CalcResult::Numeric(v) => format_result(&CalcResult::Numeric(v)),
            _ => state.calc.last_result.clone(),
        }
    } else {
        state.calc.last_result.clone()
    };

    let tape_dto = state.get_tape_dto();

    CalcDisplay {
        input: if state.calc.just_evaluated {
            String::new()
        } else {
            state.calc.expression.clone()
        },
        result: preview,
        has_error: false,
        angle_unit: match state.calc.angle_unit {
            AngleUnit::Degrees => "DEG".to_string(),
            AngleUnit::Radians => "RAD".to_string(),
            AngleUnit::Gradians => "GRAD".to_string(),
        },
        memory: state
            .calc
            .memory
            .map(|v| format_result(&CalcResult::Numeric(v)))
            .unwrap_or_default(),
        can_undo: state.undo_stack.can_undo(),
        can_redo: state.undo_stack.can_redo(),
        theme: state.calc.theme,
        tape: tape_dto,
        tape_count: state.tapes.len(),
        active_tape_index: state.active_tape,
        tape_names: state.tapes.iter().map(|t| t.name.clone()).collect(),
        pending_result_note: state.calc.pending_result_note.clone(),
        pending_operand_notes: state.calc.pending_operand_notes.clone(),
    }
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

/// Strip control characters and enforce a maximum length on user-provided strings.
pub fn sanitize_string(input: &str, max_len: usize) -> String {
    input
        .chars()
        .filter(|c| !c.is_control() || *c == '\n')
        .take(max_len)
        .collect::<String>()
        .trim()
        .to_string()
}

pub fn prepare_eval_string(s: &str) -> String {
    s.replace('×', "*").replace('÷', "/").replace('−', "-")
}

/// P1-2: Recalculate the entire tape from index 0 to the end.
/// Subtotals sum all previous entries since the last subtotal or start.
/// Starts with an operator? Prepend the previous result.
pub fn recalculate_tape(tape: &mut Tape, calc: &super::state::CalcState) {
    use super::state::resolve_refs;
    let mut prev_result = 0.0;

    // We need to collect results to resolve line references correctly
    for i in 0..tape.entries.len() {
        if tape.entries[i].is_subtotal {
            tape.entries[i].result = CalcResult::Numeric(prev_result);
            continue;
        }

        let input = tape.entries[i].input.trim();
        let mut eval_str = prepare_eval_string(input);

        if eval_str.starts_with(|c| "+-*/".contains(c)) {
            eval_str = format!("({}){}", prev_result, eval_str);
        } else {
            eval_str = format!("({})+{}", prev_result, eval_str);
        }

        let resolved = resolve_refs(&eval_str, tape);
        let result = eval_numeric_ctx(&resolved, &calc.eval_context);

        if let CalcResult::Numeric(v) = &result {
            prev_result = *v;
        }

        tape.entries[i].result = result;
    }
}

// ─── Persistence ─────────────────────────────────────────────────────────────

fn get_save_path() -> std::path::PathBuf {
    let base = dirs::data_local_dir().unwrap_or_else(|| {
        std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."))
    });
    let app_dir = base.join("hc-tapcalc");
    let _ = std::fs::create_dir_all(&app_dir);
    app_dir.join("hc-tapcalc-session.json")
}

/// Global guard to prevent concurrent save operations.
static SAVE_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

/// Session save format — persists ALL tapes and the active tape index.
#[derive(serde::Serialize, serde::Deserialize)]
struct SessionData {
    tapes: Vec<Tape>,
    active_tape: usize,
}

/// P1-2: Save ALL tapes to file in a background thread to avoid blocking IPC.
pub fn save_all_tapes(tapes: &[Tape], active_tape: usize) {
    let path = get_save_path();
    let session = SessionData {
        tapes: tapes.to_vec(),
        active_tape,
    };
    match serde_json::to_string_pretty(&session) {
        Ok(json) => {
            if SAVE_IN_PROGRESS
                .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
                .is_ok()
            {
                std::thread::spawn(move || {
                    if let Err(e) = std::fs::write(&path, &json) {
                        tracing::warn!("Failed to save session: {e}");
                    }
                    SAVE_IN_PROGRESS.store(false, Ordering::SeqCst);
                });
            }
        }
        Err(e) => tracing::warn!("Failed to serialize session: {e}"),
    }
}

/// Load ALL tapes from file. Falls back to a single default tape.
/// Backward-compatible: also reads the old single-tape format.
pub fn load_all_tapes() -> (Vec<Tape>, usize) {
    let path = get_save_path();
    if !path.exists() {
        return (vec![Tape::new("Tape 1")], 0);
    }
    match std::fs::read_to_string(&path) {
        Ok(json) => {
            if let Ok(session) = serde_json::from_str::<SessionData>(&json) {
                if session.tapes.is_empty() {
                    return (vec![Tape::new("Tape 1")], 0);
                }
                let active = session.active_tape.min(session.tapes.len() - 1);
                return (session.tapes, active);
            }
            if let Ok(tape) = hc_tapcalc_export::import_json(&json) {
                return (vec![tape], 0);
            }
            (vec![Tape::new("Tape 1")], 0)
        }
        Err(_) => (vec![Tape::new("Tape 1")], 0),
    }
}
