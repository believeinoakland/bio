/* calculations, fix round 6 (T51; G45, K4666, K4669): a money ingest's record is kept whole, in pieces when a value passes
   INGEST_INLINE_MAX, never cut and never refused for size (R14). `ingestMoney` with `rows: "all"` over 18,098 rows whose payers
   are not identified bound a `not_written_json` of 2.7 MB and threw under the platform's value limit (run these under the
   preload: `node --import ./test/platform-sqlite.mjs --test`). Each test goes through the op's real entry over a table made by
   the real `declareTable`, an adopted binding and the real money module. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { seeded, V } from "./fixture.mjs";
import { INGEST_INLINE_MAX, INGEST_INLINE_ROWS, INGEST_CHUNK, INGEST_REASON_MAX, INGEST_ROWS_MAX, calculationsOps } from "../../../src/calculations/index.mjs";

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const ROLES = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };
const sha1 = (s) => createHash("sha256").update(s).digest("hex");
const bytes = (s) => Buffer.byteLength(s);
const LIMIT = 2_098_176;

/* a world with two registered persons (P001, P002); `payers(i)` names the payer of row i ("P001" resolves, anything else does not) */
async function setup(rows, payers, { project = null } = {}) {
  const w = seeded();
  w.person("Pat Quill", "P001");
  w.person("Lee Quill", "P002");
  let text = "payer,payee,amount\n";
  for (let i = 0; i < rows; i++) text += `${payers(i)},P002,${(i % 97) + 1}\n`;
  const t = await w.table(text, FIELDS, { roles: ROLES }, project ? { project } : {});
  const b = w.c.adoptBinding({ table: t.sha, roles: BIND, by: V("bob") });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  return { w, t, b };
}
const act = (w, b, extra = {}) => w.c.ingestMoney({ binding: b.binding, rows: "all", reason: "the whole ledger is the request's subject", by: V("bob"), ...extra });
/* G55: an act over INGEST_INLINE_ROWS answers started; its slices run until it is done */
async function drain(w, key) {
  for (let k = 0; k < 50; k++) { const t = await w.c.ingestTick(); assert.equal(t.ok, true, JSON.stringify(t)); if (w.c.ingestOf(key).state === "done") return; }
  assert.fail("the ingest did not finish");
}
const largest = (w) => Math.max(...w.rows(`SELECT length(CAST(rows_json AS BLOB)) a, length(CAST(written_json AS BLOB)) b, length(CAST(not_written_json AS BLOB)) c, length(CAST(reason AS BLOB)) d FROM calc_ingests`)
  .flatMap((r) => [r.a, r.b, r.c, r.d]), ...w.rows(`SELECT length(CAST(chunk AS BLOB)) a FROM calc_ingest_parts`).map((r) => r.a), 0);

test("R14 (G45 a, G55): rows \"all\" over 18,098 rows, most payers not identified and 300 written, is recorded whole: the act answers started, its slices keep every row, no stored value passes 1 MiB, ingestOf joins the pieces, the record's written equal the facts written", async () => {
  const { w, b } = await setup(18098, (i) => (i % 60 === 0 ? "P001" : `U${String(i).padStart(6, "0")}`));
  const s = await act(w, b);
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  assert.equal(s.state, "ingesting");
  assert.equal(s.rows_total, 18098);
  assert.equal(w.money.calls.length, 0, "the act itself writes no fact");
  await drain(w, s.ingest);
  const kept = w.c.ingestOf(s.ingest);
  assert.equal(kept.written.length, 302);
  assert.equal(kept.not_written.length, 18098 - 302, "every row is listed, cut nowhere");
  assert.ok(kept.not_written.every((x) => x.reason === "PAYER_NOT_IDENTIFIED"));
  assert.deepEqual(kept.not_written.map((x) => x.row), Array.from({ length: 18098 }, (_, i) => i).filter((i) => i % 60 !== 0), "in row order");
  assert.ok(largest(w) < 1024 * 1024, `the largest bound value is ${largest(w)} B`);
  assert.ok(largest(w) < LIMIT);
  assert.deepEqual(kept.rows, "all");
  assert.equal(kept.asked_by, V("bob"));
  assert.equal(w.money.calls.length, 302, "the facts written equal the record's written");
  assert.deepEqual(kept.written.map((x) => x.row), w.money.calls.map((c) => c.source.row));
});

test("R14 (G45 b): controls: 200 rows, and about 3,000 unwritten rows (under the inline max), are stored in calc_ingests alone, byte for byte as before, with no piece", async () => {
  for (const [rows, payers, expectWritten] of [[200, (i) => (i % 2 ? "P001" : `U${i}`), 100], [3000, (i) => `U${String(i).padStart(5, "0")}`, 0]]) {
    const { w, b } = await setup(rows, payers);
    const r = await act(w, b);
    assert.equal(r.ok, true);
    assert.equal(r.written.length, expectWritten);
    const row = w.rows(`SELECT * FROM calc_ingests`)[0];
    assert.equal(row.rows_json, JSON.stringify("all"));
    assert.equal(row.written_json, JSON.stringify(r.written), "the text json() made, unchanged");
    assert.equal(row.not_written_json, JSON.stringify(r.not_written));
    assert.equal(w.count("calc_ingest_parts"), 0, "no piece");
    assert.deepEqual(w.c.ingestOf(r.ingest).not_written, r.not_written);
  }
});

/* a table of `n` unidentified rows whose payers are `len(i)` characters long: the act's not_written size */
async function sized(n, len) {
  const { w, b } = await setup(n, (i) => "U".repeat(len(i)));
  const r = await act(w, b);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
  const stored = w.rows(`SELECT not_written_json AS c FROM calc_ingests`)[0].c;
  return { w, r, size: bytes(JSON.stringify(r.not_written)), stored };
}

test("R14 (G45 c): a not_written value of INGEST_INLINE_MAX bytes is inline, one byte more is in pieces; a reason with non-ASCII and a surrogate pair at a chunk edge round-trips exactly", async () => {
  assert.equal(INGEST_INLINE_MAX, 524288);
  assert.equal(INGEST_CHUNK, 262144);
  /* find a table whose not_written JSON is exactly INGEST_INLINE_MAX bytes: all payers 30 characters, adjust the last rows' lengths by the difference */
  const guess = await sized(2600, () => 60);
  const n = Math.floor(2600 * INGEST_INLINE_MAX / guess.size) - 1;
  assert.ok(n <= INGEST_INLINE_ROWS, "the case stays an inline act");
  const lens = new Array(n).fill(60);
  const first = await sized(n, (i) => lens[i]);
  let delta = INGEST_INLINE_MAX - first.size;
  assert.ok(Math.abs(delta) < 200 * 4, `a difference of ${delta} B can be spread over the last rows (each 60 +- 4 characters)`);
  for (let i = n - 1; delta !== 0; i--) { const d = Math.max(-4, Math.min(4, delta)); lens[i] += d; delta -= d; }
  const at = await sized(n, (i) => lens[i]);
  assert.equal(at.size, INGEST_INLINE_MAX);
  assert.equal(at.w.count("calc_ingest_parts"), 0, "exactly the inline max stays in the row");
  assert.equal(at.stored, JSON.stringify(at.r.not_written));
  lens[lens.findIndex((l) => l < 64)] += 1;
  const over = await sized(n, (i) => lens[i]);
  assert.equal(over.size, INGEST_INLINE_MAX + 1);
  assert.ok(over.w.count("calc_ingest_parts") >= 1, "one byte more is in pieces");
  assert.deepEqual(over.w.c.ingestOf(over.r.ingest).not_written, over.r.not_written);
  /* a payer value of non-ASCII characters and an astral pair, at every edge of a chunk */
  const wild = (i) => `Ü${"😀".repeat(20)}${i}`;
  const { w, b } = await setup(3000, (i) => wild(i));
  const r = await act(w, b);
  assert.equal(r.ok, true);
  const parts = w.rows(`SELECT chunk FROM calc_ingest_parts WHERE kind='not_written' ORDER BY seq`).map((x) => x.chunk);
  assert.ok(parts.length >= 2, "pieces");
  for (const p of parts) assert.ok(p.length <= INGEST_CHUNK && !/^[\udc00-\udfff]/.test(p) && !/[\ud800-\udbff]$/.test(p), "no pair is split at a piece's edge");
  assert.equal(parts.join(""), JSON.stringify(r.not_written));
  assert.deepEqual(w.c.ingestOf(r.ingest).not_written, r.not_written, "round-trips exactly");
});

test("R14 (G45 c2): a text whose 262,144th character is the low half of a pair is cut one earlier, so no piece splits a pair", async () => {
  /* a payer of 3 characters so each row is the same width, an astral character placed so a chunk edge lands inside a pair: found by scanning n */
  let found = false;
  for (const pad of [0, 1]) {
    const { w, b } = await setup(3000, (i) => `${"x".repeat(55 + pad)}😀${i % 10}`);
    const r = await act(w, b);
    assert.equal(r.ok, true);
    const parts = w.rows(`SELECT chunk FROM calc_ingest_parts WHERE kind='not_written' ORDER BY seq`).map((x) => x.chunk);
    if (parts.length < 2) continue;
    found = true;
    for (const p of parts) assert.ok(!/^[\udc00-\udfff]/.test(p) && !/[\ud800-\udbff]$/.test(p));
    assert.equal(parts.join(""), JSON.stringify(r.not_written));
  }
  assert.equal(found, true, "the case reached pieces");
});

test("R14 (G45 d): a repeat of the same call writes no second row and no second piece", async () => {
  const { w, b } = await setup(3000, (i) => `U${String(i).padStart(63, "0")}`);
  const a = await act(w, b);
  const rowsBefore = w.count("calc_ingests"), partsBefore = w.count("calc_ingest_parts");
  assert.ok(partsBefore >= 1);
  const again = await act(w, b);
  assert.equal(again.ingest, a.ingest, "the same key");
  assert.equal(w.count("calc_ingests"), rowsBefore);
  assert.equal(w.count("calc_ingest_parts"), partsBefore);
});

test("R14 (G45 e, G55): the listed-rows form with 90,000 explicit rows stores rows_json in pieces, runs in slices, and ingestOf returns the list and every row", async () => {
  const n = 90000;
  const { w, b } = await setup(5, (i) => `U${i}`);   /* the rows beyond the table are listed not written NO_SUCH_ROW, cheaply */
  const rows = Array.from({ length: n }, (_, i) => i);
  const r = await w.c.ingestMoney({ binding: b.binding, rows, by: V("bob") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
  assert.equal(r.state, "ingesting");
  assert.ok(bytes(JSON.stringify(rows)) > INGEST_INLINE_MAX, "the list itself passes the inline max");
  assert.deepEqual(w.rows(`SELECT DISTINCT kind FROM calc_ingest_parts ORDER BY kind`).map((x) => x.kind), ["rows"]);
  await drain(w, r.ingest);
  assert.deepEqual(w.rows(`SELECT DISTINCT kind FROM calc_ingest_parts ORDER BY kind`).map((x) => x.kind), ["not_written", "rows"]);
  assert.ok(largest(w) < 1024 * 1024);
  const kept = w.c.ingestOf(r.ingest);
  assert.deepEqual(kept.rows, rows);
  assert.equal(kept.not_written.length, n);
});

test("R14 R29 (G45 f): a purge of the bundle removes the pieces with the row", async () => {
  const { w, b } = await setup(3000, (i) => `U${String(i).padStart(63, "0")}`);
  const r = await act(w, b);
  assert.ok(w.count("calc_ingest_parts") >= 1);
  const bundle = w.rows(`SELECT bundle_id FROM calc_ingests WHERE ingest_key=?`, r.ingest)[0].bundle_id;
  assert.ok(bundle);
  w.record.purge({ bundleId: bundle });
  assert.equal(w.count("calc_ingests"), 0);
  assert.equal(w.count("calc_ingest_parts"), 0, "the pieces go with the row");
  assert.equal(w.c.ingestOf(r.ingest), null);
});

test("R14 (G45 h): a throw while the second piece is written leaves no calc_ingests row and no piece; the money facts the act wrote stay, true facts with no ingest row", async () => {
  const { w, b } = await setup(3000, (i) => (i % 400 === 0 ? "P001" : `U${String(i).padStart(63, "0")}`));
  const exec = w.st.sql.exec.bind(w.st.sql);
  let pieces = 0;
  w.st.sql.exec = (q, ...args) => {
    if (/INSERT OR IGNORE INTO calc_ingest_parts/.test(q) && ++pieces === 2) throw new Error("injected: the second piece could not be written");
    return exec(q, ...args);
  };
  const before = w.snapshot();
  await assert.rejects(() => act(w, b), /injected/);
  w.st.sql.exec = exec;
  assert.equal(pieces, 2);
  assert.equal(w.count("calc_ingests"), 0);
  assert.equal(w.count("calc_ingest_parts"), 0);
  const after = w.snapshot();
  for (const t of Object.keys(before)) if (t !== "facts" && !/^money|^fact|^entit|^ids|^minted/.test(t)) assert.deepEqual(after[t], before[t], t);
  assert.equal(w.money.calls.length, 8, "the facts money recorded before the throw remain (rows 0, 400, ... 2,800 resolve): true facts, no ingest row invented");
});

test("R14 (G45 i): a reason of 2,001 characters is refused BAD_REASON before any fact is written, and one of 2,000 is stored whole", async () => {
  assert.equal(INGEST_REASON_MAX, 2000);
  const { w, b } = await setup(20, (i) => (i % 2 ? "P001" : `U${i}`));
  const before = w.snapshot();
  const bad = await act(w, b, { reason: "é".repeat(2001) });
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, "BAD_REASON");
  assert.equal(w.money.calls.length, 0, "no fact written");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const reason = "é".repeat(2000);
  const ok = await act(w, b, { reason });
  assert.equal(ok.ok, true);
  assert.equal(w.rows(`SELECT reason FROM calc_ingests`)[0].reason, reason);
  assert.equal(w.rows(`SELECT 1 AS x FROM calc_ingests`).length, 1);
  assert.ok(bytes("é".repeat(2000)) + 3 * INGEST_INLINE_MAX < LIMIT, "the statement's sum stays under the platform's bound");
});

test("R24 K4208 (G45): the moneyingest op accepts the same keys, its answer unchanged", async () => {
  const { w, b } = await setup(30, (i) => (i % 2 ? "P001" : `U${i}`));
  const ops = calculationsOps(w.c, new URL(`https://plane.test/?viewer=${encodeURIComponent(V("bob"))}`), { binding: b.binding, rows: "all", reason: "all of it" });
  const r = await ops.moneyingest();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
  assert.deepEqual(Object.keys(r).sort(), ["asked_by", "binding", "by", "ingest", "not_written", "ok", "written"]);
});

test("R14 (G45 g): an act of more than INGEST_ROWS_MAX rows is refused INGEST_TOO_LARGE naming the count and the bound before any fact is written, nothing written; exactly the bound is read", async () => {
  assert.equal(INGEST_ROWS_MAX, 100000);
  const { w, b } = await setup(30, (i) => (i % 2 ? "P001" : `U${i}`));
  const before = w.snapshot();
  const over = await w.c.ingestMoney({ binding: b.binding, rows: Array.from({ length: INGEST_ROWS_MAX + 1 }, (_, i) => i), by: V("bob") });
  assert.equal(over.ok, false);
  assert.equal(over.reason, "INGEST_TOO_LARGE");
  assert.deepEqual([over.rows, over.bound_rows], [INGEST_ROWS_MAX + 1, INGEST_ROWS_MAX]);
  assert.match(over.detail, /100000/);
  assert.equal(w.money.calls.length, 0, "no money fact");
  assert.deepEqual(w.snapshot(), before, "no row, no piece");
  /* the rows beyond the 30 held are listed not written, cheaply */
  const at = await w.c.ingestMoney({ binding: b.binding, rows: Array.from({ length: INGEST_ROWS_MAX }, (_, i) => i), by: V("bob") });
  assert.equal(at.ok, true, JSON.stringify(at).slice(0, 200));
  assert.equal(at.rows_total, INGEST_ROWS_MAX, "exactly the bound is accepted and runs in the background");
  assert.ok(largest(w) < 1024 * 1024);
});
