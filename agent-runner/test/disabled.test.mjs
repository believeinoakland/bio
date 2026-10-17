// R35: the local runner is disabled. The class, loaded from its committed bundle over a stubbed runtime, answers every
// request 410 LOCAL_RUNNER_DISABLED before its container, its port or its storage is touched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installRuntime, loadWorker, fakeCtx } from './stubs/runtime.mjs';

const SENT = 'SENTINEL-r35-9f2c';
const PATHS = ['/conversation', '/version', '/signin', '/signin/code', '/signin/state', '/signout', '/', `/other/${'a'.repeat(30)}`];
const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const BODY = { ok: false, code: 'LOCAL_RUNNER_DISABLED' };

// The class over a ctx that records every container and storage call, and the instance's own start methods.
async function recorded() {
  const restore = installRuntime();
  const mod = await loadWorker();
  const ctx = fakeCtx('127.0.0.1:9');
  const runner = new mod.AgentRunner(ctx, {});
  const calls = [];
  for (const k of ['get', 'put', 'delete', 'setAlarm', 'getAlarm', 'deleteAlarm']) {
    const f = ctx.storage[k];
    ctx.storage[k] = (...a) => { calls.push(`storage.${k}`); return f(...a); };
  }
  for (const k of ['containerFetch', 'startAndWaitForPorts', 'start', 'passThrough', 'holdAfter']) {
    runner[k] = async () => { calls.push(k); throw new Error(`${k} reached`); };
  }
  const lines = [];
  const log0 = console.log;
  console.log = (...a) => { const s = a.join(' '); try { lines.push(JSON.parse(s)); } catch { lines.push(s); } };
  return { mod, ctx, runner, calls, lines, stop: () => { console.log = log0; restore(); } };
}

test('R35 every method on every path, and the WebSocket upgrade, answers 410 LOCAL_RUNNER_DISABLED and touches no container or storage', async () => {
  const h = await recorded();
  let n = 0;
  try {
    for (const path of PATHS) {
      for (const method of METHODS) {
        const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? JSON.stringify({ member: 'm-1', code: SENT, secret: SENT }) : undefined;
        const req = new Request(`https://agent-runner${path}?k=${SENT}`, { method, body, headers: { authorization: `Bearer ${SENT}`, 'x-probe': SENT } });
        const res = await h.runner.fetch(req);
        n += 1;
        assert.equal(res.status, 410, `${method} ${path}`);
        assert.match(res.headers.get('content-type'), /^application\/json\b/, `${method} ${path}`);
        assert.deepEqual(JSON.parse(await res.text()), BODY, `${method} ${path}`);
        assert.equal(req.bodyUsed, false, `${method} ${path}: no body read`);
      }
    }
    const up = await h.runner.fetch(new Request('https://agent-runner/conversation', { headers: { Upgrade: 'websocket', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==' } }));
    n += 1;
    assert.equal(up.status, 410, 'a plain 410, no 101');
    assert.equal(up.webSocket ?? null, null, 'no connection accepted');
    assert.deepEqual(await up.json(), BODY);
    assert.deepEqual(h.calls, [], 'no containerFetch, startAndWaitForPorts, start or storage call');
    assert.deepEqual(h.ctx.seen, { starts: [], requests: [], intercepts: [] }, 'the container is never started or reached');
    assert.equal(h.ctx.container.running, false);
  } finally { h.stop(); }
  // one line each, naming method and path template only
  assert.equal(h.lines.length, n, 'exactly one line per request');
  for (const l of h.lines) {
    assert.deepEqual(Object.keys(l), ['event', 'method', 'path_template', 'status']);
    assert.equal(l.event, 'runner.local.disabled');
    assert.equal(l.status, 410);
    assert.ok(METHODS.includes(l.method));
  }
  assert.deepEqual([...new Set(h.lines.map((l) => l.path_template))].sort(),
    PATHS.map((p) => p.replace(/\/a{30}$/, '/:id')).sort(), 'the path template, a long segment as :id, never a query');
  assert.ok(!JSON.stringify(h.lines).includes(SENT), 'no query, header or body is logged');
});

test('R35 no hold is written: a sign-in start answered 410 leaves the class\'s storage without a hold', async () => {
  const h = await recorded();
  try {
    const res = await h.runner.fetch(new Request('https://agent-runner/signin', { method: 'POST', body: '{"member":"m-1"}' }));
    assert.equal(res.status, 410);
    assert.equal(await h.ctx.storage.get(h.mod.AgentRunner.HOLD_KEY), undefined);
  } finally { h.stop(); }
});

test('R35 R15 control: the default export still answers 404 UNKNOWN, and AgentRunner is still exported', async () => {
  const restore = installRuntime();
  try {
    const mod = await loadWorker();
    assert.equal(typeof mod.AgentRunner, 'function');
    assert.equal(mod.AgentRunner.name, 'AgentRunner');
    const res = await mod.default.fetch(new Request('https://agent-runner/version'), {}, {});
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { ok: false, code: 'UNKNOWN' });
  } finally { restore(); }
});
