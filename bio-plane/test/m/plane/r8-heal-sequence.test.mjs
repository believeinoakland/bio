/* plane R8 (the request paths keep the owed work's alarm armed), the sequence behind G93 (`r8-heal-door.test.mjs`, whoami; B115, B116): the real
   `Scheduler` class, over a platform double for storage and a pinned `Date.now`, with the plane's real ledger (`pendingOf(...).consumer()`) registered. The
   sequence is built step by step so each instant is the test's own: (1) a request's `heal` at t looks and arms the alarm for the owed row (its look is
   recorded); (2) the alarm fires at t + 1 s and the row runs and stays live; (3) a member's read at t + 2 s calls `heal`, which answers null inside its
   five-second throttle, so the alarm must already stand from the firing's end. The control has no live row: then no alarm stands. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./fixture.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { Scheduler } from "../../../src/scheduler/index.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { readHeldAnswer } from "../extraction/fixtures.mjs";

const T = Date.parse("2026-10-26T04:20:00Z");
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* the platform's storage for the alarm and the heartbeat, in memory: the methods the scheduler calls */
function platformStorage() {
  const kv = new Map();
  let alarm = null;
  return {
    get alarm() { return alarm; },
    async getAlarm() { return alarm; },
    async setAlarm(t) { alarm = t; },
    async deleteAlarm() { alarm = null; },
    async get(k) { return kv.has(k) ? structuredClone(kv.get(k)) : undefined; },
    async put(k, v) { kv.set(k, structuredClone(v)); },
  };
}

/* the plane's real job table, with the reader answering a read in pieces (the row stays live), and the scheduler over the platform double */
async function world(t, { live }) {
  let now = T;
  t.mock.method(Date, "now", () => now);
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const piece = await readHeldAnswer.piece();   /* extraction's published answer: more to read, so the row stays live */
  // fixtures-own: harness the reader's answer for every digest the ledger asks: the published piece answer, the row's own registration is the test's
  extractionOf(x.ctx).readHeld = async () => piece;
  const jobs = pendingOf(x.ctx);
  if (live) jobs.registerJob({ kind: "reading", sha: sha("live"), member: "member:m1" });
  const st = platformStorage();
  const s = new Scheduler({ storage: st, env: x.env, owners: {}, zone: () => "UTC" });
  s.register("plane", jobs.consumer());
  return { s, st, jobs, at: (ms) => { now = ms; } };
}

test("R102 G93 (B116): the firing a request's look arms stays armed while a row is live, and a read inside the throttle is answered from it", async (t) => {
  const w = await world(t, { live: true });
  assert.equal(await w.s.heal(T), T, "(1) the request's look finds no alarm and arms it for the owed row");
  w.at(T + 1000);
  await w.s.onAlarm(T + 1000);                  /* (2) the firing: the row runs, stays live */
  const live = w.jobs.summary().reading?.owed ?? 0;
  assert.ok(live > 0, `the row is live after the firing: ${JSON.stringify(w.jobs.summary())}`);
  w.at(T + 2000);
  assert.equal(await w.s.heal(T + 2000), null, "(3) the read's look is inside the five-second throttle: it answers null");
  assert.ok(w.st.alarm !== null, `the firing's end set the alarm while a row is live: alarm ${w.st.alarm}, summary ${JSON.stringify(w.jobs.summary())}`);
});

test("R102 G93 (B116, control): with no live row the firing's end sets no alarm, and a read inside the throttle sets none", async (t) => {
  const w = await world(t, { live: false });
  assert.equal(await w.s.heal(T), null, "no owed row: the look arms nothing");
  w.at(T + 1000);
  await w.s.onAlarm(T + 1000);
  assert.equal(w.jobs.summary().reading?.owed ?? 0, 0, "no live row");
  w.at(T + 2000);
  assert.equal(await w.s.heal(T + 2000), null);
  assert.equal(w.st.alarm, null, `no live row, no alarm: ${JSON.stringify(w.jobs.summary())}`);
});
