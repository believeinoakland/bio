/* accepted-work: the check at an inquiry's promotion (R4), through `promotion` (its R39). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, onRef, REF, REF2 } from "./fixture.mjs";

const ID = "INQ-2026-0001-q";
const local = { target: "INF-2026-0001-doc", role: "supports" };

test("R4 a promotion of an inquiry with a leg on an accepted finding is written; one on a finding not accepted at the named edition, or naming another edition than the one accepted, is refused BASIS_REFUSED with R3's findings, and nothing is written", () => {
  const w = world();
  w.source.publish(REF, 1); w.source.accept(REF, 1); w.source.publish(REF, 2);
  const ok = w.promote(ID, [onRef(REF, 1)]);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  const sha = w.sha(ID);
  for (const legs of [[onRef(REF, 2)], [onRef(REF, 1), onRef(REF2, 1)]]) {
    const r = w.promote(ID, legs);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "BASIS_REFUSED");
    assert.ok(Array.isArray(r.findings) && r.findings.length === 1);
    assert.equal(r.findings[0].check, "C-21.4");
    assert.equal(r.findings[0].code, "IMPORTED_NOT_ACCEPTED");
    assert.equal(r.findings[0].ord, legs.length - 1);
    assert.equal(w.sha(ID), sha, "nothing was written");
  }
  /* a target written with spaces around the ref is the ref (inquiry-grammar R11 reads it trimmed), and is asked */
  const padded = w.promote(ID, [{ ...onRef(REF, 2), target: `"  ${REF} "` }]);
  assert.equal(padded.reason, "BASIS_REFUSED");
  assert.deepEqual(padded.findings.map((f) => [f.ref, f.edition]), [[REF, 2]]);
  /* a creation is asked too */
  const c = w.promote("INQ-2026-0002-q", [local, onRef(REF, 2)]);
  assert.equal(c.reason, "BASIS_REFUSED");
  assert.deepEqual(c.findings.map((f) => [f.ord, f.ref]), [[1, REF]]);
  assert.equal(w.record.head("INQ-2026-0002-q"), null);
});

test("R4 with nothing registered, a promotion adding a leg on a ref is refused C-21.5; an inquiry with no such leg, and every other type, is not asked", () => {
  const w = world({ register: false });
  const r = w.promote(ID, [onRef(REF, 1)]);
  assert.equal(r.reason, "BASIS_REFUSED");
  assert.equal(r.findings[0].check, "C-21.5");
  assert.equal(r.findings[0].code, "ACCEPTED_WORK_UNREADABLE");
  assert.equal(w.record.head(ID), null);
  assert.equal(w.promote(ID, [local]).ok, true, "a local leg is not this module's");
  /* a document of another type with a basis naming a ref is not an inquiry's leg */
  const p = w.promotion.promote({ bundleId: "INF-2026-0009-doc", base: null, snapKey: "info", author: "member:alice",
    files: [{ path: "bundle.md", text: ["---", "id: INF-2026-0009-doc", "object_type: information", "schema: information@1",
      'title: "D"', "current_state: collected", "prior_state: null", 'created: "2026-10-03T00:00:00Z"',
      'last_updated: "2026-10-03T00:00:00Z"', "references: []", "state_history: []", "criticality: supporting",
      "basis:", `  - target: ${REF}`, "    target_edition: 1", "---", "", "body", ""].join("\n") }],
    meta: { object_type: "information" } });
  assert.notEqual(p.reason, "BASIS_REFUSED");
});

test("R4 an unchanged leg is not asked again: after a withdrawal, an unrelated revision of the same inquiry still promotes; a leg re-pointed at another edition, or a new leg, is asked", () => {
  const w = world();
  w.source.publish(REF, 1); w.source.accept(REF, 1);
  w.source.publish(REF, 2);
  w.source.publish(REF2, 3); w.source.accept(REF2, 3);
  assert.equal(w.promote(ID, [onRef(REF, 1), local]).ok, true);
  w.source.withdraw(REF, 1);
  const calls = w.source.calls.length;
  /* an unrelated revision: a new question, the legs reordered */
  const rev = w.promote(ID, [local, onRef(REF, 1)], { question: "Is it still answered?" });
  assert.equal(rev.ok, true, JSON.stringify(rev).slice(0, 400));
  assert.equal(w.source.calls.length, calls, "the unchanged leg was not asked");
  /* a new leg on accepted work is asked and passes; the withdrawn one stays and is not asked */
  assert.equal(w.promote(ID, [local, onRef(REF, 1), onRef(REF2, 3)]).ok, true);
  assert.deepEqual(w.source.calls.slice(calls).map(([, a]) => [a.ref, a.edition]), [[REF2, 3]]);
  /* re-pointing the withdrawn leg at another edition is asked, and refused while that edition is not accepted */
  const moved = w.promote(ID, [local, onRef(REF, 2), onRef(REF2, 3)]);
  assert.equal(moved.reason, "BASIS_REFUSED");
  assert.deepEqual(moved.findings.map((f) => [f.ord, f.edition]), [[1, 2]]);
  /* re-pointing it at the same finding of another import is a changed target, asked */
  w.source.withdraw(REF2, 3);
  const retarget = w.promote(ID, [local, onRef(REF2, 1), onRef(REF2, 3)]);
  assert.equal(retarget.reason, "BASIS_REFUSED");
  assert.deepEqual(retarget.findings.map((f) => [f.ord, f.ref, f.edition]), [[1, REF2, 1]]);
});

test("R4 a replay is not asked", () => {
  const w = world({ register: false });
  const r = w.promote(ID, [onRef(REF, 1)], { pkg: { replay: true } });
  assert.notEqual(r.reason, "BASIS_REFUSED");
  assert.equal(w.source.calls.length, 0);
});

test("R4 the check is registered with promotion at start, once per host: a second make answers the same instance and registers nothing more", async () => {
  const w = world();
  const { acceptedWorkOf } = await import("../../../src/accepted-work/index.mjs");
  assert.equal(acceptedWorkOf(w.host), w.aw);
  assert.equal(w.promotion.registerStep("accepted-work", { check: () => null }).ok, false, "the step is held");
});
