/* UI-106 (carrying D-619) — THE NEGATIVE CONTROL for `review-copy-newcase.test.mjs`, re-runnable in one step from
 * the repo root:
 *
 *     node civicos-ui/test/review-copy-newcase.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not
 * discover it. The driver is `review-copy.control.mjs`'s (UI-68), retargeted: each arm mutates app.html ALONE
 * (every anchored replacement asserted to match EXACTLY once — an arm that did not arm is a finding, never a
 * pass), runs the suite, restores app.html from a per-arm pristine copy and verifies the restore by sha256 AND
 * `cmp`, guarding the byte count. Its pristine copies are per-run and unique under the OS temp directory, as
 * UI-92 moved that driver's. Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the text its failing
 * lines MUST name, and the ones that MUST NOT fail (it broke one thing):
 *
 *   BASELINE                                                                        -> GREEN
 *   (A) UI-106's OWN — the `newCase` read dropped from `rvcFormFromCopy`            -> RED, naming
 *       "ROUND TRIP KEEPS newCase"; MUST NOT fail "DD KEEPS ITS DERIVATION" or "A DEAD DERIVED-DRAFT GRANT"
 *   (B) D-619's OWN — the roster's no-case branch says "a new case" again           -> RED, naming
 *       "A DEAD DERIVED-DRAFT GRANT NEVER READS"; MUST NOT fail "ROUND TRIP KEEPS newCase"
 *   (C) THE LIAR'S READ — every draft naming no case read back as a new-case draft  -> RED, naming
 *       "DD KEEPS ITS DERIVATION"; MUST NOT fail "ROUND TRIP KEEPS newCase" (the liar is right about DN for free)
 *   (D) OVER-STRICTNESS — the roster's no-case wording re-spelled                   -> GREEN
 *   (E) OVER-STRICTNESS — the read by truthiness rather than `=== true`             -> GREEN (the plane answers a
 *       boolean, REC-199: `!!params.newCase`)
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
const APP = path.join(REPO, "civicos-ui", "app.html");
const SUITE = path.join(HERE, "review-copy-newcase.test.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui106-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const READ = "  else if(c && c.case && c.case.newCase === true) f.caseMode = \"new\";\n";
const ARMS = [
  { name: "BASELINE", declared: "GREEN", edits: [] },
  { name: "(A) the newCase read dropped", declared: "RED", names: ["ROUND TRIP KEEPS newCase"],
    mustNotFail: ["DD KEEPS ITS DERIVATION", "A DEAD DERIVED-DRAFT GRANT"],
    edits: [[READ, ""]] },
  { name: "(B) \"a new case\" restored on the roster", declared: "RED", names: ["A DEAD DERIVED-DRAFT GRANT NEVER READS"],
    mustNotFail: ["ROUND TRIP KEEPS newCase"],
    edits: [["      : \"a draft that named no case\";", "      : \"a new case\";"]] },
  { name: "(C) the liar's read: no case means new", declared: "RED", names: ["DD KEEPS ITS DERIVATION"],
    mustNotFail: ["ROUND TRIP KEEPS newCase"],
    edits: [[READ, "  else if(c && c.case) f.caseMode = \"new\";\n"]] },
  { name: "(D) OVER-STRICTNESS: the roster's wording re-spelled", declared: "GREEN",
    edits: [["      : \"a draft that named no case\";", "      : \"a draft which did not name any case\";"]] },
  { name: "(E) OVER-STRICTNESS: the read by truthiness", declared: "GREEN",
    edits: [[READ, "  else if(c && c.case && c.case.newCase) f.caseMode = \"new\";\n"]] },
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
    const tally = (/review-copy-newcase\.test\.mjs: (\d+ pass, \d+ fail)/.exec(out) || [])[1] || "-1";
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
  if (s === orig.sha) fs.rmSync(SCRATCH, { recursive: true, force: true });
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`review-copy-newcase.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
