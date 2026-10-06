# docprofile (T34)

**Status** · session_01FhABQBQrCTES1CMo1uBCh3 · depth 2 · COMPLETE · handled B1

## Completion (T34-8, N549)

**Applied.** T34-8 as R36 (amended, K1725) states it. The seven copied types (`docprofile/doctypes/{meeting-calendar,meeting-minutes,meeting-agenda,staff-report,regulation,staff-directory,generic}.mjs`) are deleted, with their default registration (K1513 (3)), the registry's static imports of them, its re-export of them by name, and the facade's `meetingCalendarType`. No importer outside `docprofile/` used any of these names (checked across every tracked `.mjs`). The registry starts empty: a type is in it only when a caller registered it through `registerDoctype`. The pipeline, `readText`, the shared helpers (`doctypes/index.mjs`) and the seam are unchanged in meaning. R4 with nothing registered: I read B1 as the fallback in R4 being the `generic` that `doctypes` registers through the seam. With no fallback registered at all, `doctypeFor` answers `NO_TYPE`, the stated no-type answer that K1513 (1) already built: confidence NONE, with a why. R4's text reads consistently with that, so I asked no question. Tests now register stub types through the seam (`docprofile/test/stubs.mjs`: `stub_meetings`, `stub_items`, `stub_fallback`), which read only through this module's exported helpers. The two real-document suites (`doctype-breadth`, `staff-directory`) and their fixtures (`fw18-doctypes.json`, `fw20-staff-directory.json`) were deleted with the types. `doctypes` holds copies of both fixtures, and its R18 and R20 tests cover the types' readings. Module lines: 5,190 → 2,176.

**Deferred.** None.

**Found in other modules (REPORT J1).**
1. **26 tests in 15 files of other modules go red from this deletion.** I checked each of them against the pre-change docprofile: green there, red now. Their suites read documents through `docprofile/registry.mjs` without the composition that registers `doctypes`' types (only `plane`'s `store.mjs` calls `registerReaders`). With the default registration gone, they get the fallback or `NO_TYPE`. The tests are their modules', so I changed none (P7).
   - plane `acquisition`: `bio-plane/test/m/acquisition/profile.test.mjs` ×2.
   - plane `extraction`: `afterread` ×1, `convert-chain` ×2, `pdfstructure` ×1, `read` ×2.
   - plane `monitoring`: `cadence` ×1.
   - plane `reading-pipeline`: `convert-chain` ×3, `convert-ocr` ×3, `convert-tiers` ×1, `emitted` ×1, `hooks` ×1, `pieces` ×1, `read` ×5, `staffdirectory` ×1.
   - `roster-reader`: `test/seam.test.mjs` ×1 (it expects `staff_directory` among `doctypes()`).

   Each needs the same fix: its suite registers the readers before reading, as the plane composes them, through `plane`'s `registerReaders()` or `doctypes`' `registerDoctypes(registerDoctype)`. That is a test-side composition in those modules' jobs. For a plane module it is a test edge to `doctypes`, a later module in the order (BOB's call).
2. **`modules.json`:** docprofile's `uses` lists `civil-time`, which nothing in docprofile imports any more. Only the deleted calendar copy used it. It can be dropped.
3. **Requirements text (BOB's):** docprofile's Uses still names `site-profiles`' `unescapeHtml` (R15) "for the calendar's keys". The calendar is no longer here, so that clause, and the Suggestions on the T33 split and the deletion, are stale. R36's mark `*(not yet met: T34)*` is met by this job.
4. No generated artifact is made stale. `newgroup/src/release.mjs` and `release/` carry flattened copies of the old files, but they are rebuilt at the layer close (§14).

**Tests and checks.**
- `node --test docprofile/test/`: tests 35, pass 35, fail 0. A mutation check (the locator `readText` hands a reader, emptied) turns 5 red.
- Every module's `tests` from `modules.json` (docprofile's excepted), concurrently: tests 7,629, pass 7,557, fail 59. Of these, 26 are item 1 above. The rest are fixture paths listed as tests or files already red before this change (re-run on the pre-change docprofile: 19 red in 16 files). They are the K1708 named reds, plus `agent-runner` conversation and surface, `agent-worker` harness and `sheet-worker` worker, none of them reading through docprofile.
- `format`: 126 modules, 0 failures. `architecture docprofile`: 10 files, 0 failures. `coverage docprofile`: 26 of 26 live ids, 0 failures. `ownership docprofile tranche/T34`: 20 files, 0 failures.

Size (session_01FhABQBQrCTES1CMo1uBCh3): test runs 12, module lines 2,176

## J1 · REPORT

Four things in other modules' or BOB's files, in detail in my record's Completion section. (1) The deletion turns 26 tests red in 15 other files, each green on the pre-change docprofile: plane acquisition profile ×2; extraction afterread ×1, convert-chain ×2, pdfstructure ×1, read ×2; monitoring cadence ×1; reading-pipeline convert-chain ×3, convert-ocr ×3, convert-tiers ×1, emitted ×1, hooks ×1, pieces ×1, read ×5, staffdirectory ×1; roster-reader seam ×1. Their suites read through docprofile without registering doctypes' types (only plane's store calls registerReaders). The fix is the same in each: register the readers in the suite, through plane's registerReaders() or doctypes' registerDoctypes(registerDoctype). Those are their jobs, and for a plane module a test edge to doctypes is your call. (2) modules.json: docprofile no longer imports civil-time, so its uses edge can go. (3) docprofile's Uses still names unescapeHtml 'for the calendar's keys', and the T33/T34 Suggestions are stale. R36's not-yet-met mark is met. (4) No generated artifact goes stale beyond the layer-close rebuilds.

## J2 · COMPLETE

T34-8 done on job/T34/docprofile: the seven copied types and their default registration are deleted. The registry starts empty; with no fallback registered, NO_TYPE answers, stated (my reading of B1 and R4, no question needed). Tests are on stub types through the seam. docprofile 35/35. Format, architecture, coverage (26 of 26) and ownership: 0 failures each. Module lines 5,190 → 2,176. 26 reds in 15 other files follow from the deletion (REPORT J1). Every other red in a full run of all modules' tests was already red before this change.
