/* host-governor R29: an admission asked without booking (a peek), and a host visit that books once. Each test names
   the requirement id it checks. Over `fixture.mjs`: the test's own clock and jitter, a fresh world per test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { governedFetch } from "../../../src/host-governor/index.mjs";

const T0 = 1_000_000_000;
const HOST = "peek.example";
const ok = () => ({ status: 200, headers: { get: () => null } });
const inProcess = (g) => ({ admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) });

test("R29: a peek at a host with 3 tokens answers as an admission would and leaves tokens, last_grant_at and granted as they were", () => {
  const w = world({ random: 0.5 });
  w.g.governorConfig({ host: HOST, appetite_per_min: 12 });
  const before = w.row(HOST);
  assert.equal(before.tokens, 3);
  const peeked = w.g.governorAdmit({ host: HOST, peek: true });
  assert.deepEqual(w.row(HOST), before);                               // every column, nothing written
  assert.equal(w.row(HOST).granted, 0);
  // the same instant, the same draw: the booking answers as the peek did
  const twin = world({ random: 0.5 });
  twin.g.governorConfig({ host: HOST, appetite_per_min: 12 });
  assert.deepEqual(twin.g.governorAdmit({ host: HOST }), peeked);
  assert.deepEqual(peeked, { admitted: true, wait_ms: 0, appetite_per_min: 12 });
});

test("R29: a peek spaced from a previous grant answers the wait a booking would, and books nothing", () => {
  const w = world({ random: 0.5 });
  w.g.governorAdmit({ host: HOST });                                    // a grant at T0: gap 5000 ms × 1.05
  w.step(1_000);
  const before = w.row(HOST);
  const peeked = w.g.governorAdmit({ host: HOST, peek: true });
  assert.equal(peeked.admitted, true);
  assert.equal(peeked.wait_ms, Math.round(5_000 * 1.05 - 1_000));
  assert.deepEqual(w.row(HOST), before);
  assert.deepEqual(w.g.governorAdmit({ host: HOST }), peeked);          // control: the booking agrees, and now writes
  assert.equal(w.row(HOST).granted, 2);
});

test("R29: a peek at a host it has not met creates no state and answers R2's full burst", () => {
  const w = world();
  const a = w.g.governorAdmit({ host: "new.example", peek: true });
  assert.deepEqual(a, { admitted: true, wait_ms: 0, appetite_per_min: 12 });
  assert.equal(w.count(), 0);
  assert.equal(w.row("new.example"), null);
  assert.deepEqual(w.g.governorState({ host: "new.example" }), { hosts: [] });
});

test("R29: a peek at a host in cool-off answers R4's refusal and leaves refused_total, tokens and the cool-off as they were", () => {
  const w = world();
  w.g.governorReport({ host: HOST, status: 429, retry_after_ms: 120_000 });
  w.step(20_000);
  const before = w.row(HOST);
  const peeked = w.g.governorAdmit({ host: HOST, peek: true });
  assert.deepEqual(peeked, { admitted: false, reason: "cooling_off", retry_in_ms: 100_000, refusals: 1, last_refusal_status: 429 });
  assert.deepEqual(w.row(HOST), before);
  assert.equal(w.row(HOST).refused_total, 0);
  // control: a booking in the same state is refused the same way and does count
  assert.deepEqual(w.g.governorAdmit({ host: HOST }), peeked);
  assert.equal(w.row(HOST).refused_total, 1);
});

test("R29: a peek that finds the appetite spent answers R5's refusal and records nothing, not even the refilled balance", () => {
  const w = world();
  for (let i = 0; i < 3; i++) w.g.governorAdmit({ host: HOST });
  const before = w.row(HOST);
  const peeked = w.g.governorAdmit({ host: HOST, peek: true });
  assert.deepEqual(peeked, { admitted: false, reason: "appetite", retry_in_ms: 5000 });
  assert.deepEqual(w.row(HOST), before);
  assert.equal(w.row(HOST).refused_total, 0);
  assert.deepEqual(w.g.governorAdmit({ host: HOST }), peeked);          // control: booked, it is counted
  assert.equal(w.row(HOST).refused_total, 1);
});

test("R29, R1: a peek with no host is refused as R1 refuses and writes nothing; only `peek: true` is a peek", () => {
  const w = world();
  assert.deepEqual(w.g.governorAdmit({ peek: true }), { admitted: false, reason: "no host named" });
  assert.equal(w.count(), 0);
  for (const peek of [false, 1, "true", null, undefined]) {            // anything else books, as before
    const x = world();
    x.g.governorAdmit({ host: HOST, peek });
    assert.equal(x.row(HOST).granted, 1);
  }
});

test("R29, R16: a peek and then governedFetch for one visit book one grant, one token and one gap", async () => {
  const w = world({ random: 0.5 });
  const waits = [];
  const peeked = w.g.governorAdmit({ host: HOST, peek: true });
  assert.equal(peeked.admitted, true);
  const r = await governedFetch(`https://${HOST}/page`, { fetch: async () => ok(), governor: inProcess(w.g), now: () => w.clock.t,
                                                          sleep: async (ms) => { waits.push(ms); } });
  assert.equal(r.res.status, 200);
  assert.equal(w.row(HOST).granted, 1);                                // the visit booked once
  assert.equal(w.row(HOST).tokens, 2);                                 // one token of the burst of 3
  assert.equal(w.row(HOST).last_grant_at, T0 + peeked.wait_ms);        // the gap judged once, from no previous grant
  assert.deepEqual(waits, []);                                         // nothing waited out a gap a peek had booked
});

test("R29, R6: control — two plain governedFetch calls book two grants spaced as R6 spaces them", async () => {
  const w = world({ random: 0.5 });
  const waits = [];
  const go = () => governedFetch(`https://${HOST}/page`, { fetch: async () => ok(), governor: inProcess(w.g), now: () => w.clock.t,
                                                           sleep: async (ms) => { waits.push(ms); w.step(ms); } });
  await go();
  await go();
  assert.equal(w.row(HOST).granted, 2);
  assert.equal(w.row(HOST).tokens, 1);
  assert.deepEqual(waits, [Math.round(5_000 * 1.05)]);                 // the second visit waits out R6's whole gap
});
