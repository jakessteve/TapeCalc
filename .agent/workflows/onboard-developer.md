---
description: Onboard Developer - codebase tour, architecture walkthrough, first PR workflow
---

# Workflow: /onboard-developer

**Trigger:** New contributor joins the project.

## Steps

### 1. Environment Setup
// turbo
```bash
git clone [repo-url]
npm install
npm run dev
```
Verify dev server starts successfully.

### 2. Architecture Tour
Read and understand key documents:
- `docs/tech/ARCHITECTURE.md` — system structure and module boundaries
- `AGENTS.md` — agent roles and capabilities
- `.agent/rules/` — coding standards and conventions
- `docs/tech/API_CONTRACTS.md` — API shapes (if applicable)

### 3. Codebase Walkthrough
@sa provides a guided tour:
- `src/` structure and key modules
- Data flow from user input to calculation engines to UI
- Shared utilities and types
- Test organization

### 4. First PR Workflow
New contributor makes a small, guided change:
1. Create a branch following `git-hygiene` naming
2. Make a small change (fix a typo, add a test)
3. Run `verification-before-completion` checklist
4. Submit PR following `code-review-excellence` format
5. @dev reviews and provides feedback

### 5. Standards Review
Review key rules:
- `code-standards.md` — DRY, TypeScript strict, no `any`
- `git-hygiene.md` — conventional commits
- `error-handling-standards.md` — structured errors
- `kaizen.md` — continuous improvement mindset
