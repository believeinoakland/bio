/* UI-96 — the negative control for `version-notice-surface.test.mjs`. Run: `node civicos-ui/test/version-notice-surface.control.mjs [arm]`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It never edits app.html — each arm is ONE splice applied to the
 * EXTRACTED script, written to a temp file and handed to the suite through `UI96_APP_SRC`, so there is nothing to
 * restore and the tree is never touched (D-126's driver shape). Each arm armed ALONE; the splice is asserted to have
 * matched exactly once, because an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *   baseline      — nothing armed. MUST be GREEN.
 *   collapse      — THE ROW'S NAMED CONTROL: "not read" collapsed into "unchanged" — a chain the plane could not read
 *                   is drawn as the earned silence. MUST FAIL "NOT READ (the chain): drawn as UNDETERMINED" (and
 *                   "…verbatim, with its reason", since the chain_unread sentence is no longer drawn). MUST NOT FAIL
 *                   any MATCHED, OUTSIDE, SILENCE or NOT READ (the newer capture) arm.
 *   unreadcapture — the same collapse one level down: a newer capture NOBODY HAS READ is drawn as "no newer
 *                   version". MUST FAIL the three "NOT READ (the newer capture)" arms. MUST NOT FAIL the chain arms.
 *   onload        — the leg row asks the plane as it is drawn (telling everyone, the ruling's option not taken).
 *                   MUST FAIL "NOTHING IS ASKED ON LOAD". MUST NOT FAIL section 2's rendering arms.
 *   reworded      — DEC-8: the chain_unread sentence replaced by this surface's own friendlier prose. MUST FAIL
 *                   "the chain_unread sentence is rendered verbatim". MUST NOT FAIL the MATCHED/SILENCE arms.
 *   overstrict    — OVER-STRICTNESS: a label this suite did not anticipate ("whose chains" → "chains read").
 *                   MUST be GREEN.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../../bio-plane/scripts/anchortable.mjs";

const SUITE = new URL("./version-notice-surface.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const GREEN = new Set(["baseline", "overstrict"]);
const ARMS = {
  baseline: (s) => s,
  collapse: (s) => one(s, `  if(n.newer === false)\n`, `  if(n.newer === false || n.newer === null)\n`),
  unreadcapture: (s) => one(s, `  const cands = Array.isArray(n.candidates) ? n.candidates : [];\n`,
    `  const cands = Array.isArray(n.candidates) ? n.candidates : [];\n`
    + `  if(cands.length && cands.every(c => c.reason === "newer_capture_unread")) return \`<div class="card">\${line("answer", (r.states||{}).no_newer_capture)}\${scope}</div>\`;\n`),
  onload: (s) => one(s, `  if(!r || !r.content_id) return "";\n  return \`<div class="subj-how" id="vn-`,
                        `  if(!r || !r.content_id) return "";\n  askVersionNotice(r.content_id, ord);\n  return \`<div class="subj-how" id="vn-`),
  reworded: (s) => one(s, `<div class="subj-grade g-unconf">undetermined</div>\${line("basis", n.says)}`,
                          `<div class="subj-grade g-unconf">undetermined</div>\${line("basis", "We could not check for a newer version right now.")}`),
  overstrict: (s) => one(s, `const scope = line("whose chains", r.visible_to);`, `const scope = line("chains read", r.visible_to);`),
};
function one(s, from, to){
  /* M0-197: read, never armed. The arms patch app.html's extracted script; the anchor is counted in app.html itself. */
  if (ANCHOR_DRY) return (anchorPatch(new URL("../app.html", import.meta.url).pathname, from, to), s);
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 80)}`);
  return s.replace(from, to);
}
anchorEach(ARMS, (arm) => arm(BASE));   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui96-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI96_APP_SRC: file }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    const tally = (/version-notice-surface: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 110));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => GREEN.has(r.name) !== (r.code === 0 && r.tally[1] === 0));
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ") : "every arm as declared (green/red)"}`);
process.exit(bad.length ? 1 : 0);
