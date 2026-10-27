/* R3 every picture kind decoded to upright, OCR-ready frames within the pixel limit; R4 the decoded pixels and the facts
 * a picture states, the same whatever kind carries the same photograph. A page of text lines from test-support's imggen
 * is the photograph: its pixels are known exactly, so a frame is checked against them (lossless kinds to the sample,
 * lossy kinds within a small mean difference), which is what an OCR engine reads. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generate as picture } from '../../bio-plane/test/imggen.mjs';
import { read, FRAMES, IMAGE } from '../src/index.mjs';
import { startContainer, sourceOf, needs } from './helpers.mjs';
import { page, encodeAs, diff, fileOf, turned, withFacts } from './fixtures.mjs';

let box, upright;
before(async () => { box = await startContainer(); upright = await page('rc-frames'); });
after(async () => { await box.close(); });

const LOSSY = new Set(['jpeg', 'avif']);
const NEEDS = { heic: ['magick', 'pillow', 'heifEnc'], heif: ['magick', 'pillow', 'heifEnc'] };
const frameFile = (r, i = 0) => fileOf(r.frames[i].png, `frame-${i}.png`);

function assertSame(a, b, kind) {
  const d = diff(a, b);
  assert.deepEqual(d.b, d.a, `${kind}: the frame has the page's size`);
  assert.ok(d.mean <= (LOSSY.has(kind) ? 2 : 0.5), `${kind}: the frame is the page (mean difference ${d.mean})`);
}

for (const kind of Object.keys(FRAMES)) {
  test(`R3 a ${kind} is decoded to one upright PNG frame holding the page`, { skip: needs(...(NEEDS[kind] ?? ['magick', 'pillow'])) }, async () => {
    const r = await read(sourceOf(encodeAs(upright.path, kind)), kind, { container: box.container });
    assert.equal(r.ok, true, r.detail);
    assert.deepEqual([r.route, r.kind, r.frames.length], ['frames', kind, 1]);
    assert.deepEqual([...r.frames[0].png.subarray(1, 4)].map((c) => String.fromCharCode(c)).join(''), 'PNG');
    assertSame(upright.path, frameFile(r), kind);
  });
}

test('R3 a 40-page TIFF gives 40 frames, each its own page', { skip: needs('magick', 'pillow') }, async () => {
  const g = picture({ kind: 'tiff', seed: 'rc-tiff40', size: { pages: 40, lines: 2 }, mode: 'L', compression: 'deflate' });
  const r = await read(sourceOf(await g.bytes()), 'tiff', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.equal(r.frames.length, 40);
  assert.deepEqual(r.frames.map((f) => f.page), [...Array(40).keys()]);
  for (const [i, f] of r.frames.entries()) assert.deepEqual([f.width, f.height], [g.truth.pages[i].width, g.truth.pages[i].height], `page ${i + 1}'s size`);
  const distinct = new Set(r.frames.map((f) => Buffer.from(f.png).toString('base64')));
  assert.equal(distinct.size, 40, 'every page is its own frame');
});

test('R3 a GIF of several frames gives its first frame only', { skip: needs('magick', 'pillow') }, async () => {
  const g = picture({ kind: 'gif', seed: 'rc-gif', size: { pages: 3, lines: 2 }, mode: 'L' });
  const r = await read(sourceOf(await g.bytes()), 'gif', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.equal(r.frames.length, 1);
  const first = fileOf(await picture({ kind: 'gif', seed: 'rc-gif', size: { pages: 1, lines: 2 }, mode: 'L' }).bytes(), 'first.gif');
  assertSame(first, frameFile(r), 'gif');
});

for (const kind of ['jpeg', 'tiff', 'webp']) {
  test(`R3 a sideways ${kind} photograph (EXIF orientation 6) is read upright`, { skip: needs('magick', 'pillow', 'exiftool') }, async () => {
    const stored = encodeAs(turned(upright.path, 90), kind);
    const r = await read(sourceOf(withFacts(stored, kind, { orientation: 6 })), kind, { container: box.container });
    assert.equal(r.ok, true, r.detail);
    assert.equal(r.facts.orientation, 6);
    assertSame(upright.path, frameFile(r), kind);
  });
}

test('R3 a picture whose header declares more pixels than the limit is refused, naming its pixels and the limit, before it is decoded', { skip: needs('magick') }, async () => {
  const side = Math.ceil(Math.sqrt(IMAGE.pixels)) + 1;
  const g = picture({ kind: 'png', seed: 'rc-big', size: { lines: 1 }, declare: { width: side, height: side } });
  const r = await read(sourceOf(await g.bytes()), 'png', { container: box.container });
  assert.equal(r.ok, false);
  assert.deepEqual([r.code, r.key, r.pixels, r.limit], ['PIXELS_OVER', 'reader-container.refusal.pixels', side * side, IMAGE.pixels]);
});

const FACTS = { time: '2026:03:04 05:06:07', latitude: 37.5, longitude: -122.25 };
test('R4 a HEIC and a TIFF photograph give the same pixels and the same facts (time, place, orientation) as the same photograph as a JPEG', { skip: needs('magick', 'pillow', 'exiftool', 'heifEnc') }, async () => {
  const got = {};
  for (const kind of ['jpeg', 'heic', 'tiff']) {
    const r = await read(sourceOf(withFacts(encodeAs(upright.path, kind), kind, FACTS)), kind, { container: box.container });
    assert.equal(r.ok, true, `${kind}: ${r.detail}`);
    got[kind] = r;
  }
  for (const kind of ['heic', 'tiff']) {
    assert.deepEqual(got[kind].facts, got.jpeg.facts, `${kind}'s facts are the JPEG's`);
    assertSame(frameFile(got.jpeg), frameFile(got[kind]), 'jpeg');
  }
  assert.deepEqual(got.jpeg.facts, { time: '2026-03-04T05:06:07', place: { latitude: 37.5, longitude: -122.25 }, orientation: null });
});

test('R4 a picture that states no facts answers each as null, never a default; the frame is returned as decoded pixels with the original cited', { skip: needs('magick', 'pillow') }, async () => {
  const bytes = encodeAs(upright.path, 'png');
  const r = await read(sourceOf(bytes), 'png', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.deepEqual(r.facts, { time: null, place: null, orientation: null });
  assert.equal(r.original.size, bytes.length);
  assert.match(r.original.sha256, /^[0-9a-f]{64}$/);
  assert.deepEqual([r.frames[0].width, r.frames[0].height], [upright.truth.pages[0].width, upright.truth.pages[0].height]);
});
