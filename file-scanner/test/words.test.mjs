// Words for members (R32; T48-7, N1010, DEC-200 (5)): every text this member serves that a screen may show a member
// says "safe view" for what a rebuilding tool or the renderer gives, and never "safe copy", "safe-copy maker" or
// "safe-view maker"; the kind tokens, codes, field names and LOG_COUNT_KINDS' keys are interface and unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/handler.mjs';
import { PROVIDERS } from '../src/providers/catalogue.mjs';
import { KINDS } from '../src/providers/descriptor.mjs';
import { LOG_COUNT_KINDS } from '../src/limits.mjs';
import { memoryBucket, putCapture, depsWith, post, enc, EICAR, NOW } from './helpers.mjs';
import { vendorNet, vendorSockets, specs } from './vendors.mjs';

// The three refused terms, in any case, spaced or hyphenated, singular or plural. An underscore joins an interface
// key (`safe_copies`), which is not a word a member reads.
const REFUSED = /\bsafe[- ]cop(?:y|ies)\b|\bsafe[- ]view[- ]makers?\b/i;

/** Every text value in an answer, at any depth (keys are field names, interface). */
function texts(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) for (const x of v) texts(x, out);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) texts(x, out);
  return out;
}
const refusedIn = (strings) => strings.filter((s) => REFUSED.test(s));

/** A bucket holding a mirror's state and a reputation list's, so /version states each, errors included. */
function stocked() {
  const bucket = memoryBucket();
  const published = new Date(NOW - 3_600_000).toISOString();
  bucket.objects.set('clamav/current.json', enc(JSON.stringify({ set: 'r1', published, mirrored_at: published,
    files: { 'main.cvd': { key: 'clamav/sets/r1/main.cvd', version: '62', build_time: published } } })));
  bucket.objects.set('clamav/state.json', enc(JSON.stringify({ last_attempt: published, last_error: 'REFUSED:daily.cvd:403' })));
  bucket.objects.set('reputation/gwr-1/state.json', enc(JSON.stringify({ lists: {}, list_version: 'abc', fetched_at: published, last_error: 'LIST_CHECKSUM_MISMATCH:MALWARE' })));
  return bucket;
}

/** What the member serves: GET /providers and /version whole, every route's refusals, every tool's test probe. */
async function served() {
  const answers = [];
  const keep = async (r) => { answers.push([...r.headers.values()], await r.json()); };
  const deps = depsWith({ bucket: stocked() });
  await keep(await handle(new Request('https://file-scanner/providers'), deps));
  await keep(await handle(new Request('https://file-scanner/version'), deps));
  await keep(await handle(new Request('https://file-scanner/elsewhere'), deps));
  for (const path of ['/scan', '/render', '/mirror', '/provider/scan', '/provider/sandbox', '/provider/sandbox/result', '/provider/cdr',
    '/provider/reputation', '/provider/refresh', '/provider/forward', '/provider/test']) {
    await keep(await handle(post(path, {}), depsWith({ bucket: null })));
    await keep(await handle(post(path, { store: 'bio', target: { capture_sha: 'x' }, tool: { provider_id: 'nobody' } }), deps));
  }
  const net = vendorNet();
  const sockets = vendorSockets();
  const w = depsWith({ bucket: memoryBucket(), fetch: net.fetch, connect: sockets.connect, vpc: { fetch: net.fetch, connect: sockets.connect } });
  const s = specs();
  for (const d of PROVIDERS) {
    const spec = s[d.provider_id];
    await keep(await handle(post('/provider/test', { tool: spec }), w));
    const wrong = Object.fromEntries(Object.keys(spec.credentials || {}).map((k) => [k, 'wrong']));
    await keep(await handle(post('/provider/test', { tool: { ...spec, credentials: wrong } }), w));
  }
  return answers;
}

test('R32 every text GET /providers, /version, the refusals and the test probes answer holds none of the three refused terms', async () => {
  const strings = texts(await served());
  assert.ok(strings.length > 500, 'the whole surface was read');
  assert.deepEqual(refusedIn(strings), []);
});

test('R32 control: a served string holding a refused term is caught; an interface key is not', () => {
  for (const s of ['a safe copy of the file', 'Safe-copy maker', 'the safe-view maker', 'SAFE COPIES', 'safe-view makers']) {
    assert.deepEqual(refusedIn(texts({ label: s })), [s], s);
  }
  for (const s of ['safe_copies', 'safe_views', 'a safe view', 'the file scanner', 'cdr']) assert.deepEqual(refusedIn([s]), [], s);
  // The scan reaches nested answers: a refused term deep in a descriptor's statement is found.
  assert.equal(refusedIn(texts({ offered: [{ handling: { file_retention: ['kept as a safe copy'] } }] })).length, 1);
});

test('R32 what a rebuilding tool gives is a "safe view" in the test probe\'s words', async () => {
  const net = vendorNet();
  let body = 'rebuilt by halo';
  // The stub's rebuilt file with nothing reported removed, then with no bytes at all.
  const fetch = async (req) => {
    const r = await net.fetch(req);
    if (new URL(req.url).hostname !== 'halo.example.org' || r.status !== 200) return r;
    return new Response(body, { status: 200, headers: { 'content-type': r.headers.get('content-type'), 'x-sanitisation-items': '[]' } });
  };
  const deps = depsWith({ fetch });
  const detail = async () => (await (await handle(post('/provider/test', { tool: specs()['glasswall-halo'] }), deps)).json()).detail;
  assert.equal(await detail(), 'the safe view reported nothing removed');
  body = '';
  assert.equal(await detail(), 'no safe view');
});

test('R32 the interface is unchanged: the kind token cdr, LOG_COUNT_KINDS\' safe_copies, the codes and field names', async () => {
  assert.ok(KINDS.includes('cdr'));
  assert.ok(LOG_COUNT_KINDS.includes('safe_copies') && LOG_COUNT_KINDS.includes('safe_views'));
  assert.deepEqual(PROVIDERS.filter((d) => d.kinds.includes('cdr')).map((d) => d.provider_id), ['opswat-deep-cdr', 'glasswall-halo']);
  const bucket = memoryBucket();
  const t = putCapture(bucket, EICAR);
  const r = await handle(post('/provider/cdr', { store: 'bio', target: t, tool: specs().scanii }), depsWith({ bucket }));
  assert.deepEqual(await r.json(), { ok: false, code: 'KIND_NOT_OFFERED', provider_id: 'scanii' });
  const v = await (await handle(new Request('https://file-scanner/version'), depsWith())).json();
  assert.deepEqual(v.bounds.LOG_COUNT_KINDS, [...LOG_COUNT_KINDS]);
});
