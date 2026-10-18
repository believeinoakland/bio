/* reevaluation R37 and R38 (T50; N1069, N1070; K3261, K3264) at the module's interface: `adoptVersion` writes the version
   it appends with `version.author` the adopting member, so `basis-versions` R49's accept arm reads it as a member's own,
   and it relays any refusal of `basis-versions.appendVersion` unchanged, `DIVIDED_CANNOT_RESTRUCTURE` among them, with
   the notice's id, leaving the notice open. Each uses the real `basis-versions` (a stand-in that cannot refuse proves
   nothing). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, U, MACHINE } from "./fixture.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new";
const Q = "INQ-2026-0001-q";
const ADMIN = "class:admin";
const WHY = "the newer version restates the same cut";

/** A question resting (leg 0) on page 2 of an older capture whose newer capture changed that page: one open notice. */
function setup() {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z");
  w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }, { target: NEW }] });
  const [n] = w.r.raiseNotices({}).raised;
  /* basis-versions' machine-passage read (its R49), counting what it is asked */
  const calls = [];
  assert.equal(w.basisVersions.onMachinePassage("test", (x) => { calls.push(JSON.parse(JSON.stringify(x))); return null; }).ok, true);
  return { w, n, calls };
}

test("R37: a member adopts a newer version; the question's version row answers her as author, and accepting it calls no machine-passage read", () => {
  const { w, n, calls } = setup();
  const r = w.r.adoptVersion({ notice: n.notice, why: WHY, author: "member:alice", viewer: ADMIN });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.equal(w.row(`SELECT author FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, Q, r.version).author, "member:alice",
    "the version names who adopted it");
  assert.equal(w.fm(Q).basis_versions.find((v) => v.name === r.version).author, "member:alice");
  /* every other field of the version row is as before: state, relationship, description, and the live basis */
  const v = w.fm(Q).basis_versions.find((x) => x.name === r.version);
  assert.deepEqual([v.state, v.relationship, v.hidden], ["suggested", "and", false]);
  calls.length = 0; /* the adoption's own promotion is a member's revision, asked over its legs (basis-versions R49); R37 is the accept */
  const acc = w.basisVersions.versionAccept({ target: Q, version: r.version, author: "member:alice", viewer: V("alice") });
  assert.equal(acc.ok, true, JSON.stringify(acc).slice(0, 400));
  assert.deepEqual(calls, [], "accepting a member's own version asks no onMachinePassage read");
  assert.equal(w.row(`SELECT state FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, Q, r.version).state, "accepted");
  assert.equal(w.r.notices({ state: "adopted", viewer: ADMIN }).notices[0].closed_by, "member:alice", "the notice's closing is unchanged");
});

test("R37 (control): a machine author is refused MACHINE_CANNOT_ADOPT_VERSION and no version is written", () => {
  const { w, n } = setup();
  const before = w.snapshot();
  const r = w.r.adoptVersion({ notice: n.notice, why: WHY, author: MACHINE, viewer: ADMIN });
  assert.deepEqual([r.ok, r.code], [false, "MACHINE_CANNOT_ADOPT_VERSION"]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.equal(w.rows(`SELECT 1 FROM inquiry_basis_versions WHERE bundle_id=?`, Q).length, 0);
});

test("R38: a notice on a leg of a divided question, adopted, is refused DIVIDED_CANNOT_RESTRUCTURE with notice, target and from divided; the question's document and versions are byte-identical and the notice stays open", () => {
  const { w, n } = setup();
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
  const before = w.snapshot();
  const textBefore = w.text(Q);
  const r = w.r.adoptVersion({ notice: n.notice, why: WHY, author: "member:alice", viewer: ADMIN });
  assert.deepEqual([r.ok, r.reason, r.code, r.notice, r.target, r.from],
    [false, "DIVIDED_CANNOT_RESTRUCTURE", "DIVIDED_CANNOT_RESTRUCTURE", n.notice, Q, "divided"]);
  /* relayed as basis-versions answers it, not re-coded: the same refusal the module gives the divided question itself */
  const direct = w.basisVersions.appendVersion({ target: Q, author: "member:alice", version: { name: "x", description: "a reading",
    relationship: "and", author: "member:alice" }, grounds: [], legs: [] });
  assert.deepEqual({ ...r, notice: undefined }, { ...direct, notice: undefined });
  assert.equal(w.text(Q), textBefore, "the question's document is byte-identical");
  assert.deepEqual(w.snapshot(), before, "no version, no closing: the whole store is as it was");
  assert.deepEqual(w.r.notices({ viewer: ADMIN }).notices.map((x) => [x.notice, x.state]), [[n.notice, "open"]], "a later read lists it");
});

test("R38 (control): the same adoption on an undivided question lands; keepVersion on the divided question's notice records", () => {
  {
    const { w, n } = setup();
    const r = w.r.adoptVersion({ notice: n.notice, why: WHY, author: "member:alice", viewer: ADMIN });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
    assert.equal(w.r.notices({ state: "adopted", viewer: ADMIN }).count, 1);
  }
  {
    const { w, n } = setup();
    w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
    const textBefore = w.text(Q);
    const k = w.r.keepVersion({ notice: n.notice, why: "the earlier wording is what we quoted", author: "member:alice", viewer: ADMIN });
    assert.deepEqual([k.ok, k.act], [true, "kept"], "keep writes no version, so a divided document does not stop it");
    assert.equal(w.text(Q), textBefore);
    assert.deepEqual(w.r.notices({ state: "kept", viewer: ADMIN }).notices.map((x) => x.notice), [n.notice]);
  }
});
