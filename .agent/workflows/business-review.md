---
description: Quarterly business review - market update, financial health, growth metrics, competitive changes, and strategic recommendations
---

# WORKFLOW: /business-review (Quarterly Business Review)

Triggered quarterly or on-demand to evaluate the business health of the product and identify strategic opportunities.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- At least one sprint/phase completed since last review
- Metric data available (`.hc/business/metrics/`, `.hc/metrics/`)

## Steps

### Step 1 — Market Update — `GEMINI-H/Plan`

**@biz** conducts a market intelligence refresh:

1. Update competitive landscape using `competitive-landscape` skill.
2. Check for new entrants, competitor changes, or market shifts via search_web.
3. Review market sizing assumptions — still valid?
4. Summarize changes since last review.

**Output:** Market update section in review doc

### Step 2 — Financial Health Check — `GEMINI-H/Plan`

**@biz** reviews financial metrics using `financial-modeling` skill:

1. Update unit economics (CAC, LTV, LTV:CAC).
2. Review revenue actuals vs. projections.
3. Check burn rate and runway.
4. Flag any concerning trends.

**Output:** Financial health section in review doc

### Step 3 — Growth Metrics Review — `GEMINI-H/Plan`

**@biz** reviews growth using `growth-metrics` skill:

1. Pull AARRR pirate metrics for the quarter.
2. Analyze cohort retention trends.
3. Review feature adoption rates.
4. Compare channel performance (CAC by channel).

**Output:** Growth metrics section in review doc

### Step 4 — Brand & Marketing Audit — `GEMINI-H/Plan`

**@biz** audits brand presence using `brand-strategy` skill:

1. Run brand audit checklist across touchpoints.
2. Review content performance from `content-strategy`.
3. Check SEO rankings and organic traffic trends.
4. Assess social media presence and engagement.

**Output:** Brand & marketing section in review doc

### Step 5 — Strategic Recommendations — `GEMINI-H/Plan`

**@biz** synthesizes findings into actionable recommendations:

1. Identify top 3 opportunities for the next quarter.
2. Identify top 3 risks or threats.
3. Propose specific initiatives with expected impact.
4. Flag any decisions requiring @pm approval.

**Output:** Recommendations section in review doc

### Step 6 — Handoff to @pm

1. Present the Business Review to @pm (User).
2. @pm approves, modifies, or requests deeper analysis.
3. Approved recommendations feed into roadmap planning.
4. Archive the review document.

---

## Output Template
```markdown
# Quarterly Business Review — [Quarter YYYY]
**Date:** YYYY-MM-DD | **Author:** @biz
**Period:** [Start Date] to [End Date]

## 1. Market Update
[Competitive changes, market shifts, new entrants]

## 2. Financial Health
[Unit economics, revenue vs. projections, runway]

## 3. Growth Metrics
[AARRR metrics, retention, feature adoption, CAC by channel]

## 4. Brand & Marketing
[Brand audit results, content performance, SEO, social]

## 5. Strategic Recommendations
### Opportunities
1. [Opportunity + expected impact]

### Risks
1. [Risk + mitigation strategy]

### Proposed Initiatives
| Initiative | Owner | Expected Impact | Priority |
|---|---|---|---|
| [Initiative] | @biz/@pm | [Quantified impact] | P1/P2 |
```

## Output Files
| File | Location |
|---|---|
| Business review | `.hc/business/reviews/YYYY-QX-review.md` |
| Updated competitive landscape | `.hc/business/research/competitive-landscape-YYYY-MM-DD.md` |
| Updated financial model | `.hc/business/financials/` |
| Metric snapshots | `.hc/business/metrics/` |
