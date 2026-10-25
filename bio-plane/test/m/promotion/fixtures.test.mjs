/* The fixtures promotion publishes for its users (K4990, K4993, K5044): each is made by promotion's real code when it is
 * called, and each test here calls it and checks the real answer. Named with the requirement each answer carries. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, makeRecord, makeMembership, promotionOver, registeredSteps, registrars, factUnavailable, groupUndetermined,
  projectActNotParticipant, snapKeyTaken, retireCited, promoteControlled } from "./fixtures.mjs";

test("R40 factUnavailable: promotion's own FACT_UNAVAILABLE for a fact no module provides, never a value", () => {
  const r = factUnavailable();
  assert.deepEqual([r.ok, r.reason, r.code, r.fact], [false, "FACT_UNAVAILABLE", "FACT_UNAVAILABLE", "unregistered"]);
  assert.equal(typeof r.check, "string");
  assert.equal(typeof r.translation, "string");
  assert.equal(r.reason === "NO_SUCH_FACT", false, "NO_SUCH_FACT is the fact readers' code, not promotion's");
});

test("R13 groupUndetermined: a success record created where no producing group is recorded or named is refused GROUP_UNDETERMINED", () => {
  const r = groupUndetermined();
  assert.deepEqual([r.ok, r.reason, r.act], [false, "GROUP_UNDETERMINED", "promote"]);
  assert.equal(r.check, "C-64.1");
});

test("R39 R40 promotionOver keeps the caller's record; registeredSteps reads back what registerStep accepted; a second registration is STEP_DECLARED", () => {
  const record = makeRecord(), membership = makeMembership();
  const p = promotionOver({ record, membership });
  const check = () => null;
  assert.equal(p.registerStep("alpha", { check }).ok, true);
  assert.equal(p.registerStep("alpha", { check }).reason, "STEP_DECLARED");
  assert.equal(p.registerStep("", { check }).reason, "STEP_MODULE_UNNAMED");
  const steps = registeredSteps(p);
  assert.deepEqual(steps.map((s) => s.module), ["alpha"], "the refused registrations are not read back");
  assert.equal(steps[0].check, check);
  assert.deepEqual(registeredSteps(makePromotion().p), [], "a promotion with none registered reads back none");
  record.db.exec("CREATE TABLE marker (x)");
  assert.ok(record.one("SELECT name FROM sqlite_master WHERE name='marker'"), "the record is the caller's own");
});

test("R39 R40 R45 registrars: registerStep, registerFact (STEP_DECLARED the second time), fact (FACT_UNAVAILABLE) and onCommitted are promotion's real ones", () => {
  const r = registrars();
  assert.equal(r.stepDeclared.reason, "STEP_DECLARED");
  assert.equal(r.factDeclared.reason, "STEP_DECLARED");
  assert.equal(r.factUnavailable.reason, "FACT_UNAVAILABLE");
  assert.deepEqual(r.fact("fixtureFact"), { ok: true, fact: "fixtureFact", value: 1 });
  assert.equal(r.onCommitted("fixture-module", () => {}).ok, true);
});

test("R38 projectActNotParticipant: a member outside a project who revises its document is refused PROJECT_ACT_NOT_A_PARTICIPANT, by promotion", () => {
  const r = projectActNotParticipant();
  assert.deepEqual([r.ok, r.reason, r.act], [false, "PROJECT_ACT_NOT_A_PARTICIPANT", "promote"]);
});

test("R4 snapKeyTaken: a different promotion under a held snap key is SNAP_KEY_TAKEN, naming the key", () => {
  const r = snapKeyTaken();
  assert.deepEqual([r.ok, r.reason, r.check, r.snapKey], [false, "SNAP_KEY_TAKEN", "C-67.1", "k1"]);
});

test("R16 retireCited: a move into retired while inquiries cite the item is CITED, naming every citer; with another set, that set", () => {
  const r = retireCited();
  assert.deepEqual([r.ok, r.reason, r.to, r.offenders], [false, "CITED", "retired", [{ id: "INFO-2026-0001", citedBy: ["INQ-2026-0001", "INQ-2026-0002"] }]]);
  const one = retireCited({ id: "INFO-2026-0007", citedBy: ["INQ-2026-0009"] });
  assert.deepEqual(one.offenders, [{ id: "INFO-2026-0007", citedBy: ["INQ-2026-0009"] }]);
});

test("R1 R4 R38 promoteControlled: the real promote succeeds with {ok, bundleId, bundleSha}, refuses by real causes, answers PROMOTE_FAILED for a failing record, and logs every call", () => {
  const verdicts = ["succeed", "stale", "snapkey", "outsider", "throw"];
  const c = promoteControlled((pkg, n) => verdicts[n - 1]);
  const ok = c.promote({});
  assert.deepEqual([ok.ok, ok.bundleId, typeof ok.bundleSha], [true, "INFO-2026-0001", "string"]);
  assert.equal(c.promote({}).reason, "CAS_STALE");
  assert.equal(c.promote({}).reason, "SNAP_KEY_TAKEN");
  assert.equal(c.promote({}).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  const failed = c.promote({});
  assert.deepEqual([failed.ok, failed.reason], [false, "PROMOTE_FAILED"]);
  assert.match(failed.detail, /the record failed/);
  assert.deepEqual(c.log.map((l) => l.verdict), verdicts, "the spy delegates and keeps every call");
});
