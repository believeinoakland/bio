# Content-grain search — Part II §18 piece 2

**Status** · v0.1 DRAFT design, written 2026-09-14 by session BOB #11 under Bob's standing delegation (mechanism is the architect's; `kickoffs/BOB.md`). Not yet reviewed by Bob. Nothing here is ruled: the doctrine it rests on is Part II §14.3 (the four-level search, Bob's correction of 2026-08-04) and the fence M5 settled on 2026-07-31 (document text is member-scope and the index never leaves the Durable Object). Complete as a design at its level — the question is split, the constraints are measured and named, the mechanism is decided, the decomposition is in the BOB INBOX. **CORRECTED 2026-09-16 by BOB #12 — §4.3 WAS WRONG IN THREE INDEPENDENT WAYS and REC-91 found all three by BUILDING it.** The per-capture bound was MIS-SITED (it sits downstream of `INLINE_MAX`, which refuses the whole promotion first, so it could never fire); its headline claim that it *admits 100 % of the measured 1,000-PDF sample fully* is FALSE against the bound that actually ships (524,288 B at the acquire wire, half of `INLINE_MAX` for JSON escaping); and — independently of both — it bounds BYTES while the index costs ROWS, so M-20's worst docx sits inside the byte bound and still spends 84.8 % of the CPU window. **Left alone it would have been a REGRESSION: two documents the record accepts today would have stopped promoting.** A fourth finding is recorded rather than closed: §3 chose its option partly because *text is stored once*, and through this route it is stored TWICE. §4.3 now carries all four with the code as the authority. **The sentence below is therefore RETRACTED in its second half — §5's numbers are taken, but §4.3's bounds were NOT correctly SET from them, and that is the difference between having a measurement and asking it the right question.** **The caveat this line carried until 2026-09-14 is gone: §5's four numbers are TAKEN (M0-31, `MEASUREMENTS.md` M-20, over COFF-6's census corpus — 1,302 B of text per captured PDF page, 31,612 B per PDF document, 1.998 stored bytes per indexed text byte on workerd's SQLite, and 0.0076 ms per unit plus 0.054 ms per KiB at promote), and §4.3's two bounds are SET from them rather than provisional.** The caveat a reader needs NOW is a different one and it is smaller: the measurement found that §4.1's `slide-shape` unit cannot be written from the I2 shape the acquire path holds, so a deck's unit is an open design question rather than a settled one (Incomplete sections, below). **AMENDED 2026-09-15 by REC-91: §7 row 4 is BUILT** — `capture_text` and `capture_text_fts` exist, are written at promote for `pdf-page`, `doc-para` and `slide-shape`, are replaced on a chain move, carry `truncated` per unit, are purged on both arms, and the per-capture `indexed` observation is written under `authority_kind = derive`, all under `IC-104`. **Three things the section did not predict are in the Incomplete list below and one of them changes a number the section states:** §4.3's 2 MiB per-capture bound CANNOT FIRE through the route §4.1 names, because `op=promote` refuses an inline bundle file over 1,048,576 B first (M-32); the route stores the text a SECOND time in `files`/`history`, which §3's chosen option says it does not; and a deck's speaker notes have no indexable unit at all. Items 5 and 6 are untouched and still outstanding, and §3–§6's mechanism does not otherwise change. **AMENDED 2026-09-15 by REC-90: §7 row 2 is BUILT** — the `content:` arm, `rows=content`, the three columns on `rows=leg` and §5's outstanding *index decision per filtered column* all landed under `IC-98`, with the index decision MEASURED at `MEASUREMENTS.md` M-21 rather than reasoned. Items 4, 5 and 6 are untouched and still outstanding, and §3–§6's mechanism does not change. **One gap in §4.2 was found in the building of it and is in the Incomplete list below:** the section asks the `content` table for a last-step-of-chain predicate and that column holds the whole chain as JSON, so the filter is a read-time parse — while §4.1 gives `capture_text` a `chain_kind` COLUMN for the identical question and says why. **AMENDED 2026-09-14 by REC-89, and the amendment is about this document's own completeness rather than its mechanism: §7's decomposition row 1 (D-225's caps) WAS ALREADY BUILT when this document was written** — it landed at REC-60 on 2026-08-07 under `IC-25` — and the row was written as outstanding because `DEBT.md` D-225 still read `open`. §2's corresponding constraint row and §7 row 1 now say so; nothing about the mechanism in §3–§6 changes, and items 2–6 are untouched and still outstanding. The general lesson is recorded rather than only the instance: **a design that cites a debt row as a precondition inherits that row's staleness**, and this document cited three, as of 2026-09-16.

**AMENDED 2026-09-16 by REC-111 — §4.3's OWED UNIT-COUNT BOUND IS BUILT, AND THE ROW'S OWN PREMISE WAS HALF WRONG, WHICH IS THE finding worth more than the bound.** *A container whose units are many and small is bounded by nothing this design specifies* is true of THIS DOCUMENT and false of the SYSTEM: M-35 measured both routes that reach the index writer and both were already bounded — the acquire wire at **4,064** units (its byte budget charges a 128 B envelope per unit), a caller-authored `data/provenance.json` at **13,720** (`INLINE_MAX` refuses the file first), at 22.8 % and 40.9 % of the CPU window. **What was wrong is that BOTH BOUNDS WERE ACCIDENTS** — a JSON envelope estimate and an inline-file limit that knows nothing about indexing — written down nowhere and free to move the day an unrelated constant moves. So the remedy built is a STATED unit budget (`CAPTURE_TEXT_CAPTURE_UNIT_BOUND`, 4,096, from M-20's own *largest promote that fits*) and **NOT** §4.1's chunk-across-ticks, because there is no write too large for a tick to chunk and making one would mean raising the wire's byte budget — the exact regression this document was corrected for on 2026-09-16. No check was added at the acquire wire and that absence is measured, not an omission: the largest budget that regresses nothing (4,096) is above the most the wire can send (4,064), so a wire-side check provably cannot fire; the ceiling is PINNED by assertion instead. Nothing the record accepts today stopped promoting — both of M-20's largest real documents are driven by name. §3–§4.2 and §4.4–§6 are unchanged. **The one bullet struck from the list below is §4.3's unit-count bullet, struck rather than annotated per `CORPUS-STANDARD.md` §3.**

**Place in the system** · Level 2. Serves construct 9 (retrieval — `BIO_System_Design.md` §3 names no level-1 home for it; `BIO_Content_Framework_v0_10.md` Part II §14.2–14.3 and §17 carry the adopted design) and construct 4 (content, Part II). Depends on `CONTENT-EXTENT-DESIGN-SPACE.md` §6 (the content row this searches over), `INVESTIGATIVE-SESSION.md` §14c (the graded options for D-222, whose stage C this is) and `RETRIEVAL-SUBSTRATE.md` (the FTS5 substrate and its measurements). Feeds `OBSERVATION-LOG-DESIGN.md` (the content-axis state a search answer must state) and `EXTRACTION-BREADTH-DESIGN.md` §3 (the extent arms for tables and images, which become indexed units when they exist). Supersedes nothing; it discharges the design half of D-222's stage C, fixes D-225's place in the order, and gives M5's indexing gap its shape.

**Incomplete sections** ·
- §4.3 / §3 — **TEXT IS STORED TWICE, and §3's chosen option rests on it being stored once.** The units ride in
  `data/provenance.json`, a bundle FILE, so their bytes land in `files.content` AND in `history` in addition to
  `capture_text`. Measured and reported by REC-91, which did not own the two areas a promote-package sibling
  outside the bundle image would touch. **Open against §3, not closed by §4.3's correction.**
- §4.2 — the `content:` arm's `chain` filter has no column to read. The section names `chain` (the
  chain's LAST STEP) as one of the arm's six filters over the `content` table, and that table stores
  the WHOLE chain as JSON — so the predicate is `json_extract(chain, '$[#-1].step')`, a read-time parse
  that no ordinary index can serve. §4.1 recognised the identical need one construct over and gave
  `capture_text` a `chain_kind` COLUMN for it, in its own words *"so 'every OCR'd unit' is a predicate
  and not a parse"*; §4.2 asks the same question of `content` and gives it no such column. **Measured
  2026-09-15 (M-21): it is the SLOWEST single-column filter on the table — 8.579 ms against 2.3–5.4 ms
  for the five that are indexed — and it is the one query in the set that no index improved.** Built as
  the parse by REC-90, which does not own the mint path a `chain_kind` column would be written at;
  either `content` gains that column at the mint, or this section records the parse and its cost as the
  decision. Found by REC-90 and reported as a DESIGN GAP.
- §4.1 — workbooks: the indexing unit for a sheet waits on `EXTRACTION-BREADTH-DESIGN.md` §3.2's `sheet-range` arm; until it exists a workbook is searchable at document grain only, and the answer says so. **Measured 2026-09-14 (M-20): 288 workbooks in COFF-6's census hold 72,651,441 bytes of extracted text over 1,056 sheets and not one indexable unit between them, so this gap has a size.**
- §4.3 — **THE PER-CAPTURE BOUND IS NOT THE BOUND THAT BINDS, and the section's own argument
  for it does not hold at every grain.** Two findings, both measured 2026-09-15 by REC-91 while
  building §7 row 4 (`MEASUREMENTS.md` **M-32**). (a) The 2 MiB figure **cannot fire**: the units
  reach the store through `data/provenance.json`, and `op=promote` refuses an inline bundle file
  over `INLINE_MAX` = 1,048,576 B — a 2.4 MiB capture produced a 2,460,076 B file and the WHOLE
  PROMOTION was refused, not truncated. Left alone that would have made this design REFUSE
  documents the record accepts today (M-20's census holds a PDF at 1,354,686 B of text and a docx
  at 1,187,253 B), so the acquire wire now carries its own budget and publishes what it drops.
  The section's number is still the right number for the STORE; it is not the number a reader
  should expect to see bite. (b) The section reasons that a capture at the bound is 45.7 % of the
  CPU window "so the bound cannot by itself push a promote over the ceiling" — **true at page
  grain and false at paragraph grain**, from M-20's own ladder: the census's worst docx is 20,571
  units and 1,187,253 B, INSIDE the byte bound, at 84.8 % of the window. **Bytes do not bound the
  unit count**, and the unit count is the dominant term for a word-processing container. §4.1's
  chunk-across-ticks remedy is the one this wants, and REC-91 did not choose a second bound
  because that is a decision about what a member's promote may cost. **(b) IS DISCHARGED 2026-09-16
  by REC-111 and (a) STANDS: the bound built is a UNIT BUDGET, not chunk-across-ticks, because
  M-35 measured both routes to the index writer and neither can produce a write too large for a
  tick. §4.3 carries the decision, the number and the two route ceilings. This bullet is kept
  rather than struck because (a) — the 2 MiB constant being unreachable through the product's own
  route — is still true.**
- §3 / §4.1 — **"text is stored once" does not hold for the route §4.1 names.** §3 chose option
  (iii) partly on that property, and §4.1 says the units are written at promote "from the I2 shape
  the acquire path already holds" without saying HOW that shape reaches promote. The only route
  that needs no change from any caller is `data/provenance.json` — which is a bundle FILE, so its
  bytes land in `files.content` and in `history`. The text is therefore stored in `capture_text` at
  M-20's measured 1.998 B per text byte **and again in the bundle image**. The alternative (a
  promote-package sibling outside the hashed image) costs edits in two areas REC-91 did not own
  and was not taken. Found and reported by REC-91.
- §4.1 — **a deck's SPEAKER NOTES have no indexable unit, and they are the most candid text in a
  deck.** `pptxText` emits `speakerNotes[]` per slide and DEC-5 requires them "DISTINGUISHABLE
  from slide text EVERYWHERE shown, cited or indexed, never merged", so they cannot be folded
  into the slide's unit. Nor can they have one of their own: the only address that reaches a
  slide is `slide-shape`, and its shape-omitted form is now THE SLIDE, so a notes unit would
  collide with the slide's own primary key. The section resolves the deck's unit and says nothing
  about the notes. Found by REC-91 in the building of it; it wants an extent arm, which is a
  grammar decision and not this section's to take alone.
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

**Written at promote, inside the promote transaction**, from the I2 shape the acquire path already holds: `text.pages[]` for a PDF (one unit per page, `pdf-page` with the page's full rectangle), `text.paragraphs[]` for a pageless container (`doc-para`), and — **DECIDED 2026-09-15, the fork M0-31's measurement opened and this section left open for one day — one unit per SLIDE for a deck**, written as a `slide-shape` extent with the SHAPE OMITTED, which `covers()` already accepts as covering the whole slide (`textchain.mjs`). Three reasons, and the first is this section's own rule pointed at a third container: **a shape is not a passage**, exactly as a cell is not one — the deck's analogue of a PDF's page is the SLIDE, which is what a reader sees and what a citation names. Second, it needs no producer change: `pptx.mjs` emits one text string per slide today and discards the shape index when it collects a paragraph's text, so a shape-grain unit would require a format change for a finer grain nobody has asked for. Third, it needs no grammar change: the extent arm exists and `covers()` accepts the shape-omitted form. **What the slide unit CANNOT be, stated rather than discovered later: a reading POSITION.** `readingSource()` requires both `slide` and `shape`, so a slide-grain unit is expressible as an EXTENT and not as the position a reference was read at — which means deck-grain CONNECTIONS wait on `pptx.mjs` emitting per-shape text (FW-17's axis, not this one), while deck-grain SEARCH does not wait on anything. If per-shape text ever lands, narrowing the unit is additive: a finer unit for the same document, under the same extent arm. **And this ruling removes the shape as a SEARCH UNIT, never as an EXTENT** — stated here because the two are easy to read as one: `covers()` still accepts a shape-specified `slide-shape` extent, a member may still cite one, and nothing in this design bounds the shape index. That inner bound is D-359's, carried by COFF-11, and a reader who takes this section as closing that row has read a decision about what gets INDEXED as a decision about what may be POINTED AT. The office producers already emit these references (Part II §15); the PDF producer emits `pdf-page`. Same rule as the readings' promote-time projection (Part II §16): the capture's previous text rows are deleted first, so a revised chain never leaves a unit claiming an engine that did not produce it.

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

**CORRECTED 2026-09-16 by BOB #12, folding what REC-91 BUILT AND MEASURED rather than restating what
this section said — the document follows the code here, and the code follows the design decision, in that
order. This section was wrong in THREE independent ways, and the first two read as one, which is the
hazard: closing the siting looks like closing the lot.** The corrected statement is below; what the
section claimed until today is kept at the end of it, because a reader needs to see what was overturned.

**THE BOUNDS AS BUILT, and only one of them is the operative one:**

| bound | value | where it lives | does it fire? |
| --- | --- | --- | --- |
| the acquire wire's own budget, `ACQUIRE_TEXT_UNITS_BUDGET` | **524,288 B** | `index.mjs` | **YES — this is the bound that actually binds** |
| `INLINE_MAX`, the promote path's per-FILE limit | **1,048,576 B** | `store.mjs`; the refusal is whole-call | **YES — it refuses the entire promotion** |
| this section's per-capture bound, `CAPTURE_TEXT_CAPTURE_BOUND` | 2,097,152 B | `store.mjs`, `#writeCaptureText` | **NO — unreachable through the product's own route** |

**1 · MIS-SITED, AND THE QUESTION I FAILED TO ASK IS THE GENERAL LESSON.** The units ride in
`data/provenance.json`, which is a bundle FILE, and `op=promote` refuses any inline file over `INLINE_MAX`
**whole-call** before the index writer is ever reached. So the 2 MiB bound sits DOWNSTREAM of a 1 MiB
refusal and cannot fire. **M0-31 answered *how big is the text*; the question that SITES a bound is *what
refuses BEFORE me*, and this section asked only the first.** A 2.4 MiB capture's provenance file measured
2,460,076 B and had its whole promotion refused.

**Unaddressed this would have been a REGRESSION, not a new limit** — M-20's census holds a PDF at
1,354,686 B and a docx at 1,187,253 B; **both promote today and neither would have.** An index that makes
the record unable to FILE a document is the worst direction available. REC-91 therefore put the budget at
the WIRE, at **half of `INLINE_MAX` on purpose**, so JSON escaping and the rest of the document cannot
blow the file on punctuation — and it **COUNTS what it drops**, so the capture reports `partial` rather
than being recorded as whole.

**2 · THIS SECTION'S HEADLINE CLAIM IS FALSE AS BUILT** — a consequence of (1) and not a fourth defect,
stated separately because the sentence is quotable and was quoted. It said the bound *"admits 100 % of the
measured 1,000-PDF sample fully"*. Against the operative 524,288 B budget the sample's worst PDF
(1,354,686 B) is **2.58× over and lands `partial`**. The claim was true of the number this section chose
and false of the system that ships, which is the only sense that counts.

**3 · BYTES DO NOT BOUND THE UNIT COUNT, AND THIS IS INDEPENDENT OF (1) AND (2).** The index costs ROWS
and FTS ENTRIES; this section bounds BYTES. A spreadsheet of one-character cells is small in bytes and
enormous in units, and a deck is the reverse. Read off M-20's own ladder rather than re-measured, **because
this section drew the opposite conclusion from the same table**: its *"45.7 % of the measured
per-invocation CPU window, so the bound cannot by itself push a promote over the ceiling"* is true **at
PAGE grain only**. M-20's worst docx is **20,571 units at 1,187,253 B — INSIDE the byte bound — at 218 ms,
84.8 % of the 257 ms window.** The unit count is the dominant term for a word-processing container.

**4 · AND A GAP AGAINST §3 THAT IS NOT A BOUND AT ALL**, reported by REC-91 and outside this section's own
framing of its defect. §3 chose option (iii) partly because **text is stored once**. Through this route it
is stored **TWICE** — once in `capture_text` at M-20's 1.998 stored bytes per text byte, and once more in
the bundle image, because `data/provenance.json`'s bytes land in `files.content` AND in `history`. It is
the only route that needs no change from any caller; the alternative — a promote-package sibling outside
the bundle image — costs edits in two areas REC-91 did not own. **Recorded as a live gap against §3, not
closed by this correction.**

**WHAT IS DECIDED HERE, so the next reader is not left with four findings and no rule:**

- **The operative per-capture bound is expressed at the WIRE, in bytes, RELATIVE TO WHAT PROMOTE ALREADY
  REFUSES.** That is not a preference: any bound sited after `INLINE_MAX` is unreachable by construction,
  so the only place a per-capture text bound can bind is upstream of the file it rides in.
- **The 2 MiB store-side constant STAYS, and is relabelled a BACKSTOP rather than deleted.** It costs
  nothing, and a second line of defence is worth keeping the day the wire's shape changes. **What is not
  acceptable is what this section did — presenting it as the operative bound.** `nc-rec91.mjs`'s
  `overstrict` arm reaches its branch only by lowering the constant, and **a control arm that can reach a
  branch the product's own route cannot is a finding about the ROUTE, not a passing control.**
- **A UNIT-COUNT bound is BUILT — REC-111, 2026-09-16 — and it is `CAPTURE_TEXT_CAPTURE_UNIT_BOUND`,
  4,096 units, in `store.mjs` beside the byte bound and tested in the SAME BRANCH.** Over it a capture is
  indexed TO it in reading order and reads `partial`, and the observation's sentence says WHICH bound
  bit: *too big* and *too many pieces* want different answers from a member, and only the first could be
  said before. The number is M-20's own sentence — *"the largest promote that fits is ~3,900 units"* — at
  the resolution the adjacent constants use (524,288 / 128 = 4,096); at 4,096 units with the byte bound
  also at its maximum M-20's fit predicts 141.7 ms against a 257 ms window.

  **THE CHOICE BETWEEN THIS AND §4.1's CHUNK-ACROSS-TICKS WAS MADE FROM THE LADDER AND NOT FROM
  JUDGEMENT, AND IT IS STATED HERE WHICHEVER WAY IT WENT.** Chunking is the remedy for a write that does
  not FIT a tick. REC-111 measured (**M-35**) both routes that can reach the index writer and neither can
  produce one: the acquire wire admits at most **4,064** units, because its 524,288 B budget charges a
  128 B envelope per unit and a unit with no text is never emitted — 58.5 ms, **22.8 %** of the window;
  a caller-authored `data/provenance.json` admits at most **13,720**, because `INLINE_MAX` refuses the
  file above 1,048,576 B and the store reads that file only as inline text — 105.0 ms, **40.9 %**. There
  is no write to chunk, and making one would mean RAISING the wire's byte budget first, which is the
  exact regression this section was corrected for. Chunking would also have to coin a fifth `indexed`
  state for *written so far, resuming*, against a vocabulary `store.mjs` states at `#observeIndexed` is
  CLOSED — and a capture promoted with a half-written index and nothing saying so is the record claiming
  coverage it does not have.

  **AND THE PREMISE THE ROW WAS WRITTEN ON WAS HALF WRONG, WHICH IS THE PART WORTH CARRYING.** *A
  container whose units are many and small is bounded by nothing this design specifies* is true of THIS
  DOCUMENT and false of the SYSTEM: both ceilings above already existed. What was actually wrong is that
  **both were ACCIDENTS** — one falls out of a JSON envelope ESTIMATE, the other out of an inline-file
  limit that knows nothing about indexing — neither was written down anywhere, and either moves the day
  an unrelated constant moves. This section asked for both bounds *"stated in one place"* so *"neither
  hides the other"*; the byte bound was HIDING the unit bound. **A bound nobody could state without doing
  arithmetic across two files is not a decision about what a member's promote may cost; it is a
  side effect wearing one.**

  **NO CHECK WAS ADDED AT THE ACQUIRE WIRE, and the absence is a measured result rather than an
  omission.** The largest unit budget that regresses NOTHING is 4,096, and that is above the 4,064 the
  wire can reach — so a wire-side unit budget provably cannot fire, and a check that cannot fire is a
  mechanism a reader would believe on the strength of its existence. Set it lower and it starts trimming
  real documents: M-20's median `doc-para` is 10 B, so a document of ~3,800 short paragraphs passes
  today. The wire's ceiling is instead PINNED by assertion — `capture-text-index.test.mjs` reads the two
  operands out of `index.mjs` and the bound out of `store.mjs` and fails if `ceiling > bound` — which is
  the live mechanism, driven by `nc-rec111.mjs`'s `pinoff` arm. §4.1 names `sheet-range` as a coming unit
  arm with a larger extent, so the envelope estimate WILL be revised, and without the pin a change about
  BYTES would silently change what a promote may COST.

  **IT REFUSES NOTHING THE RECORD ACCEPTS TODAY, and that is the arm that decided it was safe to ship
  rather than the overflow arm** — this section has already shipped a bound that was a regression once.
  Both of M-20's largest real documents are driven BY NAME and at their measured sizes and are unchanged:
  the worst PDF (1,181 units, 1,354,686 B) and the worst docx (20,571 units, 1,187,253 B), the second of
  which already lands `partial` at the wire today, where its 60 B mean paragraph costs 188 B against a
  524,288 B budget. The bound bites on exactly one thing: a caller-authored provenance document of many
  tiny units, which is the case this section named and the case nothing stated.

**WHAT THIS SECTION SAID UNTIL 2026-09-16, kept so the overturning is visible:** two bounds, both in
bytes — `TEXT_CAP` 131,072 B per unit (KEPT, and still correct: over M-20's 148,413 units the largest is
21,224 B, so the cap is 6.2× the largest unit the corpus produced and is a guard rather than a policy; a
unit over it is stored TO it with `truncated = 1` and `rows=passage` carries the flag, never a silent
prefix) — and 2,097,152 B per capture, which is the half that was wrong. The per-format note beneath it
stands unchanged: COFF-2's 20 MiB of declared uncompressed text-part bytes still applies upstream for
office containers, 18 workbooks in the census are over it, and a workbook has no unit arm anyway.

The per-capture `indexed` state — `full` · `partial` · `none (reason)` — is written as a content-axis
OBSERVATION (`OBSERVATION-LOG-DESIGN.md` §4.2), not as a column of its own, so that *not extracted*,
*extracted but over the bound* and *extracted and indexed* are one vocabulary in one place. This document
consumes that state; it does not define a second. **Unchanged by this correction, and now load-bearing in
a way it was not: with the operative budget at 524,288 B, `partial` is the NORMAL outcome for a large
document rather than an edge case, so the envelope in §4.4 is what keeps a partial index honest.**

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
| 2 | RECORD | ~~**the `content:` arm and `rows=content`**~~ — **LANDED 2026-09-15 (REC-90), under `IC-98` on I3, ADDITIVE.** The `MEANING` entry over `content` with its six sub-fields, the `rows=content` descriptor, the three columns on `rows=leg`, and **the index decision per filtered column MEASURED** (`MEASUREMENTS.md` **M-21**, `test/content-index-probe.mjs`, two corpus sizes against a measured 20.5 % noise floor): all six candidates ship, and `content:cited` was **31.6 SECONDS** unindexed against 9 ms indexed. Two things this row did not predict and the landing carries: the answer's **four-level statement** (`level`/`scope`/`levels`/`says` on every `op=meaningrows` answer — CLAUDE.md's sparse rule, made mechanical where a member reads absence), and a PRE-EXISTING defect the row's own worked example could not compile past — `leg:grade>=B` had compiled to `grade = 'GRADE>=B'` since PL-8, silently, on every arm. **The `chain` filter is a read-time JSON PARSE and is reported as a DESIGN GAP against §4.2** (see the Incomplete list) | item 1; REC-83, REC-84 | **`IC-98`, PROPOSED — CONDUCT takes the bump and the RESOLUTION** | §4.2 |
| 3 | M0 / RECORD | **the measurement** — §5's four numbers, recorded; §4.3's per-capture bound set from them | — | — | §5 |
| 4 | RECORD (FRAMEWORK answers-for on the I2 read) | ~~**`capture_text` and `capture_text_fts`**~~ — **BUILT 2026-09-15 (REC-91), under `IC-104` on I5 AND I1, both ADDITIVE.** The two tables before `host_governor`, three FTS maintenance triggers, the promote-time writer replacing the capture's units on a chain move, `truncated` per unit, the per-capture `indexed` observation under `authority_kind = derive`, both purge arms, and `contentAxisFor`'s `unitIndex` finally true. **Four things this row did not predict and the landing carries:** a plain per-row `DELETE` on an external-content FTS table answers `SQLITE_CORRUPT_VTAB` and `INSERT OR REPLACE` silently ORPHANS an index entry that still MATCHES (M-32) — so the writer deletes-then-inserts and the index is trigger-maintained; the `indexed` state needed its OWN authority kind, because one unqualified latest-row read would have started answering `extraction:` with an index row; `contentAxisFor` needed a null branch, because a capture promoted before this writer existed has no index observation and reading that as `false` answered PARTIAL over a capture with no indexed units; and **§4.3's bound cannot fire through this route at all** — see the Incomplete list. **The UNIT-COUNT half of that finding is DISCHARGED 2026-09-16 by REC-111, which is NOT a seventh row in this table** (it is the bound §4.3 owed, not a piece of the decomposition): `CAPTURE_TEXT_CAPTURE_UNIT_BOUND` at 4,096, a unit budget rather than §4.1's chunk-across-ticks, with the choice made from M-20's ladder and M-35's two route ceilings and stated in §4.3. **The original row text: `capture_text` and `capture_text_fts`** — written at promote for `pdf-page`, `doc-para`, `slide-shape`; replaced on chain move; `truncated` per unit; the `indexed` observation per capture; purge both arms; hygiene (the table before `host_governor`); the negative control | item 3; REC-82 (the canonical extent form); CAP-9 (the page count) | I5, additive, an IC | §4.1, §4.3 |
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
