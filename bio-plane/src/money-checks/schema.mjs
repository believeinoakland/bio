/* money-checks' tables (requirements: `build/requirements/money-checks.md`, R3–R9, R13). New with the module (T33-34;
 * split from `money` at creation, with no copy, K1504 Choices 9). Every table is this module's own (layers.md ruling 3);
 * it reads `money`'s facts only through that module's stated read contract (money R19) and `progressions`' placements
 * through its (progressions R34), never writing either. */

export const MONEY_CHECKS_SCHEMA = `
-- R3: a threshold or share a check reads, stated with its citation (a held standard or the member's own word). Every
-- statement is kept; the latest for (check, name, contract) governs, and a contract's own beats the group-wide one
-- (contract ''). Never a default the module assumes.
CREATE TABLE IF NOT EXISTS money_check_params (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  check_key TEXT NOT NULL,
  name      TEXT NOT NULL,
  contract  TEXT NOT NULL DEFAULT '',
  value     TEXT NOT NULL,
  citation  TEXT NOT NULL,
  by        TEXT NOT NULL,
  at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS money_check_params_key ON money_check_params(check_key, name, contract);
-- R4: a detector, its origin and who made it. Its definition lives in its versions; a change is a new version.
CREATE TABLE IF NOT EXISTS money_detectors (
  detector_id TEXT PRIMARY KEY,
  origin      TEXT NOT NULL,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL
);
-- R4: every version ever defined, never updated.
CREATE TABLE IF NOT EXISTS money_detector_versions (
  detector_id TEXT NOT NULL,
  version     INTEGER NOT NULL,
  label       TEXT NOT NULL,
  population  TEXT NOT NULL,
  condition   TEXT NOT NULL,
  parameters  TEXT NOT NULL,
  denominator TEXT NOT NULL,
  derivation  TEXT NOT NULL,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL,
  PRIMARY KEY (detector_id, version)
);
-- R5: every switching act, per project; the latest act for (detector, project) governs, every earlier one kept.
CREATE TABLE IF NOT EXISTS money_detector_switches (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  detector_id TEXT NOT NULL,
  project_id  TEXT NOT NULL,
  on_         INTEGER NOT NULL,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS money_detector_switches_key ON money_detector_switches(detector_id, project_id);
-- R6, R7, R13: the results, keyed by (detector, version, subject, inputs), so a rerun over unchanged inputs writes
-- nothing new. Derived and rebuildable from the detectors and the facts they read.
CREATE TABLE IF NOT EXISTS money_detector_results (
  result_key  TEXT PRIMARY KEY,
  result_id   TEXT NOT NULL UNIQUE,
  detector_id TEXT NOT NULL,
  version     INTEGER NOT NULL,
  subject_key TEXT NOT NULL,
  subject     TEXT NOT NULL,
  numerator   TEXT NOT NULL,
  denominator TEXT NOT NULL,
  derivation  TEXT NOT NULL,
  inputs      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS money_detector_results_det ON money_detector_results(detector_id, subject_key);
-- R6: when each result was first written. Held apart from the results so that they stay exactly rebuildable (R13).
CREATE TABLE IF NOT EXISTS money_detector_result_times (
  result_key TEXT PRIMARY KEY,
  at         TEXT NOT NULL
);
-- R8: every gate recorded, with who and when; the latest for a detector version governs.
CREATE TABLE IF NOT EXISTS money_detector_gates (
  seq              INTEGER PRIMARY KEY AUTOINCREMENT,
  detector_id      TEXT NOT NULL,
  version          INTEGER NOT NULL,
  gold_set         TEXT NOT NULL,
  false_alarm_rate TEXT NOT NULL,
  by               TEXT NOT NULL,
  at               TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS money_detector_gates_key ON money_detector_gates(detector_id, version);
`;

/** The tables as `record-core.declareTable` takes them (its R21; plan T33 Rules (6): a module with a T33 job declares
 *  its tables explicitly). `results` is derived-rebuildable (R13); its rebuild is the module's own `rebuild`. */
export function moneyChecksTables(rebuild) {
  const own = { purge: "clear", expunge: "none", export: "admin-only", sight: "group", derive: "stored" };
  return [
    { name: "money_check_params", ...own, version_chain: true },
    { name: "money_detectors", ...own, version_chain: false },
    { name: "money_detector_versions", ...own, version_chain: true },
    { name: "money_detector_switches", ...own, version_chain: true },
    { name: "money_detector_results", purge: "clear", expunge: "none", export: "admin-only", sight: "source",
      derive: "derived-rebuildable", version_chain: false, rebuild, key: ["result_key"] },
    { name: "money_detector_result_times", ...own, version_chain: false },
    { name: "money_detector_gates", ...own, version_chain: true },
  ];
}

export function migrateMoneyChecks(sql) {
  const bare = MONEY_CHECKS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) sql.exec(t);
}
