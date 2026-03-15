# Task: CurrencyView Offline Rates Banner

## Goal
Improve the offline rates UX by replacing the tiny "⚠ Offline rates" badge with a prominent amber banner.

## Files to modify
- `src/components/CurrencyView.tsx`

## Constraints
- DO NOT modify any other files (especially NOT index.css)
- DO NOT change the component's hooks or data flow
- Preserve all existing ARIA labels
- Use inline styles for new banner styling (to avoid CSS file conflicts)

## Changes Required

### Replace Offline Badge with Prominent Banner (U7)

**Current code** (around line 146-150): The offline indicator is a tiny badge inline with the subtitle:
```tsx
{isOffline ? (
  <span className="offline-badge">⚠ Offline rates</span>
) : (
  <span className="live-badge">{lastUpdated}</span>
)}
```

**Required change**: Keep the subtitle badge as-is (it's fine for live mode), but when offline, ALSO show a prominent banner below the error banner section (around line 176). Add this right after the error banner block and before the conversion card:

```tsx
{/* Offline rates warning banner */}
{isOffline && !error && (
  <div
    className="animate-fade-in"
    style={{
      maxWidth: 560,
      margin: '0 auto',
      width: '100%',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-md) var(--space-lg)',
      fontSize: 13,
      fontWeight: 600,
      color: '#fbbf24',
      background: 'rgba(251, 191, 36, 0.08)',
      border: '1px solid rgba(251, 191, 36, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
    }}
    role="alert"
  >
    <span style={{ fontSize: 16 }}>⚠</span>
    <span>Using offline exchange rates. Click <strong>Live Rates</strong> to update.</span>
  </div>
)}
```

## When done
Summarize what was changed and confirm it compiles without TypeScript errors.
