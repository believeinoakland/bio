/* mail-reader: the compound file (MS-CFB) an Outlook MSG is stored in (R2).
 *
 * The directory and every stream's bytes, or null when the bytes are not a well-formed compound file: a bad
 * header, a FAT, DIFAT, mini FAT or stream chain that leaves the file, loops or ends early, or a directory tree
 * that loops. Every chain is walked once, so a stream read never fails later. Written on the reading `ooxml` keeps
 * for a macro project (its `readCfb` is that module's own, not exported). Pure; never throws. */

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const END = 0xfffffffe, FREE = 0xffffffff;

export const CFB_MAGIC = Object.freeze([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

export const hasCfbMagic = (b) => b instanceof Uint8Array && b.length >= 8 && CFB_MAGIC.every((x, i) => b[i] === x);

export function readCfb(b) {
  try { return parse(b); } catch { return null; }
}

function parse(b) {
  if (!(b instanceof Uint8Array) || b.length < 512 || !hasCfbMagic(b) || u16(b, 0x1c) !== 0xfffe) return null;
  const major = u16(b, 0x1a), shift = u16(b, 0x1e);
  if (!((major === 3 && shift === 9) || (major === 4 && shift === 12)) || u16(b, 0x20) !== 6) return null;
  const ss = 1 << shift;
  if (b.length < ss) return null;
  const nSectors = Math.floor((b.length - ss) / ss);
  const sector = (n) => b.subarray(ss * (n + 1), ss * (n + 2));
  const ids = (s) => Array.from({ length: s.length / 4 }, (_, i) => u32(s, 4 * i));
  const nFat = u32(b, 0x2c), cutoff = u32(b, 0x38);
  if (nFat > nSectors || cutoff !== 4096) return null;

  const fatSectors = ids(b.subarray(0x4c, 0x200)).slice(0, Math.min(nFat, 109));
  const seen = new Set();
  for (let s = u32(b, 0x44), k = u32(b, 0x48); fatSectors.length < nFat; k--) {
    if (k <= 0 || s >= nSectors || seen.has(s)) return null;
    seen.add(s);
    const list = ids(sector(s));
    fatSectors.push(...list.slice(0, -1).slice(0, nFat - fatSectors.length));
    s = list[list.length - 1];
  }
  if (fatSectors.some((s) => s >= nSectors)) return null;
  const fat = fatSectors.flatMap((s) => ids(sector(s)));

  const chain = (table, start, limit) => {
    const out = [];
    const visited = new Set();
    for (let s = start; s !== END; s = table[s]) {
      if (s >= limit || s >= table.length || visited.has(s)) return null;
      visited.add(s);
      out.push(s);
    }
    return out;
  };
  const gather = (list, read, unit, size) => {
    if (!list || list.length * unit < size) return null;
    const out = new Uint8Array(list.length * unit);
    list.forEach((s, i) => out.set(read(s), i * unit));
    return out.subarray(0, size);
  };

  const dirChain = chain(fat, u32(b, 0x30), nSectors);
  if (!dirChain || !dirChain.length) return null;
  const dirBytes = gather(dirChain, sector, ss, dirChain.length * ss);
  const entries = [];
  const utf16 = new TextDecoder("utf-16le");
  for (let at = 0; at + 128 <= dirBytes.length; at += 128) {
    const e = dirBytes.subarray(at, at + 128);
    const nameLen = u16(e, 0x40);
    const name = nameLen >= 2 && nameLen <= 64 && nameLen % 2 === 0 ? utf16.decode(e.subarray(0, nameLen - 2)) : "";
    const high = u32(e, 0x7c);
    entries.push({
      id: entries.length, name, type: e[0x42], left: u32(e, 0x44), right: u32(e, 0x48), child: u32(e, 0x4c),
      start: u32(e, 0x74), size: major === 3 ? u32(e, 0x78) : high >= 0x200000 ? NaN : high * 0x100000000 + u32(e, 0x78),
    });
  }
  const root = entries[0];
  if (!root || root.type !== 5) return null;

  const miniChain = root.size > 0 ? chain(fat, root.start, nSectors) : [];
  const miniStream = miniChain && gather(miniChain, sector, ss, root.size);
  const miniFatChain = u32(b, 0x40) > 0 ? chain(fat, u32(b, 0x3c), nSectors) : [];
  if (!miniStream || !miniFatChain) return null;
  const miniFat = miniFatChain.flatMap((s) => ids(sector(s)));
  const nMini = Math.floor(miniStream.length / 64);
  const data = new Map();
  for (const e of entries) {
    if (e.type !== 2) continue;
    if (!Number.isFinite(e.size)) return null;
    const bytes = e.size === 0 ? new Uint8Array(0) : e.size < cutoff
      ? gather(chain(miniFat, e.start, nMini), (s) => miniStream.subarray(64 * s, 64 * s + 64), 64, e.size)
      : gather(chain(fat, e.start, nSectors), sector, ss, e.size);
    if (!bytes) return null;
    data.set(e.id, bytes);
  }

  /* A storage's children: its child's red-black tree, walked by the siblings; a loop or a reference past the
   * directory is not a tree, and every storage's tree is checked here so `children` never fails later. */
  const kids = new Map();
  for (const e of entries) {
    if (e.type !== 1 && e.type !== 5) continue;
    const out = [];
    const stack = [e.child];
    const visited = new Set();
    while (stack.length) {
      const i = stack.pop();
      if (i === FREE) continue;
      if (i >= entries.length || visited.has(i)) return null;
      visited.add(i);
      out.push(entries[i]);
      stack.push(entries[i].left, entries[i].right);
    }
    kids.set(e.id, out.sort((x, y) => x.id - y.id));
  }
  return {
    root,
    children: (storage) => kids.get(storage.id) ?? [],
    stream: (entry) => data.get(entry.id) ?? null,
  };
}
