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
 */

export const CONTROL_MARKER = "NEGATIVE CONTROL:";

const CLOSE = "*" + "/";

/* An arrow with whitespace on both sides, the register grammar's own separator.
   Both spellings, because the tree writes both. */
const ARM = /\s(?:->|→)\s/g;

export const countArms = (text) => (text.match(ARM) || []).length;

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

/* The declaration whose marker starts at `at`, read to the end of its enclosing
   comment or of its paragraph, whichever comes first. Returns null only if the
   marker is followed by nothing at all. */
function declarationAt(src, at) {
  const after = at + CONTROL_MARKER.length;

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
  for (let i = 1; i < lines.length; i++) {
    const text = undecorate(lines[i]);
    if (text === "") break;                       /* the paragraph ends here */
    if (text.includes(CONTROL_MARKER)) break;     /* the next declaration begins */
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
  let from = 0;
  for (;;) {
    const at = src.indexOf(CONTROL_MARKER, from);
    if (at === -1) break;
    from = at + CONTROL_MARKER.length;
    const d = declarationAt(src, at);
    if (d) found.push(d);
  }
  return found;
}

/* The one the register records: the fullest single statement, never the sum. */
export function readControl(src) {
  const all = findControlDeclarations(src);
  if (!all.length) return null;
  return all.reduce((best, d) =>
    d.arms > best.arms || (d.arms === best.arms && d.text.length > best.text.length) ? d : best);
}
