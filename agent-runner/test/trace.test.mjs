// R29: one JSON line per sign-in step and per conversation, never a code, token, secret, address, member id, body or
// header. R26: the server listens before the Agent SDK has loaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stubSdk, success, request, startRunner, conversation, MEMBER } from './helpers.mjs';
import { TOKEN, GOOD_CODE, ADDRESS } from './stubs/claude-values.mjs';
import { scrubSaid } from '../src/env.mjs';

const REF = 'mref-9c2a71';
const SECRET = 'sk-ant-oat01-CONVERSATION-SECRET-SENTINEL-8b1e';
const COMMON = ['event', 'trace', 'attempt', 'step', 'member_ref', 'outcome', 'status', 'ms', 'cold', 'uptime_s', 'binary_present'];
const keys = (l) => Object.keys(l).sort();

test('R29 each sign-in step writes exactly one line with the named fields, and none carries the code, token, address, member or a body', async () => {
  const r = await startRunner(stubSdk(async () => success()).sdk, { mode: 'echo' });
  const h = { 'x-civicsmith-trace': 'tr-29', 'x-civicsmith-member-ref': REF };
  try {
    const step = async (path, body, want) => {
      const n = r.lines.length;
      const a = await r.post(path, body, h);
      assert.equal(r.lines.length, n + 1, `${path}: exactly one line`);
      const l = r.lines.at(-1);
      assert.equal(l.event, 'signin.runner');
      assert.equal(l.trace, 'tr-29');
      assert.equal(l.member_ref, REF, 'the caller\'s reference, never the member id');
      assert.equal(l.status, a.status);
      for (const k of COMMON) assert.ok(k in l, `${path}: ${k}`);
      for (const k of want) assert.ok(k in l, `${path}: ${k}`);
      return { a, l };
    };
    const s = await step('/signin', { member: MEMBER }, ['address_host', 'ms_to_address']);
    assert.equal(s.l.step, 'start');
    assert.equal(s.l.outcome, 'ok');
    assert.equal(s.l.attempt, s.a.body.attempt);
    assert.equal(s.l.address_host, new URL(ADDRESS).hostname, 'the hostname only');
    assert.equal(s.l.binary_present, true);
    const st = await step('/signin/state', { member: MEMBER }, ['waiting']);
    assert.deepEqual([st.l.step, st.l.waiting], ['state', true]);
    const c = await step('/signin/code', { member: MEMBER, code: GOOD_CODE, attempt: s.a.body.attempt }, ['ms_to_outcome', 'waited_s']);
    assert.deepEqual([c.l.step, c.l.outcome, c.a.body.token], ['code', 'ok', TOKEN]);
    const o = await step('/signout', { member: MEMBER }, []);
    assert.equal(o.l.step, 'signout');
    const bad = await step('/signin/code', { member: MEMBER, code: GOOD_CODE }, []);
    assert.deepEqual([bad.l.outcome, bad.l.code], ['refused', 'NO_SIGNIN_WAITING']);
    const malformed = await step('/signin', 'not json', []);
    assert.deepEqual([malformed.l.outcome, malformed.l.code], ['refused', 'BAD_REQUEST']);
    // a refused code: the binary's last words, scrubbed
    await r.post('/signin', { member: MEMBER }, h);
    const refused = await step('/signin/code', { member: MEMBER, code: 'wrong-SENTINEL-CODE-7d#st' }, ['said_head']);
    assert.match(refused.l.said_head, /OAuth error/);
    assert.ok(refused.l.said_head.length <= 200);
    // without the headers: a trace minted, member_ref null
    await r.post('/signin/state', { member: MEMBER });
    assert.match(r.lines.at(-1).trace, /^[0-9a-f-]{36}$/);
    assert.equal(r.lines.at(-1).member_ref, null);
  } finally { await r.stop(); }
  const all = JSON.stringify(r.lines);
  for (const s of [TOKEN, GOOD_CODE, GOOD_CODE.split('#')[0], 'wrong-SENTINEL-CODE-7d', MEMBER, '/cai/oauth/authorize', 'client_id'])
    assert.ok(!all.includes(s), `${s.slice(0, 24)}… is in no line`);
  for (const l of r.lines) assert.deepEqual(keys(l).filter((k) => ![...COMMON, 'code', 'binary_exit', 'said_head', 'address_host', 'ms_to_address',
    'ms_to_outcome', 'waited_s', 'waiting'].includes(k)), [], 'no field but the named ones');
});

test('R29 each conversation writes one line: trace, member_ref, outcome, code, ms, num_turns; never the secret, prompt, system, tool content or result', async () => {
  const { sdk } = stubSdk(async (call, { callTool }) => { await callTool('search', { q: 'TOOL-INPUT-SENTINEL' }); return success({ result: 'RESULT-SENTINEL' }); });
  const r = await startRunner(sdk);
  try {
    const req = request({ credential: { kind: 'signin', member: MEMBER, secret: SECRET }, prompt: 'PROMPT-SENTINEL', system: 'SYSTEM-SENTINEL' });
    const got = await conversation(r.base, req, () => ({ content: 'TOOL-CONTENT-SENTINEL' }),
      { headers: { 'x-civicsmith-trace': 'tr-c1', 'x-civicsmith-member-ref': REF } });
    assert.equal(got.final.ok, true);
    assert.equal(r.lines.length, 1);
    assert.deepEqual(r.lines[0], { event: 'conversation.runner', trace: 'tr-c1', member_ref: REF, outcome: 'ok', ms: r.lines[0].ms, num_turns: 2 });
    assert.equal(typeof r.lines[0].ms, 'number');
    await conversation(r.base, request({ credential: { kind: 'signin', member: MEMBER } }));
    assert.deepEqual(r.lines[1], { event: 'conversation.runner', member_ref: null, outcome: 'refused', code: 'SIGNIN_NOT_HELD', ms: r.lines[1].ms, num_turns: null });
    await conversation(r.base, 'not json');
    assert.deepEqual([r.lines.length, r.lines[2].code], [3, 'BAD_REQUEST']);
  } finally { await r.stop(); }
  const all = JSON.stringify(r.lines);
  for (const s of [SECRET, 'PROMPT-SENTINEL', 'SYSTEM-SENTINEL', 'TOOL-INPUT-SENTINEL', 'TOOL-CONTENT-SENTINEL', 'RESULT-SENTINEL', MEMBER])
    assert.ok(!all.includes(s), `${s} is in no line`);
});

test('R29 the scrub removes the code, URL queries and anything token-shaped', () => {
  const said = scrubSaid('OAuth error for c0de-xyz#st at https://platform.claude.com/v1/oauth/token?code=abc&x=1 sk-ant-oat01-abc '
    + 'eyJhbGciOi.eyJzdWIi.sig and ' + 'A'.repeat(32) + ' end', ['c0de-xyz#st', 'c0de-xyz', 'st']);
  assert.ok(!said.includes('c0de-xyz') && !said.includes('code=abc') && !said.includes('sk-ant') && !said.includes('eyJ') && !said.includes('A'.repeat(32)));
  assert.match(said, /https:\/\/platform\.claude\.com\/v1\/oauth\/token /);
  assert.ok(scrubSaid('x'.repeat(500)).length <= 200);
});

test('R26 the server listens before the Agent SDK loads: /version and the sign-in routes answer; a conversation waits for it', async () => {
  let release;
  const { calls, sdk } = stubSdk(async () => success());
  const loading = new Promise((resolve) => { release = () => resolve(sdk); });
  const never = new Promise(() => {});
  const r = await startRunner(never);
  try {
    assert.equal((await fetch(`http://${r.base}/version`)).status, 200);
    const st = await r.post('/signin/state', { member: MEMBER });
    assert.deepEqual([st.status, st.body.ok], [200, true]);
    assert.equal((await r.post('/signin', { member: MEMBER })).status, 200);
  } finally { await r.stop(); }
  const later = await startRunner(loading);
  try {
    const pending = conversation(later.base, request());
    await new Promise((res) => setTimeout(res, 100));
    assert.equal(calls.length, 0, 'the conversation waits for the SDK');
    release();
    const { final } = await pending;
    assert.equal(final.ok, true);
    assert.equal(calls.length, 1);
  } finally { await later.stop(); }
  const rejected = Promise.reject(new Error('no module'));
  rejected.catch(() => {});                                   // as entry.mjs's main does
  const failing = await startRunner(rejected);
  try {
    const { final } = await conversation(failing.base, request());
    assert.deepEqual([final.ok, final.code], [false, 'SDK_ERROR']);
  } finally { await failing.stop(); }
});
