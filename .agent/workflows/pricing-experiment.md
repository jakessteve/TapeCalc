---
description: Pricing Experiment — structured pipeline for testing pricing models, paywalls, and revenue streams with rollback safety
---

# WORKFLOW: /pricing-experiment (Pricing & Monetization Experiment)

Triggered when testing a new pricing model, paywall, freemium boundary, or revenue stream.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Revenue model or pricing change hypothesis defined
- Ability to implement A/B testing or staged rollout
- Baseline metrics captured (current conversion, revenue, churn)

## Steps

### Step 1 — Hypothesis Definition — `OPUS/Plan`

**@biz** structures the experiment using `monetization-strategy` skill:

1. State hypothesis: "We believe [pricing change] will [expected outcome] because [reasoning]."
2. Define the independent variable (what we're changing: price, tier, feature gate, etc.).
3. Define primary metric (conversion rate, ARPU, churn, etc.).
4. Define guardrail metrics (metrics that must NOT degrade: DAU, satisfaction, etc.).
5. Set minimum experiment duration (typically 2-4 weeks for pricing).
6. Define success criteria: what metric movement constitutes a win?

**Output:** Experiment design in `.hc/experiments/pricing-[name]-design.md`

### Step 2 — Market Benchmark — `OPUS/Plan`

**@biz** benchmarks against market using `competitive-landscape` + `market-sizing` skills:

1. Research competitor pricing for similar features/products.
2. Analyze price sensitivity signals from user feedback.
3. Check willingness-to-pay indicators (if survey data available).
4. Validate proposed pricing against market benchmarks.
5. Flag any pricing that is significantly above or below market range.

**Output:** Benchmark analysis in experiment design doc

### Step 3 — A/B Design & Rollback Plan — `OPUS/Plan`

**@pm** designs the experiment mechanics:

1. Define control group (current pricing) and treatment group (new pricing).
2. Determine split ratio (typically 50/50 for pricing, or 90/10 for higher risk).
3. Create rollback plan: exact steps to revert if guardrail metrics are breached.
4. Define rollback triggers (automatic guardrail breaches).
5. Set data collection checkpoints (Day 1, Day 7, Day 14, Day 28).

> [!CAUTION]
> A rollback plan MUST exist before any pricing experiment is deployed. Pricing changes directly affect revenue and user trust.

**Output:** Experiment plan with rollback procedures

### Step 4 — Implementation — `SONNET/Fast`

**@dev** implements the pricing change:

1. Implement the pricing UI/logic changes behind a feature flag.
2. Add analytics tracking for experiment metrics (`analytics-tracking` skill).
3. Implement A/B splitting logic (or staged rollout percentage).
4. Test both control and treatment paths end-to-end.
5. Ensure rollback is a single flag toggle (not a code change).

**Output:** Implemented experiment behind feature flag

### Step 5 — Monitoring Period — `OPUS/Plan`

**@biz** monitors the experiment using `growth-metrics` skill:

1. Daily check of primary metric and guardrail metrics.
2. **Day 1:** Sanity check — is data being collected? Any obvious bugs?
3. **Day 7:** Early read — any concerning trends? Guardrail breaches?
4. **Day 14:** Midpoint — enough data for preliminary analysis?
5. **Day 28:** Full analysis — statistical significance reached?

**Auto-Rollback Trigger:** If ANY guardrail metric drops >10% from baseline → rollback immediately.

**Output:** Monitoring log in `.hc/experiments/pricing-[name]-monitoring.md`

### Step 6 — Data Analysis — `OPUS/Plan`

**@biz** analyzes results using `financial-modeling` + `growth-metrics` skills:

1. Compare primary metric: treatment vs control (with statistical significance).
2. Check all guardrail metrics — any degradation?
3. Segment analysis: does the change work better for some user segments?
4. Project annual revenue impact of rolling out the change.
5. Calculate confidence score for the recommendation.

**Output:** Analysis report in `.hc/experiments/pricing-[name]-results.md`

### Step 7 — Decision Gate

**@pm** decides based on data:

| Result | Decision | Action |
|---|---|---|
| Primary metric improved, guardrails held | **Roll Out** | Deploy to 100% of users |
| Primary metric improved, guardrails degraded | **Iterate** | Adjust and re-experiment |
| Primary metric unchanged | **Iterate or Abandon** | Try a different approach |
| Primary metric degraded | **Revert** | Rollback and document learnings |

**Output:** Decision record in `.hc/experiments/pricing-[name]-decision.md`

---

## Output Files
| File | Location |
|---|---|
| Experiment design | `.hc/experiments/pricing-[name]-design.md` |
| Monitoring log | `.hc/experiments/pricing-[name]-monitoring.md` |
| Results analysis | `.hc/experiments/pricing-[name]-results.md` |
| Decision record | `.hc/experiments/pricing-[name]-decision.md` |

## Chaining
| Preceding | Following |
|---|---|
| `/business-review` → pricing concern | → `/pricing-experiment` |
| `@biz` monetization analysis | → `/pricing-experiment` |
| `/pricing-experiment` → Roll Out | → `/go-to-market` (announce change) |
| `/pricing-experiment` → Revert | → Document learnings → backlog |
