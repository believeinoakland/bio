/* run-rules R19 (Q0-5; VF-4; T33-49): the `verification_recorded` act's shape, its check, and whether a mode may be
   deployed on the verifications the record holds. Each refusal has its negative control beside it. */
import test from "node:test";
import assert from "node:assert/strict";
import { VERIFICATION_RECORDED, checkVerification, deployable, DEPLOYMENT_SEQUENCE, ASK_MODE } from "../../../src/run-rules/index.mjs";
import { refusal } from "./helpers.mjs";

const ok = (mode, extra = {}) => ({ mode, run: `RUN-${mode}`, verified_by: "member:ann", at: "2026-10-06T00:00:00Z",
                                     evidence: "op=audit clean after the sweep", ...extra });

test("R19: VERIFICATION_RECORDED is the act's shape {mode, run, verified_by, at, evidence}; checkVerification refuses a mode outside the order, a missing run, a missing or machine verified_by, or no evidence (C-22.20, naming the field); never throws", () => {
  assert.equal(VERIFICATION_RECORDED.act, "verification_recorded");
  assert.deepEqual(VERIFICATION_RECORDED.fields, ["mode", "run", "verified_by", "at", "evidence"]);
  assert.deepEqual(Object.keys(VERIFICATION_RECORDED.means), VERIFICATION_RECORDED.fields);
  assert.ok(Object.isFrozen(VERIFICATION_RECORDED) && Object.isFrozen(VERIFICATION_RECORDED.fields)
            && Object.isFrozen(VERIFICATION_RECORDED.means));
  /* controls: every mode of the order, evidence as words or as a list of references, a member's credential */
  for (const m of DEPLOYMENT_SEQUENCE.order) assert.equal(checkVerification(ok(m)), null, m);
  assert.equal(checkVerification(ok("check", { evidence: ["obs:12", "audit:3"] })), null);
  assert.equal(checkVerification(ok("check", { verified_by: "member:ann/tok1" })), null);
  /* not a record */
  for (const v of [null, undefined, 3, "check", [], [ok("check")]]) assert.equal(refusal(checkVerification(v), "AI_RUN_VERIFICATION_UNFIT").field, null);
  /* each field, in turn */
  const cases = [
    ["mode", [undefined, null, "", "ask", "Check", "verify", 3, ["check"]]],
    ["run", [undefined, null, "", "   ", 3, ["R1"]]],
    ["verified_by", [undefined, null, "", "  ", 3, "class:daemon", "token:abc", "claude", "daemon", "agent", "ai", "class:ai/tok1"]],
    ["evidence", [undefined, null, "", "  ", [], ["", " "], 3, { seen: "x" }]],
  ];
  for (const [field, values] of cases) for (const v of values) {
    const r = refusal(checkVerification(ok("check", { [field]: v })), "AI_RUN_VERIFICATION_UNFIT");
    assert.deepEqual([r.check, r.field], ["C-22.20", field], `${field} = ${JSON.stringify(v)}`);
    assert.match(r.detail, /Nothing was recorded$/);
  }
  /* a machine as the verifier says so in its detail */
  assert.match(checkVerification(ok("check", { verified_by: "class:daemon" })).detail, /names a machine/);
});

test("R19: deployable(mode, verifications) — the order's first mode always; each later one only when a well-formed verification is held for every mode before it (investigate only after check's), so the chain is the record's; plan and ask deploy apart and are not the chain's to decide; any other word false; never throws", () => {
  const chain = DEPLOYMENT_SEQUENCE.order.filter((m) => !Object.prototype.hasOwnProperty.call(DEPLOYMENT_SEQUENCE.deploys_apart, m));
  assert.deepEqual(chain, ["check", "investigate", "extract"]);
  for (const vs of [[], null, undefined, "x", [ok("investigate")]]) assert.equal(deployable("check", vs), true, String(vs));
  /* investigate: only after check's */
  assert.equal(deployable("investigate", []), false);
  assert.equal(deployable("investigate", [ok("check")]), true);
  assert.equal(deployable("investigate", [ok("investigate")]), false, "its own verification is not the one before it");
  /* extract: only after both */
  assert.equal(deployable("extract", [ok("check")]), false);
  assert.equal(deployable("extract", [ok("investigate")]), false);
  assert.equal(deployable("extract", [ok("investigate"), ok("check")]), true, "in any order held");
  /* only a well-formed verification counts: each unfit one in check's place leaves investigate off */
  for (const bad of [{ verified_by: "class:daemon" }, { evidence: "" }, { run: null }, { mode: "Check" }, { verified_by: "" }])
    assert.equal(deployable("investigate", [ok("check", bad)]), false, JSON.stringify(bad));
  assert.equal(deployable("investigate", [null, 3, "check", ok("check")]), true, "junk beside a good one changes nothing");
  /* the modes that deploy apart are never decided by the chain: their own reviewed flag alone deploys them */
  for (const vs of [[], [ok("check"), ok("investigate"), ok("extract")]]) {
    assert.equal(deployable("plan", vs), true);
    assert.equal(deployable(ASK_MODE.mode, vs), true);
  }
  /* any other word */
  for (const m of ["", null, undefined, "Check", "verify", "__proto__", "toString", 3])
    assert.equal(deployable(m, [ok("check"), ok("investigate"), ok("extract")]), false, String(m));
});
