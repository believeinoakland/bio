#!/usr/bin/env node
/* m025-anchor-witness.control.mjs — THE NEGATIVE CONTROL DRIVER for M0-25's
 * battery-side check, `test/m025-arm-anchor-witness.test.mjs`.
 *
 *     node bio-plane/test/m025-anchor-witness.control.mjs            all arms
 *     node bio-plane/test/m025-anchor-witness.control.mjs A1 A4      named arms only
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES while it runs, so the
 * battery must not discover it. Every driver it sits beside is here for the same
 * reason, and this file obeys the same rules they do — each of which this project
 * has paid for:
 *
 *   - **EVERY ARM IS ARMED ALONE**, every other defence held open.
 *   - **THERE IS A BASELINE ARM that patches NOTHING and must come back GREEN.**
 *     Without it, "every arm failed" cannot be told from "the harness is broken":
 *     a driver in this repository once reported `null` for every arm INCLUDING
 *     the baseline, and only the baseline row made the two distinguishable.
 *   - **EVERY ARM DECLARES BEFORE IT RUNS what must fail and what must not.**
 *   - **AN ARM THAT DID NOT ARM IS A FINDING, NOT A PASS** — the patch must match
 *     EXACTLY ONCE, and a zero-match stops the arm and is reported. This driver
 *     tests an instrument whose whole subject is that failure mode, so it would
 *     be absurd for it to be vulnerable to it.
 *   - **A SUITE THAT DIED REPORTS `-1`, NEVER 0.** A harness reading a missing
 *     tally as zero once recorded a killed suite as "stayed GREEN".
 *   - **EVERY RESTORE IS VERIFIED BY sha256 AND BY `cmp`**, against a
 *     UNIQUELY-NAMED PER-ARM pristine copy, with the byte count PRINTED and a
 *     minimum guarded — two harnesses here once reported a restore
 *     byte-identical over an EMPTY manifest, caught only because a digest read
 *     `e3b0c442…`, the sha256 of the empty string.
 *   - **THE PRISTINE COPIES LIVE INSIDE THIS WORKTREE**, never in the shared
 *     scratchpad: a concurrent worker overwrote a harness between ARM and
 *     RESTORE once already.
 *   - **AN ARM THAT COMES BACK GREEN WHEN RED WAS DECLARED IS A FINDING ABOUT
 *     THE ARM**, printed as one and never smoothed.
 *
 * WHY ARM A1's EDIT IS THE ONE IT IS. It re-formats `agent-worker/src/index.mjs`'s
 * `meaningRead` call — THE VERY LINE D-276 MOVED, and the line whose movement
 * killed `harness.control.mjs`'s H8 arm for a month. The edit changes no
 * behaviour at all (two spaces inside an object literal); it changes only the
 * BYTES the arm quotes. That is the D-276 class exactly: a correct, ordinary
 * edit that silently disarms a defence somewhere else.
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const WITNESS = join(ROOT, "bio-plane/test/m025-arm-anchor-witness.test.mjs");
const AGENT_SRC = join(ROOT, "agent-worker/src/index.mjs");
const FANOUT_SRC = join(ROOT, "agent-worker/src/subsession.mjs");
const QUERY_SRC = join(ROOT, "bio-plane/src/query.mjs");
const WORK = join(ROOT, "bio-plane/test/.m025-anchor-harness");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MIN_BYTES = { [WITNESS]: 8_000, [AGENT_SRC]: 20_000, [FANOUT_SRC]: 3_000, [QUERY_SRC]: 10_000 };

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const sha = (b) => createHash("sha256").update(b).digest("hex");

if (existsSync(WORK)) rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

let snap = 0;
function takeOriginal(file, armId) {
  const bytes = readFileSync(file);
  /* UNIQUELY NAMED PER ARM AND PER SNAPSHOT. A harness that named its copies from
     the PATH alone had a second snapshot overwrite the first, and `cmp` caught
     what sha256 could not — the hash was taken correctly and still agreed. */
  const copy = join(WORK, `${armId}__${++snap}__${file.replace(/[^\w]/g, "_")}.orig`);
  writeFileSync(copy, bytes);
  const floor = MIN_BYTES[file] ?? 1000;
  if (bytes.length < floor || sha(bytes) === EMPTY_SHA) {
    console.error(`  !!! PRISTINE COPY IMPLAUSIBLE for ${file}: ${bytes.length} bytes (floor ${floor}), sha ${sha(bytes).slice(0, 8)}…`);
    console.error(`      REFUSING TO ARM — a restore verified against an empty copy verifies nothing.`);
    process.exit(3);
  }
  return { file, bytes, copy, shaHex: sha(bytes), armId };
}

function restore(orig) {
  writeFileSync(orig.file, orig.bytes);
  const back = readFileSync(orig.file);
  const hashOk = sha(back) === orig.shaHex;
  /* THE SECOND INSTRUMENT, because one instrument agreeing with itself costs
     nothing. `cmp` against the on-disk copy, not against the buffer in memory. */
  const cmpOk = spawnSync("cmp", ["-s", orig.file, orig.copy]).status === 0;
  console.log(`    restore ${orig.file.slice(ROOT.length)}: ${back.length} bytes · sha256 ${hashOk ? "EQUAL" : "MISMATCH"} · cmp ${cmpOk ? "IDENTICAL" : "MISMATCH"}`);
  if (!hashOk || !cmpOk) {
    console.error(`\n  !!! RESTORE FAILED. STOPPING: the tree is not as it was found.`);
    process.exit(2);
  }
}

/* A patch matches EXACTLY ONCE or the arm did not arm. */
function patch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, hits: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, hits: 1 };
}

/* Run the witness and read its OWN FOOT. A module that died before its foot
   reports -1, never 0 — a `TypeError` inside an assertion goes through no
   assertion at all while the tally reads clean. Captured to a FILE, never a
   pipe: `process.exit()` discards unflushed pipe writes (D-282). */
function runWitness() {
  const outFile = join(WORK, `witness-${Date.now()}-${Math.random().toString(36).slice(2)}.out`);
  const r = spawnSync(process.execPath, [WITNESS], {
    cwd: join(ROOT, "bio-plane"), encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  writeFileSync(outFile, out);
  const m = out.match(/m025-arm-anchor-witness\.test\.mjs:\s*(\d+) pass,\s*(\d+) fail/);
  if (!m) return { ran: false, pass: -1, fail: -1, out, code: r.status };
  return { ran: true, pass: Number(m[1]), fail: Number(m[2]), out, code: r.status };
}
const failedArms = (r) => (r.out.match(/^  FAIL  (\S+)/gm) || []).map((l) => l.trim().split(/\s+/)[1]);

let armsRun = 0, asDeclared = 0;
const findings = [];

function arm({ id, subject, what, mustFail, mustNot, edits, expect }) {
  if (only.length && !only.includes(id)) return;
  armsRun++;
  console.log(`\n=== ARM ${id} · ${subject}`);
  console.log(`    WHAT IS BROKEN : ${what}`);
  console.log(`    MUST FAIL      : ${mustFail}`);
  console.log(`    MUST NOT FAIL  : ${mustNot}`);

  const origs = [];
  let armed = true;
  for (const [file, find, replace] of edits) {
    origs.push(takeOriginal(file, id));
    const p = patch(file, find, replace);
    if (!p.armed) {
      console.log(`    >>> THE ARM DID NOT ARM: the patch for ${file.slice(ROOT.length)} matched ${p.hits} time(s), not once.`);
      console.log(`        THIS IS A FINDING ABOUT THE ARM, not a green result. Nothing was measured.`);
      findings.push(`${id}: never armed (patch matched ${p.hits} times in ${file.slice(ROOT.length)})`);
      armed = false;
      break;
    }
  }

  let r = null;
  if (armed) { try { r = runWitness(); } finally { for (const o of origs.reverse()) restore(o); } }
  else { for (const o of origs.reverse()) restore(o); console.log(""); return; }

  const failed = failedArms(r);
  console.log(`    OBSERVED       : ${r.ran ? `${r.pass} pass, ${r.fail} fail` : `DID NOT REACH ITS FOOT — tally -1`} · exit ${r.code} · failing arms [${failed.join(", ")}]`);
  const ok = expect(r, failed);
  if (ok) { asDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else {
    console.log(`    VERDICT        : *** NOT AS DECLARED — A FINDING ABOUT THE ARM, recorded rather than smoothed ***`);
    findings.push(`${id}: not as declared (${r.pass}/${r.fail}, failing [${failed.join(", ")}])`);
  }
}

/* ---------------------------------------------------------------- THE ARMS */

arm({
  id: "A0", subject: "THE BASELINE — nothing is patched",
  what: "nothing. This row is what tells six-arms-broken from six-arms-working, and it is not decoration",
  mustFail: "nothing at all",
  mustNot: "any arm of the witness",
  edits: [],
  expect: (r, f) => r.ran && r.fail === 0 && f.length === 0 && r.code === 0,
});

arm({
  id: "A1", subject: "THE ARM THIS SUITE EXISTS FOR — the D-276 class, reproduced on the line D-276 moved",
  what: "`agent-worker/src/index.mjs`'s `meaningRead` call is RE-FORMATTED IN PLACE — two spaces removed "
      + "from inside an object literal, behaviour identical to the byte. `harness.control.mjs`'s H8 anchor "
      + "quotes that line verbatim, so its anchor now matches ZERO times",
  mustFail: "A4, the zero-match arm, NAMING harness.control.mjs and the anchor",
  mustNot: "A1/A2/A3 (the corpus and reach floors are untouched), A5, A6, or any of the extractor's own S-arms — "
         + "a defect in one driver's anchor must not move this suite's reach figures",
  edits: [[AGENT_SRC,
    `const got = await meaningRead(call, { rows: MEANING_ARM, limit: 1, ids: [address] });`,
    `const got = await meaningRead(call, {rows: MEANING_ARM, limit: 1, ids: [address]});`]],
  expect: (r, f) => r.ran && f.includes("A4") && !f.includes("A5") && !f.includes("A6")
                 && !f.includes("A1") && !f.includes("A2") && !f.includes("A3")
                 && !f.some((x) => x.startsWith("S"))
                 && /harness\.control\.mjs/.test(r.out.split("A4")[1] || ""),
});

arm({
  id: "A2", subject: "OVER-STRICTNESS — a correct edit OUTSIDE every anchor's span must pass",
  what: "a comment line is added to `agent-worker/src/fanout.mjs` well away from any quoted line. This is "
      + "ordinary correct work in a spelling nobody anticipated, and a fence tighter than its rule is an "
      + "undeclared interface change wearing the costume of caution",
  mustFail: "NOTHING. This arm's whole content is that the witness stays silent",
  mustNot: "any arm",
  edits: [[FANOUT_SRC, `export const SUBSESSION_OPS = ["meaningrows"];`,
    `/* M0-25 over-strictness arm: an ordinary comment, touching no anchored line. */\nexport const SUBSESSION_OPS = ["meaningrows"];`]],
  expect: (r, f) => r.ran && r.fail === 0 && f.length === 0 && r.code === 0,
});

arm({
  id: "A3", subject: "THE REACH ARM — a detector that finds nothing passes every clean corpus",
  what: "the extractor's own filter is neutered inside the witness, so it reads NO anchor at all",
  mustFail: "A3, the extractor's reach floor — and the point is what does NOT happen: A4 and A5 report "
         + "TRIUMPHANT EMPTY LISTS over an estate this run cannot see at all",
  mustNot: "A1 or A2, the driver-count and corpus floors, which are computed before the extractor runs and "
         + "must stay green so the two failures are distinguishable",
  edits: [[WITNESS,
    `      if (lit === null || lit.includes("\${") || lit.length < 20) continue;`,
    `      if (true) continue;`]],
  expect: (r, f) => r.ran && f.includes("A3") && !f.includes("A4") && !f.includes("A5")
                 && !f.includes("A1") && !f.includes("A2"),
});

arm({
  id: "A4", subject: "THE MULTIPLICITY HALF — an anchor that starts occurring TWICE",
  what: "a SECOND copy of `fanout.mjs`'s `SUBSESSION_OPS` line is planted (inside a comment, so the module "
      + "still parses), which is WORKER.md's 'anchor occurred twice' receipt: a first-occurrence patch then "
      + "arms a site nobody declared, silently",
  mustFail: "A5, the per-subject multiplicity arm, NAMING the driver and the file",
  mustNot: "A4 — the anchor still EXISTS, so the zero-match arm has nothing to say and the two must be "
         + "distinguishable; nor A6, nor the floors",
  edits: [[FANOUT_SRC, `export const SUBSESSION_OPS = ["meaningrows"];`,
    `export const SUBSESSION_OPS = ["meaningrows"];\n/* M0-25 arm: export const SUBSESSION_OPS = ["meaningrows"]; */`]],
  expect: (r, f) => r.ran && f.includes("A5") && !f.includes("A4") && !f.includes("A6")
                 && /fanout\.control\.mjs/.test(r.out.split("A5")[1] || ""),
});

arm({
  id: "A5", subject: "THE NAMED LIST'S OWN STALENESS — a naming must not outlive the thing it named",
  what: "one of the TWO `let raw = String(tok.value);` sites in `bio-plane/src/query.mjs` is re-spelled, so "
      + "`query.control.mjs`'s DELIBERATE two-occurrence closure is no longer double",
  mustFail: "A6, which says every named multiplicity is still there and still multiple — an exemption nobody "
         + "is enforcing is the shape this estate refuses",
  mustNot: "A5 (the entry is still NAMED, so it is still excluded from the unnamed list) or A4",
  /* THE ANCHOR IS THE SECOND SITE'S, TAKEN WITH ITS FOLLOWING LINE, AND THE FIRST
     SPELLING OF THIS ARM DID NOT ARM — reported by this driver as a FINDING rather
     than as a green run, which is the one thing it must never get wrong about
     itself. The first attempt quoted `  const words = []` as the following line;
     the second site is followed by `  let subName = null;`. Re-anchored on the
     bytes, counted before it was written. Only ONE of the two occurrences is
     re-spelled, which is the whole arm: the deliberate multiplicity `query.control.mjs`
     NAMES stops being multiple, and A6 must notice. */
  edits: [[QUERY_SRC,
    `  let raw = String(tok.value);\n  let subName = null;`,
    `  let raw = String(tok.value); /* M0-25 arm */\n  let subName = null;`]],
  expect: (r, f) => r.ran && f.includes("A6") && !f.includes("A5") && !f.includes("A4"),
});

/* ------------------------------------------------------------------- THE FOOT
   Reached only if nothing exited early, so a reader can tell a completed run
   from one that died mid-arm — which is the same rule this driver applies to the
   suite it drives. */
console.log(`\n${"=".repeat(78)}`);
console.log(`arms run: ${armsRun} · as declared: ${asDeclared} · findings about the arms: ${findings.length}`);
for (const f of findings) console.log(`  FINDING: ${f}`);
console.log(`Every arm was armed ALONE with the other defences held open; every restore was`);
console.log(`verified by sha256 AND by cmp against a uniquely-named per-arm copy, with the`);
console.log(`byte count printed and a per-file minimum guarded.`);

/* The committed tree, checked rather than assumed, at the very end. */
{
  const dirty = spawnSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: ROOT, encoding: "utf8" });
  const lines = (dirty.stdout || "").trim().split("\n").filter(Boolean);
  const touched = [WITNESS, AGENT_SRC, FANOUT_SRC, QUERY_SRC].map((p) => p.slice(ROOT.length));
  const stillDirty = lines.filter((l) => touched.some((p) => l.includes(p)));
  console.log(`tree: ${stillDirty.length ? `*** STILL MODIFIED: ${stillDirty.join(", ")}` : "every file this driver touched is back to its committed bytes"}`);
  if (stillDirty.length) process.exit(4);
}

rmSync(WORK, { recursive: true, force: true });
process.exit(armsRun === asDeclared && findings.length === 0 ? 0 : 1);
