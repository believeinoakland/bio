/* T51 fix round 10, DEC-438 (UX-DESIGN U480; K5299; R44): the undetermined-binding refusal's own detail ends by sending the
   member to the standard's page, "settle it on the standard's page first", and no other wording of it changes. Each test
   drives conformance at its interface, over the real standards, entities and events, in the walker's shape: an ordinance
   declared with `period {from, to: null}`, the body given as text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CONFORMANCE_CHECKS } from "../../../src/conformance/index.mjs";
import { standardBindingUndetermined } from "./fixtures.mjs";

test("R44: the walker's case, noncompliant against an undetermined standard, answers a detail that ends \"settle it on the standard's page first\" and writes nothing", () => {
  const f = standardBindingUndetermined();
  const before = f.world.snapshot();
  const r = f.conformance.determine(f.asked);
  assert.equal(r.code, "STANDARD_BINDING_UNDETERMINED");
  assert.equal(r.binds, "undetermined");
  assert.match(r.detail, /settle it on the standard's page first\. Nothing was written\.$/);
  assert.deepEqual(f.world.snapshot(), before, "nothing written");
});

test("R44: the new ending replaces the old one, which no longer appears in the detail or the row's translation", () => {
  const f = standardBindingUndetermined();
  const r = f.conformance.determine(f.asked);
  assert.doesNotMatch(r.detail, /a member settles it in standards first/);
  assert.doesNotMatch(r.detail, /settles it in standards/);
  assert.doesNotMatch(r.translation, /settles it in standards/);
});

test("R44: no other wording of the detail changes: its opening, the reason it states and the act it names are as before", () => {
  const f = standardBindingUndetermined();
  const r = f.conformance.determine(f.asked);
  assert.match(r.detail, /^whether .+ binds .+ is undetermined \(.+\), and an act is found noncompliant only against a standard that binds its body: /);
  assert.match(r.detail, /does not state when it ceased to be in force/);
  assert.equal(r.translation, CONFORMANCE_CHECKS.STANDARD_BINDING_UNDETERMINED.translation);
});
