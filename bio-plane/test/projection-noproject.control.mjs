/* REC-144's NEGATIVE CONTROL DRIVER, re-runnable in one step from `bio-plane/`:
 *
 *     node test/projection-noproject.control.mjs         # every arm, in order
 *     node test/projection-noproject.control.mjs a       # one arm
 *
 * Built on `conclude-project.control.mjs`'s driver (REC-124/REC-136), whose rules
 * it keeps.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it.
 *
 * Pristine copies live INSIDE THIS WORKTREE and are uniquely named per arm; every
 * restore is verified by CONTENT and by sha256 with the byte count floored; the
 * suite's output is captured to a FILE, never a pipe (D-282). Each arm is armed
 * ALONE.
 *
 * THE DECLARATIONS ARE IN THE SUITE'S OWN `NEGATIVE CONTROL:` HEADER, made before
 * arming. The MEASURED figures are recorded at the foot of this file.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-projection-noproject");      /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "projection-noproject.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, THROWING on an absent or ambiguous needle
   — an arm that silently edited nothing reports the subject as unbreakable. With
   `DRY` set it records the anchor and writes nothing (D-331's preflight). */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "latin1");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, () => replacement), "latin1");
};

const CALL = `        no_project_conclusion: type === "inquiry" ? this.#noProjectConclusionOf(row.bundle_id) : null,`;
const HEAD = "  #noProjectConclusionOf(inquiryId) {\n";
const BRANCH = `"the inquiry carries no such reading"`;

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes three-arms-working from three-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(A) A SECOND READER, COPIED: projection() calls #noProjectConclusionOfCopy, the reader verbatim "
            + "but for ONE branch no fixture reaches (the named-reading-is-absent sentence)",
       apply: () => {
         if (DRY) { DRY.push({ file: STORE, needle: HEAD }, { file: STORE, needle: CALL }); return; }
         const src = readFileSync(STORE, "latin1");
         const at = src.indexOf(HEAD);
         const end = src.indexOf("\n  }\n", at);
         if (at < 0 || end < 0 || src.indexOf(HEAD, at + 1) >= 0) throw new Error("ARM a: the reader's head is not unique");
         const reader = src.slice(at, end + "\n  }\n".length);
         if (reader.split(BRANCH).length !== 2) throw new Error("ARM a: the branch to vary is not in the reader exactly once");
         const copy = reader.replace("#noProjectConclusionOf(inquiryId)", "#noProjectConclusionOfCopy(inquiryId)")
                            .replace(BRANCH, `"no reading of that name is carried by this inquiry"`);
         writeFileSync(STORE, src.slice(0, end + "\n  }\n".length) + "\n" + copy + src.slice(end + "\n  }\n".length), "latin1");
         edit(STORE, CALL, CALL.replace("this.#noProjectConclusionOf(", "this.#noProjectConclusionOfCopy("));
       } },

  b: { files: [STORE],
       label: "(B) THE FIELD ON THE LIST FORM: every list row carries no_project_conclusion through the one reader",
       apply: () => edit(STORE,
         "      ...pageArgs, cap);\n    return {\n      bundles,",
         "      ...pageArgs, cap).map((r) => ({ ...r, no_project_conclusion: normalizeType(r.object_type) === \"inquiry\""
         + " ? this.#noProjectConclusionOf(r.bundle_id) : null }));\n    return {\n      bundles,") },

  c: { files: [STORE],
       label: "(C) OVER-STRICTNESS: the single-bundle arm reaches the ONE reader through a local `npc` and the "
            + "argument spelled `bundleId` — correct work in a spelling the pin did not anticipate",
       apply: () => {
         edit(STORE, CALL, "        no_project_conclusion: npc,");
         edit(STORE, "      const type = normalizeType(row.object_type);\n",
                     "      const type = normalizeType(row.object_type);\n"
                   + "      const npc = type === \"inquiry\"\n        ? this.#noProjectConclusionOf(bundleId) : null;\n");
       } },
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
preflight("projection-noproject.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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
    for (const s of snaps) if (sha(readFileSync(s.file)) === s.sha) throw new Error(`ARM ${name} DID NOT ARM: ${s.file} unchanged`);
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/projection-noproject: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
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

/* MEASURED 2026-09-19, from this driver's own printed SUMMARY (worktree
   agent-af0ecccecaa170e90), every restore sha256 MATCH / content IDENTICAL:
     baseline  projection-noproject: 26 pass, 0 fail
     a         projection-noproject: 23 pass, 3 fail   as declared — the three ONE-READER arms; byte-identity held
     b         projection-noproject: 22 pass, 4 fail   as declared
     c         projection-noproject: 26 pass, 0 fail   as declared — over-strictness holds
   The declarations are in the suite's own NEGATIVE CONTROL header. */
