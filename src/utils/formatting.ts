/**
 * Shared number-formatting utilities for tape and display values.
 *
 * Previously duplicated across CalculatorPanel and TapePanel — now centralized
 * here so formatting behavior is consistent across the app.
 */

/**
 * Format a numeric result string for display (tape entries or calculator result).
 * - Adds thousand separators for large numbers
 * - Limits decimal places for readability
 * - Handles special values (Infinity, NaN, Error)
 */
export function formatDisplayNumber(value: string): string {
  // Pass through non-numeric/special values
  if (!value || value === "Error" || value === "..." || value.startsWith("Error")) {
    return value;
  }

  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (!isFinite(num)) return num > 0 ? "∞" : "-∞";

  // Scientific notation for very large/small numbers
  if (Math.abs(num) >= 1e12) return num.toExponential(6);
  if (Math.abs(num) < 0.000001 && num !== 0) return num.toExponential(6);

  // Format with thousand separators
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
  });
}

/**
 * Format a numeric result for the main calculator display.
 * Slightly different from tape: no thousand separators to keep the display
 * consistent with what the user types.
 */
export function formatCalcResult(value: string): string {
  if (!value || value === "Error" || value === "..." || value.startsWith("Error")) {
    return value;
  }

  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (!isFinite(num)) return num > 0 ? "∞" : "-∞";

  // Scientific notation for extreme values
  if (Math.abs(num) >= 1e15) return num.toExponential(6);
  if (Math.abs(num) < 0.000001 && num !== 0) return num.toExponential(6);

  // Clean trailing zeros for nice display
  const formatted = num.toPrecision(15);
  return parseFloat(formatted).toString();
}

/**
 * Detect the leading operator in a tape expression string.
 * Returns the operator character and the remaining expression.
 */
/**
 * Format a result string in CalcTape style: 2 decimal places, comma separators.
 * Used for tape entry values and grand total.
 */
export function formatTapeValue(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  const num = Number(cleaned);
  if (Number.isNaN(num) || !Number.isFinite(num)) return raw;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format the expression line: add comma separators to number sequences.
 * Used for the calculator display's expression input.
 */
export function formatInputExpression(expr: string): string {
  return expr.replace(/(\d[\d,]*\.?\d*)/g, (match) => {
    const cleaned = match.replace(/,/g, "");
    const num = Number(cleaned);
    if (Number.isNaN(num)) return match;
    const decParts = cleaned.split(".");
    if (decParts.length > 1) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: decParts[1].length,
        maximumFractionDigits: decParts[1].length,
      });
    }
    return num.toLocaleString("en-US");
  });
}

export function parseLeadingOperator(input: string): {
  operator: string;
  operatorClass: string;
  rest: string;
} {
  const trimmed = input.trimStart();
  const firstChar = trimmed[0];
  switch (firstChar) {
    case "+":
      return { operator: "+", operatorClass: "op-add", rest: trimmed.slice(1).trimStart() };
    case "-":
    case "−":
      return { operator: "−", operatorClass: "op-sub", rest: trimmed.slice(1).trimStart() };
    case "*":
    case "×":
      return { operator: "×", operatorClass: "op-mul", rest: trimmed.slice(1).trimStart() };
    case "/":
    case "÷":
      return { operator: "÷", operatorClass: "op-div", rest: trimmed.slice(1).trimStart() };
    default:
      return { operator: "", operatorClass: "", rest: trimmed };
  }
}
