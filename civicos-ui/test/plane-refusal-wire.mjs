/* THE PLANE'S REFUSAL WIRE, DERIVED ONCE — UI-100, 2026-09-24.
 * ===========================================================================
 * WHAT THIS IS. One module that builds the two refusal envelopes DEC-49 gave a
 * code and a canned translation to in D-278, reading every value out of the
 * plane's own source and its own catalogue. Nothing here is typed, and nothing
 * that imports it types one either.
 *
 * WHY IT IS A MODULE AND NOT A TECHNIQUE COPIED AGAIN. UI-84 (2026-09-24) built
 * exactly this derivation inside `preauth-vocabulary.test.mjs` for the two
 * surfaces it owned, and its own class sweep then found SEVEN more `unknown op`
 * mocks and one `requiredArgument` mock elsewhere in this estate, each typed by
 * hand. Copying the derivation eight more times would make the ninth copy the
 * one that goes stale — which is the area's own recorded defect: `kickoffs/UI.md`
 * requires a sweep over the analyst's vocabulary to IMPORT
 * `civicos-ui/test/analyst-vocabulary.mjs` rather than write a list, *"because a
 * fourth list coming back silently is exactly how that defect happened"*. This
 * is that rule applied to the wire's shape instead of to a word list.
 *
 * WHAT IT PINS, AND IN BOTH DIRECTIONS (UI-84's property, kept):
 *   NARROW — a fixture missing a field the wire sends. Impossible here: the
 *     fields are read from the wire.
 *   WIDE — a fixture carrying a field the wire does NOT send. Also impossible:
 *     the CODE is read AT THE SITE THAT MINTS IT, so a plane that stopped
 *     decorating yields no code, `assertDerived` throws, and every importing
 *     suite goes RED rather than going on asserting a sentence no member is sent.
 *
 * EVERY READ IS GUARDED. An extraction that silently yielded "" would find no
 * catalogue row, and a fixture asserting that a pane contains "" passes for
 * free — the shape WORKER.md names ("a harness reported a restore byte-identical
 * over an EMPTY manifest, caught only because a digest read e3b0c442…"). So the
 * module THROWS at import time rather than handing out an empty envelope.
 *
 * WHAT THIS MODULE CANNOT SEE, stated plainly because a matcher's reach is the
 * load-bearing half of any claim made with it: it reads `index.mjs` TEXTUALLY.
 * It finds the dispatch miss by its `if (!spec)` line and a `requiredArgument`
 * call by its op's string literal. A refusal minted through a helper whose name
 * or call shape changed, or one assembled from a variable, is invisible to it —
 * and would surface as a THROW here, never as a quiet empty fixture.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
/* GUARDED 2026-09-28 (legacy-tests T9): the walk of `bio-plane/src/` below (the call sites that left `index.mjs`) asks
   the estate's one provenance check, as every guarded walk in `hygiene.test.mjs`'s class census does, and floors its
   reach on the figures counted over the commit at HEAD (D-257), so an empty or narrowed walk THROWS at import. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANE = path.join(HERE, "..", "..", "bio-plane");
export const INDEX_SRC = fs.readFileSync(path.join(PLANE, "src", "index.mjs"), "utf8");
const CATALOGUE = await import(path.join(PLANE, "checks", "bio-checks.mjs"));

/* THE CATALOGUE LOOKUP, DISCOVERING THE FAMILY RATHER THAN NAMING ONE — UI-84's,
   kept verbatim in behaviour and for its reason: a row moved between families by
   a renumbering (D-126 moved two on 2026-09-23) must not silently empty a
   fixture, and UI-84's over-strictness arm renames the family and requires
   GREEN. `_CHECKS` is the reserved suffix the DEC-49 guard harvests on. */
export function cannedFor(code){
  if(!code) return null;
  for(const k of Object.keys(CATALOGUE)){
    const fam = CATALOGUE[k];
    if(!/_CHECKS$/.test(k) || !fam || typeof fam !== "object") continue;
    const row = fam[code];
    if(row && typeof row.translation === "string" && row.translation)
      return { family:k, check:row.check, translation:row.translation };
  }
  return null;
}

const unq = (s) => JSON.parse('"' + s + '"');

/* ---------------------------------------------------------------------------
   (1) THE DISPATCH MISS — C-69.1, `UNKNOWN_OP`.
   `error` is read at the `if (!spec)` line and is required to still be the FIRST
   key after `ok`, because civicos-ui's `queueAbsent` and two more gap detectors
   read that sentence as a SUBSTRING to tell an older plane from a refusal (I3),
   and D-278's own region comment at that line says so.
   --------------------------------------------------------------------------- */
const DISPATCH_LINE = /if \(!spec\) return json\(\{ ok: false, error: "((?:[^"\\]|\\.)*)",[\s\S]{0,240}?\.\.\.dispatchRow\("([A-Z_0-9]+)"\)/
  .exec(INDEX_SRC);
export const UNKNOWN_OP_ERROR = DISPATCH_LINE ? unq(DISPATCH_LINE[1]) : "";
export const UNKNOWN_OP_CODE  = DISPATCH_LINE ? DISPATCH_LINE[2] : "";
export const UNKNOWN_OP_CANNED = cannedFor(UNKNOWN_OP_CODE);

/* THE ENVELOPE, in the wire's own key order. `op` travels in its OWN key — the
   plane has NEVER sent "unknown op <op>", and four fixtures in this estate
   composed exactly that sentence before this item. */
export const unknownOpWire = (op) => ({
  ok:false, error:UNKNOWN_OP_ERROR, reason:UNKNOWN_OP_CODE, code:UNKNOWN_OP_CODE,
  check:UNKNOWN_OP_CANNED && UNKNOWN_OP_CANNED.check,
  translation:UNKNOWN_OP_CANNED && UNKNOWN_OP_CANNED.translation, op });

/* ---------------------------------------------------------------------------
   (2) THE ARGUMENT COMPLAINT — C-61.1, `REQUIRED_ARGUMENT_MISSING`.
   ONE code for the whole condition (index.mjs `requiredArgument`), its producers
   told apart by `op`, `argument` and `shape`. Eight call sites carry it.
   --------------------------------------------------------------------------- */
export const REQUIRED_ARGUMENT_CODE = (() => {
  const m = /function requiredArgument\([\s\S]{0,900}?\.\.\.requiredArgumentRow\("([A-Z_0-9]+)"\)/.exec(INDEX_SRC);
  return m ? m[1] : "";
})();
export const REQUIRED_ARGUMENT_CANNED = cannedFor(REQUIRED_ARGUMENT_CODE);

/* The helper's own `detail` template, both backtick chunks and not the first —
   a one-chunk read would hand a caller half a sentence and every arm asserting
   a prefix of it would still pass. */
export function requiredArgumentDetail(op, argument, shape){
  const body = /function requiredArgument\([\s\S]*?\n\}/.exec(INDEX_SRC);
  if(!body) return "";
  const d = /detail: ([\s\S]*?)\};/.exec(body[0]);
  if(!d) return "";
  return [...d[1].matchAll(/`([^`]*)`/g)].map(x => x[1]).join("")
    .replace(/\$\{op\}/g, op).replace(/\$\{argument\}/g, argument).replace(/\$\{shape\}/g, shape);
}

/* THE CALL SITE ITSELF, read by BALANCING PARENTHESES rather than by a regex
   that guesses where the argument list ends. Two shapes exist in `index.mjs` and
   both are real: `op=verify` passes three arguments and sets `error` as a key
   BESIDE the spread, while `op=publishedbytes` passes its `error` as the fourth
   argument, built from two `+`-joined literals. A regex tuned to either one
   silently returns the wrong thing on the other; the scanner returns the whole
   call and the caller's shape decides. */
const CALL_SCAN_LIMIT = 1200;   /* no call site in index.mjs is anywhere near this long */
/* RE-ANCHORED 2026-09-28 (legacy-tests T9): the call sites left `index.mjs` with their ops. `op=publishedbytes` and
   `op=publishedcase` are the `publication` module's now (`bio-plane/src/publication/worker.mjs`), which mints the
   same refusal through the control plane's own helper handed to it (`P.requiredArgument("publishedbytes", …)`), so a
   read of `index.mjs` alone found no site and handed `publishedcase.test.mjs` a null envelope. The helper, its code
   and its `detail` template are still `index.mjs`'s and are still read there; only the CALL is looked for in the
   module sources as well — `index.mjs` first, then every module file under `src/` — and a needle found in more than one file
   THROWS rather than picking one, because two sites for one op would be two envelopes and a guess is worse than none. */
const MODULE_SRCS = (() => {
  const out = [];
  const walk = (d) => { for(const e of fs.readdirSync(d, { withFileTypes:true })){
    const f = path.join(d, e.name);
    if(e.isDirectory()) walk(f);
    else if(e.name.endsWith(".mjs") && f !== path.join(PLANE, "src", "index.mjs")) out.push([f, fs.readFileSync(f, "utf8")]);
  } };
  walk(path.join(PLANE, "src"));
  return out;
})();
/* GUARDED 2026-09-28 (legacy-tests T9): WHAT THE WALK REACHED, AND HOW MUCH OF IT ANOTHER CHECKOUT REPRODUCES. Every
   file it read is handed to the one provenance report (a phantom module deposited under `src/` is named there, never
   counted silently), and the two figures `assertDerived` floors — the module files read and the `requiredArgument("…"`
   call sites found in them — are counted over the files in the commit at HEAD. When git cannot answer, every file
   counts and the report says UNVERIFIED (provenance.mjs rule 4), never clean. The floors are the figures this walk
   PRINTED on `job/T9/legacy-tests` (177 module files, 7 call sites: capture/doorbell.mjs ×2, capture/ops.mjs,
   extraction/ops.mjs, monitoring/index.mjs, publication/worker.mjs ×2); a legitimate drop is a decision, made here. */
/* RE-PINNED 2026-09-28 (legacy-tests T10, B1; the guard family's finding): 177 -> 176 module files, by name against the
   T10 opening tree (ac699662aa): `bias/interim.mjs` (N143) and `run-productions/interim.mjs` (N194) were deleted and
   `provenance/checks.mjs` (provenance R50) arrived. The 7 call sites are the same seven in the same files. */
const MODULE_WALK_FLOOR = { files: 176, sites: 7 };
const REPO = path.join(PLANE, "..");
const PROV = readGitProvenance(REPO);
const inCommit = (abs) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, abs));
const sitesIn = (src) => (src.match(/requiredArgument\("/g) || []).length;
const MODULE_REPRO = MODULE_SRCS.filter(([f]) => inCommit(f));
const MODULE_WALK = {
  files: MODULE_SRCS.length, filesRepro: MODULE_REPRO.length,
  sites: MODULE_SRCS.reduce((n, [, src]) => n + sitesIn(src), 0),
  sitesRepro: MODULE_REPRO.reduce((n, [, src]) => n + sitesIn(src), 0),
  report: reportProvenance({
    prov: PROV,
    items: MODULE_SRCS.map(([f, src]) => ({ path: repoPath(REPO, f), what: path.relative(PLANE, f),
      counted: `searched for requiredArgument call sites (${sitesIn(src)} found)` })),
    instrument: "plane-refusal-wire's module walk",
    corpus: `bio-plane/src/: ${MODULE_SRCS.length} module file(s) walked, ${MODULE_REPRO.length} of them in the commit, `
      + `${MODULE_REPRO.reduce((n, [, src]) => n + sitesIn(src), 0)} requiredArgument call site(s) in those`
      + ` · floors ${MODULE_WALK_FLOOR.files} / ${MODULE_WALK_FLOOR.sites}`,
    totals: PROV.inHead === null ? [] : [
      { label: "module files walked", contaminated: MODULE_SRCS.length, reproducible: MODULE_REPRO.length, source: "files" },
    ],
  }),
};
function callTextFor(op){
  const needle = `requiredArgument("${op}"`;
  if(INDEX_SRC.indexOf(needle) >= 0) return callTextIn(INDEX_SRC, needle, op);
  const hits = MODULE_SRCS.filter(([, src]) => src.indexOf(needle) >= 0);
  if(hits.length > 1)
    throw new Error(`plane-refusal-wire: requiredArgument("${op}") is called in ${hits.length} module files `
      + `(${hits.map(([f]) => path.relative(PLANE, f)).join(", ")}); one op has one site.`);
  return hits.length ? callTextIn(hits[0][1], needle, op) : "";
}
function callTextIn(SRC, needle, op){
  const at = SRC.indexOf(needle);
  if(at < 0) return "";
  /* Balance from the helper's OWN opening paren. Getting this index wrong is not
     a near miss: starting one character late leaves `depth` at 0, the first `)`
     drives it to -1, the scan never closes and the slice runs on into whatever
     follows — which is how the first spelling of this function handed
     `literalsIn` a quote from a comment two refusals away. It is bounded and it
     THROWS rather than returning a shorter answer that would look like a call. */
  const open = at + "requiredArgument".length;
  if(SRC[open] !== "(") return "";
  let depth = 0;
  const end = Math.min(SRC.length, open + CALL_SCAN_LIMIT);
  for(let i = open; i < end; i++){
    const c = SRC[i];
    if(c === "(") depth++;
    else if(c === ")"){ depth--; if(depth === 0) return SRC.slice(at, i + 1); }
  }
  throw new Error(`plane-refusal-wire: requiredArgument("${op}") in index.mjs does not close within `
    + `${CALL_SCAN_LIMIT} characters. The call shape moved; a fixture built from a guess at where it `
    + `ends would be worse than none.`);
}
/* Every double-quoted literal in the call, in order: op, argument, shape, then
   the `error` chunks if it was passed positionally. */
const literalsIn = (s) => [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => unq(m[1]));

export function planeRequiredArgumentSite(op){
  const call = callTextFor(op);
  if(!call) return null;
  const lits = literalsIn(call);
  if(lits.length < 3) return null;
  const [, argument, shape] = lits;
  let error = lits.slice(3).join("");
  if(!error){
    /* The `error:` key set beside the spread — `op=verify`'s shape. Anchored to
       the text that FOLLOWS this call, so it cannot pick up another site's.
       RE-ANCHORED 2026-09-28 (legacy-tests T9): read in whichever source holds the call (see `callTextFor`). */
    const SRC = INDEX_SRC.indexOf(call) >= 0 ? INDEX_SRC
      : ((MODULE_SRCS.find(([, src]) => src.indexOf(call) >= 0) || [, ""])[1]);
    const after = SRC.slice(SRC.indexOf(call) + call.length, SRC.indexOf(call) + call.length + 400);
    const m = /^,\s*\n?\s*error: "((?:[^"\\]|\\.)*)"/.exec(after);
    error = m ? unq(m[1]) : "";
  }
  return { op, argument, shape, error, detail:requiredArgumentDetail(op, argument, shape) };
}

/* THE ENVELOPE, in `requiredArgument`'s own key order: the spread first, then
   `error` as the call site sets it. */
export function requiredArgumentWire(op){
  const site = planeRequiredArgumentSite(op);
  if(!site) return null;
  return { ok:false, reason:REQUIRED_ARGUMENT_CODE, code:REQUIRED_ARGUMENT_CODE,
           check:REQUIRED_ARGUMENT_CANNED && REQUIRED_ARGUMENT_CANNED.check,
           translation:REQUIRED_ARGUMENT_CANNED && REQUIRED_ARGUMENT_CANNED.translation,
           error:site.error, op:site.op, argument:site.argument, shape:site.shape, detail:site.detail };
}

/* ---------------------------------------------------------------------------
   THE GUARD. Called at import by every consumer, so a derivation that came back
   empty stops the suite that depends on it rather than handing it a fixture that
   asserts nothing. The floors are the shapes, not the contents: a code, a
   non-trivial sentence, and — for the dispatch miss — the exact `error` every
   gap detector in `app.html` matches on.
   --------------------------------------------------------------------------- */
export function assertDerived(){
  const bad = [];
  if(!UNKNOWN_OP_CODE) bad.push("UNKNOWN_OP code not found at the `if (!spec)` site in index.mjs");
  if(!UNKNOWN_OP_ERROR) bad.push("the dispatch miss's `error` sentence not readable at that site");
  if(!UNKNOWN_OP_CANNED || UNKNOWN_OP_CANNED.translation.length < 40)
    bad.push(`no *_CHECKS family holds a canned translation for ${UNKNOWN_OP_CODE}`);
  if(!REQUIRED_ARGUMENT_CODE) bad.push("REQUIRED_ARGUMENT code not found inside requiredArgument()");
  if(!REQUIRED_ARGUMENT_CANNED || REQUIRED_ARGUMENT_CANNED.translation.length < 40)
    bad.push(`no *_CHECKS family holds a canned translation for ${REQUIRED_ARGUMENT_CODE}`);
  /* GUARDED 2026-09-28 (legacy-tests T9): the module walk's REACH, over the commit at HEAD (see MODULE_WALK). A walk
     that read nothing would find no call site and hand a consumer a null envelope for an op whose site moved there. */
  if(MODULE_WALK.filesRepro < MODULE_WALK_FLOOR.files)
    bad.push(`the walk of bio-plane/src/ read ${MODULE_WALK.filesRepro} module file(s) in the commit, floor ${MODULE_WALK_FLOOR.files}`);
  if(MODULE_WALK.sitesRepro < MODULE_WALK_FLOOR.sites)
    bad.push(`the walk of bio-plane/src/ found ${MODULE_WALK.sitesRepro} requiredArgument call site(s) in committed module files, floor ${MODULE_WALK_FLOOR.sites}`);
  if(bad.length)
    throw new Error("plane-refusal-wire: the plane's refusal wire could not be DERIVED, so no fixture "
      + "built from it would mean anything (DEC-49 / UI-100):\n  - " + bad.join("\n  - "));
  return true;
}
assertDerived();
