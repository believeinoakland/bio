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

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  RUNGS, RUNG_ABSENT, RUNG_LADDER, RUNG_ABSENCE_GROUNDS, JUSTIFICATION_REFUSALS,
  IRREVERSIBLE_CORRECTION_PATH, VOCABULARIES,
} from "../src/affordances.mjs";
import { STATES, VERSION_REASON_REQUIRED, versionNeedsReason } from "../checks/bio-checks.mjs";
import { readDispatch, routeOf, PLANE } from "../scripts/op-claims.mjs";

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
t("and it is the op that ROUTES to the publishing path — derived through the "
+ "dispatch table, so a rename or a re-route fails this rather than drifting",
  routeOf(irreversible[0], table), { doPath: "publishcase", method: "publishCase" });

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

/* ---- attested: an authority OUTSIDE the group. Both are capture/publication
   ceremonies requiring a key or a timestamp authority, which is what separates
   this rung from `reasoned` below it. */
t("`attested` is carried by exactly the two acts Constructs:275 sources",
  Object.entries(RUNGS).filter(([, r]) => r === "attested").map(([o]) => o).sort(),
  ["attest", "ratify"]);

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

const jre = new RegExp(
  `reason:\\s*"(${JUSTIFICATION_REFUSALS.join("|")})"`
  + `|refuse\\("(${JUSTIFICATION_REFUSALS.join("|")})"`, "g");

/* THE VERSION FAMILY IS HELD OUT OF THE TEXTUAL SCAN DELIBERATELY, and this is
   the sharpest thing in the file. All six version acts route through ONE
   `#moveVersionState` carrying ONE `VERSION_NO_REASON` refusal, and the branch
   fires only when `versionNeedsReason(to)` — so a classifier grading them by
   finding the code in the shared helper promotes FOUR ops to a rung the store
   does not enforce. That is the same defect as grading a file by a word in its
   comments (REC-70, REC-64). These six are decided by the exported predicate. */
const VERSION_ACT_TO = (() => {
  const m = /static\s+VERSION_ACT_TO\s*=\s*\{([\s\S]*?)\};/.exec(storeSrc);
  if (!m) return null;
  const out = {};
  for (const r of m[1].matchAll(/(\w+)\s*:\s*(?:"([a-z]+)"|null)/g)) out[r[1]] = r[2] ?? null;
  return out;
})();
t("`Store.VERSION_ACT_TO` was read out of the store — the six acts' target states",
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
const demandsAccount = new Set();
const bodiesRead = [];
for (const op of MUTATING) {
  if (VERSION_OPS.includes(op)) continue;
  const r = routeOf(op, table);
  if (!r.method) continue;
  const body = methodBody(storeSrc, r.method);
  if (body == null) continue;
  bodiesRead.push(op);
  let hit = jre.test(body); jre.lastIndex = 0;
  if (!hit) {
    for (const dm of new Set([...body.matchAll(/this\.(#[A-Za-z][A-Za-z0-9_]*)\s*\(/g)].map((x) => x[1]))) {
      const bb = methodBody(storeSrc, dm);
      if (bb == null) continue;
      const h = jre.test(bb); jre.lastIndex = 0;
      if (h) { hit = true; break; }
    }
  }
  if (hit) demandsAccount.add(op);
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
t("`reversible` is carried by exactly the acts with a published way back",
  reversible, ["cite", "versionhide", "versionrevert"]);
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
const citeStatuses = [...storeSrc.matchAll(/rel:\s*"cites",\s*target,\s*status:\s*"([a-z]+)"/g)]
  .map((m) => m[1]);
const severFrom = (() => {
  const m = /sever\(\{[\s\S]*?from:\s*\[([^\]]*)\]/.exec(storeSrc);
  return m ? [...m[1].matchAll(/"([a-z]+)"/g)].map((x) => x[1]) : null;
})();
t("op=cite writes its edges at ONE status, read out of the store",
  [...new Set(citeStatuses)], ["confirmed"]);
t("and op=sever's `from` set accepts that status — so the plane publishes an act "
+ "that takes a citation back, which is C-7's answer and the ROW'S CLAIM HOLDS",
  severFrom !== null && severFrom.includes("confirmed"), true);
t("severing is not erasure, so `reversible` is not overclaiming: the edge lands "
+ "in `severed`, a status the record keeps",
  severFrom !== null && /to:\s*"severed"/.test(storeSrc), true);

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
t("`decorateAct` publishes the absence GROUND beside the rung, so `rung: null` "
+ "is legible as a stated absence rather than as nobody having looked",
  /rung_absence:\s*RUNG_ABSENT\[a\.id\]\?\.ground\s*\?\?\s*null/.test(indexSrc), true);
t("and index.mjs imports RUNG_ABSENT from the one place it is defined",
  /import \{[^}]*\bRUNG_ABSENT\b[^}]*\} from "\.\/affordances\.mjs"/s.test(indexSrc), true);

/* ---------------------------------------------------------------- the foot */
/* THE FOOT IS ASSERTED TO HAVE BEEN REACHED. A TypeError inside an assertion
   goes through no assertion at all and ends the module while the tally reads
   clean; this project has recorded exactly that. If this line does not print,
   the count above is not the count. */
console.log(`\nrung-ladder: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
process.exit(fail > 0 ? 1 : 0);
