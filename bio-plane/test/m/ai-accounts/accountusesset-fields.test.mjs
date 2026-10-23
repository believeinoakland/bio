/* ai-accounts R37 (T51; K4206): `accountUsesSet` refuses a request that does not give its owner, its switch or its `on`
   naming the field it lacks (P8), each refusal writing nothing; the refusals a request that gives every field gets are
   unchanged (the control). At the module's interface over the real membership fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

/* a refusal names a field as a whole word of its code or detail, as declaredOpHolds does by default */
const named = (answer, field) => new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test(`${answer.code} ${answer.detail}`);

test("R37 accountUsesSet refuses a request with no owner, no switch or no on, each naming the field, writing nothing", async () => {
  const w = await world().group("ann", "bob");
  const before = w.snapshot();
  const noOwner = await w.c.accountUsesSet({ switch: "ask", on: true, by: "ann" });
  assert.equal(noOwner.code, "NOT_YOUR_ACCOUNT");
  assert.ok(named(noOwner, "owner"), noOwner.detail);
  /* the switch is judged before the account is looked for: an absent switch is refused although ann holds no account */
  const noSwitch = await w.c.accountUsesSet({ owner: "member:ann", on: true, by: "ann" });
  assert.equal(noSwitch.code, "UNKNOWN_SWITCH");
  assert.ok(named(noSwitch, "switch"), noSwitch.detail);
  const noOn = await w.c.accountUsesSet({ owner: "member:ann", switch: "ask", by: "ann" });
  assert.equal(noOn.code, "SWITCH_VALUE_INVALID");
  assert.ok(named(noOn, "on"), noOn.detail);
  const noOnExplore = await w.c.accountUsesSet({ owner: "member:ann", switch: "explore", by: "ann" });
  assert.equal(noOnExplore.code, "SWITCH_VALUE_INVALID");
  assert.ok(named(noOnExplore, "on"), noOnExplore.detail);
  assert.deepEqual(w.snapshot(), before);
});

test("R37 control: a request that gives its owner, switch and on is refused as before, naming nothing it did not name", async () => {
  const w = await world().group("ann", "bob");
  /* an owner no part of this module knows: the generic refusal, unchanged */
  const unknownOwner = await w.c.accountUsesSet({ owner: "bogus", switch: "ask", on: true, by: "ann" });
  assert.equal(unknownOwner.code, "NOT_YOUR_ACCOUNT");
  assert.equal(named(unknownOwner, "owner"), false);
  /* a machine with no owner keeps its refusal: no member stands behind it */
  const machine = await w.c.accountUsesSet({ switch: "ask", on: true, by: null });
  assert.equal(machine.code, "MACHINE_CANNOT_HOLD_ACCOUNT");
  /* a switch no account holds: the list of names, unchanged */
  const unknownSwitch = await w.c.accountUsesSet({ owner: "member:ann", switch: "bogus", on: true, by: "ann" });
  assert.equal(unknownSwitch.code, "UNKNOWN_SWITCH");
  assert.match(unknownSwitch.detail, /^the switches are /);
  /* a value outside what the switch takes: the values, unchanged */
  const badValue = await w.c.accountUsesSet({ owner: "member:ann", switch: "ask", on: "yes", by: "ann" });
  assert.equal(badValue.code, "SWITCH_VALUE_INVALID");
  assert.match(badValue.detail, /^the ask switch takes true, false\./);
  /* a named member who holds no account: NO_ACCOUNT, as before */
  const none = await w.c.accountUsesSet({ owner: "member:ann", switch: "ask", on: true, by: "ann" });
  assert.equal(none.code, "NO_ACCOUNT");
});
