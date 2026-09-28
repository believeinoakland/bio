/* NEGATIVE CONTROL: (run 2026-08-08, fw14-rung-ladder, FW-14) THREE arms, each
   RUN ALONE with the others held open, every edited file restored and verified by
   sha256 AND by `cmp` against a per-arm uniquely-named pristine copy. Driven by
   `node test/rung-ladder.control.mjs`. Baseline 47 pass / 0 fail, foot reached.
   ALL THREE ARMS CAME BACK AS DECLARED; the counts below are the ones MEASURED,
   not predicted, and the tree returned to 47/0 after every restore.
   (1) -> ADD AN UNCLASSIFIED MUTATING OP: plant `frobnicate: { classes: null,
       mutating: true }` into the OPS table in `src/index.mjs` and classify it
       NOWHERE — the arm this item exists for. FAILS naming `frobnicate` in the
       FORWARD-totality assertion -> 45 pass / 2 FAIL, corpus printing `85
       declared mutating` against 24 + 60 classified. The BACKWARD direction
       stayed green, which is the must-not-fail: the two directions are
       independent, and this arm proves it rather than assuming it.
   (2) -> NEUTER THE WALK: `readDispatch().mutating` returns an empty Set
       -> 40 pass / 7 FAIL, the corpus PRINTS `0 declared mutating`, and the
       reach fails as a DELTA. **AND THE FINDING THIS ARM EXISTS FOR REPRODUCED:
       the FORWARD totality assertion — the item's own headline — STILL PASSED
       over the empty op set**, vacuously true of nothing, exactly as three
       walks in this repository have reported clean verdicts over empty corpora.
       It is caught ONLY by section 1's printed-and-floored reach and by the
       BACKWARD direction, which is why both are asserted rather than printed.
   (3) -> OVER-STRICTNESS: re-spell a CORRECTLY classified op's row in a shape
       this suite did not author (`  cite:{classes:["admin","member","probe"],
       mutating:true},` — no spaces around the colon, one line, no padding)
       -> 47 pass / 0 FAIL. **THE ARM PASSES ONLY BY NOT FIRING**, and it is the
       arm that decides whether the reader survives contact with a table nobody
       formatted for it. */

/* FW-14 — THE WEIGHT LADDER IS TOTAL OVER THE DISPATCH TABLE.
 *
 * WHAT THIS SUITE ESTABLISHES, and read this before quoting it as a defence:
 *
 *   IT DOES     assert that EVERY op `src/index.mjs`'s OPS table declares
 *               `mutating: true` either carries a rung in `RUNGS` or is named in
 *               `RUNG_ABSENT` with a ground — no op unclassified.
 *   IT DOES     assert the OTHER direction — that no key of either table names
 *               something the dispatch table does not carry as mutating. A
 *               classification naming an op that does not exist is the same
 *               defect as an op nobody classified, arriving from the other side.
 *   IT DOES     assert the BACKING of every rung: `reasoned` against the refusal
 *               family the store raises, `terminal` against the imported state
 *               machine, `irreversible` against the publishing route, and
 *               `reversible` against the act that takes the result back.
 *   IT DOES NOT assert that the rung is the RIGHT one in any sense a document
 *               could not settle. A rung whose backing exists is checked against
 *               that backing; doctrine is DEC-19's and is not re-litigated here.
 *   IT DOES NOT reach the wire. `affordances.test.mjs` drives op=affordances;
 *               this suite is source-level, and one assertion below crosses over
 *               only to pin that `decorateAct` publishes the absence ground.
 *
 * THE OP SET IS DERIVED, NEVER LISTED. It comes from `readDispatch()` in
 * `scripts/op-claims.mjs` — the SAME reader M0-12's suite uses on the SAME
 * table, grown by one field rather than copied, because two mechanisms for one
 * job is how the next one goes dark differently (CPDF-9). A hand list here would
 * be exactly the roster that read as a complete sweep while 27 ops were hidden.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { moduleSources } from "./extracted-sources.mjs";   /* T3 (legacy-tests): the extracted modules' source */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  RUNGS, RUNG_ABSENT, RUNG_LADDER, RUNG_ABSENCE_GROUNDS, JUSTIFICATION_REFUSALS,
  IRREVERSIBLE_CORRECTION_PATH, VOCABULARIES,
} from "../src/affordances.mjs";
import { STATES, VERSION_REASON_REQUIRED, versionNeedsReason } from "../checks/bio-checks.mjs";
import { readDispatch, routeOf, PLANE } from "./dispatch-reader.mjs";   /* T4 (legacy-tests): the reader op-claims.mjs held (N12) */

const DIR = dirname(fileURLToPath(import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  ok ? pass++ : fail++;
};

/* ------------------------------------------------- 1. the op set was READ */
/* PRINTED EVERY RUN AND FLOORED, because a classification swept over an empty
   op set is vacuously total and reports a beautiful clean verdict. That exact
   failure has been recorded three times in this repository, twice inside the
   instrument built to prevent it, and once the restore check compared two empty
   files and reported them byte-identical — the sha256 of the empty string. So
   the corpus is printed and the floor is asserted BEFORE anything is checked
   against it. */
console.log("\n--- 1. the dispatch table's MUTATING set was actually read ---");
const table = readDispatch(PLANE);
const MUTATING = [...table.mutating].sort();
console.log(`  FW-14 CORPUS: ${table.ops.size} ops in the dispatch table · `
  + `${MUTATING.length} declared mutating · ${Object.keys(RUNGS).length} carry a rung · `
  + `${Object.keys(RUNG_ABSENT).length} carry a STATED absence`);

t("OPS is a non-trivial whitelist read out of src/index.mjs", table.ops.size >= 120, true);
t("the MUTATING subset is non-trivial — the floor a neutered walk fails",
  MUTATING.length >= 80, true);
t("and it is a strict SUBSET: the table also declares non-mutating ops, so the "
+ "flag is being read rather than every row swept in",
  MUTATING.length < table.ops.size, true);
/* Pinned by value in both directions, so a reader that stopped seeing the flag
   is caught by more than a count. */
t("`publish` is read as mutating", table.mutating.has("publish"), true);
t("`affordances` is read as NON-mutating", table.mutating.has("affordances"), false);

/* --------------------------------------- 2. TOTALITY, IN BOTH DIRECTIONS */
/* THE ITEM. Not the ladder — this. */
console.log("\n--- 2. every mutating op is classified, and nothing else is ---");
const classified = new Set([...Object.keys(RUNGS), ...Object.keys(RUNG_ABSENT)]);

const unclassified = MUTATING.filter((op) => !classified.has(op));
t("FORWARD: no mutating op is without a rung AND without a stated absence "
+ "(an op named here is one somebody added to OPS and classified nowhere)",
  unclassified, []);

const phantom = [...classified].sort().filter((op) => !table.mutating.has(op));
t("BACKWARD: no rung and no stated absence names something the dispatch table "
+ "does not carry as mutating (a name here is a classification of an op that "
+ "does not exist, or of one that stopped mutating)",
  phantom, []);

const both = Object.keys(RUNGS).filter((op) => op in RUNG_ABSENT).sort();
t("DISJOINT: nothing both carries a rung and states it has none", both, []);

t("the two tables together account for the whole mutating set, EXACTLY",
  Object.keys(RUNGS).length + Object.keys(RUNG_ABSENT).length, MUTATING.length);

/* The non-triviality pair for section 2 itself: a classification set of size
   zero would satisfy `unclassified === []` only if MUTATING were also empty,
   which section 1 floors — but an EMPTY RUNGS with a total RUNG_ABSENT would
   pass everything above while assigning nothing at all. Asserted, not assumed. */
t("some op actually carries a rung — the assignment half is non-empty",
  Object.keys(RUNGS).length >= 20, true);
t("some op actually carries a stated absence — the absence half is non-empty",
  Object.keys(RUNG_ABSENT).length >= 50, true);

/* ------------------------------------------ 3. the ladder, and DEC-19's top */
console.log("\n--- 3. the ladder, IRREVERSIBLE at the top (DEC-19 as amended) ---");
t("the published rung vocabulary names `irreversible` at the TOP",
  RUNG_LADDER[RUNG_LADDER.length - 1], "irreversible");
t("the ladder is ordered low to high and starts at `reversible`", RUNG_LADDER[0], "reversible");
t("the ladder's names, pinned", RUNG_LADDER,
  ["reversible", "reasoned", "terminal", "attested", "irreversible"]);
t("every assigned rung is a member of the published ladder",
  [...new Set(Object.values(RUNGS))].filter((r) => !RUNG_LADDER.includes(r)), []);
t("every stated absence names a ground the published grounds define",
  Object.entries(RUNG_ABSENT).filter(([, v]) => !(v.ground in RUNG_ABSENCE_GROUNDS))
    .map(([op]) => op), []);
t("and every stated absence says what the op IS, so the statement is a statement",
  Object.entries(RUNG_ABSENT).filter(([, v]) => !(typeof v.is === "string" && v.is.length > 10))
    .map(([op]) => op), []);

/* DEC-19 requires the correction path BESIDE the top rung, never instead of it:
   "irreversible" alone is the half that overclaims. */
t("the correction path is published with the ladder",
  VOCABULARIES.rung_ladder === RUNG_LADDER
  && VOCABULARIES.rung_correction_path === IRREVERSIBLE_CORRECTION_PATH, true);
for (const phrase of ["never stops answering", "FORWARD", "edition", "withdrawal", "erased"])
  t(`the correction path states '${phrase}'`,
    IRREVERSIBLE_CORRECTION_PATH.includes(phrase), true);
t("the grounds vocabulary is published too, so a surface can render WHY an act "
+ "has no rung instead of computing the sentence (DEC-8)",
  VOCABULARIES.rung_absence_grounds === RUNG_ABSENCE_GROUNDS, true);

/* ------------------------------- 4. BACKING: no rung the store contradicts */
/* The FW-14 row's acceptance clause: "no op publishes a rung its store
   behaviour contradicts". Every rung below is checked against the enforcement
   that gives it, so a rung cannot survive the enforcement being removed. */
console.log("\n--- 4. every rung is BACKED by what the plane enforces ---");

/* ---- irreversible: DERIVED, not spelled. The op whose DO route is the
   publishing path is the one that carries the top rung. Naming "publish" as a
   literal here would pass even if the op were renamed or re-routed. */
const irreversible = Object.entries(RUNGS).filter(([, r]) => r === "irreversible").map(([o]) => o);
t("exactly ONE op carries `irreversible` (DEC-19: publishing is the one "
+ "irreversible act)", irreversible.length, 1);
/* The ROUTES arm is asserted in section 4 below, once the modules' op maps are read (T8: the route runs through one). */

/* ---- terminal: the target state has no outgoing edge, read from the IMPORTED
   state machine. If an edge out of `retired` is ever added, this fails rather
   than the rung quietly becoming a lie. */
const terminal = Object.entries(RUNGS).filter(([, r]) => r === "terminal").map(([o]) => o);
t("`terminal` is carried by op=retire alone", terminal, ["retire"]);
t("and the state it writes has NO outgoing edge in the imported STATES table — "
+ "which is what `terminal` means and why DEC-19's staleness finding, which "
+ "reasoned about the ladder's then-top-two rungs, does not reach this one",
  STATES.information.edges.retired, []);
t("`retired` is nonetheless a legal state, so the assertion above is about an "
+ "edge list and not about a missing key",
  STATES.information.legal.includes("retired"), true);

/* ---- attested: an authority OUTSIDE the group. All three are capture/publication
   ceremonies requiring a key or a timestamp authority, which is what separates
   this rung from `reasoned` below it.

   CORRECTED 2026-09-10 BY CASE-5b, NEVER EXEMPTED, AND THE RUNG'S DEFINITION IS
   WHAT DECIDED IT rather than a preference for a shorter diff. It read "exactly
   the two acts Constructs:275 sources", and that was a faithful count of the
   source at the time. `op=caseratify` is a THIRD publication ceremony whose
   authority is a registered signer's key over a document's hash — the identical
   thing `op=ratify` is, one altitude up — so placing it anywhere else on this
   ladder would have had the ladder describe the act's SUBJECT rather than the
   authority the act rests on, which is the one thing the rung means. The
   assertion stays a totality (`exactly`) rather than a membership test, because
   a rung that only lists what somebody remembered to add is not a classifier. */
t("`attested` is carried by exactly the three publication and capture ceremonies whose authority is a key held outside the group",
  Object.entries(RUNGS).filter(([, r]) => r === "attested").map(([o]) => o).sort(),
  ["attest", "caseratify", "ratify"]);

/* ---- reasoned: the store REFUSES the act for want of an authored account.
   Read as a CLASS of refusal codes, never one spelling (REC-76). */
const storeSrc = readFileSync(join(PLANE, "src/store.mjs"), "utf8");

/* The method body, with its PARAMETER LIST SKIPPED BY PAREN MATCHING. The first
   draft of this reader took `indexOf("{")` from the method name and landed on
   the DESTRUCTURING brace of `release({ handle, … })`, so it read the parameter
   object as the body and reported NO justification refusal for six ops that
   plainly have one. Recorded rather than smoothed: the instrument was wrong
   before the subject was, which is this project's most common control finding. */
function methodBody(src, name) {
  const re = new RegExp(`^  (?:async\\s+|static\\s+)*${name}\\s*\\(`, "m");
  const m = re.exec(src); if (!m) return null;
  let p = m.index + m[0].length - 1, d = 0;
  for (; p < src.length; p++) {
    if (src[p] === "(") d++;
    else if (src[p] === ")") { d--; if (d === 0) { p++; break; } }
  }
  const open = src.indexOf("{", p);
  if (open < 0) return null;
  d = 0;
  for (let q = open; q < src.length; q++) {
    if (src[q] === "{") d++;
    else if (src[q] === "}") { d--; if (d === 0) return src.slice(open + 1, q); }
  }
  return null;
}

/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests; progressions R27): progressions answers its refusals through its own
   DEC-49 helper `refusal("CODE", …)` (src/progressions/checks.mjs), the same class of refusal as `refuse("CODE"`. */
/* RE-ANCHORED 2026-09-28 (T7 LEGACY-TESTS #4; INTENT #1, AFFORDANCES #1 J4.4): intent mints each of its refusals
   through its own DEC-49 table `mint.CODE(…)` (src/intent/index.mjs), the same class of refusal again. */
const jre = new RegExp(
  `reason:\\s*"(${JUSTIFICATION_REFUSALS.join("|")})"`
  + `|refus(?:e|al)\\("(${JUSTIFICATION_REFUSALS.join("|")})"`
  + `|\\bmint\\.(${JUSTIFICATION_REFUSALS.join("|")})\\s*\\(`, "g");

/* THE VERSION FAMILY IS HELD OUT OF THE TEXTUAL SCAN DELIBERATELY, and this is
   the sharpest thing in the file. All six version acts route through ONE
   `#moveVersionState` carrying ONE `VERSION_NO_REASON` refusal, and the branch
   fires only when `versionNeedsReason(to)` — so a classifier grading them by
   finding the code in the shared helper promotes FOUR ops to a rung the store
   does not enforce. That is the same defect as grading a file by a word in its
   comments (REC-70, REC-64). These six are decided by the exported predicate. */
/* RE-ANCHORED 2026-09-28 (T7 LEGACY-TESTS #4; AFFORDANCES #1 J4.4, BASIS-VERSIONS #1): the table moved out of
   store.mjs with the version acts and is basis-versions' `export const VERSION_ACT_TO = Object.freeze({…})`
   (src/basis-versions/index.mjs); the store keeps `static VERSION_ACT_TO = VERSION_ACT_TO;` as an alias of it. It is
   read there, by the same key/value scan. */
const basisVersionsSrc = moduleSources("basis-versions");
const VERSION_ACT_TO = (() => {
  const m = /export\s+const\s+VERSION_ACT_TO\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\);/.exec(basisVersionsSrc);
  if (!m) return null;
  const out = {};
  for (const r of m[1].matchAll(/(\w+)\s*:\s*(?:"([a-z]+)"|null)/g)) out[r[1]] = r[2] ?? null;
  return out;
})();
t("`VERSION_ACT_TO` was read out of basis-versions — the six acts' target states",
  VERSION_ACT_TO && Object.keys(VERSION_ACT_TO).sort(),
  ["accept", "consider", "current", "hide", "reject", "revert"]);
t("and only two of the six target a state that REQUIRES a reason",
  Object.entries(VERSION_ACT_TO).filter(([, to]) => versionNeedsReason(to)).map(([a]) => a).sort(),
  ["consider", "reject"]);
t("VERSION_REASON_REQUIRED, pinned by value", VERSION_REASON_REQUIRED, ["considering", "rejected"]);

const VERSION_OPS = Object.keys(VERSION_ACT_TO).map((a) => `version${a}`);

/* Which ops the store refuses for want of an authored account. Private helpers
   are followed (the act's own decomposition); PUBLIC store methods are NOT,
   because a hop into `promote` / `selectionResolve` / `strengthOf` reaches the
   write SUBSTRATE every act rides, and a refusal reached only through it is not
   this act's own requirement. Sweeping those in would have graded nearly every
   op `reasoned` and the rung would have meant nothing. */
/* RE-ANCHORED 2026-09-26 (T3, legacy-tests; the membership and promotion extractions): `adminRemove`,
   `projectOwnerRemove`, `projectOwnerRescue` and `reopen` now live in `src/membership/` and `src/promotion/`,
   and the store's method is a one-line delegation (`membershipOf(this.ctx).X(…)`, `promotionOf(this.ctx).X(…)`).
   That delegation IS the act's own decomposition, so it is followed into the module's method, and that method's
   private helpers are read in the module's own source — the same one hop the store's private helpers get. Public
   store methods are still not followed. */
const MODULE_SRC = { membershipOf: moduleSources("membership"), promotionOf: moduleSources("promotion") };
const MEMBERSHIP_ROUTES = new Map([...(methodBody(MODULE_SRC.membershipOf.replace(/^export function membershipOps/m,
  "  membershipOps"), "membershipOps") ?? "").matchAll(/^\s{8}([a-z][a-z0-9]*)\s*:\s*\(\)\s*=>\s*(?:\(\{\s*\.\.\.)?m\.([A-Za-z0-9_]+)\s*\(/gm)]
  .map((x) => [x[1], x[2]]));
t("`membershipOps` was read out of membership's source — the ops the store's dispatch map now takes from it",
  ["adminremove", "projectownerremove", "projectownerrescue"].every((o) => MEMBERSHIP_ROUTES.has(o)), true);
const refusesInRaw = (b) => { const h = jre.test(b); jre.lastIndex = 0; return h; };
/* RE-ANCHORED 2026-09-28 (T8, legacy-tests; AFFORDANCES #2 J3's finding, intent T8's "one governed helper per shared
   code"): a module may mint its justification refusal through a MODULE-LEVEL function (intent's
   `function refuseNoReason(detail, extra) { … reason: "NO_REASON" … }`, escalation's `refuseReason`), which a method
   calls by name. Such a helper is the refusal's one minting site (DEC-49), so a body calling it refuses for want of an
   account exactly as a body spelling the code does. The helpers are found in the source being read — a top-level
   `function name(` whose own body mints a code of the family — and nothing else is followed. */
const HELPERS = new Map();
function justifyingHelpers(src) {
  if (HELPERS.has(src)) return HELPERS.get(src);
  const out = [];
  for (const m of src.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) {
    const body = methodBody(src.replace(new RegExp(`^function\\s+${m[1].replace(/\$/g, "\\$")}\\s*\\(`, "m"),
      `  ${m[1]}(`), m[1]);
    if (body != null && refusesInRaw(body)) out.push(m[1]);
  }
  HELPERS.set(src, out);
  return out;
}
let helperSrc = "";   /* the source the current op is read in, whose module-level helpers count */
const refusesIn = (b) => refusesInRaw(b)
  || justifyingHelpers(helperSrc).some((h) => new RegExp(`(?<![\\w$.#])${h.replace(/\$/g, "\\$")}\\(`).test(b));
function demandsInBody(body, src, depth = 0) {
  if (depth === 0) helperSrc = src;
  if (refusesIn(body)) return true;
  /* RE-ANCHORED 2026-09-28 (T7 LEGACY-TESTS #4): a module method whose WHOLE body hands the act to a part of the same
     module (connections' `withdrawFromTheme(a) { return this.themes.withdraw(a); }`, into src/connections/themes.mjs)
     is that act's own decomposition, followed exactly as the store's one-line delegations are. */
  const handOff = /^\s*return this\.[a-z][A-Za-z0-9_]*\.([A-Za-z][A-Za-z0-9_]*)\([^()]*\);\s*$/.exec(body);
  if (handOff && depth < 2) {
    const hb = methodBody(src, handOff[1]);
    if (hb != null && demandsInBody(hb, src, depth + 1)) return true;
  }
  for (const dm of new Set([...body.matchAll(/this\.(#[A-Za-z][A-Za-z0-9_]*)\s*\(/g)].map((x) => x[1]))) {
    const bb = methodBody(src, dm);
    if (bb != null && refusesIn(bb)) return true;
  }
  if (depth === 0)
    for (const [, of, name] of body.matchAll(/\b(membershipOf|promotionOf)\(this\.ctx\)\.([A-Za-z][A-Za-z0-9_]*)\s*\(/g)) {
      const mb = methodBody(MODULE_SRC[of], name);
      if (mb != null && demandsInBody(mb, MODULE_SRC[of], 1)) return true;
    }
  return false;
}
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): T5's layers 2, 4 and 5 moved more acts out of the store; the store's
   dispatch map spreads each module's op map (`...entitiesOps(entitiesOf(this.ctx), …)`, `...progressionOps(…)`, …),
   so `op=relationdeclare` is entities' `declareRelation` and `op=discharge` progressions' `dischargeStage`. An op the
   store's map does not name is looked up in those maps too, exactly as in `membershipOps` above, and read in the
   module's own source (one hop into its private helpers, as for the store). */
const T5_OP_MAPS = [["entities", "entitiesOps"], ["progressions", "progressionOps"], ["connections", "connectionsOps"],
  ["bias", "biasOps"], ["calibration", "calibrationOps"], ["extraction", "extractionOps"],
  ["observation-log", "observationLogOps"],
  /* T7 (legacy-tests; AFFORDANCES #1 J4.4, INTENT #1): intent's acts are spread into the store's map by `intentOps`. */
  ["intent", "intentOps"],
  /* RE-ANCHORED 2026-09-28 (T7 LEGACY-TESTS #4): T7's layer 6 moved more acts out of the store, each spread into its
     map the same way: `sever` and `reinstate` are citation's (CITATION #1 J2), `dispose`, `inquirydivide` and
     `inquiryground` inquiry's (INQUIRY #1 J3), `conclude`, `withdrawconclusion` and the version acts basis-versions',
     and the strength, run-productions, contradiction, reevaluation, capture-requests and ai-runs ops their modules'. */
  ["citation", "citationOps"], ["inquiry", "inquiryOps"], ["basis-versions", "basisVersionsOps"],
  ["strength", "strengthOps"], ["run-productions", "runProductionsOps"], ["contradiction", "contradictionOps"],
  ["reevaluation", "reevaluationOps"], ["capture-requests", "captureRequestsOps"], ["ai-runs", "aiRunsOps"],
  /* RE-ANCHORED 2026-09-28 (T8, legacy-tests; AFFORDANCES #2 J3): T8's layers 3, 8 and 9 moved more acts out of the
     store, each spread into its dispatch map the same way — capture's (`captureOps`), case-authoring's
     (`caseAuthoringOps`: `publishcase` among them), ratification's, publication's, review's, actions'
     (`actionsOps`: `actionmove`, `actionrisktier`, …) and monitoring's. Layer 9's other modules (standards,
     conformance, consequences, filings, escalation) are not routed in T8 (K263, K264), so they are not read. */
  ["capture", "captureOps"], ["case-authoring", "caseAuthoringOps"], ["ratification", "ratificationOps"],
  ["publication", "publicationOps"], ["review", "reviewOps"], ["actions", "actionsOps"],
  ["monitoring", "monitoringOps"]];
const T5_ROUTES = new Map();
for (const [mod, fn] of T5_OP_MAPS) {
  const src = moduleSources(mod);
  const map = methodBody(src.replace(new RegExp(`^export function ${fn}`, "m"), `  ${fn}`), fn) ?? "";
  /* RE-ANCHORED 2026-09-28 (T7): the receiver may be more than one letter (`basisVersionsOps` names it `bv`). */
  for (const x of map.matchAll(/^\s{4}([a-z][a-z0-9]*)\s*:\s*(?:async\s*)?\(\)\s*=>\s*(?:\(\{\s*\.\.\.)?[a-z][a-z0-9]*\.([A-Za-z0-9_]+)\s*\(/gm))
    if (!T5_ROUTES.has(x[1])) T5_ROUTES.set(x[1], { method: x[2], src });
}
t("the T5 modules' op maps were read — relationdeclare and discharge route to entities and progressions",
  [T5_ROUTES.get("relationdeclare")?.method, T5_ROUTES.get("discharge")?.method],
  ["declareRelation", "dischargeStage"]);
/* RE-ANCHORED 2026-09-28 (T8, legacy-tests; CASE-AUTHORING #1): the store's map no longer names the method — it spreads
   `caseAuthoringOps(…)`, whose `publishcase` routes to case-authoring's `publishCase` — so the route is followed into
   the op map exactly as section 4's backing scan follows it (`T5_ROUTES`, just above). Still derived, never spelled. */
const pubRoute = routeOf(irreversible[0], table);
const pubVia = pubRoute.method ? null : T5_ROUTES.get(pubRoute.doPath);
t("and it is the op that ROUTES to the publishing path — derived through the "
+ "dispatch table, so a rename or a re-route fails this rather than drifting",
  { doPath: pubRoute.doPath, method: pubRoute.method ?? pubVia?.method ?? null },
  { doPath: "publishcase", method: "publishCase" });
const demandsAccount = new Set();
const bodiesRead = [];
for (const op of MUTATING) {
  if (VERSION_OPS.includes(op)) continue;
  const r = routeOf(op, table);
  /* RE-ANCHORED 2026-09-26 (T3, legacy-tests; the membership extraction): an op the store's dispatch map no longer
     names is looked up in `membershipOps`, the map membership contributes to it, and read in membership's source. */
  const viaMembership = !r.method ? MEMBERSHIP_ROUTES.get(r.doPath) : null;
  const viaT5 = !r.method && !viaMembership ? T5_ROUTES.get(r.doPath) : null;   /* RE-ANCHORED 2026-09-27 (T5-12) */
  if (!r.method && !viaMembership && !viaT5) continue;
  const src = viaMembership ? MODULE_SRC.membershipOf : viaT5 ? viaT5.src : storeSrc;
  const body = methodBody(src, viaMembership ?? viaT5?.method ?? r.method);
  if (body == null) continue;
  bodiesRead.push(op);
  if (demandsInBody(body, src)) demandsAccount.add(op);
}
for (const a of Object.keys(VERSION_ACT_TO))
  if (versionNeedsReason(VERSION_ACT_TO[a])) demandsAccount.add(`version${a}`);

console.log(`  FW-14 BACKING SCAN: ${bodiesRead.length} store method bodies read · `
  + `${demandsAccount.size} op(s) refuse for want of an authored account`);
/* The reach floor for THIS scan, separate from section 1's. A matcher narrowed
   to nothing would make every "backed" assertion below vacuously true. */
t("the backing scan actually read the store — method-body reach floor",
  bodiesRead.length >= 55, true);
t("and it found a non-trivial number of accounts demanded", demandsAccount.size >= 15, true);

const RANK = Object.fromEntries(RUNG_LADDER.map((r, i) => [r, i]));
const underclaimed = [...demandsAccount].sort().filter((op) =>
  !(op in RUNGS) || RANK[RUNGS[op]] < RANK.reasoned);
t("NO UNDER-CLAIM: every op the store refuses without an authored account sits "
+ "at `reasoned` or above — so an op that grows a reason requirement cannot keep "
+ "a lighter rung, and cannot sit in RUNG_ABSENT at all",
  underclaimed, []);

const unbacked = Object.entries(RUNGS).filter(([op, r]) => r === "reasoned" && !demandsAccount.has(op))
  .map(([op]) => op).sort();
t("NO UNBACKED CLAIM: every op declared `reasoned` really is refused without an "
+ "authored account — a rung with no backing is a promise nothing keeps",
  unbacked, []);

/* ---- reversible: the plane publishes an act that takes the result back. This
   is the only evidence accepted, because "I found no obstacle" is an outcome
   that costs nothing to produce and is therefore not evidence (CLAUDE.md). */
const reversible = Object.entries(RUNGS).filter(([, r]) => r === "reversible").map(([o]) => o).sort();
/* CORRECTED 2026-09-28 (T7; K211, affordances R2's R27 ruling, AFFORDANCES #1 J4.4): four more acts carry
   `reversible` — `actionlaws`, `projectvisibilityset`, `versionaccept` and `versioncurrent`. */
t("`reversible` is carried by exactly the acts with a published way back",
  reversible, ["actionlaws", "cite", "projectvisibilityset", "versionaccept", "versioncurrent",
               "versionhide", "versionrevert"]);
t("nothing declared `reversible` is one the store refuses without an account "
+ "(the FW-14 row's own negative control: `reversible` on op=retire must fail, "
+ "and it fails HERE, because retire refuses NO_REASON)",
  reversible.filter((op) => demandsAccount.has(op)), []);

/* C-7's ANSWER, CHECKED RATHER THAN ASSUMED. The FW-14 row claims its derivation
   method already yields C-7's answer, and UI-20 recorded "C-7 derives
   reversible" for op=cite while rendering the rung as ABSENT because FW-14 had
   not assigned it. The backing is mechanical: cite writes `status: "confirmed"`
   and sever's `from` set accepts exactly that, so the act that takes a citation
   back accepts what citing wrote. Both halves read out of the store. */
/* RE-ANCHORED 2026-09-28 (T7 LEGACY-TESTS #4; CITATION #1 J2): `cite`, `sever` and `#edgeTransition` moved out of
   store.mjs into src/citation/index.mjs; both halves are read there. */
const citationSrc = moduleSources("citation");
const citeStatuses = [...citationSrc.matchAll(/rel:\s*"cites",\s*target,\s*status:\s*"([a-z]+)"/g)]
  .map((m) => m[1]);
const severFrom = (() => {
  const m = /sever\(\{[\s\S]*?from:\s*\[([^\]]*)\]/.exec(citationSrc);
  return m ? [...m[1].matchAll(/"([a-z]+)"/g)].map((x) => x[1]) : null;
})();
t("op=cite writes its edges at ONE status, read out of the store",
  [...new Set(citeStatuses)], ["confirmed"]);
t("and op=sever's `from` set accepts that status — so the plane publishes an act "
+ "that takes a citation back, which is C-7's answer and the ROW'S CLAIM HOLDS",
  severFrom !== null && severFrom.includes("confirmed"), true);
t("severing is not erasure, so `reversible` is not overclaiming: the edge lands "
+ "in `severed`, a status the record keeps",
  severFrom !== null && /to:\s*"severed"/.test(citationSrc), true);

/* ------------------------- 5. the absence half is a STATEMENT, not a blank */
console.log("\n--- 5. the stated absences say something ---");
const byGround = {};
for (const [op, v] of Object.entries(RUNG_ABSENT)) (byGround[v.ground] ||= []).push(op);
for (const g of Object.keys(RUNG_ABSENCE_GROUNDS))
  console.log(`  ground ${g.padEnd(14)} ${(byGround[g] || []).length} op(s)`);
t("every published ground is actually used — a ground nobody is on is a "
+ "vocabulary entry describing nothing",
  Object.keys(RUNG_ABSENCE_GROUNDS).filter((g) => !(g in byGround)), []);
t("`undetermined` is a REAL bucket and is kept apart from the four grounds on "
+ "which the ladder simply does not reach: CLAUDE.md makes undetermined "
+ "first-class and it must be STATED rather than folded into a category error",
  (byGround.undetermined || []).length >= 10, true);
t("and every ground's own text explains itself at length rather than naming itself",
  Object.entries(RUNG_ABSENCE_GROUNDS).filter(([, why]) => why.length < 120).map(([g]) => g), []);

/* ------------------------------- 6. what a caller actually receives */
/* One crossing to the publication layer: the classification is worthless to a
   member if the plane keeps it to itself. `decorateAct` is read from source
   rather than driven, because `affordances.test.mjs` owns the wire. */
console.log("\n--- 6. the absence reaches a caller ---");
const indexSrc = readFileSync(join(PLANE, "src/index.mjs"), "utf8");
/* RETIRED 2026-09-28 (T8, legacy-tests; N177, legacy-index's share landed): the two `decorateAct` source scans ("…
   publishes the absence GROUND beside the rung" and "index.mjs imports RUNG_ABSENT from the one place it is
   defined"). The decoration is affordances' `decorate(act, gate)` (its R11), which index.mjs calls, so the ground is
   published by the module that defines RUNG_ABSENT and index.mjs no longer names it. Proven by
   `test/m/affordances/services.test.mjs`, test "R11: needs and mode are the gate's answer for the act, rung RUNGS',
   rung_absence RUNG_ABSENT's ground, and …", and over the wire by `test/m/affordances/plane.test.mjs`, test "R24: no
   act in any answer carries a null rung without a stated absence". What stays readable here: index.mjs decorates
   through that function and holds no decoration of its own. */
t("index.mjs decorates through affordances' `decorate` and composes no `rung_absence` of its own",
  [/import \{[^}]*\bdecorate\b[^}]*\} from "\.\/affordances\.mjs"/s.test(indexSrc),
   /rung_absence\s*:/.test(indexSrc.replace(/\/\*[\s\S]*?\*\//g, ""))], [true, false]);

/* ---------------------------------------------------------------- the foot */
/* THE FOOT IS ASSERTED TO HAVE BEEN REACHED. A TypeError inside an assertion
   goes through no assertion at all and ends the module while the tally reads
   clean; this project has recorded exactly that. If this line does not print,
   the count above is not the count. */
console.log(`\nrung-ladder: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
process.exit(fail > 0 ? 1 : 0);
