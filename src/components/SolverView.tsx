/**
 * SolverView — Scientific Solver Labs feature.
 * Provides expression evaluation with scientific functions, variable slots,
 * angle mode toggle, quick function buttons, and history panel.
 */

import { useCallback, useRef, useEffect } from "react";
import {
  FlaskConical,
  Play,
  Trash2,
  Plus,
  X,
  Clock,
  RotateCcw,
  Variable,
} from "lucide-react";
import { useSolver, type SolverHistoryEntry } from "../hooks/useSolver";
import { FUNCTION_NAMES, CONSTANT_NAMES } from "../utils/mathEngine";

// Quick-access function groups for the button bar
const QUICK_FUNCTIONS = [
  { label: "sin", fn: "sin" },
  { label: "cos", fn: "cos" },
  { label: "tan", fn: "tan" },
  { label: "√", fn: "sqrt" },
  { label: "∛", fn: "cbrt" },
  { label: "log", fn: "log" },
  { label: "ln", fn: "ln" },
  { label: "abs", fn: "abs" },
  { label: "eˣ", fn: "exp" },
  { label: "⌈x⌉", fn: "ceil" },
  { label: "⌊x⌋", fn: "floor" },
];

const QUICK_CONSTANTS = [
  { label: "π", value: "pi" },
  { label: "e", value: "e" },
  { label: "τ", value: "tau" },
  { label: "^", value: "^" },
  { label: "%", value: "%" },
];

export function SolverView() {
  const solver = useSolver();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        solver.handleEvaluate();
      }
    },
    [solver.handleEvaluate]
  );

  const handleInsertConstant = useCallback(
    (value: string) => {
      solver.setExpression(solver.expression + value);
      inputRef.current?.focus();
    },
    [solver]
  );

  const handleInsertFunction = useCallback(
    (fn: string) => {
      solver.insertFunction(fn);
      inputRef.current?.focus();
    },
    [solver]
  );

  return (
    <div
      className="solver-layout flex flex-1 min-h-0 animate-tab-enter"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Main content area */}
      <div className="solver-main">
        {/* Header */}
        <div className="solver-header">
          <div className="flex items-center gap-2.5">
            <div
              className="title-icon"
              style={{ width: 32, height: 32, fontSize: 14 }}
            >
              <FlaskConical size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">
                Scientific Solver
              </h2>
              <p className="text-[11px] text-dim">
                {FUNCTION_NAMES.length} functions ·{" "}
                {CONSTANT_NAMES.length} constants · Variables
              </p>
            </div>
          </div>

          {/* Angle mode toggle */}
          <button
            onClick={solver.toggleAngle}
            className="solver-angle-btn focus-ring"
            title={`Angle mode: ${solver.angleDeg ? "Degrees" : "Radians"}`}
          >
            {solver.angleDeg ? "DEG" : "RAD"}
          </button>
        </div>

        {/* Expression input */}
        <div className="solver-input-wrap">
          <textarea
            ref={inputRef}
            value={solver.expression}
            onChange={(e) => solver.setExpression(e.target.value)}
            onKeyDown={handleKeyDown}
            className="solver-input focus-ring"
            placeholder="Type an expression... e.g. sin(45) + sqrt(2)"
            rows={2}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={solver.handleEvaluate}
            className="solver-eval-btn focus-ring"
            title="Evaluate (Enter)"
          >
            <Play size={16} />
          </button>
        </div>

        {/* Result display */}
        <div
          className={`solver-result ${solver.isError ? "solver-result--error" : ""} ${
            solver.result ? "solver-result--has-value" : ""
          }`}
        >
          {solver.result ? (
            <>
              <span className="solver-result__label">
                {solver.isError ? "Error" : "Result"}
              </span>
              <span className="solver-result__value">{solver.result}</span>
            </>
          ) : (
            <span className="solver-result__placeholder">
              Press Enter or ▶ to evaluate
            </span>
          )}
        </div>

        {/* Quick function buttons */}
        <div className="solver-section">
          <div className="solver-section__title">Functions</div>
          <div className="solver-fn-bar">
            {QUICK_FUNCTIONS.map(({ label, fn }) => (
              <button
                key={fn}
                onClick={() => handleInsertFunction(fn)}
                className="solver-fn-btn focus-ring"
                title={`Insert ${fn}()`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick constants */}
        <div className="solver-section">
          <div className="solver-section__title">Constants & Operators</div>
          <div className="solver-fn-bar">
            {QUICK_CONSTANTS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleInsertConstant(value)}
                className="solver-fn-btn focus-ring"
                title={`Insert ${value}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Variable slots */}
        <div className="solver-section">
          <div className="solver-section__title">
            <Variable size={12} />
            Variables
            <button
              onClick={solver.addVariable}
              className="solver-add-var-btn focus-ring"
              title="Add variable"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="solver-vars">
            {solver.variables.map((v, i) => (
              <div key={i} className="solver-var-slot">
                <input
                  value={v.name}
                  onChange={(e) => solver.updateVariable(i, "name", e.target.value)}
                  className="solver-var-name focus-ring"
                  placeholder="var"
                  maxLength={8}
                />
                <span className="solver-var-eq">=</span>
                <input
                  value={v.value}
                  onChange={(e) => solver.updateVariable(i, "value", e.target.value)}
                  className="solver-var-value focus-ring"
                  placeholder="value"
                />
                <button
                  onClick={() => solver.removeVariable(i)}
                  className="solver-var-remove focus-ring"
                  title="Remove variable"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History sidebar */}
      <div className="solver-history">
        <div className="solver-history__header">
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>History</span>
          </div>
          {solver.history.length > 0 && (
            <button
              onClick={solver.clearHistory}
              className="solver-history__clear focus-ring"
              title="Clear history"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <div className="solver-history__list">
          {solver.history.length === 0 ? (
            <div className="solver-history__empty">
              <RotateCcw size={20} style={{ opacity: 0.3 }} />
              <span>No history yet</span>
            </div>
          ) : (
            solver.history.map((entry: SolverHistoryEntry) => (
              <button
                key={entry.id}
                className={`solver-history__item focus-ring ${
                  entry.isError ? "solver-history__item--error" : ""
                }`}
                onClick={() => solver.handleHistoryClick(entry)}
                title="Click to restore"
              >
                <span className="solver-history__expr">{entry.expression}</span>
                <span className="solver-history__result">
                  = {entry.result}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
