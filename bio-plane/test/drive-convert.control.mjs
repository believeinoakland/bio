/* CAP-10's NEGATIVE CONTROL DRIVER — four arms plus a baseline, re-runnable in one
 * step from `bio-plane/`:
 *
 *     node test/drive-convert.control.mjs            # every arm, in order
 *     node test/drive-convert.control.mjs letter     # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it
 * (`drive.control.mjs`'s rule, and its three paid-for rules, followed unchanged):
 *   1. PRISTINE COPIES LIVE INSIDE THIS WORKTREE, uniquely named per arm and file.
 *   2. EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, byte count printed and
 *      floored — never `git checkout --`, which restores to HEAD and has twice
 *      discarded a session's own uncommitted work.
 *   3. THE SUITE'S OUTPUT GOES TO A FILE, NEVER A PIPE (D-282).
 *
 * EACH ARM IS ARMED ALONE, and each asks one question:
 *   letter     the step emitted with a LETTER cap. Is it refused BY NAME (C-35.13),
 *              and does the capture then carry NO chain rather than a chain that
 *              silently lost its conversion?
 *   omit       the step never emitted. The chain reads as a direct capture of
 *              original bytes — does the suite fail BY NAME?
 *   sequence   `derivationCap`'s head-conversion rule disarmed, so an unmeasured
 *              conversion "neither raises nor lowers" like any sequence step. Does
 *              the doctrine block catch the Drive chain inheriting a layer letter?
 *   overstrict the step keyed on "any capture" rather than on the Drive recogniser.
 *              Do the pristine digest pins catch a non-Drive chain changing?
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-cap10");
const INDEX = join(ROOT, "src", "index.mjs");
const DRIVE = join(ROOT, "src", "drive.mjs");
const CHAIN = join(ROOT, "src", "textchain.mjs");
const SUITE = join(DIR, "drive-convert.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, and it THROWS when the needle is absent
   or ambiguous — an arm that silently edited nothing reports the subject as
   unbreakable, the one wrong answer a control can give. */
const edit = (file, needle, replacement) => {
  if (ANCHOR_DRY) return anchorPatch(file, needle, replacement);   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const GUARD = "if (driveCapture && Array.isArray(chain)) {";

const ARMS = {
  baseline: { files: [], label: "nothing armed — the row that makes every other row a measurement", apply: () => {} },
  letter: {
    files: [DRIVE],
    label: "the convert step emitted with a LETTER cap ('B') instead of null",
    apply: () => edit(DRIVE, "cap: DRIVE_CONVERT_CAP,", "cap: \"B\","),
  },
  omit: {
    files: [INDEX],
    label: "the convert step never emitted — the Drive chain reads as a direct capture's",
    apply: () => edit(INDEX, GUARD, "if (false && driveCapture && Array.isArray(chain)) {"),
  },
  sequence: {
    files: [CHAIN],
    label: "derivationCap's head-conversion rule disarmed — an unmeasured conversion neither raises nor lowers",
    apply: () => edit(CHAIN, "if (STEP_KINDS[step.step].unmeasured === \"undetermined\" && measured(step) == null",
                             "if (false && STEP_KINDS[step.step].unmeasured === \"undetermined\" && measured(step) == null"),
  },
  overstrict: {
    files: [INDEX],
    label: "the step keyed on ANY capture rather than on the Drive recogniser",
    apply: () => {
      edit(INDEX, GUARD, "if (Array.isArray(chain)) {");
      edit(INDEX, "convertedChain(driveConvertStep(driveCapture), chain)",
                  "convertedChain(driveConvertStep(driveCapture || { format: \"odt\" }), chain)");
    },
  },
};
anchorEach(ARMS, (a) => a.apply());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

mkdirSync(PEN, { recursive: true });
const results = [];
for (const name of order) {
  const arm = ARMS[name];
  const snaps = arm.files.map((f) => {
    const buf = readFileSync(f);
    if (buf.length < FLOOR) throw new Error(`refusing to snapshot a suspiciously small ${f}: ${buf.length} bytes`);
    const copy = join(PEN, `${name}--${f.split("/").pop()}.pristine`);
    writeFileSync(copy, buf);
    return { file: f, copy, bytes: buf.length, sha: sha(buf) };
  });
  console.log(`\n=== ARM ${name} ===\n${arm.label}`);
  for (const s of snaps) console.log(`  pristine ${s.file.split("/").pop()}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 16)}…`);
  let tally = "(not run)", failedCount = 0;
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement, not an error */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    /* A MISSING TALLY IS -1, NEVER 0: a suite that died before its foot must read
       differently from one that passed. */
    const m = /^(?:[\w.-]+: )?(\d+) pass, (\d+) fail$/m.exec(out);
    tally = m ? `${m[1]} pass, ${m[2]} fail` : "(-1: the suite produced NO TALLY — it died before its own foot)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 140));
    failedCount = m ? Number(m[2]) : -1;
    console.log(`  RESULT  ${tally}`);
    for (const f of failed.slice(0, 10)) console.log(`    FAILING  ${f}`);
    if (failed.length > 10) console.log(`    … and ${failed.length - 10} more named failure(s)`);
    if (!failed.length && name !== "baseline")
      console.log("    (NO NAMED FAILURE — a surprising green is a finding about the ARM; record it)");
    results.push({ arm: name, tally, failed: failedCount, named: failed.length });
  } finally {
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}
console.log("\n=== SUMMARY ===");
for (const r of results) console.log(`  ${r.arm.padEnd(10)} ${r.tally}   (${r.named} named failure(s))`);
const base = results.find((r) => r.arm === "baseline");
if (base && base.failed !== 0) console.log("\n  WARNING: THE BASELINE IS NOT GREEN. Nothing above is a measurement of an arm.");
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
