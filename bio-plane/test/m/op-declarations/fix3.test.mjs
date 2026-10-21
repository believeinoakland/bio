/* op-declarations, T51 fix round 3 (fix-round-3-T51.md section 4; K4369, K4208): the three causes this job meets.
   Each test names the requirement it proves and carries its control. Specs, sets and stamps are read from the exported
   tables; the owners' declared rows are read from their own `DECLARED_OPS`, so an agreement (R81) is seen, not assumed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "../../../src/op-declarations/index.mjs";
import { DECLARED_OPS as DOORBELL_DECLARED } from "../../../src/doorbell/index.mjs";
import { DECLARED_OPS as MONEY_DECLARED } from "../../../src/money/index.mjs";

const { OPS, SESSION_OPS, NEEDS, OP_STAMPS, OP_ALIASES } = O;
const MP = ["admin", "member", "probe"];
const plain = (s) => JSON.parse(JSON.stringify(s));

test("R21, R6 (T51 fix round 3, cause 2; DOORBELL #6): the inbox's list is declared as `inboxlist`, the name doorbell routes it by; its row here agrees with doorbell's in class and mutation (R81), and no session set names `inbox`, which is the plane's route name and not an op (negative control: a session-set name with no spec is seen)", () => {
  assert.ok(Object.hasOwn(OPS, "inboxlist"));
  assert.deepEqual(plain(OPS.inboxlist.classes), MP);
  assert.equal(OPS.inboxlist.mutating, false);
  /* the census agrees with the owner's declaration */
  assert.ok(Object.hasOwn(DOORBELL_DECLARED, "inboxlist"));
  assert.deepEqual([...DOORBELL_DECLARED.inboxlist.classes].sort(), [...OPS.inboxlist.classes].sort());
  assert.equal(DOORBELL_DECLARED.inboxlist.mutating, OPS.inboxlist.mutating);
  /* the session sets name the list by its op */
  assert.ok(SESSION_OPS.member.has("inboxlist") && SESSION_OPS.admin.has("inboxlist"));
  assert.ok(!SESSION_OPS.member.has("inbox") && !SESSION_OPS.admin.has("inbox"));
  assert.ok([...SESSION_OPS.member].every((op) => Object.hasOwn(OPS, op)), "every member name is specced");
  /* control: `inbox` is no alias, since an alias names a registry act and the screens name none `inbox`; the plane's route maps it */
  assert.ok(!Object.hasOwn(OP_ALIASES, "inbox"));
});

test("R17, R19, R20 (T51 fix round 3, cause 1; MONEY #6; K4369): `moneysets`, the read money serves, has its spec in money's family: classes admin, member and probe, not mutating, `viewer` stamped, its NEEDS row null, in both session sets; money's own declared row agrees (R81). Negative control: a read of money with no spec is seen", () => {
  assert.ok(Object.hasOwn(OPS, "moneysets"), "moneysets has a spec");
  assert.deepEqual(plain(OPS.moneysets.classes), MP);
  assert.equal(OPS.moneysets.mutating, false);
  assert.ok(Object.hasOwn(NEEDS, "moneysets") && NEEDS.moneysets === null, "a read's NEEDS row is null");
  assert.ok(SESSION_OPS.member.has("moneysets") && SESSION_OPS.admin.has("moneysets"));
  assert.deepEqual([...OP_STAMPS.moneysets], ["viewer"]);
  assert.deepEqual([...MONEY_DECLARED.moneysets.classes].sort(), [...OPS.moneysets.classes].sort());
  assert.equal(MONEY_DECLARED.moneysets.mutating, OPS.moneysets.mutating);
  /* control: a sibling read of money in the same family has the same shape, and a write of money still needs contribute */
  assert.ok(Object.hasOwn(NEEDS, "committedagainstpaid") && NEEDS.committedagainstpaid === null);
  assert.equal(NEEDS.moneyrecord, "contribute");
});
