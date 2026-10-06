# reading-pipeline — requirements

**Status** · Split from `extraction` by N513 (K617's split of a module along seams BOB names; K1193, E-1 only; `build/plan/draft-T25-splits.md` E-1; `build/plan/draft-T25.md` fold 2), with no change of meaning. R1–R19 are `extraction` R2–R17, R60, R25 and R26, in that order. Their text is kept and only their cross-references are re-pointed (a reference to a requirement that moved here is to its id here; one that stays is `extraction R<n>`). R20–R22 copy `extraction`'s invariants R44, R45 and R50, which bind both modules and are stated in both (R20 without R44's drift and proposal clauses, which have no subject here). R24 states `read`'s signature and its errors, the text `extraction`'s heading for `read` held, so the coverage check names it (BOB's ruling on these drafts' review, decision 4). `extraction` retires R2–R17, R25, R26 and R60 as moved, and never reuses them. It keeps R1 (the store binding, never the caller's) and R18 (the jurisdiction view), which are `Extraction.read`'s wiring: it hands this module's `read` the evidence store and the view. Every moved requirement was met in `extraction`, and each is marked not yet met (T25) here, because the move itself is T25's L4 job (accepted red 3). By BOB's ruling on the seam, R23 states the pieces of `read` that `extraction`'s re-read (its R31–R35) composes; this is new wording, BOB's (see Suggestions). Layer 4, directly after `calibration` and before `extraction`. For BOB's review and Bob's approval (a product module, P17). The text is the text Bob's rulings (K102, K293, DEC-4, DEC-75) already settled. T33's fold, by a requirements worker for BOB #114 on `tranche/T33`, 2026-10-05, from plan entry T33-23 (entries B B1a.4; K1468, D177): R25–R27 (the opt-in after-read hook `onRead`, run after commit in `MODULE_ORDER`, refusing through `listenerRefusal`) added; Uses gain `membership` (`listenerRefusal`, `MODULE_ORDER`); not yet met (T33-23).

| old (`extraction`) | new | | old | new | |
|---|---|---|---|---|---|
| R2 | R1 | text read as text | R11 | R10 | the chain |
| R3 | R2 | tier 1 | R12 | R11 | final text, basis |
| R4 | R3 | tier 2 | R13 | R12 | page count, extent, boxes |
| R5 | R4 | tier 3 selection | R14 | R13 | dialect |
| R6 | R5 | a member's answer | R15 | R14 | `reading.provenance` |
| R7 | R6 | the tier-3 merge | R60 | R17 | text counts |
| R8 | R7 | a folio page | R16 | R15 | text units, the wire's bound |
| R9 | R8 | `image_unread` | R17 | R16 | nothing fetched |
| R10 | R9 | the tier-3 note | R25 | R18 | `readingProvenance` |
| | | | R26 | R19 | `compareProvenance` |
| R44, R45, R50 | R20, R21, R22 | invariants (copies) | — | R23 | the re-read's pieces (seam, new wording) |
| `read`'s heading | R24 | `read`'s signature and errors | | | |

**Size (P6).** This module takes `bio-plane/src/extraction/pipeline.mjs` (1,070) and `bio-plane/src/readingprov.mjs` (253) whole, into `bio-plane/src/reading-pipeline/`: 1,323 lines. The tests are:
- `test/m/extraction/read.test.mjs`, less its R1, R18 and `acquireReadingOp` arms;
- `convert-ocr.test.mjs`, `staffdirectory.test.mjs`, and `convert-tiers.test.mjs` less its R31/R34 arms;
- the R25/R26 cases of `rules.test.mjs`;
- the six legacy-path tests and fixtures `modules.json` names (`modules-json.md`).

Well under 4,000.

## Public

### Purpose

Produces a capture's reading from its stored bytes, for `extraction`, which stores it. It runs the tier ladder: the format entry in the plane, the `pdf-worker` member, and the `ocr-worker` member. It composes the transcription chain as it goes, runs the content type's reader over the text, and states the reading's provenance, its text counts, its container and its text units. It is pure: it holds no record, no table and no catalogue row. It reads the bytes only from the evidence store it is handed, fetches nothing about the source, and reaches tiers 2 and 3 only through their bindings.

### Provides

Terms (as `extraction` states them). **I2 text** is the text shape format entries and the two members return (`format-registry`, `text-chain`). **Tier** 1 is the format entry in the plane, 2 the `pdf-worker` member (binding `PDF_WORKER`), 3 the `ocr-worker` member (binding `OCR_WORKER`). A **glyph** is a non-whitespace code point (`text-chain.glyphCount`). A **failed reading** is `found: false` with no entities and a basis saying why; it is never an emptied document.

**read(document, {evidence, env, storeName, view, planeVersion, liveCalibration}) → `{reading, text_units?, text_units_over_bound?}`**

Reads a stored capture. `document` is `capture`'s acquire answer's document (digest, parts, profile, transport headers, document address, provenance chain). The caller (`extraction`, its R1 and R18) hands in the rest:
- `evidence`: the evidence store the bytes are read from (`record-core.evidenceStore`'s answer, or null);
- `env`: the fleet bindings;
- `storeName`: the namespace the members read the capture under;
- `view`: the jurisdiction view every recogniser runs over;
- `planeVersion`;
- `liveCalibration`: R5's live-calibration read, as a callback.

- **R24** With no store handed in, or the object absent, the reading is a failed reading saying so. Never throws; every failure is a failed reading.
- **R1** Text read as text (a textual type, single part, within the profile's text bound) with no format entry that reads it is handed to the content type's reader (`docprofile.doctypeFor`'s `parse`): the reading is `{content_type, reader_version, read_from_text: true, found, entities, facts, at, basis, position_parts, position_why}`, `found` exactly when an entity was read. A reader that throws gives a failed reading naming the error; a type with no reader gives `read_from_text: false` and says so.
- **R2** A capture whose detected format has an entry with `text` or `structure` is read through that entry over the stored bytes (tier 1), including delimited text read as text at intake and a multi-part capture within the entry's bound; a CSV's text is the entry's own decode, never the intake's lossy one.
- **R3** Tier 2: a PDF whose tier-1 undetermined markers outnumber the glyphs of its text, unless every marker is `no_text_layer`, is sent to `pdf-worker` when bound and merged page by page by `text-chain.mergeTier2Text`. The tier-1 producer marker is carried when the member supplies none. The wired tier is 2 only when a page was replaced; a document with pages from both tiers gets a chain of two page-scoped parts; the merge's per-page statement is kept for R6. A member that fails, refuses or is unbound leaves tier 1 standing, and the reason is carried. (N253, K293) The markers counted exclude `image_unread` (pdf-reader R34: an unread image, no undecoded character), and a scan marker is any of `no_text_layer`, `image_content_unread`, `image_content_undetermined`.
- **R4** Tier 3 selection: a document is a candidate when a page carries `no_text_layer` and none carries `encrypted`; the pages asked for are those pages, ascending. With `ocr-worker` bound, each page the member defers is asked for again, one page per call, in order, up to 24 calls per request. A page past that budget, the pages after a call that throws, a page the member declines, a page answered under another engine build (`engine`, `version`, `cap`, `measured_by` or `confidence_floor` differ from the first answer) and a page it was not asked for are not merged, and the note says which. With no member bound the document stays unread and the note says no OCR engine is installed.
- **R5** A member's answer is taken only when it names its engine and version and a measured `cap` with `measured_by`. A region with no checkable image anchor is dropped and counted; a region below the member's confidence floor reads undetermined and its text is discarded; a page no region anchors is not merged. The OCR part's chain is `pixels → ocr(engine, version)`, both at the member's cap, naming the live calibration of that engine and version (`calibration.liveCalibration`, R10 there), or none when there is none or it cannot be read.
- **R6** The tier-3 merge fills only asked-for pages whose text holds no glyph; any other page the member returns is refused. A base with no per-page text refuses OCR when it holds a glyph and takes it whole when it holds none. The merged chain's parts are the tier-1 and tier-2 pages as R3's merge stated them, any other layer page at the wired tier, and the filled pages under R5's chain; a page with no glyph is in no part. The wired tier is 3 when a page was filled. `tier3_candidate` is true exactly when the document was selected and nothing was filled or a selected page is still unread.
- **R7** A page routed to OCR whose layer text is only a folio keeps that text, gains the transcription appended, and is listed in both parts; a later re-read never appends it again.
- **R8** A page tier 2 wins keeps a still-true `image_unread` marker; a page OCR fills, by replacement or append, discharges it. (N253, K293) The tier-2 half is carried by `text-chain.mergeTier2Text` (its R90).
- **R9** The tier-3 note gives each refused page its own reason (no such page, not asked for, carries glyphs), and says a page held text only when it did.
- **R10** The chain is null until a text surface answers. A layer's chain is `text-chain.layerChain` at the wired tier with its cap undetermined and the reason stated; a layer whose producer marker names OCR software gains `ocr(<product>)` uncapped. A Drive export (the document's chain carries Google's export hop) gets `convert(google-export, <format>)` at the head, cap undetermined, after every other part is settled; if that prepend is refused, no chain is recorded and the reading fails, naming the refusal.
- **R11** Final text goes to `docprofile.readText` with the headers, document address, content type and retrieval instant. A determined reading carries `text_source` (the chain), `text_tier`, `text_container`, and a basis naming the reader, the chain, the tier, the tier-2 and tier-3 notes and where references were read (all, some with the reason, or none with the producer's reason). An undetermined one is a failed reading whose basis gives the tier notes and the entry's reason. (N253, K293) Its `image_unread` markers are not counted as undecoded (R3).
- **R12** `page_count` is the structure reader's count when positive, else null, never zero. `container_extent` names the levels the entry emitted (sheets, paragraphs, slides by list; tables, images by key): a sheet's `rows`, `cols`, `usedRows`, `usedCols` as integers or null; slides keyed by slide number, as long as the deck's `deckLength`; for a PDF, the images its pages paint as `{page, rect}`, or `images_why`. Absent when no entry answered; present and null when one answered and itemised nothing. A delimited-text reading carries its sheet list. (N100, K293) `page_boxes` follows `page_count`'s rule: present exactly where `page_count` is; null when no structure reader answered a box (a non-PDF, a structure with no `pageBoxes`, or one this wire cannot read whole); else `pdf-reader`'s `pageBoxes` (its R33) as `{boxes, of_page}`, each box `{media_box, w, h, rotate}`, a page whose box it could not read null in `of_page`; never a partial list.
- **R13** `reading.dialect` is absent when no entry answered a decoding choice, null when one answered and could not state it, else `format-registry.readingDialect`'s `{delimiter, encoding}`; a dialect signature that throws leaves it absent.
- **R14** `reading.provenance` is `readingProvenance`'s (R18), composed at one site for every branch, over exactly the text the reader was handed; text read as text at intake names the plane with tier null.
- **R17** (N139, D-375, K293) A reading whose provenance digested a text (R14) carries `text_chars`, `text_glyphs` and `text_undetermined`, taken over exactly the text the reader was handed: I2's `counts.chars`; the glyphs of its `document` (`text-chain.glyphCount`); and I2's `counts.undetermined`, not counting `image_unread` (R3). Each is a non-negative integer, or null when that text states no such figure. A bare string gives its length, its glyphs and null. A reading with no text has none of the three keys. A re-read (extraction R34) carries its own by this rule.
- **R15** Text units: one per page, paragraph, slide or sheet holding a glyph, its extent in the producer's own numbering and `seq` its position; a sheet is a unit only when its reader names its used range, and its extent is that `sheet-range` (`{kind: "sheet-range", sheet, range}`); a sheet with no named range is no unit (D-672, N108, K179). The wire carries at most 512 KiB, each unit charged its UTF-8 bytes plus 128. A unit that does not fit is carried as its capped prefix marked `truncated`, and every unit left out is named. An absent unit list and an empty one are different answers.
- **R16** Nothing about the source is fetched: tiers 2 and 3 are reached only through their bindings, with the capture's digest and store.

**The pure rules (`readingprov.mjs`)**
- **R18** `readingProvenance({text, chain, tier, container, planeVersion, member})` → scheme `reading-provenance/1`, `text_tier`, `container`, `text_sha256` of `docprofile.flattenText`'s text (null for empty or absent text, with `why`), `text_chars`, `text_from`, `producers` and `pages`. A page's tier comes from the chain first (a covering `pixels` step is 3, naming the next `ocr` step's engine; else the covering `layer` step's tier), then the page's own stamp, then the document's tier; the member is 1 → plane (with its version), 2 → `pdf-worker`, 3 → `ocr-worker`, else null. A page with no text is listed and neither digested nor credited. Text with no page grain is credited to one producer, and `pages_why` says so.
- **R19** `compareProvenance(prior, next)` → `agrees` (equal digests), `differs` (with `changed[]`: pages grouped by the tier and member before and now, and a sentence in the shape *tier 3 on ocr-worker returned different text for page 1*), `undetermined` (either side carries no provenance: never inferred from the tier or the chain) or `no_text` (neither digested text). `describePages` numbers pages from 1 and folds runs.

**The re-read's pieces** (the seam with `extraction`; N513, new wording, BOB's)
- **R23** Besides `read`, the module exports the pieces of it that `extraction`'s re-read (its R31–R35) and its store half compose. Each behaves as R1–R17 state for the part it does, and none holds state or reaches anything but the store and bindings it is handed:
  - `tier2Escalate`, with `decodeView` and `pageBoxesFrom` (R3, R12);
  - `needsTier3`, `tier3Extend` and `tier3SeedFrom` (R4–R7, R9);
  - `layerChainFor` (R10);
  - `readingFromWire` (R11–R14);
  - `textCountsOf` (R17);
  - `textUnitsFor` (R15);
  - `bytesOf` (the evidence read);
  - `CAPTURE_TEXT_UNIT_CAP` (R15's per-unit cap, which `extraction` R22 also bounds stored units by);
  - `PROVENANCE_SCHEME` (`reading-provenance/1`, R18).

**The after-read hook: onRead(module, fn, {captureClasses}), afterRead({captureSha, captureClass, reading, committed})** (T33-23; B1a.4; K1468, D177)
Both are methods of the storage's own hook registry, `readHooksOf(ctx)` (one per `ctx.storage`, held in memory; K1555): a registering module calls `readHooksOf(ctx).onRead(…)` at its start and the committing module calls `readHooksOf(ctx).afterRead(…)`.
- **R25** `onRead(module, fn, {captureClasses})` registers, once per module, at start, a later module's after-read hook for the capture classes it names (a non-empty list of strings; the module's own opt-in, which `events` R4 keeps empty until a member's recorded act widens it). Each registration asks `membership.listenerRefusal` (its R81): a malformed one is refused `LISTENER_MALFORMED`, a second by the same module `LISTENER_DECLARED` naming the holder; an empty or non-list `captureClasses` is refused `LISTENER_MALFORMED`. A refused registration records nothing. *(not yet met: T33-23)*
- **R26** `afterRead({captureSha, captureClass, reading, committed})` is what the module that commits a reading calls once the reading's transaction has committed (`committed: true`; any other value runs nothing and answers `{ran: []}`). It calls each registered hook whose `captureClasses` holds `captureClass`, one at a time, in the modules' total order (`membership.MODULE_ORDER`, its R83), with `{captureSha, captureClass, reading}`; a hook for another class is not called. It answers `{ran: [module…], failed: [{module, error}…]}`: a hook that throws or rejects is named in `failed`, never undoes the reading or stops a later hook, and never throws out of `afterRead`. With nothing registered it answers `{ran: [], failed: []}` and writes nothing. *(not yet met: T33-23)*
- **R27** (D177) A hook never runs inside `read` (R24) or inside the reading's own transaction: `read`'s answer, for any document, is byte for byte the same whatever is registered, and a hook's writes are its own module's, in its own transaction, after the commit. Moving a hook into the promote transaction waits on M-V4's measured cost (plan T33-T4). *(not yet met: T33-23)*
- **R28** (T33-24; C:A-5; K1556) The reading this module composes carries what its format entry emitted beside the text: `metadata`, the entry's document metadata as emitted (`office-readers` R31), or null; and, for a workbook, `cells`, `{<sheet name>: <that sheet's cells as the entry emitted them (`office-readers` R30, `odf-reader` R46), or null>}`, absent for any other document. Neither is altered, and over the entry's size guard a sheet's cells are null. *(not yet met: T33-23)*

## Private

### Uses

- `acquisition`: `civicsmithUserAgent` (the probe's `--census` user agent; N542).
- `membership`: `listenerRefusal` (its R81; R25) and `MODULE_ORDER` (its R83; R26) (T33-23).
- `text-chain`: `layerChain`, `appendStep`, `describeChain`, `checkChain`, `checkAnchor`, `applyConfidenceFloor`, `mergedChain`, `convertedChain`, `readingSource`, `mergeTier2Text`, `tier2Note`, `glyphCount`, `stepCovers` (R3–R12, R17).
- `format-registry`: `getFormat`, `readingDialect` (R2, R13).
- `docprofile`: `identify`, `doctypeFor`, `readText` (R1, R2, R11), `flattenText` (R18).
- `capture-sources`: `driveConvertStep` (R10's Drive export step).
- `pdf-worker`, `ocr-worker`: through their bindings only (R3–R5, R16); their member definitions in the moved tests.
- `pdf-reader`, `jurisdictions`, `test-support`: only the moved tests (`pdfstructure.mjs` in `tier2-wire.test.mjs` and `tier-pagewise.probe.mjs`; `combine` for a test's view; `stdio.mjs`, `sandbox.mjs`).
- Handed in, never imported, so no edge: `record-core.evidenceStore`'s store (`evidence`), the jurisdiction view `extraction` R18 composes (`view`), and `calibration.liveCalibration` (its R10; R5) as the `liveCalibration` callback.

### Invariants

- **R20** No machine mints a grade: nothing here raises or lowers one; a chain only weakens (`text-chain`) (DEC-4). *(a copy of `extraction` R44 without its drift and proposal clauses, which have no subject here; `extraction` R44 keeps them)*
- **R21** A reading that finds nothing is a failed reading, recorded with its reason, never backfilled; absent, empty and null stay three facts (page count, container extent, units, provenance, dialect). *(a copy of `extraction` R45, which keeps it)*
- **R22** No place is named in this module's behaviour or outward text (extraction R18). *(a copy of `extraction` R50, which keeps it)*

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` Part I §7 (a failed reader, never an emptied document); Part II §14.2 (a derivation never raises a cap), §16 (the path, the tiers, reading provenance, the chain's four rules).
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §5.2 (the per-page rule and the order of two merges).
- `docs/development/CONTENT-SEARCH-DESIGN.md` §4.1 (one unit per element reference), §4.3 (the bounds, truncation stated; R15's wire).
- `docs/development/OFFICE-FORMATS.md`, the format axis as ruled; `docs/development/DOCUMENT-PROFILES.md`.
- DEC-4 (no machine mints a grade), DEC-75 (the Drive conversion step).

(Copied from `extraction`'s Satisfies: the share R1–R19 serve. `extraction` keeps its own lines.)

### Suggestions

- **Where it runs.** In the Worker, with the fleet bindings (the pipeline half of `extraction`'s "Two halves"). `extraction`'s store half calls it. Its one calibration read (R5's live calibration) is the `liveCalibration` callback `extraction` hands in, so this module needs no edge to `calibration`.
- **R23 is the seam.** It names what `extraction/index.mjs`:30 imports today. The names are not new. BOB rules whether they stand as one requirement here or stay unstated, as they were inside `extraction`.
- **`CAPTURE_TEXT_UNIT_CAP`** is defined here (R15). `extraction` re-exports it (`extraction/index.mjs`:33) for `observation-log`, `connections` and three tests. Whether the re-export stays is decision 6 (BOB's).
- **Tests move whole or split case by case** (`draft-T25-splits.md` E-1). The moved tests call `read(document, {evidence, env, view, liveCalibration})` directly, with a small fixture of their own (the extraction fixture's `bucket()` and `doc()` helpers), and their assertions do not change. `convert-chain` (R3, R11, R12, R15 there) and `convert-extent` (R13, R60 there) are split case by case. R2 and R15 (old R3, R16) get over-strictness arms: a PDF and an office capture read byte for byte as before.
- The pipeline owns no table and mints no catalogue row. C-51 stays with the re-read in `extraction`.
- **T33 (T33-23).** The hooks are held in memory, registered at start like every listener slot (K31's pattern), so the module still owns no table (Rules (6) asks nothing of it). A **capture class** is the caller's word for the kind of capture read (the profile's content-type key is proposed); which classes a module opts into, and who widens the set, are the registering module's (`events` R4; K1505 (9): the administrator's). R26 needs its caller: the module that commits a reading (`extraction`'s re-read, through `promotion`'s step) calls `afterRead` after its commit. `extraction` has no T33 entry, so until a job wires that call no hook runs; this is named to BOB. `membership` is a new edge (Uses), needed for R25–R26; the plan's entry listed none.

## Open for Bob

None. The text is `extraction`'s, already settled by Bob (K102).

## Decided by BOB (for the rulings)

- (N513, K1193, E-1 only) The split from `extraction`, R1–R19 = `extraction` R2–R17, R60, R25, R26, with no change of meaning, and R20–R22 copies of R44, R45, R50 (R20 without R44's drift and proposal clauses, decision 3 of the drafts' review). R24 is `read`'s signature (decision 4). `readingprov.mjs` is this module's from the opening (decision 6). Layer 4, after `calibration` and before `extraction`. `paths` is `bio-plane/src/reading-pipeline/`, which this module's T25 job creates by moving `extraction/pipeline.mjs` and `readingprov.mjs`.
- (owed) R23's seam wording; `CAPTURE_TEXT_UNIT_CAP`'s re-export (decision 6).
