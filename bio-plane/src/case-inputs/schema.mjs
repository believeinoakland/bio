/* case-inputs' tables (requirements: `build/requirements/case-inputs.md`, R2, R6, R9, R11, R16): the statement's
 * acknowledgements, the drafts of an edition's statement of what changed, and the outcomes carried into a case's next
 * edition with their withdrawals. Copied from `case-authoring`'s `schema.mjs` with the DDL unchanged (K624; N908), so a
 * running store's rows are kept with no data move; `case-authoring` deletes its copy (T47-32). Every other table this
 * module reads is `publication`'s (its R40) or `review`'s `case_drafts` (its R26), each under its read contract. */

export const CASE_INPUTS_SCHEMA = `
-- D-150 / BIO_Publication_v0_1.md section 3 rule 11: THE EXCLUSION STATEMENT'S ACKNOWLEDGEMENTS.
-- One row per act: a SECOND person's reading of ONE statement text, by a joined participant of the
-- producing project (acknowledger = the member id) or a review-copy recipient through a live grant
-- (acknowledger = the grant id, recipient = the grant's label). statement_sha is the SHA-256 of the
-- statement as the case document prints it, so an edited statement is a different sentence and its
-- old acknowledgements match nothing. case_id and edition are the case identity the statement stood
-- at: a draft's, read from the published record (case_id NULL for a new case), or an unsigned case
-- document's. op=publish lists the matching rows in the signed completeness block, or states that
-- nobody but the author acknowledged it; nothing reads this table as a gate. Working data: a
-- whole-store purge clears it, and a signed document keeps its own list in its signed bytes.
CREATE TABLE IF NOT EXISTS statement_acknowledgements (
  ack_id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id        TEXT NOT NULL,
  case_id           TEXT,
  edition           INTEGER NOT NULL,
  statement_sha     TEXT NOT NULL,
  draft_id          TEXT,               -- the draft read, when acknowledged through one
  acknowledger_kind TEXT NOT NULL CHECK (acknowledger_kind IN ('participant','recipient')),
  acknowledger      TEXT NOT NULL,
  recipient         TEXT,               -- the grant's addressee label, for a recipient
  at                TEXT NOT NULL,
  reason            TEXT                -- R1 (DEC-88): the acknowledger's words, NULL on a row recorded before them
);
CREATE INDEX IF NOT EXISTS statement_acknowledgements_statement
  ON statement_acknowledgements(project_id, statement_sha, edition);

-- R6 (was case-authoring R39; DEC-101 (1)): DRAFTS OF A NEW EDITION'S STATEMENT OF WHAT CHANGED, AND WHY. One row per proposal,
-- append-only: nothing updates or deletes a row but the whole-store purge. A draft is never a statement;
-- it becomes one only when a member adopts or rewrites it at op=publish (case-authoring R38), which records the draft it
-- began as and whether its words were kept. label is record-grammar's proposalLabel(proposed_by,
-- "edition_statement") as it answered at the proposal, as JSON, so a machine's draft is labelled machine
-- work wherever it is listed.
CREATE TABLE IF NOT EXISTS what_changed_drafts (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id    TEXT NOT NULL UNIQUE,
  case_id     TEXT NOT NULL,
  text        TEXT NOT NULL,
  proposed_by TEXT,
  label       TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS what_changed_drafts_case ON what_changed_drafts(case_id, seq);

-- R9 (was case-authoring R71; T45; N855 (6c); Actions D5, D6c): OUTCOMES CARRIED INTO A CASE'S NEXT EDITION, by a member's act, one row per
-- act, append-only. kind is success, cure or harm_addressed; text the member's statement; cites the JSON list of
-- case-account R5's cites; on_date the date the outcome occurred. No column marks one carried: an outcome is pending
-- until a ratified edition's signed document holds it (publication R40's case_documents), so a replaced preparation
-- carries it again. Working material: the whole-store purge clears it; a carried one lives on in the signed document.
CREATE TABLE IF NOT EXISTS carried_outcomes (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  outcome_id TEXT NOT NULL UNIQUE,
  case_id    TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('success','cure','harm_addressed')),
  text       TEXT NOT NULL,
  cites      TEXT NOT NULL,
  on_date    TEXT NOT NULL,
  carried_by TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS carried_outcomes_case ON carried_outcomes(case_id, seq);

-- R9: a pending outcome's withdrawal, with the member's reason, one row per act, append-only.
CREATE TABLE IF NOT EXISTS carried_outcome_withdrawals (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  outcome_id TEXT NOT NULL UNIQUE,
  reason     TEXT NOT NULL,
  by         TEXT NOT NULL,
  at         TEXT NOT NULL
);
`;

/** R11 (was case-authoring R28, R71's purge clause): declared whole to record-core's purge (K23) as working material: a
 *  whole-store purge clears them, and no bundle keys them. */
export const CASE_INPUTS_TABLES = Object.freeze([{ name: "statement_acknowledgements", keys: [] },
                                                    { name: "what_changed_drafts", keys: [] },
                                                    /* R9: R11's form */
                                                    { name: "carried_outcomes", keys: [] },
                                                    { name: "carried_outcome_withdrawals", keys: [] }]);

/** Creates the table where absent, and adds R1's `reason` column (DEC-88) to a table created before it, never filling
 *  it: an acknowledgement recorded before the acknowledger's words were asked for carries none (K1050). Idempotent. */
export function migrateCaseInputs(sql) {
  const bare = CASE_INPUTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const cols = [...sql.exec(`PRAGMA table_info(statement_acknowledgements)`)].map((c) => c.name);
  if (!cols.includes("reason")) sql.exec(`ALTER TABLE statement_acknowledgements ADD COLUMN reason TEXT`);
}
