#!/usr/bin/env node
/* UI-61's NEGATIVE CONTROL DRIVER — the arms for `content-extent.test.mjs`.
 *
 * Run from the REPO ROOT:
 *     node civicos-ui/test/content-extent.control.mjs            # every arm
 *     node civicos-ui/test/content-extent.control.mjs stalehidden
 *
 * THE DISCIPLINE, and it is not decoration. Each arm EDITS A REAL SOURCE, is
 * armed ALONE with every other arm held open, and is restored from a
 * UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by `cmp`, with the
 * byte count printed and a minimum guarded. It NEVER uses `git checkout --`,
 * which restores to HEAD and has twice in this repository discarded a session's
 * own uncommitted work.
 *
 * `baseline` is an arm and is the first one: it arms nothing and MUST be green.
 * It is what distinguishes "six arms working" from "six arms broken", and
 * without it a driver whose edits all failed to apply reports six red arms and
 * looks like a triumph.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const APP = ROOT + "civicos-ui/app.html";
const CHECK = ROOT + "civicos-ui/check-semantics.mjs";
const SUITE = ROOT + "civicos-ui/test/content-extent.test.mjs";

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* THE ARMS. `file` is what is edited; `from`/`to` is a single unique string
   replacement; `expect` is what the arm must produce and is declared HERE,
   before it is run, so a surprising result is a finding rather than a
   description. */
const ARMS = {
  baseline: { file: null, why: "nothing armed — this MUST be green, and it is what proves the other arms are real" },

  /* THE ITEM'S OWN CONTROL, named in the brief: hide the stale flag with a
     one-line change and the harness must FAIL NAMING THE SURFACE. */
  stalehidden: {
    file: APP,
    from: `  if(!s.stale) return head;`,
    to:   `  if(!s.stale || true) return head;`,
    why: "the `stale` flag hidden by a one-line change — the row still renders, its `ref` is still "
       + "correct, and the ONLY thing wrong with it is what it no longer says",
    expect: "FAIL naming the undetermined pane, the plane's own sentence, the retry line and the "
          + "structural mark — on the leg AND on the whole rendered page",
  },

  /* DEC-69's control: prefill an extent and the vocabulary arm must refuse it. */
  prefilled: {
    file: APP,
    from: `    <div class="empty" id="cx-extent">This act writes a leg resting on the <b>whole document</b>`,
    to:   `    <input class="txt" id="cx-extent-page" type="number" value="1">
    <div class="empty" id="cx-extent">This act writes a leg resting on the <b>whole document</b>`,
    why: "a page control PREFILLED with a 1 — the shape DEC-69 forbids, and the one a composer "
       + "drifts into by helpfulness rather than by decision",
    expect: "FAIL on 'it offers NO page input, so nothing is prefilled and no page is forced (DEC-69)'",
  },

  /* DEC-49's control: the surface re-wording the record. */
  reworded: {
    file: APP,
    from: "const head = `<div class=\"subj-how\" style=\"margin-top:6px\"><b>rests on</b> &middot; ${esc(String(s.ref||\"\"))}",
    to:   "const head = `<div class=\"subj-how\" style=\"margin-top:6px\"><b>rests on</b> &middot; ${esc(EXTENT_KIND_WORD[s.extent_kind]||\"part of it\")}",
    why: "the surface describing the citation IN ITS OWN WORDS instead of rendering the record's "
       + "`ref` — the second spelling D-164 exists to close, and it renders a perfectly readable page",
    expect: "FAIL on both verbatim assertions and on the authored-words assertion, plus the page-level one",
  },

  /* The 0-based/1-based seam, which is the one a reader meets as a wrong page. */
  offbyone: {
    file: APP,
    from: `openBundleAtPage(${"${esc(JSON.stringify(String(s.bundle_id||\"\")))}"},${"${e.page+1}"})">open the document at page ${"${e.page+1}"}</a>`,
    to:   `openBundleAtPage(${"${esc(JSON.stringify(String(s.bundle_id||\"\")))}"},${"${e.page}"})">open the document at page ${"${e.page}"}</a>`,
    why: "the record's 0-based page rendered to the reader unconverted — the jump lands one page "
       + "early and the leg says so, which is a citation that looks followed and is not",
    expect: "FAIL on 'the jump names the READER's page, which is 1-based over the record's 0-based page'",
  },

  /* The drift guard's own direction. */
  vocabdrift: {
    file: APP,
    /* CORRECTED 2026-09-23 BY UI-79: this anchor had not matched since FW-19 (c8d9c6cb) wrapped the table onto two
       lines and added three kinds — the arm REFUSED TO ARM on every run since, measured on f05c1efd. It now drops the
       last kind, `image`, from the table as it stands. */
    from: `"sheet-range", "doc-table", "image"];`,
    to:   `"sheet-range", "doc-table"];`,
    why: "an arm dropped from the surface's copy of the grammar — the drift that made the UI's "
       + "tables the part that rotted through the second rename (D-138)",
    expect: "FAIL in check-semantics.mjs naming CONTENT_EXTENT_KINDS as drifted, and FAIL in the "
          + "suite's own section 6",
  },

  /* THE OVER-STRICTNESS DIRECTION, and its held-open half is the point: the
     referent rendering is made unconditional, so a leg that names NO part gains
     a line. Every content-grain assertion stays green and only the pin bites. */
  unconditional: {
    file: APP,
    from: `function legReferentHtml(r){
  if(!r) return "";`,
    to:   `function legReferentHtml(r){
  if(!r) return \`<div class="subj-how" style="margin-top:6px"><b>rests on</b> &middot; the whole document</div>\`;`,
    why: "the referent line drawn for EVERY leg, including the ones that name no part — a sentence "
       + "the record did not say, on every leg already in the record",
    expect: "FAIL on the pristine digest pin (both halves) while every content-grain assertion above "
          + "stays GREEN, which is why the pin is a separate instrument",
  },

  /* The guard that the composer's absence stays MEASURED and not merely stated. */
  citemoved: {
    file: CHECK,
    from: `  CONTENT_EXTENT_KINDS,`,
    to:   `  CONTENT_EXTENT_KINDS as CONTENT_EXTENT_KINDS,`,
    why: "a no-op edit to the guard's import — the CONTROL ON THE CONTROLS: it proves the restore "
       + "machinery and the check-semantics arm are both actually running, and MUST be green",
    expect: "GREEN — a no-op that changes no behaviour; a red here means the driver is broken",
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).filter(([, a]) => a.from).map(([arm, a]) => ({ arm, file: a.file, find: a.from, put: a.to })));

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no such arm: ${only}\n  arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let broke = 0;
for (const name of names) {
  const arm = ARMS[name];
  console.log(`\n${"=".repeat(78)}\nARM ${name} — ${arm.why}`);
  if (arm.expect) console.log(`DECLARED BEFORE ARMING: ${arm.expect}`);

  let pristine = null, before = null;
  if (arm.file) {
    pristine = `${arm.file}.pristine-${name}`;
    fs.copyFileSync(arm.file, pristine);
    before = sha(arm.file);
    const src = fs.readFileSync(arm.file, "utf8");
    const n = src.split(arm.from).length - 1;
    if (n !== 1) {
      console.error(`  REFUSING TO ARM: the anchor matches ${n} time(s), and an arm must be a SINGLE unique replacement.`);
      fs.rmSync(pristine); broke++; continue;
    }
    fs.writeFileSync(arm.file, src.replace(arm.from, arm.to));
    console.log(`  armed: ${arm.file.replace(ROOT, "")} (${before.slice(0, 12)}… -> ${sha(arm.file).slice(0, 12)}…)`);
  }

  let out = "", code = 0;
  try { out = execFileSync("node", [SUITE], { encoding: "utf8", stdio: "pipe" }); }
  catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? 1; }
  /* check-semantics is its own instrument and is run too, because two of the
     arms are only visible there — a driver that ran one instrument would report
     the vocabulary arm as a false green. */
  let cs = "", csCode = 0;
  try { cs = execFileSync("node", [ROOT + "civicos-ui/check-semantics.mjs"], { encoding: "utf8", stdio: "pipe" }); }
  catch (e) { cs = String(e.stdout || "") + String(e.stderr || ""); csCode = e.status ?? 1; }

  const p = (out.match(/^  PASS/gm) || []).length;
  const f = (out.match(/^  FAIL/gm) || []).length;
  const failed = (out.match(/^  FAIL  (.*)$/gm) || []).map((l) => l.replace(/^  FAIL  /, ""));
  console.log(`  RUN: ${p} pass, ${f} FAIL (suite exit ${code}); check-semantics exit ${csCode}`);
  for (const l of failed.slice(0, 12)) console.log(`        FAILED: ${l}`);
  if (csCode !== 0) for (const l of (cs.match(/^FAIL:.*$/gm) || []).slice(0, 6)) console.log(`        check-semantics: ${l}`);

  if (arm.file) {
    fs.copyFileSync(pristine, arm.file);
    const after = sha(arm.file);
    const bytes = fs.statSync(arm.file).size;
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", arm.file, pristine]); } catch (_) { cmpOk = false; }
    fs.rmSync(pristine);
    const good = after === before && cmpOk && bytes > 1000;
    console.log(`  restored: sha256 ${good ? "EQUAL" : "*** MISMATCH ***"} · cmp ${cmpOk ? "identical" : "*** DIFFERS ***"} · ${bytes} bytes`);
    if (!good) { console.error("  *** THE RESTORE DID NOT VERIFY — STOP AND INSPECT ***"); broke++; }
  }
}
console.log(`\n${"=".repeat(78)}\n${broke ? `${broke} arm(s) FAILED TO ARM OR RESTORE — inspect before trusting anything above` : "every arm armed and restored, verified by sha256 and cmp"}`);
process.exit(broke ? 1 : 0);
