/* register-readers R2: a zip read by its central directory, and one member streamed at a time.
 *
 * `ooxml`'s zip services bound a member and an archive far below the measured register files (its R30), so this module
 * keeps its own directory reader (ZIP64's end-of-central-directory locator and record, APPNOTE 4.3.14–4.3.16) and its
 * own inflate (RFC 1951), which takes the compressed span in pieces and holds only the 32 KiB window it may refer back
 * into (K5530 F4). Every read goes through `range.read(offset, length)`; nothing outside the directory, or outside the
 * member asked for, is read. */

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

const SIG = { eocd: 0x06054b50, locator: 0x07064b50, eocd64: 0x06064b50, central: 0x02014b50, local: 0x04034b50 };
const EOCD_MIN = 22, LOCATOR = 20, EOCD64_MIN = 56, CENTRAL_MIN = 46, LOCAL_MIN = 30;
const COMMENT_MAX = 0xffff;
const DIRECTORY_PART = 1 << 20;
export const READ_PART = 1 << 20;
export const SUPPORTED_METHODS = Object.freeze([0, 8]);

/* ------------------------------------------------------------------ CRC-32 (ISO 3309, as zip uses it) */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

/** A running CRC-32: `crc32(b, crc32(a))` is the CRC of a then b. */
export function crc32(bytes, crc = 0) {
  let c = ~crc >>> 0;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

/* ------------------------------------------------------------------ the range */

const u16 = (b, i) => b[i] | (b[i + 1] << 8);
const u32 = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
const u64 = (b, i) => u32(b, i) + u32(b, i + 4) * 0x100000000;

const validRange = (r) => isObj(r) && Number.isSafeInteger(r.size) && r.size >= 0 && typeof r.read === "function";

async function readExact(range, offset, length) {
  if (offset < 0 || length < 0 || offset + length > range.size) return null;
  if (length === 0) return new Uint8Array(0);
  const got = await range.read(offset, length);
  const b = got instanceof Uint8Array ? got : got instanceof ArrayBuffer ? new Uint8Array(got) : null;
  return b && b.length === length ? b : null;
}

/* ------------------------------------------------------------------ the directory */

/* The end of the central directory: where it is and how many entries it holds, from the classic record, or from the
   ZIP64 record its locator names. */
async function findDirectory(range) {
  if (range.size < EOCD_MIN) return { ok: false, why: "not_a_zip" };
  /* The end record is found from the end, reading back no further than its comment needs: the last 22 bytes first
     (no comment), then 1 KiB, then the longest comment's reach. */
  let tail = null, tailAt = 0, at = -1;
  for (const reach of [EOCD_MIN, 1024, EOCD_MIN + COMMENT_MAX]) {
    const tailLen = Math.min(range.size, reach);
    tailAt = range.size - tailLen;
    tail = await readExact(range, tailAt, tailLen);
    if (!tail) return { ok: false, why: "directory_unreadable" };
    for (let i = tail.length - EOCD_MIN; i >= 0; i--) {
      if (u32(tail, i) === SIG.eocd && i + EOCD_MIN + u16(tail, i + 20) === tail.length) { at = i; break; }
    }
    if (at >= 0 || tailLen === range.size) break;
  }
  if (at < 0) return { ok: false, why: "not_a_zip" };
  let entries = u16(tail, at + 10), size = u32(tail, at + 12), offset = u32(tail, at + 16);
  const eocdAt = tailAt + at;
  const locAt = eocdAt - LOCATOR;
  const loc = locAt >= 0 ? (locAt >= tailAt ? tail.subarray(locAt - tailAt, locAt - tailAt + LOCATOR) : await readExact(range, locAt, LOCATOR)) : null;
  if (loc && u32(loc, 0) === SIG.locator) {
    const recAt = u64(loc, 8);
    const rec = await readExact(range, recAt, EOCD64_MIN);
    if (!rec || u32(rec, 0) !== SIG.eocd64) return { ok: false, why: "zip64_record_invalid" };
    entries = u64(rec, 32); size = u64(rec, 40); offset = u64(rec, 48);
    if (!Number.isSafeInteger(entries) || !Number.isSafeInteger(size) || !Number.isSafeInteger(offset) || offset + size > recAt) {
      return { ok: false, why: "zip64_record_invalid" };
    }
  } else if (entries === 0xffff || size === 0xffffffff || offset === 0xffffffff) {
    return { ok: false, why: "zip64_record_invalid" };
  }
  if (offset + size > eocdAt) return { ok: false, why: "directory_unreadable" };
  return { ok: true, entries, size, offset };
}

const latin = new TextDecoder("windows-1252");
const utf8 = new TextDecoder("utf-8");

/* One central record at `b[i]`: the member, and the record's length. */
function centralRecord(b, i) {
  if (i + CENTRAL_MIN > b.length || u32(b, i) !== SIG.central) return null;
  const flags = u16(b, i + 8), method = u16(b, i + 10);
  let crc = u32(b, i + 16), compressed = u32(b, i + 20), uncompressed = u32(b, i + 24);
  const nameLen = u16(b, i + 28), extraLen = u16(b, i + 30), commentLen = u16(b, i + 32);
  let offset = u32(b, i + 42);
  const len = CENTRAL_MIN + nameLen + extraLen + commentLen;
  if (i + len > b.length) return null;
  const nameBytes = b.subarray(i + CENTRAL_MIN, i + CENTRAL_MIN + nameLen);
  const name = (flags & 0x0800 ? utf8 : latin).decode(nameBytes);
  /* The ZIP64 extra field holds, in this order, each of the four values whose classic field is all ones. */
  for (let e = i + CENTRAL_MIN + nameLen, end = e + extraLen; e + 4 <= end;) {
    const id = u16(b, e), sz = u16(b, e + 2);
    if (e + 4 + sz > end) break;
    if (id === 0x0001) {
      let p = e + 4;
      const take = () => { if (p + 8 > e + 4 + sz) return null; const v = u64(b, p); p += 8; return v; };
      if (uncompressed === 0xffffffff) uncompressed = take();
      if (compressed === 0xffffffff) compressed = take();
      if (offset === 0xffffffff) offset = take();
      if (uncompressed === null || compressed === null || offset === null) return { bad: true, len };
    }
    e += 4 + sz;
  }
  return { member: { name, method, compressed, uncompressed, offset, crc32: crc }, len };
}

/** R2. `listMembers(range)`: the members as the central directory states them. Reads the end records and the directory,
 *  nothing else. Never throws. */
export async function listMembers(range) {
  try {
    if (!validRange(range)) return { ok: false, why: "not_a_zip" };
    const dir = await findDirectory(range);
    if (!dir.ok) return dir;
    const members = [];
    let carry = new Uint8Array(0);
    for (let at = dir.offset, end = dir.offset + dir.size; at < end || carry.length;) {
      const n = Math.min(DIRECTORY_PART, end - at);
      let b = carry;
      if (n > 0) {
        const part = await readExact(range, at, n);
        if (!part) return { ok: false, why: "directory_unreadable" };
        b = new Uint8Array(carry.length + n);
        b.set(carry); b.set(part, carry.length);
        at += n;
      }
      let i = 0;
      while (i < b.length) {
        const r = centralRecord(b, i);
        if (r === null) break;
        if (r.bad) return { ok: false, why: "directory_unreadable" };
        members.push(r.member);
        i += r.len;
      }
      carry = b.slice(i);
      if (at >= end && carry.length) return { ok: false, why: "directory_unreadable" };
      if (n === 0) break;
    }
    if (members.length !== dir.entries) return { ok: false, why: "directory_unreadable" };
    for (const m of members) {
      if (m.offset + LOCAL_MIN > dir.offset) return { ok: false, why: "directory_unreadable" };
    }
    return { ok: true, members };
  } catch {
    return { ok: false, why: "directory_unreadable" };
  }
}

/* ------------------------------------------------------------------ inflate (RFC 1951) */

const LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/* A canonical Huffman code as a lookup table indexed by the next `bits` input bits (LSB first, codes bit-reversed):
   each entry is (length << 16) | symbol, 0 for no code. Null when the lengths over-subscribe the code. */
function huffman(lengths) {
  let max = 0;
  for (const l of lengths) if (l > max) max = l;
  if (max === 0) return { bits: 1, table: new Int32Array(2), empty: true };
  const count = new Uint16Array(16);
  for (const l of lengths) if (l) count[l]++;
  let left = 1;
  for (let l = 1; l <= 15; l++) { left = (left << 1) - count[l]; if (left < 0) return null; }
  const next = new Uint16Array(16);
  for (let l = 1, code = 0; l <= 15; l++) { code = (code + count[l - 1]) << 1; next[l] = code; }
  const table = new Int32Array(1 << max);
  for (let s = 0; s < lengths.length; s++) {
    const l = lengths[s];
    if (!l) continue;
    let code = next[l]++, rev = 0;
    for (let k = 0; k < l; k++) { rev = (rev << 1) | (code & 1); code >>= 1; }
    for (let i = rev; i < table.length; i += 1 << l) table[i] = (l << 16) | s;
  }
  return { bits: max, table };
}

let FIXED = null;
function fixedTables() {
  if (FIXED) return FIXED;
  const l = new Uint8Array(288);
  l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288);
  FIXED = { lit: huffman(l), dist: huffman(new Uint8Array(30).fill(5)) };
  return FIXED;
}

const WINDOW = 32768;
const OUT_PART = 65536;
/* The input a step may need before it starts: a symbol with its extra bits and a distance with its extra bits fit in 8
   bytes; a dynamic block's header (up to 19×3 + 316×7 bits of code lengths) in 1 KiB. */
const SYMBOL_MARGIN = 8, HEADER_MARGIN = 1024;

class InflateError extends Error {}

/** A raw-deflate decoder fed its input in pieces: `push(bytes)` and `end()` answer the bytes they decoded. A stream that
 *  is not valid deflate is an `InflateError`, caught by the caller. */
export function createInflate() {
  let input = new Uint8Array(0), pos = 0;
  let bitbuf = 0, bitcnt = 0;
  let state = "header", final = false, stored = 0, lit = null, dist = null, done = false;
  const out = new Uint8Array(WINDOW + OUT_PART + 258);
  let op = 0, mark = 0, written = 0;
  const parts = [];

  const avail = () => input.length - pos + (bitcnt >> 3);
  const need = (n) => {
    while (bitcnt < n) {
      if (pos >= input.length) throw new InflateError("input_ended");
      bitbuf |= input[pos++] << bitcnt;
      bitcnt += 8;
    }
  };
  const bits = (n) => {
    if (n === 0) return 0;
    need(n);
    const v = bitbuf & ((1 << n) - 1);
    bitbuf >>>= n; bitcnt -= n;
    return v;
  };
  const decodeSym = (h) => {
    while (bitcnt < h.bits && pos < input.length) { bitbuf |= input[pos++] << bitcnt; bitcnt += 8; }
    const e = h.table[bitbuf & ((1 << h.bits) - 1)];
    const l = e >>> 16;
    if (!l || l > bitcnt) throw new InflateError(l ? "input_ended" : "bad_code");
    bitbuf >>>= l; bitcnt -= l;
    return e & 0xffff;
  };
  const flush = (all) => {
    if (op - mark > 0 && (all || op >= WINDOW + OUT_PART)) {
      parts.push(out.slice(mark, op));
      mark = op;
    }
    if (op >= WINDOW + OUT_PART) {
      out.copyWithin(0, op - WINDOW, op);
      op = WINDOW; mark = WINDOW;
    }
  };
  const header = () => {
    final = bits(1) === 1;
    const type = bits(2);
    if (type === 0) {
      bits(bitcnt & 7);            // to the byte boundary; whole bytes still in the bit buffer are the block's
      const len = bits(16), nlen = bits(16);
      if ((len ^ 0xffff) !== nlen) throw new InflateError("stored_length");
      stored = len;
      state = "stored";
    } else if (type === 1) {
      ({ lit, dist } = fixedTables());
      state = "codes";
    } else if (type === 2) {
      const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
      const cl = new Uint8Array(19);
      for (let i = 0; i < hclen; i++) cl[CL_ORDER[i]] = bits(3);
      const clh = huffman(cl);
      if (!clh || clh.empty) throw new InflateError("bad_code_lengths");
      const lens = new Uint8Array(hlit + hdist);
      for (let i = 0; i < lens.length;) {
        const s = decodeSym(clh);
        if (s < 16) lens[i++] = s;
        else {
          let rep, v = 0;
          if (s === 16) { if (!i) throw new InflateError("bad_repeat"); v = lens[i - 1]; rep = 3 + bits(2); }
          else if (s === 17) rep = 3 + bits(3);
          else rep = 11 + bits(7);
          if (i + rep > lens.length) throw new InflateError("bad_repeat");
          lens.fill(v, i, i + rep); i += rep;
        }
      }
      if (!lens[256]) throw new InflateError("no_end_code");
      lit = huffman(lens.subarray(0, hlit));
      dist = huffman(lens.subarray(hlit));
      if (!lit || !dist) throw new InflateError("bad_code_lengths");
      state = "codes";
    } else throw new InflateError("bad_block_type");
  };
  const run = (last) => {
    while (!done) {
      if (state === "header") {
        if (!last && avail() < HEADER_MARGIN) return;
        header();
      } else if (state === "stored") {
        if (stored === 0) { state = final ? "end" : "header"; continue; }
        if (bitcnt >= 8) { out[op++] = bits(8); written++; stored--; flush(false); continue; }
        const n = Math.min(stored, input.length - pos, WINDOW + OUT_PART - op);
        if (n <= 0) { if (pos >= input.length) { if (last) throw new InflateError("input_ended"); return; } flush(false); continue; }
        out.set(input.subarray(pos, pos + n), op);
        op += n; pos += n; stored -= n; written += n;
        flush(false);
      } else if (state === "codes") {
        if (!last && avail() < SYMBOL_MARGIN) return;
        const s = decodeSym(lit);
        if (s < 256) { out[op++] = s; written++; }
        else if (s === 256) { state = final ? "end" : "header"; }
        else {
          const li = s - 257;
          if (li >= 29) throw new InflateError("bad_length");
          const len = LEN_BASE[li] + bits(LEN_EXTRA[li]);
          const ds = decodeSym(dist);
          if (ds >= 30) throw new InflateError("bad_distance");
          const d = DIST_BASE[ds] + bits(DIST_EXTRA[ds]);
          if (d > written) throw new InflateError("distance_too_far");
          for (let k = 0; k < len; k++) { out[op] = out[op - d]; op++; }
          written += len;
        }
        flush(false);
      } else if (state === "end") {
        done = true;
      }
    }
  };
  const take = () => parts.splice(0, parts.length);
  return {
    push(bytes) {
      if (done) return take();
      input = pos < input.length ? concat(input.subarray(pos), bytes) : bytes;
      pos = 0;
      run(false);
      flush(false);
      return take();
    },
    end() {
      if (!done) run(true);
      flush(true);
      return take();
    },
    get done() { return done; },
    get trailing() { return input.length - pos; },
  };
}

function concat(a, b) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a); c.set(b, a.length);
  return c;
}

/* ------------------------------------------------------------------ one member */

/** R2. `streamZipMember(range, name, opts)` yields the member's decompressed bytes as `Uint8Array` chunks and ends with
 *  `{ok: true, bytes, crc32}`, or `{ok: false, why}` (`member_crc_mismatch` last, after the bytes). It reads the
 *  member's local header and compressed span and nothing else (the directory is read first unless `opts.members`, a
 *  `listMembers` answer's list, is given). Never throws. */
export async function* streamZipMember(range, name, opts = {}) {
  try {
    if (!validRange(range)) { yield { ok: false, why: "not_a_zip" }; return; }
    const o = isObj(opts) ? opts : {};
    let members = Array.isArray(o.members) ? o.members : null;
    if (!members) {
      const listed = await listMembers(range);
      if (!listed.ok) { yield listed; return; }
      members = listed.members;
    }
    const hits = members.filter((m) => isObj(m) && m.name === name);
    if (hits.length === 0) { yield { ok: false, why: "member_missing" }; return; }
    if (hits.length > 1) { yield { ok: false, why: "ambiguous_member" }; return; }
    const m = hits[0];
    if (!SUPPORTED_METHODS.includes(m.method)) { yield { ok: false, why: "unsupported_method", method: m.method }; return; }
    const head = await readExact(range, m.offset, LOCAL_MIN);
    if (!head || u32(head, 0) !== SIG.local) { yield { ok: false, why: "member_unreadable" }; return; }
    const start = m.offset + LOCAL_MIN + u16(head, 26) + u16(head, 28);
    if (start + m.compressed > range.size) { yield { ok: false, why: "member_unreadable" }; return; }
    const part = Number.isInteger(o.readBytes) && o.readBytes > 0 ? o.readBytes : READ_PART;
    const inflate = m.method === 8 ? createInflate() : null;
    let crc = 0, bytes = 0;
    for (let at = start, end = start + m.compressed; at < end || (at === end && at === start);) {
      const n = Math.min(part, end - at);
      const raw = await readExact(range, at, n);
      if (!raw) { yield { ok: false, why: "member_unreadable" }; return; }
      at += n;
      const outs = inflate ? (at >= end ? [...inflate.push(raw), ...inflate.end()] : inflate.push(raw)) : [raw];
      for (const c of outs) {
        if (!c.length) continue;
        crc = crc32(c, crc); bytes += c.length;
        yield c;
      }
      if (n === 0) break;
    }
    if (inflate && !inflate.done) { yield { ok: false, why: "member_unreadable" }; return; }
    if (crc !== m.crc32 || bytes !== m.uncompressed) { yield { ok: false, why: "member_crc_mismatch", bytes, crc32: crc }; return; }
    yield { ok: true, bytes, crc32: crc };
  } catch {
    yield { ok: false, why: "member_unreadable" };
  }
}
