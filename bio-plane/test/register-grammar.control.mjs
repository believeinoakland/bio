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
/* M0-42's three further subjects. ADMISSION and AFFORD are REAL SUITES whose
   declarations the arms edit; COVERAGE is the site the limit must be stated at. */
const ADMISSION = join(PLANE, "test/admission-gate.test.mjs");
const AFFORD = join(PLANE, "test/affordances.test.mjs");
const COVERAGE = join(PLANE, "scripts/coverage.mjs");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/* A per-file floor. A "restore" proved equal over two empty files is the receipt
   this guard exists for. */
/* [VERIF] 40_000 -> 16_000 on 2026-09-19 (BOB #16): VERIFICATION.md was cut to the reading budget (24,309 B) with
   the D-263 block kept verbatim; the floor guards a restore over an EMPTY file, and 16 KB still refuses that. */
const FLOOR = { [REGISTER]: 8_000, [VERIF]: 16_000,
                [ADMISSION]: 10_000, [AFFORD]: 40_000, [COVERAGE]: 90_000 };

/* ------------------------------------------------------------------ the arms */

const ARMS = [
  { id: "0-BASELINE", file: null,
    declared: "nothing armed -> the suite is GREEN and the tally is non-zero. Without "
            + "this row, a run of seven nulls is indistinguishable from seven passes.",
    mustFail: [], mustPass: ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3c", "B4", "B6",
                             "C1", "C2", "C3", "C4a", "C4b", "C5a", "C5b", "C5c", "C5d", "C5e", "C6", "C7a", "C7b"] },

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
     the subject, and that is the commonest result a control produces here.

     >>> AND THE DECLARATION WENT WRONG A SECOND TIME, THE OTHER WAY, MEASURED
     2026-09-16 BY M0-42 AND CORRECTED ABOVE RATHER THAN SMOOTHED. **A5 was
     declared to FAIL under this arm and it now STAYS GREEN.** Nothing about the
     subject changed; the CORPUS GREW. A5's non-vacuity floor is `readable > 100`,
     and with transitions zeroed the enumerated half alone now classifies 124 of
     198 declarations (measured, not reasoned about: 197 classified today, 124
     surviving with transitions zeroed, 172 surviving with enumerations zeroed).
     When D-263 ran this arm on 2026-08-09 the corpus was ~146 and that same floor
     bit; at 198 it does not.

     **A5 IS DELIBERATELY NOT RETUNED TO MAKE THIS ARM FIRE AGAIN**, and the reason
     is a rule rather than a preference: A5's job is to show the corpus is not
     empty, never to be sensitive to the transition counter dying — that is A1,
     A3 and A4's job, and all three still fall. Its appearance in this arm's
     declaration was always INCIDENTAL, added in 2026-08-09's own correction
     because the floor happened to bite that day. Moving an assertion's threshold
     so that a control declaration comes true again is tuning the subject to fit
     the control, which is the wrong way round and would leave a floor chosen by a
     driver rather than by what A5 is for.

     **WHAT IS WORTH CARRYING OUT OF IT IS THE CLASS, NOT THE ARM.** `readable >
     100` against a live 197 is a SLACK FLOOR — a hand-carried number nobody
     re-measured while the thing it bounds grew by a third — which is this
     project's most-repeated finding sitting inside the suite built to catch
     figures that cannot be falsified. It is NAMED here and left for whoever owns
     A5's floor to move, because tightening it is a decision about what A5 asserts.
     **And note how it was found: not by anyone reading the file, but by RE-RUNNING
     a control whose declaration had quietly stopped being true. A declaration
     nobody re-runs decays in exactly this direction — toward green — and says
     nothing while it does. That is M0-42's own subject arriving inside M0-42's own
     harness, which is why it is recorded at this length.** */
  { id: "1-NO-TRANSITIONS", file: REGISTER,
    declared: "countTransitions always 0 -> A1, A3 and A4 FAIL — every arm whose "
            + "count comes from an arrow, which after the first run turned out to "
            + "include A4 (one ordinal, so enumerations refuse it). A2 stays GREEN, "
            + "because an enumerated declaration never depended on arrows. A5 ALSO "
            + "STAYS GREEN, and that is a CORRECTION dated 2026-09-16 rather than the "
            + "original declaration: A5 used to fall here and no longer does.",
    find: "export const countTransitions = (text) => (text.match(ARM) || []).length;",
    put:  "export const countTransitions = (text) => 0 * (text.match(ARM) || []).length;",
    /* A5 MOVED FROM mustFail TO mustPass ON 2026-09-16 (M0-42), with the reason in
       the block above: it no longer falls here because the corpus grew, not because
       anything was exempted. The judgement array and the prose declaration are two
       statements of one claim, and a control that corrects only the prose has left
       the half the harness actually reads still wrong — which is how this file read
       NOT AS DECLARED on the run after its own correction. */
    mustFail: ["A1", "A3", "A4"], mustPass: ["A2", "A5", "B1", "B2"] },

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

  /* ==================== M0-42's FOUR ARMS — RUN vs DECLARED ====================
     Arm 7 is THE LOAD-BEARING ONE and is this item pointed inward: a declaration
     that states an arm and records no run must be VISIBLE as such without anyone
     reading the worker's prose. Arm 8 decides whether the mechanism is USABLE.
     Arm 9 proves the stated limit is REAL rather than modest. Arm 10 keeps the
     limit itself from being quietly deleted by a later editor. */

  { id: "7-STRIP-THE-RUN-TOKEN", file: ADMISSION,
    declared: "THE ARM THIS ITEM EXISTS FOR. Take a suite whose declaration RECORDS "
            + "its run and remove the record, leaving the arms exactly as they were "
            + "-> C5c FAILS BY NAME. That is a control DECLARED and not RUN becoming "
            + "visible in the register's own output, which before this item it was "
            + "not: every declaration read identically whether its arms had been run "
            + "or only imagined.",
    find: "(run 2026-08-09, REC-79)",
    put:  "(planned, REC-79)",
    mustFail: ["C5c"], mustPass: ["C1", "C2", "C3", "C4a", "C4b", "C6", "C7a", "C7b", "A1", "B1"] },

  { id: "8-OVER-STRICTNESS", file: ADMISSION,
    declared: "THE ARM THAT DECIDES WHETHER THIS IS USABLE. Rewrite the same run "
            + "record in a DIFFERENT spelling the estate also writes, keeping the "
            + "claim identical -> EVERY arm stays GREEN. A worker who genuinely ran "
            + "the control must never be told they did not because they reached for "
            + "another word; a register that makes honest work expensive gets "
            + "bypassed and then measures nothing. The vocabulary was FITTED to what "
            + "workers had already written (164 of 198 declarations on 2026-09-16), "
            + "not imposed on them.",
    find: "(run 2026-08-09, REC-79)",
    put:  "(DRIVEN 2026-08-09, REC-79)",
    mustFail: [], mustPass: ["C1", "C2", "C3", "C4a", "C4b", "C5a", "C5b", "C5c", "C5d", "C6", "C7a", "C7b"] },

  { id: "9-FORGE-A-TOKEN", file: AFFORD,
    declared: "**THIS ARM IS DECLARED TO SUCCEED AT FORGING, AND ITS RED IS THE "
            + "FINDING RATHER THAN A DEFECT.** Write a run token into a declaration "
            + "that records no run, inventing the date and the result outright and "
            + "running nothing -> C5d and C5e FAIL, because the register now grades "
            + "that suite RUN. Nothing detects it and nothing could: any artifact a "
            + "worker can write, a worker can write without running anything. The arm "
            + "exists so the limit printed beside the figure is DRIVEN rather than "
            + "merely conceded in prose — a modest-sounding caveat nobody tested is "
            + "how an instrument ends up believed past its reach.",
    find: "Recorded as run below in the suite header.",
    put:  "Recorded as run below in the suite header. RUN 2026-09-16 by nobody, 5 of 5 as declared, in a session that never existed.",
    mustFail: ["C5d", "C5e"], mustPass: ["C1", "C2", "C3", "C5a", "C5c", "C6", "C7a", "C7b"] },

  { id: "10-DELETE-THE-LIMIT", file: COVERAGE,
    declared: "Remove the sentence in which the register admits it cannot prove a run "
            + "-> C7b FAILS BY NAME. The accepts-when is that the limit is stated AT "
            + "THE SITE and not only in a queue row nobody reads beside the output, "
            + "so the statement is pinned the way any other load-bearing claim is. An "
            + "instrument that quietly drops its own caveat is worse than one that "
            + "never had it: the figure keeps printing and the reader stops being "
            + "told what it is worth.",
    find: "would be a worse instrument than this one",
    put:  "is the instrument this project needs",
    mustFail: ["C7b"], mustPass: ["C1", "C2", "C3", "C5a", "C5c", "C5d", "C6", "C7a"] },
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
