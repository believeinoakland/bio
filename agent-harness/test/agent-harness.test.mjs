/* agent-harness — its requirements, tested at its interface (`src/harness.mjs`, `src/subsession.mjs`), pure.
 *
 * Every live id R1–R8 of `build/requirements/agent-harness.md` is named by a test here, in its title. The module is
 * pure (R8), so nothing is stood up: the tables are walked directly, exhaustively where a requirement says "never",
 * and a run is driven the way the Worker shell drives it (`walk` below: `nextStep`, then `advance`, a judgement
 * applied only at a judged row). What only the shell does (the plane calls, the HTTP status) is agent-worker's and is
 * tested there. */
import { test } from "node:test";
import assert from "node:assert/strict";

import * as HARNESS from "../src/harness.mjs";
import * as SUBSESSION from "../src/subsession.mjs";

const {
  CONTROL_FLOW, PLAN_FLOW, FIRST_STEP, MODES, LEVELS, BUDGET_BOUNDS, PLAN_BUDGET_BOUNDS, PLAN_MAX_PASSES,
  DEFAULT_MAX_PASSES, JUDGEABLE, NOT_JUDGEABLE, PLAN_READS, PLANE_OPS,
  nextStep, nextPlanStep, gateStep, stopBecause, planStopBecause, passLimit, advance, planAdvance, applyJudgement,
  flowFor,
} = HARNESS;
const {
  REPORT_KEYS, REPORT_STATES, CITATION_KEYS, SUMMARY_MAX, ADDRESS_MAX, CITATIONS_MAX, REPORT_MAX_BYTES, SPAWN_KEYS,
  SUBSESSION_OPS, checkReport, spawnContract, spawnContracts, takeReports,
} = SUBSESSION;

/* A run driven as the shell drives it: from the gate, each step's decision applied by `advance`; at a judged row the
   next judgement (if any is left) is applied first. Returns the trace, the close and the judgements consumed. */
function walk(start, judgements = [], { flow = CONTROL_FLOW, limit = 200 } = {}) {
  const next = flow === PLAN_FLOW ? nextPlanStep : nextStep;
  const move = flow === PLAN_FLOW ? planAdvance : advance;
  const queue = [...judgements];
  let state = { step: FIRST_STEP, pass: 0, ...start };
  const trace = [];
  let used = 0;
  for (let i = 0; i < limit; i++) {
    if (flow[state.step]?.judged && queue.length) {
      const j = queue.shift();
      used++;
      const applied = applyJudgement(state, j);
      if (!applied.ok) return { trace, refused: { step: state.step, fields: applied.overreach }, used, state };
      state = applied.state;
    }
    const d = next(state);
    trace.push(`${state.step}>${d.step}`);
    if (d.step === "close") return { trace, bound: d.bound, why: d.why, used, state: move(state, d) };
    state = move(state, d);
  }
  throw new Error("walk did not close");
}

const spent = (bound) => ({ [bound]: { allowed: 1, consumed: 1 } });

/* ============================================================ R1: the control-flow table */
test("R1: the rows are exactly gate-mode, resume, plan, fanout, collect, compose, dedup, submit, adjust, next-pass, close", () => {
  assert.deepEqual(Object.keys(CONTROL_FLOW), ["gate-mode", "resume", "plan", "fanout", "collect", "compose", "dedup",
    "submit", "adjust", "next-pass", "close"]);
  for (const [row, r] of Object.entries(CONTROL_FLOW)) {
    assert.ok(Array.isArray(r.to), `${row} declares its steps`);
    for (const to of r.to) assert.ok(to in CONTROL_FLOW, `${row} -> ${to} names a row`);
  }
  assert.deepEqual(CONTROL_FLOW.close.to, []);
});

test("R1: nextStep never returns a step outside its row's declared steps, over every combination of what it reads", () => {
  const escapes = [];
  const queue = (n) => Array.from({ length: n }, (_, i) => ({ name: `c${i}` }));
  for (const step of [...Object.keys(CONTROL_FLOW), undefined])
    for (const mode of ["check", "investigate", "extract", "plan", "", "wat", undefined])
      for (const pass of [0, 1, 3])
        for (const maxPasses of [undefined, 0, 1, 3])
          for (const refusal of [null, { code: "X" }])
            for (const adjusted of [false, true])
              for (const q of [0, 1, 2])
                for (const budget of [undefined, spent("fetches"), spent("wallclock"), { fetches: { allowed: 0, consumed: 4 } }])
                  for (const resumeAt of [null, "collect", "adjust", "gate-mode", "close", "wat"]) {
                    const d = nextStep({ step, mode, pass, maxPasses, refusal, adjusted, budget, resumeAt, queue: queue(q),
                                         resumedFrom: pass });
                    const at = step ?? FIRST_STEP;
                    const legal = at === "close" ? d.step === "close" : CONTROL_FLOW[at].to.includes(d.step);
                    if (!legal) escapes.push(`${at}->${d.step}`);
                    assert.equal(typeof d.why, "string");
                  }
  assert.deepEqual([...new Set(escapes)], []);
});

test("R1: there is no edge from compose to submit, and none from submit back to itself on a refusal", () => {
  assert.equal(CONTROL_FLOW.compose.to.includes("submit"), false);
  for (const q of [[], [{ name: "a" }], [{ name: "a" }, { name: "b" }]])
    for (const adjusted of [false, true])
      assert.equal(nextStep({ step: "submit", mode: "check", pass: 0, maxPasses: 3, refusal: { code: "X" }, adjusted, queue: q }).step,
        "adjust");
  /* compose goes to dedup whatever it composed, even nothing. */
  for (const candidates of [[], [{ name: "a" }]])
    assert.equal(nextStep({ step: "compose", pass: 0, maxPasses: 3, candidates }).step, "dedup");
});

test("R1: an unknown step closes with `completed` and says so", () => {
  for (const step of ["nowhere", "fan-out", "CLOSE"]) {
    const d = nextStep({ step, pass: 0, maxPasses: 3 });
    assert.deepEqual([d.step, d.bound], ["close", "completed"]);
    assert.match(d.why, /is not a row in this table/);
    assert.ok(d.why.includes(step));
  }
});

/* ============================================================ R2: the gate */
test("R2: gate-mode is first: a run with no step starts there, and nothing in it is judged", () => {
  assert.equal(FIRST_STEP, "gate-mode");
  assert.equal(Object.keys(CONTROL_FLOW)[0], "gate-mode");
  assert.equal(CONTROL_FLOW["gate-mode"].judged, null);
  assert.deepEqual(nextStep({ mode: "check", pass: 0, maxPasses: 3 }).step, "resume");
  assert.deepEqual(nextStep({ mode: "investigate" }).bound, "mode-not-deployed");
});

test("R2: check is deployed; investigate and extract are not", () => {
  assert.equal(MODES.check.deployed, true);
  assert.equal(MODES.investigate.deployed, false);
  assert.equal(MODES.extract.deployed, false);
  assert.deepEqual(Object.entries(MODES).filter(([, m]) => m.deployed).map(([k]) => k), ["check"]);
});

test("R2: a mode that is not deployed closes mode-not-deployed at its first step, before any bound, fan-out, request or suggestion", () => {
  for (const mode of ["investigate", "extract", "plan", "sorcery", null, undefined, "", "Check", " check"]) {
    /* even with every budget spent and the pass limit reached: the gate is asked before any bound */
    for (const state of [{}, { budget: { ...spent("fetches"), ...spent("subsessions"), ...spent("wallclock") }, pass: 9, maxPasses: 1 }]) {
      for (const flow of [CONTROL_FLOW, PLAN_FLOW]) {
        const r = walk({ mode, ...state }, [], { flow });
        assert.deepEqual([r.trace, r.bound], [["gate-mode>close"], "mode-not-deployed"], `${String(mode)}`);
      }
      assert.deepEqual(gateStep({ mode, ...state }).bound, "mode-not-deployed");
    }
  }
  /* a deployed mode with a spent budget passes the gate and stops on the bound after it */
  const r = walk({ mode: "check", budget: spent("fetches"), maxPasses: 3 });
  assert.deepEqual([r.trace, r.bound], [["gate-mode>resume", "resume>close"], "fetches"]);
});

test("R2: its why tells a mode the table holds and has not deployed from a word it does not hold, and names the deployed modes", () => {
  for (const mode of ["investigate", "extract", "plan"]) {
    const why = gateStep({ mode }).why;
    assert.match(why, new RegExp(`mode '${mode}' is not deployed yet — it is a row in this table`));
    assert.ok(why.includes(MODES[mode].does));
    assert.match(why, /deployed now: check;/);
  }
  for (const mode of ["sorcery", "Check", ""]) {
    const why = gateStep({ mode }).why;
    assert.match(why, /it is no mode this table knows at all \(the table holds: check, investigate, extract, plan\)/);
    assert.match(why, /deployed now: check;/);
    assert.doesNotMatch(why, /not deployed yet/);
  }
  assert.match(gateStep({}).why, /mode '\(none\)' is not deployed/);
});

/* ============================================================ R3: the stop and the pass limit */
test("R3: above every row after the gate, stopBecause asks fetches, subsessions, wallclock in that order; the first spent closes", () => {
  assert.deepEqual(BUDGET_BOUNDS, ["fetches", "subsessions", "wallclock"]);
  const all = { ...spent("fetches"), ...spent("subsessions"), ...spent("wallclock") };
  assert.equal(stopBecause({ budget: all, pass: 0, maxPasses: 3 }), "fetches");
  assert.equal(stopBecause({ budget: { ...all, fetches: { allowed: 2, consumed: 1 } }, pass: 0, maxPasses: 3 }), "subsessions");
  assert.equal(stopBecause({ budget: { wallclock: { allowed: 5, consumed: 9 } }, pass: 0, maxPasses: 3 }), "wallclock");
  /* consumed >= allowed: equal stops, one under does not */
  assert.equal(stopBecause({ budget: { fetches: { allowed: 4, consumed: 4 } }, pass: 0, maxPasses: 3 }), "fetches");
  assert.equal(stopBecause({ budget: { fetches: { allowed: 4, consumed: 3 } }, pass: 0, maxPasses: 3 }), null);
  /* a bound outside the three never stops a run from this table */
  assert.equal(stopBecause({ budget: { runtime: { allowed: 1, consumed: 9 }, lease: { allowed: 1, consumed: 9 } }, pass: 0, maxPasses: 3 }), null);
  /* and it is asked above every row after the gate */
  for (const step of Object.keys(CONTROL_FLOW).filter((s) => !["gate-mode", "close"].includes(s)))
    for (const bound of BUDGET_BOUNDS) {
      const d = nextStep({ step, mode: "check", pass: 0, maxPasses: 3, budget: spent(bound), queue: [{ name: "a" }], resumeAt: "fanout" });
      assert.deepEqual([d.step, d.bound], ["close", bound], `${step}/${bound}`);
      assert.match(d.why, new RegExp(`the '${bound}' budget is spent`));
    }
});

test("R3: an absent or non-positive allowance never stops a run", () => {
  for (const row of [undefined, null, {}, { allowed: 0, consumed: 9 }, { allowed: -1, consumed: 9 }, { allowed: "x", consumed: 9 },
                     { consumed: 9 }, { allowed: null, consumed: 9 }])
    for (const bound of BUDGET_BOUNDS)
      assert.equal(stopBecause({ budget: { [bound]: row }, pass: 0, maxPasses: 3 }), null, `${bound} ${JSON.stringify(row)}`);
  assert.equal(stopBecause({ pass: 0, maxPasses: 3 }), null);
  assert.equal(stopBecause({ budget: null, pass: 0, maxPasses: 3 }), null);
});

test("R3: then pass count >= the pass limit closes `completed`; the limit is max_passes when positive, else 3", () => {
  assert.equal(DEFAULT_MAX_PASSES, 3);
  for (const [maxPasses, limit] of [[1, 1], [2, 2], [5, 5], [undefined, 3], [null, 3], [0, 3], [-2, 3], ["x", 3], ["4", 4]]) {
    assert.equal(passLimit(maxPasses), limit, `limit for ${JSON.stringify(maxPasses)}`);
    assert.equal(stopBecause({ pass: limit - 1, maxPasses }), null);
    assert.equal(stopBecause({ pass: limit, maxPasses }), "completed");
    assert.equal(stopBecause({ pass: limit + 1, maxPasses }), "completed");
  }
  /* a spent bound is named before the pass limit */
  assert.equal(stopBecause({ budget: spent("wallclock"), pass: 3, maxPasses: 3 }), "wallclock");
});

test("R3: a pass counts when it is done (next-pass): a driven run makes exactly the limit's passes", () => {
  for (const [maxPasses, passes] of [[1, 1], [2, 2], [undefined, 3], [0, 3]]) {
    const r = walk({ mode: "check", maxPasses });
    assert.equal(r.bound, "completed");
    assert.equal(r.state.pass, passes);
    assert.equal(r.trace.filter((x) => x.startsWith("next-pass>")).length, passes);
    assert.match(r.why, new RegExp(`${passes} of ${passes} passes are done`));
  }
  /* entering next-pass moves the counter; no other move does */
  assert.equal(advance({ step: "dedup", pass: 1 }, { step: "next-pass" }).pass, 2);
  for (const to of ["plan", "fanout", "collect", "compose", "dedup", "submit", "adjust", "close"])
    assert.equal(advance({ step: "resume", pass: 1 }, { step: to }).pass, 1);
});

/* ============================================================ R4: judgements */
test("R4: the judged rows are plan, collect, compose, dedup, adjust, and judgements are taken in order, one per judged row", () => {
  assert.deepEqual(Object.keys(CONTROL_FLOW).filter((s) => CONTROL_FLOW[s].judged), ["plan", "collect", "compose", "dedup", "adjust"]);
  /* one pass with four judgements: plan, collect, compose, dedup take them in order; no other row consumes one */
  const seen = [];
  const r = walk({ mode: "check", maxPasses: 1 }, [
    { targets: ["t"] }, { reports: [{ level: "meaning" }] }, { candidates: [{ name: "c" }] }, { queue: [] }]);
  for (const x of r.trace) seen.push(x.split(">")[0]);
  assert.equal(r.used, 4);
  assert.deepEqual([r.state.targets, r.state.reports, r.state.candidates, r.state.queue],
    [["t"], [{ level: "meaning" }], [{ name: "c" }], []]);
  assert.deepEqual(seen, ["gate-mode", "resume", "plan", "fanout", "collect", "compose", "dedup", "next-pass"]);
});

test("R4: a judged row with no judgement carries the state on", () => {
  const before = { step: "compose", pass: 0, maxPasses: 3, candidates: [{ name: "kept" }] };
  for (const j of [undefined, null, {}, "text", 7]) {
    const a = applyJudgement(before, j);
    assert.equal(a.ok, true);
    assert.deepEqual(a.state, before);
  }
  const r = walk({ mode: "check", maxPasses: 2 });
  assert.deepEqual([r.used, r.bound, r.state.pass], [0, "completed", 2]);
});

test("R4: a judgement naming pass, maxPasses, step, budget, mode, bound, run, store or target is refused, naming the fields", () => {
  assert.deepEqual(NOT_JUDGEABLE, ["pass", "maxPasses", "step", "budget", "mode", "bound", "run", "store", "target"]);
  for (const f of NOT_JUDGEABLE) {
    const a = applyJudgement({ pass: 0 }, { candidates: [], [f]: 1 });
    assert.deepEqual([a.ok, a.overreach, a.state], [false, [f], undefined]);
    assert.equal(typeof a.detail, "string");
    assert.ok(a.detail.includes(f));
  }
  const both = applyJudgement({}, { reports: [], target: "INQ-OTHER", mode: "x" });
  assert.deepEqual([both.ok, both.overreach], [false, ["target", "mode"]]);
  /* through a driven run: refused at the step that took it, nothing applied */
  const r = walk({ mode: "check", maxPasses: 3 }, [{ targets: [] }, { reports: [], target: "INQ-OTHER", mode: "x" }]);
  assert.deepEqual(r.refused, { step: "collect", fields: ["target", "mode"] });
  assert.equal(r.state.target, undefined);
});

test("R4: only targets, reports, candidates, queue, adjusted, submission, level, observed, governed, condition are applied", () => {
  assert.deepEqual(JUDGEABLE, ["targets", "reports", "candidates", "queue", "adjusted", "submission", "level", "observed",
    "governed", "condition"]);
  const all = Object.fromEntries(JUDGEABLE.map((k, i) => [k, `v${i}`]));
  const a = applyJudgement({ step: "plan", pass: 1 }, { ...all, whimsy: 2, bytes: "doc" });
  assert.equal(a.ok, true);
  assert.deepEqual(a.state, { step: "plan", pass: 1, ...all });
  /* the state handed in is not changed */
  const s = { pass: 0 };
  applyJudgement(s, { candidates: [1] });
  assert.deepEqual(s, { pass: 0 });
});

/* ============================================================ R5: the report contract */
const good = { level: "document", state: "PRESENT", observed_at: "log:7", summary: "s", citations: [{ address: "a" }] };

test("R5: a report has only level, state, observed_at, summary, citations, governed, condition; level and state required", () => {
  assert.deepEqual(Object.keys(REPORT_KEYS), ["level", "state", "observed_at", "summary", "citations", "governed", "condition"]);
  assert.deepEqual(Object.keys(REPORT_KEYS).filter((k) => REPORT_KEYS[k]), ["level", "state"]);
  assert.deepEqual(Object.keys(CITATION_KEYS), ["address"]);
  assert.equal(checkReport(good), null);
  assert.equal(checkReport({ ...good, governed: true, condition: "host-held" }), null);
  for (const extra of ["bytes", "body", "raw", "text", "description", "documents"]) {
    const r = checkReport({ ...good, [extra]: "x" });
    assert.deepEqual([r.code, r.fields], ["REPORT_UNKNOWN_FIELD", [extra]]);
  }
  assert.deepEqual(checkReport({ level: "meaning" }).fields, ["state"]);
  assert.deepEqual(checkReport({ state: "PRESENT" }).fields, ["level"]);
  assert.deepEqual(checkReport({ level: "", state: null }).fields, ["level", "state"]);
});

test("R5: level is one of the four, state one of the five", () => {
  assert.deepEqual(LEVELS, ["meaning", "content", "document", "internet"]);
  assert.deepEqual(Object.keys(REPORT_STATES), ["NEVER_LOOKED", "LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"]);
  for (const level of LEVELS) assert.equal(checkReport({ ...good, level }), null);
  for (const state of Object.keys(REPORT_STATES)) assert.equal(checkReport({ ...good, state }), null);
  for (const level of ["documents", "Meaning", "gossip"]) assert.equal(checkReport({ ...good, level }).code, "REPORT_LEVEL_UNKNOWN");
  for (const state of ["FOUND", "present", "ABSENT"]) assert.equal(checkReport({ ...good, state }).code, "REPORT_STATE_UNKNOWN");
});

test("R5: every state but NEVER_LOOKED needs observed_at; PRESENT and partial need a citation", () => {
  for (const state of ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"])
    for (const observed_at of [undefined, "", "  ", 7])
      assert.equal(checkReport({ level: "meaning", state, observed_at, citations: [{ address: "a" }] }).code, "REPORT_UNLOCATED");
  assert.equal(checkReport({ level: "meaning", state: "NEVER_LOOKED" }), null);
  assert.equal(checkReport({ level: "meaning", state: "LOOKED_ABSENT", observed_at: "l" }), null);
  assert.equal(checkReport({ level: "meaning", state: "LOOKED_INDETERMINATE", observed_at: "l" }), null);
  for (const state of ["PRESENT", "partial"])
    for (const citations of [undefined, null, []])
      assert.equal(checkReport({ level: "meaning", state, observed_at: "l", citations }).code, "REPORT_NO_CITATION");
});

test("R5: at most 20 citations, each exactly {address}, non-empty, at most 200 characters", () => {
  const n = (k, len = 1) => Array.from({ length: k }, (_, i) => ({ address: String(i).padEnd(len, "x") }));
  assert.equal(checkReport({ ...good, citations: n(CITATIONS_MAX, ADDRESS_MAX) }), null);
  assert.equal(CITATIONS_MAX, 20);
  assert.equal(ADDRESS_MAX, 200);
  const over = checkReport({ ...good, citations: n(21) });
  assert.deepEqual([over.code, over.bound, over.limit, over.got], ["REPORT_OVER_BOUND", "citations", 20, 21]);
  const long = checkReport({ ...good, citations: [{ address: "a".repeat(201) }] });
  assert.deepEqual([long.code, long.bound], ["REPORT_OVER_BOUND", "address"]);
  for (const c of [{ address: "a", text: "x" }, { address: "" }, { address: "   " }, { address: 7 }, {}, "a", null, ["a"]])
    assert.equal(checkReport({ ...good, citations: [c] }).code, "REPORT_CITATION_NOT_AN_ADDRESS", JSON.stringify(c));
  assert.equal(checkReport({ ...good, citations: "a" }).code, "REPORT_CITATIONS_NOT_A_LIST");
});

test("R5: summary a string of at most 500; the whole at most REPORT_MAX_BYTES", () => {
  assert.equal(SUMMARY_MAX, 500);
  assert.equal(checkReport({ ...good, summary: "s".repeat(500) }), null);
  const over = checkReport({ ...good, summary: "s".repeat(501) });
  assert.deepEqual([over.code, over.bound], ["REPORT_OVER_BOUND", "summary"]);
  for (const summary of [{ pages: [] }, ["a"], 7]) assert.equal(checkReport({ ...good, summary }).code, "REPORT_SUMMARY_NOT_PROSE");
  /* the whole-report ceiling, reached through a field the per-field bounds do not cover */
  assert.equal(REPORT_MAX_BYTES, SUMMARY_MAX + CITATIONS_MAX * (ADDRESS_MAX + 20) + 400);
  const big = checkReport({ ...good, condition: "c".repeat(REPORT_MAX_BYTES) });
  assert.deepEqual([big.code, big.bound, big.limit], ["REPORT_OVER_BOUND", "report", REPORT_MAX_BYTES]);
  /* the largest report the field bounds allow still fits */
  assert.equal(checkReport({ ...good, summary: "s".repeat(500), citations: Array.from({ length: 20 }, (_, i) => ({ address: String(i).padEnd(200, "x") })),
                             governed: false, condition: "runtime-ceiling-reached" }), null);
});

test("R5: each breach is refused by its own code, as a refusal {ok:false, reason, code, detail}", () => {
  const cases = [
    [null, "REPORT_NOT_AN_OBJECT"], [[good], "REPORT_NOT_AN_OBJECT"], ["report", "REPORT_NOT_AN_OBJECT"],
    [{ ...good, bytes: "x" }, "REPORT_UNKNOWN_FIELD"],
    [{ state: "PRESENT" }, "REPORT_INCOMPLETE"],
    [{ ...good, level: "gossip" }, "REPORT_LEVEL_UNKNOWN"],
    [{ ...good, state: "FOUND" }, "REPORT_STATE_UNKNOWN"],
    [{ ...good, observed_at: undefined }, "REPORT_UNLOCATED"],
    [{ ...good, citations: [] }, "REPORT_NO_CITATION"],
    [{ ...good, citations: {} }, "REPORT_CITATIONS_NOT_A_LIST"],
    [{ ...good, citations: [{ address: "a", bytes: "x" }] }, "REPORT_CITATION_NOT_AN_ADDRESS"],
    [{ ...good, summary: "s".repeat(501) }, "REPORT_OVER_BOUND"],
    [{ ...good, summary: {} }, "REPORT_SUMMARY_NOT_PROSE"],
  ];
  for (const [report, code] of cases) {
    const r = checkReport(report);
    assert.equal(r.ok, false);
    assert.equal(r.code, code, JSON.stringify(report)?.slice(0, 80));
    assert.equal(r.reason, r.code);
    assert.equal(typeof r.detail, "string");
  }
});

/* ============================================================ R6: mode plan's table */
test("R6: PLAN_FLOW's rows are gate-mode, resume, read, compose, dedup, submit, adjust, close, held beside CONTROL_FLOW", () => {
  assert.deepEqual(Object.keys(PLAN_FLOW), ["gate-mode", "resume", "read", "compose", "dedup", "submit", "adjust", "close"]);
  assert.equal(flowFor("plan"), PLAN_FLOW);
  for (const mode of ["check", "investigate", "extract", "", undefined, "Plan"]) assert.equal(flowFor(mode), CONTROL_FLOW);
  for (const [row, r] of Object.entries(PLAN_FLOW)) for (const to of r.to) assert.ok(to in PLAN_FLOW, `${row} -> ${to}`);
  assert.equal(PLAN_FLOW.compose.to.includes("submit"), false);
});

test("R6: it has no fanout: no row and no edge names fanout, collect or next-pass, and its reads are none of airunspawn, capturerequest, suggest", () => {
  const rows = Object.keys(PLAN_FLOW), edges = Object.values(PLAN_FLOW).flatMap((r) => r.to);
  for (const absent of ["fanout", "collect", "next-pass", "plan"]) {
    assert.equal(rows.includes(absent), false);
    assert.equal(edges.includes(absent), false);
  }
  const subjects = [{ kind: "outcome", determination: "D", standard: "S" }, { kind: "inquiry", inquiry: "I", standards: ["S2"] }, { kind: "x" }];
  const ops = [PLAN_READS.plan("P"), PLAN_READS.plans("J"), PLAN_READS.profile(), ...subjects.flatMap((s) => PLAN_READS.subject(s))]
    .map((r) => r.op);
  for (const op of ops) {
    assert.equal(PLANE_OPS[op]?.mutating, false, `${op} is a declared read`);
    assert.ok(!["airunspawn", "capturerequest", "suggest", "fetch"].includes(op));
  }
});

test("R6: nextPlanStep never leaves a row's declared steps, and a refusal goes to adjust, never back to submit", () => {
  const escapes = [];
  for (const step of [...Object.keys(PLAN_FLOW), undefined])
    for (const mode of ["plan", "check", "nosuch"])
      for (const q of [[], [{ summary: "a" }], [{ summary: "a" }, { summary: "b" }]])
        for (const refusal of [null, { code: "R" }])
          for (const adjusted of [false, true])
            for (const pass of [0, 1])
              for (const budget of [{}, spent("proposals"), spent("wallclock"), spent("fetches")])
                for (const resumeAt of [null, "dedup", "compose", "submit", "fanout"]) {
                  const at = step ?? FIRST_STEP;
                  const d = nextPlanStep({ step, mode, queue: q, refusal, adjusted, pass, budget, resumeAt });
                  if (at === "close" ? d.step !== "close" : !PLAN_FLOW[at].to.includes(d.step)) escapes.push(`${at}->${d.step}`);
                }
  assert.deepEqual([...new Set(escapes)], []);
  assert.equal(nextPlanStep({ step: "submit", pass: 0, refusal: { code: "X" }, queue: [{ summary: "a" }] }).step, "adjust");
});

test("R6: one pass (the pass limit is 1), and stopBecause asks proposals then wallclock", () => {
  assert.equal(PLAN_MAX_PASSES, 1);
  assert.deepEqual(PLAN_BUDGET_BOUNDS, ["proposals", "wallclock"]);
  assert.equal(planStopBecause({ budget: { ...spent("proposals"), ...spent("wallclock") }, pass: 0 }), "proposals");
  assert.equal(planStopBecause({ budget: spent("wallclock"), pass: 0 }), "wallclock");
  assert.equal(planStopBecause({ budget: { ...spent("fetches"), ...spent("subsessions") }, pass: 0 }), null);
  assert.equal(planStopBecause({ pass: 1, maxPasses: 5 }), "completed");
  for (const step of ["resume", "read", "compose", "dedup", "submit", "adjust"])
    assert.deepEqual(nextPlanStep({ step, pass: 1 }).bound, "completed");
  /* a plan run, deployed in this process only, walks its one pass and closes completed */
  const was = MODES.plan.deployed;
  MODES.plan.deployed = true;
  try {
    const r = walk({ mode: "plan" }, [], { flow: PLAN_FLOW });
    assert.deepEqual([r.trace, r.bound, r.state.pass],
      [["gate-mode>resume", "resume>read", "read>compose", "compose>dedup", "dedup>close"], "completed", 1]);
    /* with a queue, one at a time until none remain (the shell takes each off the head as it submits), then the pass is done */
    assert.equal(nextPlanStep({ mode: "plan", step: "dedup", pass: 0, queue: [{ summary: "a" }] }).step, "submit");
    assert.equal(nextPlanStep({ mode: "plan", step: "submit", pass: 0, queue: [{ summary: "b" }] }).step, "submit");
    const last = nextPlanStep({ mode: "plan", step: "submit", pass: 0, queue: [] });
    assert.deepEqual([last.step, last.bound, planAdvance({ step: "submit", pass: 0 }, last).pass], ["close", "completed", 1]);
  } finally { MODES.plan.deployed = was; }
});

/* ============================================================ R7: one sub-session per level */
const payload = { run: "RUN-1", context: { type: "inquiry", id: "INQ-1" }, mode: "check", skill: "s@1",
                  standard_pair: { a: 1 }, standard: { in_force: true, basis: "b", stated: "st", pair: "p", extra: "x" },
                  budget: [], manifest_like: "never copied" };

test("R7: sub-sessions run one per level, all four in LEVELS order, each under its own spawn contract", () => {
  const made = spawnContracts(payload);
  assert.equal(made.ok, true);
  assert.deepEqual(made.contracts.map((c) => c.level), LEVELS);
  for (const c of made.contracts) {
    assert.deepEqual(Object.keys(c), SPAWN_KEYS);
    assert.deepEqual(c.scope, SUBSESSION_OPS);
    assert.deepEqual(c.scope, ["meaningrows"]);
    for (const op of c.scope) assert.equal(PLANE_OPS[op].mutating, false);
    assert.deepEqual(c.standard, { in_force: true, basis: "b", stated: "st", pair: "p" });
    assert.ok(Object.isFrozen(c) && Object.isFrozen(c.context) && Object.isFrozen(c.returns));
  }
  /* no two share an object */
  assert.equal(new Set(made.contracts.map((c) => c.context)).size, 4);
  assert.equal(new Set(made.contracts.map((c) => c.returns)).size, 4);
  assert.equal(spawnContract({ level: "documents", payload }).code, "SPAWN_LEVEL_UNKNOWN");
  assert.equal(spawnContracts(null).code, "SPAWN_PAYLOAD_MISSING");
  assert.equal(spawnContracts({ ...payload, bias: {} }).code, "SPAWN_PAYLOAD_CARRIES_LENS");
});

test("R7: each returns only reports: the contract it is briefed with is R5's, and only returns that honour it are taken", () => {
  const { contracts } = spawnContracts(payload);
  for (const c of contracts)
    assert.deepEqual(c.returns, {
      keys: Object.keys(REPORT_KEYS), required: ["level", "state"], citation_keys: ["address"],
      states: Object.keys(REPORT_STATES), summary_max: SUMMARY_MAX, citations_max: CITATIONS_MAX, address_max: ADDRESS_MAX,
      rule: "return a REPORT with a citation, never documents. The parent re-reads by address." });
  const returns = [good, { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2", text: "the document" }, "bytes",
                   { level: "internet", state: "NEVER_LOOKED" }];
  const { taken, refused } = takeReports(returns);
  assert.deepEqual(taken, [good, { level: "internet", state: "NEVER_LOOKED" }]);
  assert.deepEqual(refused.map((r) => [r.level, r.code]), [["content", "REPORT_UNKNOWN_FIELD"], [null, "REPORT_NOT_AN_OBJECT"]]);
  /* a refused return never becomes an absence */
  assert.equal(taken.some((r) => r.level === "content"), false);
  assert.deepEqual(takeReports(undefined), { taken: [], refused: [] });
});

/* ============================================================ R8: pure */
/* Arguments for each exported function. Every function export must have a row, so a new export is tested here. */
const ARGS = {
  adjustedFrom: [{ a: 1 }, { a: 2 }], advance: [{ step: "dedup", pass: 1, submission: { a: 1 } }, { step: "next-pass" }],
  applyJudgement: [{ step: "plan" }, { targets: ["t"] }], applyPlanJudgement: [{ step: "compose" }, { candidates: [{ summary: "s" }] }],
  canonical: [{ b: [1, { c: 2 }], a: null }], earlierPlans: [{ plans: [{ id: "P1", project: "J" }, { id: "P2", project: "K" }] }, "J", "P0"],
  emptyLevelCandidates: [{ reports: [{ level: "document", state: "LOOKED_ABSENT", observed_at: "log:1", summary: "none" }] }, "INQ-1"],
  flowFor: ["plan"], gateStep: [{ mode: "investigate" }], nextPlanStep: [{ step: "dedup", pass: 0, queue: [{ summary: "a" }] }],
  nextStep: [{ step: "submit", pass: 0, maxPasses: 3, refusal: { code: "X" } }], passLimit: [0],
  planAdvance: [{ step: "dedup", pass: 0 }, { step: "close", pass_done: true }], planDedup: [[{ summary: "a" }, { summary: "a" }], { options: [] }],
  planStopBecause: [{ budget: spent("proposals") }], planSubjectReads: [{ subjects: [{ subject: { kind: "outcome", determination: "D", standard: "S" } }] }],
  proposalKey: [{ summary: "a", category: "legal", subjects: [] }], publishableState: [{ step: "submit", pass: 0, queue: ["x".repeat(100)] }, 50],
  resumableState: [{ step: "plan", pass: 1, extra: 1 }], resumeFrom: [{ step: "collect", pass: 1, reports: [] }], resumeTargets: [PLAN_FLOW],
  runContextTarget: [{ context: { type: "project", id: "P", questions: ["INQ-1"] } }], stateBytes: [{ a: "é" }],
  stepLog: [{ step: "collect", observed: "PRESENT", level: "meaning" }, { step: "compose", why: "w" }],
  stopBecause: [{ pass: 3 }], whyWithUndetermined: ["because", [{ op: "standard", id: "S", code: "X" }]],
  checkReport: [{ ...good, bytes: "x" }], citedAddresses: [[good, good]],
  documentHoldings: [[{ citation: "c", bundle: "b1", chain: { address_norm: "a", total: 2, versions: [{ bundle_id: "b1" }] } },
                      { citation: "d", refused: { code: "X" } }]],
  holdingsNote: [{ documents: 1, citations: 2, versions_cited: 1, versions_held: 2, unchained: 0, undetermined: 1 }],
  spawnContract: [{ level: "meaning", payload }], spawnContracts: [payload], takeReports: [[good, { bytes: 1 }]],
};

test("R8: every export is pure: equal arguments give equal answers, with no network, clock or randomness reached", () => {
  const fns = [...Object.entries(HARNESS), ...Object.entries(SUBSESSION)].filter(([, v]) => typeof v === "function");
  assert.deepEqual(fns.map(([k]) => k).filter((k) => !(k in ARGS)), [], "every function export has a row");
  const real = { fetch: globalThis.fetch, now: Date.now, random: Math.random };
  const called = [];
  globalThis.fetch = () => { called.push("fetch"); throw new Error("fetch called"); };
  Date.now = () => { called.push("Date.now"); throw new Error("Date.now called"); };
  Math.random = () => { called.push("Math.random"); throw new Error("Math.random called"); };
  try {
    for (const [name, fn] of fns) {
      const first = fn(...structuredClone(ARGS[name]));
      const second = fn(...structuredClone(ARGS[name]));
      assert.deepEqual(second, first, `${name} answers the same twice`);
      assert.deepEqual(fn(...structuredClone(ARGS[name])), first, `${name} keeps nothing between calls`);
    }
  } finally {
    globalThis.fetch = real.fetch; Date.now = real.now; Math.random = real.random;
  }
  assert.deepEqual(called, []);
});

test("R8: the module reads no binding, environment or storage: every export runs with each of those globals throwing", () => {
  /* the exports take everything as arguments; the only globals either file reaches are JSON, Object, Array, Number,
     String, Set, Map, TextEncoder and Math (none of them state) */
  const touched = [];
  for (const name of ["process", "localStorage", "caches", "navigator", "crypto", "performance"]) {
    const had = Object.getOwnPropertyDescriptor(globalThis, name);
    try {
      Object.defineProperty(globalThis, name, { configurable: true, get() { touched.push(name); throw new Error(`${name} read`); } });
      for (const [fname, fn] of [...Object.entries(HARNESS), ...Object.entries(SUBSESSION)].filter(([, v]) => typeof v === "function"))
        fn(...structuredClone(ARGS[fname]));
    } finally {
      if (had) Object.defineProperty(globalThis, name, had); else delete globalThis[name];
    }
  }
  assert.deepEqual(touched, []);
});
