# Lịch Việt v2 — Agent Skills Index

> Auto-generated index for AI agent skill discovery. Read `instructions.md` first.

## Roles (`.agent/roles/`)

| Role | Trigger Context | Key Skills |
|---|---|---|
| `@pm` | Planning, prioritization, delegation, orchestration, facilitation, idea validation | `task-router`, `roadmap-architect`, `model-selector`, `context-juggler`, `conflict-resolver`, `facilitation`, `red-team-ideas`, `idea-validation`, `implementation-debate`, `requirement-enrichment`, `critical-thinking-models`, `opportunity-cost-analysis`, `amateur-proof-plans`, `orchestrator-delegation-guide`, `worker-output-parsing`, `multi-worker-coordination` |
| `@pm-extended` | Advanced orchestration, facilitation, dialectical development, sprint management | Extends `@pm` — product management details, facilitation mode, conflict resolution, model handoffs, SOT/SPARC gates, sprint reviews |
| `@biz` | Business strategy, marketing, GTM, market research, monetization, partnerships, brand, growth | `competitive-landscape`, `market-sizing`, `financial-modeling`, `content-marketing`, `seo-copywriting`, `content-strategy`, `launch-strategy`, `growth-metrics`, `investor-pitch-writer`, `telemetry-analysis`, `user-feedback-loop`, `analytics-tracking`, `business-writing`, `monetization-strategy`, `partnership-development`, `brand-strategy`, `customer-acquisition` |
| `@ba` | Research, requirements, PRD, technical writing, deep analysis | `prd-architect`, `requirement-interviewer`, `research-analysis`, `technical-writing` |
| `@sa` | Architecture, API design, data models, DDD | `senior-architect`, `c4-architecture`, `architecture-patterns`, `domain-driven-design`, `architecture-decision-records`, `microservices-patterns`, `api-design-principles` |
| `@dev` | Implementation, coding, debugging, optimization | `systematic-debugging`, `code-review-excellence`, `context7-integration`, `test-driven-development`, `refactoring-patterns`, `typescript-expert`, `react-patterns`, `performance-optimization` |
| `@qc` | Testing, verification, quality, test design | `playwright-testing`, `verification-before-completion`, `test-case-design`, `test-fixing`, `regression-strategy`, `performance-testing`, `mutation-testing` |
| `@devops` | Security, CI/CD, deployment, observability, incident response | `security-audit`, `cicd-pipeline`, `dependency-upgrade`, `observability-engineer`, `incident-responder`, `postmortem-writing`, `docker-containerization`, `infrastructure-as-code`, `slo-implementation` |
| `@designer` | UI/UX, styling, visual design, motion, tokens | `design-system-uiux`, `browser-visual-testing`, `mobile-ux-patterns`, `animation-choreography`, `design-token-pipeline` |
| `@user-tester` | User experience testing, UX feedback | `user-experience-testing`, `accessibility-empathy`, `browser-visual-testing` |
| `@whitehat-hacker` | Offensive security, penetration testing, API security, social engineering | `penetration-testing`, `attack-simulation`, `security-audit`, `api-security-testing`, `social-engineering-testing` |

## Rules (`.agent/rules/`) — 24 files

| Rule | Scope | Key Constraints |
|---|---|---|
| `anti-patterns` | All | No hallucination, 3-strike loop break, context budget (500-line cap), multi-level circuit breaker, cross-file semantic loop detection, swarm clash prevention, **cognitive bias detection** |
| `code-standards` | Code | DRY, no `any`, 80% coverage, tiered QC enforcement |
| `security-standards` | All | Zero hardcoded secrets, shift-left, FOSS-first |
| `agent-behavior` | Orchestration | Structured comms, team format, 3–4 parallel max, auto-fallback, sub-agent spawn limits, **CLI worker process governance** |
| `process-gates` | All | SOT-driven, SPARC phases, **tiered verification gate**, conventional commits |
| `engineering-mindset` | All | MVP-first, mobile-first, ruthless prioritization, **kaizen (continuous improvement)**, task-aware research time-boxing |
| `model-routing` | All | Unified model inventory, task→model matrix, SPARC phase mapping, handoff boundaries, cost optimization |
| `task-complexity-classifier` | All | Trivial/Small/Medium/Large/Epic classification, tool budgets, checkpoint rule |
| `confidence-routing` | All | Mandatory scores, **75+ auto-proceed**, progressive tracking, monotonic progress |
| `dialectical-development` | All | **Novelty-based** gate (not file-count), adversarial scrutiny before/after implementation |
| `no-code-boundary` | All | Single-LLM code boundary: plan as @pm, code as @dev |
| `a11y-standards` | UI | WCAG compliance |
| `agile-user-stories` | PM/BA | User story format |
| `autonomous-tooling` | All | Tool usage patterns, domain-specific search triggers |
| `scalable-folder-structure` | SA | File organization |
| `ui-design-system` | UI | Design token usage |
| `user-feedback-format` | @user-tester | Standardized feedback report structure |
| `git-hygiene` | @dev, @devops | Conventional commits, atomic changes, branch naming |
| `error-handling-standards` | @dev | Structured error types, boundaries, user-facing messages |
| `api-contract-first` | @sa, @dev | Contracts defined before implementation |
| `performance-budget` | @dev, @designer | Bundle size limits, Core Web Vitals thresholds |
| `documentation-standards` | All | JSDoc, README, architecture diagram requirements |
| `template-validation` | All | Pre-spawn prompt validation: placeholder check, required sections, file path verification |
| `timeout-escalation` | All | Graduated retry strategy for worker timeouts: retry → split → manual → escalate |

## Guidelines (`.agent/guidelines/`) — 4 files (retired from rules)

| Guideline | Scope | Note |
|---|---|---|
| `investor-metrics` | PM | KPI tracking — use when needed, not enforced per-task |
| `gtm-readiness` | PM/BA | GTM checklist — use for launches, not routine changes |
| `observability-standards` | @devops, @dev | Structured logging — apply on infrastructure tasks |
| `dependency-policy` | @devops, @dev | Update cadence — apply during dependency upgrades |

## Skills (`.agent/skills/`) — 91 files

### Orchestration
| Skill | Trigger | Key Output |
|---|---|---|
| `task-router` | Complex multi-domain prompt | Task decomposition table |
| `context-juggler` | Parallel agent coordination | Shared context window |
| `conflict-resolver` | Agent disagreements | Decision resolution |
| `facilitation` | Party-mode / brainstorm | Formatted agent perspectives + Red Team templates |
| `model-selector` | Mixed-mode tasks | Model recommendation |
| `context-optimization` | Context budget pressure | Compression strategy |
| `task-decomposition` | Large tasks | Sub-task breakdown |
| `requirement-enrichment` | Vague/ambiguous user input | Enriched actionable requirements |
| `critical-thinking-models` | Feature/architecture delegation gate | Seven-model executive decision checklist (First Principles, Second-Order, Inversion, Cynefin, Opportunity Cost, Circle of Competence, **Cognitive Bias Scan**) |
| `structured-analysis-frameworks` | Complex decisions needing deeper analysis | **MECE decomposition, Issue Trees, Pre-Mortem (deep), Weighted Decision Matrix** |
| `worker-delegate` | CLI worker delegation decision gate | Scope assessment, prompt composition, post-spawn review protocol |
| `amateur-proof-plans` | Medium+ task phasing, CLI worker prep, cross-model handoff | Phase files with data flow, code contracts, failure scenarios |
| `orchestrator-delegation-guide` | CLI worker delegation quick-reference | Consolidated decision tree, spawn commands, review checklist |
| `worker-output-parsing` | Post-spawn output log review | Structured extraction, failure detection, multi-worker aggregation |
| `worker-session-audit` | Post-spawn session logging | Audit trail, retrospective metrics, warning thresholds |
| `multi-worker-coordination` | Parallel CLI worker spawning | Scope isolation, conflict detection, merged review |
| `agent-cli-compatibility` | Agent selection, new agent setup | Approval mode mappings for Gemini, Codex, Claude Code, Aider |
| `skill-bundles` | Fast skill lookup by task type | 10 pre-grouped bundles (Bug Fix, Quick Feature, Feature Impl, Research, UI/UX, Architecture, Security, Business, Testing, DevOps) |

### Dialectical Development
| Skill | Trigger | Key Output |
|---|---|---|
| `red-team-ideas` | Post-brainstorm adversarial analysis | Pre-mortem, assumption map, Red Team verdict |
| `idea-validation` | Idea comparison / quick validation | DFV scorecard, comparison matrix |
| `implementation-debate` | Post-build approach review | Intent-vs-reality check, tech debt assessment, SHIP/RETHINK verdict |

### Architecture & Design
| Skill | Trigger | Key Output |
|---|---|---|
| `senior-architect/` | Major tech decisions | ADR document |
| `c4-architecture` | System diagramming | C4 diagrams |
| `architecture-patterns` | Pattern selection | Pattern recommendation |
| `design-system-uiux/` | UI changes | Design audit + verification |
| `domain-driven-design` | Complex domain modeling | Bounded contexts, ubiquitous language |
| `architecture-decision-records` | Significant tech decisions | ADR document with alternatives |
| `microservices-patterns` | Service decomposition | Saga, circuit breaker, API gateway |
| `event-sourcing-cqrs` | Audit trails, temporal queries | Event store, projections |
| `api-design-principles` | New API endpoints | RESTful spec, contract |

### Product & Requirements
| Skill | Trigger | Key Output |
|---|---|---|
| `prd-architect/` | New PRD needed | PRD document |
| `requirement-interviewer/` | Vague requirements | Gap analysis |
| `roadmap-architect` | Planning | Roadmap |
| `backlog-grooming` | Sprint planning | Groomed backlog |
| `competitive-landscape` | Competitor analysis | Feature matrix + positioning |
| `market-sizing` | Market opportunity | TAM/SAM/SOM calculations |
| `financial-modeling` | Business projections | Unit economics, burn rate |
| `opportunity-cost-analysis` | New work vs existing priorities | Trade-off calculation, priority impact assessment |

### Business & Commercialization
| Skill | Trigger | Key Output |
|---|---|---|
| `business-writing` | Proposals, partnership pitches, case studies | Professional business documents |
| `monetization-strategy` | Pricing, revenue streams, paywall design | Revenue model + pricing analysis |
| `partnership-development` | B2B outreach, integration evaluation | Partner pipeline + proposals |
| `brand-strategy` | Brand voice, positioning, messaging | Brand guidelines + messaging framework |
| `customer-acquisition` | Channel strategy, funnels, CAC | Acquisition plan + funnel design |

### Quality & Testing
| Skill | Trigger | Key Output |
|---|---|---|
| `code-review-excellence` | PR review | Review comments (ISTQB-aligned) |
| `verification-before-completion` | Task completion | Verification report (includes test running) |
| `playwright-testing` | E2E testing | Test suite |
| `browser-visual-testing` | Visual verification | Responsive screenshots, dark mode, a11y |
| `test-driven-development` | New feature implementation | Red-Green-Refactor cycle |
| `test-case-design` | Test suite creation | ISTQB techniques (EP, BVA, decision tables) |
| `test-fixing` | Flaky/failing tests | Root cause + stable fix |
| `regression-strategy` | Test selection for changes | Risk-based test plan |
| `performance-testing` | Load/stress validation | Benchmark results |
| `mutation-testing` | Test effectiveness assessment | Mutation score |

### Development
| Skill | Trigger | Key Output |
|---|---|---|
| `systematic-debugging` | Bug investigation | Multi-hypothesis fallback chain, confidence-ranked fixes |
| `research-analysis` | Research needed (deep or surface) | Research report with citations + serendipity log |
| `context7-integration` | Library docs needed | API reference |
| `sequential-thinking` | Complex reasoning | Thought chain |
| `dependency-upgrade` | Dep updates | Upgrade plan |
| `refactoring-patterns` | Code smell / structural improvement | Safe transformation moves |
| `typescript-expert` | Advanced TS patterns | Type-safe design |
| `react-patterns` | React optimization | Hooks, composition, state management |
| `performance-optimization` | Speed/bundle optimization | Profiling + improvements |

### DevOps & Infrastructure
| Skill | Trigger | Key Output |
|---|---|---|
| `security-audit` | Security review (OWASP 2021 A01-A10) | Comprehensive audit report |
| `cicd-pipeline` | CI/CD setup | Pipeline config |
| `observability-engineer` | Logging/metrics/tracing setup | Observability infrastructure |
| `incident-responder` | Production incident | Severity classification + mitigation |
| `postmortem-writing` | Post-incident | Blameless postmortem |
| `docker-containerization` | Container builds | Multi-stage Dockerfile, compose |
| `infrastructure-as-code` | Reproducible environments | Terraform/Pulumi modules |
| `slo-implementation` | Reliability targets | SLI/SLO/SLA definitions |

### Offensive Security
| Skill | Trigger | Key Output |
|---|---|---|
| `penetration-testing` | Pentest session, exploit testing | Pentest report + PoCs |
| `attack-simulation` | Adversarial scenario design | Red team report + attack chains |
| `api-security-testing` | API vulnerability testing | Auth bypass, BOLA/IDOR, injection results |
| `social-engineering-testing` | OSINT recon, phishing resistance, pretexting | SE resilience score + advisory report |

### Design & UX
| Skill | Trigger | Key Output |
|---|---|---|
| `mobile-ux-patterns` | Mobile design/responsive | Touch targets, gestures, progressive disclosure |
| `animation-choreography` | Micro-interactions, transitions | Timing, easing, motion design |
| `design-token-pipeline` | Token management | Token extraction and sync |

### Content & Documentation
| Skill | Trigger | Key Output |
|---|---|---|
| `technical-writing` | Doc creation | Documentation |
| `documentation-style-guide` | Before writing any document | Brand voice, terminology, bilingual standards |
| `improvement-lifecycle/` | Phase completion | Retrospective + logs |
| `content-strategy` | Content planning | SEO content calendar |
| `analytics-tracking` | Analytics setup | Event taxonomy, tracking plan |

### Go-to-Market & Growth
| Skill | Trigger | Key Output |
|---|---|---|
| `content-marketing` | Feature shipped, release made | Blog posts, social threads, release announcements |
| `seo-copywriting` | Landing page, ad copy, meta optimization | SEO-optimized copy, CRO microcopy |
| `launch-strategy` | Feature ready for launch | Pre-launch checklist, channel strategy, launch timeline |
| `growth-metrics` | Post-launch tracking, sprint review | AARRR metrics, feature adoption, cohort analysis |
| `telemetry-analysis` | User behavior investigation | Problem reports, drop-off analysis, engagement trends |
| `user-feedback-loop` | Feedback/telemetry needs routing | ICE-scored stories, backlog integration, loop closure |
| `investor-pitch-writer` | Pitch creation | One-pager |

### User Experience
| Skill | Trigger | Key Output |
|---|---|---|
| `user-experience-testing` | UX evaluation, persona testing | UX Scorecard + feedback report |
| `accessibility-empathy` | Low-tech user simulation | Cognitive load assessment + empathy report |

## Workflows (`.agent/workflows/`) — 42 files

| Workflow | Trigger | Pipeline |
|---|---|---|
| `/hc-sdlc` | New epic/phase | SPARC: Spec → Pseudo → Arch → Refine → Complete |
| `/party-mode` | Brainstorm / multi-agent (@pm facilitation mode) | Opening → Rounds → Red Team → Synthesis → Deploy |
| `/idea-forge` | Significant idea needing full validation | Brainstorm → Red Team → Refine → Implement → Battle Test → Debate → Log |
| `/swarm-execute` | Complex multi-agent parallel execution | Decompose → Pre-Wave Safety → Waves (Req/Arch → Impl → Test → Review) → Handoff |
| `/delegate-task` | Delegate scoped work to CLI worker agents via spawn-agent | Assess → Compose → git stash → Spawn → git diff review → Report |
| `/implementation-review` | Post-build approach evaluation | Roundtable → Intent check → Tech debt → SHIP/RETHINK verdict |
| `/scaffold-feature` | New feature | Types → Logic → UI with review |
| `/design-to-code` | Mockup to code | Design → Components → Visual verify |
| `/idea-to-prd` | Raw idea | Brainstorm → Interview → PRD |
| `/audit-and-deploy` | Release prep | Security → Tests → Build → Deploy |
| `/run-e2e-qa` | E2E testing | Browser flows → Failure capture |
| `/qa-responsive-check` | Responsive QA | Mobile → Tablet → Desktop checks |
| `/sprint-review` | End of sprint | Commits → CHANGELOG → Summary |
| `/retrospective` | Phase end | Reflection → Self-improvement |
| `/close-phase` | Phase done | Cleanup → SOT sync |
| `/dependency-upgrade` | Dep updates | Staged rollout with testing |
| `/prep-pitch-deck` | Pitch prep | Docs → One-pager |
| `/codebase-review` | Code audit | Scan → Score → Improvement plan |
| `/code-review` | PR review | Quality check → Approve/Request changes |
| `/user-test-session` | Post-feature UX testing | Persona sweep → Journey flows → Scorecard → Feedback report |
| `/pentest-session` | Pre-release security testing | Recon → OSINT → Attack simulation → SE Assessment → Exploit → Report → Remediation |
| `/incident-response` | Production issue detected | Detect → Investigate → Mitigate → Postmortem |
| `/api-design` | New API endpoint | Contract → Mock → Implement → Test |
| `/performance-audit` | Performance concerns | Lighthouse → Bundle → Profile → Optimize |
| `/mobile-readiness` | Mobile port or responsive QA | Viewport → Touch → Nav → PWA check |
| `/release-checklist` | Production deployment | Changelog → Security → Build → Smoke → Deploy → Monitor |
| `/onboard-developer` | New contributor | Setup → Tour → First PR → Standards review |
| `/ddd-discovery` | Domain modeling | Event storm → Bounded contexts → Aggregates → Map |
| `/go-to-market` | Feature ready for launch | Content → Copy → SEO → Landing page → Launch checklist → Monitor |
| `/customer-feedback-loop` | Telemetry data or user feedback available | Analyze → Prioritize (ICE) → Stories → Backlog → Verify fix |
| `/battle-test` | Stress-test a feature | Edge cases → Boundary conditions → Adversarial inputs |
| `/handoff` | Cross-model delegation (PM→Dev or Dev→PM) | Generate structured handoff artifact for context transfer |
| `/receive-handoff` | Bootstrap new conversation from handoff | Verify freshness → Load context → Begin execution |
| `/framework-lint` | After `.agent/` changes or periodic audit | Validate cross-refs → Check counts → Find orphans → Report |
| `/business-review` | Quarterly business review or on-demand | Market update → Financial health → Growth metrics → Brand audit → Strategic recommendations |
| `/market-research` | Before P1+ feature commitment or new market entry | Define → Desk Research → Competitive Scan → Sizing → Synthesis → @pm Decision Gate |
| `/product-discovery` | New feature idea needing validation | Problem → Hypothesis → Signals → Solutions → Feasibility → Value×Effort → GO/NO-GO Gate |
| `/ux-audit` | Monthly or on-demand UX audit for existing screens | Heuristic Eval → User Test → Prioritize → Improve → Re-test → Close |
| `/feature-review` | Quarterly feature health evaluation | Inventory → Usage Data → Value Assessment → Keep/Improve/Deprecate/Kill → Action Plans |
| `/scale-readiness` | Before major scaling events | Tech Audit → Perf Audit → Cost → Market → Product → Gap Analysis → Scale Decision Gate |
| `/pricing-experiment` | Testing pricing models or revenue streams | Hypothesis → Benchmark → A/B Design → Implement → Monitor → Analyze → Decision Gate |
| `/competitive-response` | Competitor makes significant move | Alert (4h SLA) → Deep Analysis (24h) → Response Options → @pm Decision → Execute → Review |
