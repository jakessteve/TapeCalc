# Task: Fix Graph Trace Bug + Pre-populate sin(x)

## Goal
Fix two issues in the Graph tab: (1) a coordinate calculation bug in the trace feature, and (2) the empty graph on first visit.

## Files to Modify
- `src/components/GraphView.tsx`
- `src/hooks/useGrapher.ts`

## Constraints
- DO NOT modify any files outside the two listed above
- DO NOT change the overall component structure or Canvas rendering logic
- Keep all existing functionality working

## Detailed Instructions

### Fix 1: Trace Coordinate Bug (GraphView.tsx)

Find line 468 (approximately) which contains:
```typescript
const mx = grapher.viewport.xMin + (x / 1) * xRange;
```

The `x / 1` is wrong — it should divide by the actual canvas width to normalize the mouse position. The canvas element is available via a ref. Look at how the component gets the canvas dimensions (likely via a ref or the `width` prop passed to the GraphCanvas component).

The fix should look something like:
```typescript
const canvasEl = canvasRef.current; // or however the canvas width is obtained
const canvasWidth = canvasEl?.width || 800; // fallback
const mx = grapher.viewport.xMin + (x / canvasWidth) * xRange;
```

Look at how `onTraceMove` is called from `GraphCanvas` to understand what `x` represents (likely a pixel coordinate on the canvas). Then ensure the division uses the actual canvas pixel width.

### Fix 2: Pre-populate sin(x) (useGrapher.ts)

Find the initial state for the `functions` array in `useGrapher.ts`. It likely starts as an empty array or with a placeholder. Change it so the default state includes one function:

```typescript
const [functions, setFunctions] = useState<GraphFunction[]>([
  { id: 'f1', expression: 'sin(x)', color: '#8b5cf6', visible: true }
]);
```

Make sure the type matches whatever `GraphFunction` interface is defined. Look at the existing type definition and match it exactly.

## Acceptance Criteria
1. Opening the Graph tab shows a sin(x) curve immediately (not an empty grid)
2. The trace feature shows correct x,y coordinates when hovering over the graph
3. No TypeScript errors (`npx tsc --noEmit` passes)
4. Existing graph functionality (zoom, pan, add/remove functions) still works

## When Done
Summarize the exact changes made, including line numbers and before/after diffs.
