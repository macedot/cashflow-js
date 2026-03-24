---
name: verify
description: Run lint, typecheck, and tests before marking work done
---

Run the full verification suite to confirm changes are ready:

```bash
npm run lint && npm run typecheck && npm test
```

- `npm run lint` — ESLint on src/\*.js (check for boundary/element-types errors)
- `npm run typecheck` — TypeScript type checking
- `npm test` — 30 Vitest unit tests (only src/\*_/_.test.js, excludes node_modules)

All three must pass with exit code 0 before marking work complete.
