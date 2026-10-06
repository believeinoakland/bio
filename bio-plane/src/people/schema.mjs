/* people's tables (R33), created by `migrate` (index.mjs) at every boot, idempotently, and declared to record-core with
   their classes (its R21). No table here holds a score, rank, suspicion or "conflict" field on a person or entity
   (R29), and none holds a post, membership, credential, interest, statement or amount (R30): those are read from their
   owners. Every row is appended and corrected forward (withdrawn with who, when and why); only `expunge` (R12) removes
   one, through record-core's tombstone (its R79). */
export const PEOPLE_SCHEMA = `
-- IDENTITY CLAIMS (R1-R6; K1488): one claim that two person records are, are not, or may be the same person. A claim
-- LINKS and never merges (R28): the two entity ids stay two. grade is earned from basis at the write (R2), never the
-- caller's; why is Civicsmith's sentence ("claimed the same person, grade B, because ..."). evidence_json holds each
-- end's cited record and the identifier or lines it rests on; valid_from/valid_to are the earlier and later cited
-- dates (the claim's connection validity, R26), NULL where unstated. project fences the claim to a project (R31).
CREATE TABLE IF NOT EXISTS identity_claims (
  claim_id         TEXT PRIMARY KEY,
  a                TEXT NOT NULL,
  b                TEXT NOT NULL,
  kind             TEXT NOT NULL,
  basis            TEXT NOT NULL,
  grade            TEXT NOT NULL,
  why              TEXT NOT NULL,
  evidence_json    TEXT,
  note             TEXT NOT NULL,
  project          TEXT,
  valid_from       TEXT,
  valid_to         TEXT,
  by_actor         TEXT,
  at               TEXT NOT NULL,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT
);
CREATE INDEX IF NOT EXISTS identity_claims_a ON identity_claims(a);
CREATE INDEX IF NOT EXISTS identity_claims_b ON identity_claims(b);
-- THE IDENTITY CLUSTER, a derived cache (R6; record-core R77): for every person an unwithdrawn claim names, the
-- component of the same_as claims it sits in, named by the component's least entity id. Rebuilt in the transaction
-- of every claim, withdrawal and expunge; read fail-closed.
CREATE TABLE IF NOT EXISTS identity_cluster (
  entity_id  TEXT PRIMARY KEY,
  component  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS identity_cluster_component ON identity_cluster(component);
-- PERSON FACTS (R9, R11): a name, birth, death or locality as the cited document states it, with its validity.
-- Seen as the citing capture is seen (R31).
CREATE TABLE IF NOT EXISTS person_facts (
  fact_id          TEXT PRIMARY KEY,
  person           TEXT NOT NULL,
  kind             TEXT NOT NULL,
  value            TEXT NOT NULL,
  valid_json       TEXT NOT NULL,
  capture_sha      TEXT NOT NULL,
  extent_json      TEXT NOT NULL,
  by_actor         TEXT,
  at               TEXT NOT NULL,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT
);
CREATE INDEX IF NOT EXISTS person_facts_person ON person_facts(person, kind);
-- THE CONTACT FACTS (R10; K1485 row 9, K1493): an address or contact a member recorded from a cited document. Export
-- class never; never published; answered only to a viewer who may see the citing capture.
CREATE TABLE IF NOT EXISTS person_contacts (
  fact_id          TEXT PRIMARY KEY,
  person           TEXT NOT NULL,
  kind             TEXT NOT NULL,
  value            TEXT NOT NULL,
  valid_json       TEXT NOT NULL,
  capture_sha      TEXT NOT NULL,
  extent_json      TEXT NOT NULL,
  by_actor         TEXT,
  at               TEXT NOT NULL,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT
);
CREATE INDEX IF NOT EXISTS person_contacts_person ON person_contacts(person);
-- MEMBERS' OWN TIES (R20; K1490): a member's declared tie to a registered entity, seen by that member and
-- administrators only, with the attribution level the member chose for its disclosure.
CREATE TABLE IF NOT EXISTS member_ties (
  tie_id           TEXT PRIMARY KEY,
  member           TEXT NOT NULL,
  entity           TEXT NOT NULL,
  kind             TEXT NOT NULL,
  note             TEXT NOT NULL,
  attribution      TEXT NOT NULL,
  at               TEXT NOT NULL,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT
);
CREATE INDEX IF NOT EXISTS member_ties_member ON member_ties(member);
CREATE INDEX IF NOT EXISTS member_ties_entity ON member_ties(entity);
-- THE PROTECTED SOURCE LINK (R21; DEC-78 item 5): a source is a registered person. Read only by the members its sight
-- list names; every other read and every export answers as though none were held. Keyed by its two ends: no counter.
CREATE TABLE IF NOT EXISTS source_person_links (
  source     TEXT NOT NULL,
  person     TEXT NOT NULL,
  evidence   TEXT NOT NULL,
  sight_json TEXT NOT NULL,
  by_actor   TEXT,
  at         TEXT NOT NULL,
  PRIMARY KEY (source, person)
);
CREATE INDEX IF NOT EXISTS source_person_links_person ON source_person_links(person);
-- INTEREST CHECKS (R22): data-defined, each change a new version, every version kept. machine 1 for the shipped checks
-- (K1491), whose results are shown only past their gate (R24).
CREATE TABLE IF NOT EXISTS interest_checks (
  check_id       TEXT NOT NULL,
  version        INTEGER NOT NULL,
  name           TEXT NOT NULL,
  condition_json TEXT NOT NULL,
  denominator    TEXT NOT NULL,
  project        TEXT,
  machine        INTEGER NOT NULL DEFAULT 0,
  by_actor       TEXT,
  at             TEXT NOT NULL,
  PRIMARY KEY (check_id, version)
);
-- A check switched off (or on again) in one project (R22): appended; the latest for (check, project) governs.
CREATE TABLE IF NOT EXISTS interest_check_switches (
  seq      INTEGER PRIMARY KEY,
  check_id TEXT NOT NULL,
  project  TEXT NOT NULL,
  is_on    INTEGER NOT NULL,
  by_actor TEXT,
  at       TEXT NOT NULL
);
-- A version's gate (R24): the gold set and the measured false-alarm rate, recorded by an administrator.
CREATE TABLE IF NOT EXISTS interest_check_gates (
  check_id         TEXT NOT NULL,
  version          INTEGER NOT NULL,
  gold_set         TEXT NOT NULL,
  false_alarm_rate REAL NOT NULL,
  by_actor         TEXT,
  at               TEXT NOT NULL,
  PRIMARY KEY (check_id, version)
);
-- THE CHECKS' OWN RESULT TABLE (R23): each match with its cited derivation and its denominator; never a person's row.
-- result_id is the SHA-256 of the check, version and derivation, so a re-evaluation finds the same match.
CREATE TABLE IF NOT EXISTS interest_check_results (
  result_id       TEXT PRIMARY KEY,
  check_id        TEXT NOT NULL,
  version         INTEGER NOT NULL,
  project         TEXT,
  derivation_json TEXT NOT NULL,
  denominator     TEXT NOT NULL,
  told            INTEGER NOT NULL DEFAULT 0,
  at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS interest_check_results_check ON interest_check_results(check_id, version);
-- Where evaluation stopped (R23), per check version: the last person evaluated in the running pass and the size of its
-- denominator so far; done_base is the denominator of the last completed pass (NULL until one completes).
CREATE TABLE IF NOT EXISTS interest_check_cursor (
  check_id  TEXT NOT NULL,
  version   INTEGER NOT NULL,
  after     TEXT NOT NULL,
  base      INTEGER NOT NULL,
  done_base INTEGER,
  PRIMARY KEY (check_id, version)
);
`;

/* R33: the classes of each table (record-core R21). Purge: rows naming a project bundle are keyed to it; the rest clear
   only with the whole store. A row that a lawful removal may reach is `expunge: tombstone` (R12). */
const base = { purge: "clear", derive: "stored", version_chain: false };
export const PEOPLE_TABLES = Object.freeze([
  { name: "person_facts", keys: [], ...base, expunge: "tombstone", export: "yes", sight: "source" },
  { name: "person_contacts", keys: [], ...base, expunge: "tombstone", export: "never", sight: "source" },
  { name: "identity_claims", keys: ["project"], ...base, expunge: "tombstone", export: "yes", sight: "bundle" },
  { name: "member_ties", keys: [], ...base, expunge: "tombstone", export: "admin-only", sight: "owner" },
  { name: "source_person_links", keys: [], ...base, expunge: "tombstone", export: "never", sight: "owner" },
  { name: "interest_checks", keys: ["project"], ...base, expunge: "none", export: "admin-only", sight: "group", version_chain: true },
  { name: "interest_check_switches", keys: [], ...base, expunge: "none", export: "admin-only", sight: "group", version_chain: true },
  { name: "interest_check_gates", keys: [], ...base, expunge: "none", export: "admin-only", sight: "group" },
  { name: "interest_check_results", keys: ["project"], ...base, expunge: "none", export: "admin-only", sight: "bundle" },
  { name: "interest_check_cursor", keys: [], ...base, expunge: "none", export: "never", sight: "group" },
]);
/* The cluster cache's declaration is made by the instance, which names its rebuild (R6; record-core R77). */
export const CLUSTER_TABLE = "identity_cluster";
