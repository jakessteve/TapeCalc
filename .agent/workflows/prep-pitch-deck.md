---
description: Generate investor pitch one-pager from existing project documentation
---

# Workflow: /prep-pitch-deck

Scan existing project docs and generate an investor-ready one-pager for angel investor pitches.

---

## Prerequisites
- Existing PRD (`docs/biz/PRD.md` or `docs/biz/PRODUCT_BRIEF.md`)
- Project codebase (for traction evidence)
- @ba agent role active

## Steps

### Step 1 — Scan Project Documentation
Read and extract key information from:
1. **PRD / Product Brief** — Problem statement, solution, features, success metrics.
2. **Architecture docs** (`docs/tech/ARCHITECTURE.md`) — Tech stack, scale decisions.
3. **Codebase** — What's already built (feature count, code maturity).
4. **Research reports** (`.hc/research/`) — Market data, competitive analysis.
5. **Release notes** (`.hc/releases/`) — Traction milestones, shipped features.

### Step 2 — Analyze Project Potential
Using `sequential-thinking`, evaluate:
- **Problem validation:** Is the problem backed by data?
- **Solution differentiation:** What makes this different from competitors?
- **Market size:** Can we estimate TAM/SAM/SOM from research?
- **Traction:** What concrete progress has been made?
- **Business model:** How does this make money?
- **Risks:** What are the biggest unknowns?

If market data is missing, use `search_web` to find:
- Market size estimates for the sector
- Competitor landscape and funding history
- Industry growth trends

### Step 3 — Generate One-Pager
Activate the `investor-pitch-writer` skill:
1. Structure the one-pager using the skill's template.
2. Fill in all sections from the scanned data.
3. Replace vague claims with specific numbers.
4. Keep to ~500 words maximum.
5. Ensure zero technical jargon.

### Step 4 — Quality Check
Run through the skill's quality checklist:
- [ ] Fits on one page
- [ ] Problem backed by data
- [ ] USP clear in one sentence
- [ ] Market size has TAM and SAM
- [ ] Traction shows proof, not promises
- [ ] The Ask is specific
- [ ] Zero technical jargon
- [ ] Understandable in 60 seconds

### Step 5 — Present for Review
Save to `docs/pitch/one-pager-[date].md`.
Create an Artifact with the one-pager content.
Present to User via `notify_user` for feedback.

---

## Output Files
| File | Location |
|------|----------|
| One-pager | `docs/pitch/one-pager-YYYY-MM-DD.md` |
| Market research (if new) | `.hc/research/market-analysis-[topic].md` |
