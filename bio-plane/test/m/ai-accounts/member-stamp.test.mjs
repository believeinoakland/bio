/* ai-accounts R38 (fix round 10; K5182; screens-settings R76; amends R1): the member is the stamp. At the module's ops map, the
   reference's member is the door's stamped `by`, never a `member` in the body. (The same case through the world's door, store-request's
   `storeWorld()`, imports this module and so is not a test of this one: it is REPORTed for BOB to place, K5138.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

const SECRET = "sk-ant-r38-sentinel-ann-7d1f";
/** Whether `member` holds a reference, as the page reads it: `accountReferenceState` asked by that member. */
const held = (w, member) => w.ops(`member=${member}&viewer=${member}`).accountreference().held;

test("R38 (K5182) a member sets, reads and removes her own reference at the ops map, with a body naming no member", async () => {
  const w = await world().group("ann");
  const set = await w.ops("by=ann", { kind: "apikey", secret: SECRET }).accountreferenceset();
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(set.kind, "apikey");
  assert.ok(!JSON.stringify(set).includes(SECRET), "the secret is never answered");
  const read = w.ops("member=ann&viewer=member:ann").accountreference();
  assert.equal(read.held, true, JSON.stringify(read));
  assert.equal(read.kind, "apikey");
  assert.ok(!JSON.stringify(read).includes(SECRET), "the secret is never answered on read either");
  const removed = await w.ops("by=ann", {}).accountreferenceremove();
  assert.equal(removed.ok, true, JSON.stringify(removed));
  assert.equal(removed.removed, true, "the reference Ann set is the one removed");
  assert.equal(held(w, "ann"), false, "and no longer held");
});

test("R38 control: a body naming another member acts on the caller's own reference only; a machine stamp is refused MACHINE_CANNOT_HOLD_ACCOUNT", async () => {
  const w = await world().group("ann", "bob");
  const set = await w.ops("by=ann", { member: "member:bob", kind: "apikey", secret: SECRET }).accountreferenceset();
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(held(w, "ann"), true, "the reference lands on Ann, the caller");
  assert.equal(held(w, "bob"), false, "Bob's reference is not set by a body naming him");
  const removed = await w.ops("by=ann", { member: "member:bob" }).accountreferenceremove();
  assert.equal(removed.removed, true, "removal names Ann's reference, not the body's Bob");
  assert.equal(held(w, "ann"), false);
  /* a machine stamp: no member stands behind it, so the arm refuses and writes nothing (R1) */
  const machine = await w.ops("by=class:ai", { member: "member:ann", kind: "apikey", secret: SECRET }).accountreferenceset();
  assert.equal(machine.reason, "MACHINE_CANNOT_HOLD_ACCOUNT", JSON.stringify(machine));
  assert.equal(held(w, "ann"), false, "nothing was written for Ann");
});
