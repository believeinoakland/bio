/* action-replies — its catalogue rows (requirements: `build/requirements/action-replies.md`, R1, R2; family C-150,
 * reserved for this module, K2794). `NO_SUCH_PROJECT` is membership's row (its R78), answered through
 * `membership.noSuchProject`; `BEARING_REFUSED`'s findings are `action-grammar`'s (`bearingFindings`, its R24, C-2.10),
 * carried on this module's row. */

export const ACTION_REPLY_CHECKS = {
  /* R1, R4 (v0.2 rule 1): laying out a reply claim by claim is a member's act; a machine may only propose one. */
  MACHINE_CANNOT_RECORD_BEARING: {
    check: 'C-150.1',
    where: 'src/action-replies/index.mjs actionReplyBearing > is-machine-bearing',
    translation: 'A reply is laid out claim by claim by a member. This request came from no signed-in member, so '
      + 'nothing was recorded. The assistant may propose a layout, which is stored apart and changes nothing.',
  },
  /* R1: only a reply received to a request for comment is laid out claim by claim. */
  BEARING_NOT_RFC: {
    check: 'C-150.2',
    where: 'src/action-replies/index.mjs #bearingTarget > is-bearing-rfc',
    translation: 'Only a reply received to a request for comment is laid out claim by claim. This action is not a '
      + 'request for comment, or the entry named is not a reply received, so nothing was recorded.',
  },
  /* R1 (action-grammar R24): each claim is one the request put, once, with one of the three bearings. */
  BEARING_REFUSED: {
    check: 'C-150.3',
    where: 'src/action-replies/index.mjs #bearingShape > is-bearing-shape',
    translation: 'Each claim in the layout is one the request put to the addressee, named once, with what the reply '
      + 'did about it: new evidence, disputed without evidence, or not addressed; a note is at most 500 characters, '
      + 'and a layout holds 1 to 50 claims. The item named did not meet that, so nothing was recorded.',
  },
  /* R2, R4 (v0.2 rule 1): linking what arose from a response is a member's act. */
  MACHINE_CANNOT_LINK: {
    check: 'C-150.4',
    where: 'src/action-replies/index.mjs aroseFromLink > is-machine-link',
    translation: 'That a matter or project arose from a response is recorded by a member. This request came from no '
      + 'signed-in member, so nothing was linked.',
  },
  /* R2: a matter or project arises from a response, a reply the group received. */
  AROSE_FROM_NOT_A_RESPONSE: {
    check: 'C-150.5',
    where: 'src/action-replies/index.mjs aroseFromLink > is-arose-response',
    translation: 'A matter or project is linked to a response the group received. The entry named is not a reply '
      + 'received, so nothing was linked.',
  },
  /* R2: the same link is recorded once; a link is never edited. */
  AROSE_FROM_LINKED: {
    check: 'C-150.6',
    where: 'src/action-replies/index.mjs aroseFromLink > is-arose-linked',
    translation: 'This link is already recorded, so nothing was added. A link is kept as recorded and never edited.',
  },
  /* R2 (J1 (d)): what arose is a project, or a plan's matter, named in the form each takes. */
  AROSE_FROM_REFUSED: {
    check: 'C-150.7',
    where: 'src/action-replies/index.mjs #arising > is-arising-shape',
    translation: 'What arose from the response is named as a project, or as a plan with one of its matters, each by '
      + 'its id. This request named neither in that form, so nothing was linked.',
  },
};
