/* FW-13 — the negative-control arms for the RETIREMENT of a check, committed so
 * the next session RE-RUNS them in one step instead of re-deriving how to break
 * the subject. `check-firing.test.mjs` DECLARES them; this file arms them.
 * WIDENED BY FW-15 (2026-08-08) from the one retirement to EVERY row in
 * CHECK_RETIREMENTS — see the TARGETS table for why it was widened here rather
 * than copied into a second harness.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs, so the
 * battery must not discover it (`suggest.control.mjs` and `register.control.mjs`
 * set the precedent).
 *
 *   node test/retirement.control.mjs restore     put each retired check BACK, one at a time
 *   node test/retirement.control.mjs producer    grow a producer for each retired shape, one at a time
 *   node test/retirement.control.mjs neuter      blind the estate walk; REACH must fail
 *   node test/retirement.control.mjs overstrict  plant nothing; nothing may fail
 *   node test/retirement.control.mjs uncovered   a retired id with no arms; COMPLETENESS must fail
 *   node test/retirement.control.mjs all         each arm ALONE, in order
 *
 * EVERY PATH IS DERIVED FROM THIS FILE'S OWN LOCATION (M0-10: a harness rooted at
 * a hardcoded absolute path wiped a shared ground). Every restore is verified by
 * sha256 AND by a byte compare against a UNIQUELY NAMED PER-ARM pristine copy — a
 * harness that named two snapshots from the path alone overwrote the first with
 * the second (UI-38). Each arm is armed ALONE with the others held open, and
 * DECLARES BEFORE IT RUNS what must fail and what must not.
 *
 * AND THE PRISTINE CORPUS IS PRINTED AND FLOORED. Two harnesses have now reported
 * a restore byte-identical over an EMPTY manifest, caught only because a printed
 * digest read `e3b0c442…`, the sha256 of the empty string. So each snapshot prints
 * its byte count and refuses below a floor: a control that passes over nothing is
 * the failure this whole family exists to prevent. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));      // bio-plane/test
const PLANE = join(HERE, "..");                            // bio-plane
const WORK = join(PLANE, "..");                            // this worktree
const SNAP = join(WORK, ".retirement-control");            // INSIDE the worktree, never a shared scratchpad

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const SUITE = join(HERE, "check-firing.test.mjs");
const PRODUCER_HOST = join(PLANE, "src/cdx.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");

/* A per-ARM, per-PATH pristine copy. The arm name is in the filename because two
   arms touching the same file with one snapshot name is how a restore silently
   restores the WRONG bytes. */
function snapshot(arm, path) {
  mkdirSync(SNAP, { recursive: true });
  const bytes = readFileSync(path);
  if (bytes.length < 200) {
    console.error(`REFUSING: ${path} is ${bytes.length} bytes — a snapshot this small would prove nothing.`);
    process.exit(2);
  }
  const dest = join(SNAP, `${arm}--${path.slice(WORK.length + 1).replace(/[/\\]/g, "_")}.pristine`);
  writeFileSync(dest, bytes);
  console.log(`  pristine ${path.slice(WORK.length + 1)}: ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 8)}…`);
  return { dest, bytes, path };
}
function restore(s) {
  writeFileSync(s.path, s.bytes);
  const now = readFileSync(s.path), pristine = readFileSync(s.dest);
  const eq = sha(now) === sha(pristine) && now.equals(pristine);
  console.log(`  restored ${s.path.slice(WORK.length + 1)}: sha256 ${eq ? "EQUAL" : "**DIFFERENT**"} `
    + `${sha(now).slice(0, 8)}… · byte compare ${now.equals(pristine) ? "IDENTICAL" : "**DIFFERS**"}`);
  if (!eq) process.exit(2);
}

/* Run check-firing and report what it says. The FOOT LINE is read rather than the
   exit code alone: a TypeError inside an assertion ends the module through no
   assertion at all while a tally still reads clean, so a run whose foot line is
   missing is reported as UNREACHED-FOOT and never as a pass. */
function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /check-firing: (\d+) pass, (\d+) fail/.exec(out);
  const fails = out.split("\n").filter((l) => l.includes("FAIL")).map((l) => l.trim());
  if (!foot) return { reachedFoot: false, pass: null, fail: null, fails, code };
  return { reachedFoot: true, pass: +foot[1], fail: +foot[2], fails, code };
}
function report(r) {
  if (!r.reachedFoot) { console.log("  RESULT: **THE SUITE NEVER REACHED ITS FOOT** — no tally may be believed."); return; }
  console.log(`  RESULT: ${r.pass} pass, ${r.fail} fail (exit ${r.code})`);
  for (const l of r.fails) console.log(`    ${l}`);
}
const declare = (mustFail, mustNot) => {
  console.log(`  DECLARED MUST FAIL:     ${mustFail}`);
  console.log(`  DECLARED MUST NOT MOVE: ${mustNot}`);
};

/* ---------------------------------------------------------------- targets */

/* WIDENED BY FW-15, DELIBERATELY IN PLACE RATHER THAN BESIDE. FW-13 wrote arms
   (i) and (ii) against the one row CHECK_RETIREMENTS then held. FW-15 retired a
   second check, and a second harness for the second retirement is exactly the
   two-mechanisms-for-one-job failure CPDF-9 names — the next retirement would
   then have to guess which one to extend. So the two per-check arms are keyed by
   retired id here and run ONE ID AT A TIME, and everything else is unchanged.

   The CALL-SITE ANCHOR moved for the same reason. FW-13 spliced its plant before
   its own retirement comment; both retirement notes now share one comment block,
   and a statement spliced into the middle of a block comment is not a plant, it
   is a syntax error. Both plants therefore anchor on the surviving call BELOW the
   comment, which is one line that both retirements sit above and neither owns.
   The arm's MEANING is unchanged — one push under the retired id, at the place
   the retired check used to run — and it was re-run and re-recorded on the widening. */
const TARGETS = {
  'C-8.1': {
    item: 'FW-13', fn: '__plantedCitationRegister', path: 'data/citations.json',
    branch: "  if (!Array.isArray(reg?.claims)) findings.push(f('C-8.1', 'error', "
          + "'data/citations.json must be {\"claims\": [...]}'));\n",
  },
  'C-7.1': {
    item: 'FW-15', fn: '__plantedDeletionRecords', path: 'data/deletions.json',
    branch: "  if (!Array.isArray(reg?.records)) findings.push(f('C-7.1', 'error', "
          + "'data/deletions.json must be {\"records\": [...]}'));\n",
  },
};
const CALL_SITE = "    checkAppendOnly(ctx, findings);";
const eachTarget = (fn) => { for (const id of Object.keys(TARGETS)) fn(id, TARGETS[id]); };

/* ------------------------------------------------------------------ arms */

const ARMS = {
  /* (i) The item's own. Put the retired check BACK — one push under the retired
     id and a call site — and both directions of the retirement must bite. Run
     once per retired id, each plant ALONE and each restored before the next. */
  restore() {
    eachTarget((id, tgt) => {
      console.log(`\n=== ARM (i) RESTORE [${id}, ${tgt.item}] — the retired check put back ===`);
      declare(`the ${id} retirement arms (behavioural) AND the source arm naming the pushing line`,
        "every OTHER retired id's arms; the surviving `fires` arms; the estate arm — restoring a CHECK grows no PRODUCER");
      const s = snapshot(`arm-restore-${id}`, CHECKS);
      const src = readFileSync(CHECKS, "utf8");
      if (!src.includes(CALL_SITE)) { console.error("REFUSING: the call site is gone; arm cannot arm."); process.exit(2); }
      const planted = src
        .replace(CALL_SITE, `    ${tgt.fn}(ctx, findings);\n` + CALL_SITE)
        .replace("export const CHECK_RETIREMENTS = {",
          `function ${tgt.fn}(ctx, findings) {\n`
          + `  const raw = ctx.files.get('${tgt.path}');\n`
          + "  if (!raw) return;\n"
          + "  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; }\n"
          + tgt.branch
          + "}\n\nexport const CHECK_RETIREMENTS = {");
      if (planted === src) { console.error("REFUSING: nothing was planted — THE ARM NEVER ARMED."); process.exit(2); }
      writeFileSync(CHECKS, planted);
      report(runSuite());
      restore(s);
    });
  },

  /* (ii) The half no bundle-level assertion can see: a SECOND structure claiming
     what the record already holds, appearing in the estate while every
     behavioural arm stays green. Once per retired id, each ALONE. */
  producer() {
    eachTarget((id, tgt) => {
      console.log(`\n=== ARM (ii) PRODUCER [${id}, ${tgt.item}] — the retired shape grows a writer ===`);
      declare(`the ESTATE arm for ${id}, naming bio-plane/src/cdx.mjs BY FILE`,
        "every behavioural retirement arm, the source arm, the reach arms, the corpus floor, the OTHER id's estate arm");
      const s = snapshot(`arm-producer-${id}`, PRODUCER_HOST);
      writeFileSync(PRODUCER_HOST, readFileSync(PRODUCER_HOST, "utf8")
        + `\nexport const __PLANTED = "${tgt.path}";\n`);
      report(runSuite());
      restore(s);
    });
  },

  /* (iii) The arm that earns the REACH assertion: blind the estate walk and the
     clean-estate arm would pass over nothing at all. */
  neuter() {
    console.log("\n=== ARM (iii) NEUTER — the estate walk made blind ===");
    declare("the REACH arm: `the estate walk CATCHES a planted producer`",
      "the corpus floor and the clean-estate arm — which is exactly why a green there proves nothing alone");
    const s = snapshot("arm-neuter", SUITE);
    const src = readFileSync(SUITE, "utf8");
    const from = "const producersOf = (path, corpus) => corpus.filter((f) => f.text.includes(path))";
    if (!src.includes(from)) { console.error("REFUSING: the walk's definition moved; arm cannot arm."); process.exit(2); }
    writeFileSync(SUITE, src.replace(from,
      "const producersOf = (path, corpus) => corpus.filter((f) => f.text.includes(path) && false)"));
    report(runSuite());
    restore(s);
  },

  /* (iv) The over-strictness direction. Retirement means the shape is ORDINARY
     data, not forbidden data — a legitimate bundle must still pass. */
  overstrict() {
    console.log("\n=== ARM (iv) OVER-STRICTNESS — nothing planted, a legitimate register carried ===");
    declare("NOTHING", "everything: 0 fail, and the well-formed-register arm green inside the suite");
    report(runSuite());
  },

  /* (v) NEW WITH FW-15, and it exists because FW-15 added an assertion that
     nothing else would have proven bites. The suite now requires every row in
     CHECK_RETIREMENTS to declare behavioural arms; without this control that
     requirement is itself a rule nobody has seen fail. Delete one id's shapes
     and the COMPLETENESS arm must go red, naming the uncovered id — otherwise a
     future retirement could be recorded in the catalogue with no proof behind it
     and the whole block would still read green. */
  uncovered() {
    console.log("\n=== ARM (v) UNCOVERED — a retired id with no behavioural arms ===");
    declare("the COMPLETENESS arm `every row in CHECK_RETIREMENTS has behavioural arms declared here`, naming C-7.1",
      "nothing else structural — but C-7.1's own behavioural arms DISAPPEAR from the tally, so the pass count FALLS as well as one arm failing");
    const s = snapshot("arm-uncovered", SUITE);
    const src = readFileSync(SUITE, "utf8");
    const from = '  /* FW-15. Every branch C-7.1 refused, and the well-formed ledger it passed. */\n  "C-7.1": [';
    if (!src.includes(from)) { console.error("REFUSING: the C-7.1 shape list moved; arm cannot arm."); process.exit(2); }
    writeFileSync(SUITE, src.replace(from, '  "C-7.1__disabled": ['));
    report(runSuite());
    restore(s);
  },
};

const ORDER = ["restore", "producer", "neuter", "overstrict", "uncovered"];
const arm = process.argv[2] || "all";
if (arm === "all") { for (const k of ORDER) ARMS[k](); }
else if (ARMS[arm]) ARMS[arm]();
else { console.error(`unknown arm '${arm}'. one of: ${ORDER.join(", ")}, all`); process.exit(2); }

if (existsSync(SNAP)) {
  const left = execFileSync("git", ["status", "--short"], { cwd: WORK, encoding: "utf8" })
    .split("\n").filter((l) => l && !l.includes(".retirement-control")).join("\n");
  console.log(`\ngit status after every restore (blank means the tree is as it was):\n${left || "  (clean)"}`);
  rmSync(SNAP, { recursive: true, force: true });
}
