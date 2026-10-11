/* case-account's tables (requirements: `build/requirements/case-account.md`, R1–R4, R8, R12, R13): the system's drafts
 * of a case's account and the members' acceptances of them, copied from `case-authoring/schema.mjs` with the same DDL
 * (K624; N839), so a running store's drafts and acceptances are kept, with no data move. Every other table this module
 * reads is another module's read contract, named where it is read. */

export const CASE_ACCOUNT_SCHEMA = `
-- R1, R2 (D56): THE SYSTEM'S DRAFTS OF A CASE'S ACCOUNT. One row per proposal, append-only: nothing updates
-- or deletes a row but the whole-store purge. A draft is never the account; a member writes the account from
-- it, or from nothing, at op=publish (case-authoring R63, R69), and the published account is hers. kind is
-- run-rules R25's draft kind: case_account (text, in one framing) or account_check (flags, JSON [{ord, text,
-- cites}], the system's flags on a member's account, which case-disclosures R30 asks her to answer). run is
-- the AI run it came from; label is record-grammar's proposalLabel(proposed_by, kind) as it answered at the
-- proposal, as JSON, so a label already stored keeps the words it was stored with.
CREATE TABLE IF NOT EXISTS account_drafts (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id    TEXT NOT NULL UNIQUE,
  case_id     TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('case_account','account_check')),
  framing     TEXT,
  text        TEXT,
  flags       TEXT,
  run         TEXT NOT NULL,
  proposed_by TEXT,
  label       TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS account_drafts_case ON account_drafts(case_id, seq);

-- R4 (record-grammar R52): A MEMBER'S ACCEPTANCE OF AN ACCOUNT DRAFT, the one shape every accepting act
-- records (record, JSON {proposal, form, by, at, kind}), written inside the op=publish that prepared the
-- document naming the draft, so how often a draft is taken up edited or replaced is one count group-wide.
-- Append-only.
CREATE TABLE IF NOT EXISTS account_acceptances (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id   TEXT NOT NULL,
  edition   INTEGER NOT NULL,
  draft_id  TEXT NOT NULL,
  form      TEXT NOT NULL,
  record    TEXT NOT NULL,
  at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS account_acceptances_case ON account_acceptances(case_id, edition, seq);

-- R13 (T45; N861; Actions D11a; v0.2 rule 9): A MEMBER'S OWN TEXT AND ITS CHECK AGAINST THE RECORD, kept in her own
-- hidden project (project-roster R23's scope own) and nowhere else. One row per check, append-only: nothing updates or
-- deletes a row but the whole-store purge. sentences is the text as she brought it (JSON [{text, cites}]); result is
-- what the check answered per sentence (JSON [{ord, result, codes, findings}]). No column holds a signature, digest,
-- stamp or label: nothing here is usable as a mark outside, and no service offers a row to another module.
CREATE TABLE IF NOT EXISTS advocacy_checks (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  TEXT NOT NULL,
  author      TEXT NOT NULL,
  sentences   TEXT NOT NULL,
  result      TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS advocacy_checks_project ON advocacy_checks(project_id, seq);
`;

/** R8, R13: declared whole to record-core's purge (K23): a whole-store purge clears them, and no bundle keys them. The
 *  advocacy checks are working material, declared in R8's form. */
export const CASE_ACCOUNT_TABLES = Object.freeze([{ name: "account_drafts", keys: [] },
                                                  { name: "account_acceptances", keys: [] },
                                                  { name: "advocacy_checks", keys: [] }]);

/** R12: creates the tables where absent (`CREATE TABLE IF NOT EXISTS`, case-authoring's DDL), keeping every row a
 *  running store holds. Idempotent. */
export function migrateCaseAccount(sql) {
  const bare = CASE_ACCOUNT_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
