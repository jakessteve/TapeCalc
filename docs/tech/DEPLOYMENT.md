# Deployment Guide

## Environments

| Environment | URL | Purpose | Deploy Method |
|-------------|-----|---------|---------------|
| Development | `localhost:5173` | Local dev | `npm run dev` |
| Staging | TBD | Pre-release QA | Manual / CI |
| Production | TBD | Public release | CI/CD pipeline |

## Build Process

### Prerequisites
- Node.js 20+
- npm 10+

### Build Commands
```bash
npm install          # Install dependencies
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Build Output
- Output directory: `dist/`
- Static assets optimized via Vite
- Code splitting enabled

## Deployment Checklist

### Pre-Deploy
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles clean (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Bundle size within performance budget
- [ ] Security scan clean

### Deploy Steps
1. Merge to main branch
2. CI/CD triggers build
3. Run smoke tests against staging
4. Promote to production
5. Monitor error rates for 30 minutes

### Post-Deploy
- [ ] Verify critical user flows
- [ ] Check error monitoring dashboard
- [ ] Update CHANGELOG.md in `docs/log/`

## Rollback Procedure
1. Revert to previous deployment
2. Verify rollback succeeded
3. Create incident report in `docs/log/INCIDENT_LOG.md`
