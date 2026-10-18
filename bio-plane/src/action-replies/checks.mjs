/* action-replies — its catalogue rows (requirements: `build/requirements/action-replies.md`, R1, R2, R7, R9; family C-150,
 * reserved for this module, K2794). `NO_SUCH_PROJECT` is membership's row (its R78), answered through
 * `membership.noSuchProject`; `BEARING_REFUSED`'s findings are `action-grammar`'s (`bearingFindings`, its R24, C-2.10),
 * carried on this module's row, its one minting site (K231, K2845). */

import { word } from "../setup-words/index.mjs";

/* R7 (T46; DEC-194, N913; T50 N1116): each row's sentence is read by key through setup-words' `word` from `words.json`
   (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are; a row never holds a copy of
   its sentence. `BEARING_REFUSED` keeps its `{item}` for the screen (R9): the row carries the sentence unfilled, and the
   refusal fills it (`#bearingShape`). */

export const ACTION_REPLY_CHECKS = {
  /* R1, R4 (v0.2 rule 1): laying out a reply claim by claim is a member's act; a machine may only propose one. */
  MACHINE_CANNOT_RECORD_BEARING: {
    check: 'C-150.1',
    where: 'src/action-replies/index.mjs actionReplyBearing > is-machine-bearing',
    translation: word('refusal.MACHINE_CANNOT_RECORD_BEARING'),
  },
  /* R1: only a reply received to a request for comment is laid out claim by claim. */
  BEARING_NOT_RFC: {
    check: 'C-150.2',
    where: 'src/action-replies/index.mjs #bearingTarget > is-bearing-rfc',
    translation: word('refusal.BEARING_NOT_RFC'),
  },
  /* R1 (action-grammar R24): each claim is one the request put, once, with one of the three bearings. R9 (T47; DEC-199):
     the row holds the sentence with `{item}` for the screen; the refusal answers it filled with the item named. */
  BEARING_REFUSED: {
    check: 'C-150.3',
    where: 'src/action-replies/index.mjs #bearingShape > is-bearing-shape',
    translation: word('refusal.BEARING_REFUSED', { item: '{item}' }),
  },
  /* R2, R4 (v0.2 rule 1): linking what arose from a response is a member's act. */
  MACHINE_CANNOT_LINK: {
    check: 'C-150.4',
    where: 'src/action-replies/index.mjs aroseFromLink > is-machine-link',
    translation: word('refusal.MACHINE_CANNOT_LINK'),
  },
  /* R2: a matter or project arises from a response, a reply the group received. */
  AROSE_FROM_NOT_A_RESPONSE: {
    check: 'C-150.5',
    where: 'src/action-replies/index.mjs aroseFromLink > is-arose-response',
    translation: word('refusal.AROSE_FROM_NOT_A_RESPONSE'),
  },
  /* R2: the same link is recorded once; a link is never edited. */
  AROSE_FROM_LINKED: {
    check: 'C-150.6',
    where: 'src/action-replies/index.mjs aroseFromLink > is-arose-linked',
    translation: word('refusal.AROSE_FROM_LINKED'),
  },
  /* R2 (J1 (d)): what arose is a project, or a plan's matter, named in the form each takes. */
  AROSE_FROM_REFUSED: {
    check: 'C-150.7',
    where: 'src/action-replies/index.mjs #arising > is-arising-shape',
    translation: word('refusal.AROSE_FROM_REFUSED'),
  },
  /* R10, R4 (T48; N880; Actions D13, H17): what a reply says about being quoted is a member's record. The translations of
     C-150.8 to .10 are read by key (`refusal.<CODE>`, DEC-232's words in `words.json`; T50 N1116). */
  MACHINE_CANNOT_RECORD_QUOTING: {
    check: 'C-150.8',
    where: 'src/action-replies/index.mjs actionReplyQuoting > is-machine-quoting',
    translation: word('refusal.MACHINE_CANNOT_RECORD_QUOTING'),
  },
  QUOTING_NOT_RFC: {
    check: 'C-150.9',
    where: 'src/action-replies/index.mjs #quotingTarget > is-quoting-rfc',
    translation: word('refusal.QUOTING_NOT_RFC'),
  },
  QUOTING_REFUSED: {
    check: 'C-150.10',
    where: 'src/action-replies/index.mjs #quotingShape > is-quoting-shape',
    translation: word('refusal.QUOTING_REFUSED'),
  },
};
