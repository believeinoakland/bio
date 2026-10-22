/* csv-reader R9 (fix round 4b, F7; K4487): a body over the 20 MiB bound is read, in bounded pieces, through the
   entry's real text() and structure(). Every body here is a real one built by `large.mjs`, its expected text
   computed by a route that shares no code with the reader. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { csvEntry, MEASURED_CSV_TEXT_BOUND_BYTES, walkRecords, createRecordWalk } from "../../../src/csv-reader/index.mjs";
import { MEASURED_OOXML_TEXT_BOUND_BYTES, STREAMED_TEXT_BOUND_BYTES } from "../../../src/ooxml.mjs";
import { bigCsv, csvField, randomText, prng } from "./large.mjs";
import { enc } from "./fixtures.mjs";

const BOUND = MEASURED_OOXML_TEXT_BOUND_BYTES;
const same = (got, want, what) => assert.ok(got === want, `${what}: ${got == null ? got : got.length} chars, wanted ${want.length}`);
const noGuard = (list) => assert.ok(!list.some((u) => u.why === "over_size_bound"), "no over_size_bound marker");

test("R9 csv: a 30 MB body yields its records, quoted fields and line breaks included", async () => {
  const f = bigCsv({ rows: 13000 });
  assert.ok(f.declared > MEASURED_CSV_TEXT_BOUND_BYTES, `fixture is ${f.declared} bytes`);
  const parts = await csvEntry.parts(f.bytes);
  assert.equal(parts.ok, true);
  const t = await csvEntry.text(parts);
  assert.equal(t.ok, true);
  noGuard(t.undetermined);
  same(t.document, f.expected, "document");
  assert.equal(t.sheets[0].usedRows, f.rows);
  assert.equal(t.sheets[0].usedCols, 6);
  assert.equal(t.sheets[0].cells, null);
  assert.equal(t.dialect.delimiter, "comma");
  assert.equal(t.piecewise.declared, f.declared);
  assert.equal(t.piecewise.boundName, "MEASURED_CSV_TEXT_BOUND_BYTES");
  assert.equal(t.piecewise.metric, "body_bytes");
  const st = await csvEntry.structure(parts);
  assert.equal(st.ok, true);
  assert.ok(!st.evidentiary.undetermined.some((u) => u.why === "over_size_bound"));
  assert.ok(st.notes.includes("text_read_in_pieces"));
});

const WORKER = new URL("./large-worker.mjs", import.meta.url);
const inWorker = (bytes, limitMb) => new Promise((resolve, reject) => {
  const w = new Worker(WORKER, { workerData: { bytes }, resourceLimits: { maxOldGenerationSizeMb: limitMb } });
  w.once("message", resolve);
  w.once("error", reject);
});

test("R9 memory: a csv read of about 30 MiB, the ceiling's neighbourhood, completes inside a 128 MB old-space limit", async () => {
  const f = bigCsv({ rows: 15000 });
  assert.ok(f.declared > BOUND && f.declared <= STREAMED_TEXT_BOUND_BYTES, `csv declares ${f.declared}`);
  const got = await inWorker(f.bytes, 128);
  assert.equal(got.ok, true);
  assert.equal(got.undetermined, 0);
  assert.equal(got.documentLength, f.expected.length);
});

test("R9 csv: over the ceiling the marker is textPlan's guard, final, with metric body_bytes", async () => {
  const body = new Uint8Array(STREAMED_TEXT_BOUND_BYTES + 1).fill(0x61);
  const t = await csvEntry.text(body);
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: body.length,
    bound: STREAMED_TEXT_BOUND_BYTES, boundName: "STREAMED_TEXT_BOUND_BYTES", metric: "body_bytes", final: true }]);
  assert.ok(!("piecewise" in t));
});

test("R9 csv: a CRLF or a doubled quote that falls on the edge of a window reads as it does whole", async () => {
  /* Records are laid out so that, at every 1 MiB window edge of the body, the edge falls between the CR and the LF
     of a record's end, or between the two quotes of a `""` in a quoted field. */
  const W = 1 << 20;
  const rows = [];
  const lines = [];
  let at = 0;
  const add = (fields) => {
    const line = fields.map(csvField).join(",") + "\r\n";
    rows.push(line);
    lines.push(fields.filter((x) => x !== "").join("\t"));
    at += line.length;
  };
  const rand = prng(31);
  add(["h1", "h2", "h3"]);
  add(["1", "2", "3"]);
  for (let edge = 1; edge <= 21; edge++) {
    // fill with ordinary records up to just short of the edge
    while (at + 400 < edge * W) add([randomText(rand, 100), randomText(rand, 100), randomText(rand, 100)]);
    const gap = edge * W - at;
    if (edge % 2) {
      // a record whose CR is the last byte before the edge: length gap-1 up to the CR
      const pad = gap - 1 - "x,y,".length;
      add(["x", "y", "z".repeat(pad)].slice(0, 2).concat([randomText(rand, pad - 1)]));
      // the line is now `x,y,<pad-1>` + CRLF, which ends one byte past the edge: shift by one if needed
    } else {
      // a quoted field whose opening quote and first half of a doubled pair end on the edge
      const lead = gap - 1;
      const fill = randomText(rand, Math.max(0, lead - 4));
      add([`${fill}"quoted"more`, "q", "r"]);
    }
  }
  const bytes = enc(rows.join(""));
  assert.ok(bytes.length > MEASURED_CSV_TEXT_BOUND_BYTES);
  const expectedWhole = walkRecords(new TextDecoder("latin1").decode(bytes), ",");
  const t = await csvEntry.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.dialect.delimiter, "comma");
  same(t.document, expectedWhole.map((r) => r.filter((x) => x !== "").join("\t")).filter((x) => x !== "").join("\n"), "document");
  assert.equal(t.sheets[0].usedRows, expectedWhole.length);
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

test("R9 csv: a UTF-16 body over the bound is not read in pieces, and is stated with its size, final", async () => {
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

test("R9 csv: cells a legacy encoding cannot read are listed up to a limit, then counted", async () => {
  /* Latin-1 text: its high bytes are no valid UTF-8, so the encoding is undetermined and every accented field is an
     undetermined cell, over twenty thousand of them in a body over the bound. */
  const rows = [];
  for (let i = 0; i < 60; i++) rows.push(`${i},plain,text`);
  const filler = "p".repeat(1000);
  const accented = Uint8Array.from([0x63, 0x61, 0x66, 0xe9]);
  const parts = [enc(rows.join("\n") + "\n")];
  const lineCount = Math.ceil((BOUND + 4096) / 1000);
  const chunk = [];
  for (let i = 0; i < lineCount; i++) {
    chunk.push(enc(`${i},${filler},`), accented, enc("\n"));
  }
  const bytes = new Uint8Array([...parts, ...chunk].reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of [...parts, ...chunk]) { bytes.set(p, o); o += p.length; }
  const t = await csvEntry.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.sheets[0].cells, null);
  assert.equal(t.undetermined.length, 10001);
  assert.equal(t.undetermined[0].reason, "encoding_undetermined");
  assert.deepEqual(t.undetermined[10000], { sheet: 0, cell: null, reason: "more_cells_undetermined", count: lineCount - 10000 });
});
