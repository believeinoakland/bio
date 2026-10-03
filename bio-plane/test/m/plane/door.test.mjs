/* plane R1, R5: the Durable Object class driven through control-plane's door (its R25, R26), the frame every store
   route passes. Moved from control-plane's `store-class.test.mjs` (K856): it constructs this module's class, which
   control-plane's tests may not import (P4). The class is constructed for real over a Durable Object storage at the plane's shape
   (node:sqlite behind `sql.exec` answering a cursor, as workerd's does), and driven through its `fetch`, which is this
   module's `dispatch`. Each route's answer through the door is compared with instance-setup's own route called directly
   (`instanceSetupOps(m, url, body)[op]()`) on a second object's storage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import "./fixture.mjs";   /* answers `cloudflare:workers` */
const D = await import("../../../src/control-plane/dispatch.mjs");
const { Store } = await import("../../../src/plane/store.mjs");
const S = await import("../../../src/setup.mjs");

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`expected one row, got ${rest.length}`); return rest[0]; },
  };
  return c;
}

/** One Durable Object's context. `fail(q)` makes a matching statement throw, as a storage that fails. */
function object() {
  const db = new DatabaseSync(":memory:");
  let fail = null;
  const sql = {
    exec(q, ...args) {
      if (fail && fail(q)) throw new Error("SQLITE_IOERR secret-value /srv/plane/src/setup.mjs:4242");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
    get databaseSize() { return 0; },
  };
  const blocked = [];
  const ctx = {
    storage: { sql, transactionSync: (fn) => fn(), getAlarm: async () => null, setAlarm: async () => {}, deleteAlarm: async () => {} },
    id: { equals: () => false, toString: () => "do" },
    blockConcurrencyWhile(fn) { const p = fn(); blocked.push(p); return p; },
    waitUntil() {},
  };
  return { ctx, env: { STORE: { idFromName: (n) => n } }, blocked, failWith(pred) { fail = pred; } };
}
const settle = async (o) => { const out = []; for (const p of o.blocked) out.push(await p); o.blocked.length = 0; return out; };
const started = (outs) => outs.filter((x) => x && typeof x === "object" && "started" in x);

/* The fourteen instance-setup routes, each driven with a request that exercises it; the stamps are the ones the Worker
   door sets (R17). Order matters: the writes run before the reads that show them. */
const DRIVES = [
  ["instancegroup", "GET"],
  ["instancegrouppublic", "GET"],
  ["instancegroupseed?author=token:admin", "POST", { slug: "grp-rivertown" }],
  ["instancegroup", "GET"],
  ["instancegrouppublic", "GET"],
  ["groupnameset?by=admin", "POST", { name: "River Town Watch" }],
  ["groupdomainset?by=admin&origin=https://plane.example", "POST", { domain: "not a domain" }],
  ["groupidentity", "GET"],
  ["groupidentitypublic", "GET"],
  ["profiles", "GET"],
  ["profilesset?by=member:nobody", "POST", { profiles: [] }],
  ["runtimeobservations", "GET"],
  ["cpuprobestart", "POST", { run: "r1", iterations: 10, budgetMs: 100 }],
  ["recordcpuprobestep", "POST", { run: "r1", step: 1, elapsedMs: 3, iterations: 10 }],
  ["cpuprobeend", "POST", { run: "r1", completed: 1, elapsedMs: 4, reason: "done" }],
  ["cpuprobestate", "GET"],
  ["instancegroupseed?author=token:admin", "POST", { slug: "grp-other" }],
];
const req = ([path, method, body]) => new Request(`http://do/${path}`, body === undefined ? { method } : { method, body: JSON.stringify(body) });
/* Instants differ between two runs; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>").replace(/"(at|ms|elapsed_ms|recorded_ms)":\d{10,}/g, '"$1":<n>');

test("R1: the class whose fetch is control-plane's door: at construction it starts instance-setup once per object, and a second construction on the same storage starts nothing", async () => {
  const o = object();
  const first = new Store(o.ctx, o.env);
  const s1 = started(await settle(o));
  assert.equal(s1.length, 1, "instance-setup started once by the construction");
  assert.equal(s1[0].started, true);
  assert.equal(s1[0].ok, true);
  /* it started on this object's storage: its tables are there and its read answers from them */
  const r = await first.fetch(new Request("http://do/instancegroup"));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).result.ok, true);
  /* a second construction on the same storage starts nothing */
  new Store(o.ctx, o.env);
  const s2 = started(await settle(o));
  assert.equal(s2.length, 1);
  assert.equal(s2[0].started, false);
  /* negative control: a different object's storage starts on its own */
  const other = object();
  new Store(other.ctx, other.env);
  assert.equal(started(await settle(other))[0].started, true);
});

test("R1, R5: instance-setup's fourteen routes are part of the route map beside every module's, and each answers through the door, in the door's envelope, what its own route answers called directly", async () => {
  const ops = Object.keys(S.instanceSetupOps(null, new URL("http://do/"), null));
  assert.equal(ops.length, 14);
  assert.deepEqual([...new Set(DRIVES.map(([p]) => p.split("?")[0]))].sort(), [...ops].sort(), "every route is driven");
  const now = object(), before = object();
  const store = new Store(now.ctx, now.env);
  await settle(now);
  new Store(before.ctx, before.env);
  await settle(before);
  const m = S.instanceSetupOf(before.ctx, before.env);
  await m.start();
  for (const drive of DRIVES) {
    const a = await store.fetch(req(drive));
    const url = new URL(`http://do/${drive[0]}`);
    const direct = await S.instanceSetupOps(m, url, drive[2] === undefined ? null : drive[2])[url.pathname.slice(1)]();
    const at = await a.text();
    assert.equal(a.status, 200, drive[0]);
    assert.deepEqual(JSON.parse(mask(at)), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), drive[0]);
    assert.equal(JSON.parse(at).ok, true, `${drive[0]}: ${at.slice(0, 200)}`);
  }
  /* the other modules' routes answer through the same door, and an unserved route is the door's refusal */
  const alloc = await store.fetch(new Request("http://do/allocid?prefix=T&year=2026"));
  assert.deepEqual([alloc.status, (await alloc.json()).ok], [200, true]);
  const none = await store.fetch(new Request("http://do/nosuchroute"));
  assert.deepEqual([none.status, await none.json()], [400, { ok: false, error: "unknown op: nosuchroute" }]);
});

test("R1: an instance-setup route passes the door's body read — a non-JSON POST to instancegroupseed is 400 BAD_JSON and nothing is written; an empty body is null", async () => {
  const o = object();
  const store = new Store(o.ctx, o.env);
  await settle(o);
  for (const bad of ["{", "not json", "{'slug':'grp-x'}"]) {
    const r = await store.fetch(new Request("http://do/instancegroupseed?author=token:admin", { method: "POST", body: bad }));
    assert.equal(r.status, 400, bad);
    const j = await r.json();
    assert.deepEqual([j.ok, j.reason], [false, "BAD_JSON"], bad);
  }
  const g = await (await store.fetch(new Request("http://do/instancegroup"))).json();
  assert.equal(g.result.group, null, "nothing was seeded");
  /* an empty body is null, and the route answers its own refusal inside the envelope */
  const e = await store.fetch(new Request("http://do/instancegroupseed?author=token:admin", { method: "POST" }));
  const ej = await e.json();
  assert.deepEqual([e.status, ej.ok, ej.result.ok], [200, true, false]);
  /* negative control: a JSON body seeds */
  const ok = await store.fetch(new Request("http://do/instancegroupseed?author=token:admin", { method: "POST", body: JSON.stringify({ slug: "grp-x" }) }));
  assert.equal((await ok.json()).result.ok, true);
});

test("R1: a throwing instance-setup route answers STORE_INTERNAL_ERROR (C-69.4) with a correlation id and no stack, message, path or line", async () => {
  const o = object();
  const store = new Store(o.ctx, o.env);
  await settle(o);
  o.failWith((q) => /instance_group/.test(q));
  const logged = [], was = console.error;
  console.error = (...a) => logged.push(a.join(" "));
  let r, text;
  try { r = await store.fetch(new Request("http://do/instancegroup")); text = await r.text(); } finally { console.error = was; }
  assert.equal(r.status, 500);
  const j = JSON.parse(text);
  assert.deepEqual([j.ok, j.reason, j.code, j.check], [false, "STORE_INTERNAL_ERROR", "STORE_INTERNAL_ERROR", "C-69.4"]);
  assert.match(j.correlation, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.equal(/secret-value|setup\.mjs|SQLITE| at /.test(text), false, text);
  assert.equal(logged.length, 1);
  assert.deepEqual([JSON.parse(logged[0]).correlation, JSON.parse(logged[0]).op], [j.correlation, "instancegroup"]);
  /* negative control: the same route called directly, outside the frame, throws the storage's message */
  const m = S.instanceSetupOf(o.ctx, o.env);
  await assert.rejects(async () => S.instanceSetupOps(m, new URL("http://do/instancegroup"), null).instancegroup(), /secret-value/);
});

test("R1: the class alone is the frame — constructed without any wrapper it starts instance-setup once, and instance-setup's routes pass R26's body read and R25's catch", async () => {
  const o = object();
  const store = new Store(o.ctx, o.env);
  const s = started(await settle(o));
  assert.deepEqual(s.map((x) => x.started), [true], "instance-setup started once, by this class alone");
  const bad = await store.fetch(new Request("http://do/instancegroupseed?author=token:admin", { method: "POST", body: "{" }));
  assert.deepEqual([bad.status, (await bad.json()).reason], [400, "BAD_JSON"]);
  o.failWith((q) => /instance_group/.test(q));
  const was = console.error;
  console.error = () => {};
  let r, text;
  try { r = await store.fetch(new Request("http://do/instancegroup")); text = await r.text(); } finally { console.error = was; }
  assert.deepEqual([r.status, JSON.parse(text).reason], [500, "STORE_INTERNAL_ERROR"]);
  assert.equal(/secret-value|SQLITE/.test(text), false);
});

test("R2, R5 (N13): queue's, tasks' and affordances' maps are part of the route map, dispatched by control-plane's door — the construction makes their tables (queue, then tasks), each route answers through the door what its own map answers called directly, and they reach the map through control-plane's controlPlaneRoutes", async () => {
  const A = await import("../../../src/affordances.mjs");
  const Q = await import("../../../src/queue/index.mjs");
  const T = await import("../../../src/tasks/index.mjs");
  const u = new URL("http://do/");
  const qOps = Object.keys(Q.queueOps(null, u, null)), tOps = Object.keys(T.tasksOps(null, u, null));
  assert.ok(qOps.includes("queue") && tOps.includes("tasks"));
  const o = object();
  const store = new Store(o.ctx, o.env);
  await settle(o);
  const tables = o.ctx.storage.sql.exec("SELECT name FROM sqlite_master WHERE type='table'").toArray().map((r) => r.name);
  for (const t of Q.QUEUE_TABLES) assert.ok(tables.includes(t), `queue's ${t}`);
  /* they are control-plane's additions to the map (R5), and the map the class answers holds them */
  const mine = Object.keys(D.controlPlaneRoutes(o.ctx, u, null));
  const map = Object.keys(store.routes(u, null));
  const aOps = Object.keys(A.affordancesOps(null, u));
  for (const op of [...qOps, ...tOps, ...aOps]) {
    assert.ok(mine.includes(op), `controlPlaneRoutes lacks ${op}`);
    assert.ok(map.includes(op), `the map lacks ${op}`);
  }
  assert.deepEqual(aOps, ["affordancefacts", "affordancescreens"]);   /* affordances R37 (N528): the screens read */
  /* through the door, each answers what its own map answers on a second object */
  const twin = object();
  new Store(twin.ctx, twin.env);
  await settle(twin);
  for (const [path, ops, of] of [["tasks?viewer=class:admin", T.tasksOps, T.tasksOf], ["queue?member=ann&viewer=member:ann", Q.queueOps, Q.queueOf],
                                 ["affordancefacts?target=NOPE-1&viewer=class:admin&identity=class:admin&author=token:admin&by=class:admin", A.affordancesOps, A.affordancesOf],
                                 ["affordancescreens?viewer=member:ann", A.affordancesOps, A.affordancesOf]]) {
    const r = await store.fetch(new Request(`http://do/${path}`));
    const url = new URL(`http://do/${path}`);
    const direct = await ops(of(twin.ctx), url, null)[url.pathname.slice(1)]();
    assert.equal(r.status, 200, path);
    assert.deepEqual(JSON.parse(mask(await r.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), path);
  }
  /* negative control: a route no module serves is still the door's refusal */
  assert.equal((await store.fetch(new Request("http://do/queuenosuch"))).status, 400);
});
