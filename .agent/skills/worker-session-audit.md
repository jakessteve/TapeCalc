---
description: Worker Session Audit Trail — structured logging of all CLI worker delegation sessions for retrospectives and benchmarking.
---

# SKILL: WORKER SESSION AUDIT TRAIL

**Trigger:** After every spawn-agent execution completes (Step 5: REPORT in delegation protocol).

---

## Audit Log Format

Maintain a running log at `.agent/spawn_agent_tasks/session-audit.md`. Append one row per spawn session:

```markdown
## Session Audit Log

| Timestamp | Task Name | Agent | Mode | Timeout | Exit | Duration | Files Changed | Outcome |
|-----------|-----------|-------|------|---------|------|----------|---------------|---------|
| 2026-03-13 07:47 | Research repo structure | Gemini | yolo | 120s | 0 | 45s | 0 (read-only) | |
| 2026-03-12 15:30 | Fix multi-agent pipeline | Gemini | auto_edit | 300s | 0 | 180s | 4 | |
```

---

## Required Fields

| Field | Source | How to Extract |
|-------|--------|---------------|
| **Timestamp** | Output log header | `Timestamp:` line |
| **Task Name** | Prompt file name or inline `-p` text | First 50 chars of goal |
| **Agent** | Script `--gemini` / `--codex` flag | Banner line |
| **Mode** | Script approval mode flag | Banner line |
| **Timeout** | Script `--timeout` flag | Banner line |
| **Exit** | Output log footer | `Exit code:` line |
| **Duration** | Header timestamp → footer timestamp | Diff |
| **Files Changed** | `git diff --stat` post-spawn | Count lines |
| **Outcome** | Exit code mapping | `0`=, `124`=, other= |

---

## Aggregation for Retrospectives

Use the audit trail in `/retrospective` and `/sprint-review` workflows:

### Key Metrics to Track
- **Total spawns this sprint**: count of rows
- **Success rate**: / total
- **Average duration per task type**: group by research/impl/bugfix
- **Timeout rate**: / total (indicates scope issues)
- **Failure rate**: / total (indicates prompt quality issues)

### Warning Thresholds
| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Success rate | >85% | 70-85% | <70% |
| Timeout rate | <10% | 10-25% | >25% |
| Avg duration | <180s | 180-300s | >300s |

---

## Integration

- **Benchmarking**: Feed audit data into `.agent/benchmarks/spawn-agent-benchmark.md`
- **Retrospectives**: Reference in `/retrospective` workflow for process improvement
- **Sprint reviews**: Include delegation metrics in `/sprint-review` output
