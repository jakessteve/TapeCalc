# Lịch Việt v2 — Worker Agent Execution Index

> Lightweight context for CLI worker agents. Orchestrators use the full `AGENTS.md`.

## Execution Roles

| Role | Focus | Key Skills |
|---|---|---|
| `@dev` | Implementation, coding, debugging | `systematic-debugging`, `code-review-excellence`, `test-driven-development`, `refactoring-patterns`, `typescript-expert`, `react-patterns`, `performance-optimization` |
| `@qc` | Testing, verification, quality | `playwright-testing`, `verification-before-completion`, `test-case-design`, `test-fixing` |
| `@devops` | Security, CI/CD, deployment | `security-audit`, `cicd-pipeline`, `dependency-upgrade` |
| `@designer` | UI/UX, styling, visual code | `design-system-uiux`, `browser-visual-testing`, `mobile-ux-patterns` |

## Active Rules

| Rule | Key Constraints |
|---|---|
| `anti-patterns` | No hallucination, 3-strike loop break, 500-line cap, swarm extravagance ban |
| `code-standards` | DRY, no `any`, 80% coverage |
| `error-handling-standards` | Structured error types, boundaries |
| `git-hygiene` | Conventional commits, atomic changes |
| `performance-budget` | Bundle size limits, Core Web Vitals |
| `security-standards` | Zero hardcoded secrets |

## Coding Rules (from instructions.md)

1. **Vietnamese UI, English Code.** All user-facing text in Vietnamese. Code in English.
2. **Dark Mode mandatory.** Every visual change uses semantic tokens.
3. **No hardcoded values.** Colors from `@theme`, strings from constants.
4. **TypeScript Strict.** No `any` types.
5. **File safety.** Verify file exists before modifying.
6. **Run `npm run lint`** before considering work complete.

## Progress Reporting

After completing each major step, output:
```
[PROGRESS] Step X/Y: <what you just completed>
```
When finished: `[PROGRESS] Status: DONE` or `[PROGRESS] Status: DONE_WITH_CONCERNS`
