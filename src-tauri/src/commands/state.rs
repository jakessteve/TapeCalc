//! Application state — calculator and tape state management.

use hc_tapcalc_core::tape::Tape;
use hc_tapcalc_core::types::CalcResult;
use hc_tapcalc_core::undo::UndoStack;
use hc_tapcalc_engine_currency::ExchangeRates;
use hc_tapcalc_parser::{AngleUnit, EvalContext};
use std::collections::HashMap;

use super::helpers::load_all_tapes;
use super::types::TapeState;
use super::helpers::tape_to_dto;

// ─── Calculator State ────────────────────────────────────────────────────────

/// Calculator state — tracks input building between button presses.
#[derive(Debug)]
pub struct CalcState {
    pub expression: String,
    pub just_evaluated: bool,
    pub last_result: String,
    pub open_parens: i32,
    pub memory: Option<f64>,
    pub angle_unit: AngleUnit,
    pub eval_context: EvalContext,
    pub theme: i32,
}

impl CalcState {
    pub fn new() -> Self {
        Self {
            expression: String::new(),
            just_evaluated: false,
            last_result: "0".to_string(),
            open_parens: 0,
            memory: None,
            angle_unit: AngleUnit::Degrees,
            eval_context: EvalContext::default(),
            theme: 1,
        }
    }

    pub fn to_eval_string(&self) -> String {
        self.expression
            .replace('×', "*")
            .replace('÷', "/")
            .replace('−', "-")
    }

    /// P3-14: Uses HashMap for O(1) line number lookup instead of linear scan.
    pub fn resolve_line_refs(&self, tape: &Tape) -> String {
        let expr = self.to_eval_string();
        if !expr.contains('$') {
            return expr;
        }
        let line_map: HashMap<u32, &CalcResult> = tape
            .entries
            .iter()
            .map(|e| (e.line_number, &e.result))
            .collect();
        let mut result = String::with_capacity(expr.len());
        let chars: Vec<char> = expr.chars().collect();
        let mut i = 0;
        while i < chars.len() {
            if chars[i] == '$' && i + 1 < chars.len() && chars[i + 1].is_ascii_digit() {
                let start = i + 1;
                let mut end = start;
                while end < chars.len() && chars[end].is_ascii_digit() {
                    end += 1;
                }
                let line_num: u32 = chars[start..end]
                    .iter()
                    .collect::<String>()
                    .parse()
                    .unwrap_or(0);
                match line_map.get(&line_num) {
                    Some(CalcResult::Numeric(v)) => result.push_str(&format!("({})", v)),
                    _ => result.push('0'),
                }
                i = end;
            } else {
                result.push(chars[i]);
                i += 1;
            }
        }
        result
    }
}

// ─── Application State ──────────────────────────────────────────────────────

/// The full app state wrapped in a Mutex for thread-safe access.
pub struct AppState {
    pub calc: CalcState,
    pub tapes: Vec<Tape>,
    pub active_tape: usize,
    pub undo_stack: UndoStack,
    pub exchange_rates: ExchangeRates,
    /// P1-1: Cached tape DTO to avoid re-serializing on every keystroke.
    pub last_tape_dto: Option<TapeState>,
    pub tape_dirty: bool,
}

impl AppState {
    pub fn new() -> Self {
        let (tapes, active_tape) = load_all_tapes();
        Self {
            calc: CalcState::new(),
            tapes,
            active_tape,
            undo_stack: UndoStack::new(),
            exchange_rates: ExchangeRates::builtin(),
            last_tape_dto: None,
            tape_dirty: true,
        }
    }

    /// Get a reference to the active tape.
    pub fn tape(&self) -> &Tape {
        &self.tapes[self.active_tape]
    }

    /// Mark tape as changed — forces DTO rebuild on next display.
    pub fn mark_tape_dirty(&mut self) {
        self.tape_dirty = true;
        self.last_tape_dto = None;
    }

    /// Get or build the tape DTO, caching the result (P1-1).
    pub fn get_tape_dto(&mut self) -> TapeState {
        if self.tape_dirty || self.last_tape_dto.is_none() {
            let dto = tape_to_dto(self.tape());
            self.last_tape_dto = Some(dto.clone());
            self.tape_dirty = false;
            dto
        } else {
            self.last_tape_dto.clone().unwrap()
        }
    }
}
