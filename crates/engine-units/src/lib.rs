//! # Unit Conversion Engine
//!
//! Self-contained unit conversion with no external dependencies.
//! Supports Length, Mass, Temperature, Volume, Area, Speed, Time, and Data units.

/// Category of unit conversions.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum UnitCategory {
    Length,
    Mass,
    Temperature,
    Volume,
    Area,
    Speed,
    Time,
    Data,
}

impl UnitCategory {
    /// Get all categories.
    pub fn all() -> &'static [UnitCategory] {
        &[
            UnitCategory::Length,
            UnitCategory::Mass,
            UnitCategory::Temperature,
            UnitCategory::Volume,
            UnitCategory::Area,
            UnitCategory::Speed,
            UnitCategory::Time,
            UnitCategory::Data,
        ]
    }

    /// Display name.
    pub fn name(&self) -> &'static str {
        match self {
            Self::Length => "Length",
            Self::Mass => "Mass",
            Self::Temperature => "Temperature",
            Self::Volume => "Volume",
            Self::Area => "Area",
            Self::Speed => "Speed",
            Self::Time => "Time",
            Self::Data => "Data",
        }
    }

    /// Get unit names in this category.
    pub fn units(&self) -> &'static [&'static str] {
        match self {
            Self::Length => &[
                "meter", "kilometer", "centimeter", "millimeter", "mile", "yard",
                "foot", "inch", "nautical_mile",
            ],
            Self::Mass => &[
                "kilogram", "gram", "milligram", "metric_ton", "pound", "ounce",
                "stone",
            ],
            Self::Temperature => &["celsius", "fahrenheit", "kelvin"],
            Self::Volume => &[
                "liter", "milliliter", "gallon_us", "quart_us", "pint_us",
                "cup_us", "fluid_oz_us", "tablespoon", "teaspoon",
                "cubic_meter", "cubic_centimeter",
            ],
            Self::Area => &[
                "square_meter", "square_kilometer", "hectare", "acre",
                "square_foot", "square_inch", "square_mile",
            ],
            Self::Speed => &[
                "meter_per_second", "kilometer_per_hour", "mile_per_hour",
                "knot", "foot_per_second",
            ],
            Self::Time => &[
                "second", "millisecond", "microsecond", "minute", "hour",
                "day", "week", "year",
            ],
            Self::Data => &[
                "bit", "byte", "kilobyte", "megabyte", "gigabyte", "terabyte",
                "kibibyte", "mebibyte", "gibibyte",
            ],
        }
    }
}

/// Convert a value from one unit to another within the same category.
///
/// # Examples
///
/// ```
/// use hc_tapcalc_engine_units::convert;
/// let miles = convert(1.0, "kilometer", "mile").unwrap();
/// assert!((miles - 0.621371).abs() < 0.001);
/// ```
pub fn convert(value: f64, from: &str, to: &str) -> Result<f64, String> {
    let from_lower = from.to_lowercase();
    let to_lower = to.to_lowercase();

    if from_lower == to_lower {
        return Ok(value);
    }

    // Temperature is special (non-linear)
    if is_temperature(&from_lower) || is_temperature(&to_lower) {
        return convert_temperature(value, &from_lower, &to_lower);
    }

    // Linear conversions: convert to SI base unit, then to target
    let from_factor = unit_to_si_factor(&from_lower)?;
    let to_factor = unit_to_si_factor(&to_lower)?;

    Ok(value * from_factor / to_factor)
}

fn is_temperature(unit: &str) -> bool {
    matches!(unit, "celsius" | "fahrenheit" | "kelvin")
}

fn convert_temperature(value: f64, from: &str, to: &str) -> Result<f64, String> {
    // Convert to Celsius first, then to target
    let celsius = match from {
        "celsius" => value,
        "fahrenheit" => (value - 32.0) * 5.0 / 9.0,
        "kelvin" => value - 273.15,
        _ => return Err(format!("Unknown temperature unit: '{from}'")),
    };

    match to {
        "celsius" => Ok(celsius),
        "fahrenheit" => Ok(celsius * 9.0 / 5.0 + 32.0),
        "kelvin" => Ok(celsius + 273.15),
        _ => Err(format!("Unknown temperature unit: '{to}'")),
    }
}

/// Get the factor to convert a unit to its SI base unit.
fn unit_to_si_factor(unit: &str) -> Result<f64, String> {
    let factor = match unit {
        // Length → meters
        "meter" | "m" => 1.0,
        "kilometer" | "km" => 1000.0,
        "centimeter" | "cm" => 0.01,
        "millimeter" | "mm" => 0.001,
        "mile" | "mi" => 1609.344,
        "yard" | "yd" => 0.9144,
        "foot" | "ft" => 0.3048,
        "inch" | "in" => 0.0254,
        "nautical_mile" | "nmi" => 1852.0,

        // Mass → kilograms
        "kilogram" | "kg" => 1.0,
        "gram" | "g" => 0.001,
        "milligram" | "mg" => 1e-6,
        "metric_ton" | "t" => 1000.0,
        "pound" | "lb" => 0.45359237,
        "ounce" | "oz" => 0.02834952,
        "stone" | "st" => 6.35029,

        // Volume → liters
        "liter" | "l" => 1.0,
        "milliliter" | "ml" => 0.001,
        "gallon_us" => 3.78541,
        "quart_us" => 0.946353,
        "pint_us" => 0.473176,
        "cup_us" => 0.236588,
        "fluid_oz_us" | "fl_oz" => 0.0295735,
        "tablespoon" | "tbsp" => 0.0147868,
        "teaspoon" | "tsp" => 0.00492892,
        "cubic_meter" | "m3" => 1000.0,
        "cubic_centimeter" | "cm3" | "cc" => 0.001,

        // Area → square meters
        "square_meter" | "m2" | "sq_m" => 1.0,
        "square_kilometer" | "km2" | "sq_km" => 1e6,
        "hectare" | "ha" => 10000.0,
        "acre" | "ac" => 4046.8564,
        "square_foot" | "sq_ft" | "ft2" => 0.092903,
        "square_inch" | "sq_in" | "in2" => 0.00064516,
        "square_mile" | "sq_mi" | "mi2" => 2.59e6,

        // Speed → m/s
        "meter_per_second" | "m/s" => 1.0,
        "kilometer_per_hour" | "km/h" | "kph" => 1.0 / 3.6,
        "mile_per_hour" | "mph" => 0.44704,
        "knot" | "kn" => 0.514444,
        "foot_per_second" | "ft/s" | "fps" => 0.3048,

        // Time → seconds
        "second" | "s" | "sec" => 1.0,
        "millisecond" | "ms" => 0.001,
        "microsecond" | "us" | "μs" => 1e-6,
        "minute" | "min" => 60.0,
        "hour" | "h" | "hr" => 3600.0,
        "day" | "d" => 86400.0,
        "week" | "wk" => 604800.0,
        "year" | "yr" => 31557600.0, // Julian year

        // Data → bytes
        "bit" | "b" => 0.125,
        "byte" | "B" => 1.0,
        "kilobyte" | "KB" => 1000.0,
        "megabyte" | "MB" => 1e6,
        "gigabyte" | "GB" => 1e9,
        "terabyte" | "TB" => 1e12,
        "kibibyte" | "KiB" => 1024.0,
        "mebibyte" | "MiB" => 1_048_576.0,
        "gibibyte" | "GiB" => 1_073_741_824.0,

        _ => return Err(format!("Unknown unit: '{unit}'")),
    };
    Ok(factor)
}

/// Get the display name for a unit.
pub fn unit_display_name(unit: &str) -> &str {
    match unit {
        "meter" => "m", "kilometer" => "km", "centimeter" => "cm", "millimeter" => "mm",
        "mile" => "mi", "yard" => "yd", "foot" => "ft", "inch" => "in",
        "nautical_mile" => "nmi",
        "kilogram" => "kg", "gram" => "g", "milligram" => "mg", "metric_ton" => "t",
        "pound" => "lb", "ounce" => "oz", "stone" => "st",
        "celsius" => "°C", "fahrenheit" => "°F", "kelvin" => "K",
        "liter" => "L", "milliliter" => "mL", "gallon_us" => "gal",
        "quart_us" => "qt", "pint_us" => "pt", "cup_us" => "cup",
        "fluid_oz_us" => "fl oz", "tablespoon" => "tbsp", "teaspoon" => "tsp",
        "cubic_meter" => "m³", "cubic_centimeter" => "cm³",
        "square_meter" => "m²", "square_kilometer" => "km²", "hectare" => "ha",
        "acre" => "ac", "square_foot" => "ft²", "square_inch" => "in²",
        "square_mile" => "mi²",
        "meter_per_second" => "m/s", "kilometer_per_hour" => "km/h",
        "mile_per_hour" => "mph", "knot" => "kn", "foot_per_second" => "ft/s",
        "second" => "s", "millisecond" => "ms", "microsecond" => "μs",
        "minute" => "min", "hour" => "h", "day" => "d", "week" => "wk", "year" => "yr",
        "bit" => "bit", "byte" => "B", "kilobyte" => "KB", "megabyte" => "MB",
        "gigabyte" => "GB", "terabyte" => "TB", "kibibyte" => "KiB",
        "mebibyte" => "MiB", "gibibyte" => "GiB",
        other => other,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_length_km_to_miles() {
        let result = convert(10.0, "kilometer", "mile").unwrap();
        assert!((result - 6.21371).abs() < 0.001);
    }

    #[test]
    fn test_length_feet_to_meters() {
        let result = convert(1.0, "foot", "meter").unwrap();
        assert!((result - 0.3048).abs() < 0.0001);
    }

    #[test]
    fn test_mass_kg_to_pounds() {
        let result = convert(1.0, "kilogram", "pound").unwrap();
        assert!((result - 2.20462).abs() < 0.001);
    }

    #[test]
    fn test_temperature_c_to_f() {
        let result = convert(100.0, "celsius", "fahrenheit").unwrap();
        assert!((result - 212.0).abs() < 0.01);
    }

    #[test]
    fn test_temperature_f_to_c() {
        let result = convert(32.0, "fahrenheit", "celsius").unwrap();
        assert!(result.abs() < 0.01);
    }

    #[test]
    fn test_temperature_c_to_k() {
        let result = convert(0.0, "celsius", "kelvin").unwrap();
        assert!((result - 273.15).abs() < 0.01);
    }

    #[test]
    fn test_volume_gallon_to_liter() {
        let result = convert(1.0, "gallon_us", "liter").unwrap();
        assert!((result - 3.78541).abs() < 0.001);
    }

    #[test]
    fn test_speed_kph_to_mph() {
        let result = convert(100.0, "kilometer_per_hour", "mile_per_hour").unwrap();
        assert!((result - 62.137).abs() < 0.01);
    }

    #[test]
    fn test_data_gb_to_mb() {
        let result = convert(1.0, "gigabyte", "megabyte").unwrap();
        assert!((result - 1000.0).abs() < 0.01);
    }

    #[test]
    fn test_data_gib_to_mib() {
        let result = convert(1.0, "gibibyte", "mebibyte").unwrap();
        assert!((result - 1024.0).abs() < 0.01);
    }

    #[test]
    fn test_same_unit() {
        let result = convert(42.0, "meter", "meter").unwrap();
        assert_eq!(result, 42.0);
    }

    #[test]
    fn test_unknown_unit() {
        let result = convert(1.0, "foobar", "meter");
        assert!(result.is_err());
    }

    #[test]
    fn test_time_hours_to_minutes() {
        let result = convert(2.0, "hour", "minute").unwrap();
        assert!((result - 120.0).abs() < 0.0001);
    }

    #[test]
    fn test_area_hectare_to_acre() {
        let result = convert(1.0, "hectare", "acre").unwrap();
        assert!((result - 2.47105).abs() < 0.001);
    }
}
