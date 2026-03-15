# Task: SettingsView UI Upgrades

## Goal
Implement two UI improvements in the SettingsView component.

## Files to modify
- `src/components/SettingsView.tsx`

## Constraints
- DO NOT modify any other files (especially NOT index.css)
- DO NOT change the component's props interface
- Preserve all existing ARIA labels

## Changes Required

### Change 1: Dynamic Version from package.json (B9)
The About section currently hardcodes "Version 2.0.0". Make it dynamic.

**Current code** (around line 160):
```tsx
<div className="text-xs text-dim">Version 2.0.0</div>
```

**Required change**: Import the version from package.json and use it:

At the top of the file, add:
```tsx
import packageJson from '../../package.json';
```

Then replace the hardcoded version:
```tsx
<div className="text-xs text-dim">Version {packageJson.version}</div>
```

### Change 2: Style Keyboard Shortcuts as kbd Elements (D15)
The keyboard shortcuts table shows plain text for keys. Style them as `<kbd>` elements with an inset shadow for a premium look.

**Current code** (around line 141):
```tsx
<td className="px-4 py-2.5 font-mono font-semibold text-accent">{key}</td>
```

**Required change**: Wrap the key text in a `<kbd>` element with inline styles (to avoid CSS file changes):

```tsx
<td className="px-4 py-2.5">
  <kbd style={{
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600,
    color: 'var(--accent-primary)',
    background: 'var(--bg-btn)',
    border: '1px solid var(--border-medium)',
    borderRadius: 6,
    boxShadow: 'inset 0 -2px 0 var(--border-medium)',
  }}>{key}</kbd>
</td>
```

## When done
Summarize what was changed and confirm both changes compile without TypeScript errors.
