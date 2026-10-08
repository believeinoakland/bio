// The safe-view image's server (R7, R14), behind the `SafeViewRenderer` class. It takes one source's copy and answers a
// new PDF whose every page is one image of a source page at the asked resolution, and nothing else of the source: no
// text layer, script, action, link, form, attachment or metadata (after Dangerzone's design: render, rasterise, write
// images only). An office source is first converted to PDF by LibreOffice, headless, with a profile of its own made
// and removed with the request; nothing reaches the network (R12).
//
//   GET  /version                                       {ok, libreoffice, poppler}
//   POST /render?route=pdf|office&dpi=<n>&max=<pages>   200 application/pdf with x-derived-sha256, x-pages,
//                                                       x-source-pages, x-truncated; or {ok:false, code, message?}
import { createReadStream, createWriteStream } from 'node:fs';
import { readdir, readFile, open } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { json, run, serve, freshDir, removeDir } from './common.mjs';
import { RENDER_TIME_MS, SAFE_VIEW_DPI, SAFE_VIEW_PAGES_MAX } from '../src/limits.mjs';

const renderTimeMs = () => Number(process.env.RENDER_TIME_MS || RENDER_TIME_MS);
const SOFFICE = process.env.SOFFICE || 'soffice';

// A refusal, as `work` answers it; `render` sends it once the request's directory is gone.
const refuse = (res, status, code, message) => ({ status, body: { ok: false, code, ...(message ? { message: String(message).slice(0, 300) } : {}) } });

/** What the source is, from its first bytes: `pdf`, `zip` (OOXML, ODF), `ole2` (Word 97, PowerPoint 97), `rtf`. */
export function sniff(head) {
  const s = head.toString('latin1');
  if (s.slice(0, 1024).includes('%PDF-')) return 'pdf';
  if (head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) return 'zip';
  if (head.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return 'ole2';
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

/** Writes a PDF holding exactly one image per page, each page the image's size at `dpi`; answers its SHA-256. */
export async function writeImagePdf(images, dpi, out) {
  const fh = await open(out, 'w');
  const hash = createHash('sha256');
  let offset = 0;
  const offsets = [];
  const put = async (data) => {
    const b = typeof data === 'string' ? Buffer.from(data, 'latin1') : data;
    hash.update(b); await fh.write(b); offset += b.length;
  };
  const n = images.length;
  // Objects: 1 catalog, 2 pages, then per page i: page 3+3i, content 4+3i, image 5+3i.
  await put('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
  const obj = async (id, body) => { offsets[id] = offset; await put(`${id} 0 obj\n`); await put(body); await put('\nendobj\n'); };
  await obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  await obj(2, `<< /Type /Pages /Count ${n} /Kids [${images.map((_, i) => `${3 + 3 * i} 0 R`).join(' ')}] >>`);
  for (let i = 0; i < n; i++) {
    const jpg = await readFile(images[i]);
    const { width, height, components } = jpegInfo(jpg);
    const w = (width * 72 / dpi).toFixed(2), h = (height * 72 / dpi).toFixed(2);
    const content = `q ${w} 0 0 ${h} 0 0 cm /I Do Q`;
    await obj(3 + 3 * i, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /I ${5 + 3 * i} 0 R >> >> /Contents ${4 + 3 * i} 0 R >>`);
    await obj(4 + 3 * i, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    offsets[5 + 3 * i] = offset;
    await put(`${5 + 3 * i} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /${components === 1 ? 'DeviceGray' : components === 4 ? 'DeviceCMYK' : 'DeviceRGB'} /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
    await put(jpg);
    await put('\nendstream\nendobj\n');
  }
  const xref = offset;
  const count = 3 + 3 * n;
  let table = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let id = 1; id < count; id++) table += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  await put(`${table}trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  await fh.close();
  return hash.digest('hex');
}

// The request's directory is removed before its answer leaves (R14): a refusal is sent after the removal, and the safe
// view is streamed from a handle opened before it, so the bytes outlive their path but not the request.
async function render(req, res, url) {
  const dir = await freshDir('render-');
  let out;
  try { out = await work(req, res, url, dir); }
  finally {
    if (out && out.file) out.handle = await open(out.file, 'r');
    await removeDir(dir);
  }
  if (!out.handle) return json(res, out.status, out.body);
  res.writeHead(200, out.headers);
  await pipeline(out.handle.createReadStream(), res);
}

async function work(req, res, url, dir) {
  const route = url.searchParams.get('route');
  const bound = (name, fallback) => { const n = Number(url.searchParams.get(name)); return Number.isSafeInteger(n) && n > 0 ? n : fallback; };
  const dpi = bound('dpi', SAFE_VIEW_DPI);
  const max = bound('max', SAFE_VIEW_PAGES_MAX);
  if (route !== 'pdf' && route !== 'office') return refuse(res, 400, 'NOT_RENDERABLE', 'route must be pdf or office');
  const deadline = Date.now() + renderTimeMs();
  const left = () => Math.max(1, deadline - Date.now());
  {
    const src = join(dir, 'source');
    await pipeline(req, createWriteStream(src));
    const head = Buffer.alloc(1024);
    const fh = await open(src, 'r'); await fh.read(head, 0, 1024, 0); await fh.close();
    const kind = sniff(head);
    let pdf = src;
    if (route === 'pdf') {
      if (kind !== 'pdf') return refuse(res, 422, 'NOT_RENDERABLE', 'the source is not a PDF');
    } else {
      if (!kind || kind === 'pdf') return refuse(res, 422, 'NOT_RENDERABLE', 'the source is not a Word, presentation or ODF text document');
      // An encrypted OOXML document is an OLE2 container holding an EncryptedPackage stream.
      const whole = await readFile(src);
      if (kind === 'ole2' && whole.includes(Buffer.from('EncryptedPackage', 'utf16le'))) return refuse(res, 422, 'ENCRYPTED');
      const ext = kind === 'rtf' ? 'rtf' : kind === 'ole2' ? 'doc' : 'docx';
      const named = join(dir, `source.${ext}`);
      await pipeline(createReadStream(src), createWriteStream(named));
      const r = await run(SOFFICE, ['--headless', '--norestore', '--nolockcheck', '--nodefault',
        `-env:UserInstallation=file://${join(dir, 'profile')}`, '--convert-to', 'pdf', '--outdir', join(dir, 'out'), named],
      { ms: left(), env: { PATH: process.env.PATH, HOME: dir } });
      if (r.timedOut) return refuse(res, 504, 'TIME_LIMIT');
      pdf = join(dir, 'out', 'source.pdf');
      if (!(await readFile(pdf).catch(() => null))) {
        const msg = `${r.err}\n${r.out}`.trim();
        if (/password|encrypt/i.test(msg)) return refuse(res, 422, 'ENCRYPTED');
        return refuse(res, 422, 'NOT_RENDERABLE', msg || 'the converter produced no PDF');
      }
    }
    const info = await run('pdfinfo', [pdf], { ms: left() });
    if (info.timedOut) return refuse(res, 504, 'TIME_LIMIT');
    if (/Incorrect password|encrypted/i.test(info.err)) return refuse(res, 422, 'ENCRYPTED');
    const pages = Number((/^Pages:\s+(\d+)/m.exec(info.out) || [])[1]);
    if (info.code !== 0 || !pages) return refuse(res, 422, 'NOT_RENDERABLE', info.err.trim() || 'no pages');
    const last = Math.min(pages, max);
    const raster = await run('pdftoppm', ['-r', String(dpi), '-jpeg', '-jpegopt', 'quality=85', '-f', '1', '-l', String(last),
      pdf, join(dir, 'page')], { ms: left() });
    if (raster.timedOut) return refuse(res, 504, 'TIME_LIMIT');
    const images = (await readdir(dir)).filter((n) => /^page-\d+\.jpg$/.test(n)).sort((a, b) => parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10));
    if (raster.code !== 0 || images.length !== last) return refuse(res, 500, 'RENDER_FAILED', raster.err.trim() || 'the rasteriser failed');
    const out = join(dir, 'safe-view.pdf');
    const sha = await writeImagePdf(images.map((n) => join(dir, n)), dpi, out);
    return { file: out, headers: { 'content-type': 'application/pdf', 'x-derived-sha256': sha, 'x-pages': String(last),
      'x-source-pages': String(pages), 'x-truncated': String(pages > last) } };
  }
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
