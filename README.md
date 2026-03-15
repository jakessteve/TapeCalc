# TapeCalc

A modern tape calculator desktop app built with **Tauri 2** (Rust backend) and **React 19** (TypeScript frontend). Features a professional multi-tape system, unit/currency conversions, expression solver, and real-time graphing.

## Features

- **Tape Calculator** — Running tape with unlimited undo/redo, notes, and grand totals
- **Multi-Tape** — Create, switch, rename, and delete independent calculation tapes
- **Unit Conversion** — 8 categories: length, mass, temperature, volume, area, speed, time, data
- **Currency Conversion** — Live exchange rates from Open Exchange Rates API
- **Expression Solver** — Algebraic expression evaluation with variables
- **Graphing** — Function graphing with y-intercept and x-intercept analysis
- **Themes** — Professional Dark, Light, and High Contrast modes
- **Keyboard Shortcuts** — Full keyboard support including numpad, Ctrl+Z/Y
- **Export** — JSON, plain text, and CSV export formats
- **Clipboard** — Copy tape or individual results to clipboard

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Tauri 2.10 |
| Backend | Rust (7 workspace crates) |
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | TailwindCSS v4 + custom CSS modules |
| Testing | Vitest (frontend), cargo test (backend) |
| CI | GitHub Actions |

## Quick Start

```bash
# Prerequisites: Node.js 20+, Rust toolchain, Tauri CLI

# Install dependencies
npm install

# Run in development mode (web only)
npm run dev

# Run as Tauri desktop app
npm run tauri dev

# Run tests
npm test                    # Frontend (99 tests)
cargo test --workspace      # Backend (85 tests)

# Production build
npm run tauri build
```

## Project Structure

```
TapeCalc/
├── crates/                 # Rust workspace crates
│   ├── core/               # Types, Tape, CalcResult, UndoStack
│   ├── parser/             # Expression lexer + evaluator
│   ├── engine-numeric/     # Numeric evaluation bridge
│   ├── engine-units/       # Unit conversion engine
│   ├── engine-currency/    # Currency conversion with live rates
│   ├── export/             # JSON, text, CSV export
│   └── graphing/           # Function evaluation + intercepts
├── src/                    # React frontend
│   ├── components/         # UI components (13 files)
│   ├── hooks/              # Custom React hooks (7 files)
│   ├── styles/             # CSS modules (8 files)
│   └── utils/              # Math engine + formatting
├── src-tauri/              # Tauri application
│   └── src/commands/       # IPC command modules (7 files)
└── docs/                   # Project documentation
```

## Documentation

- [Architecture](docs/architecture.md) — Crate structure, module boundaries, data flow
- [Development](docs/development.md) — Setup, building, testing, CI/CD
- [Features](docs/features.md) — Feature specifications and IPC commands

## License

MIT
