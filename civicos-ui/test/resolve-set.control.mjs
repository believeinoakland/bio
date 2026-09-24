/* D-291 — the negative control for `resolve-set.test.mjs`. Run: `node civicos-ui/test/resolve-set.control.mjs`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits app.html — each arm is ONE splice applied to the
 * EXTRACTED script, written to a temp file and handed to the suite through `D291_APP_SRC`, so there is nothing to
 * restore and the tree is never touched (D-126's `queue-peritem.control.mjs` is the precedent). Each arm armed ALONE;
 * the splice is asserted to have matched exactly once, because an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *   baseline   — nothing armed. MUST be GREEN. It is what tells three working arms from three broken ones.
 *   loop       — THE ROW'S OWN CONTROL: the bulk control becomes a CLIENT-SIDE LOOP, one single-document
 *                `op=resolve` per ticked document, its answers stitched into the set's shape so everything
 *                downstream reads exactly as before. MUST FAIL, BY NAME: "ONE call for the whole selection…" and
 *                "still ONE call for a mixed selection" (and "each item names only its own document", which reads
 *                the one set call there no longer is). MUST NOT FAIL: the READ BACK (the loop still resolves every
 *                document — that is why only the wire can see it), the single path, and section 3.
 *   silentdrop — a document the record refused is NOT kept: the retained branch forgets it. MUST FAIL "KEPT: …"
 *                and "with the RECORD's reason …". MUST NOT FAIL: section 1 and section 3.
 *   unpublished — the tick is drawn whether or not the plane publishes `resolve` in `set_acts`. MUST FAIL section
 *                3's "NO tick" and "no selection bar"? — only the tick; the bar is drawn from the selection, which
 *                section 3 does not make, so "there is no selection bar" MUST NOT FAIL. Sections 1 and 2 green.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./resolve-set.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const ARMS = {
  baseline: (s) => s,
  loop: (s) => one(s,
    `    const a = await intentAsk("resolve", { items: shas.map(captureSha => ({ captureSha })) });
    const r = a.accepted ? a.result : a.refusal;`,
    `    const parts = []; for(const captureSha of shas){ const x = await intentAsk("resolve", { captureSha }); parts.push(x.accepted ? x.result : x.refusal); }
    const r = { items: parts.map((p, index) => ({ index, outcome: p && p.ok === true ? "applied" : "retained", ...p })) };`),
  silentdrop: (s) => one(s,
    `        RES_RETAINED.set(sha, (words || "") + extra);`,
    `        RES_SEL.delete(sha); void words; void extra;`),
  unpublished: (s) => one(s,
    `  return acts.find(a => a && a.id === "resolve" && a.weight === "per-item") || null;`,
    `  return acts.find(a => a && a.id === "resolve" && a.weight === "per-item") || { id: "resolve", weight: "per-item", label: "Resolve the selected documents' references" };`),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d291-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, D291_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/resolve-set: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
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
