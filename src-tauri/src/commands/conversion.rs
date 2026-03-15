//! Unit and currency conversion commands.

use hc_tapcalc_engine_currency::ExchangeRates;
use hc_tapcalc_engine_units::{self as units};
use std::sync::Mutex;
use tauri::State;

use super::state::AppState;
use super::types::{CurrencyConvertResult, CurrencyInfo, UnitCategoryInfo, UnitInfo};

// ─── Unit Conversion ─────────────────────────────────────────────────────────

/// Get all unit categories with their units.
#[tauri::command]
pub fn get_unit_categories() -> Vec<UnitCategoryInfo> {
    units::UnitCategory::all()
        .iter()
        .map(|cat| UnitCategoryInfo {
            id: cat.name().to_lowercase(),
            name: cat.name().to_string(),
            units: cat
                .units()
                .iter()
                .map(|u| UnitInfo {
                    name: u.to_string(),
                    display: units::unit_display_name(u).to_string(),
                })
                .collect(),
        })
        .collect()
}

/// Convert a value from one unit to another.
#[tauri::command]
pub fn convert_units(value: f64, from: String, to: String) -> Result<f64, String> {
    units::convert(value, &from, &to)
}

// ─── Currency Exchange ───────────────────────────────────────────────────────

/// Get all available currencies (dynamic — expands after fetching live rates).
#[tauri::command]
pub fn get_currencies(state: State<'_, Mutex<AppState>>) -> Vec<CurrencyInfo> {
    let state = match state.lock() {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };
    state
        .exchange_rates
        .available_currencies()
        .into_iter()
        .map(|c| CurrencyInfo {
            code: c.code,
            name: c.name,
            symbol: c.symbol,
            flag: c.flag,
        })
        .collect()
}

/// Convert a value between currencies.
#[tauri::command]
pub fn convert_currency(
    value: f64,
    from: String,
    to: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<CurrencyConvertResult, String> {
    let state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    let result = state.exchange_rates.convert_str(value, &from, &to)?;
    let rate = state.exchange_rates.get_rate(&from, &to)?;
    Ok(CurrencyConvertResult {
        result,
        rate,
        last_updated: state.exchange_rates.last_updated.clone(),
    })
}

/// Refresh exchange rates from live API.
/// P0-3: Fetches rates OUTSIDE the Mutex lock to avoid blocking the entire app.
#[tauri::command]
pub async fn refresh_rates(state: State<'_, Mutex<AppState>>) -> Result<String, String> {
    let mut fresh_rates = ExchangeRates::builtin();
    fresh_rates.fetch_live().await?;
    let mut state = state.lock().map_err(|e| format!("State lock error: {e}"))?;
    state.exchange_rates = fresh_rates;
    Ok(state.exchange_rates.last_updated.clone())
}
