/* contradiction's table (layers.md ruling 3: each module owns its tables; R15, R17, R22), moved from
   `schema.mjs`. `migrate` runs it at every boot, idempotent. */
export const CONTRADICTION_SCHEMA = `
-- REC-147 / IC-318 (CONTRADICTION-IDENTIFY-DESIGN.md section 8): THE CONTRADICTION CANDIDATE. One row per
-- PROPOSED conflict between two referents the pairing FORMED (op=contradictionpairs), written as labelled
-- MACHINE work through ONE append site (Contradiction #append) and never updated in place.
-- APPEND-ONLY AND KEYED BY WHAT WAS COMPARED: candidate is a digest of the key and both referents AT THEIR
-- VERSIONS, order-free, so a re-run over unchanged referents collides and writes nothing (section 8), while a
-- changed side is a new row and the old one stays with its versions. A claim side is the inquiry and the reading
-- it is held on, versioned by the sha256 of the claim text as compared. An extent side is its content row (or the
-- capture where none is named), versioned by the capture, whose bytes never change.
-- state is only 'proposed' until PRESENT and RESOLVE are designed (section 9 item 4). origin is always 'machine'
-- (DEC-24: a proposal, labelled). a_bundle_id and b_bundle_id are the bundles each side lives in, so a purge of
-- either end takes the row (D-113), as connections do. Nothing reads this table to a member yet.
CREATE TABLE IF NOT EXISTS contradiction_candidates (
  candidate    TEXT PRIMARY KEY,
  key          TEXT NOT NULL,
  a_kind       TEXT NOT NULL,
  a_ref        TEXT NOT NULL,
  a_version    TEXT NOT NULL,
  a_bundle_id  TEXT,
  b_kind       TEXT NOT NULL,
  b_ref        TEXT NOT NULL,
  b_version    TEXT NOT NULL,
  b_bundle_id  TEXT,
  run          TEXT NOT NULL,
  proposed_by  TEXT NOT NULL,
  label        TEXT NOT NULL,
  reason       TEXT NOT NULL,
  state        TEXT NOT NULL DEFAULT 'proposed',
  origin       TEXT NOT NULL DEFAULT 'machine',
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS contradiction_candidates_run ON contradiction_candidates(run);
`;
