/* R53 (T47; N983, K3027): `op=queue` is judged at the server's instant, never at one a request names. Driven at the
   module's interface: the route (`queueOps`), the door half (`door.test.mjs` holds that it passes no `now` on), and
   `queueOf`'s clock option, over the queue's test world. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso, byId } from "./world.mjs";
import { queueOf, queueOps } from "../../../src/queue/index.mjs";

const DAY = 86400000;
const YEAR_AHEAD = NOW + 365 * DAY;

/** A world with one task on a document an inquiry rests on, a member's snooze on that inquiry for ten days, and a
 *  notice producer that records the instant it was handed. */
function clocked() {
  const asked = [];
  const w = world({ notices: { noticeItems: (a) => { asked.push(a.now); return { items: [], facts: {} }; } } });
  w.member("alice");
  w.bundle("INF-1"); w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "INF-1");
  w.task("TASK-2026-0001-a", "INF-1", { created: iso(NOW - 3600000) });
  const snoozed = w.q.queueSnooze({ member: "alice", case: "INQ-1", until: iso(NOW + 10 * DAY), viewer: "member:alice" });
  assert.equal(snoozed.ok, true, JSON.stringify(snoozed));
  return { w, asked };
}

const ask = (w, query, body) => {
  const url = new URL(`http://do/queue?member=alice&viewer=member%3Aalice${query}`);
  return queueOps(w.q, url, body).queue();
};

test("R53: op=queue with now a year ahead, in the query or the body, answers the same items, ages and snoozes as without it", () => {
  const { w, asked } = clocked();
  const plain = ask(w, "");
  assert.equal(plain.ok, true, JSON.stringify(plain));
  const ahead = ask(w, `&now=${YEAR_AHEAD}`);
  const inBody = ask(w, "", { now: YEAR_AHEAD, nowMs: YEAR_AHEAD });
  assert.deepEqual(ahead, plain, "a query `now` is never read");
  assert.deepEqual(inBody, plain, "a body `now` is never read");
  /* Judged at the module's clock (the world's NOW): the task is an hour old, the snooze still holds, and the producers
     were handed that instant on every call. */
  const it = byId(plain)["TASK-2026-0001-a"];
  assert.equal(it.age.ms, 3600000);
  assert.equal(it.snoozed && it.snoozed.until, new Date(NOW + 10 * DAY).toISOString());
  assert.deepEqual(plain.mute.snoozed_until, { "INQ-1": new Date(NOW + 10 * DAY).toISOString() });
  assert.deepEqual(asked, [NOW, NOW, NOW]);
  /* Control: the clock moved a year ahead moves the answer, so the sameness above is the request being ignored. */
  w.now = YEAR_AHEAD;
  const later = ask(w, `&now=${NOW}`);
  assert.equal(byId(later)["TASK-2026-0001-a"].age.ms, YEAR_AHEAD - NOW + 3600000);
  assert.equal(byId(later)["TASK-2026-0001-a"].snoozed, undefined, "the snooze has lapsed at the module's clock");
  assert.deepEqual(later.mute.snoozed_until, {});
  assert.equal(asked.at(-1), YEAR_AHEAD);
});

test("R53: an in-plane caller of queueFeed may still pass its own now; the route passes none", () => {
  const { w, asked } = clocked();
  const at = w.q.queueFeed({ member: "alice", viewer: "member:alice", nowMs: NOW + 2 * 3600000 });
  assert.equal(byId(at)["TASK-2026-0001-a"].age.ms, 3 * 3600000);
  assert.equal(asked.at(-1), NOW + 2 * 3600000);
});

test("R53: queueOf's now is adopted from the first caller that supplies one; the same function is accepted and another refused by a throw naming now", () => {
  const w = world();
  /* The world's own instance holds the clock the world gave: another is refused, and the instance keeps judging at its own. */
  assert.throws(() => queueOf(w.host, { now: () => 0 }), /`now`/);
  assert.equal(w.q.clock !== null, true);
  w.bundle("INF-1"); w.task("TASK-2026-0001-a", "INF-1", { created: iso(NOW - 3600000) });
  assert.equal(byId(w.feed())["TASK-2026-0001-a"].age.ms, 3600000, "the refused clock changed nothing");
  /* A storage whose first caller supplied no clock: the first later caller's is adopted, the same one accepted again. */
  const host = { storage: { sql: w.sql, transactionSync: (fn) => fn() } };
  const deps = { record: w.record, membership: w.membership, tasks: w.tasks, start: false, ...w.fakes };
  const q = queueOf(host, deps);
  assert.equal(q.clock, null);
  const at = () => NOW + 7200000;
  assert.equal(queueOf(host, { now: at }), q);
  assert.equal(q.clock, at);
  assert.equal(queueOf(host, { now: at }), q, "the same function is accepted");
  assert.equal(queueOf(host), q, "a call supplying no clock is no comparison");
  assert.equal(byId(q.queueFeed({ viewer: "class:admin" }))["TASK-2026-0001-a"].age.ms, 3 * 3600000);
  assert.throws(() => queueOf(host, { now: () => NOW }), /`now`/);
  assert.equal(q.clock, at, "a refused call adopts nothing");
});

test("R53: a clock that throws or answers no finite instant reads the wall clock, never the epoch", () => {
  for (const bad of [() => { throw new Error("clock at fault"); }, () => NaN]) {
    const w = world();
    const host = { storage: { sql: w.sql, transactionSync: (fn) => fn() } };
    const q = queueOf(host, { record: w.record, membership: w.membership, tasks: w.tasks, start: false, ...w.fakes, now: bad });
    w.bundle("INF-1"); w.task("TASK-2026-0001-a", "INF-1", { created: iso(NOW - 3600000) });
    const before = Date.now();
    const ms = byId(q.queueFeed({ viewer: "class:admin" }))["TASK-2026-0001-a"].age.ms;
    assert.ok(ms >= before - (NOW - 3600000) && ms <= Date.now() - (NOW - 3600000), String(ms));
  }
});
