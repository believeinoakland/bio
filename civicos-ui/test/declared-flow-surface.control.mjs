/* UI-99 — THE NEGATIVE CONTROL for `declared-flow-surface.test.mjs`, driven and re-runnable in one step:
 *
 *     node civicos-ui/test/declared-flow-surface.control.mjs
 *
 * THE ROW'S OWN ARM, stated in `QUEUE.md` `### UI-99`: *hide `not recorded` and its arm fails by name.*
 * The words `not recorded` are written in TWO places by this item, because the record has two things it
 * can fail to hold — the BASIS of a declared flow's version, and the VERSION a decision judged — so the
 * arm is armed twice, once in each, and each declares which assertion must fall and which must stand.
 * An arm that broke both at once could not tell the two surfaces apart, and this project has paid for a
 * control that moved a second variable.
 *
 * Each arm mutates `civicos-ui/app.html` ALONE, by anchored replacement asserted to match EXACTLY once —
 * an arm that did not arm is a finding and never a pass — runs the suite against the mutated file, then
 * restores from a PER-ARM pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a
 * minimum byte count so an empty copy cannot "match". The pen is a uniquely-named directory under the
 * system temp root and NEVER inside the worktree (BOB #32, 2026-09-24: a file in the worktree is walked
 * by repository-walking suites, trips `gates.mjs` §2e and makes the tree dirty, so D-293 refuses a GREEN
 * verdict over it) — and it is `mkdtemp`'d rather than named, because a shared, unqualified name under a
 * shared temp root is an identity nobody owns (WORKER.md's measured receipt).
 *
 * DECLARED BEFORE ARMING:
 *   BASELINE  unmutated                                                        -> GREEN
 *   (A) HIDE `not recorded` ON THE DISPOSITION — `disposedFlowVersionHtml`'s not-recorded sentence
 *       replaced by the empty string, so a decision whose version the record does not hold renders a
 *       BLANK where the words were.
 *       -> RED, the failing lines naming THE ROW'S SECOND HALF. The declared-flow VERSION arms — arm 1's
 *          basis sentence, arm 3's version-1 naming, arm 4's reopening — MUST STAY GREEN.
 *   (B) HIDE `not recorded` ON A VERSION'S BASIS — `progVersionBasisHtml`'s both-absent sentence replaced
 *       by the empty string, so a version the record holds no basis for renders nothing at all.
 *       -> RED, the failing line naming version 1's absent basis. THE ROW'S FIRST HALF and THE ROW'S
 *          SECOND HALF MUST STAY GREEN — that is what makes this arm the basis surface's own rather than
 *          a second reading of the disposition's.
 *   (C) OVER-STRICTNESS — both sentences rewritten in a spelling nobody anticipated: the words upper-cased
 *       and marked up with `<em>` instead of `<b>`. The RULE is unchanged and the member reads the same
 *       words. -> GREEN, every assertion, because the suite matches what a member READS (tags stripped,
 *       entities opened, case-insensitive) and never the markup.
 *
 * RESULTS ARE PRINTED ON EVERY RUN and this file's own exit is 0 only when every arm came back AS
 * DECLARED. The measured results of the first run are recorded in `declared-flow-surface.test.mjs`'s
 * own NEGATIVE CONTROL block, which is the line a reader of the suite meets.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "declared-flow-surface.test.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui99-declared-flow-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* THE TWO SENTENCES, READ OUT OF app.html ITSELF rather than typed here. A control that types the string
   it looks for agrees with itself for free, and this project has measured a complete hand copy of 131 op
   names passing. Each is located by its own opening words and taken to the end of its template literal. */
const SRC0 = fs.readFileSync(APP, "utf8");
function literalAt(openingWords){
  const at = SRC0.indexOf(openingWords);
  if(at < 0) throw new Error(`this control could not find its subject in app.html: ${openingWords}`);
  const start = SRC0.lastIndexOf("`", at);
  const end = SRC0.indexOf("`", at);
  if(start < 0 || end < 0 || end <= start) throw new Error(`the sentence around "${openingWords}" is not a template literal`);
  const lit = SRC0.slice(start, end + 1);
  if(lit.length < 60) throw new Error(`the literal read for "${openingWords}" is ${lit.length} chars — too short to discriminate`);
  return lit;
}
const BASIS_SENTENCE = literalAt("Why this version says what it says is");
const VERSION_SENTENCE = literalAt("Which version of the declared flow it judged is");
/* the over-strictness rewrite: the same words, a spelling the suite was not written against. */
const loud = (lit) => lit.replace(/<b>not recorded<\/b>/g, "<em>NOT RECORDED</em>");

const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) hide `not recorded` on the DISPOSITION", declared: "RED",
    names: "THE ROW'S SECOND HALF",
    green: ["version 1's absent basis is stated as", "THE ROW'S FIRST HALF", "no longer answers the question"],
    edits: [{ from: VERSION_SENTENCE, to: '""' }] },
  { name: "(B) hide `not recorded` on a VERSION'S BASIS", declared: "RED",
    names: "version 1's absent basis is stated as",
    green: ["THE ROW'S FIRST HALF", "THE ROW'S SECOND HALF", "no longer answers the question"],
    edits: [{ from: BASIS_SENTENCE, to: '""' }] },
  { name: "(C) over-strictness: the same words, upper case and inside <em>", declared: "GREEN",
    edits: [{ from: BASIS_SENTENCE, to: loud(BASIS_SENTENCE) },
            { from: VERSION_SENTENCE, to: loud(VERSION_SENTENCE) }] },
];

const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
console.log(`the pen is ${SCRATCH} — outside the worktree, uniquely named for THIS run`);
console.log(`the BASIS sentence, read out of app.html: ${JSON.stringify(BASIS_SENTENCE.slice(0, 80))}…`);
console.log(`the VERSION sentence, read out of app.html: ${JSON.stringify(VERSION_SENTENCE.slice(0, 80))}…`);

const rows = [];
let allAsDeclared = true;
try{
  for(const [i, arm] of ARMS.entries()){
    const pristine = path.join(SCRATCH, `app.pristine.arm${i}.html`);
    fs.copyFileSync(APP, pristine);
    if(sha(pristine) !== origSha || fs.statSync(pristine).size !== origBytes)
      throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    let src = fs.readFileSync(APP, "utf8");
    for(const e of arm.edits){
      const hits = src.split(e.from).length - 1;
      if(hits !== 1){ armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s)`); break; }
      src = src.replace(e.from, e.to);
    }
    if(armed && arm.edits.length) fs.writeFileSync(APP, src);
    const r = spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter(l => /^\s*FAIL /.test(l));
    /* THE TALLY, in BOTH of the suite's spellings. A run that printed neither reports -1, never 0 — a
       TypeError inside an assertion ends the module through no assertion at all, and a missing tally is
       the only sign of it (WORKER.md). */
    const green = /declared-flow-surface: (\d+) assertions, all green/.exec(out);
    const red = /declared-flow-surface: (\d+) of (\d+) assertions FAILED/.exec(out);
    const tally = green ? `${green[1]} asserted / 0 failed`
                : red ? `${red[2]} asserted / ${red[1]} failed` : "-1 (the suite printed NO tally)";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? failLines.some(l => l.includes(arm.names)) : null;
    /* THE ARMS THAT MUST STAY GREEN, checked by their own text rather than by a count: a control that
       only counts failures cannot tell one-arm-broken from three. */
    const stillGreen = (arm.green || []).every(sec => !failLines.some(l => l.includes(sec)));
    const asDeclared = armed && got === arm.declared && tally !== "-1 (the suite printed NO tally)"
      && (named === null || named === true) && stillGreen;
    if(!asDeclared) allAsDeclared = false;
    fs.copyFileSync(pristine, APP);
    const restoredSha = sha(APP);
    let cmpOk = false;
    try{ execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; }catch(_){ cmpOk = false; }
    if(restoredSha !== origSha || !cmpOk || fs.statSync(APP).size !== origBytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${restoredSha}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · a failing line names its declared text: ${named}` : ""}`
      + `${arm.green ? ` · declared-green assertions still green: ${stillGreen}` : ""}`
      + ` · restored ${restoredSha.slice(0, 12)} cmp ok, ${fs.statSync(APP).size} bytes`);
    for(const l of failLines) console.log("      " + l.trim().slice(0, 220));
  }
}finally{
  if(sha(APP) !== origSha){
    const p0 = path.join(SCRATCH, "app.pristine.arm0.html");
    if(fs.existsSync(p0)) fs.copyFileSync(p0, APP);
  }
  const final = sha(APP);
  console.log(`app.html final sha256 ${final} — ${final === origSha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
  if(final === origSha) fs.rmSync(SCRATCH, { recursive: true, force: true });
}
console.log(`\ndeclared-flow-surface.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
