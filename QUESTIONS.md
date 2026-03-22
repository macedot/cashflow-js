# QUESTIONS.md

## Project Understanding Summary

CashflowSim is a client-side cashflow simulation SPA. Users define recurring income/expense events (name, start/end dates, frequency, amount), set a simulation date range and initial balance, then run a simulation to see:
- A bar chart of cashflows over time
- A stepped line chart of running balance over time
- A data table with daily breakdowns

The codebase is minimal: one Vue 3 SPA (`index.html`) loaded from CDN, one pure JS simulation module (`src/cashflow.js`), and a CLAUDE.md.

**High-risk areas identified:**
- No test coverage for core simulation logic
- No data persistence (all state lost on refresh)
- No input validation on simulation settings or event fields
- CDN dependencies lack SRI integrity hashes
- Large simulations may freeze the UI (synchronous execution)

---

## How to Answer

Mark each question as one of: `verified`, `partial`, `bug`, `approved improvement`, `deferred`, `out-of-scope`

---

## Questions

### 1. Product & Intended Behavior

#### Q1. simStart > simEnd
- **Where:** `src/cashflow.js:runSimulation`
- **Why this matters:** Currently returns empty array, silently. User may not understand why simulation shows no results.
- **Question:** Should this be validated and show a user-facing error, or is silent empty-result acceptable?

#### Q2. Event name uniqueness
- **Where:** `src/cashflow.js`, `index.html` event list
- **Why this matters:** Two events with the same name are allowed. In the results table, `items.join(', ')` would show duplicate names.
- **Question:** Is duplicate event name allowed? Should `items` in results deduplicate names when multiple events share the same name on the same date?

#### Q3. Empty event name
- **Where:** `index.html:addEvent` (line 256)
- **Why this matters:** `newEvent.name` can be empty string, which is pushed into events array and processed.
- **Question:** Should empty event names be rejected with validation?

#### Q4. Zero-value events
- **Where:** `index.html:addEvent` (line 256), `src/cashflow.js`
- **Why this matters:** Events with value=0 are allowed but generate no cashflows. May be confusing.
- **Question:** Should zero-value events be rejected, or is it acceptable to include them (they do no harm, just waste processing)?

#### Q5. Date range with no events
- **Where:** `src/cashflow.js:runSimulation`
- **Why this matters:** When no events fall within the simulation date range, results is empty. The UI shows a specific empty state message.
- **Question:** Is this the intended behavior — or should the simulation still show days with initial_balance when no events occur?

#### Q6. Initial balance on days with no events
- **Where:** `src/cashflow.js:runSimulation`
- **Why this matters:** The results only include days where at least one event fires. The initial balance is only reflected on the first event day. A user might expect to see their starting balance from day one.
- **Question:** Should the results array include day 0 (simStart) with balance = initialBalance, before any events fire?

#### Q7. No data persistence
- **Where:** `index.html` Vue reactive state only
- **Why this matters:** Refreshing the page loses all events and results. Users may lose work.
- **Question:** Is intentional (ephemeral tool), or should events be saved to localStorage?

#### Q8. No event count or date range limit
- **Where:** `src/cashflow.js`, `index.html`
- **Why this matters:** A user could set 1000 events over a 50-year range, generating 600+ cashflow dates per event = 600,000 results. This would freeze/crash the browser.
- **Question:** Should there be limits on number of events, date range span, or total result rows?

---

### 2. Architecture

#### Q9. SRI hashes for CDN dependencies
- **Where:** `index.html:7-10`
- **Why this matters:** Chart.js, PapaParse, Tailwind, and Vue are loaded from CDN without `integrity` attributes. If any CDN is compromised, malicious code could be injected.
- **Question:** Should SRI hashes be added for all CDN resources?

#### Q10. Synchronous simulation on main thread
- **Where:** `src/cashflow.js:runSimulation`
- **Why this matters:** All computation is synchronous. Large simulations block the UI thread.
- **Question:** Should simulation run in a Web Worker for large date ranges?

#### Q11. Chart.js memory leak potential
- **Where:** `index.html:357-366`, `index.html:368-427`
- **Why this matters:** `destroyCharts()` is called before creating new charts, but only in `clearEvents()`. If user edits an event (not clears), charts may accumulate.
- **Question:** Should `runSimulation()` always destroy existing charts before rendering new ones? (Currently it does call `destroyCharts()` at line 369 — but only if `results.value.length > 0`. If results become empty after edit, charts persist.)

#### Q12. No build/test pipeline
- **Where:** Project root
- **Why this matters:** `cashflow.js` has no tests. No CI/CD. No way to verify correctness after changes.
- **Question:** Should a test framework (Vitest, Jest) and npm scripts be added?

---

### 3. Code Structure & Boundaries

#### Q13. Dead code: `isSameDay` function
- **Where:** `src/cashflow.js:54-58`
- **Why this matters:** `isSameDay()` is defined but never called. Dead code increases maintenance burden.
- **Question:** Should `isSameDay` be removed, or is it intended for future use?

#### Q14. `FREQUENCIES` constant not enforced
- **Where:** `src/cashflow.js:6-13`, `index.html:80-88`
- **Why this matters:** `FREQUENCIES` constant is exported but the code uses string literals `'monthly'`, `'quarterly'`, etc. everywhere. An unknown frequency string falls through to the `default` case in `addPeriod`.
- **Question:** Should the code validate that `event.frequency` is one of the known FREQUENCIES values, or is string fallback acceptable?

#### Q15. `onMounted` imported but unused
- **Where:** `index.html:221`
- **Why this matters:** `onMounted` is destructured from Vue but never used. Dead import.
- **Question:** Should it be removed?

#### Q16. `newEvent` form state not reset after cancel
- **Where:** `index.html:291-295`
- **Why this matters:** When editing (not canceling), `cancelEdit()` only resets `name` and `value`. `startDate`, `endDate`, and `frequency` remain. If user then clicks "Add" (not "Update"), the stale dates/frequency are used.
- **Question:** Should `cancelEdit()` also reset `startDate`, `endDate`, and `frequency`?

---

### 4. Data & Persistence

#### Q17. CSV export malformed on special characters
- **Where:** `index.html:437`
- **Why this matters:** `items.join('; ')` produces unquoted strings. If an item name contains a comma (e.g., "Groceries, Weekly"), the CSV becomes malformed.
- **Question:** Should CSV values be properly quoted/escaped?

#### Q18. CSV import silently skips rows
- **Where:** `index.html:323`
- **Why this matters:** `parsed.data.filter(row => row.name && row.value)` silently drops rows where name or value is missing. No feedback to user.
- **Question:** Should the import report how many rows were skipped vs imported?

#### Q19. CSV import values not validated
- **Where:** `index.html:330`
- **Why this matters:** `parseFloat(row.value)` on non-numeric input returns `NaN`, which is truthy in comparisons but produces `NaN` in calculations.
- **Question:** Should CSV import validate that `value` is a finite number?

---

### 5. Security

#### Q20. Public access (no auth)
- **Where:** `index.html` (client-side only)
- **Why this matters:** If deployed as a personal finance tool, anyone with the URL can access it.
- **Question:** Is this intentional (personal use only), or should basic auth or a passcode be added?

#### Q21. XSS via event name
- **Where:** `index.html:133-140`, `index.html:196`
- **Why this matters:** Event names are rendered as HTML via Vue interpolation. A name like `<img src=x onerror=alert(1)>` would execute.
- **Question:** Should event names be escaped before rendering, or is this a trusted personal tool?

---

### 6. Error Handling & Resilience

#### Q22. CDN load failure is silent
- **Where:** `index.html:7-10`
- **Why this matters:** If Vue, Chart.js, or PapaParse fails to load (network issue), the app shows a blank page with no error message.
- **Question:** Should there be a loading error state?

#### Q23. `parseDate` fallback silently accepts bad input
- **Where:** `src/cashflow.js:45`
- **Why this matters:** Non-ISO date strings fall through to `new Date(dateStr)`, which is browser-dependent. `"2025-13-01"` (invalid month) produces an Invalid Date that may propagate silently.
- **Question:** Should invalid dates produce a validation error or return a clear Invalid Date sentinel?

#### Q24. No validation on simStart/simEnd
- **Where:** `index.html:34-40`, `index.html:345-349`
- **Why this matters:** User can set simEnd before simStart. Simulation runs but produces empty results.
- **Question:** Should the form validate that simEnd >= simStart?

---

### 7. Testing & QA

#### Q25. No tests for `cashflow.js`
- **Where:** `src/cashflow.js`
- **Why this matters:** This is the core business logic. No test coverage means regressions go undetected.
- **Question:** Should unit tests be added covering: monthly events, month overflow (Jan 31 → Feb 28), quarterly, annual, leap year, overlapping events on same day, empty results?

#### Q26. No tests for Vue app
- **Where:** `index.html`
- **Why this matters:** No UI tests, no integration tests.
- **Question:** Should Vue component tests be added?

---

### 8. Possible Bugs

#### Q27. Charts not destroyed when results become empty after edit
- **Where:** `index.html:368-427`
- **Why this matters:** If simulation produced results (charts visible), user then edits an event and new simulation produces 0 results, the old charts remain visible because `destroyCharts()` is not called in `runSim()` path — only in `clearEvents()`.
- **Question:** Bug or intended behavior?

#### Q28. Edit then re-add creates duplicate entries
- **Where:** `index.html:281-288`
- **Why this matters:** After clicking Edit, if user types a new name and clicks "Add" (not "Update"), a new event is added alongside the old one. The form doesn't clearly indicate which mode is active.
- **Question:** Should the "Add" button be disabled/replaced while in edit mode?

#### Q29. Annual frequency leap year handling is fragile
- **Where:** `src/cashflow.js:101-105`
- **Why this matters:** The leap year check `new Date(year + 1, 1, 29).getMonth() === 1` works because it checks if Feb 29 exists in year+1. But if today is Feb 29 and you add 1 year, the calculation uses `day = 29`, which is fine. However the logic seems indirect.
- **Question:** Is this leap year logic correct in all cases, or should it be simplified?

#### Q30. Results table shows "0 days" when simulation ran
- **Where:** `index.html:173`
- **Why this matters:** Header shows `{{ results.length }} days` but results are per cashflow-date, not per calendar day. If multiple events fire on same day, it shows fewer rows than calendar days.
- **Question:** Should it say "entries" or "rows" instead of "days"?

---

### 9. Missing Decisions / Open Design Gaps

#### Q31. Currency symbol hardcoded
- **Where:** `index.html:43,91-95`
- **Why this matters:** UI shows "$" everywhere. No currency selection.
- **Question:** Is USD-only acceptable, or should currency be selectable?

#### Q32. Mobile/touch usability not tested
- **Where:** `index.html` responsive grid
- **Why this matters:** On mobile, the two-column layout may be cramped. Event form inputs are small.
- **Question:** Has the app been tested on mobile? Should it be?

#### Q33. Frequency display is lowercase in results
- **Where:** `index.html:140`
- **Why this matters:** Shows raw frequency string (e.g., "semi-annual") which is fine, but inconsistent capitalization with other labels.
- **Question:** Is the lowercase display intentional?

---

## Suggested answer tags
Use: `verified` · `partial` · `bug` · `approved improvement` · `deferred` · `out-of-scope`
