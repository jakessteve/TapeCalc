---
description: Always On — structured agent communication, team-mode formatting, parallel resource limits, and auto-fallback
---

# RULE: AGENT BEHAVIOR (Combined)

Rules governing how agents communicate, coordinate, and recover from failures.

---

## 1. Agent Communication Protocol

All inter-agent communication uses structured format:
```
**FROM:** @agent
**TO:** @agent
**RE:** [Subject]
**CONTENT:** [Message]
**ACTION NEEDED:** [Yes/No — what specifically]
```

---

## 2. Team-Mode Format

When simulating multiple agents in party-mode or swarm-execute, use emoji-prefixed format:
```
 **@pm:** [PM's perspective]
 **@dev:** [Dev's perspective]
 **@qc:** [QC's perspective]
```
Max 3 discussion rounds before synthesis.

---

## 3. Parallel Resource Limits

- Max **4 parallel agent threads** at any time (hard limit, not suggestion).
- Queue additional work if capacity reached.
- Monitor for stuck agents — if exceeding expected time, activate auto-fallback.

---

## 4. Auto-Fallback Mode

When an agent is stuck or producing errors:
1. **Detect:** Agent exceeds 3x expected time, or anti-loop triggers.
2. **Kill:** Abandon the current approach.
3. **Reset:** Clear context, re-read the task from SOT.
4. **Replace:** Try a fundamentally different approach. If still failing, escalate to User.

---

## 5. Iteration Budget

Every task has a maximum tool-call budget based on complexity. This prevents runaway sessions where token limits are silently exhausted.

| Task Type | Max Tool Calls | Checkpoint At |
|-----------|---------------|---------------|
| Quick fix (≤3 files) | 20 | 15 |
| Standard (4-6 files, pattern) | 30 | 22 |
| Feature (7-10 files) | 40 | 30 |
| Epic (>10 files) | 60 | 45 |
| Orchestration / Swarm | 80 | 60 |

**At the checkpoint**, the agent MUST:
1. Summarize progress in `task.md` or equivalent tracking artifact.
2. Assess remaining work vs. remaining budget.
3. If more than 50% of work remains but <25% of budget left → trigger Context Reset Protocol (`anti-patterns.md` §4).

**Exceeding the max:** If an agent reaches the max tool-call count without completion, it MUST stop and escalate to @pm (or User if @pm is the stuck agent) with a status report. Do NOT continue past the max.

---

## 6. Sub-Agent Spawn Limits (Anti-Recursion)

Prevent the "Infinite Sub-Agent" edge case where an agent spawns helpers that spawn their own helpers.

**Hard Limits:**
- **Max spawn depth:** 2 levels (orchestrator → agent → sub-task, never deeper).
- **Max total active agents per task:** 5 (not just parallel — total across all waves).
- **Max sequential delegations without execution:** 3. If a task is re-delegated 3 times without ANY tool executing work → HALT and escalate to User.

**Anti-Pattern: Delegation without Execution**
If @pm delegates to @dev, who "delegates" to @sa for clarification, who asks @pm for requirements → this is a handoff loop, not real work. Detect by counting delegation hops without tool execution between them.

**Not a Violation:** Sequential persona switches (e.g., @pm → @dev → @qc) where each persona executes tool calls between switches. This is normal orchestration.

### 6.1 CLI Worker Processes (Gemini CLI via spawn-agent)

When using the `worker-delegate` skill to spawn Gemini CLI worker agents, the following additional rules apply:

**CLI workers count toward all existing limits above.** Each CLI process = one agent toward the max of 5.

**CLI-Specific Rules:**
- **CLI workers MUST NOT spawn their own sub-agents.** A Gemini CLI worker is the terminal node — it executes and reports, nothing more.
- **Context injection:** All CLI workers receive `AGENTS-LITE.md` as their rulebook, NOT the full `AGENTS.md`. This reduces base context from ~20KB to ~3KB.
- **Use `-ModelTier` for routing:** Mechanical → `-Agent gemini -Timeout 60 -ApprovalMode Yolo`. Integration → `-Timeout 300 -ApprovalMode AutoEdit`. Architecture → `-Agent codex -Timeout 600 -ApprovalMode AutoEdit`. See `model-routing.md` §6.1.
- **Output review is mandatory.** The orchestrator MUST read `.agent/spawn_agent_tasks/output-*.log` AND run `git diff` before reporting success. Never assume worker success.
- **One task per spawn.** Review output between spawns. Do NOT chain: spawn A → spawn B without reviewing A's results first.
- **Failed worker = orchestrator takes over.** If a worker fails, do NOT re-spawn with the same prompt. Either fix the prompt substantially or complete the work via persona-switching.

---

## 7. Coordination & Delegation Model

> [!IMPORTANT]
> **The natural LLM tendency is to do all work inline via persona-switching.** This is a documented cognitive bias (Status Quo Bias). The rules below exist to counteract it by making CLI workers the default for non-trivial tasks.

Our architecture uses **two complementary models** with a **complexity-aware default**:

### 7.1 Single-LLM Persona-Switching (Trivial/Small Tasks ONLY)
- **Near-zero handoff cost:** Persona switches (@pm → @dev → @qc) share full context — no serialization, no information loss.
- **No duplicate discovery:** A single context window means once a file is read, all personas have access.
- **Trade-off:** No true parallelism. Sequential only.
- **Best for:** Trivial/Small tasks (≤3 files) where coordination overhead would exceed the task itself.
- **NOT for:** Medium+ tasks (7+ files) — these MUST route through the Spawn Gate (`@pm.md` §3.1.8).

### 7.1.5 Lightweight Delegation (Standard Tasks — 4-6 files, pattern-following)
- **Moderate handoff cost:** Inline prompt via `-Prompt` flag — no template file composition needed.
- **Moderate context preservation:** Worker starts cold but task is simple enough that prompts are short (<1000 chars).
- **Quick validation only:** Placeholder check + file path check (per `template-validation.md`).
- **No two-stage review:** Orchestrator reviews `git diff` directly — no spec/quality reviewer workers.
- **Trade-off:** Less detailed than full template delegation, but 3x faster to compose.
- **Best for:** Standard tasks (4-6 files) following existing patterns where context transfer overhead > the task itself.

### 7.2 CLI Worker Delegation (Medium+ Tasks — DEFAULT)
- **True process isolation:** Workers get a clean context window — no pollution from orchestrator's accumulated context.
- **True parallelism:** Multiple CLI processes run simultaneously on multi-core hardware.
- **Trade-off:** Workers start with ZERO context. Prompt quality directly determines output quality.
- **Best for:** Medium+ tasks (7+ files), read-only research, independent parallel modules, context pressure relief, post-plan execution.

**Decision rule:** Default to CLI workers for Medium+ tasks (7+ files). Use lightweight delegation for Standard tasks (4-6 files, pattern-following). Use persona-switching ONLY for Trivial/Small tasks (≤3 files). If in doubt, spawn. See `@pm.md` §3.1.8 for the mandatory spawn gate and exemption whitelist.

> [!IMPORTANT]
> **Analysis/review tasks are NOT exempt from spawning.** A task that touches zero files but requires 3+ agent perspectives is effectively a Large+ task. Route through the Mandatory Spawn Gate (`@pm.md` §3.1.8) using the Intent-Based Override. See also `task-complexity-classifier.md` §Analysis & Review Task Override.

