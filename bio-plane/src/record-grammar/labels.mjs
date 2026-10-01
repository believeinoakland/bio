// @ts-check
/* record-grammar: the machine-work labels, the plane's own answer to "who proposed this" and "who minted this row",
   each read through `isMachineIdentity` and published as a sentence. Moved from the check catalogue at T19 with their
   comments. REC-195's `lawProposalLabel` is actions' and lives in action-grammar, over `proposalLabel`;
   `isMachineMinted` had no reader and went with the catalogue (K750). */

import { isMachineIdentity } from './actors.mjs';

/* A value stringified and trimmed; one that cannot be stringified (a throwing `toString`, an object with no prototype)
   is blank, never a throw (R37, R38). */
function text(v) {
  try { return String(v ?? '').trim(); } catch { return ''; }
}

/* =====================================================================
 * REC-195 (D-149's remaining half; `BIO_Case_Making_v0_1.md` §2): A MACHINE'S
 * PROPOSAL OF THE LIST, LABELLED MACHINE WORK.
 *
 * The ruling's own words are *the machine may propose the list from the
 * counterparty, labelled as machine work, and never sets it*. D-149 built the
 * fence (C-32.18) and left the proposal unbuilt. The proposal is stored APART
 * from the member's list — it is not `governing_laws[]`, it is not in the
 * action's bytes, and no read composes the two — so the only thing this block
 * has to get right is the LABEL.
 *
 * THE LABEL IS THE PLANE'S OWN ANSWER, NOT A LITERAL FOR A SURFACE TO MATCH,
 * and this is `CONTENT_MINT_STATES` one construct over, for its reason exactly
 * (PL-17: *a surface that reads the field itself and matches on the literal has
 * rebuilt the predicate*). `proposed_by` holds an identity — a machine stamp,
 * or a member handle — and a surface rendering that identity verbatim prints a
 * machine word at a member. So the plane answers the QUESTION and publishes the
 * SENTENCE.
 *
 * THE BLOCK IS PRESENT ON EVERY PROPOSAL, not only on machine ones, for
 * `#mintLabel`'s stated reason: a key that appears only when the answer is
 * "machine" makes ABSENCE carry the meaning, and a surface that never learned
 * the key then renders nothing at all for a machine's proposal — which is the
 * failure the label exists to prevent, arriving as silence.
 *
 * THE READING IS TOTAL: three states, every `proposed_by` lands in exactly one,
 * and `unstated` is a STATED answer rather than a gap. A proposal nobody can be
 * named for is refused at the act, so `unstated` is not reachable through the
 * control plane today; it is kept because the reading is a property of the
 * VALUE, and a reader handed a row from anywhere must land somewhere honest.
 * ===================================================================== */
export const LAW_PROPOSAL_STATES = {
  machine_proposed: 'a machine credential proposed these citations. That is machine work, labelled as machine '
    + 'work: it can set a list of laws beside the request and it can never state which laws govern it. Nothing '
    + 'here is this action\'s list of governing laws, and nothing becomes one until a member states it themselves',
  member_proposed: 'a member proposed these citations to whoever states this action\'s governing laws. It is a '
    + 'proposal and not the list: only the governing-laws act sets that, and the record holds who made it',
  unstated: 'the record does not say who proposed these citations',
};

/** Read a proposal's `proposed_by` as ONE of the three states above. Blank is
 *  answered first — "nobody said" and "a machine said" are different findings —
 *  and everything the machine predicate does not claim is a name, i.e. a member.
 *  `isMachineIdentity` is REC-46's one predicate and is not re-spelled here. */
export function lawProposalState(proposedBy) {
  const s = text(proposedBy);
  if (s.length === 0) return 'unstated';
  return isMachineIdentity(s) ? 'machine_proposed' : 'member_proposed';
}

/* K171 (2) (T8, N129): THE SAME LABEL FOR EVERY PROPOSAL THE ACTION LAYER STORES APART. A standard proposed by
 * the Legal/Policy Lookup skill or a member (standards R9), a comparison against standards (conformance R12), a
 * filing's draft (filings R5), a candidate theory and remedy (filings R14), an action plan's proposed option
 * (action-plans R11) and a prepared communication (filings R23; both N-A1, T18) are each machine work or a member's
 * suggestion, never the thing itself, and each is labelled by `lawProposalState`'s three states. ONE CLOSED
 * TABLE, keyed by what was proposed: `governing_laws` is REC-195's table above, the same object, so its words
 * cannot drift from it; each other subject says, in each state, what the proposal is not. A subject the table does
 * not hold is a caller's defect and throws, rather than answering a sentence written for something else. */
export const PROPOSAL_STATES = Object.freeze({
  governing_laws: LAW_PROPOSAL_STATES,
  standard: Object.freeze({
    machine_proposed: 'a machine credential proposed this standard. That is machine work, labelled as machine work: '
      + 'it can set a standard beside the record for members to consider and it can never enter one. Nothing here '
      + 'is a standard this record holds, and nothing becomes one until a member records it themselves',
    member_proposed: 'a member proposed this standard to whoever records the group\'s standards. It is a proposal '
      + 'and not a standard: only recording a standard enters one, and the record holds who made the proposal',
    unstated: 'the record does not say who proposed this standard',
  }),
  comparison: Object.freeze({
    machine_proposed: 'a machine credential prepared this comparison of a government act against standards. That is '
      + 'machine work, labelled as machine work: it can set out rows and questions for members and it can never '
      + 'determine whether the act complied. Nothing here is a determination, and nothing becomes one until a member '
      + 'records it themselves',
    member_proposed: 'a member suggested this comparison of a government act against standards. It is a comparison '
      + 'and not a determination: only a determination records whether the act complied, and the record holds who '
      + 'made the comparison',
    unstated: 'the record does not say who prepared this comparison',
  }),
  filing_draft: Object.freeze({
    machine_proposed: 'a machine credential prepared this draft. That is machine work, labelled as machine work: it '
      + 'can prepare the words of a filing and it can never approve or send one. Nobody has approved or sent this '
      + 'draft, and nothing is filed until members decide to file it and send it themselves',
    member_proposed: 'a member prepared this draft. It is a draft and not a filing: nobody has approved or sent it, '
      + 'and the record holds who prepared it',
    unstated: 'the record does not say who prepared this draft, and nobody has approved or sent it',
  }),
  theory: Object.freeze({
    machine_proposed: 'a machine credential proposed this candidate theory and remedy. That is machine work, '
      + 'labelled as machine work: it can set a theory beside the standards for members and counsel to weigh and it '
      + 'can never state the group\'s position. Nothing here is the group\'s position',
    member_proposed: 'a member proposed this candidate theory and remedy. It is a candidate for members and counsel '
      + 'to weigh and not the group\'s position, and the record holds who proposed it',
    unstated: 'the record does not say who proposed this candidate theory and remedy',
  }),
  /* N-A1 (T18, K608): an option proposed for an action plan (action-plans R11) is not an option until a member
     adopts it, and a prepared communication (filings R23) is a draft nobody has approved or sent, worded as
     `filing_draft`'s sentences are. */
  plan_option: Object.freeze({
    machine_proposed: 'a machine credential proposed this option. That is machine work, labelled as machine work: it '
      + 'can set an option beside the plan for members to weigh and it can never choose one. It is not an option '
      + 'until a member adopts it',
    member_proposed: 'a member proposed this option. It is a proposal and not an option: it is not an option until '
      + 'a member adopts it, and the record holds who proposed it',
    unstated: 'the record does not say who proposed this option, and it is not an option until a member adopts it',
  }),
  communication: Object.freeze({
    machine_proposed: 'a machine credential prepared this communication. That is machine work, labelled as machine '
      + 'work: it can prepare the words of a message and it can never approve or send one. Nobody has approved or '
      + 'sent it, and nothing is sent until members decide to send it themselves',
    member_proposed: 'a member prepared this communication. It is a draft and not a message sent: nobody has '
      + 'approved or sent it, and the record holds who prepared it',
    unstated: 'the record does not say who prepared this communication, and nobody has approved or sent it',
  }),
});

/** The whole label block a reader is shown beside a proposal: who, which state,
 *  whether it is machine work, and the published sentence. ONE composer, so the
 *  store's read and any later surface cannot compose two answers to one
 *  question (REC-46's eleven-copies finding, arriving at a label). `subject` is
 *  one of `PROPOSAL_STATES`' keys (K171 (2)). */
export function proposalLabel(proposedBy, subject) {
  const table = typeof subject === 'string' && Object.prototype.hasOwnProperty.call(PROPOSAL_STATES, subject)
    ? PROPOSAL_STATES[subject] : null;
  if (!table)
    throw new RangeError(`proposalLabel: '${String(subject).slice(0, 40)}' is not a proposal subject; `
      + `one of ${Object.keys(PROPOSAL_STATES).join(', ')}`);
  const state = lawProposalState(proposedBy);
  return { by: proposedBy ?? null, state, machine_work: state === 'machine_proposed', says: table[state] };
}

/* ===================================================================== *
 * WHO MINTED THIS CONTENT ROW (SK-7, out of framework Part II 14.4 —
 * Bob's ruling of 2026-09-14, folded there as 5.7).
 *
 * THE RULING, in its own words: *"The assistant may mark passages as citable
 * on its own, every such row labelled as machine work, never attested by it,
 * and part of a finding only when a member cites it."* Three obligations, and
 * this block is the FIRST of them. The second is C-35.10, which is UNCHANGED
 * and is asserted unchanged. The third is structural and is asserted where it
 * is structural (`earnedBasisRegistry` answers `earned.content` only over the
 * content ids a CALLER named, and the only caller that names them is a basis of
 * legs a member authored).
 *
 * WHY A PUBLISHED STATE MAP RATHER THAN A BOOLEAN ON THE ROW, and the
 * precedent is one field over rather than an argument from taste. PL-17 /
 * DEC-65 met exactly this shape on `asserted_by`: the column holds an IDENTITY,
 * a surface renders the identity verbatim, and the moment the field can hold a
 * machine word the surface prints a machine word at a member. `content.minted_by`
 * is that column again — it holds `plane`, a member handle, or a control-plane
 * machine stamp — and `civicos-ui/app.html` renders `Asserted by ${…}` verbatim
 * one field over TODAY. So the plane answers the QUESTION and publishes the
 * SENTENCE, and the surface renders what it was given (DEC-49's rule reaching a
 * published vocabulary's texts, `SUFFICIENCY_CLAIM_STATES`' own words).
 *
 * THE READING IS TOTAL, which is what makes "labelled everywhere" checkable:
 * four states, every `minted_by` lands in exactly one, and `unstated` is a
 * STATED answer rather than a gap (CLAUDE.md — undetermined is first-class).
 *
 * `plane` IS NOT `machine`, AND THAT DISTINCTION IS THE LOAD-BEARING ONE.
 * A row minted at `op=promote` is the mechanical referent of a citation A
 * MEMBER AUTHORED — the member named the passage in their own basis and the
 * record minted the row to hold it, in the same transaction. Calling that
 * "machine work" would label a member's own citation as the assistant's, which
 * is the ruling read backwards and would put the label on the wrong act. What
 * 5.7 is about is a row NOBODY cited: a machine credential marking a passage
 * citable on its own initiative, which is why that state's sentence says out
 * loud that no member has cited it yet.
 * ===================================================================== */

/** The minter a row carries when the RECORD ITSELF minted it, at the moment a
 *  member's own citation first named the passage (`op=promote`'s projection).
 *  ONE literal in ONE place: `mintContent`'s default, the classifier below and
 *  every assertion read the same string, so the stamp and the reading of it
 *  cannot drift — REC-46's finding taken before it has a chance to repeat. */
export const CONTENT_MINTED_BY_PLANE = 'plane';

/** The four states of a content row's `minted_by`, each carrying the sentence a
 *  member reads INSTEAD OF the stored identity. Published through
 *  `vocabularies.content_mint_states` so no surface invents its own wording for
 *  a distinction the record now draws. */
/*  THE KEYS ARE SPECIFIC, AND THE REASON IS A MEASUREMENT RATHER THAN TASTE.
 *  The first draft spelled them `member` / `plane` / `machine` / `unstated`, and
 *  `skillpack.test.mjs` ARM B2a went red: `src/skillpack.mjs` has carried
 *  `const MACHINE_MODE = "machine"` since SK-2, and publishing a vocabulary
 *  whose key is a single common word made that unrelated literal look like a
 *  HAND COPY of a published term — which is exactly the defect that arm exists
 *  to catch, arriving as a false positive because the key was too generic to
 *  belong to anybody. The keys are now verbs of THIS act, which is what a
 *  published vocabulary's keys should have been anyway, and `machine_marked`
 *  reads beside `machine_stamped` one vocabulary over. */
export const CONTENT_MINT_STATES = {
  member_marked: 'a member marked this passage as citable, and the record holds their name and the date',
  plane_minted: 'this record minted this reference when a member first cited the passage in their own words — '
    + 'it is the address of what that member pointed at, and not a separate claim about the document',
  machine_marked: 'a machine credential marked this passage as citable. That is machine work, labelled as machine '
    + 'work: it can lay the passage beside the question and it can never attest that the text matches the '
    + 'page, and nothing here is part of a finding until a member cites it themselves',
  unstated: 'the record does not say who marked this passage as citable',
};

/** Read a content row's `minted_by` as ONE of the four states above.
 *
 *  THE ORDER OF THE ARMS IS LOAD-BEARING, and it is `sufficiencyClaimState`'s
 *  order for its reason. Blank is answered first, because "nobody said" and "a
 *  machine said" are different findings. The PLANE's own value is answered
 *  BEFORE `isMachineIdentity`, so the record's mint on a member's behalf can
 *  never be swallowed into `machine` by a later addition to the machine
 *  prefixes — and the suite pins `isMachineIdentity(CONTENT_MINTED_BY_PLANE)
 *  === false` besides, so a collision fails loudly instead of hiding behind
 *  this ordering. Everything left is a name, which is a member. */
export function contentMintState(mintedBy) {
  const s = text(mintedBy);
  /*  `s.length === 0` AND NOT `s === ''`, WHICH IS NOT A STYLE CHOICE AND IS
   *  NOT ARBITRARY. `test/sufficiency-state.control.mjs` anchors one of its arms
   *  on the exact line `if (s === '') return 'unstated';` inside
   *  `sufficiencyClaimState` a few dozen lines above, and an arm's anchor has to
   *  match EXACTLY ONCE or the arm fires on the wrong site and proves nothing.
   *  Writing the same line here made it match twice, and
   *  `m025-arm-anchor-witness.test.mjs` said so by name. Re-spelled here rather
   *  than re-anchored there: another item's control is not mine to edit, and the
   *  collision is MINE because the second occurrence is the one that arrived. */
  if (s.length === 0) return 'unstated';
  if (s.toLowerCase() === CONTENT_MINTED_BY_PLANE) return 'plane_minted';
  if (isMachineIdentity(s)) return 'machine_marked';
  return 'member_marked';
}
