/* REC-114 · THE NEGATIVE CONTROL DRIVER. One arm per run, each arm ALONE.
 *
 * "A SUITE THAT DOES NOT FAIL WHEN YOU BREAK ITS SUBJECT IS NOT A SUITE"
 * (CLAUDE.md). This file breaks the item one way at a time, runs
 * `test/rec114-leg-earned.test.mjs` against the damage, and CHECKS THE RESULT
 * AGAINST WHAT WAS DECLARED BEFORE THE ARM WAS ARMED — both halves: the
 * assertions that MUST fail and the assertions that MUST NOT. An arm that
 * breaks MORE than it declared is as much a finding as one that breaks less.
 *
 * TWO FILES ARE PATCHED, one per arm and never both, so each arm names its own
 * TARGET. Four arms break the RESOLVER in `store.mjs` (the behaviour) and one
 * breaks the DECLARATION in `query.mjs` (the vocabulary) — and that split is
 * the point of arm (d): the declaration is behaviourally invisible, so only an
 * arm aimed at it can show that anything enforces it.
 *
 * AND `git checkout --` IS NEVER USED TO UNDO AN ARM. In a tree holding
 * uncommitted work it restores to HEAD — it throws YOUR change away and exits
 * 0, which has cost this estate a whole implementation twice. Each arm copies
 * the file aside and copies it back, and the restore is verified by sha256 AND
 * by `cmp` AND by size with a floor, because a restore is only believable if it
 * is measured.
 *
 * THE WHOLE CONTROL IS DRIVEN ON A FIXTURE AND NEVER ON THE LIVE INSTANCE, AND
 * THAT IS A LIMIT RATHER THAN A CHOICE. `test/rec88-instance-census.mjs`
 * measured ZERO captures carrying a transcription chain anywhere in store `bio`
 * on 2026-09-15, and the live instance holds ZERO basis legs — so on the live
 * instance every answer this item touches is byte-identical BY CONSTRUCTION and
 * would pass every arm below WITHOUT EXERCISING ONE OF THEM. A control run
 * there would be the costs-nothing equality exactly: an outcome produced for
 * free is not evidence. REC-108 hit this and stated it; so does this.
 *
 * Run: `node test/nc-rec114.mjs <none|a|b|c|d|e>` from `bio-plane/`. */
import "./stdio.mjs";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const ARM = (process.argv[2] || "none").toLowerCase();
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const QUERY = fileURLToPath(new URL("../src/query.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./rec114-leg-earned.test.mjs", import.meta.url));
const PEN = fileURLToPath(new URL("../../.rec114-control-pristine/", import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* Assertions that are properties of OTHER code and must survive every arm:
   block 9's census (about `op=reevaluations` and `#versionCollections`, neither
   of which any arm touches) and block 1's fixture floor. Held open in EVERY
   arm rather than repeated by hand, so an arm that damages the census is caught
   rather than excused. */
const CENSUS_HELD_OPEN = [
  "all three questions carry a leg row",
  "the corpus is FLOORED",
  "the fifth reader is REACHED",
  "A FIFTH READER, NAMED AND DRIVEN",
  "A SIXTH READER, NAMED",
  "...and its CAPPED TWIN",
  "both of its consumers are MEMBER-CLASS",
  "`basisFor` is the raw seam",
];

/* THE ARMS. `find` must occur EXACTLY ONCE in the pristine source — an anchor
   that occurs twice patches the wrong site and an anchor that occurs zero times
   is an arm that never armed, and both have happened in this estate. */
const ARMS = {
  a: {
    file: STORE,
    what: "THE ITEM'S OWN — THE FIX REMOVED. `#legEarnedCapture` hands every row straight back, so "
        + "`op=meaningrows&rows=leg` publishes the AUTHORED letter again, uncapped, exactly as it did "
        + "before this item. This is the arm the ROW names: the listing must go back to publishing the "
        + "authored letter and the suite must FAIL NAMING BOTH LETTERS AND THE SURFACE.",
    find: "  #legEarnedCapture(arm, rows) {\n    if (arm !== \"leg\"",
    with: "  #legEarnedCapture(arm, rows) {\n    if (true) return rows;\n    if (arm !== \"leg\"",
    /* THE HEADLINE IS FIRST ON PURPOSE: it is the assertion that carries the
       earned letter, the authored letter, the axis, the authority AND the
       surface in one `want`, because a failure naming one is one a reader
       cannot act on. */
    mustFail: ["PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
               "READER 1 — the bare listing",
               "READER 2 — `leg:grade=B`",
               "READER 3 — `leg:axis=capture`",
               "publisher-typed text earns its letter",
               "`grade_why` is NULL rather than a filler",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "and the member's authored B survives",
               "...and they AGREE on the clean control",
               "the listing landed on the DERIVED letter",
               "A CONNECTION-AXIS LEG ON A RE-READ DOCUMENT IS UNTOUCHED",
               "...while op=meaningrows, FIXED by this item"],
    /* HELD OPEN. The SOURCE PINS in block 8 must still pass, and that is not a
       gap in them — it is the finding they exist to make legible: a pin reads
       the bytes and cannot see a `return` inserted above them, which is exactly
       why a behavioural arm is not optional. Recorded rather than smoothed. */
    mustPass: [...CENSUS_HELD_OPEN,
               "the listing's resolver EXISTS",
               "it mints NO grade letter",
               "it asks the registry ONCE",
               "it applies the walk's OWN three conditions",
               "and the derived fields are DECLARED",
               "the WALK is untouched",
               "THE TWO SOURCES GENUINELY DISAGREE",
               "THE FILTER STILL SELECTS ON THE AUTHORED COLUMN",
               "ANOTHER MEANING ARM IS BYTE-IDENTICAL"],
  },
  b: {
    file: STORE,
    what: "THE MEMBER'S ACT ERASED. The letter is capped correctly but `grade_authored` and "
        + "`grade_why` are not published — the OTHER defensible answer to this item's doctrine "
        + "question, implemented. THIS IS THE ARM THAT PROVES THE RULING'S COMPROMISE IS REAL "
        + "rather than decorative: without it, a fix that silently replaced a member's authored "
        + "letter would pass every assertion about the earned one.",
    find: "      return { ...r,\n               grade: res ? res.grade : (r ? r.grade : null),\n"
        + "               grade_authored: r ? r.grade : null,\n               grade_why: res ? res.why : null };",
    with: "      return { ...r,\n               grade: res ? res.grade : (r ? r.grade : null) };",
    mustFail: ["PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
               "READER 1 — the bare listing",
               "READER 2 — `leg:grade=B`",
               "READER 3 — `leg:axis=capture`",
               "publisher-typed text earns its letter",
               "`grade_why` is NULL rather than a filler",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "and the member's authored B survives",
               "A CONNECTION-AXIS LEG ON A RE-READ DOCUMENT IS UNTOUCHED",
               "...while op=meaningrows, FIXED by this item"],
    /* The EARNED half is untouched by this arm and must stay green — that is
       what makes it an arm about ERASURE and not a second copy of arm (a). */
    mustPass: [...CENSUS_HELD_OPEN,
               "the listing landed on the DERIVED letter",
               "THE FILTER STILL SELECTS ON THE AUTHORED COLUMN",
               "...and that is not free",
               "the WALK is untouched",
               "ANOTHER MEANING ARM IS BYTE-IDENTICAL"],
  },
  c: {
    file: STORE,
    what: "THE AXIS IGNORED. The capture ceiling is applied to EVERY leg carrying a letter, not "
        + "only to capture-axis legs — the fence tighter than its rule, wearing the costume of "
        + "caution. A connection leg's earned answer is a VALUE the write already pins, so capping "
        + "it at a capture ceiling publishes a letter the record never asked anyone to bound.",
    find: "    const bounded = (r) => !!r && r.grade_axis === \"capture\" && r.grade != null",
    with: "    const bounded = (r) => !!r && r.grade != null",
    mustFail: ["A CONNECTION-AXIS LEG ON A RE-READ DOCUMENT IS UNTOUCHED",
               "...and that is not free",
               "it applies the walk's OWN three conditions"],
    /* EVERYTHING THE ITEM IS ACTUALLY FOR MUST STILL PASS. An arm that also
       broke the capture rows would be breaking a second variable, and the
       refutation would look more confident than the finding it refuted. */
    mustPass: [...CENSUS_HELD_OPEN,
               "PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
               "READER 1 — the bare listing",
               "READER 2 — `leg:grade=B`",
               "READER 3 — `leg:axis=capture`",
               "publisher-typed text earns its letter",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "the listing landed on the DERIVED letter",
               "ANOTHER MEANING ARM IS BYTE-IDENTICAL"],
  },
  d: {
    file: QUERY,
    what: "THE DECLARATION DROPPED — BEHAVIOURALLY INVISIBLE, WHICH IS EXACTLY WHY IT NEEDS AN ARM. "
        + "`rowColumns` stops publishing `rowDerived`, so the ROWS still carry both derived fields "
        + "and every behavioural assertion still passes, while `op=searchfields` — the vocabulary "
        + "route a surface actually composes its table from — stops naming them. This is how "
        + "`target_present` hid for five weeks, reproduced deliberately.",
    find: "          ...Object.keys(m.rowDerived || {}),\n",
    with: "",
    mustFail: ["op=searchfields NAMES both derived columns",
               "and the DECLARED columns are TOTAL"],
    /* FINDING, RECORDED RATHER THAN SMOOTHED — THE ARM WAS RIGHT AND THE
       DECLARATION WAS WRONG. This arm's first declaration ALSO named "and the
       derived fields are DECLARED", and that assertion did NOT fail. It was a
       mistake about what the two assertions measure, and the distinction is
       worth keeping: the source pin asserts the `rowDerived:` DECLARATION
       exists in the MEANING registry, while this arm removes the WIRING in
       `rowColumns` that publishes it. Declaration and wiring are two facts, and
       an arm that broke both would not have been able to show that. It is in
       the held-open half now, where it belongs — and it is the reason this
       item has BOTH a source pin and two op-driven assertions for one field. */
    mustPass: [...CENSUS_HELD_OPEN,
               "and the derived fields are DECLARED",
               "PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
               "READER 1 — the bare listing",
               "publisher-typed text earns its letter",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "THE SELECTOR SAYS WHAT IT SELECTS ON",
               "the listing landed on the DERIVED letter",
               "A CONNECTION-AXIS LEG ON A RE-READ DOCUMENT IS UNTOUCHED"],
  },
  e: {
    file: STORE,
    what: "OVER-STRICTNESS — THE SAME RULE IN A SPELLING THIS ITEM DID NOT ANTICIPATE. The `.map` "
        + "is rewritten as an explicit `for` loop assigning the three fields one at a time. It is "
        + "the same arithmetic, the same conditions and the same output, written the other way. "
        + "CORRECT WORK IN AN UNANTICIPATED SPELLING MUST PASS — an arm that fails here would mean "
        + "the suite is pinning a STYLE and calling it a rule.",
    find: "    return rows.map((r) => {\n"
        + "      const res = bounded(r) ? Store.#capturedAt(r.grade, cap[r.target_id], r.target_id) : null;\n"
        + "      return { ...r,\n"
        + "               grade: res ? res.grade : (r ? r.grade : null),\n"
        + "               grade_authored: r ? r.grade : null,\n"
        + "               grade_why: res ? res.why : null };\n"
        + "    });",
    with: "    const out = [];\n"
        + "    for (const r of rows) {\n"
        + "      let res = null;\n"
        + "      if (bounded(r)) res = Store.#capturedAt(r.grade, cap[r.target_id], r.target_id);\n"
        + "      const row = { ...r };\n"
        + "      row.grade = res ? res.grade : (r ? r.grade : null);\n"
        + "      row.grade_authored = r ? r.grade : null;\n"
        + "      row.grade_why = res ? res.why : null;\n"
        + "      out.push(row);\n"
        + "    }\n"
        + "    return out;",
    mustFail: [],
    mustPass: [...CENSUS_HELD_OPEN,
               "PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
               "READER 1 — the bare listing",
               "READER 2 — `leg:grade=B`",
               "READER 3 — `leg:axis=capture`",
               "publisher-typed text earns its letter",
               "BOTH DERIVED FIELDS ARE PRESENT",
               "the listing landed on the DERIVED letter",
               "op=searchfields NAMES both derived columns",
               "A CONNECTION-AXIS LEG ON A RE-READ DOCUMENT IS UNTOUCHED",
               "the listing's resolver EXISTS",
               "it asks the registry ONCE",
               "it applies the walk's OWN three conditions"],
  },
};

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tail = /rec114-leg-earned: (\d+) pass, (\d+) fail/.exec(out);
  /* THE FOOT, CHECKED. A TypeError inside an assertion ends the module while the
     tally reads clean, so a MISSING tally is reported as -1 and never as 0. */
  return { pass: tail ? Number(tail[1]) : -1, fail: tail ? Number(tail[2]) : -1,
           exit: r.status,
           failed: [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]),
           /* THE FIGURES, NOT ONLY THE LABEL, so the driver can SHOW that the
              headline names both letters and the surface rather than asserting
              that it does. */
           detail: [...out.matchAll(/^ {2}FAIL {2}(.*)\n\s+want (.*)\n\s+got {2}(.*)$/gm)]
             .map((m) => ({ label: m[1], want: m[2], got: m[3] })),
           reachedFoot: !!tail, out };
};

const spec = ARM === "none" ? null : ARMS[ARM];
if (ARM !== "none" && !spec) { console.error(`no such arm: ${ARM}`); process.exit(2); }
const TARGET = spec ? spec.file : STORE;
const NAME = TARGET === STORE ? "store.mjs" : "query.mjs";
const FLOOR = TARGET === STORE ? 500000 : 50000;

mkdirSync(PEN, { recursive: true });
const pristine = readFileSync(TARGET, "utf8");
/* UNIQUELY NAMED PER ARM. A shared `pristine.mjs` is how one arm's damage gets
   restored as another arm's baseline. */
const copy = `${PEN}${NAME}.pristine.${ARM}.mjs`;
writeFileSync(copy, pristine);
const beforeSha = sha(pristine);
/* BYTES ON DISK, NOT STRING LENGTH: these files hold multi-byte characters, so
   a JS string's `.length` and the file's size are DIFFERENT NUMBERS for the same
   unchanged file, and a check printing one against the other reads as a mismatch
   on a perfect restore — the instrument crying wolf exactly when it must be
   believed. */
const beforeBytes = statSync(TARGET).size;
console.log(`REC-114 NC · arm ${ARM} · target ${NAME}`);
console.log(`  pristine ${NAME}: ${beforeBytes} bytes on disk · sha256 ${beforeSha.slice(0, 16)}`);
if (beforeBytes < FLOOR) { console.error(`FLOOR: pristine ${NAME} is implausibly small — refusing`); process.exit(3); }

if (spec) {
  console.log(`  WHAT: ${spec.what}`);
  const hits = pristine.split(spec.find).length - 1;
  console.log(`  anchor occurs ${hits} time(s) — an arm must anchor EXACTLY once`);
  if (hits !== 1) { console.error("ARM NEVER ARMED (or anchored twice). That is a FINDING, not a skip."); process.exit(4); }
  writeFileSync(TARGET, pristine.replace(spec.find, spec.with));
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
writeFileSync(TARGET, readFileSync(copy));
const afterSha = sha(readFileSync(TARGET, "utf8"));
let cmpOk = false;
try { execFileSync("cmp", ["-s", TARGET, copy]); cmpOk = true; } catch { cmpOk = false; }
const bytes = statSync(TARGET).size;
console.log(`  restored: ${bytes} bytes on disk (was ${beforeBytes}) · sha256 ${afterSha.slice(0, 16)}`
  + ` · byte-identical by sha256: ${afterSha === beforeSha ? "YES" : "NO"}`
  + ` · by cmp: ${cmpOk ? "YES" : "NO"}`
  + ` · size unchanged: ${bytes === beforeBytes ? "YES" : "NO"}`);
if (afterSha !== beforeSha || !cmpOk || bytes !== beforeBytes || bytes < FLOOR) {
  console.error("RESTORE FAILED — the tree is NOT as it was. Stop and fix this before believing anything above.");
  process.exit(5);
}

if (ARM === "none") {
  console.log(`\n  BASELINE ARM: the suite whole. Any arm reporting this same figure DID NOT BITE.`);
  process.exit(res.fail === 0 && res.exit === 0 ? 0 : 6);
}
const hit = (needle) => res.failed.some((f) => f.includes(needle));
const missedFail = spec.mustFail.filter((n) => !hit(n));
const brokeHeldOpen = spec.mustPass.filter((n) => hit(n));
console.log(`\n  DECLARED vs ACTUAL`);
console.log(`    must FAIL, and did NOT: ${missedFail.length ? missedFail.join(" | ") : "(none)"}`);
console.log(`    must PASS, and BROKE:   ${brokeHeldOpen.length ? brokeHeldOpen.join(" | ") : "(none)"}`);
const verdict = !missedFail.length && !brokeHeldOpen.length && res.reachedFoot;
console.log(`    VERDICT: ${verdict ? "AS DECLARED" : "*** NOT AS DECLARED — this is a finding about the ARM, record it, do not smooth it ***"}`);
process.exit(verdict ? 0 : 7);
