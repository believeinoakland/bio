/* doc-clean R10: a PDF copy writes every string from pdf-reader R38's `raw`, never rebuilt from its text `v`. Each
 * document is written by `fixtures.mjs`; the original and the copy are both read by pdf-reader (`openPdf`,
 * `objects`), never by this module, and every string the copy keeps is compared with the original's byte for byte. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanDocument } from "../../../src/doc-clean/index.mjs";
import { openPdf } from "../../../src/pdfstructure.mjs";
import { makePdf } from "./fixtures.mjs";

const hex = (bytes) => Buffer.from(bytes).toString("hex");
const BINARY = Array.from({ length: 256 }, (_, i) => i);
const C1 = Array.from({ length: 32 }, (_, i) => 0x80 + i);
const octal = (b) => "\\" + b.toString(8).padStart(3, "0");

/** Each string under test: the key it is written at, its source, and the bytes a conforming reader reads from it. */
const STRINGS = [
  ["Binary", `<${hex(BINARY)}>`, BINARY],
  ["BinaryLiteral", `(${BINARY.map(octal).join("")})`, BINARY],
  ["OddFEFF", "<FEFF004142>", [0xfe, 0xff, 0x00, 0x41, 0x42]],
  ["OddFEFFDigit", "<FEFF00414>", [0xfe, 0xff, 0x00, 0x41, 0x40]],
  ["OddFEFFLiteral", "(\\376\\377\\000A\\000)", [0xfe, 0xff, 0x00, 0x41, 0x00]],
  ["C1", `(${C1.map(octal).join("")})`, C1],
  ["C1Hex", `<${hex(C1)}>`, C1],
  ["Ascii", "(Budget item one)", [...Buffer.from("Budget item one", "latin1")]],
];

/** A one-page PDF carrying every string of `STRINGS` in its page dictionary, again in an array and in a nested
 *  dictionary, and again in an indirect dictionary the page refers to, with `/Info` so the copy is written. */
function stringsPdf() {
  const direct = STRINGS.map(([k, src]) => `/${k} ${src}`).join(" ");
  return makePdf([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R ${direct} /List [${STRINGS.map(([, src]) => src).join(" ")}] /Nested << ${direct} >> /Held 5 0 R >>`,
    { dict: "<< >>", data: new TextEncoder().encode("q Q") },
    `<< ${direct} >>`,
    "<< /Author (Someone) >>",
  ], { trailer: "/Info 6 0 R" });
}

/** Every string pdf-reader reads in `bytes`, by where it sits: `page.<key>`, `page.List.<i>`, `page.Nested.<key>`,
 *  `page.Held.<key>`, each its `raw` in hex. */
async function stringsOf(bytes) {
  const doc = await openPdf(bytes);
  assert.ok(doc, "pdf-reader opens it");
  const read = doc.objects();
  assert.deepEqual(read.unresolved, []);
  const table = new Map(read.objects.map((o) => [o.num, o.value]));
  const page = read.objects.find((o) => o.value.t === "dict" && o.value.map.Type?.v === "Page").value.map;
  const out = {};
  const take = (where, v) => { assert.equal(v?.t, "str", where); assert.ok(v.raw instanceof Uint8Array, where); out[where] = hex(v.raw); };
  for (const [k] of STRINGS) {
    take(`page.${k}`, page[k]);
    take(`page.Nested.${k}`, page.Nested.map[k]);
    take(`page.Held.${k}`, table.get(page.Held.n).map[k]);
  }
  page.List.items.forEach((v, i) => take(`page.List.${i}`, v));
  return out;
}

test("R10 a PDF copy writes every string from its raw bytes: a binary string (0x00-0xFF), an odd-length FE FF string and a string holding 0x80-0x9F, as hex and as literal, each read back byte for byte, in a dictionary, an array, a nested and an indirect dictionary", async () => {
  const original = stringsPdf();
  const before = await stringsOf(original);
  for (const [k, , bytes] of STRINGS) assert.equal(before[`page.${k}`], hex(bytes), `the fixture's ${k} reads as intended`);
  const r = await cleanDocument(original);
  assert.equal(r.ok, true, r.detail);
  assert.equal(r.clean, false, "the trailer's /Info makes a copy");
  const after = await stringsOf(r.bytes);
  assert.deepEqual(after, before, "every string the copy keeps is the original's, byte for byte");
  for (const [k, , bytes] of STRINGS) {
    assert.equal(after[`page.${k}`], hex(bytes), k);
    assert.equal(after[`page.List.${STRINGS.findIndex(([x]) => x === k)}`], hex(bytes), `${k} in an array`);
  }
});

test("R10 negative control: an ASCII string is unchanged, its text and its bytes, and an odd-length FE FF string keeps its last byte where its text cannot", async () => {
  const r = await cleanDocument(stringsPdf());
  const doc = await openPdf(r.bytes);
  const page = doc.objects().objects.find((o) => o.value.t === "dict" && o.value.map.Type?.v === "Page").value.map;
  assert.equal(page.Ascii.v, "Budget item one");
  assert.deepEqual([...page.Ascii.raw], [...Buffer.from("Budget item one", "latin1")]);
  assert.deepEqual([...page.OddFEFF.raw], [0xfe, 0xff, 0x00, 0x41, 0x42], "the fifth byte, which no UTF-16 text holds, is kept");
});

test("R10 a copy written twice is the same: the strings of a copy, cleaned again, read back unchanged", async () => {
  const once = await cleanDocument(stringsPdf());
  const twice = await cleanDocument(makePdfWithInfo(once.bytes));
  assert.equal(twice.ok, true, twice.detail);
  assert.deepEqual(await stringsOf(twice.bytes), await stringsOf(once.bytes));
});

/** `copy` with an incremental update adding a trailer `/Info`, so cleaning it writes a copy again. */
function makePdfWithInfo(copy) {
  const s = Buffer.from(copy).toString("latin1");
  const size = Number(/\/Size (\d+)/.exec(s.slice(s.lastIndexOf("trailer")))[1]);
  const prev = Number(/startxref\s+(\d+)/.exec(s.slice(s.lastIndexOf("startxref")))[1]);
  const obj = Buffer.from(`${size} 0 obj\n<< /Author (Someone) >>\nendobj\n`, "latin1");
  const at = copy.length;
  const tail = `xref\n${size} 1\n${String(at).padStart(10, "0")} 00000 n \ntrailer\n<< /Size ${size + 1} /Root 1 0 R /Info ${size} 0 R /Prev ${prev} >>\nstartxref\n${at + obj.length}\n%%EOF\n`;
  return new Uint8Array(Buffer.concat([Buffer.from(copy), obj, Buffer.from(tail, "latin1")]));
}
