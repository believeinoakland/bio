/* actNoBasis (R45; N186, D-484): the one site that mints `NO_BASIS` (C-33.40), a module-level function that `ground`
   (R27) and `basis-versions` (its R17) answer through. */
import test from "node:test";
import assert from "node:assert/strict";
import { actNoBasis } from "../../../src/inquiry/index.mjs";
import { SHARED_ACT_CHECKS } from "../../../src/record-grammar/index.mjs";
import { world, V } from "./fixture.mjs";

test("R45 actNoBasis answers the refusal with record-grammar's shared row; extra adds fields and never replaces these; it never throws", () => {
  const row = SHARED_ACT_CHECKS.NO_BASIS;
  assert.equal(row.check, "C-33.40");
  assert.deepEqual(actNoBasis("nothing to rest on"),
    { ok: false, reason: "NO_BASIS", code: "NO_BASIS", check: row.check, translation: row.translation, detail: "nothing to rest on" });
  const r = actNoBasis("d", { target: "INQ-2026-0001-q", ok: true, reason: "X", code: "X", check: "C-0", translation: "t", detail: "e" });
  assert.deepEqual(r, { target: "INQ-2026-0001-q", ok: false, reason: "NO_BASIS", code: "NO_BASIS", check: row.check,
                        translation: row.translation, detail: "d" }, "the caller's fields join; the refusal's own stay");
  for (const extra of [undefined, null, 7, "s"]) assert.equal(actNoBasis("d", extra).reason, "NO_BASIS");
  assert.doesNotThrow(() => actNoBasis());
});

test("R45 R27 ground answers a basis with no legs through actNoBasis, and writes nothing", () => {
  const w = world(); w.inquiry("INQ-2026-0002-e");
  const before = w.text("INQ-2026-0002-e");
  const r = w.k.ground({ target: "INQ-2026-0002-e", grounds: [], viewer: "admin", author: V("alice") });
  const { detail, ...rest } = r;
  assert.deepEqual({ ...rest, detail: typeof detail }, { ...actNoBasis("x", { target: "INQ-2026-0002-e" }), detail: "string" });
  assert.equal(w.text("INQ-2026-0002-e"), before);
});
