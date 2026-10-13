// The Worker class (R25, R26, R30), loaded from its committed bundle over a stubbed runtime whose container's port is
// the real image's server (stubs/runtime.mjs), with a fake clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stubSdk, success, startRunner } from './helpers.mjs';
import { installRuntime, loadWorker, fakeCtx } from './stubs/runtime.mjs';
import { GOOD_CODE } from './stubs/claude-values.mjs';
import { readManifest } from '../src/manifest.mjs';
import { SIGNIN_HOLD_MS, CODE_WAIT_MS, OUTCOME_WAIT_MS } from '../src/waits.mjs';

const M = 'member-7d1e';
const MIN = 60_000;
const ID = 'f3a9c1d2e4b5' + '0'.repeat(52);

// The class over the image in `mode`, its clock `clock.t`, its stops counted, its console lines kept.
async function hosted(mode = 'ok') {
  const restore = installRuntime();
  const image = await startRunner(stubSdk(async () => success()).sdk, { mode });
  const mod = await loadWorker();
  const ctx = fakeCtx(image.base);
  ctx.id = { toString: () => ID };
  const runner = new mod.AgentRunner(ctx, {});
  const clock = { t: Date.now() };
  const now0 = Date.now;
  Date.now = () => clock.t;
  const lines = [];
  const log0 = console.log;
  console.log = (...a) => { const s = a.join(' '); try { lines.push(JSON.parse(s)); } catch { /* the library's own words */ } };
  let stops = 0;
  runner.stop = async () => { stops += 1; };
  const post = async (path, body) => {
    const res = await runner.fetch(new Request(`https://agent-runner${path}`, { method: 'POST', body: JSON.stringify(body) }));
    return { status: res.status, body: await res.json() };
  };
  await runner.fetch(new Request('https://agent-runner/version'));         // the container is running
  return {
    mod, ctx, runner, image, clock, lines, post, stops: () => stops,
    expire: async (ms) => { clock.t += ms; await runner.onActivityExpired(); },
    stop: async () => { Date.now = now0; console.log = log0; restore(); await image.stop(); },
  };
}

test('R25 the hold is from start to the code\'s outcome plus 30 s, 10 min 90 s from R18\'s constants', () => {
  assert.equal(SIGNIN_HOLD_MS, CODE_WAIT_MS + OUTCOME_WAIT_MS + 30_000);
  assert.equal(SIGNIN_HOLD_MS, 10 * MIN + 90_000);
});

test('R25 after a 200 start, expiries at +3 and +9 minutes stop nothing, and one at +12 minutes stops the container', async () => {
  const h = await hosted();
  try {
    const s = await h.post('/signin', { member: M });
    assert.equal(s.status, 200);
    assert.equal(typeof await h.ctx.storage.get(h.mod.AgentRunner.HOLD_KEY), 'number', 'the hold is in the class\'s own storage');
    await h.expire(3 * MIN);
    assert.equal(h.stops(), 0, '+3 min: held awake');
    await h.expire(6 * MIN);
    assert.equal(h.stops(), 0, '+9 min: held awake');
    assert.equal(h.image.signin.waiting.member, M, 'the attempt still waits');
    await h.expire(3 * MIN);
    assert.equal(h.stops(), 1, '+12 min: past the hold, the container stops');
    assert.equal(await h.ctx.storage.get(h.mod.AgentRunner.HOLD_KEY), undefined, 'the hold is cleared');
    const whats = h.lines.filter((l) => l.event === 'runner.lifecycle').map((l) => [l.what, l.signin_hold]);
    assert.deepEqual(whats.filter(([w]) => w === 'held_awake' || w === 'activity_expired'),
      [['held_awake', true], ['held_awake', true], ['activity_expired', false]]);
  } finally { await h.stop(); }
});

test('R25 after a code answer the next expiry stops it; a 409 that keeps the attempt keeps the hold', async () => {
  const h = await hosted();
  try {
    const first = await h.post('/signin', { member: M });
    const second = await h.post('/signin', { member: M });
    const superseded = await h.post('/signin/code', { member: M, code: GOOD_CODE, attempt: first.body.attempt });
    assert.equal(superseded.body.code, 'ATTEMPT_SUPERSEDED');
    const bad = await h.post('/signin/code', { member: M, code: '' , attempt: second.body.attempt });
    assert.equal(bad.body.code, 'BAD_CODE');
    await h.expire(5 * MIN);
    assert.equal(h.stops(), 0, 'still held: the attempt waits');
    const done = await h.post('/signin/code', { member: M, code: GOOD_CODE, attempt: second.body.attempt });
    assert.equal(done.status, 200);
    await h.expire(2 * MIN);
    assert.equal(h.stops(), 1, 'the outcome ends the hold');
  } finally { await h.stop(); }
  // a refused code, and a sign-out, end it too
  for (const [mode, end] of [['refuses', (h) => h.post('/signin/code', { member: M, code: GOOD_CODE })], ['ok', (h) => h.post('/signout', { member: M })]]) {
    const h = await hosted(mode);
    try {
      await h.post('/signin', { member: M });
      await end(h);
      await h.expire(2 * MIN);
      assert.equal(h.stops(), 1, mode);
    } finally { await h.stop(); }
  }
});

test('R25 after a start answered 502 the next expiry stops it; control: an instance that never saw start stops at its first expiry', async () => {
  const h = await hosted('foreign');
  try {
    assert.equal((await h.post('/signin', { member: M })).status, 502);
    await h.expire(2 * MIN);
    assert.equal(h.stops(), 1);
  } finally { await h.stop(); }
  const c = await hosted();
  try {
    await c.post('/signin/state', { member: M });
    await c.expire(2 * MIN);
    assert.equal(c.stops(), 1, 'a conversation-only instance sleeps as before');
  } finally { await c.stop(); }
});

test('R26 a start the library cannot make is answered JSON 503 RUNNER_NOT_STARTED with its status, never its plain text', async () => {
  const h = await hosted();
  try {
    const cases = [
      [500, 'Failed to start container: the image could not be pulled from https://registry.test/v2/x?token=sk-ant-oat01-LEAK-9f2c and more words to pass one hundred and twenty characters'],
      [503, 'There is no Container instance available at this time.'],
      [429, 'Too many requests'],
      [500, 'Error proxying request to container: Network connection lost.'],
    ];
    for (const [status, text] of cases) {
      h.runner.containerFetch = async () => new Response(text, { status, headers: { 'content-type': 'text/plain' } });
      const res = await h.runner.fetch(new Request('https://agent-runner/signin', { method: 'POST', body: '{}', headers: { 'x-civicsmith-trace': 'tr-26' } }));
      assert.equal(res.status, 503);
      assert.match(res.headers.get('content-type'), /^application\/json/);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.equal(body.code, 'RUNNER_NOT_STARTED');
      assert.equal(body.status, status, 'the library\'s own status');
      assert.equal(body.trace, 'tr-26');
      assert.ok(body.detail.length <= 300 && !/\binstance\b|\bcontainer\b/i.test(body.detail), 'member-readable (R31)');
      assert.ok(body.library_detail.length <= 120, 'the library\'s words, at most 120 characters');
      assert.ok(!body.library_detail.includes('?') && !body.library_detail.includes('LEAK'), 'no URL query, nothing token-shaped');
      assert.ok(text.startsWith(body.library_detail.slice(0, 20)));
    }
    // a library that throws is the same
    h.runner.containerFetch = async () => { throw new Error('boom'); };
    const thrown = await h.runner.fetch(new Request('https://agent-runner/version'));
    assert.equal((await thrown.json()).code, 'RUNNER_NOT_STARTED');
    // control: a JSON answer passes through unchanged
    h.runner.containerFetch = async () => new Response('{"ok":false,"code":"BAD_MEMBER","detail":"x"}', { status: 400, headers: { 'content-type': 'application/json' } });
    const passed = await h.runner.fetch(new Request('https://agent-runner/signin', { method: 'POST', body: '{}' }));
    assert.equal(passed.status, 400);
    assert.deepEqual(await passed.json(), { ok: false, code: 'BAD_MEMBER', detail: 'x' });
  } finally { await h.stop(); }
});

test('R30 each lifecycle hook writes one line: start, started, held_awake, activity_expired, stop, error', async () => {
  const h = await hosted();
  try {
    const life = () => h.lines.filter((l) => l.event === 'runner.lifecycle');
    const startup = life().map((l) => l.what);
    assert.deepEqual(startup, ['start', 'started'], 'the container\'s start, then its readiness');
    assert.equal(typeof life()[1].ms, 'number');
    const n = life().length;
    await h.runner.onStop({ exitCode: 0, reason: 'exit' });
    await assert.rejects(h.runner.onError(new Error('the port broke at https://x.test/p?q=sk-ant-oat01-LEAK-77')));
    await h.post('/signin', { member: M });
    await h.expire(3 * MIN);
    await h.expire(10 * MIN);
    const after = life().slice(n);
    assert.deepEqual(after.map((l) => l.what), ['stop', 'error', 'held_awake', 'activity_expired']);
    for (const l of life()) {
      assert.equal(l.instance_ref, ID.slice(0, 12), 'the first 12 hex characters of the Durable Object id');
      assert.equal(typeof l.signin_hold, 'boolean');
      assert.deepEqual(Object.keys(l).filter((k) => !['event', 'instance_ref', 'what', 'ms', 'error_head', 'signin_hold'].includes(k)), []);
    }
    const err = after.find((l) => l.what === 'error');
    assert.match(err.error_head, /the port broke/);
    assert.ok(!err.error_head.includes('LEAK') && !err.error_head.includes('?'));
    assert.equal(after.find((l) => l.what === 'held_awake').signin_hold, true);
  } finally { await h.stop(); }
});

test('R30 R10 one egress handler per egress host passes the request through unchanged and logs its status, never its query, headers or body', async () => {
  const h = await hosted();
  const fetch0 = globalThis.fetch;
  const SENT = 'sk-ant-oat01-EGRESS-SENTINEL-3c1d';
  try {
    const handlers = h.mod.AgentRunner.outboundByHost;
    assert.deepEqual(Object.keys(handlers), readManifest().egress, 'control: the handlers\' hosts are the egress list');
    const seen = [];
    globalThis.fetch = async (req) => { seen.push(req); return new Response('{}', { status: 401 }); };
    const req = new Request(`https://platform.claude.com/v1/oauth/token/${'a'.repeat(30)}?code=${SENT}`, {
      method: 'POST', headers: { authorization: `Bearer ${SENT}`, 'x-other': SENT }, body: JSON.stringify({ code: SENT }) });
    const res = await handlers['platform.claude.com'](req, {}, { containerId: ID, className: 'AgentRunner' });
    assert.equal(res.status, 401, 'Anthropic\'s answer, unchanged');
    assert.equal(seen[0], req, 'the very request, passed on unchanged');
    const line = h.lines.filter((l) => l.event === 'runner.egress').at(-1);
    assert.deepEqual(line, { event: 'runner.egress', instance_ref: ID.slice(0, 12), host: 'platform.claude.com', method: 'POST',
      path_template: '/v1/oauth/token/:id', status: 401, ms: 0 });
    assert.ok(!JSON.stringify(h.lines).includes(SENT), 'no query, header or body is logged');
    // through the library's own proxy: an egress host reaches its handler; any other host is refused before any handler
    const n = seen.length;
    const proxy = new h.mod.ContainerProxy({ props: { className: 'AgentRunner', containerId: ID, allowedHosts: readManifest().egress, enableInternet: false, interceptAll: true } }, {});
    assert.equal((await proxy.fetch(new Request('https://api.anthropic.com/v1/messages', { method: 'POST' }))).status, 401);
    assert.equal(h.lines.filter((l) => l.event === 'runner.egress').at(-1).path_template, '/v1/messages');
    const lines = h.lines.length;
    assert.equal((await proxy.fetch(new Request('https://example.com/'))).status, 520);
    assert.equal(h.lines.length, lines, 'a refused host is not logged here');
    assert.equal(seen.length, n + 1);
  } finally { globalThis.fetch = fetch0; await h.stop(); }
});
