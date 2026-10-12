/* action-holds' own refusal rows (requirements: `build/requirements/action-holds.md`). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever
 * the act is reached.
 *
 * Family C-149, reserved for this module (K2794; its START, reconciliation R21). The moved hold rows (were `action-grammar`'s
 * C-117.17, .18, .20, .21, .23–.25, minted by `actions`) are renumbered here with their translations unchanged, each
 * `where` re-pointed to the region of this module's `index.mjs` that mints it; C-117.22 (`HOLD_NO_LEGAL_MARK`) is
 * retired with R2's old text and has no row here. The pressure mark's shape codes (`MACHINE_CANNOT_MARK_PRESSURE`,
 * `PRESSURE_REFUSED`, `PRESSURE_NOT_RECEIVED`, C-117.14–.16) stay `action-grammar`'s, since `actions`' `actionCorrespond`
 * mints them too; so do the capture-or-account codes (C-33.6–.9). The new rows' translations are BOB's drafts,
 * re-wordable by the UX stream. */

const at = (fn, region) => `src/action-holds/index.mjs ${fn} > ${region}`;

/* R15 (T46; DEC-194; N913): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) the C-149 rows
   R15 names translate by, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and
   extraction's `TRANSCRIBE_WORDS` are. The design stream's words: re-worded there, then re-taken here by key; a row never
   holds a copy of its sentence. `refusal.HOLD_NOT_IN_PLACE` and `refusal.HOLD_PLACE_REFUSED` are not taken in T46: each
   sentence says less than the requirement it answers (R14's release where no hold was placed; R2's entry and project
   places), so both rows keep their own until the sentence and the requirement agree (K2953). */
export const ACTION_HOLDS_WORDS = Object.freeze({
  "refusal.MACHINE_CANNOT_SEND": "Only a member records that the hold notice was sent. Nothing was written.",
});

export const ACTION_HOLDS_CHECKS = Object.freeze({
  /* R2 (K899 (7), DEC-61; N-A19): a litigation hold stated at a place, in place or released, with a reason. */
  MACHINE_CANNOT_SET_HOLD: Object.freeze({
    check: 'C-149.1', where: at("actionHold", "is-hold"),
    translation: 'Saying whether a litigation hold is in place is a member\'s judgement, and somebody answers for it. '
      + 'The credential that asked here is an automated one, so it cannot say. Sign in to record it yourself.',
  }),
  HOLD_REFUSED: Object.freeze({
    check: 'C-149.2', where: at("actionHold", "is-hold"),
    translation: 'A litigation hold is recorded as in place or released, with a reason of up to 500 characters and no '
      + 'quotation mark, backslash or line break. This one was not, so nothing was written.',
  }),
  /* R2, R5, R7 (DEC-113; K1251, K1252; N518): a hold's release is its own act, a hold names the projects it covers, and
     the "is this project held?" read names the projects it asks about. */
  HOLD_RELEASE_IS_ITS_OWN_ACT: Object.freeze({
    check: 'C-149.3', where: at("actionHold", "is-hold-release-own-act"),
    translation: 'Releasing a litigation hold is its own act, recorded with its own reason, so that a release is never '
      + 'a side effect of placing one. This asked to release a hold through the act that places one, so nothing was '
      + 'written. Use the release act.',
  }),
  HOLD_PROJECTS_REFUSED: Object.freeze({
    check: 'C-149.4', where: at("#holdProjects", "is-hold-projects"),
    translation: 'Projects are named as a list of their ids, at most fifty different ones, and asking whether projects '
      + 'are held names at least one. The list given was not of that form, so it was refused and nothing was written.',
  }),
  HOLD_ALREADY_RELEASED: Object.freeze({
    check: 'C-149.5', where: at("actionHold", "is-hold-already-released"),
    translation: 'That litigation hold is already released, and a release is stated once. Nothing was written. If the '
      + 'group is preserving again, place a new hold.',
  }),
  /* R1 (K597 (1)): a pressure mark on an entry already recorded. */
  PRESSURE_MARKED: Object.freeze({
    check: 'C-149.6', where: at("actionPressure", "is-pressure-marked"),
    translation: 'That entry is already marked as pressure, and a mark is never rewritten. Nothing was written.',
  }),
  PRESSURE_NO_ENTRY: Object.freeze({
    check: 'C-149.7', where: at("actionPressure", "is-pressure-entry"),
    translation: 'The entry is named by its position in the action\'s correspondence, counted from zero, and no entry '
      + 'stands at the position given. Nothing was written.',
  }),
  /* R2 (T45; Actions D10; v0.2 rule 12): a hold is placed at exactly one place, and its `from` stands at that place. */
  HOLD_PLACE_REFUSED: Object.freeze({
    check: 'C-149.8', where: at("#placeOf", "is-hold-place"),
    translation: 'A litigation hold is placed at one place: an action, one entry of an action named by its position, '
      + 'or a project. This named more than one, or an entry that is not there, so nothing was written.',
  }),
  HOLD_FROM_REFUSED: Object.freeze({
    check: 'C-149.9', where: at("#fromOf", "is-hold-from"),
    translation: 'A hold can say what prompted it: a pressure mark, a pressure record, a court docket entry marked as '
      + 'legal pressure, or a counsel matter. What this named is not one you can see at the place the hold is placed, '
      + 'so nothing was written.',
  }),
  /* R11 (v0.2 rules 10, 12): the hold notice, sent by a member's own hand; `HOLD_NOT_IN_PLACE` minted only by the exported
     `holdNotInPlace`, which `filings` R47 calls too (K2848), and which R14's release where no hold was placed answers
     through. R15 (T46): `MACHINE_CANNOT_SEND` reads `words.json` by key; `HOLD_NOT_IN_PLACE` keeps its own (K2953). */
  MACHINE_CANNOT_SEND: Object.freeze({
    check: 'C-149.10', where: at("holdNoticeSent", "is-machine-send"),
    translation: ACTION_HOLDS_WORDS["refusal.MACHINE_CANNOT_SEND"],
  }),
  HOLD_NOT_IN_PLACE: Object.freeze({
    check: 'C-149.11', where: at("holdNotInPlace", "is-hold-not-in-place"),
    translation: 'A hold notice is recorded for a hold that is in place, and the hold at this place is not: none has '
      + 'been placed, or it was released. Nothing was written.',
  }),
});
