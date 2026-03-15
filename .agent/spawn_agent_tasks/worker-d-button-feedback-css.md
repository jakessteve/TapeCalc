# Task: Add Button Press Feedback + Focus Ring to Calculator

## Goal
Add tactile `:active` press feedback and `:focus-visible` keyboard focus rings to ALL calculator buttons.

## Files to Modify
- `src/index.css` — ONLY this file

## Constraints
- DO NOT modify any files other than `src/index.css`
- DO NOT remove or change any existing styles
- ADD new rules, don't replace existing ones
- Keep the changes minimal and surgical

## Detailed Instructions

### 1. Add `:active` press effect to `.calc-btn`

Find the `.calc-btn` class definition in `index.css`. Add an `:active` state that provides a scale-down effect for tactile feedback:

```css
.calc-btn:active {
  transform: scale(0.93);
  transition: transform 0.08s ease;
}
```

Also ensure `.calc-btn` itself has `transition: transform 0.08s ease` in its base styles so the bounce-back is smooth too. If it already has a transition property, append `transform 0.08s ease` to it.

### 2. Add `:focus-visible` ring to ALL `.calc-btn` variants

Currently, only `.calc-btn.func` and `.calc-btn.action` may have focus styles. Add a universal focus ring for keyboard navigation:

```css
.calc-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  z-index: 1;
}
```

This should apply to ALL `.calc-btn` elements, including digit buttons, operator buttons, and function buttons.

### 3. Enhance operator button visibility in light theme

Find the light theme section `[data-theme="light"]` and check if operator buttons (÷, ×, −, +, =) have sufficient contrast. If their text color is too light against the button background, increase the contrast:

```css
[data-theme="light"] .calc-btn.op {
  color: var(--accent);
  font-weight: 700;
}
```

Only add this if the operator buttons currently look washed out in light theme.

## Acceptance Criteria
1. Pressing any calculator button shows a visible scale-down effect
2. Tabbing through buttons with keyboard shows a purple outline ring
3. Existing button styles (colors, sizes, hover effects) are unchanged
4. All three themes (dark, light, high-contrast) render correctly
5. No CSS errors

## When Done
List the exact CSS rules added and their line numbers.
