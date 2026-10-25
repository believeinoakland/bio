/* The fixtures entities publishes for its users (K4990, K4993, K5044): each is made by entities' real code when it is called, and each test here calls it
 * and checks the real answer. Named with the requirement each answer carries. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { entitiesWorld, namingInRefused, unreadable } from "./fixtures.mjs";
import { NAMING_IN_CAPTURES_MAX, ENTITY_KINDS } from "../../../src/entities/index.mjs";

test("R1 R43 entitiesWorld: the real createEntity refusals UNKNOWN_KIND, ENTITY_NO_LABEL, ENTITY_NO_NOTE, and the real addIdentifier refusals in their order", () => {
  const w = entitiesWorld();
  assert.equal(w.e.createEntity({ note: "n", kind: "nope", label: "L" }).reason, "UNKNOWN_KIND");
  assert.equal(w.e.createEntity({ note: "n", kind: "office", label: " " }).reason, "ENTITY_NO_LABEL");
  assert.equal(w.e.createEntity({ note: " ", kind: "office", label: "L" }).reason, "ENTITY_NO_NOTE");
  assert.equal(w.e.addIdentifier({ ...w.ok, entityId: "ENT-2026-0404" }).reason, "NO_SUCH_ENTITY");
  assert.equal(w.e.addIdentifier({ ...w.ok, scheme: "nope" }).reason, "UNKNOWN_SCHEME");
  assert.equal(w.e.addIdentifier({ ...w.ok, entityId: w.office, id: "?" }).reason, "SCHEME_NOT_FOR_KIND");
  assert.equal(w.e.addIdentifier({ ...w.ok, basis: "" }).reason, "NO_BASIS");
  assert.equal(w.e.addIdentifier(w.ok).ok, true);
  assert.equal(w.e.addIdentifier({ ...w.ok, entityId: w.lee }).reason, "IDENTIFIER_TAKEN");
});

test("R52 namingInRefused: namingIn's own NO_KIND, UNKNOWN_KIND, NO_SHA and TOO_MANY_CAPTURES, nothing read", () => {
  for (const code of ["NO_KIND", "UNKNOWN_KIND", "NO_SHA", "TOO_MANY_CAPTURES"]) {
    const r = namingInRefused({ code });
    assert.deepEqual([r.ok, r.reason], [false, code], code);
    assert.equal(typeof r.detail, "string", code);
  }
  const many = namingInRefused({ code: "TOO_MANY_CAPTURES" });
  assert.deepEqual([many.count, many.max], [NAMING_IN_CAPTURES_MAX + 1, NAMING_IN_CAPTURES_MAX]);
  assert.deepEqual(namingInRefused().kinds, [...ENTITY_KINDS]);
  assert.throws(() => namingInRefused({ code: "OTHER" }), /no refusal OTHER/);
});

test("R51 unreadable: entitiesOfKind over a registry whose read throws answers UNREADABLE with a detail, never a list", () => {
  const r = unreadable();
  assert.deepEqual([r.ok, r.reason], [false, "UNREADABLE"]);
  assert.match(r.detail, /the registry could not be read/);
  assert.equal(r.entities, undefined);
});
