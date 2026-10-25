/* connections: R72 (walk-T51-final 06 §12), a target the viewer cannot see (R20) is answered with connections' own
   code and catalogue row, never hypotheses' inquiry refusal. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { NO_SUCH_DOCUMENT_CHECKS } from "../../../src/connections/index.mjs";
import { dec49Row } from "../../../src/answer-envelope/families.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", GONE = "INFO-2026-0404-z";

function hiddenWorld() {
  const w = world();
  w.member("alice"); w.member("bob");
  w.doc(A, ["alpha"]); w.doc(B, ["beta"]);
  const p = w.project("Carol's work", "alice");
  return { w, p };
}

function holdsOwnRow(r, target) {
  const row = NO_SUCH_DOCUMENT_CHECKS.NO_SUCH_DOCUMENT;
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NO_SUCH_DOCUMENT"); assert.equal(r.code, "NO_SUCH_DOCUMENT");
  assert.equal(r.check, row.check); assert.equal(r.translation, row.translation);
  assert.equal(dec49Row("NO_SUCH_DOCUMENT").check, row.check);
  assert.equal(r.target, target);
  assert.equal(/inquiry/i.test(r.translation), false);
}

test("R72, R20: backlinks of a target the viewer cannot see, or none held, carries connections' own code and row", () => {
  const { w, p } = hiddenWorld();
  holdsOwnRow(w.k.backlinks({ target: p, viewer: V("bob") }), p);
  holdsOwnRow(w.k.backlinks({ target: GONE, viewer: V("bob") }), GONE);
});

test("R72: the other reads and writes that name a document answer the same code and row", () => {
  const { w, p } = hiddenWorld();
  holdsOwnRow(w.k.asserted({ bundleId: p, viewer: V("bob") }), p);
  holdsOwnRow(w.k.assert({ a: A, b: GONE, basis: "x", member: "bob", viewer: V("bob") }), GONE);
});

test("R72 control: a visible target answers as before, with no refusal", () => {
  const { w } = hiddenWorld();
  assert.deepEqual(w.k.backlinks({ target: A, viewer: V("bob") }), { ok: true, target: A, backlinks: [] });
  assert.equal(w.k.asserted({ bundleId: A, viewer: V("bob") }).ok, true);
});
