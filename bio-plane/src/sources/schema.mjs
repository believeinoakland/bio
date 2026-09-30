/* sources' tables (requirements: `build/requirements/sources.md`; K509 (1): new, nothing moved). A source's history is
 * append-only: an entry, a consent, a withdrawal and a read are each a row written once and never updated or removed
 * (DEC-78 item 5: a dated, attributed history, never one overwritten field). Every table is declared to record-core's
 * purge as exempt (R13): a source's history outlives any purge of the record. A value is held only in
 * `source_entries.value`, read only by the members `source_sight` lists (R5). The knocker secret is never held; only
 * the digest and pseudonym capture answers (capture R66). */

export const SOURCES_SCHEMA = `
-- R1: one row per source: one per pseudonym (knocker_digest and pseudonym set), one per knock sent without a secret
-- (both null, first_knock naming it). Minted on first read and kept.
CREATE TABLE IF NOT EXISTS sources (
  source_id      TEXT PRIMARY KEY,
  pseudonym      TEXT UNIQUE,
  knocker_digest TEXT,
  first_knock    TEXT NOT NULL,
  minted_at      TEXT NOT NULL
);
-- R1: each pulled knock a source stands behind, with the receipt the capture's own source names.
CREATE TABLE IF NOT EXISTS source_knocks (
  knock_id       TEXT PRIMARY KEY,
  source_id      TEXT NOT NULL,
  capture_sha    TEXT NOT NULL,
  bytes          INTEGER NOT NULL,
  received       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS source_knocks_capture ON source_knocks(capture_sha, received, knock_id);
-- R2–R4, R6: one disclosure, appended once. value is null for recorded = 0 (R4) and for a link (R6).
CREATE TABLE IF NOT EXISTS source_entries (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id       TEXT NOT NULL UNIQUE,
  source_id      TEXT NOT NULL,
  kind           TEXT NOT NULL,
  attribute      TEXT,
  value          TEXT,
  recorded       INTEGER NOT NULL,
  how            TEXT NOT NULL,
  known_to       TEXT NOT NULL,
  evidence_json  TEXT NOT NULL,
  claimed_by     TEXT,
  claimed_at     TEXT,
  confirms       TEXT,
  link_to        TEXT,
  basis          TEXT,
  by             TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS source_entries_source ON source_entries(source_id, seq);
CREATE INDEX IF NOT EXISTS source_entries_link ON source_entries(link_to, seq);
-- R5: who may read a stored value.
CREATE TABLE IF NOT EXISTS source_sight (
  entry_id       TEXT NOT NULL,
  member_id      TEXT NOT NULL,
  PRIMARY KEY (entry_id, member_id)
);
-- R7, R11: consents and withdrawals, in order. via is 'member' (R7) or 'secret' (R11).
CREATE TABLE IF NOT EXISTS source_consents (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id      TEXT NOT NULL,
  entry_id       TEXT NOT NULL,
  act            TEXT NOT NULL,
  audience       TEXT NOT NULL,
  evidence_json  TEXT,
  via            TEXT NOT NULL,
  by             TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS source_consents_entry ON source_consents(entry_id, seq);
-- R5: each read that answered a value.
CREATE TABLE IF NOT EXISTS source_reads (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id      TEXT NOT NULL,
  entry_id       TEXT NOT NULL,
  reader         TEXT NOT NULL,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS source_reads_source ON source_reads(source_id, seq);
`;

/** R13: every table, all exempt from purge. */
export const SOURCES_TABLES = Object.freeze(["sources", "source_knocks", "source_entries", "source_sight",
                                             "source_consents", "source_reads"]);

export function migrateSources(sql) {
  const bare = SOURCES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
