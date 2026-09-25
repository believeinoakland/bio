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
 *   - THE HARNESS DIRECTORY IS OUTSIDE THIS WORKTREE, in a per-run `mkdtemp`
 *     under the session's own temp root. CORRECTED 2026-09-24 by UI-97, never
 *     exempted: this read *"INSIDE THIS WORKTREE (`.ui45-harness/`), never a
 *     shared scratchpad two sessions can collide in"* and the collision half was
 *     RIGHT and is kept — `mkdtemp` answers it by UNIQUENESS rather than by
 *     location. What was wrong is the location: BOB #32 RULED on 2026-09-24
 *     (WORKER.md, "KEEP EVERY SCRATCH FILE OUT OF YOUR WORKTREE") that a file in
 *     a worktree is not inert — repository-walking suites WALK IT, it trips
 *     `gates.mjs` §2e, and it makes the tree DIRTY, so D-293 refuses to RECORD a
 *     GREEN verdict. THREE ITEMS PAID FOR THAT IN ONE NIGHT. This driver put two
 *     full copies of `app.html` in the worktree for the length of every run.
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
 * UI-93, RUN 2026-09-24: nineteen arms, 19 as declared, 0 not, exit 0; every
 * restore verified by sha256 AND cmp; the baseline row reads 85 pass, 0 fail.
 * ARM 15 (the item's row names it: return "" for a `run` subject, which is the
 * surface exactly as it shipped before UI-93) RED at "§7 THE RUN IS NAMED", and it
 * takes three more §7 arms with it; ARM 15b (drop the plane's reach sentence) RED
 * at "…NOBODY COULD BE NAMED"; ARM 16 (over-strictness, the subject line built
 * from an array) GREEN.
 *
 * AND ARM 15 IS THE ONE WORTH READING, for the second time in this file's life and
 * for the same reason ARM 8 was: **it came back RED-but-NOT-AS-DECLARED on its
 * first run, and the ARM was wrong rather than the subject.** §7's run arms were
 * first written as `html.includes(RUN_ID)`. With the `run` branch reverted to
 * `return ""` that arm stayed GREEN — the producer's published id IS
 * `OBLIGATION::bias-debt::<run>` and `queueItemHtml` prints it into the item's
 * `data-id`, so the run's id is on the page whether or not any renderer names it.
 * An arm that costs nothing to satisfy is the class WORKER.md warns about, met
 * here on the one field of the item that could not be dropped. The arms now pin
 * the rendered PHRASE, which only `queueSubjectHtml` can produce, and §7 carries
 * the measurement as an instrument assertion so the next reader is told rather
 * than left to rediscover it.
 *
 * UI-86, RUN 2026-09-24: sixteen arms, 16 as declared, 0 not, exit 0; every
 * restore verified by sha256 AND cmp. ARM 12 (restore the CONDITION-only filter)
 * RED at "§2 a FINDING is offered a mute" and the case-form arm beside it; ARM 13
 * (the liar — control offered, case form sent) RED at "…AS THE ITEM FORM"; ARM
 * 13b (report ignores `mute.items`) RED at "…SUPPRESSION READS UNDER mute.items"
 * and the not-live arm; ARM 14 (over-strictness, `includes` spelling) GREEN.
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
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const APP = path.join(UI, "app.html");
const SUITE = path.join(HERE, "notifications.test.mjs");
/* UI-97: per-run and OUTSIDE the worktree (see the practices above). `UI45_PEN`
   lets a caller name the root; a session scratchpad is the right one to name. */
const PEN = fs.mkdtempSync(path.join(process.env.UI45_PEN || os.tmpdir(), "ui45-harness-"));

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

  /* UI-86's arms. The row's NEGATIVE CONTROL is 12; 13 is its "how a liar passes
     it" clause made into an arm; 13b breaks the report's read of `mute.items`;
     14 is the over-strictness half. */
  { id: "12-condition-only-mute-filter", file: APP, mustFail: true, says: "a FINDING is offered a mute",
    what: "RESTORE THE CONDITION-ONLY FILTER — `queueMutableItem` admits CONDITION alone, the pre-D-125 rule, so a finding is offered no mute in either form",
    patch: (t) => {
      const a = '  return !!it && (it.class === "CONDITION" || it.class === "FINDING");';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  return !!it && it.class === "CONDITION";');
    } },

  { id: "13-liar-sends-case-form", file: APP, mustFail: true, says: "AS THE ITEM FORM",
    what: "THE LIAR — the per-item control is still OFFERED, but what it sends is the CASE form over the item's kind, which would silence every item of that kind on the case",
    patch: (t) => {
      const a = '    const res = await recPostR("queuemute", { item: itemId });';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '    const it0 = QUEUE_ITEMS.get(String(itemId)) || {};\n'
        + '    const res = await recPostR("queuemute", { case: (((it0.case||{}).ancestors||[])[0]||{}).id || null, kinds: [it0.kind] });');
    } },

  { id: "13b-report-ignores-items", file: APP, mustFail: true, says: "SUPPRESSION READS UNDER mute.items",
    what: "THE REPORT STOPS READING `mute.items` — the pre-UI-86 report, which drew nothing unless a CASE was muted, so an item mute made the feed quietly shorter",
    patch: (t) => {
      const a = '  const muted = Array.isArray(m.items) ? m.items : [];';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  const muted = [];');
    } },

  { id: "14-over-strictness-mutable", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — `queueMutableItem` written with `includes` over the two classes, the same rule in a spelling this suite's author did not choose, which must PASS",
    patch: (t) => {
      const a = '  return !!it && (it.class === "CONDITION" || it.class === "FINDING");';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  return !!it && ["FINDING", "CONDITION"].includes(it.class);');
    } },

  /* UI-93's arms. 15 IS THE ROW'S OWN NEGATIVE CONTROL — return "" for a `run`
     subject again, which is byte-for-byte the state the surface shipped in before
     this item and is the reason the item exists. 15b breaks the other half the row
     names (the plane's reach sentence where it could name nobody). 16 is the
     over-strictness half: the SAME rendering built a way this suite's author did
     not choose, which must stay GREEN. */
  { id: "15-run-subject-renders-nothing", file: APP, mustFail: true, says: "THE RUN IS NAMED",
    what: "RETURN \"\" FOR A RUN SUBJECT AGAIN — the pre-UI-93 surface exactly: the bias-debt obligation still says a re-run is owed and no longer says on WHICH run (the row's named control)",
    patch: (t) => {
      const a = '    return `<span class="q-on">on the run <span class="mono">${esc(s.id||"")}</span>${where}</span>` + note;';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '    return "";');
    } },

  { id: "15b-reach-sentence-dropped", file: APP, mustFail: true, says: "NOBODY COULD BE NAMED",
    what: "DROP THE PLANE'S REACH SENTENCE — where the producer could name nobody inside the run's read gate it publishes ONE sentence saying so, and this arm stops rendering it, which leaves an obligation addressed to nobody visible and no statement of who it reaches",
    patch: (t) => {
      const a = '      ? `<div class="q-recip">${esc(it.recipients_stated)}</div>` : "";';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '      ? "" : "";');
    } },

  { id: "16-over-strictness-run-subject", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — the same subject line assembled from an array instead of one template, a spelling this suite's author did not choose, which renders the identical HTML and must PASS",
    patch: (t) => {
      const a = '    return `<span class="q-on">on the run <span class="mono">${esc(s.id||"")}</span>${where}</span>` + note;';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '    const parts = ["on the run ", `<span class="mono">${esc(s.id||"")}</span>`, where];\n'
        + '    return `<span class="q-on">` + parts.join("") + `</span>` + note;');
    } },

  /* UI-97's arms (numbered 15/16/16b/17 on its own branch; renumbered 18/19/19b/20 by CONDUCT #20 at
     c20-batch27 because UI-93 holds 15/15b/16). 18 is the state this item FOUND — a member with no way
     back; 19 is the row's own NEGATIVE CONTROL (omit `unmute:true`, and the round trip fails by name);
     19b is the honesty half, a case undo drawn over kinds this surface cannot see; 20 is the
     over-strictness arm. */
  { id: "18-report-offers-no-undo", file: APP, mustFail: true, says: "carries a per-item undo",
    what: "THE REPORT OFFERS NO UNDO — the state this item found: `op=queuemute` takes `unmute` in both forms and the app never sends it, so a member who mutes something here has no way back",
    patch: (t) => {
      const a = "  if(PLANE.me && PLANE.me.session){";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  if(false){");
    } },

  { id: "19-undo-omits-the-flag", file: APP, mustFail: true, says: "AS THE ITEM FORM CARRYING unmute",
    what: "THE ROW'S OWN ARM — the undo sends `{ item }` and omits `unmute: true`. The plane's item form is an idempotent UPSERT, so the undo silently RE-MUTES and the member stays silenced",
    patch: (t) => {
      const a = '    const res = await recPostR("queuemute", { item: itemId, unmute: true });';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '    const res = await recPostR("queuemute", { item: itemId });');
    } },

  { id: "19b-case-undo-guesses-kinds", file: APP, mustFail: true, says: "draws NO undo control",
    what: "THE CASE UNDO IS DRAWN OVER KINDS THE SURFACE CANNOT SEE — `op=queue` publishes `mute.cases` as case ids and the muted KINDS nowhere, so a control drawn where none is suppressed would send a set this page guessed at (D-534)",
    patch: (t) => {
      const a = "      if(!kinds.length)\n        return `<div class=\"q-unmute q-unmute-none\"";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "      if(false)\n        return `<div class=\"q-unmute q-unmute-none\"");
    } },

  { id: "20-over-strictness-unmute", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — both undo acts send the flag in a spelling this suite's author did not choose (`Boolean(1)`), which is the same body and must PASS",
    patch: (t) => {
      const a = '    const res = await recPostR("queuemute", { item: itemId, unmute: true });';
      const b = '    const res = await recPostR("queuemute", { case: caseId, kinds: named, unmute: true });';
      if (t.split(a).length - 1 !== 1 || t.split(b).length - 1 !== 1) return null;
      return t.replace(a, '    const res = await recPostR("queuemute", { item: itemId, unmute: Boolean(1) });')
              .replace(b, '    const res = await recPostR("queuemute", { case: caseId, kinds: named, unmute: Boolean(1) });');
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
