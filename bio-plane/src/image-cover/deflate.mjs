/* image-cover: a streaming zlib compressor, so a redrawn picture's rows are deflated as they are decoded (R12; T53-513, K5628).
 *
 * The strip-wise JPEG decoder hands its rows to a synchronous callback, and the platform's `CompressionStream` can only be
 * fed asynchronously: fed from that callback it would queue the whole bitmap. This writes the zlib stream itself, one band
 * of input at a time, so the working set is the last 32,768 bytes of input (the window), the band being compressed and its
 * tokens, never the picture. Each band is one DEFLATE block (RFC 1951) with dynamic Huffman codes; matches are found with
 * hash chains inside the window and the band, greedy and bounded in length of chain, so time is linear in the input.
 *
 * `new Deflater(onOver)`; `push(bytes)` any number of times; `finish()` answers `{parts, total}`, the zlib stream (RFC 1950)
 * in chunks. `onOver(total)` is called, and its throw escapes `push`, the moment the compressed output passes the bound the
 * caller keeps: the output is never held past it. Pure (R6): same input, same output. */

const WINDOW = 32768;
const BAND = 262144;
const MAX_MATCH = 258;
const MAX_CHAIN = 24;
const NICE = 96;
const HASH_BITS = 15;
const OUT_CHUNK = 262144;

const LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const LEN_CODE = (() => {
  const t = new Uint8Array(MAX_MATCH + 1);
  for (let c = 0; c < LEN_BASE.length; c++) {
    const hi = c + 1 < LEN_BASE.length ? LEN_BASE[c + 1] - 1 : MAX_MATCH;
    for (let l = LEN_BASE[c]; l <= Math.min(hi, MAX_MATCH); l++) t[l] = c;
  }
  t[MAX_MATCH] = 28;
  return t;
})();
const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/** The distance code of `d` (1..32768) and its extra bits. */
function distCode(d) {
  if (d <= 4) return d - 1;
  const l = 31 - Math.clz32(d - 1);
  return 2 * l + (((d - 1) >> (l - 1)) & 1);
}
const distBase = (c) => (c < 4 ? c + 1 : (1 << ((c >> 1))) + 1 + ((c & 1) << ((c >> 1) - 1)));
const distExtra = (c) => (c < 4 ? 0 : (c >> 1) - 1);

/** Code lengths (at most `limit`) for the frequencies `freq`; 0 for an unused symbol. A single used symbol gets length 1. */
function codeLengths(freq, limit) {
  const n = freq.length, len = new Uint8Array(n);
  const used = [];
  for (let i = 0; i < n; i++) if (freq[i] > 0) used.push(i);
  if (used.length === 0) return len;
  if (used.length === 1) { len[used[0]] = 1; return len; }
  /* Huffman by two queues over the symbols sorted by frequency */
  used.sort((a, b) => freq[a] - freq[b] || a - b);
  const m = used.length, weight = new Float64Array(2 * m), parent = new Int32Array(2 * m).fill(-1);
  for (let i = 0; i < m; i++) weight[i] = freq[used[i]];
  let leaf = 0, node = m, next = m;
  const take = () => (leaf < m && (node >= next || weight[leaf] <= weight[node]) ? leaf++ : node++);
  for (let k = 0; k < m - 1; k++) {
    const a = take(), b = take();
    weight[next] = weight[a] + weight[b];
    parent[a] = next; parent[b] = next;
    next++;
  }
  const depth = new Int32Array(2 * m);
  for (let i = next - 2; i >= 0; i--) depth[i] = depth[parent[i]] + 1;
  let over = false;
  for (let i = 0; i < m; i++) { let d = depth[i]; if (d > limit) { d = limit; over = true; } len[used[i]] = d; }
  if (over) {
    /* the lengths were cut to the limit: restore the Kraft sum by lengthening the cheapest shorter codes */
    const full = 1 << limit;
    let kraft = 0;
    for (const s of used) kraft += 1 << (limit - len[s]);
    const byCost = [...used].sort((a, b) => freq[a] - freq[b] || a - b);
    while (kraft > full) {
      let moved = false;
      for (const s of byCost) if (len[s] < limit) { kraft -= 1 << (limit - len[s] - 1); len[s]++; moved = true; if (kraft <= full) break; }
      if (!moved) break;
    }
    /* a code that is not complete is refused by inflate: give the freed space back to the dearest codes */
    for (let s = byCost.length - 1; s >= 0 && kraft < full; s--) {
      const sym = byCost[s];
      while (len[sym] > 1 && kraft + (1 << (limit - len[sym])) <= full) { kraft += 1 << (limit - len[sym]); len[sym]--; }
    }
  }
  return len;
}

/** The canonical codes for the lengths, each bit-reversed for writing least significant bit first. */
function codesOf(len) {
  const maxLen = Math.max(...len, 1), count = new Uint32Array(maxLen + 2), codes = new Uint32Array(len.length);
  for (const l of len) if (l) count[l]++;
  const first = new Uint32Array(maxLen + 2);
  let code = 0;
  for (let l = 1; l <= maxLen; l++) { code = (code + count[l - 1]) << 1; first[l] = code; }
  for (let s = 0; s < len.length; s++) {
    const l = len[s];
    if (!l) continue;
    let c = first[l]++, r = 0;
    for (let b = 0; b < l; b++) { r = (r << 1) | (c & 1); c >>= 1; }
    codes[s] = r;
  }
  return codes;
}

export class Deflater {
  constructor(onOver) {
    this.onOver = onOver;
    this.parts = []; this.total = 0;
    this.out = new Uint8Array(OUT_CHUNK); this.o = 0;
    this.bits = 0; this.nbits = 0;
    this.buf = new Uint8Array(WINDOW + BAND + MAX_MATCH);
    this.win = 0; this.fill = 0;
    this.head = new Int32Array(1 << HASH_BITS); this.prev = new Int32Array(WINDOW + BAND + MAX_MATCH);
    this.litlen = new Uint16Array(BAND); this.dist = new Uint16Array(BAND);
    this.a = 1; this.b = 0;                                        // Adler-32
    this.done = false;
    this.byte(0x78); this.byte(0x9c);
  }

  byte(v) {
    if (this.o === this.out.length) this.spill();
    this.out[this.o++] = v;
  }
  spill() {
    if (!this.o) return;
    this.parts.push(this.o === this.out.length ? this.out : this.out.slice(0, this.o));
    this.total += this.o;
    this.out = new Uint8Array(OUT_CHUNK); this.o = 0;
    this.onOver(this.total);
  }
  put(value, n) {
    this.bits |= value << this.nbits; this.nbits += n;
    while (this.nbits >= 8) { this.byte(this.bits & 255); this.bits >>>= 8; this.nbits -= 8; }
  }

  push(data) {
    let a = this.a, b = this.b;
    for (let i = 0; i < data.length; i++) { a += data[i]; if (a >= 65521) a -= 65521; b += a; if (b >= 65521) b -= 65521; }
    this.a = a; this.b = b;
    let at = 0;
    while (at < data.length) {
      const room = this.win + BAND - this.fill, n = Math.min(room, data.length - at);
      this.buf.set(data.subarray(at, at + n), this.fill);
      this.fill += n; at += n;
      if (this.fill - this.win >= BAND) this.band(false);
    }
  }

  /** Compress the input between the window and `fill` as one block. */
  band(final) {
    const { buf, head, prev, litlen, dist } = this;
    const start = this.win, fill = this.fill;
    head.fill(-1);
    const hash = (p) => ((buf[p] << 10) ^ (buf[p + 1] << 5) ^ buf[p + 2]) & ((1 << HASH_BITS) - 1);
    const insert = (p) => { const h = hash(p); prev[p] = head[h]; head[h] = p; };
    for (let p = 0; p + 2 < start; p++) insert(p);
    let n = 0, i = start;
    while (i < fill) {
      let best = 0, bestD = 0;
      if (i + 2 < fill) {
        const limit = Math.min(MAX_MATCH, fill - i);
        let cand = head[hash(i)], chain = 0;
        while (cand >= 0 && i - cand <= WINDOW && chain++ < MAX_CHAIN) {
          if (buf[cand + best] === buf[i + best]) {
            let l = 0;
            while (l < limit && buf[cand + l] === buf[i + l]) l++;
            if (l > best) { best = l; bestD = i - cand; if (l >= NICE || l === limit) break; }
          }
          cand = prev[cand];
        }
        insert(i);
      }
      if (best >= 3) {
        litlen[n] = best; dist[n] = bestD; n++;
        for (let k = 1; k < best; k++) if (i + k + 2 < fill) insert(i + k);
        i += best;
      } else { litlen[n] = buf[i]; dist[n] = 0; n++; i++; }
    }
    this.block(n, final);
    const keep = Math.min(WINDOW, fill);
    buf.copyWithin(0, fill - keep, fill);
    this.win = keep; this.fill = keep;
  }

  /** Write the `n` tokens as one dynamic-Huffman block. */
  block(n, final) {
    const { litlen, dist } = this;
    const lf = new Uint32Array(286), df = new Uint32Array(30);
    for (let t = 0; t < n; t++) {
      if (dist[t] === 0) lf[litlen[t]]++;
      else { lf[257 + LEN_CODE[litlen[t]]]++; df[distCode(dist[t])]++; }
    }
    lf[256] = 1;
    const ll = codeLengths(lf, 15);
    let dl = codeLengths(df, 15);
    if (!dl.some((x) => x)) dl = new Uint8Array(30);
    let hlit = 286; while (hlit > 257 && !ll[hlit - 1]) hlit--;
    let hdist = 30; while (hdist > 1 && !dl[hdist - 1]) hdist--;
    /* the lengths as run-length symbols */
    const lens = [...ll.subarray(0, hlit), ...dl.subarray(0, hdist)], rle = [];
    for (let k = 0; k < lens.length;) {
      let run = 1;
      while (k + run < lens.length && lens[k + run] === lens[k]) run++;
      const v = lens[k];
      if (v === 0 && run >= 3) { const r = Math.min(run, 138); if (r >= 11) rle.push([18, r - 11, 7]); else rle.push([17, r - 3, 3]); k += r; }
      else if (v !== 0 && run >= 4) { rle.push([v, 0, 0]); const r = Math.min(run - 1, 6); rle.push([16, r - 3, 2]); k += 1 + r; }
      else { rle.push([v, 0, 0]); k++; }
    }
    const cf = new Uint32Array(19);
    for (const [s] of rle) cf[s]++;
    /* the code-length code must be complete, which one symbol alone is not: a second, unused symbol is given a place */
    if (cf.filter((x) => x).length < 2) cf[cf[0] ? 1 : 0] = 1;
    const cl = codeLengths(cf, 7);
    let hclen = 19; while (hclen > 4 && !cl[ORDER[hclen - 1]]) hclen--;
    const cc = codesOf(cl), lc = codesOf(ll), dc = codesOf(dl);
    this.put(final ? 1 : 0, 1); this.put(2, 2);
    this.put(hlit - 257, 5); this.put(hdist - 1, 5); this.put(hclen - 4, 4);
    for (let k = 0; k < hclen; k++) this.put(cl[ORDER[k]], 3);
    for (const [s, extra, bits] of rle) { this.put(cc[s], cl[s]); if (bits) this.put(extra, bits); }
    for (let t = 0; t < n; t++) {
      if (dist[t] === 0) { const s = litlen[t]; this.put(lc[s], ll[s]); continue; }
      const len = litlen[t], c = LEN_CODE[len], s = 257 + c;
      this.put(lc[s], ll[s]);
      if (LEN_EXTRA[c]) this.put(len - LEN_BASE[c], LEN_EXTRA[c]);
      const d = dist[t], k = distCode(d);
      this.put(dc[k], dl[k]);
      if (distExtra(k)) this.put(d - distBase(k), distExtra(k));
    }
    this.put(lc[256], ll[256]);
  }

  /** End the stream: the last block, the byte boundary, the Adler-32; `{parts, total}`. */
  finish() {
    if (this.done) throw new Error("finished twice");
    this.done = true;
    this.band(true);
    if (this.nbits) this.put(0, 8 - this.nbits);
    const adler = ((this.b << 16) | this.a) >>> 0;
    for (const sh of [24, 16, 8, 0]) this.byte((adler >>> sh) & 255);
    this.spill();
    return { parts: this.parts, total: this.total };
  }
}
