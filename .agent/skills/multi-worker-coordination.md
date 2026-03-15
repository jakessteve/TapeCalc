---
description: Multi-Worker Coordination — pattern for spawning parallel CLI workers, managing output isolation, detecting file conflicts, and merging results.
---

# SKILL: MULTI-WORKER COORDINATION

**Trigger:** When the orchestrator identifies 2+ independent sub-tasks that can be delegated to parallel CLI workers.

---

## When to Use

- **Two or more independent tasks** with non-overlapping file scopes
- **Research + implementation in parallel** — one worker gathers context while another implements a known scope
- **Large refactoring** split into independent modules

## When NOT to Use

- Tasks share file dependencies (high conflict risk)
- Combined scope exceeds 15 files (becomes unmanageable)
- Tasks have sequencing dependencies (A's output feeds B)

---

## Coordination Protocol

### Step 1: Decompose into Independent Workers

| Worker | Task | Files (Modify) | Files (Read) | Off-limits |
|--------|------|----------------|-------------|------------|
| W1 | [task 1] | [files] | [files] | **W2's modify list + shared** |
| W2 | [task 2] | [files] | [files] | **W1's modify list + shared** |

> [!IMPORTANT]
> Each worker's off-limits list MUST include the other worker's modify list. This prevents conflicts at the filesystem level.

### Step 2: Prepare Isolated Prompts

Each worker gets a self-contained prompt with:
- **Worker ID** in the task name (e.g., `[W1] Extract scoring logic`)
- **Exclusive file scope** — no overlap in modify lists
- **Shared read-only files** — both can read the same files
- **Standard verification** — each worker runs lint + build independently

### Step 3: Spawn in Parallel

```powershell
# Windows — spawn both workers (use -ModelTier for task-aware routing)
$w1 = Start-Job -ScriptBlock {
 & $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -ModelTier Integration `
 -File .agent\spawn_agent_tasks\w1-task.md `
 -Output .agent\spawn_agent_tasks\output-w1.log
}
$w2 = Start-Job -ScriptBlock {
 & $env:USERPROFILE\.gemini\antigravity\skills\spawn-agent\scripts\spawn-agent.ps1 `
 -ModelTier Integration `
 -File .agent\spawn_agent_tasks\w2-task.md `
 -Output .agent\spawn_agent_tasks\output-w2.log
}
Wait-Job $w1, $w2
```

```bash
# Unix — spawn both workers (use --model-tier for task-aware routing)
spawn-agent.sh --model-tier integration \
 -f .agent/spawn_agent_tasks/w1-task.md \
 --output .agent/spawn_agent_tasks/output-w1.log &

spawn-agent.sh --model-tier integration \
 -f .agent/spawn_agent_tasks/w2-task.md \
 --output .agent/spawn_agent_tasks/output-w2.log &

wait
```

### Step 4: Conflict Detection

After both workers complete:

```bash
# Check if any files were modified by both workers
git diff --name-only HEAD~1 | sort | uniq -d
```

If conflicts detected:
1. **Identify overlapping files** — which files did both touch?
2. **Manual merge** — orchestrator resolves the conflict
3. **Re-verify** — `npm run lint && npm run build` after merge

### Step 5: Merged Review

Parse both output logs using `worker-output-parsing` skill, then produce:

```markdown
## Multi-Worker Execution Summary

| Worker | Task | Exit | Duration | Files |
|--------|------|------|----------|-------|
| W1 | [task] | | Xs | N |
| W2 | [task] | | Xs | N |

### Conflicts: None / [list]
### Combined verification: lint + build pass
```

---

## Naming Conventions

| Resource | Format | Example |
|----------|--------|---------|
| Prompt file | `w{N}-{task-name}.md` | `w1-extract-scoring.md` |
| Output log | `output-w{N}.log` | `output-w1.log` |
| Git branch | `worker/{task-name}` | `worker/parallel-refactor` |

---

## Limits

- **Max parallel workers:** 4 (enforced by `agent-behavior.md §6` and `anti-patterns.md §8`)
- **Max total files across all workers:** 15
- **Always stash first:** `git stash` before multi-worker spawn
