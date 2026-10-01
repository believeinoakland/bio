/* filing-templates — the closed set of blanks every template and filing uses (requirements:
 * `build/requirements/filing-templates.md`, R19; K922 (1)).
 *
 * `FILING_BLANKS` and `FILING_TEXT_MAX` are copied unchanged from `filings` (`bio-plane/src/filings/index.mjs`:75, :97,
 * its R3 and R6), with their comments; `filings`' own job, after this one, deletes its copies and reads them here
 * (K624 (1)). `blanksOf` is new. */

/** R19 (was filings' R3): the blanks a filing fills, a closed set; a template's `{{name}}` outside it is left unfilled
 *  and says so. Each blank's name and the sentence saying what fills it. */
export const FILING_BLANKS = Object.freeze({
  counterparty_role: "the official role of the office the action is addressed to (the action's counterparty)",
  counterparty_body: "the body of that office (an office's arm only)",
  counterparty_organisation: "the organisation of a reporter, an organisation or another group the action is addressed to",
  counterparty_description: "the audience the action is addressed to, as the action describes it",
  act: "what the government did, as the action's determination states it",
  act_date: "when it did it (a date, or a period from and to)",
  standards: "the citations of the standards the determination names",
  findings: "each finding the determination rests on, with its published case edition",
  governing_laws: "the governing laws a member stated for the action",
  law: "the law a records request is made under, as the action states it",
  clock: "the action's clock entries, each with its basis",
  venue: "where the kind is filed (the profile's venue name)",
  venue_how: "by what means it is filed (the profile's venue means)",
  group: "the producing group",
  date: "the date the draft was prepared",
});
/** R19 (was filings' R6): the longest text, in UTF-8 bytes. */
export const FILING_TEXT_MAX = 65536;
/** A blank as a text writes it: `{{name}}`, spaces allowed inside the braces (filings' pattern, unchanged). */
export const BLANK_RE = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;

/** R19: the blank names `text` holds, in order of first appearance, and the first of them outside `FILING_BLANKS`, or
 *  null. A text that is not a string holds none. Never throws. */
export function blanksOf(text) {
  const names = typeof text === "string" ? [...new Set([...text.matchAll(BLANK_RE)].map((m) => m[1]))] : [];
  return { blanks: names, unknown: names.find((n) => !Object.prototype.hasOwnProperty.call(FILING_BLANKS, n)) ?? null };
}
