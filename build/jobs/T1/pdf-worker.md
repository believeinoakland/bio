# Job record · T1 · pdf-worker

## Questions and reports for BOB

- **Q1 · answered (K27).** R21 now states the inherited `/Rotate` rule D-671 applies; my R21 tests check it.
- **Q2 · answered (K27).** R17 and R18 count the images a page paints (`pdf-reader.pdfPageImages`). Done in this job, before N9 (below).
- **R1 · accepted.** `ocr-worker`'s committed bundle inlines `pdf-worker/src/pagepixels.mjs`, so this job stales it: `bio-plane/test/fleetbundles.test.mjs` fails 4 assertions, all "ocr-worker" staleness. Expected; BOB regenerates every fleet bundle at the layer close.

## Status

**Waiting for BOB's CHANGE for N9** (`pdf-reader`'s named services on `tranche/T1`). Everything else is applied and checked. `tranche/T1` @ 163388e2 merged.

## Entries

- **T1-4 · applied.** Three requirement-named suites at the module's interface replace the old estate: `test/structure.test.mjs` (R1–R12, R35–R38; the committed bundle under miniflare, and imported into node with a recording `env` for R1 and R37), `test/pagepixels.test.mjs` (R13–R26, R39, R40), `test/imagecrop.test.mjs` (R27–R34, R39). Shared helpers: `test/make-pdf.mjs` (a PDF writer with a real xref table, a PNG reader over node's own zlib, a rotation written from its definition). The suites use `test-support` (`bio-plane/test/sandbox.mjs`) and no longer read the old battery's fixture (`bio-plane/test/fixtures/legistar-agenda-1425405.pdf`). Source-text scans of this module (the `.put(` scan, the comment-stripper arms, the SURFACE regex) are gone; R37 is now checked by what the Worker touches, R35 by the exported `SURFACE`. Two things still read files: R4 reads the plane's `NAMESPACES` from `bio-plane/src/index.mjs` (R4 requires the set be tested equal to the plane's own, and the plane is a later module that cannot be imported), and R38 reads this module's own code with comments removed (R38's subject is the code).
  Retired: `test/pdf-worker.test.mjs` (replaced), `test/pdf-worker.control.mjs` and `test/pagepixels.control.mjs` (the old process's negative-control harnesses; they drive the retired battery and `coverage.mjs --strict` and match the old suites' assertion labels). Kept, untouched: the four measurement probes (`*.probe.mjs`, `table-*.mjs`), which are not tests and are run by nothing.
- **D-671 · applied.** `/Rotate` is read as an inheritable attribute (`inheritedAttr`, the same `/Parent` climb now used for `/MediaBox`), normalised to 0/90/180/270; a `/Rotate` that is not a multiple of 90 answers `PAGE_UNREADABLE` rather than being guessed (before, it made `rotateBilevel`/`rotate8` throw out of `renderPageToPixels`). `rotate_deg`, `page_geometry.rotate` and the pixels all follow the inherited value.
- **K27, R17/R18 · applied.** `analyzePage` takes its images from `pdfPageImages` (what the page paints, in painting order, including through Form XObjects), not from the page's `/Resources`. A page sharing a `/Resources` dictionary that lists several images now renders the one it paints. Two choices made under the existing refusal set, no new reason added: a paint sequence `pdfPageImages` cannot walk answers `PAGE_UNREADABLE` carrying its `why` (never a guessed count); a page painting only an inline image answers `IMAGE_UNREADABLE` (reading inline images is not built; before, such a page answered `NO_IMAGE_ON_PAGE`). `imageOf(doc, placement)` is now the one place a placement becomes the decoder's input, shared by `renderPageToPixels` and `cropImage`. Until N9 it reads the placement's stream through `_stream`, as `cropImage` already did; N9 replaces that with `imagePlacementSource`.
- **N9 · waiting** for BOB's CHANGE.

## Flaws found in this module and fixed

- **A truncated CCITT stream was padded with white.** `ccittDecode` ended a row on an unrecognised code without consuming a bit, so every remaining row was minted white: the scan's G4 stream cut to 20,000 of 84,797 bytes decoded "all 2550 rows" and rendered `ok:true`. A row the data does not finish now stops the decode, so R23's `TRUNCATED_IMAGE_DATA` is answered (743 rows at that cut). The full stream still decodes 2550 rows to the independent decoder's digest.
- **Mixed-mode CCITT (K>0) answered `DECODE_FAILED`.** R23 requires `UNSUPPORTED_FILTER`; it is now refused before decoding.
- A stale comment in `src/index.mjs` named the deleted suite; corrected, and `dist/pdf-worker.bundle.json` rebuilt (the bundle itself is byte-identical).

## Deferred

- **R25 (D-622)** stays not met, deferred to a later tranche by the plan. Its test checks the part that holds today: JBIG2 and JPX answer `UNSUPPORTED_FILTER` naming the filter.

## Found in other modules

- `pdf-reader`: its page index admits only dictionaries, so `PAGE_UNREADABLE` (R15) is reachable only through an unreadable page attribute; the R15 test uses a `/Rotate 45`. Not a defect against `pdf-reader`'s requirements.

## Tests and checks run

- `node test/structure.test.mjs` — structure: 77 passed, 0 failed
- `node test/pagepixels.test.mjs` — pagepixels: 171 passed, 0 failed
- `node test/imagecrop.test.mjs` — imagecrop: 54 passed, 0 failed
- `ocr-worker`: `node test/ocr-worker.test.mjs` — ocr-worker: 87 passed, 0 failed
- `bio-plane/test/fleetbundles.test.mjs` — 92 pass, 4 fail (all ocr-worker staleness; expected, R1 above)
- `checks/format.mjs` — 61 modules, 17 requirements files; 0 failures
- `checks/architecture.mjs … pdf-worker` — 26 product files, 25 relative imports; 0 failures
- `checks/coverage.mjs … pdf-worker` — 40 of 40 live requirement ids named by a test; 0 failures
- `checks/ownership.mjs … pdf-worker origin/tranche/T1` — 12 files changed by pdf-worker; 0 failures
