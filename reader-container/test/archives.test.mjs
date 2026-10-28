/* R5 archives opened as streams within their bounds: every member its own item (its own capture and job, one level
 * deeper in the one nesting count), RAR refused by name, an encrypted member stated, bombs refused before a member is
 * sent. ZIPs come from test-support's make-zip; TAR, gzip, bzip2, xz and 7z from the programs a test machine has. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, createWriteStream, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { makeZip, zipBomb, nestedZip, zipChunks64Sized } from '../../bio-plane/test/make-zip.mjs';
import { read, collect, ARCHIVE } from '../src/index.mjs';
import { startContainer, sourceOf, fileSource, needs, scratch } from './helpers.mjs';

let box;
before(async () => { box = await startContainer(); });
after(async () => { await box.close(); });

const enc = new TextEncoder();
const text = (m) => Buffer.from(m.bytes).toString('utf8');

/* a TAR of `files` [{ name, data }] (ustar) */
function tar(files) {
  const blocks = [];
  for (const f of files) {
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const h = Buffer.alloc(512);
    h.write(f.name, 0, 100, 'utf8');
    h.write('0000644\0', 100); h.write('0000000\0', 108); h.write('0000000\0', 116);
    h.write(`${data.length.toString(8).padStart(11, '0')}\0`, 124);
    h.write('00000000000\0', 136);
    h[156] = 0x30;
    h.write('ustar\0', 257); h.write('00', 263);
    h.fill(0x20, 148, 156);
    let sum = 0; for (const b of h) sum += b;
    h.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148);
    blocks.push(h, Buffer.from(data), Buffer.alloc((512 - (data.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return new Uint8Array(Buffer.concat(blocks));
}
const FILES = [{ name: 'minutes/2026-01.txt', data: 'January minutes' }, { name: 'minutes/2026-02.txt', data: 'February minutes' }, { name: 'budget.csv', data: 'line,amount\n1,10\n' }];

async function members(source, kind, opts = {}) {
  return collect(await read(source, kind, { container: box.container, ...opts }));
}

test('R5 a TAR.GZ opens as a stream: each member its own item, one level deeper, with its bytes', { skip: needs('sevenZip') }, async () => {
  const c = await members(sourceOf(gzipSync(tar(FILES))), 'gz', { name: 'papers.tar.gz' });
  assert.equal(c.ok, true, c.refusal?.detail);
  assert.deepEqual(c.members.map((m) => [m.name, text(m), m.depth, m.encrypted]), FILES.map((f) => [f.name, f.data, 2, false]));
});

test('R5 a plain TAR, a 7z and a ZIP give the same members', { skip: needs('sevenZip') }, async () => {
  const dir = scratch('seven');
  for (const f of FILES) { execFileSync('mkdir', ['-p', join(dir, 'in', f.name.split('/').slice(0, -1).join('/') || '.')]); writeFileSync(join(dir, 'in', f.name), f.data); }
  execFileSync('7z', ['a', '-bd', '-bso0', join(dir, 'a.7z'), '.'], { cwd: join(dir, 'in') });
  const want = new Map(FILES.map((f) => [f.name, f.data]));
  for (const [kind, source] of [['tar', sourceOf(tar(FILES))], ['7z', fileSource(join(dir, 'a.7z'))], ['zip', sourceOf(makeZip(FILES))]]) {
    const c = await members(source, kind);
    assert.equal(c.ok, true, `${kind}: ${c.refusal?.detail}`);
    assert.deepEqual(new Map(c.members.map((m) => [m.name, text(m)])), want, kind);
  }
});

test('R5 a single-file .gz, .bz2 and .xz is a one-member archive, named from the file', { skip: needs('bzip2', 'xz') }, async () => {
  const dir = scratch('single');
  const path = join(dir, 'report.txt');
  writeFileSync(path, 'the report');
  execFileSync('gzip', ['-k', '-N', path]); execFileSync('bzip2', ['-k', path]); execFileSync('xz', ['-k', path]);
  for (const kind of ['gz', 'bz2', 'xz']) {
    const c = await members(fileSource(`${path}.${kind}`), kind, { name: `report.txt.${kind}` });
    assert.equal(c.ok, true, `${kind}: ${c.refusal?.detail}`);
    assert.deepEqual(c.members.map((m) => [m.name, text(m)]), [['report.txt', 'the report']], kind);
  }
});

/* the largest stored ZIP every bound lets open whole: the uploaded bound (500 MB) once the unpacked and one-member bounds
 * are at least it, as the beta's are; the smallest of the three until then */
const WHOLE = Math.min(ARCHIVE.uploaded, ARCHIVE.unpacked, ARCHIVE.member);

test('R5 a large ZIP (the uploaded bound, or the most the other bounds let unpack) opens and every member streams through; the uploaded bound + 1 is refused before any read', { skip: needs('sevenZip'), timeout: 900000 }, async () => {
  const dir = scratch('big');
  const path = join(dir, 'big.zip');
  const out = createWriteStream(path);
  for await (const c of zipChunks64Sized([{ name: 'readme.txt', data: enc.encode('a large archive') }], WHOLE)) { if (!out.write(c)) await new Promise((r) => out.once('drain', r)); }
  await new Promise((r) => out.end(r));
  const source = fileSource(path);
  assert.equal(source.size, WHOLE);
  const r = await read(source, 'zip', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  const seen = [];
  for await (const m of r.members) { assert.equal(m.ok, true, m.detail); seen.push([m.name, m.size, m.bytes.length]); }
  assert.equal(seen.length, 2);
  assert.deepEqual(seen[0], ['readme.txt', 15, 15]);
  assert.equal(seen[1][1], seen[1][2]);
  const over = { size: ARCHIVE.uploaded + 1, reads: 0, async readRange() { over.reads++; throw new Error('read'); } };
  const refused = await read(over, 'zip', { container: box.container });
  assert.deepEqual([refused.ok, refused.code, refused.size, refused.limit, over.reads], [false, 'OVER_BOUND', ARCHIVE.uploaded + 1, ARCHIVE.uploaded, 0]);
});

test('R5 the one nesting count: a ZIP nested four deep opens to level 3 and is refused, stated, at level 4', { skip: needs('sevenZip') }, async () => {
  let bytes = nestedZip({ depth: 4, fanout: 1, leaf: enc.encode('the leaf') });
  for (let depth = 1; depth <= ARCHIVE.depth; depth++) {
    const c = await members(sourceOf(bytes), 'zip', { depth });
    assert.equal(c.ok, true, `level ${depth}: ${c.refusal?.detail}`);
    assert.equal(c.members.length, 1);
    assert.equal(c.members[0].depth, depth + 1);
    bytes = c.members[0].bytes;
  }
  const r = await read(sourceOf(bytes), 'zip', { container: box.container, depth: ARCHIVE.depth + 1 });
  assert.deepEqual([r.ok, r.code, r.key, r.depth, r.limit], [false, 'NESTED_TOO_DEEP', 'reader-container.refusal.nested', ARCHIVE.depth + 1, ARCHIVE.depth]);
});

test('R5 a ratio bomb is refused before any member is sent: a ZIP of one shared kernel, and a bzip2 stream of zeros', { skip: needs('sevenZip', 'bzip2') }, async () => {
  const zip = zipBomb({ kernel: 1 << 20, entries: 200 });
  assert.ok(200 * (1 << 20) <= ARCHIVE.unpacked, 'the bomb is within the unpacked bound, so only its ratio refuses it');
  const z = await read(sourceOf(zip), 'zip', { container: box.container });
  assert.deepEqual([z.ok, z.code, z.limit], [false, 'RATIO_OVER', ARCHIVE.ratio]);
  const dir = scratch('bomb');
  execFileSync('sh', ['-c', `head -c ${64 << 20} /dev/zero | bzip2 -9 > ${join(dir, 'zeros.bz2')}`]);
  const b = await read(fileSource(join(dir, 'zeros.bz2')), 'bz2', { container: box.container, name: 'zeros.bz2' });
  assert.deepEqual([b.ok, b.code, b.limit], [false, 'RATIO_OVER', ARCHIVE.ratio]);
});

test('R5 more members than the limit is refused, in a ZIP from its directory and in a TAR as it streams', { skip: needs('sevenZip'), timeout: 600000 }, async () => {
  const many = Array.from({ length: ARCHIVE.members + 1 }, (_, i) => ({ name: `m${i}.txt`, data: 'x' }));
  const z = await read(sourceOf(makeZip(many.map((f) => ({ ...f, method: 0 })))), 'zip', { container: box.container });
  assert.deepEqual([z.ok, z.code, z.limit], [false, 'TOO_MANY_MEMBERS', ARCHIVE.members]);
  const t = await read(sourceOf(tar(many)), 'tar', { container: box.container });
  assert.deepEqual([t.ok, t.code, t.limit], [false, 'TOO_MANY_MEMBERS', ARCHIVE.members]);
});

test('R5 RAR is refused by name, before any read', async () => {
  const source = { size: 10, reads: 0, async readRange() { source.reads++; return new Uint8Array(10); } };
  const r = await read(source, 'rar', { container: box.container });
  assert.deepEqual([r.ok, r.code, r.key, source.reads], [false, 'RAR_REFUSED', 'reader-container.refusal.rar', 0]);
});

test('R5 an encrypted member is stated and not opened; the archive\'s other members are read', { skip: needs('sevenZip') }, async () => {
  const dir = scratch('enc');
  writeFileSync(join(dir, 'secret.txt'), 'locked'); writeFileSync(join(dir, 'open.txt'), 'open');
  execFileSync('zip', ['-q', '-P', 'pw', 'a.zip', 'secret.txt'], { cwd: dir });
  execFileSync('zip', ['-q', 'a.zip', 'open.txt'], { cwd: dir });
  const c = await members(sourceOf(new Uint8Array(readFileSync(join(dir, 'a.zip')))), 'zip');
  assert.equal(c.ok, true, c.refusal?.detail);
  const byName = Object.fromEntries(c.members.map((m) => [m.name, m]));
  assert.deepEqual([byName['secret.txt'].encrypted, byName['secret.txt'].bytes, byName['secret.txt'].note.key], [true, null, 'reader-container.note.encrypted']);
  assert.deepEqual([byName['open.txt'].encrypted, text(byName['open.txt'])], [false, 'open']);
});

test('R5 a member that inflates past its declared size is stopped at the unpacked bound, never sent whole', { skip: needs('sevenZip') }, async () => {
  /* a TAR.GZ whose one member is larger than the unpacked bound would allow, made small by repetition */
  const big = new Uint8Array(ARCHIVE.unpacked + 1);
  const gz = gzipSync(tar([{ name: 'big.bin', data: big }]), { level: 9 });
  const r = await read(sourceOf(gz), 'gz', { container: box.container });
  assert.equal(r.ok, false);
  assert.ok(['UNPACKED_OVER', 'MEMBER_OVER', 'RATIO_OVER'].includes(r.code), r.code);
});
