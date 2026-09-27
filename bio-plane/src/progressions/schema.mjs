/* progressions' tables (requirements: `build/requirements/progressions.md`, R23, R29). Moved out of the legacy
 * `schema.mjs` at this module's extraction (layers.md ruling 3, "each module owns its tables"): the definition and its
 * versions, the instances and their exception documents, and the proposal dispositions, with the comments that record
 * why each is shaped as it is. Two tables are new with the extraction (K102): `progression_threads` and
 * `progression_thread_placements` keep every threading of an instance as a dated version (R8), and
 * `progression_exception_versions` every recording of an exception document (R14). `migrateProgressions` brings a
 * store created under an earlier shape to this one: `proposal_dispositions.definition_version` (REC-184). */

export const PROGRESSIONS_SCHEMA = `
-- CONSTRUCTS Step 5, SLICE A (FW-8): the PROGRESSION DEFINITION as data (framework
-- section 8.2, "generalises the connection table rather than sitting beside it"). A
-- definition is a named ordered set of STAGES with the rules a progression's junction
-- checks need: after, cardinality, interval, required-ness. This is DATA in the record,
-- not cases in a switch, so the set can be authored and (later) edited through a UI.
-- BOTH of Bob's example progressions must be expressible as rows here -- the meeting
-- chain (meeting -> agenda -> minutes) AND the procurement chain (need -> award ->
-- signed contract) -- or the generalisation has not been made (the acceptance).
--
-- A progression definition is a CLAIM the group is making about how its institutions
-- OUGHT to behave (framework 8.1's connection-table note 3), so it is FIRST-CLASS
-- member-declared state carrying its author and date -- like the subject registry
-- (entities), NOT a projection of the corpus. So a whole-store purge (the scratch-reset
-- tool) clears it, but a per-bundle purge leaves it (it has no bundle_id). The connection
-- table above is the TWO-STAGE case of this one (framework: "a connection row is a
-- progression of two stages; nothing needs both"); they are one construct at two
-- generalities, not two tables beside each other.
CREATE TABLE IF NOT EXISTS progression_defs (
  progression_key TEXT PRIMARY KEY,
  label           TEXT NOT NULL,
  note            TEXT,
  declared_by     TEXT,
  at              TEXT
);
-- The ordered STAGES of a progression definition. after_stage names the stage this one
-- PRESUPPOSES (framework 8.2: "read forwards it predicts; read backwards it accuses" --
-- the MISSING PREDECESSOR is slice B), NULL for the first stage. cardinality is 1 / 0..1
-- / 0..n (an RFP has many responses; an award has one contract). within_interval is the
-- clock that makes an absence OVERDUE rather than pending (NULL = no clock). required is
-- always / usually / sometimes / never / unless_exception (a lawful skip needs an
-- exception document -- slice B). stage_no is the ordinal, so the stages read in order
-- without depending on after_stage forming a single line (a real chain can branch).
-- Keyed (progression_key, stage_key). Cleared with its definition by a whole-store purge.
CREATE TABLE IF NOT EXISTS progression_stages (
  progression_key TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  stage_no        INTEGER NOT NULL,
  label           TEXT,
  after_stage     TEXT,
  cardinality     TEXT NOT NULL,
  within_interval TEXT,
  required        TEXT NOT NULL,
  PRIMARY KEY (progression_key, stage_key)
);
CREATE INDEX IF NOT EXISTS progression_stages_key ON progression_stages(progression_key);
-- D-128 (framework 8.2, The declared flow and its revisions, BOB #27 2026-09-22): a definition is
-- APPEND-ONLY. The two tables above are the CURRENT version, the one every instance and finding
-- is derived against, and these two hold EVERY version ever declared, never updated and never
-- deleted but by a whole-store purge. A revision writes version N+1 carrying its author, date and
-- BASIS (the member's statement and a citation, the anatomy an exception document carries); the
-- prior version stands and reads back through op=progression with version=N. A definition
-- declared before D-128 has no rows here -- the store reads it as version 1 with its basis NOT
-- RECORDED, and its first revision writes that version here first, verbatim from the tables above.
-- basis_statement and basis_citation are NULL when the declaring member stated none, which only a
-- FIRST version may do; a revision is refused without both.
CREATE TABLE IF NOT EXISTS progression_def_versions (
  progression_key TEXT NOT NULL,
  version         INTEGER NOT NULL,
  label           TEXT NOT NULL,
  note            TEXT,
  declared_by     TEXT,
  at              TEXT,
  basis_statement TEXT,
  basis_citation  TEXT,
  PRIMARY KEY (progression_key, version)
);
CREATE TABLE IF NOT EXISTS progression_stage_versions (
  progression_key TEXT NOT NULL,
  version         INTEGER NOT NULL,
  stage_key       TEXT NOT NULL,
  stage_no        INTEGER NOT NULL,
  label           TEXT,
  after_stage     TEXT,
  cardinality     TEXT NOT NULL,
  within_interval TEXT,
  required        TEXT NOT NULL,
  PRIMARY KEY (progression_key, version, stage_key)
);
-- CONSTRUCTS Step 5, SLICE B (FW-9): a PROGRESSION INSTANCE -- an actual N-stage chain of
-- REAL captured documents threaded through a definition's stages by a THREADING ENTITY (a
-- contract number, a project id, a fund). Framework 8.2: "an instance of a progression is
-- assembled by following an entity" -- which is why the entity axis is Step 4 and this is
-- Step 5. Each row is ONE captured document placed at ONE stage of ONE instance; the
-- instance is all rows sharing (progression_key, entity_id). The INSTANCE GRADE (the
-- weakest connection along the chain, framework 8.2's D-73 pair->chain generalised beyond
-- FW-8's two-node base case) and the MISSING-PREDECESSOR findings are DERIVED on read from
-- these rows plus the definition -- NEVER stored as a grade that could go stale, so an
-- instance read reflects the live definition and the documents still held (undetermined is
-- honest; a grade is never invented). grade here is the DOCUMENT's own end-grade: the
-- STRONGEST 8.1 resolution of THIS capture to the threading entity (the same collapse
-- op=concerns and op=connect make), so a placement records how well its document is tied to
-- the subject, and the chain math takes the weaker end of each consecutive pair.
--
-- A placement is only admitted for a document that ACTUALLY resolves to the threading
-- entity (FW-7): a document that does not concern the entity cannot be threaded on it (an
-- equality a caller can hand us is one a caller can invent). Which STAGE a document fills is
-- the member's authored judgment (this document is the award, that one the contract), so
-- threaded_by is stamped server-side; the GRADE is the record's, never the caller's.
--
-- DERIVED-from-the-corpus and carrying bundle_id, so it clears in BOTH purge arms exactly
-- as resolutions do (it is in op=purge's TABLES): a per-bundle purge removes that document's
-- placements and the instance honestly re-reads with that stage now unfilled, and a
-- whole-store purge takes them all (D-113). EXCEPTION documents that discharge a lawful
-- skip, JUNCTION checks as findings, and the SCHEDULED task that walks this table for
-- missing predecessors are DEFERRED past FW-9.
CREATE TABLE IF NOT EXISTS progression_instances (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  bundle_id       TEXT NOT NULL,
  grade           TEXT NOT NULL,
  threaded_by     TEXT,
  at              TEXT,
  PRIMARY KEY (progression_key, entity_id, stage_key, capture_sha)
);
CREATE INDEX IF NOT EXISTS progression_instances_key ON progression_instances(progression_key, entity_id);
CREATE INDEX IF NOT EXISTS progression_instances_bundle ON progression_instances(bundle_id);
CREATE INDEX IF NOT EXISTS progression_instances_capture ON progression_instances(capture_sha);
-- CONSTRUCTS Step 5, SLICE C (FW-10): an EXCEPTION DOCUMENT that discharges a LEGITIMATE SKIP
-- (framework 8.2: "a sole-source award skips the solicitation stage lawfully ... a skipped
-- stage with no exception document is [a finding]. The table records which document discharges
-- which skip"). A row is a REAL captured document, threaded onto ONE progression instance and
-- NAMING the ONE stage it discharges, carrying a reason and a citation -- the justification an
-- institution is supposed to publish for the skip, the same statement anatomy FW-8's declared
-- relations carry (justification + citation, both NOT NULL). Keyed
-- (progression_key, entity_id, stage_key, capture_sha) so a stage may be discharged by several
-- documents and re-recording the same document at a stage UPSERTS in place.
--
-- A discharge must be EARNED, enforced by the write path (op=discharge), never by a caller's
-- bare assertion (an equality a caller can hand us is one a caller can invent): the document
-- must ACTUALLY resolve to the threading entity (FW-7) -- refused NOT_CONCERNED otherwise, the
-- same gate op=thread uses -- and must name a REAL stage of the definition (BAD_STAGE
-- otherwise). Whether the discharge APPLIES is derived ON READ in #assembleInstance: only a
-- REQUIRED stage that is actually MISSING is discharged (rendered a distinct "discharged"
-- state carrying this reason/citation, never a gap and never silently absent); an exception
-- naming a stage that is not missing discharges nothing (the stage is present, so there is no
-- skip to discharge). Derived findings inform, they do not decide -- so this table stores the
-- documents, not a stored "discharged" boolean that could go stale against the live placements.
--
-- DERIVED-from-the-corpus and carrying bundle_id, so it clears in BOTH purge arms exactly as
-- progression_instances do (it is in op=purge's TABLES): a per-bundle purge removes that
-- document's discharges and the stage honestly re-reads as an undischarged gap; a whole-store
-- purge takes them all (D-113). JUNCTION checks as findings and the SCHEDULED walking-task are
-- DEFERRED past FW-10.
CREATE TABLE IF NOT EXISTS progression_exceptions (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  bundle_id       TEXT NOT NULL,
  reason          TEXT NOT NULL,
  citation        TEXT NOT NULL,
  declared_by     TEXT,
  at              TEXT,
  PRIMARY KEY (progression_key, entity_id, stage_key, capture_sha)
);
CREATE INDEX IF NOT EXISTS progression_exceptions_key ON progression_exceptions(progression_key, entity_id);
CREATE INDEX IF NOT EXISTS progression_exceptions_bundle ON progression_exceptions(bundle_id);
CREATE INDEX IF NOT EXISTS progression_exceptions_capture ON progression_exceptions(capture_sha);
-- K102 (R8): EVERY THREADING OF AN INSTANCE IS A DATED VERSION. progression_instances above holds
-- the CURRENT placements, the ones an instance is read against; these two hold every threading ever
-- made, numbered from 1 per (progression_key, entity_id), with who threaded it and when, never
-- updated and never deleted but by a purge. An instance threaded before versions were kept has no
-- rows here: its first re-threading writes the placements it replaces as version 1 first, verbatim
-- from the current rows, their threader and instant as those rows recorded them.
CREATE TABLE IF NOT EXISTS progression_threads (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  version         INTEGER NOT NULL,
  threaded_by     TEXT,
  at              TEXT,
  PRIMARY KEY (progression_key, entity_id, version)
);
-- One row per placement of one threading. Carries bundle_id so a per-bundle purge takes that
-- document's placements from every version, as it does from the current one (K23).
CREATE TABLE IF NOT EXISTS progression_thread_placements (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  version         INTEGER NOT NULL,
  stage_key       TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  bundle_id       TEXT NOT NULL,
  grade           TEXT NOT NULL,
  PRIMARY KEY (progression_key, entity_id, version, stage_key, capture_sha)
);
CREATE INDEX IF NOT EXISTS progression_thread_placements_bundle ON progression_thread_placements(bundle_id);
-- K102 (R14): EVERY RECORDING OF AN EXCEPTION DOCUMENT IS A DATED VERSION. progression_exceptions
-- above holds the CURRENT one per (instance, stage, document), the one that applies; this holds every
-- recording, numbered from 1, never updated. A row recorded before versions were kept has none
-- here: its next recording writes it as version 1 first, verbatim.
CREATE TABLE IF NOT EXISTS progression_exception_versions (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  version         INTEGER NOT NULL,
  bundle_id       TEXT NOT NULL,
  reason          TEXT NOT NULL,
  citation        TEXT NOT NULL,
  declared_by     TEXT,
  at              TEXT,
  PRIMARY KEY (progression_key, entity_id, stage_key, capture_sha, version)
);
CREATE INDEX IF NOT EXISTS progression_exception_versions_bundle ON progression_exception_versions(bundle_id);
-- REC-7 / D-79: the PROPOSAL-DISPOSITION store. A derived proposal (REC-6's
-- op=proposals: one missing-predecessor finding per (progression_key, stage_key),
-- aggregated across the instances that fire it) is NOT a bundle, so a member who
-- defers or dismisses it has nowhere to land a disposition -- op=dispose disposes
-- a focus BUNDLE (a handle + a state), and declining a proposal must NOT mint a
-- bundle, because declining is not authoring (D-79). This table is that home: it
-- records that a member aged the record's own question, keyed by the SAME identity
-- REC-6 aggregates by, so the disposition attaches to the proposal and not to any
-- one instance beneath it.
--
-- D-79's AGE RATHER THAN VANISH: a machine-surfaced finding nobody has acted on
-- moves to deferred/dismissed with the reason recorded, never silently
-- disappearing, because a finding that disappears is indistinguishable from one
-- never made -- and that rule does not relax because the finder was a machine.
-- This row IS the ageing: op=proposals reads it, filters the aged proposal out of
-- the OPEN feed, and returns it alongside so the decision stays on the record.
-- state is 'deferred' (parked, returnable) or 'dismissed' (declined); both age the
-- proposal out of open. A re-disposition UPSERTS on the (progression_key,
-- stage_key) key -- the same proposal re-decided keeps ONE row, re-triageable,
-- never a second. decided_by is the deciding member, STAMPED server-side (never
-- the caller's word). A re-fired proposal whose gap still exists but was dismissed
-- stays dismissed with its reason until this row changes: the key is the identity,
-- not the instance set, so a wider gap does not silently resurrect it.
--
-- Member-authored state (a member's decision), not a projection of the corpus --
-- like the registry and the progression definitions above -- but op=purge is the
-- scratch-reset tool, so a whole-store purge that reported scope ALL while leaving
-- dispositions is the D-113 silent-leftover: cleared in the whole-store arm only,
-- left by a per-bundle purge (it has no bundle_id). hygiene.test.mjs asserts this
-- against schema.mjs.
CREATE TABLE IF NOT EXISTS proposal_dispositions (
  progression_key TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  state           TEXT NOT NULL,
  reason          TEXT NOT NULL,
  decided_by      TEXT,
  at              TEXT,
  definition_version INTEGER,   -- REC-184: the progression definition version the decision was taken against
  PRIMARY KEY (progression_key, stage_key)
);
-- REC-184 (framework 8.2, The declared flow and its revisions): definition_version is the version of
-- the progression definition CURRENT when the member decided, stamped by the store and never the
-- caller's word. A decision applies only to the version it was taken against -- once the definition
-- is revised the proposal is OPEN again, with the earlier decision published beside it, because a
-- decision the record applies to a definition nobody judged is the record claiming more than it
-- holds. NULLABLE AND NEVER BACK-FILLED: a row written before this column existed recorded no
-- version, and the only value a backfill could reach for is the current one, which is the claim
-- this column exists to test. NULL reads back as not recorded, stated, and such a row governs
-- only while the definition has not been declared again since the decision was taken (the
-- definition's own at against the row's at) -- the version stays unknown, the ORDER is recorded.
CREATE INDEX IF NOT EXISTS proposal_dispositions_at ON proposal_dispositions(at);
`;

/** R29 (K23): the tables declared to record-core's purge. Those carrying `bundle_id` are keyed to their bundle; the
 *  definitions and the decisions carry none and clear only with the whole store. */
export const PROGRESSIONS_TABLES = [
  "progression_instances", "progression_exceptions", "progression_thread_placements", "progression_exception_versions",
  { name: "progression_defs", keys: [] }, { name: "progression_stages", keys: [] },
  { name: "progression_def_versions", keys: [] }, { name: "progression_stage_versions", keys: [] },
  { name: "progression_threads", keys: [] }, { name: "proposal_dispositions", keys: [] },
];

/** Creates the tables and brings an earlier store's shape to this one. REC-184's `definition_version` is NULLABLE AND
 *  NEVER BACK-FILLED: a decision taken before the column existed recorded no version, and the one value a backfill
 *  could reach for is the current version, the very claim the column exists to test. */
export function migrateProgressions(sql) {
  const bare = PROGRESSIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  const stmts = bare.split(";").map((x) => x.trim()).filter(Boolean);
  const info = [...sql.exec(`PRAGMA table_info(proposal_dispositions)`)];
  if (info.length && !info.some((r) => r.name === "definition_version"))
    sql.exec(`ALTER TABLE proposal_dispositions ADD COLUMN definition_version INTEGER`);
  for (const s of stmts) sql.exec(s);
}
