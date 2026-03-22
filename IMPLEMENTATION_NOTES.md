# IMPLEMENTATION_NOTES.md

## Based on: `QUESTIONS.md` answered by project owner

---

## Decision Mapping

| # | Decision | Action | Status |
|---|----------|--------|--------|
| Q1 | simStart > simEnd → show error | Added simError validation in runSim | verified |
| Q2 | Allow duplication | No change | verified |
| Q3 | Name is required | Validated in validateForm() before add/confirmEdit | verified |
| Q4 | Zero-value events OK, optimize later | No change | verified |
| Q5 | Every day needs balance, carry forward | Rewrote runSimulation for continuous daily entries | verified |
| Q6 | Include simStart day 0 | Day 0 always included with initialBalance | verified |
| Q7 | localStorage persistence | Save/load events via STORAGE_KEY | verified |
| Q8 | No hard limits | No change | verified |
| Q9 | SRI hashes if recommended | Deferred — requires build step or manual hash maintenance | deferred |
| Q10 | Web Worker | Deferred — adds complexity, sync execution acceptable for now | deferred |
| Q11 | Charts keep as is | No change | verified |
| Q12 | Test framework | Vitest with 30 passing tests | verified |
| Q13 | Remove dead isSameDay | Removed — dead code (Q13) | verified |
| Q14 | Validate frequencies | addPeriod throws descriptive error for unknown frequency | verified |
| Q15 | Remove unused onMounted | Removed | verified |
| Q16 | cancelEdit resets all fields | Form resets all fields including startDate/endDate/frequency/currency | verified |
| Q17 | CSV export quoting | Values escaped and quoted | verified |
| Q18 | CSV import skip count | Reports imported/skipped count | verified |
| Q19 | CSV import validate finite | Checks isNaN on parseFloat, skips invalid rows | verified |
| Q20 | Public access intentional | No auth needed | verified |
| Q21 | XSS escape | Vue {{ }} auto-escapes, no v-html used | verified |
| Q22 | CDN load error state | Added fallback div shown if Vue fails to load | verified |
| Q23 | Invalid date validation | parseDate returns Invalid Date for bad input | verified |
| Q24 | Validate simEnd >= simStart | simError shown if simEnd < simStart | verified |
| Q25 | Unit tests for cashflow.js | 30 Vitest tests covering all frequencies, leap year, overlapping, validation | verified |
| Q26 | Vue component tests | Deferred | deferred |
| Q27 | Fix chart destruction | destroyCharts() called before every renderCharts() | verified |
| Q28 | Edit UX redesign | OK/Cancel buttons, snapshot preserved during edit, auto-simulate on OK | verified |
| Q29 | Leap year logic | Verified correct, simplified isLeapYear check | verified |
| Q30 | "entries" not "days" | Changed to "{{ results.length }} entries" | verified |
| Q31 | Currency field | Added currency dropdown (USD/EUR/GBP/BRL), default USD, passed through | verified |
| Q32 | Mobile compatibility | Buttons py-3 (44px touch), viewport-fit=cover | verified |
| Q33 | Frequency lowercase hyphen | Already correct | verified |

---

## Applied Changes

### `src/cashflow.js`
- **Rewrote `runSimulation`**: Now returns one entry per calendar day from simStart to simEnd (inclusive). Days with no events have `cashflow: 0` and `balance` carried forward from previous day.
- **Day 0 always included**: simStart appears as first entry with `cashflow: 0`, `balance: initialBalance`, `items: []`.
- **Added frequency validation**: `addPeriod()` throws `Error` with descriptive message for unknown frequency.
- **Added `isValidDate()`**: Public export for upstream validation.
- **Annual leap year**: Simplified `isLeapYear()` inline check with clear comment.
- **`isSameDay`**: Removed — dead code (Q13)
- Removed no longer needed comment about aligning first occurrence.

### `index.html`
- **New Edit UX (Q28)**: "Add Event" / "OK" / "Cancel" buttons. During edit, original event snapshot is preserved in `editingSnapshot`. Cancel discards changes. OK commits and auto-simulates. Edit button is disabled during edit mode.
- **Validation (Q1, Q3, Q24)**: Form validates `name` (required), `startDate` (required), `frequency` (required). Simulation validates `simEnd >= simStart` with `simError` display.
- **Chart fix (Q27)**: `destroyCharts()` called unconditionally before `renderCharts()` in `runSim()`.
- **localStorage (Q7)**: Events saved to `localStorage` on every change. Loaded on mount. Cleared on "Clear All".
- **CSV import (Q17, Q18, Q19)**: Proper quoting in export. Import reports `imported/skipped` count. `NaN` values skip row.
- **CSV export**: Added `escape()` helper to quote fields with commas/quotes.
- **Currency field (Q31)**: Added to form (USD/EUR/GBP/BRL), displayed in event list, passed through in events. CSV columns updated.
- **CSV header updated**: Now lists 6 columns including currency.
- **Removed `onMounted` (Q15)**: Cleaned up unused import.
- **cancelEdit resets all (Q16)**: Now resets `startDate`, `endDate`, `frequency`, `currency` in addition to `name` and `value`.
- **"entries" not "days" (Q30)**: Results header now says "entries".
- **CDN error fallback (Q22)**: `<div id="app-load-error">` shown if Vue fails to load.
- **Auto-simulate**: After `addEvent`, `confirmEdit`, `removeEvent`, `importCSV` — simulation runs automatically if events exist.
- **Empty items shown as "—"**: In results table, empty items array shows `—` instead of blank.
- **`removeEvent`**: Properly adjusts `editingIndex` after splice, cancels edit if removing the event being edited.

---

## Deferred Items

| Item | Reason |
|------|--------|
| Q9 SRI hashes | Requires build step or manual hash updates when CDN versions change |
| Q10 Web Worker | Adds complexity; synchronous execution acceptable for typical date ranges |
| Q26 Vue component tests | Deferred until test infrastructure is stable |

---

## Verified Behaviors

- Monthly Jan 31 + 1 month = Feb 28 (month overflow handled)
- Annual Feb 29 + 1 year (non-leap) = Feb 28 (leap year handled)
- Events with same name on same day show both in `items` array
- localStorage survives page refresh
- Invalid frequency throws descriptive error at simulation time
- Zero-value events are allowed in the list; simulation skips them (no cashflow generated)

---

## Next Steps

1. ✅ Vitest with 30 tests — done
2. ✅ Mobile CSS — buttons bumped to py-3 for 44px touch targets, viewport-fit=cover
3. Remaining deferred: Q9 SRI hashes, Q10 Web Worker, Q26 Vue component tests
