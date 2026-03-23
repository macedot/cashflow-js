# AGENTS.md

This file provides guidance for autonomous AI agents working on this codebase.

## Project Overview

CashflowSim is a client-side cashflow simulation SPA. It visualizes income and expenses over time using Vue 3 and Chart.js.

## Development Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run typecheck

# Check for unused dependencies
npm run knip

# Check for duplicate code
npm run jscpd

# Serve locally
python3 -m http.server 8080
```

## Code Quality Standards

### TODO/FIXME Policy

All TODO and FIXME comments MUST link to an issue. Use format:

- `TODO(#issue): Description` for planned work
- `FIXME(#issue): Description` for known bugs

Example:

```javascript
// TODO(#123): Refactor this function to reduce complexity
// FIXME(#456): Handle edge case when date is Invalid Date
```

### Commit Messages

- Use conventional commits format
- AI agents should include `Co-Authored-By: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>`

### Branch Naming

- Feature: `feature/description`
- Bugfix: `fix/description`
- Readiness: `readiness/signal-name`

## Testing Requirements

- All new features MUST include unit tests
- Run `npm test` before committing
- Maintain 100% test pass rate

## File Organization

- `src/cashflow.js` - Core simulation logic (no dependencies)
- `src/cashflow.test.js` - Unit tests for simulation logic
- `src/style.css` - Custom CSS
- `index.html` - Vue SPA application

## Build & Deployment

This is a CDN-only SPA with no build step. All dependencies are loaded via CDN.
