// The signature mirror (R6) and GET /version (R8): the official database host stubbed, each file's digital signature
// checked by the image's own sigtool (a fake set is refused) or, for a set that verifies, by a stand-in for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/handler.mjs';
import { BOUNDS } from '../src/limits.mjs';
import { PROVIDERS, REFUSED_PROVIDERS, HELD_PROVIDERS } from '../src/providers/catalogue.mjs';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { memoryBucket, putCapture, scannerImage, depsWith, post, enc, json, NOW, EICAR, toolsPresent } from './helpers.mjs';

const BUILD = { 'main.cvd': ['62', '16 Sep 2021 08:32 -0400'], 'daily.cvd': ['27788', '06 Oct 2026 04:21 -0400'], 'bytecode.cvd': ['336', '15 Jun 2025 09:00 -0400'] };

/** The signature updater (the image's `freshclam` in its own instance): `files` fetched on POST /update/<run>, served on
 *  GET, removed on DELETE; `refuse` is what it answers when the official host refuses it. Every call is recorded. */
export function updaterOf(files, { refuse } = {}) {
  const calls = [];
  const fn = async (path, init = {}) => {
    const method = init.method || 'GET';
    calls.push([method, path]);
    const p = path.split('/').filter(Boolean);
    if (p[0] !== 'update') return new Response('{}', { status: 404 });
    if (method === 'POST') return json(refuse || { ok: true, files: Object.keys(files) });
    if (method === 'DELETE') return json({ ok: true });
    const f = files[p[2]];
    return f ? new Response(f.bytes, { status: 200, headers: { 'content-length': String(f.bytes.length) } }) : new Response('no', { status: 404 });
  };
  fn.calls = calls;
  return fn;
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
const fileOf = (name, signed = true) => ({ bytes: enc(`${signed ? 'signed' : 'forged'}|${BUILD[name][0]}|${BUILD[name][1]}`) });
const goodFiles = () => Object.fromEntries(Object.keys(BUILD).map((n) => [n, fileOf(n)]));
const noNet = () => { const seen = []; return { seen, fetch: async (r) => { seen.push(r); throw new Error('the Worker opens no connection'); } }; };
const mirrorRun = async (deps) => { const r = await handle(post('/mirror', {}), deps); return r.json(); };
const version = async (deps) => (await handle(new Request('https://file-scanner/version'), deps)).json();

test('R6 a run has the official updater fetch the three databases, verifies each, and only then makes the set current', async () => {
  const bucket = memoryBucket();
  const net = noNet();
  const updater = updaterOf(goodFiles());
  const deps = depsWith({ bucket, fetch: net.fetch, updater, scanner: verifyingImage() });
  const a = await mirrorRun(deps);
  assert.deepEqual(a, { ok: true, versions: { main: 62, daily: 27788, bytecode: 336, published: '2026-10-06T08:21:00.000Z' }, published: '2026-10-06T08:21:00.000Z' });
  assert.deepEqual(net.seen, [], 'the Worker itself reaches no host');
  assert.deepEqual(updater.calls.map(([m]) => m), ['POST', 'GET', 'GET', 'GET', 'DELETE'], 'its working directory is removed after the run');
  const current = JSON.parse(new TextDecoder().decode(bucket.objects.get('clamav/current.json')));
  assert.deepEqual(Object.keys(current.files), Object.keys(BUILD));
  for (const f of Object.values(current.files)) assert.ok(bucket.objects.has(f.key) && f.key.startsWith('clamav/sets/'));
  // The next day: a new set replaces the last good one, whose files are removed.
  const oldDaily = current.files['daily.cvd'].key;
  const next = { ...goodFiles(), 'daily.cvd': { bytes: enc('signed|27789|07 Oct 2026 04:21 -0400') } };
  const b = await mirrorRun({ ...deps, updater: updaterOf(next), now: () => NOW + 1000 });
  assert.equal(b.versions.daily, 27789);
  assert.ok(!bucket.objects.has(oldDaily), 'the replaced file is removed');
  assert.ok(bucket.calls.filter(([op]) => op === 'put' || op === 'delete').every(([, k]) => k.startsWith('clamav/')), 'R11 writes only under clamav/');
});

test('R6 a file whose digital signature does not verify (the image\'s own sigtool) fails the run and leaves the last good set', { skip: !toolsPresent && 'sigtool is not installed' }, async () => {
  const bucket = memoryBucket();
  await mirrorRun(depsWith({ bucket, updater: updaterOf(goodFiles()), scanner: verifyingImage() }));
  const before = new TextDecoder().decode(bucket.objects.get('clamav/current.json'));
  const image = await scannerImage();
  const forged = Object.fromEntries(Object.keys(BUILD).map((n) => [n, { bytes: enc('ClamAV-VDB:forged, not a signed database') }]));
  const r = await mirrorRun(depsWith({ bucket, updater: updaterOf(forged), scanner: image.fetch, now: () => NOW + 5000 }));
  assert.deepEqual([r.ok, r.error, r.versions.daily], [false, 'SIGNATURE_INVALID:main.cvd', 27788]);
  assert.equal(new TextDecoder().decode(bucket.objects.get('clamav/current.json')), before, 'the last good set stays current');
  assert.ok(![...bucket.objects.keys()].some((k) => k.includes('/sets/') && !before.includes(k)), 'the refused file was not kept');
  const v = await version(depsWith({ bucket }));
  assert.equal(v.signatures.last_error, 'SIGNATURE_INVALID:main.cvd');
  assert.equal(v.signatures.versions.daily, 27788);
});

test('R6 a refused or unreachable updater fails the run, stated in /version (R8); POST /mirror without a bucket is refused', async () => {
  const bucket = memoryBucket();
  const refuse = { ok: false, code: 'MIRROR_REFUSED', detail: 'exit 58: ERROR: Failed to download: 403 Forbidden' };
  const r = await mirrorRun(depsWith({ bucket, updater: updaterOf({}, { refuse }) }));
  assert.deepEqual(r, { ok: false, versions: null, published: null, error: `MIRROR_REFUSED:${refuse.detail}` });
  const u = await mirrorRun(depsWith({ bucket, updater: async () => { throw new TypeError('down'); }, now: () => NOW + 1 }));
  assert.equal(u.error, 'UPDATER_UNAVAILABLE');
  const v = await version(depsWith({ bucket, now: () => NOW + 1 }));
  assert.deepEqual(v.signatures, { versions: null, published: null, mirrored_at: null, last_attempt: new Date(NOW + 1).toISOString(), last_error: 'UPDATER_UNAVAILABLE' });
  const n = await handle(post('/mirror', {}), depsWith({ bucket: null }));
  assert.deepEqual([n.status, await n.json()], [503, { ok: false, code: 'R2_NOT_CONFIGURED' }]);
});

test('R34 a mirror that refuses is reported with its reason, never as a scan result: the scanner says it has no signatures', async () => {
  const bucket = memoryBucket();
  const target = putCapture(bucket, EICAR);
  const reason = 'exit 58: ERROR: Failed to download: 403 Forbidden';
  const m = await mirrorRun(depsWith({ bucket, updater: updaterOf({}, { refuse: { ok: false, code: 'MIRROR_REFUSED', detail: reason } }) }));
  assert.deepEqual([m.ok, m.error], [false, `MIRROR_REFUSED:${reason}`]);
  assert.equal((await version(depsWith({ bucket }))).signatures.last_error, `MIRROR_REFUSED:${reason}`);
  const s = await (await handle(post('/scan', { store: 'bio', targets: [target] }), depsWith({ bucket }))).json();
  assert.deepEqual(s.verdicts.map((v) => [v.result, v.reason]), [['not_scanned', 'SIGNATURES_ABSENT']], 'the refusal is not a verdict');
  assert.equal(s.verdicts[0].signatures, null);
});

test('R34 a set obtained by the official path is loaded and used: the fixture file it matches is infected, a clean one clean; with no set, not_scanned', { skip: !toolsPresent && 'clamscan is not installed' }, async () => {
  const bucket = memoryBucket();
  const hdb = enc(`${createHash('md5').update(EICAR).digest('hex')}:${EICAR.length}:Eicar-Test-Signature\n`);
  const targets = [putCapture(bucket, EICAR), putCapture(bucket, enc('an ordinary, harmless note'))];
  const image = await scannerImage();
  // The image's verification stands in for sigtool's check of ClamAV's own signing, which no fixture can carry.
  const scanner = async (path, init = {}) => {
    if (path.startsWith('/verify/') && init.method === 'PUT') { await new Response(init.body).arrayBuffer(); return json({ ok: true }); }
    if (path.startsWith('/verify/')) return json({ ok: true, files: { 'main.hdb': { verified: true, version: '62', build_time: '07 Oct 2026 11:00 +0000', sigs: '1' } } });
    return image.fetch(path, init);
  };
  const control = await (await handle(post('/scan', { store: 'bio', targets }), depsWith({ bucket, scanner }))).json();
  assert.deepEqual(control.verdicts.map((v) => v.result), ['not_scanned', 'not_scanned'], 'control: no set, nothing is scanned');
  const m = await mirrorRun(depsWith({ bucket, scanner, updater: updaterOf({ 'main.hdb': { bytes: hdb } }), now: () => NOW - 60_000 }));
  assert.equal(m.ok, true, m.error);
  const s = await (await handle(post('/scan', { store: 'bio', targets }), depsWith({ bucket, scanner }))).json();
  assert.deepEqual(s.verdicts.map((v) => [v.result, v.findings]), [['found', ['Eicar-Test-Signature.UNOFFICIAL']], ['clean', []]]);
});

test('R8 GET /version: name, version, ClamAV\'s and the renderer\'s versions, the mirror, the catalogue, the lists, the bounds; no credential', async () => {
  const bucket = memoryBucket();
  const files = goodFiles();
  await mirrorRun(depsWith({ bucket, updater: updaterOf(files), scanner: verifyingImage() }));
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

test('R34 the image\'s updater runs ClamAV\'s own freshclam for the official host alone, under its own identity; a refusal keeps its reason', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fc-'));
  const ok = join(dir, 'freshclam-ok'), bad = join(dir, 'freshclam-refused');
  // Stand-ins for freshclam: the first records its arguments and its configuration and writes the three databases.
  writeFileSync(ok, `#!/bin/sh\nfor a in "$@"; do case "$a" in --config-file=*) cp "\${a#--config-file=}" "${dir}/seen.conf";; --datadir=*) d="\${a#--datadir=}";; esac; done\necho "$@" > "${dir}/seen.args"\nfor f in main daily bytecode; do echo "$f" > "$d/$f.cvd"; done\n`, { mode: 0o755 });
  writeFileSync(bad, '#!/bin/sh\necho "ERROR: Failed to download from database.clamav.net: 403 Forbidden" >&2\nexit 58\n', { mode: 0o755 });
  const image = await scannerImage();
  const run = async (tool, name) => {
    process.env.FRESHCLAM = tool;
    try { return await (await image.fetch(`/update/${name}`, { method: 'POST' })).json(); } finally { delete process.env.FRESHCLAM; }
  };
  const got = await run(ok, 'u1');
  assert.deepEqual(got, { ok: true, files: ['bytecode.cvd', 'daily.cvd', 'main.cvd'] });
  const conf = readFileSync(join(dir, 'seen.conf'), 'utf8');
  assert.deepEqual(conf.match(/^DatabaseMirror .*$/gm), ['DatabaseMirror database.clamav.net'], 'the official host alone');
  assert.ok(!/HTTPUserAgent|user-agent|cvdupdate/i.test(conf), 'freshclam states its own identity: none is set');
  for (const f of got.files) {
    const r = await image.fetch(`/update/u1/${f}`);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-length'), String((await r.arrayBuffer()).byteLength));
  }
  await image.fetch('/update/u1', { method: 'DELETE' });
  assert.equal((await image.fetch('/update/u1/main.cvd')).status, 404, 'the run\'s directory is removed');
  const refused = await run(bad, 'u2');
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'MIRROR_REFUSED');
  assert.match(refused.detail, /^exit 58: .*403 Forbidden/);
  assert.equal((await image.fetch('/update/u2/main.cvd')).status, 404, 'a refused run keeps nothing');
});
