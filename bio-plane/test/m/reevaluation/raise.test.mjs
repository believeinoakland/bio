/* reevaluation: what an act that moves a target raises (R7), through the registrations inquiry and promotion offer and
   publication's direct call; the listeners later modules register (R8); and the recovery read (R9). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, U } from "./fixture.mjs";
import { CHANGES_OF_MAX } from "../../../src/reevaluation/index.mjs";

const DOC = "INFO-2026-0001-doc", DOC2 = "INFO-2026-0002-doc";
const T = "INQ-2026-0001-target", DEP = "INQ-2026-0002-dep", DEP2 = "INQ-2026-0003-dep2";
const C1 = "INQ-2026-0004-child", C2 = "INQ-2026-0005-sib";
const ADMIN = "class:admin";

function base(opts = {}) {
  const w = world(opts);
  w.doc(DOC); w.doc(DOC2);
  w.inquiry(T, { legs: [{ target: DOC }, { target: DOC2 }] });
  w.inquiry(DEP, { legs: [{ target: T }] });
  return w;
}

test("R7: a deferral raises through inquiry's registration: the live legs resting on the target, ids and ords, no titles", () => {
  const w = base();
  w.selections.set("h", [T]);
  const d = w.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: ADMIN, owner: "o", author: V("alice") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.equal(d.reevaluation.source, "deferred");
  assert.deepEqual(d.reevaluation.raised, [{ bundle_id: DEP, ord: 0, role: "supports", state: "open", target: T }]);
  assert.ok(!JSON.stringify(d.reevaluation).includes("title"), "no titles");
  /* the module's own call, as publication's edition act makes it */
  const e = w.r.raise({ target: T, source: "edition", since: "2026-09-28T00:00:00Z", edition: 2, viewer: ADMIN });
  assert.deepEqual(e, { source: "edition", since: "2026-09-28T00:00:00Z", edition: 2,
                        raised: [{ bundle_id: DEP, ord: 0, role: "supports", state: "open" }] });
  /* a dependent the viewer may not see is withheld, not counted */
  const nobody = w.r.raise({ target: T, source: "edition", since: "x", viewer: "nobody" });
  assert.deepEqual([nobody.raised, nobody.out_of_view], [[], true], "R20: out_of_view states only that one was");
  /* a second registration by this module is refused by inquiry and promotion */
  assert.equal(w.k.onRaised("reevaluation", () => []).reason, "LISTENER_DECLARED");
  assert.equal(w.promotion.onReopened("reevaluation", () => null).reason, "LISTENER_DECLARED");
});

test("R7: a division raises supersession on the frozen dependents; a reopening raises through promotion's registration", () => {
  const w = base({ caseMembers: new Set([DEP]) });
  const d = w.k.divide({ target: T, reason: "two questions", viewer: "admin", author: V("alice"),
    children: [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }] });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.deepEqual([d.reevaluation.source, d.reevaluation.raised.map((l) => l.bundle_id)], ["supersession", [DEP]]);
  /* reopen: promotion calls the listener after the act commits, its answer under this module's id */
  const w2 = world();
  w2.inquiry(T, { state: "deferred", disposition: '"set down"' });
  w2.inquiry(DEP, { legs: [{ target: T }] });
  const r = w2.promotion.reopen({ target: T, reason: "picked up", viewer: ADMIN, author: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.reevaluation.source, r.reevaluation.since, r.reevaluation.raised.map((l) => l.bundle_id)],
    ["reopened", r.at, [DEP]]);
});

test("R8: a listener registered once is told of every raise after the act commits; one that throws never undoes the act and is named", () => {
  const w = base();
  const heard = [];
  assert.deepEqual(w.r.onBasisChanged("conformance", (e) => heard.push(e)), { ok: true, module: "conformance" });
  assert.equal(w.r.onBasisChanged("conformance", () => {}).reason, "LISTENER_DECLARED");
  assert.equal(w.r.onBasisChanged("", () => {}).reason, "LISTENER_MALFORMED");
  assert.equal(w.r.onBasisChanged("x", null).reason, "LISTENER_MALFORMED");
  const a = w.r.raise({ target: T, source: "edition", since: "2026-09-28T00:00:00Z", edition: 2, viewer: ADMIN });
  assert.deepEqual(heard.map((e) => [e.kind, e.subject, e.source, e.since, e.edition, e.dependents]),
    [["finding", T, "edition", "2026-09-28T00:00:00Z", 2, a.raised]]);
  assert.equal(typeof heard[0].detail, "string");
  assert.equal(a.listeners_failed, undefined);
  assert.equal(w.r.onBasisChanged("consequences", () => { throw new Error("boom"); }).ok, true);
  w.r.onBasisChanged("late", () => Promise.reject(new Error("later")));
  /* through a real act: the reopening lands, the reply names the failing listener */
  const w2 = world();
  w2.inquiry(T, { state: "deferred", disposition: '"set down"' });
  w2.inquiry(DEP, { legs: [{ target: T }] });
  w2.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  const r = w2.promotion.reopen({ target: T, reason: "picked up", viewer: ADMIN, author: V("alice") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.reevaluation.listeners_failed, ["consequences"]);
  assert.equal(w2.record.head(T).currentState, "open", "the act stands");
  const b = w.r.raise({ target: T, source: "edition", since: "s", viewer: ADMIN });
  assert.deepEqual(b.listeners_failed, ["consequences"]);
  assert.equal(heard.length, 2);
});

test("R9: changesOf answers now the causes standing on each finding and each passage's affects; unseen is absent; it writes nothing", () => {
  const w = base();
  w.promote(T, inquiryMd(T, { legs: [{ target: DOC }, { target: DOC2 }], state: "deferred", disposition: '"x"' }));
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc("INFO-2026-0003-v1", [a]); w.doc("INFO-2026-0004-v2", [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely now")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage("INFO-2026-0003-v1", a.sha);
  const before = w.snapshot();
  const r = w.r.changesOf({ findings: [T, DEP, "INQ-2026-0099-none"], contents: [cid, "9".repeat(64)], viewer: ADMIN });
  assert.deepEqual(w.snapshot(), before, "a read");
  assert.deepEqual(r.findings.map((f) => [f.id, (f.causes || []).map((c) => c.source), !!f.absent]),
    [[T, ["deferred"], false], [DEP, [], false], ["INQ-2026-0099-none", [], true]]);
  assert.deepEqual([r.contents[0].id, r.contents[0].state, r.contents[0].affects, r.contents[0].candidates[0].grade],
    [cid, "newer_capture_matched", "affected", "NOT_FOUND"]);
  assert.deepEqual(r.contents[1], { id: "9".repeat(64), absent: true });
  const unseen = w.r.changesOf({ findings: [T], contents: [cid], viewer: "nobody" });
  assert.deepEqual([unseen.findings[0], unseen.contents[0]], [{ id: T, absent: true }, { id: cid, absent: true }],
    "unseen answers as absent");
  const many = w.r.changesOf({ findings: Array.from({ length: CHANGES_OF_MAX + 1 }, (_, i) => `INQ-2026-${i}`), viewer: ADMIN });
  assert.deepEqual([many.findings.length, many.findings_truncated], [CHANGES_OF_MAX, true]);
  assert.deepEqual(w.r.changesOf({ findings: `${T},${DEP}`, viewer: ADMIN }).findings.map((f) => f.id), [T, DEP]);
});

test("R7 R8 (N292): the onRaised registration answers raise's answer whole, so listeners_failed reaches dispose's, divide's and a re-read's reply", () => {
  const boom = () => { throw new Error("boom"); };
  /* a deferral */
  {
    const w = base();
    w.r.onBasisChanged("consequences", boom);
    w.selections.set("h", [T]);
    const d = w.k.dispose({ handle: "h", to: "deferred", reason: "later", viewer: ADMIN, owner: "o", author: V("alice") });
    assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
    assert.deepEqual([d.reevaluation.source, d.reevaluation.raised.map((l) => l.bundle_id), d.reevaluation.listeners_failed],
      ["deferred", [DEP], ["consequences"]]);
    assert.equal(w.record.head(T).currentState, "deferred", "the act stands");
  }
  /* a division */
  {
    const w = base({ caseMembers: new Set([DEP]) });
    w.r.onBasisChanged("consequences", boom);
    const d = w.k.divide({ target: T, reason: "two questions", viewer: "admin", author: V("alice"),
      children: [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }] });
    assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
    assert.deepEqual([d.reevaluation.source, d.reevaluation.listeners_failed], ["supersession", ["consequences"]]);
  }
  /* a re-read that stales a cited passage (inquiry R41) */
  {
    const w = world();
    const a = w.cap("a", "old");
    w.doc(DOC, [a]);
    w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
    const cid = w.passage(DOC, a.sha);
    w.inquiry(DEP, { legs: [{ target: DOC, content_id: cid }] });
    w.r.onBasisChanged("consequences", boom);
    const s = w.k.staled({ capture_sha: a.sha, rows: [{ content_id: cid }] });
    assert.deepEqual([s.reevaluation.source, s.reevaluation.listeners_failed], ["restaled", ["consequences"]]);
    /* with every listener well, no listeners_failed is carried */
    const w2 = world();
    w2.doc(DOC, [a]);
    w2.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
    const cid2 = w2.passage(DOC, a.sha);
    w2.inquiry(DEP, { legs: [{ target: DOC, content_id: cid2 }] });
    w2.r.onBasisChanged("conformance", () => null);
    const s2 = w2.k.staled({ capture_sha: a.sha, rows: [{ content_id: cid2 }] });
    assert.equal(s2.reevaluation.source, "restaled");
    assert.equal(s2.reevaluation.listeners_failed, undefined);
  }
});

test("R8 (K231): onBasisChanged's refusals are membership's one site (listenerRefusal, its R81)", async () => {
  const { listenerRefusal } = await import("../../../src/membership/index.mjs");
  const w = base();
  assert.deepEqual(w.r.onBasisChanged("", () => {}), listenerRefusal([], "", () => {}));
  assert.equal(w.r.onBasisChanged("conformance", () => {}).ok, true);
  assert.deepEqual(w.r.onBasisChanged("conformance", () => {}), listenerRefusal([{ module: "conformance" }], "conformance", () => {}));
});

test("R7 R8 (N406): inside a committing transaction raise answers raised at once, and the listeners are told just after the outermost commit, listeners_failed written onto the answer it returned", () => {
  const w = base();
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e.subject));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  let a = null, inside = null;
  const out = w.record.transact(() => {
    w.record.transact(() => {
      a = w.r.raise({ target: T, source: "edition", since: "2026-09-28T00:00:00Z", edition: 2, viewer: ADMIN });
      return null;
    });
    inside = { raised: a.raised.map((l) => l.bundle_id), heard: heard.length, failed: a.listeners_failed };
    return { ok: true };
  });
  assert.deepEqual(out, { ok: true }, "a failing listener changes nothing transact answers");
  assert.deepEqual(inside, { raised: [DEP], heard: 0, failed: undefined },
    "raised at once; nobody told while the outer transaction is open, not even after the savepoint commits");
  assert.deepEqual(heard, [T], "told once, after the outermost commit, before transact returned");
  assert.deepEqual(a.listeners_failed, ["consequences"], "written onto the answer raise returned");
  /* outside any transaction it is at once, as before */
  const b = w.r.raise({ target: T, source: "edition", since: "s", viewer: ADMIN });
  assert.deepEqual([heard.length, b.listeners_failed], [2, ["consequences"]]);
});

test("R7 R8 (N406): a rolled-back caller, and a savepoint rolled back under a committing outer, tell no listener and name none", () => {
  const w = base();
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push([e.subject, e.source]));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  /* a caller that refuses, and one that throws */
  let a = null;
  const refused = w.record.transact(() => {
    a = w.r.raise({ target: T, source: "deferred", since: "s1", viewer: ADMIN });
    return { ok: false, reason: "SOMETHING_ELSE" };
  });
  assert.equal(refused.reason, "SOMETHING_ELSE");
  assert.deepEqual([a.raised.map((l) => l.bundle_id), a.listeners_failed, heard], [[DEP], undefined, []]);
  let b = null;
  assert.throws(() => w.record.transact(() => {
    b = w.r.raise({ target: T, source: "deferred", since: "s2", viewer: ADMIN });
    throw new Error("the act failed");
  }), /the act failed/);
  assert.deepEqual([b.listeners_failed, heard], [undefined, []]);
  /* a savepoint that rolls back under an outer that commits: only the outer's raise is told */
  let inner = null, outer = null;
  w.record.transact(() => {
    w.record.transact(() => {
      inner = w.r.raise({ target: T, source: "deferred", since: "inner", viewer: ADMIN });
      return { ok: false, reason: "INNER_REFUSED" };
    });
    outer = w.r.raise({ target: T, source: "reopened", since: "outer", viewer: ADMIN });
    return null;
  });
  assert.deepEqual(heard, [[T, "reopened"]]);
  assert.deepEqual([inner.listeners_failed, outer.listeners_failed], [undefined, ["consequences"]]);
});

test("R8 R14 R28 (N406): a notice sweep and a source's move inside a rolled-back caller write nothing and tell nothing; committed, they are told after the commit", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(DOC, [a]); w.doc(DOC2, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(DOC, a.sha);
  w.inquiry(DEP, { legs: [{ target: DOC, content_id: cid }] });
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e.kind));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  let sweep = null, moved = null;
  w.record.transact(() => {
    sweep = w.r.raiseNotices({});
    moved = w.r.sourceMoved({ source: "SRC-1", rung_before: "unknown", rung_after: "partly_known" });
    return { ok: false, reason: "ROLLED_BACK" };
  });
  assert.deepEqual([sweep.count, moved.moved], [1, true], "each answered at once");
  assert.deepEqual([w.count("reevaluation_notices"), w.count("reevaluation_source_moves"), heard,
                    sweep.listeners_failed, moved.listeners_failed], [0, 0, [], undefined, undefined]);
  w.record.transact(() => {
    sweep = w.r.raiseNotices({});
    moved = w.r.sourceMoved({ source: "SRC-1", rung_before: "unknown", rung_after: "partly_known" });
    assert.deepEqual(heard, [], "not before the commit");
    return null;
  });
  assert.deepEqual([w.count("reevaluation_notices"), w.count("reevaluation_source_moves")], [1, 1]);
  assert.deepEqual(heard, ["passage", "source"]);
  assert.deepEqual([sweep.listeners_failed, moved.listeners_failed], [["consequences"], ["consequences"]]);
});
