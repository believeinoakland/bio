import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Members } from "../../../src/member-roster/index.mjs";

test("R1 the capability vocabulary is exactly contribute, publish, create_projects; administer is not in it", () => {
  assert.deepEqual(Members.CAPABILITIES, ["contribute", "publish", "create_projects"]);
  assert.ok(!Members.CAPABILITIES.includes("administer"));
});

test("R2 adminMath and adminArithmetic", async () => {
  for (let n = 0; n <= 12; n++) {
    const need = Math.floor(n / 2) + 1, elig = Math.max(0, n - 1);
    assert.deepEqual(Members.adminMath(n), { administrators: n, votesNeeded: need, eligibleVoters: elig,
      possible: need <= elig });
  }
  const w = await world().group();
  const a = w.m.adminArithmetic();
  assert.deepEqual(a.table, [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => Members.adminMath(n)));
  assert.deepEqual(a.live, Members.adminMath(2));
});
