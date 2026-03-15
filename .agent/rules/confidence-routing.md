---
description: Agents must provide confidence scores on decisions and solutions — enables probabilistic routing within deterministic DAGs
---

# RULE: Confidence-Based Decision Routing

## Core Principle
Every agent decision point that determines workflow direction MUST include a **confidence score** and **uncertainty flags**. This transforms binary PASS/FAIL gates into probabilistic routing without destroying the deterministic DAG structure.

## When This Applies
- After completing any task that produces a deliverable (code, design, research, architecture)
- At workflow decision gates (e.g., `/idea-forge` Phase 2 verdict, `/battle-test` scoring)
- When presenting multiple solution options
- When debugging and proposing fixes

## Confidence Score Format
Every decision-bearing output MUST include:

```markdown
### Confidence Assessment
**Score:** [0-100]
**Uncertainty Flags:**
- [Specific aspect with low confidence]
- [Another uncertain area]
**Evidence basis:** [What sources/tests/data support this score]
```

## Auto-Routing Rules

| Score Range | Action | Rationale |
|---|---|---|
| **≥ 85 (High)** | Proceed autonomously | Agent is confident; no review needed |
| **75–84 (Good)** | Proceed autonomously, flag for post-hoc review | Solid confidence; @pm reviews afterward, not before |
| **60–74 (Medium)** | Flag for @pm review before proceeding | Uncertainty exists — @pm decides |
| **< 60 (Low)** | **HALT** — generate alternatives, escalate | Confidence too low to proceed |

## Branching on Low Confidence
When an agent scores < 60:
1. **Generate 2-3 alternative approaches** with individual confidence scores.
2. **Present ranked alternatives** to @pm (or User if @pm is also low-confidence).
3. **Do NOT proceed** with the low-confidence path. Pursuing uncertain approaches wastes context and creates cascading errors.

## Integration with Existing Gates
This rule **complements** (does not replace) existing gates:
- SPARC gates remain mandatory — confidence routing adds a quality layer on top.
- `/idea-forge` verdicts (PROCEED/RETHINK/REJECT) should now include confidence scores in their justification.
- `/battle-test` scoring already uses letter grades — map them: A-B = ≥85, C = 60-84, D-F = <60.

## Confidence Calibration Guidelines
To avoid inflated scores:
- **≥ 90** = "I have tested this and it passes all known cases"
- **70–89** = "This works for the tested cases but there may be edge cases I haven't considered"
- **50–69** = "This approach seems reasonable but I haven't verified critical assumptions"
- **< 50** = "I'm guessing or working from incomplete information"

## Anti-Pattern: Confidence Theater
Do NOT:
- Always score 85+ to avoid review friction → this defeats the purpose
- Score low to avoid responsibility → provide genuine assessment
- Skip confidence assessment on "trivial" tasks → the rule applies to ALL decision points

---

## Progress Monotonicity Rule

Every agent MUST track a simple progress indicator for each task:
- **Test count passing** (must be ≥ previous snapshot)
- **Files completed** (must be ≥ previous count)
- **Errors remaining** (must be ≤ previous count)

If progress is **NON-monotonic** (i.e., test count drops, errors increase) for **2 consecutive iterations** → treat as a regression loop:
1. Revert to last known good state.
2. Reassess approach.
3. If uncertain → escalate with confidence score < 60.

**Not a Regression:** Temporarily failing tests during TDD red phase, or expected errors during refactoring that are resolved in the same iteration. Monotonicity is measured at iteration boundaries, not mid-iteration.

---

## Progressive Confidence Tracking

Confidence must be tracked **progressively**, not just at the end:
- After every **10 tool calls** within a task, re-assess confidence.
- If score dropped by **≥ 15 points** from last checkpoint → investigate why before continuing.
- If score is **monotonically decreasing** across 3 checkpoints → trigger Context Reset Protocol (`anti-patterns.md` §4).
- Log confidence checkpoints: ` Confidence: [score] (±[delta] from last)`

---

## Confidence Calibration Tracking

### Post-Task Calibration Entry
After every task where QC verification ran, append to `.agent/benchmarks/confidence-calibration.md`:

```
| Date | Task | Predicted | Actual (QC Pass?) | Delta | Notes |
```

### Calibration Rules
- If **average delta > 15** over last 10 entries → agent is systematically over/under-confident → recalibrate thresholds.
- If **high-confidence failures (predicted ≥85, actual fail) > 20%** → raise auto-proceed threshold from 85 to 90.
- Track calibration in `.agent/benchmarks/confidence-calibration.md`.


