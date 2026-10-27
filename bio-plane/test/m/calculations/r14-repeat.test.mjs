/* calculations, fix round 10 (T51; K5148; WALK-FINAL-07 R62): a repeat ingest writes nothing twice (R14). `ingestMoney` writes no row
   whose live fact money already holds (`factBySource`): the row is listed `not_written` `ROW_ALREADY_WRITTEN` with the held fact, and a
   withdrawn fact does not block its row. Both paths: the inline act (at most INGEST_INLINE_ROWS rows) and the background one (slices on
   `ingestTick`). Every test goes through the provided service over a table made by the real `declareTable`, an adopted binding and the
   real money module. Run under the preload: `node --import ./bio-plane/test/platform-sqlite.mjs --test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { INGEST_INLINE_ROWS } from "../../../src/calculations/index.mjs";

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const ROLES = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };

async function setup(rows) {
  const w = seeded();
  w.person("Pat Quill", "P001");
  w.person("Lee Quill", "P002");
  let text = "payer,payee,amount\n";
  for (let i = 0; i < rows; i++) text += `P001,P002,${(i % 97) + 1}\n`;
  const t = await w.table(text, FIELDS, { roles: ROLES });
  const b = w.c.adoptBinding({ table: t.sha, roles: BIND, by: V("bob") });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  return { w, t, b };
}
const facts = (w) => w.rows(`SELECT COUNT(*) AS n FROM money_facts`)[0].n;
/* the act's lists, whole: the answer of an inline act, the record of a background one once its slices have run */
async function ingest(w, binding, rows = "all") {
  w.clock.now = new Date(Date.parse(w.clock.now) + 60000).toISOString();   /* an act's key names its instant: each act is its own */
  const r = await w.c.ingestMoney({ binding, rows, ...(rows === "all" ? { reason: "the whole ledger is the request's subject" } : {}), by: V("bob") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  if (r.state !== "ingesting") return r;
  for (let k = 0; k < 50 && w.c.ingestOf(r.ingest).state !== "done"; k++) assert.equal((await w.c.ingestTick()).ok, true);
  const k = w.c.ingestOf(r.ingest);
  assert.equal(k.state, "done");
  return { ...r, written: k.written, not_written: k.not_written };
}

for (const [path, rows] of [["inline", 50], ["background", INGEST_INLINE_ROWS + 1]]) {
  test(`R14 (K5148) a repeat ingest of the same binding writes nothing twice, ${path} path (${rows} rows): the second act writes 0, lists every row not_written ROW_ALREADY_WRITTEN with the held fact, and money holds ${rows} facts, not twice; a fact withdrawn after the first act does not block its row`, async () => {
    const { w, b } = await setup(rows);
    const first = await ingest(w, b.binding);
    assert.equal(first.written.length, rows);
    assert.equal(facts(w), rows);
    const held = new Map(first.written.map((x) => [x.row, x.fact_id]));
    const second = await ingest(w, b.binding);
    assert.equal(second.written.length, 0, "a repeat writes no row again");
    assert.equal(second.not_written.length, rows);
    assert.ok(second.not_written.every((x) => x.reason === "ROW_ALREADY_WRITTEN" && x.fact_id === held.get(x.row)), "each names the fact money holds");
    assert.equal(typeof second.not_written[0].detail, "string");
    assert.equal(facts(w), rows, "money holds N facts, not 2N");
    /* control: a withdrawn fact does not block its row (money R7: it never counts) */
    const gone = held.get(3);
    assert.equal(w.money.withdrawFact({ factId: gone, reason: "read twice", by: V("bob") }).ok, true);
    const third = await ingest(w, b.binding);
    assert.deepEqual(third.written.map((x) => x.row), [3], "only the withdrawn row is written again");
    assert.notEqual(third.written[0].fact_id, gone);
    assert.equal(third.not_written.length, rows - 1);
    assert.equal(facts(w), rows + 1, "the withdrawn fact remains, shown withdrawn");
  });
}

test("R14 (K5148) a repeat of an act that names its rows skips the held ones and writes the rest", async () => {
  const { w, b } = await setup(20);
  const a = await ingest(w, b.binding, [0, 1, 2]);
  assert.equal(a.written.length, 3);
  const r = await ingest(w, b.binding, [1, 2, 3, 4]);
  assert.deepEqual(r.written.map((x) => x.row), [3, 4]);
  assert.deepEqual(r.not_written.map((x) => [x.row, x.reason]), [[1, "ROW_ALREADY_WRITTEN"], [2, "ROW_ALREADY_WRITTEN"]]);
  assert.equal(facts(w), 5);
});
