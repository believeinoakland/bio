#!/usr/bin/env node
/* d270-reach.control.mjs — THE NEGATIVE CONTROL DRIVER for `d270-reach.test.mjs`.
 *
 * NOT a `.test.mjs`, deliberately: it EDITS REAL SOURCES while it runs and the
 * battery must not discover it (PL-3's, PL-4's, PL-11's, REC-73's and D-262's
 * precedent). Run it by hand:  node bio-plane/test/d270-reach.control.mjs
 *
 * THE ARMS ARE DECLARED IN THE SUBJECT SUITE'S HEADER, before any of them were
 * armed. This file arms them ONE AT A TIME, others held open, restores each by
 * COPYING BACK a UNIQUELY-NAMED per-arm pristine copy, and verifies the restore
 * by sha256 AND by content (`cmp`), printing a byte count under a guarded
 * minimum. A BASELINE arm runs FIRST so a run in which every arm reports the
 * same thing is distinguishable from a run in which the arms worked — a harness
 * whose first run reported `null` for every arm INCLUDING the baseline is a real
 * receipt in this repository, and only the baseline row told the two apart.
 *
 * EVERY PATCH IS ASSERTED TO HAVE MATCHED EXACTLY ONCE. An arm that never armed
 * is a finding, not a pass — patches matching zero times, anchors occurring
 * twice and writes to paths a worktree lacks are all measured receipts here.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const SUITE = join(DIR, "d270-reach.test.mjs");
const INDEX = join(PLANE, "src", "index.mjs");
const CHECKS = join(PLANE, "checks", "bio-checks.mjs");
/* THE PRISTINE COPIES LIVE INSIDE THIS WORKTREE and never in the shared
   scratchpad — two workers reported the scratchpad is not isolated between
   sessions, and a restore read from a path another session can write is not a
   restore. */
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = { [INDEX]: 200000, [CHECKS]: 300000, [SUITE]: 15000 };

let armsRun = 0, asDeclared = 0;
const rows = [];

function pristineFor(arm, file) { return `${file}.pristine-${arm}`; }

function withArm(arm, edits, run) {
  /* edits: [{file, find, replace}] — `find` MUST match exactly once. */
  const files = [...new Set(edits.map((e) => e.file))];
  for (const f of files) copyFileSync(f, pristineFor(arm, f));
  let armed = true;
  try {
    for (const e of edits) {
      const src = readFileSync(e.file, "utf8");
      const n = src.split(e.find).length - 1;
      if (n !== 1) {
        console.log(`  ARM ${arm}: PATCH MATCHED ${n} TIME(S), NOT 1 — THE ARM DID NOT ARM. That is a `
                  + `finding about this harness, not a pass for the subject.`);
        armed = false;
        break;
      }
      writeFileSync(e.file, src.replace(e.find, e.replace));
    }
    if (!armed) return { armed: false };
    return run();
  } finally {
    for (const f of files) {
      const p = pristineFor(arm, f);
      copyFileSync(p, f);
      const same = sha(f) === sha(p);
      const cmp = spawnSync("cmp", ["-s", f, p]).status === 0;
      const bytes = statSync(f).size;
      const floored = bytes >= (MIN_BYTES[f] ?? 1000);
      console.log(`     restore ${f.replace(PLANE, "bio-plane")}: sha256 ${same ? "OK" : "MISMATCH"} · `
                + `cmp ${cmp ? "OK" : "DIFFER"} · ${bytes} bytes ${floored ? "(above floor)" : "(BELOW FLOOR)"}`);
      if (!same || !cmp || !floored) { console.log("  RESTORE FAILED — STOPPING."); process.exit(2); }
      unlinkSync(p);
    }
  }
}

function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" });
  const out = `${r.stdout}\n${r.stderr}`;
  const m = /^(OK|FAILED)\s+(\d+) pass, (\d+) fail/m.exec(out);
  /* A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0. A TypeError inside an
     assertion goes through no assertion at all and ends the module while the
     tally reads clean; WORKER.md names it, and D-262's arm (d) met it. */
  return m ? { verdict: m[1], pass: +m[2], fail: +m[3], out }
           : { verdict: "NO TALLY", pass: -1, fail: -1, out };
}

function record(arm, label, declared, res) {
  armsRun++;
  const actual = res.armed === false ? "DID NOT ARM"
               : res.verdict === "OK" ? "GREEN" : res.verdict === "FAILED" ? "RED" : "NO TALLY";
  const ok = actual === declared;
  if (ok) asDeclared++;
  rows.push({ arm, label, declared, actual, pass: res.pass ?? -1, fail: res.fail ?? -1, ok });
  console.log(`  ARM ${arm} — ${label}\n     declared ${declared} · actual ${actual} `
            + `(${res.pass ?? -1} pass, ${res.fail ?? -1} fail)${ok ? "" : "   <<< NOT AS DECLARED"}`);
  if (!ok && res.out) console.log(res.out.split("\n").filter((l) => /FAIL|Error/.test(l)).slice(0, 8).join("\n"));
}

console.log("=== D-270 · negative control. Arms declared in d270-reach.test.mjs's header. ===\n");

/* ---- (a) BASELINE. Nothing armed. */
{
  const res = runSuite();
  record("a", "BASELINE — nothing armed", "GREEN", res);
  if (res.verdict !== "OK") { console.log("BASELINE IS NOT GREEN. Nothing below can be read."); process.exit(2); }
}

/* ---- (b) THE SPLIT COLLAPSED. */
record("b", "THE SPLIT COLLAPSED — sessionOpGate's administrator branch removed, so all sixteen ops "
         + "answer the unattended code again (the one-sentence state, with a code bolted on)", "RED",
  withArm("b", [{ file: INDEX,
    find: `    if (SESSION_OPS.admin.has(op))
      return refusal("SESSION_ROLE_CANNOT_REACH_OP",`,
    replace: `    if (false && SESSION_OPS.admin.has(op))
      return refusal("SESSION_ROLE_CANNOT_REACH_OP",` }], runSuite));

/* ---- (c) THE SENTENCE IS REPLACED. RE-DECLARED — the first declaration (a
   site/catalogue DIVERGENCE) came back GREEN and could never have been
   honoured: this family's sites read the row at RUNTIME, so there is one source
   and editing it moves both sides of the equality together. The arm was right
   and the declaration was wrong. It now targets the CONTENT assertions, which
   grade the sentence against literals in the suite rather than against itself —
   and those assertions exist BECAUSE of this arm. */
record("c", "THE SENTENCE IS REPLACED — the CATALOGUE's translation for "
         + "SESSION_CANNOT_REACH_UNATTENDED_OP is edited to a well-formed sentence that says "
         + "something else. Must fail on the CONTENT assertions, which do not read the catalogue",
  "RED",
/* THE WHOLE CONCATENATION, NOT ITS FIRST LINE. The first spelling of this patch
   replaced only line one of a five-line `+` concatenation and the arm came back
   GREEN a SECOND time — the graded words (`containment`, `credential`) were on
   the lines it left behind, so the arm matched exactly once, armed, and could
   not have been honoured. An arm that did not really arm is a finding about the
   harness; recorded here rather than smoothed. */
  withArm("c", [{ file: CHECKS,
    find: `    translation: 'This operation is not one a person drives from a browser at all. It belongs to the '
      + 'unattended side of this instance — the scheduled and machine-driven work — and it answers '
      + 'only to a credential held by the hosting account, never to a signed-in session. That is a '
      + 'containment choice rather than a judgement about you: no amount of standing in this group '
      + 'turns a session into that credential.',`,
    replace: `    translation: 'A well-formed sentence planted by the control arm, long enough to clear every '
      + 'length and word-count bar this catalogue sets, saying nothing whatever about why the thing '
      + 'that was asked for did not happen on this occasion.',` }],
    runSuite));

/* ---- (d) A CODE GOES BACK TO BEING CODELESS. */
record("d", "CODELESS AGAIN — requiredArgument's `reason`/`code` keys dropped, `error` left in place. "
         + "This is D-270's own defect re-armed", "RED",
  withArm("d", [{ file: INDEX,
    find: `    return { ok: false, reason: code, code, check: row.check, translation: row.translation,
             detail, error: said, op, ...(extra || {}) };`,
    replace: `    return { ok: false, check: row.check, translation: row.translation,
             detail, error: said, op, ...(extra || {}) };` }], runSuite));

/* ---- (e) THE OP WALK GOES BLIND. */
record("e", "THE OP WALK GOES BLIND — the OPS parse in the SUITE neutered. Must fail on the CORPUS "
         + "FLOOR, before any membership claim is made over the empty set", "RED",
  withArm("e", [{ file: SUITE,
    find: `const OP_ROWS = [...OPS_BLOCK.matchAll(/^ {2}([a-z0-9]+):\\s*\\{\\s*classes:\\s*(null|\\[([^\\]]*)\\]),\\s*mutating:\\s*(true|false)/gm)]`,
    replace: `const OP_ROWS = [...OPS_BLOCK.matchAll(/^ {2}(zzzznope[a-z0-9]+):\\s*\\{\\s*classes:\\s*(null|\\[([^\\]]*)\\]),\\s*mutating:\\s*(true|false)/gm)]` }],
    runSuite));

/* ---- (f) THE ADMIN SESSION IS NOT ONE. This suite's OWN measured mistake. */
record("f", "THE ADMIN ARM IS NOT ONE — pointed back at a member session, exactly the mistake this "
         + "item's measurement harness made twice. Must fail on the ARM-IS-REAL assertion rather than "
         + "silently measuring a split of zero", "RED",
  withArm("f", [{ file: SUITE,
    find: `const ADMIN = alg.token;`,
    replace: `const ADMIN = MEMBER; void alg;` }], runSuite));

/* ---- (g) OVER-STRICTNESS. Correct work in an unanticipated spelling. */
record("g", "OVER-STRICTNESS — a REAL site (tokenClassGate) rewritten to spell its code in `code` "
         + "with NO `reason`, the row IMPORTED rather than hand-copied, an extra key the grader has "
         + "never seen. It MUST PASS", "GREEN",
  withArm("g", [{ file: INDEX,
    find: `    return { error: { ok: false, reason: code, code, check: row.check, translation: row.translation,
                      detail, error, op, ...(extra || {}) } };
  };
  const admitted = Array.isArray(spec.classes) && spec.classes.includes(cls);`,
    replace: `    return { error: { ok: false, code, check: row.check, translation: row.translation,
                      detail, error, op, sigil: 7, ...(extra || {}) } };
  };
  const admitted = Array.isArray(spec.classes) && spec.classes.includes(cls);` }], runSuite));

console.log(`\n=== ${asDeclared} of ${armsRun} arm(s) came back AS DECLARED ===`);
for (const r of rows)
  console.log(`  ${r.ok ? " " : ">"} ${r.arm}  declared ${r.declared.padEnd(6)} actual ${String(r.actual).padEnd(11)} `
            + `${r.pass} pass, ${r.fail} fail   ${r.label.slice(0, 60)}`);
/* Verify the tree is byte-identical to git's idea of it, as the last word. */
try {
  const dirty = execFileSync("git", ["status", "--porcelain", "--", INDEX, CHECKS, SUITE],
                             { cwd: PLANE, encoding: "utf8" }).trim();
  console.log(`\ngit sees ${dirty ? "CHANGES in the three armed files:\n" + dirty : "the three armed files as this run found them"}`);
} catch (e) { console.log(`\ngit check unavailable: ${e.message}`); }
process.exit(asDeclared === armsRun ? 0 : 1);
