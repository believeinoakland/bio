/* reevaluation: the notice sweep's due, wake and tick (R25, N178), the notice read's withholding of a version the viewer
   may not see (R14, N200), the notice read's bound driven through its op (R14, N182 (3)), and adopt's refusal when the
   new version cannot be written (R15, N182 (4)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, U, projMd, provDoc } from "./fixture.mjs";
import { Reevaluation, reevaluationOps, REEVAL_NOTICE_DELAY_MS, NOTICE_SWEEP_DEFAULT, NOTICES_LIMIT_MAX,
         NOTICES_LIMIT_DEFAULT, REEVALUATION_ACT_CHECKS } from "../../../src/reevaluation/index.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q2";
const ADMIN = "class:admin";
const NOW = Date.parse("2026-09-28T02:00:00Z");

/** A question resting (leg 0) on page 2 of an older capture, a newer capture of the same address that rewrites it;
 *  with `legs: false`, the question rests only on another question, so no leg rests on a passage. */
function setup({ legs = true } = {}) {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  if (!legs) w.inquiry(Q2, {});
  w.inquiry(Q, { legs: legs ? [{ target: OLD, content_id: cid }] : [{ target: Q2 }] });
  return { w, a, b, cid };
}

/** A second instance over the same storage, as after the Durable Object is evicted, with its own bindings. */
const again = (w, env = null) => new Reevaluation({ storage: w.st, record: w.record, membership: w.membership,
  promotion: w.promotion, inquiry: w.k, content: w.content, provenance: w.prov, strength: w.strength,
  basisVersions: w.basisVersions, env });

test("R25: not pending with no passage leg and no pass: due and wake null, a tick runs nothing", () => {
  const { w } = setup({ legs: false });
  const before = w.snapshot();
  assert.deepEqual([w.r.noticeSweepDue(NOW), w.r.noticeSweepWake(NOW)], [null, null]);
  assert.deepEqual(w.r.noticeSweep(NOW), { pending: false });
  assert.deepEqual(w.snapshot(), before, "nothing ran and nothing was written");
});

test("R25: with no pass yet complete and a leg on a passage, pending: due is now, wake is now plus the delay; both write nothing", () => {
  const { w } = setup();
  const before = w.snapshot();
  assert.equal(w.r.noticeSweepDue(NOW), NOW);
  assert.equal(w.r.noticeSweepWake(NOW), NOW + REEVAL_NOTICE_DELAY_MS);
  assert.equal(REEVAL_NOTICE_DELAY_MS, 1000);
  assert.deepEqual(w.snapshot(), before, "due and wake write nothing");
  /* the instance binding, when it reads as a number >= 0 */
  for (const [raw, delay] of [["250", 250], [0, 0], ["0", 0], [40, 40], ["-1", 1000], ["soon", 1000], ["", 1000], [null, 1000]])
    assert.equal(again(w, { REEVAL_NOTICE_DELAY_MS: raw }).noticeSweepWake(NOW), NOW + delay, `binding ${JSON.stringify(raw)}`);
  assert.equal(again(w).noticeSweepWake(NOW), NOW + 1000, "no bindings");
});

test("R25: a tick runs one batch at the default limit and answers raiseNotices' answer; a null cursor completes the pass", () => {
  const { w, b } = setup();
  const r = w.r.noticeSweep(NOW);
  assert.deepEqual([r.ok, r.count, r.limit, r.truncated, r.cursor, r.raised[0].newer_capture],
    [true, 1, NOTICE_SWEEP_DEFAULT, false, null, b.sha]);
  assert.deepEqual([w.r.noticeSweepDue(NOW), w.r.noticeSweepWake(NOW)], [null, null], "the pass is complete");
  assert.deepEqual(w.r.noticeSweep(NOW), { pending: false });
  assert.deepEqual(again(w).noticeSweepDue(NOW), null, "the position is stored, so a new instance reads it");
});

test("R25: a receipt since the last complete pass began makes it pending again; the next pass raises the newer version", () => {
  const { w } = setup();
  w.r.noticeSweep(NOW);
  assert.equal(w.r.noticeSweepDue(NOW), null);
  const c = w.cap("c", "newest");
  w.doc("INFO-2026-0003-newest", [c]);
  w.read(c.sha, [U(0, "alpha"), U(1, "rewritten again")]);
  w.at(c.sha, "ex.org/doc", "2026-09-25T00:00:00Z");
  assert.equal(w.r.noticeSweepDue(NOW), NOW, "the receipt was counted");
  assert.equal(again(w).noticeSweepDue(NOW), NOW, "and the count is stored");
  const r = w.r.noticeSweep(NOW + 1);
  assert.deepEqual(r.raised.map((n) => [n.holder, n.newer_capture]), [[Q, c.sha]]);
  assert.equal(w.r.noticeSweepDue(NOW + 1), null);
});

test("R25: a pass part-way stays pending and resumes where it stands, across instances; a receipt during it keeps the sweep pending after it", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  const units = Array.from({ length: 5 }, (_, i) => U(i, `page ${i} of the old`));
  w.read(a.sha, units, { pageCount: 5 });
  w.read(b.sha, units.map((u, i) => U(i, `page ${i} rewritten`)), { pageCount: 5 });
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cids = units.map((_, i) => w.passage(OLD, a.sha, { kind: "pdf-page", page: i }));
  /* more legs than one batch reads: holders of NOTICE_SWEEP_DEFAULT + 1 legs in all */
  const per = cids.length, holders = Math.ceil((NOTICE_SWEEP_DEFAULT + 1) / per);
  for (let h = 0; h < holders; h++)
    w.inquiry(`INQ-2026-${String(h + 1).padStart(4, "0")}-h`, { legs: cids.map((cid) => ({ target: OLD, content_id: cid })) });
  const total = holders * per;
  const first = w.r.noticeSweep(NOW);
  assert.deepEqual([first.count, first.truncated, typeof first.cursor], [NOTICE_SWEEP_DEFAULT, true, "string"]);
  assert.equal(w.r.noticeSweepDue(NOW), NOW, "part-way is pending");
  /* a receipt while the pass is part-way */
  const c = w.cap("c", "unrelated");
  w.doc("INFO-2026-0009-other", [c]);
  w.at(c.sha, "ex.org/other", "2026-09-26T00:00:00Z");
  const second = again(w).noticeSweep(NOW + 1);
  assert.deepEqual([second.count, second.truncated, second.cursor], [total - NOTICE_SWEEP_DEFAULT, false, null],
    "resumed after the cursor, by a new instance");
  assert.equal(w.count("reevaluation_notices"), total, "each leg raised once across the two batches");
  assert.equal(w.r.noticeSweepDue(NOW + 1), NOW + 1, "the receipt came after this pass began: pending again");
  const third = w.r.noticeSweep(NOW + 2);
  assert.equal(third.count, 0, "a notice once raised is not raised again");
  assert.equal(third.truncated, true, "a new pass from the start");
});

test("R25: due and wake never throw", () => {
  const broken = new Reevaluation({ storage: { sql: { exec() { throw new Error("storage gone"); } } }, record: {},
    membership: {}, promotion: {} });
  assert.deepEqual([broken.noticeSweepDue(NOW), broken.noticeSweepWake(NOW)], [null, null]);
});

test("R14 (N200): a notice served to a viewer who does not see the newer capture's project answers newer_capture, grade and affects as absent", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]);
  /* the newer capture is filed in a project ann was not invited to */
  const P = w.promotion.promote({ base: null, snapKey: "kp", author: "member:owen", ownerMemberId: "owen",
    files: [{ path: "bundle.md", text: projMd("Closed work", []) }, { path: b.path, text: b.text },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(b)] }) }],
    meta: { object_type: "project" },
    register: [{ sha256: b.sha, path: b.path, encoding: "utf8", bytes: Buffer.byteLength(b.text) }] });
  assert.equal(P.ok, true, JSON.stringify(P).slice(0, 400));
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }] });
  w.member("ann"); w.member("owen");
  const raised = w.r.raiseNotices({});
  assert.equal(raised.count, 1, "the sweep reads the record as it holds it");
  const full = w.r.notices({ viewer: ADMIN }).notices[0];
  assert.deepEqual([full.newer_capture, full.grade, full.affects, full.newer_bundle], [b.sha, "NOT_FOUND", "affected", P.bundleId]);
  const ann = w.r.notices({ viewer: V("ann") });
  assert.equal(ann.count, 1, "the holder is seen, so the notice is listed");
  const [n] = ann.notices;
  assert.deepEqual([n.notice, n.holder, n.capture_sha, n.newer_capture, n.grade, n.affects, n.newer_bundle],
    [full.notice, Q, a.sha, null, null, null, null]);
  /* the pull read withholds the same version from the same viewer */
  assert.equal(w.r.versionNotice({ content: cid, viewer: V("ann") }).notices[0].candidates.some((c) => c.capture_sha === b.sha), false);
  /* a participant of the project sees it */
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated)
                 VALUES (?, ?, 'active', 't', 't')`, P.bundleId, "ann");
  const seen = w.r.notices({ viewer: V("ann") }).notices[0];
  assert.deepEqual([seen.newer_capture, seen.grade, seen.affects, seen.newer_bundle], [b.sha, "NOT_FOUND", "affected", P.bundleId]);
});

test("R14 (N182 (3)): op=reevaluationnotices clamps its limit to 1–1,000 (default 200) and pages with truncated and a cursor", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }] });
  w.inquiry(Q2, { legs: [{ target: OLD, content_id: cid }] });
  assert.equal(w.r.raiseNotices({}).count, 2);
  const op = (qs) => reevaluationOps(w.r, new URL(`https://plane/?viewer=${ADMIN}&${qs}`), null).reevaluationnotices();
  for (const [qs, limit] of [["", NOTICES_LIMIT_DEFAULT], ["limit=50000", NOTICES_LIMIT_MAX], ["limit=-3", 1],
                             ["limit=junk", NOTICES_LIMIT_DEFAULT], ["limit=7", 7]]) {
    const r = op(qs);
    assert.deepEqual([r.ok, r.limit, r.count, r.truncated, r.cursor], [true, limit, Math.min(2, limit), limit < 2,
      limit < 2 ? r.notices[0].notice : null], `limit from '${qs}'`);
  }
  assert.equal(NOTICES_LIMIT_MAX, 1000);
  const p1 = op("limit=1");
  const p2 = op(`limit=1&after=${p1.cursor}`);
  assert.deepEqual([p2.count, p2.truncated, p2.cursor], [1, false, null]);
  assert.notEqual(p2.notices[0].notice, p1.notices[0].notice, "the cursor pages on");
});

test("R15 (N182 (4)): when the new version cannot be written, adopt is refused, the notice stays open and nothing is written", () => {
  const { w } = setup();
  const [n] = w.r.raiseNotices({}).raised;
  const append = w.basisVersions.appendVersion;
  try {
    w.basisVersions.appendVersion = () => ({ ok: false, reason: "VERSION_REFUSED_HERE", detail: "basis-versions said no" });
    const before = w.snapshot();
    const r = w.r.adoptVersion({ notice: n.notice, author: "alice", viewer: ADMIN });
    assert.deepEqual([r.ok, r.reason, r.notice], [false, "VERSION_REFUSED_HERE", n.notice], "basis-versions' refusal, as it came");
    assert.deepEqual(w.snapshot(), before);
    w.basisVersions.appendVersion = () => null;
    const none = w.r.adoptVersion({ notice: n.notice, author: "alice", viewer: ADMIN });
    assert.deepEqual([none.ok, none.code, none.check, none.translation, none.notice], [false, "VERSION_ADOPT_UNWRITABLE",
      "C-110.9", REEVALUATION_ACT_CHECKS.VERSION_ADOPT_UNWRITABLE.translation, n.notice]);
    assert.deepEqual(w.snapshot(), before);
  } finally { w.basisVersions.appendVersion = append; }
  assert.equal(w.r.notices({ viewer: ADMIN }).notices[0].state, "open");
});
