// The safe-view image's server (R7, R14), behind the `SafeViewRenderer` class. It takes one source's copy and answers a
// new PDF whose every page is one image of a source page at the asked resolution, and nothing else of the source: no
// text layer, script, action, link, form, attachment or metadata (after Dangerzone's design: render, rasterise, write
// images only). An office source is first converted to PDF by LibreOffice, headless, with a profile of its own made
// and removed with the request; nothing reaches the network (R12).
//
//   GET  /version                                       {ok, libreoffice, poppler}
//   POST /render?route=pdf|office&dpi=<n>&max=<pages>&bytes=<n>&ms=<n>&entries=<n>&directory=<n>
//                                                       200 application/pdf with x-derived-sha256, x-pages,
//                                                       x-source-pages, x-truncated (and x-source-pages-exact: false when
//                                                       an office source's page count past the cap is not stated by it);
//                                                       or {ok:false, code, message?}. The Worker sends every figure (it
//                                                       quotes them from the table, which the image cannot import); a
//                                                       render without them is refused 400 LIMITS_MISSING (R7, R16).
import { createWriteStream } from 'node:fs';
import { readdir, readFile, open, rename, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { json, run, serve, freshDir, removeDir, fileHas, zipDirectory, zipText } from './common.mjs';

// The environment's RENDER_TIME_MS stands in for the request's time budget in a test.
const renderTimeMs = (asked) => Number(process.env.RENDER_TIME_MS || asked);
const OLE2 = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ENCRYPTED_PACKAGE = Buffer.from('EncryptedPackage', 'utf16le');
const SOFFICE = process.env.SOFFICE || 'soffice';

// A refusal, as `work` answers it; `render` sends it once the request's directory is gone.
const refuse = (res, status, code, message) => ({ status, body: { ok: false, code, ...(message ? { message: String(message).slice(0, 300) } : {}) } });

/** What the source is, from its first bytes: `pdf`, `zip` (OOXML, ODF), `ole2` (Word 97, PowerPoint 97), `rtf`. */
export function sniff(head) {
  const s = head.toString('latin1');
  if (s.slice(0, 1024).includes('%PDF-')) return 'pdf';
  if (head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) return 'zip';
  if (head.subarray(0, 8).equals(OLE2)) return 'ole2';
  if (s.startsWith('{\\rtf')) return 'rtf';
  return null;
}

/** A JPEG's pixel size and colour components, from its first frame header. */
export function jpegInfo(b) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7), components: b[i + 9] };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('not a JPEG');
}

/** The size in bytes of the objects of page `i` (its page, content and image dictionaries), apart from the image's own bytes. */
function pageObjects(i, { width, height, components }, length, dpi) {
  const w = (width * 72 / dpi).toFixed(2), h = (height * 72 / dpi).toFixed(2);
  const content = `q ${w} 0 0 ${h} 0 0 cm /I Do Q`;
  return [
    `${3 + 3 * i} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /I ${5 + 3 * i} 0 R >> >> /Contents ${4 + 3 * i} 0 R >>\nendobj\n`,
    `${4 + 3 * i} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
    `${5 + 3 * i} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /${components === 1 ? 'DeviceGray' : components === 4 ? 'DeviceCMYK' : 'DeviceRGB'} /BitsPerComponent 8 /Filter /DCTDecode /Length ${length} >>\nstream\n`,
    '\nendstream\nendobj\n'];
}
const PDF_HEAD = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
const catalog = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
const pagesObj = (n) => `2 0 obj\n<< /Type /Pages /Count ${n} /Kids [${Array.from({ length: n }, (_, i) => `${3 + 3 * i} 0 R`).join(' ')}] >>\nendobj\n`;
const tailOf = (n, xref, offsets) => {
  const count = 3 + 3 * n;
  let table = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let id = 1; id < count; id++) table += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  return `${table}trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
};

/** Writes a PDF holding exactly one image per page, each page the image's size at `dpi`, the file at most `maxBytes`: the
 *  pages are taken in order and the next one that would pass the limit ends the view (R7, G136b). Answers its SHA-256 and
 *  the pages written. */
export async function writeImagePdf(images, dpi, out, maxBytes = Infinity) {
  // The size is known before anything is written: each page's objects, its image, the page tree and the cross-reference
  // table for the pages taken so far.
  const plan = [];
  let size = PDF_HEAD.length + catalog.length;
  for (let i = 0; i < images.length; i++) {
    const jpg = await readFile(images[i]);
    const info = jpegInfo(jpg);
    const parts = pageObjects(i, info, jpg.length, dpi);
    const pageBytes = parts.reduce((n, x) => n + x.length, 0) + jpg.length;
    const n = i + 1;
    const body = size + pageBytes + pagesObj(n).length;
    const total = body + tailOf(n, body, new Array(3 + 3 * n).fill(0)).length;
    if (total > maxBytes) break;
    plan.push({ info, length: jpg.length });
    size += pageBytes;
  }
  const n = plan.length;
  if (n === 0) throw new Error('the first page is over the size limit');
  const fh = await open(out, 'w');
  const hash = createHash('sha256');
  let offset = 0;
  const offsets = [];
  const put = async (data) => {
    const b = typeof data === 'string' ? Buffer.from(data, 'latin1') : data;
    hash.update(b); await fh.write(b); offset += b.length;
  };
  await put(PDF_HEAD);
  offsets[1] = offset; await put(catalog);
  offsets[2] = offset; await put(pagesObj(n));
  for (let i = 0; i < n; i++) {
    const [page, content, imageHead, imageTail] = pageObjects(i, plan[i].info, plan[i].length, dpi);
    offsets[3 + 3 * i] = offset; await put(page);
    offsets[4 + 3 * i] = offset; await put(content);
    offsets[5 + 3 * i] = offset; await put(imageHead);
    await put(await readFile(images[i]));
    await put(imageTail);
  }
  await put(tailOf(n, offset, offsets));
  await fh.close();
  return { sha: hash.digest('hex'), pages: n };
}

/** An office source's own statements, read from its ZIP directory without unpacking it: the application that opens it
 *  (`writer`, or `impress` for a presentation), its page count when it states one (`docProps/app.xml`'s `Pages`, ODF's
 *  `meta:page-count`), and whether an entry is encrypted. A source that is not a ZIP is a Word 97 or RTF document. */
export async function officeInfo(fh, size, kind, { entries, directory }) {
  if (kind !== 'zip') return { app: 'writer', pages: null };
  const d = await zipDirectory(fh, size, { maxEntries: entries, maxBytes: directory });
  if (d.limit) return { limit: d.limit };
  if (d.entries.some((e) => e.flags & 1)) return { encrypted: true };
  const entry = (name) => d.entries.find((e) => e.name === name);
  const mime = entry('mimetype') ? await zipText(fh, entry('mimetype'), 256) : null;
  const impress = d.entries.some((e) => e.name.startsWith('ppt/')) || /presentation/.test(mime || '');
  const app = entry('docProps/app.xml') ? await zipText(fh, entry('docProps/app.xml'), directory) : null;
  const meta = entry('meta.xml') ? await zipText(fh, entry('meta.xml'), directory) : null;
  const pages = Number((/<Pages>(\d+)<\/Pages>/.exec(app || '') || /meta:page-count="(\d+)"/.exec(meta || '') || [])[1]) || null;
  return { app: impress ? 'impress' : 'writer', pages };
}

// The request's directory is removed before its answer leaves (R14): a refusal is sent after the removal, and the safe
// view is streamed from a handle opened before it, so the bytes outlive their path but not the request.
async function render(req, res, url) {
  const dir = await freshDir('render-');
  let out;
  try { out = await work(req, res, url, dir); }
  finally {
    if (out && out.file) { out.handle = await open(out.file, 'r'); out.bytes = (await out.handle.stat()).size; }
    await removeDir(dir);
  }
  if (!out.handle) return json(res, out.status, out.body);
  res.writeHead(200, { ...out.headers, 'content-length': String(out.bytes) });
  await pipeline(out.handle.createReadStream(), res);
}

/** The figures a render is asked with (R7, R16), each a positive whole number, or null when one is missing. */
function figuresOf(url) {
  const f = {};
  for (const n of ['dpi', 'max', 'bytes', 'ms', 'entries', 'directory']) {
    const v = Number(url.searchParams.get(n));
    if (!Number.isSafeInteger(v) || v <= 0) return null;
    f[n] = v;
  }
  return f;
}

/** One office conversion of the pages `range` (LibreOffice's `PageRange`, so a page outside it is never converted); the
 *  PDF's path, or a refusal. */
async function convert(app, named, dir, outName, range, ms) {
  const filter = `pdf:${app}_pdf_Export:${JSON.stringify({ PageRange: { type: 'string', value: range } })}`;
  const r = await run(SOFFICE, ['--headless', '--norestore', '--nolockcheck', '--nodefault',
    `-env:UserInstallation=file://${join(dir, 'profile')}`, '--convert-to', filter, '--outdir', join(dir, outName), named],
  { ms, env: { PATH: process.env.PATH, HOME: dir } });
  const pdf = join(dir, outName, 'source.pdf');
  return { r, pdf, made: !!(await stat(pdf).catch(() => null)) };
}

const pagesOf = async (pdf, ms) => {
  const info = await run('pdfinfo', [pdf], { ms });
  return { info, pages: Number((/^Pages:\s+(\d+)/m.exec(info.out) || [])[1]) };
};

async function work(req, res, url, dir) {
  const route = url.searchParams.get('route');
  if (route !== 'pdf' && route !== 'office') return refuse(res, 400, 'NOT_RENDERABLE', 'route must be pdf or office');
  const f = figuresOf(url);
  if (!f) return refuse(res, 400, 'LIMITS_MISSING', 'dpi, max, bytes, ms, entries and directory are each required');
  const { dpi, max } = f;
  const deadline = Date.now() + renderTimeMs(f.ms);
  const left = () => Math.max(1, deadline - Date.now());
  const src = join(dir, 'source');
  await pipeline(req, createWriteStream(src));
  const head = Buffer.alloc(1024);
  const fh = await open(src, 'r');
  let kind, info = null;
  try {
    await fh.read(head, 0, 1024, 0);
    kind = sniff(head);
    if (route === 'office' && kind && kind !== 'pdf') {
      const size = (await fh.stat()).size;
      // An encrypted OOXML document is an OLE2 container holding an EncryptedPackage stream.
      if (kind === 'ole2' && await fileHas(fh, size, ENCRYPTED_PACKAGE)) return refuse(res, 422, 'ENCRYPTED');
      info = await officeInfo(fh, size, kind, f);
    }
  } finally { await fh.close(); }
  let pdf = src, pages, sourcePages, exact = true, last;
  if (route === 'pdf') {
    if (kind !== 'pdf') return refuse(res, 422, 'NOT_RENDERABLE', 'the source is not a PDF');
  } else {
    if (!kind || kind === 'pdf') return refuse(res, 422, 'NOT_RENDERABLE', 'the source is not a Word, presentation or ODF text document');
    if (info.encrypted) return refuse(res, 422, 'ENCRYPTED');
    if (info.limit) return refuse(res, 422, 'NOT_RENDERABLE', 'the document\'s package directory is over the limit');
    const ext = kind === 'rtf' ? 'rtf' : kind === 'ole2' ? 'doc' : 'docx';
    const named = join(dir, `source.${ext}`);
    await rename(src, named);
    // R7 (G136b): only the first `max` pages are ever converted, so a long document costs `max` pages of work.
    const first = await convert(info.app, named, dir, 'out', `1-${max}`, left());
    if (first.r.timedOut) return refuse(res, 504, 'TIME_LIMIT');
    pdf = first.pdf;
    if (!first.made) {
      const msg = `${first.r.err}\n${first.r.out}`.trim();
      if (/password|encrypt/i.test(msg)) return refuse(res, 422, 'ENCRYPTED');
      return refuse(res, 422, 'NOT_RENDERABLE', msg || 'the converter produced no PDF');
    }
  }
  const counted = await pagesOf(pdf, left());
  if (counted.info.timedOut) return refuse(res, 504, 'TIME_LIMIT');
  if (/Incorrect password|encrypted/i.test(counted.info.err)) return refuse(res, 422, 'ENCRYPTED');
  pages = counted.pages;
  if (counted.info.code !== 0 || !pages) return refuse(res, 422, 'NOT_RENDERABLE', counted.info.err.trim() || 'no pages');
  last = Math.min(pages, max);
  sourcePages = pages;
  if (route === 'office') {
    // What the source has beyond the pages converted: its own statement of its page count, else one page past the cap asked
    // of the converter (a one-page range that exists only when the source is longer than the cap).
    if (info.pages && info.pages >= pages) sourcePages = info.pages;
    else if (pages === max) {
      const probe = await convert(info.app, join(dir, `source.${kind === 'rtf' ? 'rtf' : kind === 'ole2' ? 'doc' : 'docx'}`), dir, 'probe', `${max + 1}-${max + 1}`, left());
      if (probe.r.timedOut) return refuse(res, 504, 'TIME_LIMIT');
      if (probe.made && (await pagesOf(probe.pdf, left())).pages === 1) { sourcePages = max + 1; exact = false; }
    }
  }
  const raster = await run('pdftoppm', ['-r', String(dpi), '-jpeg', '-jpegopt', 'quality=85', '-f', '1', '-l', String(last),
    pdf, join(dir, 'page')], { ms: left() });
  if (raster.timedOut) return refuse(res, 504, 'TIME_LIMIT');
  const images = (await readdir(dir)).filter((n) => /^page-\d+\.jpg$/.test(n)).sort((a, b) => parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10));
  if (raster.code !== 0 || images.length !== last) return refuse(res, 500, 'RENDER_FAILED', raster.err.trim() || 'the rasteriser failed');
  const out = join(dir, 'safe-view.pdf');
  let written;
  try { written = await writeImagePdf(images.map((n) => join(dir, n)), dpi, out, f.bytes); }
  catch (e) { return refuse(res, 500, 'RENDER_FAILED', e.message); }
  return { file: out, headers: { 'content-type': 'application/pdf', 'x-derived-sha256': written.sha, 'x-pages': String(written.pages),
    'x-source-pages': String(Math.max(sourcePages, written.pages)), 'x-truncated': String(sourcePages > written.pages),
    ...(exact ? {} : { 'x-source-pages-exact': 'false' }) } };
}

async function versions() {
  const lo = await run(SOFFICE, ['--version'], { ms: 60_000 });
  const pp = await run('pdftoppm', ['-v'], { ms: 30_000 });
  return { libreoffice: (/LibreOffice\s+(\S+)/.exec(lo.out) || [])[1] || 'not reported',
    poppler: (/version\s+(\S+)/.exec(pp.err + pp.out) || [])[1] || 'not reported' };
}

async function routes(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/version') return json(res, 200, { ok: true, ...(await versions()) });
  if (req.method === 'POST' && url.pathname === '/render') return render(req, res, url);
  return false;
}

export const start = (port = 8080, host) => serve(port, routes, host);

if (import.meta.url === `file://${process.argv[1]}`) await start(Number(process.env.PORT || 8080));
