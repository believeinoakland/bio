/* What the module reads of a file's own structure before it is converted or unpacked (R2, R5): the names a legacy
 * Office file's compound-file directory holds (a VBA project or Word's `Macros` storage states macros), and a ZIP's
 * central directory (its members, sizes and encryption flags, for the bounds before any member is inflated). Nothing
 * here runs or loads code; each answers `null` for bytes that are not its format, and never throws. Pure. */

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const u64 = (b, o) => u32(b, o) + u32(b, o + 4) * 4294967296;

const CFB_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const END = 0xfffffffe, FREE = 0xffffffff;

/* The entry names of a compound file (`.doc`, `.xls`, `.ppt`), or null when the bytes are not one or the directory
 * cannot be walked. A chain that loops or leaves the file ends the walk with what was read. */
export function cfbNames(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 512 || CFB_MAGIC.some((v, i) => bytes[i] !== v)) return null;
  const shift = u16(bytes, 0x1e);
  if (shift !== 9 && shift !== 12) return null;
  const size = 1 << shift;
  const sector = (n) => 512 + n * size;
  const fatSectors = [];
  for (let i = 0; i < 109; i++) { const s = u32(bytes, 0x4c + i * 4); if (s !== FREE && s !== END) fatSectors.push(s); }
  let difat = u32(bytes, 0x44);
  const seen = new Set();
  while (difat !== END && difat !== FREE && !seen.has(difat) && sector(difat) + size <= bytes.length) {
    seen.add(difat);
    const at = sector(difat);
    for (let i = 0; i < size / 4 - 1; i++) { const s = u32(bytes, at + i * 4); if (s !== FREE && s !== END) fatSectors.push(s); }
    difat = u32(bytes, at + size - 4);
  }
  const next = (s) => {
    const perSector = size / 4, which = Math.floor(s / perSector);
    if (which >= fatSectors.length) return END;
    const at = sector(fatSectors[which]) + (s % perSector) * 4;
    return at + 4 <= bytes.length ? u32(bytes, at) : END;
  };
  const names = [];
  const walked = new Set();
  for (let s = u32(bytes, 0x30); s !== END && s !== FREE && !walked.has(s); s = next(s)) {
    walked.add(s);
    const at = sector(s);
    if (at + size > bytes.length) break;
    for (let e = 0; e < size / 128; e++) {
      const o = at + e * 128;
      const len = u16(bytes, o + 0x40);
      const type = bytes[o + 0x42];
      if (!type || len < 2 || len > 64) continue;
      let name = '';
      for (let i = 0; i < len - 2; i += 2) name += String.fromCharCode(u16(bytes, o + i));
      names.push(name);
    }
  }
  return names;
}

/* Whether the bytes carry the signature of the kind they are converted as (R1, R8): a compound file for `.doc`, `.xls`
 * and `.ppt`, `{\rtf` for RTF, a ZIP for a macro-enabled package. LibreOffice opens any bytes as something, so bytes
 * that are not the kind are refused rather than converted as text. */
export function signatureOf(kind, bytes) {
  if (!(bytes instanceof Uint8Array)) return false;
  if (kind === 'doc' || kind === 'xls' || kind === 'ppt') return CFB_MAGIC.every((v, i) => bytes[i] === v);
  if (kind === 'rtf') return new TextDecoder('latin1').decode(bytes.subarray(0, 5)) === '{\\rtf';
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 3 && bytes[3] === 4;
}

/* The storages and streams that hold a VBA project or Word's macros in a compound file */
const MACRO_ENTRIES = ['Macros', '_VBA_PROJECT_CUR', '_VBA_PROJECT', 'VBA', 'PROJECT', 'dir'];

/* R2: whether a file holds macros, read from its structure alone: a compound file's VBA storages, an Office package's
 * `vbaProject.bin` or an OpenDocument package's `Basic/` library; RTF carries none. */
export function macrosIn(kind, bytes) {
  const names = cfbNames(bytes);
  if (names) return names.some((n) => MACRO_ENTRIES.includes(n));
  const zip = zipDirectory(bytes);
  if (zip?.ok) return zip.members.some((m) => /(^|\/)vbaProject\.bin$/i.test(m.name) || /^Basic\/.+\.xml$/.test(m.name) || /(^|\/)vbaData\.xml$/i.test(m.name));
  return false;
}

/* The central directory of a ZIP (ZIP64 included): { ok: true, members: [{ name, size, packed, encrypted, method }] },
 * or { ok: false, why } for a ZIP whose directory cannot be read, or null when the bytes carry no end record. */
export function zipDirectory(bytes) {
  if (!(bytes instanceof Uint8Array)) return null;
  const end = zipEnd(bytes, 0);
  if (!end) return null;
  let { count, offset } = end;
  if (end.zip64At != null) {
    const at = end.zip64At;
    if (at + 56 > bytes.length || u32(bytes, at) !== 0x06064b50) return { ok: false, why: 'directory' };
    count = u64(bytes, at + 32); offset = u64(bytes, at + 48);
  }
  return zipEntries(bytes.subarray(Math.min(offset, bytes.length), end.at), count);
}

/* the length of a ZIP's tail that holds its end record wherever its comment puts it */
export const ZIP_TAIL = 22 + 0xffff + 20;

/* The end record in `tail`, the last bytes of a file whose first byte of `tail` sits at `base`: { at (in tail),
 * count, offset, zip64At (absolute, when a ZIP64 locator names the ZIP64 end record) }, or null. */
export function zipEnd(tail, base) {
  if (!(tail instanceof Uint8Array) || tail.length < 22) return null;
  let eocd = -1;
  for (let i = tail.length - 22, stop = Math.max(0, tail.length - ZIP_TAIL); i >= stop; i--) {
    if (u32(tail, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return null;
  const locator = eocd - 20;
  const zip64At = locator >= 0 && u32(tail, locator) === 0x07064b50 ? u64(tail, locator + 8) : null;
  return { at: eocd, absolute: base + eocd, count: u16(tail, eocd + 10), offset: u32(tail, eocd + 16), zip64At };
}

/* the ZIP64 end record's count and offset, from its 56 bytes */
export const zip64End = (rec) => (rec?.length >= 56 && u32(rec, 0) === 0x06064b50 ? { count: u64(rec, 32), offset: u64(rec, 48) } : null);

/* The members of a central directory `dir` of `count` entries: { ok: true, members } or { ok: false, why }. */
export function zipEntries(dir, count) {
  const bytes = dir;
  const members = [];
  let o = 0;
  for (let i = 0; i < count; i++) {
    if (o + 46 > bytes.length || u32(bytes, o) !== 0x02014b50) return { ok: false, why: 'directory' };
    const flags = u16(bytes, o + 8), method = u16(bytes, o + 10);
    let packed = u32(bytes, o + 20), size = u32(bytes, o + 24);
    const nameLen = u16(bytes, o + 28), extraLen = u16(bytes, o + 30), commentLen = u16(bytes, o + 32);
    if (o + 46 + nameLen + extraLen > bytes.length) return { ok: false, why: 'directory' };
    const name = new TextDecoder().decode(bytes.subarray(o + 46, o + 46 + nameLen));
    for (let e = o + 46 + nameLen, end = e + extraLen; e + 4 <= end;) {
      const id = u16(bytes, e), len = u16(bytes, e + 2);
      if (id === 0x0001) {
        let p = e + 4;
        if (size === 0xffffffff) { size = u64(bytes, p); p += 8; }
        if (packed === 0xffffffff) { packed = u64(bytes, p); p += 8; }
      }
      e += 4 + len;
    }
    members.push({ name, size, packed, encrypted: (flags & 1) === 1, method, directory: name.endsWith('/') });
    o += 46 + nameLen + extraLen + commentLen;
  }
  return { ok: true, members };
}
