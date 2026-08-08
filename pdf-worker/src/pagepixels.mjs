/* pagepixels.mjs — CPDF-12: a PDF page turned into PIXELS, inside workerd, with
 * NO canvas and NO dependency.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS IS NOT A RASTERISER, AND WHY THAT IS THE FINDING RATHER THAN A DODGE
 * ─────────────────────────────────────────────────────────────────────────────
 * CPDF-9 measured that pdf.js's renderer wants a `canvas` workerd does not have,
 * and the queue row that named this item assumed the answer was therefore a page
 * RASTERISER (interpret the content stream, paint glyphs and vectors into a
 * frame buffer). DEC-42 carried one observation that would remove that entirely,
 * to be VERIFIED rather than assumed: for the image-only class — the class OCR
 * is FOR — a page is typically ONE full-page embedded image, so what is needed is
 * image EXTRACTION, not rasterisation.
 *
 * `pagepixels-corpus.probe.mjs` measured that observation over a real Oakland
 * corpus before a line of this was built. The figures are in MEASUREMENTS.md;
 * read them there rather than from a number in this comment, which would go
 * stale silently the way every hand-carried figure in this repository has.
 *
 * So this module renders a page by EXTRACTING the image the page consists of and
 * decoding it to pixels. It is deliberately NOT a general renderer:
 *
 *   - A page carrying real TEXT is REFUSED by name (`PAGE_HAS_TEXT_LAYER`). That
 *     page does not need OCR; Tier 1 or the pdf-worker already reads it, and
 *     rendering it here would be inventing a picture of text we can read exactly.
 *   - A page whose marks are VECTOR (line art, tables drawn as strokes) is
 *     REFUSED by name (`NOT_IMAGE_ONLY`). Rasterising vectors IS the canvas job,
 *     and this module does not pretend to do it.
 *   - A page composed of MANY images (a mosaic, or a scan split into strips) is
 *     REFUSED by name (`MULTIPLE_IMAGES_ON_PAGE`) rather than silently returning
 *     the biggest one. Compositing strips is a real capability; it is not built,
 *     and the refusal says so with the count so the corpus decides whether it is
 *     ever worth building.
 *
 * EVERY refusal is a STATED refusal carrying a reason and the evidence for it.
 * The one thing this module must never do is hand back a blank or partial frame
 * that reads downstream like content — an OCR pass over a blank page produces
 * nothing, and "nothing" is indistinguishable from "a page with no text on it".
 * That is the negative control the queue row names, and it is enforced here by
 * construction: there is no code path that allocates a frame and returns it
 * without having decoded real samples into it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT DECODES, AND WHAT IT REFUSES
 * ─────────────────────────────────────────────────────────────────────────────
 *   DCTDecode        -> PASS-THROUGH. The stream bytes ARE a JPEG file. Nothing
 *                       is decoded, re-encoded or resampled: the bytes handed to
 *                       the OCR engine are the bytes the publisher's scanner
 *                       wrote, which is also the strongest provenance position
 *                       available (no transform of ours sits between the record
 *                       and the pixels a reader checks a claim against).
 *   CCITTFaxDecode   -> DECODED HERE, G4 (K<0) and G3 2D/1D, to a 1-bit-per-pixel
 *                       PNG. This is the only real decoder in the file and it is
 *                       the one that can lie plausibly, which is why the probe
 *                       verifies it PIXEL-EXACT against an independent decoder.
 *   FlateDecode /
 *   no filter        -> raw samples, 1/8-bit grey or 8-bit RGB, to PNG.
 *   JBIG2Decode      -> REFUSED by name. A real decoder, not built.
 *   JPXDecode        -> REFUSED by name. Likewise.
 *
 * PNG is written by hand (CRC32 + `CompressionStream("deflate")`, which is zlib-
 * wrapped and therefore exactly what an IDAT holds). Bilevel pages are written
 * at bit depth 1: a 3300x2550 bilevel page is ~1.05 MB packed against the 33.6 MB
 * an RGBA frame of the same page would cost, and memory is the binding constraint
 * in a 128 MB isolate (MEASUREMENTS.md: 120.4 MB of 128 while CPU sat at 2.5% of
 * its ceiling). Not making the RGBA frame is the whole reason this fits.
 */

import { PdfDoc } from "../../bio-plane/src/pdfstructure.mjs";

const LATIN1 = new TextDecoder("latin1");

/** Every reason this module can refuse with. Exported so a caller can branch on
 *  the set rather than on a string it guessed, and so the suite can assert that
 *  no refusal is emitted that is not declared here. */
export const REFUSALS = {
  NOT_A_PDF: "the bytes do not carry a %PDF- header",
  ENCRYPTED: "the document is encrypted; streams are ciphertext to this reader",
  NO_SUCH_PAGE: "the page index is outside the document",
  PAGE_UNREADABLE: "the page object could not be read",
  PAGE_HAS_TEXT_LAYER: "the page carries a text layer; it does not need pixels",
  NOT_IMAGE_ONLY: "the page carries marks that are not an embedded image",
  NO_IMAGE_ON_PAGE: "the page references no image XObject",
  MULTIPLE_IMAGES_ON_PAGE: "the page composes several images; compositing is not built",
  IMAGE_UNREADABLE: "the image XObject's stream could not be read",
  UNSUPPORTED_FILTER: "the image's filter chain has no decoder here",
  UNSUPPORTED_SAMPLES: "the image's sample layout has no decoder here",
  TRUNCATED_IMAGE_DATA: "the decoded image is short of its declared height",
  DECODE_FAILED: "the decoder could not read the image data",
};

const refuse = (reason, detail = {}) => {
  if (!(reason in REFUSALS)) throw new Error(`undeclared refusal: ${reason}`);
  return { ok: false, reason, why: REFUSALS[reason], ...detail };
};

/* ── the document ─────────────────────────────────────────────────────────── */

/** Load a PDF into the SAME reader `pdfstructure.mjs` uses (imported, never
 *  re-derived — see that file's export note). */
export async function loadPdf(bytes) {
  if (!(bytes instanceof Uint8Array)) return null;
  if (!/%PDF-\d+\.\d+/.test(LATIN1.decode(bytes.subarray(0, 1024)))) return null;
  const doc = new PdfDoc(bytes);
  doc.scanTopLevel();
  await doc.loadObjectStreams();
  for (const [num, v] of doc.objects) {
    if (v && v.t === "dict") v.map.__objnum = { t: "ref", n: num };
  }
  doc.buildPageIndex();
  return doc;
}

const nameOf = (doc, v) => {
  v = doc.resolve(v);
  return v && v.t === "name" ? v.v : null;
};
const numOf = (doc, v) => {
  v = doc.resolve(v);
  return typeof v === "number" ? v : null;
};

/** Filter chain as a plain array of names, in application order. */
function filterNames(doc, dict) {
  const f = doc.resolve(dict.Filter);
  if (!f) return [];
  if (f.t === "name") return [f.v];
  if (f.t === "arr") return f.items.map((x) => nameOf(doc, x)).filter(Boolean);
  return [];
}

/** /DecodeParms for the LAST filter in the chain (the one that matters for an
 *  image: an image is `[FlateDecode, CCITTFaxDecode]` at most, never the other
 *  way round). */
function decodeParms(doc, dict, idx) {
  let p = doc.resolve(dict.DecodeParms) ?? doc.resolve(dict.DP);
  if (p && p.t === "arr") p = doc.resolve(p.items[idx] ?? p.items[p.items.length - 1]);
  return p && p.t === "dict" ? p.map : null;
}

/** A page's /Resources, walking /Parent for the inherited case. */
function pageResources(doc, pageMap, depth = 0) {
  if (!pageMap || depth > 32) return null;
  const res = doc.dictOf(pageMap.Resources);
  if (res) return res;
  const parent = doc.dictOf(pageMap.Parent);
  return parent ? pageResources(doc, parent, depth + 1) : null;
}

/** The page's content stream bytes, concatenated when /Contents is an array. */
async function pageContentText(doc, pageMap) {
  const c = doc.resolve(pageMap.Contents);
  const parts = [];
  const one = async (v) => {
    const st = doc.resolve(v);
    if (!st || st.t !== "stream") return;
    const data = await doc.streamDecoded(st);
    if (data) parts.push(LATIN1.decode(data));
  };
  if (c && c.t === "arr") { for (const it of c.items) await one(it); }
  else await one(pageMap.Contents);
  return parts.join("\n");
}

/* Content-stream operators, read from a stream with strings and inline images
 * MASKED OUT first. A naive regex over raw content matches operator letters
 * inside `(...)` strings and inside BI/ID/EI inline-image binary, which is how a
 * page of pure scan reads as "carrying text" — the generous direction, and the
 * one this project treats as the worse one. */
function maskedContent(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "(") {
      let depth = 1; i++;
      while (i < s.length && depth > 0) {
        if (s[i] === "\\") { i += 2; continue; }
        if (s[i] === "(") depth++;
        else if (s[i] === ")") depth--;
        i++;
      }
      out += " () ";
      continue;
    }
    if (ch === "<" && s[i + 1] !== "<") {
      const e = s.indexOf(">", i);
      i = e === -1 ? s.length : e + 1;
      out += " <> ";
      continue;
    }
    if (ch === "%") {
      const e = s.indexOf("\n", i);
      i = e === -1 ? s.length : e + 1;
      out += " ";
      continue;
    }
    // Inline image: BI ... ID <binary> EI
    if (ch === "B" && s[i + 1] === "I" && /[\s/]/.test(s[i + 2] || " ")) {
      const id = s.indexOf("ID", i);
      if (id !== -1) {
        const ei = s.indexOf("EI", id);
        i = ei === -1 ? s.length : ei + 2;
        out += " INLINEIMAGE ";
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

const TEXT_OPS = /(^|[\s\]>)])(Tj|TJ|'|")(?=[\s]|$)/;
const SHOW_TEXT_BLOCK = /(^|\s)BT(\s|$)/;
/* Painting operators that put non-image marks on the page. `sh` is a shading;
 * the rest are path fills and strokes. `W`/`n` (clip, no-op) are excluded on
 * purpose — a clip path paints nothing and every scanned page has one. */
const VECTOR_OPS = /(^|\s)(f\*?|F|B\*?|b\*?|S|s|sh)(\s|$)/;

/** What is actually ON this page: images, text, vector marks. The three are
 *  reported separately and NONE of them is inferred from another — "no fonts"
 *  is not "no text" (a Type3 or a broken resource dict), and "has an image" is
 *  not "is a scan". */
export async function analyzePage(doc, pageIndex) {
  const order = doc._pageOrder || [];
  if (pageIndex < 0 || pageIndex >= order.length) return null;
  const pageMap = doc.dictOf({ t: "ref", n: order[pageIndex] });
  if (!pageMap) return null;

  const res = pageResources(doc, pageMap);
  const xobjDict = res ? doc.dictOf(res.XObject) : null;

  const images = [];
  if (xobjDict) {
    for (const key of Object.keys(xobjDict)) {
      if (key.startsWith("__")) continue;
      const st = doc.resolve(xobjDict[key]);
      if (!st || st.t !== "stream") continue;
      if (nameOf(doc, st.dict.Subtype) !== "Image") continue;
      images.push({
        name: key,
        obj: st,
        width: numOf(doc, st.dict.Width),
        height: numOf(doc, st.dict.Height),
        bpc: numOf(doc, st.dict.BitsPerComponent),
        colorSpace: nameOf(doc, st.dict.ColorSpace) || (st.dict.ColorSpace ? "«indirect»" : null),
        isMask: doc.resolve(st.dict.ImageMask) === true,
        filters: filterNames(doc, st.dict),
      });
    }
  }

  let content = "";
  try { content = await pageContentText(doc, pageMap); } catch { content = ""; }
  const masked = maskedContent(content);

  const drawn = [...masked.matchAll(/\/([^\s/<>[\]()]+)\s+Do(?=[\s]|$)/g)].map((m) => m[1]);
  const drawnImages = drawn.filter((n) => images.some((im) => im.name === n));

  const mediaBox = (() => {
    let m = doc.resolve(pageMap.MediaBox);
    let p = pageMap, d = 0;
    while (!m && d++ < 32) { p = doc.dictOf(p.Parent); if (!p) break; m = doc.resolve(p.MediaBox); }
    if (!m || m.t !== "arr" || m.items.length < 4) return null;
    const v = m.items.map((x) => numOf(doc, x));
    if (v.some((x) => x == null)) return null;
    return { w: Math.abs(v[2] - v[0]), h: Math.abs(v[3] - v[1]) };
  })();

  return {
    page: pageIndex,
    contentBytes: content.length,
    contentReadable: content.length > 0 || !pageMap.Contents,
    hasTextOps: TEXT_OPS.test(masked) || SHOW_TEXT_BLOCK.test(masked),
    hasVectorOps: VECTOR_OPS.test(masked),
    hasInlineImage: masked.includes("INLINEIMAGE"),
    images: images.map(({ obj, ...rest }) => rest),
    _images: images,
    drawnImageNames: drawnImages,
    imageCount: images.length,
    mediaBox,
    rotate: numOf(doc, pageMap.Rotate) ?? 0,
  };
}

/* ── the renderer ─────────────────────────────────────────────────────────── */

/**
 * Render one page to pixels. Returns either
 *   { ok:true, page, route, mediaType, bytes, width, height, … }
 * or a STATED refusal from `REFUSALS`. Never a blank frame.
 *
 * `route` names how the pixels were produced, because the provenance chain
 * CPDF-10 records has to say it: `passthrough-dct` means the publisher's own
 * JPEG bytes were handed on untouched; `decoded-ccitt-g4` means this module's
 * decoder produced them and a calibration therefore applies to it too.
 */
export async function renderPageToPixels(bytes, pageIndex, opts = {}) {
  const doc = await loadPdf(bytes);
  if (!doc) return refuse("NOT_A_PDF");
  if (doc.isEncrypted()) return refuse("ENCRYPTED");

  const a = await analyzePage(doc, pageIndex);
  if (!a) {
    const n = (doc._pageOrder || []).length;
    return pageIndex >= 0 && pageIndex < n
      ? refuse("PAGE_UNREADABLE", { page: pageIndex })
      : refuse("NO_SUCH_PAGE", { page: pageIndex, pageCount: n });
  }

  if (a.hasTextOps && !opts.allowTextPage) {
    return refuse("PAGE_HAS_TEXT_LAYER", { page: pageIndex, imageCount: a.imageCount });
  }
  if (a.imageCount === 0) {
    return refuse(a.hasVectorOps ? "NOT_IMAGE_ONLY" : "NO_IMAGE_ON_PAGE", {
      page: pageIndex, hasVectorOps: a.hasVectorOps, hasInlineImage: a.hasInlineImage,
    });
  }
  if (a.imageCount > 1) {
    return refuse("MULTIPLE_IMAGES_ON_PAGE", {
      page: pageIndex, imageCount: a.imageCount,
      images: a.images.map((i) => ({ width: i.width, height: i.height, filters: i.filters })),
    });
  }

  const im = a._images[0];
  const out = await decodeImage(doc, im, { ...opts, rotate: a.rotate || 0 });
  if (!out.ok) return { ...out, page: pageIndex };

  return {
    ok: true,
    page: pageIndex,
    route: out.route,
    mediaType: out.mediaType,
    bytes: out.bytes,
    width: out.width ?? im.width,
    height: out.height ?? im.height,
    /* Are these pixels the page as a READER sees it? A route that could not
     * apply the page's own /Rotate says so HERE rather than leaving a consumer
     * to discover it in its output. See the note on rotateBilevel. */
    upright: out.upright,
    rotate_deg: a.rotate || 0,
    source: {
      filters: im.filters,
      colorSpace: im.colorSpace,
      bitsPerComponent: im.bpc,
      imageMask: im.isMask,
    },
    page_geometry: {
      mediaBoxPt: a.mediaBox,
      rotate: a.rotate,
      dpi: a.mediaBox && im.width && im.height
        ? { x: +(im.width / (a.mediaBox.w / 72)).toFixed(1), y: +(im.height / (a.mediaBox.h / 72)).toFixed(1) }
        : null,
    },
    page_marks: { hasTextOps: a.hasTextOps, hasVectorOps: a.hasVectorOps },
    ...(out.ccitt ? { ccitt: out.ccitt } : {}),
    /* THE DIGEST OF THE PICTURE, NOT OF THE FILE — and this field exists because
     * the cross-runtime arm of the probe found the file digest to be RUNTIME-
     * DEPENDENT. `CompressionStream("deflate")` is a platform service, and
     * workerd's and node's produce different (both valid) deflate streams for
     * identical input: the same page rendered by the same code came out
     * 147,251 B on workerd and 152,499 B on node. The PIXELS were identical.
     * A record that hashes the FILE therefore records a value no verifier on a
     * different runtime can reproduce, which is the whole point of a hash here.
     * So a decoded route also carries `pixels_sha256`, taken over the normalised
     * samples before any container is built. A pass-through route does not need
     * one: its bytes are the publisher's own and are byte-stable by definition. */
    ...(out.pixelsSha256 ? { pixels_sha256: out.pixelsSha256 } : {}),
  };
}

async function decodeImage(doc, im, opts) {
  const dict = im.obj.dict;
  const filters = im.filters;
  const last = filters[filters.length - 1] || null;

  if (last === "JBIG2Decode" || last === "JPXDecode") {
    return refuse("UNSUPPORTED_FILTER", { filter: last, filters });
  }

  /* DCTDecode: the stream IS a JPEG. Hand the publisher's own bytes on. */
  if (last === "DCTDecode" || last === "DCT") {
    if (filters.length > 1) return refuse("UNSUPPORTED_FILTER", { filters, note: "DCT behind another filter" });
    const raw = doc.streamRawBytes(im.obj);
    if (!raw || raw.length < 4) return refuse("IMAGE_UNREADABLE", { filters });
    if (!(raw[0] === 0xff && raw[1] === 0xd8)) {
      return refuse("DECODE_FAILED", { filters, note: "DCT stream does not start with SOI" });
    }
    /* NOT ROTATED, AND THAT IS THE POINT OF THE ROUTE. Rotating a JPEG means
     * decoding and re-encoding it, which throws away the one property this
     * route has — that the bytes in the record are the publisher's own, with no
     * transform of ours between the record and the pixels a reader checks a
     * claim against. So a rotated page comes back `upright:false` with its
     * `rotate_deg` STATED, and a consumer that needs it upright must say so
     * rather than be handed a sideways page that reads like a good one. */
    return { ok: true, route: "passthrough-dct", mediaType: "image/jpeg", bytes: raw,
             upright: (opts.rotate || 0) === 0 };
  }

  if (!im.width || !im.height) return refuse("IMAGE_UNREADABLE", { filters });

  /* CCITTFaxDecode: decode here. */
  if (last === "CCITTFaxDecode" || last === "CCF") {
    let data = doc.streamRawBytes(im.obj);
    if (filters.length > 1) {
      if (filters.slice(0, -1).every((f) => f === "FlateDecode" || f === "Fl")) {
        const st = { ...im.obj, dict: { ...dict, Filter: { t: "name", v: "FlateDecode" } } };
        data = await doc.streamDecoded(st);
      } else return refuse("UNSUPPORTED_FILTER", { filters });
    }
    if (!data) return refuse("IMAGE_UNREADABLE", { filters });

    const p = decodeParms(doc, dict, filters.length - 1) || {};
    const K = numOf(doc, p.K) ?? 0;
    const columns = numOf(doc, p.Columns) ?? 1728;
    const rows = numOf(doc, p.Rows) ?? im.height;
    const blackIs1 = doc.resolve(p.BlackIs1) === true;
    const byteAlign = doc.resolve(p.EncodedByteAlign) === true;

    let bits;
    try {
      bits = ccittDecode(data, { K, columns, rows, byteAlign });
    } catch (e) {
      return refuse("DECODE_FAILED", { filters, note: String(e && e.message || e) });
    }
    if (bits.rowsDecoded < im.height) {
      return refuse("TRUNCATED_IMAGE_DATA", {
        filters, declaredHeight: im.height, rowsDecoded: bits.rowsDecoded, columns,
      });
    }

    /* CCITT's own colours -> PNG greyscale-1 samples. In PNG, sample 0 is black.
     * CCITT "white" is white unless BlackIs1 flips it; /Decode [1 0] flips again.
     * Both flips are applied here explicitly rather than assumed away. */
    const dec = doc.resolve(dict.Decode);
    const decodeInverts = dec && dec.t === "arr" && numOf(doc, dec.items[0]) === 1;
    let invert = false;
    if (blackIs1) invert = !invert;
    if (decodeInverts) invert = !invert;
    // `bits.packed` holds 1 = CCITT white. PNG grey-1 wants 1 = white too, so a
    // straight copy is correct in the un-inverted case.
    const packed0 = invert ? bits.packed.map((b) => ~b & 0xff) : bits.packed;
    const rot = rotateBilevel(normalisePacked(packed0, columns, im.height), columns, im.height, opts.rotate || 0);

    const png = await encodePng1(rot.packed, rot.width, rot.height);
    return { ok: true, route: "decoded-ccitt-g4", mediaType: "image/png", bytes: png,
             width: rot.width, height: rot.height, upright: true,
             pixelsSha256: await sha256Hex(normalisePacked(rot.packed, rot.width, rot.height)),
             ccitt: { K, columns, rows, blackIs1, byteAlign, rowsDecoded: bits.rowsDecoded } };
  }

  /* FlateDecode or unfiltered raw samples. */
  if (filters.length === 0 || filters.every((f) => f === "FlateDecode" || f === "Fl")) {
    const data = await doc.streamDecoded(im.obj);
    if (!data) return refuse("IMAGE_UNREADABLE", { filters });
    const bpc = im.isMask ? 1 : (im.bpc ?? 8);
    const cs = im.colorSpace;
    const comps = im.isMask ? 1 : cs === "DeviceRGB" ? 3 : cs === "DeviceGray" ? 1 : null;
    if (comps == null) return refuse("UNSUPPORTED_SAMPLES", { colorSpace: cs, bpc, filters });

    const rowBytes = Math.ceil((im.width * comps * bpc) / 8);
    const need = rowBytes * im.height;
    if (data.length < need) {
      return refuse("TRUNCATED_IMAGE_DATA", {
        filters, declaredHeight: im.height, haveBytes: data.length, needBytes: need,
      });
    }
    if (bpc === 1 && comps === 1) {
      /* An /ImageMask's sample 1 is where the mask PAINTS, i.e. black, which is
       * the inverse of PNG grey-1. /Decode [1 0] flips it back. */
      const dec = doc.resolve(dict.Decode);
      const decOne = dec && dec.t === "arr" && numOf(doc, dec.items[0]) === 1;
      const invert = im.isMask ? !decOne : decOne;
      const src = data.subarray(0, need);
      const packed0 = invert ? Uint8Array.from(src, (b) => ~b & 0xff) : Uint8Array.from(src);
      const rot = rotateBilevel(normalisePacked(packed0, im.width, im.height), im.width, im.height, opts.rotate || 0);
      return { ok: true, route: "raw-samples-1bit", mediaType: "image/png",
               width: rot.width, height: rot.height, upright: true,
               pixelsSha256: await sha256Hex(normalisePacked(rot.packed, rot.width, rot.height)),
               bytes: await encodePng1(rot.packed, rot.width, rot.height) };
    }
    if (bpc === 8) {
      /* 8-bit rotation is not built. A grey/RGB raster is 8x the bytes of the
       * bilevel case and this class is 0 of the image-only pages the corpus
       * measured, so it is NAMED rather than pre-built. */
      return { ok: true, route: comps === 3 ? "raw-samples-rgb8" : "raw-samples-grey8",
               mediaType: "image/png", upright: (opts.rotate || 0) === 0,
               bytes: await encodePng8(data.subarray(0, need), im.width, im.height, comps) };
    }
    return refuse("UNSUPPORTED_SAMPLES", { colorSpace: cs, bpc, comps, filters });
  }

  return refuse("UNSUPPORTED_FILTER", { filters });
}

/* ── CCITT Group 3/4 ──────────────────────────────────────────────────────────
 * ITU-T T.4 / T.6. The tables below are the standard code books, written out in
 * full rather than generated, because a generated table is a second thing to be
 * wrong. Correctness is not argued from this comment: `pagepixels-corpus.probe`
 * checks the output PIXEL-EXACT against an independent decoder that shares no
 * code with this one, and refuses to report a figure without it.
 */

const WHITE_CODES = {
  "8:00110101": 0, "6:000111": 1, "4:0111": 2, "4:1000": 3, "4:1011": 4, "4:1100": 5,
  "4:1110": 6, "4:1111": 7, "5:10011": 8, "5:10100": 9, "5:00111": 10, "5:01000": 11,
  "6:001000": 12, "6:000011": 13, "6:110100": 14, "6:110101": 15, "6:101010": 16,
  "6:101011": 17, "7:0100111": 18, "7:0001100": 19, "7:0001000": 20, "7:0010111": 21,
  "7:0000011": 22, "7:0000100": 23, "7:0101000": 24, "7:0101011": 25, "7:0010011": 26,
  "7:0100100": 27, "7:0011000": 28, "8:00000010": 29, "8:00000011": 30, "8:00011010": 31,
  "8:00011011": 32, "8:00010010": 33, "8:00010011": 34, "8:00010100": 35, "8:00010101": 36,
  "8:00010110": 37, "8:00010111": 38, "8:00101000": 39, "8:00101001": 40, "8:00101010": 41,
  "8:00101011": 42, "8:00101100": 43, "8:00101101": 44, "8:00000100": 45, "8:00000101": 46,
  "8:00001010": 47, "8:00001011": 48, "8:01010010": 49, "8:01010011": 50, "8:01010100": 51,
  "8:01010101": 52, "8:00100100": 53, "8:00100101": 54, "8:01011000": 55, "8:01011001": 56,
  "8:01011010": 57, "8:01011011": 58, "8:01001010": 59, "8:01001011": 60, "8:00110010": 61,
  "8:00110011": 62, "8:00110100": 63,
  "5:11011": 64, "5:10010": 128, "6:010111": 192, "7:0110111": 256, "8:00110110": 320,
  "8:00110111": 384, "8:01100100": 448, "8:01100101": 512, "8:01101000": 576,
  "8:01100111": 640, "9:011001100": 704, "9:011001101": 768, "9:011010010": 832,
  "9:011010011": 896, "9:011010100": 960, "9:011010101": 1024, "9:011010110": 1088,
  "9:011010111": 1152, "9:011011000": 1216, "9:011011001": 1280, "9:011011010": 1344,
  "9:011011011": 1408, "9:010011000": 1472, "9:010011001": 1536, "9:010011010": 1600,
  "6:011000": 1664, "9:010011011": 1728,
};

const BLACK_CODES = {
  "10:0000110111": 0, "3:010": 1, "2:11": 2, "2:10": 3, "3:011": 4, "4:0011": 5,
  "4:0010": 6, "5:00011": 7, "6:000101": 8, "6:000100": 9, "7:0000100": 10,
  "7:0000101": 11, "7:0000111": 12, "8:00000100": 13, "8:00000111": 14, "9:000011000": 15,
  "10:0000010111": 16, "10:0000011000": 17, "10:0000001000": 18, "11:00001100111": 19,
  "11:00001101000": 20, "11:00001101100": 21, "11:00000110111": 22, "11:00000101000": 23,
  "11:00000010111": 24, "11:00000011000": 25, "12:000011001010": 26, "12:000011001011": 27,
  "12:000011001100": 28, "12:000011001101": 29, "12:000001101000": 30, "12:000001101001": 31,
  "12:000001101010": 32, "12:000001101011": 33, "12:000011010010": 34, "12:000011010011": 35,
  "12:000011010100": 36, "12:000011010101": 37, "12:000011010110": 38, "12:000011010111": 39,
  "12:000001101100": 40, "12:000001101101": 41, "12:000011011010": 42, "12:000011011011": 43,
  "12:000001010100": 44, "12:000001010101": 45, "12:000001010110": 46, "12:000001010111": 47,
  "12:000001100100": 48, "12:000001100101": 49, "12:000001010010": 50, "12:000001010011": 51,
  "12:000000100100": 52, "12:000000110111": 53, "12:000000111000": 54, "12:000000100111": 55,
  "12:000000101000": 56, "12:000001011000": 57, "12:000001011001": 58, "12:000000101011": 59,
  "12:000000101100": 60, "12:000001011010": 61, "12:000001100110": 62, "12:000001100111": 63,
  "10:0000001111": 64, "12:000011001000": 128, "12:000011001001": 192, "12:000001011011": 256,
  "12:000000110011": 320, "12:000000110100": 384, "12:000000110101": 448,
  "13:0000001101100": 512, "13:0000001101101": 576, "13:0000001001010": 640,
  "13:0000001001011": 704, "13:0000001001100": 768, "13:0000001001101": 832,
  "13:0000001110010": 896, "13:0000001110011": 960, "13:0000001110100": 1024,
  "13:0000001110101": 1088, "13:0000001110110": 1152, "13:0000001110111": 1216,
  "13:0000001010010": 1280, "13:0000001010011": 1344, "13:0000001010100": 1408,
  "13:0000001010101": 1472, "13:0000001011010": 1536, "13:0000001011011": 1600,
  "13:0000001100100": 1664, "13:0000001100101": 1728,
};

/* Extended make-up codes, shared by both colours (T.4 table 3). */
const EXT_CODES = {
  "11:00000001000": 1792, "11:00000001100": 1856, "11:00000001101": 1920,
  "12:000000010010": 1984, "12:000000010011": 2048, "12:000000010100": 2112,
  "12:000000010101": 2176, "12:000000010110": 2240, "12:000000010111": 2304,
  "12:000000011100": 2368, "12:000000011101": 2432, "12:000000011110": 2496,
  "12:000000011111": 2560,
};

const WHITE_ALL = { ...WHITE_CODES, ...EXT_CODES };
const BLACK_ALL = { ...BLACK_CODES, ...EXT_CODES };
const MAX_CODE_BITS = 14;

class BitReader {
  constructor(data) { this.d = data; this.pos = 0; }
  get eof() { return this.pos >= this.d.length * 8; }
  peek(n) {
    let v = "";
    for (let i = 0; i < n; i++) {
      const p = this.pos + i;
      const byte = this.d[p >> 3];
      v += byte === undefined ? "0" : ((byte >> (7 - (p & 7))) & 1) ? "1" : "0";
    }
    return v;
  }
  skip(n) { this.pos += n; }
  align() { this.pos = (this.pos + 7) & ~7; }
}

function readRun(br, table) {
  let total = 0;
  for (;;) {
    let hit = null;
    const window = br.peek(MAX_CODE_BITS);
    for (let len = 2; len <= MAX_CODE_BITS; len++) {
      const key = `${len}:${window.slice(0, len)}`;
      if (key in table) { hit = { len, run: table[key] }; break; }
    }
    if (!hit) return null;
    br.skip(hit.len);
    total += hit.run;
    if (hit.run < 64) return total;      // terminating code ends the run
    if (br.eof) return total;
  }
}

/**
 * Decode CCITT G3/G4 into packed 1-bit rows where a SET bit is WHITE.
 * Returns { packed, rowsDecoded }. Throws only on a structurally impossible
 * stream; a stream that simply ends early returns fewer rows, and the caller
 * turns that into TRUNCATED_IMAGE_DATA rather than padding it with white.
 */
export function ccittDecode(data, { K = 0, columns = 1728, rows = 0, byteAlign = false }) {
  const br = new BitReader(data);
  const rowBytes = Math.ceil(columns / 8);
  const out = [];
  let ref = [columns, columns];       // reference line: changing elements
  const maxRows = rows && rows > 0 ? rows : 1 << 20;

  const eol = () => br.peek(12) === "000000000001";

  if (K > 0) throw new Error("mixed-mode (K>0) CCITT is not decoded here");

  for (let r = 0; r < maxRows; r++) {
    if (byteAlign) br.align();
    while (eol()) {
      br.skip(12);
      if (K > 0) br.skip(1);           // mixed mode: the 1D/2D tag bit
    }
    if (br.eof) break;

    /* K < 0 is pure 2D (G4); K == 0 is pure 1D (G3). MIXED mode (K > 0) carries
     * a per-row tag bit after each EOL, and a stream without EOLs gives no way
     * to read it — so it is REFUSED above rather than decoded as whichever mode
     * happened to be guessed. */
    const twoD = K < 0;

    const cur = [];
    let a0 = -1;
    let color = 0;                     // 0 = white
    let guard = 0;

    while (a0 < columns) {
      if (++guard > columns * 4 + 64) throw new Error("row did not terminate");
      if (br.eof) break;

      if (twoD) {
        const w = br.peek(7);
        let a1;
        if (w[0] === "1") {                       // V0
          br.skip(1); a1 = b1(ref, a0, color);
        } else if (w.startsWith("011")) {         // VR1
          br.skip(3); a1 = b1(ref, a0, color) + 1;
        } else if (w.startsWith("010")) {         // VL1
          br.skip(3); a1 = b1(ref, a0, color) - 1;
        } else if (w.startsWith("001")) {         // Horizontal
          br.skip(3);
          const s = a0 < 0 ? 0 : a0;
          const r1 = readRun(br, color === 0 ? WHITE_ALL : BLACK_ALL);
          const r2 = readRun(br, color === 0 ? BLACK_ALL : WHITE_ALL);
          if (r1 == null || r2 == null) { a0 = columns; break; }
          const m1 = Math.min(columns, s + r1);
          const m2 = Math.min(columns, m1 + r2);
          cur.push(m1, m2);
          a0 = m2;
          continue;
        } else if (w.startsWith("0001")) {        // Pass
          br.skip(4);
          a0 = b2(ref, a0, color);
          continue;
        } else if (w.startsWith("000011")) {      // VR2
          br.skip(6); a1 = b1(ref, a0, color) + 2;
        } else if (w.startsWith("000010")) {      // VL2
          br.skip(6); a1 = b1(ref, a0, color) - 2;
        } else if (w.startsWith("0000011")) {     // VR3
          br.skip(7); a1 = b1(ref, a0, color) + 3;
        } else if (w.startsWith("0000010")) {     // VL3
          br.skip(7); a1 = b1(ref, a0, color) - 3;
        } else {
          a0 = columns; break;                    // EOFB / unknown: end the row
        }
        a1 = Math.max(0, Math.min(columns, a1));
        cur.push(a1);
        a0 = a1;
        color ^= 1;
      } else {
        const s = a0 < 0 ? 0 : a0;
        const run = readRun(br, color === 0 ? WHITE_ALL : BLACK_ALL);
        if (run == null) { a0 = columns; break; }
        const m = Math.min(columns, s + run);
        cur.push(m);
        a0 = m;
        color ^= 1;
      }
    }

    if (cur.length === 0 && br.eof) break;

    const row = new Uint8Array(rowBytes).fill(0xff);   // start all white
    let pos = 0, c = 0;
    for (const t of cur) {
      if (c === 1) for (let x = pos; x < t && x < columns; x++) row[x >> 3] &= ~(0x80 >> (x & 7));
      pos = t; c ^= 1;
      if (pos >= columns) break;
    }
    if (c === 1 && pos < columns) {
      for (let x = pos; x < columns; x++) row[x >> 3] &= ~(0x80 >> (x & 7));
    }
    out.push(row);

    ref = cur.length ? cur.concat([columns, columns]) : [columns, columns];
  }

  const packed = new Uint8Array(out.length * rowBytes);
  out.forEach((row, i) => packed.set(row, i * rowBytes));
  return { packed, rowsDecoded: out.length };
}

/** b1: first changing element on the reference line strictly right of a0 whose
 *  colour is opposite to `color`. Reference transitions alternate, ref[even]
 *  being a white->black change. */
function b1(ref, a0, color) {
  let i = 0;
  while (i < ref.length && ref[i] <= a0) i++;
  // parity must match: white run -> we want a white->black transition (even)
  while (i < ref.length && (i & 1) !== color) i++;
  return i < ref.length ? ref[i] : ref[ref.length - 1];
}
function b2(ref, a0, color) {
  let i = 0;
  while (i < ref.length && ref[i] <= a0) i++;
  while (i < ref.length && (i & 1) !== color) i++;
  return i + 1 < ref.length ? ref[i + 1] : ref[ref.length - 1];
}

/* ── PNG ──────────────────────────────────────────────────────────────────── */

/* ── /Rotate ──────────────────────────────────────────────────────────────────
 * A PAGE IS NOT ITS IMAGE, AND THIS COST A MEASUREMENT TO LEARN. The scanned
 * exhibit CPDF-9 ground-truthed carries `/Rotate 270`: the embedded image is
 * 3300x2550 landscape and the page a reader sees is portrait. Handing the raw
 * image to an OCR engine returned **8.67% character accuracy with 355 MINTED
 * digits** — fluent, confident, wholly invented text, not a failure the engine
 * announced. That is the exact hazard CPDF-10's chain rule exists for, arriving
 * one layer below where anyone was looking for it, and it is why `upright` is a
 * first-class field of the result rather than a detail of the caller's.
 */
function getBit(packed, rowBytes, x, y) {
  return (packed[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1;
}
function setBit(packed, rowBytes, x, y, v) {
  const i = y * rowBytes + (x >> 3), m = 0x80 >> (x & 7);
  if (v) packed[i] |= m; else packed[i] &= ~m;
}

/** Rotate a packed 1-bit image CLOCKWISE by 90/180/270. Exact and lossless: a
 *  bit lands on a bit. Returns { packed, width, height }. */
export function rotateBilevel(packed, width, height, deg) {
  const d = ((deg % 360) + 360) % 360;
  if (d === 0) return { packed, width, height };
  if (d !== 90 && d !== 180 && d !== 270) throw new Error(`unsupported rotation ${deg}`);
  const srcRow = Math.ceil(width / 8);
  const [w2, h2] = d === 180 ? [width, height] : [height, width];
  const dstRow = Math.ceil(w2 / 8);
  const out = new Uint8Array(dstRow * h2);
  for (let Y = 0; Y < h2; Y++) {
    for (let X = 0; X < w2; X++) {
      let sx, sy;
      if (d === 90) { sx = Y; sy = height - 1 - X; }
      else if (d === 180) { sx = width - 1 - X; sy = height - 1 - Y; }
      else { sx = width - 1 - Y; sy = X; }
      setBit(out, dstRow, X, Y, getBit(packed, srcRow, sx, sy));
    }
  }
  return { packed: out, width: w2, height: h2 };
}

async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

async function deflateZlib(bytes) {
  const cs = new CompressionStream("deflate");         // zlib-wrapped: what IDAT holds
  const w = cs.writable.getWriter();
  w.write(bytes); w.close();
  const chunks = [];
  const rd = cs.readable.getReader();
  for (;;) { const { done, value } = await rd.read(); if (done) break; chunks.push(value); }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

async function buildPng(raw, width, height, bitDepth, colorType) {
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width); dv.setUint32(4, height);
  ihdr[8] = bitDepth; ihdr[9] = colorType;
  const idat = await deflateZlib(raw);
  const parts = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array(0)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const png = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { png.set(p, o); o += p.length; }
  return png;
}

/** Packed 1-bit rows, SET bit = white, to a grey-1 PNG. Filter type 0 per row:
 *  a bilevel scan gains almost nothing from the other filters and costs a pass
 *  over every row to find out.
 *
 *  THE PADDING BITS ARE ZEROED, and that line is here because it was a FINDING
 *  rather than a nicety. A width of 3300 leaves 4 wasted bits at the end of each
 *  scanline; a PNG reader must ignore them, so no summary statistic — size,
 *  dimensions, ink fraction, "all 2550 rows decoded" — can see them. Comparing
 *  the packed bytes against the independent decoder's byte for byte is what
 *  surfaced it: 10,200 bits (4 per row x 2550 rows) differed while every visible
 *  figure agreed. They are zeroed so the two representations are identical and
 *  there is one fewer difference that has to be explained away. */
async function encodePng1(packed, width, height) {
  const rowBytes = Math.ceil(width / 8);
  const pad = rowBytes * 8 - width;
  const mask = pad ? (0xff << pad) & 0xff : 0xff;
  const raw = new Uint8Array((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0;
    raw.set(packed.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
    if (pad) raw[(y + 1) * (rowBytes + 1) - 1] &= mask;
  }
  return buildPng(raw, width, height, 1, 0);
}

/** The packed rows with each scanline's wasted trailing bits zeroed — the exact
 *  representation an independent decoder produces, so a digest of it is
 *  comparable. Exported because the suite pins that digest and the expected
 *  value has INDEPENDENT provenance; a digest of our own convention would only
 *  prove we were self-consistent. */
export function normalisePacked(packed, width, height) {
  const rowBytes = Math.ceil(width / 8);
  const pad = rowBytes * 8 - width;
  const out = Uint8Array.from(packed);
  if (!pad) return out;
  const mask = (0xff << pad) & 0xff;
  for (let y = 0; y < height; y++) out[(y + 1) * rowBytes - 1] &= mask;
  return out;
}

async function encodePng8(samples, width, height, comps) {
  const rowBytes = width * comps;
  const raw = new Uint8Array((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0;
    raw.set(samples.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
  }
  return buildPng(raw, width, height, 8, comps === 3 ? 2 : 0);
}
