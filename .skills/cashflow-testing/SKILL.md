---
name: cashflow-testing
description: Testing guide for the Cashflow Simulator project
---

# Cashflow Testing Guide

## Test Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Test Structure

- Tests are in `src/cashflow.test.js`
- Uses Vitest as the test runner
- All tests run in Node environment (no browser required)

## Test Coverage

The test suite covers:

1. **runSimulation** - Main simulation function
   - Continuous daily entries from start to end
   - Balance calculation with cashflow accumulation
   - Multiple events on same day
   - Date range clipping

2. **Date Parsing**
   - YYYY-MM-DD format parsing (local time)
   - Date object pass-through
   - Invalid input handling

3. **Frequency Handling**
   - Daily, weekly, monthly, quarterly, semi-annual, annual
   - Month overflow (Jan 31 → Feb 28/29)
   - Leap year handling (Feb 29)

4. **Validation**
   - Valid date checking
   - Frequency validation with descriptive errors

## Adding Tests

When adding features:

1. Add unit tests for new functions in `src/cashflow.test.js`
2. Test edge cases (boundary conditions, invalid inputs)
3. Ensure all 30 existing tests still pass
4. Run `npm run test:coverage` to verify coverage thresholds

## Coverage Thresholds

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%
