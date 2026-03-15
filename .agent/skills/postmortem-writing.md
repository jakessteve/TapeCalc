---
description: Postmortem Writing - blameless postmortem template with root cause analysis, 5-whys technique, and action tracking
---

# SKILL: Postmortem Writing

**Trigger:** When @devops documents an incident after resolution for organizational learning. Used after `/incident-response` workflow completes.

---

## When to Use
- After any SEV-1 or SEV-2 incident (mandatory).
- After any incident that consumed >25% of error budget (SLO breach — see `slo-implementation` skill).
- After a near-miss that could have been worse.
- Optionally after SEV-3 incidents if they reveal systemic issues.

---

## The 4-Step Postmortem Process

### Step 1: Gather Facts (Within 24 Hours)
While memory is fresh:
1. Collect timeline events from monitoring, logs, and chat history.
2. Identify all people involved in the response.
3. Gather metrics: duration, users affected, revenue impact.
4. Note what tools/runbooks were used and if they were helpful.

### Step 2: Conduct Root Cause Analysis (5 Whys)
Drill down from the symptom to the root cause:

```markdown
## 5 Whys Analysis
1. **Why** did the service go down? → Database connection pool exhausted.
2. **Why** was the pool exhausted? → A query was holding connections open.
3. **Why** was the query holding connections? → Missing timeout on a slow query.
4. **Why** was there no timeout? → Default config didn't include query timeouts.
5. **Why** wasn't this caught? → No monitoring on connection pool usage.

**Root cause:** Missing query timeout configuration + no connection pool monitoring.
```

### Step 3: Write the Postmortem

```markdown
# Postmortem: [Incident Title]
**Date:** YYYY-MM-DD
**Author:** @devops
**Severity:** SEV-1 / SEV-2 / SEV-3
**Duration:** Xh Ym (from detection to resolution)
**Time to Detect (TTD):** Xm
**Time to Mitigate (TTM):** Xm

## Summary
[1 paragraph: what happened, who was affected, how it was resolved]

## Impact
| Dimension | Detail |
|---|---|
| Users affected | [count or percentage] |
| Duration of impact | [time] |
| Revenue impact | [if applicable] |
| Data loss/corruption | [if any] |
| SLO budget consumed | [X% of monthly budget] |

## Timeline (UTC)
| Time | Event | Source |
|---|---|---|
| HH:MM | [First sign of issue] | [Monitoring/User report] |
| HH:MM | [Alert fired] | [Alert system] |
| HH:MM | [Investigation started] | [On-call responder] |
| HH:MM | [Root cause identified] | [Investigation] |
| HH:MM | [Mitigation applied] | [Action taken] |
| HH:MM | [Service restored] | [Monitoring confirms] |
| HH:MM | [All-clear confirmed] | [Full verification] |

## Root Cause
[Technical explanation — be specific. Reference the 5-Whys analysis.]

## Root Cause Category
| Category | Applies? |
|---|---|
| Code defect | [ ] |
| Configuration error | [ ] |
| Dependency failure | [ ] |
| Infrastructure issue | [ ] |
| Capacity exceeded | [ ] |
| Process/human error | [ ] |
| Security incident | [ ] |
| Monitoring gap | [ ] |

## What Went Well
- [Things that worked during the response]

## What Went Wrong
- [Things that slowed response or made impact worse]

## Action Items
| # | Action | Type | Owner | Priority | Due | Status |
|---|---|---|---|---|---|---|
| 1 | [Prevent recurrence] | Preventive | @who | P1 | YYYY-MM-DD | Open |
| 2 | [Improve detection] | Detective | @who | P1 | YYYY-MM-DD | Open |
| 3 | [Process improvement] | Process | @who | P2 | YYYY-MM-DD | Open |

## Lessons Learned
- [Key takeaway for the team]
```

### Step 4: Review and Track
1. Share postmortem with the team within 48 hours.
2. Review action items in the next sprint planning.
3. Update action item status monthly until all are closed.
4. Link to the incident in `.hc/incidents/` for future reference.

---

## Blamelessness Guidelines
| Do | Don't |
|---|---|
| "The monitoring gap allowed..." | "John forgot to check..." |
| "The deployment process lacked..." | "The team was careless..." |
| "The configuration was missing..." | "Someone changed the config..." |
| Focus on **systems**, not individuals | Assign personal blame |

## Rules
- **Blameless.** Focus on systems and processes, not individuals.
- **Within 48 hours.** Write while memory is fresh.
- **Action items are mandatory.** A postmortem without actions is just a story.
- **Track action items** until closed — review monthly.
- **Every action needs a type:** Preventive (stop recurrence), Detective (catch faster), Process (improve response).
- Store in `.hc/postmortems/`.
