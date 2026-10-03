/* plane: the Durable Object class (R1–R5, R9), driven through its own interface: construction over a storage, its
   `fetch` (the store's one door), its route map, `alarm`/`onAlarm`/`schedAlarmAt`, and what the modules it built hold. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { store, storage, Store, STEP_ORDER } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { MODULE_ORDER } from "../../../src/membership/index.mjs";
const STEP = "control-plane";   /* control-plane's promotion step (its R42), registered under its name */
const { MODULE_MAPS, ownMaps } = await import("./maps.mjs");   /* after the fixture: control-plane reaches `cloudflare:workers` */

const tables = (sql) => [...sql.exec(`SELECT type, name, sql FROM sqlite_master ORDER BY type, name`)].map((r) => ({ ...r }));
const json = async (res) => ({ status: res.status, body: await res.json() });

test("R1: construction starts instance-setup once per object: a second construction on the same object starts nothing, and its registrations stand once", async () => {
  const st = storage();
  const env = { STORE: { idFromName: (n) => n } };
  for (let i = 0; i < 2; i++) { new Store(st.ctx, env); for (const p of st.blocked) await p; }
  const again = await instanceSetupOf(st.ctx).start();
  assert.equal(again.started, false, "instance-setup had already started on this object");
  /* Its registrations were made once: the producing-group fact and the group-domain consumer refuse a second. */
  assert.equal(promotionOf(st.ctx).registerFact("producingGroup", "instance-setup", () => null).ok, false);
  assert.equal(schedulerOf(st.ctx).register("instance-setup", { name: "group-domain-recheck", key: "groupdomain",
    due: () => null, wake: () => null, tick: () => null }).reason, "CONSUMER_DECLARED");
});

test("R1, R5: every store request is answered by control-plane's one frame: the envelope, the unknown route, the body that is not JSON, and instance-setup's routes inside it", async () => {
  const x = await store();
  const ok = await json(await x.fetch("/instancegrouppublic"));
  assert.equal(ok.status, 200);
  assert.equal(ok.body.ok, true);
  assert.ok(Object.hasOwn(ok.body, "result"), "an answer is {ok: true, result}");
  const unknown = await json(await x.fetch("/no-such-op"));
  assert.deepEqual(unknown, { status: 400, body: { ok: false, error: "unknown op: no-such-op" } });
  const inherited = await json(await x.fetch("/toString"));
  assert.equal(inherited.status, 400, "an inherited name is no route");
  const bad = await json(await x.fetch("/instancegroupseed", { method: "POST", body: "{not json" }));
  assert.equal(bad.status, 400);
  assert.equal(bad.body.reason, "BAD_JSON");
  const seeded = await json(await x.fetch("/instancegroupseed?author=admin", { method: "POST", body: JSON.stringify({ slug: "oak-watch" }) }));
  assert.equal(seeded.body.result.ok, true, "instance-setup's route is reached through the frame");
  assert.equal(seeded.body.result.group, "oak-watch");
});

test("R2: record-core is handed the evidence bucket and the prefix of the object's own namespace, `bio` for any other object", async () => {
  for (const [name, prefix] of [["bio", "bio/captures/"], ["scratch", "scratch/captures/"], [null, "bio/captures/"]]) {
    const keys = [];
    const bucket = { put: async (k) => { keys.push(k); }, get: async (k) => { keys.push(k); return null; }, head: async (k) => { keys.push(k); return null; } };
    const st = storage();
    st.ctx.id = { equals: (other) => name !== null && other === name, toString: () => String(name) };
    new Store(st.ctx, { STORE: { idFromName: (n) => n }, CAPTURES: bucket });
    for (const p of st.blocked) await p;
    await recordOf(st.ctx).evidenceStore().head("ab12");
    assert.deepEqual(keys, [`${prefix}ab12`], `${name}: the bucket handed in, under ${prefix}`);
  }
  const st = storage();
  new Store(st.ctx, { STORE: { idFromName: (n) => n } });
  for (const p of st.blocked) await p;
  assert.equal(recordOf(st.ctx).evidenceStore(), null, "no bucket bound, no evidence store");
});

test("R2: before the first request every module's start registrations are held, each slot in the modules' order, the stats sight as `plane`, the leg grades as `inquiry` and control-plane's step under its name", async () => {
  const x = await store();
  /* The stats sight and the leg grades are the one registration of their slot. */
  const second = recordOf(x.ctx).registerStatsSource("probe", () => ({}));
  assert.equal(second.code, "STATS_SOURCE_DECLARED");
  assert.equal(second.heldBy, "plane");
  assert.deepEqual(retrievalOf(x.ctx).registerLegGrades("probe", () => []), { ok: false, reason: "RESOLVER_DECLARED", module: "probe", declaredBy: "inquiry" });
  /* Every step a module of the order registers at start is held: a second registration of each is refused. */
  for (const m of ["provenance", "extraction", "retrieval", "inquiry", "basis-versions", "strength", "bias", "ai-runs",
                   "intent", "reevaluation", "publication", "ratification", "standards", "conformance", "actions",
                   "escalation", "action-plans", "monitoring", "tasks", STEP])
    assert.equal(promotionOf(x.ctx).registerStep(m, {}).ok, false, `${m}'s step is held`);
  /* queue and tasks have made their tables. */
  const names = tables(x.ctx.storage.sql).map((t) => t.name);
  for (const t of ["tasks", "queue_state"]) assert.ok(names.includes(t), `table ${t}`);
});

test("R2, R10 (K1416; control-plane R42): control-plane's step ranks after every module of layers 1-10 and before every later module of `build/modules.json`, directly before the first layer-11 module, so checks and refusals keep their order", async () => {
  const file = JSON.parse(readFileSync(new URL("../../../../build/modules.json", import.meta.url), "utf8"));
  const mods = (file.modules || file).filter((m) => m.id !== STEP);
  const at = STEP_ORDER.indexOf(STEP);
  assert.equal(STEP_ORDER.filter((m) => m === STEP).length, 1, "the step is ranked once");
  for (const m of mods) {
    assert.ok(STEP_ORDER.includes(m.id), `${m.id} is in the step order`);
    if (m.layer <= 10) assert.ok(STEP_ORDER.indexOf(m.id) < at, `${m.id} (layer ${m.layer}) ranks before the step`);
    else assert.ok(STEP_ORDER.indexOf(m.id) > at, `${m.id} (layer ${m.layer}) ranks after the step`);
  }
  assert.equal(STEP_ORDER[at + 1], mods.find((m) => m.layer > 10).id, "directly before the first layer-11 module");
  assert.deepEqual(STEP_ORDER.filter((m) => m !== STEP), MODULE_ORDER.filter((m) => m !== STEP), "otherwise the modules' order");
  /* Observed on a promotion: probes registered either side of it see its testimony check run between them. */
  const x = await store();
  instanceSetupOf(x.ctx).instanceGroupSeed({ slug: "oak-watch", author: "admin" });
  const seen = [];
  for (const m of ["scheduler", "wizard-scripts", "affordances"]) promotionOf(x.ctx).registerStep(m, { check: () => { seen.push(m); return null; } });
  provenanceOf(x.ctx).onTestimony("zz-probe", { check: () => { seen.push(STEP); return null; } });
  const r = await x.call("/testify?author=member:m-riley", { words: "The gate was chained.", observedAt: "2026-09-01" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(seen, ["scheduler", STEP, "wizard-scripts", "affordances"]);
});

test("R3: the migration pass is idempotent: a second construction on one storage changes no table, and the PROJ ledger is seeded from the live bundles", async () => {
  const x = await store();
  const sql = x.ctx.storage.sql;
  const cols = [...sql.exec(`PRAGMA table_info(bundles)`)].filter((c) => c.pk || (c.notnull && c.dflt_value === null));
  const id = "PROJ-2026-zz-seed";
  sql.exec(`INSERT INTO bundles (${cols.map((c) => c.name).join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
           ...cols.map((c) => (c.name === "bundle_id" ? id : /INT/i.test(c.type) ? 0 : "x")));
  const was = tables(sql);
  const again = await store({ db: x.db });
  assert.deepEqual(tables(again.ctx.storage.sql), was, "the second migration changes no table");
  assert.deepEqual([...sql.exec(`SELECT source FROM minted_ids WHERE id = ?`, id)].map((r) => r.source), ["live"]);
});

test("R3: a store written before the additive columns opens: the columns are added before and after the owners' tables, and its schema ends as a fresh store's", async () => {
  const fresh = await store();
  const db = new DatabaseSync(":memory:");
  await store({ db });
  /* An older store: `bundles` without REC-18's column and `inquiry_basis` without REC-82's, its index gone with it. */
  db.exec(`DROP INDEX IF EXISTS inquiry_basis_content`);
  db.exec(`ALTER TABLE bundles DROP COLUMN inquiry_subject_entity`);
  db.exec(`ALTER TABLE inquiry_basis DROP COLUMN content_id`);
  const old = await store({ db });
  const cols = (t) => [...old.ctx.storage.sql.exec(`PRAGMA table_info(${t})`)].map((c) => c.name);
  assert.ok(cols("bundles").includes("inquiry_subject_entity"));
  assert.ok(cols("inquiry_basis").includes("content_id"));
  const shape = (sql) => tables(sql).map((t) => ({ type: t.type, name: t.name }));
  assert.deepEqual(shape(old.ctx.storage.sql), shape(fresh.ctx.storage.sql));
  const ok = await json(await old.fetch("/stats"));
  assert.equal(ok.body.ok, true, "it answers");
});

test("R3: a migration that throws leaves the object unanswering: the pass is not skipped", async () => {
  const st = storage();
  st.ctx.storage.sql.exec(`CREATE VIEW bundles AS SELECT 1 AS bundle_id`);   /* an object no owner's CREATE can pass */
  new Store(st.ctx, { STORE: { idFromName: (n) => n } });
  const settled = await Promise.allSettled(st.blocked);
  assert.equal(settled[0].status, "rejected", "the migration pass threw inside blockConcurrencyWhile");
});

test("R4: `alarm` and `onAlarm(now)` are scheduler's, answered as it answers; `schedAlarmAt` is its alarm read", async () => {
  const x = await store();
  const now = Date.now();
  const r = await x.s.onAlarm(now);
  assert.deepEqual(Object.keys(r).slice(0, 10),
    ["swept", "drained", "created", "folded", "refused", "waiting", "remaining", "rearmed", "nextAt", "probes"]);
  assert.equal(await x.s.schedAlarmAt(), await schedulerOf(x.ctx).alarmAt());
  assert.equal(await x.s.schedAlarmAt(), r.nextAt, "the alarm stands where the reconcile left it");
  await x.s.alarm();
  assert.equal(await x.s.schedAlarmAt(), await schedulerOf(x.ctx).alarmAt());
});

test("R5: the route map is the union of every module's own ops map, instance-setup's and control-plane's, in that order, and each op answers as its module's own map does", async () => {
  const x = await store();
  const url = new URL("http://do/x?viewer=member:nobody&id=X-none&sha256=" + "0".repeat(64));
  const map = x.s.routes(url, {});
  const own = ownMaps(x.ctx, url, {});
  const union = Object.assign({}, ...own.map(([, m]) => m));
  assert.deepEqual(Object.keys(map), Object.keys(union), "the same routes in the same order");
  assert.equal(own.length, MODULE_MAPS.length);
  /* Each op is the handler its module's map holds: the reads that write nothing answer alike through either. */
  let n = 0;
  for (const op of ["instancegrouppublic", "groupidentitypublic", "profiles", "stats", "projectvisibility", "content",
                    "inboxlist", "publishedlist", "taskslist", "affordancefacts", "actionkinds"]) {
    if (!Object.hasOwn(map, op)) continue;
    const a = JSON.stringify(await map[op]() ?? null), b = JSON.stringify(await union[op]() ?? null);
    assert.equal(a, b, `op=${op}`);
    n++;
  }
  assert.ok(n >= 6, `${n} reads compared`);
});

test("R9: the plane holds no route, no table and no answer of its own: every route is a module's, and every answer is a module's through the door", async () => {
  const x = await store();
  const url = new URL("http://do/x");
  const owners = new Map();
  for (const [mod, m] of ownMaps(x.ctx, url, null)) for (const op of Object.keys(m)) if (!owners.has(op)) owners.set(op, mod);
  for (const op of Object.keys(x.s.routes(url, null))) assert.ok(owners.has(op), `op=${op} is a module's`);
  /* The class answers nothing outside the frame: the unknown route's refusal is the frame's own sentence. */
  const r = await json(await x.fetch("/plane"));
  assert.deepEqual(r.body, { ok: false, error: "unknown op: plane" });
  /* No table is named for it. */
  assert.equal(tables(x.ctx.storage.sql).some((t) => /plane/i.test(t.name) && !/^(?:sqlite_)/.test(t.name)), false);
});
