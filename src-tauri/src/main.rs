// Prevents the console window from showing on Windows release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! # HC TapeCalc — Tauri v2 Entry Point
//!
//! Wires together the Tauri app shell with the Rust backend engines.
//! All calculator logic lives in `commands/`.

mod commands;

use commands::AppState;
use std::sync::Mutex;

fn main() {
    tracing_subscriber::fmt::init();
    tracing::info!("HC TapeCalc v2.0 (Tauri) starting...");

    tauri::Builder::default()
        .manage(Mutex::new(AppState::new()))
        .invoke_handler(tauri::generate_handler![
            // Calculator input
            commands::calc::get_state,
            commands::calc::button_press,
            // Tape management
            commands::tape::undo,
            commands::tape::redo,
            commands::tape::clear_tape,
            commands::tape::delete_entry,
            commands::tape::cycle_theme,
            commands::tape::export_tape,
            commands::tape::copy_to_clipboard,
            commands::tape::tape_entry_click,
            commands::tape::new_tape,
            commands::tape::switch_tape,
            commands::tape::set_note,
            commands::tape::set_pending_note,
            commands::tape::rename_tape,
            commands::tape::delete_tape,
            commands::tape::edit_entry,
            commands::tape::toggle_subtotal,
            commands::tape::toggle_always_on_top,
            // Unit conversion
            commands::conversion::get_unit_categories,
            commands::conversion::convert_units,
            // Currency exchange
            commands::conversion::get_currencies,
            commands::conversion::convert_currency,
            commands::conversion::refresh_rates,
            // Graphing
            commands::graphing::evaluate_graph_function,
            commands::graphing::graph_y_intercept,
            commands::graphing::graph_x_intercepts,
        ])
        .run(tauri::generate_context!())
        .expect("Error running HC TapeCalc");
}
