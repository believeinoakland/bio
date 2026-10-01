/* action-plans' tables (requirements: `build/requirements/action-plans.md`, R2, R27). A plan is a record document of
 * its own type (`action_plan`, `PLN-`): its bundle, history and manifest are record-core's, and its document's Plan Log
 * is the record of every act on it. The tables below but two are that log's projections, written by the module's
 * registered promotion projection in the promotion's own transaction, so a read never parses the log. The two that are
 * not are written by this module directly: `plan_option_proposals` (R11, R31: a proposal is stored apart from the plan,
 * and any credential, a machine's included, may make one; adoption is recorded on it by the projection) and
 * `plan_runs` (R32: the project's `work_kinds` as they stood when a planning run opened). Every row names the plan it
 * is about and every table is declared to record-core's purge (R27). No row holds a cost, budget, amount, assignee,
 * hours or significance score (R26). */

export const ACTION_PLANS_SCHEMA = `
-- One row per plan: its project, title and state. Rewritten from the document at each promotion.
CREATE TABLE IF NOT EXISTS plans (
  plan_id       TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL,
  title         TEXT NOT NULL,
  state         TEXT NOT NULL,
  opened_by     TEXT NOT NULL,
  opened_at     TEXT NOT NULL,
  closed_by     TEXT,
  closed_at     TEXT,
  close_reason  TEXT,
  log_len       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS plans_project ON plans(project_id, state, plan_id);
CREATE INDEX IF NOT EXISTS plans_state ON plans(state, plan_id);
-- R1, R3, R4: each subject as added, in order; removed_seq marks its removal. skey is R3's identity of a subject.
CREATE TABLE IF NOT EXISTS plan_subjects (
  plan_id       TEXT NOT NULL,
  seq           INTEGER NOT NULL,
  ord           INTEGER NOT NULL,
  skey          TEXT NOT NULL,
  subject_json  TEXT NOT NULL,
  added_by      TEXT NOT NULL,
  added_at      TEXT NOT NULL,
  removed_seq   INTEGER,
  PRIMARY KEY (plan_id, seq, ord)
);
CREATE INDEX IF NOT EXISTS plan_subjects_key ON plan_subjects(skey, plan_id);
-- R9, R11, R13, R18: each option, its fields as last revised, its disposition and the action started from it.
CREATE TABLE IF NOT EXISTS plan_options (
  plan_id         TEXT NOT NULL,
  option_id       TEXT NOT NULL,
  ord             INTEGER NOT NULL,
  fields_json     TEXT NOT NULL,
  disposition     TEXT NOT NULL,
  reminders_json  TEXT,
  chosen_by       TEXT,
  proposal_id     TEXT,
  created_by      TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  action_id       TEXT,
  started_by      TEXT,
  started_at      TEXT,
  PRIMARY KEY (plan_id, option_id)
);
-- R9: every revision of an option, the first its addition; earlier revisions stay readable.
CREATE TABLE IF NOT EXISTS plan_option_revisions (
  plan_id      TEXT NOT NULL,
  option_id    TEXT NOT NULL,
  rev          INTEGER NOT NULL,
  seq          INTEGER NOT NULL,
  fields_json  TEXT NOT NULL,
  reason       TEXT,
  author       TEXT NOT NULL,
  at           TEXT NOT NULL,
  PRIMARY KEY (plan_id, option_id, rev)
);
-- R11, R31, R32, R34: proposals, stored apart from the options; never an option until a member adopts one.
CREATE TABLE IF NOT EXISTS plan_option_proposals (
  proposal_id     TEXT PRIMARY KEY,
  plan_id         TEXT NOT NULL,
  n               INTEGER NOT NULL,
  fields_json     TEXT NOT NULL,
  why             TEXT NOT NULL,
  proposer        TEXT NOT NULL,
  machine         INTEGER NOT NULL,
  run             TEXT,
  skill_version   TEXT,
  sources_json    TEXT,
  run_ord         INTEGER,
  at              TEXT NOT NULL,
  adopted_option  TEXT,
  adopted_by      TEXT,
  adopted_at      TEXT
);
CREATE INDEX IF NOT EXISTS plan_option_proposals_plan ON plan_option_proposals(plan_id, n);
CREATE INDEX IF NOT EXISTS plan_option_proposals_run ON plan_option_proposals(run, run_ord);
-- R14: every version of each scenario (1-3); the latest is in force.
CREATE TABLE IF NOT EXISTS plan_scenarios (
  plan_id      TEXT NOT NULL,
  scenario     INTEGER NOT NULL,
  version      INTEGER NOT NULL,
  seq          INTEGER NOT NULL,
  name         TEXT NOT NULL,
  phases_json  TEXT NOT NULL,
  author       TEXT NOT NULL,
  at           TEXT NOT NULL,
  PRIMARY KEY (plan_id, scenario, version)
);
-- R16: a member's judgement of a checkpoint of one scenario version's phase. Appended only.
CREATE TABLE IF NOT EXISTS plan_checkpoints (
  plan_id    TEXT NOT NULL,
  scenario   INTEGER NOT NULL,
  version    INTEGER NOT NULL,
  phase      TEXT NOT NULL,
  seq        INTEGER NOT NULL,
  judged     TEXT NOT NULL,
  note       TEXT,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL,
  PRIMARY KEY (plan_id, scenario, version, phase)
);
-- R6, R27: every act on the plan, oldest first, with who, when and why.
CREATE TABLE IF NOT EXISTS plan_history (
  plan_id     TEXT NOT NULL,
  seq         INTEGER NOT NULL,
  kind        TEXT NOT NULL,
  author      TEXT NOT NULL,
  at          TEXT NOT NULL,
  reason      TEXT,
  entry_json  TEXT NOT NULL,
  PRIMARY KEY (plan_id, seq)
);
-- R32, R34: each planning run of a plan, with the project's work_kinds as they stood when it opened.
CREATE TABLE IF NOT EXISTS plan_runs (
  run              TEXT PRIMARY KEY,
  plan_id          TEXT NOT NULL,
  project_id       TEXT,
  work_kinds_json  TEXT,
  opened_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS plan_runs_plan ON plan_runs(plan_id, opened_at);
`;

/** R27: the tables, as record-core's `declarePurge` takes them. A single-bundle purge of a plan clears its rows. */
export const ACTION_PLANS_TABLES = Object.freeze([
  { name: "plans", keys: ["plan_id"] },
  { name: "plan_subjects", keys: ["plan_id"] },
  { name: "plan_options", keys: ["plan_id"] },
  { name: "plan_option_revisions", keys: ["plan_id"] },
  { name: "plan_option_proposals", keys: ["plan_id"] },
  { name: "plan_scenarios", keys: ["plan_id"] },
  { name: "plan_checkpoints", keys: ["plan_id"] },
  { name: "plan_history", keys: ["plan_id"] },
  { name: "plan_runs", keys: ["plan_id"] },
]);

export function migrateActionPlans(sql) {
  const bare = ACTION_PLANS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
