/* D-309's NEGATIVE CONTROL DRIVER — three arms plus a baseline, re-runnable in
 * one step:
 *
 *     node test/multicase.control.mjs            # every arm, in order
 *     node test/multicase.control.mjs a          # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`, on `caseflip.control.mjs`'s reasoning: it EDITS
 * REAL SOURCES, and a file the battery discovers must never be one that rewrites
 * `src/` underneath the suites running beside it.
 *
 * IT RUNS **SEVERAL SUITES PER ARM**, which is this driver's one departure from
 * its neighbours, and the reason is that D-309's subject is split on purpose:
 * `multicase.test.mjs` is the CENSUS over the source and `caseflip.test.mjs` is
 * the DRIVEN behaviour. An arm that ran only one of them could not tell "the
 * plane still refuses" from "the source still reads scalar" — and arm (a) below
 * is exactly that distinction, measured, with the two suites disagreeing. The
 * over-strictness arm runs a third set (`caselifecycle`, `casepin`, `publish`),
 * because the work it must not break lives in those and not in either of D-309's
 * own. Every suite's tally is reported per arm, and the BASELINE runs all five.
 *
 * THE THREE RULES INHERITED FROM `caseflip.control.mjs`, because this project
 * paid for each: pristine copies live INSIDE this worktree and are uniquely named
 * PER ARM; every restore is verified by CONTENT and by sha256 with the byte count
 * printed and floored; the suites' output is captured to a FILE and never to a
 * pipe (D-282: `process.exit()` discards unflushed pipe writes).
 *
 * EACH ARM IS ARMED ALONE, with every other defence held open.
 *
 * ============================ THE ARMS, DECLARED ============================
 *
 * (a) THE ARM THIS ITEM EXISTS FOR — RE-SCALAR ONE FORMER SITE. `#casesOfSha`'s
 *     pinned read goes back to `ORDER BY … LIMIT 1` over the set and answers with
 *     its newest element. DECLARED: the CENSUS must FAIL naming the site (it
 *     counts a SCALAR again, so "zero scalar readers" falls and site 8's arm
 *     falls with it). The behaviour suite may or may not see it, and which is
 *     itself the finding — a silently dropped second membership is the overclaim
 *     class precisely BECAUSE it looks like an answer.
 *     MEASURED, AND IT DID NOT COME BACK AS THE FIRST DRAFT OF THIS HEADER
 *     GUESSED — recorded rather than smoothed, because it is the most useful
 *     result in the file. **census 18 passed, 2 failed** (`ZERO SCALAR READERS
 *     REMAIN` and the did-not-shrink arm beside it, both naming the site).
 *     **caseflip 58 passed, 0 failed — THE BEHAVIOUR SUITE DID NOT SEE IT AT
 *     ALL.**
 *
 *     WHY, and it is a fact about the model rather than a gap in the suite: a
 *     finding joins a second case at a NEW VERSION (`op=publish` promotes every
 *     member), so each case pins a DIFFERENT sha, and `#casesOfSha` — which keys
 *     on the sha — returns exactly one row per published edition either way. A
 *     `LIMIT 1` over a one-row result is indistinguishable from the correct
 *     answer. The memberships are visible only when the finding's EDITIONS are
 *     read together, which no behavioural assertion can force a caller to do.
 *
 *     **THIS IS THE ARGUMENT FOR THE CENSUS EXISTING.** CASE-6's whole case for
 *     keeping the fence was that lifting it would turn nine correct answers into
 *     nine silent guesses "with no refusal, no flag, and no way for a reader to
 *     tell". This arm is that sentence, measured: one helper re-scalared, the
 *     record now answers a set-valued question with one element, and **every
 *     driven assertion in the project stays green**. A structural count is the
 *     only instrument that can see it, which is why D-309 shipped one.
 *
 * (b) THE AMBIGUOUS DERIVATION DEFAULTS INTO CASE A. The `CASE_IDENTITY_AMBIGUOUS`
 *     refusal is neutered so the derivation falls through to `distinct[0]` — the
 *     pre-D-309 behaviour, which is exactly "silently append to A".
 *     DECLARED: caseflip must FAIL on the arm that drives the refusal ALONE and
 *     names it EXACTLY. **AND THE ARM MUST PROVE THE DEFAULT PATH EXISTED**, which
 *     a refusal-shaped failure alone does not: the act must come back `ok: true`
 *     having landed in a case nobody named.
 *     MEASURED, AS DECLARED: caseflip 56 passed, 2 failed — both ambiguity
 *     assertions fell, and the first reports **`got [true, null]`** where it wants
 *     `[false, "CASE_IDENTITY_AMBIGUOUS"]`. That `true` is the half the
 *     declaration insisted on and a refusal-shaped failure would not have given:
 *     with the refusal neutered the publish SUCCEEDS, silently landing the
 *     finding in whichever case sorted first, with `reason: null` — **the default
 *     path is still there, still reachable, and still silent.** Census 20 passed,
 *     0 failed: the source is unchanged in the class, which is correct, and is
 *     why (a) and (b) are separate arms rather than one.
 *
 * (c) OVER-STRICTNESS, the direction a control usually forgets. NOTHING is
 *     broken; instead the derivation is made STRICT — it refuses on ANY existing
 *     membership rather than on more than one, which is the reading of D-309's
 *     brief this item CONSIDERED AND REJECTED (the reasoning is at the region in
 *     `store.mjs`). DECLARED: the suites that publish SECOND EDITIONS without
 *     naming a case must go RED, proving the rejected reading would have broken
 *     correct work — a single-case finding and DEC-44's single-finding case must
 *     publish exactly as today.
 *     MEASURED, AS DECLARED AND HARDER THAN DECLARED: **caselifecycle 58 pass, 9
 *     fail; casepin -1 (the fixture DIED — its second-edition publish is a `bail`
 *     and the refusal killed it before any assertion ran); publish -1 (died the
 *     same way, with one named failure before it went, `the second publication is
 *     EDITION 2`).** Two suites annihilated and nine assertions lost in a third,
 *     every one of them a LEGITIMATE publication refused: every second edition in
 *     this corpus publishes without naming its case (`caselifecycle`'s CEREMONY,
 *     `casepin`, `publish`), and always has.
 *
 *     **THAT IS THE MEASUREMENT BEHIND WHERE THE LINE WAS DRAWN.** D-309's brief
 *     says an ambiguous derivation must be refused, and the strictest reading of
 *     its sentence — *"a member of case A published with no `caseId` must not
 *     silently append to A"* — is this arm. It was rejected, and this is the
 *     evidence rather than the argument: read that way the refusal is not a fence
 *     against a guess, it is a different act demanded of every existing caller.
 *     The line sits at MORE THAN ONE candidate, with `newCase` beside it so the
 *     intent the old derivation used to override is sayable. The full reasoning
 *     is at the `case-identity-derivation` region in `store.mjs`.
 *
 * BASELINE: nothing armed — the row that distinguishes three-arms-broken from
 * three-arms-working, which a driver without one cannot do. MEASURED: census 20
 * passed 0 failed; caseflip 58 passed 0 failed; caselifecycle 67 pass 0 fail;
 * casepin 34 passed 0 failed; publish 99 pass 0 fail.
 *
 * **THE BASELINE EARNED ITS KEEP ON THE FIRST RUN.** It reported `caselifecycle:
 * -1` and `publish: -1` WITH NOTHING ARMED — and that was this driver's own tally
 * regex, not the suites: those two spell their foot `pass, fail` where the others
 * spell it `passed, failed`. Without the baseline row, arm (c)'s three `-1`s would
 * have been recorded as three suites annihilated by the arm. Corrected, re-run,
 * and noted at the regex.
 *
 * ONE ARM CAME BACK NOT AS DECLARED — (a), and it is the most useful result here.
 * Stated at the arm in full: the census caught it and **the behaviour suite did
 * not**, which is CASE-6's "no refusal, no flag, and no way for a reader to tell"
 * measured rather than quoted.
 * ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-multicase");           /* inside this worktree, rule 1 */
const STORE = join(ROOT, "src", "store.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;                                /* a "restore" of a truncated file is not a restore */

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, and it THROWS if the needle is absent
   or ambiguous. An arm that silently edited nothing reports the subject as
   unbreakable, which is the one wrong answer a control can give — and this
   repository has met arms that patched zero times more than once. */
const edit = (file, needle, replacement) => {
  if (ANCHOR_DRY) return void anchorPatch(file, needle, replacement);   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

/* The suites each arm runs, with the regex that reads their own tally. A suite
   that dies before its summary is reported as exactly that — never as 0. */
const CENSUS   = { name: "multicase",     file: join(DIR, "multicase.test.mjs"),
                   re: /multicase: (\d+) passed, (\d+) failed/ };
const BEHAVIOUR = { name: "caseflip",     file: join(DIR, "caseflip.test.mjs"),
                   re: /caseflip: (\d+) passed, (\d+) failed/ };
const LIFECYCLE = { name: "caselifecycle", file: join(DIR, "caselifecycle.test.mjs"),
                   re: /caselifecycle: (\d+) pass, (\d+) fail/ };
const CASEPIN  = { name: "casepin",       file: join(DIR, "casepin.test.mjs"),
                   re: /casepin: (\d+) passed, (\d+) failed/ };
const PUBLISH  = { name: "publish",       file: join(DIR, "publish.test.mjs"),
                   /* `pass`/`fail`, not `passed`/`failed` — these two suites spell
                      their own foot differently, and the FIRST run of this driver
                      reported BOTH as `-1 (died before its own summary)` on the
                      BASELINE, with nothing armed. That is the driver's own
                      instrument bug, caught by having a baseline row at all: a
                      -1 on an ARMED arm reads as damage, and without the baseline
                      to contradict it, arm (c) would have been recorded as three
                      suites annihilated rather than three suites this reader
                      could not parse. Kept as a note because it is the exact
                      failure mode `-1 never 0` exists to surface. */
                   re: /publish: (\d+) pass, (\d+) fail/ };

const ARMS = {
  baseline: { files: [], suites: [CENSUS, BEHAVIOUR, LIFECYCLE, CASEPIN, PUBLISH],
              label: "nothing armed — what distinguishes three-arms-working from three-arms-broken",
              apply: () => {} },

  a: { files: [STORE], suites: [CENSUS, BEHAVIOUR],
       label: "(a) THE ARM THIS ITEM EXISTS FOR — RE-SCALAR ONE FORMER SITE. `#casesOfSha`'s pinned read "
            + "goes back to a LIMIT 1 over the set and answers with its newest element. The CENSUS must "
            + "FAIL naming the site; a second membership silently dropped is the overclaim class",
       apply: () => edit(STORE,
         "    const rows = bundleSha\n"
       + "      ? this.#rows(`SELECT case_id, edition FROM published_case_members\n"
       + "                     WHERE bundle_id=? AND version_sha=? ORDER BY case_id, edition`, bundleId, bundleSha)\n"
       + "      : [];",
         "    const rows = bundleSha\n"
       + "      ? [this.#one(`SELECT case_id, edition FROM published_case_members\n"
       + "                     WHERE bundle_id=? AND version_sha=? ORDER BY edition DESC LIMIT 1`,\n"
       + "                   bundleId, bundleSha)].filter(Boolean)\n"
       + "      : [];") },

  b: { files: [STORE], suites: [CENSUS, BEHAVIOUR],
       label: "(b) THE AMBIGUOUS DERIVATION DEFAULTS INTO CASE A — the refusal is neutered so the "
            + "derivation falls through to `distinct[0]`, which is the pre-D-309 behaviour. The act must "
            + "not merely fail differently: it must come back ok:true having landed in a case nobody "
            + "named, which is what proves the default path existed before",
       apply: () => edit(STORE,
         "    if (!newCase && !String(caseId ?? \"\").trim() && distinct.length > 1)",
         "    if (false && !newCase && !String(caseId ?? \"\").trim() && distinct.length > 1)") },

  c: { files: [STORE], suites: [LIFECYCLE, CASEPIN, PUBLISH],
       label: "(c) OVER-STRICTNESS — the REJECTED READING, armed. The derivation refuses on ANY existing "
            + "membership rather than on more than one. Correct work in a spelling this item did not "
            + "change must keep passing, so three suites that publish SECOND EDITIONS without naming a "
            + "case must go RED here — the measurement behind where the line was drawn",
       apply: () => edit(STORE,
         "    if (!newCase && !String(caseId ?? \"\").trim() && distinct.length > 1)",
         "    if (!newCase && !String(caseId ?? \"\").trim() && distinct.length > 0)") },
};

anchorEach(ARMS, (a) => a.apply());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

mkdirSync(PEN, { recursive: true });
const results = [];

for (const name of order) {
  const arm = ARMS[name];
  /* SNAPSHOT FIRST, uniquely named per arm AND per file (rule 1). */
  const snaps = arm.files.map((f) => {
    const buf = readFileSync(f);
    if (buf.length < FLOOR) throw new Error(`refusing to snapshot a suspiciously small ${f}: ${buf.length} bytes`);
    const copy = join(PEN, `${name}--${f.split("/").pop()}.pristine`);
    writeFileSync(copy, buf);
    return { file: f, copy, bytes: buf.length, sha: sha(buf) };
  });
  console.log(`\n=== ARM ${name} ===\n${arm.label}`);
  for (const s of snaps) console.log(`  pristine ${s.file.split("/").pop()}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 16)}…`);

  const tallies = [];
  try {
    arm.apply();
    for (const suite of arm.suites) {
      /* CAPTURED TO A FILE, NEVER A PIPE (rule 3), and run ONCE. A red suite
         exits 1, which is the EXPECTED outcome of an armed arm and is a result
         rather than an error. */
      try {
        execFileSync("/bin/sh",
          ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(suite.file)} > ${JSON.stringify(LOG)} 2>&1`],
          { cwd: ROOT, stdio: "ignore" });
      } catch { /* a non-zero exit is the measurement */ }
      const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
      const m = suite.re.exec(out);
      /* A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0. A TypeError inside an
         assertion goes through no assertion at all and ends the module with the
         count reading clean, so "the suite reached its own FOOT" is checked
         rather than assumed. */
      const tally = m ? m[0] : `${suite.name}: -1 (no tally — the suite died before its own summary)`;
      const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 130));
      console.log(`  RESULT  ${tally}`);
      for (const f of failed) console.log(`    FAILING  ${f}`);
      if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
      tallies.push({ suite: suite.name, tally, failed: failed.length });
    }
    results.push({ arm: name, tallies });
  } finally {
    /* RESTORE, AND VERIFY BY CONTENT AND BY sha256 (rule 2). */
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
for (const r of results)
  for (const x of r.tallies)
    console.log(`  ${r.arm.padEnd(9)} ${x.tally.padEnd(46)} (${x.failed} named failure(s))`);
rmSync(PEN, { recursive: true, force: true });
