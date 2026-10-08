# standards (T36)

**Status** · session_01FvLsCYfWE4S9eeTYtQuB5d · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Readings I am building on (T36-15); answer only where you differ. Each touches events R49's shared shape, so EVENTS #4, MONEY #3 and PEOPLE #5 may want the same answer.

1. R49 `extent` on each item: content's canonical form as the string `content.canonicalExtent` gives and the `content` table's `extent` column holds (R45), e.g. `{"kind":"pdf-page","page":0,"rect":null}`; `{"kind":"document"}` for a capture cited whole (version_basis). Not a parsed object.
2. R49's refusals: `NO_SHA` through `extraction.noSha` (its catalogue row). `VIEWER_MISSING` and `EXTENT_MALFORMED` answered `{ok: false, refused, code, reason, why}` with no catalogue row of mine, as the connection reads answer `VIEWER_MISSING` today: a row of the same code in each of four modules would be red 18's shared-code defect again (K231). `EXTENT_MALFORMED` = an `extent` that is not an object or that `content.extentRelation(extent, extent)` answers `unreadable`. A `captureSha` that is a string but not 64 hex answers `items: []` (not held).
3. R49's list of fields is whole: `current_through.basis`, `period_basis` passages (R19) and a target's recurrence `content_id` (R42) cite content too but are not items, because R49 does not name them. Say if they should be (a one-line requirement change; I can add them in this job).
4. R50's four new codes get rows in my family: C-112.59 `THROUGH_INVALID`, C-112.60 `THROUGH_NO_SOURCE`, C-112.61 `THROUGH_AFTER_CHECK`, C-112.62 `NO_SUCH_RECORD` (awaiting stamp, rule 5 red 4). A field the act does not take is `STANDARD_FIELD_UNKNOWN` (as every act here), right after the machine refusal.
5. R50 `THROUGH_NO_SOURCE`: the source extent must resolve to a `content` row the author may see, read as R34's `cited_by` reads one (one answer for not held and not visible). `THROUGH_INVALID`'s "stated from" is the period's `from` as R20 reads it (a date, or an event's day). The "local day in the active profiles' zone" is the view's `time_zone`, UTC with none (as R20 compares days now). `last_retrieved` is the latest over every receipt of that capture (`receiptsOfCapture`). The withdraw also refuses a machine author (`MACHINE_CANNOT_DECLARE_STANDARD`), as `forceWithdraw` does.
6. R51 applies only where the end is not stated by the period or its event; an end bounded by an adopted temporal relation whose effective date cannot be read stays `undetermined` as now (that end is stated, just unread).

## Completion

**Entry applied: T36-15 (N715, N725, N736; K1941, K1973, K2021, K2063, K2092), with CHANGE B2 (K2114) and ANSWER B3 (K2116).**

- **R38 amended.** `version_basis` now reads each named capture's receipts through `provenance.receiptsOfCapture` (R60), one call per capture (`#receiptsOf`). It no longer reads every receipt with `receipts({})`, and it answers exactly as before.
- **R49 `recordedBy({captureSha, extent?, limit?, viewer})`** answers in events R49's shape as K2114 words it:
  - Each extent is `content.canonicalExtent`'s string parsed back to an object. Items are ordered by that string, then record, then field.
  - Clamp 1–500 (default 100); `truncated` by reading one past.
  - **Items:**
    - the standard's own fields: `text`, `portion`, `requires`, `cited_by`, `search`, `copy_claimed`, `version_basis` (cited as `document`), `force_source`, `target.metric`, `target.definition`, and (K2116) `target.period`, `current_through.basis`, `period_basis.from` and `period_basis.to`;
    - a force's `citation` and `criteria`;
    - an adoption's `citation` and an imposition's `citation`;
    - an in-force-through record's `source`.
  - `by` is the act's author and `at` its instant. `withdrawn` is true for a superseded standard and for a withdrawn force or record. A proposal is never an item, and no item carries text.
  - **Sight:** a row is answered only to a viewer who may read its standard (R14, R37).
  - **When it answers no items:**
    - the capture is not held, or the viewer may not see it (checked through provenance's `register` and content's rows);
    - the digest is not 64 hex;
    - membership refuses the viewer.
  - **Refusals:**
    - `VIEWER_MISSING`: the viewer is absent or empty.
    - `NO_SHA`: answered through `extraction.noSha`.
    - `EXTENT_MALFORMED`: the extent is not an object of a `CONTENT_EXTENT_KINDS` kind.
    - `VIEWER_MISSING` and `EXTENT_MALFORMED` are answered `{ok: false, refused, code, reason, why}` and have no catalogue row (K2116).
- **R50.**
  - `inForceThroughRecord` (op `standardinforcethrough`) has its refusals in R50's order, with `STANDARD_FIELD_UNKNOWN` after the machine refusal. A source with a receipt answers `checked: "retrieved"` with the local day of its latest `last_retrieved` in the view's zone. An upload answers `checked: "stated"`.
  - `inForceThroughWithdraw` (op `standardinforcethroughwithdraw`) and `inForceThroughOf` (op `inforcethroughof`).
  - `standardRead` answers the standing records as `in_force_through`.
  - Two new append-only tables, declared to purge as R14 declares the rest: `standard_in_force_through` and `standard_in_force_through_withdrawals`.
  - Four new rows: C-112.59 `THROUGH_INVALID`, C-112.60 `THROUGH_NO_SOURCE`, C-112.61 `THROUGH_AFTER_CHECK`, C-112.62 `NO_SUCH_RECORD`. They await stamp (rule 5, red 4).
  - `FORCE_TEXT_NOT_HELD` is now minted at one site, `refuseTextNotHeld` (DEC-49). R35 and R50 both answer it, and C-112.41's `where` was moved there.
- **R51.**
  - The latest standing `through` decides a date inside `{from, to: through}` as `in_force`, where the end is not stated (a null `to`, or an end event with no when). The why reads "known in force through <through>, from capture <sha12>, <extent>, recorded by <author>".
  - Every other case answers as before: a stated end, an override, codifier lag, and two versions covering the date all decide first. A stated end answers the record beside it (`in_force_through` on `inForceAt`).
  - R7 and `bindsAt` read R51 through R20.

**Tests:**
- New `test/m/standards/t36.test.mjs`: six tests naming R38, R49, R50 (with R37) and R51 (with R7 and R43). Each new arm is named explicitly (K874).
- The fixture takes a `provenance` wrapper, so R38's test spies on which receipts are read.
- `invariants.test.mjs`'s table list and R12 key list now include the new tables and R5's `in_force_through`.
- Standards: 72 tests, 72 pass, 0 fail.

**Users' tests** (22 modules plus `system/migrate-released`). I ran them on this branch and on `tranche/T36` side by side:
- Same as the tranche, all expected reds:
  - progressions `order.test.mjs` R41 (red 16);
  - op-declarations ×3 (reds 13 and 17);
  - answer-envelope ×2 (reds 11 and 18).
  - Everything else passes.
- **One new red: affordances `catalogue.test.mjs`:583 (R3 R7 R12).** It pins layer 9's op maps to exactly 62 ops, and now sees `inforcethroughof`, `standardinforcethrough` and `standardinforcethroughwithdraw`. It is affordances' to clear: each op needs its NON_ACTS reason or a read entry. See REPORT below.

**Checks** (process repository):
- format: 135 modules, 0 failures.
- architecture: standards, 0 failures.
- coverage: 42 of 42 live ids named, 0 failures.
- ownership vs `tranche/T36`: 7 files, 0 failures.

**Found in other modules:**
- **affordances.** Its R3/R7/R12 catalogue test (`catalogue.test.mjs`:583) needs standards' three R50 ops, as T36-30, T36-35 and T36-37 take them for op-grades, op-declarations and control-plane (K2092). No entry names affordances for them.
- **plane bundle.** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from my source change, and is regenerated at layer close (§14).

**Deferred:** nothing. R45 gains words for "known in force through" when the design stream gives them (the requirements' T36 suggestion).

**P6 size:** 3,308 lines in `src/standards/` (2,938 at the opening, +370). This is under the ~4,000 split mark.

**Reading set (§17 (3); START measured 673 KB, over 300 KB):**
- **Read whole myself:**
  - `build/requirements/standards.md` (both versions, after B2 and B3);
  - layer 5's row of `build/layers.md`;
  - the plan's opening rules and T36-15, and K1941, K1967, K1973, K2021, K2063, K2092;
  - the used services my entry names:
    - events R49;
    - provenance R16, R60 and the `receiptsOfCapture` code;
    - content R2, R5, R6, R45 with `canonicalExtent` and `extentRelation`;
    - civil-time R1, R6, R22, R23;
  - the code my entry changes: all of `src/standards/` (index, schema, checks, words);
  - `test/m/standards/fixture.mjs`.
- **Read by a worker:** the other nine test files in full. Its summary (~2,400 words) cites file:line for:
  - which ids each test names;
  - the fixture's setup;
  - every R38, R20, R7 and R43 expectation;
  - the exact-set pins (tables, answer keys, ops, catalogue rows);
  - the tests that read source text.
- Nothing it left out mattered: the two pins it flagged (the table list and R12's key list) were the two tests that changed.
- `instrument.mjs` was not changed and not read whole, because nothing in this entry touches instrument keys.

Size (session_01FvLsCYfWE4S9eeTYtQuB5d): test runs 12, module lines 3,308

## J2 · COMPLETE

T36-15 complete on job/T36/standards (record's Completion). R38, R49 (with K2114, K2116), R50, R51 met; standards 72/72; format, architecture, coverage (42/42), ownership pass. Users' tests match tranche/T36 except one new red: affordances catalogue.test.mjs:583 (R3 R7 R12) pins layer 9's op maps at 62 and now sees standardinforcethrough, standardinforcethroughwithdraw, inforcethroughof; affordances' to clear (no T36 entry names it for K2092's ops). Plane bundle stale (§14). Size 3,308 lines.
