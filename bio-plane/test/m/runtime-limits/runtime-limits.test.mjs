/* runtime-limits: requirement-named tests at the module's interface
 * (build/requirements/runtime-limits.md). Each test names the requirement id it
 * checks in its title. No network, no store and no real clock is relied on:
 * cpuProbe is driven by an injected `now`, and the tokens are fresh random values. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import * as cpu from "../../../src/cpu.mjs";
import * as tokens from "../../../src/tokens.mjs";

const { makeMeter, burn, cpuProbe } = cpu;
const {
  sha256hex, liveToken, PUBLISHED_TOKEN_HASHES, instanceClaudeStatus, instanceClaudeToken, instanceAiCredential,
  INSTANCE_CLAUDE_BINDING, INSTANCE_AI_BINDING, CASCADE_UNSET, CASCADE_PUBLISHED, INSTANCE_AI_UNSET, INSTANCE_AI_PUBLISHED,
} = tokens;

const fresh = () => "tok-" + randomBytes(24).toString("hex");
const nodeHash = (s) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");

/** Runs `fn` with `v` published (its hash on the denylist), then takes it off again. */
async function published(v, fn) {
  const h = await sha256hex(v);
  PUBLISHED_TOKEN_HASHES.add(h);
  try { return await fn(); } finally { PUBLISHED_TOKEN_HASHES.delete(h); }
}

/** A `now` that returns the listed values in turn and records each call as an event. */
function clock(values, events) {
  let i = 0;
  return () => { const v = values[Math.min(i, values.length - 1)]; i++; events.push(["now", v]); return v; };
}

/* ------------------------------------------------------------------ makeMeter */

test("R1: makeMeter returns an object with sync, cpuAwait and report methods", () => {
  const m = makeMeter();
  for (const k of ["sync", "cpuAwait", "report"]) assert.equal(typeof m[k], "function", k);
  assert.notEqual(makeMeter(), m, "each call makes a new meter");
});

test("R2: sync and cpuAwait count one call per use under the label, add finite bytes only, count before fn runs, return fn's result", async () => {
  const m = makeMeter();
  let seenInside;
  const r1 = m.sync("parse", () => { seenInside = m.report().segments.parse; return 7; }, 10);
  assert.equal(r1, 7);
  assert.deepEqual(seenInside, { calls: 1, bytes: 10 }, "counted before fn ran");
  assert.equal(m.sync("parse", () => "x"), "x");
  for (const b of [NaN, Infinity, -Infinity, "5", null, undefined, {}, 5n]) m.sync("parse", () => 0, b);
  m.sync("parse", () => 0, -3);
  m.sync("parse", () => 0, 2.5);
  assert.deepEqual(m.report().segments.parse, { calls: 12, bytes: 9.5 });

  let awaitedInside;
  const r2 = await m.cpuAwait("hash", async () => { awaitedInside = m.report().segments.hash; return "d"; }, 4);
  assert.equal(r2, "d", "cpuAwait awaits fn and returns its value");
  assert.deepEqual(awaitedInside, { calls: 1, bytes: 4 });
  assert.equal(await m.cpuAwait("hash", () => 3), 3, "a synchronous fn is also accepted");
  assert.deepEqual(m.report().segments.hash, { calls: 2, bytes: 4 });

  // A throwing or rejecting fn still leaves its call counted, and its error propagates unchanged.
  const boom = new Error("boom");
  assert.throws(() => m.sync("bad", () => { throw boom; }, 1), (e) => e === boom);
  await assert.rejects(m.cpuAwait("bad", async () => { throw boom; }, 2), (e) => e === boom);
  await assert.rejects(m.cpuAwait("bad", () => Promise.reject(boom)), (e) => e === boom);
  assert.deepEqual(m.report().segments.bad, { calls: 3, bytes: 3 });
});

test("R3: report returns the sums over every label, a copy of the segments, measured_ms null and a note that these are counts", async () => {
  const m = makeMeter();
  assert.deepEqual({ ...m.report(), note: undefined },
    { work_calls: 0, work_bytes: 0, segments: {}, measured_ms: null, note: undefined });
  m.sync("a", () => 0, 100); m.sync("a", () => 0, 50); m.sync("b", () => 0);
  await m.cpuAwait("c", async () => 0, 7);
  m.sync("__proto__", () => 0, 1); m.sync("constructor", () => 0, 2);
  const r = m.report();
  assert.deepEqual(Object.keys(r).sort(), ["measured_ms", "note", "segments", "work_bytes", "work_calls"]);
  assert.equal(r.work_calls, 6);
  assert.equal(r.work_bytes, 160);
  assert.deepEqual(Object.keys(r.segments).sort(), ["__proto__", "a", "b", "c", "constructor"].sort());
  assert.deepEqual(r.segments.a, { calls: 2, bytes: 150 });
  assert.deepEqual(r.segments.b, { calls: 1, bytes: 0 });
  assert.deepEqual(r.segments.c, { calls: 1, bytes: 7 });
  assert.deepEqual(Object.getOwnPropertyDescriptor(r.segments, "__proto__").value, { calls: 1, bytes: 1 });
  assert.deepEqual(r.segments.constructor, { calls: 1, bytes: 2 });
  assert.equal(r.measured_ms, null);
  assert.equal(typeof r.note, "string");
  assert.match(r.note, /count/i);
  assert.match(r.note, /not times/i);
  assert.match(r.note, /Cloudflare/);
  assert.match(r.note, /freez/i);
  assert.match(r.note, /synchronous/i);

  // A copy: the report is a fixed reading, independent of the meter in both directions.
  r.segments.a.calls = 999; r.segments.z = { calls: 1, bytes: 1 };
  m.sync("a", () => 0, 1);
  assert.deepEqual(r.segments.a, { calls: 999, bytes: 150 }, "a later call does not change an earlier report");
  const r2 = m.report();
  assert.deepEqual(r2.segments.a, { calls: 3, bytes: 151 }, "changing a report does not change the meter");
  assert.equal(r2.segments.z, undefined);
  assert.equal(r2.work_calls, 7);
  // Meters are independent of each other.
  assert.equal(makeMeter().report().work_calls, 0);
});

/* ------------------------------------------------------------------ burn */

test("R4: burn runs the same fixed arithmetic every time and never throws", () => {
  // The loop's own recurrence, x = (x * 1103515245 + 12345) % 2147483647 from x = 1, in IEEE doubles.
  const expect = (n) => { let x = 1; for (let i = 0; i < n; i++) x = (x * 1103515245 + 12345) % 2147483647; return x; };
  for (const n of [0, 1, 2, 3, 10, 1000, 123457]) {
    assert.equal(burn(n), expect(n), `iterations ${n}`);
    assert.equal(burn(n), burn(n), "the same iterations, the same result");
  }
  assert.equal(typeof burn(5), "number");
  for (const bad of [-1, NaN, undefined, null, "12", Symbol("s"), {}, { valueOf() { throw new Error("x"); } }, 3n]) {
    assert.doesNotThrow(() => burn(bad), String(typeof bad));
    assert.equal(typeof burn(bad), "number");
  }
});

/* ------------------------------------------------------------------ cpuProbe */

test("R5: cpuProbe's defaults are startStep 0, maxStep 40, budgetMs 20,000, now Date.now, iterationsPerStep 2,000,000; checkpoint has none", async () => {
  // startStep 0 and maxStep 40: a clock that never moves runs steps 1..40 and stops there.
  const steps = [];
  const r = await cpuProbe({ checkpoint: (s) => { steps.push(s); }, now: () => 0, iterationsPerStep: 1 });
  assert.deepEqual(steps, Array.from({ length: 40 }, (_, i) => i + 1));
  assert.equal(r.completed, 40);

  // budgetMs 20,000: 19,999 elapsed goes on, 20,000 stops.
  const ev1 = [];
  const b1 = await cpuProbe({ checkpoint: () => {}, now: clock([0, 19_999, 20_000], ev1), iterationsPerStep: 1 });
  assert.deepEqual(b1, { completed: 2, elapsed_ms: 20_000, reason: "BUDGET_REACHED" });

  // now defaults to Date.now, read at call time.
  const real = Date.now;
  const seen = [];
  let t = 1_000;
  Date.now = () => { seen.push(t); return (t += 7_000) - 7_000; };
  try {
    const d = await cpuProbe({ checkpoint: () => {}, iterationsPerStep: 1, maxStep: 10 });
    assert.deepEqual(d, { completed: 3, elapsed_ms: 21_000, reason: "BUDGET_REACHED" });
    assert.equal(seen.length, 4, "Date.now read once at the start and once per step");
  } finally { Date.now = real; }

  // checkpoint has no default: leaving it out is refused.
  await assert.rejects(cpuProbe({ now: () => 0 }), TypeError);

  // iterationsPerStep 2,000,000: a step's work is observable only as CPU time, so the default
  // step is compared with explicit steps of 1, 2 and 4 million, by process CPU time over 3 steps (median of 3).
  const cost = async (opts) => {
    const runs = [];
    for (let k = 0; k < 3; k++) {
      const c0 = process.cpuUsage();
      await cpuProbe({ checkpoint: () => {}, now: () => 0, maxStep: 3, ...opts });
      const c = process.cpuUsage(c0);
      runs.push(c.user + c.system);
    }
    return runs.sort((a, b) => a - b)[1];
  };
  await cost({}); // warm the loop
  const [c1, c2, cd, c4] = [await cost({ iterationsPerStep: 1_000_000 }), await cost({ iterationsPerStep: 2_000_000 }),
    await cost({}), await cost({ iterationsPerStep: 4_000_000 })];
  const d = (a, b) => Math.abs(Math.log(a / b));
  assert.ok(d(cd, c2) < d(cd, c1) && d(cd, c2) < d(cd, c4),
    `default step costs ${cd}µs: nearest 2M (${c2}µs), not 1M (${c1}µs) or 4M (${c4}µs)`);
});

test("R6: cpuProbe reads now once as t0, then per step burns, measures and awaits checkpoint(step + 1, elapsed) before the next step", async () => {
  const events = [];
  const now = clock([100, 101, 103, 106, 110], events);
  const gates = [];
  const checkpoint = (s, e) => {
    events.push(["checkpoint", s, e]);
    return new Promise((res) => gates.push(() => { events.push(["resolved", s]); res(); }));
  };
  const p = cpuProbe({ checkpoint, startStep: 5, maxStep: 9, iterationsPerStep: 10, budgetMs: 1e9, now });
  // Each checkpoint is left pending until the test resolves it: no further now() (hence no burn) may happen.
  for (let k = 0; k < 4; k++) {
    await new Promise((r) => setTimeout(r, 5));
    assert.equal(gates.length, k + 1, `step ${k + 1} has checkpointed and waits`);
    assert.deepEqual(events.at(-1)[0], "checkpoint", "nothing ran while the checkpoint was pending");
    gates[k]();
  }
  const r = await p;
  assert.deepEqual(events, [
    ["now", 100],
    ["now", 101], ["checkpoint", 6, 1], ["resolved", 6],
    ["now", 103], ["checkpoint", 7, 3], ["resolved", 7],
    ["now", 106], ["checkpoint", 8, 6], ["resolved", 8],
    ["now", 110], ["checkpoint", 9, 10], ["resolved", 9],
  ]);
  assert.deepEqual(r, { completed: 9, elapsed_ms: 10, reason: "MAX_STEP_REACHED" });

  // A checkpoint that throws or rejects ends the probe with that error, and no further step runs.
  const boom = new Error("store down");
  for (const cp of [() => { throw boom; }, async () => { throw boom; }]) {
    const ev = [];
    await assert.rejects(cpuProbe({ checkpoint: cp, now: clock([0, 1, 2, 3], ev), iterationsPerStep: 1 }), (e) => e === boom);
    assert.equal(ev.length, 2, "t0 and the one step's reading, nothing after");
  }
  // Not callable: refused before the clock is read or any step is burned.
  for (const bad of [undefined, null, 1, "f", {}]) {
    const ev = [];
    await assert.rejects(cpuProbe({ checkpoint: bad, now: clock([0], ev) }), TypeError);
    assert.equal(ev.length, 0);
  }
  await assert.rejects(cpuProbe(), TypeError);
});

test("R7: after the first checkpointed step whose elapsed reaches budgetMs, cpuProbe returns BUDGET_REACHED and starts no other step", async () => {
  for (const [readings, budget, expect] of [
    [[0, 5, 10, 15], 10, { completed: 2, elapsed_ms: 10, reason: "BUDGET_REACHED" }],
    [[0, 5, 12], 10, { completed: 2, elapsed_ms: 12, reason: "BUDGET_REACHED" }],
    [[50, 50], 0, { completed: 1, elapsed_ms: 0, reason: "BUDGET_REACHED" }],
    [[0, 30], 10, { completed: 1, elapsed_ms: 30, reason: "BUDGET_REACHED" }],
  ]) {
    const ev = [], cps = [];
    const r = await cpuProbe({ checkpoint: async (s, e) => { cps.push([s, e]); }, now: clock(readings, ev),
      budgetMs: budget, iterationsPerStep: 1, maxStep: 40 });
    assert.deepEqual(r, expect);
    assert.equal(cps.length, expect.completed, "the budget step was checkpointed, and nothing after it");
    assert.deepEqual(cps.at(-1), [expect.completed, expect.elapsed_ms]);
    assert.equal(ev.length, expect.completed + 1, "no further reading, so no further step");
  }
  // From a later start step, `completed` is the absolute step number.
  const r = await cpuProbe({ checkpoint: () => {}, now: clock([0, 1, 9], []), budgetMs: 9, startStep: 20, iterationsPerStep: 1 });
  assert.deepEqual(r, { completed: 22, elapsed_ms: 9, reason: "BUDGET_REACHED" });
});

test("R8: reaching maxStep under budget returns MAX_STEP_REACHED with maxStep and the last completed step's elapsed", async () => {
  const ev = [], cps = [];
  const r = await cpuProbe({ checkpoint: (s, e) => { cps.push([s, e]); }, now: clock([0, 2, 4, 6, 999], ev),
    maxStep: 3, budgetMs: 100, iterationsPerStep: 1 });
  assert.deepEqual(r, { completed: 3, elapsed_ms: 6, reason: "MAX_STEP_REACHED" });
  assert.deepEqual(cps, [[1, 2], [2, 4], [3, 6]]);
  assert.equal(ev.length, 4, "the clock is not read again after the last step");
  // Resumed at a later start step.
  const r2 = await cpuProbe({ checkpoint: () => {}, now: clock([10, 11, 13], []), startStep: 38, maxStep: 40,
    budgetMs: 100, iterationsPerStep: 1 });
  assert.deepEqual(r2, { completed: 40, elapsed_ms: 3, reason: "MAX_STEP_REACHED" });
  // A probe started at maxStep has no step to run: it checkpoints nothing and reports maxStep.
  const cps3 = [];
  const r3 = await cpuProbe({ checkpoint: (s) => { cps3.push(s); }, now: clock([5, 77], []), startStep: 40, maxStep: 40 });
  assert.deepEqual(r3, { completed: 40, elapsed_ms: 0, reason: "MAX_STEP_REACHED" });
  assert.deepEqual(cps3, []);
});

/* ------------------------------------------------------------------ sha256hex */

test("R9: sha256hex is the SHA-256 of the UTF-8 encoding, 64 lowercase hex characters, for any string", async () => {
  assert.equal(await sha256hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(await sha256hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  for (const s of ["", "abc", "é", "日本語", "😀", "a\u0000b", "x".repeat(100_000), fresh(), "\ud800"]) {
    const h = await sha256hex(s);
    assert.match(h, /^[0-9a-f]{64}$/);
    assert.equal(h, nodeHash(s), JSON.stringify(s.slice(0, 20)));
  }
});

/* ------------------------------------------------------------------ liveToken */

test("R10: liveToken is false for a non-string or the empty string", async () => {
  for (const v of [undefined, null, 0, 1, true, false, {}, [], ["x"], 12n, Symbol("t"), () => "x", new String("abc"), ""])
    assert.equal(await liveToken(v), false, typeof v);
});

test("R11: liveToken is false exactly when the value's hash is published, true otherwise", async () => {
  const v = fresh();
  assert.equal(await liveToken(v), true);
  assert.equal(await liveToken(" "), true, "any non-empty unpublished string, whatever its shape");
  await published(v, async () => assert.equal(await liveToken(v), false));
  assert.equal(await liveToken(v), true);
});

/* ------------------------------------------------------------------ PUBLISHED_TOKEN_HASHES */

test("R12: PUBLISHED_TOKEN_HASHES is an exported Set of SHA-256 hex; membership decides every service as liveToken does", async () => {
  assert.ok(PUBLISHED_TOKEN_HASHES instanceof Set);
  assert.ok(PUBLISHED_TOKEN_HASHES.size > 0);
  for (const h of PUBLISHED_TOKEN_HASHES) assert.match(h, /^[0-9a-f]{64}$/);
  for (const v of [fresh(), fresh()]) {
    const direct = async () => !PUBLISHED_TOKEN_HASHES.has(await sha256hex(v));
    assert.equal(await direct(), await liveToken(v));
    assert.equal((await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v })).configured, true);
    assert.equal((await instanceAiCredential({ INSTANCE_AI_TOKEN: v })).token, v);
    await published(v, async () => {
      assert.equal(await direct(), false);
      assert.equal(await direct(), await liveToken(v));
      // Published is treated as not set by every credential service.
      const st = await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v });
      assert.equal(st.configured, false);
      assert.equal(await instanceClaudeToken({ INSTANCE_CLAUDE_TOKEN: v }), null);
      assert.equal((await instanceAiCredential({ INSTANCE_AI_TOKEN: v })).token, null);
    });
  }
});

/* ------------------------------------------------------------------ instanceClaudeStatus */

test("R13: instanceClaudeStatus reads INSTANCE_CLAUDE_TOKEN; missing or empty is not configured, CASCADE_UNSET, with a detail", async () => {
  assert.equal(INSTANCE_CLAUDE_BINDING, "INSTANCE_CLAUDE_TOKEN");
  for (const env of [undefined, null, {}, { INSTANCE_CLAUDE_TOKEN: "" }, { INSTANCE_CLAUDE_TOKEN: undefined },
    { INSTANCE_AI_TOKEN: fresh() }, { instance_claude_token: fresh() }]) {
    const st = await instanceClaudeStatus(env);
    assert.deepEqual(Object.keys(st).sort(), ["configured", "detail", "level", "reason"]);
    assert.equal(st.level, "instance");
    assert.equal(st.configured, false);
    assert.equal(st.reason, CASCADE_UNSET);
    assert.equal(typeof st.detail, "string");
    assert.ok(st.detail.length > 0);
  }
});

test("R14: instanceClaudeStatus on a published value is not configured, CASCADE_PUBLISHED, with a detail", async () => {
  const v = fresh();
  await published(v, async () => {
    const st = await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v });
    assert.deepEqual(Object.keys(st).sort(), ["configured", "detail", "level", "reason"]);
    assert.equal(st.level, "instance");
    assert.equal(st.configured, false);
    assert.equal(st.reason, CASCADE_PUBLISHED);
    assert.equal(typeof st.detail, "string");
    assert.ok(st.detail.length > 0);
  });
});

test("R15: instanceClaudeStatus on any other non-empty string is configured, with no shape check", async () => {
  for (const v of [fresh(), "x", " ", "sk-ant-anything", "not a key at all", "日本", "\n"]) {
    assert.deepEqual(await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v }),
      { level: "instance", configured: true, reason: null, detail: null });
  }
});

test("R16: detail is null exactly when configured, a string otherwise, and no status ever carries the value", async () => {
  const v = fresh();
  const cases = [await instanceClaudeStatus({}), await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: "" }),
    await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v })];
  await published(v, async () => cases.push(await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v })));
  for (const st of cases) {
    assert.equal(st.detail === null, st.configured === true);
    if (!st.configured) assert.equal(typeof st.detail, "string");
    assert.ok(!JSON.stringify(st).includes(v), "the value is never in the status");
    assert.ok(!Object.values(st).includes(v));
  }
});

/* ------------------------------------------------------------------ instanceClaudeToken */

test("R17: instanceClaudeToken returns the value exactly when the status is configured, null otherwise", async () => {
  const v = fresh();
  const envs = [undefined, null, {}, { INSTANCE_CLAUDE_TOKEN: "" }, { INSTANCE_CLAUDE_TOKEN: 5 },
    { INSTANCE_CLAUDE_TOKEN: v }, { INSTANCE_CLAUDE_TOKEN: "x" }];
  const check = async (env) => {
    const st = await instanceClaudeStatus(env);
    const tok = await instanceClaudeToken(env);
    assert.equal(tok, st.configured ? env.INSTANCE_CLAUDE_TOKEN : null);
  };
  for (const env of envs) await check(env);
  await published(v, async () => {
    await check({ INSTANCE_CLAUDE_TOKEN: v });
    assert.equal(await instanceClaudeToken({ INSTANCE_CLAUDE_TOKEN: v }), null);
  });
  assert.equal(await instanceClaudeToken({ INSTANCE_CLAUDE_TOKEN: v }), v);
});

/* ------------------------------------------------------------------ instanceAiCredential */

test("R18: instanceAiCredential reads INSTANCE_AI_TOKEN; missing or empty is {token: null, reason: INSTANCE_AI_UNSET}", async () => {
  assert.equal(INSTANCE_AI_BINDING, "INSTANCE_AI_TOKEN");
  for (const env of [undefined, null, {}, { INSTANCE_AI_TOKEN: "" }, { INSTANCE_AI_TOKEN: undefined },
    { INSTANCE_CLAUDE_TOKEN: fresh() }]) {
    assert.deepEqual(await instanceAiCredential(env), { token: null, reason: INSTANCE_AI_UNSET });
  }
});

test("R19: instanceAiCredential on a published value is {token: null, reason: INSTANCE_AI_PUBLISHED}", async () => {
  const v = fresh();
  await published(v, async () =>
    assert.deepEqual(await instanceAiCredential({ INSTANCE_AI_TOKEN: v }), { token: null, reason: INSTANCE_AI_PUBLISHED }));
});

test("R20: instanceAiCredential on any other non-empty string returns it with reason null", async () => {
  for (const v of [fresh(), "aik-" + "0".repeat(64), "x", " "])
    assert.deepEqual(await instanceAiCredential({ INSTANCE_AI_TOKEN: v }), { token: v, reason: null });
});

/* ------------------------------------------------------------------ reason constants */

test("R21: the four reason constants have their stated values and are the only non-null reasons any service gives", async () => {
  assert.equal(CASCADE_UNSET, "NO_INSTANCE_ACCOUNT");
  assert.equal(CASCADE_PUBLISHED, "INSTANCE_ACCOUNT_REVOKED_BY_PUBLICATION");
  assert.equal(INSTANCE_AI_UNSET, "NO_INSTANCE_AI_CREDENTIAL");
  assert.equal(INSTANCE_AI_PUBLISHED, "INSTANCE_AI_CREDENTIAL_REVOKED_BY_PUBLICATION");
  const allowed = new Set([null, CASCADE_UNSET, CASCADE_PUBLISHED, INSTANCE_AI_UNSET, INSTANCE_AI_PUBLISHED]);
  const v = fresh();
  const values = [undefined, "", 7, {}, v, "y"];
  const reasons = async () => {
    const out = [];
    for (const x of values) {
      out.push((await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: x })).reason);
      out.push((await instanceAiCredential({ INSTANCE_AI_TOKEN: x })).reason);
    }
    return out;
  };
  const seen = [...await reasons(), ...await published(v, reasons)];
  for (const r of seen) assert.ok(allowed.has(r), String(r));
  for (const r of allowed) if (r !== null) assert.ok(seen.includes(r), `${r} is reachable`);
  // Stable across calls and across module loads.
  const again = await import("../../../src/tokens.mjs?again");
  for (const k of ["CASCADE_UNSET", "CASCADE_PUBLISHED", "INSTANCE_AI_UNSET", "INSTANCE_AI_PUBLISHED"])
    assert.equal(again[k], tokens[k]);
});

/* ------------------------------------------------------------------ invariants */

test("R22: pure — no fetch, no clock outside cpuProbe's now, and the same answer for the same inputs", async () => {
  const saved = { fetch: globalThis.fetch, now: Date.now, perf: performance.now };
  const trap = (what) => () => { throw new Error(`runtime-limits used ${what}`); };
  globalThis.fetch = trap("fetch"); Date.now = trap("Date.now"); performance.now = trap("performance.now");
  const OrigDate = globalThis.Date;
  globalThis.Date = new Proxy(OrigDate, { construct: trap("new Date()") });
  try {
    const v = fresh();
    const run = async () => {
      const m = makeMeter();
      m.sync("s", () => 1, 3); await m.cpuAwait("a", async () => 2, 4);
      const probe = await cpuProbe({ checkpoint: () => {}, now: clock([0, 1, 2], []), maxStep: 2, iterationsPerStep: 3 });
      return JSON.stringify([
        m.report(), burn(1000), probe, await sha256hex(v), await liveToken(v), await liveToken(""),
        await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v }), await instanceClaudeStatus({}),
        await instanceClaudeToken({ INSTANCE_CLAUDE_TOKEN: v }), await instanceAiCredential({ INSTANCE_AI_TOKEN: v }),
        await instanceAiCredential({}), [...PUBLISHED_TOKEN_HASHES],
      ]);
    };
    const a = await run();
    assert.equal(await run(), a, "the same inputs give the same answers");
  } finally {
    globalThis.fetch = saved.fetch; Date.now = saved.now; performance.now = saved.perf; globalThis.Date = OrigDate;
  }
});

test("R23: nothing exported accepts or sets a credential; the env passed in is only read", async () => {
  // The whole export surface: services that read, the two binding names, the reasons and the denylist.
  assert.deepEqual(Object.keys(tokens).sort(), ["CASCADE_PUBLISHED", "CASCADE_UNSET", "INSTANCE_AI_BINDING",
    "INSTANCE_AI_PUBLISHED", "INSTANCE_AI_UNSET", "INSTANCE_CLAUDE_BINDING", "PUBLISHED_TOKEN_HASHES",
    "instanceAiCredential", "instanceClaudeStatus", "instanceClaudeToken", "liveToken", "sha256hex"]);
  assert.deepEqual(Object.keys(cpu).sort(), ["burn", "cpuProbe", "makeMeter"]);
  // Every service called with a frozen env, in every state, leaves it untouched and writes nothing onto it.
  const v = fresh();
  const envs = [{}, { INSTANCE_CLAUDE_TOKEN: v, INSTANCE_AI_TOKEN: v }, { INSTANCE_CLAUDE_TOKEN: "", INSTANCE_AI_TOKEN: "" }];
  const all = async (env) => {
    await instanceClaudeStatus(env); await instanceClaudeToken(env); await instanceAiCredential(env);
    await liveToken(env.INSTANCE_CLAUDE_TOKEN);
  };
  for (const env of envs) {
    const before = JSON.stringify(env);
    const frozen = Object.freeze({ ...env });
    await all(frozen);
    await published(v, () => all(frozen));
    assert.equal(JSON.stringify(frozen), before);
    // A second env, never passed, is never seen: nothing is kept between calls.
    const withToken = await instanceAiCredential(frozen);
    assert.deepEqual(await instanceAiCredential({}), { token: null, reason: INSTANCE_AI_UNSET });
    assert.equal(await instanceClaudeToken({}), null);
    assert.ok(withToken);
  }
  // A module-level global of the same name is never read: the value reaches the module only on `env`.
  globalThis.INSTANCE_CLAUDE_TOKEN = v; globalThis.INSTANCE_AI_TOKEN = v;
  try {
    assert.equal(await instanceClaudeToken({}), null);
    assert.equal((await instanceAiCredential({})).token, null);
  } finally { delete globalThis.INSTANCE_CLAUDE_TOKEN; delete globalThis.INSTANCE_AI_TOKEN; }
});

test("R24: report never states a duration for synchronous work: measured_ms is null and the note says why", async () => {
  for (const work of [0, 1, 50]) {
    const m = makeMeter();
    for (let i = 0; i < work; i++) m.sync("x", () => burn(10_000), 8);
    await m.cpuAwait("y", async () => 0);
    const r = m.report();
    assert.equal(r.measured_ms, null);
    assert.ok(!Object.values(r.segments).some((s) => Object.keys(s).some((k) => /ms|time|dur/i.test(k))),
      "no segment carries a time");
    assert.match(r.note, /freez/i);
    assert.match(r.note, /cannot measure/i);
  }
});

test("R25: no place is named in anything the module says, and no behaviour depends on one", async () => {
  const places = /oakland|alameda|california|\bbay area\b|san francisco|berkeley|\bCA\b/i;
  const v = fresh();
  const said = [];
  said.push(JSON.stringify(makeMeter().report()));
  said.push(JSON.stringify(await instanceClaudeStatus({})));
  await published(v, async () => said.push(JSON.stringify(await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: v }))));
  said.push(CASCADE_UNSET, CASCADE_PUBLISHED, INSTANCE_AI_UNSET, INSTANCE_AI_PUBLISHED, INSTANCE_CLAUDE_BINDING, INSTANCE_AI_BINDING);
  for (const s of said) assert.doesNotMatch(s, places, s);
  // Values naming a place are treated like any other value.
  for (const t of ["oakland-token", "alameda-county", "springfield"]) {
    assert.equal(await liveToken(t), true);
    assert.equal((await instanceClaudeStatus({ INSTANCE_CLAUDE_TOKEN: t })).configured, true);
    assert.deepEqual(await instanceAiCredential({ INSTANCE_AI_TOKEN: t }), { token: t, reason: null });
  }
});
