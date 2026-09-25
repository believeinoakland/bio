/* D-189 — the negative control for `project-bias.test.mjs`. Run: `node civicos-ui/test/project-bias.control.mjs [arm]`.
 *
 * Every arm is armed ALONE on the EXTRACTED app script (app.html is never edited, so there is nothing to restore), each
 * splice asserted to match EXACTLY ONCE (an arm that never armed is a finding, not a pass), and handed to the suite
 * through `D189_APP_SRC`. Declared before arming:
 *   baseline     MUST PASS.
 *   emptyproject THE ROW'S CONTROL, workspace half — the indicator rendered on an EMPTY manifest. MUST FAIL, naming
 *                "§1 THE WORKSPACE DRAWS NO INDICATOR". §2–§4 must stay green (they render non-empty answers).
 *   emptycase    THE ROW'S CONTROL, publication half — the indicator rendered on an EMPTY signed block. MUST FAIL,
 *                naming "§1 THE PUBLISHED PAGE DRAWS NO INDICATOR" and §4's "FROZEN, NOT TODAY'S".
 *   ownignored   no set is ever called the project's own. MUST FAIL, naming §3's "marks ONE set as its own" and
 *                "THE WORKSPACE SAYS B CARRIES ITS OWN BIAS". §2 must stay green (it asserts zero own).
 *   hunchonly    the publication surface reverted to the hunch legs alone. MUST FAIL, naming §4's three case-Y arms.
 *   spelling     OVER-STRICTNESS: the scope test spelled another way. MUST PASS.
 *
 * CONTROL RESULT 2026-09-25 (D-189 worker), `node civicos-ui/test/project-bias.control.mjs`, exit 0, every arm armed
 * alone on the EXTRACTED script, each splice matched exactly once:
 *   baseline     exit 0 · 26 pass / 0 fail.
 *   emptyproject exit 1 · 25/1 — "§1 THE WORKSPACE DRAWS NO INDICATOR for an empty manifest", as declared.
 *   emptycase    exit 1 · 24/2 — "§1 THE PUBLISHED PAGE DRAWS NO INDICATOR" and §4 "FROZEN, NOT TODAY'S", as declared.
 *   ownignored   exit 1 · 23/3 — §3 "marks ONE set as its own", "THE WORKSPACE SAYS B CARRIES ITS OWN BIAS", AND §3
 *                "names both sets" — ONE MORE than declared, and it is the arm's own reach, not a second cause: with
 *                `own` emptied the "This project's own" row is never drawn, so B's set leaves the page with it.
 *   hunchonly    exit 1 · 23/3 — §4's three case-Y arms, as declared.
 *   spelling     exit 0 · 26/0 — OVER-STRICTNESS, GREEN as declared.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./project-bias.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const OWN = `  const own = sets.filter(b => b.scope === "project");`;
const ARMS = {
  baseline: { pass: true, arm: (s) => s },
  emptyproject: { pass: false, arm: (s) => one(s, "  if(r.in_force !== true)\n    return pins.length", "  if(false)\n    return pins.length") },
  emptycase: { pass: false, arm: (s) => one(s, `  if(lens.in_force !== true || !lens.bundles.length) return "";`, `  if(false) return "";`) },
  ownignored: { pass: false, arm: (s) => one(s, OWN, `  const own = [];`) },
  hunchonly: { pass: false, arm: (s) => one(s, "function pubLensHtml(lens){\n  if(!lens) return \"\";", "function pubLensHtml(lens){\n  if(true) return \"\";") },
  spelling: { pass: true, arm: (s) => one(s, OWN, `  const own = sets.filter(b => String(b.scope || "").toLowerCase() === "project");`) },
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d189-ctl-"));
const results = [];
try {
  for (const [name, { pass, arm }] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, D189_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/project-bias: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 110));
    results.push({ name, code, tally, fails, pass });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => r.pass !== (r.code === 0 && r.tally[0] > 0));
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ") : "every arm as declared"}`);
process.exit(bad.length ? 1 : 0);
