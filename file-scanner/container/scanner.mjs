// The ClamAV image's server (R3, R4, R6, R14), behind the `FileScanner` class. The Worker reads every byte from the
// bucket and hands the image copies: the mirrored signature set, once per set, and one request's targets. The image
// keeps the loaded set (a copy of the mirror) and nothing of a request past it: each request's targets are written to a
// fresh directory, scanned by one `clamscan` run that loads the set once, and removed when the run ends.
//
//   GET  /version                  {ok, clamav_version}
//   GET  /sigs                     {ok, set, clamav_version} the set loaded, or null
//   PUT  /sigs/<set>/<file>        a signature file of the set being loaded
//   POST /sigs/<set>/load          {ok, set}                 the set becomes the one used; any other is removed
//   PUT  /verify/<run>/<file>      a file of a mirror run, to be verified
//   POST /verify/<run>             {ok, files: {<file>: {verified, version, build_time, sigs, detail?}}}  (R6)
//   PUT  /job/<job>/<i>            one target's copy
//   DELETE /job/<job>/<i>          a copy whose digest did not hold (R2)
//   POST /job/<job>/scan?set=<s>   {ok, engine_version, results: {<i>: {result, findings, detail?}}}  then removed
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';
import { NAME, json, run, serve, freshDir, removeDir } from './common.mjs';
import { SCAN_MAX_BYTES, SCAN_TIME_MS } from '../src/limits.mjs';

const scanTimeMs = () => Number(process.env.SCAN_TIME_MS || SCAN_TIME_MS);
const CLAMSCAN = process.env.CLAMSCAN || 'clamscan';
const SIGTOOL = process.env.SIGTOOL || 'sigtool';
const jobs = new Map();
const sigRoot = () => process.env.FILE_SCANNER_SIGS || '/var/lib/file-scanner/sigs';

// R3: archives, OLE2, PDF and HTML scanned inside; a file past ClamAV's own limits alerts (`Heuristics.Limits.*`) and
// is answered `unknown`, never `clean`. Every match is listed (`--allmatch`), and only the loaded set is read (R4).
const SCAN_FLAGS = ['--no-summary', '--stdout', '--allmatch=yes', '--scan-archive=yes', '--scan-ole2=yes',
  '--scan-pdf=yes', '--scan-html=yes', '--alert-exceeds-max=yes', '--alert-encrypted=no', '--bytecode=yes',
  `--max-filesize=${SCAN_MAX_BYTES}`, `--max-scansize=${SCAN_MAX_BYTES * 4}`];

async function receive(req, path) {
  await mkdir(join(path, '..'), { recursive: true });
  await pipeline(req, createWriteStream(path));
}

export async function clamavVersion() {
  const r = await run(CLAMSCAN, ['--version'], { ms: 30_000 });
  const m = /ClamAV\s+([0-9][0-9A-Za-z.+~-]*)/.exec(r.out);
  return m ? m[1] : 'not reported';
}

async function loadedSet() {
  const names = await readdir(sigRoot()).catch(() => []);
  return names.find((n) => NAME.test(n) && !n.endsWith('.partial')) || null;
}

/** One clamscan output line per file: `<path>: <name> FOUND`, `<path>: OK`, or another state. */
export function parseScan(out, files) {
  const results = {};
  for (const [i, path] of files) results[i] = { found: [], limits: [], ok: false };
  const byPath = new Map(files.map(([i, p]) => [p, i]));
  for (const line of out.split('\n')) {
    const m = /^(.*): (.+?) (FOUND|OK|ERROR)$/.exec(line) || /^(.*): (OK)$/.exec(line);
    if (!m) continue;
    const i = byPath.get(m[1]);
    if (i === undefined) continue;
    const r = results[i];
    if (m[2] === 'OK') { r.ok = true; continue; }
    if (m[3] !== 'FOUND') continue;
    const lim = /^Heuristics\.Limits\.Exceeded\.([A-Za-z]+)$/.exec(m[2]);
    if (lim) r.limits.push(lim[1]); else r.found.push(m[2]);
  }
  const verdicts = {};
  for (const [i, r] of Object.entries(results)) {
    if (r.found.length) verdicts[i] = { result: 'found', findings: [...new Set(r.found)] };
    else if (r.limits.length) verdicts[i] = { result: 'unknown', findings: [], detail: `LIMIT:${r.limits[0]}` };
    else if (r.ok) verdicts[i] = { result: 'clean', findings: [] };
    else verdicts[i] = { result: 'unknown', findings: [], detail: 'CLAMAV_ERROR' };
  }
  return verdicts;
}

/** R6: what `sigtool --info` states of one signature file, and whether its digital signature verified. */
export async function verifyFile(path) {
  const r = await run(SIGTOOL, ['--info', path], { ms: 120_000 });
  const field = (k) => { const m = new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(r.out); return m ? m[1].trim() : null; };
  const verified = r.code === 0 && /^Verification OK/m.test(r.out);
  return { verified, version: field('Version'), build_time: field('Build time'), sigs: field('Signatures'),
    ...(verified ? {} : { detail: (r.err || r.out).trim().split('\n').pop().slice(0, 200) }) };
}

async function routes(req, res, url) {
  const p = url.pathname.split('/').filter(Boolean);
  if (req.method === 'GET' && url.pathname === '/version') return json(res, 200, { ok: true, clamav_version: await clamavVersion() });
  if (req.method === 'GET' && url.pathname === '/sigs') return json(res, 200, { ok: true, set: await loadedSet(), clamav_version: await clamavVersion() });
  if (p[0] === 'sigs' && p.length === 3 && req.method === 'PUT' && NAME.test(p[1]) && NAME.test(p[2])) {
    await receive(req, join(sigRoot(), `${p[1]}.partial`, p[2]));
    return json(res, 200, { ok: true });
  }
  if (p[0] === 'sigs' && p.length === 3 && p[2] === 'load' && req.method === 'POST' && NAME.test(p[1])) {
    const partial = join(sigRoot(), `${p[1]}.partial`);
    if (!(await stat(partial).catch(() => null))) return json(res, 409, { ok: false, code: 'SET_NOT_RECEIVED' });
    for (const n of await readdir(sigRoot())) if (n !== `${p[1]}.partial`) await rm(join(sigRoot(), n), { recursive: true, force: true });
    await rename(partial, join(sigRoot(), p[1]));
    return json(res, 200, { ok: true, set: p[1] });
  }
  if (p[0] === 'verify' && p.length === 3 && req.method === 'PUT' && NAME.test(p[1]) && NAME.test(p[2])) {
    await receive(req, join(sigRoot(), '..', 'verify', p[1], p[2]));
    return json(res, 200, { ok: true });
  }
  if (p[0] === 'verify' && p.length === 2 && req.method === 'POST' && NAME.test(p[1])) {
    const dir = join(sigRoot(), '..', 'verify', p[1]);
    try {
      const files = {};
      for (const n of (await readdir(dir).catch(() => [])).sort()) files[n] = await verifyFile(join(dir, n));
      return json(res, 200, { ok: true, files });
    } finally { await removeDir(dir); }
  }
  if (p[0] === 'job' && NAME.test(p[1] || '')) {
    // A job's directory is made by its first copy and removed by its scan or its deletion, whichever ends it.
    if (p.length === 3 && /^\d+$/.test(p[2]) && req.method === 'PUT') {
      if (!jobs.has(p[1])) jobs.set(p[1], freshDir('job-'));
      const dir = await jobs.get(p[1]);
      await receive(req, join(dir, p[2]));
      return json(res, 200, { ok: true });
    }
    const made = jobs.get(p[1]);
    const dir = made ? await made : null;
    if (!dir) return json(res, 200, p[2] === 'scan' ? { ok: true, engine_version: await clamavVersion(), results: {} } : { ok: true });
    if (p.length === 3 && /^\d+$/.test(p[2]) && req.method === 'DELETE') { await rm(join(dir, p[2]), { force: true }); return json(res, 200, { ok: true }); }
    if (p.length === 3 && p[2] === 'scan' && req.method === 'POST') {
      // The copies are removed before the answer leaves, so nothing of the request outlives it (R14).
      let status = 200, body;
      try {
        const set = url.searchParams.get('set');
        if (!set || set !== (await loadedSet())) { status = 409; body = { ok: false, code: 'SET_NOT_LOADED' }; }
        else {
          const files = (await readdir(dir)).filter((n) => /^\d+$/.test(n)).map((n) => [n, join(dir, n)]);
          let results = {};
          if (files.length) {
            const r = await run(CLAMSCAN, [...SCAN_FLAGS, `--database=${join(sigRoot(), set)}`, ...files.map(([, f]) => f)], { ms: scanTimeMs() });
            results = parseScan(r.out, files);
            if (r.timedOut) for (const [i] of files) if (results[i].result !== 'found') results[i] = { result: 'unknown', findings: [], detail: 'LIMIT:ScanTime' };
          }
          body = { ok: true, engine_version: await clamavVersion(), results };
        }
      } finally { jobs.delete(p[1]); await removeDir(dir); }
      return json(res, status, body);
    }
    if (p.length === 2 && req.method === 'DELETE') { jobs.delete(p[1]); await removeDir(dir); return json(res, 200, { ok: true }); }
  }
  return false;
}

export const start = (port = 8080, host) => serve(port, routes, host);

if (import.meta.url === `file://${process.argv[1]}`) await start(Number(process.env.PORT || 8080));
