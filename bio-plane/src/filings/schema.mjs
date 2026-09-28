/* filings' tables (requirements: `build/requirements/filings.md`, R5–R7, R8–R14, R19). Every row is an act or a
 * proposal, written once and never edited (append-only, R19): a new draft, a new packet version, a new export, a new
 * proposal. Each is keyed to the action it is about and declared to record-core's purge (K23), so a purge of that
 * action clears its rows. */

export const FILINGS_SCHEMA = `
-- R5: A DRAFT, prepared from the record and stored apart from the action. One
-- row per preparation (preparing again is a new row). governing is the tier
-- answer as it read (the kind's, the action's, which governs); blanks and
-- unfilled the filled and unfilled blanks; basis what the draft read, so R6
-- can say what changed since (tier, counterparty, determination, laws).
CREATE TABLE IF NOT EXISTS filing_drafts (
  filing_id     TEXT PRIMARY KEY,
  action_id     TEXT NOT NULL,
  kind          TEXT NOT NULL,
  tier          INTEGER NOT NULL,
  governing     TEXT NOT NULL,
  text          TEXT NOT NULL,
  blanks        TEXT NOT NULL,
  unfilled      TEXT NOT NULL,
  advisory      TEXT,
  venue         TEXT,
  preparer      TEXT NOT NULL,
  prepared_at   TEXT NOT NULL,
  basis         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS filing_drafts_action ON filing_drafts (action_id, filing_id);
-- R6: A MEMBER'S APPROVAL, at most one per draft (the key). text is the
-- approved text, the member's (the draft's or an edited one); sha its SHA-256.
CREATE TABLE IF NOT EXISTS filing_approvals (
  filing_id     TEXT PRIMARY KEY,
  action_id     TEXT NOT NULL,
  text          TEXT NOT NULL,
  sha           TEXT NOT NULL,
  approved_by   TEXT NOT NULL,
  at            TEXT NOT NULL
);
-- R7: THE SENDING A MEMBER RECORDED, at most one per draft: the action's
-- correspondence entry (ord) it is, so the entry and the draft name each other.
CREATE TABLE IF NOT EXISTS filing_sendings (
  filing_id     TEXT PRIMARY KEY,
  action_id     TEXT NOT NULL,
  ord           INTEGER,
  sent_on       TEXT NOT NULL,
  medium        TEXT,
  artifact_sha  TEXT,
  account       TEXT,
  recorded_by   TEXT NOT NULL,
  recorded_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS filing_sendings_entry ON filing_sendings (action_id, ord);
-- R8–R12: A COUNSEL PACKET, one id per action, one row per version. sections
-- holds the six sections as assembled; basis what they drew on (determination,
-- each finding's edition, each standard), so R12 can flag a later change
-- without changing the version.
CREATE TABLE IF NOT EXISTS counsel_packets (
  packet_id     TEXT NOT NULL,
  version       INTEGER NOT NULL,
  action_id     TEXT NOT NULL,
  counsel       TEXT NOT NULL,
  author        TEXT NOT NULL,
  at            TEXT NOT NULL,
  sections      TEXT NOT NULL,
  basis         TEXT NOT NULL,
  PRIMARY KEY (packet_id, version)
);
CREATE INDEX IF NOT EXISTS counsel_packets_action ON counsel_packets (action_id, packet_id, version);
-- R11: WHO EXPORTED WHICH VERSION, when, for which counsel, and the digest of
-- the bytes handed over.
CREATE TABLE IF NOT EXISTS counsel_packet_exports (
  export_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id     TEXT NOT NULL,
  version       INTEGER NOT NULL,
  action_id     TEXT NOT NULL,
  author        TEXT NOT NULL,
  at            TEXT NOT NULL,
  counsel       TEXT NOT NULL,
  sha           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS counsel_packet_exports_packet ON counsel_packet_exports (packet_id, version);
-- R14: A CANDIDATE THEORY AND REMEDY, stored apart and labelled; never the
-- group's position.
CREATE TABLE IF NOT EXISTS theory_proposals (
  theory_id     TEXT PRIMARY KEY,
  action_id     TEXT NOT NULL,
  packet_id     TEXT,
  theory        TEXT NOT NULL,
  remedy        TEXT,
  standards     TEXT NOT NULL,
  why           TEXT NOT NULL,
  proposer      TEXT NOT NULL,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS theory_proposals_action ON theory_proposals (action_id, theory_id);
`;

/** K23, R19: each table keyed to the action it is about, so a single-bundle purge of that action clears its rows. */
export const FILINGS_TABLES = Object.freeze([
  { name: "filing_drafts", keys: ["action_id"] },
  { name: "filing_approvals", keys: ["action_id"] },
  { name: "filing_sendings", keys: ["action_id"] },
  { name: "counsel_packets", keys: ["action_id"] },
  { name: "counsel_packet_exports", keys: ["action_id"] },
  { name: "theory_proposals", keys: ["action_id"] },
]);

/** Creates the tables; idempotent. */
export function migrateFilings(sql) {
  const bare = FILINGS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
