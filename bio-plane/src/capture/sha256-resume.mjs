// @ts-check
/* capture, R113 (G173; K5001): a SHA-256 stream whose running state can be written down and taken up again. An upload sent in parts hashes the whole file in
   order across its parts, and the object receiving them can be taken out of memory between two parts; the state of the digest so far (eight words, the bytes
   not yet a full block, and the length) is kept with the upload's row, a few hundred bytes, so the next part continues where the last ended. The stream in
   `record-grammar` (`createSha256`) offers no such state, so this is the same FIPS 180-4 compression with a state to save; the module's tests drive it against
   WebCrypto over the block boundaries, as that module's own tests drive its stream. */

const K = new Int32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

const HEX = /^[0-9a-f]*$/;

/** A resumable SHA-256 stream. `createResumableSha256(state)` takes up a state `snapshot()` answered (a string); a state that is not one this module wrote
 *  answers `null` rather than a stream, so the caller can say the digest is lost. `update(bytes)` takes a Uint8Array and chains; `snapshot()` answers the
 *  state as a string, leaving the stream usable; `hex()` finalizes. */
export function createResumableSha256(state = null) {
  const h = new Int32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const buf = new Uint8Array(64);
  const w = new Int32Array(64);
  let bufLen = 0, total = 0, finalized = false;

  if (state !== null) {
    let s;
    try { s = JSON.parse(state); } catch { return null; }
    const ok = s && typeof s === "object" && Array.isArray(s.h) && s.h.length === 8 && s.h.every((v) => Number.isInteger(v) && v >= 0 && v <= 0xffffffff)
      && Number.isSafeInteger(s.t) && s.t >= 0 && typeof s.b === "string" && HEX.test(s.b) && s.b.length % 2 === 0 && s.b.length / 2 === s.t % 64;
    if (!ok) return null;
    s.h.forEach((v, i) => { h[i] = v | 0; });
    bufLen = s.b.length / 2;
    for (let i = 0; i < bufLen; i++) buf[i] = parseInt(s.b.slice(2 * i, 2 * i + 2), 16);
    total = s.t;
  }

  function compress(bytes, off) {
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
      off += 4;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }

  return {
    update(chunk) {
      if (finalized) throw new Error("sha256 stream already finalized");
      if (!(chunk instanceof Uint8Array)) throw new TypeError("sha256 update takes a Uint8Array");
      let i = 0;
      const n = chunk.length;
      total += n;
      if (bufLen > 0) {
        while (bufLen < 64 && i < n) buf[bufLen++] = chunk[i++];
        if (bufLen === 64) { compress(buf, 0); bufLen = 0; }
      }
      while (n - i >= 64) { compress(chunk, i); i += 64; }
      while (i < n) buf[bufLen++] = chunk[i++];
      return this;
    },
    /** The running state, as a string: the eight words, the length so far, and the bytes held back for the next block (hex). */
    snapshot() {
      if (finalized) throw new Error("sha256 stream already finalized");
      let b = "";
      for (let i = 0; i < bufLen; i++) b += (buf[i] < 16 ? "0" : "") + buf[i].toString(16);
      return JSON.stringify({ h: Array.from(h, (v) => v >>> 0), t: total, b });
    },
    /** The number of bytes hashed so far. */
    get length() { return total; },
    hex() {
      if (finalized) throw new Error("sha256 stream already finalized");
      finalized = true;
      const bitHi = Math.floor(total / 0x20000000);
      const bitLo = (total % 0x20000000) * 8;
      buf[bufLen++] = 0x80;
      if (bufLen > 56) { while (bufLen < 64) buf[bufLen++] = 0; compress(buf, 0); bufLen = 0; }
      while (bufLen < 56) buf[bufLen++] = 0;
      buf[56] = (bitHi >>> 24) & 0xff; buf[57] = (bitHi >>> 16) & 0xff; buf[58] = (bitHi >>> 8) & 0xff; buf[59] = bitHi & 0xff;
      buf[60] = (bitLo >>> 24) & 0xff; buf[61] = (bitLo >>> 16) & 0xff; buf[62] = (bitLo >>> 8) & 0xff; buf[63] = bitLo & 0xff;
      compress(buf, 0);
      let out = "";
      for (let i = 0; i < 8; i++) out += ("00000000" + (h[i] >>> 0).toString(16)).slice(-8);
      return out;
    },
  };
}
