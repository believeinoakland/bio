/* record-core's own refusal rows (requirements: `build/requirements/record-core.md`). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation.
 *
 * `MINT_EXHAUSTED` is new with R62 (N322, N250, K275, K392): it names one condition, no free opaque id could be drawn
 * (`mintOpaqueId` answered null, R9), which promotion, case-authoring, review, tasks and sources each reach; record-core,
 * the earliest of them in the order and the owner of the minter, provides the one helper (`mintExhausted`) and holds the
 * one row. It takes the next free number of C-59, the id-allocation family C-59.5 belongs to (K107 (3); K174: a module
 * holds its new rows), and review's C-87.12 translation, unchanged; C-87.12 retired into it in T13 (K434), stamped 1.44.0.
 *
 * T18 (RECORD-CORE #10): C-59.5 `ALLOCID_PREFIX_GATED` and C-102.1–.3 (the audit check's registration and failure) were
 * COPIED here from the catalogue's `PROJECT_ID_CHECKS` and `REGISTRATION_CHECKS`, rows and translations unchanged; the
 * catalogue's duplicates were removed in T19 (K783, stamped 1.49.0) and the catalogue itself deleted at T19's close
 * (K855). C-75, the set form's five rows, MOVED here whole as `PER_ITEM_CHECKS` (its family name kept for the guard's and
 * `dec49Row`'s suffix harvest), the catalogue's copy deleted in the same job (K586 BOB-1: record-core was its one
 * importer). C-102.15–.18 are new: the grammar seam's two registration refusals (§1b) and the statistics source's two
 * (R64's source, K621), each met only by the instance's own build, as C-102.1, .2, .13 and .14 are.
 *
 * T19 (RECORD-CORE #11): C-102.19–.20 are new, the mint seed's two registration refusals (R70), on the same terms.
 * C-102.15's and .16's meaning follows R67 as K766 words it (a registration may claim several whole slots, a slot
 * several registrations); their sentences already say so. */

const at = (fn, region) => `src/record-core/index.mjs ${fn} > ${region}`;
const BUILD_FAULT = 'This is a fault in how the instance was built, not in the record, and nothing in the record changed.';

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
  /* Copied from the catalogue's PROJECT_ID_CHECKS (REC-151, Membership v2 §7, "A MINTED ID CARRIES NO COUNT"). */
  ALLOCID_PREFIX_GATED: Object.freeze({
    check: 'C-59.5', where: at("allocIdOp", "is-allocid-prefix-gated"),
    translation: 'Ids of this kind are given by the record when the thing itself is created, and are not '
      + 'handed out in advance. Create the project, case, draft, grant or task through its own action and '
      + 'the record will answer with its id. Nothing was allocated.',
  }),
  /* Copied from the catalogue's REGISTRATION_CHECKS (K31; N94). */
  AUDIT_CHECK_DECLARED: Object.freeze({
    check: 'C-102.1', where: at("registerAuditCheck", "is-audit-check-registration"),
    translation: 'A part of this instance tried to register its audit check a second time. Each part '
      + 'registers once, when it starts, so the second was refused and the first still runs. ' + BUILD_FAULT,
  }),
  AUDIT_CHECK_MALFORMED: Object.freeze({
    check: 'C-102.2', where: at("registerAuditCheck", "is-audit-check-registration"),
    translation: 'A part of this instance tried to register an audit check without naming itself or without '
      + 'a check to run, so nothing was registered. ' + BUILD_FAULT,
  }),
  AUDIT_CHECK_FAILED: Object.freeze({
    check: 'C-102.3', where: at("auditPass", "is-audit-check-failed"),
    translation: 'One of the checks the audit runs over this document stopped with an error instead of '
      + 'answering, so the document is counted as having an error rather than as clean. The error is in the '
      + 'check and says nothing yet about the document. The audit changes nothing in the record.',
  }),
  /* New (§1b): a type grammar registered for record-grammar's `checkBundle` (its R39). */
  GRAMMAR_DECLARED: Object.freeze({
    check: 'C-102.15', where: at("registerGrammar", "is-grammar-registration"),
    translation: 'A part of this instance tried to register a document grammar a second time, or to claim a check '
      + 'another part\'s grammar already claims, so the second registration was refused and the first still stands. '
      + BUILD_FAULT,
  }),
  GRAMMAR_MALFORMED: Object.freeze({
    check: 'C-102.16', where: at("registerGrammar", "is-grammar-registration"),
    translation: 'A part of this instance tried to register a document grammar without naming itself, the checks it '
      + 'takes over or a function to run, or claimed only part of one of the record\'s own checks, so nothing was '
      + 'registered. ' + BUILD_FAULT,
  }),
  /* New (R64's source, K621): the one registered source of the instance's figures. */
  STATS_SOURCE_DECLARED: Object.freeze({
    check: 'C-102.17', where: at("registerStatsSource", "is-stats-source-registration"),
    translation: 'A part of this instance tried to supply the instance\'s figures when another part already supplies '
      + 'them, so the second was refused and the first still stands. ' + BUILD_FAULT,
  }),
  STATS_SOURCE_MALFORMED: Object.freeze({
    check: 'C-102.18', where: at("registerStatsSource", "is-stats-source-registration"),
    translation: 'A part of this instance tried to supply the instance\'s figures without naming itself or without a '
      + 'function to count them, so nothing was registered. ' + BUILD_FAULT,
  }),
  /* New (T24, R75, N503): a chosen opaque id recorded in the ledger inside its caller's transaction. Beside C-59.5 and
     C-59.6 in the id-allocation family; `awaiting stamp` for promotion's T24 layer-2 stamp. */
  OPAQUE_ID_MALFORMED: Object.freeze({
    check: 'C-59.7', where: at("recordOpaqueId", "is-opaque-id-refused"),
    translation: 'A part of this instance tried to reserve an identifier without giving one, so nothing was reserved. '
      + BUILD_FAULT,
  }),
  OPAQUE_ID_SPENT: Object.freeze({
    check: 'C-59.8', where: at("recordOpaqueId", "is-opaque-id-refused"),
    translation: 'That identifier has already been used, so it was not given out again and nothing was saved. An '
      + 'identifier names one thing only, even after what it named is gone. Trying again gives the thing a new one; if it '
      + 'keeps happening, tell whoever runs this instance.',
  }),
  OPAQUE_ID_NO_TRANSACTION: Object.freeze({
    check: 'C-59.9', where: at("recordOpaqueId", "is-opaque-id-refused"),
    translation: 'A part of this instance tried to reserve an identifier outside the change that would use it, so nothing '
      + 'was reserved: a reservation is kept only with the change it belongs to. ' + BUILD_FAULT,
  }),
  /* New (T19, R70; `build/extraction/legacy-store.md` §4.2 (3)): a module's seed sources for the opaque-id ledger. */
  MINT_SEED_DECLARED: Object.freeze({
    check: 'C-102.19', where: at("registerMintSeed", "is-mint-seed-registration"),
    translation: 'A part of this instance tried to name the identifiers it holds a second time, so the second was '
      + 'refused and the first still stands. ' + BUILD_FAULT,
  }),
  MINT_SEED_MALFORMED: Object.freeze({
    check: 'C-102.20', where: at("registerMintSeed", "is-mint-seed-registration"),
    translation: 'A part of this instance tried to name the identifiers it holds without naming itself, or named a '
      + 'place to read them that is not a table and a column, so nothing was registered. ' + BUILD_FAULT,
  }),
});

/* D-126 / C-75 — THE PER-ITEM WEIGHT (NOTIFICATIONS.md §Applying a handler to a selection), MOVED from the catalogue
 * (T18). Bob's requirement: *"select some (or all) to apply the action to. … If that action didn't work for one or
 * more, they'd stay in the list so that the user can take a different action."* The design's rule: each item
 * independently succeeds or is RETAINED WITH A REASON, and the reason is the act's OWN refusal for that item. So this
 * family words only what belongs to the SET (R50, R52, R55):
 *   C-75.1 — no items: `items` is absent from the set form, not an array, or empty.
 *   C-75.2 — too many items: over `PER_ITEM_MAX`, refused WHOLE before any item is tried.
 *   C-75.3 — one item is not an object; THAT item is retained and the others are still tried.
 *   C-75.4 — one item's act failed without a refusal (it threw); THAT item is retained and says so.
 *   C-75.5 — the summary: at least one item was retained. Carried beside `items[]`, never instead of it. */
export const PER_ITEM_CHECKS = Object.freeze({
  SET_NO_ITEMS: Object.freeze({
    check: 'C-75.1', where: at("perItem", "is-per-item-set-shape"),
    translation: 'Nothing was selected, so nothing was done. Choose at least one item and try again.',
  }),
  SET_TOO_LARGE: Object.freeze({
    check: 'C-75.2', where: at("perItem", "is-per-item-set-shape"),
    translation: 'That selection is larger than the record acts on at once, so nothing was done to any of '
      + 'it. Select fewer items and apply the action again.',
  }),
  SET_ITEM_MALFORMED: Object.freeze({
    check: 'C-75.3', where: at("perItem", "is-per-item-malformed"),
    translation: 'This item could not be read as an item, so it was left as it was. The rest of the '
      + 'selection was still acted on, one by one.',
  }),
  SET_ITEM_FAILED: Object.freeze({
    check: 'C-75.4', where: at("perItem", "is-per-item-failed"),
    translation: 'The record could not complete the action on this item and did not change it. It stays '
      + 'in your list. The rest of the selection was still acted on, one by one.',
  }),
  SET_ITEMS_RETAINED: Object.freeze({
    check: 'C-75.5', where: at("perItem", "is-per-item-retained"),
    translation: 'Not every selected item was handled. The ones that were have left your list; the ones that '
      + 'were not are still there, each with the reason the record gave for it, so you can take a '
      + 'different action on them.',
  }),
});
