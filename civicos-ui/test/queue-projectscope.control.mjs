/* UI-110 — the negative control for `queue-projectscope.test.mjs`. Run: `node civicos-ui/test/queue-projectscope.control.mjs`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits app.html — each arm is ONE splice applied to the
 * EXTRACTED script, written to a temp file and handed to the suite through `UI110_APP_SRC`, so the tree is never
 * touched; app.html's sha256 is read before and after the run and the run fails if it moved. Each arm armed ALONE;
 * each splice is asserted to have matched exactly once, because an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *   baseline    — nothing armed. MUST be GREEN.
 *   nullscope   — THE ROW'S CONTROL: `queueSetOpsFor` answers nothing again for an item whose `disposition.scope` is
 *                 `project` (the line UI-110 removed, restored verbatim). MUST FAIL §1's "a PROJECT-SCOPED finding
 *                 carries a tick that FEEDS THE SET" BY NAME, and with it every arm that needs the item in a set
 *                 (§2's picker/count arms, §3, §4, §5). MUST NOT FAIL: §0, §6.
 *   preselect   — THE NO-DEFAULT ARM: `queueHomeFor` answers the item's FIRST home when the member has named none — a
 *                 defaulted case. MUST FAIL §2's "THE TWO-HOME FINDING IS NOT SENT until the member names one" BY
 *                 NAME (and §2's count and read-back arms, since the item is sent and decided). MUST NOT FAIL: §1, §6.
 *   pickdefault — THE NO-DEFAULT ARM, on the picker alone: the picker draws its first case `selected` while nothing is
 *                 chosen, though nothing is sent. MUST FAIL "the picker marks NO case chosen" BY NAME, and nothing
 *                 on the wire. MUST NOT FAIL: §2's "NOT SENT" arm, §3, §4.
 *   keyshape    — a project-scoped item is sent in the SHARED-RECORD shape (`key`), as though scope did not matter.
 *                 MUST FAIL §3's "CARRIES ITS PROJECT" and its read-back (the plane refuses the key shape).
 *                 MUST NOT FAIL: §1, §2.
 *   spelling    — OVER-STRICTNESS: the (project, finding) item is assembled in another key order and by another
 *                 construction. Correct work, differently spelled. MUST BE GREEN.
 *
 * AMENDED 2026-09-25 by the UI-110 worker FROM THE FIRST RUN'S PRINTED RESULT, not from a prediction — three arms
 * reached further than declared, and each reach is a cascade through the fixture's order, stated rather than smoothed:
 *   nullscope   did NOT fail §5, which was declared. §5 selects the item and then FORCES its scope to `instance`
 *               before the act, so the restored line (which reads `scope === "project"`) no longer excludes it. §5
 *               is a unit arm about the refusal's words, not about selectability, so the declaration was wrong.
 *   preselect   ALSO fails "the picker marks NO case chosen" (a defaulted home IS a chosen one, so the picker shows
 *               it) and §3's two arms (the item was already decided under the default in §2, so the member's own
 *               pick finds it gone from the act).
 *   keyshape    ALSO fails §4's three arms: refused in §3, the item never lost home A, so it still has two homes in
 *               §4 and draws a picker rather than naming one case.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./queue-projectscope.test.mjs", import.meta.url).pathname;
const APP_HTML = new URL("../app.html", import.meta.url).pathname;
const hashOf = () => createHash("sha256").update(fs.readFileSync(APP_HTML)).digest("hex");
const HASH_BEFORE = hashOf();
const BASE = appScript();
const ARMS = {
  baseline: (s) => s,
  nullscope: (s) => one(s,
    `    if(d && d.scope === "project" && !queueFindingHomes(it).length) return [];`,
    `    if(d && d.available === true && d.scope === "project") return [];`),
  preselect: (s) => one(s,
    `  return (picked && homes.includes(picked)) ? picked : null;`,
    `  return (picked && homes.includes(picked)) ? picked : homes[0];`),
  pickdefault: (s) => one(s,
    `\${picked === p ? " selected" : ""}`,
    `\${(picked ? picked === p : p === homes[0]) ? " selected" : ""}`),
  keyshape: (s) => one(s,
    `      if(queueIsProjectScoped(it))\n        return { project: queueHomeFor(it),`,
    `      if(false)\n        return { project: queueHomeFor(it),`),
  spelling: (s) => one(s,
    `        return { project: queueHomeFor(it), finding: (it.disposition && it.disposition.finding) || String(it.id) };`,
    `        return Object.assign({}, { finding: (it.disposition && it.disposition.finding) || String(it.id) }, { project: queueHomeFor(it) });`),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui110-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI110_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/queue-projectscope: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 110));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const HASH_AFTER = hashOf();
console.log(`\napp.html sha256 before ${HASH_BEFORE} · after ${HASH_AFTER} · ${fs.statSync(APP_HTML).size} bytes`);
const GREEN = new Set(["baseline", "spelling"]);
/* A tally of -1 is a suite that never reached its foot: never a pass, whatever the exit. */
const bad = results.filter((r) => GREEN.has(r.name) !== (r.code === 0) || r.tally[0] < 0);
const moved = HASH_BEFORE !== HASH_AFTER;
console.log(`control: ${results.length} arm(s) run; ${bad.length ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ") : "every arm as declared"}${moved ? " · APP.HTML MOVED" : ""}`);
process.exit(bad.length || moved ? 1 : 0);
