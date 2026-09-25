/* UI-104 — the negative control for `ui104-risk-tier.test.mjs`.
 * Run: `node civicos-ui/test/ui104-risk-tier.control.mjs [arm]`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It NEVER edits `app.html` — each arm is ONE splice applied
 * to the EXTRACTED script, written to a temp file OUTSIDE the worktree and handed to the suite through
 * `UI104_APP_SRC` (UI-102's control is the precedent), so nothing is restored and the tree is never touched.
 * Each arm is armed ALONE and its splice asserted to match EXACTLY ONCE: an arm that did not arm is a finding.
 *
 * DECLARED BEFORE ARMING — what MUST fail, and what MUST NOT:
 *
 *   baseline    — nothing armed. MUST be GREEN.
 *
 *   noreason    — THE ROW'S OWN CONTROL: *submit without a reason and the required-reason arm fails by name.*
 *                 `actionTierReady` stops asking for the reason. MUST FAIL, BY NAME: §2's "REQUIRED REASON: a
 *                 tier chosen and NO reason …", "…a whitespace-only reason …" and "…the act CANNOT SUBMIT
 *                 without a reason …". MUST NOT FAIL: "…the record is unmoved" (the PLANE refuses the empty
 *                 reason — the page's fence is what is under test, not the plane's), §1, §3–§6.
 *
 *   preselect   — the form opens with the action's CURRENT tier checked. MUST FAIL: "NOTHING IS PRESELECTED …"
 *                 and "reopening the form preselects NOTHING …". MUST NOT FAIL: the REQUIRED REASON arms.
 *
 *   undetoffered — the options are every key of the published map, `undetermined` included. MUST FAIL: "the
 *                 options are the plane's settable tiers …" and "…`undetermined` is NOT offered …".
 *
 *   pagewords   — a refusal rendered in the PAGE's own sentence instead of `actRefusalHtml`. MUST FAIL: §3's
 *                 "…the canned translation VERBATIM" and §5's "…the plane's translation verbatim".
 *
 *   spelling    — THE OVER-STRICTNESS ARM: a CORRECT history in a spelling this file did not anticipate —
 *                 single-quoted attributes, new class names, lower-case "revised from", the author before the
 *                 change and the date in a `<time>` element. MUST FAIL NOTHING.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./ui104-risk-tier.test.mjs", import.meta.url).pathname;
const BASE = appScript();

const READY = '  return !!(T && T.tier && T.legal.includes(T.tier) && T.reason.trim());';
const OPEN_STATE = '  ACTION.tier = { id, title, act, legal:[], words:null, tier:"", reason:"", probed:false,';
const LEGAL = '    ? r.legal.map(String).filter(k => T.words && Object.prototype.hasOwnProperty.call(T.words, k)) : [];';
const REFUSAL = '    ${T.refusal ? actRefusalHtml(T.refusal) : ""}';
const REV_ROW = '    ${revs.map(r=> r && r.readable === true ? `<div class="act-law act-tier-rev">\n'
  + '      <div class="act-law-cite">Revised from ${esc(String(r.prior_words||""))} to ${esc(String(r.tier_words||""))}: ${esc(String(r.reason||""))}</div>\n'
  + '      <div class="ln">By ${esc(String(r.by||""))}${r.at?` &middot; <span class="mono">${esc(String(r.at).slice(0,10))}</span>`:""}</div>\n'
  + '    </div>`';

const ARMS = {
  baseline: (s) => s,
  noreason: (s) => one(s, READY, '  return !!(T && T.tier && T.legal.includes(T.tier));'),
  preselect: (s) => one(s, OPEN_STATE,
    '  ACTION.tier = { id, title, act, legal:[], words:null, tier:String((ACTION.der||{}).risk_tier||""), reason:"", probed:false,'),
  undetoffered: (s) => one(s, LEGAL, '    ? Object.keys(T.words || {}) : [];'),
  pagewords: (s) => one(s, REFUSAL,
    '    ${T.refusal ? `<div class="intent-ref"><div class="intent-ref-why">This change could not be made.</div></div>` : ""}'),
  spelling: (s) => one(s, REV_ROW,
    "    ${revs.map(r=> r && r.readable === true ? `<section class='tier-change'>\n"
    + "      <p class='tier-who'>${esc(String(r.by||\"\"))}${r.at?` <time class='mono'>${esc(String(r.at))}</time>`:\"\"}</p>\n"
    + "      <p class='tier-what'>revised from ${esc(String(r.prior_words||\"\"))} to ${esc(String(r.tier_words||\"\"))}: ${esc(String(r.reason||\"\"))}</p>\n"
    + "    </section>`"),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 90)}`);
  return s.replace(from, to);
}
const DECLARED_GREEN = new Set(["baseline", "spelling"]);

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui104-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI104_APP_SRC: file },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? -1; }
    const tally = (/ui104-risk-tier: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 120));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => DECLARED_GREEN.has(r.name) !== (r.code === 0));
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length
  ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ")
  : "every arm as declared"}`);
process.exit(bad.length ? 1 : 0);
