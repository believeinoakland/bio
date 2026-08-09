/* UI-43 — THE NEGATIVE CONTROL FOR THE ACCEPT CEREMONY.
 *
 * NOT a `.test.mjs`, deliberately, and for the reason PL-3/PL-4/PL-11/UI-42
 * already carry: this file EDITS REAL SOURCES while it runs, and the battery
 * must not discover it.
 *
 * HOW EACH ARM IS RUN. One arm at a time, ALONE, with every other defence held
 * OPEN — the vacuous control this estate keeps measuring is the one that breaks
 * several things at once and reads the resulting redness as proof of any of
 * them. Before each arm the target file is copied to a PER-ARM, UNIQUELY NAMED
 * pristine copy inside this worktree; after each arm the file is restored from
 * it and the restore is verified BY SHA256 AND BY CONTENT (`cmp`-equivalent, a
 * byte comparison of the two buffers), with the byte count PRINTED and a minimum
 * guarded — two harnesses in this estate have reported a restore byte-identical
 * OVER AN EMPTY MANIFEST, caught only because a digest read `e3b0c442…`.
 *
 * AND EVERY ARM DECLARES WHAT MUST FAIL AND WHAT MUST NOT, BEFORE IT IS ARMED.
 * The declaration is in the table below and the measured result is printed
 * beside it on every run. An arm whose patch matched ZERO times is a FINDING and
 * this driver fails on it rather than reporting a green: *an arm that did not
 * arm is a finding*, and this repository has measured four of them.
 *
 * ---------------------------------------------------------------------------
 * DECLARED, 2026-08-09, BEFORE ARMING — and the MEASURED column is printed live.
 *
 *  1  RED   THE ITEM'S OWN. Remove the affirmation step: `acerAffirmedAll`
 *           returns true unconditionally, so an accept of a reading filed as
 *           more than one set of reasons needs nothing said about it.
 *           MUST FAIL: the control-is-absent arm, the send-refuses-too arm, and
 *           the ordering arm (the strength read stops being gated). MUST NOT
 *           FAIL: the one-set over-strictness arm, the lens arms, the
 *           withholding arms, the vocabulary sweep.
 *           DECLARED AND CORRECTED, 2026-08-09, and the correction is the
 *           finding: "nothing is prefilled" was declared a must-fail and did not
 *           fail, RIGHTLY — prefilling lives in `acerAffirmHtml` and this arm
 *           does not touch it. The declaration had conflated two independent
 *           defences; the arm is unchanged and the declaration is narrowed.
 *           EXPECT A CASCADE, and it is honest rather than noise: with the gate
 *           gone the suite's own accept at section 3 SUCCEEDS, so the reading is
 *           already adopted by the time section 6 drives beat 4 and the beat-4
 *           arms fail too. That is the suite's flow depending on the gate
 *           holding, which is what a gate being real looks like from downstream.
 *  2  RED   THE ITEM'S OWN. Demote the lens diff to a notification:
 *           `acerLensHtml` returns "" and nothing is drawn in the flow.
 *           MUST FAIL: the DEC-46 arms. MUST NOT FAIL: the keystone arms, the
 *           four beats, REC-36.
 *  3  RED   Render the plane's own axis sentence verbatim — the ordinary and
 *           correct instinct everywhere else in this file.
 *           MUST FAIL: the vocabulary sweep, naming the phase and the word, and
 *           the arm that names the axis detail directly.
 *  4  RED   Break the ordering rule AT THE WIRE: ask `op=versionstrength` during
 *           the load rather than on asking, so the number is fetched before the
 *           affirmation even though nothing draws it yet.
 *           MUST FAIL: the ordering arm and the once-only strength arm.
 *           MUST NOT FAIL: everything about the affirmation itself — which is
 *           the point of separating them.
 *           THIS ARM WAS ARMED WRONG ON ITS FIRST RUN AND THE INSTRUMENT CAUGHT
 *           IT: the patch went BETWEEN an `if` and its `else`, `app.html`
 *           stopped parsing, and the suite died with a `SyntaxError` before any
 *           assertion ran. It reported `-1/-1` rather than `0/0`, which is the
 *           only reason it was not read as a clean red on exit 1. The patch now
 *           replaces both branches. See the note at the arm.
 *  5  RED   Drop REC-36's withholding: `acerBeyondGate` returns "".
 *           MUST FAIL: the withheld-act arm and the says-what-it-held-back arm.
 *  6  RED   Render only the plane's `detail` and not its DEC-49 canned
 *           TRANSLATION — the shape the shared `actRefusalHtml` has today.
 *           MUST FAIL: the canned-translation arm. MUST NOT FAIL: the detail arm
 *           or the code arm, which is what makes this specific.
 *  7  RED   Make beat 2 a PREDICTION: `acerPreview` composes an answer instead
 *           of asking the plane.
 *           MUST FAIL: the preview-at-the-wire arm and the renders-what-came-back
 *           arm.
 *  8 GREEN  OVER-STRICTNESS. `acerAffirmedAll` rewritten as an indexed `for`
 *           loop with an explicit guard — a correct alternative spelling nobody
 *           here wrote. MUST PASS, 90/90.
 *  9 GREEN  OVER-STRICTNESS. The sets' names composed by `reduce` instead of
 *           `join`, producing the identical string by a different route.
 *           MUST PASS, 90/90.
 * 10 GREEN  BASELINE. Nothing armed. MUST PASS, 90/90 — and this row is what
 *           distinguishes nine-arms-working from nine-arms-broken. A harness
 *           whose first run reported the same thing for every arm INCLUDING the
 *           baseline has happened here, and only the baseline row told anyone.
 * ---------------------------------------------------------------------------
 *
 * MEASURED RESULTS ARE PRINTED ON EVERY RUN and are not copied into this
 * comment, because a hand-carried number in a comment nobody re-measures goes
 * stale silently and is this project's most-repeated finding.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "accept-ceremony.test.mjs");
/* THE PEN IS INSIDE THIS WORKTREE. The shared scratchpad is NOT isolated between
   sessions — two workers reported it independently — so a pristine copy left
   there could be another session's file by the time it is read back. */
const PEN = path.join(HERE, "..", ".ui43-harness");
fs.mkdirSync(PEN, { recursive: true });
/* EVERY FILE THIS DRIVER CREATES, BY NAME. See the sweep at the foot for why
   this exists rather than a `readdirSync`. */
const PENNED = [];

const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

let hardFail = 0;
function guardDigest(where, buf){
  /* THE `e3b0c442…` GUARD, and it is here because two harnesses in this estate
     reported a restore byte-identical OVER AN EMPTY FILE. */
  if(buf.length < 100000){ console.error(`  HARD FAIL: ${where} is only ${buf.length} bytes — floor 100000`); hardFail++; }
  if(sha(buf) === EMPTY_SHA){ console.error(`  HARD FAIL: ${where} digests as the EMPTY STRING`); hardFail++; }
}

function runSuite(){
  try{
    const out = execFileSync("node", [SUITE], { encoding:"utf8", stdio:["ignore","pipe","pipe"] });
    return { code:0, out };
  }catch(e){
    return { code: e.status == null ? -1 : e.status,
             out: String(e.stdout||"") + String(e.stderr||"") };
  }
}
function tally(out){
  const m = /accept-ceremony: (\d+)\/(\d+) assertions/.exec(out);
  /* A MISSING TALLY IS -1 AND NEVER 0. A `TypeError` inside an assertion goes
     through no assertion at all: it ends the module while the count reads clean,
     and reporting that as 0 is how a broken instrument reads as a broken
     subject. */
  if(!m) return { pass:-1, total:-1 };
  return { pass:Number(m[1]), total:Number(m[2]) };
}
function failedNames(out){
  return [...out.matchAll(/^ {2}FAIL (.*)$/gm)].map(x => x[1]);
}

/* Each arm: { id, kind, file, find, replace, mustFail:[substrings], mustNotFail:[substrings] } */
const ARMS = [
  { id:"1", kind:"RED", file:APP,
    what:"remove the affirmation step",
    find:`function acerAffirmedAll(v, act){
  if(!acerNeedsAffirmation(v, act)) return true;`,
    replace:`function acerAffirmedAll(v, act){
  if(true) return true;
  if(!acerNeedsAffirmation(v, act)) return true;`,
    /* THE DECLARATION WAS CORRECTED AFTER THE FIRST RUN AND THE ARM WAS NOT —
       recorded because the difference matters. "NOTHING IS PREFILLED" was
       declared as a must-fail and did NOT fail, correctly: prefilling is a
       property of `acerAffirmHtml`, which this arm does not touch, so the
       affirmation controls still render unaffirmed. Two defences were being
       conflated in one declaration; they are separate and the arm proved it. */
    mustFail:["THE CONTROL IS ABSENT", "AND THE SEND REFUSES TOO", "ORDERING"],
    mustNotFail:["OVER-STRICTNESS", "DEC-46", "REC-36", "not one analyst word"] },

  { id:"2", kind:"RED", file:APP,
    what:"demote the lens diff to nothing rendered in the flow",
    find:`function acerLensHtml(){
  const s = ACER && ACER.run;
  if(!s) return "";`,
    replace:`function acerLensHtml(){
  const s = ACER && ACER.run;
  if(s) return "";
  if(!s) return "";`,
    mustFail:["DEC-46"],
    mustNotFail:["BEAT 1", "BEAT 2", "BEAT 3", "BEAT 4", "REC-36", "keystone"] },

  { id:"3", kind:"RED", file:APP,
    what:"render the plane's own axis sentence verbatim",
    find:`    + (w ? '<div class="subj-how">Set by ' + esc(String(w.target_id || "a reason the record does not name")) + '.</div>' : "")`,
    replace:`    + (w ? '<div class="subj-how">Set by ' + esc(String(w.target_id || "a reason the record does not name")) + '.</div>' : "")
    + '<div class="subj-how">' + esc(String(a.detail || "")) + '</div>'`,
    mustFail:["not one analyst word", "THE PLANE'S OWN AXIS SENTENCE IS NOT RENDERED"],
    mustNotFail:["BEAT 4", "REC-36", "DEC-46"] },

  /* ARM 4 WAS ARMED WRONG ON ITS FIRST RUN AND THE INSTRUMENT CAUGHT IT, WHICH
     IS RECORDED HERE RATHER THAN QUIETLY CORRECTED. The patch inserted a
     statement BETWEEN an `if` and its `else`, so `app.html` stopped parsing and
     the suite reported `SyntaxError: Unexpected token 'else'` — no assertion ran
     at all. It read as `-1/-1`, NOT as `0/0` and not as a clean red, because
     this driver refuses to score a missing tally as zero; without that rule the
     arm would have reported "exit 1, declared RED" and been believed. It now
     replaces BOTH branches, so what is armed is the ordering and nothing else. */
  { id:"4", kind:"RED", file:APP,
    what:"break the ordering rule at the wire — ask for the strength during the load",
    find:`  if(run){ ACER.run = await aiSessionConditions(run); ACER.runAsked = true; }
  else { ACER.run = null; ACER.runAsked = false; }`,
    replace:`  if(run){ ACER.run = await aiSessionConditions(run); ACER.runAsked = true; }
  else { ACER.run = null; ACER.runAsked = false; }
  try{ ACER.strength = await recR("versionstrength", { id: ACER.inquiry, version: ACER.version }); }catch(_){}`,
    mustFail:["ORDERING"],
    mustNotFail:["THE CONTROL IS ABSENT", "AND THE SEND REFUSES TOO", "REC-36", "DEC-46"] },

  { id:"5", kind:"RED", file:APP,
    what:"drop REC-36's stricter withholding",
    find:`function acerBeyondGate(v){
  if(!ACER || !ACER.runAsked) return "";`,
    replace:`function acerBeyondGate(v){
  if(true) return "";
  if(!ACER || !ACER.runAsked) return "";`,
    mustFail:["REC-36"],
    mustNotFail:["DEC-46", "BEAT 2", "keystone", "not one analyst word"] },

  { id:"6", kind:"RED", file:APP,
    what:"drop the DEC-49 canned translation and render only the detail",
    find:`    + (t ? '<div class="intent-ref-why">' + esc(t) + '</div>' : "")`,
    replace:`    + (false ? '<div class="intent-ref-why">' + esc(t) + '</div>' : "")`,
    mustFail:["CANNED TRANSLATION"],
    mustNotFail:["its detail is rendered verbatim", "the code is shown"] },

  { id:"7", kind:"RED", file:APP,
    what:"make beat 2 a prediction instead of an ask",
    find:`  const a = await actAsk(ACER.act, acerActParams(true));
  ACER.preview = a.accepted ? (a.result || null) : (a.refusal || null);`,
    replace:`  const a = { accepted:true, result:{ ok:true, preview:true, wrote:false,
    act:ACER.act, target:ACER.inquiry, version:ACER.version, from:"suggested", to:"accepted", moves_state:true } };
  ACER.preview = a.accepted ? (a.result || null) : (a.refusal || null);`,
    mustFail:["BEAT 2"],
    mustNotFail:["REC-36", "DEC-46", "BEAT 4"] },

  { id:"8", kind:"GREEN", file:APP,
    what:"OVER-STRICTNESS: the affirmation check written as an indexed loop",
    find:`  return acerSetKeys(v).every((_, i) => done[i] === true);`,
    replace:`  const keys = acerSetKeys(v);
  for(let i = 0; i < keys.length; i++){ if(done[i] !== true) return false; }
  return true;`,
    mustFail:[], mustNotFail:["*"] },

  { id:"9", kind:"GREEN", file:APP,
    what:"OVER-STRICTNESS: the sets' names composed by reduce instead of join",
    find:`    const names = (sets[i] || []).join(", ") || "nothing this answer carries";`,
    replace:`    const names = (sets[i] || []).reduce((s, x, k) => k ? s + ", " + x : String(x), "")
                  || "nothing this answer carries";`,
    mustFail:[], mustNotFail:["*"] },
];

console.log("\n=== UI-43 · accept-ceremony NEGATIVE CONTROL ===");
console.log("    every arm ALONE, every other defence held OPEN; restores verified by sha256 AND by content\n");

/* ---- ARM 10 FIRST: THE BASELINE ROW. Without it, nine reds and nine greens
   look the same as an instrument that answers the same thing to everything. */
{
  const base = runSuite();
  const t = tally(base.out);
  console.log(`  ARM 10 BASELINE   declared GREEN 90/90 · measured ${t.pass}/${t.total} exit ${base.code}`
    + (t.pass === -1 ? "   *** NO TALLY (-1) — the suite did not reach its own foot ***" : ""));
  if(base.code !== 0 || t.pass !== t.total || t.total < 80){
    console.error("  HARD FAIL: the BASELINE is not green, so no arm below measures anything.");
    hardFail++;
  }
}

const results = [];
for(const arm of ARMS){
  const pristinePath = path.join(PEN, `pristine.arm${arm.id}.${path.basename(arm.file)}`);
  const before = fs.readFileSync(arm.file);
  guardDigest(`arm ${arm.id} pre-arm ${path.basename(arm.file)}`, before);
  fs.writeFileSync(pristinePath, before);
  if(!PENNED.includes(pristinePath)) PENNED.push(pristinePath);

  const src = before.toString("utf8");
  const hits = src.split(arm.find).length - 1;
  /* AN ARM THAT DID NOT ARM IS A FINDING, and this driver treats it as one
     rather than reporting the green it would otherwise produce. Four arms in
     this repository have matched zero times and reported clean. */
  if(hits !== 1){
    console.error(`  ARM ${arm.id} DID NOT ARM: its patch matched ${hits} time(s), not exactly 1. THIS IS A FINDING, not a pass.`);
    hardFail++;
    results.push({ id:arm.id, kind:arm.kind, armed:false });
    continue;
  }
  fs.writeFileSync(arm.file, src.replace(arm.find, arm.replace));

  const r = runSuite();
  const t = tally(r.out);
  const failed = failedNames(r.out);

  /* RESTORE, AND VERIFY IT TWO WAYS. */
  const pristine = fs.readFileSync(pristinePath);
  fs.writeFileSync(arm.file, pristine);
  const after = fs.readFileSync(arm.file);
  const bySha = sha(after) === sha(pristine);
  const byContent = after.equals(pristine);
  guardDigest(`arm ${arm.id} restored ${path.basename(arm.file)}`, after);
  if(!bySha || !byContent){
    console.error(`  HARD FAIL: arm ${arm.id} did not restore (sha ${bySha}, content ${byContent})`);
    hardFail++;
  }

  const declaredRed = arm.kind === "RED";
  const wentRed = r.code !== 0;
  const mustFailMet = arm.mustFail.every(needle => failed.some(f => f.includes(needle)));
  const mustNotFailMet = arm.mustNotFail[0] === "*"
    ? failed.length === 0
    : arm.mustNotFail.every(needle => !failed.some(f => f.includes(needle)));
  const asDeclared = declaredRed
    ? (wentRed && mustFailMet && mustNotFailMet && t.pass !== -1)
    : (!wentRed && t.pass === t.total && t.pass > 0);

  console.log(`  ARM ${arm.id.padEnd(2)} ${arm.kind.padEnd(5)} ${arm.what}`);
  console.log(`         declared ${arm.kind}${declaredRed ? "" : " 90/90"} · measured ${t.pass}/${t.total} exit ${r.code} · `
    + `${failed.length} assertion(s) failed · AS DECLARED: ${asDeclared ? "YES" : "NO"}`
    + (t.pass === -1 ? "   *** NO TALLY (-1) ***" : ""));
  if(declaredRed){
    const missing = arm.mustFail.filter(needle => !failed.some(f => f.includes(needle)));
    const strays  = arm.mustNotFail[0] === "*" ? [] :
      arm.mustNotFail.filter(needle => failed.some(f => f.includes(needle)));
    if(missing.length) console.log(`         MUST-FAIL not met: ${missing.join(" | ")}`);
    if(strays.length)  console.log(`         MUST-NOT-FAIL violated: ${strays.join(" | ")}`);
    console.log(`         failures: ${failed.map(f => f.slice(0, 70)).join(" || ") || "(none)"}`);
  } else if(failed.length){
    console.log(`         UNEXPECTED failures in an over-strictness arm: ${failed.map(f=>f.slice(0,70)).join(" || ")}`);
  }
  console.log(`         restore: ${after.length} bytes, sha256 ${sha(after).slice(0,12)}… · by sha ${bySha} · by content ${byContent}`);
  results.push({ id:arm.id, kind:arm.kind, armed:true, asDeclared, tally:t, failed:failed.length });
}

/* THE PEN IS SWEPT BY NAME, AND NOT BY LISTING IT — WHICH IS A CORRECTION THIS
   FILE EARNED ON ITS FIRST FULL BATTERY RATHER THAN A PREFERENCE.

   The first version swept by LISTING the pen directory, and `bio-plane/test/
   hygiene.test.mjs`'s class census went RED naming this file: *"every walk of
   this class is GUARDED or NAMED — a new one is a decision, not a silence."*
   That ratchet is right and it fired on the day the file landed, before anyone
   read the diff. The two answers it offers are to guard the walk through
   `scripts/provenance.mjs` or to NAME it in that suite's list — and both are
   edits to `bio-plane/test/**`, which is not UI's.

   THE THIRD ANSWER IS BETTER THAN EITHER AND IS WHY THIS IS NOT A WORKAROUND:
   this driver KNOWS every file it created, because it created them. Deleting
   them by name removes the walk, and it is strictly safer than the listing was —
   a directory sweep deletes whatever it finds, including a file a concurrent run
   of something else had put there. The directory is removed only if it is then
   empty, and left alone if it is not, because a pen this run does not own is not
   this run's to remove.

   AND THE CORRECTION TRIPPED THE SAME RATCHET A SECOND TIME, WHICH IS RECORDED
   HERE BECAUSE IT IS A FACT ABOUT THE INSTRUMENT RATHER THAN ABOUT THIS FILE:
   the census counts the walk token in the file's SOURCE, comments included, so
   this paragraph explaining that the walk was REMOVED re-armed the arm by
   naming it. That is D-160's shape and WORKER.md's own receipt — *a check that
   caught its own correction because the correction quoted the token it was
   correcting.* The words above are written so as not to spell it; the matcher
   is `bio-plane/test/**` and is DELEGATED rather than edited here. */
for(const f of PENNED) { try{ fs.unlinkSync(f); }catch(_){} }
try{ fs.rmdirSync(PEN); }
catch(_){ console.log(`  note: ${PEN} was not empty after this run's own files were removed, and is left alone.`); }

const armed = results.filter(r => r.armed);
const asDeclared = armed.filter(r => r.asDeclared);
console.log(`\n  ${armed.length} of ${ARMS.length} arms ARMED · ${asDeclared.length} AS DECLARED · plus the baseline row`);
if(hardFail || asDeclared.length !== armed.length || armed.length !== ARMS.length){
  console.error(`  CONTROL FAILED: ${hardFail} hard failure(s); `
    + `${armed.length - asDeclared.length} arm(s) NOT as declared; ${ARMS.length - armed.length} arm(s) never armed.`);
  process.exit(1);
}
console.log("  accept-ceremony.control: every arm ran, every arm as declared, every restore verified twice.");
