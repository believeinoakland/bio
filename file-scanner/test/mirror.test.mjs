// The signature mirror (R6) and GET /version (R8): the official database host stubbed, each file's digital signature
// checked by the image's own sigtool (a fake set is refused) or, for a set that verifies, by a stand-in for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, scheduled } from '../src/handler.mjs';
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
  assert.deepEqual(v.signatures, { versions: null, published: null, mirrored_at: null, last_attempt: new Date(NOW + 1).toISOString(), last_error: 'UPDATER_UNAVAILABLE', stage: null, stage_at: null });
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
  assert.deepEqual(got, { ok: true, files: ['bytecode.cvd', 'daily.cvd', 'main.cvd'], changed: ['bytecode.cvd', 'daily.cvd', 'main.cvd'] }, 'with nothing handed over, all three are fetched');
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

/** A signature updater double that behaves as `freshclam` does in a directory it is handed: a file already there that
 *  matches the official one is left alone; one there that differs is patched (a diff); one absent is fetched whole.
 *  `whole` lists what was fetched whole, `patched` what was patched. */
function freshclamLike(remote) {
  const dirs = new Map(), whole = [], patched = [], calls = [];
  const fn = async (path, init = {}) => {
    const method = init.method || 'GET';
    calls.push([method, path]);
    const p = path.split('/').filter(Boolean);
    if (p[0] !== 'update') return new Response('{}', { status: 404 });
    if (method === 'PUT' && p.length === 3) {
      if (!dirs.has(p[1])) dirs.set(p[1], new Map());
      dirs.get(p[1]).set(p[2], new Uint8Array(await new Response(init.body).arrayBuffer()));
      return json({ ok: true });
    }
    if (method === 'POST') {
      const dir = dirs.get(p[1]) || new Map();
      dirs.set(p[1], dir);
      const changed = [];
      for (const [name, f] of Object.entries(remote)) {
        const held = dir.get(name);
        if (held && Buffer.compare(Buffer.from(held), Buffer.from(f.bytes)) === 0) continue;
        (held ? patched : whole).push(name);
        changed.push(name);
        dir.set(name, f.bytes);
      }
      return json({ ok: true, files: Object.keys(remote), changed });
    }
    if (method === 'DELETE') { dirs.delete(p[1]); return json({ ok: true }); }
    const f = (dirs.get(p[1]) || new Map()).get(p[2]);
    return f ? new Response(f, { status: 200, headers: { 'content-length': String(f.length) } }) : new Response('no', { status: 404 });
  };
  Object.assign(fn, { calls, whole, patched });
  return fn;
}

test('R6 POST /mirror?async=1 answers 202 at once, before the run ends, and the run\'s outcome lands in /version signatures', async () => {
  const bucket = memoryBucket();
  let release;
  const gate = new Promise((res) => { release = res; });
  const inner = updaterOf(goodFiles());
  const updater = async (path, init) => { await gate; return inner(path, init); };
  const waits = [];
  const deps = depsWith({ bucket, updater, scanner: verifyingImage(), waitUntil: (p) => waits.push(p) });
  const r = await handle(post('/mirror?async=1', {}), deps);
  assert.deepEqual([r.status, await r.json()], [202, { ok: true, started: true }], 'it answers while the updater is still waiting');
  assert.equal(waits.length, 1, 'the run is handed to the platform to finish after the answer');
  assert.equal((await version(deps)).signatures.versions, null, 'nothing has landed yet');
  release();
  await Promise.all(waits);
  const v = (await version(deps)).signatures;
  assert.deepEqual([v.versions.daily, v.last_error], [27788, null], 'the outcome is in /version');
  // The outcome of a refused run lands there too, with its reason (R34).
  const refuse = { ok: false, code: 'MIRROR_REFUSED', detail: 'exit 58: 403 Forbidden' };
  const bad = [];
  const b2 = memoryBucket();
  const d2 = depsWith({ bucket: b2, updater: updaterOf({}, { refuse }), waitUntil: (p) => bad.push(p) });
  assert.equal((await handle(post('/mirror?async=1', {}), d2)).status, 202);
  await Promise.all(bad);
  assert.equal((await version(d2)).signatures.last_error, `MIRROR_REFUSED:${refuse.detail}`);
});

test('R6 control: POST /mirror without async runs inside the request and answers its outcome; async without a bucket is refused as a plain run is', async () => {
  const bucket = memoryBucket();
  const waits = [];
  const deps = depsWith({ bucket, updater: updaterOf(goodFiles()), scanner: verifyingImage(), waitUntil: (p) => waits.push(p) });
  const r = await handle(post('/mirror', {}), deps);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
  assert.equal(waits.length, 0, 'nothing is deferred');
  for (const q of ['/mirror?async=0', '/mirror?async=']) assert.equal((await handle(post(q, {}), deps)).status, 200, `${q} is a plain run`);
  const n = await handle(post('/mirror?async=1', {}), depsWith({ bucket: null, waitUntil: (p) => waits.push(p) }));
  assert.deepEqual([n.status, await n.json(), waits.length], [503, { ok: false, code: 'R2_NOT_CONFIGURED' }, 0]);
});

test('R6 a run begins with the updater\'s directory holding the mirrored set: it fetches only what changed, no database whole; control: with no mirrored set, all three whole', async () => {
  const bucket = memoryBucket();
  const first = freshclamLike(goodFiles());
  const a = await mirrorRun(depsWith({ bucket, updater: first, scanner: verifyingImage() }));
  assert.equal(a.ok, true, a.error);
  assert.deepEqual(first.whole, ['main.cvd', 'daily.cvd', 'bytecode.cvd'], 'control: no set mirrored, the databases are fetched whole');
  assert.deepEqual(first.calls.filter(([m]) => m === 'PUT'), [], 'control: nothing to seed with');
  const oldMain = JSON.parse(new TextDecoder().decode(bucket.objects.get('clamav/current.json'))).files['main.cvd'].key;
  // The next day only daily moved.
  const next = freshclamLike({ ...goodFiles(), 'daily.cvd': { bytes: enc('signed|27789|07 Oct 2026 04:21 -0400') } });
  const b = await mirrorRun(depsWith({ bucket, updater: next, scanner: verifyingImage(), now: () => NOW + 1000 }));
  assert.equal(b.ok, true, b.error);
  assert.deepEqual(next.whole, [], 'no database is fetched whole');
  assert.deepEqual(next.patched, ['daily.cvd'], 'daily is brought up to date');
  assert.deepEqual(next.calls.filter(([m]) => m === 'PUT').map(([, p]) => p.split('/').pop()).sort(), ['bytecode.cvd', 'daily.cvd', 'main.cvd'], 'the whole mirrored set was handed over');
  assert.deepEqual(next.calls.filter(([m]) => m === 'GET').map(([, p]) => p.split('/').pop()), ['daily.cvd'], 'only what changed is brought back');
  assert.equal(b.versions.daily, 27789);
  assert.equal(JSON.parse(new TextDecoder().decode(bucket.objects.get('clamav/current.json'))).files['main.cvd'].key, oldMain, 'an unchanged file keeps its stored copy');
  assert.ok(bucket.objects.has(oldMain), 'and it is not removed');
  // A day on which nothing moved still leaves a complete, current set.
  const same = freshclamLike({ ...goodFiles(), 'daily.cvd': { bytes: enc('signed|27789|07 Oct 2026 04:21 -0400') } });
  const c = await mirrorRun(depsWith({ bucket, updater: same, scanner: verifyingImage(), now: () => NOW + 2000 }));
  assert.deepEqual([c.ok, same.whole, same.patched, c.versions.daily], [true, [], [], 27789]);
  assert.equal((await version(depsWith({ bucket }))).signatures.mirrored_at, new Date(NOW + 2000).toISOString());
});

test('R6 a seeded run that the updater refuses leaves the last good set; a seed the updater cannot take is dropped and the run goes on whole', async () => {
  const bucket = memoryBucket();
  await mirrorRun(depsWith({ bucket, updater: updaterOf(goodFiles()), scanner: verifyingImage() }));
  const before = new TextDecoder().decode(bucket.objects.get('clamav/current.json'));
  const refuse = { ok: false, code: 'MIRROR_REFUSED', detail: 'exit 58: 429 cool-down' };
  const r = await mirrorRun(depsWith({ bucket, updater: updaterOf({}, { refuse }), now: () => NOW + 1 }));
  assert.deepEqual([r.ok, r.error], [false, `MIRROR_REFUSED:${refuse.detail}`]);
  assert.equal(new TextDecoder().decode(bucket.objects.get('clamav/current.json')), before);
  // An updater that does not take the seed (PUT fails): the run falls back to fetching whole.
  const noSeed = freshclamLike(goodFiles());
  const wrapped = async (path, init = {}) => (init.method === 'PUT' ? new Response('no', { status: 500 }) : noSeed(path, init));
  const w = await mirrorRun(depsWith({ bucket, updater: wrapped, scanner: verifyingImage(), now: () => NOW + 2 }));
  assert.equal(w.ok, true, w.error);
  assert.deepEqual(noSeed.whole, ['main.cvd', 'daily.cvd', 'bytecode.cvd']);
});

test('R6 the image\'s updater runs freshclam in a directory holding the files it was handed, and names the files that differ from them', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fc-'));
  // A stand-in for freshclam that finds the handed-over files in its data directory, leaves main and bytecode as they
  // are (current) and brings daily up to date.
  const tool = join(dir, 'freshclam-patching');
  writeFileSync(tool, `#!/bin/sh\nfor a in "$@"; do case "$a" in --datadir=*) d="\${a#--datadir=}";; esac; done\nls "$d" > "${dir}/seen.ls"\nfor f in main daily bytecode; do [ -f "$d/$f.cvd" ] || echo "whole $f" >> "${dir}/whole"; done\necho patched > "$d/daily.cvd"\n[ -f "$d/main.cvd" ] || echo main > "$d/main.cvd"\n[ -f "$d/bytecode.cvd" ] || echo bytecode > "$d/bytecode.cvd"\n`, { mode: 0o755 });
  const image = await scannerImage();
  process.env.FRESHCLAM = tool;
  try {
    for (const f of ['main.cvd', 'daily.cvd', 'bytecode.cvd']) {
      const put = await image.fetch(`/update/s1/${f}`, { method: 'PUT', body: enc(`old ${f}`), duplex: 'half' });
      assert.equal(put.status, 200);
    }
    const got = await (await image.fetch('/update/s1', { method: 'POST' })).json();
    assert.deepEqual(got, { ok: true, files: ['bytecode.cvd', 'daily.cvd', 'main.cvd'], changed: ['daily.cvd'] });
    assert.match(readFileSync(join(dir, 'seen.ls'), 'utf8'), /main\.cvd/, 'the handed-over files were in place when freshclam ran');
    assert.throws(() => readFileSync(join(dir, 'whole')), 'no database was missing, so none was fetched whole');
    const fetched = await image.fetch('/update/s1/daily.cvd');
    assert.equal(new TextDecoder().decode(await fetched.arrayBuffer()).trim(), 'patched');
    assert.equal((await image.fetch('/update/s1/main.cvd', { method: 'GET' })).status, 200, 'an unchanged file can still be read');
    await image.fetch('/update/s1', { method: 'DELETE' });
    // A file name that is not a signature database is not taken.
    assert.notEqual((await image.fetch('/update/s2/passwd', { method: 'PUT', body: enc('x'), duplex: 'half' })).status, 200);
  } finally { delete process.env.FRESHCLAM; }
});

// ── R6 (fix round 4, C84): a run leaves a trace from its start; an open request is finished by the cron

/** The platform's cut: once `cut()` is called, every call the invocation makes to the bucket, the updater or the image
 *  hangs for good, as a cancelled invocation reaches no write (C84: `waitUntil` is cut about 30 s after the response). */
function cutter() {
  let cut = false;
  const hang = () => new Promise(() => {});
  const guard = (fn) => (...a) => (cut ? hang() : fn(...a));
  const wrap = (deps) => {
    const b = deps.bucket;
    const bucket = { ...b, head: guard(b.head), get: guard(b.get), put: guard(b.put), delete: guard(b.delete), list: guard(b.list) };
    return { ...deps, bucket, updater: guard(deps.updater), scanner: guard(deps.scanner) };
  };
  return { wrap, cut: () => { cut = true; } };
}
const settle = () => new Promise((res) => setTimeout(res, 20));
const iso = (t) => new Date(t).toISOString();
const MIN = 60_000;
const at = (bucket, t, over = {}) => depsWith({ bucket, now: () => t, scanner: verifyingImage(), ...over });
const sigs = async (bucket) => (await version(depsWith({ bucket }))).signatures;
const requestOpen = (bucket) => bucket.objects.has('clamav/request.json');

test('R6 C84 the walker\'s row: an async run the platform cuts after the response leaves its start and its stage in /version, and the next cron tick finishes it; a first run fetches whole', async () => {
  const bucket = memoryBucket();
  // The first run has no mirrored set to seed from: the download is the long one, and it outlasts the invocation.
  const stuck = async (path, init = {}) => ((init.method || 'GET') === 'POST' ? new Promise(() => {}) : json({ ok: true }));
  const platform = cutter();
  const waits = [];
  const deps = platform.wrap(at(bucket, NOW, { updater: stuck, waitUntil: (p) => waits.push(p) }));
  const r = await handle(post('/mirror?async=1', {}), deps);
  assert.deepEqual([r.status, await r.json()], [202, { ok: true, started: true }]);
  await settle(); // five seconds of the invocation's life after the response
  platform.cut();
  const during = await sigs(bucket);
  assert.deepEqual([during.last_attempt, during.last_error, during.stage, during.stage_at], [iso(NOW), 'RUN_STARTED', 'download', iso(NOW)], 'the cut run left its start and its stage');
  assert.equal(during.versions, null);
  assert.ok(requestOpen(bucket), 'and the request stays open for the cron');
  // The next tick, ten minutes on, in a new invocation: it finishes the request, fetching the databases whole.
  const remote = freshclamLike(goodFiles());
  const out = await scheduled(at(bucket, NOW + 10 * MIN, { updater: remote }));
  assert.equal(out.ok, true, out.error);
  assert.deepEqual(remote.whole, ['main.cvd', 'daily.cvd', 'bytecode.cvd'], 'a first run with no mirrored set fetches whole');
  const done = await sigs(bucket);
  assert.deepEqual([done.versions.daily, done.last_error, done.stage, done.stage_at, done.last_attempt], [27788, null, null, null, iso(NOW + 10 * MIN)]);
  assert.ok(!requestOpen(bucket), 'the finished request is closed');
});

test('R6 C84 the door itself leaves the trace: cut the moment the 202 is answered, /version already shows the run started and the request is open', async () => {
  const bucket = memoryBucket();
  const platform = cutter();
  const deps = platform.wrap(at(bucket, NOW, { updater: updaterOf(goodFiles()), waitUntil: () => {} }));
  const r = await handle(post('/mirror?async=1', {}), deps);
  platform.cut();
  assert.equal(r.status, 202);
  const s = await sigs(bucket);
  assert.deepEqual([s.last_attempt, s.last_error], [iso(NOW), 'RUN_STARTED']);
  assert.ok(['seed', 'download'].includes(s.stage), `a stage is named (${s.stage})`);
  assert.ok(requestOpen(bucket));
});

test('R6 C84 the tick: a run whose stage is alive is left alone; one stopped for 15 minutes is resumed; with no request and a run within the day it does nothing; a day on it runs once', async () => {
  const bucket = memoryBucket();
  const first = await scheduled(at(bucket, NOW, { updater: freshclamLike(goodFiles()) }));
  assert.equal(first.ok, true, 'control: with nothing mirrored and nothing asked, the tick runs the day\'s mirror');
  const idle = freshclamLike(goodFiles());
  assert.equal((await scheduled(at(bucket, NOW + 10 * MIN, { updater: idle }))).skipped, 'RUN_WITHIN_DAY');
  assert.deepEqual(idle.calls, [], 'a run within the day: nothing is asked of the updater');
  assert.equal((await scheduled(at(bucket, NOW + 24 * 60 * MIN, { updater: freshclamLike(goodFiles()) }))).ok, true, 'a day on, it runs once');
  // A run left started (no request), its stage alive then dead.
  const t0 = NOW + 48 * 60 * MIN;
  bucket.objects.set('clamav/state.json', enc(JSON.stringify({ last_attempt: iso(t0), last_error: 'RUN_STARTED', stage: 'download', stage_at: iso(t0) })));
  const alive = freshclamLike(goodFiles());
  assert.equal((await scheduled(at(bucket, t0 + 14 * MIN, { updater: alive }))).skipped, 'RUN_ALIVE');
  assert.deepEqual(alive.calls, []);
  assert.equal((await scheduled(at(bucket, t0 + 16 * MIN, { updater: freshclamLike(goodFiles()) }))).ok, true, 'stopped for over 15 minutes, it is resumed');
  assert.equal((await sigs(bucket)).last_error, null);
  // An open request: the door\'s own run is left its moment to end; later the tick finishes the request.
  const t1 = t0 + 60 * MIN;
  bucket.objects.set('clamav/request.json', enc(JSON.stringify({ requested_at: iso(t1) })));
  bucket.objects.set('clamav/state.json', enc(JSON.stringify({ last_attempt: iso(t1), last_error: 'RUN_STARTED', stage: 'seed', stage_at: iso(t1) })));
  const young = freshclamLike(goodFiles());
  assert.equal((await scheduled(at(bucket, t1 + 60_000, { updater: young }))).skipped, 'RUN_ALIVE');
  assert.equal((await scheduled(at(bucket, t1 + 5 * MIN, { updater: freshclamLike(goodFiles()) }))).ok, true, 'an open request is finished at the next tick');
  assert.ok(!requestOpen(bucket));
});

test('R6 C84 control: a run that ends in its invocation clears RUN_STARTED and states its outcome as before, a refusal too; the request closes with it', async () => {
  const bucket = memoryBucket();
  const waits = [];
  const refuse = { ok: false, code: 'MIRROR_REFUSED', detail: 'exit 1: ... 403' };
  const deps = at(bucket, NOW, { updater: updaterOf({}, { refuse }), waitUntil: (p) => waits.push(p) });
  assert.equal((await handle(post('/mirror?async=1', {}), deps)).status, 202);
  await Promise.all(waits);
  const s = await sigs(bucket);
  assert.deepEqual([s.last_error, s.stage, s.stage_at, s.last_attempt], [`MIRROR_REFUSED:${refuse.detail}`, null, null, iso(NOW)]);
  assert.ok(!requestOpen(bucket));
  // The stored refusal of an earlier day is overwritten by the first new run (new data only).
  bucket.objects.set('clamav/state.json', enc(JSON.stringify({ last_attempt: iso(NOW - 15 * 60 * MIN), last_error: 'REFUSED:main.cvd:403' })));
  const w2 = [];
  await handle(post('/mirror?async=1', {}), at(bucket, NOW + 1, { updater: updaterOf(goodFiles()), waitUntil: (p) => w2.push(p) }));
  await Promise.all(w2);
  assert.equal((await sigs(bucket)).last_error, null);
});
