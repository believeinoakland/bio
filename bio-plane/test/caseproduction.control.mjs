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
import { preflight } from "../scripts/armdecay.mjs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
/* D-450 (2026-09-25): `checks` joins the restored set — arm (J) arms C-41.12 in the catalogue. */
const F = { store: ROOT + "src/store.mjs", index: ROOT + "src/index.mjs", checks: ROOT + "checks/bio-checks.mjs" };
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

/* ------------------------------------------------- D-331 · ARMS ARE QUEUED NOW
   2026-09-14. This driver used to ARM AND RUN at each call site, in file order,
   and `edit()` THROWS on a zero-match anchor — so one dead anchor ended the
   process and every arm after it went unrun and unreported. M0-25's census
   measured exactly that on this driver's family, and D-331's ruling is that a
   throwing driver VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING.

   `arm()` now only REGISTERS. `runAll()` below counts every registered arm's
   anchors in the file that arm will write, prints the whole table, and only then
   runs them — in the same order, with the same edits, the same suites and the
   same declarations. **The throw is kept**: nothing arms if an anchor belonging
   to an arm this invocation would run is not live, because the alternative
   (record the miss and carry on) measures the next arm against whatever the
   failed patch left behind, and arms A and B here both write `store`. */
const QUEUE = [];
function arm(id, title, edits, suites, expectGreen = false) {
  QUEUE.push({ id, title, edits, suites, expectGreen });
}

function runArm(id, title, edits, suites, expectGreen = false) {
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
/* THIS DECLARATION CAME BACK WRONG ON ITS FIRST RUN AND THE ARM WAS RIGHT.
   RECORDED HERE RATHER THAN QUIETLY REWRITTEN (D-282's precedent, and it is the
   third time in two days an arm has corrected its own declaration).

   It originally demanded that §5's pair stay GREEN. **That is impossible by
   construction, and realising why is worth more than the arm was.** This fence's
   whole job is to stop a STATE CHANGE: with it neutered, RUTH's publish in §3
   SUCCEEDS, INQ_STRONG moves to `published`, and every act after it meets a case
   that has already moved — so §5 goes red as a CASCADE rather than because the
   bar comparison broke. An arm that removes a fence cannot also promise the
   record is untouched downstream of it.

   THE SAME FIRST RUN FOUND A DEFECT IN THE SUITE, NOT IN THE PLANE: §5 read
   `ok.findings.length` off a refusal and threw, so the suite reported NO TALLY
   beside twelve correctly-named failures — a crash NAMES NOTHING, and the
   control's own finding was destroyed by the way the suite read. §5 and §6 now
   read defensively and this arm reports named failures with a tally. */
arm("B", "THE OWNER FENCE NEUTERED — any member holding `publish` publishes another project's "
  + "production. DECLARED: §3's non-owner arm and its wrong-project sibling MUST fail. §2 MUST stay "
  + "green, because it runs BEFORE the record moves. **§5 IS NOT DECLARED EITHER WAY** and the "
  + "reason is above: this arm changes the state of the record, so everything downstream of §3 is "
  + "measuring a different fixture and a promise about it would be a promise about a cascade.",
  [["store", `    if (!this.#isProjectOwner(proj, who))`, `    if (false)`]],
  [{ name: OWN,
     mustFail: ["A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED",
                "AND OWNERSHIP IS OF A PROJECT, NOT A STANDING"],
     mustNotFail: ["A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME"] }]);

/* ================================================= (C) THE LOAD-BEARING MINIMUM */
/* THIS ARM AND (D) BOTH CAME BACK NOT AS DECLARED ON THE SECOND RUN, AND THE
   ARMS WERE RIGHT WHILE THE SUITE'S FIXTURE WAS WRONG. Recorded rather than
   softened, and the correction is in the SUITE rather than in this paragraph.

   THE MECHANISM, WHICH IS GENERAL AND WORTH CARRYING: an arm that turns one of
   this item's REFUSALS into a SUCCESS MOVES THE RECORD. The act publishes, its
   members leave `concluded`, and every later act meets a case that has already
   happened — so assertions downstream fall as a CASCADE rather than because
   their own subject broke. Arms that ADD a refusal (E, F) do not have this
   problem, which is why only the removal arms were affected.

   It mattered most exactly where it hurt most: under (D) the cascade brought
   down §5's ACCEPTANCE arm, which is the one arm that distinguishes "the gate
   works" from "the gate refuses everything". **A control that destroys the
   measurement it exists to protect is worth fixing at the fixture, not at the
   declaration.** §4's all-supporting act and §5's refusal act now run on their
   OWN members (`INQ_SUPP_*`, `INQ_BAR_*`), so these arms are independent rather
   than merely declared independent. */
arm("C", "DEC-72's SECOND RULED DEFAULT REMOVED — an all-supporting case publishes, asserting "
  + "nothing conclusively while its completeness assertion claims coverage of a question no member "
  + "answers. DECLARED: §4's all-supporting arm and §6's VACUITY GUARD MUST fail. §5's pair MUST "
  + "stay green — which is TRUE ONLY BECAUSE §4's act now runs on its own members; before that "
  + "fixture split this declaration was wrong and the arm said so.",
  /* THE ANCHOR CARRIES ITS REFUSAL NAME, because `if (!loadBearing.length)`
     ALONE OCCURS TWICE in store.mjs and the blind-arming guard refused the arm
     on its first run — which is that guard working, and is why it exists. */
  [["store", `    if (!loadBearing.length)\n      return { ok: false, reason: "NO_LOAD_BEARING_MEMBER",`,
             `    if (false)\n      return { ok: false, reason: "NO_LOAD_BEARING_MEMBER",`]],
  /* M0-78, 2026-09-19 — RE-MEASURED AFTER THIS ARM WAS MADE TO ARM AT ALL, AND THE THIRD FAILURE
     IS DECLARED BECAUSE IT HAPPENS, not because it was predicted. Until today this arm ended in an
     uncaught throw inside the fixture (`caseceremony.mjs:76`) and NONE of the declarations below
     was ever evaluated; the driver said `-1 pass, -1 fail · NOT AS DECLARED` and was right, while
     the suite's control line claimed coverage that did not exist. With the ceremony's ratify-stage
     refusal now SURFACED rather than thrown (see `caseproduction.test.mjs`'s `publish` helper), the
     arm runs and reads 72 pass / 3 fail. Two of the three are the declared pair. The third is §6's
     lowered-bar arm, and it is a CASCADE of exactly the kind this arm's own note above describes:
     with the load-bearing refusal gone, the all-supporting act PUBLISHES and moves the record §6
     then reads. It is written into the declaration rather than left as an undeclared extra, because
     an arm whose real effect is wider than its declaration is a control that has stopped describing
     itself — and the fixture split that contained the OTHER cascade (§5's) is what makes it safe to
     name this one precisely instead of loosening the whole arm. */
  [{ name: OWN,
     mustFail: ["AN ALL-SUPPORTING CASE IS REFUSED", "VACUITY GUARD",
                "THE PROJECT LOWERS ITS OWN BAR ON THE RECORD AND THE SAME CASE PUBLISHES"],
     mustNotFail: ["A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR"] }]);

/* ============================================ (D) THE BAR COMPARISON — HALF THE SHAPE */
arm("D", "THE BAR STOPS BEING ASKED AT ALL — a load-bearing member below the project's standard "
  + "publishes. DECLARED: §5's REFUSAL arm and §6's same-refusal arm MUST fail. **§5's SUPPORTING "
  + "arm and §6's lowered-bar arm MUST stay GREEN**, which is what distinguishes 'the gate works' "
  + "from 'the gate refuses everything' and is the whole reason (D) and (E) are separate. Those two "
  + "MUST-STAY-GREEN clauses are only meaningful because §5's refusal act runs on its OWN members — "
  + "see (C)'s note; before that split this arm published the acceptance act's members out from "
  + "under it and destroyed its own most important measurement.",
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
/* ===== M0-78, 2026-09-19 — THIS ARM'S DECLARATION WAS CORRECTED, NOT EXEMPTED, AND THE OLD ONE
   WAS RIGHT WHEN IT WAS WRITTEN. It read: *"**EVERY ACT-SIDE ARM IN §2–§6 MUST STAY GREEN, WHICH
   IS THE POINT**: the ceremony goes on refusing correctly while the record commits an attribution
   no signature covers."* That described the arm's behaviour on the tree it was written for, and it
   is FALSE on this one, in a way nobody could have seen because the arm had stopped arming: it
   ended in an uncaught throw at `caseceremony.mjs:76` and not one of its declarations was ever
   evaluated. This is the SECOND time this arm has silently stopped doing what it says — M0-25
   caught the first (a re-anchoring, recorded below) — and the shape is the same both times: the
   plane grew an authority the arm did not know about.

   WHAT CHANGED UNDERNEATH IT. The arm forges the committed project to the literal
   `PROJ-ARMED-CASE2-CONTROL-H`. A later landing put a PARTICIPATION FENCE on `op=caseratify`
   (C-56.1, §7.5: work inside a project is for someone who has joined it). The forged project is
   one nobody has joined, so the ceremony is now refused at ratify rather than completing — and
   the fixture threw on that refusal instead of surfacing it, which is what hid the whole thing.

   WHAT THE ARM DEMONSTRATES TODAY, measured at 66 pass / 9 fail: the declared §8 assertion fails
   BY NAME, and the four act-side REFUSAL arms named in `mustNotFail` all stay green. But three of
   the nine failures are in §5 and §6, so "every act-side arm in §2–§6 stays green" is no longer
   true as a blanket claim. Those three read a case document that must have been RATIFIED, and
   under this arm no case is ever committed, so they cascade. The declaration below now says what
   is actually protected — the four named refusal arms — rather than a sweeping claim the run
   contradicts.

   **AND THE ARM IS NOW WEAKER THAN IT WAS, WHICH IS STATED RATHER THAN QUIETLY ACCEPTED.** Its
   original property was that *the record commits an attribution no signature covers* — the
   dangerous case, because the ceremony looks correct throughout. Today the forged attribution is
   stopped by the participation fence before anything is committed, so what the arm drives is the
   fence, not the commit. Restoring the original property needs the forged project to be one the
   actor HAS joined (the fixture's `PROJ_OTHER` is exactly such a project), and that cannot be
   written as a static literal here because project ids are opaque and minted at run time
   (Membership v2 §7). That re-aiming is a row of its own and is REPORTED, not taken here. */
arm("H", "THE `cases` ROW COMMITTED FROM A REQUEST RATHER THAN FROM THE SIGNED DOCUMENT — the "
  + "control plane stops reading `case_project` out of the ratified frontmatter. DECLARED: §8's "
  + "committed-from-bytes arm MUST fail by name, and THE FOUR ACT-SIDE REFUSAL ARMS NAMED BELOW "
  + "MUST STAY GREEN — the ceremony goes on refusing correctly at act time while the record does "
  + "not commit what the signature covers. CORRECTED 2026-09-19 (M0-78): the §5/§6 arms that read "
  + "a RATIFIED case document do cascade, because the participation fence now refuses the forged "
  + "attribution at ratify; see the note above for what that costs this arm.",
  /* RE-ANCHORED 2026-09-13 BY M0-25's ARM-LIVENESS CENSUS, AND THE FINDING IS KEPT:
     THIS ARM HAD STOPPED ARMING ON `main`, AND IT CHANGED FILES WHEN IT DIED.
     It quoted `const caseProject = caseId && typeof ratifiedFm.case_project === …`
     in `src/index.mjs` — CASE-2's spelling, written at `ce2fe34`. **`808342f`
     (case-5b) moved the ratify commit out of the control plane and into the store's
     signing ceremony**, where the same read is now
     `const project = typeof fm.case_project === "string" && fm.case_project !== "null" ? … : null`
     on the SIGNED document's frontmatter. So the anchor did not merely move lines,
     it moved MODULES — `caseProject` now occurs exactly once in `src/index.mjs` and
     that once is a name inside a comment's field list, which is why a matcher
     looking for the identifier would have reported the arm healthy. Only counting
     the ARM'S OWN QUOTE can see this. Measured: old anchor zero occurrences, new
     anchor exactly one, both against the committed blob.
     The arm is unchanged in meaning — the attribution is taken from something other
     than the signed bytes, so the record commits a project no signature covers —
     and it now names `store` because that is where the read lives. */
  [["store", `      const project = typeof fm.case_project === "string" && fm.case_project !== "null"\n`
           + `        ? fm.case_project.trim() : null;`,
             `      const project = "PROJ-ARMED-CASE2-CONTROL-H";`]],
  [{ name: OWN,
     mustFail: ["THE `cases` ROW IS WRITTEN, AND IT NAMES THE PUBLISHING PROJECT"],
     mustNotFail: ["A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME",
                   "A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR",
                   "A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED"] }]);

/* ================================ (J) D-450 · THE BOTH-AXES DEMAND, PUT BACK */
arm("J", "C-41.12 DEMANDS A GRADE ON BOTH AXES OF A DECLARED BAR AGAIN — the row's own named control. "
  + "DECLARED: §10's ceremony, op=ratify and cases-row arms MUST fail — op=publish authors a document the "
  + "catalogue then refuses. §10's publish arm and the fixture guards MUST stay green (the act admits a "
  + "one-axis bar; only the check moved), and so must §5/§8's two-axis case.",
  [["checks", "} else if (rq[axis] !== null && !BASIS_GRADES.includes(rq[axis])) {",
              "} else if (!BASIS_GRADES.includes(rq[axis])) {"]],
  [{ name: OWN,
     mustFail: ["AND THE CASE CEREMONY COMPLETES", "AND op=ratify PUBLISHES ITS MEMBER",
                "the `cases` row is written for the one-axis project",
                "C-41.12 over the authored one-axis document"],
     mustNotFail: ["A ONE-AXIS BAR PUBLISHES", "FIXTURE GUARD: the project declares a bar on CAPTURE ONLY",
                   "THE SAME FINDING, THE SAME GRADES, THE SAME BAR",
                   "THE `cases` ROW IS WRITTEN, AND IT NAMES THE PUBLISHING PROJECT",
                   "THE PAIR STAYS A PAIR IN THE SIGNED BYTES", "and the document SAYS it in words"] }]);

/* ===================== (K) D-450 · THE UNSET AXIS STATED AS A BLANK, NOT IN WORDS */
arm("K", "THE UNSET AXIS WRITTEN 'not set' INSTEAD OF §3 rule 14's words. DECLARED: §10's words arm MUST "
  + "fail, and nothing else — the pair in the frontmatter, the ceremony and ratify are untouched.",
  [["store", "bar[axis] == null ? `no bar set on the ${axis} axis`", "bar[axis] == null ? `${axis} not set`"]],
  [{ name: OWN,
     mustFail: ["and the document SAYS it in words"],
     mustNotFail: ["THE PAIR STAYS A PAIR IN THE SIGNED BYTES", "AND THE CASE CEREMONY COMPLETES",
                   "AND op=ratify PUBLISHES ITS MEMBER"] }]);

/* ------------------------------------------------------------------- RUN ALL
   The preflight first, over EVERY registered arm — the complete report is the
   point — then the arms, in registration order. The refusal is scoped to the
   arms this invocation will actually run, so a stale arm cannot stop a healthy
   one being driven with `node test/caseproduction.control.mjs <id>`. */
const willRun = QUEUE.filter((q) => !ONLY || ONLY === q.id).map((q) => q.id);
preflight("caseproduction.control.mjs",
  QUEUE.map((q) => ({ id: q.id, anchors: q.edits.map(([k, from]) => ({ file: F[k], needle: from })) })),
  { fatalFor: willRun });
for (const q of QUEUE) runArm(q.id, q.title, q.edits, q.suites, q.expectGreen);

console.log(`\n==== ${armsRun} arm(s) run, ${armsWrong} NOT AS DECLARED.`);
console.log("Every file restored and verified by sha256, by content and by cmp against BOTH a per-arm\n"
          + "pristine copy and the pristine-of-record taken before any arm ran.");
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong ? 1 : 0);
