/* case-carriage's own words (requirements: `build/requirements/case-carriage.md` R9–R11, R14, R15). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation; each row's `where` names its one site in this module.
 * Its family is C-141 (T37; N757, DEC-180), new at T37-34 and stamped at 1.65.0 (T38-6). (T38; N790, K2238) Its machine
 * refusal is its own code, `MACHINE_CANNOT_MARK_PHOTO`, never sources' `MACHINE_CANNOT_MARK` (C-121.7), which the composed
 * catalogue keeps for the earlier family. (T38; N788, R14) C-141.7–C-141.10 are the withdrawal's, numbered here and
 * awaiting promotion's stamp. (T40; DEC-187 (3), N811) Their words are `words.json`'s `photo.withdraw.refused.*`, read by
 * key, replacing BOB's drafts.
 *
 * (T39; N806, R15) C-141.11 DOCUMENT_COPY_NO_STORE is copyBatch's, numbered here and awaiting promotion's stamp; its
 * words are BOB's draft.
 *
 * Beside the rows: `COPY_CLEANED_LABEL` (R15), and (T40; DEC-185 (1), DEC-187 (2), N798) `OBSCURED_LABEL` and
 * `PUBLISHED_LABEL`, the sentences a published case shows beside a photo it carries as its copy, with an area covered or
 * none, each held once here for translation (DEC-179: protected, it says who can see something) and read by key.
 *
 * Every sentence of this module's own names no place (R7) and carries no figure; those of C-141.1–.6 and .11 speak in
 * DEC-149's voice ("your group's Civicsmith"), and the words read by key are the design stream's. */

const at = (fn, region) => `src/case-carriage/index.mjs ${fn} > ${region}`;
const row = (check, where, translation) => Object.freeze({ check, where, translation });

/* R11, R14, R15 (T40; DEC-185 (1), DEC-187 (2), (3); DEC-188 (7); N798, N811): the words of `words.json`
   (`docs/development/ux-substrate/screens/words.json`) this module holds, each `en` verbatim, read by key; the design
   stream re-words them under their keys. Placeholders (`{photo}`, `{member}`, `{date}`) are left for the screen: the
   refusal answering one carries the fill beside it (`photo`, `member`, `date`). A key the words file lacks, or a
   sentence that is not its `en`, fails this module's test. */
export const CASE_CARRIAGE_WORDS = Object.freeze({
  'photo.obscured.label': 'Faces, plates and camera details removed for publication; the group holds the original',
  'photo.published.label': 'Camera details removed for publication; the group holds the original',
  'photo.withdraw.refused.machine': 'Only a member can withdraw a mark; the machine never can.',
  'photo.withdraw.refused.nomark': 'There is no such mark on {photo}. Open the photo again to see the marks that stand.',
  'photo.withdraw.refused.already': '{member} already withdrew this mark on {date}.',
  'photo.withdraw.refused.noreason': 'Say why you are withdrawing this mark. Your reason is kept beside it.',
  'document.cleaned.label': 'Details of who made this file, and of its pictures, removed for publication; the group holds the original',
});

/** R11 (DEC-180 (4); T40: DEC-185 (1), DEC-187 (2)): the label a published case shows beside a photo's copy with a
 *  covered area, `photo.obscured.label`, read by key. Protected words. */
export const OBSCURED_LABEL = CASE_CARRIAGE_WORDS['photo.obscured.label'];

/** R11 (T40; K2248): the label beside a photo's copy with nothing covered, `photo.published.label`, read by key.
 *  Protected words. */
export const PUBLISHED_LABEL = CASE_CARRIAGE_WORDS['photo.published.label'];

/** R15 (T39; N806, K2333): the label a published case shows beside a member document it carries as its cleaned copy,
 *  mirroring OBSCURED_LABEL; the design stream holds it under `document.cleaned.label` (DEC-188), read by key. Protected
 *  words. */
export const COPY_CLEANED_LABEL = CASE_CARRIAGE_WORDS['document.cleaned.label'];

/* ===========================================================================
   C-141 — MARKING A PHOTO FOR PUBLICATION (N757; DEC-180 (2)–(5), K2108, K2206). Inside the group every photo stays as
   taken; a refusal says the mark was not recorded and what a member can do instead.
   =========================================================================== */
export const CASE_CARRIAGE_CHECKS = Object.freeze({
  /* R9 (DEC-180, its design detail; N790): only a member marks; an assistant's proposal of areas is Bob's. */
  MACHINE_CANNOT_MARK_PHOTO: row("C-141.1", at("obscureMark", "is-member-marking"),
    "Only a member can mark what to obscure in a photo. Nothing was recorded."),
  /* R9, R10, R14: the capture is not held, or the asker may not see it: one answer. */
  NO_SUCH_PHOTO: row("C-141.2", at("#photo", "is-photo-seen"),
    "Your group's Civicsmith holds no photo you can see under that digest. Nothing was recorded."),
  /* R9: the capture is not an image. */
  NOT_A_PHOTO: row("C-141.3", at("#photo", "is-photo"),
    "That capture is not a photo, so there is nothing in it to obscure. Nothing was recorded."),
  /* R9: an area is not a rectangle with a kind, or there are too many. */
  MARK_MALFORMED: row("C-141.4", at("obscureMark", "is-mark-well-formed"),
    "An area of this mark is not a rectangle of the photo with a kind (a person, a number plate or a staff member). "
      + "The area is named. Nothing was recorded."),
  /* R9 (DEC-180 (5)): city staff at work are part of what a case is about. */
  STAFF_MARK_NO_REASON: row("C-141.5", at("obscureMark", "is-staff-mark-reasoned"),
    "City staff at work are part of what a case is about, so a staff member is obscured only with a reason. "
      + "Give the reason for the area named. Nothing was recorded."),
  /* R9: image-cover's AREA_OUTSIDE, relayed with its detail. */
  AREA_OUTSIDE: row("C-141.6", at("obscureMark", "is-area-inside"),
    "An area of this mark lies wholly outside the photo. Mark it again on the photo. Nothing was recorded."),
  /* R14 (DEC-183 (2); T40: DEC-187 (3)): only a member withdraws a mark. `photo.withdraw.refused.machine`, by key. */
  MACHINE_CANNOT_WITHDRAW_MARK: row("C-141.7", at("obscureMarkWithdraw", "is-member-withdrawing"),
    CASE_CARRIAGE_WORDS['photo.withdraw.refused.machine']),
  /* R14: the mark named is not a mark on that photo. `photo.withdraw.refused.nomark`, by key; `{photo}` the photo named. */
  NO_SUCH_MARK: row("C-141.8", at("obscureMarkWithdraw", "is-mark-on-photo"),
    CASE_CARRIAGE_WORDS['photo.withdraw.refused.nomark']),
  /* R14: a mark is withdrawn once; the answer names when and by whom. `photo.withdraw.refused.already`, by key;
     `{member}` and `{date}` who withdrew it and when. */
  MARK_ALREADY_WITHDRAWN: row("C-141.9", at("obscureMarkWithdraw", "is-mark-standing"),
    CASE_CARRIAGE_WORDS['photo.withdraw.refused.already']),
  /* R14: a withdrawal says why. `photo.withdraw.refused.noreason`, by key. */
  WITHDRAW_NO_REASON: row("C-141.10", at("obscureMarkWithdraw", "is-withdrawal-reasoned"),
    CASE_CARRIAGE_WORDS['photo.withdraw.refused.noreason']),
  /* R15 (T39; N806, K2333): copyBatch with no evidence store to read a member's document from or hold its copy in. */
  DOCUMENT_COPY_NO_STORE: row("C-141.11", at("copyBatch", "is-store-bound"),
    "Your group's Civicsmith has no evidence store to make a document's publication copy from. Nothing was made."),
});
