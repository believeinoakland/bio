/* docket's tables (requirements: `build/requirements/docket.md` R1–R13, R16).
 *
 * ONE WAY (R16): a public entry is never altered or deleted, and a record entry or a mark is never rewritten; a later
 * entry or mark says what changed. Each table is declared to record-core's purge with no bundle key, so only the
 * whole-store purge clears it and a bundle purge leaves the docket standing. No public row names a member (R20): a
 * public entry's signer is held by its key alone. The record shelf's rows name the member who filed or marked, for the
 * group's own members only (R3). */

export const DOCKET_SCHEMA = `
-- R1: A RECORD ENTRY, as a member filed it. from_json is {kind, entity|grant|name}; answers the receipted record entry
-- a resent reply answers (R8), or null.
CREATE TABLE IF NOT EXISTS docket_record (
  rn           INTEGER PRIMARY KEY,
  entry_id     TEXT NOT NULL UNIQUE,
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  kind         TEXT NOT NULL,
  from_json    TEXT NOT NULL,
  capture_sha  TEXT NOT NULL,
  contests     INTEGER NOT NULL DEFAULT 0,
  proposed     TEXT NOT NULL,
  reason       TEXT NOT NULL,
  answers      TEXT,
  found_by     TEXT NOT NULL,
  author       TEXT NOT NULL,
  filed_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS docket_record_case ON docket_record (case_id, rn);
-- R2, R7, R11: A MARK ON A RECORD ENTRY: a pressure mark, a decline, or a take-back; each once per entry and kind.
CREATE TABLE IF NOT EXISTS docket_marks (
  rn           INTEGER PRIMARY KEY,
  entry_id     TEXT NOT NULL,
  kind         TEXT NOT NULL,
  pressure     TEXT,
  note         TEXT,
  reason       TEXT,
  by_member    TEXT NOT NULL,
  at           TEXT NOT NULL,
  UNIQUE (entry_id, kind)
);
-- R5, R6: A PUBLIC ENTRY, as signed: its canonical JSON, digest, armored signature and signing key; the record entry it
-- places or receipts; for a withdrawal, the editions it withdraws as fixed at its post (R12).
CREATE TABLE IF NOT EXISTS docket_entries (
  case_id      TEXT NOT NULL,
  seq          INTEGER NOT NULL,
  digest       TEXT NOT NULL UNIQUE,
  json         TEXT NOT NULL,
  kind         TEXT NOT NULL,
  shelf        TEXT NOT NULL,
  edition      TEXT NOT NULL,
  record_entry TEXT,
  editions     TEXT,
  signature    TEXT NOT NULL,
  signer_key   TEXT NOT NULL,
  published_at TEXT NOT NULL,
  PRIMARY KEY (case_id, seq)
);
CREATE INDEX IF NOT EXISTS docket_entries_record ON docket_entries (record_entry);
`;

/** The tables, every one cleared by the whole-store purge only (R16). */
export const DOCKET_TABLES = Object.freeze(["docket_record", "docket_marks", "docket_entries"]);

/** Creates the tables; idempotent. */
export function migrateDocket(sql) {
  const bare = DOCKET_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
