/* CASE-5's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in
 * one step:
 *
 * TALLY CORRECTED 2026-09-14 (M0-29, D-343). This line read *"five arms plus a
 * baseline"* and the driver announced SEVEN. It was RIGHT WHEN IT WAS WRITTEN —
 * arms (a) through (e) are the five the list below was written for — and it
 * stopped being true inside its OWN landing commit `c6b9b51`, when arm (f) was
 * added after the head was written and nobody moved the opening sentence. The
 * ARMS ARE REAL: (f) is a live arm with its own anchor, its own subject and its
 * own recorded measurement, so the DECLARATION is corrected and no arm is
 * restored or removed. Same shape and same correction as `casepin.control.mjs`
 * (D-333's worked precedent), and the reason the census now holds a declared
 * tally against the run that produces it.
 *
 *     node test/caseflip.control.mjs            # every arm, in order
 *     node test/caseflip.control.mjs a          # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`, for the reason `d249-port.control.mjs` states:
 * it EDITS REAL SOURCES, and a file the battery discovers must never be one that
 * rewrites `src/` underneath the suites running beside it.
 *
 * THREE RULES THIS DRIVER OBEYS BECAUSE THIS PROJECT PAID FOR EACH OF THEM:
 *
 *   1. PRISTINE COPIES LIVE INSIDE THIS WORKTREE, never in a shared scratchpad.
 *      PL-10's harness was overwritten mid-turn by a concurrent worker writing
 *      the same path; the scratchpad is shared between sessions and a worktree
 *      is not. Each copy is UNIQUELY NAMED PER ARM, so two arms cannot restore
 *      each other's snapshot.
 *   2. EVERY RESTORE IS VERIFIED BY CONTENT AND BY sha256, with the byte count
 *      printed and floored. UI-38 met a harness that reported a byte-identical
 *      restore over a file it had not restored.
 *   3. THE SUITE'S OUTPUT IS CAPTURED TO A FILE, NEVER TO A PIPE. D-282: a suite
 *      calling `process.exit()` discards unflushed PIPE writes, and the tally
 *      read `-1` for exactly that reason on a control that looked fine.
 *
 * EACH ARM IS ARMED ALONE, with every other defence held open.
 *
 * WHAT THE SIX ARMS ARE FOR, since a list of edits is not a list of questions:
 *   (a) THE ARM THIS ITEM EXISTS FOR — if a member is resolved by the CASE's
 *       edition number instead of by its pin, does anything notice?
 *   (b) if the CASE-SIDE stranger-verification data is stripped out of the
 *       artifact, does the end-to-end drive FAIL, or does it merely report less?
 *   (c) OVER-STRICTNESS, the direction a control usually forgets: a legitimately
 *       verifiable case must still verify.
 *   (d) is the DIVERGENCE real, or an artifact of how the suite reads? Re-slave
 *       the member's edition and the fixture must stop diverging.
 *   (e) the legacy fallback — armed, and its measurement is that THIS suite
 *       cannot see it, which is stated rather than left as a silent gap.
 *   (f) ADDED TO THIS LIST 2026-09-14 (M0-29) — it was in the arm table from
 *       `c6b9b51` and missing from this list, which is what made the tally
 *       false. Require a pin on every roster row before an edition may be
 *       complete: the arm CAME BACK NOT-AS-DECLARED and is kept with its
 *       measurement at its own site, because this fixture writes no unpinned
 *       row and its GREEN is a statement about the INSTRUMENT, not the plane.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-caseflip");            /* inside this worktree, rule 1 */
const STORE = join(ROOT, "src", "store.mjs");
const INDEX = join(ROOT, "src", "index.mjs");
const SUITE = join(DIR, "caseflip.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;                                 /* a "restore" of a truncated file is not a restore */

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, and it THROWS if the needle is absent
   or ambiguous. An arm that silently edited nothing is an arm that reports the
   subject as unbreakable, which is the one wrong answer a control can give. */
const edit = (file, needle, replacement) => {
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

/* The member resolution predicate — the line CASE-3 handed to CASE-5 by name. */
const PIN_RESOLVE =
  "      const r = m.version_sha\n"
+ "        ? this.#one(`SELECT ${MEMBER_COLS} FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`,\n"
+ "                    m.bundle_id, m.version_sha)\n"
+ "        : this.#one(`SELECT ${MEMBER_COLS} FROM published_bundles WHERE bundle_id=? AND edition=?`,\n"
+ "                    m.bundle_id, ed);";

const ARMS = {
  /* The count in this label is the SAME CLAIM as the head's tally and was stale in the same
     way (`five` against a table of six); corrected 2026-09-14 by M0-29 with the head, because
     correcting one and leaving the other is the half-fix that makes the next reader believe
     the wrong half. */
  baseline: { files: [], label: "nothing armed — what distinguishes six-arms-working from six-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(a) THE ARM THIS ITEM EXISTS FOR — resolve a member BY THE CASE'S EDITION NUMBER instead of "
            + "by its pin. This is exactly the state the tree was in before this item, and it is the "
            + "predicate CASE-3's comment handed on by name. BETA is at its own edition 1 inside case "
            + "edition 2, so the old predicate finds NOTHING for it: BETA falls into `awaiting`, the "
            + "edition reads INCOMPLETE forever, and no container is ever assembled for a case that is "
            + "fully ratified",
       apply: () => edit(STORE, PIN_RESOLVE,
         "      const r = this.#one(`SELECT ${MEMBER_COLS} FROM published_bundles "
       + "WHERE bundle_id=? AND edition=?`, m.bundle_id, ed);") },

  b: { files: [INDEX],
       label: "(b) STRIP THE CASE-SIDE STRANGER-VERIFICATION DATA out of the container: no `version_sha`, "
            + "no `role`, no `project`, no `bar`. The question this arm asks is the one the brief poses — "
            + "does the end-to-end drive FAIL, or does it merely report less? It must fail: the freeze "
            + "assertion compares the pin to the signed hash and `undefined` is not a hash. Block 1 must "
            + "stay GREEN, because the READ PATH and the ARTIFACT are two separate answers to the property "
            + "and only the artifact travels",
       apply: () => {
         edit(INDEX, "            version_sha: f.version_sha ?? null,\n            role: f.role ?? null,",
              "            /* ARMED AWAY: the pin and the authored role */");
         edit(INDEX, "          project: cs.project ?? null,\n          bar: cs.bar ?? null,",
              "          /* ARMED AWAY: the producing project and the case's bar */");
       } },

  /* ARM (c) IS THE SECOND ONE WRITTEN FOR THIS SLOT, AND THE FIRST ONE'S RESULT
     IS KEPT AS (f) RATHER THAN DELETED. The original over-strictness arm required
     a PIN on every roster row before an edition could be complete. It came back
     GREEN — NOT AS DECLARED — and the reason is a fact about this suite rather
     than about the plane: every roster row this fixture writes is pinned, so
     there is no unpinned row here for that tightening to catch. It is a real
     over-strictness question and this suite is the wrong instrument for it, and
     both halves of that are recorded.
     (c) as it now stands asks the over-strictness question THIS suite can answer,
     and it is the one this item's own change makes tempting: once the pin is
     load-bearing, insist that a member's edition MATCH its case's — "they should
     agree, so let us check that they do". That is the slaving re-imposed as a
     validity rule, and BETA legitimately verifies at its own edition 1 inside
     case edition 2. A fence wider than the ruling it enforces is an undeclared
     interface change wearing the costume of caution. */
  c: { files: [STORE],
       label: "(c) OVER-STRICTNESS — insist that a member's own edition MATCH its case's before the member "
            + "is served, which is exactly the tightening this item's change makes tempting ('they ought to "
            + "agree, so check'). It must go RED: BETA is LEGITIMATELY at its own edition 1 inside case "
            + "edition 2, and a case that verifies must keep verifying. A fence wider than its ruling is an "
            + "undeclared contract change wearing the costume of caution",
       apply: () => edit(STORE,
         "      if (!r) { awaiting.push(m.bundle_id); continue; }\n"
       + "      findings.push({ ord: m.ord, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,",
         "      if (!r || Number(r.edition) !== Number(ed)) { awaiting.push(m.bundle_id); continue; }\n"
       + "      findings.push({ ord: m.ord, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,") },

  d: { files: [STORE],
       label: "(d) RE-SLAVE THE EDITION — stamp the CASE's edition as the member's `edition:` again. This "
            + "is the arm that proves the DIVERGENCE IS REAL rather than an artifact of how the suite "
            + "reads: with the two numbers forced equal again the fixture cannot diverge, and block 1's "
            + "first assertion falls naming [2,2,2] where it wants [2,2,1]",
       /* RE-AIMED 2026-09-23 by the D-442 worker (BIO_Publication_v0_1.md §3 rule 12), never exempted: op=publish no
          longer stamps `edition:` into a member — the case document states the member's own edition — so the arm
          re-slaves it at the one place it is now decided, the member's edition op=publish records for the case. */
       apply: () => edit(STORE,
         '      const memberEdition = already ? Number(already.edition) : memberEditions.get(target);',
         '      const memberEdition = already ? Number(already.edition) : edition;') },

  e: { files: [STORE],
       label: "(e) DROP THE LEGACY FALLBACK in #caseOfSha, so a pre-CASE-3 roster row with a NULL pin "
            + "stops resolving to its case. EXPECTED GREEN HERE, and that expectation is the arm's whole "
            + "value: every row this suite writes is pinned, so THIS suite cannot see it. The suites that "
            + "hold it are publishedcase and caseobject, and saying so is better than leaving a silent gap",
       apply: () => edit(STORE,
         "    const legacy = fallbackEdition != null",
         "    const legacy = false && fallbackEdition != null") },

  /* (f) IS THE ARM THAT CAME BACK NOT-AS-DECLARED, KEPT WITH ITS MEASUREMENT
     RATHER THAN SMOOTHED AWAY. It was written as this item's over-strictness arm
     and it is a genuine over-strictness question — but its subject is a roster
     row whose pin is NULL, and this fixture writes no such row. Its GREEN is
     therefore a statement about the INSTRUMENT, not about the plane, and that
     distinction is exactly what a control exists to make legible. Kept beside
     (e), which has the same shape and the same honest answer. */
  f: { files: [STORE],
       label: "(f) REQUIRE A PIN ON EVERY ROSTER ROW before an edition may be complete. EXPECTED GREEN "
            + "HERE, and that expectation is the arm's value: a roster row written before CASE-3 carries a "
            + "NULL pin HONESTLY and would be withdrawn by this tightening, but this fixture writes no "
            + "unpinned row, so THIS suite cannot see it. Recorded as an instrument limit rather than left "
            + "to read as a defence that held",
       apply: () => edit(STORE,
         "      if (!r) { awaiting.push(m.bundle_id); continue; }\n"
       + "      findings.push({ ord: m.ord, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,",
         "      if (!r || !m.version_sha) { awaiting.push(m.bundle_id); continue; }\n"
       + "      findings.push({ ord: m.ord, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,") },
};

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

  let tally = "(not run)";
  try {
    arm.apply();
    /* CAPTURED TO A FILE, NEVER A PIPE (rule 3), and run ONCE. A red suite exits
       1, which is the EXPECTED outcome of an armed arm and is a result rather
       than an error. A suite that DIES before its own summary is reported as
       exactly that: an arm whose damage is upstream of the assertions is a
       finding, not a pass. */
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/caseflip: (\d+) passed, (\d+) failed/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^  FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 130));
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: failed.length });
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
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} named failure(s))`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
