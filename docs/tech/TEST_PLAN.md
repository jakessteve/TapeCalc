# Test Plan

## Overview
Test strategy and coverage targets for the project.

## Test Levels

### Unit Tests
- **Tool**: Vitest
- **Coverage target**: 80% line coverage
- **Location**: Co-located with source in `*.test.ts` files

### Integration Tests
- **Scope**: Cross-module interactions, API contracts
- **Location**: `tests/integration/`

### E2E Tests
- **Tool**: Playwright
- **Scope**: Critical user flows
- **Location**: `tests/e2e/`

## Test Categories by Module

| Module | Unit | Integration | E2E | Notes |
|--------|------|-------------|-----|-------|
| Lunar Calendar | Required | Required | Required | Core feature |
| Tu Vi Engine | Required | Required | - | Calculation accuracy critical |
| Bazi Engine | Required | Required | - | Solar boundary accuracy |
| Feng Shui | Required | - | - | Star placement logic |
| Currency | Required | Required | Required | External API dependency |
| Numerology | Required | - | - | Pure calculation |

## Acceptance Criteria
- All tests pass before merge
- No regression in existing coverage
- Critical calculation engines require 90%+ coverage
- UI components require visual snapshot tests for responsive layouts

## Test Data Management
- Static test fixtures in `tests/fixtures/`
- Known-good reference data for calculation engines
- Mock API responses for external services
