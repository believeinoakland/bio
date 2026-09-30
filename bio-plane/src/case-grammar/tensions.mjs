/* case-grammar — the tensions a signed case document disclosed (requirements:
 * `build/requirements/case-grammar.md` R1, R6; copied from `publication/tensions.mjs` (K651), whose ids the comments
 * below keep: publication R20 is this module's R1, and R10, R28, R50 are publication's readers of it; N345: DEC-76
 * item 4, DEC-84 items 11–13, DEC-77 item 2, DEC-85). `case-authoring` writes the section (its R14, R31) and this
 * is the one reading of it, beside R20's predicates, so no module parses it a second way.
 *
 * THE SECTION, as a `/5` document's front matter carries it (arrays of flat rows, the grammar `parseFrontmatter` reads):
 *   case_tensions:           one row per disclosed candidate: `candidate`, `finding`, `state` (`open`,
 *                            `explained_not_shown`, `taken_up`, `resolved`), `kind` (`irreconcilable` or null),
 *                            `unseen_other_side`, `depth`, `acknowledged_by`, `acknowledged_at`, `words` (the owner's),
 *                            `explanation`; a seen pair's `a_*` and `b_*` (`kind`, `text`, `source`, `date`, `doctype`,
 *                            `capture`); a highlighted one's `side_*` (the seen side) and `highlight`.
 *   case_tension_sentences:  one row per member sentence: `target`, `candidate`, `template` (`in_tension`, `explained`,
 *                            `irreconcilable`, `unseen`), `sentence`.
 *   tensions_depth_stated:   the sentence that a disclosure reaches one level.
 *   case_tensions_unread:    one row per member with document legs the conflict read could not examine (no content
 *                            row): `target`, `legs` (K499); stated, not refused (case-authoring R26). Empty when none.
 *
 * READ, NEVER LIVE: everything here comes from the signed bytes. A highlighted row answers its seen side, the fixed
 * sentence and nothing else, whatever else the bytes hold, so nothing names the unseen record (DEC-85). */

import { parseFrontmatter } from "../../checks/bio-checks.mjs";
import { caseDocumentRequiresTensionSection } from "./formats.mjs";

/** R10: the four states a disclosed contradiction is read as, by the row's `state` (and `kind`). */
export const TENSION_STATE_WORDS = Object.freeze({
  open: "open",
  explained_not_shown: "explained, not yet shown",
  taken_up: "taken up as a question",
  irreconcilable: "held irreconcilable, to be reopened by new evidence",
});
/** R10 (DEC-85): `case-authoring` R31's fixed sentence for a disclosed contradiction with a side the publisher could not
 *  see. */
export const TENSION_HIGHLIGHT_SENTENCE = "This finding rests on a side in conflict with a record not shown here. The "
  + "record and who holds it are not named.";
/** R10 (DEC-84 item 12): what a disclosure reaches, when the document does not state it in its own words. */
export const TENSION_DEPTH_SENTENCE = "a disclosure reaches one level: the contradictions on what each finding rests on "
  + "directly; deeper findings disclose their own when published";
/** R10, R28: why a document older than `/5` answers `tensions: null`. */
export const TENSIONS_PREDATE_SENTENCE = "this case document's format predates the disclosure of contradictions, so it "
  + "states none; that is not a statement that none existed";
/** R10, R28: a `/5` document that carries no readable section: what it disclosed is undetermined, never filled. */
export const TENSIONS_UNREADABLE_SENTENCE = "this case document declares a format that discloses contradictions, but "
  + "carries no readable tension section, so what it disclosed is undetermined";

const SIDE_FIELDS = ["kind", "text", "source", "date", "doctype", "capture"];
const val = (v) => (v === undefined || v === null || v === "null" ? null : typeof v === "string" ? v : v);
const sideOf = (row, prefix) => Object.fromEntries(SIDE_FIELDS.map((f) => [f, val(row[`${prefix}_${f}`])]));
const stateWords = (row) => (row.state === "resolved" && row.kind === "irreconcilable" ? TENSION_STATE_WORDS.irreconcilable
  : Object.prototype.hasOwnProperty.call(TENSION_STATE_WORDS, row.state) ? TENSION_STATE_WORDS[row.state]
  : row.state == null ? null : String(row.state));

/** R10: the tensions one case document's bytes disclosed: `{tensions, highlighted, depth, members, unread, detail}`.
 *  `tensions` is null (with `detail`) for a document before `/5` or one without a readable section; `members` maps each
 *  member to its attributed sentences; `unread` is the stated unread legs (`[{member, legs}]`, K499), null where the
 *  document states none. Pure; never throws. */
export function caseTensionsOf(text) {
  try {
    const fm = parseFrontmatter(String(text ?? "")).data || {};
    if (!caseDocumentRequiresTensionSection(fm))
      return { tensions: null, highlighted: null, depth: null, members: {}, unread: null, detail: TENSIONS_PREDATE_SENTENCE };
    if (!Array.isArray(fm.case_tensions))
      return { tensions: null, highlighted: null, depth: null, members: {}, unread: null, detail: TENSIONS_UNREADABLE_SENTENCE };
    const depth = typeof fm.tensions_depth_stated === "string" && fm.tensions_depth_stated.trim()
      ? fm.tensions_depth_stated.trim() : TENSION_DEPTH_SENTENCE;
    const tensions = fm.case_tensions.filter((r) => r && typeof r === "object").map((r) => {
      const unseen = r.unseen_other_side === true || r.unseen_other_side === "true";
      const common = { candidate: val(r.candidate), finding: val(r.finding), state: stateWords(r), depth: 1,
                       depth_stated: depth,
                       owner_words: val(r.words) === null ? null : { text: String(r.words), by: "the case's owner" },
                       acknowledged_by: val(r.acknowledged_by), acknowledged_at: val(r.acknowledged_at) };
      /* DEC-85: the seen side and the fixed sentence only; no kind, explanation or other side, since either may
         quote or name the record not shown. */
      if (unseen) return { ...common, unseen_other_side: true, highlighted: true, side: sideOf(r, "side"),
                           sentence: TENSION_HIGHLIGHT_SENTENCE };
      return { ...common, unseen_other_side: false, highlighted: false, kind: val(r.kind),
               sides: { a: sideOf(r, "a"), b: sideOf(r, "b") }, explanation: val(r.explanation) };
    });
    const unseenIds = new Set(tensions.filter((t) => t.unseen_other_side).map((t) => t.candidate));
    const members = {};
    for (const s of Array.isArray(fm.case_tension_sentences) ? fm.case_tension_sentences : []) {
      if (!s || typeof s !== "object" || typeof s.target !== "string") continue;
      const highlighted = s.template === "unseen" || unseenIds.has(val(s.candidate));
      (members[s.target] ||= []).push({ candidate: val(s.candidate), template: val(s.template),
                                        sentence: val(s.sentence), highlighted });
    }
    /* K499: each member's document legs the conflict read could not examine, as the document states them. */
    const unread = Array.isArray(fm.case_tensions_unread)
      ? fm.case_tensions_unread.filter((r) => r && typeof r === "object" && typeof r.target === "string")
          .map((r) => ({ member: r.target, legs: val(r.legs) }))
      : null;
    return { tensions, highlighted: tensions.filter((t) => t.highlighted).length, depth, members, unread, detail: null };
  } catch {
    return { tensions: null, highlighted: null, depth: null, members: {}, unread: null, detail: TENSIONS_UNREADABLE_SENTENCE };
  }
}

/** R50: the candidate ids a signed case document disclosed; empty for a document before `/5`. */
export function disclosedCandidates(text) {
  const t = caseTensionsOf(text);
  return new Set((t.tensions || []).map((x) => x.candidate).filter((c) => typeof c === "string" && c));
}
