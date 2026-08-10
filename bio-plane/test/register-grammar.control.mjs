/* THE NEGATIVE CONTROL DRIVER for test/register-grammar.test.mjs (D-263).
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs and the
 * battery must not discover it. PL-3/PL-4/PL-11/REC-73/REC-78/VF-5's precedent.
 *
 * Run: `node test/register-grammar.control.mjs` from `bio-plane/`.
 *
 * EVERY ARM IS DECLARED BEFORE IT IS ARMED (the `declared` field below), armed
 * ALONE with the others held open, and REFUSES TO ARM when its anchor does not
 * occur exactly once — an arm that did not arm is a finding, not a pass, and
 * this project has shipped patches that matched zero times and read green.
 * Restores are verified by sha256 AND by CONTENT against per-arm uniquely-named
 * pristine copies, with the byte count printed and a floor guarded, because two
 * harnesses here once reported a restore byte-identical OVER AN EMPTY MANIFEST.
 * A run that produces no tally is reported as -1, never 0: a TypeError inside an
 * assertion goes through no assertion at all and ends the module with the count
 * reading clean.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");

const REGISTER = join(PLANE, "scripts/control-register.mjs");
const VERIF = join(REPO, "docs/development/VERIFICATION.md");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/* A per-file floor. A "restore" proved equal over two empty files is the receipt
   this guard exists for. */
const FLOOR = { [REGISTER]: 8_000, [VERIF]: 40_000 };

/* ------------------------------------------------------------------ the arms */

const ARMS = [
  { id: "0-BASELINE", file: null,
    declared: "nothing armed -> the suite is GREEN and the tally is non-zero. Without "
            + "this row, a run of seven nulls is indistinguishable from seven passes.",
    mustFail: [], mustPass: ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3c", "B4", "B6"] },

  /* DECLARATION CORRECTED 2026-08-09 AFTER ITS FIRST RUN, and the correction is
     the finding rather than a tidy-up. The first draft declared A4 and A5 to stay
     GREEN under this arm. BOTH FAILED, and the code was right both times:
       - A4's fixture states ONE ordinal, so `countEnumerations` refuses it (it
         requires >= 2 distinct tokens). Its expected count of 1 comes entirely
         from the ARROW. Kill transitions and A4 must fail — it is an arrow arm
         wearing an over-strictness label, which the first draft misread.
       - A5 counts suites with a COUNTABLE declaration. Most of the estate marks
         its arms with arrows, so zeroing transitions collapses the corpus.
     Recorded here rather than smoothed: the arm found my declaration wrong, not
     the subject, and that is the commonest result a control produces here. */
  { id: "1-NO-TRANSITIONS", file: REGISTER,
    declared: "countTransitions always 0 -> A1, A3, A4 and A5 FAIL — every arm whose "
            + "count comes from an arrow, which after the first run turned out to "
            + "include A4 (one ordinal, so enumerations refuse it) and A5 (the real "
            + "corpus marks its arms with arrows). A2 stays GREEN, because an "
            + "enumerated declaration never depended on arrows.",
    find: "export const countTransitions = (text) => (text.match(ARM) || []).length;",
    put:  "export const countTransitions = (text) => 0 * (text.match(ARM) || []).length;",
    mustFail: ["A1", "A3", "A4", "A5"], mustPass: ["A2", "B1", "B2"] },

  { id: "2-NO-ENUMERATIONS", file: REGISTER,
    declared: "countEnumerations always 0 -> A2 FAILS (3 -> null, the UNCLASSIFIED "
            + "path, since neither marking is then found); A1 stays GREEN.",
    find: "  return tokens.size;",
    put:  "  return 0 && tokens.size;",
    mustFail: ["A2", "A3"], mustPass: ["A1", "A4"] },

  { id: "3-DROP-THE-BLOCK", file: VERIF,
    declared: "THE ARM THIS SUITE EXISTS FOR. Delete the whole D-263 PROVENANCE span, "
            + "exactly as merge 0ca7640 dropped REC-68's sentence -> B1 FAILS BY NAME "
            + "and the block-scoped arms go with it. This is the drop failing loudly "
            + "instead of going quiet, which is the entire point of the pin.",
    re: /<!-- D-263 PROVENANCE[\s\S]*?END D-263 PROVENANCE[\s\S]*?-->\n/,
    put: "",
    mustFail: ["B1", "B2", "B3c", "B6"], mustPass: ["A1", "A2", "A3", "A4"] },

  { id: "4-FALSIFY-THE-HISTORY", file: VERIF,
    declared: "change one numeral in the recovered history (482 -> 483) -> B3c FAILS, "
            + "because the receipts are compared against the REC-68 branch blob git "
            + "still holds and never against a copy kept in the suite. A hand copy "
            + "agrees for free; this is what stops a paraphrase passing.",
    /* ANCHOR WIDENED after the guard REFUSED TO ARM on the first run: the bare
       string `471 -> 482` occurs TWICE in the block — once as an illustration of
       the transition grammar, once in the history — and a patch that matched it
       would have edited whichever came first. That is WORKER.md's "anchor
       occurred twice" receipt happening here, and the refusal is the guard
       working. Both occurrences are kept in the prose; the ARM is what narrowed. */
    find: "**471 -> 482 on 2026-08-08 by REC-68**",
    put:  "**471 -> 483 on 2026-08-08 by REC-68**",
    mustFail: ["B3c"], mustPass: ["B1", "B4", "A1"] },

  { id: "5-RESTORE-THE-PERISHABLE-CLAIM", file: VERIF,
    declared: "put REC-68's present-tense opening back into the block -> B4 FAILS. "
            + "This is the D-263 lesson itself: restoring the sentence VERBATIM would "
            + "have reintroduced a current-figure claim that has since gone false, "
            + "which is worse than the gap it filled.",
    find: "**THE HISTORY, because it is the receipt",
    put:  "THE CURRENT PRINTED FIGURE IS `482 arms`. **THE HISTORY, because it is the receipt",
    mustFail: ["B4"], mustPass: ["B1", "B2", "B3c", "A1"] },

  { id: "6-OVER-STRICTNESS", file: VERIF,
    declared: "REWORD the block in a spelling the suite did not anticipate while "
            + "keeping every claim and every numeral -> EVERY arm stays GREEN. Correct "
            + "work in an unanticipated spelling must pass, or the pin is a style "
            + "guide pretending to be a check.",
    find: "so this is a\nlive property and not a curiosity.",
    put:  "so the property is live in\nthe estate rather than merely available to it.",
    mustFail: [], mustPass: ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3c", "B4", "B6"] },
];

/* --------------------------------------------------------------- the driver */

/* Runs the suite and returns { pass, fail, failed[] }. A run that produced NO
   tally line reports -1 for both, never 0. */
function runSuite() {
  const r = spawnSync(process.execPath, ["test/register-grammar.test.mjs"],
    { cwd: PLANE, encoding: "utf8", timeout: 120_000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = out.match(/^register-grammar: (\d+) pass, (\d+) fail$/m);
  const failed = [...out.matchAll(/^FAIL: (\S+)/gm)].map((x) => x[1]);
  if (!m) return { pass: -1, fail: -1, failed, out, tally: false };
  return { pass: +m[1], fail: +m[2], failed, out, tally: true };
}

let armsRun = 0, asDeclared = 0;
const surprises = [];

for (const arm of ARMS) {
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

    /* REFUSE TO ARM unless the anchor occurs EXACTLY once. */
    let after;
    if (arm.re) {
      const hits = before.match(new RegExp(arm.re.source, "g"))?.length || 0;
      if (hits !== 1) { console.log(`    REFUSED TO ARM: regex matched ${hits} times, need 1`); unlinkSync(pristine); continue; }
      after = before.replace(arm.re, arm.put);
    } else {
      const hits = before.split(arm.find).length - 1;
      if (hits !== 1) { console.log(`    REFUSED TO ARM: anchor matched ${hits} times, need 1`); unlinkSync(pristine); continue; }
      after = before.replace(arm.find, arm.put);
    }
    if (after === before) { console.log("    REFUSED TO ARM: edit was a no-op"); unlinkSync(pristine); continue; }
    writeFileSync(arm.file, after);
    console.log(`    ARMED: ${arm.file.replace(REPO, "")} ${bytes} -> ${Buffer.byteLength(after)} bytes`);
  } else {
    console.log("    ARMED: nothing (baseline)");
  }

  armsRun++;
  const r = runSuite();
  console.log(`    RESULT: ${r.pass} pass, ${r.fail} fail`
    + `${r.tally ? "" : "  << NO TALLY — suite died before its foot, reported as -1"}`
    + `${r.failed.length ? `  failing: ${r.failed.join(" ")}` : ""}`);

  /* Restore FIRST, so a judgement that throws cannot leave the tree armed. */
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

  /* JUDGE against the declaration. */
  const missing = arm.mustFail.filter((a) => !r.failed.some((f) => f.startsWith(a)));
  const wrongly = arm.mustPass.filter((a) => r.failed.some((f) => f.startsWith(a)));
  const green = arm.mustFail.length === 0 && r.fail === 0;
  const ok = arm.mustFail.length === 0 ? (green && r.pass > 0)
    : (missing.length === 0 && wrongly.length === 0);
  if (ok) { asDeclared++; console.log("    AS DECLARED"); }
  else {
    surprises.push(`${arm.id}: declared-fail not failing [${missing}] · declared-pass failing [${wrongly}] · tally ${r.pass}/${r.fail}`);
    console.log(`    *** NOT AS DECLARED *** missing=[${missing}] wrongly=[${wrongly}]`);
  }
}

/* No stray pristine copies left behind. */
for (const arm of ARMS)
  if (arm.file && existsSync(`${arm.file}.pristine.${arm.id}`))
    console.log(`    WARNING: leftover pristine copy for ${arm.id}`);

console.log(`\nregister-grammar.control: ${armsRun} of ${ARMS.length} arm(s) ARMED AND RUN, `
  + `${asDeclared} as declared.`);
if (surprises.length) { console.log("SURPRISES (recorded, not smoothed):"); for (const s of surprises) console.log(`  - ${s}`); }
if (armsRun !== ARMS.length) console.log("AN ARM THAT DID NOT ARM IS A FINDING — see the REFUSED lines above.");
process.exit(armsRun === ARMS.length && asDeclared === ARMS.length ? 0 : 1);
