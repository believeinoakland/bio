#!/usr/bin/env node
/* UI-62's NEGATIVE CONTROL DRIVER — the arms for `passage-surface.test.mjs`.
 *
 * Run from the REPO ROOT:
 *     node civicos-ui/test/passage-surface.control.mjs              # every arm
 *     node civicos-ui/test/passage-surface.control.mjs levelhidden
 *
 * THE DISCIPLINE, and it is not decoration. Each arm EDITS A REAL SOURCE, is
 * armed ALONE with every other arm held open, and is restored from a
 * UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by `cmp`, with the
 * byte count printed and a minimum guarded. It NEVER uses `git checkout --`,
 * which restores to HEAD and has twice in this repository discarded a session's
 * own uncommitted work.
 *
 * `baseline` is an arm and is the first one: it arms nothing and MUST be green.
 * Without it, a driver whose edits all failed to apply reports N red arms and
 * looks like a triumph.
 *
 * ---------------------------------------------------------------------------
 * THE CHEAPEST GREEN THIS SUITE MUST NOT ALLOW, declared here because it is what
 * the arms are shaped against. A surface that rendered ONE empty-state sentence
 * for every empty answer would satisfy any presence check for "the absence
 * statement is rendered" while saying nothing about WHICH level was empty —
 * exactly the surface `CLAUDE.md` forbids. `levelhidden` and `tallyfour` are the
 * two arms that catch that shape: the first removes one of the four levels, the
 * second removes the fifth bucket, and both leave a page that still renders a
 * perfectly readable absence statement.
 *
 * OVER-STRICTNESS IS AN ARM AND IS RUN EVERY TIME (`reordered`). Correct work in
 * a spelling this item did not anticipate must PASS — a fence tighter than its
 * rule is not a safer fence.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one. The import is for its SIDE EFFECT and is idempotent. */
import fs from "fs";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const APP = ROOT + "civicos-ui/app.html";
const SUITE = ROOT + "civicos-ui/test/passage-surface.test.mjs";

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* THE ARMS. `file` is what is edited; `from`/`to` is a single unique string
   replacement; `expect` is what the arm must produce and is declared HERE,
   before it is run, so a surprising result is a finding rather than a
   description. `mustNot` names what the arm must NOT take down — an arm that
   reddens the whole suite has perturbed a second variable and its refutation is
   worth nothing (CLAUDE.md's break-only-the-thing rule). */
const ARMS = {
  baseline: { file: null, why: "nothing armed — this MUST be green, and it is what proves the other arms are real" },

  /* ---- THE ITEM'S HEADLINE CONTROL, and §8's own: the absence statement
          hidden on ONE level. The page still renders three levels, the tally,
          the rows and the record's sentence; the only thing wrong with it is
          the one fact it no longer states. ---- */
  levelhidden: {
    file: APP,
    from: `  const known = FOUR_LEVEL_ORDER.filter(k => Object.prototype.hasOwnProperty.call(lv, k));`,
    to:   `  const known = FOUR_LEVEL_ORDER.filter(k => Object.prototype.hasOwnProperty.call(lv, k)).filter(k => k !== "internet");`,
    why: "ONE of the four levels dropped from the render — the level that says whether anybody ever "
       + "LOOKED, which is the one a member most needs and the one whose absence is least visible",
    expect: "FAIL on 'every one of the four is RENDERED' (both scopes) and on the "
          + "'two levels this read cannot see are stated as UNDETERMINED' assertion",
    mustNot: "the tally arms, the row arms, the cite arms and the over-strictness arms must all still PASS",
  },

  /* ---- THE BRIEF'S NAMED GAP: four buckets where the plane has five. Every
          capture promoted before REC-91 is `undetermined`, so a four-bucket
          tally reports a whole unindexed corpus as indexed to some degree. ---- */
  tallyfour: {
    file: APP,
    from: `  const keys = Object.keys(vocab).concat(undet && !(undet in vocab) ? [undet] : []);`,
    to:   `  const keys = Object.keys(vocab);`,
    why: "the FIFTH bucket dropped — the tally renders the four states the plane words and silently "
       + "omits `undetermined`, which is the state of every capture promoted before the index writer "
       + "existed. The page looks complete and its totals no longer add up to the scope",
    expect: "FAIL on 'every one of the five is RENDERED, keyed by the plane's own name' and on the "
          + "'driven off the PUBLISHED vocabulary' assertion",
    mustNot: "the four-level arms and every cite arm must still PASS",
  },

  /* ---- DEC-8 / DEC-49: the surface re-wording the record. ---- */
  reworded: {
    file: APP,
    from: `<span class="k">The record&rsquo;s own account of this answer</span><span class="v plain">\${esc(String(env.says))}</span>`,
    to:   `<span class="k">The record&rsquo;s own account of this answer</span><span class="v plain">We could not find anything matching that.</span>`,
    why: "the plane's own sentence about what this answer IS replaced by a friendlier one the surface "
       + "wrote itself — the DEC-8 breach that renders a perfectly pleasant page and changes what the "
       + "record claims",
    expect: "FAIL on 'each panel renders ITS OWN `says` sentence, verbatim and whole'",
    mustNot: "the level arms, the tally arms and the cite arms must still PASS — this arm moves ONE sentence",
  },

  /* ---- DEC-69: something filled in on the member's behalf. ---- */
  prefilled: {
    file: APP,
    from: `    <p class="subj-note">You reached this from a passage, so the part is already chosen and there is nothing here to fill in.</p>`,
    to:   `    <p class="subj-note">You reached this from a passage.</p>
    <input class="txt" id="cx-extent-page" type="number" value="1">`,
    why: "a page box PREFILLED with a 1 in the composer's passage block — the shape DEC-69 forbids, "
       + "and the one a composer drifts into by helpfulness rather than by decision",
    expect: "FAIL on 'NOTHING IS PREFILLED (DEC-69)'",
    mustNot: "every absence-statement arm and the whole cite wire must still PASS",
  },

  /* ---- THE PRESENTATION DECISION THIS ITEM TOOK, both halves. ---- */
  proportions: {
    file: APP,
    from: `      <span class="k"><b>\${esc(String(n))}</b> <span class="mono" style="font-weight:400">\${esc(k)}</span></span>`,
    to:   `      <span class="k"><b>\${esc(String(n))}</b> (\${Math.round(100*n/Math.max(1,sc.captures_counted))}%) <span class="mono" style="font-weight:400">\${esc(k)}</span></span>`,
    why: "a PERCENTAGE beside each bucket — the helpful-looking addition this item decided against, "
       + "because a proportion computed over a sample and shown against a scope cannot be checked by "
       + "eye and is the invisible under-report this repository refuses everywhere else",
    expect: "FAIL on 'NO PROPORTIONS ANYWHERE, bounded or not'",
    mustNot: "every other arm must still PASS — the buckets are still all rendered, in the plane's own words",
  },
  sampleunmarked: {
    file: APP,
    from: `    \${capped ? \`<div class="card undet" id="f-pass-sample" style="margin:8px 0">`,
    to:   `    \${false ? \`<div class="card undet" id="f-pass-sample" style="margin:8px 0">`,
    why: "the SAMPLE card removed when the bound bites — the heading still names the bound, so the "
       + "page is not obviously wrong; what is gone is the sentence saying the uncounted captures are "
       + "in no bucket at all, which is the inference the bound cannot support",
    expect: "FAIL on 'BOUND: the word SAMPLE appears beside the figures' and on 'the captures past the "
          + "bound are said to be in NO bucket'",
    mustNot: "the UNBOUNDED assertion must still PASS — this arm must not disturb the branch that does not bite",
  },

  /* ---- THE ITEM'S REASON TO EXIST: the passage reaching the act. ---- */
  extentdropped: {
    file: APP,
    from: `    if(citeOntoInquiry() && CITE.passage){
      const ext = passageCiteParams(CITE.passage);
      if(ext) Object.assign(params, ext);
    }`,
    to:   `    if(false && citeOntoInquiry() && CITE.passage){
      const ext = passageCiteParams(CITE.passage);
      if(ext) Object.assign(params, ext);
    }`,
    why: "the extent silently NOT SENT while the composer goes on saying it will be — the exact defect "
       + "UI-61 refused to ship when the act was dropping extents, arriving from the other side. The "
       + "member is told the leg will rest on page 2 and it rests on the whole document",
    expect: "FAIL on the wire assertion ('carrying the passage's own page'), on 'that row is the PAGE', "
          + "and on the `ref` assertion — the act still SUCCEEDS, which is what makes this dangerous",
    mustNot: "every absence-statement arm and every row-rendering arm must still PASS",
  },

  /* ---- THE OFF-BY-ONE, which is invisible unless something pins the conversion. ---- */
  offbyone: {
    file: APP,
    from: `  return \` &middot; <a onclick="openBundleAtPage(\${esc(JSON.stringify(String(row.bundle_id||"")))},\${e.page+1})">open the document at page \${e.page+1}</a>\`;`,
    to:   `  return \` &middot; <a onclick="openBundleAtPage(\${esc(JSON.stringify(String(row.bundle_id||"")))},\${e.page})">open the document at page \${e.page}</a>\`;`,
    why: "the record's 0-based page handed to the reader unconverted — a jump that lands one page early "
       + "on every PDF in the record, and reads as a plausible page number all the way",
    expect: "FAIL on 'the jump is offered at the READER's 1-based page'",
    mustNot: "every other arm must still PASS, including the two 'no jump offered' arms",
  },

  /* ---- DEC-69's OTHER HALF, and the one this row's own NEGATIVE CONTROL names:
          *a prefilled query -> the reach arm fails*. ---- */
  prefilledquery: {
    file: APP,
    from: `<input id="s-q" placeholder="e.g. sewer fund, or concerns:ENT-0031" oninput="sxSync('s')"`,
    to:   `<input id="s-q" value="sewer fund" placeholder="e.g. sewer fund, or concerns:ENT-0031" oninput="sxSync('s')"`,
    why: "the search box opened with a term ALREADY IN IT — the record is asked a question the member "
       + "did not ask and the answer is presented as theirs, and on this surface it also pre-narrows "
       + "the absence statement's denominator so the coverage sentence is about a scope nobody chose",
    expect: "FAIL on 'the finder's own search box carries a PLACEHOLDER and no value'",
    mustNot: "every other arm must still PASS",
  },

  /* ---- OVER-STRICTNESS. Correct work in a spelling this item did not
          anticipate must PASS. The level ORDER is this file's preference and was
          never a contract; a plane or a later item reordering it must not turn
          this suite red. ---- */
  reordered: {
    file: APP,
    from: `const FOUR_LEVEL_ORDER = ["meaning", "content", "document", "internet"];`,
    to:   `const FOUR_LEVEL_ORDER = ["internet", "document", "content", "meaning"];`,
    why: "OVER-STRICTNESS — the four levels rendered in the opposite order. Every level is still there, "
       + "every sentence is still the plane's, and nothing a member can check has changed",
    expect: "GREEN — 0 FAIL. If this arm goes red, this suite is pinning a presentation order it never "
          + "meant to require, and the assertion that did it is the defect",
    mustNot: "n/a — this arm must take NOTHING down",
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).map(([arm, a]) => (a.file ? { arm, file: a.file, find: a.from, put: a.to } : { arm, none: "nothing armed" })));

const only = process.argv[2];
const names = only ? [only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`no such arm: ${only}\n  arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let broke = 0;
const SUMMARY = [];
for (const name of names) {
  const arm = ARMS[name];
  console.log(`\n${"=".repeat(78)}\nARM ${name} — ${arm.why}`);
  if (arm.expect) console.log(`DECLARED BEFORE ARMING: ${arm.expect}`);
  if (arm.mustNot) console.log(`MUST NOT TAKE DOWN:     ${arm.mustNot}`);

  let pristine = null, before = null;
  if (arm.file) {
    pristine = `${arm.file}.pristine-${name}`;
    fs.copyFileSync(arm.file, pristine);
    before = sha(arm.file);
    const src = fs.readFileSync(arm.file, "utf8");
    const n = src.split(arm.from).length - 1;
    if (n !== 1) {
      /* AN ARM THAT DID NOT ARM IS A FINDING, never a quiet pass. */
      console.error(`  REFUSING TO ARM: the anchor matches ${n} time(s), and an arm must be a SINGLE unique replacement.`);
      fs.rmSync(pristine); broke++; SUMMARY.push(`${name}: DID NOT ARM (anchor matched ${n})`); continue;
    }
    fs.writeFileSync(arm.file, src.replace(arm.from, arm.to));
    console.log(`  armed: ${arm.file.replace(ROOT, "")} (${before.slice(0, 12)}… -> ${sha(arm.file).slice(0, 12)}…)`);
  }

  let out = "", code = 0;
  try { out = execFileSync("node", [SUITE], { encoding: "utf8", stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? 1; }

  const p = (out.match(/^  PASS/gm) || []).length;
  const f = (out.match(/^  FAIL/gm) || []).length;
  const tally = /passage-surface: (\d+) pass, (\d+) fail/.exec(out);
  const failed = (out.match(/^  FAIL  (.*)$/gm) || []).map((l) => l.replace(/^  FAIL  /, ""));
  /* THE SUITE'S OWN FOOT, not the shell's status. A `TypeError` inside an
     assertion ends the module while the tally reads clean, so a run that never
     printed its own tally is reported as -1 and never as 0. */
  console.log(`  RUN: ${p} pass, ${f} FAIL (suite exit ${code}); the suite's OWN tally: ${
    tally ? `${tally[1]} pass, ${tally[2]} fail` : "*** NO TALLY LINE — the suite did not reach its own foot ***"}`);
  for (const l of failed.slice(0, 14)) console.log(`        FAILED: ${l}`);
  SUMMARY.push(`${name}: ${tally ? `${tally[1]}/${tally[2]}` : "-1/-1"} (${f} FAIL line(s))`);

  if (arm.file) {
    fs.copyFileSync(pristine, arm.file);
    const after = sha(arm.file);
    const bytes = fs.statSync(arm.file).size;
    let cmpOk = true;
    try { execFileSync("cmp", ["-s", arm.file, pristine]); } catch (_) { cmpOk = false; }
    fs.rmSync(pristine);
    const good = after === before && cmpOk && bytes > 100000;
    console.log(`  restored: sha256 ${good ? "EQUAL" : "*** MISMATCH ***"} · cmp ${cmpOk ? "identical" : "*** DIFFERS ***"} · ${bytes} bytes`);
    if (!good) { console.error("  *** THE RESTORE DID NOT VERIFY — STOP AND INSPECT ***"); broke++; }
  }
}
console.log(`\n${"=".repeat(78)}`);
for (const s of SUMMARY) console.log(`  ${s}`);
console.log(broke ? `${broke} arm(s) FAILED TO ARM OR RESTORE — inspect before trusting anything above`
                  : "every arm armed and restored, verified by sha256 and cmp");
process.exit(broke ? 1 : 0);
