/* host-governor: requirement-named tests at the module's interface (build/requirements/host-governor.md). Each test
   names the requirement ids it checks in its title. The governor runs over `fixture.mjs` (node:sqlite, the test's
   own clock and jitter); a fresh world per test. No network. The ops through the whole plane are `ops.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { governorOf, governedFetch, retryAfterMs, governorOverStub, governorRoutes, appetiteOf, GOVERNOR }
  from "../../../src/host-governor/index.mjs";

const T0 = 1_000_000_000;
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const COLUMNS = ["host", "appetite_per_min", "tokens", "refilled_at", "last_grant_at", "cooloff_until", "refusals",
                 "last_refusal_at", "last_refusal_status", "granted", "refused_total", "updated_at"];

test("R1: no host named (absent, empty, a non-string, no argument at all) is refused by name and writes nothing", () => {
  const w = world();
  for (const q of [{}, { host: "" }, { host: null }, { host: 7 }, undefined, null])
    assert.deepEqual(w.g.governorAdmit(q), { admitted: false, reason: "no host named" });
  assert.equal(w.count(), 0);
});

test("R2: first contact creates the host's state with a full burst of 3, no cool-off and no refusals, before deciding", () => {
  const w = world();
  assert.equal(GOVERNOR.burstTokens, 3);
  const a = w.g.governorAdmit({ host: "a.example" });
  assert.equal(a.admitted, true);
  const r = w.row("a.example");
  assert.equal(r.tokens, 2);                 // the burst of 3, less the grant just decided on it
  assert.equal(r.cooloff_until, 0);
  assert.equal(r.refusals, 0);
  assert.equal(r.refilled_at, T0);
  assert.equal(r.granted, 1);
  assert.equal(r.refused_total, 0);
  assert.equal(r.appetite_per_min, null);
  // the full burst is spendable at once, and no more
  assert.equal(w.g.governorAdmit({ host: "a.example" }).admitted, true);
  assert.equal(w.g.governorAdmit({ host: "a.example" }).admitted, true);
  assert.equal(w.g.governorAdmit({ host: "a.example" }).admitted, false);
});

test("R3: the appetite is the host's configured one, else a positive finite binding, else 12; a bad binding is never obeyed", () => {
  // the default, and every binding that is no appetite
  for (const b of [undefined, "", "   ", "abc", "0", 0, "-5", -5, "-0.5", "Infinity", Infinity, NaN, null, true, {}]) {
    const env = b === undefined ? {} : { GOVERNOR_APPETITE_PER_MIN: b };
    const w = world({ env });
    const a = w.g.governorAdmit({ host: "h.example" });
    assert.equal(a.appetite_per_min, 12, `binding ${String(b)} falls back to the default`);
  }
  assert.equal(world({ env: null }).g.governorAdmit({ host: "h.example" }).appetite_per_min, 12);
  // a positive binding, as text or as a number
  assert.equal(world({ env: { GOVERNOR_APPETITE_PER_MIN: "30" } }).g.governorAdmit({ host: "h" }).appetite_per_min, 30);
  assert.equal(world({ env: { GOVERNOR_APPETITE_PER_MIN: 0.5 } }).g.governorAdmit({ host: "h" }).appetite_per_min, 0.5);
  // a configured appetite outranks the binding; clearing it restores the binding
  const w = world({ env: { GOVERNOR_APPETITE_PER_MIN: "30" } });
  w.g.governorConfig({ host: "h", appetite_per_min: 6 });
  assert.equal(w.g.governorAdmit({ host: "h" }).appetite_per_min, 6);
  w.g.governorConfig({ host: "h", appetite_per_min: null });
  assert.equal(w.g.governorAdmit({ host: "h" }).appetite_per_min, 30);
  // a negative binding never makes the refill or the gap negative: the bucket runs at 12
  const neg = world({ env: { GOVERNOR_APPETITE_PER_MIN: "-60" } });
  for (let i = 0; i < 3; i++) neg.g.governorAdmit({ host: "n" });
  const refused = neg.g.governorAdmit({ host: "n" });
  assert.deepEqual(refused, { admitted: false, reason: "appetite", retry_in_ms: 5000 });   // 1 token at 12/min
  // a stored value that is no appetite (written before R12 held) is no configuration
  const old = world({ env: { GOVERNOR_APPETITE_PER_MIN: "20" } });
  old.g.governorAdmit({ host: "o" });
  for (const v of [-3, 0]) {
    old.sql.exec(`UPDATE host_governor SET appetite_per_min = ? WHERE host = 'o'`, v);
    assert.equal(old.g.governorAdmit({ host: "o" }).appetite_per_min, 20);
  }
});

test("R4, R22: during a cool-off admission is refused by name whatever the tokens and the configured appetite; no token spent", () => {
  const w = world();
  w.g.governorConfig({ host: "c.example", appetite_per_min: 100000 });
  const rep = w.g.governorReport({ host: "c.example", status: 429, retry_after_ms: 120_000 });
  const before = w.row("c.example");
  assert.equal(before.tokens, 3);
  w.step(20_000);
  const a = w.g.governorAdmit({ host: "c.example" });
  assert.deepEqual(a, { admitted: false, reason: "cooling_off", retry_in_ms: rep.cooloff_until - (T0 + 20_000),
                        refusals: 1, last_refusal_status: 429 });
  assert.equal(a.retry_in_ms, 100_000);
  const after = w.row("c.example");
  assert.equal(after.tokens, 3);
  assert.equal(after.granted, 0);
  assert.equal(after.refused_total, 1);
  // configuring again during the cool-off does not end it (R22)
  w.g.governorConfig({ host: "c.example", appetite_per_min: 1e9 });
  assert.equal(w.g.governorAdmit({ host: "c.example" }).reason, "cooling_off");
  assert.equal(w.row("c.example").refused_total, 2);
  // once it lapses (cooloff_until > now no longer holds) the bucket decides again
  w.at(rep.cooloff_until);
  assert.equal(w.g.governorAdmit({ host: "c.example" }).admitted, true);
});

test("R5: tokens refill continuously at the appetite, capped at the burst; below 1 token the refusal names when to return", () => {
  const w = world();
  w.g.governorConfig({ host: "s.example", appetite_per_min: 6 });
  for (let i = 0; i < 3; i++) assert.equal(w.g.governorAdmit({ host: "s.example" }).admitted, true);
  assert.deepEqual(w.g.governorAdmit({ host: "s.example" }), { admitted: false, reason: "appetite", retry_in_ms: 10_000 });
  w.at(T0 + 5_000);
  assert.deepEqual(w.g.governorAdmit({ host: "s.example" }), { admitted: false, reason: "appetite", retry_in_ms: 5_000 });
  let r = w.row("s.example");
  assert.ok(near(r.tokens, 0.5));            // the refilled balance is recorded
  assert.equal(r.refilled_at, T0 + 5_000);
  assert.equal(r.refused_total, 2);
  w.at(T0 + 15_000);                          // 0.5 + 10 s × 6/min = 1.5
  assert.equal(w.g.governorAdmit({ host: "s.example" }).admitted, true);
  assert.ok(near(w.row("s.example").tokens, 0.5));
  w.at(T0 + 10_000_000);                      // hours later: capped at the burst, then one spent
  assert.equal(w.g.governorAdmit({ host: "s.example" }).admitted, true);
  r = w.row("s.example");
  assert.equal(r.tokens, 2);
  assert.equal(r.granted, 5);
  // a fractional retry is rounded up
  const f = world();
  f.g.governorConfig({ host: "f", appetite_per_min: 7 });
  for (let i = 0; i < 3; i++) f.g.governorAdmit({ host: "f" });
  assert.equal(f.g.governorAdmit({ host: "f" }).retry_in_ms, Math.ceil((1 / 7) * 60_000));
});

test("R6: an admission spends one token and names a jittered wait from the previous grant; the grant is recorded when the fetch goes out", () => {
  const w = world();
  w.g.governorConfig({ host: "p.example", appetite_per_min: 60 });   // base gap 1000 ms
  w.draws.push(0.5, 0.5, 0);
  const a = w.g.governorAdmit({ host: "p.example" });
  assert.deepEqual(a, { admitted: true, wait_ms: 0, appetite_per_min: 60 });   // nobody granted before
  assert.equal(w.row("p.example").last_grant_at, T0);
  w.at(T0 + 100);
  const b = w.g.governorAdmit({ host: "p.example" });                  // j = 0.6 + 0.5 × 0.9 = 1.05
  assert.equal(b.wait_ms, 950);
  assert.equal(w.row("p.example").last_grant_at, T0 + 1_050);
  w.at(T0 + 200);
  const c = w.g.governorAdmit({ host: "p.example" });                  // j = 0.6; spaced from T0 + 1050
  assert.equal(c.wait_ms, 1_450);
  assert.equal(w.row("p.example").last_grant_at, T0 + 1_650);
  assert.equal(w.row("p.example").granted, 3);
  // the envelope: j is drawn from [0.6, 1.5) on each grant, never a fixed gap
  const waits = [];
  for (const d of [0, 0.25, 0.75, 0.999999]) {
    const x = world();
    x.g.governorConfig({ host: "e", appetite_per_min: 60 });
    x.g.governorAdmit({ host: "e" });
    x.draws.push(d);
    waits.push(x.g.governorAdmit({ host: "e" }).wait_ms);
  }
  assert.deepEqual(waits, [600, 825, 1275, 1500]);
  assert.equal(new Set(waits).size, waits.length);
  // a grant long after the previous one waits for nobody
  w.at(T0 + 100_000);
  assert.equal(w.g.governorAdmit({ host: "p.example" }).wait_ms, 0);
});

test("R7: a report with no host is not recorded and writes nothing", () => {
  const w = world();
  for (const q of [{ status: 429 }, { host: "", status: 429 }, undefined, null])
    assert.deepEqual(w.g.governorReport(q), { recorded: false });
  assert.equal(w.count(), 0);
});

test("R8: a 200–399 resets the consecutive refusals and never shortens a cool-off", () => {
  const w = world();
  for (let i = 0; i < 3; i++) w.g.governorReport({ host: "r.example", status: 403 });
  const until = w.row("r.example").cooloff_until;
  for (const s of [200, 204, 301, 399]) {
    assert.deepEqual(w.g.governorReport({ host: "r.example", status: s }), { recorded: true, refusals: 0 });
    assert.equal(w.row("r.example").refusals, 0);
    assert.equal(w.row("r.example").cooloff_until, until);
  }
  // the next refusal starts the escalation again
  assert.equal(w.g.governorReport({ host: "r.example", status: 403 }).refusals, 1);
});

test("R9: 429, 403 and 503 escalate the cool-off with consecutive refusals up to the cap; a longer Retry-After is honoured, a shorter never", () => {
  for (const [status, base, cap] of [[429, 60_000, 3_600_000], [403, 30_000, 1_800_000], [503, 30_000, 1_800_000]]) {
    const w = world();
    for (let n = 1; n <= 9; n++) {
      const r = w.g.governorReport({ host: "x.example", status });
      const want = Math.min(cap, base * 2 ** (n - 1));
      assert.deepEqual(r, { recorded: true, refusals: n, cooloff_until: T0 + want, cooloff_ms: want }, `${status} n=${n}`);
      const row = w.row("x.example");
      assert.equal(row.refusals, n);
      assert.equal(row.last_refusal_at, T0);
      assert.equal(row.last_refusal_status, status);
      assert.equal(row.cooloff_until, T0 + want);
    }
    // Retry-After longer than the escalation is honoured; shorter is not
    const l = world();
    assert.equal(l.g.governorReport({ host: "l", status, retry_after_ms: base * 5 }).cooloff_ms, base * 5);
    const s = world();
    assert.equal(s.g.governorReport({ host: "s", status, retry_after_ms: 1_000 }).cooloff_ms, base);
    assert.equal(world().g.governorReport({ host: "z", status, retry_after_ms: null }).cooloff_ms, base);
  }
  // the status may arrive as text
  assert.equal(world().g.governorReport({ host: "t", status: "429" }).cooloff_ms, 60_000);
  // the cool-off ends at the later of the one standing and R9's figure (K122): a shorter refusal leaves a longer one
  const k = world();
  const long = k.g.governorReport({ host: "k", status: 429, retry_after_ms: 3_600_000 });
  k.step(1_000);
  assert.deepEqual(k.g.governorReport({ host: "k", status: 403 }),
    { recorded: true, refusals: 2, cooloff_until: long.cooloff_until, cooloff_ms: long.cooloff_until - (T0 + 1_000) });
  assert.equal(k.row("k").last_refusal_status, 403);
  assert.equal(k.row("k").last_refusal_at, T0 + 1_000);
});

test("R10: any other status (404, 500, 0 for no response) changes nothing and is answered as ignored", () => {
  const w = world();
  for (const s of [404, 500, 0, 418, 199, undefined]) {
    assert.deepEqual(w.g.governorReport({ host: "i.example", status: s }), { recorded: true, ignored: Number(s) || 0 });
  }
  assert.equal(w.count(), 0);                 // not even a row for a host it had never seen
  w.g.governorReport({ host: "i.example", status: 403 });
  const before = w.row("i.example");
  w.step(10);
  w.g.governorReport({ host: "i.example", status: 500 });
  assert.deepEqual(w.row("i.example"), before);
});

test("R11: config needs a host; it creates the state if absent, sets the appetite, and null or omitted clears it", () => {
  const w = world();
  for (const q of [{ appetite_per_min: 5 }, { host: "", appetite_per_min: 5 }, undefined, null])
    assert.deepEqual(w.g.governorConfig(q), { configured: false });
  assert.equal(w.count(), 0);
  assert.deepEqual(w.g.governorConfig({ host: "k.example", appetite_per_min: 9 }),
    { configured: true, host: "k.example", appetite_per_min: 9 });
  const r = w.row("k.example");
  assert.equal(r.appetite_per_min, 9);
  assert.equal(r.tokens, 3);                  // created with R2's state
  assert.deepEqual(w.g.governorConfig({ host: "k.example", appetite_per_min: "24" }),
    { configured: true, host: "k.example", appetite_per_min: 24 });
  assert.deepEqual(w.g.governorConfig({ host: "k.example", appetite_per_min: null }),
    { configured: true, host: "k.example", appetite_per_min: null });
  assert.equal(w.row("k.example").appetite_per_min, null);
  w.g.governorConfig({ host: "k.example", appetite_per_min: 9 });
  assert.deepEqual(w.g.governorConfig({ host: "k.example" }), { configured: true, host: "k.example", appetite_per_min: null });
  assert.equal(w.row("k.example").appetite_per_min, null);
});

test("R12: an appetite that is present and not a positive finite number is refused BAD_APPETITE and nothing is written", () => {
  const w = world();
  w.g.governorConfig({ host: "b.example", appetite_per_min: 9 });
  const before = w.row("b.example");
  for (const v of [0, -4, "0", "-4", "", "abc", NaN, Infinity, true, {}, [5]]) {
    const r = w.g.governorConfig({ host: "b.example", appetite_per_min: v });
    assert.equal(r.ok, false, `refuses ${JSON.stringify(v)}`);
    assert.equal(r.reason, "BAD_APPETITE");
    assert.equal(r.configured, false);
    assert.equal(r.check, "host-governor.R12");
    assert.ok(typeof r.translation === "string" && r.translation.length > 20);
    assert.deepEqual(w.row("b.example"), before);
  }
  const fresh = world();
  assert.equal(fresh.g.governorConfig({ host: "new.example", appetite_per_min: -1 }).reason, "BAD_APPETITE");
  assert.equal(fresh.count(), 0);
  // the one rule both the service and the op judge by
  assert.equal(appetiteOf(-1), null);
  assert.equal(appetiteOf("2.5"), 2.5);
});

test("R13: state answers one host's row or every row by host, each with its full fields, and never creates one", () => {
  const w = world();
  assert.deepEqual(w.g.governorState({ host: "none.example" }), { hosts: [] });
  assert.equal(w.count(), 0);
  w.g.governorAdmit({ host: "b.example" });
  w.g.governorReport({ host: "a.example", status: 429 });
  w.g.governorConfig({ host: "c.example", appetite_per_min: 3 });
  const all = w.g.governorState({});
  assert.deepEqual(all.hosts.map((r) => r.host), ["a.example", "b.example", "c.example"]);
  for (const r of all.hosts) assert.deepEqual(Object.keys(r).sort(), [...COLUMNS].sort());
  assert.deepEqual(w.g.governorState(undefined).hosts.map((r) => r.host), ["a.example", "b.example", "c.example"]);
  const one = w.g.governorState({ host: "a.example" });
  assert.equal(one.hosts.length, 1);
  assert.deepEqual(one.hosts[0], w.row("a.example"));
  assert.equal(one.hosts[0].last_refusal_status, 429);
  assert.equal(w.g.governorState({ host: "c.example" }).hosts[0].appetite_per_min, 3);
  assert.equal(w.g.governorState({ host: "b.example" }).hosts[0].appetite_per_min, null);
  assert.equal(w.count(), 3);
});

test("R14: governorHolding and isHeld answer R4's own test, spend nothing and write nothing", () => {
  const w = world();
  w.g.governorReport({ host: "b.example", status: 429 });              // until T0 + 60 s
  w.g.governorReport({ host: "a.example", status: 403 });              // until T0 + 30 s
  w.g.governorAdmit({ host: "c.example" });                            // no cool-off
  const snapshot = w.g.governorState({}).hosts;
  assert.deepEqual(w.g.governorHolding({ now: T0 }).map((r) => r.host), ["a.example", "b.example"]);
  assert.deepEqual(w.g.governorHolding({ now: T0 }).find((r) => r.host === "a.example"), w.row("a.example"));
  assert.deepEqual(w.g.governorHolding({ now: T0 + 30_000 }).map((r) => r.host), ["b.example"]);   // > now, not >=
  assert.deepEqual(w.g.governorHolding({ now: T0 + 60_000 }), []);
  w.at(T0 + 45_000);
  assert.deepEqual(w.g.governorHolding({}).map((r) => r.host), ["b.example"]);                    // now defaults to the clock
  assert.equal(w.g.isHeld("b.example", T0 + 59_999), true);
  assert.equal(w.g.isHeld("b.example", T0 + 60_000), false);
  assert.equal(w.g.isHeld("a.example", T0), true);
  assert.equal(w.g.isHeld("c.example", T0), false);
  assert.equal(w.g.isHeld("never.example", T0), false);
  assert.equal(w.g.isHeld("", T0), false);
  assert.equal(w.g.isHeld("b.example"), true);                                                    // the clock, T0 + 45 s
  // it agrees with admission exactly
  for (const [h, t] of [["b.example", T0 + 59_999], ["a.example", T0 + 29_999], ["a.example", T0 + 30_000]]) {
    const x = world(); x.g.governorReport({ host: h, status: h === "b.example" ? 429 : 403 });
    x.at(t);
    const held = x.g.isHeld(h, t);
    assert.equal(held, x.g.governorAdmit({ host: h }).reason === "cooling_off");
  }
  assert.deepEqual(w.g.governorState({}).hosts, snapshot);          // nothing written
  assert.equal(w.count(), 3);
});

/* A governor stand-in recording what governedFetch asked of it. */
const recorder = (admit) => {
  const calls = [];
  return { calls, admit: async (q) => { calls.push(["admit", q]); return typeof admit === "function" ? admit(q) : admit; },
           report: async (q) => { calls.push(["report", q]); return { recorded: true }; } };
};
const response = (status, headers = {}) => new Response(status === 204 ? null : "body", { status, headers });

test("R15: governedFetch asks for the target's host; a refusal is answered with nothing fetched", async () => {
  const fetched = [];
  const fetch = async (u) => { fetched.push(u); return response(200); };
  const gov = recorder({ admitted: false, reason: "cooling_off", retry_in_ms: 1234, refusals: 2, last_refusal_status: 429 });
  const r = await governedFetch("https://Docs.Example.gov:8443/a?b=1", { userAgent: "UA/1", fetch, governor: gov });
  assert.deepEqual(r, { refusedByGovernor: true, reason: "cooling_off", retry_in_ms: 1234, last_refusal_status: 429 });
  assert.deepEqual(gov.calls, [["admit", { host: "docs.example.gov:8443" }]]);
  assert.deepEqual(fetched, []);
  const appetite = await governedFetch("https://a.example/", { fetch, governor: recorder({ admitted: false, reason: "appetite", retry_in_ms: 500 }) });
  assert.deepEqual(appetite, { refusedByGovernor: true, reason: "appetite", retry_in_ms: 500, last_refusal_status: null });
  assert.deepEqual(fetched, []);
  // in process, through the Durable Object's own instance (K72 (2))
  const w = world();
  w.g.governorReport({ host: "held.example", status: 503 });
  const g = w.g;
  const inproc = await governedFetch("https://held.example/x", { fetch, governor: { admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) } });
  assert.equal(inproc.refusedByGovernor, true);
  assert.equal(inproc.reason, "cooling_off");
  assert.equal(inproc.last_refusal_status, 503);
  assert.deepEqual(fetched, []);
});

test("R16: admitted, it waits wait_ms, fetches once following redirects with the caller's agent, and reports the status with Retry-After in ms", async () => {
  const fetched = [], slept = [];
  const fetch = async (u, init) => { fetched.push([u, init]); return response(429, { "retry-after": "120" }); };
  const gov = recorder({ admitted: true, wait_ms: 850, appetite_per_min: 12 });
  const r = await governedFetch("https://a.example/doc", { userAgent: "CivicOS/1 (+https://x)", fetch, governor: gov,
                                                           sleep: async (ms) => { slept.push(ms); }, now: () => 5 });
  assert.equal(r.res.status, 429);
  assert.deepEqual(Object.keys(r), ["res"]);
  assert.deepEqual(slept, [850]);
  assert.deepEqual(fetched, [["https://a.example/doc", { redirect: "follow", headers: { "user-agent": "CivicOS/1 (+https://x)" } }]]);
  assert.deepEqual(gov.calls, [["admit", { host: "a.example" }], ["report", { host: "a.example", status: 429, retry_after_ms: 120_000 }]]);
  // no agent supplied: none is composed here
  const bare = [];
  await governedFetch("https://a.example/", { fetch: async (u, i) => { bare.push(i); return response(200); }, governor: recorder({ admitted: true, wait_ms: 0 }), sleep: async () => { throw new Error("no wait asked"); } });
  assert.deepEqual(bare, [{ redirect: "follow", headers: {} }]);
  // the report's Retry-After: absent is null, an HTTP-date is minus now, never below 0
  const now = Date.parse("2026-09-27T00:00:00Z");
  const reports = [];
  for (const h of [{}, { "retry-after": "Sun, 27 Sep 2026 00:01:30 GMT" }, { "retry-after": "Sat, 26 Sep 2026 00:00:00 GMT" }]) {
    const g2 = recorder({ admitted: true, wait_ms: 0 });
    await governedFetch("https://b.example/", { fetch: async () => response(503, h), governor: g2, now: () => now });
    reports.push(g2.calls[1][1].retry_after_ms);
  }
  assert.deepEqual(reports, [null, 90_000, 0]);
  // the one parser
  assert.equal(retryAfterMs(null), null);
  assert.equal(retryAfterMs(""), null);
  assert.equal(retryAfterMs("soon"), null);
  assert.equal(retryAfterMs("0"), 0);
  assert.equal(retryAfterMs(" 7 "), 7_000);
  assert.equal(retryAfterMs("-5"), 0);
  assert.equal(retryAfterMs("Sun, 27 Sep 2026 00:00:10 GMT", now), 10_000);
  // end to end over the in-process governor: the report is recorded as R9 records it
  const w = world();
  const g = w.g;
  await governedFetch("https://c.example/", { fetch: async () => response(429, { "retry-after": "600" }),
    governor: { admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) }, sleep: async () => {} });
  assert.equal(w.row("c.example").cooloff_until, T0 + 600_000);
  assert.equal(w.row("c.example").granted, 1);
});

test("R17: an unreachable governor or an unreadable host never blocks the fetch; a thrown fetch propagates and nothing is reported", async () => {
  const ok = async () => response(200);
  // admit throws, report throws: fetched, ungoverned
  const r1 = await governedFetch("https://a.example/", { fetch: ok, governor: { admit: async () => { throw new Error("down"); },
                                                                              report: async () => { throw new Error("down"); } } });
  assert.equal(r1.res.status, 200);
  // admit answers nothing (a store that did not answer): fetched without waiting
  const r2 = await governedFetch("https://a.example/", { fetch: ok, governor: { admit: async () => null, report: async () => null },
                                                        sleep: async () => { throw new Error("no wait asked"); } });
  assert.equal(r2.res.status, 200);
  // no governor at all
  assert.equal((await governedFetch("https://a.example/", { fetch: ok })).res.status, 200);
  // a target whose host cannot be read: fetched, the governor never asked
  const gov = recorder({ admitted: false, reason: "cooling_off" });
  const seen = [];
  const r3 = await governedFetch("not a url", { fetch: async (u) => { seen.push(u); return response(200); }, governor: gov });
  assert.equal(r3.res.status, 200);
  assert.deepEqual(seen, ["not a url"]);
  assert.deepEqual(gov.calls, []);
  // a fetch that throws propagates, and nothing is reported
  const g2 = recorder({ admitted: true, wait_ms: 0 });
  await assert.rejects(governedFetch("https://a.example/", { fetch: async () => { throw new TypeError("network"); }, governor: g2 }), /network/);
  assert.deepEqual(g2.calls.map((c) => c[0]), ["admit"]);
  // from a Worker, through the stub adapter: a stub that fails or answers no `ok` is a governor it cannot reach
  for (const stub of [{ fetch: async () => { throw new Error("no store"); } },
                      { fetch: async () => new Response("not json") },
                      { fetch: async () => Response.json({ ok: false }) }]) {
    const r = await governedFetch("https://a.example/", { fetch: ok, governor: governorOverStub(stub) });
    assert.equal(r.res.status, 200);
  }
});

test("R15, R16: the Worker's adapter reaches R1–R10 over the Durable Object's routes", async () => {
  const w = world();
  const stub = { async fetch(u, init) {
    const url = new URL(u);
    const body = init && init.body ? JSON.parse(init.body) : null;
    const route = governorRoutes(w.g, url, body)[url.pathname.slice(1)];
    return Response.json({ ok: true, result: route() });
  } };
  const gov = governorOverStub(stub);
  let n = 0;
  const fetch = async () => response(++n === 1 ? 429 : 200, { "retry-after": "30" });
  const first = await governedFetch("https://d.example/", { fetch, governor: gov, sleep: async () => {} });
  assert.equal(first.res.status, 429);
  assert.equal(w.row("d.example").cooloff_until, T0 + 60_000);        // escalation beats the 30 s it named
  const second = await governedFetch("https://d.example/", { fetch, governor: gov });
  assert.equal(second.refusedByGovernor, true);
  assert.equal(second.reason, "cooling_off");
  assert.equal(n, 1);
});

test("R20: one governor per Durable Object storage, and admissions never spend the same token twice", async () => {
  const w = world();
  assert.equal(governorOf(w.ctx), w.g);
  assert.equal(governorOf({ storage: w.ctx.storage }), w.g);       // another handle on the same storage
  assert.equal(governorOf(w.ctx.storage), w.g);
  assert.notEqual(governorOf(world().ctx), w.g);
  w.g.governorConfig({ host: "one.example", appetite_per_min: 1 });
  const answers = await Promise.all(Array.from({ length: 20 }, () => Promise.resolve().then(() => governorOf(w.ctx).governorAdmit({ host: "one.example" }))));
  assert.equal(answers.filter((a) => a.admitted).length, 3);        // exactly the burst, once
  assert.equal(w.row("one.example").granted, 3);
  assert.equal(w.row("one.example").refused_total, 17);
});

test("R21: no outcome raises an appetite or shortens a cool-off; nothing probes a host", async () => {
  const w = world();
  w.g.governorConfig({ host: "q.example", appetite_per_min: 4 });
  w.g.governorReport({ host: "q.example", status: 429, retry_after_ms: 3_600_000 });
  const until = w.row("q.example").cooloff_until;
  for (const s of [200, 301, 404, 500, 0, 403, 503, 429]) {
    const r = w.g.governorReport({ host: "q.example", status: s, retry_after_ms: 1 });
    assert.ok(w.row("q.example").cooloff_until >= until, `status ${s} leaves the cool-off standing`);
    if (r.cooloff_until !== undefined) assert.equal(r.cooloff_until, w.row("q.example").cooloff_until);
    assert.equal(w.row("q.example").appetite_per_min, 4);
    w.g.governorAdmit({ host: "q.example" });
    assert.equal(w.row("q.example").appetite_per_min, 4);
  }
  assert.equal(w.row("q.example").cooloff_until, until);
  // the governor fetches nothing itself: admission and report are its only contact with a host, and neither fetches
  const saved = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("the governor fetched"); };
  try {
    const x = world();
    x.g.governorAdmit({ host: "p.example" }); x.g.governorReport({ host: "p.example", status: 429 });
    x.g.governorConfig({ host: "p.example", appetite_per_min: 2 }); x.g.governorState({}); x.g.governorHolding({}); x.g.isHeld("p.example");
  } finally { globalThis.fetch = saved; }
});

test("R22: a configured appetite never outlasts a counterparty's refusal", () => {
  const w = world();
  w.g.governorReport({ host: "v.example", status: 403 });
  for (const a of [1, 60, 1e6]) {
    w.g.governorConfig({ host: "v.example", appetite_per_min: a });
    assert.equal(w.g.governorAdmit({ host: "v.example" }).reason, "cooling_off");
  }
  w.at(T0 + 30_000);
  assert.equal(w.g.governorAdmit({ host: "v.example" }).admitted, true);
});

test("R23: the governor records capacity signals only, and no answer is a verdict about the source", () => {
  const w = world();
  w.g.governorReport({ host: "u.example", status: 404 });
  w.g.governorReport({ host: "u.example", status: 0 });
  assert.equal(w.count(), 0);                                        // an unreachable source leaves no trace here
  w.g.governorReport({ host: "u.example", status: 503 });
  const row = w.row("u.example");
  assert.deepEqual(Object.keys(row).sort(), [...COLUMNS].sort());   // no reachability, no verdict
  const answers = [w.g.governorAdmit({ host: "u.example" }), w.g.governorReport({ host: "u.example", status: 503 }),
                   w.g.governorState({ host: "u.example" }), w.g.governorHolding({})];
  const words = JSON.stringify(answers);
  assert.doesNotMatch(words, /reachab|unreachab|verdict|down|broken|fail/i);
});

test("R24: host_governor is declared to record-core exempt from purge, and a purged instance still honours a cool-off", () => {
  const w = world();
  w.g.governorReport({ host: "w.example", status: 429, retry_after_ms: 600_000 });
  w.g.governorConfig({ host: "w.example", appetite_per_min: 2 });
  const before = w.row("w.example");
  const whole = w.rc.purge({});
  assert.equal(whole.ok !== false, true);
  assert.deepEqual(w.row("w.example"), before);
  w.rc.purge({ bundleId: "w.example" });
  assert.deepEqual(w.row("w.example"), before);
  assert.equal(w.g.governorAdmit({ host: "w.example" }).reason, "cooling_off");
  const held = w.row("w.example");
  // it is this module's own: a second declaration of the table by anyone is refused
  assert.equal(w.rc.declarePurge("someone-else", ["host_governor"]).reason, "TABLE_DECLARED");
  // migrate is idempotent and declares once
  w.g.migrate();
  assert.deepEqual(w.row("w.example"), held);
  // a stand-in record-core sees the declaration's exact form
  const declared = [];
  const sqlOnly = world().ctx.storage;
  const g = governorOf({ storage: { sql: sqlOnly.sql } }, { record: { declarePurge: (...a) => { declared.push(a); return { ok: true }; } } });
  g.migrate(); g.migrate();
  assert.deepEqual(declared, [["host-governor", [], { exempt: ["host_governor"] }]]);
});

test("R25: no host is named in the module: every host starts from the same state and the same appetite", () => {
  const w = world();
  const hosts = ["web.archive.org", "www.oaklandca.gov", "example.org", "records.city.example:8443"];
  const answers = hosts.map((h) => w.g.governorAdmit({ host: h }));
  for (const a of answers) assert.deepEqual(a, answers[0]);
  assert.equal(answers[0].appetite_per_min, GOVERNOR.defaultAppetitePerMin);
  // a per-host figure is set by whoever owns that knowledge, through R11
  w.g.governorConfig({ host: "web.archive.org", appetite_per_min: 24 });
  assert.equal(w.g.governorAdmit({ host: "web.archive.org" }).appetite_per_min, 24);
  assert.equal(w.g.governorAdmit({ host: "example.org" }).appetite_per_min, 12);
});
