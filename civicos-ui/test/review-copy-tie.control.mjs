/* UI-118 — THE NEGATIVE CONTROL OF `review-copy-tie.test.mjs`. Run from the repo root:
 *   node civicos-ui/test/review-copy-tie.control.mjs
 * Each arm ALONE on `civicos-ui/app.html`: its anchor must match EXACTLY ONCE (an arm that did not arm is a
 * finding, never a pass), the suite runs, and app.html is restored from a per-arm pristine copy in a fresh
 * temporary directory (never the worktree) and verified by sha256 AND `cmp`. Declared before arming, below. */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const APP = path.join(REPO, "civicos-ui/app.html");
const SUITE = path.join(REPO, "civicos-ui/test/review-copy-tie.test.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui118-control-"));
const sha = (f) => createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) THE ROW'S OWN: last_change dropped from the export", declared: "RED",
    names: ["THE TIE ARM", "A RECIPIENT'S COMMENT"], mustNotFail: ["NO TIE, NO STATEMENT"],
    edits: [["  const lc = c && c.last_change;\n", "  const lc = { undetermined_within: [] };\n"]] },
  { name: "(B) the statement on the first page only", declared: "RED",
    names: ["EVERY PAGE"], mustNotFail: ["THE TIE ARM"],
    edits: [["return pages.map((inner, i) => rvcExportPage(q, tie, i + 1, inner));",
             "return pages.map((inner, i) => rvcExportPage(q, i === 0 ? tie : null, i + 1, inner));"]] },
  { name: "(C) the recipient guard removed", declared: "RED",
    names: ["A RECIPIENT'S COMMENT"], mustNotFail: ["THE TIE ARM", "EVERY PAGE", "NO TIE, NO STATEMENT", "BOTH TO THE SECOND"],
    edits: [["  if([lc].concat(tied).some((a) => a && a.kind === \"comment\" && a.by_kind === \"recipient\"))\n    return { refusal: RVC_TIE_NAMES_RECIPIENT };\n", ""]] },
  { name: "(D) the statement drawn with no tie", declared: "RED",
    names: ["NO TIE, NO STATEMENT"], mustNotFail: ["THE TIE ARM", "EVERY PAGE", "A RECIPIENT'S COMMENT"],
    edits: [["  if(!tied.length) return { stated: null };\n", "  if(!tied.length) return { stated: lc.stated || null };\n"]] },
  { name: "(E) OVER-STRICTNESS: the statement a <p> under another class", declared: "GREEN",
    edits: [["'<div class=\"rvx-tie\" data-rvx-tie>' + esc(tie) + '</div>'", "'<p class=\"rvx-datetie\" data-rvx-tie>' + esc(tie) + '</p>'"]] },
];
const orig = sha(APP), bytes = fs.statSync(APP).size;
if (bytes < 1_000_000) throw new Error(`app.html is ${bytes} B — not the file this control was written for`);
console.log(`app.html pristine sha256 ${orig} (${bytes} B)`);
let asDeclared = 0;
ARMS.forEach((arm, i) => {
  const pristine = path.join(SCRATCH, `app.pristine.arm${i}`);
  fs.copyFileSync(APP, pristine);
  if (sha(pristine) !== orig) throw new Error(`arm ${arm.name}: pristine copy differs`);
  let src = fs.readFileSync(APP, "utf8"), armed = true;
  for (const [from, to] of arm.edits) {
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  ARM DID NOT ARM: ${arm.name} — anchor matched ${n} time(s)`); break; }
    src = src.replace(from, to);
  }
  let out = "", code = 0;
  if (armed) {
    fs.writeFileSync(APP, src);
    try { out = execFileSync("node", [SUITE], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || ""); code = e.status; }
  }
  fs.copyFileSync(pristine, APP);
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", pristine, APP]); cmpOk = true; } catch (_) { cmpOk = false; }
  const restored = cmpOk && sha(APP) === orig;
  const tally = /review-copy-tie\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
  const fails = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.trim().slice(6));
  const got = !armed || !tally ? "NOT MEASURED" : (code === 0 && tally[2] === "0" ? "GREEN" : "RED");
  const namesOk = (arm.names || []).every((n) => fails.some((f) => f.startsWith(n)));
  const sparesOk = (arm.mustNotFail || []).every((n) => !fails.some((f) => f.startsWith(n)));
  const ok = armed && restored && got === arm.declared && namesOk && sparesOk;
  if (ok) asDeclared++;
  console.log(`${ok ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got}`
    + ` (exit ${code}, ${tally ? `${tally[1]} pass, ${tally[2]} fail` : "no tally: -1"}) · fails ${JSON.stringify(fails.map((f) => f.slice(0, 40)))}`
    + ` · restored ${restored ? orig.slice(0, 12) + " cmp ok" : "DIFFERENT"}`);
  if (!restored) throw new Error("app.html was not restored — stop");
});
console.log(`app.html final sha256 ${sha(APP)} — ${sha(APP) === orig ? "IDENTICAL" : "DIFFERENT"} to pristine`);
console.log(`review-copy-tie.control: ${asDeclared}/${ARMS.length} arms AS DECLARED`);
process.exit(asDeclared === ARMS.length ? 0 : 1);
