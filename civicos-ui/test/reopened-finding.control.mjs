/* UI-109 — THE NEGATIVE CONTROL for `reopened-finding.test.mjs`, driven and re-runnable in one step:
 *
 *     node civicos-ui/test/reopened-finding.control.mjs
 *
 * THE ROW'S OWN ARM, stated in `QUEUE.md` `### UI-109`: *omit `prior_disposition` from the render and the
 * reopened-item arm fails by name.* Each arm mutates `civicos-ui/app.html` ALONE by an anchored replacement
 * asserted to match EXACTLY once, runs the suite, restores from a PER-ARM pristine copy verified by sha256
 * AND `cmp` with the byte count guarded. The pen is `mkdtemp`'d under the system temp root, never the
 * worktree — `declared-flow-surface.control.mjs`'s arrangement, whose loop this driver reuses.
 *
 * DECLARED BEFORE ARMING:
 *   BASELINE  unmutated -> GREEN
 *   (A) OMIT `prior_disposition` FROM THE RENDER — `queueItemHtml`'s call to `queueFindingPriorHtml` replaced
 *       by nothing. -> RED, a failing line naming "THE ROW: the reopened item says somebody already decided";
 *       every FIXTURE assertion (the plane's own publication) MUST STAY GREEN, so the arm is the render's.
 *   (B) HIDE `not recorded` ON THE ITEM ONLY — the item's not-recorded sentence replaced by the empty string.
 *       Anchored on the whole function, never the bare sentence (see the arm's own comment).
 *       -> RED, naming "THE ROW, ON THE ITEM"; arm 2's "THE ROW:" and the version-1 naming MUST STAY GREEN.
 *   (C) OVER-STRICTNESS — the item's bold LITERAL words (never an interpolation) re-marked `<em>` and
 *       upper-cased. -> GREEN.
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
const SUITE = path.join(HERE, "reopened-finding.test.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui109-reopened-finding-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* THE SUBJECTS, READ OUT OF app.html ITSELF rather than typed here, so the control cannot agree with itself. */
const SRC0 = fs.readFileSync(APP, "utf8");
const FN_START = SRC0.indexOf("function queueFindingPriorHtml(it){");
const FN_END = SRC0.indexOf("\nfunction queueFindingAsProposal(", FN_START);
if(FN_START < 0 || FN_END < 0) throw new Error("this control could not find queueFindingPriorHtml in app.html");
const FN = SRC0.slice(FN_START, FN_END);
if(FN.length < 1500) throw new Error(`queueFindingPriorHtml read as ${FN.length} chars — too short to be the subject`);
const CALL = "    ${queueFindingPriorHtml(it)}\n";
const itemNR = () => {
  const at = FN.indexOf("Which version of the declared flow that decision judged is");
  const s = FN.lastIndexOf("`", at), e = FN.indexOf("`", at);
  if(at < 0 || s < 0 || e <= s) throw new Error("the item's not-recorded sentence is not a template literal in queueFindingPriorHtml");
  return FN.slice(s, e + 1);
};
const ITEM_NR = itemNR();
const LOUD = FN.replace(/<b>([^<$]*)<\/b>/g, (_, w) => `<em>${w.toUpperCase()}</em>`);
if(LOUD === FN) throw new Error("the over-strictness rewrite changed nothing");

const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) omit prior_disposition from the render", declared: "RED",
    names: "THE ROW: the reopened item says somebody already decided",
    green: ["FIXTURE:"],
    edits: [{ from: CALL, to: "" }] },
  { name: "(B) hide `not recorded` on the ITEM", declared: "RED",
    names: "THE ROW, ON THE ITEM",
    green: ["THE ROW: the reopened item", "the version the decision judged", "FIXTURE:"],
    /* anchored on the WHOLE function, not the sentence. The first run of this driver found the bare
       sentence matching TWICE — an arm that did not arm — because it was then word for word
       `disposedFlowVersionHtml`'s (UI-99). That also meant UI-99's own control, which finds its subject
       by the sentence's FIRST occurrence, would have armed THIS function instead of its own; so the item's
       sentence was reworded, and the whole-function anchor kept because it cannot match anywhere else. */
    edits: [{ from: FN, to: FN.replace(ITEM_NR, '""') }] },
  { name: "(C) over-strictness: the item's bold words upper case and inside <em>", declared: "GREEN",
    edits: [{ from: FN, to: LOUD }] },
];

const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
console.log(`the pen is ${SCRATCH} — outside the worktree, uniquely named for THIS run`);
console.log(`the item's not-recorded sentence, read out of app.html: ${JSON.stringify(ITEM_NR.slice(0, 80))}…`);

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
    const green = /reopened-finding: (\d+) assertions, all green/.exec(out);
    const red = /reopened-finding: (\d+) of (\d+) assertions FAILED/.exec(out);
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
console.log(`\nreopened-finding.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
