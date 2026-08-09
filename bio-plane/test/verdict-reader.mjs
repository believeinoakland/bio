/* THE VERDICT READER — REC-76's, SHARED RATHER THAN RE-DERIVED (D-240).
 * ============================================================================
 *
 * REC-76 closed D-236 by INVERTING the DEC-49 guard's arm C: instead of matching
 * one spelling of "this is a refusal", it takes the object literal an answer is
 * built from and reads its VERDICT — **the FIRST BOOLEAN-SHAPED top-level
 * property** — then grades by whether the outcome DECLARES ITSELF A SUCCESS.
 * The half that goes stale is the FIELD NAME (`ok`, `started`, `found`,
 * `proposed`, `preview` are five in this plane today and there will be a sixth);
 * the half that does not is JavaScript's own set of boolean-producing operators.
 *
 * REC-76's class sweep then found TWO MORE INSTRUMENTS grading a return by one
 * literal (D-240), and both are in `bio-plane/test/`:
 *   - `meaning-bounds.test.mjs`'s `REFUSAL_RETURN` — the EXCLUDER that decides
 *     which returns a bounds walk has no business grading;
 *   - `plane-envelope.test.mjs`'s DETECTOR A — the GATE that decides which
 *     `json()` answers can report a success to a caller.
 *
 * **THIS FILE EXISTS SO THERE IS ONE MECHANISM AND NOT THREE.** A verdict reader
 * copied into a third instrument is a third thing that can go dark differently,
 * and "the next component goes dark differently" is the failure D-236, D-233,
 * REC-70 and this row are all one instance of. The six functions below are
 * REC-76's, BYTE-IDENTICAL to `civicos-ui/check-refusal-codes.mjs`, and
 * `readerDrift()` is what keeps that true: it extracts the same six functions
 * from that file and from this one and reports any that differ. Both suites
 * assert it, so a change to either copy fails the battery naming the function.
 *
 * WHY A COPY AND NOT AN IMPORT, stated rather than left to be discovered.
 * `check-refusal-codes.mjs` is a SCRIPT with no exports whose work runs at the
 * top level and ends in `process.exit`, so importing it would run the whole
 * DEC-49 guard as a side effect of loading a test. It is also VERIFY's file and
 * not this item's. **The single-home version of this is one line in that file
 * (`import … from "../bio-plane/test/verdict-reader.mjs"`) and it is DELEGATED
 * in `CLAIMS.md`** — until it lands, `readerDrift()` is what makes the duplicate
 * falsifiable rather than merely regrettable. An identity pin is the mechanism
 * this project already uses for exactly this (affordances.test.mjs's arm (a)).
 *
 * ---------------------------------------------------------------------------
 * WHAT A VERDICT IS, AND WHAT EACH INSTRUMENT MAY DO WITH IT.
 *
 * `verdictOf(objText)` — `objText` MUST begin at the object's own `{` — answers
 * one of four things, and the fourth is first-class:
 *
 *   { kind: "true"  }   the outcome DECLARES ITSELF A SUCCESS.
 *   { kind: "false" }   the outcome DECLARES ITSELF A REFUSAL.
 *   { kind: "expr"  }   the verdict is COMPUTED (`!x`, `Boolean(x)`, `a === b`).
 *                       **It is neither declaration — it is decided at runtime.**
 *   null                NO boolean-shaped property at all. UNCLASSIFIED, and it
 *                       must be NAMED by its reader, never silently scored zero.
 *
 * **THE `expr` KIND IS WHERE THE TWO INSTRUMENTS DIFFER, AND THAT IS A POLICY
 * AND NOT A SECOND MECHANISM.** REC-76's guard asks *does this refusal owe a
 * code*, so it treats a computed verdict as a refusal — the safe direction when
 * the cost of being wrong is an unjudged refusal. `plane-envelope`'s detector A
 * asks *can this answer report a SUCCESS to a caller*, and a computed verdict
 * CAN evaluate true, so it must be graded — the safe direction there is the
 * opposite one. Same reading, opposite consequence, and each site says which it
 * takes and why. What is NOT allowed is a third reader that computes the verdict
 * differently; that is what `readerDrift()` refuses.
 *
 * WHAT THIS READER CANNOT SEE, carried over from REC-76 rather than re-learned:
 *   - an outcome built into a VARIABLE and returned later (it reads literals);
 *   - a NEGATIVE-POLARITY verdict (`failed: true`), which reads as a success by
 *     construction. Each instrument states its own cross-check for that.
 *   - a verdict below the top level of the object.
 */
const CLOSE_COMMENT = "*" + "/";

/* ---------------------------------------------------------------------------
 * BELOW THIS LINE, AND DOWN TO THE EXPORT BLOCK, EVERY FUNCTION IS REC-76's
 * VERBATIM. Do not reformat, do not "improve" — `readerDrift()` compares these
 * bytes against `civicos-ui/check-refusal-codes.mjs` and a whitespace change
 * fails the battery. If REC-76's copy needs to change, change it THERE and copy
 * it here in the same turn (or land the delegated import and delete this half).
 * ------------------------------------------------------------------------ */

/* Skip a quoted string starting at `i`; returns the index of its closing quote. */
function skipString(text, i) {
  const q = text[i];
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === "\\") { j++; continue; }
    if (text[j] === q) return j;
  }
  return text.length - 1;
}

/* The `}` matching the `{` at `open`, with strings and block comments skipped —
 * a brace inside a comment or a sentence is not a brace. */
function matchBrace(text, open) {
  let d = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(text, i); continue; }
    if (c === "/" && text[i + 1] === "*") { const j = text.indexOf(CLOSE_COMMENT, i + 2); i = j < 0 ? text.length : j + 1; continue; }
    if (c === "{") d++;
    else if (c === "}") { d--; if (!d) return i; }
  }
  return -1;
}

/* RETURN POSITION, and the two forms the plane actually writes. */
function outcomeReturns(text) {
  const out = [];
  const seen = new Set();
  const push = (s, e) => { if (e > s && !seen.has(s)) { seen.add(s); out.push([s, e]); } };
  for (const m of text.matchAll(/\breturn\b/g)) {
    /* the direct form: only whitespace and opening parens may sit in front.
       `lead` is how many of those parens there were, and it is what the
       conditional reader below measures its own depth against. */
    let lead = 0;
    for (let i = m.index + 6; i < text.length; i++) {
      const c = text[i];
      if (/\s/.test(c)) continue;
      if (c === "(") { lead++; continue; }
      if (c === "{") { const e = matchBrace(text, i); if (e > 0) push(i, e); }
      break;
    }
    /* the conditional form: `return cond ? { … } : { … }` — both branches are
       outcomes. THE DEPTH TEST IS LOAD-BEARING and was added after measuring
       what its absence cost: without it, a `pair ? { … } : null` sitting inside
       a DETAIL ARGUMENT four calls deep was read as a returned branch and
       reported as an outcome the walk could not classify. A branch of the
       returned expression sits at the return's OWN depth and nowhere else. */
    const seg = text.slice(m.index, Math.min(text.length, m.index + 6000));
    if (!/^return\s*[^;{]{0,240}\?/.test(seg)) continue;
    let d = 0;
    for (let k = 6; k < seg.length; k++) {
      const c = seg[k];
      if (c === '"' || c === "'" || c === "`") { k = skipString(seg, k); continue; }
      if (c === "(" || c === "[") { d++; continue; }
      if (c === ")" || c === "]") { d--; continue; }
      if (c === ";" && d <= lead) break;
      if (c === "{" && d === lead && /[?:]\s*$/.test(seg.slice(Math.max(0, k - 40), k))) {
        const e = matchBrace(seg, k);
        if (e > 0) { push(m.index + k, m.index + e); k = e; }
      }
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

/* The depth-0 `key: value` pairs of an object literal. */
function topLevelProps(objText) {
  const parts = [];
  let buf = "", depth = 0;
  for (let i = 1; i < objText.length - 1; i++) {
    const c = objText[i];
    if (c === '"' || c === "'" || c === "`") { const j = skipString(objText, i); buf += objText.slice(i, j + 1); i = j; continue; }
    if (c === "/" && objText[i + 1] === "*") { const j = objText.indexOf(CLOSE_COMMENT, i + 2); i = j < 0 ? objText.length : j + 1; continue; }
    if (c === "/" && objText[i + 1] === "/") { const j = objText.indexOf("\n", i); i = j < 0 ? objText.length : j; continue; }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    if (c === "," && depth === 0) { parts.push(buf); buf = ""; continue; }
    buf += c;
  }
  parts.push(buf);
  const props = [];
  for (const p of parts) {
    const m = /^\s*([A-Za-z_$][\w$]*)\s*:([\s\S]*)$/.exec(p);
    if (m) props.push({ key: m[1], value: m[2] });
  }
  return props;
}

/* IS THIS VALUE BOOLEAN-SHAPED? */
function verdictKind(value) {
  const s = value.trim();
  if (s === "true") return "true";
  if (s === "false") return "false";
  if (/^!/.test(s)) return "expr";
  if (/^Boolean\s*\(/.test(s)) return "expr";
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'" || c === "`") { i = skipString(s, i); continue; }
    if (c === "(" || c === "[" || c === "{") { d++; continue; }
    if (c === ")" || c === "]" || c === "}") { d--; continue; }
    if (d) continue;
    if (c === "=" && s[i + 1] === ">") { i++; continue; }
    if ((c === "=" || c === "!") && s[i + 1] === "=") return "expr";
    if ((c === "<" || c === ">") && s[i - 1] !== "=" && s[i + 1] !== "=") return "expr";
  }
  return null;
}

/* THE VERDICT IS THE FIRST BOOLEAN-SHAPED TOP-LEVEL PROPERTY. */
function verdictOf(objText) {
  for (const p of topLevelProps(objText)) {
    const kind = verdictKind(p.value);
    if (kind) return { key: p.key, kind };
  }
  return null;
}

/* ---------------------------------------------------------------------------
 * THE DRIFT PIN.
 *
 * Both copies are TOP-LEVEL function declarations, so the extractor is the
 * dumbest thing that cannot be wrong about a brace inside a string: from
 * `\nfunction NAME(` to the next `\n}` in column zero. It is applied to BOTH
 * files, so a mis-extraction cannot make two different texts look equal — it
 * would have to mis-extract both the same way, and the LENGTH FLOOR below
 * refuses a truncation that silently compares two short strings.
 *
 * A MISSING function is reported as a difference, never skipped. That is the
 * `e3b0c442…` lesson: a comparison over nothing agrees for free.
 * ------------------------------------------------------------------------ */
const SHARED_FNS = ["skipString", "matchBrace", "outcomeReturns", "topLevelProps", "verdictKind", "verdictOf"];
/* The measured size of the six functions on the day this file landed. A floor,
   not a target: it may rise when REC-76's reader grows, and it exists so that a
   comparison of two EMPTY extractions cannot read as agreement. */
const DRIFT_MIN_CHARS = 4000;

function fnSource(src, name) {
  const i = src.indexOf(`\nfunction ${name}(`);
  if (i < 0) return null;
  const j = src.indexOf("\n}\n", i);
  return j < 0 ? null : src.slice(i + 1, j + 3);
}

/* `{ differing: [names], chars, read: n }` — `differing` empty means the six
   functions are byte-identical in both files. `chars` is what was extracted
   from THIS file, so a caller can floor it. */
function readerDrift(guardSrc, thisSrc) {
  const differing = [];
  let chars = 0, read = 0;
  for (const name of SHARED_FNS) {
    const a = fnSource(guardSrc, name);
    const b = fnSource(thisSrc, name);
    if (b) { chars += b.length; read++; }
    if (a === null || b === null || a !== b) differing.push(name);
  }
  return { differing, chars, read, expected: SHARED_FNS.length, minChars: DRIFT_MIN_CHARS };
}

export { skipString, matchBrace, outcomeReturns, topLevelProps, verdictKind, verdictOf,
         readerDrift, fnSource, SHARED_FNS, DRIFT_MIN_CHARS };
