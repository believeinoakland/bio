# extraction.md — the edits for N513

> **DRAFT by a worker for BOB #100, not reviewed.** 2026-10-02, on `tranche/T24` (P18), for T25's opening fold 2. Each edit gives the line numbers of `build/requirements/extraction.md` as it stands at `tranche/T24`, the lines before, and the lines after. Lines not named are unchanged. Applied by BOB at the opening; nothing here is applied yet.

Summary. Retired as moved to `reading-pipeline`: R2→R1, R3→R2, R4→R3, R5→R4, R6→R5, R7→R6, R8→R7, R9→R8, R10→R9, R11→R10, R12→R11, R13→R12, R14→R13, R15→R14, R16→R15, R17→R16, R60→R17, R25→R18, R26→R19. Kept: R1, R18 (the wiring), R31–R35 (citing the new ids), and every other id. Copied, not moved: R44, R45, R50 (→ reading-pipeline R20–R22). No new id here: the seam is reading-pipeline's R23 (the provider is the earlier module). Re-worded: Status, Purpose, `read`'s heading, R23, R30, R31, R33, R34, R58, R66, R68 (references only), Uses, Suggestions. Ids never reused; no requirement that stays changes meaning.

Outside this file (fold 2, not drafted here): `observation-log.md`:76, "`text_chars` on the reading (its R60)" becomes "(`reading-pipeline` R17, carried on `extraction`'s reading)"; `calibration.md`:66, "Extraction's Worker pipeline" becomes "`reading-pipeline` (through the callback `extraction` hands it)".

## 1. Status: a sentence appended (the split; wording only)

Line 3, before:

```text
**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 4. Split by N41 (K73 (7)): the calibration construct, its store region, its tables and C-42 are `build/requirements/calibration.md`'s; the drift obligations stay here. Code today: its own files `bio-plane/src/readingprov.mjs` (218 lines), `extractrun.mjs` (347), and `driftObligations` with its header in `calibration.mjs` (369–429); and inside the legacy modules, measured at `tranche/T3` @ `91933d75`. `bio-plane/src/index.mjs`: the acquire wire's text budget (357–418); `reextractRow` (4123–4129); the tier ladder, merges, chain and reading composers `needsTier2` … `ocrTextFromMember` (4624–5803); `op=pdfstructure` with its `ocr=1` re-read (7614–7957); the reading and text block of `op=acquire` (9225–9928; K49's 9250–9932). `bio-plane/src/store.mjs`: the reading writer, re-extraction, history, text-source and text-index writers `#writeReadings` … `#writeCaptureText` (19969–20626); `#backfillRefTerms`, `readingTermsClear`, `readingHistoryClear`, `reindexNames`, `readingFor`, `transcribedDocuments` (24487–24645), the drift reads `#calDriftFor` and `calibrationDrift` in the calibration region, and `documentsByReference` (25155–25201); the term helpers (25570–25629); the text-index constants (779–800); their dispatch arms (52392–52479, in part). `schema.mjs`: `readings`, `reading_refs`, `reading_ref_terms`, `reading_text_source`, `reading_history`, `capture_text` (and `capture_text_fts`). `bio-checks.mjs`: `REEXTRACT_CHECKS` (C-51). The map is `build/extraction/extraction.md`. Old-plan rows carried here: D-593, D-694, D-724 (K49), D-614, D-616, D-635, D-665, D-684, D-685, D-697, D-713 (D-587 and D-668 went to calibration). Ids renumbered by the split (old → new): R1–R37 unchanged; R38–R40, R42, R43, R45–R47 → calibration R1–R9 (R44's `calibrations` sentence → calibration R6); R41 → R38, R44 → R39, R40 is new (the echo of `op=calibrate`); R48 → R41, R49 → R42, R50 → R43, R51 → R44, R52 → R45, R53 → R46, R54 → R47, R55 → R48, R56 → R49, R57 → R50. folded by a worker for BOB #66, 2026-09-29 (T14 opening; `build/plan/draft-T14-wordings-2.md`, K445): N347 R31 answers `EVIDENCE_NOT_HELD`; N339 widened by N349 (K445) R64; met in T14 (EXTRACTION #6, K466). T19 layer 4's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 4 (rule 6 of `build/plan/current.md`; `build/plan/draft-T19.md` layer 4; `build/extraction/legacy-store.md` §4.2 (5); N26 with `office-readers` R28, K747, K755): R65 (the words' index registered in `provenance`'s testimony slot, K763), R67 (its count figure, record-core R63, and `textIndexOk`) and R66 (N26's migration of stored ¶ and table references) new; `uses` gains `provenance` (layer 3, earlier) for R65; not yet met (T19 layer 4).
```

After:

```text
**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 4. Split by N41 (K73 (7)): the calibration construct, its store region, its tables and C-42 are `build/requirements/calibration.md`'s; the drift obligations stay here. Code today: its own files `bio-plane/src/readingprov.mjs` (218 lines), `extractrun.mjs` (347), and `driftObligations` with its header in `calibration.mjs` (369–429); and inside the legacy modules, measured at `tranche/T3` @ `91933d75`. `bio-plane/src/index.mjs`: the acquire wire's text budget (357–418); `reextractRow` (4123–4129); the tier ladder, merges, chain and reading composers `needsTier2` … `ocrTextFromMember` (4624–5803); `op=pdfstructure` with its `ocr=1` re-read (7614–7957); the reading and text block of `op=acquire` (9225–9928; K49's 9250–9932). `bio-plane/src/store.mjs`: the reading writer, re-extraction, history, text-source and text-index writers `#writeReadings` … `#writeCaptureText` (19969–20626); `#backfillRefTerms`, `readingTermsClear`, `readingHistoryClear`, `reindexNames`, `readingFor`, `transcribedDocuments` (24487–24645), the drift reads `#calDriftFor` and `calibrationDrift` in the calibration region, and `documentsByReference` (25155–25201); the term helpers (25570–25629); the text-index constants (779–800); their dispatch arms (52392–52479, in part). `schema.mjs`: `readings`, `reading_refs`, `reading_ref_terms`, `reading_text_source`, `reading_history`, `capture_text` (and `capture_text_fts`). `bio-checks.mjs`: `REEXTRACT_CHECKS` (C-51). The map is `build/extraction/extraction.md`. Old-plan rows carried here: D-593, D-694, D-724 (K49), D-614, D-616, D-635, D-665, D-684, D-685, D-697, D-713 (D-587 and D-668 went to calibration). Ids renumbered by the split (old → new): R1–R37 unchanged; R38–R40, R42, R43, R45–R47 → calibration R1–R9 (R44's `calibrations` sentence → calibration R6); R41 → R38, R44 → R39, R40 is new (the echo of `op=calibrate`); R48 → R41, R49 → R42, R50 → R43, R51 → R44, R52 → R45, R53 → R46, R54 → R47, R55 → R48, R56 → R49, R57 → R50. folded by a worker for BOB #66, 2026-09-29 (T14 opening; `build/plan/draft-T14-wordings-2.md`, K445): N347 R31 answers `EVIDENCE_NOT_HELD`; N339 widened by N349 (K445) R64; met in T14 (EXTRACTION #6, K466). T19 layer 4's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 4 (rule 6 of `build/plan/current.md`; `build/plan/draft-T19.md` layer 4; `build/extraction/legacy-store.md` §4.2 (5); N26 with `office-readers` R28, K747, K755): R65 (the words' index registered in `provenance`'s testimony slot, K763), R67 (its count figure, record-core R63, and `textIndexOk`) and R66 (N26's migration of stored ¶ and table references) new; `uses` gains `provenance` (layer 3, earlier) for R65; not yet met (T19 layer 4). N513 folded at T25's opening, by BOB from a worker's draft for BOB #100 (`build/plan/draft-T25-req/`; K1193, E-1 only; `build/plan/draft-T25-splits.md` E-1), with no change of meaning: the tier ladder and the reading's provenance (`extraction/pipeline.mjs`, `readingprov.mjs`) split out to `reading-pipeline`, layer 4 directly before this module. R2–R17, R60, R25 and R26 are retired as moved to `reading-pipeline` R1–R19, never reused; R1 and R18 stay (`Extraction.read`'s wiring: the store binding and the view it hands the pipeline); R23, R30, R31, R33, R34, R58, R66 and R68 re-point their references there, wording only; R44, R45 and R50 are stated in both modules (reading-pipeline R20–R22). The Uses lines only the moved text needed leave with it; T25's L4 job moves the code. `extractrun.mjs` (R41–R43) stays (K1193).
```

## 2. Purpose (wording only: the pipeline named)

Line 11, before:

```text
Makes readings from captured bytes. It produces a capture's text through the tier ladder (the format entry in the plane, the `pdf-worker` member, the `ocr-worker` member), composes the transcription chain as it goes, runs the content type's reader over the text, and records the reading with its provenance, its references as they appear, its text units and its text-source projection. It keeps every distinct reading of a capture and attributes a re-read that disagrees; re-reads a capture at a member's request; derives the transcriptions a worse calibration of their engine puts in question. It measures no engine (`calibration`'s). It mints no content (`content`'s), resolves no reference to an entity (`entities`'), fetches nothing from outside, and writes no bundle.
```

After:

```text
Makes readings from captured bytes. It has `reading-pipeline` produce a capture's text through the tier ladder (the format entry in the plane, the `pdf-worker` member, the `ocr-worker` member), compose the transcription chain as it goes and run the content type's reader over the text, and records the reading with its provenance, its references as they appear, its text units and its text-source projection. It keeps every distinct reading of a capture and attributes a re-read that disagrees; re-reads a capture at a member's request; derives the transcriptions a worse calibration of their engine puts in question. It measures no engine (`calibration`'s). It mints no content (`content`'s), resolves no reference to an entity (`entities`'), fetches nothing from outside, and writes no bundle.
```

## 3. `read`'s heading: the pipeline named

Line 17, before:

```text
**read(document, env) → `{reading, text_units?, text_units_over_bound?}`** Reads a stored capture. `document` is `capture`'s acquire answer's document (digest, parts, profile, transport headers, document address, provenance chain). Never throws; every failure is a failed reading.
```

After:

```text
**read(document, env) → `{reading, text_units?, text_units_over_bound?}`** Reads a stored capture through `reading-pipeline.read` (its R1–R17, R23), handing it this module's evidence store (R1), the bindings, the jurisdiction view (R18) and `calibration.liveCalibration` as its callback (reading-pipeline R5). `document` is `capture`'s acquire answer's document (digest, parts, profile, transport headers, document address, provenance chain). Never throws; every failure is a failed reading.
```

## 4. R2–R17 and R60 retired (in their places, between R1 and R18)

Lines 19–35, before:

```text
- **R2** Text read as text (a textual type, single part, within the profile's text bound) with no format entry that reads it is handed to the content type's reader (`docprofile.doctypeFor`'s `parse`): the reading is `{content_type, reader_version, read_from_text: true, found, entities, facts, at, basis, position_parts, position_why}`, `found` exactly when an entity was read. A reader that throws gives a failed reading naming the error; a type with no reader gives `read_from_text: false` and says so.
- **R3** A capture whose detected format has an entry with `text` or `structure` is read through that entry over the stored bytes (tier 1), including delimited text read as text at intake and a multi-part capture within the entry's bound; a CSV's text is the entry's own decode, never the intake's lossy one.
- **R4** Tier 2: a PDF whose tier-1 undetermined markers outnumber the glyphs of its text, unless every marker is `no_text_layer`, is sent to `pdf-worker` when bound and merged page by page by `text-chain.mergeTier2Text`. The tier-1 producer marker is carried when the member supplies none. The wired tier is 2 only when a page was replaced; a document with pages from both tiers gets a chain of two page-scoped parts; the merge's per-page statement is kept for R7. A member that fails, refuses or is unbound leaves tier 1 standing, and the reason is carried. (N253, K293) The markers counted exclude `image_unread` (pdf-reader R34: an unread image, no undecoded character), and a scan marker is any of `no_text_layer`, `image_content_unread`, `image_content_undetermined`.
- **R5** Tier 3 selection: a document is a candidate when a page carries `no_text_layer` and none carries `encrypted`; the pages asked for are those pages, ascending. With `ocr-worker` bound, each page the member defers is asked for again, one page per call, in order, up to 24 calls per request. A page past that budget, the pages after a call that throws, a page the member declines, a page answered under another engine build (`engine`, `version`, `cap`, `measured_by` or `confidence_floor` differ from the first answer) and a page it was not asked for are not merged, and the note says which. With no member bound the document stays unread and the note says no OCR engine is installed.
- **R6** A member's answer is taken only when it names its engine and version and a measured `cap` with `measured_by`. A region with no checkable image anchor is dropped and counted; a region below the member's confidence floor reads undetermined and its text is discarded; a page no region anchors is not merged. The OCR part's chain is `pixels → ocr(engine, version)`, both at the member's cap, naming the live calibration of that engine and version (`calibration.liveCalibration`, R10 there), or none when there is none or it cannot be read.
- **R7** The tier-3 merge fills only asked-for pages whose text holds no glyph; any other page the member returns is refused. A base with no per-page text refuses OCR when it holds a glyph and takes it whole when it holds none. The merged chain's parts are the tier-1 and tier-2 pages as R4's merge stated them, any other layer page at the wired tier, and the filled pages under R6's chain; a page with no glyph is in no part. The wired tier is 3 when a page was filled. `tier3_candidate` is true exactly when the document was selected and nothing was filled or a selected page is still unread.
- **R8** A page routed to OCR whose layer text is only a folio keeps that text, gains the transcription appended, and is listed in both parts; a later re-read never appends it again.
- **R9** A page tier 2 wins keeps a still-true `image_unread` marker; a page OCR fills, by replacement or append, discharges it. (N253, K293) The tier-2 half is carried by `text-chain.mergeTier2Text` (its R90).
- **R10** The tier-3 note gives each refused page its own reason (no such page, not asked for, carries glyphs), and says a page held text only when it did.
- **R11** The chain is null until a text surface answers. A layer's chain is `text-chain.layerChain` at the wired tier with its cap undetermined and the reason stated; a layer whose producer marker names OCR software gains `ocr(<product>)` uncapped. A Drive export (the document's chain carries Google's export hop) gets `convert(google-export, <format>)` at the head, cap undetermined, after every other part is settled; if that prepend is refused, no chain is recorded and the reading fails, naming the refusal.
- **R12** Final text goes to `docprofile.readText` with the headers, document address, content type and retrieval instant. A determined reading carries `text_source` (the chain), `text_tier`, `text_container`, and a basis naming the reader, the chain, the tier, the tier-2 and tier-3 notes and where references were read (all, some with the reason, or none with the producer's reason). An undetermined one is a failed reading whose basis gives the tier notes and the entry's reason. (N253, K293) Its `image_unread` markers are not counted as undecoded (R4).
- **R13** `page_count` is the structure reader's count when positive, else null, never zero. `container_extent` names the levels the entry emitted (sheets, paragraphs, slides by list; tables, images by key): a sheet's `rows`, `cols`, `usedRows`, `usedCols` as integers or null; slides keyed by slide number, as long as the deck's `deckLength`; for a PDF, the images its pages paint as `{page, rect}`, or `images_why`. Absent when no entry answered; present and null when one answered and itemised nothing. A delimited-text reading carries its sheet list. (N100, K293) `page_boxes` follows `page_count`'s rule: present exactly where `page_count` is; null when no structure reader answered a box (a non-PDF, a structure with no `pageBoxes`, or one this wire cannot read whole); else `pdf-reader`'s `pageBoxes` (its R33) as `{boxes, of_page}`, each box `{media_box, w, h, rotate}`, a page whose box it could not read null in `of_page`; never a partial list.
- **R14** `reading.dialect` is absent when no entry answered a decoding choice, null when one answered and could not state it, else `format-registry.readingDialect`'s `{delimiter, encoding}`; a dialect signature that throws leaves it absent.
- **R15** `reading.provenance` is `readingProvenance`'s (R25), composed at one site for every branch, over exactly the text the reader was handed; text read as text at intake names the plane with tier null. 
- **R60** (N139, D-375, K293) A reading whose provenance digested a text (R15) carries `text_chars`, `text_glyphs` and `text_undetermined`, taken over exactly the text the reader was handed: I2's `counts.chars`; the glyphs of its `document` (`text-chain.glyphCount`); and I2's `counts.undetermined`, not counting `image_unread` (R4). Each is a non-negative integer, or null when that text states no such figure. A bare string gives its length, its glyphs and null. A reading with no text has none of the three keys. A re-read (R34) carries its own by this rule.
- **R16** Text units: one per page, paragraph, slide or sheet holding a glyph, its extent in the producer's own numbering and `seq` its position; a sheet is a unit only when its reader names its used range, and its extent is that `sheet-range` (`{kind: "sheet-range", sheet, range}`); a sheet with no named range is no unit (D-672, N108, K179). The wire carries at most 512 KiB, each unit charged its UTF-8 bytes plus 128. A unit that does not fit is carried as its capped prefix marked `truncated`, and every unit left out is named. An absent unit list and an empty one are different answers.
- **R17** Nothing about the source is fetched: tiers 2 and 3 are reached only through their bindings, with the capture's digest and store.
```

After:

```text
- **R2** *(retired: moved to reading-pipeline R1, N513, T25)*
- **R3** *(retired: moved to reading-pipeline R2, N513, T25)*
- **R4** *(retired: moved to reading-pipeline R3, N513, T25)*
- **R5** *(retired: moved to reading-pipeline R4, N513, T25)*
- **R6** *(retired: moved to reading-pipeline R5, N513, T25)*
- **R7** *(retired: moved to reading-pipeline R6, N513, T25)*
- **R8** *(retired: moved to reading-pipeline R7, N513, T25)*
- **R9** *(retired: moved to reading-pipeline R8, N513, T25)*
- **R10** *(retired: moved to reading-pipeline R9, N513, T25)*
- **R11** *(retired: moved to reading-pipeline R10, N513, T25)*
- **R12** *(retired: moved to reading-pipeline R11, N513, T25)*
- **R13** *(retired: moved to reading-pipeline R12, N513, T25)*
- **R14** *(retired: moved to reading-pipeline R13, N513, T25)*
- **R15** *(retired: moved to reading-pipeline R14, N513, T25)*
- **R60** *(retired: moved to reading-pipeline R17, N513, T25)*
- **R16** *(retired: moved to reading-pipeline R15, N513, T25)*
- **R17** *(retired: moved to reading-pipeline R16, N513, T25)*
```

## 5. The pure rules' heading and R25, R26 retired

Lines 46–48, before:

```text
**The pure rules (`readingprov.mjs`)**
- **R25** `readingProvenance({text, chain, tier, container, planeVersion, member})` → scheme `reading-provenance/1`, `text_tier`, `container`, `text_sha256` of `docprofile.flattenText`'s text (null for empty or absent text, with `why`), `text_chars`, `text_from`, `producers` and `pages`. A page's tier comes from the chain first (a covering `pixels` step is 3, naming the next `ocr` step's engine; else the covering `layer` step's tier), then the page's own stamp, then the document's tier; the member is 1 → plane (with its version), 2 → `pdf-worker`, 3 → `ocr-worker`, else null. A page with no text is listed and neither digested nor credited. Text with no page grain is credited to one producer, and `pages_why` says so.
- **R26** `compareProvenance(prior, next)` → `agrees` (equal digests), `differs` (with `changed[]`: pages grouped by the tier and member before and now, and a sentence in the shape *tier 3 on ocr-worker returned different text for page 1*), `undetermined` (either side carries no provenance: never inferred from the tier or the chain) or `no_text` (neither digested text). `describePages` numbers pages from 1 and folds runs.
```

After:

```text
**The pure rules (`readingprov.mjs`)** (moved to `reading-pipeline` by N513, K1193, T25; the ids are never reused)
- **R25** *(retired: moved to reading-pipeline R18, N513, T25)*
- **R26** *(retired: moved to reading-pipeline R19, N513, T25)*
```

## 6. R23: its reference re-pointed

Line 43, before:

```text
- **R23** Every distinct reading of a capture is kept in arrival order, keyed by the digest of its JSON, before the `readings` row is replaced. A reading equal to the latest kept one is not kept again. A capture whose one reading predates the history has it kept first. Each kept reading stores `compareProvenance` against the one before it (R26).
```

After:

```text
- **R23** Every distinct reading of a capture is kept in arrival order, keyed by the digest of its JSON, before the `readings` row is replaced. A reading equal to the latest kept one is not kept again. A capture whose one reading predates the history has it kept first. Each kept reading stores `compareProvenance` against the one before it (reading-pipeline R19).
```

## 7. R30: its references re-pointed

Line 54, before:

```text
- **R30** `readingOf(captureSha)` → `{reading, chain, pageCount, containerExtent, textContainer, captureFormat}` or null: the persisted reading's facts that `content` bounds a citation by (content R12–R13). `pageCount` is the stored `page_count` when a positive integer, else null, never zero; `containerExtent` is as R13 stored it, absent when never stored and null when stored null; `captureFormat` is the profile's format key the reading was written with. It withholds nothing, being about the document's own bytes; callers gate the bundle. (N100, K293) The answer carries `pageBoxes` as R13 stored it: absent when never stored, null when stored null.
```

After:

```text
- **R30** `readingOf(captureSha)` → `{reading, chain, pageCount, containerExtent, textContainer, captureFormat}` or null: the persisted reading's facts that `content` bounds a citation by (content R12–R13). `pageCount` is the stored `page_count` when a positive integer, else null, never zero; `containerExtent` is as reading-pipeline R12 states it, as stored, absent when never stored and null when stored null; `captureFormat` is the profile's format key the reading was written with. It withholds nothing, being about the document's own bytes; callers gate the bundle. (N100, K293) The answer carries `pageBoxes` as reading-pipeline R12 states it, as stored: absent when never stored, null when stored null.
```

## 8. R31: its references re-pointed

Line 60, before:

```text
- **R31** Without `ocr` it is a read: `sha256` must be 64 lowercase hex (required-argument refusal); no evidence store is the storage-absent refusal; an absent object is `capture`'s one answer for it (`evidenceAbsent`, its R63: `EVIDENCE_NOT_HELD`, 404); no registered `pdf` entry is `FORMAT_UNREGISTERED` (501); a non-PDF is the entry's own answer (422). Otherwise the structure with tier 2 per R4 (notes `tier2_no_improvement`, `tier2_unavailable`), its `tier` and `provenance` (R25). Nothing is written, and the answer is byte-identical to the read before `ocr=1` existed, apart from R52's two additive keys (`membership`, `membershipWhy`). (N100, K293) The plain read also carries `pdf-reader`'s own `pageBoxes` (its R33) beside R52's two additive keys.
```

After:

```text
- **R31** Without `ocr` it is a read: `sha256` must be 64 lowercase hex (required-argument refusal); no evidence store is the storage-absent refusal; an absent object is `capture`'s one answer for it (`evidenceAbsent`, its R63: `EVIDENCE_NOT_HELD`, 404); no registered `pdf` entry is `FORMAT_UNREGISTERED` (501); a non-PDF is the entry's own answer (422). Otherwise the structure with tier 2 per reading-pipeline R3 (notes `tier2_no_improvement`, `tier2_unavailable`), its `tier` and `provenance` (reading-pipeline R18). Nothing is written, and the answer is byte-identical to the read before `ocr=1` existed, apart from R52's two additive keys (`membership`, `membershipWhy`). (N100, K293) The plain read also carries `pdf-reader`'s own `pageBoxes` (its R33) beside R52's two additive keys.
```

## 9. R33: its reference re-pointed

Line 63, before:

```text
- **R33** Tier 3 then runs per R5–R7. With no page filled the answer's `reextraction` is `{performed: false, written: false, cost, candidate, why}` and nothing is written.
```

After:

```text
- **R33** Tier 3 then runs per reading-pipeline R4–R6. With no page filled the answer's `reextraction` is `{performed: false, written: false, cost, candidate, why}` and nothing is written.
```

## 10. R34: its references re-pointed

Line 64, before:

```text
- **R34** With pages filled, the reading is composed by R12's rule with the stored reading's content type and reader version, `at` kept as the capture instant, `page_count` and `container_extent` carried, R25's provenance, and `reextracted: {at, by, engine, version, calibration, pages, via: "op=pdfstructure&ocr=1"}`. It is written by R19, `by` stamped by the control plane. The answer's `reextraction` gives `performed`, `written`, the pages, engine, chain, a reading summary, and what the listeners and index reported (`staled`, `units`, `observed`, `compared`). No bundle version is minted. (N100, K293) `page_boxes` is the structure's (R13's rule), else the stored reading's when it holds the key, else absent.
```

After:

```text
- **R34** With pages filled, the reading is composed by reading-pipeline R11's rule with the stored reading's content type and reader version, `at` kept as the capture instant, `page_count` and `container_extent` carried, reading-pipeline R18's provenance, and `reextracted: {at, by, engine, version, calibration, pages, via: "op=pdfstructure&ocr=1"}`. It is written by R19, `by` stamped by the control plane. The answer's `reextraction` gives `performed`, `written`, the pages, engine, chain, a reading summary, and what the listeners and index reported (`staled`, `units`, `observed`, `compared`). No bundle version is minted. (N100, K293) `page_boxes` is the structure's (reading-pipeline R12's rule), else the stored reading's when it holds the key, else absent.
```

## 11. R58: its reference re-pointed

Line 69, before:

```text
- **R58** The tables `readings`, `reading_refs`, `reading_ref_terms` and `capture_text_skipped`, with the columns named here, are a stated read contract: a later module may join them in its own SQL (entities R9–R19 read all three reading tables; connections joins `reading_refs`' positions and occurrences; retrieval's frontier reads `reading_refs` and `readings`, and its content axis `capture_text_skipped`), and this module changes none of those columns' names or meaning without a change to this requirement carried to every such reader (P5). No other column is part of it, and every write to these tables stays this module's. `readings`: `capture_sha` (one row for each capture read, a failed reading included), `bundle_id` (the bundle whose promotion or re-read last wrote it), `content_type` (the reader's content-type key, or null). `reading_refs`: `capture_sha`, `bundle_id`; `ref` (raw `kind:key`, never resolved, R46); `ref_kind`, `ref_key`, `label` (as emitted, or null); `pos_kind`, `pos`, `pos_ref` (all three or none; none means the reading cannot say where, never the whole document); `occurrence` (`pos_kind:pos`, or empty for the one unplaced row); `seq` (the reading order among one reference's occurrences, 0 first). `reading_ref_terms`: `capture_sha`, `bundle_id`, `ref`; `src` (`ref`, `key` or `label`; `key` only when the key folds to something other than the whole reference); `term` (one of R59's `labelTerms` of that source string); a name is matched within one (`capture_sha`, `ref`, `src`) group, never across sources. `capture_text_skipped`: `capture_sha`, `bundle_id`, `first_seq`, `last_seq`, `units`, `first_extent`, `first_ref`, `last_extent`, `last_ref`, `side` (`wire` or `store`): one row per run of consecutive units R16 or R22 skipped. *(N108, K179)* (N151, K293) A fifth table: `reading_text_source`: `capture_sha` (one row per capture whose reading carries a well-formed chain; none for an absent or malformed chain, R19) and `chain` (that chain as JSON, exactly the reading's `text_source`).
```

After:

```text
- **R58** The tables `readings`, `reading_refs`, `reading_ref_terms` and `capture_text_skipped`, with the columns named here, are a stated read contract: a later module may join them in its own SQL (entities R9–R19 read all three reading tables; connections joins `reading_refs`' positions and occurrences; retrieval's frontier reads `reading_refs` and `readings`, and its content axis `capture_text_skipped`), and this module changes none of those columns' names or meaning without a change to this requirement carried to every such reader (P5). No other column is part of it, and every write to these tables stays this module's. `readings`: `capture_sha` (one row for each capture read, a failed reading included), `bundle_id` (the bundle whose promotion or re-read last wrote it), `content_type` (the reader's content-type key, or null). `reading_refs`: `capture_sha`, `bundle_id`; `ref` (raw `kind:key`, never resolved, R46); `ref_kind`, `ref_key`, `label` (as emitted, or null); `pos_kind`, `pos`, `pos_ref` (all three or none; none means the reading cannot say where, never the whole document); `occurrence` (`pos_kind:pos`, or empty for the one unplaced row); `seq` (the reading order among one reference's occurrences, 0 first). `reading_ref_terms`: `capture_sha`, `bundle_id`, `ref`; `src` (`ref`, `key` or `label`; `key` only when the key folds to something other than the whole reference); `term` (one of R59's `labelTerms` of that source string); a name is matched within one (`capture_sha`, `ref`, `src`) group, never across sources. `capture_text_skipped`: `capture_sha`, `bundle_id`, `first_seq`, `last_seq`, `units`, `first_extent`, `first_ref`, `last_extent`, `last_ref`, `side` (`wire` or `store`): one row per run of consecutive units reading-pipeline R15 or R22 skipped. *(N108, K179)* (N151, K293) A fifth table: `reading_text_source`: `capture_sha` (one row per capture whose reading carries a well-formed chain; none for an absent or malformed chain, R19) and `chain` (that chain as JSON, exactly the reading's `text_source`).
```

## 12. R66: its references re-pointed

Line 82, before:

```text
- **R66** Once per stored reading, a `.docx` reading made before N26 whose `word/document.xml` holds an `mc:AlternateContent` with a branch now not read (R11 there) is migrated; every other reading, and a `.docx` with no such branch, is left as it is. The stored bytes are read again (R1, R3), so the reading's text, paragraphs, tables and counts lose the duplicated branch and gain nothing; the reading it replaces is kept (R23). Every reference to a paragraph, run or table this module holds for that capture is moved by `office-readers`' `docxRenumbering` over the stored `word/document.xml` (its R28): a `doc-para` `para` (and its `ref` `¶<n+1>`) to `paragraphs[old].new`, one inside a branch not read to `paragraphs[old].outer` as a whole paragraph with no run, or left unplaced when `outer` is null; a `run` by `runs[i]` the same way; a `doc-table` `table` (and its `ref` `table <n+1>`) to `tables[old].new`. The references moved are the reading's own (its paragraphs, tables, link sources and `#para=` anchors, evidentiary `source`s, paragraph count), the references' places (`reading_refs` positions and occurrences of kind `doc-para`), the text units' `doc-para` extents and `seq` (R16, R22) and the skipped-unit extents. A migrated reading is marked so a second run moves nothing. It re-grades nothing (R44) and resolves nothing (R46); references held outside this module are not moved by it. The new reading goes through R19's writer, never rewriting `capture_text` in place, and its docx layer step carries a reader mark (N26) so the capture's chain differs from the old reading's: R22 then marks stale the content rows minted over that capture and R41 grades and notifies, so no content row silently resolves to other text (K763). A capture whose renumbering moves nothing gets no mark and no re-read.
```

After:

```text
- **R66** Once per stored reading, a `.docx` reading made before N26 whose `word/document.xml` holds an `mc:AlternateContent` with a branch now not read (R11 there) is migrated; every other reading, and a `.docx` with no such branch, is left as it is. The stored bytes are read again (R1, reading-pipeline R2), so the reading's text, paragraphs, tables and counts lose the duplicated branch and gain nothing; the reading it replaces is kept (R23). Every reference to a paragraph, run or table this module holds for that capture is moved by `office-readers`' `docxRenumbering` over the stored `word/document.xml` (its R28): a `doc-para` `para` (and its `ref` `¶<n+1>`) to `paragraphs[old].new`, one inside a branch not read to `paragraphs[old].outer` as a whole paragraph with no run, or left unplaced when `outer` is null; a `run` by `runs[i]` the same way; a `doc-table` `table` (and its `ref` `table <n+1>`) to `tables[old].new`. The references moved are the reading's own (its paragraphs, tables, link sources and `#para=` anchors, evidentiary `source`s, paragraph count), the references' places (`reading_refs` positions and occurrences of kind `doc-para`), the text units' `doc-para` extents and `seq` (reading-pipeline R15, R22) and the skipped-unit extents. A migrated reading is marked so a second run moves nothing. It re-grades nothing (R44) and resolves nothing (R46); references held outside this module are not moved by it. The new reading goes through R19's writer, never rewriting `capture_text` in place, and its docx layer step carries a reader mark (N26) so the capture's chain differs from the old reading's: R22 then marks stale the content rows minted over that capture and R41 grades and notifies, so no content row silently resolves to other text (K763). A capture whose renumbering moves nothing gets no mark and no re-read.
```

## 13. R68: its reference re-pointed

Line 97, before:

```text
- **R68** (N439, K747, K795 (6)) Once per stored reading, a `.pptx` reading made before N439 whose slides hold an `mc:AlternateContent` with a branch now not read (R11 there) is migrated as R66 migrates a `.docx`; every other reading, and a `.pptx` with no such branch, is left as it is. The stored bytes are read again (R1, R3), so the reading's slide text loses the duplicated branch and gains nothing; slide numbers and the slide-grain unit do not move; the reading it replaces is kept (R23). Every `slide-shape` `shape` reference this module holds for that capture is moved by `office-readers`' `pptxRenumbering` over the stored parts (its R29): a `shape` to its slide's `shapes[old].new`, left unplaced when that is null. The references moved are the reading's own, the references' places (`reading_refs` positions and occurrences of kind `slide-shape`) and the text units' `slide-shape` extents. A migrated reading is marked so a second run moves nothing. It re-grades nothing (R44) and resolves nothing (R46); references held outside this module are not moved by it. The new reading goes through R19's writer, never rewriting `capture_text` in place, and its pptx layer step carries a reader mark (N439) so the capture's chain differs from the old reading's: R22 then marks stale the content rows minted over that capture and R41 grades and notifies (K763). A capture whose renumbering moves nothing gets no mark and no re-read.
```

After:

```text
- **R68** (N439, K747, K795 (6)) Once per stored reading, a `.pptx` reading made before N439 whose slides hold an `mc:AlternateContent` with a branch now not read (R11 there) is migrated as R66 migrates a `.docx`; every other reading, and a `.pptx` with no such branch, is left as it is. The stored bytes are read again (R1, reading-pipeline R2), so the reading's slide text loses the duplicated branch and gains nothing; slide numbers and the slide-grain unit do not move; the reading it replaces is kept (R23). Every `slide-shape` `shape` reference this module holds for that capture is moved by `office-readers`' `pptxRenumbering` over the stored parts (its R29): a `shape` to its slide's `shapes[old].new`, left unplaced when that is null. The references moved are the reading's own, the references' places (`reading_refs` positions and occurrences of kind `slide-shape`) and the text units' `slide-shape` extents. A migrated reading is marked so a second run moves nothing. It re-grades nothing (R44) and resolves nothing (R46); references held outside this module are not moved by it. The new reading goes through R19's writer, never rewriting `capture_text` in place, and its pptx layer step carries a reader mark (N439) so the capture's chain differs from the old reading's: R22 then marks stale the content rows minted over that capture and R41 grades and notifies (K763). A capture whose renumbering moves nothing gets no mark and no re-read.
```

## 14. Uses: the moved names leave, `reading-pipeline` added (wording only)

Lines 107–110, before:

```text
- `text-chain`: `appendStep`, `checkChain`, `derivationCap`, `layerChain`, `mergedChain`, `mergeTier2Text`, `tier2Note`, `glyphCount`, `describeChain`, `readingSource`, `readingSourceJson`, `readingOccurrenceKey`, `applyConfidenceFloor`, `checkAnchor`, `calibrationsOf`, `isTranscribed`, `terminalStep`, `chainKindFor`, `STEP_KINDS`.
- `format-registry`: `getFormat`, `readingDialect`.
- `docprofile`: `doctypeFor`, `readText`, `flattenText`.
- `pdf-worker`, `ocr-worker`: through their bindings only (R4–R6).
```

After:

```text
- `text-chain`: `appendStep` (R43), `checkChain`, `derivationCap`, `glyphCount`, `describeChain`, `readingSource`, `readingSourceJson`, `readingOccurrenceKey`, `calibrationsOf`, `isTranscribed`, `terminalStep`, `chainKindFor`, `STEP_KINDS`. (`layerChain`, `mergedChain`, `mergeTier2Text`, `tier2Note`, `applyConfidenceFloor` and `checkAnchor` leave with the pipeline.)
- `format-registry`: `getFormat` (R31's `pdf` entry; R66, R68). (`readingDialect` leaves with the pipeline.)
- `docprofile`: `readText` (R34's composed reading). (`doctypeFor` and `flattenText` leave with the pipeline.)
- `reading-pipeline`: `read` (its R1–R17) for this module's `read`, R1 and R18 handing it the store and the view; `tier2Escalate`, `tier3Extend`, `tier3SeedFrom`, `needsTier3`, `textUnitsFor`, `layerChainFor`, `readingFromWire`, `decodeView`, `textCountsOf`, `pageBoxesFrom`, `bytesOf`, `CAPTURE_TEXT_UNIT_CAP` (its R23) for R22 and R31–R35; `readingProvenance`, `compareProvenance`, `PROVENANCE_SCHEME` (its R18, R19, R23) for R23, R31 and R34.
- `ocr-worker`: its binding's presence only (R32's C-51.4); its calls go through `reading-pipeline` (its R4–R6). `pdf-worker` is reached only through `reading-pipeline` (its R3); the `modules.json` edge is the L4 job's to measure (`draft-T25-splits.md` E-1).
```

## 15. Uses: calibration's line

Line 114, before:

```text
- `calibration`: `liveCalibration` (R6), `drifted`, `worseSupersessions` (R38–R39), `onCalibration` (R40).
```

After:

```text
- `calibration`: `liveCalibration` (handed to `reading-pipeline.read` as its callback, its R5), `drifted`, `worseSupersessions` (R38–R39), `onCalibration` (R40).
```

## 16. Invariants: no change (R44, R45, R50 stay; reading-pipeline R20–R22 copy them)

## 17. Satisfies: no change (`reading-pipeline` copies the share R1–R19 there serve; this module keeps the re-read's and the store's)

## 18. Suggestions: Two halves

Line 143, before:

```text
- **Two halves.** The pipeline (R1–R18, R31–R35) runs in the Worker with the fleet bindings; the store half (R19–R30, R36–R40) is `extractionOf(ctx)` (K61). The pipeline reaches the store half as `index.mjs` reaches the store today; its one calibration read (R6's live calibration) becomes `calibration.liveCalibration` rather than an `op=calibrations` fetch.
```

After:

```text
- **Two halves.** The pipeline (old R2–R17, R60, R25, R26) is `reading-pipeline`'s since N513 and runs in the Worker with the fleet bindings; this module's `read` (R1, R18) and re-read (R31–R35) hand it the store, the view and the live calibration. The store half (R19–R30, R36–R40) is `extractionOf(ctx)` (K61). The pipeline reaches the store half as `index.mjs` reaches the store today; its one calibration read (reading-pipeline R5's live calibration) becomes `calibration.liveCalibration` rather than an `op=calibrations` fetch.
```

## 19. Suggestions: Tests

Line 148, before:

```text
- Tests: each C-51 refusal gets a negative control; R40 gets an arm that its echo equals `op=calibrationdrift`'s rows for the superseded calibration; R3, R16 and R22 get over-strictness arms (a PDF and an office capture read byte for byte as before); R31 keeps the pinned digest of the plain read. Built work: D-616, D-635, D-665 on `land/worker/D-6xx`; D-684, D-685, D-724 stacked on `land/worker/D-724` over D-672 and D-415 (map §4); judged at the job.
```

After:

```text
- Tests: each C-51 refusal gets a negative control; R40 gets an arm that its echo equals `op=calibrationdrift`'s rows for the superseded calibration; R22 gets an over-strictness arm (reading-pipeline R2 and R15, old R3 and R16, carry theirs) (a PDF and an office capture read byte for byte as before); R31 keeps the pinned digest of the plain read. Built work: D-616, D-635, D-665 on `land/worker/D-6xx`; D-684, D-685, D-724 stacked on `land/worker/D-724` over D-672 and D-415 (map §4); judged at the job.
```
