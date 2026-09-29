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
 * (`src/capture/index.mjs`), which the inbox's read and resolve both answer through. */

const at = (fn, region) => `src/capture/ops.mjs ${fn} > ${region}`;
const inIndex = (fn, region) => `src/capture/index.mjs ${fn} > ${region}`;

export const CAPTURE_CHECKS = Object.freeze({
  NOT_FOUND: Object.freeze({
    check: 'C-118.1', where: at("evidenceAbsent", "is-evidence-held"),
    translation: 'The record holds no stored copy of a document under this fingerprint.',
  }),
  NO_SUCH_KNOCK: Object.freeze({
    check: 'C-118.2', where: inIndex("#noSuchKnock", "is-knock-held"),
    translation: 'No knock in the inbox answers to this id. Nothing was changed.',
  }),
});
