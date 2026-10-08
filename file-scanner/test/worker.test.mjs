// The fleet member as deployed (R10): the committed bundle loaded under Node, its marker and configuration; the
// surface's edge (R9); the stores and limits (R15, R16); storage writes (R11) and egress (R12) as the sources state
// them; no place named (R18).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadWorker } from './stubs/runtime.mjs';
import { dialled } from './stubs/cloudflare-sockets.mjs';
import { handle } from '../src/handler.mjs';
import * as limits from '../src/limits.mjs';
import { writeObject, deleteObject } from '../src/store.mjs';
import { PROVIDERS } from '../src/providers/catalogue.mjs';
import { parseJsonc } from '../../bio-plane/scripts/jsonc.mjs';
import { discoverMembers, containerParts, classPackages, containerClasses } from '../../bio-plane/scripts/fleet-bundle.mjs';
import { memoryBucket, depsWith, post, NOW } from './helpers.mjs';

const here = (p) => new URL(`../${p}`, import.meta.url);
const text = (p) => readFileSync(here(p), 'utf8');
const marker = () => JSON.parse(text('fleet-member.json'));
const wrangler = () => parseJsonc(text('wrangler.jsonc'), 'wrangler.jsonc');
const pkg = JSON.parse(text('package.json'));
const sources = (dir) => readdirSync(here(dir), { recursive: true }).filter((f) => f.endsWith('.mjs')).map((f) => [`${dir}/${f}`, text(`${dir}/${f}`)]);

test('R9 any other method or path is refused 404 UNKNOWN', async () => {
  const deps = depsWith();
  for (const [method, path] of [['GET', '/'], ['GET', '/scan'], ['POST', '/version'], ['DELETE', '/mirror'], ['PUT', '/render'], ['GET', '/provider/scan'],
    ['POST', '/provider'], ['POST', '/providers'], ['POST', '/scan/extra'], ['POST', '/__proto__'], ['POST', '/constructor']]) {
    const r = await handle(new Request(`https://file-scanner${path}`, { method }), deps);
    assert.deepEqual([r.status, await r.json()], [404, { ok: false, code: 'UNKNOWN' }], `${method} ${path}`);
  }
});

test('R10 the bundle exports the Worker and its two container classes, each with no internet', async () => {
  const mod = await loadWorker();
  assert.deepEqual(Object.keys(mod).sort(), ['ContainerProxy', 'FileScanner', 'SafeViewRenderer', 'default']);
  assert.deepEqual(Object.keys(mod.default).sort(), ['fetch', 'limits', 'scheduled']);
  const ctx = { storage: { kv: { get() {}, put() {} }, sql: { exec: () => [] }, get: async () => undefined, put: async () => {}, setAlarm: async () => {}, getAlarm: async () => null, deleteAlarm: async () => {}, sync: async () => {} },
    blockConcurrencyWhile: async (f) => f(), container: { running: false, start() {}, monitor: () => new Promise(() => {}), getTcpPort: () => ({ fetch: async () => new Response('') }) },
    id: { toString: () => 'x' }, waitUntil() {}, exports: {} };
  for (const name of ['FileScanner', 'SafeViewRenderer']) {
    const c = new mod[name](ctx, {});
    assert.equal(c.enableInternet, false, `${name} has no internet (R12)`);
    assert.ok(!c.allowedHosts || c.allowedHosts.length === 0, `${name} allows no host`);
    assert.equal(c.defaultPort, 8080);
  }
});

test('R10 through the binding: the bundle answers R8 and R9 from its env, and its scheduled trigger runs the mirror against ClamAV\'s host alone', async () => {
  const mod = await loadWorker();
  const bucket = memoryBucket();
  const env = { CAPTURES: bucket, VERSION: pkg.version };
  const v = await (await mod.default.fetch(new Request('https://file-scanner/version'), env)).json();
  assert.deepEqual([v.ok, v.name, v.version], [true, 'file-scanner', pkg.version]);
  const u = await mod.default.fetch(new Request('https://file-scanner/nothing'), env);
  assert.equal(u.status, 404);
  const hosts = [];
  const saved = globalThis.fetch;
  globalThis.fetch = async (req) => { hosts.push(new URL(req.url ?? req).hostname); return new Response('no', { status: 503 }); };
  const waits = [];
  try {
    mod.default.scheduled({ cron: '17 4 * * *', scheduledTime: NOW }, env, { waitUntil: (p) => waits.push(p) });
    const r = await waits[0];
    assert.equal(r.ok, false);
  } finally { globalThis.fetch = saved; }
  assert.deepEqual([...new Set(hosts)], ['database.clamav.net']);
  assert.ok(bucket.calls.filter(([op]) => op === 'put').every(([, k]) => k.startsWith('clamav/')));
  assert.deepEqual(dialled, []);
});

test('R10 the marker states a container member with two digest-pinned classes, its bundle, its binding and its trigger, as bundler reads it', () => {
  const m = marker();
  assert.equal(m.kind, 'container');
  assert.deepEqual(m.containers.map((c) => c.class_name), ['FileScanner', 'SafeViewRenderer']);
  for (const c of m.containers) {
    assert.match(c.image.repository, /^[a-z0-9.-]+\/[a-z0-9._/-]+$/);
    assert.ok(c.image.digest === null || /^sha256:[0-9a-f]{64}$/.test(c.image.digest), 'digest-pinned once published');
    assert.match(c.image.base.digest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(c.instance_type, 'standard-1');
    assert.ok(Number.isInteger(c.max_instances) && c.max_instances > 0);
    const docker = text(c.build.dockerfile);
    assert.ok(docker.includes(`FROM node:22-bookworm-slim@${c.image.base.digest}\n`), 'the Dockerfile\'s base is the marker\'s, by digest');
    const st = JSON.parse(text(c.image.packages));
    assert.equal(st.base.digest, c.image.base.digest);
    for (const p of st.packages) assert.ok(docker.includes(`${p.name}=${p.version}`), `${c.class_name}: ${p.name} pinned in its Dockerfile`);
  }
  assert.equal(m.containers[0].bind[0].binding, 'SCANNER');
  assert.deepEqual(m.callers, [{ member: 'bio-plane', binding: 'FILE_SCANNER', kind: 'service' }]);
  assert.deepEqual(m.triggers.crons, wrangler().triggers.crons);
  assert.equal(m.optional_bindings[0].binding, 'SECURITY_VPC');
  assert.deepEqual(m.egress.containers, []);
  // as bundler reads it: one part per class, each image's Debian packages from its statement
  const member = discoverMembers().find((x) => x.name === 'file-scanner');
  const published = { ...member, marker: { ...member.marker, containers: member.marker.containers.map((c) => ({ ...c, image: { ...c.image, digest: `sha256:${'a'.repeat(64)}` } })) } };
  const parts = containerParts(published, discoverMembers().map((x) => x.name));
  assert.deepEqual(parts.parts.map((p) => p.path), ['container/FileScanner.json', 'container/SafeViewRenderer.json']);
  for (const c of containerClasses(member).classes) assert.equal(classPackages(member, c).ecosystem, 'Debian:12');
});

test('R10 both images are named in a registry Cloudflare Containers pull from, as agent-runner\'s is: Docker Hub, never ghcr.io, in the marker and the configuration alike; digests unpublished until the release', () => {
  const runner = JSON.parse(readFileSync(new URL('../../agent-runner/fleet-member.json', import.meta.url), 'utf8'));
  const registry = (r) => r.split('/').slice(0, 2).join('/');
  assert.equal(registry(runner.image.repository), 'docker.io/civicos', 'agent-runner\'s image is published on Docker Hub');
  const m = marker();
  assert.deepEqual(m.containers.map((c) => c.image.repository), ['docker.io/civicos/file-scanner-scanner', 'docker.io/civicos/file-scanner-renderer']);
  for (const c of m.containers) {
    assert.equal(registry(c.image.repository), registry(runner.image.repository), `${c.class_name}: agent-runner's registry`);
    assert.equal(c.image.digest, null, 'the release cut publishes it (K1898, K1905)');
  }
  assert.deepEqual(wrangler().containers.map((c) => c.image), ['docker.io/civicos/file-scanner-scanner@sha256:UNPUBLISHED',
    'docker.io/civicos/file-scanner-renderer@sha256:UNPUBLISHED']);
  for (const t of [text('fleet-member.json'), text('wrangler.jsonc'), text('Dockerfile.scanner'), text('Dockerfile.renderer')]) assert.ok(!t.includes('ghcr.io'), 'never ghcr.io');
});

test('R10 the configuration: the classes by class_name with the marker\'s images, their bindings, the bucket, the trigger, no VPC binding by default', () => {
  const w = wrangler();
  const m = marker();
  assert.equal(w.name, 'file-scanner');
  assert.equal(w.main, m.bundle.outfile);
  assert.equal(w.vars.VERSION, pkg.version);
  assert.deepEqual(w.containers.map((c) => c.class_name), m.containers.map((c) => c.class_name));
  for (const c of w.containers) {
    const k = m.containers.find((x) => x.class_name === c.class_name);
    assert.equal(c.image, `${k.image.repository}@sha256:UNPUBLISHED`);
    assert.equal(c.instance_type, k.instance_type);
    assert.equal(c.max_instances, k.max_instances);
  }
  assert.deepEqual(w.durable_objects.bindings, [{ name: 'SCANNER', class_name: 'FileScanner' }, { name: 'RENDERER', class_name: 'SafeViewRenderer' }]);
  assert.deepEqual(w.r2_buckets.map((b) => b.binding), ['CAPTURES']);
  assert.ok(!('vpc_services' in w) && !JSON.stringify(w).includes('"SECURITY_VPC"'), 'SECURITY_VPC absent by default');
  assert.equal(w.workers_dev, false);
});

test('R11 the only storage writes are under clamav/ and reputation/: one write and one delete in the sources, both guarded', async () => {
  const calls = [];
  for (const [f, src] of [...sources('src'), ...sources('container')]) {
    for (const m of src.matchAll(/\.(put|delete|copy|rename|createMultipartUpload)\(/g)) calls.push(`${f}:${m[1]}:${src.slice(0, m.index).split('\n').length}`);
  }
  const allowed = calls.filter((c) => c.startsWith('src/store.mjs:put') || c.startsWith('src/store.mjs:delete'));
  assert.equal(allowed.length, 2, `the guarded write and delete: ${calls}`);
  const others = calls.filter((c) => !allowed.includes(c));
  // The container's own `rm`/`rename` work on its temporary copies, never the bucket; any other storage call fails.
  assert.deepEqual(others.filter((c) => !c.startsWith('container/')), [], 'no other storage call in the Worker\'s sources');
  const bucket = memoryBucket();
  for (const key of ['bio/captures/' + 'a'.repeat(64), 'scratch/captures/x', 'clamav/../bio/captures/x', 'other/x', 'reputation/../x']) {
    await assert.rejects(writeObject(bucket, key, 'x'), /never writes/);
    await assert.rejects(deleteObject(bucket, key), /never deletes/);
  }
  assert.deepEqual(bucket.calls, []);
});

test('R12 the sources\' egress: the mirror\'s host alone in the Worker\'s own fetches, the outside tools only through the guarded network', () => {
  const worker = sources('src');
  for (const [f, src] of worker) {
    for (const m of src.matchAll(/\bfetch\(/g)) {
      const line = src.slice(src.lastIndexOf('\n', m.index) + 1, src.indexOf('\n', m.index));
      if (/^\s*(async\s+)?fetch\(/.test(line)) continue; // a handler's definition, not a call
      assert.ok(/deps\.fetch\(`https:\/\/\$\{MIRROR_HOST\}|via\(|\.fetch\(new Request\(`http:\/\/container|fetch: \(req\) => fetch\(req\)|deps\.fetch\(req\)|vpc\.fetch\(req\)|ns\.get/.test(line), `${f}: ${line.trim()}`);
    }
    assert.ok(!/\bconnect\(\s*\{/.test(src) || f === 'src/providers/net.mjs', `${f} opens a socket only through net.mjs`);
  }
  const containers = sources('container').map(([, s]) => s).join('\n');
  assert.ok(!/\bfetch\(|\bconnect\(|node:net|node:https'|node:tls|node:dgram|\brequest\(/.test(containers), 'the images\' servers open no connection');
});

test('R15 the namespace set is exactly ["bio", "scratch"], frozen, with PLANE_OPS empty', async () => {
  assert.deepEqual(limits.NAMESPACES, ['bio', 'scratch']);
  assert.ok(Object.isFrozen(limits.NAMESPACES));
  assert.deepEqual(limits.PLANE_OPS, []);
  assert.ok(Object.isFrozen(limits.PLANE_OPS));
  for (const store of ['bio', 'scratch']) {
    const r = await handle(post('/scan', { store, targets: [{ capture_sha: 'x' }] }), depsWith());
    assert.equal(r.status, 200, store);
  }
});

test('R16 the limits, by name; the bundle states the Worker\'s own limits once, equal to its configuration', async () => {
  assert.deepEqual([limits.SCAN_MAX_BYTES, limits.SCAN_BATCH_MAX, limits.SIGNATURES_MAX_AGE_MS, limits.SAFE_VIEW_DPI, limits.SAFE_VIEW_PAGES_MAX,
    limits.PROVIDER_TIMEOUT_MS, limits.SANDBOX_TIMEOUT_MS, limits.REPUTATION_LIST_MAX_AGE_MS],
  [268_435_456, 200, 259_200_000, 150, 500, 120_000, 3_600_000, 86_400_000]);
  assert.deepEqual(limits.LOG_COUNT_KINDS, ['files_scanned', 'files_found', 'holds_placed', 'holds_released', 'deeper_checks', 'sandbox_submissions',
    'safe_views', 'safe_copies', 'reputation_listed', 'signin', 'credential', 'rate', 'handover', 'through']);
  assert.ok(Object.isFrozen(limits.LOG_COUNT_KINDS));
  assert.ok(limits.SCAN_TIME_MS > 0 && limits.RENDER_TIME_MS > 0, 'the measured time budgets');
  assert.deepEqual(limits.MEMBER_LIMITS, wrangler().limits);
  const stated = `bio-member-limits/1 ${Object.entries(wrangler().limits).sort().map(([k, v]) => `${k}=${v}`).join(' ')}`;
  assert.equal(limits.MEMBER_LIMITS_STATEMENT, stated);
  const bundle = text(marker().bundle.outfile);
  assert.deepEqual([...new Set([...bundle.matchAll(/(["'`])bio-member-limits\/1( [^"'`\\\n]*)\1/g)].map((m) => m[2]))], [stated.slice('bio-member-limits/1'.length)]);
  const mod = await loadWorker();
  assert.equal(mod.default.limits, stated);
  const v = await (await handle(new Request('https://file-scanner/version'), depsWith())).json();
  assert.deepEqual(v.bounds.SCAN_MAX_BYTES, limits.SCAN_MAX_BYTES);
});

// R18's one exemption (as agent-runner's, K1905): the images' registry address is a distribution coordinate, not a
// place the product states.
const PLACE = /oakland|alameda|california|\bbay area\b/i;
test('R18 no place is named in its behaviour, outward text or configuration; the registry address alone is exempt', async () => {
  const m = marker();
  const repos = m.containers.map((c) => c.image.repository);
  const scrub = (s) => repos.reduce((t, r) => t.split(r).join('<repository>'), s);
  const texts = [scrub(JSON.stringify(m)), scrub(text('wrangler.jsonc')), text('package.json'), text('packages-scanner.json'), text('packages-renderer.json'),
    text('Dockerfile.scanner'), text('Dockerfile.renderer'), ...sources('src').map(([, s]) => s), ...sources('container').map(([, s]) => s)];
  const deps = depsWith();
  for (const r of [new Request('https://file-scanner/version'), new Request('https://file-scanner/providers'), post('/scan', {}), post('/render', {}),
    post('/provider/scan', { store: 'bio' }), post('/provider/forward', {}), new Request('https://file-scanner/x')]) {
    texts.push(await (await handle(r, deps)).text());
  }
  assert.deepEqual(texts.filter((t) => PLACE.test(t)).map((t) => t.match(PLACE)[0]), []);
  assert.ok(PROVIDERS.length > 0);
});
