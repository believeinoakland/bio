/* op-declarations: the act gate (R1), `ACT_GATE` and `decorateAct`, read from the tables that gate the ops. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { decorate, ACTS, CAPTURE_ACTS, PER_ITEM_ACTS } from "../../../src/affordances.mjs";
import { OPS, SESSION_OPS, NEEDS, ACT_GATE, decorateAct } from "../../../src/op-declarations/index.mjs";

const ACT_LIST = [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS];

test("R1: ACT_GATE is {needs(id), mode(id)}: needs answers NEEDS[id] or null for an op with no row, mode answers session, admin-session or machine from the two session sets, for every op, every act id and names that are no op", () => {
  assert.deepEqual(Object.keys(ACT_GATE).sort(), ["mode", "needs"]);
  const ids = [...Object.keys(OPS), ...ACT_LIST.map((a) => a.id), "nosuchop", "", "toString", "constructor", "__proto__",
               "hasOwnProperty", "valueOf"];
  for (const id of ids) {
    assert.equal(ACT_GATE.needs(id), Object.hasOwn(NEEDS, id) ? (NEEDS[id] ?? null) : null, id);
    assert.equal(ACT_GATE.mode(id), SESSION_OPS.member.has(id) ? "session" : SESSION_OPS.admin.has(id) ? "admin-session" : "machine", id);
  }
  /* One of each answer, and the three capabilities among the needs. */
  assert.deepEqual(["lease", "governorconfig", "purge", "nosuchop"].map(ACT_GATE.mode), ["session", "admin-session", "machine", "machine"]);
  assert.deepEqual(["promote", "ratify", "projectfork", "select", "search", "nosuchop"].map(ACT_GATE.needs),
                   ["contribute", "publish", "create_projects", null, null, null]);
  /* The new acts are gated from the same tables (T18). */
  assert.equal(ACT_GATE.mode("planopen"), "session");
  assert.equal(ACT_GATE.needs("optionpropose"), "contribute");
  assert.equal(ACT_GATE.needs("reminderset"), null);
});

test("R1: decorateAct(act) is affordances.decorate(act, ACT_GATE) for every act op=affordances publishes and op=queue offers, read when the act is decorated", () => {
  assert.ok(ACT_LIST.length > 10);
  for (const a of ACT_LIST) {
    const d = decorateAct(a);
    assert.deepEqual(d, decorate(a, ACT_GATE), a.id);
    assert.equal(d.needs, ACT_GATE.needs(a.id), a.id);
    assert.equal(d.mode, ACT_GATE.mode(a.id), a.id);
    /* Decorated per call: a fresh object each time, never one shared answer. */
    const again = decorateAct(a);
    assert.notEqual(again, d, a.id);
    assert.deepEqual(again, d, a.id);
  }
  /* An act the tables do not know decorates as a machine's with no capability, not as a throw. */
  const stranger = { ...ACT_LIST[0], id: "nosuchop" };
  const d = decorateAct(stranger);
  assert.equal(d.mode, "machine");
  assert.equal(d.needs, null);
});
