#!/usr/bin/env node
/* CPDF-13 — THE NEGATIVE-CONTROL DRIVER. Deliberately NOT a `.test.mjs`: it
 * EDITS REAL SOURCES, so the battery must not discover it.
 *
 *     node test/calibration.control.mjs            # baseline + every arm
 *     node test/calibration.control.mjs regrade    # one arm alone
 *
 * THE DISCIPLINE, and every line of it is a receipt from WORKER.md rather than
 * a style:
 *
 *   - EACH ARM IS ARMED ALONE, with every other defence held open. An arm that
 *     shares a tree with another proves nothing about either.
 *   - THE BASELINE IS AN ARM. A harness whose first run reported `null` for
 *     every arm INCLUDING the baseline is on the record; only the baseline row
 *     distinguishes four-arms-broken from four-arms-working.
 *   - A MISSING TALLY IS REPORTED AS -1, NEVER 0. A TypeError inside an
 *     assertion goes through no assertion at all — it ends the module while the
 *     count still reads clean — so the FOOT line is read and its absence is
 *     reported as the finding it is.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, against a
 *     UNIQUELY-NAMED PER-ARM pristine copy taken INSIDE THIS WORKTREE. Never a
 *     shared scratchpad: PL-10's harness was overwritten mid-turn by a
 *     concurrent worker, and UI-38 met an NC harness reporting a byte-identical
 *     restore over a file it had not restored. A byte count is printed and a
 *     minimum is guarded, because two harnesses have reported a clean restore
 *     over an EMPTY file (`e3b0c442…`, the sha256 of the empty string).
 *   - EVERY PATCH ASSERTS IT MATCHED EXACTLY ONCE. An arm that never armed is a
 *     finding, and this repository has met four of them.
 *   - OUTPUT GOES TO A FILE, NEVER A PIPE (D-282): a suite's `process.exit()`
 *     discards unflushed pipe writes, which is how an arm came back `-1` for a
 *     reason that had nothing to do with the arm.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, openSync, closeSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PRISTINE = join(HERE, ".cpdf13-pristine");   /* INSIDE this worktree */
const OUT = join(HERE, ".cpdf13-out");
const SUITE = join(HERE, "calibration.test.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const abs = (rel) => join(ROOT, rel);

/* ------------------------------------------------------------------ *
 * THE ARMS. Each names the file it edits, the exact patch, and — BEFORE it is
 * run — what MUST fail and what MUST NOT. Declared here rather than in the
 * report, so the declaration cannot be written after the measurement.
 * ------------------------------------------------------------------ */
const ARMS = {
  /* (a) THE ITEM'S NEGATIVE CONTROL (1). Make the drift handler RE-GRADE.
     ARMED BY ADDING CODE, because there is nothing to remove: the handler
     writes nothing at all, so a defect has to be BUILT to expose one. The write
     inserted is the one a well-meaning author would write — the engine got
     worse, so lower the cap on the text it produced — and it is wrong for the
     reason DEC-4 gives rather than for a technical one.
     MUST FAIL: the two "NO MACHINE MINTS A GRADE (DEC-4)" assertions.
     MUST NOT FAIL: everything about the OBLIGATION — it is still raised, still
     names exactly the right transcription, and still names both caps. That is
     the point of the arm: re-grading and naming-the-work are separable, and the
     suite must be pinning the second rather than merely the first. */
  regrade: {
    file: "src/store.mjs",
    find: `      const obligations = d.raises_obligation
        ? this.#calDriftFor(prev.calibration_id) : [];`,
    repl: `      const obligations = d.raises_obligation
        ? this.#calDriftFor(prev.calibration_id) : [];
      /* NEGATIVE CONTROL ARM (a) — THE DEFECT, INSERTED. */
      if (d.raises_obligation)
        for (const o of obligations)
          this.sql.exec(\`UPDATE reading_text_source SET derivation_cap=? WHERE capture_sha=?\`,
                        cal.cap, o.capture_sha);`,
    mustFail: ["NO MACHINE MINTS A GRADE (DEC-4)"],
    mustPass: ["op=calibrationdrift names EXACTLY", "IT RAISES A RE-EVALUATION OBLIGATION"],
  },

  /* (b) THE ITEM'S NEGATIVE CONTROL (2). Let a CHANGELOG SIGNAL ALONE mark a
     calibration current, with no probe run. Armed by adding the path a
     well-meaning author would add: the vendor announced a release, so record
     that the engine now stands at that version and carry the last cap forward.
     It is wrong because the cap is a MEASUREMENT and nothing measured this one.
     MUST FAIL: the three "A CLAIM IS NOT A MEASUREMENT" assertions.
     MUST NOT FAIL: the refusal of a signal that CARRIES a cap, which is a
     different fence entirely and must still be standing. */
  changelog: {
    file: "src/store.mjs",
    find: `    const subject = this.#one(
      \`SELECT engine, version, probe_id, registered_at, last_probe_ms, enabled
         FROM calibration_subjects WHERE engine=?\`, sig.engine);`,
    repl: `    const subject = this.#one(
      \`SELECT engine, version, probe_id, registered_at, last_probe_ms, enabled
         FROM calibration_subjects WHERE engine=?\`, sig.engine);
    /* NEGATIVE CONTROL ARM (b) — THE DEFECT, INSERTED: an announcement mints a
       "current" calibration with no probe behind it, carrying the last cap. */
    {
      const live = this.#calibrationCurrent(sig.engine);
      if (live) {
        const nid = this.#mintCalibrationId();
        this.sql.exec(
          \`INSERT INTO calibrations
             (calibration_id,engine,version,at,at_ms,cap,probe_id,probe_inputs,scores,measured_by,note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)\`,
          nid, sig.engine, live.version, observed, now, live.cap,
          "announcement", "{}", "{}", sig.source, "from a changelog");
        this.sql.exec(\`UPDATE reading_text_source SET derivation_cap=? WHERE capture_sha=?\`,
                        cal.cap, o.capture_sha);`,
    mustFail: ["NO MACHINE MINTS A GRADE (DEC-4)"],
    mustPass: ["op=calibrationdrift names EXACTLY", "IT RAISES A RE-EVALUATION OBLIGATION"],
  },

  /* (b) THE ITEM'S NEGATIVE CONTROL (2). Let a CHANGELOG SIGNAL ALONE mark a
     calibration current, with no probe run. Armed by adding the path a
     well-meaning author would add: the vendor announced a release, so record
     that the engine now stands at that version and carry the last cap forward.
     It is wrong because the cap is a MEASUREMENT and nothing measured this one.
     MUST FAIL: the three "A CLAIM IS NOT A MEASUREMENT" assertions.
     MUST NOT FAIL: the refusal of a signal that CARRIES a cap, which is a
     different fence entirely and must still be standing. */
  changelog: {
    file: "src/store.mjs",
    find: `    const subject = this.#one(
      \`SELECT engine, version, probe_id, registered_at, last_probe_ms, enabled
         FROM calibration_subjects WHERE engine=?\`, sig.engine);`,
    repl: `    const subject = this.#one(
      \`SELECT engine, version, probe_id, registered_at, last_probe_ms, enabled
         FROM calibration_subjects WHERE engine=?\`, sig.engine);
    /* NEGATIVE CONTROL ARM (b) — THE DEFECT, INSERTED: an announcement mints a
       "current" calibration with no probe behind it, carrying the last cap. */
    {
      const live = this.#calibrationCurrent(sig.engine);
      if (live) {
        const nid = this.#mintCalibrationId();
        this.sql.exec(
          \`INSERT INTO calibrations
             (calibration_id,engine,version,at,at_ms,cap,probe_id,probe_inputs,scores,measured_by,note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)\`,
          nid, sig.engine, live.version, observed, now, live.cap,
          "announcement", "{}", "{}", sig.source, "from a changelog");
        /* replaced_by, not superseded_by — D-221's total version-edge sweep
           reserves that word in the schema and the column was renamed for it.
           THIS ARM WAS BROKEN BY THAT RENAME AND THE HARNESS CAUGHT IT: the
           insert referenced a column that no longer existed, the store threw,
           the suite DIED, and the driver reported -1 pass / -1 fail / foot
           false rather than a confident zero. An arm that crashes its subject
           measures nothing, and the only reason that was visible is the -1. */
        this.sql.exec(\`UPDATE calibrations SET replaced_by=?, drift=? WHERE calibration_id=?\`,
                      nid, "same", live.calibration_id);
      }
    }`,
    mustFail: ["A CLAIM IS NOT A MEASUREMENT"],
    mustPass: ["an announcement carrying a FIDELITY is refused at the door"],
  },

  /* (c) RULE 4's DIRECTION. Let a signal set the instant unconditionally instead
     of taking the minimum against the cadence's own — i.e. let an announcement
     PUSH A PROBE OUT as well as pull it in. This is the plausible mistake, not
     a malicious one: "no announcement, so nothing changed, so wait longer".
     MUST FAIL: the two "cannot push it out" assertions (pure and through-op).
     MUST NOT FAIL: the SHORTENING arms — the watch must still accelerate. */
  /* TWO SITES, ARMED TOGETHER, AND THE REASON IS A MEASURED FINDING ABOUT THE
     DESIGN RATHER THAN A CONVENIENCE — recorded here because a surprise is a
     finding about the arm and must not be smoothed. The first run of this arm
     patched ONLY the loop's `<` comparison and the suite came back 110/0:
     NOTHING FAILED. Rule 4 is enforced TWICE — once by the comparison, which
     only ever pulls the instant in, and once by the closing
     `Math.min(at, cadenceAt)`, which clamps whatever the loop produced. Either
     guard alone makes the other unfalsifiable through the function, so arming
     one alone proves nothing and PASSES FOR FREE.
     The redundancy is deliberate defence in depth and is worth keeping: the
     comparison is a rule about how a signal is CONSIDERED, and the clamp is a
     rule about what may be RETURNED, and only the second still holds if a later
     edit adds a second way for a signal to reach `at`. They are armed together
     for the reason textchain.test.mjs's D-252 block records for its own pair. */
  delay: {
    file: "src/calibration.mjs",
    patches: [
      [`    if (by < at) { at = by; from = "signal"; }`,
       `    if (by !== at) { at = by; from = "signal"; }   /* NC ARM (c) — DEFECT, SITE 1 */`],
      [`  return { at: Math.min(at, cadenceAt), from,`,
       `  return { at, from,   /* NC ARM (c) — DEFECT, SITE 2 (the clamp removed) */`],
    ],
    /* THE NEEDLES ARE THE LABELS VERBATIM. The first draft spelled one of them
       from memory ("cannot push it out" against an assertion that actually reads
       "cannot push the interval out") and the driver reported must-fail seen
       1/2 — an arm scored NOT-AS-DECLARED by its own harness's typo rather than
       by anything about the subject. Recorded because it is the same class as
       an arm that never armed: the instrument was wrong, not the code. */
    mustFail: ["A SIGNAL ASKING LATER CANNOT PUSH IT OUT",
               "a signal asking for a LATER probe cannot push the interval out"],
    mustPass: ["a signal asking EARLIER pulls it in", "IT SHORTENED the interval"],
  },

  /* (d) THE OVER-STRICTNESS ARM, and WORKER.md requires one on every control
     block: correct work in a spelling the author did not anticipate must PASS.
     Here the fence is tightened so probe inputs must be an OBJECT, rejecting
     the JSON-string spelling a perfectly honest caller writes. A fence tighter
     than its rule is not a safer fence — it is an undeclared interface change
     wearing the costume of caution.
     MUST FAIL: the OVER-STRICTNESS assertion, which is what proves that
     assertion is load-bearing rather than decorative.
     MUST NOT FAIL: every real refusal — the fence must still refuse what it
     exists to refuse, or the arm has measured nothing. */
  /* THE FIRST DRAFT OF THIS ARM WAS TOO BROAD AND THE HARNESS CAUGHT IT, which
     is recorded rather than quietly corrected. It tightened the shared
     `present` predicate to require an OBJECT — and `probe_id` is a STRING and
     rides that same predicate, so EVERY valid calibration was refused, the
     suite DIED downstream, and the driver reported `-1 pass / -1 fail / foot
     false`. That -1 is the whole reason a missing tally is never reported as 0:
     a harness that trusted a count would have read a beautiful zero-failure run
     off a module that never reached its own foot.
     THE REPLACEMENT IS NARROW, which is what an over-strictness arm has to be:
     it refuses fields the construct does not recognise, which is the classic
     shape of a fence tighter than its rule — perfectly correct callers carrying
     an operator's note are turned away, and nothing that should be refused
     stops being refused. */
  overstrict: {
    file: "src/calibration.mjs",
    patches: [
      [`  if (!(typeof c.measured_by === "string" && c.measured_by.trim()))`,
       `  for (const k of Object.keys(c))   /* NC ARM (d) — A FENCE TIGHTER THAN ITS RULE */
    if (!["calibration_id","engine","version","at","cap","probe_id","probe_inputs",
          "scores","measured_by"].includes(k))
      return refusal("CAL_SHAPE", \`unknown field '\${k}'\`);
  if (!(typeof c.measured_by === "string" && c.measured_by.trim()))`],
    ],
    mustFail: ["OVER-STRICTNESS: extra fields the construct does not know are not refused"],
    mustPass: ["a well-formed calibration passes", "NO PROBE ID -> refused",
               "NO SCORES -> refused", "cap: null is LEGAL"],
  },
};

/* ------------------------------------------------------------------ *
 * The runner
 * ------------------------------------------------------------------ */
function snapshot(arm) {
  mkdirSync(PRISTINE, { recursive: true });
  const rel = ARMS[arm].file;
  const buf = readFileSync(abs(rel));
  /* UNIQUELY NAMED PER ARM. A shared pristine copy is how a restore comes to
     verify against something another arm wrote. */
  const dest = join(PRISTINE, `${arm}__${rel.replace(/[\/]/g, "_")}`);
  writeFileSync(dest, buf);
  return { rel, dest, bytes: buf.length, digest: sha(buf) };
}

function restore(snap) {
  const pristine = readFileSync(snap.dest);
  writeFileSync(abs(snap.rel), pristine);
  const back = readFileSync(abs(snap.rel));
  const okSha = sha(back) === snap.digest;
  /* AND BY CONTENT, which is the check that catches a digest computed over the
     wrong bytes. `cmp` is a second implementation of the same question. */
  let okCmp = false;
  try { execFileSync("cmp", ["-s", abs(snap.rel), snap.dest]); okCmp = true; } catch { okCmp = false; }
  const bytes = back.length;
  /* THE FLOOR. Two harnesses have reported a clean restore over an EMPTY
     manifest, caught only because a digest read e3b0c442… */
  const floored = bytes >= 1000;
  console.log(`    restore ${snap.rel}: ${bytes} bytes · sha256 ${okSha ? "MATCH" : "MISMATCH"}`
            + ` · cmp ${okCmp ? "IDENTICAL" : "DIFFERS"} · floor(>=1000) ${floored ? "ok" : "FAILED"}`);
  if (!(okSha && okCmp && floored)) {
    console.log(`    FATAL: restore not verified — ABORTING rather than warning`);
    process.exit(2);
  }
}

function runSuite(label) {
  mkdirSync(OUT, { recursive: true });
  const path = join(OUT, `${label}.txt`);
  /* TO A FILE, NOT A PIPE (D-282). */
  const fd = openSync(path, "w");
  spawnSync(process.execPath, [SUITE], { cwd: ROOT, stdio: ["ignore", fd, fd] });
  closeSync(fd);
  const text = readFileSync(path, "utf8");
  const m = /calibration: (\d+) passed, (\d+) failed/.exec(text);
  const foot = !!m && !/NEVER REACHED ITS FOOT/.test(text);
  /* A MISSING TALLY IS -1, NEVER 0. */
  return { pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, foot, text, path };
}

function failedLabels(text) {
  return text.split("\n").filter((l) => /^\s{2}FAIL\s/.test(l)).map((l) => l.replace(/^\s{2}FAIL\s+/, ""));
}

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.log(`no such arm: ${only}`); process.exit(2); }

console.log("=== CPDF-13 NEGATIVE CONTROL ===");
console.log("\n-- BASELINE (nothing armed) --");
const base = runSuite("baseline");
console.log(`    ${base.pass} pass / ${base.fail} fail · foot ${base.foot} · ${base.path}`);
if (base.fail !== 0 || !base.foot) {
  console.log("    FATAL: the baseline is not green — every arm below would be unreadable");
  process.exit(2);
}

let surprises = 0;
for (const name of names) {
  const arm = ARMS[name];
  console.log(`\n-- ARM ${name} (${arm.file}) --`);
  console.log(`   DECLARED must-fail: ${arm.mustFail.join(" | ")}`);
  console.log(`   DECLARED must-pass: ${arm.mustPass.join(" | ")}`);
  const snap = snapshot(name);
  let src = readFileSync(abs(arm.file), "utf8");
  /* EVERY PATCH MUST MATCH EXACTLY ONCE. An arm that never armed is a finding,
     and this repository has met four of them (patch matched zero times; anchor
     occurred twice; wrote to a path a worktree's gitdir lacks). An arm with
     SEVERAL patches is armed as ONE arm — see `delay`, where two sites enforce
     one rule and either alone is unfalsifiable. */
  const patches = arm.patches || [[arm.find, arm.repl]];
  for (const [find, repl] of patches) {
    const hits = src.split(find).length - 1;
    console.log(`    patch anchor matched ${hits} time(s)`);
    if (hits !== 1) {
      console.log(`    FATAL: an arm that did not arm (or armed twice) proves nothing — ABORTING`);
      restore(snap);
      process.exit(2);
    }
    src = src.replace(find, repl);
  }
  writeFileSync(abs(arm.file), src);
  const r = runSuite(name);
  console.log(`    MEASURED ${r.pass} pass / ${r.fail} fail · foot ${r.foot} · ${r.path}`);
  const fails = failedLabels(r.text);
  const gotMustFail = arm.mustFail.filter((needle) => fails.some((f) => f.includes(needle)));
  const brokeMustPass = arm.mustPass.filter((needle) => fails.some((f) => f.includes(needle)));
  console.log(`    failing labels: ${fails.length ? fails.map((f) => `"${f.slice(0, 72)}"`).join("; ") : "(none)"}`);
  const asDeclared = gotMustFail.length === arm.mustFail.length && brokeMustPass.length === 0
                  && r.fail > 0 && r.foot;
  console.log(`    AS DECLARED: ${asDeclared ? "YES" : "NO"}`
            + (asDeclared ? "" : `  (must-fail seen ${gotMustFail.length}/${arm.mustFail.length}`
                               + `, must-pass broken ${brokeMustPass.length})`));
  if (!asDeclared) surprises++;
  restore(snap);
}

console.log("\n-- RESTORED BASELINE (the arms left nothing behind) --");
const after = runSuite("after");
console.log(`    ${after.pass} pass / ${after.fail} fail · foot ${after.foot}`);
if (after.pass !== base.pass || after.fail !== 0) {
  console.log("    FATAL: the tree did not come back to where it started");
  process.exit(2);
}
if (existsSync(PRISTINE)) rmSync(PRISTINE, { recursive: true, force: true });
console.log(`\n=== ${names.length} arm(s) run · ${surprises} came back OTHER THAN DECLARED ===`);
/* A SURPRISE IS A FINDING ABOUT THE ARM AND IS REPORTED, NOT SMOOTHED — but it
   does not fail this driver, because the driver's job is to measure. */
process.exit(0);
