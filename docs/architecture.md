# Architecture

## Overview

TapeCalc is a **Tauri 2** desktop application with a Rust backend and React 19 frontend. The Rust side is organized as a Cargo workspace with 7 focused crates. The frontend uses lazy-loaded views and custom hooks for clean separation of concerns.

## Crate Dependency Graph

```
hc-TapeCalc (src-tauri — Tauri app)
├── hc-TapeCalc-core           # Types, Tape, CalcResult, UndoStack
│   └── serde, thiserror
├── hc-TapeCalc-parser          # Lexer → AST → Evaluator
│   └── hc-TapeCalc-core
├── hc-TapeCalc-engine-numeric  # eval_numeric(), eval_numeric_ctx()
│   └── hc-TapeCalc-parser, hc-TapeCalc-core
├── hc-TapeCalc-engine-units    # convert(), UnitCategory
│   └── (standalone)
├── hc-TapeCalc-engine-currency # ExchangeRates, fetch_rates(), convert()
│   └── hc-TapeCalc-core, reqwest
├── hc-TapeCalc-export          # export_json/text/csv, import_json
│   └── hc-TapeCalc-core, serde_json
└── hc-TapeCalc-graphing        # evaluate_function(), intercepts
    └── hc-TapeCalc-parser
```

## Backend Module Structure

The Tauri application (`src-tauri/src/`) is organized into 7 command modules:

| Module | Responsibility | Key Commands |
|---|---|---|
| `state.rs` | `CalcState`, `AppState` | State management and persistence |
| `types.rs` | IPC DTOs | `TapeEntryDto`, `CalcDisplay`, `TapeState` |
| `helpers.rs` | Formatting, persistence, display | `save_all_tapes`, `load_all_tapes` |
| `calc.rs` | Calculator input | `get_state`, `button_press` |
| `tape.rs` | Tape management | undo, redo, clear, delete, export, rename |
| `conversion.rs` | Unit/currency conversion | `convert_units`, `convert_currency` |
| `graphing.rs` | Graph evaluation | `evaluate_graph_function`, intercepts |

## Frontend Structure

```
src/
├── App.tsx                    # Main app with keyboard handler
├── components/                # 13 UI components
│   ├── Header.tsx             # Navigation tabs + theme toggle
│   ├── CalculatorPanel.tsx    # Button grid + input display
│   ├── TapePanel.tsx          # Tape entries with scroll
│   ├── UnitsView.tsx          # Unit conversion tab
│   ├── CurrencyView.tsx       # Currency conversion tab
│   ├── SolverView.tsx         # Expression solver tab (lazy)
│   ├── GraphView.tsx          # Function graphing tab (lazy)
│   ├── SettingsView.tsx       # Settings tab (lazy)
│   └── ...                    # Toast, ConfirmDialog, ErrorBoundary, CustomSelect
├── hooks/                     # 7 custom hooks
│   ├── useCalculator.ts       # Core calc state + Tauri IPC
│   ├── useCurrencyConverter.ts
│   ├── useUnitsConverter.ts
│   ├── useGrapher.ts
│   ├── useSolver.ts
│   ├── useSettings.ts
│   └── useDebounce.ts
├── styles/                    # 8 CSS modules
│   ├── tokens.css             # Design tokens, themes
│   ├── base.css               # Resets, animations
│   ├── calculator.css         # Calculator buttons
│   ├── tape.css               # Tape entries
│   ├── conversion.css         # Unit/currency views
│   ├── components.css         # Shared components
│   ├── solver.css             # Solver + graph + responsive
│   └── layout.css             # App shell layout
└── utils/
    ├── mathEngine.ts          # Client-side expression evaluator (web fallback)
    └── formatting.ts          # Number formatting utilities
```

## Data Flow

1. **User input** → `CalculatorPanel` button click
2. **IPC call** → `invoke("button_press", { key })` via Tauri
3. **Rust processing** → `commands::calc::button_press()` → parser → evaluator
4. **State update** → `CalcState` updated → `CalcDisplay` DTO built
5. **Frontend refresh** → `invoke("get_state")` → React state update → re-render

## Themes

Three themes defined in `tokens.css`:
- **Professional Dark** (default) — Dark background, accent colors
- **Light** — Light background, dark text
- **High Contrast** — Maximum readability
