/* inquiry-grammar — THE ROWS (requirements: `build/requirements/inquiry-grammar.md` R5, R7; DEC-49, K6).
 *
 * Each row is `{check, where, translation}`, its number and translation moved from the check catalogue
 * (`checks/bio-checks.mjs`, legacy-checks) unchanged. `LEAD_NOT_EVIDENCE` (C-54.1) is raised here, by
 * `leadLegFindings` (`./grammar.mjs`), and its `where` names that site (changed from the catalogue's; stamped by
 * 1.50.0, T20's layer 2). The other five are minted by `inquiry`'s acts (its R20, R11, R23, R27), which read them
 * from here; their `where`s name those acts' sites, unchanged. This file imports nothing. */

/* =====================================================================
 * MK-4 / IC-135 / IC-136 — THE LEAD (D-194, `MEMBER-KNOWLEDGE-DESIGN.md` §5):
 * the same member knowledge BEFORE the search. C-54, minted with the old
 * process's `node tools/mintid.mjs C` (that tool was retired in T19).
 *
 * ITS OWN FAMILY because its subject is its own: the ways a member's LEAD could
 * come to claim more than it is. §5 rules a lead is an authored row and NEVER
 * EVIDENCE — it cannot be a basis leg — and following it is a LOOK recorded in
 * `observation_log` under `authority_kind = 'lead'`. The observation log's own
 * refusals (C-22.x, `checkObservation` in `airun.mjs`) apply to that look
 * unchanged and are NOT restated here; what is here is the lead's own:
 *
 *   is-lead-not-evidence   THE REFUSAL THE ITEM EXISTS FOR (§7): a lead cited as
 *                          a leg, at every leg grammar, BY NAME
 *
 * THE LIAR THIS FAMILY REFUSES is a lead that is merely an UNLABELLED
 * OBSERVATION — stored as a bundle or a content row, so a leg could cite it as
 * evidence. The first fence is STRUCTURAL: a lead lives in `leads` under a
 * `LEAD-` id that no leg grammar accepts as a target or a content id. The second
 * is this family's C-54.1, which names the lead instead of answering "not a
 * canonical record id" — a member told their lead is malformed would re-author
 * it as a document, which is exactly the liar arriving by the front door.
 * ===================================================================== */

export const LEAD_CHECKS = {
  LEAD_NOT_EVIDENCE: {
    check: 'C-54.1',
    where: 'src/inquiry-grammar/grammar.mjs leadLegFindings > is-lead-not-evidence',
    translation: 'That leg points at a LEAD. A lead is somewhere to look — what a member was told or '
      + 'suspects — and it is never evidence, so nothing can rest on it. Follow the lead: if the '
      + 'look finds the document, capture it and cite THAT; if you saw the thing yourself, write it '
      + 'up as your own observation.',
  },
};


/** R7: the rows `inquiry`'s acts mint for the inquiry's own refusals, and the lead row (R5), by code. Named with the
 *  reserved `_CHECKS` suffix, so DEC-49 composition (control-plane's `families.mjs`) finds it as a family (K850). */
export const INQUIRY_GRAMMAR_CHECKS = Object.freeze({
  LEAD_NOT_EVIDENCE: LEAD_CHECKS.LEAD_NOT_EVIDENCE,
  NOT_INQUIRIES: {
    check: 'C-33.13',
    where: 'src/inquiry/index.mjs #dispose > is-dispose-inquiries',
    translation: 'This act moves a question along, and the selection carries things that are not '
      + 'questions. The whole set is refused rather than quietly narrowed to the part that fits, '
      + 'because a set that acted on less than you selected is a set you were not shown.',
  },
  SELF_BASIS: {
    check: 'C-33.22',
    where: 'src/inquiry/index.mjs check > is-basis-acyclic, reached from op=promote through the step inquiry registers with promotion (K31)',
    translation: 'A question cannot be the evidence for its own answer. This write would have it '
      + 'rest on itself, which reads as support and adds nothing anybody outside could check.',
  },
  BASIS_CYCLE: {
    check: 'C-33.23',
    where: 'src/inquiry/index.mjs check > is-basis-acyclic, reached from op=promote through the step inquiry registers with promotion (K31)',
    translation: 'This write would close a loop: the chain it would join already rests, somewhere '
      + 'further along, on the thing being written. The path is named so the loop can be seen '
      + 'rather than re-derived, and support that circles back is support that rests on nothing.',
  },
  MACHINE_CANNOT_DIVIDE: {
    check: 'C-32.7',
    where: 'src/inquiry/index.mjs #divide > is-machine-divide',
    translation: 'Dividing a question says the group asked one thing when it was really asking '
      + 'two, and that is a judgement about the group\'s own work. The credential that asked here '
      + 'is an automated one: it may raise questions and gather what they rest on, and may not '
      + 'restructure them. Sign in to divide it.',
  },
  MACHINE_CANNOT_GROUND: {
    check: 'C-32.8',
    where: 'src/inquiry/index.mjs #ground > is-machine-ground',
    translation: 'Grounding says some of the reasons behind an answer are strong enough to carry '
      + 'it on their own, and it is the one act here that makes a finding stronger rather than '
      + 'weaker. That decision needs a person behind it, and the credential that asked is an '
      + 'automated one. Sign in to ground it.',
  },
});
