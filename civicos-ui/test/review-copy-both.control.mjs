/* UI-117 — THE NEGATIVE CONTROL for `review-copy-both.test.mjs`, re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/review-copy-both.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not
 * discover it. The driver is `review-copy-both.control.mjs`'s (UI-106), retargeted: each arm mutates app.html
 * ALONE (every anchored replacement asserted to match EXACTLY once — an arm that did not arm is a finding, never a
 * pass), runs the suite, restores app.html from a per-arm pristine copy and verifies the restore by sha256 AND
 * `cmp`, guarding the byte count. Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the text its failing
 * lines MUST name, and the ones that MUST NOT fail (it broke one thing):
 *
 *   BASELINE                                                                        -> GREEN
 *   (A) THE ROW'S OWN — the silent drop restored: the both-read removed from        -> RED, naming
 *       `rvcFormFromCopy`, so the named case is read first and `newCase` is lost       "ROUND TRIP KEEPS BOTH";
 *                                                                                     MUST NOT fail "A SINGLE-CASE DRAFT"
 *   (B) A CHOICE PRESELECTED — the existing case checked on load                    -> RED, naming
 *       "NEITHER CHOICE IS PRESELECTED"; MUST NOT fail "ROUND TRIP KEEPS BOTH"
 *   (C) A KEEP THAT DOES NOT CLEAR — keeping the existing case still sends newCase  -> RED, naming
 *       "KEEP THE EXISTING CASE"; MUST NOT fail "ROUND TRIP KEEPS BOTH" or "KEEP THE NEW CASE"
 *   (D) OVER-STRICTNESS — the plain line re-spelled, same claims                    -> GREEN
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");
const APP = path.join(REPO, "civicos-ui", "app.html");
const SUITE = path.join(HERE, "review-copy-both.test.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui117-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const READ = "  if(cid && c.case.newCase === true){ f.caseMode = \"both\"; f.caseId = String(cid); f.bothHeld = true; }\n  else if(cid){";
const NEXT = "(f.caseMode === \"next\" ? 'checked ' : '') + 'onchange=\"rvcFormField(\\'caseMode\\', \\'next\\')\"> Keep the existing case";
const LINE = "This draft names an existing case and also asks for a new one, and it cannot be published until an owner keeps one of the two: publication refuses them together.";
const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) the silent drop restored", declared: "RED", names: ["ROUND TRIP KEEPS BOTH"],
    mustNotFail: ["A SINGLE-CASE DRAFT"],
    edits: [[READ, "  if(cid){"]] },
  { name: "(B) the existing case preselected", declared: "RED", names: ["NEITHER CHOICE IS PRESELECTED"],
    mustNotFail: ["ROUND TRIP KEEPS BOTH"],
    edits: [[NEXT, "(f.caseMode === \"next\" || f.caseMode === \"both\" ? 'checked ' : '') + 'onchange=\"rvcFormField(\\'caseMode\\', \\'next\\')\"> Keep the existing case"]] },
  { name: "(C) a keep that does not clear", declared: "RED", names: ["KEEP THE EXISTING CASE"],
    mustNotFail: ["ROUND TRIP KEEPS BOTH", "KEEP THE NEW CASE"],
    edits: [["  else if(f.caseMode === \"next\" && String(f.caseId || \"\").trim()) body.caseId = String(f.caseId).trim();\n",
             "  else if(f.caseMode === \"next\" && String(f.caseId || \"\").trim()){ body.caseId = String(f.caseId).trim(); if(f.bothHeld) body.newCase = true; }\n"]] },
  { name: "(D) OVER-STRICTNESS: the plain line re-spelled", declared: "GREEN",
    edits: [[LINE, "It names an existing case, and it asks for a new case as well. Until an owner keeps just one, it cannot be published."]] },
];

fs.mkdirSync(SCRATCH, { recursive: true });
const orig = { sha: sha(APP), bytes: fs.statSync(APP).size };
if (orig.bytes < 1_000_000) throw new Error(`app.html is ${orig.bytes} B — not the file this control expects`);
console.log(`app.html pristine sha256 ${orig.sha} (${orig.bytes} B)`);
const rows = [];
let allAsDeclared = true;
try {
  for (const [i, arm] of ARMS.entries()) {
    const pristine = path.join(SCRATCH, `app.pristine.arm${i}`);
    fs.copyFileSync(APP, pristine);
    if (sha(pristine) !== orig.sha) throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    let src = fs.readFileSync(APP, "utf8");
    for (const [from, to] of arm.edits) {
      const hits = src.split(from).length - 1;
      if (hits !== 1) { armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s): ${from.slice(0, 90)}`); }
      else src = src.replace(from, () => to);
    }
    if (armed && arm.edits.length) fs.writeFileSync(APP, src);
    const r = spawnSync("node", [SUITE], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 300000 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    const tally = (/review-copy-both\.test\.mjs: (\d+ pass, \d+ fail)/.exec(out) || [])[1] || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? arm.names.every((nm) => failLines.some((l) => l.includes(nm))) : null;
    const spared = arm.mustNotFail ? arm.mustNotFail.every((nm) => !failLines.some((l) => l.includes(nm))) : null;
    const asDeclared = armed && got === arm.declared && named !== false && spared !== false && tally !== "-1";
    if (!asDeclared) allAsDeclared = false;
    fs.copyFileSync(pristine, APP);
    let cmpOk = false;
    try { execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; } catch (_) { cmpOk = false; }
    const s = sha(APP);
    if (s !== orig.sha || !cmpOk || fs.statSync(APP).size !== orig.bytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${s}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · names ${JSON.stringify(arm.names)}: ${named}` : ""}`
      + `${arm.mustNotFail ? ` · spares ${JSON.stringify(arm.mustNotFail)}: ${spared}` : ""}`
      + ` · restored ${s.slice(0, 12)} cmp ok`);
    for (const l of failLines) console.log("      " + l.trim().slice(0, 200));
  }
} finally {
  if (sha(APP) !== orig.sha) {
    for (const i of ARMS.keys()) {
      const c = path.join(SCRATCH, `app.pristine.arm${i}`);
      if (fs.existsSync(c) && sha(c) === orig.sha) { fs.copyFileSync(c, APP); break; }
    }
  }
  const s = sha(APP);
  console.log(`app.html final sha256 ${s} — ${s === orig.sha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
  if (s === orig.sha) fs.rmSync(SCRATCH, { recursive: true, force: true });
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`review-copy-both.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
