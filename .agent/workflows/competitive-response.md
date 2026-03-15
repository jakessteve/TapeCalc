---
description: Rapid Competitive Response — triage and respond to competitor moves within 24 hours
---

# WORKFLOW: /competitive-response (Rapid Competitive Response)

Triggered when a competitor launches a significant feature, enters your market, makes a pricing change, or a major market shift is detected.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Competitive intelligence alert (from monitoring, user feedback, or manual detection)
- Access to web search and competitor products

## Steps

### Step 1 — Alert & Initial Assessment (4-hour SLA) — `GEMINI-H/Plan`

**@biz** performs rapid competitive assessment:

1. Identify the competitive event: What happened? Who did what?
2. Classify threat level:
 - ** High:** Direct competitor launched feature we planned, pricing undercut, market entry.
 - ** Medium:** Adjacent competitor expanded, market trend shift, new entrant.
 - ** Low:** Minor update, niche player move, no user overlap.
3. Assess user impact: Will our users notice? Will they consider switching?
4. Document initial assessment.

> [!IMPORTANT]
> Initial assessment MUST be completed within **4 hours** of alert detection. Speed matters in competitive response.

**Output:** Alert assessment in `.hc/business/competitive/alert-YYYY-MM-DD-[event].md`

### Step 2 — Deep Analysis (24-hour SLA) — `GEMINI-H/Plan`

**@biz** conducts depth competitive analysis using `competitive-landscape` skill:

1. Analyze competitor's new offering in detail: features, pricing, positioning.
2. Compare feature-by-feature with our product.
3. Identify our advantages and disadvantages.
4. Assess competitor's execution quality (is it well done, or rushed?).
5. Check user sentiment: are our users talking about it?
6. Estimate impact on our market position: share, positioning, differentiation.

**Output:** Deep analysis section in alert document

### Step 3 — Response Options — `GEMINI-H/Plan`

**@biz** (with @ba support) generates response options:

1. **Ignore:** Competitor's move doesn't threaten our position. Cost: zero. Risk: competitor gains ground.
2. **Monitor:** Watch for user reaction. Set 30-day review. Cost: low. Risk: slow response if threat escalates.
3. **Differentiate:** Double down on our unique strengths. Highlight what we do that they can't.
4. **Fast-Track:** Accelerate a planned feature to match or exceed competitor. Cost: reallocation. Risk: rushed quality.
5. **Pivot:** Significant strategic shift in response. Cost: high. Risk: overreaction.

For each option, estimate: effort, timeline, risk, and impact on current roadmap.

**Output:** Response options matrix

### Step 4 — @pm Decision Gate

**@pm** selects a response strategy:

| Threat Level | Recommended Response | Decision SLA |
|---|---|---|
| High | Fast-Track or Differentiate | Within 24 hours |
| Medium | Monitor or Differentiate | Within 1 week |
| Low | Ignore or Monitor | Next sprint planning |

> [!CAUTION]
> **"React" decisions (Fast-Track or Pivot) MUST have a scoped plan before entering the development pipeline.** Do not rush features into development without proper planning — a rushed response is worse than no response.

**Output:** Decision record with rationale

### Step 5 — Execute Response — varies

Based on the decision:

#### If Fast-Track:
1. @pm creates an accelerated implementation plan.
2. Route through `/product-discovery` (abbreviated: Steps 1, 4, 5 only — skip extensive research).
3. Enter `/scaffold-feature` or `/hc-sdlc` with elevated priority.
4. Follow standard QC and UAT gates — no shortcuts on quality.

#### If Differentiate:
1. @biz creates differentiation messaging using `brand-strategy` + `content-marketing` skills.
2. Update landing page, comparison pages, and marketing materials.
3. Highlight unique features in social and blog content.

#### If Monitor:
1. Set 30-day calendar reminder for re-assessment.
2. Track competitor feature adoption and user sentiment.
3. Prepare contingency Fast-Track plan (so we're ready if needed).

### Step 6 — Post-Response Review (T+30 days) — `GEMINI-H/Plan`

**@biz** evaluates the response effectiveness:

1. Did the competitive threat materialize as expected?
2. Did our response achieve its objective?
3. What would we do differently next time?
4. Update `.hc/business/competitive/` with learnings.
5. Feed insights into next `/business-review`.

---

## Output Files
| File | Location |
|---|---|
| Alert assessment | `.hc/business/competitive/alert-YYYY-MM-DD-[event].md` |
| Response decision | `.hc/business/competitive/response-YYYY-MM-DD-[event].md` |
| Post-response review | `.hc/business/competitive/review-YYYY-MM-DD-[event].md` |

## Chaining
| Preceding | Following |
|---|---|
| Competitive alert detected | → `/competitive-response` |
| `/competitive-response` → Fast-Track | → `/product-discovery` (abbreviated) → `/scaffold-feature` |
| `/competitive-response` → Differentiate | → `/go-to-market` (differentiation campaign) |
| `/competitive-response` → Monitor | → 30-day re-assessment |
| Post-response review | → `/business-review` (learnings) |
