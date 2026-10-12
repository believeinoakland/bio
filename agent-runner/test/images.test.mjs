// R24 (T46; N852): a sign-in transcribes. A relay's tool_result holding an `image` block in `agent-model` R14's shape
// reaches the model as the MCP tool's image content, its media type and bytes unchanged, beside its text blocks in
// their order; any other image block is the tool's error naming the fault, its bytes never passed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { stubSdk, success, request, startRunner, conversation, filesUnder, until, MEMBER } from './helpers.mjs';

const READ_PAGE = { name: 'read_page', description: 'The page\'s picture', input_schema: { type: 'object', properties: { page: { type: 'integer' } } } };
const transcribe = (over = {}) => request({ tools: [READ_PAGE], prompt: 'Transcribe page 1.', ...over });
const png = (bytes) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), bytes]).toString('base64');
const image = (data, media_type = 'image/png') => ({ type: 'image', source: { type: 'base64', media_type, data } });

// One conversation whose model calls read_page once; resolves with what the SDK boundary received and the frames.
async function onePage(content, extra = {}) {
  const { calls, sdk } = stubSdk(async (call, { callTool }) => { await callTool('read_page', { page: 1 }); return success(); });
  const r = await startRunner(sdk, { signedIn: MEMBER });
  try {
    const relays = [];
    const got = await conversation(r.base, transcribe(), (tu) => { relays.push(tu); return { content, ...extra }; });
    await until(() => readdirSync(r.tmpRoot).length === 0);
    return { ...got, relays, call: calls[0], result: calls[0].results[0], files: [...filesUnder(r.signinRoot)] };
  } finally { await r.stop(); }
}

test('R24 a read_page result\'s image block reaches the model as one MCP image item, same bytes and media type, beside its text in order', async () => {
  const data = png(randomBytes(4096));
  const { final, relays, result, call } = await onePage([{ type: 'text', text: 'Page 1 of 3.' }, image(data), { type: 'text', text: 'Transcribe it.' }]);
  assert.equal(final.ok, true);
  assert.deepEqual(relays.map((x) => x.name), ['read_page']);
  assert.ok(!result.isError);
  assert.deepEqual(result.content, [{ type: 'text', text: 'Page 1 of 3.' }, { type: 'image', data, mimeType: 'image/png' },
    { type: 'text', text: 'Transcribe it.' }]);
  assert.equal(result.content.filter((c) => c.type === 'image').length, 1);
  assert.deepEqual(Buffer.from(result.content[1].data, 'base64'), Buffer.from(data, 'base64'), 'the bytes unchanged');
  // only inside the tool's result: never the system prompt or the user turn
  assert.ok(!call.options.systemPrompt.includes(data) && !call.prompt.includes(data));
  // an image alone, and an is_error result holding one, pass the same way
  const alone = await onePage([image(data)]);
  assert.deepEqual(alone.result.content, [{ type: 'image', data, mimeType: 'image/png' }]);
  const errored = await onePage([image(data)], { is_error: true });
  assert.deepEqual(errored.result.content, [{ type: 'image', data, mimeType: 'image/png' }]);
  assert.equal(errored.result.isError, true);
});

test('R24 R8 a sentinel in an image\'s data is in no answer, relay, log line or file', async () => {
  const SENT = 'UElDVFVSRS1TRU5USU5FTC03YzQx';               // base64, itself the sentinel
  const logged = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  console.log = console.error = console.warn = (...a) => { logged.push(a.join(' ')); };
  process.stdout.write = process.stderr.write = (s) => { logged.push(String(s)); return true; };
  let got, bad;
  try {
    got = await onePage([image(SENT)]);
    bad = await onePage([image(SENT, 'image/jpeg')]);
  } finally {
    Object.assign(console, { log: orig.log, error: orig.error, warn: orig.warn });
    process.stdout.write = orig.out; process.stderr.write = orig.err;
  }
  assert.equal(got.result.content[0].data, SENT, 'the model received it');
  for (const g of [got, bad]) {
    assert.ok(!JSON.stringify(g.frames).includes(SENT), 'in no answer or relay the runner sent');
    assert.ok(g.files.every((f) => !f.text.includes(SENT)), 'in no file of the instance');
  }
  assert.ok(!JSON.stringify(bad.result).includes(SENT), 'nor in the error a refused picture becomes');
  assert.ok(!logged.join('\n').includes(SENT), 'nor in a log line');
});

test('R24 an image block not image/png, not base64, or not in R14\'s shape is the tool\'s error naming the fault, no bytes passed', async () => {
  const data = png(randomBytes(64));
  const cases = [
    [image(data, 'image/jpeg'), /media_type must be image\/png/],
    [{ type: 'image', source: { type: 'base64', data } }, /media_type must be image\/png/],
    [image('not base64!'), /data must be base64/],
    [image('abc'), /data must be base64/],
    [image(''), /data must be base64/],
    [image(42), /data must be base64/],
    [{ type: 'image', source: { type: 'url', url: 'https://example.test/p.png' } }, /must be \{type: "image", source/],
    [{ type: 'image' }, /must be \{type: "image", source/],
    [{ type: 'image', data, mimeType: 'image/png' }, /must be \{type: "image", source/],
  ];
  for (const [block, fault] of cases) {
    const { final, result } = await onePage([{ type: 'text', text: 'before' }, block]);
    assert.equal(final.ok, true, 'the conversation goes on; the model sees the error');
    assert.equal(result.isError, true, JSON.stringify(block).slice(0, 80));
    assert.equal(result.content.length, 1);
    assert.equal(result.content[0].type, 'text');
    assert.match(result.content[0].text, fault);
    assert.ok(!result.content[0].text.includes(data), 'its bytes are never passed');
  }
});

test('R24 a page at agent-worker\'s 5 MiB bound passes through the connection whole', async () => {
  const data = png(randomBytes(5 * 1024 * 1024 - 8));
  assert.equal(Buffer.from(data, 'base64').length, 5 * 1024 * 1024);
  const { final, result } = await onePage([image(data)]);
  assert.equal(final.ok, true);
  assert.equal(result.content[0].data, data);
});

test('R24 R3 control: a text-only result still passes unchanged', async () => {
  const content = [{ type: 'text', text: 'one' }, { type: 'text', text: 'two' }];
  const listed = await onePage(content);
  assert.deepEqual(listed.result.content, content);
  assert.ok(!listed.result.isError);
  const plain = await onePage('the page reads: minutes');
  assert.deepEqual(plain.result.content, [{ type: 'text', text: 'the page reads: minutes' }]);
});
