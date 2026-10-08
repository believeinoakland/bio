/* capture (T36): requirement-named tests at the module's interface for T36-41 (build/requirements/capture.md R45,
   N740; K2038, K2087). A fresh store per test; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, H } from "./fixture.mjs";

const UND = "authority-undetermined", UNPACK = "archive-unpack";
const shaOf = (i) => i.toString(16).padStart(64, "0");
const at = (min) => `2026-10-08T00:${String(min).padStart(2, "0")}:00Z`;
/* a well-formed cursor of some other shape (base64url of a JSON array of strings), as another read's `next` is */
const foreign = (parts) => Buffer.from(JSON.stringify(parts)).toString("base64url");

/* Every event behind the head, reached by a drainer that never removes what it reads (the head-of-line case). */
const drain = (c, { limit, kind }) => {
  const seen = []; let after = null;
  for (let pages = 0; pages < 100; pages++) {
    const page = c.taskEvents({ limit, kind, after });
    if (!page.length) return seen;
    seen.push(...page); after = page[page.length - 1].cursor;
  }
  throw new Error("the read never reached the end");
};

test("R45 (T36-41, N740): every event carries an opaque cursor; passing on the last one reaches every event behind a head left queued, each once, in order", async () => {
  const { c } = fresh();
  /* 7 events, enqueued out of digest order, two at the same instant */
  const plan = [[5, 3], [1, 1], [9, 2], [3, 2], [7, 4], [2, 0], [8, 5]];
  for (const [i, m] of plan) await c.taskEnqueue({ captureSha: shaOf(i), subject: `s${i}`, at: at(m) });
  const whole = c.taskEvents({ limit: 1000 });
  assert.deepEqual(whole.map((e) => e.captureSha), [2, 1, 3, 9, 5, 7, 8].map(shaOf), "by enqueued, then digest");
  for (const e of whole) {
    assert.equal(typeof e.cursor, "string"); assert.ok(e.cursor.length > 0);
    assert.deepEqual(Object.keys(e).sort(), ["attempts", "captureSha", "cursor", "enqueued", "kind", "lastTry", "locator", "subject"]);
  }
  assert.equal(new Set(whole.map((e) => e.cursor)).size, whole.length, "each event its own cursor");
  for (const limit of [1, 2, 3, 6, 7, 50]) {
    const got = drain(c, { limit });
    assert.deepEqual(got.map((e) => e.captureSha), whole.map((e) => e.captureSha), `limit ${limit}: every event, once, in order`);
    assert.deepEqual(got, whole, `limit ${limit}: the events answered whole`);
  }
  /* the last event's cursor answers nothing behind it */
  assert.deepEqual(c.taskEvents({ limit: 10, after: whole[whole.length - 1].cursor }), []);
  /* a cursor reads only past its place: from the third, the four after it */
  assert.deepEqual(c.taskEvents({ limit: 10, after: whole[2].cursor }).map((e) => e.captureSha), whole.slice(3).map((e) => e.captureSha));
  /* reading writes nothing */
  assert.equal(c.taskEventCount(), 7);
  assert.deepEqual(c.taskEvents({ limit: 1000 }), whole);
});

test("R45 (T36-41): a cursor keeps its place when its event is gone, and an event attempted or re-enqueued keeps its own place", async () => {
  const { c } = fresh();
  for (let i = 1; i <= 5; i++) await c.taskEnqueue({ captureSha: shaOf(i), subject: `s${i}`, at: at(i) });
  const whole = c.taskEvents({ limit: 10 });
  const mark = whole[1].cursor;
  assert.deepEqual(c.taskEventRemove({ kind: UND, captureSha: shaOf(2) }), { found: true });
  assert.deepEqual(c.taskEvents({ limit: 10, after: mark }).map((e) => e.captureSha), [3, 4, 5].map(shaOf), "whether or not that event is still queued");
  assert.deepEqual(c.taskEventRemove({ kind: UND, captureSha: shaOf(3) }), { found: true });
  assert.deepEqual(c.taskEvents({ limit: 10, after: mark }).map((e) => e.captureSha), [4, 5].map(shaOf), "nor the ones after it");
  /* an attempt moves no event: its cursor and order are unchanged */
  assert.deepEqual(c.taskEventAttempt({ kind: UND, captureSha: shaOf(4), at: "2026-10-09T00:00:00Z" }), { found: true });
  const four = c.taskEvents({ limit: 10, after: mark })[0];
  assert.deepEqual([four.captureSha, four.attempts, four.lastTry, four.cursor], [shaOf(4), 1, "2026-10-09T00:00:00Z", whole[3].cursor]);
  /* a re-enqueue is deduped and keeps the first place */
  assert.equal((await c.taskEnqueue({ captureSha: shaOf(1), at: at(59) })).deduped, true);
  assert.deepEqual(c.taskEvents({ limit: 1 })[0].cursor, whole[0].cursor);
  /* an event enqueued later at an earlier instant sorts before the cursor and is read from the head */
  await c.taskEnqueue({ captureSha: shaOf(9), subject: "late", at: at(0) });
  assert.equal(c.taskEvents({ limit: 1 })[0].captureSha, shaOf(9));
  assert.ok(!c.taskEvents({ limit: 10, after: mark }).some((e) => e.captureSha === shaOf(9)));
});

test("R45 (T36-41): with kind, the cursor reads only that kind's past its place; with no kind, events of one instant and digest are told apart by kind", async () => {
  const { c } = fresh();
  const A = H("a"), B = H("b");
  await c.taskEnqueue({ kind: UNPACK, captureSha: A, subject: "u", at: at(1) });
  await c.taskEnqueue({ kind: UND, captureSha: A, subject: "a", at: at(1) });
  await c.taskEnqueue({ kind: UND, captureSha: B, subject: "b", at: at(1) });
  await c.taskEnqueue({ kind: UNPACK, captureSha: B, subject: "u", at: at(2) });
  const all = drain(c, { limit: 1 });
  assert.deepEqual(all.map((e) => [e.kind, e.captureSha]), [[UNPACK, A], [UND, A], [UND, B], [UNPACK, B]], "every event once, the same instant and digest apart by kind");
  assert.deepEqual(all, c.taskEvents({ limit: 10 }));
  assert.deepEqual(drain(c, { limit: 1, kind: UNPACK }).map((e) => e.captureSha), [A, B]);
  assert.deepEqual(drain(c, { limit: 1, kind: UND }).map((e) => e.captureSha), [A, B]);
  /* a cursor of one kind's read places a read of the other kind in the same order */
  const firstUnpack = c.taskEvents({ limit: 1, kind: UNPACK })[0].cursor;
  assert.deepEqual(c.taskEvents({ kind: UND, after: firstUnpack }).map((e) => e.captureSha), [A, B], "(1, A, archive-unpack) sorts before (1, A, authority-undetermined)");
  const lastUnd = c.taskEvents({ kind: UND })[1].cursor;
  assert.deepEqual(c.taskEvents({ kind: UNPACK, after: lastUnd }).map((e) => e.captureSha), [B]);
  assert.deepEqual([c.taskEventCount(), c.taskEventCount({ kind: UND }), c.taskEventCount({ kind: UNPACK })], [4, 2, 2]);
});

test("R45 (T36-41): an after that is not a cursor this read answered is read as absent, from the head; none of the four throws", async () => {
  const { c } = fresh();
  for (let i = 1; i <= 3; i++) await c.taskEnqueue({ captureSha: shaOf(i), subject: `s${i}`, at: at(i) });
  const head = c.taskEvents({ limit: 2 });
  const cur = c.taskEvents({ limit: 10 })[0].cursor;
  for (const after of [undefined, null, "", "nonsense", "%%%", 42, {}, [], true, cur.slice(0, -2), cur + "x",
                       foreign(["2026-10-08T00:01:00Z", shaOf(1), UND]), foreign(["other-read", at(1), shaOf(1), UND]),
                       foreign(["task-event", at(1), shaOf(1)]), foreign(["task-event", 1, shaOf(1), UND]), foreign({ a: 1 })])
    assert.deepEqual(c.taskEvents({ limit: 2, after }), head, `after ${JSON.stringify(after)} reads from the head`);
  assert.deepEqual(c.taskEvents({ limit: 0, after: cur }), []);
  assert.doesNotThrow(() => c.taskEvents({ limit: "nonsense", after: Symbol("x") }));
  assert.deepEqual(c.taskEvents({ limit: "nonsense", after: Symbol("x") }), []);
  assert.doesNotThrow(() => c.taskEvents(undefined));
  assert.doesNotThrow(() => c.taskEventCount({ kind: Symbol("k") }));
  assert.deepEqual(c.taskEventAttempt({ kind: UND, captureSha: shaOf(7), at: at(9) }), { found: false });
  assert.deepEqual(c.taskEventRemove({ kind: UND, captureSha: shaOf(7) }), { found: false });
  /* a store that cannot be read: an empty list, a zero count, not found, never a throw */
  const broken = fresh();
  await broken.c.taskEnqueue({ captureSha: shaOf(1), at: at(1) });
  const c2 = broken.c; const cursor = c2.taskEvents({ limit: 1 })[0].cursor;
  broken.rows("DROP TABLE task_queue");
  assert.deepEqual(c2.taskEvents({ limit: 5, after: cursor }), []);
  assert.equal(c2.taskEventCount(), 0);
  assert.deepEqual(c2.taskEventAttempt({ kind: UND, captureSha: shaOf(1), at: at(2) }), { found: false });
  assert.deepEqual(c2.taskEventRemove({ kind: UND, captureSha: shaOf(1) }), { found: false });
});
