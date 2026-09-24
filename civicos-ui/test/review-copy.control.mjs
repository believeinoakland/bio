/* UI-68 — THE NEGATIVE CONTROL for `review-copy.test.mjs`, re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/review-copy.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not
 * discover it. Each arm mutates app.html ALONE (every anchored replacement asserted to match EXACTLY once — an arm
 * that did not arm is a finding, never a pass), runs the suite, then restores app.html from a per-arm pristine copy
 * and verifies the restore by sha256 AND by `cmp`, guarding the byte count. Declared BEFORE arming, per arm: RED or
 * GREEN; for a RED arm the text its failing lines MUST name, and the ones that MUST NOT fail (it broke one thing):
 *
 *   BASELINE                                                                        -> GREEN
 *   (A) THE ROW'S OWN — a download link added to the copy                           -> RED, naming "NO EXPORT";
 *       MUST NOT fail "MARKING" or "A REVOKED SECRET READS NOTHING"
 *   (B) a print hook registered by the surface                                      -> RED, naming "NO EXPORT";
 *       MUST NOT fail "MARKING"
 *   (C) THE DEAD LINK SAYS WHY — "this access was revoked" on every dead page       -> RED, naming "NEUTRAL";
 *       MUST NOT fail "ONE ANSWER" (every cause still draws the same bytes, which is why NEUTRAL exists)
 *   (D) the marking dropped from the copy                                           -> RED, naming "MARKING";
 *       MUST NOT fail "NO EXPORT"
 *   (E) the new-draft form prefilled with a scope                                   -> RED, naming "NOTHING PREFILLED";
 *       MUST NOT fail "DRAFT: saving sent op=casedraft"
 *   (F) a recipient's comment labelled as a member's                                -> RED, naming "LABELLED";
 *       MUST NOT fail "THE RECORD: the plane holds the comment as a RECIPIENT's"
 *   (G) OVER-STRICTNESS — the page's own headings and the grant note re-worded      -> GREEN
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");
const APP = path.join(REPO, "civicos-ui", "app.html");
const SUITE = path.join(HERE, "review-copy.test.mjs");
const SCRATCH = path.join(REPO, ".ui68-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) a download link on the copy", declared: "RED", names: ["NO EXPORT"],
    mustNotFail: ["MARKING", "A REVOKED SECRET READS NOTHING"],
    edits: [["    + '<p class=\"subj-note\" data-rvc-signature>'",
             "    + '<a href=\"#\" download=\"review-copy.html\">Download this copy</a>'\n    + '<p class=\"subj-note\" data-rvc-signature>'"]] },
  { name: "(B) a print hook", declared: "RED", names: ["NO EXPORT"], mustNotFail: ["MARKING"],
    edits: [["try{ window.addEventListener(\"hashchange\", ()=>{ if(!RVC_HASH_LOCK) draftRouteFromHash(); }); }catch(_){}",
             "try{ window.addEventListener(\"hashchange\", ()=>{ if(!RVC_HASH_LOCK) draftRouteFromHash(); }); }catch(_){}\ntry{ window.addEventListener(\"beforeprint\", ()=>{ rvsPaint(); }); }catch(_){}"]] },
  { name: "(C) the dead link says why", declared: "RED", names: ["NEUTRAL"], mustNotFail: ["ONE ANSWER"],
    edits: [["if(!RVS.copy) return '<h1 class=\"rec\">Nothing to read here</h1>' + rvcRefusalHtml(RVS.dead);",
             "if(!RVS.copy) return '<h1 class=\"rec\">This access was revoked</h1>' + rvcRefusalHtml(RVS.dead);"]] },
  { name: "(D) the marking dropped", declared: "RED", names: ["MARKING"], mustNotFail: ["NO EXPORT"],
    edits: [["    + '<div class=\"rvc-marking\" data-rvc-marking>' + esc(c.marking || \"\") + '</div>'\n", ""]] },
  { name: "(E) the form prefilled", declared: "RED", names: ["NOTHING PREFILLED"], mustNotFail: ["DRAFT: saving sent op=casedraft"],
    edits: [["           scope:\"\", statement:\"\", excluded:[], nothingLeftOut:false,",
             "           scope:\"The whole of the matter.\", statement:\"\", excluded:[], nothingLeftOut:false,"]] },
  { name: "(F) a recipient labelled a member", declared: "RED", names: ["LABELLED"],
    mustNotFail: ["THE RECORD: the plane holds the comment as a RECIPIENT's"],
    edits: [["    const who = k && k.author_kind === \"recipient\"",
             "    const who = false"],
            ["'<div class=\"card\" data-rvc-comment data-author-kind=\"' + esc(k && k.author_kind) + '\">",
             "'<div class=\"card\" data-rvc-comment data-author-kind=\"member\">"]] },
  { name: "(G) OVER-STRICTNESS: headings and the grant note re-worded", declared: "GREEN",
    edits: [["'<h2 class=\"sec\">Who it is addressed to</h2>'", "'<h2 class=\"sec\">The people this draft was handed to</h2>'"],
            ["return '<h2 class=\"sec\">Comments</h2>'", "return '<h2 class=\"sec\">What readers have said</h2>'"],
            ["'<button class=\"btn\" onclick=\"rvcGrant()\">Give access</button></div>'",
             "'<button class=\"btn\" onclick=\"rvcGrant()\">Hand this draft to them</button></div>'"]] },
];

fs.mkdirSync(SCRATCH, { recursive: true });
const orig = { sha: sha(APP), bytes: fs.statSync(APP).size };
if (orig.bytes < 1_000_000) throw new Error(`app.html is ${orig.bytes} B — not the file this control expects`);
console.log(`app.html pristine sha256 ${orig.sha} (${orig.bytes} B)`);
const rows = [];
let allAsDeclared = true;
try {
  for (const [i, arm] of ARMS.entries()) {
    const pristine = path.join(SCRATCH, `app.pristine.arm${i}`);
    fs.copyFileSync(APP, pristine);
    if (sha(pristine) !== orig.sha) throw new Error(`arm ${arm.name}: pristine copy differs`);
    let armed = true;
    let src = fs.readFileSync(APP, "utf8");
    for (const [from, to] of arm.edits) {
      const hits = src.split(from).length - 1;
      if (hits !== 1) { armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${hits} time(s): ${from.slice(0, 90)}`); }
      else src = src.replace(from, () => to);
    }
    if (armed && arm.edits.length) fs.writeFileSync(APP, src);
    const r = spawnSync("node", [SUITE], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 300000 });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    const tally = (/review-copy\.test\.mjs: (\d+ pass, \d+ fail)/.exec(out) || [])[1] || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const named = arm.names ? arm.names.every((nm) => failLines.some((l) => l.includes(nm))) : null;
    const spared = arm.mustNotFail ? arm.mustNotFail.every((nm) => !failLines.some((l) => l.includes(nm))) : null;
    const asDeclared = armed && got === arm.declared && named !== false && spared !== false && tally !== "-1";
    if (!asDeclared) allAsDeclared = false;
    fs.copyFileSync(pristine, APP);
    let cmpOk = false;
    try { execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; } catch (_) { cmpOk = false; }
    const s = sha(APP);
    if (s !== orig.sha || !cmpOk || fs.statSync(APP).size !== orig.bytes)
      throw new Error(`arm ${arm.name}: RESTORE FAILED (sha ${s}, cmp ${cmpOk})`);
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · names ${JSON.stringify(arm.names)}: ${named}` : ""}`
      + `${arm.mustNotFail ? ` · spares ${JSON.stringify(arm.mustNotFail)}: ${spared}` : ""}`
      + ` · restored ${s.slice(0, 12)} cmp ok`);
    for (const l of failLines) console.log("      " + l.trim().slice(0, 200));
  }
} finally {
  if (sha(APP) !== orig.sha) {
    for (const i of ARMS.keys()) {
      const c = path.join(SCRATCH, `app.pristine.arm${i}`);
      if (fs.existsSync(c) && sha(c) === orig.sha) { fs.copyFileSync(c, APP); break; }
    }
  }
  const s = sha(APP);
  console.log(`app.html final sha256 ${s} — ${s === orig.sha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
  if (s === orig.sha) fs.rmSync(path.join(REPO, ".ui68-harness"), { recursive: true, force: true });
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`review-copy.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
