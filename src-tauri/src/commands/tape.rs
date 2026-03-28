//! Tape management commands — undo, redo, clear, delete, export, clipboard, etc.

use hc_tapcalc_core::tape::Tape;
use hc_tapcalc_core::undo::UndoStack;
use std::sync::Mutex;
use tauri::{State, Window};

use super::helpers::{build_display, sanitize_string, save_all_tapes};
use super::state::AppState;
use super::types::CalcDisplay;

/// Undo the last tape action.
#[tauri::command]
pub fn undo(state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    {
        let active = state.active_tape;
        let AppState {
            tapes,
            undo_stack,
            calc,
            ..
        } = &mut *state;
        let tape = &mut tapes[active];
        undo_stack.undo(tape);
        super::helpers::recalculate_tape(tape, calc);
    }
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Redo the last undone tape action.
#[tauri::command]
pub fn redo(state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    {
        let active = state.active_tape;
        let AppState {
            tapes,
            undo_stack,
            calc,
            ..
        } = &mut *state;
        let tape = &mut tapes[active];
        undo_stack.redo(tape);
        super::helpers::recalculate_tape(tape, calc);
    }
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Clear the entire tape.
#[tauri::command]
pub fn clear_tape(state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let active = state.active_tape;
    let name = state.tapes[active].name.clone();
    state.tapes[active] = Tape::new(name);
    state.undo_stack = UndoStack::new();
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Delete a single tape entry by line number.
#[tauri::command]
pub fn delete_entry(
    line_number: u32,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    {
        let active = state.active_tape;
        let AppState { tapes, calc, .. } = &mut *state;
        let tape = &mut tapes[active];
        tape.entries.retain(|e| e.line_number != line_number);
        for (i, entry) in tape.entries.iter_mut().enumerate() {
            entry.line_number = i as u32 + 1;
        }
        super::helpers::recalculate_tape(tape, calc);
        tape.is_dirty = true;
    }
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Cycle theme: 0 → 1 → 2 → 0.
#[tauri::command]
pub fn cycle_theme(state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    state.calc.theme = (state.calc.theme + 1) % 3;
    Ok(build_display(&mut state))
}

/// Export tape to text format.
#[tauri::command]
pub fn export_tape(format: String, state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    let state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    match format.as_str() {
        "json" => hc_tapcalc_export::export_json(state.tape()),
        "text" => Ok(hc_tapcalc_export::export_text(state.tape())),
        "csv" => Ok(hc_tapcalc_export::export_csv(state.tape())),
        _ => Err("Unsupported format".to_string()),
    }
}

/// Copy result to clipboard.
#[tauri::command]
pub fn copy_to_clipboard(text: String) -> Result<(), String> {
    use arboard::Clipboard;
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())?;
    Ok(())
}

/// Click on a tape entry to load it back into the expression.
#[tauri::command]
pub fn tape_entry_click(
    line_number: u32,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let input = state
        .tape()
        .entries
        .iter()
        .find(|e| e.line_number == line_number)
        .map(|e| e.input.clone());
    if let Some(input) = input {
        state.calc.expression = input;
        state.calc.just_evaluated = false;
    }
    Ok(build_display(&mut state))
}

/// Create a new tape tab.
#[tauri::command]
pub fn new_tape(state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let idx = state.tapes.len() + 1;
    state.tapes.push(Tape::new(format!("Tape {}", idx)));
    state.active_tape = state.tapes.len() - 1;
    state.undo_stack = UndoStack::new();
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Switch to a different tape by index.
#[tauri::command]
pub fn switch_tape(index: usize, state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    if index < state.tapes.len() {
        state.active_tape = index;
        state.mark_tape_dirty();
    }
    Ok(build_display(&mut state))
}

/// Set a note on a specific tape entry.
#[tauri::command]
pub fn set_note(
    line_number: u32,
    note: String,
    operand_index: Option<usize>,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let sanitized = sanitize_string(&note, 500);
    {
        let active = state.active_tape;
        let tape = &mut state.tapes[active];
        if let Some(entry) = tape
            .entries
            .iter_mut()
            .find(|e| e.line_number == line_number)
        {
            if let Some(idx) = operand_index {
                if sanitized.is_empty() {
                    entry.operand_notes.remove(&idx);
                } else {
                    entry.operand_notes.insert(idx, sanitized);
                }
            } else {
                entry.note = if sanitized.is_empty() {
                    None
                } else {
                    Some(sanitized)
                };
            }
        }
    }
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Set a note on the pending virtual tape entry
#[tauri::command]
pub fn set_pending_note(
    note: String,
    operand_index: Option<usize>,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let sanitized = sanitize_string(&note, 500);

    if let Some(idx) = operand_index {
        if sanitized.is_empty() {
            state.calc.pending_operand_notes.remove(&idx);
        } else {
            state.calc.pending_operand_notes.insert(idx, sanitized);
        }
    } else {
        state.calc.pending_result_note = if sanitized.is_empty() {
            None
        } else {
            Some(sanitized)
        };
    }

    // Virtual entry doesn't strictly need tape_dirty, but re-rendering display will pass the updated notes
    Ok(build_display(&mut state))
}

/// Rename a tape by index.
#[tauri::command]
pub fn rename_tape(
    index: usize,
    name: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let sanitized = sanitize_string(&name, 50);
    if sanitized.is_empty() {
        return Err("Tape name cannot be empty".to_string());
    }
    if index < state.tapes.len() {
        state.tapes[index].name = sanitized;
        state.mark_tape_dirty();
    }
    Ok(build_display(&mut state))
}

/// Delete a tape by index (cannot delete the last tape).
#[tauri::command]
pub fn delete_tape(index: usize, state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    if state.tapes.len() <= 1 {
        return Err("Cannot delete the last tape".to_string());
    }
    if index >= state.tapes.len() {
        return Err(format!("Invalid tape index: {index}"));
    }
    state.tapes.remove(index);
    if state.active_tape >= state.tapes.len() {
        state.active_tape = state.tapes.len() - 1;
    }
    state.undo_stack = UndoStack::new();
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Edit an existing tape entry and recalculate subsequent entries.
#[tauri::command]
pub fn edit_entry(
    line_number: u32,
    new_input: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    {
        let active = state.active_tape;
        let AppState { tapes, calc, .. } = &mut *state;
        let tape = &mut tapes[active];
        if let Some(entry) = tape
            .entries
            .iter_mut()
            .find(|e| e.line_number == line_number)
        {
            entry.input = new_input;
            tape.is_dirty = true;
        }
        super::helpers::recalculate_tape(tape, calc);
    }
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Toggle subtotal mode for a tape entry.
#[tauri::command]
pub fn toggle_subtotal(
    line_number: u32,
    state: State<'_, Mutex<AppState>>,
) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    {
        let active = state.active_tape;
        let AppState { tapes, calc, .. } = &mut *state;
        let tape = &mut tapes[active];
        if let Some(entry) = tape
            .entries
            .iter_mut()
            .find(|e| e.line_number == line_number)
        {
            entry.is_subtotal = !entry.is_subtotal;
            tape.is_dirty = true;
        }
        super::helpers::recalculate_tape(tape, calc);
    }
    save_all_tapes(&state.tapes, state.active_tape);
    state.mark_tape_dirty();
    Ok(build_display(&mut state))
}

/// Toggle always-on-top window property.
#[tauri::command]
pub fn toggle_always_on_top(enable: bool, window: Window) -> Result<(), String> {
    window.set_always_on_top(enable).map_err(|e| e.to_string())
}
