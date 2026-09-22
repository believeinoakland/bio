#!/usr/bin/env node
/* debt-floor.control.mjs — M0-109's NEGATIVE-CONTROL DRIVER, EIGHT ARMS PLUS A BASELINE, for the two NON-VACUITY floors
 * over the live DEBT.md: `bio-plane/test/ledger.test.mjs` §3 (the owed/ledger agreement) and
 * `bio-plane/test/planning-hygiene.test.mjs` §1 (the disposition-token check).
 *
 *     node bio-plane/test/debt-floor.control.mjs            # from the repo root: the baseline, then every arm
 *     node bio-plane/test/debt-floor.control.mjs LE LC      # the baseline, then the named arms
 *
 * WHAT IS BROKEN, AND WHY NEVER THE LEDGER ITSELF. Both floors judge the live `docs/development/DEBT.md`, which is
 * SCHEDULER's file and which LED-7's fold is draining on purpose. No arm writes it. Each arm replaces ONE SUITE'S OWN
 * READ of it with a PLANTED ledger (empty, or N planted open rows), so the only thing that moves is the input to the
 * floor under test: every other section of both suites still reads the real ledger and must stay green, which is how
 * "the suite fails AT THE FLOOR, BY NAME" is told apart from a red that is collateral. Each suite PRINTS the row count
 * its floor judged, and every arm asserts that count, so an arm whose plant never reached the floor is a finding.
 *
 * DECLARED BEFORE ARMING (M0-109's accepts-when, one arm per clause):
 *   LE   ledger.test, an EMPTY ledger                        -> "the real DEBT.md has rows" FAILS, and nothing else
 *   LC   ledger.test, the OLD `> 100` over 100 planted rows    -> the same assertion FAILS, and nothing else: the incident
 *   LO   ledger.test, the same 100 rows, the corrected floor   -> GREEN (over-strictness; and it isolates LC's variable)
 *   LO1  ledger.test, ONE planted row — the fold's last       -> GREEN (over-strictness)
 *   LL   ledger.test, THE LIAR: the floor DELETED, empty ledger -> GREEN, which is the finding: no other assertion sees
 *                                                                 an empty ledger, so LE is the arm that catches a liar
 *   HE   planning-hygiene, an EMPTY ledger                    -> "DEBT.md has debt rows to check" FAILS, nothing else
 *   HC   planning-hygiene, the OLD `>= 20` over 19 planted rows -> the same assertion FAILS, and nothing else
 *   HO   planning-hygiene, the same 19 rows, the corrected floor -> GREEN (over-strictness; isolates HC's variable)
 * What MUST NOT fail: the baseline and the closing run of both suites, and every restore.
 *
 * THE RULES, which are this estate's: every anchor is counted before anything arms (`preflight`, D-331); each arm
 * patches from a pristine tree and is restored before the next arms, verified by sha256 AND `cmp` against that arm's
 * own uniquely-named copy, byte count printed and floored; an `exit` hook restores from memory on EVERY exit, and
 * every child is asynchronous, so a signal is honoured when it arrives. THE PEN, `.m0109-harness/`, IGNORES ITSELF (a
 * `.gitignore` of `*` written inside it), so an interrupted run leaves no untracked file and needs no root `.gitignore`
 * line — `gates.mjs` classifies any root dotfile FULL. No directory is listed (`hygiene.test.mjs`'s walk census): the
 * pen's contents are the copies this run wrote, tracked in memory.
 *
 * THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN. The run of record is written, dated and with its
 * figures, into each suite's `NEGATIVE CONTROL:` block for M0-109.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";
import { debtRows } from "../../tools/ledger.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const LSUITE = path.join(REPO, "bio-plane", "test", "ledger.test.mjs");
const HSUITE = path.join(REPO, "bio-plane", "test", "planning-hygiene.test.mjs");
const DEBT_MD = path.join(REPO, "docs", "development", "DEBT.md");
const PEN = path.join(REPO, ".m0109-harness");
const PEN_IGNORE = path.join(PEN, ".gitignore");
const ONLY = process.argv.slice(2);
const DECLARED_ARMS = 8;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = sha(Buffer.alloc(0));
const SUBJECTS = new Map([
  [LSUITE, { name: "ledger.test.mjs", floorBytes: 40000 }],
  [HSUITE, { name: "planning-hygiene.test.mjs", floorBytes: 30000 }],
]);
for (const [p, s] of SUBJECTS) {
  s.pristine = fs.readFileSync(p);
  s.digest = sha(s.pristine);
  if (s.pristine.length < s.floorBytes || s.digest === EMPTY_SHA) {
    console.log(`** ${s.name} is implausibly small (${s.pristine.length} B, floor ${s.floorBytes}); refusing to arm over it`);
    process.exit(1);
  }
  console.log(`pristine ${s.name}: ${s.pristine.length} bytes, sha256 ${s.digest.slice(0, 12)}…`);
}
const LEDGER_BYTES = fs.readFileSync(DEBT_MD);
const LIVE_ROWS = debtRows(LEDGER_BYTES.toString("utf8")).length;
const LIVE_LINES = LEDGER_BYTES.toString("utf8").split("\n").filter((l) => /^\|\s*D-\d+\s*\|/.test(l)).length;
console.log(`the live DEBT.md: ${LEDGER_BYTES.length} bytes, sha256 ${sha(LEDGER_BYTES).slice(0, 12)}… · ${LIVE_ROWS} row(s) by ledger.mjs, `
  + `${LIVE_LINES} by planning-hygiene's row test — READ, never written`);

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

/* ---------------------------------------------------------------- the pen, on every exit */
const WRITTEN = new Set();
process.on("exit", (code) => {
  for (const [p, s] of SUBJECTS) {
    if (sha(fs.readFileSync(p)) !== s.digest) {
      fs.writeFileSync(p, s.pristine);
      console.log(`  exit ${code}: ${s.name} restored from memory — sha256 ${sha(fs.readFileSync(p)) === s.digest ? "match" : "**MISMATCH**"}`);
    }
  }
  const clean = [...SUBJECTS].every(([p, s]) => sha(fs.readFileSync(p)) === s.digest);
  if (clean) for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); WRITTEN.delete(p); } catch {} }
  /* The pen goes only when every copy has: a copy kept after a failed restore is the evidence, and the pen's own
     `.gitignore` stays with it so the kept copy never reads as untracked work. `rmdirSync` refuses a non-empty pen. */
  if (!WRITTEN.size) { try { fs.rmSync(PEN_IGNORE, { force: true }); if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {} }
  console.log(`debt-floor.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN} (${WRITTEN.size} copy(ies) kept as evidence)` : "absent"} · exit ${code}`);
});
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

/* ---------------------------------------------------------------- a suite run, read by the suite's own name */
const SUITES = {
  ledger: { file: LSUITE, tally: /^ledger: (\d+) pass, (\d+) fail$/m, reads: /the agreement reads (\d+) row\(s\) of DEBT\.md/,
            floor: "the real DEBT.md has rows (else the agreement is vacuous)", live: LIVE_ROWS },
  hygiene: { file: HSUITE, tally: /^planning-hygiene: (\d+) pass, (\d+) fail$/m, reads: /every one of (\d+) DEBT rows carries a disposition token/,
             floor: "DEBT.md has debt rows to check", live: LIVE_LINES },
};
function runSuite(key) {
  const S = SUITES[key];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [S.file], { cwd: path.join(REPO, "bio-plane"), stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (code) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = S.tally.exec(text), reads = S.reads.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: !!tally,
                reads: reads ? +reads[1] : -1,
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]),
                passed: [...text.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}

/* ---------------------------------------------------------------- the arms
   Each patch quotes one line of its suite, asserted to occur exactly ONCE before anything arms. The planted rows are
   OPEN (`M0 · open`) and their ids are built at run time from 9000 up, so no id is written literally anywhere. */
const ARMS = [
  { id: "LE", suite: "ledger", want: "RED", reads: 0,
    title: "ledger.test, an EMPTY ledger — the state the fold reaches before DEBT.md is archived whole",
    patches: [[LSUITE, "const debt = readFileSync(join(REPO, \"docs/development/DEBT.md\"), \"utf8\");", "const debt = DEBT([]);"]] },
  { id: "LC", suite: "ledger", want: "RED", reads: 100,
    title: "ledger.test, the OLD floor `> 100` restored over 100 planted rows — the incident M0-109 corrects",
    patches: [[LSUITE, "const debt = readFileSync(join(REPO, \"docs/development/DEBT.md\"), \"utf8\");", "const debt = DEBT(Array.from({ length: 100 }, (_, i) => `| D-${9000 + i} | gap | 2026-09-22 | planted by M0-109's control | M0 · open |`));"],
              [LSUITE, "t(\"the real DEBT.md has rows (else the agreement is vacuous)\", rows.length > 0, true);", "t(\"the real DEBT.md has rows (else the agreement is vacuous)\", rows.length > 100, true);"]] },
  { id: "LO", suite: "ledger", want: "GREEN", reads: 100,
    title: "ledger.test, OVER-STRICTNESS: the same 100 planted rows under the corrected floor",
    patches: [[LSUITE, "const debt = readFileSync(join(REPO, \"docs/development/DEBT.md\"), \"utf8\");", "const debt = DEBT(Array.from({ length: 100 }, (_, i) => `| D-${9000 + i} | gap | 2026-09-22 | planted by M0-109's control | M0 · open |`));"]] },
  { id: "LO1", suite: "ledger", want: "GREEN", reads: 1,
    title: "ledger.test, OVER-STRICTNESS: ONE planted row, the fold's last",
    patches: [[LSUITE, "const debt = readFileSync(join(REPO, \"docs/development/DEBT.md\"), \"utf8\");", "const debt = DEBT(Array.from({ length: 1 }, (_, i) => `| D-${9000 + i} | gap | 2026-09-22 | planted by M0-109's control | M0 · open |`));"]] },
  { id: "LL", suite: "ledger", want: "GREEN", reads: 0, absent: true,
    title: "ledger.test, THE LIAR: the floor DELETED, over an EMPTY ledger",
    patches: [[LSUITE, "const debt = readFileSync(join(REPO, \"docs/development/DEBT.md\"), \"utf8\");", "const debt = DEBT([]);"],
              [LSUITE, "t(\"the real DEBT.md has rows (else the agreement is vacuous)\", rows.length > 0, true);", "/* the floor, DELETED by M0-109's arm LL */"]] },
  { id: "HE", suite: "hygiene", want: "RED", reads: 0,
    title: "planning-hygiene, an EMPTY ledger",
    patches: [[HSUITE, "const debt = read(join(DEV, \"DEBT.md\"));", "const debt = \"| ID | Sev | Found | Item | Status |\\n|---|---|---|---|---|\\n\";"]] },
  { id: "HC", suite: "hygiene", want: "RED", reads: 19,
    title: "planning-hygiene, the OLD floor `>= 20` restored over 19 planted rows",
    patches: [[HSUITE, "const debt = read(join(DEV, \"DEBT.md\"));", "const debt = \"| ID | Sev | Found | Item | Status |\\n|---|---|---|---|---|\\n\" + Array.from({ length: 19 }, (_, i) => `| D-${9000 + i} | gap | 2026-09-22 | planted by M0-109's control | M0 · open |`).join(\"\\n\") + \"\\n\";"],
              [HSUITE, "t(\"DEBT.md has debt rows to check\", rows.length > 0, true);", "t(\"DEBT.md has debt rows to check\", rows.length >= 20, true);"]] },
  { id: "HO", suite: "hygiene", want: "GREEN", reads: 19,
    title: "planning-hygiene, OVER-STRICTNESS: the same 19 planted rows under the corrected floor",
    patches: [[HSUITE, "const debt = read(join(DEV, \"DEBT.md\"));", "const debt = \"| ID | Sev | Found | Item | Status |\\n|---|---|---|---|---|\\n\" + Array.from({ length: 19 }, (_, i) => `| D-${9000 + i} | gap | 2026-09-22 | planted by M0-109's control | M0 · open |`).join(\"\\n\") + \"\\n\";"]] },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }

const selected = ARMS.filter((a) => !ONLY.length || ONLY.includes(a.id));
const unknown = ONLY.filter((id) => !ARMS.some((a) => a.id === id));
if (unknown.length || !selected.length) { console.log(`** no arm ${unknown.join(", ") || ONLY.join(", ")}`); process.exit(1); }
const rows = preflight("debt-floor.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map(([file, needle]) => ({ file, needle })) })),
  { fatalFor: selected.map((a) => a.id) });
const dead = rows.filter((r) => r.n !== r.want && selected.some((a) => a.id === r.id));
if (dead.length) { console.log(`** ${dead.length} anchor(s) of the selected arm(s) are not live — REFUSED TO ARM BLIND`); process.exit(1); }

function restore(id, file) {
  const s = SUBJECTS.get(file);
  fs.writeFileSync(file, s.pristine);
  const now = fs.readFileSync(file);
  const copy = path.join(PEN, `arm${id}--${s.name}`);
  let cmp = true;
  try { execFileSync("cmp", ["-s", file, copy]); } catch { cmp = false; }
  const ok = sha(now) === s.digest && cmp && now.length >= s.floorBytes;
  t(`arm ${id} · RESTORED ${s.name} byte-identically (${now.length} B, floor ${s.floorBytes}, sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  if (ok) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
  return ok;
}

/* ---------------------------------------------------------------- the run */
console.log("\n--- ARM BASELINE · nothing armed, both suites over the LIVE ledger ---");
for (const key of ["ledger", "hygiene"]) {
  const S = SUITES[key], s = await runSuite(key);
  t(`baseline · ${key} reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 50);
  t(`baseline · ${key}'s floor judged the LIVE ledger (${s.reads} row(s) printed, ${S.live} counted here) and PASSED by name`,
    s.reads === S.live && S.live > 0 && s.passed.includes(S.floor));
}
let armsRun = 0;
for (const a of selected) {
  const S = SUITES[a.suite];
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: ${a.want === "RED" ? `"${S.floor}" FAILS, and nothing else does`
    : a.absent ? `GREEN with the floor ABSENT — the liar passes, and nothing else catches an empty ledger`
    : `GREEN, "${S.floor}" PASSES`}; the floor judges ${a.reads} row(s); the suite reaches its foot`);
  fs.mkdirSync(PEN, { recursive: true });
  if (!fs.existsSync(PEN_IGNORE)) fs.writeFileSync(PEN_IGNORE, "*\n");
  const touched = [...new Set(a.patches.map(([file]) => file))];
  for (const file of touched) {
    const copy = path.join(PEN, `arm${a.id}--${SUBJECTS.get(file).name}`);
    fs.writeFileSync(copy, SUBJECTS.get(file).pristine); WRITTEN.add(copy);
  }
  const src = new Map(touched.map((f) => [f, SUBJECTS.get(f).pristine.toString("utf8")]));
  let armed = true;
  for (const [file, from, to] of a.patches) {
    const n = src.get(file).split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`    anchor matched ${n} time(s) in ${SUBJECTS.get(file).name}`); break; }
    src.set(file, src.get(file).replace(from, () => to));
  }
  t(`arm ${a.id} · ARMED (${a.patches.length} patch${a.patches.length === 1 ? "" : "es"}, each matched exactly once)`, armed);
  if (armed) {
    for (const [file, text] of src) fs.writeFileSync(file, text);
    const s = await runSuite(a.suite);
    armsRun++;
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail, exit ${s.code}) — a crash is not a result`, s.foot);
    t(`arm ${a.id} · the plant reached the floor: it judged ${s.reads} row(s), ${a.reads} planted`, s.reads === a.reads);
    let as = true;
    if (a.want === "RED") {
      t(`arm ${a.id} · the suite went RED`, s.fail > 0 && s.code !== 0);
      t(`arm ${a.id} · FAILS BY NAME: "${S.floor}"`, s.failed.includes(S.floor));
      as = s.failed.length === 1 && s.failed[0] === S.floor;
      t(`arm ${a.id} · ...and NOTHING ELSE fails — the red is the floor's, not collateral`, as);
    } else {
      t(`arm ${a.id} · the suite stayed GREEN`, s.fail === 0 && s.code === 0);
      if (a.absent) t(`arm ${a.id} · the floor is ABSENT from the run — neither PASS nor FAIL names it`, !s.passed.includes(S.floor) && !s.failed.includes(S.floor));
      else t(`arm ${a.id} · PASSES BY NAME: "${S.floor}"`, s.passed.includes(S.floor));
      as = s.fail === 0 && s.code === 0;
    }
    console.log(`    ACTUAL: ${s.pass} pass, ${s.fail} fail, exit ${s.code}; judged ${s.reads} row(s); failing: ${s.failed.map((l) => l.slice(0, 80)).join(" | ") || "none"}`
      + `${as ? "" : " — NOT AS DECLARED"}`);
  }
  for (const file of touched) if (!restore(a.id, file)) { console.log("** a restore did not verify; stopping before the next arm measures an unsound tree"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored, both suites over the LIVE ledger again ---");
for (const key of ["ledger", "hygiene"]) {
  const s = await runSuite(key);
  t(`closing · ${key} is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0);
}
for (const [p, s] of SUBJECTS) t(`closing · ${s.name} is the pristine file (sha256 ${s.digest.slice(0, 12)}…)`, sha(fs.readFileSync(p)) === s.digest);
t(`closing · the live DEBT.md was never written (sha256 ${sha(LEDGER_BYTES).slice(0, 12)}…)`, sha(fs.readFileSync(DEBT_MD)) === sha(LEDGER_BYTES));
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY.length ? "" : ` · ${DECLARED_ARMS} declared`}`,
  armsRun === selected.length && (ONLY.length > 0 || armsRun === DECLARED_ARMS));
console.log(`\ndebt-floor.control: ${pass} pass, ${fail} fail  (${armsRun} arm(s) run of ${DECLARED_ARMS} declared, plus a baseline)`);
process.exit(fail ? 1 : 0);
