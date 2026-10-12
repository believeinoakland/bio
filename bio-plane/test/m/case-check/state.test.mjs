/* case-check R2: caseCheckOf, one check's state computed at the read; its fence; its op. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, args, V, P, P2, F1, F2, NOW } from "./fixture.mjs";
import { caseCheckOps, noSuchCase, CASE_CHECK_CHECKS } from "../../../src/case-check/index.mjs";

const CASE = "CASE-2026-0001";
function held(w, targets = [F1, F2]) {
  const r = w.c.checkAndHold(args(targets));
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
}
function voidWith(a, why) {
  assert.deepEqual([a.ok, a.state, a.why, a.key, a.keys],
    [true, "void", why, `case.check.void.${why[0]}`, why.map((x) => `case.check.void.${x}`)], JSON.stringify(a));
}

test("R2: an untouched check reads held, with checked_at and by; it is found by the check, by the edition, and by the case's latest prepared edition alike", () => {
  const w = standard();
  const r = held(w);
  const want = { ok: true, check: r.check, case: CASE, edition: 1, checked_at: NOW, by: "ann", state: "held", key: "case.check.held" };
  assert.deepEqual(w.c.caseCheckOf({ case: CASE }), want);
  assert.deepEqual(w.c.caseCheckOf({ case: CASE, edition: 1 }), want);
  assert.deepEqual(w.c.caseCheckOf({ check: r.check }), want);
  assert.deepEqual(w.c.caseCheckOf({ case: CASE, check: r.check }), want);
});

test("R2: void document_replaced when the stored preparation of that case edition is no longer at doc_sha: a re-authored acknowledgement list (case-authoring R20) voids it, and so does a new preparation (control: held before)", () => {
  const w = standard();
  held(w);
  assert.equal(w.c.caseCheckOf({ case: CASE }).state, "held");
  w.reauthor(CASE, 1);
  voidWith(w.c.caseCheckOf({ case: CASE }), ["document_replaced"]);
  const w2 = standard();
  const r2 = held(w2);
  w2.caseAuthoring.publishCase(args([F1, F2]));
  const asked = w2.calls.sources.length;
  voidWith(w2.c.caseCheckOf({ check: r2.check }), ["document_replaced"]);
  assert.equal(w2.calls.sources.length, asked, "the lapse reads are not asked of a replaced text");
});

test("R2: void member_moved names each member whose current bundle_sha is not the one pinned (control: the other member, unmoved, is not named)", () => {
  const w = standard();
  const r = held(w);
  w.move(F2, "sha-new");
  const a = w.c.caseCheckOf({ case: CASE });
  voidWith(a, ["member_moved"]);
  assert.deepEqual(a.moved, [{ bundle_id: F2, pinned: r.members[1].version_sha, current: "sha-new" }]);
});

test("R2: void source_lapsed, accepted_work_lapsed and marks_lapsed, each when case-carriage answers a row over the checked text (R5, R4 read as the check's by, R13); several causes are each named, in R2's order", () => {
  const w = standard();
  held(w);
  w.cc.sources = [{ capture: "c1" }];
  voidWith(w.c.caseCheckOf({ case: CASE }), ["source_lapsed"]);
  const asked = w.calls.sources.at(-1);
  assert.match(asked.text, /case_id: CASE-2026-0001/, "the checked text itself");
  assert.equal(asked.at, NOW);
  w.cc.sources = [];
  w.cc.accepted = { withdrawn: [{ ref: "imported:x", edition: 1 }], undisclosed: [] };
  voidWith(w.c.caseCheckOf({ case: CASE }), ["accepted_work_lapsed"]);
  assert.equal(w.calls.accepted.at(-1).signer, "ann", "read as the check's by");
  assert.equal(w.calls.accepted.at(-1).fm.case_id, CASE);
  w.cc.accepted = null;
  w.cc.marks = [{ ref: "p", sha: "s", kind: "photo", why: "w" }];
  voidWith(w.c.caseCheckOf({ case: CASE }), ["marks_lapsed"]);
  w.cc.sources = [{ capture: "c1" }];
  w.cc.accepted = { withdrawn: [], undisclosed: [{ flag: "f" }] };
  w.move(F1);
  voidWith(w.c.caseCheckOf({ case: CASE }), ["member_moved", "source_lapsed", "accepted_work_lapsed", "marks_lapsed"]);
  w.cc.sources = []; w.cc.accepted = null; w.cc.marks = [];
  voidWith(w.c.caseCheckOf({ case: CASE }), ["member_moved"]);
});

test("R2: member_moved is latched: a member moved and moved back to the pinned sha (a reverted bundle.md) still reads moved, by its commit count (control: untouched, held)", () => {
  const w = standard();
  const r = held(w);
  assert.equal(w.c.caseCheckOf({ case: CASE }).state, "held");
  const pinned = r.members[0].version_sha;
  w.move(F1);
  w.move(F1, pinned);
  assert.equal(w.head(F1), pinned);
  const a = w.c.caseCheckOf({ case: CASE });
  voidWith(a, ["member_moved"]);
  assert.deepEqual(a.moved, [{ bundle_id: F1, pinned, current: pinned }]);
  w.st.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, F2);
  assert.deepEqual(w.c.caseCheckOf({ case: CASE }).moved.map((m) => [m.bundle_id, m.current]), [[F1, pinned], [F2, null]], "a member gone is moved");
});

test("R2: a void check stays void when its cause is undone (a preparation stored again is a new one; a finding's new version is a new sha): re-running R1 makes a new check, which reads held", () => {
  const w = standard();
  const r = held(w);
  w.reauthor(CASE, 1);
  w.move(F1);
  const fresh = held(w);
  assert.notEqual(fresh.check, r.check);
  voidWith(w.c.caseCheckOf({ check: r.check }), ["document_replaced", "member_moved"]);
  assert.equal(w.c.caseCheckOf({ case: CASE }).state, "held");
});

test("R2 (K2833; N907, T46): the three lapse causes are judged at the read until case-carriage answers over an interval: a lapse undone reads held again (the stated gap), while a replaced preparation or a moved member stays void (control)", () => {
  const w = standard();
  const r = held(w);
  w.cc.sources = [{ capture: "c" }];
  voidWith(w.c.caseCheckOf({ check: r.check }), ["source_lapsed"]);
  w.cc.sources = [];
  assert.equal(w.c.caseCheckOf({ check: r.check }).state, "held", "judged at the read");
  w.move(F1, "elsewhere"); w.move(F1, r.members[0].version_sha);
  voidWith(w.c.caseCheckOf({ check: r.check }), ["member_moved"]);
});

test("R2: undetermined when any read fails (each lapse read throwing or answering outside its shape, the checked text unreadable): it fails closed, never held, and never throws (control: the same check reads held)", () => {
  const boom = () => { throw new Error("unreadable"); };
  const cases = [["sources", boom], ["sources", "not a list"], ["accepted", boom], ["accepted", "yes"],
                 ["marks", boom], ["marks", null]];
  for (const [k, v] of cases) {
    const w = standard();
    const r = held(w);
    w.cc[k] = v;
    const a = w.c.caseCheckOf({ case: CASE });
    assert.deepEqual([a.ok, a.state, a.key, a.check, a.checked_at, a.by], [true, "undetermined", "case.check.undetermined", r.check, NOW, "ann"], `${k}`);
    w.cc[k] = k === "accepted" ? null : [];
    assert.equal(w.c.caseCheckOf({ case: CASE }).state, "held", `control ${k}`);
  }
  /* a read that fails before any check is found: undetermined, never thrown */
  const w = standard();
  held(w);
  w.st.db.exec(`DROP TABLE case_documents`);
  const a = w.c.caseCheckOf({ case: CASE });
  assert.deepEqual([a.ok, a.state, a.key], [true, "undetermined", "case.check.undetermined"]);
});

test("R2: published, with the edition, once that edition is ratified (publication R40's published_cases)", () => {
  const w = standard();
  const r = held(w);
  w.ratify(CASE, 1);
  const a = w.c.caseCheckOf({ case: CASE });
  assert.deepEqual([a.state, a.published_edition, a.check, a.checked_at, a.by, a.key], ["published", 1, r.check, NOW, "ann", null]);
  w.move(F1);
  assert.equal(w.c.caseCheckOf({ check: r.check }).state, "published", "a ratified edition answers published whatever moved");
});

test("R2: none when there is no check: a case prepared and never checked, an edition with none, a check not of that case; checked_at and by are not answered", () => {
  const w = standard();
  w.caseAuthoring.publishCase(args([F1]));
  assert.deepEqual(w.c.caseCheckOf({ case: CASE }), { ok: true, state: "none", case: CASE, edition: 1, check: null, key: null });
  const r = held(w);
  assert.equal(w.c.caseCheckOf({ case: CASE, edition: 2 }).state, "none");
  assert.equal(w.c.caseCheckOf({ case: "CASE-2026-0099", check: r.check }).state, "none");
  assert.equal(w.c.caseCheckOf({ check: "CHK-2026-0000" }).state, "none");
  assert.equal(w.c.caseCheckOf({ case: CASE }).state, "held", "control");
});

test("R2: with viewer it is fenced as publication R1 is: no standing in the case's project answers NO_SUCH_CASE (C-148.1), byte-identical to an absent case; a participant reads the state; without viewer it is read as the plane", () => {
  const w = standard();
  const r = held(w);
  const outsider = w.c.caseCheckOf({ case: CASE, viewer: V("out") });
  const quinn = w.c.caseCheckOf({ check: r.check, viewer: V("quinn") });
  const absent = w.c.caseCheckOf({ case: "CASE-2026-0404", viewer: V("ann") });
  const absentCheck = w.c.caseCheckOf({ check: "CHK-2026-0404", viewer: V("ann") });
  const nobody = w.c.caseCheckOf({ case: CASE, viewer: "" });
  for (const a of [outsider, quinn, absentCheck, nobody]) assert.equal(JSON.stringify(a), JSON.stringify(absent));
  assert.deepEqual([absent.ok, absent.reason, absent.code, absent.check, absent.translation],
                   [false, "NO_SUCH_CASE", "NO_SUCH_CASE", "C-148.1", CASE_CHECK_CHECKS.NO_SUCH_CASE.translation]);
  assert.deepEqual(absent, noSuchCase());
  assert.equal(w.c.caseCheckOf({ case: CASE, viewer: V("ed") }).state, "held", "control: a participant");
  assert.equal(w.c.caseCheckOf({ case: CASE, viewer: V("ann") }).state, "held");
  assert.equal(w.c.caseCheckOf({ case: CASE }).state, "held", "the plane");
  assert.ok(w.calls.standing.some((s) => s.doc.case_id === CASE && s.viewer === V("out")), "asked through hasCaseStanding");
  /* a check whose preparation is gone is fenced by the project it recorded, never opened */
  w.st.sql.exec(`DELETE FROM case_documents`);
  assert.equal(JSON.stringify(w.c.caseCheckOf({ check: r.check, viewer: V("out") })), JSON.stringify(absent));
  const kept = w.c.caseCheckOf({ check: r.check, viewer: V("ed") });
  assert.deepEqual([kept.state, kept.why], ["void", ["document_replaced"]]);
});

test("R2: it writes nothing, and op=casecheck reads its viewer from the query, a call with no stamp fenced as no one", () => {
  const w = standard();
  const r = held(w);
  w.cc.sources = [{ capture: "c" }];
  const before = w.snapshot();
  for (const viewer of [undefined, V("ann"), V("out")]) w.c.caseCheckOf({ case: CASE, viewer });
  w.cc.sources = () => { throw new Error("x"); };
  w.c.caseCheckOf({ case: CASE });
  assert.deepEqual(w.snapshot(), before);
  const op = (qs, body = {}) => caseCheckOps(w.c, new URL(`http://do/casecheck?${qs}`), body).casecheck();
  w.cc.sources = [];
  assert.equal(op(`case=${CASE}&viewer=${encodeURIComponent(V("ann"))}`).state, "held");
  assert.equal(op(`check=${r.check}&viewer=${encodeURIComponent(V("ann"))}`, { viewer: V("out") }).state, "held");
  assert.equal(op(`case=${CASE}&viewer=${encodeURIComponent(V("out"))}`, { viewer: V("ann") }).reason, "NO_SUCH_CASE");
  assert.equal(op(`case=${CASE}`).reason, "NO_SUCH_CASE", "no stamp: fenced, never the plane");
  assert.equal(op(`case=${CASE}&edition=1&viewer=${encodeURIComponent(V("ed"))}`).state, "held");
  void P; void P2;
});
