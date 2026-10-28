/* ai-catalogue's tables (R46): the copy's own running, never the corpus. Each is written by appending; the one removal is
 * R42's, a payload older than the kept versions, dropped whole when a newer one is applied. They hold no member,
 * project, record text or secret: a payload's bytes (chunked under the store's single-value limit, with the statement and
 * signature that make them read), each verified advisory with its signature, one row per check, one per rollback.
 * `AiCatalogue#migrate` runs the DDL; SQL comments are `--` lines, dropped before the statements run. */
export const AI_CATALOGUE_SCHEMA = `
-- R35, R39, R42: a held, verified payload, one row per chunk of its text (part 0..parts-1), with the fields its statement
-- binds and the armored signature over them; source 'seed' or 'pulled'.
CREATE TABLE IF NOT EXISTS ai_catalogue_payloads (
  seq            INTEGER NOT NULL,
  part           INTEGER NOT NULL,
  parts          INTEGER NOT NULL,
  schema_version INTEGER NOT NULL,
  issued_at      TEXT NOT NULL,
  sha256         TEXT NOT NULL,
  bytes          INTEGER NOT NULL,
  armored        TEXT NOT NULL,
  source         TEXT NOT NULL CHECK (source IN ('seed','pulled')),
  received_at    TEXT NOT NULL,
  body           TEXT NOT NULL,
  PRIMARY KEY (seq, part)
);
-- R26: every verified advisory, kept (R42), with every field its statement binds.
CREATE TABLE IF NOT EXISTS ai_catalogue_advisories (
  seq          INTEGER PRIMARY KEY,
  target_kind  TEXT NOT NULL CHECK (target_kind IN ('entry_id','plan_id')),
  target_id    TEXT NOT NULL,
  kind         TEXT NOT NULL,
  reason       TEXT NOT NULL,
  effective_at TEXT NOT NULL,
  issued_at    TEXT NOT NULL,
  armored      TEXT NOT NULL,
  received_at  TEXT NOT NULL
);
-- R35: one row per receive.
CREATE TABLE IF NOT EXISTS ai_catalogue_checks (
  n       INTEGER PRIMARY KEY AUTOINCREMENT,
  at      TEXT NOT NULL,
  trigger TEXT NOT NULL,
  kind    TEXT NOT NULL,
  outcome TEXT NOT NULL,
  seq     INTEGER
);
-- R41: each rollback and unrollback.
CREATE TABLE IF NOT EXISTS ai_catalogue_rollbacks (
  n        INTEGER PRIMARY KEY AUTOINCREMENT,
  act      TEXT NOT NULL CHECK (act IN ('rollback','unrollback')),
  from_seq INTEGER,
  to_seq   INTEGER,
  by       TEXT NOT NULL,
  reason   TEXT,
  at       TEXT NOT NULL
);
`;

export const AI_CATALOGUE_TABLES = Object.freeze(["ai_catalogue_payloads", "ai_catalogue_advisories", "ai_catalogue_checks",
  "ai_catalogue_rollbacks"]);

/** R46: each table's classes, as record-core's `declareTable` (its R21) reads them. */
export const AI_CATALOGUE_DECLARATIONS = Object.freeze(AI_CATALOGUE_TABLES.map((name) => Object.freeze({
  name, purge: "exempt", expunge: "none", export: "admin-only", sight: "group", derive: "stored", version_chain: true,
})));
