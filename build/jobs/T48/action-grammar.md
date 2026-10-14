# action-grammar (T48)

**Status** · session_01CNDXq4JnEj1g1Bx9AzFdVT · depth 2 · COMPLETE · handled B4

## Completion

**Read** (whole): `build/requirements/action-grammar.md`; `build/plan/current.md` T48-46 entry; B1 START; `checks.mjs` rows C-32.4, C-33.5–.9 and `ACTION_GRAMMAR_WORDS`; `golden.json` rows; `t45-rows.mjs`, `t46-words.test.mjs`, `t47.test.mjs` (R28) as the tests naming the requirements changed. Other tests run, not read. Not read: `build/layers.md` (no contract change touched; the job moves no code across layers).

**Entries applied (T48-46)**
- R29: `checks.mjs` rows C-32.4 `MACHINE_CANNOT_CORRESPOND` → `src/action-records/index.mjs correspondFence > is-machine-correspond`; C-33.6 `BAD_DATE`, C-33.7 `CAPTURE_AND_TESTIMONY`, C-33.8 `NEITHER_CAPTURE_NOR_TESTIMONY` → `src/action-records/index.mjs correspondEntryRefusal > is-correspond-entry`; C-33.9 `UNREGISTERED_ARTIFACT` → `src/action-records/index.mjs unregisteredArtifact > is-correspond-artifact`; C-33.5 `BAD_DIRECTION` stays `actions`', its `where` now `src/actions/index.mjs actionCorrespond > is-correspond-direction`. Check, code, number and translation unmoved. `golden.json` follows. New `t48.test.mjs` names R29 (six tests, with controls). `t47.test.mjs`'s R28 "no other row moves" test now allows the five rows R29 adds.
- N1053: `ACTION_GRAMMAR_WORDS`' two strings (`MACHINE_CANNOT_SET_PARTNERS`, `PARTNERS_REFUSED`) re-taken in American spelling ("organizations"/"organization"), equal to `words.json` again; this cleared the four inherited reds (R9 ×2, R26 ×2) in this module.
- C-117.28 `NOT_A_PROCEEDING` retirement (ENTITIES #12 J1): this module's `checks.mjs` holds no such row (grep: none), so nothing to retire here.

**Rows, each `awaiting stamp` (T49):** C-32.4 `MACHINE_CANNOT_CORRESPOND`, C-33.6 `BAD_DATE`, C-33.7 `CAPTURE_AND_TESTIMONY`, C-33.8 `NEITHER_CAPTURE_NOR_TESTIMONY`, C-33.9 `UNREGISTERED_ARTIFACT` (their `where`s changed); C-33.5 `BAD_DIRECTION` (its `where` region changed). The census fixture `row-census-1.75.0.jsonl` and `test/system/row-census.test.mjs` are promotion's (not written here); R29 says the fixtures follow, and the stamp's own lines are the stamp's to take.

**Not yet green, by construction:** two tests — `R28 (the census arm)` (`t47.test.mjs`) and `R29 (the census arm)` (`t48.test.mjs`) — fail only on the six rows above naming regions (`correspondFence`, `correspondEntryRefusal`, `unregisteredArtifact` in `action-records`; `is-correspond-direction` in `actions`) that T48-47 and `actions` R101 create and that are not yet on `tranche/T48`. They pass once BOB's CHANGE says action-records is merged and I merge `tranche/T48`; I will re-run then. Nothing skipped or weakened.

**Deferred / found in other modules:** none. (`actions` R101 must create the `is-correspond-direction` region at `actionCorrespond`.)

**Tests and checks:** `node --test bio-plane/test/m/action-grammar/` 77 pass, 2 fail (the two census arms above). format 0 failures; architecture 0 failures (14 files); coverage 29 of 29 live ids named, 0 failures; ownership 0 failures. `checks/run.mjs` not yet run (to be run at the re-run after the merge).

Size (session_01CNDXq4JnEj1g1Bx9AzFdVT): test runs 6, module lines 4

## J1 · COMPLETE

T48-46 applied: R29 wheres (C-32.4, C-33.6-.9 to action-records; C-33.5 to actions' is-correspond-direction), golden.json, t48.test.mjs, DEC-221 spelling of the two strings (cleared 4 inherited reds). 77 pass; 2 fail = the two census arms (R28, R29), red only because T48-47's regions (correspondFence, correspondEntryRefusal, unregisteredArtifact) and actions R101's is-correspond-direction are not yet on tranche/T48. Send CHANGE when action-records is merged; I will merge and re-run. format/architecture/coverage/ownership 0 failures; checks/run.mjs to run after the merge. Rows awaiting stamp listed in my record. C-117.28: no such row in this module. Needs from actions: R101 must create the is-correspond-direction region.

## Completion after B2–B4 (merged tranche/T48)

- Merged `tranche/T48` (action-records K3278, actions K3281). B3 applied: row C-117.28 `NOT_A_PROCEEDING` removed from `checks.mjs` (entities' C-91.9, R53, is the one site; the two-file window is accepted by name, rule 5 (2)); `grammar.test.mjs`'s R9 tests updated (row list, "by hand" census without .28); `t48.test.mjs` pins the retirement and, for R29, that action-records defines the three sites and actions calls them through `records`.
- **Rows, each `awaiting stamp` (T49):** C-32.4 `MACHINE_CANNOT_CORRESPOND`, C-33.6 `BAD_DATE`, C-33.7 `CAPTURE_AND_TESTIMONY`, C-33.8 `NEITHER_CAPTURE_NOR_TESTIMONY`, C-33.9 `UNREGISTERED_ARTIFACT`, C-33.5 `BAD_DIRECTION` (wheres changed); C-117.28 `NOT_A_PROCEEDING` (departed here; entities' C-91.9 holds it).
- Tests: `node --test bio-plane/test/m/action-grammar/` 80 pass, 0 fail (both census arms now green). `checks/run.mjs` over the product: format 0 failures, architecture 0 failures, ownership 0 failures; coverage reports 26 failures, none in action-grammar (29 of 29 named), all in other modules.

Size (session_01CNDXq4JnEj1g1Bx9AzFdVT): test runs 9, module lines 4
