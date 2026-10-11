/* case-grammar — the outcomes carried into an edition (requirements: `build/requirements/case-grammar.md` R29, with R14,
 * R23 and R6; T45: N855 (6c), Actions D5, D6c; `BIO_Action_v0_2.md` §3 "Success record" and §4 rule 17). A member's act
 * carries an outcome the group recorded (a success, a cure, a harm addressed) into the case's next edition
 * (`case-authoring` R71, called by `consequences`' carrying act); `case-authoring`'s `publishCase` writes every pending
 * one into this block with `outcomesLines`, and its body section with `outcomesSectionLines`, so the bytes are written
 * one way, and `outcomesOf` is the one reading of them, for the complete edition (R14) and every later reader.
 *
 * THE BLOCK (flat rows, K549), an optional block of the current format with no new version, as R22's `subject_entity`
 * is (l8 doubt 7): a document without it reads `[]`, and `outcomesLines` writes no line at all for none, so a document
 * carrying no outcome has exactly the bytes it had before T45.
 *   outcomes:  one row per outcome carried, in the order carried: `outcome` (the carried outcome's opaque id), `kind`
 *              (`success`, `cure` or `harm_addressed`), `text` (the member's statement, one line), `cites` (what it
 *              rests on, `case-account` R5's cite shape, R23's), `on` (the date the outcome occurred), `carried_by` and
 *              `carried_at` (who carried it, and when).
 *
 * NO ROW STATES A CAUSE (the plan's reconciliation R3): a success record's figures, sequence and cause stay on the record,
 * unpublished; this block has no field for them. ONE VALUE, EXACTLY: every value is written as R17's are
 * (`./facts.mjs`' `exact`), canonical JSON in one quoted value, so the text reads back byte for byte for the account
 * check (`case-account` R6). A value outside its words is written null, undetermined, never a guess. Pure; nothing here
 * throws. */

import { caseDocumentRequiresMaterials } from "./formats.mjs";
import { unexact, exactRowsBlock } from "./facts.mjs";
import { citesOf } from "./account.mjs";

/** R29: the fields of an `outcomes:` row, in the order they are written. */
export const OUTCOME_FIELDS = Object.freeze(["outcome", "kind", "text", "cites", "on", "carried_by", "carried_at"]);
/** R29: the kinds of outcome carried (Actions D6c; the plan's reconciliation R3). */
export const OUTCOME_KINDS = Object.freeze(["success", "cure", "harm_addressed"]);
/** R29: the body section's head, and each kind in words (keys `case.outcomes.head`, `case.outcome.*`: the UX stream's
 *  words; until it gives them, these). */
export const OUTCOMES_HEAD = "## Outcomes since the last edition";
export const OUTCOME_KIND_WORDS = Object.freeze({ success: "Success", cure: "Cure", harm_addressed: "Harm addressed" });

const objects = (xs) => (Array.isArray(xs) ? xs.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);
const str = (v) => (typeof v === "string" && v ? v : null);
/* Each row is spelled in its own try, so a row that cannot be read is left out and the rest still are. */
const each = (rows, spell) => objects(rows).flatMap((r) => { try { return [spell(r)]; } catch { return []; } });
const outcomeRow = (r) => ({ outcome: str(r.outcome), kind: OUTCOME_KINDS.includes(r.kind) ? r.kind : null,
                             text: typeof r.text === "string" ? r.text : null, cites: citesOf(r.cites), on: str(r.on),
                             carried_by: str(r.carried_by), carried_at: str(r.carried_at) });

/** R29: the `outcomes:` block's lines, from rows `{outcome, kind, text, cites: [{kind, ref, ord?}], on, carried_by,
 *  carried_at}`, in the order given. No line at all when there is none, so such a document's bytes are what they were. */
export function outcomesLines(rows) {
  const written = each(rows, outcomeRow);
  return written.length ? exactRowsBlock("outcomes", written, OUTCOME_FIELDS) : [];
}

/** R29: the `outcomes:` block read back, in the document's order, each row as `outcomesLines` writes it; `[]` for a
 *  document without it, and for a format before `/6`. Pure; never throws. */
export function outcomesOf(fm) {
  try {
    if (!fm || typeof fm !== "object" || !caseDocumentRequiresMaterials(fm) || !Array.isArray(fm.outcomes)) return [];
    return each(fm.outcomes, (r) => outcomeRow(Object.fromEntries(Object.keys(r).map((k) => [k, unexact(r[k])]))));
  } catch {
    return [];
  }
}

/** R29: a row's cites in words, one spelling for the body and the complete edition (R14): each `kind ref`, a leg's with
 *  its `ord`, joined by "; "; "none stated" when it cites nothing. */
export function outcomeCitesWords(cites) {
  const list = citesOf(cites);
  return list.length ? list.map((c) => `${c.kind ?? "a cite of a kind not stated"} ${c.ref ?? "not stated"}`
    + `${c.kind === "leg" ? `, leg ${c.ord ?? "not stated"}` : ""}`).join("; ") : "none stated";
}

/** R29: one outcome in words: its kind, its date, its text and its cites. */
export function outcomeWords(row) {
  const r = outcomeRow(row && typeof row === "object" ? row : {});
  return `${OUTCOME_KIND_WORDS[r.kind] ?? "An outcome of a kind not stated"}, on ${r.on ?? "a date not stated"}: `
    + `${String(r.text ?? "").replace(/[\r\n]+/g, " ")} Rests on: ${outcomeCitesWords(r.cites)}.`;
}

/** R29: the body section's lines, under `OUTCOMES_HEAD`: one line per outcome, in the order given, its kind, date, text
 *  and cites. No line at all when there is none, so a document carrying no outcome has the body it had before T45. */
export function outcomesSectionLines(rows) {
  const written = each(rows, outcomeRow);
  return written.length ? [OUTCOMES_HEAD, "", ...written.map((r) => `- ${outcomeWords(r)}`), ""] : [];
}
