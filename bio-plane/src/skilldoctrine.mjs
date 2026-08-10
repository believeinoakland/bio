/* SK-2 — THE INVESTIGATIVE SKILL. JUDGEMENT ONLY, AND IT HOLDS NO GATE.
 *
 * `IS-BUILD-PLAN.md` SK-2; `INVESTIGATIVE-SESSION.md` §5 (composition), §6 rule
 * 1 (the description), §9 (the five kinds), §11 (the observation log), §14
 * (bias — a fence first and a skill requirement second), §14b.4 (what is
 * scripted and what is judged); `CLAUDE.md`'s sparse-at-every-level section;
 * `docs/archive/IS-SWEEP-2026-08-07.md` §1.3 and §3.
 *
 * PURE, for `skillpack.mjs`'s stated reason: no storage, no clock, no viewer.
 * It renders into SK-1's pack as progressively-disclosed layers (§14b.1) and is
 * a SIBLING of that file rather than an edit inside the plane's own code.
 *
 * ---------------------------------------------------------------------------
 * THE ONE RULE THAT SHAPES EVERY LINE BELOW: A SKILL MAY NEVER HOLD A GATE
 * ---------------------------------------------------------------------------
 *
 * §14b.4: *"The gates must not depend on the skill behaving well. A skill is
 * instructions; a fence is code."* A gate written into a prompt is the DEFECT
 * that section names, not a cheaper way of building one — a model ignoring this
 * text must not be able to get past anything, because there is nothing here to
 * get past.
 *
 * So this file states what the model DECIDES and, wherever it touches something
 * the model does not decide, it names the thing that actually decides it. Three
 * mechanical consequences, each of which its suite holds:
 *
 *   1. `DEFERRED_ROWS` and `JUDGED_ROWS` are §14b.4's TABLE, both columns,
 *      verbatim. `test/skilldoctrine.test.mjs` parses that table out of the
 *      design document and fails if either column has moved. **The skill's
 *      authority is exactly the right-hand column and nothing else.**
 *   2. Every clause's `defers` names rows from the LEFT column. The union of
 *      them must cover that column — a deterministic row nothing defers is a
 *      row the skill has quietly taken.
 *   3. Every clause's `decides` text is scanned for CONTROL-FLOW AUTHORITY
 *      (`controlFlowAuthority` below) and must carry none. The scan runs on the
 *      real doctrine AND on a fixture that must trip it, through one function.
 *
 * WHY THE SCAN READS `decides` AND NOT THE WHOLE CLAUSE, stated rather than
 * discovered: the deferral text is where a control-flow subject is legitimately
 * NAMED — *"the model never decides when the loop stops"* is a sentence this
 * file must be able to write, and a scanner that read it would fire on the very
 * doctrine it exists to protect. The GRANT is scanned; the DEFERRAL is required
 * to name its owner instead.
 *
 * ---------------------------------------------------------------------------
 * AND WHERE NOTHING ENFORCES A CLAUSE, THE CLAUSE SAYS SO
 * ---------------------------------------------------------------------------
 *
 * `CLAUDE.md`: *"Undetermined is first-class and must be STATED."* Applied to
 * fences, that means a clause backed by no code may not read like a clause
 * backed by code. Every clause therefore carries either a non-empty
 * `enforced_by` (C-numbers, read from the catalogue by KEY so no number is
 * typed here) or a non-empty `unenforced_because`, and the suite PRINTS how many
 * clauses are instruction-only. That number is the honest measure of how much of
 * this skill a careless model could ignore, and it is published rather than
 * implied.
 *
 * ---------------------------------------------------------------------------
 * EVERY VOCABULARY IS IMPORTED. THE AUTHORED SENTENCES ARE PINNED.
 * ---------------------------------------------------------------------------
 *
 * `ASSISTANT-PILOT.md` §1, and SK-1's measured finding: a hand copy agrees at
 * zero cost until the day the rule moves. The levels, the absence states, the
 * definitive subset, the earned grade sources, the inert sources and the
 * reporting spellings are all IMPORTED; the C-numbers are read off catalogue
 * rows by key. What is AUTHORED is doctrine prose, and every authored sentence
 * that quotes a document is checked against that document by the suite, exactly
 * as SK-1's four resident sentences are.
 *
 * THE FOUR LEVELS ARE SPELLED TWO WAYS IN THIS PLANE AND THIS FILE BRIDGES THEM
 * RATHER THAN PICKING ONE. `OBSERVATION_LEVELS` (the observation log's, D-129)
 * spells the third level in the singular; `SUGGEST_LEVELS` (what a `level-empty`
 * suggestion is REFUSED against) spells it in the plural. A run reporting one
 * absence writes both. `reportsAs` derives the second from the first instead of
 * typing either, and the divergence is DELEGATED in `CLAIMS.md` because both
 * rosters are outside this area's paths.
 * ========================================================================= */

import { OBSERVATION_LEVELS, OBSERVATION_STATES, DEFINITIVE_STATES,
         AI_RUN_CHECKS } from "./airun.mjs";
import { SUGGEST_LEVELS, SUGGEST_CHECKS, MACHINE_FENCE_CHECKS,
         EARNED_GRADE_SOURCES, VERSION_STRENGTH_INERT_SOURCES,
         BASIS_ROLES } from "../checks/bio-checks.mjs";

export const JUDGEMENT_ID = "investigative-judgement";
export const JUDGEMENT_EDITION = "1";

/* =========================================================================
 * §14b.4's TABLE, BOTH COLUMNS, VERBATIM
 *
 * Authored here and PINNED to the design document by the suite, which parses
 * the table and compares. This is the authored-layer treatment SK-1 gave its
 * four resident sentences, for the same reason: the slowest-drifting layer
 * still may not drift SILENTLY. It is the one place this file writes prose it
 * did not compute, and it is the one place the suite reads a document.
 * ========================================================================= */

/** The LEFT column. Code, never skill. Nothing here is a decision this file
 *  makes, and every clause that touches one of these names it in `defers`. */
export const DEFERRED_ROWS = [
  "how many search passes, and when the loop stops",
  "the fan-out across the four levels",
  "a version is written in `suggested` and no other state",
  "dedup against existing versions before writing",
  "the observation log is written whether or not the run succeeds",
  "every machine fence",
];

/** The RIGHT column. THE WHOLE of what this skill is permitted to decide. A
 *  clause claiming authority outside this list is a clause taking ground the
 *  design gave to code. */
export const JUDGED_ROWS = [
  "what to search for",
  "what each level's reports mean",
  "what the version says",
  "whether this reading differs in substance",
  "where it stopped and why",
];

/** WHERE THE TABLE LIVES, so the arm that checks it has an address rather than
 *  a search. Repo-relative, in `AUTHORED_SOURCES`' shape. */
export const TABLE_SOURCE = "docs/development/INVESTIGATIVE-SESSION.md";

/** The measured evidence for the first deferred row, carried with its figures
 *  because the row is the one a model is most likely to think it can improve
 *  on. Quoted from the design document and pinned to it by the suite. */
export const LOOP_TERMINATION_EVIDENCE =
  "TREC 2011 found searchers estimating their own recall erred by up to +95/−87 points and "
  + "terminated review prematurely on a false belief of high recall";

/* =========================================================================
 * THE CONTROL-FLOW AUTHORITY SCAN — the runnable half of SK-2's control
 *
 * `IS-BUILD-PLAN.md`'s own review of this row: *"SK-2's NC is a review
 * criterion, not a runnable control — its code half is FL-3's deterministic
 * table, and a source-scan over the skill text should ship with SK-2."* This is
 * that scan.
 *
 * IT IS A BOUNDARY, NOT A PROSE JUDGE, and the limit is stated for the same
 * reason `isBoilerplate` states its own: a clause that said *"keep going while
 * it still feels productive"* gets past every pattern below, and a scan that
 * pretended otherwise would claim a competence it does not have. What it DOES
 * catch is the shape a gate takes when somebody writes one into a prompt — a
 * count, a termination condition, or a decision about either handed to the
 * reader.
 * ========================================================================= */

/** The subjects the left column is about, as words a sentence would use. Not a
 *  vocabulary of the record's — a scanner's alphabet — so it is written plainly
 *  rather than assembled to dodge this file's own sourcing arm.
 *
 *  TWO SETS, AND THE DIFFERENCE IS `levels`, MEASURED RATHER THAN GUESSED. A
 *  BARE numeral beside a flow subject is a budget somebody wrote down — "three
 *  passes", "5 sub-sessions". Beside `levels` it is not: there are four levels
 *  because `OBSERVATION_LEVELS` has four members, so "the four levels" is a
 *  DESCRIPTION of an imported vocabulary and the phrase `CLAUDE.md` itself uses.
 *  Flagging it would make the scan refuse the plainest correct way to name the
 *  subject, and an author would then phrase around the detector — prose shaped
 *  by the instrument instead of measured by it. A QUANTIFIED bound on levels
 *  ("at most two levels") is a real fan-out bound and stays in the first set. */
const FLOW_SUBJECTS = "passes|levels|sub-?sessions|fetches|attempts|rounds|versions|searches";
const COUNTED_SUBJECTS = "passes|sub-?sessions|fetches|attempts|rounds|versions|searches";

export const CONTROL_FLOW_AUTHORITY = [
  /* A COUNT. "at most three passes", "up to 5 sub-sessions", "at most two levels". */
  { name: "a bound stated as a quantity",
    re: new RegExp(String.raw`\b(?:at most|no more than|up to|at least|no fewer than|exactly)\s+\S+\s+(?:${FLOW_SUBJECTS})\b`, "i") },
  /* A BARE NUMERAL against a flow subject. "three passes", "4 fetches". */
  { name: "a bound stated as a numeral",
    re: new RegExp(String.raw`\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:more\s+)?(?:${COUNTED_SUBJECTS})\b`, "i") },
  /* A TERMINATION CONDITION handed to the reader. */
  { name: "a termination condition",
    re: /\b(?:stop|terminate|halt|end|finish|conclude)\s+(?:the\s+|your\s+|this\s+)?(?:loop|search|searching|run|passes|fan-?out)\b/i },
  /* THE DECISION about termination handed to the reader — the exact shape
     §14b.4's first row forbids, and SK-2's negative control's own subject.
     NARROWED AFTER IT FIRED ON ITS OWN DOCTRINE, and the narrowing is the
     finding rather than a repair: written as decide/judge + when|whether|how
     many, it flagged *"judge whether this reading differs in substance"* —
     which is a row of §14b.4's RIGHT column and the one thing this clause is
     granted. A detector that refuses a granted judgement would push the next
     author to phrase the grant around it, which is how a scan starts shaping
     prose instead of measuring it. It now requires the OBJECT to be control
     flow: a stopping point, or a count of something the harness fans out. */
  { name: "the termination decision itself",
    re: new RegExp(String.raw`\b(?:decide|judge|choose|determine|work out)\s+(?:for yourself\s+)?(?:when\b[^.]{0,32}?\b(?:stop|end|halt|terminate|finish|enough)|how\s+many\b|whether\s+to\s+(?:continue|stop|keep))`, "i") },
  /* SATISFACTION AS A STOPPING RULE — TREC 2011's measured failure, in the
     words it would actually be written in. */
  { name: "self-assessed recall as a stopping rule",
    re: /\b(?:when|once|until)\s+you\s+(?:are\s+satisfied|are\s+confident|think|believe|feel|judge|have\s+enough)\b/i },
  /* A LOOP written as an instruction. */
  { name: "a loop written as an instruction",
    re: /\b(?:repeat|iterate|keep\s+(?:going|searching)|loop)\b(?:[^.]{0,40}?\b(?:until|while)\b)?/i },
];

/** Which authority patterns a piece of skill text trips. Exported so the suite
 *  runs THE SAME function over the real doctrine and over a fixture that must
 *  trip it — never a parallel implementation that agrees at zero cost. */
export function controlFlowAuthority(text) {
  const s = typeof text === "string" ? text : "";
  return CONTROL_FLOW_AUTHORITY.filter((p) => p.re.test(s)).map((p) => p.name);
}

/* =========================================================================
 * THE CLAUSES
 *
 * Each is `{ id, decides, defers, enforced_by, unenforced_because, why }`:
 *
 *   decides            what the model decides. SCANNED. Must name a member of
 *                      JUDGED_ROWS in `judges` and carry no flow authority.
 *   judges             which right-column rows this clause exercises.
 *   defers             which LEFT-column rows it touches and does not decide.
 *   enforced_by        C-numbers, read off catalogue rows by KEY. None typed.
 *   unenforced_because required when `enforced_by` is empty — an instruction
 *                      with no code behind it says so rather than reading like
 *                      one that has.
 * ========================================================================= */

/* Catalogue rows, resolved to their C-numbers by key so this file holds no
   number of its own. A row renamed in the catalogue fails at import rather than
   leaving a stale number that still looks like a citation. */
const C = {
  hunch_needs_author:   "C-2.8",            /* checkEarnedLeg's hunch arms — see below */
  boilerplate:          SUGGEST_CHECKS.SUGGEST_BOILERPLATE.check,
  unwritable_state:     SUGGEST_CHECKS.SUGGEST_UNWRITABLE_STATE.check,
  not_different:        SUGGEST_CHECKS.SUGGEST_NOT_DIFFERENT.check,
  comparison_incomplete: SUGGEST_CHECKS.SUGGEST_COMPARISON_INCOMPLETE.check,
  branches_not_independent: SUGGEST_CHECKS.SUGGEST_BRANCHES_NOT_INDEPENDENT.check,
  empty_level_unstated: SUGGEST_CHECKS.SUGGEST_EMPTY_LEVEL_UNSTATED.check,
  leg_unreachable:      SUGGEST_CHECKS.SUGGEST_LEG_UNREACHABLE.check,
  cannot_conclude:      MACHINE_FENCE_CHECKS.MACHINE_CANNOT_CONCLUDE.check,
  cannot_ground:        MACHINE_FENCE_CHECKS.MACHINE_CANNOT_GROUND.check,
  skill_version:        AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED.check,
};

/* THE ONE C-NUMBER WRITTEN OUT, AND IT IS WRITTEN OUT BECAUSE IT HAS NO ROW TO
   READ. `checkEarnedLeg`'s hunch arms — a hunch with no author, a hunch with no
   date — push `C-2.8` at the call site rather than through a keyed registry the
   way the SUGGEST and MACHINE families do, so there is no `.check` here to
   resolve. Hiding that behind a computed expression would make this file look
   uniformly driven when one member of it is not, which is the false-coverage
   shape this project keeps measuring. It is instead NAMED as the exception and
   PINNED: the suite asserts the catalogue's source still pushes this number on
   a hunch with no author, so a renumbering fails here rather than leaving a
   citation pointing nowhere. */

export const CLAUSES = [
  {
    id: "compose-never-mint",
    area: "composition",
    judges: ["what the version says"],
    decides:
      "Shape the legs. Decide which pieces of evidence bear on the claim, what each one is doing "
      + "against it, how the ground is partitioned, and which reading of the record they tell "
      + "together. One sentence may support, undercut and rebut the same claim at once (§5), so "
      + "what is being decided is a COMPOSITION and not a classification. The bar to clear is that "
      + "the existing calculation, run over the grades the record has already earned for these "
      + "legs, produces a result the evidence supports.",
    defers: ["a version is written in `suggested` and no other state"],
    enforced_by: [C.unwritable_state, C.leg_unreachable, C.branches_not_independent],
    why:
      "§5, and it makes the system smaller rather than larger: the intelligence goes into how the "
      + "legs are formed and weighted, never into a richer set of relationships for the record to "
      + "compute over. The calculation stays as simple as it already is.",
  },
  {
    id: "grades-are-composed",
    area: "composition",
    judges: ["what the version says"],
    decides:
      "Take every grade from the record. A grade is a fact about METHOD — how the connection was "
      + "established — and it arrives from the resolutions the legs rest on, exactly as `op=cite` "
      + "already fills it. Where the record has earned nothing for a leg, the leg is ungraded, it "
      + "is inert, and it is named as such. Composing legs whose EARNED grades produce a supported "
      + "calculation is the whole of what §5 means by assigning strength values.",
    defers: [],
    enforced_by: [C.hunch_needs_author],
    why:
      "SWEEP §1.3: a grade asserted rather than earned is forbidden by the ASSISTANT construct, "
      + "DEC-18 makes an ungraded leg inert and NAMED, and DEC-15 makes a hunch a member act. A "
      + "machine-composed leg is therefore never a hunch — it either carries a grade the record "
      + "earned or it is absent-and-named — and a hunch is unreachable to it because a hunch "
      + "carries the name and the date of the member declaring it, which no automated credential "
      + "has to give.",
  },
  {
    id: "description-to-a-commit-standard",
    area: "description",
    judges: ["what the version says", "where it stopped and why"],
    decides:
      "Write the description to a commit message's standard: what this composition says and why "
      + "these legs arranged this way tell it. It is the durable account — the conversation that "
      + "produced a version is deliberately not kept (DEC-61), so anything the description does "
      + "not carry is gone. Name every ungraded leg, and name it from the record's own answer "
      + "rather than from memory: the strength answer publishes the ungraded legs and the hunched "
      + "ones beside the graded ones, per axis and with the reason, and the description says what "
      + "that answer says.",
    defers: [],
    enforced_by: [C.boilerplate],
    why:
      "§6 rule 1 holds the description to a commit message's standard and §5 adds the naming of "
      + "every ungraded leg. DEC-18's plural clause is the obligation: inert must never mean "
      + "invisible. A required field filled to clear a gate is worse than an empty one, because it "
      + "reads to the next member as something somebody wrote.",
  },
  {
    id: "what-to-search-never-when-to-stop",
    area: "search",
    judges: ["what to search for"],
    decides:
      "Decide what to look for. Which questions the claim actually turns on, which bodies and "
      + "publishers would hold material bearing on them, what a document would have to say to "
      + "change the reading, and which of the record's own levels is worth asking next. That is "
      + "the judgement this skill exists to exercise, and it is exercised inside a step.",
    defers: ["how many search passes, and when the loop stops",
             "the fan-out across the four levels"],
    enforced_by: [],
    unenforced_because:
      "nothing refuses a poorly chosen query, and nothing could: WHAT to search for is judgement "
      + "and has no boundary a check could draw. What is fenced is the half that is not judgement "
      + "— the run's harness decides how many passes there are and when the loop stops, and this "
      + "clause takes none of that.",
    why:
      "§14b.4, and the evidential case is measured rather than stylistic: " + LOOP_TERMINATION_EVIDENCE
      + ". A searcher who believes recall is high stops early, and believing it is exactly what a "
      + "model asked to judge its own completeness would do.",
  },
  {
    id: "which-absence-per-level",
    area: "absence",
    judges: ["what each level's reports mean"],
    decides:
      "Read what each level's report MEANS, and say which absence it is. Absence at one level is "
      + "not evidence of absence at the next, so an empty answer is a fact about the record and "
      + "never about the world until the level beneath it has been asked. Report the absence in "
      + "the record's own state vocabulary, with the address of the search that establishes it, "
      + "and state which of the four facts it is — they are four different facts and must not read "
      + "alike.",
    defers: ["the fan-out across the four levels"],
    enforced_by: [C.empty_level_unstated],
    why:
      "`CLAUDE.md`'s sparse-at-every-level rule, and §9's `level-empty` kind exists so that a run "
      + "which honestly found nothing supportable is distinguishable from a run that emitted "
      + "nothing. Two absences that read alike collapse that distinction back again.",
  },
  {
    id: "difference-in-substance",
    area: "composition",
    judges: ["whether this reading differs in substance"],
    decides:
      "Judge whether a reading says something the record does not already hold. A version is a "
      + "complete alternative account rather than a patch, so the question is whether this account "
      + "differs in SUBSTANCE from the accounts already there — not whether its wording differs.",
    defers: ["dedup against existing versions before writing"],
    enforced_by: [C.not_different, C.comparison_incomplete],
    why:
      "§6 and §14b.5. The judgement is the model's; the comparison that refuses a duplicate is the "
      + "plane's, and it FAILS CLOSED when it cannot finish — not finishing the check is a "
      + "different fact from passing it.",
  },
  {
    id: "where-it-stopped-and-why",
    area: "search",
    judges: ["where it stopped and why"],
    decides:
      "Say where the work stopped and what that means. Which questions were left standing, what "
      + "would answer them, and what the reader must not read into what is missing. 'Source "
      + "unreachable' and 'our governor held us' are different facts and are written as different "
      + "facts; a capture that came back as a client-rendered shell is indeterminate and is never "
      + "written as presence.",
    defers: ["the observation log is written whether or not the run succeeds"],
    enforced_by: [],
    unenforced_because:
      "the log's EXISTENCE is guaranteed by the harness — it is appended whether or not the run "
      + "succeeds — and its entries are refused without a level and a state. What no check can "
      + "reach is whether the account written into it is HONEST about what was not reached, which "
      + "is judgement and is stated here as one.",
    why:
      "§11 and §14b.6. D-104 is the measured case: a log that writes 'source unreachable' when the "
      + "truth is 'our governor held us' manufactures a false absence, and our governor refusing "
      + "is not the source failing.",
  },
  {
    id: "bias-minimisation-on-top-of-the-fence",
    area: "bias",
    judges: [],
    decides:
      "Weigh evidence the same way whichever side of the claim it lands on, and say so where it "
      + "matters. Look for what would undercut the reading as hard as for what supports it; treat "
      + "a source that cuts against the member's expectation exactly as one that meets it; do not "
      + "let the order material arrived in decide what the reading is. Where a leg's weight rests "
      + "on a judgement rather than on the record, the description says which judgement.",
    defers: [],
    enforced_by: [],
    unenforced_because:
      "the FENCE is already code and is not this clause: the search half of a run receives no "
      + "manifest at all — `op=airunspawn` builds the search payload as an explicit literal that "
      + "never touches the stored lens, so there is no field to read, and the composing half "
      + "carries it for disclosure and for the weighing it discloses. Minimisation is the "
      + "REQUIREMENT ON TOP of that, it is judgement, and nothing refuses a badly weighed leg.",
    why:
      "§14, and the ordering is the whole point: the lens rule is STRUCTURAL, and v2 demoting it "
      + "to a skill requirement was the defect §14b.4 itself names. Bob's requirement that the "
      + "skill MINIMISE these effects stands — on top of the fence, never instead of it.",
  },
  {
    id: "the-run-says-what-it-ran-under",
    area: "disclosure",
    judges: [],
    decides:
      "Read the conditions this run was formed under before composing anything: the lens in force "
      + "(or that none was), the bar the launching project declared (or which kind of no-bar this "
      + "is), and the doctrine version. A version is only interpretable against them.",
    defers: [],
    enforced_by: [C.skill_version],
    why:
      "§11 and §14a, and SK-1 landed the recording half: a run that cannot say which pack it ran "
      + "under is refused at the door, so this clause is a reading instruction rather than a "
      + "requirement it could fail to meet.",
  },
  {
    id: "propose-only",
    area: "boundary",
    judges: [],
    decides:
      "Put readings forward and stop there. Everything this skill produces arrives as something "
      + "PROPOSED, for a named member to adopt, defer with a recorded reason, or dismiss with a "
      + "recorded reason. Where the evidence supports nothing, propose nothing and say which level "
      + "was empty — an empty run and a silent failure must not look alike.",
    defers: ["every machine fence",
             "a version is written in `suggested` and no other state"],
    enforced_by: [C.cannot_conclude, C.cannot_ground, C.unwritable_state],
    why:
      "§4: the AI holds no op that ACCEPTS. Nothing it can call concludes, accepts, publishes, or "
      + "makes a version current. This clause exists so the skill READS consistently with the "
      + "fence, and it enforces none of it.",
  },
];

/* =========================================================================
 * THE FOUR-LEVEL SEARCH, AND WHICH ABSENCE IS STATED AT EACH
 * ========================================================================= */

/** CLAUDE.md's four facts, in CLAUDE.md's own words, keyed by the level each one
 *  is a fact about. The KEYS are `OBSERVATION_LEVELS`' keys and appear here as
 *  UNQUOTED OBJECT KEYS, which is a keyed map over an imported vocabulary rather
 *  than a copy of it — and the suite PINS the key set to that vocabulary, so a
 *  level added, removed or renamed in `airun.mjs` fails here by name. The four
 *  `fact` sentences are quoted from `CLAUDE.md` and checked against it. */
const ABSENCE_FACTS = {
  meaning: {
    fact: "no meaning derived",
    does_not_mean:
      "that there is nothing here to derive meaning from. It may mean nothing was extracted.",
  },
  content: {
    fact: "nothing extracted",
    does_not_mean:
      "that the documents say nothing. It may mean the document was never read.",
  },
  document: {
    fact: "no document",
    does_not_mean:
      "that no such document exists. It may mean nobody looked.",
  },
  internet: {
    fact: "nobody looked",
    does_not_mean:
      "that the material is not out there. This is where the chain ends, so the honest answer is "
      + "which state the search reached and nothing beyond it.",
  },
};

/** Where the four facts are quoted from. */
export const FACTS_SOURCE = "CLAUDE.md";

/** The reporting spelling for a level, DERIVED rather than typed. A run writes
 *  the log in `OBSERVATION_LEVELS`' spelling and a `level-empty` suggestion in
 *  `SUGGEST_LEVELS`', and the two disagree on one member. Returns null when a
 *  level has no reporting spelling at all, which is a loud failure rather than
 *  a quiet mismatch. */
export function reportsAs(level) {
  return SUGGEST_LEVELS.find((s) => s === level || s === level + "s") ?? null;
}

/** THE STATES THAT LICENSE A CONCLUSION, and their complement. Both derived
 *  from the record's own vocabulary and its own definitive subset, so a sixth
 *  state added to `airun.mjs` lands on one side of this line automatically
 *  instead of escaping both. */
export const LICENSES_A_CONCLUSION =
  Object.keys(OBSERVATION_STATES).filter((s) => DEFINITIVE_STATES.has(s));
export const LICENSES_NOTHING =
  Object.keys(OBSERVATION_STATES).filter((s) => !DEFINITIVE_STATES.has(s));

/** The four levels with their absence discipline. The ESCALATION is the
 *  vocabulary's OWN ORDER — the next level is the next key — rather than a
 *  second chain this file would have to keep in step; the suite pins that order
 *  against the order `CLAUDE.md` names the four facts in. */
export function absenceByLevel() {
  const levels = Object.keys(OBSERVATION_LEVELS);
  const out = {};
  levels.forEach((level, i) => {
    const authored = Object.prototype.hasOwnProperty.call(ABSENCE_FACTS, level)
      ? ABSENCE_FACTS[level] : null;
    out[level] = {
      level,
      level_is: OBSERVATION_LEVELS[level],
      /* WHICH ABSENCE. Null when this file holds no fact for a level the record
         has — an honest hole rather than a level silently sharing another's
         words. */
      states_when_absent: authored ? authored.fact : null,
      does_not_mean: authored ? authored.does_not_mean : null,
      /* The level to ask before concluding anything from this one, and null at
         the end of the chain. */
      ask_next: i + 1 < levels.length ? levels[i + 1] : null,
      /* What a run WRITES for this level on each of the two surfaces. */
      logged_as: level,
      reported_as: reportsAs(level),
      /* And in which words the absence is stated. Imported, both of them. */
      states: Object.keys(OBSERVATION_STATES),
      licenses_a_conclusion: LICENSES_A_CONCLUSION,
      licenses_nothing: LICENSES_NOTHING,
    };
  });
  return out;
}

/* =========================================================================
 * COMPOSITION, AS DATA A RUN CAN READ RATHER THAN A PARAGRAPH IT MUST RECALL
 * ========================================================================= */

export const COMPOSITION = {
  /** The roles a leg may take against a claim — imported, and the point of §5 is
   *  that one piece of evidence may be doing several of these at once against
   *  different claims. */
  roles: BASIS_ROLES,
  /** The grade sources a machine-composed leg may carry, because the record
   *  earned them. Imported. */
  grade_arrives_from: EARNED_GRADE_SOURCES,
  /** The source that is a member's own marking and is unreachable from here
   *  (DEC-15). Imported from the roster the strength walk already treats as
   *  inert, so this file names it nowhere. */
  unreachable_to_a_machine: VERSION_STRENGTH_INERT_SOURCES,
  ungraded_leg:
    "inert, and NAMED. It contributes nothing to the calculation, floors nothing and unrates "
    + "nothing — and it is named in the description, per axis, with the reason. Inert never means "
    + "invisible (DEC-18).",
  where_the_grades_come_from:
    "the resolutions the legs rest on, through the record's earned-basis registry, exactly as "
    + "`op=cite` already fills them",
};

export const DESCRIPTION_STANDARD = {
  held_to: "a commit message's standard: what this composition says and why",
  must_carry: [
    "what this reading of the evidence is, in substance",
    "why these legs, arranged this way, tell it",
    "every ungraded leg, named, with why the record earned nothing for it",
    "what was searched and not found, and which absence that is",
    "which judgements the weighing rests on, where it rests on judgement",
  ],
  read_the_ungraded_legs_from:
    "the record's own answer rather than from memory — the strength answer publishes the ungraded "
    + "legs and the hunched ones beside the graded ones, per axis and with the reason",
  why_it_is_load_bearing:
    "the conversation that produced a version is deliberately not part of the permanent record "
    + "(DEC-61), so the description is the only durable account of the reasoning",
};

/* =========================================================================
 * THE RENDER — SK-2's LAYERS, FOR SK-1's PACK
 * ========================================================================= */

/** THE PROGRESSIVELY-DISCLOSED LAYERS SK-2 CONTRIBUTES (§14b.1). Each names the
 *  work that loads it, in `skillpack.mjs`'s own shape, so the pack merges them
 *  without knowing anything about this file's contents.
 *
 *  `sourcing` is `authored` throughout and says so: this layer is DOCTRINE, the
 *  slowest-drifting kind, and calling it anything else would hide the fact that
 *  it is prose somebody wrote. Its vocabularies are imported and its authored
 *  sentences are pinned; that is the drift defence, not a sourcing label. */
export function judgementLayers() {
  const byArea = (area) => CLAUSES.filter((c) => c.area === area);
  return {
    composition: {
      load_when: "the run composes or revises a version of an inquiry's basis",
      sourcing: "authored",
      body: { clauses: byArea("composition"), composition: COMPOSITION },
    },
    description: {
      load_when: "the run writes the description a version carries",
      sourcing: "authored",
      body: { clauses: byArea("description"), standard: DESCRIPTION_STANDARD },
    },
    search: {
      load_when: "the run decides what to look for, or must account for where it stopped",
      sourcing: "authored",
      body: { clauses: byArea("search"), evidence: LOOP_TERMINATION_EVIDENCE },
    },
    absence: {
      load_when: "the run reports that a level is empty, or reads an empty answer from one",
      sourcing: "authored",
      body: { clauses: byArea("absence"), by_level: absenceByLevel() },
    },
    judgement_boundary: {
      load_when: "always available on request: what this skill decides and what it never decides",
      sourcing: "authored",
      body: {
        clauses: [...byArea("bias"), ...byArea("boundary"), ...byArea("disclosure")],
        decided_here: JUDGED_ROWS,
        decided_by_the_harness: DEFERRED_ROWS,
        table_source: TABLE_SOURCE,
        /* STATED IN THE PACK ITSELF, so a run reading this layer learns what
           this text is and is not. */
        note: "this layer is INSTRUCTION. Every fence it names is enforced somewhere else, by "
          + "code, and a reader that ignored every sentence here would get past nothing that the "
          + "harness and the check catalogue do not already refuse. What is listed as decided by "
          + "the harness is FL-3's deterministic control-flow table, which is code; this text "
          + "cites it and restates none of it.",
      },
    },
  };
}

/** The version string this judgement layer contributes to the pack's identity.
 *  It has no digest of its own: the pack's digest is computed over everything
 *  rendered, these layers included, so a clause moving here moves the pack's
 *  version without anyone remembering to bump anything. This names the EDITION
 *  only, and says so. */
export const JUDGEMENT_VERSION = `${JUDGEMENT_ID}@${JUDGEMENT_EDITION}`;
