#!/usr/bin/env node
/* FW-20's NEGATIVE CONTROLS, in one step: `node civicos-ui/test/nc-fw20.mjs [arm]` from the
 * REPO ROOT.
 *
 * Every arm EDITS THE REAL SOURCE (`docprofile/doctypes/staff-directory.mjs`), is armed
 * ALONE with the others held open, runs the THREE suites that read it —
 * `civicos-ui/test/staff-directory.test.mjs`, `civicos-ui/test/doctype-breadth.test.mjs`
 * and `bio-plane/test/staff-directory-e2e.test.mjs` (the real plane with the committed
 * pdf-worker bundle) — and is restored by `cp` from a UNIQUELY-NAMED per-arm pristine copy
 * inside this worktree, verified by sha256 AND by `cmp`, with the byte count printed and
 * floored. Never `git checkout --`, which restores HEAD and discards uncommitted work.
 *
 * Each arm DECLARES, before it is armed, the assertion that MUST fail — BY NAME, as the
 * suite prints it — and the suites that MUST stay green. A suite that fails at a
 * DIFFERENT assertion than declared is reported NOT AS DECLARED: a control that breaks
 * something else refutes nothing.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36 — shared, for its side effect */
import { spawnSync } from "child_process";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const ROOT = path.resolve(new URL("../../", import.meta.url).pathname);
const PEN = path.join(ROOT, ".fw20-pen");
const SUBJECT = path.join(ROOT, "docprofile", "doctypes", "staff-directory.mjs");
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const SUITES = {
  ui: ["node", ["civicos-ui/test/staff-directory.test.mjs"], ROOT],
  breadth: ["node", ["civicos-ui/test/doctype-breadth.test.mjs"], ROOT],
  e2e: ["node", ["test/staff-directory-e2e.test.mjs"], path.join(ROOT, "bio-plane")],
};

const DECIDE = "    if (atDomain < DIRECTORY_FLOOR || atDomain / all.length < ONE_ORGANISATION)\n      return { match: false, confidence: CONFIDENCE.NONE };";
const FENCE = "    if (dates >= Math.max(3, atDomain / 2)) return { match: false, confidence: CONFIDENCE.NONE };";
const ARMS = {
  baseline: { why: "nothing armed. ALL THREE suites MUST be green.", find: null, mustFail: {}, green: ["ui", "breadth", "e2e"] },
  decide: {
    why: "THE DECIDING LEG NEUTERED — density-at-one-organisation always refuses. MUST-FAIL: the UI suite at "
       + "`directory_nss: reads as staff_directory`, and the plane at `the content-type registry chose staff_directory`. "
       + "MUST-STAY GREEN: doctype-breadth (the five landed types do not rest on this leg).",
    find: DECIDE,
    repl: "    if (true)\n      return { match: false, confidence: CONFIDENCE.NONE };",
    mustFail: { ui: "FAIL directory_nss: reads as staff_directory (got generic)",
                e2e: "FAIL  the content-type registry chose staff_directory" },
    green: ["breadth"],
  },
  reference: {
    why: "THE ARM THIS CLASS NEEDS — reference-as-membership. The schedule fence removed, so a document whose every "
       + "row REFERENCES a staff member at the City's domain is read as a directory. MUST-FAIL: the UI suite at "
       + "`neg_schedule: does NOT read as staff_directory`, and the plane at `and it is not a staff_directory`. "
       + "MUST-STAY GREEN: doctype-breadth; and in the plane the directory itself still reads as one.",
    find: FENCE,
    repl: "    if (false && dates >= Math.max(3, atDomain / 2)) return { match: false, confidence: CONFIDENCE.NONE };",
    mustFail: { ui: "FAIL neg_schedule: does NOT read as staff_directory (got staff_directory)",
                e2e: "FAIL  and it is not a staff_directory" },
    mustPass: { e2e: "PASS  the content-type registry chose staff_directory" },
    green: ["breadth"],
  },
  oneorg: {
    why: "THE LIAR'S PASS — the one-organisation share removed, so 'a list of people with addresses' is enough. "
       + "MUST-FAIL: the UI suite at `neg_candidates: does NOT read as staff_directory`. MUST-STAY GREEN: "
       + "doctype-breadth and the plane suite (neither holds a heterogeneous-domain list).",
    find: DECIDE,
    repl: "    if (atDomain < DIRECTORY_FLOOR)\n      return { match: false, confidence: CONFIDENCE.NONE };",
    mustFail: { ui: "FAIL neg_candidates: does NOT read as staff_directory (got staff_directory)" },
    green: ["breadth", "e2e"],
  },
  overstrict: {
    why: "OVER-STRICTNESS — the schedule fence re-spelled against ALL of the document's addresses rather than the "
       + "organisation's, an equally faithful reading of principle (3). MUST-STAY GREEN: all three suites.",
    find: FENCE,
    repl: "    if (dates >= Math.max(3, all.length / 2)) return { match: false, confidence: CONFIDENCE.NONE };",
    mustFail: {},
    green: ["ui", "breadth", "e2e"],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).filter(([, a]) => a.find).map(([arm, a]) => ({ arm, file: SUBJECT, find: a.find, put: a.repl })));

function run(name) {
  const [cmd, args, cwd] = SUITES[name];
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  return { status: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

fs.mkdirSync(PEN, { recursive: true });
const only = process.argv[2];
if (only && !ARMS[only]) { console.error(`no such arm: ${only}`); process.exit(2); }
const names = only ? ["baseline", only].filter((x, i, a) => a.indexOf(x) === i) : Object.keys(ARMS);
const pristineSha = sha(SUBJECT);
console.log(`subject ${path.relative(ROOT, SUBJECT)} sha256 ${pristineSha} (${fs.statSync(SUBJECT).size} bytes)`);

let bad = 0;
for (const name of names) {
  const arm = ARMS[name];
  console.log(`\n=== arm ${name} ===\n  DECLARED: ${arm.why}`);
  const copy = path.join(PEN, `staff-directory.${name}.pristine.mjs`);
  let armed = false;
  if (arm.find) {
    fs.copyFileSync(SUBJECT, copy);
    const src = fs.readFileSync(SUBJECT, "utf8");
    const count = src.split(arm.find).length - 1;
    /* AN ARM THAT DID NOT ARM IS A FINDING, not a pass: the anchor must occur exactly once. */
    if (count !== 1) { console.log(`  NOT ARMED: the anchor occurs ${count} time(s)`); bad++; fs.rmSync(copy); continue; }
    fs.writeFileSync(SUBJECT, src.replace(arm.find, arm.repl));
    armed = sha(SUBJECT) !== pristineSha;
    console.log(`  armed: ${armed} (sha256 now ${sha(SUBJECT).slice(0, 16)}…)`);
    if (!armed) { bad++; }
  }
  try {
    for (const s of Object.keys(SUITES)) {
      const r = run(s);
      const firstFail = (r.out.split("\n").find((l) => /^\s*FAIL\b/.test(l)) || "").trim();
      const want = arm.mustFail[s];
      let verdict;
      if (want) verdict = r.status !== 0 && firstFail === want.trim() ? "FAILED AS DECLARED" : "NOT AS DECLARED";
      else if (arm.green.includes(s)) verdict = r.status === 0 ? "GREEN AS DECLARED" : "NOT AS DECLARED";
      else verdict = "undeclared";
      if (arm.mustPass && arm.mustPass[s] && !r.out.includes(arm.mustPass[s])) verdict = "NOT AS DECLARED (must-pass line absent)";
      if (verdict.startsWith("NOT") || verdict === "undeclared") bad++;
      console.log(`  ${s.padEnd(8)} exit ${r.status}  ${verdict}${firstFail ? `  — first: ${firstFail}` : ""}`);
    }
  } finally {
    if (arm.find) {
      fs.copyFileSync(copy, SUBJECT);
      const same = sha(SUBJECT) === pristineSha
        && spawnSync("cmp", ["-s", copy, SUBJECT]).status === 0;
      const bytes = fs.statSync(SUBJECT).size;
      console.log(`  restored: sha256 ${same ? "IDENTICAL" : "DIFFERS"} and cmp ${same ? "equal" : "UNEQUAL"} · ${bytes} bytes`);
      if (!same || bytes < 5000) { console.error("  RESTORE FAILED — stop"); process.exit(3); }
      fs.rmSync(copy);
    }
  }
}
fs.rmSync(PEN, { recursive: true, force: true });
console.log(`\n${names.length} arm(s) run, ${bad} not as declared; subject sha256 ${sha(SUBJECT) === pristineSha ? "unchanged" : "CHANGED"}`);
process.exit(bad ? 1 : 0);
