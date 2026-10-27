/* The fixtures sheet-worker publishes (`fixtures.mjs`) answer what the member itself answers (R2). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { recomputeNotEnabled } from "./fixtures.mjs";
import { REFUSALS } from "../src/contract.mjs";

test("R2: the published recomputeNotEnabled fixture is the member's real NOT_ENABLED answer, ok:false, detail REFUSALS.NOT_ENABLED", async () => {
  const body = await recomputeNotEnabled();
  assert.equal(body.ok, false);
  assert.equal(body.reason, "NOT_ENABLED");
  assert.equal(body.detail, REFUSALS.NOT_ENABLED);
  assert.ok(body.detail.length);
});
