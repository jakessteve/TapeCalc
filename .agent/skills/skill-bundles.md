---
description: Skill Bundle Reference — pre-grouped skill sets by task type for fast orchestrator lookup. Pick a bundle (10 options) instead of scanning individual skills (88 options).
---

# SKILL BUNDLES

## Purpose
Instead of scanning 88 individual skills, the orchestrator picks the relevant **bundle** for the task type. Each bundle lists the skills in activation order with clear skip rules.

---

## Bug Fix Bundle
1. `systematic-debugging` — multi-hypothesis approach
2. `verification-before-completion` — verify fix

**Skip:** `amateur-proof-plans`, `red-team-ideas`, `critical-thinking-models`

---

## Quick Feature Bundle (Trivial/Small/Standard)
1. `task-decomposition` (if multi-file)
2. `verification-before-completion`

**Skip:** `amateur-proof-plans`, dialectical gates, review workflows

---

## Feature Implementation Bundle (Medium+)
1. `task-decomposition` → break into sub-tasks
2. `amateur-proof-plans` → phase files with code contracts
3. `worker-delegate` → spawn decision
4. `verification-before-completion` → QC
5. `implementation-debate` (if novel approach) → post-build review

**Skip:** `red-team-ideas` (unless architectural decision)

---

## Research Bundle
1. `research-analysis` → structured research with citations
2. `context7-integration` → library/API docs
3. `sequential-thinking` → complex reasoning chains

**Skip:** All implementation/testing skills

---

## UI/UX Bundle
1. `design-system-uiux` → design rules + 99 UX guidelines
2. `mobile-ux-patterns` → responsive patterns
3. `animation-choreography` → micro-interactions + timing
4. `browser-visual-testing` → visual verification
5. `user-experience-testing` → UX feedback scorecard

**Skip:** Backend/infra/security skills

---

## Architecture Bundle
1. `senior-architect` → ADR document
2. `architecture-patterns` → pattern selection
3. `c4-architecture` → diagrams (Context/Container/Component/Code)
4. `domain-driven-design` (if complex domain) → bounded contexts
5. `critical-thinking-models` → 7-model decision quality check
6. `structured-analysis-frameworks` → MECE decomposition, Issue Trees

**Skip:** Implementation/testing/UI skills

---

## Security Bundle
1. `security-audit` → OWASP 2021 A01-A10 scan
2. `penetration-testing` → exploit testing + PoCs
3. `api-security-testing` → auth bypass, BOLA/IDOR, injection
4. `attack-simulation` → red team attack chains

**Skip:** UI/UX, business, content skills

---

## Business & GTM Bundle
1. `competitive-landscape` → feature matrix + positioning
2. `market-sizing` → TAM/SAM/SOM calculations
3. `monetization-strategy` → revenue model + pricing
4. `content-marketing` → blog posts, release announcements
5. `launch-strategy` → GTM plan + channel strategy
6. `growth-metrics` → AARRR metrics, feature adoption

**Skip:** Technical implementation/testing skills

---

## Testing Bundle
1. `test-case-design` → ISTQB techniques (EP, BVA, decision tables)
2. `test-driven-development` → red-green-refactor cycle
3. `playwright-testing` → E2E browser tests
4. `regression-strategy` → risk-based test selection
5. `test-fixing` → root cause + stable fix for flaky tests

**Skip:** Business/architecture/design skills

---

## DevOps Bundle
1. `cicd-pipeline` → CI/CD setup + pipeline config
2. `docker-containerization` → multi-stage Dockerfile, compose
3. `infrastructure-as-code` → Terraform/Pulumi modules
4. `observability-engineer` → logging/metrics/tracing
5. `slo-implementation` → SLI/SLO/SLA definitions

**Skip:** UI/UX, business skills

---

## How to Use

1. **Identify task type** from the Auto-Delegation Table in `@pm.md` §3.2.
2. **Load the matching bundle** — read only the listed skills.
3. **Activate in order** — skills are listed in optimal activation sequence.
4. **Skip explicitly** — each bundle lists what to skip to save context.
5. **Fallback** — if no bundle matches, fall back to individual skill lookup in `AGENTS.md`.

## Cross-References
- **Auto-Delegation Table** → `@pm.md` §3.2
- **Full Skill Index** → `AGENTS.md`
- **Skill Details** → `.agent/skills/[skill-name].md`
