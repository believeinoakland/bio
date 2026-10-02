/* network-notices' tables (requirements: `build/requirements/network-notices.md` R3, R5, R12–R17, R26).
 *
 * APPEND-ONLY (R26): a published revision, attestation or opening is never altered or deleted. Each table is declared
 * to record-core's purge with no bundle key, so only the whole-store purge clears it and a bundle purge leaves a
 * published notice standing. No row names a member (R25): a revision's signer is held by its key alone. Salts and
 * leaves (`nn_week_leaves`) and each seal's dummy secret are private until opened (R16): no read but an opening
 * serves them. */

export const NETWORK_NOTICES_SCHEMA = `
-- R3: A NOTICE: its opaque id, its project, when it was first published.
CREATE TABLE IF NOT EXISTS nn_notices (
  notice_id    TEXT PRIMARY KEY,
  project      TEXT NOT NULL,
  opened_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS nn_notices_project ON nn_notices (project, opened_at);
-- R5: EVERY REVISION, as signed: its canonical JSON, its digest, the armored signature and the signing key.
CREATE TABLE IF NOT EXISTS nn_revisions (
  notice_id    TEXT NOT NULL,
  revision     INTEGER NOT NULL,
  digest       TEXT NOT NULL UNIQUE,
  json         TEXT NOT NULL,
  status       TEXT NOT NULL,
  signature    TEXT NOT NULL,
  signer_key   TEXT NOT NULL,
  published_at TEXT NOT NULL,
  PRIMARY KEY (notice_id, revision)
);
-- R12, R13: EVERY ATTESTATION, signed with the copy's instance key. ref makes each kind once: the revision's digest
-- (posted), the month (monthly), case#edition (published), '' (closed, lapsed).
CREATE TABLE IF NOT EXISTS nn_attestations (
  seq          INTEGER PRIMARY KEY,
  notice_id    TEXT NOT NULL,
  kind         TEXT NOT NULL,
  ref          TEXT NOT NULL,
  as_of        TEXT NOT NULL,
  level        TEXT NOT NULL,
  status       TEXT NOT NULL,
  json         TEXT NOT NULL,
  digest       TEXT NOT NULL,
  signature    TEXT NOT NULL,
  key_id       TEXT NOT NULL,
  published_at TEXT NOT NULL,
  UNIQUE (notice_id, kind, ref)
);
-- R13: A MONTHLY ATTESTATION NOT ISSUED for want of a key, once per notice and month.
CREATE TABLE IF NOT EXISTS nn_misses (
  notice_id    TEXT NOT NULL,
  month        TEXT NOT NULL,
  at           TEXT NOT NULL,
  PRIMARY KEY (notice_id, month)
);
-- R14: A PROJECT'S WEEK SEAL: the root, its slot count, its private dummy secret, its slot in the week's tree.
CREATE TABLE IF NOT EXISTS nn_week_seals (
  project      TEXT NOT NULL,
  week         TEXT NOT NULL,
  seal         TEXT NOT NULL,
  size         INTEGER NOT NULL,
  secret       TEXT NOT NULL,
  position     INTEGER NOT NULL,
  PRIMARY KEY (project, week)
);
-- R14, R16: EACH ACT'S LEAF, private until opened: never its author.
CREATE TABLE IF NOT EXISTS nn_week_leaves (
  project      TEXT NOT NULL,
  week         TEXT NOT NULL,
  position     INTEGER NOT NULL,
  bundle_id    TEXT NOT NULL,
  digest       TEXT NOT NULL,
  operation    TEXT NOT NULL,
  at           TEXT NOT NULL,
  salt         TEXT NOT NULL,
  PRIMARY KEY (project, week, position)
);
-- R15: A WEEK, once sealed: the root over its project seals (null when it held none) and its one timestamp.
CREATE TABLE IF NOT EXISTS nn_week_roots (
  week         TEXT PRIMARY KEY,
  root         TEXT,
  size         INTEGER,
  secret       TEXT,
  response     TEXT,
  token_sha    TEXT,
  untimestamped INTEGER NOT NULL DEFAULT 0,
  attempts     TEXT,
  sealed_at    TEXT NOT NULL
);
-- R17: AN OPENING, once per (case, edition, week).
CREATE TABLE IF NOT EXISTS nn_openings (
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  week         TEXT NOT NULL,
  project      TEXT NOT NULL,
  json         TEXT NOT NULL,
  published_at TEXT NOT NULL,
  PRIMARY KEY (case_id, edition, week)
);
-- R17: A CASE EDITION openSeals was asked to open, retried until its weeks are sealed and its attestation issued.
CREATE TABLE IF NOT EXISTS nn_open_requests (
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  project      TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  settled_at   TEXT,
  PRIMARY KEY (case_id, edition)
);
`;

/** The tables, every one cleared by the whole-store purge only (R26). */
export const NETWORK_NOTICES_TABLES = Object.freeze(["nn_notices", "nn_revisions", "nn_attestations", "nn_misses",
  "nn_week_seals", "nn_week_leaves", "nn_week_roots", "nn_openings", "nn_open_requests"]);

/** Creates the tables; idempotent. T23's `nn_key_revocations` (the date this copy first saw a key revoked) is dropped:
 *  R21 now gives a revoked key's own `status_at` (credentials R21, N505), so nothing reads it, and it held no
 *  published row (R26). */
export function migrateNetworkNotices(sql) {
  const bare = NETWORK_NOTICES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  sql.exec(`DROP TABLE IF EXISTS nn_key_revocations`);
}
