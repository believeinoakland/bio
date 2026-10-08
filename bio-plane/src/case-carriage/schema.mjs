/* case-carriage's tables (requirements: `build/requirements/case-carriage.md`; R1, R2, R3, R6; R9–R12). Copied from
 * `publication`'s schema with their comments (K624 (1), seam map `build/extraction/publication-split-2.md` §2). The names
 * and columns are unchanged, so a store's existing rows stay: `CREATE TABLE IF NOT EXISTS`. Both are content-addressed,
 * append-only and exempt from purge (R6): a held text or list is never rewritten or removed. */

export const CASE_CARRIAGE_SCHEMA = `
-- R1, R3 (DEC-112 (3)(4); K1316): THE TEXTS A PUBLISHED CASE CARRIES WHOLE, BY SHA-256. Written by holdMaterials, inside
-- the caller's commit transaction, for each material the signed document's materials: block lists included: true: a
-- document's extracted text (case-grammar extractedTextOf), an observation's whole text, a document's captured bytes
-- where the register holds them inline as text, and a timestamp token held inline; for a document cut out of a captured
-- archive, its container record (canonical JSON) and the archive's bytes where held inline (R8). The caller registers each by hash
-- (materials/<sha>) so it is served; public-read reads the text through publishedMaterialText. Content-addressed and
-- append-only: a text once held is never rewritten or removed, and the table is exempt from purge as published bytes
-- are (R6).
CREATE TABLE IF NOT EXISTS published_material_texts (
  sha256    TEXT PRIMARY KEY,
  kind      TEXT NOT NULL,      -- document | extracted_text | observation | attestation | archive | container (R8)
  text      TEXT NOT NULL,
  bytes     INTEGER NOT NULL,   -- the UTF-8 length of text
  published TEXT NOT NULL
);

-- R1, R2 (K1317): WHAT ONE COMMITTED CASE EDITION HELD, in the order held: each SHA-256 and whether its text is held
-- here (inline), its bytes are in the evidence store (evidence), or it is a photo's obscured copy held under
-- <store>/obscured/<sha> (derived, T37; R11), for ratification R39 to copy. Written once per case edition by
-- holdMaterials, read by heldMaterialsOf for a retried ratification. Published, so exempt (R6).
CREATE TABLE IF NOT EXISTS published_case_materials (
  case_id  TEXT NOT NULL,
  edition  INTEGER NOT NULL,
  ord      INTEGER NOT NULL,
  sha256   TEXT NOT NULL,
  held     TEXT NOT NULL CHECK (held IN ('inline','evidence','derived')),
  PRIMARY KEY (case_id, edition, ord)
);

-- R9, R12 (T37; DEC-180 (3), (5); K2206): THE MARKS MEMBERS MAKE ON A PHOTO, of who and what to obscure. One row per
-- obscureMark act, oldest first by mark: its areas as given ([{rect, kind, reason?}], [] for "nothing to obscure"),
-- its maker (the control plane's stamp) and record-core's instant. Append-only (version_chain): no act of this module
-- rewrites or removes a row. Inside the group only: nothing of a row reaches a case's bytes.
CREATE TABLE IF NOT EXISTS photo_marks (
  mark     INTEGER PRIMARY KEY AUTOINCREMENT,
  capture  TEXT NOT NULL,
  areas    TEXT NOT NULL,       -- JSON
  by       TEXT NOT NULL,
  at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS photo_marks_capture ON photo_marks (capture, mark);

-- R10, R11 (T37): EACH DERIVATION OF A PHOTO'S OBSCURED COPY, one row per mark that left the photo marked, covering
-- every area of every mark up to and including through. The copy itself is held under <store>/obscured/<sha256>
-- (R11); sha256 is null when no copy was made: refused_code names image-cover's refusal, or both are null when the
-- original's bytes could not be read or the copy could not be held. The latest row is the photo's current copy.
-- Append-only, as the marks are.
CREATE TABLE IF NOT EXISTS photo_copies (
  capture        TEXT NOT NULL,
  through        INTEGER NOT NULL,
  sha256         TEXT,
  bytes          INTEGER,
  covered        INTEGER,
  width          INTEGER,
  height         INTEGER,
  refused_code   TEXT,
  refused_detail TEXT,
  at             TEXT NOT NULL,
  PRIMARY KEY (capture, through)
);
CREATE INDEX IF NOT EXISTS photo_copies_sha ON photo_copies (sha256);
`;

/** R6: the tables purge never clears. */
export const CASE_CARRIAGE_EXEMPT = Object.freeze(["published_material_texts", "published_case_materials"]);

/** R12 (T37): the marks and the copies, declared with their classes (record-core R21): cleared by purge as the group's
 *  working record is, never exported but to an administrator, seen as the capture they cite is, stored, and append-only. */
const marksClasses = (name) => Object.freeze({ name, purge: "clear", expunge: "none", export: "admin-only", sight: "source",
                                               derive: "stored", version_chain: true });
export const CASE_CARRIAGE_MARK_TABLES = Object.freeze([marksClasses("photo_marks"), marksClasses("photo_copies")]);

/** Creates the tables; idempotent, every boot. A store whose `published_case_materials` predates `derived` (T37) is
 *  rebuilt once with every row kept, in one transaction where the storage offers one, since SQLite cannot widen a
 *  CHECK in place. */
export function migrateCaseCarriage(sql, storage = null) {
  const old = [...sql.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='published_case_materials'`)][0];
  if (old && typeof old.sql === "string" && !old.sql.includes("'derived'")) {
    const widen = () => {
      sql.exec(`ALTER TABLE published_case_materials RENAME TO published_case_materials_before_t37`);
      sql.exec(`CREATE TABLE published_case_materials (case_id TEXT NOT NULL, edition INTEGER NOT NULL, ord INTEGER NOT NULL,
                sha256 TEXT NOT NULL, held TEXT NOT NULL CHECK (held IN ('inline','evidence','derived')),
                PRIMARY KEY (case_id, edition, ord))`);
      sql.exec(`INSERT INTO published_case_materials SELECT case_id, edition, ord, sha256, held FROM published_case_materials_before_t37`);
      sql.exec(`DROP TABLE published_case_materials_before_t37`);
    };
    if (storage && typeof storage.transactionSync === "function") storage.transactionSync(widen); else widen();
  }
  const bare = CASE_CARRIAGE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
