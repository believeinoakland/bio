/* UI-121 — THE NEGATIVE CONTROL for `draft-binding.test.mjs`, driven and re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/draft-binding.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not
 * discover it. The engine is `statement-writer.control.mjs`'s (UI-103), unchanged in kind: each arm mutates the
 * file ALONE, every anchored replacement asserted to match EXACTLY once (an arm that did not arm is a finding,
 * never a pass), runs the suite, restores from a UNIQUELY-NAMED per-arm pristine copy in a `mkdtemp` pen outside
 * the worktree, and verifies by sha256 AND `cmp` with a byte count printed and floored. Declared BEFORE arming,
 * per arm: RED or GREEN; for a RED arm the text its failing lines MUST name, and those that MUST NOT fail.
 *
 *   BASELINE                                                                            -> GREEN
 *   (A) THE ROW'S OWN CONTROL — drop `draft_case` from the page: the binding read as never stated
 *                                                                                       -> RED, naming
 *       "HOW THE CASE WAS BOUND" (all five bindings); MUST NOT fail "THE LINK, IN THE PLANE'S WORDS",
 *       "NO LINK, NO BLOCK", "A LINK SIGNED BEFORE ITS BINDING WAS STATED"
 *   (B) THE BLOCK WITH NO CALL SITE — `pubDraftLinkHtml` defined and never called by page 2
 *                                                                                       -> RED, naming
 *       "HOW THE CASE WAS BOUND", "THE LINK, IN THE PLANE'S WORDS"; MUST NOT fail "NO LINK, NO BLOCK",
 *       "A LINK SIGNED BEFORE ITS BINDING WAS STATED"
 *   (C) THE PLANE'S SENTENCE PARAPHRASED — a sentence this surface wrote in place of the signed one (DEC-8)
 *                                                                                       -> RED, naming
 *       "HOW THE CASE WAS BOUND"; MUST NOT fail "THE LINK, IN THE PLANE'S WORDS"
 *   (D) THE SIGNED TEXT NEVER READ — `pubOpen` skips `op=casedocument`                  -> RED, naming
 *       "HOW THE CASE WAS BOUND", "THE LINK, IN THE PLANE'S WORDS"; MUST NOT fail
 *       "A LINK SIGNED BEFORE ITS BINDING WAS STATED", "NO LINK, NO BLOCK"
 *   (E) OVER-STRICTNESS — the heading and the lede re-worded, the facts unchanged       -> GREEN
 *
 * RUN 2026-09-25 by the UI-121 worker against `civicos-ui/app.html` 35ebc2544bff7baf… (1,638,056 B), IDENTICAL by
 * sha256 AND `cmp` after every arm; driver exit 0, 6/6 AS DECLARED: BASELINE GREEN 38/0 · (A) RED 31/7 — the five
 * "HOW THE CASE WAS BOUND" rows plus section 6's "unquoted" and "found twice" rows (a stated binding read as never
 * stated), sparing every link row · (B) RED 28/10 · (C) RED 33/5 · (D) RED 28/10 · (E) GREEN 38/0.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");
const FILES = { app: path.join(REPO, "civicos-ui", "app.html") };
const SUITE = { path: path.join(HERE, "draft-binding.test.mjs"), foot: /draft-binding\.test\.mjs: (\d+ pass, \d+ fail)/ };
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui121-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const FIVE = ["derived at publication", "named and confirmed", "new case asked at publication",
              "named by the draft", "new case asked by the draft"];
const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) draft_case dropped from the page", declared: "RED",
    names: FIVE.map((b) => `HOW THE CASE WAS BOUND, IN THE PLANE'S WORDS (${b})`),
    mustNotFail: ["THE LINK, IN THE PLANE'S WORDS", "NO LINK, NO BLOCK", "A LINK SIGNED BEFORE ITS BINDING WAS STATED"],
    edits: [["app", '  const token = (typeof dl.case === "string" && dl.case.trim()) ? dl.case.trim() : null;',
                    '  const token = null;']] },
  { name: "(B) the block with no call site", declared: "RED",
    names: ["HOW THE CASE WAS BOUND", "THE LINK, IN THE PLANE'S WORDS"],
    mustNotFail: ["NO LINK, NO BLOCK", "A LINK SIGNED BEFORE ITS BINDING WAS STATED"],
    edits: [["app", "     ${pubDraftLinkHtml(c, pubSignedText(c))}`);", "     ${\"\"}`);"]] },
  { name: "(C) the plane's sentence paraphrased", declared: "RED",
    names: ["HOW THE CASE WAS BOUND"],
    mustNotFail: ["THE LINK, IN THE PLANE'S WORDS"],
    edits: [["app", "      : esc(how);\n", "      : \"This case was bound to the draft it was prepared in at publication.\";\n"]] },
  { name: "(D) the signed text never read", declared: "RED",
    names: ["HOW THE CASE WAS BOUND", "THE LINK, IN THE PLANE'S WORDS"],
    mustNotFail: ["A LINK SIGNED BEFORE ITS BINDING WAS STATED", "NO LINK, NO BLOCK"],
    edits: [["app", '        const d = await apiQ("casedocument", { case: pubCaseId(c), edition: String(c.edition) });',
                    '        const d = null;']] },
  { name: "(E) over-strictness: the heading and the lede re-worded", declared: "GREEN",
    edits: [["app", "  return '<h2>The draft this case was prepared in</h2>'",
                    "  return '<h2>Which draft this case came from</h2>'"],
            ["app", "    + '<p class=\"subj-note\">Stated by the member who published the case, at the act of publishing it, and signed '\n    + 'into the case document. Quoted from the signed text, not re-worded here.</p>'",
                    "    + '<p class=\"subj-note\">The publisher said this when publishing, and it is signed into the case '\n    + 'document; what follows is the signed wording itself.</p>'"]] },
];
const orig = {};
for (const [k, p] of Object.entries(FILES)) {
  orig[k] = { sha: sha(p), bytes: fs.statSync(p).size };
  if (orig[k].bytes < 500000) throw new Error(`${k} is ${orig[k].bytes} bytes — too small to be the subject`);
  console.log(`${k} pristine sha256 ${orig[k].sha} (${orig[k].bytes} bytes)`);
}
console.log(`control pen: ${SCRATCH} (a mkdtemp pen outside the worktree — see the header; BOB #33 permits an in-worktree one)`);
const runSuite = () => spawnSync("node", [SUITE.path], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, cwd: REPO });
const rows = [];
let allAsDeclared = true;
try {
  for (const [i, arm] of ARMS.entries()) {
    const touched = [...new Set((arm.edits || []).map(([f]) => f))];
    const pristine = {};
    for (const f of touched) {
      pristine[f] = path.join(SCRATCH, `${f}.pristine.arm${i}`);
      fs.copyFileSync(FILES[f], pristine[f]);
      if (sha(pristine[f]) !== orig[f].sha) throw new Error(`arm ${arm.name}: pristine copy of ${f} differs`);
    }
    let armed = true;
    const src = {};
    for (const f of touched) src[f] = fs.readFileSync(FILES[f], "utf8");
    for (const [f, from, to] of arm.edits || []) {
      const hits = src[f].split(from).length - 1;
      if (hits !== 1) { armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — ${f} anchor matched ${hits} time(s): ${from.slice(0, 90)}`); }
      else src[f] = src[f].replace(from, () => to);
    }
    if (armed) for (const f of touched) fs.writeFileSync(FILES[f], src[f]);
    const r = runSuite();
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    /* THE SUITE'S OWN FOOT LINE, never the wrapper's exit: a run that ends without it did not finish, and
       an absent tally reports "-1" and never "0" (WORKER.md — a TypeError inside an assertion goes through
       no assertion at all and ends the module while the tally reads clean). */
    const tally = (SUITE.foot.exec(out) || [])[1] || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    const second = null;
    const named = arm.names ? arm.names.every((nm) => failLines.some((l) => l.includes(nm))) : null;
    const spared = arm.mustNotFail ? arm.mustNotFail.every((nm) => !failLines.some((l) => l.includes(nm))) : null;
    const asDeclared = armed && got === arm.declared && named !== false && spared !== false && tally !== "-1";
    if (!asDeclared) allAsDeclared = false;
    const restored = [];
    for (const f of touched) {
      fs.copyFileSync(pristine[f], FILES[f]);
      let cmpOk = false;
      try { execFileSync("cmp", ["-s", pristine[f], FILES[f]]); cmpOk = true; } catch (_) { cmpOk = false; }
      const s = sha(FILES[f]);
      if (s !== orig[f].sha || !cmpOk || fs.statSync(FILES[f]).size !== orig[f].bytes)
        throw new Error(`arm ${arm.name}: RESTORE FAILED for ${f} (sha ${s}, cmp ${cmpOk})`);
      restored.push(`${f} ${s.slice(0, 12)} cmp ok ${orig[f].bytes} B`);
    }
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, second, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · names ${JSON.stringify(arm.names)}: ${named}` : ""}`
      + `${arm.mustNotFail ? ` · spares ${JSON.stringify(arm.mustNotFail)}: ${spared}` : ""}`
      + `${second ? ` · publishedcase ${second.got} (${second.tally})` : ""}`
      + `${restored.length ? ` · restored ${restored.join(", ")}` : ""}`);
    for (const l of failLines) console.log("      " + l.trim().split("\n")[0].slice(0, 220));
    if (second) for (const l of second.fails) console.log("      publishedcase: " + l.trim().split("\n")[0].slice(0, 220));
  }
} finally {
  let clean = true;
  for (const [k, p] of Object.entries(FILES)) {
    /* The pristine copies are NAMED from the arm table, never found by listing the pen — a directory walk
       is a class `hygiene.test.mjs` guards, and this needs none. */
    if (sha(p) !== orig[k].sha) {
      for (const i of ARMS.keys()) {
        const c = path.join(SCRATCH, `${k}.pristine.arm${i}`);
        if (fs.existsSync(c) && sha(c) === orig[k].sha) { fs.copyFileSync(c, p); break; }
      }
    }
    const s = sha(p);
    console.log(`${k} final sha256 ${s} — ${s === orig[k].sha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
    if (s !== orig[k].sha) clean = false;
  }
  if (clean) fs.rmSync(SCRATCH, { recursive: true, force: true });
  else console.log(`PEN KEPT for inspection: ${SCRATCH}`);
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}${r.second ? ` / pc ${r.second.tally}` : ""}`).join(" · ")}`);
console.log(`draft-binding.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
