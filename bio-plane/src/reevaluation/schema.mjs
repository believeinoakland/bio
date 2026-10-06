/* reevaluation's tables (requirements: `build/requirements/reevaluation.md`, R14–R16, R18, R25, R26, R28, R29, R32, R34–R36). The obligation itself is a
 * query and has no table (R18, P-64); these hold only what a member's act or the pushed notice writes. Each is keyed by
 * the bundle it is about and declared to record-core's purge (K23), so a purge of that bundle clears its rows; the sweep's
 * position (R25) is about no bundle and is cleared by a whole-store purge only. */

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
-- R14's case half, R26 (N210): ONE NOTICE PER (case, cited part, pinned
-- capture, newer capture). A cited part is a document the edition cites, at
-- the capture it pinned (publication R41's capture_sha; K365), and the
-- newer capture is graded as the leg half grades a passage (the whole
-- document). owners is the JSON list of the owning project's owners read when
-- it was raised: they are the ones told, and nobody else is. ord is the part's
-- place in the edition's parts. keepVersion closes it; a new edition that
-- re-pins the part is publication's act, not this module's.
CREATE TABLE IF NOT EXISTS reevaluation_case_notices (
  notice_id        TEXT PRIMARY KEY,
  case_id          TEXT NOT NULL,
  edition          INTEGER,
  project          TEXT,
  ord              INTEGER NOT NULL,
  part             TEXT NOT NULL,
  capture_sha      TEXT NOT NULL,
  newer_capture    TEXT NOT NULL,
  newer_bundle     TEXT,
  grade            TEXT,
  affects          TEXT NOT NULL,
  owners           TEXT NOT NULL,
  raised_at        TEXT NOT NULL,
  state            TEXT NOT NULL DEFAULT 'open',
  closed_by        TEXT,
  closed_at        TEXT,
  why              TEXT,
  UNIQUE (case_id, part, capture_sha, newer_capture)
);
CREATE INDEX IF NOT EXISTS reevaluation_case_notices_case ON reevaluation_case_notices (case_id, state);
-- R28 (N364, K547): A RUNG MOVE HEARD FROM sources.onDisclosure (its R10), one
-- row per move whose rung changed: the source, the entry that moved it, the
-- rung before and after, and the instant this module heard it (the payload
-- carries none). It holds no value, secret or contact (sources R13). The
-- source cause is derived on read from these rows; sources' rungOf is never
-- called on a read. Append-only.
CREATE TABLE IF NOT EXISTS reevaluation_source_moves (
  move_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id    TEXT NOT NULL,
  entry_id     TEXT,
  rung_before  TEXT,
  rung_after   TEXT NOT NULL,
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reevaluation_source_moves_source ON reevaluation_source_moves (source_id, at);
-- R29 (DEC-102 item 2, K1019): A TESTIMONY'S CREDIT LEVEL MOVED, told by
-- ratification (its R36) when a ratified case edition states a level for an
-- observation other than the one in force at the case's previous ratified
-- edition: one row per call, the observation, the level before and after, the
-- case and edition, and the move's instant. It names no author and holds no
-- text. The attribution cause is derived on read from these rows. Append-only.
CREATE TABLE IF NOT EXISTS reevaluation_level_moves (
  move_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  observation  TEXT NOT NULL,
  level_before TEXT NOT NULL,
  level_after  TEXT NOT NULL,
  case_id      TEXT,
  edition      INTEGER,
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reevaluation_level_moves_observation ON reevaluation_level_moves (observation, at);
-- R32 (DEC-119 (3), N523): AN OFF-THE-RECORD CAPTURE'S ATTESTING MEMBER'S
-- CREDIT LEVEL MOVED, told by ratification (its R36) as R29's moves are: one
-- row per call, the capture (its sha-256), the level before and after, the
-- case and edition, and the move's instant. It names no member and holds no
-- text. The attribution cause on a leg targeting a document whose capture it
-- is is derived on read from these rows. Append-only.
CREATE TABLE IF NOT EXISTS reevaluation_capture_level_moves (
  move_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha  TEXT NOT NULL,
  level_before TEXT NOT NULL,
  level_after  TEXT NOT NULL,
  case_id      TEXT,
  edition      INTEGER,
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reevaluation_capture_level_moves_capture ON reevaluation_capture_level_moves (capture_sha, at);
-- R34 (B1a.11, K1470): AN EVENT'S CHANGE HEARD FROM events.onEventChanged
-- (its R16): one row per telling of when_moved or participant_re_resolved,
-- the event, which of the two changed, and the instant this module heard it
-- (the telling carries none). Kept only when some basis leg names the event,
-- or an ACT- id aliasing it, when it is told: a telling nothing rests on could
-- never raise a cause, since the cause needs the telling later than the
-- dependent's last write. No value is held. Append-only.
CREATE TABLE IF NOT EXISTS reevaluation_event_changes (
  change_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id     TEXT NOT NULL,
  change       TEXT NOT NULL,
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reevaluation_event_changes_event ON reevaluation_event_changes (event_id, at);
-- R35 (C:A-10): A CALCULATION'S INPUT CHANGE HEARD FROM
-- calculations.onInputChanged (its R11): one row per telling, the
-- calculation, the input that changed, and the instant this module heard it.
-- Kept only when some basis leg names the calculation, as R34's. No value is
-- held, and nothing is recomputed here. Append-only.
CREATE TABLE IF NOT EXISTS reevaluation_input_changes (
  change_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  calc_id      TEXT NOT NULL,
  input        TEXT,
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reevaluation_input_changes_calc ON reevaluation_input_changes (calc_id, at);
-- R25 (N178): WHERE THE NOTICE SWEEP'S PASS STANDS. One row (id 1): the cursor
-- of the pass part-way (after the last leg a batch read), when that pass began
-- and when the last complete one began, and the receipt mark: receipt_seq is
-- counted up by each receipt (provenance's onReceipt), and each pass keeps the
-- count it began at, so "a receipt since the last complete pass began" is one
-- comparison of two integers, never two instants in the same second. No
-- receipt's content is stored. Absent (never written, or purged whole) reads as
-- no pass yet complete and no receipt counted.
CREATE TABLE IF NOT EXISTS reevaluation_sweep (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  cursor           TEXT,
  pass_began       TEXT,
  pass_seq         INTEGER,
  complete_began   TEXT,
  complete_seq     INTEGER,
  receipt_seq      INTEGER NOT NULL DEFAULT 0
);
`;

/** K23: each table keyed to the bundle it is about, so a single-bundle purge clears its rows. */
export const REEVALUATION_TABLES = Object.freeze([
  { name: "reevaluation_notices", keys: ["holder"] },
  { name: "reevaluation_records", keys: ["dependent"] },
  /* R26: a case is no bundle, so a single-bundle purge never names one; a whole-store purge clears these. */
  { name: "reevaluation_case_notices", keys: [] },
  /* R28: a source is no bundle, so a single-bundle purge never names one; a whole-store purge clears these. */
  { name: "reevaluation_source_moves", keys: [] },
  /* R29: a level move is about the observation it names, a bundle, so a purge of that bundle clears its rows. */
  { name: "reevaluation_level_moves", keys: ["observation"] },
  /* R32: a capture is no bundle, so a single-bundle purge never names one; a whole-store purge clears these. */
  { name: "reevaluation_capture_level_moves", keys: [] },
  /* R34, R35: an event and a calculation are rows, not bundles, so only a whole-store purge clears these. */
  { name: "reevaluation_event_changes", keys: [] },
  { name: "reevaluation_input_changes", keys: [] },
  /* R25: the sweep's one position row is about no bundle, so only a whole-store purge clears it. */
  { name: "reevaluation_sweep", keys: [] },
]);

/** R36 (X73): the columns a notice raised across addresses adds to R14's notices, each added to a table created before
 *  it and never filled for a notice raised within one address: `newer_content` the content row of the passage at the new
 *  address (the reference adoptVersion re-pins to), `across` the standards, key, portion and relation that link the two
 *  addresses (JSON). */
const NOTICE_COLUMNS = Object.freeze([["newer_content", "TEXT"], ["across", "TEXT"]]);

/** Creates the tables; idempotent. */
export function migrateReevaluation(sql) {
  const bare = REEVALUATION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const have = new Set([...sql.exec(`PRAGMA table_info(reevaluation_notices)`)].map((c) => c.name));
  for (const [name, type] of NOTICE_COLUMNS)
    if (!have.has(name)) sql.exec(`ALTER TABLE reevaluation_notices ADD COLUMN ${name} ${type}`);
}
