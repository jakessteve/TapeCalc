---
description: Customer Acquisition - channel strategy, funnel optimization, CAC management, referral programs, and viral loop design
---

# SKILL: Customer Acquisition

**Trigger:** When @biz needs to plan, optimize, or audit how the product attracts and converts new users.

---

## When to Use
- Designing the initial user acquisition strategy for launch.
- Evaluating which channels drive the most cost-effective growth.
- Optimizing conversion funnels (landing page → sign-up → activation).
- Designing referral or viral growth mechanisms.
- Reviewing and optimizing Customer Acquisition Cost (CAC).
- Planning influencer/KOL outreach for the Vietnamese market.

---

## The Acquisition Framework

### Step 1: Channel Identification
Map all potential acquisition channels and evaluate fit:

| Channel | Type | Cost | Scale | Speed | Best For |
|---|---|---|---|---|---|
| **SEO / Content** | Organic | Low | High | Slow (3-6 mo) | Sustained traffic, authority |
| **App Store Optimization** | Organic | Low | Medium | Medium | Mobile-first products |
| **Social Media (organic)** | Organic | Low | Medium | Medium | Community building, virality |
| **Social Media (paid)** | Paid | Medium | High | Fast | Targeted reach, testing |
| **Google Ads** | Paid | Medium-High | High | Fast | Intent-based traffic |
| **Facebook/Zalo Ads** | Paid | Low-Medium | High | Fast | Vietnamese market reach |
| **Influencer/KOL** | Paid | Variable | Medium | Fast | Trust, social proof |
| **Referral Program** | Hybrid | Low | Medium | Medium | Viral growth, high-quality users |
| **Partnerships** | Organic | Low | Variable | Slow | Distribution, credibility |
| **PR / Press** | Organic | Low | High | Fast (burst) | Launch momentum |
| **Community / Forums** | Organic | Low | Low | Slow | Niche authority |
| **Email Marketing** | Owned | Low | Medium | Medium | Retention, re-engagement |

### Step 2: Channel Scoring (ICE)
Prioritize channels using Impact × Confidence × Ease:

```markdown
## Channel Prioritization — [Product]
**Date:** YYYY-MM-DD | **Author:** @biz

| Channel | Impact (1-10) | Confidence (1-10) | Ease (1-10) | ICE Score | Priority |
|---|---|---|---|---|---|
| [Channel] | | | | | P1/P2/P3 |
```

### Step 3: Funnel Design
Map the acquisition funnel for each priority channel:

```markdown
## Acquisition Funnel — [Channel]

| Stage | Metric | Current | Target | Action |
|---|---|---|---|---|
| **Awareness** | Impressions / reach | | | [Content, ads, SEO] |
| **Interest** | Click-through rate | | | [Landing page, CTA] |
| **Consideration** | Page engagement, feature discovery | | | [Value demo, social proof] |
| **Conversion** | Sign-up / install | | | [Friction reduction] |
| **Activation** | First meaningful action | | | [Onboarding, feature guidance] |
```

### Step 4: CAC Optimization
Track and optimize cost per acquisition:

```markdown
## CAC Analysis — [Period]
| Channel | Spend | Users Acquired | CAC | LTV | LTV:CAC | Status |
|---|---|---|---|---|---|---|
| [Channel] | $X | N | $X/N | $Y | Y/X | // |

### CAC Reduction Strategies
- [ ] Improve landing page conversion rate (current: X%, target: Y%)
- [ ] Optimize ad targeting (reduce wasted spend)
- [ ] Increase organic channels (SEO, referral) to lower blended CAC
- [ ] Improve activation rate (reduce "acquired but never activated")
```

### Step 5: Viral & Referral Design
Design built-in growth mechanisms:

| Mechanism | How It Works | Success Metric |
|---|---|---|
| **Share results** | Users share Tử Vi / fortune readings | Shares per user per month |
| **Referral rewards** | Invite friends → unlock premium feature | Viral coefficient (K-factor) |
| **Screenshot-friendly UI** | Results designed to be screenshot-worthy | Organic social mentions |
| **Social proof** | "X people checked today" | Trust + FOMO |
| **Content virality** | Daily/weekly shareable content (fortune, tips) | Content shares |

**Viral Coefficient (K-factor):** `K = invitations sent per user × conversion rate of invitations`
- K > 1 = viral growth (each user brings more than one new user)
- K = 0.5-1.0 = good organic supplement
- K < 0.5 = need paid channels to grow

---

## Vietnamese Market Specifics

| Factor | Strategy |
|---|---|
| **Zalo dominance** | Zalo is the primary messaging app — sharing must work via Zalo, not just WhatsApp/Telegram |
| **Facebook usage** | Vietnamese Facebook usage is high — Facebook Ads and Groups are effective channels |
| **KOL culture** | Vietnamese users trust KOL recommendations — identify niche astrology/lifestyle influencers |
| **Price sensitivity** | Premium pricing must offer clear value — free tier must be genuinely useful |
| **Mobile-first** | 80%+ mobile users — all acquisition funnels must be mobile-optimized |
| **Seasonal spikes** | Tết (Lunar New Year) and major holidays drive massive traffic spikes — plan campaigns around them |

---

## Rules
- **Test before scaling.** Run small experiments before committing budget.
- **Track CAC by channel.** Blended CAC hides underperformers.
- **Organic-first mindset.** Build sustainable channels (SEO, referral) before scaling paid.
- **Measure activation, not just sign-ups.** A user who signs up but never activates is a wasted CAC.
- **Vietnamese-market awareness.** Channel strategies must account for local platform preferences.

## File Management
- Channel analyses → `.hc/business/acquisition/`
- Funnel designs → `.hc/business/acquisition/funnels/`
- CAC reports → `.hc/business/metrics/cac/`
- Referral program docs → `.hc/business/acquisition/referral/`
