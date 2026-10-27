/* reevaluation, G66 (fix round 7, C69): a newer capture of a cited page raises its notice however the capture's arrival
   is ordered against the sweep. A receipt is written when the capture arrives (acquire); the capture joins the page's
   version chain only when a document holding it is filed (provenance R17: a receipt AND a register row), and filing is
   not a receipt. A sweep that runs between the two completes with nothing newer, so R25's pending must also follow the
   chain's growth, not receipts alone. Every test drives the real modules through reevaluation's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, U } from "./fixture.mjs";
import { Reevaluation } from "../../../src/reevaluation/index.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", OTHER = "INFO-2026-0003-other", Q = "INQ-2026-0001-q";
const NOW = Date.parse("2026-09-28T02:00:00Z");

/** A question resting on page 2 of an older capture whose sweep pass is complete; the newer capture `b` of the same
 *  address is not held yet. */
function cited() {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }] });
  const first = w.r.noticeSweep(NOW);
  assert.deepEqual([first.examined, first.count], [1, 0], "nothing newer is held");
  assert.equal(w.r.noticeSweepDue(NOW), null, "the pass is complete");
  return { w, a, b, cid };
}

const again = (w) => new Reevaluation({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
  inquiry: w.k, content: w.content, provenance: w.prov, strength: w.strength, basisVersions: w.basisVersions });

test("R25 R14 (G66, C69): the capture arrives, the sweep runs, and only then is the page filed: the filing makes the sweep pending and the next tick raises the notice", () => {
  const { w, b } = cited();
  /* the capture arrives (the receipt), the sweep ticks before the press files it */
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  assert.equal(w.r.noticeSweepDue(NOW + 1), NOW + 1, "the receipt was counted");
  const early = w.r.noticeSweep(NOW + 1);
  assert.deepEqual([early.examined, early.chain_unread, early.count], [1, 0, 0], "the chain does not hold the new copy yet");
  assert.equal(w.r.noticeSweepDue(NOW + 2), null, "the pass is complete and no receipt has come since");
  /* the press files the page and its text is read */
  w.doc(NEW, [b]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  assert.equal(w.r.noticeSweepDue(NOW + 3), NOW + 3, "a version joined the chain since the last complete pass began");
  assert.equal(w.r.noticeSweepWake(NOW + 3), NOW + 3 + 1000);
  assert.equal(again(w).noticeSweepDue(NOW + 3), NOW + 3, "and that is stored, so a restarted object reads it");
  const late = w.r.noticeSweep(NOW + 3);
  assert.deepEqual(late.raised.map((n) => [n.holder, n.newer_capture, n.affects]), [[Q, b.sha, "affected"]]);
  assert.equal(w.r.noticeSweepDue(NOW + 4), null, "the pass completes and the sweep rests");
  assert.equal(w.r.notices({ viewer: "class:admin" }).notices.length, 1);
});

test("R25 (G66): a filing in the very second the last pass began still makes the sweep pending: the mark is an integer, never an instant", () => {
  const { w, b } = cited();
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const t = w.r.noticeSweep(NOW + 1);
  assert.equal(t.cursor, null);
  w.doc(NEW, [b]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  assert.equal(w.r.noticeSweepDue(NOW + 1), NOW + 1, "same second as the pass began: still pending");
});

test("R25 (G66): the control: a filing that adds no version to a cited address makes one more pass and raises nothing; then the sweep rests", () => {
  const { w } = cited();
  const c = w.cap("c", "unrelated");
  w.doc(OTHER, [c]);
  assert.equal(w.r.noticeSweepDue(NOW + 1), NOW + 1, "a filing is read as a possible new version");
  const r = w.r.noticeSweep(NOW + 1);
  assert.deepEqual([r.examined, r.count], [1, 0]);
  assert.equal(w.r.noticeSweepDue(NOW + 2), null, "no further filing: the sweep rests");
  assert.deepEqual(w.r.noticeSweep(NOW + 2), { pending: false });
});

test("R14 (G66): a newer copy filed but not yet read raises its notice at once as undetermined, so a reading still owed is never waited for", () => {
  const { w, b } = cited();
  w.doc(NEW, [b]);
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");   /* no reading of b: extraction holds no text of it */
  const r = w.r.noticeSweep(NOW + 1);
  assert.deepEqual(r.raised.map((n) => [n.newer_capture, n.grade, n.affects]), [[b.sha, "UNDETERMINED", "undetermined"]]);
  assert.equal(w.r.noticeSweepDue(NOW + 2), null);
});

test("R25 (G66): an old sweep row from before the filing mark is read as one pass owed, then rests", () => {
  const { w } = cited();
  /* a store written before the mark existed: the mark columns hold nothing */
  w.st.sql.exec(`UPDATE reevaluation_sweep SET complete_mark = NULL, pass_mark = NULL WHERE id = 1`);
  assert.equal(w.r.noticeSweepDue(NOW + 1), NOW + 1, "the first sweep after the deploy reconsiders every leg");
  w.r.noticeSweep(NOW + 1);
  assert.equal(w.r.noticeSweepDue(NOW + 2), null);
});
