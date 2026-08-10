/* D-266 / IC-60 — THE THREE NEGATIVE CONTROLS FOR THE WIDENED KEY, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the battery
 * must not discover it — the precedent `suggest.control.mjs` set and `d266.control.mjs`
 * took up one item earlier.
 *
 * THE PEN LIVES INSIDE THIS WORKTREE, never in the shared scratchpad, which is NOT
 * isolated between concurrent sessions: a harness silently replaced between ARM and
 * RESTORE reports a restore it never performed (PL-10's finding, UI-38's instance).
 * `.d266-harness/` is gitignored for exactly that reason.
 *
 * EVERY ARM RUNS **BOTH** SUITES — `d266scope.test.mjs`, which holds the distinction,
 * and `current.test.mjs`, which holds the publication the distinction is read off. An
 * arm that only re-ran the suite it expects to break could not show that it broke
 * NOTHING ELSE, so the must-not-fail lists below name assertions in the other suite on
 * purpose.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and DECLARES
 * BEFORE IT RUNS what must fail and what must NOT. Every restore is verified by
 * sha256, by CONTENT, and by `cmp` against a per-arm pristine copy named with the ARM
 * ID as well as the path, plus a pristine-of-record taken before any arm ran.
 *
 * AND AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS A FINDING ABOUT THE ARM,
 * recorded rather than smoothed.
 *
 * Run it:  cd bio-plane && node test/d266scope.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { store: ROOT + "src/store.mjs" };
const SUITES = ["d266scope.test.mjs", "current.test.mjs"];
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

/* THE FLOOR ON THE PRISTINE COPIES. A harness in this project has reported a restore
   byte-identical over an EMPTY manifest, caught only because a digest read `e3b0c442…`,
   the sha256 of the empty string. So the sizes are PRINTED and floored before anything
   is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 100000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.d266-harness/scope-pen";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;

/* CAPTURED TO A FILE AND NOT TO A PIPE. D-282: a suite that calls `process.exit()`
   discards unflushed PIPE writes, so a control reading a large suite's stdout over a
   pipe can read a truncated stream and report NO TALLY where the suite really did
   answer. Measured once, paid for once, and not re-learned here. */
function runSuite(name) {
  const outFile = join(PEN, `out.${name}.txt`);
  let out = "";
  try {
    execFileSync("/bin/sh",
      ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(ROOT + "test/" + name)} > ${JSON.stringify(outFile)} 2>&1; true`],
      { encoding: "utf8", timeout: 900000 });
    out = readFileSync(outFile, "utf8");
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* A suite that THREW has NO tally and is reported as `-1`, never `0`: a thrown module
     and a module with zero failures are different claims, and a TypeError inside an
     assertion goes through no assertion at all while the tally reads clean. */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 160));
  return m ? { name, pass: +m[1], fail: +m[2], named } : { name, pass: -1, fail: -1, named };
}
const runAll = () => SUITES.map(runSuite);

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

function arm(id, title, edits, mustFail, mustNotFail = [], expectGreen = false) {
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const rs = runAll();
    for (const r of rs) {
      console.log(`  MEASURED ${r.name}: ${r.pass} pass, ${r.fail} fail`
        + (r.fail === -1 ? "  ** NO TALLY — the suite THREW rather than failing, reported as -1" : ""));
      for (const n of r.named) console.log(`    FAILED: ${n}`);
    }
    const hit = (frag) => rs.some((r) => r.named.some((n) => n.includes(frag)));
    const anyThrew = rs.some((r) => r.fail === -1);
    const totalFail = rs.reduce((a, r) => a + Math.max(0, r.fail), 0);
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag) && !anyThrew) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (expectGreen) {
      if (totalFail !== 0 || anyThrew) { console.log("  ** WRONG: this is an OVER-STRICTNESS arm and MUST stay green"); wrong = true; }
      else console.log("  as declared: GREEN across both suites.");
    } else if (totalFail === 0 && !anyThrew) {
      console.log("  ** WRONG: both suites stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nD-266 / IC-60 — the scoping controls. THE BASELINE FIRST, so every arm is a DELTA and a\n"
          + "run in which every arm is broken is distinguishable from one in which every arm works.");
const base = runAll();
for (const r of base) console.log(`  BASELINE ${r.name}: ${r.pass} pass, ${r.fail} fail`);
if (base.some((r) => r.fail !== 0)) {
  console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
  process.exit(1);
}

/* ===== (1) THE ARM THIS ITEM EXISTS FOR — KEY THE STANCE-SCOPED DISPOSITION
 *           INSTANCE-WIDE, AND PROJECT B'S FINDING VANISHES.
 *
 * The lookup stops asking WHICH project decided and asks only whether ANYBODY did,
 * which is exactly what a widened `proposal_dispositions` key would have produced: the
 * decision is still authored, still attributed, still dated, still published — and it
 * now silences a notification for a team that never took it. One team silencing
 * another team's notification about that other team's OWN stance is the defect the
 * scoping ruling forbids by name, and this is the arm that makes it visible.
 * ========================================================================= */
/* THE FIRST DRAFT OF THIS ARM WAS WRONG AND IT IS RECORDED RATHER THAN SMOOTHED. It
   armed `const decided = byProject.size > 0 ? homes.slice() : []`, which made the
   publication loop below it call `byProject.get(p)` for a project with no row and throw
   a TypeError — so the FEED died and sixteen assertions fell, of which the two declared
   ones were only incidentally among them. An arm that takes the whole answer down does
   not demonstrate *B's finding vanishes*; it demonstrates *the plane broke*, and those
   are different claims. The arm below models the defect exactly instead: the LOOKUP
   stops being keyed on (project, finding) and answers for ANY project, which is
   precisely what a widened `proposal_dispositions` key would have produced. */
arm("1", "KEY THE STANCE-SCOPED DISPOSITION INSTANCE-WIDE. The per-finding map stops "
  + "discriminating on project and answers YES for every project home, so one team's decision "
  + "matches every team's feed — the decision is still authored, still attributed, still dated, "
  + "still published, and it now silences a notification for a team that never took it. "
  + "DECLARED MUST FAIL: the fires-for-B arm and the one-answer distinction arm, BY NAME. "
  + "MUST NOT FAIL: the shared-record `cleared everywhere` arm — which keeps working and is "
  + "precisely why this defect would survive a suite that only knew about progression findings — "
  + "and current.test.mjs's publication arms, since nothing about what the ITEM says has moved.",
  [["store", `      m.set(d.project_id, d);`,
              `      m.set(d.project_id, d); m.has = () => true; m.get = () => d;`]],
  ["AND IT FIRES FOR PROJECT B", "IN ONE READ OF ONE FEED"],
  ["ONE ACT CLEARED IT UNDER EVERY CASE",
   "the SHARED-RECORD item publishes scope `instance`",
   "the key is published as a NAMED SHAPE"]);

/* ===== (2) THE OPPOSITE DIRECTION — SCOPE THE SHARED-RECORD KIND PER-PROJECT
 *           AND THE DEDUP ASSERTION FALLS.
 *
 * DEC-16's own reason, run backwards. A progression-stage finding is a fact about the
 * SHARED record, so one act settling it under every case is dedup rather than
 * judgment-suppression. Make the mint call it project-scoped and the act's key stops
 * being the fact's identity: the dismissal reaches one home and the same finding goes
 * on firing under the others, which is the record asking a member the same settled
 * question once per case.
 * ========================================================================= */
/* THE FIRST DRAFT OF THIS ARM WAS ALSO WRONG, AND WHAT IT MEASURED IS WORTH KEEPING:
   it armed ONLY `#dispositionOf`, and `ONE ACT CLEARED IT UNDER EVERY CASE` STAYED
   GREEN. That is a real fact about where the instance-wide behaviour lives — the
   shared-record ageing happens UPSTREAM in `proposalsFeed`, which filters on
   `proposal_dispositions` before `op=queue` ever mints an item, and it does not consult
   what the mint later says the act is scoped to. So re-scoping the PUBLICATION alone
   changes what a surface is told and not what the feed does, which is exactly the shape
   of defect this project keeps meeting. Re-scoping the KIND therefore takes both edits,
   and they are ONE defect: the act's key stops being the fact's identity. */
arm("2", "SCOPE THE SHARED-RECORD KIND PER-PROJECT — both halves, because the instance-wide "
  + "ageing lives upstream of the mint. `proposalsFeed` stops keying the ageing on the "
  + "(progression, stage) identity, and `#dispositionOf` stops answering `instance` for an item "
  + "that carries the pair, so the one fact would acquire N per-project decisions instead of "
  + "being settled once. "
  + "DECLARED MUST FAIL: the `cleared everywhere` arm and the instance-scope publication arm, "
  + "plus current.test.mjs's two instance-key arms — which fall here BECAUSE the arm reached the "
  + "right thing. MUST NOT FAIL: the fires-for-B arm and the other-team's-item arm — the "
  + "stance-scoped half is untouched, and that is what proves the two behaviours are independent "
  + "rather than one switch with two labels.",
  [["store", `      disposed.set(d.progression_key + "::" + d.stage_key, d);`,
              `      disposed.set(d.progression_key + "::" + d.stage_key + "::never-matches", d);`],
   ["store", `    if (pk && sk)
      return { available: true, op: "proposedispose", scope: "instance", keyed_on: KEYED_ON,`,
              `    if (false && pk && sk)
      return { available: true, op: "proposedispose", scope: "instance", keyed_on: KEYED_ON,`]],
  ["ONE ACT CLEARED IT UNDER EVERY CASE",
   "the SHARED-RECORD item publishes scope `instance`"],
  ["AND IT FIRES FOR PROJECT B",
   "THE OTHER TEAM'S ITEM IS UNTOUCHED"]);

/* ===== (3) OVER-STRICTNESS — A STANDING DECISION MUST STILL BE RE-TRIAGEABLE.
 *
 * The direction a widened key gets wrong the OTHER way. D-266's first ruling is that a
 * disposition AGES a finding and never deletes it, and it stands UNTIL IT IS
 * RE-TRIAGED — which means re-triage has to work. Make the UPSERT an INSERT that
 * refuses a second decision on the same identity and the widening has traded a silence
 * for a lock: a team that changes its mind is told it already decided.
 * ========================================================================= */
arm("3", "FREEZE THE DECISION — the UPSERT becomes a DO NOTHING, so the first judgment on a "
  + "(project, finding) is the last one and a re-triage silently keeps the old state and the old "
  + "reason. This is the OVER-STRICTNESS direction and the arm exists because a key that cannot "
  + "be re-decided would satisfy every scoping assertion above while breaking D-79, which ages "
  + "findings and never freezes them. "
  + "DECLARED MUST FAIL: the re-triage arms. MUST NOT FAIL: the fires-for-B arm and the "
  + "`cleared everywhere` arm, since the SCOPING is untouched by how the row is written — which "
  + "is what makes this a distinct defect rather than a second spelling of arm 1.",
  [["store", `         ON CONFLICT(project_id,finding_id) DO UPDATE SET
           kind=excluded.kind, state=excluded.state, reason=excluded.reason,
           decided_by=excluded.decided_by, at=excluded.at\`,`,
              `         ON CONFLICT(project_id,finding_id) DO NOTHING\`,`]],
  /* THE DECLARATION WAS WRONG ON THE FIRST RUN AND THE CORRECTION IS THE ARM'S BEST
     FINDING. It named "A STANDING DECISION CAN BE RE-TRIAGED", which reads the ACT'S
     RETURN — and an `ON CONFLICT DO NOTHING` returns `ok: true` exactly as an UPSERT
     does. **A FREEZE IS SILENT AT THE ACT AND VISIBLE ONLY IN THE FEED**, so an arm
     declared against the act's answer would have gone green over a plane that told a
     member their re-triage landed and then kept the old decision — which is worse than
     a refusal. The two fragments below are the arms that actually SEE it. */
  ["and it is ONE row and never two", "the OLD reason is gone rather than lingering"],
  ["AND IT FIRES FOR PROJECT B", "ONE ACT CLEARED IT UNDER EVERY CASE"]);

console.log(`\n=== D-266/IC-60 scoping controls: ${armsRun} arm(s) run, ${armsWrong} NOT as declared.`);
