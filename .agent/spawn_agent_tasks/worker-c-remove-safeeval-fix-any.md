# Task: Remove Duplicate safeEval Parser + Fix `any` Types

## Goal
Remove the duplicated `safeEval()` function from `tauriMock.ts` (replace with `evaluate()` from `mathEngine.ts`), fix `any` type annotations in `CalculatorPanel.tsx`, and delete the now-unnecessary `safeEval.test.ts`.

## Files to Modify
- `src/tauriMock.ts` — remove `safeEval`, import `evaluate` from mathEngine
- `src/components/CalculatorPanel.tsx` — fix `any` type on icon prop
- `src/utils/__tests__/safeEval.test.ts` — DELETE this file

## Constraints
- DO NOT modify any files outside the three listed above
- DO NOT change the mock behavior — the calculator should still work the same way
- The `evaluate()` function from `mathEngine.ts` accepts `(expr: string, vars?: Record<string, number>)` and returns `number`. Use it as a drop-in replacement for `safeEval(expr)`.

## Detailed Instructions

### Step 1: Fix tauriMock.ts

1. Remove the entire `safeEval` function (lines 15-63) and its comment block (lines 11-13)
2. Add an import at the top: `import { evaluate } from "./utils/mathEngine";`
3. Find all places where `safeEval(...)` is called in the file and replace with `evaluate(...)`
   - There should be a call in the mock `button_press` handler where it evaluates the expression
   - The `evaluate()` function handles all the same operators plus scientific functions, so it's strictly better

### Step 2: Fix CalculatorPanel.tsx

Find the `CalcBtn` component's props or inline type definition. There should be something like:
```typescript
icon?: any
```

Replace with a proper React component type:
```typescript
icon?: React.ComponentType<{ size?: number }>
```

Or if using lucide-react's type:
```typescript
icon?: React.ComponentType<{ size?: number; className?: string }>
```

Look at how `icon` is used in the component's JSX to determine the correct type. It's likely rendered as `<Icon size={N} />`.

### Step 3: Delete safeEval.test.ts

Delete the file `src/utils/__tests__/safeEval.test.ts` entirely, since the function it tests no longer exists.

## Acceptance Criteria
1. `tauriMock.ts` no longer exports or contains `safeEval`
2. `tauriMock.ts` imports and uses `evaluate` from `./utils/mathEngine`
3. Calculator works the same in the browser (mock evaluates expressions correctly)
4. No `any` types in `CalculatorPanel.tsx`
5. `safeEval.test.ts` is deleted
6. No TypeScript errors

## When Done
Summarize changes made and confirm no compilation errors.
