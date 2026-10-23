/* calculations, fix round 6 (T51; G55, K4354, K4562, K4630, K4571): a money ingest does work per distinct payer, not per row.
   Tier 1: the act keeps its party resolutions in a cache it makes at its start and drops at its end (R14), and the views behind the
   lookups and the facts are held by their owners (entities R20/R44 and money, `viewBuilds()`; seam tests, red by name until those merge).
   Every test goes through the op `moneyingest` as `calculationsOps(c)` answers it, with a member `by`, over a table made by the real
   `declareTable`, an adopted binding, and the real money and entities. Work is counted (lookups, view builds, statements, scan steps),
   never timed (R-CLOCK). Run under the preload: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit`. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { calculationsOps, INGEST_CACHE_MAX, INGEST_INLINE_ROWS, INGEST_SLICE_ROWS, INGEST_SLICE_FACTS, INGEST_MAX_ATTEMPTS } from "../../../src/calculations/index.mjs";

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const SCHEME = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };

/* the door's way in: the op's arm, stamped by the control plane as `member:bob` */
const url = new URL(`http://civic.test/?viewer=${encodeURIComponent(V("bob"))}`);
const ingest = (w, binding, body = {}) => calculationsOps(w.c, url, { binding, rows: "all", reason: "the whole ledger is the request's subject", ...body }).moneyingest();
const read = (w, ingest, extra = {}, viewer = V("bob")) => calculationsOps(w.c, new URL(`http://civic.test/?viewer=${encodeURIComponent(viewer)}`), { ingest, ...extra }).moneyingestread();
/* an act over INGEST_INLINE_ROWS answers started; its slices run (the scheduler's ticks) until it is done, and the answer is then the record's */
async function drain(w, key) {
  for (let k = 0; k < 50; k++) { const t = await w.c.ingestTick(); assert.equal(t.ok, true, JSON.stringify(t)); if (w.c.ingestOf(key).state === "done") return; }
  assert.fail("the ingest did not finish");
}
async function settled(w, r) {
  if (r.state !== "ingesting") return r;
  await drain(w, r.ingest);
  const k = w.c.ingestOf(r.ingest);
  return { ok: true, ingest: r.ingest, written: k.written, not_written: k.not_written };
}

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
  const r = await settled(w, await ingest(w, b.binding));
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
    const o = await settled(one.w, await ingest(one.w, one.b.binding));
    assert.deepEqual(r.not_written.find((x) => x.row === i).detail, o.not_written[0].detail, `row ${i}'s reason`);
  }
});

test("R14 (G55 b) 18,098 rows naming 50 distinct unidentified payers ask entities for each payer once: at most 50 lookups, every row listed with its reason", async () => {
  const { w, b } = await setup(18098, (i) => `U${String(i % 50).padStart(3, "0")}`);
  const seen = countLookups(w);
  const r = await settled(w, await ingest(w, b.binding));
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
  const r = await settled(w, await ingest(w, b.binding));
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
  const r = await settled(w, await ingest(w, b.binding));
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
  const r = await settled(w, await ingest(w, b.binding));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.not_written.length, n + 40);
  assert.equal(seen.length, n + 20, "the first 10,000 payers once, the 20 past the bound twice, the 20 kept ones not again");
});

/* ---- tier 2 (K4562): an act over INGEST_INLINE_ROWS runs in the background, in slices ---- */

/* money's partial marker (G55 tier 2, MONEY #8) is a seam: until it merges the test holds its own `markIngest` and keeps the tag it carries
   in the facts' source (`source.ingest`) from the real money, which does not yet take it; the real marker is the seam test below */
function marked(w) {
  const marks = [];
  w.money.markIngest = (key, open) => { marks.push([key, open]); };
  w.money.recordFact = (f) => { w.money.calls.push(f); const { ingest: _tag, ...source } = f.source; return w.money.real.recordFact({ ...f, source }); };
  return marks;
}
const resolving = (rows) => setup(rows, () => "P001");
const factRows = (w) => w.rows(`SELECT source_row AS r FROM money_facts`).map((x) => Number(x.r)).sort((p, q) => p - q);

test("R14 (G55 pins) the constants of the slice, pinned by measure and by this test", () => {
  assert.equal(INGEST_SLICE_ROWS, 20000);
  assert.equal(INGEST_SLICE_FACTS, 2000);
  assert.equal(INGEST_MAX_ATTEMPTS, 3);
  assert.ok(INGEST_INLINE_ROWS >= 3000 && INGEST_INLINE_ROWS <= 5000, "the inline threshold, set from the platform measure");
});

test("R14 (G55 d) start: INGEST_INLINE_ROWS + 1 rows answer started with true counts and a sentence, write no fact in the act, tell the work listener once and open money's marker; a second act on the binding is ALREADY_INGESTING", async () => {
  const { w, b } = await resolving(INGEST_INLINE_ROWS + 1);
  const marks = marked(w);
  const told = [];
  assert.equal(w.c.onIngestWork("scheduler", (e) => told.push(e)).ok, true);
  const r = await ingest(w, b.binding);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.state, "ingesting");
  assert.equal(r.complete, false);
  assert.deepEqual([r.rows_total, r.rows_done, r.written_count, r.not_written_count], [INGEST_INLINE_ROWS + 1, 0, 0, 0]);
  assert.equal(typeof r.says, "string");
  assert.ok(r.says.includes(String(INGEST_INLINE_ROWS + 1)), "the sentence says how many rows");
  assert.equal(w.money.calls.length, 0, "the act writes no fact");
  assert.equal(told.length, 1, "the scheduler's listener is told once");
  assert.deepEqual(marks, [[r.ingest, true]], "money's marker is opened with the record");
  const again = await ingest(w, b.binding);
  assert.equal(again.ok, false);
  assert.equal(again.reason, "ALREADY_INGESTING");
  assert.equal(again.ingest, r.ingest);
  assert.equal(typeof again.detail, "string");
  assert.equal(w.count("calc_ingests"), 1, "nothing written by the refused act");
  assert.equal(w.c.ingestDue(), true);
  assert.equal(w.c.ingestWake(5), 5);
  /* at the threshold itself the act runs whole */
  const at = await resolving(INGEST_INLINE_ROWS);
  const whole = await ingest(at.w, at.b.binding);
  assert.equal(whole.ok, true);
  assert.equal(whole.state, undefined, "an inline act answers as it always has");
  assert.equal(whole.written.length, INGEST_INLINE_ROWS);
});

test("R14 (G55 e) slices: a tick writes exactly INGEST_SLICE_FACTS facts, further ticks finish the table with every row once, and the last tick closes money's marker", async () => {
  const rows = INGEST_INLINE_ROWS + 5000;
  const { w, b } = await resolving(rows);
  const marks = marked(w);
  const r = await ingest(w, b.binding);
  assert.equal(r.state, "ingesting");
  const t1 = await w.c.ingestTick();
  assert.equal(t1.ok, true, JSON.stringify(t1));
  assert.equal(w.money.calls.length, INGEST_SLICE_FACTS, "one slice writes the facts of a slice and no more");
  assert.equal(t1.written, INGEST_SLICE_FACTS);
  const mid = read(w, r.ingest);
  assert.deepEqual([mid.state, mid.complete, mid.rows_done, mid.written_count], ["ingesting", false, INGEST_SLICE_FACTS, INGEST_SLICE_FACTS]);
  assert.deepEqual(marks, [[r.ingest, true]], "the marker stays open while the ingest runs");
  let ticks = 1;
  while (w.c.ingestDue()) { const t = await w.c.ingestTick(); assert.equal(t.ok, true); ticks++; assert.ok(ticks < 20); }
  assert.equal(ticks, Math.ceil(rows / INGEST_SLICE_FACTS));
  assert.equal(w.money.calls.length, rows);
  const have = factRows(w);
  assert.deepEqual(have, Array.from({ length: rows }, (_, i) => i), "every row once, none twice");
  assert.deepEqual(marks, [[r.ingest, true], [r.ingest, false]], "the last slice closes the marker");
  assert.ok(w.money.calls.slice(0, 5).every((f) => f.source.ingest === r.ingest), "each fact names its ingest in its source");
  const end = read(w, r.ingest);
  assert.deepEqual([end.state, end.complete, end.rows_done, end.written_count, end.not_written_count], ["done", true, rows, rows, 0]);
  assert.equal(w.c.ingestDue(), false);
  assert.equal(w.c.ingestWake(5), null);
  assert.deepEqual((await w.c.ingestTick()), { ok: true, ran: false });
});

test("R14 (G55 e) slices: a slice judges at most INGEST_SLICE_ROWS rows; rows not written count towards it", async () => {
  const rows = INGEST_SLICE_ROWS + 5000;
  const { w, b } = await setup(rows, (i) => `U${i}`);
  const r = await ingest(w, b.binding);
  const t1 = await w.c.ingestTick();
  assert.equal(t1.judged, INGEST_SLICE_ROWS);
  assert.equal(read(w, r.ingest).rows_done, INGEST_SLICE_ROWS);
  const t2 = await w.c.ingestTick();
  assert.equal(t2.judged, 5000);
  assert.equal(t2.state, "done");
  const k = w.c.ingestOf(r.ingest);
  assert.deepEqual(k.not_written.map((x) => x.row), Array.from({ length: rows }, (_, i) => i));
  assert.equal(w.money.calls.length, 0);
});

test("R14 (G55 e) failure: a throw in the 3rd slice leaves the first two slices' facts and cursor and none of the third's; the re-run finishes with no duplicate; three throws in a row stop the ingest, with no fourth attempt", async () => {
  const rows = INGEST_INLINE_ROWS + 5000;
  const { w, b } = await resolving(rows);
  const marks = marked(w);
  const recordFact = w.money.recordFact;
  let thrown = 0, boom = true;
  w.money.recordFact = (f) => { if (boom && w.money.calls.length >= 2 * INGEST_SLICE_FACTS + 999) { thrown++; throw new Error("injected: money threw"); } return recordFact(f); };
  const r = await ingest(w, b.binding);
  assert.equal((await w.c.ingestTick()).ok, true);
  assert.equal((await w.c.ingestTick()).ok, true);
  const before = factRows(w).length;
  assert.equal(before, 2 * INGEST_SLICE_FACTS);
  const bad = await w.c.ingestTick();
  assert.equal(bad.ok, false, "the third slice failed");
  assert.equal(thrown, 1);
  assert.equal(factRows(w).length, before, "none of the third slice's facts stay");
  assert.equal(read(w, r.ingest).rows_done, 2 * INGEST_SLICE_FACTS, "the cursor did not move");
  assert.equal(read(w, r.ingest).state, "ingesting");
  /* a success resets the count; the re-run finishes */
  boom = false;
  let n = 0;
  while (w.c.ingestDue()) { assert.equal((await w.c.ingestTick()).ok, true); assert.ok(++n < 20); }
  assert.deepEqual(factRows(w), Array.from({ length: rows }, (_, i) => i), "no duplicate and no gap");
  assert.equal(read(w, r.ingest).state, "done");
  assert.deepEqual(marks.at(-1), [r.ingest, false]);
  /* three consecutive failures stop it */
  const w2 = await resolving(INGEST_INLINE_ROWS + 1);
  const m2 = marked(w2.w);
  const real2 = w2.w.money.recordFact;
  let calls2 = 0;
  w2.w.money.recordFact = (f) => { calls2++; throw new Error("injected: money threw"); void real2; };
  const r2 = await ingest(w2.w, w2.b.binding);
  for (let k = 1; k <= INGEST_MAX_ATTEMPTS; k++) {
    assert.equal(w2.w.c.ingestDue(), true, `attempt ${k} is due`);
    assert.equal((await w2.w.c.ingestTick()).ok, false);
  }
  const st = read(w2.w, r2.ingest);
  assert.equal(st.state, "stopped");
  assert.equal(st.complete, false);
  assert.equal(st.stopped.reason, "ATTEMPTS");
  assert.equal(typeof st.stopped.says, "string");
  assert.equal(w2.w.c.ingestDue(), false, "a stopped ingest is not due");
  assert.equal(w2.w.c.ingestWake(5), null);
  const seen = calls2;
  assert.deepEqual(await w2.w.c.ingestTick(), { ok: true, ran: false });
  assert.equal(calls2, seen, "no fourth attempt");
  assert.deepEqual(m2, [[r2.ingest, true]], "a stopped ingest's marker stays open: its facts stay marked");
  /* a stopped ingest frees the binding for a new ask */
  w2.w.money.recordFact = real2;
  const again = await ingest(w2.w, w2.b.binding);
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 200));
});

test("R14 (G55 e) a table no longer held (its binding gone) stops the ingest on its next tick, naming why", async () => {
  const { w, b } = await resolving(INGEST_INLINE_ROWS + 1);
  const r = await ingest(w, b.binding);
  w.st.sql.exec(`DELETE FROM calc_bindings WHERE binding_key=?`, b.binding);
  const t = await w.c.ingestTick();
  assert.equal(t.state, "stopped");
  const st = read(w, r.ingest);
  assert.equal(st.state, "stopped");
  assert.equal(st.stopped.reason, "TABLE_CHANGED");
  assert.equal(w.money.calls.length, 0);
});

test("R14 (G55 f) moneyingestread pages not_written in order, its join equals ingestOf, counts are true, complete is false until done, and a member who cannot see the binding gets no such ingest", async () => {
  const w = seeded();
  w.person("Pat Quill", "P001"); w.person("Lee Quill", "P002");
  const project = w.project("Private ledger", "bob");
  const rows = INGEST_INLINE_ROWS + 1500;
  let text = "payer,payee,amount\n";
  for (let i = 0; i < rows; i++) text += `${i % 2 === 0 ? "P001" : "U" + i},P002,${(i % 97) + 1}\n`;
  const t = await w.table(text, FIELDS, { roles: SCHEME }, { project });
  const b = w.c.adoptBinding({ table: t.sha, roles: BIND, by: V("bob") });
  marked(w);
  const r = await ingest(w, b.binding);
  assert.equal(r.state, "ingesting");
  const early = read(w, r.ingest);
  assert.deepEqual([early.complete, early.state, early.rows_total, early.rows_done], [false, "ingesting", rows, 0]);
  await w.c.ingestTick();
  const mid = read(w, r.ingest);
  assert.equal(mid.complete, false, "the facts limit ended the first slice");
  assert.equal(mid.state, "ingesting");
  assert.equal(mid.written_count, INGEST_SLICE_FACTS);
  await drain(w, r.ingest);
  const end = read(w, r.ingest);
  assert.deepEqual([end.state, end.complete, end.rows_total, end.written_count, end.not_written_count], ["done", true, rows, Math.ceil(rows / 2), rows - Math.ceil(rows / 2)]);
  for (const kind of ["not_written", "written"]) {
    const joined = [];
    let after = 0;
    for (let page = 0; page < 20; page++) {
      const p = read(w, r.ingest, { kind, after, limit: 1000 });
      assert.equal(p.ok, true);
      assert.ok(p.items.length <= 1000);
      joined.push(...p.items);
      if (p.next === null) break;
      after = p.next;
    }
    assert.deepEqual(joined, w.c.ingestOf(r.ingest)[kind], `${kind}: the join of the pages is the record`);
    assert.equal(joined.length, kind === "written" ? end.written_count : end.not_written_count);
    assert.deepEqual(joined.map((x) => x.row), [...joined.map((x) => x.row)].sort((p, q) => p - q), "in row order");
  }
  assert.deepEqual(read(w, r.ingest, {}, V("carol")), { ok: true, found: false }, "a viewer who cannot see the binding gets no such ingest");
  assert.deepEqual(read(w, "nothing"), { ok: true, found: false });
  assert.equal(read(w, r.ingest, { kind: "other" }).reason, "BAD_KIND");
});

test("R14 (G55 g) R-OLD: a record stored before has no state and reads as done through ingestOf and moneyingestread, and is never rewritten", async () => {
  const { w, b } = await setup(30, (i) => (i % 2 ? "P001" : `U${i}`));
  const r = await ingest(w, b.binding);
  assert.equal(r.ok, true);
  const raw = w.rows(`SELECT * FROM calc_ingests`)[0];
  assert.equal(raw.state, null, "an inline act stores no state, as a record of an earlier release has none");
  const k = w.c.ingestOf(r.ingest);
  assert.equal(k.state, "done");
  assert.equal(k.written.length, 15);
  const st = read(w, r.ingest);
  assert.deepEqual([st.state, st.complete, st.written_count, st.not_written_count, st.rows_total], ["done", true, 15, 15, 30]);
  const page = read(w, r.ingest, { kind: "not_written", after: 10, limit: 3 });
  assert.deepEqual(page.items, r.not_written.slice(10, 13));
  assert.equal(page.next, 13);
  assert.deepEqual(w.rows(`SELECT * FROM calc_ingests`)[0], raw, "never rewritten");
  assert.equal(w.c.ingestDue(), false);
});

test("R14 (G55 notices) a done ingest and a stopped one are each read once by the viewer who asked, in the order they finished; another viewer reads none", async () => {
  const { w, b } = await resolving(INGEST_INLINE_ROWS + 1);
  marked(w);
  const r = await ingest(w, b.binding);
  assert.deepEqual(w.c.ingestNotices({ viewer: V("bob") }), { ok: true, items: [], next: null }, "nothing finished yet");
  await drain(w, r.ingest);
  const n = w.c.ingestNotices({ viewer: V("bob") });
  assert.equal(n.items.length, 1);
  assert.deepEqual([n.items[0].ingest, n.items[0].state, n.items[0].written_count], [r.ingest, "done", INGEST_INLINE_ROWS + 1]);
  assert.equal(w.c.ingestNotices({ viewer: V("bob"), after: n.next }).items.length, 0, "read once");
  assert.equal(w.c.ingestNotices({ viewer: V("carol") }).items.length, 0, "another member's ingest raises none");
  /* a stopped one, on another table of the same world */
  const two = await setup(INGEST_INLINE_ROWS + 2, () => "P001", { world: w });
  const real = w.money.recordFact;
  w.money.recordFact = () => { throw new Error("injected: money threw"); };
  const r2 = await ingest(w, two.b.binding);
  for (let k = 0; k < INGEST_MAX_ATTEMPTS; k++) await w.c.ingestTick();
  w.money.recordFact = real;
  const n2 = w.c.ingestNotices({ viewer: V("bob"), after: n.next });
  assert.equal(n2.items.length, 1);
  assert.deepEqual([n2.items[0].ingest, n2.items[0].state, n2.items[0].stopped.reason], [r2.ingest, "stopped", "ATTEMPTS"]);
  assert.deepEqual(w.c.ingestNotices({ viewer: V("bob") }).items.map((x) => x.state), ["done", "stopped"], "in the order they finished");
});

test("R14 (G55 h) seam: money marks the facts of an open ingest partial and closes it with the last slice (MONEY #8; red by name until it merges)", async () => {
  const { w, b } = await resolving(INGEST_INLINE_ROWS + 1);
  assert.equal(typeof w.money.real.markIngest, "function", "seam: money provides markIngest(key, open) (G55 tier 2; red by name until MONEY #8 merges)");
  const r = await ingest(w, b.binding);
  await w.c.ingestTick();
  const fact = w.money.real.readFact({ factId: w.rows(`SELECT fact_id FROM money_facts LIMIT 1`)[0].fact_id, viewer: V("bob") });
  assert.equal((fact.fact || fact).partial, true, "a fact of an open ingest is answered partial");
  await drain(w, r.ingest);
  const after = w.money.real.readFact({ factId: w.rows(`SELECT fact_id FROM money_facts LIMIT 1`)[0].fact_id, viewer: V("bob") });
  assert.notEqual((after.fact || after).partial, true, "closed with the last slice");
});

test("R24 K4208 (G55) the op moneyingestread is new and answers the ingest's state; moneyingest accepts the same keys, an inline answer unchanged", async () => {
  const { w, b } = await setup(30, (i) => (i % 2 ? "P001" : `U${i}`));
  const r = await ingest(w, b.binding, { reason: "all of it" });
  assert.deepEqual(Object.keys(r).sort(), ["asked_by", "binding", "by", "ingest", "not_written", "ok", "written"]);
  assert.equal(read(w, r.ingest).found, true);
});
