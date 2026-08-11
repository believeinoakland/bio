/* CASE-2 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — `d280-strengthbar.control.mjs`'s precedent,
 * `severedhomes.control.mjs` before it, PL-3's `suggest.control.mjs` before that.
 *
 * THE PEN LIVES INSIDE THIS WORKTREE and never in a shared scratchpad (PL-10:
 * two workers wrote a harness to the same scratchpad path and the second
 * replaced the first BETWEEN arming and restoring). `.case2-harness/` is
 * gitignored for the reason written at the ignore line.
 *
 * EVERY RESTORE IS VERIFIED THREE WAYS — by sha256, by CONTENT, and by `cmp`
 * against a per-arm pristine copy named with the ARM ID as well as the path,
 * plus a pristine-of-record taken before any arm ran.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and every
 * arm DECLARES BEFORE IT RUNS what must fail and what must NOT.
 *
 * ---- WHY THE PAIR IN ARMS (D) AND (E) IS THE ITEM
 *
 * DEC-72 clause 4 has two halves and they fail in OPPOSITE directions. (D)
 * removes the bar comparison, so a load-bearing finding below the project's
 * standard publishes. (E) removes the EXEMPTION, so the bar is asked of every
 * member — which is Bob's DEC-71 input read backwards and would pressure a
 * member into severing a true citation to publish. **A suite holding only (D)'s
 * arm would pass under (E)'s bug**, and a gate that refuses everything looks
 * identical to a gate that works if you only ever check that it refuses. That is
 * D-280's recorded lesson (*"the one failure is the over-strictness arm WITH THE
 * HEADLINE STILL PASSING"*) applied to this item's own shape.
 *
 * ---- AND (G) IS THE REMOVAL'S OWN CONTROL
 *
 * What this item REMOVES matters as much as what it adds, and a removal proved
 * by "the op stopped answering" is not proved. (G) restores a composition inside
 * `#projectBar` — the shape a future session would reach for if it wanted the
 * group default back as a fallback — and the removal arms in §7 are what catch
 * it. A behavioural arm alone cannot: the composition would answer correctly for
 * every project that declares its own bar.
 *
 * Run it:  node test/caseproduction.control.mjs [armId]
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { store: ROOT + "src/store.mjs", index: ROOT + "src/index.mjs" };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));
const ONLY = process.argv[2] || null;

/* THE FLOOR ON THE PRISTINE COPIES. A harness in this estate has reported a
   restore byte-identical over an EMPTY manifest, caught only because a digest
   read `e3b0c442…` — the sha256 of the empty string. Sizes are printed and
   floored before anything is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 2000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.case2-harness";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* A suite that THREW has NO tally and is reported as `-1` rather than `0`: a
     thrown module and a module with zero failures are different claims, and a
     TypeError inside an assertion goes through no assertion at all while the
     tally reads clean (D-93). */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 200));
  return m ? { pass: +m[1], fail: +m[2], named, out }
           : { pass: -1, fail: -1, named, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${armId})`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k} (arm ${armId})`);
    execFileSync("cmp", ["-s", p, join(PEN, `arm${armId}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${now.length} bytes restored, verified by sha256, by content, and by cmp x2`);
  }
}

function arm(id, title, edits, suites, expectGreen = false) {
  if (ONLY && ONLY !== id) return;
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  let wrong = false;
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    let totalFail = 0;
    for (const s of suites) {
      const r = runSuite(s.name);
      console.log(`  MEASURED ${s.name}: ${r.pass} pass, ${r.fail} fail`
        + `${r.fail === -1 ? "  ** NO TALLY — the suite THREW rather than failing, reported as -1" : ""}`);
      for (const n of r.named) console.log(`    FAILED: ${n}`);
      totalFail += Math.max(0, r.fail);
      const hit = (frag) => r.named.some((n) => n.includes(frag));
      for (const frag of (s.mustFail || []))
        if (!hit(frag) && r.fail !== -1) { console.log(`  ** WRONG: in ${s.name}, expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
      for (const frag of (s.mustNotFail || []))
        if (hit(frag)) { console.log(`  ** WRONG: in ${s.name}, "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
      if (r.fail === -1) { console.log(`  ** WRONG: ${s.name} produced no tally at all`); wrong = true; }
    }
    if (expectGreen) {
      if (totalFail !== 0) { console.log("  ** WRONG: this arm was DECLARED green and something failed"); wrong = true; }
      else console.log("  as declared: GREEN — and the green is the RESULT, not a pass. See the arm's own note.");
    } else if (totalFail === 0) {
      console.log("  ** WRONG: every suite stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nCASE-2 — negative controls. THE BASELINE FIRST, so every arm is a DELTA and so a run in\n"
          + "which every arm is broken is distinguishable from one in which every arm works.");
const OWN = "caseproduction.test.mjs", PUB = "publish.test.mjs", D280 = "d280-strengthbar.test.mjs";
if (!ONLY) {
  for (const n of [OWN, PUB, D280]) {
    const b = runSuite(n);
    console.log(`  BASELINE ${n}: ${b.pass} pass, ${b.fail} fail`);
    if (b.fail !== 0) {
      console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
      process.exit(1);
    }
  }
}

/* ============================================================ (A) THE PROJECT-LESS PATH */
arm("A", "THE PROJECT-LESS PUBLICATION PATH, PUT BACK — CASE-1's handed-over arm, and the one that "
  + "makes `cases.project_id NOT NULL` real through an OP rather than only in the schema. "
  + "DECLARED: §2's refusal arm MUST fail. §3's owner arms MUST stay green — armed apart on purpose, "
  + "because one fence covering for another is how a half-fix reads as a whole one.",
  [["store", `    if (!proj)\n      return { ok: false, reason: "NO_PUBLISHING_PROJECT",`,
             `    if (false)\n      return { ok: false, reason: "NO_PUBLISHING_PROJECT",`]],
  [{ name: OWN,
     mustFail: ["A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME"],
     mustNotFail: ["A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR"] }]);

/* ================================================================ (B) THE OWNER FENCE */
arm("B", "THE OWNER FENCE NEUTERED — any member holding `publish` publishes another project's "
  + "production. DECLARED: §3's non-owner arm and its wrong-project sibling MUST fail. §2 and §5 "
  + "MUST stay green.",
  [["store", `    if (!this.#isProjectOwner(proj, who))`, `    if (false)`]],
  [{ name: OWN,
     mustFail: ["A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED",
                "AND OWNERSHIP IS OF A PROJECT, NOT A STANDING"],
     mustNotFail: ["A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR"] }]);

/* ================================================= (C) THE LOAD-BEARING MINIMUM */
arm("C", "DEC-72's SECOND RULED DEFAULT REMOVED — an all-supporting case publishes, asserting "
  + "nothing conclusively while its completeness assertion claims coverage of a question no member "
  + "answers. DECLARED: §4's all-supporting arm and §6's VACUITY GUARD MUST fail. §5's pair MUST "
  + "stay green, because a case WITH a load-bearing member is untouched by this arm.",
  [["store", `    if (!loadBearing.length)`, `    if (false)`]],
  [{ name: OWN,
     mustFail: ["AN ALL-SUPPORTING CASE IS REFUSED", "VACUITY GUARD"],
     mustNotFail: ["A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR"] }]);

/* ============================================ (D) THE BAR COMPARISON — HALF THE SHAPE */
arm("D", "THE BAR STOPS BEING ASKED AT ALL — a load-bearing member below the project's standard "
  + "publishes. DECLARED: §5's REFUSAL arm and §6's same-refusal arm MUST fail. **§5's SUPPORTING "
  + "arm and §6's lowered-bar arm MUST stay GREEN**, which is what distinguishes 'the gate works' "
  + "from 'the gate refuses everything' and is the whole reason (D) and (E) are separate.",
  [["store", `    if (bar.declared) {\n      const rank = (g) => BASIS_GRADES.indexOf(g);`,
             `    if (false) {\n      const rank = (g) => BASIS_GRADES.indexOf(g);`]],
  [{ name: OWN,
     mustFail: ["A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED",
                "a load-bearing member below the bar is refused HERE TOO"],
     mustNotFail: ["THE SAME FINDING, THE SAME GRADES, THE SAME BAR",
                   "THE PROJECT LOWERS ITS OWN BAR ON THE RECORD"] }]);

/* ======================== (E) THE EXEMPTION — THE OTHER HALF, AND THE ONE FORGOTTEN */
arm("E", "THE SUPPORTING EXEMPTION REMOVED — the bar is asked of EVERY member, which is Bob's "
  + "DEC-71 input read backwards and would pressure a member into severing a true citation to "
  + "publish. DECLARED: §5's SUPPORTING arm and everything downstream of it MUST fail. **§5's "
  + "REFUSAL arm MUST stay GREEN** — an over-strictness arm cannot be read off the headline, which "
  + "is the lesson D-280 paid for and this arm is where this item pays it.",
  [["store", `      for (const m of loadBearing) {`, `      for (const m of memberRoles) {`]],
  [{ name: OWN,
     mustFail: ["THE SAME FINDING, THE SAME GRADES, THE SAME BAR"],
     mustNotFail: ["A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED",
                   "A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME",
                   "A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED"] }]);

/* ==================================================== (F) THE AUTHORED DESIGNATION */
arm("F", "THE ROLE MADE OPTIONAL — an undesignated member falls through, which is a designation by "
  + "OMISSION and exactly what CASE-1 left the column DEFAULT-less to prevent. DECLARED: §4's "
  + "NO_MEMBER_ROLE arm MUST fail. §6's lowered-bar arm MUST stay green.",
  [["store", `      if (!r)\n        return { ok: false, reason: "NO_MEMBER_ROLE",`,
             `      if (false)\n        return { ok: false, reason: "NO_MEMBER_ROLE",`]],
  [{ name: OWN,
     mustFail: ["A MEMBER WITH NO AUTHORED DESIGNATION IS REFUSED"],
     mustNotFail: ["THE PROJECT LOWERS ITS OWN BAR ON THE RECORD"] }]);

/* ============================= (G) THE REMOVAL'S OWN CONTROL — THE COMPOSITION BACK */
arm("G", "THE GROUP DEFAULT RESTORED AS A FALLBACK PUBLICATION BAR — the exact shape DEC-72's "
  + "supersession table removes (*'the project-less publication path … GROUP DEFAULT AS A "
  + "PUBLICATION BAR'*), and the shape a later session would reach for first. DECLARED: §7's "
  + "group-default arm MUST fail, and so must §5's SUPPORTING arm, because the exempt member's "
  + "project acquires a bar it never declared. §2 and §3 MUST stay green — a fence is not what this "
  + "arm touches. **A BEHAVIOURAL ARM ALONE CANNOT SEE THIS**: every project that declares its own "
  + "bar goes on answering correctly, which is why the removal is asserted as ABSENCE off the source.",
  [["store", `    return { declared: false, source: "none", project: projectId, capture: null, connection: null,`,
             `    {\n      const g = this.#one(\`SELECT capture, connection FROM group_strength_bar WHERE group_id=?\`,\n`
           + `        "believe-in-oakland");\n`
           + `      if (g && (g.capture || g.connection))\n`
           + `        return { declared: true, source: "group", project: projectId,\n`
           + `                 capture: g.capture ?? null, connection: g.connection ?? null,\n`
           + `                 detail: "ARMED (CASE-2 control G): the group default as a publication bar." };\n`
           + `    }\n`
           + `    return { declared: false, source: "none", project: projectId, capture: null, connection: null,`]],
  [{ name: OWN,
     mustFail: ["THE GROUP DEFAULT IS NOT A PUBLICATION BAR"],
     mustNotFail: ["A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME",
                   "A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED"] }]);

/* ================== (H) THE RATIFY COMMIT TAKEN OFF THE SIGNED BYTES */
arm("H", "THE `cases` ROW COMMITTED FROM A REQUEST RATHER THAN FROM THE SIGNED DOCUMENT — the "
  + "control plane stops reading `case_project` out of the ratified frontmatter. DECLARED: §8's "
  + "committed-from-bytes arms MUST fail. **EVERY ACT-SIDE ARM IN §2–§6 MUST STAY GREEN, WHICH IS "
  + "THE POINT**: the ceremony goes on refusing correctly while the record commits an attribution "
  + "no signature covers, and a reader cannot tell the two apart.",
  [["index", `      const caseProject = caseId && typeof ratifiedFm.case_project === "string"\n`
           + `        && ratifiedFm.case_project !== "null" ? ratifiedFm.case_project : null;`,
             `      const caseProject = caseId ? "PROJ-ARMED-CASE2-CONTROL-H" : null;`]],
  [{ name: OWN,
     mustFail: ["THE `cases` ROW IS WRITTEN, AND IT NAMES THE PUBLISHING PROJECT"],
     mustNotFail: ["A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME",
                   "A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR",
                   "A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED"] }]);

console.log(`\n==== ${armsRun} arm(s) run, ${armsWrong} NOT AS DECLARED.`);
console.log("Every file restored and verified by sha256, by content and by cmp against BOTH a per-arm\n"
          + "pristine copy and the pristine-of-record taken before any arm ran.");
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong ? 1 : 0);
