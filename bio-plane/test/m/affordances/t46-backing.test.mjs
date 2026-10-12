/* affordances: R19's backing for every op op-grades' `t46.mjs` grades `reasoned` (its R33), each driven at its owning
   module's own interface over that module's own fixture, as t45-backing.test.mjs drives T45's: called well-formed but
   without its authored reason (absent, empty, blank), it is refused with its owner's code, which is in
   JUSTIFICATION_REFUSALS, and writes nothing; called with it, it is accepted. The last test holds the list driven here to
   the ops `t46.mjs` grades `reasoned`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T46_RUNGS } from "../../../src/op-grades/t46.mjs";
import { seeded, opened, V } from "../escalation/fixture.mjs";

const DRIVEN = ["escalationstoppursuing", "escalationreopen"];
const WHYLESS = [undefined, "", "   "];
const GIVEN = "the member's own account of why";
const dump = (sql) => JSON.stringify([...sql.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
  .map(({ name }) => [name, [...sql.exec(`SELECT * FROM "${name}"`)]]));
const reasoned = (why) => (why === undefined ? {} : { reason: why });
const bob = { author: V("bob"), viewer: V("bob") };

function backed(op, code, scene) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(T46_RUNGS[op], "reasoned", op);
  assert.equal(RUNGS[op], "reasoned", op);
  for (const why of WHYLESS) {
    const { w, act } = scene();
    const sql = w.st.sql;
    const before = dump(sql);
    const r = act(why);
    assert.notEqual(r?.ok, true, `${op} ${JSON.stringify(why)}: accepted without its reason`);
    assert.equal(r?.reason, code, `${op} ${JSON.stringify(why)}: ${JSON.stringify(r).slice(0, 300)}`);
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${op}: ${r.reason} is not in JUSTIFICATION_REFUSALS`);
    assert.equal(dump(sql), before, `${op} ${JSON.stringify(why)}: refused, but wrote`);
  }
  const { act } = scene();
  const ok = act(GIVEN);
  assert.equal(ok?.ok, true, `${op}: refused with its reason: ${JSON.stringify(ok).slice(0, 300)}`);
}

test("R19 R52: escalation's escalationstoppursuing and escalationreopen, graded `reasoned` (op-grades R33), are refused "
   + "without the member's reason with ESCALATION_NO_REASON (escalation R31), in JUSTIFICATION_REFUSALS, writing nothing, "
   + "and accepted with it", () => {
  const open = () => { const w = seeded(); opened(w); return w; };
  backed("escalationstoppursuing", "ESCALATION_NO_REASON", () => {
    const w = open();
    return { w, act: (why) => w.esc.escalationStopPursuing({ id: w.E, ...reasoned(why), ...bob }) };
  });
  backed("escalationreopen", "ESCALATION_NO_REASON", () => {
    const w = open();
    assert.equal(w.esc.escalationStopPursuing({ id: w.E, reason: "set down for now", ...bob }).ok, true);
    return { w, act: (why) => w.esc.escalationReopen({ id: w.E, ...reasoned(why), ...bob }) };
  });
});

test("R19: the ops driven here are exactly those op-grades' t46.mjs grades `reasoned`", () => {
  assert.deepEqual([...DRIVEN].sort(), Object.keys(T46_RUNGS).filter((op) => T46_RUNGS[op] === "reasoned").sort());
});
