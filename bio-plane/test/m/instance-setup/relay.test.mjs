/* R43 (N339, N349): every Worker handler of this module that relays a store answer, at the module's interface. Behind
   each relay a stub store gives one reply that is not an answer: the store's own refusal (`BAD_JSON` at 400), its bare
   catch (a 500 carrying a stack), and its internal error at 500 with and without a correlation id. Each relay is driven
   with the plane's `storeRefusal` handed (control-plane) and without it (legacy-index's call sites today). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, stubOver, envOver, io, ioLegacy, read } from "./fixture.mjs";
import { instanceGroupOp, groupIdentityOp, bootstrapReport, runtimeOp, cpuProbeOp } from "../../../src/setup.mjs";

const CORRELATION = "0f1e2d3c-4b5a-4968-8776-a5b4c3d2e1f0";
const STACK = "Error: the store threw\n    at Store.fetch (store.mjs:12:7)";
const REPLIES = {
  refused: { status: 400, body: { ok: false, reason: "BAD_JSON", detail: "the request body is not valid JSON" } },
  stack: { status: 500, body: { ok: false, error: STACK } },
  correlated: { status: 500, body: { ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION } },
  uncorrelated: { status: 500, body: { ok: false, reason: "STORE_INTERNAL_ERROR" } },
};

/* The module's own routes over a real store, with capture's ceiling and membership's bootstrap state answered, and the
   `nth` read of `path` given `reply` instead. `seen` counts the probe's burned steps. */
async function relayStore(path, reply, nth = 1) {
  const w = await boot();
  const inner = stubOver(w.m, { capturelimit: async () => ({ ceiling: 50 }),
                                bootstrap: async () => ({ claimed: false, rearmed: false, consumedAt: null }) });
  const counts = new Map();
  const stub = {
    async fetch(input, init) {
      const req = input instanceof Request ? input : new Request(input, init);
      const p = new URL(req.url).pathname.slice(1);
      counts.set(p, (counts.get(p) || 0) + 1);
      if (p === path && counts.get(p) === nth)
        return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { "content-type": "application/json" } });
      return inner.fetch(req);
    },
  };
  return { w, stub, env: envOver(stub) };
}

const probe = (burned) => async (a) => { burned.n += 1; await a.checkpoint(1, 1); return { completed: 1, elapsed_ms: 1, reason: "MAX_STEP_REACHED" }; };

/* Every relay: [name, the path its store read takes, which read of that path, the call]. */
const RELAYS = [
  ["instanceGroupOp (credentialed)", "instancegroup", 1, (s, h) => instanceGroupOp(s.env, "bio", { viewer: "admin", cls: "member" }, h)],
  ["instanceGroupOp (public)", "instancegrouppublic", 1, (s, h) => instanceGroupOp(s.env, "bio", { viewer: "" }, h)],
  ["groupIdentityOp (credentialed)", "groupidentity", 1, (s, h) => groupIdentityOp(s.env, "bio", { viewer: "admin", cls: "member" }, h)],
  ["groupIdentityOp (public)", "groupidentitypublic", 1, (s, h) => groupIdentityOp(s.env, "bio", {}, h)],
  ["bootstrapReport", "bootstrap", 1, (s, h) => bootstrapReport({}, "fp", { stub: s.stub, ...h })],
  ["runtimeOp's observations read", "runtimeobservations", 1, (s, h) => runtimeOp(s.stub, h)],
  ["runtimeOp's probe-state read", "cpuprobestate", 1, (s, h) => runtimeOp(s.stub, h)],
  ["runtimeOp's subrequest-ceiling read", "capturelimit", 1, (s, h) => runtimeOp(s.stub, h)],
  ["cpuProbeOp's first state read", "cpuprobestate", 1, (s, h) => cpuProbeOp(s.stub, { probe: probe(s.burned) }, h)],
  ["cpuProbeOp's run start", "cpuprobestart", 1, (s, h) => cpuProbeOp(s.stub, { probe: probe(s.burned) }, h)],
  ["cpuProbeOp's state read after the run", "cpuprobestate", 2, (s, h) => cpuProbeOp(s.stub, { probe: probe(s.burned) }, h)],
];

async function drive([name, path, nth, call], kind, handed) {
  const s = await relayStore(path, REPLIES[kind], nth);
  s.burned = { n: 0 };
  const r = await read(await call(s, handed));
  return { ...r, burned: s.burned.n, name };
}

test("R43 the store's own refusal (ok false below 500) behind each relay is answered with the store's status, code and sentence, never STORE_DID_NOT_ANSWER, whether or not the plane hands storeRefusal", async () => {
  for (const relay of RELAYS) for (const [label, handed] of [["storeRefusal handed", io], ["storeRefusal not handed", ioLegacy]]) {
    const r = await drive(relay, "refused", handed);
    assert.equal(r.status, 400, `${relay[0]}, ${label}`);
    assert.deepEqual(r.body, REPLIES.refused.body, `${relay[0]}, ${label}`);
  }
  /* the probe burns nothing when its first read or its start is refused */
  for (const relay of RELAYS.filter(([n]) => /first state read|run start/.test(n)))
    assert.equal((await drive(relay, "refused", io)).burned, 0, relay[0]);
});

test("R43 a reply that is no answer behind each relay is 502 STORE_DID_NOT_ANSWER: the store's stack never leaves (control-plane R30), its correlation id is carried when it gave one, and there is no correlation key when it gave none", async () => {
  for (const relay of RELAYS) for (const [label, handed] of [["storeRefusal handed", io], ["storeRefusal not handed", ioLegacy]]) {
    const at = `${relay[0]}, ${label}`;
    const stack = await drive(relay, "stack", handed);
    assert.deepEqual([stack.status, stack.body.ok, stack.body.reason], [502, false, "STORE_DID_NOT_ANSWER"], at);
    assert.equal(JSON.stringify(stack.body).includes("the store threw"), false, `${at}: the stack left`);
    assert.equal("correlation" in stack.body, false, at);
    const corr = await drive(relay, "correlated", handed);
    assert.deepEqual([corr.status, corr.body.reason, corr.body.correlation], [502, "STORE_DID_NOT_ANSWER", CORRELATION], at);
    const none = await drive(relay, "uncorrelated", handed);
    assert.deepEqual([none.status, none.body.reason], [502, "STORE_DID_NOT_ANSWER"], at);
    assert.equal("correlation" in none.body, false, at);
  }
});

test("R43 with nothing wrong behind them, the same relays answer as before: 200 and the store's result", async () => {
  for (const [name, , , call] of RELAYS) {
    const s = await relayStore("none", REPLIES.refused);
    s.burned = { n: 0 };
    const r = await read(await call(s, io));
    assert.deepEqual([r.status, r.body.ok], [200, true], name);
  }
});

test("R43 N348 through the frame this module's routes pass: a route that throws is the frame's STORE_INTERNAL_ERROR, and the relay answers 502 carrying that very correlation id and no stack; a POST that is not JSON is the frame's BAD_JSON, relayed as the store's refusal, and nothing is written", async () => {
  const w = await boot();
  const seen = [];
  const inner = stubOver(w.m);
  const stub = { async fetch(input, init) {
    const r = await inner.fetch(input, init);
    seen.push(await r.clone().json());
    return r;
  } };
  const env = envOver(stub);
  /* the store's storage fails under the route: the frame catches it */
  const failing = w.st.sql.exec;
  w.st.sql.exec = (q, ...a) => { if (/instance_group/.test(q)) throw new Error("SQLITE_IOERR /srv/setup.mjs:1"); return failing(q, ...a); };
  const r = await read(await instanceGroupOp(env, "bio", { viewer: "admin", cls: "member" }, io));
  w.st.sql.exec = failing;
  const thrown = seen.at(-1);
  assert.deepEqual([thrown.ok, thrown.reason], [false, "STORE_INTERNAL_ERROR"]);
  assert.match(thrown.correlation, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.deepEqual([r.status, r.body.reason, r.body.correlation], [502, "STORE_DID_NOT_ANSWER", thrown.correlation]);
  assert.equal(/SQLITE|setup\.mjs|srv/.test(JSON.stringify(r.body)), false, JSON.stringify(r.body));
  /* negative control: with the storage answering, the same relay answers the row */
  const ok = await read(await instanceGroupOp(env, "bio", { viewer: "admin", cls: "member" }, io));
  assert.deepEqual([ok.status, ok.body.ok], [200, true]);
  /* a body that is not JSON never reaches the route */
  for (const bad of ["{", "not json"]) {
    const res = await stub.fetch(new Request("http://do/instancegroupseed?author=token:admin", { method: "POST", body: bad }));
    assert.equal(res.status, 400, bad);
    assert.deepEqual([seen.at(-1).ok, seen.at(-1).reason], [false, "BAD_JSON"], bad);
  }
  assert.equal(w.m.instanceGroup().group, null, "nothing was seeded");
  /* an empty body is null, and the route answers its own refusal inside the envelope */
  const empty = await stub.fetch(new Request("http://do/instancegroupseed?author=token:admin", { method: "POST" }));
  assert.deepEqual([empty.status, seen.at(-1).ok, seen.at(-1).result.reason], [200, true, "GROUP_SLUG_MALFORMED"]);
});
