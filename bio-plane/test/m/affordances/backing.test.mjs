/* affordances: R19's backing for `narrow` and `triage`, driven at basis-versions' and intent's own interfaces over their
   fixtures (a reading whose leg cites a part of a document; open proposals), which the plane fixture does not build. Everything else R19 drives is in
   `plane.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "../basis-versions/fixture.mjs";
import { seeded, V as IV } from "../intent/fixture.mjs";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/affordances.mjs";

test("R19: narrow, graded `reasoned` (R27), called well-formed but without its account of what changed, is refused "
   + "with a code in JUSTIFICATION_REFUSALS, and with one it is accepted", () => {
  const DOC = "INFO-2026-0001-a", Q2 = "INQ-2026-0002-r", Q = "INQ-2026-0001-q";
  const w = world();
  w.doc(DOC);
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  assert.equal(w.inquiry(Q, block(merge(version("first", [DOC, Q2], { claim: "the claim" }), { grounds: [], legs: [] }))).ok, true);
  const args = { target: Q, version: "first", ord: 0, author: "member:alice", viewer: V("alice"), name: "first narrowed",
                 extent: { extent_kind: "pdf-page", extent_page: "2" } };
  assert.equal(RUNGS.narrow, "reasoned");
  for (const description of [undefined, "", "   "]) {
    const r = w.bv.narrow({ ...args, description });
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(description)}: ${r.reason}`);
  }
  assert.equal(w.bv.narrow({ ...args, description: "points at page three, where the vote is recorded" }).ok, true);
});

test("R19: triage, graded `reasoned` (K219), is refused without a reason where it sets a proposal down (defer, dismiss), "
   + "and adopting — which revises nothing — asks none (K212)", async () => {
  const w = seeded();
  w.entity("ENT-1"); w.define();
  await w.thread("ENT-1", { need: "A" });
  w.i.registerSource("monitoring", () => [{ key: "c-1", kind: "capture-failed", grade: null, basis: { n: 1 }, instances: [] },
                                          { key: "c-2", kind: "capture-failed", grade: null, basis: { n: 2 }, instances: [] }]);
  assert.equal(RUNGS.triage, "reasoned");
  for (const act of ["defer", "dismiss"])
    for (const reason of [undefined, "", "  "]) {
      const r = w.i.triage({ proposal: "monitoring::c-2", act, reason, author: IV("bob") });
      assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${act} ${JSON.stringify(reason)}: ${r.reason}`);
    }
  assert.equal(w.i.triage({ proposal: "monitoring::c-1", act: "adopt", project: w.P, author: IV("bob"), viewer: IV("bob") }).ok, true);
  assert.equal(w.i.triage({ proposal: "monitoring::c-2", act: "defer", reason: "not now", author: IV("bob"), viewer: IV("bob") }).ok, true);
});
