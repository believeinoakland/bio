/* UI-91 — the negative control for `onpoint-choice.test.mjs`.
 *
 * Each arm is armed ALONE on the EXTRACTED app script (`app.html` is never edited, so there is nothing
 * to restore), each splice asserted to match EXACTLY ONCE, and each arm DECLARES before it runs which
 * assertions MUST fail — by their names — and that every other must stay green. An arm whose failures
 * differ from its declaration in either direction is reported NOT AS DECLARED.
 *
 *   inplace   THE ROW'S CONTROL: render the member's choice IN PLACE of the machine's pair.
 *   says      render the plane's "which nobody has chosen" sentence beside a current choice (D-575).
 *   tokenctl  offer the choice to any credential, a bearer token included.
 *   spelling  THE OVER-STRICTNESS ARM: the same facts in different page wording — must PASS.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";

const SUITE = new URL("./onpoint-choice.test.mjs", import.meta.url).pathname;
const BASE = appScript();

const RET = '  return `<div class="conn-pair">${machine}${choiceLine(mine, "on this document")}';
const SAYS = '${sel && sel.says && !mine && !theirs ? ` ${esc(sel.says)}.` : ""}';
const CAN = '  return !!(PLANE.session && PLANE.me && PLANE.me.session\n            && (PLANE.me.capabilities||[]).includes("contribute"));\n}\nfunction docConnPairPlace';
const M_LABEL = 'data-pair="machine">The machine&rsquo;s pair${sel && sel.method';
const C_LABEL = 'data-pair="member">On point ${where}, as a member chose: ';

const ARMS = {
  baseline: { arm: (s) => s, fails: [] },
  inplace: { arm: (s) => one(s, RET, '  return `<div class="conn-pair">${mine ? "" : machine}${choiceLine(mine, "on this document")}'),
    fails: ["NEVER REPLACING: after the choice the MACHINE's line still names the machine's mention, and only it",
            "NEVER REPLACING: BESIDE — both lines render in the same connection, the machine's first",
            "...and the machine's pair still renders before it"] },
  says: { arm: (s) => one(s, SAYS, '${sel && sel.says ? ` ${esc(sel.says)}.` : ""}'),
    fails: ["D-575: the plane's 'which nobody has chosen' sentence is WITHHELD beside a current choice, never re-worded"] },
  tokenctl: { arm: (s) => one(s, CAN, '  return true;\n}\nfunction docConnPairPlace'),
    fails: ["A BEARER TOKEN is offered NO choice over the same answer (the act is a signed-in member's, C-74.1)"] },
  spelling: { arm: (s) => one(one(s, M_LABEL, 'data-pair="machine">Selected by the machine${sel && sel.method'),
                              C_LABEL, 'data-pair="member">The member&rsquo;s on-point mention ${where}: '),
    fails: [] },
};
function one(s, from, to){
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} times: ${from.slice(0, 90)}`);
  return s.replace(from, to);
}

const only = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui91-onpoint-ctl-"));
const results = [];
try {
  for (const [name, { arm, fails: declared }] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI91_APP_SRC: file },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status ?? -1; }
    const tally = (/onpoint-choice: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const failed = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].trim());
    const asDeclared = tally[0] >= 0 && failed.length === declared.length && declared.every((d) => failed.includes(d));
    results.push({ name, code, tally, failed, asDeclared });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
    for (const f of failed) console.log(`    FAIL ${f.slice(0, 140)}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const bad = results.filter((r) => !r.asDeclared);
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length
  ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ")
  : "every arm as declared"}`);
process.exit(bad.length ? 1 : 0);
