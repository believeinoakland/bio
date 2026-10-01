/* local-facts' table (requirements: `build/requirements/local-facts.md`, R5). One row per member's act on a profile
 * fact, written once and never updated or removed: the status is read from the acts in the order written (`seq`).
 * The table names no bundle, so record-core's single-bundle purge leaves it and the whole-store purge clears it (K23). */

export const LOCAL_FACTS_SCHEMA = `
-- R1, R5: a member's confirm, correct or dispute of the fact at path. value_json is the value the act is about: for a
-- confirm, the value that governed when it was made; for a correct, the corrected value; for a dispute, the value
-- disputed. source is a correction's source, else NULL.
CREATE TABLE IF NOT EXISTS local_fact_acts (
  seq           INTEGER PRIMARY KEY AUTOINCREMENT,
  path          TEXT NOT NULL,
  profile       TEXT NOT NULL,
  act           TEXT NOT NULL,
  how           TEXT NOT NULL,
  value_json    TEXT,
  source        TEXT,
  by_member     TEXT NOT NULL,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS local_fact_acts_path ON local_fact_acts(path, seq);
`;

/** R5: the table, as record-core's `declarePurge` takes it (no bundle key: only the whole-store form clears it). */
export const LOCAL_FACTS_TABLES = Object.freeze([{ name: "local_fact_acts", keys: [] }]);

export function migrateLocalFacts(sql) {
  const bare = LOCAL_FACTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
