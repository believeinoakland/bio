/* NEGATIVE CONTROLS for REC-69's REPLAY onto `main` (2026-08-09) — the SELECTS
 * role, its teeth, and the index roster's re-measured ceiling/floor.
 *
 * Run in one step:  node test/nc-rec69-selects.mjs   (from bio-plane/)
 *
 * WHAT THIS HARNESS IS FOR, and it is narrower than `airuns.control.mjs`. That
 * file is REC-69's own seven-arm control over the OP and it is unchanged. This
 * one covers only what the REPLAY added: a fifth ROLE minted in
 * `run-conditions.test.mjs`, the arm that makes that role EARNED rather than
 * granted, and the roster figure moved 11 -> 13 with its two arrivals named.
 *
 * THE DISCIPLINE, and every clause of it is here because this repository has
 * paid for its absence:
 *   - EVERY ARM IS ARMED ALONE, every other defence held OPEN.
 *   - A BASELINE ROW RUNS FIRST. A harness whose first run reported `null` for
 *     every arm INCLUDING the baseline was indistinguishable from six arms
 *     working; only the baseline row told them apart.
 *   - EACH ARM DECLARES what MUST fail and what MUST NOT, before it runs.
 *   - THE ANCHOR IS GUARDED: it must occur EXACTLY ONCE, and the bytes must
 *     actually CHANGE. REC-69's own control found an arm that refused to arm
 *     because its anchor appeared twice — the identical line in `aiRunLog`.
 *   - PRISTINE COPIES ARE NAMED UNIQUELY PER ARM. A harness that named two
 *     snapshots from the PATH alone overwrote the first and then compared a
 *     restored original against patched bytes.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT (`cmp`), printing a
 *     byte count guarded against a minimum, because two harnesses once reported
 *     a restore byte-identical OVER AN EMPTY MANIFEST.
 *   - A SUITE THAT DID NOT REACH ITS OWN FOOT reports -1, never 0. A TypeError
 *     inside an assertion goes through no assertion at all.
 *
 * ARMS 1, 2 and 3 are the ones that matter: they are the difference between
 * SELECTS being a judgement the code has to keep and a fifth box on a table. */

import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const P = {
  store:  join(PLANE, "src/store.mjs"),
  schema: join(PLANE, "src/schema.mjs"),
  cond:   join(PLANE, "test/run-conditions.test.mjs"),
};
const MIN_BYTES = { store: 500000, schema: 50000, cond: 20000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* The FOOT is the suite's own last line. A run that did not print it never
   reached its tally, and its numbers are the absence of a measurement. */
const runSuite = (rel, footRe) => {
  let out = "";
  try {
    out = execFileSync(process.execPath, [rel], { cwd: PLANE, encoding: "utf8", maxBuffer: 1 << 28 });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const foot = footRe.exec(out);
  if (!foot) return { pass: -1, fail: -1, out };
  return { pass: Number(foot[1]), fail: Number(foot[2]), out };
};
const conditions = () => runSuite("test/run-conditions.test.mjs", /run-conditions: (\d+) pass, (\d+) fail/);
const airuns     = () => runSuite("test/airuns.test.mjs",         /airuns: (\d+) pass, (\d+) fail/);

const failedArms = (out) => (out.match(/^ {2}FAIL {2}(.+)$/gm) || [])
  .map((s) => s.replace(/^ {2}FAIL {2}/, "").slice(0, 110));

let armNo = 0, wrong = 0;
const arm = ({ name, file, from, to, mustFail, mustNotFail, run }) => {
  armNo++;
  const tag = `arm${armNo}`;
  const path = P[file];
  const snap = join(PLANE, `.nc-rec69-${tag}-${file}.pristine`);
  console.log(`\n=== ARM ${armNo}: ${name}`);
  console.log(`    DECLARED MUST FAIL     : ${mustFail}`);
  console.log(`    DECLARED MUST NOT FAIL : ${mustNotFail}`);

  copyFileSync(path, snap);
  const before = readFileSync(path, "utf8");
  const beforeSha = sha(path);
  if (before.length < MIN_BYTES[file])
    throw new Error(`${file} is ${before.length} bytes, below the ${MIN_BYTES[file]} guard — refusing to arm over a truncated file`);

  /* THE ANCHOR GUARD. Exactly once, or the arm mutates something it did not
     mean to and its result is about a different subject. */
  const hits = before.split(from).length - 1;
  if (hits !== 1) {
    console.log(`    ARM DID NOT ARM — anchor occurs ${hits} time(s), not once. THIS IS A FINDING.`);
    unlinkSync(snap); wrong++; return;
  }
  const after = before.replace(from, to);
  if (after === before) {
    console.log(`    ARM DID NOT ARM — the bytes did not change. THIS IS A FINDING.`);
    unlinkSync(snap); wrong++; return;
  }
  writeFileSync(path, after);
  console.log(`    armed: ${file} ${before.length} -> ${after.length} bytes`);

  let result;
  try { result = run(); } finally {
    writeFileSync(path, readFileSync(snap));
    const okSha = sha(path) === beforeSha;
    let okContent = false;
    try { execFileSync("cmp", ["-s", path, snap]); okContent = true; } catch { okContent = false; }
    const n = readFileSync(path).length;
    console.log(`    restored: ${n} bytes · sha256 ${okSha ? "MATCH" : "MISMATCH"} · cmp ${okContent ? "IDENTICAL" : "DIFFERS"}`);
    if (!okSha || !okContent || n < MIN_BYTES[file]) { console.log("    RESTORE FAILED"); wrong++; }
    if (existsSync(snap)) unlinkSync(snap);
  }
  return result;
};

/* ================================================================ BASELINE */
console.log("=== BASELINE (nothing armed) — without this row, every arm below could be");
console.log("    failing for a reason that has nothing to do with its subject.");
const bc = conditions(), ba = airuns();
console.log(`    run-conditions: ${bc.pass} pass, ${bc.fail} fail`);
console.log(`    airuns:         ${ba.pass} pass, ${ba.fail} fail`);
if (bc.fail !== 0 || ba.fail !== 0 || bc.pass < 1 || ba.pass < 1) {
  console.log("    BASELINE IS NOT GREEN — every arm below is uninterpretable. STOPPING.");
  process.exit(1);
}

/* ============================================================ ARMS 1 and 2:
   THE TEETH. SELECTS exempts `aiRunsInContext` from ARM P1's twenty-cell
   matrix. These two are the whole basis of that exemption. */
arm({
  name: "a SELECTS reader starts PROJECTING a stored column",
  file: "store",
  from: "SELECT r.run FROM ai_runs r",
  to:   "SELECT r.run, r.status FROM ai_runs r",
  mustFail: "run-conditions ARM W8, naming `aiRunsInContext PROJECTS stored column status`",
  mustNotFail: "ARM W3 / W3b — the reader is still CLASSIFIED; the role is intact and the code broke it",
  run: () => {
    const r = conditions();
    console.log(`    run-conditions: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    const named = /PROJECTS stored column status/.test(r.out);
    const w3 = /FAIL {2}ARM W3:/.test(r.out);
    console.log(`    ACTUAL: W8 named the column: ${named} · W3 also fell: ${w3} (declared false)`);
    if (!named || w3 || r.fail < 1) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

arm({
  name: "a SELECTS reader stops DELEGATING — it calls no PUBLISHES reader",
  file: "store",
  from: "this.aiRunRead({ run: r.run, viewer })",
  to:   "this.aiRunNotAPublisherAtAll({ run: r.run, viewer })",
  mustFail: "run-conditions ARM W8, naming `aiRunsInContext CALLS NO PUBLISHES reader`",
  mustNotFail: "ARM W3 — still classified. (airuns.test.mjs also goes red at RUNTIME, which is correct and is not this arm's subject)",
  run: () => {
    const r = conditions();
    console.log(`    run-conditions: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    const named = /CALLS NO PUBLISHES reader/.test(r.out);
    const w3 = /FAIL {2}ARM W3:/.test(r.out);
    console.log(`    ACTUAL: W8 named the missing delegation: ${named} · W3 also fell: ${w3} (declared false)`);
    if (!named || w3 || r.fail < 1) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

/* ==================================================================== ARM 3:
   MINTING A ROLE MUST NOT DISARM THE TOTALITY RATCHET. This is the arm that
   answers "did REC-69 make its own failure go away by adding a box". */
arm({
  name: "the SELECTS classification is REMOVED — W3's totality must fail exactly as it did on 2026-08-08",
  file: "cond",
  from: '  aiRunsInContext:    "SELECTS",\n',
  to:   "",
  mustFail: "ARM W3 naming `aiRunsInContext`, AND the ARM W8 GUARD (a corpus of zero SELECTS readers)",
  mustNotFail: "ARM W4 — the publisher set is unaffected by an unclassified reader",
  run: () => {
    const r = conditions();
    console.log(`    run-conditions: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    const w3 = /FAIL {2}ARM W3:/.test(r.out) && /aiRunsInContext/.test(r.out);
    const guard = /FAIL {2}ARM W8 GUARD/.test(r.out);
    const w4 = /FAIL {2}ARM W4/.test(r.out);
    console.log(`    ACTUAL: W3 named it: ${w3} · W8 GUARD fell: ${guard} · W4 fell: ${w4} (declared false)`);
    if (!w3 || !guard || w4) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

/* ============================================================ ARMS 4 and 7:
   THE ROSTER, IN BOTH DIRECTIONS. A ceiling alone would let the list grow to
   thirteen different indexes; a floor alone would let it shrink. */
arm({
  name: "a NEW index whose leading column nothing filters — the CEILING",
  file: "schema",
  from: "CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n",
  to:   "CREATE INDEX IF NOT EXISTS nc_r69_ceiling ON provenance_route_marks(documents_n);\nCREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n",
  mustFail: "airuns SWEEP CEILING — 14 unread against a ceiling of 13",
  mustNotFail: "the FLOOR and the BY-NAME pin — nothing was removed",
  run: () => {
    const r = airuns();
    console.log(`    airuns: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    const ceiling = /FAIL {2}SWEEP: and the finding is RATCHETED as a CEILING/.test(r.out);
    const floor = /FAIL {2}SWEEP: a FLOOR beside the ceiling/.test(r.out);
    const named = /FAIL {2}SWEEP: the roster is pinned BY NAME/.test(r.out);
    const printed = /nc_r69_ceiling/.test(r.out);
    console.log(`    ACTUAL: ceiling fell: ${ceiling} · the new index was PRINTED on the roster: ${printed}`);
    console.log(`            floor fell: ${floor} (declared false) · by-name fell: ${named} (declared false)`);
    if (!ceiling || !printed || floor || named) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

arm({
  name: "one of the two NAMED arrivals is REMOVED — the FLOOR and the BY-NAME pin",
  file: "schema",
  from: "CREATE INDEX IF NOT EXISTS provenance_route_marks_finding\n  ON provenance_route_marks(finding, bundle_id);\n",
  to:   "",
  mustFail: "airuns SWEEP FLOOR (12 < 13) AND the BY-NAME pin, naming `provenance_route_marks_finding`",
  mustNotFail: "the CEILING — the list got shorter, not longer",
  run: () => {
    const r = airuns();
    console.log(`    airuns: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    const floor = /FAIL {2}SWEEP: a FLOOR beside the ceiling/.test(r.out);
    const named = /FAIL {2}SWEEP: the roster is pinned BY NAME/.test(r.out)
               && /provenance_route_marks_finding/.test(r.out);
    const ceiling = /FAIL {2}SWEEP: and the finding is RATCHETED as a CEILING/.test(r.out);
    console.log(`    ACTUAL: floor fell: ${floor} · by-name named it: ${named} · ceiling fell: ${ceiling} (declared false)`);
    if (!floor || !named || ceiling) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

/* ==================================================================== ARM 5:
   THE EXCULPATION IS A MEASUREMENT. The roster carries
   `reading_text_source_kind` and the site claims it is a blind spot rather than
   a gap, because `op=textprovenance` filters both its columns through a WHERE
   composed at runtime. Take that filter away and the claim must go RED — which
   is what stops the exculpation being a sentence anybody can write. */
arm({
  name: "the composed filter the exculpation rests on is REMOVED — the blind-spot claim must go red",
  file: "store",
  from: "if (transcribed !== null) { where.push(`transcribed=?`); args.push(transcribed ? 1 : 0); }",
  to:   "if (false) { args.push(0); }",
  mustFail: "the airuns SWEEP exculpation arm for `reading_text_source_kind`",
  mustNotFail: "the CEILING and the FLOOR — the index was already unread by this reader, so the roster figure does NOT move. (textchain.test.mjs also goes red; it is not this arm's subject and is not run here)",
  run: () => {
    const r = airuns();
    console.log(`    airuns: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    const exc = /FAIL {2}SWEEP: `reading_text_source_kind` is this reader's DECLARED BLIND SPOT/.test(r.out);
    const ceiling = /FAIL {2}SWEEP: and the finding is RATCHETED as a CEILING/.test(r.out);
    const floor = /FAIL {2}SWEEP: a FLOOR beside the ceiling/.test(r.out);
    console.log(`    ACTUAL: exculpation fell: ${exc} · ceiling fell: ${ceiling} (declared false) · floor fell: ${floor} (declared false)`);
    if (!exc || ceiling || floor) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

/* ==================================================================== ARM 6:
   OVER-STRICTNESS. Correct work in a spelling ARM W8's reader was not written
   against must PASS. A fence tighter than its rule is not a safer fence. */
arm({
  name: "OVER-STRICTNESS — the same correct projection in a spelling W8 was not written against",
  file: "store",
  from: "SELECT r.run FROM ai_runs r",
  to:   "SELECT DISTINCT r.run AS run FROM ai_runs r",
  mustFail: "NOTHING. This is still a SELECTS reader projecting only the key.",
  mustNotFail: "every arm of run-conditions — W8, W8b, W3, W4",
  run: () => {
    const r = conditions();
    console.log(`    run-conditions: ${r.pass} pass, ${r.fail} fail`);
    for (const f of failedArms(r.out)) console.log(`      FAILED: ${f}`);
    console.log(`    ACTUAL: ${r.fail === 0 ? "GREEN, as declared" : "RED — W8 is stricter than its rule"}`);
    if (r.fail !== 0) { console.log("    ARM CAME BACK WRONG"); wrong++; }
  },
});

/* ==================================================================== FOOT */
const fc = conditions(), fa = airuns();
console.log(`\n=== FINAL (everything restored)`);
console.log(`    run-conditions: ${fc.pass} pass, ${fc.fail} fail`);
console.log(`    airuns:         ${fa.pass} pass, ${fa.fail} fail`);
const clean = fc.fail === 0 && fa.fail === 0 && fc.pass === bc.pass && fa.pass === ba.pass;
console.log(`    tree returned to the baseline: ${clean}`);
console.log(`\nnc-rec69-selects: ${armNo} arm(s) run, ${wrong} came back WRONG, tree clean: ${clean}`);
process.exit(wrong === 0 && clean ? 0 : 1);
