---
description: Context Juggler — manage shared context between parallel agents to keep them in sync
---

# SKILL: CONTEXT JUGGLER

**Trigger:** When @pm runs multiple agents in parallel and needs to keep their outputs synchronized.

---

## When to Use
- Two or more agents are working on related tasks simultaneously.
- @dev creates an API that @designer needs to call from the UI.
- @sa defines a data model that @dev and @qc both need.
- Running `/swarm-execute` with parallel agent threads.

---

## The Shared Context Window

Maintain a living document that tracks what each agent has produced. This is the "whiteboard" that all agents can read.

### Context State Format

```markdown
# Shared Context — [Task Name]
**Last Updated:** [timestamp]

## Agent Outputs (Live)

### @ba (Requirements)
- Status: Complete / In Progress / Not Started
- Output: [file path or summary]
- Key decisions: [bullet list]

### @sa (Architecture)
- Status: [status]
- Output: [file path]
- API names defined: [list]
- Data models defined: [list]

### @designer (UI)
- Status: [status]
- Output: [file path]
- Components planned: [list]
- API calls expected: [list — MUST match @sa/@dev]

### @dev (Implementation)
- Status: [status]
- Output: [file path]
- Functions created: [list]
- API endpoints implemented: [list]

### @qc (Testing)
- Status: [status]
- Test scaffolds: [file path]
- Coverage: [percentage]

## Sync Alerts
- [Any mismatches detected]
```

---

## Synchronization Protocol

### 1. Broadcast on Output
When an agent produces output that others depend on, @pm MUST broadcast:
```
 CONTEXT UPDATE from @[agent]:
- Created: [what was created — file, function, API, etc.]
- Impact: [which other agents need to know]
- Key names: [exact names, types, or signatures to use]
```

### 2. Sync Check at Merge Points
Before merging parallel work streams, verify alignment:

| Check | Verify |
|-------|--------|
| API names | @designer's API calls match @dev's endpoint names exactly |
| Data shapes | @dev's response types match @designer's expected props |
| File paths | @dev's imports match @sa's architecture structure |
| Test data | @qc's mock data matches @dev's actual output format |

### 3. Conflict Detection
If two agents produce conflicting outputs:
1. **Flag:** ` CONTEXT CONFLICT — @agentA says X, @agentB says Y`
2. **Pause:** Hold the downstream agent that would consume conflicting data.
3. **Resolve:** Use `conflict-resolver` skill to mediate.
4. **Broadcast:** Send corrected context to all affected agents.

---

## Rules
1. **Update immediately** — don't batch context updates. Stale context causes integration bugs.
2. **Be specific** — "Created `fetchLunarDate()` returning `LunarDate` type" not "Finished backend."
3. **Name things exactly** — function names, type names, file paths must be verbatim.
4. **Flag mismatches early** — catching a naming mismatch before implementation saves hours.

---

## Context Staleness Guard

### Staleness Timer
Context broadcasts have a **freshness window of 10 tool calls**. After 10 tool calls since the last broadcast, @pm MUST re-broadcast the Shared Context Window:
- Re-read the current state of all in-progress agent outputs.
- Update the Shared Context with actual file contents/names.
- Flag any drift from the original broadcast.

### Forced Re-Sync Trigger
If ANY of these signals appear → trigger immediate re-sync regardless of the timer:
- An agent references a function/file name that differs from the Shared Context.
- A merge conflict is detected.
- An agent reports "unexpected" behavior that contradicts another agent's output.
- `context-juggler` Sync Alert fires.
- @pm suspects context drift based on agent output quality.

