# Task: Clean Up SettingsView — Remove Dead Buttons + Fix Misleading UI

## Goal
Remove non-functional buttons and fix misleading labels in the Settings tab to ensure the UI doesn't promise features that don't exist.

## Files to Modify
- `src/components/SettingsView.tsx` — ONLY this file

## Constraints
- DO NOT modify any files other than `src/components/SettingsView.tsx`
- DO NOT change the component's props or exported interface
- Keep the version info text and "Made with ❤️" footer
- Keep the overall layout structure

## Detailed Instructions

### 1. Remove the "Check for Updates" Button

Find and remove the button around line 255-257:
```tsx
<button className="toolbar-btn text-[10px] flex items-center gap-1.5 border border-border-light rounded-full px-3 py-1">
  Check for Updates
</button>
```

Delete it entirely. Keep the version info (`TapCalc v2.0.0` and `Build: 2026.03.13`) — just remove the button.

### 2. Remove Dead External Links

Find and remove the entire `<div className="flex gap-4 ...">` block around lines 263-273 that contains:
- "Documentation" link button
- "GitHub Repository" link button
- "Privacy Policy" link button

These are all `<button>` elements with no `onClick` handler. Remove the entire flex container and its children. Also remove the `border-t` div that separates them from the description text above.

### 3. Fix "Auto-save" Setting (if present)

Search the file for any mention of "Auto-save" or "auto-save". If there's a setting row that says "Auto-save" with an "Enabled" indicator or toggle, change its label to clearly indicate it's not yet implemented:
- Option A: Change label to "Auto-save" with "(Coming soon)" badge
- Option B: Remove the setting entirely if it serves no function

### 4. Fix Any `any` Type Annotations

Search the file for `any` type annotations. Any icon prop typed as `any` should be replaced with:
```typescript
React.ComponentType<{ size?: number }>
```

Or the correct type based on usage context.

## Acceptance Criteria
1. No dead buttons visible in Settings tab
2. No misleading "Auto-save: Enabled" text
3. Version info still displays correctly
4. No `any` types in the file
5. Settings tab still renders correctly with all functional features (theme toggle, angle unit toggle, Labs toggle)
6. No TypeScript errors

## When Done
List exactly what was removed/changed with before/after.
