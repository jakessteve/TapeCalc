---
description: Observability Engineer - structured logging, metrics, and distributed tracing patterns
---

# SKILL: Observability Engineering

**Trigger:** When @devops sets up monitoring, logging infrastructure, or debugging production issues.

---

## When to Use
- Setting up logging for a new service or module.
- Designing metrics collection for key business and system events.
- Debugging production issues with insufficient visibility.
- Establishing monitoring standards for the project.

---

## The Three Pillars of Observability

### 1. Structured Logging
**Never use unstructured `console.log` in production code.**

#### Log Format (JSON)
```typescript
const log = {
 timestamp: new Date().toISOString(),
 level: 'info', // debug | info | warn | error | fatal
 message: 'User action',
 context: {
 userId: 'u123',
 action: 'generate_chart',
 component: 'TuViEngine',
 duration_ms: 42
 }
};
```

#### Log Levels
| Level | When | Example |
|---|---|---|
| `debug` | Developer needs details | "Calculating solar term for JDN 2460000" |
| `info` | Normal business event | "Chart generated for birth date 1990-01-15" |
| `warn` | Unexpected but handled | "API rate limit approaching: 80% used" |
| `error` | Operation failed | "Failed to fetch geodata: timeout after 5000ms" |
| `fatal` | System cannot continue | "Database connection pool exhausted" |

#### What to Log
- User actions (anonymized)
- API calls (method, URL, status, duration)
- Error details with stack traces
- Performance metrics (calculation times)
- Passwords, tokens, or PII
- Full request/response bodies (too verbose)

### 2. Metrics
Key categories to measure:

#### System Metrics (RED Method)
| Metric | What | Example |
|---|---|---|
| **Rate** | Requests per second | API throughput |
| **Errors** | Error rate/percentage | 500 errors / total requests |
| **Duration** | Latency (p50, p95, p99) | API response time percentiles |

#### Business Metrics
| Metric | What | Example |
|---|---|---|
| Chart generations | Feature usage | Charts generated per day |
| Feature popularity | User preferences | Most used calculation engines |
| User engagement | Session quality | Pages per session, time on page |

#### Counter vs. Gauge vs. Histogram
| Type | Use For | Example |
|---|---|---|
| Counter | Cumulative events | Total requests, total errors |
| Gauge | Current value | Active connections, memory usage |
| Histogram | Distribution | Response time buckets |

### 3. Distributed Tracing
For multi-service architectures:
- Assign a **trace ID** to every request at the entry point.
- Pass trace ID through all downstream calls.
- Log the trace ID with every log entry.
- Use trace ID to correlate logs across services.

---

## Alerting Strategy
| Severity | Condition | Response Time | Example |
|---|---|---|---|
| P1 Critical | Service down, data loss | 5 min | API 500 rate > 50% |
| P2 High | Degraded performance | 30 min | p99 latency > 5s |
| P3 Medium | Anomaly detected | 4 hours | Error rate increased 3x |
| P4 Low | Trend concern | Next business day | Disk usage > 70% |

---

## Dashboards
Every service should have a standard dashboard:
1. **Health:** Request rate, error rate, latency percentiles
2. **Resources:** CPU, memory, disk, connections
3. **Business:** Key feature usage metrics
4. **Alerts:** Active and recent alerts

## Rules
- Every new module MUST include structured logging from day one.
- Log entries MUST include context (who, what, where, duration).
- Never log sensitive data (enforce via code review).
