/* NEGATIVE CONTROL for the cross-file walk->floor detector.  M0-21 / D-268.
 *
 * Run:  node test/walkfloor.control.mjs [armId ...]      (default: all)
 *
 * DELIBERATELY NOT A `.test.mjs`.  `scripts/battery.mjs` discovers by that suffix
 * and this driver EDITS REAL SOURCES while it runs; `fieldread.control.mjs`,
 * `retirement.control.mjs` and `query.control.mjs` are the precedent.
 *
 * WHY IT IS THIS LONG.  The subject is an INSTRUMENT, and controls here find the
 * instrument wrong more often than the subject — this item's own detector shipped
 * two first-draft bugs, EACH OF WHICH PRODUCED A COMPLETELY CLEAN REPORT over an
 * estate with five real findings in it.  A green run means nothing until something
 * has been broken and the suite has been watched to fall over.
 *
 * THE RULES THIS DRIVER FOLLOWS, each of which this project paid to learn:
 *  - Each arm is armed ALONE, with every other defence held OPEN.
 *  - Every arm DECLARES BEFORE IT RUNS what must fail and what must NOT.
 *  - A BASELINE arm exists.  Without one, a first run reporting failure for every
 *    arm cannot be distinguished from a harness that breaks everything it touches.
 *  - Every restore is verified by sha256 AND by `cmp`-equivalent byte comparison,
 *    against a UNIQUELY NAMED per-arm pristine copy, with the byte count PRINTED
 *    and floored — two harnesses here once reported a restore byte-identical over
 *    an EMPTY manifest, caught only because a digest read `e3b0c442…`.
 *  - A patch that matches ZERO times is a FINDING, not a silent no-op.  An arm that
 *    did not arm is the most common way a control lies.
 *  - A tally that cannot be read is reported as -1, never as 0.  A `TypeError`
 *    inside an assertion goes through no assertion at all and ends the module while
 *    the tally reads clean, so each run is checked for its suite's own FOOT line.
 *  - An OVER-STRICTNESS arm is included: correct work in a spelling the author did
 *    not anticipate must PASS.  A fence tighter than its rule is not a safer fence.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const DETECTOR = join(PLANE, "scripts", "walkfloor.mjs");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const runSuite = (rel) => {
  let out = "";
  try {
    out = execFileSync(process.execPath, [join(PLANE, rel)],
      { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  /* THE FOOT LINE IS THE EVIDENCE THE MODULE REACHED ITS OWN END.  Without it a
     count is not a low number, it is NO number, and it is reported as -1.
     D-302 added `op-claims` to the set, because its phantom arm's whole subject is
     that suite's fifth floor and a suite that died before its foot would report
     zero failures. */
  const m = out.match(/\n(?:walkfloor|hygiene|op-claims):\s+(\d+) pass, (\d+) fail/);
  if (!m) return { pass: -1, fail: -1, reachedFoot: false, out };
  return { pass: Number(m[1]), fail: Number(m[2]), reachedFoot: true, out };
};

/* Which suites an arm is judged on.  D-302's phantom arm is about
   `test/op-claims.test.mjs`; every arm before it was about the detector and its
   ratchet, so that pair stays the default. */
const DEFAULT_SUITES = { walkfloor: "test/walkfloor.test.mjs", hygiene: "test/hygiene.test.mjs" };

/* D-302 · THE PHANTOM ARM'S TOKEN, BUILT AND NEVER SPELLED.  This file is COMMITTED
   and sits inside the repository corpus `scripts/op-claims.mjs` sweeps, so a literal
   `op=<name>` here is a third party's claim about the dispatch table — and one
   carrying an attribution would raise the very figure the phantom arm asserts a
   phantom cannot raise.  `test/op-claims.test.mjs` composes its own fixtures the
   same way and records the four places its first draft failed by citing itself. */
const OP = (n) => "op=" + n;
const DISPATCHES = "dispatches" + " to";

/* ------------------------------------------------------------------ THE ARMS */
/* `patch` returns the edited source, or null if it could not find its anchor.
   `expect` is the DECLARATION, written before the arm was ever run. */
const ARMS = [
  {
    id: "baseline",
    what: "NO EDIT AT ALL — the row that distinguishes six-arms-broken from six-arms-working",
    expect: "walkfloor GREEN (39 pass / 0 fail — RE-MEASURED 2026-09-10 by D-302, was 31 "
          + "before its eight added arms) and hygiene GREEN (0 fail). If this row is "
          + "red, every other row in this table is uninterpretable.",
    file: null, patch: null,
    ok: (r) => r.walkfloor.fail === 0 && r.hygiene.fail === 0 && r.walkfloor.pass >= 39,
  },
  {
    id: "hop",
    what: "NEUTER THE CROSS-MODULE HOP — never seed a binding from an imported walk-derived export",
    expect: "MUST FAIL: every F1-F7 spelling, the estate op-claims arm, and hygiene's "
          + "'REAL cross-file split is found' and 'finds THIS suite's own floors' arms. "
          + "MUST NOT FAIL: B1-B5, which expect [] and get [] for the wrong reason — "
          + "which is exactly why a suite of only-benign arms would be worthless.",
    file: DETECTOR,
    patch: (s) => s.includes("        if (tf.derivedExports.has(nm.imported)) seeds.set(nm.local")
      ? s.replace("        if (tf.derivedExports.has(nm.imported)) seeds.set(nm.local",
                  "        if (false && tf.derivedExports.has(nm.imported)) seeds.set(nm.local")
      : null,
    ok: (r) => r.walkfloor.fail > 0 && r.hygiene.fail > 0,
  },
  {
    id: "destructured",
    what: "RESTORE FIRST-DRAFT BUG (a) — read a destructured PARAMETER LIST as a function body",
    expect: "MUST FAIL: §0(a), F7's chain, and the estate arm, because `sweep` stops "
          + "being walk-derived and the op-claims split disappears. This is the bug "
          + "that shipped a clean report over five real findings.",
    file: DETECTOR,
    patch: (s) => s.includes("braceBody(stripped, afterParams(stripped, m.index + m[0].length - 1))")
      ? s.replaceAll("braceBody(stripped, afterParams(stripped, m.index + m[0].length - 1))",
                     "braceBody(stripped, m.index + m[0].length)")
      : null,
    ok: (r) => r.walkfloor.fail > 0 && r.hygiene.fail > 0,
  },
  {
    id: "stringstrip",
    what: "RESTORE FIRST-DRAFT BUG (b) — read imports off source with STRING LITERALS BLANKED",
    expect: "MUST FAIL: §0(b) and every arm that needs an import resolved, because no "
          + "specifier can match. The whole estate reads as importing nothing.",
    file: DETECTOR,
    patch: (s) => s.includes("for (const imp of importsOf(si)) {")
      ? s.replace("for (const imp of importsOf(si)) {", "for (const imp of importsOf(s)) {")
      : null,
    ok: (r) => r.walkfloor.fail > 0 && r.hygiene.fail > 0,
  },
  {
    id: "modulegrain",
    what: "GRADE AT MODULE GRANULARITY — flag any comparison in a file that imports a walking module",
    expect: "MUST FAIL: B1 and the estate's `LEDGER.length >= 20` arm, and hygiene's "
          + "false-positive arm. THIS IS THE ARM THAT PROVES THE FALSE-POSITIVE GUARD "
          + "IS REAL. Without it, 'no false positives' is a claim about a detector "
          + "nobody ever made cry wolf.",
    file: DETECTOR,
    patch: (s) => s.includes("      const lLive = lRoot && live.has(lRoot);")
      ? s.replace("      const lLive = lRoot && live.has(lRoot);\n      const rLive = rRoot && live.has(rRoot);",
                  "      const lLive = Boolean(lRoot);\n      const rLive = Boolean(rRoot);")
      : null,
    ok: (r) => r.walkfloor.fail > 0 && r.hygiene.fail > 0,
  },
  {
    id: "stripper",
    what: "MAKE THE STRIPPER A NO-OP — let comments, strings and regex literals count as code",
    expect: "MUST FAIL: §1's arms (three until 2026-09-10, EIGHT since D-301). A module "
          + "whose only mention of a walk is prose becomes a walk module, which is the "
          + "documentation-poisons-a-corpus class this repository has now met in four "
          + "separate instruments. Since D-301 the census in `hygiene.test.mjs` reads "
          + "through this same lexer, so hygiene falls with it.",
    file: DETECTOR,
    /* ANCHOR MOVED 2026-09-10 BY D-301, AND IT MOVED BECAUSE THIS ARM REPORTED
       `DID NOT ARM` ON A REAL RUN — the finding, not a tidy-up. The anchor named
       `strip`'s full SIGNATURE, and D-301 added one option to it
       (`keepInterpolations`), so the patch matched zero times and the arm quietly
       neutered nothing while both suites read green. Precisely WORKER.md's named
       failure: an arm that did not arm is the most common way a control lies, and
       only the driver's own zero-match check made it visible. The anchor is now the
       first two lines of the BODY, which no signature change can move. */
    patch: (s) => s.includes("  const n = src.length;\n  const out = new Array(n);")
      ? s.replace("  const n = src.length;\n  const out = new Array(n);",
                  "  if (true) return src;\n  const n = src.length;\n  const out = new Array(n);")
      : null,
    ok: (r) => r.walkfloor.fail > 0,
  },
  {
    id: "overstrict",
    what: "OVER-STRICTNESS — correct work in a spelling the ratchet was not written against",
    expect: "MUST **PASS**, both suites GREEN. A NEW consumer that floors on a walk one "
          + "import away, on the figure that walk declares REPRODUCIBLE, is correct work — "
          + "it is D-257's two-line pattern, done right. If the ratchet names it, the check "
          + "is tighter than its rule — an undeclared interface change wearing the costume "
          + "of caution — and it gets switched off by the third person it interrupts.",
    /* CORRECTED 2026-09-10 BY D-302, NEVER EXEMPTED, AND THE CORRECTION IS THE ITEM
       ARRIVING IN ITS OWN CONTROL. The fixture used to floor on `r.corpus.length`
       — a WORKING-TREE figure — and import `provenance.mjs`, because under the old
       predicate importing that module WAS the definition of correct work. It is
       not: the import is a fact about the consumer's file and the exposure is a
       fact about the figure. Under the real rule this fixture was a genuine
       unguarded floor wearing a guard's costume, so leaving it here would have
       asserted that the corrected ratchet must NOT fire on a real instance — an
       over-strictness arm defending the defect. Correct work is now spelled the
       way D-257 spells it, and the `ratchet` arm below is the same fixture with
       the reproducible figure swapped back out, which makes the pair a DELTA. */
    newFile: join(PLANE, "test", "walkfloor-overstrict.probe.mjs"),
    body: `/* ARM overstrict FIXTURE. Correct work: floors on the HEAD-REPRODUCIBLE figure
   a walk one import away publishes. The ratchet must leave it alone. Deleted by the driver. */
import { sweep } from "../scripts/op-claims.mjs";
const r = sweep();
if (r.filesRepro >= 42) console.log("ok");
`,
    ok: (r) => r.walkfloor.fail === 0 && r.hygiene.fail === 0,
  },
  {
    id: "ratchet",
    what: "THE RATCHET ITSELF — a NEW cross-file floor on a WORKING-TREE figure must fail BY NAME",
    expect: "MUST FAIL: hygiene's 'every cross-file walk-derived floor is GUARDED or "
          + "NAMED' arm, and the failure must NAME the new file. A ratchet that does not "
          + "fire on a new instance is a mechanism believed on its existence. Held against "
          + "`overstrict` above, which is the SAME fixture reading the reproducible figure, "
          + "this is a DELTA over one identifier rather than a claim about a fixture.",
    newFile: join(PLANE, "test", "walkfloor-ratchet.probe.mjs"),
    body: `/* ARM ratchet FIXTURE. A new cross-file floor on a WORKING-TREE figure.
   The census cannot see it (no readdirSync here); the detector must. Deleted by the driver. */
import { sweep } from "../scripts/op-claims.mjs";
const r = sweep();
if (r.dynamic >= 99) console.log("ok");
`,
    ok: (r) => r.hygiene.fail > 0 && /walkfloor-ratchet\.probe\.mjs/.test(r.hygiene.out),
  },

  /* ============================ D-302's THREE ARMS ============================ */
  {
    id: "phantom",
    what: "THE ARM THIS ITEM EXISTS FOR — an UNCOMMITTED attribution arrival must not move "
        + "the corpus the fifth floor stands on, and the BEFORE state is proved in the same run",
    expect: "MUST **PASS**: `op-claims` GREEN with the phantom present. The suite's own "
          + "label must print `5 of 6 attribution(s)` — SIX counted over the working tree, "
          + "which is the figure the floor read BEFORE this item and is therefore the "
          + "'before' proved rather than described, and FIVE over `git ls-tree HEAD`, which "
          + "is what the floor reads now and what the phantom cannot touch. A floor moved to "
          + "the 6 a contaminated run PRINTED would be permanently too high and would fail "
          + "every honest run afterwards — D-238's payload, live.",
    suites: { "op-claims": "test/op-claims.test.mjs" },
    newFile: join(PLANE, "test", "d302-phantom.probe.md"),
    /* A CORRECT attribution on purpose: a wrong one would fail as a WRONG-METHOD
       finding and the arm would pass for the wrong reason. The claim is TRUE and
       still must not move a floor, because the exposure is arrival, not falsity.
       AND THE TOKEN IS COMPOSED AT RUNTIME, NEVER SPELLED. This driver is a
       COMMITTED file inside the corpus `op-claims.mjs` sweeps, so a literal
       fixture here is a real routing claim in HEAD — it would raise
       `attributionsRepro` by one and this arm's own expected `5 of 6` would read
       `6 of 7`, the arm moving the figure it exists to prove immovable. Measured:
       the first draft of this arm did exactly that. `test/op-claims.test.mjs`
       obeys the same rule in its §5 fixtures and says why at length. */
    body: `ARM phantom FIXTURE — uncommitted, deleted by the driver.

A routing claim nobody committed: ${OP("publish")} ${DISPATCHES} \`Store.publishCase()\`.
`,
    ok: (r) => r["op-claims"].fail === 0 && /5 of 6 attribution\(s\)/.test(r["op-claims"].out),
  },
  {
    id: "guardimport",
    what: "POINT THE GRADE BACK AT THE IMPORT SPELLING — the predicate D-302 removed",
    expect: "MUST FAIL, and the failure must NAME a file the old predicate misgrades. "
          + "`test/op-claims.test.mjs` does not import `provenance.mjs`, so all five of its "
          + "genuinely-guarded floors grade UNGUARDED again and hygiene's GUARDED-or-NAMED "
          + "arm fires on it by name; the two files that DO import it go back to reading "
          + "GUARDED, so their named entries fail as STALE. Both directions, one run.",
    file: DETECTOR,
    patch: (s) => s.includes("                    guarded: g.grade === \"GUARDED\" };")
      ? s.replace("                    guarded: g.grade === \"GUARDED\" };",
                  "                    guarded: facts.get(f).importsProvenance };")
      : null,
    ok: (r) => r.hygiene.fail > 0 && /op-claims\.test\.mjs/.test(r.hygiene.out),
  },
  {
    id: "reportonly",
    what: "OVER-STRICTNESS, SECOND DIRECTION — a consumer that only REPORTS working-tree "
        + "figures is legal and must never be failed",
    expect: "MUST **PASS**, both suites GREEN. D-257 ruled that a walk which only reports "
          + "fails safe, and `walkfigure.mjs` implements that ruling in the hint: ToString "
          + "PRINTS while ToNumber THROWS. A report is not a floor, it needs no guard and no "
          + "unwrap, and a detector that flagged it would make every diagnostic line in the "
          + "estate a finding — which is how a check gets switched off. "
          + "DELIBERATELY NOT THE FIXTURE: the same report written through "
          + "`.overWorkingTree(why)`. That WOULD fail, on D-265's passage ratchet, and "
          + "correctly — an unwrap is a DECISION and the ratchet exists to name decisions. "
          + "Declaring that shape must pass would weaken D-265 rather than test D-302.",
    newFile: join(PLANE, "test", "walkfloor-reportonly.probe.mjs"),
    body: `/* ARM reportonly FIXTURE. Imports a walk and only PRINTS its WORKING-TREE
   figures — no comparison, no unwrap. Must be legal. Deleted by the driver. */
import { sweepWalkFloors } from "../scripts/walkfloor.mjs";
const r = sweepWalkFloors();
console.log(\`estate: \${r.corpus.count} module(s), \${r.walkModules.count} walk module(s)\`);
`,
    ok: (r) => r.walkfloor.fail === 0 && r.hygiene.fail === 0,
  },
];

/* --------------------------------------------------------------------- RUNNER */
const wanted = process.argv.slice(2);
const arms = wanted.length ? ARMS.filter((a) => wanted.includes(a.id)) : ARMS;
if (wanted.length && arms.length !== wanted.length) {
  console.error(`unknown arm(s): ${wanted.filter((w) => !ARMS.some((a) => a.id === w)).join(", ")}`);
  process.exit(2);
}

console.log(`walkfloor.control — ${arms.length} arm(s), each armed ALONE\n`);
const results = [];

for (const arm of arms) {
  console.log(`=== ARM ${arm.id} ===`);
  console.log(`  what:    ${arm.what}`);
  console.log(`  declare: ${arm.expect}`);

  let pristine = null, target = null, armed = false, note = "";

  if (arm.file) {
    target = arm.file;
    pristine = `${target}.pristine-${arm.id}`;
    copyFileSync(target, pristine);
    const beforeSha = sha(target), beforeBytes = statSync(target).size;
    console.log(`  pristine ${pristine.split("/").pop()} · ${beforeBytes} bytes · sha ${beforeSha.slice(0, 12)}…`);
    if (beforeBytes < 4000 || beforeSha === EMPTY_SHA) {
      console.log(`  ABORT: pristine copy is implausibly small or empty — refusing to arm.`);
      results.push({ id: arm.id, verdict: "ABORTED", note: "pristine floor" });
      unlinkSync(pristine); continue;
    }
    const patched = arm.patch(readFileSync(target, "utf8"));
    if (patched === null) {
      note = "PATCH MATCHED ZERO TIMES — AN ARM THAT DID NOT ARM IS A FINDING";
      console.log(`  !! ${note}`);
    } else { writeFileSync(target, patched); armed = true; }
  } else if (arm.newFile) {
    target = arm.newFile;
    if (existsSync(target)) { console.log(`  ABORT: ${target} already exists`); results.push({ id: arm.id, verdict: "ABORTED" }); continue; }
    writeFileSync(target, arm.body);
    armed = true;
    console.log(`  added ${target.split("/").pop()} · ${statSync(target).size} bytes`);
  } else { armed = true; console.log("  (no edit — baseline)"); }

  const suites = arm.suites ?? DEFAULT_SUITES;
  const r = {};
  for (const [key, rel] of Object.entries(suites)) {
    r[key] = runSuite(rel);
    console.log(`  ${`${key}:`.padEnd(11)}${r[key].pass} pass / ${r[key].fail} fail`
      + `${r[key].reachedFoot ? "" : "   <-- NO FOOT LINE: the module did not reach its own end"}`);
  }

  /* restore, and PROVE it */
  let restored = "n/a";
  if (arm.file) {
    const pSha = sha(pristine), pBytes = statSync(pristine).size;
    copyFileSync(pristine, target);
    const aSha = sha(target), aBytes = statSync(target).size;
    const identical = readFileSync(target).equals(readFileSync(pristine));   // the `cmp`
    restored = (aSha === pSha && identical && aBytes === pBytes && aBytes > 4000 && aSha !== EMPTY_SHA) ? "VERIFIED" : "FAILED";
    console.log(`  restore:  ${restored} · ${aBytes} bytes · sha ${aSha.slice(0, 12)}… · byte-compare ${identical ? "identical" : "DIFFERENT"}`);
    unlinkSync(pristine);
  } else if (arm.newFile) {
    unlinkSync(target);
    restored = existsSync(target) ? "FAILED" : "VERIFIED";
    console.log(`  restore:  ${restored} (probe file removed)`);
  }

  const verdict = !armed ? "DID NOT ARM" : (arm.ok(r) ? "AS DECLARED" : "NOT AS DECLARED");
  console.log(`  VERDICT:  ${verdict}${note ? ` (${note})` : ""}\n`);
  results.push({ id: arm.id, verdict, restored,
                 tallies: Object.entries(r).map(([k, v]) => `${k}=${v.pass}/${v.fail}`).join("  ") });
}

console.log("--- SUMMARY ---");
for (const r of results)
  console.log(`  ${r.id.padEnd(14)} ${String(r.verdict).padEnd(16)} restore=${r.restored}  ${r.tallies}`);
const bad = results.filter((r) => r.verdict !== "AS DECLARED" || (r.restored !== "VERIFIED" && r.restored !== "n/a"));
console.log(bad.length
  ? `\n${bad.length} arm(s) NOT as declared or not restored — RECORD THEM, do not smooth them.`
  : `\nall ${results.length} arm(s) as declared, every restore verified.`);
process.exit(bad.length ? 1 : 0);
