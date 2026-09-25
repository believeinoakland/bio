/* D-177 · THE NEGATIVE CONTROL DRIVER for `test/inquirystrength.test.mjs` section 9 — the capture grade
 * MEASURED from a capture's fetch path. One arm per run, each arm ALONE, each checked against what was
 * DECLARED before it was armed: the assertions that MUST fail and the ones that MUST NOT. The mechanics
 * (anchor exactly once, a per-arm pristine copy in `controlPen`, restore verified by sha256 AND `cmp` AND
 * size with a floor, the suite's own foot read or -1) are REC-105's driver's, reused unchanged below.
 *
 * Run: `node test/nc-d177.mjs <none|a|b|c|d>` from `bio-plane/`. */
import "./stdio.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { controlPen } from "./pen.mjs";

const ARM = (process.argv[2] || "none").toLowerCase();
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./inquirystrength.test.mjs", import.meta.url));
const PEN = `${controlPen("d177")}/`;
const sha = (s) => createHash("sha256").update(s).digest("hex");

const HEADLINE = "A MEMBER-AUTHORED WEAKER LETTER ON A DIRECT CAPTURE READS THE EARNED GRADE";
const ARMS = {
  a: {
    what: "THE ROW'S OWN — READ THE AUTHORED GRADE AGAIN. The measured floor in `#capturedAt` never "
        + "applies, so a weaker letter a member authored on a document this instance fetched directly "
        + "reads as authored, exactly as before this item.",
    find: "    if (measured != null && Store.#GRADE_RANK[stated] < Store.#GRADE_RANK[measured])",
    with: "    if (false && measured != null && Store.#GRADE_RANK[stated] < Store.#GRADE_RANK[measured])",
    mustFail: [HEADLINE, "and the walk says WHY, in the registry's own words"],
    mustPass: ["BEFORE the fetch is recorded the route is unrecorded",
               "the registry now MEASURES the document's capture grade",
               "the leg's own AUTHORED letter is untouched in the record",
               "a direct capture's measured letter is its fidelity bound",
               "a leg stating exactly the measured letter reads it with NO reason",
               "an archive-only document's route is NAMED",
               "and the member's weaker letter on it STANDS",
               "a leg stating a WEAKER letter than the ceiling keeps its own"],
  },
  b: {
    what: "THE ROUTE IGNORED — any recorded source counts as a direct fetch, so an archive replay earns "
        + "the direct letter: a doctrine value nobody ruled, invented by the code.",
    find: "      if (vias.includes(\"direct\")) {",
    with: "      if (vias.length) {",
    mustFail: ["an archive-only document's route is NAMED", "and the member's weaker letter on it STANDS"],
    mustPass: [HEADLINE, "BEFORE the fetch is recorded the route is unrecorded",
               "a leg stating a WEAKER letter than the ceiling keeps its own"],
  },
  c: {
    what: "THE CEILING READ AS A MEASUREMENT — the floor is taken from the ceiling for every document, "
        + "fetched or not, so a route the record never saw is graded as if it had.",
    find: "    const measured = earned.fetch && earned.fetch.earned != null ? earned.fetch.earned : null;",
    /* FINDING, 2026-09-25, RECORDED RATHER THAN SMOOTHED — THE ARM DID NOT ARM AS DECLARED ON ITS FIRST
       SPELLING. `const measured = earned.grade;` alone left the reason sentence reading `earned.fetch.why` on
       an entry with no fetch key, so `#capturedAt` THREW inside the promote's projection writer and the suite
       died in section 1 at -1/-1 without reaching one declared assertion: a second variable (a crash) moved
       with the first, which refutes nothing. The arm now gives the sentence an empty reason so ONLY the
       floor's source moves. */
    with: "    const measured = earned.grade; if (!earned.fetch) earned.fetch = { why: \"\" };",
    mustFail: ["BEFORE the fetch is recorded the route is unrecorded",
               "and the member's weaker letter on it STANDS",
               "a leg stating a WEAKER letter than the ceiling keeps its own"],
    mustPass: [HEADLINE, "a direct capture's measured letter is its fidelity bound",
               "a leg stating exactly the measured letter reads it with NO reason"],
  },
  d: {
    what: "OVER-STRICTNESS. The same floor written in the registry's own `BASIS_GRADES.indexOf` idiom "
        + "(a SMALLER index is the STRONGER letter). Correct work in a spelling this item did not use "
        + "must PASS.",
    find: "    if (measured != null && Store.#GRADE_RANK[stated] < Store.#GRADE_RANK[measured])",
    with: "    if (measured != null && BASIS_GRADES.indexOf(stated) > BASIS_GRADES.indexOf(measured))",
    mustFail: [],
    mustPass: [HEADLINE, "and the walk says WHY, in the registry's own words",
               "an archive-only document's route is NAMED",
               "a leg stating a WEAKER letter than the ceiling keeps its own"],
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
console.log(`D-177 NC · arm ${ARM}`);
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
/* A MISSING FOOT IS SHOWN, not only counted: the suite's own last lines say what ended it. */
if (!res.reachedFoot) console.log(res.out.trimEnd().split("\n").slice(-12).map((l) => `    | ${l}`).join("\n"));

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
