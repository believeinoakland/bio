/* publish-schedule's table (requirements: `build/requirements/publish-schedule.md` R1–R5, R10). Copied from
 * `publication/schema.mjs` at publication's third split (K624, K2438; N823; T41-37), the DDL and its comment unchanged
 * but for the ids, so a running store's rows are kept as they are (`CREATE TABLE IF NOT EXISTS`, no data move).
 * `scheduled_editions` holds a signed edition waiting to be published at a set time: working material until published
 * (`publication` R29), so purged by the whole-store form except a published row, which keeps when its edition was signed
 * (R5, R10), declared with the classes `publication` declared it with (R10).
 */

export const PUBLISH_SCHEDULE_SCHEMA = `
-- R1-R4 (DEC-147; K1790; publication R66-R69 before T41-37): A SIGNED CASE EDITION WAITING TO BE PUBLISHED AT A SET TIME. One row per setting, seq its
-- order; at most one row of a case edition is 'waiting' at a time. The signature is held HERE, beside the document and
-- never on it, so until the edition is published its document answers as an unsigned preparation (publication R29). at_date and
-- at_time are the local date and time as set, zone the group's zone they were read in, publish_at the instant they
-- resolve to (civil-time). checked is what the ceremony read at signing (ratification R41), compared by
-- the publisher at the time; moves every earlier time with who moved it and when (JSON list). state leaves 'waiting'
-- once: 'published' (outcome_at the commit's instant), 'stopped' (reasons, JSON) or 'cancelled' (cancelled_by).
-- signed_at is the instant of the signature at the ceremony (R5), copied to the published_cases row at the commit. A row that did not publish is working material and
-- purged with the unsigned document it holds a signature for; a published row keeps when its edition was signed.
CREATE TABLE IF NOT EXISTS scheduled_editions (
  seq          INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  doc_sha      TEXT NOT NULL,
  sig_armored  TEXT NOT NULL,
  signer       TEXT,
  delivered_by TEXT,
  signed_at    TEXT NOT NULL,
  at_date      TEXT NOT NULL,
  at_time      TEXT NOT NULL,
  zone         TEXT NOT NULL,
  publish_at   TEXT NOT NULL,
  set_by       TEXT,
  state        TEXT NOT NULL CHECK (state IN ('waiting','published','stopped','cancelled')),
  checked      TEXT,
  moves        TEXT NOT NULL DEFAULT '[]',
  outcome_at   TEXT,
  reasons      TEXT,
  cancelled_by TEXT
);
CREATE INDEX IF NOT EXISTS scheduled_editions_case ON scheduled_editions(case_id, edition);
CREATE INDEX IF NOT EXISTS scheduled_editions_due ON scheduled_editions(state, publish_at);
`;

/** R10: what purge clears, as `publication` declared it (R31 there before T41-37): a signed edition not (yet) published
 *  is working material (`publication` R29), cleared by the whole-store form with its unsigned document. */
export const PUBLISH_SCHEDULE_TABLES = Object.freeze([
  { name: "scheduled_editions", keys: [], whole: "state <> 'published'" },
]);

/* The classes record-core's default form gives (plan T33 Rules (6)), as `publication` gave this table: no expunge,
   export to administrators, stored, cleared, seen as the group (it is keyed to no bundle). */
const CLASSES = Object.freeze({ expunge: "none", export: "admin-only", derive: "stored", version_chain: false,
                                purge: "clear", sight: "group" });

/** R10: the table, declared with its classes to record-core's `declareTable`. */
export const PUBLISH_SCHEDULE_DECLARATIONS = Object.freeze(PUBLISH_SCHEDULE_TABLES.map((t) => Object.freeze({ ...t, ...CLASSES })));

/** Creates the table and its indexes; idempotent, every boot. */
export function migratePublishSchedule(sql) {
  const bare = PUBLISH_SCHEDULE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
