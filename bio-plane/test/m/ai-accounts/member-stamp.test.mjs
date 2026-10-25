/* ai-accounts R38 (fix round 10; K5182; screens-settings R76; amends R1): the member is the stamp. Through the world's door
   (store-request's storeWorld), the reference's member is the door's stamped `by`, never a `member` in the body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { resultOf } from "../store-request/door.mjs";
import { world } from "./fixture.mjs";
import { aiAccountsOps } from "../../../src/ai-accounts/index.mjs";

const SECRET = "sk-ant-r38-sentinel-ann-7d1f";
/** The disclosure of what connecting means is shown to her first (R23; instance-setup R54), by her own act, as the page does. */
const disclose = async (as) => {
  const who = "member:" + as.handle;
  const d = await as.read("disclosureof", { query: { member: who } });
  return as.act("disclosureshown", { body: { member: who, version: d.version } });
};
/** Her reference as the page reads it: `accountReferenceState` for the member named, asked by that member. */
const held = (as, member = "member:" + as.handle) => as.read("accountreference", { query: { member, viewer: member } }).then((r) => r.held);

test("R38 (K5182) a member sets, reads and removes her own reference through the door, with a body naming no member", async () => {
  const w = await storeWorld({ ai: true, group: null });
  const ann = await w.signIn("ann", { capabilities: ["contribute"] });
  await ann.act("reauth", { body: { password: ann.password } });
  await disclose(ann);
  const set = await ann.act("accountreferenceset", { body: { kind: "apikey", secret: SECRET } });
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(set.kind, "apikey");
  assert.ok(!JSON.stringify(set).includes(SECRET), "the secret is never answered");
  assert.equal(await held(ann), true, "the reference is held for Ann, the member who set it");
  const read = await ann.read("accountreference", { query: { member: "member:ann", viewer: "member:ann" } });
  assert.equal(read.kind, "apikey");
  assert.ok(!JSON.stringify(read).includes(SECRET), "the secret is never answered on read either");
  const removed = await ann.act("accountreferenceremove", { body: {} });
  assert.equal(removed.ok, true, JSON.stringify(removed));
  assert.equal(removed.removed, true, "the reference Ann set is the one removed");
  assert.equal(await held(ann), false, "and no longer held");
});

test("R38 control: a body naming another member acts on the caller's own reference only; a machine credential is refused MACHINE_CANNOT_HOLD_ACCOUNT", async () => {
  const w = await storeWorld({ ai: true, group: null });
  const ann = await w.signIn("ann", { capabilities: ["contribute"] });
  const bob = await w.signIn("bob", { capabilities: ["contribute"] });
  await ann.act("reauth", { body: { password: ann.password } });
  await disclose(ann);
  const set = await ann.act("accountreferenceset", { body: { member: "member:bob", kind: "apikey", secret: SECRET } });
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(await held(ann), true, "the reference lands on Ann, the caller");
  assert.equal(await held(bob), false, "Bob's reference is not set by a body naming him");
  const removed = await ann.act("accountreferenceremove", { body: { member: "member:bob" } });
  assert.equal(removed.removed, true, "removal names Ann's reference, not the body's Bob");
  /* a machine stamp never reaches the member's act at the door (its class is refused there), so the arm is asked directly:
     the stamp is the machine's, the body still names a member, and nothing is written (R1) */
  const operator = await world().group("ann", "bob");
  const machine = await aiAccountsOps(operator.a, new URL("http://x/?op=accountreferenceset&by=class:ai"), { member: "member:ann", kind: "apikey", secret: SECRET }, {}).accountreferenceset();
  assert.equal(machine.reason, "MACHINE_CANNOT_HOLD_ACCOUNT", JSON.stringify(machine));
});
