//! Serializable DTO types for IPC between Rust and the frontend.

use serde::Serialize;

// ─── Tape DTOs ───────────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct TapeEntryDto {
    pub line_number: u32,
    pub input: String,
    pub result: String,
    pub is_error: bool,
    pub is_subtotal: bool,
    pub note: String,
    #[serde(default)]
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
    #[serde(default)]
    pub pending_operand_notes: std::collections::HashMap<usize, String>,
}

// ─── Unit Conversion DTOs ────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct UnitInfo {
    pub name: String,
    pub display: String,
}

#[derive(Serialize, Clone)]
pub struct UnitCategoryInfo {
    pub id: String,
    pub name: String,
    pub units: Vec<UnitInfo>,
}

// ─── Currency DTOs ───────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct CurrencyInfo {
    pub code: String,
    pub name: String,
    pub symbol: String,
    pub flag: String,
}

#[derive(Serialize, Clone)]
pub struct CurrencyConvertResult {
    pub result: f64,
    pub rate: f64,
    pub last_updated: String,
}

// ─── Graphing DTOs ───────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct GraphPoint {
    pub x: f64,
    pub y: f64,
}
