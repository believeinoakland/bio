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
