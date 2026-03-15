---
description: Always On — SOT-driven development, SPARC compliance, verification gates, and commit discipline
---

# RULE: PROCESS GATES (Combined)

All agents MUST follow these process gates to maintain quality and consistency.

---

## 1. SOT-Driven Development

All work references and updates **Source of Truth** documents. Do NOT deviate from approved SOT.

**SOT Documents:** `docs/biz/PRD.md`, `docs/tech/ARCHITECTURE.md`, `docs/tech/API_CONTRACTS.md`, `WIREFRAMES.md`.

> [!NOTE]
> `WIREFRAMES.md` and `docs/biz/PRODUCT_BRIEF.md` are **created on demand** by @designer and @ba respectively during `/design-to-code` and `/hc-sdlc` workflows. Their absence does not block work — check if they exist before referencing them.

**Before coding:** Read relevant SOT. **After coding:** Update SOT if implementation deviated. **If conflict:** SOT wins — discuss deviations with @pm before proceeding.

---

## 2. SPARC Compliance

All development MUST follow the SPARC phases: Specification → Pseudocode → Architecture → Refinement → Completion.

- Do NOT skip phases (use `/hc-sdlc` workflow).
- Each phase produces artifacts that feed the next.
- For **Medium+ tasks**, use `amateur-proof-plans` skill during Specification to generate detailed phase files.
- Fast-path (≤3 files, single concern) may skip to Refinement.

### 2.0 Frontend-Only Project Adaptation
This project is a **frontend-only SPA** with no custom backend API. The SPARC gates adapt as follows:

| Standard Gate | Frontend Adaptation |
|--------------|-------------------|
| S→P: Pseudocode required | Optional for UI-only features — wireframe/mockup or user story is sufficient |
| A→R: `docs/tech/API_CONTRACTS.md` required | TypeScript interfaces in service files serve as implicit contracts — see `docs/tech/API_CONTRACTS.md` |
| Security Gate: @devops review | Required only for features handling user data, external APIs, or auth flows |
| A→R: `docs/tech/ARCHITECTURE.md` required | See project-level `docs/tech/ARCHITECTURE.md` for overall structure |

### 2.1 Market Validation Gate (Upstream)
Before any **P1+ feature** enters the SPARC Specification phase:
- A market research record MUST exist in `.hc/business/research/` (from `/market-research` workflow).
- @pm must verify the market research recommendation is **GO** or **CONDITIONAL GO** (with conditions met).
- **Exception:** Bug fixes, technical debt, and P2 minor features may skip this gate.

### 2.2 Discovery Gate (Upstream)
Before any **new feature** enters `/scaffold-feature` or `/hc-sdlc`:
- A product discovery record MUST exist in `.hc/discovery/` (from `/product-discovery` workflow).
- The discovery decision must be **GO** (composite score ≥ 4.0).
- **Exception:** Bug fixes, direct user requests with clear acceptance criteria, and trivial enhancements may skip this gate.

> [!IMPORTANT]
> These upstream gates prevent building features that lack market validation or user-need verification. They are the "should we build this?" gates that precede the "how should we build this?" SPARC phases.

---

## 3. Verification Gate (Tiered)

Before any task is marked complete, apply the verification tier matching the task's complexity (see `task-complexity-classifier.md`):

### Verification Tiers

| Tier | Scope | Required Steps | QC Persona Switch? |
|---|---|---|---|
| **Trivial** (≤1 file, ≤10 lines) | Typo fixes, renames, config tweaks | @dev self-verify: tests pass + type-check | No |
| **Small** (≤3 files, single concern) | Bug fixes, small features | @dev verify + @qc spot-check (tests + tsc only) | Minimal |
| **Standard** (4-6 files, pattern) | Pattern-following features | @dev verify + @qc spot-check novel parts only (skip repeated-pattern files) | Minimal |
| **Medium** (7-10 files) | Novel features, multi-component | Full: @dev → @qc (tests + tsc + visual if UI) → @pm synthesis | Full |
| **Large** (>10 files, multi-domain) | Epics, architecture changes | Full + `/implementation-review` + cross-verification gates | Full |

### Standard Verification Steps (Medium+)
1. Tests pass (`npm test`).
2. Linting passes (`npm run lint`).
3. Type check passes (`npx tsc --noEmit`).
4. Visual verification for UI changes (browser screenshot).
5. SOT documents updated if needed.

Use `verification-before-completion` skill checklist.

### 3.1 Security Cross-Verification Gate (Large tasks or security changes)
- @devops implements the security fix.
- @whitehat-hacker MUST independently attempt to exploit or bypass the fix.
- Only if @whitehat-hacker confirms resilience can the task be marked Done.

### 3.2 UX Cross-Verification Gate (ANY task with UI changes)
- @designer or @dev implements the UI/UX change.
- @user-tester MUST independently evaluate from end-user perspectives (via `/user-test-session`).
- Only if @user-tester confirms UX quality can the task be marked Done.
- **Applies to ALL tasks that touch UI files** (`.tsx`, `.css`, `.html`), regardless of complexity tier.
- @pm decides: "Does this need UAT?" — if ANY UI file was modified, the answer is **YES**.

### 3.3 Bug Fix Gate (Bug Record → Fix)
Before @dev starts fixing ANY bug discovered by @qc or @user-tester:
1. **Bug record MUST exist** in `.hc/bugs/[bug-slug].md` (created by @qc per `@qc.md` §7.6).
2. **@pm MUST triage** the bug by severity:
 - Critical → Fix immediately, blocks deployment.
 - Medium → Queue for current sprint.
 - Minor → Backlog (may defer).
3. **@dev MUST read the bug record** before coding the fix — understand reproduction steps, root cause hypothesis, and affected files.
4. **@dev MUST NOT** start a bug fix from a verbal description or chat message alone.

> [!CAUTION]
> No bug fix without a bug record. This prevents "fix it on the fly" anti-pattern where bugs are fixed but never documented, making regression tracking impossible.

### 3.4 Bug Fix Re-Verification Gate
After @dev fixes a bug:
1. @dev runs `verification-before-completion` skill (same as original implementation).
2. @dev hands back to @pm (same QC hand-off as `@dev.md` §3.15).
3. **@pm MUST switch to @qc** and independently verify:
 - The specific bug is resolved (reproduce → confirm fixed).
 - No regressions introduced (run full test suite).
 - Bug record in `.hc/bugs/` updated to `Status: Fixed` with fix description.
4. **If @qc finds the fix incomplete or introduces new bugs** → route back to @dev with updated bug record. This cycle repeats until @qc passes.

### 3.5 UAT Done-Gate
After @user-tester completes a `/user-test-session`:
1. @pm reviews the feedback report from `.hc/feedback/user-feedback-*.md`.
2. **If ANY Critical finding exists:**
 - Task status MUST remain **"In Progress"** — cannot be marked Done.
 - Critical findings are logged in `.hc/bugs/` via the Bug Record Gate (§3.3).
 - @dev fixes → @qc re-verifies (§3.4) → @user-tester re-tests the specific issue.
 - Only after ALL Criticals are resolved and re-tested can @pm mark Done.
3. ** Medium findings** are queued as stories in `.hc/stories/` — they do NOT block Done.
4. ** Minor findings** are noted in report only — they do NOT block Done.

> [!IMPORTANT]
> The UAT Done-Gate is the FINAL gate before "Done". No task with unresolved Critical UAT findings can be reported as complete to the User.

---

## 4. Commit Discipline

- **Atomic commits:** One logical change per commit.
- **Conventional format:** `type(scope): description` — e.g., `feat(tuvi): add palace interpretation`.
- **Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`.
- **Never commit:** Broken tests, lint errors, `console.log` debugging, secrets.
