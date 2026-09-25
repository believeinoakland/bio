/* D-194 — THE NEGATIVE CONTROL for `lead-surface.test.mjs`, driven and re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/lead-surface.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not
 * discover it. Each arm mutates the file ALONE (every anchored replacement asserted to match EXACTLY once — an arm
 * that did not arm is a finding, never a pass), runs the suite, then restores from a per-arm pristine copy and
 * verifies by sha256 AND by `cmp`, guarding a minimum byte count so an empty copy cannot "match". Declared BEFORE
 * arming, per arm: RED or GREEN; for a RED arm the text its failing lines MUST name, and the ones that MUST NOT fail.
 * The pen is `mkdtemp` under the system temp root (`statement-writer.control.mjs`'s shape, for its reasons): it needs
 * no `.gitignore` entry, and it is removed on a clean run and KEPT, its path printed, when a restore left the subject
 * changed.
 *
 *   BASELINE                                                                          -> GREEN
 *   (A) THE ROW'S OWN — `op=lead` stubbed: the page answers its own write without asking the plane
 *                                                                                     -> RED, naming
 *       "WRITE AND LOOK: the write is `op=lead` on the wire", "WRITE AND LOOK: the plane holds the lead";
 *       MUST NOT fail "NOTHING PREFILLED", "MIRROR"
 *   (B) an outcome preselected on the look                                            -> RED, naming
 *       "NOTHING PRESELECTED: and none is checked"; MUST NOT fail "WRITE AND LOOK: the plane records the look"
 *   (C) a refusal re-worded by the page                                               -> RED, naming
 *       "LEAD_NO_WORDS, verbatim", "LEAD_LOOK_STATE translation verbatim", "jon's page draws the plane's refusal";
 *       MUST NOT fail "WRITE AND LOOK: and the member SEES LOOKED_ABSENT"
 *   (D) a share as a side effect of the look                                          -> RED, naming
 *       "NO SHARE AS A SIDE EFFECT", "THE MEMBER'S ACT"; MUST NOT fail "WRITE AND LOOK: the plane records the look"
 *   (E) the plane's word for LOOKED_ABSENT improved by the page                        -> RED, naming
 *       "MIRROR: each of the page's sentences", "in the plane's own words for that state";
 *       MUST NOT fail "WRITE AND LOOK: and the member SEES LOOKED_ABSENT"
 *   (F) the list stubbed empty instead of read from the plane                          -> RED, naming
 *       "the list is the plane's internet-level frontier", "the list draws LOOKED_ABSENT against that lead";
 *       MUST NOT fail "WRITE AND LOOK: the plane records the look"
 *   (G) OVER-STRICTNESS — the heading, the lede and the write button re-worded        -> GREEN
 *
 * RUN 2026-09-25 by the D-194 worker, the FIRST run and unamended: 8/8 AS DECLARED against app.html 0c39845f92eaa2d5…
 * (1,650,102 B), IDENTICAL after every arm by sha256 AND cmp, driver exit 0. BASELINE GREEN 48/0 · (A) RED 10/15 · (B) RED
 * 47/1 · (C) RED 45/3 · (D) RED 46/2 · (E) RED 46/2 · (F) RED 43/5 · (G) GREEN 48/0. Every RED arm failed at the lines it
 * named and spared the ones it declared; (A), the row's own, ended at the budgeted look wait (M0-107) AFTER both
 * write-and-look arms had failed by name, and the foot line was reached.
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
const SUITE = { path: path.join(HERE, "lead-surface.test.mjs"), foot: /lead-surface\.test\.mjs: (\d+ pass, \d+ fail)/ };
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "d194-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ARMS = [
  { name: "BASELINE", declared: "GREEN" },
  { name: "(A) op=lead stubbed", declared: "RED",
    names: ["WRITE AND LOOK: the write is `op=lead` on the wire", "WRITE AND LOOK: the plane holds the lead"],
    mustNotFail: ["NOTHING PREFILLED", "MIRROR"],
    edits: [["app", '  try{ r = await recPostR("lead", body); }',
                    '  try{ r = { ok: true, lead_id: "LEAD-2026-0101-stubbd", says: "" }; }']] },
  { name: "(B) an outcome preselected", declared: "RED",
    names: ["NOTHING PRESELECTED: and none is checked"],
    mustNotFail: ["WRITE AND LOOK: the plane records the look"],
    edits: [["app", "    + (LDS.lookState === st ? 'checked ' : '') + 'onchange=\"ldField(\\'lookState\\', \\'' + esc(st) + '\\')\"> '",
                    "    + (LDS.lookState === st || st === \"LOOKED_ABSENT\" ? 'checked ' : '') + 'onchange=\"ldField(\\'lookState\\', \\'' + esc(st) + '\\')\"> '"]] },
  { name: "(C) a refusal re-worded", declared: "RED",
    names: ["LEAD_NO_WORDS, verbatim", "LEAD_LOOK_STATE translation verbatim", "jon's page draws the plane's refusal"],
    mustNotFail: ["WRITE AND LOOK: and the member SEES LOOKED_ABSENT"],
    edits: [["app", "    + esc(refusalWords(r) || \"The record refused this and said nothing further.\") + '</div></div>';\n}\nfunction ldStateHtml",
                    "    + esc(\"The record could not do that.\") + '</div></div>';\n}\nfunction ldStateHtml"]] },
  { name: "(D) a share as a side effect of the look", declared: "RED",
    names: ["NO SHARE AS A SIDE EFFECT", "THE MEMBER'S ACT"],
    mustNotFail: ["WRITE AND LOOK: the plane records the look"],
    edits: [["app", '  try{ r = await recPostR("leadlook", body); }',
                    '  try{ r = await recPostR("leadlook", body); await recPostR("leadshare", { lead: LDS.id, project: "PROJ-none" }); }']] },
  { name: "(E) the plane's word improved", declared: "RED",
    names: ["MIRROR: each of the page's sentences", "in the plane's own words for that state"],
    mustNotFail: ["WRITE AND LOOK: and the member SEES LOOKED_ABSENT"],
    edits: [["app", '  LOOKED_ABSENT:        "we looked and it is positively not there",\n  LOOKED_INDETERMINATE: "we looked and could not tell",\n  PRESENT:              "we looked and it is there",\n  partial:              "we looked and got part of it",',
                    '  LOOKED_ABSENT:        "we looked and it is not there",\n  LOOKED_INDETERMINATE: "we looked and could not tell",\n  PRESENT:              "we looked and it is there",\n  partial:              "we looked and got part of it",']] },
  { name: "(F) the list stubbed empty", declared: "RED",
    names: ["the list is the plane's internet-level frontier", "the list draws LOOKED_ABSENT against that lead"],
    mustNotFail: ["WRITE AND LOOK: the plane records the look"],
    edits: [["app", '    const r = await recR("frontier", { level: "internet", limit: String(LEAD_ASK_LIMIT) });',
                    '    const r = { looked: [], never_looked: [] };']] },
  { name: "(G) over-strictness: the heading, lede and button re-worded", declared: "GREEN",
    edits: [["app", `  const head = '<div class="trow"><h1 class="rec">Leads</h1></div>'`,
                    `  const head = '<div class="trow"><h1 class="rec">Your leads</h1></div>'`],
            ["app", "    + 'It is somewhere to look and never evidence: nothing in a case can rest on it. Only you can read a lead you write, '",
                    "    + 'It tells you where to look; it is not evidence, and no case can rest on it. A lead you write is yours alone, '"],
            ["app", `onclick="ldWrite()">Record the lead</button>`, `onclick="ldWrite()">Write it down</button>`]] },
];

const orig = {};
for (const [k, p] of Object.entries(FILES)) {
  orig[k] = { sha: sha(p), bytes: fs.statSync(p).size };
  if (orig[k].bytes < 500000) throw new Error(`${k} is ${orig[k].bytes} bytes — too small to be the subject`);
  console.log(`${k} pristine sha256 ${orig[k].sha} (${orig[k].bytes} bytes)`);
}
console.log(`control pen: ${SCRATCH}`);
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
    const r = spawnSync("node", [SUITE.path], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, cwd: REPO });
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    /* THE SUITE'S OWN FOOT LINE, never the wrapper's exit: an absent tally reports "-1" and never "0". */
    const tally = (SUITE.foot.exec(out) || [])[1] || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
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
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · names ${JSON.stringify(arm.names)}: ${named}` : ""}`
      + `${arm.mustNotFail ? ` · spares ${JSON.stringify(arm.mustNotFail)}: ${spared}` : ""}`
      + `${restored.length ? ` · restored ${restored.join(", ")}` : ""}`);
    for (const l of failLines) console.log("      " + l.trim().split("\n")[0].slice(0, 220));
  }
} finally {
  let clean = true;
  for (const [k, p] of Object.entries(FILES)) {
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
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`lead-surface.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
