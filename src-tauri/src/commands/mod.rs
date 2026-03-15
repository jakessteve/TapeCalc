//! Tauri commands — the IPC bridge between React frontend and Rust engines.
//!
//! This module is organized into focused sub-modules:
//! - `state` — CalcState and AppState
//! - `types` — Serializable DTOs for IPC
//! - `helpers` — Formatting, persistence, display building, sanitization
//! - `calc` — Calculator input handling (button_press, get_state)
//! - `tape` — Tape management (undo, redo, export, etc.)
//! - `conversion` — Unit and currency conversion commands
//! - `graphing` — Graph plotting and intercept commands

pub mod calc;
pub mod conversion;
pub mod graphing;
pub mod helpers;
pub mod state;
pub mod tape;
pub mod types;

// Re-export AppState for main.rs
pub use state::AppState;
