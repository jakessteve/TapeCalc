import { describe, it, expect } from "vitest";
import { evaluate, evaluateForGraph } from "../mathEngine";

describe("mathEngine — extended math evaluator", () => {
  // ── Basic Arithmetic ──────────────────────────────────────────────────
  describe("basic arithmetic", () => {
    it("adds two integers", () => {
      expect(evaluate("2+3")).toBe(5);
    });
    it("subtracts", () => {
      expect(evaluate("10-4")).toBe(6);
    });
    it("multiplies", () => {
      expect(evaluate("6*7")).toBe(42);
    });
    it("divides", () => {
      expect(evaluate("15/3")).toBe(5);
    });
    it("modulus", () => {
      expect(evaluate("10%3")).toBe(1);
    });
    it("handles decimals", () => {
      expect(evaluate("1.5+2.5")).toBe(4);
    });
  });

  // ── Power Operator ──────────────────────────────────────────────────
  describe("power operator", () => {
    it("basic power", () => {
      expect(evaluate("2^3")).toBe(8);
    });
    it("right-associative: 2^3^2 = 2^(3^2) = 512", () => {
      expect(evaluate("2^3^2")).toBe(512);
    });
    it("power with addition", () => {
      expect(evaluate("2^3+1")).toBe(9);
    });
    it("power of 10", () => {
      expect(evaluate("2^10")).toBe(1024);
    });
  });

  // ── Operator Precedence ───────────────────────────────────────────────
  describe("operator precedence", () => {
    it("multiplies before adding", () => {
      expect(evaluate("2+3*4")).toBe(14);
    });
    it("power before multiply", () => {
      expect(evaluate("2*3^2")).toBe(18);
    });
    it("handles parentheses", () => {
      expect(evaluate("(2+3)*4")).toBe(20);
    });
    it("nested parentheses", () => {
      expect(evaluate("((2+3)*4)+1")).toBe(21);
    });
  });

  // ── Unary Operators ───────────────────────────────────────────────────
  describe("unary operators", () => {
    it("leading negative", () => {
      expect(evaluate("-5")).toBe(-5);
    });
    it("negative in expression", () => {
      expect(evaluate("3*-2")).toBe(-6);
    });
    it("double negative", () => {
      expect(evaluate("--5")).toBe(5);
    });
    it("unary plus", () => {
      expect(evaluate("+5")).toBe(5);
    });
  });

  // ── Scientific Functions ──────────────────────────────────────────────
  describe("scientific functions (DEG mode)", () => {
    it("sin(0) = 0", () => {
      expect(evaluate("sin(0)")).toBeCloseTo(0);
    });
    it("sin(90) = 1 in DEG mode", () => {
      expect(evaluate("sin(90)", { angleDeg: true })).toBeCloseTo(1);
    });
    it("cos(0) = 1", () => {
      expect(evaluate("cos(0)")).toBeCloseTo(1);
    });
    it("cos(180) = -1 in DEG", () => {
      expect(evaluate("cos(180)", { angleDeg: true })).toBeCloseTo(-1);
    });
    it("tan(45) = 1 in DEG", () => {
      expect(evaluate("tan(45)", { angleDeg: true })).toBeCloseTo(1);
    });
    it("sqrt(4) = 2", () => {
      expect(evaluate("sqrt(4)")).toBe(2);
    });
    it("sqrt(144) = 12", () => {
      expect(evaluate("sqrt(144)")).toBe(12);
    });
    it("cbrt(27) = 3", () => {
      expect(evaluate("cbrt(27)")).toBeCloseTo(3);
    });
    it("abs(-42) = 42", () => {
      expect(evaluate("abs(-42)")).toBe(42);
    });
    it("log(100) = 2", () => {
      expect(evaluate("log(100)")).toBeCloseTo(2);
    });
    it("ln(e) = 1", () => {
      expect(evaluate("ln(e)")).toBeCloseTo(1);
    });
    it("exp(0) = 1", () => {
      expect(evaluate("exp(0)")).toBe(1);
    });
    it("ceil(4.2) = 5", () => {
      expect(evaluate("ceil(4.2)")).toBe(5);
    });
    it("floor(4.8) = 4", () => {
      expect(evaluate("floor(4.8)")).toBe(4);
    });
    it("round(4.5) = 5", () => {
      // JS Math.round rounds .5 up
      expect(evaluate("round(4.5)")).toBe(5);
    });
  });

  describe("scientific functions (RAD mode)", () => {
    it("sin(pi/2) = 1 in RAD mode", () => {
      expect(evaluate("sin(pi/2)", { angleDeg: false })).toBeCloseTo(1);
    });
    it("cos(pi) = -1 in RAD mode", () => {
      expect(evaluate("cos(pi)", { angleDeg: false })).toBeCloseTo(-1);
    });
    it("sin(90) ≈ 0.894 in RAD mode (NOT 1)", () => {
      const result = evaluate("sin(90)", { angleDeg: false });
      expect(result).toBeCloseTo(0.8939966636, 4);
    });
  });

  // ── Inverse Trig ──────────────────────────────────────────────────────
  describe("inverse trig functions", () => {
    it("asin(1) = 90 in DEG", () => {
      expect(evaluate("asin(1)", { angleDeg: true })).toBeCloseTo(90);
    });
    it("acos(0) = 90 in DEG", () => {
      expect(evaluate("acos(0)", { angleDeg: true })).toBeCloseTo(90);
    });
    it("atan(1) = 45 in DEG", () => {
      expect(evaluate("atan(1)", { angleDeg: true })).toBeCloseTo(45);
    });
    it("asin(1) = pi/2 in RAD", () => {
      expect(evaluate("asin(1)", { angleDeg: false })).toBeCloseTo(Math.PI / 2);
    });
  });

  // ── Constants ─────────────────────────────────────────────────────────
  describe("constants", () => {
    it("pi ≈ 3.14159", () => {
      expect(evaluate("pi")).toBeCloseTo(Math.PI);
    });
    it("e ≈ 2.71828", () => {
      expect(evaluate("e")).toBeCloseTo(Math.E);
    });
    it("tau = 2*pi", () => {
      expect(evaluate("tau")).toBeCloseTo(Math.PI * 2);
    });
  });

  // ── Variables ─────────────────────────────────────────────────────────
  describe("variables", () => {
    it("evaluates x=5 in expression", () => {
      expect(evaluate("2*x+1", { vars: { x: 5 } })).toBe(11);
    });
    it("evaluates x^2 + 2x + 1 at x=5", () => {
      expect(evaluate("x^2+2*x+1", { vars: { x: 5 } })).toBe(36);
    });
    it("evaluates with multiple variables", () => {
      expect(evaluate("a+b", { vars: { a: 10, b: 20 } })).toBe(30);
    });
    it("throws on unknown variable", () => {
      expect(() => evaluate("z+1")).toThrow();
    });
  });

  // ── Implicit Multiplication ───────────────────────────────────────────
  describe("implicit multiplication", () => {
    it("2pi = 2 * pi", () => {
      expect(evaluate("2pi")).toBeCloseTo(2 * Math.PI);
    });
    it("3x at x=4 = 12", () => {
      expect(evaluate("3x", { vars: { x: 4 } })).toBe(12);
    });
    it("(2)(3) = 6", () => {
      expect(evaluate("(2)(3)")).toBe(6);
    });
  });

  // ── Error Cases ───────────────────────────────────────────────────────
  describe("error handling", () => {
    it("throws on empty string", () => {
      expect(() => evaluate("")).toThrow();
    });
    it("throws on unknown function", () => {
      expect(() => evaluate("foo(5)")).toThrow(/Unknown function/);
    });
    it("throws on trailing operator", () => {
      expect(() => evaluate("5+")).toThrow();
    });
  });

  // ── evaluateForGraph ──────────────────────────────────────────────────
  describe("evaluateForGraph", () => {
    it("evaluates sin(x) at x=0", () => {
      expect(evaluateForGraph("sin(x)", 0)).toBeCloseTo(0);
    });
    it("evaluates x^2 at x=3", () => {
      expect(evaluateForGraph("x^2", 3)).toBe(9);
    });
    it("returns NaN for invalid at specific x", () => {
      expect(evaluateForGraph("sqrt(x)", -1)).toBeNaN();
    });
  });
});
