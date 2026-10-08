/* standards' tables (requirements: `build/requirements/standards.md`, R14; K4: new, nothing moved). A standard is a
 * record document of its own type (R15): its bundle, history and manifest are record-core's. What is stored here is
 * what the reads answer from without parsing documents: each declaration as it was made, its text's content ids, each
 * proposal and each adoption; since T35, each force, override, release, body's adoption, imposition and benchmark;
 * since T36, each record of a version known in force through a date and its withdrawal (R50). The
 * law relations' five tables are `law-relations`' (K1961). Every row is written once and never updated or removed (R14): a correction is a new
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
-- T35 (R35): a provision's force, confirmed by a member's act with the citation of its own words; withdrawn in
-- standard_force_withdrawals, never edited (R14). A proposed force is stored apart in standard_force_proposals (R9's way).
CREATE TABLE IF NOT EXISTS standard_forces (
  force_id       TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  portion        TEXT NOT NULL,
  force          TEXT NOT NULL,
  holder         TEXT,
  criteria       TEXT,
  citation       TEXT NOT NULL,
  proposal_id    TEXT,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS standard_forces_standard ON standard_forces(standard_id, portion, force_id);
CREATE TABLE IF NOT EXISTS standard_force_withdrawals (
  force_id       TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  reason         TEXT NOT NULL,
  withdrawn_by   TEXT NOT NULL,
  withdrawn_at   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS standard_force_proposals (
  proposal_id    TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  fields_json    TEXT NOT NULL,
  why            TEXT NOT NULL,
  proposed_by    TEXT NOT NULL,
  proposed_at    TEXT NOT NULL
);
-- R38: a portion of one standard displacing a portion of another until an event or a later revision of its own key.
CREATE TABLE IF NOT EXISTS standard_overrides (
  standard_id    TEXT NOT NULL,
  ord            INTEGER NOT NULL,
  target         TEXT NOT NULL,
  portion        TEXT NOT NULL,
  until_json     TEXT NOT NULL,
  PRIMARY KEY (standard_id, ord)
);
CREATE INDEX IF NOT EXISTS standard_overrides_target ON standard_overrides(target, portion);
-- R37: a policy held at its source's sight, released to the group by an owner of that source's project, once.
CREATE TABLE IF NOT EXISTS standard_releases (
  standard_id    TEXT PRIMARY KEY,
  reason         TEXT NOT NULL,
  released_by    TEXT NOT NULL,
  released_at    TEXT NOT NULL
);
-- R40: a body's adoption of an edition, by a member's act naming the adopting act and its passage.
CREATE TABLE IF NOT EXISTS standard_body_adoptions (
  adoption_id    TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  act            TEXT NOT NULL,
  body           TEXT,
  edition        TEXT NOT NULL,
  from_json      TEXT NOT NULL,
  amendments_json TEXT NOT NULL,
  mode           TEXT NOT NULL,
  citation       TEXT NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS standard_body_adoptions_standard ON standard_body_adoptions(standard_id, adoption_id);
-- R43: a held law imposing a standard on a body, and a member's declaration that a comparison is a benchmark.
CREATE TABLE IF NOT EXISTS standard_impositions (
  imposition_id  TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  body           TEXT NOT NULL,
  law            TEXT NOT NULL,
  citation       TEXT NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS standard_impositions_standard ON standard_impositions(standard_id, body);
CREATE TABLE IF NOT EXISTS standard_benchmarks (
  benchmark_id   TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  body           TEXT NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
-- T36 (R50): a member's record that one version is known in force through a date, from a held capture extent of the
-- source checked that day; withdrawn in standard_in_force_through_withdrawals, never edited (R14).
CREATE TABLE IF NOT EXISTS standard_in_force_through (
  record_id      TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  through        TEXT NOT NULL,
  capture_sha    TEXT NOT NULL,
  extent_json    TEXT NOT NULL,
  content_id     TEXT NOT NULL,
  checked        TEXT NOT NULL,
  checked_day    TEXT,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS standard_in_force_through_standard ON standard_in_force_through(standard_id, record_id);
CREATE INDEX IF NOT EXISTS standard_in_force_through_capture ON standard_in_force_through(capture_sha);
CREATE TABLE IF NOT EXISTS standard_in_force_through_withdrawals (
  record_id      TEXT PRIMARY KEY,
  standard_id    TEXT NOT NULL,
  reason         TEXT NOT NULL,
  withdrawn_by   TEXT NOT NULL,
  withdrawn_at   TEXT NOT NULL
);
`;

/** R18, R19: the columns T33 adds to `standards`, each added to a table created before it and never filled: a standard
 *  recorded before them states none of them, read as not stated. */
const T33_COLUMNS = Object.freeze([
  ["instrument", "TEXT"], ["instrument_json", "TEXT"], ["portion_path", "TEXT"], ["portion_content", "TEXT"],
  ["requires_json", "TEXT"], ["copy", "TEXT"], ["copy_json", "TEXT"], ["current_through", "TEXT"],
  ["current_through_basis", "TEXT"], ["period_basis_json", "TEXT"],
]);
/** R33–R42, R47: the columns T35 adds to `standards`, added the same way: a standard recorded before them states none,
 *  read as not stated (`held` text, sight group, no family, access undetermined for a `standard`, no question). */
const T35_COLUMNS = Object.freeze([
  ["family_json", "TEXT"], ["family_key", "TEXT"], ["held", "TEXT"], ["held_json", "TEXT"], ["copy_claimed_json", "TEXT"],
  ["sight_json", "TEXT"], ["version_basis_json", "TEXT"], ["force_source_json", "TEXT"], ["designation", "TEXT"],
  ["designation_json", "TEXT"], ["edition", "TEXT"], ["issuer_entity", "TEXT"], ["access", "TEXT"], ["target_json", "TEXT"],
  ["question", "TEXT"],
]);

/* R14 (plan T33, Rules (6)): every table declared explicitly through `record-core.declareTable`, append-only
   (`version_chain: true`), group-wide (`sight: "group"`: a standard is instance-wide, R5), the other classes as
   `declarePurge`'s default form gives them. A single-bundle purge clears the rows keyed to that standard's bundle, the
   whole-store form every row; a table keyed to no bundle is cleared only by the whole-store form. */
const CLASSES = Object.freeze({ purge: "clear", expunge: "none", export: "admin-only", sight: "group", derive: "stored",
                                version_chain: true });
export const STANDARDS_TABLES = Object.freeze([
  { name: "standards", keys: ["standard_id"] },
  { name: "standard_texts", keys: ["standard_id"] },
  { name: "standard_proposals", keys: [] },
  { name: "standard_adoptions", keys: ["standard_id"] },
  { name: "standard_forces", keys: ["standard_id"] },
  { name: "standard_force_withdrawals", keys: ["standard_id"] },
  { name: "standard_force_proposals", keys: ["standard_id"] },
  { name: "standard_overrides", keys: ["standard_id", "target"] },
  { name: "standard_releases", keys: ["standard_id"] },
  { name: "standard_body_adoptions", keys: ["standard_id"] },
  { name: "standard_impositions", keys: ["standard_id"] },
  { name: "standard_benchmarks", keys: ["standard_id"] },
  { name: "standard_in_force_through", keys: ["standard_id"] },
  { name: "standard_in_force_through_withdrawals", keys: ["standard_id"] },
].map((t) => Object.freeze({ ...t, ...CLASSES })));

/** Creates the tables where absent, and adds R1's `reason` column (DEC-88) and R18–R19's columns to a `standards` table
 *  created before them, never filling them: a standard recorded before they were asked for carries none. Idempotent. */
export function migrateStandards(sql) {
  const bare = STANDARDS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const cols = [...sql.exec(`PRAGMA table_info(standards)`)].map((c) => c.name);
  if (!cols.includes("reason")) sql.exec(`ALTER TABLE standards ADD COLUMN reason TEXT`);
  for (const [c, type] of [...T33_COLUMNS, ...T35_COLUMNS])
    if (!cols.includes(c)) sql.exec(`ALTER TABLE standards ADD COLUMN ${c} ${type}`);
  /* R33: the family filter */
  sql.exec(`CREATE INDEX IF NOT EXISTS standards_family ON standards(family_key, standard_id)`);
  /* R32: the reads by instrument key and portion, and by a portion's content id */
  sql.exec(`CREATE INDEX IF NOT EXISTS standards_instrument ON standards(instrument, portion_path, standard_id)`);
  sql.exec(`CREATE INDEX IF NOT EXISTS standards_portion_content ON standards(portion_content, standard_id)`);
}
