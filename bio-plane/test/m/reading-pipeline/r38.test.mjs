/* reading-pipeline R38 (fix round 4b, F10, D5; K4504; pdf-reader R42): a refusal too large to read is recorded with its
 * size. Every case enters at `read` over real PDF bytes through the registered `pdf` entry. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc } from "./fixture.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { densePdf } from "../pdf-reader/dense.mjs";
import { synthPdf } from "./bigpdf.mjs";

const MIB = 1024 * 1024;
const pdfDoc = (digest, bytes) => doc({ digest, bytes, ct: "application/pdf", format: "pdf" });

test("R38: a 3,500-page text-dense PDF under 24 MiB is a final failed reading carrying the refusal's reason, pages, bytes, need_mb and limit_mb", { timeout: 600_000 }, async () => {
  const bytes = densePdf({ pages: 3500, linesPerPage: 120 });
  assert.ok(bytes.length < 24 * MIB && bytes.length > 12 * MIB, `the file is ${(bytes.length / MIB).toFixed(1)} MiB`);
  const w = fresh();
  const d = await hold(w.evidence, bytes);
  const rd = (await w.read(pdfDoc(d, bytes.length))).reading;
  assert.equal(rd.found, false);
  assert.equal(rd.failure, "final", rd.basis);
  assert.equal(rd.reason, "TOO_LARGE_TO_READ");
  assert.equal(rd.pages, 3500);
  assert.equal(rd.bytes, bytes.length);
  assert.ok(Number.isInteger(rd.need_mb) && Number.isInteger(rd.limit_mb) && rd.need_mb > rd.limit_mb, `${rd.need_mb} / ${rd.limit_mb}`);
});

test("R38: controls: a PDF within the limit carries none of the refusal's data, and a document that is no PDF at all is a final failure with no reason", async () => {
  const bytes = synthPdf({ pages: 40, linesPerPage: 60, targetBytes: 1_000_000 });
  const w = fresh();
  const d = await hold(w.evidence, bytes);
  const rd = (await w.read(pdfDoc(d, bytes.length))).reading;
  assert.equal(rd.failure, undefined);
  for (const k of ["reason", "pages", "bytes", "need_mb", "limit_mb"]) assert.equal(rd[k], undefined, k);
  const junk = new TextEncoder().encode("this is not a pdf at all, only words ".repeat(20));
  const dj = await hold(w.evidence, junk);
  const own = (await w.read(pdfDoc(dj, junk.length))).reading;
  assert.equal(own.failure, "final");
  assert.equal(own.reason, undefined);
});
