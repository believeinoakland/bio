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
         + "is enforcing is the shape this estate refuses. AND A4, for the reason stated below, with its "
         + "finding list holding EXACTLY this driver's own anchor and nothing else",
  mustNot: "A5 (the entry is still NAMED, so it is still excluded from the unnamed list)",
  /* THE ANCHOR IS THE SECOND SITE'S, TAKEN WITH ITS FOLLOWING LINE, AND THE FIRST
     SPELLING OF THIS ARM DID NOT ARM — reported by this driver as a FINDING rather
     than as a green run, which is the one thing it must never get wrong about
     itself. The first attempt quoted `  const words = []` as the following line;
     the second site is followed by `  let subName = null;`. Re-anchored on the
     bytes, counted before it was written. Only ONE of the two occurrences is
     re-spelled, which is the whole arm: the deliberate multiplicity `query.control.mjs`
     NAMES stops being multiple, and A6 must notice. */
  /* DECLARATION CORRECTED 2026-09-14 (D-329+D-331+D-333 item), NEVER EXEMPTED,
     AND THE ARM WAS RIGHT WHILE ITS DECLARATION WAS WRONG. It read `mustNot: A4`
     and came back [A4, A6] — measured identically on a PRISTINE `origin/main`
     worktree at `b0eddbf` with none of that item's changes present, so it is a
     pre-existing red and not that item's. THE CAUSE IS IRREDUCIBLE: this arm's
     job is to make one of two identical lines STOP BEING that line, and the line
     it must mutate is the line its OWN `find` quotes — so the moment it arms, its
     own anchor occurs zero times in `query.mjs` and A4 correctly says so. The
     paragraph above records that this arm was RE-ANCHORED onto the two-line span
     after its first spelling did not arm; the declaration was right against the
     ORIGINAL spelling and nobody revisited it at the re-anchoring, which is
     D-333's decay class one level out, inside a control driver.
     It is corrected rather than loosened: A4 must fail AND its finding list must
     hold EXACTLY this driver's own anchor, so a real death arriving beside it is
     still a failure of the declaration. (The same self-consumption bit arm L1
     below, where it WAS avoidable — an additive edit leaves the anchor intact —
     and the contrast is why both notes are kept.) */
  edits: [[QUERY_SRC,
    `  let raw = String(tok.value);\n  let subName = null;`,
    `  let raw = String(tok.value); /* M0-25 arm */\n  let subName = null;`]],
  expect: (r, f) => {
    const got = (r.out.split("FAIL  A4")[1] || "").split("\n").find((l) => l.includes("got  ")) || "";
    const onlyOwn = /m025-anchor-witness\.control\.mjs/.test(got)
      && got.split("bio-plane/").length - 1 === 1;
    console.log(`    A4's finding list holds ONLY this driver's own anchor: ${onlyOwn}`);
    return r.ran && f.includes("A6") && f.includes("A4") && !f.includes("A5") && onlyOwn;
  },
});

/* ==========================================================================
   APPENDED 2026-09-14 BY D-329 + D-331 + D-333. No arm above is edited.

   The arms above all drive the WITNESS. Two of the three shapes added by that
   item are not the witness's: D-331's preflight lives in the throwing DRIVERS,
   and D-333's declared-vs-measured comparison lives in the CENSUS, because a
   tally is a claim about a RUN. So this section adds two more runners beside
   `runWitness()` and drives each subject where it actually lives.
   ========================================================================== */

const AICRED_DRIVER = join(ROOT, "bio-plane/test/aicredential.control.mjs");
const DECAY_MOD = join(ROOT, "bio-plane/scripts/armdecay.mjs");
const CASEPIN_DRIVER = join(ROOT, "bio-plane/test/casepin.control.mjs");
const CASESIGN_DRIVER = join(ROOT, "bio-plane/test/casesign.control.mjs");
const STORE_SRC = join(ROOT, "bio-plane/src/store.mjs");
const CENSUS = join(ROOT, "bio-plane/test/m025-arm-census.mjs");
Object.assign(MIN_BYTES, { [AICRED_DRIVER]: 5_000, [DECAY_MOD]: 5_000, [CASEPIN_DRIVER]: 5_000,
                           [CASESIGN_DRIVER]: 5_000, [STORE_SRC]: 500_000 });

/* Run a driver for ONE arm and hand back what it printed. Captured to a FILE,
   never a pipe (D-282), and a run that produced no recognisable foot reports
   `ran: false` rather than an invented zero. */
function runProcess(file, args, label) {
  const outFile = join(WORK, `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}.out`);
  const r = spawnSync(process.execPath, [file, ...args], {
    cwd: join(ROOT, "bio-plane"), encoding: "utf8", maxBuffer: 128 * 1024 * 1024,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  writeFileSync(outFile, out);
  return { out, code: r.status };
}

/* The same declare-arm-restore shape as `arm()` above, for an arm whose subject
   is a DRIVER or the CENSUS rather than the witness. Kept as its own function
   rather than generalising `arm()`, because editing five working arms to add
   two is how a control driver acquires the defect it exists to find. */
function armOn({ id, subject, what, mustFail, mustNot, edits, run, expect }) {
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
      armed = false; break;
    }
  }
  let r = null;
  if (armed) { try { r = run(); } finally { for (const o of origs.reverse()) restore(o); } }
  else { for (const o of origs.reverse()) restore(o); console.log(""); return; }
  console.log(`    OBSERVED       : exit ${r.code}`);
  const ok = expect(r);
  if (ok) { asDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else {
    console.log(`    VERDICT        : *** NOT AS DECLARED — A FINDING ABOUT THE ARM, recorded rather than smoothed ***`);
    console.log(`    tail: ${r.out.split("\n").filter(Boolean).slice(-4).map((l) => l.trim()).join(" | ").slice(0, 300)}`);
    findings.push(`${id}: not as declared (exit ${r.code})`);
  }
}

/* ------------------------------------------------- D-329 · THE COMPOSED LABEL */

arm({
  id: "L1", subject: "D-329's OWN HISTORICAL DEFECT, PUT BACK — a driver quoting a RENDERED COUNT",
  what: "`aicredential.control.mjs`'s `mustNotFail` fragment is restored to the spelling M0-25's census "
      + "found it in: `every one of the 26 ops …`, where the SUITE composes the name as "
      + "`every one of the ${beyond.length} ops …`. THIS IS THE SILENTLY VACUOUS DIRECTION — a fragment "
      + "that can never match can never be violated, so that guard proved nothing and SAID nothing for a "
      + "month, and no runtime signal was ever going to produce one. If a static check cannot see this, "
      + "nothing can",
  mustFail: "L3, the composed-label arm, NAMING aicredential.control.mjs, the suite that composes the label, "
         + "and the rendered value `\"26\"` that sat in the slot",
  mustNot: "L1, L2 or L4 (the reach floors and the predicate's own receipt are untouched), A4 or A5 (this is a "
         + "LABEL, not a source anchor, and the two halves must stay distinguishable), or any S-arm",
  /* THE EDIT IS ADDITIVE, AND THE FIRST SPELLING OF THIS ARM WAS NOT — RECORDED
     RATHER THAN QUIETLY FIXED, because the failure is this estate's own
     self-citation receipt in a new costume. The first version REPLACED the
     invariant fragment with the stale one, and A4 then went red beside L3: this
     driver's own edit-tuple anchor IS that fragment, so consuming it made the
     anchor read zero and the anchor half fired on the arm itself. Adding the
     stale fragment BESIDE the correct one leaves the anchor intact, which is
     what isolates the label half from the anchor half — the thing this arm's
     own declaration promises. */
  edits: [[AICRED_DRIVER,
    `   "ops no member reaches is refused at the mint, by name"],\n  ["a signed-in member mints",`,
    `   "ops no member reaches is refused at the mint, by name"],\n`
  + `  ["every one of the 26 ops no member reaches is refused at the mint, by name",\n`
  + `   "a signed-in member mints",`]],
  expect: (r, f) => r.ran && f.includes("L3") && !f.includes("L1") && !f.includes("L2") && !f.includes("L4")
                 && !f.includes("A4") && !f.includes("A5") && !f.some((x) => x.startsWith("S"))
                 /* THE FINDING MUST NAME THREE THINGS — the driver, the SUITE that composes
                    the label, and the rendered value in the slot. Naming only two is how a
                    finding sends the next reader to the wrong file, which this arm's first
                    run did: it named `armdecay.mjs`, because that module's own header had
                    spelled the example template in real backticks and so entered the index. */
                 && /aicredential\.control\.mjs quotes[\s\S]{0,400}?composed in bio-plane\/test\/aicredential\.test\.mjs/
                      .test(r.out.split("L3")[1] || "")
                 && /the rendered value .{0,2}26/.test(r.out.split("L3")[1] || ""),
});

arm({
  id: "L2", subject: "OVER-STRICTNESS — a CORRECT invariant quote in a spelling nobody anticipated must PASS",
  what: "the same fragment is re-spelled to start MID-SEGMENT (`member reaches is refused at the mint, by "
      + "name`) — still quoting only the invariant part, still resolving against the template, just not at a "
      + "boundary the author of the check had in mind. A fence tighter than its rule is an undeclared "
      + "interface change wearing the costume of caution",
  mustFail: "NOTHING. This arm's whole content is that the witness stays silent over correct work",
  mustNot: "any arm",
  edits: [[AICRED_DRIVER,
    `   "ops no member reaches is refused at the mint, by name"],\n  ["a signed-in member mints",`,
    `   "ops no member reaches is refused at the mint, by name"],\n`
  + `  ["member reaches is refused at the mint, by name",\n`
  + `   "a signed-in member mints",`]],
  expect: (r, f) => r.ran && r.fail === 0 && f.length === 0 && r.code === 0,
});

arm({
  id: "L3", subject: "THE LABEL REACH ARM — a detector that reads no label passes every estate",
  what: "`isLabelQuote` is neutered in `scripts/armdecay.mjs`, so the witness extracts NO label quote at all",
  mustFail: "L1, the label reach floor, and S9, which drives the shape predicate on a fixture — and the point "
         + "is what does NOT happen: L3 reports a TRIUMPHANT EMPTY LIST over an estate this run cannot see",
  mustNot: "L2 (the template index is built from the corpus, not from the drivers, and must stay green so the "
         + "two failures are distinguishable), A1-A6, or the anchor half's S-arms",
  edits: [[DECAY_MOD,
    `  return typeof s === "string" && s.length >= 20 && !s.includes("\${") && !s.includes("\\n")`,
    `  return false && typeof s === "string" && s.length >= 20 && !s.includes("\${") && !s.includes("\\n")`]],
  expect: (r, f) => r.ran && f.includes("L1") && f.includes("S9") && !f.includes("L3") && !f.includes("L2")
                 && !f.includes("A4") && !f.includes("A5") && !f.includes("A6"),
});

/* ------------------------------------------------------- D-331 · THE PREFLIGHT */

armOn({
  id: "P1", subject: "THE ARM D-331 EXISTS FOR — TWO dead anchors, and the SECOND one must still be reported",
  what: "TWO lines `casepin.control.mjs` quotes are changed IN PLACE in `src/store.mjs` — arm (a)'s pin write "
      + "and the roster SELECT that arms (e) and (f) share. Before the preflight, `edit()` threw at arm (a) "
      + "and arms (c) through (f) were never reached: the census measured 2 of 6 announcements while FOUR "
      + "anchors were dead. THE WHOLE CLAIM OF THIS FIX IS THAT THE ARMS BEHIND THE FIRST CASUALTY ARE STILL "
      + "REPORTED",
  mustFail: "the driver, by REFUSING TO ARM — and its preflight table must name BOTH dead anchors, plus report "
         + "the four live ones, in ONE run",
  mustNot: "the driver must not arm anything, must not run the suite, and must leave the tree exactly as found",
  edits: [
    [STORE_SRC, `          id, ed, i, m, r.version_sha ?? null, r.role ?? null);`,
                `          id, ed, i, m, r.version_sha ?? null, r.role ?? null );`],
    [STORE_SRC, `      \`SELECT ord, bundle_id, version_sha, role FROM published_case_members`,
                `      \`SELECT ord, bundle_id,  version_sha, role FROM published_case_members`],
  ],
  run: () => runProcess(CASEPIN_DRIVER, [], "P1"),
  expect: (r) => {
    const rows = (r.out.match(/ARM PREFLIGHT [a-z0-9]+\s+(?:ok|<<<)/g) || []);
    const dead = (r.out.match(/ARM PREFLIGHT [a-z0-9]+\s+<<< /g) || []);
    const namesBehind = /arm e: occurs 0 times/.test(r.out) || /arm f: occurs 0 times/.test(r.out);
    console.log(`    preflight rows: ${rows.length} · NOT LIVE: ${dead.length} · names an arm BEHIND the first: ${namesBehind}`);
    console.log(`    (before D-331 this run reported ONE casualty and died; the other five were never counted)`);
    return r.code !== 0 && rows.length === 6 && dead.length === 3 && namesBehind
      && /REFUSED TO ARM BLIND/.test(r.out) && /arm a: occurs 0 times/.test(r.out)
      && !/=== ARM a ===/.test(r.out);
  },
});

armOn({
  id: "P2", subject: "OVER-STRICTNESS — a HEALTHY driver preflights clean and runs byte-for-byte as before",
  what: "nothing. The preflight must be invisible to a driver whose anchors are all live: it reports the whole "
      + "set, says so, and gets out of the way",
  mustFail: "NOTHING",
  mustNot: "the driver's baseline arm, its restore verification, or its exit status",
  edits: [],
  run: () => runProcess(CASEPIN_DRIVER, ["baseline"], "P2"),
  expect: (r) => {
    const rows = (r.out.match(/ARM PREFLIGHT [a-z0-9]+\s+(?:ok|<<<)/g) || []);
    console.log(`    preflight rows: ${rows.length} · all live: ${/ALL 6 ANCHORS LIVE/.test(r.out)}`);
    return r.code === 0 && rows.length === 6 && /ALL 6 ANCHORS LIVE/.test(r.out)
      && /casepin: \d+ passed, 0 failed/.test(r.out);
  },
});

/* --------------------------------------------------------- D-333 · THE TALLY */

armOn({
  id: "T1", subject: "TALLY DECAY — a declared arm count moved while every anchor stayed perfectly live",
  what: "`casesign.control.mjs`'s head declaration is decayed from five arms to four. NOT ONE ANCHOR MOVES, "
      + "which is the whole point of the row: this is invisible to the witness, to a re-anchoring pass, and "
      + "to the driver's own run — it announces nothing until something holds the declaration against the run",
  mustFail: "the census, by name — `TALLY NOT AS DECLARED` naming casesign with both numbers — and its exit "
         + "status, because a figure nobody can falsify trains every session to trust it",
  mustNot: "the driver itself (it arms and runs exactly as before — the anchors are untouched), and the census "
         + "must not report a STALE ARM, since nothing about this arm is an anchor",
  edits: [[CASESIGN_DRIVER,
    `/* CASE-5b's NEGATIVE CONTROL DRIVER — five arms plus a baseline, re-runnable in`,
    `/* CASE-5b's NEGATIVE CONTROL DRIVER — four arms plus a baseline, re-runnable in`]],
  run: () => runProcess(CENSUS, ["--only", "casesign.control.mjs"], "T1"),
  expect: (r) => {
    const named = /casesign\.control\.mjs[\s\S]{0,200}?DECLARES 4 plus a baseline[\s\S]{0,80}?ANNOUNCED 6/.test(r.out);
    console.log(`    census named it with both numbers: ${named} · reported a STALE ARM as well: ${/drivers with a STALE arm : [1-9]/.test(r.out)}`);
    return r.code !== 0 && /TALLY NOT AS DECLARED/.test(r.out) && named
      && /drivers with a STALE arm : 0/.test(r.out) && /tally NOT AS DECLARED : 1/.test(r.out);
  },
});

armOn({
  id: "T2", subject: "OVER-STRICTNESS — a driver whose declaration AGREES with its run must stay silent",
  what: "nothing. `casepin` declares six arms plus a baseline and announces seven, which honours the rule",
  mustFail: "NOTHING",
  mustNot: "the census's tally section, its exit status, or the driver",
  edits: [],
  run: () => runProcess(CENSUS, ["--only", "casepin.control.mjs"], "T2"),
  expect: (r) => r.code === 0 && !/TALLY NOT AS DECLARED/.test(r.out)
    && /tally NOT AS DECLARED : 0/.test(r.out) && /declared tallies read : 1 of 1/.test(r.out),
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
  const touched = [WITNESS, AGENT_SRC, FANOUT_SRC, QUERY_SRC,
                   AICRED_DRIVER, DECAY_MOD, CASEPIN_DRIVER, CASESIGN_DRIVER, STORE_SRC]
    .map((p) => p.slice(ROOT.length));
  const stillDirty = lines.filter((l) => touched.some((p) => l.includes(p)));
  console.log(`tree: ${stillDirty.length ? `*** STILL MODIFIED: ${stillDirty.join(", ")}` : "every file this driver touched is back to its committed bytes"}`);
  if (stillDirty.length) process.exit(4);
}

rmSync(WORK, { recursive: true, force: true });
process.exit(armsRun === asDeclared && findings.length === 0 ? 0 : 1);
