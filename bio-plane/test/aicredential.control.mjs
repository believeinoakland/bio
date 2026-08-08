/* PL-11 / IS-5 / D-199 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's and PL-4's precedent.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, and every
 * restore is verified BY CONTENT as well as BY HASH.
 *
 * ARM (1) IS DEC-55.5'S SECOND HALF AND IT HAS NEVER BEEN RUN IN THIS PROJECT.
 * The ruling is that minting an `ai` credential must make every `MACHINE_CANNOT_*`
 * fire BY NAME **and that removing the predicate makes them all pass**. The
 * first half is the suite's block 8 and needs no edit here — a member authors a
 * broad scope on the record, the gate admits it, and twelve refusals fire. The
 * second half is what proves those twelve are LOAD-BEARING rather than
 * incidental, and it is one edit because REC-46 collapsed eleven hand-typed
 * sites into ONE predicate. D-199 (5) claims exactly that; this measures it.
 *
 * A NOTE ON WHAT "THEY ALL PASS" MEANS, because the loose reading would be a
 * control asserting nothing. The claim is that NONE of the twelve acts is
 * refused with a `MACHINE_CANNOT_*` reason any more — the fence is gone. Whether
 * a given act then SUCCEEDS or fails for an unrelated reason (a task that does
 * not exist, a bundle in the wrong state) is a different fact and is reported
 * rather than asserted. The arm prints what each act answered instead.
 *
 * THE TRAP THE DESIGN RECORDED, AND WHY BLOCK 8 IS BUILT THE WAY IT IS: a
 * credential refused at the CREDENTIAL layer absorbs a control aimed at a lower
 * layer. PL-2 ran the three-layer version of this. Here the credential layer is
 * held open BY THE RECORD — a member authors a scope naming those ops, which is
 * legitimate because every one of them is an op a member reaches — so nothing
 * has to be patched to reach the identity layer, and the two layers are shown
 * to be independent rather than asserted to be.
 *
 * Run it:  node test/aicredential.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  index: ROOT + "src/index.mjs",
  query: ROOT + "src/query.mjs",
  checks: ROOT + "checks/bio-checks.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 600000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 130));
  /* WIDE ON PURPOSE. Arm (1)'s whole content is WHAT EACH OF THE TWELVE ACTS
     ANSWERED once the fence was gone, and a truncated line would leave the
     record saying "they all passed" without saying what they said instead —
     which is the generous direction and the one this file exists to avoid. */
  const got = [...out.matchAll(/^ {9}got {2}(.+)$/gm)].map((x) => x[1].slice(0, 1200));
  return m ? { pass: +m[1], fail: +m[2], named, got, out } : { pass: null, fail: null, named, got, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in ${key}. `
    + `An unguarded edit would have armed ${n} sites, and a control armed in more places than it claims `
    + `is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll() {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k}`);
  }
}

function arm(title, edits, mustFail, mustNotFail = [], suite = "aicredential.test.mjs") {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite(suite);
    console.log(`  MEASURED (${suite}): ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    for (const g of r.got) console.log(`      got: ${g}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (!r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("PL-11 / IS-5 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite("aicredential.test.mjs");
console.log(`  BASELINE aicredential.test.mjs: ${base.pass} pass, ${base.fail} fail`);
const baseHyg = runSuite("hygiene.test.mjs");
console.log(`  BASELINE hygiene.test.mjs: ${baseHyg.pass} pass, ${baseHyg.fail} fail`);
if (base.fail !== 0 || baseHyg.fail !== 0) {
  console.log("  ** the tree is not whole; arms below would measure the wrong thing");
  process.exit(1);
}

/* ============ (1) DEC-55.5'S SECOND HALF — OWED CONTROL 1 ================ */

arm("(1) **DEC-55.5's SECOND HALF, AND IT HAS NEVER BEEN RUN IN THIS PROJECT.** Remove the machine "
  + "STAMP predicate and every MACHINE_CANNOT_* stops firing for `token:ai` at once. ONE edit, twelve "
  + "refusals, because REC-46 collapsed eleven hand-typed sites into one predicate — asked a day "
  + "earlier this arm would have needed eleven edits and would probably have missed one. "
  + "`isMachineIdentity` is `isMachineStamp` OR a bare class word OR a NON_MEMBER_AUTHORS name, and "
  + "`token:ai` is NEITHER of the latter two, so disarming the stamp arm disarms the whole family for "
  + "this class. That is D-199 (5)'s claim measured rather than restated.",
  [["checks", `export function isMachineStamp(who) {\n  const s = String(who ?? '').trim().toLowerCase();\n  return s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));`,
              `export function isMachineStamp(who) {\n  const s = String(who ?? '').trim().toLowerCase();\n  return false && s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));`]],
  ["every MACHINE_CANNOT_* fires BY NAME on `token:ai`",
   "`token:ai` is caught by the ONE predicate and by nothing else",
   "the AGENT holding it is refused anyway, by the STORE",
   "the MEMBER_TOKEN machine credential is refused BY NAME"],
  /* WHAT MUST SURVIVE: the CREDENTIAL layer is a different fence and does not
     depend on this predicate at all. If the task-scope refusals went red here
     too, the two layers would not be independent and block 8 would be measuring
     one thing twice. */
  ["an `ai` credential calling op=versionaccept is refused BY NAME at the gate",
   "op=publish likewise",
   "every one of the 26 ops no member reaches is refused at the mint, by name"]);

/* ============ (2) THE SCOPE IS READ FROM THE RECORD ====================== */

arm("(2) D-199 (2) — THE SCOPE IS A ROW, NOT A CONSTANT. Make the gate compare against a hardcoded "
  + "list instead of the credential's declared writes. Every arm that drives the INVESTIGATIVE "
  + "credential still passes, because that list happens to be its scope — which is exactly why this "
  + "arm exists: only the credential whose RECORD says something different can tell the two apart, "
  + "and a suite without that arm would have been green over a settings row.",
  [["index", `  if (spec.mutating && !cred.writes.includes(op))`,
              `  if (spec.mutating && !["suggest", "capturerequest"].includes(op))`]],
  ["a credential whose RECORD declares op=versionreject is admitted by the gate",
   "an agent whose record declares op=airunopen opens its own run"],
  ["an `ai` credential calling op=versionaccept is refused BY NAME at the gate",
   "PL-3's endpoint is REACHED and a real `suggested` version lands"]);

/* ============ (3) THE FENCE IS A SHAPE ================================== */

arm("(3) PL-4's DELEGATED CONSTRAINT — THE FENCE IS A SHAPE. Make the member-reach floor answer TRUE "
  + "for everything and `capturerequestdrain` becomes authorable into an agent's scope, along with "
  + "purge and export. The AI would then be able to make the plane fetch on its own timing, which is "
  + "the spine PL-4's own arm (1) protects, arriving through the credential instead of through the "
  + "row state.",
  [["index", `  return !!spec && Array.isArray(spec.classes) && spec.classes.includes("member");`,
              `  return true;`]],
  ["every one of the 26 ops no member reaches is refused at the mint, by name"],
  ["a signed-in member mints",
   "an `ai` credential calling op=versionaccept is refused BY NAME at the gate"]);

/* ============ (4) MINTING IS A MEMBER ACT =============================== */

arm("(4) D-199 (3) — *IF AN AGENT CAN REQUEST A BROADER TOKEN, THE SCOPING IS THEATRE.* Guard the "
  + "mint's identity refusal with `false &&` and every machine credential in the plane can mint "
  + "itself an agent — including an `ai` credential whose authored scope names the mint, which is the "
  + "self-extension the determination exists to prevent. Note what does NOT save it: the class ACL "
  + "keeps probe out, and admin and member tokens sail straight through, so the ACL was never the "
  + "fence here.",
  [["store", `    if (!who || isMachineIdentity(who))\n      return refusal("AI_CREDENTIAL_MINT_NOT_A_MEMBER",`,
              `    if (false && (!who || isMachineIdentity(who)))\n      return refusal("AI_CREDENTIAL_MINT_NOT_A_MEMBER",`]],
  ["the MEMBER_TOKEN machine credential is refused BY NAME",
   "and so is the ADMIN_TOKEN root-of-trust credential",
   "the AGENT holding it is refused anyway, by the STORE",
   "no broader credential was written",
   "every code this family allocates was DRIVEN out of the plane"],
  ["a machine credential cannot withdraw one either"]);

/* ============ (5) THE STATED VIEWER ==================================== */

arm("(5) D-199 (4) IS A MEASUREMENT, NOT A LABEL. Stamp `class:ai` for every agent instead of the "
  + "principal the record declares, and a MEMBER-scoped credential silently becomes an "
  + "instance-level reader: Anna's agent reads Ruth's project. The record would still SAY the "
  + "credential is attributable to Anna while it saw everything the group has — the gap between what "
  + "the record claims about itself and what the code enforces, which is the failure mode this "
  + "project is built to refuse.",
  [["index", `        : cls === "ai" ? aiCred.principal\n        : \`\${MACHINE_CLASS_PREFIX}\${cls}\`);`,
              `        : cls === "ai" ? \`\${MACHINE_CLASS_PREFIX}ai\`\n        : \`\${MACHINE_CLASS_PREFIX}\${cls}\`);`]],
  ["and NOT to a credential whose principal is ANNA, who was never invited"],
  ["Ruth's project is visible to the ORGANISATION-scoped credential",
   "while the shared evidence corpus is visible to all three"]);

/* ============ (6) OVER-STRICTNESS — THESE MUST STAY GREEN ============== */

/* NOT AN `arm()`, because it asserts the ABSENCE of a failure and `arm()`
   requires one. A fence that refuses correct work is a defect in the fence, so
   the tree is re-measured whole and the working arms are named. */
console.log("\n=== (6) OVER-STRICTNESS. The investigative credential must DO ITS WORK: a real "
  + "`suggested` version through PL-3's endpoint, a real row through PL-4's door, reads across the "
  + "project, and an organisation key that is not inert. These are re-measured on the WHOLE tree "
  + "rather than under an edit, and every one must be GREEN.");
{
  armsRun++;
  const r = runSuite("aicredential.test.mjs");
  const want = [
    "PL-3's endpoint is REACHED and a real `suggested` version lands",
    "PL-4's door is REACHED and a request row lands",
    "reads across the project are the floor and need no declaration at all",
    "and the suggestion the agent just wrote is IN that read",
    "Ruth's project is visible to the ORGANISATION-scoped credential",
    "a scope naming EVERY mutating op a member reaches is authorable",
  ];
  const broken = want.filter((w) => r.named.some((n) => n.includes(w)));
  console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail`);
  if (r.fail !== 0 || broken.length) {
    console.log(`  ** WRONG: the fence refuses correct work: ${JSON.stringify(broken)}`);
    armsWrong++;
  } else {
    console.log(`  all ${want.length} named over-strictness arms GREEN — the credential does its work`);
  }
}

/* ====================== the report ======================================= */

console.log(`\n=== ${armsRun} arms run, ${armsWrong} behaved differently from their declaration`);
restoreAll();
console.log("final restore: every file verified by sha256 AND by content");
if (armsWrong) process.exit(1);
