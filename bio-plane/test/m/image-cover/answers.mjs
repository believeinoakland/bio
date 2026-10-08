/* image-cover's tests: reading an answer back, independently of the module.
 *
 * A JPEG answer is decoded by image-codecs' `decodeBaselineJpeg`, bit-exact with libjpeg-turbo (its R1, checked by
 * its own R6), and a PNG answer by node's zlib and the PNG standard's unfiltering, here; each is turned as its own
 * EXIF orientation says, as the reference (`ImageOps.exif_transpose`) turned the original. The structure walks read
 * every segment or chunk the answer holds, so the R2 tests can say exactly what is there. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { decodeBaselineJpeg } from "../../../../pdf-worker/src/dctdecode.mjs";

const DIR = new URL("./fixtures/", import.meta.url);
export const fixture = (name) => new Uint8Array(readFileSync(new URL(name, DIR)));
export const CASES = JSON.parse(readFileSync(new URL("cases.json", DIR), "utf8"));

/** Every segment of a JPEG answer, in order: `{marker, body}`, then the scan's data with its RSTn markers, then
 *  what follows EOI (which must be nothing). */
export function jpegSegments(d) {
  if (d[0] !== 0xff || d[1] !== 0xd8) throw new Error("no SOI");
  const segs = [];
  let p = 2;
  for (;;) {
    if (d[p] !== 0xff) throw new Error(`no marker at ${p}`);
    const m = d[p + 1], len = (d[p + 2] << 8) | d[p + 3];
    segs.push({ marker: m, body: d.subarray(p + 4, p + 2 + len) });
    p += 2 + len;
    if (m === 0xda) break;
  }
  const rst = [];
  for (; p < d.length - 1; p++) {
    if (d[p] !== 0xff) continue;
    const n = d[p + 1];
    if (n === 0) { p++; continue; }
    if (n >= 0xd0 && n <= 0xd7) { rst.push(n - 0xd0); p++; continue; }
    if (n === 0xd9) return { segs, rst, after: d.subarray(p + 2) };
    throw new Error(`marker 0x${n.toString(16)} inside the scan`);
  }
  throw new Error("no EOI");
}

/** Every chunk of a PNG answer, then what follows IEND. */
export function pngChunks(d) {
  const chunks = [];
  let p = 8;
  for (;;) {
    const len = new DataView(d.buffer, d.byteOffset + p).getUint32(0);
    const type = String.fromCharCode(...d.subarray(p + 4, p + 8));
    chunks.push({ type, body: d.subarray(p + 8, p + 8 + len) });
    p += 12 + len;
    if (type === "IEND") return { chunks, after: d.subarray(p) };
  }
}

/** The orientation an EXIF TIFF block holds, and every tag of its IFD0, and its next-IFD offset. */
export function tiffIfd0(t) {
  const le = t[0] === 0x49;
  const dv = new DataView(t.buffer, t.byteOffset, t.length);
  const u16 = (p) => dv.getUint16(p, le), u32 = (p) => dv.getUint32(p, le);
  const at = u32(4), n = u16(at), tags = {};
  for (let i = 0; i < n; i++) { const e = at + 2 + 12 * i; tags[u16(e)] = { type: u16(e + 2), count: u32(e + 4), value: u16(e + 8) }; }
  return { tags, next: u32(at + 2 + 12 * n), magic: u16(2) };
}

/** Stored samples to displayed, as EXIF orientation `o` says: displayed (dx, dy) takes stored toStored(dx, dy). */
function orient(samples, W, H, n, o) {
  if (o === 1) return { samples, width: W, height: H };
  const [DW, DH] = o >= 5 ? [H, W] : [W, H];
  const out = new Uint8Array(samples.length);
  for (let dy = 0; dy < DH; dy++) for (let dx = 0; dx < DW; dx++) {
    const [sx, sy] = ({ 2: [W - 1 - dx, dy], 3: [W - 1 - dx, H - 1 - dy], 4: [dx, H - 1 - dy], 5: [dy, dx],
      6: [dy, H - 1 - dx], 7: [W - 1 - dy, H - 1 - dx], 8: [W - 1 - dy, dx] })[o];
    for (let k = 0; k < n; k++) out[(dy * DW + dx) * n + k] = samples[(sy * W + sx) * n + k];
  }
  return { samples: out, width: DW, height: DH };
}

const exifOrientationJpeg = (d) => {
  const app1 = jpegSegments(d).segs.find((s) => s.marker === 0xe1);
  return app1 ? tiffIfd0(app1.body.subarray(6)).tags[0x0112]?.value ?? 1 : 1;
};

/** A JPEG answer decoded and turned upright: `{samples, width, height, comps}` (L or RGB). */
export function decodeJpegAnswer(d) {
  const o = decodeBaselineJpeg(d);
  return { ...orient(o.samples, o.width, o.height, o.comps, exifOrientationJpeg(d)), comps: o.comps };
}

/** A PNG answer decoded to RGBA and turned upright (8-bit, non-interlaced: the only kind the module writes). */
export function decodePngAnswer(d) {
  const { chunks } = pngChunks(d);
  const ih = chunks[0].body, dv = new DataView(ih.buffer, ih.byteOffset);
  const W = dv.getUint32(0), H = dv.getUint32(4), ct = ih[9];
  const bpp = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct], stride = W * bpp;
  const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.body)));
  const plte = chunks.find((c) => c.type === "PLTE")?.body, trns = chunks.find((c) => c.type === "tRNS")?.body;
  const exif = chunks.find((c) => c.type === "eXIf");
  const rgba = new Uint8Array(W * H * 4);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < H; y++) {
    const t = raw[y * (stride + 1)], row = Uint8Array.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      row[i] = (row[i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][t]) & 255;
    }
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4, s = x * bpp;
      let px;
      if (ct === 6) px = [row[s], row[s + 1], row[s + 2], row[s + 3]];
      else if (ct === 4) px = [row[s], row[s], row[s], row[s + 1]];
      else if (ct === 2) px = [row[s], row[s + 1], row[s + 2], 255];
      else if (ct === 0) px = [row[s], row[s], row[s], 255];
      else { const i = row[s]; px = [plte[3 * i], plte[3 * i + 1], plte[3 * i + 2], trns && i < trns.length ? trns[i] : 255]; }
      rgba.set(px, o);
    }
    prev = row;
  }
  return { ...orient(rgba, W, H, 4, exif ? tiffIfd0(exif.body).tags[0x0112]?.value ?? 1 : 1), comps: 4 };
}

/** The reference's comparison: the decode with every pixel the cover may change (each cover rectangle, grown by
 *  the chroma bleed) set to zero, hashed; and whether each pixel inside every rectangle (shrunk by it) is the cover. */
export function judge(img, c) {
  const { samples, width, height, comps } = img;
  const g = c.bleed, a = Uint8Array.from(samples);
  let inside = 0, wrong = 0;
  for (const [x0, y0, x1, y1] of c.cover_rects) {
    for (let y = Math.max(0, y0 - g); y < Math.min(height, y1 + g); y++)
      for (let x = Math.max(0, x0 - g); x < Math.min(width, x1 + g); x++) {
        const o = (y * width + x) * comps;
        if (y >= y0 + g && y < y1 - g && x >= x0 + g && x < x1 - g) {
          inside++;
          for (let k = 0; k < comps; k++) if (samples[o + k] !== c.cover[k]) { wrong++; break; }
        }
        a.fill(0, o, o + comps);
      }
  }
  return { width, height, outside_sha256: createHash("sha256").update(a).digest("hex"), inside, wrong };
}
