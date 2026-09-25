/* UI-81 — THE NEGATIVE CONTROL for `several-cases-choice.test.mjs` and for the DEC-49 guard's sight of
 * C-44.2, driven and re-runnable in one step from the repo root:
 *
 *     node civicos-ui/test/several-cases-choice.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html`, `bio-plane/checks/bio-checks.mjs` and
 * `bio-plane/src/store.mjs` while it runs, and the UI runner must not discover it. Each arm mutates its file(s)
 * ALONE (every anchored replacement asserted to match EXACTLY once — an arm that did not arm is a finding, never
 * a pass), runs ONE instrument (the suite, or the guard `civicos-ui/check-refusal-codes.mjs`), then restores
 * every file it touched from a per-arm pristine copy and verifies the restore by sha256 AND by `cmp`, guarding a
 * minimum byte count so an empty copy cannot "match". Declared BEFORE arming, per arm: RED or GREEN; for a RED
 * arm the text its failing lines MUST name, and the ones that MUST NOT fail (the arm broke only the thing):
 *
 *   BASELINE (suite)                                                                         -> GREEN
 *   BASELINE (guard)                                                                         -> GREEN
 *   (A) THE ROW'S CONTROL — the C-44.2 row dropped from CASE_DERIVATION_CHECKS (guard)       -> RED, naming
 *       the orphaned region `is-finding-in-several-cases` and the rows floor (RE-DECLARED after its first run,
 *       which was declared naming the code and did not: without its row the code is out of reach again)
 *   (A2) the row kept, its `translation` dropped (guard)                                     -> RED, naming
 *       "FINDING_IN_SEVERAL_CASES has NO CANNED TRANSLATION"
 *   (B) THE LIAR — `pubOpen` opens the FIRST named case silently (suite)                     -> RED, naming
 *       "NEVER PICKS" and "CHOICES"; MUST NOT fail "SUBSTRATE" or "DEC-49: the refusal carries"
 *   (C) THE DEFECT AS SHIPPED — the choices branch removed from `pubOpen` (suite)            -> RED, naming
 *       "CHOICES" and "THE PLANE'S WORDS"; MUST NOT fail "DEC-49: the refusal carries"
 *   (D) THE CODE PRINTED — the page's lead reads the refusal's `reason` (suite)              -> RED, naming
 *       "NO RAW CODE" and "THE PLANE'S WORDS"; MUST NOT fail "CHOICES" or "NEVER PICKS"
 *   (E) EVERY CHOICE OPENS THE FIRST CASE (suite)                                            -> RED, naming
 *       "OPENS: the choice for case"; MUST NOT fail "CHOICES" or "NEVER PICKS"
 *   (F) `#resolveOneCase` back to the uncoded object, the row kept (suite)                   -> GREEN
 *       (RE-DECLARED after its first run came back GREEN against a RED declaration: D-262's `dec49Attach`
 *       puts the row's translation on every `ok:false` answer whose reason has a row — the row is the wire's)
 *   (F2) the row's translation dropped, through the suite                                    -> RED, naming
 *       "DEC-49: the refusal carries" and "THE PLANE'S WORDS"; MUST NOT fail "CHOICES", "NEVER PICKS", "OPENS"
 *   (F3) the row's translation dropped, through the PLANE's `caseflip.test.mjs`               -> RED, naming
 *       "C-44.2 and the catalogue row's canned translation"; MUST NOT fail its stranger's two-cases arm
 *   (BEFORE) the three files as origin/main @ 4355bfda holds them (suite)                   -> RED, naming
 *       "DEC-49: the refusal carries", "CHOICES", "THE PLANE'S WORDS"; MUST NOT fail "SUBSTRATE"
 *   (G) OVER-STRICTNESS — the page's own heading and note re-worded (suite)                  -> GREEN
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");
const FILES = {
  app: path.join(REPO, "civicos-ui", "app.html"),
  checks: path.join(REPO, "bio-plane", "checks", "bio-checks.mjs"),
  store: path.join(REPO, "bio-plane", "src", "store.mjs"),
};
const SUITE = path.join(HERE, "several-cases-choice.test.mjs");
const SCRATCH = path.join(REPO, ".ui81-harness", "control");
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ROW = `  FINDING_IN_SEVERAL_CASES: {
    check: 'C-44.2',
    where: 'src/store.mjs #resolveOneCase > is-finding-in-several-cases',
    translation: 'This finding is part of more than one published case file. Each case file is its own '
      + 'publication, with its own scope and its own statement of what it covers, so the record will not '
      + 'pick one of them for you. Nothing is wrong with the finding. Choose the case file you mean, and '
      + 'it opens with this finding in it.',
  },
`;
const TRANSLATION = ROW.slice(ROW.indexOf("    translation:"), ROW.indexOf("  },\n"));
const BRANCH = `    if(c && c.ok === false && Array.isArray(c.cases) && c.cases.length){
      $("#pub-body").innerHTML = pubSeveralCasesHtml(id, c);
      return;
    }
`;

const ARMS = [
  { name: "BASELINE (suite)", run: "suite", declared: "GREEN" },
  { name: "BASELINE (guard)", run: "guard", declared: "GREEN" },
  /* (A)'s declaration was CORRECTED after its first run, and the correction is a finding: declared
     naming "FINDING_IN_SEVERAL_CASES", it came back RED over nine failures that NEVER NAME THE CODE —
     without its row the code leaves the reach entirely (today's main blindness, exactly), and what the
     guard still sees is the orphaned REGION marker and eight floors. So the guard names the code only
     while the row stands; (A2) is the arm that drops the translation and is named by the code. */
  { name: "(A) the C-44.2 row dropped", run: "guard", declared: "RED",
    /* Each name is an INVARIANT fragment of the guard's sentence or a whole value, never a fragment
       spanning a rendered count (`m025-arm-anchor-witness.test.mjs` L3 caught the first spelling,
       "… 38 families, floor is 299", which would go stale the moment either figure moved). */
    names: ["marker(s) in the plane that NO row's `where` claims", "is-finding-in-several-cases", "The reach SHRANK"],
    edits: [["checks", ROW, ""]] },
  { name: "(A2) the row's translation dropped", run: "guard", declared: "RED",
    names: ["FINDING_IN_SEVERAL_CASES has NO CANNED TRANSLATION"], edits: [["checks", TRANSLATION, ""]] },
  { name: "(B) the liar: open the first case silently", run: "suite", declared: "RED",
    names: ["NEVER PICKS", "CHOICES"], mustNotFail: ["SUBSTRATE", "DEC-49: the refusal carries"],
    edits: [["app", `      $("#pub-body").innerHTML = pubSeveralCasesHtml(id, c);\n      return;`,
                    `      return pubOpen(String(c.cases[0]), null, fromNav);`]] },
  { name: "(C) the defect as shipped: no choices branch", run: "suite", declared: "RED",
    names: ["CHOICES", "THE PLANE'S WORDS"], mustNotFail: ["DEC-49: the refusal carries"],
    edits: [["app", BRANCH, ""]] },
  { name: "(D) the code printed", run: "suite", declared: "RED",
    names: ["NO RAW CODE", "THE PLANE'S WORDS"], mustNotFail: ["CHOICES", "NEVER PICKS"],
    edits: [["app", `  const said = refusalWords(c);`, `  const said = String(c.reason || "");`]] },
  { name: "(E) every choice opens the first case", run: "suite", declared: "RED",
    names: ["OPENS: the choice for case"], mustNotFail: ["CHOICES", "NEVER PICKS"],
    edits: [["app", `onclick="pubOpen('\${esc(cid)}', `, `onclick="pubOpen('\${esc(cases[0])}', `]] },
  /* (F) was declared RED and came back GREEN on its first run — a finding about the ARM, recorded rather
     than smoothed: D-262's `dec49Attach` (bio-plane/src/index.mjs) decorates EVERY `ok:false` answer whose
     `reason` has a family row with `code`, `check` and `translation`, so the ROW is what puts the
     translation on the wire, and the store's `refusal` helper is the literal the guard's REGION reads.
     Re-declared GREEN, and (F2) is the arm that breaks the thing the wire actually carries. */
  { name: "(F) the store's helper removed, the row kept", run: "suite", declared: "GREEN",
    edits: [["store", `    return refusal("FINDING_IN_SEVERAL_CASES", { target: bundleId, cases,`,
                      `    return { ok: false, reason: "FINDING_IN_SEVERAL_CASES", target: bundleId, cases,`],
            ["store", "you. Ask again naming the case you mean.` });\n    /* END DEC-49 REGION is-finding-in-several-cases */",
                      "you. Ask again naming the case you mean.` };\n    /* END DEC-49 REGION is-finding-in-several-cases */"]] },
  { name: "(F2) the row's translation dropped, run through the suite", run: "suite", declared: "RED",
    names: ["DEC-49: the refusal carries", "THE PLANE'S WORDS"], mustNotFail: ["CHOICES", "NEVER PICKS", "OPENS: the choice for case"],
    edits: [["checks", TRANSLATION, ""]] },
  { name: "(F3) the row's translation dropped, through the plane's caseflip.test.mjs", run: "caseflip", declared: "RED",
    names: ["C-44.2 and the catalogue row's canned translation"],
    mustNotFail: ["and a STRANGER holding only that finding's id is told it serves TWO cases"],
    edits: [["checks", TRANSLATION, ""]] },
  /* THE BEFORE-STATE: the three subject files exactly as origin/main @ 4355bfda carried them. */
  { name: "(BEFORE) origin/main 4355bfda's app.html, bio-checks.mjs and store.mjs", run: "suite", declared: "RED",
    names: ["DEC-49: the refusal carries", "CHOICES", "THE PLANE'S WORDS"], mustNotFail: ["SUBSTRATE"],
    edits: [["app", null, "civicos-ui/app.html"], ["checks", null, "bio-plane/checks/bio-checks.mjs"],
            ["store", null, "bio-plane/src/store.mjs"]] },
  { name: "(G) over-strictness: the page's own words re-worded", run: "suite", declared: "GREEN",
    edits: [["app", `<h1>In \${esc(String(cases.length))} case files</h1>`, `<h1>Choose a case file</h1>`],
            ["app", `They are listed by their names, not ranked, and this page does not choose between them.`,
                    `Pick the one you came for; none of them is preferred here.`]] },
];

/* M0-197: the arms' anchors as data for tools/anchordrift.mjs, before the scratch dir is made (a no-op otherwise). An edit with
   no anchor (`from === null`) writes the file WHOLE from 4355bfda. */
anchorTable(ARMS.flatMap((a) => (a.edits || []).map(([f, find, put]) => find === null
  ? { arm: a.name, none: `writes ${put} WHOLE from 4355bfda` } : { arm: a.name, file: FILES[f], find, put })));

fs.mkdirSync(SCRATCH, { recursive: true });
const orig = {};
for (const [k, p] of Object.entries(FILES)) {
  orig[k] = { sha: sha(p), bytes: fs.statSync(p).size };
  if (orig[k].bytes < 100000) throw new Error(`${k} is ${orig[k].bytes} bytes — too small to be the subject`);
  console.log(`${k} pristine sha256 ${orig[k].sha} (${orig[k].bytes} bytes)`);
}
const runOne = (which) => which === "suite"
  ? spawnSync("node", [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, cwd: REPO })
  : which === "caseflip"
  ? spawnSync("node", ["test/caseflip.test.mjs"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, cwd: path.join(REPO, "bio-plane") })
  : spawnSync("node", ["check-refusal-codes.mjs"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, cwd: path.join(REPO, "civicos-ui") });
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
    const r = runOne(arm.run);
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = arm.run === "guard"
      ? out.split("\n").filter((l) => /^FAIL/.test(l))
      : out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    const tally = arm.run === "suite"
      ? ((/several-cases-choice\.test\.mjs: (\d+ pass, \d+ fail)/.exec(out) || [])[1] || "-1")
      : arm.run === "caseflip"
      ? ((/caseflip: (\d+ passed, \d+ failed)/.exec(out) || [])[1] || "-1")
      : ((/check-refusal-codes: (\d+ failures?|every code a surface can receive)/.exec(out) || [])[1] || "-1");
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
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · ${arm.run} · declared ${arm.declared} · got ${got} `
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
  if (clean) fs.rmSync(path.join(REPO, ".ui81-harness"), { recursive: true, force: true });
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}`).join(" · ")}`);
console.log(`several-cases-choice.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
