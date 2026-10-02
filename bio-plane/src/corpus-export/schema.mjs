/* corpus-export's table (requirements: `build/requirements/corpus-export.md`; R1, R2, R4). Copied from `publication`'s
 * schema with its comment (K624 (1), seam map `build/extraction/corpus-export.md` §2). `export_log` is append-only and
 * exempt from purge (R4): an export once taken is never unrecorded. */

export const CORPUS_EXPORT_SCHEMA = `
-- Section 8.1: an export is recorded so it can never happen SILENTLY.
-- Append-only, like everything else here. In-app administrators cannot RUN
-- an export and must be able to SEE that one happened, because an export a
-- captured root of trust could take unnoticed would defeat the recording.
CREATE TABLE IF NOT EXISTS export_log (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  at      TEXT NOT NULL,
  scope   TEXT NOT NULL,
  bundles INTEGER NOT NULL,
  files   INTEGER NOT NULL,
  note    TEXT
);
`;

/** R4: the tables purge never clears. This module declares no other table. */
export const CORPUS_EXPORT_EXEMPT = Object.freeze(["export_log"]);

/** Creates the table; idempotent, every boot. `CREATE TABLE IF NOT EXISTS`, so a store's existing rows stay. */
export function migrateCorpusExport(sql) {
  const bare = CORPUS_EXPORT_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
