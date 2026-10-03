/* case-carriage's tables (requirements: `build/requirements/case-carriage.md`; R1, R2, R3, R6). Copied from
 * `publication`'s schema with their comments (K624 (1), seam map `build/extraction/publication-split-2.md` §2). The names
 * and columns are unchanged, so a store's existing rows stay: `CREATE TABLE IF NOT EXISTS`. Both are content-addressed,
 * append-only and exempt from purge (R6): a held text or list is never rewritten or removed. */

export const CASE_CARRIAGE_SCHEMA = `
-- R1, R3 (DEC-112 (3)(4); K1316): THE TEXTS A PUBLISHED CASE CARRIES WHOLE, BY SHA-256. Written by holdMaterials, inside
-- the caller's commit transaction, for each material the signed document's materials: block lists included: true: a
-- document's extracted text (case-grammar extractedTextOf), an observation's whole text, a document's captured bytes
-- where the register holds them inline as text, and a timestamp token held inline. The caller registers each by hash
-- (materials/<sha>) so it is served; public-read reads the text through publishedMaterialText. Content-addressed and
-- append-only: a text once held is never rewritten or removed, and the table is exempt from purge as published bytes
-- are (R6).
CREATE TABLE IF NOT EXISTS published_material_texts (
  sha256    TEXT PRIMARY KEY,
  kind      TEXT NOT NULL,      -- document | extracted_text | observation | attestation
  text      TEXT NOT NULL,
  bytes     INTEGER NOT NULL,   -- the UTF-8 length of text
  published TEXT NOT NULL
);

-- R1, R2 (K1317): WHAT ONE COMMITTED CASE EDITION HELD, in the order held: each SHA-256 and whether its text is held
-- here (inline) or its bytes are in the evidence store for ratification R39 to copy (evidence). Written once per case
-- edition by holdMaterials, read by heldMaterialsOf for a retried ratification. Published, so exempt (R6).
CREATE TABLE IF NOT EXISTS published_case_materials (
  case_id  TEXT NOT NULL,
  edition  INTEGER NOT NULL,
  ord      INTEGER NOT NULL,
  sha256   TEXT NOT NULL,
  held     TEXT NOT NULL CHECK (held IN ('inline','evidence')),
  PRIMARY KEY (case_id, edition, ord)
);
`;

/** R6: the tables purge never clears. This module declares no other table. */
export const CASE_CARRIAGE_EXEMPT = Object.freeze(["published_material_texts", "published_case_materials"]);

/** Creates the tables; idempotent, every boot. */
export function migrateCaseCarriage(sql) {
  const bare = CASE_CARRIAGE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
