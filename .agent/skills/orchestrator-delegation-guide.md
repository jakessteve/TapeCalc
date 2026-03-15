---
description: Orchestrator Delegation Guide — single-reference for CLI worker delegation decisions, prompt composition, execution, and review. Consolidates knowledge from worker-delegate, amateur-proof-plans, and system-prompt patterns.
---

# SKILL: ORCHESTRATOR DELEGATION GUIDE

**Trigger:** When @pm considers delegating work to a CLI worker agent (Gemini CLI or Codex CLI) instead of using persona-switching.

> This guide consolidates the delegation decision and execution pipeline into one reference. For deeper detail on individual topics, see `worker-delegate.md` (decision gate), `amateur-proof-plans.md` (phase planning), and the spawn-agent SKILL.md.

---

## Quick Decision: Delegate or Persona-Switch?

```
Task received
 │
 ├─ Touches ≤3 files? ──────────── YES → Persona-switch (fast-path)
 │
 ├─ Requires user interaction? ──── YES → Persona-switch
 │
 ├─ Scope unclear/ambiguous? ────── YES → Persona-switch (workers can't ask Qs)
 │
 ├─ 4-6 files, pattern-following? ── YES → Lightweight delegation (inline -Prompt)
 │
 ├─ 7-10 files? ────────────────── Check conditions:
 │ ├─ Context pressure high? ────── YES → DELEGATE
 │ ├─ 2+ independent sub-tasks? ── YES → DELEGATE (parallel workers)
 │ ├─ Read-only research? ──────── YES → DELEGATE (context savings ~80%)
 │ ├─ Post-plan execution? ──────── YES → DELEGATE (always after approved plan)
 │ └─ None of the above? ────────── Persona-switch
 │
 └─ 10+ files across modules? ───── YES → DELEGATE (always)
```

---

## The 5 Checks (All Must Pass Before Spawning)

| # | Question | Required |
|---|----------|----------|
| 1 | Can a dev with ZERO project knowledge execute this prompt? | |
| 2 | Is file scope explicit (modify / read-only / off-limits)? | |
| 3 | Is tech stack context included? | |
| 4 | Is there a reference file for the worker? | |
| 5 | Is the expected output format defined? | |

**If ANY → Fix the prompt first. Don't waste a worker session.**

---

## Template Quick Reference

| Task Shape | Template | Location |
|------------|----------|----------|
| Feature / module / refactor | `implementation-task.md` | `.agent/spawn_agent_tasks/templates/` |
| Safe refactoring (extract, move, rename) | `refactoring-task.md` | `.agent/spawn_agent_tasks/templates/` |
| Dependency upgrade / schema migration | `migration-task.md` | `.agent/spawn_agent_tasks/templates/` |
| Codebase analysis (read-only) | `research-task.md` | `.agent/spawn_agent_tasks/templates/` |
| Targeted bug fix | `bugfix-task.md` | `.agent/spawn_agent_tasks/templates/` |

For **Medium+ tasks**: use `amateur-proof-plans` skill to generate phase files first.

---

## Spawn Commands

### Windows (PowerShell)
```powershell
# Mechanical task (lint, typo fix, rename — fast-fail)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -ModelTier Mechanical `
 -File .agent\spawn_agent_tasks\<name>.md

# Integration task (multi-file implementation)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -ModelTier Integration `
 -File .agent\spawn_agent_tasks\<name>.md

# Architecture/Review task (design, security audit)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -ModelTier Architecture `
 -File .agent\spawn_agent_tasks\<name>.md

# Research (read-only, any tier)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -Agent gemini -ApprovalMode Yolo -Timeout 120 `
 -File .agent\spawn_agent_tasks\<name>.md

# Dry run (preview command without executing)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -ModelTier Integration -DryRun `
 -File .agent\spawn_agent_tasks\<name>.md
```

### Unix (Bash)
```bash
# Mechanical task
spawn-agent.sh --model-tier mechanical -f .agent/spawn_agent_tasks/<name>.md

# Integration task
spawn-agent.sh --model-tier integration -f .agent/spawn_agent_tasks/<name>.md

# Architecture/Review task
spawn-agent.sh --model-tier architecture -f .agent/spawn_agent_tasks/<name>.md

# Research (read-only)
spawn-agent.sh --gemini --yolo --timeout 120 -f .agent/spawn_agent_tasks/<name>.md
```

---

## Post-Spawn Review Checklist

1. **Read output** → `.agent/spawn_agent_tasks/output-*.log`
2. **Run `git diff`** → verify actual changes (not just worker's self-report)
3. **Scope compliance** → were off-limits files touched?
4. **Verification** → `npm run lint && npm run build`
5. **Report** → success / partial / failed + next steps

> [!IMPORTANT]
> Never assume worker success. Always verify via `git diff` and build/lint checks.

---

## Two-Stage Review Pipeline (Medium+ Tasks)

For Medium+ tasks (7+ files), the orchestrator MUST run a two-stage review after the implementer completes with `DONE` or `DONE_WITH_CONCERNS`:

```
Implementer (DONE) → Spec Review → [fix loop] → Quality Review → [fix loop] → Complete
```

### Stage 1: Spec Compliance Review
1. Spawn a **review** worker using `spec-reviewer-prompt.md` (read-only, use `--yolo`)
2. Provide: original task prompt + implementer's report
3. If `ISSUES_FOUND` → send issues back to implementer for fixing → re-review
4. If `SPEC_COMPLIANT` → proceed to Stage 2

### Stage 2: Code Quality Review
1. Spawn a **review** worker using `code-quality-reviewer-prompt.md` (read-only, use `--yolo`)
2. Provide: implementer's report + git diff SHAs
3. If Critical/Important issues → send back to implementer → re-review
4. If `APPROVED` → mark task complete

### Review Loop Limits
- Max **3 review iterations** per stage
- If still failing after 3 → escalate to orchestrator for manual intervention

### Spawn Commands for Review Workers

```powershell
# Windows — Spec review (read-only)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -Agent gemini -ApprovalMode Yolo -Timeout 120 `
 -File .agent\spawn_agent_tasks\<task-name>-spec-review.md

# Windows — Quality review (read-only)
& $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -Agent gemini -ApprovalMode Yolo -Timeout 120 `
 -File .agent\spawn_agent_tasks\<task-name>-quality-review.md
```

### When to Skip Two-Stage Review
- Trivial/Small tasks (≤3 files) — orchestrator review is sufficient
- Research-only tasks (no code changes produced)
- Tasks explicitly marked as "no-review" by the user

---

## Timeout Strategy

| Outcome | Action |
|---------|--------|
| Exit 0 | Read output, verify, report success |
| Exit 124 (timeout) | Read partial output; break task into smaller pieces and re-delegate |
| Exit non-zero | Read error output; diagnose root cause; fix prompt and retry ONCE |
| Failed twice | Complete manually via persona-switching |

---

## Framework Integration

- **Spawn limits:** Count toward `agent-behavior.md §6` (max depth=2, max agents=5)
- **File ownership:** Follow `anti-patterns.md §7.1` — declare ownership before spawning
- **Safety net:** `git stash` before spawn → `git diff` after → `git stash pop` if rejected
- **Benchmarking:** Auto-logged by spawn scripts to `.agent/benchmarks/spawn-agent-benchmark.md`
- **Skill bundles:** Use `skill-bundles.md` to quickly identify which skills the worker needs

---

## Auto-Chain Protocol (Sequential Worker Pipeline)

For multi-phase tasks where each phase depends on the previous, the orchestrator MAY pre-author all prompts and execute them sequentially with automatic review checkpoints.

### Protocol
1. **Pre-author** all worker prompts (N prompts for N phases)
2. **Execute Worker 1** → review output + `git diff`
3. **Gate check:** If Worker 1 passed (exit 0 + diff looks correct):
 - Auto-proceed to Worker 2
 - If Worker 1 produced `DONE_WITH_CONCERNS` → pause for orchestrator judgment
4. **Repeat** until all workers complete or a gate fails

### Auto-Chain Rules
- Max **3 workers** in a chain (beyond 3 → split into separate chains)
- Each worker MUST be independently verifiable (tests + type-check)
- If ANY worker fails → STOP the chain, do NOT proceed to next worker
- The orchestrator MUST read `git diff` between each worker, even in auto-chain mode
- Auto-chain is NOT fire-and-forget — it's sequential-with-checkpoints

### When to Use
- **Refactoring:** extract → update imports → update tests (3 workers, sequential)
- **Feature:** scaffold types → implement logic → implement UI (3 workers, sequential)
- **Migration:** update schema → update service → update components (3 workers, sequential)
