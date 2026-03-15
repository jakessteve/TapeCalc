---
description: Telemetry Analysis - analyze user behavior data to identify drop-offs, adoption patterns, and engagement trends
---

# SKILL: Telemetry Analysis

**Trigger:** When @ba or @pm needs to analyze user behavior data from analytics platforms (PostHog, Google Analytics, Mixpanel, or equivalent). Used after launches, during metric reviews, or when investigating user experience issues.

---

## When to Use
- Post-launch monitoring (via `launch-strategy` skill Phase 3).
- When `growth-metrics` dashboards show anomalies (drop in retention, spike in errors).
- When @pm requests an investigation into user behavior patterns.
- Before prioritizing product backlog — data-driven feature prioritization.
- When @user-tester identifies UX issues that need quantitative validation.

---

## The 5-Step Analysis Process

### Step 1: Define the Analysis Question
```markdown
## Analysis Brief
**Question:** [What specific behavior are you investigating?]
**Hypothesis:** [What do you expect to find?]
**Data source:** [PostHog / GA / internal analytics / error logs]
**Time range:** [Last 7 days / 30 days / since launch X]
**Success metric:** [What would a "good" answer look like?]
```

### Step 2: Data Collection
Gather quantitative data from available sources:

| Data Type | Source | What to Look For |
|---|---|---|
| **Page views** | Analytics | Which pages get traffic, which don't |
| **User flows** | Session recordings | Where users navigate, where they get lost |
| **Drop-off points** | Funnel analysis | Where users abandon a multi-step process |
| **Feature usage** | Event tracking | Which features are used, frequency, depth |
| **Error rates** | Error monitoring | Which pages/features produce errors |
| **Performance** | Web vitals | Pages with slow load times, layout shifts |
| **Device/locale** | Demographics | Mobile vs desktop, browser, language |

### Step 3: Pattern Recognition
Analyze the collected data for patterns:

1. **Identify anomalies:** What changed? When? What correlates?
2. **Segment analysis:** Does the pattern affect all users or specific segments (mobile, new users, power users)?
3. **Funnel analysis:** At which step do most users drop off? What's the conversion rate at each step?
4. **Temporal patterns:** Is usage clustered at certain times (daily cycles, weekly patterns)?

### Step 4: Problem Report Generation
When analysis reveals issues, generate a structured Problem Report:

```markdown
# Problem Report — [Issue Title]
**Date:** YYYY-MM-DD | **Analyst:** @ba
**Severity:** Critical / High / Medium / Low
**Confidence:** [0-100] (Rule `confidence-routing.md`)

## The Problem
[1-2 sentence description of what the data shows]

## Evidence
| Metric | Expected | Actual | Delta |
|---|---|---|---|
| [metric] | [target] | [reality] | [difference] |

## Affected Users
- **Segment:** [All / Mobile / New users / etc.]
- **Volume:** [How many users affected]
- **Impact:** [What they can't do or are struggling with]

## Root Cause Hypothesis
[Best guess based on data — verified or unverified]

## Recommended Action
| Priority | Action | Owner | Expected Impact |
|---|---|---|---|
| P1 | [Action] | @dev/@designer | [Expected improvement] |

## Data Sources
[List of dashboards, queries, or reports used]
```

### Step 5: Feedback Loop
Route findings to appropriate agents:

| Finding Type | Route To | Via |
|---|---|---|
| Bug/error spike | @dev | `systematic-debugging` skill |
| UX confusion | @designer | `/user-test-session` |
| Performance issue | @dev + @devops | `performance-optimization` skill |
| Feature underuse | @pm | Backlog reprioritization |
| Positive signal | @pm | Double-down decision |

---

## Integration with Other Skills
- **`growth-metrics` skill:** Provides the raw metric dashboards; this skill provides the *analysis* layer.
- **`user-feedback-loop` skill:** Feeds findings back into the product backlog.
- **`launch-strategy` skill:** Post-launch monitoring inputs come from this skill.
- **`user-experience-testing` skill:** Qualitative validation of quantitative findings.

## Rules
- **Data, not opinions.** Every claim must reference a specific metric.
- **Correlation ≠ causation.** Flag when you can't establish causality.
- **Confidence scores.** Apply Rule `confidence-routing.md` to all analysis conclusions.
- **Actionable output.** Analysis without recommendations is incomplete.
- **REQUIRES: Analytics platform access.** This skill requires MCP server integration with analytics APIs to be fully operational. Without integration, analysis is limited to available error logs and manual testing.

## File Management
- Problem reports → `.hc/analysis/problems/`
- Analysis briefs → `.hc/analysis/`
- Metric snapshots → `.hc/metrics/`
