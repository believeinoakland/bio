/* WALK-DERIVED FLOORS, FOUND BY DATA FLOW RATHER THAN BY CO-LOCATION.  M0-21 / D-268.
 *
 * ------------------------------------------------------------------ the defect
 *
 * M0-16's class census in `test/hygiene.test.mjs` grades a file by whether THAT
 * FILE contains a literal `readdirSync(`.  Every guarded/named judgement it makes
 * is therefore about a file that WALKS.  When the WALK and the FLOOR live in
 * DIFFERENT FILES the census names the walking file and never enumerates the file
 * carrying the floors behind it.
 *
 * THE MEASURED INSTANCE, and it is live in this repository rather than imagined:
 * `scripts/op-claims.mjs` walks the whole repository (`corpus()`), and
 * `test/op-claims.test.mjs` carries FOUR floors over what that walk found —
 * `files >= 300`, `chars >= 10_000_000`, `mentions >= 5000`, `names.length >= 150`.
 * `test/op-claims.test.mjs` contains NO `readdirSync` at all, so it appears in no
 * census row, and `scripts/op-claims.mjs` — which does appear — is named on the
 * allowlist with the words "reports a claim census", which is true of the walking
 * file and says nothing about the four ratcheted numbers one import away.
 *
 * WHY THIS IS A DIFFERENT KIND OF WORK FROM GUARDING AN INSTANCE.  Guarding one
 * floor protects one floor.  Closing the detector protects every future one.  This
 * is WORKER.md's *invert, do not lengthen a list* applied to the census itself: a
 * walk-derived floor is recognisable IN PRINCIPLE by the DATA FLOW from a walk to
 * a comparison, and not by the two happening to sit in one file.  A list of
 * spellings goes stale the moment a fourth is written; a data-flow question does
 * not.
 *
 * WHY THE PAYLOAD IS THE SAME ONE D-238 NAMED.  A floor is MOVED BY HAND to the
 * figure a green run PRINTED.  A floor set while a phantom was present is
 * permanently too high, fails every honest run afterwards, and gets switched off.
 * That is why a floor is the thing worth detecting and a bare REPORT is not.
 *
 * ---------------------------------------------------- the hard part, stated once
 *
 * A CHECK THAT CRIES WOLF GETS SWITCHED OFF.  That is `VERIFICATION.md`'s own
 * stated reason for not making `--strict` the gate yet, and crossing a module
 * boundary makes false positives much easier to produce.  The single measured
 * benign shape that decided this design is in `test/op-claims.test.mjs` itself:
 *
 *     import { sweep, corpus, mentionsIn, LEDGER, ... } from "../scripts/op-claims.mjs";
 *     ...
 *     t("...", [LEDGER.length >= 20, ...], ...);
 *
 * `LEDGER` is a STATIC exported array.  It is imported FROM A WALKING MODULE and it
 * is FLOORED.  A detector grading at MODULE granularity — "this file imports a
 * walking module and has a `>=`" — reports that line, and it is not a walk-derived
 * floor in any sense: no phantom deposited in any directory can move it.  So this
 * module grades at BINDING granularity, and it must first work out WHICH EXPORTS
 * OF A WALKING MODULE ARE ACTUALLY WALK-DERIVED.  `corpus` and `sweep` are;
 * `LEDGER`, `mentionsIn`, `routeOf` and `opReaching` are not.
 *
 * ------------------------------------------------------------------- what it is
 *
 * Three stages, each of which can be driven on its own:
 *
 *  1. STRIP.  Comments, string literals, template literals and regex literals are
 *     blanked (newlines preserved, so line numbers survive).  This is not tidiness.
 *     M0-16's census counts `readdirSync(` IN COMMENTS AND IN REGEX LITERALS — its
 *     own matcher, `/readdirSync\s*\(/g`, is itself such a literal — so its `walks`
 *     figure counts prose.  Grading a file by a word in its comments is the exact
 *     shape REC-70, REC-64 and M0-16's own first draft have each been an item
 *     about, and this module refuses to repeat it.
 *
 *  2. DERIVE.  Inside each module, find the top-level functions, mark the ones
 *     whose body reaches a WALK PRIMITIVE, and close that under calls to a
 *     FIXPOINT.  `sweep()` is walk-derived because it calls `corpus()`, which
 *     calls `readdirSync`.  Module-level `export const X = corpus()` is
 *     walk-derived too.
 *
 *  3. FLOW.  In every consumer, resolve relative imports, seed the locals bound to
 *     walk-derived exports, propagate through `const x = f(...)` and destructuring
 *     to a fixpoint, then find COMPARISONS one of whose operands roots in a seeded
 *     binding.  A comparison against a positive numeric literal in the direction
 *     that makes the walk figure a MINIMUM is a FLOOR.  A comparison against 0 is a
 *     CEILING-AT-ZERO and is NOT reported — D-257 established that shape fails in
 *     the SAFE direction, because a phantom deposited beside it makes the suite go
 *     RED rather than quietly green.
 *
 * ------------------------------------------ WHAT THIS MATCHER CAN AND CANNOT SEE
 *
 * That sentence is load-bearing.  It is what lets the next reader tell a clean
 * result from a walk looking in the wrong place, and a matcher that hides its blind
 * spots is read as though it had none.
 *
 * CAN SEE:
 *  - `readdirSync`, `readdir`, `opendirSync`, `opendir`, `globSync`, `glob` and
 *    `readdirSync` reached as a member (`fs.readdirSync`) — the WALK PRIMITIVES
 *    below.  `fs/promises` `readdir` was invisible to every census before this one.
 *  - walk-derivation through any depth of same-module function calls.
 *  - `import { corpus }`, `import { corpus as walkIt }` (RENAMES), `import * as ns`
 *    followed by `ns.corpus(...)`, and default imports.
 *  - propagation through `const r = sweep()`, `const { files } = corpus()`,
 *    `const n = sweep().files`, and one further hop (`const m = n`).
 *  - the difference between a FLOOR (`>= 300`), a CEILING AT ZERO (`=== 0`) and a
 *    comparison it cannot classify — the third is PRINTED as UNKNOWN and never
 *    silently scored zero.
 *
 * CANNOT SEE, and each of these is a real gap rather than a hedge:
 *  - A RE-EXPORT CHAIN.  If module A `export * from B` and B walks, a consumer of A
 *    is not connected to the walk.  Measured on this estate: zero such chains among
 *    the walking modules, so the gap costs nothing TODAY and is stated because that
 *    can change in one line.
 *  - `require()`, `await import()` and any dynamic specifier.
 *  - A walk reached through a value passed as an ARGUMENT (`run(readdirSync)`), or
 *    a walk in a shell script, in another language, or behind a library this
 *    primitive list does not name.
 *  - Flow THROUGH a data structure — `arr.push(sweep()); arr[0].files >= 300` — and
 *    flow through a function PARAMETER inside the consumer.
 *  - LEXICAL SCOPE.  The flow is a regex fixpoint over a whole file, so a local
 *    and a parameter sharing a name are the same binding to it.  D-302 narrowed
 *    the FALSE-POSITIVE half of that — a name BOUND as a parameter in an
 *    expression no longer seeds from it, which removed 5 sites, 3 ceilings and 16
 *    unclassified rows on this estate, every one of them a suite's own local.  The
 *    other half remains: two same-named locals in different blocks are still one.
 *  - WHICH walk of a multi-walk module a figure came from.  D-302 reads the
 *    `walkResult()` bucket declarations per MODULE and merges them, because the
 *    flow does not always know which export produced the value.  A key two calls
 *    declare differently is reported as a CONFLICT, never guessed at.
 *  - Whether the directory walked is a REPOSITORY directory or a `mkdtemp` SANDBOX.
 *    That judgement is the same one M0-16's named list carries, made by reading each
 *    site, and it is why this module's output is a ratchet with a NAMED list rather
 *    than a verdict.
 *  - Anything outside the roots it is handed.  It PRINTS its corpus and its reach.
 */

import { readdirSync, readFileSync, lstatSync } from "node:fs";
import { join, relative, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

/* ---- D-302 · HOW A SITE IS GRADED, AND WHY THE OLD PREDICATE WAS WRONG -------
 *
 * THE DEFECT WAS INSIDE THIS MODULE AND IT ANSWERED ABOUT THE WRONG FILE.  Until
 * 2026-09-10 a floor site's `guarded` column was this regex:
 *
 *     /^\s*import\s[^\n]*["'][^"'\n]*provenance\.mjs["']/m
 *
 * asked of the file the FLOOR is in.  That is a question about a module's import
 * list, and the thing being graded is a FIGURE.  Measured on this estate, it was
 * wrong in BOTH directions at once:
 *
 *   - `test/op-claims.test.mjs` graded UNGUARDED for all five of its floors, and
 *     four of them are floored on `filesRepro` / `charsRepro` / `mentionsRepro` /
 *     `namesRepro` — figures counted over `git ls-tree HEAD`, which is D-257's
 *     guard exactly.  The file simply does not import `provenance.mjs`; the WALK
 *     does, one module away.
 *   - `test/hygiene.test.mjs` graded GUARDED for all ELEVEN of its sites, several
 *     of which floor on figures the walk itself declares WORKING-TREE and which
 *     say so in a named constant at their own site.  The file imports
 *     `provenance.mjs` for an unrelated arm, and that was the whole basis.
 *
 * THAT IS ALSO HOW THE RECORD CAME TO BELIEVE D-265's "both instances are already
 * GUARDED" — right for four floors and wrong for the fifth, with no instrument
 * able to tell the two states apart.  A predicate that answers about the wrong
 * file cannot.
 *
 * SO THE GRADE IS READ OFF THE CLASSIFICATION D-265 PUT ON THE VALUE.  Every walk
 * that publishes through `walkResult()` declares each figure into exactly one of
 * four buckets, and the bucket is the answer to the question this column is asking:
 *
 *   reproducible  -> GUARDED.      The figure is the HEAD-restricted count.  A
 *                                  floor on it is the CORRECT act (D-257).
 *   workingTree   -> WORKING-TREE. An uncommitted arrival moves it.  Not guarded;
 *                                  a floor here must be a NAMED decision.
 *   safe          -> SAFE-BUCKET.  Declared safe because callers PIN it or assert
 *                                  it EMPTY — which is a reason a floor is not.
 *   data          -> UNCLASSIFIED. Not a figure.
 *
 * AND WHAT IT CANNOT RESOLVE IT SAYS SO ABOUT, rather than grading it.  A walk
 * publishing no `walkResult()` declaration, a comparison reading the whole result
 * instead of a declared key, a key two modules disagree about — each comes back
 * UNCLASSIFIED with the reason attached, and UNCLASSIFIED is NOT guarded, so it
 * still has to be NAMED.  The unsafe direction is not reachable by a silence.
 *
 * WHAT THIS STILL CANNOT DO, stated because a grade that hides its limits is read
 * as though it had none: the buckets are read from SOURCE, per module, MERGED
 * across every `walkResult()` call in it.  A module whose two walks declared the
 * same key into different buckets is reported as a CONFLICT rather than guessed
 * at, and a key resolved through a hop this flow does not model comes back
 * UNCLASSIFIED.  The RUNTIME half of the same question — the brand in
 * `walkfigure.mjs`, which refuses the floor at the site — has none of those
 * limits and is the reason this one is allowed to have them. */

/* GUARDED, and by its OWN rule rather than as a formality.  This module walks
   directories it does not control, and `hygiene.test.mjs` FLOORS on what it
   returns — so by stage 3 above it is itself one half of a cross-file
   walk-derived floor.  It asks `provenance.mjs` the same question every other
   guarded walk asks, and hands the answer up so a site found only in an
   UNTRACKED file is labelled rather than counted silently.  NOTE, since the
   paragraph above just removed that import's role as a GRADE: asking provenance
   is still what makes this walk's own output honest about tracked-ness.  It was
   never a bad thing to do — it was a bad thing to grade a third party's floor by. */
import { readGitProvenance, stateOf, repoPath } from "./provenance.mjs";
/* D-265: this module's own result carries its classification — see the return of
   `sweepWalkFloors` for why the detector applies the brand to itself. */
import { walkResult } from "./walkfigure.mjs";

/* The reason this module's own CLI report unwraps. A report is not a floor. */
const REPORTING_ONLY =
  "a REPORT of what the walk found, printed for a reader and floored on by nobody; "
  + "the reach floors that DO exist are in hygiene.test.mjs and say so at their own site";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLANE = join(HERE, "..");
export const REPO = join(PLANE, "..");

/* The walk primitives.  A NAME here is what makes a function a walk; the list is
   the one thing in this module that is a list of spellings, and it is deliberately
   the SMALLEST such surface — everything downstream of it is derived rather than
   enumerated.  `readFileSync` is NOT here: reading a named file is not discovering
   what a directory contains, and the exposure this module is about is discovery. */
export const WALK_PRIMITIVES = [
  "readdirSync", "readdir", "opendirSync", "opendir", "globSync",
];

/* The roots M0-16's census reaches, kept identical ON PURPOSE so the two
   instruments are comparable and a difference between them is a finding about the
   estate rather than about the roots. */
export const CENSUS_ROOTS = [["bio-plane", ["scripts", "test", "src", "checks", "migrate"]],
                             ["civicos-ui", [".", "test"]]];

/* ------------------------------------------------------------- 1. THE STRIPPER */

/* Blank comments, strings, template literals and regex literals, preserving length
   AND newlines so every offset and line number in the original still addresses the
   same place.  Returns a string of the same length.
 *
 * `strings: false` keeps string and template literals INTACT and blanks only
 * comments and regex literals.  THAT MODE EXISTS BECAUSE OF A SECOND MEASURED BUG
 * IN THIS MODULE'S OWN FIRST DRAFT, and it is the same failure as the first one
 * wearing different clothes.  `importsOf` and the `guarded` test both ask about
 * text that lives INSIDE A STRING LITERAL — an import specifier
 * (`"../scripts/op-claims.mjs"`) and the `provenance.mjs` path — and both were
 * being run over source in which every string had been blanked.  `importsOf`
 * returned `[]` for every file in the estate and `guarded` was FALSE for every
 * file in the estate, so the sweep reported CROSS-FILE FLOORS: 0 while its own
 * flow stage, driven directly, found all four of `op-claims.test.mjs`'s floors.
 * TWO SEPARATE DEFECTS IN ONE INSTRUMENT, BOTH OF WHICH PRODUCED A CLEAN REPORT.
 * That is the whole reason this item's controls drive the REAL split rather than
 * only a fixture: a fixture-only arm would have agreed with both bugs. */
export function strip(src, { strings = true } = {}) {
  const n = src.length;
  const out = new Array(n);
  for (let k = 0; k < n; k++) out[k] = src[k] === "\n" ? "\n" : src[k];
  const blank = (a, b) => { for (let k = a; k < b && k < n; k++) if (out[k] !== "\n") out[k] = " "; };

  let i = 0;
  let prev = "";                       // last significant character, for the regex heuristic
  const REGEX_OK_AFTER = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "~", "^", "<", ">", "\n"]);

  while (i < n) {
    const c = src[i], d = src[i + 1];

    if (c === "/" && d === "/") {                       // line comment
      let j = i; while (j < n && src[j] !== "\n") j++;
      blank(i, j); i = j; continue;
    }
    if (c === "/" && d === "*") {                       // block comment
      let j = i + 2; while (j < n && !(src[j] === "*" && src[j + 1] === "/")) j++;
      j = Math.min(j + 2, n); blank(i, j); i = j; continue;
    }
    if (c === '"' || c === "'") {                       // string literal
      let j = i + 1;
      while (j < n && src[j] !== c) { if (src[j] === "\\") j++; j++; }
      j = Math.min(j + 1, n); if (strings) blank(i, j); i = j; prev = "x"; continue;
    }
    if (c === "`") {                                    // template literal, interpolations included
      let j = i + 1, depth = 0;
      while (j < n) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === "$" && src[j + 1] === "{") { depth++; j += 2; continue; }
        if (depth > 0 && src[j] === "}") { depth--; j++; continue; }
        if (depth === 0 && src[j] === "`") break;
        j++;
      }
      j = Math.min(j + 1, n); if (strings) blank(i, j); i = j; prev = "x"; continue;
    }
    if (c === "/" && REGEX_OK_AFTER.has(prev)) {        // regex literal (heuristic, stated above)
      let j = i + 1, cls = false, ok = false;
      while (j < n && src[j] !== "\n") {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === "[") cls = true;
        else if (src[j] === "]") cls = false;
        else if (src[j] === "/" && !cls) { ok = true; break; }
        j++;
      }
      if (ok) {
        j++; while (j < n && /[a-z]/.test(src[j])) j++;   // flags
        blank(i, j); i = j; prev = "x"; continue;
      }
    }
    if (!/\s/.test(c)) prev = c;
    else if (c === "\n") prev = prev === "" ? "" : prev;
    i++;
  }
  return out.join("");
}

/* Comments and regex literals blanked, STRING LITERALS KEPT.  The two questions
   whose answer lives inside a string — "what does this file import" and "does it
   ask `provenance.mjs`" — are asked over this and never over the full strip. */
export const stripComments = (src) => strip(src, { strings: false });

/* ------------------------------------------------------ 2. WALK DERIVATION */

/* Brace-match forward from the first `{` at or after `from`.  The same reader
   `op-claims.mjs` and `coverage.mjs` already use, over STRIPPED source so a brace
   inside a string or a comment cannot throw it off — which is the one thing that
   makes brace matching safe here. */
function braceBody(s, from) {
  const i = s.indexOf("{", from);
  if (i < 0) return null;
  let depth = 0;
  for (let p = i; p < s.length; p++) {
    if (s[p] === "{") depth++;
    else if (s[p] === "}") { depth--; if (depth === 0) return { start: i + 1, end: p }; }
  }
  return null;
}

const IDENT = "[A-Za-z_$][A-Za-z0-9_$]*";

/* --------------------------------------------- D-302 · THE BUCKET DECLARATION */

export const WALK_BUCKETS = ["workingTree", "reproducible", "safe", "data"];

/* The top-level property NAMES of an object-literal body, split on commas at depth
   zero so a nested object, array or call cannot contribute a key.  Shorthand
   (`chars`) and long form (`files: files.length`) both resolve to the same name,
   which is the point: the DECLARATION is a set of names and the values are not
   read at all. */
function literalKeys(body) {
  const keys = [];
  let depth = 0, start = 0;
  const parts = [];
  for (let p = 0; p <= body.length; p++) {
    const c = body[p];
    if (p === body.length || (c === "," && depth === 0)) { parts.push(body.slice(start, p)); start = p + 1; continue; }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
  }
  for (const part of parts) {
    const m = part.match(new RegExp(`^\\s*(${IDENT})\\s*(:|$)`));
    if (m) keys.push(m[1]);
  }
  return keys;
}

/* Brace-match the object literal that is the sole argument of every
   `walkResult({ ... })` call in this module, and read the four bucket key sets out
   of it.  Over STRIPPED source, so a `walkResult(` written in a comment — this
   module's own header contains several — cannot contribute a declaration.  That is
   the same trap M0-16's census fell into and REC-70, REC-64 and this module's own
   first draft each paid for separately. */
export function bucketsOf(stripped) {
  const out = { declared: false, calls: 0, conflicts: new Set() };
  for (const b of WALK_BUCKETS) out[b] = new Set();

  const re = /(^|[^A-Za-z0-9_$.])walkResult\s*\(/g;
  for (let m; (m = re.exec(stripped));) {
    /* `export function walkResult({ about, workingTree = {}, ... })` is the
       DEFINITION, in `walkfigure.mjs`, and reading its destructured parameter list
       as a declaration would make the chokepoint module declare every bucket name
       as a key of itself. Measured: it contributes no keys anyway (the parameters
       use `=`, not `:`), but it would set `declared`, which is the field the grade
       turns on. Excluded structurally. */
    if (/\bfunction\s*$/.test(stripped.slice(Math.max(0, m.index - 24), m.index + m[0].length - "walkResult(".length))) continue;
    const arg = braceBody(stripped, m.index + m[0].length - 1);
    if (!arg) continue;
    out.declared = true; out.calls++;
    const body = stripped.slice(arg.start, arg.end);
    /* the buckets are top-level properties of that argument; each one's own body
       is brace-matched from its colon so a bucket is read as a whole */
    for (const bucket of WALK_BUCKETS) {
      const bre = new RegExp(`(^|[^A-Za-z0-9_$.])${bucket}\\s*:`, "g");
      for (let bm; (bm = bre.exec(body));) {
        const inner = braceBody(body, bm.index + bm[0].length - 1);
        if (!inner) continue;
        for (const k of literalKeys(body.slice(inner.start, inner.end))) {
          for (const other of WALK_BUCKETS)
            if (other !== bucket && out[other].has(k)) out.conflicts.add(k);
          out[bucket].add(k);
        }
        break;                          // the FIRST `bucket:` in this call is its declaration
      }
    }
  }
  return out;
}

/* The grade a comparison earns, from the bucket its figure was declared into.
   `key` is the property of the walk result the comparison reads; `null` means the
   flow could not name one, which is a finding and not a pass. */
export function gradeOf(buckets, key, originRel) {
  if (!buckets || !buckets.declared)
    return { grade: "UNCLASSIFIED", key,
      why: `${originRel} publishes no walkResult() declaration, so nothing on the value says which population it counts` };
  if (!key)
    return { grade: "UNCLASSIFIED", key,
      why: "the comparison reads a binding this flow could not resolve to a declared figure" };
  if (buckets.conflicts.has(key))
    return { grade: "UNCLASSIFIED", key,
      why: `'${key}' is declared into two different buckets by ${originRel}'s walkResult() calls` };
  if (buckets.reproducible.has(key))
    return { grade: "GUARDED", key,
      why: `'${key}' is declared REPRODUCIBLE — counted over git ls-tree HEAD, so a phantom cannot move it` };
  if (buckets.workingTree.has(key))
    return { grade: "WORKING-TREE", key,
      why: `'${key}' is declared WORKING-TREE — an uncommitted arrival moves it, and only UP` };
  if (buckets.safe.has(key))
    return { grade: "SAFE-BUCKET", key,
      why: `'${key}' is declared SAFE because callers PIN it or assert it EMPTY; a FLOOR is neither` };
  if (buckets.data.has(key))
    return { grade: "UNCLASSIFIED", key, why: `'${key}' is declared DATA — not a figure at all` };
  return { grade: "UNCLASSIFIED", key,
    why: `'${key}' is not a figure ${originRel}'s walkResult() declares` };
}

/* Balance forward from the `(` at `openIdx`, returning the index AFTER its `)`.
   THIS EXISTS BECAUSE OF A MEASURED BUG IN THIS MODULE'S OWN FIRST DRAFT, and the
   bug is worth keeping written down because it made the instrument report a clean
   estate.  `braceBody` was called from the end of `function NAME(`, so for a
   function whose parameters are DESTRUCTURED — `sweep({ root = REPO, ... })`, and
   `sweepWalkFloors({ repo = REPO, ... })` in this very file — the first `{` found
   was the PARAMETER OBJECT and the "body" was the parameter list.  `sweep` then
   never appeared to call `corpus()`, the walk-derivation fixpoint stopped one hop
   short, and the sweep reported CROSS-FILE FLOORS: 0 over an estate that has four.
   A green result from a detector that reached nothing is the exact failure this
   item exists to close, met inside the item. */
function afterParams(s, openIdx) {
  let depth = 0;
  for (let p = openIdx; p < s.length; p++) {
    if (s[p] === "(") depth++;
    else if (s[p] === ")") { depth--; if (depth === 0) return p + 1; }
  }
  return openIdx;
}

/* Every named top-level function-like binding, with the span of its body. */
export function functionsOf(stripped) {
  const found = [];
  const seen = new Set();
  const push = (name, body, exported) => {
    if (!name || !body || seen.has(name)) return;
    seen.add(name);
    found.push({ name, start: body.start, end: body.end, exported });
  };

  /* `function NAME(...) {` and `export function NAME(...) {` (async or not) */
  const fnRe = new RegExp(`(^|\\n)\\s*(export\\s+)?(async\\s+)?function\\s+(${IDENT})\\s*\\(`, "g");
  for (let m; (m = fnRe.exec(stripped));) {
    const body = braceBody(stripped, afterParams(stripped, m.index + m[0].length - 1));
    push(m[4], body, Boolean(m[2]));
  }
  /* `const NAME = (...) => {` / `= function` / `= async (...) =>` */
  const arrowRe = new RegExp(`(^|\\n)\\s*(export\\s+)?(?:const|let|var)\\s+(${IDENT})\\s*=\\s*(async\\s*)?(?:function\\s*)?\\(`, "g");
  for (let m; (m = arrowRe.exec(stripped));) {
    const body = braceBody(stripped, afterParams(stripped, m.index + m[0].length - 1));
    push(m[3], body, Boolean(m[2]));
  }
  return found;
}

/* Does this span call a walk primitive directly? */
function callsPrimitive(span) {
  return WALK_PRIMITIVES.some((p) => new RegExp(`(^|[^A-Za-z0-9_$.])${p}\\s*\\(`).test(span)
                                  || new RegExp(`\\.\\s*${p}\\s*\\(`).test(span));
}

/* The exported names of a module, and which of them are WALK-DERIVED.
   Walk-derivation is closed under same-module calls to a FIXPOINT, so `sweep` is
   walk-derived because it calls `corpus`, which calls `readdirSync`. */
export function moduleFacts(src) {
  const s = strip(src);
  const fns = functionsOf(s);
  const derived = new Set();

  for (const f of fns) if (callsPrimitive(s.slice(f.start, f.end))) derived.add(f.name);

  for (let pass = 0; pass < 12; pass++) {
    let grew = false;
    for (const f of fns) {
      if (derived.has(f.name)) continue;
      const body = s.slice(f.start, f.end);
      for (const d of derived) {
        if (new RegExp(`(^|[^A-Za-z0-9_$.])${d}\\s*\\(`).test(body)) { derived.add(f.name); grew = true; break; }
      }
    }
    if (!grew) break;
  }

  /* Module-level `export const X = <call to a derived fn>` — a walk result bound to
     a constant is exactly as walk-derived as the call that produced it. */
  const constRe = new RegExp(`(^|\\n)\\s*export\\s+(?:const|let|var)\\s+(${IDENT})\\s*=\\s*([^;\\n]*)`, "g");
  for (let m; (m = constRe.exec(s));) {
    for (const d of derived) {
      if (new RegExp(`(^|[^A-Za-z0-9_$.])${d}\\s*\\(`).test(m[3])) { derived.add(m[2]); break; }
    }
  }

  /* The exported surface: `export function/const NAME` and `export { a, b as c }`. */
  const exported = new Set();
  const expDeclRe = new RegExp(`(^|\\n)\\s*export\\s+(?:async\\s+)?(?:function|const|let|var|class)\\s+(${IDENT})`, "g");
  for (let m; (m = expDeclRe.exec(s));) exported.add(m[2]);
  const expListRe = /(^|\n)\s*export\s*\{([^}]*)\}/g;
  for (let m; (m = expListRe.exec(s));) {
    for (const part of m[2].split(",")) {
      const bits = part.trim().split(/\s+as\s+/);
      if (bits[0]) exported.add((bits[1] || bits[0]).trim());
    }
  }

  const walks = WALK_PRIMITIVES.reduce((a, p) =>
    a + (s.match(new RegExp(`(^|[^A-Za-z0-9_$.])${p}\\s*\\(`, "g")) || []).length, 0);

  return {
    walks,
    exported,
    derivedExports: new Set([...derived].filter((d) => exported.has(d))),
    allDerived: derived,
    /* D-302 · THE CLASSIFICATION THIS MODULE'S OWN WALKS PUT ON THEIR FIGURES.
       This REPLACED a regex asking whether the file imports `provenance.mjs` —
       a question about an import list, used to grade a figure, and measured wrong
       in both directions on this estate. The header says which directions. */
    buckets: bucketsOf(s),
    /* KEPT, AND IT IS NO LONGER A GRADE. Whether a module asks `provenance.mjs`
       is still worth reporting about a WALK — a walk that never asks cannot say
       whether what it found is in any commit — but it is a fact about that
       module, not a verdict on a third party's floor. Named so it cannot be
       mistaken for the grade again. */
    importsProvenance: /^\s*import\s[^\n]*["'][^"'\n]*provenance\.mjs["']/m.test(stripComments(src)),
  };
}

/* ------------------------------------------------------------------ 3. THE FLOW */

/* Relative-specifier imports, with renames and namespace forms preserved. */
export function importsOf(stripped) {
  const out = [];
  const re = /(^|\n)\s*import\s+([^;]*?)\s+from\s*["']([^"']+)["']/g;
  for (let m; (m = re.exec(stripped));) {
    const clause = m[2].trim(), spec = m[3];
    if (!spec.startsWith(".")) continue;
    const names = [];               // {imported, local}
    let ns = null, def = null;

    const nsM = clause.match(new RegExp(`\\*\\s*as\\s+(${IDENT})`));
    if (nsM) ns = nsM[1];
    const braceM = clause.match(/\{([^}]*)\}/);
    if (braceM) {
      for (const part of braceM[1].split(",")) {
        const p = part.trim(); if (!p) continue;
        const bits = p.split(/\s+as\s+/);
        names.push({ imported: bits[0].trim(), local: (bits[1] || bits[0]).trim() });
      }
    }
    const defM = clause.match(new RegExp(`^(${IDENT})\\s*(,|$)`));
    if (defM) def = defM[1];
    out.push({ spec, names, ns, def });
  }
  return out;
}

/* The root identifier of the operand ENDING at `idx` (exclusive). */
function leftRoot(s, idx) {
  let j = idx - 1;
  while (j >= 0 && /\s/.test(s[j])) j--;
  const end = j + 1;
  let depth = 0;
  while (j >= 0) {
    const c = s[j];
    if (c === ")" || c === "]") { depth++; j--; continue; }
    if (c === "(" || c === "[") { if (depth === 0) break; depth--; j--; continue; }
    if (depth > 0) { j--; continue; }
    if (/[A-Za-z0-9_$.]/.test(c)) { j--; continue; }
    break;
  }
  const atom = s.slice(j + 1, end);
  const m = atom.match(new RegExp(`^\\s*(${IDENT})`));
  return { atom, root: m ? m[1] : null };
}

/* The root identifier of the operand STARTING at `idx`. */
function rightRoot(s, idx) {
  let j = idx;
  while (j < s.length && /\s/.test(s[j])) j++;
  const start = j;
  let depth = 0;
  while (j < s.length) {
    const c = s[j];
    if (c === "(" || c === "[") { depth++; j++; continue; }
    if (c === ")" || c === "]") { if (depth === 0) break; depth--; j++; continue; }
    if (depth > 0) { j++; continue; }
    if (/[A-Za-z0-9_$.]/.test(c)) { j++; continue; }
    break;
  }
  const atom = s.slice(start, j);
  const m = atom.match(new RegExp(`^(${IDENT})`));
  return { atom, root: m ? m[1] : null };
}

const NUM = /^\s*(-?\d[\d_]*(?:\.\d+)?)\s*$/;
const numOf = (a) => { const m = a.match(NUM); return m ? Number(m[1].replace(/_/g, "")) : null; };

/* Every comparison in the source, with both operand roots and the operator. */
export function comparisonsOf(stripped) {
  const out = [];
  const re = /(===|!==|==|!=|>=|<=|>|<)/g;
  for (let m; (m = re.exec(stripped));) {
    const op = m[1], at = m.index;
    /* skip arrows, shifts and the `=>` / `<<` / `>>` family */
    if (stripped[at - 1] === "=" || stripped[at - 1] === "<" || stripped[at - 1] === ">") continue;
    if (op === ">" && stripped[at + 1] === "=") continue;
    if (op === "<" && stripped[at + 1] === "=") continue;
    if (op === ">" && stripped[at - 1] === "=") continue;
    if (op === "<" && (stripped[at + 1] === "<" || stripped[at - 1] === "<")) continue;
    if (op === ">" && (stripped[at + 1] === ">" || stripped[at - 1] === ">")) continue;
    const L = leftRoot(stripped, at);
    const R = rightRoot(stripped, at + op.length);
    const line = stripped.slice(0, at).split("\n").length;
    out.push({ op, at, line, left: L, right: R });
  }
  return out;
}

/* The locals in a consumer that carry a walk-derived value, to a fixpoint.
 *
 * D-302 · EACH LIVE LOCAL NOW CARRIES THE KEY IT ROOTS IN, because the grade is a
 * property of the FIGURE and a value that arrives with no key can only be graded
 * UNCLASSIFIED.  `const r = sweep()` carries no key — `r` is the whole result —
 * while `const { files } = corpus()`, `const n = sweep().files` and
 * `const x = r.sites.filter(...)` all carry one.  A local derived from a local that
 * already has a key INHERITS it, which is what lets `const m = realFigure; const n
 * = m;` still name `chars` two hops later.
 *
 * Returns a Map local -> { from, key }.  `from` is the walking module the value
 * came out of; `key` is the declared figure, or null when this flow could not name
 * one.  Null is a finding, not a pass — see `gradeOf`. */
export function seededLocals(stripped, seeds) {
  /* Seeds arrive either as a Map name -> { from, key } (the sweep, which knows
     both) or as a bare list of names (a suite driving this stage on its own, where
     neither is known and neither is needed). Normalised here rather than at each
     caller: this is an exported stage and `test/walkfloor.test.mjs` drives it with
     the list spelling, which D-302 would otherwise have broken with a TypeError
     inside the suite — a throw that goes through no assertion at all. */
  const live = new Map();             // name -> { from, key }
  for (const e of seeds ?? [])
    Array.isArray(e) ? live.set(e[0], e[1] ?? { from: null, key: null })
      : live.set(e, { from: null, key: null });

  /* D-302 · A NAME BOUND AS A PARAMETER INSIDE THE EXPRESSION IS NOT THE LIVE ONE.
   * This flow has no lexical scoping — it is a regex fixpoint over a whole file —
   * and that produced a measured FALSE POSITIVE on this estate rather than a
   * theoretical one.  `hygiene.test.mjs:2285` binds a live figure to `n`; 1,478
   * lines earlier, `const files = readdirSync(srcDir).filter((n) => n.endsWith(...))`
   * binds `n` as an ARROW PARAMETER.  The old matcher saw `n.` in that expression,
   * marked `files` walk-derived, and through `raw` -> `cat` -> `predBody` ->
   * `predEnd` carried SIX of that suite's own locals into the report.
   *
   * IT WAS INVISIBLE BEFORE THIS ITEM because the grade came from the file's import
   * list, so all six read GUARDED and nobody had to ask which figure they were
   * floors on.  The moment the grade is read off the FIGURE, a false positive stops
   * being a harmless extra row and becomes the report stating which population a
   * number counts when it counts nothing of the kind — a record claiming more than
   * it can support, which is worse here than a missing row.
   *
   * The rule is the shape of the defect inverted: if an expression BINDS the name,
   * the occurrences in it are the binding's.  It narrows only the cry-wolf
   * direction, which is the direction that gets a check switched off. */
  const shadows = (expr, nm) => {
    const re = new RegExp(`(?:\\(([^)]*)\\)|(${IDENT}))\\s*=>`, "g");
    for (let m; (m = re.exec(expr));) {
      const params = m[1] ?? m[2] ?? "";
      if (new RegExp(`(^|[^A-Za-z0-9_$.])${nm}($|[^A-Za-z0-9_$])`).test(params)) return true;
    }
    return false;
  };

  /* the live name this expression reads, and the member it takes off it */
  const readsLive = (expr) => {
    for (const [nm, info] of live) {
      if (shadows(expr, nm)) continue;
      const mem = new RegExp(`(^|[^A-Za-z0-9_$.])${nm}\\s*(?:\\([^;]*\\))?\\s*\\.\\s*(${IDENT})`).exec(expr);
      if (mem) return { from: info.from, key: info.key ?? mem[2] };
      if (new RegExp(`(^|[^A-Za-z0-9_$.])${nm}\\s*[(\\[]`).test(expr)
        || new RegExp(`(^|[^A-Za-z0-9_$.])${nm}\\s*$`).test(expr.trim()))
        return { from: info.from, key: info.key ?? null };
    }
    return null;
  };

  for (let pass = 0; pass < 8; pass++) {
    let grew = false;
    const simple = new RegExp(`(?:const|let|var)\\s+(${IDENT})\\s*=\\s*([^;\\n]*)`, "g");
    for (let m; (m = simple.exec(stripped));) {
      if (live.has(m[1])) continue;
      const info = readsLive(m[2]);
      if (info) { live.set(m[1], info); grew = true; }
    }
    const destr = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*([^;\n]*)/g;
    for (let m; (m = destr.exec(stripped));) {
      const info = readsLive(m[2]);
      if (!info) continue;
      for (const part of m[1].split(",")) {
        const nm = part.trim().split(/\s*:\s*/).pop().trim();
        /* destructuring a whole result NAMES the key; destructuring something that
           already has one keeps the parent's */
        if (nm && /^[A-Za-z_$]/.test(nm) && !live.has(nm)) {
          live.set(nm, { from: info.from, key: info.key ?? nm }); grew = true;
        }
      }
    }
    if (!grew) break;
  }
  return live;
}

/* The declared figure a comparison operand reads: the local's own key if it has
   one, otherwise the first member taken off the live root in the operand text. */
export function keyOfOperand(atom, root, info) {
  if (info && info.key) return info.key;
  const m = new RegExp(`(^|[^A-Za-z0-9_$.])${root}\\s*(?:\\([^)]*\\))?\\s*\\.\\s*(${IDENT})`).exec(atom);
  return m ? m[2] : null;
}

/* ------------------------------------------------------------------ THE SWEEP */

function listMjs(dir) {
  try { return readdirSync(dir).filter((n) => n.endsWith(".mjs")); } catch { return []; }
}

function resolveSpec(fromFile, spec) {
  const p = resolve(dirname(fromFile), spec);
  try { if (lstatSync(p).isFile()) return p; } catch { /* fallthrough */ }
  for (const ext of [".mjs", ".js"]) {
    try { if (lstatSync(p + ext).isFile()) return p + ext; } catch { /* next */ }
  }
  return null;
}

/**
 * Sweep the estate for CROSS-FILE walk-derived floors.
 *
 * Returns { corpus, walkModules, sites, unknowns, ceilings, provenance } where
 *   sites     — a floor whose value flows from a walk in ANOTHER file
 *   ceilings  — the same flow compared against 0 (fails safe; reported, not flagged)
 *   unknowns  — a comparison over a walk-derived binding this module could NOT
 *               classify.  PRINTED rather than scored zero.
 */
export function sweepWalkFloors({ repo = REPO, roots = CENSUS_ROOTS } = {}) {
  /* (a) read the corpus once */
  const files = [];
  for (const [top, subs] of roots) {
    for (const sub of subs) {
      const d = join(repo, top, sub);
      for (const n of listMjs(d)) files.push(join(d, n));
    }
  }
  files.sort();

  const src = new Map(), facts = new Map();
  for (const f of files) {
    let body; try { body = readFileSync(f, "utf8"); } catch { continue; }
    src.set(f, body);
    facts.set(f, moduleFacts(body));
  }

  const walkModules = [...facts.entries()]
    .filter(([, v]) => v.walks > 0)
    .map(([f, v]) => ({ file: relative(repo, f), walks: v.walks,
                        importsProvenance: v.importsProvenance,
                        /* D-302: whether this walk CLASSIFIES what it publishes is
                           the fact every grade downstream depends on, so it is on
                           the roster rather than inferred at each site. */
                        classifies: v.buckets.declared,
                        reproducible: [...v.buckets.reproducible].sort(),
                        derived: [...v.derivedExports].sort() }));

  /* (b) the flow, per consumer */
  const sites = [], ceilings = [], unknowns = [];
  for (const f of files) {
    const body = src.get(f); if (body === undefined) continue;
    const s = strip(body);                       // flow/comparisons: strings blanked
    const si = stripComments(body);              // imports: specifiers are strings
    const seeds = new Map();          // local name -> {from, export}
    for (const imp of importsOf(si)) {
      const target = resolveSpec(f, imp.spec);
      if (!target || !facts.has(target)) continue;
      const tf = facts.get(target);
      if (tf.walks === 0) continue;
      if (target === f) continue;                       // same file: M0-16's census already sees it
      for (const nm of imp.names)
        if (tf.derivedExports.has(nm.imported)) seeds.set(nm.local, { from: target, exp: nm.imported });
      if (imp.ns) {
        /* `ns.corpus(...)` — seed the MEMBER spelling actually used */
        for (const d of tf.derivedExports)
          if (new RegExp(`\\b${imp.ns}\\s*\\.\\s*${d}\\s*\\(`).test(s))
            seeds.set(`${imp.ns}.${d}`, { from: target, exp: d });
      }
    }
    if (!seeds.size) continue;

    /* the namespace root is live wherever a walk-derived member is called off it */
    const flowSeeds = new Map();
    for (const [k, v] of seeds) flowSeeds.set(k.includes(".") ? k.split(".")[0] : k, { from: v.from, key: null });
    const live = seededLocals(s, flowSeeds);

    for (const c of comparisonsOf(s)) {
      const lRoot = c.left.root, rRoot = c.right.root;
      const lLive = lRoot && live.has(lRoot);
      const rLive = rRoot && live.has(rRoot);
      if (!lLive && !rLive) continue;

      const lNum = numOf(c.left.atom), rNum = numOf(c.right.atom);
      const rel = relative(repo, f);
      const origin = [...seeds.values()].map((v) => relative(repo, v.from));
      /* D-302 · THE GRADE, READ OFF THE FIGURE RATHER THAN OFF THIS FILE'S
         IMPORTS. The side that is live is the side carrying the walk value; the
         key it reads decides the bucket, and the bucket decides the grade. */
      const liveRoot = lLive ? lRoot : rRoot;
      const liveAtom = lLive ? c.left.atom : c.right.atom;
      /* A ROOT THE FLOW DOES NOT KNOW IS GRADED UNCLASSIFIED, NOT DEREFERENCED.
         Measured, not defensive: the `modulegrain` control arm widens `lLive` /
         `rLive` to every identifier, so the root is by construction absent from
         `live` — and the first draft of this grade read `info.from` straight off
         `undefined`, killing `hygiene.test.mjs` with a TypeError that went through
         no assertion at all and reported NO tally rather than a low one. The arm
         came back NOT AS DECLARED and the instrument was wrong, not the arm. */
      const info = live.get(liveRoot) ?? { from: null, key: null };
      const key = keyOfOperand(liveAtom, liveRoot, info);
      const originRel = info.from ? relative(repo, info.from) : "(no walking module resolved)";
      const g = gradeOf(info.from ? facts.get(info.from)?.buckets : null, key, originRel);
      const row = { file: rel, line: c.line, op: c.op,
                    expr: `${c.left.atom.trim()} ${c.op} ${c.right.atom.trim()}`.trim(),
                    from: [...new Set(origin)].sort(),
                    origin: originRel, key: g.key, grade: g.grade, why: g.why,
                    guarded: g.grade === "GUARDED" };

      /* a comparison against 0 is a CEILING AT ZERO — fails safe (D-257) */
      if ((lLive && rNum === 0) || (rLive && lNum === 0)) { ceilings.push(row); continue; }

      const floorL = lLive && rNum !== null && rNum > 0 && (c.op === ">=" || c.op === ">");
      const floorR = rLive && lNum !== null && lNum > 0 && (c.op === "<=" || c.op === "<");
      if (floorL || floorR) { sites.push(row); continue; }

      unknowns.push({ ...row, why: (lNum === null && rNum === null)
        ? "neither side is a numeric literal" : `operator ${c.op} in this direction` });
    }
  }

  const prov = readGitProvenance(repo);
  const tracked = (rel) => prov.inHead === null ? "UNVERIFIED" : stateOf(prov, rel);
  for (const arr of [sites, ceilings, unknowns]) for (const r of arr) r.state = tracked(r.file);

  /* D-265 · THE DETECTOR CLASSIFIES ITS OWN RESULT, and this is the cheapest
     evidence available that the brand reaches real code rather than only its own
     fixtures: `hygiene.test.mjs` FLOORS on the two REACH figures below, one import
     away, so by this module's own stage 3 it is one half of a cross-file
     walk-derived floor. Those two figures are counted over the WORKING TREE — a
     module nobody committed inflates both — so they are branded, and the guarded
     consumer now has to say at its own site that it knows which population it is
     flooring on. The three finding lists are `safe` for a stated reason rather than
     by omission. */
  return walkResult({
    about: "walkfloor sweepWalkFloors() — the .mjs estate under CENSUS_ROOTS",
    workingTree: {
      corpus: files.map((f) => relative(repo, f)),
      walkModules,
    },
    safe: {
      sites: [sites, "every member is enumerated BY NAME and ratcheted GUARDED-or-NAMED, so "
        + "an arrival is a named decision rather than a number somebody moves"],
      ceilings: [ceilings, "reported only; a ceiling at zero already fails in the safe "
        + "direction, which is why it is not a site (D-257)"],
      unknowns: [unknowns, "PRINTED member by member and never scored; a growth here is read "
        + "as a narrowed unknown, not as a figure to floor on"],
    },
    data: { provenance: prov.inHead === null ? "UNVERIFIED" : "VERIFIED" },
  });
}

/* Run directly for a report: `node scripts/walkfloor.mjs` */
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const r = sweepWalkFloors();
  console.log(`walkfloor: ${r.corpus.count} module(s) read · ${r.walkModules.count} walk `
    + `module(s) · provenance ${r.provenance}`);
  for (const w of r.walkModules.overWorkingTree(REPORTING_ONLY))
    console.log(`  WALK ${w.file} · ${w.walks} primitive call(s) · `
      + `${w.classifies ? `classifies (reproducible: ${w.reproducible.join(", ") || "none"})` : "NO walkResult() declaration"}`
      + ` · walk-derived exports: `
      + `${w.derived.length ? w.derived.join(", ") : "(none reachable from an export)"}`);
  console.log(`\n  CROSS-FILE FLOORS: ${r.sites.length}`
    + ` (${r.sites.filter((s) => s.guarded).length} GUARDED)`);
  /* D-302: the GRADE and the REASON, never a bare GUARDED/UNGUARDED. A column
     that cannot say WHY is a column the next reader has to re-derive, and this
     one spent a year saying the wrong thing without anybody being able to tell. */
  for (const s of r.sites)
    console.log(`    ${s.file}:${s.line}  ${s.expr}   <- ${s.origin} `
      + `[${s.grade}, ${s.state}] — ${s.why}`);
  console.log(`  CEILINGS AT ZERO (fail safe, not flagged): ${r.ceilings.length}`);
  for (const s of r.ceilings) console.log(`    ${s.file}:${s.line}  ${s.expr}`);
  console.log(`  UNCLASSIFIED comparisons over a walk-derived binding: ${r.unknowns.length}`);
  for (const s of r.unknowns) console.log(`    ${s.file}:${s.line}  ${s.expr}  — ${s.why}`);
}
