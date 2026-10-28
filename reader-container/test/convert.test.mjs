/* R1 legacy and macro Office and RTF, converted to the open format the existing readers take; R2 macros never run.
 * Each fixture is made from test-support's generators, then saved as the legacy format by LibreOffice test-side; the
 * module's own container server converts it back. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate as document, truthOf as docTruth } from '../../bio-plane/test/docgen.mjs';
import { generate as sheet, truthOf as sheetTruth } from '../../bio-plane/test/sheetgen.mjs';
import { read } from '../src/index.mjs';
import { readCfb, writeCfb } from './cfb.mjs';
import { startContainer, sourceOf, officeConvert, partText, namesIn, needs, scratch } from './helpers.mjs';

const skip = needs('soffice');
let box;
before(async () => { box = await startContainer(); });
after(async () => { await box.close(); });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const text = (pkg, re) => partText(pkg, (n) => re.test(n));

test('R1 a generated .doc with a footnote and a comment becomes a .docx: body, footnote and comment kept as their kinds; the original is cited whole', { skip }, async () => {
  const recipe = { kind: 'docx', seed: 'rc-doc', parts: ['footnote', 'comment'] };
  const truth = docTruth(recipe);
  const doc = officeConvert(await document(recipe).bytes(), 'docx', 'doc');
  const before = sha(doc);
  const r = await read(sourceOf(doc), 'doc', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.deepEqual([r.route, r.kind, r.to, r.derived], ['convert', 'doc', 'docx', true]);
  assert.deepEqual(r.original, { size: doc.length, sha256: before });
  assert.equal(sha(doc), before, 'the original is unchanged');
  const body = text(r.bytes, /^word\/document\.xml$/);
  for (const n of truth.parts.body) assert.ok(body.includes(truth.unit(n).id), `body unit ${n}`);
  assert.ok(text(r.bytes, /^word\/footnotes\.xml$/).includes(truth.unit(truth.parts.footnote[0]).id), 'the footnote is a footnote');
  assert.ok(text(r.bytes, /^word\/comments\.xml$/).includes(truth.unit(truth.parts.comment[0]).id), 'the comment is a comment');
});

test('R1 an RTF with a table becomes a .docx whose table holds every cell', { skip }, async () => {
  const recipe = { kind: 'docx', seed: 'rc-rtf', table: { rows: 2, cols: 3 } };
  const truth = docTruth(recipe);
  const rtf = officeConvert(await document(recipe).bytes(), 'docx', 'rtf');
  const r = await read(sourceOf(rtf), 'rtf', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.equal(r.to, 'docx');
  const body = text(r.bytes, /^word\/document\.xml$/);
  const table = body.slice(body.indexOf('<w:tbl>'), body.lastIndexOf('</w:tbl>'));
  assert.ok(table.length > 0, 'a table');
  for (const n of truth.parts.table) assert.ok(table.includes(truth.unit(n).id), `cell unit ${n} is in the table`);
});

test('R1 a .ppt with speaker notes becomes a .pptx: slide text on its slide, notes as notes', { skip }, async () => {
  const recipe = { kind: 'pptx', seed: 'rc-ppt', parts: ['notes'] };
  const truth = docTruth(recipe);
  const ppt = officeConvert(await document(recipe).bytes(), 'pptx', 'ppt');
  const r = await read(sourceOf(ppt), 'ppt', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.equal(r.to, 'pptx');
  const slides = text(r.bytes, /^ppt\/slides\/slide\d+\.xml$/);
  for (const n of truth.parts.body) assert.ok(slides.includes(truth.unit(n).id), `slide unit ${n}`);
  assert.ok(text(r.bytes, /^ppt\/notesSlides\/notesSlide\d+\.xml$/).includes(truth.unit(truth.parts.notes[0]).id), 'the notes are notes');
});

test('R1 an .xls becomes an .xlsx with its cells; a sheet of the format\'s full 65,536 rows is read to its last row', { skip, timeout: 900000 }, async () => {
  const recipe = { kind: 'xlsx', seed: 'rc-xls', size: { rows: 65536, cols: 2 }, header: 'none' };
  const truth = sheetTruth(recipe);
  const xls = officeConvert(await sheet(recipe).bytes(), 'xlsx', 'xls');
  const r = await read(sourceOf(xls), 'xls', { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.equal(r.to, 'xlsx');
  assert.ok(namesIn(r.bytes).includes('xl/worksheets/sheet1.xml'));
  const cells = text(r.bytes, /^xl\/(sharedStrings|worksheets\/sheet1)\.xml$/);
  assert.ok(truth.marks.length >= 3);
  for (const mark of truth.marks) assert.ok(cells.includes(mark.text), `mark ${mark.text}`);
  assert.ok(text(r.bytes, /^xl\/worksheets\/sheet1\.xml$/).includes('r="65536"'), 'row 65,536 is there');
});

const PY = join(dirname(fileURLToPath(import.meta.url)), 'py', 'macro_doc.py');
const macro = (...args) => execFileSync('python3', [PY, ...args], { stdio: 'ignore', timeout: 300000 });

/* LibreOffice opens a package by its content, so a macro document handed in as a macro-enabled kind is opened as what it
 * is: the conversion must run nothing whatever the file claims to be. LibreOffice saves a Basic macro only in
 * OpenDocument (a ZIP, as a .docm or .xlsm is). */
for (const [kind, saved] of [['docm', 'odt'], ['xlsm', 'ods']]) {
  test(`R2 a document whose macro writes a file, handed in as .${kind}: converted with no file written, its macros stated; the same macro, run on purpose, does write it`, { skip: needs('soffice', 'uno'), timeout: 900000 }, async () => {
    const dir = scratch('macro');
    const marker = join(dir, 'MARKER');
    const path = join(dir, `m.${saved}`);
    macro('author', join(dir, 'author'), marker, path);
    assert.equal(existsSync(marker), false, 'authoring runs nothing');
    const bytes = new Uint8Array(readFileSync(path));
    const r = await read(sourceOf(bytes), kind, { container: box.container });
    assert.equal(r.ok, true, r.detail);
    assert.equal(existsSync(marker), false, 'no file written by the conversion');
    assert.equal(r.macros.present, true, 'macros are stated');
    assert.equal(r.macros.ran, false);
    assert.equal(r.macros.note.key, 'reader-container.note.macros');
    macro('run', join(dir, 'control'), path);
    assert.equal(existsSync(marker), true, 'the control: the macro is real and writes the file when run');
  });
}

/* a real legacy file with a VBA project's storage added where Word and Excel keep it */
async function withVba(kind) {
  const from = kind === 'doc' ? await document({ kind: 'docx', seed: 'rc-vba' }).bytes() : await sheet({ kind: 'xlsx', seed: 'rc-vba' }).bytes();
  const legacy = officeConvert(from, kind === 'doc' ? 'docx' : 'xlsx', kind);
  const tree = readCfb(legacy);
  const project = { name: 'PROJECT', type: 'stream', data: new TextEncoder().encode('ID="{00000000-0000-0000-0000-000000000000}"\r\nDocument=ThisDocument/&H00000000\r\n') };
  const vba = { name: 'VBA', type: 'storage', children: [{ name: 'dir', type: 'stream', data: new Uint8Array(64) }, { name: '_VBA_PROJECT', type: 'stream', data: new Uint8Array(7) }] };
  tree.children.push({ name: kind === 'doc' ? 'Macros' : '_VBA_PROJECT_CUR', type: 'storage', children: [vba, project] });
  return writeCfb(tree);
}

for (const kind of ['doc', 'xls']) {
  test(`R2 a .${kind} carrying a VBA project is converted with its macros stated; the same file without one states none`, { skip }, async () => {
    const r = await read(sourceOf(await withVba(kind)), kind, { container: box.container });
    assert.equal(r.ok, true, r.detail);
    assert.deepEqual([r.macros.present, r.macros.ran, r.macros.note.key], [true, false, 'reader-container.note.macros']);
    const plain = kind === 'doc' ? officeConvert(await document({ kind: 'docx', seed: 'rc-vba' }).bytes(), 'docx', 'doc') : officeConvert(await sheet({ kind: 'xlsx', seed: 'rc-vba' }).bytes(), 'xlsx', 'xls');
    const p = await read(sourceOf(plain), kind, { container: box.container });
    assert.equal(p.ok, true, p.detail);
    assert.equal(p.macros.present, false);
    assert.equal('note' in p.macros, false);
  });
}

test('R2 a macro-enabled Word file (a VBA project) is converted with its macros stated, and the copy carries no VBA project', { skip }, async () => {
  const withMacros = await document({ kind: 'docx', seed: 'rc-docm', flavour: 'macro' }).bytes();
  const r = await read(sourceOf(withMacros), { format: 'docx', variant: 'macro' }, { container: box.container });
  assert.equal(r.ok, true, r.detail);
  assert.deepEqual([r.kind, r.to, r.macros.present, r.macros.ran], ['docm', 'docx', true, false]);
  assert.ok(!namesIn(r.bytes).some((n) => /vbaProject/i.test(n)), 'the converted copy carries no VBA project');
});
