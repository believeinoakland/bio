/* surface-registry.test.mjs — UI-38.
 *
 * THE ITEM, IN ONE SENTENCE. Surfaces SELF-DESCRIBE and recipes are DATA, and
 * both are proved against the system rather than against themselves: the
 * described surface set must EQUAL the real one in BOTH directions, and every
 * recipe step must resolve to a real surface id and a real op the PLANE EMITS.
 *
 * WHY THE SOURCING IS THE WHOLE POINT. A hand-typed op list agrees with the
 * plane at ZERO COST, and this project has measured that five times on five
 * subjects: an equality that costs nothing to produce is not evidence
 * (CLAUDE.md). So the op names are parsed out of `bio-plane/src/index.mjs`'s
 * own `OPS` table and the act ids are IMPORTED from `bio-plane/src/affordances.mjs`
 * as live module exports — and ARM S below proves the parse is load-bearing by
 * renaming an op in a COPY of the plane's source and asserting these very
 * recipes then fail. A hand copy passes every other arm in this file and fails
 * that one. It runs on every harness run, not only as a manual control.
 *
 * WHY THE WALK IS THREE ARMS AND NOT ONE. The question this item asks is not
 * whether the surfaces we started with are described. It is whether a NEW one
 * can be added SILENTLY. A surface enters this runtime three structurally
 * different ways — a key in `go()`'s screen table, a `CUR = {type:...}`
 * assignment on an object page, and a hash-route regex — so the walk has three
 * arms and the union is the real set. Two of the three find things the others
 * do not, which is measured and printed rather than assumed.
 *
 * AND THE WALK IS ASSUMED TO COVER NOTHING UNTIL PROVED OTHERWISE. Every arm
 * prints its corpus size and asserts a floor, because a walk that covers nothing
 * passes everything: three walks in this project kept their headline assertion
 * green over an empty corpus, twice inside the instrument built to prevent it.
 * The REACH arms are what fail AS A DELTA when an arm is neutered.
 *
 * NEGATIVE CONTROL, RUN 2026-08-07, every file restored byte-identically with
 * sha256 compared before and after each arm:
 *
 *  (0) ADDED 2026-08-08 (UI-38), and it is this file's ARM Y arms rather than a
 *      registry arm. Clean tree measured at 382 before UI-38 and 393 after. In
 *      `app.html`'s `aiSessionBlockHtml` make the nested loop `continue`
 *      unconditionally — the panel stops descending, which is exactly the state
 *      `main` was in and why `op=airun`'s BIAS BLOCK rendered nowhere ->
 *      **25 FAIL / 368 pass**: Y7 x6, Y8c, Y11b x6, Y11c x4, Y15 x6, Y16, Y17,
 *      with `ai-session-wire` failing 23 INDEPENDENTLY.
 *      **THE ARMS THAT STAYED GREEN ARE THE FINDING AND ARE RECORDED RATHER
 *      THAN SMOOTHED: Y8 and Y8b PASSED**, because they judge the principal
 *      BLOCK on its own and the mutation broke only DESCENT. A block-level pin
 *      cannot see a composition defect — which is the whole shape the bias block
 *      failed in — so **ARM Y8c was added and Y8c is the one that failed.**
 *
 *  (1) a recipe step naming an op the plane does not emit. Change any step's
 *      `op:` in app.html's RECIPES to `"notanop"` ->
 *        FAIL: RECIPES[does-the-record-hold-anything-on-this].steps[1] names op
 *              'notanop', which the plane does not emit
 *      naming the STEP and the OP, which is what makes it actionable.
 *
 *  (2) a recipe step naming a surface id that does not exist. Change a step's
 *      `surface:` to `"nosuchsurface"` ->
 *        FAIL: RECIPES[...].steps[n] names surface 'nosuchsurface', which is not
 *              a described surface
 *
 *  (3) a real surface added and described nowhere. Add `glossary: renderRecord,`
 *      to `go()`'s R table in app.html and describe it in no surface's `routes`
 *      -> FAIL: the route 'screen:glossary' EXISTS in the runtime and NO surface
 *      describes it. The reverse direction is arm E2.
 *
 *  (4) EACH discovery arm neutered independently, and each fails AS A DELTA with
 *      the corpus size printed — a walk that finds nothing must not read as a
 *      clean answer. See ARM R.
 *
 *  (5) THE SOURCING, AND IT IS THE ARM THAT MATTERS. Replace the live parse
 *      inside `opsFrom` with a COMPLETE, CURRENTLY-CORRECT hand copy of all 131
 *      op names ->
 *        FAIL: ARM S4: A HAND-TYPED OP LIST FAILS THIS, AND THIS RUN IS THAT LIST
 *      exit 1. The hand copy passes ARM S0's count cross-check, ARM S0b's
 *      spot-check and every recipe arm, because it IS correct today. Only S4
 *      can tell it apart.
 *
 *      **THIS ARM WENT GREEN WITH THE DEFECT PRESENT ON ITS FIRST BUILD, AND
 *      THAT IS RECORDED RATHER THAN QUIETLY FIXED.** The first shape of this
 *      file built `const OPS = opRegistry(planeSrc)` and proved the sourcing by
 *      parsing a MUTATED copy into a SECOND set — a parallel path that never
 *      touched the set the recipes were validated against. The hand copy passed,
 *      exit 0, all 357 assertions. The fix is that the plane's SOURCE TEXT is
 *      now a PARAMETER of `opFailures`, so the mutation and the real run go
 *      through one function and there is no second path to hide a copy in.
 *      An arm proving a parse WORKS proves nothing about whether it is USED.
 *
 *  (6) polarity: every pin above was confirmed GREEN with the file intact and
 *      RED with the defect present, in that order, never the reverse. Restores
 *      are verified BY CONTENT as well as by sha256 — an earlier run of these
 *      controls reported a byte-identical restore over a file that had not been
 *      restored, so the sha comparison alone is not trusted here.
 *
 *  (6a) UI-47, 2026-08-07 — FOUR ARMS OF THIS FILE WERE SUPERSEDED BY IS-6
 *      LANDING AND ARE CORRECTED IN PLACE WITH DATED REASONS, NEVER EXEMPTED.
 *      X4, X5, Y1 and Y14 all rested on "no op publishes a run yet", which was
 *      true when this file was written and is false since `op=airun` shipped.
 *      Left standing, every one of them would have made the honest wiring FAIL
 *      THE BUILD. **The sharpest of the four is Y14, and it is worth reading:**
 *      it asserted `!src[1].includes("recR(")` under the heading *"the block
 *      reaches the plane for NO transcript"* — but that tested that the block
 *      called NOTHING, which is indistinguishable from DEC-61's actual rule only
 *      while the block has no read at all. A rule satisfied by the code doing
 *      nothing is not a rule. Y14 now pins the ops the block asks for against
 *      the PLANE'S OWN emitted set (exactly one, `airun`) and proves the
 *      transcript function itself reaches no transport. **Y1 is the same shape
 *      one layer down:** this context supplied no `recR`, so the wired read's
 *      `catch` would have swallowed a ReferenceError and answered null — the
 *      superseded assertion would have gone on PASSING over a read that never
 *      happened. It now OBSERVES THE ASK. Controls run for all four, through the
 *      whole harness: restoring `reads: []` with the stale `pending` fails X4b;
 *      adding a second `recR` call inside the block fails Y1; un-wiring the read
 *      fails ARM D4 ("a described read nothing performs is fiction").
 *  (6b) UI-49, 2026-08-07 — THE FAIL-FAST DEFECT, FIXED AND PROVED BY THE ONE
 *      CONTROL THAT COULD PROVE IT: THE SAME MUTATION RUN AGAINST BOTH SHAPES.
 *      `ok`/`eq` were `assert.ok`/`assert.deepStrictEqual`, which throw, so the
 *      first failing arm ended the module. CONDUCT reproduced that at UI-47's
 *      integration (a control breaking several arms reported only ARM D4).
 *
 *      THE CONTROL: ONE mutation of `app.html`'s registry breaking arms in
 *      THREE different sections at once — the `ai-session` surface loses its
 *      `kind`, its `consumers`, its `purpose`, its `levels` and its `acts`.
 *      Run against the PRE-RIDER file (taken from `git show HEAD:` and copied
 *      into `test/` under a non-`.test.mjs` name so the runner could not pick it
 *      up, then removed) and against this one, with app.html restored and
 *      verified by CONTENT and sha256 afterwards:
 *
 *        PRE-RIDER (assert throws):  exit 1, ONE arm reported —
 *          `AssertionError: ARM L2: surface 'ai-session' declares a levels array`
 *          and the module ended there. L4, A1, X1, X2, X3, X4, X4b and X5 were
 *          never run and nobody would have known they were broken.
 *        ACCUMULATING (this file):   exit 1, **NINE arms reported**, across
 *          ARM L (L2, L4), ARM A (A1) and ARM X (X1, X2, X3, X4, X4b, X5),
 *          every one printed at the point of failure AND listed again at the end.
 *
 *      **AN ACCUMULATING `ok` IS ONLY HALF THE FIX, and the other half is why
 *      the arms are grouped into SECTIONS.** A `TypeError` never goes through
 *      `ok` at all — and this file had SIX places where a malformed registry
 *      produced exactly one (`topKeys(null)`, `s.routes` of undefined,
 *      `RECIPES[0].steps[1].op`, `SURFACES[st.surface].levels`, the `aiKind[0]`
 *      destructure, `src[1]` of a null match). Every one is now guarded with a
 *      dated reason at the site, and each section runs inside its own catch so a
 *      throw is RECORDED AS A FAILURE NAMING ITS SECTION rather than ending the
 *      file. ARM Z drives all of this through the file's own collector on every
 *      run, so the fix cannot silently regress.
 *  (7) over-strictness (ARM Y15-Y17): a running-session record shaped unlike
 *      anything written here — different field names, a bound this file never
 *      mentions — must RENDER, not fail. Driven with `{gauge, cap, used, note}`
 *      in place of the authored shapes: GREEN, 358 assertions. A renderer that
 *      only accepts the shapes its author imagined would be a fixture testing
 *      itself, and it would break the day IS-6 chooses its field names.
 *
 *  (8) UI-52, 2026-08-08 — ARM A4 SPLIT INTO A4a..A4g, CORRECTED WITH A DATED
 *      REASON AND NEVER EXEMPTED. The old one-line A4 conflated a claim that is
 *      always a lie (a surface describing something that does not exist) with
 *      one that is FALSE BY DESIGN during a plane-first wave (a published act
 *      whose surface is scheduled four waves later). See the long note above
 *      `ACTS_AWAITING_SURFACE` for the reasoning. The controls are COMMITTED and
 *      re-runnable in one step rather than described here:
 *
 *        node civicos-ui/test/surface-registry-a4.control.mjs
 *
 *      RUN 2026-08-08, 6 arms, 0 control failures, every restore verified by
 *      sha256 AND by content, polarity checked on every pin BEFORE it was
 *      confirmed red, and the suite re-run afterwards to prove the tree came
 *      back (exit 0). Each arm failed IN ITS OWN WORDS, naming its subject:
 *        1a FICTION/ROUTE  -> ARM E2 "1 described route(s) do not exist in the
 *                             runtime: inquiry -> screen:nosuchsurfacecontrol"
 *        1b FICTION/ACT    -> ARM A4a "1 act(s) are DESCRIBED by a surface and
 *                             published by NO plane catalogue: notanactcontrol"
 *        2  CEILING        -> ARM A4b naming `versionseventhcontrol` and stating
 *                             the register stands at 6 rows and this is not one
 *        3a FLOOR/catalogue-> ARM A4d "holds 0 act(s), floor 15"
 *        3b FLOOR/walk     -> ARM A4e "found 0 distinct hosted act(s) across 0
 *                             placement(s), floor 15"
 *        4  DRAIN          -> ARM A4c naming `versionhide` and demanding the row
 *                             be STRUCK in the same commit
 *      1a and 1b are the arms that matter most: they prove the narrowing did NOT
 *      blind the guard. 2 and 4 are the two directions of the ratchet — it must
 *      refuse to grow silently AND refuse to stay put once the debt is paid.
 */
import fs from "fs";
import vm from "vm";
import { ACTS, ACT_IDS, CAPTURE_ACTS } from "../../bio-plane/src/affordances.mjs";

/* ============================================================
   THE COLLECTOR — UI-49's RIDER, AND IT IS A REAL DEFECT BEING FIXED RATHER
   THAN A STYLE CHANGE.

   Until 2026-08-07 this file's `ok` and `eq` were `assert.ok` and
   `assert.deepStrictEqual`, which THROW. An `assert` that throws ends the
   module, so THE FIRST FAILING ARM HIDES EVERY ARM BEHIND IT — and CONDUCT
   reproduced exactly that at UI-47's integration, where a control that broke
   several arms reported only ARM D4. That is D-93's class (`npm test` chained
   with `&&`, stopping at the first failure and hiding the rest) arriving inside
   a UI suite, and it now has SIX recorded sightings across this project:
   D-93 itself; two of IS-6's own controls; REC-58's spelling arm throwing on
   `.bound` of undefined; UI-47's report of this file; and this.

   WHY A COLLECTOR IS NOT ENOUGH ON ITS OWN, which is the part worth reading.
   Replacing `assert` with an accumulator only fixes the failures that go
   through the accumulator. A `TypeError` — destructuring an empty match,
   reading `.steps` of undefined, a vm that would not compile — still ends the
   module and still hides everything after it, and this file has SIX places
   where a broken registry produces exactly that. So the arms are grouped into
   SECTIONS, each of which runs inside its own catch: a section that throws is
   recorded AS A FAILURE NAMING ITSELF and the sections after it still run.
   A suite that dies is a suite reporting one defect out of however many exist,
   and the whole reason to run a control that breaks several arms is to see all
   of them.
   ============================================================ */
let n = 0;
const fails = [];
function ok(cond, msg){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }
function eq(a, b, msg){
  n++;
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if(A !== B){
    const m = `${msg}\n         want ${B}\n         got  ${A}`;
    fails.push(m); console.error("  FAIL", m);
  }
}
/* A SECTION IS A FIREBREAK. `fn` may be async; every caller awaits. */
const SECTIONS = [];
async function section(name, fn){
  SECTIONS.push(name);
  try{ await fn(); }
  catch(e){
    n++;
    const m = `SECTION '${name}' THREW and every arm inside it after the throw was not run — `
            + `${String((e && e.stack) || e).split("\n").slice(0, 3).join(" / ")}`;
    fails.push(m); console.error("  FAIL", m);
  }
}

const APP_PATH = new URL("../app.html", import.meta.url).pathname;
const PLANE_INDEX = new URL("../../bio-plane/src/index.mjs", import.meta.url).pathname;
const app = fs.readFileSync(APP_PATH, "utf8");

/* ------------------------------------------------------------------ tooling
   COMMENT-BLIND AND BRACE-BALANCED, because both have already produced
   confident wrong answers in this harness. UI-40's key walk did not skip
   comments and reported a key set containing the word `it`; UI-39's matcher
   used `[^}]*` and stopped at the `}` inside `...(extra||{})`, reading a bound
   that WAS there as missing. The stripper is itself pinned (ARM I) so it cannot
   quietly strip everything and make every walk trivially green. */
function stripComments(s){
  let out = "", i = 0, inS = null;
  const N = s.length;
  while(i < N){
    const c = s[i], d = s[i+1];
    if(inS){ if(c === "\\"){ out += c + (d||""); i += 2; continue; } if(c === inS) inS = null; out += c; i++; continue; }
    if(c === '"' || c === "'" || c === "`"){ inS = c; out += c; i++; continue; }
    if(c === "/" && d === "*"){ const e = s.indexOf("*/", i+2); i = e < 0 ? N : e+2; out += " "; continue; }
    if(c === "/" && d === "/"){ const e = s.indexOf("\n", i); i = e < 0 ? N : e; out += " "; continue; }
    out += c; i++;
  }
  return out;
}

/* The body of a `<name> = { ... }` literal, brace-matched out of source so a
   table read this way cannot fall behind a hand-kept list. Counts (), [] and {}
   together so a nested arrow function or array cannot end the scan early. */
function tableBody(src, declRe){
  const m = declRe.exec(src);
  if(!m) return null;
  const i = src.indexOf("{", m.index);
  if(i < 0) return null;
  let depth = 0, inS = null;
  for(let p = i; p < src.length; p++){
    const c = src[p];
    if(inS){ if(c === "\\"){ p++; continue; } if(c === inS) inS = null; continue; }
    if(c === '"' || c === "'" || c === "`"){ inS = c; continue; }
    if(c === "{" || c === "(" || c === "[") depth++;
    else if(c === "}" || c === ")" || c === "]"){ depth--; if(depth === 0 && c === "}") return src.slice(i+1, p); }
  }
  return null;
}

/* DEPTH-ZERO keys only. The first cut of this walk read `scope` as a screen
   route because `search: ()=>renderFinder({ scope:null })` puts a nested key
   inside the table body — a confident wrong answer, caught by counting. */
function topKeys(body){
  const keys = []; let depth = 0, inS = null;
  for(let i = 0; i < body.length; i++){
    const c = body[i];
    if(inS){ if(c === "\\"){ i++; continue; } if(c === inS) inS = null; continue; }
    if(c === '"' || c === "'" || c === "`"){ inS = c; continue; }
    if(c === "{" || c === "(" || c === "["){ depth++; continue; }
    if(c === "}" || c === ")" || c === "]"){ depth--; continue; }
    if(depth === 0 && c === ":"){
      const before = body.slice(Math.max(0, i-64), i);
      const k = /(?:^|[\s,{])(["']?)([A-Za-z_$][\w$-]*)\1\s*$/.exec(before);
      if(k) keys.push(k[2]);
    }
  }
  return [...new Set(keys)];
}

const code = stripComments(app);

/* -------------------------------------------------- ARM I · the instrument
   The stripper must remove comments and NOT remove code. A stripper that
   returned "" would make every walk below green over an empty corpus, which is
   the exact failure this file exists to refuse. */
await section("ARM I · the comment stripper", () => {
  const probe = stripComments(`const a = 1; /* c1 */ const b = "/* not a comment */"; // c2\nconst c = 3;`);
  ok(!probe.includes("c1"), "ARM I: the comment stripper removes block comments");
  ok(!probe.includes("c2"), "ARM I: the comment stripper removes line comments");
  ok(probe.includes("/* not a comment */"), "ARM I: the stripper does NOT strip inside a string literal");
  ok(probe.includes("const c = 3"), "ARM I: the stripper keeps code after a line comment");
  ok(code.length > app.length * 0.5,
     `ARM I: the stripped corpus is ${code.length} of ${app.length} chars — a stripper that ate the file would make every walk below trivially green`);
});

/* ============================================================ THE REAL SET
   Three independent arms. Each prints its corpus size and asserts a floor. */

/* ARM W1 · the screen route table inside go(). */
const rBody = tableBody(code, /const\s+R\s*=\s*\{/);
ok(rBody && rBody.length > 100,
   `ARM W1: go()'s screen table was found and is ${rBody ? rBody.length : 0} chars — a table read as empty passes everything`);
/* `|| ""` ADDED 2026-08-07 (UI-49's rider): `topKeys(null)` THREW, and a throw
   here ended the module and took every arm in the file with it — the precise
   failure the accumulator above exists to stop, arriving one line below the
   arm that reports the same fact honestly. */
const screenKeys = topKeys(rBody || "");
const W1 = screenKeys.map(k => "screen:" + k);

/* ARM W2 · object pages, from their own `CUR = {type:...}` assignment. The
   literal `screen` is the meta-type those screen routes already carry, not a
   surface of its own, so it is excluded BY NAME with the reason stated. */
const curTypes = [...new Set([...code.matchAll(/CUR\s*=\s*\{\s*type\s*:\s*"([a-z-]+)"/g)].map(m => m[1]))]
  .filter(t => t !== "screen");
const W2 = curTypes.map(t => "object:" + t);

/* ARM W3 · hash routes, from the route regexes themselves. */
const hashRoots = [...new Set([...code.matchAll(/\/\^#([a-z-]+)/g)].map(m => m[1]))];
const W3 = hashRoots.map(h => "hash:" + h);

const REAL = [...new Set([...W1, ...W2, ...W3])].sort();

console.log(`  walk corpus: app.html ${app.length} chars, ${code.length} comment-stripped`);
/* PRINTED FROM THE DERIVED ARRAYS, NOT THE INTERMEDIATE LISTS. The first cut
   printed `curTypes`/`hashRoots` beside `W2.length`/`W3.length`, so neutering an
   arm produced the line "0 routes — bundle, inquiry, project, action": a count
   and an evidence list that CONTRADICTED each other, in the instrument whose
   whole job is to be believed about coverage. Caught by reading the negative
   control's output instead of only its exit status. */
console.log(`  ARM W1 screen table: ${W1.length} routes — ${W1.join(", ") || "(none)"}`);
console.log(`  ARM W2 object pages: ${W2.length} routes — ${W2.join(", ") || "(none)"}`);
console.log(`  ARM W3 hash routes:  ${W3.length} routes — ${W3.join(", ") || "(none)"}`);
console.log(`  REAL route set: ${REAL.length}`);

/* ---------------------------------------------- ARM R · REACH, AS A DELTA
   Each arm's reach is asserted against a floor measured on 2026-08-07, and the
   floor is a DELTA rather than a bare truthiness check: an arm that finds
   nothing, or finds dramatically less than it did, fails NAMING THE FIGURE.
   `>=` rather than `===` so adding a surface does not fail the harness for the
   wrong reason — the both-directions equality below is what catches that. */
await section("ARM R · reach as a delta", () => {
  ok(W1.length >= 16, `ARM R1: the screen walk found ${W1.length} routes, floor 16 (measured 2026-08-07) — a walk that covers nothing passes everything`);
  ok(W2.length >= 4,  `ARM R2: the object-page walk found ${W2.length} routes, floor 4 (measured 2026-08-07)`);
  ok(W3.length >= 6,  `ARM R3: the hash-route walk found ${W3.length} routes, floor 6 (measured 2026-08-07)`);
  ok(REAL.length >= 26, `ARM R4: the union is ${REAL.length} routes, floor 26 (measured 2026-08-07)`);

  /* AND THE ARMS ARE NOT REDUNDANT. If any arm found only what another already
     found, deleting it would cost nothing and the next session would delete it.
     Each arm is proved to contribute at least one route no other arm sees —
     which is also the evidence that a one-armed walk WOULD miss surfaces. */
  const only = (mine, others) => mine.filter(r => !others.includes(r.split(":")[1] === undefined ? r : r));
  const roots = a => a.map(r => r.split(":")[1]);
  const o1 = roots(W1).filter(k => !roots(W2).includes(k) && !roots(W3).includes(k));
  const o3 = roots(W3).filter(k => !roots(W1).includes(k) && !roots(W2).includes(k));
  ok(o1.length > 0, `ARM R5: the screen walk contributes ${o1.length} routes no other arm sees (${o1.join(", ")})`);
  ok(o3.length > 0, `ARM R6: the hash walk contributes ${o3.length} routes no other arm sees (${o3.join(", ")}) — dropping it would lose them silently`);
  void only;
});

/* ======================================================== THE DESCRIBED SET

   CORRECTED 2026-08-07 (UI-49's rider) — this function used to `assert.ok` on
   the markers and let a `vm` compile error propagate, so a registry block that
   would not parse ended the module and reported ONE line about a missing
   marker while thirty arms downstream never ran. It now RECORDS the failure and
   answers an EMPTY registry, which is the honest shape: every arm below then
   fails on its own floor, naming what it could not find, and the reader sees
   the whole extent of the damage instead of its first symptom. */
function block(marker, exportNames){
  const re = new RegExp(`\\/\\*__${marker}_START__\\*\\/([\\s\\S]*?)\\/\\*__${marker}_END__\\*\\/`);
  const m = re.exec(app);
  const empty = Object.fromEntries(exportNames.map(k => [k, k === "RECIPES" ? [] : {}]));
  if(!m){ ok(false, `FAIL: ${marker} markers not found in app.html`); return empty; }
  try{
    const ctx = {}; vm.createContext(ctx);
    vm.runInContext(m[1] + `;globalThis.__B={${exportNames.join(",")}};`, ctx);
    return ctx.__B;
  }catch(e){
    ok(false, `FAIL: the ${marker} block did not evaluate — ${String((e && e.message) || e)}`);
    return empty;
  }
}
const RAW = block("SURFACES", ["SURFACE_LEVELS", "SURFACES", "RECIPES"]);

/* THE BLOCK IS DATA, AND THE ROUND TRIP IS THE PROOF. A JSON round trip is
   lossless only over data: a function, a regex or a class instance anywhere in
   the registry would come back changed or gone. "Recipes are DATA, never prose"
   is the item's rule and this is the arm that makes it also mean "never code" —
   a recipe carrying a callback is a recipe no generator can ship to a training
   pack and no reviewer can read.

   It is ALSO what makes the comparisons below sound: values built inside a `vm`
   realm carry that realm's prototypes, so deepStrictEqual against a host array
   fails on the prototype while printing two identical-looking arrays. That cost
   a cycle here and is written down so it does not cost the next one. */
const B = JSON.parse(JSON.stringify(RAW));
await section("ARM J · the registry is DATA", () => {
  const rawKeys = Object.keys(RAW.SURFACES).sort();
  const roundKeys = Object.keys(B.SURFACES).sort();
  eq(roundKeys, rawKeys, "ARM J1: the registry survives a JSON round trip unchanged — it is DATA, not code");
  const hunt = (v) => {
    if(typeof v === "function") return true;
    if(v && typeof v === "object") return Object.values(v).some(hunt);
    return false;
  };
  ok(!hunt(RAW.SURFACES) && !hunt(RAW.RECIPES),
     "ARM J2: no surface description and no recipe step carries a function");
});
const { SURFACE_LEVELS, SURFACES, RECIPES } = B;

const DESCRIBED = [];
for(const [id, s] of Object.entries(SURFACES)){
  ok(Array.isArray(s && s.routes), `every surface declares routes: '${id}' does not`);
  /* GUARDED 2026-08-07 (UI-49's rider): the arm above already SAYS the routes
     array is missing, and then the line below threw on it — reporting the same
     defect twice would be harmless, but ending the module over a defect already
     named is how thirty later arms went unreported. */
  for(const r of (s && Array.isArray(s.routes) ? s.routes : [])) DESCRIBED.push({ id, route: r });
}
console.log(`  DESCRIBED: ${Object.keys(SURFACES).length} surfaces carrying ${DESCRIBED.length} routes`);

/* ------------------------------- ARM E · EQUALITY, PROVED IN BOTH DIRECTIONS
   This is the item's centre. Each direction fails on its own, naming the route,
   because "the sets differ" is not an actionable failure. */
await section("ARM E · equality in both directions", () => {
  const describedRoutes = DESCRIBED.map(d => d.route);

  /* E1 · a surface that EXISTS and describes nothing. */
  const undescribed = REAL.filter(r => !describedRoutes.includes(r));
  ok(undescribed.length === 0,
     `ARM E1: ${undescribed.length} route(s) EXIST in the runtime and NO surface describes them: ${undescribed.join(", ")}`);

  /* E2 · a description naming a surface that DOES NOT EXIST. */
  const phantom = DESCRIBED.filter(d => !REAL.includes(d.route));
  ok(phantom.length === 0,
     `ARM E2: ${phantom.length} described route(s) do not exist in the runtime: ${phantom.map(p=>`${p.id} -> ${p.route}`).join(", ")}`);

  /* E3 · and the sets are EQUAL, asserted as sets so neither direction can be
     satisfied by an accident of ordering. */
  eq([...new Set(describedRoutes)].sort(), REAL,
     "ARM E3: the described route set EQUALS the real route set");

  /* E4 · no route is claimed by two surfaces. Two owners is how one of them
     stops being maintained. */
  const seen = new Map();
  for(const d of DESCRIBED){
    ok(!seen.has(d.route), `ARM E4: route '${d.route}' is claimed by both '${seen.get(d.route)}' and '${d.id}'`);
    seen.set(d.route, d.id);
  }
});

/* ------------------------------------------- ARM L · the levels are legible
   CLAUDE.md: absence at one level is not evidence of absence at the next, so an
   answer reporting absence must name its LEVEL. A surface has to make that
   legible rather than leaving it to the caller. */
await section("ARM L · the levels are legible", () => {
  /* The vocabulary is pinned to CLAUDE.md's own sentence rather than kept as a
     fourth copy of it. Read textually, and stated as such — the same shape and
     the same caveat as check-semantics.mjs's knownSchemas pin. */
  const claude = fs.readFileSync(new URL("../../CLAUDE.md", import.meta.url).pathname, "utf8");
  const m = /search\s+\*\*meaning,\s+content,\s+documents,\s+AND\s+the\s+open\s+internet\*\*/.exec(claude);
  ok(m, "ARM L0: CLAUDE.md's four-level sentence was found — if this fails the extraction needs updating, not the vocabulary");
  eq(SURFACE_LEVELS, ["meaning", "content", "documents", "internet"],
     "ARM L1: SURFACE_LEVELS is the four levels CLAUDE.md names, in its order");

  /* NULL-TOLERANT THROUGHOUT, 2026-08-07 (UI-49's rider). Every read below used
     to throw on a surface missing `levels`, so ONE malformed surface reported
     "declares a levels array" and hid L3, L4, L5 and L6 for every OTHER surface
     — the failure mode that made a control breaking several arms look like a
     control breaking one. `lv()` states the absence once and the arms carry on. */
  const lv = (s) => (s && Array.isArray(s.levels)) ? s.levels : [];
  const LEVELS = Array.isArray(SURFACE_LEVELS) ? SURFACE_LEVELS : [];
  for(const [id, s] of Object.entries(SURFACES)){
    ok(Array.isArray(s && s.levels), `ARM L2: surface '${id}' declares a levels array`);
    for(const l of lv(s))
      ok(LEVELS.includes(l), `ARM L3: surface '${id}' declares level '${l}', which is not one of the four`);
    ok(typeof (s && s.purpose) === "string" && s.purpose.length > 20,
       `ARM L4: surface '${id}' says what it is for`);
  }

  /* Every level is reachable SOMEWHERE. A level no surface reaches is a level
     the application cannot honestly report on, and nothing else would say so. */
  for(const l of LEVELS){
    const reach = Object.entries(SURFACES).filter(([, s]) => lv(s).includes(l)).map(([id]) => id);
    ok(reach.length > 0, `ARM L5: no surface reaches the '${l}' level`);
  }

  /* THE EGRESS PIN. `internet` is the one level that leaves the instance, and
     DEC-47 governs it. A surface may only claim it if it actually holds a
     capture-directed op — otherwise the claim is a surface asserting a reach it
     does not have, which is the overclaim class this project is built against. */
  for(const [id, s] of Object.entries(SURFACES)){
    if(!lv(s).includes("internet")) continue;
    ok((s && s.reads || []).includes("acquire"),
       `ARM L6: surface '${id}' claims the internet level but holds no capture op — a surface cannot claim a reach it does not have`);
  }
});

/* ============================== THE OP REGISTRY THE PLANE EMITS (SOURCING) */

const planeSrc = fs.readFileSync(PLANE_INDEX, "utf8");

/* ============ THE VALIDATOR TAKES THE PLANE'S SOURCE, NOT A SET ============

   READ THIS BEFORE CHANGING THE SHAPE BELOW — IT IS THE ITEM'S SHARPEST
   FINDING AND IT WAS FOUND BY A CONTROL, NOT BY REVIEW.

   The first cut of this file built `const OPS = opRegistry(planeSrc)` and then
   proved the sourcing by re-parsing a MUTATED copy of the plane's source into a
   second set and checking the recipes against THAT. A negative control replaced
   `OPS` with a COMPLETE, CURRENTLY-CORRECT HAND COPY of all 131 op names — and
   the suite passed, exit 0, all 357 assertions. THE SOURCING ARM WENT GREEN
   WITH THE DEFECT PRESENT, because the mutation flowed down a PARALLEL code
   path that never touched the set the recipes were actually validated against.
   An arm that proves a parse works proves nothing about whether the parse is
   the thing being used.

   THE FIX IS STRUCTURAL AND IT IS THE ONLY ONE THAT WORKS: the plane's SOURCE
   TEXT is a PARAMETER of the validator. Every op question — recipe steps and
   declared surface reads alike — is answered by `opFailures(...)` applied to a
   source string. The real run passes the real bytes; the sourcing arm passes
   mutated bytes THROUGH THE SAME FUNCTION. A hand-typed list can now only be
   introduced INSIDE `opFailures`, and the moment it is, the mutated call stops
   reporting the renamed op and ARM S6 fails. There is no parallel path left to
   hide in. Verified by re-running that same control against this shape. */
function opsFrom(src){
  const body = tableBody(stripComments(src), /(?:const|let|var)\s+OPS\s*=\s*\{/);
  if(body == null) throw new Error("OPS table not found in bio-plane/src/index.mjs");
  return new Set(topKeys(body));
}

/* THE ONE PLACE any op name is resolved. Returns a list of human-readable
   failures, each naming the step or the surface AND the op, because "the sets
   differ" is not an actionable failure. */
/* NULL-TOLERANT SINCE 2026-08-07 (UI-49's rider) AND THE REASON IS NOT
   TIDINESS: this function is DRIVEN BY ARM S with mutated bytes, so a throw
   inside it is a throw inside the arm whose whole subject is that the parse is
   load-bearing. A recipe with no `steps` used to end the module here. */
function opFailures(surfaces, recipes, planeSource){
  const ops = opsFrom(planeSource);
  const out = [];
  for(const r of (Array.isArray(recipes) ? recipes : [])){
    const steps = (r && Array.isArray(r.steps)) ? r.steps : [];
    for(let i = 0; i < steps.length; i++)
      if(!ops.has(steps[i] && steps[i].op))
        out.push(`RECIPES[${r && r.id}].steps[${i}] names op '${steps[i] && steps[i].op}', which the plane does not emit`);
  }
  for(const [id, s] of Object.entries(surfaces || {}))
    for(const op of ((s && s.reads) || []))
      if(!ops.has(op))
        out.push(`SURFACES.${id} declares read '${op}', which the plane does not emit`);
  return out;
}

/* THE PARSE AND THE RESOLUTION, both recorded as failures rather than thrown —
   a plane source this file cannot parse is a real and reportable fact, and it
   used to be the last thing this suite said. */
let OPS = new Set();
let liveOpFailures = [];
try{ OPS = opsFrom(planeSrc); }
catch(e){ ok(false, `FAIL: the plane's OPS table could not be parsed — ${String((e && e.message) || e)}`); }
try{ liveOpFailures = opFailures(SURFACES, RECIPES, planeSrc); }
catch(e){ ok(false, `FAIL: op resolution threw — ${String((e && e.message) || e)}`); }
console.log(`  plane OPS emitted: ${OPS.size}`);

/* The parse is cross-validated against a figure measured by a DIFFERENT
   instrument — `scripts/coverage.mjs` reported 131/131 ops on main. Two
   instruments agreeing on a number neither derived from the other is evidence;
   this arm is what would have caught the first cut of this parse, which read
   comment text and answered 58. */
await section("ARM S0 · the op parse", () => {
  ok(OPS.size >= 131,
     `ARM S0: the OPS parse found ${OPS.size} ops; coverage.mjs independently reported 131. A parse that answers low is reading comments, not code`);
  ok(OPS.has("search") && OPS.has("acquire") && OPS.has("publishedcase"),
     "ARM S0b: the parse found ops known to exist by name");
  ok(!OPS.has("classes") && !OPS.has("mutating"),
     "ARM S0c: the parse did NOT pick up the tables' own property names — that is what a comment-blind, depth-zero read is for");
});

/* ---------------------------------------------------- ARM S · THE SOURCING
   THE ASSERTION THE ITEM TURNS ON, and the one that had to be rebuilt.

   A hand copy of the op list agrees with the plane at ZERO COST, and an
   equality that costs nothing to produce is not evidence (CLAUDE.md). So the
   drift defence is STRUCTURAL: rename an op in a COPY of the plane's source,
   push those bytes THROUGH THE VERY FUNCTION the real run uses, and the real
   recipes must then fail naming that op.

   The words "through the very function the real run uses" are load-bearing and
   were bought with a failed control — see the note on `opFailures` above.
   Nothing on disk is touched. */
await section("ARM S · the sourcing", () => {
  /* THE REAL RUN. Zero failures against the real bytes. */
  const live = opFailures(SURFACES, RECIPES, planeSrc);
  /* THE HEADLINE NAMES THE STEP AND THE OP. `deepStrictEqual` would print them
     in its diff, but the message line is what a reader sees first and it has to
     be actionable on its own. */
  ok(live.length === 0,
     `ARM S1: against the plane's real source, ${live.length} op name(s) do not resolve — ${live.join(" | ")}`);

  /* GUARDED 2026-08-07 (UI-49's rider). `RECIPES[0].steps[1].op` threw over an
     empty or malformed recipe set, and the arms below it — including S4, the
     one arm in this file that can tell a hand copy apart — never ran. The
     absence is now STATED and S2 onwards report on their own. */
  const target = (((RECIPES || [])[0] || {}).steps || [])[1]
              && (((RECIPES || [])[0] || {}).steps || [])[1].op;
  ok(!!target,
     `ARM S2a: RECIPES[0].steps[1] names an op for the sourcing arm to rename — without one, ARM S4 below cannot tell a hand-typed op list apart from a live parse`);
  ok(!!target && OPS.has(target), `ARM S2: the recipe step's op '${target}' is emitted by the plane as it stands`);

  /* DERIVED, NOT TYPED. The first cut asserted `length + 26` for a suffix that
     is 23 characters long — a hand-typed constant wrong by three, in the arm
     whose entire subject is that hand-typed constants are wrong. Left as a
     note because it is the item's own lesson arriving twice. */
  const SUFFIX = "RENAMEDBYTHESOURCINGARM";
  const mutated = planeSrc.replace(
    new RegExp(`(\\n\\s{2,})${target}(\\s*:\\s*\\{)`),
    `$1${target}${SUFFIX}$2`);
  ok(mutated !== planeSrc && mutated.length === planeSrc.length + SUFFIX.length,
     `ARM S3: the sourcing arm mutated the plane source copy exactly once (+${SUFFIX.length} chars) — an arm that changes nothing proves nothing`);

  /* THE SAME FUNCTION, DIFFERENT BYTES. This is the whole defence. */
  const against = opFailures(SURFACES, RECIPES, mutated);
  const named = against.filter(f => f.includes(`'${target}'`));
  /* THE MESSAGE IS WRITTEN FOR THE FAILING DIRECTION, because that is the only
     direction anybody ever reads it in. The first cut interpolated `named[0]`,
     which is `undefined` exactly when the arm fails — a failure message
     describing the success it did not get. */
  ok(named.length > 0,
     `ARM S4: A HAND-TYPED OP LIST FAILS THIS, AND THIS RUN IS THAT LIST. '${target}' was renamed in a copy of the plane's source and pushed through the SAME validator the real run uses, so validation MUST have failed naming '${target}' — it reported ${against.length} failure(s), none of them naming it. That means the op names are not being read from the plane at all. A complete, currently-correct hand copy passes every other arm in this file; this is the only one that can tell it apart.`);
  ok(against.length > live.length,
     `ARM S5: the failure count MOVED with the source (${live.length} -> ${against.length}) — a validator that answers the same either way is reading something other than the plane`);
  ok(against.every(f => f.includes(`'${target}'`)),
     "ARM S6: the mutation renamed exactly one op — every new failure names it, so the table was not corrupted");

  /* And the parse itself saw the rename, which is what rules out a cached or
     memoised answer standing in for a read. */
  const mutatedOps = opsFrom(mutated);
  ok(!mutatedOps.has(target) && mutatedOps.has(target + "RENAMEDBYTHESOURCINGARM"),
     "ARM S7: the parse read the renamed op out of the mutated bytes");
  ok(mutatedOps.size === OPS.size,
     `ARM S8: the op count is unchanged across the rename (${mutatedOps.size} vs ${OPS.size})`);

  /* The plane's source is untouched on disk. Asserted rather than assumed. */
  ok(fs.readFileSync(PLANE_INDEX, "utf8") === planeSrc,
     "ARM S9: the sourcing arm left bio-plane/src/index.mjs byte-identical");
});

/* ============================================================
   THE ACT REGISTER — UI-52, 2026-08-08. ARM A4's TWO CLAIMS, SPLIT.
   CORRECTED, NEVER EXEMPTED, AND THE DATED REASON IS THE WHOLE ITEM.

   UNTIL TODAY ARM A4 READ, IN ONE LINE:

     ok(homeless.length === 0, "the plane publishes N act(s) no described
        surface hosts: ...")

   THAT ASSERTION CONFLATED TWO CLAIMS THAT ARE NOT THE SAME KIND OF FACT, and
   the second one is FALSE BY DESIGN for part of every wave:

     (a) A SURFACE DESCRIBING SOMETHING THAT DOES NOT EXIST. Fiction. The
         registry claiming reach it has not got. This has NO honest window and
         is unconditional below (ARM A4a), because describing a surface that
         does not exist is the registry LYING and that is the failure this whole
         file was built to catch.

     (b) AN ACT THE PLANE PUBLISHES THAT NO SURFACE HOSTS YET. A GAP, not a lie.
         `IS-BUILD-PLAN.md` builds PLANE-FIRST — PL-2 lands its six member acts
         in W3 and the surfaces that host them are UI-42/UI-43 in W7 and UI-45
         in W8 — so between those waves the property (b) asserted is false while
         every piece of work involved is CORRECT. **AN INSTRUMENT THAT FAILS ON
         CORRECT WORK GETS SWITCHED OFF**, and that is the outcome this rewrite
         exists to prevent. PL-2's own judgement was RIGHT and is not overturned
         here: it declined to describe surfaces that do not exist.

   THE ANSWER IS TO NARROW THE ASSERTION, NEVER TO WEAKEN THE GUARD AND NEVER TO
   DO THE NEIGHBOURING WORK EARLY — REC-71's precedent one layer over, where an
   assertion whose SCOPE overstated what its rows meant was fixed by narrowing
   the scope rather than by softening what it enforced.

   SO (b) BECOMES A NAMED, RATCHETED REGISTER — printed IN FULL on every run,
   with a CEILING so the gap cannot grow silently and FLOORS so the walk cannot
   go blind. Both halves are load-bearing and both were bought:
     · REC-70 — *a ceiling alone passes trivially over nothing*: neutering a
       walk left its ratchet green at 0 of 40.
     · REC-71 — *a floor with slack is not a ratchet*: its census floor sat 19
       codes low and had ALREADY flipped a control from RED to GREEN, passing a
       reader that had lost an entire spelling. Every floor below is set to the
       figure MEASURED on 2026-08-08 with NO slack, and ARM A3's is moved in
       this same turn for exactly that reason (see there).

   THIS REGISTER IS HAND-WRITTEN ON PURPOSE, AND THAT IS NOT THE "PRODUCE SETS
   BY DRIVING" RULE BEING BROKEN — IT IS THE RULE BEING APPLIED. The set that
   must agree with the system is `homeless`, and it IS driven: out of the
   plane's own `ACT_IDS`/`CAPTURE_ACTS` module exports and out of the walked
   registry, never typed. The register is the OTHER side of that comparison —
   an outstanding bill somebody signed. **DERIVING IT FROM `homeless` WOULD MAKE
   IT AGREE AT ZERO COST AND ASSERT NOTHING**, which is this repository's oldest
   rule. If a later session is tempted to compute this list: that is the ratchet
   being removed, and the temptation is why this paragraph is here.

   IT IS ALSO DELIBERATELY UNCOMFORTABLE. Every row names WHO published the act,
   WHICH item owes the surface, and the date the debt opened. A member-facing act
   nobody can reach is a real debt, not a tidy exemption, and the printed block
   below is meant to read as a bill rather than as a list of things that are
   fine. UI-42/UI-43/UI-45 should arrive against a MEASURED obligation instead
   of against somebody's memory. */
const ACTS_AWAITING_SURFACE = [
  { id: "versionaccept",   published_by: "PL-2 / IS-2 (W3)", owed_by: "UI-43 (W7) — the accept ceremony: the four beats on every transition", since: "2026-08-08" },
  { id: "versionreject",   published_by: "PL-2 / IS-2 (W3)", owed_by: "UI-43 (W7) — the accept ceremony: the four beats on every transition", since: "2026-08-08" },
  { id: "versionconsider", published_by: "PL-2 / IS-2 (W3)", owed_by: "UI-43 (W7) — the accept ceremony: the four beats on every transition", since: "2026-08-08" },
  { id: "versionrevert",   published_by: "PL-2 / IS-2 (W3)", owed_by: "UI-43 (W7) — the accept ceremony: the four beats on every transition", since: "2026-08-08" },
  { id: "versionhide",     published_by: "PL-2 / IS-2 (W3)", owed_by: "UI-42 (W7) — version review: the hide-prune offer (DEC-29(b), D-214)", since: "2026-08-08" },
  { id: "versioncurrent",  published_by: "PL-2 / IS-2 (W3)", owed_by: "UI-45 (W8) — IS-3 CURRENT as a project property", since: "2026-08-08" },
];

/* THE ONE PLACE the act/surface partition is computed. The negative controls
   and the over-strictness arm drive THIS function, exactly as ARM S drives
   `opFailures` — because this file's sharpest finding is that an arm proving a
   parse WORKS proves nothing about whether the parse is USED, and a control
   validated down a parallel path went green with the defect present. There is
   no second path here to hide a hand copy in.

   NULL-TOLERANT for UI-49's reason: it is driven with deliberately malformed
   registries, and a throw inside it is a throw inside the arm whose whole
   subject is the partition. */
function actGap(surfaces, planeActs, register){
  const acts = planeActs instanceof Set ? planeActs : new Set(planeActs || []);
  const rows = Array.isArray(register) ? register.filter(r => r && typeof r === "object") : [];
  const registered = new Set(rows.map(r => r.id));
  const hostedSet = new Set(
    Object.values(surfaces || {}).flatMap(s => (s && Array.isArray(s.acts)) ? s.acts : []));
  let placements = 0;
  for(const s of Object.values(surfaces || {}))
    placements += (s && Array.isArray(s.acts)) ? s.acts.length : 0;
  return {
    hostedSet, placements,
    /* (b) the gap: published, not hosted. */
    homeless: [...acts].filter(a => !hostedSet.has(a)),
    /* (a) the fiction: hosted, not published. NO register allowance, ever. */
    fiction: [...hostedSet].filter(a => !acts.has(a)),
    /* the register's own three states, so the bill can be printed truthfully. */
    outstanding: rows.filter(r => acts.has(r.id) && !hostedSet.has(r.id)),
    drained:     rows.filter(r => acts.has(r.id) && hostedSet.has(r.id)),
    unpublished: rows.filter(r => !acts.has(r.id)),
    /* the ceiling's subject: a gap this register never signed for. */
    unregistered: [...acts].filter(a => !hostedSet.has(a) && !registered.has(a)),
    /* the floor's subject: the catalogue OUTSIDE the register. Measured this
       way rather than as a bare `acts.size` so the figure is IDENTICAL before
       and after a register-listed act lands — a floor that had to be bumped by
       the very act it already tracks is a floor with slack built in. */
    baseline: [...acts].filter(a => !registered.has(a)),
  };
}

/* -------------------------------------- ARM A · acts come from the PLANE too
   `ACTS`, `ACT_IDS` and `CAPTURE_ACTS` are IMPORTED as live module exports.
   There is no copy of the act catalogue in app.html and there must never be
   one, so this cannot drift by construction rather than by discipline. */
await section("ARM A · acts come from the plane", () => {
  const planeActs = new Set([...ACT_IDS, ...CAPTURE_ACTS.map(a => a.id)]);
  const G = actGap(SURFACES, planeActs, ACTS_AWAITING_SURFACE);

  /* THE BILL, PRINTED IN FULL AND FIRST — before any assertion, so a later
     throw cannot take it with it, and on GREEN runs as much as on red ones. A
     debt that is only printed when it fails is a debt nobody reads. */
  console.log(`  ACT REGISTER — ${ACTS_AWAITING_SURFACE.length} member-facing act(s) OUTSTANDING: published by the plane, reachable by nobody.`);
  for(const r of ACTS_AWAITING_SURFACE){
    const state = !planeActs.has(r.id) ? "NOT YET PUBLISHED ON THIS TREE"
                : G.hostedSet.has(r.id) ? "SURFACED — STRIKE THIS ROW"
                : "OWED";
    console.log(`    [${state}] ${r.id} — published by ${r.published_by}; owed by ${r.owed_by}; open since ${r.since}`);
  }
  console.log(`  ACT REGISTER totals: ${G.outstanding.length} owed · ${G.drained.length} surfaced-and-strikeable · ${G.unpublished.length} not yet published here · ${G.homeless.length} published-and-unhosted overall`);

  ok(planeActs.size >= 15, `ARM A0: the plane publishes ${planeActs.size} act ids (ACTS ${ACT_IDS.size} + CAPTURE_ACTS ${CAPTURE_ACTS.length})`);
  ok(ACTS.length === ACT_IDS.size, "ARM A0b: ACT_IDS is derived from ACTS and has not been hand-kept beside it");

  for(const [id, s] of Object.entries(SURFACES)){
    ok(Array.isArray(s && s.acts), `ARM A1: surface '${id}' declares an acts array`);
    /* GUARDED 2026-08-07 (UI-49's rider) — see ARM L. */
    for(const a of ((s && Array.isArray(s.acts)) ? s.acts : []))
      ok(planeActs.has(a),
         `ARM A2: surface '${id}' hosts act '${a}', which the plane's own act catalogue does not publish`);
  }
  /* ARM A3's FLOOR MOVED 2026-08-08 (UI-52) FROM 10 TO 18, AND THE OLD FIGURE IS
     THE REASON THIS ITEM DISTRUSTS FLOORS. 10 was set when the registry held
     roughly that many placements; the tree has carried 18 for some time, so the
     floor had EIGHT of slack and would have sat green through the deletion of
     nearly half the act placements in the registry. That is REC-71's finding
     exactly — *a floor with slack is not a ratchet* — arriving in the very arm
     this item came to narrow, and it is moved in the SAME TURN rather than
     noted, because REC-71's own floor went stale twice within hours of being
     written down. MEASURED 2026-08-08: 18, identical with and without PL-2. */
  ok(G.placements >= 18,
     `ARM A3: ${G.placements} act placements are described, floor 18 (measured 2026-08-08, was 10 and eight low) — a registry describing no acts would pass A2 vacuously`);

  /* ---- ARM A4a · THE FICTION HALF. UNCONDITIONAL, AND IT HAS NO REGISTER.
     A surface naming an act the plane does not publish is the registry claiming
     a reach it has not got, and there is no wave, no schedule and no plane-first
     ordering that makes that honest. `ACTS_AWAITING_SURFACE` is not consulted
     here and must never be: the register excuses a MISSING surface, never an
     INVENTED one. Reported in aggregate BESIDE ARM A2's per-surface line on
     purpose — the split is the item, and a reader has to be able to see the two
     halves standing next to each other rather than infer the boundary. */
  ok(G.fiction.length === 0,
     `ARM A4a: ${G.fiction.length} act(s) are DESCRIBED by a surface and published by NO plane catalogue: ${G.fiction.join(", ")}. `
     + `This is the registry describing something that does not exist, and unlike a missing surface it has no honest window — no register entry can excuse it and none is consulted.`);

  /* ---- ARM A4b · THE GAP HALF. NAMED, RATCHETED, AND PRINTED ABOVE.
     THE CEILING. Every act the plane publishes and no surface hosts must appear
     on the register by NAME. A seventh unsurfaced act cannot arrive quietly:
     it is not on the bill, so it fails here naming itself and whoever published
     it has to sign for it. */
  ok(G.unregistered.length === 0,
     `ARM A4b (CEILING): the plane publishes ${G.unregistered.length} act(s) that no surface hosts AND that the act register does not name: ${G.unregistered.join(", ")}. `
     + `A member-facing act nobody can reach is a debt, not an exemption — add it to ACTS_AWAITING_SURFACE with the item that publishes it and the item that owes its surface, or give it a surface. The register stands at ${ACTS_AWAITING_SURFACE.length} row(s) and this act is not one of them.`);

  /* THE DRAIN, WHICH IS WHAT STOPS THE REGISTER BECOMING FURNITURE. A row whose
     act is BOTH published and hosted has been paid: the ceiling must FALL in the
     same commit that surfaces it, and the suite REQUIRES that rather than
     tolerating a stale row. Without this arm the list would only ever grow, and
     a ratchet that cannot turn the other way is just an exemption with a date on
     it. This is the arm that makes the bill drain. */
  ok(G.drained.length === 0,
     `ARM A4c (DRAIN): ${G.drained.length} register row(s) name an act that a described surface NOW HOSTS: ${G.drained.map(r => `${r.id} (owed by ${r.owed_by})`).join(", ")}. `
     + `The debt is paid — STRIKE THE ROW from ACTS_AWAITING_SURFACE in this same commit. A register that only grows is an exemption list wearing a ratchet's clothes.`);

  /* THE FLOORS. A ceiling alone passes trivially over nothing (REC-70), so both
     corpora the partition is computed over are pinned, and both print their own
     size so a walk that found nothing reads as a FAILURE NAMING ZERO rather than
     as a clean answer.

     FLOOR 1 is measured over the catalogue OUTSIDE the register, which is why it
     is 15 both before and after PL-2 publishes its six: a floor that had to be
     raised by the very acts it already tracks would carry that slack until
     somebody remembered. MEASURED 2026-08-08: 15 with PL-2 and 15 without.
     FLOOR 2 is the registry walk. If it goes blind every act reads as homeless
     and the ceiling fires anyway — but it would fire naming twenty-one innocent
     acts, and the reader needs to be told the WALK broke rather than sent to
     re-house the entire catalogue. MEASURED 2026-08-08: 15, both trees. */
  ok(G.baseline.length >= 15,
     `ARM A4d (FLOOR): the act catalogue OUTSIDE the register holds ${G.baseline.length} act(s), floor 15 (measured 2026-08-08, identical with and without PL-2). `
     + `A catalogue read as empty makes every arm above pass over nothing — the ceiling especially, which is satisfied by a gap of zero for the wrong reason.`);
  ok(G.hostedSet.size >= 15,
     `ARM A4e (FLOOR): the registry walk found ${G.hostedSet.size} distinct hosted act(s) across ${G.placements} placement(s), floor 15 (measured 2026-08-08, both trees). `
     + `A walk that found nothing would make every published act read as unhoused and send the reader to re-house a catalogue that was never the problem.`);

  /* ---- ARM A4f · OVER-STRICTNESS. A CORRECT ALTERNATIVE MUST PASS.
     The surfaces UI-42/UI-43/UI-45 eventually write will not look like anything
     written here: different surface ids, different kinds, fields this file has
     never heard of, the acts listed in an order nobody chose. If the partition
     only recognised the shapes its author imagined, it would refuse to drain on
     the day the debt is actually paid — and the register would become permanent
     furniture for the one reason nobody would think to check.

     DRIVEN THROUGH `actGap` ITSELF, not through a re-implementation, so this arm
     cannot pass over a copy the real run does not use. */
  const alienSurfaces = {
    "reading-review-workbench": { kind: "workbench", lens: "basis", ordering: ["by-recency"],
      acts: [...ACTS_AWAITING_SURFACE.map(r => r.id)].reverse(), routes: [], levels: [] },
  };
  const alienActs = new Set(ACTS_AWAITING_SURFACE.map(r => r.id));
  const AG = actGap(alienSurfaces, alienActs, ACTS_AWAITING_SURFACE);
  eq(AG.homeless, [],
     "ARM A4f (over-strictness): a surface shaped nothing like this file's fixtures — an id nobody here wrote, an unfamiliar `kind`, fields this file never mentions, the acts in reverse order — still HOSTS them. A partition that only recognised the author's shapes would refuse to drain on the day the debt is paid.");
  eq(AG.drained.length, ACTS_AWAITING_SURFACE.length,
     `ARM A4g (over-strictness): and every register row reads as DRAINED against that unfamiliar surface (${AG.drained.length} of ${ACTS_AWAITING_SURFACE.length}) — the drain fires on the alternative spelling, so the ceiling really can fall.`);
});

/* --------------------------------- ARM D · declared reads are real and reached */
await section("ARM D · declared reads are real and reached", () => {
  /* The five seams `check-mock-envelope.mjs` declares. Pinned to that file so a
     sixth seam added there cannot leave this walk reading the wrong shapes —
     two instruments over one fact, neither one holding a private copy. */
  const cme = fs.readFileSync(new URL("../check-mock-envelope.mjs", import.meta.url).pathname, "utf8");
  const seamDecl = /const SEAMS = new Set\(\[([^\]]*)\]\)/.exec(cme);
  ok(seamDecl, "ARM D0: check-mock-envelope.mjs's SEAMS declaration was found — if this fails the extraction needs updating");
  /* GUARDED 2026-08-07 (UI-49's rider): D0 already SAYS the declaration was not found, and then this line threw on it, taking D1..D5 with it. */
  const seams = [...String(seamDecl ? seamDecl[1] : "").matchAll(/"([a-z]+)"/gi)].map(m => m[1]);
  ok(seams.length >= 4, `ARM D0b: ${seams.length} transport seams read from check-mock-envelope.mjs (${seams.join(", ")})`);

  const callRe = new RegExp(`\\b(?:${(seams.length ? seams : ["recR"]).join("|")}|apiR|apiQ|intentPreflight)\\(\\s*"([a-z]+)"`, "g");
  const called = new Set([...code.matchAll(callRe)].map(m => m[1]));
  ok(called.size >= 50, `ARM D1: ${called.size} ops are called statically from app.html, floor 50 — an empty call set would make D3 vacuous`);

  let declared = 0;
  for(const [id, s] of Object.entries(SURFACES)){
    ok(Array.isArray(s && s.reads), `ARM D2: surface '${id}' declares a reads array`);
    for(const op of ((s && Array.isArray(s.reads)) ? s.reads : [])){
      declared++;
      /* Resolved through `opFailures`, the SAME function ARM S drives with
         mutated bytes, so there is exactly one path from a declared op name to
         the plane's source and no second one to hide a hand copy in. */
      ok(!liveOpFailures.some(f => f.includes(`SURFACES.${id}`) && f.includes(`'${op}'`)),
         `ARM D3: surface '${id}' declares read '${op}', which the plane does not emit`);
      ok(called.has(op), `ARM D4: surface '${id}' declares read '${op}', which app.html never calls — a described read nothing performs is fiction`);
    }
  }
  ok(declared >= 30, `ARM D5: ${declared} reads are described, floor 30`);
});

/* ================================================= RECIPES ARE DATA, VALIDATED */
await section("RECIPES are data, validated", () => {
  ok(Array.isArray(RECIPES) && RECIPES.length >= 1, "ARM P0: at least one recipe is authored");
  /* GUARDED THROUGHOUT 2026-08-07 (UI-49's rider). `r.steps.length` and
     `SURFACES[st.surface].levels` both threw over a recipe this file's own arms
     had ALREADY reported as malformed — so P3 named one broken recipe and P4,
     P5 and P6 never ran for any of the others. `stepsOf` and `surfOf` state the
     absence once and let every remaining recipe be judged. */
  const RECIPE_LIST = Array.isArray(RECIPES) ? RECIPES.filter(r => r && typeof r === "object") : [];
  const stepsOf = (r) => (r && Array.isArray(r.steps)) ? r.steps.map(s => s && typeof s === "object" ? s : {}) : [];
  const surfOf = (st) => (SURFACES && SURFACES[st && st.surface]) || {};
  const ids = new Set();
  let steps = 0;
  for(const r of RECIPE_LIST){
    ok(typeof r.id === "string" && r.id.length > 3, "ARM P1: every recipe has an id");
    ok(!ids.has(r.id), `ARM P1b: recipe id '${r.id}' is declared twice`);
    ids.add(r.id);
    ok(typeof r.goal === "string" && r.goal.length > 10, `ARM P2: recipe '${r.id}' states its goal`);
    ok(Array.isArray(r.steps) && r.steps.length >= 2, `ARM P3: recipe '${r.id}' is an ORDERED LIST of steps, not prose`);

    const ss = stepsOf(r);
    for(let i = 0; i < ss.length; i++){
      const st = ss[i]; steps++;
      /* THE TWO BUILD-FAILING RESOLUTIONS, each naming the step AND the thing. */
      ok(Object.prototype.hasOwnProperty.call(SURFACES, st.surface),
         `RECIPES[${r.id}].steps[${i}] names surface '${st.surface}', which is not a described surface`);
      /* Same single path as ARM D3 — `opFailures` against the plane's bytes. */
      ok(!liveOpFailures.some(f => f.startsWith(`RECIPES[${r.id}].steps[${i}] names op`)),
         `RECIPES[${r.id}].steps[${i}] names op '${st.op}', which the plane does not emit`);
      ok(typeof st.why === "string" && st.why.length > 10,
         `RECIPES[${r.id}].steps[${i}] says why it is next — a step with no reason is prose wearing a list's clothes`);
    }
  }
  ok(steps >= 6, `ARM P4: ${steps} recipe steps are validated, floor 6 — a recipe set with no steps would pass every arm above vacuously`);

  /* ARM P5 · A RECIPE MAY NOT CLAIM A REACH ITS OWN STEPS DO NOT HAVE. The
     levels a recipe can honestly answer at are DERIVED from the surfaces it
     visits, never declared beside them, so the two cannot disagree. */
  for(const r of RECIPE_LIST){
    const answers = [...new Set(stepsOf(r).flatMap(s => {
      const L = surfOf(s).levels; return Array.isArray(L) ? L : [];
    }))];
    if(r.intent === "FIND")
      ok(answers.length > 0,
         `ARM P5: recipe '${r.id}' is a FIND but every surface it visits reaches NO level — it could never honestly report an absence`);
  }

  /* ARM P6 · a step naming a surface with `pending` content cannot be relied on
     to answer anything, because the thing that publishes it does not exist. */
  for(const r of RECIPE_LIST){
    const ss = stepsOf(r);
    for(let i = 0; i < ss.length; i++)
      ok(!surfOf(ss[i]).pending,
         `ARM P6: RECIPES[${r.id}].steps[${i}] routes through '${ss[i].surface}', whose content is still unpublished`);
  }
});

/* ============ THE ONCE-ONLY RUNNING-SESSION SURFACE (E10) ============
   This is where the two halves of UI-38 SHARE ONE SURFACE rather than growing
   two: the running-session surface is an entry in the same registry as every
   other surface, walked by the same three arms, and its `kind` is what makes
   "designed once for all AI features" a build failure rather than a promise. */
await section("ARM X · the once-only running-session surface", () => {
  const aiKind = Object.entries(SURFACES).filter(([, s]) => s && s.kind === "ai-session");
  ok(aiKind.length === 1,
     `ARM X1: THERE IS EXACTLY ONE RUNNING-SESSION SURFACE. Found ${aiKind.length} (${aiKind.map(a=>a[0]).join(", ")}) — a second AI feature growing a second surface is the mirror-and-drift class arriving at the UI layer, and §14a says this surface is designed ONCE for every AI-based function.`);

  /* GUARDED 2026-08-07 (UI-49's rider): destructuring `aiKind[0]` threw when
     there was no such surface, so X1 reported the absence and X2..X5 — four
     further facts about the SAME defect — were never reached. */
  const [aiId, ai] = aiKind[0] || ["(no ai-session surface)", {}];
  const consumers = Array.isArray(ai.consumers) ? ai.consumers : [];
  ok(Array.isArray(ai.consumers) && ai.consumers.length >= 2,
     `ARM X2: '${aiId}' names the features that share it (${consumers.join(", ")}) — one consumer would mean it had not been shared`);
  ok(consumers.includes("assistant") && consumers.includes("investigative-session"),
     "ARM X3: the assistant pilot and the investigative session are BOTH consumers of the one surface");

  /* ARMS X4 AND X5 ARE CORRECTED 2026-08-07 (UI-47), NOT EXEMPTED, AND THE
     REASON IS DATED HERE BECAUSE THE OLD ASSERTIONS WERE RIGHT WHEN WRITTEN.

     X4 read `ai.pending.publishers.length > 0` and X5 read `ai.reads === []`,
     both justified by "no op publishes a run yet". **IS-6 LANDED ON 2026-08-07
     AND `op=airun` PUBLISHES THE RUN**, so both assertions now pin a world that
     has moved: X4 would require the surface to keep declaring a gap that has
     closed, and X5 would forbid it from naming the op it actually reads. Left
     standing, they would have made the honest change fail the build — which is
     the exact inversion `CLAUDE.md`'s correct-superseded-tests rule exists to
     prevent.

     WHAT REPLACES THEM IS A PROPERTY RATHER THAN EITHER STATE, so it survives
     the next publisher too: a surface must be able to say where its content
     comes from — by NAMING the ops it reads, or by DECLARING what is still
     pending. **NEITHER is the failure**, and so is BOTH: a surface that reads an
     op while still advertising the gap is describing a system that no longer
     exists. This is the shape UI-46 measured the cost of one register over — a
     stated-and-now-false claim is worse than an unstated one. */
  const namesItsRead = Array.isArray(ai.reads) && ai.reads.length > 0;
  const declaresAGap = !!(ai.pending && Array.isArray(ai.pending.publishers) && ai.pending.publishers.length > 0);
  ok(namesItsRead !== declaresAGap,
     `ARM X4 (corrected 2026-08-07, UI-47): the surface says where its content comes from — it NAMES the ops it reads (${JSON.stringify(ai.reads||[])}) or DECLARES what is still pending (${declaresAGap ? JSON.stringify(ai.pending.publishers) : "nothing"}), and exactly one of those is true. Neither would be a surface that cannot account for what it renders; BOTH would be a surface still advertising a gap that has closed.`);
  ok(namesItsRead,
     "ARM X4b: and as of IS-6 it is the naming side — the run is published, so the gap is closed rather than declared");
  eq(ai.reads, ["airun"],
     "ARM X5 (corrected 2026-08-07, UI-47): the surface reads `op=airun` and NOTHING ELSE. The once-only surface renders ONE run record; the observation log (`op=airunlog`) is a different read for a different question, and the transcript is never asked of the plane at all (DEC-61). That the op is real is not asserted here — ARM D3 resolves it through `opFailures` against the plane's own source, the same function ARM S drives with mutated bytes.");
});

/* ---- ARM Y · the renderers. Driven as pure functions over published records. */
await section("ARM Y · the renderers", async () => {
  const srcM = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(app);
  ok(srcM, "ARM Y0: the AI_SESSION block markers were found in app.html");
  /* GUARDED 2026-08-07 (UI-49's rider): `src[1]` on a null match threw, and the
     twenty-odd renderer arms below never ran. */
  const src = srcM || [null, ""];
  ok(src[1].length > 1000, `ARM Y0b: the AI_SESSION block is ${src[1].length} chars — an empty block would make every arm below vacuous`);

  /* THE ASKED-OPS RECORDER. `recR` is the block's one door to the plane, and
     the context supplies it so the read can be OBSERVED rather than inferred.
     It answers whatever the arm queued, in the plane's own envelope-opened
     shape (`recR` returns `j.result`, so the block sees `{run, found, session}`). */
  const ASKED = [];
  let ANSWER = { run: null, found: false, session: null };
  /* NORMALISED ACROSS THE REALM BOUNDARY. Objects the vm builds carry the vm's
     own `Object.prototype`, so `deepStrictEqual` reports two identical-looking
     values as different — which is a comparison failing for a reason that has
     nothing to do with the subject. Round-tripping through JSON is the same
     equality the rest of this repository's harnesses use for exactly this. */
  const plain = (v) => JSON.parse(JSON.stringify(v === undefined ? null : v));
  const ctx = { window: { addEventListener(){} }, localStorage: null, location: undefined,
                esc: s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),
                $: () => null, JSON, Object, Array, console,
                recR: async (op, params) => { ASKED.push({ op, params }); return ANSWER; } };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  /* CORRECTED 2026-08-08 (UI-38), NEVER EXEMPTED — and the correction is the
     item. `aiSessionBudgetHtml`, `aiSessionPrincipalHtml` and
     `aiSessionConditionHtml` were three renderers each keyed to ONE nested
     field name, and that list is why the run's BIAS BLOCK (PL-12/D-84, published
     by `op=airun` on `main`) rendered NOWHERE: the plane published a fourth
     nested condition and no renderer carried its name. They are collapsed into
     `aiSessionBlockHtml`, which knows no field names. Every claim the arms below
     made — the budget's two figures, both principals, the condition verbatim,
     and the over-strictness shape — is RE-MADE through the replacement rather
     than dropped, and one arm is ADDED for the shape that was invisible. */
  vm.runInContext(src[1] + `;globalThis.__A={aiSessionRead,aiSessionTranscript,aiSessionInContext,aiSessionIndicatorHtml,aiSessionPairsHtml,aiSessionBlockHtml,aiSessionPanelHtml,aiSessionRouteFromHash};`, ctx);
  const A = ctx.__A;

  /* ARM Y1 IS CORRECTED 2026-08-07 (UI-47), NOT EXEMPTED. It read
     `eq(A.aiSessionRead({session:"S1"}), null)` with the reason *"the read
     returns null today, because no op publishes a run"*. IS-6 landed and
     `op=airun` publishes one, so that assertion now pins the opposite of what
     the surface must do.

     AND IT WOULD HAVE GONE ON PASSING, WHICH IS THE PART WORTH RECORDING. This
     context is isolated and used to supply no `recR` at all, so the wired read's
     `catch` would have swallowed a ReferenceError and answered null — the
     superseded assertion would have stayed GREEN over a read that never
     happened. A pin satisfied by the code doing nothing stops being a pin the
     moment the code does something. So the corrected arm OBSERVES THE ASK. */
  ASKED.length = 0;
  ANSWER = { run: "S1", found: true, session: { id: "S1", status: "running", ticks: 4 } };
  const y1 = await A.aiSessionRead({ session: "S1" });
  eq(plain(ASKED), [{ op: "airun", params: { run: "S1" } }],
     "ARM Y1 (corrected 2026-08-07, UI-47): the read ASKS THE PLANE — one call, op=airun, carrying the run id and nothing else");
  eq(plain(y1), { id: "S1", status: "running", ticks: 4 },
     "ARM Y1b: and it returns the record's own `session`, unwrapped and unreshaped");
  ASKED.length = 0;
  ANSWER = { run: "S2", found: false, session: null };
  eq(await A.aiSessionRead({ session: "S2" }), null,
     "ARM Y1c: `session: null` reads as null — the honest absence the plane publishes for a run that does not exist AND for one the viewer may not see, which answer identically on purpose");
  eq(await A.aiSessionRead({}), null,
     "ARM Y1d: and no run id is asked for at all rather than asked as an empty one");
  eq(ASKED.length, 1,
     "ARM Y1e: exactly one ask happened across Y1c and Y1d — an id-less read must not reach the plane");
  eq(A.aiSessionIndicatorHtml(null, { type: "inquiry", id: "INQ-1" }), "",
     "ARM Y2: no session record means NO INDICATOR at all");
  eq(A.aiSessionPanelHtml(null, null), "",
     "ARM Y3: no session record means an empty panel, carrying no sentence");

  /* Y4 · the indicator appears only for a session running in THIS context. */
  const running = { id: "AIS-1", label: "", context: { type: "inquiry", id: "INQ-1" } };
  ok(A.aiSessionIndicatorHtml(running, { type: "inquiry", id: "INQ-1" }).includes("ai-run"),
     "ARM Y4: a session running in this context shows the indicator");
  eq(A.aiSessionIndicatorHtml(running, { type: "inquiry", id: "INQ-2" }), "",
     "ARM Y5: a session running in a DIFFERENT context shows nothing here");
  eq(A.aiSessionIndicatorHtml(running, { type: "project", id: "INQ-1" }), "",
     "ARM Y6: the context TYPE is compared too, not only the id");

  /* Y7 · F11 — THE BUDGET AND ITS LIVE CONSUMPTION ARE ON THE SURFACE.
     §14b.6 records the bound and §19 measured that a member could only read it
     afterwards. A bound a member can only read afterwards is not a bound they
     can act on. */
  const withBudget = { id: "AIS-2", context: { type: "project", id: "PRJ-9" },
    budget: [ { bound: "fetches", limit: 200, consumed: 37 },
              { bound: "sub-sessions", limit: 4, consumed: 1 } ],
    principal: { claude_account: "project", plane_credential: "token:ai" } };
  /* JUDGED THROUGH THE ONE RENDERER since 2026-08-08 (UI-38). The claim is
     unchanged — every figure the record published for every bound is on the
     surface — and it is now made against the function a member's panel actually
     composes with, rather than against a budget-shaped renderer that existed
     only because `budget` had a name somebody wrote down. */
  const bh = A.aiSessionBlockHtml(withBudget);
  for(const frag of ["fetches", "200", "37", "sub-sessions", "4", "1"])
    ok(bh.includes(frag), `ARM Y7: the budget line carries the published '${frag}'`);
  /* THE PRINCIPAL BLOCK ON ITS OWN, deliberately, and NOT the whole record.
     `withBudget.context.type` is also the string "project", so asking the whole
     panel whether it contains "project" would pass for a reason that has
     nothing to do with who pays — an equality that costs nothing, in the arm
     whose subject is that the cascade LEVEL reaches the member. */
  const ph = A.aiSessionBlockHtml(withBudget.principal, "principal");
  ok(ph.includes("project"),
     "ARM Y8: WHICH ACCOUNT PAYS is on the surface — §14a already requires the record to name the cascade level");
  /* Written positively. This arm was first spelled `!x.includes(...) === false`,
     which is correct and unreadable — and an assertion nobody can read at a
     glance is one that gets "fixed" into its own opposite later. */
  ok(ph.includes("token:ai"),
     "ARM Y8b: the plane-credential principal is named BESIDE the Claude account — two different principals, and an act must say both (DEC-27(b), DEC-55.4)");
  ok(A.aiSessionPanelHtml(withBudget, null).includes("token:ai"),
     "ARM Y8c: and it survives composition — the panel a member actually sees carries it, so Y8's block-level pin is not the only path");

  /* Y9 · IT DERIVES NOTHING. A percentage, a remainder or a judgement would be
     this surface computing a fact the record did not state. The pin is over the
     OUTPUT rather than over the source, so a derivation introduced any way at
     all is caught. */
  const derived = ["18%", "81%", "163", "3 remaining", "nearly", "almost", "exhausted", "%"];
  for(const d of derived)
    ok(!bh.includes(d), `ARM Y9: the budget line does not compute '${d}' — both figures are published; a third one would be this surface's own claim`);

  /* Y10 · THE CONDITION IS THE RECORD'S OWN WORDS, VERBATIM. The plane's
     condition vocabulary carries teaching-grade explanations and they are
     surfaced as they arrived, never paraphrased. */
  const stopped = { id: "AIS-3", context: { type: "project", id: "PRJ-9" },
    condition: { kind: "runtime-ceiling-reached",
                 detail: "a CPU or subrequest ceiling was reached (D-54, D-56)" } };
  const ch = A.aiSessionBlockHtml(stopped.condition, "condition");
  ok(ch.includes("runtime-ceiling-reached"), "ARM Y10: the condition kind is rendered");
  ok(ch.includes("a CPU or subrequest ceiling was reached (D-54, D-56)"),
     "ARM Y11: the plane's own explanation is rendered VERBATIM, not paraphrased");

  /* ARM Y11b · THE DEFECT UI-38 MEASURED ON 2026-08-08, AS A REGRESSION
     SENTINEL. §11 records THREE conditions a run was formed under. `op=airun`
     publishes the bias block today (PL-12/D-84) and the panel rendered NOT ONE
     FIELD of it, because the only generic renderer skipped objects and the three
     dedicated ones were `principal`, `budget` and `condition`. The shape below
     is the plane's own, taken from `store.mjs`'s `#biasForRun`, and every value
     in it must reach the member. THE ARM IS DELIBERATELY NOT LIMITED TO `bias`:
     `standard` — §11's third condition, stored in `ai_runs.standard_pair` and
     NOT published by `aiRunRead` on `main` as this was written (REC-74) — is
     driven here under a name the surface has never seen, so the day it is
     published the panel already carries it. */
  const conditioned = { id: "AIS-3b", status: "running",
    context: { type: "inquiry", id: "INQ-4" },
    bias: { in_force: true, stated: null,
            manifest: { scope: "instance", scope_id: "", statements_sha: "sha-recorded", bundles: [] },
            now: { in_force: true, statements_sha: "sha-current", bundles: [] },
            moved: true },
    standard: { in_force: false, stated: "no bar was in force", basis: "no-project" } };
  const cond = A.aiSessionPanelHtml(conditioned, null);
  for(const frag of ["in_force", "true", "sha-recorded", "sha-current", "moved", "instance"])
    ok(cond.includes(frag), `ARM Y11b: the run's LENS reaches the member — '${frag}' is on the panel`);
  for(const frag of ["standard", "no bar was in force", "basis", "no-project"])
    ok(cond.includes(frag), `ARM Y11c: a condition the surface has NO renderer named after still renders — '${frag}'`);

  /* Y12 · THE TRANSCRIPT IS DEVICE-LOCAL (DEC-61) AND NEVER THE PLANE'S. */
  const store = { getItem: k => k === "ai-transcript:AIS-4" ? JSON.stringify(["read op=list", "formed a version"]) : null };
  eq(A.aiSessionTranscript("AIS-9", store), null,
     "ARM Y12: a transcript this device does not hold reads as absent");
  ok((A.aiSessionTranscript("AIS-4", store) || []).length === 2,
     "ARM Y13: a transcript this device holds is read from the DEVICE, not fetched");
  /* ARM Y14 IS CORRECTED 2026-08-07 (UI-47), NOT EXEMPTED, AND THE CORRECTION
     IS THE MORE INTERESTING HALF OF THIS ITEM.

     It read `!src[1].includes("recR(") && !src[1].includes("recPostR(")` under
     the heading *"the running-session block reaches the plane for NO
     transcript"*. That assertion did not test DEC-61. It tested that the block
     called NOTHING — which was indistinguishable from DEC-61 only while the
     block had no read at all, and became false the moment IS-6 gave it one. **A
     rule that is satisfied by the code doing nothing is not a rule; it is a
     coincidence with the same shape.**

     THE RULE DEC-61 ACTUALLY STATES SURVIVES AND IS NARROWER: the transcript is
     device-local, so the block may ask the plane for the RUN and must never ask
     it for the TRANSCRIPT. Pinned three ways, none of them a spelling:
       (a) the ONLY op names the block passes to a transport are checked against
           the plane's emitted set and against a whitelist of exactly one;
       (b) `aiSessionTranscript`'s own body — sliced from the source — reaches no
           transport at all, so the device read cannot quietly become a fetch;
       (c) no write transport appears anywhere in the block: this surface reads a
           run, and a running-session surface that POSTs is a different item. */
  {
    const stripped = src[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
    const asked = [...stripped.matchAll(/\b(?:recR|recPostR|rec|recPost|api|apiR|apiQ|actAsk|intentAsk)\(\s*"([a-z]+)"/g)]
      .map(m => m[1]);
    console.log(`  ARM Y14 corpus: ${stripped.length} chars of comment-stripped block; ops asked of the plane: ${asked.length ? asked.join(", ") : "(none)"}`);
    eq(asked, ["airun"],
       "ARM Y14 (corrected 2026-08-07, UI-47): the block asks the plane for EXACTLY the run — op=airun, once — and for nothing else. `op=airunlog` is a different read for a different question and the transcript is never asked of the plane at all (DEC-61).");
    ok(OPS.has("airun"),
       "ARM Y14b: and `airun` is an op the PLANE EMITS, resolved against its own source rather than against this file's opinion");
    const tSlice = /function aiSessionTranscript\([\s\S]*?\n\}/.exec(stripped);
    ok(tSlice && tSlice[0].length > 100,
       `ARM Y14c: aiSessionTranscript's body is locatable and non-trivial (${tSlice ? tSlice[0].length : 0} chars) — a slice that found nothing would make Y14d vacuous`);
    ok(tSlice && !/\b(?:recR|recPostR|rec|recPost|api|apiR|apiQ|fetch)\s*\(/.test(tSlice[0]),
       "ARM Y14d: THE TRANSCRIPT ITSELF reaches no transport — DEC-61 puts it on the device, and a fetch inside this function would be the ruling undone in code");
    ok(!/\b(?:recPost|recPostR|actAsk|intentAsk)\s*\(/.test(stripped),
       "ARM Y14e: and the block WRITES nothing — it renders a run it did not cause");
  }

  /* Y15 · OVER-STRICTNESS. A record shaped unlike anything written here must
     RENDER. A renderer that only accepts the shapes its author imagined is a
     fixture testing itself, and it would break the day IS-6 chooses its names. */
  const alien = { id: "AIS-7", context: { type: "inquiry", id: "INQ-3" },
    budget: [ { meter: "wall-clock-across-resumptions", ceiling: "18m", spent_so_far: "4m" },
              { meter: "tokens", ceiling: 400000, spent_so_far: 91234 } ],
    principal: { paid_by: "member", who: "MEM-3" } };
  const ah = A.aiSessionBlockHtml(alien);
  for(const frag of ["wall-clock-across-resumptions", "18m", "4m", "tokens", "400000", "91234"])
    ok(ah.includes(frag), `ARM Y15: a bound named nothing like the author's fixtures still renders its '${frag}'`);
  ok(ah.includes("MEM-3"),
     "ARM Y16: a principal shape the author never wrote still names who pays");
  ok(A.aiSessionPanelHtml(alien, null).includes("ceiling"),
     "ARM Y17: the whole panel composes over an unfamiliar shape");
});

/* ---- ARM N · THE REGISTRY IS NOT MEMBER-FACING, so DEC-49 is not preempted */
await section("ARM N · the registry is not member-facing", () => {
  /* Nothing in the SURFACES block is rendered. The `purpose` strings are
     DOCUMENTATION for the assistant's training pack, and the proof is that no
     render path reads them: `SURFACES` and `RECIPES` are referenced nowhere
     outside their own block. If that ever changes, the wording in them becomes
     member-facing and DEC-49 governs it — so the pin is here, at the boundary,
     rather than as a comment nobody re-checks. */
  const before = code.slice(0, code.indexOf("SURFACE_LEVELS"));
  const after = code.slice(code.indexOf("const RECIPES"));
  const afterBlock = after.slice(after.indexOf("];") + 2);
  const refs = [...(before + afterBlock).matchAll(/\bSURFACES\b|\bRECIPES\b|\bSURFACE_LEVELS\b/g)];
  ok(refs.length === 0,
     `ARM N1: the registry is read by NO render path (${refs.length} reference(s) outside its own block) — its purpose strings are documentation, so no member-facing wording DEC-49 would decide has been authored here`);
  ok(afterBlock.length > 100000,
     `ARM N2: the "outside the block" corpus is ${afterBlock.length} chars — an empty corpus would make N1 pass over nothing`);
});

/* ---- ARM V · refusal text is SURFACED, never COPIED
   The plane's ~305 teaching-grade `detail:` strings are the assistant's answer
   key and are to be surfaced VERBATIM. A COPY of one in this runtime is the
   drift hazard, not the fidelity: the copy is what goes stale. */
await section("ARM V · refusal text is surfaced, never copied", () => {
  const planeDetails = [...planeSrc.matchAll(/detail:\s*"([^"]{50,})"/g)].map(m => m[1]);
  ok(planeDetails.length >= 20, `ARM V0: ${planeDetails.length} long detail strings read from the plane, floor 20 — an empty corpus would make V1 vacuous`);
  const copied = planeDetails.filter(d => app.includes(d));
  ok(copied.length === 0,
     `ARM V1: ${copied.length} of the plane's own refusal explanations are COPIED into app.html: ${copied.slice(0,2).join(" | ")}`);
});

/* ============================================================
   ARM Z · THE HARNESS ITSELF ACCUMULATES — UI-49's RIDER, PROVED IN-SUITE ON
   EVERY RUN RATHER THAN ONLY WHEN SOMEBODY REMEMBERS TO BREAK SOMETHING.

   The rider is *make it accumulate*, and the acceptance is *proved by a control
   that breaks SEVERAL arms and requires ALL of them to report*. That control is
   RUN against the real registry and recorded in this file's NEGATIVE CONTROL
   header. This arm is the half that runs unattended: it drives the SAME `ok`,
   `eq` and `section` machinery every arm above went through — a second, gentler
   collector built here would be an instrument testing itself — and requires
   that several failures and a THROW all report, instead of the first one
   ending the file.

   IT IS ALSO A POLARITY CHECK IN BOTH DIRECTIONS: passing checks must not be
   counted as failures, or "everything reports" would be satisfied by a
   collector that simply calls everything broken. */
{
  const REAL_FAILS = fails.length;   /* the file's own state, restored below */
  const REAL_N = n;
  const probe = [];
  const pushed = (m) => probe.push(m);
  /* THE SAME FUNCTIONS. `fails` is the array `ok`/`eq`/`section` write to, so
     driving them here writes into it — and the arm reads what THEY wrote and
     then puts the file's own tally back exactly as it found it. */
  const silence = console.error; console.error = () => {};
  try{
    ok(false, "ARM Z probe 1 — a failing check");
    ok(false, "ARM Z probe 2 — a SECOND failing check, which a throwing assert would never have reached");
    eq([1, 2], [1, 3], "ARM Z probe 3 — a failing deep comparison");
    ok(true,  "ARM Z probe 4 — a PASSING check, which must not be counted as a failure");
    await section("ARM Z probe section", () => { throw new TypeError("probe: reading 'steps' of undefined"); });
    ok(false, "ARM Z probe 5 — a check AFTER a section threw");
  } finally { console.error = silence; }
  for(const m of fails.slice(REAL_FAILS)) pushed(m);
  /* RESTORE, so this arm's deliberate failures do not fail the file. The
     restore is by SLICE rather than by count, and the arm below re-reads the
     array to prove it actually happened — a control that left the collector
     dirty would turn every future run red for the wrong reason. */
  fails.length = REAL_FAILS;
  n = REAL_N;

  const namedAll = ["probe 1", "probe 2", "probe 3", "probe 5"]
    .filter(t => probe.some(m => m.includes(t)));
  ok(namedAll.length === 4,
     `ARM Z1: FIVE failures were driven through this file's OWN collector and ${namedAll.length} of the 4 non-section ones reported (${namedAll.join(", ") || "none"}). `
     + `Before 2026-08-07 this file's \`ok\` was \`assert.ok\`, so probe 1 would have ended the module and probes 2, 3 and 5 would never have been seen — `
     + `which is exactly what CONDUCT observed at UI-47's integration, where a control breaking several arms reported only ARM D4.`);
  ok(probe.some(m => m.includes("SECTION 'ARM Z probe section' THREW")),
     "ARM Z2: AND A THROW IS RECORDED AS A FAILURE NAMING ITS SECTION rather than ending the file — an accumulating `ok` alone does not fix this, because a TypeError never goes through `ok` at all, and six of this file's own walks could raise one over a malformed registry");
  ok(probe.some(m => m.includes("probe 5")),
     "ARM Z3: and the checks AFTER the throwing section still ran — the firebreak is what makes 'all arms report' true rather than 'all arms up to the first crash'");
  ok(!probe.some(m => m.includes("probe 4")),
     "ARM Z4 (polarity): the PASSING check was not counted as a failure — otherwise 'everything reports' would be satisfied by a collector that calls everything broken");
  ok(fails.length === REAL_FAILS,
     `ARM Z5: the probe left the file's own tally exactly as it found it (${fails.length} vs ${REAL_FAILS}) — a control that dirtied the collector would turn later runs red for a reason that has nothing to do with the registry`);
  console.log(`  ARM Z: ${probe.length} deliberate failures reported by this file's own collector across ${SECTIONS.length} firebreaked sections`);
}

console.log(`  sections run: ${SECTIONS.length} — ${SECTIONS.join(" | ")}`);
console.log(`surface-registry.test.mjs: ${n - fails.length} pass, ${fails.length} fail`);
if(fails.length){
  console.error(`\nsurface-registry: ${fails.length} of ${n} assertions FAILED — ALL of them are listed above and again here, `
    + `because this suite's whole rider is that the first failure must not hide the rest:`);
  for(const f of fails) console.error("  - " + f);
  process.exit(1);
}
