/* D-126 — the negative control for `queue-peritem.test.mjs`. Run: `node civicos-ui/test/queue-peritem.control.mjs`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits app.html — each arm is ONE splice applied to the
 * EXTRACTED script, written to a temp file and handed to the suite through `D126_APP_SRC`, so there is nothing to
 * restore and the tree is never touched. Each arm armed ALONE; the splice is asserted to have matched exactly once,
 * because an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *   baseline    — nothing armed. MUST be GREEN. It is what tells three working arms from three broken ones.
 *   allornone   — the surface relabels all-or-nothing: when ANY outcome is retained, every selected item is kept
 *                 and none is cleared from the selection. MUST FAIL "CLEARED: the two applied obligations have left
 *                 the list"? NO — the plane still applied them, so the feed drops them; what must fail is "KEPT:
 *                 exactly the drifted one" (three kept, not one). MUST NOT FAIL: section 3.
 *   silentdrop  — `queueRetainedGoneHtml` renders nothing: a retained item the feed no longer carries vanishes.
 *                 MUST FAIL "KEPT: …" and "with the RECORD's reason …". MUST NOT FAIL: section 2 (those retained
 *                 items are still in the feed) and section 3.
 *   ncalls      — the bulk control loops ONE single-key call per item (the forty-dialogs shape in a bulk control's
 *                 clothes). MUST FAIL "ONE call for the whole selection". MUST NOT FAIL: section 3.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./queue-peritem.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const ARMS = {
  baseline: (s) => s,
  allornone: (s) => {
    const a = `      if(o.outcome === "applied"){ QUEUE_SEL.delete(id); QUEUE_RETAINED.delete(id); }`;
    return one(s, a, `      if(o.outcome === "applied" && outs.every(x => x.outcome === "applied")){ QUEUE_SEL.delete(id); QUEUE_RETAINED.delete(id); }`);
  },
  silentdrop: (s) => one(s, `function queueRetainedGoneHtml(){`, `function queueRetainedGoneHtml(){ return "";`),
  ncalls: (s) => one(s,
    `    const res = await recPostR(op, { ...(shared || {}), items });`,
    `    const parts = []; for(const it of items) parts.push(await recPostR(op, { ...(shared || {}), ...it }));
    const res = { items: parts.map((p, index) => ({ index, outcome: p && p.ok === true ? "applied" : "retained", ...p })) };`),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d126-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, D126_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/queue-peritem: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 110));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const base = results.find((r) => r.name === "baseline");
const bad = results.filter((r) => (r.name === "baseline") !== (r.code === 0));
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ") : "every arm as declared"}${base ? "" : " (no baseline in this run)"}`);
process.exit(bad.length ? 1 : 0);
