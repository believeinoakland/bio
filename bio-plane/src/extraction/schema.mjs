/* extraction's tables (layers.md ruling 3: each module owns its tables), moved from `schema.mjs` with their
   reasons unchanged: readings, reading_refs, reading_ref_terms, reading_text_source, capture_text,
   reading_history; and the four this module added: capture_text_skipped (D-724), capture_text_state (R36),
   composed_readings (R21, K104). `capture_text_fts` and its triggers are created by `migrate()` (index.mjs):
   a trigger carries `;` inside BEGIN/END, and this text is split on `;` before it runs. */
export const EXTRACTION_SCHEMA = `
-- 2026-09-14, REC-81: every citation into the content framework in this file names a
-- SECTION rather than a line. The line numbers they carried went stale the moment the
-- framework gained front matter -- 89 lines, measured -- and CORPUS-STANDARD.md
-- section 4.6 rules that a citation into a design document names the SECTION.
-- CONSTRUCTS Step 3 (FW-5): READINGS ARE PERSISTED. A reading is what a content
-- type's parse() found in a captured document -- its entities plus document-level
-- facts (BIO_Content_Framework_v0_10.md §7). op=acquire runs the resolved
-- doctype's reader over the captured text and carries the reading on the acquire
-- document; op=promote DERIVES it from data/provenance.json and persists it here,
-- in the SAME transaction that writes the register row and the refs projection it
-- sits beside -- the same discipline refs follow, so the table is a projection of
-- the document rather than a second place to state it. One row per captured
-- document, keyed by the capture identity (register.capture_sha, I1 section 1).
-- found is 0 for a FAILED or EMPTY reading, recorded HONESTLY as such: a reader
-- that finds nothing is a failed reader, never an emptied document (framework §7),
-- so an empty reading is a fact about the reader and is never backfilled with
-- invented entities. reading holds the whole reading as JSON. DERIVED from the
-- corpus, so a whole-store purge clears it (D-113).
CREATE TABLE IF NOT EXISTS readings (
  capture_sha    TEXT PRIMARY KEY,
  bundle_id      TEXT NOT NULL,
  content_type   TEXT,
  reader_version INTEGER,
  found          INTEGER NOT NULL DEFAULT 0,
  entity_count   INTEGER NOT NULL DEFAULT 0,
  reading        TEXT NOT NULL,
  at             TEXT,
  -- D-440 (EXTRACTION-BREADTH-DESIGN.md section 3.2). The capture's FORMAT key as
  -- its provenance document's profile recorded it (detectFormat, magic bytes
  -- first and the declared Content-Type second), projected at op=promote from the
  -- SAME data/provenance.json the reading is. It answers one question, asked by
  -- contentContextFor: is this capture an office container, whose own bytes can
  -- hold an embedded media part. NULLABLE AND NEVER BACK-FILLED: NULL means the
  -- provenance document carried no format, and the reader falls back to the
  -- reading's own text_container, then states the kind UNDETERMINED.
  capture_format TEXT,
  -- K104 (R21): WHO COMPOSED THIS READING. 'composed' when this instance's own read composed it (its digest
  -- is in composed_readings), 'asserted' when a caller carried it in data/provenance.json and this instance
  -- did not compose it; NULL for a row written before K104, whose origin is undetermined and is not inferred.
  origin         TEXT,
  -- For an asserted reading: the promotion's author stamp, the standing that stamp carries (member, machine
  -- or plane), and the details the caller gave to justify it (doc.reading_justification, kept verbatim).
  asserted_by        TEXT,
  asserted_standing  TEXT,
  justification      TEXT
);
CREATE INDEX IF NOT EXISTS readings_bundle ON readings(bundle_id);
-- The entity-reference index: one row per entity a reading carries, keyed by the
-- reference AS IT APPEARS in the reading -- the raw, source-assigned kind:key (an
-- id in a URL is a key, a position in a list is not), e.g. meeting:2101. It is NOT
-- a canonical entity id: resolving a reference to a canonical entity, and the
-- subject registry, are Step 4 / D-83 and are deliberately not built here. This is
-- what makes "which documents' readings carry this reference" one indexed lookup,
-- the reverse index Step 4 consumes. Also DERIVED from the corpus; a whole-store
-- purge clears it (D-113).
-- FW-17 / IC-86: WHERE THE REFERENCE WAS READ, in IC-1's element-reference
-- vocabulary and no other. The three columns move together -- a row has all
-- three or none -- so a half-written position can never read as a whole one.
-- NULL IS A STATEMENT AND NOT A DEFAULT: it means THIS READING CANNOT SAY WHERE,
-- never that the whole document was meant. A member's citation naming no part
-- means the whole document (Bob, 2026-09-14, 5.3), and that is a member's act of
-- citation, not a reader's silence -- collapsing the two would let a reader's
-- shortcoming read as a member's choice. The reading's own basis says WHOSE
-- absence it is, so the null is never bare.
-- The column arrives WITH its writer (schema.mjs's own standing rule): the
-- agenda reader emits a position and op=promote projects it in the same landing.
-- D-454: ONE ROW PER OCCURRENCE, keyed (capture_sha, ref, occurrence). Until this
-- the key was (capture_sha, ref), so a reference string read on three pages was
-- ONE row at the first page, and a member choosing a connection's on-point mention
-- (REC-122) could not choose page 9. occurrence is the place (pos_kind:pos, the
-- two columns beside it, so it is computable from them), and every unplaced read of
-- one reference is the ONE row with an empty occurrence -- the record cannot tell
-- apart reads it cannot place. seq is the reading order, and seq 0 is the FIRST read,
-- which is exactly the one row every store held before this: a read asking about the
-- REFERENCE (resolve, the name index, the frontier) reads seq 0, and a read asking
-- about its MENTIONS reads every row. The re-key keeps every existing row (the
-- migration renames, recreates and copies forward, store.mjs #migrate).
CREATE TABLE IF NOT EXISTS reading_refs (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  ref_kind     TEXT,
  ref_key      TEXT,
  label        TEXT,
  pos_kind     TEXT,   -- IC-1's discriminator: pdf-page | sheet-cell | slide-shape | doc-para
  pos          TEXT,   -- the per-arm fields as canonical JSON, key-ordered so two reads of one place compare equal
  pos_ref      TEXT,   -- IC-1's REQUIRED human form, produced by the container that knows it
  occurrence   TEXT NOT NULL DEFAULT '',  -- D-454: WHICH read of ref this row is, pos_kind:pos, empty = unplaced
  seq          INTEGER NOT NULL DEFAULT 0, -- D-454: reading order among ref's occurrences, 0 = the first read
  PRIMARY KEY (capture_sha, ref, occurrence)
);
CREATE INDEX IF NOT EXISTS reading_refs_ref ON reading_refs(ref);
CREATE INDEX IF NOT EXISTS reading_refs_bundle ON reading_refs(bundle_id);
-- REC-36: the NAME index -- one row per normalised TERM of a reference's label,
-- which is what makes the framework section 8.1 GRADE-C tier (a document that
-- mentions a subject by NAME, carrying no reference the source assigned) an
-- indexed lookup instead of a corpus scan. Before this, reading_refs had an index
-- on ref and none on label, so a name-only mention was unreachable from any
-- member surface and REC-18's earned grades were bounded to exact references.
--
-- WHY TERMS AND NOT A NORMALISED LABEL COLUMN, and it is MEASURED, not preferred
-- (the MEASUREMENTS ledger 2026-08-04, REC-36; instrument test/label-variance-probe.mjs).
-- Over the one real captured document this repository holds -- a 33-page Oakland
-- Legistar agenda read by the real doctype -- a subject name was the WHOLE label
-- in 0 of 41 labels against 33 names taken from the document itself. The label is
-- the document ITEM's title ("Contract Agreement For James Beere As Oakland Police
-- Chief"), and the name is EMBEDDED in it. A column holding the normalised whole
-- label, however carefully folded, would have answered nothing. Requiring every
-- term of a name to be present found 15 -- exactly what a substring scan found --
-- so the indexable form loses nothing against the scan it replaces, at a measured
-- 305 rows for that whole document.
--
-- term is the case-folded, whitespace-collapsed, punctuation-split form produced
-- by the SAME normaliser entity_aliases.alias_norm keys on (Store labelTerms over
-- normAlias). One function, so the two sides of the join cannot drift; a term
-- projection that folded differently from the alias index would silently stop
-- matching and nothing would fail.
--
-- bundle_id is carried so the D-15 viewer gate applies IN SQL at the lookup --
-- a candidate the viewer may not see is not a candidate and its row is withheld,
-- not merely redacted. DERIVED from the corpus like readings/reading_refs, so a
-- whole-store purge clears it (D-113) and a re-promotion replaces it.
-- REC-40: THE SAME INDEX NOW CARRIES THREE TERM SOURCES, AND src IS PART OF
-- THE KEY. REC-36 indexed the label alone, which made op=readingname answer on
-- the NAME a reading recorded while op=readingref answered on the REFERENCE
-- STRING -- so the framework 8.1 A and B tiers (a document whose reference, or
-- whose reference KEY, is spelled like a subject's registered name) were
-- proposable only by a caller who already knew the exact string to ask for, and
-- after UI-26 traded away the per-name loop they were proposable from no surface
-- at all. #recognise reads THREE strings and grades them A (ref), B (ref_key)
-- and C (label); an index carrying one of the three answers one of the three.
--
-- WHY THE SAME TABLE AND NOT A SIBLING, by this project's own test (D4 as REC-42
-- and REC-44 applied it): a term of an identifier needs NO ORDINAL of its own --
-- it is keyed by exactly what a label term is keyed by, it has no ordering, no
-- lifecycle and no identity apart from the reading_refs row it is derived from
-- and dies with -- and NO QUERY IS KEYED ON IT SEPARATELY. There is one question
-- ("every term of this registered name present within one reference's one
-- source") and REC-40's whole requirement is that ONE call answer every tier, so
-- a second table would force either a UNION of two compound arms -- toward D-36's
-- five-compound workerd ceiling -- or two statements, which is the N-call shape
-- this item exists to remove.
--
-- WHY src IS IN THE PRIMARY KEY, and it is a CORRECTNESS requirement rather
-- than a way of labelling the answer: the lookup is a SUBSET test (every term of
-- the name present in one group). If the label's terms and the reference's terms
-- shared a group, a registered name could be satisfied by a MIX -- one word taken
-- from the document's title and another from its reference string -- manufacturing
-- a correspondence that NEITHER string made. That puts a wrong subject on a
-- document, which is the direction the diacritic decision below already refuses
-- to take. So the group is (capture_sha, ref, src) and a mixed match is
-- structurally impossible rather than filtered out afterwards.
--
-- src is label, ref or key, and key is written only when the reference
-- key normalises to something different from the whole reference -- the same
-- guard #recognise applies before it considers the B tier, so the index and
-- the recogniser cannot disagree about whether a B tier exists.
CREATE TABLE IF NOT EXISTS reading_ref_terms (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  src          TEXT NOT NULL,
  term         TEXT NOT NULL,
  PRIMARY KEY (capture_sha, ref, src, term)
);
CREATE INDEX IF NOT EXISTS reading_ref_terms_term ON reading_ref_terms(term);
CREATE INDEX IF NOT EXISTS reading_ref_terms_bundle ON reading_ref_terms(bundle_id);
-- CPDF-10: the TRANSCRIPTION PROVENANCE PROJECTION -- what a reading's text
-- chain says, in columns, so an OCR'd document is distinguishable from a
-- published text layer by a QUERY and not only by reading a JSON blob.
--
-- DERIVED from the reading exactly as reading_refs is, rebuilt in the same
-- transaction, and cleared by a purge in both arms (D-113). Nothing here is a
-- second authority: every column is computed from the stored chain by
-- textchain.mjs, so this table can be dropped and rebuilt and cannot disagree
-- with the reading it projects.
--
-- transcribed is the headline: 1 when some machine derived this text, which is
-- TRUE FOR A TEXT LAYER TOO -- a layer is somebody else's transcription that we
-- decode faithfully (CPDF-9 measured ABBYY FineReader in 3 of 14 recent
-- Legistar attachments). terminal_step names the last thing that touched it.
-- derivation_cap is the weakest link over the chain's derivation steps and is
-- NULL when no step carries a measured fidelity -- undetermined, stated.
--
-- CITATION RE-POINTED 2026-09-14 (CPDF-17). PART II section 15 of
-- docs/architecture/BIO_Content_Framework_v0_10.md inventories this projection as
-- the "transcription chain" form of content and is the authority on it, cited by
-- SECTION and not by line. It records what is BUILT here and, in the same row,
-- what is NOT, which this header does not say and a reader should not have to
-- discover: the ai(function, version) step is a legal shape of the chain that
-- nothing in the tree emits, a chain is per CAPTURE with page-scoped parts only
-- for a MIXED document (D-252), and the OCR member's per-line region provenance
-- reaches the reading while no edge reads it. For why the form is a SECTION and
-- not a line, and for the Part I citations in this file that REC-81 converted to
-- sections on 2026-09-14, see the no-extent block above.
CREATE TABLE IF NOT EXISTS reading_text_source (
  capture_sha    TEXT PRIMARY KEY,
  bundle_id      TEXT NOT NULL,
  transcribed    INTEGER NOT NULL DEFAULT 0,
  terminal_step  TEXT,
  engines        TEXT,    -- JSON array of engine names the chain runs through
  derivation_cap TEXT,    -- a BASIS_GRADES letter, or NULL for undetermined
  steps          INTEGER NOT NULL DEFAULT 0,
  chain          TEXT,    -- the chain itself, so a reader needs no second lookup
  -- CPDF-13 / D-253: the CALIBRATION IDS this chain's steps reference, JSON
  -- array. DERIVED from the chain by calibrationsOf() like every other column
  -- here, so it cannot disagree with the chain it projects.
  --
  -- IT IS HERE SO THE DRIFT HANDLER'S QUESTION IS A QUERY. "Which
  -- transcriptions rest on calibration CAL-n" over a JSON blob is a full scan of
  -- every reading in the store; over this column it is one indexed read. The
  -- obligation itself is still DERIVED and stored nowhere (REC-17's rule) --
  -- what is projected here is the BINDING, which is a fact about the chain, not
  -- a verdict about the document.
  --
  -- NULL means the chain names no calibration, which is the pre-CPDF-13 shape
  -- and is legal: it says this text never rested on a measurement this record
  -- holds, which is a different statement from resting on one that moved.
  calibrations   TEXT
);
CREATE INDEX IF NOT EXISTS reading_text_source_cal ON reading_text_source(calibrations);
CREATE INDEX IF NOT EXISTS reading_text_source_bundle ON reading_text_source(bundle_id);
CREATE INDEX IF NOT EXISTS reading_text_source_kind
  ON reading_text_source(transcribed, terminal_step);
-- REC-91 / CONTENT-SEARCH-DESIGN.md section 4.1 -- THE TEXT INDEX, one row per
-- INDEXED UNIT of one capture's text under its CURRENT chain. This is the
-- content level of the four-level search (Part II section 14.3): bundles_fts
-- indexes the GROUP'S OWN NOTES about a document, and until this table existed
-- nothing indexed what the document SAYS, so a group that captured five hundred
-- agenda packets could search its notes about them and not the packets.
--
-- ONE UNIT PER ELEMENT REFERENCE, which is section 3's option (iii) and the
-- reason this is a table rather than one more column feed into bundles_fts.
-- Pouring document text into bundles_fts.body would truncate a 400-page packet
-- at page ~40 against TEXT_CAP and would land a reader on a DOCUMENT -- the
-- anchor found and then thrown away, which is D-161's failure one axis over.
-- Here the unit's address IS a content extent, so a hit is a mintable row's
-- identity without minting it (section 4.5, IC-83's lazy mint).
--
-- THE EXTENT IS THE SAME CANONICAL FORM THE content TABLE HASHES OVER, produced
-- by canonicalExtent in bio-checks.mjs and never re-spelled here. That is what
-- makes contentIdFor(capture_sha, extent, chain) computable AT HIT TIME, which
-- is the whole of section 4.5: a search returns an ADDRESS a member may cite,
-- and searching mints nothing.
--
-- chain_kind IS A COLUMN AND NOT A PARSE, so "every OCR'd unit" is a predicate.
-- It holds the LAST step kind of the chain that produced this unit (layer, ocr,
-- member). Section 4.2 asks the identical question of the content table, whose
-- chain column holds the WHOLE chain as JSON, and that filter measured as the
-- slowest on the table at M-23 -- so the column here is the same question
-- answered the cheap way, and the difference is stated in SEARCH's own
-- Incomplete list rather than left for a reader to notice.
--
-- truncated IS PER UNIT AND NEVER A SILENT PREFIX (M5's rule, section 2): a
-- unit stored to the bound says so, and rows=passage carries the flag. The
-- per-capture bound is a different metric and is NOT a column here at all -- it
-- is the indexed observation, written per capture into observation_log, so that
-- not extracted, extracted but over the bound, and extracted and indexed are one
-- vocabulary in one place (section 4.3).
--
-- A WORKBOOK'S UNIT IS ITS SHEET (N108, D-672): one sheet-range unit per sheet at
-- the whole used range its reader names (a cell is not a passage; M-20's census
-- held 288 workbooks, 72,651,441 bytes of text over 1,056 sheets, and until N108
-- not one indexable unit). A sheet whose range the reader could not name is no
-- unit. WHAT HAS NO UNIT ARM AND IS THEREFORE ABSENT RATHER THAN EMPTY: HTML (no
-- dom producer, Part II section 15). It is not scored zero: the capture's index
-- state says none.
--
-- DERIVED, AND PURGED ON BOTH ARMS. It carries bundle_id -- the document this
-- text is of -- so it rides purge's TABLES list. Text is a PROJECTION and is
-- re-derived rather than versioned (section 4.1): when the chain moves, the
-- capture's previous rows are DELETED and rewritten, so a revised chain never
-- leaves a unit claiming an engine that did not produce it. A content row is
-- the opposite and is never rewritten -- an authored edge holds it, and a
-- re-extraction marks it stale (REC-82).
CREATE TABLE IF NOT EXISTS capture_text (
  capture_sha  TEXT    NOT NULL,   -- the document. The register's trust root
  bundle_id    TEXT    NOT NULL,   -- the join every query arm makes (section 2)
  extent_kind  TEXT    NOT NULL,   -- pdf-page | doc-para | slide-shape | sheet-range (N108)
  extent       TEXT    NOT NULL,   -- canonicalExtent's output. The SAME bytes the content address is taken over
  ref          TEXT    NOT NULL,   -- IC-1's required human form, from describeExtent
  seq          INTEGER NOT NULL,   -- reading order within the capture, so a partial index is a PREFIX and says so
  text         TEXT    NOT NULL,   -- the unit's text, capped per unit at TEXT_CAP (section 4.3)
  truncated    INTEGER NOT NULL DEFAULT 0,
  chain_kind   TEXT    NOT NULL,   -- the chain's LAST step kind, so an engine is a predicate
  PRIMARY KEY (capture_sha, extent_kind, extent)
);
-- By BUNDLE: the join every arm makes, and purge's per-bundle arm.
CREATE INDEX IF NOT EXISTS capture_text_bundle ON capture_text(bundle_id);
-- AND NOT BY CHAIN KIND, WHICH THIS ITEM DECLARED AND THEN WITHDREW ON THE
-- REPOSITORY'S OWN RULE. "Every OCR'd unit below cap C" is one of the three
-- questions Part II section 17 names as unanswerable, and it is a predicate only
-- if such an index exists -- so one was written here. The airuns suite sweep
-- then named it on the roster of ACCESS PATHS NO OP ASKS FOR, correctly: the op
-- that would read it is REC-92's passage: arm and it does not exist. REC-12's
-- rule is already recorded a few hundred lines up in store.mjs for three
-- other columns -- *an index nobody seeks on is cost with no reader* -- and the
-- index's cost here is per UNIT rather than per bundle, which is the grain that
-- made this whole table worth measuring.
-- THE HONEST MOVE IS TO LET THE READER BRING IT. The alternative was to raise
-- that sweep's CEILING by one on a promise, and a ceiling raised for a reader
-- that might arrive is a ceiling that stops meaning anything. M-23's 31.6
-- SECONDS against 9 ms is a real measurement of a DIFFERENT table's column under
-- a query that exists; quoting it for a query nobody has written would be
-- borrowing evidence rather than having it. REC-92 adds the index with its own
-- measurement, the way REC-90 did for the content table.
-- =========================================================================
-- D-536 (BIO_Content_Framework_v0_10.md Part II section 16, Reading provenance -- BOB #33's
-- ruling of 2026-09-24): EVERY READING OF A CAPTURE IS KEPT. The readings table holds ONE row per
-- capture and a re-promotion or a re-extraction replaces it, so a re-read that returned different text
-- used to leave no trace of the text it replaced. This table is the history: one row per DISTINCT
-- reading the record has held for a capture, in the order it arrived, never updated and never
-- deleted but by a purge. A reading equal byte for byte to the latest kept one is not kept twice --
-- an ordinary revision of a bundle re-submits the same provenance document and that is not a re-read.
-- reading is the whole reading as JSON, as the readings row held it. provenance is its
-- reading-provenance object (readingprov.mjs) or NULL, and NULL is UNDETERMINED -- a reading written
-- before D-536, or by a caller that carried none -- never inferred from text_tier or from the chain.
-- compared is the attribution against the row before it (compareProvenance), NULL for the first row
-- of a capture. text_sha256 is projected out of provenance so the comparison is a column, NULL when
-- undetermined or when no text was classified. DERIVED from the readings the corpus carried, and it
-- carries bundle_id, so a purge clears it in both arms (D-113).
CREATE TABLE IF NOT EXISTS reading_history (
  capture_sha    TEXT NOT NULL,
  seq            INTEGER NOT NULL,
  bundle_id      TEXT NOT NULL,
  reading_sha256 TEXT NOT NULL,
  reading        TEXT NOT NULL,
  provenance     TEXT,
  text_sha256    TEXT,
  compared       TEXT,
  kept_at        TEXT NOT NULL,
  PRIMARY KEY (capture_sha, seq)
);


-- =========================================================================
-- D-724 / BOB #36 2026-09-25 11:20Z, option (b) (extraction R16, R22) -- THE UNITS
-- A PARTIAL CAPTURE DID NOT INDEX, NAMED. Both budget loops (the reading's wire
-- budget and the index writer) go ON past a unit over the bound and keep a later
-- unit that fits, so a partial capture holds every unit that fit, in reading
-- order, WITH GAPS; until this table only the NUMBER of gaps was kept. ONE ROW
-- PER RUN of consecutive skipped units, named by its first and last unit and
-- counted, because the wire's runs ride in data/provenance.json under INLINE_MAX.
-- side is which loop skipped it (wire or store). DERIVED beside capture_text,
-- deleted and rewritten with the capture's units, purged on both arms.
CREATE TABLE IF NOT EXISTS capture_text_skipped (
  capture_sha   TEXT    NOT NULL,
  bundle_id     TEXT    NOT NULL,
  first_seq     INTEGER NOT NULL,
  last_seq      INTEGER NOT NULL,
  units         INTEGER NOT NULL,
  first_extent  TEXT    NOT NULL,
  first_ref     TEXT    NOT NULL,
  last_extent   TEXT    NOT NULL,
  last_ref      TEXT    NOT NULL,
  side          TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS capture_text_skipped_capture ON capture_text_skipped(capture_sha, first_seq);
CREATE INDEX IF NOT EXISTS capture_text_skipped_bundle ON capture_text_skipped(bundle_id);

-- extraction R36: THE INDEX'S OWN STATE, from its last write, so unitsOf answers
-- whole / partial / none / never-indexed from this module's own row rather than
-- from the observation log (a later module). One row per capture, replaced with
-- the capture's units. state is 'whole' (every offered unit written), 'partial'
-- (some over the bound, skipped or unaddressable), or 'none' (nothing offered);
-- no row is NEVER INDEXED. The four are never read alike.
CREATE TABLE IF NOT EXISTS capture_text_state (
  capture_sha    TEXT    PRIMARY KEY,
  bundle_id      TEXT    NOT NULL,
  state          TEXT    NOT NULL CHECK (state IN ('whole','partial','none')),
  offered        INTEGER NOT NULL,
  written        INTEGER NOT NULL,
  over_bound     INTEGER NOT NULL,
  unaddressable  INTEGER NOT NULL,
  truncated      INTEGER NOT NULL,
  skipped_named  INTEGER NOT NULL,
  chain_kind     TEXT,
  at             TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS capture_text_state_bundle ON capture_text_state(bundle_id);

-- K104 (extraction R21): THE READINGS THIS INSTANCE COMPOSED, by the SHA-256 of
-- the reading's JSON as read answered it. A reading carried in by a caller whose
-- digest is not here was not composed by this instance, and is recorded as the
-- caller's assertion. Not bundle-keyed (a reading is composed before any bundle
-- carries it), so only the whole-store purge clears it.
CREATE TABLE IF NOT EXISTS composed_readings (
  reading_sha256 TEXT PRIMARY KEY,
  capture_sha    TEXT NOT NULL,
  at             TEXT NOT NULL
);
`;
