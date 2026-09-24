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
function callTextFor(op){
  const needle = `requiredArgument("${op}"`;
  const at = INDEX_SRC.indexOf(needle);
  if(at < 0) return "";
  /* Balance from the helper's OWN opening paren. Getting this index wrong is not
     a near miss: starting one character late leaves `depth` at 0, the first `)`
     drives it to -1, the scan never closes and the slice runs on into whatever
     follows — which is how the first spelling of this function handed
     `literalsIn` a quote from a comment two refusals away. It is bounded and it
     THROWS rather than returning a shorter answer that would look like a call. */
  const open = at + "requiredArgument".length;
  if(INDEX_SRC[open] !== "(") return "";
  let depth = 0;
  const end = Math.min(INDEX_SRC.length, open + CALL_SCAN_LIMIT);
  for(let i = open; i < end; i++){
    const c = INDEX_SRC[i];
    if(c === "(") depth++;
    else if(c === ")"){ depth--; if(depth === 0) return INDEX_SRC.slice(at, i + 1); }
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
       the text that FOLLOWS this call, so it cannot pick up another site's. */
    const after = INDEX_SRC.slice(INDEX_SRC.indexOf(call) + call.length, INDEX_SRC.indexOf(call) + call.length + 400);
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
  if(bad.length)
    throw new Error("plane-refusal-wire: the plane's refusal wire could not be DERIVED, so no fixture "
      + "built from it would mean anything (DEC-49 / UI-100):\n  - " + bad.join("\n  - "));
  return true;
}
assertDerived();
