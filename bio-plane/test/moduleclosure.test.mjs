/* moduleclosure.test.mjs — THE ONE MODULE-CLOSURE WALK, AND ITS TWO MODES, DRIVEN. M0-169.
 *
 * SUBJECT: `bio-plane/test/moduleclosure.mjs`, the fold of the estate's TWO derivations of "what a
 * fixture must carry" — `gatedeps.mjs` (M0-154, dynamic literals followed) and `copyImports` in
 * `civicos-ui/test/refusal-codes.test.mjs` (D-254, static-only). Five suites across two areas now
 * bound their fixtures with it, and none of them can SEE the mode they asked for: each just receives
 * a list. So the difference between the modes is asserted here, over a fixture whose every edge is
 * known, rather than inferred from four green fixtures that would stay green if the modes collapsed.
 *
 * NEGATIVE CONTROL: the row's own control is ARM B and is ARMED ON EVERY RUN rather than once by
 * hand — the fixture subject carries two imports the STATIC mode cannot see, and the assertion is
 * that the DYNAMIC mode names EXACTLY those two while the static mode names neither. A fold that
 * collapsed the modes would stay green in every other suite in this estate and fail here. On top of
 * it, four arms hand-driven against the subject, each ALONE, others held open, every restore verified
 * by sha256 AND by `cmp` against a per-arm pristine copy with its byte count printed, every run read
 * to THIS suite's own foot line. Declared before arming; RUN 2026-09-24 by the M0-169 worker on
 * `land/worker/M0-169`. Baseline 31 pass, 0 fail.
 *   (a) THE MODES COLLAPSED — `STATIC_IMPORT_RE` widened to follow `import("./x")` as well.
 *       DECLARED MUST FAIL: `assertMode` refuses the static call before any walk, so the suite dies
 *       at ARM A. RUN: exit 1 at ARM A, ZERO assertions reached and NO foot line, on
 *       `the call says dynamic=false, but its matchers DO follow a dynamic literal`. RECORDED AS IT
 *       RAN, not smoothed: a control that "fails" by dying proves nothing about an assertion, so the
 *       thing this arm establishes is the REFUSAL's wording and position, and the arms that DO grade
 *       the collapse in a live suite are (b)'s three.
 *   (b) THE MODE CHECK NEUTERED — `assertMode` returns before it probes. DECLARED MUST FAIL on ARM D
 *       alone, and MUST NOT move ARM A, B or C, whose matchers are honest. RUN: 28 pass, 3 fail,
 *       exactly ARM D's three mode-probe refusals. The other three ARM D arms hold, correctly: they
 *       are argument checks, not mode probes.
 *   (c) THE LEXER DROPPED — the walk reads raw source instead of `stripComments`. DECLARED MUST FAIL
 *       on ARM C alone. RUN: 26 pass, 5 fail — ARM C's two, AND ARM A's, ARM E's and ARM G's set
 *       equalities, because `tools/commented.mjs` enters every derived set once a comment is read as
 *       code. WIDER THAN DECLARED AND RECORDED THAT WAY: the declaration was wrong about the reach of
 *       its own arm, not the suite about the lexer.
 *   (d) OVER-STRICTNESS — the fixture subject's imports re-spelled in a shape nothing here
 *       anticipated: single quotes, one specifier per line with a trailing comma, a TAB-indented
 *       top-level import, and a one-line `export … from`. DECLARED MUST PASS. RUN: 31 pass, 0 fail,
 *       the closure byte-identical. (An indented import is the edge D-254's column anchor could not
 *       have seen; one lives in the fixture permanently as ARM A's `tools/indented.mjs`.)
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { moduleClosure, assertMode, STATIC_IMPORT_RE } from "./moduleclosure.mjs";
import { gateDeps, matchersFrom } from "./gatedeps.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");

let pass = 0, fail = 0;
function t(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}\n       got  ${g}\n       want ${w}`); }
}
function throws(name, fn, re) {
  let msg = null;
  try { fn(); } catch (e) { msg = e.message; }
  t(name, [msg !== null, msg !== null && re.test(msg)], [true, true]);
  if (msg !== null && !re.test(msg)) console.log(`       message was: ${msg}`);
}

/* ==========================================================================
   THE FIXTURE REPOSITORY — every edge known, in the session's temp root and never in the worktree
   (BOB #32, 2026-09-24: a file in the worktree is walked by the repository-walking suites and makes
   the tree dirty). `mkdtemp` names it uniquely, so it is nobody else's.
   ========================================================================== */
const ROOT = mkdtempSync(join(tmpdir(), "bio-m0169-closure-"));
const put = (rel, body) => {
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), body);
};

put("tools/subject.mjs", [
  `/* A COMMENT that names a module which EXISTS on disk: import x from "./commented.mjs";`,
  `   the lexer must blank this, in BOTH modes — copying what a comment names is not a dependency. */`,
  `import fs from "node:fs";                       // a bare specifier is the runtime's, not the tree's`,
  `import { a } from "./static-dep.mjs";`,
  `  import { b } from './indented.mjs';           // indented, single-quoted — D-254's column anchor could not see this`,
  `export {`,
  `  c,`,
  `} from "./reexported.mjs";`,
  `const lazy = await import("./lazy.mjs");        // DYNAMIC: the static mode cannot see this`,
  `const spawned = new URL("./spawned.mjs", import.meta.url);  // nor this`,
  `export const all = [fs, a, b, c, lazy, spawned];`,
].join("\n") + "\n");
put("tools/static-dep.mjs", `import { d } from "./deep.mjs";\nexport const a = d;\n`);
put("tools/deep.mjs", `export const d = 1;\n`);
put("tools/indented.mjs", `export const b = 2;\n`);
put("tools/reexported.mjs", `export const c = 3;\n`);
put("tools/lazy.mjs", `export const l = 4;\n`);
put("tools/spawned.mjs", `export const s = 5;\n`);
put("tools/commented.mjs", `export const never = 6;\n`);
put("tools/broken.mjs", `import { g } from "./gone.mjs";\nimport { a } from "./static-dep.mjs";\n`);
put("tools/escapes.mjs", `import { z } from "../../outside-the-repo.mjs";\n`);

const DYN = matchersFrom(REPO);   /* the SUBJECT's own selector — `gates.mjs`'s IMPORT_RE and URL_RE */
const staticOf = (roots, over = {}) => moduleClosure({ repo: ROOT, roots, dynamic: false, ...over });
const dynamicOf = (roots, over = {}) => moduleClosure({ repo: ROOT, roots, dynamic: true, matchers: DYN, ...over });

/* ========================================================================== */
console.log("\n--- ARM A · STATIC mode: the static closure, and nothing else (the positive control) ---");
const S = staticOf(["tools/subject.mjs"]);
console.log(`  static closure (${S.length}): ${S.join(" · ")}`);
t("ARM A: the fixture corpus is NOT empty — a totality assertion over nothing passes for free",
  S.length > 0, true);
t("ARM A: the static closure is exactly the statically-reachable set, transitively", S, [
  "tools/deep.mjs", "tools/indented.mjs", "tools/reexported.mjs", "tools/static-dep.mjs", "tools/subject.mjs",
]);
t("ARM A: an INDENTED, single-quoted top-level import is reached — the edge D-254's column anchor could not see",
  S.includes("tools/indented.mjs"), true);

/* ========================================================================== */
console.log("\n--- ARM B · THE ROW'S NEGATIVE CONTROL: the imports the static mode cannot see, NAMED by the dynamic one ---");
const D = dynamicOf(["tools/subject.mjs"]);
console.log(`  dynamic closure (${D.length}): ${D.join(" · ")}`);
const onlyDynamic = D.filter((p) => !S.includes(p));
t("ARM B: the DYNAMIC mode names EXACTLY the two edges the static mode cannot see — `await import(\"./x\")` "
+ "and `new URL(\"./x\", import.meta.url)` — and nothing else",
  onlyDynamic, ["tools/lazy.mjs", "tools/spawned.mjs"]);
t("ARM B: and the static mode names NEITHER (a fold that collapsed the modes passes every other suite and fails here)",
  [S.includes("tools/lazy.mjs"), S.includes("tools/spawned.mjs")], [false, false]);
t("ARM B: the dynamic closure is a strict SUPERSET of the static one — the modes differ in reach, not in shape",
  S.every((p) => D.includes(p)) && D.length > S.length, true);

/* ========================================================================== */
console.log("\n--- ARM C · the ESTATE'S ONE LEXER, in both modes: a comment reads nothing ---");
t("ARM C: the commented import's target EXISTS on disk, so the arm can fail (an arm that cannot arm is not one)",
  existsSync(join(ROOT, "tools/commented.mjs")), true);
t("ARM C: static mode does NOT carry what a comment names", S.includes("tools/commented.mjs"), false);
t("ARM C: nor does dynamic mode", D.includes("tools/commented.mjs"), false);

/* ========================================================================== */
console.log("\n--- ARM D · the MODE is DRIVEN, not declared ---");
throws("ARM D: `dynamic` omitted is refused — the two folded derivations differed in exactly that",
  () => moduleClosure({ repo: ROOT, roots: ["tools/subject.mjs"] }), /`dynamic` must be stated true or false/);
throws("ARM D: static mode handed a DYNAMIC-following matcher is refused before it walks anything",
  () => moduleClosure({ repo: ROOT, roots: ["tools/subject.mjs"], dynamic: false, matchers: DYN }),
  /static mode takes no `matchers`/);
throws("ARM D: a matcher set that does not see a STATIC import is refused in either mode",
  () => assertMode([/new URL\(\s*["'](\.{1,2}\/[^"'\n]+)["']/g], false), /do not see a STATIC relative import/);
throws("ARM D: matchers that DO follow a dynamic literal are refused when the call says dynamic=false",
  () => assertMode(DYN, false), /says dynamic=false, but its matchers DO follow a dynamic literal/);
throws("ARM D: the estate's static matcher is refused when the call says dynamic=true",
  () => assertMode([STATIC_IMPORT_RE], true), /says dynamic=true, but its matchers do NOT follow a dynamic literal/);
throws("ARM D: dynamic mode without the SUBJECT's matchers is refused rather than given one of this file's",
  () => moduleClosure({ repo: ROOT, roots: ["tools/subject.mjs"], dynamic: true }),
  /dynamic mode has no matcher of its own/);

/* ========================================================================== */
console.log("\n--- ARM E · `without`: an exclusion cannot outlive the import it excludes ---");
t("ARM E: a `without` naming a member of the closure drops it and keeps the rest",
  staticOf(["tools/subject.mjs"], { without: ["tools/deep.mjs"] }),
  ["tools/indented.mjs", "tools/reexported.mjs", "tools/static-dep.mjs", "tools/subject.mjs"]);
throws("ARM E: a `without` naming a file OUTSIDE the closure THROWS — the stale-hand-list failure, inverted",
  () => staticOf(["tools/subject.mjs"], { without: ["tools/lazy.mjs"] }), /which is not in the closure/);
throws("ARM E: a `without` naming the ROOT throws", () => staticOf(["tools/subject.mjs"], { without: ["tools/subject.mjs"] }),
  /names the root/);

/* ========================================================================== */
console.log("\n--- ARM F · `unresolved`: what a specifier that is not a file in this repository does ---");
throws("ARM F: default (`throw`) NAMES the missing module and the file that reaches it",
  () => staticOf(["tools/broken.mjs"]), /tools\/broken\.mjs reaches \.\/gone\.mjs .* not a file in the repository/);
t("ARM F: `skip` — M0-154's behaviour for the gates closure — drops it and derives the rest",
  staticOf(["tools/broken.mjs"], { unresolved: "skip" }),
  ["tools/broken.mjs", "tools/deep.mjs", "tools/static-dep.mjs"]);
throws("ARM F: a module reaching OUTSIDE the repository is named as that, not as missing",
  () => staticOf(["tools/escapes.mjs"]), /OUTSIDE the repository/);
throws("ARM F: a root that is not a file throws in both modes", () => staticOf(["tools/no-such-root.mjs"]),
  /root tools\/no-such-root\.mjs is not a file/);
throws("ARM F: an unknown `unresolved` policy is refused rather than silently treated as one of them",
  () => staticOf(["tools/subject.mjs"], { unresolved: "ignore" }), /`unresolved` is "skip" or "throw"/);

/* ========================================================================== */
console.log("\n--- ARM G · `includeRoots`: whose job it is to write the root ---");
t("ARM G: includeRoots:false drops the seed — `copyImports`'s shape, whose `buildTree` writes the guard itself",
  staticOf(["tools/subject.mjs"], { includeRoots: false }),
  ["tools/deep.mjs", "tools/indented.mjs", "tools/reexported.mjs", "tools/static-dep.mjs"]);
t("ARM G: a root supplied as SOURCE is walked as given, not re-read from disk — `copyImports` derives the "
+ "closure of the MUTATED guard its fixture will run",
  moduleClosure({ repo: ROOT, dynamic: false, includeRoots: false,
    roots: [{ rel: "tools/subject.mjs", code: `import { d } from "./deep.mjs";\n` }] }),
  ["tools/deep.mjs"]);
t("ARM G: and a seed whose imports are GONE derives nothing — the t2 shape, which must not throw",
  moduleClosure({ repo: ROOT, dynamic: false, includeRoots: false,
    roots: [{ rel: "tools/subject.mjs", code: "export const nothing = 0;\n" }] }), []);

/* ========================================================================== */
console.log("\n--- ARM H · the REAL callers still stand on it ---");
const REAL = gateDeps({ repo: REPO });
console.log(`  gateDeps(tools/gates.mjs) (${REAL.length}): ${REAL.join(" · ")}`);
t("ARM H: `gateDeps` still derives a NON-EMPTY closure over the real tree, with the tool itself in it",
  [REAL.length >= 2, REAL.includes("tools/gates.mjs")], [true, true]);
t("ARM H: and it carries `tools/gateresults.mjs`, which only a DYNAMIC walk reaches — the property the four "
+ "gate suites depend on and cannot themselves see", REAL.includes("tools/gateresults.mjs"), true);
t("ARM H: the STATIC closure of the same root is strictly smaller — measured here, not assumed",
  moduleClosure({ repo: REPO, roots: ["tools/gates.mjs"], dynamic: false, unresolved: "skip" }).length < REAL.length,
  true);

/* ========================================================================== */
console.log("\n--- ARM I · the fixture leaves nothing behind ---");
rmSync(ROOT, { recursive: true, force: true });
t("ARM I: the fixture tree is removed", existsSync(ROOT), false);
/* AND NOT A DIRECTORY WALK, DELIBERATELY. The first draft asserted this a second way — a
   `readdirSync(tmpdir())` finding no `bio-m0169-closure-*` sibling — and `hygiene.test.mjs`'s
   class census caught it by name: a new walk of a directory with a discovery primitive is a
   DECISION, not a silence, and it enters an estate-wide census that has to be named and floored.
   The decision is NOT to add one. It bought nothing this suite did not already have: `./sandbox.mjs`
   (D-186) re-points `os.tmpdir()` at a per-process directory it removes SYNCHRONOUSLY on exit, so
   the read would have been inside this run's own sandbox — and only ONE fixture root is ever made,
   so there is no sibling for it to find. The line above is the whole of what could be checked. */
t("ARM I: FOOT — this suite reached its own foot (a module that dies inside an assertion leaves a clean count)",
  true, true);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
