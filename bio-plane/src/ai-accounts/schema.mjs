/* ai-accounts' tables (R28): the DDL this module owns from T53 on, and the declarations of their classes. The account model
 * of R40 (an owner's plan at a provider, reached by one of five means, with an ordered allow-list of catalogue entries)
 * replaces the T48 copy's one table per kind of account; those tables (`account_references`, `group_key`,
 * `group_key_acts`, `group_key_notices`, `subscription_connections`, `project_accounts`, `project_account_acts`,
 * `project_key_notices`) are read once by `migrate` (R59) and dropped (`AI_ACCOUNTS_LEGACY_SCHEMA` is their DDL, for the
 * rows `migrate` converts, and for tests that need a store as T52 left it). The material limits (`ai_keep_away`,
 * `project_keep_away`) and the change history (`account_changes`) keep their tables. SQL comments are `--` lines,
 * dropped before the statements run. */
export const AI_ACCOUNTS_SCHEMA = `
-- R40, R2, R43, R44: one row per account. 'owner' is 'group', 'project:<id>' or 'member:<id>' (R14); 'project_id' the
-- project's id for a project's account, else NULL, so a project's rows are deleted with it (R28). 'entries' is the
-- ordered allow-list as a JSON array of catalogue entry ids (R46). THE SECRET IS STORED ONLY SEALED (R2): 'sealed' and
-- 'iv' hold it for the means 'sealed' and 'issued' (AES-256-GCM under a key derived from the seal secret with the
-- owner as salt; 'seal_owner' the owner it was sealed under when that is not 'owner', for a key sealed before T53 and
-- carried by migrate with its bytes unchanged (R59)); 'reference' holds a pointer's JSON for 'reference' (R43); 'gateway_id' names the gateway of a
-- 'gateway' account, whose key this module never holds (R44), 'route' how it arrived ('screen' or 'dashboard'). No
-- digest of a secret is kept. 'is_on' is the account's master switch (off when first set); 'held' whether a credential
-- is held now; 'refused_at' when a provider refused it; 'valid_until' what a sign-in's binary said its token lasts to.
-- 'flagged', 'flag_cause' and 'flagged_at' are R45's payer flag; 'share_flag' the one share flag the owner level
-- carries (R49); 'personal' whether the plan was a personal subscription when the account was set (R42, R48). The R14 switches are the use_* columns, 'standing', 'explore' and 'suggestions'. Never exported (R28).
CREATE TABLE IF NOT EXISTS ai_accounts (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id  TEXT NOT NULL UNIQUE,
  owner       TEXT NOT NULL,
  project_id  TEXT,
  provider    TEXT NOT NULL,
  plan        TEXT NOT NULL,
  means       TEXT NOT NULL,
  entries     TEXT NOT NULL,
  is_on       INTEGER NOT NULL DEFAULT 0,
  held        INTEGER NOT NULL DEFAULT 0,
  sealed      TEXT,
  iv          TEXT,
  seal_owner  TEXT,
  reference   TEXT,
  gateway_id  TEXT,
  route       TEXT,
  held_since  TEXT,
  refused_at  TEXT,
  valid_until TEXT,
  flagged     INTEGER NOT NULL DEFAULT 0,
  flag_cause  TEXT,
  flagged_at  TEXT,
  share_flag  INTEGER NOT NULL DEFAULT 0,
  personal    INTEGER NOT NULL DEFAULT 0,
  set_by      TEXT,
  set_at      TEXT NOT NULL,
  use_ask     INTEGER NOT NULL DEFAULT 1,
  use_draft   INTEGER NOT NULL DEFAULT 1,
  use_run     INTEGER NOT NULL DEFAULT 1,
  standing    INTEGER NOT NULL DEFAULT 0,
  suggestions INTEGER NOT NULL DEFAULT 0,
  explore     TEXT NOT NULL DEFAULT 'no',
  use_enquire    INTEGER NOT NULL DEFAULT 1,
  use_read       INTEGER NOT NULL DEFAULT 1,
  use_transcribe INTEGER NOT NULL DEFAULT 1,
  use_account    INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS ai_accounts_owner ON ai_accounts(owner, seq);
CREATE INDEX IF NOT EXISTS ai_accounts_project ON ai_accounts(project_id);

-- R41, R77: each owner's one ordered list of accounts, 'position' 1-based. An account of another owner is on a list only
-- by a placement: 'placed_by' (the door's stamp, NULL when placed before R77 or by the owner's own act on its own
-- account) and 'placed_at'. An account not on its owner's list serves no one.
CREATE TABLE IF NOT EXISTS ai_account_lists (
  owner      TEXT NOT NULL,
  project_id TEXT,
  account_id TEXT NOT NULL,
  position   INTEGER NOT NULL,
  placed_by  TEXT,
  placed_at  TEXT,
  PRIMARY KEY (owner, account_id)
);
CREATE INDEX IF NOT EXISTS ai_account_lists_account ON ai_account_lists(account_id);
CREATE INDEX IF NOT EXISTS ai_account_lists_project ON ai_account_lists(project_id);

-- R46: an owner's ceiling of entries for work at its level; a row with 'entries' NULL is no ceiling.
CREATE TABLE IF NOT EXISTS ai_offered (
  owner      TEXT PRIMARY KEY,
  project_id TEXT,
  entries    TEXT,
  set_by     TEXT,
  set_at     TEXT NOT NULL
);

-- R52, R53: the check ticks of each level ('group', 'project:<id>', 'member:<id>'), one row per (level, check), the
-- latest the setting.
CREATE TABLE IF NOT EXISTS ai_check_ticks (
  level      TEXT NOT NULL,
  project_id TEXT,
  check_id   TEXT NOT NULL,
  ticked     INTEGER NOT NULL,
  set_by     TEXT,
  set_at     TEXT NOT NULL,
  PRIMARY KEY (level, check_id)
);

-- R56: an owner's acceptance of a free-tier plan's warning, for one account, at one warning version.
CREATE TABLE IF NOT EXISTS ai_free_tier (
  account_id      TEXT PRIMARY KEY,
  plan            TEXT NOT NULL,
  warning_version TEXT NOT NULL,
  accepted_by     TEXT,
  accepted_at     TEXT NOT NULL
);

-- R47: who chose a personal subscription, when, which plan, at which terms version.
CREATE TABLE IF NOT EXISTS ai_personal_choices (
  account_id    TEXT PRIMARY KEY,
  member_id     TEXT NOT NULL,
  plan          TEXT NOT NULL,
  terms_version TEXT,
  chosen_at     TEXT NOT NULL
);

-- R51: the recipients (provider and host) whose notice a member has seen, by her own act.
CREATE TABLE IF NOT EXISTS ai_recipients_seen (
  member_id TEXT NOT NULL,
  provider  TEXT NOT NULL,
  host      TEXT NOT NULL,
  seen_at   TEXT NOT NULL,
  PRIMARY KEY (member_id, provider, host)
);

-- R20, R21 (DEC-172; K1957): the group's setting that keeps its material away from every assistant. Each set is
-- appended, never replacing an earlier one: 'is_on', the administrator's 'reason' in their own words (NULL when none
-- was given), who set it ('set_by', the administrator's id) and when. The latest row is the setting; with none it is
-- off. Read by every active member (R21); never a secret, so exported to administrators only, as 'bootstrap' is.
CREATE TABLE IF NOT EXISTS ai_keep_away (
  seq    INTEGER PRIMARY KEY AUTOINCREMENT,
  is_on  INTEGER NOT NULL,
  reason TEXT,
  set_by TEXT NOT NULL,
  set_at TEXT NOT NULL,
  -- R22 (T40): the JSON list of USE_KINDS the limit covers; NULL for every use
  uses   TEXT
);

-- R22 (D38 C; B3): a project's material limits, appended as R20's are, the latest the setting: 'uses' the JSON list
-- of USE_KINDS it covers, NULL for all. Deleted with its project.
CREATE TABLE IF NOT EXISTS project_keep_away (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  is_on      INTEGER NOT NULL,
  uses       TEXT,
  reason     TEXT,
  set_by     TEXT NOT NULL,
  set_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS project_keep_away_project ON project_keep_away(project_id, seq);

-- R16 (T41; DEC-188 (1)): every change to an account, in the order made, with who made it and when, never a secret or a
-- digest of one. 'owner' is spelled as R14's; 'project_id' the project's id for a project's account or list, else NULL,
-- so a project's rows are deleted with it and no other's are (R28). 'change' names the act ('account_set',
-- 'account_removed', 'switched', 'use_set', 'order_set', 'entries_set', 'offered_set', 'check_set', 'opt_in', 'limit_set',
-- 'free_tier', 'personal_choice', 'gateway_key', 'payer_flag', 'payer_cleared', 'list_left', 'list_left_project',
-- 'signin_ended', and the T48-T52 spellings 'key_set', 'signin_set', 'removed' carried from the old tables); 'detail' is
-- a JSON object of what it set. 'origin' names the earlier record a row was carried from ('<table>:<seq>'), so a record
-- is never carried twice; NULL for a change recorded here alone. Never exported.
CREATE TABLE IF NOT EXISTS account_changes (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  owner      TEXT NOT NULL,
  project_id TEXT,
  at         TEXT NOT NULL,
  by         TEXT,
  change     TEXT NOT NULL,
  detail     TEXT,
  origin     TEXT UNIQUE
);
CREATE INDEX IF NOT EXISTS account_changes_owner ON account_changes(owner, seq);
CREATE INDEX IF NOT EXISTS account_changes_project ON account_changes(project_id);
`;

/* The tables as T52 left them (R28: "read once by `migrate` (R59) and then dropped"). Not run at boot: `migrate` reads
   a legacy table only when the store has it, converts its rows and drops it once none is left. */
export const AI_ACCOUNTS_LEGACY_SCHEMA = `
CREATE TABLE IF NOT EXISTS account_references (
  member_id   TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  sealed      TEXT NOT NULL,
  iv          TEXT NOT NULL,
  set_at      TEXT NOT NULL,
  suggestions INTEGER NOT NULL DEFAULT 0,
  standing    INTEGER NOT NULL DEFAULT 0,
  use_ask     INTEGER NOT NULL DEFAULT 1,
  use_draft   INTEGER NOT NULL DEFAULT 1,
  use_run     INTEGER NOT NULL DEFAULT 1,
  explore     TEXT NOT NULL DEFAULT 'no',
  use_enquire    INTEGER NOT NULL DEFAULT 1,
  use_read       INTEGER NOT NULL DEFAULT 1,
  use_transcribe INTEGER NOT NULL DEFAULT 1,
  use_account    INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS group_key (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  sealed      TEXT,
  iv          TEXT,
  is_on       INTEGER NOT NULL DEFAULT 0,
  set_by      TEXT,
  set_at      TEXT,
  suggestions INTEGER NOT NULL DEFAULT 0,
  standing    INTEGER NOT NULL DEFAULT 0,
  use_ask     INTEGER NOT NULL DEFAULT 1,
  use_draft   INTEGER NOT NULL DEFAULT 1,
  use_run     INTEGER NOT NULL DEFAULT 1,
  explore     TEXT NOT NULL DEFAULT 'no',
  use_enquire    INTEGER NOT NULL DEFAULT 1,
  use_read       INTEGER NOT NULL DEFAULT 1,
  use_transcribe INTEGER NOT NULL DEFAULT 1,
  use_account    INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS group_key_acts (
  seq    INTEGER PRIMARY KEY AUTOINCREMENT,
  act    TEXT NOT NULL,
  detail TEXT,
  actor  TEXT NOT NULL,
  at     TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS group_key_notices (
  member_id TEXT PRIMARY KEY,
  seen_at   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS subscription_connections (
  member_id TEXT PRIMARY KEY,
  since     TEXT NOT NULL,
  use_ask     INTEGER NOT NULL DEFAULT 1,
  use_draft   INTEGER NOT NULL DEFAULT 1,
  use_run     INTEGER NOT NULL DEFAULT 1,
  standing    INTEGER NOT NULL DEFAULT 0,
  suggestions INTEGER NOT NULL DEFAULT 0,
  explore     TEXT NOT NULL DEFAULT 'no',
  use_enquire    INTEGER NOT NULL DEFAULT 1,
  use_read       INTEGER NOT NULL DEFAULT 1,
  use_transcribe INTEGER NOT NULL DEFAULT 1,
  use_account    INTEGER NOT NULL DEFAULT 1,
  sealed         TEXT,
  iv             TEXT,
  valid_until    TEXT,
  refused_at     TEXT
);
CREATE TABLE IF NOT EXISTS project_accounts (
  project_id  TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  sealed      TEXT,
  iv          TEXT,
  member_id   TEXT,
  is_on       INTEGER NOT NULL DEFAULT 0,
  set_by      TEXT NOT NULL,
  set_at      TEXT NOT NULL,
  use_ask     INTEGER NOT NULL DEFAULT 1,
  use_draft   INTEGER NOT NULL DEFAULT 1,
  use_run     INTEGER NOT NULL DEFAULT 1,
  standing    INTEGER NOT NULL DEFAULT 0,
  suggestions INTEGER NOT NULL DEFAULT 0,
  explore     TEXT NOT NULL DEFAULT 'no',
  use_enquire    INTEGER NOT NULL DEFAULT 1,
  use_read       INTEGER NOT NULL DEFAULT 1,
  use_transcribe INTEGER NOT NULL DEFAULT 1,
  use_account    INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS project_account_acts (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  act        TEXT NOT NULL,
  detail     TEXT,
  actor      TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS project_key_notices (
  member_id  TEXT NOT NULL,
  project_id TEXT NOT NULL,
  seen_at    TEXT NOT NULL,
  PRIMARY KEY (member_id, project_id)
);
`;

/* The legacy tables `migrate` reads and drops (R28, R59). */
export const AI_ACCOUNTS_LEGACY_TABLES = Object.freeze(["account_references", "group_key", "group_key_acts",
  "group_key_notices", "subscription_connections", "project_accounts", "project_account_acts", "project_key_notices"]);

/* Columns a store written before they existed gains at boot: additive and nullable, never back-filled (D-85). The
   material limit's `uses` (R22) is the only one the surviving tables ever gained. */
export const AI_ACCOUNTS_ADDITIVE_COLUMNS = [
  ["ai_keep_away", "uses", "TEXT"],
];

/* R28 (plan T33, Rules (6)): each table's classes for record-core's `declareTable` (its R21), declared explicitly. The
   group's and members' rows are purge-exempt (R29) and never expunged; a project's are deleted with the project
   (`purge: "clear"` keyed to the project's bundle by `project_id`, record-core R46), and the whole-store purge clears
   only the rows that name a project (`whole`). Nothing here is exported but the material limits, to administrators only,
   as R20's always were (R28); the accounts table, with its sealed secrets, never. */
const CLASSES = { purge: "exempt", expunge: "none", derive: "stored", version_chain: false };
const MIXED = { keys: Object.freeze(["project_id"]), whole: "project_id IS NOT NULL", purge: "clear", expunge: "none",
  derive: "stored", version_chain: false };

export const AI_ACCOUNTS_TABLES = Object.freeze([
  ["ai_keep_away", "admin-only", "group"], ["ai_recipients_seen", "never", "owner"],
  ["ai_personal_choices", "never", "owner"], ["ai_free_tier", "never", "group"],
].map(([name, exp, sight]) => Object.freeze({ name, ...CLASSES, export: exp, sight })));

/* R28: accounts, lists, offered sets and check ticks hold the rows of every owner; a project's are deleted with it. */
export const AI_ACCOUNTS_MIXED_TABLES = Object.freeze(["ai_accounts", "ai_account_lists", "ai_offered", "ai_check_ticks"]
  .map((name) => Object.freeze({ name, ...MIXED, export: "never", sight: "group" })));

/* R28, R16 (T41): the change history of every account, one table keyed by `owner`: exempt from purge for the group's and
   members' accounts, a project's rows deleted with their project. Never exported; read only through R16's service. */
export const AI_ACCOUNTS_HISTORY_TABLE = Object.freeze({ name: "account_changes", ...MIXED, export: "never",
  sight: "group" });

/* R28 (T40; N812): a project's material limits, deleted with its project, exported to administrators only. */
export const AI_ACCOUNTS_PROJECT_TABLES = Object.freeze([
  Object.freeze({ name: "project_keep_away", keys: Object.freeze(["project_id"]), ...CLASSES, purge: "clear",
    export: "admin-only", sight: "group" }),
]);
