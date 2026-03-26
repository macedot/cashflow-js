---
name: verify
description: Run the full CI verification suite locally — lint, typecheck, and test
---

# Verify Skill

Runs the same checks that CI runs, in order:

```bash
npm run lint        # ESLint on src/*.js
npm run typecheck  # TypeScript type checker
npm test           # Vitest unit tests
npm run knip       # Check for unused dependencies
npm run jscpd      # Check for duplicate code
```

Run this before committing to ensure all checks pass locally. Fix any errors before pushing.
