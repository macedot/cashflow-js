# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dev dependencies (vitest, eslint, typescript)
npm test               # run all tests once
npm run test:watch     # run tests in watch mode
npm run test:coverage  # run tests with coverage report
npm run test:e2e       # run Playwright E2E tests
npm run lint           # run ESLint on src/*.js
npm run lint:fix       # auto-fix ESLint errors
npm run format         # format code with Prettier
npm run typecheck      # run TypeScript type checker on src/*.js
python3 -m http.server 8080  # serve app (ES modules require HTTP server)
```

Open http://localhost:8080 in your browser. Direct file:// access works too but some browsers restrict ES modules.

## Architecture

### CDN-only SPA (no build step)
- **Vue 3** (CDN) — SPA framework, Composition API
- **Chart.js 4.5.1** (CDN) — bar + line mixed chart
- **PapaParse 5.5.3** (CDN) — CSV import/export
- **Tailwind 2.2.19** (CDN) — utility CSS (dark: variants NOT supported)
- **ES modules** via `<script type="module">` importing `src/cashflow.js`

### File responsibilities
- `index.html` — HTML structure, CDN script tags, Vue 3 app setup, all application logic (chart rendering, events management, dark mode, CSV import/export). **Do not add business logic here.**
- `src/cashflow.js` — pure simulation engine. Zero dependencies. Only uses standard JS built-ins (Date, Math, Array, Map). Exports: `runSimulation`, `generateEventCashflows`, `parseDate`, `addPeriod`, `isValidDate`, `FREQUENCIES`. Can be imported by any JS project.
- `src/style.css` — custom CSS only. CSS custom properties for theming, dark mode overrides, chart-container, error messages, toggle icons.
- `src/cashflow.test.js` — Vitest unit tests (30 tests). Tests run in Node environment.
- `tests/integration/` — Playwright E2E tests

**Coverage thresholds**: statements 80%, branches 80%, functions 80%, lines 80%.

### Dark mode implementation
Tailwind CDN v2.x does NOT support `dark:` variants. Dark mode is implemented via:
1. Inline `<script>` in `<head>` sets `.dark` class on `<html>` BEFORE Tailwind CSS parses
2. CSS custom properties on `:root` (light) and `.dark`/`html.dark` (dark)
3. `!important` overrides on `html.dark` selectors targeting every Tailwind utility class used in the app (bg-white, text-gray-700, etc.)

**Rule**: When adding new Tailwind classes, add corresponding `html.dark .your-class { property: value !important; }` to `src/style.css`.

### Key Vue patterns
- **Inline editing state**: `editingEventIndex` (ref) + `editDraft` (reactive) for existing rows; `newEventDraft` (reactive) for "+" row; `validateDraft(draft)` for validation
- **Events table**: `eventsCollapsed` (ref) for collapse state; `portfolioCurrency` for display currency
- **Charts**: `cashflowChart` and `cashflowChartFullscreen` canvas refs; `cashflowChartInstance` / `cashflowChartFullscreenInstance` for Chart.js instances; `chartFullscreen` (ref) for overlay state
- **Simulation**: auto-runs on mount and on changes via `watch([simStart, simEnd, initialBalance], autoSimulate)`
- **ESC key**: cancels inline editing (prioritized) or exits fullscreen chart

### Date handling
`parseDate()` uses local time (`new Date(y, m-1, d)`) to avoid UTC timezone shifts with YYYY-MM-DD strings. All dates flow through this function in `cashflow.js`.
