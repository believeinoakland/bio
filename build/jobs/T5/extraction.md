# T5 · extraction — job record

**Session** EXTRACTION #1, `session_014jiwG7P66ao1PbMJXwqhSF`, on `job/T5/extraction` (from `tranche/T5` @ `1e75fac6b2`; `tranche/T5` merged again after calibration's early merge and K135–K138, last @ `0ed1857973`). Process: civicos-process `roles/JOB.md`, mechanics §6, §12.2, §13, §14, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · WORKING (the old battery's comparison running). QUESTION 1 answered (K135, K138). QUESTION 2 open: the one architecture failure waits on it.

**Read whole:** `roles/JOB.md`, `PROCESS-MECHANICS.md`, `build/manifest.md`, `build/layers.md`, `build/requirements/extraction.md` (both parts, as amended by K138), `build/extraction/extraction.md`, `build/requirements/calibration.md` (public part), my entry T5-2 in `build/plan/current.md`, rulings K23, K31, K49, K57, K61, K64, K72, K73, K104, K126, K133–K138; `build/jobs/T4/capture.md` (the extraction pattern); record-core's, membership's, promotion's and calibration's factories; the public parts of docprofile, format-registry and jurisdictions I call; the legacy code the map names, measured again (below); the snapshot's built work: `land/worker/D-616` (a903de6d), `D-635` (d31c52bf), `D-665` (e9392ac8), `D-684` (c727e10e, 9f6112d3), `D-724` (c044cdd9, 3094f19b, 07a19650, a944481e), `REC-206` (5ff361e9, 17ed9704).

## The legacy ranges, measured again (`1e75fac6b2`)

- `index.mjs` (11,256 lines): the text-unit budget and REC-111 note 217–286; `reextractRow` 3755–3761; the tier ladder `needsTier2` … `ocrTextFromMember` 4227–5414; `op=pdfstructure` 7008–7327; `op=acquire`'s reading block 7366–8079.
- `store.mjs` (46,657 lines): the text-index constants 679–770; `#writeReadings` … `#writeCaptureText` 17983–18640 (`#observeIndexed` stays, observation-log's); `#backfillRefTerms` … `transcribedDocuments` 22038–22202; `#calDriftFor`, `calibrationDrift` (after calibration's merge, 21164–21250); `documentsByReference` 22713–22758; the term helpers 23127–23186; the migrations (`reading_refs` re-key and copy-forward, additive columns, `capture_text_fts` and its triggers, the term backfill); dispatch arms.
- `schema.mjs` (3,428 lines): `readings` … `reading_ref_terms` 210–367, `reading_text_source` 2281–2338, `capture_text` 2863–2944, `reading_history` 3340–3366.
- `bio-checks.mjs`: `REEXTRACT_CHECKS` (C-51) 10924–10991.

## What the module is (`bio-plane/src/extraction/`, 7 files, and `readingprov.mjs`, `extractrun.mjs`)

- `pipeline.mjs`: the reading pipeline (R1–R18): `read(document, io)` over the evidence store, the tier ladder (`tier2Escalate`, `tier3Extend`, `mergeTier3Text`, `askMemberPerPage`, `ocrTextFromMember`, `tier3SeedFrom`), `textUnitsFor`, `readingFromWire`, `containerExtentOf`, `decodeView`, `carryImageUnread`, `layerChainFor`.
- `index.mjs`: `extractionOf(ctx, opts)` (K61; reaches `recordOf`, `membershipOf`, `calibrationOf`), the store half (R19–R30, R36–R40, R51), `pdfStructure` (R31–R35, R52), the registrations (promotion's step R20, `onReading` R24, `calibration.onCalibration` R40) and `extractionOps`, the Durable Object routes the store's dispatcher spreads in: `reading`, `readingref`, `textprovenance`, `calibrationdrift`, `readingtermsclear`, `readinghistoryclear`, `reindexnames`, `extractread`, `pdfstructure`.
- `ops.mjs`: the control plane's handlers `pdfStructureOp` (R31's two pre-checks, then the stamps forwarded) and `acquireReadingOp` (R1: `op=acquire`'s reading over what capture filed).
- `schema.mjs`: the six tables moved verbatim, and `capture_text_skipped` (D-724), `capture_text_state` (R36), `composed_readings` (R21), with the readings row's four R21 columns.
- `checks.mjs`: C-51 (`REEXTRACT_CHECKS`, `reextractRow`), moved from the catalogue (K73 (3)).
- `drift.mjs`: `driftObligations` (R38), extraction's own copy (K136).
- `filemembership.mjs`: N48's derivation (R52).

The legacy store keeps one-line delegations for the reads old suites call over RPC, registers the content stale mark and the observation log's rows with `onReading` (R24) until content and observation-log are extracted, runs `extractionOf(ctx).migrate()` after the schema pass, spreads `extractionOps`, filters extraction's tables out of its purge declaration by `extractionOwns`, and imports the term fold (`labelTerms`, `normAlias`, `refTermSources`) and the index bounds from the module. The control plane's `op=acquire` forwards to capture, then to `extractread`; `op=pdfstructure` is `pdfStructureOp`.

**Where `read` runs.** In the Durable Object, beside record-core's evidence store (R1 names `record-core.evidenceStore`, which only exists there) and `calibration.liveCalibration` (R6). The fleet bindings reach it through the object's env. The cost: a PDF's tier-1 parse now runs in the object rather than the Worker.

## Entries applied

- **T5-2 · the extraction** as above. Removed: from `index.mjs` 2,316 lines (the reading block, `op=pdfstructure`, the ladder, C-51's reader, the budget); from `store.mjs` 1,558 (the writers, reads, re-read, migrations, drift reads, dispatch arms); from `schema.mjs` the six tables; from `bio-checks.mjs` C-51. Added to the legacy modules: 43 lines, every one an import from the module or a line using one (ownership lists them).
- **K49 · R1:** the bytes are read from the evidence store under the document's digest; no field the caller sends supplies text; `op=acquire` still answers `reading` and `text_units` on the document.
- **D-593, D-684 · R3:** a capture whose format has an entry that reads text or structure is read through it over the stored bytes, a `text/csv` read at intake included, so a CSV's text is the entry's own decode; a multi-part capture is assembled from its parts up to 20 MiB (the office entries' measured text bound) and handed to its entry.
- **D-694 · R13:** a delimited-text reading carries its sheet list (the entry's `sheets[]`, through the same container-extent rule as every entry).
- **D-635, D-713 · R8:** a folio page routed by `image_content_unread` keeps its text, gains the transcription appended and is listed in both parts (`readingprov.mjs` names both producers, D-635's half); a re-read seeds such a page with its recorded text and takes it whole, so the folio is never appended twice.
- **D-665, D-697 · R9:** `image_unread` is carried onto a page tier 2 won (text-chain's merge carries only `image_content_*`), discharged on a page OCR fills or appends to, and taken out of the count that judges a decode (`decodeView`, for tier 2's routing and `readText`).
- **D-614 · R10:** each refused page is named with its own reason (no such page, not asked for, carries glyphs); the kept-text clause only when a page kept text.
- **D-616 · R35:** a re-read seeds tier 3 with the pages the stored chain and the whole stored units say were transcribed, so it asks only for the rest.
- **D-685, D-724 · R16, R22:** a unit over the wire's remaining budget is carried as its capped prefix marked `truncated`; every unit left out is named as runs (`text_units_skipped` on the wire, `capture_text_skipped` in the index, `skipped` on the writer's answer and on `unitsOf`); the writer honours the wire's cut. The cap lives in the module (not the catalogue, D-685's second commit): one number for the wire and the writer.
- **N21 · R18:** the recognisers run over `jurisdictions.combine` of record-core's `jurisdiction_profiles` (a test profile's view changes the content type read, tested); an instance that never set the setting passes no view, which is docprofile's K39 fallback until N21's docprofile half.
- **N28 · R22:** a unit's chain kind is `chainKindFor` for its page, the document's last step for a unit with no page grain, `undetermined` where neither can be said; never the `layer` default (D-686).
- **K31 · R20, R24:** the writer is promotion's registered projection and runs before legacy-store's; the stale mark and the observation rows are listeners.
- **K104, K135 (3) · R21:** `read` records the digest of each reading it composes (`composed_readings`); a carried reading not composed here is written with `origin: asserted`, `asserted_by`, its standing and the caller's `reading_justification` verbatim; `readingFor` answers the origin.
- **N41 · R39, R40:** the drift reads go through `calibration.worseSupersessions`; R40 registers with `calibration.onCalibration` and answers `{obligations, truncated}` (K137); legacy-store's listener and its `#calDriftFor` are gone, and it no longer imports `driftObligations` from `calibration.mjs` (K136: calibration can drop its copy).
- **R36:** the index state is the module's own row from its last write (`capture_text_state`), whole, partial, none or null.
- **K23 · R49:** the reading tables are declared to purge by the module, keyed to their bundle; `capture_text_fts` and `composed_readings` whole-store only.
- **K138 · R51:** `capturesReadFor(bundleId)` for content R11's fallback.
- **N48 (K135) · R52, proposed below:** REC-206's derivation lands as `filemembership.mjs`, served on `op=pdfstructure` beside `links[]` as `membership` / `membershipWhy`; the item and file link shapes come from the active profiles' systems, never from code.

## Found in my module and fixed

- The acquire wire dropped a reader's `occurrences` (its `readEntities`), so D-454's per-occurrence rows were never written from an acquire; they are carried now, re-normalised by the writer as before.
- A failed reading's early returns carried no provenance; every branch now composes it at the one site (R15).
- A tier-2 member that failed or was unbound left no trace on the acquire path's reading; the reason is carried (R4).
- `documentsByReference` was unbounded; it is bounded (`limit`, `truncated`, R48).

## Proposed requirement text (N48, K135 (1)) — for BOB to fold in

- **R52** `op=pdfstructure`'s answer carries, beside `links[]` and never inside them, `membership`: an agenda item's membership in a file derived from containment. The item and file links are those whose host is one of an active profile's system's `hosts` and whose path and query match that system's `links.item` or `links.file` pattern (the profile's, never code's). Links are ordered by page and top-down by their rect's top edge; each file link is assigned to the item link whose region (its top edge down to the next item link's) contains its top edge; a file above the first item, and a link with no page rect, is carried in `unplaced`, never assigned. The answer and every pair carry `derived: containment, work: machine, asserted_by: system, grade: C, standing: inferred, established: false`; with no stated shape, no item link of one, or a failed label check, `membership` is null and `membershipWhy` says which. It writes nothing and moves no link or count. *(not yet met for any real instance until `jurisdictions` states the shapes: REPORT 1)*
- **R31**, a wording clarification of its own meaning: "the answer is byte-identical to the read before `ocr=1` existed" apart from R52's two additive keys (REC-206's own suite compared by removing them by name).

## Found in other modules (REPORT)

1. **jurisdictions (R4):** R52 needs a system to state its item and file link shapes. Proposed: `systems[].links: {item: pattern, file: pattern}` (R2's pattern over the path and query), and the Oakland profile's `oakland.legistar` system stating Legistar's gateway shapes measured by REC-206 on M-120 (`^/gateway\.aspx\?m=l&id=/matter\.aspx\?key=\d+`, `^/gateway\.aspx\?m=f&id=[^&#]+`, flags `i`). Until then R52 answers null with its reason on every instance.
2. **pdf-reader:** D-665's half is not in `pdfstructure.mjs`: tier 1 emits no `image_unread` marker, so R9's carry and discharge act on nothing a real PDF produces yet; and REC-206's tier-1 half (link `anchor` text, per-line rects) is not there either, so R52's ends carry `anchor: {text: null, why: "no_anchor_carried"}`.
3. **text-chain:** `mergeTier2Text` carries tier 1's `image_content_*` markers onto a page tier 2 won and not `image_unread` (D-697's other half); extraction carries it after the merge, so text-chain need not change unless it wants the carry in one place.
4. **capture:** `readingInputs` (`capture/acquire.mjs`) and `acquireOp`'s `inputs` are now unused: the reading reads the stored bytes itself. `acquireOp` still computes them (a second read of the primary) on every acquire.
5. **calibration (K136):** the store no longer imports `driftObligations` from `calibration.mjs`; calibration can delete its copy.
6. **retrieval (D-672):** R16 lists pages, paragraphs and slides; a workbook's sheets are not units (D-672's arm in the old `textUnitsFor`). D-672's text-unit half needs R16 to name sheets.
7. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (new `src/extraction/` files; `index.mjs`, `store.mjs`, `schema.mjs`, `readingprov.mjs`, `bio-checks.mjs` changed).
8. **legacy-tests (T5-12):** below, measured against `tranche/T5`.

## Questions

**QUESTION 1** (sent 2026-09-27 06:43; ANSWERED by K135, and K138 moved N48 to R52): (1) N48 is extraction's, served on `op=pdfstructure`, shapes from the profiles, text proposed above; (2) `calibrationOf(ctx)`, adopted after calibration's merge; (3) R21 as read.

**QUESTION 2** (sent 2026-09-27; open). `uses` edge. R11's Drive `convert` step is `drive.mjs`'s `driveConvertStep` (its engine, its unmeasured cap and its `measured_by` sentence have one home there), and `drive.mjs` is `capture-sources`' (layer 3). `extraction`'s `uses` lacks `capture-sources`, so the architecture check fails on that one import. *Best reading:* add `capture-sources` to extraction's `uses` in `build/modules.json` (earlier in the order; BOB's under P17). The alternative, copying the step's three constants here, gives them two homes.

## Tests and checks run

(filled at completion)
