/* case-checker — reading one part of a case file (requirements: `build/requirements/case-checker.md` R1, R2, R13).
 *
 * A part is a stored (uncompressed) ZIP with fixed timestamps (`public-read` R6). This is the checker's own reader, so
 * the standalone program (R13) needs nothing else: it walks the central directory, takes each entry's stored bytes, and
 * checks each entry's length and CRC-32 against the directory before handing the bytes over. An entry that is
 * compressed, encrypted, truncated or fails its CRC is named, never read around. Pure; never throws. */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Bytes from a `Uint8Array`, an `ArrayBuffer` or another view; null for anything else. */
export function asBytes(v) {
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (ArrayBuffer.isView(v)) return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
  return null;
}

const utf8 = new TextDecoder("utf-8", { fatal: false });

/** One part's entries: `{ok: true, entries: Map(name → bytes)}`, or `{ok: false, problem}` naming why the bytes are not
 *  a stored ZIP this checker can read. An entry it cannot read whole is named in `problems` and left out. */
export function readStoredZip(input) {
  const b = asBytes(input);
  if (!b) return { ok: false, problem: "the part is not bytes" };
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return { ok: false, problem: "the part is not a ZIP archive: it has no end-of-central-directory record" };
  const count = dv.getUint16(eocd + 10, true);
  const cdSize = dv.getUint32(eocd + 12, true);
  const cdStart = dv.getUint32(eocd + 16, true);
  if (cdStart + cdSize > eocd) return { ok: false, problem: "the part's central directory lies outside the archive" };
  const entries = new Map();
  const problems = [];
  let p = cdStart;
  for (let k = 0; k < count; k++) {
    if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50)
      return { ok: false, problem: `the part's central directory is cut short at entry ${k + 1} of ${count}` };
    const flags = dv.getUint16(p + 8, true);
    const method = dv.getUint16(p + 10, true);
    const crc = dv.getUint32(p + 16, true);
    const csize = dv.getUint32(p + 20, true);
    const usize = dv.getUint32(p + 24, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = utf8.decode(b.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (entries.has(name)) { problems.push(`the part names ${name} twice`); continue; }
    if (flags & 1) { problems.push(`${name} is encrypted`); continue; }
    if (method !== 0 || csize !== usize) { problems.push(`${name} is compressed; a case file stores every file as it is`); continue; }
    if (local + 30 > b.length || dv.getUint32(local, true) !== 0x04034b50) { problems.push(`${name} has no local header`); continue; }
    const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    if (start + usize > b.length) { problems.push(`${name} is cut short`); continue; }
    const bytes = b.subarray(start, start + usize);
    if (crc32(bytes) !== crc) { problems.push(`${name} fails its CRC-32`); continue; }
    entries.set(name, bytes);
  }
  return { ok: true, entries, problems };
}
