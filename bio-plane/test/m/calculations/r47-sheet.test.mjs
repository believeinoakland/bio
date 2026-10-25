/* calculations, fix round 9 (T51): R47 (G182; S-27) a table from a sheet range keeps each row and column where the sheet has it.
   Reproduced on the tip first: a range with an empty leading column that includes its header row was refused (the header row did not
   match the declared header, so it was a data row of more cells than the header), and a money fact's `source.row` was the position in
   the table, not the sheet's row. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const declare = (w, source, extra = {}) => w.c.declareTable({ source, schema: { fields: F }, header: HEADER, by: V("bob"), ...extra });
const cell = (a, v) => ({ source: { kind: "sheet-cell", cell: a }, value: v, type: "s" });
const COLS = ["A", "B", "C", "D", "E"];
/* a block of rows from sheet row `first`; "" is a cell the reader lists none of */
const cellsOf = (rows, first = 1) => rows.flatMap((r, i) => r.flatMap((v, c) => (v === "" ? [] : [cell(`${COLS[c]}${first + i}`, v)])));
const readRows = async (w, sha) => (await w.c.readTable({ sha, viewer: V("bob"), limit: 1000 })).page.rows;

/* sheet rows 1..6: column A empty throughout; row 1 the header; row 4 blank; row 3 has an empty mid cell */
const SHEET = [["", "payer", "payee", "amount"], ["", "P100", "", "100"], ["", "P003", "P004", "7"], ["", "", "", ""], ["", "P005", "P006", "12"]];
const BODY = [["P100", "", "100"], ["P003", "P004", "7"], ["", "", ""], ["P005", "P006", "12"]];

test("R47 (G182) a range with an empty first column that includes its header row: the header row is the table's header, never a data row, and every value stays in its own column and row", async () => {
  const w = seeded();
  const t = await declare(w, w.sheet(cellsOf(SHEET, 1), "A1:D5"));
  assert.equal(code(t), "ok", JSON.stringify(t).slice(0, 300));
  assert.equal(t.rows, BODY.length, "the header row is not a row; the blank row is one");
  assert.deepEqual(await readRows(w, t.sha), BODY);
  const csv = await declare(w, w.csv(`${[HEADER, ...BODY].map((r) => r.join(",")).join("\n")}\n`));
  assert.equal(csv.sha, t.sha, "the same table whichever route made it");
});

test("R47 (G182) a title row and a blank row above the header are not data; the header row is found by the declared names, wherever the range puts it", async () => {
  const w = seeded();
  const rows = [["Payments 2026", "", "", ""], ["", "", "", ""], ...SHEET];
  const t = await declare(w, w.sheet(cellsOf(rows, 1), "A1:D7"));
  assert.equal(code(t), "ok", JSON.stringify(t).slice(0, 300));
  assert.deepEqual(await readRows(w, t.sha), BODY);
  assert.equal(t.source.header_row, 3);
  assert.equal(t.source.first_row, 4);
});

test("R47 (G182) a column of the range that no declared name covers and that holds a value refuses the declaration, never closing it up", async () => {
  const w = seeded();
  const rows = SHEET.map((r, i) => [...r, i === 2 ? "note" : ""]);
  const t = await declare(w, w.sheet(cellsOf(rows, 1), "A1:E5"));
  assert.equal(code(t), "BAD_SCHEMA");
  assert.equal(w.count("calc_tables"), 0);
});

test("R47 (G182) each money fact cites the sheet's own row (source.row), the blank row skipped over, never a position after blanks were dropped", async () => {
  const w = seeded();
  const fields = F;
  const roles = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
  for (const id of ["P100", "P003", "P004", "P005", "P006"]) w.person(`Person ${id}`, id);
  const t = await w.c.declareTable({ source: w.sheet(cellsOf(SHEET.map((r) => [...r]), 1).concat([]), "A1:D5"), schema: { fields }, header: HEADER, roles, by: V("bob") });
  assert.equal(code(t), "ok", JSON.stringify(t).slice(0, 300));
  const b = w.c.adoptBinding({ table: t.sha, roles: { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
    stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "FY2025-26" } }, by: V("bob") });
  /* table rows 1, 3 and 0 (P003, P005 and P100 with an empty payee, refused) are asked for */
  const r = await w.c.ingestMoney({ binding: b.binding, rows: [0, 1, 3], by: V("bob") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.written.map((x) => x.row), [1, 3], JSON.stringify(r.not_written));
  assert.deepEqual(w.money.calls.map((c) => c.source.row), [3, 5], "the sheet's rows 3 and 5 (the header is row 1, the blank row 4)");
  /* control: a CSV table keeps its position as the row */
  const csvT = await w.table("payer,payee,amount\nP100,P003,5\n", fields, { roles });
  const cb = w.c.adoptBinding({ table: csvT.sha, roles: { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
    stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "FY2025-26" } }, by: V("bob") });
  w.money.calls.length = 0;
  await w.c.ingestMoney({ binding: cb.binding, rows: [0], by: V("bob") });
  assert.equal(w.money.calls[0].source.row, 0);
});
