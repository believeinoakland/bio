/* M0-51 — THE NEGATIVE CONTROLS FOR THE DRIVER CENSUS, ARMED AND RUN.
 *
 * `m051-driver-census.test.mjs` DECLARES these arms; this file arms them.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — `suggest.control.mjs` and `register.control.mjs`
 * set the precedent and this file follows their rules exactly:
 *   - each arm armed ALONE, every other defence held OPEN;
 *   - every arm DECLARES, BEFORE IT RUNS, what must fail AND what must not;
 *   - a BASELINE arm exists, because a run that fails everywhere cannot otherwise
 *     be told apart from a harness that breaks whatever it touches;
 *   - it REFUSES TO ARM unless its anchor matches EXACTLY ONCE — a patch that
 *     matched zero times is a FINDING, never a silent no-op;
 *   - every restore is verified by sha256 AND by byte comparison against a
 *     UNIQUELY NAMED per-arm pristine copy, under a byte floor, because two
 *     harnesses in this estate have reported a restore byte-identical OVER AN
 *     EMPTY FILE and were caught only by a printed digest of the empty string;
 *   - a missing tally is reported as -1, NEVER as 0.
 *
 * EVERY PATH IS DERIVED FROM THIS FILE'S OWN LOCATION (M0-10: a harness rooted at
 * a hardcoded absolute path wiped a shared ground).
 *
 * AND IT NEVER USES `git checkout --` TO UNDO AN ARM. That restores to HEAD, not
 * to what you had, and it exits 0 either way; it has silently discarded a
 * session's own uncommitted work in this estate twice. The restore here is a
 * `cp` back from a pristine copy, MEASURED.
 *
 * Run it:  node test/m051-driver-census.control.mjs [armId ...]     (default: all)
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { anchorTable } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const COVERAGE = join(PLANE, "scripts/coverage.mjs");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
/* A per-file floor. A "restore" proved equal over two empty files is the receipt
   this floor exists to refuse. */
const FLOOR = { [COVERAGE]: 100_000 };

const ARMS = [
  { id: "1", file: COVERAGE,
    declared: "restore the OLD NAMING TEST — hasDriver reads existsSync(test/<suite>.control.mjs) "
            + "again -> (A2) FAILS, because `zulu.control.mjs` drives `beta.test.mjs` under a name "
            + "the old matcher could never match. (A1) STAYS GREEN: the same-name path is exactly "
            + "what the old rule was, so `delta` and `alpha` keep their drivers and the arm that "
            + "anchors over-strictness is untouched.",
    find: "hasDriver: driversFor.has(file),",
    put: `hasDriver: existsSync(join(ROOT, "test", file.replace(/\\.test\\.mjs$/, ".control.mjs"))),`,
    mustFail: ["(A2)"], mustPass: ["(A1)", "(A3)", "(A4)", "(A5)", "(A6)", "(A7)", "(A8)"] },

  { id: "2", file: COVERAGE,
    declared: "READ THE DRIVER RAW instead of through `codeOnly` -> (A3), (A4) and (A7) FAIL. "
            + "`prose.control.mjs` MENTIONS `gamma.test.mjs` in a comment and is then credited with "
            + "driving it, and stops being NAMED as unreadable. This is D-277's defect pointing at "
            + "drivers, and it is the arm that decides whether the prose/code split is load-bearing "
            + "or decoration. (A5) stays GREEN: `mute.control.mjs` names nothing even read raw.",
    find: "codeOnly(src).match(SUITE_REF)",
    put: "src.match(SUITE_REF)",
    mustFail: ["(A3)", "(A4)", "(A7)"], mustPass: ["(A1)", "(A2)", "(A5)", "(A6)", "(A8)"] },

  { id: "3", file: COVERAGE,
    declared: "DROP THE UNREADABLE LIST, leaving the census to report only its figures -> (A4), "
            + "(A5) and (A7) FAIL BY NAME. A census that reports a FIGURE instead of a JUDGEMENT "
            + "hides precisely the drivers nobody can resolve, which is the acceptance this row "
            + "was written to refuse.",
    find: "if (unreadable.length) {",
    put: "if (false && unreadable.length) {",
    mustFail: ["(A4)", "(A5)", "(A7)"], mustPass: ["(A1)", "(A2)", "(A3)", "(A6)", "(A8)"] },

  { id: "4", file: COVERAGE,
    declared: "DROP THE NOT WALKED LIST -> (A6) and (A7) FAIL. This is the arm that matters most "
            + "for the row's own question: without that list, a driver RENAMED OUT of the walk and "
            + "one DELETED outright leave the identical absence, and `not where I looked` collapses "
            + "into `not found` — the two facts this item exists to separate.",
    find: "if (notWalked.length) {",
    put: "if (false && notWalked.length) {",
    mustFail: ["(A6)", "(A7)"], mustPass: ["(A1)", "(A2)", "(A3)", "(A4)", "(A5)", "(A8)"] },

  { id: "5", file: COVERAGE,
    declared: "DELETE THE LIMIT — remove the sentence in which the census admits it establishes "
            + "only that a driver EXISTS -> (A8) FAILS BY NAME. An instrument that quietly drops "
            + "its own caveat keeps printing the figure while the reader stops being told what the "
            + "figure is worth, and here the dropped caveat is the boundary with M0-42's `run:` key.",
    find: "IT ESTABLISHES THAT A DRIVER EXISTS, AND CANNOT ESTABLISH THAT IT RAN: a code",
    put: "IT IS A COMPLETE ACCOUNT OF THIS ESTATE'S CONTROLS: every driver below was",
    mustFail: ["(A8)"], mustPass: ["(A1)", "(A2)", "(A3)", "(A4)", "(A5)", "(A6)", "(A7)"] },

  { id: "6", file: COVERAGE,
    declared: "OVER-STRICTNESS — reverse the order the drivers are walked in, changing every "
            + "printed list's ORDER while changing no claim and no figure -> EVERY ARM STAYS "
            + "GREEN. A suite keyed to the order its subject happens to emit is a suite that will "
            + "fail an honest change, and a control that makes honest work expensive gets switched "
            + "off and then measures nothing.",
    find: `.filter((f) => f.endsWith(".control.mjs")).sort()`,
    put: `.filter((f) => f.endsWith(".control.mjs")).sort().reverse()`,
    mustFail: [], mustPass: ["(A1)", "(A2)", "(A3)", "(A4)", "(A5)", "(A6)", "(A7)", "(A8)"] },

  { id: "7", file: null,
    declared: "BASELINE — nothing armed, every arm GREEN. Without it a run of eight failures "
            + "cannot be told apart from eight passes, and a harness that breaks whatever it "
            + "touches reports six successful refutations.",
    mustFail: [], mustPass: ["(A1)", "(A2)", "(A3)", "(A4)", "(A5)", "(A6)", "(A7)", "(A8)"] },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.filter((a) => a.file).map((a) => ({ arm: a.id, file: a.file, find: a.find, put: a.put })));

function runSuite() {
  const r = spawnSync(process.execPath, ["test/m051-driver-census.test.mjs"],
    { cwd: PLANE, encoding: "utf8", timeout: 180_000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = out.match(/^m051-driver-census: (\d+) pass, (\d+) fail$/m);
  const failed = [...out.matchAll(/^FAIL: (\(A\d+\))/gm)].map((x) => x[1]);
  /* A MISSING TALLY IS -1 AND NEVER 0: a suite that died before its foot line has
     not "passed nothing", and reading it as zero is how a harness records
     "stayed GREEN" for a run that never finished. */
  if (!m) return { pass: -1, fail: -1, failed, out, tally: false };
  return { pass: +m[1], fail: +m[2], failed, out, tally: true };
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const selected = only.length ? ARMS.filter((a) => only.includes(a.id)) : ARMS;

let armsRun = 0, asDeclared = 0;
const surprises = [];

console.log(`M0-51 driver census — ${selected.length} arm(s), each armed ALONE.\n`
  + `SUBJECT: scripts/coverage.mjs · SUITE: test/m051-driver-census.test.mjs`);

for (const arm of selected) {
  const pristine = arm.file ? `${arm.file}.pristine.${arm.id}` : null;
  console.log(`\n=== ARM ${arm.id} ===\n    DECLARED: ${arm.declared}`);

  if (arm.file) {
    copyFileSync(arm.file, pristine);
    const before = readFileSync(arm.file, "utf8");
    const bytes = Buffer.byteLength(before);
    if (bytes < FLOOR[arm.file]) {
      console.log(`    REFUSED TO ARM: ${arm.file} is ${bytes} bytes, floor ${FLOOR[arm.file]}`);
      unlinkSync(pristine);
      continue;
    }
    /* REFUSE TO ARM unless the anchor occurs EXACTLY ONCE. A patch that matched
       zero times is a finding; a patch that matched twice perturbed a second
       variable, which is how a control produces a confident wrong refutation. */
    const hits = before.split(arm.find).length - 1;
    if (hits !== 1) {
      console.log(`    REFUSED TO ARM: anchor matched ${hits} time(s), need exactly 1`);
      unlinkSync(pristine); continue;
    }
    const after = before.replace(arm.find, arm.put);
    if (after === before) { console.log("    REFUSED TO ARM: edit was a no-op"); unlinkSync(pristine); continue; }
    writeFileSync(arm.file, after);
    console.log(`    ARMED: ${bytes} -> ${Buffer.byteLength(after)} bytes`);
  } else {
    console.log("    ARMED: nothing (baseline)");
  }

  armsRun++;
  const r = runSuite();
  console.log(`    RESULT: ${r.pass} pass, ${r.fail} fail`
    + `${r.tally ? "" : "  << NO TALLY — suite died before its foot line, reported as -1"}`
    + `${r.failed.length ? `  failing: ${r.failed.join(" ")}` : ""}`);

  /* RESTORE FIRST, so a judgement that throws cannot leave the tree armed. */
  if (arm.file) {
    copyFileSync(pristine, arm.file);
    const okSha = sha(arm.file) === sha(pristine);
    const okContent = readFileSync(arm.file, "utf8") === readFileSync(pristine, "utf8");
    const bytes = Buffer.byteLength(readFileSync(arm.file));
    const okFloor = bytes >= FLOOR[arm.file] && sha(arm.file) !== EMPTY_SHA;
    console.log(`    RESTORED: ${bytes} bytes · sha256 ${okSha ? "EQUAL" : "DIFFERENT"}`
      + ` · content ${okContent ? "EQUAL" : "DIFFERENT"} · floor ${okFloor ? "ok" : "BREACHED"}`);
    if (!okSha || !okContent || !okFloor) { console.log("    RESTORE FAILED — STOPPING"); process.exit(2); }
    unlinkSync(pristine);
  }

  const missing = arm.mustFail.filter((a) => !r.failed.includes(a));
  const wrongly = arm.mustPass.filter((a) => r.failed.includes(a));
  const ok = arm.mustFail.length === 0
    ? (r.tally && r.fail === 0 && r.pass > 0 && wrongly.length === 0)
    : (r.tally && missing.length === 0 && wrongly.length === 0);
  if (ok) { asDeclared++; console.log("    AS DECLARED"); }
  else {
    surprises.push(`${arm.id}: declared-fail not failing [${missing}] · declared-pass failing [${wrongly}] · tally ${r.pass}/${r.fail}`);
    console.log(`    *** NOT AS DECLARED *** missing=[${missing}] wrongly=[${wrongly}]`);
  }
}

console.log(`\n${armsRun} of ${selected.length} ARMED · ${asDeclared} of ${armsRun} AS DECLARED`);
if (surprises.length) { console.log("SURPRISES:"); for (const s of surprises) console.log(`  ${s}`); }
console.log(`\nTHE LIMIT, RESTATED SO NO READER TAKES THIS RUN FOR MORE THAN IT IS: these arms`);
console.log(`establish that the census SEES a driver and NAMES what it cannot see. They do NOT`);
console.log(`establish that any driver RAN. A code reference is not an execution.`);
process.exit(surprises.length ? 1 : 0);
