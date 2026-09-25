/* D-434 — THE NEGATIVE CONTROL for `recipe-drive.test.mjs`, driven and re-runnable in one step:
 *
 *     node civicos-ui/test/recipe-drive.control.mjs
 *
 * Each arm mutates `civicos-ui/app.html` ALONE (one anchored replacement, asserted to match EXACTLY once — an arm
 * that did not arm is a finding, never a pass), runs the suite against the mutated file, then restores the file from
 * a per-arm pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a minimum byte count so an empty
 * copy cannot "match". The pen is `.ui-d434-harness/` beside this file (the `.ui*-harness/` rule in .gitignore, this
 * being a UI item), removed on a clean run. Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the text
 * its failing lines must NAME; and where it matters, text they must NOT name.
 *
 *   BASELINE  unmutated                                                                    -> GREEN
 *   (A) the last step RESTORED — `op=inquiryground` on the question page, its original words
 *                                                                                          -> RED, naming NO_BASIS
 *   (B) THE LIAR — `op=inquiryground` kept, and its `why` rewritten to MATCH that op in clean member words
 *       (so the words agree with the op and pass the vocabulary check)                     -> RED, naming NO_BASIS,
 *                                                                                    and NO line about vocabulary
 *   (C) THE HALF-FIX — `op=cite`, with the surface left at the question page, which carries no act that puts a
 *       document under the question                                                        -> RED, naming the pair
 *   (D) THE LAST STEP DELETED — every step that remains completes, and nothing reaches the goal
 *                                                                                          -> RED, naming GOAL
 *   (E) OVER-STRICTNESS — cite, THEN group the question's reasons: the split the row itself names as a legitimate
 *       correction                                                                         -> GREEN
 *
 * RESULTS, RUN 2026-09-21 by D-434's worker against app.html a13485ae… (1406515 bytes), every arm restored and
 * verified by sha256 and `cmp`, the file IDENTICAL to pristine at the end — 6/6 AS DECLARED:
 *   BASELINE GREEN 25/25 · (A) RED 19/25 — the fresh question's grouping step REFUSED NO_BASIS in the plane's own
 *   sentence ("… Cite what it rests on first (op=cite)…"), the act also NOT PUBLISHED there, the goal failing on BOTH
 *   questions (on the legged one every step "completed" and the document sat under nothing), and the old words
 *   caught by the vocabulary check · (B) RED 20/25 — the same NO_BASIS and both goal failures, and NO vocabulary line:
 *   the liar's words passed the text check and only the drive caught it · (C) RED 17/23 — NO SUCH PAIR on both
 *   questions, and both goals · (D) RED 18/20 — every remaining step completed and both GOAL lines failed ·
 *   (E) GREEN 30/30 — the plane published and accepted the grouping once the document was cited, on both questions.
 * This file prints them on every run, and its own exit is 0 only when every arm came back AS DECLARED.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..", "app.html");
const SUITE = path.join(HERE, "recipe-drive.test.mjs");
const PEN = path.join(HERE, ".ui-d434-harness");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

/* THE SUBJECT, as it stands after D-434: the one step the arms rewrite. */
const STEP = `      { surface: "bundle", op: "cite",
        why: "Put the captured document under the question: on the document's own page, cite it into the question and say whether it supports the answer or cuts against it. The member performs the act; this step navigates to it." },`;
const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) the last step restored to the question page's grouping act, original words", declared: "RED",
    names: "REFUSED NO_BASIS",
    from: STEP,
    to: `      { surface: "inquiry", op: "inquiryground",
        why: "Ground the question on the captured document. The member performs the act; this step navigates to it." },` },
  { name: "(B) the liar: the grouping act kept, its words rewritten to match it", declared: "RED",
    names: "REFUSED NO_BASIS", mustNotName: "analyst vocabulary",
    from: STEP,
    to: `      { surface: "inquiry", op: "inquiryground",
        why: "Say which of the question's reasons carry its answer on their own, with the captured document among them. The member performs the act; this step navigates to it." },` },
  { name: "(C) the half-fix: op=cite with the surface left at the question page", declared: "RED",
    names: "NO SUCH PAIR",
    from: STEP,
    to: STEP.replace(`surface: "bundle", op: "cite"`, `surface: "inquiry", op: "cite"`) },
  { name: "(D) the last step deleted: every remaining step completes, and the goal is never reached", declared: "RED",
    names: "GOAL",
    from: STEP,
    to: "" },
  { name: "(E) over-strictness: cite, then group the question's reasons", declared: "GREEN",
    from: STEP,
    to: STEP + `
      { surface: "inquiry", op: "inquiryground",
        why: "Then say which of the question's reasons carry its answer on their own. The member performs the act; this step navigates to it." },` },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => (a.from ? { arm: a.name.split(" ")[0], file: APP, find: a.from, put: a.to } : { arm: a.name.split(" ")[0], none: "nothing armed" })));

fs.mkdirSync(PEN, { recursive: true });
const origSha = sha(APP);
const origBytes = fs.statSync(APP).size;
if(origBytes < 100000) throw new Error(`app.html is ${origBytes} bytes — too small to be the subject`);
console.log(`app.html pristine sha256 ${origSha} (${origBytes} bytes)`);
const rows = [];
let allAsDeclared = true;
try{
  for(const [i, arm] of ARMS.entries()){
    const pristine = path.join(PEN, `app.pristine.arm${i}.html`);
    fs.copyFileSync(APP, pristine);
    if(sha(pristine) !== origSha || fs.statSync(pristine).size !== origBytes)
      throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    if(arm.from){
      const src = fs.readFileSync(APP, "utf8");
      const hits = src.split(arm.from).length - 1;
      if(hits !== 1){ armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s)`); }
      else fs.writeFileSync(APP, src.replace(arm.from, () => arm.to));
      if(armed && sha(APP) === origSha){ armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — the file is unchanged`); }
    }
    const r = spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = [...new Set(out.split("\n").filter(l => /^\s*FAIL /.test(l)).map(l => l.trim()))];
    const tally = (/recipe-drive: (\d+)\/(\d+) assertions passed/.exec(out) || []).slice(1).join("/") || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? failLines.some(l => l.includes(arm.names)) : null;
    const clean = arm.mustNotName ? !failLines.some(l => l.includes(arm.mustNotName)) : null;
    const asDeclared = armed && tally !== "-1" && got === arm.declared && named !== false && clean !== false;
    if(!asDeclared) allAsDeclared = false;
    /* RESTORE, then verify by hash AND by content. */
    fs.copyFileSync(pristine, APP);
    const restoredSha = sha(APP);
    let cmpOk = false;
    try{ execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; }catch(_){ cmpOk = false; }
    if(restoredSha !== origSha || !cmpOk || fs.statSync(APP).size !== origBytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${restoredSha}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, exit: r.status, named, clean, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, passed ${tally})${arm.names ? ` · names "${arm.names}": ${named}` : ""}`
      + `${arm.mustNotName ? ` · names nothing about "${arm.mustNotName}": ${clean}` : ""}`
      + ` · restored ${restoredSha.slice(0, 12)} cmp ok`);
    for(const l of failLines) console.log("      " + l.slice(0, 260));
  }
}finally{
  if(sha(APP) !== origSha){
    const p0 = path.join(PEN, "app.pristine.arm0.html");
    if(fs.existsSync(p0)) fs.copyFileSync(p0, APP);
  }
  const final = sha(APP);
  console.log(`app.html final sha256 ${final} — ${final === origSha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
  if(final === origSha) fs.rmSync(PEN, { recursive: true, force: true });
}
console.log(`\nrecipe-drive.control: ${rows.filter(r => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
