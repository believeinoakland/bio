/* REC-170's NEGATIVE CONTROL DRIVER — five arms plus a baseline, re-runnable in one step from `bio-plane/`.
 *
 *     node test/rec170-manifest-pair.control.mjs        # every arm, in order
 *     node test/rec170-manifest-pair.control.mjs b      # one arm
 *
 * Built on `d442-publish-writes-nothing.control.mjs`, whose rules it keeps: DELIBERATELY NOT A `.test.mjs`,
 * because it EDITS A REAL SOURCE. Pristine copies live INSIDE THIS WORKTREE (`bio-plane/.nc-rec170/`,
 * gitignored by the `.nc-*` rule), uniquely named per arm; every restore is verified by sha256, by content AND
 * by `cmp`, with the byte count printed and floored; the suite's output goes to a FILE, never a pipe. Each arm
 * is armed ALONE. A missing tally is -1, never 0. Every arm DECLARES which assertions must fail and which must
 * not, as fragments of the suite's own labels, and the run is checked against the declaration as a TOTAL.
 *
 * THE ARMS (declared 2026-09-23 by the REC-170 worker, before the first run):
 *  (a) SERVE THE NULL AGAIN — THE ROW'S OWN NAMED CONTROL. The manifest row is the stored column whatever the
 *      pinning documents say. MUST FAIL: both PER CASE arms, both REASON arms, Q's SCALAR arm (the stored
 *      column is X's pair: the liar b5ce975a shipped) and the publishedcase-equality arm. MUST NOT FAIL: S's
 *      SCALAR arm (S's stored column IS null — the bare null the row names, which is why the REASON arm exists
 *      beside it), the single-case and over-strictness arms, and every fixture arm.
 *  (b) THE LIAR IC-74 FORBIDS — every per-case pair and the reason are served, and ONE case's pair is ALSO
 *      served as THE scalar. MUST FAIL: the two SCALAR arms alone.
 *  (c) FLAG EVERYTHING — a finding two cases pin is marked undetermined whether or not their documents agree.
 *      MUST FAIL: the OVER-STRICTNESS arm alone.
 *  (d) INVENT THE PER-CASE PAIRS — each case's entry carries the stored column rather than its own document's
 *      pair. MUST FAIL: both PER CASE arms and the publishedcase-equality arm.
 *  (e) OVER-STRICTNESS — correct work in a spelling the suite did not anticipate: the per-case list in
 *      DESCENDING case order. The suite MUST stay GREEN.
 *
 * MEASURED figures are at the foot of this file.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-rec170");
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "rec170-manifest-pair.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

let DRY = null;
const edit = (file, needle, replacement) => {
  if (ANCHOR_DRY) return void anchorPatch(file, needle, replacement);   /* M0-197: read, never armed */
  if (DRY) { DRY.push({ file, needle }); return; }
  /* BYTE-WISE, because `store.mjs` carries a stray byte (CLAUDE.md §7). */
  const src = readFileSync(file);
  const nb = Buffer.from(needle, "utf8");
  const first = src.indexOf(nb);
  const n = first < 0 ? 0 : (src.indexOf(nb, first + 1) < 0 ? 1 : 2);
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, Buffer.concat([src.subarray(0, first), Buffer.from(replacement, "utf8"),
                                     src.subarray(first + nb.length)]));
};

const GUARD = "          if (!pinned || new Set(pinned.map((p) => JSON.stringify(p.strength))).size < 2) return row;";
const SERVE = "          return { ...row, strength: null, strengthUndetermined: \"CASES_DISAGREE\", strengthByCase: pinned };";
const ORDER = "        ORDER BY m.bundle_id, m.version_sha, m.case_id, m.edition`);";

const F_GUARD = "(fixture) case X's document freezes a pair";
const SINGLE = "SINGLE CASE: Q's manifest row reads as it did";
const F_Q0 = "(fixture) re-grading Q0 moves NONE";
const F_Y = "(fixture) Y pins the SAME shas as X";
const F_S = "(fixture) S ratifies for the FIRST time";
const S_PER = "PER CASE: S (";
const S_SCALAR = "THE SCALAR: S —";
const S_REASON = "THE REASON: S —";
const Q_PER = "PER CASE: Q (";
const Q_SCALAR = "THE SCALAR: Q —";
const Q_REASON = "THE REASON: Q —";
const PC_EQ = "EACH CASE'S ENTRY IS WHAT op=publishedcase SERVES";
const OVER = "OVER-STRICTNESS: R, pinned by the SAME two cases";

const ALL = [F_GUARD, SINGLE, F_Q0, F_Y, F_S, S_PER, S_SCALAR, S_REASON, Q_PER, Q_SCALAR, Q_REASON, PC_EQ, OVER];
const except = (...xs) => ALL.filter((x) => !xs.includes(x));
const A_FAIL = [S_PER, S_REASON, Q_PER, Q_SCALAR, Q_REASON, PC_EQ];

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes five-arms-working from five-arms-broken",
              apply: () => {}, mustFail: [], mustNotFail: ALL },
  a: { files: [STORE], label: "(A) SERVE THE NULL AGAIN — the row is the stored column, whatever the documents say",
       apply: () => edit(STORE, GUARD, "          if (true) return row;"),
       mustFail: A_FAIL, mustNotFail: except(...A_FAIL) },
  b: { files: [STORE], label: "(B) THE LIAR — every case's pair served, AND one case's pair served as THE pair",
       apply: () => edit(STORE, SERVE,
         "          return { ...row, strength: pinned[0].strength, strengthUndetermined: \"CASES_DISAGREE\", strengthByCase: pinned };"),
       mustFail: [S_SCALAR, Q_SCALAR], mustNotFail: except(S_SCALAR, Q_SCALAR) },
  c: { files: [STORE], label: "(C) FLAG EVERYTHING — two pinning cases are undetermined even when they agree",
       apply: () => edit(STORE, GUARD, "          if (!pinned || pinned.length < 2) return row;"),
       mustFail: [OVER], mustNotFail: except(OVER) },
  d: { files: [STORE], label: "(D) INVENT THE PER-CASE PAIRS — each case's entry is the stored column",
       apply: () => edit(STORE, SERVE,
         "          return { ...row, strength: null, strengthUndetermined: \"CASES_DISAGREE\", strengthByCase: pinned.map((p) => ({ ...p, strength: row.strength })) };"),
       mustFail: [S_PER, Q_PER, PC_EQ], mustNotFail: except(S_PER, Q_PER, PC_EQ) },
  e: { files: [STORE], label: "(E) OVER-STRICTNESS — the per-case list in descending case order; the suite must stay GREEN",
       apply: () => edit(STORE, ORDER, "        ORDER BY m.bundle_id, m.version_sha, m.case_id DESC, m.edition DESC`);"),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
};

anchorEach(ARMS, (a) => a.apply());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

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
preflight("rec170-manifest-pair.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => [...a.mustFail, ...a.mustNotFail]))]
    .filter((f) => !suiteSrc.includes(f.trim()));
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
    const m = /rec170-manifest-pair\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
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

/* MEASURED 2026-09-23 by the REC-170 worker (`node test/rec170-manifest-pair.control.mjs` from `bio-plane/`, worktree
   `.claude/worktrees/agent-ace3a991381a5e0d1`, branch `land/worker/REC-170`). Every anchor LIVE at the preflight; every
   label fragment present in the suite; every restore sha256 MATCH, content IDENTICAL and cmp SAME — store.mjs
   2,836,204 B (60d05d41861c5a8f…).

     baseline  13 pass, 0 fail   AS DECLARED
     (a)        7 pass, 6 fail   AS DECLARED  the row's own: serve the stored column again — both PER CASE, both REASON,
                                              Q's SCALAR (X's pair, the liar b5ce975a shipped) and the publishedcase
                                              equality; S's SCALAR stays green over the bare null, as declared
     (b)       11 pass, 2 fail   AS DECLARED  THE LIAR IC-74 forbids (one case's pair as THE pair): the two SCALAR arms alone
     (c)       12 pass, 1 fail   AS DECLARED  flag everything: the over-strictness arm alone
     (d)       10 pass, 3 fail   AS DECLARED  invented per-case pairs: both PER CASE arms and the publishedcase equality
     (e)       13 pass, 0 fail   AS DECLARED  over-strictness: the per-case list in descending order, green

   And the suite against the store as it stood on b5ce975a (before this item): 7 pass, 6 fail — the same six arms as (a),
   by name. */
