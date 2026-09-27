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
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): `projection()` moved to `src/retrieval/index.mjs` (retrieval R5);
   the store keeps the one reader `#noProjectConclusionOf` and calls it from its REGISTERED projection decoration
   (`retrieval.registerProjectionDecoration("legacy-store", …)`, retrieval REPORT 11), which the single-bundle arm
   applies. Arms (a) and (c) now edit that decoration's call; arm (b) edits retrieval's list arm. */
const RETRIEVAL = join(ROOT, "src", "retrieval", "index.mjs");
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

const CALL = `                    no_project_conclusion: type === "inquiry" ? this.#noProjectConclusionOf(row.bundle_id) : null };`;
/* The copy's call spelled out whole, not derived by a `.replace` of the reader's
   name: that name occurs at two call sites, and m025-arm-anchor-witness reads a
   `.replace(` literal as an anchor that must occur once in its subject. */
const CALL_COPY = `                    no_project_conclusion: type === "inquiry" ? this.#noProjectConclusionOfCopy(row.bundle_id) : null };`;
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
         edit(STORE, CALL, CALL_COPY);
       } },

  /* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): the list arm is retrieval's now, and the one reader is reachable
     from there only through the registered decorations (the store's `#noProjectConclusionOf` is private to it). The
     defect is the same: every list row carries `no_project_conclusion` through the one reader, here by applying the
     decorations to each list row. RE-DECLARED: it no longer adds a call site of the reader in store.mjs, so §4's
     exactly-THREE-call-sites arm is not among its must-fails (the suite's header records it). */
  b: { files: [RETRIEVAL],
       label: "(B) THE FIELD ON THE LIST FORM: every list row carries no_project_conclusion through the one reader",
       apply: () => {
         edit(RETRIEVAL,
           "...pageArgs, cap);\n    return {\n      bundles,",
           "...pageArgs, cap);\n"
           + "    /* NC ARM (b) */\n"
           + "    const decorate = (r) => Promise.all(this.#decorations.map((d) => { try { return Promise.resolve(d.fn(r, { viewer, nowMs }))"
           + ".catch(() => null); } catch { return null; } })).then((vs) => ({ ...r, no_project_conclusion: vs.reduce((a, v) =>"
           + " (v && v.no_project_conclusion !== undefined ? v.no_project_conclusion : a), null) }));\n"
           + "    const page = {\n      bundles,");
         edit(RETRIEVAL,
           "SELECT COUNT(*) AS n FROM bundles b WHERE ${base.join(\" AND \")}`, ...baseArgs).n,\n    };",
           "SELECT COUNT(*) AS n FROM bundles b WHERE ${base.join(\" AND \")}`, ...baseArgs).n,\n    };\n"
           + "    return Promise.all(page.bundles.map(decorate)).then((bundles) => ({ ...page, bundles }));");
       } },

  c: { files: [STORE],
       label: "(C) OVER-STRICTNESS: the single-bundle arm reaches the ONE reader through a local `npc` and the "
            + "argument spelled `bundleId` — correct work in a spelling the pin did not anticipate",
       apply: () => {
         /* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): in the store's registered decoration, where the call now is;
            `bundleId` is spelled as a local, since the decoration receives the row. */
         edit(STORE, CALL, "                    no_project_conclusion: npc };");
         edit(STORE, "      const type = normalizeType(row.object_type);\n",
                     "      const type = normalizeType(row.object_type);\n"
                   + "      const bundleId = row.bundle_id;\n"
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
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests) AND RE-RUN (worktree bio-ctl1), preflight 6 anchors live, every
   restore sha256 MATCH / content IDENTICAL:
     baseline  26 pass, 0 fail
     a         23 pass, 3 fail   as declared — the three ONE-READER arms
     b         23 pass, 3 fail   as RE-DECLARED — both list-form arms and NEVER-ON-THE-LIST-FORM; the call-site count
                                 no longer moves (the list reaches the reader through the decorations, no new call site)
     c         26 pass, 0 fail   as declared */
