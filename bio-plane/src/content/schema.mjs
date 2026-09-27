/* content's tables (requirements: `build/requirements/content.md`, R39). Moved out of the legacy `schema.mjs` at this
 * module's extraction (layers.md ruling 3, "each module owns its tables"): `content`, `transcriptions`,
 * `transcription_attestations`, and `text_attestations` (K73 (1)), with the comments that record why each is shaped as
 * it is. Every one carries `bundle_id` and is declared to record-core's purge (K23). `migrateContent` brings a store
 * created under an earlier shape to this one: `content.cited_as` (FW-19) and `content.chain_kind` (REC-104's
 * generated column, replaced by D-686's written one). */

import { unitChainKind, unitTargetOf } from "./extent.mjs";

export const CONTENT_SCHEMA = `
-- CPDF-10: TEXT ATTESTATIONS. A member says they compared a document's text
-- against the image of the page and it matches, OVER A STATED EXTENT.
--
-- FIRST-CLASS, MEMBER-DECLARED STATE, not a projection. Nothing derives this
-- and nothing can re-derive it: it is a person's testimony, so a re-promotion
-- must not rebuild it and a reader must not be able to mint it. That is the
-- resolutions precedent rather than the readings one, and it is why this table
-- is written by its own act and not by promote.
--
-- WHY THE EXTENT IS THREE COLUMNS AND NOT A BLOB. extent_kind / extent_page /
-- extent_rect are separate because COVERAGE IS A QUERY: "does any attestation
-- cover this leg's region" is asked per leg, and an extent locked inside JSON
-- would make that a scan the store cannot index. The rect is JSON because it is
-- four numbers read as a unit and never compared column-wise in SQL.
--
-- attestor is a MEMBER ID and never a machine stamp. The act refuses a machine
-- credential before it reaches here (C-35.10), and this column carrying a
-- token: prefix would mean that fence had been bypassed.
--
-- bundle_id rides so a purge takes it in BOTH arms (D-113). It is the bundle
-- the capture is filed in at the moment of attesting.
CREATE TABLE IF NOT EXISTS text_attestations (
  capture_sha  TEXT    NOT NULL,
  bundle_id    TEXT,
  attestor     TEXT    NOT NULL, -- a member id, never a machine stamp
  at           TEXT    NOT NULL,
  extent_kind  TEXT    NOT NULL, -- region, page or document
  extent_page  INTEGER,          -- NULL for a document extent
  extent_rect  TEXT,             -- JSON [x0,y0,x1,y1], NULL unless kind=region
  note         TEXT,
  chain        TEXT,             -- the chain AS IT STOOD when attested
  PRIMARY KEY (capture_sha, attestor, extent_kind, extent_page, extent_rect)
);
CREATE INDEX IF NOT EXISTS text_attestations_capture ON text_attestations(capture_sha);
CREATE INDEX IF NOT EXISTS text_attestations_bundle ON text_attestations(bundle_id);

-- =========================================================================
-- REC-82 / IC-83 / DEC-23 / D-164 -- CONTENT: A REFERENCE TO A PART OF A
-- DOCUMENT, UP TO AND INCLUDING THE WHOLE DOCUMENT.
--
-- Bob's definition, ruled as DEC-23: documents are what is HARVESTED, content
-- is what is EXTRACTED, and meaning derives from both. Until this table every
-- edge in the record addressed a BUNDLE -- so a leg citing one paragraph of a
-- 300-page budget book and a leg citing the whole book were the same row, and
-- the address IC-1 already emits was consumed by no edge at all (D-164).
--
-- CONTENT-ADDRESSED, AND THAT IS THE WHOLE MECHANISM (the design study's option
-- (c)). content_id = sha256(capture_sha, the CANONICAL extent, the chain as it
-- stood at mint), so two members who cite the same passage of the same bytes
-- under the same transcription get ONE row BY CONSTRUCTION. There is no
-- allocator, no dedup pass and nothing to reconcile -- and, the other half of
-- the same property, a leg can name a row before it exists, because the id is
-- derivable from the citation alone.
--
-- ROWS ARE FIRST-CLASS, NEVER DERIVED. An edge depends on one, so a row is NOT
-- rewritten by re-promotion and is NEVER DELETED when the capture is re-read:
-- a better engine moves the chain, which makes the row a reference to a
-- transcription that no longer stands, and the honest record of that is
-- stale=1 with the row and its edges still resolving and SAYING SO. Deleting it
-- would break an authored citation to make a projection tidy. This is
-- text_attestations' own stale rule (CPDF-10) applied one construct along, and
-- it is D-183's asymmetric rule: nothing re-grades on its own.
--
-- WHY A DERIVED TABLE IS STILL PURGED. It is not derived -- but it carries
-- bundle_id, so it rides op=purge's TABLES list and clears in BOTH arms
-- (D-113). A whole-store purge reporting scope ALL while content rows stood
-- would leave addresses into documents nobody holds, and a later bundle
-- allocated a colliding id would inherit somebody else's citations.
--
-- THE EXTENT GRAMMAR IS IC-1'S, UNIFIED WITH ATTESTATION'S, AND NOT A THIRD
-- ONE. extent_kind is IC-1's five arms (document | pdf-page | sheet-cell |
-- slide-shape | doc-para) read together with textchain.mjs's EXTENT_KINDS
-- (document | page | region) -- one vocabulary, one checker, one covers() per
-- arm, because D-164's lesson is that solving one problem twice produces two
-- answers that disagree. dom is REFUSED BY NAME (C-45.4) until CONTENT-HTML
-- produces one: a kind nothing can evaluate must not quietly read as covering
-- anything. REC-82 lands the WRITER on the pdf-page and document arms only --
-- the other three arms' covers is REC-85 -- and the column admits them now so
-- that landing is a writer and not a migration.
--
-- page_count IS THE STORED PAGE SET, AND IT IS WHY THE OUT-OF-RANGE REFUSAL CAN
-- FIRE AT ALL. IC-83 requires the page count be stored on mint. Nothing in this
-- plane persists a capture page count today (the design study says so in its
-- own words: "needs a stored page count -- absent today"), so this column holds
-- what the record COULD see when the row was minted: the page set D-252's
-- scoped derivation steps name, unioned with the pages any attestation covers.
-- NULL means the record held no page set for that capture at mint -- which is
-- UNDETERMINED and STATED, never a permission and never a refusal: refusing
-- every page citation on a document whose page set the record does not know
-- would be a fence tighter than its rule. D-345 is the row that closes the gap
-- by persisting I2's page count at acquire, which is CAPTURE's path.
CREATE TABLE IF NOT EXISTS content (
  content_id     TEXT PRIMARY KEY,  -- sha256 over capture_sha + canonical extent + chain
  capture_sha    TEXT NOT NULL,     -- the document. The register's trust root
  bundle_id      TEXT NOT NULL,     -- purge, and the compiler's join (D-222)
  extent_kind    TEXT NOT NULL,     -- document | pdf-page | sheet-cell | slide-shape | doc-para | sheet-range | doc-table | image (the last three FW-19)
  extent         TEXT NOT NULL,     -- the per-arm fields as canonical JSON
  ref            TEXT NOT NULL,     -- IC-1's REQUIRED human form, e.g. page 14, top half
  chain          TEXT,              -- the transcription chain over the extent, as it stood at mint
  derivation_cap TEXT,              -- min over the chain's derivation steps over THIS extent. NULL = undetermined, STATED
  page_count     INTEGER,           -- the page set the record held at mint. NULL = undetermined, STATED
  minted_by      TEXT NOT NULL,     -- a member id, 'plane', or a machine credential (5.7, DEC-24 rule 3)
  at             TEXT NOT NULL,
  stale          INTEGER NOT NULL DEFAULT 0, -- the capture's chain moved since mint. The row and its edges still resolve
  cited_as       TEXT    NOT NULL DEFAULT 'text', -- FW-19 / IC-125: text | bytes. bytes = an image cited as itself, so chain and cap are NULL by meaning and never undetermined
  chain_kind     TEXT               -- D-686. how THIS unit was read: the last derivation step covering its page, or for a unit with no page its pages' one kind or mixed. Written at mint (content R14). NULL = undetermined. See the index block below
);
-- The two reads this table exists to answer, and neither may be a scan. By
-- CAPTURE: which passages of this document has anybody cited (the content axis
-- of the four-level search), and the read that marks rows stale when a capture
-- is re-read. By BUNDLE: purge's per-bundle arm, and the compiler's join.
CREATE INDEX IF NOT EXISTS content_capture ON content(capture_sha);
CREATE INDEX IF NOT EXISTS content_bundle ON content(bundle_id);
-- REC-90 / CONTENT-SEARCH-DESIGN.md section 4.2 -- THE FILTERED COLUMNS OF THE
-- content: ARM. Each compiles to SELECT bundle_id FROM content WHERE <col> = ?,
-- and bundle_id is the second key column so every seek is COVERING: it never
-- touches the table. inquiry_basis_grade_source above is the precedent and this
-- is the same decision taken the same way -- MEASURED, and the measurement is
-- what chose which columns appear here.
--
-- MEASURED 2026-09-15 (test/content-index-probe.mjs, node:sqlite, the statements
-- DRIVEN out of compile() and every OTHER index DRIVEN out of schema.mjs AND
-- store.mjs rather than typed). The MEASUREMENTS ledger's M-23 (filed as M-21, renumbered
-- at integration -- corrected here by REC-104) carries both corpus sizes,
-- the instrument, the synthetic proportions and what the instrument cannot see.
-- At 20,000 bundles / 40,002 content rows, 9 reps:
--   content:pdf-page          4.007 ms -> 2.062 ms  (-48.5%)
--   content:document          5.391 ms -> 3.276 ms  (-39.2%)   the COMMON value
--   content:stale             2.335 ms -> 0.924 ms  (-60.4%)
--   content:machine           3.625 ms -> 2.291 ms  (-36.8%)
--   content:plane             4.369 ms -> 2.726 ms  (-37.6%)
--   content:cap=undetermined  3.284 ms -> 2.194 ms  (-33.2%)
--   content:cap<C             4.907 ms -> 3.742 ms  (-23.8%)
-- AGAINST A MEASURED NOISE FLOOR OF 20.5%, which is the swing on content:ocr --
-- a query NO index in the candidate set can touch, because it filters on a JSON
-- parse of the chain column. Every figure above clears it. THE SMALLER CORPUS
-- SAID OTHERWISE FOR extent_kind (+1.6% at 5,000 bundles) and the larger one
-- overturned it, which is exactly why two sizes were measured: the quantity being
-- bought is the PROPORTION, and it grows with the corpus.
--
-- THE WRITE COST IS NOT inquiry_basis's, AND THAT ASYMMETRY IS THE REST OF THE
-- DECISION. Every op=promote of an inquiry delete-then-inserts its basis rows, so
-- an index there is re-written on every promotion. A content row is INSERT OR
-- IGNORE'd ONCE and is never rewritten and never deleted (the rule at the head of
-- this block), so each index here is one B-tree insert per mint and nothing on
-- re-promotion. An index is cheaper on this table than on any other in the store.
CREATE INDEX IF NOT EXISTS content_extent_kind ON content(extent_kind, bundle_id);
CREATE INDEX IF NOT EXISTS content_stale ON content(stale, bundle_id);
CREATE INDEX IF NOT EXISTS content_minted_by ON content(minted_by, bundle_id);
CREATE INDEX IF NOT EXISTS content_derivation_cap ON content(derivation_cap, bundle_id);
-- REC-104 -- content:chain ANSWERS OFF A COLUMN, AND THE READ-TIME PARSE IS RETIRED.
-- Until REC-104 the chain filter compiled to a JSON parse of the whole chain on
-- every row it looked at -- an expression no ordinary index can serve, and the
-- SLOWEST single-column filter on this table (M-23). REC-90 reported it as a
-- DESIGN GAP against section 4.2, because section 4.1 gives capture_text a
-- chain_kind COLUMN for the identical question. REC-104 gives content the same.
--
-- D-686 (BOB #35, 2026-09-25 09:05Z) -- IT IS THE UNIT'S KIND, NOT THE DOCUMENT'S,
-- AND SO IT IS NO LONGER A GENERATED COLUMN. REC-104 made it one over the whole
-- chain's last step, and on a MIXED document that labelled every unit -- a
-- text-layer page of a document OCR also touched -- as OCR'd. The extraction
-- method is one of a content unit's two intrinsic facts (Content Framework Part
-- II section 14.2), so the column holds the kind of the last DERIVATION step
-- covering the unit's page (D-710: for a unit with no page, its pages' one kind,
-- or mixed), which needs the step extents and the unit's page, which no SQL
-- expression over this row can ask without becoming a second definition of
-- textchain.mjs's. It is therefore a PLAIN column written at mint by
-- ./extent.mjs unitChainKind over text-chain's chainKindFor, and there is still
-- ONE definition, which the mint and migrateContent's one-time recompute both
-- call. A row is never rewritten, so a value written at mint cannot go stale
-- against its own chain. A store created before D-686 holds the generated
-- column; migrateContent rebuilds the table and recomputes every row -- the
-- values are DERIVED from each row's own chain, so recomputing them is not a
-- rewrite of history.
--
-- undetermined STAYS ON chain (chain IS NULL): it asks whether the record holds
-- a chain AT ALL, which is not the same question as a chain with no last step.
CREATE INDEX IF NOT EXISTS content_chain_kind ON content(chain_kind, bundle_id);
-- =========================================================================

-- =========================================================================
-- REC-87 / IC-128 -- TRANSCRIBE (Bob's 5.2). A member selects a portion of a
-- document and types what it says. The PORTION is a content row (content_id
-- is the hash of the capture, the canonical extent and a chain whose one step
-- is typed(member) carrying the digest of the text), so the row says WHERE and
-- WHO. This table holds the one thing a content row has no column for -- the
-- TEXT the member typed -- keyed by that row.
--
-- ONE ROW PER CONTENT ROW, AND NEVER REWRITTEN. The digest is in the chain and
-- the chain is in the id, so different text is a different row by construction
-- and a re-typing of the same text by the same member finds the same row. The
-- write is INSERT OR IGNORE, on the content table's own rule.
--
-- NOT DERIVED, AND PURGED. A member's typing is authored and nothing re-derives
-- it, but it carries bundle_id, so it rides op=purge's TABLES list and clears
-- in both arms (D-113) with the content rows it describes.
CREATE TABLE IF NOT EXISTS transcriptions (
  content_id   TEXT PRIMARY KEY,  -- the content row the member minted by typing
  capture_sha  TEXT NOT NULL,     -- the exact copy the text was typed from
  bundle_id    TEXT NOT NULL,     -- purge, and the viewer gate
  transcriber  TEXT NOT NULL,     -- a member id, never a machine stamp (C-52.1)
  text         TEXT NOT NULL,     -- what the member typed, byte for byte
  text_sha256  TEXT NOT NULL,     -- the digest the chain step carries
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS transcriptions_bundle ON transcriptions(bundle_id);
-- By CAPTURE: the stale pass excludes a capture's transcriptions on every
-- re-read, and that exclusion must be a seek rather than a scan.
CREATE INDEX IF NOT EXISTS transcriptions_capture ON transcriptions(capture_sha, content_id);
-- A SECOND MEMBER'S ATTESTATION OF ONE TRANSCRIPTION. Separate from
-- text_attestations and on purpose: those attest the CAPTURE's machine text
-- over an extent, and an attestation of a member's typing is testimony about
-- DIFFERENT text. Folding them together would let a check of the OCR raise a
-- member's typing, or the reverse. The transcriber is never an attestor here
-- (C-52.9, refused at the act and excluded again at every read).
CREATE TABLE IF NOT EXISTS transcription_attestations (
  content_id   TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,     -- purge
  attestor     TEXT NOT NULL,     -- a member id, never a machine stamp (C-35.10)
  at           TEXT NOT NULL,
  note         TEXT,
  PRIMARY KEY (content_id, attestor)
);
CREATE INDEX IF NOT EXISTS transcription_attestations_bundle ON transcription_attestations(bundle_id);
`;

/** The tables this module owns (R39), each keyed to a bundle by its `bundle_id`. */
export const CONTENT_TABLES = ["content", "transcriptions", "transcription_attestations", "text_attestations"];

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };

/** Brings a store created under an earlier shape to this one, then runs the schema. THREE THINGS ARE LOAD-BEARING.
 *  (1) The conversions run BEFORE the schema's statements, because `CREATE INDEX content_chain_kind` would otherwise
 *      meet the old table and throw inside the Durable Object's boot.
 *  (2) `table_xinfo`, not `table_info`: a generated column is hidden from `table_info`, and `hidden` (2 or 3) is what
 *      tells REC-104's generated column from D-686's plain one (0).
 *  (3) REC-104's generated column is REPLACED BY A REBUILD, NOT `DROP COLUMN`. MEASURED inside workerd (D-686): its
 *      SQLite rewrites the stored CREATE TABLE text to drop the table's LAST column through the closing paren, which
 *      then sits inside that line's trailing `--` comment, and the schema no longer parses. So the table as declared
 *      here, every row copied by the columns both shapes hold, the old one dropped and the new one renamed into place;
 *      then every row's kind is recomputed ONCE by the mint's own function. */
export function migrateContent(sql) {
  const bare = CONTENT_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  const stmts = bare.split(";").map((x) => x.trim()).filter(Boolean);
  const info = [...sql.exec(`PRAGMA table_xinfo(content)`)];
  if (info.length) {
    if (!info.some((r) => r.name === "cited_as"))
      sql.exec(`ALTER TABLE content ADD COLUMN cited_as TEXT NOT NULL DEFAULT 'text'`);
    const had = info.find((r) => r.name === "chain_kind");
    if (!had || had.hidden) {
      if (had) {
        const now = [...sql.exec(`PRAGMA table_xinfo(content)`)];
        const cols = now.filter((r) => !r.hidden && r.name !== "chain_kind").map((r) => r.name).join(",");
        const stmt = stmts.find((x) => x.startsWith("CREATE TABLE IF NOT EXISTS content ("));
        sql.exec(stmt.replace("CREATE TABLE IF NOT EXISTS content (", "CREATE TABLE content__d686 ("));
        sql.exec(`INSERT INTO content__d686 (${cols}) SELECT ${cols} FROM content`);
        sql.exec(`DROP TABLE content`);
        sql.exec(`ALTER TABLE content__d686 RENAME TO content`);
      } else {
        sql.exec(`ALTER TABLE content ADD COLUMN chain_kind TEXT`);
      }
      for (const r of [...sql.exec(`SELECT content_id, chain, extent FROM content`)])
        sql.exec(`UPDATE content SET chain_kind=? WHERE content_id=?`,
          unitChainKind(safeJson(r.chain), unitTargetOf(safeJson(r.extent))), r.content_id);
    }
  }
  for (const s of stmts) sql.exec(s);
}
