/* UI-108 — THE NEGATIVE CONTROL for `progression-decided-finding.test.mjs`, re-runnable in one step:
 *
 *     node civicos-ui/test/progression-decided-finding.control.mjs
 *
 * THE ROW'S OWN ARM, stated in `QUEUE.md` `### UI-108`: *render `inst.findings` without the view and the
 * decided-finding arm fails by name.* Each arm mutates `civicos-ui/app.html` ALONE, by an anchored
 * replacement asserted to match EXACTLY once (an arm that did not arm is a finding, never a pass), runs the
 * suite, and restores from a PER-ARM pristine copy verified by sha256 AND `cmp`, the byte count guarded. The
 * pen is `mkdtemp`'d under the system temp root, uniquely named for the run, never inside the worktree.
 *
 * DECLARED BEFORE ARMING:
 *   BASELINE  unmutated -> GREEN
 *   (A) THE ROW'S ARM — `progPaintInstance` paints `inst.findings` WITHOUT the view: its
 *       `progFindingDecisionHtml(f)` call replaced by the empty string (yesterday's page).
 *       -> RED, failing lines naming THE DECIDED-FINDING ARM. MUST STAY GREEN: THE PLANE'S VIEW, BY NAME (the
 *          plane is untouched), "the finding is STILL LISTED", and THE REFUSAL ARM.
 *   (B) HIDE THE REFUSAL — the refused read's `intentRefusalHtml(instRefusal)` replaced by the empty string.
 *       -> RED, naming THE REFUSAL ARM. MUST STAY GREEN: THE DECIDED-FINDING ARM.
 *   (C) OVER-STRICTNESS — the decision's lead sentence upper-cased and marked up with `<em>` instead of `<b>`;
 *       the member reads the same words. -> GREEN, every assertion.
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
const SUITE = path.join(HERE, "progression-decided-finding.test.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui108-decided-finding-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const VIEW_CALL = "+ progFindingDecisionHtml(f)";
const REFUSAL_PAINT = "instRefusal ? intentRefusalHtml(instRefusal)";
const LEAD_OPEN = "`<b>A member decided this finding: set aside${";
const LEAD_CLOSE = "${at ? \" on \" + esc(at) : \"\"}.</b>`\n    + ` It stays listed here";

const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) render inst.findings WITHOUT the view", declared: "RED",
    names: "THE DECIDED-FINDING ARM",
    green: ["THE PLANE'S VIEW, BY NAME", "the finding is STILL LISTED", "THE REFUSAL ARM"],
    edits: [{ from: VIEW_CALL, to: "+ \"\"" }] },
  { name: "(B) hide the refused read's canned translation", declared: "RED",
    names: "THE REFUSAL ARM",
    green: ["THE DECIDED-FINDING ARM"],
    edits: [{ from: REFUSAL_PAINT, to: "instRefusal ? \"\"" }] },
  { name: "(C) over-strictness: the lead sentence upper case and inside <em>", declared: "GREEN",
    edits: [{ from: LEAD_OPEN, to: "`<em>A MEMBER DECIDED THIS FINDING: SET ASIDE${" },
            { from: LEAD_CLOSE, to: LEAD_CLOSE.replace(".</b>", ".</em>") }] },
];

const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
console.log(`the pen is ${SCRATCH} — outside the worktree, uniquely named for THIS run`);

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
    const green = /progression-decided-finding: (\d+) assertions, all green/.exec(out);
    const red = /progression-decided-finding: (\d+) of (\d+) assertions FAILED/.exec(out);
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
console.log(`\nprogression-decided-finding.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
