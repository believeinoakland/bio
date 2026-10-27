/* R83 (T52): a proposed administrator's row on an administrator's roster carries its endorsements. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { threeAdmins } from "./fixture.mjs";

const row = (w, id, administer = true) => w.m.memberList({ administer }).members.find((r) => r.member_id === id);

test("R83 a proposed administrator's row carries have and awaiting; others carry none", async () => {
  const w = await threeAdmins("ann");
  await w.m.memberAdd({ memberId: "fourth", cover: "cover of fourth", role: "admin", by: "admin" });
  const e = row(w, "fourth").endorsements;
  assert.deepEqual(e.have, ["admin"]);
  assert.deepEqual(e.awaiting, ["second", "third"]);
  await w.m.adminEndorse({ memberId: "fourth", by: "second" });
  assert.deepEqual(row(w, "fourth").endorsements, { have: ["admin", "second"], awaiting: ["third"] });
  /* controls */
  assert.equal("endorsements" in row(w, "fourth", false), false, "a member's roster carries none");
  assert.equal("endorsements" in row(w, "second"), false, "an active administrator's row carries none");
  assert.equal("endorsements" in row(w, "ann"), false, "a member's row carries none");
  await w.m.adminEndorse({ memberId: "fourth", by: "third" });
  assert.equal("endorsements" in row(w, "fourth"), false, "no longer proposed");
});
