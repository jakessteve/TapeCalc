---
description: Automated cross-reference lint for the agent framework — validates all .md references, counts, and wiring
---

# Workflow: /framework-lint

> Scans the `.agent/` directory for stale references, mismatched counts, orphaned files, and broken wiring. Run periodically or after any framework changes.

## Prerequisites
- `.agent/` directory with roles, rules, skills, guidelines, workflows
- `AGENTS.md` index file
- PowerShell or bash terminal available

## Step 1 — Validate File Counts

// turbo
Compare AGENTS.md claimed counts against actual disk counts:

```powershell
Write-Host "Roles: $((Get-ChildItem '.agent\roles' -Name).Count)"
Write-Host "Rules: $((Get-ChildItem '.agent\rules' -Name).Count)"
Write-Host "Guidelines: $((Get-ChildItem '.agent\guidelines' -Name).Count)"
$sc = (Get-ChildItem ".agent\skills\*.md" -Name).Count + (Get-ChildItem ".agent\skills" -Directory -Name).Count
Write-Host "Skills: $sc"
Write-Host "Workflows: $((Get-ChildItem '.agent\workflows' -Name).Count)"
```

Compare output against counts in `AGENTS.md`. Any mismatch = **FAIL**.

## Step 2 — Scan for Stale Rule References

// turbo
Find all `Rule \`xxx.md\`` patterns in role files and check if the referenced file exists:

```powershell
$ruleDir = ".agent\rules"
$guideDir = ".agent\guidelines"
Get-ChildItem ".agent" -Recurse -Include "*.md" | ForEach-Object {
 $file = $_
 $content = Get-Content $_.FullName -Raw
 [regex]::Matches($content, 'Rule `([^`]+\.md)`') | ForEach-Object {
 $ref = $_.Groups[1].Value
 if (-not (Test-Path "$ruleDir\$ref") -and -not (Test-Path "$guideDir\$ref")) {
 Write-Host "STALE: $($file.Name) → $ref"
 }
 }
}
```

Any output = **FAIL**. Fix by mapping stale name to current file.

## Step 3 — Scan for Stale Skill References

// turbo
Check that skills referenced in role Required Reading tables actually exist on disk:

```powershell
$skills = (Get-ChildItem ".agent\skills\*.md" -Name | % { $_ -replace '\.md$', '' }) + (Get-ChildItem ".agent\skills" -Directory -Name)
Get-ChildItem ".agent\roles\*.md" | ForEach-Object {
 $role = $_.Name
 Select-String '`([a-z][\w-]+-[\w-]+)`' $_.FullName | ForEach-Object {
 $ref = $_.Matches[0].Groups[1].Value
 if ($ref -notmatch '\.md$' -and $skills -notcontains $ref -and $ref.Length -gt 5) {
 Write-Host "SUSPECT: $role → $ref (not in skills/)"
 }
 }
}
```

Review output — some backtick content is not skill names. Focus on entries that look like skill references.

## Step 4 — Check AGENTS.md Index Completeness

// turbo
Verify every file on disk appears in AGENTS.md:

```powershell
$agents = Get-Content "AGENTS.md" -Raw
# Check workflows
Get-ChildItem ".agent\workflows\*.md" -Name | % { $_ -replace '\.md$', '' } | % {
 if ($agents -notmatch [regex]::Escape("/$_")) { Write-Host "MISSING workflow in AGENTS.md: /$_" }
}
# Check roles
Get-ChildItem ".agent\roles\*.md" -Name | % { $_ -replace '\.md$', '' } | % {
 if ($agents -notmatch [regex]::Escape("``$_``")) { Write-Host "MISSING role in AGENTS.md: $_" }
}
```

Any output = **FAIL**.

## Step 5 — Check Orphaned Guidelines

// turbo
Verify each guideline is referenced by at least one role or workflow:

```powershell
Get-ChildItem ".agent\guidelines\*.md" -Name | % { $_ -replace '\.md$', '' } | % {
 $refs = (Get-ChildItem ".agent\roles\*.md", ".agent\workflows\*.md" | Select-String $_ -SimpleMatch).Count
 Write-Host "$_ : $refs references $(if ($refs -eq 0) { ' ORPHANED' } else { '' })"
}
```

Orphaned guidelines are **acceptable** (they're context-triggered) but should be noted.

## Step 6 — Check Section Numbering

// turbo
Detect duplicate section numbers within role files:

```powershell
Get-ChildItem ".agent\roles\*.md" | ForEach-Object {
 $sections = Select-String "^## (\d+)\." $_.FullName | % { $_.Matches[0].Groups[1].Value }
 $dupes = $sections | Group-Object | Where-Object { $_.Count -gt 1 }
 if ($dupes) { Write-Host "DUPLICATE §: $($_.Name) → §$($dupes.Name -join ', §')" }
}
```

Any output = **FAIL**.

## Step 7 — Report

Generate a summary:

```markdown
# Framework Lint Report — YYYY-MM-DD

| Check | Result |
|---|---|
| File counts match AGENTS.md | / |
| Stale rule references | (0 found) / (N found) |
| Stale skill references | (0 found) / (N found) |
| AGENTS.md index complete | / |
| Orphaned guidelines | N found (acceptable) |
| Duplicate section numbers | (0 found) / (N found) |

**Overall:** PASS / FAIL
```

Save to `.hc/logs/framework-lint-YYYY-MM-DD.md`.

---

## Auto-Trigger Points

This workflow should be run:
- After any `.agent/` file is created, deleted, or renamed
- After `/retrospective` or sprint boundary
- On demand via `/framework-lint`
