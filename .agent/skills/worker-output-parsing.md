---
description: Worker Output Parsing — structured extraction and analysis of CLI worker output logs. Parses raw stdout into actionable summaries for orchestrator review.
---

# SKILL: WORKER OUTPUT PARSING

**Trigger:** After any spawn-agent execution, when reviewing `.agent/spawn_agent_tasks/output-*.log` files.

---

## When to Activate

- After ANY worker spawn completes (success, failure, or timeout)
- When reviewing historical worker output logs
- When aggregating results from multiple parallel workers

---

## Parsing Protocol

### Step 1: Locate the Output Log

```powershell
# Windows — find latest log
Get-ChildItem .agent\spawn_agent_tasks\output-*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Unix
ls -t .agent/spawn_agent_tasks/output-*.log | head -1
```

### Step 2: Extract Metadata from Header

Worker logs always start with a header block:
```
=== Spawn Agent: GEMINI ===
Timestamp: 2026-03-13 07:47:13
Mode: auto_edit
Prompt preview: ...
================================
```

Extract: **Agent**, **Timestamp**, **Mode**, **Prompt preview**.

### Step 3: Detect Outcome from Footer

```
================================
Exit code: 0
Completed: 2026-03-13 07:52:30
```

| Exit Code | Meaning | Action |
|-----------|---------|--------|
| `0` | Success | Parse report section |
| `1` | Error | Scan for error patterns |
| `124` | Timeout | Note partial work; plan re-delegation |
| Other | Unexpected | Flag for manual review |

### Step 4: Extract Status and Structured Report

**First, scan for the Status header (primary signal):**

```
### Status: DONE
### Status: DONE_WITH_CONCERNS
### Status: NEEDS_CONTEXT
### Status: BLOCKED
```

| Status | Parsing Action |
|--------|---------------|
| `DONE` | Standard parsing — extract changes, verification, decisions |
| `DONE_WITH_CONCERNS` | Parse `### Concerns` section — flag for orchestrator attention before proceeding |
| `NEEDS_CONTEXT` | Parse `### Context Needed` — orchestrator must provide info and re-delegate |
| `BLOCKED` | Parse `### Blocker Details` — orchestrator follows escalation ladder (see below) |
| Not found | Flag as **legacy output** — worker may have used an old template. Fall back to exit-code-based assessment |

**Then scan for structured report markers:**

```
### Changes Made
### Root Cause
### Fix Applied
### Decisions Made
### Potential Issues
### Verification Results
### Summary
### Detailed Findings
### Concerns
### Context Needed
### Blocker Details
```

If no structured report found → flag as **unstructured output** (template may not have been followed).

### Escalation Ladder (for BLOCKED or NEEDS_CONTEXT workers)

When a worker reports BLOCKED or NEEDS_CONTEXT, follow this ladder in order:

1. **More context** → Provide the missing information, re-delegate same task with same model
2. **Stronger model** → Re-delegate with a more capable model if the task requires more reasoning
3. **Smaller scope** → Break the task into sub-tasks (use `amateur-proof-plans`)
4. **Human escalation** → Surface to user via `notify_user`

> [!IMPORTANT]
> Never retry the same prompt unchanged. Something must change per attempt.

### Step 5: Scan for Failure Indicators

Even if exit code is 0, check for hidden failures:

| Pattern | Risk Level | Meaning |
|---------|-----------|---------|
| `error TS` | High | TypeScript compilation error |
| `FAIL` or `FAILED` | High | Test failure |
| `warning:` | Medium | Linter warning |
| `Cannot find module` | High | Missing import/dependency |
| `Permission denied` | High | File access issue |
| `ENOSPC` | High | Disk space issue |
| `timeout` | Medium | Sub-process timeout within worker |
| `ModuleNotFoundError` | High | Python import error |
| `SyntaxError` | High | Code syntax error |

---

## Output Summary Template

After parsing, produce this structured summary for the orchestrator:

```markdown
## Worker Session Summary

| Field | Value |
|-------|-------|
| **Agent** | Gemini / Codex |
| **Timestamp** | YYYY-MM-DD HH:MM:SS |
| **Duration** | Xs |
| **Exit Code** | 0 / 1 / 124 |
| **Status** | DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED / (legacy) |
| **Outcome** | Success / Partial / Failed |

### Changes Reported
| File | Action | Description |
|------|--------|-------------|

### Failure Indicators
- [None found / List of detected issues]

### Worker Decisions
- [Any ambiguous choices the worker made]

### Orchestrator Action Required
- [ ] Review `git diff` for actual changes
- [ ] Run `npm run lint && npm run build`
- [ ] [Any specific follow-up needed]
```

---

## Multi-Worker Aggregation

When reviewing output from parallel workers:

1. Parse each log independently using the protocol above
2. Check for **file conflicts** — did multiple workers touch the same file?
3. Check for **dependency conflicts** — did one worker's changes break another's assumptions?
4. Produce an **aggregated summary** with per-worker outcomes

```markdown
## Multi-Worker Summary

| Worker | Task | Outcome | Files Changed |
|--------|------|---------|---------------|
| Worker 1 | [task] | | [count] |
| Worker 2 | [task] | | [count] |

### Conflicts Detected
- [File X modified by both Worker 1 and Worker 2]
- [Worker 2 imports function removed by Worker 1]

### Resolution Required
- [ ] Manual merge for conflicting files
- [ ] Re-run verification after merge
```
