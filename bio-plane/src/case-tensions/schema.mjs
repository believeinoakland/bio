/* case-tensions' tables (requirements: `build/requirements/case-tensions.md`; R2, R5, R7, R10). Copied from
 * `publication`'s schema with their comments (K617, K1505; T33-62): `case_revision_flags`, `observation_attributions` and
 * `capture_attributions` move here with their writers (one table, one writer, P7). The names and columns are unchanged,
 * so a store's existing rows stay: `CREATE TABLE IF NOT EXISTS`, and DEC-88's `reason` added by hand to a table written
 * before it. Each is declared to record-core (`declareTable`, plan T33 Rules (6)) at the classes `declarePurge` gave it
 * in `publication` (K23): the flags and the observation attributions by their bundle, the capture attributions by the
 * whole-store purge only (R10). */

export const CASE_TENSIONS_SCHEMA = `
-- CASE-4 / DEC-72: THE REVISION FLAG. A CASE EDITION FROZE A MEMBER AT A HASH,
-- AND THAT MEMBER HAS SINCE MINTED A NEW VERSION.
--
-- The design (CASE-AS-PRODUCTION.md, "Revised findings vs the cases containing
-- them"): a case is a frozen, signed edition, honest as of its date. When a
-- member finding is later revised, the containing cases are FLAGGED, never
-- silently updated and never automatically re-published -- the cascade doctrine
-- one level up. New editions are each owning project's deliberate act.
--
-- WHY A TABLE AND NOT A DERIVED READ, WHICH IS THE ONE STRUCTURAL DECISION HERE.
-- The condition itself IS derivable: CASE-5 unslaved the member's edition from
-- the case's and made a member resolve BY ITS PIN, so "this case's pin is no
-- longer this finding's current version" is one comparison over columns that
-- already exist. A derived answer was written first and is wrong for exactly one
-- reason: IT CLEARS ITSELF. Revert the finding to the pinned bytes, or let the
-- pin and the head agree again by any route, and the derived flag vanishes with
-- nobody having acted -- which is D-79's ruling one altitude up. So the
-- OBSERVATION is derived (from the pin, and from no second mechanism) and the
-- FLAG is written down, once, at the moment the revision mints.
--
-- SET-BUT-NEVER-CLEAR IS LITERAL. No statement anywhere DELETES a row here. An
-- owning project that acts ADDS the discharge to the row it discharges
-- (acted_at / acted_by / acted_edition), so the record holds both the flag and
-- what was done about it, in the order it happened. A row with acted_at NULL is
-- outstanding; a row with acted_at set is history, and history is not absence.
--
-- THE ACT THAT DISCHARGES IS A NEW RATIFIED EDITION OF THAT CASE (dischargeCaseFlags,
-- called by publication's commit), SCOPED TO case_id: a project acting on ITS case
-- reaches no other project's rows.
--
-- pinned_sha is the hash the case COMMITTED TO and revised_sha is the version that
-- superseded it as the finding's head. Both are stored rather than re-read: the
-- roster row can be re-pinned by a later edition, and a flag that re-read the pin
-- would silently re-describe what it was raised about.
--
-- Keyed (case_id, edition, bundle_id, revised_sha) so a member that revises
-- three times against one frozen edition raises three rows and not one.
--
-- DERIVED FROM NOTHING, so it is not rebuilt by a projection pass; it is a
-- record of events. It carries a bundle_id, so it is cleared by BOTH arms of
-- purge (D-113); R10's test purges a bundle and finds its flags gone.
CREATE TABLE IF NOT EXISTS case_revision_flags (
  case_id       TEXT NOT NULL,
  edition       INTEGER NOT NULL,  -- the CASE edition whose roster froze the pin
  bundle_id     TEXT NOT NULL,     -- the member finding that revised
  pinned_sha    TEXT NOT NULL,     -- what the case committed to
  revised_sha   TEXT NOT NULL,     -- the version that superseded it
  project_id    TEXT,              -- the OWNING project that must act. NULL for a pre-DEC-72 case, and STATED
  since         TEXT NOT NULL,
  acted_at      TEXT,              -- NULL while the flag stands. NEVER set back to NULL, and the row is never deleted
  acted_by      TEXT,              -- the member whose act discharged it
  acted_edition INTEGER,           -- the CASE edition that act published
  PRIMARY KEY (case_id, edition, bundle_id, revised_sha)
);
-- Outstanding-by-member is the question op=caseflags asks with a bundle_id, and
-- it is the only filter whose leading column is not the primary key's.
CREATE INDEX IF NOT EXISTS case_revision_flags_bundle ON case_revision_flags(bundle_id);

-- MK-7 / MEMBER-KNOWLEDGE-DESIGN.md section 4.2-4.6: THE ATTRIBUTION ACT. One row per
-- (case edition, observation): the level the observation's AUTHOR chose for what that edition's
-- published case document shows of them. Written only by op=attribute, taken by the author and by
-- nobody else, never prefilled. A later edition INHERITS the latest earlier edition's row until the
-- author acts again (section 4.3). chosen_by is the server-stamped author.
-- There is deliberately NO column that could hold an off-the-record source's identity: that
-- anonymity is a structural absence (section 4).
-- bundle_id is the OBSERVATION, so the rows are cleared by both arms of purge (D-113): an
-- attribution outliving its observation would attach to whatever bundle was next allocated its id.
-- reason is DEC-88's: the author's words on why this level, as written. NULL on a choice recorded
-- before DEC-88, never back-filled (K1050's form).
CREATE TABLE IF NOT EXISTS observation_attributions (
  case_id    TEXT NOT NULL,
  edition    INTEGER NOT NULL,
  bundle_id  TEXT NOT NULL,     -- the observation (an authored INFO bundle)
  level      TEXT NOT NULL CHECK (level IN ('group','project','cover','name')),
  chosen_by  TEXT NOT NULL,     -- the observation's author, stamped from the signed-in session
  chosen_at  TEXT NOT NULL,
  reason     TEXT,              -- DEC-88: why this level, in the author's words. NULL = chosen before DEC-88
  PRIMARY KEY (case_id, edition, bundle_id)
);
CREATE INDEX IF NOT EXISTS observation_attributions_bundle ON observation_attributions(bundle_id);

-- R7 (DEC-119 (3); DEC-102 items 1-3; N523): THE ATTESTING MEMBER'S CREDIT FOR OFF-THE-RECORD MATERIAL. One row per
-- (case edition, capture): the level the capture's attesting member (its actor, acquisition R16) chose for how that
-- edition credits their attestation of material from a source the case shows as Withheld. Written only by
-- op=attribute with capture, by that member and nobody else, never prefilled; a later edition inherits the latest
-- earlier edition's row, as observation_attributions'. capture_sha is a capture's SHA-256, never a bundle id, so the
-- rows are cleared by the whole-store purge only. reason is the member's words, as DEC-88 asks of an observation's.
CREATE TABLE IF NOT EXISTS capture_attributions (
  case_id     TEXT NOT NULL,
  edition     INTEGER NOT NULL,
  capture_sha TEXT NOT NULL,     -- the off-the-record capture (64 lowercase hex)
  level       TEXT NOT NULL CHECK (level IN ('group','project','cover','name')),
  chosen_by   TEXT NOT NULL,     -- the capture's attesting member, stamped from the signed-in session
  chosen_at   TEXT NOT NULL,
  reason      TEXT NOT NULL,     -- why this level, in the member's words
  PRIMARY KEY (case_id, edition, capture_sha)
);
`;

const CLASSES = Object.freeze({ purge: "clear", expunge: "none", export: "admin-only", derive: "stored", version_chain: false });

/** R10 (K23): the three tables, declared to record-core at the classes `publication`'s `declarePurge` gave them: the
 *  flags and the observation attributions keyed by `bundle_id` (cleared with their bundle and by the whole store), the
 *  capture attributions by the whole-store purge only (no bundle names a capture). */
export const CASE_TENSIONS_TABLES = Object.freeze([
  Object.freeze({ name: "case_revision_flags", keys: Object.freeze(["bundle_id"]), ...CLASSES, sight: "bundle" }),
  Object.freeze({ name: "observation_attributions", keys: Object.freeze(["bundle_id"]), ...CLASSES, sight: "bundle" }),
  Object.freeze({ name: "capture_attributions", keys: Object.freeze([]), ...CLASSES, sight: "group" }),
]);

/* DEC-88 (R5, K1058): the author's reason, added by hand to a table written before it. Additive and nullable, never
   back-filled: no act asked for one, and none may come out of a migration. */
const ADDITIVE_COLUMNS = [["observation_attributions", "reason", "TEXT"]];

/** Creates the tables, then adds a column an earlier shape lacks; idempotent, every boot. */
export function migrateCaseTensions(sql) {
  const bare = CASE_TENSIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  for (const [table, column, decl] of ADDITIVE_COLUMNS) {
    const have = [...sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
    if (have.length && !have.includes(column)) sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
  }
}
