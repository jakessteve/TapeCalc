---
description: Mobile Readiness - viewport audit, touch target check, gesture handling, and PWA checklist
---

# Workflow: /mobile-readiness

**Trigger:** Pre-mobile port, responsive QA, or mobile-first design verification.

## Steps

### 1. Viewport Audit
Use `browser-visual-testing` to check all pages at 320px, 425px, and 768px.
Verify no horizontal overflow.

### 2. Touch Target Check
@designer uses `mobile-ux-patterns` to audit all interactive elements:
- All touch targets ≥ 44×44 px
- Adequate spacing between targets (≥ 8px)
- Primary actions in thumb zone

### 3. Navigation Review
Verify mobile navigation pattern:
- Bottom tabs or hamburger menu for primary nav
- Breadcrumbs or back arrows for deep pages
- No hover-only interactions

### 4. Progressive Disclosure
Verify dense content uses collapsible sections, tabs, or drill-down.

### 5. Performance on Mobile
Use Lighthouse with mobile emulation and 3G throttling.
Verify LCP < 4s on slow connections.

### 6. PWA Checklist (if applicable)
- [ ] `manifest.json` configured
- [ ] Service worker for offline support
- [ ] Icons in required sizes
- [ ] HTTPS enforced

### 7. Report
Document findings in `.hc/reports/mobile-readiness-YYYY-MM-DD.md`.
