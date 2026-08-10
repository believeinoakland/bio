/* SK-4's NEGATIVE CONTROL HARNESS — SIX ARMS, RUN IN ONE STEP.
 *
 *     node test/skillsequencing.control.mjs          # every arm, plus the baseline
 *     node test/skillsequencing.control.mjs 2        # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, and the
 * battery discovers `*.test.mjs` from the directory — `suggest.control.mjs` set
 * the precedent and SK-2 and SK-3 both followed it.
 *
 * WHAT THIS HARNESS INHERITS FROM ITS TWO PREDECESSORS, because each addition
 * was earned by a defect rather than chosen:
 *
 *   - SK-2's arm shape: `mustFail` fragments declared BEFORE the arm runs, and
 *     every restore verified by CONTENT as well as by sha256 against a pristine
 *     copy taken before the edit.
 *   - SK-3's `mustStayGreen`: an asymmetry nobody STATED is an asymmetry nobody
 *     measured. Arm (1) removes the fence and NAMES the skill-side arms that
 *     must survive it, because "the skill would have passed it" is unfalsifiable
 *     unless the green side is asserted rather than observed.
 *   - D-282's capture-to-a-FILE: the suite's `process.exit()` discards unflushed
 *     PIPE writes on darwin, and a control that read a tally off a pipe once
 *     reported `-1`. Every run below goes to a file and is read back.
 *
 * ONE ARM EDITS A FILE OUTSIDE THIS AREA'S PATHS (`agent-worker/src/harness.mjs`,
 * FL-3's). That is not a claim on the path: the edit is transient, armed alone,
 * inside one worktree, and restored byte-identically before the process exits —
 * and there is no other way to prove that what refuses an investigate-mode
 * launch is FL-3's row rather than this area's text.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const REPO = join(PLANE, "..");
const DOCTRINE = join(PLANE, "src", "skilldoctrine.mjs");
const HARNESS = join(REPO, "agent-worker", "src", "harness.mjs");
const SUITE = join(HERE, "skillsequencing.test.mjs");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const SINK = mkdtempSync(join(tmpdir(), "sk4-control-"));

/** Run the suite, capturing to a FILE (D-282), and return `{ pass, fail, out }`.
 *  A tally that cannot be read comes back as -1 rather than as zero — D-93's
 *  rule, because a suite reporting no count is not a suite reporting success. */
function runSuite(tag) {
  const outPath = join(SINK, `${tag}.txt`);
  let out = "";
  /* `; true` so a RED suite's exit 1 is not an exception here — a red suite is
     the expected outcome of most arms below and must not abort the harness. */
  execFileSync("sh", ["-c",
    `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(outPath)} 2>&1; true`],
    { cwd: PLANE, encoding: "utf8" });
  try { out = readFileSync(outPath, "utf8"); } catch { out = ""; }
  const m = out.match(/skillsequencing:\s+(\d+)\s+pass,\s+(\d+)\s+fail/);
  return { pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, out };
}

/** Which ARM ids the run reported as FAIL, in the order they were printed. */
const failedArms = (out) =>
  [...out.matchAll(/^\s*FAIL\s+(ARM [A-Z]\d+[a-z]?)/gm)].map((m) => m[1]);
const greenArms = (out) =>
  new Set([...out.matchAll(/^\s*PASS\s+(ARM [A-Z]\d+[a-z]?)/gm)].map((m) => m[1]));

const ARMS = [
  {
    id: "1",
    title: "REMOVE FL-3's GATE — the row's own arm, and the item's whole point",
    file: HARNESS,
    /* The gate branch stops reading the flag. Everything else — the MODES table,
       the row, the record, every word of the skill — is untouched. */
    edit: (s) => s.replace("if (!mode || !mode.deployed)", "if (false && (!mode || !mode.deployed))"),
    /* DECLARED AS FIVE AFTER THE FIRST RUN MEASURED FIVE AGAINST A DECLARATION OF
       THREE, and the two extra are kept rather than smoothed because they are
       the stronger half. D2 is the DISCRIMINATION — with the gate gone the
       deployed and the undeployed mode answer alike, so the arm that says the
       refusal costs something to produce is the arm that notices first. D5 is
       the terminator: no gate, no `cancelled`, so the finding it pins has
       nothing to pin. Under-declaring them would have credited this arm with
       less than it does. */
    mustFail: ["ARM D1", "ARM D2", "ARM D3", "ARM D4", "ARM D5"],
    mustStayGreen: ["ARM A1", "ARM A2", "ARM A3", "ARM A4", "ARM A5",
                    "ARM C1", "ARM C2", "ARM C3", "ARM F1", "ARM F2"],
    why: "The sequencing is still recorded, still verbatim, still cites the row — and refuses "
       + "nothing, which is what it was always doing. That asymmetry IS the row's proof.",
  },
  {
    id: "2",
    title: "THE FLAG FLIPPED WITHOUT THE RECORD MOVING",
    file: HARNESS,
    edit: (s) => s.replace("investigate: { deployed: false,", "investigate: { deployed: true,"),
    /* FIVE, MEASURED. Flipping the flag does not merely trip the tripwire — it
       genuinely OPENS the gate, so every arm in BLOCK D that distinguishes a
       refused launch from an allowed one moves with it. That is the correct
       reading of this arm and the reason it is the one to run before believing
       any future enablement. */
    mustFail: ["ARM B4", "ARM D1", "ARM D2", "ARM D4", "ARM D5"],
    mustStayGreen: ["ARM A3", "ARM B3", "ARM C3"],
    why: "This is the shape a real VF-4 enablement takes. When it fires legitimately the record "
       + "moves in the same commit as the flag and both arms go green again — which is the only "
       + "way a deployment cannot change the order quietly.",
  },
  {
    id: "3",
    title: "THE ORDER REVERSED IN THE RECORD ONLY",
    file: DOCTRINE,
    edit: (s) => s.replace('order: ["check", "investigate"],', 'order: ["investigate", "check"],'),
    mustFail: ["ARM A3", "ARM A4", "ARM B4"],
    mustStayGreen: ["ARM A1", "ARM D1", "ARM C3"],
    why: "A3 and A4 are why the DOCUMENT is the expectation: each parses the first-deployed mode "
       + "out of a DIFFERENT document's own sentence, so neither can be satisfied by editing the "
       + "array it checks. The blind form — order[0] === first_deployed_mode — moves both sides "
       + "together and proves nothing, which is what SK-2's arm (5) and SK-3's arm (3) each found.",
  },
  {
    id: "4",
    title: "A MODE ADDED TO THE HARNESS AND NOT RECORDED",
    file: HARNESS,
    edit: (s) => s.replace("export const MODES = {",
                           'export const MODES = {\n  triage:      { deployed: false, does: "a third mode nobody recorded" },'),
    mustFail: ["ARM B3", "ARM B4"],
    mustStayGreen: ["ARM A3", "ARM D1", "ARM D2"],
    why: "The set is held in BOTH directions. The one-directional form — every recorded mode "
       + "exists in the table — is blind to this by construction.",
  },
  {
    id: "5",
    title: "A GATE WRITTEN INTO THE DOCTRINE",
    file: DOCTRINE,
    edit: (s) => s.replace("export const GATE_ADDRESS = {",
                           "const LOCAL_MODES = { check: { deployed: true }, investigate: { deployed: false } };\n"
                         + "export function gateLocally(m) { const mode = LOCAL_MODES[m]; return !mode || !mode.deployed ? \"close\" : \"go\"; }\n"
                         + "export const GATE_ADDRESS = {"),
    mustFail: ["ARM C3"],
    mustStayGreen: ["ARM C1", "ARM C2", "ARM C3b", "ARM D1", "ARM B4"],
    why: "§14b.4 does not exempt a deployment record from the rule that a skill may never hold a "
       + "gate, and a discrimination stops discriminating the moment both files answer alike.",
  },
  {
    id: "6",
    title: "THE INSTRUMENT ITSELF — neuter the gate detector, sources untouched",
    file: SUITE,
    edit: (s) => s.replace('{ name: "a deployed flag", re: /\\bdeployed\\s*[:=]/ }',
                           '{ name: "a deployed flag", re: /\\bnothingmatchesthis\\b/ }')
                  .replace('{ name: "a mode vocabulary", re: /\\bMODES\\b\\s*=|\\bMODES\\s*\\[/ }',
                           '{ name: "a mode vocabulary", re: /\\bnothingmatchesthis\\b/ }')
                  .replace('{ name: "a refusal branch on a mode", re: /\\bmode\\b[^\\n]{0,60}\\bdeployed\\b|\\bdeployed\\b[^\\n]{0,60}\\bmode\\b/ }',
                           '{ name: "a refusal branch on a mode", re: /\\bnothingmatchesthis\\b/ }'),
    mustFail: ["ARM C3", "ARM C3b"],
    mustStayGreen: ["ARM C1", "ARM D1", "ARM B4"],
    why: "A detector that finds nothing passes every corpus. C3 and C3b are paired precisely so "
       + "the detector cannot go blind while reporting green — the shape of every walk in this "
       + "repository that has done exactly that.",
  },
];

const only = process.argv[2];
const selected = only ? ARMS.filter((a) => a.id === only) : ARMS;

console.log("SK-4 — skillsequencing negative control\n");
const base = runSuite("baseline");
console.log(`(0) BASELINE, clean tree: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) {
  console.log("    THE BASELINE IS NOT GREEN. Every arm below would be uninterpretable; stopping.");
  rmSync(SINK, { recursive: true, force: true });
  process.exit(1);
}

let wrong = 0;
for (const arm of selected) {
  const before = readFileSync(arm.file, "utf8");
  const beforeSha = sha(arm.file);
  const after = arm.edit(before);
  if (after === before) {
    console.log(`\n(${arm.id}) ${arm.title}\n    THE EDIT DID NOT APPLY — the source it targets has moved. `
              + `An arm that silently no-ops is worse than an arm that fails, so this counts as WRONG.`);
    wrong++;
    continue;
  }
  writeFileSync(arm.file, after);
  const r = runSuite(`arm${arm.id}`);
  writeFileSync(arm.file, before);

  const restoredSha = sha(arm.file);
  const restoredOk = restoredSha === beforeSha && readFileSync(arm.file, "utf8") === before;

  const failed = failedArms(r.out);
  const green = greenArms(r.out);
  const missedFail = arm.mustFail.filter((a) => !failed.includes(a));
  const extraFail = failed.filter((a) => !arm.mustFail.includes(a));
  const brokeGreen = arm.mustStayGreen.filter((a) => !green.has(a));
  const asDeclared = !missedFail.length && !extraFail.length && !brokeGreen.length;
  if (!asDeclared) wrong++;

  console.log(`\n(${arm.id}) ${arm.title}`);
  console.log(`    -> ${r.pass} pass, ${r.fail} fail · FAILED: ${failed.join(", ") || "(none)"}`);
  console.log(`    declared must-fail: ${arm.mustFail.join(", ")}`
            + (missedFail.length ? `  · NOT FAILED: ${missedFail.join(", ")}` : "")
            + (extraFail.length ? `  · ALSO FAILED (undeclared): ${extraFail.join(", ")}` : ""));
  console.log(`    declared must-stay-green: ${arm.mustStayGreen.length} arm(s)`
            + (brokeGreen.length ? `  · BROKE: ${brokeGreen.join(", ")}` : "  · all held"));
  console.log(`    restore: sha256 ${restoredOk ? "EQUAL and content IDENTICAL" : "MISMATCH — INVESTIGATE"} `
            + `(${beforeSha.slice(0, 8)}…, ${before.length} bytes)`);
  console.log(`    ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED — the finding is the difference, not the arm"}`);
  console.log(`    why: ${arm.why}`);
}

console.log(`\n${selected.length} arm(s) run, ${wrong} behaved other than declared.`);
rmSync(SINK, { recursive: true, force: true });
process.exit(wrong ? 1 : 0);
