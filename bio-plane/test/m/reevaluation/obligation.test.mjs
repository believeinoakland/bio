/* reevaluation: the obligation, derived on read (R1–R6), §5.4's cascade events and a recorded re-evaluation (R16), a
   weaker derivation under a published edition (R17), and the invariants that bind them (R18–R21). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { REEVALUATION_ACT_CHECKS, CAUSE_SOURCES } from "../../../src/reevaluation/index.mjs";

const DOC = "INFO-2026-0001-doc", T = "INQ-2026-0001-target", DEP = "INQ-2026-0002-dep", DEP2 = "INQ-2026-0003-dep2";
const ADMIN = "class:admin";
const C1 = "INQ-2026-0004-child", C2 = "INQ-2026-0005-sib";

/** A target question, a dependent resting on it, and a document the dependent also rests on. */
function base(opts = {}) {
  const w = world(opts);
  w.doc(DOC);
  w.inquiry(T, {});
  w.inquiry(DEP, { legs: [{ target: T }, { target: DOC }], ...(opts.dep || {}) });
  return w;
}
const move = (w, id, opts) => w.promote(id, inquiryMd(id, opts));

test("R1 R18: a read writes nothing; an absent or unseen target is NO_SUCH_BUNDLE; with no target every basis target is asked", () => {
  const w = base();
  const before = w.snapshot();
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r.ok, r.count, r.obligations], [true, 0, []], "nothing moved, nothing owed");
  assert.deepEqual(w.r.reevaluations({ target: "INQ-2026-0099-none", viewer: ADMIN }),
    { ok: false, reason: "NO_SUCH_BUNDLE", target: "INQ-2026-0099-none" });
  assert.equal(w.r.reevaluations({ target: T, viewer: null }).reason, "NO_SUCH_BUNDLE", "an absent viewer sees nothing");
  move(w, T, { state: "deferred", disposition: '"set down"' });
  const mid = w.snapshot();
  const all = w.r.reevaluations({ viewer: ADMIN });
  assert.equal(all.count, 1);
  assert.deepEqual(w.r.reevaluations({ target: T, viewer: ADMIN }).obligations, all.obligations);
  assert.deepEqual(w.snapshot(), mid, "the obligation is a query: no read writes");
  assert.notDeepEqual(before, mid);
});

test("R2: supersession, deferred, dismissed and reopened are facts of the target's own row; a dependent with no cause is not listed", () => {
  {
    const w = base();
    move(w, T, { state: "deferred", disposition: '"set down"' });
    const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
    assert.deepEqual([o.bundle_id, o.target, o.target_state, o.causes.map((c) => c.source)], [DEP, T, "deferred", ["deferred"]]);
    assert.equal(o.causes[0].since, "2026-09-27T00:00:00Z");
    assert.match(o.causes[0].detail, /set down/);
  }
  {
    const w = base();
    move(w, T, { state: "dismissed", disposition: '"abandoned"' });
    assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.causes[0].source), ["dismissed"]);
  }
  {
    const w = base();
    move(w, T, { state: "open", prior: "deferred" });
    const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
    assert.equal(o.causes[0].source, "reopened");
    assert.match(o.causes[0].detail, /picked back up from deferred/);
  }
  {
    const w = base();
    move(w, T, { state: "open", prior: "concluded" });
    assert.equal(w.r.reevaluations({ viewer: ADMIN }).obligations[0].causes[0].source, "reopened", "concluded -> open is a reopening (DEC-72)");
  }
  {
    /* supersession: a real division of the target, a published dependent resting on it (a frozen leg does not refuse) */
    const w = world({ caseMembers: new Set([DEP]) });
    const DOC2 = "INFO-2026-0002-doc";
    w.doc(DOC); w.doc(DOC2);
    w.inquiry(T, { legs: [{ target: DOC }, { target: DOC2 }] });
    w.inquiry(DEP, { legs: [{ target: T }] });
    const d = w.k.divide({ target: T, reason: "two questions", viewer: "admin", author: V("alice"),
      children: [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }] });
    assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
    const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
    assert.deepEqual([o.bundle_id, o.causes[0].source, [...o.superseded_by].sort()], [DEP, "supersession", [C1, C2]]);
    assert.match(o.causes[0].detail, /nothing here re-points it for you/);
  }
  {
    /* no cause: the target open with no prior disposition */
    const w = base();
    move(w, T, { state: "open", prior: "null" });
    assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0);
  }
});

test("R2: the edition arm is per leg: a leg naming an earlier edition, or none, of a target at a later edition", () => {
  const w = world();
  w.inquiry(T, {});
  w.inquiry(DEP, { legs: [{ target: T, target_edition: 1 }] });
  w.inquiry(DEP2, { legs: [{ target: T }] });
  w.inquiry("INQ-2026-0006-current", { legs: [{ target: T, target_edition: 2 }] });
  w.publish(T, 1); w.publish(T, 2);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => o.bundle_id), [DEP, DEP2], "a leg at the latest edition owes nothing");
  const [c1] = r.obligations[0].causes;
  assert.deepEqual([c1.source, c1.ord, c1.cited_edition, c1.latest_edition, c1.latest_ratified_edition], ["edition", 0, 1, 2, 2]);
  assert.match(c1.detail, /rests on edition 1 of .* now stands at edition 2/);
  assert.deepEqual([r.obligations[1].causes[0].cited_edition], [null]);
  assert.match(r.obligations[1].causes[0].detail, /names no edition/);
  assert.equal(r.obligations[0].legs[0].target_edition, 1);
});

test("R3 R20: a dependent the viewer may not see is withheld whole and uncounted; a severed leg is listed, marked and worded", () => {
  const w = base();
  w.member("ann");
  /* a severed leg: the dependent's reference to the target is recorded severed */
  w.inquiry(DEP2, { legs: [{ target: T }], refs: [{ target: T, rel: "cites", status: "severed" }] });
  move(w, T, { state: "deferred", disposition: '"set down"' });
  const all = w.r.reevaluations({ viewer: ADMIN });
  const sev = all.obligations.find((o) => o.bundle_id === DEP2);
  assert.deepEqual(sev.legs.map((l) => l.status), ["severed"]);
  assert.deepEqual(all.obligations.find((o) => o.bundle_id === DEP).legs.map((l) => l.status), ["confirmed"]);
  for (const o of all.obligations) for (const l of o.legs) assert.ok(["severed", "confirmed"].includes(l.status));
  /* the edition wording for a severed leg */
  w.publish(T, 1); w.publish(T, 2);
  const e = w.r.reevaluations({ viewer: ADMIN }).obligations.find((o) => o.bundle_id === DEP2).causes.find((c) => c.source === "edition");
  assert.match(e.detail, /WITHDRAWN \(severed\).*supports nothing.*DEC-70/s);
  /* a member sees the same facts; an unrecognised viewer sees nothing, and no count says so */
  const asMember = w.r.reevaluations({ viewer: V("ann") });
  assert.deepEqual(asMember.obligations.map((o) => o.bundle_id), all.obligations.map((o) => o.bundle_id).filter(Boolean));
  const none = w.r.reevaluations({ viewer: "nobody" });
  assert.deepEqual([none.count, Object.keys(none).filter((k) => /withheld|hidden/.test(k))], [0, []]);
});

test("R4: reeval from the first cause; the dependent's stored triple beside it, never merged; its strength pair unaltered", () => {
  const w = base({ dep: { extra: ["reeval_pending:", "  flag: true", "  since: \"2026-09-20T00:00:00Z\"", "  source: annotation"] } });
  move(w, T, { state: "deferred", disposition: '"set down"' });
  const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
  assert.deepEqual(o.reeval, { flag: true, since: o.causes[0].since, source: "deferred" });
  assert.deepEqual(o.stored, { flag: true, since: "2026-09-20T00:00:00Z", source: "annotation" });
  const s = w.strength.strengthOf(DEP);
  assert.deepEqual(o.strength, { capture: s.capture, connection: s.connection, testimony: s.testimony, depth_bound: s.depth_bound });
  const w2 = base();
  move(w2, T, { state: "deferred", disposition: '"set down"' });
  assert.deepEqual(w2.r.reevaluations({ viewer: ADMIN }).obligations[0].stored, { flag: null, since: null, source: null });
});

test("R5: a capture letter on a leg whose target is not an inquiry is bounded by what the target earns; both fields always present", () => {
  const w = base({
    earnedOverride: (subject, targets) => ({ earned: { capture: Object.fromEntries(targets.map((t) =>
      [t, { mode: "ceiling", grade: "C", why: "a replay earns C" }])) } }),
    dep: { legs: [{ target: T }, { target: DOC, grade: "B", grade_axis: "capture", grade_source: "capture" }] },
  });
  w.doc("INFO-2026-0002-moved");
  move(w, T, { state: "deferred", disposition: '"set down"' });
  const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
  const leg = o.legs[0];
  assert.deepEqual(Object.keys(leg).sort(), ["grade", "grade_authored", "grade_axis", "grade_source", "grade_why", "ord",
    "role", "status", "target_edition"].sort());
  assert.deepEqual([leg.grade, leg.grade_authored, leg.grade_why], [null, null, null], "an ungraded leg: nothing invented");
  /* the capture leg on the document, when the document is the moved target */
  const w3 = world({ earnedOverride: (s, targets) => ({ earned: { capture: Object.fromEntries(targets.map((t) =>
    [t, { mode: "ceiling", grade: "C", why: "a replay earns C" }])) } }) });
  w3.doc(DOC, null, {});
  w3.inquiry(DEP, { legs: [{ target: DOC, grade: "B", grade_axis: "capture", grade_source: "capture" }] });
  w3.redoc(DOC, ["source_status: modified"]);
  const [o3] = w3.r.reevaluations({ viewer: ADMIN }).obligations;
  assert.deepEqual([o3.legs[0].grade, o3.legs[0].grade_authored], ["C", "B"]);
  assert.match(o3.legs[0].grade_why, /no more than C/);
});

test("R6: obligations ordered by dependent id then target; the answer carries count", () => {
  const w = world();
  const T2 = "INQ-2026-0000-first";
  w.inquiry(T, {}); w.inquiry(T2, {});
  w.inquiry(DEP2, { legs: [{ target: T }, { target: T2 }] });
  w.inquiry(DEP, { legs: [{ target: T }] });
  move(w, T, { state: "deferred", disposition: '"x"' });
  move(w, T2, { state: "deferred", disposition: '"x"' });
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, o.target]), [[DEP, T], [DEP2, T2], [DEP2, T]]);
  assert.equal(r.count, 3);
});

test("R16: §5.4's cascade events are causes: source_status, deletion, an annotation addressed with a substantive change", () => {
  {
    const w = base();
    w.redoc(DOC, ["source_status: removed"]);
    const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
    assert.deepEqual([o.target, o.causes.map((c) => c.source)], [DOC, ["source_status"]]);
    w.redoc(DOC, ["source_status: unchanged"]);
    assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "an unchanged source is no cause");
  }
  {
    const w = base();
    w.redoc(DOC, [], [{ path: "annotations/ann-1.json", text: JSON.stringify({ id: "a1", state: "addressed",
      substantive: true, addressed_at: "2026-09-27T05:00:00Z" }) }]);
    const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
    assert.deepEqual([o.causes[0].source, o.causes[0].since], ["annotation", "2026-09-27T05:00:00Z"]);
  }
  {
    const w = base();
    w.redoc(DOC, [], [{ path: "annotations/ann-2.json", text: JSON.stringify({ id: "a2", state: "addressed",
      substantive: false }) }]);
    assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "an annotation addressed with no substantive change is none");
  }
  {
    /* deletion: a leg naming what the record no longer holds */
    const w = base();
    w.st.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, DOC);
    const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
    assert.deepEqual([o.target, o.target_state, o.causes[0].source, o.causes[0].since], [DOC, null, "deletion", null]);
  }
  assert.ok(CAUSE_SOURCES.includes("wp_retraction") && CAUSE_SOURCES.includes("weakened"));
});

test("R16: a member's recorded re-evaluation closes one cause for one dependent until the target moves again; a machine is refused", () => {
  const w = base();
  move(w, T, { state: "deferred", disposition: '"set down"' });
  const m = w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", note: "looked", author: MACHINE, viewer: ADMIN });
  assert.deepEqual([m.ok, m.code, m.check, m.translation], [false, "MACHINE_CANNOT_RECORD_REEVALUATION", "C-110.6",
    REEVALUATION_ACT_CHECKS.MACHINE_CANNOT_RECORD_REEVALUATION.translation]);
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", note: "", author: "alice", viewer: ADMIN }).code,
    "REEVALUATION_NOTE_MALFORMED");
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", note: 'a "quote"', author: "alice", viewer: ADMIN }).code,
    "REEVALUATION_NOTE_MALFORMED");
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: T, source: "supersession", note: "x", author: "alice", viewer: ADMIN }).code,
    "REEVALUATION_NO_SUCH_CAUSE", "no such cause standing");
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", since: "2026-01-01T00:00:00Z",
    note: "x", author: "alice", viewer: ADMIN }).code, "REEVALUATION_NO_SUCH_CAUSE", "a since that is not the standing one");
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", note: "x", author: "alice", viewer: "nobody" }).code,
    "REEVALUATION_NO_SUCH_CAUSE", "unseen answers as none");
  assert.equal(w.count("reevaluation_records"), 0, "each refusal writes nothing");
  const ok = w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", note: "still stands", author: "alice", viewer: ADMIN });
  assert.deepEqual([ok.ok, ok.since, ok.closed, ok.author], [true, "2026-09-27T00:00:00Z", true, "alice"]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r.count, r.closed.length], [0, 1]);
  assert.deepEqual([r.closed[0].bundle_id, r.closed[0].causes[0].closed_by, r.closed[0].causes[0].note],
    [DEP, "alice", "still stands"]);
  /* the target moves again: a later since opens it again */
  move(w, T, { state: "open", prior: "deferred", extra: [] });
  w.promote(T, inquiryMd(T, { state: "deferred", disposition: '"again"' }).replace(/last_updated: "[^"]+"/, 'last_updated: "2026-09-28T00:00:00Z"'));
  const again = w.r.reevaluations({ viewer: ADMIN });
  assert.equal(again.count, 1);
  assert.equal(again.obligations[0].causes[0].since, "2026-09-28T00:00:00Z");
});

test("R17: a dependent at a published edition whose derived pair reads weaker than the edition froze carries `weakened`, both pairs named, neither altered", () => {
  const w = world();
  w.doc(DOC);
  w.inquiry(DEP, { legs: [{ target: DOC }] });
  /* the derived pair is unrated (no graded leg); the frozen pair graded: not a comparison of two letters */
  w.publish(DEP, 1, { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } });
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "an ungraded derived axis is not compared");
  /* a derived letter below the frozen one */
  const w2 = world();
  w2.doc(DOC);
  w2.inquiry(DEP, { legs: [{ target: DOC, grade: "B", grade_axis: "capture", grade_source: "capture" }] });
  const derived = w2.strength.strengthOf(DEP).capture;
  assert.equal(derived.state, "graded");
  w2.publish(DEP, 2, { capture: { state: "graded", grade: "A" } });
  const r = w2.r.reevaluations({ viewer: ADMIN });
  assert.equal(r.count, 1);
  const [o] = r.obligations;
  assert.deepEqual([o.bundle_id, o.target, o.legs, o.causes[0].source, o.causes[0].edition], [DEP, DEP, [], "weakened", 2]);
  assert.deepEqual(o.causes[0].axes, [{ axis: "capture", frozen: { state: "graded", grade: "A" },
                                        derived: { state: "graded", grade: derived.grade } }]);
  assert.equal(o.causes[0].since, "2026-09-27T12:00:00Z");
  assert.deepEqual(w2.r.reevaluations({ target: DEP, viewer: ADMIN }).obligations, r.obligations, "asked of the finding itself");
  assert.deepEqual(w2.strength.strengthOf(DEP).capture, derived, "the derived pair is not altered");
  /* equal or stronger: no cause */
  w2.publish(DEP, 3, { capture: { state: "graded", grade: derived.grade } });
  assert.equal(w2.r.reevaluations({ viewer: ADMIN }).count, 0);
});

test("R18 R19: the only rows written are a recorded re-evaluation's; nothing alters a strength, re-points a reference or moves a leg", () => {
  const w = base();
  move(w, T, { state: "deferred", disposition: '"set down"' });
  const legs = JSON.stringify(w.rows(`SELECT * FROM inquiry_basis ORDER BY bundle_id, ord`));
  const text = w.text(DEP), pair = JSON.stringify(w.strength.strengthOf(DEP));
  w.r.reevaluations({ viewer: ADMIN });
  w.r.recordReevaluation({ dependent: DEP, target: T, source: "deferred", note: "ok", author: "alice", viewer: ADMIN });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM inquiry_basis ORDER BY bundle_id, ord`)), legs);
  assert.equal(w.text(DEP), text);
  assert.equal(JSON.stringify(w.strength.strengthOf(DEP)), pair);
});

test("R21: silence is earned: no published registry means no edition was read, and the answer says so", () => {
  const w = world();
  w.inquiry(T, {});
  w.inquiry(DEP, { legs: [{ target: T, target_edition: 1 }] });
  w.publish(T, 2);
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).editions_read, true, "a registry answered is read");
  const w2 = world();
  w2.inquiry(T, {});
  w2.inquiry(DEP, { legs: [{ target: T }] });
  /* a registry that cannot be read (the fact provider throws) */
  w2.published.value = new Proxy({}, { get() { throw new Error("unreadable"); } });
  const r2 = w2.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r2.ok, r2.editions_read], [true, false]);
  assert.match(r2.editions_why, /not the same as none/);
});
