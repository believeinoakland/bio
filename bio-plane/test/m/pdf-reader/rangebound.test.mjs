/* pdf-reader: requirement-named tests for what a range carries and how `maxBytes` is judged (build/requirements/pdf-reader.md
 * R43, R44, R46; fix round 9: G128c, G124d), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { extractPdfStructure, extractPdfRange, openPdfRange } from "../../../src/pdfstructure.mjs";
import { doc, flate } from "./pdf.mjs";

const T = (s) => `BT /F1 12 Tf 40 700 Td (${s}) Tj ET`;
const IMG = "/Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8";
const withImage = (text, rect) => ({
  content: `${T(text)} q ${rect.join(" ")} cm /Im1 Do Q`,
  resources: "/Font << /F1 10 0 R /F2 12 0 R >> /XObject << /Im1 300 0 R >>",
});
const file = () => doc([
  withImage("alpha page", [200, 0, 0, 200, 10, 10]), { content: T("beta page") }, withImage("gamma page here", [100, 0, 0, 100, 0, 0]),
  { content: T("delta") }, { content: T("epsilon words more") },
], { objs: { 300: { dict: IMG, data: "\x00\x01\x02\x03" }, 91: "<< /Title (Range Title) >>" }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" });

test("R46: every range answer carries the document's metadata and page boxes, the images placed on its pages, and its glyph and word counts, beside text", async () => {
  const bytes = file();
  const whole = await extractPdfStructure(bytes);
  const r = await extractPdfRange(bytes, { from: 1, count: 3 });
  assert.deepEqual(r.metadata, whole.metadata);
  assert.equal(r.metadata.title, "Range Title");
  assert.deepEqual(r.pageBoxes, whole.pageBoxes, "the boxes of the whole document, whichever pages the range is");
  assert.deepEqual(r.images, whole.images.filter((im) => im.page >= 1 && im.page < 4));
  assert.equal(r.images.length, 1);
  assert.equal(r.images[0].page, 2);
  assert.equal(r.text_glyphs, "beta pagegamma page heredelta".replace(/\s/g, "").length);
  assert.equal(r.words_total, 2 + 3 + 1);
  assert.ok(!("metadata" in r.text) && !("images" in r.text), "in their own members and not inside text");
});

test("R46: the union of a document's ranges equals the whole reading's metadata, page boxes, images and counts, for any partition", async () => {
  const bytes = file();
  const whole = await extractPdfStructure(bytes);
  const open = await openPdfRange(bytes);
  for (const n of [1, 2, 5]) {
    const images = [];
    let glyphs = 0, words = 0, first = null;
    for (let from = 0; from < 5; from += n) {
      const r = await open.range({ from, count: n });
      first ??= r;
      assert.deepEqual(r.metadata, whole.metadata);
      assert.deepEqual(r.pageBoxes, whole.pageBoxes);
      images.push(...r.images); glyphs += r.text_glyphs; words += r.words_total;
    }
    assert.deepEqual(images, whole.images, `partition ${n}`);
    assert.equal(glyphs, whole.text.pages.reduce((a, p) => a + p.text.replace(/\s/g, "").length, 0));
    assert.equal(words, whole.text.pages.reduce((a, p) => a + p.text.split(/\s+/).filter(Boolean).length, 0));
  }
  /* a range that cannot walk a page's images says so and the list is null, never partial */
  const noImgs = doc([{ content: T("a") + " /Missing Do" }], {});
  const r = await extractPdfRange(noImgs, { from: 0, count: 1 });
  assert.equal(r.images, null);
  assert.match(r.imagesWhy, /^xobject_unresolvable/);
});

test("R43: maxBytes is judged against each page's own decoded size: a heavy page among light ones is a range of its own", async () => {
  const unit = T("w") + "\n";
  const heavy = flate(unit.repeat(2000)); // about 2000 * 33 decoded bytes
  const pages = [{ content: T("light one") }, { content: T("light two") }, { content: { dict: "/Filter /FlateDecode", data: heavy } }, { content: T("light four") }, { content: T("light five") }];
  const bytes = doc(pages);
  const decoded = unit.length * 2000;
  const open = await openPdfRange(bytes);
  const maxBytes = 200;
  const counts = [];
  const seen = [];
  for (let from = 0; from < 5;) {
    const r = await open.range({ from, count: 5, maxBytes });
    counts.push(r.count);
    seen.push(...r.text.pages.map((p) => p.page));
    from += r.count;
  }
  assert.deepEqual(counts, [2, 1, 2], `light pages together, the heavy one alone (${decoded} decoded bytes against ${maxBytes})`);
  assert.deepEqual(seen, [0, 1, 2, 3, 4]);
  /* the same through extractPdfRange, which opens the file each call */
  assert.deepEqual([(await extractPdfRange(bytes, { from: 0, count: 5, maxBytes })).count, (await extractPdfRange(bytes, { from: 2, count: 5, maxBytes })).count], [2, 1]);
  /* the answer of every range is what the unbounded reading gives those pages */
  const whole = await extractPdfStructure(bytes);
  assert.deepEqual((await open.range({ from: 2, count: 1, maxBytes })).text.pages, whole.text.pages.slice(2, 3));
});
