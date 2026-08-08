/* REC-78 / D-230 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — REC-73's, PL-11's, PL-4's and PL-3's precedent.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every restore
 * is verified BY sha256 AND BY CONTENT against a UNIQUELY-NAMED PER-ARM pristine
 * copy written to disk before the arm arms, with the byte count printed and a
 * minimum guarded — because two harnesses in this repository have reported a
 * restore byte-identical OVER AN EMPTY MANIFEST, caught only because a digest
 * read `e3b0c442…`, the sha256 of the empty string.
 *
 * WHAT THESE ARMS ARE FOR. D-230's eight refusals were never measured at all —
 * not measured wrongly, not measured on half their evidence, NOT MEASURED. So
 * the question every arm here answers is the one that makes a pin worth having:
 * if the refusal stopped being the thing that refuses, would this suite notice,
 * or would it go on passing because something behind the fence answered instead?
 * That is precisely the failure REC-73 found in the twelve, and there is no
 * reason to believe eight fresh pins are immune to it without running the arm.
 *
 * ONE ARM PER PINNED CODE, EACH ALONE, others held open. Plus the set arm (a
 * ninth cannot arrive unmeasured, and none of the eight can quietly stop being
 * driven), the blindness arm (the walk must be able to go blind AND SAY SO), and
 * the over-strictness arm — which is not a separate edit because it is the
 * SECOND HALF OF EVERY PIN: each refusal is followed by the same act driven to
 * success, and a fence that started refusing correct work would take that half
 * down.
 *
 * Run it:  node test/shadowed-refusals.control.mjs
 */
import { readFileSync, writeFileSync, mkdtempSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  suite: ROOT + "test/shadowed-refusals.test.mjs",
};
const SUITE = "shadowed-refusals.test.mjs";
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));
const MIN_BYTES = { store: 500000, suite: 10000 };

/* THE PRISTINE COPIES, ON DISK, UNIQUELY NAMED PER ARM. `cmp` compares them
   byte for byte against the restored file, so the restore is checked by an
   instrument that is not this process's own memory of the string. */
const PRISTINE = mkdtempSync(join(tmpdir(), "rec78-pristine-"));
for (const [k, v] of Object.entries(ORIGINAL)) {
  const n = Buffer.byteLength(v);
  if (n < MIN_BYTES[k])
    throw new Error(`REFUSING TO ARM: ${k} read ${n} bytes, under the ${MIN_BYTES[k]} floor. `
      + `A harness that snapshots an empty or truncated file restores one.`);
  if (ORIGINAL_SHA[k] === "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    throw new Error(`REFUSING TO ARM: ${k} is the EMPTY STRING.`);
  console.log(`  pristine ${k}: ${n} bytes, sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
}

let armsRun = 0, armsWrong = 0, armNo = 0;

function pristinePath(key) { return join(PRISTINE, `arm${armNo}-${key}.pristine`); }

function runSuite(name = SUITE) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 170));
  const got = [...out.matchAll(/^ {9}got {2}(.+)$/gm)].map((x) => x[1].slice(0, 400));
  const foot = /\n(OK|FAILED) {2}\d+ pass, \d+ fail/.test(out);
  /* THE FOOT IS READ RATHER THAN THE TALLY TRUSTED. A TypeError inside an
     assertion goes through NO assertion at all: it ends the module while the
     count reads clean. A run that never reached its own foot is reported as -1,
     never as 0. */
  return m && foot ? { pass: +m[1], fail: +m[2], named, got, out }
                   : { pass: -1, fail: -1, named, got, out, noFoot: true };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 90)}…' occurs ${n} times in ${key}. `
    + `An arm that did not arm — or armed in more places than it claims — is a finding, not a pass.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll() {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k}`);
    const pp = pristinePath(k);
    writeFileSync(pp, ORIGINAL[k]);
    execFileSync("cmp", [p, pp]); /* throws on any difference */
    const bytes = statSync(p).size;
    if (bytes < MIN_BYTES[k]) throw new Error(`RESTORE FAILED BY SIZE: ${k} is ${bytes} bytes`);
    console.log(`  restored ${k}: ${bytes} bytes, sha256 AND cmp against ${pp.split("/").pop()}`);
  }
}

const PINS = {
  BAD_HANDLE: "BAD_HANDLE — refused BY NAME",
  EDITION_NOT_INCREMENTED: "EDITION_NOT_INCREMENTED — refused BY NAME",
  LEASE_HELD: "LEASE_HELD — refused BY NAME",
  NOT_ACTIVE: "NOT_ACTIVE — refused BY NAME",
  NOT_AN_OWNER: "NOT_AN_OWNER — refused BY NAME",
  NO_AUTHOR: "NO_AUTHOR — refused BY NAME",
  NO_CASE: "NO_CASE — refused BY NAME",
  NO_OWNERS: "NO_OWNERS — refused BY NAME",
};
const othersHeldOpen = (code) => Object.entries(PINS).filter(([c]) => c !== code).map(([, v]) => v);

function arm(title, edits, mustFail, mustNotFail = []) {
  armsRun++; armNo++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite();
    console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail${r.noFoot ? "  ** THE SUITE NEVER REACHED ITS FOOT" : ""}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    for (const g of r.got) console.log(`      got: ${g}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    if (r.noFoot) { console.log("  ** WRONG: the module died before its foot; the tally above is not a tally."); wrong = true; }
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (r.fail === 0) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
  }
}

console.log("REC-78 / D-230 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
{
  const base = runSuite();
  console.log(`  BASELINE ${SUITE}: ${base.pass} pass, ${base.fail} fail`);
  /* THE BASELINE ROW EXISTS BECAUSE A HARNESS ONCE REPORTED `null` FOR EVERY
     ARM INCLUDING THIS ONE, and only this row distinguished all-arms-broken from
     all-arms-working. */
  if (base.fail !== 0) {
    console.log("  ** the tree is not whole; arms below would measure the wrong thing");
    process.exit(1);
  }
}

/* ===================== ONE ARM PER PINNED CODE ============================ */

arm("(1) **BAD_HANDLE.** Widen the handle grammar so a capital and a space are legal. The pin must "
  + "fail — and what it will answer instead is the enrolment SUCCEEDING, which is the point: the "
  + "refusal in front of it (NO_HANDLE) and the two behind it (HANDLE_TAKEN, PASSWORD_TOO_SHORT) are "
  + "all satisfied by the payload, so nothing else can catch this.",
  [["store", `if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(h))`, `if (false && !/^[a-z0-9][a-z0-9-]{1,40}$/.test(h))`]],
  [PINS.BAD_HANDLE], othersHeldOpen("BAD_HANDLE"));

arm("(2) **LEASE_HELD.** Neuter the courtesy lock's conflict test — a lease held by somebody else no "
  + "longer conflicts — and a second member writes into an action the first is holding. The pin must "
  + "fail, and so must the `ord` 0 arm, because the refused call will have appended after all.",
  [["store", `      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)`,
              `      if (false && cur && cur.actor !== actor && Date.parse(cur.expires) > now)`]],
  [PINS.LEASE_HELD], othersHeldOpen("LEASE_HELD"));

arm("(3) **NO_CASE.** Let an unnamed case through `#queueCaseFor`. The pin must fail, and it will "
  + "answer NO_SUCH_CASE — the refusal DIRECTLY BEHIND it, which is exactly the shadow D-230 named "
  + "and the reason a payload complete in every other respect was required to pin this one.",
  [["store", `    if (!id) return { ok: false, reason: "NO_CASE",`,
              `    if (false && !id) return { ok: false, reason: "NO_CASE",`]],
  [PINS.NO_CASE], othersHeldOpen("NO_CASE"));

arm("(4) **NOT_ACTIVE.** Let a revoked member be made an owner. Anchored on the two lines TOGETHER "
  + "because `target.status !== \"active\"` occurs four times in this file and an arm that armed four "
  + "sites would not be the arm it reports.",
  [["store", `    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };\n    const p = this.#participation(projectId, target.member_id);`,
              `    if (false && target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };\n    const p = this.#participation(projectId, target.member_id);`]],
  [PINS.NOT_ACTIVE], othersHeldOpen("NOT_ACTIVE"));

arm("(5) **NOT_AN_OWNER.** Let a vote be cast to remove somebody who is not an owner. The pin must "
  + "fail, and it will answer LAST_OWNER or VOTES_SHORT — refusals BEHIND it — which is what an "
  + "instrument driving this code with an incomplete payload would have been reading all along.",
  [["store", `    if (!this.#isProjectOwner(projectId, target.member_id))\n      return { ok: false, reason: "NOT_AN_OWNER", handle };`,
              `    if (false && !this.#isProjectOwner(projectId, target.member_id))\n      return { ok: false, reason: "NOT_AN_OWNER", handle };`]],
  [PINS.NOT_AN_OWNER], othersHeldOpen("NOT_AN_OWNER"));

arm("(6) **NO_OWNERS.** Let an administrator 'rescue' a project that has no owner rows at all — a "
  + "machine-created project rather than a stranded one. This is the arm that matters most of the "
  + "eight: with it gone, 7.13's single exception becomes a route by which an administrator takes "
  + "ownership of a project nobody ever owned.",
  [["store", `    if (!owners.length)\n      return { ok: false, reason: "NO_OWNERS",`,
              `    if (false && !owners.length)\n      return { ok: false, reason: "NO_OWNERS",`]],
  [PINS.NO_OWNERS], othersHeldOpen("NO_OWNERS"));

arm("(7) **NO_AUTHOR.** Let a provenance chain be rebuilt with no name against it. The pin must fail "
  + "and answer NO_BUNDLE or NO_SUCH_BUNDLE — the two directly behind it. The op-level arms beside "
  + "the pin must stay GREEN: they assert that no CALLER can reach this refusal, which is a fact "
  + "about the control plane and not about the store's guard.",
  [["store", `    if (!who)\n      return { ok: false, reason: "NO_AUTHOR",`,
              `    if (false && !who)\n      return { ok: false, reason: "NO_AUTHOR",`]],
  [PINS.NO_AUTHOR],
  [...othersHeldOpen("NO_AUTHOR"),
   "BEHAVIOURALLY: NOT ONE caller class reaches NO_AUTHOR through the op",
   "STRUCTURALLY: `provenancechain` is stamped with a server-decided author"]);

arm("(8) **EDITION_NOT_INCREMENTED.** Let a revision republish under an edition that does not move "
  + "the number. The pin must fail — and the harm is the one the refusal's own detail names: a second, "
  + "differently-signed document at an edition a reader has already cited.",
  [["store", `      if (!existed && highest && ed <= highest)`, `      if (false && !existed && highest && ed <= highest)`]],
  [PINS.EDITION_NOT_INCREMENTED], othersHeldOpen("EDITION_NOT_INCREMENTED"));

/* ===================== THE SET, AND THE BLINDNESS ========================= */

arm("(9) **A NINTH CANNOT ARRIVE UNMEASURED, AND NONE OF THE EIGHT CAN QUIETLY STOP BEING DRIVEN.** "
  + "Drop one code out of the driven register and the completeness arm must name it. Without this "
  + "arm the set in this suite would be a label rather than a ratchet — and `machine-fences.test.mjs` "
  + "asserts the complement of it, so the two files hold each other honest in both directions.",
  [["suite", `  DRIVEN.push({ code, payload, answer });`,
              `  if (code !== "NO_OWNERS") DRIVEN.push({ code, payload, answer });`]],
  ["EVERY code D-230 named was driven under a payload complete but for the condition it guards",
   "(eight refusals were actually driven"],
  [...Object.values(PINS)]);

arm("(10) **THE WALK MUST BE ABLE TO GO BLIND AND SAY SO.** Make the refusal-site matcher match "
  + "nothing. The corpus floor must catch it as a DELTA rather than the suite reporting a clean "
  + "estate — REC-70's lesson on the floor side. THE EIGHT PINS MUST STAY GREEN: they are driven "
  + "through the ops and do not depend on the walk at all, so if they went red here the walk would be "
  + "load-bearing on the pins and the suite would be measuring itself.",
  [["suite", `  const CODE = /(?:reason:\\s*"([A-Z][A-Z0-9_]{2,})"|\\brefusals?\\s*\\(\\s*"([A-Z][A-Z0-9_]{2,})"|\\brefuse\\s*\\(\\s*"([A-Z][A-Z0-9_]{2,})")/g;`,
              `  const CODE = /(?:\\bTHIS_MATCHES_NOTHING_AT_ALL\\b)()()()/g;`]],
  ["(the walk reached a real corpus before anything is claimed over it",
   "every one of the eight is a refusal THIS PLANE STILL MINTS"],
  [...Object.values(PINS)]);

/* ===================== OVER-STRICTNESS =================================== */

/* NOT an `arm()`, because it asserts the ABSENCE of a failure and `arm()`
   requires one. A fence tighter than its rule is not a safer fence; it is an
   undeclared interface change wearing the costume of caution. In this suite the
   over-strictness arm is not a separate block — it is the SECOND HALF of every
   one of the eight pins, because a refusal's payload is only shown to be
   complete by the same act SUCCEEDING once the guarded condition is satisfied.
   Re-measured on the WHOLE tree rather than under an edit. */
console.log("\n=== (11) OVER-STRICTNESS, AND IT IS BUILT INTO EVERY PIN. Each of the eight refusals is "
  + "followed by the same act driven to SUCCESS with only the guarded condition flipped — that is "
  + "what makes the payload complete rather than merely valid, and it is what would catch a refusal "
  + "that had started refusing correct work. Includes a handle spelling the grammar was not written "
  + "with in mind (`h9-k`), which is the classic over-strictness shape.");
{
  armsRun++; armNo++;
  const r = runSuite();
  const want = [
    "and the SAME invitation and password enrol a handle whose only difference is that it obeys the grammar",
    "and the SAME payload records the entry for the member who DOES hold the lock",
    "and the SAME kinds mute for the SAME member once the case is named",
    "and the SAME call makes her an owner",
    "and with her own assent the SAME payload carries and she stops being an owner",
    "and the SAME administrator, handle and reason rescue the project that HAS owner rows",
    "and the SAME call WITH a name gets past this refusal into the ordinary report",
    "and the SAME revision, same member, same key and same gate, ratifies once its bytes claim an edition that moves the number",
  ];
  console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail${r.noFoot ? "  ** THE SUITE NEVER REACHED ITS FOOT" : ""}`);
  const broken = want.filter((w) => r.named.some((n) => n.includes(w)));
  if (r.fail !== 0 || broken.length || r.noFoot) {
    console.log(`  ** WRONG: correct work is being refused: ${JSON.stringify(broken)}`);
    armsWrong++;
  } else {
    console.log(`  all ${want.length} success arms GREEN — every one of the eight payloads is one the plane ACCEPTS `
      + `once the condition that refusal guards is satisfied`);
  }
}

console.log(`\n=== ${armsRun} arms run, ${armsWrong} behaved differently from their declaration`);
restoreAll();
console.log("final restore: every file verified by sha256 AND by content AND by cmp against its pristine copy");
if (armsWrong) process.exit(1);
