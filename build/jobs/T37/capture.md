# capture (T37)

**Status** · session_016W2PkTbyjCcRGjNxZ7W1bN · depth 2 · RUNNING until 2026-10-08T09:31:13Z (the 30 using modules' tests) · handled B2

## Work

**Reading (mechanics §17, N739).** The START measured 677 KB, over 300 KB; my own measure of the reading set (requirements 58 KB, code and tests under my paths 631 KB) is also over. Trimmed nothing, no split. I read these whole myself: `build/requirements/capture.md`; layer 3's row of `build/layers.md`; `captureOf`, the `Capture` constructor and the store's acquisition wrappers (`index.mjs` 1–330, 402–405); `act.test.mjs`, `archive.test.mjs` 1–30 and 185–200, `plane.test.mjs`, `cap13-reuse-pages.test.mjs`, `d57selflink.test.mjs`. I also read the used services my entry names: `acquisition` R44 and its `acquire` options and `reputationToolOf` / `fileScannerOf` (`acquisition/index.mjs` 550–566, 1255–1300), and `plane` R29 with its call site (`plane/store.mjs` 290–300, 368–378). A worker of mine read the rest of the code (`index.mjs` 330 to the end, `ops`, `doorbell`, `checks`, `grammar`, `schema`) and every test under my `tests` in full. Its summary (about 7 KB) cites file and line for: the members and options touching `reputation` or `fileScanner` (none outside my change); how the tests build a Capture; the R58 and R73 tests (`reads.test.mjs`:202, `archive.test.mjs`:191); and two flaws. One flaw mattered and is fixed: `reputation` as a prototype method would throw when acquisition calls it detached. The summary left nothing out that mattered.

**T37-38 applied (R73).** `captureOf` keeps the `reputation` reader and the `fileScanner` binding on the instance. On first construction they come through the constructor; on any later call they come through `adoptReputation`, which runs after every R58 refusal check, so a refused call adopts nothing. Each is adopted from the first caller that supplies it; a later caller's is ignored, never compared and never refused. R58 is unchanged. The instance exposes `fileScanner` (null with none) and `reputation`, an own arrow function, so it is safe to call detached. It calls the reader at each call and answers what the reader answers: a value, a promise, null or a throw. A reader handed in as a value (a spec) is answered as given; with none it answers null. The plane's call (`plane/store.mjs`:375), made after the instance already exists (:299), is no longer dropped.

**Tests.** `test/m/capture/t37.test.mjs` (R73, four tests). Its end-to-end test checks that the reader handed to `captureOf` reaches every acquisition, read once at each, with the binding carrying the lookup. After B2 I merged `tranche/T37`, which now carries acquisition's T37-37 (K2190), and the test passes.

**My own reds fixed** (red before this job, not on the plan's rule 6 list). `test/m/capture/plane.test.mjs`:52, `test/cap13-reuse-pages.test.mjs` and `test/d57selflink.test.mjs` all sent the retired shared member key in the address, which is now refused `CREDENTIAL_IN_ADDRESS`, then `MEMBER_TOKEN_RETIRED`. They now enrol a member, sign in, and send the session in the Authorization header. In `plane.test.mjs`, a member session's GET of bytes is now file-safety's opening (control-plane R62), so capture's own R21 read is checked with the administrator's credential.

## J1 · REPORT

T37-38 applied and pushed (R73: `captureOf` keeps and exposes the reputation reader and the FILE_SCANNER binding, first caller adopted, later ignored; R58 unchanged). Checks clean: format, architecture, coverage 58/58, ownership. One test is red: t37.test.mjs, the end-to-end test that the reader reaches `acquire`. It waits on ACQUISITION's T37-37 (today's `reputationToolOf` passes `cap.reputation` through as a spec without calling it). Note for acquisition: `cap.reputation` is a function; calling it detached is safe. I also fixed three of my own tests that were red before this job and not on the rule 6 list: plane.test.mjs:52, cap13-reuse-pages and d57selflink, all on the retired shared member key in the address. Please send a CHANGE once acquisition is on tranche/T37; I will merge, run the end-to-end test and complete.

## Completion

**Entries applied:** T37-38 (R73), all of it; nothing deferred.

**Found in other modules:** nothing new against their requirements. My change made no generated artifact stale (it touches no bundle and no `program.mjs` input).

**Tests run** (after merging `tranche/T37` at B2):
- capture's own tests (`test/m/capture/`, `cap13-reuse-pages`, `d57selflink`): 159 tests, 159 pass, 0 fail.
- acquisition's tests (`test/m/acquisition/`), as the service the R73 path reaches: 153 tests, 153 pass, 0 fail.
- The tests of the 30 modules that use capture (R73 is a service I provide): 2,904 tests, 2,851 pass, 51 fail, 2 todo. The same set on `tranche/T37` without my change: 2,900 tests, 2,846 pass, 52 fail. No failure appears only with my change. One file fails only on the baseline: `test/m/extraction/convert-tiers.test.mjs`, which I judge timing-sensitive and not mine. The 51 shared failures are inherited, most of them in `affordances` (R13–R26, R48) and `credentials` R19. None is in capture.
- No layer tests: `build/manifest.md` names none yet.

**Checks** (from civicos-process):
- `format: 136 modules, 135 requirements files; 0 failures`
- `architecture: 28 product files, 116 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 58 of 58 live requirement ids named by a test; 0 failures`
- `ownership: 6 files changed by capture between tranche/T37 and HEAD; 0 failures`

**R73's mark** "*(not yet met: T37)*" can be struck: it is met.

Size (session_016W2PkTbyjCcRGjNxZ7W1bN): test runs 20, module lines 3826
