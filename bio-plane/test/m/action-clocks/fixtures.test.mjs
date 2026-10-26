/* action-clocks: the published fixtures (fixtures.mjs), each checked against action-clocks' real answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { pendingClocksRefusal } from "./fixtures.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";

test("R1: pendingClocksRefusal is PENDING_CLOCKS_BAD_BEFORE (C-117.5), echoing the `before` it was given", () => {
  const a = pendingClocksRefusal();
  assert.deepEqual([a.ok, a.reason, a.code, a.check, a.before],
    [false, "PENDING_CLOCKS_BAD_BEFORE", "PENDING_CLOCKS_BAD_BEFORE", "C-117.5", "x"]);
  assert.equal(a.translation, clocks.ACTION_CLOCK_CHECKS.PENDING_CLOCKS_BAD_BEFORE.translation);
  assert.equal(pendingClocksRefusal({ before: "2026-9-1" }).before, "2026-9-1");
});
