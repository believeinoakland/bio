/* jpxdecode.mjs — D-622: a JPEG 2000 decoder (ITU-T T.800, Part 1) for the
 * `JPXDecode` image of an image-only PDF page, so tier 3 can read it in-isolate.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT "CORRECT" MEANS HERE: THE SAME SAMPLES AS OpenJPEG, TO THE BIT
 * ─────────────────────────────────────────────────────────────────────────────
 * The reversible path (the 5/3 wavelet, the RCT) is integer arithmetic the
 * standard defines exactly, so there is one right picture. The irreversible
 * path (the 9/7 wavelet, the ICT, scalar quantisation) is not bit-defined: the
 * standard allows any reconstruction within its tolerance, and a decoder that
 * is merely conforming produces a picture no independent decoder reproduces,
 * which would make `pixels_sha256` a hash nobody can check. So every
 * irreversible step below is OpenJPEG 2.5's own, float32 operation for float32
 * operation (each JavaScript result is rounded with Math.fround, which gives
 * exactly the IEEE single-precision answer for one add or multiply):
 *   - tier 1 reconstructs a coefficient at the middle of its last decoded
 *     interval, in doubled integer units (`opj_t1_dec_*`'s "oneplushalf");
 *   - dequantisation multiplies that integer, as a float, by half the band's
 *     step size, computed in double and stored as float (`tcd.c`), with the
 *     sub-band gain OpenJPEG leaves out and its 9/7 compensates (its
 *     BUG_WEIRD_TWO_INVK: high bands are scaled by 1.625732422 = "2/K", not 1/K);
 *   - the 9/7 lifting steps in `opj_v8dwt_decode`'s order and grouping, rows
 *     first, then columns, level by level;
 *   - the ICT with `opj_mct_decode_real`'s constants and order;
 *   - rounding to the nearest integer, ties to even (`lrintf`), then the DC
 *     level shift and a clamp to the component's range.
 * The suite checks the result against opj_decompress (OpenJPEG 2.5.0), which
 * shares no line with this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT REFUSES, BY NAME (JPX_REFUSES) — never a picture it guessed at
 * ─────────────────────────────────────────────────────────────────────────────
 * High-throughput coding (Part 15), sub-sampled components, a palette, sYCC,
 * signed samples and any precision but 8 bits, and more than three components.
 * Every error thrown is a `JpxRefusal` carrying a code: UNSUPPORTED (with the
 * feature), UNSUPPORTED_SAMPLES, TRUNCATED or CORRUPT.
 */

import { MqDecoder, mqContexts } from "./mq.mjs";

export class JpxRefusal extends Error {
  constructor(code, detail = {}) {
    super(`${code}${detail.feature ? `: ${detail.feature}` : detail.note ? `: ${detail.note}` : ""}`);
    this.code = code;
    this.detail = detail;
  }
}
const unsupported = (feature, extra = {}) => new JpxRefusal("UNSUPPORTED", { feature, ...extra });
const samples = (note, extra = {}) => new JpxRefusal("UNSUPPORTED_SAMPLES", { note, ...extra });
const corrupt = (note, extra = {}) => new JpxRefusal("CORRUPT", { note, ...extra });
const truncated = (note, extra = {}) => new JpxRefusal("TRUNCATED", { note, ...extra });

/** Every `feature` an UNSUPPORTED refusal can carry. */
export const JPX_REFUSES = Object.freeze({
  "high-throughput coding": "the codestream uses Part 15 (HTJ2K) block coding",
  "a JP2 palette": "the image's samples index a palette (pclr box)",
  "sYCC colour": "the JP2 colour specification is sYCC, whose conversion is not bit-defined",
  "an extended capability": "a Part 2 extension the decoder must understand (a CAP marker, or Rsiz beyond Part 1)",
});

const f32 = Math.fround;

/* ── the container ────────────────────────────────────────────────────────── */

function boxes(d, p, end) {
  const out = [];
  while (p + 8 <= end) {
    let len = ((d[p] << 24) | (d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]) >>> 0;
    const type = String.fromCharCode(d[p + 4], d[p + 5], d[p + 6], d[p + 7]);
    let hdr = 8;
    if (len === 1) {
      if (p + 16 > end) throw truncated("a JP2 box's extended length");
      len = (((d[p + 8] << 24) | (d[p + 9] << 16) | (d[p + 10] << 8) | d[p + 11]) >>> 0) * 2 ** 32
        + (((d[p + 12] << 24) | (d[p + 13] << 16) | (d[p + 14] << 8) | d[p + 15]) >>> 0);
      hdr = 16;
    } else if (len === 0) len = end - p;
    if (len < hdr || p + len > end) throw truncated(`the JP2 box '${type}' runs past the data`);
    out.push({ type, start: p + hdr, end: p + len });
    p += len;
  }
  return out;
}

/** The codestream's range, and what the JP2 header says about colour. */
function container(d) {
  if (d.length >= 2 && d[0] === 0xff && d[1] === 0x4f) return { cs: [0, d.length], colour: null, jp2: false };
  if (d.length < 12 || !(d[4] === 0x6a && d[5] === 0x50 && d[6] === 0x20 && d[7] === 0x20))
    throw corrupt("neither a JPEG 2000 codestream (SOC) nor a JP2 file (signature box)");
  let colour = null, cs = null, palette = false;
  for (const b of boxes(d, 0, d.length)) {
    if (b.type === "jp2c") { cs = [b.start, b.end]; break; }
    if (b.type === "jp2h") {
      for (const h of boxes(d, b.start, b.end)) {
        if (h.type === "pclr") palette = true;
        if (h.type === "colr" && !colour) {
          const meth = d[h.start];
          colour = meth === 1
            ? { method: "enumerated", enumCs: ((d[h.start + 3] << 24) | (d[h.start + 4] << 16) | (d[h.start + 5] << 8) | d[h.start + 6]) >>> 0 }
            : { method: meth === 2 ? "icc" : `method ${meth}` };
        }
      }
    }
  }
  if (!cs) throw truncated("the JP2 file holds no codestream (jp2c box)");
  if (palette) throw unsupported("a JP2 palette");
  if (colour && colour.method === "enumerated" && colour.enumCs === 18) throw unsupported("sYCC colour");
  return { cs, colour, jp2: true };
}

/* ── the codestream's marker segments ─────────────────────────────────────── */

class R {
  constructor(d, p, end) { this.d = d; this.p = p; this.end = end; }
  need(n, what) { if (this.p + n > this.end) throw truncated(`${what} runs past the codestream`); }
  u8(w = "a field") { this.need(1, w); return this.d[this.p++]; }
  u16(w = "a field") { this.need(2, w); const v = (this.d[this.p] << 8) | this.d[this.p + 1]; this.p += 2; return v; }
  u32(w = "a field") { this.need(4, w); const d = this.d, p = this.p; this.p += 4; return ((d[p] << 24) | (d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]) >>> 0; }
}

function readSiz(r, len) {
  const end = r.p + len - 2;
  const rsiz = r.u16("Rsiz");
  const s = { rsiz, X: r.u32(), Y: r.u32(), XO: r.u32(), YO: r.u32(), XT: r.u32(), YT: r.u32(), XTO: r.u32(), YTO: r.u32() };
  const n = r.u16("Csiz");
  s.comps = [];
  for (let i = 0; i < n; i++) {
    const ssiz = r.u8("Ssiz");
    s.comps.push({ prec: (ssiz & 0x7f) + 1, sgnd: ssiz >> 7, dx: r.u8("XRsiz"), dy: r.u8("YRsiz") });
  }
  r.p = end;
  if (!s.XT || !s.YT || s.X <= s.XO || s.Y <= s.YO || s.XTO > s.XO || s.YTO > s.YO || s.XTO + s.XT <= s.XO || s.YTO + s.YT <= s.YO)
    throw corrupt("an image and tile geometry the standard does not allow");
  if (rsiz & 0x4000) throw unsupported("high-throughput coding");
  if (rsiz & 0x8000) throw unsupported("an extended capability", { rsiz });
  return s;
}

/** SPcod/SPcoc: the component's coding parameters. */
function readSpcod(r, precincts) {
  const c = { nl: r.u8("decomposition levels"), xcb: (r.u8("code-block width") & 0xf) + 2, ycb: (r.u8("code-block height") & 0xf) + 2,
              cblksty: r.u8("code-block style"), qmfbid: r.u8("the wavelet") };
  if (c.nl > 32) throw corrupt(`${c.nl} decomposition levels`);
  if (c.xcb + c.ycb > 12 || c.xcb > 10 || c.ycb > 10) throw corrupt("a code-block larger than 4096 samples");
  if (c.cblksty & 0x40) throw unsupported("high-throughput coding");
  c.prc = [];
  for (let i = 0; i <= c.nl; i++) {
    if (precincts) { const b = r.u8("a precinct size"); c.prc.push([b & 0xf, b >> 4]); }
    else c.prc.push([15, 15]);
  }
  return c;
}

function readQcd(r, len) {
  const end = r.p + len;
  const s = r.u8("Sqcd");
  const style = s & 0x1f, guard = s >> 5;
  const steps = [];
  if (style === 0) while (r.p < end) steps.push({ expn: r.u8("an exponent") >> 3, mant: 0 });
  else while (r.p + 1 < end) { const v = r.u16("a step size"); steps.push({ expn: v >> 11, mant: v & 0x7ff }); }
  r.p = end;
  if (style > 2 || !steps.length) throw corrupt(`quantisation style ${style}`);
  return { style, guard, steps };
}

/**
 * Parse the whole codestream: the main header, and every tile-part's header
 * and data, gathered per tile.
 */
function parseCodestream(d, start, end) {
  const r = new R(d, start, end);
  if (r.u16("SOC") !== 0xff4f) throw corrupt("no SOC marker");
  const main = { cod: null, coc: [], qcd: null, qcc: [], rgn: [], poc: null, ppm: [] };
  let siz = null;
  const tiles = new Map();
  const readSeg = (h, m, len, forTile) => {
    const segEnd = r.p + len - 2;
    const wide = siz && siz.comps.length > 256;
    const comp = () => (wide ? r.u16("a component index") : r.u8("a component index"));
    switch (m) {
      case 0xff52: {
        const scod = r.u8("Scod");
        h.cod = { scod, prog: r.u8("the progression order"), layers: r.u16("the layer count"), mct: r.u8("the colour transform"),
                  sp: readSpcod(r, scod & 1) };
        break;
      }
      case 0xff53: { const c = comp(); const s = r.u8("Scoc"); h.coc[c] = readSpcod(r, s & 1); break; }
      case 0xff5c: h.qcd = readQcd(r, len - 2); break;
      case 0xff5d: { const c = comp(); h.qcc[c] = readQcd(r, segEnd - r.p); break; }
      case 0xff5e: { const c = comp(); r.u8("Srgn"); h.rgn[c] = r.u8("the ROI shift"); break; }
      case 0xff5f: {
        const list = [];
        while (r.p < segEnd) list.push({ rs: r.u8(), cs: comp(), lye: r.u16(), re: r.u8(), ce: wide ? r.u16() : r.u8() || 256, prog: r.u8() });
        h.poc = (h.poc || []).concat(list);
        break;
      }
      case 0xff60: r.u8("Zppm"); h.ppm.push(d.subarray(r.p, segEnd)); break;
      case 0xff61: r.u8("Zppt"); h.ppt.push(d.subarray(r.p, segEnd)); break;
      case 0xff50: throw unsupported("an extended capability", { marker: "CAP" });
      default: break;                                   // TLM, PLM, PLT, CRG, COM, CPF: not needed
    }
    void forTile;
    r.p = segEnd;
  };
  /* The main header. */
  for (;;) {
    const m = r.u16("a main-header marker");
    if (m === 0xff90) { r.p -= 2; break; }
    if (m === 0xffd9) throw truncated("the codestream ends before any tile");
    if ((m & 0xff00) !== 0xff00) throw corrupt("a main-header marker expected");
    const len = r.u16("a marker segment length");
    if (len < 2) throw corrupt("a marker segment length under 2");
    r.need(len - 2, "a marker segment");
    if (m === 0xff51) { siz = readSiz(r, len); continue; }
    if (!siz) throw corrupt("a marker before SIZ");
    readSeg(main, m, len, false);
  }
  if (!siz || !main.cod || !main.qcd) throw corrupt("the main header lacks SIZ, COD or QCD");
  /* The tile-parts. */
  while (r.p + 2 <= end) {
    const m = r.u16("a tile-part marker");
    if (m === 0xffd9) break;
    if (m !== 0xff90) throw corrupt(`marker 0x${m.toString(16)} where SOT was expected`);
    const sotAt = r.p - 2;
    const lsot = r.u16("Lsot");
    const isot = r.u16("Isot"), psot = r.u32("Psot");
    r.u8("TPsot"); r.u8("TNsot");
    void lsot;
    const tpEnd = psot ? sotAt + psot : end;
    if (tpEnd > end) throw truncated(`tile-part of tile ${isot} runs past the codestream`);
    let t = tiles.get(isot);
    const first = !t;
    if (!t) { t = { index: isot, cod: null, coc: [], qcd: null, qcc: [], rgn: [], poc: null, ppt: [], ppm: [], data: [] }; tiles.set(isot, t); }
    for (;;) {
      const mm = r.u16("a tile-part header marker");
      if (mm === 0xff93) break;
      const len = r.u16("a marker segment length");
      r.need(len - 2, "a marker segment");
      if (!first && mm !== 0xff61 && mm !== 0xff64) { r.p += len - 2; continue; }
      readSeg(t, mm, len, true);
    }
    t.data.push(d.subarray(r.p, Math.min(tpEnd, end)));
    r.p = tpEnd;
  }
  return { siz, main, tiles };
}

/* ── geometry ─────────────────────────────────────────────────────────────── */

const ceilDiv = (a, b) => Math.ceil(a / b);
const floorLog2 = (v) => 31 - Math.clz32(v);

/** A tag tree over w×h leaves (B.10.2). */
class TagTree {
  constructor(w, h) {
    this.levels = [];
    do {
      this.levels.push({ w, h, value: new Int32Array(w * h).fill(0x7fffffff), low: new Int32Array(w * h) });
      if (w === 1 && h === 1) break;
      w = ceilDiv(w, 2); h = ceilDiv(h, 2);
    } while (true);   // eslint-disable-line no-constant-condition
  }
  /** Decode leaf (x, y) against `threshold`: true when its value is below it. */
  decode(bio, x, y, threshold) {
    const path = [];
    for (let l = 0; l < this.levels.length; l++) { path.push(y * this.levels[l].w + x); x >>= 1; y >>= 1; }
    let low = 0;
    for (let l = this.levels.length - 1; l >= 0; l--) {
      const lv = this.levels[l], i = path[l];
      if (low > lv.low[i]) lv.low[i] = low; else low = lv.low[i];
      while (low < threshold && low < lv.value[i]) {
        if (bio.bit()) lv.value[i] = low; else low++;
      }
      lv.low[i] = low;
    }
    return this.levels[0].value[path[0]] < threshold;
  }
  value(x, y) { return this.levels[0].value[y * this.levels[0].w + x]; }
}

/** The packet-header bit reader (B.10.1): after a 0xFF byte, the next byte
 *  carries 7 bits. */
class Bio {
  constructor(d, p, end) { this.d = d; this.p = p; this.end = end; this.buf = 0; this.ct = 0; }
  byteIn() {
    this.buf = (this.buf << 8) & 0xffff;
    this.ct = this.buf === 0xff00 ? 7 : 8;
    if (this.p < this.end) this.buf |= this.d[this.p++];
    else { this.p++; this.over = true; }
  }
  bit() {
    if (this.ct === 0) this.byteIn();
    this.ct--;
    return (this.buf >> this.ct) & 1;
  }
  bits(n) { let v = 0; for (let i = 0; i < n; i++) v = (v << 1) | this.bit(); return v; }
  /** Byte-align after a header: a final 0xFF is followed by a stuffed byte. */
  align() { if ((this.buf & 0xff) === 0xff) this.byteIn(); this.ct = 0; }
}

/* ── tier 1: EBCOT (Annex D), as OpenJPEG decodes it ──────────────────────── */

/* Neighbour flag bits, per coefficient: significance of the 8 neighbours,
 * the sign of the 4 direct ones, and the coefficient's own state. */
const N = 1, S = 2, W = 4, E = 8, NW = 16, NE = 32, SW = 64, SE = 128;
const SGN_N = 256, SGN_S = 512, SGN_W = 1024, SGN_E = 2048;
const SIG = 4096, NEG = 8192, REFINED = 16384, VISIT = 32768;
const NBR = 255;

/* ZC contexts per band (0 LL, 1 HL, 2 LH, 3 HH): Table D.1, whose columns
 * swap the horizontal and vertical counts for HL, the horizontally high-pass band. */
const ZC = [0, 1, 2, 3].map((orient) => Uint8Array.from({ length: 256 }, (_, f) => {
  let h = ((f & W) !== 0) + ((f & E) !== 0), v = ((f & N) !== 0) + ((f & S) !== 0);
  const d = ((f & NW) !== 0) + ((f & NE) !== 0) + ((f & SW) !== 0) + ((f & SE) !== 0);
  if (orient === 1) [h, v] = [v, h];
  if (orient === 3) {
    const hv = h + v;
    if (!d) return hv === 0 ? 0 : hv === 1 ? 1 : 2;
    if (d === 1) return hv === 0 ? 3 : hv === 1 ? 4 : 5;
    if (d === 2) return hv === 0 ? 6 : 7;
    return 8;
  }
  if (!h) return !v ? (!d ? 0 : d === 1 ? 1 : 2) : v === 1 ? 3 : 4;
  if (h === 1) return !v ? (!d ? 5 : 6) : 7;
  return 8;
}));
/* Sign context and prediction bit, from the 4 direct neighbours' significance
 * and signs (Table D.3). Index: N,S,W,E significance (4 bits) | signs << 4. */
const SC = new Uint8Array(256), SPB = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  const sig = (b) => (i >> b) & 1, neg = (b) => (i >> (4 + b)) & 1;
  const pos = (b) => sig(b) && !neg(b), ng = (b) => sig(b) && neg(b);
  const hc = Math.min(pos(2) + pos(3), 1) - Math.min(ng(2) + ng(3), 1);
  const vc0 = Math.min(pos(0) + pos(1), 1) - Math.min(ng(0) + ng(1), 1);
  SPB[i] = !hc && !vc0 ? 0 : (!(hc > 0 || (!hc && vc0 > 0)) ? 1 : 0);
  let h = hc, v = vc0;
  if (h < 0) { h = -h; v = -v; }
  SC[i] = !h ? (v ? 1 : 0) : (v === -1 ? 2 : v === 0 ? 3 : 4);
}
const CTX_SC = 9, CTX_MAG = 14, CTX_AGG = 17, CTX_UNI = 18;

class RawDecoder {
  constructor(d, p, end) { this.d = d; this.bp = p; this.end = end; this.c = 0; this.ct = 0; }
  bit() {
    if (this.ct === 0) {
      const next = this.bp < this.end ? this.d[this.bp] : 0xff;
      if (this.c === 0xff) {
        if (next > 0x8f) { this.c = 0xff; this.ct = 8; }
        else { this.c = next; this.bp++; this.ct = 7; }
      } else { this.c = next; this.bp++; this.ct = 8; }
    }
    this.ct--;
    return (this.c >> this.ct) & 1;
  }
}

/**
 * Decode one code-block's passes into `out` (w×h, doubled units, signed).
 * `segs` are the codeword segments `[{data, passes}]` in order.
 */
function decodeCodeBlock(w, h, orient, numbps, lazyFrom, cblksty, segs, out) {
  const fw = w + 2;
  const flags = new Uint16Array(fw * (h + 2));
  const ctx = mqContexts(19);
  const resetCtx = () => { ctx.fill(0); ctx[CTX_UNI] = 46 << 1; ctx[CTX_AGG] = 3 << 1; ctx[0] = 4 << 1; };
  resetCtx();
  const zc = ZC[orient];
  const vsc = cblksty & 8, lazy = cblksty & 1, reset = cblksty & 2, segsym = cblksty & 32;
  let bpno = numbps;                  // "bpno_plus_one"
  let passtype = 2;
  const at = (x, y) => (y + 1) * fw + x + 1;
  const setSig = (x, y, neg) => {
    const i = at(x, y);
    flags[i] |= SIG | (neg ? NEG : 0);
    flags[i - fw] |= S | (neg ? SGN_S : 0);           // for the neighbour above, this is its south
    flags[i + fw] |= N | (neg ? SGN_N : 0);
    flags[i - 1] |= E | (neg ? SGN_E : 0);
    flags[i + 1] |= W | (neg ? SGN_W : 0);
    flags[i - fw - 1] |= SE; flags[i - fw + 1] |= SW;
    flags[i + fw - 1] |= NE; flags[i + fw + 1] |= NW;
  };
  /* The neighbourhood as the coefficient sees it: under vertical causality a
   * stripe's last row does not see the stripe below. */
  const nbr = (f, y) => (vsc && (y & 3) === 3 ? f & ~(S | SW | SE | SGN_S) : f);
  const scIndex = (f) => ((f & N) ? 1 : 0) | ((f & S) ? 2 : 0) | ((f & W) ? 4 : 0) | ((f & E) ? 8 : 0)
    | ((f & SGN_N) ? 16 : 0) | ((f & SGN_S) ? 32 : 0) | ((f & SGN_W) ? 64 : 0) | ((f & SGN_E) ? 128 : 0);

  for (const seg of segs) {
    /* OpenJPEG compares against the block's bit-planes WITHOUT the ROI shift. */
    const raw = lazy && bpno <= lazyFrom - 4 && passtype < 2;
    const mq = raw ? null : new MqDecoder(seg.data, 0, seg.data.length);
    const rd = raw ? new RawDecoder(seg.data, 0, seg.data.length) : null;
    for (let pass = 0; pass < seg.passes && bpno >= 1; pass++) {
      const one = 1 << bpno, half = one >> 1, oneplushalf = one | half;
      if (passtype === 0) {
        /* significance propagation */
        for (let y0 = 0; y0 < h; y0 += 4) for (let x = 0; x < w; x++) for (let y = y0; y < y0 + 4 && y < h; y++) {
          const i = at(x, y), f = nbr(flags[i], y);
          if ((f & SIG) || !(f & NBR)) continue;
          const bit = raw ? rd.bit() : mq.decode(ctx, zc[f & NBR]);
          if (bit) {
            let neg;
            if (raw) neg = rd.bit();
            else { const k = scIndex(f); neg = mq.decode(ctx, CTX_SC + SC[k]) ^ SPB[k]; }
            out[y * w + x] = neg ? -oneplushalf : oneplushalf;
            setSig(x, y, neg);
          }
          flags[i] |= VISIT;
        }
      } else if (passtype === 1) {
        /* magnitude refinement */
        for (let y0 = 0; y0 < h; y0 += 4) for (let x = 0; x < w; x++) for (let y = y0; y < y0 + 4 && y < h; y++) {
          const i = at(x, y), f = flags[i];
          if ((f & (SIG | VISIT)) !== SIG) continue;
          const bit = raw ? rd.bit()
            : mq.decode(ctx, (f & REFINED) ? CTX_MAG + 2 : (nbr(f, y) & NBR) ? CTX_MAG + 1 : CTX_MAG);
          const v = out[y * w + x];
          out[y * w + x] = v + ((bit ^ (v < 0 ? 1 : 0)) ? half : -half);
          flags[i] |= REFINED;
        }
      } else {
        /* cleanup, with run-length coding of all-quiet stripe columns */
        for (let y0 = 0; y0 < h; y0 += 4) for (let x = 0; x < w; x++) {
          let y = y0;
          if (y0 + 4 <= h) {
            let quiet = true;
            for (let k = 0; k < 4 && quiet; k++) {
              const f = nbr(flags[at(x, y0 + k)], y0 + k);
              if (f & (SIG | VISIT | NBR)) quiet = false;
            }
            if (quiet) {
              if (!mq.decode(ctx, CTX_AGG)) continue;
              const k = (mq.decode(ctx, CTX_UNI) << 1) | mq.decode(ctx, CTX_UNI);
              y = y0 + k;
              const f = nbr(flags[at(x, y)], y);
              const sk = scIndex(f);
              const neg = mq.decode(ctx, CTX_SC + SC[sk]) ^ SPB[sk];
              out[y * w + x] = neg ? -oneplushalf : oneplushalf;
              setSig(x, y, neg);
              y++;
            }
          }
          for (; y < y0 + 4 && y < h; y++) {
            const i = at(x, y), f = nbr(flags[i], y);
            if (f & (SIG | VISIT)) continue;
            if (mq.decode(ctx, zc[f & NBR])) {
              const sk = scIndex(f);
              const neg = mq.decode(ctx, CTX_SC + SC[sk]) ^ SPB[sk];
              out[y * w + x] = neg ? -oneplushalf : oneplushalf;
              setSig(x, y, neg);
            }
          }
        }
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) flags[at(x, y)] &= ~VISIT;
        if (segsym) {
          let v = 0;
          for (let k = 0; k < 4; k++) v = (v << 1) | mq.decode(ctx, CTX_UNI);
          void v;       // 1010 when intact; OpenJPEG does not act on it, so neither does this
        }
      }
      if (reset && !raw) resetCtx();
      if (++passtype === 3) { passtype = 0; bpno--; }
    }
  }
}

/* ── wavelets (Annex F), and OpenJPEG's float 9/7 ─────────────────────────── */

const K = f32(1.230174105), TWO_INVK = f32(1.625732422);
const ALPHA = f32(-1.586134342), BETA = f32(-0.052980118), GAMMA = f32(0.882911075), DELTA = f32(0.443506852);

/** One 5/3 synthesis over `x` (interleaved in place), `cas` the parity of the
 *  first sample (1 = it is a high-pass one). F.3.8.2, as OpenJPEG. */
function idwt53(x, n, cas) {
  if (n === 1) { if (cas) x[0] = Math.trunc(x[0] / 2); return; }
  const at = (i) => x[i < 0 ? -i : i >= n ? 2 * (n - 1) - i : i];     // symmetric extension
  for (let i = cas ? 1 : 0; i < n; i += 2) x[i] -= Math.floor((at(i - 1) + at(i + 1) + 2) / 4);
  for (let i = cas ? 0 : 1; i < n; i += 2) x[i] += Math.floor((at(i - 1) + at(i + 1)) / 2);
}

/** One 9/7 synthesis, `opj_v8dwt_decode` exactly. `x` is a Float32Array. */
function idwt97(x, n, cas) {
  const sn = cas ? n >> 1 : (n + 1) >> 1, dn = n - sn;
  if (cas === 0) { if (!(dn > 0 || sn > 1)) return; }
  else if (!(sn > 0 || dn > 1)) return;
  const a = cas, b = 1 - cas;
  for (let i = 0; i < sn; i++) x[a + 2 * i] = f32(x[a + 2 * i] * K);
  for (let i = 0; i < dn; i++) x[b + 2 * i] = f32(x[b + 2 * i] * TWO_INVK);
  step97(x, b, a + 1, sn, Math.min(sn, dn - a), f32(-DELTA));
  step97(x, a, b + 1, dn, Math.min(dn, sn - b), f32(-GAMMA));
  step97(x, b, a + 1, sn, Math.min(sn, dn - a), f32(-BETA));
  step97(x, a, b + 1, dn, Math.min(dn, sn - b), f32(-ALPHA));
}
function step97(x, l, w, end, m, c) {
  const imax = Math.min(end, m);
  let fl = l, fw = w;
  for (let i = 0; i < imax; i++) {
    x[fw - 1] = f32(x[fw - 1] + f32(f32(x[fl] + x[fw]) * c));
    fl = fw; fw += 2;
  }
  if (m < end) x[fw - 1] = f32(x[fw - 1] + f32(x[fl] * f32(c + c)));
}

/* ── the tile ─────────────────────────────────────────────────────────────── */

/** The progression's packets, in order, as [layer, res, comp, precinct]. */
function packetOrder(tc, layers, progs, tile, comps) {
  const out = [], seen = new Set();
  const push = (l, r, c, p) => { const k = `${l}.${r}.${c}.${p}`; if (!seen.has(k)) { seen.add(k); out.push([l, r, c, p]); } };
  for (const pg of progs) {
    const LYE = Math.min(pg.lye, layers), RE = pg.re, CE = Math.min(pg.ce, comps.length);
    const cs = [], rs = [];
    for (let c = pg.cs; c < CE; c++) cs.push(c);
    for (let r = pg.rs; r < RE; r++) rs.push(r);
    const has = (c, r) => r < tc[c].res.length;
    if (pg.prog === 0 || pg.prog === 1) {
      for (const o1 of pg.prog === 0 ? [...Array(LYE).keys()] : rs)
        for (const o2 of pg.prog === 0 ? rs : [...Array(LYE).keys()])
          for (const c of cs) {
            const [l, r] = pg.prog === 0 ? [o1, o2] : [o2, o1];
            if (!has(c, r)) continue;
            const res = tc[c].res[r];
            for (let p = 0; p < res.npw * res.nph; p++) push(l, r, c, p);
          }
      continue;
    }
    /* Position-driven orders: each precinct is met at the first reference-grid
     * position whose conditions (B.12.1.3) it satisfies — its top-left corner,
     * or the tile's own corner for a precinct the tile's edge cuts. */
    const items = [];
    for (const c of cs) for (const r of rs) {
      if (!has(c, r)) continue;
      const res = tc[c].res[r], n = tc[c].nl - r, cp = comps[c];
      for (let py = 0; py < res.nph; py++) for (let px = 0; px < res.npw; px++) {
        const gx = (res.pgx + px) << res.ppx, gy = (res.pgy + py) << res.ppy;
        const X = gx <= res.x0 ? (((res.x0 << n) * cp.dx) % ((cp.dx << (res.ppx + n))) === 0 ? res.x0 * cp.dx << n : tile.x0) : (gx * cp.dx) << n;
        const Y = gy <= res.y0 ? (((res.y0 << n) * cp.dy) % ((cp.dy << (res.ppy + n))) === 0 ? res.y0 * cp.dy << n : tile.y0) : (gy * cp.dy) << n;
        items.push({ c, r, p: py * res.npw + px, X, Y });
      }
    }
    const key = { 2: (a) => [a.r, a.Y, a.X, a.c], 3: (a) => [a.Y, a.X, a.c, a.r], 4: (a) => [a.c, a.Y, a.X, a.r] }[pg.prog];
    if (!key) throw corrupt(`progression order ${pg.prog}`);
    items.sort((a, b) => { const ka = key(a), kb = key(b); for (let i = 0; i < 4; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i]; return 0; });
    for (const it of items) for (let l = 0; l < LYE; l++) push(l, it.r, it.c, it.p);
  }
  return out;
}

function decodeTile(cs, t, tileNo) {
  const { siz, main } = cs;
  const cod = t.cod || main.cod;
  const nTx = ceilDiv(siz.X - siz.XTO, siz.XT);
  const p = tileNo % nTx, q = Math.floor(tileNo / nTx);
  const tile = { x0: Math.max(siz.XTO + p * siz.XT, siz.XO), y0: Math.max(siz.YTO + q * siz.YT, siz.YO),
                 x1: Math.min(siz.XTO + (p + 1) * siz.XT, siz.X), y1: Math.min(siz.YTO + (q + 1) * siz.YT, siz.Y) };
  const comps = siz.comps;
  const tc = comps.map((cp, c) => {
    const sp = t.coc[c] || (t.cod ? t.cod.sp : null) || main.coc[c] || main.cod.sp;
    const qc = t.qcc[c] || t.qcd || main.qcc[c] || main.qcd;
    const roi = t.rgn[c] ?? main.rgn[c] ?? 0;
    const x0 = ceilDiv(tile.x0, cp.dx), y0 = ceilDiv(tile.y0, cp.dy), x1 = ceilDiv(tile.x1, cp.dx), y1 = ceilDiv(tile.y1, cp.dy);
    const res = [];
    for (let r = 0; r <= sp.nl; r++) {
      const sc = 2 ** (sp.nl - r);
      const R0 = { r, x0: ceilDiv(x0, sc), y0: ceilDiv(y0, sc), x1: ceilDiv(x1, sc), y1: ceilDiv(y1, sc) };
      const [ppx, ppy] = sp.prc[r];
      R0.ppx = ppx; R0.ppy = ppy;
      R0.pgx = Math.floor(R0.x0 / 2 ** ppx); R0.pgy = Math.floor(R0.y0 / 2 ** ppy);
      R0.npw = R0.x1 > R0.x0 ? ceilDiv(R0.x1, 2 ** ppx) - R0.pgx : 0;
      R0.nph = R0.y1 > R0.y0 ? ceilDiv(R0.y1, 2 ** ppy) - R0.pgy : 0;
      const bandSpecs = r === 0 ? [[0, 0, 0]] : [[1, 1, 0], [2, 0, 1], [3, 1, 1]];
      const nb = r === 0 ? sp.nl : sp.nl - r + 1;
      const xcb = Math.min(sp.xcb, r === 0 ? ppx : ppx - 1), ycb = Math.min(sp.ycb, r === 0 ? ppy : ppy - 1);
      R0.bands = bandSpecs.map(([bandno, xob, yob]) => {
        const s = 2 ** nb, hx = xob ? 2 ** (nb - 1) : 0, hy = yob ? 2 ** (nb - 1) : 0;
        const B = { bandno, x0: ceilDiv(x0 - hx, s), y0: ceilDiv(y0 - hy, s), x1: ceilDiv(x1 - hx, s), y1: ceilDiv(y1 - hy, s) };
        const bi = r === 0 ? 0 : 3 * (r - 1) + bandno;
        const st = qc.style === 1
          ? { expn: Math.max(0, qc.steps[0].expn - (r === 0 ? 0 : Math.floor((bi - 1) / 3))), mant: qc.steps[0].mant }
          : qc.steps[bi];
        if (!st) throw corrupt(`no quantisation step for band ${bi}`);
        B.numbps = st.expn + qc.guard - 1;
        const rb = cp.prec + (sp.qmfbid === 0 ? 0 : bandno === 0 ? 0 : bandno === 3 ? 2 : 1);
        B.stepsize = f32((1 + st.mant / 2048) * 2 ** (rb - st.expn));
        /* The band's precincts: the resolution's precinct grid, halved for a
         * detail band, each holding its code-blocks and two tag trees. */
        const bpx = r === 0 ? ppx : ppx - 1, bpy = r === 0 ? ppy : ppy - 1;
        B.prec = [];
        for (let py = 0; py < R0.nph; py++) for (let px = 0; px < R0.npw; px++) {
          const X0 = Math.max(B.x0, (R0.pgx + px) * 2 ** bpx), Y0 = Math.max(B.y0, (R0.pgy + py) * 2 ** bpy);
          const X1 = Math.min(B.x1, (R0.pgx + px + 1) * 2 ** bpx), Y1 = Math.min(B.y1, (R0.pgy + py + 1) * 2 ** bpy);
          const pr = { cblks: [], cw: 0, ch: 0 };
          if (X1 > X0 && Y1 > Y0) {
            const cx0 = Math.floor(X0 / 2 ** xcb), cy0 = Math.floor(Y0 / 2 ** ycb);
            pr.cw = ceilDiv(X1, 2 ** xcb) - cx0; pr.ch = ceilDiv(Y1, 2 ** ycb) - cy0;
            for (let j = 0; j < pr.ch; j++) for (let i = 0; i < pr.cw; i++) {
              pr.cblks.push({ x0: Math.max(X0, (cx0 + i) * 2 ** xcb), y0: Math.max(Y0, (cy0 + j) * 2 ** ycb),
                              x1: Math.min(X1, (cx0 + i + 1) * 2 ** xcb), y1: Math.min(Y1, (cy0 + j + 1) * 2 ** ycb),
                              included: false, numbps: 0, lblock: 3, segs: [], passes: 0 });
            }
            pr.incl = new TagTree(pr.cw, pr.ch);
            pr.imsb = new TagTree(pr.cw, pr.ch);
          }
          B.prec.push(pr);
        }
        return B;
      });
      res.push(R0);
    }
    return { x0, y0, x1, y1, nl: sp.nl, sp, qc, roi, res };
  });

  /* Tier 2: every packet, in the progression's order. */
  const progs = (t.poc || main.poc)
    ? (t.poc || main.poc).map((pg) => ({ ...pg, re: Math.min(pg.re, 33) }))
    : [{ rs: 0, cs: 0, lye: cod.layers, re: 33, ce: comps.length, prog: cod.prog }];
  const packets = packetOrder(tc, cod.layers, progs, tile, comps);
  const body = concat(t.data);
  const headers = t.ppt.length ? concat(t.ppt) : null;
  const ppm = cs.ppmTile ? cs.ppmTile(tileNo) : null;
  let bp = 0, hp = 0;
  const hdrSrc = headers || ppm;
  const sop = cod.scod & 2, eph = cod.scod & 4;
  for (const [l, r, c, pi] of packets) {
    const res = tc[c].res[r];
    const sp = tc[c].sp;
    if (sop && bp + 6 <= body.length && body[bp] === 0xff && body[bp + 1] === 0x91) bp += 6;
    const hsrc = hdrSrc || body;
    const bio = new Bio(hsrc, hdrSrc ? hp : bp, hsrc.length);
    const contrib = [];
    if (bio.p >= hsrc.length) throw truncated(`the tile's packets run out at packet ${packets.indexOf(packets.find((q) => q[0] === l && q[1] === r && q[2] === c && q[3] === pi)) + 1} of ${packets.length}`);
    if (bio.bit()) {
      for (const B of res.bands) {
        const pr = B.prec[pi];
        for (let k = 0; k < pr.cblks.length; k++) {
          const cb = pr.cblks[k], cx = k % pr.cw, cy = Math.floor(k / pr.cw);
          let inc;
          if (!cb.included) inc = pr.incl.decode(bio, cx, cy, l + 1);
          else inc = bio.bit();
          if (!inc) continue;
          if (!cb.included) {
            let i = 0;
            while (!pr.imsb.decode(bio, cx, cy, i)) i++;
            cb.numbps = B.numbps + 1 - i;
            cb.included = true;
          }
          let np;
          if (!bio.bit()) np = 1;
          else if (!bio.bit()) np = 2;
          else { const v = bio.bits(2); if (v < 3) np = 3 + v; else { const v2 = bio.bits(5); np = v2 < 31 ? 6 + v2 : 37 + bio.bits(7); } }
          while (bio.bit()) cb.lblock++;
          /* the passes' lengths, one per codeword segment they reach (B.10.7) */
          let left = np;
          while (left > 0) {
            let seg = cb.segs[cb.segs.length - 1];
            if (!seg || seg.claimed >= seg.max) {
              const max = (sp.cblksty & 4) ? 1 : (sp.cblksty & 1) ? (!seg ? 10 : (seg.max === 1 || seg.max === 10) ? 2 : 1) : 109;
              seg = { max, passes: 0, claimed: 0, chunks: [] };
              cb.segs.push(seg);
            }
            const n = Math.min(left, seg.max - seg.claimed);
            seg.claimed += n;          // passes this and earlier headers gave the segment
            const len = bio.bits(cb.lblock + floorLog2(n));
            contrib.push({ seg, len, n });
            left -= n;
          }
        }
      }
    }
    bio.align();
    let hend = bio.p;
    if (eph) {
      if (hend + 2 <= hsrc.length && hsrc[hend] === 0xff && hsrc[hend + 1] === 0x92) hend += 2;
    }
    if (hdrSrc) hp = hend; else bp = hend;
    for (const k of contrib) {
      if (bp + k.len > body.length) throw truncated(`a packet's code-block data runs past the tile (${bp + k.len - body.length} bytes)`);
      k.seg.chunks.push(body.subarray(bp, bp + k.len));
      k.seg.passes += k.n;
      bp += k.len;
    }
  }

  /* Tier 1, dequantisation and the inverse transforms, component by component. */
  const irreversible = tc.map((x) => x.sp.qmfbid === 0);
  const planes = tc.map((x, c) => {
    const w = x.x1 - x.x0, h = x.y1 - x.y0;
    const plane = irreversible[c] ? new Float32Array(w * h) : new Int32Array(w * h);
    const tmp = new Int32Array(4096);
    for (let r = 0; r < x.res.length; r++) {
      const R0 = x.res[r], prev = r ? x.res[r - 1] : null;
      for (const B of R0.bands) {
        const offx = B.bandno & 1 ? prev.x1 - prev.x0 : 0, offy = B.bandno & 2 ? prev.y1 - prev.y0 : 0;
        const half = f32(0.5 * B.stepsize);
        for (const pr of B.prec) for (const cb of pr.cblks) {
          const cw = cb.x1 - cb.x0, ch = cb.y1 - cb.y0;
          const segs = cb.segs.filter((s) => s.passes > 0).map((s) => ({ data: concat(s.chunks), passes: s.passes }));
          if (!segs.length) continue;
          const bpn = x.roi + cb.numbps;
          if (bpn >= 31) throw corrupt("a code-block of 31 or more bit-planes");
          tmp.fill(0, 0, cw * ch);
          decodeCodeBlock(cw, ch, B.bandno, bpn, cb.numbps, x.sp.cblksty, segs, tmp);
          if (x.roi) {
            const th = 2 ** x.roi;
            for (let i = 0; i < cw * ch; i++) { const v = tmp[i], m = Math.abs(v); if (m >= th) tmp[i] = v < 0 ? -(m >> x.roi) : m >> x.roi; }
          }
          const bx = cb.x0 - B.x0 + offx, by = cb.y0 - B.y0 + offy;
          for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
            const v = tmp[j * cw + i];
            plane[(by + j) * w + bx + i] = irreversible[c] ? f32(f32(v) * half) : Math.trunc(v / 2);
          }
        }
      }
    }
    /* Inverse wavelet, level by level: rows, then columns (OpenJPEG's order). */
    for (let r = 1; r < x.res.length; r++) {
      const R0 = x.res[r], prev = x.res[r - 1];
      const rw = R0.x1 - R0.x0, rh = R0.y1 - R0.y0, sw = prev.x1 - prev.x0, sh = prev.y1 - prev.y0;
      const casx = R0.x0 & 1, casy = R0.y0 & 1;
      const line = irreversible[c] ? new Float32Array(Math.max(rw, rh)) : new Int32Array(Math.max(rw, rh));
      const oneD = irreversible[c] ? idwt97 : idwt53;
      for (let y = 0; y < rh; y++) {
        const o = y * w;
        for (let i = 0; i < sw; i++) line[casx ? 2 * i + 1 : 2 * i] = plane[o + i];
        for (let i = 0; i < rw - sw; i++) line[casx ? 2 * i : 2 * i + 1] = plane[o + sw + i];
        oneD(line, rw, casx);
        for (let i = 0; i < rw; i++) plane[o + i] = line[i];
      }
      for (let xx = 0; xx < rw; xx++) {
        for (let i = 0; i < sh; i++) line[casy ? 2 * i + 1 : 2 * i] = plane[i * w + xx];
        for (let i = 0; i < rh - sh; i++) line[casy ? 2 * i : 2 * i + 1] = plane[(sh + i) * w + xx];
        oneD(line, rh, casy);
        for (let i = 0; i < rh; i++) plane[i * w + xx] = line[i];
      }
    }
    return plane;
  });

  /* The component transform (G.2, G.3), then rounding, level shift and clamp. */
  if (cod.mct && comps.length >= 3) {
    const [a, b, c] = planes;
    if (irreversible[0] !== irreversible[1] || irreversible[1] !== irreversible[2]) throw corrupt("a colour transform over mixed wavelets");
    if (irreversible[0]) {
      for (let i = 0; i < a.length; i++) {
        const y = a[i], u = b[i], v = c[i];
        a[i] = f32(y + f32(v * f32(1.402)));
        b[i] = f32(f32(y - f32(u * f32(0.34413))) - f32(v * f32(0.71414)));
        c[i] = f32(y + f32(u * f32(1.772)));
      }
    } else {
      for (let i = 0; i < a.length; i++) {
        const y = a[i], u = b[i], v = c[i];
        const g = y - Math.floor((u + v) / 4);
        a[i] = v + g; b[i] = g; c[i] = u + g;
      }
    }
  }
  return { tile, tc, planes, irreversible };
}

function concat(parts) {
  if (parts.length === 1) return parts[0];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

/** lrintf under the default rounding mode: to nearest, ties to even. */
function rintEven(v) {
  const f = Math.floor(v), d = v - f;
  if (d < 0.5) return f;
  if (d > 0.5) return f + 1;
  return f % 2 === 0 ? f : f + 1;
}

/**
 * Decode a `JPXDecode` stream (a JP2 file or a bare codestream). Returns
 * `{ width, height, comps, samples, detail }`: `samples` interleaved 8-bit,
 * one byte per component per pixel, rows top to bottom.
 */
export function decodeJpx(d) {
  const box = container(d);
  const cs = parseCodestream(d, box.cs[0], box.cs[1]);
  const { siz } = cs;
  const nc = siz.comps.length;
  if (nc !== 1 && nc !== 3) throw samples(`${nc} components; only 1 (grey) or 3 (colour) are decoded here`, { components: nc });
  for (const cp of siz.comps) {
    if (cp.dx !== 1 || cp.dy !== 1) throw samples("a sub-sampled component", { dx: cp.dx, dy: cp.dy });
    if (cp.sgnd) throw samples("signed samples");
    if (cp.prec !== 8) throw samples(`${cp.prec}-bit samples; only 8-bit are decoded here`, { precision: cp.prec });
  }
  /* PPM: the main header's packed packet headers, dealt out to tiles in order. */
  if (cs.main.ppm.length) {
    const all = concat(cs.main.ppm);
    const per = [];
    let p = 0;
    while (p + 4 <= all.length) {
      const n = ((all[p] << 24) | (all[p + 1] << 16) | (all[p + 2] << 8) | all[p + 3]) >>> 0;
      per.push(all.subarray(p + 4, p + 4 + n)); p += 4 + n;
    }
    const order = [...cs.tiles.keys()];
    cs.ppmTile = (no) => per[order.indexOf(no)] || null;
  }
  const W = siz.X - siz.XO, H = siz.Y - siz.YO;
  const nTiles = ceilDiv(siz.X - siz.XTO, siz.XT) * ceilDiv(siz.Y - siz.YTO, siz.YT);
  let out = nTiles > 1 ? new Uint8Array(W * H * nc) : null;
  if (cs.tiles.size < nTiles) throw truncated(`${cs.tiles.size} of ${nTiles} tiles are present`);
  let transform = null;
  for (const [no, t] of cs.tiles) {
    if (no >= nTiles) throw corrupt(`tile ${no} of ${nTiles}`);
    const { tile, tc, planes, irreversible } = decodeTile(cs, t, no);
    transform ??= irreversible[0] ? "9/7" : "5/3";
    const shift = 1 << 7;
    /* MEMORY. A single-tile page's samples are written into the first
     * component's own buffer (4 bytes a sample, of which the output needs at
     * most 3): a 2550x3300 colour page holds three 33.6 MB planes, and a fourth
     * 25 MB array beside them is what took it past a 128 MB isolate. The write
     * for pixel i lands at byte i*nc+c < 4*(i+1), on plane-0 samples already
     * read, so nothing is read after it is overwritten. */
    if (!out) out = new Uint8Array(planes[0].buffer, 0, W * H * nc);
    for (let c = 0; c < nc; c++) {
      const x = tc[c], w = x.x1 - x.x0, pl = planes[c];
      for (let j = 0; j < x.y1 - x.y0; j++) for (let i = 0; i < w; i++) {
        const v = pl[j * w + i];
        let s = irreversible[c] ? (v > 2147483647 ? 255 : v < -2147483648 ? 0 : rintEven(v) + shift) : v + shift;
        s = s < 0 ? 0 : s > 255 ? 255 : s;
        out[((tile.y0 - siz.YO + j) * W + (tile.x0 - siz.XO + i)) * nc + c] = s;
      }
    }
  }
  const cod = cs.main.cod;
  return { width: W, height: H, comps: nc, samples: out,
           detail: { container: box.jp2 ? "jp2" : "codestream", colour: box.colour, tiles: nTiles, layers: cod.layers,
                     levels: cod.sp.nl, transform, progression: ["LRCP", "RLCP", "RPCL", "PCRL", "CPRL"][cod.prog] ?? cod.prog,
                     colour_transform: !!cod.mct } };
}
