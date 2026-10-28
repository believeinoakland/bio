/* image-cover tests: hostile photographs for the photo reader (R13), built byte by byte from their declaration. */
import { deflateSync } from "node:zlib";
import { fixture } from "./answers.mjs";
import { pngChunk } from "./hostile.mjs";

const be16 = (v) => [(v >> 8) & 255, v & 255];
const be32 = (v) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
export const ascii = (s) => [...s].map((c) => c.charCodeAt(0));

/** A big-endian TIFF. `entries` are `{tag, type, count, value}`: `value` bytes are placed in the data area (or inline when four
 *  or fewer), or `raw` gives the four bytes of the value/offset field as they are (a lie). `next` is IFD0's next-IFD offset,
 *  `sub` the entries of an Exif IFD, `gps` of a GPS IFD. Offsets are real. */
export function tiff({ ifd0 = [], sub = null, gps = null, next = 0, selfPoint = false } = {}) {
  const dirSize = (es) => 2 + 12 * es.length + 4;
  const pointers = (sub ? 1 : 0) + (gps ? 1 : 0);
  let at = 8;
  const at0 = at; at += dirSize(ifd0) + 12 * pointers;
  const atSub = sub ? at : 0; if (sub) at += dirSize(sub);
  const atGps = gps ? at : 0; if (gps) at += dirSize(gps);
  const data = [];
  let dataAt = at + 0;
  const place = (es) => es.map((e) => {
    if (e.raw) return { ...e, field: e.raw };
    if (e.value.length <= 4) return { ...e, field: [...e.value, 0, 0, 0, 0].slice(0, 4) };
    const off = dataAt; for (const b of e.value) data.push(b); dataAt += e.value.length;
    return { ...e, field: be32(off) };
  });
  const sizes = [ifd0, sub, gps].filter(Boolean);
  // directories first, so the data area starts after all of them
  const dirs = (es, ptrs) => {
    const all = [...es, ...ptrs].sort((a, b) => a.tag - b.tag);
    return all;
  };
  const ptrs0 = [];
  if (sub) ptrs0.push({ tag: 0x8769, type: 4, count: 1, raw: be32(selfPoint ? 8 : atSub) });
  if (gps) ptrs0.push({ tag: 0x8825, type: 4, count: 1, raw: be32(atGps) });
  const written = [];
  const write = (es, nextIfd) => {
    const placed = place(es);
    const out = [...be16(es.length)];
    for (const e of placed) out.push(...be16(e.tag), ...be16(e.type), ...be32(e.count ?? e.value.length), ...e.field);
    out.push(...be32(nextIfd));
    written.push(out);
  };
  write(dirs(ifd0, ptrs0), selfPoint ? 8 : next);
  if (sub) write(dirs(sub, []), 0);
  if (gps) write(dirs(gps, []), 0);
  void sizes;
  return Uint8Array.from([...ascii("MM"), 0, 42, ...be32(8), ...written.flat(), ...data]);
}

export const asc = (tag, s) => ({ tag, type: 2, value: [...ascii(s), 0] });
export const short = (tag, v) => ({ tag, type: 3, count: 1, value: [...be16(v), 0, 0] });
export const rationals = (tag, ...pairs) => ({ tag, type: 5, count: pairs.length, value: pairs.flatMap(([n, d]) => [...be32(n), ...be32(d)]) });

/** A JPEG: `photo-bare.jpg` with an APP1 segment after SOI. */
export function jpegWithApp1(body) {
  const base = fixture("photo-bare.jpg");
  const seg = [0xff, 0xe1, ...be16(body.length + 2), ...body];
  return Uint8Array.from([...base.subarray(0, 2), ...seg, ...base.subarray(2)]);
}
export const jpegWithExif = (t) => jpegWithApp1([...ascii("Exif"), 0, 0, ...t]);

/** A PNG: `photo-bare.png` with chunks inserted before the first IDAT. */
export function pngWithChunks(chunks) {
  const base = fixture("photo-bare.png");
  let p = 8;
  while (String.fromCharCode(...base.subarray(p + 4, p + 8)) !== "IDAT") p += 12 + new DataView(base.buffer, base.byteOffset + p).getUint32(0);
  return Uint8Array.from([...base.subarray(0, p), ...chunks.flat(), ...base.subarray(p)]);
}
export const pngWithExif = (t) => pngWithChunks([pngChunk("eXIf", [...t])]);
export const textChunk = (kw, text) => pngChunk("tEXt", [...ascii(kw), 0, ...text]);
export const ztxtChunk = (kw, raw) => pngChunk("zTXt", [...ascii(kw), 0, 0, ...deflateSync(raw)]);
export const iccpChunk = (profileBytes) => pngChunk("iCCP", [...ascii("ICC"), 0, 0, ...deflateSync(profileBytes)]);
