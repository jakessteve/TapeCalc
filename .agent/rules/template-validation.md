---
description: Template Validation — pre-spawn checklist to verify delegation prompts are complete and accurate before wasting a worker session.
---

# RULE: TEMPLATE VALIDATION

**Scope:** Integrated into the COMPOSE step (Step 2) of the delegation protocol. Not a separate gate — runs inline during prompt composition.

---

## Purpose

Poorly composed prompts waste worker sessions. This rule enforces a validation pass on every filled template during the COMPOSE step, before spawning a CLI worker.

---

## Quick Validation (Standard Tier)

For Standard-tier delegations (4-6 files, pattern-following via inline `-Prompt` flag), only these checks are mandatory:
- **Check #1** (Placeholder Check) — no unfilled `[...]` or `<...>` tokens
- **Check #3** (File Path Validation) — all referenced files exist

Checks #2 (Required Sections), #4 (Scope Sanity), and #5 (Prompt Length) are recommended but not blocking for Standard-tier inline prompts.

---

## Full Validation Checks (Medium+ Tier)

Before any `spawn-agent.ps1` or `spawn-agent.sh` invocation, the orchestrator MUST verify:

### 1. Placeholder Check
Scan the completed prompt for unfilled placeholders:

| Pattern | Status |
|---------|--------|
| `[SHORT TASK NAME]` | Must be replaced |
| `[PLACEHOLDER]` | Must be replaced |
| `[TODO]` | Must be replaced |
| `[Describe specifically]` | Must be replaced |
| `path/to/file.ts` | Must be a real file path |
| `<name>` | Must be replaced |

**Validation rule:** If any `[...]` or `<...>` placeholder tokens remain in the prompt, DO NOT spawn. Replace them first.

### 2. Required Sections Check
Every prompt MUST contain these sections (regardless of template type):

| Section | Required | Purpose |
|---------|----------|---------|
| Goal / Objective | | What to achieve |
| Architecture Context | | Tech stack orientation |
| File scope (modify/read/off-limits) | | Boundary enforcement |
| Constraints | | What NOT to do |
| Verification commands | | How to validate |
| Report format | | Expected output structure |

**Validation rule:** If any required section is missing or empty, DO NOT spawn. Fill them first.

### 3. File Path Validation
For every file path mentioned in the prompt, verify it exists in the project:

```powershell
# Windows — quick check
Test-Path "src\path\to\file.ts"
```

```bash
# Unix
test -f "src/path/to/file.ts"
```

**Validation rule:** If any referenced file doesn't exist, either fix the path or mark it as a file to CREATE (if that's the intent).

### 4. Scope Sanity Check
- **Modify list** should have ≤10 files (if more, consider splitting the task)
- **Off-limits** MUST include at minimum: `package.json`, `src/index.css`, and any files not listed
- **No overlap** between modify and off-limits lists

### 5. Prompt Length Check
- **Minimum:** 200 characters (anything shorter is likely too vague)
- **Maximum:** 8000 characters (longer prompts may exceed worker context limits)
- **Sweet spot:** 1000–4000 characters

---

## Validation Summary

Before spawning, output a quick validation pass:

```
 Template Validation:
 No unfilled placeholders
 All required sections present
 File paths verified (X/X exist)
 Scope within limits (Y files to modify)
 Prompt length OK (Z chars)
 → Ready to spawn
```

If ANY check fails:
```
 Template Validation:
 Unfilled placeholder: [Describe specifically] on line 23
 Missing section: Verification commands
 File not found: src/services/tuvi/invalid-path.ts
 → BLOCKED — fix issues before spawning
```

---

## Exceptions

- **Quick inline prompts** (`-p` flag) are exempt from the full validation but MUST still have: goal, file scope, and constraints in the inline text.
- **Research tasks** (read-only) can skip file path validation for the "where to look" section since workers will discover files.
