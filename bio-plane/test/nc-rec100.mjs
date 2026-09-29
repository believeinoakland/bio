/* REC-100's NEGATIVE CONTROL HARNESS (IC-130, D-366 closed). Declared in
 * `test/observation-log.test.mjs`'s header, run from `bio-plane/` in one step:
 *
 *     node test/nc-rec100.mjs             # every arm, baseline at BOTH ends
 *     node test/nc-rec100.mjs carveout    # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec93.mjs` precedent, whose shape this keeps).
 *
 * THE RULES IT OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW at BOTH ends that arms nothing.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED; a match count that is not exactly 1
 *     is a FINDING, never a retry.
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by content. `git checkout --` is never used.
 *   - THREE SUITES RUN ON EVERY ARM — `observation-log`, `airun` and
 *     `scheduler` — because the rollup has three writer paths (the close, the
 *     reaper, the wake) and each is driven in a different suite. A declaration
 *     names its failures as `suite: label-prefix`.
 *
 * WHAT THESE ARMS CANNOT SEE: they are source-level mutations inside this
 * plane under miniflare. `agent-worker`'s `stepLog` (another area's; its suites
 * MOCK `op=airuntick`) is not reached, and nothing here exercises a deploy or a
 * second instance. K6's legacy build is this tree's source with the carve-out
 * restored, not a checkout of an older commit.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = controlPen("rec100");
mkdirSync(SAFE, { recursive: true });

/* RE-ANCHORED 2026-09-29 (T11, legacy-tests; N298, N57): C-22.10's check (`checkObservation`'s PRESENT-referent
   rule and `observationReferentFault`) left `airun.mjs` for observation-log's `vocabulary.mjs` (C-22.17 is
   observation-log's, K182 (3)), and the rollup writer and `op=airunlog`'s referent translation left `store.mjs`
   for ai-runs (`src/ai-runs/index.mjs`). The names STORE and AIRUN now point at those homes; every arm patches the
   line it always patched. */
const STORE = join(PLANE, "src/ai-runs/index.mjs");
const AIRUN = join(PLANE, "src/observation-log/vocabulary.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 10000;
const AW = join(REPO, "agent-worker");
const AW_HARNESS = join(AW, "src/harness.mjs");
const AW_INDEX = join(AW, "src/index.mjs");
/* The plane arms run the three plane suites; the two `aw-*` arms (added when
   CONDUCT #4 extended REC-100 to its consumer migration) run agent-worker's
   `harness` suite, whose section R drives the REAL plane's tick. Both baselines
   run all four. */
const SUITES = ["observation-log", "airun", "scheduler"];
const AW_SUITES = ["aw:harness"];

const runSuites = (list = SUITES) => list.map((s) => {
  const aw = s.startsWith("aw:");
  const r = spawnSync(process.execPath, [`test/${aw ? s.slice(3) : s}.test.mjs`],
    { cwd: aw ? AW : PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass(?:ed)?, (\d+) fail(?:ed)?/.exec(out);
  return { suite: s, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  "))
             .map((l) => `${s}: ${l.trim().replace(/^FAIL\s+/, "")}`) };
});

function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  const next = src.replace(find, replace);
  if (next === src) return { armed: false, matches: n };
  writeFileSync(file, next);
  return { armed: true, matches: n };
}

/* N298: measured at 84dee21913 the baseline is NOT green, and not by this harness: `scheduler` is 47/4 on the four
   capture-requests clock arms (N188, owned by capture-requests), none of them REC-100's. The arms are judged BY NAME,
   so they still read; the baseline row reports the four as they are. */
const BASELINE = { why: "nothing armed", files: [AIRUN, STORE, AW_HARNESS, AW_INDEX], mustFail: [], mustNotFail: [],
                   patch: () => ({ armed: false, matches: 0 }) };

const ARMS = {
  baseline: BASELINE,

  /* THE ROW'S OWN ARM: "the carve-out restored -> the suite says so". */
  carveout: {
    why: "restore C-22.10's `run` carve-out — a bare `run` PRESENT is admitted again",
    files: [AIRUN],
    /* RE-MEASURED 2026-09-29 (T11, legacy-tests; N298, N57): `I2b` is REC-113's coverage label now; the carve-out's
       second red is L2b (a new bare `run` PRESENT at the tick), with L4 beside it. */
    mustFail: ["observation-log: B17", "observation-log: L2b"],
    mustNotFail: ["observation-log: K3", "observation-log: K4", "observation-log: K6"],
    patch: () => arm(AIRUN,
      "  if (state === \"PRESENT\" && (e.result_ref == null || String(e.result_ref) === \"\"))",
      "  if (state === \"PRESENT\" && authorityKind !== \"run\" && (e.result_ref == null || String(e.result_ref) === \"\"))"),
  },

  /* THE DEADLOCK, RETURNED: the writers stop carrying the referent while the
     carve-out stays deleted. This is REC-100's 2026-09-16 measurement, now a
     control that must go red on every rollup writer the battery drives. */
  noreferent: {
    why: "the rollup writers carry NO referent (the pre-ruling shape) with the carve-out still deleted",
    files: [STORE],
    /* RE-MEASURED (N298): the close's own label is L3 now (it was I3); everything else as declared. */
    mustFail: ["observation-log: L3", "observation-log: K3:", "observation-log: K4",
               "observation-log: K6d", "airun: ARM K5c", "scheduler: REC-100"],
    mustNotFail: ["observation-log: K2", "observation-log: K1a"],
    patch: () => arm(STORE,
      "      ? { state: s, result_kind: \"observation\", result_ref: String(latest.get(\"PRESENT\")) }",
      "      ? { state: s, result_kind: null, result_ref: null }"),
  },

  /* THE CHECK'S NEW ARM, removed whole. */
  noarm: {
    why: "C-22.10's `observation` arm neutered — any observation referent is accepted",
    files: [AIRUN],
    mustFail: ["observation-log: K2:", "observation-log: K2b", "observation-log: K2c",
               "observation-log: K2d", "observation-log: K2f"],
    mustNotFail: ["observation-log: K1a", "observation-log: K3:", "observation-log: K4"],
    patch: () => arm(AIRUN, "  if (resultKind === \"observation\") {",
                            "  if (false && resultKind === \"observation\") {"),
  },

  /* ONE FAULT AT A TIME — each must be caught by its OWN arm, which is what
     "refused BY NAME" is worth. */
  authority: {
    why: "the SAME-AUTHORITY test dropped — another run's PRESENT look would back this rollup",
    files: [AIRUN],
    mustFail: ["observation-log: K2d"],
    mustNotFail: ["observation-log: K2:", "observation-log: K2b", "observation-log: K2c"],
    /* CORRECTED AFTER ITS FIRST RUN, AND THE FIRST RUN WAS A FINDING ABOUT THE
       ARM: it prefixed the condition with `false &&`, and `false && A || B` is
       `B` — the `authority` half of the test still fired, K2d stayed GREEN, and
       the verdict read NOT AS DECLARED over a subject that was never disarmed.
       The arm now empties the branch's CONSEQUENCE instead, which disarms both
       halves regardless of how the condition is spelled. */
    patch: () => arm(AIRUN,
      "      || String(r.authority ?? \"\") !== String(e.authority ?? \"\")) return \"other_authority\";",
      "      || String(r.authority ?? \"\") !== String(e.authority ?? \"\")) { /* arm: neutered */ }"),
  },
  present: {
    why: "the PRESENT test dropped — a LOOKED_ABSENT row would back a PRESENT rollup",
    files: [AIRUN],
    mustFail: ["observation-log: K2:"],
    mustNotFail: ["observation-log: K2b", "observation-log: K2c", "observation-log: K2d"],
    patch: () => arm(AIRUN, "  if (r.state !== \"PRESENT\") return \"not_present\";",
                            "  if (false) return \"not_present\";"),
  },
  earlier: {
    why: "the EARLIER test dropped — a later seq is no longer named as later",
    files: [AIRUN],
    mustFail: ["observation-log: K2b"],
    mustNotFail: ["observation-log: K2:", "observation-log: K2c", "observation-log: K2d"],
    patch: () => arm(AIRUN,
      "      && Number(ref) >= Number(r.next_seq)) return \"not_earlier\";",
      "      && false) return \"not_earlier\";"),
  },

  /* THE READ: the referent published in the STORE-WIDE seq, beside a per-run
     `seq` — a pointer to no entry in the same answer. */
  translate: {
    why: "op=airunlog publishes the observation referent untranslated (store-wide seq)",
    files: [STORE],
    /* `airun: ARM K5c` WAS DECLARED AND CAME BACK GREEN, AND THAT IS A FINDING
       ABOUT THAT ASSERTION, recorded rather than smoothed: the killed run's rows
       are the FIRST rows its store ever holds, so its store-wide seq and its
       per-run ordinal are the same numbers — an equality that costs nothing, on
       which K5c cannot tell the two numberings apart. K3b, K4 and the scheduler
       arm can, because their runs sit behind other rows. Dropped from the
       declaration with this reason; K5c still guards the REFERENT (arm
       `noreferent`), just not its numbering. */
    mustFail: ["observation-log: K3b", "observation-log: K4", "scheduler: REC-100"],
    mustNotFail: ["observation-log: K2", "observation-log: K3:"],
    patch: () => arm(STORE,
      "                        result_ref: e.result_kind === \"observation\" && ordinal.has(String(e.result_ref))",
      "                        result_ref: false && ordinal.has(String(e.result_ref))"),
  },

  /* THE COSTLY DIRECTION: a legacy bare row FILLED at the read. */
  fill: {
    why: "the read FILLS a bare PRESENT's referent instead of stating it undetermined",
    files: [STORE],
    /* K6d is RIGHT TO FAIL TOO (first run): it re-reads the same legacy row after
       the close and asserts it is STILL undetermined with no referent. */
    mustFail: ["observation-log: K6c", "observation-log: K6d"],
    mustNotFail: ["observation-log: K3", "observation-log: K2"],
    patch: () => arm(STORE,
      "                          : (e.result_ref ?? null),",
      "                          : (e.result_ref ?? (e.state === \"PRESENT\" ? \"filled\" : null)),"),
  },

  /* THE OVER-STRICT DIRECTION: refuse EVERY observation referent a caller
     supplies on a non-terminal row. K1a exists to catch exactly this wall. */
  overstrict: {
    why: "every `observation` referent is refused (a wall, not a fence)",
    files: [AIRUN],
    /* THE FIRST RUN FOUND THIS ARM HEAVIER THAN DECLARED, and the extra reds are
       the most useful thing it measured: the plane's OWN rollups go through the
       same check as a caller's referent, so a wall against callers is a wall
       against the plane too — and it RE-CREATES THE DEADLOCK on every writer
       (I3, K3, K4, K6d; `airun` K5; the scheduler's wake). Over-strictness on
       this arm is not a cosmetic refusal, it is REC-100's 2026-09-16 finding
       again. Declared in full now. */
    mustFail: ["observation-log: K1a", "observation-log: L3", "observation-log: K3:",   /* I3 -> L3 (N298) */
               "observation-log: K4", "observation-log: K6d", "airun: ARM K5:", "scheduler: REC-100"],
    mustNotFail: [],
    patch: () => arm(AIRUN, "  if (!r || r.found !== true || String(r.seq) !== ref) return \"unresolved\";",
                            "  return \"unresolved\";"),
  },

  /* THE CONSUMER MIGRATION'S TWO HALVES, each reverted ALONE. */
  "aw-steplog": {
    why: "agent-worker's stepLog writes the model's PRESENT verbatim again (REC-100's (1) reverted)",
    files: [AW_HARNESS], suites: AW_SUITES,
    /* RE-MEASURED (N298): harness section R's labels are REC100-1, REC100-1b, REC100-2, REC100-2b now. */
    mustFail: ["aw:harness: REC100-1:", "aw:harness: REC100-1b", "aw:harness: A8 (REC-100)"],
    mustNotFail: ["aw:harness: REC100-2:", "aw:harness: REC100-2b"],
    patch: () => arm(AW_HARNESS,
      /* RE-ANCHORED (N298): the line lost its `|| "NEVER_LOOKED"` fallback; the revert is the verbatim state. */
      '    state:   judgedPresent ? "LOOKED_INDETERMINATE" : s.observed,',
      '    state:   s.observed,'),
  },
  "aw-refused": {
    why: "agent-worker never reads refused[] and counts a tick logged off the envelope (REC-100's (2) reverted)",
    files: [AW_INDEX], suites: AW_SUITES,
    /* RE-MEASURED (N298): labels as `aw-steplog`'s; REC100-1b goes red here too (it asserts `logged` against what
       the record holds, which this arm's `logged += 1` moves), so only REC100-1 is held open. */
    mustFail: ["aw:harness: REC100-2:", "aw:harness: REC100-2b"],
    mustNotFail: ["aw:harness: REC100-1:"],
    /* BOTH HALVES OF THE OLD SITE ARE RESTORED, and that is a correction the
       first run forced: arming only `refusedEntries = []` left `logged` counted
       from the plane's `appended`, so the arm was half the old behaviour, and
       R2b (then a free 0 = 0 comparison) stayed green. Now `refused[]` is unread
       AND `logged` counts the tick, exactly the pre-REC-100 site. */
    patch: () => {
      const a1 = arm(AW_INDEX,
        "      const refusedEntries = Array.isArray(t?.refused) ? t.refused : [];",
        "      const refusedEntries = [];");
      if (!a1.armed) return a1;
      const a2 = arm(AW_INDEX, "      logged += appendedNow;", "      logged += 1;");
      return { armed: a2.armed, matches: a2.matches };
    },
  },

  baseline_end: BASELINE,
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  const isBase = a === BASELINE;
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY           ${a.why}`);
  console.log(`  MUST FAIL     ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing)"}`);
  console.log(`  MUST NOT FAIL ${a.mustNotFail.length ? a.mustNotFail.join(" | ") : "(nothing named)"}`);
  const saved = a.files.map((f) => {
    /* N298: named by the REPO-RELATIVE path, not the basename — the re-anchor put two `index.mjs` files (ai-runs'
       and agent-worker's) in the baseline's list, and a basename pen restored one over the other (measured, dry). */
    const dest = join(SAFE, `${name}.${f.replace(REPO + "/", "").replaceAll("/", "__")}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE      ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING       pristine copy under ${MIN_BYTES} bytes — refusing`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED         ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && !isBase) { console.log("  FINDING       the arm DID NOT ARM — a finding, never a retry"); finding++; }
  const rs = runSuites(a.suites || (isBase ? [...SUITES, ...AW_SUITES] : SUITES));
  for (const r of rs) console.log(`  RESULT        ${r.suite}: ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  const failing = rs.flatMap((r) => r.failing);
  for (const l of failing) console.log(`                ${l.slice(0, 150)}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED      ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && same ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && same)) { console.log("  FINDING       restore FAILED — stopping"); process.exit(2); }
  }
  const unreached = rs.filter((r) => r.pass < 0);
  if (isBase) {
    const ok = failing.length === 0 && unreached.length === 0;
    console.log(`  VERDICT       ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => failing.some((l) => l.startsWith(m)));
    const leaked = a.mustNotFail.filter((m) => failing.some((l) => l.startsWith(m)));
    const ok = hit.length === a.mustFail.length && leaked.length === 0 && unreached.length === 0;
    console.log(`  VERDICT       ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present`
      + `${leaked.length ? `; MUST-NOT-FAIL went red: ${leaked.join(" | ")}` : ""}`
      + `${unreached.length ? `; a suite did not reach its foot: ${unreached.map((r) => r.suite).join(", ")}` : ""}`);
    if (!ok) finding++;
  }
}
if (!want) rmSync(SAFE, { recursive: true, force: true });
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(finding === 0 ? 0 : 1);
