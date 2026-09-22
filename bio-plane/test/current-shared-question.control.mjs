/* REC-166's NEGATIVE CONTROL DRIVER — four arms plus a baseline, re-runnable in one
 * step from `bio-plane/`.
 *
 *     node test/current-shared-question.control.mjs        # every arm, in order
 *     node test/current-shared-question.control.mjs a      # one arm
 *
 * Built on `case-edition-conclusion.control.mjs` (REC-157's), whose rules it keeps:
 * DELIBERATELY NOT A `.test.mjs`, because it EDITS REAL SOURCES. Pristine copies live
 * INSIDE THIS WORKTREE (`bio-plane/.nc-rec166/`, gitignored), uniquely named per arm;
 * every restore is verified by sha256, by content AND by `cmp` against that arm's own
 * copy, with the byte count printed and floored; the suite's output goes to a FILE,
 * never a pipe (D-282). Each arm is armed ALONE, every other defence held open. A
 * missing tally is -1, never 0. Every arm DECLARES which assertions must fail and
 * which must not, as fragments of the suite's own labels, and the run is checked
 * against the declaration as a TOTAL.
 *
 * THE ARMS (declared 2026-09-22 by the REC-166 worker, before the first run):
 *  (a) RESTORE THE INQUIRY PROMOTION — THE ROW'S OWN NAMED CONTROL. The make-current
 *      writes the project and then falls through to the question's promotion, as
 *      before REC-166. MUST FAIL: the pin arms (§2's pin and byte-identical arms,
 *      §3's pin arm), the flag arms (§2, §3), the fence arms (§2, §3), and §4's
 *      unpublished make-current arm. MUST NOT FAIL: the fixture arms before any
 *      stance moves, the receipt arms (§2, §3 — the project write is untouched),
 *      B's pointer arm, and §4's siblings arm.
 *  (b) THE LIAR — the receipt dropped with the promotion: the project's `Reason:`
 *      line is not written. MUST FAIL: §2's and §3's receipt arms. MUST NOT FAIL:
 *      every pin, flag and fence arm — the liar passes all of them, which is why
 *      the receipt arm exists.
 *  (c) THE REFUSED FIX (b) — the question promoted again AND the revision flag
 *      exempted. The exemption is armed as `#flagCasesOnRevision` returning
 *      nothing, which in this suite is the same thing: the only revisions of a
 *      pinned finding here are the make-current's and the fence probe's own
 *      publications, which arm (a) shows follow from the moved pin. MUST FAIL: the
 *      pin arms, the fence arms, §4's unpublished make-current arm. MUST NOT FAIL:
 *      the flag arms (§2, §3) — which is exactly how fix (b) reads as fixed while
 *      the moved pin, the defect, stands.
 *  (d) OVER-STRICTNESS — the project's Session Log sentence re-worded. Correct work
 *      in a spelling the suite did not anticipate: the suite MUST stay GREEN.
 *
 * MEASURED figures are at the foot of this file.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-rec166");   /* inside this worktree; gitignored */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "current-shared-question.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

/* The early return REC-166 added: removing ONLY its `return receipt;` restores the
   fall-through into the question's promotion, touching nothing else. */
const EARLY = "      if (!p.ok) return { ...p, act, target, version: vname, project: projectId };\n"
            + "      return receipt;\n    }\n";
const EARLY_RESTORED = "      if (!p.ok) return { ...p, act, target, version: vname, project: projectId };\n    }\n";
const RECEIPT = "      + `Changes: this project now stands on reading '${vname}' of ${inquiryId}.\\n`\n"
              + "      + (why ? `Reason: ${why}\\n` : \"\"));";
const FLAG = "  #flagCasesOnRevision(bundleId, replacedSha, when) {\n"
           + "    if (!bundleId || !replacedSha) return [];";

const S1_FLAGS = "(fixture) before any stance moves, op=caseflags names nothing";
const S1_FENCE = "(fixture) the case's fences HOLD on the pinned finding";
const S1_TWIN = "(fixture) on the UNPUBLISHED twin, divide and ground ARE offered";
const S2_PIN = "THE PIN: after ANOTHER project's make-current";
const S2_BYTES = "and Q's bundle.md is byte-identical";
const S2_FLAGS = "NO REVISION FLAG: op=caseflags names no case for Q";
const S2_FENCE = "THE FENCES STILL HOLD on case X's member after B moved its stance";
const S2_RECEIPT = "THE RECEIPT IS B'S";
const S2_POINTER = "and B's pointer reads reading 2";
const S3_PIN = "THE PIN, AGAIN";
const S3_FLAGS = "and still no revision flag for Q or for case X";
const S3_FENCE = "and the fences still hold";
const S3_RECEIPT = "A's own bytes carry the receipt with A's reason";
const S4_SIB = "op=versionaccept and each sibling";
const S4_CURRENT = "and a make-current on the UNPUBLISHED question moves nothing on it either";

const ALL = [S1_FLAGS, S1_FENCE, S1_TWIN, S2_PIN, S2_BYTES, S2_FLAGS, S2_FENCE, S2_RECEIPT, S2_POINTER,
             S3_PIN, S3_FLAGS, S3_FENCE, S3_RECEIPT, S4_SIB, S4_CURRENT];

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes four-arms-working from four-arms-broken",
              apply: () => {}, mustFail: [], mustNotFail: ALL },

  a: { files: [STORE],
       label: "(A) RESTORE THE INQUIRY PROMOTION — the make-current falls through to the question's promotion again",
       apply: () => edit(STORE, EARLY, EARLY_RESTORED),
       mustFail: [S2_PIN, S2_BYTES, S2_FLAGS, S2_FENCE, S3_PIN, S3_FLAGS, S3_FENCE, S4_CURRENT],
       mustNotFail: [S1_FLAGS, S1_FENCE, S1_TWIN, S2_RECEIPT, S2_POINTER, S3_RECEIPT, S4_SIB] },

  b: { files: [STORE],
       label: "(B) THE LIAR — the receipt dropped with the promotion: no `Reason:` in the project's entry",
       apply: () => edit(STORE, RECEIPT,
         "      + `Changes: this project now stands on reading '${vname}' of ${inquiryId}.\\n`);"),
       mustFail: [S2_RECEIPT, S3_RECEIPT],
       mustNotFail: [S1_FLAGS, S1_FENCE, S1_TWIN, S2_PIN, S2_BYTES, S2_FLAGS, S2_FENCE, S2_POINTER,
                     S3_PIN, S3_FLAGS, S3_FENCE, S4_SIB, S4_CURRENT] },

  c: { files: [STORE],
       label: "(C) THE REFUSED FIX (b) — the question promoted again, the revision flag exempted",
       apply: () => { edit(STORE, EARLY, EARLY_RESTORED);
                      edit(STORE, FLAG, FLAG.replace("    if (!bundleId || !replacedSha) return [];", "    return [];")); },
       mustFail: [S2_PIN, S2_BYTES, S2_FENCE, S3_PIN, S3_FENCE, S4_CURRENT],
       mustNotFail: [S1_FLAGS, S1_FENCE, S1_TWIN, S2_FLAGS, S2_RECEIPT, S2_POINTER, S3_FLAGS, S3_RECEIPT, S4_SIB] },

  d: { files: [STORE],
       label: "(D) OVER-STRICTNESS — the project's Session Log sentence re-worded; the suite must stay GREEN",
       apply: () => edit(STORE, "      + `Changes: this project now stands on reading '${vname}' of ${inquiryId}.\\n`\n",
         "      + `Changes: reading '${vname}' of ${inquiryId} is what this team now stands on.\\n`\n"),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
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
preflight("current-shared-question.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => [...a.mustFail, ...a.mustNotFail]))]
    .filter((f) => !suiteSrc.includes(f));
  if (dead.length) {
    console.log(`\nDECLARATION REFERS TO ${dead.length} LABEL(S) THE SUITE DOES NOT CONTAIN — refusing to arm:`);
    for (const f of dead) console.log(`  - ${f}`);
    process.exit(4);
  }
}

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

  let tally = "(not run)", counted = -1, verdict = "NOT RUN";
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    const m = /current-shared-question\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    const hits = (frag) => failed.some((f) => f.startsWith(frag));
    const missing = arm.mustFail.filter((f) => !hits(f));
    const wrongly = arm.mustNotFail.filter((f) => hits(f));
    const undeclared = failed.filter((f) => !arm.mustFail.some((k) => f.startsWith(k)));
    if (!m) verdict = "NOT AS DECLARED (no tally)";
    else if (missing.length || wrongly.length || undeclared.length) verdict = "NOT AS DECLARED";
    else if (!arm.expectGreen && name !== "baseline" && counted === 0) verdict = "NOT AS DECLARED (stayed green)";
    else verdict = "AS DECLARED";
    for (const f of missing) console.log(`    DECLARED TO FAIL, DID NOT: ${f}`);
    for (const f of wrongly) console.log(`    DECLARED NOT TO FAIL, DID: ${f}`);
    for (const f of undeclared) console.log(`    FAILED, AND NO DECLARATION NAMED IT: ${f.slice(0, 110)}`);
    console.log(`  ${verdict}  (declared to fail: ${arm.mustFail.length})`);
    results.push({ arm: name, tally, failed: counted, verdict });
  } finally {
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      let okCmp = true;
      try { execFileSync("cmp", ["-s", s.file, s.copy]); } catch { okCmp = false; }
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  cmp ${okCmp ? "SAME" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent && okCmp)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} failing)   ${r.verdict}`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
process.exit(results.every((r) => r.verdict === "AS DECLARED") ? 0 : 1);

/* MEASURED 2026-09-22 by the REC-166 worker (`node test/current-shared-question.control.mjs` from `bio-plane/`,
   worktree `.claude/worktrees/agent-ad40113081815cd8f`, pushed as `worktree-agent-a1707ddf948cd5c29` at ad8492d9). All five
   anchors LIVE at the preflight; every label fragment present in the suite; every restore sha256 MATCH, content IDENTICAL
   and cmp SAME — `store.mjs` 2,789,608 bytes (sha256 88e98613feda2d84…), far over the 1,000-byte floor.

     baseline  18 pass, 0 fail    AS DECLARED
     (a)       10 pass, 8 fail    AS DECLARED  the question's promotion restored: both pins, byte-identical, both flag
                                               arms, both fence arms, the unpublished make-current
     (b)       16 pass, 2 fail    AS DECLARED  the liar: the two receipt arms alone; every pin, flag and fence arm green
     (c)       12 pass, 6 fail    AS DECLARED  the refused fix (b): the flag arms stay GREEN while pins and fences fail
     (d)       18 pass, 0 fail    AS DECLARED  over-strictness: the project's sentence re-worded, green

   EVERY ARM AS DECLARED ON THE FIRST RUN. Arm (c) is the one worth reading: `op=caseflags` reads clean over a plane that
   still unpins the case, which is exactly why §7 refuses fix (b) and why the pin and fence arms sit beside the flag arm. */
