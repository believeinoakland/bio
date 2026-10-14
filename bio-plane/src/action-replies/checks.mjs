/* action-replies — its catalogue rows (requirements: `build/requirements/action-replies.md`, R1, R2, R7, R9; family C-150,
 * reserved for this module, K2794). `NO_SUCH_PROJECT` is membership's row (its R78), answered through
 * `membership.noSuchProject`; `BEARING_REFUSED`'s findings are `action-grammar`'s (`bearingFindings`, its R24, C-2.10),
 * carried on this module's row, its one minting site (K231, K2845). */

/* R7 (T46; DEC-194, N913): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's
   rows answer, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and extraction's
   `TRANSCRIBE_WORDS` are. The design stream's words: re-worded there, then re-taken here by key; a row never holds a copy
   of its sentence. `AROSE_FROM_REFUSED` (C-150.7), which `words.json` does not hold, keeps its own translation. */
export const ACTION_REPLY_WORDS = Object.freeze({
  'refusal.MACHINE_CANNOT_RECORD_BEARING': 'Only a member lays out a reply claim by claim. The assistant may propose a layout '
    + 'for you to check. Nothing was written.',
  'refusal.BEARING_NOT_RFC': 'A reply is laid out claim by claim only for a request for comment, once its reply is received. '
    + 'Nothing was written.',
  'refusal.BEARING_REFUSED': 'Lay out from 1 to 50 claims, each one the request laid out, listed once, with how the reply '
    + 'bears on it and a note of at most 500 characters. {item} isn\'t. Nothing was written.',
  'refusal.MACHINE_CANNOT_LINK': 'Only a member records what arose from a reply. Nothing was written.',
  'refusal.AROSE_FROM_NOT_A_RESPONSE': 'Only a received reply can be what something arose from. Nothing was written.',
  'refusal.AROSE_FROM_LINKED': 'That link is already recorded. Nothing was written.',
});

/* R7, R9: a sentence read by key, its `{placeholders}` filled from `fill` (one not given is left for the screen); a throw
   for a key the list lacks (a missing sentence is silent, a throw loud). */
export function fillWords(key, fill = {}) {
  const en = ACTION_REPLY_WORDS[key];
  if (typeof en !== 'string' || !en) throw new Error(`action-replies: ${key} is not one of this module's words (words.json)`);
  return en.replace(/\{([a-z_]+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(fill, k) ? String(fill[k]) : m));
}
const words = (key) => fillWords(key);

export const ACTION_REPLY_CHECKS = {
  /* R1, R4 (v0.2 rule 1): laying out a reply claim by claim is a member's act; a machine may only propose one. */
  MACHINE_CANNOT_RECORD_BEARING: {
    check: 'C-150.1',
    where: 'src/action-replies/index.mjs actionReplyBearing > is-machine-bearing',
    translation: words('refusal.MACHINE_CANNOT_RECORD_BEARING'),
  },
  /* R1: only a reply received to a request for comment is laid out claim by claim. */
  BEARING_NOT_RFC: {
    check: 'C-150.2',
    where: 'src/action-replies/index.mjs #bearingTarget > is-bearing-rfc',
    translation: words('refusal.BEARING_NOT_RFC'),
  },
  /* R1 (action-grammar R24): each claim is one the request put, once, with one of the three bearings. R9 (T47; DEC-199):
     the row holds the sentence with `{item}` for the screen; the refusal answers it filled with the item named. */
  BEARING_REFUSED: {
    check: 'C-150.3',
    where: 'src/action-replies/index.mjs #bearingShape > is-bearing-shape',
    translation: words('refusal.BEARING_REFUSED'),
  },
  /* R2, R4 (v0.2 rule 1): linking what arose from a response is a member's act. */
  MACHINE_CANNOT_LINK: {
    check: 'C-150.4',
    where: 'src/action-replies/index.mjs aroseFromLink > is-machine-link',
    translation: words('refusal.MACHINE_CANNOT_LINK'),
  },
  /* R2: a matter or project arises from a response, a reply the group received. */
  AROSE_FROM_NOT_A_RESPONSE: {
    check: 'C-150.5',
    where: 'src/action-replies/index.mjs aroseFromLink > is-arose-response',
    translation: words('refusal.AROSE_FROM_NOT_A_RESPONSE'),
  },
  /* R2: the same link is recorded once; a link is never edited. */
  AROSE_FROM_LINKED: {
    check: 'C-150.6',
    where: 'src/action-replies/index.mjs aroseFromLink > is-arose-linked',
    translation: words('refusal.AROSE_FROM_LINKED'),
  },
  /* R2 (J1 (d)): what arose is a project, or a plan's matter, named in the form each takes. */
  AROSE_FROM_REFUSED: {
    check: 'C-150.7',
    where: 'src/action-replies/index.mjs #arising > is-arising-shape',
    translation: 'What arose from the response is named as a project, or as a plan with one of its matters, each by '
      + 'its id. This request named neither in that form, so nothing was linked.',
  },
};
