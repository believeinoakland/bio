/* case-grammar — the project reference a case carries (requirements: `build/requirements/case-grammar.md` R10, with R1's
 * `/5` and R6; DEC-111, `network-notices` R19; K1114, K1115, K1119). A case document may carry `working_on`, the id of
 * the network notice its project is working under, and nothing else about the notice, so a case and its notice are
 * visibly the same work. It is an optional field of `bio-case-document/5`, with no new format version: a `/5` document
 * without it names no notice.
 *
 * ONE WRITER, ONE READING, in R8's form: `case-authoring` writes the line with `workingOnLines` (its R41, as
 * `network-notices.noticeReferenceOf` answers), and `workingOnOf` is the one reading of it, so no module parses it a
 * second way. `isNoticeReference` is the shape: `ratification` refuses a case document whose `working_on` is present
 * and not one (its R38, under the case-document catalogue); this module refuses nothing. The writer writes what it is
 * handed, folded onto one line but never trimmed or corrected, so a malformed value reaches that refusal as it was
 * handed and is never made well-formed here. Pure; nothing here throws. */

import { caseDocumentRequiresTensionSection } from "./formats.mjs";

/** R10: the front-matter key. */
export const WORKING_ON_KEY = "working_on";
/** R10: a notice id is record-core R6's opaque-id shape (as `signatures` R38 states it, K1115): any upper-case prefix,
 *  a four-digit year, a four-digit number, and an optional lower-case tail of hyphen-joined words. */
export const NOTICE_REFERENCE_PATTERN = /^[A-Z]+-\d{4}-\d{4}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/;

/** R10 (K1119): whether a value is a notice reference: a string of record-core R6's opaque-id shape, exactly. Pure;
 *  never throws. */
export function isNoticeReference(value) {
  return typeof value === "string" && NOTICE_REFERENCE_PATTERN.test(value);
}

/** R10: the `working_on:` line, from the notice id; no line when there is none (`null` or `undefined`), so a case
 *  whose project has no notice names none. Any other value is written as handed, quoted on one line (line breaks made a
 *  space, double quotes and backslashes made apostrophes, never trimmed), for `ratification` R38 to refuse. */
export function workingOnLines(notice) {
  if (notice === null || notice === undefined) return [];
  return [`${WORKING_ON_KEY}: "${String(notice).replace(/\r\n|\r|\n/g, " ").replace(/["\\]/g, "'")}"`];
}

/** R10: the notice a `/5` document names as its project reference, read back from its front matter: the id when
 *  `working_on` is a notice reference; null when it carries none, so it names no notice, and for any other format. A
 *  value present and not a notice reference names no notice either (`ratification` R38 refuses such a document before
 *  it is written). Pure; never throws. */
export function workingOnOf(fm) {
  try {
    if (!caseDocumentRequiresTensionSection(fm)) return null;
    const v = fm[WORKING_ON_KEY];
    return isNoticeReference(v) ? v : null;
  } catch {
    return null;
  }
}
