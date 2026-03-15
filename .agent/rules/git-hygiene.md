---
description: Git Hygiene - conventional commits, atomic changes, and branch naming
---

# RULE: GIT HYGIENE

**Mode:** Always On
**Scope:** @dev, @devops

---

## Commit Message Format (Conventional Commits)
```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types
| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `docs` | Documentation changes |
| `style` | Formatting, whitespace (no logic change) |
| `chore` | Build, tooling, dependencies |
| `ci` | CI/CD configuration |

### Examples
```
feat(tuvi): add Tứ Hóa star placement in palace grid
fix(calendar): correct leap month calculation for 2025
refactor(engines): extract common star mapping logic
perf(chart): memoize palace interpretation lookup
test(bazi): add BVA tests for solar term boundaries
```

## Atomic Commits
- One logical change per commit.
- Don't mix features with fixes in the same commit.
- Don't mix formatting with logic changes.

## Branch Naming
```
<type>/<short-description>
```
Examples: `feat/tuvi-temporal-overlay`, `fix/calendar-leap-month`, `refactor/engine-types`

## Rules
- Never commit directly to `main`.
- Never use "WIP", "update", or "fix" as entire commit messages.
- Every commit should leave the codebase in a working state.
- Squash fixup commits before merging to main.
