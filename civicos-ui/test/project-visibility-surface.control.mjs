/* UI-70 — THE NEGATIVE CONTROL for `project-visibility-surface.test.mjs`, driven and re-runnable in one step:
 *
 *     node civicos-ui/test/project-visibility-surface.control.mjs
 *
 * Each arm mutates `civicos-ui/app.html` ALONE (one anchored replacement, asserted to match EXACTLY once — an
 * arm that did not arm is a finding, never a pass), runs the suite against the mutated file, then restores the
 * file from a per-arm pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a minimum byte
 * count so an empty copy cannot "match". The pristine copies live in `controlPen("UI-70")`, OUTSIDE the worktree
 * (M0-182), and are left there so an interrupted arm can be restored from them. Declared BEFORE arming, per arm:
 * RED or GREEN, and for a RED arm the text its failing lines must NAME.
 *
 *   BASELINE  unmutated                                                                   -> GREEN
 *   (A) THE ROW'S OWN: preselect HIDDEN on every chooser                                  -> RED, naming "NOTHING PRESELECTED"
 *   (B) THE ROW'S LIAR: the Add form's forced-choice guard removed, so an unchosen project
 *       is sent and the plane creates it HIDDEN, silently                                 -> RED, naming "CANNOT SUBMIT: an unchosen project"
 *   (C) the same liar on the fork: its guard removed                                      -> RED, naming "CANNOT SUBMIT: an unchosen fork"
 *   (D) the owner's control offered to a NON-owner                                        -> RED, naming "READ-ONLY"
 *   (E) OVER-STRICTNESS: the two options listed in the other order (correct work in a
 *       spelling the suite did not anticipate)                                           -> GREEN
 *
 * RESULTS: printed on every run; the run recorded for UI-70 is on the suite's NEGATIVE CONTROL: line and in the
 * item's report. This file's own exit is 0 only when every arm came back AS DECLARED.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { controlPen } from "../../bio-plane/test/pen.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "project-visibility-surface.test.mjs");
const PEN = controlPen("UI-70");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) the row's own: preselect HIDDEN", declared: "RED", names: "NOTHING PRESELECTED",
    from: `value="\${v}" onchange="visibilityChoiceChanged(`,
    to:   `value="\${v}"\${v === "hidden" ? " checked" : ""} onchange="visibilityChoiceChanged(` },
  { name: "(B) the liar: the Add form submits unchosen", declared: "RED", names: "CANNOT SUBMIT: an unchosen project",
    from: `if(normalizeType(type) === "project" && !visibility){`,
    to:   `if(false){` },
  { name: "(C) the liar on the fork: it submits unchosen", declared: "RED", names: "CANNOT SUBMIT: an unchosen fork",
    from: `    if(!v){\n      const err = $("#ra-err");`,
    to:   `    if(false){\n      const err = $("#ra-err");` },
  { name: "(D) the owner's control offered to a non-owner", declared: "RED", names: "READ-ONLY",
    from: `  if(!pos || !pos.owner)\n    return \`\${now}<p class="subj-note" data-project-visibility-readonly="1">`,
    to:   `  if(false)\n    return \`\${now}<p class="subj-note" data-project-visibility-readonly="1">` },
  { name: "(E) over-strictness: the options in the other order", declared: "GREEN",
    from: `  ["discoverable", "Discoverable", "Members who are not in this project can see that it exists and what it is called. Nothing inside it is shown to them."],
  ["hidden", "Hidden", "Members who are not in this project cannot tell that it exists."],`,
    to:   `  ["hidden", "Hidden", "Members who are not in this project cannot tell that it exists."],
  ["discoverable", "Discoverable", "Members who are not in this project can see that it exists and what it is called. Nothing inside it is shown to them."],` },
];

const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
const rows = [];
let allAsDeclared = true;
const pristine0 = path.join(PEN, "app.pristine.arm0.html");
try{
  for(const [i, arm] of ARMS.entries()){
    const pristine = path.join(PEN, `app.pristine.arm${i}.html`);
    fs.copyFileSync(APP, pristine);
    if(sha(pristine) !== origSha || fs.statSync(pristine).size !== origBytes) throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    if(arm.from){
      const src = fs.readFileSync(APP, "utf8");
      const hits = src.split(arm.from).length - 1;
      if(hits !== 1){ armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s)`); }
      else fs.writeFileSync(APP, src.replace(arm.from, () => arm.to));
    }
    const r = spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter(l => /^\s*FAIL /.test(l));
    const tally = (/project-visibility-surface: (\d+)\/(\d+) assertions passed/.exec(out) || []).slice(1).join("/") || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? failLines.some(l => l.includes(arm.names)) : null;
    const asDeclared = armed && got === arm.declared && (named === null || named === true);
    if(!asDeclared) allAsDeclared = false;
    fs.copyFileSync(pristine, APP);
    const restoredSha = sha(APP);
    let cmpOk = false;
    try{ execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; }catch(_){ cmpOk = false; }
    if(restoredSha !== origSha || !cmpOk || fs.statSync(APP).size !== origBytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${restoredSha}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, passed ${tally})${arm.names ? ` · names "${arm.names}": ${named}` : ""} · restored ${restoredSha.slice(0, 12)} cmp ok (${origBytes} bytes)`);
    for(const l of failLines) console.log("      " + l.trim().slice(0, 220));
  }
}finally{
  if(sha(APP) !== origSha && fs.existsSync(pristine0)) fs.copyFileSync(pristine0, APP);
  const final = sha(APP);
  console.log(`app.html final sha256 ${final} — ${final === origSha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
}
console.log(`\nproject-visibility-surface.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
