/* UI-76 — the negative control for `themes.test.mjs`.
 *
 * Every arm is armed ALONE on the EXTRACTED script (`extract.mjs`' `appScript()`), handed to the suite
 * through `UI76_APP_SRC`; `app.html` is never edited, so there is nothing to restore — the control cannot
 * leave the tree dirty. Each splice is asserted to match EXACTLY ONCE (an arm that did not arm is a
 * finding, and throws). Declared before arming, and checked: `baseline` and `spelling` MUST exit 0; every
 * other arm MUST exit 1, failing at the named assertions:
 *
 *   baseline   nothing armed.
 *   membership THE ROW'S LIAR — a proposal rendered as membership: the hunches are written through the
 *              member card into the members section. MUST FAIL "THE HUNCH ARM" by name.
 *   nolabel    the hunch label dropped from the hunch card, which stays in its own section. MUST FAIL
 *              "THE HUNCH ARM: ... carrying the hunch label" and the label count.
 *   cover      THE ROW'S NEGATIVE CONTROL — hide the declarer ("the cover", as the row was written before
 *              BOB #32's ruling made it the handle): every theme's declarer rendered as a bare "a member".
 *              MUST FAIL every "THE COVER ARM" assertion, member and administrator, list and page.
 *   prefill    the declare form's test prefilled. MUST FAIL "NOTHING IS PREFILLED" and the wire arm.
 *   ownwords   refusals rendered from the plane's `detail` rather than its canned translation. MUST FAIL §7.
 *   spelling   THE OVER-STRICTNESS ARM — correct work in a spelling the suite did not anticipate: the
 *              declarer sentence reworded and reordered ("This is <handle>'s lens, declared <at>"). MUST PASS.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./themes.test.mjs", import.meta.url).pathname;
const BASE = appScript();

const MEMBERS_MAP = `(members.length ? members.map(thmMemberHtml).join("") : '<div class="empty">Nothing you can see has been placed in this theme.</div>')`;
const HUNCHES_MAP = `(hunches.length ? hunches.map(thmHunchHtml).join("") : '<div class="empty">Nothing you can see is proposed for this theme.</div>')`;
const LABEL_LINE = `    + '<p class="subj-note" data-thm-hunch-label>' + esc(THM_HUNCH_LABEL) + '</p>'\n`;
const LIST_WHO = `'<p class="subj-note" data-thm-declarer>Declared by ' + thmWhoHtml(t, "declared_by") + ' at <span class="mono">' + esc(t.at) + '</span>.</p>'`;
const PAGE_WHO = `'<p class="subj-note" data-thm-declarer>Declared by ' + thmWhoHtml(T, "declared_by") + ' at <span class="mono">' + esc(T.at) + '</span>.</p>'`;
const FORM_INIT = `form:{ name:"", test:"" }`;
const REFUSAL_WORDS = `data-thm-refusal><div class="intent-ref-why">'\n    + esc(refusalWords(r) || "The record refused this and said nothing further.")`;

const ARMS = {
  baseline: (s) => s,
  membership: (s) => one(one(s, MEMBERS_MAP,
      `(members.concat(hunches).length ? members.concat(hunches).map(thmMemberHtml).join("") : '<div class="empty">Nothing you can see has been placed in this theme.</div>')`),
    HUNCHES_MAP, `'<div class="empty">Nothing you can see is proposed for this theme.</div>'`),
  nolabel: (s) => one(s, LABEL_LINE, ""),
  cover: (s) => one(one(s, LIST_WHO, `'<p class="subj-note" data-thm-declarer>Declared by a member at <span class="mono">' + esc(t.at) + '</span>.</p>'`),
    PAGE_WHO, `'<p class="subj-note" data-thm-declarer>Declared by a member at <span class="mono">' + esc(T.at) + '</span>.</p>'`),
  prefill: (s) => one(s, FORM_INIT, `form:{ name:"", test:"The document mentions this idea." }`),
  ownwords: (s) => one(s, REFUSAL_WORDS, `data-thm-refusal><div class="intent-ref-why">'\n    + esc((r && r.detail) || "The record refused this.")`),
  spelling: (s) => one(one(s, LIST_WHO, `"<p class='subj-note' data-thm-declarer>This is " + thmWhoHtml(t, "declared_by") + "'s lens, declared <time>" + esc(t.at) + "</time>.</p>"`),
    PAGE_WHO, `"<p class='subj-note' data-thm-declarer>This is " + thmWhoHtml(T, "declared_by") + "'s lens, declared <time>" + esc(T.at) + "</time>.</p>"`),
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 90)}`);
  return s.replace(from, to);
}
const DECLARED_GREEN = new Set(["baseline", "spelling"]);

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui76-themes-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI76_APP_SRC: file },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? -1; }
    /* A missing tally is -1, never 0: a suite that died before its foot counted nothing. */
    const tally = (/themes: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 140));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => DECLARED_GREEN.has(r.name) !== (r.code === 0) || r.tally[0] < 0);
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length
  ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ")
  : "every arm as declared"}`);
process.exit(bad.length ? 1 : 0);
