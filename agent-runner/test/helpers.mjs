// A stubbed Agent SDK: `query` records the options it was given at the SDK boundary, plays a script against the real
// relay MCP server (as Claude Code would, through an MCP client), and yields the result the script names.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { mkdtempSync, mkdirSync, rmSync, readdirSync, readFileSync, statSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { agentRunnerOf } from '../src/entry.mjs';
import { signinOf } from '../src/signin.mjs';

export function stubSdk(script) {
  const calls = [];
  const query = ({ prompt, options }) => (async function* () {
    const call = { prompt, options, listed: null, results: [] };
    calls.push(call);
    const [a, b] = InMemoryTransport.createLinkedPair();
    const server = options.mcpServers.relay.instance;
    await server.connect(a);
    const client = new Client({ name: 'stub-claude-code', version: '1' });
    await client.connect(b);
    try {
      call.listed = (await client.listTools()).tools;
      const out = await script(call, {
        callTool: async (name, args) => {
          const r = await client.callTool({ name, arguments: args });
          call.results.push(r);
          return r;
        },
        signal: options.abortController.signal,
      });
      yield { type: 'system', subtype: 'init' };
      if (out) yield out;
    } finally {
      await client.close().catch(() => {});
    }
  })();
  return { calls, sdk: { query, McpServer, ListToolsRequestSchema, CallToolRequestSchema } };
}

export const success = (over = {}) => ({
  type: 'result', subtype: 'success', is_error: false, result: 'done', stop_reason: 'end_turn', num_turns: 2,
  total_cost_usd: 0.0123,
  usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 5, cache_creation_input_tokens: 7 },
  ...over,
});

// The member a conversation names; the token `credentials` holds for that member, handed down as the credential's
// `secret` (R28); and a sentinel token no other kind of credential may bring in (R2, R8).
export const MEMBER = 'member-7d1e';
export const HELD = 'sk-ant-oat01-HELD-TOKEN-SENTINEL-5e2b';
export const SENTINEL = 'sk-ant-oat01-SENTINEL-7f3a9c';

export const request = (over = {}) => ({
  credential: { kind: 'signin', member: MEMBER, secret: HELD },
  model: 'claude-sonnet-5-5', system: 'You answer from the record only.', prompt: 'What was filed?',
  tools: [{ name: 'search', description: 'Search the record', input_schema: { type: 'object', properties: { q: { type: 'string' } } } }],
  max_turns: 4, ...over,
});

// A stubbed Claude Code binary (stubs/claude.mjs) in `mode`, as an executable wrapper in `dir`; its runs are logged
// to `log` (arguments and environment names only).
export function stubClaude(dir, mode = 'ok') {
  const binary = join(dir, `claude-${mode}`), log = join(dir, `claude-${mode}.log`);
  const stub = fileURLToPath(new URL('./stubs/claude.mjs', import.meta.url));
  writeFileSync(binary, `#!/bin/sh\nexec '${process.execPath}' '${stub}' '${mode}' '${log}' "$@"\n`);
  chmodSync(binary, 0o755);
  const runs = () => (existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
  return { binary, log, runs };
}

// The runner over `sdk` (or a promise of it), its instance's sign-in making each attempt's directory under its own
// root (`signinRoot`) over a stubbed binary in `mode`. Every line it logs is kept in `lines` (R29), parsed.
export async function startRunner(sdk, { mode = 'ok', waits } = {}) {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'agent-runner-test-'));
  const outside = mkdtempSync(join(tmpdir(), 'agent-runner-instance-'));
  const signinRoot = join(outside, 'signin'), claude = stubClaude(outside, mode);
  mkdirSync(signinRoot);
  const signin = signinOf({ root: signinRoot, binary: claude.binary, waits });
  const lines = [];
  const server = agentRunnerOf({ sdk, tmpRoot, signin, log: (l) => lines.push(JSON.parse(JSON.stringify(l))) });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `127.0.0.1:${server.address().port}`;
  const post = async (path, body, headers = {}) => {
    const res = await fetch(`http://${base}${path}`, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });
    return { status: res.status, body: await res.json(), waiting: res.headers.get('x-signin-waiting') };
  };
  return {
    base, tmpRoot, signinRoot, signin, claude, post, lines,
    stop: async () => {
      if (signin.waiting) await signin.signout(signin.waiting.member).catch(() => {});
      server.closeAllConnections?.(); await new Promise((r) => server.close(r));
      rmSync(tmpRoot, { recursive: true, force: true }); rmSync(outside, { recursive: true, force: true });
    },
  };
}

// Opens a conversation, sends `req`, answers each relay with `onRelay(tool_use)` and resolves with every frame
// received and how the connection closed.
export function conversation(base, req, onRelay = () => ({ content: 'ok' }), { closeAfterRelay = false, headers } = {}) {
  return new Promise((resolve, reject) => {
    const ws = headers ? new WebSocket(`ws://${base}/conversation`, { headers }) : new WebSocket(`ws://${base}/conversation`);
    const frames = [];
    ws.onopen = () => ws.send(typeof req === 'string' ? req : JSON.stringify(req));
    ws.onmessage = async (ev) => {
      const f = JSON.parse(ev.data);
      frames.push(f);
      if (f.tool_use) {
        if (closeAfterRelay) return ws.close();
        const r = await onRelay(f.tool_use);
        ws.send(JSON.stringify({ tool_result: { id: f.tool_use.id, ...r } }));
      }
    };
    ws.onclose = (ev) => resolve({ frames, code: ev.code, final: frames.find((f) => 'ok' in f) });
    ws.onerror = () => {};
    setTimeout(() => reject(new Error('conversation timed out')), 5000);
  });
}

// Every file under `dir`, with its bytes.
export function filesUnder(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p); else out.push({ path: p, text: readFileSync(p, 'latin1') });
    }
  };
  walk(dir);
  return out;
}

export const until = async (pred, ms = 2000) => {
  const end = Date.now() + ms;
  while (!pred()) { if (Date.now() > end) throw new Error('condition not met'); await new Promise((r) => setTimeout(r, 10)); }
};
