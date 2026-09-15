# Content-grain search — Part II §18 piece 2

**Status** · v0.1 DRAFT design, written 2026-09-14 by session BOB #11 under Bob's standing delegation (mechanism is the architect's; `kickoffs/BOB.md`). Not yet reviewed by Bob. Nothing here is ruled: the doctrine it rests on is Part II §14.3 (the four-level search, Bob's correction of 2026-08-04) and the fence M5 settled on 2026-07-31 (document text is member-scope and the index never leaves the Durable Object). Complete as a design at its level — the question is split, the constraints are measured and named, the mechanism is decided, the decomposition is in the BOB INBOX. **The caveat this line carried until 2026-09-14 is gone: §5's four numbers are TAKEN (M0-31, `MEASUREMENTS.md` M-20, over COFF-6's census corpus — 1,302 B of text per captured PDF page, 31,612 B per PDF document, 1.998 stored bytes per indexed text byte on workerd's SQLite, and 0.0076 ms per unit plus 0.054 ms per KiB at promote), and §4.3's two bounds are SET from them rather than provisional.** The caveat a reader needs NOW is a different one and it is smaller: the measurement found that §4.1's `slide-shape` unit cannot be written from the I2 shape the acquire path holds, so a deck's unit is an open design question rather than a settled one (Incomplete sections, below). **AMENDED 2026-09-14 by REC-89, and the amendment is about this document's own completeness rather than its mechanism: §7's decomposition row 1 (D-225's caps) WAS ALREADY BUILT when this document was written** — it landed at REC-60 on 2026-08-07 under `IC-25` — and the row was written as outstanding because `DEBT.md` D-225 still read `open`. §2's corresponding constraint row and §7 row 1 now say so; nothing about the mechanism in §3–§6 changes, and items 2–6 are untouched and still outstanding. The general lesson is recorded rather than only the instance: **a design that cites a debt row as a precondition inherits that row's staleness**, and this document cited three, as of 2026-09-15.

**Place in the system** · Level 2. Serves construct 9 (retrieval — `BIO_System_Design.md` §3 names no level-1 home for it; `BIO_Content_Framework_v0_10.md` Part II §14.2–14.3 and §17 carry the adopted design) and construct 4 (content, Part II). Depends on `CONTENT-EXTENT-DESIGN-SPACE.md` §6 (the content row this searches over), `INVESTIGATIVE-SESSION.md` §14c (the graded options for D-222, whose stage C this is) and `RETRIEVAL-SUBSTRATE.md` (the FTS5 substrate and its measurements). Feeds `OBSERVATION-LOG-DESIGN.md` (the content-axis state a search answer must state) and `EXTRACTION-BREADTH-DESIGN.md` §3 (the extent arms for tables and images, which become indexed units when they exist). Supersedes nothing; it discharges the design half of D-222's stage C, fixes D-225's place in the order, and gives M5's indexing gap its shape.

**Incomplete sections** ·
- §4.1 — workbooks: the indexing unit for a sheet waits on `EXTRACTION-BREADTH-DESIGN.md` §3.2's `sheet-range` arm; until it exists a workbook is searchable at document grain only, and the answer says so. **Measured 2026-09-14 (M-20): 288 workbooks in COFF-6's census hold 72,651,441 bytes of extracted text over 1,056 sheets and not one indexable unit between them, so this gap has a size.**
- §4.1 — decks: RESOLVED 2026-09-15 — the deck's indexed unit is the SLIDE (a `slide-shape` extent with the shape omitted, which `covers()` accepts), because a shape is not a passage and `pptx.mjs` emits one text string per slide today. What remains incomplete and is named in the section: a slide-grain unit cannot be a reading POSITION (`readingSource()` requires both slide and shape), so deck-grain CONNECTIONS wait on `pptx.mjs` emitting per-shape text — FW-17's axis, not this design's.

*(§5 stood on this list until 2026-09-14 and is STRUCK rather than annotated: `CORPUS-STANDARD.md` §3's grammar gives a bullet to a section that is incomplete, stale, draft or superseded, and a section that has been completed is none of those — a discharged bullet left in place would make this list mean "things that were once open", which is a different list and one nobody could rely on. The discharge is recorded in Status above, in `MEASUREMENTS.md` M-20, and in §4.3's two bounds.)*

**Contents**
- [1. The question, split three ways](#1-the-question-split-three-ways)
- [2. What holds, whichever way it is built](#2-what-holds-whichever-way-it-is-built)
- [3. Whether extracted text is indexed at all — decided](#3-whether-extracted-text-is-indexed-at-all-decided)
- [4. The mechanism](#4-the-mechanism)
  - [4.1 The text index: one unit per element reference](#41-the-text-index-one-unit-per-element-reference)
  - [4.2 The compiler's stage C: two arms and two row shapes](#42-the-compilers-stage-c-two-arms-and-two-row-shapes)
  - [4.3 The cap, and truncation stated](#43-the-cap-and-truncation-stated)
  - [4.4 The answer names its level and the content-axis state](#44-the-answer-names-its-level-and-the-content-axis-state)
  - [4.5 A hit is an address, never a row](#45-a-hit-is-an-address-never-a-row)
- [5. What must be measured before the index is built](#5-what-must-be-measured-before-the-index-is-built)
- [6. What this does not decide](#6-what-this-does-not-decide)
- [7. The decomposition](#7-the-decomposition)
- [8. Negative controls the discipline demands](#8-negative-controls-the-discipline-demands)

---

## 1. The question, split three ways

Part II §17 names three questions the record cannot ask: *which passages mention X*, *every leg citing page 14*, *every OCR'd region below cap C*. They are not one capability. They are three, with different preconditions, and building them as one is how a search that returns documents gets called finished.

| question | what it searches | precondition |
| --- | --- | --- |
| **(a) text at content grain** — *which passages mention X* | the TEXT the extractors produced, below document grain | the text is indexed below document grain (§3); today it is not indexed at all |
| **(b) rows at content grain** — *every leg citing page 14*, *every OCR'd region below C*, *every stale row*, *every machine-minted row no member has cited* | the `content` table (IC-83) and the edges that hold a `content_id` | REC-83/84 (the reads) landed; D-225's caps landed first |
| **(c) the content-axis STATE** — *which documents in scope are unextracted, partially extracted, or extracted under an engine older than its calibration* | the content axis's frontier: not extracted · partial · extracted · unextractable (Part II §14.3) | the observation log (`OBSERVATION-LOG-DESIGN.md` §4.2), which is where that state is recorded |

(a) is M5's rung. (b) is D-222's stage C proper — the row shape over a content arm. (c) is piece 3's read, and this document requires only that a search answer CARRY it (§4.4), because an empty answer over an unindexed set is the false absence CLAUDE.md's sparse rule exists to catch.

## 2. What holds, whichever way it is built

Every constraint below is enforced in code today or is a ruling; none is a preference.

| constraint | where it is enforced or ruled |
| --- | --- |
| **One compilation point for visibility** (D-15): `viewerPredicate` is the only gate and the store throws on a statement without `GATE_MARK` | `query.mjs`, `Store#runQuery`; `INVESTIGATIVE-SESSION.md` §14c |
| The gate is a **WHERE predicate, not a CTE** — measured 283 ms against 5 ms for a facet sidebar at 20,000 bundles | `query.mjs` (the MEASURED comment) |
| **A candidate list withholds the whole row** across the fence (REC-36's stricter rule): even a nameless hit discloses that something mentioning the subject sits in a project the viewer was not invited to | §14c's constraint table |
| **Envelope, never a bare array**; `limit` is the cap actually applied; truncation is said | REC-57 / IC-23; `bounds.test.mjs` pins the bare-array exception at exactly one op |
| **`MAX_COMPOUND = 4`** — workerd's compound-SELECT ceiling is five; each arm spends one term | `query.mjs` (the MEASURED comment) |
| **Every arm keys on `bundles.fts_id`** — a bundle not text-indexed is invisible to every arm; a new arm joins back through the bundle or it does not compose | §14c; the `MEANING` arm's `key` field |
| **D-225's caps land BEFORE any new content surface** — an uncapped legacy read beside a capped new one is the inconsistency a caller builds against. **SATISFIED ALREADY, CORRECTED 2026-09-14 (REC-89): the caps LANDED at REC-60 on 2026-08-07** — `resolutionsForCapture`, `documentsConcerning` and `connectionsFor` clamp to 500/5000 and publish `limit` after clamping beside `truncated`, `IC-25` on I3 is SETTLED, and all three are driven on `bounds.test.mjs`'s roster. This row read as pending because `DEBT.md` D-225 was still `open` when this document was written; the debt row, not the plane, was stale. This constraint is therefore a precondition already met, not one the decomposition must still meet | `DEBT.md` D-225 (CLOSED 2026-09-14); `INTERFACE-CHANGES.md` IC-25; §14c "Related finding" (still stale in the present tense — delegated) |
| **Content rows are minted lazily, on first edge, content-addressed** (IC-83) — so a text hit is an ADDRESS, never a row; nothing is minted by searching | `CONTENT-EXTENT-DESIGN-SPACE.md` §6 |
| **The machine does the looking; the member does the concluding** (DEC-24) — a hit informs; a minted row is an act (a member's cite, or the assistant's labelled mint under 5.7) | Part II §14.4 |
| **Document text is member-scope, inside the Durable Object** (M5, settled 2026-07-31); the public verify surface never reads it | `MILESTONES.md` §M5 |
| **A truncated index entry must SAY it is truncated, per bundle** — the M5 rule; a search that silently under-reports is the record claiming coverage it lacks | `MILESTONES.md` §M5 |
| **Text below the OCR floor is discarded, never carried beside a flag** — so it is never indexed either | Part II §16, chain rule 4 |

## 3. Whether extracted text is indexed at all — decided

Today `bundles_fts` (FTS5, `unicode61`, created in `store.mjs`'s migration) indexes five columns — `title`, `body`, `meta`, `locator`, `authority` — projected from `bundle.md`'s frontmatter and inline `.md`/`.txt` files, each capped at `TEXT_CAP` = 128 KB. Per-page text is not persisted anywhere; a reading is an opaque JSON blob; the text-source projection stores the chain and not the text. So a group that captures five hundred agenda packets can search its notes about them and not the packets, and `text:` in the query language means *the group's notes*, not *what the documents say*.

Three ways to close it, and the choice:

| option | what it is | why not, or why |
| --- | --- | --- |
| (i) index nothing more | the status quo | M5 unreachable; §17's ABSENT stays; the four-level search has no content level to search |
| (ii) pour document text into `bundles_fts.body` | one more column feed | the 128 KB cap truncates a 400-page packet at page ~40 and the hit lands the reader on a DOCUMENT — D-161's failure one axis over (the anchor is found and thrown away); grain lost by construction |
| **(iii) one indexed unit per element reference** | a `capture_text` table keyed by the IC-1 address (`pdf-page`, `doc-para`, `slide-shape`; `sheet-range` when it exists) with an FTS5 external-content index over it | **CHOSEN.** The unit's address IS a content extent, so a hit is a mintable row's identity (`hash(capture_sha, extent, chain)` is computable at hit time) without minting it; one extent grammar, not two (D-164's "built three times and drifts" lesson); `snippet()` returns the passage; text is stored once |

**Why (iii) and not a fourth option — index the content rows' text.** Content rows exist only for what has been cited; indexing them answers *which cited passages mention X*, which is (b), not (a). The whole point of (a) is to find what nobody has cited yet — the content level of the four-level search, the one that grows the record when an objective goes looking.

## 4. The mechanism

### 4.1 The text index: one unit per element reference

`capture_text` — one row per indexed unit of one capture's text under its CURRENT chain:

    capture_sha    TEXT NOT NULL      -- the document; the register's trust root
    bundle_id      TEXT NOT NULL      -- the join every arm makes (§2)
    extent_kind    TEXT NOT NULL      -- pdf-page | doc-para | slide-shape  (sheet-range when EXTRACTION-BREADTH §3.2 lands)
    extent         TEXT NOT NULL      -- the per-arm fields as canonical JSON — the SAME canonical form the content table hashes over
    ref            TEXT NOT NULL      -- IC-1's required human form
    seq            INTEGER NOT NULL   -- reading order within the capture
    text           TEXT NOT NULL      -- the unit's text, capped (§4.3)
    truncated      INTEGER NOT NULL DEFAULT 0
    chain_kind     TEXT NOT NULL      -- the LAST step kind of the chain that produced this unit (layer | ocr | member), so "every OCR'd unit" is a predicate and not a parse
    PRIMARY KEY (capture_sha, extent_kind, extent)

`capture_text_fts` — FTS5 external-content over `capture_text.text`, `unicode61`, rowid aligned, so `snippet()` and `highlight()` read the base table rather than a second copy.

**Written at promote, inside the promote transaction**, from the I2 shape the acquire path already holds: `text.pages[]` for a PDF (one unit per page, `pdf-page` with the page's full rectangle), `text.paragraphs[]` for a pageless container (`doc-para`), and — **DECIDED 2026-09-15, the fork M0-31's measurement opened and this section left open for one day — one unit per SLIDE for a deck**, written as a `slide-shape` extent with the SHAPE OMITTED, which `covers()` already accepts as covering the whole slide (`textchain.mjs`). Three reasons, and the first is this section's own rule pointed at a third container: **a shape is not a passage**, exactly as a cell is not one — the deck's analogue of a PDF's page is the SLIDE, which is what a reader sees and what a citation names. Second, it needs no producer change: `pptx.mjs` emits one text string per slide today and discards the shape index when it collects a paragraph's text, so a shape-grain unit would require a format change for a finer grain nobody has asked for. Third, it needs no grammar change: the extent arm exists and `covers()` accepts the shape-omitted form. **What the slide unit CANNOT be, stated rather than discovered later: a reading POSITION.** `readingSource()` requires both `slide` and `shape`, so a slide-grain unit is expressible as an EXTENT and not as the position a reference was read at — which means deck-grain CONNECTIONS wait on `pptx.mjs` emitting per-shape text (FW-17's axis, not this one), while deck-grain SEARCH does not wait on anything. If per-shape text ever lands, narrowing the unit is additive: a finer unit for the same document, under the same extent arm. The office producers already emit these references (Part II §15); the PDF producer emits `pdf-page`. Same rule as the readings' promote-time projection (Part II §16): the capture's previous text rows are deleted first, so a revised chain never leaves a unit claiming an engine that did not produce it.

**When the chain moves** — re-extraction under a better engine, or read-time re-extraction to tier 3 (`EXTRACTION-BREADTH-DESIGN.md` §5.1) — the units are replaced and the capture's content rows go `stale` by REC-82's mechanism, which is what tells a reader that the passage they cited was read under an earlier chain. The index holds the current chain's text only; the prior text is derivable from the bytes and the chain the content row recorded (the calibration record names the engine). Text is a projection, and a projection is re-derived rather than versioned; the content row is the thing an edge depends on, and it is never rewritten.

**Workbooks** are not indexed per cell — a 63 MB sheet inflates to millions of cells and a cell is not a passage. A sheet's unit is a `sheet-range`, which is piece 4's arm; until it exists the workbook is searchable at document grain only, and the per-capture `indexed` state says `none: no unit arm for this container` rather than staying silent.

**HTML** has no `dom` producer (Part II §15) and is therefore not an indexed unit either; the captured page's text reaches `bundles_fts` as it does today. Stated, not left to be noticed.

### 4.2 The compiler's stage C: two arms and two row shapes

Both on the ONE compiler (D-15), each arm an `IN` subquery selecting bundles, each row shape a JOIN projecting the grain — the PL-8/PL-9 pattern exactly, because §14c's finding that A and C must COMPOSE rather than duplicate holds here unchanged.

| piece | what it answers | the shape |
| --- | --- | --- |
| **`content:` arm** | which BUNDLES hold content rows matching — `kind` (the extent arm), `stale`, `minted` (member · plane · machine), `cap` (the derivation cap, with the undetermined stated as its own value, never folded into a letter), `chain` (the last step kind), `cited` (holds at least one leg) | a `MEANING`-table entry over `content`, keyed `bundle_id`; grade and kind columns indexed or the reason measured and recorded, as `inquiry_basis(grade_source)` was |
| **`rows=content`** | the content rows themselves, of every bundle in scope — *every OCR'd region below C* is `content:chain=ocr content:cap<C` + `rows=content` | a row descriptor: identity `content_id`; refs `bundle_id`; rowGrain *"one content row — one addressable extent of one capture under one chain; cited or citable, and it says which"* |
| **`passage:` arm** | which BUNDLES hold an indexed unit whose text matches — quoted phrases, prefix, `NEAR`, the FTS5 grammar `text:` already compiles | a text arm over `capture_text_fts`, joined through `capture_text.bundle_id` |
| **`rows=passage`** | the indexed units matched, with `snippet()`, each carrying its extent and `ref`, its `chain_kind`, its `truncated` flag, and — where a content row already exists for that extent under the current chain — its `content_id` | a row descriptor: identity `(capture_sha, extent_kind, extent)`; refs `bundle_id`; rowGrain *"one indexed unit of one capture's text under its current chain — an ADDRESS, not a content row until a member cites it or the assistant proposes it"* |
| **`rows=leg`** gains three columns | `content_id`, `extent_kind`, `ref`, by the join REC-83's reads already make — so *every leg citing page 14 of this document* is the document's `ids:` arm plus `rows=leg`, read on the `ref` column, under the whole-basis rule (a basis returned in part reads as a basis) | additive to the existing descriptor |

`text:` keeps its meaning (the group's own notes and frontmatter); `passage:` is what the documents say. The surface labels the two; the vocabulary does not rename a settled arm.

**Compound budget.** `content:` and `passage:` each spend one of the four compound terms, as every arm does. That is the measured ceiling and not a design choice; a member's query that needs five arms is refused with the reason, as today.

### 4.3 The cap, and truncation stated

Two bounds, both stated where they bite. **Both are now SET from the measurement §5 asked for — `MEASUREMENTS.md` M-20, 2026-09-14, `tools/m031-index-measure.mjs` over COFF-6's census corpus (762 OOXML documents as a CENSUS, 1,000 of 27,783 PDFs as M-13's own seeded draw).** Neither is provisional any longer, and the figure each rests on is named beside it.

- **Per unit: `TEXT_CAP`, 131,072 B, KEPT — and kept on evidence rather than on inheritance.** The claim this section used to make without a measurement is now measured and true: over **148,413 units** the largest is **21,224 B** (a PDF page), with `doc-para` topping out at 2,931 B and a slide at 2,329 B. The cap is **6.2× the largest unit the corpus produced** and is never approached. It is kept rather than lowered for two reasons and the alternative is recorded so a later reader can overturn it with evidence: a second cap number costs a second vocabulary beside the one the existing index already carries, and **the per-capture bound below is what actually bounds a promote** — a per-unit cap bounds nothing when a document carries 20,571 units. Reversing this costs one constant and a re-run of M-20's `derive`. A unit over the bound is stored to the bound with `truncated = 1`, and `rows=passage` carries the flag — never a silent prefix.
- **Per capture: 2,097,152 B (2 MiB) of extracted text per capture, total across its units.** One number for every container, because the `indexed` state is one vocabulary (below) and a per-format bound would need two. The evidence: **it admits 100 % of the measured 1,000-PDF sample fully** — the largest PDF in it carries 1,354,686 B of text, so the bound has **54.8 % headroom over the worst document measured** — and 1 MiB would already leave two of the thousand `partial` while admitting 99.01 % of the text. It also costs what a bound must cost knowably: at M-20's measured index ratio a capture at the bound stores ~4.19 MB, and a promote at the bound at page grain is **45.7 % of the measured per-invocation CPU window**, so the bound cannot by itself push a promote over the ceiling. **The exclusions are named rather than implied: none in the measured sample.** The sample is 3.60 % of the PDF population, so captures over the bound certainly exist in the other 96.4 % — they take the `partial` path in the next sentence, which is what that path is for.
  - **Upstream of this, and a DIFFERENT metric that is not folded into it:** for office containers COFF-2's extraction bound already applies — 20 MiB of *declared uncompressed text-part bytes* read from the ZIP central directory before any inflation (COFF-6, `MEASUREMENTS.md`) — over which the document is `text-undetermined`, nothing is extracted, nothing is indexed and the reason is already recorded. **18 workbooks in the census are over it.** Of the office documents that ARE extracted, the largest text is 1,187,253 B (docx) and 21,787 B (pptx), both inside the 2 MiB bound; the one container that exceeds it is a workbook at 5,103,594 B, which §4.1 gives no unit arm at all, so nothing about it is indexed today either way.
  - Over the bound, the capture is indexed to the bound in reading order and its `indexed` state reads `partial`.

The per-capture `indexed` state — `full` · `partial` · `none (reason)` — is written as a content-axis OBSERVATION (`OBSERVATION-LOG-DESIGN.md` §4.2), not as a column of its own, so that *not extracted*, *extracted but over the bound* and *extracted and indexed* are one vocabulary in one place. This document consumes that state; it does not define a second.

### 4.4 The answer names its level and the content-axis state

Every `passage:` answer's envelope carries, beside `limit`/`total`/`truncated`:

    level: "content"
    scope: { captures: N, indexed_full: a, indexed_partial: b, indexed_none: c, not_extracted: d }

read off the observation log for the bundles the query's OTHER arms put in scope. So an empty answer says *0 hits over 412 indexed captures; 38 in scope are unindexed (31 workbooks: no unit arm; 7 over the bound); 3 not yet extracted* — which is CLAUDE.md's rule that saying WHICH absence is true is a first-class obligation, made mechanical at the one place a member reads absence. Without it a content-level miss reads exactly like a document-level miss, and Part II §14.3 says those are different facts with different next moves.

### 4.5 A hit is an address, never a row

`rows=passage` returns extents. Nothing is minted by searching: minting is (a) a member's act through the composer — UI-61's "cite this" emits the extent and REC-82's writer mints or finds the row — or (b) the assistant's proposal under Bob's 5.7, `minted_by` a machine credential, labelled everywhere it is shown, never attested by it, part of a finding only when a member cites it (SK-7). A search that minted rows would put derived things where authored ones go; DEC-24 forbids it and IC-83's lazy-mint rule is the mechanism that keeps it out.

## 5. What must be measured before the index is built

In the order a build session needs them, each recorded in `MEASUREMENTS.md` with its instrument:

1. **Text bytes per captured page, and per document**, over COFF-6's census corpus — the 1,000-of-27,783 PDF sample (M-13 names the instrument) and the office census (declared text-part bytes exist per document; the TEXT after extraction does not). This sets §4.3's per-capture bound.
2. **Index bytes per text byte** on workerd's SQLite for an FTS5 external-content table at the unit grain — `test/meaning-index-probe.mjs` is the pattern (statements DRIVEN out of `compile()`, never typed). A vendor figure is a claim.
3. **The storage curve.** Today's marginal cost is 176,657 B per bundle (D-190's row, `op=stats` → `dbBytes`), which puts the 10 GB per-object claim at ~60,800 bundles. With (1) and (2) the new marginal cost is text × (1 + index ratio) per document, and the curve says at what corpus the record must shard — which M6 wants to know before L1 grows by design (`STORE-AS-CACHE.md`, "What must be MEASURED").
4. **Promote-time CPU per indexed unit.** A promote that writes four hundred units plus their FTS entries runs inside the same invocation ceiling capture already shares (`runtime_observations`, `cpu_probe`); measure K units per promote against it, and if the ceiling is near, the write is chunked across ticks the way `capture_sessions` already resumes.

## 6. What this does not decide

Ranking and how a passage is presented (Program B; `BIO_Interaction_Constructs_v0_1.md`); the workbook unit (piece 4); HTML units (no producer); stemming beyond `unicode61` (the settled tokenizer); cross-instance search (`MULTI-INSTANCE-ISOLATION.md`); whether the assistant's FIND uses `passage:` — it does, as one of the four levels, and the assistant's document (construct 11) says how it names the level it searched.

## 7. The decomposition

Six items, in dependency order, handed through the BOB INBOX (CONDUCT mints the ids and gates them). Milestones: M3 for the caps, M4 for the content arm, M5 for the text index and the passage arm, M8 for the surface.

| # | owner | item | depends on | interface | design |
| --- | --- | --- | --- | --- | --- |
| 1 | RECORD | ~~**D-225's caps**~~ — **DISCHARGED ON ARRIVAL, 2026-09-14 (REC-89), AND THE ROW IS KEPT RATHER THAN DELETED.** The three reads took REC-57's envelope at **REC-60 on 2026-08-07**, five weeks before this table was written: 500/5000, `limit` published AFTER clamping beside `truncated`, driven through `op=resolutions`/`op=concerns`/`op=connections` on `bounds.test.mjs`'s roster, and **the interface change is `IC-25`, SETTLED** (I3 8.1.0 → 9.0.0 → 10.0.0 — recorded as a BREAK, not additive, because a caller that received everything now receives the first 500). **No further IC is owed and REC-89 minted none:** filing one for a change that does not exist is the registry lying in the other direction, which is IC-3's own reasoning. This row was written against `DEBT.md` D-225 while that row still read `open`; the caps were in the plane and the debt row had not moved | — | **`IC-25`, SETTLED 2026-08-07 — nothing to file** | §2; `INVESTIGATIVE-SESSION.md` §14c "Related finding" |
| 2 | RECORD | **the `content:` arm and `rows=content`** — the `MEANING` entry over `content`, the row descriptor, the three columns on `rows=leg`, the index decision per filtered column measured and recorded | item 1; REC-83, REC-84 | I3, additive, an IC | §4.2 |
| 3 | M0 / RECORD | **the measurement** — §5's four numbers, recorded; §4.3's per-capture bound set from them | — | — | §5 |
| 4 | RECORD (FRAMEWORK answers-for on the I2 read) | **`capture_text` and `capture_text_fts`** — written at promote for `pdf-page`, `doc-para`, `slide-shape`; replaced on chain move; `truncated` per unit; the `indexed` observation per capture; purge both arms; hygiene (the table before `host_governor`); the negative control | item 3; REC-82 (the canonical extent form); CAP-9 (the page count) | I5, additive, an IC | §4.1, §4.3 |
| 5 | RECORD | **the `passage:` arm and `rows=passage`** — `snippet()`, the `content_id` join where a row exists, the envelope's `level` and `scope` tally read off the observation log, REC-36 withholding, the four-level statement | items 2, 4; `OBSERVATION-LOG-DESIGN.md` item 2 (the content-axis state it reports; ships with the tally UNDETERMINED-stated if that item is not yet landed) | I3, additive, an IC | §4.2, §4.4 |
| 6 | UI | **the search surface** — passages shown AS content with `ref`; jump to the extent in UI-61's viewer; "cite this" mints through the composer; the absence statement by level rendered, never hidden; nothing prefilled | item 5; UI-61 | I3 consumer | §4.4–4.5; `BIO_Interaction_Constructs_v0_1.md` |

## 8. Negative controls the discipline demands

Each a named refusal or a driven arm, recorded on the suite's `NEGATIVE CONTROL:` line:

- a term that appears ONLY inside a captured PDF's page text returns that bundle through `passage:`, and does not through `text:` (the two arms are different questions); break the index write and the first assertion fails;
- a unit over the per-unit bound is stored with `truncated = 1` and `rows=passage` carries it; a unit under it carries `0`;
- a `passage:` hit inside a project the viewer is not in is withheld whole — the envelope's `total` does not move (hidden and absent answer identically);
- an empty `passage:` answer over a scope with unindexed captures carries a non-zero `indexed_none` or `not_extracted` tally; an empty answer over a fully indexed scope carries zeros — the two are distinguishable by the envelope alone;
- searching mints nothing: the content row count is unchanged after any `passage:` query;
- re-extraction replaces a capture's units and marks its content rows `stale`; the stale row still resolves and `rows=content` shows the flag;
- a fifth arm is refused with the compound-ceiling reason, as today;
- D-225's three reads answer with an envelope whose `limit` is the cap applied; a caller asking above it gets the cap and `truncated: true`.
