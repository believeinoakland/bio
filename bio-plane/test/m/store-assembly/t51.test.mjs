/* store-assembly's copy of plane's T51 test (T51-125; K3807, K3832; K3826, K3829, K3839, K3843, K3853; K4051): the T51 reads reach their handlers through the
   route map (R43, R44), and the composition hands `filings` the environment so its minutes comparisons are registered with
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

/* the owners whose maps hold the reads R43 and R44 name, each by module */
const R43_OWNERS = ["capture", "promotion", "entities", "project-roster", "public-read"];
const R44_OWNERS = ["action-holds", "filing-templates", "local-facts"];
const READS = { "action-holds": "holdsdue", "filing-templates": "templatebyhandle", "local-facts": "rulefields", capture: "heldat",
                promotion: "bundlehistory", "public-read": "publishedfrozen", "project-roster": "projectinvitations" };

const refusal = async (x, op) => {
  const res = await x.fetch(`/${op}?viewer=member:nobody&by=member:nobody&author=member:nobody`, { method: "POST", body: "{}" });
  return { status: res.status, ...(await res.json()) };
};
/* the door's answer for an op no map holds: 400, "unknown op" (store-door) */
const unknownOp = (a) => a.status === 400 && /^unknown op/.test(String(a.error));

test("R44 (T51; DEC-340, U366; K3935): `holdsdue`, `templatebyhandle` and `rulefields` are in the route map through their owners' maps, once each, and none answers an unknown op; control: an op added to an owner's map is listed with no edit to a test", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R44_OWNERS);
  for (const owner of R44_OWNERS) {
    assert.ok(served.some(([op, o]) => o === owner && op === READS[owner]), `${owner} serves ${READS[owner]}`);
    assert.equal(keys.filter((k) => k === READS[owner]).length, 1, `${READS[owner]} once in the route map`);
    assert.equal(unknownOp(await refusal(x, READS[owner])), false, `${READS[owner]} is not an unknown op`);
  }
  const { failed } = await servedThroughDoor(x, twin, R44_OWNERS);
  assert.deepEqual(failed, []);
  /* control: a module added to the maps in test lists its ops with no edit to a list here */
  MODULE_MAPS.push(["zz-owner", () => ({ zzop: () => null })]);
  try { assert.deepEqual(opsServedBy(x.ctx, u, x.env, ["zz-owner"]), [["zzop", "zz-owner"]]); }
  finally { MODULE_MAPS.pop(); }
});

test("R43 (T51; op-declarations R77; K3826, K3829, K3839, K3843, K3853): the T51 reads (`heldat`, `bundlehistory`, the entity reads, `projectinvitations`, `publishedfrozen`) are in the route map through their owners' maps, each key once, and answer through control-plane's door what the owner's map answers; the plane registers nothing for them", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R43_OWNERS);
  for (const owner of R43_OWNERS) assert.ok(served.some(([op, o]) => o === owner && op === READS[owner]) || owner === "entities", `${owner} serves ${READS[owner]}`);
  assert.ok(served.filter(([, o]) => o === "entities").length >= 3, "entities' reads");
  for (const [op, owner] of served) {
    assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
    assert.equal(unknownOp(await refusal(x, op)), false, `${op} is not an unknown op`);
  }
  const { failed } = await servedThroughDoor(x, twin, R43_OWNERS);
  assert.deepEqual(failed, []);
  /* control: an op no owner's map holds is no route */
  assert.equal(keys.includes("zzprobe51"), false);
  assert.equal(unknownOp(await refusal(x, "zzprobe51")), true, "control: the door does answer an unknown op so");
});

test("R6 (T51; K4051; filings R64): the composition hands `filings` the environment, so the plane's case-inputs holds the minutes comparisons source filings registers", async () => {
  const x = await store();
  assert.deepEqual(caseInputsOf(x.ctx).minutesComparisonsSource(), { registered: true, module: "filings" });
  /* control: on a bare host, filings handed neither `env` nor `caseInputs` registers none */
  const { ctx } = storage();
  recordOf(ctx).migrate();
  filingsOf(ctx, {});
  assert.equal(caseInputsOf(ctx).minutesComparisonsSource().registered, false);
});

test("R6 (T51; K4098; control-plane R110): the owner map is handed filings' and action-plans' instances, so `approvedunsent` (filings R53) and `checkpointsdue` (action-plans R17) answer through the plane; control: an op neither serves is the door's refusal", async () => {
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

/* R45, R46 (T51; K4213): capture-sources' credential ops and investigation's `projectclose` are spread from their owners' maps,
   each key once, and answer through the door as the owners' own maps do. A machine credential is refused the credential ops. */
const R45_OWNERS = ["capture-sources"], R46_OWNERS = ["investigation"];

test("R45 (T51; C20; K4168): each op of `captureSourcesOps` is in the route map once, answers through control-plane's door what the owner's map answers, and a machine credential is refused each", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R45_OWNERS);
  assert.ok(served.length >= 3, "the three credential ops are served");
  for (const [op, owner] of served) {
    assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
    assert.equal(unknownOp(await refusal(x, op)), false, `${op} is not an unknown op`);
    const machine = await (await x.fetch(`/${op}?viewer=class:admin&by=class:admin`, { method: "POST", body: "{}" })).json();
    assert.notEqual(machine.ok === true && machine.result && machine.result.ok === true, true, `${op}: a machine credential is refused`);
  }
  const { failed } = await servedThroughDoor(x, twin, R45_OWNERS);
  assert.deepEqual(failed, []);
  /* control: an op no owner's map holds is no route */
  assert.equal(unknownOp(await refusal(x, "zzprobe69")), true);
});

test("R46 (T51; C65; K4168): each op of `investigationOps` is in the route map once and answers through control-plane's door what the owner's map answers; a non-owner's close is the owner arm's refusal", async () => {
  const u = new URL("http://do/");
  const x = await store(), twin = await store();
  const keys = Object.keys(x.s.routes(u, null));
  const served = opsServedBy(x.ctx, u, x.env, R46_OWNERS);
  assert.ok(served.some(([op]) => op === "projectclose"), "projectclose is served");
  for (const [op, owner] of served) {
    assert.equal(keys.filter((k) => k === op).length, 1, `${op} (${owner}) once in the route map`);
    assert.equal(unknownOp(await refusal(x, op)), false, `${op} is not an unknown op`);
  }
  const { failed } = await servedThroughDoor(x, twin, R46_OWNERS);
  assert.deepEqual(failed, []);
  /* a close by someone who owns no such project is refused by the owner's arm, inside the door's envelope */
  const res = await (await x.fetch("/projectclose?viewer=member:nobody&by=member:nobody", { method: "POST",
    body: JSON.stringify({ project: "PROJ-2026-none", reason: "resolved" }) })).json();
  assert.equal(res.ok, true);
  assert.equal(res.result.ok, false);
});

test("R15, R6 (T51; K4221; case-inputs R24): case-inputs' public read `casedetailspublic` is registered at start under its name and answers through the public-read door; a second registration is refused", async () => {
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

test("R6 (T51; K4213, K4219): link-sweep's arms are handed the request body, as their neighbours' are: the door answers `sweepratify` for the sweep the body names, not its missing argument", async () => {
  const x = await store();
  const ask = async (body) => (await (await x.fetch("/sweepratify?viewer=member:nobody&author=member:nobody", { method: "POST", body })).json()).result;
  assert.equal((await ask(JSON.stringify({ sweep: "SWEEP-2026-none", ratified: true }))).reason, "ABSENT");
  /* control: a body naming no sweep is the argument's own refusal */
  assert.equal((await ask("{}")).code, "REQUIRED_ARGUMENT_MISSING");
});

/* R60 (T51; K4231, K4234, K4236; control-plane R115, capture R99, acquisition R95): the stage times of an `acquire` the door stopped waiting
   for are read from the object. The door hands its `trace` to capture's arm (`gatedOp`), which sends it as the header
   `x-civicsmith-trace`; the object holds the call's timings under it, and the store-internal read `acquiretimings` answers
   `{ok: true, stageTimes}` for that trace. The holder is bounded; a call without the header holds nothing, and a trace in the address
   is nobody's key. */
test("R60 (T51; K4236): door -> captureOp header -> the object's timings under the trace -> `acquiretimings`: a stalled `acquire` is read while it runs and after it ends; controls: another trace, none, an address trace, an unkeyed call, the bound", async () => {
  const { acquireTimingsOf, HOLD_MAX } = await import("../../../src/store-assembly/acquire-timings.mjs");
  const { TRACE_HEADER } = await import("../../../src/signin-door/index.mjs");
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const real = globalThis.fetch;
  let release; const gate = new Promise((r) => { release = r; });
  globalThis.fetch = async () => { await gate; return new Response("x", { headers: { "content-type": "text/plain" } }); };
  const read = async (trace) => (await (await x.fetch(`/acquiretimings${trace === undefined ? "" : `?trace=${trace}`}`)).json()).result;
  /* the door's arm (`gatedOp`, the Worker's) sends the trace as the header capture's arm names; the assembled store is reached with it */
  const viaDoor = (trace) => x.fetch("/acquire?cls=admin&store=bio", { method: "POST", body: JSON.stringify({ locator: "https://example.org/stalled" }),
    headers: trace === undefined ? {} : { [TRACE_HEADER]: trace } });
  let call;
  try {
    call = viaDoor("T-73");
    for (let i = 0; i < 100 && acquireTimingsOf(x.ctx).size === 0; i++) await new Promise((r) => setTimeout(r, 10));
    const during = await read("T-73");
    assert.equal(during.ok, true);
    assert.ok(during.stageTimes && during.stageTimes.total_ms >= 0, JSON.stringify(during));
    assert.equal(typeof during.stageTimes.running, "string", "the stage running when the door looked");
    assert.equal((await read("T-other")).stageTimes, null);
    assert.equal((await read()).stageTimes, null);
  } finally { release(); await call; globalThis.fetch = real; }
  const after = (await read("T-73")).stageTimes;
  assert.equal(after.running, undefined, "nothing running once it ended");
  assert.ok(Object.keys(after.stages).length > 0, "the stages that ran");
  /* control: no trace handed, nothing held; a trace in the address is not a key */
  const h = acquireTimingsOf(x.ctx), before = h.size;
  globalThis.fetch = async () => new Response("x", { headers: { "content-type": "text/plain" } });
  try {
    await viaDoor(undefined);
    await x.fetch("/acquire?trace=T-forged&cls=admin&store=bio", { method: "POST", body: JSON.stringify({ locator: "https://example.org/other" }) });
  } finally { globalThis.fetch = real; }
  assert.equal(h.size, before);
  assert.equal((await read("T-forged")).stageTimes, null);
  h.open(null); h.open("");
  assert.equal(h.size, before);
  for (let i = 0; i < HOLD_MAX + 20; i++) h.open(`T-fill-${i}`);
  assert.ok(h.size <= HOLD_MAX, `held ${h.size}`);
});
