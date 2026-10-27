/* case-account's words in a case document's body (requirements: `build/requirements/case-account.md`, R7): the
 * reviewers' comments the publisher chose, moved from `case-authoring/document.mjs` unchanged (K624; N839).
 * `case-authoring`'s document imports it and keeps no copy (K1333's renderer rule), so the signed bytes are unchanged:
 * the left-out count and the two placeholders are read from their frozen rows (R17), which spell exactly the bytes every
 * earlier edition was signed with. */

import { word, localize } from "../setup-words/index.mjs";

/** R7 (D61): the review comments the publisher chose to carry, in words a reader reads: each with its reviewer and when,
 *  and how many were left out, or that the count is undetermined. No section when the reader was never asked and no
 *  comment is carried (`given` null). An objection is here only when the publisher chose it. */
export function reviewCommentBodyLines(given) {
  if (!given) return [];
  const comments = Array.isArray(given.comments) ? given.comments : [];
  const left = given.left_out;
  return ["## What Reviewers Said", "",
    ...(comments.length
      ? [word("case-account.document.publisher_chose_carry"), "",
         ...comments.map((c) => localize("case-account.document.v1_on_v2_replace", "- {v1}, on {v2}: {replace}", { v1: String(c.reviewer ?? word("case-account.document.reviewer.unknown")), v2: String(c.at ?? word("case-account.document.date.unknown")), replace: String(String(c.text ?? "")
           .replace(/[\r\n]+/g, " ")) })), ""]
      : [word("case-account.document.publisher_carried_comment"), ""]),
    Number.isInteger(left)
      ? (left === 1 ? word("case-account.document.left_out.one") : word("case-account.document.left_out.other", { n: String(left) }))
      : word("case-account.document.how_many_comments"),
    ""];
}
