/* store-door: the record store's door (R1, R2, R3, R6, R9, R11). Driven through `dispatch(req, store)` with a route map
   and a membership that record what reached them, and over a real record (`record.mjs`) where an owner's answer is read.
   Moved from control-plane's `dispatch.test.mjs`, `envelope.test.mjs` (the store's half of R25), `r48-routes.test.mjs`
   (R47's classification), `r53-routes.test.mjs` and `t34-routes.test.mjs` (R53's store half) at the split (K1974). The
   Durable Object class whose `fetch` is this door is plane's (its R1). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { D, go, quietly, UUID } from "./harness.mjs";
const { record } = await import("./record.mjs");
const { DISPATCH_CHECKS } = await import("../../../src/answer-envelope/checks.mjs");
const { askAdmits } = await import("../../../src/answers/scope.mjs");
const { dispatch, PROJECT_NAMING_READS, PROJECT_NAMING_READS_NOT, GRANT_HEADER } = D;

/* A store whose routes record their call; `membership` answers existence for the ids in `existence` (discoverable, and
   seen at EXISTENCE by the viewer), and records every question. */
function fakeStore({ routes = null, discoverable = [], existence = [] } = {}) {
  const log = [];
  const store = {
    log,
    routes(url, body) {
      log.push({ kind: "routes", body });
      return routes ?? new Proxy({}, { has: () => true, get: (_, op) => (typeof op === "string" ? () => { log.push({ kind: "route", op, body }); return { answered: op }; } : undefined),
                                       getOwnPropertyDescriptor: () => ({ configurable: true, enumerable: true, value: true }) });
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

test("R1: the store's door — an empty POST body is null, a non-JSON body 400 BAD_JSON, a route no module serves 400 `unknown op: <op>`, an answer {ok: true, result}; the routes are the modules' own maps", async () => {
  /* the body */
  for (const [init, want] of [[{ method: "POST" }, null], [{ method: "POST", body: "" }, null], [{ method: "POST", body: "  \n" }, null],
                              [{ method: "GET" }, null], [{ method: "POST", body: '{"a":1}' }, { a: 1 }], [{ method: "POST", body: "[1]" }, [1]]]) {
    const s = fakeStore();
    s.routes = (url, body) => ({ echo: () => ({ body }) });
    const r = await go(s, "echo", init);
    assert.deepEqual([r.status, r.json], [200, { ok: true, result: { body: want } }], JSON.stringify(init));
  }
  for (const bad of ["{", "not json", "{'a':1}"]) {
    const s = fakeStore();
    const r = await go(s, "echo", { method: "POST", body: bad });
    assert.deepEqual([r.status, r.json.ok, r.json.reason], [400, false, "BAD_JSON"]);
    assert.deepEqual(s.log, [], "no route map consulted");
  }
  /* an unserved route, inherited names included, and no route ran */
  for (const op of ["nosuch", "toString", "constructor", "__proto__", "hasOwnProperty", ""]) {
    const ran = [];
    const s = fakeStore({ routes: { echo: () => ran.push(1) } });
    const r = await go(s, op);
    assert.deepEqual([r.status, r.json], [400, { ok: false, error: "unknown op: " + op }], op);
    assert.equal(ran.length, 0);
  }
  /* the answer: whatever the route answers, awaited, under result; the route receives the url's parameters and the body */
  for (const v of [null, 0, [], {}, "x", { ok: false, reason: "R" }]) {
    const r = await go({ routes: (url) => ({ q: async () => (url.searchParams.get("k") === "1" ? v : "wrong") }), membership: () => null }, "q?k=1");
    assert.deepEqual([r.status, r.json], [200, { ok: true, result: v }]);
  }
  /* this module holds no Durable Object class: the class whose fetch is this door is plane's (its R1) */
  assert.equal("Store" in D, false, "store-door exports no Durable Object class");
  /* the routes are the modules' own maps: the door answers only what the map it is handed holds (negative control: the
     same name in another map is served) */
  const one = { routes: () => ({ a: () => "A" }), membership: () => null };
  assert.deepEqual((await go(one, "b")).json, { ok: false, error: "unknown op: b" });
  assert.deepEqual((await go({ ...one, routes: () => ({ b: () => "B" }) }, "b")).json, { ok: true, result: "B" });
});

test("R2: a read naming a project (PROJECT_NAMING_READS) asked with a stamped viewer and naming a discoverable project is answered by membership.existenceAct first (C-70.1), before its route runs; the reads naming none are listed with the reason", async () => {
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
  /* a read listed as naming no project is never asked, whatever it names, and each carries its reason */
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
  const t = fakeStore({ discoverable: [P], existence: [P] });
  assert.deepEqual((await go(t, `basisversions?viewer=member:ann&other=${P}`)).json.result, { answered: "basisversions" });
  assert.equal(t.log.some((e) => e.kind === "existence"), false);
});

test("R3 (DEC-113, DEC-36; actions R58): `projectholds` is among the reads naming no project, with the reason that a project not seen at FULL is answered `held: null`, so its existence answer is not run; `actionholdrelease`, `actionholdpreview` and `projectholds` pass R1's frame to the map they are routed through, with the request's own parameters and body and nothing of the door's added (negative control: a read naming a project is still asked)", async () => {
  assert.equal(typeof PROJECT_NAMING_READS_NOT.projectholds, "string");
  assert.match(PROJECT_NAMING_READS_NOT.projectholds, /held: null/);
  assert.match(PROJECT_NAMING_READS_NOT.projectholds, /FULL/);
  for (const op of ["projectholds", "actionholdrelease", "actionholdpreview"])
    assert.equal(Object.hasOwn(PROJECT_NAMING_READS, op), false, `${op} names no project`);
  const P = "PROJ-seen";
  const ran = [], asked = [];
  const membership = () => ({ visibilityOf: (id) => { asked.push(id); return id === P ? "discoverable" : "hidden"; },
                               existenceAct: (id) => (id === P ? { ok: false, reason: "PROJECT_SEEN_NOT_A_PARTICIPANT", project: id } : null) });
  const store = { membership, routes: (url, body) => {
    const seen = (op) => () => { ran.push([op, Object.fromEntries(url.searchParams), body]); return { ok: true, projects: [{ project: P, held: null }] }; };
    return { projectholds: seen("projectholds"), actionholdrelease: seen("actionholdrelease"), actionholdpreview: seen("actionholdpreview"),
             notices: () => ({ ok: true }) };
  } };
  const body = { projects: [P], project: P, id: P, target: P };
  for (const op of ["projectholds", "actionholdrelease", "actionholdpreview"]) {
    ran.length = 0; asked.length = 0;
    const r = await go(store, `${op}?viewer=member:ann&by=member:ann&project=${P}&projects=${P}`, { method: "POST", body: JSON.stringify(body) });
    assert.deepEqual([r.status, r.json.ok, r.json.result.projects[0].held], [200, true, null], op);
    assert.deepEqual(ran, [[op, { viewer: "member:ann", by: "member:ann", project: P, projects: P }, body]], op);
    assert.deepEqual(asked, [], `${op}: no existence answer was run`);
  }
  /* negative control: a read naming a project at the same door is answered existence first */
  const n = await go(store, `notices?viewer=member:ann&project=${P}`);
  assert.equal(n.json.result.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

test("R6 (C-69.4): an error thrown anywhere in the store's door, in a route or in the route map itself, is answered STORE_INTERNAL_ERROR with its row and a correlation id, never the stack, the message, a path or a line, and the stack is logged server-side under the id (negative control: each throw has its own id)", async () => {
  const SECRET = "SQLITE_CONSTRAINT secret-value /srv/plane/src/store.mjs:4242";
  const thrower = () => { throw new Error(SECRET); };
  const ids = [];
  for (const [routes, op] of [[() => ({ boom: thrower }), "boom"], [thrower, "boom"],
                              [() => ({ boom: async () => { await null; throw new Error(SECRET); } }), "boom"]]) {
    const { value: res, logged } = await quietly(() => dispatch(new Request(`http://do/${op}`, { method: "POST", body: "{}" }),
      { routes, membership: () => { throw new Error("not asked"); } }));
    assert.equal(res.status, 500);
    const text = await res.text();
    const j = JSON.parse(text);
    assert.deepEqual([j.ok, j.error, j.reason, j.code, j.check], [false, "internal error", "STORE_INTERNAL_ERROR", "STORE_INTERNAL_ERROR", "C-69.4"]);
    assert.equal(j.translation, DISPATCH_CHECKS.STORE_INTERNAL_ERROR.translation);
    assert.match(j.correlation, UUID);
    assert.deepEqual(Object.keys(j).sort(), ["check", "code", "correlation", "error", "ok", "reason", "translation"]);
    assert.equal(text.includes("secret-value") || text.includes("store.mjs") || text.includes(":4242") || text.includes(" at "), false);
    assert.equal(logged.length, 1);
    const line = JSON.parse(logged[0]);
    assert.deepEqual([line.event, line.correlation, line.op], ["STORE_INTERNAL_ERROR", j.correlation, op]);
    assert.match(line.stack, /secret-value/);
    ids.push(j.correlation);
  }
  assert.equal(new Set(ids).size, ids.length, "each throw gets its own id");
  /* the existence answer throwing is inside the catch too */
  const { value: ex } = await quietly(() => dispatch(new Request(`http://do/image?viewer=member:ann&id=PROJ-1`),
    { routes: () => ({ image: () => "x" }), membership: () => { throw new Error(SECRET); } }));
  assert.deepEqual([ex.status, (await ex.json()).reason], [500, "STORE_INTERNAL_ERROR"]);
  /* storeInternalError, the one place the answer is built */
  const { value: built, logged } = await quietly(() => D.storeInternalError(new Error(SECRET), "x".repeat(300)));
  assert.equal(JSON.stringify(built).includes("secret-value"), false);
  assert.equal(JSON.parse(logged[0]).op.length, 200, "the op logged is bounded");
});

test("R9 (F1; K1874, K1943): the store's door reads an ask's grant only from the request's `x-bio-grant` header — a grant in the query is not read, not logged and not handed to a route — and the door makes no request of its own, so no credential reaches any address (negative control: the header's grant is read and logged)", async () => {
  assert.equal(GRANT_HEADER, "x-bio-grant");
  const logged = [], handed = [];
  const store = {
    routes: (url, body, grant) => { handed.push(grant); return { search: () => ({ rows: ["INQ-1"] }), askcheck: () => ({ ok: true }) }; },
    membership: () => ({ visibilityOf: () => "hidden", existenceAct: () => null }),
    logRead: (e) => { logged.push(e); return { rows: ["INQ-1"], logged: true }; },
  };
  const fetched = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (...a) => { fetched.push(a); throw new Error("the door made a request"); };
  try {
    /* the query's grant: not read, not logged, not handed */
    const q = await go(store, "search?grant=SENTINEL-Q&viewer=member:ann&q=x");
    assert.deepEqual(q.json, { ok: true, result: { rows: ["INQ-1"] } });
    assert.deepEqual([logged, handed], [[], [null]]);
    /* the body's `grant` is a route's argument, never the credential */
    handed.length = 0;
    const b = await go(store, "search?viewer=member:ann", { method: "POST", body: JSON.stringify({ grant: "SENTINEL-B" }) });
    assert.deepEqual([b.json.result, logged, handed], [{ rows: ["INQ-1"] }, [], [null]]);
    /* the header's: read, logged, handed; a query grant beside it is neither the one used nor logged as an argument */
    handed.length = 0;
    const h = await go(store, "search?grant=SENTINEL-Q&viewer=member:ann&q=x", { headers: { [GRANT_HEADER]: "SENTINEL-H" } });
    assert.deepEqual(h.json, { ok: true, result: { rows: ["INQ-1"], logged: true } });
    assert.deepEqual(handed, ["SENTINEL-H"]);
    assert.deepEqual(logged.map((e) => [e.grant, e.args]), [["SENTINEL-H", { q: "x" }]]);
    /* an empty header is no grant */
    logged.length = 0;
    await go(store, "search?viewer=member:ann", { headers: { [GRANT_HEADER]: "" } });
    assert.deepEqual(logged, []);
    assert.deepEqual(fetched, [], "the door made no request");
  } finally { globalThis.fetch = realFetch; }
  /* over a real record: askcheck reads the header's grant, never the query's — a query grant is checked as no grant */
  const r = await record();
  const viaHeader = await r.go("askcheck?viewer=member:ann", "POST", { answer: { sentences: [] } }, { [GRANT_HEADER]: "G-HEADER" });
  const viaQuery = await r.go("askcheck?grant=G-HEADER&viewer=member:ann", "POST", { answer: { sentences: [] } });
  assert.equal(viaHeader.json.ok, true);
  assert.equal(viaQuery.json.ok, true);
  assert.notDeepEqual(viaHeader.json.result, undefined);
  /* the door's own source of the grant handed to `controlPlaneRoutes`: its fourth argument, never the url */
  const seen = [];
  const { answersOf } = await import("../../../src/answers/index.mjs");
  const orig = answersOf(r.ctx).check;
  answersOf(r.ctx).check = (a) => { seen.push(a.grant); return orig.call(answersOf(r.ctx), a); };
  await r.go("askcheck?grant=G-QUERY&viewer=member:ann", "POST", { answer: { sentences: [] } }, { [GRANT_HEADER]: "G-HEADER" });
  await r.go("askcheck?grant=G-QUERY&viewer=member:ann", "POST", { answer: { sentences: [] } });
  assert.deepEqual(seen, ["G-HEADER", null]);
  answersOf(r.ctx).check = orig;
});

test("R11 (K1674; answers R1, R2, R7): a read the store serves under a grant is handed to `store.logRead` with its grant, op, arguments (query and body, the stamped viewer and any query grant aside), answer and viewer, and answered as logged; no grant, `rule` (which records its own) and an op off the asking scope are answered as served; a store that cannot log is R6's internal error, never an unlogged answer", async () => {
  const logged = [];
  const store = (logRead) => ({
    routes: () => ({ search: () => ({ rows: ["INQ-1", "MTI-2026-0001"] }), rule: () => ({ value: 1 }), askceiling: () => ({ ok: true }) }),
    membership: () => ({ visibilityOf: () => "hidden", existenceAct: () => null }), ...(logRead ? { logRead } : {}) });
  const logging = store((e) => { logged.push(e); return { rows: ["INQ-1"], scrubbed: true }; });
  const G = { [GRANT_HEADER]: "G1" };
  assert.equal(askAdmits("search"), true);
  assert.equal(askAdmits("askceiling"), false);
  const a = await go(logging, "search?viewer=member:ann&q=x", { method: "POST", headers: G, body: JSON.stringify({ limit: 5 }) });
  assert.deepEqual(a.json, { ok: true, result: { rows: ["INQ-1"], scrubbed: true } });
  assert.deepEqual(logged, [{ grant: "G1", op: "search", args: { q: "x", limit: 5 }, answer: { rows: ["INQ-1", "MTI-2026-0001"] }, viewer: "member:ann" }]);
  for (const [path, headers] of [["search?viewer=member:ann&q=x", {}], ["rule?viewer=member:ann", G], ["askceiling?viewer=member:ann", G]]) {
    const r = await go(logging, path, { headers });
    assert.equal(r.json.ok, true, path);
    assert.equal(r.json.result.scrubbed, undefined, path);
  }
  assert.equal(logged.length, 1);
  const { value: lost } = await quietly(() => go(store(null), "search?viewer=member:ann", { headers: G }));
  assert.deepEqual([lost.status, lost.json.reason], [500, "STORE_INTERNAL_ERROR"]);
  assert.equal(JSON.stringify(lost.json).includes("MTI-"), false, "nothing unlogged is answered");
  const { value: thrown } = await quietly(() => go(store(() => { throw new Error("log full"); }), "search?viewer=member:ann", { headers: G }));
  assert.deepEqual([thrown.status, thrown.json.reason], [500, "STORE_INTERNAL_ERROR"]);
});

test("R11 (K1674, K1685, K1798; credentials R28, ai-runs R48, R50, answers R4): the ask's store-internal routes, each its owner's with the member the stamped viewer — `aigrantadmit` answers credentials' own words, `askceiling` ai-runs' ceiling check (`{ok: true}` when under it), `askusage` ai-runs' counter with mode `ask` whatever was sent and the ask's `calls`, `askcheck` answers' check over the grant's read log (negative control: a name no module serves is R1's refusal)", async () => {
  const r = await record();
  const a = await r.go("aigrantadmit", "POST", { token: "f".repeat(64), op: "search", write: false });
  assert.deepEqual([a.status, a.json.ok, a.json.result.ok, a.json.result.reason], [200, true, false, "GRANT_NOT_HELD"]);
  const u0 = await r.go("aigrantnothing", "POST", {});
  assert.deepEqual([u0.status, u0.json.error], [400, "unknown op: aigrantnothing"]);
  const ceil = await r.go("askceiling?viewer=member:ann");
  assert.deepEqual([ceil.status, ceil.json.ok, ceil.json.result.ok, ceil.json.result.reason], [200, true, false, "AI_NO_ACCOUNT"]);
  const { aiRunsOf } = await import("../../../src/ai-runs/index.mjs");
  const orig = aiRunsOf(r.ctx).aiUseCheck;
  aiRunsOf(r.ctx).aiUseCheck = () => null;
  assert.deepEqual((await r.go("askceiling?viewer=member:ann")).json.result, { ok: true }, "under the ceiling: {ok: true}");
  aiRunsOf(r.ctx).aiUseCheck = orig;
  const USE = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null };
  const u = await r.go("askusage?viewer=member:ann", "POST", { mode: "run", usage: USE });
  assert.deepEqual([u.json.ok, u.json.result.ok, u.json.result.counted], [true, true, 1], JSON.stringify(u.json).slice(0, 300));
  assert.deepEqual(r.db.prepare("SELECT member, mode FROM ai_usage").all().map((x) => [x.member, x.mode]), [["ann", "ask"]]);
  const calls = () => r.db.prepare("SELECT COALESCE(SUM(calls), 0) n FROM ai_usage WHERE member = 'ann'").get().n;
  assert.equal((await r.go("askusage?viewer=member:ann", "POST", { usage: USE, calls: 3 })).json.result.ok, true);
  assert.equal(calls(), 4, "an ask of three calls counts three");
  assert.equal((await r.go("askusage?viewer=member:ann", "POST", { usage: USE, calls: 0 })).json.result.ok, false);
  assert.equal((await r.go("askusage?viewer=member:ann", "POST", { usage: { input_tokens: "lots" } })).json.result.ok, false);
  assert.equal((await r.go("askusage", "POST", { usage: USE })).json.result.ok, false, "no member, nothing counted");
  assert.equal(calls(), 4, "a refused use counts nothing");
  const c = await r.go("askcheck?viewer=member:ann", "POST", { answer: { sentences: [] } }, { [GRANT_HEADER]: "G1" });
  assert.equal(c.status, 200, JSON.stringify(c.json).slice(0, 300));
  assert.equal(c.json.ok, true);
  assert.ok(c.json.result && typeof c.json.result === "object", JSON.stringify(c.json).slice(0, 300));
});
