/* op-grades, fix round 3 (T51; cause-shell-3, C64): the grades of the acts the `request` screen and the settings screen send.
   `entitycreate` is a member's act on the `request` screen only (`entities` R63); `scanmirror` (`file-safety` R49) and `officeconfirm`
   (`entities` R64) are administrators' acts, graded from their owners' declarations (R49, R50) as BOB's reading states: `scanmirror`
   under the ground `substrate`, `officeconfirm` Reasoned. Until the owners merge, a scripted double of their declared rows stands
   in; once they have, the owners' own rows are read and must agree. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUNGS, RUNG_ABSENT, NON_ACTS, MEMBER_SCREEN_ACTS, memberMayDo, phoneOf } from "../../../src/op-grades/index.mjs";
import { collectDeclaredOps } from "./declared.mjs";

const here = new URL("../../../../", import.meta.url).pathname;
const owners = await collectDeclaredOps(here);
const DOUBLE = {
  "file-safety": { scanmirror: { classes: ["admin", "member"], mutating: true, weight: "substrate", description: "double: an administrator starts a signature run" } },
  entities: { officeconfirm: { classes: ["admin", "member"], mutating: true, weight: "reasoned", description: "double: an administrator confirms an office a member named" } },
};
async function registered() {
  const m = await import(`../../../src/op-grades/index.mjs?cause3=${Math.random()}`);
  const byOwner = {};
  for (const [op, row] of Object.entries(owners.ops)) (byOwner[owners.owners[op]] ??= {})[op] = row;
  for (const [mod, rows] of Object.entries(DOUBLE)) for (const [op, row] of Object.entries(rows)) if (!(op in owners.ops)) (byOwner[mod] ??= {})[op] = row;
  m.registerDeclaredOps(byOwner);
  return m;
}

test("C64 a member's entitycreate is admitted from the request screen and refused from any other; control: other ops are admitted nowhere by it, and entitycreate's weight is unchanged", () => {
  assert.deepEqual(MEMBER_SCREEN_ACTS, { entitycreate: ["request"] });
  assert.equal(memberMayDo("entitycreate", "request"), true);
  for (const screen of ["people", "places", "setup", "proceeding", "home", "", undefined]) assert.equal(memberMayDo("entitycreate", screen), false, String(screen));
  assert.equal(memberMayDo("entityalias", "request"), false, "no other op is admitted by it");
  assert.equal(memberMayDo("scanmirror", "request"), false);
  assert.equal(RUNGS.entitycreate, "reasoned", "the grade of entitycreate itself is unchanged");
  assert.throws(() => { MEMBER_SCREEN_ACTS.entitycreate.push("people"); }, TypeError, "frozen");
});

test("C64 scanmirror is graded under the ground substrate and officeconfirm Reasoned, from their owners' declarations (a scripted double until the owners merge); control: other ops' grades are unchanged", async () => {
  const m = await registered();
  assert.equal(m.RUNG_ABSENT.scanmirror.ground, "substrate");
  assert.equal(m.RUNGS.scanmirror, undefined, "an administrator's maintenance act has no rung");
  assert.equal(m.RUNGS.officeconfirm, "reasoned");
  assert.equal(m.RUNG_ABSENT.officeconfirm, undefined);
  for (const op of ["scanmirror", "officeconfirm"]) assert.equal(typeof m.NON_ACTS[op] === "string" || m.NON_ACTS[op] === undefined, true, op);
  assert.equal(m.phoneOf("scanmirror"), true);
  assert.equal(m.phoneOf("officeconfirm"), true);
  /* control: nothing else moved */
  for (const op of ["entitycreate", "expertiseconfirm", "contradictionflag", "adminendorse"]) assert.equal(m.RUNGS[op], RUNGS[op], op);
  for (const [op, rung] of Object.entries({ ...RUNGS })) assert.equal(m.RUNGS[op], rung, `${op}: a hand row is unchanged`);
  for (const [op, row] of Object.entries({ ...RUNG_ABSENT })) assert.deepEqual(m.RUNG_ABSENT[op], row, `${op}: a hand row is unchanged`);
  assert.equal(phoneOf("entitycreate"), true);
  assert.ok(NON_ACTS.entitycreate);
});

test("B3 (money R28) moneysets, a read its owner declares beside moneyset, has a hand row that agrees with the owner's declaration (R49, R50; registration refuses a disagreement): a NON_ACTS read reason, no rung, no ground; control: moneyset's hand row is unchanged", async () => {
  assert.ok(NON_ACTS.moneysets.startsWith("read: "));
  const m = await registered();
  assert.equal(m.NON_ACTS.moneysets, NON_ACTS.moneysets);
  assert.ok(m.NON_ACTS.moneysets.startsWith("read: ") && m.NON_ACTS.moneysets.endsWith("writes nothing"));
  assert.equal(m.RUNGS.moneysets, undefined);
  assert.equal(m.RUNG_ABSENT.moneysets, undefined);
  assert.equal(m.phoneOf("moneysets"), true);
  assert.equal(m.NON_ACTS.moneyset, NON_ACTS.moneyset);
  assert.ok(NON_ACTS.moneyset.startsWith("read: one money set"));
});
