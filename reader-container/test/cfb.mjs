/* Test-side only: a compound file (the container of .doc, .xls, .ppt) read to its tree of storages and streams, and
 * written back from one, so a test can add a storage (Word's `Macros`, Excel's `_VBA_PROJECT_CUR`) to a real file. */

const END = 0xfffffffe, FREE = 0xffffffff, FATSECT = 0xfffffffd, NOSTREAM = 0xffffffff;
const SECTOR = 512, MINI = 64, CUTOFF = 4096;

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

/* { name, type: 'root'|'storage'|'stream', data?, children? } */
export function readCfb(bytes) {
  const size = 1 << u16(bytes, 0x1e);
  const at = (s) => SECTOR + s * size;
  const fat = [];
  const difat = [];
  for (let i = 0; i < 109; i++) { const s = u32(bytes, 0x4c + i * 4); if (s < FATSECT) difat.push(s); }
  for (let d = u32(bytes, 0x44); d < FATSECT;) { for (let i = 0; i < size / 4 - 1; i++) { const s = u32(bytes, at(d) + i * 4); if (s < FATSECT) difat.push(s); } d = u32(bytes, at(d) + size - 4); }
  for (const s of difat) for (let i = 0; i < size / 4; i++) fat.push(u32(bytes, at(s) + i * 4));
  const chain = (s, table) => { const out = []; for (; s < FATSECT && out.length <= table.length; s = table[s]) out.push(s); return out; };
  const big = (s, len) => { const parts = chain(s, fat).map((x) => bytes.subarray(at(x), at(x) + size)); const all = new Uint8Array(parts.length * size); parts.forEach((p, i) => all.set(p, i * size)); return all.subarray(0, len); };
  const dir = big(u32(bytes, 0x30), Infinity);
  const entries = [];
  for (let o = 0; o + 128 <= dir.length; o += 128) {
    const len = u16(dir, o + 0x40);
    let name = '';
    for (let i = 0; i < len - 2; i += 2) name += String.fromCharCode(u16(dir, o + i));
    entries.push({ name, type: dir[o + 0x42], left: u32(dir, o + 0x44), right: u32(dir, o + 0x48), child: u32(dir, o + 0x4c), start: u32(dir, o + 0x74), size: u32(dir, o + 0x78) });
  }
  const root = entries[0];
  const miniFat = [];
  const mf = big(u32(bytes, 0x3c), u32(bytes, 0x40) * size);
  for (let i = 0; i + 4 <= mf.length; i += 4) miniFat.push(u32(mf, i));
  const ministream = big(root.start, root.size);
  const small = (s, len) => { const parts = chain(s, miniFat); const all = new Uint8Array(parts.length * MINI); parts.forEach((p, i) => all.set(ministream.subarray(p * MINI, p * MINI + MINI), i * MINI)); return all.subarray(0, len); };
  const node = (i) => {
    const e = entries[i];
    if (e.type === 2) return { name: e.name, type: 'stream', data: new Uint8Array(e.size < CUTOFF ? small(e.start, e.size) : big(e.start, e.size)) };
    return { name: e.name, type: e.type === 5 ? 'root' : 'storage', children: siblings(e.child) };
  };
  const siblings = (i) => { if (i === NOSTREAM || i >= entries.length) return []; const e = entries[i]; return [...siblings(e.left), node(i), ...siblings(e.right)]; };
  return node(0);
}

const order = (a, b) => (a.name.length - b.name.length) || (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : a.name.toUpperCase() > b.name.toUpperCase() ? 1 : 0);

/* the bytes of a compound file of `root` (512-byte sectors; streams under 4,096 bytes in the mini stream) */
export function writeCfb(root) {
  const flat = [];
  const visit = (n) => { const i = flat.length; flat.push({ n }); if (n.children) { const kids = [...n.children].sort(order).map(visit); flat[i].kids = kids; } return i; };
  visit(root);
  /* the mini stream */
  const mini = [], miniFat = [];
  let ministreamLen = 0;
  for (const f of flat) {
    if (f.n.type !== 'stream' || f.n.data.length >= CUTOFF) continue;
    const count = Math.ceil(f.n.data.length / MINI);
    f.start = count ? ministreamLen / MINI : END;
    for (let k = 0; k < count; k++) miniFat.push(k === count - 1 ? END : f.start + k + 1);
    const padded = new Uint8Array(count * MINI); padded.set(f.n.data); mini.push(padded); ministreamLen += padded.length;
  }
  const ministream = new Uint8Array(ministreamLen); { let o = 0; for (const m of mini) { ministream.set(m, o); o += m.length; } }
  /* the regular sectors: big streams, the mini stream, the mini FAT, the directory, then the FAT */
  const sectors = [];
  const fat = [];
  const place = (data) => {
    const count = Math.ceil(data.length / SECTOR);
    if (!count) return END;
    const first = sectors.length;
    for (let k = 0; k < count; k++) { const s = new Uint8Array(SECTOR); s.set(data.subarray(k * SECTOR, (k + 1) * SECTOR)); sectors.push(s); fat.push(k === count - 1 ? END : first + k + 1); }
    return first;
  };
  for (const f of flat) if (f.n.type === 'stream' && f.n.data.length >= CUTOFF) f.start = place(f.n.data);
  const rootStart = place(ministream);
  const mf = new Uint8Array(Math.ceil(miniFat.length * 4 / SECTOR) * SECTOR).fill(0xff);
  miniFat.forEach((v, i) => { new DataView(mf.buffer).setUint32(i * 4, v, true); });
  const miniFatStart = miniFat.length ? place(mf) : END;
  const dir = new Uint8Array(Math.ceil(flat.length * 128 / SECTOR) * SECTOR);
  const dv = new DataView(dir.buffer);
  for (let i = 0; i < dir.length / 128; i++) { dv.setUint32(i * 128 + 0x44, NOSTREAM, true); dv.setUint32(i * 128 + 0x48, NOSTREAM, true); dv.setUint32(i * 128 + 0x4c, NOSTREAM, true); }
  flat.forEach((f, i) => {
    const o = i * 128;
    for (let k = 0; k < f.n.name.length; k++) dv.setUint16(o + k * 2, f.n.name.charCodeAt(k), true);
    dv.setUint16(o + 0x40, (f.n.name.length + 1) * 2, true);
    dir[o + 0x42] = f.n.type === 'root' ? 5 : f.n.type === 'storage' ? 1 : 2;
    dir[o + 0x43] = 1;
    if (f.kids?.length) {
      /* the children as a right-leaning chain in name order: a valid search tree */
      dv.setUint32(o + 0x4c, f.kids[0], true);
      f.kids.forEach((k, j) => { if (j + 1 < f.kids.length) dv.setUint32(k * 128 + 0x48, f.kids[j + 1], true); });
    }
    if (f.n.type === 'root') { dv.setUint32(o + 0x74, rootStart, true); dv.setUint32(o + 0x78, ministreamLen, true); }
    if (f.n.type === 'stream') { dv.setUint32(o + 0x74, f.start ?? END, true); dv.setUint32(o + 0x78, f.n.data.length, true); }
  });
  const dirStart = place(dir);
  /* the FAT sectors, which also map themselves */
  let fatSectors = 1;
  while ((sectors.length + fatSectors) > fatSectors * (SECTOR / 4)) fatSectors++;
  if (fatSectors > 109) throw new Error('cfb: too large for this writer');
  const fatFirst = sectors.length;
  for (let k = 0; k < fatSectors; k++) fat.push(FATSECT);
  const fatBytes = new Uint8Array(fatSectors * SECTOR).fill(0xff);
  fat.forEach((v, i) => new DataView(fatBytes.buffer).setUint32(i * 4, v, true));
  for (let k = 0; k < fatSectors; k++) sectors.push(fatBytes.subarray(k * SECTOR, (k + 1) * SECTOR));
  const header = new Uint8Array(SECTOR);
  const hv = new DataView(header.buffer);
  header.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  hv.setUint16(0x18, 0x3e, true); hv.setUint16(0x1a, 3, true); hv.setUint16(0x1c, 0xfffe, true);
  hv.setUint16(0x1e, 9, true); hv.setUint16(0x20, 6, true);
  hv.setUint32(0x2c, fatSectors, true); hv.setUint32(0x30, dirStart, true); hv.setUint32(0x38, CUTOFF, true);
  hv.setUint32(0x3c, miniFatStart, true); hv.setUint32(0x40, miniFat.length ? mf.length / SECTOR : 0, true);
  hv.setUint32(0x44, END, true); hv.setUint32(0x48, 0, true);
  for (let i = 0; i < 109; i++) hv.setUint32(0x4c + i * 4, i < fatSectors ? fatFirst + i : FREE, true);
  const out = new Uint8Array(SECTOR * (1 + sectors.length));
  out.set(header);
  sectors.forEach((s, i) => out.set(s, SECTOR * (1 + i)));
  return out;
}
