# Task: CalculatorPanel UI Upgrades

## Goal
Implement two UI improvements in the CalculatorPanel component.

## Files to modify
- `src/components/CalculatorPanel.tsx`

## Constraints
- DO NOT modify any other files
- DO NOT change the component's props interface or public API
- Preserve all existing ARIA labels and accessibility attributes
- Keep all existing memo wrapping

## Changes Required

### Change 1: Dynamic Bracket Label (U8)
The smart brackets button currently always shows `( )` regardless of what will actually be inserted. Make it show the actual bracket that will be inserted.

**Current code** (around line 318):
```tsx
<CalcBtn label="( )" variant="op" onClick={handleBracket} title="Smart brackets — auto-inserts ( or )" ariaLabel="Insert bracket" />
```

**Required change**: Use the `getSmartBracket` function (already defined at line 55) to determine which bracket will be inserted, and display that character.

```tsx
<CalcBtn label={getSmartBracket(input)} variant="op" onClick={handleBracket} title="Smart brackets — auto-inserts ( or )" ariaLabel={`Insert ${getSmartBracket(input) === '(' ? 'opening' : 'closing'} bracket`} />
```

### Change 2: Dynamic Font Sizing for Result Display (D2)
When the result has many digits (12+), the 2rem font overflows. Add dynamic font sizing.

**Current code** (around line 235-245):
```tsx
<div
  className="text-right font-bold tabular-nums truncate"
  style={{
    fontSize: "2rem",
    lineHeight: 1.2,
    color: hasError ? "var(--accent-neg)" : "var(--fg-result)",
  }}
  aria-label={`Result: ${result || "0"}`}
>
```

**Required change**: Compute the font size dynamically based on digit count:

```tsx
const displayResult = result || "0";
const resultFontSize = displayResult.length > 16 ? "1.2rem" : displayResult.length > 12 ? "1.5rem" : "2rem";
```

Then use `resultFontSize` in the style. Add this computation before the JSX return, around line 166.

## When done
Summarize what was changed and confirm both changes compile without TypeScript errors.
