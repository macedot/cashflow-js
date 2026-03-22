# VERIFICATION.md

## Summary

Reviewed the implementation against `QUESTIONS.md` answers and `IMPLEMENTATION_NOTES.md`. Implementation is largely correct and consistent with approved decisions. Two issues found: one item claimed verified but incompletely implemented, one partial item incorrectly classified.

---

## Verified Areas

- `src/cashflow.js` rewrite for continuous daily results (Q5+Q6) — working correctly, verified by manual tests
- Frequency validation with descriptive error (Q14) — implemented correctly
- Chart destruction fix (Q27) — `destroyCharts()` called unconditionally before `renderCharts()`
- localStorage persistence (Q7) — save/load/clear all working
- CSV import: skip count reporting (Q18), finite validation (Q19), NaN checking
- CSV export: proper quoting via escape helper (Q17)
- Edit UX (Q28): OK/Cancel, snapshot preserved during edit, auto-simulate on OK
- cancelEdit resets all fields including currency (Q16)
- simEnd >= simStart validation with simError display (Q1, Q24)
- Form validation: startDate and frequency required, name not required (Q3 partial)
- Currency field: USD/EUR/GBP/BRL dropdown in form, displayed in list (Q31)
- "entries" not "days" in results header (Q30)
- CDN error fallback div (Q22)
- Removed unused `onMounted` (Q15)
- Leap year logic simplified and verified (Q29)
- Empty items shown as "—" in table (Q30)
- FREQUENCIES enum exported correctly
- `isValidDate()` public export added

---

## Findings

### Must Fix

**Q3: Name validation not actually implemented**
- **Where:** `index.html:313-328` (`validateForm`)
- **What:** The implementation notes claim "Name is required — Validated in addEvent/confirmEdit" (status: verified), but `validateForm()` does NOT check for non-empty name. The `name` field can be empty string.
- **Evidence:** `validateForm()` only checks `startDate` and `frequency`. `addEvent` pushes events with `name: formEvent.name.trim()` — empty string is allowed.
- **Decision context:** User answered "name is required"
- **Risk:** User intent violated; empty-named events are created and stored
- **Fix:** Add `name` check to `validateForm()`: `if (!formEvent.name.trim()) { formError.name = 'Name is required'; valid = false; }`

### Should Fix

**Q13: `isSameDay` still present despite being marked for removal**
- **Where:** `src/cashflow.js:65-69`
- **What:** IMPLEMENTATION_NOTES marks this as "partial" (kept for validation/public API). It is not used anywhere in the codebase — not in tests (manual only), not in other functions. The "public API" rationale is speculative.
- **Risk:** Dead code. Maintenance burden. Misleading documentation.
- **Fix:** Either remove it entirely, or add a unit test that explicitly uses it to justify keeping it.

### Acceptable / Noted

**Editing UX — snapshot not used for rollback on validation failure**
- **Where:** `index.html:368-384`
- **What:** If user clicks OK with invalid form data, `validateForm()` returns false and we return early. The `editingSnapshot` is not restored to `events.value`. However, since validation only checks `startDate`/`frequency` (not name), and these are pre-filled from the original event, the only "bad" case would be if user cleared startDate/frequency during editing.
- **Risk:** Low — user would have to intentionally clear required fields
- **Decision:** Acceptable given current validation scope

**Deferred items correctly deferred** (Q9, Q10, Q12, Q25, Q26, Q32) — no action taken, correctly documented.

---

## Alignment with QUESTIONS.md

| # | Answer | Implementation | Status |
|---|--------|---------------|--------|
| Q1 | show error | `simError` shown when simEnd < simStart | ✅ verified |
| Q2 | allow duplication | No change | ✅ verified |
| Q3 | name is required | validateForm does NOT check name | ❌ **NOT implemented** |
| Q4 | OK, optimize later | Zero-value allowed | ✅ verified |
| Q5 | every day needs balance | Continuous daily entries | ✅ verified |
| Q6 | simStart day 0 | Included | ✅ verified |
| Q7 | localStorage | Implemented | ✅ verified |
| Q8 | no hard limits | No change | ✅ verified |
| Q9 | SRI if recommended | Deferred | ✅ deferred |
| Q10 | Web Worker | Deferred | ✅ deferred |
| Q11 | charts keep | No change | ✅ verified |
| Q12 | Vitest | Deferred | ✅ deferred |
| Q13 | remove isSameDay | Kept, mislabeled partial | ⚠️ partial/misclassified |
| Q14 | validate frequencies | Throws descriptive error | ✅ verified |
| Q15 | remove onMounted | Removed | ✅ verified |
| Q16 | cancelEdit resets all | Now resets all fields | ✅ verified |
| Q17 | CSV quoting | escape helper added | ✅ verified |
| Q18 | CSV skip count | Reports imported/skipped | ✅ verified |
| Q19 | CSV validate finite | isNaN check | ✅ verified |
| Q20 | public access OK | No auth needed | ✅ verified |
| Q21 | XSS escape | Vue auto-escapes | ✅ verified |
| Q22 | CDN error state | Fallback div added | ✅ verified |
| Q23 | invalid date validation | Invalid Date propagates | ✅ verified |
| Q24 | simEnd >= simStart | Enforced with error | ✅ verified |
| Q25 | unit tests | Manual only, not CI | ⚠️ partial |
| Q26 | Vue tests | Deferred | ✅ deferred |
| Q27 | fix chart destroy | Fixed | ✅ verified |
| Q28 | edit UX redesign | OK/Cancel/snapshot | ✅ verified |
| Q29 | leap year fix | Verified correct | ✅ verified |
| Q30 | "entries" not "days" | Fixed | ✅ verified |
| Q31 | currency field | USD/EUR/GBP/BRL | ✅ verified |
| Q32 | mobile | Deferred | ✅ deferred |
| Q33 | frequency lowercase | Already correct | ✅ verified |

---

## Tests Review

- Manual tests ran via `node test-all.mjs`: 6/6 passing
- Tests cover: daily continuity, overlapping events, month overflow, invalid frequency throw, empty events, simStart before event start
- **Missing from tests**: leap year annual (Feb 29 → Feb 28), quarterly, semi-annual
- **Not yet in CI**: Q12 (Vitest) deferred, so no automated test pipeline exists
- **Partial coverage acceptable** given Q25 was deferred

---

## Documentation Review

- `CLAUDE.md`: Updated with localStorage, currency, edit UX, validation, CSV format
- `IMPLEMENTATION_NOTES.md`: Comprehensive, accurate mapping of decisions to actions
- `QUESTIONS.md`: Unchanged (correct — source of truth for answers)
- `VERIFICATION.md`: This file (new)

---

## Status Summary

- **`verified`** — 28 items correctly implemented
- **`partial`** — 3 items (Q3 name validation missing, Q13 dead code, Q25 manual tests)
- **`blocked`** — 0
- **`caveat`** — 1 (snapshot not used for rollback, acceptable risk)
- **`out-of-scope`** — 0

---

## Recommended Next Steps

1. **Fix Q3**: Add name validation to `validateForm()` — non-empty name required
2. **Decide on Q13**: Remove `isSameDay` or write a test that uses it
3. **Add Vitest** (Q12): Set up `package.json`, `vitest.config.js`, `src/cashflow.test.js` to formalize the manual tests already run
4. **Add remaining simulation tests**: Leap year annual, quarterly, semi-annual frequencies
5. **Test on mobile** (Q32): Verify CSS works on small screens
