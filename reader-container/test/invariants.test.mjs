/* R8 bytes in, results out: no record and no store; nothing converted is run or fetched; no place named; every failure a
 * stated result, never a throw. (R2's links: a linked picture that LibreOffice as installed does fetch is not fetched
 * by the module's conversion.) */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeZip } from '../../bio-plane/test/make-zip.mjs';
import { generate as document } from '../../bio-plane/test/docgen.mjs';
import { read, collect, plan, macrosNote, encryptedNote, CONVERT, FRAMES, ARCHIVES } from '../src/index.mjs';
import * as refusals from '../src/refusal.mjs';
import { startContainer, sourceOf, needs, officeConvert } from './helpers.mjs';
import { page, encodeAs } from './fixtures.mjs';

let box;
before(async () => { box = await startContainer(); });
after(async () => { await box.close(); });

/* an OpenDocument text whose picture is linked to `url`, which LibreOffice loads when the document opens */
function linkedPicture(url) {
  const content = `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2"><office:body><office:text><text:p>A linked picture<draw:frame draw:name="p" svg:width="2cm" svg:height="2cm"><draw:image xlink:href="${url}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame></text:p></office:text></office:body></office:document-content>`;
  const manifest = '<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>';
  return makeZip([{ name: 'mimetype', data: 'application/vnd.oasis.opendocument.text', method: 0 }, { name: 'content.xml', data: content }, { name: 'META-INF/manifest.xml', data: manifest }]);
}

/* LibreOffice as installed, with a fresh default profile, run without blocking this process (the server must answer) */
function installedConvert(bytes) {
  const dir = mkdtempSync(join(tmpdir(), 'rc-installed-'));
  writeFileSync(join(dir, 'in.odt'), bytes);
  return new Promise((resolve) => spawn('soffice', [`-env:UserInstallation=file://${dir}/p`, '--headless', '--norestore', '--convert-to', 'docx', '--outdir', dir, join(dir, 'in.odt')], { stdio: 'ignore' }).on('close', resolve));
}

test('R8 R2 nothing a document links to is fetched by the conversion; LibreOffice as installed does fetch it (the control)', { skip: needs('soffice'), timeout: 600000 }, async () => {
  let hits = 0;
  const origin = createServer((q, s) => { hits++; s.writeHead(404); s.end(); });
  await new Promise((r) => origin.listen(0, '127.0.0.1', r));
  const doc = linkedPicture(`http://127.0.0.1:${origin.address().port}/picture.png`);
  try {
    const r = await read(sourceOf(doc), 'docm', { container: box.container });
    assert.equal(r.ok, true, r.detail);
    assert.equal(hits, 0, 'the module fetched nothing');
    await installedConvert(doc);
    await new Promise((r) => setTimeout(r, 200));
    assert.ok(hits > 0, 'the control: LibreOffice as installed fetches the linked picture');
  } finally { await new Promise((r) => origin.close(r)); }
});

test('R8 it holds no store: every copy, profile and upload the container makes is gone when the request ends', { skip: needs('soffice', 'magick', 'sevenZip'), timeout: 600000 }, async () => {
  const own = mkdtempSync(join(tmpdir(), 'rc-own-'));
  const was = process.env.TMPDIR;
  process.env.TMPDIR = own;
  try {
    const doc = officeConvert(await document({ kind: 'docx', seed: 'rc-store' }).bytes(), 'docx', 'doc');
    assert.equal((await read(sourceOf(doc), 'doc', { container: box.container })).ok, true);
    assert.equal((await read(sourceOf(encodeAs((await page('rc-store')).path, 'tiff')), 'tiff', { container: box.container })).ok, true);
    assert.equal((await collect(await read(sourceOf(makeZip([{ name: 'a.txt', data: 'a' }])), 'zip', { container: box.container }))).ok, true);
    assert.deepEqual(readdirSync(own).filter((f) => f.startsWith('rc-convert-') || f.startsWith('rc-frames-') || f.startsWith('rc-archive-')), []);
  } finally { if (was === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = was; }
});

test('R8 every failure is a stated result, never a throw: an unreachable container, a source that fails, damaged bytes, an unknown kind', { skip: needs('soffice', 'magick') }, async () => {
  const bytes = new Uint8Array(4096).fill(7);
  const gone = await read(sourceOf(bytes), 'png', { container: () => { throw new Error('down'); } });
  assert.deepEqual([gone.ok, gone.code, gone.final], [false, 'UNREACHABLE', false]);
  const none = await read(sourceOf(bytes), 'png', {});
  assert.deepEqual([none.ok, none.code], [false, 'UNREACHABLE']);
  const failing = { size: 100, async readRange() { throw new Error('the store failed'); } };
  const f = await read(failing, 'png', { container: box.container });
  assert.deepEqual([f.ok, f.code], [false, 'UNREADABLE']);
  const short = { size: 100, async readRange() { return new Uint8Array(3); } };
  assert.deepEqual([(await read(short, 'png', { container: box.container })).code], ['UNREADABLE']);
  for (const kind of ['doc', 'rtf', 'docm', 'png', 'zip', 'tar', '7z']) {
    const r = await read(sourceOf(bytes), kind, { container: box.container });
    assert.deepEqual([r.ok, r.code], [false, 'UNREADABLE'], kind);
  }
  for (const kind of ['pdf', 'docx', null, {}, 42]) assert.deepEqual([plan(sourceOf(bytes), kind).code], ['NOT_READ_HERE']);
});

test('R8 no place is named in the module\'s code, its refusals or its notes', () => {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const said = [
    refusals.overBound('document', 2, 1), refusals.overBound('spreadsheet', 2, 1), refusals.overBound('image', 2, 1), refusals.overBound('archive', 2, 1),
    refusals.rarRefused(), refusals.notContainerKind('x'), refusals.nestedTooDeep(4, 3), refusals.tooManyMembers(2, 1), refusals.ratioOver('a', 2, 1),
    refusals.unpackedOver(2, 1), refusals.memberOver('a', 2, 1), refusals.nameOver(2, 1), refusals.pixelsOver(2, 1), refusals.pagesOver(2, 1),
    refusals.unreadable('x'), refusals.unreachable(), macrosNote(), encryptedNote(),
  ];
  const code = ['src', 'container'].flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.mjs')).map((f) => readFileSync(join(ROOT, d, f), 'utf8')));
  const text = JSON.stringify(said) + code.join('\n');
  for (const place of ['Oakland', 'Alameda', 'California']) assert.equal(text.includes(place), false, place);
  for (const r of said) assert.ok(typeof r.key === 'string' && r.key.startsWith('reader-container.') && typeof r.detail === 'string' && r.detail.length > 0, r.key);
});

test('R8 the module reads every kind the container handles and no other: each route\'s kinds, RAR refused', () => {
  const s = sourceOf(new Uint8Array(1));
  for (const k of Object.keys(CONVERT)) assert.equal(plan(s, k).route, 'convert');
  for (const k of Object.keys(FRAMES)) assert.equal(plan(s, k).route, 'frames');
  for (const k of Object.keys(ARCHIVES)) assert.equal(plan(s, k).route, 'archive');
  assert.equal(plan(s, 'rar').code, 'RAR_REFUSED');
  assert.equal(plan(s, { format: 'docx', variant: 'macro' }).kind, 'docm');
  assert.equal(plan(s, { format: 'pptx', variant: 'macro' }).kind, 'pptm');
  assert.equal(existsSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'container', 'server.mjs')), true);
});
