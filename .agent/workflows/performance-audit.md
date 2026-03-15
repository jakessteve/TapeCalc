---
description: Performance Audit - Lighthouse, bundle analysis, runtime profiling, and optimization
---

# Workflow: /performance-audit

**Trigger:** Performance concerns, pre-release, or quarterly health check.

## Steps

### 1. Lighthouse Audit
// turbo
Use `browser_subagent` to run Lighthouse on key pages. Record LCP, FID, CLS, INP scores.

### 2. Bundle Analysis
// turbo
```bash
npx vite-bundle-analyzer
```
Identify largest chunks, unused code, heavy dependencies.

### 3. Runtime Profiling
Use Chrome DevTools Performance tab to profile key user flows.
Look for: long tasks, excessive re-renders, memory leaks.

### 4. Identify Optimizations
@dev uses `performance-optimization` skill to plan fixes:
- Code splitting opportunities
- Memoization candidates
- Image optimization
- Lazy loading targets

### 5. Implement Fixes
@dev applies optimizations, uses `refactoring-patterns` for safe changes.

### 6. Re-Measure
Re-run Lighthouse and bundle analysis. Compare before/after.
Verify performance budget compliance (rule `performance-budget`).

### 7. Document
Record results in `.hc/benchmarks/performance-audit-YYYY-MM-DD.md`.
