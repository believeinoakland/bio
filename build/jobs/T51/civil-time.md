# civil-time (T51)

**Status** · session_01BcmjtWcShwiAerhfkmJdjL · depth 2 · COMPLETE · handled B1

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
