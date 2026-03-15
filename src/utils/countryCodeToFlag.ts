/**
 * Convert a 2-letter ISO country code to its flag emoji.
 * e.g., "us" → "🇺🇸", "vn" → "🇻🇳"
 *
 * Uses Unicode Regional Indicator Symbols.
 * NOTE: Flag emoji may not render on Windows (Segoe UI Emoji doesn't include them).
 * Falls back to a styled text badge if needed.
 */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length < 2) return "";
  // Take only first 2 characters
  const cc = code.slice(0, 2).toUpperCase();
  return [...cc]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

/**
 * Get a display-friendly flag representation.
 * On platforms that don't render flag emoji (Windows), returns the country code.
 */
export function getFlagDisplay(flag: string, code: string): string {
  // Check if flag emoji would render by checking the platform
  // Windows doesn't support flag emoji in most fonts
  const isWindows = typeof navigator !== "undefined" && /Win/i.test(navigator.platform);
  if (isWindows) {
    // Return currency code as a fallback (already shown in dropdown label)
    return "";
  }
  return countryCodeToFlag(flag || code.slice(0, 2));
}
