# publish-schedule (T41)

**Status** · session_01GCuXKM9tA8NjwoR4rFdWhv · depth 2 · WORKING · handled B2

## Completion (PUBLISH-SCHEDULE #1, T41-37)

**Paths and tests (for `modules.json`, BOB's; K1043).** `paths`: `bio-plane/src/publish-schedule/` (`index.mjs`, `schedule.mjs`, `schema.mjs`, `checks.mjs`). `tests`: `bio-plane/test/m/publish-schedule/` (`fixture.mjs`, `t34.test.mjs`, `t35.test.mjs`, `t39.test.mjs`, `seam.test.mjs`). **Final `uses`:** `civil-time`, `jurisdictions`, `record-core`, `membership`, `publication`, as `modules.json` holds them (`record-grammar` not used, the map's doubt 6). The tests import `publication`'s fixture (an earlier module's), and reach the host's case-carriage through `publication.caseCarriage`, so they import no module outside these `uses`.

**Entry applied (T41-37; N823, K624, K2438, K2471, K2483).** Built by copy of publication's publishing at a set time, the map's §2:
- `schedule.mjs`: `publication/schedule.mjs` whole, SQL unchanged; ids re-labelled (R66–R69 → R1–R4, R70's share → R5, R71 → R6, R74 → R7, R33's C-122.5 → R9); `p.hasCaseStanding` → `p.publication.hasCaseStanding` (publication R1); `signedAtFor(p, case, edition, commitAt)` became R5/R8's `signedAtOf(case, edition)`, answering null when the edition does not wait (the commit's instant then stands, publication R70); `isWaiting` and `signedAtOf` never throw (R8).
- `index.mjs`: the class `PublishSchedule` with the fields `#publisher`, `#publishListeners`, `registerScheduledPublisher`, `scheduledPublisher`, `onPublishScheduled` (`membership.listenerRefusal`), `publishListeners`, the delegates (R1–R4, R7, `groupZone`), `isWaiting`, `signedAtOf`, `waitingEditions()` (R8's source); the factory `publishScheduleOf(host, deps)` (K61: migrates, declares, registers R8 only when `publication.registerWaitingEditions` exists, K2483); `publishScheduleOps(ps, url, body)` with `publishatmove`, `publishatcancel`, `publishschedule` (`by`, `viewer` the control plane's stamps).
- `schema.mjs`: the `scheduled_editions` DDL and two indexes, copied (`CREATE TABLE IF NOT EXISTS`, a running store's rows kept); its purge entry `{keys: [], whole: "state <> 'published'"}` with publication's classes (`clear`, `none`, `admin-only`, `stored`, sight `group`).
- `checks.mjs`: row C-122.5 `SCHEDULED_CHECK_UNAVAILABLE` in the family `PUBLISH_SCHEDULE_CHECKS`, number, code and translation unchanged, `where` re-pointed to `src/publish-schedule/schedule.mjs unchecked > is-scheduled-check-available` (the DEC-49 region moved with `unchecked`). The family name is mine (a C-122 row in a file of its own; BOB's to rename if it prefers).
- D54 (rule 4 (11)): the copies of `t34`:300 (R68 → R3) and :375 (R69 → R4) re-stated: an administrator and the founder outside a hidden project get R3's one `NOT_WAITING` answer, byte-identical to no standing, and R4 answers them none; the negative control sets the project discoverable (membership R45, by its owner), where both see it whole (R3 then `NOT_A_CASE_OWNER`, R4 every edition) and an outside member still none.

**Reading set (mechanics §17).** Measured at about 150 KB (my requirements 14 KB, the map 22 KB, the copied code: `schedule.mjs` 312 lines, `index.mjs` 1–240, 270–362, 1750–1775, 2527–2612, `schema.mjs` 1–20 and 480–650, `checks.mjs` whole; the moved tests `t34` whole, `t35` 1–30 and 165–240, `t39` 1–30 and 120–170, `fixture.mjs` whole; the used services: publication's Purpose, R1, R21, R40, R77; membership R43–R45; record-core R21 and `declareTable`/`declaredTables`; layer 8's row and N823 section of `layers.md`; the rulings START names), under 300 KB, so read whole by me; no worker summary was needed.

**Deferred.** None.

**Found in other modules (REPORT J1).**
1. `answer-envelope`: its totality test (`families.test.mjs`:49, already red under rule 4 (16)) also lists `bio-plane/src/publish-schedule/checks.mjs PUBLISH_SCHEDULE_CHECKS` (and `index.mjs`' re-export) once my paths are in `modules.json`. `CHECK_FAMILY_FILES` should gain `["src/publish-schedule/checks.mjs", …]` directly after publication's file (T41-60, with rule 4 (16)'s other families). Until it does, C-122.5 reaches the wire only through publication's copy, so from T41-36's deletion until T41-60 `dec49Row("SCHEDULED_CHECK_UNAVAILABLE")` answers null.
2. `promotion` (the census): from my merge until T41-36 two row objects hold C-122.5 (publication's and mine, identical but `where`); at T41's stamp the row is one CHANGED (`where` re-pointed, words unchanged), as the map's §6 says.
3. The window (accepted, rule 4 (13)): publication's own `schedule.mjs` copy and mine run over the same table until T41-36; each holds its own publisher registration and `TAKING` set, so only the instance `ratification` and `scheduler` drive (publication's, until T41-39 and T41-49) takes due editions.

**Tests.** `node --test test/m/publish-schedule/` (from `bio-plane/`): `ℹ tests 21`, `ℹ pass 19`, `ℹ fail 2`. The two reds are the named ones:
- `seam.test.mjs`:127, "R8 (against the real publication; red by name from T41-37's merge until T41-36's, K2483)": publication offers no `registerWaitingEditions` yet;
- `seam.test.mjs`:178, "R10 (the owner arm; red by name … plan rule 4 (13))": `declareTable` answers `TABLE_DECLARED` (declared by publication); R10's purge-class arm (`seam.test.mjs`:148) passes.
publication's own `t34`/`t35`/`t39` unchanged (25 pass, 2 fail: its :300 and :375, rule 4 (11), as before). No layer tests (manifest). No service another module uses changed.

**Checks** (process repository, with my paths and tests written into a scratch copy of `modules.json` and the files staged; reverted, BOB writes them):
- `format`: 145 modules, 144 requirements files; 0 failures
- `architecture publish-schedule`: 9 product files, 26 relative imports; 0 failures
- `coverage publish-schedule`: 11 of 11 live requirement ids named by a test; 0 failures
- `ownership publish-schedule tranche/T41`: 10 files changed by publish-schedule between tranche/T41 and HEAD; 0 failures (with the scratch `modules.json`; against the committed one, which still names no paths, each file reads "outside publish-schedule's paths" until BOB writes them)

Size (session_01GCuXKM9tA8NjwoR4rFdWhv): test runs 10, module lines 567

## J1 · REPORT

Two findings in other modules (record, Completion, items 1-2). (1) answer-envelope: once my paths are in modules.json, families.test.mjs:49 (already red, rule 4 (16)) also lists bio-plane/src/publish-schedule/checks.mjs PUBLISH_SCHEDULE_CHECKS (C-122.5). CHECK_FAMILY_FILES should gain src/publish-schedule/checks.mjs directly after publication's file (T41-60, with rule 4 (16)'s families); from T41-36's deletion until then dec49Row("SCHEDULED_CHECK_UNAVAILABLE") answers null. Proposed: name it in rule 4 (16). (2) promotion census: from my merge until T41-36 two row objects hold C-122.5 (identical but where); at T41's stamp it is one CHANGED row, as the map's §6 says.

## J2 · COMPLETE

T41-37 done; record Completion has the detail. paths: bio-plane/src/publish-schedule/ ; tests: bio-plane/test/m/publish-schedule/ (please write them into modules.json); final uses unchanged (civil-time, jurisdictions, record-core, membership, publication). Tests 19 pass / 2 fail, the two named reds: seam.test.mjs:127 (R8 against the real publication, until T41-36, K2483) and seam.test.mjs:178 (R10 owner arm, TABLE_DECLARED, rule 4 (13)). D54 copies of t34:300/:375 re-stated with a discoverable-project negative control. format 0, architecture 0, coverage 11/11, ownership 0 (with the paths in a scratch modules.json). Module 567 lines.

## CHANGE B2 (K2529)

Merged `tranche/T41` (R8's text). R8's source gains `signerOf(caseId, edition)`: `{signer, delivered_by}` while the case edition waits, else null; synchronous, reads only `scheduled_editions`, writes nothing, never throws (`schedule.mjs` `signerOf`, the instance method, and `waitingEditions()` now three doors). Tested in `seam.test.mjs`'s R8 stand-in test: the answer while waiting, null before setting, for another case edition, another edition, malformed ids, after a cancel, and with the table dropped (negative controls); the source has exactly the three doors.

Tests: `ℹ tests 21`, `ℹ pass 19`, `ℹ fail 2` (the same two named reds, `seam.test.mjs`:127 R8 real publication, :178 R10 owner arm). Checks (scratch `modules.json` with my paths): format 0 failures; architecture 9 files, 26 imports, 0 failures; coverage 11 of 11; ownership 10 files, 0 failures.

Size (session_01GCuXKM9tA8NjwoR4rFdWhv): test runs 12, module lines 582

## J3 · COMPLETE · re B2

CHANGE B2 (K2529) applied: R8's source now gives signerOf(caseId, edition) -> {signer, delivered_by} while waiting, else null (synchronous, my table only, never throws), tested with negative controls in seam.test.mjs's R8 stand-in test. Tranche merged. Tests 19/2, the same two named reds (seam.test.mjs:127, :178). format, architecture, coverage 11/11, ownership 0 (scratch modules.json). Module 580 lines.
