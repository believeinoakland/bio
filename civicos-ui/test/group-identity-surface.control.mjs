/* UI-78 — THE NEGATIVE CONTROL for `group-identity-surface.test.mjs`, driven and re-runnable in one step from the repo
 * root:
 *
 *     node civicos-ui/test/group-identity-surface.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not discover
 * it. The driver is UI-77's (`group-surface.control.mjs`), its arms this item's: each arm mutates `app.html` ALONE (every
 * anchored replacement asserted to match EXACTLY once — an arm that did not arm is a finding, never a pass), runs the
 * suite against the mutated file, then restores the file from a per-arm pristine copy (in the gitignored, item-named
 * `.ui78-harness/`) and verifies the restore by sha256 AND by `cmp`, guarding a minimum byte count. Declared BEFORE
 * arming, per arm: RED or GREEN; for a RED arm the assertions its failing lines MUST name, and those that MUST NOT fail:
 *
 *   BASELINE  unmutated                                                                     -> GREEN
 *   (A) THE ROW'S CONTROL — the domain rendered WITHOUT its verdict: the reader takes the claimed domain whether or not
 *       the answer dates it verified, and the header line no longer asks for the date      -> RED, naming
 *       "U3 UNVERIFIED DOMAIN, SURFACE GATE" and "R1"; MUST NOT fail "U1 UNVERIFIED DOMAIN, HEADER" (over the real
 *       plane the stranger's answer carries no unverified domain, so the plane's own gate still holds there — which is
 *       exactly why U3 exists) nor "V1"
 *   (B) THE LIAR THE ROW NAMES — the display name shown ALONE                              -> RED, naming
 *       "N2 NEVER INSTEAD, HEADER"; MUST NOT fail "F1" (no name recorded: the slug is still shown)
 *   (C) MEMBERS DENIED THE VERDICT — the fence names the claimed domain and drops its verdict and date
 *                                                                                           -> RED, naming
 *       "U2 MEMBERS SEE VERDICT (mismatched)"; MUST NOT fail "U1 UNVERIFIED DOMAIN, HEADER"
 *   (D) OVER-STRICTNESS — the name and slug as "Name (slug)", the domain line as "verified on <date>"
 *                                                                                           -> GREEN
 *   (E) OVER-TIGHT — the header never shows a domain, verified or not                      -> RED, naming
 *       "V1 VERIFIED DOMAIN, HEADER"; MUST NOT fail "U1 UNVERIFIED DOMAIN, HEADER" (a surface that says nothing passes
 *       every "not shown" arm; V1 is the arm that sees it)
 *
 * RESULTS — see the RESULTS line this file's run prints; the figures of the run that landed are recorded in
 * `group-identity-surface.test.mjs`'s NEGATIVE CONTROL line and in the landing's report.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "group-identity-surface.test.mjs");
const SCRATCH = path.join(HERE, "..", "..", ".ui78-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const GATE_FROM = `  if(typeof r.domain === "string" && r.domain && typeof r.domain_verified_at === "string" && r.domain_verified_at){
    g.domain = r.domain; g.domainAt = r.domain_verified_at;
  }`;
const GATE_TO = `  const dd = r.domain || (r.domain_claim && r.domain_claim.domain);
  if(typeof dd === "string" && dd){ g.domain = dd; g.domainAt = r.domain_verified_at || null; }`;
const LINE_FROM = "  return g.state === \"recorded\" && g.domain && g.domainAt ? `${g.domain} \\u00b7 verified ${String(g.domainAt).slice(0, 10)}` : \"\";";
const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) the domain rendered without its verdict", declared: "RED",
    names: ["U3 UNVERIFIED DOMAIN, SURFACE GATE", "R1"], mustNotFail: ["U1 UNVERIFIED DOMAIN, HEADER", "V1"],
    edits: [[GATE_FROM, GATE_TO],
            [LINE_FROM, "  return g.state === \"recorded\" && g.domain ? `${g.domain}${g.domainAt ? \" \\u00b7 verified \" + String(g.domainAt).slice(0, 10) : \"\"}` : \"\";"]] },
  { name: "(B) the liar: the display name alone", declared: "RED",
    names: ["N2 NEVER INSTEAD, HEADER"], mustNotFail: ["F1"],
    edits: [["  return g.name ? `${g.name} \\u00b7 ${g.slug}` : g.slug;", "  return g.name ? g.name : g.slug;"]] },
  { name: "(C) members denied the verdict", declared: "RED",
    names: ["U2 MEMBERS SEE VERDICT (mismatched)"], mustNotFail: ["U1 UNVERIFIED DOMAIN, HEADER"],
    edits: [["  if(!c) return \"\";\n", "  if(!c) return \"\";\n  return `domain claimed: ${c.domain}`;\n"]] },
  { name: "(D) over-strictness: other spellings", declared: "GREEN",
    edits: [["  return g.name ? `${g.name} \\u00b7 ${g.slug}` : g.slug;", "  return g.name ? `${g.name} (${g.slug})` : g.slug;"],
            [LINE_FROM, "  return g.state === \"recorded\" && g.domain && g.domainAt ? `${g.domain}, verified on ${String(g.domainAt).slice(0, 10)}` : \"\";"]] },
  { name: "(E) over-tight: no domain ever", declared: "RED",
    names: ["V1 VERIFIED DOMAIN, HEADER"], mustNotFail: ["U1 UNVERIFIED DOMAIN, HEADER"],
    edits: [[LINE_FROM, "  return \"\";"]] },
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
    const tally = (/group-identity-surface: (\d+\/\d+) assertions passed/.exec(out) || [])[1] || "-1";
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
console.log(`group-identity-surface.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
