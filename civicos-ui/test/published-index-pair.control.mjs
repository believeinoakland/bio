/* UI-82 — THE NEGATIVE CONTROL for `published-index-pair.test.mjs`, driven and re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/published-index-pair.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not discover
 * it. The driver is `authored-group.control.mjs`'s (UI-79), unchanged but for the subject: each arm mutates `app.html`
 * ALONE (every anchored replacement asserted to match EXACTLY once — an arm that did not arm is a finding, never a
 * pass), runs the suite, restores the file from a per-arm pristine copy and verifies the restore by sha256 AND by
 * `cmp`, guarding a minimum byte count. Declared BEFORE arming, per arm:
 *
 *   BASELINE  unmutated                                                                           -> GREEN
 *   (A) THE ROW'S CONTROL — `pubList` reads the single field again (`pubPair(row)`, the scalar)   -> RED, naming
 *       all four "PER CASE" arms and "NONE READS 'NO FROZEN PAIR'"; MUST NOT fail "SINGLE CASE", "OVER-STRICTNESS"
 *       or "TRUE NEGATIVE" (a one-pair row and a true no-pair row are what the scalar still answers)
 *   (B) THE LIAR (IC-74) — `pubCasePairOf` takes the list's FIRST entry for every case row, one case's pair shown
 *       under both                                                                                -> RED, naming
 *       "NEVER ONE CASE'S PAIR UNDER ANOTHER"; MUST NOT fail "NONE READS 'NO FROZEN PAIR'", "SINGLE CASE" or
 *       "OVER-STRICTNESS" (the liar draws a pair everywhere; it is the WRONG one)
 *   (C) OVER-STRICTNESS — the per-case sentence re-worded, keeping the case and edition it names  -> GREEN
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "published-index-pair.test.mjs");
const SCRATCH = path.join(HERE, "..", "..", ".ui82-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) pubList reads the single field again", declared: "RED",
    names: ["PER CASE: Q under case X", "PER CASE: Q under case Y", "PER CASE: S under case X", "PER CASE: S under case Y",
            "NONE READS 'NO FROZEN PAIR'"],
    mustNotFail: ["SINGLE CASE", "OVER-STRICTNESS", "TRUE NEGATIVE"],
    edits: [["        const got = pubCasePairOf(row, cs);\n",
             "        const got = { kind: \"row\", pair: pubPair(row), entry: null, list: [] };\n"]] },
  { name: "(B) the liar: the first listed case's pair under every case", declared: "RED",
    names: ["NEVER ONE CASE'S PAIR UNDER ANOTHER"],
    mustNotFail: ["NONE READS 'NO FROZEN PAIR'", "SINGLE CASE", "OVER-STRICTNESS"],
    edits: [["    const entry = list.find((e) => String(e.case_id) === String(cs && cs.case_id) && Number(e.edition) === Number(cs && cs.edition)) || null;\n",
             "    const entry = list[0] || null;\n"]] },
  { name: "(C) over-strictness: the per-case sentence re-worded", declared: "GREEN",
    edits: [["'s own reading of this finding, as that case's signed document states it.",
             " reads this finding this way in its own signed case document."]] },
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
    const tally = (/published-index-pair\.test\.mjs: (\d+ pass, \d+ fail)/.exec(out) || [])[1] || "-1";
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
console.log(`published-index-pair.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
