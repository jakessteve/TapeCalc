---
description: Release Checklist - changelog, version bump, security scan, build, smoke test, deploy, monitor
---

# Workflow: /release-checklist

**Trigger:** Production deployment or version release.

## Steps

### 1. Changelog
// turbo
@pm generates CHANGELOG from git history since last release:
```bash
git log --oneline --no-merges v$(cat VERSION)..HEAD
```

### 2. Version Bump
Update version in `package.json` and tag:
```bash
npm version [patch|minor|major]
```

### 3. Security Scan
@devops runs `security-audit` skill:
```bash
npm audit --audit-level=high
```
Must pass with zero high/critical vulnerabilities.

### 4. Full Test Suite
// turbo
```bash
npm test
npx tsc --noEmit
```
All tests must pass, zero type errors.

### 5. Production Build
```bash
npm run build
```
Verify build completes without errors or warnings.

### 6. Smoke Test
Use `browser-visual-testing` to verify:
- Home page loads correctly
- Key features work (calendar, chart generation)
- Dark/light mode toggle works
- No console errors

### 7. Deploy
Follow deployment procedure for the target platform.

### 8. Post-Deploy Monitoring
Monitor for 30 minutes:
- Error rate stays flat or decreases
- Response times normal
- No user reports of issues
