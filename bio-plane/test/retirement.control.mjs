/* FW-13 — the negative-control arms for the RETIREMENT of C-8.1, committed so
 * the next session RE-RUNS them in one step instead of re-deriving how to break
 * the subject. `check-firing.test.mjs` DECLARES them; this file arms them.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs, so the
 * battery must not discover it (`suggest.control.mjs` and `register.control.mjs`
 * set the precedent).
 *
 *   node test/retirement.control.mjs restore     put the retired check BACK
 *   node test/retirement.control.mjs producer    grow a producer for the retired shape
 *   node test/retirement.control.mjs neuter      blind the estate walk; REACH must fail
 *   node test/retirement.control.mjs overstrict  plant nothing; nothing may fail
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

/* ------------------------------------------------------------------ arms */

const ARMS = {
  /* (i) The item's own. Put the retired check BACK — one push under the retired
     id and a call site — and both directions of the retirement must bite. */
  restore() {
    console.log("\n=== ARM (i) RESTORE — the retired check put back ===");
    declare("the C-8.1 retirement arms (behavioural) AND the source arm naming the pushing line",
      "the 32 surviving `fires` arms; the estate arm — restoring a CHECK grows no PRODUCER");
    const s = snapshot("arm-restore", CHECKS);
    const src = readFileSync(CHECKS, "utf8");
    const marker = "    /* checkCitationRegister ran here until FW-13 retired it";
    if (!src.includes(marker)) { console.error("REFUSING: the call-site marker is gone; arm cannot arm."); process.exit(2); }
    const planted = src
      .replace(marker, "    __plantedCitationRegister(ctx, findings);\n" + marker)
      .replace("export const CHECK_RETIREMENTS = {",
        "function __plantedCitationRegister(ctx, findings) {\n"
        + "  const raw = ctx.files.get('data/citations.json');\n"
        + "  if (!raw) return;\n"
        + "  let reg; try { reg = JSON.parse(asText(raw)); } catch { return; }\n"
        + "  if (!Array.isArray(reg?.claims)) findings.push(f('C-8.1', 'error', 'data/citations.json must be {\"claims\": [...]}'));\n"
        + "}\n\nexport const CHECK_RETIREMENTS = {");
    if (planted === src) { console.error("REFUSING: nothing was planted — THE ARM NEVER ARMED."); process.exit(2); }
    writeFileSync(CHECKS, planted);
    report(runSuite());
    restore(s);
  },

  /* (ii) The half no bundle-level assertion can see: a SECOND claim structure
     appearing in the estate while every behavioural arm stays green. */
  producer() {
    console.log("\n=== ARM (ii) PRODUCER — the retired shape grows a writer ===");
    declare("the ESTATE arm, naming bio-plane/src/cdx.mjs",
      "every behavioural retirement arm, the source arm, the reach arms, the corpus floor");
    const s = snapshot("arm-producer", PRODUCER_HOST);
    writeFileSync(PRODUCER_HOST, readFileSync(PRODUCER_HOST, "utf8")
      + '\nexport const __PLANTED = "data/citations.json";\n');
    report(runSuite());
    restore(s);
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
};

const arm = process.argv[2] || "all";
if (arm === "all") { for (const k of ["restore", "producer", "neuter", "overstrict"]) ARMS[k](); }
else if (ARMS[arm]) ARMS[arm]();
else { console.error(`unknown arm '${arm}'. one of: ${Object.keys(ARMS).join(", ")}, all`); process.exit(2); }

if (existsSync(SNAP)) {
  const left = execFileSync("git", ["status", "--short"], { cwd: WORK, encoding: "utf8" })
    .split("\n").filter((l) => l && !l.includes(".retirement-control")).join("\n");
  console.log(`\ngit status after every restore (blank means the tree is as it was):\n${left || "  (clean)"}`);
  rmSync(SNAP, { recursive: true, force: true });
}
