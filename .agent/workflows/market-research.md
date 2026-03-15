---
description: Structured market research pipeline — validate market opportunity before committing to feature development
---

# WORKFLOW: /market-research (Market Research Pipeline)

Triggered before any P1+ feature commitment, when entering a new market segment, or on-demand by @pm/@biz.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Feature idea or market question defined by @pm
- Web search access available

## Steps

### Step 1 — Define Research Question — `GEMINI-H/Plan`

**@biz** scopes the research:

1. Define the core question: "Should we build X?" or "Is market Y viable?"
2. List specific sub-questions (market size, competitors, user willingness to pay, etc.).
3. Set research time-box (2-4 hours for standard, 1 day for deep research).
4. Define success criteria: what evidence would make a GO vs NO-GO decision.

**Output:** Research brief in `.hc/business/research/brief-[topic].md`

### Step 2 — Desk Research — `GEMINI-H/Plan`

**@biz** conducts secondary research using `competitive-landscape` + `market-sizing` skills:

1. Search for existing market reports, industry analyses, and trend data.
2. Identify key players, market leaders, and emerging competitors.
3. Collect pricing data from competitors (free tiers, premium pricing, monetization models).
4. Research regulatory or cultural considerations (especially for Vietnamese market).

**Output:** Raw research notes (internal working doc)

### Step 3 — Competitive Scan — `GEMINI-H/Plan`

**@biz** performs structured competitive analysis using `competitive-landscape` skill:

1. Build a feature comparison matrix (our product vs. top 3-5 competitors).
2. Identify competitive gaps (features competitors have that we don't, and vice versa).
3. Assess competitor positioning and target audience overlap.
4. SWOT analysis for our position in this market.

**Output:** Competitive analysis section in research report

### Step 4 — User Signal Analysis — `GEMINI-H/Plan`

**@ba** analyzes existing user signals:

1. Review telemetry data for related feature usage (if applicable).
2. Check `.hc/feedback/` for user requests related to this market opportunity.
3. Review app store reviews and user feedback channels.
4. Estimate demand based on search volume and social signals.

**Output:** User signal analysis section in research report

### Step 5 — Market Sizing — `GEMINI-H/Plan`

**@biz** estimates market opportunity using `market-sizing` skill:

1. Define TAM (Total Addressable Market) — everyone who could use this.
2. Define SAM (Serviceable Addressable Market) — who we can actually reach.
3. Define SOM (Serviceable Obtainable Market) — realistic capture in 12-18 months.
4. Cross-validate with at least 2 different estimation methods.

**Output:** Market sizing section in research report

### Step 6 — Synthesis & Recommendation — `GEMINI-H/Plan`

**@biz** synthesizes all findings:

1. Compile findings into a structured Market Research Report.
2. Score the opportunity: Market Size × Competitive Position × Feasibility × Strategic Fit.
3. Provide clear recommendation: **GO** / **CONDITIONAL GO** / **NO-GO**.
4. If CONDITIONAL GO: list specific conditions that must be met.
5. Apply confidence score (Rule `confidence-routing.md`).

**Output:** Final report in `.hc/business/research/market-research-[topic]-YYYY-MM-DD.md`

### Step 7 — @pm Decision Gate

**@pm** reviews the market research report and decides:

1. **GO** → Feature enters `/product-discovery` or `/idea-to-prd` pipeline.
2. **CONDITIONAL GO** → Address conditions first, then re-evaluate.
3. **NO-GO** → Feature is killed. Record decision rationale for future reference.

> [!IMPORTANT]
> P1+ features MUST NOT enter development without a market research record in `.hc/business/research/`. This gate prevents building features without market validation.

---

## Output Files
| File | Location |
|---|---|
| Research brief | `.hc/business/research/brief-[topic].md` |
| Market research report | `.hc/business/research/market-research-[topic]-YYYY-MM-DD.md` |
| Competitive analysis | Inline in research report or `.hc/business/research/competitive-*.md` |

## Chaining
| Preceding | Following |
|---|---|
| @pm identifies feature opportunity | → `/market-research` |
| `/market-research` → GO | → `/product-discovery` or `/idea-to-prd` |
| `/market-research` → NO-GO | → Archive, inform roadmap |
| `/business-review` → opportunity identified | → `/market-research` |
