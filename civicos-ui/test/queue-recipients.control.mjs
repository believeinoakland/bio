/* D-528 — the negative control for `queue-recipients.test.mjs`. Run: `node civicos-ui/test/queue-recipients.control.mjs [arm]`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits app.html — each arm is ONE splice applied to the
 * EXTRACTED script, written to a temp file and handed to the suite through `D528_APP_SRC` (D-126's
 * `queue-peritem.control.mjs` is the precedent), so there is nothing to restore and the tree is never touched. Each
 * arm armed ALONE; each splice asserted to match exactly once, because an arm that did not arm is a finding.
 *
 * DECLARED BEFORE ARMING:
 *   baseline      — nothing armed. MUST be GREEN.
 *   assigneealone — THE ROW'S CONTROL: `queueAssigneeHtml` reads `assignee` alone again (`recipients` never read).
 *                   MUST FAIL "§1 THE NAMED RECIPIENTS ARE SHOWN" by name, with §1's "NOT TOLD IT IS ADDRESSED TO
 *                   NOBODY" and §2's three. MUST NOT FAIL: the fixtures, §0, §3.
 *   nobodydropped — liar (1): the "not addressed to anybody" sentence is dropped everywhere. MUST FAIL "§3 WITH BOTH
 *                   `assignee` AND `recipients` EMPTY". MUST NOT FAIL: §1, §2.
 *   vieweronly    — liar (2): the viewer printed as the recipient list. MUST FAIL "§1 THE NAMED RECIPIENTS ARE SHOWN"
 *                   and "§2 THE PROJECT RUN". MUST NOT FAIL: §3.
 *   spelling      — OVER-STRICTNESS: the same read spelled differently (`[].concat(...).filter(Boolean)`). MUST PASS.
 *
 * RESULT: recorded in the suite's header and in the D-528 report, from this harness's own printed lines.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./queue-recipients.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const READ = `const named = (it && Array.isArray(it.recipients)) ? it.recipients.filter(m => typeof m === "string" && m) : [];`;
const ARMS = {
  baseline: { pass: true, arm: (s) => s },
  assigneealone: { pass: false, arm: (s) => one(s, READ, `const named = [];`) },
  nobodydropped: { pass: false, arm: (s) => one(s,
    "    return toward || `<div class=\"q-assign\">This is not addressed to anybody.",
    "    return toward; `<div class=\"q-assign\">This is not addressed to anybody.") },
  vieweronly: { pass: false, arm: (s) => one(s,
    "  const names = named.map(m =>", "  const names = [me].map(m =>") },
  spelling: { pass: true, arm: (s) => one(s, READ,
    `const named = [].concat((it && it.recipients) || []).filter(m => typeof m === "string").filter(Boolean);`) },
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d528-ctl-"));
const results = [];
try {
  for (const [name, { pass, arm }] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, D528_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/queue-recipients: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
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
