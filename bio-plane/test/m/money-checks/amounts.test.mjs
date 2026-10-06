/* money-checks R1–R3, R14: amount checks over a contract and the amount part of a progression instance's junction
   checks, derived on read, each a question with the facts read and both sums. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, contract, ALICE, MACHINE, FORBIDDEN, texts } from "./fixture.mjs";

const byCheck = (r) => Object.fromEntries(r.checks.map((c) => [c.check, c]));
const share = (w, value = "10%", contract = null) =>
  w.c.stateParameter({ check: "change_orders_past_share", name: "share", value, citation: "member's own word", contract, by: ALICE });

test("R2: paid above committed is a question with the facts read and both sums, exact", () => {
  const w = world();
  const id = contract(w, { award: "1000.10", orders: ["0.20"], paid: ["600.05", "400.30"] });
  const c = byCheck(w.c.amountChecks({ contract: id, viewer: "admin" })).paid_above_committed;
  assert.equal(c.holds, true);
  assert.equal(c.label, "Noticed");
  assert.equal(c.derivation.sums.committed.value, "1000.30");
  assert.equal(c.derivation.sums.paid.value, "1000.35");
  assert.equal(c.read.facts.length, 4);
  /* equal is not above */
  const w2 = world();
  const id2 = contract(w2, { award: "1000", paid: ["999.99", "0.01"] });
  assert.equal(byCheck(w2.c.amountChecks({ contract: id2, viewer: "admin" })).paid_above_committed.holds, false);
});

test("R2: a sum money's summation rule refuses is answered as that refusal, not a check", () => {
  const w = world();
  const id = contract(w, { award: "1000", paid: ["10"] });
  w.fact("MNY-2026-paideur", { amount: "5", stage: "paid", currency: "EUR", concerns: [id] });
  const c = byCheck(w.c.amountChecks({ contract: id, viewer: "admin" })).paid_above_committed;
  assert.equal(c.refused.reason, "SUM_MIXED_CURRENCY");
  assert.equal(c.holds, "undetermined");
  assert.equal(c.derivation.sums.paid.refused.reason, "SUM_MIXED_CURRENCY");
});

test("R2: a signed amount differing from its award's (the award as adopted against the commitment signed)", () => {
  const w = world();
  const id = contract(w, { award: "1000", adopted: "900" });
  const c = byCheck(w.c.amountChecks({ contract: id, viewer: "admin" })).signed_differs_from_award;
  assert.equal(c.holds, true);
  assert.equal(c.derivation.sums.award.value, "900");
  assert.equal(c.derivation.sums.signed.value, "1000");
  const w2 = world();
  const id2 = contract(w2, { award: "1000", adopted: "1000.00" });
  assert.equal(byCheck(w2.c.amountChecks({ contract: id2, viewer: "admin" })).signed_differs_from_award.holds, false);
  const w3 = world();
  const id3 = contract(w3, { award: "1000" });
  const c3 = byCheck(w3.c.amountChecks({ contract: id3, viewer: "admin" })).signed_differs_from_award;
  assert.equal(c3.holds, "undetermined");
  assert.match(c3.why, /no award amount/);
});

test("R2 R3: change orders above a stated share; none stated answers undetermined, never a default", () => {
  const w = world();
  const id = contract(w, { award: "1000", orders: ["60", "50"] });
  const before = byCheck(w.c.amountChecks({ contract: id, viewer: "admin" })).change_orders_past_share;
  assert.equal(before.holds, "undetermined");
  assert.equal(before.why, "no threshold stated");
  assert.equal(share(w, "10%").ok, true);
  const c = byCheck(w.c.amountChecks({ contract: id, viewer: "admin" })).change_orders_past_share;
  assert.equal(c.holds, true);
  assert.equal(c.derivation.parameters[0].citation, "member's own word");
  assert.equal(c.derivation.parameters[0].scope, "group");
  /* a contract's own statement governs over the group's */
  assert.equal(share(w, "0.2", id).ok, true);
  const c2 = byCheck(w.c.amountChecks({ contract: id, viewer: "admin" })).change_orders_past_share;
  assert.equal(c2.holds, false);
  assert.equal(c2.derivation.parameters[0].scope, "contract");
  /* every statement is kept */
  const ps = w.c.parameters({ check: "change_orders_past_share", contract: id });
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
  w.entity("ENT-2026-0200", "institution");
  assert.equal(w.c.amountChecks({ contract: "ENT-2026-0200", viewer: "admin" }).reason, "NOT_A_CONTRACT");
});

test("R1 R2: amount checks are derived on read and never stored", () => {
  const w = world();
  const id = contract(w, { award: "1000", orders: ["600"], paid: ["2000"], adopted: "900" });
  share(w);
  const before = w.snapshot();
  w.c.amountChecks({ contract: id, viewer: "admin" });
  assert.deepEqual(w.snapshot(), before);
});

async function threaded(w) {
  const id = "ENT-2026-0100";
  w.entity(id, "contract");
  for (const [b, s] of [["INFO-2026-0001-award", "sa"], ["INFO-2026-0002-signed", "ss"]]) { w.bundle(b); w.resolve(id, s, b); }
  const d = w.progressions.defineProgression({ progressionKey: "proc", label: "Procurement", basis: "the group's reading", declaredBy: ALICE,
    stages: [{ key: "award", cardinality: "1", required: "always" }, { key: "signed", after: "award", cardinality: "1", required: "always" }] });
  assert.equal(d.ok, true, JSON.stringify(d));
  const t = await w.progressions.threadInstance({ progressionKey: "proc", entityId: id, threadedBy: ALICE,
    placements: [{ stageKey: "award", captureSha: "sa" }, { stageKey: "signed", captureSha: "ss" }] });
  assert.equal(t.ok, true, JSON.stringify(t));
  return id;
}

test("R1: a signed amount differing from the award, read from the facts sourced at each stated stage", async () => {
  const w = world();
  const id = await threaded(w);
  w.fact("MNY-2026-a", { amount: "1000", concerns: [id], capture: "sa", role: "award" });
  w.fact("MNY-2026-s", { amount: "1200", concerns: [id], capture: "ss" });
  w.fact("MNY-2026-o", { amount: "50", concerns: [id], capture: "elsewhere" });
  const none = w.c.junctionCheck({ progressionKey: "proc", entityId: id, viewer: "admin" });
  assert.equal(none.checks[0].holds, "undetermined");
  assert.match(none.checks[0].why, /no award or signed stage stated/);
  for (const [name, value] of [["award_stage", "award"], ["signed_stage", "signed"]])
    assert.equal(w.c.stateParameter({ check: "junction_stages", name, value, citation: "our flow", contract: id, by: ALICE }).ok, true);
  const r = w.c.junctionCheck({ progressionKey: "proc", entityId: id, viewer: "admin" });
  assert.equal(r.ok, true);
  assert.equal(r.shown, true);
  const c = r.checks.find((x) => x.check === "junction_signed_differs_from_award");
  assert.equal(c.holds, true);
  assert.equal(c.label, "Noticed");
  assert.deepEqual(c.read.facts, ["MNY-2026-a", "MNY-2026-s"]);
  assert.deepEqual(c.read.stages.map((s) => s.stage_key), ["award", "signed"]);
  assert.equal(c.derivation.sums.award.value, "1000");
  assert.equal(c.derivation.sums.signed.value, "1200");
});

test("R1: amendments past a stated share, and an instance not threaded, and derived on read", async () => {
  const w = world();
  const id = await threaded(w);
  w.fact("MNY-2026-a", { amount: "1000", concerns: [id], capture: "sa", role: "award" });
  w.fact("MNY-2026-c", { amount: "300", concerns: [id], role: "change_order" });
  share(w, "0.25");
  const before = w.snapshot();
  const r = w.c.junctionCheck({ progressionKey: "proc", entityId: id, viewer: "admin" });
  assert.deepEqual(w.snapshot(), before);
  const c = r.checks.find((x) => x.check === "junction_amendments_past_share");
  assert.equal(c.holds, true);
  assert.equal(c.derivation.sums.share_of_award.value.startsWith("250"), true);
  const absent = w.c.junctionCheck({ progressionKey: "proc", entityId: "ENT-2026-0101", viewer: "admin" });
  assert.equal(absent.found, false);
  assert.deepEqual(absent.checks, []);
  assert.equal(w.c.junctionCheck({ progressionKey: "", entityId: id }).reason, "NO_KEY");
});

test("R1: a placement in a document the viewer may not see is not read", async () => {
  const w = world();
  const id = await threaded(w);
  w.st.sql.exec(`UPDATE bundles SET project='PROJ-2026-0009-hidden' WHERE bundle_id='INFO-2026-0002-signed'`);
  w.project("PROJ-2026-0009-hidden", ["bob"]);
  w.fact("MNY-2026-a", { amount: "1000", concerns: [id], capture: "sa" });
  w.fact("MNY-2026-s", { amount: "1200", concerns: [id], capture: "ss", bundle: "INFO-2026-0002-signed" });
  for (const [name, value] of [["award_stage", "award"], ["signed_stage", "signed"]])
    w.c.stateParameter({ check: "junction_stages", name, value, citation: "our flow", by: ALICE });
  const c = w.c.junctionCheck({ progressionKey: "proc", entityId: id, viewer: ALICE }).checks[0];
  assert.equal(c.holds, "undetermined");
  assert.deepEqual(c.read.stages.map((s) => s.stage_key), ["award"]);
});

test("R14: no check's text says violation, breach, conflict or suspicious, or names a place", async () => {
  const w = world();
  const id = contract(w, { award: "1000", orders: ["900"], paid: ["5000"], adopted: "10" });
  share(w);
  const all = texts(w.c.amountChecks({ contract: id, viewer: "admin" })).join(" ");
  assert.doesNotMatch(all, FORBIDDEN);
  assert.doesNotMatch(all, /oakland/i);
});
