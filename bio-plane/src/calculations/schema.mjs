/* calculations' tables (requirements: `build/requirements/calculations.md`, R29). Each is declared explicitly to
 * record-core (`declareTable`, its R21): tables, bindings, ingests, calculations, their inputs and results, draws and
 * frozen sets export `yes`; the machine's pattern definitions, results, gates and switches export `admin-only`. Every
 * row naming a project is keyed to it for purge; a table and what is made from it are keyed to its source's bundle.
 * Rows are appended and never rewritten, except a calculation's `recompute_status`, `accepted_*` and its latest
 * results, each change of which is appended to `calc_recomputes` (a version chain). */

export const CALCULATIONS_SCHEMA = `
-- R1–R3: one row per declared table, keyed by its canonical bytes' sha256 (no id prefix). bundle_id is the source
-- capture's bundle, whose sight the table takes.
CREATE TABLE IF NOT EXISTS calc_tables (
  sha           TEXT PRIMARY KEY,
  bundle_id     TEXT,
  source_json   TEXT NOT NULL,
  schema_json   TEXT NOT NULL,
  header_json   TEXT NOT NULL,
  roles_json    TEXT,
  vintage_key   TEXT,
  vintage_json  TEXT,
  superseded_by TEXT,
  rows          INTEGER NOT NULL,
  bytes         INTEGER NOT NULL,
  undetermined_json TEXT NOT NULL,
  undetermined_count INTEGER NOT NULL,
  declared_by   TEXT NOT NULL,
  declared_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS calc_tables_vintage ON calc_tables(vintage_key, sha);
-- R1: the canonical bytes again, as UTF-8 text in chunks, beside the evidence store's copy, so a read asked
-- synchronously (people's roster source, R20) has the rows at hand; the evidence store's bytes are the record's copy.
CREATE TABLE IF NOT EXISTS calc_table_bytes (
  sha           TEXT NOT NULL,
  seq           INTEGER NOT NULL,
  bundle_id     TEXT,
  chunk         TEXT NOT NULL,
  PRIMARY KEY (sha, seq)
);
-- R14: a member's adoption of a table's money roles.
CREATE TABLE IF NOT EXISTS calc_bindings (
  binding_key   TEXT PRIMARY KEY,
  table_sha     TEXT NOT NULL,
  bundle_id     TEXT,
  roles_json    TEXT NOT NULL,
  adopted_by    TEXT NOT NULL,
  adopted_at    TEXT NOT NULL
);
-- R14: each ingest a member asked for, with what was written and what was not.
CREATE TABLE IF NOT EXISTS calc_ingests (
  ingest_key    TEXT PRIMARY KEY,
  binding_key   TEXT NOT NULL,
  bundle_id     TEXT,
  rows_json     TEXT NOT NULL,
  reason        TEXT,
  written_json  TEXT NOT NULL,
  not_written_json TEXT NOT NULL,
  asked_by      TEXT NOT NULL,
  at            TEXT NOT NULL
);
-- R4–R11: one row per calculation.
CREATE TABLE IF NOT EXISTS calculations (
  calc_id       TEXT PRIMARY KEY,
  project       TEXT,
  question      TEXT NOT NULL,
  terms_json    TEXT,
  period_json   TEXT NOT NULL,
  kind          TEXT NOT NULL,
  recipe_json   TEXT NOT NULL,
  inputs_json   TEXT NOT NULL,
  threshold_json TEXT,
  method_version TEXT NOT NULL,
  method_note   TEXT,
  evidences_json TEXT,
  result_key    TEXT NOT NULL,
  results_json  TEXT NOT NULL,
  computed_at   TEXT NOT NULL,
  recompute_status TEXT NOT NULL,
  recompute_json TEXT,
  accepted_by   TEXT,
  accepted_at   TEXT,
  created_by    TEXT NOT NULL,
  created_at    TEXT NOT NULL
);
-- R11, R19: what each calculation names, for the change notices and the occurrence evidence.
CREATE TABLE IF NOT EXISTS calc_inputs (
  calc_id       TEXT NOT NULL,
  project       TEXT,
  input_name    TEXT NOT NULL,
  input_kind    TEXT NOT NULL,
  ref           TEXT NOT NULL,
  PRIMARY KEY (calc_id, input_name, ref)
);
CREATE INDEX IF NOT EXISTS calc_inputs_ref ON calc_inputs(ref, calc_id);
-- R8, R11: every recompute and every staling, appended.
CREATE TABLE IF NOT EXISTS calc_recomputes (
  calc_id       TEXT NOT NULL,
  project       TEXT,
  seq           INTEGER NOT NULL,
  status        TEXT NOT NULL,
  result_key    TEXT,
  detail_json   TEXT,
  at            TEXT NOT NULL,
  PRIMARY KEY (calc_id, seq)
);
-- R18: a recorded draw, keyed by sha256 of its set, seed, size and method.
CREATE TABLE IF NOT EXISTS calc_draws (
  draw_key      TEXT PRIMARY KEY,
  project       TEXT,
  set_kind      TEXT NOT NULL,
  set_sha       TEXT NOT NULL,
  frame_hash    TEXT NOT NULL,
  frame_size    INTEGER NOT NULL,
  n             INTEGER NOT NULL,
  seed          TEXT NOT NULL,
  method        TEXT NOT NULL,
  sample_json   TEXT NOT NULL,
  drawn_by      TEXT NOT NULL,
  drawn_at      TEXT NOT NULL
);
-- R21: a frozen record set, keyed by the sha256 of its sorted ids.
CREATE TABLE IF NOT EXISTS calc_sets (
  set_sha       TEXT PRIMARY KEY,
  project       TEXT,
  query_json    TEXT NOT NULL,
  ids_json      TEXT NOT NULL,
  n             INTEGER NOT NULL,
  frozen_by     TEXT NOT NULL,
  frozen_at     TEXT NOT NULL
);
-- R22, R23: the machine's patterns, their results, their gates and their switches.
CREATE TABLE IF NOT EXISTS calc_pattern_results (
  result_key    TEXT PRIMARY KEY,
  pattern       TEXT NOT NULL,
  version       INTEGER NOT NULL,
  subject       TEXT,
  value_json    TEXT NOT NULL,
  denominator_json TEXT NOT NULL,
  derivation_json TEXT NOT NULL,
  rests_on_json TEXT NOT NULL,
  told          INTEGER NOT NULL DEFAULT 0,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS calc_pattern_results_pattern ON calc_pattern_results(pattern, version, result_key);
CREATE TABLE IF NOT EXISTS calc_pattern_runs (
  pattern       TEXT NOT NULL,
  version       INTEGER NOT NULL,
  seq           INTEGER NOT NULL,
  evaluated     INTEGER NOT NULL,
  denominator_json TEXT NOT NULL,
  at            TEXT NOT NULL,
  PRIMARY KEY (pattern, version, seq)
);
CREATE TABLE IF NOT EXISTS calc_pattern_gates (
  pattern       TEXT NOT NULL,
  version       INTEGER NOT NULL,
  seq           INTEGER NOT NULL,
  gold_set      TEXT NOT NULL,
  false_alarm_rate TEXT NOT NULL,
  recorded_by   TEXT NOT NULL,
  at            TEXT NOT NULL,
  PRIMARY KEY (pattern, version, seq)
);
CREATE TABLE IF NOT EXISTS calc_pattern_switches (
  pattern       TEXT NOT NULL,
  project       TEXT NOT NULL,
  seq           INTEGER NOT NULL,
  on_state      INTEGER NOT NULL,
  switched_by   TEXT NOT NULL,
  at            TEXT NOT NULL,
  PRIMARY KEY (pattern, project, seq)
);
CREATE TABLE IF NOT EXISTS calc_pattern_cursor (
  slot          TEXT PRIMARY KEY,
  next_index    INTEGER NOT NULL
);
`;

const cls = (name, extra) => Object.freeze({ name, purge: "clear", expunge: "none", derive: "stored",
  version_chain: false, ...extra });

/** R29: the declarations, as record-core's `declareTable` takes them. */
export const CALCULATIONS_TABLES = Object.freeze([
  cls("calc_tables", { export: "yes", sight: "source", keys: ["bundle_id"] }),
  cls("calc_table_bytes", { export: "never", sight: "source", keys: ["bundle_id"] }),
  cls("calc_bindings", { export: "yes", sight: "source", keys: ["bundle_id"] }),
  cls("calc_ingests", { export: "yes", sight: "source", keys: ["bundle_id"] }),
  cls("calculations", { export: "yes", sight: "bundle", keys: ["project"] }),
  cls("calc_inputs", { export: "yes", sight: "bundle", keys: ["project"] }),
  cls("calc_recomputes", { export: "yes", sight: "bundle", keys: ["project"], version_chain: true }),
  cls("calc_draws", { export: "yes", sight: "bundle", keys: ["project"] }),
  cls("calc_sets", { export: "yes", sight: "bundle", keys: ["project"] }),
  cls("calc_pattern_results", { export: "admin-only", sight: "group", keys: [] }),
  cls("calc_pattern_runs", { export: "admin-only", sight: "group", keys: [], version_chain: true }),
  cls("calc_pattern_gates", { export: "admin-only", sight: "group", keys: [], version_chain: true }),
  cls("calc_pattern_switches", { export: "admin-only", sight: "bundle", keys: ["project"], version_chain: true }),
  cls("calc_pattern_cursor", { export: "never", sight: "group", keys: [] }),
]);

/** Creates the tables where absent. Idempotent. */
export function migrateCalculations(sql) {
  const bare = CALCULATIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
