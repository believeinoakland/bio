/* plane T51 (T51-125; K3807, K3832; K3826, K3829, K3839, K3843, K3853; K4051): the T51 reads reach their handlers through the
   route map (R65, R66), and the composition hands `filings` the environment so its minutes comparisons are registered with
   case-inputs in production. The ops are read from the owners' own maps (`maps.mjs`; K3268), never listed here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, storage } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { filingsOf } from "../../../src/filings/index.mjs";
import { MODULE_MAPS, opsServedBy, servedThroughDoor } from "./maps.mjs";
import { caseInputsOf } from "../../../src/case-inputs/index.mjs";

/* the owners whose maps hold the reads R65 and R66 name, each by module */
const R65_OWNERS = ["capture", "promotion", "entities", "project-roster", "public-read"];
const R66_OWNERS = ["action-holds", "filing-templates", "local-facts"];
const READS = { "action-holds": "holdsdue", "filing-templates": "templatebyhandle", "local-facts": "rulefields", capture: "heldat",
                promotion: "bundlehistory", "public-read": "publishedfrozen", "project-roster": "projectinvitations" };

const refusal = async (x, op) => {
  const res = await x.fetch(`/${op}?viewer=member:nobody&by=member:nobody&author=member:nobody`, { method: "POST", body: "{}" });
  return { status: res.status, ...(await res.json()) };
};
/* the door's answer for an op no map holds: 400, "unknown op" (store-door) */
const unknownOp = (a) => a.status === 400 && /^unknown op/.test(String(a.error));

test("R66 (T51; DEC-340, U366; K3935): `holdsdue`, `templatebyhandle` and `rulefields` are in the route map through their owners' maps, once each, and none answers an unknown op; control: an op added to an owner's map is listed with no edit to a test", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R66_OWNERS);
  for (const owner of R66_OWNERS) {
    assert.ok(served.some(([op, o]) => o === owner && op === READS[owner]), `${owner} serves ${READS[owner]}`);
    assert.equal(keys.filter((k) => k === READS[owner]).length, 1, `${READS[owner]} once in the route map`);
    assert.equal(unknownOp(await refusal(x, READS[owner])), false, `${READS[owner]} is not an unknown op`);
  }
  const { failed } = await servedThroughDoor(x, twin, R66_OWNERS);
  assert.deepEqual(failed, []);
  /* control: a module added to the maps in test lists its ops with no edit to a list here */
  MODULE_MAPS.push(["zz-owner", () => ({ zzop: () => null })]);
  try { assert.deepEqual(opsServedBy(x.ctx, u, x.env, ["zz-owner"]), [["zzop", "zz-owner"]]); }
  finally { MODULE_MAPS.pop(); }
});

test("R65 (T51; op-declarations R77; K3826, K3829, K3839, K3843, K3853): the T51 reads (`heldat`, `bundlehistory`, the entity reads, `projectinvitations`, `publishedfrozen`) are in the route map through their owners' maps, each key once, and answer through control-plane's door what the owner's map answers; the plane registers nothing for them", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R65_OWNERS);
  for (const owner of R65_OWNERS) assert.ok(served.some(([op, o]) => o === owner && op === READS[owner]) || owner === "entities", `${owner} serves ${READS[owner]}`);
  assert.ok(served.filter(([, o]) => o === "entities").length >= 3, "entities' reads");
  for (const [op, owner] of served) {
    assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
    assert.equal(unknownOp(await refusal(x, op)), false, `${op} is not an unknown op`);
  }
  const { failed } = await servedThroughDoor(x, twin, R65_OWNERS);
  assert.deepEqual(failed, []);
  /* control: an op no owner's map holds is no route */
  assert.equal(keys.includes("zzprobe51"), false);
  assert.equal(unknownOp(await refusal(x, "zzprobe51")), true, "control: the door does answer an unknown op so");
});

test("R5 (T51; K4051; filings R64): the composition hands `filings` the environment, so the plane's case-inputs holds the minutes comparisons source filings registers", async () => {
  const x = await store();
  assert.deepEqual(caseInputsOf(x.ctx).minutesComparisonsSource(), { registered: true, module: "filings" });
  /* control: on a bare host, filings handed neither `env` nor `caseInputs` registers none */
  const { ctx } = storage();
  recordOf(ctx).migrate();
  filingsOf(ctx, {});
  assert.equal(caseInputsOf(ctx).minutesComparisonsSource().registered, false);
});

test("R5 (T51; K4098; control-plane R110): the owner map is handed filings' and action-plans' instances, so `approvedunsent` (filings R53) and `checkpointsdue` (action-plans R17) answer through the plane; control: an op neither serves is the door's refusal", async () => {
  const x = await store();
  for (const op of ["approvedunsent", "checkpointsdue"]) {
    const res = await x.fetch(`/${op}?viewer=member:nobody&by=member:nobody&project=PROJ-2026-none`);
    const body = await res.json();
    assert.equal(res.status, 200, `${op}: ${JSON.stringify(body)}`);
    assert.equal(body.ok, true, op);
    assert.equal(/not a function|undefined/.test(JSON.stringify(body)), false, `${op}: an owner was reached`);
  }
  assert.equal(unknownOp(await refusal(x, "zzprobe51b")), true);
});
