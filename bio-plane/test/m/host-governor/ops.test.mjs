/* host-governor's two ops (R18, R19): the handlers at the module's interface over a stand-in store, and then through
   the whole plane (Miniflare, the real Worker and Durable Object), by every token class and every kind of session,
   because who reaches an op is decided where the op is declared. No network: the outbound service answers nothing. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { governorOp, governorOpResponse, governorRoutes, GOVERNOR_OPS } from "../../../src/host-governor/index.mjs";
import { world } from "./fixture.mjs";

const url = (q) => new URL(`http://x/api/?${q}`);
/* A stand-in Durable Object stub over a real governor, answering as the plane store does (its route map, `{ok, result}`). */
const storeOver = (g, calls = []) => ({ async fetch(u, init) {
  const where = new URL(u);
  const body = init && init.body ? JSON.parse(init.body) : null;
  calls.push([where.pathname + where.search, body]);
  return Response.json({ ok: true, result: governorRoutes(g, where, body)[where.pathname.slice(1)]() });
} });
const silent = [{ fetch: async () => { throw new Error("no store"); } }, { fetch: async () => new Response("<html>") },
                { fetch: async () => Response.json({ ok: false }) }];

test("R18: op=governorstate answers {ok: true, hosts} for one host or all, and a store that does not answer is silence", async () => {
  const w = world();
  w.g.governorReport({ host: "b.example", status: 429 });
  w.g.governorAdmit({ host: "a.example" });
  const calls = [];
  const all = await governorOp("governorstate", url("op=governorstate"), storeOver(w.g, calls));
  assert.deepEqual(all, { status: 200, body: { ok: true, hosts: w.g.governorState({}).hosts } });
  assert.deepEqual(all.body.hosts.map((r) => r.host), ["a.example", "b.example"]);
  const one = await governorOp("governorstate", url("op=governorstate&host=b.example"), () => storeOver(w.g, calls));
  assert.deepEqual(one.body.hosts.map((r) => r.host), ["b.example"]);
  assert.equal(one.body.hosts[0].last_refusal_status, 429);
  const none = await governorOp("governorstate", url("op=governorstate&host=zzz.example"), storeOver(w.g));
  assert.deepEqual(none, { status: 200, body: { ok: true, hosts: [] } });
  assert.equal(w.count(), 2);                                         // a read never creates a host
  for (const st of silent) assert.deepEqual(await governorOp("governorstate", url("op=governorstate"), st), { silent: true });
  assert.equal(await governorOp("links", url("op=links"), storeOver(w.g)), null);   // any other op is not this module's
});

test("R19: op=governorconfig refuses NEED_HOST and BAD_APPETITE, sets or clears, and a store that does not answer is silence", async () => {
  const w = world();
  const calls = [];
  const st = storeOver(w.g, calls);
  const need = await governorOp("governorconfig", url("op=governorconfig&appetite_per_min=5"), st);
  assert.equal(need.status, 400);
  assert.equal(need.body.reason, "NEED_HOST");
  for (const bad of ["0", "-4", "abc", "Infinity", "1e999"]) {
    const r = await governorOp("governorconfig", url(`op=governorconfig&host=h.example&appetite_per_min=${bad}`), st);
    assert.equal(r.status, 400, bad);
    assert.equal(r.body.reason, "BAD_APPETITE");
    assert.equal(r.body.check, "host-governor.R12");          // the one refusal R12 names, not a second wording
    assert.deepEqual(r.body, w.g.governorConfig({ host: "h.example", appetite_per_min: bad }));
  }
  assert.deepEqual(calls, []);                                 // nothing reached the store
  assert.equal(w.count(), 0);
  const set = await governorOp("governorconfig", url("op=governorconfig&host=h.example&appetite_per_min=9"), st);
  assert.deepEqual(set, { status: 200, body: { ok: true, configured: true, host: "h.example", appetite_per_min: 9 } });
  assert.equal(w.row("h.example").appetite_per_min, 9);
  for (const q of ["op=governorconfig&host=h.example", "op=governorconfig&host=h.example&appetite_per_min="]) {
    w.g.governorConfig({ host: "h.example", appetite_per_min: 9 });
    const cleared = await governorOp("governorconfig", url(q), st);
    assert.deepEqual(cleared.body, { ok: true, configured: true, host: "h.example", appetite_per_min: null });
    assert.equal(w.row("h.example").appetite_per_min, null);
  }
  for (const s of silent)
    assert.deepEqual(await governorOp("governorconfig", url("op=governorconfig&host=h.example&appetite_per_min=3"), s), { silent: true });
});

/* R27: the relay the control plane hands (`control-plane` R23, R25, R30), as its `doAnswer`, `storeRefusal`, `storeSilent`
   and `json` answer, so the caller below composes the reply the plane would send. */
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const doAnswer = async (res) => {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string" && UUID.test(out.correlation)
    ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
};
const storeRefusal = (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status);
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "this instance could not consult its own record", correlation }, 502);
/* The Worker's arm, `governorOpResponse`, with the plane's relay handed as the control plane hands it; `g` is what
   `governorOp` answered under the same relay, so each reply is checked against the handler's answer too. */
const relayed = async (op, q, store, opened = []) => {
  const spy = async (res) => { const out = await doAnswer(res); opened.push(out); return out; };
  const res = await governorOpResponse(op, url(q), store, { json, doAnswer: spy, storeRefusal, storeSilent });
  const g = await governorOp(op, url(q), store, { doAnswer, storeRefusal });
  return { g, status: res.status, body: await res.json() };
};
const stubStore = (status, body) => ({ fetch: async () => (typeof body === "string" ? new Response(body, { status })
                                                                                   : Response.json(body, { status })) });
const RELAYS = [["governorstate", "op=governorstate"], ["governorstate", "op=governorstate&host=h.example"],
                ["governorconfig", "op=governorconfig&host=h.example&appetite_per_min=4"],
                ["governorconfig", "op=governorconfig&host=h.example"]];

test("R27: behind each relay, the store's own refusal (ok: false below 500) is answered with its status, code and sentence", async () => {
  for (const [op, q] of RELAYS) {
    for (const [status, body] of [[400, { ok: false, reason: "BAD_JSON", detail: "the body is not JSON" }],
                                  [404, { ok: false, error: "unknown op: governorstate" }],
                                  [409, { ok: false, reason: "SOMETHING_ELSE", code: "SOMETHING_ELSE", translation: "words" }]]) {
      const opened = [];
      const r = await relayed(op, q, stubStore(status, body), opened);
      assert.equal(r.g.refused, true, `${q} ${status}`);
      assert.equal(r.status, status, q);
      assert.deepEqual(r.body, body, q);                 // the store's envelope, nothing added and nothing lost
      assert.equal(opened.length, 1, q);                  // read through the plane's doAnswer, once
      assert.equal(opened[0].refused, true, q);
    }
  }
});

test("R27: a reply that is no answer is STORE_DID_NOT_ANSWER, with the store's correlation id when it gave one and never its stack", async () => {
  const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
  for (const [op, q] of RELAYS) {
    // the store's catch at 500: silence, the stack never relayed (control-plane R30), no correlation key
    const stack = { ok: false, error: "Error: boom\n    at Store.fetch (store.mjs:1:1)" };
    const s = await relayed(op, q, stubStore(500, stack));
    assert.equal(s.status, 502, q);
    assert.equal(s.body.reason, "STORE_DID_NOT_ANSWER", q);
    assert.equal(s.body.op, op, q);
    assert.doesNotMatch(JSON.stringify(s.body), /boom|store\.mjs|at Store/, q);
    assert.equal("correlation" in s.body, false, q);
    assert.deepEqual(s.g, { silent: true }, q);
    // the store's internal error with a correlation id: carried on
    const c = await relayed(op, q, stubStore(500, { ok: false, reason: "STORE_INTERNAL_ERROR", correlation: id }));
    assert.deepEqual([c.status, c.body.reason, c.body.correlation], [502, "STORE_DID_NOT_ANSWER", id], q);
    assert.deepEqual(c.g, { silent: true, correlation: id }, q);
    // without one (or with one that is not an id): no correlation key
    for (const body of [{ ok: false, reason: "STORE_INTERNAL_ERROR" }, { ok: false, reason: "STORE_INTERNAL_ERROR", correlation: "x" }]) {
      const n = await relayed(op, q, stubStore(500, body));
      assert.deepEqual([n.status, n.body.reason, "correlation" in n.body], [502, "STORE_DID_NOT_ANSWER", false], q);
    }
    // no reply at all, a reply that is not JSON, a JSON reply that is no envelope, a store call that throws at once
    // (`{ok: false}` below 500 is the store's refusal, R23, relayed above, not a silence)
    for (const st of [...silent.slice(0, 2), stubStore(200, "<html>"), stubStore(200, [1, 2]),
                      { fetch: () => { throw new Error("thrown before any reply"); } }]) {
      const x = await relayed(op, q, st);
      assert.deepEqual([x.status, x.body.reason, "correlation" in x.body], [502, "STORE_DID_NOT_ANSWER", false], q);
      assert.deepEqual(x.g, { silent: true }, q);
    }
  }
});

test("R27, R18, R19: with the relay handed, an answer is answered as before, and the governor's own R12 inside it at 400", async () => {
  const w = world();
  w.g.governorReport({ host: "b.example", status: 429 });
  const opened = [];
  const all = await relayed("governorstate", "op=governorstate", storeOver(w.g), opened);
  assert.deepEqual([all.status, all.body], [200, { ok: true, hosts: w.g.governorState({}).hosts }]);
  assert.deepEqual(await governorOp("governorstate", url("op=governorstate"), () => storeOver(w.g), { doAnswer, storeRefusal }),
                   { status: 200, body: { ok: true, hosts: w.g.governorState({}).hosts } });
  const set = await relayed("governorconfig", "op=governorconfig&host=h.example&appetite_per_min=9", storeOver(w.g), opened);
  assert.deepEqual([set.status, set.body], [200, { ok: true, configured: true, host: "h.example", appetite_per_min: 9 }]);
  assert.equal(w.row("h.example").appetite_per_min, 9);
  assert.equal(opened.length, 2);
  assert.ok(opened.every((o) => o.answered === true));
  // an answer carrying the governor's own refusal is an answer: relayed at 400, never as the store's refusal or a silence
  const inBand = { fetch: async () => Response.json({ ok: true, result: w.g.governorConfig({ host: "h.example", appetite_per_min: -1 }) }) };
  const r = await relayed("governorconfig", "op=governorconfig&host=h.example&appetite_per_min=4", inBand);
  assert.deepEqual([r.status, r.body.reason, r.body.check], [400, "BAD_APPETITE", "host-governor.R12"]);
  // the refusals decided before the store is asked never reach it
  const untouched = { fetch: async () => { throw new Error("asked the store"); } };
  assert.equal((await relayed("governorconfig", "op=governorconfig&appetite_per_min=4", untouched)).body.reason, "NEED_HOST");
  assert.equal((await relayed("governorconfig", "op=governorconfig&host=h.example&appetite_per_min=0", untouched)).body.reason, "BAD_APPETITE");
  assert.equal(await governorOp("links", url("op=links"), untouched, { doAnswer, storeRefusal }), null);
  // a relay missing either function is no relay: the call answers as a caller handing none
  for (const partial of [{ doAnswer }, { storeRefusal }, {}]) {
    const g = await governorOp("governorstate", url("op=governorstate"), stubStore(400, { ok: false, reason: "BAD_JSON" }), partial);
    assert.deepEqual(g, { silent: true });
  }
});

test("R18, R19: the Worker's arm answers exactly the two ops, and null for any other, asking the store nothing", async () => {
  assert.deepEqual([...GOVERNOR_OPS], ["governorstate", "governorconfig"]);
  const untouched = { fetch: async () => { throw new Error("asked the store"); } };
  const plane = { json, doAnswer, storeRefusal, storeSilent };
  for (const op of ["links", "governoradmit", "governorreport", "", "GOVERNORSTATE"])
    assert.equal(await governorOpResponse(op, url(`op=${op}`), untouched, plane), null, op);
  const w = world();
  w.g.governorReport({ host: "b.example", status: 503 });
  const res = await governorOpResponse("governorstate", url("op=governorstate"), () => storeOver(w.g), plane);
  assert.deepEqual([res.status, await res.json()], [200, { ok: true, hosts: w.g.governorState({}).hosts }]);
});

/* ---- through the whole plane ---- */
const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));   // plane R6's entry (K846)
let mf;
const T = { admin: "hg-adm", member: "hg-mem", probe: "hg-prb" };
const call = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}) });
  const j = await res.json();
  return (j && typeof j === "object" && "result" in j) ? j.result : j;
};
const S = {};

before(async () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: T.admin, MEMBER_TOKEN: T.member, PROBE_TOKEN: T.probe, VERSION: "test" },
    outboundService() { return new Response("unscripted", { status: 500 }); },
  });
  /* Two enrolled administrators and an ordinary member, then the founder's claim and session (Membership
     Architecture 4.2/4.3: the first two administrators are enrolled before anyone else). */
  const enrol = async (id, role, capabilities) => {
    const add = await call(`op=memberadd&token=${T.admin}`, { memberId: id, cover: `cover for ${id}`, role, capabilities });
    if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await call("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-hg` });
    if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await call("op=login", { role: `member:${id}`, password: `${id}-passphrase-hg` });
    if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  S.ruth = await enrol("ruth", "admin", ["contribute"]);
  S.gus = await enrol("gus", "admin", ["contribute"]);
  S.cai = await enrol("cai", "member", []);
  const claimed = await call("op=claim", { bootstrapToken: T.admin, password: "founder-passphrase-hg" });
  if (!claimed?.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
  const fl = await call("op=login", { password: "founder-passphrase-hg" });
  if (!fl?.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
  S.founder = fl.token;
});
after(async () => { if (mf) await mf.dispose(); });

test("R18: op=governorstate is reached by the admin, member and probe classes and by every session", async () => {
  const setup = await call(`op=governorconfig&token=${T.admin}&host=state.example&appetite_per_min=7`);
  assert.equal(setup.ok, true);
  const probeSetup = await call(`op=governorconfig&token=${T.probe}&host=state.example&appetite_per_min=5`);
  assert.equal(probeSetup.ok, true);
  for (const [who, tok, want] of [["admin", T.admin, 7], ["member", T.member, 7], ["probe (its own namespace)", T.probe, 5],
                                  ["the founder's session", S.founder, 7], ["an enrolled administrator's session", S.ruth, 7],
                                  ["a member's session", S.cai, 7]]) {
    const r = await call(`op=governorstate&token=${tok}&host=state.example`);
    assert.equal(r.ok, true, `${who}: ${JSON.stringify(r)}`);
    assert.deepEqual(r.hosts.map((h) => [h.host, h.appetite_per_min]), [["state.example", want]], who);
    const all = await call(`op=governorstate&token=${tok}`);
    assert.equal(all.ok, true, who);
    assert.ok(all.hosts.some((h) => h.host === "state.example"), who);
  }
  const anon = await call("op=governorstate&host=state.example");
  assert.equal(anon.ok, false);                              // no credential, no state
});

test("R19: op=governorconfig is reached by the admin and probe classes and the founder's session alone", async () => {
  const appetiteOf = async (h) => ((await call(`op=governorstate&token=${T.admin}&host=${h}`)).hosts[0] || {}).appetite_per_min ?? null;
  const allowed = [["admin", T.admin], ["the founder's session", S.founder]];
  let n = 11;
  for (const [who, tok] of allowed) {
    const r = await call(`op=governorconfig&token=${tok}&host=cfg.example&appetite_per_min=${n}`);
    assert.deepEqual([r.ok, r.appetite_per_min], [true, n], `${who}: ${JSON.stringify(r)}`);
    assert.equal(await appetiteOf("cfg.example"), n, who);
    n++;
  }
  const p = await call(`op=governorconfig&token=${T.probe}&host=cfg-probe.example&appetite_per_min=3`);
  assert.deepEqual([p.ok, p.appetite_per_min], [true, 3]);
  assert.equal((await call(`op=governorstate&token=${T.probe}&host=cfg-probe.example`)).hosts[0].appetite_per_min, 3);
  for (const [who, tok] of [["member", T.member], ["an enrolled administrator's session", S.ruth],
                            ["another enrolled administrator's session", S.gus], ["a member's session", S.cai]]) {
    const r = await call(`op=governorconfig&token=${tok}&host=cfg-refused.example&appetite_per_min=2`);
    assert.equal(r.ok, false, `${who}: ${JSON.stringify(r)}`);
  }
  assert.equal(await appetiteOf("cfg-refused.example"), null);   // nothing a refused caller asked for landed
  const need = await call(`op=governorconfig&token=${T.admin}&appetite_per_min=2`);
  assert.deepEqual([need.ok, need.reason], [false, "NEED_HOST"]);
  for (const bad of ["0", "-4", "abc"]) {
    const r = await call(`op=governorconfig&token=${T.admin}&host=cfg.example&appetite_per_min=${bad}`);
    assert.deepEqual([r.ok, r.reason, r.check], [false, "BAD_APPETITE", "host-governor.R12"], bad);
  }
  assert.equal(await appetiteOf("cfg.example"), 12);
  const cleared = await call(`op=governorconfig&token=${T.admin}&host=cfg.example`);
  assert.deepEqual([cleared.ok, cleared.appetite_per_min], [true, null]);
  assert.equal(await appetiteOf("cfg.example"), null);
});

test("R18, R14: through the whole plane, a refusal reported to the Durable Object's route is the hold op=governorstate answers (queue-conditions' share)", async () => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const route = async (path, body) => (await (await obj.fetch(`http://x/${path}`, { method: "POST", body: JSON.stringify(body) })).json()).result;
  const held = await route("governorreport", { host: "held.example", status: 429 });
  assert.deepEqual([held.recorded, held.refusals, held.cooloff_ms >= 60_000], [true, 1, true]);
  const r = await call(`op=governorstate&token=${T.admin}&host=held.example`);
  assert.equal(r.ok, true);
  assert.deepEqual([r.hosts[0].cooloff_until, r.hosts[0].refusals, r.hosts[0].last_refusal_status],
                   [held.cooloff_until, 1, 429]);
  assert.equal((await route("governoradmit", { host: "held.example" })).reason, "cooling_off");
  const again = await call(`op=governorstate&token=${T.admin}&host=held.example`);
  assert.deepEqual([again.hosts[0].refused_total, again.hosts[0].granted], [1, 0]);
});
