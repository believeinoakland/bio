#!/usr/bin/env node
/* notifications.control.mjs — UI-45'S NEGATIVE CONTROL DRIVER.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, and
 * `civicos-ui/test/run.mjs` discovers `*.test.mjs`; a driver the harness picked
 * up would mutate `app.html` underneath every other suite. UI-42's
 * `version-review.control.mjs` sets the shape and this follows it.
 *
 *     node civicos-ui/test/notifications.control.mjs
 *
 * THE PRACTICES, each of which this estate has paid for:
 *   - EACH ARM IS ARMED ALONE, every other defence held open.
 *   - THERE IS A BASELINE ARM that patches NOTHING and must come back GREEN.
 *     Without it, "every arm failed" cannot be told from "the harness is
 *     broken" — a driver in this repository once reported `null` for every arm
 *     INCLUDING the baseline, and only the baseline row made the two
 *     distinguishable.
 *   - EVERY ARM DECLARES ITS EXPECTATION BEFORE IT RUNS: RED or GREEN, and for
 *     a RED arm the text the failure must contain. An arm coming back GREEN
 *     when RED was declared is a FINDING ABOUT THE ARM and is printed as one.
 *   - EVERY PATCH IS ASSERTED TO HAVE ARMED: the anchor must occur EXACTLY ONCE
 *     and the bytes must differ afterwards. A patch that matched zero times
 *     FAILS the driver rather than quietly testing nothing.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY `cmp`, against a PER-ARM
 *     pristine copy whose filename carries the ARM ID as well as the path, AND
 *     against a pristine-of-record taken before any arm ran.
 *   - THE HARNESS DIRECTORY IS INSIDE THIS WORKTREE (`.ui45-harness/`), never a
 *     shared scratchpad two sessions can collide in.
 *
 * ------------------------------------------------------------ RESULTS, RUN
 *
 * RUN 2026-08-09 in worktree `agent-a4f9c3083de5f28e3`. Twelve arms, each armed
 * alone; every restore verified by sha256 AND `cmp` against two independent
 * pristine copies. FINAL: 12 arms, 12 as declared, 0 not — but ONE CAME BACK
 * NOT AS DECLARED ON ITS FIRST RUN, and it was the ARM that was wrong rather
 * than the subject. **ARM 8 was RED, correctly, and the driver called it NOT AS
 * DECLARED because its `says` string quoted the SENTENCE THE PATCH DELETES**
 * instead of the assertion that fires when it is gone — an expectation that
 * could only ever be wrong. Recorded here rather than smoothed away; the
 * general rule is now written at the arm: `says` quotes the ASSERTION, never
 * the source.
 *
 * THE TWO THE ITEM'S ROW NAMES ARE ARMS 1 AND 3:
 *
 *   (1) RENDER A SLUG WITH SURFACE-AUTHORED WORDING — the queue's item renderer
 *       composes its own sentence about the notification instead of rendering
 *       the producer's `summary`. DECLARED: RED, the §1 verbatim arms.
 *       ACTUAL: RED — the lead's, the derived proposal's and the condition's
 *       summaries all stop reaching the page, and §2's grain arms go with them
 *       because the sweep phases they read are the same page. That is DEC-8's
 *       drift class measured rather than promised.
 *   (3) A DISMISSED PROPOSAL VANISHES FROM THE RECORD — `notifDisposedHtml`
 *       returns nothing, which is exactly the state the surface shipped in
 *       before this item: the finding leaves the open list and the screen says
 *       nothing about where it went. DECLARED: RED, "IT DID NOT VANISH".
 *       ACTUAL: RED, and it takes the reason arm and the re-triage arm with it.
 *
 * AND THE ARM WORTH READING IS 5, because it is the defect this item FOUND
 * rather than the one it was sent for: making `notifDispositionKeyed` answer
 * true for everything restores the pre-UI-45 surface exactly — Adopt, Defer and
 * Dismiss drawn on an out-of-inquiry lead, three controls `op=proposedispose`
 * can only refuse. It comes back RED naming the lead, which is the measurement
 * that the fix is load-bearing rather than tidy.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const APP = path.join(UI, "app.html");
const SUITE = path.join(HERE, "notifications.test.mjs");
const PEN = path.join(UI, ".ui45-harness");
fs.mkdirSync(PEN, { recursive: true });

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const same = (a, b) => { try { execFileSync("cmp", ["-s", a, b]); return true; } catch (_) { return false; } };

/* THE PRISTINE-OF-RECORD, taken ONCE before any arm and never overwritten. The
   byte floor is here because two harnesses in this repository once reported a
   restore byte-identical OVER AN EMPTY MANIFEST, caught only by a digest
   reading e3b0c442… — the sha256 of the empty string. */
const RECORD = {};
for (const [k, p] of Object.entries({ app: APP, suite: SUITE })) {
  RECORD[k] = path.join(PEN, `record.${path.basename(p)}`);
  fs.copyFileSync(p, RECORD[k]);
  const bytes = fs.statSync(RECORD[k]).size;
  if (bytes < 2000) { console.error(`PRISTINE-OF-RECORD ${k} is ${bytes} bytes — refusing to run over an empty manifest`); process.exit(1); }
  console.log(`pristine-of-record ${k}: ${bytes} bytes, sha256 ${sha(RECORD[k]).slice(0, 16)}…`);
}

const ARMS = [
  { id: "1-surface-authored-wording", file: APP, mustFail: true, says: "verbatim",
    what: "RENDER A SLUG WITH SURFACE-AUTHORED WORDING — the item renderer composes its own sentence about the notification instead of rendering the producer's (DEC-8's drift class; the item's first named NC)",
    patch: (t) => {
      const a = '    <div class="q-summary">${esc(it.summary||"")}</div>';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '    <div class="q-summary">Something happened on this ${esc(String(it.kind||"").replace(/[-_]+/g," "))}.</div>');
    } },

  { id: "2-per-kind-wording-table", file: APP, mustFail: true, says: "PER-KIND WORDING TABLE",
    what: "A PER-KIND WORDING TABLE ON THE SURFACE — the plane's own kind sentences copied into the browser, which is two answers to one question in two repositories",
    patch: (t) => {
      const a = "const NOTIF_BASIS_ENTRY_WORD = {";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a,
        'const NOTIF_KIND_SENTENCE = {\n'
        + '  "out-of-inquiry-lead": "evidence for another question turned up",\n'
        + '  "missing_predecessor": "a required predecessor stage is absent",\n'
        + '};\n' + a);
    } },

  { id: "3-disposed-proposal-vanishes", file: APP, mustFail: true, says: "IT DID NOT VANISH",
    what: "A DISMISSED PROPOSAL VANISHES FROM THE RECORD — the aged receipt is not rendered, so a finding leaves the open list and the screen says nothing about where it went (the item's second named NC, and the state the surface shipped in)",
    patch: (t) => {
      const a = "function notifDisposedHtml(){\n  if(!NOTIF_DISPOSED.size) return \"\";";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "function notifDisposedHtml(){\n  if(true) return \"\";\n  if(!NOTIF_DISPOSED.size) return \"\";");
    } },

  { id: "4-collapse-undetermined", file: APP, mustFail: true, says: "UNDETERMINED IS NOT COLLAPSED",
    what: "COLLAPSE `undetermined` INTO `absent` — the surface tells a member the record has checked when it has not (PL-15's named overclaim, the one the plane refused to make)",
    patch: (t) => {
      const a = '  undetermined: "Whether this document is part of any case is UNDETERMINED — the record could not look, so this is not a statement that it is part of nothing.",';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  undetermined: "The record LOOKED, and this document is part of no case. It was captured, and it was not made part of any question\'s evidence.",');
    } },

  { id: "5-controls-on-every-finding", file: APP, mustFail: true, says: "AND NOT ON THE LEAD",
    what: "DRAW THE DISPOSITION CONTROLS ON EVERY FINDING — the pre-UI-45 surface exactly: Adopt, Defer and Dismiss on a lead op=proposedispose can only ever refuse",
    patch: (t) => {
      const a = "  return !!(pk && sk);";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  return true;");
    } },

  { id: "6-paper-over-the-grain", file: APP, mustFail: true, says: "options_grain",
    what: "PAPER OVER `options_grain` — the acts row renders with no account of the grain the record declared missing (D-222), which is how a member concludes the lead is broken",
    patch: (t) => {
      const a = "function notifOptionsGrainHtml(it){\n  const g = it && it.options_grain;";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "function notifOptionsGrainHtml(it){\n  if(true) return \"\";\n  const g = it && it.options_grain;");
    } },

  { id: "7-deferred-reads-as-all-clear", file: APP, mustFail: true, says: "DEFERRED CLASS",
    what: "A CLASS NOTHING PRODUCES YET READS AS ONE THAT LOOKED AND FOUND NOTHING — the exact collapse `CLAUDE.md` names: absence at one level reported as absence at the next",
    patch: (t) => {
      const a = "  if(deferred.includes(cls))";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  if(false && deferred.includes(cls))");
    } },

  /* `says` QUOTES THE ASSERTION, NOT THE SOURCE — and that distinction cost this
     arm its first run. It was written quoting the SURFACE's own sentence
     ("covers three different situations on purpose"), which the arm DELETES, so
     the string could never appear in a failure report about its deletion. The
     arm was RED and correct and the driver called it NOT AS DECLARED. Recorded
     rather than smoothed: a `says` that quotes what the patch removes is an
     expectation that can only ever be wrong. */
  { id: "8-null-stance-reads-as-a-choice", file: APP, mustFail: true, says: "A NULL `current` IS NOT",
    what: "A NULL `current` READS AS 'this project has not chosen' — one of three situations the plane collapses on purpose, picked and stated as fact",
    patch: (t) => {
      const a = "    return '<div class=\"q-gap\"><b>The record names no reading for this project on this question.</b> '";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "    return '<div class=\"q-gap\"><b>This project has not chosen a reading yet.</b> '");
    } },

  { id: "9-over-strictness-keyed", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — `notifDispositionKeyed` written correctly in a spelling this suite's author did not choose, which must PASS",
    patch: (t) => {
      const a = '  const pk = typeof b.progression_key === "string" ? b.progression_key.trim() : "";\n  const sk = typeof b.stage_key === "string" ? b.stage_key.trim() : "";\n  return !!(pk && sk);';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a,
        '  const nonEmpty = (x) => typeof x === "string" && x.trim().length > 0;\n'
        + '  return nonEmpty(b.progression_key) && nonEmpty(b.stage_key);');
    } },

  { id: "9b-over-strictness-published", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — `current`'s published-versus-null test written with `in` instead of `hasOwnProperty`, which is the same question asked differently and must PASS",
    patch: (t) => {
      const a = '    STANCE.currentPublished = Object.prototype.hasOwnProperty.call(answer, "current");';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '    STANCE.currentPublished = ("current" in answer);');
    } },

  { id: "10-sweep-goes-blind", file: SUITE, mustFail: true, says: "REACH: the sweep has a corpus",
    what: "THE SWEEP GOES BLIND — `keep()` stops collecting phases, so the vocabulary ban runs over an empty corpus and must FAIL ON ITS FLOOR rather than report clean (three headline totality assertions in this repository have PASSED OVER AN EMPTY CORPUS)",
    patch: (t) => {
      const a = "const keep = (where, html) => { PHASES.push([where, html]); return html; };";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "const keep = (where, html) => { return html; };");
    } },

  { id: "11-baseline", file: APP, mustFail: false,
    what: "BASELINE — no patch at all. Without this row, ten arms failing for the wrong reason looks like ten arms working",
    patch: (t) => t },
];

const run = () => {
  try { return { code: 0, out: execFileSync("node", [SUITE], { encoding: "utf8", stdio: "pipe" }) }; }
  catch (e) { return { code: e.status === undefined ? -1 : e.status,
                       out: String(e.stdout || "") + String(e.stderr || "") }; }
};

const results = [];
let broken = 0;
for (const arm of ARMS) {
  const key = path.basename(arm.file);
  const pristine = path.join(PEN, `${arm.id}.${key}.pristine`);   // UNIQUE per arm, never path alone
  fs.copyFileSync(arm.file, pristine);
  const before = fs.readFileSync(arm.file, "utf8");
  const after = arm.patch(before);
  const armed = after !== null && (arm.id === "11-baseline" || after !== before);
  if (after === null || !armed) {
    console.error(`ARM ${arm.id}: THE PATCH NEVER ARMED — its anchor did not appear exactly once. This is a FINDING about the arm, not about the subject.`);
    broken++;
    fs.copyFileSync(pristine, arm.file);
    results.push({ arm, armed: false, asDeclared: false });
    continue;
  }
  fs.writeFileSync(arm.file, after);
  const r = run();
  /* RESTORE, THEN VERIFY TWICE AND AGAINST TWO COPIES. */
  fs.copyFileSync(pristine, arm.file);
  const rec = RECORD[arm.file === APP ? "app" : "suite"];
  const okSha = sha(arm.file) === sha(pristine) && sha(arm.file) === sha(rec);
  const okCmp = same(arm.file, pristine) && same(arm.file, rec);
  if (!okSha || !okCmp) {
    console.error(`ARM ${arm.id}: RESTORE FAILED (sha256 ${okSha}, cmp ${okCmp}) — STOPPING`);
    process.exit(1);
  }
  const failed = r.code !== 0;
  const asDeclared = failed === arm.mustFail
    && (!arm.says || !arm.mustFail || r.out.includes(arm.says));
  if (!asDeclared) broken++;
  results.push({ arm, armed, r, failed, asDeclared });
  const tally = (r.out.split("\n").find(l => /^notifications\.test\.mjs: /.test(l)) || "").trim();
  console.log(`ARM ${arm.id.padEnd(30)} armed=${armed} declared=${arm.mustFail ? "RED" : "GREEN"} `
    + `actual=${failed ? "RED" : "GREEN"} ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
  console.log(`    ${tally}`);
  for (const l of r.out.split("\n").filter(l => /^\s+FAIL /.test(l)).slice(0, 4))
    console.log(`    ${l.trim().slice(0, 170)}`);
}

console.log(`\n${results.length} arms run, ${results.filter(x => x.asDeclared).length} as declared, `
  + `${broken} NOT as declared. Every restore verified by sha256 AND cmp against a per-arm pristine copy `
  + `AND against a pristine-of-record taken before any arm ran.`);

/* THE PEN IS REMOVED ONLY AFTER EVERY RESTORE HAS BEEN VERIFIED, and it is
   removed at all because an untracked scratch file left in a worktree has
   already been swept into another item's walk and counted into its baseline
   (WORKER.md). On a run that ends early the pen SURVIVES on purpose — that is
   the state where a restore may not have happened and the pristine copies are
   the evidence. */
if (!broken) { fs.rmSync(PEN, { recursive: true, force: true }); }
process.exit(broken ? 1 : 0);
