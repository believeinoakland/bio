/* money's tables (requirements: `build/requirements/money.md`, R19–R21). `money_facts` is the read contract of R19:
   `fact_id`, `amount` (the SIGNED exact decimal, the fact's sign applied; NULL for a range, whose signed bounds are
   `amount_low` and `amount_high`), `currency`, `kind`, `phase`, `stage`, `basis`, `period_from`, `period_to` (the
   period's bounds as stated, at `period_precision` in `period_zone`; `period_to` NULL when no end is stated), the
   parties' `from_entity`, `from_fund`, `to_entity`, `to_fund`, `sign`, and `source_capture_sha` (the capture the
   source extent is in, or the capture a source table was read from; NULL for a fact on a fact); `money_withdrawals`
   (`fact_id`) and `money_concerns` (`fact_id`, `concerns`, one row per id concerned) are part of it (K1563). Beside
   them, `withdrawn_at` is NULL while the fact stands.
   `sight_bundle` is the bundle whose sight the fact follows (R21): its source capture's, or its source fact's. Every
   child row carries it, so a bundle's purge reaches each table by its own column. No table holds a total (R20). */
export const MONEY_SCHEMA = `
CREATE TABLE IF NOT EXISTS money_facts (
  fact_id TEXT PRIMARY KEY,
  amount TEXT, amount_low TEXT, amount_high TEXT, sign TEXT NOT NULL, precision TEXT NOT NULL, as_read TEXT NOT NULL,
  currency TEXT NOT NULL, kind TEXT NOT NULL, phase TEXT NOT NULL, stage TEXT, adjusts TEXT, basis TEXT NOT NULL,
  period_from TEXT NOT NULL, period_to TEXT, period_precision TEXT NOT NULL, period_zone TEXT NOT NULL,
  period_start TEXT NOT NULL, period_end TEXT, period_key TEXT, period_body TEXT,
  from_entity TEXT, from_fund TEXT, from_account TEXT, from_as_written TEXT, from_identifier TEXT,
  to_entity TEXT, to_fund TEXT, to_account TEXT, to_as_written TEXT, to_identifier TEXT,
  balance_class TEXT, buys TEXT,
  source_capture_sha TEXT, source_extent TEXT, source_content_id TEXT, source_table TEXT, source_row TEXT, source_binding TEXT,
  source_fact TEXT,
  method TEXT NOT NULL, grade_reading TEXT, grade_basis TEXT,
  by TEXT, at TEXT NOT NULL, sight_bundle TEXT, withdrawn_at TEXT, projected_key TEXT
);
CREATE INDEX IF NOT EXISTS money_facts_from_entity ON money_facts (from_entity, period_start);
CREATE INDEX IF NOT EXISTS money_facts_to_entity ON money_facts (to_entity, period_start);
CREATE INDEX IF NOT EXISTS money_facts_from_fund ON money_facts (from_fund, period_start);
CREATE INDEX IF NOT EXISTS money_facts_to_fund ON money_facts (to_fund, period_start);
CREATE INDEX IF NOT EXISTS money_facts_adjusts ON money_facts (adjusts);
CREATE INDEX IF NOT EXISTS money_facts_source_fact ON money_facts (source_fact);
CREATE UNIQUE INDEX IF NOT EXISTS money_facts_projected ON money_facts (projected_key);
CREATE TABLE IF NOT EXISTS money_codes (
  fact_id TEXT NOT NULL, scheme TEXT NOT NULL, code TEXT NOT NULL, sight_bundle TEXT,
  PRIMARY KEY (fact_id, scheme, code)
);
CREATE TABLE IF NOT EXISTS money_concerns (
  fact_id TEXT NOT NULL, concerns TEXT NOT NULL, ref_kind TEXT NOT NULL, sight_bundle TEXT,
  PRIMARY KEY (fact_id, concerns)
);
CREATE INDEX IF NOT EXISTS money_concerns_ref ON money_concerns (concerns);
CREATE TABLE IF NOT EXISTS money_withdrawals (
  fact_id TEXT PRIMARY KEY, reason TEXT NOT NULL, by TEXT, at TEXT NOT NULL, sight_bundle TEXT
);
CREATE TABLE IF NOT EXISTS money_sets (
  set_id TEXT PRIMARY KEY, purpose TEXT NOT NULL, label TEXT NOT NULL, concerns TEXT, by TEXT, at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS money_set_acts (
  act_id INTEGER PRIMARY KEY AUTOINCREMENT, set_id TEXT NOT NULL, fact_id TEXT NOT NULL, act TEXT NOT NULL,
  reason TEXT NOT NULL, by TEXT, at TEXT NOT NULL, proposal_id INTEGER
);
CREATE INDEX IF NOT EXISTS money_set_acts_set ON money_set_acts (set_id, fact_id, act_id);
CREATE TABLE IF NOT EXISTS money_set_proposals (
  proposal_id INTEGER PRIMARY KEY AUTOINCREMENT, set_id TEXT NOT NULL, fact_id TEXT NOT NULL, method TEXT NOT NULL,
  by TEXT, at TEXT NOT NULL, adopted_act INTEGER
);
CREATE TABLE IF NOT EXISTS money_fund_types (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, fund TEXT NOT NULL, fund_type TEXT NOT NULL, basis TEXT NOT NULL,
  by TEXT, at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS money_fund_types_fund ON money_fund_types (fund, seq);
`;

/** R21: the tables, in purge order (children before the facts they name). */
export const MONEY_TABLES = Object.freeze(["money_set_proposals", "money_set_acts", "money_sets", "money_withdrawals",
  "money_concerns", "money_codes", "money_facts", "money_fund_types"]);
