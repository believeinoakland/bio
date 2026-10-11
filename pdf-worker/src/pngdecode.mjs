/* pngdecode.mjs — N853b: a PNG decoder (ISO/IEC 15948, W3C PNG second edition)
 * for a picture file a member sends, so `pdf-pixels` can turn a photographed
 * page into the pixels it renders (image-codecs R10).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT ANSWERS
 * ─────────────────────────────────────────────────────────────────────────────
 * 8-bit samples, interleaved, rows top to bottom: one component for a grey image
 * (colour types 0 and 4), three for every other (2, 3 and 6; a palette is
 * expanded). Every colour type at every depth the standard allows is read, with
 * every filter (0–4). A sample under 8 bits is scaled by bit replication (a
 * 2-bit 3 is 255), a 16-bit one is reduced to its high byte, and transparency
 * (an alpha channel, or a tRNS chunk: a palette's alphas, or the one grey or
 * colour value it names, compared at the image's own depth) is composited over
 * white. Gamma, colour profiles and every other ancillary chunk are not applied.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT "CORRECT" MEANS HERE: THE SAME SAMPLES AS PILLOW, TO THE BIT
 * ─────────────────────────────────────────────────────────────────────────────
 * PNG is lossless, so the samples before compositing have one right answer. The
 * composite is Pillow's own integer arithmetic (`AlphaComposite.c`, 7 bits of
 * precision, its rounded division by 255, an alpha of 0 answered by the white
 * beneath), so an image with transparency is Pillow's `alpha_composite` over
 * opaque white, sample for sample. The suite checks every answer against
 * Pillow's decode of the same bytes over PngSuite, which shares no line with
 * this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT REFUSES, BY NAME (PNG_REFUSES) — never a picture it guessed at
 * ─────────────────────────────────────────────────────────────────────────────
 * An interlaced (Adam7) image, a critical chunk the standard does not define,
 * and a frame whose decode would pass the memory bound, refused from its header
 * before a sample is allocated. Every error thrown is a `PngRefusal` carrying a
 * code:
 *   NOT_A_PNG    the bytes do not begin with the PNG signature
 *   UNSUPPORTED  a feature this decoder does not decode, named in `feature`
 *   TRUNCATED    the data ends before the picture does
 *   CORRUPT      the data contradicts itself or the standard
 *
 * The image data is inflated by the platform's `DecompressionStream("deflate")`
 * and unfiltered row by row as it arrives, so only the output and two rows are
 * ever held; a stream that inflates past the frame is stopped at once.
 */

export class PngRefusal extends Error {
  constructor(code, detail = {}) {
    super(`${code}${detail.feature ? `: ${detail.feature}` : detail.note ? `: ${detail.note}` : ""}`);
    this.code = code;
    this.detail = detail;
  }
}
const unsupported = (feature, extra = {}) => new PngRefusal("UNSUPPORTED", { feature, ...extra });
const corrupt = (note, extra = {}) => new PngRefusal("CORRUPT", { note, ...extra });
const truncated = (note, extra = {}) => new PngRefusal("TRUNCATED", { note, ...extra });

/** Every `feature` an UNSUPPORTED refusal can carry. */
export const PNG_REFUSES = Object.freeze({
  "interlaced": "the image is stored Adam7-interlaced (IHDR interlace method 1), whose seven passes are not reassembled here",
  "an unknown critical chunk": "a chunk the decoder must understand to draw the image (its type's first letter upper-case) is not one the standard defines",
  "an image past the memory bound": "the decode would hold more at once than the memory bound: the 8-bit output, and beside it two rows of the stored image",
});

/* THE MEMORY BOUND, a workload size (N34, D-312), the same figure as the JPEG
 * 2000 decoder's: 61.3 MB is the largest working set measured to complete in a
 * member's isolate (CPDF-15). A decode holds the 8-bit output and two stored
 * rows (the row being unfiltered and the one above it); the compressed input is
 * the caller's, and the inflater's window is a fixed 32 KB. */
const MEMORY_BOUND = 61_300_000;

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/* The depths each colour type allows (Table 11.1), and its channels. */
const DEPTHS = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

/* CRC-32 (ISO 3309, the polynomial 0xEDB88320, reflected), over a chunk's type
 * and data. */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(d, start, end) {
  let c = -1;
  for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

const u32 = (d, p) => ((d[p] << 24) | (d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]) >>> 0;
const u16 = (d, p) => (d[p] << 8) | d[p + 1];
const KNOWN_CRITICAL = new Set(["IHDR", "PLTE", "IDAT", "IEND"]);
const USED_ANCILLARY = new Set(["tRNS"]);

/**
 * The chunks up to IEND: the header, the palette and transparency as they stand
 * before the image data, and the image data's pieces in order. Nothing is
 * copied. A chunk this decoder reads has its CRC checked; an ancillary chunk it
 * skips does not (the standard lets a decoder ignore one).
 */
function readChunks(d) {
  let p = 8, ihdr = null, plte = null, trns = null, ended = false;
  const idat = [];
  while (!ended) {
    if (p + 8 > d.length) throw truncated(`the data ends at byte ${p}, before an IEND chunk`);
    const len = u32(d, p);
    const type = String.fromCharCode(d[p + 4], d[p + 5], d[p + 6], d[p + 7]);
    if (!/^[A-Za-z]{4}$/.test(type)) throw corrupt(`a chunk type that is not four letters at byte ${p}`, { at: p });
    if (len > 0x7fffffff) throw corrupt(`the ${type} chunk declares a length past 2^31 - 1`, { chunk: type });
    if (p + 12 + len > d.length) throw truncated(`the ${type} chunk at byte ${p} runs past the data`, { chunk: type });
    const start = p + 8, end = start + len;
    const critical = (d[p + 4] & 0x20) === 0;
    if (critical || USED_ANCILLARY.has(type)) {
      if (crc32(d, p + 4, end) !== u32(d, end)) throw corrupt(`the ${type} chunk's CRC does not match its data`, { chunk: type, at: p });
    }
    if (critical && !KNOWN_CRITICAL.has(type)) throw unsupported("an unknown critical chunk", { chunk: type });
    if (!ihdr && type !== "IHDR") throw corrupt(`the first chunk is ${type}, not IHDR`, { chunk: type });
    switch (type) {
      case "IHDR":
        if (ihdr) throw corrupt("a second IHDR chunk");
        ihdr = readIhdr(d, start, len);
        break;
      case "PLTE":
        if (!idat.length) plte = d.subarray(start, end);
        break;
      case "tRNS":
        if (!idat.length) trns = d.subarray(start, end);
        break;
      case "IDAT":
        if (len) idat.push(d.subarray(start, end));
        else if (!idat.length) idat.empty = true;
        break;
      case "IEND":
        ended = true;
        break;
      default:
        break;
    }
    p = end + 4;
  }
  if (!idat.length) throw corrupt(idat.empty ? "the IDAT chunks hold no data" : "no IDAT chunk");
  return { ihdr, plte, trns, idat };
}

function readIhdr(d, p, len) {
  if (len !== 13) throw corrupt(`an IHDR of ${len} bytes, not 13`);
  const h = { width: u32(d, p), height: u32(d, p + 4), depth: d[p + 8], colourType: d[p + 9],
              compression: d[p + 10], filter: d[p + 11], interlace: d[p + 12] };
  if (!h.width || !h.height || h.width > 0x7fffffff || h.height > 0x7fffffff)
    throw corrupt(`an image of ${h.width}x${h.height}`, { width: h.width, height: h.height });
  if (!(h.colourType in DEPTHS)) throw corrupt(`colour type ${h.colourType}`, { colour_type: h.colourType });
  if (!DEPTHS[h.colourType].includes(h.depth))
    throw corrupt(`bit depth ${h.depth} with colour type ${h.colourType}`, { colour_type: h.colourType, bit_depth: h.depth });
  if (h.compression !== 0) throw corrupt(`compression method ${h.compression}`);
  if (h.filter !== 0) throw corrupt(`filter method ${h.filter}`);
  if (h.interlace > 1) throw corrupt(`interlace method ${h.interlace}`);
  return h;
}

/** Pillow's `alpha_composite` of one sample `c` at alpha `a` over opaque white
 *  (`AlphaComposite.c`: its coefficients reduce to a·128 and (255-a)·128 when
 *  the destination is opaque; SHIFTFORDIV255 is its division by 255). */
function overWhite(c, a) {
  if (a === 0) return 255;
  const t = (c * a + 255 * (255 - a)) * 128 + 16384;
  return (((t >> 8) + t) >> 8) >> 7;
}

/* The scale bit replication gives a sample of each depth under 8. */
const SCALE = { 1: 255, 2: 85, 4: 17, 8: 1 };

/**
 * Decode a PNG file. Returns a Promise of `{ width, height, comps, samples,
 * detail }`: `samples` interleaved 8-bit, `comps` 1 (grey) or 3, `detail` naming
 * the stored image (`colour_type`, `bit_depth`, `transparency`). Rejects with a
 * `PngRefusal`.
 */
export async function decodePng(bytes) {
  const d = bytes;
  if (!(d instanceof Uint8Array) || d.length < 8 || SIGNATURE.some((b, i) => d[i] !== b))
    throw new PngRefusal("NOT_A_PNG", { note: "the bytes do not begin with the PNG signature" });
  const { ihdr, plte, trns, idat } = readChunks(d);
  const { width: W, height: H, depth, colourType } = ihdr;
  if (ihdr.interlace === 1) throw unsupported("interlaced", { width: W, height: H });

  const ch = CHANNELS[colourType];
  const comps = colourType === 0 || colourType === 4 ? 1 : 3;
  const rowBytes = Math.ceil((W * ch * depth) / 8);
  const need = W * H * comps + 2 * (rowBytes + 1);
  if (need > MEMORY_BOUND)
    throw unsupported("an image past the memory bound", { working_set_bytes: need, bound_bytes: MEMORY_BOUND, width: W, height: H, components: comps });

  /* The palette and transparency, as the colour type reads them. */
  let palette = null, alphaOf = null, key = null, transparency = colourType === 4 || colourType === 6 ? "alpha channel" : null;
  if (colourType === 3) {
    if (!plte) throw corrupt("a palette image with no PLTE chunk before its image data");
    if (!plte.length || plte.length % 3 || plte.length > 768) throw corrupt(`a PLTE of ${plte.length} bytes`);
    palette = plte;
    alphaOf = new Uint8Array(256).fill(255);
    if (trns) { alphaOf.set(trns.subarray(0, Math.min(trns.length, plte.length / 3))); transparency = "tRNS"; }
  } else if (trns && colourType === 0 && trns.length === 2) {
    key = [u16(trns, 0)]; transparency = "tRNS";
  } else if (trns && colourType === 2 && trns.length === 6) {
    key = [u16(trns, 0), u16(trns, 2), u16(trns, 4)]; transparency = "tRNS";
  }
  const entries = palette ? palette.length / 3 : 0;

  const out = new Uint8Array(W * H * comps);
  const bpp = Math.max(1, (ch * depth) >> 3);
  let cur = new Uint8Array(rowBytes + 1), prev = new Uint8Array(rowBytes + 1);
  let fill = 0, y = 0;

  /** Unfilter the row in `cur` (filter byte first) against `prev`, and write it out. */
  const emit = () => {
    const f = cur[0], r = cur, q = prev, n = rowBytes + 1;
    if (f === 1) { for (let i = 1 + bpp; i < n; i++) r[i] = (r[i] + r[i - bpp]) & 0xff; }
    else if (f === 2) { for (let i = 1; i < n; i++) r[i] = (r[i] + q[i]) & 0xff; }
    else if (f === 3) {
      for (let i = 1; i < n; i++) r[i] = (r[i] + ((i > bpp ? r[i - bpp] : 0) + q[i] >> 1)) & 0xff;
    } else if (f === 4) {
      for (let i = 1; i < n; i++) {
        const a = i > bpp ? r[i - bpp] : 0, b = q[i], c = i > bpp ? q[i - bpp] : 0;
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        r[i] = (r[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
    } else if (f !== 0) throw corrupt(`filter type ${f} in row ${y}`, { row: y, filter: f });
    writeRow(r, y);
    [cur, prev] = [prev, cur];
    y++;
  };

  const writeRow = (r, row) => {
    let o = row * W * comps;
    if (depth < 8) {
      const mask = (1 << depth) - 1, scale = SCALE[depth];
      for (let x = 0; x < W; x++) {
        const bit = x * depth, v = (r[1 + (bit >> 3)] >> (8 - depth - (bit & 7))) & mask;
        if (colourType === 3) o = paletteOut(v, o);
        else out[o++] = key && v === key[0] ? 255 : v * scale;
      }
      return;
    }
    const wide = depth === 16, s = wide ? 2 : 1;
    for (let x = 0, i = 1; x < W; x++, i += ch * s) {
      switch (colourType) {
        case 0: out[o++] = key && (wide ? u16(r, i) : r[i]) === key[0] ? 255 : r[i]; break;
        case 3: o = paletteOut(r[i], o); break;
        case 4: out[o++] = overWhite(r[i], r[i + s]); break;
        case 2:
          if (key && (wide ? u16(r, i) === key[0] && u16(r, i + 2) === key[1] && u16(r, i + 4) === key[2]
            : r[i] === key[0] && r[i + 1] === key[1] && r[i + 2] === key[2])) { out[o++] = 255; out[o++] = 255; out[o++] = 255; }
          else { out[o++] = r[i]; out[o++] = r[i + s]; out[o++] = r[i + 2 * s]; }
          break;
        default: {
          const a = r[i + 3 * s];
          out[o++] = overWhite(r[i], a); out[o++] = overWhite(r[i + s], a); out[o++] = overWhite(r[i + 2 * s], a);
        }
      }
    }
  };

  const paletteOut = (v, o) => {
    if (v >= entries) throw corrupt(`palette index ${v} past the palette's ${entries} entries`, { index: v, entries });
    const a = alphaOf[v], p = 3 * v;
    out[o] = overWhite(palette[p], a); out[o + 1] = overWhite(palette[p + 1], a); out[o + 2] = overWhite(palette[p + 2], a);
    return o + 3;
  };

  /* Inflate, feeding the rows as the bytes arrive. */
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter(), reader = ds.readable.getReader();
  let extra = 0;
  const writing = (async () => {
    for (const part of idat) await writer.write(part);
    await writer.close();
  })();
  writing.catch(() => {});
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      let i = 0;
      while (i < value.length) {
        if (y === H) { extra += value.length - i; break; }
        const take = Math.min(value.length - i, rowBytes + 1 - fill);
        cur.set(value.subarray(i, i + take), fill);
        fill += take; i += take;
        if (fill === rowBytes + 1) { fill = 0; emit(); }
      }
      if (extra) break;
    }
  } catch (e) {
    if (e instanceof PngRefusal) { reader.cancel().catch(() => {}); throw e; }
    /* The inflater refused the zlib stream: damaged, cut inside well-formed
     * chunks, or (once the frame is complete) its Adler-32 wrong, missing or
     * followed by junk. Which of these it was is said only in the inflater's own
     * words, which differ between platforms, so all are CORRUPT here; a file cut
     * short is TRUNCATED by its chunks, and a whole stream of too few rows below. */
    const why = String((e && e.message) || (e && e.code) || e);
    throw corrupt(y < H ? `the image data does not inflate (row ${y} of ${H})` : "the image data's zlib trailer is damaged or missing",
      { rows: y, height: H, inflater: why });
  }
  if (extra) {
    reader.cancel().catch(() => {});
    throw corrupt("the image data inflates past the frame", { height: H, row_bytes: rowBytes });
  }
  if (y < H) throw truncated(`the image data ends after ${y} of ${H} rows`, { rows: y, height: H });
  return { width: W, height: H, comps, samples: out, detail: { colour_type: colourType, bit_depth: depth, transparency } };
}
