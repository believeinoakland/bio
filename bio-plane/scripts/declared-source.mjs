/* declared-source.mjs — THE CORPUS IS DECLARED CODE, NOT RAW TEXT (D-277).
 *
 * WHY THIS MODULE EXISTS, and it is a measured failure rather than tidiness.
 * `scripts/coverage.mjs` built the check catalog by matching an id SHAPE over the
 * raw bytes of `checks/bio-checks.mjs`:
 *
 *     [...new Set([...checksSrc.matchAll(<the id shape>)].map((m) => m[0]))]
 *
 * Comments included. So a number written in PROSE — a comment explaining a rule,
 * a note recording which numeral an allocation deliberately skipped and why —
 * was harvested as a CATALOGUED CHECK. Nothing then names it in an assertion,
 * and `node scripts/coverage.mjs --strict` exits 1 on a catalog that is complete.
 *
 * THAT IS NOT HYPOTHETICAL AND IT IS NOT NEW. The same class, at least five times:
 *
 *   - `tools/mintid.mjs` caught its own debt row poisoning its own floor,
 *     minutes after it landed.
 *   - `test/hygiene.test.mjs`'s walk census caught its own CORRECTION, because
 *     the comment explaining the removal spelled the token being removed.
 *   - UI-43 found the shape again.
 *   - `scripts/walkfloor.mjs`'s first draft blanked STRINGS as well as comments
 *     and reported CROSS-FILE FLOORS: 0 over an estate that had four.
 *   - The catalogue's own renumbering note (`checks/bio-checks.mjs`, above the
 *     strength-pair family) says it in its own words: its first draft wrote the
 *     warning as a WORKED EXAMPLE with real numbers in it, the integration's
 *     sweep renumbered the example along with the code, and this instrument then
 *     reported a check nothing named. **That comment was rewritten to remove its
 *     own example — the documentation was bent around the instrument, which is
 *     the wrong way round, and it is the sentence that earned this item.**
 *
 * AND THIS ONE GATES, which is why it was worth an item of its own. `mintid`
 * and the census REPORT. Here, writing an ordinary explanatory comment fails a
 * run that has nothing wrong with it, and **a check that fails honest runs gets
 * switched off** — `VERIFICATION.md`'s own stated reason for not making
 * `--strict` the gate yet.
 *
 * ------------------------------------------------------- WHAT THE RULE IS NOW
 *
 * The kind of defect is: **an instrument whose CORPUS is raw source when what it
 * means is DECLARED CODE.** The fix is therefore not a longer list of prose
 * spellings to skip — that list goes stale the moment somebody writes a fourth —
 * but an INVERSION of the corpus:
 *
 *     A DECLARATION IS SOMETHING THE PROGRAM SAYS. A COMMENT IS SOMETHING A
 *     PERSON SAYS ABOUT THE PROGRAM. Only the first is corpus.
 *
 * NOTE WHAT THIS DELIBERATELY DOES NOT DO. It does not restrict the corpus to a
 * list of recognised declaration SPELLINGS. The catalogue writes a check id in at
 * least THREE shapes, MEASURED on 2026-08-09 over `checks/bio-checks.mjs`:
 *
 *     a DEC-49 family row's `check:` value          168 ids
 *     the first argument of the finding factory      58 ids
 *     a QUOTED OBJECT KEY in the retirements table    2 ids
 *
 * and the third is the one that decides it. A matcher built from the two shapes
 * anybody would think to write LOSES the retired ids — which `CHECK_RETIREMENTS`'s
 * own header requires to keep being counted, because the assertion naming a
 * retired id is the one PROVING IT NO LONGER FIRES. Grading a declaration by its
 * spelling is the failure this project has recorded under several names; grading
 * it by WHERE IT IS survives a fourth spelling nobody has written yet.
 *
 * ------------------------------------------- ONE LEXER FOR THE ESTATE, NOT A THIRD
 *
 * The scanner is `scripts/walkfloor.mjs`'s `stripComments`, IMPORTED and not
 * copied. There were already two readers of this shape in the tree — walkfloor's
 * real lexer (line comments, block comments, strings, templates WITH their
 * `${...}` interpolations, regex literals, offsets preserved) and a smaller
 * regex-based one inside `test/hygiene.test.mjs`'s walk census. A third would be
 * the defect `coverage.mjs`'s own fleet-register note records: *a second copy of
 * a rule absorbs the control that was meant to prove the first* — the arm written
 * to prove that fix came back GREEN because nothing read the flag any more.
 * `strings: false` is the right mode and not an accident: a check id LIVES in a
 * string literal, so blanking strings would empty this corpus completely.
 *
 * ------------------------------------------------ WHAT THIS CANNOT SEE, PLAINLY
 *
 *   - It is a SCANNER, not a parser. A misread can only ever blank a span; it can
 *     never delete or move code, and offsets are preserved.
 *   - Its regex-literal heuristic is a heuristic (walkfloor's header states it).
 *     A blanked regex literal cannot hide a declaration, because an id is a
 *     string and not a pattern.
 *   - It cannot tell a REAL declaration written in a comment from prose, because
 *     nothing can. That direction is covered by REPORTING: `proseOnlyCheckIds`
 *     returns every id the raw text holds and the code does not, and callers
 *     PRINT that set. An id excluded silently would be the over-strict mirror of
 *     the defect this module fixes, so it is never silent.
 *   - It says nothing about whether a declared check is correct, reachable, or
 *     ever fires. That is the battery's job and no matcher supplies it.
 */

import { stripComments } from "./walkfloor.mjs";

/** `src` with every COMMENT and regex literal blanked and STRING LITERALS KEPT,
 *  same length, same offsets, same line numbers. The estate's one lexer. */
export const codeOnly = (src) => stripComments(src);

/* THE CHECK ID SHAPE, with BOTH ends guarded, and each guard is a measured
 * defect rather than caution:
 *
 *   LEFT.  Unguarded, the shape matches INSIDE a longer prefixed id — a
 *          decision-namespace id of the same dotted form contains it. MEASURED:
 *          that alone put a phantom in this repository's catalog, and the phantom
 *          read as COVERED because suites discussing the same DECISION contain
 *          the same bytes. Two errors cancelling is not a green.
 *   RIGHT. Unguarded, a search for one id matches a SIBLING that extends it —
 *          a one-digit member inside its own family's tenth or eighteenth.
 *          MEASURED over this battery: twelve catalogued ids matched that way,
 *          and for ONE of them the sibling was the ONLY thing crediting it. A
 *          check that reads as named because its NEIGHBOUR is named is the
 *          generous direction, which is the one this instrument exists to refuse.
 *
 * The right guard permits a trailing FULL STOP — an id ending a sentence inside a
 * member-facing message string is still that id — and refuses only a further
 * digit. An over-strict guard would lose real ids, and a fence tighter than its
 * rule is not a safer fence.
 */
export const CHECK_ID = /(?<![A-Za-z0-9_-])C-\d+\.\d+(?!\.?\d)/g;

const byNumber = (a, b) => a.localeCompare(b, "en", { numeric: true });

/** The distinct check ids DECLARED in `src` — code only, prose discarded. */
export function declaredCheckIds(src) {
  return [...new Set([...codeOnly(src).matchAll(CHECK_ID)].map((m) => m[0]))].sort(byNumber);
}

/** The ids the RAW text holds that the CODE does not: prose-only mentions. The
 *  caller must PRINT these. They are the EXCLUDED set, and an instrument that
 *  narrows its corpus without naming what it dropped has traded a loud error for
 *  a quiet one. */
export function proseOnlyCheckIds(src) {
  const declared = new Set(declaredCheckIds(src));
  return [...new Set([...src.matchAll(CHECK_ID)].map((m) => m[0]))]
    .filter((id) => !declared.has(id)).sort(byNumber);
}

/** Does `text` NAME this exact id — not a longer one that begins with it? The
 *  credit side's matcher; `text` should already be `codeOnly`. */
export function namesCheckId(id, text) {
  return new RegExp(`(?<![A-Za-z0-9_-])${id.replace(".", "\\.")}(?!\\.?\\d)`).test(text);
}
