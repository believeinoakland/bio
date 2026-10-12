/* affordances: R19's backing for every op op-grades' `t45.mjs` grades `reasoned` (its R32), each driven at its owning
   module's own interface over that module's own fixture, as t41-backing.test.mjs drives T41's and backing.test.mjs's
   REASONED_CASES drive DEC-88's: called well-formed but without its authored reason (absent, empty, blank, and null where
   the owner takes it), it is refused with its owner's code, which is in JUSTIFICATION_REFUSALS, and writes nothing;
   called with it, it is accepted. The last test holds the list driven here to the ops `t45.mjs` grades `reasoned`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T45_RUNGS } from "../../../src/op-grades/t45.mjs";

/* Each op driven below, by its owner; the last test holds this list to t45.mjs. */
const DRIVEN = ["scenariosetaside", "scenariorestore", "planpause", "planresume", "actionscope", "projectscopeset",
  "projectapprovalset", "successrevise", "cureunlink", "ruledraft", "rulewithdraw"];

const WHYLESS = [undefined, "", "   "];
const GIVEN = "the member's own account of why";
const sqlOf = (w) => w.st?.sql ?? w.s?.sql ?? w.sql ?? w.storage?.sql;
const dump = (sql) => JSON.stringify([...sql.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
  .map(({ name }) => [name, [...sql.exec(`SELECT * FROM "${name}"`)]]));

/* The backing of one op: graded `reasoned` in t45.mjs and RUNGS; for each reasonless `why`, over a fresh scene, refused
   with `code`, in the family, writing nothing; over a fresh scene, with a reason, accepted. `scene()` answers
   `{ w, act(why) }`, `act` calling the owner's method with `why` in its reason field (absent when `undefined`). */
async function backed(op, code, scene, { whys = WHYLESS } = {}) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(T45_RUNGS[op], "reasoned", op);
  assert.equal(RUNGS[op], "reasoned", op);
  for (const why of whys) {
    const { w, act } = await scene();
    const sql = sqlOf(w);
    assert.ok(sql, `${op}: the fixture's record`);
    const before = dump(sql);
    const r = await act(why);
    const got = r?.code ?? r?.reason;
    assert.notEqual(r?.ok, true, `${op} ${JSON.stringify(why)}: accepted without its reason: ${JSON.stringify(r).slice(0, 300)}`);
    assert.equal(got, code, `${op} ${JSON.stringify(why)}: ${JSON.stringify(r).slice(0, 300)}`);
    assert.ok(JUSTIFICATION_REFUSALS.includes(got), `${op}: ${got} is not in JUSTIFICATION_REFUSALS`);
    assert.equal(dump(sql), before, `${op} ${JSON.stringify(why)}: refused, but wrote`);
  }
  const { act } = await scene();
  const ok = await act(GIVEN);
  assert.equal(ok?.ok, true, `${op}: refused with its reason: ${JSON.stringify(ok).slice(0, 300)}`);
}
const reasoned = (why) => (why === undefined ? {} : { reason: why });

/* ---- action-plans (R39, R40) ---- */
import * as apFix from "../action-plans/fixture.mjs";

test("R19: action-plans' scenariosetaside, scenariorestore, planpause and planresume, graded `reasoned` (op-grades R32), "
   + "are refused without the member's reason with PLAN_NO_REASON (action-plans R39, R40), in JUSTIFICATION_REFUSALS, "
   + "writing nothing, and accepted with it", async () => {
  const { by } = apFix;
  /* a plan bob opened, with scenario 2 in use; `aside` sets it aside first, for its restore */
  const planned = ({ aside = false } = {}) => {
    const w = apFix.seeded();
    apFix.opened(w);
    const s = w.ap.scenarioSet({ plan: w.PL, scenario: 2, name: "S2",
      phases: [{ id: "p2", name: "P2", options: [], starts: "plan_start", checkpoint: { after_days: 3 } }], ...by("bob") });
    assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
    if (aside) assert.equal(w.ap.scenarioSetAside({ plan: w.PL, scenario: 2, reason: "Not now", ...by("bob") }).ok, true);
    return w;
  };
  await backed("scenariosetaside", "PLAN_NO_REASON", () => { const w = planned();
    return { w, act: (why) => w.ap.scenarioSetAside({ plan: w.PL, scenario: 2, ...reasoned(why), ...by("bob") }) }; });
  await backed("scenariorestore", "PLAN_NO_REASON", () => { const w = planned({ aside: true });
    return { w, act: (why) => w.ap.scenarioRestore({ plan: w.PL, scenario: 2, ...reasoned(why), ...by("bob") }) }; });
  await backed("planpause", "PLAN_NO_REASON", () => { const w = planned();
    return { w, act: (why) => w.ap.planPause({ id: w.PL, look_again: "2026-11-01", ...reasoned(why), ...by("bob") }) }; });
  await backed("planresume", "PLAN_NO_REASON", () => { const w = planned();
    assert.equal(w.ap.planPause({ id: w.PL, reason: "Waiting on the audit", ...by("bob") }).ok, true);
    return { w, act: (why) => w.ap.planResume({ id: w.PL, ...reasoned(why), ...by("bob") }) }; });
});

/* ---- actions (R87) ---- */
import * as acFix from "../actions/fixture.mjs";

test("R19: actions' actionscope, graded `reasoned` (op-grades R32), is refused without the member's reason with "
   + "SCOPE_NO_REASON (actions R87), in JUSTIFICATION_REFUSALS, writing nothing, and accepted with it", async () => {
  const B = "ACTN-2026-0002-b", M = acFix.V(acFix.ALICE);
  await backed("actionscope", "SCOPE_NO_REASON", () => {
    const w = acFix.world();
    w.promote(B, acFix.actionMd(B, [...acFix.CP, "action_kind: other"]));
    return { w, act: (why) => w.a.actionScope({ target: B, confidential: true, ...reasoned(why), viewer: M, author: M }) };
  });
});

/* ---- project-roster (R21, R24) ---- */
import * as prFix from "../project-roster/fixture.mjs";

test("R19: project-roster's projectscopeset and projectapprovalset, graded `reasoned` (op-grades R32), are refused "
   + "without the member's reason (null too) with NO_REASON (project-roster R21, R24), in JUSTIFICATION_REFUSALS, "
   + "writing nothing, and accepted with it", async () => {
  const hidden = async () => { const w = await prFix.world().group("ann", "bob"); w.owned("PROJ-H", "ann", ["bob"]); return w; };
  const opts = { whys: [...WHYLESS, null] };
  await backed("projectscopeset", "NO_REASON", async () => { const w = await hidden();
    return { w, act: (why) => w.r.projectScopeSet({ projectId: "PROJ-H", scope: "counsel_matter", ...reasoned(why), by: "bob",
      viewer: prFix.V("bob") }) }; }, opts);
  await backed("projectapprovalset", "NO_REASON", async () => { const w = await hidden();
    return { w, act: (why) => w.r.projectApprovalSet({ projectId: "PROJ-H", needs: [{ tier: 3 }], ...reasoned(why), by: "ann",
      viewer: prFix.V("ann") }) }; }, opts);
});

/* ---- consequences (R21) ---- */
import * as csFix from "../consequences/fixture.mjs";

test("R19: consequences' successrevise, graded `reasoned` (op-grades R32), is refused without the member's reason with "
   + "SUCCESS_NO_REASON (consequences R21), in JUSTIFICATION_REFUSALS, writing nothing, and accepted with it", async () => {
  const { V } = csFix;
  await backed("successrevise", "SUCCESS_NO_REASON", () => {
    const w = csFix.world();
    w.determination("CONF-2026-0001-act", w.P, { "STD-2026-0001-law": "noncompliant" });
    const cid = w.figure("INFO-2026-0001-report", "The City published both reports; restored 1,000");
    const s = w.c.successRecord({ project: w.P, matter: { plan: "PLN-2026-0001", matter: "M1" },
      statement: "The City published both reports", changed_on: "2026-05-14", evidence: [cid], author: V("alice") });
    assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
    return { w, act: (why) => w.c.successRevise({ id: s.id, statement: "restated", ...reasoned(why), author: V("alice") }) };
  });
});

/* ---- conformance (R36) ---- */
import * as cfFix from "../conformance/fixture.mjs";

test("R19: conformance's cureunlink, graded `reasoned` (op-grades R32), is refused without the member's reason with "
   + "CONFORMANCE_NO_REASON (conformance R36, as R7's), in JUSTIFICATION_REFUSALS, writing nothing, and accepted with it",
async () => {
  const { V } = cfFix;
  await backed("cureunlink", "CONFORMANCE_NO_REASON", () => {
    /* the scene's noncompliant determination, cured by a later compliant act of the same office, the link standing */
    const { w, std, ev, input } = cfFix.scene();
    const target = w.c.determine(input());
    const later = w.event(ev, { date: "2026-04-01" });
    const cure = w.c.determine(input({ act: { ...input().act, event: later }, standards: [{ standard: std, outcome: "compliant" }],
      rows: [{ ...input().rows[0], reading: "aligns" }] }));
    assert.deepEqual([target.ok, cure.ok], [true, true], JSON.stringify(cure).slice(0, 300));
    const l = w.c.cureLink({ determination: target.id, standard: std, cure: cure.id, author: V("olive"), viewer: V("olive") });
    assert.equal(l.ok, true, JSON.stringify(l).slice(0, 300));
    return { w, act: (why) => w.c.cureUnlink({ link: l.link, ...reasoned(why), author: V("olive"), viewer: V("olive") }) };
  });
});

/* ---- local-facts (R10, R13) ---- */
import * as lfFix from "../local-facts/fixture.mjs";

test("R19: local-facts' ruledraft and rulewithdraw, graded `reasoned` (op-grades R32), are refused without the member's "
   + "reason with RULE_NO_REASON (local-facts R10, R13), in JUSTIFICATION_REFUSALS, writing nothing, and accepted with it",
async () => {
  const { V, sha } = lfFix;
  const DL = { rule: "group_answer", applies_to: "records_request", units: "days", amount: 7, starts: "received", citation: "Test Bylaw § 9" };
  const sourced = () => { const w = lfFix.world();
    return { w, src: { captureSha: w.held("INFO-2026-0001", sha("the bylaw")), extent: { kind: "document" } } }; };
  await backed("ruledraft", "RULE_NO_REASON", () => { const { w, src } = sourced();
    return { w, act: (why) => w.lf.ruleDraft({ section: "deadlines", entry: DL, source: src, ...reasoned(why), by: V("bob"),
      viewer: V("bob") }) }; });
  await backed("rulewithdraw", "RULE_NO_REASON", () => { const { w, src } = sourced();
    const d = w.lf.ruleDraft({ section: "deadlines", entry: DL, source: src, reason: "the bylaw's own text", by: V("bob"), viewer: V("bob") });
    assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
    return { w, act: (why) => w.lf.ruleWithdraw({ rule: d.rule, ...reasoned(why), by: V("dan"), viewer: V("dan") }) }; });
});

/* ---- the list ---- */
test("R19: every op op-grades' t45.mjs grades `reasoned` is driven here", () => {
  const graded = Object.keys(T45_RUNGS).filter((op) => T45_RUNGS[op] === "reasoned").sort();
  assert.deepEqual([...new Set(DRIVEN)].sort(), graded);
});
