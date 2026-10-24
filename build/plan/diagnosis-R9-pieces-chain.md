# Diagnosis S25: OCR text of a later piece under a chain that does not cover it

**Status** · Written by EXTRACTION #42 (job 41, fix round 9), 2026-10-24, before any change to the module (B50: "write it FIRST"). Result: **reproduced**, for a PDF whose later pieces hold pages of another kind than its first (typed then scans, or scans then typed). BOB ruled the extraction half into job 41 (K4911): a later range answers `reading.piece_chain`; this module indexes under it and folds it into the stored chain. Not a cause until BOB opens a G-entry for it (P10). Reproduction: `bio-plane/test/m/extraction/s25-pieces-chain.test.mjs`.

## The hypothesis (plan, entry G128, item S25)

Later-piece OCR text may sit under a chain that does not cover it (`extraction/index.mjs:884`; `reading-pipeline/index.mjs:436-463, 2740-2741`; `envelope-scans-T51.md` S25, a hypothesis from the lines, not run). Invariant SI10: the OCR text of a scan read in pieces equals the whole read's, and each piece's chain names its pages.

## What was run

A real PDF from test-support's `pdfgen` (seed `s25`, 6 pages, 2 lines a page), read two ways through this module's real entry, `readHeld`, the way the ledger calls it (a `kind`, the registrar `jobRegistrarStub`), with the real `reading-pipeline.read`:

- **whole**: one piece (the pipeline's own page range, 100 pages, covers all 6);
- **pieces**: the same reader handed `rangePages: 2` (an injected bound at the smallest size that shows the cause, R-FOUR (3)), so the file is read in three page ranges, one a tick.

The OCR member is a scripted stand-in answering every page it is asked with `scanned words of page <p> marker<p>`. Compared: the indexed units (`capture_text`: page, text, `chain_kind`) and the stored reading's chain (`readings.reading.text_source`, read by `text-chain.chainKindFor` for each page).

| case (page kinds) | OCR text pieces = whole | each unit's `chain_kind` = whole's | stored chain names each page as the whole's does |
|---|---|---|---|
| every page a scan | yes | yes (`ocr`) | yes |
| two typed pages, then four scans | yes | **no**: pages 2 to 5 are `layer` in pieces, `ocr` whole | **no** |
| two scans, then four typed pages | yes | **no**: pages 2 to 5 are `ocr` in pieces, `layer` whole | **no** |

(Correction, the same day: a first run built the typed pages in pdfgen's default `winansi` font, which tier 1 reads as undecodable without the pdf-worker member, so its "typed" pages held no text and the scans-first case looked unaffected. Built in `type0`, which tier 1 decodes, both mixed orders fail.)

The red line (pieces against whole, pages 2 to 5): `actual: [ [ 2, 'layer' ], [ 3, 'layer' ], [ 4, 'layer' ], [ 5, 'layer' ] ]`, `expected: [ [ 2, 'ocr' ], [ 3, 'ocr' ], [ 4, 'ocr' ], [ 5, 'ocr' ] ]`.

## Mechanism (read from the code at the tranche head)

1. `reading-pipeline/index.mjs:3136-3141`: a later page range answers `{text_units, more, cursor, piece, reading: facts}`, where `facts` carries only the OCR facts of its pages (`stateOcr`: `ocr_left`, `ocr_refused`, killed pages). It answers no chain for the pages it carries, although tier 3 ran on them (`:3098-3106`, `t3.chain`).
2. `extraction/index.mjs:979` (`#continueText`): the piece is indexed under `(out.reading || stored reading).text_source`. With OCR facts present `out.reading` is the facts object and its `text_source` is undefined, so the chain is null; without them the first piece's stored chain is used. Either way the units of the OCR'd later pages take `chain_kind` from a chain that does not name them (`layer` from the first piece's typed pages, or `undetermined`).
3. The stored reading is not rewritten by a piece (R90), so its `text_source` stays the first piece's: a content row minted over a later page (`content`'s address over capture, extent and chain) is addressed under a chain that says the page was a text layer when OCR read it, and `op=reading`'s `text_provenance` says the same.

The text itself is right in every case: only the provenance of a later piece's pages is wrong. A document read in one piece, and one whose pages are all of one kind, are unaffected; any PDF whose later ranges hold pages of a kind the first range does not is affected.

## The fix it needs (for BOB's G-entry; not applied here)

- **reading-pipeline** (provider): a later page range answers the chain of the pages it carries (`t3.chain`, page-scoped), as the first piece's reading does.
- **extraction** (this module): `#continueText` indexes each piece's units under the chain its own pages carry, and completes the stored reading's `text_source` with the piece's page-scoped parts (`mergedChain`), so `chainKindFor` names each page as a whole read does (SI10); the compare is the test above.

Four fields as R-FOUR asks: (1) root cause above; (2) missed because no test read a mixed document in pieces (every piece test used one kind of page); (3) failing-first: `s25-pieces-chain.test.mjs`, the mixed case, red above; (4) **L** (the same read on workerd, as `round6-l`), **N** for the chain itself.
