/* intent's tables (requirements: `build/requirements/intent.md`, R24). Aspirations and goals are record documents
 * (R26): their bundles, history and manifest are record-core's, and nothing about them is stored here. What is stored
 * here is what is not itself a document: a project's recorded departures from the group's aspirations (R10), and every
 * triage act on a proposal (R16), each an authored, dated row that is never updated or removed. No row stores a
 * progress figure, count, share or completion (R19). Each table carries the id it is about and is declared to
 * record-core's purge (K23). */

export const INTENT_SCHEMA = `
-- R10: a project's departure from a held group aspiration, with its reason. Appended, never updated: the latest row
-- for a (project, aspiration) is the one in force.
CREATE TABLE IF NOT EXISTS intent_departures (
  project_id     TEXT NOT NULL,
  aspiration_id  TEXT NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  seq            INTEGER PRIMARY KEY AUTOINCREMENT
);
CREATE INDEX IF NOT EXISTS intent_departures_project ON intent_departures(project_id, aspiration_id);
-- R16: each act on a proposal (adopt, question, defer, dismiss) with who took it, when and why. project_id is the
-- project it was triaged for (an adoption's, or the one named with it; R14 reads a goal's objectives through it);
-- inquiry_id the question a 'question' opened. Any row for a proposal key takes it off the open list.
CREATE TABLE IF NOT EXISTS intent_triage (
  proposal_key   TEXT NOT NULL,
  source         TEXT NOT NULL,
  kind           TEXT,
  act            TEXT NOT NULL,
  project_id     TEXT,
  inquiry_id     TEXT,
  reason         TEXT,
  grade          TEXT,
  basis_json     TEXT,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  seq            INTEGER PRIMARY KEY AUTOINCREMENT
);
CREATE INDEX IF NOT EXISTS intent_triage_key ON intent_triage(proposal_key);
`;

/** R24: the tables, as record-core's `declarePurge` takes them: a single-bundle purge clears the rows about that
 *  bundle, the whole-store form every row. */
export const INTENT_TABLES = Object.freeze([
  { name: "intent_departures", keys: ["project_id", "aspiration_id"] },
  { name: "intent_triage", keys: ["project_id", "inquiry_id"] },
]);

export function migrateIntent(sql) {
  const bare = INTENT_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
