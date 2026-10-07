// The signature mirror (R6) and GET /version (R8): the official database host stubbed, each file's digital signature
// checked by the image's own sigtool (a fake set is refused) or, for a set that verifies, by a stand-in for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/handler.mjs';
import { BOUNDS } from '../src/limits.mjs';
import { PROVIDERS, REFUSED_PROVIDERS, HELD_PROVIDERS } from '../src/providers/catalogue.mjs';
import { memoryBucket, scannerImage, depsWith, post, enc, json, recordingNet, NOW, toolsPresent } from './helpers.mjs';

const HOST = 'database.clamav.net';
const BUILD = { 'main.cvd': ['62', '16 Sep 2021 08:32 -0400'], 'daily.cvd': ['27788', '06 Oct 2026 04:21 -0400'], 'bytecode.cvd': ['336', '15 Jun 2025 09:00 -0400'] };

/** The vendor: each file's bytes with a Last-Modified; If-Modified-Since at or after it answers 304. */
function vendor(files, { status } = {}) {
  return recordingNet({ [HOST]: (rec) => {
    if (status) return new Response('refused', { status });
    const name = rec.path.slice(1);
    const f = files[name];
    if (!f) return new Response('no', { status: 404 });
    if (rec.headers['if-modified-since'] && Date.parse(rec.headers['if-modified-since']) >= Date.parse(f.modified)) return new Response(null, { status: 304 });
    return new Response(f.bytes, { status: 200, headers: { 'last-modified': f.modified, 'content-length': String(f.bytes.length) } });
  } });
}
/** A stand-in for the image's verification that reads each file's own first line as what sigtool would state. */
function verifyingImage() {
  const got = new Map();
  return async (path, init = {}) => {
    const p = path.split('/').filter(Boolean);
    if (p[0] === 'verify' && init.method === 'PUT') { got.set(p[2], new TextDecoder().decode(await new Response(init.body).arrayBuffer())); return json({ ok: true }); }
    if (p[0] === 'verify' && init.method === 'POST') {
      const files = {};
      for (const [n, text] of got) {
        const [ok, version, build] = text.split('|');
        files[n] = { verified: ok === 'signed', version, build_time: build, sigs: '10' };
      }
      got.clear();
      return json({ ok: true, files });
    }
    return new Response('{}', { status: 404 });
  };
}
const fileOf = (name, modified, signed = true) => ({ modified, bytes: enc(`${signed ? 'signed' : 'forged'}|${BUILD[name][0]}|${BUILD[name][1]}`) });
const mirrorRun = async (deps) => { const r = await handle(post('/mirror', {}), deps); return r.json(); };
const version = async (deps) => (await handle(new Request('https://file-scanner/version'), deps)).json();

test('R6 a run fetches the three databases from the official host, verifies each, and only then makes the set current', async () => {
  const bucket = memoryBucket();
  const files = Object.fromEntries(Object.keys(BUILD).map((n) => [n, fileOf(n, 'Tue, 06 Oct 2026 08:00:00 GMT')]));
  const net = vendor(files);
  const deps = depsWith({ bucket, fetch: net.fetch, scanner: verifyingImage() });
  const a = await mirrorRun(deps);
  assert.deepEqual(a, { ok: true, versions: { main: 62, daily: 27788, bytecode: 336, published: '2026-10-06T08:21:00.000Z' }, published: '2026-10-06T08:21:00.000Z' });
  assert.deepEqual(net.seen.map((r) => [r.host, r.path]), Object.keys(BUILD).map((n) => [HOST, `/${n}`]));
  assert.ok(net.seen.every((r) => r.headers['user-agent'].startsWith('file-scanner/')), 'it names itself, as cvdupdate asks');
  const current = JSON.parse(new TextDecoder().decode(bucket.objects.get('clamav/current.json')));
  assert.deepEqual(Object.keys(current.files), Object.keys(BUILD));
  for (const f of Object.values(current.files)) assert.ok(bucket.objects.has(f.key) && f.key.startsWith('clamav/sets/'));
  // The next day: only daily changed; If-Modified-Since keeps the others, and the replaced daily is deleted.
  const oldDaily = current.files['daily.cvd'].key;
  files['daily.cvd'] = { modified: 'Wed, 07 Oct 2026 08:00:00 GMT', bytes: enc('signed|27789|07 Oct 2026 04:21 -0400') };
  const b = await mirrorRun({ ...deps, now: () => NOW + 1000 });
  assert.equal(b.versions.daily, 27789);
  assert.equal(net.seen.slice(3).filter((r) => r.headers['if-modified-since']).length, 3);
  const next = JSON.parse(new TextDecoder().decode(bucket.objects.get('clamav/current.json')));
  assert.equal(next.files['main.cvd'].key, current.files['main.cvd'].key, 'an unchanged file is kept, not fetched again');
  assert.ok(!bucket.objects.has(oldDaily), 'the replaced file is removed');
  assert.ok(bucket.calls.filter(([op]) => op === 'put' || op === 'delete').every(([, k]) => k.startsWith('clamav/')), 'R11 writes only under clamav/');
});

test('R6 a file whose digital signature does not verify (the image\'s own sigtool) fails the run and leaves the last good set', { skip: !toolsPresent && 'sigtool is not installed' }, async () => {
  const bucket = memoryBucket();
  const good = Object.fromEntries(Object.keys(BUILD).map((n) => [n, fileOf(n, 'Tue, 06 Oct 2026 08:00:00 GMT')]));
  await mirrorRun(depsWith({ bucket, fetch: vendor(good).fetch, scanner: verifyingImage() }));
  const before = new TextDecoder().decode(bucket.objects.get('clamav/current.json'));
  const image = await scannerImage();
  const forged = { ...good, 'daily.cvd': { modified: 'Wed, 07 Oct 2026 08:00:00 GMT', bytes: enc('ClamAV-VDB:forged, not a signed database') } };
  const r = await mirrorRun(depsWith({ bucket, fetch: vendor(forged).fetch, scanner: image.fetch, now: () => NOW + 5000 }));
  assert.deepEqual([r.ok, r.error, r.versions.daily], [false, 'SIGNATURE_INVALID:daily.cvd', 27788]);
  assert.equal(new TextDecoder().decode(bucket.objects.get('clamav/current.json')), before, 'the last good set stays current');
  assert.ok(![...bucket.objects.keys()].some((k) => k.includes('/sets/') && !before.includes(k)), 'the refused file was not kept');
  const v = await version(depsWith({ bucket }));
  assert.equal(v.signatures.last_error, 'SIGNATURE_INVALID:daily.cvd');
  assert.equal(v.signatures.versions.daily, 27788);
});

test('R6 a refused or unreachable host fails the run, stated in /version (R8); POST /mirror without a bucket is refused', async () => {
  const bucket = memoryBucket();
  const r = await mirrorRun(depsWith({ bucket, fetch: vendor({}, { status: 403 }).fetch }));
  assert.deepEqual(r, { ok: false, versions: null, published: null, error: 'REFUSED:main.cvd:403' });
  const u = await mirrorRun(depsWith({ bucket, fetch: async () => { throw new TypeError('down'); }, now: () => NOW + 1 }));
  assert.equal(u.error, 'UNREACHABLE:main.cvd');
  const v = await version(depsWith({ bucket, now: () => NOW + 1 }));
  assert.deepEqual(v.signatures, { versions: null, published: null, mirrored_at: null, last_attempt: new Date(NOW + 1).toISOString(), last_error: 'UNREACHABLE:main.cvd' });
  const n = await handle(post('/mirror', {}), depsWith({ bucket: null }));
  assert.deepEqual([n.status, await n.json()], [503, { ok: false, code: 'R2_NOT_CONFIGURED' }]);
});

test('R8 GET /version: name, version, ClamAV\'s and the renderer\'s versions, the mirror, the catalogue, the lists, the bounds; no credential', async () => {
  const bucket = memoryBucket();
  const files = Object.fromEntries(Object.keys(BUILD).map((n) => [n, fileOf(n, 'Tue, 06 Oct 2026 08:00:00 GMT')]));
  await mirrorRun(depsWith({ bucket, fetch: vendor(files).fetch, scanner: verifyingImage() }));
  bucket.objects.set('reputation/gwr-1/state.json', enc(JSON.stringify({ lists: {}, list_version: 'abc', fetched_at: '2026-10-07T00:00:00.000Z', last_error: null })));
  const v = await version(depsWith({ bucket }));
  assert.deepEqual(Object.keys(v), ['ok', 'name', 'version', 'clamav_version', 'signatures', 'providers', 'reputation_lists', 'renderer_version', 'bounds']);
  assert.deepEqual([v.ok, v.name, v.version], [true, 'file-scanner', '0.79.0']);
  assert.match(v.clamav_version, /^\d+\.\d+\.\d+/);
  assert.match(v.renderer_version, /^libreoffice \S+; poppler-utils \S+$/);
  assert.deepEqual(v.signatures.versions, { main: 62, daily: 27788, bytecode: 336, published: '2026-10-06T08:21:00.000Z' });
  assert.equal(v.signatures.mirrored_at, new Date(NOW).toISOString());
  assert.equal(v.signatures.last_error, null);
  assert.deepEqual(v.providers, { catalogue_read_on: '2026-10-07', offered: PROVIDERS.map((d) => d.provider_id),
    refused: REFUSED_PROVIDERS.map((d) => d.provider_id), held: HELD_PROVIDERS.map((d) => d.provider_id) });
  assert.deepEqual(v.reputation_lists, [{ tool_id: 'gwr-1', list_version: 'abc', fetched_at: '2026-10-07T00:00:00.000Z', last_error: null }]);
  assert.deepEqual(v.bounds, JSON.parse(JSON.stringify(BOUNDS)));
  assert.ok(!/secret|token|password/i.test(JSON.stringify(v.signatures) + JSON.stringify(v.reputation_lists)));
});
