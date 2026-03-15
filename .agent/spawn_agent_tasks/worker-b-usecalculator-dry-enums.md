# Task: DRY useCalculator.ts + Type-Safe Enums

## Goal
Refactor `useCalculator.ts` to eliminate 12 duplicate try-catch wrappers using a shared helper, AND make theme/angle_unit types stricter in `types.ts`.

## Files to Modify
- `src/hooks/useCalculator.ts`
- `src/types.ts`

## Constraints
- DO NOT modify any files outside the two listed above
- DO NOT change the public API (return value) of `useCalculator()`
- Keep `handleExport` and `handleCopyResult` separate — they have different invoke patterns (don't call setState)
- All functions must remain wrapped in `useCallback`

## Detailed Instructions

### Part 1: Extract `invokeAndSet` Helper (useCalculator.ts)

Currently, these functions all follow the same pattern:
```typescript
const handleX = useCallback(async (arg?: type) => {
  try {
    const result = await invoke<CalcDisplay>("command_name", { arg });
    setState(result);
  } catch (e) {
    console.error("[useCalculator] command_name failed:", e);
  }
}, []);
```

Create a helper inside the hook:
```typescript
const invokeAndSet = useCallback(async <A extends Record<string, unknown>>(
  cmd: string,
  args?: A
) => {
  try {
    const result = await invoke<CalcDisplay>(cmd, args);
    setState(result);
    return result;
  } catch (e) {
    console.error(`[useCalculator] ${cmd} failed:`, e);
  }
}, []);
```

Then refactor each function. For example:
```typescript
// Before
const press = useCallback(async (key: string) => {
  try {
    const result = await invoke<CalcDisplay>("button_press", { key });
    setState(result);
  } catch (e) {
    console.error("[useCalculator] button_press failed:", e);
  }
}, []);

// After
const press = useCallback(
  (key: string) => invokeAndSet("button_press", { key }),
  [invokeAndSet]
);
```

Functions to refactor this way:
- `press` → `invokeAndSet("button_press", { key })`
- `handleUndo` → `invokeAndSet("undo")`
- `handleRedo` → `invokeAndSet("redo")`
- `handleClearTape` → `invokeAndSet("clear_tape")`
- `handleDeleteEntry` → `invokeAndSet("delete_entry", { lineNumber })`
- `handleNewTape` → `invokeAndSet("new_tape")`
- `handleSwitchTape` → `invokeAndSet("switch_tape", { index })`
- `handleCycleTheme` → `invokeAndSet("cycle_theme")`
- `handleTapeClick` → `invokeAndSet("tape_entry_click", { lineNumber })`
- `handleSetNote` → `invokeAndSet("set_note", { lineNumber, note })`
- `handleRenameTape` → `invokeAndSet("rename_tape", { index, name })`
- `handleDeleteTape` → `invokeAndSet("delete_tape", { index })`

Keep `handleExport` and `handleCopyResult` as-is (they use different invoke signatures).

### Part 2: Type-Safe Enums (types.ts)

In `src/types.ts`, find the `CalcDisplay` interface and change:
- `theme: number` → `theme: 0 | 1 | 2`
- `angle_unit: string` → `angle_unit: "DEG" | "RAD"`

Then update `useCalculator.ts`:
- The `themeName` useMemo should work with the numeric union type automatically
- The `THEME_NAMES` array access `THEME_NAMES[state.theme]` should still work since `0 | 1 | 2` is valid for array indexing

## Acceptance Criteria
1. `useCalculator()` returns the exact same public API
2. All 12 functions use `invokeAndSet` instead of manual try-catch
3. `handleExport` and `handleCopyResult` remain unchanged
4. `types.ts` uses discriminated types for `theme` and `angle_unit`
5. No TypeScript errors

## When Done
Summarize all changes with before/after examples.
