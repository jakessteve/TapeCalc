---
description: Structured dependency upgrade pipeline — staged rollout with testing at each step
---

# WORKFLOW: /dependency-upgrade

Triggered when @dev identifies outdated dependencies or security vulnerabilities.

Execute sequentially:

1. **[INVENTORY]:** @dev runs `npm outdated` and categorizes updates:
   - **Patch** (x.x.Y): Low risk — can batch.
   - **Minor** (x.Y.0): Medium risk — check changelogs.
   - **Major** (Y.0.0): High risk — individual staged upgrade.
   - Save inventory to `.hc/maintenance/dependency-audit.md`.

2. **[RISK ASSESSMENT]:** @sa reviews major upgrades for architectural impact:
   - Read package CHANGELOG and migration guide.
   - Count affected files (`grep -r "from 'pkg'"` count).
   - Assess test coverage on affected code.
   - Decision: proceed / defer / find alternative.

3. **[SECURITY FIRST]:** @devops checks for security advisories:
   - Run `npm audit`.
   - Security patches are URGENT — upgrade immediately regardless of phase.
   - Non-security majors can wait for a planned upgrade window.

4. **[STAGED UPGRADE]:** @dev upgrades one package at a time (for majors):
   - Create branch: `upgrade/[package]-v[X]`
   - Install new version: `npm install [package]@latest`
   - Fix TypeScript errors: `npx tsc --noEmit`
   - Fix breaking API changes per migration guide.
   - Use `dependency-upgrade` skill for the full process.

5. **[VERIFY]:** @qc runs full test suite after each upgrade:
   - `npm test` — all passing.
   - `npm run dev` — dev server runs clean.
   - Browser smoke test — key flows still work.
   - If failures → @dev fixes before proceeding to next package.

6. **[BATCH MINORS & PATCHES]:** After all majors are done:
   - Batch-upgrade remaining minor and patch updates.
   - Run full test suite once.
   - Verify dev server.

7. **[DOCUMENT]:** @ba updates:
   - `CHANGELOG.md` with all dependency changes.
   - `docs/tech/ARCHITECTURE.md` if any upgrade affected system design.
   - Commit all changes with `chore(deps): upgrade [package] from vX to vY`.

Report: "Dependency upgrade complete. [X] packages updated. All tests passing."
