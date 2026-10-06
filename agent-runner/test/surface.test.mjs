import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { stubSdk, success, request, startRunner, conversation } from './helpers.mjs';
import { imageReference, readManifest } from '../src/manifest.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const PLACE = /oakland|alameda|california|\bbay area\b/i;

// A raw HTTP exchange, so upgrade requests to other paths can be checked as well.
const raw = (base, text) => new Promise((resolve, reject) => {
  const [host, port] = base.split(':');
  const s = net.connect(Number(port), host, () => s.write(text));
  let out = '';
  s.on('data', (d) => { out += d; });
  s.on('end', () => resolve(out));
  s.on('error', reject);
});

test('R5 GET /version answers 200 with the name and the version the image was built with', async () => {
  const { sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  try {
    const res = await fetch(`http://${r.base}/version`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, name: 'agent-runner', version: pkg.version });
  } finally { await r.stop(); }
});

test('R6 any other path or method answers 404 UNKNOWN', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  try {
    for (const [method, path] of [['GET', '/'], ['POST', '/version'], ['GET', '/conversation'], ['POST', '/conversation'],
      ['GET', '/version/x'], ['DELETE', '/x'], ['PUT', '/conversation']]) {
      const res = await fetch(`http://${r.base}${path}`, { method });
      assert.equal(res.status, 404, `${method} ${path}`);
      assert.deepEqual(await res.json(), { ok: false, code: 'UNKNOWN' });
    }
    const up = (path) => `GET ${path} HTTP/1.1\r\nHost: x\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n`
      + 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n';
    for (const path of ['/version', '/', '/conversations']) {
      const out = await raw(r.base, up(path));
      assert.match(out, /^HTTP\/1\.1 404 /);
      assert.ok(out.endsWith('{"ok":false,"code":"UNKNOWN"}'));
    }
    assert.equal(calls.length, 0);
  } finally { await r.stop(); }
});

test('R7 the fleet manifest names one digest-pinned image, its surface and its build recipe', () => {
  const m = readManifest();
  assert.equal(m.name, 'agent-runner');
  assert.equal(m.kind, 'container');
  assert.deepEqual(Object.keys(m.surface), ['GET /version', 'GET /conversation (WebSocket upgrade)', 'anything else']);
  assert.equal(m.build.dockerfile, 'Dockerfile');
  const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
  assert.match(dockerfile, /npm ci/);
  assert.match(dockerfile, /CMD \["node", "src\/entry\.mjs"\]/);
  assert.match(dockerfile, new RegExp(`EXPOSE ${m.image.port}`));
  // the SDK pinned to one version, and the lock holds it
  const dep = pkg.dependencies['@anthropic-ai/claude-agent-sdk'];
  assert.match(dep, /^\d+\.\d+\.\d+$/);
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  assert.equal(lock.packages['node_modules/@anthropic-ai/claude-agent-sdk'].version, dep);
  // an install names exactly one image: by digest, or not at all
  const digest = 'sha256:' + 'ab'.repeat(32);
  assert.equal(imageReference({ image: { repository: m.image.repository, digest } }), `${m.image.repository}@${digest}`);
  for (const bad of [{ image: { repository: m.image.repository, digest: null } }, { image: { repository: m.image.repository, digest: 'latest' } },
    { image: { repository: m.image.repository, digest: 'sha256:abc' } }, { image: { repository: `${m.image.repository}@${digest}`, digest } },
    { image: { digest } }, {}, null]) {
    assert.throws(() => imageReference(bad), (e) => e.code === 'IMAGE_NOT_PINNED');
  }
  if (m.image.digest !== null) assert.equal(imageReference(m), `${m.image.repository}@${m.image.digest}`);
  else assert.throws(() => imageReference(m), (e) => e.code === 'IMAGE_NOT_PINNED');
});

test('R10 the manifest\'s egress allow-list is the model API alone', () => {
  assert.deepEqual(readManifest().egress, ['api.anthropic.com']);
});

test('R11 no place is named in its behaviour or outward text', async () => {
  const texts = [JSON.stringify(readManifest()), readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8'), JSON.stringify(pkg)];
  const { sdk } = stubSdk(async (call, { callTool }) => { await callTool('search', {}); return success(); });
  const r = await startRunner(sdk);
  try {
    texts.push(await (await fetch(`http://${r.base}/version`)).text(), await (await fetch(`http://${r.base}/x`)).text());
    texts.push(JSON.stringify((await conversation(r.base, request())).frames));
    texts.push(JSON.stringify((await conversation(r.base, request({ credential: null }))).frames));
    texts.push(JSON.stringify((await conversation(r.base, 'nope')).frames));
  } finally { await r.stop(); }
  for (const t of texts) assert.doesNotMatch(t, PLACE);
});
