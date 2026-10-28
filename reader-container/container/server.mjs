/* The container's server (R1, R3, R5): one HTTP endpoint per route, each answering a stream of records
 * (`src/records.mjs`). The caller sends every figure it judges by in `x-reader-bounds` (JSON); a request without them is
 * refused, so the image holds no ceiling of its own. An upload past its `bytes` figure is refused as it arrives. The
 * container has no network, keeps nothing between requests, and removes every copy when a request ends (R8).
 *   POST /convert?kind=doc&to=docx   → converted (payload: the open-format file) | refusal
 *   POST /frames?kind=heic           → frame (payload: PNG)… then facts | refusal
 *   POST /archive?kind=zip&name=…    → member (payload: its bytes)… then end | refusal
 *   GET  /version                    → { ok, tools } */
import { createServer } from 'node:http';
import { mkdtempSync, createWriteStream, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { encodeRecord } from '../src/records.mjs';
import { convert, soffice } from './convert.mjs';
import { decode } from './images.mjs';
import { open, sevenZip } from './archives.mjs';
import { run } from './run.mjs';

const NEEDS = {
  convert: ['bytes', 'timeMs'],
  frames: ['bytes', 'pixels', 'edge', 'timeMs'],
  archive: ['bytes', 'unpacked', 'ratio', 'members', 'member', 'name', 'timeMs'],
};

function boundsOf(req, route) {
  let b;
  try { b = JSON.parse(req.headers['x-reader-bounds'] ?? 'null'); } catch { b = null; }
  if (!b || NEEDS[route].some((k) => typeof b[k] !== 'number')) return null;
  return b;
}

/* the request body into memory, or { over } once it passes `max` bytes */
function bodyOf(req, max) {
  return new Promise((resolve) => {
    const parts = [];
    let n = 0, over = false;
    req.on('data', (c) => { n += c.length; if (n > max) { over = true; req.pause(); req.destroy(); resolve({ over: n }); } else parts.push(c); });
    req.on('end', () => { if (!over) resolve({ bytes: new Uint8Array(Buffer.concat(parts)) }); });
    req.on('error', () => { if (!over) resolve({ over: null }); });
  });
}

/* the request body to a file, or { over } once it passes `max` bytes */
function bodyToFile(req, path, max) {
  return new Promise((resolve) => {
    const out = createWriteStream(path);
    let n = 0, done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    req.on('data', (c) => { n += c.length; if (n > max) { req.unpipe(out); out.destroy(); req.destroy(); finish({ over: n }); } });
    req.pipe(out);
    out.on('finish', () => finish({ size: n }));
    out.on('error', () => finish({ over: null }));
  });
}

function writer(res) {
  res.writeHead(200, { 'content-type': 'application/octet-stream' });
  return async (header, payload) => {
    for (const part of encodeRecord(header, payload)) {
      if (!res.write(part)) await new Promise((r) => res.once('drain', r));
    }
  };
}
const refused = (res, answer) => { const emit = writer(res); return emit({ type: 'refusal', ...answer }).then(() => res.end()); };

async function versions() {
  const first = async (cmd, args) => { const r = await run(cmd, args, { timeMs: 30000 }); return r.status === 0 ? r.stdout.toString().split('\n').find(Boolean)?.trim() ?? null : null; };
  return {
    libreoffice: await first(soffice(), ['--version']),
    imagemagick: await first('convert', ['-version']),
    exiftool: await first('exiftool', ['-ver']),
    sevenzip: (await run(sevenZip(), [], { timeMs: 30000 })).stdout.toString().split('\n').find((l) => /7-Zip/.test(l))?.trim() ?? null,
  };
}

export function handler() {
  return async (req, res) => {
    const url = new URL(req.url, 'http://container');
    const route = url.pathname.slice(1);
    if (req.method === 'GET' && route === 'version') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, tools: await versions() })); return; }
    if (req.method !== 'POST' || !NEEDS[route]) { res.writeHead(404, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: false, code: 'UNKNOWN' })); return; }
    const bounds = boundsOf(req, route);
    if (!bounds) { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: false, code: 'NO_BOUNDS' })); return; }
    const kind = url.searchParams.get('kind');
    if (route === 'archive') {
      const dir = mkdtempSync(join(tmpdir(), 'rc-archive-'));
      try {
        const path = join(dir, 'in');
        const got = await bodyToFile(req, path, bounds.bytes);
        if (got.over !== undefined) return void await refused(res, { code: 'OVER_BOUND', size: got.over, limit: bounds.bytes });
        const emit = writer(res);
        const r = await open(path, kind, bounds, { name: url.searchParams.get('name'), timeMs: bounds.timeMs }, emit);
        await emit(r.ok ? { type: 'end', members: r.members, unpacked: r.unpacked } : { type: 'refusal', ...r });
        res.end();
      } finally { rmSync(dir, { recursive: true, force: true }); }
      return;
    }
    const got = await bodyOf(req, bounds.bytes);
    if (got.over !== undefined) return void await refused(res, { code: 'OVER_BOUND', size: got.over, limit: bounds.bytes });
    if (route === 'convert') {
      const r = await convert(got.bytes, kind, url.searchParams.get('to'), { timeMs: bounds.timeMs });
      const emit = writer(res);
      await (r.ok ? emit({ type: 'converted', to: url.searchParams.get('to') }, r.bytes) : emit({ type: 'refusal', ...r }));
      res.end();
      return;
    }
    const r = await decode(got.bytes, kind, bounds, { timeMs: bounds.timeMs });
    const emit = writer(res);
    if (!r.ok) await emit({ type: 'refusal', ...r });
    else {
      for (const f of r.frames) await emit({ type: 'frame', page: f.page, width: f.width, height: f.height, format: 'png' }, f.png);
      await emit({ type: 'facts', ...r.facts, pages: r.frames.length });
    }
    res.end();
  };
}

/* listens on PORT (8080 in the image); answers the server, for a test to close */
export function listen(port = Number(process.env.PORT || 8080), host = '127.0.0.1') {
  const server = createServer(handler());
  server.requestTimeout = 0;
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

/* in the image: every interface of the container's own network namespace, which only its Worker reaches */
if (import.meta.url === `file://${process.argv[1]}`) listen(undefined, '0.0.0.0');
