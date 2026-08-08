/* The negative-control REGISTER's detector, in a module of its own so the
 * battery can test the instrument instead of trusting it (M0-9).
 *
 * (Reading note: this file is about the syntax of comments, so it never writes a
 * block-comment CLOSE inside its own prose. "the close" always means that token.)
 *
 * WHAT WENT WRONG, MEASURED RATHER THAN REMEMBERED. `coverage.mjs` found a
 * suite's declaration with
 *
 *     /NEGATIVE CONTROL:\s*(.+?)\s*(?:\*\/|$)/   over   src.split("\n").slice(0, 60).join("\n")
 *
 * and that expression has three separate failure modes, all measured directly on
 * 2026-08-04 before this module was written:
 *
 *   1. A CONTINUATION LINE THAT CARRIES TEXT MATCHES NOTHING AT ALL. `.` does not
 *      cross a newline and there is no `m` flag, so `(.+?)` can reach no further
 *      than the end of the marker's own line, and `\s*` must then arrive at the
 *      close, or at the end of the window, over WHITESPACE ONLY. A block whose
 *      next line holds nothing but the close therefore matches — which is why
 *      `\s*` looks like it crosses newlines — while a block whose next line says
 *      `(b) …` matches NOTHING and the suite reads as declaring NO CONTROL.
 *      **This, not the head window, is what took the strict run from exit 0 to
 *      exit 1 at 96 of 98 when REC-48 gave two suites a longer, better control
 *      block** (verified by reconstructing the shape REC-48 wanted: NO MATCH for
 *      both suites, while both markers sit on line 1 and the window is nowhere
 *      near them). REC-48's own report named this mechanism and it was right; the
 *      re-measurement at integration named the head window instead, and this note
 *      corrects that on the record rather than quietly building the other fix.
 *   2. THE FIXED 60-LINE HEAD WINDOW is a real defect too, just not that one. A
 *      marker past line 60 is invisible; worse, a declaration that STRADDLES line
 *      60 matches against the truncated window and the register silently records
 *      a FRAGMENT (measured: marker on line 59, one word on line 60, the arms on
 *      line 61 — the register recorded the one word and called the suite
 *      controlled).
 *   3. ONLY THE FIRST LINE IS EVER CAPTURED, so a five-arm control is registered
 *      as one arm. The instrument reads fully green while stating a fraction of
 *      what it checked — the generous direction, which is the one failure this
 *      instrument exists to prevent.
 *
 * REC-48 got past (1) by keeping its marker line self-contained and putting the
 * arms in a SECOND comment the detector never sees. That is a convention holding
 * up an instrument, and it is removed here rather than documented: the arms are
 * back inside the declaration in both suites, and the detector reads the block.
 *
 * TWO JUDGEMENTS, made here and not returned, because the item left them open.
 *
 * WHERE A DECLARATION ENDS. It runs from the marker to the end of the comment
 * that encloses it — the close for a block comment, the end of the contiguous
 * `//` run for line comments — and stops EARLY at the first blank comment line.
 * These suites write their headers as paragraphs separated by a bare ` *`, and
 * several state the control as one paragraph of a longer header; running to the
 * close would swallow the prose that follows, and the register would then quote
 * back more than the suite declared. A declaration is a paragraph. It also stops
 * at a second `NEGATIVE CONTROL:` marker, so two adjacent declarations cannot
 * merge into one.
 *
 * WHICH DECLARATION, WHEN THERE ARE SEVERAL. M0-2's backfill left most suites
 * stating the control TWICE — once as prose inside the file header, once as the
 * one-line register entry above the imports — and they are the same control. So
 * every block is found, the suite counts as controlled if any exists, and the one
 * RECORDED is the block stating the most arms (longer text breaks a tie). Never
 * the sum: summing two statements of one control would credit it twice, which is
 * the generous direction again.
 *
 * WHAT AN ARM IS, AND WHAT IS NOT GATED ON IT. An arm is a stated
 * `<what to break> -> <what must then fail>` transition, counted as the register
 * grammar's own separator: an arrow with whitespace on BOTH sides (`->` or `→`).
 * It is deliberately syntactic and says only what it means — it counts transitions
 * STATED, not experiments semantically distinct, and prose like `flipped
 * true->false` is not one because it carries no spaces. **The count is REPORTED
 * and never gated.** `--strict` still fails on exactly what it always failed on: a
 * suite with no declaration at all. A floor on arm counts would be strictness this
 * instrument cannot justify — nobody has ruled how many arms a control owes — and
 * an instrument made stricter than it can justify is as bad as one that reads
 * generously.
 *
 * >>> CORRECTED BY M0-14 (2026-08-08), and stated here rather than left to
 * contradict the code below. TWO CLAIMS IN THE PARAGRAPH ABOVE ARE NO LONGER
 * TRUE, and both were wrong for the same reason.
 *
 *   (i) "an arm is an ARROW" was a VOCABULARY, not a definition — see the
 *       measurement below.
 *   (ii) "the count is never gated" was the argument that let it stay wrong.
 *       The objection it answers is real and is NOT overturned: nobody has ruled
 *       how many arms a control owes, so there is still NO per-suite minimum.
 *       What M0-14 added is a different gate entirely — a FLOOR on the TOTAL,
 *       set to a figure the instrument PRINTED, which asserts only that the
 *       estate's declared controls did not SHRINK. That needs no ruling about
 *       any one suite, and without it this figure could never fail, which is
 *       precisely why it was wrong for four consecutive re-measurements.
 *
 * ===========================================================================
 * M0-14 / D-233 — THE PARAGRAPH ABOVE WAS TRUE AND THE INSTRUMENT UNDER IT WAS
 * BLIND, AND THE SHAPE OF THE BLINDNESS IS THE POINT.
 * ===========================================================================
 *
 * MEASURED 2026-08-08, not remembered. M0-13 predicted the register would move
 * 388 -> 390 for two arms it had just added, and IT DID NOT MOVE AT ALL. Four of
 * the 120 suites scored ZERO arms while declaring dozens between them, and when
 * each was read the four had FOUR DIFFERENT causes — which is why the fix below
 * is not "teach the matcher one more spelling":
 *
 *   - `bias.test.mjs` states thirteen arms in ARROW GRAMMAR, in enumerated
 *     paragraphs FOLLOWING the marker's own paragraph. Every arrow was legible;
 *     the EXTENT rule ("a declaration is a paragraph") cut them all off. The
 *     declaration style was not exotic at all — the instrument stopped reading.
 *   - `case-opened.test.mjs`'s head declaration is a POINTER to a fuller block at
 *     the foot of the same file, and that block is headed `NEGATIVE CONTROL —`
 *     with a DASH. One character of punctuation made a whole declaration invisible.
 *   - `suggest.test.mjs` and `strengthpair.test.mjs` DELEGATE: their arms are
 *     stated and run in a sibling `*.control.mjs`, which the register does not
 *     read. Their own declaration genuinely states no arms, so ZERO was ARITH-
 *     METICALLY right and EPISTEMICALLY wrong: it read as "this suite states no
 *     arms" when the truth is "this instrument cannot count this suite's arms".
 *
 * AND A FIFTH FINDING NOBODY WAS LOOKING FOR, which is worse than a zero because
 * nothing about it looks wrong: `versionstate.test.mjs` scored **1**. Its
 * declaration enumerates ELEVEN arms — and the single arrow the old matcher found
 * was not an arm at all, it was the `->` inside a quoted CODE EDIT
 * (`|| VERSION_ACTIONS.includes(op)` -> `|| (… && viaSession)`). A count that is
 * merely WRONG is harder to notice than a count that is zero.
 *
 * WHAT MAKES AN ARM DECLARATION RECOGNISABLE IN PRINCIPLE. This is REC-70's
 * lesson applied: its classifier graded only returns carrying the literal
 * `ok: true` and the correction INVERTED the test rather than lengthening the
 * list, *because a list of success spellings goes stale silently the moment a
 * fourth is written.* So the question here is not which arm styles exist today.
 * An arm is ONE ITEM OF A LIST the declaration states, and a list is recognisable
 * by its MARKING. There are two markings, and they are not a vocabulary — they
 * are the only two ways a list marks its items at all:
 *
 *   TRANSITION — the `break -> consequence` arrow, one per arm. (Unchanged.)
 *   ENUMERATION — a parenthesised ordinal opening a segment: `(1)`, `(b)`,
 *                 `(3b)`, `(ii)`. One per arm.
 *
 * The count is **max(transitions, enumerations), NEVER the sum.** An arm usually
 * carries both, and summing would credit it twice — the same reasoning that makes
 * `readControl` record the FULLEST declaration rather than the sum of several.
 * `max` also absorbs the `versionstate` false positive above: one stray code-edit
 * arrow cannot lower a count of eleven enumerated arms.
 *
 * THE HALF THAT MAKES IT SAFE, AND IT IS THE WHOLE DEFECT D-233 NAMED. A
 * declaration carrying NO marking of either kind is **not a declaration of zero
 * arms**; it is one this instrument COULD NOT CLASSIFY. It is reported as
 * `arms: null` — never `0` — so the register can NAME it instead of silently
 * folding it into the tally. A missing tally reported as zero is how "stayed
 * GREEN" gets recorded for a suite that never ran, and it is how this defect hid
 * for four consecutive re-measurements of VERIFICATION.md's own row.
 *
 * WHAT THIS MATCHER STILL CANNOT SEE, stated plainly rather than discovered later:
 *   - It does not follow a DELEGATION. A declaration that says its arms live in
 *     `test/x.control.mjs` is UNCLASSIFIED and named; the register does not open
 *     that file and does not guess a number for it.
 *   - It cannot tell a list item from QUOTED CODE that happens to be a
 *     parenthesised single letter (`if (a)`). It is syntactic and says only what
 *     it means. The `>= 2 distinct tokens including a FIRST ordinal` guard below
 *     is what stops a lone parenthesised letter in prose from counting.
 *   - It counts marks STATED, not experiments semantically distinct — so an arm
 *     written with three arrows in its consequence reads as three.
 */

/* The marker's PHRASE. `CONTROL_MARKER` keeps the colon spelling because callers
   build fixtures out of it and hide declarations by replacing it; the DETECTOR
   matches the phrase followed by any of the separators a writer reaches for. One
   character of punctuation is not a different kind of declaration. */
export const CONTROL_MARKER = "NEGATIVE CONTROL:";
export const MARKER_PHRASE = "NEGATIVE CONTROL";
export const MARKER_SEPARATORS = [":", "—", "–", "-"];

const CLOSE = "*" + "/";

/* An arrow with whitespace on both sides, the register grammar's own separator.
   Both spellings, because the tree writes both. */
const ARM = /\s(?:->|→)\s/g;

/* A parenthesised ordinal opening a segment: digits, one or two lowercase
   letters, or a lowercase roman numeral, with an optional letter suffix on the
   digit form (`(1a)`, `(3b)`). It must be preceded by start-of-text or
   whitespace, and followed by whitespace — so `f(a)` and `member(s)` are not
   enumerators, and neither is `(a)b`. */
const ENUM = /(?:^|\s)\((\d{1,2}[a-z]{0,2}|[a-z]{1,2}|[ivx]{1,4})\)(?=\s)/g;

/* A list that never starts is not a list. Requiring a FIRST ordinal, and at least
   two DISTINCT tokens, is what keeps a lone `(b)` in an argumentative sentence
   from being read as an arm — the over-strictness direction, which for a tally
   that is about to carry a floor matters as much as the blind direction. */
const FIRST_ORDINAL = new Set(["1", "a", "i", "1a"]);

export function countEnumerations(text) {
  const tokens = new Set([...text.matchAll(ENUM)].map((m) => m[1]));
  if (tokens.size < 2) return 0;
  if (![...tokens].some((t) => FIRST_ORDINAL.has(t))) return 0;
  return tokens.size;
}

export const countTransitions = (text) => (text.match(ARM) || []).length;

/* NULL, NEVER ZERO, when nothing marks a list at all — see the header. */
export const countArms = (text) => {
  const transitions = countTransitions(text);
  const enumerations = countEnumerations(text);
  const marked = Math.max(transitions, enumerations);
  return marked === 0 ? null : marked;
};

/* One line of a comment, with its decoration removed. The `*` case is guarded
   against a closing line so the close is not mistaken for a continuation. */
function undecorate(line) {
  return line
    .replace(/^\s*\/\*+/, "")
    .replace(/^\s*\/\/+/, "")
    .replace(/^\s*\*(?!\/)/, "")
    .trim();
}

const isLineComment = (line) => /^\s*\/\//.test(line);

/* Does this line OPEN a list item? An enumerated paragraph following the marker's
   own paragraph is a continuation of the list the marker introduced, not the
   "unrelated prose" the paragraph rule exists to keep out. `bias.test.mjs` states
   thirteen arms exactly this way and scored zero for it (D-233). */
const OPENS_ITEM = /^\((?:\d{1,2}[a-z]{0,2}|[a-z]{1,2}|[ivx]{1,4})\)\s/;
const opensListItem = (text) => OPENS_ITEM.test(text);

/* Every position where a declaration's marker begins. The PHRASE followed by any
   of the separators a writer reaches for — a dash is not a different kind of
   declaration from a colon, and one character of punctuation hid the whole foot
   block of `case-opened.test.mjs` (D-233). */
function markerPositions(src) {
  const out = [];
  let from = 0;
  for (;;) {
    const at = src.indexOf(MARKER_PHRASE, from);
    if (at === -1) break;
    from = at + MARKER_PHRASE.length;
    const rest = src.slice(from);
    const sepAt = /^\s*/.exec(rest)[0].length;
    if (MARKER_SEPARATORS.includes(rest[sepAt])) out.push({ at, after: from + sepAt + 1 });
  }
  return out;
}

/* The declaration whose marker starts at `at`, read to the end of its enclosing
   comment or of its paragraph, whichever comes first. Returns null only if the
   marker is followed by nothing at all. */
function declarationAt(src, at, after) {

  /* Which comment form encloses the marker. An opener more recent than the last
     close means we are inside a block comment, and then EVERY following line
     belongs to it whether or not it carries decoration — which is what lets a
     block hold indented arms. */
  const lastOpen = src.lastIndexOf("/*", at);
  const lastClose = src.lastIndexOf(CLOSE, at);
  const inBlock = lastOpen !== -1 && lastOpen > lastClose;

  const lineEnd = (from) => { const n = src.indexOf("\n", from); return n === -1 ? src.length : n; };

  let end;
  if (inBlock) {
    end = src.indexOf(CLOSE, after);
    if (end === -1) end = src.length;
  } else {
    /* A `//` run: the marker's own line plus every following line that is also a
       line comment. A marker in neither form (inside a string, say) gets its own
       line and nothing more. */
    const lineStart = src.lastIndexOf("\n", at) + 1;
    const runs = isLineComment(src.slice(lineStart, lineEnd(at)));
    end = lineEnd(after);
    while (runs && end < src.length) {
      const next = lineEnd(end + 1);
      const line = src.slice(end + 1, next);
      if (!isLineComment(line) || undecorate(line) === "") break;
      end = next;
    }
  }

  const lines = src.slice(after, end).split("\n");
  const kept = [lines[0].trim()];
  /* The paragraph rule, with the one exception D-233 measured: a blank comment
     line ends the declaration UNLESS the next paragraph opens a list item, in
     which case it is the arms the marker's paragraph just announced. Anything
     that is not marked as a list item still ends it, so the "UNRELATED PARAGRAPH"
     the extent arms pin is still kept out. */
  for (let i = 1; i < lines.length; i++) {
    const text = undecorate(lines[i]);
    if (text === "") {
      let j = i + 1;
      while (j < lines.length && undecorate(lines[j]) === "") j++;
      if (j >= lines.length || !opensListItem(undecorate(lines[j]))) break;
      i = j - 1;
      continue;
    }
    if (text.includes(MARKER_PHRASE)) break;      /* the next declaration begins */
    kept.push(text);
  }

  const text = kept.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return {
    line: src.slice(0, at).split("\n").length,
    lines: kept.length,
    text,
    arms: countArms(text),
  };
}

/* Every declaration in the file, in the order they appear. NO head window: a
   declaration is found wherever it is written. */
export function findControlDeclarations(src) {
  const found = [];
  for (const { at, after } of markerPositions(src)) {
    const d = declarationAt(src, at, after);
    if (d) found.push(d);
  }
  return found;
}

/* The one the register records: the fullest single statement, never the sum.
   `arms` may be null (UNCLASSIFIED), and null must never win a comparison against
   a real count — an unreadable number and no arms are different claims (D-93's
   lesson, and REC-70's "report a missing tally as -1" receipt). */
export function readControl(src) {
  const all = findControlDeclarations(src);
  if (!all.length) return null;
  const rank = (d) => (d.arms == null ? -1 : d.arms);
  return all.reduce((best, d) =>
    rank(d) > rank(best) || (rank(d) === rank(best) && d.text.length > best.text.length) ? d : best);
}
