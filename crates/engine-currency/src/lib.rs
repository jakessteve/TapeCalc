//! # Currency Conversion Engine
//!
//! Provides currency conversion using cached exchange rates.
//! Supports live rate fetching from open.er-api.com with offline fallback.
//! Dynamically supports ALL currencies returned by the API.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Currency info returned to the frontend.
#[derive(Debug, Clone, Serialize)]
pub struct CurrencyEntry {
    pub code: String,
    pub name: String,
    pub symbol: String,
    pub flag: String,
}

/// Well-known currency metadata (name, symbol, flag).
/// Used for display; unknown currencies get generic defaults.
fn known_currency_meta(code: &str) -> (&'static str, &'static str, &'static str) {
    match code {
        "AED" => ("UAE Dirham", "د.إ", "🇦🇪"),
        "AFN" => ("Afghan Afghani", "؋", "🇦🇫"),
        "ALL" => ("Albanian Lek", "L", "🇦🇱"),
        "AMD" => ("Armenian Dram", "֏", "🇦🇲"),
        "ANG" => ("Netherlands Antillean Guilder", "ƒ", "🇨🇼"),
        "AOA" => ("Angolan Kwanza", "Kz", "🇦🇴"),
        "ARS" => ("Argentine Peso", "$", "🇦🇷"),
        "AUD" => ("Australian Dollar", "A$", "🇦🇺"),
        "AWG" => ("Aruban Florin", "ƒ", "🇦🇼"),
        "AZN" => ("Azerbaijani Manat", "₼", "🇦🇿"),
        "BAM" => ("Bosnia-Herzegovina Mark", "KM", "🇧🇦"),
        "BBD" => ("Barbadian Dollar", "Bds$", "🇧🇧"),
        "BDT" => ("Bangladeshi Taka", "৳", "🇧🇩"),
        "BGN" => ("Bulgarian Lev", "лв", "🇧🇬"),
        "BHD" => ("Bahraini Dinar", ".د.ب", "🇧🇭"),
        "BIF" => ("Burundian Franc", "FBu", "🇧🇮"),
        "BMD" => ("Bermudan Dollar", "$", "🇧🇲"),
        "BND" => ("Brunei Dollar", "B$", "🇧🇳"),
        "BOB" => ("Bolivian Boliviano", "Bs.", "🇧🇴"),
        "BRL" => ("Brazilian Real", "R$", "🇧🇷"),
        "BSD" => ("Bahamian Dollar", "$", "🇧🇸"),
        "BTN" => ("Bhutanese Ngultrum", "Nu.", "🇧🇹"),
        "BWP" => ("Botswanan Pula", "P", "🇧🇼"),
        "BYN" => ("Belarusian Ruble", "Br", "🇧🇾"),
        "BZD" => ("Belize Dollar", "BZ$", "🇧🇿"),
        "CAD" => ("Canadian Dollar", "C$", "🇨🇦"),
        "CDF" => ("Congolese Franc", "FC", "🇨🇩"),
        "CHF" => ("Swiss Franc", "CHF", "🇨🇭"),
        "CLP" => ("Chilean Peso", "$", "🇨🇱"),
        "CNY" => ("Chinese Yuan", "¥", "🇨🇳"),
        "COP" => ("Colombian Peso", "$", "🇨🇴"),
        "CRC" => ("Costa Rican Colón", "₡", "🇨🇷"),
        "CUP" => ("Cuban Peso", "₱", "🇨🇺"),
        "CVE" => ("Cape Verdean Escudo", "$", "🇨🇻"),
        "CZK" => ("Czech Koruna", "Kč", "🇨🇿"),
        "DJF" => ("Djiboutian Franc", "Fdj", "🇩🇯"),
        "DKK" => ("Danish Krone", "kr", "🇩🇰"),
        "DOP" => ("Dominican Peso", "RD$", "🇩🇴"),
        "DZD" => ("Algerian Dinar", "د.ج", "🇩🇿"),
        "EGP" => ("Egyptian Pound", "£", "🇪🇬"),
        "ERN" => ("Eritrean Nakfa", "Nfk", "🇪🇷"),
        "ETB" => ("Ethiopian Birr", "Br", "🇪🇹"),
        "EUR" => ("Euro", "€", "🇪🇺"),
        "FJD" => ("Fijian Dollar", "FJ$", "🇫🇯"),
        "FKP" => ("Falkland Islands Pound", "£", "🇫🇰"),
        "FOK" => ("Faroese Króna", "kr", "🇫🇴"),
        "GBP" => ("British Pound", "£", "🇬🇧"),
        "GEL" => ("Georgian Lari", "₾", "🇬🇪"),
        "GGP" => ("Guernsey Pound", "£", "🇬🇬"),
        "GHS" => ("Ghanaian Cedi", "₵", "🇬🇭"),
        "GIP" => ("Gibraltar Pound", "£", "🇬🇮"),
        "GMD" => ("Gambian Dalasi", "D", "🇬🇲"),
        "GNF" => ("Guinean Franc", "FG", "🇬🇳"),
        "GTQ" => ("Guatemalan Quetzal", "Q", "🇬🇹"),
        "GYD" => ("Guyanaese Dollar", "G$", "🇬🇾"),
        "HKD" => ("Hong Kong Dollar", "HK$", "🇭🇰"),
        "HNL" => ("Honduran Lempira", "L", "🇭🇳"),
        "HRK" => ("Croatian Kuna", "kn", "🇭🇷"),
        "HTG" => ("Haitian Gourde", "G", "🇭🇹"),
        "HUF" => ("Hungarian Forint", "Ft", "🇭🇺"),
        "IDR" => ("Indonesian Rupiah", "Rp", "🇮🇩"),
        "ILS" => ("Israeli Shekel", "₪", "🇮🇱"),
        "IMP" => ("Isle of Man Pound", "£", "🇮🇲"),
        "INR" => ("Indian Rupee", "₹", "🇮🇳"),
        "IQD" => ("Iraqi Dinar", "ع.د", "🇮🇶"),
        "IRR" => ("Iranian Rial", "﷼", "🇮🇷"),
        "ISK" => ("Icelandic Króna", "kr", "🇮🇸"),
        "JEP" => ("Jersey Pound", "£", "🇯🇪"),
        "JMD" => ("Jamaican Dollar", "J$", "🇯🇲"),
        "JOD" => ("Jordanian Dinar", "د.ا", "🇯🇴"),
        "JPY" => ("Japanese Yen", "¥", "🇯🇵"),
        "KES" => ("Kenyan Shilling", "KSh", "🇰🇪"),
        "KGS" => ("Kyrgystani Som", "сом", "🇰🇬"),
        "KHR" => ("Cambodian Riel", "៛", "🇰🇭"),
        "KID" => ("Kiribati Dollar", "$", "🇰🇮"),
        "KMF" => ("Comorian Franc", "CF", "🇰🇲"),
        "KRW" => ("South Korean Won", "₩", "🇰🇷"),
        "KWD" => ("Kuwaiti Dinar", "د.ك", "🇰🇼"),
        "KYD" => ("Cayman Islands Dollar", "CI$", "🇰🇾"),
        "KZT" => ("Kazakhstani Tenge", "₸", "🇰🇿"),
        "LAK" => ("Laotian Kip", "₭", "🇱🇦"),
        "LBP" => ("Lebanese Pound", "ل.ل", "🇱🇧"),
        "LKR" => ("Sri Lankan Rupee", "Rs", "🇱🇰"),
        "LRD" => ("Liberian Dollar", "L$", "🇱🇷"),
        "LSL" => ("Lesotho Loti", "L", "🇱🇸"),
        "LYD" => ("Libyan Dinar", "ل.د", "🇱🇾"),
        "MAD" => ("Moroccan Dirham", "د.م.", "🇲🇦"),
        "MDL" => ("Moldovan Leu", "L", "🇲🇩"),
        "MGA" => ("Malagasy Ariary", "Ar", "🇲🇬"),
        "MKD" => ("Macedonian Denar", "ден", "🇲🇰"),
        "MMK" => ("Myanmar Kyat", "K", "🇲🇲"),
        "MNT" => ("Mongolian Tugrik", "₮", "🇲🇳"),
        "MOP" => ("Macanese Pataca", "MOP$", "🇲🇴"),
        "MRU" => ("Mauritanian Ouguiya", "UM", "🇲🇷"),
        "MUR" => ("Mauritian Rupee", "₨", "🇲🇺"),
        "MVR" => ("Maldivian Rufiyaa", "Rf", "🇲🇻"),
        "MWK" => ("Malawian Kwacha", "MK", "🇲🇼"),
        "MXN" => ("Mexican Peso", "MX$", "🇲🇽"),
        "MYR" => ("Malaysian Ringgit", "RM", "🇲🇾"),
        "MZN" => ("Mozambican Metical", "MT", "🇲🇿"),
        "NAD" => ("Namibian Dollar", "N$", "🇳🇦"),
        "NGN" => ("Nigerian Naira", "₦", "🇳🇬"),
        "NIO" => ("Nicaraguan Córdoba", "C$", "🇳🇮"),
        "NOK" => ("Norwegian Krone", "kr", "🇳🇴"),
        "NPR" => ("Nepalese Rupee", "₨", "🇳🇵"),
        "NZD" => ("New Zealand Dollar", "NZ$", "🇳🇿"),
        "OMR" => ("Omani Rial", "ر.ع.", "🇴🇲"),
        "PAB" => ("Panamanian Balboa", "B/.", "🇵🇦"),
        "PEN" => ("Peruvian Sol", "S/.", "🇵🇪"),
        "PGK" => ("Papua New Guinean Kina", "K", "🇵🇬"),
        "PHP" => ("Philippine Peso", "₱", "🇵🇭"),
        "PKR" => ("Pakistani Rupee", "₨", "🇵🇰"),
        "PLN" => ("Polish Zloty", "zł", "🇵🇱"),
        "PYG" => ("Paraguayan Guarani", "₲", "🇵🇾"),
        "QAR" => ("Qatari Rial", "ر.ق", "🇶🇦"),
        "RON" => ("Romanian Leu", "lei", "🇷🇴"),
        "RSD" => ("Serbian Dinar", "din.", "🇷🇸"),
        "RUB" => ("Russian Ruble", "₽", "🇷🇺"),
        "RWF" => ("Rwandan Franc", "RF", "🇷🇼"),
        "SAR" => ("Saudi Riyal", "ر.س", "🇸🇦"),
        "SBD" => ("Solomon Islands Dollar", "SI$", "🇸🇧"),
        "SCR" => ("Seychellois Rupee", "₨", "🇸🇨"),
        "SDG" => ("Sudanese Pound", "ج.س.", "🇸🇩"),
        "SEK" => ("Swedish Krona", "kr", "🇸🇪"),
        "SGD" => ("Singapore Dollar", "S$", "🇸🇬"),
        "SHP" => ("Saint Helena Pound", "£", "🇸🇭"),
        "SLE" => ("Sierra Leonean Leone", "Le", "🇸🇱"),
        "SOS" => ("Somali Shilling", "Sh", "🇸🇴"),
        "SRD" => ("Surinamese Dollar", "Sr$", "🇸🇷"),
        "SSP" => ("South Sudanese Pound", "£", "🇸🇸"),
        "STN" => ("São Tomé & Príncipe Dobra", "Db", "🇸🇹"),
        "SYP" => ("Syrian Pound", "£", "🇸🇾"),
        "SZL" => ("Swazi Lilangeni", "E", "🇸🇿"),
        "THB" => ("Thai Baht", "฿", "🇹🇭"),
        "TJS" => ("Tajikistani Somoni", "SM", "🇹🇯"),
        "TMT" => ("Turkmenistani Manat", "T", "🇹🇲"),
        "TND" => ("Tunisian Dinar", "د.ت", "🇹🇳"),
        "TOP" => ("Tongan Paʻanga", "T$", "🇹🇴"),
        "TRY" => ("Turkish Lira", "₺", "🇹🇷"),
        "TTD" => ("Trinidad & Tobago Dollar", "TT$", "🇹🇹"),
        "TVD" => ("Tuvaluan Dollar", "$", "🇹🇻"),
        "TWD" => ("New Taiwan Dollar", "NT$", "🇹🇼"),
        "TZS" => ("Tanzanian Shilling", "TSh", "🇹🇿"),
        "UAH" => ("Ukrainian Hryvnia", "₴", "🇺🇦"),
        "UGX" => ("Ugandan Shilling", "USh", "🇺🇬"),
        "USD" => ("US Dollar", "$", "🇺🇸"),
        "UYU" => ("Uruguayan Peso", "$U", "🇺🇾"),
        "UZS" => ("Uzbekistani Som", "сўм", "🇺🇿"),
        "VES" => ("Venezuelan Bolívar", "Bs.S", "🇻🇪"),
        "VND" => ("Vietnamese Dong", "₫", "🇻🇳"),
        "VUV" => ("Vanuatu Vatu", "VT", "🇻🇺"),
        "WST" => ("Samoan Tala", "WS$", "🇼🇸"),
        "XAF" => ("CFA Franc BEAC", "FCFA", "🇨🇲"),
        "XCD" => ("East Caribbean Dollar", "EC$", "🇦🇬"),
        "XDR" => ("Special Drawing Rights", "SDR", "🏳️"),
        "XOF" => ("CFA Franc BCEAO", "CFA", "🇸🇳"),
        "XPF" => ("CFP Franc", "₣", "🇵🇫"),
        "YER" => ("Yemeni Rial", "﷼", "🇾🇪"),
        "ZAR" => ("South African Rand", "R", "🇿🇦"),
        "ZMW" => ("Zambian Kwacha", "ZK", "🇿🇲"),
        "ZWL" => ("Zimbabwean Dollar", "Z$", "🇿🇼"),
        _ => ("", "", "🏳️"),
    }
}

// ─── API Response Types ──────────────────────────────────────────────────────

/// JSON shape from open.er-api.com
#[derive(Deserialize)]
struct ApiResponse {
    result: String,
    rates: HashMap<String, f64>,
}

// ─── Exchange Rate Store ─────────────────────────────────────────────────────

/// Exchange rate store — supports ALL currencies from the API.
/// Rates are stored as `1 USD = x units of currency`.
pub struct ExchangeRates {
    /// Rates keyed by currency code string.
    rates: HashMap<String, f64>,
    /// Timestamp of last update.
    pub last_updated: String,
}

/// Default offline currencies with approximate rates (Mar 2026).
const BUILTIN_RATES: &[(&str, f64)] = &[
    ("USD", 1.0),
    ("EUR", 0.92),
    ("GBP", 0.79),
    ("JPY", 149.5),
    ("CNY", 7.24),
    ("VND", 25_385.0),
    ("KRW", 1_330.0),
    ("AUD", 1.54),
    ("CAD", 1.36),
    ("CHF", 0.88),
    ("SGD", 1.34),
    ("HKD", 7.82),
    ("MXN", 17.15),
    ("BRL", 4.97),
    ("INR", 83.1),
    ("RUB", 91.5),
    ("THB", 35.2),
    ("MYR", 4.72),
    ("PHP", 56.3),
    ("IDR", 15_650.0),
];

impl ExchangeRates {
    /// Create with static built-in rates (approximate as of Mar 2026).
    pub fn builtin() -> Self {
        let rates: HashMap<String, f64> = BUILTIN_RATES
            .iter()
            .map(|(code, rate)| (code.to_string(), *rate))
            .collect();

        Self {
            rates,
            last_updated: "Built-in (offline)".to_string(),
        }
    }

    /// Fetch live rates from open.er-api.com (async).
    /// Stores ALL currencies returned by the API.
    pub async fn fetch_live(&mut self) -> Result<(), String> {
        let url = "https://open.er-api.com/v6/latest/USD";

        let response = reqwest::get(url)
            .await
            .map_err(|e| format!("Network error: {e}"))?;

        let api: ApiResponse = response
            .json()
            .await
            .map_err(|e| format!("Parse error: {e}"))?;

        if api.result != "success" {
            return Err("API returned non-success result".to_string());
        }

        // Store ALL rates from API — not just known ones
        self.rates = api.rates;

        // Update timestamp
        let now = chrono_simple_timestamp();
        self.last_updated = format!("Live — {now}");

        Ok(())
    }

    /// Get all available currencies as display entries.
    pub fn available_currencies(&self) -> Vec<CurrencyEntry> {
        let mut entries: Vec<CurrencyEntry> = self
            .rates
            .keys()
            .map(|code| {
                let (name, symbol, flag) = known_currency_meta(code);
                CurrencyEntry {
                    code: code.clone(),
                    name: if name.is_empty() {
                        code.clone()
                    } else {
                        name.to_string()
                    },
                    symbol: if symbol.is_empty() {
                        code.clone()
                    } else {
                        symbol.to_string()
                    },
                    flag: flag.to_string(),
                }
            })
            .collect();
        entries.sort_by(|a, b| a.code.cmp(&b.code));
        entries
    }

    /// Convert between currencies using string codes.
    pub fn convert_str(&self, value: f64, from: &str, to: &str) -> Result<f64, String> {
        let from_rate = self
            .rates
            .get(from)
            .ok_or_else(|| format!("Unknown currency: '{from}'"))?;
        let to_rate = self
            .rates
            .get(to)
            .ok_or_else(|| format!("Unknown currency: '{to}'"))?;

        // Convert: value in FROM → USD → TO
        let usd_value = value / from_rate;
        Ok(usd_value * to_rate)
    }

    /// Get the rate for a specific currency pair.
    pub fn get_rate(&self, from: &str, to: &str) -> Result<f64, String> {
        self.convert_str(1.0, from, to)
    }
}

/// Simple timestamp without pulling in chrono crate.
fn chrono_simple_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let days = secs / 86400;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let (year, month, day) = days_to_date(days);
    format!("{year:04}-{month:02}-{day:02} {hours:02}:{minutes:02} UTC")
}

fn days_to_date(days_since_epoch: u64) -> (u64, u64, u64) {
    let z = days_since_epoch + 719468;
    let era = z / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_usd_to_eur() {
        let rates = ExchangeRates::builtin();
        let result = rates.convert_str(100.0, "USD", "EUR").unwrap();
        assert!((result - 92.0).abs() < 0.1);
    }

    #[test]
    fn test_usd_to_vnd() {
        let rates = ExchangeRates::builtin();
        let result = rates.convert_str(1.0, "USD", "VND").unwrap();
        assert!((result - 25385.0).abs() < 1.0);
    }

    #[test]
    fn test_eur_to_gbp() {
        let rates = ExchangeRates::builtin();
        let result = rates.convert_str(100.0, "EUR", "GBP").unwrap();
        let expected = 100.0 / 0.92 * 0.79;
        assert!((result - expected).abs() < 0.1);
    }

    #[test]
    fn test_roundtrip() {
        let rates = ExchangeRates::builtin();
        let converted = rates.convert_str(100.0, "USD", "JPY").unwrap();
        let back = rates.convert_str(converted, "JPY", "USD").unwrap();
        assert!((back - 100.0).abs() < 0.01);
    }

    #[test]
    fn test_unknown_currency() {
        let rates = ExchangeRates::builtin();
        assert!(rates.convert_str(1.0, "XYZ", "USD").is_err());
    }

    #[test]
    fn test_same_currency() {
        let rates = ExchangeRates::builtin();
        let result = rates.convert_str(42.0, "USD", "USD").unwrap();
        assert!((result - 42.0).abs() < 0.001);
    }

    #[test]
    fn test_get_rate() {
        let rates = ExchangeRates::builtin();
        let rate = rates.get_rate("USD", "EUR").unwrap();
        assert!((rate - 0.92).abs() < 0.01);
    }

    #[test]
    fn test_available_currencies() {
        let rates = ExchangeRates::builtin();
        let currencies = rates.available_currencies();
        assert_eq!(currencies.len(), 20); // builtin has 20
        assert!(currencies.iter().any(|c| c.code == "USD"));
        assert!(currencies.iter().any(|c| c.code == "VND"));
    }

    #[test]
    fn test_known_meta() {
        let (name, symbol, flag) = known_currency_meta("VND");
        assert_eq!(name, "Vietnamese Dong");
        assert_eq!(symbol, "₫");
        assert_eq!(flag, "🇻🇳");
    }
}
