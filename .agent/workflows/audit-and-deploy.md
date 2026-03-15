---
description: Full audit-and-deploy pipeline — security scan ? tests ? build ? deploy checklist
---

# Workflow: /audit-and-deploy

Complete pre-deployment pipeline: security audit, test verification, production build, and deploy script generation.

---

## Prerequisites
- @qc's Verification Report approved by @pm
- All tests passing (`npm test`)
- Security audit completed (`security-audit` skill)

## Steps

### Step 1 — Security Scan
Run a full security audit on the codebase:

1. **Dependency audit:**
   ```bash
   npm audit --audit-level=high
   ```
   - If critical/high vulnerabilities found ? BLOCK. Fix or document accepted risk.

2. **Secret detection:**
   - Search codebase for hardcoded secrets (Rule `security-standards.md`).
   - Verify `.gitignore` includes all sensitive file patterns.
   - Check `.env.example` exists and has all required variables documented.

3. **OWASP quick check:**
   - Input validation on all user inputs
   - No `dangerouslySetInnerHTML` without sanitization
   - Auth tokens not stored in localStorage (use httpOnly cookies or memory)
   - Error messages don't expose internal details

4. Save findings to `.hc/security/pre-deploy-audit-[date].md`.

### Step 2 — Run Full Test Suite
Execute the complete test suite:

```bash
npm test -- --coverage
npx tsc --noEmit
```

**Gate criteria:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Type check passing (zero errors)
- [ ] Coverage = 80% on changed modules
- If ANY test fails ? BLOCK. Do not proceed.

### Step 3 — Production Build
Build the production bundle:

```bash
npm run build
```

**Verify:**
- [ ] Build completes without errors
- [ ] Bundle size is reasonable (flag if > 500KB gzipped for SPA)
- [ ] No console.log or debug statements in production code
- [ ] Environment variables are properly configured for production

### Step 4 — Generate Deploy Checklist
Create a deployment checklist artifact:

```markdown
# Deploy Checklist — [Feature/Phase]
**Date:** YYYY-MM-DD | **Engineer:** @devops

## Pre-Deploy Verification
- [ ] Security audit: PASS (0 critical, 0 high)
- [ ] All tests: PASS (X/X)
- [ ] Type check: PASS
- [ ] Coverage: XX%
- [ ] Build: PASS
- [ ] `.env` configured on server
- [ ] Backup of current production taken

## Deploy Steps
1. [ ] Pull latest code on server
2. [ ] Install dependencies: `npm ci --production`
3. [ ] Build: `npm run build`
4. [ ] Restart service
5. [ ] Verify health check endpoint
6. [ ] Monitor error rates for 15 minutes

## Rollback Plan
If issues detected after deploy:
1. [ ] Revert to previous build
2. [ ] Restart service
3. [ ] Verify rollback successful
4. [ ] Document incident in `.hc/security/incidents/`

## Post-Deploy
- [ ] Smoke test critical user flows
- [ ] Monitor error dashboard for 1 hour
- [ ] Update SOT documents (trigger @ba)
- [ ] Notify @pm: deploy complete
```

### Step 5 — Present for Approval
Present the deploy checklist to @pm via Artifact.
Deployment proceeds ONLY after @pm approval.

---

## Output Files
| File | Location |
|------|----------|
| Security audit | `.hc/security/pre-deploy-audit-[date].md` |
| Deploy checklist | `.hc/deploy/checklist-[date].md` |
