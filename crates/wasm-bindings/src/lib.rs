use hc_tapcalc_core::tape::Tape;
use hc_tapcalc_core::types::CalcResult;
use hc_tapcalc_core::undo::{TapeCommand, UndoStack};
use hc_tapcalc_engine_currency::ExchangeRates;
use hc_tapcalc_engine_numeric::{AngleUnit, eval_numeric, eval_numeric_ctx};
use hc_tapcalc_parser::eval::EvalContext;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys::Promise;

// ─── Calculator State ────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone)]
pub struct CalcState {
    pub expression: String,
    pub just_evaluated: bool,
    pub last_result: String,
    pub open_parens: i32,
    pub memory: Option<f64>,
    #[serde(with = "AngleUnitDef")]
    pub angle_unit: AngleUnit,
    pub eval_context: EvalContext,
    pub theme: i32,
    pub pending_result_note: Option<String>,
    pub pending_operand_notes: std::collections::HashMap<usize, String>,
}

#[derive(Serialize, Deserialize)]
#[serde(remote = "AngleUnit")]
enum AngleUnitDef {
    Degrees,
    Radians,
    Gradians,
}

// EvalContext only has a struct form, but let's just create it directly.
// EvalContext has a default() so we can use that instead of trying to map an enum Any/Equation.

impl Default for CalcState {
    fn default() -> Self {
        Self::new()
    }
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
            pending_result_note: None,
            pending_operand_notes: std::collections::HashMap::new(),
        }
    }

    pub fn to_eval_string(&self) -> String {
        self.expression
            .replace('×', "*")
            .replace('÷', "/")
            .replace('−', "-")
    }

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
                let trimmed = formatted.trim_end_matches('0').trim_end_matches('.');
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
    if is_negative {
        result.push('-');
    }
    result.chars().rev().collect()
}

// ─── Tape DTOs ───────────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct TapeEntryDto {
    pub line_number: u32,
    pub input: String,
    pub result: String,
    pub is_error: bool,
    pub note: String,
    pub operand_notes: std::collections::HashMap<usize, String>,
}

#[derive(Serialize, Clone)]
pub struct TapeState {
    pub entries: Vec<TapeEntryDto>,
    pub grand_total: String,
}

#[derive(Serialize, Clone)]
pub struct CalcDisplay {
    pub input: String,
    pub result: String,
    pub has_error: bool,
    pub angle_unit: String,
    pub memory: String,
    pub can_undo: bool,
    pub can_redo: bool,
    pub theme: i32,
    pub tape: TapeState,
    pub tape_count: usize,
    pub active_tape_index: usize,
    pub tape_names: Vec<String>,
    pub pending_result_note: Option<String>,
    pub pending_operand_notes: std::collections::HashMap<usize, String>,
}

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
                note: e.note.clone().unwrap_or_default(),
                operand_notes: e.operand_notes.clone(),
            })
            .collect(),
        grand_total: format_result(&CalcResult::Numeric(tape.grand_total())),
    }
}

// ─── Wasm App State ─────────────────────────────────────────────────────────

#[wasm_bindgen]
pub struct AppState {
    // Current calculator state
    calc_state: CalcState,

    // Tape history
    tapes: Vec<Tape>,
    active_tape: usize,

    // Undo/Redo stack for the active tape
    undo_stack: UndoStack,

    // Exchange rates cache
    #[wasm_bindgen(skip)]
    pub exchange_rates: ExchangeRates,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
impl AppState {
    #[wasm_bindgen(constructor)]
    pub fn new() -> AppState {
        console_error_panic_hook::set_once();
        AppState {
            calc_state: CalcState::new(),
            tapes: vec![Tape::new("Tape 1")],
            active_tape: 0,
            undo_stack: UndoStack::new(),
            exchange_rates: ExchangeRates::builtin(),
        }
    }

    #[allow(clippy::collapsible_if)]
    pub fn load_session(&mut self, json_str: &str) -> bool {
        #[derive(Deserialize)]
        struct SessionData {
            tapes: Vec<Tape>,
            active_tape: usize,
        }
        if let Ok(session) = serde_json::from_str::<SessionData>(json_str) {
            if !session.tapes.is_empty() {
                self.tapes = session.tapes;
                self.active_tape = session.active_tape.min(self.tapes.len() - 1);
                return true;
            }
        }
        false
    }

    pub fn save_session(&self) -> String {
        #[derive(Serialize)]
        struct SessionData<'a> {
            tapes: &'a [Tape],
            active_tape: usize,
        }
        serde_json::to_string(&SessionData {
            tapes: &self.tapes,
            active_tape: self.active_tape,
        })
        .unwrap_or_default()
    }

    pub fn get_state(&mut self) -> Result<JsValue, JsValue> {
        let display = self.build_display();
        to_value(&display).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn button_press(&mut self, key: &str) -> Result<JsValue, JsValue> {
        self.handle_key(key);
        self.get_state()
    }

    pub fn undo(&mut self) -> Result<JsValue, JsValue> {
        let tape = &mut self.tapes[self.active_tape];
        self.undo_stack.undo(tape);
        recalculate_tape(tape, &self.calc_state);
        self.get_state()
    }

    pub fn redo(&mut self) -> Result<JsValue, JsValue> {
        let tape = &mut self.tapes[self.active_tape];
        self.undo_stack.redo(tape);
        recalculate_tape(tape, &self.calc_state);
        self.get_state()
    }

    pub fn clear_tape(&mut self) -> Result<JsValue, JsValue> {
        let name = self.tapes[self.active_tape].name.clone();
        self.tapes[self.active_tape] = Tape::new(name);
        self.undo_stack = UndoStack::new();
        self.get_state()
    }

    pub fn delete_entry(&mut self, line_number: u32) -> Result<JsValue, JsValue> {
        let tape = &mut self.tapes[self.active_tape];
        tape.entries.retain(|e| e.line_number != line_number);
        for (i, entry) in tape.entries.iter_mut().enumerate() {
            entry.line_number = i as u32 + 1;
        }
        recalculate_tape(tape, &self.calc_state);
        tape.is_dirty = true;
        self.get_state()
    }

    pub fn cycle_theme(&mut self) -> Result<JsValue, JsValue> {
        self.calc_state.theme = (self.calc_state.theme + 1) % 3;
        self.get_state()
    }

    pub fn new_tape(&mut self) -> Result<JsValue, JsValue> {
        let idx = self.tapes.len() + 1;
        self.tapes.push(Tape::new(format!("Tape {}", idx)));
        self.active_tape = self.tapes.len() - 1;
        self.undo_stack = UndoStack::new();
        self.get_state()
    }

    pub fn switch_tape(&mut self, index: usize) -> Result<JsValue, JsValue> {
        if index < self.tapes.len() {
            self.active_tape = index;
        }
        self.get_state()
    }

    pub fn rename_tape(&mut self, index: usize, name: String) -> Result<JsValue, JsValue> {
        let sanitized: String = name
            .chars()
            .filter(|c| {
                c.is_alphanumeric() || c.is_whitespace() || *c == '.' || *c == '-' || *c == '_'
            })
            .take(50)
            .collect();
        if sanitized.is_empty() {
            return Err(JsValue::from_str("Tape name cannot be empty"));
        }
        if index < self.tapes.len() {
            self.tapes[index].name = sanitized;
            self.tapes[index].is_dirty = true;
        }
        Ok(serde_wasm_bindgen::to_value(&self.build_display()).unwrap())
    }

    /// Delete a tape by index (cannot delete the last tape).
    pub fn delete_tape(&mut self, index: usize) -> Result<JsValue, JsValue> {
        if self.tapes.len() > 1 && index < self.tapes.len() {
            self.tapes.remove(index);
            if self.active_tape >= self.tapes.len() {
                self.active_tape = self.tapes.len() - 1;
            }
            self.undo_stack = UndoStack::new();
        }
        self.get_state()
    }

    pub fn tape_entry_click(&mut self, line_number: u32) -> Result<JsValue, JsValue> {
        let input = self.tapes[self.active_tape]
            .entries
            .iter()
            .find(|e| e.line_number == line_number)
            .map(|e| e.input.clone());
        if let Some(input) = input {
            self.calc_state.expression = input;
            self.calc_state.just_evaluated = false;
        }
        self.get_state()
    }

    pub fn set_note(&mut self, line_number: u32, note: &str) -> Result<JsValue, JsValue> {
        let sanitized: String = note
            .chars()
            .filter(|c| {
                c.is_alphanumeric() || c.is_whitespace() || *c == '.' || *c == '-' || *c == '_'
            })
            .take(500)
            .collect();
        let tape = &mut self.tapes[self.active_tape];
        if let Some(entry) = tape
            .entries
            .iter_mut()
            .find(|e| e.line_number == line_number)
        {
            entry.note = if sanitized.is_empty() {
                None
            } else {
                Some(sanitized)
            };
        }
        self.get_state()
    }

    pub fn set_pending_note(&mut self, note: &str, operand_index: Option<usize>) -> Result<JsValue, JsValue> {
        let sanitized: String = note
            .chars()
            .filter(|c| c.is_alphanumeric() || c.is_whitespace() || *c == '.' || *c == '-' || *c == '_')
            .take(500)
            .collect();
        if let Some(idx) = operand_index {
            if sanitized.is_empty() {
                self.calc_state.pending_operand_notes.remove(&idx);
            } else {
                self.calc_state.pending_operand_notes.insert(idx, sanitized);
            }
        } else {
            self.calc_state.pending_result_note = if sanitized.is_empty() { None } else { Some(sanitized) };
        }
        self.get_state()
    }

    pub fn edit_entry(&mut self, line_number: u32, new_input: String) -> Result<JsValue, JsValue> {
        let tape = &mut self.tapes[self.active_tape];
        if let Some(entry) = tape.entries.iter_mut().find(|e| e.line_number == line_number) {
            entry.input = new_input;
            tape.is_dirty = true;
        }
        recalculate_tape(tape, &self.calc_state);
        self.get_state()
    }

    pub fn toggle_subtotal(&mut self, line_number: u32) -> Result<JsValue, JsValue> {
        let tape = &mut self.tapes[self.active_tape];
        if let Some(entry) = tape.entries.iter_mut().find(|e| e.line_number == line_number) {
            entry.is_subtotal = !entry.is_subtotal;
            tape.is_dirty = true;
        }
        recalculate_tape(tape, &self.calc_state);
        self.get_state()
    }

    pub fn export_tape(&mut self, format: &str) -> Result<String, JsValue> {
        let tape = &self.tapes[self.active_tape];
        match format {
            "json" => hc_tapcalc_export::export_json(tape).map_err(|e| JsValue::from_str(&e)),
            "text" => Ok(hc_tapcalc_export::export_text(tape)),
            "csv" => Ok(hc_tapcalc_export::export_csv(tape)),
            _ => Err(JsValue::from_str("Unsupported format")),
        }
    }

    pub fn get_unit_categories(&self) -> JsValue {
        #[derive(Serialize)]
        struct UnitInfo {
            name: String,
            display: String,
        }
        #[derive(Serialize)]
        struct UnitCategoryInfo {
            id: String,
            name: String,
            units: Vec<UnitInfo>,
        }

        let cats: Vec<UnitCategoryInfo> = hc_tapcalc_engine_units::UnitCategory::all()
            .iter()
            .map(|cat| UnitCategoryInfo {
                id: cat.name().to_lowercase(),
                name: cat.name().to_string(),
                units: cat
                    .units()
                    .iter()
                    .map(|u| UnitInfo {
                        name: u.to_string(),
                        display: hc_tapcalc_engine_units::unit_display_name(u).to_string(),
                    })
                    .collect(),
            })
            .collect();
        to_value(&cats).unwrap()
    }

    pub fn convert_units(&self, value: f64, from: &str, to: &str) -> Result<f64, JsValue> {
        hc_tapcalc_engine_units::convert(value, from, to).map_err(|e| JsValue::from_str(&e))
    }

    pub fn get_currencies(&self) -> JsValue {
        #[derive(Serialize)]
        struct CurrencyInfo {
            code: String,
            name: String,
            symbol: String,
            flag: String,
        }

        let currencies: Vec<CurrencyInfo> = self
            .exchange_rates
            .available_currencies()
            .into_iter()
            .map(|c| CurrencyInfo {
                code: c.code,
                name: c.name,
                symbol: c.symbol,
                flag: c.flag,
            })
            .collect();
        to_value(&currencies).unwrap()
    }

    pub fn convert_currency(&self, value: f64, from: &str, to: &str) -> Result<JsValue, JsValue> {
        #[derive(Serialize)]
        struct CurrencyConvertResult {
            result: f64,
            rate: f64,
            last_updated: String,
        }

        let result = self
            .exchange_rates
            .convert_str(value, from, to)
            .map_err(|e| JsValue::from_str(&e))?;
        let rate = self
            .exchange_rates
            .get_rate(from, to)
            .map_err(|e| JsValue::from_str(&e))?;

        to_value(&CurrencyConvertResult {
            result,
            rate,
            last_updated: self.exchange_rates.last_updated.clone(),
        })
        .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn refresh_rates(&mut self) -> Promise {
        let mut fresh_rates = ExchangeRates::builtin();

        // Use wasm_bindgen_futures to convert the Rust Future into a JS Promise
        wasm_bindgen_futures::future_to_promise(async move {
            match fresh_rates.fetch_live().await {
                Ok(_) => Ok(JsValue::from_str(&fresh_rates.last_updated)),
                Err(e) => Err(JsValue::from_str(&e)),
            }
        })
    }

    pub fn evaluate_graph_function(
        &self,
        expression: &str,
        x_min: f64,
        x_max: f64,
        num_points: usize,
    ) -> Result<JsValue, JsValue> {
        #[derive(Serialize)]
        struct GraphPoint {
            x: f64,
            y: f64,
        }

        let pts = hc_tapcalc_graphing::evaluate_function(expression, x_min, x_max, num_points)
            .map_err(|e| JsValue::from_str(&e))?;

        let points: Vec<GraphPoint> = pts
            .into_iter()
            .map(|p| GraphPoint { x: p.x, y: p.y })
            .collect();
        to_value(&points).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn graph_y_intercept(&self, expression: &str) -> Result<f64, JsValue> {
        hc_tapcalc_graphing::y_intercept(expression).map_err(|e| JsValue::from_str(&e))
    }

    pub fn graph_x_intercepts(
        &self,
        expression: &str,
        x_min: f64,
        x_max: f64,
        resolution: usize,
    ) -> Result<Vec<f64>, JsValue> {
        hc_tapcalc_graphing::x_intercepts(expression, x_min, x_max, resolution)
            .map_err(|e| JsValue::from_str(&e))
    }

    fn build_display(&self) -> CalcDisplay {
        let preview = if !self.calc_state.expression.is_empty() && !self.calc_state.just_evaluated {
            let mut expr = self.calc_state.to_eval_string();
            for _ in 0..self.calc_state.open_parens {
                expr.push(')');
            }
            match eval_numeric_ctx(&expr, &self.calc_state.eval_context) {
                CalcResult::Numeric(v) => format_result(&CalcResult::Numeric(v)),
                _ => self.calc_state.last_result.clone(),
            }
        } else {
            self.calc_state.last_result.clone()
        };

        let tape_dto = tape_to_dto(&self.tapes[self.active_tape]);

        CalcDisplay {
            input: self.calc_state.expression.clone(),
            result: preview,
            has_error: false,
            angle_unit: match self.calc_state.angle_unit {
                AngleUnit::Degrees => "DEG".to_string(),
                AngleUnit::Radians => "RAD".to_string(),
                AngleUnit::Gradians => "GRAD".to_string(),
            },
            memory: self
                .calc_state
                .memory
                .map(|v| format_result(&CalcResult::Numeric(v)))
                .unwrap_or_default(),
            can_undo: self.undo_stack.can_undo(),
            can_redo: self.undo_stack.can_redo(),
            theme: self.calc_state.theme,
            tape: tape_dto,
            tape_count: self.tapes.len(),
            active_tape_index: self.active_tape,
            tape_names: self.tapes.iter().map(|t| t.name.clone()).collect(),
            pending_result_note: None,
            pending_operand_notes: std::collections::HashMap::new(),
        }
    }

    fn handle_key(&mut self, key: &str) {
        const MAX_EXPRESSION_LEN: usize = 1000;
        if self.calc_state.expression.len() >= MAX_EXPRESSION_LEN
            && !matches!(key, "C" | "⌫" | "DEL" | "=" | "ANGLE" | "MC" | "MR" | "RPN")
        {
            return;
        }

        match key {
            "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression.clear();
                    self.calc_state.just_evaluated = false;
                }
                self.calc_state.expression.push_str(key);
            }
            "." => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression = "0".to_string();
                    self.calc_state.just_evaluated = false;
                }
                let last_num = self
                    .calc_state
                    .expression
                    .rsplit(|c: char| "+-×÷−*/() ".contains(c))
                    .next()
                    .unwrap_or("");
                if !last_num.contains('.') {
                    if last_num.is_empty() || self.calc_state.expression.is_empty() {
                        self.calc_state.expression.push('0');
                    }
                    self.calc_state.expression.push('.');
                }
            }
            "+" | "−" | "×" | "÷" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression = self.calc_state.last_result.clone();
                    self.calc_state.just_evaluated = false;
                }
                if self.calc_state.expression.is_empty() {
                    if key == "−" {
                        self.calc_state.expression.push('−');
                    }
                } else {
                    let last_char = self.calc_state.expression.chars().last().unwrap_or(' ');
                    if "+-×÷−*/".contains(last_char) {
                        self.calc_state.expression.pop();
                    }
                    self.calc_state.expression.push_str(key);
                }
            }
            "^" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression = self.calc_state.last_result.clone();
                    self.calc_state.just_evaluated = false;
                }
                if !self.calc_state.expression.is_empty() {
                    self.calc_state.expression.push('^');
                }
            }
            "^2" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression = self.calc_state.last_result.clone();
                    self.calc_state.just_evaluated = false;
                }
                if !self.calc_state.expression.is_empty() {
                    self.calc_state.expression.push_str("^2");
                }
            }
            "sqrt" | "sin" | "cos" | "tan" | "asin" | "acos" | "atan" | "ln" | "log" | "exp"
            | "abs" | "sinh" | "cosh" | "tanh" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression.clear();
                    self.calc_state.just_evaluated = false;
                }
                self.calc_state.expression.push_str(key);
                self.calc_state.expression.push('(');
                self.calc_state.open_parens += 1;
            }
            "pi" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression.clear();
                    self.calc_state.just_evaluated = false;
                }
                if self
                    .calc_state
                    .expression
                    .chars()
                    .last()
                    .is_some_and(|last| last.is_ascii_digit() || last == ')' || last == '.')
                {
                    self.calc_state.expression.push('×');
                }
                self.calc_state.expression.push_str("pi");
            }
            "e" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression.clear();
                    self.calc_state.just_evaluated = false;
                }
                if self
                    .calc_state
                    .expression
                    .chars()
                    .last()
                    .is_some_and(|last| last.is_ascii_digit() || last == ')' || last == '.')
                {
                    self.calc_state.expression.push('×');
                }
                self.calc_state.expression.push('e');
            }
            "(" => {
                if self.calc_state.just_evaluated {
                    self.calc_state.expression.clear();
                    self.calc_state.just_evaluated = false;
                }
                let last = self.calc_state.expression.chars().last().unwrap_or(' ');
                if last.is_ascii_digit() || last == ')' {
                    self.calc_state.expression.push('×');
                }
                self.calc_state.expression.push('(');
                self.calc_state.open_parens += 1;
            }
            ")" => {
                if self.calc_state.open_parens > 0 {
                    self.calc_state.expression.push(')');
                    self.calc_state.open_parens -= 1;
                }
            }
            "=" => {
                if !self.calc_state.expression.is_empty() {
                    for _ in 0..self.calc_state.open_parens {
                        self.calc_state.expression.push(')');
                    }
                    self.calc_state.open_parens = 0;

                    let eval_str = self
                        .calc_state
                        .resolve_line_refs(&self.tapes[self.active_tape]);
                    let display_expr = self.calc_state.expression.clone();
                    let result = eval_numeric_ctx(&eval_str, &self.calc_state.eval_context);
                    let result_str = format_result(&result);

                    if let CalcResult::Numeric(v) = &result {
                        self.calc_state.eval_context.last_answer = Some(*v);
                    }

                    let note = self.calc_state.pending_result_note.take();
                    let operand_notes = std::mem::take(&mut self.calc_state.pending_operand_notes);

                    let cmd = TapeCommand::AddEntry {
                        input: display_expr,
                        note,
                        operand_notes,
                    };
                    self.undo_stack
                        .execute(cmd, &mut self.tapes[self.active_tape]);

                    if let Some(entry) = self.tapes[self.active_tape].entries.last_mut() {
                        entry.result = result;
                    }

                    self.calc_state.last_result = result_str.replace(',', "");
                    self.calc_state.just_evaluated = true;
                }
            }
            "C" => {
                self.calc_state.expression.clear();
                self.calc_state.just_evaluated = false;
                self.calc_state.open_parens = 0;
                self.calc_state.last_result = "0".to_string();
            }
            "⌫" | "DEL" => {
                if !self.calc_state.expression.is_empty() {
                    let removed = self.calc_state.expression.pop().unwrap_or(' ');
                    if removed == '(' {
                        self.calc_state.open_parens -= 1;
                    }
                    if removed == ')' {
                        self.calc_state.open_parens += 1;
                    }
                }
                self.calc_state.just_evaluated = false;
            }
            "%" => {
                if !self.calc_state.expression.is_empty() {
                    let eval_str = format!("({})/100", self.calc_state.to_eval_string());
                    let result = eval_numeric(&eval_str);
                    let result_str = format_result(&result);
                    self.calc_state.expression = result_str.replace(',', "");
                    self.calc_state.last_result = self.calc_state.expression.clone();
                }
            }
            "±" => {
                if !self.calc_state.expression.is_empty() {
                    if self.calc_state.just_evaluated {
                        if let Ok(v) = self.calc_state.last_result.replace(',', "").parse::<f64>() {
                            let negated = -v;
                            let s = format_result(&CalcResult::Numeric(negated));
                            self.calc_state.expression = s.replace(',', "");
                            self.calc_state.last_result = self.calc_state.expression.clone();
                            self.calc_state.just_evaluated = false;
                        }
                    } else if self.calc_state.expression.starts_with('−')
                        || self.calc_state.expression.starts_with('-')
                    {
                        let first_len = self
                            .calc_state
                            .expression
                            .chars()
                            .next()
                            .unwrap()
                            .len_utf8();
                        self.calc_state.expression =
                            self.calc_state.expression[first_len..].to_string();
                    } else {
                        self.calc_state.expression.insert(0, '−');
                    }
                }
            }
            "ANGLE" => {
                self.calc_state.angle_unit = match self.calc_state.angle_unit {
                    AngleUnit::Degrees => AngleUnit::Radians,
                    AngleUnit::Radians => AngleUnit::Gradians,
                    AngleUnit::Gradians => AngleUnit::Degrees,
                };
                self.calc_state.eval_context.angle_unit = self.calc_state.angle_unit;
            }
            "MC" => {
                self.calc_state.memory = None;
            }
            "MR" => {
                if let Some(val) = self.calc_state.memory {
                    let display = format_result(&CalcResult::Numeric(val));
                    self.calc_state.expression = display.replace(',', "");
                    self.calc_state.just_evaluated = false;
                }
            }
            "M+" => {
                let eval_str = self.calc_state.to_eval_string();
                if let CalcResult::Numeric(v) = eval_numeric(&eval_str) {
                    self.calc_state.memory = Some(self.calc_state.memory.unwrap_or(0.0) + v);
                }
            }
            "M-" => {
                let eval_str = self.calc_state.to_eval_string();
                if let CalcResult::Numeric(v) = eval_numeric(&eval_str) {
                    self.calc_state.memory = Some(self.calc_state.memory.unwrap_or(0.0) - v);
                }
            }
            _ => {}
        }
    }
}

// ─── Tape Recalculation Helpers ─────────────────────────────────────────────

fn prepare_eval_string(s: &str) -> String {
    s.replace('×', "*")
     .replace('÷', "/")
     .replace('−', "-")
}

fn recalculate_tape(tape: &mut hc_tapcalc_core::tape::Tape, calc: &CalcState) {
    let mut prev_result = 0.0;
    
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
        
        // Resolve references to previous tape lines e.g. $1, $2
        if eval_str.contains('$') {
            let line_map: std::collections::HashMap<u32, &CalcResult> = tape
                .entries[..i]
                .iter()
                .map(|e| (e.line_number, &e.result))
                .collect();
            let mut resolved = String::with_capacity(eval_str.len());
            let chars: Vec<char> = eval_str.chars().collect();
            let mut j = 0;
            while j < chars.len() {
                if chars[j] == '$' && j + 1 < chars.len() && chars[j + 1].is_ascii_digit() {
                    let start = j + 1;
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
                        Some(CalcResult::Numeric(v)) => resolved.push_str(&format!("({})", v)),
                        _ => resolved.push('0'),
                    }
                    j = end;
                } else {
                    resolved.push(chars[j]);
                    j += 1;
                }
            }
            eval_str = resolved;
        }

        let result = hc_tapcalc_engine_numeric::eval_numeric_ctx(&eval_str, &calc.eval_context);
        
        if let CalcResult::Numeric(v) = &result {
            prev_result = *v;
        }
        
        tape.entries[i].result = result;
    }
}
