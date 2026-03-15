import { describe, it, expect } from "vitest";
import {
  formatDisplayNumber,
  formatCalcResult,
  formatTapeValue,
  formatInputExpression,
  parseLeadingOperator,
} from "../formatting";

describe("formatDisplayNumber", () => {
  it("returns empty string for empty input", () => {
    expect(formatDisplayNumber("")).toBe("");
  });

  it("passes through 'Error' strings", () => {
    expect(formatDisplayNumber("Error")).toBe("Error");
    expect(formatDisplayNumber("Error: division")).toBe("Error: division");
  });

  it("passes through '...'", () => {
    expect(formatDisplayNumber("...")).toBe("...");
  });

  it("adds thousand separators", () => {
    expect(formatDisplayNumber("1234567")).toBe("1,234,567");
  });

  it("handles decimal numbers", () => {
    expect(formatDisplayNumber("1234.567")).toBe("1,234.567");
  });

  it("uses scientific notation for very large numbers", () => {
    expect(formatDisplayNumber("1e15")).toMatch(/e\+/);
  });

  it("uses scientific notation for very small numbers", () => {
    expect(formatDisplayNumber("0.0000001")).toMatch(/e-/);
  });

  it("handles Infinity", () => {
    expect(formatDisplayNumber("Infinity")).toBe("∞");
  });

  it("handles -Infinity", () => {
    expect(formatDisplayNumber("-Infinity")).toBe("-∞");
  });

  it("handles zero", () => {
    expect(formatDisplayNumber("0")).toBe("0");
  });
});

describe("formatCalcResult", () => {
  it("returns empty string for empty input", () => {
    expect(formatCalcResult("")).toBe("");
  });

  it("passes through error strings", () => {
    expect(formatCalcResult("Error")).toBe("Error");
  });

  it("does not add thousand separators (for display consistency)", () => {
    // formatCalcResult uses toPrecision without localeString
    const result = formatCalcResult("1234567");
    expect(result).not.toContain(",");
  });

  it("handles Infinity", () => {
    expect(formatCalcResult("Infinity")).toBe("∞");
  });

  it("handles negative Infinity", () => {
    expect(formatCalcResult("-Infinity")).toBe("-∞");
  });

  it("cleans trailing zeros from decimal results", () => {
    const result = formatCalcResult("5.000");
    expect(result).toBe("5");
  });
});

describe("formatTapeValue", () => {
  it("formats with 2 decimal places", () => {
    expect(formatTapeValue("536")).toBe("536.00");
  });

  it("adds thousand separators", () => {
    expect(formatTapeValue("4824")).toBe("4,824.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatTapeValue("0.70710678")).toBe("0.71");
  });

  it("handles zero", () => {
    expect(formatTapeValue("0")).toBe("0.00");
  });

  it("handles negative numbers", () => {
    expect(formatTapeValue("-320")).toBe("-320.00");
  });

  it("passes through non-numeric values", () => {
    expect(formatTapeValue("NaN")).toBe("NaN");
  });

  it("strips existing commas before formatting", () => {
    expect(formatTapeValue("4,824")).toBe("4,824.00");
  });
});

describe("formatInputExpression", () => {
  it("adds commas to numbers in expression", () => {
    expect(formatInputExpression("1234+5678")).toBe("1,234+5,678");
  });

  it("preserves decimal places", () => {
    expect(formatInputExpression("3.14")).toBe("3.14");
  });

  it("handles expression with operators", () => {
    const result = formatInputExpression("1000000*2");
    expect(result).toBe("1,000,000*2");
  });

  it("handles empty string", () => {
    expect(formatInputExpression("")).toBe("");
  });
});

describe("parseLeadingOperator", () => {
  it("parses addition", () => {
    const result = parseLeadingOperator("+100");
    expect(result.operator).toBe("+");
    expect(result.operatorClass).toBe("op-add");
    expect(result.rest).toBe("100");
  });

  it("parses subtraction with minus sign", () => {
    const result = parseLeadingOperator("-50");
    expect(result.operator).toBe("−");
    expect(result.operatorClass).toBe("op-sub");
    expect(result.rest).toBe("50");
  });

  it("parses subtraction with unicode minus", () => {
    const result = parseLeadingOperator("−50");
    expect(result.operator).toBe("−");
    expect(result.operatorClass).toBe("op-sub");
  });

  it("parses multiplication with ×", () => {
    const result = parseLeadingOperator("×9");
    expect(result.operator).toBe("×");
    expect(result.operatorClass).toBe("op-mul");
    expect(result.rest).toBe("9");
  });

  it("parses multiplication with *", () => {
    const result = parseLeadingOperator("*9");
    expect(result.operator).toBe("×");
    expect(result.operatorClass).toBe("op-mul");
  });

  it("parses division with ÷", () => {
    const result = parseLeadingOperator("÷12");
    expect(result.operator).toBe("÷");
    expect(result.operatorClass).toBe("op-div");
  });

  it("parses division with /", () => {
    const result = parseLeadingOperator("/12");
    expect(result.operator).toBe("÷");
    expect(result.operatorClass).toBe("op-div");
  });

  it("returns empty operator for plain numbers", () => {
    const result = parseLeadingOperator("856");
    expect(result.operator).toBe("");
    expect(result.operatorClass).toBe("");
    expect(result.rest).toBe("856");
  });

  it("trims leading whitespace", () => {
    const result = parseLeadingOperator("  +100");
    expect(result.operator).toBe("+");
    expect(result.rest).toBe("100");
  });
});
