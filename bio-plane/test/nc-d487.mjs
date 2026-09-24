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
 * THE THREE `edge-*` ARMS ARE THE OVER-STRICTNESS HALF and they are the point
 * of the row: they pin the suite's clock 1 ms BEFORE a bucket edge, exactly ON
 * one, and 1 ms after — correct work in the three spellings that used to be
 * fatal — and all three must be FULLY GREEN. A guard that only holds in the
 * middle of a window is the same bet with a smaller stake. */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SUITE = fileURLToPath(new URL("./doorbell.test.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const DIR = fileURLToPath(new URL("./", import.meta.url));
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
  "a new window starts a new count for the same source",
];

const GUARD = "const EDGE_GUARD = true;";
const PINEXPR = "const PIN = Math.floor(Date.now() / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + KNOCK_WINDOW_MS / 2;";
const pinnedAt = (tail) => `const PIN = Math.floor(Date.now() / KNOCK_WINDOW_MS) * KNOCK_WINDOW_MS + ${tail};`;

const ARMS = {
  "limiter-off": {
    file: STORE,
    why: "THE 2026-07-31 CONTROL FOR THE LIMITER ITSELF, RE-RUN because D-487 changed the suite around it and a control whose figures were taken against a different suite is a claim about that day. Disable the per-IP guard in the store so one source is never throttled.",
    anchor: 'if (cnt(ipBucket) >= perIpLimit) return { ok: false, reason: "RATE_IP" };',
    patch: 'if (false) return { ok: false, reason: "RATE_IP" };',
    mustFail: ["one source gets twelve and no more",
               "the thirteenth is refused by name",
               "refusal is a 429, not a 500"],
  },
  straddle: {
    file: SUITE,
    why: "REMOVE THE EDGE GUARD: the pinned clock steps to the next bucket in the middle of the flood, which is exactly what the wall clock used to do at random. The limiter is untouched and behaves correctly throughout.",
    anchor: GUARD, patch: "const EDGE_GUARD = false;",
    mustFail: ["one source gets twelve and no more",
               "the thirteenth is refused by name",
               "refusal is a 429, not a 500"],
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
