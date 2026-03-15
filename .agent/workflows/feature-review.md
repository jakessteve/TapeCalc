---
description: Feature Health Review — evaluate existing features for keep, improve, deprecate, or kill decisions
---

# WORKFLOW: /feature-review (Feature Health Review)

Triggered quarterly (alongside `/business-review`), when feature count exceeds manageable threshold, or on-demand by @pm.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- App has been live with measurable usage data
- Telemetry/analytics data available
- Previous feature inventory exists (or this creates the first one)

## Steps

### Step 1 — Feature Inventory — `GEMINI-H/Plan`

**@ba** builds the complete feature inventory:

1. List all user-facing features in the product.
2. For each feature, document: name, launch date, owning module, target persona.
3. Tag each feature's lifecycle stage: New / Growing / Mature / Declining.
4. Identify orphan features (launched but never revisited).

**Output:** Feature inventory in `.hc/reviews/feature-inventory-YYYY-MM-DD.md`

### Step 2 — Usage Data Collection — `GEMINI-H/Plan`

**@biz** collects quantitative data using `growth-metrics` + `telemetry-analysis` skills:

1. Pull usage metrics per feature: DAU, MAU, session frequency, time spent.
2. Analyze engagement trends (growing, stable, declining).
3. Check funnel conversion for features with multi-step flows.
4. Identify features with zero or near-zero usage.
5. Compare feature usage against development investment (LOC, maintenance cost).

**Output:** Usage data table in the review document

### Step 3 — Value Assessment — `GEMINI-H/Plan`

**@pm** evaluates each feature across 4 dimensions:

| Dimension | Question | Score (1-5) |
|---|---|---|
| **User Value** | Does this solve a real user problem? | |
| **Usage** | Is this actively used by our target personas? | |
| **Strategic Fit** | Does this align with our current product vision? | |
| **Maintenance Cost** | How much effort does this require to maintain? | (inverted: 5=low cost) |

**Composite Health Score** = Average of 4 dimensions.

### Step 4 — Classify: Keep / Improve / Deprecate / Kill — `GEMINI-H/Plan`

**@pm** classifies each feature:

| Health Score | Classification | Action |
|---|---|---|
| **≥ 4.0** | **Keep** | No action needed; continue maintaining |
| **3.0 – 3.9** | **Improve** | Enter `/product-discovery` to identify improvements |
| **2.0 – 2.9** | **Deprecate** | Plan sunset: notify users, set removal date |
| **< 2.0** | **Kill** | Remove from product with deprecation plan |

### Step 5 — Action Plans — `GEMINI-H/Plan`

For each non-Keep classification:

#### Improve
1. Document what needs improvement and why.
2. Route to `/product-discovery` for structured validation.
3. Create improvement stories in `.hc/stories/`.

#### Deprecate
1. Define deprecation timeline (minimum 2 release cycles).
2. Plan user communication (in-app notice, changelog).
3. Identify data migration needs (if any).
4. Create deprecation story with acceptance criteria.

#### Kill
1. Verify zero critical user dependency.
2. Create removal plan with rollback capability.
3. Plan user migration path (alternative feature or workaround).
4. Update documentation and marketing materials.

> [!CAUTION]
> Features classified as **Kill** MUST have a deprecation plan with user migration path before removal. No feature can be removed without @pm explicit approval and a deprecation period.

### Step 6 — @pm Approval Gate

**@pm** reviews all classifications and action plans:

1. Approve or override each classification.
2. Prioritize improvement items against existing roadmap.
3. Set timeline for deprecations/kills.
4. Communicate decisions to the team.

**Output:** Approved feature review in `.hc/reviews/feature-review-YYYY-QX.md`

---

## Output Files
| File | Location |
|---|---|
| Feature inventory | `.hc/reviews/feature-inventory-YYYY-MM-DD.md` |
| Feature review (full) | `.hc/reviews/feature-review-YYYY-QX.md` |
| Improvement stories | `.hc/stories/` |
| Deprecation plans | `.hc/reviews/deprecation-[feature].md` |

## Chaining
| Preceding | Following |
|---|---|
| Quarterly schedule / `/business-review` | → `/feature-review` |
| `/feature-review` → Improve | → `/product-discovery` |
| `/feature-review` → Deprecate/Kill | → Deprecation implementation |
| `/customer-feedback-loop` → feature flagged | → `/feature-review` (focused) |
