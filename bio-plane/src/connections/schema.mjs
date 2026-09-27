/* connections' tables (requirements: `build/requirements/connections.md`, R36). Moved out of the legacy `schema.mjs`
 * at this module's extraction (layers.md ruling 3, "each module owns its tables"): `refs`, `connections`,
 * `connection_pair_choices`, `connection_dirty`, `themes`, `theme_placements`, with the comments that record why each
 * is shaped as it is; and the tables this job added for R31, R32, R43 and R49 (`theme_placement_acts`,
 * `asserted_connections`, `asserted_connection_judgements`, `file_membership_pending`). `migrateConnections` brings a
 * store created under an earlier shape to this one (the pair columns FW-17, REC-120 and D-454 added, moved here from
 * the store's additive list). */

export const CONNECTIONS_SCHEMA = `
-- References extracted from frontmatter, so C-6.2 is a join rather than a scan.
CREATE TABLE IF NOT EXISTS refs (
  bundle_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  kind      TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (bundle_id, target_id, kind)
);
CREATE INDEX IF NOT EXISTS refs_target ON refs(target_id);
-- CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA, carrying a GRADE (D-67
-- storage + D-72 grade). A connection links TWO captured documents that resolve to
-- the SAME registry entity: two documents concerning one subject is the raw material
-- of a connection (framework section 8). It is DERIVED from resolutions (FW-7) -- built
-- UNDER the reverse-index join documentsConcerning already makes, not a parallel path.
--
-- The connection's GRADE is the framework section 8.1 method-as-grade FW-7 computes per
-- resolution, applied to the two-node base case of section 8.2's "a progression instance
-- inherits the WEAKEST connection grade along its chain": a connection's grade is the
-- WEAKER of how its two ends resolved to the shared entity. a_grade / b_grade record how
-- each end resolved (the strongest resolution of that capture to that entity); grade is
-- min(a_grade, b_grade) by section-8.1 rank (A strongest .. D weakest). A case is only as
-- strong as its weakest link, so a connection is no stronger than its weaker end.
-- established is DERIVED from the WEAKER grade (1 only when BOTH ends are A/B), so a
-- connection resting on a C correspondence at either end can NEVER read back as
-- established -- the section-8.1 rule that an equality costing nothing is not evidence,
-- enforced structurally at both ends.
--
-- asserted_by is THREE-VALUED and is NOT the grade (framework §8.1 -- the author says WHO
-- claims the connection, the grade says WHAT would be needed to CHECK it). Domain:
--   'system' -- the framework INFERRED the connection from the two resolutions (what
--              op=connect writes: the rule is the system's, even if an underlying
--              resolution was a member's grade-D testimony);
--   'source' -- the source itself linked the two documents (a links_to edge, asserted_by
--              source; NOT produced here -- reserved so a source-asserted connection is a
--              distinct fact, not a repeat of a system inference);
--   'member' -- a member asserted the connection directly (reserved for slice B).
-- Only 'system' is written in slice A; the column carries the axis so the three authors
-- of a connection stay distinct from its grade, as D-67 requires.
--
-- Keyed (a_capture_sha, b_capture_sha, entity_id) with the pair stored in canonical
-- order (a_capture_sha < b_capture_sha), so (X,Y) and (Y,X) are ONE connection, never
-- two. A re-derivation after a resolution's grade is RAISED (FW-7 grade is improvable)
-- upserts the connection IN PLACE, so a connection is improvable too. DERIVED from the
-- corpus and carrying BOTH ends' bundle ids, so a per-bundle purge (EITHER end matches)
-- and a whole-store purge both clear it (D-113); op=purge deletes it explicitly in both
-- arms (it has no single bundle_id, so it is NOT in purge's bundle_id TABLES list).
-- PROGRESSION INSTANCES -- an actual N-stage chain of real documents threaded by an
-- entity, and weakest-grade inheritance along a chain longer than two -- are SLICE B;
-- this table is the two-node base case only.
-- FW-17 / D-161 / Bob's 5.4, 2026-09-14: THE DETERMINING REFERENCE PAIR.
-- Both documents refer to the ordinance -- that is how each was identified -- so
-- the connection points at the SPECIFIC REFERENCE IN EACH, and not at all the
-- supporting mentions. The pair is the reference on each side that DETERMINED
-- the grade: the strongest resolution of that capture to the entity, which is
-- the same collapse op=concerns and op=connect already make, so the pair can
-- never disagree with the grade beside it.
-- Until FW-17 this row kept the two grades and threw the references away, which
-- is what made following a connection land a reader on a whole document (D-161,
-- Part II section 17's REFER row).
-- THE POSITION HALF IS NULLABLE AND ITS ABSENCE IS THE POINT. a_ref/b_ref are
-- recoverable from resolutions today; the POSITIONS come from reading_refs and
-- exist only where the reader could say where (FW-17's first half, IC-86). A
-- pair with no positions is a real pair that cannot place itself, and a portion
-- leg asking it for a connection grade gets UNDETERMINED and STATED -- per pair,
-- never assumed for the connection as a whole.
-- REC-120 / D-161 act (2), 2026-09-18: THE PAIR SAYS HOW IT WAS SELECTED, because
-- it is the STRONGEST-GRADED mention and not the ON-POINT one Bob ruled (5.4 second
-- pass, FW-21 measured M-51). pair_rule names the selection and its tie-break
-- ('strongest-graded/first-reference-by-sort'). NULL on a row derived before REC-120,
-- whose ties went to the scan's row order -- not a basis, and stated as such by the
-- read rather than backfilled, since the rule that produced it cannot be recovered.
CREATE TABLE IF NOT EXISTS connections (
  a_capture_sha TEXT NOT NULL,
  b_capture_sha TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  a_bundle_id   TEXT NOT NULL,
  b_bundle_id   TEXT NOT NULL,
  a_grade       TEXT NOT NULL,
  b_grade       TEXT NOT NULL,
  grade         TEXT NOT NULL,
  established   INTEGER NOT NULL DEFAULT 0,
  asserted_by   TEXT NOT NULL,
  basis         TEXT,
  at            TEXT,
  a_ref         TEXT,  -- the determining reference on end A, AS IT APPEARED (Ord. No. 13,579)
  a_pos_kind    TEXT,  -- and WHERE it was read, in IC-1's vocabulary. NULL = the reading could not say
  a_pos         TEXT,
  a_pos_ref     TEXT,
  b_ref         TEXT,  -- the same three facts for end B
  b_pos_kind    TEXT,
  b_pos         TEXT,
  b_pos_ref     TEXT,
  pair_rule     TEXT,  -- REC-120: HOW the pair was selected. NULL = derived before REC-120, when ties went to scan order
  PRIMARY KEY (a_capture_sha, b_capture_sha, entity_id)
);
CREATE INDEX IF NOT EXISTS connections_entity ON connections(entity_id);
CREATE INDEX IF NOT EXISTS connections_a ON connections(a_capture_sha);
CREATE INDEX IF NOT EXISTS connections_b ON connections(b_capture_sha);
CREATE INDEX IF NOT EXISTS connections_a_bundle ON connections(a_bundle_id);
CREATE INDEX IF NOT EXISTS connections_b_bundle ON connections(b_bundle_id);
-- NO INDEX ON connections(grade), stated rather than left: D-222 named it beside
-- resolutions_grade, and no arm of the meaning compiler reads it -- concerns joins
-- resolutions, the base relation a connection is DERIVED from (both ends of every
-- connection have a resolution row for the shared entity). An index nothing queries is
-- write cost on D-224's k(k-1)/2 curve for no read at all. It is earned when an arm
-- reads it.
-- REC-122 / D-161 act (3) / IC-232, 2026-09-23: A MEMBER'S CHOICE OF THE ON-POINT
-- MENTION on one end of a connection (Bob's 5.4 second pass: specificity is worked
-- for, not merely permitted). The connection's own pair stays the machine's
-- strongest-graded selection and is NEVER rewritten by a choice -- a re-derivation
-- would overwrite it, and the machine's selection and a member's judgment are two
-- facts. So the choice lives beside the row, keyed by the connection's own primary
-- key plus the END ('a' or 'b') it is about, and names the mention by its reference
-- exactly as the reading recorded it (resolutions.ref). APPEND-ONLY: a re-choice
-- stamps superseded_at on the current row and writes a new one, so the old is
-- retained (REC-86's rule). superseded_at NULL = the current choice. The two bundle
-- ids are carried so a per-bundle purge clears a choice with the connection it is
-- about (D-113). No position is stored: WHERE the mention was read is the reading's
-- fact (reading_refs), read at answer time, so a choice cannot freeze a position the
-- record later corrects.
-- D-454: the choice NAMES ITS OCCURRENCE, because one reference string may be read at
-- several places and a choice of the string alone is not a choice between them. The key
-- is stored, never the position read off it: the answer still joins reading_refs, so a
-- re-read that no longer carries that occurrence LAPSES the choice rather than moving it
-- to another. A row chosen before D-454 has NULL here and answers only while its
-- reference has exactly one occurrence.
CREATE TABLE IF NOT EXISTS connection_pair_choices (
  choice_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  a_capture_sha TEXT NOT NULL,
  b_capture_sha TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  side          TEXT NOT NULL,  -- which end the choice is about, a or b
  ref           TEXT NOT NULL,  -- the chosen mention, as resolutions.ref holds it
  occurrence    TEXT,           -- D-454: WHICH read of ref, reading_refs.occurrence. NULL = chosen before D-454, naming the string only
  a_bundle_id   TEXT,
  b_bundle_id   TEXT,
  chosen_by     TEXT NOT NULL,  -- the member, stamped by the control plane
  at            TEXT NOT NULL,
  superseded_at TEXT            -- NULL = current, else when a later choice replaced it
);
CREATE INDEX IF NOT EXISTS connection_pair_choices_end ON connection_pair_choices(a_capture_sha, b_capture_sha, entity_id, side);
-- REC-5 / D-122: the CONNECTION-DERIVE DIRTY-SET. A bounded work-queue of the
-- entities whose resolutions have changed since their connections were last
-- derived, so the scheduled connection-derive sweep (a consumer on REC-1's DO
-- alarm) re-derives only what moved rather than re-deriving the whole store every
-- tick. It is a WATERMARK, not a second source of truth: the connections it
-- produces are DERIVED from resolutions exactly as op=connect derives them, and a
-- dirty row that is lost only costs one skipped re-derivation, while a spurious
-- one costs one idempotent no-op re-derivation -- both harmless, which is why a
-- transient set is safe here where the record proper never is.
--
-- Stamped at op=resolve / op=resolvetestify, and ONLY when a resolution is
-- INSERTED or RAISED in grade (a kept idempotent re-resolve changes nothing, so
-- it dirties nothing). Keyed by entity_id, so many resolutions touching one
-- entity collapse to ONE pending row and the sweep is bounded by the count of
-- DISTINCT changed entities, not by resolve volume. The sweep deletes a row once
-- it has derived that entity's connections; when the set empties the consumer's
-- wake goes null and the alarm self-terminates.
--
-- DERIVED from the corpus (an entity is dirty only because a captured document
-- resolved to it), so a whole-store purge clears it -- op=purge deletes it in the
-- whole-store arm (D-113; hygiene.test.mjs holds the list). It has no bundle_id
-- and is a transient queue, so a per-bundle purge leaves it: at worst a stale
-- entity_id triggers one harmless idempotent re-derivation on the next tick.
CREATE TABLE IF NOT EXISTS connection_dirty (
  entity_id  TEXT PRIMARY KEY,
  stamped_at TEXT
);
CREATE INDEX IF NOT EXISTS connection_dirty_stamped ON connection_dirty(stamped_at);

-- D-162 / IC-241 -- THE THEME. BIO_Content_Framework_v0_10.md section 8.4, Bob's
-- ruling of 2026-09-21: a connection through an IDEA, fenced four ways. Declared
-- by a MEMBER (the declarer is stamped and shown on every reading), it carries
-- its TEST, a sentence a document or a passage passes or fails, membership is a
-- member's act and a machine's proposal is a HUNCH until a member confirms it,
-- and it is NEVER the basis of a claim (C-81.1 at every leg grammar).
--
-- WHY A TABLE OF ITS OWN AND NOT AN ENTITY. The entity registry holds NAMED
-- things a source's own words can be resolved to, and anything in it is a
-- subject a connection can run through at grade A to C. A theme is one member's
-- lens, visibly theirs, so it lives here under a THEME- id that no leg grammar
-- accepts and that ENTITY_KINDS does not contain -- the eleventh-entity-kind
-- liar is refused by shape as well as by name.
--
-- NO bundle_id: a theme is about no one document, so a per-bundle purge leaves
-- it and the whole-store purge clears it (D-113). Never rewritten: a changed
-- idea is a new theme, since a placement was judged against THIS test.
CREATE TABLE IF NOT EXISTS themes (
  theme_id     TEXT PRIMARY KEY,   -- THEME-YYYY-MMDD-hex, minted by the plane
  declared_by  TEXT NOT NULL,      -- a member id, server-stamped, never a machine (C-81.2)
  name         TEXT NOT NULL,      -- the idea in the declarer words, as written
  test         TEXT NOT NULL,      -- the inclusion criterion, as written (C-81.3)
  at           TEXT NOT NULL
);
-- A DOCUMENT OR A PASSAGE IN A THEME, graded like any connection (section 8.1).
-- state member: a MEMBER placed or confirmed it, grade D -- asserted on that
-- member stated judgement that it passes the test, with an author and a date.
-- state hunch: PROPOSED (by a machine, or a member proposing rather than
-- placing), grade C -- correspondence, never established, flagged for a member
-- to confirm, and NEVER counted as membership. A confirmation turns the row to
-- member and KEEPS who proposed it, so the record says the machine saw it first.
-- target is a bundle id (target_kind document) or a content id (content),
-- bundle_id is the DOCUMENT either way, so every read gates it by the viewer
-- and a per-bundle purge takes the placement with its document (D-113).
CREATE TABLE IF NOT EXISTS theme_placements (
  theme_id     TEXT NOT NULL,
  target       TEXT NOT NULL,
  target_kind  TEXT NOT NULL CHECK (target_kind IN ('document','content')),
  bundle_id    TEXT NOT NULL,
  state        TEXT NOT NULL CHECK (state IN ('hunch','member')),
  grade        TEXT NOT NULL CHECK (grade IN ('C','D')),
  proposed_by  TEXT,               -- who proposed it as a hunch, NULL when a member placed it outright
  proposed_at  TEXT,
  proposal_note TEXT,
  placed_by    TEXT,               -- the member who placed or confirmed it, NULL while a hunch
  placed_at    TEXT,
  placement_note TEXT,
  PRIMARY KEY (theme_id, target)
);
CREATE INDEX IF NOT EXISTS theme_placements_bundle ON theme_placements(bundle_id);

-- R43 (K102): A PLACEMENT TAKEN BACK. The placer (or an administrator) withdraws a
-- membership and any member rejects a hunch, with a reason. The standing row leaves
-- theme_placements (so at most one placement stands per theme and target, R48, and a
-- later placement there is recorded afresh) and is kept here WHOLE, with every act
-- before it (proposer, placer, their times and notes) and the act that ended it: who,
-- when and why. Nothing is deleted from the record of what was judged.
CREATE TABLE IF NOT EXISTS theme_placement_acts (
  act_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id      TEXT NOT NULL,
  target        TEXT NOT NULL,
  target_kind   TEXT NOT NULL,
  bundle_id     TEXT NOT NULL,
  state         TEXT NOT NULL CHECK (state IN ('withdrawn','rejected')),
  grade         TEXT NOT NULL,     -- the grade the placement stood at
  proposed_by   TEXT,
  proposed_at   TEXT,
  proposal_note TEXT,
  placed_by     TEXT,
  placed_at     TEXT,
  placement_note TEXT,
  ended_by      TEXT NOT NULL,     -- the control plane's stamp of who withdrew or rejected it
  ended_at      TEXT NOT NULL,
  reason        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS theme_placement_acts_theme ON theme_placement_acts(theme_id, target);
CREATE INDEX IF NOT EXISTS theme_placement_acts_bundle ON theme_placement_acts(bundle_id);

-- R31, R32, R49 (K102): CONNECTIONS NOT DERIVED FROM RESOLUTIONS, kept APART from
-- 'connections' so no derivation ever rewrites one and no read mixes them in
-- (Framework §8.1, "The connection table" 1: three authors, never the grade).
--   kind 'member'       -- a member asserted it directly, with a basis: grade D.
--   kind 'link'         -- the SOURCE's own link between two held documents (a projected
--                          links_to): grade A, asserted_by source; 'timing' says whether
--                          the link's contemporaneity was established.
--   kind 'containment'  -- an agenda item's membership in a file, derived from position
--                          (extraction R52): grade C, asserted_by system, never established;
--                          a member confirms or rejects it (judgement columns), both kept.
-- The two ends are DOCUMENTS (bundles), in canonical order for member and link rows; a
-- containment row keeps item -> file direction (a_ = the item, b_ = the file). One row
-- per (kind, a, b, origin): a link row's origin is the source capture, a containment
-- row's the agenda capture, a member row's its asserting member.
CREATE TABLE IF NOT EXISTS asserted_connections (
  connection_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  kind           TEXT NOT NULL CHECK (kind IN ('member','link','containment')),
  a_bundle_id    TEXT NOT NULL,
  b_bundle_id    TEXT NOT NULL,
  origin         TEXT NOT NULL DEFAULT '',
  grade          TEXT NOT NULL,
  established    INTEGER NOT NULL DEFAULT 0,
  asserted_by    TEXT NOT NULL CHECK (asserted_by IN ('member','source','system')),
  author         TEXT,              -- the member's stamp (kind member), else null
  basis          TEXT NOT NULL,
  timing         TEXT,              -- link rows: 'contemporaneous' or 'undetermined'
  a_address      TEXT,              -- link and containment rows: the address each end was named by
  b_address      TEXT,
  at             TEXT NOT NULL,
  UNIQUE (kind, a_bundle_id, b_bundle_id, origin)
);
CREATE INDEX IF NOT EXISTS asserted_connections_a ON asserted_connections(a_bundle_id);
CREATE INDEX IF NOT EXISTS asserted_connections_b ON asserted_connections(b_bundle_id);
-- A member's judgement of a containment row (R49): append-only, the latest standing.
CREATE TABLE IF NOT EXISTS asserted_connection_judgements (
  judgement_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id  INTEGER NOT NULL,
  verdict        TEXT NOT NULL CHECK (verdict IN ('confirmed','rejected')),
  judged_by      TEXT NOT NULL,
  at             TEXT NOT NULL,
  reason         TEXT NOT NULL,
  a_bundle_id    TEXT NOT NULL,
  b_bundle_id    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS asserted_connection_judgements_c ON asserted_connection_judgements(connection_id);
-- R49: an item-to-file pair a derivation found whose documents are not both held yet.
-- Served only at the read (R30) until both are held, then stored as a containment row.
-- Keyed by the agenda capture and the two addresses; re-resolved when a capture is read.
CREATE TABLE IF NOT EXISTS file_membership_pending (
  agenda_capture TEXT NOT NULL,
  agenda_bundle  TEXT,
  item_address   TEXT NOT NULL,
  file_address   TEXT NOT NULL,
  item_norm      TEXT NOT NULL,
  file_norm      TEXT NOT NULL,
  pair           TEXT NOT NULL,    -- the derived pair as extraction R52 answered it (JSON)
  at             TEXT NOT NULL,
  PRIMARY KEY (agenda_capture, item_norm, file_norm)
);
CREATE INDEX IF NOT EXISTS file_membership_pending_item ON file_membership_pending(item_norm);
CREATE INDEX IF NOT EXISTS file_membership_pending_file ON file_membership_pending(file_norm);
`;

/** R36 (K23): what purge clears. Keyed to a bundle by the named columns, or whole-store only. */
export const CONNECTIONS_TABLES = Object.freeze([
  "refs",
  { name: "connections", keys: ["a_bundle_id", "b_bundle_id"] },
  { name: "connection_pair_choices", keys: ["a_bundle_id", "b_bundle_id"] },
  { name: "connection_dirty", keys: [] },
  { name: "themes", keys: [] },
  "theme_placements",
  "theme_placement_acts",
  { name: "asserted_connections", keys: ["a_bundle_id", "b_bundle_id"] },
  { name: "asserted_connection_judgements", keys: ["a_bundle_id", "b_bundle_id"] },
  { name: "file_membership_pending", keys: ["agenda_bundle"] },
]);

/** The names of the tables above, for the legacy store's purge list and census. */
export const CONNECTIONS_TABLE_NAMES = Object.freeze(CONNECTIONS_TABLES.map((t) => (typeof t === "string" ? t : t.name)));

/* The columns earlier shapes lacked, added in place (nullable, never back-filled: each one's NULL is a true state of
   the row, as the store's additive list said of them). FW-17 / D-161: the determining pair; REC-120: how the pair was
   selected; D-454: which occurrence a choice names. */
const ADDED_COLUMNS = [
  ["connections", "a_ref", "TEXT"], ["connections", "a_pos_kind", "TEXT"], ["connections", "a_pos", "TEXT"],
  ["connections", "a_pos_ref", "TEXT"], ["connections", "b_ref", "TEXT"], ["connections", "b_pos_kind", "TEXT"],
  ["connections", "b_pos", "TEXT"], ["connections", "b_pos_ref", "TEXT"], ["connections", "pair_rule", "TEXT"],
  ["connection_pair_choices", "occurrence", "TEXT"],
];

export function migrateConnections(sql) {
  const bare = CONNECTIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  const stmts = bare.split(";").map((x) => x.trim()).filter(Boolean);
  for (const [table, col, type] of ADDED_COLUMNS) {
    const info = [...sql.exec(`PRAGMA table_info(${table})`)];
    if (info.length && !info.some((r) => r.name === col)) sql.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  }
  for (const s of stmts) sql.exec(s);
}
