/* plane R15 (N520; DEC-116): `docket` composed on the object's storage: built in the order of R2 (directly after
   `publication`), migrated as R3 says, its tables declared to purge through record-core (K23), started so that it fills
   `reevaluation`'s docket registration before the first request, handed to `public-read`, `network-notices` and `queue`
   as the docket they read, and every op of its ops map reaching its handler through control-plane's door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store, storage } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { publicReadOf } from "../../../src/public-read/index.mjs";
import { networkNoticesOf } from "../../../src/network-notices/index.mjs";
import { docketOf, docketOps, DOCKET_TABLES } from "../../../src/docket/index.mjs";

const DK = [...DOCKET_TABLES];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const one = (x, q, ...a) => [...x.ctx.storage.sql.exec(q, ...a)][0];

/* Every module that declared a table to purge, in declaration order (record-core R21), each named once. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

test("R15: construction builds docket, which creates its tables and declares them to purge under its own name", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of DK) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of DK) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "docket", t);
  /* its record entries' mint seed is held under its name (record-core R70) */
  assert.equal(rc.registerMintSeed("docket", []).ok, false);
  /* negative control: a table no module declared is free to a probe */
  assert.equal(rc.declarePurge("zz-probe", ["zz_none"]).ok, true);
});

test("R15, R2: docket is built directly after publication in the modules' order and before network-notices and layer 9, as the purge declarations show", async () => {
  const order = declarers(await store());
  const at = (m) => { const i = order.indexOf(m); assert.notEqual(i, -1, m); return i; };
  assert.equal(at("docket"), at("publication") + 1, "directly after publication");
  assert.ok(at("docket") < at("network-notices"), "before network-notices");
  assert.ok(at("docket") < at("local-facts"), "before layer 9");
});

test("R15, R3: a store written before docket opens with its tables, and a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  for (const t of DK) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(DK.some((t) => tableNames(first).includes(t)), false);
  const old = await store({ db });
  for (const t of DK) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master WHERE name LIKE 'docket%' ORDER BY name`)].map((r) => ({ ...r }));
  const was = shape(old);
  const again = await store({ db });
  assert.deepEqual(shape(again), was);
  for (const t of DK) assert.equal(one(again, `SELECT count(*) c FROM ${t}`).c, 0, t);
});

test("R15: before the first request docket has filled reevaluation's docket registration, so no other module can, and it was built with the plane's environment", async () => {
  const x = await store({ env: { BIO_NOW_MS: "1790000000000" } });
  const probe = reevaluationOf(x.ctx).registerDocket("zz-probe", { withdrawals: () => ({}), contested: () => ({}) });
  assert.equal(probe.ok, false, JSON.stringify(probe));
  assert.deepEqual(docketOf(x.ctx).registration, { ok: true, module: "docket" });
  assert.equal(docketOf(x.ctx).env, x.env, "docket holds the object's environment");
  /* negative control: a reevaluation on a host the plane never built takes the registration */
  assert.equal(reevaluationOf(storage().ctx).registerDocket("zz-probe", { withdrawals: () => ({}), contested: () => ({}) }).ok, true);
});

test("R15: public-read and network-notices read the plane's own docket", async () => {
  const x = await store();
  const docket = docketOf(x.ctx);
  assert.equal(publicReadOf(x.ctx).docket, docket, "public-read R20, R21");
  assert.equal(networkNoticesOf(x.ctx).docket, docket, "network-notices R21");
  /* observed through public-read's own answer: the docket's latest date as the plane's docket answers it */
  let asked = null;
  const was = docket.lastEntryOf;
  docket.lastEntryOf = (a) => { asked = a; return "2026-10-01"; };
  try { assert.equal(publicReadOf(x.ctx).docket.lastEntryOf({ case: "CASE-1" }), "2026-10-01"); }
  finally { docket.lastEntryOf = was; }
  assert.deepEqual(asked, { case: "CASE-1" });
});

/* Instants and minted ids differ between two objects; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");

test("R15, R5: every op of docket's map is in the route map and answers through control-plane's door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const ops = Object.keys(docketOps(null, u, null));
  assert.deepEqual(ops, ["docketfile", "docketpressure", "docket", "docketprepare", "docketpost", "docketdecline", "docketinvitation"]);
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  for (const op of ops) assert.ok(map.includes(op), `the route map lacks ${op}`);
  for (const op of ops) {
    const path = `${op}?viewer=member:nobody&author=member:nobody&by=member:nobody&case=CASE-none&entry=DKT-none`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const direct = await docketOps(docketOf(twin.ctx), new URL(`http://do/${path}`), {})[op]();
    assert.equal(res.status, 200, op);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), op);
  }
  /* negative control: a machine's filing is docket's own refusal, inside the door's envelope */
  const machine = await (await x.fetch("/docketfile?viewer=class:admin&author=token:admin", { method: "POST", body: "{}" })).json();
  assert.deepEqual([machine.ok, machine.result.ok, machine.result.reason], [true, false, "MACHINE_CANNOT_FILE_DOCKET"]);
});

test("R15: queue is handed the plane's docket, so op=queue through the door asks that docket's coreDue for queue-producers' docket items", async () => {
  const x = await store();
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('bob', 'Cover bob', 'h_bob', 'member', 'active', '["contribute"]', 't', 't')`);
  const asked = [];
  docketOf(x.ctx).coreDue = (a) => { asked.push(a); return { ok: true, cases: [] }; };
  const r = await (await x.fetch("/queue?member=bob&viewer=member:bob")).json();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.ok(asked.length >= 1, "the plane's docket was asked for the core due");
  assert.ok(asked.every((a) => a && a.viewer !== undefined), "asked with a viewer");
});
