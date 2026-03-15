# Changelog

All notable changes to TapeCalc are documented in this file.

## [2.0.0] — 2026-03-14

### Architecture
- **Rust workspace** — 7 crates: `core`, `parser`, `engine-numeric`, `engine-units`, `engine-currency`, `export`, `graphing`
- **Tauri 2** desktop shell with typed IPC commands
- **React 19** frontend with lazy-loaded views and custom hooks

### Features
- Multi-tape system with persistence, undo/redo, and notes
- Unit conversion (8 categories, 60+ units)
- Currency conversion with live exchange rates (Open Exchange Rates API)
- Expression solver with variables
- Function graphing with intercept analysis
- Three themes: Professional Dark, Light, High Contrast
- Full keyboard support (numpad, shortcuts, Ctrl+Z/Y)
- Export to JSON, plain text, and CSV
- Clipboard copy for tape entries and results

### Code Quality
- `commands.rs` split into 7 modules (`calc`, `tape`, `conversion`, `graphing`, `state`, `types`, `helpers`)
- `index.css` split into 8 feature CSS modules
- 85 Rust tests (76 unit + 11 doc-tests)
- 99 frontend tests (92 util + 7 component)
- CI with `cargo clippy -D warnings` (0 warnings)
- Content Security Policy (CSP) hardened

### Security
- CSP restricts `connect-src` to specific exchange rate APIs
- Input sanitization for all user-facing commands
- No hardcoded secrets
