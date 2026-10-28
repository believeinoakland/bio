/* R5: an archive opened as a stream of members within the bounds the caller sends (unpacked bytes, members, one
 * member's bytes, the ratio, a name's length). ZIP and 7z are listed by 7-Zip, every bound checked on the listing,
 * then each member is extracted alone to a counted pipe (a member that inflates past its bound is stopped there). TAR
 * and the single-stream compressors (gzip, bzip2, xz; a compressed TAR is a TAR) are walked twice: once to check
 * every bound without keeping a byte, then again to send each member. An encrypted member is stated, not opened.
 * Every member goes out as it is read; nothing is kept when the walk ends (R8). */
import { createReadStream, openSync, readSync, closeSync, statSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { spawn } from 'node:child_process';
import { run } from './run.mjs';

const BLOCK = 512;

export const sevenZip = () => process.env.READER_7Z || '7z';

class Refused extends Error {
  constructor(answer) { super(answer.code); this.answer = answer; }
}
const refuse = (answer) => { throw new Refused(answer); };

/* the bounds one walk keeps: counts and running totals against the caller's figures */
function keeper(bounds, uploaded) {
  let members = 0, unpacked = 0;
  return {
    member(name, size) {
      if (++members > bounds.members) refuse({ code: 'TOO_MANY_MEMBERS', members, limit: bounds.members });
      if (name.length > bounds.name) refuse({ code: 'NAME_OVER', length: name.length, limit: bounds.name });
      if (size != null && size > bounds.member) refuse({ code: 'MEMBER_OVER', member: name, size, limit: bounds.member });
    },
    bytes(n, name) {
      unpacked += n;
      if (unpacked > bounds.unpacked) refuse({ code: 'UNPACKED_OVER', size: unpacked, limit: bounds.unpacked });
      if (unpacked > bounds.ratio * Math.max(uploaded, 1)) refuse({ code: 'RATIO_OVER', member: name, ratio: unpacked / Math.max(uploaded, 1), limit: bounds.ratio });
    },
    get counts() { return { members, unpacked }; },
  };
}

/* ---- ZIP and 7z, by 7-Zip ---------------------------------------------------------------------------------- */

export function parseListing(text) {
  return text.split(/\n\s*\n/).map((block) => {
    const f = {};
    for (const line of block.split('\n')) { const i = line.indexOf(' = '); if (i > 0) f[line.slice(0, i).trim()] = line.slice(i + 3); }
    return f;
  }).filter((f) => 'Path' in f).map((f) => ({
    name: f.Path,
    size: f.Size === '' || f.Size == null ? 0 : Number(f.Size),
    packed: f['Packed Size'] === '' || f['Packed Size'] == null ? null : Number(f['Packed Size']),
    encrypted: f.Encrypted === '+',
    directory: f.Folder === '+' || /^\s*D/.test(f.Attributes ?? ''),
  }));
}

async function walkSeven(path, bounds, uploaded, emit, { timeMs }) {
  const listed = await run(sevenZip(), ['l', '-slt', '-ba', '-pnone', path], { timeMs });
  if (listed.status !== 0 && !listed.stdout.length) return { ok: false, code: 'UNREADABLE', why: listed.stderr.toString().slice(0, 300) };
  const entries = parseListing(listed.stdout.toString()).filter((e) => !e.directory);
  const keep = keeper(bounds, uploaded);
  let declared = 0;
  for (const e of entries) {
    keep.member(e.name, e.size);
    if (e.packed != null && e.size > 0 && (e.packed === 0 || e.size / e.packed > bounds.ratio)) refuse({ code: 'RATIO_OVER', member: e.name, ratio: e.packed ? e.size / e.packed : null, limit: bounds.ratio });
    declared += e.size;
  }
  if (declared > bounds.unpacked) refuse({ code: 'UNPACKED_OVER', size: declared, limit: bounds.unpacked });
  if (declared > bounds.ratio * Math.max(uploaded, 1)) refuse({ code: 'RATIO_OVER', member: null, ratio: declared / Math.max(uploaded, 1), limit: bounds.ratio });
  const sent = keeper({ ...bounds, members: Infinity, name: Infinity }, uploaded);
  for (const e of entries) {
    if (e.encrypted) { await emit({ type: 'member', name: e.name, size: e.size, encrypted: true }); continue; }
    const r = await run(sevenZip(), ['e', '-so', '-spd', '-pnone', path, e.name], { timeMs, maxOut: bounds.member });
    if (r.over) refuse({ code: 'MEMBER_OVER', member: e.name, size: null, limit: bounds.member });
    if (r.status !== 0) { await emit({ type: 'member', name: e.name, size: e.size, unreadable: true }); continue; }
    sent.bytes(r.stdout.length, e.name);
    await emit({ type: 'member', name: e.name, size: r.stdout.length, encrypted: false }, new Uint8Array(r.stdout));
  }
  return { ok: true, ...keep.counts, unpacked: sent.counts.unpacked };
}

/* ---- TAR and the stream compressors ---------------------------------------------------------------------- */

/* A pull reader over an async iterable of chunks; `onBytes(total)` sees every byte as it arrives. */
class Pull {
  constructor(iterable, onBytes) { this.it = iterable[Symbol.asyncIterator](); this.chunks = []; this.len = 0; this.done = false; this.total = 0; this.onBytes = onBytes; }
  async fill(n) {
    while (this.len < n && !this.done) {
      const { value, done } = await this.it.next();
      if (done) { this.done = true; break; }
      const b = Buffer.from(value.buffer ?? value, value.byteOffset ?? 0, value.byteLength ?? value.length);
      this.chunks.push(b); this.len += b.length; this.total += b.length;
      this.onBytes?.(b.length);
    }
  }
  async peek(n) { await this.fill(n); return Buffer.concat(this.chunks).subarray(0, Math.min(n, this.len)); }
  /* up to `n` bytes (fewer only at the end of the stream), or null when the stream has ended */
  async take(n, keep = true) {
    const parts = [];
    let need = n;
    while (need > 0) {
      if (!this.len) { await this.fill(Math.min(need, 1 << 20)); if (!this.len) { if (need === n && n > 0) return null; break; } }
      const c = this.chunks[0];
      const k = Math.min(c.length, need);
      if (keep) parts.push(c.subarray(0, k));
      if (k === c.length) this.chunks.shift(); else this.chunks[0] = c.subarray(k);
      this.len -= k; need -= k;
    }
    return keep ? Buffer.concat(parts) : Buffer.alloc(0);
  }
  close() { this.it.return?.(); }
}

const cstr = (b, at, len) => { const s = b.subarray(at, at + len); const z = s.indexOf(0); return s.subarray(0, z < 0 ? len : z).toString('utf8'); };
function octal(b, at, len) {
  if (b[at] & 0x80) { let n = 0; for (let i = at + 1; i < at + len; i++) n = n * 256 + b[i]; return n; }
  const s = cstr(b, at, len).trim();
  return s ? parseInt(s, 8) : 0;
}
/* a TAR header's checksum: its bytes summed with the checksum field read as spaces (signed or unsigned, as writers differ) */
function checksumOk(h) {
  const stated = octal(h, 148, 8);
  let unsigned = 0, signed = 0;
  for (let i = 0; i < BLOCK; i++) { const b = i >= 148 && i < 156 ? 0x20 : h[i]; unsigned += b; signed += b > 127 ? b - 256 : b; }
  return stated === unsigned || stated === signed;
}
const isTar = (head) => head.length >= 262 && head.subarray(257, 262).toString('latin1') === 'ustar';
function paxOf(buf) {
  const out = {};
  let i = 0;
  while (i < buf.length) {
    const sp = buf.indexOf(0x20, i);
    if (sp < 0) break;
    const len = parseInt(buf.subarray(i, sp).toString(), 10);
    if (!(len > 0)) break;
    const rec = buf.subarray(sp + 1, i + len - 1).toString('utf8');
    const eq = rec.indexOf('=');
    if (eq > 0) out[rec.slice(0, eq)] = rec.slice(eq + 1);
    i += len;
  }
  return out;
}

/* Walks a TAR from `pull`: `onMember(name, size)` before each file's data, `onData(name, bytes)` with it when `keep`. */
async function walkTar(pull, { keep, onMember, onData, nameMax }) {
  let longName = null, pax = {};
  for (;;) {
    const h = await pull.take(BLOCK);
    if (!h || h.every((x) => x === 0)) return;
    if (h.length < BLOCK) refuse({ code: 'UNREADABLE', why: 'cut-header' });
    if (!checksumOk(h)) refuse({ code: 'UNREADABLE', why: 'tar-header' });
    const type = String.fromCharCode(h[156] || 0x30);
    let size = octal(h, 124, 12);
    const ustarPrefix = isTar(h) ? cstr(h, 345, 155) : '';
    const pad = (BLOCK - (size % BLOCK)) % BLOCK;
    if (type === 'L' || type === 'x' || type === 'g') {
      if (size > nameMax * 4 + BLOCK) refuse({ code: 'NAME_OVER', length: size, limit: nameMax });
      const data = await pull.take(size);
      await pull.take(pad, false);
      if (type === 'L') longName = cstr(data, 0, data.length);
      else if (type === 'x') pax = paxOf(data);
      continue;
    }
    let name = pax.path ?? longName ?? (ustarPrefix ? `${ustarPrefix}/${cstr(h, 0, 100)}` : cstr(h, 0, 100));
    if (pax.size) size = Number(pax.size);
    longName = null; pax = {};
    const file = type === '0' || type === '7' || h[156] === 0;
    if (!file) { await pull.take(size + pad, false); continue; }
    onMember(name, size);
    const before = pull.total - pull.len;
    const data = size ? await pull.take(size, keep) : Buffer.alloc(0);
    if (size && (data === null || pull.total - pull.len - before < size)) refuse({ code: 'UNREADABLE', why: 'cut-member' });
    await pull.take((BLOCK - (size % BLOCK)) % BLOCK, false);
    if (keep) await onData(name, data);
  }
}

/* the decompressed bytes of a stream archive, and a closer for any child it started */
function decompressed(path, kind) {
  if (kind === 'tar') return { stream: createReadStream(path), close() {} };
  if (kind === 'gz') { const z = createGunzip(); return { stream: createReadStream(path).pipe(z), close() { z.destroy(); } }; }
  const child = spawn(kind === 'bz2' ? 'bzip2' : 'xz', ['-dc', path], { stdio: ['ignore', 'pipe', 'ignore'] });
  return { stream: child.stdout, close() { child.kill('SIGKILL'); } };
}

/* the name a gzip header states (FNAME), or null */
function gzipName(path) {
  const fd = openSync(path, 'r');
  try {
    const head = Buffer.alloc(4096);
    const n = readSync(fd, head, 0, head.length, 0);
    if (n < 10 || head[0] !== 0x1f || head[1] !== 0x8b || !(head[3] & 8)) return null;
    let at = 10;
    if (head[3] & 4) at += 2 + head.readUInt16LE(10);
    const end = head.indexOf(0, at);
    return end > at ? head.subarray(at, end).toString('latin1') : null;
  } finally { closeSync(fd); }
}

async function walkStream(path, kind, name, bounds, uploaded, emit) {
  const single = (kind === 'gz' && gzipName(path)) || (name ? name.replace(/\.(gz|tgz|bz2|tbz2?|xz|txz)$/i, '') : null) || 'content';
  /* pass one: every bound, nothing kept */
  const check = keeper(bounds, uploaded);
  let tar = false;
  {
    const d = decompressed(path, kind);
    const pull = new Pull(d.stream, (n) => check.bytes(n, null));
    try {
      tar = kind === 'tar' || isTar(await pull.peek(BLOCK));
      if (tar) await walkTar(pull, { keep: false, onMember: (n, s) => check.member(n, s), nameMax: bounds.name });
      else { check.member(single, null); while (await pull.take(1 << 20, false)) { /* counted by onBytes */ } if (pull.total > bounds.member) refuse({ code: 'MEMBER_OVER', member: single, size: pull.total, limit: bounds.member }); }
    } finally { pull.close(); d.close(); }
  }
  /* pass two: each member sent as it is read */
  const d = decompressed(path, kind);
  const pull = new Pull(d.stream);
  try {
    if (tar) await walkTar(pull, { keep: true, onMember() {}, onData: (n, data) => emit({ type: 'member', name: n, size: data.length, encrypted: false }, new Uint8Array(data)), nameMax: bounds.name });
    else {
      const parts = [];
      for (;;) { const c = await pull.take(1 << 20); if (!c) break; parts.push(c); }
      const data = Buffer.concat(parts);
      await emit({ type: 'member', name: single, size: data.length, encrypted: false }, new Uint8Array(data));
    }
  } finally { pull.close(); d.close(); }
  return { ok: true, ...check.counts };
}

/* the archive at `path` → { ok: true, members, unpacked } after every member is emitted, or a refusal { ok: false, code, ... } */
export async function open(path, kind, bounds, { name, timeMs } = {}, emit) {
  const uploaded = statSync(path).size;
  try {
    if (kind === 'zip' || kind === '7z') return await walkSeven(path, bounds, uploaded, emit, { timeMs });
    return await walkStream(path, kind, name, bounds, uploaded, emit);
  } catch (e) {
    if (e instanceof Refused) return { ok: false, ...e.answer };
    return { ok: false, code: 'UNREADABLE', why: String(e?.message ?? e).slice(0, 300) };
  }
}
