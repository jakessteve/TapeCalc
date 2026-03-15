# Development Guide

## Prerequisites

- **Node.js** 20+ and npm
- **Rust** toolchain (install via [rustup](https://rustup.rs))
- **Tauri CLI** — installed automatically via `@tauri-apps/cli` devDependency

## Setup

```bash
git clone <repo-url>
cd TapeCalc
npm install
```

## Development

### Web-only (no Tauri)
```bash
npm run dev
```
Opens at http://localhost:5173. Uses `tauriMock.ts` to simulate Tauri IPC calls in the browser.

### Tauri Desktop App
```bash
npm run tauri dev
```
Starts the Rust backend + Vite dev server with HMR.

## Testing

### Frontend Tests (Vitest)
```bash
npm test               # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```
- **99 tests** across 3 test files
- Utility tests: `src/utils/__tests__/formatting.test.ts`, `mathEngine.test.ts`
- Component tests: `src/components/__tests__/Header.test.tsx`
- Environment: jsdom with `@testing-library/react`

### Backend Tests (Cargo)
```bash
cargo test --workspace              # All tests (85 total)
cargo test --workspace --doc        # Doc-tests only (11)
cargo clippy --workspace -- -D warnings  # Lint check
cargo doc --workspace --no-deps     # Generate docs
```
- **76 unit tests** + **11 doc-tests** across 7 crates
- Doc-tests cover: `Tape::new`, `eval_numeric`, `eval_numeric_ctx`, `convert`, `export_json`, `import_json`, `export_text`, `export_csv`, `evaluate_function`

### Type Checking
```bash
npx tsc --noEmit
```

## Build

### Production Web Build
```bash
npm run build
```
Output in `dist/`. Bundle analysis:
- CSS: 66.80 kB (12.08 kB gzip)
- JS main: 219.32 kB (68.82 kB gzip)
- 7 lazy-loaded chunks for non-critical views

### Tauri Desktop Build
```bash
npm run tauri build
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. `cargo test --workspace --locked`
2. `cargo clippy --workspace --locked -- -D warnings` (blocking)
3. `npm ci && npm run build`
4. `npm test`

## Code Style

- **Rust**: `cargo clippy` with `-D warnings`, `cargo fmt`
- **TypeScript**: ESLint + Prettier (see `.eslintrc.cjs`, `.prettierrc`)
- **CSS**: Vanilla CSS modules in `src/styles/`
- **Commits**: Conventional Commits format recommended
