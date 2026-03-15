/**
 * useSolver — Hook for the Scientific Solver Labs feature.
 * Manages expression input, variable bindings, evaluation result,
 * history of evaluated expressions, and angle mode.
 */

import { useState, useCallback, useMemo } from "react";
import { evaluate, type EvalOptions } from "../utils/mathEngine";

export interface SolverVariable {
  name: string;
  value: string; // kept as string for editing; parsed to number on eval
}

export interface SolverHistoryEntry {
  id: number;
  expression: string;
  result: string;
  isError: boolean;
  timestamp: number;
}

const DEFAULT_VARS: SolverVariable[] = [
  { name: "x", value: "" },
  { name: "y", value: "" },
  { name: "a", value: "" },
];

let nextHistoryId = 0;

export function useSolver() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [variables, setVariables] = useState<SolverVariable[]>(() =>
    DEFAULT_VARS.map((v) => ({ ...v }))
  );
  const [history, setHistory] = useState<SolverHistoryEntry[]>([]);
  const [angleDeg, setAngleDeg] = useState(true);

  // Build vars map from the variable slots
  const varsMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of variables) {
      if (v.name && v.value !== "") {
        const num = parseFloat(v.value);
        if (!isNaN(num)) {
          map[v.name] = num;
        }
      }
    }
    return map;
  }, [variables]);

  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) return;

    const opts: EvalOptions = { vars: varsMap, angleDeg };

    try {
      const val = evaluate(expression, opts);
      const formatted = formatResult(val);
      setResult(formatted);
      setIsError(false);

      // Add to history
      setHistory((prev) => [
        {
          id: ++nextHistoryId,
          expression,
          result: formatted,
          isError: false,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 50)); // Keep last 50
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setResult(msg);
      setIsError(true);

      setHistory((prev) => [
        {
          id: ++nextHistoryId,
          expression,
          result: msg,
          isError: true,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 50));
    }
  }, [expression, varsMap, angleDeg]);

  const handleLiveEvaluate = useCallback(
    (expr: string) => {
      setExpression(expr);
      if (!expr.trim()) {
        setResult("");
        setIsError(false);
        return;
      }
      const opts: EvalOptions = { vars: varsMap, angleDeg };
      try {
        const val = evaluate(expr, opts);
        setResult(formatResult(val));
        setIsError(false);
      } catch {
        // Don't show error while typing — only show on explicit evaluate
        setResult("");
        setIsError(false);
      }
    },
    [varsMap, angleDeg]
  );

  const handleHistoryClick = useCallback((entry: SolverHistoryEntry) => {
    setExpression(entry.expression);
    setResult(entry.result);
    setIsError(entry.isError);
  }, []);

  const updateVariable = useCallback((index: number, field: "name" | "value", val: string) => {
    setVariables((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  }, []);

  const addVariable = useCallback(() => {
    setVariables((prev) => [...prev, { name: "", value: "" }]);
  }, []);

  const removeVariable = useCallback((index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleAngle = useCallback(() => {
    setAngleDeg((prev) => !prev);
  }, []);

  const insertFunction = useCallback((fn: string) => {
    setExpression((prev) => prev + fn + "(");
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    expression,
    setExpression: handleLiveEvaluate,
    result,
    isError,
    variables,
    updateVariable,
    addVariable,
    removeVariable,
    history,
    handleEvaluate,
    handleHistoryClick,
    angleDeg,
    toggleAngle,
    insertFunction,
    clearHistory,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────

function formatResult(val: number): string {
  if (!isFinite(val)) return String(val);
  if (Number.isInteger(val) && Math.abs(val) < 1e15) return String(val);
  if (Math.abs(val) < 0.000001 && val !== 0) return val.toExponential(8);
  if (Math.abs(val) >= 1e12) return val.toExponential(8);
  // Up to 10 significant decimal digits
  return parseFloat(val.toPrecision(12)).toString();
}
