/* case-authoring R34, R75, R76 (T51 fix round 8, G112; diagnosis-R8-capture.md F): after a reload the ceremony sends the
   pre-flight of an already prepared edition without `tieAttested` (the Ties box is empty; screens-publish R50 sends only
   what the member attested in this step). The ties were attested when the edition was prepared and the unsigned document
   holds that attestation, so the pre-flight reads the signing check over it and the Sign step still offers the set-time
   choice. Over the real ratification, publication and case-disclosures, through the module's interface as the ceremony's
   op calls it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { PUBLISH_AT_NOT_REACHED_SENTENCE } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
const REASON = "the site refuses the archive's crawler";
const sign = (pre) => pre.steps.find((s) => s.name === "sign");

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const capture = w.graded(DOC);
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("alice"));
  return { w, P, capture };
}
const args = (x, over = {}) => ({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: x.P, targets: [Q],
  roles: { [Q]: "load_bearing" }, selfAttested: [{ capture: x.capture, reason: REASON }], viewer: V("alice"),
  author: "alice", tieAttested: undefined, ...over });
/* AUTHORED confirms the ties, so `args` withdraws it: a reload sends none, unless the call says so.
   The member's own act in the ceremony: ties attested, the edition prepared */
const prepare = (x) => {
  const r = x.w.ca.publishCase(args(x, { tieAttested: true }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return r;
};

test("R34, R75, R76: a prepared edition's pre-flight sent without tieAttested, as a reload sends it, reads the signing check and offers the set time: first is not TIE_ATTESTATION_MISSING, publish_at is offered in the zone, the rest of the answer is the confirmed call's, and nothing is written", () => {
  const x = setup();
  const done = prepare(x);
  /* the zone read creates local-facts' empty tables once; the snapshot is taken after that, so it compares what is written */
  x.w.ca.publishPreflight(args(x, { tieAttested: true }));
  for (const over of [{}, { tieAttested: false }]) {
    const before = x.w.snapshot();
    const pre = x.w.ca.publishPreflight(args(x, over));
    assert.deepEqual(x.w.snapshot(), before, "nothing written");
    assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
    assert.equal(sign(pre).ratification.reached, true);
    assert.equal(sign(pre).publish_at.offered, true);
    assert.equal(typeof sign(pre).publish_at.zone, "string");
    assert.ok(sign(pre).publish_at.zone.length);
    assert.equal("publish_at_stated" in sign(pre), false, "an answer read is stated as answered");
    /* exactly the answer of the call that carries the confirmation */
    const tied = x.w.ca.publishPreflight(args(x, { ...over, tieAttested: true }));
    assert.deepEqual(sign(pre).publish_at, sign(tied).publish_at);
    assert.deepEqual([pre.first, pre.blockers, pre.ready], [tied.first, tied.blockers, tied.ready]);
  }
});

test("R34, R75, R76 (control): a draft never prepared still answers TIE_ATTESTATION_MISSING first, with publish_at null and its not-reached sentence", () => {
  const x = setup();
  const pre = x.w.ca.publishPreflight(args(x));
  assert.equal(pre.first.reason, "TIE_ATTESTATION_MISSING");
  assert.equal(pre.ready, false);
  assert.equal(sign(pre).publish_at, null);
  assert.equal(sign(pre).publish_at_stated, PUBLISH_AT_NOT_REACHED_SENTENCE);
});

test("R76 (control): the pre-flight's carry never reaches the act: publishCase without tieAttested is still refused TIE_ATTESTATION_MISSING and writes nothing, prepared or not", () => {
  const x = setup();
  prepare(x);
  const docs = x.w.count("case_documents");
  const r = x.w.ca.publishCase(args(x));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "TIE_ATTESTATION_MISSING");
  assert.equal(x.w.count("case_documents"), docs, "nothing written");
});

test("R34, R76 (control): a published edition is not a prepared one: the pre-flight of the next edition, sent without tieAttested, asks the confirmation again", () => {
  const x = setup();
  const done = prepare(x);
  x.w.ratify(done);
  x.w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const next = { caseId: done.caseId, statement: "It does not cover the award's amendments.",
    subjectJustification: "A public record, so the question is whether it was followed.",
    biasAcknowledgement: "We read the minutes as the account of the meeting, as of this edition.",
    excluded: [{ description: "the amendments", reason: "requested and not yet held" }] };
  const pre = x.w.ca.publishPreflight(args(x, next));
  assert.equal(pre.editions.prepared, null);
  assert.equal(pre.first.reason, "TIE_ATTESTATION_MISSING");
  assert.equal(sign(pre).publish_at, null);
});

test("R34, R75, R76, R78: the same, for a draft named by the ceremony: prepared with the draft, the reload's call is only {draft, project} and the Sign step still offers the set time", () => {
  const x = setup();
  const { tieAttested, viewer, author, project, ...kept } = args(x);
  x.w.draft("DRAFT-2026-0001", x.P, kept, { statementBy: "alice" });
  const call = (over = {}) => ({ draft: "DRAFT-2026-0001", project: x.P, viewer: V("alice"), author: "alice", ...over });
  const done = x.w.ca.publishCase(call({ tieAttested: true }));
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  x.w.ca.publishPreflight(call({ tieAttested: true }));
  const pre = x.w.ca.publishPreflight(call());
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  assert.equal(pre.editions.prepared, 1);
  assert.equal(sign(pre).publish_at.offered, true);
  assert.deepEqual(sign(pre).publish_at, sign(x.w.ca.publishPreflight(call({ tieAttested: true }))).publish_at);
  /* control: the same draft, never prepared, asks the confirmation */
  const fresh = setup();
  fresh.w.draft("DRAFT-2026-0001", fresh.P, kept, { statementBy: "alice" });
  const un = fresh.w.ca.publishPreflight({ draft: "DRAFT-2026-0001", project: fresh.P, viewer: V("alice"), author: "alice" });
  assert.equal(un.first.reason, "TIE_ATTESTATION_MISSING");
  assert.equal(sign(un).publish_at, null);
});
