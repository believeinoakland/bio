/* UI-77 — THE NEGATIVE CONTROL for `group-surface.test.mjs`, driven and re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/group-surface.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not discover
 * it. Each arm mutates `app.html` ALONE (every anchored replacement asserted to match EXACTLY once — an arm that did not
 * arm is a finding, never a pass), runs the suite against the mutated file, then restores the file from a per-arm
 * pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a minimum byte count so an empty copy cannot
 * "match". Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the assertion its failing lines MUST name, and
 * the assertion that MUST NOT fail (which is what shows the arm broke only the thing):
 *
 *   BASELINE  unmutated                                                                     -> GREEN
 *   (A) THE ROW'S CONTROL — the `GROUP` literal restored: the pre-UI-77 code at all four sites (the declaration, the
 *       markup, `boot`/`previewShell`'s two lines, `enterPublished`'s three)                 -> RED, naming
 *       "SIGNED OUT NO-LITERAL" and "SIGNED IN NO-LITERAL" (the DOM-text arms)
 *   (B) THE LIAR — the slug painted, and a CSS-hidden span carrying the literal BUILT AT RUN TIME beside it
 *                                                                                           -> RED, naming
 *       "SIGNED OUT NO-LITERAL"; MUST NOT fail "SOURCE NO-LITERAL" (the census cannot see a built name — the DOM arm must)
 *   (C) A SILENCE READ AS "NONE" — every answer that is not a slug painted as the absence   -> RED, naming
 *       "SILENCE (the store's own 502): NEITHER"; MUST NOT fail "NONE, SIGNED OUT, HEADER" (a true absence still reads right)
 *   (D) OVER-STRICTNESS — the absence said in other words ("No group has been recorded for this copy")
 *                                                                                           -> GREEN
 *
 * RESULTS, RUN 2026-09-22 by UI-77 — see the RESULTS line this file's run prints; the figures of the run that landed
 * are recorded in `group-surface.test.mjs`'s NEGATIVE CONTROL line and in the landing's report.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "group-surface.test.mjs");
const SCRATCH = path.join(HERE, "..", "..", ".ui77-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const SILENT = "This copy could not read its group just now";

const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) the GROUP literal restored", declared: "RED",
    names: ["SIGNED OUT NO-LITERAL", "SIGNED IN NO-LITERAL"],
    edits: [
      [`const GROUP_WORDS = {`,
       `const GROUP = { name:"Believe in Oakland", idstr:"believeinoakland.org", mono:"B" };\nconst GROUP_WORDS = {`],
      [`<span class="grp" id="m-grp" data-group="silent">${SILENT}</span>`, `<span class="grp" id="m-grp">group</span>`],
      [`<div class="idstr" id="m-idstr" data-group="silent">${SILENT}</div>`, `<div class="idstr" id="m-idstr">believeinoakland.org</div>`],
      [`<div class="mono-square" id="p-mono" data-group="silent"></div>`, `<div class="mono-square" id="p-mono">B</div>`],
      [`<div><div class="gname" id="p-gname" data-group="silent">${SILENT}</div><div class="gid" id="p-gid"></div></div>`,
       `<div><div class="gname" id="p-gname">Believe in Oakland</div><div class="gid" id="p-gid">believeinoakland.org</div></div>`],
      [`  paintGroup("working");   /* UI-77: preview holds no plane, so this paints the silent line */\n`,
       `  $("#m-grp").textContent = GROUP.name;\n  $("#m-idstr").textContent = GROUP.idstr.slice(0,32);\n`],
      /* CORRECTED 2026-09-25 BY UI-78: the anchor carries the boot line's comment, which now names op=groupidentity. */
      [`  await paintGroup("working");   /* UI-77/UI-78: the recorded slug (with any display name and the domain claim), or the stated absence, from op=groupidentity */\n`,
       `  $("#m-grp").textContent = GROUP.name;\n  $("#m-idstr").textContent = GROUP.idstr.slice(0,32);\n`],
      [`  PUB_GROUP = paintGroup("published");\n`,
       `  $("#p-gname").textContent = GROUP.name;\n  $("#p-gid").textContent = GROUP.idstr.slice(0, 32);\n  $("#p-mono").textContent = GROUP.mono;\n`],
    ] },
  { name: "(B) the liar: a CSS-hidden literal built at run time", declared: "RED",
    names: ["SIGNED OUT NO-LITERAL"], mustNotFail: ["SOURCE NO-LITERAL"],
    edits: [[`  e.textContent = words;\n  if(e.dataset) e.dataset.group = g.state;`,
             `  e.textContent = words;\n  e.innerHTML = esc(words) + '<span style="display:none">' + ["Believe","in","Oak"+"land"].join(" ") + '</span>';\n  if(e.dataset) e.dataset.group = g.state;`]] },
  { name: "(C) a silence read as none", declared: "RED",
    names: ["SILENCE (the store's own 502): NEITHER"], mustNotFail: ["NONE, SIGNED OUT, HEADER"],
    edits: [[`  if(r && r.ok === true && r.group === null) return { state:"none", slug:null };`,
             `  if(!(r && r.ok === true && typeof r.group === "string" && r.group)) return { state:"none", slug:null };`]] },
  { name: "(D) over-strictness: the absence in other words", declared: "GREEN",
    edits: [[`  none:   "No group is recorded for this copy yet",`, `  none:   "No group has been recorded for this copy",`]] },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => (a.edits ? a.edits.map(([find, put]) => ({ arm: a.name.split(" ")[0], file: APP, find, put }))
  : [{ arm: a.name.split(" ")[0], none: "nothing armed" }])));

fs.mkdirSync(SCRATCH, { recursive: true });
const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
const rows = [];
let allAsDeclared = true;
try{
  for(const [i, arm] of ARMS.entries()){
    const pristine = path.join(SCRATCH, `app.pristine.arm${i}.html`);
    fs.copyFileSync(APP, pristine);
    if(sha(pristine) !== origSha || fs.statSync(pristine).size !== origBytes) throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    if(arm.edits){
      let src = fs.readFileSync(APP, "utf8");
      for(const [from, to] of arm.edits){
        const hits = src.split(from).length - 1;
        if(hits !== 1){ armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s): ${from.slice(0, 80)}`); }
        else src = src.replace(from, () => to);
      }
      if(armed) fs.writeFileSync(APP, src);
    }
    const r = spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter(l => /^\s*FAIL /.test(l));
    const tally = (/group-surface: (\d+\/\d+) assertions passed/.exec(out) || [])[1] || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? arm.names.every(nm => failLines.some(l => l.includes(nm))) : null;
    const spared = arm.mustNotFail ? arm.mustNotFail.every(nm => !failLines.some(l => l.includes(nm))) : null;
    const asDeclared = armed && got === arm.declared && named !== false && spared !== false && tally !== "-1";
    if(!asDeclared) allAsDeclared = false;
    fs.copyFileSync(pristine, APP);
    const restoredSha = sha(APP);
    let cmpOk = false;
    try{ execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; }catch(_){ cmpOk = false; }
    if(restoredSha !== origSha || !cmpOk || fs.statSync(APP).size !== origBytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${restoredSha}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, passed ${tally})${arm.names ? ` · names ${JSON.stringify(arm.names)}: ${named}` : ""}`
      + `${arm.mustNotFail ? ` · spares ${JSON.stringify(arm.mustNotFail)}: ${spared}` : ""} · restored ${restoredSha.slice(0, 12)} cmp ok`);
    for(const l of failLines) console.log("      " + l.trim().split("\n")[0].slice(0, 200));
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
console.log(`\nRESULTS: ${rows.map(r => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`group-surface.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
