---
description: Timeout Escalation Strategy — handling worker timeouts with graduated retry, scope reduction, and graceful fallback to orchestrator execution.
---

# RULE: TIMEOUT ESCALATION

**Scope:** All spawn-agent delegations that exit with code 124 (timeout).

---

## Escalation Ladder

When a CLI worker times out, follow this graduated response:

### Level 1: Retry with Extended Timeout (1 attempt)

```
Original timeout: 300s → Extended: 600s (2x)
```

Only do this if:
- The worker produced partial output showing progress
- The task scope is appropriate (not too broad)
- No error indicators in partial output
- **NOT a Mechanical task.** Mechanical tasks (lint, typo, rename) use `-ApprovalMode Yolo -Timeout 60`. If they fail at 60s, they are mis-scoped — do NOT retry with more time. Split or fix the prompt instead.

### Level 2: Break Task into Smaller Pieces

If the extended timeout also fails, the task is too broad:
1. Read the partial output to identify what was completed
2. Split the original task into 2-3 sub-tasks
3. Delegate each sub-task with the original timeout
4. Merge results after all complete

### Level 3: Complete Manually via Persona-Switching

If sub-tasks also struggle:
1. Use the partial worker output as context
2. Switch to @dev persona and complete manually
3. Log the failure in the session audit trail

### Level 4: Escalate to User

If manual completion also fails:
1. Present what was attempted and what failed
2. Ask user for guidance on scope or approach
3. Log as blocked in sprint tracking

---

## Timeout Guidelines by Task Type

| Task Type | Recommended Timeout | Max Retry Timeout |
|-----------|-------------------|------------------|
| **Mechanical** (lint, typo, rename) | **60s (Yolo)** | **Do not retry — fix prompt or do manually** |
| Research (read-only) | 120s | 240s |
| Bug fix (single file) | 120s | 240s |
| Implementation (≤5 files) | 300s | 600s |
| Refactoring (≤10 files) | 300s | 600s |
| Large implementation | 600s | Do not retry — split instead |

---

## Logging

After any timeout, append to audit trail:

```markdown
| Timestamp | Task | Timeout | Escalation Level | Resolution |
|-----------|------|---------|-----------------|------------|
| ... | ... | 300s | L2 (split) | Completed as 2 sub-tasks |
```
