/* following's tables (requirements: `build/requirements/following.md`; R17, record-core R21). Each is declared with its
 * classes at start (`FOLLOWING_TABLES`). A follow is a member's act and is never edited: it is ended by another act
 * (R1's `unfollow`), and the per-meeting link is a chain whose last row governs. */

export const FOLLOWING_SCHEMA = `
-- R1, R7, R9, R10, R20: ONE ROW PER FOLLOW. subject is JSON ({kind, ...}); home the bundle whose project the follow
-- lives in and its captures land in (null: group-wide); gated JSON for R8 (null: public). A policy watch (R20) has
-- author '' (none: the group's standing watch, K1727).
CREATE TABLE IF NOT EXISTS follows (
  follow_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  kind        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  home        TEXT,
  author      TEXT NOT NULL,
  from_day    TEXT,
  until_day   TEXT,
  cadence     TEXT NOT NULL,
  gated       TEXT,
  at          TEXT NOT NULL,
  ended_at    TEXT,
  ended_by    TEXT,
  last_read   TEXT,
  last_outcome TEXT
);

-- R2, R3, R7–R10: the last capture taken at each address a follow reads (a read with the same bytes lands nothing).
CREATE TABLE IF NOT EXISTS follow_reads (
  follow_id   INTEGER NOT NULL,
  address     TEXT NOT NULL,
  capture_sha TEXT NOT NULL,
  bundle_id   TEXT,
  facts       TEXT,
  at          TEXT NOT NULL,
  PRIMARY KEY (follow_id, address)
);

-- R4, R5: the per-meeting link of a watched address (K1505 (15)); a later row replaces an earlier, none is edited.
CREATE TABLE IF NOT EXISTS per_meeting_links (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  address     TEXT NOT NULL,
  bundle_id   TEXT NOT NULL,
  body        TEXT,
  notice      TEXT,
  author      TEXT NOT NULL,
  at          TEXT NOT NULL
);

-- R4, R6: each per-meeting capture taken, keyed by the meeting's start instant, with the alarm's lateness.
CREATE TABLE IF NOT EXISTS per_meeting_captures (
  address     TEXT NOT NULL,
  meeting     TEXT NOT NULL,
  bundle_id   TEXT NOT NULL,
  due_at      TEXT NOT NULL,
  taken_at    TEXT NOT NULL,
  lateness_ms INTEGER NOT NULL,
  outcome     TEXT NOT NULL,
  PRIMARY KEY (address, meeting)
);

-- R10, R11: each portal snapshot, a vintage valid at its capture instant; rows the dataset's answer as read.
CREATE TABLE IF NOT EXISTS portal_snapshots (
  follow_id   INTEGER NOT NULL,
  seq         INTEGER NOT NULL,
  capture_sha TEXT NOT NULL,
  bundle_id   TEXT,
  at          TEXT NOT NULL,
  rows        TEXT,
  why         TEXT,
  PRIMARY KEY (follow_id, seq)
);

-- R20, R21: every version a policy watch has seen at its address, in the order seen: the policy's own text capture
-- first (seq 1, its receipt's first retrieval), then each read whose bytes differed from the one before. Never
-- edited or removed: a later version is a new row beside the earlier ones.
CREATE TABLE IF NOT EXISTS policy_versions (
  change_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  follow_id   INTEGER NOT NULL,
  seq         INTEGER NOT NULL,
  capture_sha TEXT NOT NULL,
  bundle_id   TEXT,
  at          TEXT NOT NULL,
  UNIQUE (follow_id, seq)
);`;

const t = (name, cls) => ({ name, purge: "clear", expunge: "none", export: "admin-only", derive: "stored", version_chain: false, ...cls });

/** R17: every table with its classes. A follow is seen as its home bundle is (`bundle`), the narrowest sight of its
 *  author's project; what a tick read is seen as the capture it cites (`source`). */
export const FOLLOWING_TABLES = Object.freeze([
  t("follows", { keys: ["home"], sight: "bundle", version_chain: true }),
  t("follow_reads", { keys: ["bundle_id"], sight: "source" }),
  t("per_meeting_links", { keys: ["bundle_id"], sight: "bundle", version_chain: true }),
  t("per_meeting_captures", { keys: ["bundle_id"], sight: "bundle" }),
  t("portal_snapshots", { keys: ["bundle_id"], sight: "source" }),
  t("policy_versions", { keys: ["bundle_id"], sight: "source" }),
]);

export function migrateFollowing(sql) {
  const bare = FOLLOWING_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
