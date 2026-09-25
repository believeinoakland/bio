/* moduleclosure.mjs — THE ONE DERIVATION OF "WHAT A FIXTURE MUST CARRY". M0-169.
 *
 * WHY (M0-154's finding F1, rowed as M0-169). A fixture that copies a REAL tool into a scratch
 * repository must also carry every module that tool loads, or the fixture measures a DEGRADED
 * subject — and the estate derived that closure in TWO places, each right for its own subject and
 * neither a copy of the other:
 *
 *   - `bio-plane/test/gatedeps.mjs` (M0-154) — follows a DYNAMIC literal as well as a static one,
 *     and blanks comments with the estate's one lexer.
 *   - `copyImports` in `civicos-ui/test/refusal-codes.test.mjs` (D-254) — STATIC-ONLY, and kept
 *     comments out by anchoring an import statement to column zero instead.
 *
 * Two derivations of one fact is the D-93/D-113 defect one level up (`VERIFICATION.md`, "The battery
 * runs every suite": the set is DISCOVERED, never listed) — they cannot fail when they disagree, they
 * just quietly bound different fixtures. This file is the fold: ONE walk, and the difference the two
 * callers actually have is a STATED MODE rather than a second implementation. `gatedeps.mjs` is now a
 * thin gates-specific wrapper over it and `copyImports` reads it.
 *
 * THE MODE IS DRIVEN, NOT DECLARED. `dynamic` is not a label on the call: every call probes the
 * matchers it is about to use against a static and a dynamic specimen, and THROWS if they do not
 * behave as the mode says (`assertMode`). A mode believed on the strength of its existence is the
 * defect this estate meets most; this one has to demonstrate itself before it walks anything.
 *
 * WHERE A DYNAMIC MATCHER COMES FROM, AND WHY THIS FILE HAS NONE. `dynamic: true` REQUIRES the caller
 * to hand in the SUBJECT'S OWN matchers. M0-154's argument holds and is why: `gates.mjs` selects the
 * files it loads with its own `IMPORT_RE`/`URL_RE`, so a dynamic regex written HERE would be a hand
 * copy one level up — agreeing for free on the day it was written and drifting silently after.
 * `gatedeps.matchersFrom` reads those two lines OUT of `tools/gates.mjs`. `dynamic: false` has no such
 * subject — nothing else in the estate declares "a static relative import" — so the static matcher is
 * this file's own, is the only one, and is REFUSED an override for the same reason the dynamic side
 * demands one: a second spelling of it would be the defect this file was written to remove.
 *
 * REACH — STATED, because a derivation nobody can bound is a hand list with extra steps.
 *   CAN SEE, in both modes: a module edge whose specifier is a RELATIVE STRING LITERAL in a static
 *     statement — `import x from "./a.mjs"`, `import "./a.mjs"`, `export … from "./a.mjs"`.
 *   CAN SEE, in dynamic mode only (through the subject's matchers): `await import("./a.mjs")` and
 *     `new URL("./a.mjs", import.meta.url)`.
 *   CANNOT SEE, in either: a computed specifier (`import(join(REPO, name))`), a bare or package
 *     specifier (deliberately — a fixture installs no node_modules), a `createRequire` load, or a file
 *     the subject SPAWNS rather than imports. A file this cannot see must be named at the CALL SITE as
 *     an extra root, and `gateresults.test.mjs` does exactly that for `tools/gatetrace.mjs`, which
 *     `gates.mjs` hands to a child through `NODE_OPTIONS --import=` at a computed path.
 *
 * COMMENTS ARE BLANKED BY THE ESTATE'S ONE LEXER in both modes — `stripComments`
 * (`bio-plane/scripts/walkfloor.mjs`, D-301: strings KEPT, since a path is a string), never a second
 * one. M0-154 measured what it buys: without it the gates closure gains
 * `bio-plane/scripts/op-claims.mjs` and `tools/statepaths.mjs` from an import quoted inside
 * `walkfloor.mjs`'s own header prose — a comment reads nothing, and copying what a comment names is
 * not a dependency. MEASURED 2026-09-24 for the fold's other half: over
 * `civicos-ui/check-refusal-codes.mjs` the closure is the SAME two modules
 * (`bio-plane/scripts/provenance.mjs`, `bio-plane/test/verdict-reader.mjs`) under all four
 * combinations of {column-anchored, unanchored} x {lexer, no lexer}. So dropping D-254's column
 * anchor in favour of the lexer moved nothing measurable, and is recorded here rather than assumed:
 * the anchor was a SECOND comment mechanism, which is precisely what this file exists to remove, and
 * the unanchored matcher additionally sees an INDENTED top-level import, which the anchor could not.
 *
 * THE MODE IS NOT A PREFERENCE. Dynamic is right for `gates.mjs`, whose lexer and results module are
 * LOAD-TIME dependencies reached exactly that way; it OVER-derives for a module whose
 * `await import("./x.mjs")` is a lazy branch. MEASURED 2026-09-24 (M0-154): `tools/coord.mjs` has
 * twelve such branches, so a dynamic walk from `tools/decided.mjs` derives THIRTEEN files where its
 * static closure is the three that `pushguard.test.mjs` copied by hand. Those hand lists were M0-170's,
 * and static mode is what they read now: `pushguard.test.mjs` (scratchRepo), `pushguard-check.test.mjs`
 * and `retirable.test.mjs` (cliHome) each derive what they carry from this walk (2026-09-24).
 *
 * THE THIRD DERIVATION IS FOLDED TOO, SINCE M0-170: `bio-plane/test/instrument-deps.mjs` (D-265), which
 * derived `scripts/coverage.mjs`'s closure for three suites with a regex of its own and no lexer, is now
 * an adapter over static mode that keeps its two contracts (BASENAMES, and the `outside` set its callers
 * assert). Measured the same six modules under the old walk and this one.
 */
import { readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { stripComments } from "../scripts/walkfloor.mjs";

/* A STATIC relative module edge: `import … from "./x"`, `export … from "./x"`, bare `import "./x"`.
   D-254's spelling with its `^`/`m` column anchor removed — the lexer does that job now (see the
   header's measurement). `(?<![\w$])` keeps it from firing inside an identifier that merely ends in
   the word. A bare specifier (`fs`, `node:path`) is the runtime's, not the tree's, and is not an edge
   a fixture can carry. */
export const STATIC_IMPORT_RE =
  /(?<![\w$])(?:import|export)\s(?:[^;"'`]*?\sfrom\s*)?["'](\.{1,2}\/[^"'\n]+)["']/g;

/* The two specimens every call's matchers are driven against, so `dynamic` has to be TRUE of them
   rather than merely written at the call. */
const PROBE_STATIC = 'import { a } from "./probe-static.mjs";\n';
const PROBE_DYNAMIC = 'const m = await import("./probe-dynamic.mjs");\n';

const isFile = (abs) => { try { return statSync(abs).isFile(); } catch { return false; } };
const slash = (p) => p.split(sep).join("/");
const relOf = (repo, abs) => slash(relative(repo, abs));

/* `.test` on a `/g` regex advances `lastIndex`; reset on both sides so a probe cannot poison the
   walk that follows it, nor the next probe. (`matchAll` clones and is safe.) */
function anyMatches(matchers, src) {
  for (const re of matchers) {
    re.lastIndex = 0;
    const hit = re.test(src);
    re.lastIndex = 0;
    if (hit) return true;
  }
  return false;
}

/* THE MODE, DRIVEN. Exported so a suite can arm it directly. */
export function assertMode(matchers, dynamic) {
  if (!anyMatches(matchers, PROBE_STATIC))
    throw new Error("moduleClosure: the matchers do not see a STATIC relative import"
      + ` (${JSON.stringify(PROBE_STATIC.trim())}) — every mode must, so this is the subject's selector`
      + " having changed shape, not a mode question (M0-169)");
  const followsDynamic = anyMatches(matchers, PROBE_DYNAMIC);
  if (followsDynamic !== dynamic)
    throw new Error(`moduleClosure: the call says dynamic=${dynamic}, but its matchers`
      + ` ${followsDynamic ? "DO" : "do NOT"} follow a dynamic literal`
      + ` (${JSON.stringify(PROBE_DYNAMIC.trim())}). The mode is driven against a specimen on every`
      + " call precisely so it cannot be merely declared (M0-169)");
}

/* The repo-relative paths, sorted, of every module reachable from `roots`.
 *
 *   repo         absolute path of the repository the paths are relative to.
 *   roots        each either a repo-relative PATH (read from disk) or `{ rel, code }` — a source
 *                supplied by the caller, which is how `copyImports` derives the closure of the
 *                MUTATED guard its fixture will actually run rather than the tree's.
 *   dynamic      REQUIRED, true or false. See the header; driven by `assertMode`.
 *   matchers     REQUIRED when `dynamic`, REFUSED when not. The subject's own.
 *   includeRoots whether the roots themselves are part of the result. `gateDeps` yes (the fixture
 *                copies the tool too); `copyImports` no (its `buildTree` writes the guard itself).
 *                A root reached back through a cycle is still dropped when this is false — stated
 *                rather than special-cased, and it cannot leave that one caller short because the
 *                guard is always written.
 *   unresolved   what a matched specifier that is NOT a file in this repository does: "skip" (M0-154's
 *                behaviour for the gates closure) or "throw" (D-254's — a fixture cannot copy what it
 *                cannot find, and cannot copy honestly what lies outside the repository). MEASURED
 *                2026-09-24: neither fires on today's tree for either caller, so this parameter is
 *                INERT today and is stated as a preserved guarantee, not as an exercised one.
 *   without      a dependency a fixture deliberately does not carry, checked against the derived
 *                closure: a name that is not in it throws, so an exclusion cannot outlive the import
 *                it excludes.
 */
export function moduleClosure({
  repo, roots = [], dynamic, matchers, without = [], includeRoots = true, unresolved = "throw",
} = {}) {
  if (!repo) throw new Error("moduleClosure: `repo` is required");
  if (dynamic !== true && dynamic !== false)
    throw new Error("moduleClosure: `dynamic` must be stated true or false at every call — the two"
      + " derivations this helper folded differed in exactly that, so it is never defaulted (M0-169)");
  if (dynamic === false) {
    if (matchers) throw new Error("moduleClosure: static mode takes no `matchers` — a second spelling of"
      + " \"a static relative import\" is the duplication this helper exists to remove (M0-169)");
    matchers = [STATIC_IMPORT_RE];
  } else if (!Array.isArray(matchers) || matchers.length === 0) {
    throw new Error("moduleClosure: dynamic mode has no matcher of its own — pass the SUBJECT's, read out"
      + " of the subject (`bio-plane/test/gatedeps.mjs` `matchersFrom` reads `tools/gates.mjs`'s own"
      + " IMPORT_RE and URL_RE). A dynamic regex written here would be a hand copy one level up (M0-154)");
  }
  if (unresolved !== "skip" && unresolved !== "throw")
    throw new Error(`moduleClosure: \`unresolved\` is "skip" or "throw", not ${JSON.stringify(unresolved)}`);
  assertMode(matchers, dynamic);

  const rootRels = new Set();
  const stack = [];
  for (const r of roots) {
    const rel = typeof r === "string" ? r : r && r.rel;
    if (!rel) throw new Error("moduleClosure: a root is a repo-relative path, or { rel, code }");
    if (typeof r === "string" && !isFile(resolve(repo, rel)))
      throw new Error(`moduleClosure: root ${rel} is not a file in ${repo}`);
    rootRels.add(slash(rel));
    stack.push({ rel: slash(rel), code: typeof r === "string" ? null : r.code, from: "(root)" });
  }

  const seen = new Set();
  while (stack.length) {
    const { rel, code, from } = stack.pop();
    if (seen.has(rel)) continue;
    seen.add(rel);
    const abs = resolve(repo, rel);
    let text = code;
    if (text === null || text === undefined) {
      try { text = readFileSync(abs, "utf8"); }
      catch (e) { throw new Error(`moduleClosure: ${from} reaches ${rel}, which could not be read — ${e.message}`); }
    }
    const src = stripComments(text);
    for (const re of matchers) {
      for (const m of src.matchAll(re)) {
        const targetAbs = resolve(dirname(abs), m[1]);
        const targetRel = relOf(repo, targetAbs);
        const outside = targetRel.startsWith("..");
        if (outside || !isFile(targetAbs)) {
          if (unresolved === "skip") continue;
          throw new Error(`moduleClosure: ${rel} reaches ${m[1]} (${targetRel}), which is `
            + `${outside ? "OUTSIDE the repository" : "not a file in the repository"} — a fixture cannot `
            + "carry that honestly. Name it at the call site, or pass `unresolved: \"skip\"` with a reason");
        }
        stack.push({ rel: targetRel, code: null, from: rel });
      }
    }
  }

  const all = [...seen].filter((rel) => includeRoots || !rootRels.has(rel)).sort();
  for (const w of without) {
    if (!all.includes(w)) throw new Error(`moduleClosure: \`without\` names ${w}, which is not in the closure`
      + ` of [${[...rootRels].join(", ")}] — an exclusion that excludes nothing is a stale hand list`
      + ` (M0-154); the closure is [${all.join(", ")}]`);
    if (rootRels.has(w)) throw new Error(`moduleClosure: \`without\` names the root ${w}`);
  }
  return all.filter((p) => !without.includes(p));
}
