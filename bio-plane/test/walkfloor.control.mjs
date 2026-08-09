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
     count is not a low number, it is NO number, and it is reported as -1. */
  const m = out.match(/\n(?:walkfloor|hygiene):\s+(\d+) pass, (\d+) fail/);
  if (!m) return { pass: -1, fail: -1, reachedFoot: false, out };
  return { pass: Number(m[1]), fail: Number(m[2]), reachedFoot: true, out };
};

/* ------------------------------------------------------------------ THE ARMS */
/* `patch` returns the edited source, or null if it could not find its anchor.
   `expect` is the DECLARATION, written before the arm was ever run. */
const ARMS = [
  {
    id: "baseline",
    what: "NO EDIT AT ALL — the row that distinguishes six-arms-broken from six-arms-working",
    expect: "walkfloor GREEN (31 pass / 0 fail) and hygiene GREEN (0 fail). If this row is "
          + "red, every other row in this table is uninterpretable.",
    file: null, patch: null,
    ok: (r) => r.walkfloor.fail === 0 && r.hygiene.fail === 0 && r.walkfloor.pass >= 31,
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
    expect: "MUST FAIL: §1's three arms. A module whose only mention of a walk is prose "
          + "becomes a walk module, which is the documentation-poisons-a-corpus class "
          + "this repository has now met in four separate instruments.",
    file: DETECTOR,
    patch: (s) => s.includes("export function strip(src, { strings = true } = {}) {\n  const n = src.length;")
      ? s.replace("export function strip(src, { strings = true } = {}) {\n  const n = src.length;",
                  "export function strip(src, { strings = true } = {}) {\n  if (true) return src;\n  const n = src.length;")
      : null,
    ok: (r) => r.walkfloor.fail > 0,
  },
  {
    id: "overstrict",
    what: "OVER-STRICTNESS — correct work in a spelling the ratchet was not written against",
    expect: "MUST **PASS**, both suites GREEN. A NEW consumer that floors on a walk one "
          + "import away but ASKS `provenance.mjs` is correct work. If the ratchet names "
          + "it, the check is tighter than its rule — an undeclared interface change "
          + "wearing the costume of caution — and it gets switched off by the third "
          + "person it interrupts.",
    newFile: join(PLANE, "test", "walkfloor-overstrict.probe.mjs"),
    body: `/* ARM overstrict FIXTURE. Correct work: floors on a walk one import away AND
   asks provenance.mjs. The ratchet must leave it alone. Deleted by the driver. */
import { sweepWalkFloors } from "../scripts/walkfloor.mjs";
import { readGitProvenance } from "../scripts/provenance.mjs";
const r = sweepWalkFloors();
readGitProvenance(process.cwd());
if (r.corpus.length >= 42) console.log("ok");
`,
    ok: (r) => r.walkfloor.fail === 0 && r.hygiene.fail === 0,
  },
  {
    id: "ratchet",
    what: "THE RATCHET ITSELF — a NEW UNGUARDED cross-file floor must fail BY NAME",
    expect: "MUST FAIL: hygiene's 'every cross-file walk-derived floor is GUARDED or "
          + "NAMED' arm, and the failure must NAME the new file. A ratchet that does not "
          + "fire on a new instance is a mechanism believed on its existence.",
    newFile: join(PLANE, "test", "walkfloor-ratchet.probe.mjs"),
    body: `/* ARM ratchet FIXTURE. A new cross-file floor with NO provenance guard.
   The census cannot see it (no readdirSync here); the detector must. Deleted by the driver. */
import { sweepWalkFloors } from "../scripts/walkfloor.mjs";
const r = sweepWalkFloors();
if (r.corpus.length >= 99) console.log("ok");
`,
    ok: (r) => r.hygiene.fail > 0 && /walkfloor-ratchet\.probe\.mjs/.test(r.hygiene.out),
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

  const r = { walkfloor: runSuite("test/walkfloor.test.mjs"), hygiene: runSuite("test/hygiene.test.mjs") };
  console.log(`  walkfloor: ${r.walkfloor.pass} pass / ${r.walkfloor.fail} fail`
    + `${r.walkfloor.reachedFoot ? "" : "   <-- NO FOOT LINE: the module did not reach its own end"}`);
  console.log(`  hygiene:   ${r.hygiene.pass} pass / ${r.hygiene.fail} fail`
    + `${r.hygiene.reachedFoot ? "" : "   <-- NO FOOT LINE: the module did not reach its own end"}`);

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
  results.push({ id: arm.id, verdict, restored, walkfloor: `${r.walkfloor.pass}/${r.walkfloor.fail}`,
                 hygiene: `${r.hygiene.pass}/${r.hygiene.fail}` });
}

console.log("--- SUMMARY ---");
for (const r of results)
  console.log(`  ${r.id.padEnd(14)} ${String(r.verdict).padEnd(16)} restore=${r.restored}`
    + `  walkfloor=${r.walkfloor}  hygiene=${r.hygiene}`);
const bad = results.filter((r) => r.verdict !== "AS DECLARED" || (r.restored !== "VERIFIED" && r.restored !== "n/a"));
console.log(bad.length
  ? `\n${bad.length} arm(s) NOT as declared or not restored — RECORD THEM, do not smooth them.`
  : `\nall ${results.length} arm(s) as declared, every restore verified.`);
process.exit(bad.length ? 1 : 0);
