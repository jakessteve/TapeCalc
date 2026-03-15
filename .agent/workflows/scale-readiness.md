---
description: Scale-Up Readiness Audit — evaluate technical and business readiness before major scaling events
---

# WORKFLOW: /scale-readiness (Scale-Up Readiness Audit)

Triggered before major launches, new market entry, when growth metrics indicate inflection point, or on-demand by @pm.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Growth metrics showing scale-up trigger (e.g., 2x MoM growth, new market entry planned)
- Access to infrastructure metrics and cost data
- Current architecture documentation available

## Steps

### Step 1 — Technical Readiness — `SONNET/Fast`

**@devops** audits infrastructure readiness:

1. Review current infrastructure capacity vs projected load (2x, 5x, 10x scenarios).
2. Identify single points of failure and bottlenecks.
3. Check database scaling strategy (connection pooling, read replicas, sharding readiness).
4. Evaluate CDN, caching, and edge deployment coverage.
5. Review monitoring and alerting coverage — are we prepared for incident response at scale?
6. Check CI/CD pipeline capacity for increased deployment frequency.

**Score:** Ready / Needs work (with timeline) / Not ready

### Step 2 — Performance Readiness — `SONNET/Fast`

**@dev** audits application performance using `/performance-audit` workflow:

1. Run Lighthouse audit on key pages.
2. Profile bundle size and identify optimization opportunities.
3. Check for O(n²) algorithms that won't scale.
4. Evaluate API response times under simulated load.
5. Review client-side performance budgets (Core Web Vitals).

**Score:** Ready / Needs work (with timeline) / Not ready

### Step 3 — Cost Projection — `GEMINI-H/Plan`

**@biz** models scaling costs using `financial-modeling` skill:

1. Project infrastructure costs at 2x, 5x, 10x current load.
2. Calculate unit economics at scale (cost per user, margin impact).
3. Identify cost cliffs (thresholds where pricing tier changes occur).
4. Model revenue vs cost trajectory — when does scaling break even?
5. Flag any unexpected cost increases (e.g., API rate limits, licensing thresholds).

**Score:** Sustainable / Concerning / Unsustainable

### Step 4 — Market Readiness — `GEMINI-H/Plan`

**@biz** evaluates market position for scale using `competitive-landscape` + `growth-metrics` skills:

1. Is current market positioning clear and differentiated?
2. Are acquisition channels scalable (not dependent on manual outreach)?
3. Is the brand ready for broader awareness (brand guidelines, consistent messaging)?
4. Are there regulatory/compliance requirements for new markets?
5. Is content/marketing infrastructure ready for increased volume?

**Score:** Ready / Needs work / Not ready

### Step 5 — Product Readiness — `GEMINI-H/Plan`

**@ba** evaluates product maturity:

1. Are core features stable and well-tested?
2. Is the onboarding flow optimized for new users at scale?
3. Are localization/i18n requirements met for target markets?
4. Is the support/documentation adequate for self-service at scale?
5. Are there known UX issues that would cause churn at higher volumes?

**Score:** Ready / Needs work / Not ready

### Step 6 — Gap Analysis & Remediation Plan — `GEMINI-H/Plan`

**@pm** synthesizes all dimension scores:

```markdown
# Scale Readiness Scorecard

| Dimension | Score | Key Gaps | Remediation | Timeline |
|---|---|---|---|---|
| Technical | // | [Gaps] | [Plan] | [Weeks] |
| Performance | // | [Gaps] | [Plan] | [Weeks] |
| Cost | // | [Gaps] | [Plan] | [Weeks] |
| Market | // | [Gaps] | [Plan] | [Weeks] |
| Product | // | [Gaps] | [Plan] | [Weeks] |
```

### Step 7 — Scale Decision Gate

**@pm** decides:

| Scorecard Result | Decision |
|---|---|
| All | **GO** — proceed with scale-up |
| Mix of and , no | **CONDITIONAL GO** — fix items first |
| ANY | **NOT READY** — fix items, re-audit |

> [!CAUTION]
> Scale-up MUST NOT proceed if ANY dimension scores . All items MUST have remediation dates and owners before CONDITIONAL GO.

---

## Output Files
| File | Location |
|---|---|
| Readiness scorecard | `.hc/reviews/scale-readiness-YYYY-MM-DD.md` |
| Remediation plans | `.hc/reviews/scale-remediation-[dimension].md` |
| Cost projections | `.hc/business/financials/scale-model-YYYY-MM-DD.md` |

## Chaining
| Preceding | Following |
|---|---|
| Growth metrics trigger | → `/scale-readiness` |
| `/scale-readiness` → GO | → `/go-to-market` (if launching to new market) |
| `/scale-readiness` → NOT READY | → Remediation tasks → Re-audit |
| `/business-review` → growth inflection | → `/scale-readiness` |
