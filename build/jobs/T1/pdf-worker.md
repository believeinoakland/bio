# Job record · T1 · pdf-worker

## Questions and reports for BOB (open)

**Q1 · R21's wording states the defect as the requirement.** R21 reads "`rotate_deg` and the rotation applied to the pixels are the page's own `/Rotate` (0/90/180/270), read from the LEAF page only." Entry D-671 and the Status line say the defect IS reading the leaf only. I applied D-671 as the entry and Status mean it: `/Rotate` is inherited through `/Parent` (the leaf's own value first, then the nearest ancestor's), `opts.rotate` is ignored, and my R21 tests check that. Please correct R21's text (and drop its *not yet met* marks) or tell me it means something else.

**Q2 · R17/R18: counted from the resources, or from what the page paints?** R18 says "a page **painting** more than one image"; R17 says "a page with no image XObject". The code counts the Image XObjects in the page's (inherited) `/Resources`, so a page that shares a `/Resources` dictionary with its siblings (listing every page's scan) is refused `MULTIPLE_IMAGES_ON_PAGE` though it paints one. Counting painted images (`pdf-reader.pdfPageImages`) fixes that, and it needs an image's stream, which N9's named services will provide. Unless you rule otherwise, I will make R17 and R18 count painted images when I do N9, and ask you then for R17's text to say "paints no image".

**R1 · ocr-worker's committed bundle is stale because of this job.** `ocr-worker` inlines `pdf-worker/src/pagepixels.mjs` into `ocr-worker/dist/ocr-worker.bundled.mjs`. My changes to that file (below) make `bio-plane/test/fleetbundles.test.mjs` fail 4 assertions, all "ocr-worker: STALE BUNDLE" (96/0 without my changes). I cannot write `ocr-worker/`. Its owner needs to rebuild its bundle after this branch lands (`node scripts/build.mjs` in `ocr-worker/`). `ocr-worker`'s own suite passes against my branch: 87 passed, 0 failed. No requirement of a service I provide changed: every behaviour change below is what R21 and R23 already state.

## Status

In progress. T1-4 and D-671 are applied and checked; N9 waits for `pdf-reader`'s named services on `tranche/T1`.

## Entries

- **T1-4 · applied.** Three requirement-named suites at the module's interface replace the old estate: `test/structure.test.mjs` (R1–R12, R35–R38; the committed bundle under miniflare, and imported into node with a recording `env` for R1 and R37), `test/pagepixels.test.mjs` (R13–R26, R39, R40), `test/imagecrop.test.mjs` (R27–R34, R39). Shared helpers: `test/make-pdf.mjs` (a PDF writer with a real xref table, a PNG reader over node's own zlib, a rotation written from its definition). The suites use `test-support` (`bio-plane/test/sandbox.mjs`) and no longer read the old battery's fixture (`bio-plane/test/fixtures/legistar-agenda-1425405.pdf`). Source-text scans of this module (the `.put(` scan, the comment-stripper arms, the SURFACE regex) are gone; R37 is now checked by what the Worker touches, R35 by the exported `SURFACE`. Two things still read files: R4 reads the plane's `NAMESPACES` from `bio-plane/src/index.mjs` (R4 requires the set be tested equal to the plane's own, and the plane is a later module that cannot be imported), and R38 reads this module's own code with comments removed (R38's subject is the code).
  Retired: `test/pdf-worker.test.mjs` (replaced), `test/pdf-worker.control.mjs` and `test/pagepixels.control.mjs` (the old process's negative-control harnesses; they drive the retired battery and `coverage.mjs --strict` and match the old suites' assertion labels). Kept, untouched: the four measurement probes (`*.probe.mjs`, `table-*.mjs`), which are not tests and are run by nothing.
- **D-671 · applied.** `/Rotate` is read as an inheritable attribute (`inheritedAttr`, the same `/Parent` climb now used for `/MediaBox`), normalised to 0/90/180/270; a `/Rotate` that is not a multiple of 90 answers `PAGE_UNREADABLE` rather than being guessed (before, it made `rotateBilevel`/`rotate8` throw out of `renderPageToPixels`). `rotate_deg`, `page_geometry.rotate` and the pixels all follow the inherited value.
- **N9 · waiting** for BOB's word that `pdf-reader`'s work is on `tranche/T1`.

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
- `node test/pagepixels.test.mjs` — pagepixels: 163 passed, 0 failed
- `node test/imagecrop.test.mjs` — imagecrop: 54 passed, 0 failed
- `ocr-worker`: `node test/ocr-worker.test.mjs` — ocr-worker: 87 passed, 0 failed
- `bio-plane/test/fleetbundles.test.mjs` — 92 pass, 4 fail (ocr-worker's stale bundle, R1 above)
- `checks/format.mjs` — 61 modules, 14 requirements files; 0 failures
- `checks/architecture.mjs … pdf-worker` — 26 product files, 25 relative imports; 0 failures
- `checks/coverage.mjs … pdf-worker` — 40 of 40 live requirement ids named by a test; 0 failures
- `checks/ownership.mjs … pdf-worker tranche/T1` — see the commit's own run below
