/* T48 (T48-11; N996, N1045; K3101, K3150): the reset link's member read from the query when the body names none
   (R71 (6)), the transitional delegates to `ai-accounts` (R72) and the `onAccountCleared` registration (R73). Each test
   drives the module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

test("R71 (6) passwordresetlink takes member from the body, or, when the body names none, from the query; by is the stamp, never the body's; control: neither names one, RESET_LINK_MEMBER_NOT_ACTIVE", async () => {
  const w = await world().group("ann", "bob");
  assert.equal(w.ops("by=second&member=ann").passwordresetlink().member, "ann", "no body: the query's");
  assert.equal(w.ops("by=second&member=ann", {}).passwordresetlink().member, "ann", "a body naming none: the query's");
  assert.equal(w.ops("by=second&member=ann", { member: 7 }).passwordresetlink().member, "ann", "a body member not a string names none");
  assert.equal(w.ops("by=second&member=ann", { member: "bob" }).passwordresetlink().member, "bob", "the body's wins");
  assert.equal(w.ops("by=ann&member=bob", { by: "second" }).passwordresetlink().reason, "NOT_AN_ADMIN", "by never from the body");
  assert.equal(w.ops("member=bob", { member: "bob", by: "second" }).passwordresetlink().reason, "NOT_AN_ADMIN", "nor from member");
  assert.equal(w.ops("by=second").passwordresetlink().code, "RESET_LINK_MEMBER_NOT_ACTIVE", "control: no member named");
});
