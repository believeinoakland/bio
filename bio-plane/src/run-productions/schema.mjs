/* run-productions' tables (requirements: `build/requirements/run-productions.md`, R2, R11, R17; K4, K23). Moved out of
 * the legacy `schema.mjs` at this module's extraction, with the comments that record why each is shaped as it is:
 * `suggest_refusals` (R2's memo of a refused submission, keyed by its target) and `proposed_readings` (R11's
 * productions, keyed by their bundle). Both are declared to record-core's purge (R17). */

export const RUN_PRODUCTIONS_SCHEMA = `
-- PL-3 / IS-4 / F10 -- THE REFUSED SUBMISSION, KEPT SO A VERBATIM RESUBMIT IS A
-- STRUCTURAL NO-OP. F10 rules that the design says how the plane REFUSES and
-- never how a run must RESPOND, so a retry loop that resends the identical
-- submission would otherwise be caught only by the budget -- and the budget is
-- the backstop, not the mechanism. This table makes the second submission
-- change nothing at all: no re-evaluation, no write, no tick.
--
-- THE KEY IS THE SUBMISSION ITSELF, BYTE FOR BYTE, AND NOT A HASH. That is
-- PL-1's own reasoning transplanted: a hand-rolled synchronous hash would put a
-- collision argument underneath a mechanism that decides whether a caller is
-- told the truth about its own submission, and the composition is bounded
-- already because the endpoint caps a version's legs.
--
-- base_sha IS PART OF THE IDENTITY, and it is what stops the key going stale
-- into a false refusal. "Verbatim resubmit" means NOTHING HAS CHANGED --
-- neither the submission nor the document it would be written into. The moment
-- the inquiry moves, the same submission is a different question and is
-- evaluated again.
--
-- SCRATCH-CLASS, in capture_sessions' and ai_runs' family and NOT record: it
-- holds no member act, nothing derived from one, and nothing a case is built
-- on. Its name deliberately carries no "version" substring -- PL-1 pinned the
-- tables carrying versions of a basis at exactly two, and this carries
-- refusals.
CREATE TABLE IF NOT EXISTS suggest_refusals (
  target      TEXT NOT NULL,      -- the inquiry the submission was aimed at
  submission  TEXT NOT NULL,      -- the canonical submission, compared BYTE FOR BYTE
  base_sha    TEXT NOT NULL,      -- the inquiry's bundle_sha when the refusal was made
  code        TEXT NOT NULL,      -- the DEC-49 wire code that was returned
  payload     TEXT NOT NULL,      -- the refusal, verbatim, so the resubmit answers identically
  first_at    TEXT NOT NULL,
  last_at     TEXT NOT NULL,
  repeats     INTEGER NOT NULL DEFAULT 0,  -- how many verbatim resubmits this refusal has absorbed
  PRIMARY KEY (target, base_sha, submission)
);
CREATE INDEX IF NOT EXISTS suggest_refusals_target ON suggest_refusals(target);

-- SK-8 / EXTRACTION-BREADTH-DESIGN.md section 4's THIRD production row, placed by
-- BIO_Assistant_and_AI_Roles_v0_1.md section 7.3: A PROPOSED READING -- entities
-- and facts the registered readers did not find, proposed by an EXTRACT run
-- inside DEC-62's run object, carrying the ai(function, version) step this
-- record designed at CPDF-10 and nothing emitted until now.
--
-- WHY IT IS NOT readings / reading_refs, AND THE REASON IS STRUCTURAL RATHER
-- THAN TIDINESS. Section 7.3 (6): an uncited machine-minted row is a PROPOSAL,
-- "never counted as extraction coverage". Those three tables ARE the extraction
-- coverage -- op=readingref, op=readingname, the recogniser and every earned
-- connection tier read them -- so a machine's proposal written there would count
-- as coverage BY CONSTRUCTION, and no label on top could undo a count that was
-- already wrong. The separation is the mechanism, not a convention somebody has
-- to remember. The corollary is the same reasoning inverted and it is in
-- extractrun.mjs's header: the ai step is NOT on a minted content row's chain,
-- because the content id is hash(capture, extent, chain) and changing it is
-- exactly how a member's later citation would stop FINDING the machine's row.
--
-- chain IS THE PROPOSAL'S OWN CHAIN: the capture's chain with one ai step
-- appended through textchain's appendStep, so rule 2 (every derivation weakens)
-- is enforced by the module that owns it and TEXT_CHAIN_STRENGTHENS is the
-- refusal a caller earns. cap is the chain's computed derivation cap and NULL
-- means UNDETERMINED and STATED -- no calibration of any propose-reading
-- function exists, so the honest step carries no letter.
--
-- earned is B or C and is COMPUTED from what the reference NAMES, never
-- offered by the caller (DEC-24 rule 3 -- a caller that offers one is refused by
-- name at the door). There is no route to A: A is what a reference the SOURCE
-- assigned is worth, and a machine that read a string out of prose did not get
-- one.
--
-- The three position columns are reading_refs' own, in IC-1's vocabulary and no
-- other, moving together exactly as they do there: a row has all three or none,
-- and NULL means THIS PROPOSAL CANNOT SAY WHERE rather than that the whole
-- document was meant.
--
-- content_id is the passage this proposal made citable, present exactly when
-- the run minted one through SK-7's door (op=contentmint's store half) -- which
-- needs a readable position, since a passage with no extent is the whole
-- document and minting that per reference would manufacture nothing useful.
-- NULL is the ordinary case and is not a failure.
--
-- DERIVED-BUT-AUTHORED, and purge treats it as instance-scoped state: a
-- per-bundle purge clears this document's proposals and a whole-store purge
-- clears them all (D-113), because a proposal that outlived the document it
-- points at would resolve to nothing.
CREATE TABLE IF NOT EXISTS proposed_readings (
  run          TEXT NOT NULL,     -- the ai_runs row this was produced inside. The bound lives there
  capture_sha  TEXT NOT NULL,     -- the text that was read
  bundle_id    TEXT NOT NULL,     -- purge, and the D-15 viewer join
  ref          TEXT NOT NULL,     -- the reference AS IT APPEARS, reading_refs' own key
  ref_kind     TEXT,              -- the source-assigned kind, when the proposal names an identifier
  ref_key      TEXT,              -- and its key. Both present is what earns B
  label        TEXT,              -- the name, when that is all the proposal has. Earns C
  fn           TEXT NOT NULL,     -- the ai step's function: EXTRACT_FUNCTIONS' key, carried in step.engine
  fn_version   TEXT NOT NULL,     -- and its version. A proposal nobody can re-run is one nobody can check
  chain        TEXT NOT NULL,     -- the capture's chain with the ai step appended, canonical JSON
  cap          TEXT,              -- the chain's derivation cap. NULL = undetermined, STATED
  earned       TEXT NOT NULL,     -- B or C, COMPUTED from what the reference names. Never A
  pos_kind     TEXT,              -- IC-1's discriminator: pdf-page | sheet-cell | slide-shape | doc-para
  pos          TEXT,              -- the per-arm fields as canonical JSON, key-ordered
  pos_ref      TEXT,              -- IC-1's REQUIRED human form, produced by the container that knows it
  content_id   TEXT,              -- the passage this made citable, when one was minted. NULL is ordinary
  proposed_by  TEXT NOT NULL,     -- the machine credential, stamped server-side. Never a caller's word
  at           TEXT NOT NULL,
  PRIMARY KEY (run, capture_sha, ref)
);
-- By BUNDLE: purge's per-bundle arm and the read a member asks of a document.
-- By RUN: the run's own productions, which is what the bound is a bound ON.
CREATE INDEX IF NOT EXISTS proposed_readings_bundle ON proposed_readings(bundle_id);
CREATE INDEX IF NOT EXISTS proposed_readings_run ON proposed_readings(run);
`;

/** The declaration to record-core's purge (its R21, R46; R17): the proposals by their bundle, the refusals by their
 *  target. */
export const RUN_PRODUCTIONS_TABLES = Object.freeze([
  "proposed_readings",
  { name: "suggest_refusals", keys: ["target"] },
]);

/** Which of the legacy declarations this module now owns (the legacy store filters them out of its own list). */
export function runProductionsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return name === "proposed_readings" || name === "suggest_refusals";
}

/** The module's tables, created where absent. The statements are the schema text above, run one by one. */
export function migrateRunProductions(sql) {
  const bare = RUN_PRODUCTIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const stmt of bare.split(";")) if (stmt.trim()) sql.exec(stmt);
}
