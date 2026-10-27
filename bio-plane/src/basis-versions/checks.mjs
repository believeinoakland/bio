/* basis-versions — the refusal rows its store and its acts raise (requirements: `build/requirements/basis-versions.md` R6,
 * R8, R12, R16, R24–R26, R35, R55). DEC-49: every refusal this module answers carries its code, its C-number and the
 * member's translation, read from one row.
 *
 * The rows the version grammar raises, with the version vocabularies and the sufficiency claim, are
 * `basis-version-grammar`'s (T51, CR-9; K624, K3946), re-exported here so every reader of this file's names keeps them.
 * What stays is the seven rows only the store or a read can raise (C-25.11, .16–.18, .37–.39), the six acts' rows
 * (C-25.20–.34), the conclusion's (C-32.2, C-33.x), narrowing's (C-50) and the boilerplate roster. */

import { word, localize } from "../setup-words/index.mjs";
import { BASIS_VERSION_GRAMMAR_CHECKS, VERSION_KIND_CHECKS, SUFFICIENCY_UNCLAIMED } from "../basis-version-grammar/index.mjs";

export { VERSION_KIND_CHECKS, SUFFICIENCY_UNCLAIMED };

/* The rows only the store or a read raises: the freeze and the resolve arm of the promotion check (R6), the read's two
   refusals (R8) and the compare's three (R55). Each row's `where` is a region of this module's own code. */
const BASIS_VERSION_STORE_CHECKS = {
  /* §6 rule 3, AND IT IS THE ONE REFUSAL THIS FILE CANNOT REACH ON ITS OWN. A
     pure check over one document cannot see what the record already holds under
     that name, so the comparison is this module's promotion check (`./index.mjs`
     `check`, R6), which compares the composition of every offered version to
     the stored one BEFORE anything lands. The row lives here so the C-number,
     the code and the translation stay in one place with its siblings; the
     enforcement site says where it actually fires, which is not this file. */
  VERSION_FROZEN: {
    check: 'C-25.11',
    /* A REGION `where`, NOT a function `where`, as the check catalogue's "WHAT
       A `where` MEANS" block (`legacy-checks`, retired) defined it. `promote`
       was 870 lines and refused ~34 things; this row governs the freeze arm and
       nothing else. The prose `(the basis-version
       freeze arm)` said exactly this before REC-71 and no instrument could read
       it, so the guard widened the claim to the whole function and conscripted 32
       unrelated refusals. The span is now DECLARED at the site. */
    where: 'src/basis-versions/index.mjs check > basis-version-freeze, reached from op=promote through the step basis-versions registers with promotion (K31), NOT reachable from a pure document check',
    translation: word('refusal.VERSION_FROZEN'),
  },
  /* THE SECOND REFUSAL A PURE CHECK CANNOT REACH. C-25.10 asks whether the leg
     COULD be evidence — a fact about the id's shape, which one document answers.
     This asks whether the thing is HERE, which only the store can see, and it is
     the same half `action_basis` and `supersedes` already split off from their
     shape arms. Kept separate from C-25.10 for the reason every split refusal in
     this file is kept separate: "you cited something that cannot be evidence"
     and "you cited something we do not hold" are different facts and a member
     told the wrong one is worse off than one told nothing. */
  VERSION_LEG_UNRESOLVED: {
    check: 'C-25.16',
    /* A REGION `where` — see VERSION_FROZEN above. */
    where: 'src/basis-versions/index.mjs check > basis-version-resolve, reached from op=promote through the step basis-versions registers with promotion (K31), NOT reachable from a pure document check',
    translation: word('refusal.VERSION_LEG_UNRESOLVED'),
  },
  /* THE READ'S TWO REFUSALS. Versions are versions OF an inquiry, so there is no
     default subject and there must not be one — VERSION_CHAIN_NO_ADDRESS'
     reasoning one construct over: an answer for an unnamed subject is a list of
     unrelated compositions wearing the word "versions". */
  /* R55 (T51; N1215; DEC-330 A40; DEC-337): the three refusals of `compareVersions`, a read. Their words are the list's,
     read by key. */
  VERSION_COMPARE_NO_INQUIRY: {
    check: 'C-25.37',
    where: 'src/basis-versions/index.mjs compareVersions, reached from op=versioncompare',
    translation: word('refusal.VERSION_COMPARE_NO_INQUIRY'),
  },
  VERSION_COMPARE_NO_VERSION: {
    check: 'C-25.38',
    where: 'src/basis-versions/index.mjs compareVersions, reached from op=versioncompare',
    translation: word('refusal.VERSION_COMPARE_NO_VERSION'),
  },
  VERSION_COMPARE_NO_SUCH_VERSION: {
    check: 'C-25.39',
    where: 'src/basis-versions/index.mjs compareVersions, reached from op=versioncompare',
    translation: word('refusal.VERSION_COMPARE_NO_SUCH_VERSION'),
  },
  BASIS_VERSIONS_NO_INQUIRY: {
    check: 'C-25.17',
    where: 'src/basis-versions/index.mjs basisVersions, reached from op=basisversions',
    translation: word('refusal.BASIS_VERSIONS_NO_INQUIRY'),
  },
  /* And an id of the wrong CLASS is refused rather than answered with an empty
     list. "This project has no versions of its basis" is a confidently wrong
     sentence about a thing that has no basis at all, and an empty answer is the
     most misleading form a wrong answer takes. */
  BASIS_VERSIONS_NOT_AN_INQUIRY: {
    check: 'C-25.18',
    where: 'src/basis-versions/index.mjs basisVersions, reached from op=basisversions',
    translation: word('refusal.BASIS_VERSIONS_NOT_AN_INQUIRY'),
  },
};

/* Every refusal of an inquiry's basis versions, one object as before the split: the grammar's rows
   (`basis-version-grammar`) and the store's. */
export const BASIS_VERSION_CHECKS = { ...BASIS_VERSION_GRAMMAR_CHECKS, ...BASIS_VERSION_STORE_CHECKS };

/* PL-2 / IS-2 — THE SIX MEMBER OPS' REFUSALS, each with its C-number, its
 * DEC-49 wire code and the canned translation a surface renders. A surface may
 * RENDER a refusal it received and may never compute one (DEC-8), so every
 * refusal the six ops can return is a row here and the store returns the row's
 * own translation rather than composing a second sentence.
 *
 * NO MEMBER-FACING STRING BELOW SAYS "ground", "partition", "AND" or "OR" as a
 * member-facing word — DEC-32's elicitation clause 1 and D-226, the same bound
 * BASIS_VERSION_CHECKS respects one item down, and the suite asserts it of every
 * translation rather than trusting this paragraph. */
export const VERSION_ACT_CHECKS = {
  VERSION_ACT_NO_INQUIRY: {
    check: 'C-25.20',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_ACT_NO_INQUIRY'),
  },
  VERSION_ACT_NOT_AN_INQUIRY: {
    check: 'C-25.21',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_ACT_NOT_AN_INQUIRY'),
  },
  VERSION_ACT_NO_VERSION: {
    check: 'C-25.22',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_ACT_NO_VERSION'),
  },
  VERSION_ACT_NO_SUCH_VERSION: {
    check: 'C-25.23',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_ACT_NO_SUCH_VERSION'),
  },
  /* REC-46's ONE predicate, at the ONE transition site. §4: THE AI HOLDS NO OP
     THAT ACCEPTS. A machine may compose an account of the evidence and propose
     it; deciding what the record stands on is a named member's act, and this is
     the refusal that says so for all six. */
  MACHINE_CANNOT_MOVE_VERSION: {
    check: 'C-25.24',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.MACHINE_CANNOT_MOVE_VERSION'),
  },
  VERSION_ILLEGAL_TRANSITION: {
    check: 'C-25.25',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_ILLEGAL_TRANSITION'),
  },
  VERSION_NO_REASON: {
    check: 'C-25.26',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_NO_REASON'),
  },
  /* A REASON THAT IS PRESENT AND UNWRITABLE IS NOT A MISSING REASON, and until
     2026-08-09 this plane said it was.
     PL-2 shipped both conditions under `VERSION_NO_REASON`, so a member who
     typed a reason over the length bound, or one carrying a double quote — the
     restricted frontmatter grammar has no escapes, so `he said "the budget is
     fixed"` cannot be stored — was answered with C-25.26's translation:
     *"…it is worth nothing without the reason."* Told to someone who gave one.
     WORSE ON THE THREE ACTS THAT NEED NO REASON AT ALL. The grammar arm runs
     unconditionally on whatever `reason` arrived, while the missing-reason arm
     runs only for `considering` and `rejected`. So a member ACCEPTING a reading
     with a quoted note, or HIDING one, or making one CURRENT, was told that
     setting a reading aside carries a reason — a sentence about an act they did
     not perform, refusing an act that requires no reason whatsoever.
     THE DISTINCTION IS NOT NEW HERE AND THAT IS THE POINT. This plane already
     splits absent from malformed everywhere else it asks for authored prose —
     `NO_REASON` against `BAD_REASON`, twelve sites against eight in the
     old `store.mjs` (#moveAction, #divide, #ground and their siblings). PL-2 did not
     invent a worse rule; it collapsed a distinction the rest of the plane keeps.
     The DEC-49 layer is exactly where that collapse becomes visible to a member,
     because a surface may RENDER a refusal and may never compute one (DEC-8), so
     the canned translation IS what the member reads.
     WHY A NEW CODE RATHER THAN A WIDER TRANSLATION. A translation covering both
     would have to say "missing or unwritable", which tells a member who can see
     their own typed reason on the screen that the plane cannot tell the two
     apart — and it would leave the two conditions sharing one C-number, so no
     assertion could ever name one without naming the other. C-25.32 is a dotted
     member of this family (the family owner allocates those; verified free
     across the whole tree before it was taken). */
  VERSION_REASON_MALFORMED: {
    check: 'C-25.32',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_REASON_MALFORMED'),
  },
  /* THE CHECK PL-1 RECORDED RATHER THAN HALF-BUILT. A version leg naming THIS
     inquiry is a fact about one document and C-25.14 refuses it there. A leg
     naming an inquiry that TRANSITIVELY rests on this one is a fact about the
     stored graph, and it becomes a defect at exactly one moment: when a member
     accepts the version and its legs become what the answer rests on. Wired to
     `inquiry`'s one cycle walk (`cyclePath`) — never a second one. */
  VERSION_BASIS_CYCLE: {
    check: 'C-25.27',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_BASIS_CYCLE'),
  },
  VERSION_NOT_ACCEPTED: {
    check: 'C-25.28',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_NOT_ACCEPTED'),
  },
  VERSION_CURRENT_NO_PROJECT: {
    check: 'C-25.29',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_CURRENT_NO_PROJECT'),
  },
  VERSION_CURRENT_UNRELATED: {
    check: 'C-25.30',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_CURRENT_UNRELATED'),
  },
  VERSION_ACT_UNWRITABLE: {
    check: 'C-25.31',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: word('refusal.VERSION_ACT_UNWRITABLE'),
  },
  /* D-271 — DEC-32 RULE 4's ANTI-GAMING KEYSTONE, ENACTED AT THE ONE ACT THAT
     CASHES IT IN.
     C-25.32 sits between C-25.31 and this row, allocated after this row was minted (VERSION_REASON_MALFORMED
     above); no number in the family is skipped.
     THE TRANSLATION REUSES THE RECORD'S EXISTING MEMBER-FACING PHRASE — "would
     carry the answer on its own", already the wording in BASIS_VERSION_CHECKS —
     rather than authoring a third spelling of it. DEC-32 clause 1 and D-226 ban
     the analyst's vocabulary from any member-facing string, and a second sentence
     saying the same thing differently is the drift D-226 is about. */
  VERSION_AFFIRMATION_INCOMPLETE: {
    check: 'C-25.33',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: localize('basis-versions.checks.accepting_this_reading_claims_that', 'Accepting this reading claims that each of the parts it rests on would carry the answer on its own. That is a claim only a named member can make, and it is made part by part rather than assumed from silence, so every part has to be named before this reading becomes what the record stands on.'),
  },
  /* CASE-3 — DEC-72 CLAUSE 3 AT THE READING DOOR. Bob: "Once published, the act
     of changing the findings (or any claims of any of the findings) results in
     the changed version becoming a new version." A published case pins each
     member by the hash its members signed, so the claims underneath that hash
     cannot move without the case becoming a statement about the present.
     NO NEW FAMILY, DELIBERATELY: this refusal belongs to the six version acts,
     whose family already exists (every family is reached by control-plane's
     CHECK_FAMILIES, its R22). C-25.32's row records the same choice.
     REACHED BY FOUR OF THE SIX ACTS and not all six — `hide` and `current` are
     the two `VERSION_ACT_TO` maps to null, and the reasoning for leaving them
     outside is at the refusal site rather than restated here.
     THE TRANSLATION NAMES THE ROUTE OUT rather than only the wall: a member told
     only "no" learns nothing about reopening, and DEC-12 built reopening for
     exactly this. D-226 governs the wording — no "compose", no "derive". */
  PUBLISHED_CANNOT_MOVE_VERSION: {
    check: 'C-25.34',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the four acts that move a state',
    translation: word('refusal.PUBLISHED_CANNOT_MOVE_VERSION'),
  },
};

/* THE BOILERPLATE ROSTER, AND WHAT IT IS NOT.
 *
 * Section 14b.5: *"nothing in it is boilerplate — a version whose description or
 * reason field is placeholder text is not proposed. The placeholder defect is
 * already measured at human speed (`counterparty: to be named` satisfying a
 * non-empty check, PROCESS-INVENTORY); an AI filling required fields to clear a
 * gate is the same defect at machine scale."*
 *
 * THIS IS A BOUNDARY, NOT A PROSE JUDGE, and that limit is stated here for the
 * same reason D-130's counterparty check states its own: a machine that writes
 * "the relevant department" gets past every rule below, and a check that
 * pretended otherwise would be claiming a competence it does not have. What it
 * DOES catch is the machine-scale shape — a required field filled with a token
 * whose only job is to be non-empty.
 *
 * MATCHED AGAINST THE WHOLE FIELD, case-folded and trimmed, NEVER as a
 * substring. A substring rule would refuse a real sentence that quotes a
 * placeholder — *"the contract names the counterparty as 'to be named', which is
 * the defect"* is a perfectly good description of a finding, and refusing it
 * would be the over-strictness arm this item's suite runs. */
export const BOILERPLATE_FORMS = [
  word('action-grammar.named'), 'tbd', 'to be determined', 'n/a', 'na', 'none', 'null', 'undefined',
  'placeholder', 'todo', 'to do', 'tba', 'xxx', 'text', 'description', 'description here',
  'lorem ipsum', 'sample text', 'no description', 'see above', 'as above', 'same', 'ditto',
];
/* ONE PREDICATE, never a second copy of the membership test — IS-6's C-22.4
   control left its suite green at 98 of 98 because a rule had two
   implementations and either one absorbed the control. The endpoint imports
   this; nothing re-types the roster. */
export function isBoilerplate(s) {
  if (typeof s !== 'string') return true;
  const v = s.trim().toLowerCase().replace(/[.!?]+$/, '').trim();
  if (v === '') return true;
  /* Only punctuation, ellipsis, or an unfilled angle-bracket slot. */
  if (/^[\s.\-_*#'"`~<>[\]()]+$/.test(v)) return true;
  if (/^<[^>]*>$/.test(v)) return true;
  return BOILERPLATE_FORMS.includes(v);
}


/* C-32.2 and C-33.1, .2, .33–.37: the conclusion's refusals (R16, R17, R20, R21), this module's rows of the
   catalogue's machine-fence (C-32) and act-shape (C-33) families, whose headers explain why each `where` is a region. */
export const CONCLUDE_ACT_CHECKS = {
  MACHINE_CANNOT_CONCLUDE: {
    check: 'C-32.2',
    where: 'src/basis-versions/index.mjs conclude > is-machine-conclude',
    translation: word('refusal.MACHINE_CANNOT_CONCLUDE'),
  },
  NO_CONCLUSION: {
    check: 'C-33.1',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: word('refusal.NO_CONCLUSION'),
  },
  /* REC-117 / BOB 2026-09-17: the translation now NAMES THE DOOR, and that is
     the surfacing half of the ruling rather than a nicety. A member who is
     refused here and told only that a falsifier is required is a member under
     pressure to invent one; a member told they may instead state that none can
     honestly be given has been offered the honest way through. */
  NO_FALSIFIER: {
    check: 'C-33.2',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: word('refusal.NO_FALSIFIER'),
  },
  /* REC-117. The one refusal the override ADDS, and it exists because the
     alternative is the plane choosing which of a member's two statements it
     meant. No caller written before this item can reach it: the parameter it
     turns on did not exist. */
  FALSIFIER_AND_NONE_STATED: {
    check: 'C-33.33',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: word('refusal.FALSIFIER_AND_NONE_STATED'),
  },
  /* REC-124 / INVESTIGATIVE-SESSION.md §7.1 (BOB #15, 2026-09-18): a conclusion
     ADOPTS the claim of the reading a project stands on, and the claim is what
     was concluded. NO_CLAIM is every door to "there is nothing to adopt" — the
     project stands on no reading, the reading is not accepted or states no
     claim, or commentary arrives with no adopted claim to comment beyond. */
  /* REC-136 / §7.1 item 6: a conclusion drawn with NO project names the
     reading it adopts, and an unnamed reading is this condition too. The
     translation was project-only and now covers both relationships. */
  NO_CLAIM: {
    check: 'C-33.34',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-claim',
    /* R51 (DEC-254): its words are the list's, which names the member's own reading since the decision */
    translation: word('refusal.NO_CLAIM'),
  },
  /* REC-124 / §7.1 item 2. A free conclusion text beside a project could say
     what no claim said; the member is told the door rather than having their
     words quietly relabelled as commentary. */
  CONCLUSION_IS_THE_CLAIM: {
    check: 'C-33.35',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: word('refusal.CONCLUSION_IS_THE_CLAIM'),
  },
  /* R48 (D59; K2479, K2491). A conclusion's bias applications, judged by inquiry-grammar R18's one shape check with a
     conclusion's own effects; refused before the lens is asked, nothing written. */
  BAD_BIAS_APPLIED: {
    check: 'C-25.35',
    where: 'src/basis-versions/index.mjs conclude > conclusionBiasApplied',
    translation: word('refusal.BAD_BIAS_APPLIED'),
  },
  /* REC-136 / §7.1 item 7. A project withdraws only a conclusion it currently
     stands on; a second withdrawal, or one with nothing concluded, would add
     an entry that records nothing. */
  NOTHING_TO_WITHDRAW: {
    check: 'C-33.37',
    where: 'src/basis-versions/index.mjs withdrawConclusion > is-withdraw-stance',
    translation: word('refusal.NOTHING_TO_WITHDRAW'),
  },
  /* REC-124. The project's own frontmatter could not take the conclusion row
     in place, so nothing was written — the make-current writer's condition, on
     the conclusion row. */
  UNSPLICEABLE_CONCLUSIONS: {
    check: 'C-33.36',
    where: 'src/basis-versions/index.mjs #setProjectConclusion > is-conclusion-row',
    translation: word('refusal.UNSPLICEABLE_CONCLUSIONS'),
  },
};

/* REC-86 / IC-123 — THE ACT'S REFUSALS, C-50 (minted at REC-86 with the old process's `node tools/mintid.mjs C`, retired with `tools/` in T19).
 *
 * ITS OWN FAMILY AND NOT A SUB-NUMBER OF C-45, because the subject is its own.
 * C-45 is *the ways the record could come to point at nothing*; this family is
 * *the ways a member's re-description of a citation could claim more precision
 * than was established, or move a citation nobody moved* (Bob's 5.3 and 5.8).
 * The extent GRAMMAR is not here: a malformed extent is refused by
 * `checkLegExtentGrammar`, REC-84's one checker, under `BASIS_REFUSED` — the
 * name `op=cite` and `op=promote` already answer it under.
 *
 * THREE REGIONS. `is-narrow-source` holds the four refusals the act and its
 * candidate read share (which citation is meant); the act's own are split
 * two ways — `is-narrow-extent` (who and which part) and `is-narrow-claim` (is
 * it narrower, and is the new reading nameable) — because
 * REC-84's grammar verdict (`BASIS_REFUSED`, another family's name) must sit
 * BETWEEN the first two and a governed region may hold only its own family's
 * codes. One helper each, named `refusal`, codes written as literals.
 *
 * THERE IS NO ROW FOR AN UNWRITABLE DOCUMENT, and that was decided by trying to
 * drive one: the restricted grammar's version blocks are always appendable once
 * the document PARSED (a key with an inline value other than `[]` cannot hold
 * the rows the source reading needs), so a twelfth row would be a refusal no
 * suite can reach — a catalogue entry that could never be named by an assertion.
 * The defensive branch answers `op=cite`'s own `UNSPLICEABLE_BASIS` instead. */
export const NARROW_CHECKS = {
  NARROW_NO_INQUIRY: {
    check: 'C-50.1',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: word('refusal.NARROW_NO_INQUIRY'),
  },
  NARROW_NO_SUCH_VERSION: {
    check: 'C-50.2',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: word('refusal.NARROW_NO_SUCH_VERSION'),
  },
  NARROW_NO_SUCH_LEG: {
    check: 'C-50.3',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: word('refusal.NARROW_NO_SUCH_LEG'),
  },
  NARROW_NO_PART: {
    check: 'C-50.4',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: word('refusal.NARROW_NO_PART'),
  },
  NARROW_NOT_A_MEMBER: {
    check: 'C-50.5',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: word('refusal.NARROW_NOT_A_MEMBER'),
  },
  NARROW_NO_EXTENT: {
    check: 'C-50.6',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: word('refusal.NARROW_NO_EXTENT'),
  },
  NARROW_BAD_EXTENT: {
    check: 'C-50.7',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: word('refusal.NARROW_BAD_EXTENT'),
  },
  NARROW_OTHER_CAPTURE: {
    check: 'C-50.8',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: word('refusal.NARROW_OTHER_CAPTURE'),
  },
  NARROW_NOT_NARROWER: {
    check: 'C-50.9',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-claim',
    translation: word('refusal.NARROW_NOT_NARROWER'),
  },
  NARROW_NAME: {
    check: 'C-50.10',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-claim',
    translation: word('refusal.NARROW_NAME'),
  },
  NARROW_NO_DESCRIPTION: {
    check: 'C-50.11',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-claim',
    translation: word('refusal.NARROW_NO_DESCRIPTION'),
  },
};
