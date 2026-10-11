/* case-account's words in a case document's body (requirements: `build/requirements/case-account.md`, R7): the
 * reviewers' comments the publisher chose, moved from `case-authoring/document.mjs` unchanged (K624; N839).
 * `case-authoring`'s document imports it and keeps no copy (K1333's renderer rule), so the signed bytes are unchanged. */

/** R7 (D61): the review comments the publisher chose to carry, in words a reader reads: each with its reviewer and when,
 *  and how many were left out, or that the count is undetermined. No section when the reader was never asked and no
 *  comment is carried (`given` null). An objection is here only when the publisher chose it. */
export function reviewCommentBodyLines(given) {
  if (!given) return [];
  const comments = Array.isArray(given.comments) ? given.comments : [];
  const left = given.left_out;
  return ["## What Reviewers Said", "",
    ...(comments.length
      ? ["The publisher chose to carry these comments from the case's review copies, in the reviewers' own words:", "",
         ...comments.map((c) => `- ${c.reviewer ?? "(a reviewer)"}, on ${c.at ?? "(an unrecorded date)"}: ${String(c.text ?? "")
           .replace(/[\r\n]+/g, " ")}`), ""]
      : ["The publisher carried no comment from the case's review copies.", ""]),
    Number.isInteger(left)
      ? `${left} comment${left === 1 ? " was" : "s were"} left out. A reviewer left out may file a response in the case's docket.`
      : "How many comments were left out is undetermined: the review copies' comments could not all be read here.",
    ""];
}
