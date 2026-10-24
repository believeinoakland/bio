/* file-safety: a ZIP file's central directory read from its END by range reads (R56; fix round 9, G130c, G130d, G136d).
 * A file of any size is graded from its directory, never from the whole of it: the tail names every member, whether it is
 * encrypted, and where each lies, so a 24 MiB + 1 office file is judged, and rendered, without being loaded. `src` is a
 * range source `{size, read(offset, length) -> Uint8Array}`; a source that cannot be read, or a directory that does not
 * hold together, answers `{ok:false, why}`, never a throw. Reads names and flags only; it inflates nothing but the small
 * relationship parts `memberText` is asked for, and runs nothing. */
import { ARCHIVE_DIRECTORY_MAX, ARCHIVE_ENTRIES_MAX, ARCHIVE_NAME_MAX, STRUCTURAL_PART_MAX } from "../ooxml.mjs";

const SIG_EOCD = 0x06054b50, SIG_LOC64 = 0x07064b50, SIG_REC64 = 0x06064b50, SIG_CENTRAL = 0x02014b50, SIG_LOCAL = 0x04034b50;
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const u64 = (b, o) => u32(b, o) + u32(b, o + 4) * 4294967296;
const LATIN1 = new TextDecoder("latin1");
const UTF8 = new TextDecoder("utf-8");

/** Whether the tail of a file holds a ZIP end record whose directory lies inside the file (a ZIP a PDF, an image or a text
 *  was joined to), from the last `window` bytes alone. */
export function hasZipEnd(tail) {
  if (!(tail instanceof Uint8Array)) return false;
  for (let p = tail.length - 22; p >= 0; p--) if (u32(tail, p) === SIG_EOCD && p + 22 + u16(tail, p + 20) === tail.length) return true;
  return false;
}

/** `{ok:true, entries:[{name, flags, method, compressed, uncompressed, offset, encrypted}], encrypted}` or `{ok:false, why}`. */
export async function readDirectory(src) {
  try {
    const size = src.size;
    if (!Number.isSafeInteger(size) || size < 22) return { ok: false, why: "too_short_for_zip" };
    const floor = Math.max(0, size - 22 - 0xffff);
    const win = await src.read(floor, size - floor);
    let eocd = -1;
    for (let p = win.length - 22; p >= 0; p--) if (u32(win, p) === SIG_EOCD) { eocd = p; break; }
    if (eocd < 0) return { ok: false, why: "eocd_not_found" };
    let total = u16(win, eocd + 10), cdSize = u32(win, eocd + 12), cdOffset = u32(win, eocd + 16);
    if (total === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
      const at = floor + eocd - 20;
      const loc = at >= 0 ? await src.read(at, 20) : null;
      if (!loc || u32(loc, 0) !== SIG_LOC64) return { ok: false, why: "zip64_record_invalid" };
      const rec = u64(loc, 8);
      const z = await src.read(rec, 56);
      if (u32(z, 0) !== SIG_REC64) return { ok: false, why: "zip64_record_invalid" };
      total = u64(z, 32); cdSize = u64(z, 40); cdOffset = u64(z, 48);
    }
    if (total > ARCHIVE_ENTRIES_MAX) return { ok: false, why: "ARCHIVE_ENTRIES_MAX" };
    if (cdSize > ARCHIVE_DIRECTORY_MAX) return { ok: false, why: "ARCHIVE_DIRECTORY_MAX" };
    if (cdOffset + cdSize > size) return { ok: false, why: "central_directory_truncated" };
    const cd = await src.read(cdOffset, cdSize);
    const entries = [];
    let p = 0, encrypted = false;
    for (let i = 0; i < total; i++) {
      if (p + 46 > cd.length || u32(cd, p) !== SIG_CENTRAL) return { ok: false, why: "central_directory_truncated" };
      const flags = u16(cd, p + 8), method = u16(cd, p + 10);
      let compressed = u32(cd, p + 20), uncompressed = u32(cd, p + 24), offset = u32(cd, p + 42);
      const nameLen = u16(cd, p + 28), extraLen = u16(cd, p + 30), commentLen = u16(cd, p + 32);
      if (nameLen > ARCHIVE_NAME_MAX || p + 46 + nameLen + extraLen + commentLen > cd.length) return { ok: false, why: "central_directory_truncated" };
      const nameBytes = cd.subarray(p + 46, p + 46 + nameLen);
      const name = (flags & 0x0800 ? UTF8 : LATIN1).decode(nameBytes);
      /* ZIP64 extra: the 64-bit values stand where the 32-bit ones hold the sentinel, in this order */
      let x = p + 46 + nameLen;
      const xend = x + extraLen;
      while (x + 4 <= xend) {
        const id = u16(cd, x), len = u16(cd, x + 2);
        if (id === 1) {
          let at = x + 4;
          if (uncompressed === 0xffffffff && at + 8 <= x + 4 + len) { uncompressed = u64(cd, at); at += 8; }
          if (compressed === 0xffffffff && at + 8 <= x + 4 + len) { compressed = u64(cd, at); at += 8; }
          if (offset === 0xffffffff && at + 8 <= x + 4 + len) { offset = u64(cd, at); at += 8; }
        }
        x += 4 + len;
      }
      const enc = (flags & 0x2041) !== 0 || method === 99;
      if (enc) encrypted = true;
      entries.push({ name, flags, method, compressed, uncompressed, offset, encrypted: enc });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return { ok: true, entries, encrypted };
  } catch { return { ok: false, why: "source_unreadable" }; }
}

/** One small member's text (a relationships part), at most `max` bytes inflated (ooxml's structural-part ceiling by default); `{ok:true, text}` or `{ok:false, why}`. */
export async function memberText(src, entry, max = STRUCTURAL_PART_MAX) {
  try {
    if (entry.encrypted) return { ok: false, why: "MEMBER_ENCRYPTED" };
    if (!(entry.uncompressed <= max)) return { ok: false, why: "over_bound" };
    const lh = await src.read(entry.offset, 30);
    if (u32(lh, 0) !== SIG_LOCAL) return { ok: false, why: "local_header_invalid" };
    const start = entry.offset + 30 + u16(lh, 26) + u16(lh, 28);
    if (start + entry.compressed > src.size) return { ok: false, why: "member_truncated" };
    const raw = await src.read(start, entry.compressed);
    let bytes;
    if (entry.method === 0) bytes = raw;
    else if (entry.method === 8) {
      const reader = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
      const chunks = []; let n = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        n += value.length;
        if (n > max) { reader.cancel().catch(() => {}); return { ok: false, why: "over_bound" }; }
        chunks.push(value);
      }
      bytes = new Uint8Array(n);
      let at = 0; for (const c of chunks) { bytes.set(c, at); at += c.length; }
    } else return { ok: false, why: "unsupported_compression_method" };
    return { ok: true, text: UTF8.decode(bytes) };
  } catch { return { ok: false, why: "inflate_failed" }; }
}
