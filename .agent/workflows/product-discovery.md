---
description: Product Discovery — validate feature ideas against user needs before committing to development
---

# WORKFLOW: /product-discovery (Feature Validation Pipeline)

Triggered when @pm considers a new feature or major enhancement. Validates the idea against user needs, feasibility, and strategic fit before entering the development pipeline.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Feature idea defined (at least a 1-sentence description)
- Market research available (from `/market-research` or existing knowledge) — recommended but not strictly required for Small features
- Access to telemetry data and user feedback channels

## Steps

### Step 1 — Problem Definition — `OPUS/Plan`

**@ba** structures the problem using `requirement-interviewer` skill:

1. Define the **user problem** being solved (not the solution, the problem).
2. Identify the target user persona(s) from `@user-tester.md`.
3. Document current workarounds users employ (if any).
4. Ask: "If this problem disappeared, what would change for the user?"
5. Validate that the problem is real (not assumed) with at least 1 evidence source.

**Output:** Problem statement in `.hc/discovery/[feature]-problem.md`

### Step 2 — User Need Hypothesis — `OPUS/Plan`

**@ba** formulates testable hypotheses:

1. State the hypothesis: "We believe [persona] needs [capability] because [evidence]."
2. Define what would prove/disprove the hypothesis.
3. List assumptions that underpin the hypothesis.
4. Rank assumptions by risk (high-risk = must validate before building).

**Output:** Hypothesis section in discovery doc

### Step 3 — Signal Collection — `OPUS/Plan`

**@ba** (with @biz support) collects evidence:

1. Review telemetry data for related feature usage patterns (`telemetry-analysis` skill).
2. Check user feedback in `.hc/feedback/` and app store reviews.
3. Search for competitor implementations of similar features.
4. If available, review support tickets or user requests.
5. Estimate the number of users affected by the problem.

**Output:** Evidence matrix with source, signal strength, and interpretation

### Step 4 — Solution Options — `GEMINI-H/Plan`

**@ba** generates solution alternatives:

1. Brainstorm 2-4 solution approaches (ranging from minimal to comprehensive).
2. For each approach, define: scope, effort estimate, user value, risk level.
3. Identify the MVP approach — smallest thing that validates the hypothesis.
4. Flag any technical dependencies or blockers for @sa review.

**Output:** Solution options table in discovery doc

### Step 5 — Feasibility Check — `OPUS/Plan`

**@sa** evaluates technical feasibility:

1. Assess architectural impact of each solution option.
2. Identify technical risks and dependencies.
3. Estimate effort (T-shirt sizing: S/M/L/XL).
4. Check for conflicts with existing architecture or planned work.
5. Flag any security or performance concerns.

**Output:** Feasibility assessment in discovery doc

### Step 6 — Value × Effort Matrix — `OPUS/Plan`

**@pm** scores each solution option:

| Dimension | Score (1-5) | Weight |
|---|---|---|
| User Value | How much does this solve the stated problem? | 3x |
| Market Value | Does this differentiate us from competitors? | 2x |
| Strategic Fit | Does this align with our product vision? | 2x |
| Feasibility | How easy is this to build? (inverted effort) | 1x |
| Risk | How confident are we in the assumptions? | 1x |

**Composite Score** = Σ(Score × Weight) / Σ(Weight)

### Step 7 — GO/NO-GO Decision Gate

**@pm** makes the decision:

| Composite Score | Decision | Next Step |
|---|---|---|
| **≥ 4.0** | **GO** — high confidence | → `/idea-to-prd` |
| **3.0 – 3.9** | **CONDITIONAL GO** — needs more evidence | → Additional validation, then re-score |
| **< 3.0** | **NO-GO** — kill the idea | → Archive with rationale |

> [!CAUTION]
> New features MUST NOT enter `/scaffold-feature` or `/hc-sdlc` without passing this Discovery Gate. This prevents building features nobody needs.

**Output:** Decision record in `.hc/discovery/[feature]-decision.md`

---

## Output Files
| File | Location |
|---|---|
| Problem statement | `.hc/discovery/[feature]-problem.md` |
| Discovery document (full) | `.hc/discovery/[feature]-discovery-YYYY-MM-DD.md` |
| Decision record | `.hc/discovery/[feature]-decision.md` |

## Chaining
| Preceding | Following |
|---|---|
| `/market-research` → GO | → `/product-discovery` |
| @pm identifies feature idea | → `/product-discovery` |
| `/product-discovery` → GO | → `/idea-to-prd` → `/hc-sdlc` |
| `/product-discovery` → NO-GO | → Archive |
| `/feature-review` → Improve | → `/product-discovery` |
