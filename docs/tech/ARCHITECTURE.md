# Architecture Overview

## Project Type
Vite 7 + React 19 + TypeScript SPA (monorepo with `packages/` workspace).

## Directory Structure

```
src/
├── components/        # Shared UI components
├── pages/             # Route-level page components
├── services/          # Domain engines
│   ├── tuvi/          # Tử Vi (Eastern Astrology) — iztro-based
│   ├── chiemtinh/     # Chiêm Tinh (Western Astrology)
│   └── maiHoa/        # Mai Hoa Dịch Số (Plum Blossom Numerology)
├── utils/             # Core calculation utilities
│   ├── lunar/         # Lunar calendar calculations
│   ├── astronomy/     # Astronomical computations
│   └── scoring/       # Activity scoring (Dụng Sự)
├── stores/            # Zustand state management
└── index.css          # TailwindCSS v4 @theme tokens
packages/              # Shared packages (future: core-engine extraction)
```

## Tech Stack
- **Runtime:** Node.js 20+, pnpm
- **Framework:** React 19, React Router 7, Vite 7
- **Language:** TypeScript (Strict, no `any`)
- **Styling:** TailwindCSS v4 with custom `@theme` tokens, dark mode mandatory
- **State:** Zustand
- **Testing:** Jest + Testing Library (unit), Vitest (integration)

## Key Architectural Decisions
1. **No Backend API** — All computation is client-side via domain engine libraries
2. **TypeScript interfaces as contracts** — See `API_CONTRACTS.md`
3. **Mobile-first design** — 375px baseline, responsive scaling
4. **Academic accuracy** — Astrology engines follow established Tam Hợp and Tứ Hóa school traditions
