# Architecture Overview

> **This file is kept for backward compatibility.** For the full architecture documentation, see [docs/architecture.md](docs/architecture.md).

## Summary

TapeCalc is a **Tauri 2** desktop app with a **Rust** backend (7 workspace crates) and **React 19 + TypeScript** frontend.

### Backend Crates
- `core` — Types, Tape, CalcResult, UndoStack
- `parser` — Expression lexer + evaluator
- `engine-numeric` — Numeric evaluation bridge
- `engine-units` — Unit conversion (8 categories)
- `engine-currency` — Live exchange rates via reqwest
- `export` — JSON, text, CSV export
- `graphing` — Function evaluation + intercept finding

### Frontend
- React 19 with lazy-loaded views
- 7 custom hooks for state management
- 8 CSS modules for organized styling
- Vitest + Testing Library for testing

See [docs/architecture.md](docs/architecture.md) for complete details including data flow, module structure, and dependency graph.
