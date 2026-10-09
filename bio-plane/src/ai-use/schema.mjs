/* ai-use's tables (R7): the DDL this module owns. `AiUse#migrate` runs it at the module's first construction, idempotent.
 * SQL comments are `--` lines, dropped before the statements run. Every table is declared through record-core's
 * `declareTable` (its R21) as `AI_USE_TABLES` states: `export: "admin-only"`, `sight: "group"`, cleared by the
 * whole-store purge only, except that a project's limits, their history and its exploring asks are also deleted with
 * the project (keyed by `project_id`, record-core R46). */
export const AI_USE_SCHEMA = `
-- R1 (was ai-runs R48, R49; B8): THE USE COUNTER, one row per paying account ('owner': 'group', 'project:<id>',
-- 'member:<id>', or 'not recorded' for a row counted before T40), member, local day (civil-time's localDay in the
-- group's zone), kind of use ('use', a credentials USE_KINDS entry) and mode: the sums of each model call's figures
-- and a count of calls. It holds no question, answer, address or content. Cost is summed in millionths of a dollar so
-- the sum is exact. A figure not stated adds nothing and is counted in 'tokens_unstated' / 'cost_unstated', never as 0.
CREATE TABLE IF NOT EXISTS ai_usage (
  owner                        TEXT NOT NULL,
  member                       TEXT NOT NULL,
  day                          TEXT NOT NULL,
  use                          TEXT NOT NULL,
  mode                         TEXT NOT NULL,
  calls                        INTEGER NOT NULL DEFAULT 0,
  input_tokens                 INTEGER NOT NULL DEFAULT 0,
  output_tokens                INTEGER NOT NULL DEFAULT 0,
  cache_read_input_tokens      INTEGER NOT NULL DEFAULT 0,
  cache_creation_input_tokens  INTEGER NOT NULL DEFAULT 0,
  cost_micro_usd               INTEGER NOT NULL DEFAULT 0,
  tokens_unstated              INTEGER NOT NULL DEFAULT 0,
  cost_unstated                INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (owner, member, day, use, mode)
);
CREATE INDEX IF NOT EXISTS ai_usage_owner_day ON ai_usage(owner, day);

-- R10, R11 (D12): ONE ROW PER MEASURED ACT (a run, or an ask's or a draft's own act id), its sums as the counter's,
-- so a range can be estimated from an account's measured acts and an act's actual cost answered after. Numbers only.
CREATE TABLE IF NOT EXISTS ai_use_acts (
  owner                        TEXT NOT NULL,
  act                          TEXT NOT NULL,
  use                          TEXT NOT NULL,
  mode                         TEXT NOT NULL,
  calls                        INTEGER NOT NULL DEFAULT 0,
  tokens                       INTEGER NOT NULL DEFAULT 0,
  cost_micro_usd               INTEGER NOT NULL DEFAULT 0,
  tokens_unstated              INTEGER NOT NULL DEFAULT 0,
  cost_unstated                INTEGER NOT NULL DEFAULT 0,
  first_at                     TEXT NOT NULL,
  last_at                      TEXT NOT NULL,
  PRIMARY KEY (owner, act)
);
CREATE INDEX IF NOT EXISTS ai_use_acts_measure ON ai_use_acts(owner, use, mode, last_at);

-- R2 (D39; B4): THE LIMITS, at most one per owner, scope, unit and period. 'amount' is whole cents for 'usd', whole
-- tokens or calls otherwise. 'inclusive' is 1 or 0 for a use scope, NULL for 'overall' and 'per_member'. 'project_id'
-- names the project of a 'project:<id>' owner, so the project's purge deletes its limits (R7).
CREATE TABLE IF NOT EXISTS ai_limits (
  owner       TEXT NOT NULL,
  scope       TEXT NOT NULL,
  unit        TEXT NOT NULL,
  period      TEXT NOT NULL,
  amount      INTEGER NOT NULL,
  inclusive   INTEGER,
  project_id  TEXT,
  set_by      TEXT NOT NULL,
  set_at      TEXT NOT NULL,
  PRIMARY KEY (owner, scope, unit, period)
);

-- R2, R12: EVERY SET, appended, never replaced: 'change' is 'set' (a new limit), 'changed' or 'removed'.
CREATE TABLE IF NOT EXISTS ai_limit_history (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  owner       TEXT NOT NULL,
  scope       TEXT NOT NULL,
  unit        TEXT NOT NULL,
  period      TEXT NOT NULL,
  change      TEXT NOT NULL,
  amount      INTEGER,
  inclusive   INTEGER,
  project_id  TEXT,
  by          TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ai_limit_history_owner ON ai_limit_history(owner, seq);

-- R5 (B7): THE FIRST TIME EACH LIMIT WAS REACHED IN EACH OF ITS PERIODS, written when a count (R1) or a set (R2) finds
-- it reached, once, so owners are told once per account, limit and period.
CREATE TABLE IF NOT EXISTS ai_limit_reached (
  owner         TEXT NOT NULL,
  scope         TEXT NOT NULL,
  unit          TEXT NOT NULL,
  period        TEXT NOT NULL,
  period_start  TEXT NOT NULL,
  reached_at    TEXT NOT NULL,
  project_id    TEXT,
  PRIMARY KEY (owner, scope, unit, period, period_start)
);

-- R9 (A5, K2350): AT MOST ONE EXPLORING ASK AN OWNER AND LOCAL DAY, and its approval; silence means no.
CREATE TABLE IF NOT EXISTS ai_explore_asks (
  owner        TEXT NOT NULL,
  day          TEXT NOT NULL,
  what         TEXT,
  asked_at     TEXT,
  approved_by  TEXT,
  approved_at  TEXT,
  project_id   TEXT,
  PRIMARY KEY (owner, day)
);

-- R1, R2: the migrations this module has carried out, each once (today: the pre-T40 ceilings, B4).
CREATE TABLE IF NOT EXISTS ai_use_migrations (
  name  TEXT PRIMARY KEY,
  at    TEXT NOT NULL
);
`;

const CLASSES = Object.freeze({ purge: "clear", expunge: "none", export: "admin-only", sight: "group", derive: "stored",
  version_chain: false });

/* R7: each table's declaration. `keys: []` is cleared by the whole-store purge only; `keys: ["project_id"]` also by the
   purge of the project the row names. */
export const AI_USE_TABLES = Object.freeze([
  { name: "ai_usage", keys: [] },
  { name: "ai_use_acts", keys: [] },
  { name: "ai_use_migrations", keys: [] },
  { name: "ai_limits", keys: ["project_id"] },
  { name: "ai_limit_history", keys: ["project_id"] },
  { name: "ai_limit_reached", keys: ["project_id"] },
  { name: "ai_explore_asks", keys: ["project_id"] },
].map((t) => Object.freeze({ ...t, keys: Object.freeze([...t.keys]), ...CLASSES })));
