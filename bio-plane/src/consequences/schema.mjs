/* consequences' tables (requirements: `build/requirements/consequences.md`, R2–R9, R13, R14). Every row is written once
 * and never updated or deleted (R13): a revision is a new part naming the one it supersedes (R6), and an addressed
 * record is a new row, the latest per part being its state (R9). Each table is keyed to the part's own bundle (a part
 * is a `CONS-` record object, R14) and declared to record-core's purge (K23), so a purge of that bundle clears them. */

export const CONSEQUENCES_SCHEMA = `
-- R1–R6, R14: ONE ROW PER PART, the part's bundle id its key. determination,
-- standard and project are the breach it is recorded against (the project is
-- the determination's, read when recorded, so every read gates on it, R13).
-- affected, measure and period are the canonical JSON of what was recorded
-- (a measure's values signed decimal strings since T33);
-- state is computed, assessed or undetermined. value is a computed part's
-- value, calc-grammar's arithmetic (JSON: {value} or {range}, signed decimal
-- strings; a row before T33 may hold numbers, read as exact decimals), grade
-- its weakest operand's letter (null when undetermined) and grade_why the
-- named weakest link; op the computation. rationale and rests_on are an assessment's;
-- undetermined_why an undetermined part's reason code and words. causation is
-- the inquiry named (or null) and causation_state what it was when recorded
-- (established or unproven; not_applicable for a zero measure, N257),
-- causation_why the words. machine is 1 for a
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
-- R2: A COMPUTED PART'S OPERANDS, in order. kind is content, money or
-- calculation (null on a row recorded before T33: content). content_id holds
-- the operand's id: the content id whose passage holds the figure, the money
-- fact (MNY-) or the calculation (CALC-), with result_key the calculation's
-- result named. figure is the figure as the author read it (a content
-- operand's), exact its value as calc-grammar read it (JSON: {value} or
-- {range}, signed decimal strings, with precision and currency), number the
-- float a row recorded before T33 held (never written since: a value is never
-- a floating-point number). capture_sha is the capture a content operand's
-- passage is of; grade (null when undetermined), route, determined and basis
-- the operand's grade as it read when recorded (a content operand's capture
-- grade, provenance.captureGrade; a money fact's reading grade; a
-- calculation's capture axis).
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
  kind         TEXT,
  result_key   TEXT,
  exact        TEXT,
  PRIMARY KEY (part_id, ord)
);
-- R9: A MEMBER'S ADDRESSED RECORD, one row per act, append-only; the latest by
-- seq is the part's state. evidence is the JSON list of content ids or
-- findings; words (T45, added by migrateConsequences) the JSON list of R9's
-- plain words, or null.
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
-- R17–R21 (T45): ONE ROW PER SUCCESS RECORD, never updated. id is SUC-<year>-<4
-- digits> (T45: four random digits, record-core's mintOpaqueId; since T46 the
-- counter, record-grammar R59's sequential form, R24), also the id of the
-- record's success_record object (R24); project the project it is recorded in
-- (every read gates on it); matter the {plan, matter} given, stored unread;
-- statement the member's words; changed_on a calendar date or an EDTF band;
-- evidence the JSON list of content ids or findings; figures the JSON list of
-- R18's computed figures as answered when recorded (label, op, operands, value,
-- grade); sequence the member's text; cause the JSON {statement, evidence} or
-- null. supersedes names the record this one revises (R21), at most once
-- (UNIQUE), with its reason.
CREATE TABLE IF NOT EXISTS success_records (
  id          TEXT PRIMARY KEY,
  project     TEXT NOT NULL,
  matter      TEXT,
  statement   TEXT NOT NULL,
  changed_on  TEXT NOT NULL,
  evidence    TEXT NOT NULL,
  figures     TEXT NOT NULL,
  sequence    TEXT,
  cause       TEXT,
  author      TEXT NOT NULL,
  at          TEXT NOT NULL,
  supersedes  TEXT UNIQUE,
  reason      TEXT
);
CREATE INDEX IF NOT EXISTS success_records_project ON success_records (project, id);
-- R22 (T45): ONE ROW PER CARRY, appended to the record carried. kind is
-- success, harm_addressed or cure; record_id the success record, the part, or
-- the cured determination; ref the standard of a cure; outcome case-authoring's
-- id for the carried outcome.
CREATE TABLE IF NOT EXISTS consequence_carries (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id  TEXT NOT NULL,
  kind       TEXT NOT NULL,
  ref        TEXT,
  case_id    TEXT NOT NULL,
  outcome    TEXT NOT NULL,
  by         TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS consequence_carries_record ON consequence_carries (record_id, seq);
`;

/** R13: the tables, as record-core's purge takes them (its R21, R46): each keyed to the part's bundle. */
export const CONSEQUENCES_TABLES = Object.freeze([
  "consequence_parts",
  Object.freeze({ name: "consequence_operands", keys: Object.freeze(["part_id"]) }),
  Object.freeze({ name: "consequence_addressed", keys: Object.freeze(["part_id"]) }),
  Object.freeze({ name: "success_records", keys: Object.freeze(["id"]) }),
  Object.freeze({ name: "consequence_carries", keys: Object.freeze(["record_id"]) }),
]);

/* The columns T33 added to `consequence_operands` (R2's money and calculation operands, exact values), added to a table
   created before them. */
const OPERAND_COLUMNS_T33 = Object.freeze([["kind", "TEXT"], ["result_key", "TEXT"], ["exact", "TEXT"]]);

export function migrateConsequences(sql) {
  const bare = CONSEQUENCES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const stmt of bare.split(";")) if (stmt.trim()) sql.exec(stmt.trim());
  const have = new Set([...sql.exec(`PRAGMA table_info(consequence_operands)`)].map((r) => r.name));
  for (const [col, type] of OPERAND_COLUMNS_T33)
    if (!have.has(col)) sql.exec(`ALTER TABLE consequence_operands ADD COLUMN ${col} ${type}`);
  /* T45 (R9): the plain words an addressed statement carries, added to a table created before them. */
  const addr = new Set([...sql.exec(`PRAGMA table_info(consequence_addressed)`)].map((r) => r.name));
  if (!addr.has("words")) sql.exec(`ALTER TABLE consequence_addressed ADD COLUMN words TEXT`);
}
