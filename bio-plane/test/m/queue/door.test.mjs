/* `op=queue`'s door half (R6, R17, R37), moved from the control plane's `src/index.mjs` at T19: driven at its interface
   with the control plane's helpers stood in for (`json`, `doAnswer`, `storeRefusal`, `storeSilent`) and a store stub
   that answers by route, so what reaches the store and what the caller is answered are both observed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { QUEUE_DOOR_OPS, queueOp, queueFeedOp } from "../../../src/queue/door.mjs";
import { decorate, vocabulariesFor } from "../../../src/affordances.mjs";

const GATE = { needs: (op) => (op === "linkproject" ? "contribute" : null), mode: () => "session" };

/** A door over a stub store: `answers` maps a route (`queue`, `actionkinds`) to the envelope `doAnswer` reads. */
function door(answers) {
  const asked = [];
  const store = { fetch: (u) => { asked.push(new URL(u)); return new URL(u).pathname.slice(1); } };
  const helpers = {
    json: (body, status) => ({ body, status }),
    doAnswer: async (route) => answers[route] ?? { answered: false, correlation: `c-${route}` },
    storeRefusal: (out) => ({ refusal: out }),
    storeSilent: (op, correlation) => ({ silent: op, correlation: correlation ?? null }),
    gate: GATE, storeName: "bio", cls: "admin", member: "alice", viewer: "member:alice",
  };
  return { asked, store, helpers };
}

const FEED = { ok: true, member: "alice", limit: 200, item_count: 1, truncated: false,
  items: [{ id: "T-1", class: "OBLIGATION", kind: "authority-undetermined",
            options: [{ id: "linkproject", label: "Link", weight: "single" }] }] };

test("R6, R37: the store is asked for the feed with the control plane's member and viewer, and only now and limit from the caller", async () => {
  const d = door({ queue: { answered: true, result: FEED }, actionkinds: { answered: true, result: { kinds: [] } } });
  const url = new URL("http://plane/?op=queue&now=123&limit=7&member=mallory&viewer=class%3Aadmin&store=x");
  const out = await queueOp("queue", url, () => d.store, d.helpers);
  assert.equal(out.status, 200);
  const q = d.asked[0];
  assert.equal(q.pathname, "/queue");
  assert.deepEqual(Object.fromEntries(q.searchParams), { viewer: "member:alice", member: "alice", now: "123", limit: "7" });
  assert.equal(d.asked[1].pathname, "/actionkinds");
  /* A machine credential's stamps: member empty, viewer its class. Absent now and limit are not sent. */
  const m = door({ queue: { answered: true, result: FEED }, actionkinds: { answered: true, result: { kinds: [] } } });
  await queueOp("queue", new URL("http://plane/?op=queue"), () => m.store, { ...m.helpers, member: "", viewer: "class:admin" });
  assert.deepEqual(Object.fromEntries(m.asked[0].searchParams), { viewer: "class:admin", member: "" });
});

test("R17: every option is decorated through affordances.decorate with the gate, the vocabularies are actions' kinds, in the envelope", async () => {
  const kinds = ["complaint"];
  const d = door({ queue: { answered: true, result: FEED }, actionkinds: { answered: true, result: { kinds } } });
  const out = await queueFeedOp(new URL("http://plane/?op=queue"), d.store, d.helpers);
  assert.equal(out.status, 200);
  assert.equal(out.body.ok, true);
  assert.equal(out.body.store, "bio");
  assert.equal(out.body.tokenClass, "admin");
  assert.deepEqual(out.body.result.items[0].options, FEED.items[0].options.map((a) => decorate(a, GATE)));
  assert.deepEqual(out.body.result.vocabularies, vocabulariesFor(kinds));
  assert.equal(out.body.result.member, "alice");
});

test("R17: a store refusal of the feed is passed through with status 400, after the kinds are asked", async () => {
  const refused = { ok: false, reason: "NO_SUCH_KIND", code: "NO_SUCH_KIND", check: "C-31.2" };
  const d = door({ queue: { answered: true, result: refused }, actionkinds: { answered: true, result: { kinds: [] } } });
  const out = await queueFeedOp(new URL("http://plane/?op=queue"), d.store, d.helpers);
  assert.deepEqual(out, { status: 400, body: { ...refused, ok: false, store: "bio", tokenClass: "admin" } });
  assert.equal(d.asked.length, 2);
});

test("R17 (REC-52): a silence or an envelope refusal is the control plane's own answer, never an empty feed", async () => {
  const url = new URL("http://plane/?op=queue");
  /* The feed unanswered: silent with its correlation; the kinds never asked. */
  let d = door({});
  assert.deepEqual(await queueFeedOp(url, d.store, d.helpers), { silent: "queue", correlation: "c-queue" });
  assert.equal(d.asked.length, 1);
  /* Answered with nothing: silent, no correlation. */
  d = door({ queue: { answered: true, result: null } });
  assert.deepEqual(await queueFeedOp(url, d.store, d.helpers), { silent: "queue", correlation: null });
  /* The store's envelope refused: relayed. */
  d = door({ queue: { refused: true, reason: "X" } });
  assert.deepEqual(await queueFeedOp(url, d.store, d.helpers), { refusal: { refused: true, reason: "X" } });
  /* The kinds unanswered or refused: the same two answers, after the feed. */
  d = door({ queue: { answered: true, result: FEED } });
  assert.deepEqual(await queueFeedOp(url, d.store, d.helpers), { silent: "queue", correlation: "c-actionkinds" });
  d = door({ queue: { answered: true, result: FEED }, actionkinds: { refused: true, reason: "Y" } });
  assert.deepEqual(await queueFeedOp(url, d.store, d.helpers), { refusal: { refused: true, reason: "Y" } });
});

test("R6: the door answers op=queue only; any other op is not its own", async () => {
  assert.deepEqual([...QUEUE_DOOR_OPS], ["queue"]);
  const d = door({});
  for (const op of ["queuemute", "queuesnooze", "proposedispose", "affordances"])
    assert.equal(await queueOp(op, new URL("http://plane/"), () => d.store, d.helpers), null);
  assert.equal(d.asked.length, 0);
});
