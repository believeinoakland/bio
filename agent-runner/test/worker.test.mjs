import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stubSdk, success, request, startRunner, conversation, MEMBER } from './helpers.mjs';
import { installRuntime, loadWorker, fakeCtx, conversationThrough } from './stubs/runtime.mjs';
import { readManifest } from '../src/manifest.mjs';
import { parseJsonc } from '../../bio-plane/scripts/jsonc.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const wrangler = () => parseJsonc(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'), 'wrangler.jsonc');

// The class as the runtime hosts it, over a container whose port is the real image's server.
async function hosted(script = async () => success()) {
  const restore = installRuntime();
  const { calls, sdk } = stubSdk(script);
  const image = await startRunner(sdk, { signedIn: MEMBER });
  const mod = await loadWorker();
  const ctx = fakeCtx(image.base);
  const runner = new mod.AgentRunner(ctx, {});
  return { mod, ctx, runner, image, calls, stop: async () => { restore(); await image.stop(); } };
}

test('R12 the Worker exports the Container Durable Object class AgentRunner and adds no route of its own', async () => {
  const h = await hosted();
  try {
    assert.deepEqual(Object.keys(h.mod).sort(), ['AgentRunner', 'ContainerProxy', 'default'],
      'the class, the library\'s proxy (reachable only through ctx.exports) and R15\'s default handler, nothing else');
    assert.deepEqual(Object.keys(h.mod.default), ['fetch'], 'the default export adds no handler but R15\'s fetch');
    assert.equal(typeof h.mod.AgentRunner, 'function');
    assert.equal(h.mod.AgentRunner.name, 'AgentRunner');
    // agent-worker's RUNNER binding names this class in this script
    const aw = parseJsonc(readFileSync(new URL('../../agent-worker/wrangler.jsonc', import.meta.url), 'utf8'), 'agent-worker');
    assert.deepEqual(aw.durable_objects.bindings.find((b) => b.name === 'RUNNER'),
      { name: 'RUNNER', class_name: 'AgentRunner', script_name: wrangler().name });
  } finally { await h.stop(); }
});

test('R12 every request reaches the image unchanged, on its one port, and is answered exactly as the image answers', async () => {
  const h = await hosted();
  try {
    const port = readManifest().image.port;
    const cases = [['GET', '/version'], ['POST', '/version'], ['GET', '/'], ['DELETE', '/x'], ['GET', '/conversation']];
    for (const [method, path] of cases) {
      const req = new Request(`https://agent-runner${path}`, { method, headers: { 'cf-container-target-port': '9999', 'x-probe': 'kept' } });
      const through = await h.runner.fetch(req);
      const direct = await fetch(`http://${h.image.base}${path}`, { method });
      assert.equal(through.status, direct.status, `${method} ${path}`);
      assert.deepEqual(await through.json(), await direct.json(), `${method} ${path}`);
      const seen = h.ctx.seen.requests.at(-1);
      assert.equal(seen.request, req, 'the very request, not a copy or a rewrite');
      assert.equal(seen.port, port, 'the image\'s port, whatever port the caller asks for');
      assert.equal(seen.request.headers.get('x-probe'), 'kept');
    }
    const v = await (await h.runner.fetch(new Request('https://agent-runner/version'))).json();
    assert.deepEqual(v, { ok: true, name: 'agent-runner', version: pkg.version });
  } finally { await h.stop(); }
});

test('R12 the conversation\'s WebSocket upgrade passes through: R1–R4 answer through the binding as the image answers', async () => {
  const relays = [];
  const h = await hosted(async (call, { callTool }) => { await callTool('search', { q: 'minutes' }); return success(); });
  try {
    const req = request({ max_turns: 3 });
    const through = await conversationThrough(h.runner, req, (tu) => { relays.push(tu); return { content: 'two hits' }; });
    assert.equal(through.status, 101);
    const direct = await conversation(h.image.base, req, () => ({ content: 'two hits' }));
    const strip = (fs) => fs.map((f) => (f.tool_use ? { tool_use: { ...f.tool_use, id: '*' } } : f));
    assert.deepEqual(strip(through.frames), strip(direct.frames));
    assert.deepEqual(through.final, { ok: true, result: 'done', stop_reason: 'end_turn', num_turns: 2,
      usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 5, cache_creation_input_tokens: 7, total_cost_usd: 0.0123 } });
    assert.deepEqual(relays.map((r) => [r.name, r.input]), [['search', { q: 'minutes' }]]);
    assert.equal(h.calls[0].options.env.CLAUDE_CONFIG_DIR, h.image.signin.configDir, 'the query ran under the member\'s stored sign-in in the image');
    // an error answer comes back the same way
    const bad = await conversationThrough(h.runner, request({ credential: null }));
    assert.deepEqual({ ok: bad.final.ok, code: bad.final.code }, { ok: false, code: 'NO_CREDENTIAL' });
  } finally { await h.stop(); }
});

test('R12 the Worker holds no credential: it starts the container with no environment, and has no binding but its own', async () => {
  const h = await hosted();
  try {
    await h.runner.fetch(new Request('https://agent-runner/version'));
    assert.equal(h.ctx.seen.starts.length, 1);
    for (const s of h.ctx.seen.starts) {
      assert.ok(!('env' in s), 'no variable is passed to the image');
      assert.ok(!('entrypoint' in s), 'the image runs its own CMD');
    }
    const w = wrangler();
    assert.deepEqual(Object.keys(w.vars), ['VERSION'], 'one variable, the release\'s version stamp');
    assert.equal(w.vars.VERSION, pkg.version);
    for (const k of ['services', 'r2_buckets', 'kv_namespaces', 'd1_databases', 'secrets', 'queues', 'ai', 'routes', 'route'])
      assert.ok(!(k in w), `no ${k}`);
    assert.deepEqual(w.durable_objects.bindings.map((b) => b.class_name), ['AgentRunner']);
    assert.equal(w.workers_dev, false);
    assert.equal(w.preview_urls, false);
  } finally { await h.stop(); }
});

// R15: the committed bundle (wrangler's `main`) has a default export carrying a `fetch` handler, so wrangler builds an
// ES-module Worker and deploys the class; the handler answers R6's 404 to everything, reads no body, reaches no
// container and holds no state.
test('R15 the committed bundle has a default fetch handler answering 404 UNKNOWN, beside the AgentRunner class', async () => {
  const restore = installRuntime();
  try {
    assert.equal(wrangler().main, readManifest().bundle.outfile, 'the bundle under test is the one wrangler deploys');
    const mod = await loadWorker();
    assert.equal(typeof mod.AgentRunner, 'function', 'AgentRunner still exported');
    assert.equal(mod.AgentRunner.name, 'AgentRunner');
    assert.equal(typeof mod.default, 'object');
    assert.equal(typeof mod.default.fetch, 'function');
    // whatever reaches it: every method, path and the conversation's upgrade, with a body it must not read
    const touched = [];
    const env = new Proxy({}, { get: (_, k) => { touched.push(['env', k]); return undefined; } });
    const ctx = new Proxy({}, { get: (_, k) => { touched.push(['ctx', k]); return undefined; } });
    const cases = [['GET', '/version'], ['GET', '/'], ['GET', '/conversation', { Upgrade: 'websocket' }],
      ['POST', '/conversation', {}, 'secret-bearing body'], ['PUT', '/x', {}, 'x'], ['DELETE', '/version'], ['HEAD', '/x']];
    for (let round = 0; round < 2; round++) {                     // a second round answers the same: no state
      for (const [method, path, headers = {}, body] of cases) {
        let pulled = false;
        const stream = body === undefined ? undefined : new ReadableStream({ pull(c) { pulled = true; c.enqueue(new TextEncoder().encode(body)); c.close(); } }, { highWaterMark: 0 });
        const req = new Request(`https://agent-runner${path}`, { method, headers, body: stream, duplex: stream ? 'half' : undefined });
        const res = await mod.default.fetch(req, env, ctx);
        assert.equal(res.status, 404, `${method} ${path}`);
        if (method !== 'HEAD') assert.deepEqual(await res.json(), { ok: false, code: 'UNKNOWN' }, `${method} ${path}`);
        assert.equal(req.bodyUsed, false, `${method} ${path}: no body read`);
        assert.equal(pulled, false, `${method} ${path}: no body byte pulled`);
        assert.equal(res.webSocket ?? null, null, 'no connection accepted');
      }
    }
    assert.deepEqual(touched, [], 'no binding, container instance or context reached');
    assert.deepEqual(Object.keys(mod.default), ['fetch'], 'no state beside the handler');
  } finally { restore(); }
});
