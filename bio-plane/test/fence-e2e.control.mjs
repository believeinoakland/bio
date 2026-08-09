/* VF-5 — THE NEGATIVE CONTROLS FOR THE END-TO-END FENCE PROOF, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's, PL-4's, PL-11's, REC-73's and REC-78's
 * precedent. It lives INSIDE this worktree and never in a shared scratchpad: a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed, and that has happened here.
 *
 * WHAT THIS HARNESS DOES THAT THE ROW ONLY ASKED FOR HALF OF. VF-5's stated
 * control is arm (1) alone — remove the identity predicate and the six must
 * pass. That control cannot distinguish the three LAYERS this pass claims to
 * exercise: if all six failed under one edit, the three layers would be one
 * layer wearing three hats and the pass would be worth a third of what it says.
 * So arm (1) declares that attempts 5 and 6 MUST NOT FAIL, and arms (2) and (3)
 * break their layers ALONE with the others held open. Three edits, three
 * disjoint failure sets, is what makes "the WHOLE fence" a measurement.
 *
 * THE DISCIPLINE, and every part of it is here because it has already failed
 * somewhere in this repository:
 *   - ARM 0 IS A BASELINE. A harness whose first run reported `null` for every
 *     arm including the baseline was distinguishable from six-arms-broken only
 *     by having one.
 *   - A MISSING TALLY IS `-1`, NEVER `0`. A `TypeError` inside an assertion goes
 *     through no assertion at all: it ends the module while the count reads
 *     clean, and two items have recorded an arm that KILLED a suite being read
 *     as "stayed GREEN".
 *   - EVERY ARM IS ARMED ALONE, and an edit whose anchor does not occur EXACTLY
 *     ONCE refuses to arm. An arm that did not arm is a finding.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, against per-arm
 *     UNIQUELY NAMED pristine copies — a harness that named its snapshot from
 *     the path alone overwrote its own first copy, and `cmp` caught what the
 *     digest could not.
 *   - BYTE COUNTS ARE PRINTED AND FLOORED. Two harnesses have reported a restore
 *     byte-identical OVER AN EMPTY MANIFEST.
 *
 * Run it:  node test/fence-e2e.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUITE = ROOT + "test/fence-e2e.test.mjs";
const F = {
  checks: ROOT + "checks/bio-checks.mjs",
  index:  ROOT + "src/index.mjs",
  store:  ROOT + "src/store.mjs",
  agent:  ROOT + "../agent-worker/src/index.mjs",
  suite:  SUITE,
};
/* A FLOOR PER FILE, so a snapshot of nothing cannot pass for a snapshot. The
   numbers are deliberately far below the real sizes — this guards emptiness and
   truncation, not growth, and a ratchet on source size is not this item's
   subject. */
const MIN_BYTES = { checks: 100000, index: 100000, store: 400000, agent: 5000, suite: 10000 };

const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = {}, ORIGINAL_SHA = {};
for (const [k, p] of Object.entries(F)) {
  const v = readFileSync(p, "utf8");
  if (v.length < MIN_BYTES[k])
    throw new Error(`PRISTINE COPY OF ${k} IS ${v.length} BYTES, BELOW ITS FLOOR OF ${MIN_BYTES[k]}. `
      + `A restore verified against a truncated or empty snapshot verifies nothing — two harnesses in `
      + `this repository reported a byte-identical restore over an EMPTY manifest.`);
  ORIGINAL[k] = v; ORIGINAL_SHA[k] = sha(v);
  console.log(`  pristine  ${k.padEnd(7)} ${String(v.length).padStart(8)} bytes  sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
}
/* PER-ARM COPIES, NAMED BY ARM AS WELL AS BY PATH. Held in memory rather than on
   disk on purpose: a file in a shared temp root is exactly the thing another
   session has already overwritten mid-turn. */
const perArm = new Map();

let armsRun = 0, armsWrong = 0;

function runSuite() {
  let out = "";
  try {
    out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* THE FOOT LINE, and reading it is the whole point: a suite that dies mid-run
     prints no foot at all, and a harness that reported that as `0 fail` would
     record the arm as "stayed GREEN". */
  const m = /^fence-e2e: (\d+) pass, (\d+) fail$/m.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 170));
  /* WIDE ON PURPOSE: the CONTENT of arm (1) is what each act DID once the fence
     was gone, and a truncated `got` would leave the record saying "they all
     failed" without saying what happened instead. */
  const got = [...out.matchAll(/^ {9}got {2}(.+)$/gm)].map((x) => x[1].slice(0, 600));
  const sweep = [...out.matchAll(/^ {5}(explained on the wire|MUTE on the wire).*$/gm)].map((x) => x[0].trim());
  if (!m) return { pass: -1, fail: -1, named, got, sweep, reachedFoot: false, out };
  return { pass: +m[1], fail: +m[2], named, got, sweep, reachedFoot: true, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 80)}…' occurs ${n} times in ${key}. `
    + `An arm that patched ${n} sites is not the arm it reports, and an arm that patched ZERO is a finding.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  let bytes = 0;
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    const want = perArm.get(`${armId}:${k}`);
    if (want === undefined) throw new Error(`NO PER-ARM PRISTINE COPY FOR ${armId}:${k}`);
    if (sha(now) !== sha(want)) throw new Error(`RESTORE FAILED BY sha256: ${armId}:${k}`);
    if (now !== want) throw new Error(`RESTORE FAILED BY CONTENT: ${armId}:${k}`);
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE DRIFTED FROM THE PRISTINE OF RECORD: ${armId}:${k}`);
    if (now.length < MIN_BYTES[k]) throw new Error(`RESTORED ${k} IS ${now.length} BYTES, BELOW ITS FLOOR`);
    bytes += now.length;
  }
  console.log(`  restored: ${Object.keys(F).length} file(s), ${bytes} bytes, each verified by sha256 AND by content against a copy named for THIS arm`);
}

function arm(id, title, edits, mustFail, mustNotFail = [], { expectGreen = false } = {}) {
  armsRun++;
  console.log(`\n=== ${id} ${title}`);
  for (const [k] of edits.length ? edits : Object.keys(F).map((k) => [k]))
    void k;
  for (const k of Object.keys(F)) perArm.set(`${id}:${k}`, ORIGINAL[k]);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite();
    console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail${r.reachedFoot ? "" : "   ** THE SUITE NEVER REACHED ITS FOOT — reported as -1, never 0"}`);
    for (const s of r.sweep) console.log(`    ${s}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    for (const g of r.got) console.log(`      got: ${g}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    if (!r.reachedFoot) { console.log("  ** WRONG: no foot line. The arm may have killed the suite rather than failed it."); wrong = true; }
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm declared it must stay GREEN`); wrong = true; }
    if (expectGreen) {
      if (r.fail !== 0) { console.log("  ** WRONG: this arm must be GREEN and was not."); wrong = true; }
    } else if (!r.fail) {
      console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
    return r;
  } finally {
    restoreAll(id);
  }
}

/* ========================================================================= */

console.log("\nVF-5 — negative controls. Whole-tree BASELINE first, so every arm below is a DELTA.");
const base = arm("(0)", "BASELINE — no edit at all. The row that distinguishes six-arms-broken from "
  + "six-arms-working, and the row a harness reporting `null` everywhere did not have.",
  [], [], [], { expectGreen: true });
if (base.fail !== 0) {
  console.log("\n** the tree is not whole; every arm below would measure the wrong thing. Stopping.");
  process.exit(1);
}

/* --------------------------------------------------------------- (1) ------ */
arm("(1)", "**THE ROW'S OWN CONTROL, and it is declared with a MUST-NOT half the row does not state.** "
  + "Neuter REC-46's ONE predicate — `isMachineStamp` returns false — and the IDENTITY layer is gone. "
  + "MUST FAIL: attempts 1-4, and the record read-backs beside them, because under COMPLETE payloads "
  + "the honest outcome is the act GOING ALL THE WAY THROUGH — a machine accepts a reading, makes a "
  + "project stand on it, hides it, and publishes a case. MUST NOT FAIL: attempts 5 and 6, whose "
  + "fences do not consult this predicate at all. If they failed too, the three layers would be one.",
  [["checks", `export function isMachineStamp(who) {\n  const s = String(who ?? '').trim().toLowerCase();\n  return s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));`,
              `export function isMachineStamp(who) {\n  const s = String(who ?? '').trim().toLowerCase();\n  return false && s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));`]],
  ["1. accept (op=versionaccept)", "2. make-current (op=versioncurrent)",
   "3. hide (op=versionhide)", "4. publish (op=publish)"],
  ["5. direct capture (op=acquire)", "6. direct enqueue (op=capturerequestdrain)"]);

/* --------------------------------------------------------------- (2) ------ */
arm("(2)", "**THE CAPTURE-CONDUCT LAYER, ALONE.** PL-4's spine: the plane fetches for a request only "
  + "from inside its own drain. Neuter it and the machine performs the fetch itself. MUST FAIL: "
  + "attempt 5 and the member/daemon half beside it. MUST NOT FAIL: 1-4 and 6 — this gate is not an "
  + "identity fence and nothing about who is calling changes here.",
  [["index", "if (!d || d.draining !== true) {", "if (false) {"]],
  ["5. direct capture (op=acquire)"],
  ["1. accept (op=versionaccept)", "2. make-current (op=versioncurrent)",
   "3. hide (op=versionhide)", "4. publish (op=publish)",
   "6. direct enqueue (op=capturerequestdrain)"]);

/* --------------------------------------------------------------- (3) ------ */
/* ITS FIRST RUN CAME BACK WRONG, AND THE CORRECTION IS THE FINDING RATHER THAN
   THE FIX. Declared as "attempt 6 must fail", it did not: with the member floor
   removed, `op=capturerequestdrain` is STILL refused `AI_BEYOND_TASK_SCOPE` —
   by the declared-writes check sitting directly behind the floor, which answers
   the SAME CODE. That is D-229/D-230's shadow arriving at the credential layer:
   the code fires, and the code is not evidence of which fence fired. Two things
   changed in consequence, both recorded rather than smoothed: the suite now pins
   the branch by its DETAIL (the only thing on the wire that distinguishes them),
   and this arm's declaration now names that assertion instead of the code one.
   The MINT door was right first time and is unchanged. */
arm("(3)", "**THE CREDENTIAL-SHAPE LAYER, ALONE.** `aiReachesAsMember` returns true, so the member "
  + "floor stops bounding what an agent may be handed and the daemon's own verb becomes reachable. "
  + "MUST FAIL: attempt 6's BRANCH assertion (the floor is no longer what answers) and the mint "
  + "door. MUST NOT FAIL: 1-5, which are already inside the floor and gain nothing from widening it "
  + "— and NOT attempt 6's code assertion, because the check BEHIND the floor answers the same code, "
  + "which is the finding this arm produced.",
  [["index", `  return !!spec && Array.isArray(spec.classes) && spec.classes.includes("member");`,
             `  return true || (!!spec && Array.isArray(spec.classes) && spec.classes.includes("member"));`]],
  ["it is the MEMBER-FLOOR branch that answers", "the DECLARATION is refused at the mint too"],
  ["1. accept (op=versionaccept)", "2. make-current (op=versioncurrent)",
   "3. hide (op=versionhide)", "4. publish (op=publish)", "5. direct capture (op=acquire)"]);

/* --------------------------------------------------------------- (4) ------ */
arm("(4)", "**THE END-TO-END ARM IS LOAD-BEARING, not decoration.** Stop the fleet member forwarding "
  + "the plane's refusal body — it still refuses, with its own words. MUST FAIL: the verbatim "
  + "pass-through assertion in block 8. MUST NOT FAIL: everything the plane answers directly, because "
  + "the two sides are separately green today and this arm is what shows the JOIN is what is measured.",
  [["agent", `                  plane_status: asked.status, plane: asked.body }, 403);`,
             `                  plane_status: asked.status }, 403);`]],
  ["the plane's code, C-number and CANNED TRANSLATION cross the binding VERBATIM"],
  ["1. accept (op=versionaccept)", "5. direct capture (op=acquire)",
   "6. direct enqueue (op=capturerequestdrain)"]);

/* --------------------------------------------------------------- (5) ------ */
/* ITS FIRST RUN CAME BACK WRONG TOO, AND IT IS THE SHARPER OF THE TWO. Dropping
   the roster row did not FAIL the suite — it KILLED it. `attempt()` read
   `row.act` off an undefined row, the `TypeError` ended the module through no
   assertion at all, and stdout carried `1 pass` with every arm behind it unrun.
   A harness reading a missing tally as `0` would have recorded this as "stayed
   GREEN over a shorter roster", which is the exact failure the arm exists to
   catch, arriving inside the arm. Caught ONLY by the `-1` foot convention. The
   suite's `attempt()` is now null-tolerant on its own roster and this arm's
   must-fail is the roster assertion, which is what it should always have been. */
arm("(5)", "**THE PASS CANNOT QUIETLY SHRINK.** Drop `hide` out of the roster the suite drives. MUST "
  + "FAIL: the closing arm that compares the roster against what was driven — it must NAME the act "
  + "rather than report a smaller green pass. This is the arm against the failure mode a count "
  + "cannot see: a totality assertion that passed over a shorter corpus.",
  [["suite", `  { n: 3, act: "hide",           op: "versionhide",         code: "MACHINE_CANNOT_MOVE_VERSION", check: "C-25.24", layer: "identity",         wire: true },\n`, ``]],
  ["the roster is the SIX the row names"],
  ["5. direct capture (op=acquire)", "6. direct enqueue (op=capturerequestdrain)"]);

/* --------------------------------------------------------------- (6) ------ */
arm("(6)", "**OVER-STRICTNESS: A FENCE TIGHTER THAN ITS RULE IS NOT A SAFER FENCE.** Make the version "
  + "fence refuse EVERYONE, not only a machine. The machine attempts still refuse — so an instrument "
  + "watching only those would report this as fine — and the MEMBER arms must fail, because they are "
  + "what makes each payload provably complete. MUST FAIL: the member arms for accept, make-current "
  + "and hide, and the preview arm in block 9. MUST NOT FAIL: attempts 1-3 themselves, 4, 5 or 6.",
  [["store", `    const who = String(a.author ?? "").trim();\n    if (!who || isMachineIdentity(who))\n      return refuse("MACHINE_CANNOT_MOVE_VERSION",`,
              `    const who = String(a.author ?? "").trim();\n    if (true)\n      return refuse("MACHINE_CANNOT_MOVE_VERSION",`]],
  ["the SAME payload accepts the reading for a signed-in member",
   "the SAME payload makes it current for a signed-in member",
   "the SAME payload hides it for a signed-in member",
   "a PREVIEW"],
  ["1. accept (op=versionaccept)", "2. make-current (op=versioncurrent)",
   "3. hide (op=versionhide)", "4. publish (op=publish)",
   "5. direct capture (op=acquire)", "6. direct enqueue (op=capturerequestdrain)"]);

/* ========================================================================= */
console.log(`\n${armsRun} arm(s) run, ${armsWrong} NOT as declared.`);
console.log("Every file restored and verified by sha256 AND by content against a per-arm pristine copy.");
process.exit(armsWrong ? 1 : 0);
