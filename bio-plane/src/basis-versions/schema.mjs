/* basis-versions — its two tables (K4: each module owns its tables), moved from `schema.mjs` with the additive columns
 * `store.mjs`'s migrate added to them. Both are PROJECTIONS of the inquiry's own `basis_versions[]`,
 * `basis_version_grounds[]` and `basis_version_legs[]` (D-21): written delete-then-insert inside the promotion's one
 * transaction by this module's projection (R7) and by nothing else. Both carry `bundle_id` and are declared to
 * record-core's purge (R34, K23). NO SEMICOLON MAY APPEAR IN A COMMENT OF THE SCHEMA TEXT: migrate splits on it. */

export const BASIS_VERSIONS_SCHEMA = `
-- PL-1 / IS-1 (INVESTIGATIVE-SESSION section 6). A version is a complete alternative account of the support for the
-- inquiry's claim. composition is the version's frozen composition CANONICALISED by the module (never the caller's),
-- and section 6 rule 3's freeze compares it byte for byte. What happened TO a version (state, hidden, the attribution
-- of a move, the affirmation, run, author, at) sits outside it. run has no foreign key (section 14b.7: a version
-- survives the run that proposed it).
CREATE TABLE IF NOT EXISTS inquiry_basis_versions (
  bundle_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  ord           INTEGER NOT NULL,
  description   TEXT NOT NULL,
  relationship  TEXT NOT NULL,
  state         TEXT NOT NULL,
  state_by      TEXT,
  state_at      TEXT,
  state_reason  TEXT,
  affirmed_parts TEXT,
  derived_from  TEXT,
  hidden        INTEGER NOT NULL DEFAULT 0,
  kind          TEXT,
  claim         TEXT,
  run           TEXT,
  author        TEXT,
  at            TEXT,
  regroup_by    TEXT,
  regroup_at    TEXT,
  regroup_note  TEXT,
  composition   TEXT NOT NULL,
  leg_count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, name)
);
CREATE INDEX IF NOT EXISTS inquiry_basis_versions_run ON inquiry_basis_versions(run);
CREATE INDEX IF NOT EXISTS inquiry_basis_versions_derived ON inquiry_basis_versions(bundle_id, derived_from);

-- One row per leg of a version. ground is NOT NULL: a version carries its partition, so the partition is total.
-- content_id is the leg's referent, minted or found through content's plan (NULL: an inquiry target, no bytes held,
-- or a replayed leg the module would now refuse).
CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (
  bundle_id    TEXT NOT NULL,
  name         TEXT NOT NULL,
  ord          INTEGER NOT NULL,
  target_id    TEXT NOT NULL,
  target_type  TEXT NOT NULL,
  role         TEXT NOT NULL,
  grade        TEXT,
  grade_axis   TEXT,
  grade_source TEXT,
  note         TEXT,
  at           TEXT,
  ground       TEXT NOT NULL,
  content_id   TEXT,
  PRIMARY KEY (bundle_id, name, ord)
);
CREATE INDEX IF NOT EXISTS inquiry_basis_version_legs_target ON inquiry_basis_version_legs(target_id);
CREATE INDEX IF NOT EXISTS inquiry_basis_version_legs_content ON inquiry_basis_version_legs(content_id);
`;

export const BASIS_VERSIONS_TABLES = Object.freeze(["inquiry_basis_versions", "inquiry_basis_version_legs"]);

/* Columns a store written before they existed lacks, added before the CREATEs run (an index on a column only this
   list adds would otherwise throw on an old table, REC-143). Nullable: NULL is the true answer for a row projected
   before each existed. */
const ADDED_COLUMNS = [
  ["inquiry_basis_versions", "state_by", "TEXT"],
  ["inquiry_basis_versions", "state_at", "TEXT"],
  ["inquiry_basis_versions", "state_reason", "TEXT"],
  ["inquiry_basis_versions", "kind", "TEXT"],
  ["inquiry_basis_versions", "affirmed_parts", "TEXT"],
  ["inquiry_basis_version_legs", "content_id", "TEXT"],
];

export function migrateBasisVersions(sql) {
  for (const [table, col, type] of ADDED_COLUMNS) {
    const info = [...sql.exec(`PRAGMA table_info(${table})`)];
    if (info.length && !info.some((r) => r.name === col)) sql.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  }
  const bare = BASIS_VERSIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
