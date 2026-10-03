/* accepted-work: the leg check (R3). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, importer, REF, REF2, ALICE } from "./fixture.mjs";
import { ACCEPTED_WORK_CHECKS } from "../../../src/accepted-work/index.mjs";

const NOT_ACCEPTED = ACCEPTED_WORK_CHECKS.IMPORTED_NOT_ACCEPTED, UNREADABLE = ACCEPTED_WORK_CHECKS.ACCEPTED_WORK_UNREADABLE;
const local = (t) => ({ target: t, role: "supports" });

test("R3 a leg on a ref is refused C-21.4 IMPORTED_NOT_ACCEPTED when the finding is not held at that edition, the viewer may not see it, or no acceptance of that edition is in force (another edition's acceptance does not count); an accepted one passes; each refusal names the leg's ord and ref", () => {
  const w = world();
  w.source.publish(REF, 1); w.source.accept(REF, 1);
  w.source.publish(REF, 2);                       // held, not accepted
  w.source.publish(REF2, 4); w.source.accept(REF2, 4);
  assert.deepEqual(w.aw.acceptedLegRefusals({ legs: [{ target: REF, target_edition: 1 }], viewer: ALICE }), []);
  const legs = [
    local("INF-2026-0001-doc"),                   // 0: a local leg, never asked
    { target: REF, target_edition: 2 },           // 1: held, not accepted at 2 (accepted at 1)
    { target: REF, target_edition: 3 },           // 2: not held at 3
    { target: REF2, target_edition: 4 },          // 3: accepted
    { target: REF, target_edition: 1 },           // 4: accepted
    { target: REF, target_edition: "1" },         // 5: an edition that is not the accepted one's
    { target: REF },                              // 6: no edition named
  ];
  const out = w.aw.acceptedLegRefusals({ legs, viewer: ALICE });
  assert.deepEqual(out.map((f) => [f.ord, f.ref, f.code]),
    [[1, REF, "IMPORTED_NOT_ACCEPTED"], [2, REF, "IMPORTED_NOT_ACCEPTED"], [5, REF, "IMPORTED_NOT_ACCEPTED"],
     [6, REF, "IMPORTED_NOT_ACCEPTED"]]);
  for (const f of out) {
    assert.equal(f.check, "C-21.4");
    assert.equal(f.check, NOT_ACCEPTED.check);
    assert.equal(f.translation, NOT_ACCEPTED.translation);
    assert.equal(f.severity, "error");
    assert.ok(f.detail.includes(`basis[${f.ord}]`) && f.detail.includes(REF));
  }
  /* an `ord` the leg carries is the one named */
  assert.equal(w.aw.acceptedLegRefusals({ legs: [{ target: REF, target_edition: 2, ord: 9 }], viewer: ALICE })[0].ord, 9);
  /* a viewer who may not see the import */
  w.source.hidden.add("member:mallory");
  assert.equal(w.aw.acceptedLegRefusals({ legs: [{ target: REF, target_edition: 1 }], viewer: "member:mallory" })[0].code,
               "IMPORTED_NOT_ACCEPTED");
  /* an answer at another edition than the one asked is not an acceptance of the one asked */
  const w2 = world({ register: false });
  const s = importer();
  w2.aw.registerAcceptedWork("case-import", { ...s.fns, finding: ({ ref }) => ({ ref, edition: 1,
    acceptance: { by: ALICE, at: "t", reason: "r", checked: [], gaps: [] } }) });
  assert.deepEqual(w2.aw.acceptedLegRefusals({ legs: [{ target: REF, target_edition: 2 }], viewer: ALICE }).map((f) => f.code),
                   ["IMPORTED_NOT_ACCEPTED"]);
  assert.deepEqual(w2.aw.acceptedLegRefusals({ legs: [{ target: REF, target_edition: 1 }], viewer: ALICE }), []);
});

test("R3 with nothing registered, or a registered function that throws or answers what is not a finding, every leg on a ref is refused C-21.5 ACCEPTED_WORK_UNREADABLE; local legs are not asked", () => {
  const legs = [local("INF-2026-0001-doc"), { target: REF, target_edition: 1 }, { target: REF2, target_edition: 2 }];
  const absent = world({ register: false });
  const thrown = world(); thrown.source.publish(REF, 1); thrown.source.accept(REF, 1); thrown.source.throws = "down";
  const odd = world({ register: false });
  odd.aw.registerAcceptedWork("case-import", { ...importer().fns, finding: () => "yes" });
  for (const w of [absent, thrown, odd]) {
    const out = w.aw.acceptedLegRefusals({ legs, viewer: ALICE });
    assert.deepEqual(out.map((f) => [f.ord, f.ref, f.code]),
      [[1, REF, "ACCEPTED_WORK_UNREADABLE"], [2, REF2, "ACCEPTED_WORK_UNREADABLE"]]);
    for (const f of out) {
      assert.equal(f.check, "C-21.5");
      assert.equal(f.check, UNREADABLE.check);
      assert.equal(f.translation, UNREADABLE.translation);
    }
  }
});

test("R3 other legs are not asked: only a target that is an imported finding reference reaches the registered function, each (ref, edition) once per call", () => {
  const w = world();
  w.source.publish(REF, 1);
  const legs = [local("INF-2026-0001-doc"), local("INQ-2026-0002-x"), local(`imported:${"a".repeat(63)}/INQ-2026-0001-x`),
                local(`imported:${"A".repeat(64)}/INQ-2026-0001-x`), local(` ${REF}`), { target: 7 }, null, "leg",
                { target: REF, target_edition: 1 }, { target: REF, target_edition: 1 }];
  const out = w.aw.acceptedLegRefusals({ legs, viewer: ALICE });
  assert.deepEqual(w.source.calls.map(([n, a]) => [n, a.ref, a.edition]), [["finding", REF, 1]]);
  assert.deepEqual(out.map((f) => f.ord), [8, 9], "both legs named, one read");
});

test("R3 it writes nothing and never throws, whatever it is handed", () => {
  const w = world();
  const hostile = { get target() { throw new Error("boom"); } };
  for (const args of [undefined, null, {}, { legs: null }, { legs: "x" }, { legs: [hostile] }, { legs: [{ target: REF }] }]) {
    assert.doesNotThrow(() => w.aw.acceptedLegRefusals(args));
    assert.ok(Array.isArray(w.aw.acceptedLegRefusals(args)));
  }
  assert.equal(w.count(), 0);
});
