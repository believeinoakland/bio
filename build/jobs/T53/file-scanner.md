# file-scanner (T53)

**Status** · session_018BhcecnyytTT3cMe1k3Zku · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# file-scanner · T53 · report

**Entries applied**
- C T52-100 (R36, parked in req-ahead-T52.md; amends R8): `/version`'s `renderer_version` is now `libreoffice <v>; poppler-utils <v>; <build>`, where `<build>` is the SafeViewRenderer image's published digest, else `sha256:<source_sha256>` (the marker's hash of the files the image is built from, bundler R36), else `not reported` (`rendererBuild` in `src/handler.mjs`). A renderer fix therefore moves the version whatever its packages do, so `file-safety` R59 tries a failed render again. Tests (`test/renderer-build.test.mjs`, `test/mirror.test.mjs`): two builds differing only in code answer different names; one build the same on every call; the packages' versions still appear. The streamed-docx render tests (`render-descriptor.test.mjs`) skip here, where LibreOffice is not installed (11 skips before and after); `plainPackage` is untouched. The live-image check after T52's redeploy (capture `9dce360a…` renders) is BOB's act 7, not done here.
- T53-64 (K5565): `test/on-own.test.mjs` asserted a copied English recipient pattern; it now compares each own-server descriptor's recipient to its word key's value (`word(...)`). With the module's line removed from `build/tests-english-baseline.json` the words check reads 0 failures, testenglish 0; the ownership check refuses a job editing that shared file, so I did not commit that edit: **BOB lowers the line** `"file-scanner/test/on-own.test.mjs": 1` (delete it). The census's other rows (worker.test.mjs egress sentence, regex sites) were not in the baseline and are marker data/non-word text; nothing further to convert.

**Not done / for BOB**
- `build/requirements/file-scanner.md` does not yet carry R36 (still parked in `build/plan/req-ahead-T52.md`); the requirement text and its Met mark need BOB to fold it in. The generated `file-scanner/dist` bundle is stale from the handler change; `proc merge` regenerates it.
- No flaws found in other modules.

**Met** · R36

Tests: 103/114. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecnyytTT3cMe1k3Zku): test runs 1, module lines 6912

## Completion (2026-10-28)

**CHANGE (BOB #327; READER-CONTAINER's finding)** · applied: the renderer's conversion now runs in a private profile (`PROFILE_SETTINGS` in `container/renderer.mjs`, the settings reader-container's convert uses): `BlockUntrustedRefererLinks` true, macros and active content off, links never updated. Before this the renderer wrote no profile at all. Test at the render interface (`test/render-pages.test.mjs`): the converter stand-in reads the registry settings from the profile it is given. Suggested requirement wording for R12: "The renderer's LibreOffice runs in a fresh private profile that blocks linked pictures (BlockUntrustedRefererLinks), disables macros and active content and never updates links; a rendered file cannot fetch a linked image." Image source changed, so its digest moves at the next cut (R36 names it).

**Met** · R36

Tests: 104/115. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecnyytTT3cMe1k3Zku): test runs 2, module lines 6945

## Completion (2026-10-28)

# file-scanner · T53 · report (CHANGE: R37)

**Applied.** `test/render-fetch.test.mjs` (R37, a render fetches nothing): a docx (`a:blip r:link`, external relationship) and an odt (`draw:image xlink:href`) whose picture is linked to an address on a local HTTP listener are rendered through `/render` by the image's real server and the real LibreOffice (24.2.7.2, present here); no request reaches the listener. Control: the same documents converted in a private profile that differs only in `BlockUntrustedRefererLinks` false (Writer's link-update stays "never") make the request to the listener, so the documents do exercise the fetch. Run here: both tests pass (4.3 s, 5.2 s); the module suite is green. They skip where soffice or Poppler is absent. No code change was needed beyond the earlier profile (`PROFILE_SETTINGS`, exported from `container/renderer.mjs` for the control).

Found while writing it: a `spawnSync` converter blocks the in-process listener and shows a false "no request"; the control uses an asynchronous spawn.

The earlier notes stand: BOB deletes `"file-scanner/test/on-own.test.mjs": 1` from `build/tests-english-baseline.json`.

**Met** · R37

Tests: 104/117. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Inherited reds: ["R16 R8 /version states every read bound by name with its figure and its source, quoted from the table; no ceiling of the module is a literal","R16 the limits, by name; the bundle states the Worker's own limits once, equal to its configuration"]
Size (session_018BhcecnyytTT3cMe1k3Zku): test runs 3, module lines 7019

## Completion (2026-10-28)

# file-scanner · T53 · report (CHANGE: R16, R37)

**R16.** The two assertions that pinned `SCAN_MAX_BYTES` (256 MiB, source `alpha`) now read the figure and its source from the table (`boundOf`, `READ_BOUNDS`), as K5624 says: `test/worker.test.mjs` (the limits list also reads the render pages and bytes by `boundOf`) and `test/scanner-states.test.mjs` (every read bound's source). No source change: `src/limits.mjs` already quotes the table. Suite green.

**R37.** As in the previous completion: `test/render-fetch.test.mjs` ran against the real LibreOffice 24.2.7.2 and passed, with its control.

Earlier notes stand: BOB deletes `"file-scanner/test/on-own.test.mjs": 1` from `build/tests-english-baseline.json`.

**Met** · R16, R37

Tests: 106/117. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecnyytTT3cMe1k3Zku): test runs 4, module lines 7020
