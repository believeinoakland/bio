/* M0-22 — THE NEGATIVE CONTROLS AND THE CLOCK-ADVANCED ARM, as a DRIVER rather
 * than as a paragraph. Deliberately NOT a suite (`.control.mjs`, the convention
 * `d249-port.control.mjs` and `d266.control.mjs` already use): the battery does
 * not discover it, and it is run by hand, by name, from the declaration in
 * `action-loop.test.mjs`.
 *
 *     node bio-plane/test/clockadvance.control.mjs          # every arm
 *
 * WHY A DRIVER. This item's whole subject is a suite that went red because the
 * CALENDAR moved. "The new date is far enough in the future" is the same
 * reasoning that produced the defect, so the arm has to be RUN. The system clock
 * is not ours to set; `clockshift.preload.mjs` moves node's instead, and its
 * blind spot (workerd) is named there and closed by arm (4) below.
 *
 * EVERY ARM IS ARMED ALONE AND RESTORED BY CONTENT *AND* BY SHA256. UI-38 met
 * an NC harness that reported a byte-identical restore over a file it had not
 * restored, and PL-10 met a harness overwritten mid-turn by a concurrent worker
 * — which is why this file lives in this worktree and never in a shared
 * scratchpad, and why a restore that does not verify ABORTS rather than warns.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const SUITE = "test/action-loop.test.mjs";
const CHECKS = "checks/bio-checks.mjs";
const PRELOAD = "./test/clockshift.preload.mjs";
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const sha = (s) => createHash("sha256").update(s).digest("hex");
const read = (rel) => readFileSync(PLANE + rel, "utf8");

let armsRun = 0, armsOk = 0;
const say = (ok, label, detail) => {
  armsRun++; if (ok) armsOk++;
  console.log(`  ${ok ? "OK  " : "MISS"}  ${label}\n         ${detail}`);
};

/* Run the suite, optionally with node's clock shifted. Returns {code, pass, fail}.
   The exit code is taken from spawnSync's status DIRECTLY — nothing is piped, so
   nothing else's status can be mistaken for the suite's (REC-49). */
const runSuite = (shiftMs = 0) => {
  if (ANCHOR_DRY) return { code: 0, pass: 0, fail: 0, failed: [] };   /* M0-197: no suite under the dry read */
  const r = spawnSync(process.execPath,
    shiftMs ? ["--import", PRELOAD, SUITE] : [SUITE],
    { cwd: PLANE, encoding: "utf8",
      env: { ...process.env, CLOCK_SHIFT_MS: String(shiftMs) } });
  const m = /action-loop: (\d+) pass, (\d+) fail/.exec(r.stdout || "");
  return { code: r.status, pass: m ? +m[1] : null, fail: m ? +m[2] : null,
           failed: [...(r.stdout || "").matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1]) };
};

/* Arm a file by substitution, run a probe, restore, and VERIFY the restore two
   ways before letting the process continue. */
const armed = (rel, from, to, probe) => {
  /* M0-197: under tools/anchordrift.mjs an arm is READ, never armed ("any": it arms on >= 1 match, edits the first). */
  if (ANCHOR_DRY) return (anchorRows([{ arm: `${rel} ${from.slice(0, 40)}`, file: PLANE + rel, find: from, put: to, sites: "any" }]), probe());
  const path = PLANE + rel;
  const original = readFileSync(path, "utf8");
  const originalSha = sha(original);
  if (!original.includes(from)) {
    throw new Error(`ARM TARGET ABSENT in ${rel}: the harness is stale against the file it arms.\n  ${from}`);
  }
  const broken = original.replace(from, to);
  if (broken === original) throw new Error(`ARM WAS A NO-OP in ${rel}`);
  let out;
  try {
    writeFileSync(path, broken);
    out = probe();
  } finally {
    writeFileSync(path, original);
    const back = readFileSync(path, "utf8");
    /* BY CONTENT and BY SHA256. Either alone has been enough to report a restore
       that did not happen. */
    if (back !== original || sha(back) !== originalSha) {
      throw new Error(`RESTORE FAILED for ${rel} — sha ${sha(back)} vs ${originalSha}. STOPPING.`);
    }
  }
  return out;
};

console.log("M0-22 clock-advance + negative controls\n");

/* ---------------------------------------------------------------- BASELINE */
const base = runSuite(0);
say(base.code === 0 && base.fail === 0,
  "BASELINE — the suite at the true wall clock",
  `exit ${base.code}, ${base.pass} pass / ${base.fail} fail`);

/* ---- (1) THE ARM THIS ITEM EXISTS FOR: advance the clock and stay GREEN ---- */
for (const [label, yrs] of [["+1 year", 1], ["+5 years", 5], ["+20 years", 20]]) {
  const r = runSuite(yrs * YEAR_MS);
  say(r.code === 0 && r.fail === 0,
    `(1) CLOCK ADVANCED ${label} — must stay GREEN`,
    `exit ${r.code}, ${r.pass} pass / ${r.fail} fail`
      + (r.fail ? `\n         FAILED: ${r.failed.join(" | ")}` : ""));
}

/* ---- (1b) THE ASYMMETRY, DRIVEN — the whole argument for pinning over moving.
   The rejected fix is "move the date": the pins removed, `DUE` pushed just past
   the wall. It is GREEN today and RED a year out, while the pinned suite above
   is green at +20 years.

   AND THE ARM MEASURED SOMETHING SHARPER THAN IT WAS WRITTEN TO MEASURE, kept
   because it is the better argument. The first draft pushed `DUE` a YEAR out
   (2027-09-10) and expected green-today; it read 77 pass / 2 FAIL — the moved
   date is not green today EITHER, because `DUE` must stay BELOW `AFTER_MS`
   (2026-09-20) for section 5's before/after instrument to mean anything, and a
   date pushed past it makes the same bytes read `false` at BOTH instants.
   **So the date-move fix has a viable window of NINE DAYS** — `DUE` must be
   above the wall (2026-09-10) and below AFTER_MS (2026-09-20) — and buying more
   than that requires moving BEFORE_MS and AFTER_MS too, at which point the
   "one-line edit" is the whole instrument and has simply been rescheduled.
   `2026-09-19` below is the most generous such date that exists. ---- */
{
  const suiteSrc = !ANCHOR_DRY ? read(SUITE)   /* M0-197: under the dry read, a recorder reads the (1b) chain's anchors */
    : { replace(find, put) { anchorRows([{ arm: "(1b)", file: PLANE + SUITE, find, put, sites: "any" }]); return this; } };
  const dateMoved = suiteSrc
    /* the LAST date that is green today: above the wall, still below AFTER_MS. */
    .replace('const DUE = "2026-09-10";', 'const DUE = "2026-09-19";')
    .replace("VERSION: \"test\", BIO_NOW_MS: String(BEFORE_MS) },", "VERSION: \"test\" },")
    .replace("const errorsOf = async (id, text, nowMs = BEFORE_MS) => {",
             "const errorsOf = async (id, text, nowMs = undefined) => {")
    /* the three M0-22 arms assert the pin itself, so the rejected fix cannot
       carry them; they are removed so the comparison is only about the date. */
    .replace(/\/\* =+\n {3}5a\. C-11\.1's PAST-DUE ARM[\s\S]*?\n}\n\n(?=\/\* =+\n {3}6\.)/, "");
  const path = PLANE + SUITE;
  const original = readFileSync(path, "utf8"), originalSha = sha(original);
  if (dateMoved === original) throw new Error("(1b) arm was a no-op — the harness is stale");
  let today, later;
  try {
    if (!ANCHOR_DRY) writeFileSync(path, dateMoved);
    today = runSuite(0);
    later = runSuite(1 * YEAR_MS);
  } finally {
    if (!ANCHOR_DRY) writeFileSync(path, original);
    const back = readFileSync(path, "utf8");
    if (back !== original || sha(back) !== originalSha) {
      throw new Error(`RESTORE FAILED for ${SUITE}. STOPPING.`);
    }
  }
  say(today.fail === 0 && later.fail > 0,
    "(1b) THE REJECTED FIX (move the date, drop the pins) — GREEN today, RED at +1 year",
    `wall: exit ${today.code}, ${today.pass} pass / ${today.fail} fail · +1y: exit ${later.code}, `
      + `${later.pass} pass / ${later.fail} fail\n         `
      + `THE ASYMMETRY: ${later.fail} assertion(s) that pass today fail a year out, and this date `
      + `is already only 9 days from failing. The pinned suite above: 0 fail at +20 years.`);
}

/* ---- (2) OVER-STRICTNESS. C-11.1's past-due branch is a LIVE production rule
   (op=audit calls checkBundle with no nowMs, so it fires against the wall).
   Neuter it and section 5a must FAIL — otherwise "the suite is green" and
   "the check was deleted" are the same reading. ---- */
{
  const r = armed(CHECKS,
    "if (DATE_RE.test(e.date || '') && e.date < today && e.status === 'pending') {",
    "if (false) {",
    () => runSuite(0));
  const named = r.failed.filter((l) => /past-due|silently/.test(l));
  say(r.fail > 0 && named.length > 0,
    "(2) OVER-STRICTNESS — C-11.1's past-due branch neutered: section 5a must FAIL",
    `exit ${r.code}, ${r.pass} pass / ${r.fail} fail\n         FAILED: ${r.failed.join(" | ")}`);
}

/* ---- (3) THE PAST-DUE FIXTURE IS PAST-DUE BY DESIGN. Move section 5a's
   deliberately-stale window to a date AFTER the pinned instant and the arm must
   fail — proving the assertion is about the date's relation to the pinned NOW
   and not merely about the string being present. ---- */
{
  const r = armed(SUITE, 'const LONG_PAST = "2026-08-01";', 'const LONG_PAST = "2026-08-30";',
    () => runSuite(0));
  say(r.fail > 0,
    "(3) THE STALE FIXTURE IS LOAD-BEARING — window moved after the pinned instant",
    `exit ${r.code}, ${r.pass} pass / ${r.fail} fail\n         FAILED: ${r.failed.join(" | ")}`);
}

/* ---- (4) THE WORKERD HALF: is BIO_NOW_MS actually doing work? Remove the
   binding ALONE (the catalog stays pinned) and the CACHED-column assertion must
   fail, because that column is then written from the true wall. This is what
   closes the preload's stated blind spot by measurement instead of by argument:
   the store's wall-clock fallback is unreachable for this suite only while the
   binding is there, so the binding is proved rather than assumed. ---- */
{
  const r = armed(SUITE, "VERSION: \"test\", BIO_NOW_MS: String(BEFORE_MS) },",
    "VERSION: \"test\" },", () => runSuite(0));
  const cached = r.failed.filter((l) => /CACHED column/.test(l));
  say(r.fail > 0 && cached.length > 0,
    "(4) THE PIN IS LOAD-BEARING — BIO_NOW_MS removed alone: the CACHED column goes to the wall",
    `exit ${r.code}, ${r.pass} pass / ${r.fail} fail\n         FAILED: ${r.failed.join(" | ")}`);
}

/* ---- FINAL: the tree is as it was. Stated as a hash, not as a belief. ---- */
console.log(`\nrestored: ${SUITE} ${sha(read(SUITE)).slice(0, 16)} · ${CHECKS} ${sha(read(CHECKS)).slice(0, 16)}`);
console.log(`\nclockadvance: ${armsOk}/${armsRun} arms as expected`);
anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */
process.exit(armsOk === armsRun ? 0 : 1);
