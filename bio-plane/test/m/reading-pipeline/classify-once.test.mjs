/* reading-pipeline R42 (fix round 6, G37; K4615): a read classifies its text once. The recognisers (`docprofile.doctypeFor`
 * over the whole text) cost time and memory that grow with the text, and a read used to run them twice: over the intake's decode
 * at the head of `readInner`, and again inside `docprofile.readText` over the text the entry produced (a CSV, a workbook). The
 * test counts the calls a registered content type's `detect` receives over a non-empty text, at `read`'s interface: one
 * classification costs a fixed number of them (measured on a text capture, which classifies once), and a CSV, a PDF and a text
 * must each cost exactly that. Controls: the verdict (`content_type`) of a failed reading, which asks the classification late, is
 * the one it always was; a text capture's own reading is unchanged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, withEntry } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";

let seen = [];
registerDoctype({
  key: "probe-count", label: "probe", version: 1,
  detect: (ctx) => { if (typeof ctx.text === "string" && ctx.text.length) seen.push(ctx.text.length); return { match: false, confidence: "none", signals: [] }; },
  parse: () => ({ entities: [] }),
});
registerDoctype({
  key: "probe-marked", label: "marked", version: 1,
  detect: (ctx) => (typeof ctx.text === "string" && ctx.text.includes("MARKERWORD") ? { match: true, confidence: "certain", signals: ["marker"] } : { match: false, confidence: "none", signals: [] }),
  parse: () => ({ entities: [] }),
});

const countOf = async (make) => {
  const w = fresh();
  const document = await make(w);
  seen = [];
  const out = await w.read(document);
  return { out, calls: seen.length };
};
const textDoc = (w) => hold(w.evidence, "Budget line one is here.\nBudget line two follows.\nBudget line three ends it.").then((d) =>
  doc({ digest: d, bytes: 80, ct: "text/plain", format: "text", fromText: true }));
const csvDoc = (w) => hold(w.evidence, "dept,amount\nParks,100\nLibrary,200\nStreets,300\n").then((d) =>
  doc({ digest: d, bytes: 50, ct: "text/csv", format: "csv", fromText: true }));
const pdfDoc = async (w) => {
  const bytes = synthPdf({ pages: 3, linesPerPage: 10, targetBytes: 0 });
  return doc({ digest: await hold(w.evidence, bytes), bytes: bytes.length, ct: "application/pdf", format: "pdf" });
};

test("R42 (G37): a text capture is classified once: the cost of one classification is measured and is not zero", async () => {
  const { out, calls } = await countOf(textDoc);
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.ok(calls >= 1, `${calls} detect calls`);
  assert.ok(seen.every((n) => n > 0));
});

test("R42 (G37): a CSV read classifies once, as a text capture does (it was twice: the intake's decode, then the entry's text)", async () => {
  const one = (await countOf(textDoc)).calls;
  const { out, calls } = await countOf(csvDoc);
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.equal(out.reading.text_container, "csv");
  assert.equal(calls, one, `one classification is ${one} detect calls over text, a CSV read made ${calls}`);
});

test("R42 (G37): a PDF read classifies once, over its extracted text", async () => {
  const one = (await countOf(textDoc)).calls;
  const { out, calls } = await countOf(pdfDoc);
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.equal(out.reading.text_container, "pdf");
  assert.equal(calls, one, `a PDF read made ${calls} detect calls, one classification is ${one}`);
});

test("R42 (G37) control: a failed reading is still told its content type from the intake's text, asked late", async () => {
  const w = fresh();
  const d = await hold(w.evidence, "MARKERWORD in the first line\nand a second line\n");
  const document = doc({ digest: d, bytes: 44, ct: "text/x-t42", format: "t42doc", fromText: true });
  // fixtures-own: synthetic a plug-in format entry registered through this module's own seam (`withEntry`), made up to refuse once; it is no other module's answer
  await withEntry({ format: "t42doc", text: async () => ({ ok: false, reason: "REFUSED" }) }, async () => {
    const out = await w.read(document);
    assert.equal(out.reading.found, false);
    assert.equal(out.reading.content_type, "probe-marked", out.reading.basis);
  });
});

test("R42 (G37) control: the reading of a text capture is as it was, its content type from the whole text", async () => {
  const w = fresh();
  const d = await hold(w.evidence, "MARKERWORD opens this note.\nSecond line.\n");
  const out = await w.read(doc({ digest: d, bytes: 40, ct: "text/plain", format: "text", fromText: true }));
  assert.equal(out.reading.content_type, "probe-marked");
  assert.equal(out.reading.read_from_text, true);
  assert.ok(out.text_units && out.text_units.length >= 1);
});
