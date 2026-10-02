/* basis-versions — its refusal rows, its vocabularies and the sufficiency claim (requirements:
 * `build/requirements/basis-versions.md` R1–R5, R12, R16, R24–R26, R35). DEC-49: every refusal this module answers
 * carries its code, its C-number and the member's translation, read from one row.
 *
 * MOVED FROM THE CHECK CATALOGUE (`checks/bio-checks.mjs`, legacy-checks) in T19 layer 6 (plan T19 rule 1; K766,
 * K787), ids, codes and translations unchanged, the legacy comments carried with them: C-25 (`BASIS_VERSION_CHECKS`,
 * `VERSION_ACT_CHECKS`), C-27.15 (`VERSION_KIND_CHECKS`, the one row of the catalogue's `SUGGEST_CHECKS` this
 * module raises; the rest of C-27 is run-productions'), C-32.2 and C-33.1, .2, .33–.37 (`CONCLUDE_ACT_CHECKS`, this
 * module's rows of the catalogue's `MACHINE_FENCE_CHECKS` and `ACT_SHAPE_CHECKS`), C-50 (`NARROW_CHECKS`); the
 * version machine and its vocabularies; section 9's kinds and the boilerplate roster; and the third `asserted_by`
 * state. Each `where` names the site in this module that answers it; the C-25 and C-27.15 rows the grammar raises now
 * name `./grammar.mjs` (stamped at 1.50.0, T20 layer 2). The catalogue kept its copies until their last importer
 * re-pointed (rule 1) and was deleted with `legacy-checks`; this module reads only its own. */

import { isMachineIdentity } from "../record-grammar/index.mjs";

/* The site every row the grammar raises names (R1–R3, R6, R43). */
const GRAMMAR_WHERE = "src/basis-versions/grammar.mjs basisVersionFindings, reached from op=promote through the step "
  + "basis-versions registers with promotion (K31) and from the C-2.8 grammar slot";

/* ===================================================================== *
 * THE THIRD `asserted_by` STATE (DEC-65, answered 2026-08-09; PL-17).
 *
 * WHICH `asserted_by`, BECAUSE THERE ARE TWO AND THEY ARE NOT THE SAME FIELD.
 * This block is about the SUFFICIENCY assertion — `grounds[].asserted_by` on an
 * inquiry basis (C-2.8, `checkGrounds`) and `basis_version_grounds[].asserted_by`
 * on a version of one (C-25.6, `basisVersionFindings`). It is NOT the
 * `connections.asserted_by` column in `schema.mjs`, whose three values are
 * `system` / `source` / `member` and which answers "who claims these two
 * documents are connected". Nothing here belongs anywhere near that column, and
 * a reader who wires the two together will have made one field mean two things.
 *
 * THE FIELD'S PUBLISHED MEANING, and it is the whole reason a third state was
 * needed: *a member said this part of the argument is enough on its own.*
 * DEC-32 makes that the ONE thing a member can write that makes a finding
 * STRONGER — the strength is the MAXIMUM over parts asserted independently
 * sufficient — so it carries a named member and a date, and a machine may not
 * write it.
 *
 * THE GAP FL-3 MEASURED (DEC-65, and its reasoning is transplanted rather than
 * summarised). Under DEC-65's shape (b) a machine's SINGLE-PART version still
 * carries a row here, because C-25.5 makes the partition TOTAL. The endpoint
 * STAMPS the field from the session, so that row would read `class:ai` in a
 * field whose published meaning is a member's affirmative claim. **That is the
 * record claiming something nobody claimed** — the overclaim class this project
 * ranks worst, and worse than the missing feature it was reached for.
 *
 * SO THE HONEST SHAPE IS A THIRD STATE, and it is CLAUDE.md's *undetermined is
 * first-class and must be STATED* applied to exactly one field. The field's
 * legal values are now THREE, not two:
 *
 *   A NAMED MEMBER      the claim was made, by them, on that date.
 *   `SUFFICIENCY_UNCLAIMED`  no independent-sufficiency claim was made, said
 *                       OUTRIGHT. Distinct from a member's claim, and equally
 *                       distinct from a blank field.
 *   ABSENT / BLANK      the record does not say. The silent default, and both
 *                       gates refuse it — that has not changed and is not this
 *                       item's to change.
 *
 * WHY IT IS NOT A BACK DOOR TO DEC-32, which is the one thing this state could
 * have been. DEC-32's default is AND and *independent sufficiency is only ever
 * reached by an affirmative, attributed act.* `sufficiencyClaimState` answers
 * `claimed` for a named member and for NOTHING ELSE — not for this value, not for a
 * blank, not for a machine stamp — so a consumer that asks the one predicate
 * cannot take a maximum over a part nobody signed for however the field is
 * spelled. The state widens what the record can SAY; it widens nothing about
 * what it may CLAIM. And DEC-65's arithmetic argument is the narrow licence
 * this state is minted for and is stated here so it is not quietly widened
 * later: with EXACTLY ONE part there is no maximum to take, so the conservative
 * weakest-leg reading is what you get either way. Several parts, none of them
 * claimed, is a different thing and this state does not license it.
 *
 * WHY A COLON-SHAPED LITERAL RATHER THAN A WORD. REC-46's finding, one field
 * over: a word list is the shape to remove, not to extend, because a new
 * spelling escapes it silently and because a bare word can be somebody's name.
 * The colon puts the value in the control plane's own minted-identity grammar,
 * where it cannot collide with a person. The namespace is deliberately NEITHER
 * `token:` NOR `class:`: those two mean *a machine did this*, and this value
 * means *nobody did*. "A machine said" and "nobody said" are different
 * findings, which is the identical distinction the block above draws when it
 * refuses to call an ABSENT identity a machine one.
 *
 * WHERE IT IS WIRED (PL-19). C-25.6 (`basisVersionFindings`, `./grammar.mjs`)
 * admits this value on a version of exactly one part and refuses it on a
 * version of two or more, one finding per part; `versionAsWritten` writes it as
 * the asserter of every ground a machine author submits. Proven at this
 * module's interface by `test/m/basis-versions/sufficiency-state.test.mjs` (R3,
 * R6) and `grammar.test.mjs` (R5). It was minted first and wired after, per
 * DEC-65's own sequencing.
 * ===================================================================== */

/** The explicit "no independent-sufficiency claim was made" value for a
 *  sufficiency `asserted_by` field. ONE literal, in ONE place, so the writer
 *  that will stamp it and the checks that will read it cannot drift apart —
 *  which is the REC-46 lesson taken before it has a chance to repeat. */
export const SUFFICIENCY_UNCLAIMED = 'none:independent-sufficiency';

/** The three legal states of a sufficiency `asserted_by`, plus the one a gate
 *  refuses, each carrying the sentence a member reads INSTEAD OF the machine
 *  word (DEC-49's rule reaches a published vocabulary's texts too). Published
 *  through `vocabularies.sufficiency_claim_states` so no surface invents its
 *  own wording for a state the record now distinguishes.
 *
 *  THE WORDING CARRIES DEC-32's BAN, and it is a constraint on us: *never show
 *  AND / OR / disjunction / grounds — not even as tooltips.* The member-facing
 *  word for a part of an argument is a GROUP OF REASONS, which is the register
 *  `groundInquiry`'s own receipt already speaks in ("each group's strength is
 *  its weakest leg, and this question's is its strongest group"). */
export const SUFFICIENCY_CLAIM_STATES = {
  claimed:        'a member said this group of reasons would carry the answer on its own, and the record holds their name and the date',
  unclaimed:      'nobody said this group of reasons would carry the answer on its own, and the record states that outright rather than leaving it blank',
  unstated:       'the record does not say whether anyone claimed this group of reasons would carry the answer on its own',
  machine_stamped: 'a machine credential stands where the name of the member making that claim has to be, so no member has claimed anything here',
};

/** Read a sufficiency `asserted_by` as ONE of the four states above.
 *
 *  THE ORDER OF THE ARMS IS LOAD-BEARING, not stylistic. Blank is answered
 *  first because "nobody said" and "the record does not say" are different
 *  findings. The minted value is answered BEFORE `isMachineIdentity` so that
 *  this state can never be swallowed by a future addition to the machine
 *  prefixes — and the suite pins `isMachineIdentity(SUFFICIENCY_UNCLAIMED) ===
 *  false` besides, so a collision fails loudly instead of hiding behind this
 *  ordering.
 *
 *  `machine_stamped` is NOT a legal value of the field: both gates refuse it
 *  and neither is changed here. It is answered anyway, for the reason
 *  `#axisResult` gives one field over — a row may reach a projection around a
 *  gate, and the reading of one must not be a member's claim. */
export function sufficiencyClaimState(assertedBy) {
  const s = String(assertedBy ?? '').trim();
  if (s === '') return 'unstated';
  if (s.toLowerCase() === SUFFICIENCY_UNCLAIMED) return 'unclaimed';
  if (isMachineIdentity(s)) return 'machine_stamped';
  return 'claimed';
}

/* `isSufficiencyClaimed` (`sufficiencyClaimState(x) === 'claimed'`) stood here until T19 (legacy-checks, K653
   BOB-1): no reader asked it. The one predicate is `sufficiencyClaimState` above. */

/** Is this the explicit no-claim state? Case-folded, because the value reaches
 *  a check hand-written in a document exactly as `token:member` does, and
 *  `None:Independent-Sufficiency` is the same statement. */
export function isSufficiencyUnclaimed(assertedBy) {
  return sufficiencyClaimState(assertedBy) === 'unclaimed';
}

/* =========================================================================
 * PL-1 / IS-1 — BASIS VERSIONS. THE REFUSALS.
 *
 * An inquiry's basis supports many VERSIONS (INVESTIGATIVE-SESSION.md §6), each
 * a complete alternative account of the support for the inquiry's claim. The
 * version block is authored in `bundle.md` and projected inside op=promote's one
 * transaction, so these checks run at BOTH gates through one function —
 * `basisVersionFindings` (`./grammar.mjs`), registered in record-core's C-2.8 slot
 * and called by this module's promotion check. A version that cannot land cannot
 * audit clean either.
 *
 * DEC-49's SHAPE, on VERSION_CHAIN_CHECKS' precedent above: the C-number, the
 * wire code and the CANNED TRANSLATION are ONE ROW, read from one place rather
 * than copied. `basisVersionFindings` reads the C-number OUT of this map at every
 * push site and passes the key as the finding's `code`, so there is no second
 * list of C-numbers anywhere and a row added here is enforced the moment it is
 * used. LOOKUP IS AT RUNTIME for AI_RUN_CHECKS' stated reason: the `message`
 * names the offending version and value, so a build-time table would carry
 * either a template language or a sentence with the facts taken out of it.
 *
 * WHY THE RELATIONSHIP IS A FIELD AND NOT DERIVED FROM THE PARTITION, which is
 * the one design choice here a reader will challenge. The partition alone
 * *implies* the arithmetic — legs sharing a ground are AND, grounds are OR
 * (DEC-32) — so a `relationship` that could only ever agree with it would be a
 * checkbox and D-21's second-place-to-state-a-fact. It is here because it CAN
 * disagree, and because of DEC-32's anti-gaming keystone: the structure is
 * authored BEFORE the strength is shown, and an AI-composed version arrives
 * structure-and-strength together (§12(b)). So the version states, in one word a
 * member affirms at the accept ceremony, what it claims its composition is — and
 * the record checks that word against the structure and REFUSES the disagreement
 * (C-25.4). A version whose partition says OR while its author wrote AND is a
 * version whose accepter would be signing for a claim they did not read. This is
 * the NO_SIBLING_DISCLOSURE posture applied inside one document: a disclosure
 * nobody can check is not a disclosure.
 *
 * AND THE ABSENCE IS REFUSED OUTRIGHT (C-25.3) rather than defaulted to `and`.
 * `inquiry_basis` defaults an unlabelled leg to the implicit single ground on
 * purpose — every leg written before REC-42 reads NULL and derives the
 * weakest-leg answer it always derived. A VERSION has no such history and gets
 * no such default: §3 is explicit that "a version with no relationship field
 * would re-ship the flat-AND basis REC-42 corrected".
 * ========================================================================= */
export const BASIS_VERSION_CHECKS = {
  /* §6 rule 1. The description is load-bearing rather than a courtesy: §10 makes
     it what survives a conversation that is deliberately not kept, and under §5
     it carries the naming of every ungraded leg. A version with none is an
     alternative account of the evidence with no account of itself. */
  VERSION_NO_DESCRIPTION: {
    check: 'C-25.1',
    where: GRAMMAR_WHERE,
    translation: 'That version does not say what it is or why it differs. '
      + 'A version is a whole alternative reading of the evidence, and the description is '
      + 'what a member has left to compare it by once the conversation that produced it is gone.',
  },
  /* §6 rule 2. Unique PER INQUIRY, never globally — "global uniqueness would
     make naming absurd". Two versions of one inquiry sharing a name makes every
     later reference to that name ambiguous, including `derived_from`, which is
     how the derivation tree is read. */
  VERSION_NAME_NOT_UNIQUE: {
    check: 'C-25.2',
    where: GRAMMAR_WHERE,
    translation: 'Two versions of this inquiry have the same name. '
      + 'Names are how versions are compared and how one records what it was derived from, '
      + 'so within one inquiry a name means exactly one version.',
  },
  /* §3 / SWEEP C5. See the block comment above for why this is a field. */
  VERSION_NO_RELATIONSHIP: {
    check: 'C-25.3',
    where: GRAMMAR_WHERE,
    translation: 'That version does not say how its evidence fits together — whether every part is needed, '
      + 'or whether any one of its parts would carry the answer on its own. '
      + 'Those two readings give different answers about how strong the finding is, '
      + 'so the version says which one it is rather than letting the record assume.',
  },
  /* The field is only a claim because it can be wrong. */
  VERSION_RELATIONSHIP_DISAGREES: {
    check: 'C-25.4',
    where: GRAMMAR_WHERE,
    translation: 'That version says its evidence fits together one way and is grouped the other way. '
      + 'The two cannot both be true, and a member accepting it would be signing for a reading '
      + 'that is not the one written down.',
  },
  /* §3: "A version that is a flat leg set cannot express plurality — the version
     IS the composition, and the partition is part of the composition." The
     partition is TOTAL on a version: checkGrounds' whole-or-not-at-all rule with
     the not-at-all arm removed, because the version must carry it. */
  VERSION_PARTITION_INCOMPLETE: {
    check: 'C-25.5',
    where: GRAMMAR_WHERE,
    translation: 'Some of that version\'s evidence has not been placed in the argument. '
      + 'A part nobody placed sitting beside parts somebody did is a relationship the record '
      + 'would have to guess at, and it would have to guess in the direction that makes the finding stronger.',
  },
  /* REC-45 / DEC-32's attributed act, at the version's own grain. "These legs
     are enough on their own" is the one thing that makes a finding STRONGER, so
     it carries a named member and a date and a machine credential cannot assert
     it — `isMachineIdentity` is the one predicate, never a word list (REC-46). */
  VERSION_GROUND_UNASSERTED: {
    check: 'C-25.6',
    where: GRAMMAR_WHERE,
    translation: 'That version claims one part of its argument would carry the answer on its own, '
      + 'and no member has said so. That claim is the one thing that makes a finding stronger, '
      + 'so it carries the name of the person making it and the date they made it — never a machine\'s.',
  },
  /* §6 rule 3a: "Each version records what it was derived from, null where a run
     composed it fresh." An edge naming a version that is not here points the
     derivation tree at nothing. */
  VERSION_DERIVED_FROM_UNKNOWN: {
    check: 'C-25.7',
    where: GRAMMAR_WHERE,
    translation: 'That version says it came from a version this inquiry does not have. '
      + 'Where a version came from is how the alternatives are read as a tree rather than a pile, '
      + 'so it names one that exists or it names none.',
  },
  /* A derivation tree is a TREE. A cycle makes "what was this derived from"
     unanswerable and the prune walk non-terminating. */
  VERSION_DERIVATION_CYCLE: {
    check: 'C-25.8',
    where: GRAMMAR_WHERE,
    translation: 'These versions say they were derived from each other in a loop, '
      + 'so there is no answer to which came first. Versions form a tree, and a tree has a root.',
  },
  /* DEC-50 / §6.7 — the clause the sweep added and the reason this is not merely
     a data check. "An edit that regroups the ground partition is the attributed
     regroup act REC-45 built — ungroup with a reason, cite, regroup — surfacing
     through the derived version's record of who and why. §6.7 licenses no
     unattributed structural edit." So a version whose partition DIFFERS from its
     parent's carries the act: a named member, a date, a reason. */
  VERSION_REGROUP_UNATTRIBUTED: {
    check: 'C-25.9',
    where: GRAMMAR_WHERE,
    translation: 'That version rearranges the argument it was derived from, and nobody has said who did it or why. '
      + 'Rearranging which evidence is grouped with which changes how strong the finding reads, '
      + 'so it is an act with a name on it rather than an edit.',
  },
  /* D-184 / C-2.8, restated at the version's grain because a version's legs do
     not pass through checkInquiryBasis's own loop: a leg rests on information or
     on another inquiry and NOTHING ELSE. Stated as a standing bound of this item
     rather than discovered later. */
  VERSION_LEG_NOT_CITABLE: {
    check: 'C-25.10',
    where: GRAMMAR_WHERE,
    translation: 'One part of that version rests on something that cannot be evidence for a question — '
      + 'the record admits a document or another question, and nothing else.',
  },
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
    translation: 'That version already exists and has been changed in place. '
      + 'A version is frozen once written, because two people comparing it must be comparing the same thing — '
      + 'so an edit becomes a NEW version derived from this one, and the original stays exactly as it was.',
  },
  /* §6 rule 4's vocabulary. This is the SIXTH state machine and IS-2 owns its
     transitions; PL-1 owns only that the word written is one of the four. An
     unknown state is refused rather than tolerated for DEC-8's reason: a surface
     rendering a state it has no translation for is the drift DEC-49 closed. */
  VERSION_STATE_UNKNOWN: {
    check: 'C-25.12',
    where: GRAMMAR_WHERE,
    translation: 'That version is in a state the record has no name for. '
      + 'A version is suggested, being considered, accepted, or rejected — and nothing else.',
  },
  /* §6 rule 3a, DEC-29(b), D-214. PRUNE HIDES AND NEVER DELETES. The flag is a
     boolean and the refusal exists so that no caller can smuggle a third value
     ("archived", "deleted") into a field whose entire meaning is that the row
     stays in the record and stays queryable. */
  VERSION_HIDDEN_NOT_BOOLEAN: {
    check: 'C-25.13',
    where: GRAMMAR_WHERE,
    translation: 'The setting that hides a version from the display is not a yes-or-no answer here. '
      + 'Hiding a version removes it from view and nothing else — it stays in the record and stays '
      + 'answerable — so there is no third thing for this to say.',
  },
  /* A leg naming its own inquiry. checkInquiryBasis refuses the same thing on
     `basis[]` as SELF_BASIS at the store; a version is an account OF the
     question and cannot rest on it. The transitive cycle check is NOT done here
     and that bound is stated in `basisVersionFindings`' own comment. */
  VERSION_LEG_SELF: {
    check: 'C-25.14',
    where: GRAMMAR_WHERE,
    translation: 'That version rests on the question it is an answer to. '
      + 'A question is not evidence for its own answer.',
  },
  /* A leg or a ground row that belongs to no version in the block — the mirror
     of DERIVED_FROM_UNKNOWN, one grain down. Three sibling arrays joined by name
     is the shape `basis[]`/`grounds[]` already uses; an orphan in either of the
     two joined arrays is material the record would hold and never read. */
  VERSION_ORPHAN_ROW: {
    check: 'C-25.15',
    where: GRAMMAR_WHERE,
    translation: 'Part of the version block names a version that is not there. '
      + 'It would be material the record holds and never shows anybody, which is worse than not holding it.',
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
    translation: 'One part of that version rests on something this record does not hold. '
      + 'A reading of the evidence that points at a document nobody can open is a reading nobody can check.',
  },
  /* THE READ'S TWO REFUSALS. Versions are versions OF an inquiry, so there is no
     default subject and there must not be one — VERSION_CHAIN_NO_ADDRESS'
     reasoning one construct over: an answer for an unnamed subject is a list of
     unrelated compositions wearing the word "versions". */
  BASIS_VERSIONS_NO_INQUIRY: {
    check: 'C-25.17',
    where: 'src/basis-versions/index.mjs basisVersions, reached from op=basisversions',
    translation: 'That request did not say which question to read the versions of. '
      + 'A version is one reading of the evidence for one question, so it asks '
      + 'rather than answering for a question you did not name.',
  },
  /* And an id of the wrong CLASS is refused rather than answered with an empty
     list. "This project has no versions of its basis" is a confidently wrong
     sentence about a thing that has no basis at all, and an empty answer is the
     most misleading form a wrong answer takes. */
  BASIS_VERSIONS_NOT_AN_INQUIRY: {
    check: 'C-25.18',
    where: 'src/basis-versions/index.mjs basisVersions, reached from op=basisversions',
    translation: 'Only a question carries versions of its evidence, and that is not a question. '
      + 'Answering with an empty list would say this thing has no readings of its evidence, '
      + 'when the truth is that it could not have any.',
  },
  /* PL-2 / IS-2 — THE SECOND ENFORCEMENT LAYER of §6 rule 4's reason rule, and
     it is here rather than only at the write op because VERIFICATION rule 3a
     requires an assertion at EACH place a rule is enforced, and because the two
     layers answer different questions. The write op refuses an ACT that carries
     no reason. This refuses a DOCUMENT that arrives already claiming a
     reason-bearing state with nothing behind it — which is the shape a hand-
     authored `bundle.md`, a replayed history, or a future writer would take, and
     none of those go through the op.

     BOTH LAYERS CALL `versionNeedsReason` AND NEITHER RE-TYPES THE SET. Two
     enforcement layers are what the rule requires; two IMPLEMENTATIONS of the
     membership test are what IS-6's C-22.4 control was absorbed by, so there is
     one predicate. */
  VERSION_DISPOSITION_UNATTRIBUTED: {
    check: 'C-25.19',
    where: GRAMMAR_WHERE,
    translation: 'This reading of the evidence was set aside or turned down with no reason recorded, '
      + 'or with a machine\'s name against it. What a member decided about a reading, and why, is '
      + 'the record itself — a decision nobody signed and nobody explained leaves nothing to answer to.',
  },
};

/* §6 rule 4's four states. Exported so IS-2's six member ops read the vocabulary
   from here rather than holding a second copy of it — the drift DEC-8 closed. */
export const VERSION_STATES = ['suggested', 'considering', 'accepted', 'rejected'];

/* ===================================================================
 * PL-2 / IS-2 — **THIS IS THE SIXTH STATE MACHINE IN THIS PLANE**, and
 * INVESTIGATIVE-SESSION.md §6 rule 4 says so in those words: *"This is a SIXTH
 * state machine and the design says so."* The five that already exist are the
 * five keys of `STATES` (record-grammar's: information, inquiry and its two legacy
 * spellings, action, project); task states and proposal dispositions are
 * DIFFERENT vocabularies belonging to different objects, and nothing existing is
 * this machine (SWEEP §1.4). It was stated in the catalogue that defined the
 * other five and moved here with this machine, so a reader counting state
 * machines counts six.
 *
 * IT IS DELIBERATELY NOT A SIXTH KEY OF `STATES`. `STATES` is keyed by
 * OBJECT_TYPE and consulted through `vocabFor` over a document's DECLARED type;
 * a basis version is not an object type, has no bundle id, and is never the
 * subject of `checkStateLegality`. Adding it there would make `vocabFor` answer
 * this machine for a document whose type happened to collide, and would put a
 * version's states into every sweep that enumerates the object machines. One
 * table, its own name, imported by everything that needs it.
 *
 * THE EDGES, and each one is a member act (§6 rule 4, second bullet):
 *
 *   suggested   -> considering | accepted | rejected
 *   considering -> suggested   | accepted | rejected
 *   accepted    -> considering | rejected
 *   rejected    -> suggested   | considering | accepted
 *
 * WHY `accepted -> suggested` IS ABSENT while every other reversal is present.
 * §6 rule 4 is explicit that *"`considering` and `rejected` are reversible, the
 * states are not a one-way ladder"*, and rule 5 is equally explicit that
 * *"accepted is a HISTORICAL FACT — this version was accepted, on this date, by
 * this member"* and that *"a version accepted in error is REJECTED, which is a
 * different and rarer act than being superseded"*. Returning an accepted version
 * to `suggested` would say nobody had ever acted on it, which is the one thing
 * the record knows to be false. So the way back from `accepted` is through an
 * act that is itself recorded — rejecting it, or putting it back under
 * consideration — and never through an erasure.
 *
 * A version that stops being CURRENT does not move in this machine at all: it
 * stays accepted, because it honestly was (§6 rule 5). Current is a property of
 * the PROJECT's relationship to the inquiry (§7) and is not a state here.
 */
export const VERSION_MACHINE = {
  legal: VERSION_STATES,
  edges: {
    suggested:   ['considering', 'accepted', 'rejected'],
    considering: ['suggested', 'accepted', 'rejected'],
    accepted:    ['considering', 'rejected'],
    rejected:    ['suggested', 'considering', 'accepted'],
  },
};

/* §6 rule 4, first bullet: a machine-written version is a PROPOSAL and inherits
   the interaction-construct's proposal rules — *"it is adopted, deferred WITH a
   recorded reason, or dismissed WITH a recorded reason"*. The three constructs
   map onto three of the six ops and the mapping is stated rather than implied:
   ADOPT is `accept`, DEFER is `consider` (the member has not decided and is
   saying so on the record), DISMISS is `reject`. So the two reason-bearing
   target states are `considering` and `rejected`, and this array is the ONE
   place that says which they are.

   Rule 4's second bullet raises `rejected` above the construct's floor —
   *"rejection at minimum carries an authored reason — the rejection record is
   the anti-omission instrument, and it is worthless without one"* — which is why
   the requirement is enforced at two layers (the write op and the catalog) and
   why VERIFICATION rule 3a then owes an assertion at EACH of them.

   ONE PREDICATE AND ONE ARRAY, never a second copy of the membership test: IS-6's
   C-22.4 control left its suite green at 98/98 because a rule had two
   implementations and removing either left the other absorbing the control. The
   six acts (`./index.mjs`) import `versionNeedsReason`; the grammar
   (`./grammar.mjs`) calls it; there is no third spelling. */
export const VERSION_REASON_REQUIRED = ['considering', 'rejected'];
export const versionNeedsReason = (to) => VERSION_REASON_REQUIRED.includes(to);

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
    translation: 'That request did not say which question the reading belongs to. '
      + 'A reading of the evidence always belongs to one question, so it asks rather than guessing.',
  },
  VERSION_ACT_NOT_AN_INQUIRY: {
    check: 'C-25.21',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'Only a question carries readings of its evidence, and that is not a question. '
      + 'There is nothing here to accept, set aside or turn down.',
  },
  VERSION_ACT_NO_VERSION: {
    check: 'C-25.22',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'That request did not name which reading to act on. '
      + 'A question can hold several readings of its evidence, and acting on the wrong one is '
      + 'worse than being asked which you meant.',
  },
  VERSION_ACT_NO_SUCH_VERSION: {
    check: 'C-25.23',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'This question holds no reading by that name. '
      + 'Readings are named so a member can ask for one by name, and a name nobody wrote is '
      + 'refused rather than matched to whatever is nearest.',
  },
  /* REC-46's ONE predicate, at the ONE transition site. §4: THE AI HOLDS NO OP
     THAT ACCEPTS. A machine may compose an account of the evidence and propose
     it; deciding what the record stands on is a named member's act, and this is
     the refusal that says so for all six. */
  MACHINE_CANNOT_MOVE_VERSION: {
    check: 'C-25.24',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'Deciding what to do with a reading of the evidence is a named member\'s call, '
      + 'and this request came from an automated credential. A machine may put a reading forward '
      + 'and may never settle it. Sign in as a member.',
  },
  VERSION_ILLEGAL_TRANSITION: {
    check: 'C-25.25',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'That is not a move this reading can make from where it stands. '
      + 'A reading a member has already accepted is corrected by turning it down or by putting it '
      + 'back under consideration, never by returning it to something nobody had acted on.',
  },
  VERSION_NO_REASON: {
    check: 'C-25.26',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'Setting a reading aside or turning it down carries the reason in the member\'s own '
      + 'words. The record of what was turned down is the instrument that makes a pattern of '
      + 'turning things down visible at all, and it is worth nothing without the reason.',
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
    translation: 'That reason was given but could not be stored as written: it is either longer than '
      + 'the record allows or it contains a character the record has no way to escape, such as a '
      + 'double quote. Nothing was changed. Shorten it, or say it without the quotation marks, and '
      + 'the words stay yours.',
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
    translation: 'Accepting this reading would make the question rest, through a chain of other '
      + 'questions, on itself. The answer would then be its own support, which is a circle rather '
      + 'than a case, and the chain that closes it is named above.',
  },
  VERSION_NOT_ACCEPTED: {
    check: 'C-25.28',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'A project can only stand on a reading its members have accepted, and this one has '
      + 'not been accepted. Exploring an unsettled reading is done by calculating over it, which '
      + 'moves nobody\'s stance.',
  },
  VERSION_CURRENT_NO_PROJECT: {
    check: 'C-25.29',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'Standing on a reading is something a PROJECT does, so this request has to name '
      + 'which project. A question can be shared by several teams, and one team\'s decision must '
      + 'never quietly move another team\'s.',
  },
  VERSION_CURRENT_UNRELATED: {
    check: 'C-25.30',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'That project does not draw on this question, so it has no stance here to move. '
      + 'Add the question to the project first, and then choose what the project stands on.',
  },
  VERSION_ACT_UNWRITABLE: {
    check: 'C-25.31',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'This question\'s own file could not be rewritten in place, so nothing was changed. '
      + 'Acting on a reading edits the record the reading lives in, and a half-written record is '
      + 'worse than an unchanged one.',
  },
  /* D-271 — DEC-32 RULE 4's ANTI-GAMING KEYSTONE, ENACTED AT THE ONE ACT THAT
     CASHES IT IN.
     THE NUMBER BETWEEN C-25.31 AND THIS ROW IS DELIBERATELY SKIPPED, and it is
     NOT SPELLED HERE ON PURPOSE — it is held by a concurrent unmerged item (PL-2's
     verification pass), which measured it free when it looked, and stepping over
     an id somebody holds is cheaper than the collision seven items paid for in one
     day. **Writing the numeral in this comment ALLOCATED IT AS A CHECK**:
     the retired `scripts/coverage.mjs` (gone since T18, K739) built the catalogue with
     `checksSrc.matchAll(/C-\d+\.\d+/g)` over the RAW source of this file, comments
     included, so a number named in prose becomes a check `--strict` then demands
     an assertion for. Measured at this item: the catalogue read 225 where the
     rows are 224, and `--strict` EXITED 1 naming a check nobody had written.
     Same class as the census that graded a file by a token in its comments, in a
     second instrument and this one GATED — delegated with the receipt rather than
     fixed here, because the harvest regex is not this item's span.
     THE TRANSLATION REUSES THE RECORD'S EXISTING MEMBER-FACING PHRASE — "would
     carry the answer on its own", already the wording in BASIS_VERSION_CHECKS —
     rather than authoring a third spelling of it. DEC-32 clause 1 and D-226 ban
     the analyst's vocabulary from any member-facing string, and a second sentence
     saying the same thing differently is the drift D-226 is about. */
  VERSION_AFFIRMATION_INCOMPLETE: {
    check: 'C-25.33',
    where: 'src/basis-versions/index.mjs #moveVersionState, reached from the six version acts',
    translation: 'Accepting this reading claims that each of the parts it rests on would carry the '
      + 'answer on its own. That is a claim only a named member can make, and it is made part by '
      + 'part rather than assumed from silence, so every part has to be named before this reading '
      + 'becomes what the record stands on.',
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
    translation: 'This question has been published, and the case it went out in froze it as it '
      + 'stood. Changing which reading of the evidence it stands on now would leave the published '
      + 'version saying something the question no longer says. Pick it back up first, make the '
      + 'change, and publish that as a new edition — the published one keeps its own signature and '
      + 'goes on answering.',
  },
};
/* The two ways a composition can compose, and DEC-32's own words for them. NOT a
   surface vocabulary: DEC-32's elicitation clause 1 bans "ground partition" and
   the AND/OR words from every member-facing screen (D-226), which is why every
   translation in BASIS_VERSION_CHECKS above says "every part is needed" and
   "would carry the answer on its own" instead. */
export const VERSION_RELATIONSHIPS = ['and', 'or'];
/* Wider than GROUND_LABEL_RE by design: a member names a version and will use a
   full stop. Still bounded, still a single line, still no leading space. */
export const VERSION_NAME_RE = /^[a-z0-9][a-z0-9 ._-]{0,63}$/i;

/* Section 9's five kinds. A suggestion is one of these and nothing else, and
   the table is here rather than in the store because two things read it: the
   endpoint, which refuses an unknown kind, and `basisVersionFindings`, which
   refuses a DOCUMENT carrying one. One table, no second spelling.

   EVERY KIND WRITES THE SAME OBJECT — a version in state `suggested` carrying
   its run — and that is section 10's ruling rather than a simplification here:
   *"Export means the AI adds a new version to the inquiry being investigated"*,
   so both modes use ONE write path and the fence needs no second design. What
   differs between the kinds is what the version SAYS, which is why the kind is
   a field on the version and not a second endpoint. */
export const SUGGEST_KINDS = {
  'basis-version': 'a new version of the inquiry\'s basis — the main output: a complete alternative '
    + 'composition with its legs, its branches and its description (section 6)',
  'sharpen-question': 'the inquiry asks two questions that need different evidence; here they are '
    + 'separated (section 8). The separation is carried as the version\'s claim',
  'new-inquiry': 'a proposition answering the question, with the first version of its basis '
    + '(section 8, under section 3\'s basis ruling)',
  'level-empty': 'we looked at this level — meaning, content, documents, or the open internet — and it '
    + 'is empty, with the observation-log address of the search that establishes it. Without this kind '
    + 'a run that honestly found nothing supportable is indistinguishable from a run that emitted '
    + 'nothing (SWEEP section 6), and section 15\'s empty-run instrument has no object to count',
  'new-edition': 'evidence bearing on a PUBLISHED finding. A published case cannot be changed, so the '
    + 'only act available is a new edition, and it is the member\'s',
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
  'to be named', 'tbd', 'to be determined', 'n/a', 'na', 'none', 'null', 'undefined',
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

/* C-27.15, the one row of the catalogue's `SUGGEST_CHECKS` this module raises (R1): the kind a DOCUMENT carries, checked
   by the grammar at both gates. The rest of C-27 is the suggest endpoint's, run-productions'. */
export const VERSION_KIND_CHECKS = {
  /* ---- the grammar's own row, fired from `basisVersionFindings` at both
     gates. A DOCUMENT can carry a kind without ever passing through the
     endpoint — a hand-authored file, a replayed revision, a future writer — and
     none of those go through the op, which is the same two-layer reasoning
     C-25.19 records one family up. ---- */
  VERSION_KIND_UNKNOWN: {
    check: 'C-27.15',
    where: GRAMMAR_WHERE,
    translation: 'This reading says it is a kind of suggestion nobody recognises. The kinds are a '
      + 'closed set because what a suggestion CLAIMS to be decides how it is read, and a kind outside '
      + 'the set is a claim with nothing behind it.',
  },
};

/* C-32.2 and C-33.1, .2, .33–.37: the conclusion's refusals (R16, R17, R20, R21), this module's rows of the
   catalogue's machine-fence (C-32) and act-shape (C-33) families, whose headers explain why each `where` is a region. */
export const CONCLUDE_ACT_CHECKS = {
  MACHINE_CANNOT_CONCLUDE: {
    check: 'C-32.2',
    where: 'src/basis-versions/index.mjs conclude > is-machine-conclude',
    translation: 'A conclusion is a person saying what they think the record shows, and it carries '
      + 'their name for as long as the record lasts. The credential that asked here is an automated '
      + 'one: it may raise the question, gather what bears on it and draft the answer, and it may '
      + 'never be the one who answers. Sign in to conclude.',
  },
  NO_CONCLUSION: {
    check: 'C-33.1',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: 'Concluding records what was concluded, and this one says nothing. If the honest '
      + 'answer is that the group could not settle it, write that down — an answer of undetermined '
      + 'is a real answer here and is stated rather than left blank.',
  },
  /* REC-117 / BOB 2026-09-17: the translation now NAMES THE DOOR, and that is
     the surfacing half of the ruling rather than a nicety. A member who is
     refused here and told only that a falsifier is required is a member under
     pressure to invent one; a member told they may instead state that none can
     honestly be given has been offered the honest way through. */
  NO_FALSIFIER: {
    check: 'C-33.2',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: 'A conclusion has to say what would overturn it. Without that nobody can check the '
      + 'finding, including the person who wrote it, and a finding that cannot be checked claims '
      + 'more than the evidence behind it can carry. If no falsifier can honestly be named, say so '
      + 'rather than inventing one: the record will carry that no falsifier was stated, in your '
      + 'name and with the date, wherever this finding appears.',
  },
  /* REC-117. The one refusal the override ADDS, and it exists because the
     alternative is the plane choosing which of a member's two statements it
     meant. No caller written before this item can reach it: the parameter it
     turns on did not exist. */
  FALSIFIER_AND_NONE_STATED: {
    check: 'C-33.33',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: 'You have written a falsifier and also asked to record that none could be stated. '
      + 'Those are two different things to say about this finding, and choosing between them is not '
      + 'something the record should do on your behalf. Keep the falsifier, or clear it and record '
      + 'the absence.',
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
    translation: 'Concluding adopts the claim of an accepted reading, and that claim is what the group '
      + 'concluded. There is no claim to adopt here. For a project, the reading is the one the project '
      + 'stands on; with no project, name the reading. State the claim on a reading first — a claim '
      + 'nothing supports yet is allowed — and conclude again.',
  },
  /* REC-124 / §7.1 item 2. A free conclusion text beside a project could say
     what no claim said; the member is told the door rather than having their
     words quietly relabelled as commentary. */
  CONCLUSION_IS_THE_CLAIM: {
    check: 'C-33.35',
    where: 'src/basis-versions/index.mjs conclude > is-conclude-answer',
    translation: 'When a project concludes, the claim it adopts is the conclusion, so a separate '
      + 'conclusion text is not accepted — it could say something no claim said. Anything you want to '
      + 'add beyond the claim can be sent as commentary: it is recorded in your name and is never '
      + 'treated as evidence.',
  },
  /* REC-124. The project's own frontmatter could not take the conclusion row
     in place, so nothing was written — the make-current writer's condition, on
     the conclusion row. */
  /* REC-136 / §7.1 item 7. A project withdraws only a conclusion it currently
     stands on; a second withdrawal, or one with nothing concluded, would add
     an entry that records nothing. */
  NOTHING_TO_WITHDRAW: {
    check: 'C-33.37',
    where: 'src/basis-versions/index.mjs withdrawConclusion > is-withdraw-stance',
    translation: 'There is no conclusion here to withdraw: this project has not concluded this question, or '
      + 'has already withdrawn its latest conclusion. Everything it concluded and withdrew before stays in '
      + 'the record.',
  },
  UNSPLICEABLE_CONCLUSIONS: {
    check: 'C-33.36',
    where: 'src/basis-versions/index.mjs #setProjectConclusion > is-conclusion-row',
    translation: 'The project\'s own record is laid out in a way this act cannot add a conclusion to '
      + 'without rewriting parts of it nobody asked to change, so nothing was recorded. The project\'s '
      + 'file needs its list of conclusions tidied before it can conclude.',
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
    translation: 'That request does not name a question this record holds and you can read. Making '
      + 'a citation more specific happens on a question\'s reading of its evidence, so it needs the '
      + 'question first.',
  },
  NARROW_NO_SUCH_VERSION: {
    check: 'C-50.2',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: 'That question has no reading of its evidence by that name. A citation is made more '
      + 'specific in a NEW reading taken from an existing one, so the reading it starts from has to '
      + 'be named exactly as the question holds it.',
  },
  NARROW_NO_SUCH_LEG: {
    check: 'C-50.3',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: 'That reading has no piece of evidence at the position named. Pieces are counted '
      + 'from zero, in the order the reading lists them.',
  },
  NARROW_NO_PART: {
    check: 'C-50.4',
    where: 'src/basis-versions/index.mjs #narrowSource > is-narrow-source',
    translation: 'That piece of evidence has no part to point at more precisely. It either rests on '
      + 'another question, which has no pages or passages, or on a document this record holds no '
      + 'copy of — and a part of something nobody captured cannot be named.',
  },
  NARROW_NOT_A_MEMBER: {
    check: 'C-50.5',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: 'Making a citation more specific is a member\'s own act, done in their name. A '
      + 'machine may PROPOSE passages that look relevant, and they are listed for you to choose from, '
      + 'but choosing which passage is on point is a judgment a person signs for.',
  },
  NARROW_NO_EXTENT: {
    check: 'C-50.6',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: 'That request does not say which part of the document the citation should point at. '
      + 'Name the part — a page, a region of a page, a cell, a paragraph or a slide — or choose one of '
      + 'the proposed passages by its content id.',
  },
  NARROW_BAD_EXTENT: {
    check: 'C-50.7',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: 'The part named cannot be recorded as sent: it names a field this act does not take, '
      + 'a value that cannot be written into the record, a content id this record does not hold, or '
      + 'both a content id and a description of the same part. It is refused rather than guessed at, '
      + 'because a citation quietly re-read would not be the one you made.',
  },
  NARROW_OTHER_CAPTURE: {
    check: 'C-50.8',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-extent',
    translation: 'The part named is not in the copy of the document this citation rests on. Pointing '
      + 'the citation at a different document, or at a later copy of the same one, is not making it '
      + 'more specific — it is moving it, and a citation is never moved except by its own separate act.',
  },
  NARROW_NOT_NARROWER: {
    check: 'C-50.9',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-claim',
    translation: 'The part named is not inside what the citation already points at — it is the same '
      + 'part, a wider one, or a different place in the document. Making a citation more specific '
      + 'can only ever point it at LESS of the document than before; anything else would claim a '
      + 'precision nobody established.',
  },
  NARROW_NAME: {
    check: 'C-50.10',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-claim',
    translation: 'The new reading needs a name of its own, one the question does not already use. The '
      + 'reading it starts from keeps its name and stays exactly as it was: changing an existing '
      + 'reading in place would move a citation somebody else may be relying on.',
  },
  NARROW_NO_DESCRIPTION: {
    check: 'C-50.11',
    where: 'src/basis-versions/index.mjs narrow > is-narrow-claim',
    translation: 'The new reading needs a short account of what changed and why — which citation now '
      + 'points at less of its document, and what makes that part the one that matters. That account '
      + 'is what a later reader has to go on.',
  },
};
