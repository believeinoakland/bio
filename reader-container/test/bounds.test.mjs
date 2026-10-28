/* R6 a file of any kind over its bound is refused with its size and the limit, before any read; R7 every ceiling is
 * read from runtime-limits' READ_BOUNDS, none is a literal in this module's code. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { READ_BOUNDS, boundOf } from '../../bio-plane/src/read-bounds.mjs';
import { plan, read, CONVERT, FRAMES, ARCHIVES, BYTE_ROWS, ARCHIVE, IMAGE, TIME_ROW, routeOf, byteBound, sizeWords } from '../src/index.mjs';
import { unreadSource } from './helpers.mjs';

const KINDS = [...Object.keys(CONVERT), ...Object.keys(FRAMES), ...Object.keys(ARCHIVES)];
const KEYS = { document: 'reader-container.refusal.document_over_bound', spreadsheet: 'reader-container.refusal.spreadsheet_over_bound', image: 'reader-container.refusal.picture_over_bound', archive: 'reader-container.refusal.archive_over_bound' };

for (const kind of KINDS) {
  test(`R6 a ${kind} at its bound + 1 is refused with its size and the limit in plain words, and not one byte is read`, async () => {
    const { bound } = routeOf(kind);
    const limit = byteBound(bound);
    const source = unreadSource(limit + 1);
    const r = await read(source, kind, { container: () => { throw new Error('the container is not asked'); } });
    assert.deepEqual([r.ok, r.code, r.key, r.size, r.limit, r.final], [false, 'OVER_BOUND', KEYS[bound], limit + 1, limit, true]);
    assert.equal(source.reads, 0, 'refused before any read');
    assert.ok(r.detail.includes(sizeWords(limit + 1)) && r.detail.includes(sizeWords(limit)), 'the sentence carries the size and the limit');
    const at = plan(unreadSource(limit), kind);
    assert.deepEqual([at.ok, at.route, at.bound], [true, routeOf(kind).route, limit], 'at the bound it is read');
  });
}

test('R6 each route\'s bound is the READ_BOUNDS row the module names, read through boundOf', () => {
  for (const [route, row] of Object.entries(BYTE_ROWS)) {
    assert.ok(Object.hasOwn(READ_BOUNDS, row[0]) && Object.hasOwn(READ_BOUNDS[row[0]], row[1]), `${route}'s row ${row} is in the table`);
    assert.equal(byteBound(route), boundOf(...row));
  }
  assert.deepEqual(BYTE_ROWS.archive, ['archive', 'uploaded_bytes']);
});

test('R6 a source that states no usable size is a stated refusal, not a read', () => {
  for (const source of [null, {}, { size: -1, readRange() {} }, { size: 1.5, readRange() {} }, { size: 10 }]) {
    const r = plan(source, 'doc');
    assert.deepEqual([r.ok, r.code], [false, 'UNREADABLE']);
  }
});

/* ---- R7 ---- */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = () => ['src', 'container'].flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.mjs')).map((f) => join(d, f)));
/* every numeric literal of a source, and every product of literals (`8 * 1048576`), by value; comments dropped */
function numbers(text) {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
  const lit = /\b(0x[0-9a-f_]+|\d[\d_]*(?:\.\d+)?(?:e\d+)?)\b/gi;
  const value = (s) => Number(s.replace(/_/g, ''));
  const out = [];
  for (const m of code.matchAll(lit)) out.push(value(m[1]));
  for (const m of code.matchAll(/\b(\d[\d_]*|0x[0-9a-f_]+)(\s*\*\s*(\d[\d_]*|0x[0-9a-f_]+))+/gi)) out.push(m[0].split('*').map((x) => value(x.trim())).reduce((a, b) => a * b, 1));
  for (const m of code.matchAll(/\b1\s*<<\s*(\d+)/g)) out.push(2 ** Number(m[1]));
  return out;
}

test('R7 no numeric literal in this module\'s code is a ceiling it keeps: 50 MB, 500 MB, 2 GB, 10,000 members, ratio 1,100, the pixel limit, in any column', () => {
  const rows = [['archive', 'uploaded_bytes'], ['archive', 'unpacked_bytes'], ['archive', 'members'], ['archive', 'ratio'], ['archive', 'member_bytes'], ['image', 'pixels'], ...Object.values(BYTE_ROWS)];
  const ceilings = new Set(rows.flatMap(([k, n]) => [READ_BOUNDS[k][n].standard, READ_BOUNDS[k][n].alpha, READ_BOUNDS[k][n].protective]).concat([52428800, 524288000, 2147483648, 10000, 1100, 120000000]));
  for (const file of sources()) {
    const found = numbers(readFileSync(join(ROOT, file), 'utf8')).filter((n) => ceilings.has(n));
    assert.deepEqual(found, [], `${file} holds no ceiling as a literal`);
  }
});

test('R7 the nesting count is never compared with a literal; every ceiling the module keeps is the table\'s figure', () => {
  for (const file of sources()) {
    const code = readFileSync(join(ROOT, file), 'utf8');
    assert.equal(/\b(depth|nest\w*)\s*(<=?|>=?|===?)\s*([2-9]|\d{2,})\b/.test(code) || /\b([2-9]|\d{2,})\s*(<=?|>=?)\s*(depth|nest\w*)\b/.test(code), false, file);
  }
  assert.deepEqual(ARCHIVE, {
    uploaded: boundOf('archive', 'uploaded_bytes'), unpacked: boundOf('archive', 'unpacked_bytes'), depth: boundOf('archive', 'depth'),
    ratio: boundOf('archive', 'ratio'), members: boundOf('archive', 'members'), name: boundOf('archive', 'name'), member: boundOf('archive', 'member_bytes'),
  });
  assert.equal(IMAGE.pixels, boundOf('image', 'pixels'));
  assert.equal(IMAGE.edge, boundOf('image', 'edge'));
  assert.ok(Object.hasOwn(READ_BOUNDS[TIME_ROW[0]], TIME_ROW[1]), 'the time row is in the table');
});
