/* standards' tables (requirements: `build/requirements/standards.md`, R14; K4: new, nothing moved). A standard is a
 * record document of its own type (R15): its bundle, history and manifest are record-core's. What is stored here is
 * what the reads answer from without parsing documents: each declaration as it was made, its text's content ids, each
 * proposal and each adoption. Every row is written once and never updated or removed (R14): a correction is a new
 * standard that supersedes the old one (R6), and "what supersedes it" is read from the successor's row. Each table is
 * declared to record-core's purge. */

export const STANDARDS_SCHEMA = `
-- R1, R3, R4, R6, R10: one row per standard, as declared. source_json is R3's answer at the declaration; supersedes is
-- unique, so a standard is superseded by at most one (R6); proposal_id names the proposal it was adopted from (R10);
-- reason is the declarer's words (R1, DEC-88), NULL on a standard recorded before they were asked for.
CREATE TABLE IF NOT EXISTS standards (
  standard_id   TEXT PRIMARY KEY,
  cite          TEXT NOT NULL,
  kind          TEXT NOT NULL,
  issuer        TEXT NOT NULL,
  period_from   TEXT,
  period_to     TEXT,
  supersedes    TEXT UNIQUE,
  source_json   TEXT NOT NULL,
  proposal_id   TEXT,
  declared_by   TEXT NOT NULL,
  declared_at   TEXT NOT NULL,
  reason        TEXT
);
CREATE INDEX IF NOT EXISTS standards_kind ON standards(kind, standard_id);
-- R2: the standard's own words, as one or more content ids, in the order declared.
CREATE TABLE IF NOT EXISTS standard_texts (
  standard_id   TEXT NOT NULL,
  ord           INTEGER NOT NULL,
  content_id    TEXT NOT NULL,
  PRIMARY KEY (standard_id, ord)
);
-- R9: a proposal, stored apart from standards: never a standard and never listed as one.
CREATE TABLE IF NOT EXISTS standard_proposals (
  proposal_id   TEXT PRIMARY KEY,
  cite          TEXT NOT NULL,
  kind          TEXT,
  issuer        TEXT,
  text_json     TEXT,
  why           TEXT NOT NULL,
  act           TEXT,
  proposed_by   TEXT NOT NULL,
  proposed_at   TEXT NOT NULL
);
-- R10: a proposal's adoption, once (the key), with the standard it became.
CREATE TABLE IF NOT EXISTS standard_adoptions (
  proposal_id   TEXT PRIMARY KEY,
  standard_id   TEXT NOT NULL,
  adopted_by    TEXT NOT NULL,
  adopted_at    TEXT NOT NULL
);
`;

/** R14: the tables, as record-core's `declarePurge` takes them: a single-bundle purge clears the rows keyed to that
 *  standard's bundle, the whole-store form every row. Proposals name no bundle, so only the whole-store form clears them. */
export const STANDARDS_TABLES = Object.freeze([
  { name: "standards", keys: ["standard_id"] },
  { name: "standard_texts", keys: ["standard_id"] },
  { name: "standard_proposals", keys: [] },
  { name: "standard_adoptions", keys: ["standard_id"] },
]);

/** Creates the tables where absent, and adds R1's `reason` column (DEC-88) to a `standards` table created before it,
 *  never filling it: a standard recorded before the declarer's words were asked for carries none. Idempotent. */
export function migrateStandards(sql) {
  const bare = STANDARDS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const cols = [...sql.exec(`PRAGMA table_info(standards)`)].map((c) => c.name);
  if (!cols.includes("reason")) sql.exec(`ALTER TABLE standards ADD COLUMN reason TEXT`);
}
