/* UI-84's NEGATIVE CONTROL — the mock refusals for `op=verify` and `unknown op` are built from the
 * plane's own source and catalogue, and this file breaks each derivation ALONE to watch the named
 * assertion fail.
 *
 * WHY FOUR ARMS AND NOT ONE. The row names one: *"drop `translation` from one mock, and the SUBJECT arm
 * fails by name."* That arm is (A) and it is run first. But the item pins the fixture in BOTH directions
 * — a fixture may not be NARROWER than the wire (the D-278 class) and may not be WIDER than it either —
 * so (D) breaks the PLANE's decoration and must fail at the SITE assertion rather than anywhere else.
 * (B) separates the two refusals, so a pass at (A) cannot be a second reading of the same fact. (C) is
 * the over-strictness arm WORKER.md requires: correct work in a spelling this item did not anticipate
 * must PASS.
 *
 * DECLARED BEFORE ARMING — what MUST fail, and what MUST NOT:
 *
 *   (A) THE ROW'S OWN. `translation` dropped from the `op=verify` fixture (VERIFY_REFUSAL_WIRE) in
 *       preauth-vocabulary.test.mjs. MUST FAIL: the DEC-49 SUBJECT arm, naming `sha256` ARRIVING FROM
 *       SOMEWHERE ELSE — because `refusalWords` falls back to the caller's sentence and the word
 *       `sha256` returns to `#v-refused`; AND the `#v-refused` REACH arm, whose two-sided pin requires
 *       the canned sentence present and the caller's absent. MUST NOT FAIL: the three `unknown op`
 *       arms, and both SITE assertions (the plane is untouched).
 *
 *   (B) THE OTHER REFUSAL, ALONE. `translation` dropped from `unknownOpWire`. MUST FAIL: the three
 *       `unknown op` REACH arms (`#v-unknownop`, the published INDEX, the case ADDRESS). MUST NOT
 *       FAIL: the DEC-49 SUBJECT arm — declared green IN ADVANCE and it is a claim, not a hope: the
 *       terse `unknown op` carries none of the 74 inherited terms and no structural acronym, which is
 *       why UI-37 recorded it as wording *"the instrument cannot pin"*. A red SUBJECT arm here would be
 *       a finding about the instrument, not about the fixture.
 *
 *   (C) OVER-STRICTNESS. The catalogue's `DISPATCH_CHECKS` family RENAMED (to `DISPATCH_MISS_CHECKS`)
 *       in bio-checks.mjs — the same row, the same sentence, reachable only by a lookup that DISCOVERS
 *       the family instead of naming it. MUST BE GREEN in preauth-vocabulary.test.mjs, because
 *       `cannedFor` searches every `/_CHECKS$/` export rather than naming one. This arm is the reason
 *       that helper searches: D-126 moved two families by renumbering on 2026-09-23, and a fixture
 *       naming a family would have emptied silently.
 *
 *       **THIS ARM'S FIRST SPELLING CAME BACK RED AGAINST A GREEN DECLARATION, AND THE ARM WAS WRONG
 *       RATHER THAN THE SUBJECT — recorded here because a surprising result is a finding about the arm
 *       and must not be smoothed (WORKER.md).** It renamed the family to `DISPATCH_XCHECKS`, which does
 *       NOT match `/_CHECKS$/` — the `_` is gone — so the arm moved TWO variables at once: the family's
 *       NAME, which is what it meant to move, and the family's MEMBERSHIP OF THE `_CHECKS` CONVENTION
 *       that every consumer keys on, the DEC-49 guard included. A row outside that convention is not a
 *       row renamed; it is a row withdrawn, and `cannedFor` returning null for a withdrawn row is
 *       correct behaviour. RED 4 of 84, the four naming the empty lookup and the panes it emptied.
 *       Corrected to a spelling INSIDE the convention, which is the variable the arm exists to move.

       **CORRECTED 2026-09-25 by M0-148, never exempted — THE DECLARATION ABOVE WAS FALSE IN ITS
       FIRST CLAUSE.** *"The same row, the same sentence"* holds for the CATALOGUE; it does not hold
       for the ESTATE. `bio-plane/src/index.mjs` IMPORTS `DISPATCH_CHECKS` BY NAME and `dispatchRow`
       reads it, so the catalogue-only rename STOPS THE PLANE: every suite that boots one through
       Miniflare dies at `ERR_RUNTIME_FAILURE` (measured by UI-100's arm (D) on `case-frozen-pair`;
       M-139 §7 item 2). This arm read GREEN only because the one suite it runs,
       preauth-vocabulary, drives a MOCK plane and never loads `index.mjs` as code — so the green
       was true of that suite and silent about the second variable the arm moved. The arm now
       renames at the plane's import as well (`DISPATCH_MISS_CHECKS as DISPATCH_CHECKS`, UI-100's
       spelling), leaving exactly one variable moved: whether a lookup that DISCOVERS the family
       still finds the row. DECLARED: GREEN, and now it is a claim about the whole estate.
 *
 *   (D) THE WIDE DIRECTION — THE PLANE STOPS DECORATING. `...dispatchRow("UNKNOWN_OP"),` deleted from
 *       `bio-plane/src/index.mjs`'s `!spec` line, `error` left byte-identical. MUST FAIL: the SITE
 *       assertion ("the dispatch miss leaves `fetch` DECORATED"), which is the only thing standing
 *       between a fixture and a sentence no member would ever be sent. This is the arm that makes the
 *       item's second direction real rather than asserted.
 *
 *       MEASURED: RED 5 of 84, the SITE assertion among them BY NAME — so the declaration held, but it
 *       named the MINIMUM and the blast radius is larger, which is recorded rather than rounded off.
 *
 *       **CORRECTED 2026-09-24 (UI-100), NEVER EXEMPTED — THE RESULT MOVED AND THE OLD ONE WOULD NOW
 *       READ AS A REGRESSION.** Re-run against the moved derivation, this arm no longer reports RED 5
 *       of 85: it reports NO TALLY LINE, exit 1 — the suite does not reach its own foot. That is the
 *       intended behaviour of the shared module and it is STRICTLY STRONGER than five failed
 *       assertions. `plane-refusal-wire.mjs` calls `assertDerived()` at import, so a plane that stops
 *       decorating stops every importing suite AT THE IMPORT with a sentence naming which derivation
 *       came back empty, rather than letting five assertions fail and the other eighty pass on a
 *       fixture that silently lost its translation. WHAT MUST STILL BE TRUE IS UNCHANGED AND IS WHAT
 *       THIS ARM IS FOR: the wide direction must be impossible — a plane that stopped decorating must
 *       never leave a fixture asserting a sentence the wire does not send. A dead suite says that
 *       louder than a failing assertion does. The RUN LINE to read this against is "NO TALLY LINE".
 *       The other four fall out of the same cause and they carry the item's best property: the CODE is
 *       read at the plane's own site, so when the plane stops decorating, `cannedFor("")` finds nothing
 *       and the fixture goes NARROW — it carries no translation — instead of going WIDE. **A fixture
 *       built this way cannot end up asserting a sentence the wire does not send**, which is a stronger
 *       statement than the SITE assertion alone makes, and it is why the code is read from `index.mjs`
 *       rather than typed beside the sentence.
 *
 * EVERY ARM IS ARMED ALONE, the others held open. Every file is restored from a UNIQUELY-NAMED per-arm
 * pristine copy and the restore verified BY sha256 AND BY `cmp`, with a byte count printed and floored.
 * Each patch must match EXACTLY ONCE or the arm is reported as NEVER ARMED — an arm that did not arm is
 * a finding, not a pass.
 *
 * RUN IT: `node civicos-ui/test/ui84-mock-wire.control.mjs` from the repo root. It writes nothing
 * outside the three subject files and leaves them byte-identical.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: this file calls process.exit, and a
   writer's own exit must not discard the writer's own output when run.mjs or check-mock-envelope.mjs
   spawns it with {stdio:"pipe"}. Census: stdio-census.test.mjs ARM B1, which named this file. */
import fs from "fs";
import crypto from "crypto";
import { execFileSync } from "child_process";
import path from "path";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
const SUITE  = path.join(ROOT, "civicos-ui/test/preauth-vocabulary.test.mjs");
/* RE-ANCHORED 2026-09-24 (UI-100), never exempted. Arms (A) and (B) patched two lines
   that used to live in SUITE and now live in `plane-refusal-wire.mjs`: UI-100 moved this
   derivation out of the suite so the seven other `unknown op` mocks and the one
   `requiredArgument` mock in this estate could be built from it too. Run against the moved
   tree, both arms reported NEVER ARMED — which is this control working, and is why the
   anchors follow the subject rather than the subject being left where the control could
   still find it. The arms are STRONGER in the new place, not weaker: dropping a
   `translation` there drops it for every suite that imports the module, so what used to
   break one file's fixture now breaks the class. The DECLARATIONS above are unchanged and
   are still about SUITE, because SUITE is still the only thing this control runs. */
const MODULE = path.join(ROOT, "civicos-ui/test/plane-refusal-wire.mjs");
const PLANE  = path.join(ROOT, "bio-plane/src/index.mjs");
const CATLG  = path.join(ROOT, "bio-plane/checks/bio-checks.mjs");
const TMP    = path.join(ROOT, "civicos-ui/test/.ui84-control");   /* INSIDE this worktree: /tmp is shared
   across every session on this machine and a generic name there is an identity nobody owns (WORKER.md). */

const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const MIN_BYTES = { [SUITE]: 100000, [PLANE]: 400000, [CATLG]: 300000, [MODULE]: 5000 };

function runSuite(){
  try{
    const out = execFileSync(process.execPath, [SUITE], { cwd: ROOT, encoding:"utf8",
      stdio:["ignore","pipe","pipe"], env:{ ...process.env } });
    return { code:0, out };
  }catch(e){ return { code: e.status === undefined ? -1 : e.status, out: String(e.stdout||"") + String(e.stderr||"") }; }
}
/* The suite's OWN tally and its OWN failing lines — never a wrapper's exit, never a pipe's. A run with
   no tally line at all did not reach its own foot and is reported as -1, never as 0 (WORKER.md). */
function tally(out){
  const green = /preauth-vocabulary: (\d+) assertions, all green/.exec(out);
  const red   = /preauth-vocabulary: (\d+) of (\d+) assertions FAILED/.exec(out);
  if(green) return { failed:0, total:Number(green[1]) };
  if(red)   return { failed:Number(red[1]), total:Number(red[2]) };
  return { failed:-1, total:-1 };
}
const failingLines = (out) => out.split("\n").filter(l => /^\s*FAIL /.test(l))
  .map(l => l.trim().slice(0, 150));

const ARMS = [
  { id:"A", file:MODULE, why:"the row's own: `translation` dropped from the op=verify fixture",
    from:`           translation:REQUIRED_ARGUMENT_CANNED && REQUIRED_ARGUMENT_CANNED.translation,`,
    to:  `           translation:undefined,` },
  { id:"B", file:MODULE, why:"the other refusal alone: `translation` dropped from unknownOpWire",
    from:`  translation:UNKNOWN_OP_CANNED && UNKNOWN_OP_CANNED.translation, op });`,
    to:  `  translation:undefined, op });` },
  /* CORRECTED 2026-09-25 by M0-148 (M-139 §7), never exempted: this arm renamed the family in
     the catalogue ALONE, which stops the plane — index.mjs imports it by name. It now renames
     at the plane's import too, so the only variable moved is whether a DISCOVERING lookup
     still finds the row. See the declaration of (C) in this file's header. */
  { id:"C", why:"OVER-STRICTNESS: the catalogue family renamed; same row, same sentence, the plane still starting",
    edits:[
      { file:CATLG, from:`export const DISPATCH_CHECKS = {`, to:`export const DISPATCH_MISS_CHECKS = {` },
      { file:PLANE, from:`         REQUIRED_ARGUMENT_CHECKS, INSTALLATION_CHECKS, DISPATCH_CHECKS,`,
        to:`         REQUIRED_ARGUMENT_CHECKS, INSTALLATION_CHECKS, DISPATCH_MISS_CHECKS as DISPATCH_CHECKS,` },
    ] },
  { id:"D", file:PLANE, why:"the WIDE direction: the plane stops decorating the dispatch miss",
    from:`    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"),\n                             op }, 400);`,
    to:  `    if (!spec) return json({ ok: false, error: "unknown op", reason: "UNKNOWN_OP",\n                             op }, 400);` },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
/* c22-batch30 (M0-197 x M0-148): arm C now carries `edits` (two files), so each edit is its own row. */
anchorTable(ARMS.flatMap((a) => (a.edits || [a]).map((e) => ({ arm: a.id, file: e.file, find: e.from, put: e.to }))));

fs.mkdirSync(TMP, { recursive:true });
console.log("UI-84 NEGATIVE CONTROL — four arms, each ALONE, against the FINAL tree\n");

/* ---- BASELINE ROW. Without one, six-arms-broken and six-arms-working read the same (WORKER.md). ---- */
const base = runSuite();
const bt = tally(base.out);
console.log(`BASELINE (nothing armed): ${bt.total - bt.failed}/${bt.total} green, ${bt.failed} failed, exit ${base.code}`);
if(bt.failed !== 0){
  console.error("BASELINE IS NOT GREEN — every arm below would be measuring a tree that is already broken.");
  for(const l of failingLines(base.out)) console.error("   ", l);
  process.exit(1);
}

let asDeclared = 0;
/* AN ARM MAY PATCH SEVERAL FILES (M0-148, for arm C): each edit is anchored EXACTLY ONCE, every
   file gets its own uniquely-named pristine, and every one is restored and verified by sha256 AND
   by `cmp` before anything is believed. A single-file arm is the one-edit case. */
for(const arm of ARMS){
  const edits = arm.edits || [{ file:arm.file, from:arm.from, to:arm.to }];
  let armed = true;
  const saved = [];
  for(const [k, e] of edits.entries()){
    const pristine = path.join(TMP, `pristine-${arm.id}${k}-${path.basename(e.file)}`);
    fs.copyFileSync(e.file, pristine);
    const before = sha(e.file), bytes = fs.statSync(e.file).size;
    if(bytes < MIN_BYTES[e.file]){
      console.error(`ARM ${arm.id}: SUBJECT TOO SMALL (${bytes} B) — refusing to arm against a truncated file.`);
      process.exit(1);
    }
    saved.push({ file:e.file, pristine, before, bytes });
    const src = fs.readFileSync(e.file, "utf8");
    const hits = src.split(e.from).length - 1;
    if(hits !== 1){
      console.log(`ARM ${arm.id} — NEVER ARMED: its patch in ${path.basename(e.file)} matched ${hits} times, not once. `
                + `AN ARM THAT DID NOT ARM IS A FINDING, and this arm reports nothing about the subject.`);
      armed = false; break;
    }
    fs.writeFileSync(e.file, src.split(e.from).join(e.to));
  }
  const r = armed ? runSuite() : null;
  const t = armed ? tally(r.out) : null;
  /* ---- RESTORE EVERY FILE, and verify each TWO ways before believing anything. ---- */
  let allRestored = true;
  if(armed) console.log(`\nARM ${arm.id} — ${arm.why}`);
  for(const f of saved){
    fs.copyFileSync(f.pristine, f.file);
    const after = sha(f.file);
    let cmpOk = true;
    try{ execFileSync("cmp", ["-s", f.file, f.pristine]); }catch{ cmpOk = false; }
    const restored = after === f.before && cmpOk && fs.statSync(f.file).size === f.bytes;
    if(armed) console.log(`  armed in ${path.relative(ROOT, f.file)} (${f.bytes} B)`);
    console.log(`  RESTORED ${path.basename(f.file)}: sha256 ${f.before.slice(0,8)}… -> ${after.slice(0,8)}… · cmp `
              + `${cmpOk ? "identical" : "DIFFERS"} · ${fs.statSync(f.file).size} B · ${restored ? "VERIFIED" : "*** RESTORE FAILED ***"}`);
    if(!restored) allRestored = false;
  }
  if(!allRestored) process.exit(1);
  if(!armed) continue;
  console.log(`  RESULT: ${t.failed === -1 ? "NO TALLY LINE — the suite did not reach its own foot" :
                 t.failed === 0 ? `GREEN ${t.total}/${t.total}` : `RED ${t.failed} of ${t.total}`} (exit ${r.code})`);
  for(const l of failingLines(r.out)) console.log("    FAILING:", l);
  asDeclared++;
}
fs.rmSync(TMP, { recursive:true, force:true });
console.log(`\nUI-84 control: ${asDeclared} of ${ARMS.length} arms armed and reported. `
          + `Read each RESULT against the DECLARATION in this file's header — an arm whose result differs `
          + `from its declaration is a finding about the ARM and must be recorded, not smoothed.`);
