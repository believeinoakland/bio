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
  assert.deepEqual(w.r.raise({ target: T, source: "edition", since: "x", viewer: "nobody" }).raised, []);
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
