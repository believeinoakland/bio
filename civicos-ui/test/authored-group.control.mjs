/* UI-79 — THE NEGATIVE CONTROL for `authored-group.test.mjs`, driven and re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/authored-group.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not discover
 * it. Each arm mutates `app.html` ALONE (every anchored replacement asserted to match EXACTLY once — an arm that did not
 * arm is a finding, never a pass), runs the suite against the mutated file, then restores the file from a per-arm
 * pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a minimum byte count so an empty copy cannot
 * "match". Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the assertions its failing lines MUST name, and
 * the ones that MUST NOT fail (which is what shows the arm broke only the thing):
 *
 *   BASELINE  unmutated                                                                     -> GREEN
 *   (A) THE ROW'S CONTROL — ONE `meta.group` literal restored, in `addGo`'s creation meta    -> RED, naming
 *       "PLANTED-SLUG (SENT) — the Add surface, a typed note"; MUST NOT fail "PLANTED-SLUG (HELD) — the Add surface, a
 *       typed note" (the plane stamps over a caller: the held bytes alone cannot see this, which is why the SENT arm exists)
 *   (B) THE LIAR — a DIFFERENT hard-coded slug written into `mdFor`'s bytes (never the old one, so no literal census
 *       can catch it)                                                                        -> RED, naming
 *       "PLANTED-SLUG (SENT) — the proposal adoption"; MUST NOT fail "SOURCE NO-LITERAL"
 *   (C) OVER-STRICTNESS — a COMMENT inside `addGo`'s meta saying the plane writes the group (a spelling the static
 *       writer walk must read through, not match)                                             -> GREEN
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "authored-group.test.mjs");
const SCRATCH = path.join(HERE, "..", "..", ".ui79-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const ADD_META = `      /* UI-79: no \`group\` — the plane stamps the instance's recorded one (IC-172). */\n      meta: { object_type: type, title,`;

const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) one meta.group literal restored (addGo)", declared: "RED",
    names: ["PLANTED-SLUG (SENT) — the Add surface, a typed note"],
    mustNotFail: ["PLANTED-SLUG (HELD) — the Add surface, a typed note"],
    edits: [[ADD_META, `      meta: { object_type: type, group:"believe-in-oakland", title,`]] },
  { name: "(B) the liar: a different hard-coded slug in mdFor's bytes", declared: "RED",
    names: ["PLANTED-SLUG (SENT) — the proposal adoption"], mustNotFail: ["SOURCE NO-LITERAL"],
    edits: [[`    "produced_by:","  mode: assisted","  capability_tier: session",\n`,
             `    "produced_by:","  mode: assisted","  capability_tier: session",\n    "group: riverside-residents-union",\n`]] },
  { name: "(C) over-strictness: a comment in the meta", declared: "GREEN",
    edits: [[ADD_META, `      meta: { object_type: type, /* group: the plane writes it */ title,`]] },
];

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
    const tally = (/authored-group: (\d+\/\d+) assertions passed/.exec(out) || [])[1] || "-1";
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
    for(const l of failLines) console.log("      " + l.trim().split("\n")[0].slice(0, 220));
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
console.log(`authored-group.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
