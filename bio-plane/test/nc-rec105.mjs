/* REC-105 · THE NEGATIVE CONTROL DRIVER. One arm per run, each arm ALONE.
 *
 * "A SUITE THAT DOES NOT FAIL WHEN YOU BREAK ITS SUBJECT IS NOT A SUITE"
 * (CLAUDE.md). This file breaks `src/store.mjs` one way at a time, runs
 * `test/inquirystrength.test.mjs` against the damage, and CHECKS THE RESULT
 * AGAINST WHAT WAS DECLARED BEFORE THE ARM WAS ARMED — both halves: the
 * assertions that MUST fail, and the assertions that MUST NOT. An arm that
 * breaks more than it declared is as much a finding as one that breaks less.
 *
 * WHY EACH HALF IS CHECKED RATHER THAN DESCRIBED. WORKER.md's receipts are
 * mostly instruments being wrong rather than subjects: arms that NEVER ARMED
 * (the patch matched zero times), arms that broke their own declared held-open
 * half, and restores reported byte-identical over an empty file. So:
 *
 *   - every arm asserts its patch matched EXACTLY ONCE before it runs anything;
 *   - every arm restores from its OWN uniquely-named pristine copy and verifies
 *     the restore by sha256 AND by `cmp`, printing a byte count with a floor;
 *   - there is a BASELINE ARM (`none`), because a driver whose every arm reports
 *     the same number cannot tell six-arms-broken from six-arms-working;
 *   - and there is an OVER-STRICTNESS ARM (`e`) that writes the SAME rule in a
 *     spelling this item did not use. Correct work must PASS.
 *
 * Run: `node test/nc-rec105.mjs <none|a|b|c|d|e>` from `bio-plane/`. */
import "./stdio.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { controlPen } from "./pen.mjs";

const ARM = (process.argv[2] || "none").toLowerCase();
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./inquirystrength.test.mjs", import.meta.url));
const PEN = `${controlPen("rec105")}/`;
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* THE ARMS. `find` must occur EXACTLY ONCE in the pristine source — an anchor
   that occurs twice patches the wrong site and an anchor that occurs zero times
   is an arm that never armed, and both have happened in this estate. */
const ARMS = {
  a: {
    what: "THE ITEM'S OWN — THE REGISTRY CONSULTATION REMOVED. `#captureBoundsFor` answers "
        + "null, so `strengthOf()` hands the walk no bound and every leg reports its stored "
        + "letter exactly as it did before this item. This is the arm that proves the gap was "
        + "REAL rather than the fix being decorative, and it is also this item's one-line "
        + "reversal if IC-102 is rejected.",
    find: "  #captureBoundsFor(bundleId, bound) {\n    const targets = new Set();",
    with: "  #captureBoundsFor(bundleId, bound) {\n    if (true) return null;\n    const targets = new Set();",
    /* FINDING, 2026-09-15, RECORDED RATHER THAN SMOOTHED. This arm's first
       declaration ALSO named "and the leg it is sent to check is the ACTUAL
       one, two levels down", and that assertion did NOT fail. The arm is right
       and the declaration was wrong: that assertion reads `inherited_from` and
       `through`, which name WHICH leg set the grade and are the same two ids
       whatever LETTER the walk arrives at. It is a real pin on the naming and
       it is blind to the bound BY CONSTRUCTION — so it belongs in `mustPass`,
       where it now is, and a reader who expected it to detect this break would
       have been reading it wrong. */
    mustFail: ["AND THE WALK CHANGED ITS ANSWER", "the two reads agree AFTER the bound moved",
               "the axis still names the leg that sets it", "and the member is told WHAT bound it",
               "the walk moved from a graded axis to an UNRATED one",
               "and the empty level travels with it",
               "an inquiry resting on the bounded one INHERITS"],
    mustPass: ["BEFORE the re-read the two reads already agree", "the registry bound MOVED and says so by name",
               "a publisher-typed document's leg is byte-identical",
               "and it carries NO new key", "a leg stating a WEAKER letter than the ceiling keeps its own",
               "an UNGRADED leg on the very document whose bound moved",
               "`strengthOf` is the ONLY caller that builds the bound map",
               "and the leg it is sent to check is the ACTUAL one"],
  },
  b: {
    what: "THE CEILING APPLIED AS A VALUE RATHER THAN AS A CAP. The short-circuit that leaves "
        + "a letter at or under the ceiling alone is removed, so the earned entry OVERWRITES "
        + "the member's own letter in BOTH directions — which raises a weaker account to the "
        + "maximum and is the overclaiming direction this whole item exists to close.",
    find: "    if (Store.#GRADE_RANK[stated] <= Store.#GRADE_RANK[earned.grade]) return null;",
    with: "    if (false) return null;",
    /* FINDING, 2026-09-15, AND IT IS THE MOST USEFUL THING THIS DRIVER FOUND.
       This arm's first declaration named "a publisher-typed document's leg is
       byte-identical to the DO-internal derivation" as a must-fail. IT DID NOT
       FAIL, and the reason matters beyond this item: that assertion compares
       `op=inquirystrength`'s answer against the ungated `/strength` route, and
       BOTH GO THROUGH `strengthOf()`. A change to the derivation damages both
       sides equally and the equality survives untouched. It is a genuine pin on
       the GATE not rebuilding the object — which is what section 2 wrote it for
       — and it is STRUCTURALLY BLIND to any change in the arithmetic beneath.
       That is the costs-nothing rule in miniature: an equality between two
       paths through one function agrees for free. The assertion that actually
       sees this break is "it carries NO new key", which did fail.
       *
       THE ARM ALSO BIT HARDER THAN DECLARED, and that is the arm working rather
       than a defect: raising a weaker letter to the ceiling moves the SUITE'S
       OWN PRE-EXISTING FIXTURES (a leg authored at the weaker letter in section
       1, the inheritance in section 3 and the cache assertions beside it), so
       six assertions this item never wrote failed too. An overclaiming break
       SHOULD be loud in a suite about strength. */
    mustFail: ["and it carries NO new key",
               "a leg stating a WEAKER letter than the ceiling keeps its own"],
    mustPass: ["AND THE WALK CHANGED ITS ANSWER", "the two reads agree AFTER the bound moved",
               "the walk moved from a graded axis to an UNRATED one",
               "an inquiry resting on the bounded one INHERITS",
               "a publisher-typed document's leg is byte-identical"],
  },
  c: {
    what: "THE UNDETERMINED ARM DROPPED. A transcription with no measured fidelity falls "
        + "through to the cap comparison, where a null ceiling makes the comparison meaningless "
        + "and the leg keeps its authored letter — the record claiming a letter for text whose "
        + "worth it cannot state, which is DEC-4 unenforced in the one case it was written for.",
    /* FINDING, 2026-09-15 — AN ARM THAT DID NOT DO WHAT IT DECLARED, CAUGHT BY
       ITS OWN HELD-OPEN HALF. The first spelling of this arm inserted a bare
       `return null;` and left the undetermined branch's object literal standing
       as an UNCONDITIONAL return, so EVERY entry came back with a null grade
       rather than only the undetermined ones. It reported 51 pass / 17 fail and
       broke three of its four declared held-open assertions — which is exactly
       the signal the held-open half exists to give. The arm was rewritten to be
       surgical; the mis-armed run is kept here in words because "the arm did
       not arm as declared" is a finding about the instrument and this driver's
       whole point is that those get recorded rather than tidied away. */
    find: "    if (earned.grade == null)\n      return { grade: null,",
    with: "    if (earned.grade == null) return null;\n    if (false)\n      return { grade: null,",
    mustFail: ["the walk moved from a graded axis to an UNRATED one", "and the empty level travels with it"],
    mustPass: ["AND THE WALK CHANGED ITS ANSWER", "the two reads agree AFTER the bound moved",
               "a publisher-typed document's leg is byte-identical",
               "an inquiry resting on the bounded one INHERITS"],
  },
  d: {
    what: "THE RECURSION DROPS THE BOUND MAP. The top level is corrected and every level "
        + "beneath it is not, so an inquiry resting on a bounded one INHERITS the uncorrected "
        + "letter while the inquiry beneath answers the corrected one — D-373's own drift, one "
        + "hop down, inside a single answer. This arm is why section 8e exists.",
    find: "      const sub = this.#strengthWalk(leg.target_id, depth + 1, bound, null, captureBounds);",
    with: "      const sub = this.#strengthWalk(leg.target_id, depth + 1, bound, null, null);",
    mustFail: ["an inquiry resting on the bounded one INHERITS"],
    mustPass: ["AND THE WALK CHANGED ITS ANSWER", "the two reads agree AFTER the bound moved",
               "the walk moved from a graded axis to an UNRATED one",
               "a publisher-typed document's leg is byte-identical"],
  },
  e: {
    what: "OVER-STRICTNESS. The SAME rule, written in the spelling the registry itself uses "
        + "(`BASIS_GRADES.indexOf`, where a SMALLER index is the STRONGER letter) instead of "
        + "`#GRADE_RANK` (where a LARGER number is). Correct work in a spelling this item did "
        + "not anticipate must PASS — a suite that only recognises its own idiom is a fence "
        + "tighter than its rule.",
    find: "    if (Store.#GRADE_RANK[stated] <= Store.#GRADE_RANK[earned.grade]) return null;",
    with: "    if (BASIS_GRADES.indexOf(stated) >= BASIS_GRADES.indexOf(earned.grade)) return null;",
    mustFail: [],
    mustPass: ["AND THE WALK CHANGED ITS ANSWER", "the two reads agree AFTER the bound moved",
               "a publisher-typed document's leg is byte-identical",
               "a leg stating a WEAKER letter than the ceiling keeps its own",
               "the walk moved from a graded axis to an UNRATED one",
               "an inquiry resting on the bounded one INHERITS"],
  },
};

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tail = /inquirystrength: (\d+) pass, (\d+) fail/.exec(out);
  /* THE FOOT, CHECKED. A TypeError inside an assertion ends the module while the
     tally reads clean, so a MISSING tally is reported as -1 and never as 0. */
  return { pass: tail ? Number(tail[1]) : -1, fail: tail ? Number(tail[2]) : -1,
           exit: r.status,
           failed: [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]),
           reachedFoot: !!tail, out };
};

mkdirSync(PEN, { recursive: true });
const pristine = readFileSync(STORE, "utf8");
/* UNIQUELY NAMED PER ARM. A shared `pristine.mjs` is how one arm's damage gets
   restored as another arm's baseline. */
const copy = `${PEN}store.pristine.${ARM}.mjs`;
writeFileSync(copy, pristine);
const beforeSha = sha(pristine);
/* BYTES, NOT STRING LENGTH. `store.mjs` is full of multi-byte characters, so a
   JS string's `.length` (UTF-16 units) and the file's size on disk are DIFFERENT
   NUMBERS for the same unchanged file — and a restore check that printed one
   against the other would read as a mismatch on a perfect restore, which is the
   instrument crying wolf at exactly the moment it must be believed. */
const beforeBytes = statSync(STORE).size;
console.log(`REC-105 NC · arm ${ARM}`);
console.log(`  pristine store.mjs: ${beforeBytes} bytes on disk · sha256 ${beforeSha.slice(0, 16)}`);
if (beforeBytes < 100000) { console.error("FLOOR: pristine store.mjs is implausibly small — refusing"); process.exit(3); }

let armed = false;
if (ARM !== "none") {
  const spec = ARMS[ARM];
  if (!spec) { console.error(`no such arm: ${ARM}`); process.exit(2); }
  console.log(`  WHAT: ${spec.what}`);
  const hits = pristine.split(spec.find).length - 1;
  console.log(`  anchor occurs ${hits} time(s) — an arm must anchor EXACTLY once`);
  if (hits !== 1) { console.error("ARM NEVER ARMED (or anchored twice). That is a FINDING, not a skip."); process.exit(4); }
  writeFileSync(STORE, pristine.replace(spec.find, spec.with));
  armed = true;
  console.log(`  DECLARED BEFORE RUNNING — must FAIL: ${spec.mustFail.length}; must PASS: ${spec.mustPass.length}`);
}

const res = runSuite();
console.log(`\n  RESULT  ${res.pass} pass, ${res.fail} fail, exit ${res.exit}`
  + `${res.reachedFoot ? "" : "  *** THE SUITE DID NOT REACH ITS OWN FOOT — the tally is -1, not 0 ***"}`);
if (res.failed.length) console.log(res.failed.map((f) => `    FAILED: ${f}`).join("\n"));

/* RESTORE FIRST, VERIFY SECOND — and never with `git checkout --`, which in a
   tree holding uncommitted work throws YOUR change away and exits 0. */
writeFileSync(STORE, readFileSync(copy));
const afterSha = sha(readFileSync(STORE, "utf8"));
let cmpOk = false;
try { execFileSync("cmp", ["-s", STORE, copy]); cmpOk = true; } catch { cmpOk = false; }
const bytes = statSync(STORE).size;
console.log(`  restored: ${bytes} bytes on disk (was ${beforeBytes}) · sha256 ${afterSha.slice(0, 16)}`
  + ` · byte-identical by sha256: ${afterSha === beforeSha ? "YES" : "NO"}`
  + ` · by cmp: ${cmpOk ? "YES" : "NO"}`
  + ` · size unchanged: ${bytes === beforeBytes ? "YES" : "NO"}`);
if (afterSha !== beforeSha || !cmpOk || bytes !== beforeBytes || bytes < 100000) {
  console.error("RESTORE FAILED — the tree is NOT as it was. Stop and fix this before believing anything above.");
  process.exit(5);
}

if (ARM === "none") {
  console.log(`\n  BASELINE ARM: the suite whole. Any arm reporting this same figure DID NOT BITE.`);
  process.exit(res.fail === 0 && res.exit === 0 ? 0 : 6);
}
const spec = ARMS[ARM];
const hit = (needle) => res.failed.some((f) => f.includes(needle));
const missedFail = spec.mustFail.filter((n) => !hit(n));
const brokeHeldOpen = spec.mustPass.filter((n) => hit(n));
console.log(`\n  DECLARED vs ACTUAL`);
console.log(`    must FAIL, and did NOT: ${missedFail.length ? missedFail.join(" | ") : "(none)"}`);
console.log(`    must PASS, and BROKE:   ${brokeHeldOpen.length ? brokeHeldOpen.join(" | ") : "(none)"}`);
const verdict = !missedFail.length && !brokeHeldOpen.length && res.reachedFoot;
console.log(`    VERDICT: ${verdict ? "AS DECLARED" : "*** NOT AS DECLARED — this is a finding about the ARM, record it, do not smooth it ***"}`);
process.exit(verdict ? 0 : 7);
