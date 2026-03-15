---
description: Concrete strategies for optimizing context usage — compression, budgeting, progressive loading
---

# SKILL: PM CONTEXT OPTIMIZATION

**Trigger:** When any agent is struggling with context limits, or when @pm is managing a large multi-file task.

---

## When to Use
- Context window is estimated at 50%+ usage.
- Working with more than 5 files simultaneously.
- Agent is reading the same files repeatedly.
- Tool outputs are consuming excessive context.
- Running `/swarm-execute` with multiple parallel agents.

---

## Strategy 1: Summarize-and-Discard

After reading a large file for specific information:
1. **Extract** the key facts you need (function names, types, line numbers).
2. **Summarize** them in 3-5 bullet points.
3. **Stop referencing** the full file content — only use your summary.

```markdown
## Context Summary: tuviEngine.ts
- Exports: `calculateChart()`, `placeStar()`, `getMenh()`
- Key type: `TuViChart` (line 45-78)
- Palace placement starts at line 120
- Uses: `iztro` library for base calculations
(Full file content no longer needed in context)
```

### 2: Progressive Loading

Don't read everything upfront. Load information in layers:

```
Layer 1: File structure (grep_search for exports/classes) → understand structure
Layer 2: Grep for specific pattern → find exact location
Layer 3: Read only the relevant 20-50 lines → get the detail you need
```

**Never:** Read a 500-line file when you only need 1 function.

---

## Strategy 3: Context Budget Tracking

Estimate your context usage and trigger compression proactively:

| Usage | Action |
|-------|--------|
| 0-30% | Normal work. Load files as needed. |
| 30-50% | Start summarizing completed sub-tasks. Discard old tool outputs. |
| 50-70% | **Compress actively.** Summarize all file contents. Shed old context. |
| 70%+ | **Emergency mode.** Flush everything except current task summary. |

### Compression Triggers
When you notice ANY of these, compress immediately:
- You've read more than 5 files in this session.
- Terminal output from a command was > 50 lines.
- You're re-reading a file you already read.
- You're about to start a new sub-task.

---

## Strategy 4: "Lost in the Middle" Mitigation

Important information placed in the middle of context is easier to lose. Counter this by:
- **Put critical info at the START** of your working memory (re-state it).
- **Put critical info at the END** (summarize before acting).
- **Don't bury instructions** in the middle of large outputs.

---

## Strategy 5: Delegated Context

When managing sub-agents, don't load their full context. Instead:
1. Give sub-agents **only the files they need** (specific paths).
2. Have them **summarize their results** back to you (not full code dumps).
3. Use the `context-juggler` skill for parallel context sync.

---

## Quick Decision Tree
```
Need information from a file?
├── Do I know where it is? → grep → read only those lines
├── Is it a new file? → read first ~50 lines for structure
├── Have I read it before? → Use my summary, don't re-read
└── Is it very large? → Read in 100-line chunks, summarize each
```

---

## Strategy 6: Mandatory Compression Checkpoints

Compression is NOT optional at these points. These are **HARD checkpoints** — skip them and you risk silent context exhaustion.

1. **After reading 5 files** → Summarize all into a combined context note. Do not re-read any of them.
2. **After each persona switch** → Flush the previous persona's working context. Keep only the deliverable summary (what was produced, not how).
3. **After each wave in `/swarm-execute`** → Summarize wave output before starting next wave. Each wave starts with a clean context.
4. **After any tool output >50 lines** → Summarize the output immediately. Keep only key findings (errors, paths, decisions).
5. **Before QC verification** → Compress all accumulated context. Keep only: changes made + files modified + expected behavior.

**Format for compressed context:**
```markdown
## Context Checkpoint — [timestamp or step]
- Files read: [list of basenames]
- Key facts: [3-5 bullets]
- Decisions made: [list]
- Next action: [what to do next]
(Full file contents discarded — use this summary only)
```
