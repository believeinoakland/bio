/* capture-requests' published fixtures (fixtures.mjs), each called and its answer compared with what the real module answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { sweepScopeRegistrar } from "./fixtures.mjs";

test("R45 sweepScopeRegistrar: the first registration holds the slot and a second, by any other module, is refused LISTENER_DECLARED naming the holder", () => {
  const f = sweepScopeRegistrar();
  assert.deepEqual(f.first, { ok: true, module: f.holder });
  assert.deepEqual([f.again.ok, f.again.reason, f.again.code, f.again.module], [false, "LISTENER_DECLARED", "LISTENER_DECLARED", f.holder]);
  const named = sweepScopeRegistrar({ holder: "sweeper", other: "x" });
  assert.deepEqual([named.first.module, named.again.module], ["sweeper", "sweeper"]);
});
