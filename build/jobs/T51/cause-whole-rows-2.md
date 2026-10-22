# cause-whole-rows-2 (T51)

**Status** · session_017xrsneguU1xum1pmphBbk5 · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T51 fix round 4b, job 17 (cause-whole-rows-2): retrieval-browse **R19** and machinery-producers **R16** are met; each meets a capture held in parts as one capture, through provenance's marks (R73), never re-deriving parts. Applied on `job/T51/cause-whole-rows-2`, pushed, no pull request. Nothing deferred, no open QUESTION. R-OLD: no stored data changes; both reads only change what they ask of the register. No new `localize` sentence (K4269).

**What changed (file:line, on the job branch).**
- retrieval-browse R19, `find.mjs:76-84` (`holdOf`): the batched read now takes the register's `whole` column too (provenance R48); for the bundles of the batch that hold a whole's row, `partsHeldIn` asks provenance for the part rows' digests (`part_of`, R73) and `keep` skips them. A bundle with no whole's row is never asked, so the batch costs what it did. `index.mjs` (`partsHeldIn`, beside `entitiesFor`) and `marks.mjs` (`provenanceFor`, the host's own provenance unless a caller hands one as `provenance`; null with no host, and then rows are taken as they stand) hold the one read. The `capture` scope is unchanged (a capture named by its own digest).
- machinery-producers R16, `index.mjs:443-451` (`#gradeNotes`, bundle branch): reads `provenance.registeredFor(bundle)` (R11, R73), skips rows with `part_of`, keeps the option bound of 8 after the skip, in capture-sha order as before. The request branch (one digest) is unchanged.

**Tests, red then green (new `whole-rows.test.mjs` in each module's tests, ids named in the titles; the three-part fixture is a capture of 8 MiB + 8 MiB + 4 MiB 17 bytes).**
- retrieval-browse: 4 tests, 2 fail before (bundle scope: `scope.captures` 4, wanted 1; project scope: 5, wanted 2) and 4 pass after. The fixture promoted by the real chain (the parts alone in `register`, provenance R72 writes the whole's row); the control: a bundle of two single captures counts 2 and finds both, a hidden three-part bundle counts none.
- machinery-producers: 2 tests, 1 fails before (`basis.grade_notes` names 4 captures, wanted the whole alone) and 2 pass after; the control: two single captures name two notes, a capture request names its own digest's note. `world.mjs` gained a default `provenance.registeredFor` over the real provenance on the same storage (a test's own `provenance` fake keeps its `homeOf`; its `registeredFor` is the real one unless it gives one).

**Suites (`node --test --test-force-exit`).** retrieval-browse 55 tests, 55 pass (51 before); machinery-producers 37 tests, 37 pass (35 before). Users: retrieval `delegation.test.mjs` with queue-producers' tests: 156 tests, 156 pass.

**Checks** (`/home/user/cp-close`, `prep/T51-close-v2`): `format` 175 modules, 0 failures; `architecture` retrieval-browse 16 files and machinery-producers 8, 0 failures; `coverage` retrieval-browse 19 of 19, machinery-producers 16 of 16, 0 failures; `ownership` (retrieval-browse, machinery-producers, `tranche/T51` to the job branch) 0 failures; `run.mjs`: format 0, architecture 0, coverage 6594 of 6594, channels 0, words 0 failures, words 18421 (unchanged, no finding in my files).

**Requirement lines I propose (BOB writes them).**
- retrieval-browse R19: mark it met (T51). Uses: `provenance`'s `registeredFor` (R11, R73: `part_of`) and `register.whole` (R48). R14's `deps`: add the optional `provenance`, handed or made from `host`, as `entities` and the recorders are.
- machinery-producers R16: mark it met (T51). Uses: `provenance`'s `registeredFor` (R11, R73) for R3's bundle-keyed notes (the 8-capture bound counts after the parts are left out).

**Found in other modules (not changed).** None new. (`attestation.register_row_names` stale after R72 is already BOB's, from job 16.)

Size (session_017xrsneguU1xum1pmphBbk5): test runs 14, module lines 45 (30 added and 15 removed across 4 source files; 159 lines of new tests in 2 files).
