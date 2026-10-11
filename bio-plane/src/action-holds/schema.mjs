/* action-holds' tables (requirements: `build/requirements/action-holds.md`, R1, R2, R5, R11, R12, R13; K4). The first
 * three are copied from `actions`' `schema.mjs` with their comments (T45; K2781 (1), K624: copy, then `actions` deletes),
 * under the same names and columns, so the rows an instance already holds stay where they are; `action_holds` gains the
 * two columns of R2's `from`. `hold_notices` (R11) and `pressure_records` (R12) are new. Each is keyed by `bundle_id`
 * (an action's id; a project's id for a project place and for a pressure record) and declared to record-core's purge
 * (K23), so a purge of that action or project clears its rows; R9 is what keeps a held one from being purged. */

export const ACTION_HOLDS_SCHEMA = `
-- R1 (K597 (1)): PRESSURE MARKED ON A RECEIVED ENTRY - a threat, retaliation,
-- discrediting or legal harassment directed at the group. A member's mark, kept
-- in this table and never written into the entry (the ledger is append-only,
-- actions R34); one mark per entry.
CREATE TABLE IF NOT EXISTS action_pressure (
  bundle_id   TEXT NOT NULL,    -- the action
  ord         INTEGER NOT NULL, -- the received correspondence entry
  kind        TEXT NOT NULL,    -- legal | retaliation | discrediting | other
  note        TEXT NOT NULL,
  marked_by   TEXT NOT NULL,    -- the member who marked it
  at          TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord)
);

-- R2 (K899 (7), DEC-61; T45, Actions D10): A LITIGATION HOLD stated at a place:
-- an entry of an action (its position), the whole action (ord -1 on the action's
-- id) or a project (ord -1 on the project's id): in_place (the group is
-- preserving what the matter may reach) or released, with the member's reason.
-- Each statement is appended and never rewritten; the latest at a place (its
-- highest seq) is its hold. While a hold is in_place, no material of a project it
-- covers, and not the action carrying it, is purged (R9; DEC-113, K1252).
-- from_kind and from_ref name what prompted it (R2's from), or are null.
CREATE TABLE IF NOT EXISTS action_holds (
  bundle_id   TEXT NOT NULL,    -- the action, or the project of a project place
  ord         INTEGER NOT NULL, -- the entry, or -1 for a whole action or a project
  seq         INTEGER NOT NULL, -- the statement's place among that place's, from 1
  hold        TEXT NOT NULL,    -- in_place | released
  reason      TEXT NOT NULL,
  stated_by   TEXT NOT NULL,    -- the member who stated it
  at          TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord, seq)
);

-- R2, R5 (DEC-113): A HOLD STATEMENT'S PROJECTS. For an in_place statement,
-- the projects it records: the place's own project (filled in by this module)
-- and each project the member named. For a released statement, the projects
-- it restarted (R5's restarted, computed in the release's transaction,
-- whatever the releasing member may see). Appended with its statement and
-- never rewritten.
CREATE TABLE IF NOT EXISTS action_hold_projects (
  bundle_id   TEXT NOT NULL,    -- the place's action or project
  ord         INTEGER NOT NULL, -- the place's entry, or -1
  seq         INTEGER NOT NULL, -- the statement (action_holds.seq)
  project     TEXT NOT NULL,    -- a project id
  PRIMARY KEY (bundle_id, ord, seq, project)
);

-- R11 (v0.2 rule 12): A MEMBER'S RECORD THAT SHE SENT THE HOLD NOTICE for the
-- hold at a place, held as the bytes sent or her account, never both and never
-- neither. It names no recipient and records no read, acknowledgement or
-- compliance of any member (v0.2 rule 10): there is no column for one.
CREATE TABLE IF NOT EXISTS hold_notices (
  bundle_id    TEXT NOT NULL,    -- the place's action or project
  ord          INTEGER NOT NULL, -- the place's entry, or -1
  seq          INTEGER NOT NULL, -- the record's place among that place's notices, from 1
  sent_on      TEXT NOT NULL,    -- the day she sent it, YYYY-MM-DD
  medium       TEXT,
  artifact_sha TEXT,             -- the bytes sent, a capture the register holds
  account      TEXT,             -- or her account of it
  recorded_by  TEXT NOT NULL,
  recorded_at  TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord, seq)
);

-- R12 (S1 C 16; v0.2 rule 12): PRESSURE THAT ARRIVED OUTSIDE ANY ACTION (a
-- letter, a post, a call), recorded in a project as evidence, held as a capture
-- or the member's account. Named <project>#pressure/<seq>; it creates no action.
CREATE TABLE IF NOT EXISTS pressure_records (
  bundle_id    TEXT NOT NULL,    -- the project
  seq          INTEGER NOT NULL, -- from 1 within the project
  kind         TEXT NOT NULL,    -- legal | retaliation | discrediting | other
  note         TEXT NOT NULL,
  arrived_on   TEXT NOT NULL,    -- the day it arrived, YYYY-MM-DD
  artifact_sha TEXT,
  account      TEXT,
  recorded_by  TEXT NOT NULL,
  recorded_at  TEXT NOT NULL,
  PRIMARY KEY (bundle_id, seq)
);
`;

/** The tables, each keyed by `bundle_id` (record-core R21, R46). */
export const ACTION_HOLDS_TABLES = Object.freeze(["action_pressure", "action_holds", "action_hold_projects",
  "hold_notices", "pressure_records"]);

/** Creates the tables, and R2's two `from` columns on a hold table created before them; idempotent. */
export function migrateActionHolds(sql) {
  const bare = ACTION_HOLDS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const cols = [...sql.exec(`PRAGMA table_info(action_holds)`)].map((r) => r.name);
  if (!cols.includes("from_kind")) sql.exec(`ALTER TABLE action_holds ADD COLUMN from_kind TEXT`);
  if (!cols.includes("from_ref")) sql.exec(`ALTER TABLE action_holds ADD COLUMN from_ref TEXT`);
}
