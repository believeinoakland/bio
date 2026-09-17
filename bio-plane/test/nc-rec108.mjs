/* REC-108 · THE NEGATIVE CONTROL DRIVER. One arm per run, each arm ALONE.
 *
 * "A SUITE THAT DOES NOT FAIL WHEN YOU BREAK ITS SUBJECT IS NOT A SUITE"
 * (CLAUDE.md). This file breaks `src/query.mjs` one way at a time, runs
 * `test/rec108-cache-asof.test.mjs` against the damage, and CHECKS THE RESULT
 * AGAINST WHAT WAS DECLARED BEFORE THE ARM WAS ARMED — both halves: the
 * assertions that MUST fail and the assertions that MUST NOT. An arm that
 * breaks more than it declared is as much a finding as one that breaks less.
 *
 * EVERY ARM PATCHES `query.mjs` AND NONE PATCHES `store.mjs`, and that is worth
 * a line rather than a silence: this item's whole claim is that it left the
 * COMPUTATION alone, so `store.mjs` holds one published line and one comment
 * and there is nothing there to break that would not simply delete a field.
 * The suite pins the untouched-ness structurally instead (block 6), which is
 * the assertion an arm here could not replace.
 *
 * AND `git checkout --` IS NEVER USED TO UNDO AN ARM. In a tree holding
 * uncommitted work it restores to HEAD — it throws YOUR change away and exits
 * 0, which has cost this estate a whole implementation twice. Each arm copies
 * the file aside and copies it back, and the restore is verified by sha256 AND
 * by `cmp` AND by size with a floor, because a restore is only believable if it
 * is measured.
 *
 * Run: `node test/nc-rec108.mjs <none|a|b|c|d|e>` from `bio-plane/`. */
import "./stdio.mjs";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const ARM = (process.argv[2] || "none").toLowerCase();
const TARGET = fileURLToPath(new URL("../src/query.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./rec108-cache-asof.test.mjs", import.meta.url));
const PEN = fileURLToPath(new URL("../../.rec108-control-pristine/", import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* THE ARMS. `find` must occur EXACTLY ONCE in the pristine source — an anchor
   that occurs twice patches the wrong site and an anchor that occurs zero times
   is an arm that never armed, and both have happened in this estate. */
const ARMS = {
  a: {
    what: "THE ITEM'S OWN — THE FIX REMOVED. `cachedNotes` answers `[]` for every query, so the "
        + "cache publishes the stronger letter again with nothing in the answer saying what the "
        + "letter is a value OF. This is the arm that proves the fix is load-bearing rather than "
        + "decorative, and it is also this item's one-line reversal if IC-108 is rejected.",
    find: "export function cachedNotes(routes, { facets = true, ordered = true } = {}) {\n  const order",
    with: "export function cachedNotes(routes, { facets = true, ordered = true } = {}) {\n  if (true) return [];\n  const order",
    /* THE HEADLINE IS FIRST ON PURPOSE: it is the assertion that NAMES BOTH
       FIGURES — the letter the member was filtered by and the letter the record
       derives now — because a failure naming one is one a reader cannot act on. */
    mustFail: ["the letter a member is FILTERED BY, the letter the record DERIVES NOW",
               "FILTER only", "FACET only", "SORT only", "ALL THREE at once",
               "the entry names the column, the authority",
               "the sentence a member reads NAMES THE ACT",
               "a `count` runs neither facets nor an order",
               "the statement fires over an AGREEING pair too"],
    /* THE DIVERGENCE ITSELF IS NOT THIS ITEM'S DOING and must survive the arm:
       the cache went stale before this item and still does. An arm that also
       broke these would be breaking a second variable. */
    mustPass: ["and the question IS returned by a `B or better` filter",
               "while op=inquirystrength — the authority",
               "the cached column MOVES, B -> C",
               "a query that consults NO cached column answers with an EMPTY statement",
               "op=inquirystrength carries NO new key",
               "THE FOURTH READER IS CLOSED"],
  },
  b: {
    what: "THE FACET ROUTE DROPPED. `cachedRoutes` marks only what the member TYPED, so the "
        + "DEFAULT FACET — the route D-379's own text does not name, and the one that answers a "
        + "member who never asked — goes unstated. THIS IS THE ARM THAT PROVES THE CENSUS "
        + "CHANGED THE FIX rather than decorating it: without it, a sentence on the selector "
        + "alone would have passed every other assertion in the suite.",
    find: "  for (const f of facetList) mark(FIELDS[f]?.col, \"facet\");\n",
    with: "",
    /* FINDING, RECORDED RATHER THAN SMOOTHED: this arm's first declaration also
       named "the statement fires over an AGREEING pair too", and it did NOT
       fail. The arm is right and the declaration was wrong — that assertion
       queries with `facets=none`, so it has no facet route to lose and is blind
       to this break BY CONSTRUCTION. It belongs in the held-open half, where it
       now is, and a reader who expected it to detect this break was reading it
       wrong. Exactly the shape nc-rec105's arm (a) recorded. */
    mustFail: ["FACET only", "ALL THREE at once"],
    mustPass: ["the letter a member is FILTERED BY, the letter the record DERIVES NOW",
               "FILTER only", "SORT only",
               "the statement fires over an AGREEING pair too",
               "a query that consults NO cached column answers with an EMPTY statement",
               "the cached column MOVES, B -> C"],
  },
  c: {
    what: "THE MARKER LISTED INSTEAD OF DERIVED. `CACHED_FIELDS` hand-written over the two "
        + "columns it happens to know about today, which BEHAVES IDENTICALLY and is exactly why "
        + "it needs an arm: a list of spellings goes stale the moment a third cached column is "
        + "written, and nothing behavioural would ever notice. Only the inversion pin sees it.",
    find: "export const CACHED_FIELDS = Object.fromEntries(\n  Object.entries(FIELDS).filter(([, f]) => f.asOf)\n    .map(([name, f]) => [f.col, { field: name, asOf: f.asOf, authority: f.authority, why: f.why }]));",
    with: "export const CACHED_FIELDS = {\n"
        + "  inquiry_capture_strength: { field: \"capture\", asOf: FIELDS.capture.asOf,\n"
        + "    authority: FIELDS.capture.authority, why: FIELDS.capture.why },\n"
        + "  inquiry_connection_strength: { field: \"connection\", asOf: FIELDS.connection.asOf,\n"
        + "    authority: FIELDS.connection.authority, why: FIELDS.connection.why },\n};",
    mustFail: ["`CACHED_FIELDS` is DERIVED from FIELDS and never listed beside it"],
    mustPass: ["the letter a member is FILTERED BY, the letter the record DERIVES NOW",
               "FILTER only", "FACET only", "SORT only", "ALL THREE at once",
               "a query that consults NO cached column answers with an EMPTY statement"],
  },
  d: {
    what: "THE ROUTES NOT GATED ON WHAT ACTUALLY RAN. `cachedNotes` ignores its options, so an "
        + "answer that carries no facets still claims a facet route and a `count` claims a sort. "
        + "This is the honesty mechanism itself OVERCLAIMING — the defect wearing the fix's "
        + "clothes, and the reason the routes a plan CAN reach and the routes a call DID run are "
        + "two different facts.",
    find: "      const via = [\"filter\", \"facet\", \"sort\"].filter((r) =>\n        set.has(r) && (r !== \"facet\" || facets) && (r !== \"sort\" || ordered));",
    with: "      const via = [\"filter\", \"facet\", \"sort\"].filter((r) => set.has(r));",
    /* The last line was ADDED after the arm was first run: it bit one MORE than
       declared and in the correct direction — `op=meaningrows` also stopped
       being able to say it read no cache, because `compile()` fills `facetList`
       with the defaults whatever the caller will do with them. Declared here so
       the arm's record matches its measurement rather than being generous. */
    mustFail: ["FILTER only", "SORT only", "a `count` runs neither facets nor an order",
               "a query that consults NO cached column answers with an EMPTY statement",
               "the statement fires over an AGREEING pair too",
               "it is NOT a cache — it reads `inquiry_basis` live"],
    mustPass: ["the letter a member is FILTERED BY, the letter the record DERIVES NOW",
               "the cached column MOVES, B -> C",
               "op=inquirystrength carries NO new key",
               "THE FOURTH READER IS CLOSED"],
  },
  e: {
    what: "OVER-STRICTNESS. The SAME rule, written as a lookup table instead of a chain of "
        + "short-circuits. Correct work in a spelling this item did not anticipate must PASS — a "
        + "suite that only recognises its own idiom is a fence tighter than its rule, which is an "
        + "undeclared interface change wearing the costume of caution. "
        + "AND THE WHOLE SUITE IS DRIVEN ON A FIXTURE, NEVER ON THE LIVE INSTANCE, BECAUSE THE "
        + "LIVE INSTANCE CANNOT EXERCISE IT: `test/rec88-instance-census.mjs` measured ZERO "
        + "captures carrying a transcription chain anywhere in store `bio` on 2026-09-15, so "
        + "every answer there is byte-identical by construction and would pass every arm above "
        + "without exercising one of them.",
    find: "      const via = [\"filter\", \"facet\", \"sort\"].filter((r) =>\n        set.has(r) && (r !== \"facet\" || facets) && (r !== \"sort\" || ordered));",
    with: "      const allow = { filter: true, facet: facets, sort: ordered };\n"
        + "      const via = [\"filter\", \"facet\", \"sort\"].filter((r) => set.has(r) && allow[r]);",
    mustFail: [],
    mustPass: ["the letter a member is FILTERED BY, the letter the record DERIVES NOW",
               "FILTER only", "FACET only", "SORT only", "ALL THREE at once",
               "a `count` runs neither facets nor an order",
               "a query that consults NO cached column answers with an EMPTY statement",
               "the cached column MOVES, B -> C", "THE FOURTH READER IS CLOSED"],
  },
};

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tail = /rec108-cache-asof: (\d+) pass, (\d+) fail/.exec(out);
  /* THE FOOT, CHECKED. A TypeError inside an assertion ends the module while the
     tally reads clean, so a MISSING tally is reported as -1 and never as 0. */
  return { pass: tail ? Number(tail[1]) : -1, fail: tail ? Number(tail[2]) : -1,
           exit: r.status,
           failed: [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]),
           /* THE FIGURES, NOT ONLY THE LABEL. This row requires the failure to
              NAME BOTH the letter a member was filtered by and the letter the
              record derives, *because a failure naming one is a failure a reader
              cannot act on* — and a driver that printed labels alone could not
              show that it does. So the suite's own `want`/`got` lines travel
              with each failure. */
           detail: [...out.matchAll(/^ {2}FAIL {2}(.*)\n\s+want (.*)\n\s+got {2}(.*)$/gm)]
             .map((m) => ({ label: m[1], want: m[2], got: m[3] })),
           reachedFoot: !!tail, out };
};

mkdirSync(PEN, { recursive: true });
const pristine = readFileSync(TARGET, "utf8");
/* UNIQUELY NAMED PER ARM. A shared `pristine.mjs` is how one arm's damage gets
   restored as another arm's baseline. */
const copy = `${PEN}query.pristine.${ARM}.mjs`;
writeFileSync(copy, pristine);
const beforeSha = sha(pristine);
/* BYTES ON DISK, NOT STRING LENGTH: this file holds multi-byte characters, so a
   JS string's `.length` and the file's size are DIFFERENT NUMBERS for the same
   unchanged file, and a check printing one against the other reads as a mismatch
   on a perfect restore — the instrument crying wolf exactly when it must be
   believed. */
const beforeBytes = statSync(TARGET).size;
console.log(`REC-108 NC · arm ${ARM}`);
console.log(`  pristine query.mjs: ${beforeBytes} bytes on disk · sha256 ${beforeSha.slice(0, 16)}`);
if (beforeBytes < 50000) { console.error("FLOOR: pristine query.mjs is implausibly small — refusing"); process.exit(3); }

if (ARM !== "none") {
  const spec = ARMS[ARM];
  if (!spec) { console.error(`no such arm: ${ARM}`); process.exit(2); }
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
if (afterSha !== beforeSha || !cmpOk || bytes !== beforeBytes || bytes < 50000) {
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
