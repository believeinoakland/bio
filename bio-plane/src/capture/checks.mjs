/* capture's own refusal rows (requirements: `build/requirements/capture.md`). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act is
 * reached.
 *
 * The rest of this module's rows are still in the check catalogue (C-48, C-83, C-85, C-28.13), until those checks move
 * here. The row below is new with R63 (N285, K275, K343): "no evidence object is held under a digest" is one condition,
 * minted at one site, `evidenceAbsent` (`src/capture/ops.mjs`), which this module's R21 get and extraction's R31 answer
 * through. The evidence store had no family in the catalogue, so it takes the next free family number, C-118
 * (K107 (3)'s rule: the job names a new code's row; K174: a module holds its new rows).
 *
 * NO_SUCH_KNOCK is new with K383: the inbox answered an unknown knock id with the bare `NOT_FOUND`, a different condition
 * under R63's code (K275); R32 words it as its own code, with the next row of C-118, minted at one site, `#noSuchKnock`
 * (`src/capture/index.mjs`), which the inbox's read and resolve both answer through.
 *
 * C-118.1's code was `NOT_FOUND` until N347 (K440): a generic word any module could mint, so the door could not read
 * this table without lending the row to them. It is `EVIDENCE_NOT_HELD` (R63's own words); the row keeps its number and
 * its translation.
 *
 * C-118.3–C-118.6 are new with N364 (K509): the knocker's secret (R66), bringing a knock in (R65), and the capturing
 * member's signed account (R69), each minted at the one site its `where` names. */

const at = (fn, region) => `src/capture/ops.mjs ${fn} > ${region}`;
const inIndex = (fn, region) => `src/capture/index.mjs ${fn} > ${region}`;

export const CAPTURE_CHECKS = Object.freeze({
  EVIDENCE_NOT_HELD: Object.freeze({
    check: 'C-118.1', where: at("evidenceAbsent", "is-evidence-held"),
    translation: 'The record holds no stored copy of a document under this fingerprint.',
  }),
  NO_SUCH_KNOCK: Object.freeze({
    check: 'C-118.2', where: inIndex("#noSuchKnock", "is-knock-held"),
    translation: 'No knock in the inbox answers to this id. Nothing was changed.',
  }),
  KNOCKER_SECRET_WEAK: Object.freeze({
    check: 'C-118.3', where: "src/capture/doorbell.mjs knockerSecretWeak > is-knocker-secret-strong",
    translation: 'A knocker secret this short could be guessed, letting someone else continue your pseudonym. Use a '
               + 'longer one, or ask the doorbell to make one. Nothing was received.',
  }),
  KNOCK_DISCARDED: Object.freeze({
    check: 'C-118.4', where: inIndex("pullKnock", "is-knock-pullable"),
    translation: 'This knock was set aside. Move it back to new before bringing it in. Nothing was written.',
  }),
  NOT_THE_CAPTURING_ACTOR: Object.freeze({
    check: 'C-118.5', where: inIndex("recordCaptureAccount", "is-capturing-actor"),
    translation: 'An account of how a document was captured is added only by the member who captured it, and that is '
               + 'not you, or no member captured it. Nothing was written.',
  }),
  ACCOUNT_NO_TEXT: Object.freeze({
    check: 'C-118.6', where: inIndex("recordCaptureAccount", "is-account-worded"),
    translation: 'An account of how you captured a document says what happened in your own words, and this one is '
               + 'empty. Write it. Nothing was written.',
  }),
});
