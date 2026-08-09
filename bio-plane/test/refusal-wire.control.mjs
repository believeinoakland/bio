#!/usr/bin/env node
/* refusal-wire.control.mjs — D-262's NEGATIVE CONTROL DRIVER.
 *
 * NOT a `.test.mjs` ON PURPOSE: it EDITS REAL SOURCES while it runs, and the
 * battery discovers `.test.mjs` by name. PL-3, PL-4, PL-11 and REC-73 all landed
 * their destructive drivers this way and this follows them.
 *
 *     node test/refusal-wire.control.mjs            (from bio-plane/)
 *
 * SEVEN ARMS, each armed ALONE with every other defence held OPEN, DECLARED
 * BEFORE ARMING (the declarations are in the subject suite's own
 * `NEGATIVE CONTROL:` header so the next session re-runs them in one step), and
 * every restore verified BY sha256 AND BY CONTENT (`cmp`) against a UNIQUELY
 * NAMED per-arm pristine copy — the name carries the ARM ID as well as the path,
 * because a shared pristine name is how a restore comes to vouch for the wrong
 * arm. Byte counts are printed and floored, and the digest is compared against
 * the sha256 OF THE EMPTY STRING: two harnesses in this repository once reported
 * a restore byte-identical over an EMPTY manifest.
 *
 * A BASELINE ARM RUNS FIRST. A driver whose first run reported `null` for every
 * arm INCLUDING the baseline is in this project's own receipts; only a baseline
 * row distinguishes six-arms-broken from six-arms-working.
 *
 * WHAT IT FOUND, 2026-08-09, worktree agent-a0afb13cbfcc0d6b9 — AND THE FIRST
 * RUN FOUND THE INSTRUMENT WRONG, WHICH IS WHY THE DRIVER EXISTS.
 * FIRST RUN: A GREEN 22/0 · B RED 18/4 · C RED 19/3 · **D `NO TALLY` (-1/-1),
 * DECLARED RED** · E RED 15/7 · F RED 21/1 · G GREEN 22/0. Arm d neuters the
 * catalogue harvest; with an empty catalogue every later block read
 * `ROWS.get(code).translation` on `undefined`, a `TypeError` ended the module,
 * and the tally never printed. THE ARM WAS RIGHT AND THE SUBJECT OF THE ARM —
 * this item's own instrument — WAS WRONG. Corrected in `refusal-wire.test.mjs`
 * (null-tolerant catalogue reads, and a corpus below its floor HALTS at the
 * floor with its tally printed) and re-run.
 * SECOND RUN: **ALL SEVEN AS DECLARED** — A GREEN 22/0 · B RED 18/4 · C RED
 * 19/3 · D RED 1/2 · E RED 15/7 · F RED 21/1 · G GREEN 22/0, and all three
 * files byte-identical to their pristine-of-record by sha256 AND by `cmp`.
 * The `NO TALLY` row is kept in this header on purpose: a driver that only ever
 * reported "as declared" would be a driver nobody could tell from a broken one.
 *
 * THE ARMS TOUCH THREE FILES AND SAY WHICH: `src/index.mjs` (the subject — the
 * decoration), `src/store.mjs` (a real refusal site, for the divergence and
 * over-strictness arms), and `test/refusal-wire.test.mjs` (the INSTRUMENT's own
 * walks, for the blindness arms). An arm that edits the instrument is testing
 * the instrument; an arm that edits the plane is testing the subject. Both are
 * needed and they are labelled.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const INDEX = join(ROOT, "src", "index.mjs");
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "refusal-wire.test.mjs");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MIN_BYTES = { [INDEX]: 100000, [STORE]: 500000, [SUITE]: 10000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => readFileSync(p).length;

/* THE PRISTINE OF RECORD, taken before any arm runs. Every per-arm copy is
   compared against it as well, so an arm that restores from a copy taken AFTER
   a previous arm leaked cannot pass unnoticed. */
const OF_RECORD = {};
for (const p of [INDEX, STORE, SUITE]) {
  const dst = `${p}.d262-of-record`;
  copyFileSync(p, dst);
  OF_RECORD[p] = { sha: sha(p), bytes: bytes(p), copy: dst };
  if (OF_RECORD[p].sha === EMPTY_SHA) throw new Error(`PRISTINE OF RECORD IS EMPTY: ${p}`);
  if (OF_RECORD[p].bytes < MIN_BYTES[p])
    throw new Error(`PRISTINE OF RECORD TOO SMALL: ${p} is ${OF_RECORD[p].bytes} bytes, floor ${MIN_BYTES[p]}`);
  console.log(`pristine-of-record  ${p.replace(ROOT + "/", "")}  ${OF_RECORD[p].bytes} bytes  sha ${OF_RECORD[p].sha.slice(0, 16)}…`);
}

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, encoding: "utf8", timeout: 600000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = out.match(/\n(?:OK|FAILED)\s+(\d+) pass, (\d+) fail\s*$/);
  /* A `TypeError` inside an assertion goes through NO assertion at all: the
     module ends while the tally reads clean. A MISSING tally is reported as -1
     and never as 0, so "the suite did not reach its own foot" is distinguishable
     from "the suite reached its foot with nothing wrong". */
  return { pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, exit: r.status, out };
};

const results = [];
const arm = (id, label, file, patch, declared) => {
  const pristine = file ? `${file}.d262-arm-${id}` : null;
  if (file) copyFileSync(file, pristine);
  try {
    if (file) {
      const src = readFileSync(file, "utf8");
      const next = patch(src);
      if (next === src) throw new Error(`ARM ${id} NEVER ARMED — the patch matched zero times in ${file}`);
      writeFileSync(file, next);
    }
    const r = runSuite();
    const verdict = r.fail === 0 && r.pass > 0 ? "GREEN" : r.pass === -1 ? "NO TALLY" : "RED";
    results.push({ id, label, declared, actual: verdict, pass: r.pass, fail: r.fail, exit: r.exit, out: r.out });
    console.log(`\nARM ${id} — ${label}\n  declared ${declared} · actual ${verdict} · ${r.pass} pass, ${r.fail} fail · exit ${r.exit}`);
    if (verdict === "RED") {
      for (const line of r.out.split("\n").filter((l) => l.includes("FAIL  "))) console.log(`    ${line.trim().slice(0, 200)}`);
    }
  } finally {
    if (file) {
      copyFileSync(pristine, file);
      const back = sha(file), n = bytes(file);
      if (back === EMPTY_SHA) throw new Error(`ARM ${id} RESTORED AN EMPTY FILE`);
      if (n < MIN_BYTES[file]) throw new Error(`ARM ${id} RESTORE TOO SMALL: ${n} bytes`);
      if (back !== OF_RECORD[file].sha)
        throw new Error(`ARM ${id} RESTORE sha MISMATCH: ${back} vs of-record ${OF_RECORD[file].sha}`);
      /* sha256 AND content. `cmp` is the second, independent reader. */
      execFileSync("cmp", ["-s", file, OF_RECORD[file].copy]);
      console.log(`  restored ${file.replace(ROOT + "/", "")} — ${n} bytes · sha ${back.slice(0, 16)}… · cmp OK`);
      rmSync(pristine);
    }
  }
};

/* ---------------------------------------------------------------- ARM a */
arm("a", "BASELINE — nothing armed", null, null, "GREEN");

/* ---------------------------------------------------------------- ARM b
   THE SUBJECT, REMOVED. The decoration's CALL is deleted from `json()`; the
   helper stays defined and every refusal site is untouched. This is the state
   `main` was in before D-262 and it is the arm that proves this suite watches
   the WIRE and not the site. */
arm("b", "the decoration removed from json() — src/index.mjs (THE SUBJECT)", INDEX,
  (s) => s.replace("JSON.stringify(dec49Attach(o), null, 1)", "JSON.stringify(o, null, 1)"),
  "RED");

/* ---------------------------------------------------------------- ARM c
   THE DIVERGENCE. A real refusal site is given a translation the catalogue does
   NOT hold. The suite must FAIL naming it — and this single arm tests TWO
   properties at once: that the grade is an EQUALITY against the row rather than
   a presence check, and that the decoration FILLS rather than OVERWRITES. A
   decoration that overwrote would silently correct this into agreement and the
   suite would stay green, which is the arm coming back GREEN. */
arm("c", "a real site ships a translation the catalogue does not hold — src/store.mjs (THE SUBJECT)", STORE,
  (s) => s.replace('return { ok: false, reason: "MACHINE_CANNOT_CONCLUDE",\n               detail:',
                   'return { ok: false, reason: "MACHINE_CANNOT_CONCLUDE",\n               translation: "Computers are not allowed to do that.",\n               detail:'),
  "RED");

/* ---------------------------------------------------------------- ARM d
   THE CATALOGUE WALK GOES BLIND — in the INSTRUMENT. The corpus FLOOR must fail
   BEFORE any membership claim is made over the empty set. A headline totality
   assertion passing over an empty corpus has happened three times here. */
arm("d", "the catalogue harvest matches nothing — test/refusal-wire.test.mjs (THE INSTRUMENT)", SUITE,
  (s) => s.replace('Object.keys(CHECK_CATALOGUE).filter((k) => /_CHECKS$/.test(k)).sort()',
                   'Object.keys(CHECK_CATALOGUE).filter((k) => /_NOTHING_MATCHES_THIS$/.test(k)).sort()'),
  "RED");

/* ---------------------------------------------------------------- ARM e
   THE OP WALK GOES BLIND — in the INSTRUMENT. Same reason, other corpus: a walk
   that drives nothing reports zero violations, and zero violations reads as good
   news. */
arm("e", "the OPS parse matches nothing — test/refusal-wire.test.mjs (THE INSTRUMENT)", SUITE,
  (s) => s.replace('/^ {2}([a-z0-9]+):\\s*\\{\\s*classes:\\s*(null|\\[([^\\]]*)\\]),\\s*mutating:\\s*(true|false)/gm',
                   '/^ {2}(zzzznosuchop):\\s*\\{\\s*classes:\\s*(null|\\[([^\\]]*)\\]),\\s*mutating:\\s*(true|false)/gm'),
  "RED");

/* ---------------------------------------------------------------- ARM f
   A THIRTEENTH FENCE ARRIVES UNMEASURED. The fence set is harvested from
   `store.mjs`, never typed; dropping one from the harvest must fail, because a
   family that quietly shrinks is a family nobody is watching. */
arm("f", "one fence dropped out of the harvest — test/refusal-wire.test.mjs (THE INSTRUMENT)", SUITE,
  (s) => s.replace('/"(MACHINE_CANNOT_[A-Z_]+)"/g', '/"(MACHINE_CANNOT_(?!GROUND)[A-Z_]+)"/g'),
  "RED");

/* ---------------------------------------------------------------- ARM g
   OVER-STRICTNESS, ON A REAL SITE AND NOT A FIXTURE. A refusal that DOES carry
   its row, in a shape this suite was not written around — the row built AT the
   site, the code spelled in `code` with NO `reason` at all, the detail worded
   unlike anything REC-64 wrote, and an extra key the grader has never seen.
   IT MUST PASS. A grader that reports correct work as bare is worse than no
   grader, because it teaches the next author to route around it. */
arm("g", "a correct refusal in an UNANTICIPATED spelling — src/store.mjs (OVER-STRICTNESS)", STORE,
  (s) => {
    /* The row is IMPORTED rather than hand-copied, so this arm cannot pass by
       agreeing with a stale copy of a sentence — the equality has to cost
       something or it is not evidence. `MACHINE_FENCE_CHECKS` is not among
       store.mjs's imports today, so the arm adds it; both edits are ONE arm
       because they are one change. */
    const withImport = s.replace('import { ROUTE_MARK_CHECKS } from "../checks/bio-checks.mjs";',
      'import { ROUTE_MARK_CHECKS } from "../checks/bio-checks.mjs";\n'
    + 'import { MACHINE_FENCE_CHECKS } from "../checks/bio-checks.mjs";');
    if (withImport === s) throw new Error("ARM g NEVER ARMED — the import anchor matched zero times");
    return withImport.replace('return { ok: false, reason: "MACHINE_CANNOT_CONCLUDE",\n               detail:',
                   'return { ok: false, code: "MACHINE_CANNOT_CONCLUDE", check: "C-32.2",\n'
                 + '               translation: MACHINE_FENCE_CHECKS.MACHINE_CANNOT_CONCLUDE.translation,\n'
                 + '               posture: "closed", detail:');
  },
  "GREEN");

/* ------------------------------------------------------------------ FOOT */
console.log("\n================================================== D-262 CONTROL SUMMARY");
let wrong = 0;
for (const r of results) {
  const asDeclared = r.actual === r.declared;
  if (!asDeclared) wrong++;
  console.log(`  ARM ${r.id}  declared ${r.declared.padEnd(5)}  actual ${r.actual.padEnd(8)}  `
            + `${r.pass} pass / ${r.fail} fail  ${asDeclared ? "as declared" : "*** NOT AS DECLARED ***"}`);
}
for (const p of [INDEX, STORE, SUITE]) {
  const back = sha(p);
  console.log(`  final ${p.replace(ROOT + "/", "").padEnd(28)} ${bytes(p)} bytes · sha ${back.slice(0, 16)}… · `
            + `${back === OF_RECORD[p].sha ? "IDENTICAL to pristine-of-record" : "*** DRIFTED ***"}`);
  execFileSync("cmp", ["-s", p, OF_RECORD[p].copy]);
}
for (const p of [INDEX, STORE, SUITE]) if (existsSync(`${p}.d262-of-record`)) rmSync(`${p}.d262-of-record`);
console.log(`\n${wrong === 0 ? "ALL SEVEN ARMS AS DECLARED" : `${wrong} ARM(S) NOT AS DECLARED — record them, do not smooth them`}`);
process.exit(0);
