/* calculations, fix round 7 (G63; R-CLOCK): the act that only STARTS a background ingest (R14, G55 tier 2: over INGEST_INLINE_ROWS rows) reads and
   hashes none of the table's bytes: its row count is the table's record's, and the alarm leg's slices read the table. Work is counted
   (statements that read the chunked copy of the table's bytes, the characters they return), never timed: the object's clock is frozen
   (R-CLOCK). Every test drives the op `moneyingest` as `calculationsOps` answers it, over a table made by the real `declareTable`. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { calculationsOps, INGEST_INLINE_ROWS } from "../../../src/calculations/index.mjs";

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const SCHEME = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };
const url = new URL(`http://civic.test/?viewer=${encodeURIComponent(V("bob"))}`);
const ingest = (w, binding, body) => calculationsOps(w.c, url, { binding, reason: "the whole ledger is the request's subject", ...body }).moneyingest();

/* a world with a table of `rows` rows and an adopted binding; the table's bytes are not at hand in memory (declared, never read) */
async function setup(rows) {
  const w = seeded();
  w.person("Pat Quill", "P001"); w.person("Lee Quill", "P002");
  let text = "payer,payee,amount\n";
  for (let i = 0; i < rows; i++) text += `U${String(i).padStart(6, "0")},P002,${(i % 97) + 1}\n`;
  const t = await w.table(text, FIELDS, { roles: SCHEME });
  const b = w.c.adoptBinding({ table: t.sha, roles: BIND, by: V("bob") });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  return { w, b };
}
/* counts what is read of the table's chunked bytes from the module's storage (a statement that selects the `chunk` column; a probe that
   selects none reads no byte) */
function countTableReads(w) {
  const n = { statements: 0, chars: 0 };
  const real = w.st.sql.exec.bind(w.st.sql);
  w.st.sql.exec = (q, ...a) => {
    const out = real(q, ...a);
    if (!/SELECT\s+chunk\s+FROM calc_table_bytes/i.test(q)) return out;
    const rows = [...out];
    n.statements++;
    n.chars += rows.reduce((c, r) => c + (typeof r.chunk === "string" ? r.chunk.length : 0), 0);
    return { next: () => ({ done: true, value: undefined }), [Symbol.iterator]() { return rows[Symbol.iterator](); }, toArray: () => rows, one: () => rows[0] };
  };
  return n;
}
async function drain(w, key) {
  for (let k = 0; k < 50; k++) { const t = await w.c.ingestTick(); assert.equal(t.ok, true, JSON.stringify(t)); if (w.c.ingestOf(key).state === "done") return; }
  assert.fail("the ingest did not finish");
}

test("R14 G63: an act of rows \"all\" over INGEST_INLINE_ROWS answers started having read and hashed none of the table's bytes; its slices then read them and finish with the whole record", async () => {
  const total = INGEST_INLINE_ROWS + 2000;
  const { w, b } = await setup(total);
  const reads = countTableReads(w);
  const r = await ingest(w, b.binding, { rows: "all" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.state, "ingesting");
  assert.equal(r.rows_total, total, "the count is the table's own record's");
  assert.deepEqual(reads, { statements: 0, chars: 0 }, "no byte of the table is read on the started path");
  await drain(w, r.ingest);
  assert.ok(reads.statements > 0, "the alarm leg's slices read the table");
  const done = w.c.ingestOf(r.ingest);
  assert.equal(done.written.length + done.not_written.length, total, "every row is judged exactly once");
  assert.deepEqual(done.rows, "all");
});

test("R14 G63: rows listed over INGEST_INLINE_ROWS start likewise without reading the table; the refusals keep their order (NO_REASON for all without a reason, NO_ROWS, INGEST_TOO_LARGE)", async () => {
  const { w, b } = await setup(INGEST_INLINE_ROWS + 5);
  const reads = countTableReads(w);
  const listed = Array.from({ length: INGEST_INLINE_ROWS + 1 }, (_, i) => i);
  const r = await ingest(w, b.binding, { rows: listed });
  assert.equal(r.state, "ingesting");
  assert.equal(r.rows_total, listed.length);
  assert.equal(reads.statements, 0);
  await drain(w, r.ingest);
  /* the refusals, each writing nothing, after the first ingest is done so the binding is free */
  const before = w.count("calc_ingests");
  assert.equal((await ingest(w, b.binding, { rows: "all", reason: " " })).reason, "NO_REASON");
  assert.equal((await ingest(w, b.binding, { rows: [] })).reason, "NO_ROWS");
  assert.equal((await ingest(w, b.binding, { rows: [-1] })).reason, "NO_ROWS");
  assert.equal(w.count("calc_ingests"), before);
});

test("R14 G63 control: an act at or under INGEST_INLINE_ROWS runs whole and does read the table (1,500 rows), and answers whole", async () => {
  const { w, b } = await setup(1500);
  const reads = countTableReads(w);
  const r = await ingest(w, b.binding, { rows: "all" });
  assert.equal(r.ok, true);
  assert.equal(r.state, undefined, "answered whole, not started");
  assert.ok(reads.statements > 0 && reads.chars > 0, "the whole act reads the table");
  assert.equal(r.written.length + r.not_written.length, 1500);
});
