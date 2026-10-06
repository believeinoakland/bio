/* duties' tables (requirements: `build/requirements/duties.md`, R3, R6, R12, R13, R20–R22). Every table is appended
 * to and never rewritten, except two columns of `duties` itself: `version` (the current version's number, R6) and the
 * withdrawal (R6), each a pointer the read contract names (R20). Versions, proposals, matches and transitions are rows
 * of their own, kept whole. No due date is stored anywhere (R9, R21): it is computed by `civil-time` on each read. */

export const DUTIES_SCHEMA = `
-- R2: a duty a rule computed or the machine proposed, held apart and never tracked until a member adopts it.
CREATE TABLE IF NOT EXISTS duty_proposals (
  proposal_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  fields_json   TEXT NOT NULL,
  proposed_by   TEXT NOT NULL,
  why           TEXT,
  at            TEXT NOT NULL,
  adopted_duty  TEXT
);
-- R3, R20: one row per adopted duty, its summary columns for the read contract (obligor:, owed_to:); arising_in is
-- the capture the duty's source item rests on (its arising_in when that is a capture), else NULL (K1563).
CREATE TABLE IF NOT EXISTS duties (
  duty_id        TEXT PRIMARY KEY,
  modality       TEXT NOT NULL,
  obligor        TEXT NOT NULL,
  obligee        TEXT,
  enforcer       TEXT,
  arising_in     TEXT,
  version        INTEGER NOT NULL,
  adopted_by     TEXT NOT NULL,
  adopted_at     TEXT NOT NULL,
  clause         TEXT NOT NULL,
  proposal_id    INTEGER,
  withdrawn_at   TEXT,
  withdrawn_by   TEXT,
  withdraw_reason TEXT
);
CREATE INDEX IF NOT EXISTS duties_obligor ON duties(obligor, duty_id);
CREATE INDEX IF NOT EXISTS duties_obligee ON duties(obligee, duty_id);
CREATE INDEX IF NOT EXISTS duties_enforcer ON duties(enforcer, duty_id);
-- R6: every version of a duty, kept; version 1 is its adoption.
CREATE TABLE IF NOT EXISTS duty_versions (
  duty_id       TEXT NOT NULL,
  version       INTEGER NOT NULL,
  fields_json   TEXT NOT NULL,
  reason        TEXT,
  by_member     TEXT NOT NULL,
  at            TEXT NOT NULL,
  PRIMARY KEY (duty_id, version)
);
-- R12: a member's match of an event to an occurrence, correctable by a later act that keeps this one.
CREATE TABLE IF NOT EXISTS duty_matches (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  duty_id        TEXT NOT NULL,
  occurrence_key TEXT NOT NULL,
  event_id       TEXT,
  exception      INTEGER,
  reason         TEXT NOT NULL,
  by_member      TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS duty_matches_key ON duty_matches(duty_id, occurrence_key, seq);
CREATE INDEX IF NOT EXISTS duty_matches_event ON duty_matches(event_id);
-- R13, R14: an occurrence's recorded state as known on a day, append-only.
CREATE TABLE IF NOT EXISTS duty_transitions (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  duty_id        TEXT NOT NULL,
  occurrence_key TEXT NOT NULL,
  state          TEXT NOT NULL,
  as_of          TEXT NOT NULL,
  at             TEXT NOT NULL,
  cause          TEXT NOT NULL,
  evidence_json  TEXT,
  by_member      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS duty_transitions_key ON duty_transitions(duty_id, occurrence_key, seq);
`;

export const DUTIES_TABLE_NAMES = Object.freeze(["duty_proposals", "duties", "duty_versions", "duty_matches", "duty_transitions"]);

/** R22: the tables as `record-core.declareTable` takes them (plan T33, Rules (6)). Every table names no bundle: the
 *  whole-store purge clears them, a bundle's purge leaves them. A duty's sight is its source's (R22: `source`); the
 *  transitions and matches are stored with their duty and never purged but with it (`version_chain` on the versions
 *  and the two append-only tables). The duty tables are exported; proposals stay admin-only. */
export const DUTIES_TABLES = Object.freeze([
  { name: "duty_proposals", keys: [], purge: "clear", expunge: "none", export: "admin-only", sight: "source", derive: "stored", version_chain: false },
  { name: "duties", keys: [], purge: "clear", expunge: "none", export: "yes", sight: "source", derive: "stored", version_chain: true },
  { name: "duty_versions", keys: [], purge: "clear", expunge: "none", export: "yes", sight: "source", derive: "stored", version_chain: true },
  { name: "duty_matches", keys: [], purge: "clear", expunge: "none", export: "yes", sight: "source", derive: "stored", version_chain: true },
  { name: "duty_transitions", keys: [], purge: "clear", expunge: "none", export: "yes", sight: "source", derive: "stored", version_chain: true },
]);

export function migrateDuties(sql) {
  const bare = DUTIES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
