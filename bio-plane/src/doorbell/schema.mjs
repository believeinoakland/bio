/* doorbell's tables (K4; R25): the DDL `capture` created them by, copied unchanged (`CREATE TABLE IF NOT EXISTS`), so a
 * running store's inbox, keys and tally are kept as they are, with no data move (`build/extraction/capture-split.md`
 * §2). `Doorbell#migrate` runs it at the instance's creation. SQL comments are `--` lines, dropped before the
 * statements run. */
export const DOORBELL_SCHEMA = `
-- The knock: quarantined public intake. Payload bytes live in R2 under
-- <store>/inbox/<sha256> when R2 is configured, else inline here (small
-- only). Nothing reads this table except member review; nothing here
-- touches the record until a member pulls it through the gate.
CREATE TABLE IF NOT EXISTS inbox (
  knock_id    TEXT PRIMARY KEY,
  sha256      TEXT NOT NULL,
  bytes       INTEGER NOT NULL,
  content     TEXT,
  in_r2       INTEGER NOT NULL DEFAULT 0,
  note        TEXT,
  contact     TEXT,
  received    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',
  resolved    TEXT,
  resolved_by TEXT,
  -- R3 (DEC-88 (2)): the member's own reason for the last status change, beside who (resolved_by) and when (resolved).
  resolve_reason TEXT,
  -- R14: the knocker's continuity, never the secret: a keyed digest of it and the pseudonym derived from that
  -- digest, each NULL for a knock sent without a secret.
  knocker_digest TEXT,
  pseudonym   TEXT,
  -- R13: the capture a pull filed, who pulled it and when. Set once, by the pull; NULL until then.
  capture_sha TEXT,
  pulled_by   TEXT,
  pulled_at   TEXT,
  pulled_document TEXT,
  -- Inline knocks only (no evidence store): the bytes themselves, base64, so a pull holds exactly what was
  -- received; content keeps the text a member reads. NULL with an evidence store, and on a row written before it.
  content_b64 TEXT
);
CREATE INDEX IF NOT EXISTS inbox_status ON inbox(status);

-- The doorbell's rate account (R2): one count per window bucket, the source's (a keyed fingerprint, R12) and the
-- instance's. The estimate weights the previous window's bucket by how much of it is still inside the trailing
-- window, so each accepted knock prunes every bucket but the current and the previous one.
CREATE TABLE IF NOT EXISTS knock_rate (
  bucket TEXT PRIMARY KEY,
  count  INTEGER NOT NULL
);

-- R14: the key the knocker's secret is digested under when the operator binds none (KNOCKER_SECRET_KEY): R12's
-- pattern, a separate key. One row, generated at first use, never answered by any op.
CREATE TABLE IF NOT EXISTS knocker_key (
  id      INTEGER PRIMARY KEY CHECK (id = 1),
  key_hex TEXT NOT NULL,
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inbox_pseudonym ON inbox(pseudonym, received);
CREATE INDEX IF NOT EXISTS inbox_capture ON inbox(capture_sha, received);

-- R19 (DEC-108 (6), BOB's privacy ruling): the doorbell's count-only tally of the knocks it turned away. One row per
-- UTC day, the last 30 kept: how many were refused, and how many of those found the whole-doorbell limit reached.
-- No address, fingerprint, time of a knock, digest, pseudonym, note, contact or content: two counters and a date.
CREATE TABLE IF NOT EXISTS doorbell_tally (
  day           TEXT PRIMARY KEY,
  refused       INTEGER NOT NULL DEFAULT 0,
  limit_reached INTEGER NOT NULL DEFAULT 0
);
-- R19: the day the whole-doorbell limit was last reached, a date only. One row.
CREATE TABLE IF NOT EXISTS doorbell_limit_last (
  id  INTEGER PRIMARY KEY CHECK (id = 1),
  day TEXT NOT NULL
);

-- R12: the key the doorbell's source fingerprint is computed under when the operator binds none
-- (KNOCK_FINGERPRINT_KEY). One row, generated at first use, never answered by any op.
CREATE TABLE IF NOT EXISTS knock_key (
  id      INTEGER PRIMARY KEY CHECK (id = 1),
  key_hex TEXT NOT NULL,
  created TEXT NOT NULL
)`;

/* The columns an older store's `inbox` gained after it was first written, added before the schema runs (never
   back-filled; each reason is where the column is read), as `capture` added them. */
export const DOORBELL_ADDITIVE_COLUMNS = [
  ["inbox", "knocker_digest", "TEXT"],               // R14: the knocker's keyed digest
  ["inbox", "pseudonym", "TEXT"],                    // R14
  ["inbox", "capture_sha", "TEXT"],                  // R13: the capture a pull filed
  ["inbox", "pulled_by", "TEXT"],                    // R13
  ["inbox", "pulled_at", "TEXT"],                    // R13
  ["inbox", "pulled_document", "TEXT"],              // R13: the document a pull answered, answered again to a repeat
  ["inbox", "content_b64", "TEXT"],                  // R13: an inline knock's bytes as received
  ["inbox", "resolve_reason", "TEXT"],               // R3 (DEC-88): the member's reason for a status change
];

/* R25 (record-core R21): the six tables, every one exempt from purge: operational facts about this instance (the inbox,
   the rate, the tally (R19) and the two keys, R12, R14), not corpus-derived. None is cleared by the whole-store purge. */
export const DOORBELL_EXEMPT_TABLES = Object.freeze(["inbox", "knock_rate", "knock_key", "knocker_key", "doorbell_tally",
  "doorbell_limit_last"]);
