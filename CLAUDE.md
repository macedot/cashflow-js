# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CashflowSim is a client-side cashflow simulation SPA. All logic runs in the browser — no backend required.

## Running

Since `src/cashflow.js` uses ES modules, the app must be served over HTTP:

```bash
python3 -m http.server 8080
# Then open http://localhost:8080/cf-sim.html
```

## Commands

```bash
npm install       # install dev dependencies (vitest)
npm test          # run tests once
npm run test:watch # watch mode
```

## Architecture

```
cf-sim.html         # Vue 3 SPA (CDN-based, no build step)
src/
  cashflow.js      # Pure simulation logic — zero dependencies, ES module
  cashflow.test.js # Vitest unit tests
  style.css        # Custom CSS (dark mode via CSS custom properties)
```

**`src/cashflow.js`** — standalone module, no Vue, no Chart.js, no external imports. Can be imported by any JS project:
- `runSimulation(events, initialBalance, simStart, simEnd)` → `CashflowEntry[]`
- `generateEventCashflows(event, simStart, simEnd)` → `DateValue[]`
- `parseDate(dateStr)` — uses local time to avoid timezone shifts
- `addPeriod(date, frequency)` — handles month overflow (e.g., Jan 31 + 1 month = Feb 28)
- `isValidDate(d)` — checks for valid Date
- `FREQUENCIES` — enum of valid frequency strings

**Simulation output**: One entry per calendar day from simStart to simEnd (inclusive). Days with no events have `cashflow: 0` and balance carried forward.

**`index.html`** uses:
- Vue 3 (CDN) — reactive UI with Composition API
- Chart.js (CDN) — mixed bar/line chart (Income/Expense bars + Balance stepped line)
- PapaParse (CDN) — CSV import
- Tailwind CSS (CDN) — base styling
- `src/style.css` — dark mode (CSS custom properties), chart container, toggle icons

**`src/style.css`** — dark/light theme via `.dark` class on `<html>`, CSS custom properties override Tailwind utilities in dark mode.

## Key Vue Patterns

**Auto-simulation**: `watch([simStart, simEnd, initialBalance], () => { saveSimParams(); autoSimulate(); })` triggers simulation on every param change.

**filteredResults**: A computed that filters results to show only days with cashflow changes (or first/last day). Shared between chart and table to avoid computing data twice.

**Chart animation**: `animation: { duration: 800, easing: 'easeOutQuart' }` on every chart render.

**Events table (live inline editing)**: The Events table is a full-width live table with inline editing. Each row can be clicked to enter edit mode (inputs replace displayed values). A "+" row at the bottom always shows empty inputs for adding new events. Validation runs on OK/+ press; simulation auto-runs after save.

**State for inline editing**:
- `editingEventIndex` — index of row being edited (null if none)
- `editDraft` — reactive object holding current edit row's form data
- `newEventDraft` — reactive object for the "+" row inputs
- `validateDraft(draft)` — validates a draft object (name, startDate, frequency required)

## CSV Format

Import CSV with columns: `name,startDate,endDate,frequency,value,currency`

Example:
```
name,startDate,endDate,frequency,value,currency
Salary,2025-01-01,2025-12-31,monthly,5000,USD
Rent,2025-01-01,2025-12-31,monthly,-1500,USD
```

## Event Form Validation

- **Required**: `startDate` and `frequency`
- **Optional**: `name` (can be empty), `endDate` (defaults to startDate), `value` (can be 0), `currency` (default: USD)
- Zero-value events are allowed in the list; simulation skips them
- Invalid frequency throws a descriptive error

## Date Handling

Dates in `YYYY-MM-DD` format are parsed as local time. This avoids UTC offset bugs when running in different timezones. The `addPeriod` function handles month overflow (Jan 31 + 1 month = Feb 28).
