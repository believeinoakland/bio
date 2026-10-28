/* mail-door's tables (R1, R3, R8, R9). `MailDoor#migrate` runs this DDL at the instance's creation, idempotently. No
 * table holds a clear address: a member's private address is kept as its keyed digest and the salt its local part is
 * derived from under the instance key (R1), and no member's own email address is a column anywhere (K5505, K5527 (1)).
 * SQL comments are `--` lines, dropped before the statements run. */
export const MAIL_DOOR_SCHEMA = `
-- R1: a member's private addresses. At most one live per member. 'salt' alone names no address: the local part is the
-- keyed digest of it under the instance key (mail_key), recomputed for its owner only. 'digest' is what the door matches.
CREATE TABLE IF NOT EXISTS mail_address (
  digest    TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  salt      TEXT NOT NULL,
  live      INTEGER NOT NULL DEFAULT 1,
  made      TEXT NOT NULL,
  off_at    TEXT
);
CREATE INDEX IF NOT EXISTS mail_address_member ON mail_address(member_id, live);

-- R3: the waiting list. One row per received message and owner; the raw bytes under bio/mail/<sha256>, outside the record.
-- 'headers' is mail-reader's answer as stated (R4); no sender is ever the actor or the source.
CREATE TABLE IF NOT EXISTS mail_waiting (
  mail_id     TEXT PRIMARY KEY,
  owner       TEXT NOT NULL,
  sha256      TEXT NOT NULL,
  bytes       INTEGER NOT NULL,
  received    TEXT NOT NULL,
  received_ms INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'waiting',
  headers     TEXT,
  automatic   INTEGER NOT NULL DEFAULT 0,
  capture_sha TEXT,
  brought_by  TEXT,
  brought_at  TEXT
);
CREATE INDEX IF NOT EXISTS mail_waiting_owner ON mail_waiting(owner, received_ms);
CREATE INDEX IF NOT EXISTS mail_waiting_due ON mail_waiting(status, received_ms);
CREATE INDEX IF NOT EXISTS mail_waiting_sha ON mail_waiting(sha256);

-- R8: the rate account, two buckets a window, over keys that hold no address in clear (a keyed digest of the address).
CREATE TABLE IF NOT EXISTS mail_rate (
  bucket TEXT PRIMARY KEY,
  count  INTEGER NOT NULL
);

-- R9: the count-only tally of mail turned away, one row per UTC day, 30 kept: two counters and a date, nothing else.
CREATE TABLE IF NOT EXISTS mail_tally (
  day          TEXT PRIMARY KEY,
  address      INTEGER NOT NULL DEFAULT 0,
  size_or_rate INTEGER NOT NULL DEFAULT 0
);

-- R1, R8: the instance key the address digests are taken under when the operator binds none (MAIL_ADDRESS_KEY). One row,
-- generated at first use, answered by no op.
CREATE TABLE IF NOT EXISTS mail_key (
  id      INTEGER PRIMARY KEY CHECK (id = 1),
  key_hex TEXT NOT NULL,
  created TEXT NOT NULL
)`;

/* R6 removes waiting rows itself; the whole-store purge clears none of these: operational facts about the instance's
   door (an address, a waiting message held outside the record, a rate, a tally, a key), not corpus-derived. */
export const MAIL_DOOR_EXEMPT_TABLES = Object.freeze(["mail_address", "mail_waiting", "mail_rate", "mail_tally", "mail_key"]);
