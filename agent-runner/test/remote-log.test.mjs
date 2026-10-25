// R39: the copy's own log, one line per step of a remote conversation and sign-in, driven here over a stub interface
// that counts its requests and the bytes each carried.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { remoteLog, REMOTE_STEPS, REMOTE_EVENT } from '../src/remote-log.mjs';

const S = {
  secret: 'sk-ant-oat01-SENTINELSECRET', code: 'SENTINELCODE#state', door: 'SENTINELDOORCREDENTIAL',
  prompt: 'SENTINEL-PROMPT', tool: 'SENTINEL-TOOL-CONTENT', answer: 'SENTINEL-ANSWER', header: 'SENTINEL-HEADER',
  session: 'session_SENTINELSESSIONID',
};
const FIELDS = ['event', 'trace', 'member_ref', 'conv', 'step', 'outcome', 'status', 'ms', 'bytes_in', 'bytes_out'];

// fixtures-own: harness a test-local harness counting its own calls (the interface this log writes to)
// A stub interface: each request answers its status and the bytes sent and received, and is counted.
function stubInterface() {
  const requests = [];
  const call = (what, sent, got, status = 200) => {
    requests.push(what);
    return { status, bytes_out: Buffer.byteLength(sent), bytes_in: Buffer.byteLength(got) };
  };
  return { requests, call };
}

// A sign-in and a conversation of `n` relays, each step through the log.
async function converse(n, lines) {
  const iface = stubInterface();
  const rl = remoteLog({ trace: 'tr-39', memberRef: 'mref-1', conv: 'conv-39', log: (l) => lines.push(l) });
  await rl.step('signin.start', async () => iface.call('start', JSON.stringify({ member: 'm' }), JSON.stringify({ address: 'https://claude.ai/x' })));
  await rl.step('signin.code', async () => iface.call('code', JSON.stringify({ code: S.code }), JSON.stringify({ token: S.secret })));
  await rl.step('create', async () => ({ ...iface.call('create', JSON.stringify({ secret: S.secret }), JSON.stringify({ id: S.session })), session: S.session }));
  await rl.step('prompt', async () => ({ ...iface.call('prompt', `${S.prompt} ${S.door}`, '{}'), session: S.session }));
  const sizes = [];
  for (let i = 0; i < n; i++) {
    const input = JSON.stringify({ q: `${S.tool}-${'x'.repeat(i * 7)}` }), result = `${S.tool}-${'y'.repeat(i * 11 + 3)}`;
    const r = await rl.step('tool', async () => ({ ...iface.call('tool', result, input), session: S.session }));
    sizes.push([r.bytes_in, r.bytes_out]);
  }
  await rl.step('answer', async () => ({ ...iface.call('answer', '{}', S.answer), session: S.session }));
  await rl.step('end', async () => ({ ...iface.call('end', '{}', '{}', 204), session: S.session }));
  return { iface, sizes };
}

test('R39 a conversation of N relays writes N tool lines with the stub\'s byte counts, and its lines equal the stub\'s request count', async () => {
  for (const n of [0, 1, 40]) {
    const lines = [];
    const { iface, sizes } = await converse(n, lines);
    assert.equal(lines.length, iface.requests.length, `n=${n}: one line per request, none missing`);
    assert.deepEqual(lines.map((l) => l.step), iface.requests.map((r) => ({ start: 'signin.start', code: 'signin.code' })[r] || r));
    const tools = lines.filter((l) => l.step === 'tool');
    assert.equal(tools.length, n);
    assert.deepEqual(tools.map((l) => [l.bytes_in, l.bytes_out]), sizes, 'the stub\'s byte counts');
    const ref = createHash('sha256').update(S.session).digest('hex').slice(0, 12);
    for (const l of lines) {
      assert.deepEqual(Object.keys(l).filter((k) => k !== 'session_ref'), FIELDS, 'the named fields, in order');
      assert.equal(l.event, REMOTE_EVENT);
      assert.ok(REMOTE_STEPS.includes(l.step));
      assert.deepEqual([l.trace, l.member_ref, l.conv, l.outcome], ['tr-39', 'mref-1', 'conv-39', 'ok']);
      assert.ok(Number.isInteger(l.ms) && l.ms >= 0);
      if (!l.step.startsWith('signin')) assert.equal(l.session_ref, ref, 'a digest prefix of the session id');
    }
    assert.equal(lines.find((l) => l.step === 'end').status, 204);
    const text = JSON.stringify(lines);
    for (const [k, v] of Object.entries(S)) assert.ok(!text.includes(v), `no ${k} is logged`);
    assert.ok(!text.includes('SENTINEL'), 'no sentinel of any kind');
  }
});

test('R39 a failed step still writes its one line, failed, with its code and nothing of its error\'s words; the step is rethrown', async () => {
  const lines = [];
  const rl = remoteLog({ trace: 'tr', conv: 'c', log: (l) => lines.push(l) });
  const err = Object.assign(new Error(`refused ${S.secret}`), { code: 'SIGNIN_TOKEN_REFUSED', status: 401, bytes_out: 120, bytes_in: 40 });
  await assert.rejects(rl.step('create', async () => { throw err; }), (e) => e === err);
  await assert.rejects(rl.step('tool', async () => { throw new Error(S.tool); }));
  assert.equal(lines.length, 2);
  assert.deepEqual({ ...lines[0], ms: 0 }, { event: REMOTE_EVENT, trace: 'tr', member_ref: null, conv: 'c', step: 'create',
    outcome: 'failed', code: 'SIGNIN_TOKEN_REFUSED', status: 401, ms: 0, bytes_in: 40, bytes_out: 120 });
  assert.equal(lines[1].code, 'REMOTE_UNAVAILABLE');
  assert.equal(lines[1].status, null);
  assert.ok(!JSON.stringify(lines).includes('SENTINEL'));
});

test('R39 a refusal the step answers is logged refused with its code; controls: an unknown step is refused and logs nothing, an unsafe trace or conversation name is replaced', async () => {
  const lines = [];
  const rl = remoteLog({ trace: `bad trace ${S.header}`, memberRef: S.header + '\n', conv: `c?${S.door}`, log: (l) => lines.push(l) });
  await rl.step('create', async () => ({ outcome: 'refused', code: 'REMOTE_LIMIT_REACHED', status: 429, bytes_out: 10, bytes_in: 5 }));
  assert.deepEqual([lines[0].outcome, lines[0].code, lines[0].status], ['refused', 'REMOTE_LIMIT_REACHED', 429]);
  assert.match(lines[0].trace, /^[0-9a-f-]{36}$/, 'a trace minted here');
  assert.match(lines[0].conv, /^[0-9a-f-]{36}$/, 'a conversation name minted here');
  assert.equal(lines[0].member_ref, null);
  await assert.rejects(rl.step('shell', async () => ({ status: 200 })), TypeError);
  assert.equal(lines.length, 1);
  assert.ok(!JSON.stringify(lines).includes('SENTINEL'));
});
