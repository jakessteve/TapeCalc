---
description: API Design - contract-first API development from spec to implementation
---

# Workflow: /api-design

**Trigger:** New API endpoint needed or existing API redesign.

## Steps

### 1. Define Contract
@sa defines the API contract using `api-design-principles` skill:
- HTTP method + URL
- Request/response shapes (TypeScript interfaces)
- Error responses
- Auth requirements

Document in `docs/tech/API_CONTRACTS.md`.

### 2. Review Contract
@pm reviews the contract. Frontend and backend teams align on the shape.

### 3. Create Mock
@dev creates a mock implementation that returns sample data matching the contract.
This unblocks frontend development.

### 4. Implement
@dev implements the actual endpoint against the contract.
Use `test-driven-development` skill — write tests first.

### 5. Integration Test
@qc writes integration tests that verify:
- Happy path returns correct status and shape
- Error paths return correct error codes
- Auth is enforced
- Rate limiting works
Use `test-case-design` ISTQB techniques.

### 6. Verify
@qc runs the full test suite with `verification-before-completion`.
Confirm the implementation matches the contract exactly.
