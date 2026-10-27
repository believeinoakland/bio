/* reader-container's test helpers: the container's own server run locally (its programs as the image installs them),
 * a source over bytes or a file that counts its reads, and the tools a fixture is made with. */
import { execFileSync, spawnSync } from 'node:child_process';
import { openSync, readSync, closeSync, statSync, mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { listen } from '../container/server.mjs';
import { zipDirectory } from '../src/inspect.mjs';

export const tool = (cmd, args = ['--version']) => { try { execFileSync(cmd, args, { stdio: 'ignore', timeout: 60000 }); return true; } catch { return false; } };
export const has = {
  soffice: tool('soffice'),
  magick: tool('convert'),
  exiftool: tool('exiftool', ['-ver']),
  sevenZip: tool('7z', ['i']),
  heifEnc: /x265/.test(spawnSync('heif-enc', ['--list-encoders'], { encoding: 'utf8' }).stdout ?? ''),
  uno: spawnSync('python3', ['-c', 'import uno'], { stdio: 'ignore' }).status === 0,
  pillow: spawnSync('python3', ['-c', 'import PIL'], { stdio: 'ignore' }).status === 0,
  bzip2: tool('bzip2', ['--help']),
  xz: tool('xz'),
};
const missing = (...names) => names.filter((n) => !has[n]);
/* the `skip` of a test that needs these programs: false when all are here */
export const needs = (...names) => (missing(...names).length ? `not installed here: ${missing(...names).join(', ')}` : false);

/* the container's server on a free port: { container (a fetch), close } */
export async function startContainer() {
  const server = await listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const container = (request) => {
    const url = new URL(request.url);
    return fetch(base + url.pathname + url.search, { method: request.method, headers: request.headers, body: request.body, duplex: 'half' });
  };
  return { container, close: () => new Promise((r) => server.close(r)) };
}

/* a range source over bytes; `reads` counts readRange calls */
export function sourceOf(bytes) {
  const s = { size: bytes.length, reads: 0, async readRange(offset, length) { s.reads++; return bytes.subarray(offset, offset + length); } };
  return s;
}
/* a range source over a file */
export function fileSource(path) {
  const size = statSync(path).size;
  const s = {
    size, reads: 0,
    async readRange(offset, length) {
      s.reads++;
      const fd = openSync(path, 'r');
      try { const b = Buffer.alloc(length); const n = readSync(fd, b, 0, length, offset); return new Uint8Array(b.buffer, b.byteOffset, n); } finally { closeSync(fd); }
    },
  };
  return s;
}
/* a source of a stated size that fails the test if it is read */
export function unreadSource(size) {
  const s = { size, reads: 0, async readRange() { s.reads++; throw new Error('read'); } };
  return s;
}

export const scratch = (name) => mkdtempSync(join(process.env.TMPDIR || tmpdir(), `rc-test-${name}-`));

/* LibreOffice, test-side only: a file converted to `to` with the given filter, answered as bytes */
export function officeConvert(bytes, from, to, filter = to) {
  const dir = scratch('office');
  writeFileSync(join(dir, `in.${from}`), bytes);
  execFileSync('soffice', [`-env:UserInstallation=file://${dir}/profile`, '--headless', '--norestore', '--convert-to', filter, '--outdir', dir, join(dir, `in.${from}`)], { stdio: 'ignore', timeout: 240000 });
  return new Uint8Array(readFileSync(join(dir, `in.${to}`)));
}

/* one part of an Office package, as text (stored or deflated members) */
export function partText(pkg, test) {
  const dir = zipDirectory(pkg);
  const u32 = (o) => pkg[o] | (pkg[o + 1] << 8) | (pkg[o + 2] << 16) | (pkg[o + 3] << 24);
  const u16 = (o) => pkg[o] | (pkg[o + 1] << 8);
  // local headers, in order
  const out = [];
  let o = 0;
  while (o + 30 <= pkg.length && u32(o) === 0x04034b50) {
    const method = u16(o + 8), packed = u32(o + 18) >>> 0, nameLen = u16(o + 26), extraLen = u16(o + 28);
    const name = Buffer.from(pkg.subarray(o + 30, o + 30 + nameLen)).toString('utf8');
    const start = o + 30 + nameLen + extraLen;
    const m = dir.members.find((x) => x.name === name);
    const len = m ? m.packed : packed;
    if (test(name)) {
      const raw = pkg.subarray(start, start + len);
      out.push(Buffer.from(method === 8 ? inflateRawSync(raw) : raw).toString('utf8'));
    }
    o = start + len + ((u16(o + 6) & 8) ? (u32(start + len) === 0x08074b50 ? 16 : 12) : 0);
  }
  return out.join('\n');
}

export const namesIn = (pkg) => zipDirectory(pkg).members.map((m) => m.name);
