/* REC-118 · THE NEGATIVE CONTROL DRIVER. One arm per run, each arm ALONE.
 *
 * "A SUITE THAT DOES NOT FAIL WHEN YOU BREAK ITS SUBJECT IS NOT A SUITE"
 * (CLAUDE.md). This file breaks the item one way at a time, runs
 * `test/rec118-reeval-earned.test.mjs` against the damage, and CHECKS THE
 * RESULT AGAINST WHAT WAS DECLARED BEFORE THE ARM WAS ARMED — both halves: the
 * assertions that MUST fail and the assertions that MUST NOT. An arm that
 * breaks MORE than it declared is as much a finding as one that breaks less.
 *
 * "BREAK ONLY THE THING", AND THAT RULE SHAPED ARM (a) RATHER THAN DECORATING
 * IT. The obvious way to remove this item's fix is to make the resolver return
 * early, or to neuter its `bounded` predicate — and BOTH perturb a second
 * variable, because they delete the very source text block 5's pins read. The
 * suite would then fail for two reasons at once and the behavioural finding
 * would be buried under a pin failure. So arm (a) discards the REGISTRY'S
 * ANSWER and changes nothing else: every source pin holds open, the cap is
 * gone, and the failure is attributable. That is CONDUCT #11's rule about a
 * control whose method perturbs a second variable, applied in advance rather
 * than discovered afterwards.
 *
 * AND THE PINS HOLDING OPEN UNDER ARM (a) IS ITSELF THE FINDING THEY EXIST TO
 * MAKE LEGIBLE: a source pin reads bytes and cannot see a value flowing wrong
 * through them, which is exactly why a behavioural arm is not optional.
 *
 * ARM (b) IS THE ONE THAT MATTERS AS MUCH AS (a), and the row names it. The
 * letter caps correctly but the member's authored letter is not published —
 * the OTHER defensible answer to this item's doctrine question, implemented.
 * Note what it does NOT break: "THE TWO HALVES OF ONE ANSWER NOW AGREE" still
 * passes, because capping alone produces the agreement. Without arm (b), a fix
 * that silently erased a member's act would satisfy this item's headline
 * acceptance. That is what proves the ruling's compromise is load-bearing
 * rather than decorative.
 *
 * AND `git checkout --` IS NEVER USED TO UNDO AN ARM. In a tree holding
 * uncommitted work it restores to HEAD — it throws YOUR change away and exits
 * 0, which has cost this estate a whole implementation twice. Each arm copies
 * the file aside and copies it back, and the restore is verified by sha256 AND
 * by `cmp` AND by size with a floor, because a restore is only believable if
 * it is measured.
 *
 * THE WHOLE CONTROL IS DRIVEN ON A FIXTURE AND NEVER ON THE LIVE INSTANCE, AND
 * THAT IS A LIMIT RATHER THAN A CHOICE. `test/rec88-instance-census.mjs`
 * measured ZERO captures carrying a transcription chain anywhere in store `bio`
 * on 2026-09-15, and the live instance holds ZERO basis legs — so on the live
 * instance every answer this item touches is byte-identical BY CONSTRUCTION and
 * would pass every arm below WITHOUT EXERCISING ONE OF THEM. A control run
 * there would be the costs-nothing equality exactly: an outcome produced for
 * free is not evidence. REC-108 and REC-114 both hit this and stated it; so
 * does this.
 *
 * Run: `node test/nc-rec118.mjs <none|a|b|c|d>` from `bio-plane/`. */
import "./stdio.mjs";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const ARM = (process.argv[2] || "none").toLowerCase();
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./rec118-reeval-earned.test.mjs", import.meta.url));
const PEN = `${controlPen("rec118")}/`;
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* Assertions that are properties of the FIXTURE or of OTHER code and must
   survive every arm. Held open in EVERY arm rather than repeated by hand, so an
   arm that quietly empties the obligation list — under which every assertion
   about its contents would pass vacuously — is caught rather than excused. */
const HELD_OPEN_ALWAYS = [
  "BOTH obligations are REACHED through the op",
  "the corpus is FLOORED",
  "the SUP obligation carries BOTH legs on ONE inquiry",
  "and the `strength` block is PRESENT",
  "the STORED row is untouched",
  "the rest of the envelope is UNMOVED",
  "the WALK is untouched",
  "and REC-114's listing resolver is untouched",
  "the leg SELECT now reads `target_type`",
  "and the published leg shape carries NO `target_type`",
];

/* THE ARMS. `find` must occur EXACTLY ONCE in the pristine source — an anchor
   that occurs twice patches the wrong site and an anchor that occurs zero times
   is an arm that never armed, and both have happened in this estate. */
const ARMS = {
  a: {
    what: "THE ITEM'S OWN — THE FIX REMOVED. The registry is still asked, and its answer is "
        + "DISCARDED, so every leg comes back with no ceiling and `op=reevaluations` publishes the "
        + "AUTHORED letter again, uncapped, exactly as it did before this item — beside the same "
        + "capped `strength` block. This is the arm the ROW names: the suite must FAIL NAMING BOTH "
        + "LETTERS AND THE OP. It touches no source text block 5 reads, so the pins hold open and "
        + "the failure is attributable to the behaviour alone.",
    /* THE ANCHOR CARRIES THE LINE ABOVE IT, AND THAT IS A FINDING RATHER THAN
       A STYLE CHOICE — RECORDED BECAUSE THE INSTRUMENT EARNED IT. The first
       spelling of this arm anchored on the registry line ALONE:

         `      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})`

       and the driver refused it with `anchor occurs 2 time(s)`. That line is
       BYTE-IDENTICAL in `#legEarnedCapture`, because this item reused REC-114's
       shape deliberately — so the reuse that makes the two readers one rule is
       exactly what made the anchor ambiguous. `String.prototype.replace` with a
       string argument replaces only the FIRST occurrence, so this arm would
       have patched **REC-114's listing instead of this item's resolver**, run a
       suite that never touches it, reported a clean pass, and been recorded as
       evidence that the subject cannot be broken. An arm that fires at the
       wrong thing and reports success at refuting is CONDUCT #11's
       arm-that-did-not-arm class with the sign flipped. The preceding `for`
       line is unique to this method and disambiguates it. */
    find: "    for (const o of obligations) for (const l of (o.legs ?? [])) if (bounded(l)) targets.add(l.target_id);\n"
        + "    const cap = targets.size\n"
        + "      ? (this.earnedBasisRegistry(null, [...targets])?.earned?.capture || {})",
    with: "    for (const o of obligations) for (const l of (o.legs ?? [])) if (bounded(l)) targets.add(l.target_id);\n"
        + "    const cap = targets.size\n"
        + "      ? (this.earnedBasisRegistry(null, [...targets]) ? {} : {})",
    mustFail: ["op=reevaluations PUBLISHES THE EARNED LETTER",
               "and `grade_why` NAMES THE TARGET",
               "THE TWO HALVES OF ONE ANSWER NOW AGREE ABOUT THE SAME LEG",
               "...and the agreement is on the EARNED letter",
               "...and the two member-facing surfaces now AGREE with each other"],
    /* THE SOURCE PINS ARE ALL HELD OPEN, DELIBERATELY. See the header: an arm
       that also broke them would be a control perturbing a second variable. */
    mustPass: [...HELD_OPEN_ALWAYS,
               "the authored letter and the strength block GENUINELY DISAGREE",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "the member's authored B SURVIVES",
               "the op's resolver EXISTS and calls `Store.#capturedAt`",
               "it mints NO grade letter",
               "it asks the registry ONCE",
               "it does NOT reach for `strengthOf`",
               "ALL THREE READERS OF ONE RULE CARRY THE SAME THREE CONDITIONS",
               "AN OBLIGATION NEEDING NO CAP IS BYTE-IDENTICAL",
               "...and the clean obligation's two halves agree too",
               "`grade_why` is NULL rather than a filler",
               "A CONNECTION-AXIS LEG IN THE SAME OBLIGATION IS UNTOUCHED",
               "...and that is NOT FREE"],
  },
  b: {
    what: "THE MEMBER'S ACT ERASED. The letter is capped correctly but `grade_authored` and "
        + "`grade_why` are not published — the OTHER defensible answer to this item's doctrine "
        + "question, implemented. THIS IS THE ARM THAT PROVES THE RULING'S COMPROMISE IS REAL: "
        + "note that 'THE TWO HALVES OF ONE ANSWER NOW AGREE' still PASSES under it, because "
        + "capping alone produces the agreement. Without this arm a fix that silently replaced a "
        + "member's authored letter would satisfy this item's headline acceptance.",
    find: "                 target_edition: l.target_edition ?? null,\n"
        + "                 grade_authored: l.grade ?? null,\n"
        + "                 grade_why: res ? res.why : null };",
    with: "                 target_edition: l.target_edition ?? null };",
    mustFail: ["op=reevaluations PUBLISHES THE EARNED LETTER",
               "and `grade_why` NAMES THE TARGET",
               "the authored letter and the strength block GENUINELY DISAGREE",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "the member's authored B SURVIVES",
               "...and the two member-facing surfaces now AGREE with each other",
               "AN OBLIGATION NEEDING NO CAP IS BYTE-IDENTICAL",
               "`grade_why` is NULL rather than a filler",
               "A CONNECTION-AXIS LEG IN THE SAME OBLIGATION IS UNTOUCHED"],
    mustPass: [...HELD_OPEN_ALWAYS,
               "THE TWO HALVES OF ONE ANSWER NOW AGREE ABOUT THE SAME LEG",
               "...and the agreement is on the EARNED letter",
               "...and the clean obligation's two halves agree too",
               "...and that is NOT FREE",
               "the op's resolver EXISTS and calls `Store.#capturedAt`",
               "it asks the registry ONCE",
               "ALL THREE READERS OF ONE RULE CARRY THE SAME THREE CONDITIONS"],
  },
  c: {
    what: "THE AXIS IGNORED — the capture ceiling applied to every leg carrying a letter. The "
        + "connection leg in the SAME obligation moves to C. This is the fence-tighter-than-its-rule "
        + "failure, caught in the direction that publishes a letter nobody asked to bound — and it "
        + "is also the arm that would catch a fix which made the two halves 'agree' by copying "
        + "`strength.capture` into every leg, which is the cheapest wrong answer to this item.",
    find: "    const bounded = (l) => !!l && l.grade_axis === \"capture\" && l.grade != null",
    with: "    const bounded = (l) => !!l && l.grade != null",
    mustFail: ["A CONNECTION-AXIS LEG IN THE SAME OBLIGATION IS UNTOUCHED",
               "...and that is NOT FREE",
               "ALL THREE READERS OF ONE RULE CARRY THE SAME THREE CONDITIONS"],
    mustPass: [...HELD_OPEN_ALWAYS,
               "op=reevaluations PUBLISHES THE EARNED LETTER",
               "and `grade_why` NAMES THE TARGET",
               "the authored letter and the strength block GENUINELY DISAGREE",
               "THE TWO HALVES OF ONE ANSWER NOW AGREE ABOUT THE SAME LEG",
               "...and the agreement is on the EARNED letter",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "the member's authored B SURVIVES",
               "...and the two member-facing surfaces now AGREE with each other",
               "AN OBLIGATION NEEDING NO CAP IS BYTE-IDENTICAL",
               "...and the clean obligation's two halves agree too",
               "`grade_why` is NULL rather than a filler"],
  },
  d: {
    what: "OVER-STRICTNESS — the SAME rule written as an explicit `for` loop with a named row "
        + "instead of a `.map` with an object literal. Correct work in a spelling this item did not "
        + "anticipate MUST PASS. An arm that fails here would mean the suite is asserting the "
        + "IMPLEMENTATION rather than the answer.",
    find: "      o.legs = (o.legs ?? []).map((l) => {\n"
        + "        const res = bounded(l) ? Store.#capturedAt(l.grade, cap[l.target_id], l.target_id) : null;\n"
        + "        return { ord: l.ord, role: l.role || null,\n"
        + "                 grade: res ? res.grade : (l.grade ?? null),\n"
        + "                 grade_axis: l.grade_axis ?? null,\n"
        + "                 grade_source: l.grade_source ?? null,\n"
        + "                 target_edition: l.target_edition ?? null,\n"
        + "                 grade_authored: l.grade ?? null,\n"
        + "                 grade_why: res ? res.why : null };\n"
        + "      });",
    with: "      const out = [];\n"
        + "      for (const l of (o.legs ?? [])) {\n"
        + "        const res = bounded(l) ? Store.#capturedAt(l.grade, cap[l.target_id], l.target_id) : null;\n"
        + "        const row = { ord: l.ord, role: l.role || null,\n"
        + "                      grade: res ? res.grade : (l.grade ?? null),\n"
        + "                      grade_axis: l.grade_axis ?? null,\n"
        + "                      grade_source: l.grade_source ?? null,\n"
        + "                      target_edition: l.target_edition ?? null,\n"
        + "                      grade_authored: l.grade ?? null,\n"
        + "                      grade_why: res ? res.why : null };\n"
        + "        out.push(row);\n"
        + "      }\n"
        + "      o.legs = out;",
    mustFail: [],
    mustPass: [...HELD_OPEN_ALWAYS,
               "op=reevaluations PUBLISHES THE EARNED LETTER",
               "THE TWO HALVES OF ONE ANSWER NOW AGREE ABOUT THE SAME LEG",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "the member's authored B SURVIVES",
               "ALL THREE READERS OF ONE RULE CARRY THE SAME THREE CONDITIONS",
               "A CONNECTION-AXIS LEG IN THE SAME OBLIGATION IS UNTOUCHED",
               "AN OBLIGATION NEEDING NO CAP IS BYTE-IDENTICAL"],
  },
};
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).map(([arm, a]) => ({ arm, file: STORE, find: a.find, put: a.with })));

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tail = /rec118-reeval-earned: (\d+) pass, (\d+) fail/.exec(out);
  /* THE FOOT, CHECKED. A TypeError inside an assertion ends the module while the
     tally reads clean, so a MISSING tally is reported as -1 and never as 0. */
  return { pass: tail ? Number(tail[1]) : -1, fail: tail ? Number(tail[2]) : -1,
           exit: r.status,
           failed: [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]),
           /* THE FIGURES, NOT ONLY THE LABEL, so the driver can SHOW that the
              headline names both letters and the op rather than asserting it. */
           detail: [...out.matchAll(/^ {2}FAIL {2}(.*)\n\s+want (.*)\n\s+got {2}(.*)$/gm)]
             .map((m) => ({ label: m[1], want: m[2], got: m[3] })),
           reachedFoot: !!tail, out };
};

const spec = ARM === "none" ? null : ARMS[ARM];
if (ARM !== "none" && !spec) { console.error(`no such arm: ${ARM}`); process.exit(2); }
const FLOOR = 500000;

mkdirSync(PEN, { recursive: true });
const pristine = readFileSync(STORE, "utf8");
/* UNIQUELY NAMED PER ARM. A shared `pristine.mjs` is how one arm's damage gets
   restored as another arm's baseline. */
const copy = `${PEN}store.mjs.pristine.${ARM}.mjs`;
writeFileSync(copy, pristine);
const beforeSha = sha(pristine);
/* BYTES ON DISK, NOT STRING LENGTH: this file holds multi-byte characters, so a
   JS string's `.length` and the file's size are DIFFERENT NUMBERS for the same
   unchanged file, and a check printing one against the other reads as a mismatch
   on a perfect restore — the instrument crying wolf exactly when it must be
   believed. */
const beforeBytes = statSync(STORE).size;
console.log(`REC-118 NC · arm ${ARM} · target store.mjs`);
console.log(`  pristine store.mjs: ${beforeBytes} bytes on disk · sha256 ${beforeSha.slice(0, 16)}`);
if (beforeBytes < FLOOR) { console.error("FLOOR: pristine store.mjs is implausibly small — refusing"); process.exit(3); }

if (spec) {
  console.log(`  WHAT: ${spec.what}`);
  const hits = pristine.split(spec.find).length - 1;
  console.log(`  anchor occurs ${hits} time(s) — an arm must anchor EXACTLY once`);
  if (hits !== 1) { console.error("ARM NEVER ARMED (or anchored twice). That is a FINDING, not a skip."); process.exit(4); }
  writeFileSync(STORE, pristine.replace(spec.find, spec.with));
  console.log(`  DECLARED BEFORE RUNNING — must FAIL: ${spec.mustFail.length}; must PASS: ${spec.mustPass.length}`);
}

const res = runSuite();
console.log(`\n  RESULT  ${res.pass} pass, ${res.fail} fail, exit ${res.exit}`
  + `${res.reachedFoot ? "" : "  *** THE SUITE DID NOT REACH ITS OWN FOOT — the tally is -1, not 0 ***"}`);
if (res.failed.length) console.log(res.failed.map((f) => {
  const d = res.detail.find((x) => x.label === f);
  return `    FAILED: ${f}`
       + (d ? `\n              want ${d.want}\n              got  ${d.got}` : "");
}).join("\n"));

/* RESTORE FIRST, VERIFY SECOND. */
writeFileSync(STORE, readFileSync(copy));
const afterSha = sha(readFileSync(STORE, "utf8"));
let cmpOk = false;
try { execFileSync("cmp", ["-s", STORE, copy]); cmpOk = true; } catch { cmpOk = false; }
const bytes = statSync(STORE).size;
console.log(`  restored: ${bytes} bytes on disk (was ${beforeBytes}) · sha256 ${afterSha.slice(0, 16)}`
  + ` · byte-identical by sha256: ${afterSha === beforeSha ? "YES" : "NO"}`
  + ` · by cmp: ${cmpOk ? "YES" : "NO"}`
  + ` · size unchanged: ${bytes === beforeBytes ? "YES" : "NO"}`);
if (afterSha !== beforeSha || !cmpOk || bytes !== beforeBytes || bytes < FLOOR) {
  console.error("RESTORE FAILED — the tree is NOT as it was. Stop and fix this before believing anything above.");
  process.exit(5);
}

if (ARM === "none") {
  console.log("\n  BASELINE ARM: the suite whole. Any arm reporting this same figure DID NOT BITE.");
  process.exit(res.fail === 0 && res.exit === 0 ? 0 : 6);
}
const hit = (needle) => res.failed.some((f) => f.includes(needle));
const missedFail = spec.mustFail.filter((n) => !hit(n));
const brokeHeldOpen = spec.mustPass.filter((n) => hit(n));
console.log("\n  DECLARED vs ACTUAL");
console.log(`    must FAIL, and did NOT: ${missedFail.length ? missedFail.join(" | ") : "(none)"}`);
console.log(`    must PASS, and BROKE:   ${brokeHeldOpen.length ? brokeHeldOpen.join(" | ") : "(none)"}`);
const verdict = !missedFail.length && !brokeHeldOpen.length && res.reachedFoot;
console.log(`    VERDICT: ${verdict ? "AS DECLARED" : "*** NOT AS DECLARED — this is a finding about the ARM, record it, do not smooth it ***"}`);
process.exit(verdict ? 0 : 7);
