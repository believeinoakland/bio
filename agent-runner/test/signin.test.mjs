import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { stubSdk, success, request, startRunner, conversation, filesUnder, until } from './helpers.mjs';
import { STORED, GOOD_CODE, ADDRESS } from './stubs/claude-values.mjs';
import { readManifest } from '../src/manifest.mjs';
import { LOGIN_ARGS, STATUS_ARGS, LOGOUT_ARGS, anthropicAddress, codeOk } from '../src/signin.mjs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const M = 'member-7d1e', OTHER = 'member-0b42';
const signinReq = (member = M) => request({ credential: { kind: 'signin', member } });
const creds = (r) => join(r.signin.configDir, '.credentials.json');

// The instance signed in for `member` through R17 and R18.
async function signedIn(r, member = M) {
  assert.equal((await r.post('/signin', { member })).status, 200);
  const done = await r.post('/signin/code', { member, code: GOOD_CODE });
  assert.deepEqual(done, { status: 200, body: { ok: true, connected: true, member } });
}

// Every refusal R17–R20 share before anything starts: a body not JSON, a malformed member.
const BAD_BODIES = ['not json', '[1]', '"x"', 'null'];
const BAD_MEMBERS = [undefined, '', 42, null, 'x'.repeat(201), ['m']];
async function sharedRefusals(r, path, extra = {}) {
  for (const b of BAD_BODIES) assert.deepEqual(await r.post(path, b), { status: 400, body: { ok: false, code: 'BAD_REQUEST' } }, `${path} ${b}`);
  for (const member of BAD_MEMBERS)
    assert.deepEqual(await r.post(path, { member, ...extra }), { status: 400, body: { ok: false, code: 'BAD_MEMBER' } }, `${path} ${member}`);
}

test('R17 POST /signin starts the binary\'s own sign-in for the member and answers the address it states, unchanged', async () => {
  const r = await startRunner(stubSdk(async () => success()).sdk);
  try {
    await sharedRefusals(r, '/signin');
    assert.deepEqual(r.claude.runs(), [], 'no refusal starts the binary');
    const a = await r.post('/signin', { member: M });
    assert.deepEqual(a, { status: 200, body: { ok: true, address: ADDRESS } }, 'the address as the binary states it, its terminal escapes aside');
    const [login] = r.claude.runs();
    assert.deepEqual(login.args, LOGIN_ARGS, 'the binary\'s own login, with no option');
    assert.equal(login.tty, true, 'it runs in a terminal (util-linux script)');
    assert.equal(r.signin.waiting.member, M);
    // a second start ends the waiting sign-in and starts a new one
    const first = r.signin.waiting.proc;
    assert.equal((await r.post('/signin', { member: M })).status, 200);
    assert.notEqual(r.signin.waiting.proc, first);
    await until(() => first.exitCode !== null || first.signalCode !== null);
    // a member at the boundary (200 characters) is taken
    assert.equal((await r.post('/signin', { member: 'm'.repeat(200) })).status, 200);
  } finally { await r.stop(); }
});

test('R17 an address not https: on an Anthropic sign-in host is never answered; no address in 30 s, or an exit, is SIGNIN_UNAVAILABLE', async () => {
  for (const mode of ['foreign', 'plain-http']) {
    const r = await startRunner(stubSdk(async () => success()).sdk, { mode });
    try {
      const a = await r.post('/signin', { member: M });
      assert.deepEqual(a, { status: 502, body: { ok: false, code: 'SIGNIN_ADDRESS_UNEXPECTED' } }, mode);
      assert.equal(r.signin.waiting, null, 'the sign-in is ended');
      assert.equal((await r.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
    } finally { await r.stop(); }
  }
  for (const ok of ['https://claude.ai/oauth/authorize?a=1', 'https://claude.com/cai/oauth/authorize', 'https://platform.claude.com/oauth',
    'https://console.anthropic.com/x', 'https://anthropic.com/']) assert.equal(anthropicAddress(ok), true, ok);
  for (const bad of ['http://claude.ai/', 'https://claude.ai.evil.test/', 'https://evilclaude.ai/', 'https://user@claude.ai/', 'https://claude.ai:8443/',
    'javascript:alert(1)', 'not a url', 'https://anthropic.com.example/']) assert.equal(anthropicAddress(bad), false, bad);
  const silent = await startRunner(stubSdk(async () => success()).sdk, { mode: 'silent', waits: { address: 300 } });
  try {
    const a = await silent.post('/signin', { member: M });
    assert.equal(a.status, 502);
    assert.equal(a.body.code, 'SIGNIN_UNAVAILABLE');
    assert.match(a.body.detail, /no address within/);
    assert.equal(silent.signin.waiting, null);
  } finally { await silent.stop(); }
  const exits = await startRunner(stubSdk(async () => success()).sdk, { mode: 'exits' });
  try {
    const a = await exits.post('/signin', { member: M });
    assert.equal(a.status, 502);
    assert.equal(a.body.code, 'SIGNIN_UNAVAILABLE');
    assert.ok(typeof a.body.detail === 'string' && a.body.detail.length <= 300);
    assert.ok(!('address' in a.body));
  } finally { await exits.stop(); }
});

test('R18 POST /signin/code types the code once at the binary\'s prompt and answers its outcome', async () => {
  const r = await startRunner(stubSdk(async () => success()).sdk);
  try {
    await sharedRefusals(r, '/signin/code', { code: GOOD_CODE });
    assert.deepEqual(await r.post('/signin/code', { member: M, code: GOOD_CODE }), { status: 409, body: { ok: false, code: 'NO_SIGNIN_WAITING' } });
    await r.post('/signin', { member: M });
    assert.deepEqual(await r.post('/signin/code', { member: OTHER, code: GOOD_CODE }), { status: 409, body: { ok: false, code: 'NO_SIGNIN_WAITING' } },
      'a sign-in waits for its own member only');
    for (const code of ['', 'x'.repeat(2001), 'a\nb', 'a\rb', 'a\tb', 'a\u0000b', 'a\u007fb', 'a\u0085b', 42, null, undefined])
      assert.deepEqual(await r.post('/signin/code', { member: M, code }), { status: 400, body: { ok: false, code: 'BAD_CODE' } }, JSON.stringify(code));
    assert.equal(r.signin.waiting.member, M, 'a bad code keeps the waiting sign-in');
    assert.ok(codeOk('x'.repeat(2000)) && codeOk('é#ü'));
    assert.deepEqual(await r.post('/signin/code', { member: M, code: GOOD_CODE }), { status: 200, body: { ok: true, connected: true, member: M } });
    assert.ok(existsSync(creds(r)), 'the binary stored the sign-in where it runs');
    assert.deepEqual(await r.post('/signin/code', { member: M, code: GOOD_CODE }), { status: 409, body: { ok: false, code: 'NO_SIGNIN_WAITING' } },
      'a sign-in takes one code');
  } finally { await r.stop(); }
  // refused: the binary's words, never the code; then nothing more is typed to it
  const refused = await startRunner(stubSdk(async () => success()).sdk, { mode: 'refuses' });
  try {
    await refused.post('/signin', { member: M });
    const a = await refused.post('/signin/code', { member: M, code: GOOD_CODE });
    assert.equal(a.status, 409);
    assert.equal(a.body.code, 'SIGNIN_REFUSED');
    assert.match(a.body.detail, /Login failed/);
    assert.ok(!a.body.detail.includes(GOOD_CODE) && !a.body.detail.includes(GOOD_CODE.split('#')[0]), 'the code is never in the detail');
    assert.ok(a.body.detail.length <= 300);
    assert.equal((await refused.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
    assert.ok(!existsSync(creds(refused)));
  } finally { await refused.stop(); }
  // the binary's own "Invalid code" (no `#`) is its outcome too: the sign-in ends
  const invalid = await startRunner(stubSdk(async () => success()).sdk);
  try {
    await invalid.post('/signin', { member: M });
    const a = await invalid.post('/signin/code', { member: M, code: 'no-state-part' });
    assert.equal(a.body.code, 'SIGNIN_REFUSED');
    assert.match(a.body.detail, /Invalid code/);
    assert.equal((await invalid.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
  } finally { await invalid.stop(); }
  // no outcome reported: refused once the outcome wait ends
  const hangs = await startRunner(stubSdk(async () => success()).sdk, { mode: 'hangs', waits: { outcome: 300 } });
  try {
    await hangs.post('/signin', { member: M });
    const a = await hangs.post('/signin/code', { member: M, code: GOOD_CODE });
    assert.equal(a.body.code, 'SIGNIN_REFUSED');
    assert.match(a.body.detail, /no outcome/);
  } finally { await hangs.stop(); }
  // a sign-in waits for its code at most its wait (10 minutes; shortened here), then is ended
  const late = await startRunner(stubSdk(async () => success()).sdk, { waits: { code: 200 } });
  try {
    await late.post('/signin', { member: M });
    const proc = late.signin.waiting.proc;
    await until(() => late.signin.waiting === null);
    await until(() => proc.exitCode !== null || proc.signalCode !== null);
    assert.equal((await late.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
  } finally { await late.stop(); }
});

test('R19 POST /signin/state answers connected from the binary\'s own report, for this member only', async () => {
  const r = await startRunner(stubSdk(async () => success()).sdk);
  try {
    await sharedRefusals(r, '/signin/state');
    assert.deepEqual(await r.post('/signin/state', { member: M }), { status: 200, body: { ok: true, connected: false, member: M } });
    await signedIn(r);
    assert.deepEqual(await r.post('/signin/state', { member: M }), { status: 200, body: { ok: true, connected: true, member: M } });
    assert.deepEqual(r.claude.runs().at(-1).args, STATUS_ARGS, 'learned from the binary\'s report');
    assert.deepEqual(await r.post('/signin/state', { member: OTHER }), { status: 200, body: { ok: true, connected: false, member: OTHER } },
      'another member\'s sign-in is not theirs');
    // the instance's disk no longer holding it (a sleep): not connected
    rmSync(creds(r));
    assert.deepEqual(await r.post('/signin/state', { member: M }), { status: 200, body: { ok: true, connected: false, member: M } });
  } finally { await r.stop(); }
});

test('R20 POST /signout ends a waiting sign-in and has the binary remove the stored sign-in by its own logout', async () => {
  const r = await startRunner(stubSdk(async () => success()).sdk);
  try {
    await sharedRefusals(r, '/signout');
    assert.deepEqual(await r.post('/signout', { member: M }), { status: 200, body: { ok: true, connected: false, member: M } }, 'also when none was held');
    await signedIn(r);
    assert.deepEqual(await r.post('/signout', { member: M }), { status: 200, body: { ok: true, connected: false, member: M } });
    assert.deepEqual(r.claude.runs().at(-1).args, LOGOUT_ARGS, 'the binary\'s own logout');
    assert.ok(!existsSync(creds(r)), 'the binary removed it');
    assert.equal((await r.post('/signin/state', { member: M })).body.connected, false);
    // a waiting sign-in for the member is ended
    await r.post('/signin', { member: M });
    const proc = r.signin.waiting.proc;
    assert.equal((await r.post('/signout', { member: M })).status, 200);
    assert.equal(r.signin.waiting, null);
    await until(() => proc.exitCode !== null || proc.signalCode !== null);
    assert.equal((await r.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
  } finally { await r.stop(); }
  const fails = await startRunner(stubSdk(async () => success()).sdk, { mode: 'logout-fails' });
  try {
    await signedIn(fails);
    const a = await fails.post('/signout', { member: M });
    assert.equal(a.status, 502);
    assert.equal(a.body.code, 'SIGNOUT_FAILED');
    assert.equal((await fails.post('/signin/state', { member: M })).body.connected, true, 'a failed logout leaves it held, and says so');
  } finally { await fails.stop(); }
});

test('R21 an instance holds one member\'s sign-in and serves only that member; every other step naming another is refused', async () => {
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  try {
    await signedIn(r);
    assert.deepEqual(JSON.parse(readFileSync(join(r.signinRoot, 'member'), 'utf8')), { member: M }, 'the record: a member id, never a secret');
    const before = r.claude.runs().length;
    const refused = { ok: false, code: 'NOT_THIS_MEMBER' };
    assert.deepEqual(await r.post('/signin', { member: OTHER }), { status: 409, body: refused });
    assert.deepEqual(await r.post('/signin/code', { member: OTHER, code: GOOD_CODE }), { status: 409, body: refused });
    assert.deepEqual(await r.post('/signout', { member: OTHER }), { status: 409, body: refused });
    assert.equal(r.claude.runs().length, before, 'nothing runs for another member');
    assert.ok(existsSync(creds(r)), 'another member\'s sign-out touches nothing');
    const { final } = await conversation(r.base, signinReq(OTHER));
    assert.deepEqual({ ok: final.ok, code: final.code }, { ok: false, code: 'NOT_THIS_MEMBER' });
    assert.equal(calls.length, 0);
    // R20 clears the record; then another member may sign in
    await r.post('/signout', { member: M });
    assert.ok(!existsSync(join(r.signinRoot, 'member')));
    await signedIn(r, OTHER);
    assert.equal((await r.post('/signin/state', { member: OTHER })).body.connected, true);
    assert.equal((await r.post('/signin/state', { member: M })).body.connected, false);
  } finally { await r.stop(); }
});

test('R2 a signin conversation runs under the stored sign-in made for its member, with neither credential variable', async () => {
  let during = null;
  const { calls, sdk } = stubSdk(async (call) => { during = existsSync(join(call.options.env.CLAUDE_CONFIG_DIR, '.credentials.json')); return success(); });
  const r = await startRunner(sdk);
  try {
    // none made: NOT_SIGNED_IN, nothing started
    let { final } = await conversation(r.base, signinReq());
    assert.deepEqual({ ok: final.ok, code: final.code }, { ok: false, code: 'NOT_SIGNED_IN' });
    for (const credential of [{ kind: 'signin' }, { kind: 'signin', member: '' }, { kind: 'signin', member: 7 }, { kind: 'signin', secret: 'x' }]) {
      ({ final } = await conversation(r.base, request({ credential })));
      assert.equal(final.code, 'NO_CREDENTIAL', JSON.stringify(credential));
    }
    assert.equal(calls.length, 0);
    await signedIn(r);
    ({ final } = await conversation(r.base, signinReq()));
    assert.equal(final.ok, true);
    const env = calls[0].options.env;
    assert.equal(env.CLAUDE_CONFIG_DIR, r.signin.configDir, 'the stored sign-in\'s own directory');
    assert.ok(!('CLAUDE_CODE_OAUTH_TOKEN' in env) && !('ANTHROPIC_API_KEY' in env), 'neither variable');
    assert.equal(during, true);
    assert.ok(env.HOME.startsWith(r.tmpRoot) && env.TMPDIR.startsWith(r.tmpRoot) && calls[0].options.cwd.startsWith(r.tmpRoot));
    const { mcpServers, abortController, ...passedOptions } = calls[0].options;
    assert.ok(!JSON.stringify(passedOptions).includes(STORED), 'the module passes nothing of the stored sign-in');
    // the instance's disk no longer holding it: NOT_SIGNED_IN
    rmSync(creds(r));
    ({ final } = await conversation(r.base, signinReq()));
    assert.deepEqual({ ok: final.ok, code: final.code }, { ok: false, code: 'NOT_SIGNED_IN' });
    assert.equal(calls.length, 1);
  } finally { await r.stop(); }
});

test('R8 a stubbed binary\'s sentinel sign-in and sentinel code are in no answer, relay, error or log line; the sign-in in no file but the binary\'s', async () => {
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  const answers = [];
  const { sdk } = stubSdk(async (call, { callTool }) => { await callTool('search', { q: 'x' }); throw new Error('401 from the API'); });
  const r = await startRunner(sdk);
  const refused = await startRunner(stubSdk(async () => success()).sdk, { mode: 'refuses' });
  console.log = console.error = console.warn = (...a) => { logged.push(a.join(' ')); };
  process.stdout.write = process.stderr.write = (s) => { logged.push(String(s)); return true; };
  let files = [];
  try {
    for (const [x, path, body] of [[r, '/signin', { member: M }], [r, '/signin/code', { member: M, code: GOOD_CODE }], [r, '/signin/state', { member: M }],
      [refused, '/signin', { member: M }], [refused, '/signin/code', { member: M, code: GOOD_CODE }]]) answers.push(await x.post(path, body));
    answers.push((await conversation(r.base, signinReq())).frames);
    answers.push((await conversation(r.base, signinReq(OTHER))).frames);
    answers.push(await r.post('/signout', { member: OTHER }));
    files = [...filesUnder(r.signinRoot), ...filesUnder(r.tmpRoot), ...filesUnder(refused.signinRoot)];
  } finally {
    Object.assign(console, { log: orig.log, error: orig.error, warn: orig.warn });
    process.stdout.write = orig.out; process.stderr.write = orig.err;
    await r.stop(); await refused.stop();
  }
  const out = JSON.stringify(answers) + logged.join('\n');
  assert.ok(answers[0].body.address && answers[1].body.connected && answers[5].some((f) => f.tool_use), 'the steps ran');
  for (const s of [STORED, GOOD_CODE, GOOD_CODE.split('#')[0]]) assert.ok(!out.includes(s), `${s.slice(0, 20)}… never leaves`);
  const holding = files.filter((f) => f.text.includes(STORED)).map((f) => f.path);
  assert.deepEqual(holding, [join(r.signin.configDir, '.credentials.json')], 'the sentinel sign-in is only where the binary wrote it');
  assert.ok(files.every((f) => !f.text.includes(GOOD_CODE.split('#')[0])), 'the code is in no file');
});

test('R9 a conversation of each kind leaves the instance\'s writable paths as they were, but for the sign-in\'s renewal', async () => {
  const { sdk } = stubSdk(async (call) => {
    const env = call.options.env;
    writeFileSync(join(env.HOME, 'notes'), 'x');
    writeFileSync(join(env.TMPDIR, 'scratch'), 'x');
    writeFileSync(join(call.options.cwd, 'work'), 'x');
    writeFileSync(join(env.CLAUDE_CONFIG_DIR, 'session-cache.json'), 'x');
    const credsFile = join(env.CLAUDE_CONFIG_DIR, '.credentials.json');
    if (existsSync(credsFile)) writeFileSync(credsFile, JSON.stringify({ renewed: true }));   // the binary's renewal
    return success();
  });
  const r = await startRunner(sdk);
  try {
    await signedIn(r);
    const listing = () => [...filesUnder(r.signinRoot), ...filesUnder(r.tmpRoot)].map((f) => f.path).sort();
    const contents = () => Object.fromEntries(filesUnder(r.signinRoot).map((f) => [f.path, f.text]));
    for (const req of [request(), signinReq()]) {
      const paths0 = listing(), text0 = contents();
      const { final } = await conversation(r.base, req);
      assert.equal(final.ok, true);
      await until(() => readdirSync(r.tmpRoot).length === 0);
      assert.deepEqual(listing(), paths0, `${req.credential.kind}: the same paths after`);
      const changed = Object.keys(text0).filter((p) => contents()[p] !== text0[p]);
      assert.deepEqual(changed, req.credential.kind === 'signin' ? [creds(r)] : [], 'only the sign-in\'s renewal differs');
    }
  } finally { await r.stop(); }
});

test('R22 Claude Code runs as published: nothing written under its package after npm ci, no option or variable picks a sign-in method', async () => {
  const lines = read('../Dockerfile').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const ci = lines.findIndex((l) => /\bnpm\s+ci\b/.test(l));
  assert.ok(ci >= 0);
  for (const l of lines.slice(ci + 1)) {
    assert.match(l, /^(COPY|USER|EXPOSE|CMD|ENV|WORKDIR|LABEL)\b/, `${l}: no step after npm ci runs anything`);
    if (l.startsWith('COPY')) assert.ok(!/node_modules/.test(l), `${l}: writes nothing under node_modules`);
  }
  assert.ok(!lines.some((l) => /apt-get|apk |claude-agent-sdk/.test(l) && !/npm ci/.test(l)), 'nothing installed or changed for the sign-in');
  // the options and environment R1, R2 and R17 pass
  const PICKS = /^(CLAUDE_CODE_USE_|ANTHROPIC_AUTH_TOKEN$|ANTHROPIC_BASE_URL$|CLAUDE_CODE_OAUTH_REFRESH_TOKEN$|CLAUDE_CODE_OAUTH_SCOPES$|CLAUDE_CODE_OAUTH_CLIENT_ID$|CLAUDE_CODE_CUSTOM_OAUTH_URL$|CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST$|ANTHROPIC_UNIX_SOCKET$|CLAUDE_CODE_API_KEY_HELPER)/;
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  try {
    await conversation(r.base, request());
    await conversation(r.base, request({ credential: { kind: 'apikey', secret: 'sk-ant-api-x' } }));
    await signedIn(r);
    await conversation(r.base, signinReq());
    await r.post('/signin/state', { member: M });
    await r.post('/signout', { member: M });
    for (const c of calls) {
      for (const k of Object.keys(c.options.env)) assert.ok(!PICKS.test(k), `${k} picks a sign-in method`);
      assert.ok(!('settings' in c.options) && !('extraArgs' in c.options) && !('pathToClaudeCodeExecutable' in c.options),
        'no setting, argument or other binary');
      assert.deepEqual(c.options.settingSources, []);
    }
    const runs = r.claude.runs();
    assert.deepEqual([...new Set(runs.map((x) => x.args.join(' ')))].sort(), [LOGIN_ARGS, STATUS_ARGS, LOGOUT_ARGS].map((a) => a.join(' ')).sort());
    for (const x of runs) {
      for (const k of x.env) assert.ok(!PICKS.test(k) && k !== 'CLAUDE_CODE_OAUTH_TOKEN' && k !== 'ANTHROPIC_API_KEY', `${k} in the binary's environment`);
      assert.ok(!x.args.some((a) => /^--(console|claudeai|sso|email)/.test(a)), 'no login option selects a method');
    }
  } finally { await r.stop(); }
});

test('R23 fleet-member.json states terms: AT-14\'s two conditions, its page, who_agrees null; no text says the terms allow the sign-in', () => {
  const m = readManifest();
  assert.deepEqual(Object.keys(m.terms), ['condition', 'source', 'who_agrees']);
  assert.equal(m.terms.source, 'https://code.claude.com/docs/en/legal-and-compliance');
  assert.equal(m.terms.who_agrees, null, 'U-7 (d) is open');
  // the register's AT-14, quoted
  const register = read('../../build/terms/anthropic.md');
  const at14 = register.slice(register.indexOf('### AT-14'), register.indexOf('### AT-15'));
  const quoted = at14.split('\n').filter((l) => l.trim().startsWith('>')).map((l) => l.replace(/^\s*>\s?/, '')).join(' ')
    .replace(/\*\*/g, '').replace(/\s*\*\s*/g, ' ').replace(/\s+/g, ' ');
  assert.equal(m.terms.condition.length, 2);
  assert.match(m.terms.condition[0], /requires agreeing to our Commercial Terms of Service/);
  assert.match(m.terms.condition[1], /must not be modified.*may not remove, disable, or restrict any authentication method/);
  for (const c of m.terms.condition) assert.ok(quoted.includes(c.replace(/\s+/g, ' ')), `as the register quotes it: ${c.slice(0, 40)}…`);
  // DEC-156: no text of this module says Anthropic's terms allow the sign-in
  const ALLOWS = /terms\s+(allow|permit)|(allowed|permitted)\s+by\s+(anthropic|the terms)|anthropic\s+(allows|permits)/i;
  for (const f of ['../fleet-member.json', '../Dockerfile', '../wrangler.jsonc', '../src/signin.mjs', '../src/entry.mjs', '../src/runner.mjs',
    '../src/worker.mjs', '../src/env.mjs', '../package.json']) assert.ok(!ALLOWS.test(read(f)), f);
});
