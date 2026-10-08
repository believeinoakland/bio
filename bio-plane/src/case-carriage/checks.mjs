/* case-carriage's own words (requirements: `build/requirements/case-carriage.md` R9–R11). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation; each row's `where` names its one site in this module.
 * Its family is C-141 (T37; N757, DEC-180), new at T37-34; the rows await promotion's stamp (plan T37, rule 6 item 2).
 *
 * Beside the rows: `OBSCURED_LABEL`, the one sentence a published case shows beside a photo it carries as its obscured
 * copy (DEC-180 (4)), held once here for translation (DEC-179: protected, it says who can see something).
 *
 * Every sentence speaks in DEC-149's voice ("your group's Civicsmith"), names no place (R7) and carries no figure. */

const at = (fn, region) => `src/case-carriage/index.mjs ${fn} > ${region}`;
const row = (check, where, translation) => Object.freeze({ check, where, translation });

/** R11 (DEC-180 (4); DEC-179): the label a published case shows beside an obscured copy. Protected words. */
export const OBSCURED_LABEL = "Faces and plates obscured for publication; the group holds the original";

/* ===========================================================================
   C-141 — MARKING A PHOTO FOR PUBLICATION (N757; DEC-180 (2)–(5), K2108, K2206). Inside the group every photo stays as
   taken; a refusal says the mark was not recorded and what a member can do instead.
   =========================================================================== */
export const CASE_CARRIAGE_CHECKS = Object.freeze({
  /* R9 (DEC-180, its design detail): only a member marks; an assistant's proposal of areas is Bob's. */
  MACHINE_CANNOT_MARK: row("C-141.1", at("obscureMark", "is-member-marking"),
    "Only a member can mark what to obscure in a photo. Nothing was recorded."),
  /* R9, R10: the capture is not held, or the asker may not see it: one answer. */
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
});
