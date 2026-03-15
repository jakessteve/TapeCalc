---
description: Worker Delegate — MANDATORY gate for Medium+ tasks. Determines delegation mode (CLI workers vs persona-switching) based on task complexity.
---

# SKILL: WORKER DELEGATE

**Trigger:** MANDATORY before any Medium+ task execution. Also triggered when the orchestrator considers delegation for any task.

> [!IMPORTANT]
> **The framing has changed.** The old question was "Should I spawn?" (easy to answer "no"). The new question is: **"For this Medium+ task, do I qualify for an exemption from spawning?"** (hard to answer "yes" without a valid reason).

---

## When CLI Workers Are MANDATORY (No Exemptions)

- Task involves **10+ files** (Large/Epic) → **always spawn**
- Post-plan execution: @pm has a user-approved implementation plan → **always spawn** (any file count)
- Post-implementation review: After implementation worker completes → **always spawn** review workers (spec → quality) per `orchestrator-delegation-guide.md §Two-Stage Review`

## When CLI Workers Are the DEFAULT (Exemptions Require Justification)

- Task involves **4-9 files** (Medium) → **spawn UNLESS** a valid exemption applies

**Valid Exemptions (Medium tasks ONLY):**
1. All sub-tasks have complex inter-file dependencies requiring shared context
2. Task requires interactive user discussion mid-execution
3. Worker infrastructure is unavailable (CLI not installed)

> [!CAUTION]
> **Status Quo Bias Check:** Before claiming an exemption, ask yourself: "Am I avoiding spawning because it's genuinely wrong for this task, or because doing it inline is more convenient?" If the honest answer is convenience → **spawn.**

## When Persona-Switching Is the Default

- Task touches **≤3 files** (Trivial/Small) → persona-switch is fine
- CLI workers are optional but allowed if context pressure is high

---

## Decision Gate

Before spawning any CLI worker, the orchestrator MUST answer:

| Question | Required Answer |
|----------|----------------|
| Can a developer with zero project knowledge execute this prompt? | Yes |
| Is the file scope explicitly listed (modify / read-only / off-limits)? | Yes |
| Is the tech stack context included in the prompt? | Yes |
| Is there a reference file for the worker to follow? | Yes |
| Is the expected output format defined? | Yes |

If ANY answer is → do NOT spawn yet. **Fix the prompt first, THEN spawn.** Do NOT use a failed gate check as justification to skip spawning and do it inline.

---

## Spawn Commands, Templates, and Post-Spawn Review

> **Canonical Source:** See `orchestrator-delegation-guide.md` for:
> - Template selection (5 templates available)
> - Spawn command quick reference (Windows + Unix)
> - Post-spawn review checklist
> - Timeout strategy and escalation
> - Framework integration limits

Do NOT duplicate spawn commands here — maintain them only in `orchestrator-delegation-guide.md` to prevent drift.

---

## Integration with Existing Framework

- **Spawn limits:** CLI workers count toward `agent-behavior.md §6` limits (max depth=2, max agents=5)
- **File ownership:** Workers respect `anti-patterns.md §7.1` — declare file ownership before spawning
- **Safety net:** `git stash` before spawn, `git diff` after, `git stash pop` if rejected
- **Two-stage review:** After implementation workers, spawn spec + quality review workers per `orchestrator-delegation-guide.md §Two-Stage Review`
- **Validation:** Run `template-validation.md` checks before spawning
- **Post-task audit:** `@pm.md` §3.11 requires @pm to self-audit spawning decisions after Medium+ tasks
