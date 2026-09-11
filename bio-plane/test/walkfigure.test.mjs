/* THE WALK BRAND, DRIVEN.  D-265.
 *
 * `scripts/walkfigure.mjs` exists because M0-21 / D-268's cross-file detector is a
 * DETECTOR, and a detector reads source and therefore has a set of shapes it does not
 * understand.  `walkfloor.mjs`'s own header states five, and §5 below MEASURES one of
 * them rather than quoting it: a consumer that floors on a real walk through a data
 * structure is scored CLEAN by the static half — not UNKNOWN, not NAMED, absent from
 * the output — while the brand refuses the same line where it is written.  That
 * measurement is the argument for the shape this item took, and it is why both halves
 * are kept: neither subsumes the other.
 *
 * WHY MOSTLY FIXTURES AND NOT MOSTLY THE ESTATE.  The estate applies the brand at two
 * boundaries today.  An instrument proved only against the shapes its author met is a
 * mechanism believed on its existence, so every route a value can travel is BUILT and
 * driven, the benign shapes are given at least as much weight as the refusals, and the
 * real walks are then driven as well.
 *
 * NEGATIVE CONTROL: `node test/walkfigure.control.mjs [arm]` — FIVE arms, each armed
 * ALONE with every other defence held OPEN, each DECLARING before it ran what must fail
 * and what must not, every restore verified by sha256 AND by a byte compare against a
 * UNIQUELY-NAMED per-arm pristine copy with the byte count printed and floored, and
 * every suite captured to a FILE rather than a pipe (D-282).  Run 2026-09-10.
 * Figures are walkfigure pass/fail · hygiene pass/fail.
 *
 *   (1) baseline — NO EDIT AT ALL: 32/0 · 663/0, GREEN.  The row that makes every other
 *       row interpretable, and the one nobody runs.  ITS FIRST RUN WAS RED at 32/0 ·
 *       660/3 and the failure was THIS FILE, not the arm: three independent ratchets in
 *       `hygiene.test.mjs` — the class census, the cross-file walk->floor list and this
 *       item's own chokepoint list — each named the new suite before anyone read the
 *       diff.  All three were correct and all three are now NAMED decisions with their
 *       reasons at the site.  Without a baseline row that reading was not available.
 *   (2) newfloor — THE ARM THIS ITEM EXISTS FOR: a NEW file imports a walk and floors on
 *       it through a DATA STRUCTURE and a FUNCTION PARAMETER, the two shapes the static
 *       detector states it cannot see.  MEASURED: the static detector reports 0 sites
 *       AND 0 unclassified for it — scored clean, absent from its output entirely —
 *       while RUNNING it throws a WalkFloorError naming `d265-unanticipated.probe.mjs`
 *       at line 11.  Never silently graded harmless by both halves at once.
 *   (3) neuter — ToPrimitive hands the number back instead of refusing: 22/10 · 662/1.
 *       hygiene's REACH arm fails as a DELTA reading `0 of 10 planted floor spelling(s)
 *       refused`, with the planted corpus size PRINTED, while every totality arm stays
 *       GREEN.  A brand that refuses nothing still declares its buckets, which is
 *       precisely why the delta is needed beside them rather than instead of them.
 *   (4) overstrict — a NEW file that merely IMPORTS a walking module, reports, and floors
 *       on a STATIC export: 32/0 · 663/0, identical to the baseline row.
 *   (5) unbranded — `sweep()` returns a bare object: 662/1, the TOTALITY arm failing and
 *       naming `op-claims.mjs · sweep()`, on `declared: false` rather than on a missing
 *       key — a brand removed must not look like a brand that is merely incomplete.
 *
 * TWO THINGS WORTH THE LINES.  The figures above were first written into this header
 * BEFORE the arms ran, and two of them were wrong; they are corrected to what was
 * measured rather than the prose being rewritten around them.  And arm (2)'s first run
 * died in the HARNESS — it unwrapped `sites` as though it were branded, when `sites` is
 * a `safe` bucket entry and therefore a bare array.  The arm was right and the harness
 * was wrong, which is the direction these controls find most often.
 *
 * The enumerated list sits directly under the marker's own paragraph with no prose
 * between them.  That is not style: `control-register.mjs` read TWO arms out of a column
 * table against a real eight, and an explanatory paragraph between the marker and the
 * list scored `arms: null` and dropped a suite out of `classified` entirely.  Both states
 * were observed in `walkfloor.test.mjs` in one sitting.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard its own output */
import "./sandbox.mjs";               /* D-186: this suite mints temp directories */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  walkFigure, walkSet, walkResult, declarationOf, classificationOf,
  isWalkFigure, isWalkSet, isClassified, WalkFloorError, ESCAPES,
} from "../scripts/walkfigure.mjs";
import { sweepWalkFloors, REPO } from "../scripts/walkfloor.mjs";
import { corpus as opCorpus, sweep as opSweep } from "../scripts/op-claims.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  ok ? pass++ : fail++;
};
/* What a line DID, rather than whether it returned: a floor that throws and a floor that
   returns false are different facts and must not read alike. */
const outcome = (fn) => {
  try { fn(); return "RAN"; }
  catch (e) { return e instanceof WalkFloorError ? "REFUSED" : `THREW ${e.name}`; }
};

/* ------------------------------------------------- 1. THE REFUSAL, AND ITS EDGES */
console.log("\n--- 1. a floor on an unguarded figure refuses itself, at the line that wrote it ---");
const fig = walkFigure(4_242, "a fixture corpus");

t("the plain floor is REFUSED", outcome(() => fig >= 300), "REFUSED");
t("and so is the same claim written BACKWARDS", outcome(() => 300 <= fig), "REFUSED");
t("and `>` as well as `>=` — an operator is not a spelling the brand has to know",
  [outcome(() => fig > 1), outcome(() => fig < 1)], ["REFUSED", "REFUSED"]);
t("ARITHMETIC is refused too, which is the one-character escape from a brand that only "
+ "guards comparison", outcome(() => (fig + 0) >= 300), "REFUSED");
t("and so are the three standard launderers: Number(), unary plus, Math.max",
  [outcome(() => Number(fig)), outcome(() => +fig), outcome(() => Math.max(fig, 1))],
  ["REFUSED", "REFUSED", "REFUSED"]);
t("loose equality is refused (hint `default`), because `x == 300` is a floor one character away",
  outcome(() => fig == 300), "REFUSED");

/* THE REFUSAL MUST SAY WHERE. A refusal that cannot name the line is one somebody
   disables rather than fixes. */
{
  let err = null;
  try { void (fig >= 1); } catch (e) { err = e; }
  t("the refusal NAMES the site and the corpus, and carries the hint that triggered it",
    [err instanceof WalkFloorError, /walkfigure\.test\.mjs:\d+/.test(String(err && err.site)),
     String(err && err.figure), err && err.hint],
    [true, true, "a fixture corpus", "number"]);
}

/* ------------------------------- 2. WHAT IT LETS THROUGH, ASSERTED AS HARD ------ */
/* A brand that makes reports unreadable is a check somebody switches off. That is
   `VERIFICATION.md`'s own stated reason for not making `--strict` the gate, and it is
   why the over-strictness direction gets the same weight here as the refusals. */
console.log("\n--- 2. a REPORT is not a floor ---");
t("a template literal prints the number", `${fig}`, "4242");
t("String() and toString() agree with it", [String(fig), fig.toString()], ["4242", "4242"]);
t("JSON.stringify serialises it without throwing, and says what it is",
  JSON.parse(JSON.stringify({ n: fig })).n, { walkFigure: 4242, about: "a fixture corpus" });
t("and it is RECOGNISABLE, so a suite can ask rather than guess",
  [isWalkFigure(fig), isWalkSet(fig), isClassified(fig), isWalkFigure(4242)],
  [true, false, true, false]);

/* ------------------------------------------- 3. THE CHOKEPOINT, AND ITS PRICE --- */
console.log("\n--- 3. the one way out says why, in the source ---");
{
  const before = ESCAPES.length;
  const n = fig.overWorkingTree("this fixture is asserting the unwrap itself, which is the "
    + "one thing that legitimately needs the bare number");
  t("the unwrap returns the bare number and RECORDS the passage with its reason and site",
    [n, ESCAPES.length - before, /walkfigure\.test\.mjs/.test(ESCAPES[ESCAPES.length - 1].site)],
    [4242, 1, true]);
}
t("an unwrap with NO reason is refused — a passage that need not say why is a passage "
+ "everything ends up taking", outcome(() => fig.overWorkingTree()), "REFUSED");
t("and so is a token reason: the floor is on the REASON's length, not on its presence",
  outcome(() => fig.overWorkingTree("because")), "REFUSED");

/* ------------------------------------------------------- 4. COLLECTIONS -------- */
console.log("\n--- 4. a working-tree collection cannot be floored either ---");
const set = walkSet(["a", "b", "c"], "a fixture name set");
t("a floor on its COUNT is refused, exactly as a scalar is", outcome(() => set.count >= 150), "REFUSED");
/* MEASURED, NOT ASSUMED, and it is why `walkSet` is a different shape rather than a
   proxied array: a `length` that throws breaks `filter`, `map`, spread and the array
   iterator, all of which read `length` and ToLength it. So the shape has no `length`
   at all, and `set.length >= 150` is `undefined >= 150` — FALSE, which is the safe
   direction (D-257), never a silent true. */
t("it publishes NO `length`, so the floor cannot even be written — and the value it "
+ "would compare is undefined, which is false rather than silently true",
  [set.length, set.length >= 150], [undefined, false]);
t("and no iterator, so a spread cannot launder it into a plain array",
  outcome(() => [...set]), "THREW TypeError");
t("the raw array is reachable only through the same named chokepoint",
  set.overWorkingTree("a fixture asserting that the unwrap returns the members"), ["a", "b", "c"]);

/* ------------------------------------------- 5. THE FINDING THIS ITEM RESTS ON -- */
/* THE STATIC HALF IS BLIND HERE AND THE BRAND IS NOT, MEASURED SIDE BY SIDE IN ONE
   ASSERTION.  `walkfloor.mjs` states that flow through a DATA STRUCTURE is invisible to
   it; this builds a real consumer in that shape, runs the real detector over it, and
   shows the site is not merely unclassified but ABSENT — while the same floor, executed,
   is refused.  Either half alone would be believed on its existence. */
console.log("\n--- 5. the static detector's stated blindness, MEASURED against the brand ---");
const sandboxes = [];
function sandbox(files) {
  const root = mkdtempSync(join(tmpdir(), "walkfigure-fixture-"));
  sandboxes.push(root);
  mkdirSync(join(root, "pkg", "lib"), { recursive: true });
  mkdirSync(join(root, "pkg", "use"), { recursive: true });
  for (const [rel, body] of Object.entries(files)) writeFileSync(join(root, rel), body);
  return sweepWalkFloors({ repo: root, roots: [["pkg", ["lib", "use"]]] });
}
const LIB = `import { readdirSync } from "node:fs";
export function corpus(d) { return { files: readdirSync(d), chars: 10 }; }
export function sweep(opts = {}) { const c = corpus(opts.d); return { files: c.files.length, chars: c.chars }; }
`;
{
  /* The SAME floor, written two ways: the shape the detector understands, and the shape
     its header says it does not. The delta between the two rows IS the blindness. */
  const seen = sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/direct.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nif (r.files >= 300) {}\n` });
  const blind = sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/held.mjs": `import { sweep } from "../lib/w.mjs";\nconst held = [];\nheld.push(sweep());\nif (held[0].files >= 300) {}\n` });
  const seenN = seen.sites.length, blindN = blind.sites.length;
  const blindUnknown = blind.unknowns.length;
  console.log(`  the detector on the SAME floor: ${seenN} site(s) when written directly, `
    + `${blindN} site(s) when it travels through a data structure `
    + `(${blindUnknown} unclassified — so it is ABSENT, not merely ungraded)`);
  t("the static detector FINDS the floor written directly, and MISSES the identical floor "
  + "held in a data structure — absent from its output entirely, not printed as UNKNOWN",
    [seenN, blindN, blindUnknown], [1, 0, 0]);
}
{
  /* And the brand, over a REAL figure from a REAL walk of this repository, through the
     same two routes plus the other three the header names. */
  const real = opCorpus(REPO, ["bio-plane/scripts"]).chars;
  const routes = {
    "held in an array": () => { const a = []; a.push(real); return a[0] >= 1; },
    "held in a Map": () => new Map([["k", real]]).get("k") >= 1,
    "through a function parameter": () => ((x, bar) => x >= bar)(real, 1),
    "through a re-exported binding (an object property)": () => ({ held: real }).held >= 1,
    "through a dynamic import's result": () => ({ ...{ v: real } }).v >= 1,
  };
  const results = Object.fromEntries(Object.entries(routes).map(([k, fn]) => [k, outcome(fn)]));
  console.log(`  the brand over the same routes, on a REAL figure (${Object.keys(routes).length} route(s)):`);
  for (const [k, v] of Object.entries(results)) console.log(`    ${v}  ${k}`);
  t("the brand refuses the floor down EVERY route the value travels — the classification "
  + "is on the value, so a route is not a spelling it has to have been taught",
    results, Object.fromEntries(Object.keys(routes).map((k) => [k, "REFUSED"])));
}

/* ------------------------------------------------------- 6. THE RESULT BUILDER -- */
console.log("\n--- 6. totality: a figure nobody classified is a FINDING, not a default ---");
{
  const r = walkResult({
    about: "a fixture walk",
    workingTree: { files: 10, names: ["a"] },
    reproducible: { filesRepro: 9 },
    safe: { findings: [[], "asserted EMPTY by every caller, so a phantom turns it RED"] },
    data: { prov: { headSha: "abc" } },
  });
  const d = declarationOf(r);
  t("a fully declared result reports no undeclared figure and nothing laundered",
    [d.declared, d.undeclared, d.laundered, d.buckets.workingTree], [true, [], [], ["files", "names"]]);
  t("the working-tree figures came back CLASSIFIED and the reproducible one did NOT — "
  + "flooring on the reproducible figure is the CORRECT act and must stay easy",
    [isWalkFigure(r.files), isWalkSet(r.names), isWalkFigure(r.filesRepro), r.filesRepro],
    [true, true, false, 9]);
  /* THE ARM THAT MAKES THE RATCHET REAL: a figure bolted on after the fact is not
     classified by accident, and the detector must say so rather than scoring it zero. */
  const bolted = { ...r, mentions: 5000 };
  Object.defineProperty(bolted, Symbol.for("civicos.walkdeclaration"),
    { value: r[Symbol.for("civicos.walkdeclaration")], enumerable: false });
  t("a figure added to the result AFTER the declaration is reported as UNDECLARED by name",
    declarationOf(bolted).undeclared, ["mentions"]);
  t("and a result with no declaration at all is reported as undeclared rather than as clean",
    declarationOf({ files: 10 }).declared, false);
}
t("a `safe` bucket entry with no stated reason is refused at construction — a bucket that "
+ "can be reached without saying why is the bucket everything ends up in",
  outcome(() => walkResult({ about: "x", safe: { a: [[], "short"] } })), "THREW TypeError");
t("and a key declared in two buckets is refused rather than silently taking the last",
  outcome(() => walkResult({ about: "x", workingTree: { a: 1 }, reproducible: { a: 2 } })),
  "THREW TypeError");
t("`classificationOf` separates what carries the classification from what does not",
  classificationOf({ a: walkFigure(1, "x"), b: 2, c: "s" }), { classified: ["a"], bare: ["b"] });

/* --------------------------------------------------- 7. THE REAL WALKS, DRIVEN -- */
/* A fixture-only suite would have agreed with both of `walkfloor.mjs`'s own first-draft
   bugs, each of which reported a perfectly clean estate. So the real boundaries are
   driven — over a NARROW root, because the question is whether the boundary is
   classified and that is answered identically over ten modules and over six hundred. */
console.log("\n--- 7. the real walk boundaries, driven ---");
{
  const NARROW = ["bio-plane/scripts"];
  const c = opCorpus(REPO, NARROW);
  const s = opSweep({ root: REPO, roots: NARROW });
  const w = sweepWalkFloors({ repo: REPO, roots: [["bio-plane", ["scripts"]]] });
  console.log(`  corpus(): ${c.chars} chars over ${c.files.count} file(s) · `
    + `sweep(): ${s.mentions} mention(s) over ${s.names.count} name(s) · `
    + `sweepWalkFloors(): ${w.corpus.count} module(s)`);
  for (const [name, r] of [["op-claims corpus()", c], ["op-claims sweep()", s], ["walkfloor sweepWalkFloors()", w]]) {
    const d = declarationOf(r);
    t(`${name} declares every figure it publishes, launders none, and classifies at least one `
    + `(workingTree: ${d.declared ? d.buckets.workingTree.join(", ") : "—"})`,
      [d.declared, d.undeclared, d.laundered, d.declared && d.buckets.workingTree.length > 0],
      [true, [], [], true]);
  }
  t("and the REAL floors that exist on these walks are refused at the line, not afterwards",
    [outcome(() => s.files >= 300), outcome(() => s.chars >= 10_000_000),
     outcome(() => s.names.count >= 150), outcome(() => s.filesRepro >= 0)],
    ["REFUSED", "REFUSED", "REFUSED", "RAN"]);
}

/* Every sandbox this suite minted is removed, and the count is floored so the check
   cannot pass over an empty set. */
for (const r of sandboxes) rmSync(r, { recursive: true, force: true });
console.log(`  fixture sandboxes created and removed: ${sandboxes.length}`);
t(`every fixture sandbox this suite created was REMOVED (${sandboxes.length} created, floor 2)`,
  [sandboxes.length >= 2, sandboxes.filter((r) => { try { rmSync(r, { recursive: true }); return true; } catch { return false; } }).length],
  [true, 0]);

console.log(`\nwalkfigure: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
