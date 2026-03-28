import { useState, useEffect, useCallback, useMemo } from "react";
import { invokeApi as invoke } from "../api";
import { type CalcDisplay, Theme, ExportFormat } from "../types";

const THEME_NAMES: Record<Theme, string> = {
  [Theme.Dark]: "dark",
  [Theme.Light]: "light",
  [Theme.HighContrast]: "high-contrast",
};

const THEME_LABELS: Record<Theme, string> = {
  [Theme.Dark]: "Professional Dark",
  [Theme.Light]: "Light",
  [Theme.HighContrast]: "High Contrast",
};

export function useCalculator() {
  const [state, setState] = useState<CalcDisplay | null>(null);

  const invokeAction = useCallback(async (cmd: string, args?: Record<string, unknown>) => {
    try {
      const result = await invoke<CalcDisplay>(cmd, args);
      setState(result);
    } catch (e) {
      console.error(`[useCalculator] ${cmd} failed:`, e);
    }
  }, []);

  // Fetch initial state on mount
  useEffect(() => {
    invokeAction("get_state");
  }, [invokeAction]);

  const press = useCallback(
    (key: string) => invokeAction("button_press", { key }),
    [invokeAction]
  );

  const handleUndo = useCallback(
    () => invokeAction("undo"),
    [invokeAction]
  );

  const handleRedo = useCallback(
    () => invokeAction("redo"),
    [invokeAction]
  );

  const handleClearTape = useCallback(
    () => invokeAction("clear_tape"),
    [invokeAction]
  );

  const handleDeleteEntry = useCallback(
    (lineNumber: number) => invokeAction("delete_entry", { lineNumber }),
    [invokeAction]
  );

  const handleNewTape = useCallback(
    () => invokeAction("new_tape"),
    [invokeAction]
  );

  const handleSwitchTape = useCallback(
    (index: number) => invokeAction("switch_tape", { index }),
    [invokeAction]
  );

  const handleCycleTheme = useCallback(
    () => invokeAction("cycle_theme"),
    [invokeAction]
  );

  const handleExport = useCallback(async (format: ExportFormat | string) => {
    try {
      const text = await invoke<string>("export_tape", { format });
      await invoke("copy_to_clipboard", { text });
    } catch (e) {
      console.error("[useCalculator] export failed:", e);
    }
  }, []);

  const handleTapeClick = useCallback(
    (lineNumber: number) => invokeAction("tape_entry_click", { lineNumber }),
    [invokeAction]
  );

  const handleCopyResult = useCallback(async (text: string) => {
    try {
      await invoke("copy_to_clipboard", { text });
    } catch (e) {
      console.error("[useCalculator] copy_to_clipboard failed:", e);
    }
  }, []);

  const handleSetNote = useCallback(
    (lineNumber: number, note: string, operandIndex?: number) =>
      invokeAction("set_note", { lineNumber, note, operandIndex }),
    [invokeAction]
  );

  const handleSetPendingNote = useCallback(
    (note: string, operandIndex?: number) =>
      invokeAction("set_pending_note", { note, operandIndex }),
    [invokeAction]
  );

  const handleRenameTape = useCallback(
    (index: number, name: string) => invokeAction("rename_tape", { index, name }),
    [invokeAction]
  );

  const handleDeleteTape = useCallback(
    (index: number) => invokeAction("delete_tape", { index }),
    [invokeAction]
  );

  const handleEditEntry = useCallback(
    (lineNumber: number, newInput: string) => invokeAction("edit_entry", { lineNumber, newInput }),
    [invokeAction]
  );

  const handleToggleSubtotal = useCallback(
    (lineNumber: number) => invokeAction("toggle_subtotal", { lineNumber }),
    [invokeAction]
  );

  const handleToggleAlwaysOnTop = useCallback(async (enable: boolean) => {
    try {
      await invoke("toggle_always_on_top", { enable });
    } catch (e) {
      console.error("[useCalculator] toggle_always_on_top failed:", e);
    }
  }, []);

  useEffect(() => {
    if (state) {
      const theme = THEME_NAMES[state.theme] ?? "dark";
      document.documentElement.setAttribute("data-theme", theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally narrow: only re-run on theme change, not every state update
  }, [state?.theme]);

  const themeName = useMemo(() => {
    if (state == null) return THEME_LABELS[Theme.Dark];
    return THEME_LABELS[state.theme] ?? THEME_LABELS[Theme.Dark];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally narrow: only recompute on theme change
  }, [state?.theme]);

  // Stabilize the return value to prevent unnecessary re-renders of consumers
  return useMemo(
    () => ({
      state,
      press,
      handleUndo,
      handleRedo,
      handleClearTape,
      handleDeleteEntry,
      handleNewTape,
      handleSwitchTape,
      handleCycleTheme,
      handleExport,
      handleTapeClick,
      handleCopyResult,
      handleSetNote,
      handleSetPendingNote,
      handleRenameTape,
      handleDeleteTape,
      handleEditEntry,
      handleToggleSubtotal,
      handleToggleAlwaysOnTop,
      themeName,
    }),
    [
      state,
      press,
      handleUndo,
      handleRedo,
      handleClearTape,
      handleDeleteEntry,
      handleNewTape,
      handleSwitchTape,
      handleCycleTheme,
      handleExport,
      handleTapeClick,
      handleCopyResult,
      handleSetNote,
      handleSetPendingNote,
      handleRenameTape,
      handleDeleteTape,
      handleEditEntry,
      handleToggleSubtotal,
      handleToggleAlwaysOnTop,
      themeName,
    ]
  );
}
