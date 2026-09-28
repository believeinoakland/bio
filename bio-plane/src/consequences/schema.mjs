/* consequences' tables (requirements: `build/requirements/consequences.md`, R2–R9, R13, R14). Every row is written once
 * and never updated or deleted (R13): a revision is a new part naming the one it supersedes (R6), and an addressed
 * record is a new row, the latest per part being its state (R9). Each table is keyed to the part's own bundle (a part
 * is a `CONS-` record object, R14) and declared to record-core's purge (K23), so a purge of that bundle clears them. */

export const CONSEQUENCES_SCHEMA = `
-- R1–R6, R14: ONE ROW PER PART, the part's bundle id its key. determination,
-- standard and project are the breach it is recorded against (the project is
-- the determination's, read when recorded, so every read gates on it, R13).
-- affected, measure and period are the canonical JSON of what was recorded;
-- state is computed, assessed or undetermined. value is the module's own
-- arithmetic for a computed part (JSON: {value} or {range}), grade its weakest
-- operand's capture letter (null when undetermined) and grade_why the named
-- weakest link; op the computation. rationale and rests_on are an assessment's;
-- undetermined_why an undetermined part's reason code and words. causation is
-- the inquiry named (or null) and causation_state what it was when recorded
-- (established or unproven), causation_why the words. machine is 1 for a
-- machine's computed part (R2). supersedes names the part this one revises
-- (R6), at most once (UNIQUE), with its reason.
CREATE TABLE IF NOT EXISTS consequence_parts (
  bundle_id         TEXT PRIMARY KEY,
  determination     TEXT NOT NULL,
  standard          TEXT NOT NULL,
  project           TEXT,
  affected          TEXT NOT NULL,
  measure           TEXT,
  period            TEXT NOT NULL,
  state             TEXT NOT NULL,
  op                TEXT,
  value             TEXT,
  grade             TEXT,
  grade_why         TEXT,
  rationale         TEXT,
  rests_on          TEXT,
  undetermined_code TEXT,
  undetermined_why  TEXT,
  causation         TEXT,
  causation_state   TEXT NOT NULL,
  causation_why     TEXT NOT NULL,
  machine           INTEGER NOT NULL DEFAULT 0,
  author            TEXT NOT NULL,
  at                TEXT NOT NULL,
  supersedes        TEXT UNIQUE,
  reason            TEXT
);
CREATE INDEX IF NOT EXISTS consequence_parts_determination ON consequence_parts (determination, standard);
-- R2: A COMPUTED PART'S OPERANDS, in order: the content id, the figure as the
-- author read it, the number this module parsed from it, the capture the
-- passage is of, and that capture's grade (provenance.captureGrade) as it read
-- when recorded: grade (null when undetermined), route, determined, basis.
CREATE TABLE IF NOT EXISTS consequence_operands (
  part_id      TEXT NOT NULL,
  ord          INTEGER NOT NULL,
  content_id   TEXT NOT NULL,
  figure       TEXT,
  number       REAL,
  capture_sha  TEXT,
  grade        TEXT,
  route        TEXT,
  determined   INTEGER NOT NULL DEFAULT 0,
  basis        TEXT,
  PRIMARY KEY (part_id, ord)
);
-- R9: A MEMBER'S ADDRESSED RECORD, one row per act, append-only; the latest by
-- seq is the part's state. evidence is the JSON list of content ids or
-- findings.
CREATE TABLE IF NOT EXISTS consequence_addressed (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  part_id    TEXT NOT NULL,
  state      TEXT NOT NULL,
  evidence   TEXT NOT NULL,
  reason     TEXT NOT NULL,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS consequence_addressed_part ON consequence_addressed (part_id, seq);
`;

/** R13: the tables, as record-core's purge takes them (its R21, R46): each keyed to the part's bundle. */
export const CONSEQUENCES_TABLES = Object.freeze([
  "consequence_parts",
  Object.freeze({ name: "consequence_operands", keys: Object.freeze(["part_id"]) }),
  Object.freeze({ name: "consequence_addressed", keys: Object.freeze(["part_id"]) }),
]);

export function migrateConsequences(sql) {
  const bare = CONSEQUENCES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const stmt of bare.split(";")) if (stmt.trim()) sql.exec(stmt.trim());
}
