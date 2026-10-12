# case-check (T46)

**Status** · session_01BBg9JuWWPT7LYa7vpffQYT · depth 2 · COMPLETE · handled B2

## J1 · REPORT

T46-28 built on my branch (2e80f39477) against case-carriage R19–R21 as worded: R2's three lapse reads are now sourcesLapsedSince(text, checked_at), acceptedWorkLapsedSince(fm, by, checked_at), marksLapsedSince(fm, checked_at); a provider lacking them reads undetermined (fail closed). Also fixed in my module (P8): R3's LIKE narrowing dropped _ and % from the id instead of escaping them, so an id holding either was never listed; now escaped, with a test. Read my code and tests whole, and my requirements, case-carriage R19–R21 and my Uses' public parts. Controlled tests 32/32 pass; real.test.mjs's two tests read undetermined until case-carriage's T46-20 merges (expected). format, architecture, coverage (5/5), ownership: 0 failures. Waiting on your CHANGE announcing case-carriage's merge to merge tranche/T46, re-run, and complete.

## J2 · COMPLETE

**Entries applied.** T46-28 (N907; K2833): R2 latches the three lapse causes through case-carriage R19–R21. `#state` asks `sourcesLapsedSince(text, checked_at)`, `acceptedWorkLapsedSince(fm, by, checked_at)` and `marksLapsedSince(fm, checked_at)` in place of the at-the-read reads; `checked_at` is record-core's `stampInstant("second")` (R47's spelling), as B2 requires. A provider lacking a read, or one answering outside its shape, reads `undetermined` (fail closed). Merged `tranche/T46` (K2967) after B2; the real-provider tests now read case-carriage's real interval reads. The requirement's `*(not yet met: T46)*` mark on R2's lapse clause is BOB's to strike (text BOB's).

**Read whole:** my requirements; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test file; case-carriage's public part (R19–R21 among it); the public parts of record-grammar, record-core, membership, publication and case-authoring; layer 8's contract; my plan entry and the opening rules.

**Flaw fixed in my module (P8).** R3's `LIKE` narrowing removed `_` and `%` from the finding id instead of escaping them, so a check whose member id held either was never listed by `heldFindingVersions`. It now escapes them (`ESCAPE '!'`); a new R3 test covers `_`, `%` and `!` ids, with wildcard controls.

**Tests.** state.test.mjs: the T45 "stated gap" test (a lapse undone reads held) replaced by T46's: for each cause, a lapse made after the check and undone before the read reads `void` with that `why`, its control (nothing lapsed since) `held`; a lapse undone before the check does not void it, one still standing does; the reads are asked from `checked_at`, not the read's instant; a case-carriage without the interval reads is `undetermined`. The fixture's case-carriage keeps an append-only lapse history (`w.lapse`, `w.undo`).
- `node --test bio-plane/test/m/case-check/`: tests 34, pass 34, fail 0 (after the merge).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio case-check`: 9 product files, 0 failures. `checks/coverage.mjs bio case-check`: 5 of 5, 0 failures. `checks/ownership.mjs bio case-check tranche/T46`: 5 files, 0 failures.
- `checks/run.mjs` over the product: format, architecture (2950 files) and channels 0 failures; coverage 32 failures, none case-check's (the new layer-11 modules and others' T46 ids, rule 5 (1)).

**Deferred:** none. **Found in another module:** none.

Size (session_01BBg9JuWWPT7LYa7vpffQYT): test runs 4, module lines 421
