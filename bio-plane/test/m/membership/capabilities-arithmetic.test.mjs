import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";

test("R4 the capability vocabulary is exactly contribute, publish, create_projects; administer is not in it", () => {
  assert.deepEqual(Membership.CAPABILITIES, ["contribute", "publish", "create_projects"]);
  assert.ok(!Membership.CAPABILITIES.includes("administer"));
});

test("R5 adminMath and adminArithmetic", async () => {
  for (let n = 0; n <= 12; n++) {
    const need = Math.floor(n / 2) + 1, elig = Math.max(0, n - 1);
    assert.deepEqual(Membership.adminMath(n), { administrators: n, votesNeeded: need, eligibleVoters: elig,
      possible: need <= elig });
  }
  const w = await world().group();
  const a = w.m.adminArithmetic();
  assert.deepEqual(a.table, [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => Membership.adminMath(n)));
  assert.deepEqual(a.live, Membership.adminMath(2));
});
