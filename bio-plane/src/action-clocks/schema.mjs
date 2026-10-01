/* action-clocks' tables (requirements: `build/requirements/action-clocks.md`, R2, R4–R6, R9; K4, K617, K624).
 * `action_clock_proposals` is copied from `actions`' schema with its comment (R2 was `actions` R32); `actions`' copy is
 * gone (K914), so this module alone creates it and declares it to purge. `action_reminders` is new (R4–R6, K624 (3)).
 * Each is keyed by the action's `bundle_id` and declared to record-core's purge (K23). */

export const ACTION_CLOCKS_SCHEMA = `
-- R2: A CLOCK ENTRY COMPUTED FROM A PROFILE DEADLINE, STORED APART FROM
-- clock[]. A proposer's restatement of the same rule replaces its own row.
-- date is NULL when the computation is undetermined, and why says why. A
-- member states a clock entry by a revision of the action; nothing here is one.
CREATE TABLE IF NOT EXISTS action_clock_proposals (
  bundle_id   TEXT NOT NULL,   -- the action
  proposed_by TEXT NOT NULL,   -- the control plane's stamp
  rule        TEXT NOT NULL,   -- the profile deadline's rule
  date        TEXT,            -- YYYY-MM-DD, or NULL when undetermined
  basis       TEXT NOT NULL,   -- the rule's citation and its profile basis
  entry_json  TEXT NOT NULL,   -- the proposed {text, description, date, basis, status}
  why         TEXT,            -- why the date is undetermined, when it is
  proposed_at TEXT NOT NULL,
  PRIMARY KEY (bundle_id, proposed_by, rule)
);

-- R4-R6 (DEC-94, K624 (3)): A MEMBER'S REQUEST TO BE REMINDED of one dated
-- clock entry of an action on one day. The member's own record, never a field
-- or a revision of the action's document. A row is never deleted by an act: a
-- change or a removal stamps removed_at (and a change adds the new day's row),
-- an answer stamps answered_at. Standing = neither stamped.
CREATE TABLE IF NOT EXISTS action_reminders (
  rid         INTEGER PRIMARY KEY,
  bundle_id   TEXT NOT NULL,   -- the action
  entry       INTEGER NOT NULL,-- the clock entry's position in clock[]
  day         TEXT NOT NULL,   -- YYYY-MM-DD, the day the member asked for
  set_by      TEXT NOT NULL,   -- the member, as the control plane stamps them
  set_at      TEXT NOT NULL,
  answered_at TEXT,            -- when the member answered it (R6)
  removed_at  TEXT             -- when the member changed or removed it (R4)
);
CREATE INDEX IF NOT EXISTS action_reminders_due ON action_reminders(day, bundle_id, entry);
CREATE INDEX IF NOT EXISTS action_reminders_action ON action_reminders(bundle_id, entry, day, set_by);
`;

/** The tables, each keyed to the action by `bundle_id` (record-core R21, R46). */
export const ACTION_CLOCKS_TABLES = Object.freeze(["action_clock_proposals", "action_reminders"]);

/** Creates the tables; idempotent. */
export function migrateActionClocks(sql) {
  const bare = ACTION_CLOCKS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--"))
    .map((l) => l.replace(/\s--.*$/, "")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
