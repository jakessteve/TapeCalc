---
description: Analytics Tracking - event taxonomy, tracking plan, and privacy-compliant data collection setup
---

# SKILL: Analytics Tracking

**Trigger:** When @ba or @dev sets up analytics, defines tracking events, or structures user behavior data collection.

---

## When to Use
- Setting up analytics for a new app or feature.
- Defining which user events to track.
- Reviewing/auditing existing tracking for gaps.
- Ensuring privacy compliance (GDPR, CCPA).
- Before `/go-to-market` — ensure tracking is in place before launch.

---

## The 3-Step Tracking Setup

### Step 1: Define the Event Taxonomy
Structure all tracking events consistently using `[object]_[action]` naming:

```typescript
// Event naming convention: object_action
const eventTaxonomy = {
 // Navigation
 'page_viewed': { page: string, referrer: string },
 'tab_switched': { from: string, to: string },
 
 // Core features
 'chart_generated': { type: 'tuvi' | 'battu' | 'numerology' | 'qmdj', duration_ms: number },
 'report_exported': { format: 'pdf' | 'image', pages: number },
 'date_queried': { date: string, features_used: string[] },
 
 // Engagement
 'feature_used': { feature: string, context: string },
 'setting_changed': { setting: string, old_value: string, new_value: string },
 'share_clicked': { content_type: string, platform: string },
 
 // Errors
 'error_occurred': { error_code: string, component: string, user_action: string },
};
```

### Step 2: Create the Tracking Plan
Map events to business questions:

| Business Question | Event | Properties | Priority |
|---|---|---|---|
| Which features are most used? | `feature_used` | feature, context | P1 |
| Where do users drop off? | `page_viewed` | page, referrer, session_id | P1 |
| Which chart types are popular? | `chart_generated` | type, duration_ms | P1 |
| What errors frustrate users? | `error_occurred` | error_code, component | P1 |
| How do users discover features? | `tab_switched` | from, to | P2 |
| Do users share content? | `share_clicked` | content_type, platform | P2 |
| What settings do users customize? | `setting_changed` | setting, new_value | P3 |

### Step 3: Implement with Privacy Guard
```typescript
// Analytics wrapper with consent check
const track = (event: string, properties: Record<string, unknown>) => {
 if (!hasUserConsent()) return; // GDPR gate
 if (import.meta.env.DEV) {
 console.debug('[Analytics]', event, properties);
 return; // No tracking in dev mode
 }
 analytics.track(event, {
 ...properties,
 timestamp: new Date().toISOString(),
 session_id: getSessionId(),
 // NEVER include PII
 });
};
```

---

## Tool Selection Matrix

| Tool | Best For | Self-Hostable | Privacy | Cost |
|---|---|---|---|---|
| **PostHog** | Product analytics, session replay | Yes | High | Free tier |
| **GA4** | Web analytics, SEO tracking | No | Medium | Free |
| **Mixpanel** | Event-based product analytics | No | Medium | Free tier |
| **Plausible** | Simple, privacy-focused | Yes | High | Paid |
| **Umami** | Open-source, lightweight | Yes | High | Free |

**Recommendation for this project:** PostHog (self-hostable, privacy-first, session replay) or Plausible (lightweight, GDPR-compliant).

## Privacy Compliance Checklist
```markdown
## Privacy Review
- [ ] User consent obtained BEFORE tracking (cookie banner / consent dialog)
- [ ] No PII tracked (no names, emails, exact birth dates, IP addresses)
- [ ] Do Not Track (DNT) header respected
- [ ] Tracking disabled in development environment
- [ ] Data retention policy documented (e.g., 90 days for raw events)
- [ ] Privacy policy updated to reflect tracked events
- [ ] GDPR Article 6 lawful basis identified (consent or legitimate interest)
```

## Rules
- **Track events, not page views** — SPA-friendly approach.
- **Include context** in every event (which feature, which page).
- **Never track PII** (names, emails, exact birth dates) — Rule `security-standards.md`.
- **Consent first** — disable tracking until user consents (GDPR/privacy).
- **Dev mode = no tracking** — use `console.debug` in development.
- **Document the taxonomy** — maintain a tracking plan document for the team.
