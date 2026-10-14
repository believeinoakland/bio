/* action-replies' tables (requirements: `build/requirements/action-replies.md`, R1, R2, R4, R10; K23). Each is keyed by the
 * action's `bundle_id`, append-only but for a proposer's restatement of its own proposal (R1), and declared to
 * record-core's purge at creation. */

export const ACTION_REPLIES_SCHEMA = `
-- R1: A MEMBER'S LAYOUT OF A REPLY CLAIM BY CLAIM, one row per layout of the
-- received entry at ord. A later layout appends; none is edited or removed.
CREATE TABLE IF NOT EXISTS action_reply_bearings (
  seq         INTEGER PRIMARY KEY,
  bundle_id   TEXT NOT NULL,   -- the request for comment
  ord         INTEGER NOT NULL,-- the received entry's position in correspondence[]
  claims_json TEXT NOT NULL,   -- [{claim, bearing, note?}], as laid out
  laid_by     TEXT NOT NULL,   -- the member, as the control plane stamps them
  laid_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS action_reply_bearings_entry ON action_reply_bearings(bundle_id, ord, seq);

-- R1: A PROPOSED LAYOUT, STORED APART. A proposer's restatement replaces its
-- own row and nobody else's; nothing here is a layout.
CREATE TABLE IF NOT EXISTS action_bearing_proposals (
  bundle_id   TEXT NOT NULL,
  ord         INTEGER NOT NULL,
  proposed_by TEXT NOT NULL,
  claims_json TEXT NOT NULL,
  proposed_at TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord, proposed_by)
);

-- R2: WHAT AROSE FROM A RESPONSE: a project, or a plan's matter (stored as
-- given, never read here). Appended, never edited.
CREATE TABLE IF NOT EXISTS action_arose_from (
  seq         INTEGER PRIMARY KEY,
  bundle_id   TEXT NOT NULL,   -- the action holding the response
  ord         INTEGER NOT NULL,-- the received entry's position
  project     TEXT,            -- {project}
  plan        TEXT,            -- {plan, matter}
  matter      TEXT,
  linked_by   TEXT NOT NULL,
  linked_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS action_arose_from_entry ON action_arose_from(bundle_id, ord);
CREATE INDEX IF NOT EXISTS action_arose_from_project ON action_arose_from(project);
CREATE INDEX IF NOT EXISTS action_arose_from_plan ON action_arose_from(plan, matter);

-- R10: A MEMBER'S RECORD THAT A REPLY ASKS NOT TO BE QUOTED, or its withdrawal. Appended,
-- never edited; the latest per received entry stands.
CREATE TABLE IF NOT EXISTS action_reply_quoting (
  seq         INTEGER PRIMARY KEY,
  bundle_id   TEXT NOT NULL,   -- the request for comment
  ord         INTEGER NOT NULL,-- the received entry's position
  quotable    INTEGER NOT NULL, -- 0 the reply says it may not be quoted, 1 that record is withdrawn
  words       TEXT,            -- the reply's own words that say so (null with quotable 1)
  recorded_by TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS action_reply_quoting_entry ON action_reply_quoting(bundle_id, ord, seq);
`;

/** The tables, each keyed to the action by `bundle_id` (R4; record-core R21). */
export const ACTION_REPLIES_TABLES = Object.freeze(["action_reply_bearings", "action_bearing_proposals", "action_arose_from", "action_reply_quoting"]);

/** Creates the tables; idempotent. */
export function migrateActionReplies(sql) {
  const bare = ACTION_REPLIES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--"))
    .map((l) => l.replace(/\s--.*$/, "")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
