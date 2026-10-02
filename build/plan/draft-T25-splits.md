# T25 splits: provenance (N512) and extraction (N513)

**Status** · DRAFT by a worker for BOB #99, 2026-10-02 (P18), for N512 and N513. **Reviewed by BOB #99 (K1193):** provenance takes both seams (`provenance-routes` and `attestation`); extraction takes its first seam only (`reading-pipeline`); `extractrun.mjs` stays in extraction (2,678 lines after the split, under the mark; a cross-module file move is not needed). Seam details are confirmed by each job against the code; the R-id maps here are the starting reading.

Measured on `tranche/T24` at the T24 merges: `provenance` paths hold 4,001 lines (`index.mjs` 2,739, `register-checks.mjs` 505, `checks.mjs` 385, `schema.mjs` 257, `ops.mjs` 115). `extraction` paths also hold 4,001 lines (`extraction/index.mjs` 1,497, `pipeline.mjs` 1,070, `schema.mjs` 418, `filemembership.mjs` 153, `checks.mjs` 108, `ops.mjs` 97, `drift.mjs` 63, `extractrun.mjs` 342, `readingprov.mjs` 253). The precedent is N506 (monitoring → link-sweep): moved ids keep their text with only cross-references re-pointed, the old module retires each moved id and never reuses it, the new module sits directly after (or before) its parent, and `modules.json`, `layers.md`, `layers-view.html`, membership's `MODULE_ORDER` (its R83) and every reader are re-pointed. Line counts below come from `sed -n a,bp | wc -l` over the stated ranges. "+~N" is an estimate of the new file's scaffolding (header, imports, class shell, factory).

## Summary

| split | new module | moves (lines) | old part after | new part | src sites re-pointed outside the pair |
|---|---|---|---|---|---|
| P-1 (recommended) | `provenance-routes` | ~1,053 | ~2,950 | ~1,110 | 2 (retrieval, plane/store) |
| P-2 (recommended with P-1) | `attestation` | ~421 | **~2,530** with P-1 | ~470 | 9 sites in 7 modules |
| E-1 (recommended) | `reading-pipeline` | 1,323 | 2,678 | ~1,330 | 0 (one optional: see E-1 risks) |
| E-2 (recommended with E-1) | none: `extractrun.mjs` moves to `run-productions` | 342 | **2,336** with E-1 | run-productions 1,358 → 1,700 | 0 beyond its one consumer |

P-1 alone leaves provenance at about 2,950 lines, under the mark but not well under 3,000, so P-2 is proposed with it. E-1 alone leaves extraction at 2,678, and E-2 brings it to 2,336 at almost no re-pointing cost. Fallbacks, if BOB wants only one move per module: P-1 alone and E-1 alone. Both still pass the ~4,000 mark (P6).

---

## P-1 · provenance → `provenance-routes` (the chain and the route marker)

**Seam.** The route code is self-contained. It reads `bundles` (record-core R37) and `provenance_route_marks` and nothing else. It never reads `register` or `captured_locators`, and nothing else in provenance calls it.

**Files and ranges taken** (provenance `index.mjs` unless named):

| what | range | lines |
|---|---|---|
| `OBSERVATION_MEANS`, `FINDING_MEANS` (the D-129 copy, PROVENANCE #9) | 69–87 | 19 |
| §"THE CHAIN (R19) AND THE ROUTE FINDING (R23)": `chainFromEvidence`, `ROUTE_MARK_NOTE`, `routeFinding`, `ROUTE_FINDING_KEY`, `ROUTE_TALLY_*`, `ROUTE_MARKED_*` | 126–429 | 304 |
| `rowUnlessStated` (private; its only caller is `provenanceChainRebuild`) | 532–543 | 12 |
| methods `provenanceChainRebuild`, `#latestRouteMark`, `routeOf`, `routeTally` | 1835–2013 | 179 |
| methods `provenanceRouteAssess`, `provenanceRoutesMarked` (`counts`, 2014–2026, stays) | 2027–2387 | 361 |
| `checks.mjs`: C-34 `ROUTE_MARK_CHECKS` with its header | 73–145 | 73 |
| `schema.mjs`: `provenance_route_marks`, its index and comments | 87–183 | 97 |
| `ops.mjs`: the `provenancechain`, `provenanceroute`, `provenanceroutes` arms | 54–61 | 8 |
| **total** | | **~1,053** |

**R-ids** (old provenance → new):

| old | new | note |
|---|---|---|
| R19 | R1 | `chainFromEvidence` |
| R20 | R2 | `provenanceChainRebuild` |
| R21 | R3 | |
| R22 | R4 | `provenanceRouteAssess` |
| R23 | R5 | `routeFinding`, `provenanceRoutesMarked` |
| R54 | R6 | the audit's `route` finding (record-core R68), registered by the new module's name |
| R36 | R7 | moves whole: its only hop writer is R20. Confirm at the job. |
| R48, last sentence | R8 | `provenance_route_marks`' read contract (retrieval R63). R48 keeps the rest. |
| R53, three of nine arms | R9 | `provenanceRouteOps(routes, url, body)`, same arm text. R53 is re-worded to six ops. |
| R55, `routeMarks` | R10 | R55 keeps `register` |
| R37, "a route that cannot be shown" | R11 | R37 keeps the rest |
| R41, `provenance_route_marks` | R12 | R41 keeps the other tables |
| R40 | R13 (copy) | the no-place invariant is stated in both modules |

Checks C-34.1–C-34.4 move with it. Retired in provenance: R19–R23, R36, R54. Split and re-worded: R37, R41, R48, R53, R55.

**Order.** Layer 3, directly after provenance (and after `attestation` if P-2 is taken): provenance, attestation, provenance-routes, capture-sources. It **uses** record-grammar, record-core, membership, promotion (`promote`, R2) and provenance (only the C-103 `NO_BUNDLE` row, `PROVENANCE_ACT_CHECKS`, imported rather than moved). It is **used by** retrieval (L5: `routeFinding` and its SQL join), plane and control-plane (the ops spread). Nothing earlier calls it, so the order stays acyclic. record-core calls it back only through the registration (R68, R63), as it does today.

**Re-points.**
- src: `retrieval/index.mjs:24` (`routeFinding`; its join on `provenance_route_marks` is R8's contract); `plane/store.mjs:301` (add `...provenanceRouteOps(...)` beside `provenanceOps`).
- tests: `test/m/retrieval/roster.test.mjs:9`; `test/m/plane/maps.mjs:15` and `test/m/control-plane/record.mjs:17` (the ops spread); the test worlds that rely on provenance's migrate to create `provenance_route_marks` (retrieval's fixture, `affordances/backing.test.mjs` through the provenance fixture) must also migrate the new module.
- `control-plane/families.mjs:19,82` and `test/m/affordances/catalogue.test.mjs:958` gain the new checks file. The C-34 rows' `where` strings are re-pointed to the new file.
- requirements citing the moved ids: `retrieval.md` (R63's provenance R23/R48), `record-core.md` (R68's `route` finding).
- unchanged: op names (`op-declarations`, `control-plane`, `affordances` key by op name only).

**Tests that move.** `test/m/provenance/chain-route.test.mjs` (282) and `convert-chain-marker.test.mjs` (263; check its R41 and R46 arms at the job); from `audit-figures.test.mjs`, the R54 cases (lines 35–134), the `routeMarks` half of R55 and the R48 route-marks case (172–); from `ops.test.mjs`, the case at 154; and the share of `fixture.mjs` these need.

**Risks.**
- Private one-liners `isObj` and `secondOf` are duplicated, or taken from record-grammar if it exports equivalents. `viewerPredicate` and `GATE_MARK` come from membership as today.
- `OBSERVATION_MEANS` (exported) moves; its only readers are this code and `audit-figures.test.mjs`.
- `op=stats`' figure keys are flat and unique (`routeMarks`). Their order follows registration order, and the new module registers right after provenance, so the answer should not move. Pin it in the job's test.
- Table ownership is clean: `provenance_route_marks` has one writer and moves whole. `CREATE TABLE IF NOT EXISTS` under the same name means a deployed instance keeps its rows with no data migration. `declarePurge` moves the table to the new module's declaration.

## P-2 · provenance → `attestation` (co-attestation and the instance key)

**Files and ranges taken:**

| what | range | lines |
|---|---|---|
| `attest`, `attestStatus` with the "Trusted timestamps" header | `index.mjs` 674–825 | 152 |
| `RECEIPT_KIND`, `STATEMENT_KIND`, `instanceStatement`, `noKey` | `index.mjs` 850–870 | 21 |
| `attestationsOf` | `index.mjs` 1318–1373 | 56 |
| R34/R56: `receiptStatement`, `#key`, `#signWith`, `signReceipt`, `instanceSign`, `instanceKeyBound`, `instanceKeys`, `signedReceipts` (with the `signingKey` constructor option) | `index.mjs` 1566–1671 | 106 |
| C-89 `ATTEST_CHECKS` with its header | `checks.mjs` 146–168 | 23 |
| C-103.6 `RECEIPT_MALFORMED` and C-103.7 `RECEIPT_NO_KEY`: **not moved** (see risks); 12 lines counted here only if they move | `checks.mjs` 217–228 | (12) |
| `receipt_keys`, `signed_receipts` | `schema.mjs` 197–215 | 19 |
| `attestOp` | `ops.mjs` 84–115 | 32 |
| **total** | | **~421** |

**R-ids:** R31→R1, R32→R2, R33→R3, R34→R4, R56→R5, R57→R6, R49→R7 (`attestationsOf`, read over provenance R48's `register` contract), R39→R8 (after the split, network calls are only this module's), R40→R9 (copy). R10 is new wording for "owns `receipt_keys` and `signed_receipts`": layers.md ruling 3 and the schema comment state it today, but R41 does not. That wording is BOB's to settle. Retired in provenance: R31–R34, R39, R49, R56, R57. N504's R57, met at T24, moves as met.

**Order.** Layer 3, directly after provenance and before capture-sources. Acquisition (`attest`, `signReceipt`) and capture (`attest`) are later in layer 3 and use it. It **uses** record-grammar, signatures, record-core (evidence store, `readFile`, `declarePurge`) and provenance (R48's register contract, `homeOf`, and `PROVENANCE_ACT_CHECKS` for C-103.6/.7). It is **used by** acquisition, capture, case-authoring, filings, network-notices and plane. All of them are later, so the order stays acyclic.

**Re-points** (the cost of this seam):
- `acquisition/index.mjs:30` (`attest`) and `:1025` (`cap.provenance.signReceipt`, so the composition hands the attestation instance in `cap`);
- `capture/index.mjs:28,979` (`attest`);
- `network-notices/index.mjs:37` (`instanceStatement`) and `:185, :444, :787` (`instanceSign`, `instanceKeys`);
- `case-authoring/index.mjs:1145` and `filings/index.mjs:897` (`attestationsOf`);
- `plane/door.mjs:12` (`attestOp`) and `plane/store.mjs:99` (`signingKey: env.RECEIPT_SIGNING_KEY` moves to `attestationOf`).
- tests: `test/m/network-notices/activity.test.mjs:9` and that module's fixture; the fixtures of filings, case-authoring and acquisition that wire `provenance` for these services.
- requirements: `acquisition.md`, `capture.md`, `case-authoring.md` (R35), `filings.md` (R9), `network-notices.md` (R1, R13, R21), `affordances.md`.
- `ARCHIVE_CAPTURE_GRADE`, `ARCHIVE_VIA` and `DOORBELL_VIA` stay in provenance (R25, R51), so their importers do not move.

**Tests that move.** `attest.test.mjs` (240), `instance-key.test.mjs` (159), and the R31/R32 case of `ops.test.mjs` (53–98).

**Risks.**
- The C-103 family is shared: `RECEIPT_MALFORMED`/`RECEIPT_NO_KEY` sit beside `declareOrigin`'s rows. Proposed: the rows stay in provenance's `PROVENANCE_ACT_CHECKS`, the new module imports them, and only their `where` is re-pointed. This avoids one family in two files (the note at the top of `checks.mjs`).
- Private helpers `hexOf`, `b64`, `unb64`, `bareSha`, `safeJson` and `isObj` are one-liners, duplicated or taken from record-grammar.
- `receipt_keys` is purge-exempt and `signed_receipts` keyless. The declaration moves as written.
- Network-notices' test world signs through `provenanceOf(...).instanceSign`. Every such world gains the new instance, and that is the biggest test edit of the two seams.

---

## E-1 · extraction → `reading-pipeline` (the tier ladder and reading provenance)

**Seam.** This is the requirement's own "Two halves" suggestion. `pipeline.mjs` and `readingprov.mjs` are pure: no record, no tables and no catalogue rows. They import only text-chain (`textchain.mjs`), format-registry (`formats.mjs`), docprofile (`registry.mjs`, `readtext.mjs`) and capture-sources (`drive.mjs`), and they reach the pdf-worker and ocr-worker members through `env` bindings. The store half (`extraction/index.mjs`) calls them: `read`, `tier2Escalate`, `tier3Extend`, `tier3SeedFrom`, `needsTier3`, `textUnitsFor`, `layerChainFor`, `readingFromWire`, `decodeView`, `textCountsOf`, `pageBoxesFrom`, `bytesOf`, `CAPTURE_TEXT_UNIT_CAP`, `readingProvenance`, `compareProvenance` and `PROVENANCE_SCHEME`. **No src file outside extraction imports either file.**

**Files taken:** `bio-plane/src/extraction/pipeline.mjs` (1,070) and `bio-plane/src/readingprov.mjs` (253), whole, into `bio-plane/src/reading-pipeline/`. Total 1,323.

**R-ids** (old extraction → new): R2→R1, R3→R2, R4→R3, R5→R4, R6→R5, R7→R6, R8→R7, R9→R8, R10→R9, R11→R10, R12→R11, R13→R12, R14→R13, R15→R14, R16→R15, R17→R16, R60→R17, R25→R18, R26→R19. The invariants R44 (no machine mints a grade), R45 (a failed reading is recorded, never emptied) and R50 (no place) are stated in both modules as R20–R22. **Stay in extraction:** R1 (the store binding `record-core.evidenceStore`, never the caller's; `op=acquire`'s wire) and R18 (the jurisdiction view handed in). These are `Extraction.read`'s wiring (index 546–571, with R21's `recordComposed`); the composition they hand to `read` moves. R31–R35 (the re-read) stay, citing the new R3–R6 and R11. Retired in extraction: R2–R17, R25, R26, R60.

**Order.** Layer 4, directly before extraction: calibration, reading-pipeline, extraction. It **uses** record-grammar, text-chain, format-registry, docprofile, capture-sources, pdf-worker, ocr-worker and test-support. It takes calibration only as the `liveCalibration` callback, so it needs no edge to calibration. It is **used by** extraction, so the order stays acyclic. Extraction's `uses` probably drop `pdf-worker`. They keep `ocr-worker` (R32's C-51.4 checks `env.OCR_WORKER` in `index.mjs:1272`), `docprofile` and `format-registry` (`index.mjs` imports `readText` and `getFormat`). Measure at the job.

**Re-points.**
- src: `extraction/index.mjs:24,30` only.
- tests that import the moved files directly: `test/m/extraction/n26.test.mjs:10–11`, `n439.test.mjs:11–12`, `convert-tiers.test.mjs:14`, `read.test.mjs:10`, `pdfstructure.test.mjs:10`, `rules.test.mjs:8`, `store.test.mjs:7`, `testimony.test.mjs:9`. Those that stay in extraction keep importing an earlier module, which is allowed.
- requirements: `observation-log.md` Uses, line 76 ("`text_chars` on the reading (its R60)" becomes reading-pipeline R17); `calibration.md` §"Where it runs" names "Extraction's Worker pipeline".

**Tests that move** (they cite only moved ids, or nearly so): `test/m/extraction/read.test.mjs` (588; its R1, R18 and `acquireReadingOp` arms stay), `convert-ocr.test.mjs` (270), `staffdirectory.test.mjs` (89), `convert-tiers.test.mjs` (298; its R31/R34 arms stay), the R25/R26 cases of `rules.test.mjs` (18–54), and `modules.json`'s `test/d606-perpage-ocr.test.mjs`, `test/tier2-wire.test.mjs`, `test/tier-pagewise.probe.mjs`, `test/system/pdf-worker-binding.test.mjs`, `test/fixtures/d460/` and `test/fixtures/cpdf20/tier2-recorded.json`. The mixed `convert-chain` (R3, R11, R12, R15) and `convert-extent` (R13, R60) are split case by case.

**Risks.**
- **Test re-targeting** is the main work. `read.test`, `convert-ocr`, `staffdirectory` and `convert-*` reach the pipeline through `fixture.fresh()`'s `Extraction.read`. Moved, they call `read(document, {evidence, env, view, liveCalibration})` directly, with a small fixture of their own (the extraction fixture's `bucket()` and `doc()` helpers). The assertions are unchanged.
- `CAPTURE_TEXT_UNIT_CAP` is shared: the pipeline defines it (the R15 wire cap) and extraction's R22 caps stored units by it and re-exports it (`index.mjs:33`). It is read from extraction by `observation-log/index.mjs:21`, `connections/themes.mjs:19` and three tests. Proposed: keep the re-export, since R22 names the bound as extraction's, so nothing re-points. If BOB prefers no re-exports (N501's direction), two src lines and three tests re-point.
- Nothing is shared by tables or checks: the pipeline owns no table and mints no catalogue row (C-51 stays with the re-read).
- `filemembership.mjs` (R52) is pure too, but it is left in extraction. Moving it would re-point `connections/index.mjs:46` and a connections test for 153 lines.

## E-2 · `extractrun.mjs` → `run-productions` (the EXTRACT role's vocabulary)

**Seam.** `extractrun.mjs` (342) imports only record-grammar (`grades.mjs`) and text-chain. Its one consumer is `run-productions/index.mjs:28` (and `schema.mjs` names it), and nothing in extraction calls it. The requirement already says "the act that uses it is `ai-runs`'". This is a whole-file move to an existing later module (layers.md ruling 5, BOB's), not a new module. If BOB prefers a new module, it is ~350 lines placed directly after extraction in layer 4. That is too small to be worth a module.

**R-ids:** extraction R41, R42, R43 become run-productions' next free ids (in order), with R44's "a proposal's grade is computed" clause cited there. Retired in extraction: R41–R43.

**Order.** run-productions (layer 6) already uses record-grammar and text-chain, so no new edge is needed and extraction's order is untouched.

**Re-points.** `run-productions/index.mjs:28` (path only); `build/requirements/run-productions.md` and `extraction.md` (§"The EXTRACT role's vocabulary").

**Tests that move.** The R41–R43 cases of `rules.test.mjs` (124–166) and `convert-names.test.mjs` (105–143) go to `test/m/run-productions/`.

**Risks.** None structural. run-productions grows to 1,700 lines.

---

## Shared steps for any of the four (N506's pattern)

1. `requirements/<new>.md` with a Status naming N512 or N513, the old → new map above and "no change of meaning". The old file retires each moved id and never reuses it, and its Status records the split.
2. `modules.json`: the new entry at the stated place, with `paths`, `tests` and `uses`, and the old entry's `paths`, `tests` and `uses` trimmed. Each consumer gains the edge.
3. `layers.md` (an AMENDED line under ruling 1 and K617) and `layers-view.html` list the new module. Membership's `MODULE_ORDER` (R83) is re-pinned equal to `modules.json` in L2, as T24 did for link-sweep. P-1 and P-2 also change listener order only by adding modules: provenance's `onReceipt` and `onTestimony` ranks and extraction's `onReading` keep their relative order.
4. The accepted reds by name, as at T24's opening: coverage of the new ids until each module's merge, and Format (the new `paths` and `tests` do not exist until the move job merges).
