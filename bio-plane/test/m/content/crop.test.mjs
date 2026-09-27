/* content: the crop of an image cited by page and rectangle (R32; D-419), cut through pdf-pixels from the capture's own
   bytes in the evidence store, served as a derived rendition. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { world, bucket, V, sha, onePagePdf } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a";

function setup({ held = true, bytes = onePagePdf() } = {}) {
  const pdfSha = sha(Buffer.from(bytes));
  const w = world({ evidence: bucket(held ? { [`bio/captures/${pdfSha}`]: bytes } : {}) });
  w.doc(DOC, [w.cap("a")]);
  w.read(pdfSha, { pageCount: 1, containerExtent: { container: "pdf", levels: [], images: [{ page: 0, rect: [0, 0, 3, 2] }] } });
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: pdfSha, extent: e, mintedBy: V("bo") }).content_id;
  return { w, pdfSha, mint };
}

/** The 8-bit grey samples of a PNG, read back with node's own zlib. */
function greySamples(png) {
  const b = Buffer.from(png);
  let off = 8, idat = [], w = 0, h = 0;
  while (off < b.length) {
    const len = b.readUInt32BE(off), type = b.toString("latin1", off + 4, off + 8), data = b.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
    if (type === "IDAT") idat.push(data);
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), out = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.push(raw[y * (w + 1) + 1 + x]);
  return { w, h, out };
}

test("R32: the crop of a cited PDF image by page and rectangle, through pdf-pixels, served as a derived rendition that says so", async () => {
  const { w, pdfSha, mint } = setup();
  const id = mint({ kind: "image", page: 0, rect: [0, 0, 3, 2] });
  const before = w.snapshot();
  const r = await w.content.cropOf({ contentId: id, viewer: V("bo") });
  assert.deepEqual(w.snapshot(), before, "the crop writes nothing");
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.derived, r.rendition, r.content_id, r.capture_sha, r.capture_sha256], [true, "crop", id, pdfSha, pdfSha]);
  assert.match(r.says, /derived rendition/);
  assert.equal(r.mediaType, "image/png");
  const px = greySamples(r.bytes);
  assert.deepEqual([px.w, px.h], [3, 2]);
  assert.deepEqual(px.out, Array.from({ length: 6 }, (_, i) => (i * 37 + 11) & 0xff), "the image's own samples");
});

test("R32: an absent or invisible row is NO_SUCH_CONTENT; a row that is not a page image, and every way no crop can be made, is refused by name", async () => {
  const { w, mint } = setup();
  const id = mint({ kind: "image", page: 0, rect: [0, 0, 3, 2] });
  const hidden = await w.content.cropOf({ contentId: id, viewer: "nobody" });
  const absent = await w.content.cropOf({ contentId: "0".repeat(64), viewer: V("bo") });
  assert.deepEqual([hidden.reason, absent.reason], ["NO_SUCH_CONTENT", "NO_SUCH_CONTENT"]);
  assert.equal(hidden.detail, absent.detail);
  assert.equal((await w.content.cropOf({ contentId: mint({ kind: "pdf-page", page: 0 }), viewer: V("bo") })).reason, "CROP_NOT_A_PAGE_IMAGE");
  assert.equal((await w.content.cropOf({ contentId: mint({ kind: "document" }), viewer: V("bo") })).reason, "CROP_NOT_A_PAGE_IMAGE");
  const wrong = await w.content.cropOf({ contentId: mint({ kind: "image", page: 0 }), viewer: V("bo") });
  assert.deepEqual([wrong.reason, wrong.pdf_pixels_reason, wrong.derived], ["CROP_NOT_DERIVABLE", "RECT_REQUIRED", true]);
  {
    const s = setup({ held: false });
    const r = await s.w.content.cropOf({ contentId: s.mint({ kind: "image", page: 0, rect: [0, 0, 3, 2] }), viewer: V("bo") });
    assert.equal(r.reason, "CROP_CAPTURE_NOT_HELD");
  }
  {
    /* bytes held under the row's key that are not its capture: refused, never shown */
    const other = onePagePdf();
    const fake = "f".repeat(64);
    const w2 = world({ evidence: bucket({ [`bio/captures/${fake}`]: other }) });
    w2.doc(DOC, [w2.cap("a")]);
    w2.read(fake, { pageCount: 1 });
    const cid = w2.content.mint({ bundleId: DOC, captureSha: fake, extent: { kind: "image", page: 0, rect: [0, 0, 3, 2] }, mintedBy: V("bo") }).content_id;
    const r = await w2.content.cropOf({ contentId: cid, viewer: V("bo") });
    assert.equal(r.reason, "CROP_CAPTURE_MISMATCH");
  }
  {
    const w3 = world();
    w3.doc(DOC, [w3.cap("a")]);
    w3.read("e".repeat(64), { pageCount: 1 });
    const cid = w3.content.mint({ bundleId: DOC, captureSha: "e".repeat(64), extent: { kind: "image", page: 0, rect: [0, 0, 3, 2] }, mintedBy: V("bo") }).content_id;
    assert.equal((await w3.content.cropOf({ contentId: cid, viewer: V("bo") })).reason, "CROP_NO_EVIDENCE_STORE");
  }
});
