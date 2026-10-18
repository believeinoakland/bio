# civil-time (T51)

**Status** · session_01BcmjtWcShwiAerhfkmJdjL · depth 2 · COMPLETE · handled B3

## Completion record (CR-1)

**Entries applied.** CR-1 (N1249, N1250), R30 met:
- `localClock(instant, zone)` → `{hour, minute}` (`values.mjs`, exported from `index.mjs`), from the same `wallOf` arithmetic as `localDay`; `ZONE_INVALID` / `DATE_INVALID` as R1 refuses them (an instant is judged before the zone); `TypeError` on a non-string.
- Every undetermined answer `values.mjs` makes answers `why` as `{key, vars}` (`compare`, `joinLocal`, `validAt`). The reasons are in the new `reasons.mjs` (`reason(key, vars)`; `reasonText(why)` reads one in English through the list). Keys reused from the list: `civil-time.start_stated`, `.end_stated`, `.validity_states_zone`, `.precision_precision_held`, `.occur_clocks_move`, `.occurs_twice_clocks`. Keys written first by `localize` (their `vars` are values, never sentence pieces): `civil-time.values.start_open|start_unknown|end_open|end_unknown` (`{value}`), `.overlap` (`{value, precision, zone, value_2, precision_2, zone_2}`), `.overlaps_start|overlaps_end` (`{value, bound}`), `.event_unresolved` (`{event, edge}`), `.event_unresolved_edgeless` (`{event}`).
- A second reason: where `validAt` fails two ways, or `compare` finds both spans open, `why` is the first and the others ride in `also: [{key, vars}]` (the old answer joined them with "; "). BOB: this field is mine; add it to R30 if it should bind.
- Reading of R30's "the zone and date refusals": a *refusal* (`{refused: CODE, why}`) keeps its code and its detail string (its sentence is `refusal.<CODE>`'s, setup-words); only *undetermined* answers carry keys (R30's control says so). Say so if the refusals' `why` should be keys too.
- `rules.mjs` `evaluateRule`/`overdueOn` read a caller's undetermined anchor or due whose `why` is a key through `reasonText` instead of printing `[object Object]`.
- Words findings (5, all zero in `checks/run.mjs`): `calendar.mjs` "no source stated" (`civil-time.calendar.no_source_stated`), the disputed / cannot-be-read sentences (`civil-time.calendar.disputed`, `.cannot_read`, `.cannot_read_why`), `recurrence.mjs` fiscal-year form (`civil-time.recurrence.fiscal_year_form`, reworded without braces), `values.mjs` open end (now the four `values.*_open|_unknown` keys; it also fixes the old text saying "end" for an open start), `rules.test.mjs`:265 now compared with `word("civil-time.counted_correction_governs", …)`, as are the two other copies of that sentence in the same test; the three calendar sentences compared by their list words and structure, not their text.
- Provides to add (BOB): `localClock` (R30, done in the requirement) and `reasonText(why)`, exported from `index.mjs` so callers and tests read a reason as the module does; `reasons.mjs`'s key list is `REASON_KEYS`.

**Deferred.** None.

**Found in other modules (REPORT).** The new shape breaks consumers' tests that print or match `why` as a string; none passes `why` through keyed yet. Baseline on `tranche/T51` is green for each, so these are all this change's (run per module, `node --test bio-plane/test/m/<module>/`):
- `lines` (4): R10 `reads.test.mjs`:89 (`structureAt`, matches `/no end is stated/` on an object), R11 `holderAt`, R14 owner-conformance battery, R21.
- `events` (3): R31 sequence, R35 R51 registration, R51 two meetings.
- `standards` (2): R48 (neighbours; registration).
- `law-relations` (2): R7; R7 R12.
- `duties` (2): R18 registration; R18 optional host.
- `calculations` (1): R3 `tablesAt` (`calculations/index.mjs` builds "…is undetermined: ${why}" and prints `[object Object]`).
- `money` (1): R16 conformance battery.
- `people` (2): R14 `peopleOf`; R40 hop with `why_key` (people R40 passes the owner's key as given: its job, CR-13 / R5).
- `connection-grammar` (10): R6 R19, R7, R8, R9 ×5, R16, R20 R19 — the owner-conformance battery judges an item's `undetermined.why` as a string; its R6/R20 contract names that (people R40 text). Each owner (lines, events, standards, money, duties, law-relations) converts the key to the string `word(key, vars)` for it, or the contract changes; both are theirs.
`following` (112), `action-clocks` (74) pass unchanged.

**Tests and checks.**
- `node --test bio-plane/test/m/civil-time/`: tests 68, pass 68, fail 0 (new: 3 R30 tests; R5, R8, R22, R23, R28 now assert keys).
- `node checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio civil-time`: 14 product files, 39 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio civil-time`: 30 of 30 live requirement ids named by a test; 0 failures.
- `node checks/run.mjs /home/user/bio`: words check shows no finding in civil-time; format and architecture 0 failures.
- `node checks/ownership.mjs /home/user/bio civil-time tranche/T51 job/T51/civil-time`: run after the commit (below).

Size (session_01BcmjtWcShwiAerhfkmJdjL): test runs 4, module lines 1450

## J1 · COMPLETE

CR-1 applied: R30 met. localClock(instant, zone) -> {hour, minute} is exported beside localDay; every undetermined answer of values.mjs (compare, joinLocal, validAt) answers why as {key, vars} (reasons.mjs; a second reason rides in 'also'); refusals keep code + detail string (my reading of R30: say if they should be keys). 5 words findings fixed, zero in checks/run.mjs. civil-time tests 68/68; format, architecture, coverage (30/30), ownership 0 failures. REPORT: the new shape breaks 27 baseline-green consumer tests (lines 4, events 3, standards 2, law-relations 2, duties 2, calculations 1, money 1, people 2, connection-grammar 10); names and causes in my record's Completion section. New public export reasonText for BOB to add to Provides. Size line is in the record.

## Completion record 2 (B2 CHANGE, K3961)

Merged `tranche/T51`. `recurrence.mjs` :158, :241, :248 now pass `reason(key, vars)` (`civil-time.window_open_end`, `.date_open_unknown`, `.spans_two_fiscal`), and the fiscal fact of the wrong form (:238, `FACT_INVALID`) is `civil-time.recurrence.fiscal_year_form` `{body}`; all four are in `reasons.mjs`' list, with one R30 test naming each (`recurrence.test.mjs`). `fiscalPeriod`'s "no fiscal_year held" (:235) and the rules' `no(...)` answers still carry `calendar.mjs`'s `missing()` sentence as a string; R30 binds `values.mjs` and BOB named only these sites, so they stay; say if R30 should reach them. The words file has no "Plain findings (K3957)" section for civil-time.
Checks: civil-time tests 69/69; format, architecture 0 failures; coverage 30/30; words check no civil-time finding. `setup-words/build.mjs --check` fails on `calc-grammar.recipe.field_shape` (a formatted argument; not this module's), and reports nothing for civil-time.
Size (session_01BcmjtWcShwiAerhfkmJdjL): test runs 8, module lines 1465

## J2 · COMPLETE

B2 applied: recurrence.mjs :158/:241/:248 and the fiscal-form reason (:238) now pass reason(key, vars), each named by an R30 test; tranche merged; tests 69/69, format/architecture/coverage/ownership 0 failures. build.mjs --check fails only on calc-grammar.recipe.field_shape (not mine). Unchanged strings: fiscalPeriod's 'no fiscal_year held' (:235) and rules' no() answers, from calendar.mjs missing(); say if R30 should reach them.

## Completion record 3 (B3 CHANGE, K3966)

Merged `tranche/T51`. Every undetermined `why` the module answers is now `{key, vars}`; a grep of `src/civil-time` finds no undetermined answer built from a string. `calendar.mjs` `missing(view, key, subject, vars)` answers `civil-time.missing.<subject>_withheld|_absent` (subjects `weekend`, `weekend_counting`, `computation`, `fiscal_year`, `closure_list`); `year()`'s answers are `civil-time.calendar.*` (`list|office` × `year_withheld`, `uncovered`, `disputed`, `cannot_read`, `cannot_read_why`); `rules.mjs` RULE_INVALID, UNMEASURED, anchor, not-applicable, due, possibly-overdue and span answers are `civil-time.rules.*`; `fiscalPeriod`'s "no fiscal_year held" is `civil-time.missing.fiscal_year_*`. Every key not in the list is written first by `localize` in `reasons.mjs`; `reasonText` reads them. A caller's own keyed `why` (an undetermined anchor or due) is passed on exactly; a caller's sentence is a fill of `civil-time.rules.anchor_undetermined` / `.due_undetermined`. Vars are values; the one punctuation fragment left is `offices` (" (a, b)") in the calendar's disputed / cannot-read reasons. Tests: `rules.test.mjs` "R30 R16 R9 R19 R24" names each key (about 40), and R9, R16, R19, R21 tests assert keys. Changed text: an office venue now reads as its kind, the uncovered-year sentence no longer says "the venue of".
Checks: civil-time tests 70/70; format, architecture 0 failures; coverage 30/30; words check no civil-time finding. `setup-words/build.mjs --check` now fails on `jurisdictions.index.amount_is_amount_and_units` (a formatted argument; not this module's).
Size (session_01BcmjtWcShwiAerhfkmJdjL): test runs 12, module lines 1514

## J3 · COMPLETE

B3 applied: every undetermined why of civil-time is {key, vars} (missing(), calendar year answers, RULE_INVALID, anchors, dues, spans, possibly-overdue, fiscalPeriod's absent fiscal_year); a caller's keyed why is passed on as given; each key named by a test; tranche merged. civil-time tests 70/70; format/architecture/coverage/ownership 0 failures. build.mjs --check fails only on jurisdictions.index.amount_is_amount_and_units (not mine).
