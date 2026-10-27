// One trial of one variant in a fresh process. usage: node bench.mjs RUNTIME_DIR VARIANT PORT
// Prints one JSON line. CPU read from cgroup cpuacct group $CGA (reset by the driver before the trial).
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const [RT, V, PORT] = process.argv.slice(2);
const CGA = process.env.CGA;
const cpu = () => { const r = (f) => Number(readFileSync(`${CGA}/cpuacct.usage_${f}`, 'utf8')) / 1e9; return { u: r('user'), s: r('sys') }; };
const sdk0 = await (await import(pathToFileURL(RT + '/src/entry.mjs'))).realSdk();
const { converse, relayServer } = await import(pathToFileURL(RT + '/src/runner.mjs'));
const SDK = await import(pathToFileURL(RT + '/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs'));
const cImport = cpu();
const { PATH, passed, QUIET } = await import(pathToFileURL(RT + '/src/env.mjs'));
const { mkdtemp, mkdir, rm } = await import('node:fs/promises');
const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
const BASE = `http://127.0.0.1:${PORT}`;
const TOOLS = [{ name: 'meaningrows', description: 'd', input_schema: { type: 'object', properties: { rows: { type: 'string' } } } },
  { name: 'report', description: 'd', input_schema: { type: 'object', properties: { state: { type: 'string' } } } }];
const out = { variant: V };
const delta = (a, b) => +((b.u + b.s) - (a.u + a.s)).toFixed(3);
const mkReq = (tools, text) => ({ credential: { kind: 'signin', member: 'm', secret: 'fake-oauth-token-for-local-test' }, model: 'claude-sonnet-5-5',
  system: 's', prompt: 'USER:\n' + text, tools, max_turns: 12, effort: 'low' });
// the same options converse() builds
async function optionsFor(relay, tools) {
  const dir = await mkdtemp(join(tmpdir(), 'bench-'));
  for (const d of ['home', 'tmp', 'work', 'claude']) await mkdir(join(dir, d));
  const abort = new AbortController();
  return { dir, abort, options: { model: 'claude-sonnet-5-5', systemPrompt: 's', tools: [], settingSources: [], persistSession: false, strictMcpConfig: true,
    skills: [], plugins: [], maxTurns: 12, mcpServers: { relay: relayServer(sdk0, tools, relay) },
    allowedTools: tools.map(t => `mcp__relay__${t.name}`), permissionMode: 'dontAsk', cwd: join(dir, 'work'),
    env: { PATH, ...passed(), HOME: join(dir, 'home'), TMPDIR: join(dir, 'tmp'), ...QUIET, CLAUDE_CONFIG_DIR: join(dir, 'claude'),
      CLAUDE_CODE_OAUTH_TOKEN: 'fake-oauth-token-for-local-test', ANTHROPIC_BASE_URL: BASE },
    abortController: abort, stderr: () => {} } };
}
const relayOk = async (name) => ({ content: 'ROW' });
out.import_cpu = delta({ u: 0, s: 0 }, cImport);
const c0 = cpu();

if (V === 'V0' || V === 'V4') {
  const tools = V === 'V4' ? [] : TOOLS;
  const sdk = { ...sdk0, query: (a) => { a.options.env = { ...a.options.env, ANTHROPIC_BASE_URL: BASE };
    const q = sdk0.query(a);
    return (async function* () { let f = true; for await (const m of q) { if (f) { out.first_ms = Date.now() - t0; f = false; } yield m; } })(); } };
  let ans; const channel = { send: (o) => { if (o.tool_use) setTimeout(() => h.toolResult({ id: o.tool_use.id, content: 'ROW' }), 5); else ans = o; }, close() {} };
  var t0 = Date.now();
  var h = converse(sdk, mkReq(tools, 'hi'), channel, { log: () => {} });
  await h.done;
  out.end_ms = Date.now() - t0; out.ok = ans?.ok; out.num_turns = ans?.num_turns; out.err = ans?.ok ? undefined : ans?.code + ' ' + ans?.detail;
  out.cpu_s = delta(c0, cpu());
} else if (V === 'V1') {
  const holder = { relay: relayOk };
  const { dir, options } = await optionsFor((n, i) => holder.relay(n, i), TOOLS);
  const ts = Date.now();
  const wq = await SDK.startup({ options });
  out.startup_ms = Date.now() - ts; out.startup_cpu_s = delta(c0, cpu());
  const t0 = Date.now(); const c1 = cpu();
  let f = true, res;
  for await (const m of wq.query('USER:\nhi')) { if (f) { out.first_ms = Date.now() - t0; f = false; } if (m.type === 'result') res = m; }
  out.end_ms = Date.now() - t0; out.ok = res?.subtype; out.num_turns = res?.num_turns; out.ask_cpu_s = delta(c1, cpu()); out.cpu_s = delta(c0, cpu());
} else if (V === 'V2' || V === 'V2x') {
  const N = 5; const holder = {};
  const { dir, options } = await optionsFor(async () => { await new Promise(r => setTimeout(r, 5)); return { content: [{ type: 'text', text: 'ROW' }] }; }, TOOLS);
  // relayServer expects relay() to return {content: string|array}; ours returns array form (fine)
  let push, waiter; const queue = [];
  const prompt = (async function* () { for (let i = 0; i < N; i++) { while (!queue.length) await new Promise(r => (waiter = r)); yield queue.shift(); } await new Promise(() => {}); })();
  const send = (i) => { queue.push({ type: 'user', message: { role: 'user', content: `USER:\nconversation ${i}` }, parent_tool_use_id: null }); waiter?.(); };
  out.convs = [];
  const t00 = Date.now();
  const q = sdk0.query({ prompt, options });
  let i = 0, t0 = Date.now(), cc = cpu(), first = null; send(0);
  for await (const m of q) {
    if (first === null) first = Date.now() - t0;
    if (m.type === 'result') {
      const now = cpu();
      out.convs.push({ end_ms: Date.now() - t0, first_ms: first, cpu_s: delta(cc, now), num_turns: m.num_turns, ok: m.subtype });
      cc = now; first = null; i++;
      if (i >= N) break;
      t0 = Date.now(); send(i);
    }
  }
  out.cpu_s = delta(c0, cpu()); q.close();
} else if (V === 'V3') {
  const { dir, options, abort } = await optionsFor(async (name) => {
    if (name === 'report') { out.report_ms = Date.now() - t0; ((process.env.END||'interrupt') === 'abort' ? abort.abort() : (process.env.END||'interrupt') === 'interrupt' ? q.interrupt().then(() => q.close()) : q.close()); return new Promise(() => {}); }
    await new Promise(r => setTimeout(r, 5)); return { content: [{ type: 'text', text: 'ROW' }] };
  }, TOOLS);
  var t0 = Date.now();
  var q = sdk0.query({ prompt: 'USER:\nhi', options });
  let f = true;
  try { for await (const m of q) { if (f) { out.first_ms = Date.now() - t0; f = false; } } } catch (e) { out.err = String(e.message).slice(0, 80); }
  out.end_ms = Date.now() - t0; out.cpu_s = delta(c0, cpu());
}
console.log(JSON.stringify(out));
process.exit(0);
