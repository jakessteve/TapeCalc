---
description: Incident Responder - runbook-driven incident response, severity classification, and escalation
---

# SKILL: Incident Response

**Trigger:** When @devops responds to production issues, outages, or degraded service.

---

## When to Use
- Production service is down or degraded.
- Users report errors or data corruption.
- Monitoring alerts fire.
- Security incident detected.

---

## Incident Response Protocol

### Phase 1: Detect & Classify (< 5 min)
Assess severity immediately:

| Severity | Impact | Example | Response Time |
|---|---|---|---|
| **SEV-1** | Service down, data loss, security breach | App unreachable, database corrupted | Immediate (all hands) |
| **SEV-2** | Major feature broken, significant degradation | Chart generation fails, payments broken | < 30 min |
| **SEV-3** | Minor feature issue, workaround available | Dark mode glitch, slow loading | < 4 hours |
| **SEV-4** | Cosmetic, no user impact | Log spam, minor UI misalignment | Next business day |

### Phase 2: Communicate (< 10 min)
1. Announce the incident with severity level.
2. Designate an **Incident Commander** (IC): the person making decisions.
3. Start a timeline log:
```markdown
## Incident Timeline
- [HH:MM] Issue detected: [description]
- [HH:MM] IC assigned: [name]
- [HH:MM] Severity classified: SEV-X
- [HH:MM] Investigation started: [approach]
```

### Phase 3: Investigate (parallel tracks)
1. **Check recent changes:** Did a deploy just happen? Roll back if yes.
2. **Check external dependencies:** Are APIs, databases, CDNs responsive?
3. **Check logs:** Search for errors around the incident start time.
4. **Check metrics:** Any resource saturation? Memory, CPU, connections?
5. **Check user reports:** What are users actually experiencing?

### Phase 4: Mitigate
Priority: **Restore service first, fix root cause later.**

| Strategy | When | How |
|---|---|---|
| Rollback | Recent deploy caused it | Revert to last known good version |
| Feature flag | New feature is broken | Disable the feature flag |
| Scale up | Resource exhaustion | Add capacity |
| Redirect | Single component failure | Route traffic away from broken component |
| Hotfix | Small, obvious fix | Fix and deploy immediately |

### Phase 5: Resolve & Document
1. Confirm service is restored.
2. Verify with monitoring (not just "it looks fine").
3. Document the incident with timeline.
4. Schedule postmortem (use `postmortem-writing` skill).

---

## Incident Report Template
```markdown
# Incident Report: [Title]
**Date:** YYYY-MM-DD
**Severity:** SEV-X
**Duration:** Xh Ym
**IC:** [Name]

## Summary
[1-2 sentence description of what happened]

## Impact
- Users affected: [count/percentage]
- Features impacted: [list]
- Data loss: [yes/no, details]

## Timeline
| Time | Event |
|---|---|
| HH:MM | Issue detected |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Service restored |

## Root Cause
[Technical description of what went wrong]

## Mitigation
[What was done to fix it]

## Follow-Up Actions
- [ ] [Action to prevent recurrence]
- [ ] [Monitoring improvement]
- [ ] [Documentation update]
```
