# queue-producers (T23)

**Status** · session_01VWLZGzfGaCwu5Hyy2jW2Gc · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Reds in the users' suites and a stale artifact, from this job (06757da646).

1. **queue (`test/m/queue/`): 20 red, 18 of them new and caused by queue's stand-ins, not by queue's code.** R26 makes `feedItems` call `monitoring.sweepConditions` (monitoring R63). Queue's fake `monitoring` (`bio-plane/test/m/queue/world.mjs`:129) has no `sweepConditions`, so every feed read in queue's tests throws `this[#monitoring].sweepConditions is not a function`. The 18 are `feed.test.mjs` R7, R8 (×3), R11, R12/R13 (:184), R14/R31, R16, R32/R33, R39, R40, R30, R6/R8, `peritem` R8, `queue-state` R21/R30/R40, `d125-findingmute` R14/R20, and the two caller's-fakes tests (R8 with R12 for K899 (7); R8 with R15–R21 for K728/K921). The other 2 are accepted red 13 (`catalogue.test.mjs`:34, :116). I checked a scratch copy with `sweepConditions: () => ({ ok: true, conditions: [] })` added to that fake and did not commit it: 90 pass and 3 fail, namely red 13's two and `feed.test.mjs`:206, the `publication: { exportLog }` stand-in you named. **Queue's job needs to:** add `sweepConditions` to its monitoring fake; move `exportLog` to `corpusExport: { exportLog }` (`world.mjs`:124, `feed.test.mjs`:206); and add `"corpusExport"` and `"networkNotices"` to `Queue.PRODUCER_DEPS` (`queue/index.mjs`:102) so a caller's fakes reach the producers. Without `networkNotices` there, queue's tests use the host's real network-notices instance. That worked in the scratch run.
2. **control-plane: 114 of 116.** The 2 reds are `families.test.mjs` R22 (K1150, until control-plane's merge) and `inbox-door.test.mjs` R36 (red 9).
3. **plane: 36 of 36.**
4. **Whole `bio-plane/test/m`: 5191 tests, 5158 pass, 22 fail.** The 22 are the 20 queue reds in (1) and the 2 control-plane reds in (2). No other red.
5. **Generated artifact.** My change under `bio-plane/src/queue-producers/` makes the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) stale. I regenerated nothing.
6. **Requirements (yours to word).** Uses line `build/requirements/queue-producers.md`:103 can drop "reached through publication's `exportlog` delegate until N483". Add `corpus-export`: `exportLog` (its R2), `EXPORT_LOG_LIMIT_DEFAULT`. The R8, R26 and R27 marks `*(not yet met: T23 …)*` can be struck. publication's re-export of `EXPORT_LOG_LIMIT_DEFAULT` is no longer imported by this module (N501).

## J2 · COMPLETE

Job complete (06757da646 on `job/T23/queue-producers`; tranche/T23 had no change to a file I read). B1 handled.

**Entries applied.**
- **N483 (K1122).** `EXPORT_LOG_LIMIT_DEFAULT` is now imported from `corpus-export`. `#findingsExportPerformed` reads `exportLog` from a new dep `corpusExport`, which defaults to `corpusExportOf(host)`. `#publication` keeps only `caseTensions` and `caseDocumentFacts`. My stand-ins were moved to `corpusExport: { exportLog }`.
- **R26.** `#conditionsSweep` reads `monitoring.sweepConditions({viewer, now})` and makes one CONDITION per condition of the five `sweep-*` kinds, keyed `CONDITION::<kind>::<bundle>#<id>`.
  - Recipients: members of the sweep's project who may see its bundle. The project is `record-core.bundleInfo`'s project, or the bundle itself if it is a project. A member is a participant joined or leaving (membership R74). A caller with no member gets nothing, and so does a sweep in no project. A bundle the viewer may not see yields no item (R11).
  - Subject: the bundle (with the sweep name). Homed under the project at depth 0 plus the walk from the bundle. Options: `optionsOf([bundle])`. `age` runs from `since`, undetermined when `since` is missing.
  - The condition's `detail` is carried whole as `basis.condition` and said in the item's sentence.
  - It leaves when monitoring stops answering it.
- **R27.** `#conditionsNotice` covers each project the member owns, at most 50 (the existing `#ownedProjects`), through `networkNotices.noticesOf({project, viewer})`, a new dep `networkNotices` that defaults to `networkNoticesOf(host)`. Keys are `CONDITION::<kind>::<notice>`, recipients are `projectOwners`, the item is homed under the project, and no `due` is set (R25).
  - `notice-attestation-missed`: an open notice whose latest missed monthly has had no monthly published after it. It leaves when one is issued. Options are the project's.
  - `notice-lapse-near`: an open notice whose `lapse_date` is at most 7 days away. Aged from the day the window opened. Offers `noticeprepare` (revise or stop). It leaves when `lapse_date` clears, on a stop, or at the lapse.
  - `notice-project-closed`: status `closed`, until 30 days after the `closed` attestation. Offers `noticeprepare` (the stop). It leaves on a stop.
- **R8.** `feedItems` appends both producers after R23. Items carry no disposition or catalogue_id and use R24's words. The eight kinds are in observation-log's vocabulary already; queue classes them.
- **Words.** The sentences are plain placeholders that state the fact. NOTIFICATIONS.md and UC-035 give no wording for these items, so the words remain the UX design stream's to set (cited in the code).

**Deferred.** None.

**Found in other modules.** See my REPORT just before this entry: the queue stand-ins and PRODUCER_DEPS that queue's job must change, the stale plane bundle, and my Uses line.

**Tests.**
- New `sweeps.test.mjs`, 8 tests:
  - R26 ×2: all five kinds arriving and each one leaving; key, subject, age and detail; non-member, no member, hidden bundle, bundle in no project, malformed name.
  - R27 ×3, one per kind: arriving, leaving, the window edges, non-owner and owner of another project, no member.
  - R8 over them: homes, options, no disposition, R24's words.
  - N483 ×2: the finding reads the `corpusExport` dep and never publication's; and with no dep handed in, it reads the host's real `corpusExportOf` instance, told to an administrator and nobody else.
- Edited stand-ins: `world.mjs`, `feeditems.test.mjs`, `producers.test.mjs`.

**Runs.**
- `test/m/queue-producers/`: 67 pass, 0 fail.
- `test/m/queue/`: 73 pass, 20 fail (see the REPORT).
- `test/m/control-plane/`: 114 pass, 2 fail (both accepted).
- `test/m/plane/`: 36 pass, 0 fail.
- Whole `bio-plane/test/m`: 5191 tests, 5158 pass, 22 fail, all named in the REPORT. 18 of them are new in queue's own stand-ins, which queue's job fixes.
- Checks: format, 87 modules, 0 failures; architecture, 14 files, 54 imports, 0 failures; coverage, 27 of 27 live ids, 0 failures; ownership, 6 files, 0 failures.

Size (session_01VWLZGzfGaCwu5Hyy2jW2Gc): test runs 11, module lines 3209
