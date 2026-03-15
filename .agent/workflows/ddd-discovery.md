---
description: DDD Discovery - event storming, bounded contexts, aggregates, and context mapping
---

# Workflow: /ddd-discovery

**Trigger:** New domain modeling needed, system decomposition, or major refactoring.

## Steps

### 1. Event Storming
@sa facilitates an event storming session:
- List all domain events (things that happen): e.g., "Chart Generated", "Date Selected"
- Arrange events chronologically
- Identify commands that trigger events
- Identify aggregates that handle commands

### 2. Bounded Context Discovery
Group related events and commands into bounded contexts:
- Each context owns its own model and data
- Define ubiquitous language per context
- Document in `GLOSSARY.md`

### 3. Context Mapping
Using `domain-driven-design` skill, map relationships between contexts:
- Shared Kernel
- Customer/Supplier
- Anti-Corruption Layer
- Published Language

### 4. Aggregate Design
For each bounded context, identify aggregates:
- Define aggregate roots and boundaries
- Keep aggregates small (prefer more, smaller aggregates)
- Define value objects and entities

### 5. Implementation Planning
@sa creates implementation plan:
- Module/folder structure matching bounded contexts
- Interface contracts between contexts
- Migration plan if refactoring existing code

### 6. Review
@pm facilitates review using `/party-mode` with @sa, @dev, @ba.
Output: approved domain model documented in `docs/tech/ARCHITECTURE.md`.
