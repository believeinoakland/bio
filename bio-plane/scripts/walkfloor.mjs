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
 *  - Whether the directory walked is a REPOSITORY directory or a `mkdtemp` SANDBOX.
 *    That judgement is the same one M0-16's named list carries, made by reading each
 *    site, and it is why this module's output is a ratchet with a NAMED list rather
 *    than a verdict.
 *  - Anything outside the roots it is handed.  It PRINTS its corpus and its reach.
 */

import { readdirSync, readFileSync, lstatSync } from "node:fs";
import { join, relative, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

/* GUARDED, and by its OWN rule rather than as a formality.  This module walks
   directories it does not control, and `hygiene.test.mjs` FLOORS on what it
   returns — so by stage 3 above it is itself one half of a cross-file
   walk-derived floor.  It asks `provenance.mjs` the same question every other
   guarded walk asks, and hands the answer up so a site found only in an
   UNTRACKED file is labelled rather than counted silently. */
import { readGitProvenance, stateOf, repoPath } from "./provenance.mjs";

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
    /* over the COMMENT-ONLY strip: the path is a string literal, and M0-16's own
       first draft proved that grading this by a bare mention anywhere in the file
       reads a HEADER that names the module in prose as an import. */
    guarded: /^\s*import\s[^\n]*["'][^"'\n]*provenance\.mjs["']/m.test(stripComments(src)),
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

/* The locals in a consumer that carry a walk-derived value, to a fixpoint. */
export function seededLocals(stripped, seeds) {
  const live = new Set(seeds);
  const calls = (expr) => [...live].some((nm) =>
    new RegExp(`(^|[^A-Za-z0-9_$.])${nm}\\s*\\(`).test(expr)
    || new RegExp(`(^|[^A-Za-z0-9_$.])${nm}\\s*[.\\[]`).test(expr)
    || new RegExp(`(^|[^A-Za-z0-9_$.])${nm}\\s*$`).test(expr.trim()));

  for (let pass = 0; pass < 8; pass++) {
    let grew = false;
    const simple = new RegExp(`(?:const|let|var)\\s+(${IDENT})\\s*=\\s*([^;\\n]*)`, "g");
    for (let m; (m = simple.exec(stripped));) {
      if (!live.has(m[1]) && calls(m[2])) { live.add(m[1]); grew = true; }
    }
    const destr = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*([^;\n]*)/g;
    for (let m; (m = destr.exec(stripped));) {
      if (!calls(m[2])) continue;
      for (const part of m[1].split(",")) {
        const nm = part.trim().split(/\s*:\s*/).pop().trim();
        if (nm && /^[A-Za-z_$]/.test(nm) && !live.has(nm)) { live.add(nm); grew = true; }
      }
    }
    if (!grew) break;
  }
  return live;
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
    .map(([f, v]) => ({ file: relative(repo, f), walks: v.walks, guarded: v.guarded,
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

    const live = seededLocals(s, [...seeds.keys()].map((k) => k.split(".")[0]).filter((k, i, a) => a.indexOf(k) === i)
      .concat([...seeds.keys()].filter((k) => !k.includes("."))));
    /* namespace member calls: treat the namespace root as live only where the
       walk-derived member is the one being called */
    for (const k of seeds.keys()) if (k.includes(".")) live.add(k.split(".")[0]);

    for (const c of comparisonsOf(s)) {
      const lRoot = c.left.root, rRoot = c.right.root;
      const lLive = lRoot && live.has(lRoot);
      const rLive = rRoot && live.has(rRoot);
      if (!lLive && !rLive) continue;

      const lNum = numOf(c.left.atom), rNum = numOf(c.right.atom);
      const rel = relative(repo, f);
      const origin = [...seeds.values()].map((v) => relative(repo, v.from));
      const row = { file: rel, line: c.line, op: c.op,
                    expr: `${c.left.atom.trim()} ${c.op} ${c.right.atom.trim()}`.trim(),
                    from: [...new Set(origin)].sort(),
                    guarded: facts.get(f).guarded };

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

  return {
    corpus: files.map((f) => relative(repo, f)),
    walkModules, sites, ceilings, unknowns,
    provenance: prov.inHead === null ? "UNVERIFIED" : "VERIFIED",
  };
}

/* Run directly for a report: `node scripts/walkfloor.mjs` */
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const r = sweepWalkFloors();
  console.log(`walkfloor: ${r.corpus.length} module(s) read · ${r.walkModules.length} walk `
    + `module(s) · provenance ${r.provenance}`);
  for (const w of r.walkModules)
    console.log(`  WALK ${w.file} · ${w.walks} primitive call(s) · walk-derived exports: `
      + `${w.derived.length ? w.derived.join(", ") : "(none reachable from an export)"}`);
  console.log(`\n  CROSS-FILE FLOORS: ${r.sites.length}`);
  for (const s of r.sites)
    console.log(`    ${s.file}:${s.line}  ${s.expr}   <- ${s.from.join(", ")} `
      + `[${s.guarded ? "GUARDED" : "UNGUARDED"}, ${s.state}]`);
  console.log(`  CEILINGS AT ZERO (fail safe, not flagged): ${r.ceilings.length}`);
  for (const s of r.ceilings) console.log(`    ${s.file}:${s.line}  ${s.expr}`);
  console.log(`  UNCLASSIFIED comparisons over a walk-derived binding: ${r.unknowns.length}`);
  for (const s of r.unknowns) console.log(`    ${s.file}:${s.line}  ${s.expr}  — ${s.why}`);
}
