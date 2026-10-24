/* csv-reader R21 (fix round 9, G130b; S-10): `isDelimitedText(name, type, head)` is the one judgement of whether bytes are a
   CSV or TSV that format-registry calls: type, extension and head together, never throwing. Every case goes through the
   exported function with bodies built here; the corpus cases C23, C24, C32 and C33 are among them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isDelimitedText } from "../../../src/csv-reader/index.mjs";
import { enc } from "./fixtures.mjs";

const CSV = enc("id,name,amount\n1,Ann,10\n2,Bo,20\n3,Cy,30\n");
const TSV = enc("id\tname\tamount\n1\tAnn\t10\n2\tBo\t20\n3\tCy\t30\n");
const u16le = (s) => { const out = [0xff, 0xfe]; for (const c of s) { const n = c.charCodeAt(0); out.push(n & 255, n >> 8); } return new Uint8Array(out); };
const TYPES = ["text/csv", "application/csv", "text/comma-separated-values", "text/tab-separated-values", "text/plain", "application/vnd.ms-excel", "application/octet-stream"];

test("R21 true for every named type and extension when the head is delimited text (C23, C24, C32, C33)", () => {
  for (const type of TYPES) for (const name of ["a.csv", "a.tsv", "a.tab", "a.txt", "dir/Report.CSV", "REPORT.TXT"]) {
    assert.equal(isDelimitedText(name, type, CSV), true, `${name} ${type}`);
    assert.equal(isDelimitedText(name, type.toUpperCase(), TSV), true, `${name} ${type} (tab)`);
  }
  assert.equal(isDelimitedText("x.tsv", "text/tab-separated-values", TSV), true);
  assert.equal(isDelimitedText("x.tsv", "text/plain", TSV), true, "C24");
  assert.equal(isDelimitedText("x.csv", "application/vnd.ms-excel", CSV), true, "C32: the C01 bytes declared ms-excel");
  assert.equal(isDelimitedText("x.csv", "application/octet-stream", CSV), true, "C33");
  assert.equal(isDelimitedText("x.csv", "text/csv; charset=utf-8", CSV), true, "a parameter on the type is not a different type");
  assert.equal(isDelimitedText("x.csv", "text/csv", enc("a;b\n1;2\n3;4\n")), true);
  assert.equal(isDelimitedText("x.csv", "text/csv", enc("a|b\n1|2\n3|4\n")), true);
  assert.equal(isDelimitedText("x.csv", "text/csv", new Uint8Array([0xef, 0xbb, 0xbf, ...CSV])), true, "a BOM");
  assert.equal(isDelimitedText("x.csv", "text/csv", enc("name,café\n1,é\n2,ü\n")), true, "UTF-8");
  assert.equal(isDelimitedText("x.csv", "text/csv", Uint8Array.from("name,caf\xe9\n1,\xe9\n2,\xfc\n", (c) => c.charCodeAt(0))), true, "a legacy charset");
  assert.equal(isDelimitedText("x.csv", "text/csv", u16le("a,b\n1,2\n3,4\n")), true, "UTF-16");
  assert.equal(isDelimitedText("x.csv", "text/csv", CSV.buffer.slice(CSV.byteOffset, CSV.byteOffset + CSV.length)), true, "an ArrayBuffer");
});

test("R21 false when the type, the extension or the head fails: a plain note with no delimiter is read as text", () => {
  assert.equal(isDelimitedText("x.csv", "application/pdf", CSV), false);
  assert.equal(isDelimitedText("x.csv", "text/html", CSV), false);
  assert.equal(isDelimitedText("x.csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", CSV), false);
  for (const name of ["x.xlsx", "x.xls", "x.pdf", "x.json", "x", "x.csv.exe", "", ".csv.bak"]) assert.equal(isDelimitedText(name, "text/csv", CSV), false, name);
  assert.equal(isDelimitedText("x.txt", "text/plain", enc("Dear member,\nthank you for coming\nsee you soon\n")), false, "prose with one comma a line is not consistent");
  assert.equal(isDelimitedText("x.txt", "text/plain", enc("just a note\nof two lines\n")), false);
  assert.equal(isDelimitedText("x.csv", "text/csv", enc("a,b;c\n1,2;3\n")), false, "two delimiters equally consistent are no delimiter");
  assert.equal(isDelimitedText("x.csv", "text/csv", enc("a,b\n")), false, "under two complete lines");
});

test("R21 bytes never override a binary format: a ZIP, OLE, PDF or picture signature, or a NUL in an 8-bit head, is false whatever the name and type say", () => {
  const body = [...CSV];
  const sigs = {
    zip: [0x50, 0x4b, 0x03, 0x04], zipEmpty: [0x50, 0x4b, 0x05, 0x06], ole: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], pdf: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31],
    png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], jpeg: [0xff, 0xd8, 0xff, 0xe0], gif: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], gzip: [0x1f, 0x8b, 0x08],
    webp: [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
  };
  for (const [name, sig] of Object.entries(sigs)) {
    for (const type of ["text/csv", "application/vnd.ms-excel", "application/octet-stream"]) {
      assert.equal(isDelimitedText("x.csv", type, new Uint8Array([...sig, ...body])), false, `${name} ${type}`);
    }
  }
  assert.equal(isDelimitedText("x.csv", "text/csv", new Uint8Array([...enc("a,b\n1,2\n"), 0, ...enc("3,4\n5,6\n")])), false, "a NUL byte in an 8-bit head");
  assert.equal(isDelimitedText("x.csv", "text/csv", new Uint8Array([...enc("a,b\n1,2\n3,4\n"), 0x81])), false, "a byte no legacy charset defines");
  // the same signature further in is only text
  assert.equal(isDelimitedText("x.csv", "text/csv", enc("PK,b\n1,2\n3,4\n")), true);
});

test("R21 the head is the first bytes, up to 1 MiB, and a character cut at its end is not a failure", () => {
  const rows = "id,name\n".repeat(200000);
  assert.equal(isDelimitedText("x.csv", "text/csv", enc(rows)), true, "a head over 1 MiB is read as its first MiB");
  const cut = enc("a,b\n1,é\n2,ü\n3,日");
  assert.equal(isDelimitedText("x.csv", "text/csv", cut.subarray(0, cut.length - 1)), true, "the head ends inside a character");
  assert.equal(isDelimitedText("x.csv", "text/csv", cut.subarray(0, 14)), true);
});

test("R21 never throws and is false for an empty head or arguments of the wrong kind", () => {
  for (const [name, type, head] of [
    ["x.csv", "text/csv", new Uint8Array(0)], ["x.csv", "text/csv", null], ["x.csv", "text/csv", undefined], ["x.csv", "text/csv", "a,b\n1,2\n"], ["x.csv", "text/csv", 42],
    [null, "text/csv", CSV], [42, "text/csv", CSV], [{}, "text/csv", CSV], ["x.csv", null, CSV], ["x.csv", 42, CSV], ["x.csv", undefined, CSV], [undefined, undefined, undefined],
  ]) {
    assert.equal(isDelimitedText(name, type, head), false, JSON.stringify([name, type]));
  }
  const Real = globalThis.TextDecoder;
  globalThis.TextDecoder = class { constructor() { throw new Error("none"); } };
  try { assert.equal(typeof isDelimitedText("x.csv", "text/csv", CSV), "boolean"); } finally { globalThis.TextDecoder = Real; }
});
