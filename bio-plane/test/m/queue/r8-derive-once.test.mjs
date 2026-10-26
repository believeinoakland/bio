/* G116 (T51 fix round 8; A.md:34; diagnosis-R8-speed.md B and C): one screen made two or three full derivations of the feed (the
   list, the muted list's lookups, the count), one after another on the one thread. R94: for one viewer at one count signature (the
   record's write counter, this module's own writes, the clock's 5-second bucket) the list and the count are made from ONE
   derivation, kept for the bucket; the list differs from the count only by its cut. Each answer states how it was served
   (`derivation.served`, `hit` or `miss`) and a miss states its figures (`rows_read`, `rows_written`, `items_by_producer`), which
   control-plane carries into `Server-Timing` (`queue-count`, `rows-queue`) and a miss logs once. The derivation is COUNTED at the
   producers' read, never timed (R-CLOCK). Driven at the module's interface (`queueFeed`, `queueAnswer`, the ops map). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { Queue, queueAnswer } from "../../../src/queue/index.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, contradiction: { bound: 50, truncated: false }, dispositions: [] };
const stub = (a, it) => ({ summary: "an item", detail: "about it", basis: { source: "stub", detail: "stubbed" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
  options: [], case: a.homesOf([]), ...it });
const condition = (kind, tail = "x") => ({ id: `CONDITION::${kind}::${tail}`, class: "CONDITION", kind });
const alice = { member: "alice", viewer: "member:alice" };

/** A world whose producers' items are `state.items`; `state.produced` counts the producers' read, which is what a derivation is. */
function setup(items = [condition("render-deferred"), condition("text-undetermined"), condition("client-rendered-shell")]) {
  const state = { items, produced: 0 };
  const w = world({ producers: { feedItems: (a) => { state.produced += 1; return { facts: FACTS, items: state.items.map((it) => stub(a, { ...it, case: a.homesOf([]) })) }; } } });
  w.member("alice"); w.member("bob");
  w.bundle("INF-1"); w.bundle("INF-2");
  w.task("TASK-2026-0001-a", "INF-1", { assignee: "alice" });
  return { w, state };
}

test("R94 (G116): the list, the muted list and the count of one viewer at one signature are served by one derivation, and the list differs from the count only by its cut", () => {
  const { w, state } = setup();
  const list = w.q.queueFeed({ ...alice, limit: 500 });
  const muted = w.q.queueFeed({ ...alice, muted: true });
  const count = w.q.queueFeed({ ...alice, count: true });
  const cut = w.q.queueFeed({ ...alice, limit: 2 });
  assert.equal(state.produced, 1, "four reads of one screen, the producers read once (before: 3)");
  assert.equal(muted.ok, true);
  assert.equal(count.count, list.items.length, "the count is the list's length");
  assert.equal(cut.items.length, 2);
  assert.deepEqual(cut.items.map((i) => i.id), list.items.slice(0, 2).map((i) => i.id), "the cut list is the head of the list");
  assert.equal(cut.truncated, true);
  assert.equal(list.truncated, false);
  // the blocks of the two lists are the one derivation's
  const strip = ({ items: _i, item_count: _c, truncated: _t, limit: _l, counts: _k, derivation: _d, ...rest }) => rest;
  assert.deepEqual(strip(cut), strip(list));
});

test("R94 (G116): an answer is a copy: a caller changing what it was handed changes no other answer made from the derivation", () => {
  const { w } = setup();
  const a = w.q.queueFeed({ ...alice, limit: 500 });
  a.items.length = 0; a.mute.suppressed.push({ id: "x" }); a.feeds[0].answered = false; a.disposed.findings.push({ id: "y" });
  const b = w.q.queueFeed({ ...alice, limit: 500 });
  assert.equal(b.items.length, 4);
  assert.deepEqual(b.mute.suppressed, []);
  assert.equal(b.feeds[0].answered, true);
  assert.deepEqual(b.disposed.findings, []);
});

test("R94 (G116): each answer states how it was served, and a miss states its figures", () => {
  const { w } = setup();
  const first = w.q.queueFeed({ ...alice, limit: 500 });
  assert.equal(first.derivation.served, "miss");
  assert.deepEqual(first.derivation.items_by_producer, { tasks: 1, "queue-producers": 3, "notice-producers": 0 });
  for (const k of ["rows_read", "rows_written"]) assert.ok(k in first.derivation, k);
  const second = w.q.queueFeed({ ...alice, limit: 500 });
  assert.deepEqual(second.derivation, { served: "hit" }, "a hit states the mark and no figures");
  const c = w.q.queueFeed({ ...alice, count: true });
  assert.deepEqual(c.derivation, { served: "hit" });
  // another viewer is a derivation of its own
  assert.equal(w.q.queueFeed({ member: "bob", viewer: "member:bob", count: true }).derivation.served, "miss");
  // the mark rides through the control plane's decoration, on the list and on the count
  assert.deepEqual(queueAnswer(first, { gate: {} }).result.derivation, first.derivation);
  assert.deepEqual(queueAnswer(c, { gate: {} }).result.derivation, c.derivation);
});

test("R94 (G116): the figures of a miss are the runtime's own row counters, summed over the cursors the derivation opened; nothing is made up", () => {
  const { w } = setup();
  // a storage whose cursors state `rowsRead` and `rowsWritten` as workerd's do
  const real = w.sql.exec;
  const handed = [];
  w.sql.exec = (q, ...a) => { const c = real(q, ...a); c.rowsRead = 3; c.rowsWritten = /^\s*(INSERT|UPDATE|DELETE)/i.test(q) ? 1 : 0; handed.push(q); return c; };
  const decorated = w.sql.exec;
  const miss = w.q.queueFeed({ ...alice, count: true });
  /* the record's write counter, which the signature reads, makes its own statements before the derivation (its total, and since
     record-core R91 its bookkeeping tally and the triggers it sets on a first reading); they are not the derivation's */
  const counter = /total_changes\(\)|bookkeeping_tally|sqlite_master|CREATE TRIGGER/i;
  const own = handed.filter((q) => !counter.test(q)).length;
  assert.ok(handed.length > own, "the signature's counter statements were made");
  assert.equal(miss.derivation.rows_read, own * 3, "every read of the derivation was counted");
  assert.ok(miss.derivation.rows_read > 0);
  assert.equal(miss.derivation.rows_written, 0, "a derivation writes nothing");
  assert.equal(w.sql.exec, decorated, "the storage's exec is put back as it was");
  w.sql.exec = real;
  // a runtime that states no counter states none (null), never zero
  const { w: w2 } = setup();
  assert.deepEqual([w2.q.queueFeed({ ...alice, limit: 500 }).derivation.rows_read, w2.sql.exec === real], [null, false]);
  // a storage that cannot be wrapped still answers, with null figures
  const { w: w3 } = setup();
  Object.freeze(w3.sql);
  const frozen = w3.q.queueFeed({ ...alice, limit: 500 });
  assert.equal(frozen.ok, true);
  assert.equal(frozen.derivation.rows_read, null);
});

test("R94 (G116, R-LOG): a miss writes one log line carrying the figures; a hit writes none", () => {
  const { w } = setup();
  const lines = [];
  const log = console.log;
  console.log = (...a) => { lines.push(a.join(" ")); };
  try {
    w.q.queueFeed({ ...alice, limit: 500 });
    const afterMiss = lines.length;
    w.q.queueFeed({ ...alice, count: true });
    w.q.queueFeed({ ...alice, limit: 500 });
    assert.equal(lines.length, afterMiss, "hits log nothing");
  } finally { console.log = log; }
  const mine = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((l) => l && l.event === "queue_derive");
  assert.equal(mine.length, 1);
  for (const k of ["rows_read", "rows_written", "items_by_producer", "items"]) assert.ok(k in mine[0], k);
  assert.equal(mine[0].items, 4);
  assert.equal(JSON.stringify(mine[0]).includes("alice"), false, "a count, an instant or an identifier, never a name");
});

test("R94 (G116): a write of this member's own (a mute, a snooze) or the record's moves the next list, which is never served from before it", () => {
  const { w, state } = setup();
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.cite("PRJ-1", "INF-1");
  const ids = () => w.q.queueFeed({ ...alice, limit: 500 }).items.map((i) => i.id);
  assert.equal(ids().includes("CONDITION::text-undetermined::x"), true);
  assert.equal(w.q.queueMute({ ...alice, item: "CONDITION::text-undetermined::x" }).ok, true);
  assert.equal(ids().includes("CONDITION::text-undetermined::x"), false, "an item mute is seen by the next list");
  assert.equal(w.q.queueMute({ ...alice, item: "CONDITION::text-undetermined::x", unmute: true }).ok, true);
  assert.equal(ids().includes("CONDITION::text-undetermined::x"), true, "and its unmute");
  const before = w.q.queueFeed({ ...alice, limit: 500 });
  assert.equal(w.q.queueSnooze({ ...alice, case: "PRJ-1", until: iso(NOW + 86400000) }).ok, true);
  assert.deepEqual(Object.keys(w.q.queueFeed({ ...alice, limit: 500 }).mute.snoozed_until), ["PRJ-1"], "a snooze is seen by the next list");
  assert.deepEqual(before.mute.snoozed_until, {});
  const produced = state.produced;
  w.q.queueFeed({ ...alice, limit: 500 }); w.q.queueFeed({ ...alice, count: true });
  assert.equal(state.produced, produced, "control: nothing moved, nothing was derived again");
});

test("R94 (G116, control): a lapsing snooze is judged at the ask's own instant, not the derivation's", () => {
  const { w } = setup();
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.cite("PRJ-1", "INF-1");
  const bucket = Queue.QUEUE_COUNT_BUCKET_MS;
  w.now = Math.floor(NOW / bucket) * bucket + 1;
  assert.equal(w.q.queueSnooze({ ...alice, case: "PRJ-1", until: iso(w.now + 1500) }).ok, true);
  assert.deepEqual(Object.keys(w.q.queueFeed({ ...alice, limit: 500 }).mute.snoozed_until), ["PRJ-1"]);
  w.now += 2000;   // still the same bucket of the clock: the derivation is the one kept, the snooze has lapsed
  const later = w.q.queueFeed({ ...alice, limit: 500 });
  assert.equal(later.derivation.served, "hit");
  assert.deepEqual(later.mute.snoozed_until, {}, "a snooze that lapsed within the bucket is not reported as held");
});
