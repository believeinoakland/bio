// R42: the Worker exports `RemoteSession`, a Durable Object class with no container, that answers unavailable until R36
// is built. Loaded from the committed bundle (what bundler's coherence check reads) over the stubbed runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseJsonc } from '../../bio-plane/scripts/jsonc.mjs';
import { installRuntime, loadWorker, fakeCtx } from './stubs/runtime.mjs';

const SENT = 'SENTINEL-r42-5b7d';
const PATHS = ['/remote/version', '/conversation', '/signin', '/signin/code', '/signin/state', '/signout', '/', '/version'];
const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const BODY = { ok: false, code: 'REMOTE_UNAVAILABLE' };

// The class over a ctx whose every storage and container call is recorded.
async function recorded() {
  const restore = installRuntime();
  const mod = await loadWorker();
  const ctx = fakeCtx('127.0.0.1:9');
  const calls = [];
  for (const k of ['get', 'put', 'delete', 'setAlarm', 'getAlarm', 'deleteAlarm']) {
    const f = ctx.storage[k];
    ctx.storage[k] = (...a) => { calls.push(`storage.${k}`); return f(...a); };
  }
  return { mod, ctx, calls, session: new mod.RemoteSession(ctx, {}), stop: restore };
}

test('R42 the Worker exports RemoteSession beside AgentRunner and the default handler', async () => {
  const restore = installRuntime();
  try {
    const mod = await loadWorker();
    assert.equal(typeof mod.RemoteSession, 'function');
    assert.equal(mod.RemoteSession.name, 'RemoteSession');
    assert.equal(typeof mod.AgentRunner, 'function');
    assert.equal(typeof mod.default.fetch, 'function');
  } finally { restore(); }
});

test('R42 GET /remote/version answers unavailable: 503 REMOTE_UNAVAILABLE, JSON', async () => {
  const h = await recorded();
  try {
    const res = await h.session.fetch(new Request('https://remote-session/remote/version'));
    assert.equal(res.status, 503);
    assert.match(res.headers.get('content-type'), /^application\/json\b/);
    assert.deepEqual(await res.json(), BODY);
  } finally { h.stop(); }
});

test('R42 every other method and path, and the WebSocket upgrade, is refused 503 REMOTE_UNAVAILABLE with no body read and no storage or container call', async () => {
  const h = await recorded();
  try {
    for (const path of PATHS) {
      for (const method of METHODS) {
        if (method === 'GET' && path === '/remote/version') continue;
        const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? JSON.stringify({ member: 'm-1', code: SENT, secret: SENT }) : undefined;
        const req = new Request(`https://remote-session${path}?k=${SENT}`, { method, body, headers: { authorization: `Bearer ${SENT}` } });
        const res = await h.session.fetch(req);
        assert.equal(res.status, 503, `${method} ${path}`);
        assert.match(res.headers.get('content-type'), /^application\/json\b/, `${method} ${path}`);
        const text = await res.text();
        assert.deepEqual(JSON.parse(text), BODY, `${method} ${path}`);
        assert.ok(!text.includes(SENT), `${method} ${path}: nothing of the request is echoed`);
        assert.equal(req.bodyUsed, false, `${method} ${path}: no body read`);
      }
    }
    const up = await h.session.fetch(new Request('https://remote-session/conversation', { headers: { Upgrade: 'websocket', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==' } }));
    assert.equal(up.status, 503, 'a plain 503, no 101');
    assert.equal(up.webSocket ?? null, null, 'no connection accepted');
    assert.deepEqual(await up.json(), BODY);
    assert.deepEqual(h.calls, [], 'no storage call');
    assert.deepEqual(h.ctx.seen, { starts: [], requests: [], intercepts: [] }, 'no container');
    assert.equal(h.ctx.container.running, false);
  } finally { h.stop(); }
});

test('R42 the configuration declares RemoteSession in migration v2 beside AgentRunner in v1, the binding unchanged', () => {
  const w = parseJsonc(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'), 'wrangler.jsonc');
  const by = (tag) => w.migrations.find((g) => g.tag === tag);
  assert.deepEqual(by('v1').new_sqlite_classes, ['AgentRunner']);
  assert.deepEqual(by('v2').new_sqlite_classes, ['RemoteSession']);
  assert.deepEqual(w.durable_objects.bindings, [{ name: 'AGENT_RUNNER', class_name: 'AgentRunner' }]);
  assert.equal(w.containers.length, 1, 'RemoteSession has no container');
  assert.equal(w.containers[0].class_name, 'AgentRunner');
});

test('R42 control: AgentRunner still answers 410 (R35) and the default export 404 UNKNOWN (R15)', async () => {
  const restore = installRuntime();
  const log0 = console.log; console.log = () => {};
  try {
    const mod = await loadWorker();
    const runner = new mod.AgentRunner(fakeCtx('127.0.0.1:9'), {});
    const res = await runner.fetch(new Request('https://agent-runner/remote/version'));
    assert.equal(res.status, 410);
    assert.deepEqual(await res.json(), { ok: false, code: 'LOCAL_RUNNER_DISABLED' });
    const def = await mod.default.fetch(new Request('https://agent-runner/version'), {}, {});
    assert.equal(def.status, 404);
    assert.deepEqual(await def.json(), { ok: false, code: 'UNKNOWN' });
  } finally { console.log = log0; restore(); }
});
