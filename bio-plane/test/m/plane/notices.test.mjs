/* plane R2, R3, R5 over the modules T23 composes: `network-notices` built at its place (after project-stage),
   migrated in R3's pass, its start registrations held (public-read R18, scheduler R5) and its ops map spread into the
   route map; `corpus-export`'s ops map (its R6; N483, K1122) spread, so `op=export` and `op=exportlog` reach it
   through control-plane's door; and `monitoring` handed the composed `capture-requests`, so its sweep scope check
   (its R64) is held before the first sweep service (K1163). Each driven on the Durable Object class itself. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store, storage, Store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { networkNoticesOf, networkNoticesOps, NETWORK_NOTICES_TABLES } from "../../../src/network-notices/index.mjs";
import { corpusExportOf, corpusExportOps } from "../../../src/corpus-export/index.mjs";
import { captureRequestsOf } from "../../../src/capture-requests/index.mjs";
import { monitoringOf } from "../../../src/monitoring/index.mjs";

const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const json = async (res) => ({ status: res.status, body: await res.json() });
/* Instants differ between two objects; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");

/* Every module that declared a table to purge, in declaration order (record-core R21), each named once. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

test("R2: construction builds network-notices before the first request: its tables made and declared to purge under its name, its mint seed held, its three public reads registered with public-read, and the scheduler holding its two consumers", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of NETWORK_NOTICES_TABLES) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of NETWORK_NOTICES_TABLES) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "network-notices", t);
  assert.equal(rc.registerMintSeed("network-notices", []).ok, false, "its notice ids' seed is held under its name");
  /* The instance the plane built is the one every later caller reaches, and its registration was accepted. */
  const n = networkNoticesOf(x.ctx);
  assert.deepEqual(n.publicReadsRegistration, { ok: true, module: "network-notices",
                                               names: ["activitymethod", "noticespublic", "groupkeyspublic"] });
  const reads = publicReadOf(x.ctx).publicReads().filter((r) => r.module === "network-notices").map((r) => r.name);
  assert.deepEqual(reads, ["activitymethod", "groupkeyspublic", "noticespublic"]);
  /* The scheduler reaches it for its two consumers, in R5's order (scheduler R5). */
  const consumers = schedulerOf(x.ctx).consumers();
  for (const c of ["working-on-seal", "working-on-attest"]) assert.ok(consumers.includes(c), `scheduler holds ${c}`);
  /* A public read answers through the store's door, served by network-notices' own method (R10). */
  const method = await json(await x.fetch("/publicread?name=activitymethod"));
  assert.equal(method.status, 200);
  assert.equal(method.body.result.module, "network-notices");
  assert.deepEqual(method.body.result.result, JSON.parse(JSON.stringify(n.activityMethod())));
});

test("R2 negative control: on a host where another module took network-notices' public-read names first, the plane's construction leaves that holder standing and network-notices' registration refused, so the reads are not its", async () => {
  const st = storage();
  const env = { STORE: { idFromName: (n) => n } };
  const squat = publicReadOf(st.ctx).registerPublicReads("zz-squatter", { noticespublic: () => ({ ok: true, squat: true }) });
  assert.equal(squat.ok, true);
  new Store(st.ctx, env);
  for (const p of st.blocked) await p;
  const n = networkNoticesOf(st.ctx);
  assert.equal(n.publicReadsRegistration.ok, false);
  assert.equal(n.publicReadsRegistration.reason, "PROVIDER_DECLARED");
  assert.deepEqual(publicReadOf(st.ctx).publicReads().map((r) => [r.name, r.module]), [["noticespublic", "zz-squatter"]]);
});

test("R2: network-notices is built at its place in the modules' order: its purge declaration follows publication's and precedes every layer-9 and layer-10 module's", async () => {
  const order = declarers(await store());
  const at = (m) => { const i = order.indexOf(m); assert.notEqual(i, -1, `${m} declared: ${order.join()}`); return i; };
  assert.ok(at("publication") < at("network-notices"), "after publication");
  for (const m of ["conformance", "local-facts", "filing-templates", "monitoring"])
    assert.ok(at("network-notices") < at(m), `before ${m}`);
});

test("R3: a store written before network-notices opens with its tables: the migration pass creates them, and a second construction changes no table", async () => {
  const db = new DatabaseSync(":memory:");
  await store({ db });
  for (const t of NETWORK_NOTICES_TABLES) db.exec(`DROP TABLE IF EXISTS ${t}`);
  const old = await store({ db });
  for (const t of NETWORK_NOTICES_TABLES) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master ORDER BY type, name`)].map((r) => ({ ...r }));
  const was = shape(old);
  const again = await store({ db });
  assert.deepEqual(shape(again), was, "the second migration changes no table");
  const stats = await json(await again.fetch("/stats"));
  assert.equal(stats.body.ok, true, "it answers");
});

test("R5: network-notices' four ops are in the route map at its place (after project-stage's, before promotion's) and each answers through control-plane's door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const ops = Object.keys(networkNoticesOps(null, u, null));
  assert.deepEqual(ops, ["noticeprepare", "noticepost", "notices", "directorysubmission"]);
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  for (const op of ops) assert.ok(map.includes(op), `the route map lacks ${op}`);
  const i = (op) => map.indexOf(op);
  assert.ok(i("projectstage") === -1 || i("projectstage") < i("noticeprepare"));
  assert.equal(i("notices") + 1, i("directorysubmission"));
  for (const op of ops) {
    const path = `${op}?viewer=member:nobody&by=member:nobody&project=PROJ-2026-none&case=CASE-2026-0001-none&edition=1`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: JSON.stringify({ project: "PROJ-2026-none", digest: "0".repeat(64) }) });
    const url = new URL(`http://do/${path}`);
    const direct = await networkNoticesOps(networkNoticesOf(twin.ctx), url, { project: "PROJ-2026-none", digest: "0".repeat(64) })[op]();
    assert.equal(res.status, 200, op);
    const body = JSON.parse(mask(await res.text()));
    assert.deepEqual(body, JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), op);
    assert.equal(body.result.ok, false, `${op}: an unseen project is network-notices' own refusal`);
  }
  /* negative control: a name network-notices does not serve is the door's refusal */
  assert.deepEqual(await json(await x.fetch("/noticewithdraw")), { status: 400, body: { ok: false, error: "unknown op: noticewithdraw" } });
});

test("R5 (N483, K1122): `op=export` and `op=exportlog` reach corpus-export through control-plane's door: an export answered, logged with its note, and read back from the log; the map's arms are corpus-export's own", async () => {
  const u = new URL("http://do/");
  assert.deepEqual(Object.keys(corpusExportOps(null, () => null)), ["export", "exportlog"]);
  const x = await store();
  const map = x.s.routes(u, null);
  for (const op of ["export", "exportlog"]) assert.ok(Object.hasOwn(map, op), `the route map holds ${op}`);
  /* negative control: before any export, the log is empty */
  const empty = await json(await x.fetch("/exportlog"));
  assert.deepEqual([empty.status, empty.body.ok, empty.body.result.exports], [200, true, []]);
  const exp = await json(await x.fetch("/export?note=" + encodeURIComponent("quarterly copy")));
  assert.equal(exp.status, 200);
  assert.equal(exp.body.ok, true);
  const direct = JSON.parse(JSON.stringify(corpusExportOf(x.ctx).exportLog({ limit: 10 })));
  assert.equal(direct.exports.length, 1, "the export appended one row (corpus-export R1)");
  assert.equal(direct.exports[0].note, "quarterly copy");
  assert.equal(direct.exports[0].scope, "working-corpus");
  assert.ok(Array.isArray(exp.body.result.bundles), "the manifest answered (corpus-export R1)");
  const log = await json(await x.fetch("/exportlog?limit=5"));
  assert.deepEqual(log.body.result, { ...direct, limit: 5 }, "op=exportlog answers corpus-export's R2");
  /* the arm reads `limit`: one row asked, one delivered */
  await x.fetch("/export");
  const one = await json(await x.fetch("/exportlog?limit=1"));
  assert.deepEqual([one.body.result.exports.length, one.body.result.truncated], [1, true]);
});

test("R2 (K1163; monitoring R64): monitoring is handed the composed capture-requests, so its sweep scope check is held on a fresh instance before any sweep service runs, and a sweep-named request is judged by it at the drain", async () => {
  /* No sweep service is asked before the drain: a scheduler with no owners, so its start reaches no monitoring and the
     registration can come only from the construction. */
  const st = storage();
  const env = { STORE: { idFromName: (n) => n }, ...DAEMON };
  schedulerOf(st.ctx, env, { owners: {} });
  new Store(st.ctx, env);
  for (const p of st.blocked) await p;
  const x = { ctx: st.ctx };
  /* the slot is taken, by monitoring, at construction */
  const probe = captureRequestsOf(x.ctx).registerSweepScope("zz-probe", () => ({ ok: true, scope: ["https://x/"] }));
  assert.deepEqual([probe.ok, probe.reason, probe.module], [false, "LISTENER_DECLARED", "monitoring"]);
  assert.equal(monitoringOf(x.ctx).registerSweepScope(), true, "monitoring holds its registration as done");
  /* a sweep-named request drained on the fresh instance is judged by monitoring's check (no such sweep), never refused
     for want of one */
  const refusal = await drainedSweepRefusal(x.ctx);
  assert.match(refusal, /no sweep is named INQ-2026-0001-zz#agendas/);
  assert.doesNotMatch(refusal, /no scope check is registered/);
});

test("R2 negative control (K1163): monitoring built before capture-requests without it, as the plane built them before, holds no scope check until a sweep service runs, so the same request is refused for want of one", async () => {
  const st = storage();
  monitoringOf(st.ctx);   /* the old order: monitoring first, handed nothing */
  /* and no sweep service asked before the drain: a scheduler with no owners, so its start reaches no monitoring */
  schedulerOf(st.ctx, { STORE: { idFromName: (n) => n }, ...DAEMON }, { owners: {} });
  new Store(st.ctx, { STORE: { idFromName: (n) => n }, ...DAEMON });
  for (const p of st.blocked) await p;
  const refusal = await drainedSweepRefusal(st.ctx);
  assert.match(refusal, /no scope check is registered/);
});

/* A daemon credential bound, so capture-requests drains (its R38). */
const DAEMON = { DAEMON_TOKEN: "dmn-plane" };

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
