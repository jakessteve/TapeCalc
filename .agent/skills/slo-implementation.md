---
description: SLO Implementation - SLI/SLO/SLA definition, error budget management, and reliability target tracking
---

# SKILL: SLO Implementation

**Trigger:** When @devops defines reliability targets and error budgets for services or when reviewing service health against established objectives.

---

## When to Use
- Establishing reliability targets for a new service.
- Defining SLAs for user-facing contracts.
- Monitoring error budget consumption.
- Making reliability vs. feature tradeoff decisions.
- During `/incident-response` — referencing SLO breaches.

---

## Terminology

| Term | Definition | Example | Owner |
|---|---|---|---|
| **SLI** (Service Level Indicator) | A measurable metric | Request latency p99, error rate | @devops |
| **SLO** (Service Level Objective) | Target for an SLI | p99 latency < 500ms, 99.9% success | @devops + @pm |
| **SLA** (Service Level Agreement) | Contract with consequences | 99.9% uptime or credit issued | @pm + business |
| **Error Budget** | Allowed downtime/errors in a window | 0.1% = ~43 min/month downtime | @devops |

**Key relationship:** SLO should be stricter than SLA (you want to catch issues before you breach the contract).

---

## The 3-Step SLO Process

### Step 1: Choose SLIs
Select indicators that reflect **user experience**, not internal server metrics:

| Category | SLI | Measurement | Good Default Target |
|---|---|---|---|
| **Availability** | Success rate | Successful requests ÷ Total requests | 99.9% |
| **Latency** | Response time (percentile) | p50, p95, p99 of response times | p99 < 500ms |
| **Quality** | Error rate | 5xx responses ÷ Total responses | < 0.1% |
| **Freshness** | Data age | Time since last successful data update | < 5 min |
| **Correctness** | Calculation accuracy | Correct outputs ÷ Total outputs | 100% (for engines) |
| **Throughput** | Request capacity | Requests/second at acceptable latency | Varies |

### Step 2: Set SLO Targets
```markdown
## SLO Definition: [Service Name]
**Owner:** @devops | **Approved by:** @pm
**Review cadence:** Monthly

| SLI | SLO Target | Measurement Window | Error Budget |
|---|---|---|---|
| Availability | 99.9% | Rolling 30 days | 43.2 min/month |
| Latency (p99) | < 500ms | Rolling 7 days | 1% of requests > 500ms |
| Error rate | < 0.1% | Rolling 24 hours | N errors |
| Data freshness | < 5 min stale | Continuous | — |

### Error Budget Calculation
- 99.9% availability over 30 days = 43.2 minutes of downtime allowed
- 99.95% = 21.6 minutes
- 99.99% = 4.3 minutes
```

### Step 3: Error Budget Management
Track consumption and trigger actions:

| Budget Consumed | Status | Action |
|---|---|---|
| 0-50% | Healthy | Normal feature development |
| 50-75% | Caution | Increase monitoring, defer risky changes |
| 75-90% | Warning | Freeze non-critical deployments, focus on reliability |
| 90-100% | Critical | **FREEZE all feature work.** Reliability-only changes until budget replenishes |
| >100% | Breached | Incident response mode, SLA review, postmortem required |

---

## SLO Review Template
```markdown
## Monthly SLO Review — [Service Name] — [Month]
**Reviewer:** @devops

### Performance
| SLI | SLO Target | Actual | Budget Used | Status |
|---|---|---|---|---|
| Availability | 99.9% | 99.95% | 50% | |
| Latency (p99) | < 500ms | 420ms | — | |

### Incidents
[List any incidents that consumed error budget]

### Recommendations
[Adjust SLO targets? Add new SLIs? Invest in reliability?]
```

## Rules
- **SLOs should be slightly tighter than SLAs** — provide a buffer before contract breach.
- **Measure SLIs from the user's perspective**, not the server's (e.g., end-to-end latency, not backend processing time).
- **When error budget is exhausted, freeze features** — reliability must come first.
- **Review SLOs monthly** — they should evolve with the product.
- **Never set 100% targets** — perfection is unachievable and creates perverse incentives.
