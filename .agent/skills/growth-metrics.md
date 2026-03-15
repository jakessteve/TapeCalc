---
description: Growth Metrics - track user acquisition funnels, feature adoption, retention, and product-market fit signals
---

# SKILL: Growth Metrics

**Trigger:** When @pm needs to measure product performance, track user behavior, or provide data for roadmap decisions. Used after launches, during sprint reviews, and for investor updates.

---

## When to Use
- After any feature launch (via `launch-strategy` skill).
- During sprint reviews and roadmap planning.
- When preparing investor metrics (Rule `investor-metrics.md`).
- When evaluating feature success or deciding what to build next.
- When `telemetry-analysis` skill identifies a trend needing quantification.

---

## Core Metrics Framework: AARRR (Pirate Metrics)

| Stage | Metric | Question | Measurement |
|---|---|---|---|
| **Acquisition** | New visitors, traffic sources | How do people find us? | Page views, referral sources, SEO rankings |
| **Activation** | First meaningful action | Do they have a good first experience? | Feature X used within first session, onboarding completion |
| **Retention** | Return visits, DAU/MAU | Do they come back? | DAU/WAU/MAU, session frequency, 7-day/30-day retention |
| **Revenue** | Conversion, monetization | Do they pay/generate value? | Conversion rate, ARPU, premium upgrades |
| **Referral** | Shares, invites, word-of-mouth | Do they tell others? | Share count, referral traffic, NPS |

## Metric Tracking Templates

### Feature Adoption Dashboard
```markdown
## Feature Adoption — [Feature Name]
**Launch Date:** [YYYY-MM-DD] | **Tracking Period:** [X days]

### Usage
| Metric | Day 1 | Day 7 | Day 30 | Target |
|---|---|---|---|---|
| Total users who tried feature | | | | |
| % of active users who used it | | | | |
| Avg. uses per user per session | | | | |
| Drop-off at step [critical step] | | | | |

### Engagement
| Metric | Value | Trend |
|---|---|---|
| Avg. time in feature | | ↑/→/↓ |
| Completion rate (if multi-step) | | ↑/→/↓ |
| Error rate within feature | | ↑/→/↓ |
```

### Product Health Dashboard
```markdown
## Product Health — [Sprint/Month]
**Period:** [Start] to [End]

### Core KPIs
| KPI | Previous | Current | Δ | Status |
|---|---|---|---|---|
| DAU | | | | // |
| WAU | | | | |
| Session duration (avg) | | | | |
| Page load time (p50) | | | | |
| Error rate | | | | |
| User satisfaction (if surveyed) | | | | |

### Feature Rankings (by usage)
| Rank | Feature | MAU | % of total users | Trend |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
```

### Investor Metrics Snapshot
```markdown
## Investor Metrics — [Quarter/Month]
**Date:** YYYY-MM-DD

| Metric | Value | MoM Change | Industry Benchmark |
|---|---|---|---|
| Total users | | | |
| MAU | | | |
| Retention (30-day) | | | — |
| Growth rate (MoM) | | | — |
| Feature velocity (features/month) | | | — |
| Code quality (test coverage %) | | | ≥80% |
| Technical debt (open issues) | | | — |
```

---

## Cohort Analysis Template
For tracking user behavior across time-based groups:

```markdown
## Cohort Analysis — [Feature/Product]
**Cohort type:** Week of first visit

| Cohort | Size | Week 1 | Week 2 | Week 3 | Week 4 |
|---|---|---|---|---|---|
| Jan W1 | 100 | 100% | 40% | 25% | 20% |
| Jan W2 | 120 | 100% | 45% | 30% | — |
```

---

## Decision Framework: When Metrics Drive Action

| Signal | Action |
|---|---|
| Feature adoption < 10% after 30 days | Investigate UX barriers → trigger `/user-test-session` |
| Retention drop > 15% MoM | Emergency investigation → route to `telemetry-analysis` |
| Error rate spike > 2x | Trigger `systematic-debugging` + `incident-responder` |
| Referral traffic increasing | Double down on the source channel |
| Feature usage plateaus | Consider feature iteration or sunset |

---

## Integration with Other Skills
- **`investor-metrics` rule:** Growth metrics feed directly into investor reporting.
- **`telemetry-analysis` skill:** Raw data analysis that produces inputs for this skill.
- **`launch-strategy` skill:** Post-launch metrics from Phase 3 flow here.
- **`user-feedback-loop` skill:** Qualitative feedback complements quantitative metrics.

## Rules
- **Metrics without context are noise.** Always include comparison (previous period, target, benchmark).
- **Don't track vanity metrics.** Page views without engagement data is meaningless.
- **Update regularly.** Metrics dashboards go stale fast — refresh at minimum per sprint.

## File Management
- Metric dashboards → `.hc/metrics/`
- Cohort analyses → `.hc/metrics/cohorts/`
- Investor snapshots → `.hc/metrics/investor/`
