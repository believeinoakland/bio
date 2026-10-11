/* case-check's table (requirements: `build/requirements/case-check.md`, R1, R4). Working material: append-only, and
 * declared to record-core's purge so the whole-store form clears it with the unsigned preparations it names
 * (`publication` R29, R31), keeping the checks of an edition since ratified, which read `published` (R2). */

export const CASE_CHECK_SCHEMA = `
-- R1, R4: ONE ROW PER CHECK, NEVER REWRITTEN. A check is a preparation that passed every check publication makes, at
-- one instant, held unsigned by the project's choice with no limit (Actions D23). Whether it still stands is computed
-- at each read (R2), never stored: nothing here moves when the evidence does.
CREATE TABLE IF NOT EXISTS case_checks (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,  -- the order checks were made: the latest of an edition is the highest
  check_id    TEXT NOT NULL UNIQUE,               -- CHK-YYYY-DDDD, minted opaque (record-core mintOpaqueId)
  case_id     TEXT NOT NULL,
  edition     INTEGER NOT NULL,
  project_id  TEXT,                               -- the publishing project, for R2's fence and R3's filter
  doc_sha     TEXT NOT NULL,                      -- the stored preparation's, at the check
  members     TEXT NOT NULL,                      -- canonical JSON: [{bundle_id, version_sha, role}], the pins made
  member_rows TEXT NOT NULL,                      -- JSON {bundle_id: row_version} at the check (record-core R41: one
                                                  -- per commit), so a member moved and moved back still reads moved
  checked_at  TEXT NOT NULL,
  by          TEXT NOT NULL,                      -- the author stamp
  inputs_sha  TEXT NOT NULL                       -- SHA-256 of the act's own inputs (canonical JSON, stamps but the
                                                  -- author left out): what makes a later act a repeat (R1)
);
CREATE INDEX IF NOT EXISTS case_checks_edition ON case_checks(case_id, edition);
`;

/** R4: the whole-store purge clears a check while its case edition is not ratified, as publication clears the unsigned
 *  document (its `case_documents` declaration); a bundle purge names no check. */
export const CASE_CHECK_TABLES = Object.freeze([
  { name: "case_checks", keys: [],
    whole: "NOT EXISTS (SELECT 1 FROM published_cases p WHERE p.case_id = case_checks.case_id AND p.edition = case_checks.edition)" },
]);

/** Creates the table; idempotent. */
export function migrateCaseCheck(sql) {
  const bare = CASE_CHECK_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
