//! Calculator input handling — button_press and get_state commands.

use hc_tapcalc_core::types::CalcResult;
use hc_tapcalc_core::undo::TapeCommand;
use hc_tapcalc_engine_numeric::{eval_numeric, eval_numeric_ctx};
use hc_tapcalc_parser::AngleUnit;
use std::sync::Mutex;
use tauri::State;

use super::helpers::{build_display, format_result, save_all_tapes};
use super::state::AppState;
use super::types::CalcDisplay;

/// Get the full current state (display + tape).
#[tauri::command]
pub fn get_state(state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    Ok(build_display(&mut state))
}

/// Handle a button press and return updated state.
#[tauri::command]
pub fn button_press(key: String, state: State<'_, Mutex<AppState>>) -> Result<CalcDisplay, String> {
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;

    // P0-4: Guard against excessively long expressions
    const MAX_EXPRESSION_LEN: usize = 1000;
    if state.calc.expression.len() >= MAX_EXPRESSION_LEN
        && !matches!(
            key.as_str(),
            "C" | "⌫" | "DEL" | "=" | "ANGLE" | "MC" | "MR" | "RPN"
        )
    {
        return Ok(build_display(&mut state));
    }

    // Track whether this key modifies the tape (for cache invalidation)
    let mut tape_modified = false;
    let active = state.active_tape;
    let AppState {
        calc,
        tapes,
        undo_stack,
        exchange_rates: _,
        ..
    } = &mut *state;
    let tape = &mut tapes[active];

    match key.as_str() {
        // ── Digits ──
        "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" => {
            if calc.just_evaluated {
                calc.expression.clear();
                calc.just_evaluated = false;
            }
            calc.expression.push_str(&key);
        }

        // ── Decimal ──
        "." => {
            if calc.just_evaluated {
                calc.expression = "0".to_string();
                calc.just_evaluated = false;
            }
            let last_num = calc
                .expression
                .rsplit(|c: char| "+-×÷−*/() ".contains(c))
                .next()
                .unwrap_or("");
            if !last_num.contains('.') {
                if last_num.is_empty() || calc.expression.is_empty() {
                    calc.expression.push('0');
                }
                calc.expression.push('.');
            }
        }

        // ── Operators ──
        "+" | "−" | "×" | "÷" => {
            if calc.just_evaluated {
                calc.expression = calc.last_result.clone();
                calc.just_evaluated = false;
            }
            if calc.expression.is_empty() {
                if key == "−" {
                    calc.expression.push('−');
                }
            } else {
                let last_char = calc.expression.chars().last().unwrap_or(' ');
                if "+-×÷−*/".contains(last_char) {
                    calc.expression.pop();
                }
                calc.expression.push_str(&key);
            }
        }

        // ── Power ──
        "^" => {
            if calc.just_evaluated {
                calc.expression = calc.last_result.clone();
                calc.just_evaluated = false;
            }
            if !calc.expression.is_empty() {
                calc.expression.push('^');
            }
        }

        "^2" => {
            if calc.just_evaluated {
                calc.expression = calc.last_result.clone();
                calc.just_evaluated = false;
            }
            if !calc.expression.is_empty() {
                calc.expression.push_str("^2");
            }
        }

        // ── Functions ──
        "sqrt" | "sin" | "cos" | "tan" | "asin" | "acos" | "atan" | "ln" | "log" | "exp"
        | "abs" | "sinh" | "cosh" | "tanh" => {
            if calc.just_evaluated {
                calc.expression.clear();
                calc.just_evaluated = false;
            }
            calc.expression.push_str(&key);
            calc.expression.push('(');
            calc.open_parens += 1;
        }

        // ── Constants ──
        "pi" => {
            if calc.just_evaluated {
                calc.expression.clear();
                calc.just_evaluated = false;
            }
            if let Some(last) = calc.expression.chars().last()
                && (last.is_ascii_digit() || last == ')' || last == '.')
            {
                calc.expression.push('×');
            }
            calc.expression.push_str("pi");
        }

        "e" => {
            if calc.just_evaluated {
                calc.expression.clear();
                calc.just_evaluated = false;
            }
            if let Some(last) = calc.expression.chars().last()
                && (last.is_ascii_digit() || last == ')' || last == '.')
            {
                calc.expression.push('×');
            }
            calc.expression.push('e');
        }

        // ── Parentheses ──
        "(" => {
            if calc.just_evaluated {
                calc.expression.clear();
                calc.just_evaluated = false;
            }
            let last = calc.expression.chars().last().unwrap_or(' ');
            if last.is_ascii_digit() || last == ')' {
                calc.expression.push('×');
            }
            calc.expression.push('(');
            calc.open_parens += 1;
        }

        ")" => {
            if calc.open_parens > 0 {
                calc.expression.push(')');
                calc.open_parens -= 1;
            }
        }

        // ── Equals — Evaluate ──
        "=" => {
            if !calc.expression.is_empty() {
                for _ in 0..calc.open_parens {
                    calc.expression.push(')');
                }
                calc.open_parens = 0;

                let eval_str = calc.resolve_line_refs(tape);
                let display_expr = calc.expression.clone();
                let result = eval_numeric_ctx(&eval_str, &calc.eval_context);
                let result_str = format_result(&result);

                if let CalcResult::Numeric(v) = &result {
                    calc.eval_context.last_answer = Some(*v);
                }

                // Add to tape
                let cmd = TapeCommand::AddEntry {
                    input: display_expr,
                };
                undo_stack.execute(cmd, tape);

                // Set the result on the last entry
                if let Some(entry) = tape.entries.last_mut() {
                    entry.result = result;
                }

                calc.last_result = result_str.replace(',', "");
                calc.just_evaluated = true;
                tape_modified = true;

                // Auto-save (P1-2: async) — saves ALL tapes
                save_all_tapes(tapes, active);
            }
        }

        // ── Clear ──
        "C" => {
            calc.expression.clear();
            calc.just_evaluated = false;
            calc.open_parens = 0;
            calc.last_result = "0".to_string();
        }

        // ── Backspace ──
        "⌫" | "DEL" => {
            if !calc.expression.is_empty() {
                let removed = calc.expression.pop().unwrap_or(' ');
                if removed == '(' {
                    calc.open_parens -= 1;
                }
                if removed == ')' {
                    calc.open_parens += 1;
                }
            }
            calc.just_evaluated = false;
        }

        // ── Percent ──
        "%" => {
            if !calc.expression.is_empty() {
                let eval_str = format!("({})/100", calc.to_eval_string());
                let result = eval_numeric(&eval_str);
                let result_str = format_result(&result);
                calc.expression = result_str.replace(',', "");
                calc.last_result = calc.expression.clone();
            }
        }

        // ── Sign toggle ──
        "±" => {
            if !calc.expression.is_empty() {
                if calc.just_evaluated {
                    if let Ok(v) = calc.last_result.replace(',', "").parse::<f64>() {
                        let negated = -v;
                        let s = format_result(&CalcResult::Numeric(negated));
                        calc.expression = s.replace(',', "");
                        calc.last_result = calc.expression.clone();
                        calc.just_evaluated = false;
                    }
                } else if calc.expression.starts_with('−') || calc.expression.starts_with('-') {
                    let first_len = calc.expression.chars().next().unwrap().len_utf8();
                    calc.expression = calc.expression[first_len..].to_string();
                } else {
                    calc.expression.insert(0, '−');
                }
            }
        }

        // ── Angle unit ──
        "ANGLE" => {
            calc.angle_unit = match calc.angle_unit {
                AngleUnit::Degrees => AngleUnit::Radians,
                AngleUnit::Radians => AngleUnit::Gradians,
                AngleUnit::Gradians => AngleUnit::Degrees,
            };
            calc.eval_context.angle_unit = calc.angle_unit;
        }

        // ── Memory ──
        "MC" => {
            calc.memory = None;
        }
        "MR" => {
            if let Some(val) = calc.memory {
                let display = format_result(&CalcResult::Numeric(val));
                calc.expression = display.replace(',', "");
                calc.just_evaluated = false;
            }
        }
        "M+" => {
            let eval_str = calc.to_eval_string();
            if let CalcResult::Numeric(v) = eval_numeric(&eval_str) {
                calc.memory = Some(calc.memory.unwrap_or(0.0) + v);
            }
        }
        "M-" => {
            let eval_str = calc.to_eval_string();
            if let CalcResult::Numeric(v) = eval_numeric(&eval_str) {
                calc.memory = Some(calc.memory.unwrap_or(0.0) - v);
            }
        }

        _ => {}
    }

    // P1-1: Only invalidate tape cache when tape was actually modified
    if tape_modified {
        state.mark_tape_dirty();
    }
    Ok(build_display(&mut state))
}
