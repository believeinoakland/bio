/* money-checks R1–R3, R14: amount checks over a contract and the amount part of a progression instance's junction
   checks, derived on read, each a question with the facts read and both sums; over the real money, events and
   progressions. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, contract, ALICE, ADMIN_BOB, MACHINE, FORBIDDEN, texts } from "./fixture.mjs";

const byCheck = (r) => Object.fromEntries(r.checks.map((c) => [c.check, c]));
const share = (w, value = "10%", con = null) =>
  w.c.stateParameter({ check: "change_orders_past_share", name: "share", value, citation: "member's own word", contract: con, by: ALICE });

test("R2: paid above committed is a question with the facts read and both sums, exact", () => {
  const w = world();
  const k = contract(w, { award: "1000.10", orders: ["0.20"], paid: ["600.05", "400.30"] });
  const c = byCheck(w.c.amountChecks({ contract: k.id, viewer: ALICE })).paid_above_committed;
  assert.equal(c.holds, true);
  assert.equal(c.label, "Noticed");
  assert.equal(c.derivation.sums.committed.value, "1000.30");
  assert.equal(c.derivation.sums.paid.value, "1000.35");
  assert.deepEqual(c.read.facts.sort(), [k.facts.award, ...k.facts.orders, ...k.facts.paid].sort());
  /* equal is not above */
  const w2 = world();
  const k2 = contract(w2, { award: "1000", paid: ["999.99", "0.01"] });
  assert.equal(byCheck(w2.c.amountChecks({ contract: k2.id, viewer: ALICE })).paid_above_committed.holds, false);
});

test("R2: a sum money's summation rule refuses is answered as that refusal, not a check", () => {
  const w = world();
  const k = contract(w, { award: "1000", paid: ["10"] });
  w.rec({ amount: "5", stage: "paid", basis: "cash", concerns: [k.id] });
  const c = byCheck(w.c.amountChecks({ contract: k.id, viewer: ALICE })).paid_above_committed;
  assert.equal(c.refused.reason, "SUM_MIXED_BASIS");
  assert.equal(c.holds, "undetermined");
  assert.equal(c.derivation.sums.paid.refused.reason, "SUM_MIXED_BASIS");
});

test("R2: a signed amount differing from its award's (the award as adopted against the commitment signed)", () => {
  const w = world();
  const k = contract(w, { award: "1000", adopted: "900" });
  const c = byCheck(w.c.amountChecks({ contract: k.id, viewer: ALICE })).signed_differs_from_award;
  assert.equal(c.holds, true);
  assert.equal(c.derivation.sums.award.value, "900");
  assert.equal(c.derivation.sums.signed.value, "1000");
  const k2 = contract(w, { award: "1000", adopted: "1000.00" });
  assert.equal(byCheck(w.c.amountChecks({ contract: k2.id, viewer: ALICE })).signed_differs_from_award.holds, false);
  const k3 = contract(w, { award: "1000" });
  const c3 = byCheck(w.c.amountChecks({ contract: k3.id, viewer: ALICE })).signed_differs_from_award;
  assert.equal(c3.holds, "undetermined");
  assert.match(c3.why, /no award amount/);
});

test("R2 R3: change orders above a stated share; none stated answers undetermined, never a default", () => {
  const w = world();
  const k = contract(w, { award: "1000", orders: ["60", "50"] });
  const before = byCheck(w.c.amountChecks({ contract: k.id, viewer: ALICE })).change_orders_past_share;
  assert.equal(before.holds, "undetermined");
  assert.equal(before.why, "no threshold stated");
  assert.equal(share(w, "10%").ok, true);
  const c = byCheck(w.c.amountChecks({ contract: k.id, viewer: ALICE })).change_orders_past_share;
  assert.equal(c.holds, true);
  assert.equal(c.derivation.sums.award.value, "1000");
  assert.equal(c.derivation.sums.change_orders.value, "110");
  assert.equal(c.derivation.parameters[0].citation, "member's own word");
  assert.equal(c.derivation.parameters[0].scope, "group");
  /* a contract's own statement governs over the group's */
  assert.equal(share(w, "0.2", k.id).ok, true);
  const c2 = byCheck(w.c.amountChecks({ contract: k.id, viewer: ALICE })).change_orders_past_share;
  assert.equal(c2.holds, false);
  assert.equal(c2.derivation.parameters[0].scope, "contract");
  /* every statement is kept */
  const ps = w.c.parameters({ check: "change_orders_past_share", contract: k.id });
  assert.equal(ps.statements.length, 2);
  assert.deepEqual(ps.statements.map((s) => s.governs), [false, true]);
});

test("R3: stating a parameter: refusals, citation required, a member's act", () => {
  const w = world();
  const base = { check: "change_orders_past_share", name: "share", value: "10%", citation: "x", by: ALICE };
  assert.equal(w.c.stateParameter({ ...base, by: MACHINE }).reason, "MEMBER_ACT_ONLY");
  assert.equal(w.c.stateParameter({ ...base, check: "" }).reason, "NO_CHECK");
  assert.equal(w.c.stateParameter({ ...base, check: "nope" }).reason, "UNKNOWN_CHECK");
  assert.equal(w.c.stateParameter({ ...base, name: "limit" }).reason, "UNKNOWN_PARAMETER");
  assert.equal(w.c.stateParameter({ ...base, value: "" }).reason, "NO_VALUE");
  assert.equal(w.c.stateParameter({ ...base, value: "about 10%" }).reason, "BAD_VALUE");
  assert.equal(w.c.stateParameter({ ...base, citation: " " }).reason, "NO_CITATION");
  assert.equal(w.c.stateParameter({ ...base, contract: "ENT-2026-9999" }).reason, "NO_SUCH_ENTITY");
  assert.equal(w.count("money_check_params"), 0);
});

test("R2: no contract named, and money's own refusal of a non-contract, pass through", () => {
  const w = world();
  assert.equal(w.c.amountChecks({ contract: "" }).reason, "NO_CONTRACT");
  assert.equal(w.c.amountChecks({ contract: w.city, viewer: ALICE }).reason, "NOT_A_CONTRACT");
});

test("R1 R2: amount checks are derived on read and never stored", () => {
  const w = world();
  const k = contract(w, { award: "1000", orders: ["600"], paid: ["2000"], adopted: "900" });
  share(w);
  const before = w.snapshot();
  w.c.amountChecks({ contract: k.id, viewer: ALICE });
  assert.deepEqual(w.snapshot(), before);
});

/* A procurement flow with an award stage and a signed stage, an instance threaded through two held captures. */
async function threaded(w, { hiddenSigned = false } = {}) {
  const k = contract(w, { award: "1000" });
  const awardCap = w.held("INFO-2026-0101-award", "a".repeat(64));
  if (hiddenSigned) w.project("PROJ-2026-0009-hidden", ["bob"]);
  const signedCap = w.held("INFO-2026-0102-signed", "b".repeat(64), hiddenSigned ? "PROJ-2026-0009-hidden" : null);
  w.resolution(awardCap, "INFO-2026-0101-award", k.id);
  w.resolution(signedCap, "INFO-2026-0102-signed", k.id);
  const d = w.progressions.defineProgression({ progressionKey: "proc", label: "Procurement", basis: "the group's reading", declaredBy: ALICE,
    stages: [{ key: "award", cardinality: "1", required: "always" }, { key: "signed", after: "award", cardinality: "1", required: "always" }] });
  assert.equal(d.ok, true, JSON.stringify(d));
  const t = await w.progressions.threadInstance({ progressionKey: "proc", entityId: k.id, threadedBy: ALICE,
    placements: [{ stageKey: "award", captureSha: awardCap }, { stageKey: "signed", captureSha: signedCap }] });
  assert.equal(t.ok, true, JSON.stringify(t));
  return { ...k, awardCap, signedCap };
}
const stages = (w, contractId = null) => {
  for (const [name, value] of [["award_stage", "award"], ["signed_stage", "signed"]])
    assert.equal(w.c.stateParameter({ check: "junction_stages", name, value, citation: "our flow", contract: contractId, by: ALICE }).ok, true);
};

test("R1: a signed amount differing from the award, read from the facts sourced at each stated stage", async () => {
  const w = world();
  const k = await threaded(w);
  const a = w.rec({ amount: "1000", concerns: [k.id], capture: k.awardCap });
  const s = w.rec({ amount: "1200", concerns: [k.id], capture: k.signedCap });
  const none = w.c.junctionCheck({ progressionKey: "proc", entityId: k.id, viewer: ALICE });
  assert.equal(none.checks[0].holds, "undetermined");
  assert.match(none.checks[0].why, /no award or signed stage stated/);
  stages(w, k.id);
  const r = w.c.junctionCheck({ progressionKey: "proc", entityId: k.id, viewer: ALICE });
  assert.equal(r.ok, true);
  assert.equal(r.shown, true);
  const c = r.checks.find((x) => x.check === "junction_signed_differs_from_award");
  assert.equal(c.holds, true);
  assert.equal(c.label, "Noticed");
  assert.deepEqual(c.read.facts, [a, s]);
  assert.deepEqual(c.read.stages.map((x) => x.stage_key), ["award", "signed"]);
  assert.equal(c.derivation.sums.award.value, "1000");
  assert.equal(c.derivation.sums.signed.value, "1200");
});

test("R1: amendments past a stated share, an instance not threaded, and derived on read", async () => {
  const w = world();
  const k = await threaded(w);
  const co = w.event("other", []);
  w.relate(co, k.award, "amends");
  w.rec({ amount: "300", concerns: [co] });
  share(w, "0.25");
  const before = w.snapshot();
  const r = w.c.junctionCheck({ progressionKey: "proc", entityId: k.id, viewer: ALICE });
  assert.deepEqual(w.snapshot(), before);
  const c = r.checks.find((x) => x.check === "junction_amendments_past_share");
  assert.equal(c.holds, true);
  assert.equal(c.derivation.sums.share_of_award.value.startsWith("250"), true);
  const other = w.entity("contract", "Never threaded");
  const absent = w.c.junctionCheck({ progressionKey: "proc", entityId: other, viewer: ALICE });
  assert.equal(absent.found, false);
  assert.deepEqual(absent.checks, []);
  assert.equal(w.c.junctionCheck({ progressionKey: "", entityId: k.id }).reason, "NO_KEY");
});

test("R1: a placement in a document the viewer may not see is not read", async () => {
  const w = world();
  const k = await threaded(w, { hiddenSigned: true });
  w.rec({ amount: "1000", concerns: [k.id], capture: k.awardCap });
  w.rec({ amount: "1200", concerns: [k.id], capture: k.signedCap, by: ADMIN_BOB });
  stages(w);
  const c = w.c.junctionCheck({ progressionKey: "proc", entityId: k.id, viewer: ALICE }).checks[0];
  assert.equal(c.holds, "undetermined");
  assert.deepEqual(c.read.stages.map((s) => s.stage_key), ["award"]);
});

test("R14: no check's text says violation, breach, conflict or suspicious, or names a place", () => {
  const w = world();
  const k = contract(w, { award: "1000", orders: ["900"], paid: ["5000"], adopted: "10" });
  share(w);
  const all = texts(w.c.amountChecks({ contract: k.id, viewer: ALICE })).join(" ");
  assert.doesNotMatch(all, FORBIDDEN);
  assert.doesNotMatch(all, /oakland/i);
});
