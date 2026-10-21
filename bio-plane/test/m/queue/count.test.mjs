/* R93 (T51 fix round 4, P9; K4429): `op=queue` with `count: true` answers the number of the viewer's open items the list would
   hold, without the list, so the frame's bell and sidebar do not read the whole feed. Driven at the module's interface: the
   ops map as the plane calls it, the door as the control plane calls it, and the control plane's decoration. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { queueOps, queueAnswer } from "../../../src/queue/index.mjs";
import { queueFeedOp } from "../../../src/queue/door.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, contradiction: { bound: 50, truncated: false }, dispositions: [] };
/** A producer item the mint accepts, as the other suites stub one. */
const stub = (a, it) => ({ summary: "an item", detail: "about it", basis: { source: "stub", detail: "stubbed" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
  options: [], case: a.homesOf([]), ...it });
const CONDITIONS = ["render-deferred", "text-undetermined", "client-rendered-shell"].map((kind) => ({ id: `CONDITION::${kind}::x`, class: "CONDITION", kind }));

function setup() {
  const w = world({ producers: { feedItems: (a) => ({ facts: FACTS, items: CONDITIONS.map((it) => stub(a, it)) }) } });
  w.member("alice");
  w.bundle("INF-1"); w.bundle("INF-2");
  w.task("TASK-2026-0001-a", "INF-1", { assignee: "alice" });
  w.task("TASK-2026-0002-b", "INF-2", { assignee: "alice" });
  return w;
}
const alice = { member: "alice", viewer: "member:alice" };
const URL_OF = (q) => new URL(`http://do/queue?member=alice&viewer=member%3Aalice&${q}`);

test("R93: count: true answers the number of the open items the list holds, without the list, and nothing but the count", () => {
  const w = setup();
  const list = w.q.queueFeed({ ...alice, limit: 500 });
  assert.equal(list.items.length, 5);
  const c = w.q.queueFeed({ ...alice, count: true });
  assert.deepEqual(c, { ok: true, member: "alice", count: list.items.length });
  assert.equal("items" in c, false, "no item is sent");
  // the query's "true" and "1" as the other flags read them
  for (const v of ["true", "1"]) assert.equal(w.q.queueFeed({ ...alice, count: v }).count, 5, v);
  // a machine credential's count is the whole live set it would be listed
  assert.equal(w.q.queueFeed({ viewer: "class:admin", count: true }).count, w.q.queueFeed({ viewer: "class:admin", limit: 500 }).items.length);
});

test("R93: the count is the list uncut by its limit, and leaves out what the member muted, as the list does", () => {
  const w = setup();
  assert.equal(w.q.queueFeed({ ...alice, limit: 2 }).items.length, 2);
  assert.equal(w.q.queueFeed({ ...alice, limit: 2, count: true }).count, 5, "the limit cuts the list, not the number of open items");
  assert.equal(w.q.queueMute({ ...alice, item: "CONDITION::render-deferred::x" }).ok, true);
  assert.equal(w.q.queueFeed({ ...alice, limit: 500 }).items.length, 4);
  assert.equal(w.q.queueFeed({ ...alice, count: true }).count, 4);
  // another member's mute moves nobody else's count (R30)
  w.member("bob");
  assert.equal(w.q.queueFeed({ member: "bob", viewer: "member:bob", count: true }).count,
    w.q.queueFeed({ member: "bob", viewer: "member:bob", limit: 500 }).items.length);
});

test("R93: the route passes count on, the door passes it to the store, and the control plane's decoration leaves the count as it is", async () => {
  const w = setup();
  const viaRoute = queueOps(w.q, URL_OF("count=true"), null).queue();
  assert.deepEqual(viaRoute, w.q.queueFeed({ ...alice, count: true }));
  assert.deepEqual(queueAnswer(viaRoute, { gate: {} }), { status: 200, result: viaRoute });
  const asked = [];
  const store = { fetch: (u) => { asked.push(new URL(u)); return "queue"; } };
  const out = await queueFeedOp(new URL("http://plane/?op=queue&count=true&now=1"), store, {
    json: (body, status) => ({ body, status }), doAnswer: async () => ({ answered: true, result: viaRoute }),
    storeRefusal: (o) => ({ refusal: o }), storeSilent: (op) => ({ silent: op }), gate: {}, storeName: "bio", cls: "member",
    member: "alice", viewer: "member:alice" });
  assert.equal(asked[0].searchParams.get("count"), "true", "the door passes count on");
  assert.equal(asked[0].searchParams.has("now"), false, "and still not a now (R53)");
  assert.deepEqual(out.body.result, viaRoute);
});

test("R93 (control): without count the list is read as before, every item and block", () => {
  const w = setup();
  for (const flag of [undefined, false, "false", "0", null, ""]) {
    const f = w.q.queueFeed({ ...alice, count: flag });
    assert.equal(f.items.length, 5, String(flag));
    for (const k of ["classes", "mute", "disposed", "feeds", "resolved"]) assert.ok(k in f, `${String(flag)}: ${k}`);
    assert.equal("count" in f, false, "the list states no count of its own");
  }
});
