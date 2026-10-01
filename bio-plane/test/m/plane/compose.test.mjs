/* plane R11 (K921): `local-facts` and `filing-templates` composed on the object's storage: built in the order of R2,
   migrated as R3 says (their tables, and filing-templates' take of the library `filings` R26 kept), their tables
   declared to purge through record-core (K23), and every op of their ops maps reaching its handler through
   control-plane's door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { localFactsOf, localFactsOps, LOCAL_FACTS_TABLES } from "../../../src/local-facts/index.mjs";
import { filingTemplatesOf, filingTemplatesOps, FILING_TEMPLATES_TABLES, MIGRATED_NOTE } from "../../../src/filing-templates/index.mjs";

const LF = LOCAL_FACTS_TABLES.map((t) => (typeof t === "string" ? t : t.name));
const FT = [...FILING_TEMPLATES_TABLES];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const one = (x, q, ...a) => [...x.ctx.storage.sql.exec(q, ...a)][0];

/* Every module that declared a table to purge, in declaration order (record-core R21: purge clears in that order),
   each named once, from the whole-store purge's `removed` and each table's declarer. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

test("R11: construction builds local-facts and filing-templates, each creating its tables and declaring them to purge under its own name", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of [...LF, ...FT]) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of LF) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "local-facts", t);
  for (const t of FT) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "filing-templates", t);
  /* filing-templates' opaque ids' seed is held under its name (record-core R70) */
  assert.equal(rc.registerMintSeed("filing-templates", []).ok, false);
});

test("R11, R2: local-facts heads layer 9's block of the construction and filing-templates sits after action-clocks and before filings, as their purge declarations show", async () => {
  const order = declarers(await store());
  const at = (m) => { const i = order.indexOf(m); assert.notEqual(i, -1, m); return i; };
  for (const m of ["consequences", "action-clocks", "filing-templates", "standards", "filings", "escalation", "action-plans"])
    assert.ok(at("local-facts") < at(m), `local-facts before ${m}`);
  assert.ok(at("action-clocks") < at("filing-templates"), "filing-templates after action-clocks");
  assert.ok(at("filing-templates") < at("filings"), "filing-templates before filings");
  assert.ok(at("filing-templates") < at("standards"), "filing-templates before standards' declaration, made with filings");
});

test("R11, R3: a store written before the two modules opens with their tables, and the library `filings` R26 kept is taken once, as drafts", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  /* An older store: no local-facts or filing-templates table, and one template in filings' library. */
  for (const t of [...LF, ...FT]) db.exec(`DROP TABLE IF EXISTS ${t}`);
  db.prepare(`INSERT INTO filing_templates (template_id, name, kind, text, from_filing, action_id, basis, author, at)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run("FT-old-1", "Records request", "records_request", "Dear {{counterparty}}", "FIL-1", "ACT-1", "{}", "member:alice",
         "2026-09-01T00:00:00Z");
  assert.equal(tableNames(first).includes("tpl_templates"), false);
  const old = await store({ db });
  for (const t of [...LF, ...FT]) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const taken = [...old.ctx.storage.sql.exec(`SELECT template_id, name, origin, migrated_from FROM tpl_templates`)].map((r) => ({ ...r }));
  assert.equal(taken.length, 1);
  assert.deepEqual([taken[0].name, taken[0].origin, taken[0].migrated_from], ["Records request", "group", "FT-old-1"]);
  assert.equal(one(old, `SELECT count(*) c FROM tpl_versions WHERE template_id = ?`, taken[0].template_id).c, 1);
  assert.equal(one(old, `SELECT text FROM tpl_notes WHERE template_id = ?`, taken[0].template_id).text, MIGRATED_NOTE);
  assert.equal(one(old, `SELECT count(*) c FROM filing_templates`).c, 1, "filings' library is read, never written");
  /* A second construction takes nothing again and changes no table. */
  const again = await store({ db });
  assert.equal(one(again, `SELECT count(*) c FROM tpl_templates`).c, 1);
  assert.equal(one(again, `SELECT count(*) c FROM tpl_versions`).c, 1);
});

/* Instants and minted ids differ between two objects; everything else must not. */
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");

test("R11, R5: every op of local-facts' and filing-templates' maps is in the route map and answers through control-plane's door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const ops = [...Object.keys(localFactsOps(null, u, null)), ...Object.keys(filingTemplatesOps(null, u, null))];
  assert.deepEqual(Object.keys(localFactsOps(null, u, null)), ["factconfirm", "factstatus", "factsdue"]);
  assert.ok(ops.includes("templates") && ops.includes("templatedraft") && ops.length === 16, ops.join());
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  for (const op of ops) assert.ok(map.includes(op), `the route map lacks ${op}`);
  /* `op=templates` is filing-templates' (K991): the map's handler answers as its own. */
  for (const op of ops) {
    const path = `${op}?viewer=member:nobody&author=member:nobody&path=tz`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const url = new URL(`http://do/${path}`);
    const own = LF_OPS.has(op) ? localFactsOps(localFactsOf(twin.ctx), url, {}) : filingTemplatesOps(filingTemplatesOf(twin.ctx), url, {});
    const direct = await own[op]();
    assert.equal(res.status, 200, op);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), op);
  }
  /* negative control: a machine's confirmation is local-facts' own refusal, inside the door's envelope */
  const machine = await (await x.fetch("/factconfirm?viewer=class:admin", { method: "POST", body: JSON.stringify({ by: "token:admin", path: "x", act: "confirm", how: "h" }) })).json();
  assert.deepEqual([machine.ok, machine.result.ok, machine.result.reason], [true, false, "MACHINE_CANNOT_CONFIRM"]);
});
const LF_OPS = new Set(Object.keys(localFactsOps(null, new URL("http://do/"), null)));
