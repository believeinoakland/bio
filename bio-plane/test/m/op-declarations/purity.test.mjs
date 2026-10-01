/* op-declarations: frozen data (R5) and no I/O, store, network, clock or place (R7). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "../../../src/op-declarations/index.mjs";
import { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS } from "../../../src/affordances.mjs";

const { OPS, SESSION_OPS, NEEDS, UNATTENDED_BY_DECISION, ACT_GATE, PLAN_RUN_SCOPE } = O;

test("R5: every table and list is frozen data: OPS to its leaves, each list, both session sets (which refuse add, delete and clear, and offer no set to Set.prototype), NEEDS, UNATTENDED_BY_DECISION, ACT_GATE and PLAN_RUN_SCOPE", () => {
  assert.ok(Object.isFrozen(OPS));
  for (const [op, s] of Object.entries(OPS)) {
    assert.ok(Object.isFrozen(s), op);
    if (Array.isArray(s.classes)) assert.ok(Object.isFrozen(s.classes), op);
    if (Array.isArray(s.machineClasses)) assert.ok(Object.isFrozen(s.machineClasses), op);
  }
  for (const [name, v] of Object.entries(O)) if (Array.isArray(v)) assert.ok(Object.isFrozen(v), name);
  for (const t of [SESSION_OPS, NEEDS, UNATTENDED_BY_DECISION, ACT_GATE, PLAN_RUN_SCOPE, PLAN_RUN_SCOPE.reads, PLAN_RUN_SCOPE.writes])
    assert.ok(Object.isFrozen(t));
  /* Each change is refused, and nothing changes. */
  const before = JSON.stringify(OPS.promote);
  assert.throws(() => { OPS.promote.mutating = false; }, TypeError);
  assert.throws(() => { OPS.promote.classes.push("ai"); }, TypeError);
  assert.throws(() => { OPS.nosuchop = { classes: null, mutating: false }; }, TypeError);
  assert.throws(() => { delete OPS.purge; }, TypeError);
  assert.equal(JSON.stringify(OPS.promote), before);
  assert.throws(() => { O.EDGE_ACTIONS.push("purge"); }, TypeError);
  assert.throws(() => { NEEDS.purge = "contribute"; }, TypeError);
  assert.throws(() => { UNATTENDED_BY_DECISION.promote = "no"; }, TypeError);
  assert.throws(() => { ACT_GATE.mode = () => "session"; }, TypeError);
  for (const kind of ["member", "admin"]) {
    const set = SESSION_OPS[kind];
    const size = set.size;
    assert.throws(() => set.add("purge"), TypeError);
    assert.throws(() => set.delete("promote"), TypeError);
    assert.throws(() => set.clear(), TypeError);
    assert.throws(() => Set.prototype.add.call(set, "purge"), TypeError);
    assert.throws(() => Set.prototype.delete.call(set, "promote"), TypeError);
    assert.throws(() => { set.has = () => true; }, TypeError);
    assert.throws(() => { SESSION_OPS[kind] = new Set(); }, TypeError);
    assert.equal(set.size, size);
    assert.equal(set.has("purge"), false);
    assert.equal(set.has("promote"), true);
    /* It reads as a set: spread, iterated, copied into a Set. */
    assert.equal(new Set(set).size, size);
    assert.deepEqual([...set.values()], [...set]);
    assert.deepEqual([...set.keys()], [...set]);
  }
});

test("R5: the tables are read as they are exported, the same on every load: a second, independent load of the module answers byte-identical tables", async () => {
  const again = await import(`../../../src/op-declarations/index.mjs?second=${Date.now()}`);
  assert.notEqual(again.OPS, OPS);
  const view = (m) => JSON.stringify({ ops: m.OPS, needs: m.NEEDS, unattended: m.UNATTENDED_BY_DECISION, scope: m.PLAN_RUN_SCOPE,
    member: [...m.SESSION_OPS.member], admin: [...m.SESSION_OPS.admin],
    lists: Object.entries(m).filter(([, v]) => Array.isArray(v)) });
  assert.equal(view(again), view(O));
});

test("R7: no I/O, no store, no network and no clock: loading the module and asking every gate and decoration it offers touches no network, clock, randomness, timer or environment", async () => {
  const touched = [];
  const saved = { fetch: globalThis.fetch, now: Date.now, random: Math.random, setTimeout: globalThis.setTimeout,
                  setInterval: globalThis.setInterval, getRandomValues: crypto.getRandomValues, digest: crypto.subtle.digest,
                  env: process.env };
  const trap = (name) => (...a) => { touched.push(name); throw new Error(`R7: ${name} called`); };
  const RealDate = Date;
  try {
    globalThis.fetch = trap("fetch");
    globalThis.setTimeout = trap("setTimeout");
    globalThis.setInterval = trap("setInterval");
    Math.random = trap("Math.random");
    crypto.getRandomValues = trap("crypto.getRandomValues");
    crypto.subtle.digest = trap("crypto.subtle.digest");
    globalThis.Date = new Proxy(RealDate, { construct() { touched.push("new Date"); throw new Error("R7: new Date"); },
                                            apply() { touched.push("Date()"); throw new Error("R7: Date()"); },
                                            get(t, k) { if (k === "now") return trap("Date.now"); return Reflect.get(t, k); } });
    /* Node's own module loader reads `WATCH_REPORT_DEPENDENCIES` (and `NODE_*`) on every import; those are the
       runtime's reads, not the module's. */
    const runtimeOwn = (k) => k === "WATCH_REPORT_DEPENDENCIES" || k.startsWith("NODE_");
    process.env = new Proxy({}, { get(_, k) { if (typeof k === "string" && !runtimeOwn(k)) touched.push(`env.${k}`); return undefined; } });
    const m = await import("../../../src/op-declarations/index.mjs?r7");
    for (const id of [...Object.keys(m.OPS), "nosuchop"]) { m.ACT_GATE.needs(id); m.ACT_GATE.mode(id); }
    for (const a of [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS]) m.decorateAct(a);
  } finally {
    globalThis.fetch = saved.fetch; Math.random = saved.random; globalThis.setTimeout = saved.setTimeout;
    globalThis.setInterval = saved.setInterval; crypto.getRandomValues = saved.getRandomValues;
    crypto.subtle.digest = saved.digest; process.env = saved.env; globalThis.Date = RealDate;
  }
  assert.deepEqual(touched, []);
});

test("R7: no place is named in the module's outward text — no spec, list, capability or citation names a jurisdiction", () => {
  const strings = [];
  const walk = (v) => {
    if (typeof v === "string") strings.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk([OPS, NEEDS, UNATTENDED_BY_DECISION, PLAN_RUN_SCOPE, [...SESSION_OPS.member], [...SESSION_OPS.admin],
        Object.entries(O).filter(([, v]) => Array.isArray(v)).map(([, v]) => v)]);
  assert.ok(strings.length > 1000);
  /* The places this repository's profiles and history name, and the forms a place takes in outward text. */
  const PLACE = /\b(oakland|alameda|california|berkeley|san francisco|bay area|city of|county of|state of)\b/i;
  for (const s of strings) assert.doesNotMatch(s, PLACE, s.slice(0, 120));
});
