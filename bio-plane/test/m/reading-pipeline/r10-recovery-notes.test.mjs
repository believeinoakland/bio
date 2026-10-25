/* reading-pipeline R62 (fix round 10, cause 9; K5053): what the structure read repaired reaches the reading. A PDF whose cross-reference was
   rebuilt lists `xref_reconstructed`; one that lost pages lists `pages_missing` with the count missing and the total; one cut before its
   trailer, read at tier 2 on a repaired view (pdf-worker R10), lists `pdf_truncated`; a sound file lists none. The files are the walker's
   recipes (walks A9 `damaged-xref` and `no-xref`, A5b `rw9-A-5b` cut at 70 per cent), made by test-support's generator; the notes are what
   the real `pdf-reader` and the real `pdf-worker` answer, never hand-made. Through `read`, the entry path every caller takes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, recoveryNotesOf, completenessOf } from "../../../src/reading-pipeline/index.mjs";
import { generate } from "../../pdfgen.mjs";
import { BUNDLE } from "../../../../pdf-worker/test/subject.mjs";
import { pathToFileURL } from "node:url";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";

const worker = (await import(pathToFileURL(BUNDLE).href)).default;
const bytesOf = (recipe) => generate({ kind: "pdf", ...recipe }).bytes();
/* the real pdf-worker as the PDF_WORKER binding reads the same bucket `read` reads */
const memberOver = (b) => ({ fetch: (url, init) => worker.fetch(new Request(url, init),
  { CAPTURES: { get: async (key) => { const o = await b.get(key); return o ? { size: o.size, arrayBuffer: o.arrayBuffer } : null; } } }) });

async function readOut(recipe, { cursor, withWorker = false } = {}) {
  const bytes = await bytesOf(recipe);
  const b = bucket();
  const d = await hold(b, bytes);
  return read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }),
    { evidence: evidenceStore(b), env: withWorker ? { PDF_WORKER: memberOver(b) } : {}, storeName: "bio", ...(cursor === undefined ? {} : { cursor }) });
}
const readPdf = async (recipe, opts) => (await readOut(recipe, opts)).reading;

test("R62 (cause 9; walk A9): a PDF with a damaged cross-reference lists xref_reconstructed", async () => {
  const r = await readPdf({ seed: "rw9-A-9a", structure: "damaged-xref", size: { pages: 3, lines: 4 } });
  assert.ok(Array.isArray(r.recovery_notes), "the reading lists its notes");
  assert.deepEqual(r.recovery_notes.map((n) => n.note), ["xref_reconstructed"]);
});

test("R62 (cause 9; walk A9): a PDF with no cross-reference lists xref_reconstructed", async () => {
  const r = await readPdf({ seed: "rw9-A-9b", structure: "no-xref", size: { pages: 3, lines: 4 } });
  assert.deepEqual((r.recovery_notes || []).map((n) => n.note), ["xref_reconstructed"]);
});

test("R62 (cause 9; walk A5b): a PDF cut at 70 per cent lists xref_reconstructed and, read at tier 2, pdf_truncated", async () => {
  const r = await readPdf({ seed: "rw9-A-5b", size: { pages: 30, lines: 6 }, truncate: 0.7 }, { withWorker: true });
  const notes = (r.recovery_notes || []).map((n) => n.note);
  assert.ok(notes.includes("xref_reconstructed"), JSON.stringify(r.recovery_notes));
  assert.ok(notes.includes("pdf_truncated"), JSON.stringify(r.recovery_notes));
  assert.equal(new Set(notes).size, notes.length, "each note once");
});

test("R62 (cause 9): a 30-page PDF whose cross-reference is damaged and eight of whose page objects are gone lists pages_missing 8 of 30", async () => {
  let n = 0;
  const text = Buffer.from(synthPdf({ pages: 30, linesPerPage: 3, targetBytes: 0 })).toString("latin1")
    .replace(/startxref\n\d+/, "startxref\n7")
    .replace(/(\d+) 0 obj\n(<< \/Type \/Page \/Parent)/g, (m, num, rest) => (n++ < 8 ? `${num} 0 xxx\n${rest}` : m));
  const bytes = new Uint8Array(Buffer.from(text, "latin1"));
  const b = bucket();
  const d = await hold(b, bytes);
  const r = (await read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }), { evidence: evidenceStore(b), env: {}, storeName: "bio" })).reading;
  assert.deepEqual(r.recovery_notes, [{ note: "xref_reconstructed" }, { note: "pages_missing", missing: 8, of: 30 }]);
});

test("R62 R48 (cause 9; pdf-worker R10, walk A5b): the pages of the cut file tier 2 could not read are stated unread and listed, so the reading is partial, never whole; the sound file is whole", async () => {
  const out = await readOut({ seed: "rw9-A-5b", size: { pages: 30, lines: 6 }, truncate: 0.7 }, { withWorker: true });
  assert.deepEqual(out.reading.truncated_pages, [22, 23, 24, 25, 26, 27, 28, 29], "pages 23 to 30, 0-based");
  assert.equal(out.counters.skipped, 8);
  assert.equal(completenessOf(out.counters, { more: false, final: true, reading: out.reading }), "partial");
  const whole = await readOut({ seed: "rw9-A-9d", size: { pages: 3, lines: 4 } }, { withWorker: true });
  assert.equal(whole.reading.truncated_pages, undefined);
  assert.equal(completenessOf(whole.counters, { more: false, final: true, reading: whole.reading }), "whole");
});

test("R62 (cause 9): control: a sound PDF lists none, with and without the member", async () => {
  for (const withWorker of [false, true]) {
    const r = await readPdf({ seed: "rw9-A-9c", size: { pages: 3, lines: 4 } }, { withWorker });
    assert.equal(r.recovery_notes, undefined, `sound file, member bound: ${withWorker}`);
  }
});

test("R62 (cause 9): recoveryNotesOf lists pages_missing with the count missing and the total (8 of 30), each note once, no other note", () => {
  const got = recoveryNotesOf(["xref_reconstructed", "structure_reconstructed", "pages_missing:8/30", "page_order_by_object_number_fallback"], ["xref_reconstructed", "pdf_truncated", 5, null], undefined);
  assert.deepEqual(got, [{ note: "xref_reconstructed" }, { note: "pages_missing", missing: 8, of: 30 }, { note: "pdf_truncated" }]);
  assert.deepEqual(recoveryNotesOf(), []);
});
