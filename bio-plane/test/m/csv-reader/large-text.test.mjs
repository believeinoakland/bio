/* csv-reader R6 and R9 (as G41 amends them, K4652): a body up to MEASURED_CSV_TEXT_BOUND_BYTES (17 MiB, the largest the
   plane read at its real shape) is read whole, in bounded memory; a body over it, up to ooxml's ceiling, is STATED with its
   size and `final`, never read in pieces; over the ceiling the marker is textPlan's. Every body is a real one built by
   `large.mjs`, its expected text computed by a route that shares no code with the reader. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { csvEntry, MEASURED_CSV_TEXT_BOUND_BYTES, walkRecords, createRecordWalk } from "../../../src/csv-reader/index.mjs";
import { STREAMED_TEXT_BOUND_BYTES } from "../../../src/ooxml.mjs";
import { bigCsv, prng } from "./large.mjs";
import { harnessCsv } from "./g41.mjs";

const MIB = 1024 * 1024;
const BOUND = MEASURED_CSV_TEXT_BOUND_BYTES;
const same = (got, want, what) => assert.ok(got === want, `${what}: ${got == null ? got : got.length} chars, wanted ${want.length}`);

test("R9 csv: the bound is 17 MiB", () => {
  assert.equal(BOUND, 17 * MIB);
});

test("R9 csv: a 12 MB body yields its records, quoted fields and line breaks included, whole, with every cell", async () => {
  const f = bigCsv({ rows: 5500 });
  assert.ok(f.declared > 10 * MIB && f.declared <= BOUND, `fixture is ${f.declared} bytes`);
  const parts = await csvEntry.parts(f.bytes);
  assert.equal(parts.ok, true);
  const t = await csvEntry.text(parts);
  assert.equal(t.ok, true);
  same(t.document, f.expected, "document");
  assert.equal(t.sheets[0].usedRows, f.rows);
  assert.equal(t.sheets[0].usedCols, 6);
  assert.ok(Array.isArray(t.sheets[0].cells));
  assert.equal(t.dialect.delimiter, "comma");
  assert.ok(!("piecewise" in t));
  const st = await csvEntry.structure(parts);
  assert.equal(st.ok, true);
  assert.ok(!st.notes.includes("text_read_in_pieces"));
});

const WORKER = new URL("./large-worker.mjs", import.meta.url);
const inWorker = (bytes, limitMb) => new Promise((resolve, reject) => {
  const w = new Worker(WORKER, { workerData: { bytes }, resourceLimits: { maxOldGenerationSizeMb: limitMb } });
  w.once("message", resolve);
  w.once("error", reject);
});

test("R9 memory: a csv read of 17 MiB less a row, the bound, completes inside a 128 MB old-space limit", async () => {
  const f = bigCsv({ rows: 8900 });
  assert.ok(f.declared > 16 * MIB - 1 && f.declared <= BOUND, `csv declares ${f.declared}`);
  const got = await inWorker(f.bytes, 128);
  assert.equal(got.ok, true);
  assert.equal(got.undetermined, 0);
  assert.equal(got.documentLength, f.expected.length);
});

test("R9 csv: a harness CSV of the bound is read whole; one byte more is stated with its size, final, and nothing is read", async () => {
  const { bytes } = harnessCsv(BOUND - 200);
  assert.ok(bytes.length <= BOUND);
  const whole = await csvEntry.text(bytes, { inlineCellsMax: 512 * 1024 });
  assert.equal(whole.ok, true);
  assert.ok(whole.document.includes("LASTROWMARK"));
  const over = new Uint8Array(BOUND + 1).fill(0x61);
  for (let i = 9; i < over.length; i += 10) over[i] = 0x0a;
  const marker = { ok: false, text: "undetermined", why: "over_size_bound", size: BOUND + 1, bound: BOUND,
    boundName: "MEASURED_CSV_TEXT_BOUND_BYTES", metric: "body_bytes", final: true };
  for (const t of [await csvEntry.text(over), await csvEntry.text(over, { inlineCellsMax: 512 * 1024 })]) {
    assert.equal(t.ok, true);
    assert.equal(t.document, null);
    assert.deepEqual(t.sheets, []);
    assert.deepEqual(t.undetermined, [marker]);
    assert.ok(!("piecewise" in t));
  }
  const st = await csvEntry.structure(over);
  assert.deepEqual(st.evidentiary.undetermined[0].guard, marker);
  assert.ok(st.notes.includes("text_body_over_bound"));
  assert.deepEqual(await csvEntry.cellsIn(over, { fromRow: 1, toRow: 1 }), { ...marker });
});

test("R9 csv: a 30 MB body is stated with its size, not read", async () => {
  const f = bigCsv({ rows: 13000 });
  assert.ok(f.declared > BOUND && f.declared <= STREAMED_TEXT_BOUND_BYTES, `fixture is ${f.declared} bytes`);
  const t = await csvEntry.text(f.bytes);
  assert.equal(t.document, null);
  assert.deepEqual(t.sheets, []);
  assert.equal(t.undetermined.length, 1);
  assert.equal(t.undetermined[0].why, "over_size_bound");
  assert.equal(t.undetermined[0].size, f.declared);
  assert.equal(t.undetermined[0].bound, BOUND);
  assert.equal(t.undetermined[0].final, true);
  assert.equal(t.undetermined[0].metric, "body_bytes");
  assert.equal(t.dialect.delimiter, "comma", "the dialect still stands: it is read from the head");
});

test("R9 csv: over the ceiling the marker is textPlan's guard, final, with metric body_bytes", async () => {
  const body = new Uint8Array(STREAMED_TEXT_BOUND_BYTES + 1).fill(0x61);
  const t = await csvEntry.text(body);
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: body.length,
    bound: STREAMED_TEXT_BOUND_BYTES, boundName: "STREAMED_TEXT_BOUND_BYTES", metric: "body_bytes", final: true }]);
  assert.ok(!("piecewise" in t));
});

test("R9 csv: walking a text in pieces cut anywhere gives the records of walking it whole", () => {
  const rand = prng(41);
  const alphabet = ['a', 'b', ',', '"', '"', '\r', '\n', '\r\n', ' ', ';'];
  for (let round = 0; round < 400; round++) {
    let text = "";
    for (let i = 0, n = 1 + (rand() % 60); i < n; i++) text += alphabet[rand() % alphabet.length];
    for (const delimiter of [",", null]) {
      const whole = walkRecords(text, delimiter);
      for (let cuts = 1; cuts <= 4; cuts++) {
        const points = Array.from({ length: cuts }, () => rand() % (text.length + 1)).sort((a, b) => a - b);
        const got = [];
        const w = createRecordWalk(delimiter, (r) => got.push(r));
        let from = 0;
        for (const p of points) { w.feed(text.slice(from, p)); from = p; }
        w.feed(text.slice(from));
        w.end();
        assert.deepEqual(got, whole, JSON.stringify({ text, delimiter, points }));
      }
    }
  }
});

test("R9 csv: a UTF-16 body over the bound is stated with its size, final, and its encoding", async () => {
  const n = BOUND / 2 + 8;
  const bytes = new Uint8Array(2 + n * 2);
  bytes.set([0xff, 0xfe]);
  for (let i = 0; i < n; i++) { bytes[2 + i * 2] = i % 61 === 60 ? 0x0a : 0x61; }
  const t = await csvEntry.text(bytes);
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: bytes.length - 2,
    bound: BOUND, boundName: "MEASURED_CSV_TEXT_BOUND_BYTES", metric: "body_bytes", final: true, encoding: "utf-16le" }]);
  assert.equal(t.dialect.encoding, "utf-16le");
});

test("R9 csv: cells a legacy encoding cannot read are all listed, a body of the bound included", async () => {
  /* Latin-1 text: its high bytes are no valid UTF-8, so the encoding is undetermined and every accented field is an
     undetermined cell; 12,000 of them in a body well over the windowed walk's threshold. */
  const lines = [];
  for (let i = 0; i < 60; i++) lines.push(`${i},plain,text\n`);
  for (let i = 0; i < 12000; i++) lines.push(`${i},${"p".repeat(200)},café\n`);
  const bytes = new Uint8Array(lines.join("").length);
  const text = lines.join("");
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  const t = await csvEntry.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.undetermined.length, 12000);
  assert.equal(t.undetermined[0].reason, "encoding_undetermined");
  assert.ok(!t.undetermined.some((u) => u.reason === "more_cells_undetermined"));
});
