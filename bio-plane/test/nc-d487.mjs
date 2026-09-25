/* D-487's NEGATIVE CONTROL DRIVER — `node test/nc-d487.mjs [arm|all]`.
 *
 * SUBJECT: `test/doorbell.test.mjs`, section "rate limits bound the damage".
 * The row D-487 fixes a suite whose verdict depended on the wall clock: the
 * plane bins knocks into fixed ten-minute buckets, so a fourteen-knock flood
 * that straddles a bucket edge is counted twice from zero and the limiter's
 * arms go red while the limiter is behaving correctly.
 *
 * WHY THIS DRIVER EXISTS RATHER THAN A HAND-RUN CONTROL. The control the row
 * asks for is "start the run just before a rollover". Waited for, that control
 * is a ten-minute sleep that is also a bet — and a control nobody can afford to
 * re-run is a control that stops being run. Every arm here is DETERMINISTIC and
 * takes no sleep: the suite's clock is pinned, so a bucket edge is a number
 * this driver writes, not an hour it waits for.
 *
 * EACH ARM ALONE, every other defence held open. Each mutation passes an
 * anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard. Every
 * restore is verified by sha256 AND by a byte-for-byte compare against a
 * PRISTINE copy named UNIQUELY PER ARM, with the byte count printed and a
 * minimum guarded — `git checkout --` restores to HEAD and has twice silently
 * discarded a session's own uncommitted work in this repository.
 *
 * AN OPENING AND A CLOSING BASELINE ROW BRACKET THE RUN. A harness that
 * reported the same answer for every arm INCLUDING the baseline is on record in
 * `kickoffs/WORKER.md`, and without a baseline row four reds read exactly like
 * four arms working.
 *
 * EVERY ARM NAMES THE ASSERTIONS IT MUST TAKE DOWN **AND THE ONES IT MUST LEAVE
 * STANDING**, and the driver prints the actual set so the two can be compared
 * without anyone remembering. An arm that goes red in the right total and the
 * wrong places is the *break only the thing* failure.
 *
 * D-496 ADDED THE `fixed-bucket` ARM to this driver rather than starting a second
 * one, because the SUBJECT is the same suite and a second driver would mean a
 * second pen, a second baseline and two places to keep the assertion roster
 * true. That arm restores the fixed bucket the row replaced and the straddling
 * burst is re-admitted — the row's own negative control, failing by name.
 *
 * THE THREE `edge-*` ARMS ARE THE OVER-STRICTNESS HALF and they are the point
 * of the row: they pin the suite's clock 1 ms BEFORE a bucket edge, exactly ON
 * one, and 1 ms after — correct work in the three spellings that used to be
 * fatal — and all three must be FULLY GREEN. A guard that only holds in the
 * middle of a window is the same bet with a smaller stake. */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync, mkdirSync, rmdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const SUITE = fileURLToPath(new URL("./doorbell.test.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
/* THE PEN, and since M0-182 it is a DIRECTORY OUTSIDE THE WORKTREE rather than one
   with a `.gitignore` line — THE PEN RULE at the head of `.gitignore` gives the reason
   and BOB #32 ruled it: this driver's `limiter-off` arm copies a 3.1 MB `src/store.mjs`
   aside, INTO `bio-plane/test/` — the one directory both `coverage.mjs`'s
   register and the battery's discovery read by walking rather than from a list.
   An interrupted run leaving that copy loose is a SECOND plane source for the
   next walk to enrol, and that is not hypothetical: a leftover pristine copy has
   already been read as a second producer of a retired check.
   Each copy is removed as its restore verifies; the pen itself is removed on
   exit ONLY IF EMPTY, so a run that left something behind leaves the evidence
   with it (LED-2's rule) and the ignore line covers the rest. */
const DIR = `${controlPen("d487")}/`;
mkdirSync(DIR, { recursive: true });
process.on("exit", () => { try { rmdirSync(DIR); } catch { /* not empty: evidence stays */ } });
const MIN_BYTES = 6000;                       /* the suite is ~9KB; a restore smaller than this is a bug */
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
/* BYTE-EXACT text IO. `src/store.mjs` carries a stray byte (CLAUDE.md §7), and a
   utf8 round trip silently replaces it with U+FFFD — a control that corrupts its
   own subject on the way in refutes nothing. latin1 round-trips every byte. */
const readBytes = (f) => readFileSync(f).toString("latin1");
const writeBytes = (f, s) => writeFileSync(f, Buffer.from(s, "latin1"));

/* The assertions that exist. Declared here so an arm that silently RENAMES one
   is caught rather than scored as "did not fail". */
const RATE_ARMS = [
  "the pin uses the plane's own knock window",
  "one source gets twelve and no more",
  "the thirteenth is refused by name",
  "a different source is unaffected",
  "refusal is a 429, not a 500",
  "a source served again a window on is carrying a decayed count, not a wiped one",
  /* D-496's arms, declared here for the same reason D-487's are: an arm that
     silently RENAMES an assertion must be caught rather than scored as "did not
     fail". */
  "seven knocks land in the last millisecond of a bucket",
  "the straddling burst is held to twelve, not twenty-four",
  "the knock over the line is refused by name",
  "the refusal publishes the bound in words",
  "150 knocks from fifteen sources land before the edge",
  "the instance is held to 300 across the edge, not 450",
  "the instance-wide refusal is named",
  "it publishes the instance-wide bound in words",
  "twelve knocks spread evenly over twenty minutes are all accepted",
  "and none of them was refused for any reason",
  /* D-508's arms, declared here for the reason D-487's and D-496's are: an arm
     that silently RENAMES an assertion must be caught rather than scored as
     "did not fail". These read the refusal OBJECT, so an arm that stops the
     refusal happening at all takes them down with the arms that name it — which
     is why they appear in two mustFail lists below and in neither of the three
     over-strictness ones. */
  "per-source: the refusal carries its DEC-49 code",
  "per-source: it names the check the code belongs to",
  "per-source: the canned translation is a real sentence, not an empty string",
  "per-source: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "instance-wide: the refusal carries its DEC-49 code",
  "instance-wide: it names the check the code belongs to",
  "instance-wide: the canned translation is a real sentence, not an empty string",
  "instance-wide: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "the two rate refusals do not share one sentence",
];

const GUARD = "const EDGE_GUARD = true;";
const PINEXPR = "const PIN = Math.floor(Date.now() / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + KNOCK_WINDOW_MS / 2;";
const pinnedAt = (tail) => `const PIN = Math.floor(Date.now() / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + ${tail};`;

const ARMS = {
  "limiter-off": {
    file: STORE,
    why: "THE 2026-07-31 CONTROL FOR THE LIMITER ITSELF, RE-RUN because D-487 changed the suite around it and a control whose figures were taken against a different suite is a claim about that day. Disable the per-IP guard in the store so one source is never throttled.",
    /* D-496 MOVED THIS ANCHOR. The guard now reads the two-bucket estimate, so
       the 2026-07-31 spelling occurs ZERO times and this arm would have printed
       "ANCHOR OCCURS 0 TIMES — ARM DID NOT ARM". It is re-anchored rather than
       retired, because the control it runs is still the right one: disable the
       per-source guard and one source is never throttled. */
    /* D-508 MOVED THIS ANCHOR AGAIN, for D-496's reason one item on: the refusal
       is now minted through the region's `refusal` helper, so the D-496 spelling
       occurs ZERO times and this arm would have printed "ANCHOR OCCURS 0 TIMES —
       ARM DID NOT ARM". Re-anchored rather than retired: the control it runs is
       still the right one. */
    anchor: 'if (est(ipBucket, ipPrevBucket) >= perIpLimit) return refusal("RATE_IP");',
    patch: 'if (false) return refusal("RATE_IP");',
    mustFail: ["one source gets twelve and no more",
               "the thirteenth is refused by name",
               "refusal is a 429, not a 500",
               "the straddling burst is held to twelve, not twenty-four",
               "the knock over the line is refused by name",
               "the refusal publishes the bound in words",
               /* D-508: with no per-source refusal there is no refusal OBJECT to
                  read, so the four arms that read one go down beside the four
                  that name it. The instance-wide four STAND, which is the pair
                  this control separates. */
               "per-source: the refusal carries its DEC-49 code",
               "per-source: it names the check the code belongs to",
               "per-source: the canned translation is a real sentence, not an empty string",
               "per-source: and it is the CATALOGUE's sentence, not an inline copy in the plane"],
  },
  "fixed-bucket": {
    file: STORE,
    why: "D-496's OWN CONTROL: restore the FIXED BUCKET by dropping the previous bucket's weighted carry from the estimate, leaving the current bucket's raw count — the code as it stood before this row. The limits, the prune and the published sentence are untouched, so what this measures is the window and nothing else.",
    anchor: "const est = (cur, prev) => cnt(prev) * decay + cnt(cur);",
    patch: "const est = (cur, prev) => cnt(cur);",
    mustFail: ["the straddling burst is held to twelve, not twenty-four",
               "the knock over the line is refused by name",
               "the refusal publishes the bound in words",
               "the instance is held to 300 across the edge, not 450",
               "the instance-wide refusal is named",
               "it publishes the instance-wide bound in words",
               /* D-508: the fixed bucket re-admits BOTH straddling bursts, so
                  neither refusal happens and all eight arms that read a refusal
                  object go down with the six that name one. */
               "per-source: the refusal carries its DEC-49 code",
               "per-source: it names the check the code belongs to",
               "per-source: the canned translation is a real sentence, not an empty string",
               "per-source: and it is the CATALOGUE's sentence, not an inline copy in the plane",
               "instance-wide: the refusal carries its DEC-49 code",
               "instance-wide: it names the check the code belongs to",
               "instance-wide: the canned translation is a real sentence, not an empty string",
               "instance-wide: and it is the CATALOGUE's sentence, not an inline copy in the plane"],
  },
  straddle: {
    file: SUITE,
    why: "REMOVE THE EDGE GUARD: the pinned clock steps to the next bucket in the middle of the flood, which is exactly what the wall clock used to do at random. The limiter is untouched and behaves correctly throughout.",
    anchor: GUARD, patch: "const EDGE_GUARD = false;",
    /* D-496 ADDED THE FOURTH, and the addition is a finding about the subject
       rather than about this arm. Under the fixed bucket a flood split across
       the edge left the second bucket holding nine and a tenth knock was served
       from zero; under the sliding window the six behind the edge still weigh
       three half a window on, so nine plus three reaches the limit and the
       source is refused. The arm takes down one more assertion because the
       limiter now sees the straddle it used to be blind to. */
    mustFail: ["one source gets twelve and no more",
               "the thirteenth is refused by name",
               "refusal is a 429, not a 500",
               "a source served again a window on is carrying a decayed count, not a wiped one"],
  },
  "edge-minus-1": {
    file: SUITE,
    why: "OVER-STRICTNESS: the run starts 1 ms before a bucket edge — the case the row names, and the case that was fatal before the pin.",
    anchor: PINEXPR, patch: pinnedAt("(KNOCK_WINDOW_MS - 1)"), mustFail: [],
  },
  "edge-exact": {
    file: SUITE,
    why: "OVER-STRICTNESS: the run starts exactly ON a bucket edge, the first millisecond of a window.",
    anchor: PINEXPR, patch: pinnedAt("0"), mustFail: [],
  },
  "edge-plus-1": {
    file: SUITE,
    why: "OVER-STRICTNESS: the run starts 1 ms after a bucket edge.",
    anchor: PINEXPR, patch: pinnedAt("1"), mustFail: [],
  },
};

function runSuite(tag) {
  const started = Date.now();
  const r = spawnSync(process.execPath, [SUITE], { cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const log = `${DIR}.nc-d487-${tag}.log`;
  writeFileSync(log, `provenance: nc-d487 arm=${tag} suite=${SUITE} sha=${sha(SUITE)}\n` + out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].trim());
  const passed = [...out.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1].trim());
  const tally = /^doorbell: (\d+) pass, (\d+) fail$/m.exec(out);
  unlinkSync(log);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean. No tally means the suite never
     reached its own foot: report -1, never 0. */
  return { exit: r.status, ms: Date.now() - started,
           pass: tally ? Number(tally[1]) : -1, fail: tally ? Number(tally[2]) : -1,
           failed, passed, reachedFoot: Boolean(tally) };
}

function baseline(when) {
  const r = runSuite(`baseline-${when}`);
  console.log(`\nBASELINE (${when}): exit=${r.exit} ${r.pass} pass, ${r.fail} fail, foot=${r.reachedFoot}, ${r.ms}ms`);
  if (r.exit !== 0 || r.fail !== 0 || !r.reachedFoot)
    console.log("  !! BASELINE IS NOT GREEN — every arm below is uninterpretable until this is.");
  const missing = RATE_ARMS.filter((a) => !r.passed.includes(a));
  if (missing.length) console.log(`  !! rate arms absent from the run: ${JSON.stringify(missing)}`);
  return r;
}

function arm(name) {
  const a = ARMS[name];
  const SUBJ = a.file;
  const pristine = `${DIR}.nc-d487-pristine-${name}.mjs`;
  copyFileSync(SUBJ, pristine);
  const before = sha(SUBJ), bytes = statSync(SUBJ).size;
  if (bytes < MIN_BYTES) { console.log(`  !! subject is ${bytes} bytes, under the ${MIN_BYTES} floor — refusing to arm`); return; }
  const src = readBytes(SUBJ);
  const n = src.split(a.anchor).length - 1;
  console.log(`\nARM ${name} (subject ${SUBJ.split("/").slice(-2).join("/")}): ${a.why}`);
  if (n !== 1) { console.log(`  !! ANCHOR OCCURS ${n} TIMES, NOT 1 — ARM DID NOT ARM, and an arm that did not arm is a finding.`); unlinkSync(pristine); return; }
  const mutated = src.replace(a.anchor, a.patch);
  if (mutated === src) { console.log("  !! PATCH CHANGED NOTHING — ARM DID NOT ARM."); unlinkSync(pristine); return; }
  writeBytes(SUBJ, mutated);
  let r;
  try { r = runSuite(name); }
  finally {
    copyFileSync(pristine, SUBJ);
    const after = sha(SUBJ), size = statSync(SUBJ).size;
    const same = readFileSync(pristine).equals(readFileSync(SUBJ));
    console.log(`  restore: sha256 ${after === before ? "MATCHES" : "DIFFERS"} · byte-for-byte ${same ? "identical" : "DIFFERENT"} · ${size} bytes (floor ${MIN_BYTES})`);
    if (after !== before || !same || size < MIN_BYTES) console.log("  !! RESTORE FAILED — STOP AND FIX BY HAND BEFORE ANYTHING ELSE.");
    unlinkSync(pristine);
  }
  const want = a.mustFail.slice().sort(), got = r.failed.slice().sort();
  const ok = JSON.stringify(want) === JSON.stringify(got);
  console.log(`  exit=${r.exit} ${r.pass} pass, ${r.fail} fail, foot=${r.reachedFoot}, ${r.ms}ms`);
  console.log(`  MUST FAIL   ${JSON.stringify(want)}`);
  console.log(`  ACTUALLY    ${JSON.stringify(got)}`);
  console.log(`  ${ok ? "AS DECLARED" : "!! NOT AS DECLARED — read this before believing the suite"}`);
  const standing = RATE_ARMS.filter((x) => !a.mustFail.includes(x));
  const knocked = standing.filter((x) => r.failed.includes(x));
  console.log(`  MUST STAND  ${standing.length} rate arms · ${knocked.length ? `!! ALSO DOWN: ${JSON.stringify(knocked)}` : "all standing"}`);
}

const which = process.argv[2] || "all";
baseline("open");
for (const name of Object.keys(ARMS)) if (which === "all" || which === name) arm(name);
baseline("close");
