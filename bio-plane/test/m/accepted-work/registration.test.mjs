/* accepted-work: its one registration (R1). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, importer, REF, ALICE } from "./fixture.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

test("R1 one registration takes the three functions; a missing one is refused LISTENER_MALFORMED and a second registration LISTENER_DECLARED naming the holder, both membership's refusals; the registered functions answer through the reads", () => {
  const w = world({ register: false });
  const s = importer();
  /* every way a registration can be malformed */
  const malformed = [
    ["case-import", null], ["case-import", {}], ["case-import", "fns"],
    ["case-import", { finding: s.fns.finding, openFlags: s.fns.openFlags }],
    ["case-import", { finding: s.fns.finding, withdrawals: s.fns.withdrawals }],
    ["case-import", { openFlags: s.fns.openFlags, withdrawals: s.fns.withdrawals }],
    ["case-import", { ...s.fns, finding: "not a function" }],
    ["", s.fns], [null, s.fns], [42, s.fns],
  ];
  for (const [module, fns] of malformed) {
    const r = w.aw.registerAcceptedWork(module, fns);
    assert.equal(r.ok, false, JSON.stringify([module, Object.keys(fns || {})]));
    assert.equal(r.reason, "LISTENER_MALFORMED");
    assert.equal(r.code, "LISTENER_MALFORMED");
    assert.equal(r.check, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.check);
    assert.equal(r.translation, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.translation);
  }
  /* nothing was registered by a refused registration */
  assert.equal(w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE }).absent, true);

  const ok = w.aw.registerAcceptedWork("case-import", s.fns);
  assert.deepEqual(ok, { ok: true, module: "case-import" });
  s.publish(REF, 1); s.accept(REF, 1);
  assert.equal(w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE }).acceptance.by, ALICE);

  /* a second registration, by the same module or another, is declared, naming the holder; the first stands */
  for (const module of ["case-import", "someone-else"]) {
    const again = w.aw.registerAcceptedWork(module, importer().fns);
    assert.equal(again.ok, false);
    assert.equal(again.reason, "LISTENER_DECLARED");
    assert.equal(again.check, MEMBERSHIP_CHECKS.LISTENER_DECLARED.check);
    assert.equal(again.translation, MEMBERSHIP_CHECKS.LISTENER_DECLARED.translation);
    assert.equal(again.module, "case-import");
  }
  assert.equal(w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE }).ref, REF, "the first registration stands");
  /* a malformed second registration is malformed, as membership R81 orders it */
  assert.equal(w.aw.registerAcceptedWork("x", {}).reason, "LISTENER_MALFORMED");
});

test("R1 the registered functions are called with the arguments the reads name: finding and openFlags with {ref, edition, viewer}, withdrawals with {after, limit}", () => {
  const w = world();
  w.aw.acceptedFinding({ ref: REF, edition: 2, viewer: ALICE });
  w.aw.openFlagsOn({ ref: REF, edition: 2, viewer: ALICE });
  w.aw.acceptanceWithdrawals({ after: "W1", limit: 5 });
  assert.deepEqual(w.source.calls, [
    ["finding", { ref: REF, edition: 2, viewer: ALICE }],
    ["openFlags", { ref: REF, edition: 2, viewer: ALICE }],
    ["withdrawals", { after: "W1", limit: 5 }],
  ]);
});
