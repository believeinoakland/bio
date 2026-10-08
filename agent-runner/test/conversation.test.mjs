import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import net from 'node:net';
import { stubSdk, success, request, startRunner, conversation, filesUnder, until, MEMBER, SENTINEL } from './helpers.mjs';

const QUIET = ['DISABLE_TELEMETRY', 'DISABLE_ERROR_REPORTING', 'DISABLE_AUTOUPDATER', 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'];

test('R1 one query per request, Claude Code with nothing of its own on, captured at the SDK boundary', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk, { signedIn: MEMBER });
  try {
    const req = request({ max_turns: 7 });
    const { final } = await conversation(r.base, req);
    assert.equal(final.ok, true);
    assert.equal(calls.length, 1);
    const o = calls[0].options;
    assert.deepEqual(o.tools, []);
    assert.deepEqual(o.settingSources, []);
    assert.equal(o.persistSession, false);
    assert.equal(o.strictMcpConfig, true);
    assert.deepEqual(o.skills, []);
    assert.deepEqual(o.plugins, []);
    assert.equal(o.maxTurns, 7);
    assert.equal(o.model, req.model);
    assert.equal(o.systemPrompt, req.system);
    assert.equal(calls[0].prompt, req.prompt);
    // not bare mode: no argument or option turns it on
    assert.equal(o.extraArgs, undefined);
    assert.ok(!('bare' in o));
    assert.deepEqual(Object.keys(o.mcpServers), ['relay']);
    assert.ok(o.abortController instanceof AbortController);
  } finally { await r.stop(); }
});

test('R2 a conversation runs under the stored sign-in made for its member, in an environment that replaces the process environment whole, with neither credential variable', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk, { signedIn: MEMBER });
  process.env.AGENT_RUNNER_TEST_LEAK = 'process-only';
  const ca0 = process.env.NODE_EXTRA_CA_CERTS;
  delete process.env.NODE_EXTRA_CA_CERTS;
  try {
    const { final } = await conversation(r.base, request());
    assert.equal(final.ok, true);
    const env = calls[0].options.env;
    assert.ok(!('AGENT_RUNNER_TEST_LEAK' in env), 'nothing of the process environment is inherited');
    assert.deepEqual(Object.keys(env).sort(), ['CLAUDE_AGENT_SDK_CLIENT_APP', 'CLAUDE_CONFIG_DIR', 'HOME', 'PATH', 'TMPDIR', ...QUIET].sort(),
      'neither CLAUDE_CODE_OAUTH_TOKEN nor ANTHROPIC_API_KEY');
    assert.equal(env.CLAUDE_CONFIG_DIR, r.signin.configDir, 'no fresh directory: the stored sign-in\'s own, as the binary left it');
    for (const k of ['HOME', 'TMPDIR']) assert.ok(env[k].startsWith(r.tmpRoot), `${k} is the query's temporary directory`);
    await until(() => readdirSync(r.tmpRoot).length === 0);
    // the one variable passed from the process: the container CA's path (R10's egress), when the image sets it
    process.env.NODE_EXTRA_CA_CERTS = '/etc/cloudflare/certs/cloudflare-containers-ca.crt';
    await conversation(r.base, request());
    assert.deepEqual(Object.keys(calls[1].options.env).sort(), [...Object.keys(env), 'NODE_EXTRA_CA_CERTS'].sort());
    assert.equal(calls[1].options.env.NODE_EXTRA_CA_CERTS, process.env.NODE_EXTRA_CA_CERTS);
  } finally {
    delete process.env.AGENT_RUNNER_TEST_LEAK;
    if (ca0 === undefined) delete process.env.NODE_EXTRA_CA_CERTS; else process.env.NODE_EXTRA_CA_CERTS = ca0;
    await r.stop();
  }
});

test('R2 R8 every credential but {kind: "signin", member} answers NO_CREDENTIAL and starts nothing; a sentinel token in a subscription or apikey credential is in no output', async () => {
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  const { calls, sdk } = stubSdk(async () => success());
  // signed in for MEMBER, so no refusal below is for want of a sign-in
  const r = await startRunner(sdk, { signedIn: MEMBER });
  const ran = r.claude.runs().length;
  const frames = [];
  console.log = console.error = console.warn = (...a) => { logged.push(a.join(' ')); };
  process.stdout.write = process.stderr.write = (s) => { logged.push(String(s)); return true; };
  let files = [], made = null, ranAfter = null;
  try {
    for (const credential of [
      { kind: 'subscription', secret: SENTINEL }, { kind: 'apikey', secret: SENTINEL },
      { kind: 'subscription', member: MEMBER, secret: SENTINEL }, { kind: 'apikey', member: MEMBER, secret: SENTINEL },
      { kind: 'signin', member: MEMBER, secret: SENTINEL }, { kind: 'signin', member: MEMBER, secret: '' },
      { kind: 'subscription', member: MEMBER }, { kind: 'apikey', member: MEMBER }, { kind: 'password', secret: 'x' },
      undefined, null, {}, 'signin', ['signin'], { kind: 'signin' }, { kind: 'signin', member: '' }, { kind: 'signin', member: 7 },
      { kind: 'signin', member: [MEMBER] }, { member: MEMBER }]) {
      const req = request(); if (credential === undefined) delete req.credential; else req.credential = credential;
      const got = await conversation(r.base, req);
      frames.push(...got.frames);
      assert.deepEqual({ ok: got.final.ok, code: got.final.code }, { ok: false, code: 'NO_CREDENTIAL' }, JSON.stringify(credential));
    }
    made = readdirSync(r.tmpRoot);
    ranAfter = r.claude.runs().length;
    files = [...filesUnder(r.tmpRoot), ...filesUnder(r.signinRoot)];
  } finally {
    Object.assign(console, { log: orig.log, error: orig.error, warn: orig.warn });
    process.stdout.write = orig.out; process.stderr.write = orig.err;
    await r.stop();
  }
  assert.equal(calls.length, 0, 'no query started');
  assert.equal(ranAfter, ran, 'the binary was not run');
  assert.deepEqual(made, [], 'no temporary directory was made');
  assert.ok(!JSON.stringify(frames).includes(SENTINEL), 'the sentinel is in no answer');
  assert.ok(!logged.join('\n').includes(SENTINEL), 'nor in a log line');
  assert.ok(files.every((f) => !f.text.includes(SENTINEL)), 'nor in a file');
});

test('R3 the model sees only the request\'s tools; each call is relayed and the caller\'s result returned unchanged', async () => {
  const relays = [];
  const { calls, sdk } = stubSdk(async (call, { callTool }) => {
    await callTool('search', { q: 'sewer' });
    await callTool('read', { id: 'DOC-1' });
    await callTool('Bash', { command: 'ls' });
    return success();
  });
  const r = await startRunner(sdk, { signedIn: MEMBER });
  try {
    const tools = [
      { name: 'search', description: 'Search', input_schema: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] } },
      { name: 'read', description: 'Read', input_schema: { type: 'object', properties: { id: { type: 'string' } } } },
    ];
    const answers = { search: { content: 'three hits' }, read: { content: [{ type: 'text', text: 'body' }], is_error: true } };
    const { final } = await conversation(r.base, request({ tools }), (tu) => { relays.push(tu); return answers[tu.name]; });
    assert.equal(final.ok, true);
    const c = calls[0];
    assert.deepEqual(c.listed.map((t) => ({ name: t.name, description: t.description, input_schema: t.inputSchema })), tools);
    assert.deepEqual(c.options.allowedTools, ['mcp__relay__search', 'mcp__relay__read']);
    assert.deepEqual(relays.map((x) => [x.name, x.input]), [['search', { q: 'sewer' }], ['read', { id: 'DOC-1' }]]);
    assert.equal(new Set(relays.map((x) => x.id)).size, 2);
    assert.deepEqual(c.results[0].content, [{ type: 'text', text: 'three hits' }]);
    assert.ok(!c.results[0].isError);
    assert.deepEqual(c.results[1].content, [{ type: 'text', text: 'body' }]);
    assert.equal(c.results[1].isError, true);
    assert.equal(c.results[2].isError, true, 'a tool the request did not name is refused, never relayed or performed');
  } finally { await r.stop(); }
});

test('R4 the end is answered with result, stop_reason, num_turns and usage as the SDK states them', async () => {
  const cases = [
    [success(), { ok: true, result: 'done', stop_reason: 'end_turn', num_turns: 2,
      usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 5, cache_creation_input_tokens: 7, total_cost_usd: 0.0123 } }],
    [success({ usage: { input_tokens: 9 }, total_cost_usd: undefined, stop_reason: undefined }), { ok: true, result: 'done', stop_reason: null, num_turns: 2,
      usage: { input_tokens: 9, output_tokens: null, cache_read_input_tokens: null, cache_creation_input_tokens: null, total_cost_usd: null } }],
  ];
  for (const [res, want] of cases) {
    const { sdk } = stubSdk(async () => res);
    const r = await startRunner(sdk, { signedIn: MEMBER });
    try {
      const { final, code } = await conversation(r.base, request());
      assert.deepEqual(final, want);
      assert.equal(code, 1000);
    } finally { await r.stop(); }
  }
});

test('R4 errors: the SDK erring, max_turns reached, a bad request; detail at most 300 characters', async () => {
  const long = 'x'.repeat(1000);
  const cases = [
    [async () => { throw new Error(long); }, 'SDK_ERROR'],
    [async () => ({ type: 'result', subtype: 'error_during_execution', is_error: true, num_turns: 1, errors: ['boom'] }), 'SDK_ERROR'],
    [async () => success({ is_error: true, result: 'API Error: 500' }), 'SDK_ERROR'],
    [async () => null, 'SDK_ERROR'],
    [async () => ({ type: 'result', subtype: 'error_max_turns', is_error: true, num_turns: 4, errors: [] }), 'MAX_TURNS'],
  ];
  for (const [script, code] of cases) {
    const { sdk } = stubSdk(script);
    const r = await startRunner(sdk, { signedIn: MEMBER });
    try {
      const { final } = await conversation(r.base, request());
      assert.equal(final.ok, false);
      assert.equal(final.code, code);
      assert.equal(typeof final.detail, 'string');
      assert.ok(final.detail.length <= 300);
    } finally { await r.stop(); }
  }
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk, { signedIn: MEMBER });
  try {
    for (const bad of ['not json', '[1]', request({ model: '' }), request({ max_turns: 0 }), request({ tools: [{ name: 'a b' }] }),
      request({ tools: [{ name: 'a', description: '', input_schema: {} }, { name: 'a', description: '', input_schema: {} }] })]) {
      const { final } = await conversation(r.base, bad);
      assert.equal(final.code, 'BAD_REQUEST');
    }
    assert.equal(calls.length, 0);
  } finally { await r.stop(); }
});

test('R4 a closed connection aborts the query', async () => {
  let aborted = null;
  const { sdk } = stubSdk(async (call, { callTool, signal }) => {
    await callTool('search', { q: 'x' }).catch(() => {});
    await until(() => signal.aborted).catch(() => {});
    aborted = signal.aborted;
    return success();
  });
  const r = await startRunner(sdk, { signedIn: MEMBER });
  try {
    const { final } = await conversation(r.base, request(), undefined, { closeAfterRelay: true });
    assert.equal(final, undefined);
    await until(() => aborted !== null);
    assert.equal(aborted, true);
    await until(() => readdirSync(r.tmpRoot).length === 0);
  } finally { await r.stop(); }
});

test('R9 nothing survives a conversation; a second request on a fresh connection sees nothing of the first', async () => {
  const seen = [];
  const { calls, sdk } = stubSdk(async (call) => {
    const env = call.options.env;
    seen.push(filesUnder(dirname(env.HOME)).map((f) => f.path));
    writeFileSync(join(env.HOME, 'notes'), 'first');
    writeFileSync(join(env.TMPDIR, 'scratch'), 'first');
    writeFileSync(join(call.options.cwd, 'work'), 'first');
    return success();
  });
  const r = await startRunner(sdk, { signedIn: MEMBER });
  try {
    await conversation(r.base, request());
    await until(() => readdirSync(r.tmpRoot).length === 0);
    await conversation(r.base, request());
    await until(() => readdirSync(r.tmpRoot).length === 0);
    const dirs = calls.map((c) => dirname(c.options.env.HOME));
    assert.notEqual(dirs[0], dirs[1]);
    calls.forEach((c, i) => {
      assert.ok(dirs[i].startsWith(r.tmpRoot));
      for (const p of [c.options.env.TMPDIR, c.options.cwd]) assert.ok(p.startsWith(dirs[i]));
    });
    assert.deepEqual(seen, [[], []], 'each query starts in an empty directory');
    assert.deepEqual(readdirSync(r.tmpRoot), []);
  } finally { await r.stop(); }
});

test('R10 its only egress is the model API: no outbound connection of its own, Claude Code\'s other traffic off', async () => {
  const opened = [];
  const connect = net.Socket.prototype.connect;
  const fetch0 = globalThis.fetch;
  const { calls, sdk } = stubSdk(async (call, { callTool }) => { await callTool('search', { q: 'x' }); return success(); });
  const r = await startRunner(sdk, { signedIn: MEMBER });
  net.Socket.prototype.connect = function (...a) {
    const first = Array.isArray(a[0]) ? a[0][0] : a[0];
    const o = typeof first === 'object' ? first : { port: first, host: a[1] };
    if (!o.path) opened.push(`${o.host ?? 'localhost'}:${o.port}`);
    return connect.apply(this, a);
  };
  globalThis.fetch = (...a) => { opened.push(`fetch ${a[0]}`); return fetch0(...a); };
  try {
    await conversation(r.base, request());
  } finally {
    net.Socket.prototype.connect = connect; globalThis.fetch = fetch0;
    await r.stop();
  }
  const port = r.base.split(':')[1];
  assert.deepEqual(opened.filter((o) => o !== `127.0.0.1:${port}`), []);
  const env = calls[0].options.env;
  for (const k of ['DISABLE_TELEMETRY', 'DISABLE_ERROR_REPORTING', 'DISABLE_AUTOUPDATER', 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'])
    assert.equal(env[k], '1');
  for (const k of ['ANTHROPIC_BASE_URL', 'HTTP_PROXY', 'HTTPS_PROXY']) assert.ok(!(k in env));
  // the closed book: no built-in tool (web fetch, web search, file reads) and no settings, MCP or skills of its own
  assert.deepEqual(calls[0].options.tools, []);
  assert.deepEqual(calls[0].options.settingSources, []);
  assert.equal(calls[0].options.strictMcpConfig, true);
});
