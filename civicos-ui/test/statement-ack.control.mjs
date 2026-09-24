/* UI-89 — THE NEGATIVE CONTROL for `statement-ack.test.mjs`, driven and re-runnable in one step from the
 * repo root:
 *
 *     node civicos-ui/test/statement-ack.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must not
 * discover it. Each arm mutates the file ALONE (every anchored replacement asserted to match EXACTLY once — an
 * arm that did not arm is a finding, never a pass), runs the suite, then restores from a per-arm pristine copy
 * and verifies by sha256 AND by `cmp`, guarding a minimum byte count so an empty copy cannot "match".
 * Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the text its failing lines MUST name, and the
 * ones that MUST NOT fail (the arm broke only the thing).
 *
 *   BASELINE                                                                                -> GREEN
 *   (A) THE ROW'S OWN CONTROL — `null` rendered as `[]` on the published case page           -> RED, naming
 *       "NULL IS NOT NOBODY" and "THE TWO SENTENCES DIFFER"; MUST NOT fail the two live doors
 *       ("BOTH DOORS", "RECORDED") or "[] IS NOBODY BUT THE AUTHOR"
 *   (B) THE OTHER DIRECTION — `[]` rendered as `null`                                        -> RED, naming
 *       "[] IS NOBODY BUT THE AUTHOR"; MUST NOT fail "BOTH DOORS"
 *   (C) THE LIST DROPPED FROM THE REVIEW COPY — surface 1 absent                             -> RED, naming
 *       "LEADS" and "EMPTY IS NOT SILENT"; MUST NOT fail "NULL IS NOT NOBODY"
 *   (D) THE ACT WITH NO CALL SITE — the button drawn, the op never sent (this area has shipped
 *       one three times: CIVICOS_UI_STATE.md v50/v45/v76)                                    -> RED, naming
 *       "the author's refusal is drawn" (RE-DECLARED at the arm, from its measured first run);
 *       MUST NOT fail "NULL IS NOT NOBODY"
 *   (E) THE SURFACE WRITES ITS OWN REFUSAL — the page's own sentence in place of the plane's  -> RED, naming
 *       "BY ITS AUTHOR"; MUST NOT fail "NULL IS NOT NOBODY"
 *   (F) THE CODE PRINTED — the refusal's `reason` rendered instead of its words               -> RED, naming
 *       "NO MACHINE VOCABULARY"; MUST NOT fail "[] IS NOBODY BUT THE AUTHOR"
 *   (G) OVER-STRICTNESS — the acknowledge button and the list's lede re-worded in a spelling the
 *       suite did not anticipate                                                             -> GREEN
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");
const FILES = {
  app: path.join(REPO, "civicos-ui", "app.html"),
};
const SUITE = path.join(HERE, "statement-ack.test.mjs");
const SCRATCH = path.join(REPO, ".ui89-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ARMS = [
  { name: "BASELINE", run: "suite", declared: "GREEN" },
  { name: "(A) null rendered as []", run: "suite", declared: "RED",
    names: ["NULL IS NOT NOBODY", "THE TWO SENTENCES DIFFER"],
    mustNotFail: ["BOTH DOORS", "RECORDED", "[] IS NOBODY BUT THE AUTHOR"],
    /* CORRECTED after its first run, and the correction is a finding about the ARM rather than about the
       subject (WORKER.md: "a surprising green is a finding about your ARM"; here a surprising -1). The first
       spelling disabled the `null` BRANCH — `if(false && !Array.isArray(a))` — which then reached `a.length`
       on null and threw, ending the suite with NO tally at all (-1) and naming nothing. That arm moved a
       SECOND variable (it broke the page, not the rendering) and refutes nothing. This one collapses the two
       facts at the SOURCE, which is exactly the liar the delegation names: `null` becomes `[]` before the
       branch ever sees it, and every other branch is untouched. */
    edits: [["app", "  const a = c.completeness.acknowledgements;", "  const a = c.completeness.acknowledgements || [];"]] },
  { name: "(B) [] rendered as null", run: "suite", declared: "RED",
    names: ["[] IS NOBODY BUT THE AUTHOR"], mustNotFail: ["BOTH DOORS"],
    edits: [["app", "  if(!Array.isArray(a))\n", "  if(!Array.isArray(a) || !a.length)\n"]] },
  { name: "(C) the list dropped from the review copy", run: "suite", declared: "RED",
    names: ["LEADS", "EMPTY IS NOT SILENT"], mustNotFail: ["NULL IS NOT NOBODY"],
    edits: [["app", "    + rvcAcksHtml(c, door)\n", "    + \"\"\n"]] },
  /* (D) RE-DECLARED after its first run, and the re-declaration is the arm reporting itself honestly. It came
     back RED at 5 pass / 1 fail, but the failing line was the BUDGETED WAIT for the refusal ("the author's
     refusal is drawn"), not "ACT REACHES THE PLANE": with the op never sent there is no refusal to draw, the
     wait expires, `budgetAssert` marks it NOT MEASURED and the suite ENDS there by design (M0-107) — so every
     later assertion, the one declared here included, never ran. RED for the right reason, named by the wait. */
  { name: "(D) the act with no call site", run: "suite", declared: "RED",
    names: ["the author's refusal is drawn"], mustNotFail: ["NULL IS NOT NOBODY"],
    edits: [["app", "  try{ RVC.acked = await recR(\"statementack\", { draft: RVC.draft }); }",
                    "  try{ RVC.acked = null; }"]] },
  { name: "(E) the surface writes its own refusal", run: "suite", declared: "RED",
    names: ["BY ITS AUTHOR"], mustNotFail: ["NULL IS NOT NOBODY"],
    edits: [["app", "  catch(e){ RVC.ackRefusal = rvcIsAnswer(e) ? e : { detail: RVC_UNREACHED }; }",
                    "  catch(e){ RVC.ackRefusal = { detail: \"That could not be acknowledged.\" }; }"]] },
  { name: "(F) the machine code printed", run: "suite", declared: "RED",
    names: ["NO MACHINE VOCABULARY"], mustNotFail: ["[] IS NOBODY BUT THE AUTHOR"],
    edits: [["app", "  catch(e){ RVC.ackRefusal = rvcIsAnswer(e) ? e : { detail: RVC_UNREACHED }; }",
                    "  catch(e){ RVC.ackRefusal = { detail: String((e && e.reason) || \"\") }; }"]] },
  { name: "(G) over-strictness: the button and the lede re-worded", run: "suite", declared: "GREEN",
    edits: [["app", ">I have read what this case leaves out</button>", ">Yes, I have read this</button>"],
            ["app", "An acknowledgement is a second person saying they read what this case ",
                    "A second reader saying, on the record, that they read what this case "]] },
];

fs.mkdirSync(SCRATCH, { recursive: true });
const orig = {};
for (const [k, p] of Object.entries(FILES)) {
  orig[k] = { sha: sha(p), bytes: fs.statSync(p).size };
  if (orig[k].bytes < 500000) throw new Error(`${k} is ${orig[k].bytes} bytes — too small to be the subject`);
  console.log(`${k} pristine sha256 ${orig[k].sha} (${orig[k].bytes} bytes)`);
}
const runOne = () => spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, cwd: REPO });
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
      if (from === null) {   /* a WHOLE file, from the base commit */
        src[f] = execFileSync("git", ["show", `4355bfda:${to}`], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        if (src[f].length < 100000) { armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — ${to} at 4355bfda is ${src[f].length} B`); }
        continue;
      }
      const hits = src[f].split(from).length - 1;
      if (hits !== 1) { armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — ${f} anchor matched ${hits} time(s): ${from.slice(0, 80)}`); }
      else src[f] = src[f].replace(from, () => to);
    }
    if (armed) for (const f of touched) fs.writeFileSync(FILES[f], src[f]);
    const r = runOne();
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    /* The suite's OWN foot line, never the wrapper's exit: a run that ends without it did not finish,
       and "-1" (never 0) is what an absent tally reports (WORKER.md). */
    const tally = (/statement-ack\.test\.mjs: (\d+ pass, \d+ fail)/.exec(out) || [])[1] || "-1";
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
      restored.push(`${f} ${s.slice(0, 12)} cmp ok`);
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
    /* The pristine copies are NAMED from the arm table, never found by listing the pen — a directory
       walk is a class `hygiene.test.mjs` guards, and this needs none. */
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
  if (clean) fs.rmSync(path.join(REPO, ".ui89-harness"), { recursive: true, force: true });
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`statement-ack.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
