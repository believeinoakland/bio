/* screens-intake T51 fix round 9 (K4969), R67: one classification of a capture's supporting-file reasons, exported for every screen that states them */
import { test } from "node:test";
import assert from "node:assert/strict";
import { supportingReasons } from "../../../src/screens-intake/index.mjs";

test("R67 each code lands in its kind: CAP_REACHED with a limit the cap, TOO_LARGE and BUDGET_EXHAUSTED too large, any other code unavailable", () => {
  assert.deepEqual(supportingReasons([{ reason: "CAP_REACHED", count: 3, limit: 400 }]), { cap: { n: 3, cap: 400 } });
  assert.deepEqual(supportingReasons([{ reason: "TOO_LARGE", count: 2 }]), { toolarge: { n: 2 } });
  assert.deepEqual(supportingReasons([{ reason: "BUDGET_EXHAUSTED", count: 5 }]), { toolarge: { n: 5 } });
  assert.deepEqual(supportingReasons([{ reason: "BODY_NOT_KEPT", count: 90 }]), { unavailable: { n: 90 } });
  assert.deepEqual(supportingReasons([{ reason: "SOMETHING_NEW", count: 1 }, { code: "UNRESOLVABLE" }, {}]), { unavailable: { n: 3 } });
  assert.deepEqual(supportingReasons([{ reason: "CAP_REACHED", count: 4 }]), { unavailable: { n: 4 } }, "a cap with no limit stated is not the cap sentence");
});

test("R67 counts are summed across codes sharing a kind; a count that is not a positive number is 1", () => {
  assert.deepEqual(supportingReasons([{ reason: "BUDGET_EXHAUSTED", count: 2 }, { reason: "TOO_LARGE", count: 1 }, { reason: "X", count: 3 }, { reason: "Y", count: 0 }, { reason: "Z", count: "9" }, { reason: "CAP_REACHED", limit: 400 }, { reason: "CAP_REACHED", count: 2, limit: 400 }]),
    { toolarge: { n: 3 }, unavailable: { n: 5 }, cap: { n: 3, cap: 400 } });
});

test("R67 a malformed entry is skipped, and no list is no kinds", () => {
  assert.deepEqual(supportingReasons([null, undefined, "TOO_LARGE", 7, [], { reason: "TOO_LARGE", count: 2 }]), { toolarge: { n: 2 }, unavailable: { n: 1 } });
  for (const none of [undefined, null, "x", {}, []]) assert.deepEqual(supportingReasons(none), {});
});
