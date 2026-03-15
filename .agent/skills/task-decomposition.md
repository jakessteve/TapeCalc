---
description: Task Decomposition - breaking large context and complex problems into smaller, manageable pieces
---

# SKILL: Task Decomposition

## When to Use
When ANY agent encounters a task that is too large or complex to handle in a single pass. Triggers:
- Task involves more than **5 files** to read or modify.
- Task has more than **3 independent concerns** (e.g., UI + API + database + tests).
- A single file is larger than **300 lines** and needs comprehensive changes.
- A problem requires reasoning about more than **3 interacting systems**.
- The user's request contains multiple distinct deliverables.
- You feel your context is getting heavy (many files loaded, long conversation).

## Decomposition Strategies

### 1. Sequential Decomposition (Most Common)
Break the task into ordered steps where each step depends on the previous:
```
Epic: "Add user authentication"
→ Step 1: Design auth schema in API_CONTRACTS.md
→ Step 2: Implement auth middleware
→ Step 3: Add login/register endpoints
→ Step 4: Write auth tests
→ Step 5: Integrate with frontend
```
**Rule:** Complete each step fully, summarize, flush context, then start next.

### 2. Parallel Decomposition
Break into independent sub-tasks that don't depend on each other:
```
Epic: "Fix 5 UI bugs"
→ Sub-task A: Fix header alignment (independent)
→ Sub-task B: Fix color contrast (independent)
→ Sub-task C: Fix responsive layout (independent)
```
**Rule:** Each sub-task gets its own context. Don't mix them.

### 3. Hierarchical Decomposition (Complex Systems)
Break by architectural layers:
```
Complex Feature:
├── Layer 1: Data model changes (ARCHITECTURE.md)
├── Layer 2: Business logic (src/core/)
├── Layer 3: API endpoints (src/api/)
├── Layer 4: UI components (src/components/)
└── Layer 5: Tests (tests/)
```
**Rule:** Work bottom-up. Data model → logic → API → UI → tests.

### 4. Context Chunking (Large Files)
When a file is too large to process at once:
1. Read the file **outline** first (structure only).
2. Identify the **specific section** you need to modify.
3. Read **only that section** (use line ranges).
4. Make the change.
5. Move to the next section.
**Rule:** Never hold more than 300 lines of a single file in context.

## Sub-Task Format
When decomposing, write sub-tasks in this format:
```markdown
## Sub-Task: [Name]
**Scope:** [What files/components are involved]
**Input:** [What must exist before starting]
**Output:** [What this sub-task produces]
**Estimated Size:** [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

## Context Management During Decomposition
1. **Before starting a sub-task:** Summarize what you know, what the sub-task needs.
2. **During a sub-task:** Stay focused on ONLY the files relevant to this sub-task.
3. **After completing a sub-task:** Summarize the result in ≤3 sentences. Flush all file contents from working memory.
4. **Before starting next sub-task:** Load only what the next sub-task needs.

## When NOT to Decompose
- Simple single-file edits (< 50 lines changed).
- Direct questions that don't require code changes.
- Tasks where all context fits comfortably in a single pass.
- Don't over-decompose: if a task has only 2 simple steps, just do them.

## Integration with Other Skills
- Use **sequential-thinking** for complex algorithm decomposition within a sub-task.
- Use **Rule 03** (anti-context-overflow) for context management between sub-tasks.
- Use **Rule 13** (anti-hallucination) to verify each sub-task output before moving on.
