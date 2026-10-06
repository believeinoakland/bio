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
-- R22, R23: a law relation from one standard (or a portion of it) to another, recorded by a member's act. 'class' keeps
-- temporal and referential apart (D192); a temporal relation's effective date, or its enactment event and edge, bounds
-- the version it amends (R20). Withdrawn in law_withdrawals, never edited or deleted (R14).
CREATE TABLE IF NOT EXISTS law_relations (
  relation_id     TEXT PRIMARY KEY,
  type            TEXT NOT NULL,
  class           TEXT NOT NULL,
  from_standard   TEXT NOT NULL,
  from_portion    TEXT,
  to_standard     TEXT NOT NULL,
  to_portion      TEXT,
  citation        TEXT NOT NULL,
  effective_date  TEXT,
  effective_event TEXT,
  effective_edge  TEXT,
  proposal_id     TEXT,
  reason          TEXT NOT NULL,
  author          TEXT NOT NULL,
  at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS law_relations_from ON law_relations(from_standard, relation_id);
CREATE INDEX IF NOT EXISTS law_relations_to ON law_relations(to_standard, relation_id);
-- R26: a court link from an extent of a court standard's text to a portion of a held statute, regulation or ordinance.
CREATE TABLE IF NOT EXISTS court_links (
  link_id        TEXT PRIMARY KEY,
  type           TEXT NOT NULL,
  from_standard  TEXT NOT NULL,
  to_standard    TEXT NOT NULL,
  to_portion     TEXT,
  citation       TEXT NOT NULL,
  proposal_id    TEXT,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS court_links_from ON court_links(from_standard, link_id);
CREATE INDEX IF NOT EXISTS court_links_to ON court_links(to_standard, link_id);
-- R27: a treatment row: a later decision's treatment of a held decision, citing the later decision's extent.
CREATE TABLE IF NOT EXISTS court_treatments (
  treatment_id   TEXT PRIMARY KEY,
  decision       TEXT NOT NULL,
  treatment      TEXT NOT NULL,
  by_decision    TEXT NOT NULL,
  citation       TEXT NOT NULL,
  proposal_id    TEXT,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS court_treatments_decision ON court_treatments(decision, treatment_id);
-- R14, R23: a relation, link or treatment withdrawn, once, with who, when and why; the row it withdraws stays.
CREATE TABLE IF NOT EXISTS law_withdrawals (
  item_id        TEXT PRIMARY KEY,
  reason         TEXT NOT NULL,
  withdrawn_by   TEXT NOT NULL,
  withdrawn_at   TEXT NOT NULL
);
-- R23, R26, R27, R30: a machine's (or a member's) suggestion of a relation, link or treatment, stored apart and never
-- moving an answer; 'adopted_as' is set by nothing: the adoption is the recorded row naming it (proposal_id).
CREATE TABLE IF NOT EXISTS law_proposals (
  proposal_id    TEXT PRIMARY KEY,
  what           TEXT NOT NULL,
  fields_json    TEXT NOT NULL,
  why            TEXT NOT NULL,
  proposed_by    TEXT NOT NULL,
  proposed_at    TEXT NOT NULL
);
`;

/** R18, R19: the columns T33 adds to `standards`, each added to a table created before it and never filled: a standard
 *  recorded before them states none of them, read as not stated. */
const T33_COLUMNS = Object.freeze([
  ["instrument", "TEXT"], ["instrument_json", "TEXT"], ["portion_path", "TEXT"], ["portion_content", "TEXT"],
  ["requires_json", "TEXT"], ["copy", "TEXT"], ["copy_json", "TEXT"], ["current_through", "TEXT"],
  ["current_through_basis", "TEXT"], ["period_basis_json", "TEXT"],
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
  { name: "law_relations", keys: ["from_standard", "to_standard"] },
  { name: "court_links", keys: ["from_standard", "to_standard"] },
  { name: "court_treatments", keys: ["decision", "by_decision"] },
  { name: "law_withdrawals", keys: [] },
  { name: "law_proposals", keys: [] },
].map((t) => Object.freeze({ ...t, ...CLASSES })));

/** Creates the tables where absent, and adds R1's `reason` column (DEC-88) and R18–R19's columns to a `standards` table
 *  created before them, never filling them: a standard recorded before they were asked for carries none. Idempotent. */
export function migrateStandards(sql) {
  const bare = STANDARDS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const cols = [...sql.exec(`PRAGMA table_info(standards)`)].map((c) => c.name);
  if (!cols.includes("reason")) sql.exec(`ALTER TABLE standards ADD COLUMN reason TEXT`);
  for (const [c, type] of T33_COLUMNS) if (!cols.includes(c)) sql.exec(`ALTER TABLE standards ADD COLUMN ${c} ${type}`);
}
