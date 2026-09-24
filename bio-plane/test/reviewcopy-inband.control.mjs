/* REC-148's NEGATIVE CONTROL DRIVER — three arms plus a baseline, re-runnable in one step:
 *
 *     node test/reviewcopy-inband.control.mjs        # every arm, in order
 *     node test/reviewcopy-inband.control.mjs a      # one arm
 *
 * `reviewcopy.control.mjs`'s shape and rules, kept for its reasons: NOT a `.test.mjs` (it edits real sources);
 * pristine copies INSIDE this worktree, uniquely named per arm; every restore verified by CONTENT and sha256
 * with the byte count floored; the suite's output to a FILE, never a pipe (D-282); each arm armed ALONE.
 * The declarations are in the suite's own `NEGATIVE CONTROL:` header, made before arming.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-reviewcopy-inband");          /* inside this worktree */
const INDEX = join(ROOT, "src", "index.mjs");
const INBAND = join(ROOT, "src", "inband.mjs");
const SUITE = join(DIR, "reviewcopy-inband.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, THROWING on an absent or ambiguous needle
   — an arm that silently edited nothing reports the subject as unbreakable. With
   `DRY` set it records the anchor and writes nothing (D-331's preflight). */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes arms-working from arms-broken",
              apply: () => {} },

  a: { files: [INDEX],
       label: "(a) THE ROW'S CONTROL: the review copy's hash re-taken by a SECOND hasher over a differently-"
            + "canonicalised body (no indent), at the review copy's own site",
       /* RE-ANCHORED 2026-09-24 at integration by c19-unionfix: CONDUCT #19 moved the review copy's answer into
          ONE function at c19-batch9 (REC-198 made it the answer shape for every read of a draft), so the quoted
          line lost six spaces of indent and this needle matched ZERO times — m025's A4 named it (the D-276
          class). The quote moves with its line; the arm and its declaration are unchanged. */
       apply: () => edit(INDEX,
         "      date: r.updated_at ?? null, author: r.updated_by ?? null, bar: bar ?? null });\n",
         "      date: r.updated_at ?? null, author: r.updated_by ?? null, bar: bar ?? null });\n"
         + "    quartet.hash.sha256 = await sha256Hex(JSON.stringify(served));\n") },

  b: { files: [INBAND],
       label: "(b) OVER-STRICTNESS: the floors count as declared only on a boolean `true`, never the word",
       apply: () => edit(INBAND,
         "(bar.declared === true || bar.declared === \"true\")",
         "bar.declared === true") },

  c: { files: [INBAND],
       label: "(c) THE FLOORS SWAPPED: capture read as connection and connection as capture",
       apply: () => edit(INBAND,
         "    capture, connection, declared,\n",
         "    capture: connection, connection: capture, declared,\n") },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("reviewcopy-inband.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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

  let tally = "(not run)";
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/reviewcopy-inband: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 130));
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: failed.length });
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
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} named failure(s))`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);

/* MEASURED: see the suite's NEGATIVE CONTROL header. */
