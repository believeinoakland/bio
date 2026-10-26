/* T51 fix round 10, walk E C2a (K5271; R43, amending R27): a noncompliant determination against a standard whose binding on
   the body is undetermined is refused with its own code, STANDARD_BINDING_UNDETERMINED, never STANDARD_NOT_BINDING (a
   benchmark). Each test drives conformance at its interface, over the real standards, entities and events, in the shape the
   walker met: an ordinance declared with `period {from, to: null}`, the body given as text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene } from "./fixture.mjs";
import { CONFORMANCE_CHECKS } from "../../../src/conformance/index.mjs";
import { standardBindingUndetermined } from "./fixtures.mjs";

const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

test("R43: noncompliant against an ordinance declared with a start and no end, the body given as text, is STANDARD_BINDING_UNDETERMINED (C-113.45), binds undetermined, its detail saying why and that a member settles it in standards, writing nothing", () => {
  const f = standardBindingUndetermined();
  const r = nothing(f.world, () => f.conformance.determine(f.asked));
  assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "STANDARD_BINDING_UNDETERMINED", "STANDARD_BINDING_UNDETERMINED", "C-113.45"]);
  assert.deepEqual([r.standard, r.body, r.binds], [f.standard, f.body, "undetermined"]);
  assert.equal(r.translation, CONFORMANCE_CHECKS.STANDARD_BINDING_UNDETERMINED.translation);
  assert.match(r.detail, /undetermined/);
  assert.match(r.detail, /does not state when it ceased to be in force/);
  assert.match(r.detail, /settles it in standards/);
  assert.doesNotMatch(r.detail, /benchmark/);
  assert.notEqual(r.code, "STANDARD_NOT_BINDING");
  assert.match(r.translation, /Nothing was written\.$/);
  assert.doesNotMatch(r.translation, /benchmark/i);
});

test("R43: the refusal's own row is C-113.45, its where naming the one region in #determine; the benchmark's row C-113.32 is unmoved", () => {
  const row = CONFORMANCE_CHECKS.STANDARD_BINDING_UNDETERMINED;
  assert.equal(row.check, "C-113.45");
  assert.equal(row.where, "src/conformance/index.mjs #determine > is-standard-binding-determined");
  assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"]);
  assert.equal(CONFORMANCE_CHECKS.STANDARD_NOT_BINDING.check, "C-113.32");
  assert.notEqual(row.translation, CONFORMANCE_CHECKS.STANDARD_NOT_BINDING.translation);
});

test("R43: a body that is named by text while the standard's issuer is an entity is undetermined too, with its own code; the same act with the body picked as the entity binds and is recorded (control)", () => {
  const f = standardBindingUndetermined();
  const typed = nothing(f.world, () => f.conformance.determine(f.askedByIssuerEntity.typed));
  assert.deepEqual([typed.code, typed.binds], ["STANDARD_BINDING_UNDETERMINED", "undetermined"]);
  const picked = f.conformance.determine(f.askedByIssuerEntity.picked);
  assert.deepEqual([picked.ok, picked.standards[0].binds], [true, true], JSON.stringify(picked).slice(0, 300));
});

test("R43: a standard that does not bind the body (a benchmark) is still STANDARD_NOT_BINDING (C-113.32) with binds false, and a standard that binds is accepted (controls)", () => {
  const f = standardBindingUndetermined();
  const r = nothing(f.world, () => f.conformance.determine(f.benchmarkAsked));
  assert.deepEqual([r.ok, r.code, r.check, r.binds], [false, "STANDARD_NOT_BINDING", "C-113.32", false]);
  assert.equal(f.conformance.determine(f.bindsAsked).ok, true);
});

test("R43: an act placed nowhere, whose day nothing binds on, is STANDARD_BINDING_UNDETERMINED; other outcomes against an undetermined standard are accepted as before", () => {
  const { w, std, ev, input } = scene();
  const nowhere = w.event(ev, { date: null });
  const r = nothing(w, () => w.c.determine(input({ act: { ...input().act, event: nowhere } })));
  assert.deepEqual([r.code, r.binds], ["STANDARD_BINDING_UNDETERMINED", "undetermined"]);
  const ok = w.c.determine(input({ act: { ...input().act, event: nowhere }, standards: [{ standard: std, outcome: "compliant" }],
                                   rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.deepEqual([ok.ok, ok.standards[0].binds], [true, "undetermined"], JSON.stringify(ok).slice(0, 300));
});
