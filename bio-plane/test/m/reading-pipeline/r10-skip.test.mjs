/* reading-pipeline K4904 (fix round 9, job 40; plan 2c items 8 and 9; R45, R46, R54): a window that killed its reader three times is stepped past, stated; a reading lists the
   folio pages, the pages whose only text is a folio's glyphs over a picture. R-STOP: the last line after a skipped window is searchable. Each test names the ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry, i2, folio } from "./fixture.mjs";

const line = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".");
const readOf = (b, document, o = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...o });

test("R45 R46 R54 (K4904, item 8): a text window that killed its reader is stepped past: nothing read at the cursor, one unit skipped, stated UNIT_KILLED_READER, the next cursor goes on and the last line is read", async () => {
  const text = Array.from({ length: 30000 }, (_, i) => line(i)).join("\n") + "\nENDMARKER";
  const b = bucket();
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: Buffer.byteLength(text), ct: "text/plain", format: "undetermined", fromText: true });
  const first = await readOf(b, document, { cursor: null, unitsBudget: 200000, maxUnits: 4096, windowBytes: 65536 });
  assert.equal(first.more, true);
  const killed = first.cursor;
  b.served = 0;
  const step = await readOf(b, document, { cursor: killed, skipKilled: true, windowBytes: 65536 });
  assert.deepEqual(step.text_units, []);
  assert.deepEqual(step.counters, { written: 0, skipped: 1, owed: 0, failed: 0 });
  assert.deepEqual(step.stated, { cursor: killed, why: "UNIT_KILLED_READER" });
  assert.equal(step.more, true);
  assert.equal(step.next, step.cursor);
  assert.notEqual(step.next, killed);
  assert.ok(b.served <= 8, `${b.served} bytes read to step past it`);
  assert.ok(step.reading.killed_windows.length === 1 && typeof step.reading.killed_window_note === "string");
  let cursor = step.next, last = null;
  for (let i = 0; i < 2000; i++) {
    const out = await readOf(b, document, { cursor, unitsBudget: 200000, maxUnits: 4096, windowBytes: 65536 });
    if (out.text_units && out.text_units.length) last = out.text_units.at(-1);
    if (!out.more) break;
    cursor = out.cursor;
  }
  assert.match(last.text, /ENDMARKER/, "the last line after the stepped window is read");
});

test("R45 (K4904, item 8): a list cursor (a slide, a sheet block) is stepped to the next unit; the last unit ends the read; control: without skipKilled the unit is read", async () => {
  const paras = Array.from({ length: 5 }, (_, i) => ({ para: i, text: `paragraph ${i} words` }));
  const b = bucket();
  const d = await hold(b, "stand-in");
  await withEntry({ format: "t10list", detect: () => null, text: async () => ({ ok: true, document: paras.map((p) => p.text).join("\n"), paragraphs: paras, counts: { chars: 10, undetermined: 0 }, undetermined: [] }) }, async () => {
    const document = doc({ digest: d, bytes: 8, ct: "application/x-t", format: "t10list" });
    const first = await readOf(b, document, { cursor: null, unitsBudget: 200, maxUnits: 1 });
    assert.equal(first.more, true);
    let cursor = first.cursor, seen = [first.text_units[0].text];
    const s1 = await readOf(b, document, { cursor, skipKilled: true });
    assert.equal(s1.counters.skipped, 1);
    cursor = s1.next;
    for (let i = 0; i < 10 && cursor; i++) { const o = await readOf(b, document, { cursor, unitsBudget: 200, maxUnits: 1 }); seen.push(...o.text_units.map((u) => u.text)); cursor = o.more ? o.cursor : null; }
    assert.deepEqual(seen, ["paragraph 0 words", "paragraph 2 words", "paragraph 3 words", "paragraph 4 words"], "unit 1 was stepped past");
    const control = await readOf(b, document, { cursor: first.cursor, unitsBudget: 200, maxUnits: 1 });
    assert.equal(control.text_units[0].text, "paragraph 1 words");
  });
});

test("R45 (K4904, item 9): a reading lists folio_pages, the pages whose only text is a folio over a picture; absent when there are none", async () => {
  const b = bucket();
  const d = await hold(b, "%PDF-stand-in");
  const pdf = (pages) => ({ format: "pdf", detect: () => null, structure: async () => ({ ok: true, pages: pages.length, text: i2(pages) }) });
  await withEntry(pdf([{ page: 0, text: "Real text of page zero" }, { page: 1, text: "12", undetermined: [folio(1)] }, { page: 2, text: "14", undetermined: [folio(2)] }]), async () => {
    const out = await readOf(b, doc({ digest: d, bytes: 13, ct: "application/pdf", format: "pdf" }));
    assert.deepEqual(out.reading.folio_pages, [1, 2]);
  });
  await withEntry(pdf([{ page: 0, text: "Real text of page zero" }]), async () => {
    const out = await readOf(b, doc({ digest: d, bytes: 13, ct: "application/pdf", format: "pdf" }));
    assert.equal(out.reading.folio_pages, undefined);
  });
});

test("R45 R50 (K4907, item 8): a CSV window that killed its reader is stepped to the next row boundary after its bytes, the skipped byte range stated, and the last row after it is read and searchable", async () => {
  const rowText = (i) => `${i},name ${i},${"council minutes ".repeat(5).trim()},"quoted, with a comma ${i}"`;
  const n = 330000;
  const text = ["id,name,note,quoted", ...Array.from({ length: n }, (_, i) => rowText(i)), "999999999,LASTROW,end,\"x\""].join("\n");
  const size = Buffer.byteLength(text);
  assert.ok(size > 24 * 1024 * 1024 && size < 50 * 1024 * 1024, `${size}`);
  const b = bucket();
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: size, ct: "text/csv", format: "csv", fromText: true });
  const first = await readOf(b, document, { cursor: null, unitsBudget: 512 * 1024, maxUnits: 4096 });
  assert.equal(first.more, true);
  const step = await readOf(b, document, { cursor: first.cursor, skipKilled: true });
  assert.equal(step.counters.skipped, 1);
  assert.equal(step.stated.why, "UNIT_KILLED_READER");
  const [from, to] = step.stated.bytes;
  assert.ok(to > from && step.more === true);
  assert.equal(text.slice(Buffer.from(text).subarray(0, to).length - 1, 0) ?? "", "");
  assert.equal(Buffer.from(text).subarray(to - 1, to).toString(), "\n", "the next row begins at a row boundary");
  let cursor = step.next, last = null, n2 = 0;
  for (; n2 < 3000; n2++) {
    const out = await readOf(b, document, { cursor, unitsBudget: 512 * 1024, maxUnits: 4096 });
    if (out.text_units && out.text_units.length) last = out.text_units.at(-1);
    if (!out.more) break;
    cursor = out.cursor;
  }
  assert.match(last.text, /LASTROW/, "the last row is read");
});

test("R29 R6 (K4909): the transcription sentence counts only the pages that gained text: a 3-page scan whose OCR answers page 2 with no glyph says 2 transcribed and 1 not read by text recognition; `filled` is unchanged", async () => {
  const { member: mk, ocrAnswer, noText } = await import("./fixture.mjs");
  const b = bucket();
  const d = await hold(b, "%PDF-stand-in");
  const pages = [0, 1, 2].map((page) => ({ page, text: "", undetermined: [noText(page)] }));
  const ocr = mk(() => ocrAnswer([0, 1, 2], { text: (p) => (p === 1 ? "" : `ocr words of page ${p}`) }));
  await withEntry({ format: "pdf", detect: () => null, structure: async () => ({ ok: true, pages: 3, text: i2(pages) }) }, async () => {
    const out = await readOf(b, doc({ digest: d, bytes: 13, ct: "application/pdf", format: "pdf" }), { env: { OCR_WORKER: ocr } });
    const basis = out.reading.basis;
    assert.match(basis, /\b2 scanned page\(s\) were transcribed/);
    assert.doesNotMatch(basis, /\b3 scanned page\(s\) were transcribed/);
    assert.match(basis, /1 page\(s\) \(2\) could not be read by text recognition|1 page\(s\) \(page 2\) could not be read by text recognition/);
  });
});

test("R40 R57 (K4911, B47): a later PDF range answers its own pages' chain: typed pages under `layer`, scanned pages under `pixels -> ocr`; the first range's chain is not borrowed", async () => {
  const { deflateSync } = await import("node:zlib");
  const { chunked } = await import("./scans.mjs");
  const objs = [{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" }];
  const kinds = ["t", "t", "t", "t", "s", "s"];
  objs.push({ num: 2, body: `<< /Type /Pages /Kids [${kinds.map((_, i) => `${5 + i * 3} 0 R`).join(" ")}] /Count ${kinds.length} >>` });
  const cmap = Buffer.from("/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <00> <FF> <0000> endbfrange endcmap CMapName currentdict /CMap defineresource pop end end", "latin1");
  objs.push({ num: 3, head: `<< /Length ${cmap.length} >>`, stream: cmap });
  objs.push({ num: 4, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 3 0 R >>" });
  const img = deflateSync(Buffer.alloc(256, 0x80));
  kinds.forEach((k, i) => {
    const p = 5 + i * 3;
    const content = Buffer.from(k === "t" ? `BT /F1 12 Tf 72 700 Td (Typed page ${i} has real words in its text layer.) Tj ET` : "q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
    objs.push({ num: p, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>` });
    objs.push({ num: p + 1, head: `<< /Length ${content.length} >>`, stream: content });
    objs.push({ num: p + 2, head: `<< /Type /XObject /Subtype /Image /Width 16 /Height 16 /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.length} >>`, stream: img });
  });
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1")); else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  const bytes = new Uint8Array(Buffer.concat(chunks));
  const b = bucket();
  const d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  const env = { OCR_WORKER: chunked() };
  const steps = (c) => (Array.isArray(c) ? c.map((x) => x.step) : []);
  const first = await readOf(b, document, { env, cursor: null, rangePages: 2, unitsBudget: Infinity });
  assert.ok(first.more, "read in ranges");
  const second = await readOf(b, document, { env, cursor: first.cursor, rangePages: 2, unitsBudget: Infinity });
  assert.deepEqual(steps(second.reading.piece_chain), ["layer"], "typed pages 2-3");
  const third = await readOf(b, document, { env, cursor: second.cursor, rangePages: 2, unitsBudget: Infinity });
  assert.ok(steps(third.reading.piece_chain).includes("ocr"), `scanned pages 4-5: ${JSON.stringify(steps(third.reading.piece_chain))}`);
  assert.ok(!steps(third.reading.piece_chain).every((s) => s === "layer"), "not the first piece's layer chain");
});
