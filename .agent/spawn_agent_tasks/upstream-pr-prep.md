# Upstream Contribution: Windows Support for spawn-agent

> Preparation for contributing Windows/PowerShell support back to [khanhbkqt/spawn-agent](https://github.com/khanhbkqt/spawn-agent).

## What to Contribute

### 1. `scripts/spawn-agent.ps1` (NEW)
Full PowerShell port of `spawn-agent.sh` with:
- Same interface (`-Agent`, `-ApprovalMode`, `-Timeout`, `-File`, `-Prompt`, `-DryRun`)
- Async output capture via `System.Diagnostics.Process` (avoids deadlocks)
- Windows-compatible path handling
- Exit code mapping matching Unix conventions (124 = timeout)

### 2. SKILL.md Updates
Add Windows/PowerShell command examples alongside existing Unix examples in:
- Step 3: SPAWN section
- Step 4: REVIEW section

### 3. README.md Updates
- Add Windows installation instructions
- Add Windows examples in Quick Start
- Note PowerShell requirements (5.1+ or PowerShell Core)

## PR Checklist
- [ ] Copy `spawn-agent.ps1` to fork
- [ ] Update SKILL.md with cross-platform examples
- [ ] Update README.md with Windows section
- [ ] Test on Windows 10/11
- [ ] Test on PowerShell 5.1 and PowerShell 7
- [ ] Submit PR with description referencing CONTRIBUTING.md conventions
