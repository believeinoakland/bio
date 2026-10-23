/* reevaluation, G89 (fix round 7), R41 (amends R14): an open notice's grade follows the sweep's newest reading of the newer
   copy it waits on. A notice raised while its copy was filed but not yet read says undetermined; once the copy is read the
   next tick gives it the grade content now answers, in the same tick, while it stays one notice, still open. A notice a
   member settled keeps the grade it was settled with. Every test drives the real modules through reevaluation's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, U } from "./fixture.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", OTHER = "INFO-2026-0003-other", Q = "INQ-2026-0001-q";
const NOW = Date.parse("2026-09-28T02:00:00Z");
const ADMIN = "class:admin", ALICE = "member:alice";

/** A question resting on page 2 of an older capture; the newer capture `b` of the same address is filed, received and NOT
 *  yet read, and the sweep has raised its notice (undetermined). */
function raisedUnread() {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }] });
  w.r.noticeSweep(NOW);
  w.doc(NEW, [b]);
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const first = w.r.noticeSweep(NOW + 1);
  assert.deepEqual(first.raised.map((n) => [n.newer_capture, n.grade, n.affects]), [[b.sha, "UNDETERMINED", "undetermined"]]);
  const [n] = w.r.notices({ viewer: ADMIN }).notices;
  assert.equal(n.affects, "undetermined");
  return { w, a, b, n };
}

const only = (w, state = "open") => {
  const l = w.r.notices({ viewer: ADMIN, state }).notices;
  assert.equal(l.length, 1, `one ${state} notice`);
  return l[0];
};

test("R41 R14 (G89): the copy is read after the raise, the next tick re-grades the open notice through notices(): affected, the same notice, still open, no second one", () => {
  const { w, b, n } = raisedUnread();
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  const tick = w.r.raiseNotices();
  assert.equal(tick.count, 0, "nothing is raised a second time");
  assert.deepEqual(tick.regraded.map((x) => [x.notice, x.affects_before, x.affects]), [[n.notice, "undetermined", "affected"]]);
  const now = only(w);
  assert.equal(now.notice, n.notice, "the same notice");
  assert.equal(now.state, "open");
  assert.equal(now.affects, "affected");
  assert.notEqual(now.grade, "UNDETERMINED");
  assert.equal(now.grade, w.r.versionNotice({ target: Q, viewer: ADMIN }).notices[0].candidates[0].grade, "as the pull read answers");
  assert.equal(w.count("reevaluation_notices"), 1);
  const again = w.r.raiseNotices();
  assert.deepEqual([again.count, again.regraded.length], [0, 0], "a reading already followed writes nothing");
  assert.equal(only(w).notice, n.notice);
});

test("R41 R25 (G89): the tick that runs the sweep (noticeSweep) re-grades in the same tick it reads the copy again", () => {
  const { w, b, n } = raisedUnread();
  assert.equal(w.r.noticeSweepDue(NOW + 2), null, "the pass is complete");
  assert.equal(w.r.noticeSweepDue(NOW + 2), null, "the copy is still unread: nothing is owed, nothing is polled");
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  /* the reading is neither a receipt nor a filing; the sweep is pending because the open notice now reads otherwise */
  assert.equal(w.r.noticeSweepDue(NOW + 3), NOW + 3);
  assert.equal(w.r.noticeSweepWake(NOW + 3), NOW + 3 + 1000);
  const tick = w.r.noticeSweep(NOW + 3);
  assert.deepEqual([tick.count, tick.chain_unread], [0, 0]);
  assert.equal(only(w).affects, "affected");
  assert.equal(only(w).notice, n.notice);
  assert.equal(w.r.noticeSweepDue(NOW + 4), null, "re-graded: the sweep rests");
});

test("R41 (G89): a reading that finds the passage unchanged re-grades the open notice to unaffected and leaves it open: only a member's act closes it", () => {
  const { w, b, n } = raisedUnread();
  w.read(b.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  const tick = w.r.raiseNotices();
  assert.deepEqual(tick.regraded.map((x) => [x.affects_before, x.affects]), [["undetermined", "unaffected"]]);
  const now = only(w);
  assert.equal(now.notice, n.notice);
  assert.equal(now.affects, "unaffected");
  assert.equal(now.state, "open");
  assert.equal(w.r.keepVersion({ notice: n.notice, author: ALICE, viewer: ADMIN }).ok, true, "and a member can still close it");
});

test("R41 (G89): control: the copy still unread at the next tick leaves the notice exactly as it was", () => {
  const { w, n } = raisedUnread();
  const before = w.rows(`SELECT * FROM reevaluation_notices`);
  const tick = w.r.raiseNotices();
  assert.deepEqual([tick.count, tick.regraded.length], [0, 0]);
  assert.deepEqual(w.rows(`SELECT * FROM reevaluation_notices`), before);
  assert.equal(only(w).notice, n.notice);
});

test("R41 (G89): control: a notice a member kept before the reading keeps the grade it was settled with", () => {
  const { w, b, n } = raisedUnread();
  assert.equal(w.r.keepVersion({ notice: n.notice, author: ALICE, viewer: ADMIN }).ok, true);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  const tick = w.r.raiseNotices();
  assert.deepEqual([tick.count, tick.regraded.length], [0, 0], "no second notice, nothing re-graded");
  const kept = only(w, "kept");
  assert.equal(kept.affects, "undetermined");
  assert.equal(kept.grade, "UNDETERMINED");
  assert.equal(w.r.notices({ viewer: ADMIN }).notices.length, 0, "and none is open");
  assert.equal(w.count("reevaluation_notices"), 1);
});

test("R41 (G89): control: a notice raised affected is unchanged by later ticks, and one raised after the reading is raised with its grade", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }] });
  w.r.noticeSweep(NOW);
  w.doc(NEW, [b]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const raised = w.r.raiseNotices();
  assert.deepEqual(raised.raised.map((x) => x.affects), ["affected"]);
  const before = w.rows(`SELECT * FROM reevaluation_notices`);
  const tick = w.r.raiseNotices();
  assert.deepEqual([tick.count, tick.regraded.length], [0, 0]);
  assert.deepEqual(w.rows(`SELECT * FROM reevaluation_notices`), before);
});

test("R41 (G89): an unrelated unread copy of another cited page stays undetermined while this one is re-graded", () => {
  const { w, b } = raisedUnread();
  /* a second question on another page whose newer copy is filed and unread */
  const c = w.cap("c", "other old"), d = w.cap("d", "other new");
  const OTHER_Q = "INQ-2026-0002-other";
  w.doc(OTHER, [c]);
  w.read(c.sha, [U(0, "x"), U(1, "unchanged line")]);
  w.at(c.sha, "ex.org/other", "2026-09-02T00:00:00Z");
  const cid2 = w.passage(OTHER, c.sha);
  w.inquiry(OTHER_Q, { legs: [{ target: OTHER, content_id: cid2 }] });
  w.r.raiseNotices();
  const OTHER2 = "INFO-2026-0004-other-new";
  w.doc(OTHER2, [d]);
  w.at(d.sha, "ex.org/other", "2026-09-21T00:00:00Z");
  w.r.raiseNotices();
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.r.raiseNotices();
  const byHolder = Object.fromEntries(w.r.notices({ viewer: ADMIN }).notices.map((x) => [x.holder, x.affects]));
  assert.deepEqual(byHolder, { [Q]: "affected", [OTHER_Q]: "undetermined" });
});
