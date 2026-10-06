/* workbooks' tables (requirements: `build/requirements/workbooks.md`, R18). Each is keyed to its project, so a purge of
 * the project clears it, and is exported (`yes`). A workbook is keyed by its capture's sha and its project (K1511: no
 * new id prefix). Nothing is stored but the file's cells, the engine's results, the members' acts and the sources'
 * references (R17): no number is computed into a row here. */

export const WORKBOOKS_SCHEMA = `
-- R1: a workbook held in a project, with the question and period it answers, the capture's origin as provenance
-- states it, its author, and the facts of the file lint reads (its sheets with their hidden state, hidden rows and
-- columns, defined names), as office-readers read them at the add.
CREATE TABLE IF NOT EXISTS workbooks (
  capture_sha TEXT NOT NULL,
  project     TEXT NOT NULL,
  question    TEXT NOT NULL,
  period      TEXT NOT NULL,   -- JSON, as given
  origin      TEXT NOT NULL,   -- JSON: {bundle_id, route, system}
  author      TEXT NOT NULL,   -- the control plane's stamp
  at          TEXT NOT NULL,
  facts       TEXT NOT NULL,   -- JSON: {sheets, hidden_rows, hidden_cols, names, counts}
  PRIMARY KEY (capture_sha, project)
);
CREATE INDEX IF NOT EXISTS workbooks_project ON workbooks(project);
-- R2, R5, R9: the file's own cells (office-readers R30), each with its formula and cached value as the file holds them.
CREATE TABLE IF NOT EXISTS workbook_cells (
  capture_sha TEXT NOT NULL,
  project     TEXT NOT NULL,
  sheet       TEXT NOT NULL,
  cell        TEXT NOT NULL,
  r           INTEGER NOT NULL,
  c           INTEGER NOT NULL,
  type        TEXT,
  value       TEXT,
  formula     TEXT,
  cached      TEXT,
  PRIMARY KEY (capture_sha, project, sheet, cell)
);
-- R3: a binding of one rectangle of input cells to a source. Never deleted: unbinding stamps who, when and why.
CREATE TABLE IF NOT EXISTS workbook_bindings (
  binding_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha   TEXT NOT NULL,
  project       TEXT NOT NULL,
  sheet         TEXT NOT NULL,
  range         TEXT NOT NULL,   -- A1:B2 on the sheet
  input         TEXT NOT NULL,   -- JSON: {table, range} or {extent}
  bound_by      TEXT NOT NULL,
  bound_at      TEXT NOT NULL,
  unbound_by    TEXT,
  unbound_at    TEXT,
  unbind_reason TEXT
);
CREATE INDEX IF NOT EXISTS workbook_bindings_wb ON workbook_bindings(capture_sha, project);
-- R6, R7: each recompute, as the engine answered it, paired with the file's cached values. Appended, never rewritten.
CREATE TABLE IF NOT EXISTS workbook_recomputes (
  recompute_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha    TEXT NOT NULL,
  project        TEXT NOT NULL,
  status         TEXT NOT NULL,
  engine         TEXT,
  engine_version TEXT,
  at             TEXT NOT NULL,
  by             TEXT NOT NULL,
  reason         TEXT,           -- R7: the engine's refusal code, as given
  why            TEXT,           -- and its words, as given
  answer         TEXT NOT NULL   -- JSON: {counts, differing, not_recomputed, volatile, cache_stale, truncated}
);
CREATE INDEX IF NOT EXISTS workbook_recomputes_wb ON workbook_recomputes(capture_sha, project);
-- R9: a member's note against a lint finding, kept and never erased.
CREATE TABLE IF NOT EXISTS workbook_lint_notes (
  note_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha TEXT NOT NULL,
  project     TEXT NOT NULL,
  kind        TEXT NOT NULL,
  cell        TEXT NOT NULL,
  note        TEXT NOT NULL,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS workbook_lint_notes_wb ON workbook_lint_notes(capture_sha, project);
-- R10: method notes; the latest stands and every earlier one is kept.
CREATE TABLE IF NOT EXISTS workbook_method_notes (
  note_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha TEXT NOT NULL,
  project     TEXT NOT NULL,
  purpose     TEXT NOT NULL,
  sources     TEXT NOT NULL,   -- JSON
  steps       TEXT NOT NULL,
  limitations TEXT NOT NULL,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS workbook_method_notes_wb ON workbook_method_notes(capture_sha, project);
-- R11: a second member's check, disclosed on every read.
CREATE TABLE IF NOT EXISTS workbook_checks (
  check_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha TEXT NOT NULL,
  project     TEXT NOT NULL,
  outcome     TEXT NOT NULL,
  note        TEXT,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS workbook_checks_wb ON workbook_checks(capture_sha, project);
`;

const table = (name, cls = {}) => Object.freeze({ name, keys: ["project"], purge: "clear", expunge: "none", export: "yes",
  sight: "source", derive: "stored", version_chain: false, ...cls });

/** R18: the declarations, each with its classes (record-core R21). */
export const WORKBOOKS_TABLES = Object.freeze([
  table("workbooks"),
  table("workbook_cells"),
  table("workbook_bindings"),
  table("workbook_recomputes", { version_chain: true }),
  table("workbook_lint_notes", { version_chain: true }),
  table("workbook_method_notes", { version_chain: true }),
  table("workbook_checks", { version_chain: true }),
]);

export function migrateWorkbooks(sql) {
  const bare = WORKBOOKS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";")) if (s.trim()) sql.exec(s);
}
