/* plan-work's tables (requirements: `build/requirements/plan-work.md`, R12). The work of managing a plan is held in this
 * module's own tables, never in the plan's document (`action-plans` keeps the plan itself). Every table is append-only:
 * a row is inserted and never updated or deleted (a later statement supersedes an earlier one on read, and the earlier
 * stays as history), and every table is declared to record-core's purge, keyed to the plan (or, for a take-up, the
 * record its item belongs to), so a single-bundle purge of either clears its rows (K23). No row holds a cost, hours,
 * assignee or score (R12). */

export const PLAN_WORK_SCHEMA = `
-- R1: each statement of a matter's intended outcome; the latest per matter is in force, the earlier its history.
CREATE TABLE IF NOT EXISTS pw_outcomes (
  plan_id       TEXT NOT NULL,
  skey          TEXT NOT NULL,
  seq           INTEGER NOT NULL,
  subject_json  TEXT NOT NULL,
  text          TEXT NOT NULL,
  author        TEXT NOT NULL,
  at            TEXT NOT NULL,
  PRIMARY KEY (plan_id, skey, seq)
);
-- R4: each statement of a member's review rhythm on a plan; recurrence_json NULL is its removal.
CREATE TABLE IF NOT EXISTS pw_rhythms (
  plan_id          TEXT NOT NULL,
  member           TEXT NOT NULL,
  seq              INTEGER NOT NULL,
  recurrence_json  TEXT,
  at               TEXT NOT NULL,
  PRIMARY KEY (plan_id, member, seq)
);
-- R4: each dated review entry.
CREATE TABLE IF NOT EXISTS pw_reviews (
  plan_id  TEXT NOT NULL,
  seq      INTEGER NOT NULL,
  decided  TEXT NOT NULL,
  author   TEXT NOT NULL,
  at       TEXT NOT NULL,
  PRIMARY KEY (plan_id, seq)
);
-- R5: each act on a preparation item: its addition, a take-up (by the author herself) and its being done.
CREATE TABLE IF NOT EXISTS pw_prep (
  plan_id    TEXT NOT NULL,
  seq        INTEGER NOT NULL,
  item       TEXT NOT NULL,
  act        TEXT NOT NULL,
  option_id  TEXT,
  text       TEXT,
  target     TEXT,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL,
  PRIMARY KEY (plan_id, seq)
);
-- R6: each comment, on an option, an action or a draft of the plan.
CREATE TABLE IF NOT EXISTS pw_comments (
  plan_id   TEXT NOT NULL,
  seq       INTEGER NOT NULL,
  on_kind   TEXT NOT NULL,
  on_id     TEXT NOT NULL,
  text      TEXT NOT NULL,
  author    TEXT NOT NULL,
  at        TEXT NOT NULL,
  PRIMARY KEY (plan_id, seq)
);
-- R8: each status report a member keeps with the plan.
CREATE TABLE IF NOT EXISTS pw_reports (
  plan_id    TEXT NOT NULL,
  seq        INTEGER NOT NULL,
  text       TEXT NOT NULL,
  from_json  TEXT,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL,
  PRIMARY KEY (plan_id, seq)
);
-- R11: each take-up of an item by the member herself; owner_id is the record the item belongs to.
CREATE TABLE IF NOT EXISTS pw_takeups (
  seq        INTEGER PRIMARY KEY,
  owner_id   TEXT NOT NULL,
  item_key   TEXT NOT NULL,
  item_json  TEXT NOT NULL,
  member     TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pw_takeups_member ON pw_takeups(member, seq);
-- R10: each re-examination a recorded response set off, per plan: the marks written and the run opened or refused.
CREATE TABLE IF NOT EXISTS pw_reexams (
  plan_id      TEXT NOT NULL,
  response     TEXT NOT NULL,
  at           TEXT NOT NULL,
  marks_json   TEXT NOT NULL,
  marked_json  TEXT,
  run          TEXT,
  run_json     TEXT,
  PRIMARY KEY (plan_id, response)
);
`;

/** R12: the tables, as record-core's `declarePurge` takes them. */
export const PLAN_WORK_TABLES = Object.freeze([
  { name: "pw_outcomes", keys: ["plan_id"] },
  { name: "pw_rhythms", keys: ["plan_id"] },
  { name: "pw_reviews", keys: ["plan_id"] },
  { name: "pw_prep", keys: ["plan_id"] },
  { name: "pw_comments", keys: ["plan_id"] },
  { name: "pw_reports", keys: ["plan_id"] },
  { name: "pw_takeups", keys: ["owner_id"] },
  { name: "pw_reexams", keys: ["plan_id"] },
]);

export function migratePlanWork(sql) {
  const bare = PLAN_WORK_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
