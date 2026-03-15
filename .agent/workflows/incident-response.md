---
description: Incident Response - production issue triage, mitigation, and postmortem pipeline
---

# Workflow: /incident-response

**Trigger:** Production issue detected via monitoring, user reports, or error spikes.

## Steps

### 1. Detect & Classify
// turbo
@devops classifies severity (SEV-1 to SEV-4) using the `incident-responder` skill.

### 2. Communicate
Announce incident with severity, start timeline log.

### 3. Investigate
@devops checks recent deploys, external dependencies, logs, and metrics.
- Use `systematic-debugging` skill for root cause analysis.
- Use `observability-engineer` skill to query logs/metrics.

### 4. Mitigate
Priority: restore service first, fix root cause later.
- Rollback, feature flag, scale up, or hotfix as appropriate.

### 5. Verify
Confirm service restored with monitoring (not just "it looks fine").
Use `browser-visual-testing` to verify if UI was affected.

### 6. Postmortem
Within 48 hours, @devops writes a blameless postmortem using `postmortem-writing` skill.
Store in `.hc/postmortems/`.

### 7. Follow-Up
@pm creates action items from postmortem findings and schedules them.
