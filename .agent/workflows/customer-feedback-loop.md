---
description: Customer Feedback Loop - analyze telemetry and user feedback, generate prioritized stories, close the loop
---

# WORKFLOW: /customer-feedback-loop (Feedback-to-Backlog Pipeline)

Triggered when telemetry data or user feedback needs to be analyzed, prioritized, and routed back into the product backlog.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Analytics data, user feedback, or Problem Reports available
- At least one of: telemetry access, user test results, support tickets, error logs

## Steps

### Step 1 — Data Analysis — `GEMINI-H/Plan`

**@ba** analyzes available data using the `telemetry-analysis` skill:

1. Define the analysis question and hypothesis.
2. Collect data from available sources (analytics, error logs, user tests).
3. Identify patterns, anomalies, and drop-off points.
4. Generate Problem Reports for each significant finding.

**Output:** Problem Reports in `.hc/analysis/problems/`

### Step 2 — Signal Prioritization — `GEMINI-H/Plan`

**@pm** prioritizes signals using the `user-feedback-loop` skill:

1. Collect all signals (Problem Reports, user feedback, support tickets).
2. Score each signal using the ICE framework (Impact × Confidence × Ease).
3. Rank signals by ICE score.
4. Determine action for each: Story / Investigate / Ignore.

**Output:** Prioritized signal table in `.hc/feedback/triage.md`

### Step 3 — Story Generation — `GEMINI-H/Plan`

**@pm** converts top-priority signals into user stories:

1. Write user stories following Rule `agile-user-stories.md`.
2. Include evidence links to originating Problem Reports.
3. Define measurable acceptance criteria and success metrics.
4. Save to `.hc/stories/`.

**Output:** User stories in `.hc/stories/`

### Step 4 — Backlog Integration — `GEMINI-H/Plan`

**@pm** integrates stories into the backlog:

1. Route P1 stories to current sprint.
2. Slot P2 stories into next sprint.
3. Park P3 stories in backlog for grooming.
4. Update roadmap if priorities shift.

**Output:** Updated backlog and roadmap

### Step 5 — Verification Loop (Post-Fix)

After stories are implemented and shipped:

1. **@ba:** Re-analyze the metric from the Problem Report — did it improve?
2. **@pm:** Mark the Problem Report as resolved with evidence.
3. **@ba:** Communicate the fix to users (if user-reported) via `content-marketing` skill.
4. If metric did NOT improve → re-enter at Step 1 with new data.

**Output:** Closed feedback loop with evidence

---

## Output Files
| File | Location |
|---|---|
| Problem Reports | `.hc/analysis/problems/` |
| Feedback triage | `.hc/feedback/triage.md` |
| Generated stories | `.hc/stories/` |
| Resolved feedback | `.hc/feedback/resolved/` |
