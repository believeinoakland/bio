/* capture, fix round 6 (G41 follow-up, second cause; PLANE #52 J35; K4670): a multipart upload (a file over one 8 MiB part) is profiled from
   its declared type or its name as a one-part upload is (R92, R93, R107), through `uploadCapture` with real parts and no stub. A CSV
   has no magic, so before the fix its format was `undetermined` although the upload declared `text/csv`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { textTypeOf } from "../../../src/acquisition/index.mjs";

const te = new TextEncoder();
const MiB = 1024 * 1024;
const STATEMENT = "a spreadsheet export the clerk handed me at the counter on 3 October";
const AT = "2026-10-09T12:00:00Z";

/* A CSV of exactly `size` bytes: numbered rows, the last cut to fit. */
function csvOf(size) {
  const out = new Uint8Array(size);
  let at = 0, n = 0;
  while (at < size) {
    const row = te.encode(`${n++},row number ${n},some text,3.14\n`);
    const take = Math.min(row.length, size - at);
    out.set(row.subarray(0, take), at); at += take;
  }
  out[size - 1] = 10;
  return out;
}
/* A PDF-looking file: the magic and then plain ASCII, so the head is also text. */
function pdfOf(size) {
  const out = new Uint8Array(size).fill(0x61);
  out.set(te.encode("%PDF-1.7\n"), 0);
  return out;
}
const upload = async (bytes, extra = {}) => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const r = await f.c.uploadCapture({ bytes, statement: STATEMENT, by: "m1", at: AT, ...extra });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return r.document;
};
const formatOf = (d) => d.profile.format.format;

test("R107 G41: a CSV over one part, declared text/csv, is stored csv, as a one-part CSV is; the declaration is recorded as the uploader's", async () => {
  const d = await upload(csvOf(9 * MiB), { type: "text/csv" });
  assert.equal(d.parts.length, 2, "two real parts");
  assert.equal(formatOf(d), "csv");
  assert.equal(d.profile.source_content_type, "text/csv");
  assert.equal(d.profile.declared_by, "uploader");
  const one = await upload(csvOf(4 * MiB), { type: "text/csv" });
  assert.equal(formatOf(one), "csv", "control: the one-part CSV, as before");
  assert.equal(one.parts, undefined);
});

test("R107 R93: a text file over two full parts named x.csv with no type is stored csv; the name gives the type, no declaration is recorded", async () => {
  const d = await upload(csvOf(17 * MiB), { name: "x.csv" });
  assert.equal(d.parts.length, 3);
  assert.equal(formatOf(d), "csv");
  assert.equal(d.profile.source_content_type, null, "a name is not a declaration");
  assert.equal(d.profile.declared_by, undefined);
  const one = await upload(csvOf(1 * MiB), { name: "x.csv" });
  assert.deepEqual([formatOf(one), one.profile.source_content_type], ["csv", null], "control: one part, as before");
});

test("R107: a code point cut at the head's end does not make the head not text (multi-byte text)", async () => {
  /* a text whose multi-byte characters fall on every byte offset, so the sniffed head ends inside one whatever its length */
  const unit = te.encode("é,日本,😀\n");
  const bytes = new Uint8Array(9 * MiB);
  for (let i = 0; i < bytes.length; i++) bytes[i] = unit[i % unit.length];
  bytes[bytes.length - 1] = 10;
  for (const cut of [0, 1, 2, 3]) {
    const b = new Uint8Array(bytes.length + cut).fill(0x61);
    b.set(bytes, cut); b[b.length - 1] = 10;
    const d = await upload(b, { type: "text/csv" });
    assert.equal(formatOf(d), "csv", `padding ${cut}`);
  }
});

test("R107 controls: a declaration never contradicts the bytes", async () => {
  /* bytes that are not text (a NUL in the head), declared text/csv: judged by its bytes */
  const bin = csvOf(9 * MiB); bin[10] = 0;
  const b = await upload(bin, { type: "text/csv" });
  assert.equal(formatOf(b), "undetermined", "non-text bytes declared text/csv stay undetermined");
  assert.equal(b.profile.source_content_type, "text/csv", "the declaration is still recorded as the uploader's");
  /* bytes `acquisition` does not decode as text, declared text/html, are not html: a run of NULs in a file that is no UTF-16 */
  const h = csvOf(9 * MiB); h[3] = 0; h[4] = 0; h[5] = 0; h[7] = 0;
  assert.equal(textTypeOf({ bytes: h.subarray(0, 65536), type: "text/html" }), null, "the one rule says it is not text");
  assert.notEqual(formatOf(await upload(h, { type: "text/html" })), "html");
  /* G131g: the same one decode for the head as for a whole file: a legacy-charset byte pair mid-file is text, so what `textTypeOf` says of
     the head is what the upload does (no UTF-8-only rule of this module's own) */
  const legacy = csvOf(9 * MiB); legacy[3] = 0xff; legacy[4] = 0xfe;
  const headIsText = textTypeOf({ bytes: legacy.subarray(0, 65536), type: "text/html" }) !== null;
  assert.equal(formatOf(await upload(legacy, { type: "text/html" })) === "html", headIsText);
  /* a PDF declared text/csv is a pdf: the sniff names it and stands */
  assert.equal(formatOf(await upload(pdfOf(9 * MiB), { type: "text/csv" })), "pdf");
  /* a multipart PDF with no type is as R101 has it */
  assert.equal(formatOf(await upload(pdfOf(9 * MiB))), "pdf");
  /* a declared non-text type is never overridden by a .csv name as the text content type (textTypeOf's rule); the FORMAT is decided by the
     name pass (format-registry R31, R107 amended, G170), as for a one-part file */
  const named = await upload(csvOf(9 * MiB), { type: "application/octet-stream", name: "x.csv" });
  assert.equal(formatOf(named), "csv");
  assert.equal(named.profile.source_content_type, "application/octet-stream", "still recorded as the uploader's declaration");
  /* a multipart upload with neither type nor text name is as before */
  assert.equal(formatOf(await upload(csvOf(9 * MiB))), "undetermined");
  assert.equal(formatOf(await upload(csvOf(9 * MiB), { name: "x.bin" })), "undetermined");
});
