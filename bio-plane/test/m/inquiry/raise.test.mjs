/* R42 (N422): when the registered `onRaised` answers an object, an act's reply carries what that object names as it
   stands when the reply is read, never a copy taken when the listener returned. `reevaluation` writes the listeners
   that failed onto its answer after the outermost commit (its R8, record-core R66); the stand-in below does exactly
   that through the real record-core's `afterCommit`, and each act is driven under a caller's transaction, for
   `staled` (R41), `dispose` (R21) and `divide` (R25). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const Q1 = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r", C1 = "INQ-2026-0003-c", C2 = "INQ-2026-0004-d";

/* reevaluation's shape: the answer handed back at once, its failed listeners named on it only after the commit */
function lateFailures(w, failing = ["intent"]) {
  const answers = [];
  w.k.onRaised("reevaluation", ({ target, cause, since }) => {
    const out = { source: cause, since, raised: [{ bundle_id: "DEP", ord: 0, target }] };
    answers.push(out);
    w.record.afterCommit(() => { out.listeners_failed = [...failing]; });
    return out;
  });
  return answers;
}

test("R42 R21 N422 dispose under a caller's transaction: listeners_failed written after the outermost commit reaches the reply", () => {
  const w = world(); w.inquiry(Q1); w.inquiry(Q2);
  const answers = lateFailures(w);
  w.select("h", [Q1, Q2]);
  let r, during;
  w.record.transact(() => {
    r = w.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: "admin", owner: "o", author: V("alice") });
    during = { has: "listeners_failed" in r.reevaluation, keys: Object.keys(r.reevaluation) };
    return null;
  });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(answers.length, 2);
  assert.deepEqual(during, { has: false, keys: ["source", "since", "raised"] }, "absent while none has failed");
  assert.deepEqual(r.reevaluation.listeners_failed, ["intent"], "read after the commit, each module once");
  assert.ok(Object.keys(r.reevaluation).includes("listeners_failed"));
  assert.deepEqual(JSON.parse(JSON.stringify(r.reevaluation)),
    { source: "deferred", since: r.reevaluation.since, raised: [{ bundle_id: "DEP", ord: 0, target: Q1 }, { bundle_id: "DEP", ord: 0, target: Q2 }],
      listeners_failed: ["intent"] }, "the reply as it is sent");
});

test("R42 R25 N422 divide under a caller's transaction carries the late failures; a transaction that rolls back never names any", () => {
  const setup = () => {
    const w = world(); w.doc(A); w.doc(B);
    w.inquiry(Q1, { legs: [{ target: A }, { target: B }] });
    return w;
  };
  const div = (w) => w.k.divide({ target: Q1, reason: "two questions", viewer: "admin", author: V("alice"),
    children: [{ id: C1, question: "First?", legs: [0] }, { id: C2, question: "Second?", legs: [1] }] });
  const w = setup(); lateFailures(w, ["intent", "queue"]);
  let r;
  w.record.transact(() => { r = div(w); return null; });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.reevaluation.listeners_failed, ["intent", "queue"]);
  /* rolled back: the held call is dropped (record-core R66), so the reply names no failure */
  const w2 = setup(); lateFailures(w2);
  let t;
  w2.record.transact(() => { t = div(w2); return { ok: false, reason: "CALLER_ROLLED_BACK" }; });
  assert.equal(t.ok, true);
  assert.equal(t.reevaluation.listeners_failed, undefined);
  assert.equal("listeners_failed" in t.reevaluation, false);
});

test("R41 R42 N422 a re-read inside content's transaction carries failures written after it commits, beside a listener that threw", () => {
  const w = world(); const [cap] = w.doc(A);
  w.inquiry(Q1, { legs: [{ target: A }] }); w.inquiry(Q2, { legs: [{ target: A }] });
  const cid = w.row(`SELECT content_id FROM inquiry_basis WHERE bundle_id=?`, Q1).content_id;
  w.k.onRaised("reevaluation", ({ target, cause, since }) => {
    if (target === Q2) throw new Error("boom");
    const out = { source: cause, since, raised: [{ bundle_id: "DEP", ord: 0 }] };
    w.record.afterCommit(() => { out.listeners_failed = ["intent"]; });
    return out;
  });
  let r;
  w.record.transact(() => { r = w.k.staled({ capture_sha: cap, rows: [{ content_id: cid }] }); return null; });
  assert.deepEqual(r.reevaluation.listeners_failed, ["intent", "reevaluation"],
    "in the order the inquiries were told: the late failure read now, the throw named at once");
  /* outside any transaction the late write happens at once, and the reply reads the same */
  const s = w.k.staled({ capture_sha: cap, rows: [{ content_id: cid }] });
  assert.deepEqual(s.reevaluation.listeners_failed, ["intent", "reevaluation"]);
});

test("R42 N422 a listener answering only the dependents, or nothing registered: no listeners_failed, and the absence said", () => {
  const w = world(); w.inquiry(Q1); w.listen(); w.select("h", [Q1]);
  const r = w.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: "admin", owner: "o", author: V("alice") });
  assert.equal("listeners_failed" in r.reevaluation, false);
  const w2 = world(); w2.inquiry(Q1); w2.select("h", [Q1]);
  const t = w2.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: "admin", owner: "o", author: V("alice") });
  assert.equal(t.reevaluation, undefined); assert.match(t.reevaluation_absent, /no module is registered/);
});
