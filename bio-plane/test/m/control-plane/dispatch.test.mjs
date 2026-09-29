/* control-plane: the record store's door (R26, R27). Driven through `dispatch(req, store)` with a route map and a
   membership that record what reached them, and through the Durable Object class `Store`, whose `fetch` is the door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import "./harness.mjs";
const D = await import("../../../src/control-plane/dispatch.mjs");
const { Store: LegacyStore } = await import("../../../src/store.mjs");
const { dispatch, PROJECT_NAMING_READS, PROJECT_NAMING_READS_NOT } = D;

/* A store whose routes record their call; `membership` answers existence for the ids in `seen` (discoverable, and seen at
   EXISTENCE by the viewer), and records every question. */
function fakeStore({ routes = null, discoverable = [], existence = [] } = {}) {
  const log = [];
  const store = {
    log,
    routes(url, body) {
      log.push({ kind: "routes", body });
      return routes ?? new Proxy({}, { has: () => true, get: (_, op) => (typeof op === "string" ? () => { log.push({ kind: "route", op, body }); return { answered: op }; } : undefined),
                                       getOwnPropertyDescriptor: (_, op) => ({ configurable: true, enumerable: true, value: true }) });
    },
    membership() {
      log.push({ kind: "membership" });
      return {
        visibilityOf(id) { log.push({ kind: "visibility", id }); return discoverable.includes(id) ? "discoverable" : "hidden"; },
        existenceAct(id, viewer) {
          log.push({ kind: "existence", id, viewer });
          return existence.includes(id) ? { ok: false, reason: "PROJECT_SEEN_NOT_A_PARTICIPANT", project: id } : null;
        },
      };
    },
  };
  return store;
}
const go = async (store, path, init) => { const r = await dispatch(new Request(`http://do/${path}`, init), store); return { status: r.status, json: await r.json() }; };

test("R26: the store's door — an empty POST body is null, a non-JSON body 400 BAD_JSON, a route no module serves 400 `unknown op: <op>`, an answer {ok: true, result}; the routes are the modules' own maps", async () => {
  /* the body */
  for (const [init, want] of [[{ method: "POST" }, null], [{ method: "POST", body: "" }, null], [{ method: "POST", body: "  \n" }, null],
                              [{ method: "GET" }, null], [{ method: "POST", body: '{"a":1}' }, { a: 1 }], [{ method: "POST", body: "[1]" }, [1]]]) {
    const s = fakeStore({ routes: { echo: () => "ok" } });
    s.routes = (url, body) => { s.log.push({ body }); return { echo: () => ({ body }) }; };
    const r = await go(s, "echo", init);
    assert.deepEqual([r.status, r.json], [200, { ok: true, result: { body: want } }], JSON.stringify(init));
  }
  for (const bad of ["{", "not json", "{'a':1}"]) {
    const s = fakeStore();
    const r = await go(s, "echo", { method: "POST", body: bad });
    assert.deepEqual([r.status, r.json.ok, r.json.reason], [400, false, "BAD_JSON"]);
    assert.deepEqual(s.log, [], "no route map consulted");
  }
  /* an unserved route, inherited names included — and no route ran */
  for (const op of ["nosuch", "toString", "constructor", "__proto__", "hasOwnProperty", ""]) {
    const ran = [];
    const s = fakeStore({ routes: { echo: () => ran.push(1) } });
    const r = await go(s, op);
    assert.deepEqual([r.status, r.json], [400, { ok: false, error: "unknown op: " + op }], op);
    assert.equal(ran.length, 0);
  }
  /* the answer: whatever the route answers, awaited, under result; the route receives the url's parameters */
  for (const v of [null, 0, [], {}, "x", { ok: false, reason: "R" }]) {
    const r = await go({ routes: (url) => ({ q: async () => (url.searchParams.get("k") === "1" ? v : "wrong") }), membership: () => null }, "q?k=1");
    assert.deepEqual([r.status, r.json], [200, { ok: true, result: v }]);
  }
  /* the Durable Object class: legacy-store's, whose fetch is this door over its own `routes` */
  assert.ok(D.Store.prototype instanceof LegacyStore);
  assert.equal(typeof LegacyStore.prototype.routes, "function");
  assert.equal(Object.hasOwn(LegacyStore.prototype, "fetch"), false, "legacy-store keeps no door of its own");
  const obj = Object.create(D.Store.prototype);
  obj.ctx = {};
  obj.routes = (url, body) => ({ ping: () => ({ pong: body }) });
  const res = await obj.fetch(new Request("http://do/ping", { method: "POST", body: '{"x":2}' }));
  assert.deepEqual(await res.json(), { ok: true, result: { pong: { x: 2 } } });
  assert.equal((await obj.fetch(new Request("http://do/nope"))).status, 400);
  assert.equal(D.Store.PROJECT_NAMING_READS, PROJECT_NAMING_READS);
});

test("R27: a read naming a project (PROJECT_NAMING_READS) asked with a stamped viewer and naming a discoverable project is answered by membership.existenceAct first (C-70.1), before its route runs; the reads naming none are listed with the reason", async () => {
  const P = "PROJ-seen", H = "PROJ-hidden", F = "PROJ-full";
  assert.ok(Object.keys(PROJECT_NAMING_READS).length > 20);
  for (const [op, params] of Object.entries(PROJECT_NAMING_READS)) {
    assert.ok(Array.isArray(params) && params.length > 0, op);
    assert.equal(Object.hasOwn(PROJECT_NAMING_READS_NOT, op), false, `${op} in both tables`);
    for (const p of params) for (const where of ["query", "body"]) {
      const s = fakeStore({ discoverable: [P, F], existence: [P] });
      const q = where === "query" ? `&${p}=${P}` : "";
      const init = where === "body" ? { method: "POST", body: JSON.stringify({ [p]: P }) } : undefined;
      const r = await go(s, `${op}?viewer=member:ann${q}`, init);
      assert.deepEqual([r.status, r.json.ok, r.json.result.reason, r.json.result.project], [200, true, "PROJECT_SEEN_NOT_A_PARTICIPANT", P], `${op}.${p} ${where}`);
      assert.equal(s.log.some((e) => e.kind === "route"), false, `${op}: the route ran`);
      assert.deepEqual(s.log.filter((e) => e.kind === "existence").map((e) => [e.id, e.viewer]), [[P, "member:ann"]]);
      /* negative controls: a hidden project is never asked; a discoverable one the viewer sees whole falls through */
      for (const [id, asked] of [[H, false], [F, true], ["", false]]) {
        const t = fakeStore({ discoverable: [P, F], existence: [P] });
        const r2 = await go(t, `${op}?viewer=member:ann&${p}=${id}`);
        assert.deepEqual(r2.json.result, { answered: op }, `${op}.${p}=${id}`);
        assert.equal(t.log.some((e) => e.kind === "existence"), asked, `${op}.${p}=${id}`);
      }
    }
    /* no stamped viewer: an internal call, never asked, and membership is not even consulted */
    const s = fakeStore({ discoverable: [P], existence: [P] });
    const r = await go(s, `${op}?${params[0]}=${P}`);
    assert.deepEqual(r.json.result, { answered: op });
    assert.equal(s.log.some((e) => e.kind === "membership"), false);
  }
  /* a read listed as naming no project is never asked, whatever it names */
  for (const [op, why] of Object.entries(PROJECT_NAMING_READS_NOT)) {
    assert.equal(typeof why, "string", op);
    assert.ok(why.length > 10, op);
    const s = fakeStore({ discoverable: [P], existence: [P] });
    const r = await go(s, `${op}?viewer=member:ann&id=${P}&project=${P}&run=${P}&sha256=${P}`, { method: "POST", body: JSON.stringify({ id: P }) });
    assert.deepEqual(r.json.result, { answered: op });
    assert.equal(s.log.some((e) => e.kind === "membership"), false, op);
  }
  /* the first existence answer wins, and an unlisted parameter of a listed read is not asked */
  const s = fakeStore({ discoverable: [P, "PROJ-2"], existence: [P, "PROJ-2"] });
  const r = await go(s, `basisversions?viewer=member:ann&id=PROJ-2&project=${P}&other=${P}`);
  assert.equal(r.json.result.project, "PROJ-2");
});
