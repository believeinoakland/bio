// The scanner's states and limits (fix round 9, G136a, G136b; R2's byte budget, R3's `encrypted` and limit verdicts, R35's
// limits, R8's and R16's published bounds), through the member's surface and the ClamAV image's own server. The build
// machine has no `clamscan`, so a stand-in (stubs/fake-clamscan.mjs) answers as ClamAV's output lines do, chosen by each
// target's bytes, and records the flags it was run with; the image's own checks of a ZIP, an Office document and a RAR run
// for real.
import { FAKE_LOG } from './stubs/use-fake-clamscan.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { handle } from '../src/handler.mjs';
import * as limits from '../src/limits.mjs';
import { boundOf } from '../../bio-plane/src/read-bounds.mjs';
import { parseScan, scanFlags, limitsOf, LIMIT_NAMES } from '../container/scanner.mjs';
import { makeZip } from '../../bio-plane/test/make-zip.mjs';
import { memoryBucket, putCapture, mirrorTestSet, scannerImage, depsWith, post, enc } from './helpers.mjs';

const call = async (deps, body) => { const r = await handle(post('/scan', body), deps); return { status: r.status, body: await r.json() }; };
const runs = () => readFileSync(FAKE_LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const OLE2 = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ole2 = (...streams) => Buffer.concat([OLE2, Buffer.alloc(512), ...streams.map((s) => Buffer.concat([Buffer.from(s, 'utf16le'), Buffer.alloc(64)]))]);
const rar = () => Buffer.concat([Buffer.from('Rar!\x1a\x07\x01\x00', 'latin1'), Buffer.alloc(200, 7)]);

async function scanning() {
  const bucket = memoryBucket();
  const image = await scannerImage();
  const seen = [];
  const deps = depsWith({ bucket, scanner: (path, init) => { seen.push(path); return image.fetch(path, init); } });
  mirrorTestSet(bucket, { set: `rstates${Math.random().toString(36).slice(2, 8)}` });
  return { bucket, deps, seen, image };
}
const verdicts = async (deps, bucket, files) => {
  const targets = files.map((b) => putCapture(bucket, b));
  const r = await call(deps, { store: 'bio', targets });
  assert.equal(r.body.ok, true, JSON.stringify(r.body));
  return r.body.verdicts;
};

test('R3 G136a an encrypted ZIP, Office document or PDF is encrypted, never clean, and its type is named; a RAR the image does not unpack is unknown, stated', async () => {
  const { bucket, deps } = await scanning();
  const plain = makeZip([{ name: 'a.txt', data: 'hello', method: 0 }]);
  const withEncrypted = makeZip([{ name: 'a.txt', data: 'hello', method: 0 }, { name: 'secret.txt', data: 'sealed', method: 0, encrypted: 'traditional' }]);
  const zip64 = makeZip([{ name: 'secret.txt', data: 'sealed', method: 0, encrypted: 'aes', zip64: true }], { zip64: true });
  const encryptedPdf = readFileSync(new URL('./fixtures/encrypted.pdf', import.meta.url));
  const v = await verdicts(deps, bucket, [plain, withEncrypted, zip64, ole2('EncryptedPackage', 'EncryptionInfo'), ole2('WordDocument'),
    encryptedPdf, enc('%PDF-1.4 an ordinary file'), rar()]);
  assert.deepEqual(v.map((x) => [x.result, x.detail, x.findings]), [
    ['clean', undefined, []],
    ['encrypted', 'ENCRYPTED:zip', []],
    ['encrypted', 'ENCRYPTED:zip', []],
    ['encrypted', 'ENCRYPTED:office', []],
    ['clean', undefined, []],
    ['encrypted', 'ENCRYPTED:pdf', []],
    ['clean', undefined, []],
    ['unknown', 'UNOPENABLE:rar', []],
  ]);
  for (const x of v.slice(0, 8)) assert.ok(!('reason' in x));
});

test('R3 G136a a finding stands over what the image saw: an encrypted ZIP that ClamAV says is infected is found', async () => {
  const { bucket, deps } = await scanning();
  const bad = makeZip([{ name: 'x.com', data: 'FAKE:FOUND:Eicar-Test-Signature;', method: 0 }, { name: 's.txt', data: 'sealed', method: 0, encrypted: 'traditional' }]);
  const [v] = await verdicts(deps, bucket, [bad]);
  assert.deepEqual([v.result, v.findings], ['found', ['Eicar-Test-Signature']]);
});

test('R3 R35 every limit a scan reaches is unknown with that limit named, never clean; encrypted and limit are told apart', async () => {
  const { bucket, deps } = await scanning();
  const names = ['MaxFileSize', 'MaxScanSize', 'MaxFiles', 'MaxRecursion', 'MaxEmbeddedPE', 'MaxHTMLNormalize', 'MaxScriptNormalize', 'MaxZipTypeRcg', 'MaxPartitions', 'MaxIconsPE', 'MaxScanTime'];
  const v = await verdicts(deps, bucket, [...names.map((n) => enc(`FAKE:LIMIT:${n}`)), enc('FAKE:ENC:Zip'), enc('FAKE:ENC:OLE2')]);
  assert.deepEqual(v.map((x) => [x.result, x.detail]), [...names.map((n) => ['unknown', `LIMIT:${n}`]), ['encrypted', 'ENCRYPTED:zip'], ['encrypted', 'ENCRYPTED:ole2']]);
  // the parser's reading of clamscan's lines, a limit and an encrypted member of one file, and an unnamed limit
  const p = parseScan('/j/0: Heuristics.Limits.Exceeded.MaxRecursion FOUND\n/j/0: Heuristics.Encrypted.Zip FOUND\n/j/1: Heuristics.Limits.Exceeded FOUND\n',
    [['0', '/j/0'], ['1', '/j/1']]);
  assert.deepEqual(p, { 0: { result: 'encrypted', findings: [], detail: 'ENCRYPTED:zip' }, 1: { result: 'unknown', findings: [], detail: 'LIMIT:Unspecified' } });
});

test('R3 a run past its scan time is unknown LIMIT:ScanTime for every target not found', async () => {
  const { bucket, deps } = await scanning();
  process.env.SCAN_TIME_MS = '400';
  try {
    const v = await verdicts(deps, bucket, [enc('FAKE:HANG one'), enc('FAKE:HANG two')]);
    assert.deepEqual(v.map((x) => [x.result, x.detail]), Array(2).fill(['unknown', 'LIMIT:ScanTime']));
  } finally { delete process.env.SCAN_TIME_MS; }
});

test('R35 a scan passes ClamAV every limit explicitly, the figures /version states; a scan without them is refused', async () => {
  const { bucket, deps, image } = await scanning();
  const before = runs().length;
  await verdicts(deps, bucket, [enc('quiet')]);
  const ran = runs().slice(before);
  assert.equal(ran.length, 1);
  const flag = (n) => { const m = ran[0].flags.find((f) => f.startsWith(`--${n}=`)); return m ? m.slice(n.length + 3) : undefined; };
  const v = await (await handle(new Request('https://file-scanner/version'), deps)).json();
  const b = (n) => v.bounds[n].value;
  assert.deepEqual(['max-filesize', 'max-scansize', 'max-files', 'max-recursion', 'max-scantime', 'max-embeddedpe', 'max-htmlnormalize',
    'max-scriptnormalize', 'max-ziptypercg', 'max-partitions', 'max-iconspe'].map((n) => Number(flag(n))),
  [b('SCAN_MAX_BYTES'), b('SCAN_MAX_SCANSIZE'), b('SCAN_MAX_FILES'), b('SCAN_MAX_RECURSION'), b('SCAN_TIME_MS'), b('SCAN_EMBEDDED_PE'),
    b('SCAN_HTML_NORMALIZE'), b('SCAN_SCRIPT_NORMALIZE'), b('SCAN_ZIP_TYPE_RCG'), b('SCAN_PARTITIONS'), b('SCAN_ICONS_PE')]);
  assert.deepEqual([b('SCAN_MAX_FILES'), b('SCAN_MAX_RECURSION')], [boundOf('archive', 'members'), boundOf('archive', 'depth')]);
  assert.ok(ran[0].flags.includes('--alert-encrypted=yes') && ran[0].flags.includes('--alert-exceeds-max=yes'));
  assert.ok(ran[0].flags.every((f) => !/=0$/.test(f)));
  // the image refuses a scan that lacks a limit, whole or in part
  const put = await image.fetch('/job/jlimits/0', { method: 'PUT', body: 'x' });
  assert.equal(put.status, 200);
  const sig = (await (await image.fetch('/sigs')).json()).set;
  const missing = await image.fetch(`/job/jlimits/scan?set=${sig}`, { method: 'POST' });
  assert.deepEqual([missing.status, await missing.json()], [400, { ok: false, code: 'LIMITS_MISSING' }]);
  assert.equal(limitsOf(JSON.stringify({ ...limits.SCAN_LIMITS, max_files: 0 })), null);
  const { zip_directory: _drop, ...partial } = limits.SCAN_LIMITS;
  assert.equal(limitsOf(JSON.stringify(partial)), null);
  assert.deepEqual(Object.keys(limitsOf(JSON.stringify(limits.SCAN_LIMITS))), LIMIT_NAMES);
  assert.deepEqual(scanFlags(limitsOf(JSON.stringify(limits.SCAN_LIMITS))).filter((f) => f.startsWith('--max-')).length, 11);
  await image.fetch('/job/jlimits', { method: 'DELETE' });
});

test('R16 R8 /version states every read bound by name with its figure and its source, quoted from the table; no ceiling of the module is a literal', async () => {
  const v = await (await handle(new Request('https://file-scanner/version'), depsWith())).json();
  const quoted = { SCAN_MAX_BYTES: ['scan', 'max_bytes'], SCAN_TIME_MS: ['scan', 'time_ms'], SAFE_VIEW_PAGES_MAX: ['render', 'safe_view_pages'],
    SAFE_VIEW_BYTES_MAX: ['render', 'safe_view_bytes'], SCAN_MAX_SCANSIZE: ['archive', 'unpacked_bytes'], SCAN_MAX_FILES: ['archive', 'members'],
    SCAN_MAX_RECURSION: ['archive', 'depth'], SCAN_EMBEDDED_PE: ['scan', 'embedded_pe'], SCAN_HTML_NORMALIZE: ['scan', 'html_normalize'],
    SCAN_SCRIPT_NORMALIZE: ['scan', 'script_normalize'], SCAN_ZIP_TYPE_RCG: ['scan', 'zip_type_rcg'], SCAN_PARTITIONS: ['scan', 'partitions'],
    SCAN_ICONS_PE: ['scan', 'icons_pe'], SCAN_ZIP_DIRECTORY: ['archive', 'directory'] };
  for (const [name, [kind, row]] of Object.entries(quoted)) {
    assert.deepEqual(v.bounds[name], { value: boundOf(kind, row), source: 'alpha' }, name);
  }
  assert.equal(limits.SCAN_MAX_BYTES, boundOf('scan', 'max_bytes'));
  assert.equal(limits.SAFE_VIEW_PAGES_MAX, boundOf('render', 'safe_view_pages'));
  assert.equal(limits.SAFE_VIEW_BYTES_MAX, boundOf('render', 'safe_view_bytes'));
  assert.equal(limits.SAFE_VIEW_BYTES_MAX, 32 * 1024 * 1024, 'the protective figure BOB proposed');
  for (const n of ['SCAN_BATCH_MAX', 'SIGNATURES_MAX_AGE_MS', 'SAFE_VIEW_DPI', 'PROVIDER_TIMEOUT_MS', 'SANDBOX_TIMEOUT_MS', 'REPUTATION_LIST_MAX_AGE_MS', 'RENDER_TIME_MS']) {
    assert.equal(v.bounds[n], limits[n], n);
  }
  assert.deepEqual(v.bounds.LOG_COUNT_KINDS, [...limits.LOG_COUNT_KINDS]);
  // G124 (3): the module's own `src` holds no numeric literal for a ceiling it quotes: each read bound is read from the table
  const src = readFileSync(new URL('../src/limits.mjs', import.meta.url), 'utf8');
  for (const n of ['SCAN_MAX_BYTES', 'SCAN_TIME_MS', 'SAFE_VIEW_PAGES_MAX', 'SAFE_VIEW_BYTES_MAX']) {
    assert.match(src, new RegExp(`export const ${n} = boundOf\\(`), n);
  }
  const files = ['src', 'src/providers'].flatMap((d) => readdirSync(new URL(`../${d}/`, import.meta.url)).filter((f) => f.endsWith('.mjs')).map((f) => `../${d}/${f}`));
  for (const f of files.filter((f) => !f.endsWith('limits.mjs'))) {
    const text = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(!/(const|let)\s+[A-Z_]*(MAX_BYTES|_BYTES_MAX|MAX_FILES|MAX_RECURSION|SCAN_TIME)[A-Z_]*\s*=\s*[0-9]/.test(text), `${f} states no read bound of its own`);
  }
});

test('R2 G136b the targets staged for one run total at most SCAN_MAX_BYTES; one that would pass it is not_scanned BATCH_BUDGET and is scanned when sent again', async () => {
  const { bucket, deps, seen } = await scanning();
  const t = ['one', 'two', 'three', 'four'].map((s) => putCapture(bucket, enc(s)));
  const claimed = new Map([[t[0].capture_sha, limits.SCAN_MAX_BYTES / 2], [t[1].capture_sha, limits.SCAN_MAX_BYTES / 2],
    [t[2].capture_sha, 1], [t[3].capture_sha, limits.SCAN_MAX_BYTES]]);
  const head = bucket.head;
  bucket.head = async (key) => { const h = await head(key); const size = claimed.get(key.split('/').pop()); return h && size !== undefined ? { size } : h; };
  const r = await call(deps, { store: 'bio', targets: t });
  assert.deepEqual(r.body.verdicts.map((v) => [v.result, v.reason]), [['clean', undefined], ['clean', undefined], ['not_scanned', 'BATCH_BUDGET'], ['not_scanned', 'BATCH_BUDGET']]);
  assert.equal(seen.filter((p) => /^\/job\/[^/]+\/\d+$/.test(p)).length, 2, 'only the two that fit were staged in the image');
  const again = await call(deps, { store: 'bio', targets: [t[3]] });
  assert.deepEqual([again.body.verdicts[0].result, again.body.verdicts[0].reason], ['clean', undefined]);
  const more = await call(deps, { store: 'bio', targets: [t[2], t[0]] });
  assert.deepEqual(more.body.verdicts.map((v) => v.result), ['clean', 'clean']);
});
