/* reevaluation's tables (requirements: `build/requirements/reevaluation.md`, R14–R16, R18). The obligation itself is a
 * query and has no table (R18, P-64); these hold only what a member's act or the pushed notice writes. Each is keyed by
 * the bundle it is about and declared to record-core's purge (K23), so a purge of that bundle clears its rows. */

export const REEVALUATION_SCHEMA = `
-- R14 (REC-222): ONE NOTICE PER (holder, reference, newer capture). The holder
-- is the question whose basis leg names the passage; the reference is that leg
-- (its ord) and the content row it rests on; the newer capture is the version
-- of the passage's document the notice is about. The key is the uniqueness, so
-- a sweep that meets the same newer capture again raises nothing, and a yet
-- newer capture is a new row. grade and affects are content's passageNotice
-- grade as it read when the notice was raised; only affected and undetermined
-- are ever raised (A and B never are).
--
-- R15 (REC-223): the member's choice closes it, in place and once: state moves
-- from open to adopted or kept, with who, when and the optional why, and an
-- adoption names the version it wrote. Nothing reopens a closed notice.
CREATE TABLE IF NOT EXISTS reevaluation_notices (
  notice_id        TEXT PRIMARY KEY,
  holder           TEXT NOT NULL,
  ord              INTEGER NOT NULL,
  content_id       TEXT NOT NULL,
  target_id        TEXT NOT NULL,
  capture_sha      TEXT NOT NULL,
  newer_capture    TEXT NOT NULL,
  newer_bundle     TEXT,
  grade            TEXT,
  affects          TEXT NOT NULL,
  raised_at        TEXT NOT NULL,
  state            TEXT NOT NULL DEFAULT 'open',
  closed_by        TEXT,
  closed_at        TEXT,
  why              TEXT,
  adopted_version  TEXT,
  UNIQUE (holder, ord, content_id, newer_capture)
);
CREATE INDEX IF NOT EXISTS reevaluation_notices_holder ON reevaluation_notices (holder, state);
-- R16: A MEMBER'S RECORDED RE-EVALUATION. One row per act: the dependent that
-- was looked at again, the target and cause it answers, the cause's since as
-- it read when recorded, the note and who and when. A cause whose since is not
-- later than a recorded one's is closed for that dependent; the target moving
-- again (a later since) opens it again. Append-only.
CREATE TABLE IF NOT EXISTS reevaluation_records (
  record_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  dependent   TEXT NOT NULL,
  target      TEXT NOT NULL,
  source      TEXT NOT NULL,
  since       TEXT,
  note        TEXT NOT NULL,
  author      TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reevaluation_records_dependent ON reevaluation_records (dependent, target, source);
`;

/** K23: each table keyed to the bundle it is about, so a single-bundle purge clears its rows. */
export const REEVALUATION_TABLES = Object.freeze([
  { name: "reevaluation_notices", keys: ["holder"] },
  { name: "reevaluation_records", keys: ["dependent"] },
]);

/** Creates the tables; idempotent. */
export function migrateReevaluation(sql) {
  const bare = REEVALUATION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
