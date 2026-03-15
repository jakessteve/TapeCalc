---
description: User Feedback Loop - route telemetry insights and user feedback back into the product backlog as prioritized stories
---

# SKILL: User Feedback Loop

**Trigger:** When @pm needs to convert user feedback, telemetry insights, or support requests into actionable product backlog items. Bridges the gap between "what users are experiencing" and "what we should build next."

---

## When to Use
- After `telemetry-analysis` generates a Problem Report.
- When user feedback arrives (support tickets, reviews, social mentions).
- During sprint planning to prioritize based on user signals.
- When growth metrics show concerning trends (retention drop, feature underuse).
- After `/user-test-session` produces UX findings.

---

## The Feedback Loop Process

### Step 1: Signal Intake
Collect feedback from all available channels:

| Channel | Signal Type | Priority Indicator |
|---|---|---|
| **Problem Reports** (`.hc/analysis/problems/`) | Quantitative — data-backed issues | Severity rating in report |
| **User test results** (`.hc/user-tests/`) | Qualitative — observed friction | UX scorecard rating |
| **Support requests** | Direct user pain | Frequency + severity |
| **App reviews** | Public sentiment | Rating + review content |
| **Social mentions** | Brand perception | Sentiment analysis |
| **Error logs** | Technical failures | Error rate + impact |

### Step 2: Signal Prioritization
Rank signals using the ICE framework:

```markdown
## Signal Prioritization — [Sprint/Period]

| # | Signal | Impact (1-10) | Confidence (1-10) | Ease (1-10) | ICE Score | Action |
|---|--------|---------------|-------------------|-------------|-----------|--------|
| 1 | [Issue] | [Impact on users] | [How sure are we?] | [How easy to fix?] | [I×C×E] | Story / Investigate / Ignore |
```

**Routing rules:**
- **ICE ≥ 500:** Create a P1 story immediately. Route to current sprint.
- **ICE 200-499:** Create a story for next sprint. Investigate root cause.
- **ICE < 200:** Log in backlog. Review in next grooming session.

### Step 3: Story Generation
Convert prioritized signals into user stories (Rule `agile-user-stories.md`):

```markdown
# Story: [Title]
**Source:** [Problem Report / User Feedback / Telemetry]
**Priority:** P1 / P2 / P3
**ICE Score:** [score]

## User Story
As a [persona],
I want [capability],
So that [benefit].

## Evidence
[Link to Problem Report, telemetry data, or user feedback]

## Acceptance Criteria
- [ ] [Criterion 1 — measurable]
- [ ] [Criterion 2 — measurable]

## Success Metric
[How will we know this is fixed? What metric should change?]
```

### Step 4: Backlog Integration
1. Save stories to `.hc/stories/`.
2. @pm reviews and approves priority placement.
3. Link stories to the originating Problem Report or feedback source.
4. Update `.hc/roadmap.md` if priority changes affect the roadmap.

### Step 5: Close the Loop
After the fix/feature ships:
1. **Verify the metric improved.** Did the success metric from the story actually change?
2. **Update the Problem Report.** Mark as resolved with evidence.
3. **Communicate to users.** If user-reported, respond that it's been addressed (via `content-marketing` skill or direct communication).

---

## Integration with Other Skills
- **`telemetry-analysis` skill:** Feeds Problem Reports into this loop.
- **`growth-metrics` skill:** Provides the quantitative backing for prioritization.
- **`backlog-grooming` skill:** Integrates feedback-driven stories into sprint planning.
- **`content-marketing` skill:** Closes the loop by communicating fixes back to users.

## Rules
- **Every feedback signal gets triaged.** No feedback should be silently ignored — log it even if you don't act on it.
- **Data over anecdotes.** One angry user ≠ a priority. Look for patterns.
- **Close the loop.** If a user reported it, they should know when it's fixed.

## File Management
- Feedback triage log → `.hc/feedback/triage.md`
- Generated stories → `.hc/stories/`
- Resolved issues → `.hc/feedback/resolved/`
