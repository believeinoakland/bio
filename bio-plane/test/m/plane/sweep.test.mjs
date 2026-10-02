/* plane R2, R5 over link-sweep's composition (N506, T24): link-sweep built after monitoring and before the scheduler,
   registering with monitoring at creation (monitoring R66) and with the composed `capture-requests` (link-sweep R12),
   so its sweep scope check is held before the first sweep service (K1163); the scheduler's `gathering-sweep` owner
   reaching that one instance (K1210); and link-sweep's ops map (`sweeps`, its R9) spread in the route map where
   monitoring's held it. Each driven on the Durable Object class itself. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, storage, Store } from "./fixture.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { captureRequestsOf } from "../../../src/capture-requests/index.mjs";
import { monitoringOf, monitoringOps } from "../../../src/monitoring/index.mjs";
import { linkSweepOf, linkSweepOps, LINK_SWEEP_MODULE, LINK_SWEEP_TABLES } from "../../../src/link-sweep/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const json = async (res) => ({ status: res.status, body: await res.json() });
/* A daemon credential bound, so capture-requests drains (its R38). */
const DAEMON = { DAEMON_TOKEN: "dmn-plane" };
const ENV = { STORE: { idFromName: (n) => n }, ...DAEMON };

/* One object over a fresh storage, `before(ctx)` run on the storage before the class is constructed. */
async function built(before = () => {}) {
  const st = storage();
  before(st.ctx);
  new Store(st.ctx, ENV);
  for (const p of st.blocked) await p;
  return { ctx: st.ctx };
}

test("R2 (N506, K1163; link-sweep R12): link-sweep is handed the composed capture-requests, so its sweep scope check is held under its name on a fresh instance before any sweep service runs, and a sweep-named request is judged by it at the drain", async () => {
  /* No sweep service is asked before the drain: a scheduler with no owners, so its start reaches no link-sweep and the
     registration can come only from the construction. */
  const x = await built((ctx) => schedulerOf(ctx, ENV, { owners: {} }));
  const probe = captureRequestsOf(x.ctx).registerSweepScope("zz-probe", () => ({ ok: true, scope: ["https://x/"] }));
  assert.deepEqual([probe.ok, probe.reason, probe.module], [false, "LISTENER_DECLARED", LINK_SWEEP_MODULE]);
  assert.equal(LINK_SWEEP_MODULE, "link-sweep");
  assert.equal(linkSweepOf(x.ctx).registerSweepScope(), true, "link-sweep holds its registration as done");
  const refusal = await drainedSweepRefusal(x.ctx);
  assert.match(refusal, /no sweep is named INQ-2026-0001-zz#agendas/);
  assert.doesNotMatch(refusal, /no scope check is registered/);
});

test("R2 negative control (K1163): link-sweep built before the plane without capture-requests holds no scope check until a sweep service runs, so the same request is refused for want of one", async () => {
  const x = await built((ctx) => {
    linkSweepOf(ctx);   /* the wrong order: link-sweep first, handed nothing; the per-storage instance is this one */
    schedulerOf(ctx, ENV, { owners: {} });
  });
  const refusal = await drainedSweepRefusal(x.ctx);
  assert.match(refusal, /no scope check is registered/);
});

test("R2 (N506; monitoring R66, link-sweep R1): construction builds link-sweep after monitoring: its registration with monitoring's seam accepted, its tables made and declared to purge under its name, after monitoring's declaration", async () => {
  const x = await store();
  const s = linkSweepOf(x.ctx);
  assert.deepEqual(s.registration && s.registration.ok, true, JSON.stringify(s.registration));
  /* negative control: monitoring holds the one share; a second registration is refused */
  assert.notEqual(monitoringOf(x.ctx).registerSweep("zz-probe", { grammar: () => [], fence: () => null,
                                                                 dueForSlate: () => [] }).ok, true);
  const rc = recordOf(x.ctx);
  const names = [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
  for (const t of LINK_SWEEP_TABLES) {
    assert.ok(names.includes(t.name), `table ${t.name}`);
    assert.equal(rc.declarePurge("zz-probe", [t.name]).declaredBy, "link-sweep", t.name);
  }
  const order = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!order.includes(m)) order.push(m);
  }
  assert.ok(order.indexOf("monitoring") !== -1 && order.indexOf("monitoring") < order.indexOf("link-sweep"), order.join());
});

test("R2, R4 (K1210; scheduler R5): the scheduler's `gathering-sweep` owner reaches the instance the plane composed, so its wake asks a link-sweep that holds its scope check", async () => {
  const x = await store();
  const composed = linkSweepOf(x.ctx);
  assert.ok(schedulerOf(x.ctx).consumers().includes("gathering-sweep"), "the scheduler holds gathering-sweep");
  assert.equal(composed.registerSweepScope(), true);
  /* the scheduler's default owner is `linkSweepOf(ctx)`: the same instance, created by the plane before it */
  assert.equal(linkSweepOf(x.ctx, { captureRequests: null }), composed, "first call wins: the plane's");
  assert.equal(composed.sweepWake(Date.now()), null, "no sweep defined: nothing to wake for");
});

test("R5 (N506; link-sweep R9): `op=sweeps` is link-sweep's in the route map, at monitoring's place, and answers through control-plane's door what link-sweep's own map answers called directly", async () => {
  const u = new URL("http://do/sweeps?viewer=class:admin");
  assert.deepEqual(Object.keys(linkSweepOps(null, u)), ["sweeps"]);
  assert.equal(Object.hasOwn(monitoringOps(null, u, null), "sweeps"), false, "monitoring's map no longer holds it");
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  const i = (op) => map.indexOf(op);
  assert.ok(i("sweeps") !== -1, "the route map holds sweeps");
  assert.equal(i("addressfrequencyset") + 1, i("sweeps"), "directly after monitoring's ops");
  const res = await json(await x.fetch("/sweeps?viewer=class:admin"));
  const direct = JSON.parse(JSON.stringify(await linkSweepOps(linkSweepOf(twin.ctx), u).sweeps()));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, result: direct });
  assert.ok(Array.isArray(res.body.result.formats), "link-sweep R9's formats");
  /* negative control: a name no module serves is the door's refusal */
  assert.deepEqual(await json(await x.fetch("/sweepz")), { status: 400, body: { ok: false, error: "unknown op: sweepz" } });
});

/* One sweep-named capture request by an open run on an inquiry the admin sees, drained once; the row's refusal detail. */
async function drainedSweepRefusal(ctx) {
  const sql = ctx.storage.sql;
  const INQ = "INQ-2026-0001-zz";
  sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
            VALUES (?, 'inquiry', 'g', ?, 'open', 't', 't', 'sha')`, INQ, INQ);
  const t = new Date().toISOString(), later = new Date(Date.now() + 3600e3).toISOString();
  sql.exec(`INSERT INTO ai_runs (run, status, context_type, context_id, principal_plane, principal_claude, created, updated,
                                 expires, state) VALUES ('R-zz', 'running', 'inquiry', ?, 'class:admin', 'instance', ?, ?, ?, '{}')`,
           INQ, t, t, later);
  const cr = captureRequestsOf(ctx);
  const a = await cr.captureRequest({ run: "R-zz", address: "https://council.example.org/agendas/1", target: INQ,
                                      purpose: "investigate", sweep: `${INQ}#agendas` }, { viewer: "class:admin", caller: "class:admin" });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 400));
  const d = await cr.drain({});
  assert.equal(d.configured, true, d.detail);
  const row = [...sql.exec(`SELECT state, code, detail FROM capture_requests WHERE request = ?`, a.request)][0];
  assert.deepEqual([row.state, row.code], ["refused", "CAPTURE_SWEEP_OUT_OF_SCOPE"], JSON.stringify(row));
  return row.detail;
}
