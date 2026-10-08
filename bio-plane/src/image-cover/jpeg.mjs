/* image-cover: the JPEG path, in the DCT domain (R1, R2, R4).
 *
 * The photo is never decoded to pixels. Its entropy-coded data is read one MCU at a time into quantised
 * coefficients; each block of an MCU an area touches is replaced by a DC-only block of the cover colour (every AC
 * coefficient zero), every other block is kept coefficient for coefficient; and the coefficients are Huffman-coded
 * again into a fresh container that holds the frame, its tables and the scan, and nothing else. Two passes over the
 * data: the first counts the symbols the covered stream needs and builds optimal tables from them (jchuff.c's
 * `jpeg_gen_optimal_table`; a phone's own optimised tables may lack the symbols a cover's DC differences need), the
 * second writes. Neither pass holds more than one block of coefficients, so the working set is the photo's bytes
 * and the answer's (R4).
 *
 * WHY WHOLE MCUs. With subsampled chroma one chroma block spans the pixels of several luma blocks; covering only
 * the luma blocks an area touches would leave a band of original luma under a flat chroma block, and covering only
 * the chroma would leave the face's luma. So the cover is snapped outward to the MCU: every block of every
 * component in an MCU an area touches is covered, and luma and chroma cover the same pixels.
 *
 * THE COLOUR. Black: each luma (or each component, for a file not in YCbCr) gets the DC value whose dequantised
 * level lies deep in the decoder's saturating range, so any IDCT, exact or fast, answers 0; chroma gets DC 0,
 * which every decoder answers as 128. A covered pixel decodes to (0, 0, 0) in every decoder; only the one pixel
 * row or column on each side of a covered MCU edge mixes chroma with its neighbour under fancy upsampling. */
import { readJpegHeader, colourTransformOf, DctRefusal } from "../../../pdf-worker/src/dctdecode.mjs";
import { CoverRefusal, checkPixels, storedRects, displayedSize, mergeSpans, orientationOf, orientationTiff } from "./geometry.mjs";

const SOF_MARKER = { baseline: 0xc0, "extended-sequential-huffman": 0xc1 };

/* The image-codecs refusal codes (its R1, R7) as this module's (R3): data that ends early is TRUNCATED_IMAGE_DATA,
 * data that cannot be read IMAGE_DATA_CORRUPT (K2173), each detail naming the fault. */
function fromDct(e) {
  if (!(e instanceof DctRefusal)) throw e;
  const note = [e.detail?.process, e.detail?.precision && `precision ${e.detail.precision}`, e.detail?.note]
    .filter(Boolean).join("; ");
  if (e.code === "NOT_A_JPEG") return new CoverRefusal("NOT_A_COVERABLE_FORMAT", `not a JPEG${note ? `: ${note}` : ""}`);
  if (e.code === "TRUNCATED")
    return new CoverRefusal("TRUNCATED_IMAGE_DATA", `the JPEG data ends before the image does${note ? `: ${note}` : ""}`);
  if (e.code === "CORRUPT_DATA")
    return new CoverRefusal("IMAGE_DATA_CORRUPT", `the JPEG data cannot be read${note ? `: ${note}` : ""}`);
  return new CoverRefusal("UNSUPPORTED_JPEG_PROCESS", `this JPEG's coding is not covered (${e.code}${note ? `: ${note}` : ""}); only baseline or extended-sequential Huffman, 8-bit, one scan, grey or three components`);
}

/** The orientation of the first EXIF APP1 before the scan; 1 when there is none. */
function exifOrientation(d) {
  let p = 2;
  while (p + 4 <= d.length) {
    while (p < d.length && d[p] !== 0xff) p++;
    while (p < d.length && d[p] === 0xff) p++;
    if (p + 2 >= d.length) return 1;
    const m = d[p++];
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) continue;
    if (m === 0xd9 || m === 0xda) return 1;
    const len = (d[p] << 8) | d[p + 1];
    if (m === 0xe1 && len >= 8 && d[p + 2] === 0x45 && d[p + 3] === 0x78 && d[p + 4] === 0x69 && d[p + 5] === 0x66 && d[p + 6] === 0 && d[p + 7] === 0)
      return orientationOf(d.subarray(p + 8, Math.min(d.length, p + len)));
    p += len;
  }
  return 1;
}

/* ── reading the entropy-coded data (libjpeg's rules, as image-codecs' decoder keeps them) ── */
class BitReader {
  constructor(d, at) { this.d = d; this.p = at; this.acc = 0; this.n = 0; this.marker = null; this.fed0 = 0; }
  fill() {
    while (this.n <= 24) {
      let b = 0;
      if (this.marker === null && this.p < this.d.length) {
        b = this.d[this.p];
        if (b === 0xff) {
          let q = this.p + 1;
          while (q < this.d.length && this.d[q] === 0xff) q++;
          const nx = q < this.d.length ? this.d[q] : 0xd9;
          if (nx === 0) this.p = q + 1;
          else { this.marker = nx; this.p = q + 1; b = 0; this.fed0++; }
        } else this.p++;
      } else { b = 0; this.fed0++; }
      this.acc = ((this.acc << 8) | b) >>> 0;
      this.n += 8;
    }
  }
  bits(k) {
    if (k === 0) return 0;
    if (this.n < k) this.fill();
    this.n -= k;
    return (this.acc >>> this.n) & ((1 << k) - 1);
  }
  decode(h) {
    if (this.n < 16) this.fill();
    const f = h.fast[(this.acc >>> (this.n - h.FAST)) & ((1 << h.FAST) - 1)];
    if (f >= 0) { this.n -= f >> 8; return f & 0xff; }
    let code = this.bits(h.FAST), l = h.FAST;
    for (;;) {
      code = (code << 1) | this.bits(1);
      if (++l > 16) throw new DctRefusal("CORRUPT_DATA", { note: "a Huffman code longer than 16 bits" });
      if (h.maxcode[l] >= 0 && code <= h.maxcode[l]) return h.symbols[h.valptr[l] + code - h.mincode[l]];
    }
  }
  extend(s) {
    if (s === 0) return 0;
    const v = this.bits(s);
    return v < 1 << (s - 1) ? v - (1 << s) + 1 : v;
  }
  /** Bits handed out that were not in the stream: any at all means the data ran out. */
  fabricated() { return Math.max(0, this.fed0 * 8 - this.n); }
  restart() {
    this.acc = 0; this.n = 0; this.fed0 = 0;
    if (this.marker === null) {
      let q = this.p;
      while (q < this.d.length && this.d[q] !== 0xff) q++;
      while (q < this.d.length && this.d[q] === 0xff) q++;
      if (q < this.d.length) { this.marker = this.d[q]; this.p = q + 1; }
    }
    const m = this.marker;
    if (m !== null && m >= 0xd0 && m <= 0xd7) this.marker = null;
    return m;
  }
}

/* ── writing ──────────────────────────────────────────────────────────────── */
class ByteSink {
  constructor(cap) { this.buf = new Uint8Array(Math.max(1024, cap)); this.n = 0; this.acc = 0; this.nb = 0; }
  grow(k) {
    if (this.n + k <= this.buf.length) return;
    const b = new Uint8Array(Math.max(this.n + k, Math.ceil(this.buf.length * 1.5)));
    b.set(this.buf.subarray(0, this.n));
    this.buf = b;
  }
  bytes(a) { this.grow(a.length); this.buf.set(a, this.n); this.n += a.length; }
  segment(marker, body) {
    this.grow(body.length + 4);
    const b = this.buf;
    b[this.n++] = 0xff; b[this.n++] = marker; b[this.n++] = (body.length + 2) >> 8; b[this.n++] = (body.length + 2) & 0xff;
    b.set(body, this.n); this.n += body.length;
  }
  /** Append `size` (<= 16) bits, stuffing a zero byte after every 0xFF. */
  put(code, size) {
    this.acc = ((this.acc << size) | (code & ((1 << size) - 1))) >>> 0;
    this.nb += size;
    while (this.nb >= 8) {
      const v = (this.acc >>> (this.nb - 8)) & 0xff;
      if (this.n + 2 > this.buf.length) this.grow(2);
      this.buf[this.n++] = v;
      if (v === 0xff) this.buf[this.n++] = 0;
      this.nb -= 8;
    }
    this.acc &= (1 << this.nb) - 1;
  }
  /** Pad the last byte with one bits (T.81 F.1.2.3). */
  align() { if (this.nb > 0) this.put((1 << (8 - this.nb)) - 1, 8 - this.nb); }
}

/** Optimal code lengths for the counted symbols, limited to 16 bits: jchuff.c's `jpeg_gen_optimal_table` (T.81
 *  K.2), with its reserved all-ones code. Returns `{counts[16], symbols, code[256], size[256]}`. */
export function optimalTable(freqIn) {
  const freq = new Float64Array(257);
  freq.set(freqIn.subarray(0, 256));
  freq[256] = 1;
  const codesize = new Int32Array(257), others = new Int32Array(257).fill(-1);
  for (;;) {
    let c1 = -1, c2 = -1, v = Infinity;
    for (let i = 0; i <= 256; i++) if (freq[i] && freq[i] <= v) { v = freq[i]; c1 = i; }
    v = Infinity;
    for (let i = 0; i <= 256; i++) if (freq[i] && freq[i] <= v && i !== c1) { v = freq[i]; c2 = i; }
    if (c2 < 0) break;
    freq[c1] += freq[c2]; freq[c2] = 0;
    codesize[c1]++;
    while (others[c1] >= 0) { c1 = others[c1]; codesize[c1]++; }
    others[c1] = c2;
    codesize[c2]++;
    while (others[c2] >= 0) { c2 = others[c2]; codesize[c2]++; }
  }
  const bits = new Int32Array(33);
  for (let i = 0; i <= 256; i++) if (codesize[i]) bits[codesize[i]]++;
  for (let i = 32; i > 16; i--) {
    while (bits[i] > 0) {
      let j = i - 2;
      while (bits[j] === 0) j--;
      bits[i] -= 2; bits[i - 1]++; bits[j + 1] += 2; bits[j]--;
    }
  }
  let i = 16;
  while (bits[i] === 0) i--;
  bits[i]--;                                             // the reserved code
  const symbols = [];
  for (let l = 1; l <= 32; l++) for (let s = 0; s < 256; s++) if (codesize[s] === l) symbols.push(s);
  const counts = Array.from(bits.subarray(1, 17));
  const code = new Int32Array(256), size = new Int32Array(256);
  let c = 0, k = 0;
  for (let l = 1; l <= 16; l++) {
    for (let n = 0; n < counts[l - 1]; n++, k++) { code[symbols[k]] = c++; size[symbols[k]] = l; }
    c <<= 1;
  }
  return { counts, symbols: symbols.slice(0, k), code, size };
}

const category = (v) => { let a = v < 0 ? -v : v, s = 0; while (a) { s++; a >>= 1; } return s; };

/* The DC value of a component's cover block: the dequantised level that libjpeg's ISLOW (and any IDCT that clamps)
 * answers as `target`. For target 0 the value is chosen deep in the saturating range (level about -256, not the
 * edge at -128), so a fast or float IDCT's rounding cannot lift it off 0; but never so deep that the difference
 * from a neighbour's legal DC (at most 1024 / q0) passes the 8-bit limit of 2047, which only a DC quantiser of 1
 * (quality 100) reaches, and there the level is -128, still 0. */
function coverDc(q0, target) {
  const level = (dc) => { const v = Math.floor((dc * q0 + 4) / 8) & 1023; return v < 512 ? v : v - 1024; };
  const pixel = (dc) => Math.max(0, Math.min(255, level(dc) + 128));
  if (target === 128) return 0;
  let best = 0, bestScore = Infinity;
  for (let dc = 0, lb = -2047 + Math.ceil(1024 / q0); dc >= lb; dc--) {
    const score = pixel(dc) === 0 ? Math.abs(level(dc) + 256) : 1e6 + pixel(dc);
    if (score < bestScore) { best = dc; bestScore = score; }
  }
  return best;
}

/** Cover a baseline JPEG. `d` is the whole file; `areas` are already shape-checked. */
export function coverJpeg(d, areas, maxPixels) {
  let h;
  try { h = readJpegHeader(d); } catch (e) { throw fromDct(e); }
  const { frame, qt, hts, scan } = h;
  const nc = frame.comps.length;
  const refuse = (note) => fromDct(new DctRefusal("UNSUPPORTED_PROCESS", { note }));
  if (nc !== 1 && nc !== 3) throw refuse(`${nc} components`);
  if (scan.comps.length !== nc) throw refuse(`multi-scan sequential: ${scan.comps.length} of ${nc} components in the first scan`);
  const hmax = Math.max(...frame.comps.map((c) => c.h)), vmax = Math.max(...frame.comps.map((c) => c.v));
  for (const c of frame.comps) {
    const hx = hmax / c.h, vx = vmax / c.v;
    if (!(c.h >= 1 && c.v >= 1 && (hx === 1 || hx === 2) && (vx === 1 || vx === 2)))
      throw refuse(`sampling ${frame.comps.map((x) => `${x.h}x${x.v}`).join(",")}`);
  }
  const ycc = nc === 3 && colourTransformOf(h).ycc;
  const single = nc === 1;
  const comps = frame.comps.map((c, i) => {
    const sc = scan.comps.find((s) => s.id === c.id);
    if (!sc || !hts.dc[sc.td] || !hts.ac[sc.ta] || !qt[c.tq])
      throw fromDct(new DctRefusal("CORRUPT_DATA", { note: `a table is missing for component ${c.id}` }));
    return {
      id: c.id, tq: c.tq, h: single ? 1 : c.h, v: single ? 1 : c.v, sh: c.h, sv: c.v,
      dc: hts.dc[sc.td], ac: hts.ac[sc.ta], cls: i === 0 ? 0 : 1,
      cover: coverDc(qt[c.tq][0], ycc && i > 0 ? 128 : 0),
    };
  });
  const W = frame.width, H = frame.height;
  checkPixels(W, H, maxPixels);
  const mw = single ? 8 : 8 * hmax, mh = single ? 8 : 8 * vmax;   // one MCU's pixels
  const mcux = Math.ceil(W / mw), mcuy = Math.ceil(H / mh);
  const orientation = exifOrientation(d);
  const rects = storedRects(areas, W, H, orientation)
    .map(([x0, y0, x1, y1]) => [Math.floor(x0 / mw), Math.floor(y0 / mh), Math.floor((x1 - 1) / mw) + 1, Math.floor((y1 - 1) / mh) + 1]);
  const spansOf = (my) => mergeSpans(rects.filter((r) => r[1] <= my && my < r[3]).map((r) => [r[0], r[2]]));
  const blocksPerMcu = comps.reduce((n, c) => n + c.h * c.v, 0);
  const order = scan.comps.map((s) => comps.findIndex((c) => c.id === s.id));   // an MCU's blocks, in the scan's order

  const zz = new Int32Array(64);
  /* One pass over the data: read every block, cover the MCUs in `spans`, and hand each block's coefficients (in
   * zig-zag order) to `emit`. Throws on data that runs out or does not read. */
  const walk = (emit, restartAt) => {
    const br = new BitReader(d, scan.dataAt);
    const pred = new Int32Array(nc);
    let left = h.restart, expect = 0, covered = 0;
    for (let my = 0; my < mcuy; my++) {
      const spans = spansOf(my);
      let si = 0;
      for (let mx = 0; mx < mcux; mx++) {
        if (h.restart) {
          if (left === 0) {
            if (br.fabricated()) throw new DctRefusal("TRUNCATED", { note: "a restart interval's data ended before its last MCU" });
            const m = br.restart();
            if (m !== 0xd0 + expect) throw new DctRefusal("CORRUPT_DATA", { note: `expected RST${expect}, found ${m === null ? "none" : `0x${m.toString(16)}`}` });
            expect = (expect + 1) & 7;
            left = h.restart;
            pred.fill(0);
            restartAt();
          }
          left--;
        }
        while (si < spans.length && spans[si][1] <= mx) si++;
        const cover = si < spans.length && spans[si][0] <= mx;
        if (cover) covered += blocksPerMcu;
        for (const ci of order) {
          const c = comps[ci];
          for (let n = c.h * c.v; n > 0; n--) {
            zz.fill(0);
            pred[ci] += br.extend(br.decode(c.dc));
            zz[0] = (pred[ci] << 16) >> 16;
            for (let k = 1; k < 64;) {
              const rs = br.decode(c.ac), r = rs >> 4, s = rs & 15;
              if (s === 0) { if (r === 15) { k += 16; continue; } break; }
              k += r;
              if (k > 63) break;
              zz[k] = (br.extend(s) << 16) >> 16;
              k++;
            }
            if (cover) { zz.fill(0); zz[0] = c.cover; }
            emit(ci, c.cls, zz);
          }
        }
      }
      if (br.fabricated()) throw new DctRefusal("TRUNCATED", { note: `the entropy-coded data ended in MCU row ${my + 1} of ${mcuy}` });
    }
    return covered;
  };

  /* Pass 1: count the symbols the covered stream codes, per table class (luma, chroma). */
  const freq = [0, 1].map(() => ({ dc: new Float64Array(256), ac: new Float64Array(256) }));
  let last = new Int32Array(nc), dataBits = 0;
  const count = (ci, cls, z) => {
    const f = freq[cls];
    const diff = z[0] - last[ci];
    last[ci] = z[0];
    const s = category(diff);
    if (s > 11) throw new DctRefusal("CORRUPT_DATA", { note: "a DC coefficient outside the 8-bit range" });
    f.dc[s]++; dataBits += s;
    let r = 0;
    for (let k = 1; k < 64; k++) {
      const v = z[k];
      if (v === 0) { r++; continue; }
      while (r > 15) { f.ac[0xf0]++; r -= 16; }
      const t = category(v);
      if (t > 10) throw new DctRefusal("CORRUPT_DATA", { note: "an AC coefficient outside the 8-bit range" });
      f.ac[(r << 4) | t]++; dataBits += t;
      r = 0;
    }
    if (r > 0) f.ac[0]++;
  };
  let covered;
  try { covered = walk(count, () => last.fill(0)); } catch (e) { throw fromDct(e); }

  const classes = single ? [0] : [0, 1];
  const tables = classes.map((cls) => ({ dc: optimalTable(freq[cls].dc), ac: optimalTable(freq[cls].ac) }));
  for (const cls of classes) {
    const f = freq[cls], t = tables[cls];
    for (let s = 0; s < 256; s++) dataBits += f.dc[s] * t.dc.size[s] + f.ac[s] * t.ac.size[s];
  }

  /* The fresh container: nothing of the original but the frame, its tables and the scan (R2). */
  const out = new ByteSink(Math.ceil((dataBits / 8) * 1.01) + 4096 + (h.restart ? Math.ceil((mcux * mcuy) / h.restart) * 2 : 0));
  out.bytes([0xff, 0xd8]);
  if (h.jfif) out.segment(0xe0, Uint8Array.from([0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]));
  if (h.adobe) out.segment(0xee, Uint8Array.from([0x41, 0x64, 0x6f, 0x62, 0x65, 0, 100, 0, 0, 0, 0, h.adobe.transform]));
  if (orientation !== 1) out.segment(0xe1, Uint8Array.from([0x45, 0x78, 0x69, 0x66, 0, 0, ...orientationTiff(orientation)]));
  for (const tq of [...new Set(comps.map((c) => c.tq))].sort((a, b) => a - b)) {
    const q = qt[tq], wide = q.some((v) => v > 255);
    const body = new Uint8Array(1 + 64 * (wide ? 2 : 1));
    body[0] = ((wide ? 1 : 0) << 4) | tq;
    for (let i = 0; i < 64; i++) {
      const v = q[ZIGZAG[i]];
      if (wide) { body[1 + 2 * i] = v >> 8; body[2 + 2 * i] = v & 0xff; } else body[1 + i] = v;
    }
    out.segment(0xdb, body);
  }
  const sof = [8, H >> 8, H & 0xff, W >> 8, W & 0xff, nc];
  for (const c of comps) sof.push(c.id, (c.sh << 4) | c.sv, c.tq);
  out.segment(SOF_MARKER[frame.process], Uint8Array.from(sof));
  for (const cls of classes) {
    for (const [tc, t] of [[0, tables[cls].dc], [1, tables[cls].ac]])
      out.segment(0xc4, Uint8Array.from([(tc << 4) | cls, ...t.counts, ...t.symbols]));
  }
  if (h.restart) out.segment(0xdd, Uint8Array.from([h.restart >> 8, h.restart & 0xff]));
  const sos = [nc];
  for (const ci of order) sos.push(comps[ci].id, (comps[ci].cls << 4) | comps[ci].cls);
  sos.push(0, 63, 0);
  out.segment(0xda, Uint8Array.from(sos));

  /* Pass 2: write. */
  last = new Int32Array(nc);
  let rst = 0;
  const write = (ci, cls, z) => {
    const t = tables[cls];
    const diff = z[0] - last[ci];
    last[ci] = z[0];
    const s = category(diff);
    out.put(t.dc.code[s], t.dc.size[s]);
    if (s) out.put(diff < 0 ? diff + (1 << s) - 1 : diff, s);
    let r = 0;
    for (let k = 1; k < 64; k++) {
      const v = z[k];
      if (v === 0) { r++; continue; }
      while (r > 15) { out.put(t.ac.code[0xf0], t.ac.size[0xf0]); r -= 16; }
      const u = category(v), sym = (r << 4) | u;
      out.put(t.ac.code[sym], t.ac.size[sym]);
      out.put(v < 0 ? v + (1 << u) - 1 : v, u);
      r = 0;
    }
    if (r > 0) out.put(t.ac.code[0], t.ac.size[0]);
  };
  try {
    walk(write, () => {
      out.align();
      out.bytes([0xff, 0xd0 + rst]);
      rst = (rst + 1) & 7;
      last.fill(0);
    });
  } catch (e) { throw fromDct(e); }
  out.align();
  out.bytes([0xff, 0xd9]);
  const [width, height] = displayedSize(W, H, orientation);
  return { bytes: out.buf.slice(0, out.n), format: "jpeg", width, height, covered };
}

const ZIGZAG = Int32Array.from([
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48,
  41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22,
  15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55,
  62, 63,
]);
