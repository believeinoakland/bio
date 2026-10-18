// T3: framing end to end through the runner's own WebSocket server, real client masking, stub SDK that echoes sizes.
import { pathToFileURL } from 'node:url';
const RT = process.argv[2];
const { agentRunnerOf } = await import(pathToFileURL(RT + '/src/entry.mjs'));
const { stubSdk, success, request } = await import(pathToFileURL(RT + '/test/helpers.mjs'));
import { createHash } from 'node:crypto';
async function once(promptSize, resultSize, text) {
  const { sdk } = stubSdk(async (call, { callTool }) => {
    const r = await callTool('search', { q: 'x' });
    const got = r.content[0].text;
    return success({ result: JSON.stringify({ promptLen: call.prompt.length, promptHash: createHash('sha1').update(call.prompt).digest('hex'), toolLen: got.length, toolHash: createHash('sha1').update(got).digest('hex') }) + 'R'.repeat(resultSize) });
  });
  const server = agentRunnerOf({ sdk, log: () => {} });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const prompt = text.repeat(Math.ceil(promptSize / text.length)).slice(0, promptSize);
  const tool = text.repeat(Math.ceil(promptSize / text.length)).slice(0, promptSize);
  const ws = new WebSocket(`ws://127.0.0.1:${port}/conversation`);
  const out = await new Promise((resolve) => {
    const frames = [];
    ws.onopen = () => ws.send(JSON.stringify(request({ prompt })));
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); frames.push(m); if (m.tool_use) ws.send(JSON.stringify({ tool_result: { id: m.tool_use.id, content: tool } })); if (m.ok !== undefined) resolve({ frames }); };
    ws.onclose = (ev) => resolve({ closed: ev.code, frames });
    ws.onerror = () => resolve({ error: true, frames });
    setTimeout(() => resolve({ timeout: true, frames }), 20000);
  });
  server.close();
  const end = out.frames.find(f => f.ok !== undefined);
  if (!end) return { outcome: out.closed ?? (out.timeout ? 'timeout' : 'error') };
  const meta = JSON.parse(end.result.slice(0, end.result.indexOf('}') + 1));
  return { promptOk: meta.promptLen === prompt.length && meta.promptHash === createHash('sha1').update(prompt).digest('hex'),
    toolOk: meta.toolLen === tool.length && meta.toolHash === createHash('sha1').update(tool).digest('hex'), resultLen: end.result.length };
}
const kb = 1024, mb = 1024 * kb;
console.log('1 MB ascii, 2 MB result       ', JSON.stringify(await once(1 * mb, 2 * mb, 'abcdefghij')));
console.log('1 MB multibyte (3-byte chars)  ', JSON.stringify(await once(1 * mb, 1 * mb, '€ünï漢字🙂')));
console.log('10 MB ascii                    ', JSON.stringify(await once(10 * mb, 1000, 'abcdefghij')));
console.log('17 MB ascii (over runner cap)  ', JSON.stringify(await once(17 * mb, 1000, 'abcdefghij')));
process.exit(0);
