import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import net from 'node:net';
import { stubSdk, success, request, startRunner, conversation, filesUnder, until, MEMBER, HELD, SENTINEL } from './helpers.mjs';

const QUIET = ['DISABLE_TELEMETRY', 'DISABLE_ERROR_REPORTING', 'DISABLE_AUTOUPDATER', 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'];

test('R1 one query per request, Claude Code with nothing of its own on, captured at the SDK boundary', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
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

test('R2 R28 a conversation runs on the held token, in an environment that replaces the process environment whole, with no API key and a fresh config directory', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  process.env.AGENT_RUNNER_TEST_LEAK = 'process-only';
  const ca0 = process.env.NODE_EXTRA_CA_CERTS;
  delete process.env.NODE_EXTRA_CA_CERTS;
  try {
    const { final } = await conversation(r.base, request());
    assert.equal(final.ok, true);
    const env = calls[0].options.env;
    assert.ok(!('AGENT_RUNNER_TEST_LEAK' in env), 'nothing of the process environment is inherited');
    assert.deepEqual(Object.keys(env).sort(), ['CLAUDE_AGENT_SDK_CLIENT_APP', 'CLAUDE_CODE_OAUTH_TOKEN', 'CLAUDE_CONFIG_DIR', 'HOME', 'PATH', 'TMPDIR', ...QUIET].sort(),
      'the held token, and no ANTHROPIC_API_KEY');
    assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, HELD, 'the credential\'s secret, as AT-22 uses it');
    for (const k of ['HOME', 'TMPDIR', 'CLAUDE_CONFIG_DIR']) assert.ok(env[k].startsWith(r.tmpRoot), `${k} is inside the query's temporary directory`);
    await until(() => readdirSync(r.tmpRoot).length === 0);
    // the one variable passed from the process: the container CA's path (R10's egress), when the image sets it
    process.env.NODE_EXTRA_CA_CERTS = '/etc/cloudflare/certs/cloudflare-containers-ca.crt';
    await conversation(r.base, request());
    assert.deepEqual(Object.keys(calls[1].options.env).sort(), [...Object.keys(env), 'NODE_EXTRA_CA_CERTS'].sort());
    assert.equal(calls[1].options.env.NODE_EXTRA_CA_CERTS, process.env.NODE_EXTRA_CA_CERTS);
    assert.notEqual(calls[1].options.env.CLAUDE_CONFIG_DIR, env.CLAUDE_CONFIG_DIR, 'a fresh config directory for each query');
  } finally {
    delete process.env.AGENT_RUNNER_TEST_LEAK;
    if (ca0 === undefined) delete process.env.NODE_EXTRA_CA_CERTS; else process.env.NODE_EXTRA_CA_CERTS = ca0;
    await r.stop();
  }
});

test('R2 R28 R8 every credential but a signin one naming a member answers NO_CREDENTIAL and starts nothing; a sentinel token in a subscription or apikey credential is in no output', async () => {
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  const ran = r.claude.runs().length;
  const frames = [];
  console.log = console.error = console.warn = (...a) => { logged.push(a.join(' ')); };
  process.stdout.write = (s, ...a) => { logged.push(String(s)); return orig.out.call(process.stdout, s, ...a); };
  process.stderr.write = (s, ...a) => { logged.push(String(s)); return orig.err.call(process.stderr, s, ...a); };
  let files = [], made = null, ranAfter = null;
  try {
    for (const credential of [
      { kind: 'subscription', secret: SENTINEL }, { kind: 'apikey', secret: SENTINEL },
      { kind: 'subscription', member: MEMBER, secret: SENTINEL }, { kind: 'apikey', member: MEMBER, secret: SENTINEL },
      { kind: 'subscription', member: MEMBER }, { kind: 'apikey', member: MEMBER }, { kind: 'password', secret: 'x' },
      undefined, null, {}, 'signin', ['signin'], { kind: 'signin' }, { kind: 'signin', member: '' }, { kind: 'signin', member: 7 },
      { kind: 'signin', member: [MEMBER] }, { kind: 'signin', member: 7, secret: SENTINEL }, { member: MEMBER, secret: SENTINEL }]) {
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
  const r = await startRunner(sdk);
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
    const r = await startRunner(sdk);
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
    const r = await startRunner(sdk);
    try {
      const { final } = await conversation(r.base, request());
      assert.equal(final.ok, false);
      assert.equal(final.code, code);
      assert.equal(typeof final.detail, 'string');
      assert.ok(final.detail.length <= 300);
    } finally { await r.stop(); }
  }
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
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
  const r = await startRunner(sdk);
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
  const r = await startRunner(sdk);
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
  const r = await startRunner(sdk);
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

test('R28 R8 a sentinel secret reaches the query\'s CLAUDE_CODE_OAUTH_TOKEN and nothing else: no answer, relay, log line or file', async () => {
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  const seenConfig = [];
  const { calls, sdk } = stubSdk(async (call, { callTool }) => {
    seenConfig.push(call.options.env.CLAUDE_CONFIG_DIR);
    writeFileSync(join(call.options.env.CLAUDE_CONFIG_DIR, 'session.json'), '{"x":1}');
    await callTool('search', { q: 'x' });
    return success();
  });
  const r = await startRunner(sdk);
  const errors = stubSdk(async () => { throw new Error(`401 for ${SENTINEL}`); });
  const e = await startRunner(errors.sdk);
  console.log = console.error = console.warn = (...a) => { logged.push(a.join(' ')); };
  process.stdout.write = (s, ...a) => { logged.push(String(s)); return orig.out.call(process.stdout, s, ...a); };
  process.stderr.write = (s, ...a) => { logged.push(String(s)); return orig.err.call(process.stderr, s, ...a); };
  const frames = [];
  let files = [];
  try {
    const req = request({ credential: { kind: 'signin', member: MEMBER, secret: SENTINEL } });
    frames.push(...(await conversation(r.base, req)).frames, ...(await conversation(e.base, req)).frames);
    await until(() => readdirSync(r.tmpRoot).length === 0 && readdirSync(e.tmpRoot).length === 0);
    files = [...filesUnder(r.tmpRoot), ...filesUnder(r.signinRoot), ...filesUnder(e.tmpRoot)];
  } finally {
    Object.assign(console, { log: orig.log, error: orig.error, warn: orig.warn });
    process.stdout.write = orig.out; process.stderr.write = orig.err;
    await r.stop(); await e.stop();
  }
  assert.equal(calls[0].options.env.CLAUDE_CODE_OAUTH_TOKEN, SENTINEL, 'the query\'s environment has it');
  const { env, mcpServers, abortController, ...rest } = calls[0].options;
  assert.ok(!JSON.stringify(rest).includes(SENTINEL) && !calls[0].prompt.includes(SENTINEL), 'in no other option');
  assert.deepEqual(Object.entries(env).filter(([, v]) => v === SENTINEL).map(([k]) => k), ['CLAUDE_CODE_OAUTH_TOKEN']);
  assert.ok(frames.some((f) => f.tool_use) && frames.some((f) => f.ok === true) && frames.some((f) => f.code === 'SDK_ERROR'), 'the conversations ran');
  assert.ok(!JSON.stringify(frames).includes(SENTINEL), 'in no answer or relay, an error\'s detail included');
  assert.ok(!logged.join('\n').includes(SENTINEL) && !JSON.stringify([...r.lines, ...e.lines]).includes(SENTINEL), 'in no log line');
  assert.deepEqual(files, [], 'no file is left, the config directory included');
  assert.ok(seenConfig[0].startsWith(r.tmpRoot));
});

test('R28 a signin credential with no non-empty secret answers SIGNIN_NOT_HELD and starts nothing', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  try {
    for (const secret of [undefined, '', 42, null, ['x'], { t: 'x' }]) {
      const credential = { kind: 'signin', member: MEMBER };
      if (secret !== undefined) credential.secret = secret;
      const { final } = await conversation(r.base, request({ credential }));
      assert.equal(final.ok, false);
      assert.equal(final.code, 'SIGNIN_NOT_HELD', JSON.stringify(secret));
      assert.match(final.detail, /connect Claude again/);
    }
    assert.equal(calls.length, 0, 'nothing started');
    assert.deepEqual(readdirSync(r.tmpRoot), [], 'no temporary directory made');
  } finally { await r.stop(); }
});

test('R28 Anthropic refusing the token, as the SDK reports it, answers SIGNIN_TOKEN_REFUSED; any other failure stays SDK_ERROR', async () => {
  const authAssistant = { type: 'assistant', error: 'authentication_failed', message: { content: [{ type: 'text', text: 'Invalid API key · Please run /login' }] } };
  const authRetry = { type: 'system', subtype: 'api_retry', attempt: 1, max_retries: 10, retry_delay_ms: 500, error_status: 401, error: 'authentication_failed' };
  const errorResult = { type: 'result', subtype: 'success', is_error: true, result: 'Invalid API key · Please run /login', num_turns: 1 };
  // a stub that yields the given messages before its result
  const yielding = (msgs, result, thrown) => {
    const { calls, sdk } = stubSdk(async () => result);
    const query = sdk.query;
    sdk.query = (args) => (async function* () {
      for await (const m of query(args)) { if (m.type === 'result') { yield* msgs; if (thrown) throw new Error(thrown); } yield m; }
    })();
    return { calls, sdk };
  };
  const cases = [
    [[authAssistant], errorResult, null, 'SIGNIN_TOKEN_REFUSED'],
    [[authRetry], { type: 'result', subtype: 'error_during_execution', is_error: true, num_turns: 0, errors: ['401'] }, null, 'SIGNIN_TOKEN_REFUSED'],
    [[authRetry], success(), 'process exited with code 1', 'SIGNIN_TOKEN_REFUSED'],
    // controls: a failure with no authentication error, and a query that recovered, are not refusals of the token
    [[{ type: 'assistant', error: 'rate_limit', message: { content: [] } }], errorResult, null, 'SDK_ERROR'],
    [[authRetry], success(), null, true],
  ];
  for (const [msgs, result, thrown, want] of cases) {
    const { sdk } = yielding(msgs, result, thrown);
    const r = await startRunner(sdk);
    try {
      const { final } = await conversation(r.base, request());
      if (want === true) assert.equal(final.ok, true);
      else {
        assert.equal(final.code, want, JSON.stringify(msgs[0]).slice(0, 60));
        assert.ok(typeof final.detail === 'string' && final.detail.length <= 300);
        if (want === 'SIGNIN_TOKEN_REFUSED') assert.match(final.detail, /connect Claude again/);
      }
    } finally { await r.stop(); }
  }
});
