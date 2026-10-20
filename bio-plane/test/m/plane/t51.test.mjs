/* plane T51 (T51-125; K3807, K3832; K3826, K3829, K3839, K3843, K3853; K4051): the T51 reads reach their handlers through the
   route map (R65, R66), and the composition hands `filings` the environment so its minutes comparisons are registered with
   case-inputs in production. The ops are read from the owners' own maps (`maps.mjs`; K3268), never listed here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, storage } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { filingsOf } from "../../../src/filings/index.mjs";
import { MODULE_MAPS, opsServedBy, servedThroughDoor } from "./maps.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { caseInputsOf } from "../../../src/case-inputs/index.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";

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

/* R69, R70 (T51; K4213): capture-sources' credential ops and investigation's `projectclose` are spread from their owners' maps,
   each key once, and answer through the door as the owners' own maps do. A machine credential is refused the credential ops. */
const R69_OWNERS = ["capture-sources"], R70_OWNERS = ["investigation"];

test("R69 (T51; C20; K4168): each op of `captureSourcesOps` is in the route map once, answers through control-plane's door what the owner's map answers, and a machine credential is refused each", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R69_OWNERS);
  assert.ok(served.length >= 3, "the three credential ops are served");
  for (const [op, owner] of served) {
    assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
    assert.equal(unknownOp(await refusal(x, op)), false, `${op} is not an unknown op`);
    const machine = await (await x.fetch(`/${op}?viewer=class:admin&by=class:admin`, { method: "POST", body: "{}" })).json();
    assert.notEqual(machine.ok === true && machine.result && machine.result.ok === true, true, `${op}: a machine credential is refused`);
  }
  const { failed } = await servedThroughDoor(x, twin, R69_OWNERS);
  assert.deepEqual(failed, []);
  /* control: an op no owner's map holds is no route */
  assert.equal(unknownOp(await refusal(x, "zzprobe69")), true);
});

test("R70 (T51; C65; K4168): each op of `investigationOps` is in the route map once and answers through control-plane's door what the owner's map answers; a non-owner's close is the owner arm's refusal", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R70_OWNERS);
  assert.ok(served.some(([op]) => op === "projectclose"), "projectclose is served");
  for (const [op, owner] of served) {
    assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
    assert.equal(unknownOp(await refusal(x, op)), false, `${op} is not an unknown op`);
  }
  const { failed } = await servedThroughDoor(x, twin, R70_OWNERS);
  assert.deepEqual(failed, []);
  /* a close by someone who owns no such project is refused by the owner's arm, inside the door's envelope */
  const res = await (await x.fetch("/projectclose?viewer=member:nobody&by=member:nobody", { method: "POST",
    body: JSON.stringify({ project: "PROJ-2026-none", reason: "resolved" }) })).json();
  assert.equal(res.ok, true);
  assert.equal(res.result.ok, false);
});

test("R17, R5 (T51; K4221; case-inputs R24): case-inputs' public read `casedetailspublic` is registered at start under its name and answers through the public-read door; a second registration is refused", async () => {
  const x = await store();
  const reads = publicReadOf(x.ctx).publicReads().filter((r) => r.module === "case-inputs").map((r) => r.name);
  assert.deepEqual(reads, ["casedetailspublic"]);
  assert.equal(publicReadOf(x.ctx).registerPublicReads("zz-probe", { casedetailspublic: () => ({}) }).ok, false);
  const got = await (await x.fetch("/publicread?name=casedetailspublic&case=CASE-2026-none")).json();
  assert.equal(got.ok, true);
  assert.equal(got.result.module, "case-inputs");
  /* control: a name no module registered is no read */
  const none = await (await x.fetch("/publicread?name=zzprobe")).json();
  assert.notEqual(none.result && none.result.module, "case-inputs");
});

test("R5 (T51; K4213, K4219): link-sweep's arms are handed the request body, as their neighbours' are: the door answers `sweepratify` for the sweep the body names, not its missing argument", async () => {
  const x = await store();
  const ask = async (body) => (await (await x.fetch("/sweepratify?viewer=member:nobody&author=member:nobody", { method: "POST", body })).json()).result;
  assert.equal((await ask(JSON.stringify({ sweep: "SWEEP-2026-none", ratified: true }))).reason, "ABSENT");
  /* control: a body naming no sweep is the argument's own refusal */
  assert.equal((await ask("{}")).code, "REQUIRED_ARGUMENT_MISSING");
});

/* R73 (T51; K4231, K4234; control-plane R115, acquisition R95): the stage times of an `acquire` the door stopped waiting for are read from the
   object: the route map holds the call's timings object under the door's `trace`, and `acquiretimings` answers the stages that ran and the
   one running. The holder is bounded, and a call without a trace holds nothing. */
test("R73 (T51; K4231, K4234): a stalled `acquire` through the route map answers, by its trace, the stage it is running; after it ends the stages that ran; control: another trace, none, and no trace hold nothing", async () => {
  const { acquireTimingsOf, HOLD_MAX } = await import("../../../src/plane/acquire-timings.mjs");
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const real = globalThis.fetch;
  let release; const gate = new Promise((r) => { release = r; });
  globalThis.fetch = async () => { await gate; return new Response("x", { headers: { "content-type": "text/plain" } }); };
  const ask = async (path, init) => (await x.fetch(path, init)).json();
  let call;
  try {
    call = x.fetch("/acquire?trace=T-73&cls=admin&store=bio", { method: "POST", body: JSON.stringify({ locator: "https://example.org/stalled" }) });
    for (let i = 0; i < 50 && acquireTimingsOf(x.ctx).size === 0; i++) await new Promise((r) => setTimeout(r, 10));
    const during = await ask("/acquiretimings?trace=T-73");
    assert.equal(during.ok, true);
    assert.ok(during.result.timings && during.result.timings.total_ms >= 0, JSON.stringify(during));
    assert.equal(typeof during.result.timings.running, "string", "the stage running when the door looked");
    /* controls: another trace holds nothing */
    assert.equal((await ask("/acquiretimings?trace=T-other")).result.timings, null);
    assert.equal((await ask("/acquiretimings")).result.timings, null);
  } finally { release(); await call; globalThis.fetch = real; }
  const after = await ask("/acquiretimings?trace=T-73");
  assert.equal(after.result.timings.running, undefined, "nothing running once it ended");
  assert.ok(Object.keys(after.result.timings.stages).length > 0, "the stages that ran");
  /* no trace: the arm still gets a fresh object, held nowhere */
  const h = acquireTimingsOf(x.ctx), before = h.size;
  h.open(null); h.open("");
  assert.equal(h.size, before);
  /* the holder is bounded */
  for (let i = 0; i < HOLD_MAX + 20; i++) h.open(`T-fill-${i}`);
  assert.ok(h.size <= HOLD_MAX, `held ${h.size}`);
});
