/* reading-pipeline R2 R32 R37 (T51 fix round 5, E1; K4530): a recorded `undetermined` format is never trusted over the bytes
 * the reader holds. An upload between 8 and 24 MiB is held in parts and was profiled from no byte, so its recorded format
 * is `undetermined`; `read` detects it again from the held bytes before the format is chosen, and reads UTF-8 text without
 * a NUL as text when the profile's declared type is a text type, even in parts. Every case enters at `read` through the
 * evidence store, and asserts the words are in `text_units` (R-STOP), never only that a reading exists. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc } from "./fixture.mjs";
import { WHOLE_READ_MAX } from "../../../src/reading-pipeline/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { synthPdf } from "./bigpdf.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";

registerDoctypes(registerDoctype);

const PART = 8 * 1024 * 1024;

/* The shape an upload is stored in: held in parts, no type declared, the profile read none of its bytes. */
async function uploaded(w, bytes, { declared = null, recorded = "undetermined" } = {}) {
  const parts = [];
  for (let at = 0; at < bytes.length; at += PART) {
    const piece = bytes.subarray(at, Math.min(bytes.length, at + PART));
    parts.push({ sha256: await hold(w.evidence, piece), bytes: piece.length });
  }
  const d = doc({ digest: "e".repeat(64), bytes: bytes.length, ct: declared || "", format: recorded, headers: [], parts });
  d.profile.source_content_type = declared;
  return d;
}
const wordsOf = (out) => (out.text_units || []).map((u) => u.text).join("\n");

test("R2 R37: a 10 MB text-layer PDF uploaded in two parts, its recorded format `undetermined`, is read through the pdf entry: its words are in text_units", async () => {
  const w = fresh();
  const bytes = synthPdf({ pages: 40, linesPerPage: 60, targetBytes: 10 * 1024 * 1024 });
  assert.ok(bytes.length > PART && bytes.length < 2 * PART, "two parts");
  const out = await w.read(await uploaded(w, bytes));
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.equal(out.reading.text_container, "pdf");
  assert.equal(out.reading.text_tier, 1);
  assert.equal(out.reading.page_count, 40);
  assert.ok(out.text_units && out.text_units.length > 0, "text units");
  assert.match(wordsOf(out), /budget|department|program|appropriation/);
});

test("R2 R37: the same PDF with no recorded format at all (the profile names none) is read the same way", async () => {
  const w = fresh();
  const bytes = synthPdf({ pages: 12, linesPerPage: 40, targetBytes: 9 * 1024 * 1024 });
  const d = await uploaded(w, bytes);
  d.profile.format = null;
  const out = await w.read(d);
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.equal(out.reading.text_container, "pdf");
  assert.ok(out.text_units && out.text_units.length > 0);
});

test("R32 R37: a 12 MB UTF-8 text file declared text/plain, uploaded in two parts, is read as text: its words are in text_units", async () => {
  const w = fresh();
  const line = "The housing committee adopted the annual budget resolution after public comment.\n\n";
  const bytes = new TextEncoder().encode(line.repeat(Math.ceil((12 * 1024 * 1024) / line.length)));
  const out = await w.read(await uploaded(w, bytes, { declared: "text/plain" }));
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.ok(out.text_units && out.text_units.length > 0, "text units");
  assert.match(out.text_units[0].text, /housing committee adopted the annual budget resolution/);
  assert.equal(out.reading.text_container, "text");
});

test("R2 R37 (control): a PDF over the whole-read ceiling, recorded `undetermined`, still states the ceiling and its size, final", async () => {
  const w = fresh();
  const total = 30 * 1024 * 1024;
  const parts = Array.from({ length: 4 }, (_, i) => ({ sha256: String(i).repeat(64), bytes: i < 3 ? PART : total - 3 * PART }));
  const d = doc({ digest: "e".repeat(64), bytes: total, ct: "", format: "undetermined", headers: [], parts });
  const out = await w.read(d);
  assert.equal(out.reading.failure, "final");
  assert.equal(out.reading.basis, word("reading-pipeline.why.capture_bytes_parts",
    { total: String(total), parts: "4", multipart_read_max: String(WHOLE_READ_MAX) }));
  assert.equal(out.text_units, undefined);
});

test("R2 R32 (control): a multi-part upload whose bytes are not a registered format and not declared text is still not read as text; the same bytes with a NUL declared text/plain too", async () => {
  const w = fresh();
  const prose = new TextEncoder().encode("Plain words without a declared type. ".repeat(300_000));
  const undeclared = await w.read(await uploaded(w, prose, { declared: null }));
  assert.equal(undeclared.reading.failure, "final");
  assert.equal(undeclared.text_units, undefined);
  const binary = new Uint8Array(9 * 1024 * 1024).fill(0x41);
  binary[1234] = 0;
  const nul = await w.read(await uploaded(w, binary, { declared: "text/plain" }));
  assert.equal(nul.reading.failure, "final");
  assert.equal(nul.text_units, undefined);
});

test("R2 (control): a 3 MB single-part PDF recorded `pdf` reads as before, and a single-part PDF recorded `undetermined` is detected from its bytes", async () => {
  const w = fresh();
  const bytes = synthPdf({ pages: 20, linesPerPage: 40, targetBytes: 3_000_000 });
  const digest = await hold(w.evidence, bytes);
  const known = await w.read(doc({ digest, bytes: bytes.length, ct: "application/pdf", format: "pdf" }));
  const redetected = await w.read(doc({ digest, bytes: bytes.length, ct: "", format: "undetermined", headers: [] }));
  assert.equal(known.reading.failure, undefined);
  assert.equal(redetected.reading.failure, undefined, redetected.reading.basis);
  assert.deepEqual(redetected.text_units, known.text_units);
  assert.equal(redetected.reading.text_container, "pdf");
});

test("R2 R32 (control): two reads of the same upload are identical", async () => {
  const w = fresh();
  const bytes = synthPdf({ pages: 10, linesPerPage: 30, targetBytes: 9 * 1024 * 1024 });
  const d = await uploaded(w, bytes);
  const a = await w.read(d), b = await w.read(d);
  assert.deepEqual(a.text_units, b.text_units);
  assert.equal(JSON.stringify(a.reading.text_source), JSON.stringify(b.reading.text_source));
});
