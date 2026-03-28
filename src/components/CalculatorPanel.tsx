import { useState, useRef, useEffect, memo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Delete, 
  FlaskConical, 
  Binary,
  Percent,
  Divide,
  X,
  Minus,
  Plus,
  Equal
} from "lucide-react";
import { formatDisplayNumber, formatInputExpression } from "../utils/formatting";
import type { KeypadLayout } from "../hooks/useSettings";

interface CalculatorPanelProps {
  input: string;
  result: string;
  hasError: boolean;
  angleUnit: string;
  memory: string;
  keypadLayout?: KeypadLayout;
  onPress: (key: string) => void;
}

type BtnVariant = "digit" | "op" | "action" | "equal" | "func" | "mem";

const VARIANT_CLASS: Record<BtnVariant, string> = {
  digit: "calc-btn calc-btn--digit",
  op: "calc-btn calc-btn--op",
  action: "calc-btn calc-btn--action",
  equal: "calc-btn calc-btn--equal",
  func: "calc-btn calc-btn--func",
  mem: "calc-btn calc-btn--mem",
};

function CalcBtn({
  label,
  icon: Icon,
  variant = "digit",
  onClick,
  span = 1,
  title,
  ariaLabel,
}: {
  label?: string | React.ReactNode;
  icon?: React.ElementType;
  variant?: BtnVariant;
  onClick: () => void;
  span?: number;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      className={VARIANT_CLASS[variant]}
      style={{
        gridColumn: span > 1 ? `span ${span}` : undefined,
      }}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title || (typeof label === 'string' ? label : '')}
    >
      {Icon ? <Icon size={variant === 'equal' ? 24 : 18} strokeWidth={2.5} /> : label}
    </button>
  );
}

/** P1-10: Smart bracket insertion — detects context and inserts ( or ) */
function getSmartBracket(input: string): string {
  let open = 0;
  for (const ch of input) {
    if (ch === "(") open++;
    else if (ch === ")") open--;
  }
  // If there are unmatched open brackets, close them
  if (open > 0) {
    // Only close if the last char is a digit, ), or letter (not an operator)
    const lastChar = input.slice(-1);
    if (lastChar && /[\d.)%a-zA-Z]/.test(lastChar)) {
      return ")";
    }
  }
  return "(";
}

export const CalculatorPanel = memo(function CalculatorPanel({
  input,
  result,
  hasError,
  angleUnit,
  memory,
  keypadLayout,
  onPress: originalOnPress,
}: CalculatorPanelProps) {
  const [showSci, setShowSci] = useState(false);
  const [sciPage, setSciPage] = useState(0);
  const [sciRowsPerPage, setSciRowsPerPage] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // All 6 scientific rows as data
  const sciRows = [
    keypadLayout === "Financial" ? [
      { label: "TAX+", press: "*1.2", aria: "Add 20% Tax" },
      { label: "TAX-", press: "/1.2", aria: "Subtract 20% Tax" },
      { label: "MRG%", press: "*1.5", aria: "Add 50% Margin" },
      { label: "√", press: "sqrt", aria: "Square root" },
    ] : [
      { label: "sin", press: "sin", aria: "Sine" },
      { label: "cos", press: "cos", aria: "Cosine" },
      { label: "tan", press: "tan", aria: "Tangent" },
      { label: "√", press: "sqrt", aria: "Square root" },
    ],
    [
      { label: "sin⁻¹", press: "asin", aria: "Arcsine" },
      { label: "cos⁻¹", press: "acos", aria: "Arccosine" },
      { label: "tan⁻¹", press: "atan", aria: "Arctangent" },
      { label: "xⁿ", press: "^", aria: "Power" },
    ],
    [
      { label: "x²", press: "^2", aria: "Square" },
      { label: "eˣ", press: "exp", aria: "Exponential" },
      { label: "( )", press: "BRACKET", aria: "Brackets" },
      { label: "%", press: "%", aria: "Modulo" },
    ],
    [
      { label: "ln", press: "ln", aria: "Natural logarithm" },
      { label: "log", press: "log", aria: "Base-10 logarithm" },
      { label: "abs", press: "abs", aria: "Absolute value" },
      { label: "!", press: "!", aria: "Factorial" },
    ],
    [
      { label: "π", press: "pi", aria: "Pi" },
      { label: "e", press: "e", aria: "Euler's number" },
      { label: "1/x", press: "1/", aria: "Reciprocal" },
      { label: "mod", press: "mod", aria: "Modulus" },
    ],
    [
      { label: "sinh", press: "sinh", aria: "Hyperbolic sine" },
      { label: "cosh", press: "cosh", aria: "Hyperbolic cosine" },
      { label: "tanh", press: "tanh", aria: "Hyperbolic tangent" },
      { label: "Rand", press: "rand", aria: "Random number" },
    ],
  ];

  const onPress = (key: string) => {
    if (key === "*1.2" || key === "/1.2" || key === "*1.5") {
      for (const char of key) {
        originalOnPress(char);
      }
      originalOnPress("=");
      return;
    }
    originalOnPress(key);
  };

  const totalSciPages = Math.ceil(sciRows.length / sciRowsPerPage);
  const currentPageRows = sciRows.slice(
    sciPage * sciRowsPerPage,
    sciPage * sciRowsPerPage + sciRowsPerPage
  );

  // Clamp page if rowsPerPage changes
  useEffect(() => {
    const maxPage = Math.ceil(sciRows.length / sciRowsPerPage) - 1;
    if (sciPage > maxPage) setSciPage(maxPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sciRowsPerPage, sciPage]);

  // Measure container height and determine rows per page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const h = el.clientHeight;
      // Adjusted constants for improved layout spacing
      // Display ~120px, memory ~48px, main grid 5 rows ~240px, nav ~40px, gaps ~32px = ~480px
      const availableForSci = h - 480;
      const rowHeight = 44; 
      const fitRows = Math.floor(availableForSci / rowHeight);
      setSciRowsPerPage(fitRows >= 3 ? 3 : 2);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleBracket = () => {
    const bracket = getSmartBracket(input);
    onPress(bracket);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 panel-bg flex-1 min-h-0"
      style={{
        minWidth: "260px",
        padding: "var(--space-lg)",
        overflowY: "auto",
      }}
    >
      {/* Display area */}
      <div className={`display-card ${hasError ? 'display-card--error' : ''}`} role="status" aria-live="polite">
        <div className="flex items-center justify-between mb-2">
          {/* Mode tabs + memory badge */}
          <div className="flex items-center gap-1.5">
            <div className="mode-tabs" role="group" aria-label="Calculator modes">
              <button
                onClick={() => onPress("ANGLE")}
                className="mode-tab mode-tab--active"
                aria-label={`Angle unit: ${angleUnit}. Click to toggle.`}
              >
                {angleUnit}
              </button>
              <button
                onClick={() => setShowSci(!showSci)}
                className={`mode-tab ${showSci ? 'mode-tab--active' : ''}`}
                aria-label={showSci ? "Switch to standard keypad" : "Show scientific functions"}
                title={showSci ? "Standard mode" : "Scientific mode"}
              >
                {showSci ? <Binary size={14} /> : <FlaskConical size={14} />}
              </button>
            </div>
            {memory && memory !== "0" && (
              <span className="display-badge display-badge--mem animate-fade-in" title={`Memory: ${memory}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                M: {formatDisplayNumber(memory)}
              </span>
            )}
          </div>
          
          {/* Backspace */}
          <button
            onClick={() => onPress("⌫")}
            className="icon-btn shrink-0"
            title="Backspace"
            aria-label="Delete last character"
            style={{ 
              width: 32, 
              height: 32, 
              opacity: input ? 1 : 0, 
              pointerEvents: input ? 'auto' : 'none', 
              transition: 'opacity 0.15s ease' 
            }}
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Input expression */}
        <div
          className="flex items-center"
          style={{ minHeight: "1.5rem" }}
        >
          <div className="flex-1 text-right text-sm font-semibold truncate text-dim" aria-label={`Expression: ${input || "empty"}`}>
            {input ? formatInputExpression(input) : "\u00A0"}
          </div>
        </div>

        {/* Result */}
        <div
          className="text-right font-bold tabular-nums truncate"
          style={{
            fontSize: (result || "0").length > 16 ? "1.2rem" : (result || "0").length > 12 ? "1.5rem" : "2.25rem",
            lineHeight: 1.1,
            color: hasError ? "var(--accent-neg)" : "var(--fg-result)",
            letterSpacing: "-0.02em",
            transition: "font-size 0.15s ease",
          }}
          aria-label={`Result: ${result || "0"}`}
        >
          {formatDisplayNumber(result || "0")}
        </div>
        

      </div>

      {/* Scientific functions (paginated) — dynamic rows per page */}
      {showSci && (
        <div className="flex flex-col gap-1.5 animate-slide-down" role="group" aria-label="Scientific functions">
          {/* Page indicator + nav */}
          <div className="flex items-center justify-between px-1" style={{ marginBottom: 4 }}>
            <button
              className="icon-btn"
              onClick={() => setSciPage(Math.max(0, sciPage - 1))}
              disabled={sciPage === 0}
              aria-label="Previous page"
              style={{ width: 32, height: 32 }}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2 items-center">
              {Array.from({ length: totalSciPages }, (_, i) => (
                <button
                  key={i}
                  className="sci-page-dot"
                  aria-label={`Page ${i + 1} of ${totalSciPages}`}
                  aria-current={sciPage === i}
                  onClick={() => setSciPage(i)}
                  style={{
                    background: sciPage === i ? "var(--accent-primary)" : "var(--fg-dim)",
                    opacity: sciPage === i ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
            <button
              className="icon-btn"
              onClick={() => setSciPage(Math.min(totalSciPages - 1, sciPage + 1))}
              disabled={sciPage === totalSciPages - 1}
              aria-label="Next page"
              style={{ width: 32, height: 32 }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Current page rows */}
          <div className="flex flex-col gap-1.5">
            {currentPageRows.map((row, ri) => (
              <div key={`sci-${sciPage}-${ri}`} className="grid grid-cols-4 gap-2">
                {row.map((btn) => (
                  <CalcBtn
                    key={btn.label}
                    label={btn.label}
                    variant="func"
                    onClick={() => btn.press === "BRACKET" ? handleBracket() : onPress(btn.press)}
                    ariaLabel={btn.aria}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory row */}
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Memory functions">
        <CalcBtn label="MC" variant="mem" onClick={() => onPress("MC")} title="Clear Memory" ariaLabel="Clear memory" />
        <CalcBtn label="MR" variant="mem" onClick={() => onPress("MR")} title={memory ? `Recall Memory: ${memory}` : "Recall Memory (empty)"} ariaLabel={memory ? `Recall memory: ${memory}` : "Recall memory, currently empty"} />
        <CalcBtn label="M+" variant="mem" onClick={() => onPress("M+")} title="Add to Memory" ariaLabel="Add to memory" />
        <CalcBtn label="M−" variant="mem" onClick={() => onPress("M-")} title="Subtract from Memory" ariaLabel="Subtract from memory" />
      </div>

      {/* Main keypad — standard 4-column layout */}
      <div className="grid grid-cols-4 gap-2.5 flex-1" style={{ gridAutoRows: "1fr" }} role="group" aria-label="Calculator keypad">
        {/* Row 1: AC, brackets, percent, divide */}
        <CalcBtn label="AC" variant="action" onClick={() => onPress("C")} ariaLabel="Clear all" />
        <CalcBtn label={getSmartBracket(input)} variant="op" onClick={handleBracket} title="Smart brackets — auto-inserts ( or )" ariaLabel={`Insert ${getSmartBracket(input) === '(' ? 'opening' : 'closing'} bracket`} />
        <CalcBtn icon={Percent} variant="op" onClick={() => onPress("%")} ariaLabel="Percent" />
        <CalcBtn icon={Divide} variant="op" onClick={() => onPress("÷")} ariaLabel="Divide" />

        {/* Row 2: 7 8 9 × */}
        <CalcBtn label="7" onClick={() => onPress("7")} />
        <CalcBtn label="8" onClick={() => onPress("8")} />
        <CalcBtn label="9" onClick={() => onPress("9")} />
        <CalcBtn icon={X} variant="op" onClick={() => onPress("×")} ariaLabel="Multiply" />

        {/* Row 3: 4 5 6 − */}
        <CalcBtn label="4" onClick={() => onPress("4")} />
        <CalcBtn label="5" onClick={() => onPress("5")} />
        <CalcBtn label="6" onClick={() => onPress("6")} />
        <CalcBtn icon={Minus} variant="op" onClick={() => onPress("−")} ariaLabel="Subtract" />

        {/* Row 4: 1 2 3 + */}
        <CalcBtn label="1" onClick={() => onPress("1")} />
        <CalcBtn label="2" onClick={() => onPress("2")} />
        <CalcBtn label="3" onClick={() => onPress("3")} />
        <CalcBtn icon={Plus} variant="op" onClick={() => onPress("+")} ariaLabel="Add" />

        {/* Row 5: ± 0 . = */}
        <CalcBtn label="±" variant="op" onClick={() => onPress("±")} ariaLabel="Toggle sign" />
        <CalcBtn label="0" onClick={() => onPress("0")} />
        <CalcBtn label="." onClick={() => onPress(".")} ariaLabel="Decimal point" />
        <CalcBtn icon={Equal} variant="equal" onClick={() => onPress("=")} ariaLabel="Calculate result" />
      </div>
    </div>
  );
});
