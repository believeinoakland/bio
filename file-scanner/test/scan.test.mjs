// POST /scan (R1–R4), the fresh copy per request (R14) and R17's offline corpus, through the member's surface with
// the ClamAV image's own server and a test signature set standing as the mirror.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { handle } from '../src/handler.mjs';
import { SCAN_BATCH_MAX, SIGNATURES_MAX_AGE_MS, SCAN_MAX_BYTES } from '../src/limits.mjs';
import { parseScan } from '../container/scanner.mjs';
import { makeZip } from '../../bio-plane/test/make-zip.mjs';
import { onePage } from '../../pdf-worker/test/make-pdf.mjs';
import { memoryBucket, putCapture, mirrorTestSet, scannerImage, depsWith, post, enc, EICAR, NOW, toolsPresent } from './helpers.mjs';

const skip = !toolsPresent && 'clamscan and sigtool are not installed';
const call = async (deps, body) => { const r = await handle(post('/scan', body), deps); return { status: r.status, body: await r.json() }; };
const docm = () => makeZip([{ name: '[Content_Types].xml', data: '<Types/>' }, { name: 'word/document.xml', data: '<w:document/>' },
  { name: 'word/vbaProject.bin', data: 'Sub AutoOpen()\r\nEnd Sub\r\n' }]);
const cleanPdf = () => onePage({ ops: 'BT /F1 12 Tf 72 720 Td (A clean corpus page) Tj ET', res: '/Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >>' });

async function scanning(bucket = memoryBucket()) {
  const image = await scannerImage();
  return { bucket, image, deps: depsWith({ bucket, scanner: image.fetch }) };
}

test('R1 the request checks come before any read: store, batch size, bucket', async () => {
  const deps = depsWith();
  const t = { capture_sha: 'a'.repeat(64), parts: null };
  assert.deepEqual((await call(deps, { store: 'elsewhere', targets: [t] })), { status: 400, body: { ok: false, code: 'NAMESPACE_UNKNOWN' } });
  assert.deepEqual((await call(deps, { targets: [t] })).body.code, 'NAMESPACE_UNKNOWN');
  for (const targets of [[], 'x', null, Array(SCAN_BATCH_MAX + 1).fill(t)]) {
    assert.deepEqual(await call(deps, { store: 'bio', targets }), { status: 400, body: { ok: false, code: 'BAD_BATCH' } });
  }
  assert.deepEqual(await call(depsWith({ bucket: null }), { store: 'scratch', targets: [t] }), { status: 503, body: { ok: false, code: 'R2_NOT_CONFIGURED' } });
  assert.deepEqual(deps.bucket.calls, [], 'nothing was read for a refused request');
});

test('R1 a malformed target is answered not_scanned BAD_TARGET and the batch goes on', { skip }, async () => {
  const { bucket, deps } = await scanning();
  mirrorTestSet(bucket);
  const good = putCapture(bucket, enc('fine'));
  const bad = [{ capture_sha: 'XYZ', parts: null }, { capture_sha: 'a'.repeat(64), parts: [] },
    { capture_sha: 'a'.repeat(64), parts: [{ sha256: 'b'.repeat(64), bytes: -1 }] }, 'nope'];
  const { body } = await call(deps, { store: 'bio', targets: [...bad, good] });
  assert.equal(body.ok, true);
  assert.deepEqual(body.verdicts.slice(0, 4).map((v) => [v.result, v.reason]), Array(4).fill(['not_scanned', 'BAD_TARGET']));
  assert.equal(body.verdicts[4].result, 'clean');
});

test('R2 each target is read as a copy, parts in order with their own digests, the whole checked against capture_sha', { skip }, async () => {
  const { bucket, deps } = await scanning();
  mirrorTestSet(bucket);
  const whole = putCapture(bucket, EICAR);
  const parts = putCapture(bucket, EICAR, { split: 20 });
  const missing = { capture_sha: 'c'.repeat(64), parts: null };
  // A part present under its name whose bytes do not hash to it, and a whole whose parts do not make capture_sha.
  const tampered = putCapture(bucket, enc('abcdefghij'), { split: 5 });
  bucket.objects.set(`bio/captures/${tampered.parts[1].sha256}`, enc('XXXXX'));
  const wrongWhole = { capture_sha: 'd'.repeat(64), parts: putCapture(bucket, enc('0123456789'), { split: 5 }).parts };
  const before = new Map(bucket.objects);
  const { body } = await call(deps, { store: 'bio', targets: [whole, parts, missing, tampered, wrongWhole] });
  assert.deepEqual(body.verdicts.map((v) => [v.result, v.reason]), [['found', undefined], ['found', undefined],
    ['not_scanned', 'NOT_FOUND'], ['not_scanned', 'DIGEST_MISMATCH'], ['not_scanned', 'DIGEST_MISMATCH']]);
  assert.deepEqual(body.verdicts.map((v) => v.capture_sha), [whole.capture_sha, parts.capture_sha, missing.capture_sha, tampered.capture_sha, 'd'.repeat(64)]);
  for (const [k, v] of before) assert.deepEqual(bucket.objects.get(k), v, `${k} unchanged`);
});

test('R2 over SCAN_MAX_BYTES is TOO_LARGE with nothing read', { skip }, async () => {
  const { bucket, deps } = await scanning();
  mirrorTestSet(bucket);
  const big = { capture_sha: 'e'.repeat(64), parts: null };
  bucket.head = async (key) => { bucket.calls.push(['head', key]); return key.endsWith('e'.repeat(64)) ? { size: SCAN_MAX_BYTES + 1 } : null; };
  const declared = { capture_sha: 'f'.repeat(64), parts: [{ sha256: '1'.repeat(64), bytes: SCAN_MAX_BYTES }, { sha256: '2'.repeat(64), bytes: 1 }] };
  const { body } = await call(deps, { store: 'bio', targets: [big, declared] });
  assert.deepEqual(body.verdicts.map((v) => v.reason), ['TOO_LARGE', 'TOO_LARGE']);
  assert.ok(!bucket.calls.some(([op, k]) => op === 'get' && k.includes('/captures/')), 'no capture was read');
});

test('R3 one verdict per target in request order, ClamAV named with its version and the loaded set; one failure never fails the batch', { skip }, async () => {
  const { bucket, deps } = await scanning();
  const set = mirrorTestSet(bucket);
  const a = putCapture(bucket, EICAR), b = putCapture(bucket, enc('plain text')), c = { capture_sha: '9'.repeat(64), parts: null };
  const { status, body } = await call(deps, { store: 'bio', targets: [b, c, a] });
  assert.equal(status, 200);
  assert.equal(body.verdicts.length, 3);
  const [vb, vc, va] = body.verdicts;
  assert.deepEqual([vb.capture_sha, vc.capture_sha, va.capture_sha], [b.capture_sha, c.capture_sha, a.capture_sha]);
  for (const v of body.verdicts) {
    assert.equal(v.tool, 'clamav'); assert.equal(v.engine, 'clamav');
    assert.match(v.engine_version, /^\d+\.\d+/);
    assert.deepEqual(v.signatures, { main: 62, daily: null, bytecode: null, published: set.published });
    assert.ok(!Number.isNaN(Date.parse(v.scanned_at)) && v.scanned_at.endsWith('Z'));
    assert.ok(Number.isInteger(v.latency_ms) && v.latency_ms >= 0);
    assert.ok(!('vendor_ref' in v));
  }
  assert.deepEqual([vb.result, vb.findings], ['clean', []]);
  assert.deepEqual([vc.result, vc.reason, vc.findings], ['not_scanned', 'NOT_FOUND', []]);
  assert.equal(va.result, 'found'); assert.ok(va.findings.length >= 1 && va.findings.every((f) => typeof f === 'string' && f));
});

test('R3 archives are scanned inside; a file past ClamAV\'s own limits is unknown with LIMIT:<name>, never clean', { skip }, async () => {
  const { bucket, deps } = await scanning();
  mirrorTestSet(bucket);
  const nested = putCapture(bucket, makeZip([{ name: 'a/inner.zip', data: makeZip([{ name: 'x.com', data: EICAR }]) }]));
  const { body } = await call(deps, { store: 'bio', targets: [nested] });
  assert.equal(body.verdicts[0].result, 'found');
  // The parser's reading of clamscan's own limit alerts (the image runs with --alert-exceeds-max).
  const v = parseScan('/j/0: Heuristics.Limits.Exceeded.MaxFileSize FOUND\n/j/0: Virus(es) detected ERROR\n/j/1: OK\n/j/2: Heuristics.Limits.Exceeded.MaxRecursion FOUND\n/j/2: Eicar-Test-Signature FOUND\n',
    [['0', '/j/0'], ['1', '/j/1'], ['2', '/j/2'], ['3', '/j/3']]);
  assert.deepEqual(v, { 0: { result: 'unknown', findings: [], detail: 'LIMIT:MaxFileSize' }, 1: { result: 'clean', findings: [] },
    2: { result: 'found', findings: ['Eicar-Test-Signature'] }, 3: { result: 'unknown', findings: [], detail: 'CLAMAV_ERROR' } });
});

test('R4 only the mirrored set is used: none is SIGNATURES_ABSENT, one past SIGNATURES_MAX_AGE_MS is SIGNATURES_STALE; the set loads once', { skip }, async () => {
  const { bucket, deps, image } = await scanning();
  const t = putCapture(bucket, EICAR);
  let r = await call(deps, { store: 'bio', targets: [t, t] });
  assert.deepEqual(r.body.verdicts.map((v) => [v.result, v.reason, v.signatures]), Array(2).fill(['not_scanned', 'SIGNATURES_ABSENT', null]));
  mirrorTestSet(bucket, { published: new Date(NOW - SIGNATURES_MAX_AGE_MS - 1).toISOString(), set: 'rstale' });
  r = await call(deps, { store: 'bio', targets: [t] });
  assert.deepEqual([r.body.verdicts[0].result, r.body.verdicts[0].reason], ['not_scanned', 'SIGNATURES_STALE']);
  mirrorTestSet(bucket, { set: 'rfresh1' });
  bucket.calls.length = 0;
  r = await call(deps, { store: 'bio', targets: [t, t, t] });
  assert.deepEqual(r.body.verdicts.map((v) => v.result), ['found', 'found', 'found']);
  assert.equal(bucket.calls.filter(([op, k]) => op === 'get' && k.startsWith('clamav/sets/')).length, 1, 'the set read once for the request');
  assert.deepEqual(readdirSync(image.sigs), ['rfresh1'], 'the image holds the mirrored set alone');
  bucket.calls.length = 0;
  r = await call(deps, { store: 'bio', targets: [t] });
  assert.equal(bucket.calls.filter(([op, k]) => op === 'get' && k.startsWith('clamav/sets/')).length, 0, 'a held set is not sent again');
});

test('R14 each request scans a fresh copy, removed when it ends; the same bytes and set give the same verdict', { skip }, async () => {
  const { bucket, deps } = await scanning();
  mirrorTestSet(bucket, { set: 'rsame' });
  const dir = process.env.TMPDIR;
  const t = [putCapture(bucket, EICAR), putCapture(bucket, enc('quiet'))];
  const strip = (b) => b.verdicts.map(({ scanned_at, latency_ms, ...v }) => v);
  const one = strip((await call(deps, { store: 'bio', targets: t })).body);
  const two = strip((await call(deps, { store: 'bio', targets: t })).body);
  assert.deepEqual(one, two);
  assert.deepEqual(readdirSync(dir).filter((n) => n.startsWith('job-')), [], 'no job directory outlives its request');
});

test('R17 offline: EICAR found; a clean corpus PDF, a .docm and a ZIP holding EICAR give clean, clean, found', { skip }, async () => {
  const { bucket, deps } = await scanning();
  mirrorTestSet(bucket, { set: 'rcorpus' });
  const targets = [EICAR, cleanPdf(), docm(), makeZip([{ name: 'eicar.com', data: EICAR }])].map((b) => putCapture(bucket, b));
  const { body } = await call(deps, { store: 'scratch', targets: targets.map((t) => ({ ...t })) });
  // scratch holds nothing: the same bytes stored under scratch are the test's second store
  assert.deepEqual(body.verdicts.map((v) => v.reason), Array(4).fill('NOT_FOUND'), 'each store reads only its own captures');
  const r = await call(deps, { store: 'bio', targets });
  assert.deepEqual(r.body.verdicts.map((v) => v.result), ['found', 'clean', 'clean', 'found']);
});
