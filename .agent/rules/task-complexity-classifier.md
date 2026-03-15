---
description: Single reference for task complexity classification — gates, verification tiers, and tool budgets
---

# RULE: TASK COMPLEXITY CLASSIFIER

All rules, workflows, and gates reference this table for consistent complexity classification.

## Classification Table

| Level | Files | Domains | Examples | Gate | Verification | Tool Budget | **Delegation Mode** |
|---|---|---|---|---|---|---|---|
| **Trivial** | ≤1 | 1 | Typo, rename, config tweak, ≤10 lines | None | @dev self-verify | 10 | Persona-switch only |
| **Small** | ≤3 | 1 | Bug fix, small feature, style fix | Fast-path | @dev + @qc spot-check | 20 | Persona-switch (default), CLI optional |
| **Standard** | 4-6 | 1 | Pattern-following feature, repeated layout, data enrichment | Fast-path + quick validate | @dev + @qc spot-check (novel parts only) | 30 | **Lightweight delegation** |
| **Medium** | 7-10 | 1-2 | Novel feature, multi-component change | SPARC lite | Full @dev → @qc → @pm | 40 | **CLI workers preferred** |
| **Large** | >10 | 2+ | Epic, multi-domain feature | Full SPARC | Full + `/implementation-review` | 60 | **CLI workers MANDATORY** |
| **Epic** | >20 | 3+ | New module, architecture rework | SPARC + dialectical | Full + review + debate | 80 | **CLI workers MANDATORY + multi-worker** |

### Lightweight Delegation (Standard Tier)

A middle ground between persona-switching and full CLI worker spawning:

- **Orchestrator composes an inline prompt** (no template file required — use `-Prompt` flag)
- **Quick validation only** (placeholders + file paths, per `template-validation.md`)
- **No mandatory two-stage review pipeline** — orchestrator reviews `git diff` directly
- **Worker timeout**: 120s default (these are small, scoped tasks)

**Decision rule:** If the task is 4-6 files AND follows an existing pattern (novelty override = downgrade), use Lightweight Delegation. The key signal is: "a developer who has seen one example file could do the rest."

> [!TIP]
> **Large and Epic tasks:** Consider applying `structured-analysis-frameworks` (MECE decomposition or Issue Tree) during planning to ensure exhaustive problem decomposition before implementation. Use `amateur-proof-plans` to generate self-contained phase files with data flow, code contracts, and failure scenarios.

## How to Classify
1. Count the **files** expected to change (estimate up-front, refine as you go).
2. Count the **domains** involved (UI, engine, API, infra, testing = separate domains).
3. Use the highest matching level.
4. **Override by novelty:** An extension of an existing pattern (e.g., new page matching existing ones) may be downgraded one level. A novel pattern should never be downgraded.

## Analysis & Review Task Override

The Classification Table gates on **files changed**. But analysis/review tasks may change ZERO files while requiring Epic-level effort. Apply this override:

| Signal | Override Level | Rationale |
|---|---|---|
| Multi-agent review (3+ agent domains) | **Large** minimum | Each agent domain = independent analysis scope |
| User amplifier keywords ("exhaustive", "comprehensive", "extensive", "complete") | **+1 level** (from base) | User explicitly signals depth |
| "Call every agent" / "all agents" | **Epic** | Requires parallel independent analysis from all agent roles |

**Rule:** For analysis tasks, classify by **scope breadth** (number of independent perspectives needed), not by file count.

## Checkpoint Rule
At **75% of tool budget**, the agent MUST:
1. Summarize progress in `task.md`.
2. Assess remaining work vs. remaining budget.
3. **Token awareness check:** Estimate tokens consumed vs. lines of code changed so far. If ratio feels high (excessive re-reads, large context), note it and optimize remaining calls.
4. **Cognitive bias check:** Run `anti-patterns.md` §8 runtime bias scan.
5. If >50% of work remains → trigger Context Reset Protocol (`anti-patterns.md` §4).

## Cross-References
- **Verification Tiers** → `process-gates.md` §3
- **Dialectical Gate** → `dialectical-development.md`
- **Iteration Budget** → `agent-behavior.md` §5
- **Confidence Routing** → `confidence-routing.md`
