/* SK-8 — THE EXTRACT ROLE'S PRODUCTIONS, AND THE FIRST EMISSION OF THE `ai` STEP.
 *
 * `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 is this module's authority and it
 * decided three things that are the shape of this file rather than background:
 *
 *   1. THE PILOT'S EXCLUSION IS CORRECTED, NOT LIFTED. The assistant pilot is
 *      READ-ONLY and its credential mints nothing. Nothing here widens it, and
 *      `ASSISTANT-PILOT.md` §5 exclusion 1 now says WHY.
 *   2. EXTRACT RUNS IN DEC-62's RUN — the object that already bounds, logs,
 *      resumes and checks a machine credential's work. **No new runtime, no new
 *      credential class, no new fence**, which is the test a correct answer had
 *      to pass, because a second place where a machine writes is a second place
 *      every fence must be re-proved. So this module holds no credential logic,
 *      no viewer gate, no attestation rule and no refusal family of its own: it
 *      is a VOCABULARY and four pure predicates, and every fence it relies on is
 *      already somewhere else and is cited at the site.
 *   3. THE SUBJECT AND THE OBJECTIVE STAY THE MEMBER'S (DEC-24 rule 2). A run
 *      begins on a member's act. This module cannot start one and does not know
 *      how.
 *
 * WHAT IT PRODUCES is `EXTRACTION-BREADTH-DESIGN.md` §4's table, unchanged, and
 * this item builds exactly its THIRD row: *a proposed reading — entities and
 * facts the registered readers did not find — carrying an `ai(function, version)`
 * step, its grade earned by what it names (an identifier in the text earns B as
 * today; a name C), never A, labelled.*
 *
 * ===================================================================== *
 * THE STEP, AND WHY IT IS `engine` AND NOT `function`
 * ===================================================================== *
 *
 * The design writes the step as `ai(function, version)`. The STEP AS LANDED —
 * I2's chain grammar, `textchain.mjs` `STEP_KINDS.ai`, designed at CPDF-10 and
 * emitted by nothing until this file — carries the performer in `engine`,
 * shared with the `ocr` step, and `checkChain` REFUSES an `ai` step that names
 * none (`TEXT_CHAIN_STEP_UNNAMED`). So `engine` IS the function: one field, one
 * refusal, one renderer (`describeChain` prints `engine (version)` for both
 * kinds). **A second field spelled `function` would be a shape change to I2 for
 * a producer's convenience** — the interface's first producer confirms the
 * designed shape rather than reshaping it on arrival, which is what IC-2's
 * CONFIRMED entries have meant since COFF-3.
 *
 * ONE INEXACTNESS IS STATED RATHER THAN SMOOTHED, and it is reported as a design
 * gap rather than fixed here: `STEP_KINDS.ai.label` reads *"a model rewrote the
 * text"*, and a proposed reading rewrites NOTHING — it reads text the record
 * already holds and proposes what that text names. The label therefore claims
 * MORE machine handling than happened, which is the conservative direction (it
 * can only weaken what a reader believes about the text, never strengthen it),
 * and it is I2's word, not this area's, so it is raised and not edited.
 *
 * ===================================================================== *
 * WHY A PROPOSED READING IS NOT WRITTEN INTO `readings`
 * ===================================================================== *
 *
 * §7.3 (6): an uncited machine-minted row is a PROPOSAL, *"never counted as
 * extraction coverage"*. `readings` / `reading_refs` / `reading_ref_terms` ARE
 * the extraction coverage — they are what `op=readingref`, `op=readingname`, the
 * recogniser and every earned-connection tier read. Writing a machine's proposal
 * into them would make the proposal count as coverage BY CONSTRUCTION, and no
 * label on top could undo it: the counts would already be wrong. So a proposed
 * reading lives in its own table and the separation is structural rather than
 * enforced by a predicate somebody has to remember to apply.
 *
 * AND THE SAME REASONING, INVERTED, IS WHY THE `ai` STEP IS NOT ON THE CONTENT
 * ROW'S CHAIN. A content row's id is `hash(capture, extent, chain)` (REC-82,
 * SK-7) and that is exactly what lets a member's later citation of the same
 * passage FIND the machine's row instead of minting a second one — which is
 * 5.7's third clause and the whole mechanism by which a proposal becomes part of
 * a finding. Appending an `ai` step to the chain a minted row carries would
 * change the id, the member's citation would mint a DIFFERENT row, and the
 * machine's proposal could never be cited by anybody. The machine did not
 * transcribe the passage; the capture's chain is the passage's chain, untouched.
 * The `ai` step belongs to the READING, which is what the machine actually
 * derived.
 */

import { BASIS_GRADES } from "../checks/bio-checks.mjs";
import { appendStep, checkChain, derivationCap, readingSource } from "./textchain.mjs";

/* ------------------------------------------------------------------ *
 * The vocabulary
 * ------------------------------------------------------------------ */

/** The `ai_runs.mode` an EXTRACT run carries.
 *
 *  IT IS THE PLANE'S WORD AND IT IS DELIBERATELY NOT A ROW IN THE FLEET
 *  MEMBER'S `MODES` TABLE, which is a different roster answering a different
 *  question. `agent-worker/src/harness.mjs` `MODES` is the DEPLOYMENT gate —
 *  which mode the fleet member may DRIVE — and `gate-mode` is the first row
 *  every run's control flow takes. The plane has always stored `ai_runs.mode`
 *  verbatim and judged nothing about it. Adding a third row to that table is a
 *  deployment act in FLEET's lane, pinned in both directions by SK-4's
 *  `skillsequencing.test.mjs` ARM B4, and it is raised as a DELEGATION rather
 *  than reached into from here. */
export const EXTRACT_RUN_MODE = "extract";

/** The functions an `ai` step may name, with what each one DID.
 *
 *  ONE ENTRY, AND THAT IS THE ROSTER'S RULE RATHER THAN ITS CURRENT SIZE: a
 *  function is in this object when something in this repository EMITS it. The
 *  other machine production `EXTRACTION-BREADTH-DESIGN.md` §4 names — cleaned or
 *  normalised text as a derivation over the machine's output — has no producer
 *  and is therefore absent, not listed-as-future. A roster carrying names
 *  nothing writes is how `runtime-ceiling-reached` came to be a word with no
 *  producer for weeks (§14b.6), and the correction that item recorded is the
 *  rule applied here. */
export const EXTRACT_FUNCTIONS = {
  "propose-reading":
    "read the text this record already holds and propose what it names — entities and facts the "
  + "registered readers did not find. It rewrites no text and produces no new transcription",
};

/** The strongest grade a proposed reading's reference may earn, and it is a
 *  CEILING on a computation rather than a value anybody assigns.
 *
 *  §4's table: *"its grade earned by what it names (an identifier in the text
 *  earns B as today; a name C); never A"*. A is the framework §8.1 tier for a
 *  reference the SOURCE ITSELF assigned and the container itself carried — an id
 *  in a URL, a key in the document's own structure. A machine reading prose has
 *  no access to that fact: it read a string that LOOKS like an identifier. That
 *  is worth exactly what a registered reader's ref_key is worth, which is B. */
export const PROPOSED_READING_CEILING = "B";

const rank = (letter) => {
  const i = BASIS_GRADES.indexOf(letter);
  return i < 0 ? null : i;
};
const isNonEmptyString = (s) => typeof s === "string" && s.trim().length > 0;

/* ------------------------------------------------------------------ *
 * The predicates
 * ------------------------------------------------------------------ */

/** `{ ok: false, reason, detail }` in `contentRead`'s shape, or null.
 *
 *  THESE ARE `reason` REFUSALS AND NOT DEC-49 CATALOGUE ROWS, on SK-7's
 *  precedent one construct over and for its measured reason: the DEC-49 guard
 *  harvests every `/_CHECKS$/` export as a refusal family, and a DOOR'S OWN
 *  SHAPE refusal has never been one. What a caller can earn from the RECORD —
 *  a chain that strengthens, an extent that does not cover — is a C-number and
 *  is returned VERBATIM from the module that owns it, never re-composed here. */
const no = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });

/** Is this a function this repository emits? */
export function checkExtractFunction(fn) {
  if (!isNonEmptyString(fn))
    return no("NO_FUNCTION",
      `an ai() step names WHAT performed the derivation, and this proposal names nothing. `
    + `The chain exists to carry that fact: a calibration is OF a function and a version, and `
    + `neither can be recovered from the word 'ai'`);
  if (!Object.prototype.hasOwnProperty.call(EXTRACT_FUNCTIONS, fn))
    return no("UNKNOWN_FUNCTION",
      `'${String(fn).slice(0, 60)}' is not one of the EXTRACT functions this repository emits `
    + `(${Object.keys(EXTRACT_FUNCTIONS).join(", ")}). A function is in that roster when something `
    + `produces it, so a name that is not there names no producer`,
      { functions: Object.keys(EXTRACT_FUNCTIONS) });
  return null;
}

/** The version half of `ai(function, version)`.
 *
 *  REQUIRED, where `checkChain` leaves it optional, and the narrowing is
 *  deliberate at THIS door rather than in the grammar: I2's grammar has to admit
 *  every chain written before a version was carried, and a fence tighter than
 *  its rule applied there would be an undeclared interface change. Here there is
 *  no history — this is the first producer — so an unversioned proposal is
 *  refused at the only place that can refuse it without breaking anything. */
export function checkExtractVersion(version) {
  if (!isNonEmptyString(version))
    return no("NO_FUNCTION_VERSION",
      `an ai() step names a function AND a version. A proposal nobody can re-run against the same `
    + `version is a proposal nobody can check, and the version is what a later calibration would `
    + `be OF`);
  return null;
}

/** WHAT DID THIS REFERENCE NAME, and therefore what has it earned?
 *
 *  COMPUTED, NEVER DECLARED. SK-2's rule for the whole AI track is that *grades
 *  are COMPOSED, never MINTED*, so this takes the reference and returns the
 *  letter; there is no parameter by which a caller could offer one, which is
 *  why the refusal for a caller that tries lives at the door and not here.
 *
 *  `ref_kind` + `ref_key` is the source-assigned identifier shape the registered
 *  readers already write (`reading_refs`, FW-5) — `meeting:2101`, a key the
 *  document itself carries. A machine that read that string out of the text has
 *  named an identifier and earns B. A machine that has only a NAME has named the
 *  weakest thing framework §8.1 grades and earns C. There is no third answer and
 *  no route to A: see `PROPOSED_READING_CEILING`. */
export function proposedReadingGrade(entry) {
  const e = entry && typeof entry === "object" ? entry : {};
  /* THE LETTER IS DECIDED ONCE AND THE SENTENCE IS COMPOSED FROM IT, and that
     shape was earned by a control arm rather than chosen. The first cut wrote
     each branch's letter and its sentence as two independent literals, and
     `nc-sk8.mjs`'s `overstrict` arm — which promotes a name-only proposal from C
     to B — produced a SURPRISING GREEN on the sentence assertion: the grade had
     moved and the sentence still said *names only a NAME*, so the record would
     have published a B explained by a C's reason and nothing in this repository
     could have noticed. That is the drift class this project meets most, arriving
     inside the one function whose whole job is to say what a grade rests on. The
     letter is now interpolated INTO the sentence, so the two cannot disagree and
     the arm fails as declared. */
  if (isNonEmptyString(e.refKind) && isNonEmptyString(e.refKey)) {
    const grade = "B";
    return { grade,
             why: `earned ${grade}: this proposal names an identifier the document itself carries `
                + `(${String(e.refKind).slice(0, 40)}:${String(e.refKey).slice(0, 60)}), read out of the `
                + `text by a machine rather than taken from the source's own structure — which is what `
                + `a registered reader's reference key is worth, and one letter below the A a `
                + `source-assigned reference earns` };
  }
  if (isNonEmptyString(e.label)) {
    const grade = "C";
    return { grade,
             why: `earned ${grade}: this proposal names only a NAME, which is the weakest thing the `
                + `framework grades — a document that mentions a subject by name carries no reference `
                + `the source assigned` };
  }
  return { grade: null,
           why: `earned nothing: this proposal names neither an identifier nor a name, so there is `
              + `nothing to grade. Undetermined is stated rather than defaulted to the weakest `
              + `letter, because a letter is a claim and there is no claim here` };
}

/** One proposed reference, checked. Returns a refusal or null.
 *
 *  THE GRADE IS REFUSED FROM A CALLER BY NAME, and that is the sharpest rule at
 *  this door. A machine handing the record a letter is the machine grading its
 *  own work, which DEC-24 rule 3 rules out and which SK-2 states as the track's
 *  first constraint. It is refused rather than ignored: silently dropping it
 *  would let a caller believe it had been honoured. */
export function checkProposedRef(entry) {
  const e = entry && typeof entry === "object" && !Array.isArray(entry) ? entry : null;
  if (!e) return no("PROPOSAL_SHAPE", `a proposed reference is an object`);
  if (e.grade !== undefined || e.earned !== undefined)
    return no("GRADE_OFFERED",
      `this proposal offers its own grade. Grades here are COMPOSED from what a reference NAMES and `
    + `never minted by the thing that produced it (DEC-24 rule 3): a machine grading its own reading `
    + `is the one act this role may not perform. Send what you found and the record will say what it `
    + `is worth`);
  if (!isNonEmptyString(e.ref))
    return no("PROPOSAL_NO_REF",
      `a proposed reference carries the reference AS IT APPEARS — the raw string the reading names — `
    + `which is what makes it joinable to everything the registered readers wrote`);
  const { grade } = proposedReadingGrade(e);
  if (grade == null)
    return no("PROPOSAL_NAMES_NOTHING",
      `this proposal carries a reference string but names neither an identifier (a kind and a key) `
    + `nor a name (a label). There is nothing for the record to grade, and a row that cannot be `
    + `graded cannot become part of a finding`);
  if (rank(grade) != null && rank(grade) < rank(PROPOSED_READING_CEILING))
    /* UNREACHABLE TODAY AND KEPT ON PURPOSE. `proposedReadingGrade` returns only
       B or C, so nothing reaches this branch from the function above it. It is
       the ceiling stated as a REFUSAL rather than as a comment, so that the day
       somebody widens the grade rule the ceiling is a thing that fires instead
       of a sentence somebody has to re-read. The suite drives it directly. */
    return no("PROPOSAL_ABOVE_CEILING",
      `a proposed reading earned ${grade}, which is stronger than the ${PROPOSED_READING_CEILING} `
    + `a machine reading text may reach. A is what a reference the SOURCE assigned is worth and a `
    + `machine that read a string out of prose did not get one`);
  /* The position is OPTIONAL and its absence is honest: a reading that cannot
     say WHERE is most readings today (FW-17 / IC-86), and `readingSource`'s own
     contract is that every malformed or incomplete input answers null rather
     than refusing — a gate that pressured a caller into inventing an address
     would be the bug this project names at gates. What is refused is a position
     PRESENT AND UNREADABLE, on `TEXT_CHAIN_CAL_REF`'s reasoning: an address
     nothing can resolve looks like a binding and joins to nothing. */
  if (e.source !== undefined && e.source !== null && readingSource(e.source) == null)
    return no("PROPOSAL_POSITION",
      `this proposal states WHERE it read the reference and the address cannot be read in IC-1's `
    + `element-reference vocabulary. An address nothing resolves is worse than the honest absence, `
    + `because it looks like a binding and joins to nothing`);
  return null;
}

/** THE CHAIN A PROPOSED READING RESTS ON: the capture's own chain with one
 *  `ai(function, version)` step appended.
 *
 *  RULE 2 IS ENFORCED BY `appendStep` AND NOT RE-IMPLEMENTED HERE. That is the
 *  point of routing through it: the refusal a caller earns for a step claiming a
 *  cap stronger than its input is `TEXT_CHAIN_STRENGTHENS`, returned verbatim
 *  from the module that owns rule 2, so there is exactly one place in this
 *  repository where a derivation is told it may only weaken.
 *
 *  `cap` ABSENT MEANS UNDETERMINED AND SAYS SO. No calibration of any
 *  propose-reading function exists — `calibration.mjs` is what would supply one
 *  — so the honest step carries no letter, `derivationCap` skips it, and the
 *  chain keeps the cap the capture's own transcription earned. That is NOT the
 *  step claiming the capture's letter for itself: the step claims nothing, which
 *  is a different fact and is the one the record can support.
 *
 *  Returns `{ ok: true, chain, cap }` or a refusal (a `reason` refusal from this
 *  door, or a DEC-49 refusal from `textchain` passed through untouched). */
export function proposalChain(captureChain, { fn, version, cap = null } = {}) {
  const badFn = checkExtractFunction(fn); if (badFn) return badFn;
  const badVer = checkExtractVersion(version); if (badVer) return badVer;
  /* A capture with NO chain is not a capture a machine may propose a reading
     over, and the refusal says which absence it is (CLAUDE.md's sparse rule:
     four absences, four different facts). A chain is what the ai step EXTENDS —
     there is nothing to weaken and nothing to append to. */
  const badChain = checkChain(captureChain);
  if (badChain)
    return no("NO_CAPTURE_CHAIN",
      `this capture's text carries no provenance chain, so there is nothing for an ai() step to `
    + `extend. A proposed reading is a derivation OF the text this record holds, and a derivation `
    + `of text with no stated provenance would be a claim resting on nothing`,
      { chain_refusal: badChain });
  if (cap != null && rank(cap) == null)
    return no("CAP_NOT_A_GRADE",
      `'${String(cap).slice(0, 20)}' is not one of ${BASIS_GRADES.join(", ")}. A step's cap is the `
    + `strongest transcription fidelity it can support and it is a MEASUREMENT — absent means `
    + `undetermined and stated, never a letter chosen to get past this line`);
  const out = appendStep(captureChain, { step: "ai", engine: fn, version: String(version).trim(),
                                         cap: cap == null ? null : cap });
  /* `appendStep` returns the new chain OR a refusal object. A refusal is not an
     array, which is how the two are told apart — and it is told apart by SHAPE
     rather than by looking for a `code` key, because a chain is the only array
     this function can receive back. */
  if (!Array.isArray(out)) return { ok: false, ...out };
  return { ok: true, chain: out, cap: derivationCap(out) };
}

/** THE MINTED-TO-CITED RATIO, §7.3 (6)'s instrument, computed from two counts.
 *
 *  *"If it never falls, the assistant is manufacturing citable-looking passages
 *  and the ratio is how anyone finds out."* The counts are the store's; the
 *  arithmetic is here so that there is ONE of it and a surface derives nothing
 *  (UI-38's rule, the same one `ai_run_bounds` stores `allowed` and `consumed`
 *  separately for).
 *
 *  ZERO MINTED IS NOT A RATIO OF ZERO AND MUST NOT READ AS ONE. A project where
 *  the assistant has minted nothing is a project with no evidence either way,
 *  and answering 0 would make the healthiest-looking number in this instrument
 *  mean two opposite things. It answers null and says which case it is. */
export function mintRatio({ minted = 0, cited = 0 } = {}) {
  const m = Number.isFinite(Number(minted)) ? Math.max(0, Math.trunc(Number(minted))) : 0;
  const c = Number.isFinite(Number(cited)) ? Math.max(0, Math.trunc(Number(cited))) : 0;
  if (m === 0)
    return { minted: 0, cited: c, uncited: 0, ratio: null,
             says: `no machine credential has marked a passage citable in this scope, so there is `
                 + `nothing to measure. This is an absence and not a clean result` };
  const uncited = Math.max(0, m - c);
  return { minted: m, cited: c, uncited, ratio: c / m,
           says: `${c} of ${m} passage(s) a machine marked citable have been cited by a member. The `
               + `other ${uncited} are PROPOSALS: the record keeps them, labels them, and counts `
               + `none of them as extraction coverage. If this fraction never rises across runs, the `
               + `assistant is manufacturing citable-looking passages` };
}
