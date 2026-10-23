/* calculations, fix round 6 (T51; G55, K4354, K4562, K4630, K4571): a money ingest does work per distinct payer, not per row.
   Tier 1: the act keeps its party resolutions in a cache it makes at its start and drops at its end (R14), and the views behind the
   lookups and the facts are held by their owners (entities R20/R44 and money, `viewBuilds()`; seam tests, red by name until those merge).
   Every test goes through the op `moneyingest` as `calculationsOps(c)` answers it, with a member `by`, over a table made by the real
   `declareTable`, an adopted binding, and the real money and entities. Work is counted (lookups, view builds, statements, scan steps),
   never timed (R-CLOCK). Run under the preload: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit`. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { calculationsOps, INGEST_CACHE_MAX } from "../../../src/calculations/index.mjs";

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const SCHEME = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };

/* the door's way in: the op's arm, stamped by the control plane as `member:bob` */
const url = new URL(`http://civic.test/?viewer=${encodeURIComponent(V("bob"))}`);
const ingest = (w, binding, body = {}) => calculationsOps(w.c, url, { binding, rows: "all", reason: "the whole ledger is the request's subject", ...body }).moneyingest();

/* a world with two registered persons (P001, P002); `payers(i)` names the payer of row i; the payer column resolves as `payerRole` says */
async function setup(rows, payers, { payerRole = SCHEME.payer, world = null } = {}) {
  const w = world || seeded();
  if (!world) { w.person("Pat Quill", "P001"); w.person("Lee Quill", "P002"); }
  let text = "payer,payee,amount\n";
  for (let i = 0; i < rows; i++) text += `${payers(i)},P002,${(i % 97) + 1}\n`;
  const t = await w.table(text, FIELDS, { roles: { ...SCHEME, payer: payerRole } });
  const b = w.c.adoptBinding({ table: t.sha, roles: BIND, by: V("bob") });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  return { w, t, b };
}
/* counts the entity lookups the act asks of `entities`, by identifier value */
function countLookups(w, fail = () => false) {
  const seen = [];
  const real = w.entities.entityByIdentifier.bind(w.entities);
  w.entities.entityByIdentifier = (a) => { seen.push(a.id); if (fail(a.id, seen.length)) throw new Error("injected: the lookup threw"); return real(a); };
  return seen;
}
/* counts the SQL statements the module's storage is asked for */
function countStatements(w) {
  const n = { v: 0 };
  const real = w.st.sql.exec.bind(w.st.sql);
  w.st.sql.exec = (...a) => { n.v++; return real(...a); };
  return n;
}
/* counts the steps every generator takes (a scan of a held table is generators on generators) */
function countSteps() {
  const proto = Object.getPrototypeOf(Object.getPrototypeOf((function* () {})()));
  const real = proto.next, n = { v: 0 };
  proto.next = function (...a) { n.v++; return real.apply(this, a); };
  return { n, restore: () => { proto.next = real; } };
}
const mixed = (i) => (i % 60 === 0 ? "P001" : `U${String(i).padStart(6, "0")}`);

test("R14 (G55 a) seam: entities and money hold their jurisdiction view; the mixed 18,098-row act builds it at most twice in all, asks at most two statements per distinct unidentified payer beside the facts' own, and answers as G45's act does", async () => {
  const { w, b } = await setup(18098, mixed);
  assert.equal(typeof w.entities.viewBuilds, "function", "seam: entities provides viewBuilds() (G55 tier 1; red by name until ENTITIES #20 merges)");
  assert.equal(typeof w.money.real.viewBuilds, "function", "seam: money provides viewBuilds() (G55 tier 1; red by name until MONEY #8 merges)");
  /* the facts' own statements, measured on a control of 302 rows that all resolve (the same facts the mixed table writes) */
  const ctl = await setup(302, () => "P001");
  const cs = countStatements(ctl.w);
  const rc = await ingest(ctl.w, ctl.b.binding);
  assert.equal(rc.ok, true, JSON.stringify(rc).slice(0, 300));
  assert.equal(rc.written.length, 302);
  const perFactAndLookups = cs.v;
  const builds0 = w.entities.viewBuilds() + w.money.real.viewBuilds();
  const st = countStatements(w);
  const r = await ingest(w, b.binding);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.ok(w.entities.viewBuilds() + w.money.real.viewBuilds() - builds0 <= 2, "the views are built at most once each across the whole act");
  const distinctUnidentified = 18098 - 302;
  assert.ok(st.v <= 2 * distinctUnidentified + perFactAndLookups + 200, `${st.v} statements for ${distinctUnidentified} unidentified payers and 302 facts`);
  assert.equal(r.written.length, 302);
  assert.equal(r.not_written.length, distinctUnidentified);
  assert.ok(r.not_written.every((x) => x.reason === "PAYER_NOT_IDENTIFIED"));
  assert.deepEqual(w.c.ingestOf(r.ingest).not_written, r.not_written, "the record equals the answer");
  assert.equal(w.money.calls.length, 302, "the facts written equal the record's written");
  /* a row's reason is the sentence an act without a cache gives for that value: a one-row table of the same value */
  for (const i of [1, 61, 18097]) {
    const one = await setup(1, () => `U${String(i).padStart(6, "0")}`);
    const o = await ingest(one.w, one.b.binding);
    assert.deepEqual(r.not_written.find((x) => x.row === i).detail, o.not_written[0].detail, `row ${i}'s reason`);
  }
});

test("R14 (G55 b) 18,098 rows naming 50 distinct unidentified payers ask entities for each payer once: at most 50 lookups, every row listed with its reason", async () => {
  const { w, b } = await setup(18098, (i) => `U${String(i % 50).padStart(3, "0")}`);
  const seen = countLookups(w);
  const r = await ingest(w, b.binding);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.ok(seen.length <= 50, `${seen.length} lookups for 50 distinct payers`);
  assert.equal(new Set(seen).size, seen.length, "no payer is looked up twice");
  assert.equal(r.not_written.length, 18098);
  assert.ok(r.not_written.every((x) => x.reason === "PAYER_NOT_IDENTIFIED"), "every row is listed with its reason");
  assert.equal(r.not_written[0].detail, r.not_written[50].detail, "rows of one payer carry that payer's one reason");
  assert.notEqual(r.not_written[0].detail, r.not_written[1].detail);
});

test("R14 (G55 b) the same through a crosswalk-column payer: the captured crosswalk is scanned at most once for each of 50 distinct payers", async () => {
  const w = seeded();
  w.person("Lee Quill", "P002");
  const vendors = Array.from({ length: 50 }, (_, k) => w.entity(`Vendor ${k}`, "institution"));
  const cwRows = 1000;
  const cwText = `vendor_no,entity\n${Array.from({ length: cwRows }, (_, k) => `V${String(k).padStart(4, "0")},${vendors[k % 50]}\n`).join("")}`;
  const cw = await w.table(cwText, [{ name: "vendor_no", type: "string" }, { name: "entity", type: "string" }],
    { roles: { vendor_no: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } } });
  const payerRole = { role: "payer", crosswalk: { table: cw.sha, from: "vendor_no", to: "entity" } };
  /* one scan's steps: a one-row table naming a vendor the crosswalk does not hold (a scan to the end of the crosswalk) */
  const one = await setup(1, () => "X0000", { payerRole, world: w });
  let probe = countSteps();
  const o = await ingest(w, one.b.binding);
  probe.restore();
  assert.equal(o.ok, true, JSON.stringify(o).slice(0, 300));
  assert.equal(o.not_written[0].reason, "PAYER_NOT_IDENTIFIED");
  const perScan = probe.n.v;
  const rows = 6000;
  const { b } = await setup(rows, (i) => `X${String(i % 50).padStart(4, "0")}`, { payerRole, world: w });
  probe = countSteps();
  const r = await ingest(w, b.binding);
  probe.restore();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.not_written.length, rows);
  assert.ok(r.not_written.every((x) => x.reason === "PAYER_NOT_IDENTIFIED"));
  /* 50 scans, plus the pass over the table's own rows (a few generator steps a row): not 6,000 scans */
  assert.ok(probe.n.v <= 50 * perScan + 8 * rows, `${probe.n.v} scan steps against ${perScan} for one scan: about ${(probe.n.v / perScan).toFixed(0)} scans`);
});

test("R14 (G55 b) a crosswalk payer that resolves is looked up in the crosswalk once, and the fact names the entity the crosswalk maps it to", async () => {
  const w = seeded();
  w.person("Lee Quill", "P002");
  const vend = w.entity("Harbour Vendor", "institution");
  const cw = await w.table(`vendor_no,entity\nV1,${vend}\nV2,${vend}\n`, [{ name: "vendor_no", type: "string" }, { name: "entity", type: "string" }],
    { roles: { vendor_no: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } } });
  const payerRole = { role: "payer", crosswalk: { table: cw.sha, from: "vendor_no", to: "entity" } };
  const { b } = await setup(40, (i) => (i % 2 ? "V1" : "V2"), { payerRole, world: w });
  const r = await ingest(w, b.binding);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.written.length, 40);
  assert.ok(w.money.calls.every((f) => f.from.entity === vend), "every fact's payer is the crosswalk's entity");
});

test("R14 (G55 c) the cache is the act's own: a payer registered between two acts is found by the second; a lookup that throws is not kept, so the payer's next row looks again", async () => {
  const w = seeded();
  w.person("Lee Quill", "P002");
  const { b } = await setup(3, () => "P777", { world: w });
  const first = await ingest(w, b.binding);
  assert.equal(first.ok, true);
  assert.equal(first.written.length, 0, "P777 is not registered at the first act");
  assert.equal(first.not_written.length, 3);
  const added = w.person("Sam Quill", "P777");
  const second = await ingest(w, b.binding);
  assert.equal(second.ok, true);
  assert.equal(second.written.length, 3, "the second act sees the identifier registered between the two");
  assert.ok(w.money.calls.every((f) => f.from.entity === added));
  /* a throw is not an answer: the first lookup of a registered payer throws, the next row of that payer looks again and is written */
  const w2 = seeded();
  w2.person("Lee Quill", "P002");
  w2.person("Pat Quill", "P001");
  const { b: b2 } = await setup(3, () => "P001", { world: w2 });
  const seen = countLookups(w2, (id, n) => id === "P001" && n === 1);
  const r2 = await ingest(w2, b2.binding);
  assert.equal(r2.ok, true, JSON.stringify(r2).slice(0, 300));
  assert.equal(r2.not_written.length, 1, "the row whose lookup threw is listed, not written");
  assert.equal(r2.not_written[0].row, 0);
  assert.equal(r2.written.length, 2, "the payer's later rows looked again and were written");
  assert.ok(seen.filter((x) => x === "P001").length >= 2, "the payer was asked for again after the throw");
});

test("R14 (G55 d) the cache is bounded: past INGEST_CACHE_MAX answers a payer is looked up each time it appears, a kept one never again, and every row is answered", async () => {
  const n = INGEST_CACHE_MAX + 20;
  /* n distinct payers, then the 20 past the bound again and the first 20 (kept) again */
  const at = (i) => (i < n ? i : i < n + 20 ? n - 20 + (i - n) : i - n - 20);
  const { w, b } = await setup(n + 40, (i) => `U${String(at(i)).padStart(6, "0")}`);
  const seen = countLookups(w);
  const r = await ingest(w, b.binding);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.not_written.length, n + 40);
  assert.equal(seen.length, n + 20, "the first 10,000 payers once, the 20 past the bound twice, the 20 kept ones not again");
});
