/* The server's instant (R43; N983, K3027, K3033): `op=proposals` and `op=captureprogressions` are evaluated at R16's
   configured clock, since their answers (which stage is overdue, `overdue_count`) may gate an act. Driven through the
   ops map the plane routes (`progressionOps`), with a URL and a body as the control plane hands them: a `now` or
   `nowMs` in the query or the body answers exactly as the same request without it. The clock is set through
   `progressionsOf`'s `nowMs` (the fixture's `clock.nowMs`), else `env.BIO_NOW_MS`, else the wall clock. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { progressionOps } from "../../../src/progressions/index.mjs";

const at = (s) => Date.parse(s);
const BEFORE = at("2026-01-15T00:00:00Z");   // the award's deadline (2026-01-31, ending 2026-02-01T05:00Z) not yet past
const AFTER = at("2026-03-01T00:00:00Z");    // past it

/* One instance whose award is due 30 days after its need's own date, 2026-01-01. */
async function due(opts) {
  const w = seeded(opts);
  w.define();
  w.fact("sa", "2026-01-01");
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: "sa" }],
                             threadedBy: "member:alice", viewer: MEMBER });
  return w;
}

/* A request as the control plane routes it: the query (with the stamped viewer) and the body. */
const call = (w, op, query = {}, body = null) => {
  const url = new URL(`https://plane.test/?op=${op}`);
  for (const [k, v] of Object.entries({ ...query, viewer: MEMBER })) url.searchParams.set(k, String(v));
  return progressionOps(w.p, url, body)[op]();
};
const proposals = (w, q, b) => call(w, "proposals", q, b);
const capture = (w, q = {}, b) => call(w, "captureprogressions", { sha256: "sa", ...q }, b);
const awardOverdue = (feed) => feed.proposals.find((p) => p.stage_key === "award").overdue;
const overdueKinds = (c) => c.instances[0].findings.filter((f) => f.kind === "overdue_successor").map((f) => [f.stage_key, f.overdue]);

/* Every way a request can carry an instant: in the query or the body, as `now` or `nowMs`, before or after the
   deadline, malformed, and both at once. */
const carried = [
  [{ now: BEFORE }, null], [{ now: AFTER }, null], [{ nowMs: BEFORE }, null], [{ nowMs: AFTER }, null],
  [{ now: "0" }, null], [{ now: "2040-01-01" }, null], [{ now: "" }, null], [{ now: "not a time" }, null],
  [{}, { now: BEFORE }], [{}, { now: AFTER }], [{}, { nowMs: BEFORE }], [{}, { nowMs: AFTER }],
  [{ now: BEFORE, nowMs: AFTER }, { now: AFTER, nowMs: BEFORE }],
];

test("R43: op=proposals is evaluated at the configured clock; a now or nowMs in the query or the body answers exactly as the request without it", async () => {
  const w = await due({ nowMs: AFTER });
  const plain = proposals(w);
  assert.equal(awardOverdue(plain), true);                         // the clock is past the deadline
  assert.equal(plain.proposals.find((p) => p.stage_key === "award").overdue_count, 1);
  for (const [q, b] of carried) assert.deepEqual(proposals(w, q, b), plain, JSON.stringify([q, b]));
  // the clock moved back before the deadline: not overdue, whatever instant the request carries
  w.clock.nowMs = BEFORE;
  const early = proposals(w);
  assert.equal(awardOverdue(early), false);
  assert.equal(early.proposals.find((p) => p.stage_key === "award").overdue_count, 0);
  for (const [q, b] of carried) assert.deepEqual(proposals(w, q, b), early, JSON.stringify([q, b]));
  // control: the clock itself is read, so the two answers differ only by it
  assert.notDeepEqual(early, plain);
});

test("R43 R19: op=captureprogressions is evaluated at the configured clock (K3033); a now or nowMs in the query or the body answers exactly as the request without it", async () => {
  const w = await due({ nowMs: AFTER });
  const plain = capture(w);
  assert.deepEqual(overdueKinds(plain), [["award", true]]);
  for (const [q, b] of carried) assert.deepEqual(capture(w, q, b), plain, JSON.stringify([q, b]));
  w.clock.nowMs = BEFORE;
  const early = capture(w);
  assert.deepEqual(overdueKinds(early), []);
  for (const [q, b] of carried) assert.deepEqual(capture(w, q, b), early, JSON.stringify([q, b]));
  // its sha is still the query's (R19): another capture, and none, answer as they do without an instant
  assert.deepEqual(capture(w, { sha256: "nowhere", now: AFTER }), { ok: true, capture_sha: "nowhere", count: 0, instances: [] });
  assert.equal(call(w, "captureprogressions", { now: AFTER }).code, "NO_SHA");
});

test("R43 R16: with no clock given, BIO_NOW_MS is the server's instant, else the wall clock; neither is overridden by a request", async () => {
  // BIO_NOW_MS before the deadline: not overdue, though the request carries an instant after it (and the wall is after it)
  const e = await due({ env: { BIO_NOW_MS: String(BEFORE) } });
  assert.equal(awardOverdue(proposals(e)), false);
  assert.deepEqual(proposals(e, { now: AFTER }, { now: AFTER, nowMs: AFTER }), proposals(e));
  assert.deepEqual(overdueKinds(capture(e, { now: AFTER })), []);
  e.p.env.BIO_NOW_MS = String(AFTER);                              // the binding is read on every request
  assert.equal(awardOverdue(proposals(e, { now: BEFORE })), true);
  assert.deepEqual(overdueKinds(capture(e, { nowMs: BEFORE })), [["award", true]]);
  // the configured clock wins over the binding
  const both = await due({ nowMs: BEFORE, env: { BIO_NOW_MS: String(AFTER) } });
  assert.equal(awardOverdue(proposals(both)), false);
  // neither: the wall clock, which is past 2026-02-01, whatever the request says
  const wall = await due();
  assert.ok(Date.now() > at("2026-02-01T05:00:00Z"));
  assert.equal(awardOverdue(proposals(wall, { now: BEFORE })), true);
  assert.deepEqual(overdueKinds(capture(wall, { now: BEFORE }, { now: BEFORE })), [["award", true]]);
});

test("R43 R16: an in-plane caller may still pass its own instant to proposalsFeed and captureProgressions; no request does", async () => {
  const w = await due({ nowMs: BEFORE });
  assert.equal(awardOverdue(w.p.proposalsFeed(AFTER)), true);       // queue-producers, calculations, intent pass theirs
  assert.deepEqual(overdueKinds(w.p.captureProgressions({ captureSha: "sa", nowMs: AFTER })), [["award", true]]);
  assert.equal(awardOverdue(w.p.proposalsFeed(null)), false);      // none passed: the clock
  assert.deepEqual(w.p.proposalsFeed(), proposals(w));
  // the same instant through the route is ignored
  assert.equal(awardOverdue(proposals(w, { now: AFTER })), false);
});
