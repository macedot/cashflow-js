# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CashflowSim is a client-side cashflow simulation SPA. All logic runs in the browser — no backend required.

## Running

Since `src/cashflow.js` uses ES modules, the app must be served over HTTP:

```bash
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Architecture

```
index.html          # Vue 3 SPA (CDN-based, no build step)
src/cashflow.js     # Core simulation logic (ES module)
```

**`src/cashflow.js`** contains pure functions:
- `runSimulation(events, initialBalance, simStart, simEnd)` → `CashflowEntry[]`
- `generateEventCashflows(event, simStart, simEnd)` → `DateValue[]`
- `parseDate(dateStr)` — uses local time to avoid timezone shifts
- `addPeriod(date, frequency)` — handles month overflow (e.g., Jan 31 + 1 month = Feb 28)
- `isValidDate(d)` — checks for valid Date
- `isSameDay(a, b)` — compares two dates (local time)
- `FREQUENCIES` — enum of valid frequency strings

**Simulation output**: One entry per calendar day from simStart to simEnd (inclusive). Days with no events have `cashflow: 0` and balance carried forward.

**`index.html`** uses:
- Vue 3 (CDN) — reactive UI
- Chart.js (CDN) — bar chart (cashflows) + stepped line (balance)
- PapaParse (CDN) — CSV import
- Tailwind CSS (CDN) — styling
- localStorage — events persist across page refreshes

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

## Edit UX

- Click **Edit** on an event to enter edit mode (form pre-filled, Add button replaced with OK/Cancel)
- **Cancel** discards changes and restores form
- **OK** commits changes and triggers auto-simulation
- During edit, original event data is preserved in `editingSnapshot` until OK or Cancel

## Date Handling

Dates in `YYYY-MM-DD` format are parsed as local time. This avoids UTC offset bugs when running in different timezones. The `addPeriod` function handles month overflow (Jan 31 + 1 month = Feb 28).
