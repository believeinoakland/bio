import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { stubSdk, success, request, startRunner, conversation, filesUnder, until } from './helpers.mjs';
import { TOKEN, GOOD_CODE, ADDRESS } from './stubs/claude-values.mjs';
import { readManifest } from '../src/manifest.mjs';
import { SETUP_ARGS, COLUMNS, anthropicAddress, codeOk, tokenIn, addressIn } from '../src/signin.mjs';
import { screen } from '../src/screen.mjs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const M = 'member-7d1e', OTHER = 'member-0b42';
const runner = (mode, waits) => startRunner(stubSdk(async () => success()).sdk, { mode, waits });
// R31's words: for the member, never the machinery's names, and never a place.
const PLACE = /oakland|alameda|california|\bbay area\b/i;
const MACHINERY = /\binstance\b|\bcontainer\b/i;
function memberWords(body, what) {
  assert.equal(typeof body.trace, 'string', `${what}: trace`);
  assert.ok(body.trace.length > 0);
  assert.equal(typeof body.detail, 'string', `${what}: detail`);
  assert.ok(body.detail.length > 0 && body.detail.length <= 300, `${what}: detail at most 300 characters`);
  assert.ok(!PLACE.test(body.detail) && !MACHINERY.test(body.detail), `${what}: ${body.detail}`);
}

// Every refusal R17–R20 share before anything starts: a body not JSON, a malformed member.
const BAD_BODIES = ['not json', '[1]', '"x"', 'null'];
const BAD_MEMBERS = [undefined, '', 42, null, 'x'.repeat(201), ['m']];
async function sharedRefusals(r, path, extra = {}) {
  for (const b of BAD_BODIES) {
    const a = await r.post(path, b);
    assert.deepEqual([a.status, a.body.code], [400, 'BAD_REQUEST'], `${path} ${b}`);
    memberWords(a.body, `${path} BAD_REQUEST`);
  }
  for (const member of BAD_MEMBERS) {
    const a = await r.post(path, { member, ...extra });
    assert.deepEqual([a.status, a.body.code], [400, 'BAD_MEMBER'], `${path} ${member}`);
    memberWords(a.body, `${path} BAD_MEMBER`);
  }
}

test('R17 R27 POST /signin runs the binary\'s own setup-token in a wide terminal and answers the address it states, unchanged, with an attempt', async () => {
  const r = await runner();
  try {
    await sharedRefusals(r, '/signin');
    assert.deepEqual(r.claude.runs(), [], 'no refusal starts the binary');
    const a = await r.post('/signin', { member: M });
    assert.equal(a.status, 200);
    assert.equal(a.body.ok, true);
    assert.equal(a.body.address, ADDRESS, 'the address as the binary states it, its terminal escapes aside');
    assert.match(a.body.attempt, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    const [run] = r.claude.runs();
    assert.deepEqual(run.args, SETUP_ARGS, 'the binary\'s own setup-token, with no option');
    assert.deepEqual(SETUP_ARGS, ['setup-token']);
    assert.equal(run.tty, true, 'it runs in a terminal (util-linux script)');
    assert.equal(run.columns, COLUMNS, 'a terminal wide enough that neither the address nor the token wraps');
    assert.equal(r.signin.waiting.member, M);
    // a second start ends the waiting attempt and starts a new one
    const first = r.signin.waiting.proc;
    const b = await r.post('/signin', { member: M });
    assert.equal(b.status, 200);
    assert.notEqual(b.body.attempt, a.body.attempt);
    assert.notEqual(r.signin.waiting.proc, first);
    await until(() => first.exitCode !== null || first.signalCode !== null);
    // a member at the boundary (200 characters) is taken
    await r.post('/signout', { member: M });
    assert.equal((await r.post('/signin', { member: 'm'.repeat(200) })).status, 200);
  } finally { await r.stop(); }
});

test('R17 R31 an address not https: on an Anthropic sign-in host is never answered; no address in time, or an exit, is SIGNIN_UNAVAILABLE naming its arm', async () => {
  for (const mode of ['foreign', 'plain-http']) {
    const r = await runner(mode);
    try {
      const a = await r.post('/signin', { member: M });
      assert.deepEqual([a.status, a.body.code], [502, 'SIGNIN_ADDRESS_UNEXPECTED'], mode);
      assert.ok(!('address' in a.body) && !JSON.stringify(a.body).includes('example.test'), 'no address answered');
      memberWords(a.body, mode);
      assert.equal(r.signin.waiting, null, 'the sign-in is ended');
      assert.equal((await r.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
    } finally { await r.stop(); }
  }
  for (const ok of ['https://claude.ai/oauth/authorize?a=1', 'https://claude.com/cai/oauth/authorize', 'https://platform.claude.com/oauth',
    'https://console.anthropic.com/x', 'https://anthropic.com/']) assert.equal(anthropicAddress(ok), true, ok);
  for (const bad of ['http://claude.ai/', 'https://claude.ai.evil.test/', 'https://evilclaude.ai/', 'https://user@claude.ai/', 'https://claude.ai:8443/',
    'javascript:alert(1)', 'not a url', 'https://anthropic.com.example/']) assert.equal(anthropicAddress(bad), false, bad);
  const details = new Set();
  const silent = await runner('silent', { address: 300 });
  try {
    const a = await silent.post('/signin', { member: M });
    assert.deepEqual([a.status, a.body.code], [502, 'SIGNIN_UNAVAILABLE']);
    assert.match(a.body.detail, /no address within 30 seconds/);
    memberWords(a.body, 'silent'); details.add(a.body.detail);
    assert.equal(silent.signin.waiting, null);
  } finally { await silent.stop(); }
  const exits = await runner('exits');
  try {
    const a = await exits.post('/signin', { member: M });
    assert.deepEqual([a.status, a.body.code], [502, 'SIGNIN_UNAVAILABLE']);
    assert.match(a.body.detail, /stopped before it gave an address/);
    assert.ok(!('address' in a.body));
    memberWords(a.body, 'exits'); details.add(a.body.detail);
  } finally { await exits.stop(); }
  // the third arm: no binary in the image
  const none = await runner();
  try {
    const { signinOf } = await import('../src/signin.mjs');
    const s = signinOf({ root: none.signinRoot, binary: null });
    const a = await s.start(M);
    assert.deepEqual([a.status, a.body.code], [502, 'SIGNIN_UNAVAILABLE']);
    assert.match(a.body.detail, /Claude Code is missing/);
    details.add(a.body.detail);
    assert.equal(a.log.binary_present, false);
  } finally { await none.stop(); }
  assert.equal(details.size, 3, 'each arm says which it is');
});

test('R18 R27 POST /signin/code types the code once, ended by a carriage return, and answers the token the binary prints, once', async () => {
  const r = await runner();
  try {
    await sharedRefusals(r, '/signin/code', { code: GOOD_CODE });
    const none = await r.post('/signin/code', { member: M, code: GOOD_CODE });
    assert.deepEqual([none.status, none.body.code], [409, 'NO_SIGNIN_WAITING']);
    memberWords(none.body, 'NO_SIGNIN_WAITING');
    const s = await r.post('/signin', { member: M });
    for (const code of ['', 'x'.repeat(2001), 'a\nb', 'a\rb', 'a\tb', 'a\u0000b', 'a\u007fb', 'a\u0085b', 42, null, undefined]) {
      const a = await r.post('/signin/code', { member: M, code, attempt: s.body.attempt });
      assert.deepEqual([a.status, a.body.code], [400, 'BAD_CODE'], JSON.stringify(code));
      memberWords(a.body, 'BAD_CODE');
    }
    assert.equal(r.signin.waiting.member, M, 'a bad code keeps the waiting attempt');
    assert.ok(codeOk('x'.repeat(2000)) && codeOk('é#ü'));
    const a = await r.post('/signin/code', { member: M, code: GOOD_CODE, attempt: s.body.attempt });
    assert.equal(a.status, 200);
    const { trace, trace_detail, ...rest } = a.body;
    assert.deepEqual(rest, { ok: true, connected: true, member: M, attempt: s.body.attempt, token: TOKEN, valid_for: '1 year' });
    assert.equal(JSON.stringify(a.body).split(TOKEN).length - 1, 1, 'the token exactly once');
    assert.equal(r.signin.waiting, null, 'the binary\'s process is ended');
    const again = await r.post('/signin/code', { member: M, code: GOOD_CODE });
    assert.equal(again.body.code, 'NO_SIGNIN_WAITING', 'an attempt takes one code');
    assert.ok(!JSON.stringify(again.body).includes(TOKEN));
  } finally { await r.stop(); }
  // the token wrapped across lines and coloured: joined, as the screen shows it
  const wrapped = await runner('wrapped');
  try {
    await wrapped.post('/signin', { member: M });
    const a = await wrapped.post('/signin/code', { member: M, code: GOOD_CODE });
    assert.equal(a.body.token, TOKEN);
  } finally { await wrapped.stop(); }
  // the binary's screen, as the real one draws it: words by cursor moves, a cell not re-sent when it already shows
  assert.equal(screen('\x1b[2GPaste\x1b[8Gcode\r\n'), ' Paste code');
  assert.equal(screen('ab cXdz\r\x1b[4Gc\x1b[6Gde\r\n'), 'ab cXde', 'a cell not written keeps what it showed');
  assert.equal(screen('ab code\r\x1b[4Gc\x1b[6Gde\r\n'), 'ab code');
  assert.equal(addressIn(`\x1b[2GUse\x1b[6Gthe url below to sign in\r\n\x1b]8;id=a;${ADDRESS}\x07${ADDRESS}\x1b]8;;\x07\r\nPaste code here if prompted >`), ADDRESS);
  assert.equal(addressIn(`Use the url below to sign in\r\n${ADDRESS}\r\n`), null, 'not before its prompt is up');
  assert.deepEqual(tokenIn(`Your OAuth token (valid for 30 days):\r\n\x1b[33m${TOKEN}\x1b[39m\r\nStore this token securely.`), { token: TOKEN, valid_for: '30 days' });
});

test('R27 R18 a refused code, no token in time, or a token of another shape answers SIGNIN_REFUSED with no token', async () => {
  for (const [mode, code, words] of [['refuses', GOOD_CODE, /Claude did not accept the code \(OAuth error: Request failed/],
    ['ok', 'no-state-part', /OAuth error: Invalid code/], ['long-token', GOOD_CODE, /not with a token/], ['bad-token', GOOD_CODE, /not with a token/]]) {
    const r = await runner(mode);
    try {
      await r.post('/signin', { member: M });
      const a = await r.post('/signin/code', { member: M, code });
      assert.deepEqual([a.status, a.body.code], [409, 'SIGNIN_REFUSED'], mode);
      assert.ok(!('token' in a.body) && !('valid_for' in a.body), `${mode}: no token`);
      assert.match(a.body.detail, words, mode);
      assert.ok(!a.body.detail.includes(code.split('#')[0]) && !a.body.detail.includes(TOKEN), `${mode}: neither the code nor a token in the detail`);
      memberWords(a.body, mode);
      assert.equal(a.waiting, '0');
      assert.equal((await r.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING', 'nothing more is typed to it');
    } finally { await r.stop(); }
  }
  const hangs = await runner('hangs', { outcome: 300 });
  try {
    await hangs.post('/signin', { member: M });
    const a = await hangs.post('/signin/code', { member: M, code: GOOD_CODE });
    assert.equal(a.body.code, 'SIGNIN_REFUSED');
    assert.match(a.body.detail, /no answer within 60 seconds/);
  } finally { await hangs.stop(); }
  // an attempt waits for its code at most its wait (10 minutes; shortened here), then is ended
  const late = await runner('ok', { code: 200 });
  try {
    await late.post('/signin', { member: M });
    const proc = late.signin.waiting.proc;
    await until(() => late.signin.waiting === null);
    await until(() => proc.exitCode !== null || proc.signalCode !== null);
    assert.equal((await late.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
  } finally { await late.stop(); }
});

test('R31 a code naming another attempt than the waiting one is ATTEMPT_SUPERSEDED, typing nothing; the waiting attempt\'s code is typed', async () => {
  const r = await runner();
  try {
    const first = await r.post('/signin', { member: M });
    const second = await r.post('/signin', { member: M });
    const a = await r.post('/signin/code', { member: M, code: GOOD_CODE, attempt: first.body.attempt });
    assert.deepEqual([a.status, a.body.code], [409, 'ATTEMPT_SUPERSEDED']);
    memberWords(a.body, 'ATTEMPT_SUPERSEDED');
    assert.equal(a.waiting, '1', 'the waiting attempt is kept');
    assert.equal(r.signin.waiting.attempt, second.body.attempt);
    assert.equal(r.signin.waiting.typed, false, 'nothing typed');
    // control: the waiting attempt's code is typed
    const b = await r.post('/signin/code', { member: M, code: GOOD_CODE, attempt: second.body.attempt });
    assert.equal(b.status, 200);
    assert.equal(b.body.token, TOKEN);
  } finally { await r.stop(); }
});

test('R31 every sign-in answer carries trace and trace_detail; a caller\'s trace is kept', async () => {
  const r = await runner();
  try {
    const a = await r.post('/signin/state', { member: M }, { 'x-civicsmith-trace': 'tr-abc-1' });
    assert.equal(a.body.trace, 'tr-abc-1');
    assert.deepEqual(Object.keys(a.body.trace_detail).sort(), ['cold', 'ms', 'uptime_s']);
    assert.equal(a.body.trace_detail.cold, true, 'the first request this process served');
    const s = await r.post('/signin', { member: M });
    assert.match(s.body.trace, /^[0-9a-f-]{36}$/, 'minted when the caller sent none');
    assert.equal(s.body.trace_detail.cold, false);
    assert.equal(typeof s.body.trace_detail.waiting_age_s, 'number', 'while an attempt waits');
    for (const k of ['ms', 'uptime_s']) assert.ok(Number.isInteger(s.body.trace_detail[k]) && s.body.trace_detail[k] >= 0);
    const other = await r.post('/signin', { member: OTHER });
    assert.equal(other.body.code, 'NOT_THIS_MEMBER');
    memberWords(other.body, 'NOT_THIS_MEMBER');
  } finally { await r.stop(); }
});

test('R19 R27 POST /signin/state answers connected false and whether an attempt waits for the member; it runs nothing', async () => {
  const r = await runner();
  try {
    await sharedRefusals(r, '/signin/state');
    const pick = (a) => ({ status: a.status, ok: a.body.ok, connected: a.body.connected, waiting: a.body.waiting, member: a.body.member });
    assert.deepEqual(pick(await r.post('/signin/state', { member: M })), { status: 200, ok: true, connected: false, waiting: false, member: M });
    await r.post('/signin', { member: M });
    const ran = r.claude.runs().length;
    assert.deepEqual(pick(await r.post('/signin/state', { member: M })), { status: 200, ok: true, connected: false, waiting: true, member: M });
    assert.deepEqual(pick(await r.post('/signin/state', { member: OTHER })), { status: 200, ok: true, connected: false, waiting: false, member: OTHER });
    assert.equal(r.claude.runs().length, ran, 'state runs nothing');
    await r.post('/signin/code', { member: M, code: GOOD_CODE });
    const after = await r.post('/signin/state', { member: M });
    assert.deepEqual(pick(after), { status: 200, ok: true, connected: false, waiting: false, member: M }, 'connected is credentials\', never this instance\'s');
    assert.ok(!JSON.stringify(after.body).includes(TOKEN));
  } finally { await r.stop(); }
});

test('R20 R27 POST /signout ends a waiting attempt and answers connected false; it runs no logout', async () => {
  const r = await runner();
  try {
    await sharedRefusals(r, '/signout');
    const pick = (a) => [a.status, a.body.ok, a.body.connected, a.body.member];
    assert.deepEqual(pick(await r.post('/signout', { member: M })), [200, true, false, M], 'also when none waits');
    await r.post('/signin', { member: M });
    const proc = r.signin.waiting.proc;
    const runs = r.claude.runs().length;
    assert.deepEqual(pick(await r.post('/signout', { member: M })), [200, true, false, M]);
    assert.equal(r.signin.waiting, null);
    await until(() => proc.exitCode !== null || proc.signalCode !== null);
    assert.equal(r.claude.runs().length, runs, 'no logout is run: nothing is stored');
    assert.equal((await r.post('/signin/code', { member: M, code: GOOD_CODE })).body.code, 'NO_SIGNIN_WAITING');
  } finally { await r.stop(); }
});

test('R21 R27 an instance keeps nothing but the attempt waiting; NOT_THIS_MEMBER means only that another member\'s attempt waits', async () => {
  const r = await runner();
  try {
    await r.post('/signin', { member: M });
    const before = r.claude.runs().length;
    for (const [path, body] of [['/signin', { member: OTHER }], ['/signin/code', { member: OTHER, code: GOOD_CODE }], ['/signout', { member: OTHER }]]) {
      const a = await r.post(path, body);
      assert.deepEqual([a.status, a.body.code], [409, 'NOT_THIS_MEMBER'], path);
    }
    assert.equal(r.claude.runs().length, before, 'nothing runs for another member');
    assert.equal(r.signin.waiting.member, M, 'and the waiting attempt is kept');
    await r.post('/signin/code', { member: M, code: GOOD_CODE });
    // nothing kept: the attempt's own directory is gone, and another member may sign in at once
    await until(() => readdirSync(r.signinRoot).length === 0);
    assert.equal((await r.post('/signin', { member: OTHER })).status, 200);
    await r.post('/signout', { member: OTHER });
    await until(() => readdirSync(r.signinRoot).length === 0);
  } finally { await r.stop(); }
});

test('R8 R27 the token is in the code answer only: in no log line, file, other answer, state or signout answer; the code is in none', async () => {
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  const r = await runner('echo');
  const answers = [];
  let tokenAnswer = null, files = [];
  console.log = console.error = console.warn = (...a) => { logged.push(a.join(' ')); };
  process.stdout.write = (s, ...a) => { logged.push(String(s)); return orig.out.call(process.stdout, s, ...a); };
  process.stderr.write = (s, ...a) => { logged.push(String(s)); return orig.err.call(process.stderr, s, ...a); };
  try {
    answers.push(await r.post('/signin', { member: M }));
    answers.push(await r.post('/signin/state', { member: M }));
    tokenAnswer = await r.post('/signin/code', { member: M, code: GOOD_CODE });
    answers.push(await r.post('/signin/state', { member: M }));
    answers.push(await r.post('/signout', { member: M }));
    answers.push(await r.post('/signin/code', { member: M, code: GOOD_CODE }));
    answers.push((await conversation(r.base, request({ credential: { kind: 'signin', member: M } }))).frames);
    files = [...filesUnder(r.signinRoot), ...filesUnder(r.tmpRoot)];
  } finally {
    Object.assign(console, { log: orig.log, error: orig.error, warn: orig.warn });
    process.stdout.write = orig.out; process.stderr.write = orig.err;
    await r.stop();
  }
  assert.equal(tokenAnswer.body.token, TOKEN, 'the code answer carries it');
  const out = JSON.stringify(answers) + logged.join('\n') + JSON.stringify(r.lines);
  for (const s of [TOKEN, GOOD_CODE, GOOD_CODE.split('#')[0]]) assert.ok(!out.includes(s), `${s.slice(0, 24)}… is in no other answer or line`);
  assert.ok(!JSON.stringify(tokenAnswer.body).includes(GOOD_CODE.split('#')[0]), 'the code is not in the token\'s answer either');
  assert.ok(files.every((f) => !f.text.includes(TOKEN) && !f.text.includes(GOOD_CODE.split('#')[0])), 'nor in any file');
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
  // the options and environment R1, R2 (R28) and R17 (R27) pass
  const PICKS = /^(CLAUDE_CODE_USE_|ANTHROPIC_AUTH_TOKEN$|ANTHROPIC_BASE_URL$|CLAUDE_CODE_OAUTH_REFRESH_TOKEN$|CLAUDE_CODE_OAUTH_SCOPES$|CLAUDE_CODE_OAUTH_CLIENT_ID$|CLAUDE_CODE_CUSTOM_OAUTH_URL$|CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST$|ANTHROPIC_UNIX_SOCKET$|CLAUDE_CODE_API_KEY_HELPER)/;
  const { calls, sdk } = stubSdk(async () => success());
  const r = await startRunner(sdk);
  try {
    await r.post('/signin', { member: M });
    await r.post('/signin/code', { member: M, code: GOOD_CODE });
    await conversation(r.base, request());
    await r.post('/signin/state', { member: M });
    await r.post('/signout', { member: M });
    for (const c of calls) {
      // the held token is AT-22's own way to use the token setup-token mints; it removes no method
      for (const k of Object.keys(c.options.env)) assert.ok(!PICKS.test(k), `${k} picks a sign-in method`);
      assert.ok(!('settings' in c.options) && !('extraArgs' in c.options) && !('pathToClaudeCodeExecutable' in c.options),
        'no setting, argument or other binary');
      assert.deepEqual(c.options.settingSources, []);
    }
    const runs = r.claude.runs();
    assert.deepEqual([...new Set(runs.map((x) => x.args.join(' ')))], [SETUP_ARGS.join(' ')], 'the binary\'s own setup-token alone (AT-22)');
    for (const x of runs) {
      for (const k of x.env) assert.ok(!PICKS.test(k) && k !== 'CLAUDE_CODE_OAUTH_TOKEN' && k !== 'ANTHROPIC_API_KEY', `${k} in the binary's environment`);
      assert.ok(!x.args.some((a) => /^--/.test(a)), 'no option selects a method');
    }
  } finally { await r.stop(); }
});

test('R23 fleet-member.json states terms: AT-14\'s two conditions, its page, who_agrees null; no text says the terms allow the sign-in, U-7 settled by K3061', () => {
  const m = readManifest();
  assert.deepEqual(Object.keys(m.terms), ['condition', 'source', 'who_agrees']);
  assert.equal(m.terms.source, 'https://code.claude.com/docs/en/legal-and-compliance');
  assert.equal(m.terms.who_agrees, null);
  // the register's AT-14, quoted
  const register = read('../../build/terms/anthropic.md');
  const at14 = register.slice(register.indexOf('### AT-14'), register.indexOf('### AT-15'));
  const quoted = at14.split('\n').filter((l) => l.trim().startsWith('>')).map((l) => l.replace(/^\s*>\s?/, '')).join(' ')
    .replace(/\*\*/g, '').replace(/\s*\*\s*/g, ' ').replace(/\s+/g, ' ');
  assert.equal(m.terms.condition.length, 2);
  assert.match(m.terms.condition[0], /requires agreeing to our Commercial Terms of Service/);
  assert.match(m.terms.condition[1], /must not be modified.*may not remove, disable, or restrict any authentication method/);
  for (const c of m.terms.condition) assert.ok(quoted.includes(c.replace(/\s+/g, ' ')), `as the register quotes it: ${c.slice(0, 40)}…`);
  assert.match(m.note, /K3061/, 'the note cites Bob\'s ruling, not an open U-7');
  assert.ok(!/U-7 \(d\) is open|U-7 \(a\)-\(d\) open/.test(m.note));
  const ALLOWS = /terms\s+(allow|permit)|(allowed|permitted)\s+by\s+(anthropic|the terms)|anthropic\s+(allows|permits)/i;
  for (const f of ['../fleet-member.json', '../Dockerfile', '../wrangler.jsonc', '../src/signin.mjs', '../src/entry.mjs', '../src/runner.mjs',
    '../src/worker.mjs', '../src/env.mjs', '../src/screen.mjs', '../src/waits.mjs', '../package.json']) assert.ok(!ALLOWS.test(read(f)), f);
});
