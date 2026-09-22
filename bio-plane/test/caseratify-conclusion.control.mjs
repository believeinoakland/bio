/* REC-167's NEGATIVE CONTROL DRIVER — four arms plus a baseline, re-runnable in one
 * step from `bio-plane/`.
 *
 *     node test/caseratify-conclusion.control.mjs        # every arm, in order
 *     node test/caseratify-conclusion.control.mjs a      # one arm
 *
 * Built on `case-edition-conclusion.control.mjs` (REC-157's), whose rules it keeps:
 * DELIBERATELY NOT A `.test.mjs`, because it EDITS REAL SOURCES and a file the
 * battery discovers must never rewrite `src/` underneath the suites running beside
 * it. Pristine copies live INSIDE THIS WORKTREE, uniquely named per arm; every
 * restore is verified by sha256 AND by `cmp` against that arm's own copy, with the
 * byte count printed and floored; the suite's output goes to a FILE, never a pipe
 * (D-282). Each arm is armed ALONE. A MISSING TALLY IS REPORTED AS -1, NEVER 0.
 *
 * EVERY ARM DECLARES, BEFORE IT ARMS, WHICH ASSERTIONS MUST FAIL AND WHICH MUST NOT,
 * as fragments of the suite's own labels, and the run is CHECKED against the
 * declaration as a TOTAL (every failing line declared, every declared line failed,
 * every must-not line passed).
 *
 * THE ARMS (declared 2026-09-22 by the REC-167 worker, before the first run):
 *  (a) THE COMPARISON DROPPED — THE ROW'S OWN NAMED CONTROL, the liar who asks
 *      concluded-ness alone. MUST FAIL: §2's conclude-again arm BY NAME, its
 *      names-what-moved arm, and — cascade, the old preparation now SIGNS — §2's
 *      nothing-signed arm and §3's old-preparation-still-refused arm. MUST NOT FAIL:
 *      all of §1 (the withdrawn arm is refused by concluded-ness alone, which is
 *      exactly why §1 cannot tell this liar apart), §3's publish-again and ratify
 *      arms, all of §4.
 *  (b) THE WHOLE REFUSAL DROPPED — THE PLANE AS M-92 MEASURED IT. MUST FAIL: every
 *      §1 refusal arm (refused, catalogue row, names what moved, the route, nothing
 *      signed, op=ratify signs nothing), §2's refusal arms (the old preparation is
 *      already signed by §1), §3's old-preparation arm. MUST NOT FAIL: the fixture
 *      arms, §3's publish-again and ratify arms, all of §4.
 *  (c) CONCLUDED-NESS DROPPED — ONLY THE COMPARISON ASKED. DECLARED TO SHOW NO
 *      EFFECT, and the reason is stated before the run rather than found after it:
 *      what `#caseConclusionFor` answers for a relationship that is NOT concluded
 *      renders as a row with no reading and no author, and a row the case document
 *      recorded always carries both, so the comparison already refuses it. The
 *      explicit concluded gate is kept anyway, because it is §7.1 item 4's question
 *      BY NAME and it is what supplies the refusal's `why`; this arm measures that
 *      the refusal does not DEPEND on it. MUST FAIL: nothing. MUST NOT FAIL: every
 *      refusal and every ratify arm.
 *  (d) OVER-STRICTNESS — THE SIGNER'S SIGHT DROPPED (the viewer passed as null, so
 *      the gate fails closed and every project reads as never having concluded).
 *      MUST FAIL: §3's ratify arm and — cascade — its finding and signed-edition
 *      arms; §4's over-strictness arm and its finding arm; §1's and §2's
 *      names-what-moved arms (the `why` becomes never-concluded, and a concluded
 *      project reads as not concluded). MUST NOT FAIL: §1's refused/catalogue/
 *      nothing-signed/op=ratify arms and §2's conclude-again arm — a fence that
 *      refuses everything passes every refusal, which is why §3 and §4 exist.
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
const PEN = join(ROOT, ".nc-caseratify-conclusion");   /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "caseratify-conclusion.test.mjs");
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

const PASSES = "        if (conc.state === \"concluded\" && rec.same.length) continue;";
const GATE = "      if (moved.length) {\n        const refusal = (code, detail) => {\n          const row = CASE_CONCLUSION_CHECKS[code];";
const VIEWER = "      const concViewer = attestorMember ? `member:${attestorMember}` : null;";

/* The suite's OWN assertion labels, quoted as the invariant opening of each. */
const S1_FIX = "(fixture) A prepares edition 1 of a new case";
const S1_REFUSED = "M-92's PATH IS REFUSED by the new code";
const S1_ROW = "with its catalogue row's check and canned translation";
const S1_NAMES = "and it names WHAT moved: the member";
const S1_ROUTE = "and the route: publish again";
const S1_NOTHING = "NOTHING WAS SIGNED: the case document is still unratified";
const S1_RATIFY = "and op=ratify — the finding-side path M-92 named too";
const S2_DISC = "(discriminator) the finding's bytes are EXACTLY the preparation's pin";
const S2_AGAIN = "THE CONCLUDE-AGAIN ARM";
const S2_NAMES = "and it names what moved: recorded claim A";
const S2_NOTHING = "and still nothing was signed";
const S3_PUB = "A publishes again: a fresh preparation";
const S3_RECORDS = "the new preparation records A's conclusion now";
const S3_RATIFIES = "AND IT RATIFIES: the case is committed";
const S3_FINDING = "and the finding ratifies at the version the case pinned";
const S3_SIGNED = "the signed edition is the one recording claim B";
const S3_OLD = "and the OLD preparation, still unsigned beside it";
const S4_OVER = "OVER-STRICTNESS: an unchanged conclusion RATIFIES";
const S4_FINDING = "and its finding ratifies";

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes four-arms-working from four-arms-broken",
              apply: () => {}, mustFail: [],
              mustNotFail: [S1_FIX, S1_REFUSED, S2_AGAIN, S3_RATIFIES, S3_OLD, S4_OVER] },

  a: { files: [STORE],
       label: "(A) THE COMPARISON DROPPED — concluded-ness alone, the row's own named control",
       apply: () => edit(STORE, PASSES, PASSES.replace("conc.state === \"concluded\" && rec.same.length",
                                                       "conc.state === \"concluded\"")),
       mustFail: [S2_AGAIN, S2_NAMES],
       cascade: [S2_NOTHING, S3_OLD],
       mustNotFail: [S1_FIX, S1_REFUSED, S1_ROW, S1_NAMES, S1_ROUTE, S1_NOTHING, S1_RATIFY, S2_DISC,
                     S3_PUB, S3_RECORDS, S3_RATIFIES, S3_FINDING, S3_SIGNED, S4_OVER, S4_FINDING] },

  b: { files: [STORE],
       label: "(B) THE WHOLE REFUSAL DROPPED — the plane as M-92 measured it",
       apply: () => edit(STORE, GATE, GATE.replace("if (moved.length) {", "if (false && moved.length) {")),
       mustFail: [S1_REFUSED, S1_ROW, S1_NAMES, S1_ROUTE, S1_NOTHING, S1_RATIFY, S2_AGAIN, S2_NAMES, S2_NOTHING, S3_OLD],
       mustNotFail: [S1_FIX, S2_DISC, S3_PUB, S3_RECORDS, S3_RATIFIES, S3_FINDING, S3_SIGNED, S4_OVER, S4_FINDING] },

  c: { files: [STORE],
       label: "(C) CONCLUDED-NESS DROPPED — only the comparison asked (declared to show NO effect)",
       apply: () => edit(STORE, PASSES, PASSES.replace("conc.state === \"concluded\" && rec.same.length",
                                                       "rec.same.length")),
       mustFail: [],
       mustNotFail: [S1_FIX, S1_REFUSED, S1_ROW, S1_NAMES, S1_ROUTE, S1_NOTHING, S1_RATIFY, S2_DISC, S2_AGAIN,
                     S2_NAMES, S2_NOTHING, S3_PUB, S3_RECORDS, S3_RATIFIES, S3_FINDING, S3_SIGNED, S3_OLD,
                     S4_OVER, S4_FINDING] },

  d: { files: [STORE],
       label: "(D) OVER-STRICTNESS — the signer's sight dropped, so every project reads as never concluded",
       apply: () => edit(STORE, VIEWER, "      const concViewer = null;"),
       mustFail: [S3_RATIFIES, S4_OVER, S1_NAMES, S2_NAMES],
       cascade: [S3_FINDING, S3_SIGNED, S4_FINDING],
       mustNotFail: [S1_FIX, S1_REFUSED, S1_ROW, S1_ROUTE, S1_NOTHING, S1_RATIFY, S2_DISC, S2_AGAIN, S2_NOTHING,
                     S3_PUB, S3_RECORDS, S3_OLD] },
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
preflight("caseratify-conclusion.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => [...a.mustFail, ...(a.cascade || []), ...a.mustNotFail]))]
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
    const m = /caseratify-conclusion\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    const hits = (frag) => failed.some((f) => f.startsWith(frag));
    const declaredFail = [...arm.mustFail, ...(arm.cascade || [])];
    const missing = declaredFail.filter((f) => !hits(f));
    const wrongly = arm.mustNotFail.filter((f) => hits(f));
    const undeclared = failed.filter((f) => !declaredFail.some((k) => f.startsWith(k)));
    if (!m) verdict = "NOT AS DECLARED (no tally)";
    else if (missing.length || wrongly.length || undeclared.length) verdict = "NOT AS DECLARED";
    else verdict = "AS DECLARED";
    for (const f of missing) console.log(`    DECLARED TO FAIL${(arm.cascade || []).includes(f) ? " (cascade)" : ""}, DID NOT: ${f}`);
    for (const f of wrongly) console.log(`    DECLARED NOT TO FAIL, DID: ${f}`);
    for (const f of undeclared) console.log(`    FAILED, AND NO DECLARATION NAMED IT: ${f.slice(0, 110)}`);
    console.log(`  ${verdict}  (declared to fail: ${declaredFail.length}, of which cascade: ${(arm.cascade || []).length})`);
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

/* MEASURED 2026-09-22 by the REC-167 worker (`node test/caseratify-conclusion.control.mjs` from `bio-plane/`,
   worktree `.claude/worktrees/agent-a33d4bac9a4ff9d3a`, branch `worktree-agent-a33d4bac9a4ff9d3a`). All four
   anchors LIVE at the preflight; every label fragment present in the suite; EVERY RESTORE sha256 MATCH, content
   IDENTICAL and cmp SAME — `store.mjs` 2,794,793 bytes (sha256 bf78ff5d5d41945a…), far over the 1,000-byte floor.

     baseline  21 pass, 0 fail    AS DECLARED
     (a)       17 pass, 4 fail    AS DECLARED  the comparison dropped (2 declared + 2 declared cascade)
     (b)       11 pass, 10 fail   AS DECLARED  the whole refusal dropped — M-92's plane
     (c)       21 pass, 0 fail    AS DECLARED  concluded-ness dropped — no effect, as declared and argued
     (d)       14 pass, 7 fail    AS DECLARED  the signer's sight dropped (4 declared + 3 declared cascade)

   EVERY ARM AS DECLARED ON THE FIRST RUN. Arm (c)'s null result is recorded as what it is — a measurement that
   the refusal does not rest on the explicit concluded gate — and not as that gate being dead: it is §7.1 item 4's
   question by name and the only source of the refusal's `why`, which arm (d) shows an assertion reading. */
