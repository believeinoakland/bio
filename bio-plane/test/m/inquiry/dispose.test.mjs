/* dispose (R20–R22, R39): deferring or dismissing a selection of inquiries, refused whole with every offender named,
   moving the whole set or none of it, and never moving the stance of a question more than one project draws on. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { DISPOSITIONS } from "../../../src/inquiry/index.mjs";

const A = "INFO-2026-0001-a";
const Q1 = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
const go = (w, handle, to, reason = "later", extra = {}) =>
  w.k.dispose({ handle, to, reason, viewer: "admin", owner: "o", author: V("alice"), ...extra });

test("R20 refusals in order, each moving nothing and naming every offender", () => {
  const caseMembers = new Set();
  const w = world({ caseMembers }); w.doc(A);
  w.inquiry(Q1); w.inquiry(Q2);
  const heads = () => [w.record.head(Q1).bundleSha, w.record.head(Q2).bundleSha];
  const before = heads();
  assert.deepEqual(DISPOSITIONS, ["deferred", "dismissed"]);
  assert.equal(go(w, "h", "bogus").reason, "BAD_TARGET_STATE");
  assert.equal(go(w, "h", "concluded").reason, "NOT_A_DISPOSITION");
  assert.equal(go(w, "h", "deferred", "  ").reason, "NO_REASON");
  assert.equal(go(w, "h", "deferred", "x".repeat(161)).reason, "BAD_REASON");
  assert.equal(go(w, "h", "deferred", 'a "quote"').reason, "BAD_REASON");
  assert.equal(go(w, "h", "deferred", "two\nlines").reason, "BAD_REASON");
  assert.equal(go(w, "missing", "deferred").reason, "NO_SUCH_SELECTION", "the selection at weight refuse (retrieval R19)");
  w.select("moved", [Q1], { moved: true });
  assert.equal(go(w, "moved", "deferred").reason, "SET_MOVED", "retrieval R20");
  w.select("empty", []);
  assert.equal(go(w, "empty", "deferred").reason, "EMPTY_SELECTION");
  w.select("mixed", [Q1, A]);
  const ni = go(w, "mixed", "deferred");
  assert.equal(ni.reason, "NOT_INQUIRIES"); assert.deepEqual(ni.offenders, [A]); assert.equal(ni.check, "C-33.13"); assert.ok(ni.translation);
  caseMembers.add(Q2);
  w.select("both", [Q1, Q2]);
  const pub = go(w, "both", "deferred");
  assert.equal(pub.reason, "PUBLISHED_CANNOT_BE_SET_DOWN"); assert.deepEqual(pub.offenders.map((o) => o.id), [Q2]);
  caseMembers.delete(Q2);
  w.select("q1", [Q1]);
  assert.equal(go(w, "q1", "deferred").ok, true);
  const again = go(w, "q1", "deferred");
  assert.equal(again.reason, "ILLEGAL_TRANSITION", "deferred -> deferred is not an edge"); assert.deepEqual(again.offenders.map((o) => o.id), [Q1]);
  /* CITED: a dismissal while a live leg rests on a member */
  w.inquiry("INQ-2026-0003-s", { legs: [{ target: Q2 }] });
  w.select("q2", [Q2]);
  const cited = go(w, "q2", "dismissed");
  assert.equal(cited.reason, "CITED"); assert.deepEqual(cited.offenders[0].citedBy.map((l) => l.bundle_id), ["INQ-2026-0003-s"]);
  assert.equal(w.record.head(Q2).bundleSha, before[1], "no refusal moved anything");
});

test("R21 R42 each member gains its history entry, prior and current state, reason and Session Log; a deferral answers the re-evaluation it raised", () => {
  const w = world(); w.inquiry(Q1); w.inquiry(Q2); w.listen();
  w.select("h", [Q1, Q2]);
  const r = go(w, "h", "deferred", "waiting on the budget");
  assert.equal(r.ok, true); assert.deepEqual(r.disposed, [Q1, Q2]); assert.equal(r.weight, "refuse");
  for (const id of [Q1, Q2]) {
    const fm = w.fm(id); const text = w.text(id);
    assert.equal(fm.current_state, "deferred"); assert.equal(fm.prior_state, "open");
    assert.equal(fm.disposition_reason, "waiting on the budget");
    const h = fm.state_history.at(-1);
    assert.deepEqual([h.from_state, h.to_state, h.blurb, h.author], ["open", "deferred", "waiting on the budget", V("alice")]);
    assert.match(text, /### Session .* \| Deferred \| member:alice\nTrigger: selection h\nChanges: state open to deferred\. Reason: waiting on the budget\./);
  }
  assert.equal(r.reevaluation.source, "deferred"); assert.ok(r.reevaluation.since);
  assert.deepEqual(w.raisedCalls.map((c) => [c.target, c.cause, c.since]), [[Q1, "deferred", r.reevaluation.since], [Q2, "deferred", r.reevaluation.since]]);
  assert.deepEqual(r.reevaluation.raised.map((d) => d.target), [Q1, Q2]);
  /* with no module registered to raise it, the act answers without the field and says so */
  const w2 = world(); w2.inquiry(Q1); w2.select("h", [Q1]);
  const r2 = go(w2, "h", "deferred");
  assert.equal(r2.reevaluation, undefined); assert.match(r2.reevaluation_absent, /no module/);
  /* R42: one registration per module set, a malformed one refused */
  assert.equal(w.k.onRaised("other", () => []).reason, "LISTENER_DECLARED");
  assert.equal(w2.k.onRaised("", () => []).reason, "LISTENER_MALFORMED");
  /* a dismissal raises none */
  w2.inquiry(Q2); w2.select("d", [Q2]);
  const d = go(w2, "d", "dismissed");
  assert.equal(d.ok, true); assert.equal(d.reevaluation, undefined); assert.equal(d.reevaluation_absent, undefined);
});

test("R22 the whole set moves or none of it does: a refusal after the first member rolls back every member already moved", () => {
  const w = world(); w.inquiry(Q1); w.inquiry(Q2);
  /* Q2's state_history is in a shape the splice cannot extend: its promotion is refused after Q1's */
  const text = w.text(Q2).replace("state_history: []", 'state_history: "odd"');
  assert.equal(w.promote(Q2, text).ok, true);
  const before = [w.record.head(Q1).bundleSha, w.record.head(Q2).bundleSha];
  w.select("h", [Q1, Q2]);
  const r = go(w, "h", "deferred");
  assert.equal(r.ok, false); assert.equal(r.reason, "UNSPLICEABLE_STATE_HISTORY"); assert.equal(r.bundleId, Q2);
  assert.equal(r.disposedSoFar, undefined, "no partial answer");
  assert.deepEqual([w.record.head(Q1).bundleSha, w.record.head(Q2).bundleSha], before, "Q1 was rolled back with the set");
  assert.equal(w.fm(Q1).current_state, "open");
});

test("R39 R35 a question more than one project draws on is not moved; the refusal names no project the viewer may not see", () => {
  const caseMembers = new Set();
  const w = world({ caseMembers }); w.member("alice"); w.member("bob");
  w.inquiry(Q1); w.inquiry(Q2);
  const P1 = w.project("Budget", "alice", [Q1, Q2]);
  const P2 = w.project("Audit", "bob", [Q1]);
  w.project("Severed", "bob", [{ target: Q2, status: "severed" }]);
  assert.deepEqual(w.k.projectsDrawingOn(Q1), [P1, P2].sort());
  assert.deepEqual(w.k.projectsDrawingOn(Q2), [P1], "a severed citation does not draw");
  w.select("h", [Q1, Q2]);
  const r = w.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: V("alice"), owner: "o", author: V("alice") });
  assert.equal(r.reason, "DRAWN_ON_BY_SEVERAL_PROJECTS"); assert.equal(r.check, "C-106.1"); assert.ok(r.translation);
  assert.deepEqual(r.offenders.map((o) => o.id), [Q1]);
  assert.deepEqual(r.offenders[0].projects, [P1], "Audit is bob's alone: alice may not see it, so it is not named");
  assert.equal(r.offenders[0].others_out_of_view, true);
  assert.equal(w.fm(Q1).current_state, "open"); assert.equal(w.fm(Q2).current_state, "open");
  w.select("one", [Q2]);
  assert.equal(go(w, "one", "deferred").ok, true, "a question one project draws on moves as R20–R21 say");
  /* R35: a published case member cannot be set down */
  caseMembers.add(Q2);
  w.select("pub", [Q2]);
  assert.equal(go(w, "pub", "dismissed").reason, "PUBLISHED_CANNOT_BE_SET_DOWN");
});

test("R21 the history entry records the stamped author as it is", () => {
  const w = world(); w.inquiry(Q1); w.select("h", [Q1]);
  const r = w.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: "admin", owner: "o", author: MACHINE });
  assert.equal(r.ok, true);
  assert.equal(w.fm(Q1).state_history.at(-1).author, MACHINE);
});
