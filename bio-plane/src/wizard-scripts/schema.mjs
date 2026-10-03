/* wizard-scripts' tables (requirements: `build/requirements/wizard-scripts.md`, R1–R9, R13, R15, R16, R18; K1364).
 *
 * APPEND-ONLY (R18): no act updates or deletes a row. A version's state, an approval, an update, a widening, a
 * withdrawal and a retirement are each a row of `wiz_events`, and the state is derived from them; a revision, a
 * proposal, an editor grant and its revocation, a break and a return are each a row of their own; a tally is one row
 * per (key, day), its count the rows' number (R15, R16: nothing else of the call is kept). Every row of a project's
 * script carries `bundle_id`, its project (record-core R21, R46; K23); an editor grant, a tally and a refusal tally
 * carry none and are cleared by the whole-store purge only. Every name in attribution is held by value beside the id.
 * A Civicsmith script is never a row: it is the library registered at start (R13). */

export const WIZARD_SCRIPTS_SCHEMA = `
-- R1: A SCRIPT of a project; widened by a 'widened' event (R7).
CREATE TABLE IF NOT EXISTS wiz_scripts (
  script_id      TEXT PRIMARY KEY,
  bundle_id      TEXT,
  project        TEXT NOT NULL,
  name           TEXT NOT NULL,
  created_by     TEXT NOT NULL,
  created_name   TEXT NOT NULL,
  created_at     TEXT NOT NULL
);
-- R1, R3: A VERSION, counting from 1 within its script. recorded is the JSON list
-- of the recorded {screen, act} pairs (R3), or null; derived_from null or JSON
-- {version} | {proposal}.
CREATE TABLE IF NOT EXISTS wiz_versions (
  script_id      TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  author         TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  recorded       TEXT,
  derived_from   TEXT,
  created_at     TEXT NOT NULL,
  PRIMARY KEY (script_id, version)
);
-- R3, R4: EVERY REVISION of a version's steps, with its author; adopted names the
-- proposal (R5) whose steps it took.
CREATE TABLE IF NOT EXISTS wiz_revisions (
  rid            INTEGER PRIMARY KEY,
  script_id      TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  steps          TEXT NOT NULL,
  sha            TEXT NOT NULL,
  author         TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  adopted        TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS wiz_revisions_version ON wiz_revisions (script_id, version, rid);
-- R6, R7, R9: WHAT HAPPENED: submitted, approved, updated (by its successor),
-- withdrawn; widened and retired (version NULL). detail is JSON.
CREATE TABLE IF NOT EXISTS wiz_events (
  eid            INTEGER PRIMARY KEY,
  script_id      TEXT NOT NULL,
  version        INTEGER,
  bundle_id      TEXT,
  event          TEXT NOT NULL,
  actor          TEXT NOT NULL,
  actor_name     TEXT NOT NULL,
  detail         TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS wiz_events_script ON wiz_events (script_id, event, version);
-- R5: A PROPOSAL of steps, for a project or for a script, stored apart and labelled.
CREATE TABLE IF NOT EXISTS wiz_proposals (
  proposal_id    TEXT PRIMARY KEY,
  bundle_id      TEXT,
  project        TEXT NOT NULL,
  script_id      TEXT,
  steps          TEXT NOT NULL,
  sha            TEXT NOT NULL,
  why            TEXT NOT NULL,
  proposer       TEXT NOT NULL,
  run            TEXT,
  model          TEXT,
  at             TEXT NOT NULL
);
-- R8: AN EDITOR GRANT, and its revocation (at most one per grant).
CREATE TABLE IF NOT EXISTS wiz_editor_grants (
  grant_id       TEXT PRIMARY KEY,
  member         TEXT NOT NULL,
  member_name    TEXT NOT NULL,
  actor          TEXT NOT NULL,
  actor_name     TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS wiz_editor_revocations (
  grant_id       TEXT PRIMARY KEY,
  actor          TEXT NOT NULL,
  actor_name     TEXT NOT NULL,
  at             TEXT NOT NULL
);
-- R13: THE BREAK LOG: a version found broken at registration, or returned.
CREATE TABLE IF NOT EXISTS wiz_breaks (
  bid            INTEGER PRIMARY KEY,
  script_id      TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  event          TEXT NOT NULL,
  refusal        TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS wiz_breaks_version ON wiz_breaks (script_id, version, bid);
-- R15: ONE ROW PER COUNTED CALL, keyed by version, event, step and day; nothing else.
CREATE TABLE IF NOT EXISTS wiz_tallies (
  tid            INTEGER PRIMARY KEY,
  version_id     TEXT NOT NULL,
  event          TEXT NOT NULL,
  step           INTEGER,
  day            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS wiz_tallies_key ON wiz_tallies (version_id, event, step, day);
-- R16: ONE ROW PER COUNTED REFUSAL, keyed by op, code and day; nothing else.
CREATE TABLE IF NOT EXISTS wiz_refusal_tallies (
  tid            INTEGER PRIMARY KEY,
  op             TEXT NOT NULL,
  code           TEXT NOT NULL,
  day            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS wiz_refusal_tallies_key ON wiz_refusal_tallies (op, code, day);
`;

/** The tables, each keyed to its bundle by `bundle_id` where it has one (record-core R21, R46; K23). */
export const WIZARD_SCRIPTS_TABLES = Object.freeze(["wiz_scripts", "wiz_versions", "wiz_revisions", "wiz_events",
  "wiz_proposals", "wiz_editor_grants", "wiz_editor_revocations", "wiz_breaks", "wiz_tallies", "wiz_refusal_tallies"]);

/** The opaque ids its tables hold, for record-core's mint ledger (its R40, R70). */
export const WIZARD_SCRIPTS_MINT_SEED = Object.freeze([
  Object.freeze(["WIZ", "wiz_scripts", "script_id"]),
  Object.freeze(["WZP", "wiz_proposals", "proposal_id"]),
  Object.freeze(["WEG", "wiz_editor_grants", "grant_id"]),
]);

/** Creates the tables; idempotent. */
export function migrateWizardScripts(sql) {
  const bare = WIZARD_SCRIPTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--"))
    .map((l) => l.replace(/\s--.*$/, "")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
