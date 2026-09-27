#!/usr/bin/env node
/* nc-cpdf19.mjs — the NEGATIVE CONTROL for `reextract.test.mjs` (CPDF-19 / D-319).
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs, and the battery
 * must not discover it (PL-3's, REC-73's and nc-sk7's precedent).
 *
 *   node test/nc-cpdf19.mjs            # every arm, in order
 *   node test/nc-cpdf19.mjs staling    # one arm (plus the baseline)
 *
 * DISCIPLINE, each line a receipt from this repository:
 *   - every arm is armed ALONE; the others are held open.
 *   - a patch must match EXACTLY ONCE or the arm is reported NOT ARMED and nothing is
 *     run — an arm that did not arm is a finding, never a pass.
 *   - the restore is `copyFileSync` from a UNIQUELY-NAMED per-arm pristine copy INSIDE
 *     THIS WORKTREE, verified by sha256 AND by byte comparison, with the byte count
 *     printed and floored. Never `git checkout --`, which restores to HEAD and has twice
 *     discarded a session's own uncommitted work.
 *   - the result is read from the suite's OWN foot line; a run with no foot is -1/-1.
 *   - what MUST fail and what MUST NOT are declared below, before arming, by label.
 *
 * RESULTS — RUN 2026-09-18 by CPDF-19's worker, worktree `agent-a186b6b601ae91372`, on the
 * tree this suite landed on. (Filled in from the run's own printout; see the report line
 * at the foot of a run.)
 *   8 arms, 0 NOT AS DECLARED — baseline 63/0 · staling 60/3 (the three stale arms, and only
 *   they) · flagignored 56/7 (both pre-item digests, the no-key and engine-not-called arms, and
 *   three section-2 arms that depend on the flag being read — the malformed-flag refusal, the
 *   agent's plain read, and the no-engine-call count, which the always-on seam now spends) ·
 *   nomember 61/2 (the C-51.4 arm and its check id) · actor 62/1 (the member-as-actor arm) · cal
 *   61/2 (both D-417 arms) · candidate 60/3 (the section-5 AFTER arm and both section-8 arms) ·
 *   overstrict 61/2 (exactly the two digest arms; every re-read arm green). Every restore
 *   byte-identical by sha256 AND by byte comparison (index.mjs 602,332 B sha256 3ff77136…, store.mjs 2,349,559 B sha256 a0cc3eba…, the final tree; re-run after the last source edit).
 *   FIRST-RUN FINDINGS ABOUT THE SUITE, recorded rather than smoothed: section 2's window first
 *   counted its OWN acquire of the never-filed scan (an engine call and a document-level
 *   observation) against the refusals, and section 5 first expected promote's writer to write
 *   one row beside the extraction row when it writes two (the index's derive row AND REC-95's
 *   meaning-level reader-run row) — both corrected in the suite, neither in the subject.
 * RE-ANCHORED 2026-09-27 (T5-12, legacy-tests) AND RE-RUN (worktree bio-ctl1, legacy-index's stamps merged): every arm
 *   re-anchored in extraction or content (see the arms). 8 arms, 0 NOT AS DECLARED — baseline 65/0 · staling 62/3 (the
 *   three stale arms) · flagignored 58/7 (the same seven) · nomember 63/2 · actor 63/2 (the member-as-actor arm, and the
 *   `reextracted.by` arm beside it: the stamp is also the reading's `by` now) · cal 63/2 · candidate 62/3 · overstrict
 *   63/2. Every restore byte-identical by sha256 AND byte comparison.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOLD = controlPen("cpdf19");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const INDEX = join(ROOT, "src/index.mjs");
const STORE = join(ROOT, "src/store.mjs");
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests): the re-read (`op=pdfstructure&ocr=1`) moved out of `index.mjs` and
   `store.mjs` into extraction (`src/extraction/index.mjs` `pdfStructure` and `extractionOps`, R31–R35; tier 3 in
   `src/extraction/pipeline.mjs`), and the content stale mark is content's listener on extraction's writes
   (`src/content/index.mjs`, content R22 / extraction R24). Every arm below arms the same break where it now lives. */
const EXTRACTION = join(ROOT, "src/extraction/index.mjs");
const PIPELINE = join(ROOT, "src/extraction/pipeline.mjs");
const CONTENT = join(ROOT, "src/content/index.mjs");

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ["the re-read answers 200", "BYTE-IDENTICAL to the pre-item answer (digest)"] },
  staling: {
    patches: [[CONTENT,
      "    c.extraction.onReading(\"content\", (e) => ({ staled: c.markStale(e.captureSha, e.chainAfter, { unitsBefore: e.unitsBefore ?? null }) }));\n",
      "    c.extraction.onReading(\"content\", (e) => ({ staled: 0 }));\n"]],
    mustFail: ["EXACTLY ONE content row went stale", "that row is MARKED stale", "and the stale mark stands"],
    mustPass: ["BYTE-IDENTICAL to the pre-item answer (digest)", "it REACHED TIER 3"],
  },
  flagignored: {
    patches: [[EXTRACTION, "    const ocrAsked = ocr !== null && ocr !== undefined;\n", "    const ocrAsked = true;\n"],
              [EXTRACTION, "      if (ocr !== \"1\")\n", "      if (false)\n"]],
    mustFail: ["the plain read of the scan is BYTE-IDENTICAL", "the plain read of the text-layer document is BYTE-IDENTICAL",
               "the OCR member was NOT called by either plain read", "and it carries no re-extraction key at all"],
    mustPass: ["it REACHED TIER 3"],
  },
  nomember: {
    patches: [[EXTRACTION, "      if (!e.OCR_WORKER)\n        return { status: 501, body: { ok: false, reason: \"REEXTRACT_NO_OCR_MEMBER\"",
                      "      if (false)\n        return { status: 501, body: { ok: false, reason: \"REEXTRACT_NO_OCR_MEMBER\""]],
    mustFail: ["NO OCR MEMBER BOUND: refused by name"],
    mustPass: ["it REACHED TIER 3", "BYTE-IDENTICAL to the pre-item answer (digest)"],
  },
  actor: {
    /* the author is the control plane's stamp, handed to `pdfStructure` by extraction's route. */
    patches: [[EXTRACTION, "      viewer: q(\"viewer\"), author: q(\"author\"), storeName: q(\"store\") || \"bio\", env }),\n",
                           "      viewer: q(\"viewer\"), author: null, storeName: q(\"store\") || \"bio\", env }),\n"]],
    mustFail: ["the latest content-level row is the member's"],
    mustPass: ["it REACHED TIER 3", "EXACTLY ONE content row went stale"],
  },
  cal: {
    /* D-417 reverted: the calibration join addresses the DO by query again. RE-ANCHORED 2026-09-27 (T5-12): the join
       is in-process now (extraction's `#liveCalibration` asks calibration's `liveCalibration`, R10), so the break is
       the one D-417's defect had: the join finds no live calibration. */
    patches: [[EXTRACTION, "    try { return await c.liveCalibration(q); } catch { return null; }\n",
                           "    try { return null; } catch { return null; }\n"]],
    mustFail: ["its ocr step NAMES the calibration", "and the reading stamps it too"],
    mustPass: ["it REACHED TIER 3"],
  },
  candidate: {
    /* D-418 reverted: the flag decided by the note's truthiness, exactly the pre-fix rule. */
    /* RE-ANCHORED 2026-09-27 (T5-12): tier 3's rule, in the pipeline, now counts the seeded pages too (R35, D-616). */
    patches: [[PIPELINE, "  const stillWanting = wanted && (!(filled.length + seeded.length) || unanswered.length > 0);\n",
                         "  const stillWanting = !!ocrNote;\n"]],
    mustFail: ["AFTER: the capture is no longer a tier-3 candidate", "and it is NOT flagged as still wanting OCR",
               "so its content-level row is PRESENT"],
    mustPass: ["it REACHED TIER 3", "NO OCR MEMBER BOUND: refused by name"],
  },
  overstrict: {
    patches: [[EXTRACTION, "    structure.tier = structureTier;\n    /*__REC98_TIER2_WIRE_STRUCTURE_END__*/\n",
                           "    structure.tier = structureTier; structure.nc_probe = 1;\n    /*__REC98_TIER2_WIRE_STRUCTURE_END__*/\n"]],
    mustFail: ["the plain read of the scan is BYTE-IDENTICAL", "the plain read of the text-layer document is BYTE-IDENTICAL"],
    mustPass: ["it REACHED TIER 3", "EXACTLY ONE content row went stale", "NO OCR MEMBER BOUND: refused by name",
               "the latest content-level row is the member's"],
  },
};

function runSuite() {
  const r = spawnSync(process.execPath, ["test/reextract.test.mjs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
  const out = (r.stdout || "") + (r.stderr || "");
  const foot = out.match(/reextract: (\d+) passed, (\d+) failed\s*$/m);
  const fails = [...out.matchAll(/^\s+FAIL\s+(.*)$/gm)].map((m) => m[1]);
  const passes = [...out.matchAll(/^\s+PASS\s+(.*)$/gm)].map((m) => m[1]);
  return { pass: foot ? +foot[1] : -1, fail: foot ? +foot[2] : -1, fails, passes,
           foot: !!foot && !/SUITE ENDED BEFORE ITS OWN FOOT/.test(out), exit: r.status };
}

const only = process.argv[2];
const order = only ? ["baseline", only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`unknown arm ${only}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
mkdirSync(HOLD, { recursive: true });
const report = [];
let wrong = 0;
for (const name of order) {
  const arm = ARMS[name];
  const files = [...new Set(arm.patches.map((p) => p[0]))];
  const kept = files.map((f) => {
    const copy = join(HOLD, `${name}.${f.split("/").pop()}.pristine`);
    copyFileSync(f, copy);
    return { f, copy, digest: sha(readFileSync(f)), bytes: statSync(f).size };
  });
  let armed = true;
  for (const [f, from, to] of arm.patches) {
    const src = readFileSync(f, "utf8");
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${name}: patch matched ${n} times in ${f} — NOT ARMED`); break; }
    writeFileSync(f, src.replace(from, to));
  }
  const res = armed ? runSuite() : null;
  /* RESTORE, and it is only believed when measured. */
  for (const k of kept) {
    copyFileSync(k.copy, k.f);
    const back = readFileSync(k.f), orig = readFileSync(k.copy);
    const same = sha(back) === k.digest && Buffer.compare(back, orig) === 0 && back.length === k.bytes;
    console.log(`  restore ${k.f.split("/").slice(-2).join("/")}: ${back.length} B sha256 ${sha(back).slice(0, 12)}… `
              + `restored byte-identically: ${same ? "YES" : "NO"}`);
    /* RE-ANCHORED 2026-09-27 (T5-12): the floor fits the module files (the smallest it restores, the pipeline, is ~64 KB). */
    if (!same || back.length < 20000) { console.error("RESTORE FAILED — stop and repair by hand"); process.exit(3); }
    rmSync(k.copy);
  }
  if (!res) { report.push(`${name}: NOT ARMED`); wrong++; continue; }
  const failedAll = (label) => res.fails.some((f) => f.includes(label));
  const passedAll = (label) => res.passes.some((p) => p.includes(label));
  const missFail = arm.mustFail.filter((l) => !failedAll(l));
  const missPass = arm.mustPass.filter((l) => !passedAll(l));
  const asDeclared = res.foot && missFail.length === 0 && missPass.length === 0
                   && (name === "baseline" ? res.fail === 0 : res.fail > 0);
  if (!asDeclared) wrong++;
  const line = `${name}: ${res.pass}/${res.fail}${res.foot ? "" : " (NO FOOT)"} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
             + (missFail.length ? ` · did NOT fail: ${missFail.join(" | ")}` : "")
             + (missPass.length ? ` · did NOT pass: ${missPass.join(" | ")}` : "");
  console.log(line);
  if (res.fails.length && name !== "baseline") console.log(`    failed: ${res.fails.join(" | ")}`);
  report.push(line);
}
rmSync(HOLD, { recursive: true, force: true });
console.log(`\nnc-cpdf19: ${order.length} arm(s) run, ${wrong} not as declared\n  ${report.join("\n  ")}`);
process.exit(wrong ? 1 : 0);
