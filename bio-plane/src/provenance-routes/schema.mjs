/* provenance-routes' table (requirements: `build/requirements/provenance-routes.md`, R8, R12). Moved out of
 * `provenance`'s `schema.mjs` with the code that writes it (N512, K1193; layers.md ruling 3, "each module owns its
 * tables"), with the comments that record why it is shaped as it is. `CREATE TABLE IF NOT EXISTS` under the same name
 * keeps a deployed instance's rows: no data moves. `provenance_route_marks` is a stated read contract (R8): a later
 * module may join its columns in its own SQL; every write to it is this module's (R12). */

export const PROVENANCE_ROUTES_SCHEMA = `
-- REC-63 / DEC-56 / D-204: THE STANDING MARKER. When a document's provenance
-- ROUTE cannot be shown, the record carries that fact BESIDE the state rather
-- than un-saying the verification. Bob ruled the principle across DEC-56/57/58
-- on 2026-08-06: ACT, AND SAY WHAT YOU COULD NOT ESTABLISH.
--
-- WHY A ROW HERE AND NOT A FIELD IN THE BUNDLE'S OWN BYTES, which is the first
-- question a reader will ask. Writing the marker into data/provenance.json
-- would change the bundle_sha of a VERIFIED document, so the doubt about the
-- bytes would alter the bytes -- and it would be a second claim nobody made,
-- which is the same reasoning provenanceChainRebuild already gives for leaving
-- bundle.md alone. The marker is a statement by THIS INSTANCE about its own
-- evidence, so it lives where the instance's other statements live.
--
-- APPEND-ONLY, AND THAT IS DEC-19. Correction moves FORWARD: a route later
-- shown is a NEW row saying so, never a delete of the row that said it could
-- not be. The current finding is the row with the highest 'seq' for a bundle,
-- and the ones before it stay readable.
--
-- 'finding' IS D-129's VOCABULARY, observation-log's OBSERVATION_STATES (airun.mjs's then)
-- rather than invented here, because this record already has words for which
-- absence it met: NEVER_LOOKED is the ABSENCE OF A ROW and is never stored,
-- LOOKED_INDETERMINATE is the marker itself (we looked and cannot tell), and
-- PRESENT is an assessment that found the route showable. LOOKED_ABSENT is
-- deliberately unreachable here: it would assert the bytes have no route, and
-- every captured byte came from somewhere -- what we cannot show is OUR
-- EVIDENCE of it, which is a statement about us.
--
-- 'state_at' RECORDS THE STATE THE DOCUMENT SAT IN WHEN THE MARKER WAS MADE,
-- because the marker's whole point is that the state STANDS while the doubt is
-- carried: a reader of the history has to be able to see that the two disagreed
-- ON PURPOSE and that nothing moved the document.
CREATE TABLE IF NOT EXISTS provenance_route_marks (
  bundle_id      TEXT    NOT NULL,
  seq            INTEGER NOT NULL, -- MAX+1 per bundle. The highest is the current finding
  at             TEXT    NOT NULL,
  by             TEXT    NOT NULL, -- the MEMBER who made the assessment. Never a machine
  finding        TEXT    NOT NULL, -- LOOKED_INDETERMINATE (the marker) | PRESENT
  state_at       TEXT    NOT NULL, -- current_state at the moment of marking
  register_state TEXT    NOT NULL, -- readable | absent | unparsable | no_documents | empty
  undetermined   INTEGER NOT NULL, -- documents whose route could not be shown
  documents_n    INTEGER NOT NULL, -- documents the register named at all
  documents      TEXT    NOT NULL, -- JSON per-document outcomes, so the marker says WHICH
  PRIMARY KEY (bundle_id, seq)
);
-- =========================================================================
-- REC-112, 2026-09-17 -- THIS INDEX HAD NO READER, AND IT WAS KEPT ON PURPOSE.
-- Its reader has since landed (REC-116 / IC-120): provenanceRoutesMarked
-- (op=provenanceroutes, R5) pages on (finding, bundle_id). What follows is
-- the record of why it was kept, as written then.
--
-- WHAT IT WAITS FOR: a READ op answering the question no op asks --
-- "which documents in this instance carry a standing LOOKED_INDETERMINATE
-- marker". All four SQL readers of this table key on bundle_id and seq and
-- classify in JS, so a group asking where its own record's provenance is
-- doubted must page the whole store and count for itself. The route act is a
-- WRITE (op-declarations declares provenanceroute mutating:true). There is no read.
--
-- IT IS NOT DEAD WEIGHT AND IT IS NOT MIS-SPECIFIED, and that is MEASURED
-- rather than read off the SQL (EXPLAIN QUERY PLAN, sqlite3 3.51.0, no
-- ANALYZE, which is this plane's live condition because nothing here ever
-- runs one). The MEASUREMENTS ledger's M-41 carries the plans in full:
--   the four existing readers     -- every one uses the PRIMARY KEY autoindex,
--                                    none touches this index, and DROPPING it
--                                    leaves all four plans IDENTICAL
--   finding = ?                   -- SEARCH USING INDEX (finding=?)
--   finding = ? AND bundle_id > ? -- SEARCH USING INDEX (finding=? AND
--                                    bundle_id>?) -- BOTH columns, which is
--                                    this plane's after-cursor paging shape
--   COUNT over finding = ?        -- COVERING INDEX
-- The second column is therefore not decoration: whoever declared this knew
-- the intended reader's PAGING shape. That is evidence of a SPECIFIC reader
-- rather than a speculative index, and it is why the act was to row the
-- reader rather than to delete the declaration.
--
-- DELETING IT WAS CONSIDERED AND REFUSED. REC-92 withdrew a chain_kind index
-- a few hundred lines down on REC-12's rule -- an index nobody seeks on is
-- cost with no reader -- but that precedent governs ADDING one, not removing
-- one a dated delegation has pointed at for 39 days. Removing this would take
-- the airuns sweep's unread roster DOWN by one for a reason that is not the
-- plane getting better, which is the one direction that ratchet must never
-- move, and it would delete the very artifact that made the sweep find this
-- owed act at all. The write cost is one row per member assessment, on an
-- append-only table a member writes by hand.
--
-- THE INTENT SURVIVES IN THREE PLACES AND THIS IS THE THIRD, so the index is
-- NOT the only evidence of it: CLAIMS.md carries REC-69's DELEGATION of
-- 2026-08-09 naming the question verbatim and re-affirmed open by M0-37 on
-- 2026-09-16, the legacy airuns.test.mjs carried it on the unread roster AND
-- pinned it BY NAME (that suite was deleted at T20), and the declaration is here.
--
-- The legacy test/nc-rec69-selects.mjs patched the two lines below as exact
-- string literals to arm two negative controls; it was deleted at T20, and no
-- test reads these lines as text now.
-- =========================================================================
CREATE INDEX IF NOT EXISTS provenance_route_marks_finding
  ON provenance_route_marks(finding, bundle_id);
`;

/** Creates the table and its index (idempotent: every statement is `IF NOT EXISTS`). Comment lines are dropped
 *  before the statements are split, as provenance's migration does, so a `;` inside a comment splits nothing. */
export function migrateProvenanceRoutes(sql) {
  const bare = PROVENANCE_ROUTES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";")) { const t = s.trim(); if (t) sql.exec(t); }
}
