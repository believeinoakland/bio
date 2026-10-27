/* pdf-reader: requirement-named tests for `pageSource(source, pageIndex)` (R49; fix round 9, G132k; K4859; pdf-pixels R47),
 * at the module's interface. The source is `{size, readRange(offset, length)}`, counted: what the module reads is what a
 * test sees. Files are written by `pdfgen` (a table, a cross-reference stream, object streams; text, scanned and mixed
 * pages; four fonts) and by hand (inherited page attributes, nested trees), and the real 15.2 MiB govinfo volume
 * (BUDGET-2024-APP, fetched once into BIO_FIXTURE_CACHE and checked against its SHA-256). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pageSource, extractPdfStructure } from "../../../src/pdfstructure.mjs";
import { generate } from "../../pdfgen.mjs";
import { indexed } from "./indexed.mjs";
import { bytesOf } from "./pdf.mjs";

const CACHE = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures");
const APP = { name: "BUDGET-2024-APP", pages: 1354, sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e" };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function fixture({ name, sha }) {
  const path = join(CACHE, `${name}.pdf`);
  if (existsSync(path) && sha256(readFileSync(path)) === sha) return path;
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch(`https://www.govinfo.gov/content/pkg/${name}/pdf/${name}.pdf`);
  assert.ok(res.ok, `${name}: answered ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(body), sha, `${name}: the file fetched is not the file measured`);
  writeFileSync(`${path}.part`, body);
  renameSync(`${path}.part`, path);
  return path;
}

/** A counted source over `file`. */
function sourceOf(file) {
  const s = { size: file.length, read: 0, calls: 0, readRange: async (offset, length) => {
    s.calls++;
    const b = file.slice(offset, offset + length);
    s.read += b.length;
    return b;
  } };
  return s;
}
const recipe = (structure, extra = {}) => ({ kind: "pdf", seed: "page-source", size: { pages: 40, lines: 30 },
  kinds: ["text", "scan", "mixed"], fonts: ["winansi", "macroman", "differences", "type0"], structure, compress: true, ...extra });
const placement = (i) => ({ mime: i.mime, name: i.name, width: i.width, height: i.height, filters: i.filters, rect: i.rect, inline: i.inline, axis_aligned: i.axis_aligned });

/** What a reader finds of page `i` of the whole file and of the page's own file: equal, but for the page number. */
async function same(whole, one, i, label) {
  assert.equal(one.pages, 1, `${label}: one page`);
  assert.equal(one.text.pages[0].text, whole.text.pages[i].text, `${label}: the page's text`);
  assert.deepEqual(one.text.pages[0].undetermined.map((u) => ({ ...u, page: 0 })), whole.text.pages[i].undetermined.map((u) => ({ ...u, page: 0 })), `${label}: the markers`);
  assert.deepEqual((one.images ?? []).map(placement), (whole.images ?? []).filter((m) => m.page === i).map(placement), `${label}: the images placed`);
  assert.deepEqual(one.pageBoxes.boxes[one.pageBoxes.of_page[0]], whole.pageBoxes.boxes[whole.pageBoxes.of_page[i]], `${label}: the page box`);
}

test("R49: the page's own PDF reads as the same page of the whole file: first, middle and last page, every structure", async () => {
  for (const structure of ["classic", "xref-stream", "object-streams"]) {
    const file = await generate(recipe(structure)).bytes();
    const whole = await extractPdfStructure(file);
    assert.equal(whole.pages, 40);
    for (const i of [0, 1, 19, 38, 39]) {
      const got = await pageSource(sourceOf(file), i);
      assert.equal(got.ok, true, `${structure} page ${i}: ${JSON.stringify(got)}`);
      assert.equal(got.pages, 40, "the document's page count");
      assert.ok(got.bytes instanceof Uint8Array);
      await same(whole, await extractPdfStructure(got.bytes), i, `${structure} page ${i}`);
    }
  }
});

test("R49: every font family of the generator reads the same (a simple font with an encoding, differences, a Type0 font with its ToUnicode map)", async () => {
  const file = await generate(recipe("object-streams", { kinds: ["text"], size: { pages: 8, lines: 12 } })).bytes();
  const whole = await extractPdfStructure(file);
  for (let i = 0; i < 8; i++) {
    const got = await pageSource(sourceOf(file), i);
    assert.equal(got.ok, true);
    const one = await extractPdfStructure(got.bytes);
    assert.ok(one.text.pages[0].text.length > 20 || one.text.pages[0].undetermined.length > 0, `page ${i} reads as something, text or stated markers`);
    await same(whole, one, i, `page ${i}`);
  }
});

test("R49: the bytes read are the page's, not the file's: a scanned file of 120 pages, page 60 and the last", async () => {
  const file = await generate(recipe("xref-stream", { size: { pages: 120, lines: 6 }, kinds: ["scan"], scan: { dpi: 150, bits: 8 } })).bytes();
  assert.ok(file.length > 200_000, `the file is ${file.length} bytes`);
  for (const i of [3, 60, 119]) {
    const src = sourceOf(file);
    const got = await pageSource(src, i);
    assert.equal(got.ok, true);
    /* the cross-reference data, the path to the page, the page: a bound proportional to the page and a fixed part for the chain */
    assert.ok(src.read <= got.bytes.length * 2 + 24 * 1024, `page ${i}: read ${src.read} bytes for a page of ${got.bytes.length}`);
    assert.ok(src.read < file.length / 8, `page ${i}: read ${src.read} of ${file.length}`);
  }
});

test("R49: the real 15.2 MiB, 1,354-page govinfo volume: pages 0, 700 and the last read like the whole file's, from a small part of the bytes", async () => {
  const file = new Uint8Array(readFileSync(await fixture(APP)));
  const whole = await extractPdfStructure(file);
  assert.equal(whole.pages, APP.pages);
  for (const i of [0, 700, APP.pages - 1]) {
    const src = sourceOf(file);
    const got = await pageSource(src, i);
    assert.equal(got.ok, true, JSON.stringify({ ...got, bytes: undefined }));
    assert.equal(got.pages, APP.pages);
    assert.ok(src.read < 1_000_000, `page ${i}: read ${src.read} of ${file.length}`);
    assert.ok(src.read < file.length / 10);
    await same(whole, await extractPdfStructure(got.bytes), i, `page ${i}`);
  }
});

/* a document whose page attributes are inherited from the tree, three levels deep, with leaves that state no /Type */
const TREE = {
  1: "<< /Type /Catalog /Pages 2 0 R >>",
  2: "<< /Type /Pages /Kids [3 0 R 4 0 R 8 0 R] /Count 5 /MediaBox [0 0 300 400] /Rotate 90 /Resources << /Font << /F1 20 0 R >> >> >>",
  3: "<< /Type /Page /Parent 2 0 R /Contents 30 0 R >>",
  4: "<< /Type /Pages /Parent 2 0 R /Kids [5 0 R 6 0 R] /Count 2 /MediaBox [0 0 500 600] >>",
  5: "<< /Parent 4 0 R /Contents 31 0 R >>",
  6: "<< /Type /Page /Parent 4 0 R /Rotate 270 /Contents 32 0 R /Annots [40 0 R] >>",
  8: "<< /Type /Pages /Parent 2 0 R /Kids [9 0 R 10 0 R] /Count 2 /Resources << /Font << /F1 21 0 R >> >> >>",
  9: "<< /Type /Page /Parent 8 0 R /Contents 33 0 R /MediaBox [10 20 210 320] >>",
  10: "<< /Parent 8 0 R /Contents 34 0 R /MediaBox [0 0 100 100] /Resources << /Font << /F1 20 0 R >> >> >>",
  20: "<< /Type /Font /Subtype /TrueType /BaseFont /Plain /ToUnicode 22 0 R >>",
  21: "<< /Type /Font /Subtype /TrueType /BaseFont /Serif /ToUnicode 22 0 R >>",
  22: { dict: "", data: "/CIDInit /ProcSet findresource begin 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <20> <7E> <0020> endbfrange end" },
  30: { dict: "", data: "BT /F1 12 Tf 10 100 Td (first page text) Tj ET" },
  31: { dict: "", data: "BT /F1 12 Tf 10 100 Td (second page text) Tj ET" },
  32: { dict: "", data: "BT /F1 12 Tf 10 100 Td (third page text) Tj ET" },
  33: { dict: "", data: "BT /F1 12 Tf 10 100 Td (fourth page text) Tj ET" },
  34: { dict: "", data: "BT /F1 12 Tf 10 100 Td (fifth page text) Tj ET" },
  40: "<< /Type /Annot /Subtype /Link /Rect [0 0 10 10] /Dest [10 0 R /Fit] >>",
};
const treeFile = (kind = {}) => indexed(TREE, kind);

test("R49: MediaBox, Rotate and Resources are inherited into the page's own dictionary, nearest first, through a nested tree and /Count skips", async () => {
  const expect = [
    { text: "first page text", box: [0, 0, 300, 400], rotate: 90 },
    { text: "second page text", box: [0, 0, 500, 600], rotate: 90 },
    { text: "third page text", box: [0, 0, 500, 600], rotate: 270 },
    { text: "fourth page text", box: [10, 20, 210, 320], rotate: 90 },
    { text: "fifth page text", box: [0, 0, 100, 100], rotate: 90 },
  ];
  for (const kind of [{}, { xref: "stream" }, { xref: "stream", packed: [1, 2, 3, 4, 5, 6, 8, 9, 10, 20, 21, 40] }]) {
    const file = treeFile(kind);
    const whole = await extractPdfStructure(file);
    assert.equal(whole.pages, 5);
    for (let i = 0; i < 5; i++) {
      const got = await pageSource(sourceOf(file), i);
      assert.equal(got.ok, true, `page ${i}: ${JSON.stringify(got)}`);
      assert.equal(got.pages, 5);
      const one = await extractPdfStructure(got.bytes);
      assert.equal(one.text.pages[0].text, expect[i].text);
      assert.deepEqual(one.pageBoxes.boxes[0].media_box, expect[i].box, `page ${i} box`);
      assert.equal(one.pageBoxes.boxes[0].rotate, expect[i].rotate, `page ${i} rotate`);
      await same(whole, one, i, `page ${i}`);
    }
  }
  /* the page's file holds that page alone: not the tree, not its neighbours' text, not the annotation's destination */
  const one = Buffer.from((await pageSource(sourceOf(treeFile()), 2)).bytes).toString("latin1");
  assert.ok(!/second page|fourth page|\/Kids\s*\[[^\]]*[4-9] 0 R/.test(one));
  assert.equal((one.match(/\/Type\s*\/Page(?![a-z])/g) ?? []).length, 1);
  assert.ok(!/\/Annots/.test(one));
});

test("R49: an index outside the document, a source that is not one and a file that is not a PDF answer fallback with a reason and never throw", async () => {
  const file = treeFile();
  const fb = (got, label) => { assert.equal(got.ok, false, label); assert.equal(got.fallback, true, label); assert.ok(typeof got.why === "string" && got.why.length > 0, label); assert.equal(got.bytes, undefined, label); };
  for (const i of [-1, 5, 6, 1e9, 1.5, NaN, Infinity, "0", null, undefined, {}]) fb(await pageSource(sourceOf(file), i), `index ${String(i)}`);
  for (const s of [null, undefined, 0, "x", {}, { size: 10 }, { readRange() {} }, { size: 0, readRange: async () => new Uint8Array(0) }, { size: -4, readRange: async () => new Uint8Array(0) }]) fb(await pageSource(s, 0), `source ${JSON.stringify(s)}`);
  fb(await pageSource(sourceOf(bytesOf("hello, not a pdf at all, but long enough to be read in one range ".repeat(80))), 0), "not a PDF");
});

test("R49: a source whose reads fail or answer something else is a fallback, never a throw", async () => {
  const file = treeFile();
  const bad = [
    { size: file.length, readRange: async () => { throw new Error("store down"); } },
    { size: file.length, readRange: () => { throw new Error("sync"); } },
    { size: file.length, readRange: async () => ({ ok: false, reason: "NOT_HELD" }) }, // fixtures-own: input a source's refusal, a literal handed to pageSource
    { size: file.length, readRange: async () => undefined },
    { size: file.length, readRange: async () => "text" },
    { size: file.length, readRange: async () => new Uint8Array(0) },
    { size: file.length, readRange: async (o, l) => file.slice(o, o + l).fill(0x20) },
  ];
  for (const s of bad) {
    const got = await pageSource(s, 0);
    assert.equal(got.ok, false);
    assert.equal(got.fallback, true);
  }
});

test("R49: no usable cross-reference, a trailer with /Encrypt, a damaged object, a lying length, a lying count and a tree in a loop each answer fallback", async () => {
  const fb = async (file, why) => {
    const got = await pageSource(sourceOf(file), 0);
    assert.equal(got.ok, false, why);
    assert.equal(got.fallback, true, why);
    assert.ok(typeof got.why === "string" && got.why.length, why);
    return got;
  };
  const text = (f) => Buffer.from(f).toString("latin1");
  const replace = (f, a, b) => { const t = text(f); assert.ok(t.includes(a), `${a} is in the file`); return bytesOf(t.replace(a, b)); };
  const file = treeFile();
  /* no startxref, a startxref that points nowhere, one that points into an object, a cut file */
  await fb(replace(file, "startxref", "startxrff"), "no startxref");
  await fb(replace(file, /startxref\n\d+/.exec(text(file))[0], "startxref\n99999999"), "startxref past the end");
  await fb(replace(file, /startxref\n\d+/.exec(text(file))[0], "startxref\n20"), "startxref into an object");
  await fb(file.slice(0, Math.floor(file.length * 0.6)), "a file cut at 60 percent");
  await fb(bytesOf("%PDF-1.7\n" + text(file).slice(9).replace(/xref\n/g, "xrof\n")), "no table");
  /* /Encrypt in the trailer, direct and by reference, in a table and in a cross-reference stream */
  await fb(indexed(TREE, { trailer: "/Root 1 0 R /Encrypt << /Filter /Standard /R 3 /V 2 /O (x) /U (y) /P -4 >>" }), "direct /Encrypt, table");
  await fb(indexed({ ...TREE, 50: "<< /Filter /Standard /R 3 /V 2 /O (x) /U (y) /P -4 >>" }, { trailer: "/Root 1 0 R /Encrypt 50 0 R", xref: "stream" }), "indirect /Encrypt, stream");
  /* the page's object does not open where the table says it does (its header names another number) */
  await fb(replace(file, "3 0 obj", "7 0 obj"), "an object whose header is not its number");
  /* a content stream whose /Length is not where endstream follows */
  const len = TREE[30].data.length;
  await fb(replace(file, `/Length ${len}`, `/Length ${len - 9}`), "a lying /Length");
  /* a count that does not reach the page; a tree that points back at its parent */
  await fb(indexed({ ...TREE, 2: TREE[2].replace("/Kids [3 0 R 4 0 R 8 0 R] /Count 5", "/Kids [3 0 R 4 0 R 8 0 R] /Count 0") }), "/Count 0");
  await fb(indexed({ ...TREE, 3: "<< /Type /Pages /Parent 2 0 R /Kids [2 0 R] /Count 1 >>" }), "a tree in a loop");
  await fb(indexed({ ...TREE, 2: TREE[2].replace("/MediaBox [0 0 300 400] ", ""), 3: "<< /Type /Page /Parent 2 0 R /Contents 30 0 R >>" }), "no MediaBox anywhere");
});

test("R49: the module reads through readRange alone and takes the same answer from a source that returns slices of one buffer or copies", async () => {
  const file = await generate(recipe("object-streams", { size: { pages: 12, lines: 10 } })).bytes();
  const a = await pageSource(sourceOf(file), 7);
  const b = await pageSource({ size: file.length, readRange: async (o, l) => new Uint8Array(file.subarray(o, o + l)) }, 7);
  const c = await pageSource({ size: file.length, readRange: async (o, l) => file.subarray(o, o + l) }, 7);
  assert.equal(a.ok, true);
  assert.deepEqual(Buffer.from(b.bytes), Buffer.from(a.bytes));
  assert.deepEqual(Buffer.from(c.bytes), Buffer.from(a.bytes));
  /* the same page twice is the same bytes */
  assert.deepEqual(Buffer.from((await pageSource(sourceOf(file), 7)).bytes), Buffer.from(a.bytes));
});
