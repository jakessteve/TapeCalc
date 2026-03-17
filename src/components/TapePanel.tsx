import { useRef, useEffect, useState, memo } from "react";
import { Download, Copy, Trash2, Plus, Undo2, Redo2, Calculator, Pencil } from "lucide-react";
import { type TapeEntryDto, ExportFormat } from "../types";
import { useToast } from "./Toast";
import { formatTapeValue, parseLeadingOperator } from "../utils/formatting";

interface TapePanelProps {
  entries: TapeEntryDto[];
  grandTotal: string;
  tapeNames: string[];
  activeTapeIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onEntryClick: (lineNumber: number) => void;
  onCopyResult: (text: string) => void;
  onDeleteEntry: (lineNumber: number) => void;
  onSetNote: (lineNumber: number, note: string) => void;
  onClearTape: () => void;
  onNewTape: () => void;
  onSwitchTape: (index: number) => void;
  onRenameTape: (index: number, name: string) => void;
  onDeleteTape: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport?: (format: ExportFormat) => void;
}

/* parseOperator, formatTapeValue, opInfo → imported from ../utils/formatting */

/** Wrap parseLeadingOperator for tape CSS class naming convention */
function parseOperator(input: string): { op: string; opClass: string } {
  const { operator, operatorClass } = parseLeadingOperator(input);
  // Map formatting.ts class names (op-add) to tape CSS class names (tape-op--add)
  const opClass = operatorClass ? `tape-op--${operatorClass.replace("op-", "")}` : "tape-op--add";
  return { op: operator || "+", opClass };
}

/** Operator info helper */
function opInfo(ch: string): { op: string; opClass: string } {
  if (ch === "+" ) return { op: "+", opClass: "tape-op--add" };
  if (ch === "-" || ch === "−") return { op: "−", opClass: "tape-op--sub" };
  if (ch === "×" || ch === "*") return { op: "×", opClass: "tape-op--mul" };
  if (ch === "÷" || ch === "/") return { op: "÷", opClass: "tape-op--div" };
  return { op: "+", opClass: "tape-op--add" };
}

interface Operand {
  op: string;
  opClass: string;
  value: string;
}

/**
 * Parse a simple expression like "856-320" or "536×9" into individual operands.
 * Returns null for complex expressions (functions, nested parens, etc.) that can't
 * be meaningfully decomposed.
 */
function parseExpressionToOperands(input: string): Operand[] | null {
  const trimmed = input.trim();

  // Don't decompose function calls, roots, or parenthesized expressions
  if (/^[a-zA-Z]/.test(trimmed) || trimmed.startsWith("√") || trimmed.includes("(")) {
    return null;
  }

  const operands: Operand[] = [];
  // Regex: match an optional leading sign, then digits (with commas), optional decimal
  const tokenRegex = /([+\-−×÷*/])?(\d[\d,]*\.?\d*)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(trimmed)) !== null) {
    // If there's unmatched text before this token, expression is too complex
    if (match.index > lastIndex && trimmed.slice(lastIndex, match.index).trim()) {
      return null;
    }
    lastIndex = tokenRegex.lastIndex;

    const rawOp = match[1] || "+";
    const { op, opClass } = opInfo(rawOp);
    operands.push({ op, opClass, value: match[2] });
  }

  // Must have at least 2 operands for multi-line breakdown to make sense
  if (operands.length < 2) return null;
  return operands;
}

/* ——— (TapePanel component start remains unchanged above) ——— */

export const TapePanel = memo(function TapePanel({
  entries,
  grandTotal,
  tapeNames,
  activeTapeIndex,
  canUndo,
  canRedo,
  onEntryClick,
  onCopyResult,
  onDeleteEntry,
  onSetNote,
  onClearTape,
  onNewTape,
  onSwitchTape,
  onRenameTape,
  onDeleteTape,
  onUndo,
  onRedo,
  onExport,
}: TapePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [editingNoteFor, setEditingNoteFor] = useState<number | null>(null);
  const [editingTabIdx, setEditingTabIdx] = useState<number | null>(null);
  const [editingTapeNote, setEditingTapeNote] = useState(false);
  const [tapeNoteText, setTapeNoteText] = useState("");
  const noteInputRef = useRef<HTMLInputElement>(null);
  const tabInputRef = useRef<HTMLInputElement>(null);
  const tapeNoteInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const prevEntriesLenRef = useRef(entries.length);
  const newestLineNumber = useRef<number | null>(null);

  useEffect(() => {
    if (entries.length > prevEntriesLenRef.current && entries.length > 0) {
      newestLineNumber.current = entries[entries.length - 1].line_number;
    } else if (entries.length < prevEntriesLenRef.current) {
      newestLineNumber.current = null;
    }
    prevEntriesLenRef.current = entries.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally narrow: track entry count changes only
  }, [entries.length]);



  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const handleEntryClick = (lineNumber: number) => {
    setSelectedLine(lineNumber === selectedLine ? null : lineNumber);
    onEntryClick(lineNumber);
  };

  const handleCopyResult = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyResult(text);
    showToast("Copied to clipboard!", "success");
  };

  const handleCopyGrandTotal = () => {
    onCopyResult(grandTotal);
    showToast("Grand total copied!", "success");
  };

  const handleDeleteEntry = (lineNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteEntry(lineNumber);
    setSelectedLine(null);
    showToast("Entry deleted", "info");
  };

  const startEditingNote = (lineNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteFor(lineNumber);
    // Focus after render
    setTimeout(() => noteInputRef.current?.focus(), 0);
  };

  const commitNote = (lineNumber: number, value: string) => {
    onSetNote(lineNumber, value.trim());
    setEditingNoteFor(null);
  };

  const cancelEditing = () => {
    setEditingNoteFor(null);
  };

  return (
    <div className="flex flex-col overflow-hidden tape-panel-responsive"
         style={{
           flex: 10,
           minWidth: "240px",
           borderRadius: "var(--radius-lg)",
           border: "1px solid var(--border-light)",
           background: "var(--bg-panel)",
         }}
    >
      {/* Tape tabs — multi-tape switcher */}
      <div className="flex items-center gap-0 px-2 shrink-0"
           role="tablist"
           aria-label="Tape tabs"
           style={{
             height: 40,
             borderBottom: "1px solid var(--border-light)",
           }}
      >
        {tapeNames.map((name, idx) => (
          editingTabIdx === idx ? (
            <input
              key={idx}
              ref={tabInputRef}
              defaultValue={name}
              className="tape-tab-input"
              style={{
                width: Math.max(60, name.length * 8 + 20),
                height: "100%",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--accent-primary)",
                background: "transparent",
                border: "none",
                borderBottom: "2px solid var(--accent-primary)",
                outline: "none",
                padding: "0 8px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) onRenameTape(idx, val);
                  setEditingTabIdx(null);
                }
                if (e.key === "Escape") setEditingTabIdx(null);
              }}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val) onRenameTape(idx, val);
                setEditingTabIdx(null);
              }}
              autoFocus
            />
          ) : (
            <button
              key={idx}
              onClick={() => onSwitchTape(idx)}
              onDoubleClick={() => {
                setEditingTabIdx(idx);
                setTimeout(() => tabInputRef.current?.select(), 0);
              }}
              role="tab"
              aria-selected={idx === activeTapeIndex}
              aria-label={`Switch to ${name}`}
              title="Double-click to rename"
              className="cursor-pointer transition-colors group"
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                padding: "0 12px",
                fontSize: 12,
                fontWeight: idx === activeTapeIndex ? 700 : 500,
                color: idx === activeTapeIndex ? "var(--accent-primary)" : "var(--fg-dim)",
                background: "none",
                border: "none",
                borderBottomStyle: "solid",
                borderBottomWidth: 2,
                borderBottomColor: idx === activeTapeIndex ? "var(--accent-primary)" : "transparent",
                gap: 4,
              }}
            >
              {name}
              {/* Pencil edit hint — visible on hover */}
              <Pencil
                size={10}
                style={{
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                  color: "var(--fg-dim)",
                  flexShrink: 0,
                }}
                className="group-hover:opacity-60"
              />
              {/* × close button — only if >1 tape, visible on hover */}
              {tapeNames.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTape(idx);
                  }}
                  title={`Close ${name}`}
                  aria-label={`Delete tape ${name}`}
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    lineHeight: 1,
                    opacity: 0,
                    cursor: "pointer",
                    color: "var(--fg-dim)",
                    transition: "opacity 0.15s ease",
                  }}
                  className="tape-tab-close"
                >
                  ×
                </span>
              )}
            </button>
          )
        ))}

        <button
          onClick={onNewTape}
          className="icon-btn ml-1"
          title="New tape"
          aria-label="Create new tape"
          style={{ width: 28, height: 28 }}
        >
          <Plus size={13} />
        </button>

        <div className="flex-1" />

        <button onClick={onUndo} disabled={!canUndo} className="icon-btn" title="Undo" aria-label="Undo last action" style={{ width: 28, height: 28 }}>
          <Undo2 size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="icon-btn" title="Redo" aria-label="Redo last action" style={{ width: 28, height: 28 }}>
          <Redo2 size={16} />
        </button>
        {entries.length > 0 && (
          <button onClick={onClearTape} className="icon-btn" title="Clear tape" aria-label="Clear all tape entries" style={{ width: 28, height: 28, color: "var(--accent-clear)" }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Tape entries — CalcTape-style layout */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto tape-dots-bg" style={{ padding: "4px 0" }}>
        {entries.length === 0 && (
          /* P1-9: Rich empty state with example tape visual */
          <div className="empty-state" style={{ minHeight: 200, gap: "var(--space-lg)" }}>
            <Calculator size={32} className="empty-state__icon" style={{ opacity: 0.2 }} />
            <div style={{ textAlign: "center" }}>
              <span className="empty-state__title" style={{ display: "block", marginBottom: 4 }}>
                Your tape is empty
              </span>
              <span className="empty-state__subtitle">
                Start calculating — every result appears here
              </span>
            </div>

            {/* Visual example of what a populated tape looks like */}
            <div
              style={{
                width: "100%",
                maxWidth: 260,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                background: "var(--bg-surface)",
                padding: "var(--space-sm) 0",
                opacity: 0.5,
              }}
            >
              {[
                { op: "+", val: "150.00", note: "Budget" },
                { op: "−", val: "42.50", note: "Lunch" },
                { op: "+", val: "200.00", note: "Refund" },
              ].map((ex, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 80px 1fr",
                    alignItems: "baseline",
                    padding: "3px 8px",
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span style={{ textAlign: "center", color: ex.op === "−" ? "var(--accent-neg)" : "var(--fg-secondary)" }}>
                    {ex.op}
                  </span>
                  <span style={{ textAlign: "right", fontWeight: 600, paddingRight: 8, color: "var(--fg-primary)" }}>
                    {ex.val}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--fg-dim)" }}>{ex.note}</span>
                </div>
              ))}
              <hr style={{ border: "none", borderTop: "2px double var(--border-light)", margin: "2px 8px 2px 24px" }} />
              <div style={{
                display: "flex", justifyContent: "flex-end", padding: "3px 8px",
                fontSize: 13, fontWeight: 700, color: "var(--fg-primary)",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Σ 307.50
              </div>
            </div>

            <span className="empty-state__subtitle" style={{ fontSize: 10, opacity: 0.4 }}>
              Tip: Use keyboard shortcuts for fast input
            </span>
          </div>
        )}

        {entries.map((entry, idx) => {
          const isSelected = selectedLine === entry.line_number;
          const isNewest = entry.line_number === newestLineNumber.current;
          const operands = parseExpressionToOperands(entry.input);

          // Result value class
          let resultClass = "tape-value tape-value--result";
          if (entry.is_error) resultClass += " tape-value--error";
          else if (isSelected) resultClass += " tape-value--selected";

          // ── Multi-line CalcTape breakdown ──
          if (operands) {
            return (
              <div
                key={`${entry.line_number}-${idx}`}
                className={`tape-entry-block ${isNewest ? "animate-fade-in" : ""} ${isSelected ? "tape-entry-block--selected" : ""}`}
                onClick={() => handleEntryClick(entry.line_number)}
                title={entry.input}
                style={{
                  borderLeft: `3px solid ${isSelected ? 'var(--accent-primary)' : (
                    operands[0]?.opClass.includes('sub') ? 'var(--accent-neg)' :
                    operands[0]?.opClass.includes('mul') || operands[0]?.opClass.includes('div') ? 'var(--accent-primary)' :
                    'var(--accent-success)'
                  )}`,
                }}
              >
                {/* Individual operand rows */}
                {operands.map((operand, oi) => {
                  const isSubtract = operand.op === "−";
                  return (
                    <div key={oi} className="tape-entry-row tape-entry-row--operand">
                      <span className={`tape-op ${oi === 0 ? "tape-op--add" : operand.opClass}`}>
                        {oi === 0 ? "" : operand.op}
                      </span>
                      <span className={`tape-value ${isSubtract && oi > 0 ? "tape-value--neg" : ""}`}>
                        {formatTapeValue(operand.value)}
                      </span>
                    </div>
                  );
                })}

                {/* Separator line */}
                <hr className="tape-subtotal-sep" />

                {/* Result row with note and action icons */}
                <div className="tape-entry-row tape-entry-row--result">
                  <span className="tape-op tape-op--add"></span>
                  <span className={resultClass}>{formatTapeValue(entry.result)}</span>
                  {editingNoteFor === entry.line_number ? (
                    <input
                      ref={noteInputRef}
                      className="tape-note-input"
                      defaultValue={entry.note}
                      placeholder="Add note…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitNote(entry.line_number, (e.target as HTMLInputElement).value);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      onBlur={(e) => commitNote(entry.line_number, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={`tape-note tape-note--clickable ${!entry.note ? "tape-note--placeholder" : ""}`}
                      onClick={(e) => startEditingNote(entry.line_number, e)}
                      title="Click to add note"
                    >
                      {entry.note || "+ Add note"}
                    </span>
                  )}
                  <div className="tape-action-icons">
                    <button className="icon-btn" onClick={(e) => handleCopyResult(entry.result, e)} title="Copy result" aria-label={`Copy result ${entry.result}`} style={{ width: 24, height: 24 }}>
                      <Copy size={12} />
                    </button>
                    <button className="icon-btn" onClick={(e) => handleDeleteEntry(entry.line_number, e)} title="Delete entry" aria-label={`Delete entry ${entry.input}`} style={{ width: 24, height: 24 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // ── Compact single-line for functions / non-decomposable ──
          const { op, opClass } = parseOperator(entry.input);
          const isNeg = op === "−";
          let valueClass = "tape-value";
          if (entry.is_error) valueClass += " tape-value--error";
          else if (isSelected) valueClass += " tape-value--selected";
          else if (isNeg) valueClass += " tape-value--neg";

          return (
            <div key={`${entry.line_number}-${idx}`} className="tape-entry-block">
              <div
              className={`tape-entry-row ${isNewest ? "animate-fade-in" : ""} ${isSelected ? "tape-entry-row--selected" : ""}`}
                onClick={() => handleEntryClick(entry.line_number)}
                title={entry.input}
                style={{
                  borderLeft: `3px solid ${isSelected ? 'var(--accent-primary)' : (
                    isNeg ? 'var(--accent-neg)' :
                    op === '×' || op === '÷' ? 'var(--accent-primary)' :
                    'var(--accent-success)'
                  )}`,
                }}
              >
                <span className={`tape-op ${opClass}`}>{op}</span>
                <span className={valueClass}>{formatTapeValue(entry.result)}</span>
                {editingNoteFor === entry.line_number ? (
                  <input
                    ref={noteInputRef}
                    className="tape-note-input"
                    defaultValue={entry.note}
                    placeholder="Add note…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitNote(entry.line_number, (e.target as HTMLInputElement).value);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    onBlur={(e) => commitNote(entry.line_number, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={`tape-note tape-note--clickable ${entry.note ? "" : "tape-note--placeholder"}`}
                    onClick={(e) => startEditingNote(entry.line_number, e)}
                    title={entry.note ? "Click to edit note" : "Click to add note"}
                  >
                    {entry.note || entry.input}
                  </span>
                )}
                <div className="tape-action-icons">
                  <button className="icon-btn" onClick={(e) => handleCopyResult(entry.result, e)} title="Copy result" aria-label={`Copy result ${entry.result}`} style={{ width: 24, height: 24 }}>
                    <Copy size={12} />
                  </button>
                  <button className="icon-btn" onClick={(e) => handleDeleteEntry(entry.line_number, e)} title="Delete entry" aria-label={`Delete entry ${entry.input}`} style={{ width: 24, height: 24 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand total */}
      {entries.length > 0 && (
        <div style={{
          borderTop: "2px solid var(--accent-primary)",
          background: "linear-gradient(90deg, rgba(168, 85, 247, 0.06), transparent)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}>
          <div className="tape-entry-row" style={{ padding: "8px 12px" }}>
            <span className="tape-op" style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-primary)' }}>Σ</span>
            <span
              className="tape-value text-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleCopyGrandTotal}
              title="Click to copy grand total"
              style={{ fontWeight: 800, fontSize: "1.35rem" }}
            >
              {formatTapeValue(grandTotal)}
            </span>
            {/* Tape description note */}
            {editingTapeNote ? (
              <input
                ref={tapeNoteInputRef}
                defaultValue={tapeNoteText}
                className="tape-note-input"
                style={{ fontSize: 12 }}
                placeholder="Add note..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setTapeNoteText((e.target as HTMLInputElement).value);
                    setEditingTapeNote(false);
                  }
                  if (e.key === "Escape") setEditingTapeNote(false);
                }}
                onBlur={(e) => {
                  setTapeNoteText(e.target.value);
                  setEditingTapeNote(false);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span
                className={`tape-note tape-note--clickable ${!tapeNoteText ? "tape-note--placeholder" : ""}`}
                onClick={() => {
                  setEditingTapeNote(true);
                  setTimeout(() => tapeNoteInputRef.current?.focus(), 0);
                }}
                title="Click to add tape description"
              >
                {tapeNoteText || "+ Add note"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar — stats | export */}
      <div className="tape-bottom-bar" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
        <span>Lines: {entries.length}</span>

        <div className="flex-1" />

        <button
          className="tape-export-btn cursor-pointer transition-colors"
          aria-label="Export tape"
          onClick={() => onExport?.(ExportFormat.Text)}
          title={entries.length === 0 ? "Add entries to export" : "Export tape"}
          disabled={entries.length === 0}
          style={{ opacity: entries.length === 0 ? 0.35 : 1, cursor: entries.length === 0 ? 'default' : 'pointer' }}
        >
          <Download size={12} />
          Export
        </button>
      </div>
    </div>
  );
});
