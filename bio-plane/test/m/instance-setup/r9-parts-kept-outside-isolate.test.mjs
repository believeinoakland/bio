/* Fix round 9 (G118b; K4853) at the module's interface: R104 the fleet's versions are asked at most once a minute for the whole copy,
   not once a minute per isolate. A Worker is served from many isolates, so two different environments stand for two isolates here, over
   one object (one storage, one clock). The bindings count their calls across both. The walker's case (re-walk 8 A, G118): six of ten
   `op=bootstrap` calls 2.5 s apart paid the fleet's ask (`fleet;dur` 423-662 ms), the other four were kept: the calls that missed reached
   an isolate that held no entry. The log (R-LOG): `isolate` states which isolate answered. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, stubOver, io, read } from "./fixture.mjs";
import { bootstrapReport, PARTS_KEPT_MS, BOOTSTRAP_FACT_KEYS } from "../../../src/setup.mjs";

const SECOND = 1000;
const storeAnswer = { claimed: false, rearmed: false, consumedAt: null, storeVersion: "s-1" };
const PARTS = ["part_signin", "part_scanner", "part_safe_view"];

/* The fleet as bindings: each counts its calls, whichever isolate's environment asked; `hang` makes an environment's bindings never answer. */
function fleet() {
  const calls = { AGENT_WORKER: 0, FILE_SCANNER: 0 };
  const member = (binding, name, extra = {}, hang = false) => ({
    async fetch() {
      calls[binding] += 1;
      if (hang) await new Promise(() => {});
      return Response.json({ name, version: "1.0.0", ...extra });
    },
  });
  /* each call is a new isolate's environment: its own object, its own bindings, the shared counters */
  return { calls, env: ({ hang = false } = {}) => ({ VERSION: "plane-9",
    AGENT_WORKER: member("AGENT_WORKER", "agent-worker", { runner: true }, hang), FILE_SCANNER: member("FILE_SCANNER", "file-scanner", {}, hang) }) };
}
const clockAt = (start) => { let t = start; const now = () => t; now.advance = (ms) => { t += ms; }; return now; };

/* One object, answering through this module's own frame; every path the Worker visits is recorded with its method. */
async function theObject(now, more = {}, silent = []) {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" }, now, more });
  const paths = [];
  const inner = stubOver(w.m, { bootstrap: () => storeAnswer }, { silent });
  const stub = { fetch: async (input, init) => { const req = input instanceof Request ? input : new Request(input, init);
    paths.push(new URL(req.url).pathname.slice(1) + (req.method === "POST" ? " POST" : "")); return inner.fetch(req, init); } };
  return { w, stub, paths };
}
const ask = async (env, stub, extra = {}) => (await read(await bootstrapReport(env, "fp", { stub, ...io, ...extra }))).body;

test("R104 two different environments (two isolates) over one object within a minute ask each fleet binding once in all; past the minute, once more", async () => {
  const now = clockAt(Date.parse("2026-10-24T10:00:00Z"));
  const { stub } = await theObject(now);
  const f = fleet();
  const first = await ask(f.env(), stub, { now });
  now.advance(2.5 * SECOND);
  const second = await ask(f.env(), stub, { now });
  assert.deepEqual(f.calls, { AGENT_WORKER: 1, FILE_SCANNER: 1 }, "red before the fix: 2 each, one ask for each isolate");
  assert.deepEqual([first.part_signin, first.part_scanner, first.part_safe_view], [true, true, true]);
  for (const k of PARTS) assert.equal(second[k], first[k], `${k}: the second isolate states the first's`);
  /* a third and a fourth isolate, still inside the minute counted from the ask, ask nothing */
  now.advance(50 * SECOND);
  await ask(f.env(), stub, { now });
  assert.deepEqual(f.calls, { AGENT_WORKER: 1, FILE_SCANNER: 1 }, "52.5 s after the ask");
  now.advance(10 * SECOND);
  await ask(f.env(), stub, { now });
  assert.deepEqual(f.calls, { AGENT_WORKER: 2, FILE_SCANNER: 2 }, "past 60 s after the ask: once more, in all");
  now.advance(5 * SECOND);
  await ask(f.env(), stub, { now });
  assert.deepEqual(f.calls, { AGENT_WORKER: 2, FILE_SCANNER: 2 }, "and the new ask is kept for the next isolate");
  assert.equal(PARTS_KEPT_MS, 60_000);
});

test("R104 an isolate that finds the object's keep does not wait for the fleet (its bindings never answer), states fleet;dur 0, and reads it in the visit a signed-in caller already makes", async () => {
  const now = clockAt(Date.parse("2026-10-24T10:00:00Z"));
  const { stub, paths } = await theObject(now);
  const f = fleet();
  await ask(f.env(), stub, { now, caller: { cls: "admin" } });
  paths.length = 0;
  const entries = [];
  const t0 = Date.now();
  const second = await Promise.race([
    ask(f.env({ hang: true }), stub, { now, caller: { cls: "admin" }, stateTiming: (name, ms) => entries.push([name, ms]) }),
    new Promise((r) => setTimeout(() => r("waited"), 1500)),
  ]);
  assert.notEqual(second, "waited", "the second isolate waited for a fleet that never answers");
  assert.ok(Date.now() - t0 < 1000);
  assert.equal(second.part_scanner, true);
  assert.equal(entries.find(([n]) => n === "fleet")[1], 0, "kept: fleet;dur is 0");
  /* the hop count of a signed-in caller does not grow: /bootstrap and one /bootstrapfacts, no write */
  assert.deepEqual(paths.slice().sort(), ["bootstrap", "bootstrapfacts"]);
  for (const k of BOOTSTRAP_FACT_KEYS) assert.ok(k in second, k);
});

test("R104 the object keeps three flat values with the object's own time: refused if anything else; past the minute by the object's clock it keeps none; a stranger's visit is answered the parts only", async () => {
  const now = clockAt(Date.parse("2026-10-24T10:00:00Z"));
  const w = await boot({ now });
  assert.equal(w.m.keptFleetParts(), null, "none kept yet");
  assert.deepEqual(w.m.keepFleetParts({ part_signin: true, part_scanner: false, part_safe_view: null }), { ok: true });
  now.advance(7 * SECOND);
  assert.deepEqual(w.m.keptFleetParts(), { part_signin: true, part_scanner: false, part_safe_view: null, age_ms: 7000 });
  for (const bad of [null, "x", [], {}, { part_signin: true }, { part_signin: "yes", part_scanner: true, part_safe_view: true },
    { part_signin: { a: 1 }, part_scanner: true, part_safe_view: true }]) {
    assert.equal(w.m.keepFleetParts(bad).ok, false, JSON.stringify(bad));
  }
  assert.equal(w.m.keptFleetParts().age_ms, 7000, "a refused keep changes nothing");
  /* extra keys are not kept */
  assert.deepEqual(w.m.keepFleetParts({ part_signin: false, part_scanner: false, part_safe_view: false, secret: "x" }), { ok: true });
  assert.deepEqual(Object.keys(w.m.keptFleetParts()).sort(), [...PARTS, "age_ms"].sort());
  now.advance(PARTS_KEPT_MS);
  assert.equal(w.m.keptFleetParts(), null, "past the minute");
  /* the route: the default answer is unchanged; the parts are asked for; a stranger's visit holds none of the seven */
  w.m.keepFleetParts({ part_signin: true, part_scanner: true, part_safe_view: true });
  const stub = stubOver(w.m, { bootstrap: () => storeAnswer });
  const plain = (await read(await stub.fetch("http://do/bootstrapfacts"))).body.result;
  assert.equal("kept_parts" in plain, false);
  assert.deepEqual(Object.keys(plain).sort(), [...BOOTSTRAP_FACT_KEYS].sort());
  const stranger = (await read(await stub.fetch("http://do/bootstrapfacts?facts=0&parts=1"))).body.result;
  assert.deepEqual(Object.keys(stranger), ["kept_parts"]);
  assert.deepEqual(stranger.kept_parts, { part_signin: true, part_scanner: true, part_safe_view: true, age_ms: 0 });
  /* a write that is no keep is read as the facts: a body with no `keep` writes nothing */
  const post = await stub.fetch(new Request("http://do/bootstrapfacts?facts=0&parts=1", { method: "POST", body: JSON.stringify({ keep: { part_signin: "x" } }) }));
  assert.equal((await read(post)).body.result.ok, false);
});

test("R104 a stranger on a second isolate is told the parts and none of the seven; a fleet bound to nothing is not told to the object; an object that does not answer the keep costs only a later ask", async () => {
  const now = clockAt(Date.parse("2026-10-24T10:00:00Z"));
  const { stub, paths } = await theObject(now);
  const f = fleet();
  await ask(f.env(), stub, { now });
  const stranger = await ask(f.env(), stub, { now });
  for (const k of BOOTSTRAP_FACT_KEYS) assert.equal(k in stranger, false, k);
  assert.deepEqual(f.calls, { AGENT_WORKER: 1, FILE_SCANNER: 1 });
  /* no member bound: the ask is answered at once, UNBOUND, and the object is not written */
  const bare = await theObject(now);
  paths.length = 0;
  const none = await ask({ VERSION: "plane-9" }, bare.stub, { now });
  assert.deepEqual([none.part_signin, none.part_scanner, none.part_safe_view], [false, false, false]);
  assert.equal(bare.paths.some((p) => p.endsWith("POST")), false, "nothing to keep");
  /* an object that does not answer the keep: the answer is whole, and the next isolate asks again */
  const deaf = await theObject(now, {}, []);
  const dumbStub = { fetch: (input, init) => { const req = input instanceof Request ? input : new Request(input, init);
    return req.method === "POST" ? Promise.resolve(new Response("boom", { status: 500 })) : deaf.stub.fetch(req); } };
  const g = fleet();
  const a = await ask(g.env(), dumbStub, { now });
  assert.equal(a.part_scanner, true);
  const b = await ask(g.env(), dumbStub, { now });
  assert.equal(b.part_scanner, true);
  assert.deepEqual(g.calls, { AGENT_WORKER: 2, FILE_SCANNER: 2 }, "the keep was not written, so the second isolate asked");
});

test("R104 the same environment keeps its first look: ten calls 2.5 s apart on one isolate ask once; the first look is not read from the object", async () => {
  const now = clockAt(Date.parse("2026-10-24T10:00:00Z"));
  const { stub, paths } = await theObject(now);
  const f = fleet();
  const env = f.env();
  for (let i = 0; i < 10; i += 1) { await ask(env, stub, { now }); now.advance(2.5 * SECOND); }
  assert.deepEqual(f.calls, { AGENT_WORKER: 1, FILE_SCANNER: 1 });
  assert.equal(paths.filter((p) => p === "bootstrapfacts").length, 1, "the object's keep is read once, by the call that had no entry");
  assert.equal(paths.filter((p) => p === "bootstrapfacts POST").length, 1, "and written once");
});

test("R104 R-LOG the isolate entry: an id made once per isolate, present on every answer including a store that does not answer, stable across environments of one isolate, with the isolate's age", async () => {
  const now = clockAt(Date.parse("2026-10-24T10:00:00Z"));
  const { stub } = await theObject(now);
  const f = fleet();
  const seen = [];
  const stateTiming = (name, ms, desc) => seen.push({ name, ms, desc });
  await ask(f.env(), stub, { now, stateTiming });
  const iso = seen.filter((e) => e.name === "isolate");
  assert.equal(iso.length, 1, "one isolate entry");
  assert.match(iso[0].desc, /^[0-9a-f]{8}$/);
  assert.ok(Number.isInteger(iso[0].ms) && iso[0].ms >= 0);
  assert.ok(seen.some((e) => e.name === `isolate-${iso[0].desc}` && e.ms === iso[0].ms), "the same age, named for the isolate, which the door's clock carries as it is");
  /* a later answer, on another environment of the same isolate, states the same id and a larger age */
  now.advance(30 * SECOND);
  seen.length = 0;
  await ask(f.env(), stub, { now, stateTiming });
  const again = seen.find((e) => e.name === "isolate");
  assert.equal(again.desc, iso[0].desc, "one id for the isolate's life");
  assert.ok(again.ms >= iso[0].ms + 30_000 - 1);
  /* a store that does not answer still states it */
  seen.length = 0;
  const silent = { fetch: async () => new Response("boom", { status: 500 }) };
  const r = await bootstrapReport(f.env(), "fp", { stub: silent, ...io, stateTiming, now });
  assert.equal(r.status, 502);
  assert.equal(seen.find((e) => e.name === "isolate").desc, iso[0].desc);
  /* a sink that takes two arguments, or throws, never fails the report */
  assert.equal((await ask(f.env(), stub, { now, stateTiming: (n, m) => { void n; void m; } })).ok, true);
  assert.equal((await ask(f.env(), stub, { now, stateTiming: () => { throw new Error("sink"); } })).ok, true);
});
