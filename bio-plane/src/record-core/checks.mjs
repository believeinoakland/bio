/* record-core's own refusal rows (requirements: `build/requirements/record-core.md`, R62). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation.
 *
 * The rest of this module's rows are still in the check catalogue (C-59.5 `ALLOCID_PREFIX_GATED`, C-75 `PER_ITEM_CHECKS`)
 * until they move here. The row below is new with R62 (N322, N250, K275, K392): `MINT_EXHAUSTED` names one condition, no
 * free opaque id could be drawn (`mintOpaqueId` answered null, R9), which promotion, case-authoring, review and queue each
 * reach; record-core, the earliest of them in the order and the owner of the minter, provides the one helper
 * (`mintExhausted`) and holds the one row. It takes the next free number of C-59, the id-allocation family C-59.5 belongs
 * to (K107 (3); K174: a module holds its new rows), and review's C-87.12 translation, unchanged; C-87.12 retires into it
 * in review's job. */

const at = (fn, region) => `src/record-core/index.mjs ${fn} > ${region}`;

export const RECORD_CORE_CHECKS = Object.freeze({
  MINT_EXHAUSTED: Object.freeze({
    check: 'C-59.6', where: at("mintExhausted", "is-mint-exhausted"),
    translation: 'The plane could not find a free identifier for this, so nothing was saved and nothing was '
      + 'issued. Identifiers are drawn at random so that none of them says how many others exist, and every '
      + 'one it tried was already taken. Trying again may succeed; if it keeps happening, tell whoever runs '
      + 'this instance.',
  }),
  COUNTS_DECLARED: Object.freeze({
    check: 'C-102.13', where: at("registerCounts", "is-counts-registration"),
    translation: 'A part of this instance tried to report a figure another part already reports, or to register its '
      + 'figures twice, so the second registration was refused and the first still stands. This is a fault in how the '
      + 'instance was built, not in the record, and nothing in the record changed.',
  }),
  COUNTS_MALFORMED: Object.freeze({
    check: 'C-102.14', where: at("registerCounts", "is-counts-registration"),
    translation: 'A part of this instance tried to register its figures without naming itself, the figures or a '
      + 'function to count them, so nothing was registered. This is a fault in how the instance was built, not in the '
      + 'record, and nothing in the record changed.',
  }),
});
