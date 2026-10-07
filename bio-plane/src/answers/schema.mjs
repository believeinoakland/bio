/* answers' tables (R13, R15–R20, R23). Each is declared explicitly to record-core (`declareTable`, its R21): the
 * tallies `admin-only` and group-wide, carrying no member, viewer, question, address or answer text (R13; K1450); a
 * standing question and its runs seen only by their author, `sight: "owner"`, export `never` (K1481, K1505 (14)). None
 * is keyed to a bundle, so each is cleared by the whole-store purge only. An ask writes nothing here but the tallies
 * (R14); the read log is held in memory (J1 (4)). */

export const ANSWERS_SCHEMA = `
CREATE TABLE IF NOT EXISTS answers_tallies (
  day    TEXT NOT NULL,
  zone   TEXT,
  mode   TEXT NOT NULL,
  kind   TEXT NOT NULL,
  code   TEXT NOT NULL,
  n      INTEGER NOT NULL,
  PRIMARY KEY (day, mode, kind, code)
);
CREATE TABLE IF NOT EXISTS standing_questions (
  stq_id        TEXT PRIMARY KEY,
  author        TEXT NOT NULL,
  question      TEXT NOT NULL,
  form_json     TEXT NOT NULL,
  cadence       TEXT NOT NULL,
  ends          TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  ended_at      TEXT,
  ended_by      TEXT,
  next_due      TEXT,
  last_run_at   TEXT,
  last_ids_json TEXT,
  last_occ_json TEXT,
  last_digest   TEXT,
  find_json     TEXT
);
CREATE INDEX IF NOT EXISTS standing_questions_author ON standing_questions(author, stq_id);
CREATE TABLE IF NOT EXISTS standing_runs (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  stq_id         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  new_found      INTEGER NOT NULL,
  finds_json     TEXT,
  answer_json    TEXT,
  withheld_json  TEXT,
  held_back_json TEXT
);
CREATE INDEX IF NOT EXISTS standing_runs_author ON standing_runs(author, new_found, seq);
`;

const cls = (name, extra) => Object.freeze({ name, keys: [], purge: "clear", expunge: "none", derive: "stored",
  version_chain: false, ...extra });

/** R23: the declarations, as record-core's `declareTable` takes them. */
export const ANSWERS_TABLES = Object.freeze([
  cls("answers_tallies", { export: "admin-only", sight: "group" }),
  cls("standing_questions", { export: "never", sight: "owner" }),
  cls("standing_runs", { export: "never", sight: "owner" }),
]);

/** Creates the tables where absent, and adds a column a store made before it lacks (R28's `find_json`, T35).
 *  Idempotent. */
export function migrateAnswers(sql) {
  for (const s of ANSWERS_SCHEMA.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const cols = [...sql.exec(`PRAGMA table_info(standing_questions)`)].map((c) => c.name);
  if (!cols.includes("find_json")) sql.exec(`ALTER TABLE standing_questions ADD COLUMN find_json TEXT`);
}
