/* escalation's tables (requirements: `build/requirements/escalation.md`, R18, R20, R21). An escalation is a record
 * document of its own type (R21): its bundle, history and manifest are record-core's, and its document's log is the
 * record of every act on it. These five tables are that document's projections, written by the module's registered
 * promotion projection in the promotion's own transaction, so a read never parses the log. Every row names the
 * escalation it is about (and an attachment the action it attaches) and is declared to record-core's purge (K23).
 * No row stores a significance, severity, priority, urgency or score (R19). */

export const ESCALATION_SCHEMA = `
-- One row per escalation: what it pursues and where it stands. Rewritten from the document at each promotion.
CREATE TABLE IF NOT EXISTS escalations (
  escalation_id    TEXT PRIMARY KEY,
  project_id       TEXT NOT NULL,
  determination_id TEXT NOT NULL,
  act_id           TEXT,
  standards_json   TEXT NOT NULL,
  state            TEXT NOT NULL,
  stage            INTEGER NOT NULL,
  stage_since      TEXT NOT NULL,
  state_since      TEXT NOT NULL,
  opened_by        TEXT NOT NULL,
  opened_at        TEXT NOT NULL,
  log_len          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS escalations_determination ON escalations(determination_id, state);
CREATE INDEX IF NOT EXISTS escalations_state ON escalations(state, escalation_id);
-- R13, R14, R15, R18: every stage move (open, advance), suspension, resumption and end, in order. Appended only.
CREATE TABLE IF NOT EXISTS escalation_moves (
  escalation_id  TEXT NOT NULL,
  seq            INTEGER NOT NULL,
  kind           TEXT NOT NULL,
  from_stage     INTEGER,
  to_stage       INTEGER,
  reason         TEXT,
  trigger_json   TEXT,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (escalation_id, seq)
);
-- R10: a member's reading of a response. Appended only; the latest is in force.
CREATE TABLE IF NOT EXISTS escalation_evaluations (
  escalation_id    TEXT NOT NULL,
  seq              INTEGER NOT NULL,
  reading          TEXT NOT NULL,
  response_action  TEXT,
  response_ord     INTEGER,
  reason           TEXT NOT NULL,
  author           TEXT NOT NULL,
  at               TEXT NOT NULL,
  PRIMARY KEY (escalation_id, seq)
);
-- R9, R12: an action attached to one escalation at one stage, with stage 7's purpose and standards.
CREATE TABLE IF NOT EXISTS escalation_attachments (
  action_id       TEXT PRIMARY KEY,
  escalation_id   TEXT NOT NULL,
  seq             INTEGER NOT NULL,
  stage           INTEGER NOT NULL,
  purpose         TEXT,
  standards_json  TEXT,
  author          TEXT NOT NULL,
  at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS escalation_attachments_escalation ON escalation_attachments(escalation_id, seq);
-- R13: a member's choice not to advance along a proposed edge now, with a reason. Appended only.
CREATE TABLE IF NOT EXISTS escalation_declines (
  escalation_id  TEXT NOT NULL,
  seq            INTEGER NOT NULL,
  from_stage     INTEGER NOT NULL,
  to_stage       INTEGER NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (escalation_id, seq)
);
`;

/** R20 (K23): the tables, as record-core's `declarePurge` takes them. A single-bundle purge of an escalation clears its
 *  rows; the whole-store form clears every row. */
export const ESCALATION_TABLES = Object.freeze([
  { name: "escalations", keys: ["escalation_id"] },
  { name: "escalation_moves", keys: ["escalation_id"] },
  { name: "escalation_evaluations", keys: ["escalation_id"] },
  { name: "escalation_attachments", keys: ["escalation_id", "action_id"] },
  { name: "escalation_declines", keys: ["escalation_id"] },
]);

export function migrateEscalation(sql) {
  const bare = ESCALATION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
