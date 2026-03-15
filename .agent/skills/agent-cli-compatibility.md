---
description: Agent CLI Compatibility — approval mode mappings and invocation patterns for all supported CLI agents (Gemini, Codex, Claude Code, Cursor).
---

# SKILL: AGENT CLI COMPATIBILITY

**Trigger:** When choosing which CLI agent to spawn or when setting up delegation in a new environment.

---

## Supported Agents

### Fully Tested

| Agent | CLI Tool | Install Command | Primary Use |
|-------|----------|----------------|-------------|
| **Gemini** | `gemini` | `npm i -g @google/gemini-cli` | Fast research, context gathering, quick implementations |
| **Codex** | `codex exec` | `npm i -g @openai/codex` | Complex implementation, sandboxed execution, code review |

### Experimental (Community-Supported)

| Agent | CLI Tool | Install | Notes |
|-------|----------|---------|-------|
| **Claude Code** | `claude` | `npm i -g @anthropic/claude-code` | Strong reasoning, native tool use, multi-file editing |
| **Aider** | `aider` | `pip install aider-chat` | Git-aware, automatic commits, repo-map understanding |

---

## Approval Mode Mappings

| Mode | Intent | Gemini | Codex | Claude Code | Aider |
|------|--------|--------|-------|-------------|-------|
| **Yolo** | Auto-approve everything | `yolo` | `full-auto` | `--dangerously-skip-permissions` | `--yes` |
| **Auto-edit** | Auto-approve file edits | `auto_edit` | `auto-edit` | `--auto-edit` | `--auto-commits` |
| **Safe** | Prompt for every action | `default` | `suggest` | (default) | (default) |

---

## Invocation Patterns

### Gemini CLI
```bash
gemini --approval-mode auto_edit -p "task description"
```
```powershell
cmd.exe /c gemini --approval-mode auto_edit -p "task description"
```

### Codex CLI
```bash
codex exec -c "approval_mode=\"auto-edit\"" "task description"
```

### Claude Code (Experimental)
```bash
claude --print --dangerously-skip-permissions -p "task description" 2>&1 | tee output.log
```
```powershell
cmd.exe /c claude --print --dangerously-skip-permissions -p "task description" 2>&1 | Tee-Object output.log
```

### Aider (Experimental)
```bash
aider --yes --message "task description" --file path/to/file.ts 2>&1 | tee output.log
```

---

## Agent Strengths Matrix

| Capability | Gemini | Codex | Claude Code | Aider |
|-----------|--------|-------|-------------|-------|
| Speed | | | | |
| Codebase understanding | | | | |
| Complex reasoning | | | | |
| Multi-file editing | | | | |
| Sandboxing | | | | |
| Git awareness | | | | |
| Research / read-only | | | | |

---

## Task → Agent Recommendation

| Task Type | Best Agent | Reasoning |
|-----------|-----------|-----------|
| Quick research / grep | **Gemini** | Fastest, best project context |
| Complex implementation | **Codex** or **Claude Code** | Strong reasoning + multi-file |
| Refactoring | **Aider** or **Claude Code** | Git-aware, safe multi-file |
| Bug fix | **Gemini** or **Codex** | Quick turnaround |
| Code review | **Codex** | Sandboxed, review-oriented |

---

## Adding a New Agent

To add support for a new CLI agent:

1. **Add to spawn-agent scripts:**
 - Map approval modes in `spawn-agent.ps1` (`Get-*Mode` functions)
 - Map approval modes in `spawn-agent.sh` (`build_*_cmd` functions)
2. **Update this compatibility table**
3. **Test with all 3 template types** (research, implementation, bugfix)
4. **Add to `model-routing.md`** if the agent uses a different model family
