/* filing-templates — the closed set of blanks every template and filing uses (requirements:
 * `build/requirements/filing-templates.md`, R19; K922 (1)).
 *
 * `FILING_BLANKS` and `FILING_TEXT_MAX` were copied unchanged from `filings` (`bio-plane/src/filings/index.mjs`:75, :97,
 * its R3 and R6, at T21), with their comments; `filings`' T21 job deleted its copies and reads them here (K624 (1)).
 * `blanksOf` is new. R31 (T47) adds four blanks a member fills, after the fifteen moved, which are unchanged. */

/** R19 (was filings' R3): the blanks a filing fills, a closed set; a template's `{{name}}` outside it is left unfilled
 *  and says so. Each blank's name and the sentence saying what fills it. */
import { word } from "../setup-words/index.mjs";

export const FILING_BLANKS = Object.freeze({
  counterparty_role: word("filing-templates.counterparty_role"),
  counterparty_body: word("filing-templates.counterparty_body"),
  counterparty_organisation: word("filing-templates.counterparty_organisation"),
  counterparty_description: word("filing-templates.counterparty_description"),
  act: word("filing-templates.act.government_did_action"),
  act_date: word("filing-templates.act_date"),
  standards: word("filing-templates.standards"),
  findings: word("filing-templates.findings"),
  governing_laws: word("filing-templates.governing_laws"),
  law: word("filing-templates.law"),
  clock: word("filing-templates.clock.action_clock_entries"),
  venue: word("filing-templates.venue"),
  venue_how: word("filing-templates.venue_how"),
  group: word("filing-templates.group"),
  date: word("filing-templates.date"),
  /* R31 (T47; DEC-209 (3), K3120): four member-filled blanks, filled by `filings` R55's `fills`, never by the record */
  records: word("filing-templates.records"),
  period: word("filing-templates.period"),
  form: word("filing-templates.form"),
  cost_limit: word("filing-templates.cost_limit"),
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
