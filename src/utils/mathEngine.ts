/**
 * Extended math expression evaluator — recursive-descent parser supporting:
 * - Arithmetic: + - * / ^ %
 * - Scientific functions: sin, cos, tan, asin, acos, atan, sqrt, cbrt, abs,
 *   log (base10), ln (natural), exp, ceil, floor, round
 * - Constants: pi, e, tau
 * - Variables: any single-letter or named variables via vars map
 * - Implicit multiplication: 2pi, 3x, (2)(3)
 * - Angle mode: DEG or RAD for trig functions
 *
 * Security: No eval/Function — purely recursive descent. Rejects unknown tokens.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export interface EvalOptions {
  /** Variable bindings, e.g. { x: 5, y: 3 } */
  vars?: Record<string, number>;
  /** If true, trig inputs are in degrees (default: true) */
  angleDeg?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

// ── Built-in Functions ────────────────────────────────────────────────────

type MathFn = (x: number, angleDeg: boolean) => number;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

const FUNCTIONS: Record<string, MathFn> = {
  sin: (x, deg) => Math.sin(deg ? toRad(x) : x),
  cos: (x, deg) => Math.cos(deg ? toRad(x) : x),
  tan: (x, deg) => Math.tan(deg ? toRad(x) : x),
  asin: (x, deg) => {
    const r = Math.asin(x);
    return deg ? toDeg(r) : r;
  },
  acos: (x, deg) => {
    const r = Math.acos(x);
    return deg ? toDeg(r) : r;
  },
  atan: (x, deg) => {
    const r = Math.atan(x);
    return deg ? toDeg(r) : r;
  },
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  exp: (x) => Math.exp(x),
  ceil: (x) => Math.ceil(x),
  floor: (x) => Math.floor(x),
  round: (x) => Math.round(x),
};

// ── Parser ────────────────────────────────────────────────────────────────

class Parser {
  private pos = 0;
  private readonly s: string;
  private readonly vars: Record<string, number>;
  private readonly angleDeg: boolean;

  constructor(expr: string, vars: Record<string, number>, angleDeg: boolean) {
    // Normalize: strip whitespace, replace unicode operators
    this.s = expr
      .replace(/\s/g, "")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");
    this.vars = vars;
    this.angleDeg = angleDeg;
  }

  parse(): number {
    const result = this.parseExpr();
    if (this.pos < this.s.length) {
      throw new Error(`Unexpected character: '${this.s[this.pos]}' at position ${this.pos}`);
    }
    return result;
  }

  // expr = term (('+' | '-') term)*
  private parseExpr(): number {
    let result = this.parseTerm();
    while (this.pos < this.s.length && (this.s[this.pos] === "+" || this.s[this.pos] === "-")) {
      const op = this.s[this.pos++];
      const right = this.parseTerm();
      result = op === "+" ? result + right : result - right;
    }
    return result;
  }

  // term = power (('*' | '/' | '%') power)*
  private parseTerm(): number {
    let result = this.parsePower();
    while (
      this.pos < this.s.length &&
      (this.s[this.pos] === "*" || this.s[this.pos] === "/" || this.s[this.pos] === "%")
    ) {
      const op = this.s[this.pos++];
      const right = this.parsePower();
      if (op === "*") result *= right;
      else if (op === "/") result /= right;
      else result %= right;
    }
    return result;
  }

  // power = unary ('^' power)?  — right-associative
  private parsePower(): number {
    const base = this.parseUnary();
    if (this.pos < this.s.length && this.s[this.pos] === "^") {
      this.pos++;
      const exp = this.parsePower(); // right-associative recursion
      return Math.pow(base, exp);
    }
    return base;
  }

  // unary = '-' unary | '+' unary | implicit
  private parseUnary(): number {
    if (this.pos < this.s.length && this.s[this.pos] === "-") {
      this.pos++;
      return -this.parseUnary();
    }
    if (this.pos < this.s.length && this.s[this.pos] === "+") {
      this.pos++;
      return this.parseUnary();
    }
    return this.parseImplicit();
  }

  // implicit = atom (atom)*  — implicit multiplication: 2pi, 3x, (2)(3)
  private parseImplicit(): number {
    let result = this.parseAtom();
    // Look ahead: if next char starts an atom (letter, digit, '('), it's implicit mult
    while (this.pos < this.s.length && this.isImplicitMultStart()) {
      result *= this.parseAtom();
    }
    return result;
  }

  private isImplicitMultStart(): boolean {
    const c = this.s[this.pos];
    // Implicit mult if next is: opening paren, letter (function/var/const)
    // NOT if next is an operator or closing paren
    if (c === "(") return true;
    if (this.isAlpha(c)) return true;
    return false;
  }

  // atom = number | '(' expr ')' | function '(' expr ')' | constant | variable
  private parseAtom(): number {
    // Parenthesized sub-expression
    if (this.pos < this.s.length && this.s[this.pos] === "(") {
      this.pos++; // skip '('
      const result = this.parseExpr();
      if (this.pos < this.s.length && this.s[this.pos] === ")") {
        this.pos++; // skip ')'
      } else {
        throw new Error("Expected closing parenthesis");
      }
      return result;
    }

    // Named identifier: function call, constant, or variable
    if (this.pos < this.s.length && this.isAlpha(this.s[this.pos])) {
      const start = this.pos;
      while (this.pos < this.s.length && this.isAlphaNum(this.s[this.pos])) {
        this.pos++;
      }
      const name = this.s.slice(start, this.pos).toLowerCase();

      // Check for function call: name(arg)
      if (this.pos < this.s.length && this.s[this.pos] === "(") {
        const fn = FUNCTIONS[name];
        if (!fn) throw new Error(`Unknown function: ${name}`);
        this.pos++; // skip '('
        const arg = this.parseExpr();
        if (this.pos < this.s.length && this.s[this.pos] === ")") {
          this.pos++; // skip ')'
        } else {
          throw new Error("Expected closing parenthesis after function argument");
        }
        return fn(arg, this.angleDeg);
      }

      // Check for constant
      if (name in CONSTANTS) return CONSTANTS[name];

      // Check for variable
      if (name in this.vars) return this.vars[name];

      throw new Error(`Unknown identifier: ${name}`);
    }

    // Number (integer or decimal)
    return this.parseNumber();
  }

  private parseNumber(): number {
    const start = this.pos;
    while (
      this.pos < this.s.length &&
      (this.isDigit(this.s[this.pos]) || this.s[this.pos] === ".")
    ) {
      this.pos++;
    }
    if (this.pos === start) {
      const context = this.s.slice(this.pos, this.pos + 10);
      throw new Error(`Expected number at position ${this.pos}: '${context}'`);
    }
    return parseFloat(this.s.slice(start, this.pos));
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }
  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }
  private isAlphaNum(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Evaluate a mathematical expression.
 * @param expr   - The expression string
 * @param opts   - Variables and angle mode
 * @returns The numeric result
 * @throws Error on invalid expressions
 */
export function evaluate(expr: string, opts?: EvalOptions): number {
  if (!expr || !expr.trim()) throw new Error("Empty expression");
  const vars = opts?.vars ?? {};
  const angleDeg = opts?.angleDeg ?? true;
  const parser = new Parser(expr, vars, angleDeg);
  return parser.parse();
}

/**
 * Optimized evaluator for graphing — evaluates expression with x as the variable.
 * Returns NaN instead of throwing for out-of-domain values.
 */
export function evaluateForGraph(
  expr: string,
  x: number,
  angleDeg = true
): number {
  try {
    return evaluate(expr, { vars: { x }, angleDeg });
  } catch {
    return NaN;
  }
}

/**
 * List of available function names for UI display.
 */
export const FUNCTION_NAMES = Object.keys(FUNCTIONS);

/**
 * List of available constant names for UI display.
 */
export const CONSTANT_NAMES = Object.keys(CONSTANTS);
