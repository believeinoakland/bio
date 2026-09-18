/* imagecrop.mjs — CPDF-18: the CROP of a cited PDF image, as a DERIVED RENDITION.
 *
 * EXTRACTION-BREADTH §3.4: "The capture's bytes and the extent, verified as the
 * capture is. The viewer shows the crop; the crop is not the evidence." So this
 * module produces the thing a viewer shows and says, on every answer, that it is
 * derived — the render companion's rule (CAPTURE-FIDELITY: a separate derived
 * artifact beside bytes that are never rewritten). Nothing here touches the
 * provenance chain, writes anything, or is the address of anything: the content
 * row's address is `{page, rect}` over the capture, and a crop can be re-derived
 * from those two facts by anyone holding the capture.
 *
 * WHAT A "CROP" IS HERE, precisely, because the obvious reading is not what is
 * built. There is no page rasteriser in this fleet (CPDF-12 measured that a
 * canvas is absent on workerd and did not build one). So the crop of an image
 * cited by `{page, rect}` is THE IMAGE THE PAGE PAINTS AT THAT RECTANGLE, taken
 * from the file: the XObject whose placement `pdfPageImages` reports at exactly
 * that rect, decoded through `pagepixels.mjs`'s own `decodeImage` (imported,
 * never re-derived). It is the image as the FILE STORES it:
 *   - marks drawn OVER the image and any clipping are NOT composited;
 *   - the placement's own flip or rotation is NOT applied (`placement` states
 *     the rectangle and `axis_aligned`, and `upright` is null when the placement
 *     is not a plain scale-and-translate, because this module does not know);
 *   - a DCT image is the publisher's own JPEG bytes, untouched (pass-through).
 *
 * THE REFUSALS ARE NAMED, and the first is the negative control EXTRACTION-
 * BREADTH §8 / the CPDF-18 row declares: a reference with the rect DROPPED
 * cannot be cropped — "an image on page 3" names no one image when a page
 * paints several, and choosing one would be inventing the citation's referent.
 */

import { pdfPageImages } from "../../bio-plane/src/pdfstructure.mjs";
import { loadPdf, decodeImage } from "./pagepixels.mjs";

export const CROP_REFUSALS = Object.freeze({
  NOT_AN_IMAGE_EXTENT: "the extent is not an `image` extent in its PDF form ({kind:'image', page, rect})",
  RECT_REQUIRED: "the extent names a page and no rectangle, so it names no one image to crop",
  NOT_A_PDF: "the bytes do not carry a %PDF- header",
  ENCRYPTED: "the document is encrypted; streams are ciphertext to this reader",
  NO_SUCH_PAGE: "the page index is outside the document",
  PAGE_UNWALKABLE: "the page's content could not be interpreted, so what it paints is undetermined",
  NO_IMAGE_AT_RECT: "the page paints no image at exactly that rectangle",
  AMBIGUOUS_RECT: "the page paints more than one image at exactly that rectangle",
  INLINE_IMAGE: "the image at that rectangle is inline in the content stream; extracting inline images is not built",
  DECODE_REFUSED: "the image was found and its samples could not be decoded here",
});

const refuse = (reason, detail = {}) => {
  if (!(reason in CROP_REFUSALS)) throw new Error(`undeclared refusal: ${reason}`);
  return { ok: false, derived: true, reason, why: CROP_REFUSALS[reason], ...detail };
};

const RECT_TOL = 0.001;   // pdfPageImages writes rects at 1/1000 pt
const sameRect = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= RECT_TOL);
const normRect = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];

async function sha256Hex(u8) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", u8));
  return [...d].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Crop the image a content row's extent names.
 * @param {Uint8Array} bytes   the capture's bytes (the evidence)
 * @param {object} extent      `{kind:"image", page, rect}` — the row's extent
 * @returns a derived rendition `{ok:true, derived:true, rendition:"crop", …}`
 *          or a NAMED refusal from CROP_REFUSALS. Never a blank frame.
 */
export async function cropImage(bytes, extent) {
  const e = extent && typeof extent === "object" ? extent : {};
  if (e.kind !== "image" || !Number.isInteger(e.page) || e.part != null)
    return refuse("NOT_AN_IMAGE_EXTENT", { extent: e });
  if (!(Array.isArray(e.rect) && e.rect.length === 4 && e.rect.every((n) => typeof n === "number" && Number.isFinite(n))))
    return refuse("RECT_REQUIRED", { page: e.page });

  const doc = await loadPdf(bytes);
  if (!doc) return refuse("NOT_A_PDF");
  if (doc.isEncrypted()) return refuse("ENCRYPTED");
  const n = (doc._pageOrder || []).length;
  if (e.page < 0 || e.page >= n) return refuse("NO_SUCH_PAGE", { page: e.page, pageCount: n });

  const got = await pdfPageImages(doc, e.page);
  if (!got.images) return refuse("PAGE_UNWALKABLE", { page: e.page, detail: got.why });
  const want = normRect(e.rect);
  const hits = got.images.filter((im) => Array.isArray(im.rect) && sameRect(im.rect, want));
  if (hits.length === 0)
    return refuse("NO_IMAGE_AT_RECT", { page: e.page, rect: want, painted: got.images.map((im) => im.rect) });
  if (hits.length > 1) return refuse("AMBIGUOUS_RECT", { page: e.page, rect: want, count: hits.length });
  const hit = hits[0];
  if (hit.inline || !hit._stream) return refuse("INLINE_IMAGE", { page: e.page, rect: want });

  const st = hit._stream;
  const num = (v) => { v = doc.resolve(v); return typeof v === "number" ? v : null; };
  const cs = doc.resolve(st.dict.ColorSpace);
  const im = {
    name: hit.name, obj: st, width: hit.width, height: hit.height,
    bpc: num(st.dict.BitsPerComponent),
    colorSpace: cs && cs.t === "name" ? cs.v : (st.dict.ColorSpace ? "«indirect»" : null),
    isMask: doc.resolve(st.dict.ImageMask) === true,
    filters: hit.filters,
  };
  const out = await decodeImage(doc, im, { rotate: 0 });
  if (!out.ok) return refuse("DECODE_REFUSED", { page: e.page, rect: want, decoder: out.reason, decoderWhy: out.why });

  return {
    ok: true,
    derived: true,
    rendition: "crop",
    why: "a DERIVED rendition for display: the evidence is the capture's bytes plus this extent, "
       + "and this file can be re-derived from them (EXTRACTION-BREADTH §3.4)",
    of: { kind: "image", page: e.page, rect: want },
    capture_sha256: await sha256Hex(bytes),
    placement: { name: hit.name, axis_aligned: hit.axis_aligned, filters: hit.filters },
    route: out.route,
    mediaType: out.mediaType,
    bytes: out.bytes,
    width: out.width ?? hit.width,
    height: out.height ?? hit.height,
    /* Upright only when the placement is a plain scale-and-translate with
       POSITIVE scales (no rotation, skew or flip — a PDF commonly paints an
       image through a negative y-scale) AND the decoder itself reports its
       samples upright; otherwise this module does not know, and says null
       rather than true. */
    upright: (() => {
      const m = hit._ctm;
      const plain = Array.isArray(m) && m[1] === 0 && m[2] === 0 && m[0] > 0 && m[3] > 0;
      return plain && out.upright === true ? true : null;
    })(),
    /* Both hashes, each labelled (D-246's recommendation, CPDF-12): the FILE
       hash says "is this the copy that was served", the PIXEL hash (decoded
       routes only) says "is this the same picture" and survives a runtime
       whose deflate differs. */
    file_sha256: await sha256Hex(out.bytes),
    ...(out.pixelsSha256 ? { pixels_sha256: out.pixelsSha256 } : {}),
  };
}
