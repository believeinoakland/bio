# machinery-producers (T51)

**Status** · session_012Guji6Q9psWn5A5A16kTPi · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

T51-244 · machinery-producers · words pass (K3949, K3957, K3962): done.

Applied (T51-244):
- The 11 sentences the check flagged in `bio-plane/src/machinery-producers/index.mjs` (8 plain, 3 inline) now read through `localize` with a fixed id `machinery-producers.index.<slug>`: the age and basis details of the cool-off, session, manifest, request, archive-fallback, recheck and sweep producers, and the machine-writer and archive-eligibility basis details. The wording is unchanged; the joined multi-line literals are now one literal each.
- The 5 test copies (`conditions.test.mjs` 51 and 77; `invariants.test.mjs` 197, 207, 209, 210) no longer hold a sentence. They assert a fragment under the copy length, a filled value (`HOST`, the partial capture's `tick`), `age.state` with a string detail, or equality with `word("machinery-producers.zone_undetermined")`. The line numbers in the words-pass file had drifted; I worked from the check's current list. Finding 210's continuation (words-pass 211) is covered by the same edit.
- No `words.json` row was needed; `rows.mjs` and `words-unreviewed.json` were not touched.

Deferred: none.

Found in other modules (not changed here; for BOB):
- architecture (`checks/run.mjs`): `answer-envelope/page-policy.test.mjs` imports `bio-plane/src/signpage.mjs` of control-plane, which is not earlier in the order.
- coverage (`checks/run.mjs`): 25 modules name no test for some live ids (e.g. installer-steps 36 of 36, interface-shell 14 of 100, screens-inquiry 14 of 79).
- words (tree-wide): 1081 failures; the L11 run has 1052, none naming machinery-producers. Their inline, testcopy and handlist findings are other modules'.
- setup-words `build.mjs --check`: `rows.mjs` is stale (expected; it lacks the new `machinery-producers.index.*` ids). BOB regenerates it at the layer close. No refusal names this module.

Tests and checks run:
- `node --test test/m/machinery-producers/` (bio-plane): tests 35, pass 35, fail 0 (baseline and after each change).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio machinery-producers`: 7 product files, 34 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio machinery-producers`: 1 modules, 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio machinery-producers tranche/T51 job/T51/machinery-producers`: 4 files changed by machinery-producers; 0 failures.
- `node checks/words.mjs /home/user/bio machinery-producers`: 0 failures (was 16).
- `node checks/words.mjs /home/user/bio <every L11 module>`: no finding names machinery-producers.
- `node checks/run.mjs /home/user/bio`: format 0 failures; channels 0 failures; architecture, coverage and words failures only in other modules (above).

Size (session_01AQjNeHrfYEMFNuKKN2Sh1H): test runs 3, module lines 1188

## J2 · COMPLETE

T51 fix round 6, G25 (BOB #253, wave 2; B2 START): a parked large fetch is not a partial capture. Done.

**Root cause (rule 1).** `#conditionsPartialCapture` (`bio-plane/src/machinery-producers/index.mjs`, was :389-420) raised `partial-capture-outstanding` for every live `capture_sessions` row from `capture.liveCaptureSessions` (:395). ACQUISITION #28 parks a large fetch in that table (`state.fetch_pending`, primary digest 64 zeros, `acquisition/index.mjs:392, 1253`), so it was told as "primary captured, subrequest ceiling reached" when nothing had been captured.

**Why the tests missed it (rule 2).** The module's tests held only sessions of the old shape (a real primary digest, a `queue`), written before acquisition parked fetches in the same table. Gap closed by the test below, which drives a parked fetch through `conditionItems`.

**Change.** `index.mjs:396-398`: a row whose `state.fetch_pending` is held is skipped (it also covers one that ended with `fetch_pending.failed`, which is still no capture). 3 lines, no new sentence, no words row owed, no census op touched, no stored data (derived on read, so nothing to repair).

**Failing-first test (rule 3).** `test/m/machinery-producers/conditions.test.mjs`, "R2: partial-capture-outstanding is not raised for a large fetch parked as owed work (fetch_pending, no primary yet); control: a real partial capture still is, beside it (G25, K4577)": a parked fetch session and a failed one make no item; control: a real partial capture beside them is still raised, and only it. Red before the fix (actual: two items, `cs_parked` and `cs_failed`, expected none); green after. Rule 4: platform check N.

**Tests and checks.**
- `node --test --test-force-exit test/m/machinery-producers/`: tests 38, pass 38, fail 0 (before the fix, 37 pass, 1 fail, the new test).
- Users (`impact.mjs origin/tranche/T51 HEAD`, 6 modules): queue-producers 152/152 pass (24 files), queue + store-door 266/266 pass, plane + control-plane named files 402 tests, 400 pass, 2 fail. The 2 fails are NOT from this change: they fail identically with `machinery-producers/index.mjs` restored to the tranche tip: `test/m/plane/release.test.mjs` "R24 (DEC-149; T34-87, K1784; T51): a title or purpose a surface draws is the screen's own key ... never 'this instance' ..." (plane) and `test/m/control-plane/t51-visitor-copy.test.mjs` "R104 R100 R99 (E8): a capture with the visitor view, the object restarted, 'Finish it' ... the visitor copy is a second document in the held list and in the record, once" (control-plane). B2 listed no inherited reds, so I report them for BOB; neither is in my module.
- `checks/format.mjs`: 176 modules, 176 requirements files; 0 failures.
- `checks/architecture.mjs machinery-producers`: 8 product files, 38 relative imports; 0 failures.
- `checks/coverage.mjs machinery-producers`: 16 of 16 live requirement ids named by a test; 0 failures.
- `checks/words.mjs machinery-producers`: 0 failures (the words count does not rise: no string added).
- `checks/ownership.mjs machinery-producers tranche/T51 job/T51/machinery-producers`: 3 files changed by machinery-producers; 0 failures.
- `setup-words build.mjs --check`: the stale-rows note only (docket.declared.docketprepare), no refusal naming this module.

**Requirement line proposed (BOB writes `build/requirements/`).** Under R2, `partial-capture-outstanding`: "per live capture session that holds a capture's primary; a session capture parks as owed work (`state.fetch_pending`, `acquisition` R105) has captured nothing and raises none (G25; K4577). Test: a parked and a failed fetch raise none; control: a real partial capture still does."

Deferred: none. Found in other modules: the two reds above (plane R24 words test; control-plane visitor-copy E8 test).

Size (session_01VppNH1AogWHLFTYzaoCTBZ): test runs 7, module lines 1192

## J3 · COMPLETE

T51 fix round 10, Wave B, batch 6 (BOB #292; B3 START): the 10 fixture lines re-pointed. Done.

**Lines (all 10 at zero in `checks/fixtures.mjs . machinery-producers --list`; 1 accepted, below).**
- provenance/homeOfHomed (4): conditions.test.mjs:23-24, invariants.test.mjs:35,119, producers.test.mjs:26 now take `homeOfHomed({[sha(..)]: bundleId})` from `provenance/fixtures.mjs`; the sessions' `primarySha` became the 64-hex digests the real `homeOf` answers for (a non-hex stand-in is not a digest).
- provenance/homeOfEmpty (1): world.mjs `defaultFakes` no longer holds `provenance: {homeOf: () => null}`; `world({provenance})` takes the real instance (default `homeOfEmpty()`, made on the first ask), with `registeredFor` still the real one over the world's own storage.
- monitoring/monitoringReads (5): world.mjs exports `READS = await monitoringReads()`; the default monitoring answers are `READS.empty`'s; `busy()` and the R6 test use `READS.seeded` (bundle `unscheduled`, address `gone`); producers.test.mjs's N229/N330 test uses the real seeded items and page, setting only what it varies (the page's `truncated`/`paused`, and `due_at`/`interval_ms` of two due items, since the fixture's `due` item has never been checked and is never overdue), reading at `READS.seeded.now`.

**Markers added (K5060).** One: `producers.test.mjs:88` `// fixtures-own: synthetic` — monitoring publishes no not-ok `archiveEligible` answer (only `flaggedRefusal` for `flagged`); the line is monitoring's real eligible page with `ok` turned false, to show the list is not read from a not-ok answer. No `fixtures-generic`. For BOB, monitoring (P9): a fixture `archiveEligibleRefusal` and an overdue `due` item in `monitoringReads` would remove that marker and the `due_at` override.

**Flaw in my own module, fixed (P8).** `whole-rows.test.mjs` R16 was red at the branch point: its rows were the old part-keyed register (provenance R74 keeps wholes in `register`, parts in `register_parts`), so `registeredFor` answered four rows. The test now writes the whole and its parts as R74 does; `index.mjs` (#gradeNotes) drops its dead `part_of` filter (`registeredFor` answers wholes only, R73). No new sentence, no words row, no census op.

**Tests and checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/machinery-producers/*.test.mjs`: tests 38, pass 38, fail 0 (before: 37 pass, 1 fail, R16).
- Users (`impact.mjs origin/tranche/T51 HEAD --json`, 149 files of queue-producers, queue, store-door, control-plane, plane): tests 1085, pass 1084, fail 1: `plane/release.test.mjs` R24 (screen names/words), the red the earlier record already names as not from this module; I did not re-run it on the base.
- `checks/run.mjs`: format 0 failures; architecture 0; words 0 (no string added); fixtures: none in this module; coverage 16 of 16 live ids named in this module (the run's 7 coverage failures are other modules').
- `checks/ownership.mjs machinery-producers tranche/T51 job/T51/machinery-producers`: 7 files changed by machinery-producers; 0 failures.
- `setup-words build.mjs --check`: stale-rows note only (basis-version-grammar), no refusal naming this module.

Deferred: none.

Size (session_012Guji6Q9psWn5A5A16kTPi): test runs 6, module lines 1192
