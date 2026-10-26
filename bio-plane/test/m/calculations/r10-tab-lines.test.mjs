/* calculations, fix round 10 (T51): R45's amendment (cause 19, K5056). A reading's own tab-joined text (a spreadsheet's or an ODS's cells joined by a
   tab) has a known delimiter, the tab: a cell `$69,268.31` stays one cell. Any other text whose delimiter is tied is refused, stated, never read as a comma
   in silence. The walker's case: an ODS of six columns, one of them currency, declared as a table through its reading's lines. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { generate } from "../../sheetgen.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "string" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const declare = (w, source, schema = F, header = HEADER) => w.c.declareTable({ source, schema: { fields: schema }, header, by: V("bob") });
const readRows = async (w, sha, limit = 1000) => (await w.c.readTable({ sha, viewer: V("bob"), limit })).page.rows;
const csvLine = (r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v)).join(",");
const csvText = (rows) => `${rows.map(csvLine).join("\n")}\n`;

/* a document whose index is lines of text, each line the cells joined by `sep` (what a reading of a spreadsheet gives) */
function lined(w, rows, sep) {
  const text = `${rows.map((r) => r.join(sep)).join("\n")}\n`;
  const id = w.csv(text);
  const cap = w.content.contentRow(id).capture_sha;
  w.ex.readings[cap] = { pageCount: 1, captureFormat: "text" };
  w.ex.units[cap] = { units: rows.map((r, i) => ({ seq: i, extent: { kind: "doc-para", para: i }, ref: `u${i}`, text: r.join(sep), truncated: false })), state: "whole" };
  w.ev.m.delete(cap);
  return id;
}

test("R45 (cause 19): a tab-joined line whose cell holds a comma ($69,268.31) is three cells, and the table is the CSV file's of the same data", async () => {
  const w = seeded();
  const body = [["P1", "Q1", "$69,268.31"], ["P2", "Q2", "$1,000.00"], ["P3", "Q3", "$604,452.25"]];
  const t = await declare(w, lined(w, body, "\t"));
  assert.equal(code(t), "ok", JSON.stringify(t).slice(0, 300));
  assert.deepEqual(await readRows(w, t.sha), body, "each row equals its input; no cell cut at a comma");
  const twin = await declare(w, w.csv(csvText([HEADER, ...body])));
  assert.equal(code(twin), "ok");
  assert.equal(twin.sha, t.sha, "one table has one sha whichever route made it");
});

test("R45 (cause 19): a real ODS's lines (the generator's sheet of 200 rows and six columns, a currency column among them) declare as its truth, equal to the CSV twin", async () => {
  const w = seeded();
  const g = generate({ kind: "ods", seed: "rw9-B-2a", size: { rows: 200, cols: 6 } });
  const names = g.truth.header[0];
  const fields = names.map((name) => ({ name, type: "string" }));
  /* the reading's text is the sheet's rows, each cell of the currency column holding a thousands comma, as every line of the walker's did */
  const body = Array.from({ length: g.truth.rows }, (_, i) => g.truth.row(i + 1).map((v, c) => (c === 5 && !v.includes(",") ? `$${1000 + i},000.50` : v)));
  assert.ok(body.some((r) => r.some((v) => v.includes(","))), "the sheet holds a cell with a comma");
  const t = await declare(w, lined(w, body, "\t"), fields, names);
  assert.equal(code(t), "ok", JSON.stringify(t).slice(0, 300));
  const got = await readRows(w, t.sha, 1000);
  assert.equal(got.length, body.length);
  assert.deepEqual(got, body);
  const twin = await declare(w, w.csv(csvText([names, ...body])), fields, names);
  assert.equal(twin.sha, t.sha);
});

test("R45 (cause 19): control: a plain text whose delimiter is tied (comma and semicolon both on every line) is refused with the reason stated, never read as a comma", async () => {
  const w = seeded();
  const r = await declare(w, lined(w, [["P1", "Q1;x", "2"], ["P2", "Q2;y", "3"]].map((row) => [row.join(",")]), ""));
  assert.equal(code(r), "SOURCE_NOT_READ", JSON.stringify(r).slice(0, 300));
  assert.ok(Array.isArray(r.tied) && r.tied.length > 1, "the refusal names the tie");
});
