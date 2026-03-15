---
description: Go-to-Market - full pipeline from feature completion to public launch and post-launch monitoring
---

# WORKFLOW: /go-to-market (Feature-to-Launch Pipeline)

Triggered when a feature is ready for public release and needs marketing content, SEO optimization, and launch coordination.

> **Single-LLM Execution Model:** "Call @agent" means **assume that agent's persona** and execute using available tools.

## Prerequisites
- Feature has passed @qc verification (`verification-before-completion`)
- Feature has passed @user-tester evaluation (`/user-test-session`) — if UI-facing
- @pm has approved the feature for release

## Steps

### Step 1 — Content Generation — `GEMINI-H/Plan`

**@biz** generates marketing content using the `content-marketing` skill:

1. Read the feature's PRD, implementation notes, and test results.
2. Determine content types needed (blog, social, email, changelog).
3. Draft all content pieces using the templates in `content-marketing` skill.
4. Include screenshots/GIFs of the feature (use `browser_subagent` to capture).
5. Request supporting data from @ba if needed (PRD details, technical specs).

**Output:** Content drafts in `.hc/business/content/`

### Step 2 — SEO Optimization — `GEMINI-H/Plan`

**@biz** optimizes all content using the `seo-copywriting` skill:

1. Research target keywords for the feature.
2. Optimize title tags, meta descriptions, and heading structure.
3. Write or update landing page copy if applicable.
4. Ensure OG tags are configured for social sharing.

**Output:** SEO-optimized content + meta tag recommendations

### Step 3 — Launch Planning — `OPUS/Plan`

**@pm** creates the launch plan using the `launch-strategy` skill:

1. Complete the Launch Readiness Checklist.
2. Define the Channel Strategy Matrix.
3. Create the Launch Day Timeline.
4. Ensure @devops has the deployment + rollback plan ready.
5. Confirm content is reviewed and approved.

**Output:** Launch plan in `.hc/launches/`

### Step 4 — Launch Execution — `SONNET/Fast`

Execute the launch timeline:

1. **@devops:** Deploy to production.
2. **@qc:** Smoke test production deployment.
3. **@biz:** Publish blog post, send social thread, send email.
4. **@pm:** Submit to distribution channels (Product Hunt, etc.)
5. **@devops:** Monitor error rates and performance.

### Step 5 — Post-Launch Monitoring (T+1 to T+7) — `OPUS/Plan`

**@biz** tracks launch results using the `growth-metrics` skill, with @pm oversight:

1. Capture Day 1, Day 7 metrics using the Post-Launch Metrics Template.
2. Route user feedback to appropriate agents (bugs → @dev, UX → @designer).
3. Iterate content based on user questions and feedback.
4. Write Post-Launch Report.

**Output:** Post-launch report in `.hc/launches/reports/`

### Step 6 — Handoff

1. Present Post-Launch Report to User.
2. Archive launch files.
3. Feed learnings into next sprint's planning.
4. Trigger `/retrospective` if it was a major launch.

---

## Output Files
| File | Location |
|---|---|
| Content drafts | `.hc/content/` |
| Launch plan | `.hc/launches/YYYY-MM-DD-[feature].md` |
| Post-launch report | `.hc/launches/reports/YYYY-MM-DD-[feature].md` |
| Metric snapshots | `.hc/metrics/` |
