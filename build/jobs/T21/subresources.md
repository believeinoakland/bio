# subresources (T21)

**Status** · session_013wub6dXNauK3Eb12UzKxmu · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied**
- **N458** (K899 (1)): "record" for "bundle" in the text members read, `bio-plane/src/subresources.mjs` `manifest.link_note` (was :1378, :1381: "`intra` resolves inside this record", "a capture in another record"). The comments at :791, :793 and :1285–:1286 describe the capture's record, not a JS bundle, so they follow ("THIS record", "some other record", "Intra-record … inside the record"). Re-scan: no other "bundle" remains in my paths.
- **N469** (K931): none of my paths' notes names a file T20 deleted as live (re-scanned for `battery`, `.test.mjs`, runner, suite, asserts, pins, anchors). One note at :1351 said "the subresources test asserts that identity", which named no file but meant the old `bio-plane/test/subresources.test.mjs` (gone); re-worded to "this module's R16 test asserts that identity", which it does (`test/m/subresources/subresources.test.mjs`, R16: one bucket per record, the counts summing to the records). The :905 note ("the suite stayed green") is provenance and stays.
- **Proof:** no requirement states `link_note`'s text (R15 states `links[]` and its wrappers, R16 the output's shape; neither the note). So there is no requirement-named test of the wording, and none was added: a test of an unstated string would test source text, not a requirement.

**Deferred:** nothing.

**Found in other modules / generated artifacts (REPORT J1):** `manifest.link_note` is product output, so the change stales the fleet bundles that take `subresources.mjs`: `pdf-worker/dist/pdf-worker.bundled.mjs` (+ `.bundle.json`) and `ocr-worker/dist/ocr-worker.bundled.mjs` (+ `.bundle.json`) (`build/manifest.md`, Generated artifacts), and the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, the plane's source). Regenerated none.

**Tests and checks**
- `node --test test/m/subresources/` (in `bio-plane/`): tests 35, pass 35, fail 0.
- No layer tests are named in `build/manifest.md`; no service changed, so no user module's tests to run.
- `format`: 86 modules, 84 requirements files; 0 failures.
- `architecture subresources`: 2 product files, 2 relative imports; 0 failures.
- `coverage subresources`: 34 of 34 live requirement ids named by a test; 0 failures.
- `ownership subresources tranche/T21`: 1 file changed; 0 failures.

Size (session_013wub6dXNauK3Eb12UzKxmu): test runs 1, module lines 1426

## J1 · REPORT

Generated artifacts staled by N458 (`manifest.link_note` is product output): `pdf-worker/dist/pdf-worker.bundled.mjs` (+ `.bundle.json`) and `ocr-worker/dist/ocr-worker.bundled.mjs` (+ `.bundle.json`), which take `subresources.mjs`; also the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`). Regenerated none.

## J2 · COMPLETE

N458 applied (link_note :1378, :1381 and comments :791, :793, :1285 now say "record"); N469: no note in my paths names a deleted file as live; one note re-pointed to this module's R16 test. No requirement states link_note's text, so no requirement-named test of it. test/m/subresources 35/35 pass; format, architecture, coverage (34/34), ownership: 0 failures. Stale bundles in J1. Record: build/jobs/T21/subresources.md on job/T21/subresources.
