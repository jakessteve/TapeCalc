# Product Requirements Document — TapeCalc v2

## Vision
A professional-grade tape calculator desktop application that combines the simplicity of a traditional adding machine with modern features like multi-tape management, unit/currency conversions, expression solving, and graphing — all powered by a fast Rust backend.

## Target Users
- Professionals needing a quick, reliable desktop calculator with tape history
- Students and engineers who benefit from expression solving and graphing
- Users who work with unit conversions and currency exchange regularly

## Core Requirements
1. **Tape Calculator** — Running tape with undo/redo, notes, and grand totals
2. **Multi-Tape Management** — Create, switch, rename, delete independent tapes
3. **Unit Conversion** — 8 categories, 60+ units with bidirectional conversion
4. **Currency Conversion** — Live exchange rates with configurable auto-refresh
5. **Expression Solver** — Algebraic evaluation with variables (Labs)
6. **Function Graphing** — Plot functions, find intercepts (Labs)
7. **Cross-platform** — Tauri desktop app (Windows, macOS, Linux)

## Quality Requirements
- Fast response (<50ms for all calculator operations)
- Full keyboard support (numpad, shortcuts)
- Three themes (Dark, Light, High Contrast)
- Accessible (ARIA labels, skip-link, semantic HTML)
- Comprehensive test suite (85 Rust + 99 JS tests)

## Non-Goals (Current Phase)
- Cloud sync or user accounts
- Mobile app (web fallback available for browser testing)
- Monetization
- Plugin system

## Architecture
See [docs/architecture.md](docs/architecture.md) for full technical details.
