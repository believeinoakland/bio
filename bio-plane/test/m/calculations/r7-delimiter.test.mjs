/* calculations: G64 (fix round 7), a source in another delimiter. R1 `declareTable` finds the source's delimiter as the
   document's own reader does (csv-reader's `delimiterSignature`), so a tab-, semicolon- or pipe-delimited file is declared as
   the table it is; the canonical bytes stay comma RFC 4180, so one table gives one sha whatever its source's delimiter; a
   source that splits into one cell per line against a wider header is refused, never held. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const data = (n) => Array.from({ length: n }, (_, i) => [`P${String(i + 1).padStart(3, "0")}`, "P002", String(10 + (i % 90))]);
const joined = (sep, rows) => rows.map((r) => r.join(sep)).join("\n") + "\n";
const declare = (w, text, header = HEADER, fields = F) =>
  w.c.declareTable({ source: w.csv(text), schema: { fields }, header, by: V("bob") });

test("R1 G64 control: a comma file whose first line is the declared header holds exactly its data rows", async () => {
  const w = seeded();
  const r = await declare(w, joined(",", [HEADER, ...data(120)]));
  assert.equal(code(r), "ok");
  assert.equal(r.rows, 120);
  assert.deepEqual(r.header, HEADER);
});

test("R1 G64: a tab-delimited source (the walker's shape, 18,098 data rows) is the 3-column table, its header dropped, the same sha as the comma file of the same rows", async () => {
  const w = seeded();
  const rows = data(18098);
  const tab = await declare(w, joined("\t", [HEADER, ...rows]));
  assert.equal(code(tab), "ok");
  assert.equal(tab.rows, 18098, "the header line is not a data row");
  assert.deepEqual(tab.header, HEADER);
  assert.equal(tab.undetermined.count, 0);
  const w2 = seeded();
  const comma = await declare(w2, joined(",", [HEADER, ...rows]));
  assert.equal(tab.sha, comma.sha, "the canonical bytes are comma RFC 4180 whichever delimiter the source used");
  const page = await w.c.readTable({ sha: tab.sha, viewer: V("bob"), limit: 3 });
  assert.deepEqual(page.page.rows[0], ["P001", "P002", "10"], "row 0 is the first data row");
  assert.equal(page.table.rows.length, 3, "R48: the answer holds the page asked, three rows");
  assert.equal((await w.c.readTable({ sha: tab.sha, viewer: V("bob"), limit: 3, rows: "all" })).table.rows.length, 18098, "every row only when asked for");
});

test("R1 G64: a semicolon- and a pipe-delimited source likewise; a quoted delimiter inside a cell stays in its cell", async () => {
  for (const sep of [";", "|"]) {
    const w = seeded();
    const r = await declare(w, joined(sep, [HEADER, ...data(40)]));
    assert.equal(code(r), "ok", sep);
    assert.equal(r.rows, 40, sep);
  }
  const w = seeded();
  const r = await declare(w, `payer\tpayee\tamount\n"Smith, J\tx"\tP002\t5\nAda\tP002\t6\n`);
  assert.equal(code(r), "ok");
  assert.equal(r.rows, 2);
  const read = await w.c.readTable({ sha: r.sha, viewer: V("bob") });
  assert.equal(read.page.rows[0][0], "Smith, J\tx");
});

test("R1 G64: a source that is one cell per line against a 3-column header is refused, naming the delimiter found and the columns expected; nothing is written", async () => {
  const w = seeded();
  const before = w.count("calc_tables");
  const r = await declare(w, "just a list\nof lines\nwith no separator\n");
  assert.equal(code(r), "SOURCE_NOT_READ");
  assert.equal(r.delimiter, null, "no delimiter was found");
  assert.equal(r.columns_expected, 3);
  assert.equal(typeof r.detail, "string");
  assert.ok(r.detail.length > 0);
  assert.equal(w.count("calc_tables"), before, "nothing written");
  /* control: a one-column header over one cell per line is that table */
  const one = await declare(w, "name\nAda\nBob\n", ["name"], [{ name: "name", type: "string" }]);
  assert.equal(code(one), "ok");
  assert.equal(one.rows, 2);
});

test("R1 (K5148) a source no line of which splits into the declared columns is refused SOURCE_NOT_READ with the delimiter and the columns expected, nothing written; a short row among full ones still pads (R45)", async () => {
  const H4 = ["payer", "payee", "amount", "fund"], F4 = H4.map((name) => ({ name, type: "string" }));
  const w = seeded();
  const before = w.count("calc_tables");
  /* (a) a semicolon file whose lines have 3 cells against a 4-column header; (c) a prose letter whose one comma splits a line in two */
  const cases = [
    ["payer;payee;amount\nCity of Oakland;Acme Paving;5\n", "semicolon"],
    ["Dear clerk, please send me the budget.\nThank you for your help.\n", null],
  ];
  for (const [text, delimiter] of cases) {
    const r = await declare(w, text, H4, F4);
    assert.equal(code(r), "SOURCE_NOT_READ", text);
    assert.equal(r.delimiter, delimiter, "the delimiter found, null when the lines show none");
    assert.equal(r.columns_expected, 4);
    assert.equal(typeof r.content_id, "string");
  }
  assert.equal(w.count("calc_tables"), before, "nothing written");
  /* control: one short row among full ones is padded and counted */
  const ok = await declare(w, "payer,payee,amount,fund\nA,B,1,F\nC,D,2\nE,F,3,G\n", H4, F4);
  assert.equal(code(ok), "ok");
  assert.equal(ok.rows, 3);
  assert.ok(ok.undetermined.count >= 1, "the padded cell is counted apart (R45)");
});
