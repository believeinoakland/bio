/* case-check over the real modules it uses (case-authoring, publication, case-carriage, record-core, membership), built
   as case-authoring's own tests build them (its fixture), with ratification's pre-flight a stand-in at its ruled
   interface (K552 (5)) so the case is ready. It proves R1–R3 against the providers' real answers: the preparation R14
   stores, the pins R13 makes, publication's standing and its ratified editions, case-carriage's lapse reads. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "../case-authoring/fixture.mjs";
import { caseCheckOf } from "../../../src/case-check/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q";
const ready = (real) => new Proxy(real, { get: (t, p) => (p === "caseRatifyPreflight"
  ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
const AUTH = { author: "alice", scope: "s", statement: "It does not cover the amendments.", subjectPosition: "not_sought",
               subjectJustification: "A public record.", biasAcknowledgement: "We read the minutes as the account.",
               excluded: [], tieAttested: true };

function setup() {
  const w = world({ ratification: ready });
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const P = w.project("Team", "alice", [Q]);
  const c = caseCheckOf(w.host, { record: w.record, caseAuthoring: w.ca, publication: w.publication,
                                  caseCarriage: w.disclosures.caseCarriage ?? undefined, now: () => w.clock.now });
  const a = { ...AUTH, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice") };
  return { w, P, c, a };
}

test("R1, R2 (real providers): a ready case is prepared and checked; the check pins the member at its bytes and reads held; a participant reads it, an outsider gets the absent case's answer", () => {
  const { w, c, a } = setup();
  const pre = w.ca.publishPreflight(a);
  assert.equal(pre.ready, true, JSON.stringify([pre.first, pre.blockers]).slice(0, 400));
  const r = c.checkAndHold(a);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const doc = w.row(`SELECT doc_sha, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, r.case, r.edition);
  assert.deepEqual([doc.doc_sha, doc.sig_armored], [r.doc_sha, null], "stored unsigned (case-authoring R14)");
  assert.deepEqual(r.members, [{ bundle_id: Q, version_sha: w.head(Q), role: "load_bearing" }]);
  assert.equal(c.caseCheckOf({ case: r.case }).state, "held");
  assert.equal(c.caseCheckOf({ case: r.case, viewer: V("alice") }).state, "held");
  assert.equal(JSON.stringify(c.caseCheckOf({ case: r.case, viewer: V("bo") })),
               JSON.stringify(c.caseCheckOf({ case: "CASE-2026-0404", viewer: V("alice") })));
  assert.deepEqual(c.heldFindingVersions({ finding: Q }).items.map((x) => x.check), [r.check]);
  /* the repeat writes nothing */
  const before = w.snapshot();
  assert.equal(c.checkAndHold(a).existed, true);
  assert.deepEqual(w.snapshot(), before);
});

test("R1 (real providers): a blocker the pre-flight finds (a machine author, first) writes nothing", () => {
  const { w, c, a } = setup();
  const before = w.snapshot();
  const r = c.checkAndHold({ ...a, author: "class:daemon" });
  assert.deepEqual([r.ok, r.ready, r.reason], [false, false, "MACHINE_CANNOT_PUBLISH"]);
  assert.deepEqual(w.snapshot(), before);
});

test("R2 (real providers): an edited statement re-prepares the edition: the old check reads document_replaced, the new one held; a new version of the member voids both (member_moved); ratifying the edition reads published", () => {
  const { w, c, a } = setup();
  const r = c.checkAndHold(a);
  const again = c.checkAndHold({ ...a, statement: "It does not cover the amendments or the appeal." });
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
  assert.equal(again.existed, undefined, "an edited act is no repeat");
  assert.deepEqual([again.case, again.edition], [r.case, r.edition]);
  assert.deepEqual(c.caseCheckOf({ check: r.check }).why, ["document_replaced"]);
  assert.equal(c.caseCheckOf({ case: r.case }).state, "held");
  w.finding(Q, [{ target: DOC }]);
  const moved = c.caseCheckOf({ case: r.case });
  assert.deepEqual([moved.check, moved.state, moved.why], [again.check, "void", ["member_moved"]]);
  assert.deepEqual(c.caseCheckOf({ check: r.check }).why, ["document_replaced", "member_moved"]);
  assert.deepEqual(c.heldFindingVersions({ finding: Q }).items, []);
  w.ratify({ caseId: again.case, edition: again.edition });
  const pub = c.caseCheckOf({ case: again.case });
  assert.deepEqual([pub.state, pub.published_edition, pub.check], ["published", again.edition, again.check]);
});
