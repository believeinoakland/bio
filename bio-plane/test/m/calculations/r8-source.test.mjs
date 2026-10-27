/* calculations: G101 (fix round 8), R44. A CSV `document` source is declared from the file's stored bytes, never from the
   reading's index: the index (R41 of reading-pipeline) cuts a CSV over 128 KiB into blocks of whole lines that each repeat
   the header, and `content.passageText` joins them, so a table made from it holds the header again as data. The index is
   handed to the real content module the way the reading hands it (units `sheet-range`, header repeated at the head of
   every later block); the file's bytes are in the evidence store. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const data = (n) => Array.from({ length: n }, (_, i) => [`PBs${String(i).padStart(6, "0")}`, "P002", String(1 + (i % 97))]);
const joined = (sep, rows) => rows.map((r) => r.join(sep)).join("\n") + "\n";
const declare = (w, id) => w.c.declareTable({ source: id, schema: { fields: F }, header: HEADER, by: V("bob") });

/* the units of a reading that cut `rows` (lines after the header) into blocks of `per` lines, the header at the head of every later block */
function blocksOf(rows, per) {
  const units = [];
  for (let at = 0, seq = 0; at < rows.length; at += per, seq++) {
    const lines = rows.slice(at, at + per).map((r) => r.join(","));
    const text = [HEADER.join(","), ...lines].join("\n");
    units.push({ seq, extent: { kind: "sheet-range", sheet: "csv", range: `A${at + 1}:C${at + per + 1}` }, ref: `u${seq}`, text, truncated: false });
  }
  return units;
}

/* a comma CSV of `rows` captured and minted whole, its reading holding `units` and recorded as a csv; `bytes` false leaves the evidence store without it */
function captured(w, rows, { per = 7318, format = "csv", bytes = true, tag = "" } = {}) {
  const text = joined(",", [HEADER, ...rows]) + tag;
  const id = w.csv(text);
  const cap = w.content.contentRow(id).capture_sha;
  w.ex.readings[cap] = { pageCount: 1, captureFormat: format };
  w.ex.units[cap] = { units: blocksOf(rows, per), state: "whole" };
  if (!bytes) w.ev.m.delete(cap);
  return id;
}

test("R44 (G101): the comma CSV of the walker's size (18,098 rows, three index blocks that repeat the header) declares 18,098 rows, none undetermined, and the sha of its tab twin", async () => {
  const w = seeded();
  const rows = data(18098);
  const comma = await declare(w, captured(w, rows));
  assert.equal(code(comma), "ok");
  assert.equal(comma.rows, 18098, "the header is not data again at the block boundaries");
  assert.equal(comma.undetermined.count, 0);
  assert.deepEqual(comma.header, HEADER);
  const tab = await declare(w, w.csv(joined("\t", [HEADER, ...rows])));
  assert.equal(code(tab), "ok");
  assert.equal(tab.rows, 18098);
  assert.equal(comma.sha, tab.sha, "one table has one sha whichever route read the same data");
  const page = await w.c.readTable({ sha: comma.sha, viewer: V("bob"), limit: 3 });
  assert.deepEqual(page.page.rows[0], ["PBs000000", "P002", "1"], "row 0 is the first data row");
  const at = await w.c.readTable({ sha: comma.sha, viewer: V("bob"), limit: 3, after: 7316 });
  assert.notEqual(at.page.rows[0][2], "amount", "row 7316 is not the header read as data");
});

test("R44 (G101): a source whose bytes are not held is refused SOURCE_NOT_READ, stated, nothing written, never made from the index", async () => {
  const w = seeded();
  const before = w.count("calc_tables");
  const r = await declare(w, captured(w, data(18098), { bytes: false }));
  assert.equal(code(r), "SOURCE_NOT_READ");
  assert.equal(typeof r.detail, "string");
  assert.ok(r.detail.length > 0);
  assert.equal(w.count("calc_tables"), before, "nothing written");
  assert.equal(w.count("calc_table_bytes"), 0);
});

test("R44 (G101) controls: a 120-row file (one block), a file just under and just over the unit cap, and a document that is not a csv read as before", async () => {
  const w = seeded();
  const small = await declare(w, captured(w, data(120), { per: 1000 }));
  assert.equal(code(small), "ok");
  assert.equal(small.rows, 120);
  for (const [n, per] of [[5600, 5600], [5700, 2850]]) {   /* about 127 KiB in one block and about 129 KiB in two */
    const w2 = seeded();
    const r = await declare(w2, captured(w2, data(n), { per }));
    assert.equal(code(r), "ok", String(n));
    assert.equal(r.rows, n, String(n));
    assert.equal(r.undetermined.count, 0, String(n));
  }
  /* a document no csv: its index is its text, as before (a one-block index of lines, no bytes held) */
  const w3 = seeded();
  const id = captured(w3, data(40), { per: 1000, format: "pdf", bytes: false });
  const other = await declare(w3, id);
  assert.equal(code(other), "ok");
  assert.equal(other.rows, 40);
});
