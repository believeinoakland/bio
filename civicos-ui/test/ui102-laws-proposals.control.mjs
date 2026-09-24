/* UI-102 — the negative control for `ui102-laws-proposals.test.mjs`.
 * Run: `node civicos-ui/test/ui102-laws-proposals.control.mjs [arm]`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It NEVER edits `app.html` — each arm is ONE splice
 * applied to the EXTRACTED script, written to a temp file OUTSIDE the worktree and handed to the suite
 * through `UI102_APP_SRC`, so there is nothing to restore and the tree is never touched (D-291's
 * `resolve-set.control.mjs` is the precedent, and D-126's before it). Each arm is armed ALONE, and the
 * splice is asserted to have matched EXACTLY ONCE: an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING — what MUST fail, and what MUST NOT:
 *
 *   baseline    — nothing armed. MUST be GREEN, 38/0. It is what tells four working arms from four
 *                 broken ones.
 *
 *   usethis     — THE ROW'S OWN CONTROL: *add a "use this" control and the no-setter arm fails by name.*
 *                 Each proposal card gains a button that opens the governing-laws act carrying the
 *                 proposal's own citations. MUST FAIL, BY NAME: §3's "the proposals block carries NO
 *                 CONTROL of any kind" and "...names no function a control could call", for the two
 *                 shapes that HAVE a proposal — "(a stated list and two proposals)" and "(an
 *                 undetermined list and one proposal)". MUST NOT FAIL: the same two arms for "(no
 *                 proposals)", because the empty block returns before the card loop and gains no
 *                 button — that pair is deliberately blind to this break and is kept beside the pair
 *                 that catches it. MUST NOT FAIL either: §1 and §2 (the block still renders the
 *                 plane's sentences), the two WIRE arms (no browser clicks the button here), or §3's
 *                 "THE ACT OPENS EMPTY" — which is precisely why the markup sweep is the instrument
 *                 for this property and the behavioural arm cannot be.
 *
 *   pageauthored — a SURFACE-AUTHORED EMPTY-SET SENTENCE, UI-90 arm (c) one key over: the plane's
 *                 `says` for an empty set is replaced with "No governing laws have been proposed for
 *                 this action." — a sentence that is not even false, which is the point. MUST FAIL:
 *                 §2's "renders the PLANE's statement about the empty set, verbatim" and "...never a
 *                 bare empty list or a sentence of the page's own about it". MUST NOT FAIL: §1 and §3.
 *
 *   compose     — THE TWO KEYS COMPOSED, the defect the design names as unsupportable: when the list
 *                 is not stated, `actionLawsHtml` renders the first PROPOSAL's citations in place of
 *                 the plane's undetermined sentence. MUST FAIL: §2's "THE SHARP CASE …", "...the
 *                 proposal renders beside it, and does not stand in for the list" and "...the
 *                 undetermined sentence is UNCHANGED". MUST NOT FAIL: §1 (that action's list IS
 *                 stated, so the arm cannot reach it) or §3.
 *
 *   spelling    — THE OVER-STRICTNESS ARM: a CORRECT block in a spelling this file did not anticipate
 *                 — single-quoted attributes, different class names, the block's own sentence FIRST,
 *                 the citation before the level, the date unsliced into a `<time>` element. MUST FAIL
 *                 NOTHING. Any failure here is this file's fault and not the page's, and is reported
 *                 as a finding about the matchers.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./ui102-laws-proposals.test.mjs", import.meta.url).pathname;
const BASE = appScript();

const CARD_FOOT = '      <div class="act-clock-why">${esc(String(pr.says||""))}</div>';
const EMPTY_SET = '  if(!rows.length) return `<div class="empty">${esc(String(p.says || ""))}</div>`;';
const UNDET_LIST = '  if(gl.state !== "stated" || !laws.length)\n'
  + '    return `<div class="empty">${esc(String(gl.stated || ""))}</div>`;';
const BLOCK_RETURN = '  return `${rows.map(pr=>`<div class="card act-law-prop">\n'
  + '      <div class="act-cp-who">${esc(String(pr.by||""))}${\n'
  + '        pr.at?` &middot; <span class="mono">${esc(String(pr.at).slice(0,10))}</span>`:""}</div>\n'
  + '      ${(Array.isArray(pr.laws)?pr.laws:[]).map(l=>`<div class="act-law">\n'
  + '        <div class="act-law-cite"><span class="mono">${esc(l.level||"")}</span> &middot; ${esc(l.citation||"")}</div>\n'
  + '      </div>`).join("")}\n'
  + CARD_FOOT + '\n'
  + '    </div>`).join("")}\n'
  + '    <div class="ln">${esc(String(p.says||""))}</div>${\n'
  + '    p.truncated?`<div class="ln">The record answered with the most recent ${esc(String(p.limit??rows.length))} of them.</div>`:""}`;';

const ARMS = {
  baseline: (s) => s,
  /* THE ROW'S ARM. The button is the whole defect: it carries a machine's citations into the act that
     is supposed to be a member's own authored statement of the law. */
  usethis: (s) => one(s, CARD_FOOT,
    CARD_FOOT + '\n      <button class="btn ghost" onclick="openActionLaws(ACTION.id, ACTION.title, '
    + '{id:\'actionlaws\',label:\'State governing laws\',prompt:null})">Use this proposal</button>'),
  pageauthored: (s) => one(s, EMPTY_SET,
    '  if(!rows.length) return `<div class="empty">No governing laws have been proposed for this action.</div>`;'),
  compose: (s) => one(s, UNDET_LIST,
    '  if(gl.state !== "stated" || !laws.length){\n'
    + '    const prop = ((der && der.governing_laws_proposals && der.governing_laws_proposals.proposals) || [])[0];\n'
    + '    const pl = (prop && Array.isArray(prop.laws)) ? prop.laws : [];\n'
    + '    if(pl.length) return `${pl.map(l=>`<div class="act-law">\n'
    + '      <div class="act-law-cite"><span class="mono">${esc(l.level||"")}</span> &middot; ${esc(l.citation||"")}</div>\n'
    + '    </div>`).join("")}`;\n'
    + '    return `<div class="empty">${esc(String(gl.stated || ""))}</div>`;\n'
    + '  }'),
  /* CORRECT WORK IN A SPELLING THIS FILE DID NOT ANTICIPATE. Same facts, same provenance, no control. */
  spelling: (s) => one(s, BLOCK_RETURN,
    "  return `<div class='ln'>${esc(String(p.says||\"\"))}</div>${rows.map(pr=>`<section class='prop-card'>\n"
    + "      <p class='prop-who'>${esc(String(pr.by||\"\"))}${pr.at?` &middot; <time class='mono'>${esc(String(pr.at).slice(0,10))}</time>`:\"\"}</p>\n"
    + "      ${(Array.isArray(pr.laws)?pr.laws:[]).map(l=>`<p class='prop-cite'>${esc(l.citation||\"\")} <span class='mono'>(${esc(l.level||\"\")})</span></p>`).join(\"\")}\n"
    + "      <p class='prop-says'>${esc(String(pr.says||\"\"))}</p>\n"
    + "    </section>`).join(\"\")}${p.truncated?`<p class='ln'>Only the most recent ${esc(String(p.limit??rows.length))} are shown.</p>`:\"\"}`;"),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 90)}`);
  return s.replace(from, to);
}
const DECLARED_GREEN = new Set(["baseline", "spelling"]);

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui102-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI102_APP_SRC: file },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? -1; }
    const tally = (/ui102-laws-proposals: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
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
