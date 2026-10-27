# file-safety (T52)

**Status** · session_018BhcedELyQVJKrBr63sLkm · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# FILE-SAFETY, T52 R1: report

**Entries.**
- **T52-12:** met on this tree before the job. `checks.mjs:95` reads `SIGNATURES_RUN_RECENT` by `rowWord`; the key is in `words-reads.json`; `rows.test.mjs` R24 passes (7/7). `STAND_INS` stays (BOB, K-reply): `SIGNATURES_RUN_UNDER_WAY` (C-140.45) has no design row. **Words owed:** `refusal.SIGNATURES_RUN_UNDER_WAY`.
- **T52-13 (U5), settled; no file-safety change.** The old file is not malformed and its sentence is not the cause. LibreOffice 7.4.7.2 (the pinned release, from the Debian snapshot 20261006, run in a chroot here) answers "source file could not be loaded" to the corpus generator's `docx` (`generate({kind:"docx", seed:"alpha-B-6"})`, 1,633 B): its `word/document.xml` has the data-descriptor flag (0x8) and every entry carries a 28-byte extra field (the streaming writer). A minimal plain package with the same four entries and no styles or docProps (rebuilt from BOB's description, 1,274 B) converts fine on 7.4.7, so missing styles/docProps is not the cause. The same generator file passed through `file-scanner/container/renderer.mjs` `plainPackage` (already in the tree) converts to a PDF on 7.4.7. So the stored 1,668 B file is the streamed form that 7.4.7 cannot load, and the current renderer code repairs it.
- **Why it still reads "failed":** the failure is stored final, and R59 requeues only when the renderer's version string differs. `/version`'s `renderer_version` is `libreoffice <pkg>; poppler-utils <pkg>` (`file-scanner/src/handler.mjs:27`): package versions only. The renderer-code fix changed no package, so the string is unchanged and R59 never requeues the file. Either the live image did not yet carry `plainPackage` when it was re-rendered, or it did and the row was not retried.

**For BOB (file-scanner / R59, not mine to place):** (1) file-scanner: make the renderer release identity carry the image build (e.g. `renderer_version` including `deps.version` or the image digest), so a code fix to the renderer is a new release for R59; or (2) file-safety R59 amended to record the scanner's `version` beside `renderer_version` (a requirement change, BOB's to bring to Bob if he deems it policy). Either way the old row requeues once on the next release. Before that, check that the deployed renderer image includes `plainPackage`. No code changed in this job.

**Left behind:** a Debian 12 chroot at /tmp/bw (7.4.7.2) in the container, unmounted; useful to re-run `soffice --headless --convert-to pdf` against the pinned release.

**Met** · none

Tests: 146/146. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedELyQVJKrBr63sLkm): test runs 1, module lines 3419
