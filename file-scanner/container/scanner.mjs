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
//   POST /job/<job>/scan?set=<s>&limits=<json>   {ok, engine_version, results: {<i>: {result, findings, detail?}}}  then
//                                  removed; `limits` is every figure the run is told (R35), sent by the Worker, which quotes
//                                  them from the table; a scan without them is refused 400 LIMITS_MISSING
//   PUT  /update/<run>/<file>      a file of the set already mirrored, handed over before the run so that `freshclam`
//                                  brings it up to date and does not fetch it whole (R6)
//   POST /update/<run>             {ok, files: [<name>], changed: [<name>]} | {ok:false, code, detail}  ClamAV's own
//                                  `freshclam` fetches the databases into the run's directory (R6, R34); only the
//                                  signature-updater instance, the one the Worker starts with internet, can reach
//                                  the mirror; `changed` names what differs from the files handed over
//   GET  /update/<run>/<file>      one fetched file
//   DELETE /update/<run>           the run's directory removed
import { createWriteStream, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { mkdir, open, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';
import { NAME, json, run, serve, freshDir, removeDir, fileHas, zipDirectory } from './common.mjs';

// The kill budget for a run is the scan time ClamAV is told, plus this much for it to report what it reached first (the
// environment's SCAN_TIME_MS stands in for the whole in a test).
const KILL_GRACE_MS = 30_000;
const scanTimeMs = (limits) => (process.env.SCAN_TIME_MS ? Number(process.env.SCAN_TIME_MS) : limits.scan_time_ms + KILL_GRACE_MS);
const CLAMSCAN = process.env.CLAMSCAN || 'clamscan';
const SIGTOOL = process.env.SIGTOOL || 'sigtool';
export const MIRROR_HOST = 'database.clamav.net';
const UPDATE_TIME_MS = 900_000;
const FETCHED = /^(main|daily|bytecode)\.(cvd|cld)$/;
const jobs = new Map();
const sigRoot = () => process.env.FILE_SCANNER_SIGS || '/var/lib/file-scanner/sigs';

// R3: archives, OLE2, PDF and HTML scanned inside; a file past ClamAV's own limits alerts (`Heuristics.Limits.*`) and
// is answered `unknown`, never `clean`; a password-protected one alerts (`Heuristics.Encrypted.*`) and is `encrypted`.
// Every match is listed (`--allmatch`), and only the loaded set is read (R4).
const FIXED_FLAGS = ['--no-summary', '--stdout', '--allmatch=yes', '--scan-archive=yes', '--scan-ole2=yes', '--scan-pdf=yes',
  '--scan-html=yes', '--alert-exceeds-max=yes', '--alert-encrypted=yes', '--bytecode=yes'];

/** R35: the figures a scan is run with, each told to ClamAV explicitly, none left at its default. */
export const LIMIT_NAMES = Object.freeze(['max_filesize', 'max_scansize', 'max_files', 'max_recursion', 'scan_time_ms', 'embedded_pe',
  'html_normalize', 'script_normalize', 'zip_type_rcg', 'partitions', 'icons_pe', 'zip_directory']);

/** The limits of a request, or null when one is missing or is not a positive whole number. */
export function limitsOf(param) {
  let l;
  try { l = JSON.parse(param || ''); } catch { return null; }
  if (!l || typeof l !== 'object' || !LIMIT_NAMES.every((n) => Number.isSafeInteger(l[n]) && l[n] > 0)) return null;
  return Object.fromEntries(LIMIT_NAMES.map((n) => [n, l[n]]));
}

export const scanFlags = (l) => [...FIXED_FLAGS, `--max-filesize=${l.max_filesize}`, `--max-scansize=${l.max_scansize}`,
  `--max-files=${l.max_files}`, `--max-recursion=${l.max_recursion}`, `--max-scantime=${l.scan_time_ms}`,
  `--max-embeddedpe=${l.embedded_pe}`, `--max-htmlnormalize=${l.html_normalize}`, `--max-scriptnormalize=${l.script_normalize}`,
  `--max-ziptypercg=${l.zip_type_rcg}`, `--max-partitions=${l.partitions}`, `--max-iconspe=${l.icons_pe}`];

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

/** One clamscan output line per file: `<path>: <name> FOUND`, `<path>: OK`, or another state. A match is a finding, a
 *  limit alert (`Heuristics.Limits.Exceeded.<name>`), or an encrypted alert (`Heuristics.Encrypted.<type>`). */
export function parseScan(out, files) {
  const results = {};
  for (const [i, path] of files) results[i] = { found: [], limits: [], encrypted: [], ok: false };
  const byPath = new Map(files.map(([i, p]) => [p, i]));
  for (const line of out.split('\n')) {
    const m = /^(.*): (.+?) (FOUND|OK|ERROR)$/.exec(line) || /^(.*): (OK)$/.exec(line);
    if (!m) continue;
    const i = byPath.get(m[1]);
    if (i === undefined) continue;
    const r = results[i];
    if (m[2] === 'OK') { r.ok = true; continue; }
    if (m[3] !== 'FOUND') continue;
    const lim = /^Heuristics\.(?:Limits\.Exceeded|Exceeds\.Max)(?:\.([A-Za-z]+))?$/.exec(m[2]);
    const encType = /^Heuristics\.(?:[A-Za-z0-9]+\.)*Encrypted(?:\.([A-Za-z0-9]+))?/.exec(m[2]);
    if (lim) r.limits.push(lim[1] || 'Unspecified');
    else if (encType) r.encrypted.push((encType[1] || 'unknown').toLowerCase());
    else r.found.push(m[2]);
  }
  const verdicts = {};
  for (const [i, r] of Object.entries(results)) {
    if (r.found.length) verdicts[i] = { result: 'found', findings: [...new Set(r.found)] };
    else if (r.encrypted.length) verdicts[i] = { result: 'encrypted', findings: [], detail: `ENCRYPTED:${r.encrypted[0]}` };
    else if (r.limits.length) verdicts[i] = { result: 'unknown', findings: [], detail: `LIMIT:${r.limits[0]}` };
    else if (r.ok) verdicts[i] = { result: 'clean', findings: [] };
    else verdicts[i] = { result: 'unknown', findings: [], detail: 'CLAMAV_ERROR' };
  }
  return verdicts;
}

const OLE2 = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ENCRYPTED_PACKAGE = Buffer.from('EncryptedPackage', 'utf16le');

/** A ZIP's central directory: `{encrypted}` when an entry among the first `max_files` has its encryption flag, `{limit}`
 *  when the directory is over the limit, else `{}`. */
async function zipEncrypted(fh, size, limits) {
  const d = await zipDirectory(fh, size, { maxEntries: limits.max_files, maxBytes: limits.zip_directory });
  if (d.limit) return { limit: d.limit };
  return d.entries.some((e) => e.flags & 1) ? { encrypted: 'zip' } : {};
}

/** What the image itself can tell of a target beside ClamAV's answer (R3, G136a): a password-protected ZIP (an entry's
 *  encryption flag) or Office document (an OLE2 container holding an `EncryptedPackage`), `{encrypted: <type>}`; a RAR,
 *  which the image does not unpack, `{unopenable: 'rar'}`; a directory past the limit, `{limit}`. Never throws. */
export async function inspect(path, limits) {
  let fh;
  try {
    fh = await open(path, 'r');
    const { size } = await fh.stat();
    const head = Buffer.alloc(Math.min(size, 8));
    await fh.read(head, 0, head.length, 0);
    if (head.subarray(0, 6).equals(Buffer.from('Rar!\x1a\x07', 'latin1'))) return { unopenable: 'rar' };
    if (head[0] === 0x50 && head[1] === 0x4b) return await zipEncrypted(fh, size, limits);
    if (head.equals(OLE2) && await fileHas(fh, size, ENCRYPTED_PACKAGE)) return { encrypted: 'office' };
    return {};
  } catch { return {}; } finally { await fh?.close().catch(() => {}); }
}

/** One target's verdict: ClamAV's, unless a finding is not ClamAV's to make less than it is: `found` stands; then what the
 *  image saw (`encrypted`, `unopenable`, a directory limit) replaces a `clean` or an `unknown`. */
export function settle(verdict, seen) {
  if (verdict.result === 'found') return verdict;
  if (seen.encrypted && verdict.result !== 'encrypted') return { result: 'encrypted', findings: [], detail: `ENCRYPTED:${seen.encrypted}` };
  if (seen.unopenable) return { result: 'unknown', findings: [], detail: `UNOPENABLE:${seen.unopenable}` };
  if (seen.limit && verdict.result === 'clean') return { result: 'unknown', findings: [], detail: `LIMIT:${seen.limit}` };
  return verdict;
}

/** R6: what `sigtool --info` states of one signature file, and whether its digital signature verified. */
export async function verifyFile(path) {
  const r = await run(SIGTOOL, ['--info', path], { ms: 120_000 });
  const field = (k) => { const m = new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(r.out); return m ? m[1].trim() : null; };
  const verified = r.code === 0 && /^Verification OK/m.test(r.out);
  return { verified, version: field('Version'), build_time: field('Build time'), sigs: field('Signatures'),
    ...(verified ? {} : { detail: (r.err || r.out).trim().split('\n').pop().slice(0, 200) }) };
}

const digestOf = (path) => new Promise((resolve, reject) => {
  const h = createHash('sha256');
  createReadStream(path).on('data', (d) => h.update(d)).on('end', () => resolve(h.digest('hex'))).on('error', reject);
});
const digests = async (dir, names) => Object.fromEntries(await Promise.all(names.map(async (n) => [n, await digestOf(join(dir, n))])));

/** R6, R34: ClamAV's own updater, under its own identity (it states `ClamAV/<version>` itself; no agent is set here),
 *  brings the databases in the run's directory up to date from the official host: the files handed over before (R6) are
 *  patched, the rest fetched whole. Answers the files and which of them differ from those handed over, or why it did not. */
export async function fetchSignatures(dir) {
  await mkdir(dir, { recursive: true });
  const seeded = await digests(dir, (await readdir(dir)).filter((n) => FETCHED.test(n)));
  const conf = join(dir, 'freshclam.conf');
  const settings = [['DatabaseDirectory', dir], ['DatabaseMirror', MIRROR_HOST], ['DNSDatabaseInfo', 'current.cvd.clamav.net'],
    ['CompressLocalDatabase', 'no'], ['Foreground', 'yes']];
  await writeFile(conf, settings.map(([k, v]) => `${k} ${v}`).join('\n') + '\n');
  const r = await run(process.env.FRESHCLAM || 'freshclam', [`--config-file=${conf}`, `--datadir=${dir}`, '--stdout', '--no-warnings'], { ms: UPDATE_TIME_MS });
  const files = (await readdir(dir)).filter((n) => FETCHED.test(n)).sort();
  const have = new Set(files.map((n) => n.split('.')[0]));
  if (r.code === 0 && ['main', 'daily', 'bytecode'].every((d) => have.has(d))) {
    const now = await digests(dir, files);
    return { ok: true, files, changed: files.filter((n) => now[n] !== seeded[n]) };
  }
  const text = (r.timedOut ? 'TIME_LIMIT' : `${r.err}\n${r.out}`).split('\n').map((l) => l.trim()).filter(Boolean)
    .filter((l) => /error|fail|refus|forbidden|403|429|cool|connect|TIME_LIMIT/i.test(l)).slice(-2).join(' | ');
  return { ok: false, code: 'MIRROR_REFUSED', detail: `exit ${r.code}${text ? `: ${text}` : ''}`.replaceAll(dir, '').slice(0, 300) };
}

const updateDir = (run) => join(sigRoot(), '..', 'update', run);

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
  if (p[0] === 'update' && NAME.test(p[1] || '')) {
    if (p.length === 3 && req.method === 'PUT' && FETCHED.test(p[2])) {
      await receive(req, join(updateDir(p[1]), p[2]));
      return json(res, 200, { ok: true });
    }
    if (p.length === 2 && req.method === 'POST') {
      const dir = updateDir(p[1]);
      const r = await fetchSignatures(dir);
      if (!r.ok) await removeDir(dir);
      return json(res, 200, r);
    }
    if (p.length === 3 && req.method === 'GET' && FETCHED.test(p[2])) {
      const f = join(updateDir(p[1]), p[2]);
      const st = await stat(f).catch(() => null);
      if (!st) return json(res, 404, { ok: false, code: 'UNKNOWN' });
      res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(st.size) });
      await pipeline(createReadStream(f), res);
      return true;
    }
    if (p.length === 2 && req.method === 'DELETE') { await removeDir(updateDir(p[1])); return json(res, 200, { ok: true }); }
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
        const limits = limitsOf(url.searchParams.get('limits'));
        if (!limits) { status = 400; body = { ok: false, code: 'LIMITS_MISSING' }; }
        else if (!set || set !== (await loadedSet())) { status = 409; body = { ok: false, code: 'SET_NOT_LOADED' }; }
        else {
          const files = (await readdir(dir)).filter((n) => /^\d+$/.test(n)).map((n) => [n, join(dir, n)]);
          let results = {};
          if (files.length) {
            const r = await run(CLAMSCAN, [...scanFlags(limits), `--database=${join(sigRoot(), set)}`, ...files.map(([, f]) => f)], { ms: scanTimeMs(limits) });
            results = parseScan(r.out, files);
            if (r.timedOut) for (const [i] of files) if (results[i].result !== 'found') results[i] = { result: 'unknown', findings: [], detail: 'LIMIT:ScanTime' };
            for (const [i, f] of files) results[i] = settle(results[i], await inspect(f, limits));
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
