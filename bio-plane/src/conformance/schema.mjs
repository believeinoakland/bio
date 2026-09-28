/* conformance's tables (requirements: `build/requirements/conformance.md`, R16). Every table is APPEND-ONLY: a
 * determination is never edited (R7), a supersession is a row of its own and never an update of the one it supersedes,
 * a basis-changed flag is a notice recorded once (R10), and a proposal is stored apart from determinations and never
 * turned into one (R12). Each is keyed to the bundle it is about and declared to record-core's purge (K23), so a purge
 * of that bundle clears its rows. */

export const CONFORMANCE_SCHEMA = `
-- R1, R7, R17: ONE ROW PER DETERMINATION. determination_id is the id of its
-- record object (a CONF- bundle promoted through promotion, R17). The act is
-- stored on the determination (K171 (6)): act_id is minted (ACT-) by the first
-- determination of an act and copied by every later one, with the act's parts
-- as the first determination recorded them. The project is the publishing
-- project's (the one whose case editions the findings are pinned in, R2).
-- proposal_id is the comparison it drew on, when it names one (R12).
CREATE TABLE IF NOT EXISTS determinations (
  determination_id  TEXT PRIMARY KEY,
  project_id        TEXT NOT NULL,
  act_id            TEXT NOT NULL,
  act_minted        INTEGER NOT NULL DEFAULT 0,
  act_description   TEXT NOT NULL,
  act_role          TEXT NOT NULL,
  act_body          TEXT NOT NULL,
  act_at            TEXT,
  act_from          TEXT,
  act_to            TEXT,
  act_evidence      TEXT NOT NULL,
  proposal_id       TEXT,
  supersedes        TEXT,
  reason            TEXT,
  author            TEXT NOT NULL,
  at                TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS determinations_project ON determinations (project_id, determination_id);
CREATE INDEX IF NOT EXISTS determinations_act ON determinations (act_id, determination_id);
-- R3, R4: ONE ROW PER STANDARD NAMED, with the member's outcome for it (never
-- one composed across standards) and what the standard read at the act's date
-- (in_force, or undetermined with why; not_in_force is refused).
CREATE TABLE IF NOT EXISTS determination_standards (
  determination_id  TEXT NOT NULL,
  ord               INTEGER NOT NULL,
  standard_id       TEXT NOT NULL,
  outcome           TEXT NOT NULL,
  in_force          TEXT NOT NULL,
  in_force_why      TEXT,
  PRIMARY KEY (determination_id, ord)
);
CREATE INDEX IF NOT EXISTS determination_standards_standard ON determination_standards (standard_id, determination_id);
-- R1: THE COMPARISON, one row per row the member stated: what the standard
-- requires, what was done, the reading (aligns, diverges, open) and the content
-- ids that show it.
CREATE TABLE IF NOT EXISTS determination_rows (
  determination_id  TEXT NOT NULL,
  ord               INTEGER NOT NULL,
  standard_id       TEXT NOT NULL,
  requires          TEXT NOT NULL,
  did               TEXT NOT NULL,
  reading           TEXT NOT NULL,
  content           TEXT NOT NULL,
  PRIMARY KEY (determination_id, ord)
);
-- R2: EACH FINDING PINNED, at the case edition and version it is published
-- in, with its frozen pair as that edition states it (publication R37).
CREATE TABLE IF NOT EXISTS determination_findings (
  determination_id  TEXT NOT NULL,
  ord               INTEGER NOT NULL,
  finding_id        TEXT NOT NULL,
  case_id           TEXT NOT NULL,
  edition           INTEGER NOT NULL,
  version_sha       TEXT,
  role              TEXT,
  frozen            TEXT,
  PRIMARY KEY (determination_id, ord)
);
CREATE INDEX IF NOT EXISTS determination_findings_finding ON determination_findings (finding_id, determination_id);
-- R6: THE OPEN QUESTIONS, each sent back to an inquiry: one the author named,
-- or one opened in the same act (opened = 1), in the determination's project.
CREATE TABLE IF NOT EXISTS determination_questions (
  determination_id  TEXT NOT NULL,
  ord               INTEGER NOT NULL,
  question          TEXT NOT NULL,
  inquiry_id        TEXT NOT NULL,
  opened            INTEGER NOT NULL DEFAULT 0,
  project_id        TEXT NOT NULL,
  PRIMARY KEY (determination_id, ord)
);
-- R7: A SUPERSESSION, one row, keyed by the determination superseded, so a
-- second is refused by the key as well as by the act (ALREADY_SUPERSEDED).
CREATE TABLE IF NOT EXISTS determination_supersessions (
  superseded        TEXT PRIMARY KEY,
  superseded_by     TEXT NOT NULL UNIQUE,
  reason            TEXT NOT NULL,
  author            TEXT NOT NULL,
  at                TEXT NOT NULL
);
-- R10: A BASIS-CHANGED NOTICE, as reevaluation told it (its R8): one row per
-- determination, kind, subject, source and since, never twice. The flag is a
-- notice: nothing in the determination changes.
CREATE TABLE IF NOT EXISTS determination_flags (
  determination_id  TEXT NOT NULL,
  kind              TEXT NOT NULL,
  subject           TEXT NOT NULL,
  source            TEXT NOT NULL,
  since             TEXT NOT NULL DEFAULT '',
  detail            TEXT,
  at                TEXT NOT NULL,
  PRIMARY KEY (determination_id, kind, subject, source, since)
);
-- R12: A COMPARISON PROPOSED, stored apart from determinations: who made it
-- (machine = 1 for machine work), the act, the standards named, the rows and
-- the questions, and never an outcome.
CREATE TABLE IF NOT EXISTS comparison_proposals (
  proposal_id       TEXT PRIMARY KEY,
  project_id        TEXT NOT NULL,
  act               TEXT NOT NULL,
  standards         TEXT NOT NULL,
  rows              TEXT NOT NULL,
  questions         TEXT NOT NULL,
  proposer          TEXT,
  machine           INTEGER NOT NULL DEFAULT 0,
  at                TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS comparison_proposals_project ON comparison_proposals (project_id, proposal_id);
-- R12: THE PROPOSAL RECORDS THAT A DETERMINATION DREW ON IT, one row each.
CREATE TABLE IF NOT EXISTS comparison_proposal_uses (
  proposal_id       TEXT NOT NULL,
  determination_id  TEXT NOT NULL,
  at                TEXT NOT NULL,
  PRIMARY KEY (proposal_id, determination_id)
);
`;

/** R16 (K23): each table keyed to the bundle it is about, so a single-bundle purge clears its rows. A determination's
 *  rows go with its own bundle; a project's purge takes its determinations' head rows and its proposals. */
export const CONFORMANCE_TABLES = Object.freeze([
  { name: "determinations", keys: ["determination_id", "project_id"] },
  { name: "determination_standards", keys: ["determination_id"] },
  { name: "determination_rows", keys: ["determination_id"] },
  { name: "determination_findings", keys: ["determination_id"] },
  { name: "determination_questions", keys: ["determination_id"] },
  { name: "determination_supersessions", keys: ["superseded", "superseded_by"] },
  { name: "determination_flags", keys: ["determination_id"] },
  { name: "comparison_proposals", keys: ["proposal_id", "project_id"] },
  { name: "comparison_proposal_uses", keys: ["proposal_id", "determination_id"] },
]);

/** Creates the tables; idempotent. */
export function migrateConformance(sql) {
  const bare = CONFORMANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
