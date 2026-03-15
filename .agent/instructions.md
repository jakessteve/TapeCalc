# Lịch Việt v2 — Development Instructions

You are developing the **Lịch Việt** (Vietnamese Lunar Calendar) web application.

## Project Context

- **Repo Type:** Vite + React + TypeScript SPA (monorepo with `packages/` workspace).
- **Goal:** All-in-one Vietnamese metaphysics platform — Lunar Calendar, Tử Vi (Eastern Astrology), Chiêm Tinh (Western Astrology), Mai Hoa Dịch Số (Plum Blossom Numerology), and daily Phong Thủy guidance.
- **Components:**
 - `src/` — React frontend (pages, components, services, utils)
 - `src/services/` — Domain engines: `tuvi/`, `chiemtinh/`, `maiHoa/`
 - `src/utils/` — Core calculation utilities (lunar calendar, activity scoring, astronomy)
 - `packages/` — Shared packages (future: core-engine extraction)

## Tech Stack & Conventions

- **Runtime:** Node.js (v20+), pnpm.
- **Framework:** React 19 + React Router 7, Vite 7.
- **Language:** TypeScript (Strict). No `any` types — define interfaces in relevant service files.
- **Styling:** TailwindCSS v4 with custom `@theme` tokens in `src/index.css`. Dark mode mandatory.
- **State:** Zustand for global state.
- **Testing:** Jest + Testing Library (unit), Vitest (integration).
- **Linting:** ESLint + Prettier, enforced via Husky pre-commit hooks.
- **Key Dependencies:** `iztro` (Tử Vi), `circular-natal-horoscope-js` (Western Astrology), `@dqcai/vn-lunar` (lunar calculations).

## Coding Rules

1. **Vietnamese UI, English Code:** All user-facing text in Vietnamese. Code comments, variable names, and docs in English.
2. **File Operations:** Always verify file exists before modifying. Use `view_file` → `grep_search` → understand → then edit.
3. **Dark Mode:** Every visual change MUST have both light and dark mode variants using semantic tokens.
4. **No Hardcoded Values:** Colors from `@theme`, strings from constants, calculations from utility functions.
5. **Security:** No hardcoded API keys. Validate all user inputs. Sanitize displayed data from external sources.
6. **Linting:** Run `npm run lint` before considering work complete.

## Digital DNA (Philosophy)

- **Academic Vietnamese Astrology:** Interpretations follow established Tam Hợp and Tứ Hóa school traditions, not pop astrology.
- **Owner-First Architecture:** Zero vendor lock-in. Self-hostable. Maximum control for the project owner.
- **Mobile-First UX:** Design for 375px first, then scale up. Calendar and astrology content must be usable on phones.

## Agent Framework

This project uses a multi-agent development framework. Read `AGENTS.md` for the full index of roles, rules, skills, guidelines, and workflows.

- **Roles:** `.agent/roles/` — Agent personas (@pm, @dev, @qc, @biz, etc.)
- **Rules:** `.agent/rules/` — Always-on constraints and policies
- **Guidelines:** `.agent/guidelines/` — Context-triggered best practices (not enforced per-task)
- **Skills:** `.agent/skills/` — Specialized capabilities auto-triggered by context
- **Workflows:** `.agent/workflows/` — Step-by-step pipelines triggered via `/slash-command`

> [!IMPORTANT]
> **Context Optimization:** CLI worker agents spawned via `spawn-agent` MUST use `AGENTS-LITE.md` as their context rulebook (not the full `AGENTS.md`). This reduces base context injection from ~20KB to ~3KB per worker session. Only orchestrator sessions (interactive conversations with the user) use the full `AGENTS.md`.
