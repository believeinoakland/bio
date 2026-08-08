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
 *  (7) over-strictness (ARM Y15-Y17): a running-session record shaped unlike
 *      anything written here — different field names, a bound this file never
 *      mentions — must RENDER, not fail. Driven with `{gauge, cap, used, note}`
 *      in place of the authored shapes: GREEN, 358 assertions. A renderer that
 *      only accepts the shapes its author imagined would be a fixture testing
 *      itself, and it would break the day IS-6 chooses its field names.
 */
import assert from "assert";
import fs from "fs";
import vm from "vm";
import { ACTS, ACT_IDS, CAPTURE_ACTS } from "../../bio-plane/src/affordances.mjs";

let n = 0;
const ok = (cond, msg) => { n++; assert.ok(cond, msg); };
const eq = (a, b, msg) => { n++; assert.deepStrictEqual(a, b, msg); };

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
{
  const probe = stripComments(`const a = 1; /* c1 */ const b = "/* not a comment */"; // c2\nconst c = 3;`);
  ok(!probe.includes("c1"), "ARM I: the comment stripper removes block comments");
  ok(!probe.includes("c2"), "ARM I: the comment stripper removes line comments");
  ok(probe.includes("/* not a comment */"), "ARM I: the stripper does NOT strip inside a string literal");
  ok(probe.includes("const c = 3"), "ARM I: the stripper keeps code after a line comment");
  ok(code.length > app.length * 0.5,
     `ARM I: the stripped corpus is ${code.length} of ${app.length} chars — a stripper that ate the file would make every walk below trivially green`);
}

/* ============================================================ THE REAL SET
   Three independent arms. Each prints its corpus size and asserts a floor. */

/* ARM W1 · the screen route table inside go(). */
const rBody = tableBody(code, /const\s+R\s*=\s*\{/);
ok(rBody && rBody.length > 100,
   `ARM W1: go()'s screen table was found and is ${rBody ? rBody.length : 0} chars — a table read as empty passes everything`);
const screenKeys = topKeys(rBody);
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
{
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
}

/* ======================================================== THE DESCRIBED SET */
function block(marker, exportNames){
  const re = new RegExp(`\\/\\*__${marker}_START__\\*\\/([\\s\\S]*?)\\/\\*__${marker}_END__\\*\\/`);
  const m = re.exec(app);
  assert.ok(m, `FAIL: ${marker} markers not found in app.html`);
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(m[1] + `;globalThis.__B={${exportNames.join(",")}};`, ctx);
  return ctx.__B;
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
{
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
}
const { SURFACE_LEVELS, SURFACES, RECIPES } = B;

const DESCRIBED = [];
for(const [id, s] of Object.entries(SURFACES)){
  ok(Array.isArray(s.routes), `every surface declares routes: '${id}' does not`);
  for(const r of s.routes) DESCRIBED.push({ id, route: r });
}
console.log(`  DESCRIBED: ${Object.keys(SURFACES).length} surfaces carrying ${DESCRIBED.length} routes`);

/* ------------------------------- ARM E · EQUALITY, PROVED IN BOTH DIRECTIONS
   This is the item's centre. Each direction fails on its own, naming the route,
   because "the sets differ" is not an actionable failure. */
{
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
}

/* ------------------------------------------- ARM L · the levels are legible
   CLAUDE.md: absence at one level is not evidence of absence at the next, so an
   answer reporting absence must name its LEVEL. A surface has to make that
   legible rather than leaving it to the caller. */
{
  /* The vocabulary is pinned to CLAUDE.md's own sentence rather than kept as a
     fourth copy of it. Read textually, and stated as such — the same shape and
     the same caveat as check-semantics.mjs's knownSchemas pin. */
  const claude = fs.readFileSync(new URL("../../CLAUDE.md", import.meta.url).pathname, "utf8");
  const m = /search\s+\*\*meaning,\s+content,\s+documents,\s+AND\s+the\s+open\s+internet\*\*/.exec(claude);
  ok(m, "ARM L0: CLAUDE.md's four-level sentence was found — if this fails the extraction needs updating, not the vocabulary");
  eq(SURFACE_LEVELS, ["meaning", "content", "documents", "internet"],
     "ARM L1: SURFACE_LEVELS is the four levels CLAUDE.md names, in its order");

  for(const [id, s] of Object.entries(SURFACES)){
    ok(Array.isArray(s.levels), `ARM L2: surface '${id}' declares a levels array`);
    for(const l of s.levels)
      ok(SURFACE_LEVELS.includes(l), `ARM L3: surface '${id}' declares level '${l}', which is not one of the four`);
    ok(typeof s.purpose === "string" && s.purpose.length > 20,
       `ARM L4: surface '${id}' says what it is for`);
  }

  /* Every level is reachable SOMEWHERE. A level no surface reaches is a level
     the application cannot honestly report on, and nothing else would say so. */
  for(const l of SURFACE_LEVELS){
    const reach = Object.entries(SURFACES).filter(([, s]) => s.levels.includes(l)).map(([id]) => id);
    ok(reach.length > 0, `ARM L5: no surface reaches the '${l}' level`);
  }

  /* THE EGRESS PIN. `internet` is the one level that leaves the instance, and
     DEC-47 governs it. A surface may only claim it if it actually holds a
     capture-directed op — otherwise the claim is a surface asserting a reach it
     does not have, which is the overclaim class this project is built against. */
  for(const [id, s] of Object.entries(SURFACES)){
    if(!s.levels.includes("internet")) continue;
    ok((s.reads||[]).includes("acquire"),
       `ARM L6: surface '${id}' claims the internet level but holds no capture op — a surface cannot claim a reach it does not have`);
  }
}

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
function opFailures(surfaces, recipes, planeSource){
  const ops = opsFrom(planeSource);
  const out = [];
  for(const r of recipes)
    for(let i = 0; i < r.steps.length; i++)
      if(!ops.has(r.steps[i].op))
        out.push(`RECIPES[${r.id}].steps[${i}] names op '${r.steps[i].op}', which the plane does not emit`);
  for(const [id, s] of Object.entries(surfaces))
    for(const op of (s.reads || []))
      if(!ops.has(op))
        out.push(`SURFACES.${id} declares read '${op}', which the plane does not emit`);
  return out;
}

const OPS = opsFrom(planeSrc);
/* THE ONE resolution of every op name in this file, computed once against the
   plane's real bytes and read by ARM D3 and the recipe arms alike. */
const liveOpFailures = opFailures(SURFACES, RECIPES, planeSrc);
console.log(`  plane OPS emitted: ${OPS.size}`);

/* The parse is cross-validated against a figure measured by a DIFFERENT
   instrument — `scripts/coverage.mjs` reported 131/131 ops on main. Two
   instruments agreeing on a number neither derived from the other is evidence;
   this arm is what would have caught the first cut of this parse, which read
   comment text and answered 58. */
ok(OPS.size >= 131,
   `ARM S0: the OPS parse found ${OPS.size} ops; coverage.mjs independently reported 131. A parse that answers low is reading comments, not code`);
ok(OPS.has("search") && OPS.has("acquire") && OPS.has("publishedcase"),
   "ARM S0b: the parse found ops known to exist by name");
ok(!OPS.has("classes") && !OPS.has("mutating"),
   "ARM S0c: the parse did NOT pick up the tables' own property names — that is what a comment-blind, depth-zero read is for");

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
{
  /* THE REAL RUN. Zero failures against the real bytes. */
  const live = opFailures(SURFACES, RECIPES, planeSrc);
  /* THE HEADLINE NAMES THE STEP AND THE OP. `deepStrictEqual` would print them
     in its diff, but the message line is what a reader sees first and it has to
     be actionable on its own. */
  ok(live.length === 0,
     `ARM S1: against the plane's real source, ${live.length} op name(s) do not resolve — ${live.join(" | ")}`);

  const target = RECIPES[0].steps[1].op;
  ok(OPS.has(target), `ARM S2: the recipe step's op '${target}' is emitted by the plane as it stands`);

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
}

/* -------------------------------------- ARM A · acts come from the PLANE too
   `ACTS`, `ACT_IDS` and `CAPTURE_ACTS` are IMPORTED as live module exports.
   There is no copy of the act catalogue in app.html and there must never be
   one, so this cannot drift by construction rather than by discipline. */
{
  const planeActs = new Set([...ACT_IDS, ...CAPTURE_ACTS.map(a => a.id)]);
  ok(planeActs.size >= 15, `ARM A0: the plane publishes ${planeActs.size} act ids (ACTS ${ACT_IDS.size} + CAPTURE_ACTS ${CAPTURE_ACTS.length})`);
  ok(ACTS.length === ACT_IDS.size, "ARM A0b: ACT_IDS is derived from ACTS and has not been hand-kept beside it");

  let hosted = 0;
  for(const [id, s] of Object.entries(SURFACES)){
    ok(Array.isArray(s.acts), `ARM A1: surface '${id}' declares an acts array`);
    for(const a of s.acts){
      hosted++;
      ok(planeActs.has(a),
         `ARM A2: surface '${id}' hosts act '${a}', which the plane's own act catalogue does not publish`);
    }
  }
  ok(hosted >= 10, `ARM A3: ${hosted} act placements are described, floor 10 — a registry describing no acts would pass A2 vacuously`);

  /* AND THE PLANE'S ACTS ARE ALL HOUSED. An act the plane publishes that no
     surface hosts is an act a member cannot reach, and nothing else says so. */
  const allHosted = new Set(Object.values(SURFACES).flatMap(s => s.acts));
  const homeless = [...planeActs].filter(a => !allHosted.has(a));
  ok(homeless.length === 0,
     `ARM A4: the plane publishes ${homeless.length} act(s) no described surface hosts: ${homeless.join(", ")}`);
}

/* --------------------------------- ARM D · declared reads are real and reached */
{
  /* The five seams `check-mock-envelope.mjs` declares. Pinned to that file so a
     sixth seam added there cannot leave this walk reading the wrong shapes —
     two instruments over one fact, neither one holding a private copy. */
  const cme = fs.readFileSync(new URL("../check-mock-envelope.mjs", import.meta.url).pathname, "utf8");
  const seamDecl = /const SEAMS = new Set\(\[([^\]]*)\]\)/.exec(cme);
  ok(seamDecl, "ARM D0: check-mock-envelope.mjs's SEAMS declaration was found — if this fails the extraction needs updating");
  const seams = [...seamDecl[1].matchAll(/"([a-z]+)"/gi)].map(m => m[1]);
  ok(seams.length >= 4, `ARM D0b: ${seams.length} transport seams read from check-mock-envelope.mjs (${seams.join(", ")})`);

  const callRe = new RegExp(`\\b(?:${seams.join("|")}|apiR|apiQ|intentPreflight)\\(\\s*"([a-z]+)"`, "g");
  const called = new Set([...code.matchAll(callRe)].map(m => m[1]));
  ok(called.size >= 50, `ARM D1: ${called.size} ops are called statically from app.html, floor 50 — an empty call set would make D3 vacuous`);

  let declared = 0;
  for(const [id, s] of Object.entries(SURFACES)){
    ok(Array.isArray(s.reads), `ARM D2: surface '${id}' declares a reads array`);
    for(const op of s.reads){
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
}

/* ================================================= RECIPES ARE DATA, VALIDATED */
{
  ok(Array.isArray(RECIPES) && RECIPES.length >= 1, "ARM P0: at least one recipe is authored");
  const ids = new Set();
  let steps = 0;
  for(const r of RECIPES){
    ok(typeof r.id === "string" && r.id.length > 3, "ARM P1: every recipe has an id");
    ok(!ids.has(r.id), `ARM P1b: recipe id '${r.id}' is declared twice`);
    ids.add(r.id);
    ok(typeof r.goal === "string" && r.goal.length > 10, `ARM P2: recipe '${r.id}' states its goal`);
    ok(Array.isArray(r.steps) && r.steps.length >= 2, `ARM P3: recipe '${r.id}' is an ORDERED LIST of steps, not prose`);

    for(let i = 0; i < r.steps.length; i++){
      const st = r.steps[i]; steps++;
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
  for(const r of RECIPES){
    const answers = [...new Set(r.steps.flatMap(s => SURFACES[s.surface].levels))];
    if(r.intent === "FIND")
      ok(answers.length > 0,
         `ARM P5: recipe '${r.id}' is a FIND but every surface it visits reaches NO level — it could never honestly report an absence`);
  }

  /* ARM P6 · a step naming a surface with `pending` content cannot be relied on
     to answer anything, because the thing that publishes it does not exist. */
  for(const r of RECIPES)
    for(let i = 0; i < r.steps.length; i++)
      ok(!SURFACES[r.steps[i].surface].pending,
         `ARM P6: RECIPES[${r.id}].steps[${i}] routes through '${r.steps[i].surface}', whose content is still unpublished`);
}

/* ============ THE ONCE-ONLY RUNNING-SESSION SURFACE (E10) ============
   This is where the two halves of UI-38 SHARE ONE SURFACE rather than growing
   two: the running-session surface is an entry in the same registry as every
   other surface, walked by the same three arms, and its `kind` is what makes
   "designed once for all AI features" a build failure rather than a promise. */
{
  const aiKind = Object.entries(SURFACES).filter(([, s]) => s.kind === "ai-session");
  ok(aiKind.length === 1,
     `ARM X1: THERE IS EXACTLY ONE RUNNING-SESSION SURFACE. Found ${aiKind.length} (${aiKind.map(a=>a[0]).join(", ")}) — a second AI feature growing a second surface is the mirror-and-drift class arriving at the UI layer, and §14a says this surface is designed ONCE for every AI-based function.`);

  const [aiId, ai] = aiKind[0];
  ok(Array.isArray(ai.consumers) && ai.consumers.length >= 2,
     `ARM X2: '${aiId}' names the features that share it (${(ai.consumers||[]).join(", ")}) — one consumer would mean it had not been shared`);
  ok(ai.consumers.includes("assistant") && ai.consumers.includes("investigative-session"),
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
}

/* ---- ARM Y · the renderers. Driven as pure functions over published records. */
{
  const src = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(app);
  ok(src, "ARM Y0: the AI_SESSION block markers were found in app.html");
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
  vm.runInContext(src[1] + `;globalThis.__A={aiSessionRead,aiSessionTranscript,aiSessionInContext,aiSessionIndicatorHtml,aiSessionPairsHtml,aiSessionBudgetHtml,aiSessionPrincipalHtml,aiSessionConditionHtml,aiSessionPanelHtml,aiSessionRouteFromHash};`, ctx);
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
  const bh = A.aiSessionBudgetHtml(withBudget);
  for(const frag of ["fetches", "200", "37", "sub-sessions", "4", "1"])
    ok(bh.includes(frag), `ARM Y7: the budget line carries the published '${frag}'`);
  ok(A.aiSessionPrincipalHtml(withBudget).includes("project"),
     "ARM Y8: WHICH ACCOUNT PAYS is on the surface — §14a already requires the record to name the cascade level");
  /* Written positively. This arm was first spelled `!x.includes(...) === false`,
     which is correct and unreadable — and an assertion nobody can read at a
     glance is one that gets "fixed" into its own opposite later. */
  ok(A.aiSessionPrincipalHtml(withBudget).includes("token:ai"),
     "ARM Y8b: the plane-credential principal is named BESIDE the Claude account — two different principals, and an act must say both (DEC-27(b), DEC-55.4)");

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
  const ch = A.aiSessionConditionHtml(stopped);
  ok(ch.includes("runtime-ceiling-reached"), "ARM Y10: the condition kind is rendered");
  ok(ch.includes("a CPU or subrequest ceiling was reached (D-54, D-56)"),
     "ARM Y11: the plane's own explanation is rendered VERBATIM, not paraphrased");

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
  const ah = A.aiSessionBudgetHtml(alien);
  for(const frag of ["wall-clock-across-resumptions", "18m", "4m", "tokens", "400000", "91234"])
    ok(ah.includes(frag), `ARM Y15: a bound named nothing like the author's fixtures still renders its '${frag}'`);
  ok(A.aiSessionPrincipalHtml(alien).includes("MEM-3"),
     "ARM Y16: a principal shape the author never wrote still names who pays");
  ok(A.aiSessionPanelHtml(alien, null).includes("ceiling"),
     "ARM Y17: the whole panel composes over an unfamiliar shape");
}

/* ---- ARM N · THE REGISTRY IS NOT MEMBER-FACING, so DEC-49 is not preempted */
{
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
}

/* ---- ARM V · refusal text is SURFACED, never COPIED
   The plane's ~305 teaching-grade `detail:` strings are the assistant's answer
   key and are to be surfaced VERBATIM. A COPY of one in this runtime is the
   drift hazard, not the fidelity: the copy is what goes stale. */
{
  const planeDetails = [...planeSrc.matchAll(/detail:\s*"([^"]{50,})"/g)].map(m => m[1]);
  ok(planeDetails.length >= 20, `ARM V0: ${planeDetails.length} long detail strings read from the plane, floor 20 — an empty corpus would make V1 vacuous`);
  const copied = planeDetails.filter(d => app.includes(d));
  ok(copied.length === 0,
     `ARM V1: ${copied.length} of the plane's own refusal explanations are COPIED into app.html: ${copied.slice(0,2).join(" | ")}`);
}

console.log(`surface-registry.test.mjs: ${n} pass`);
