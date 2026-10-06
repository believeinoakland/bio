// A stubbed Agent SDK: `query` records the options it was given at the SDK boundary, plays a script against the real
// relay MCP server (as Claude Code would, through an MCP client), and yields the result the script names.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { mkdtempSync, rmSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { agentRunnerOf } from '../src/entry.mjs';

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

export const request = (over = {}) => ({
  credential: { kind: 'subscription', secret: 'sk-ant-oat01-SENTINEL-7f3a9c' },
  model: 'claude-sonnet-5-5', system: 'You answer from the record only.', prompt: 'What was filed?',
  tools: [{ name: 'search', description: 'Search the record', input_schema: { type: 'object', properties: { q: { type: 'string' } } } }],
  max_turns: 4, ...over,
});

export async function startRunner(sdk) {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'agent-runner-test-'));
  const server = agentRunnerOf({ sdk, tmpRoot });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `127.0.0.1:${server.address().port}`;
  return {
    base, tmpRoot,
    stop: async () => { server.closeAllConnections?.(); await new Promise((r) => server.close(r)); rmSync(tmpRoot, { recursive: true, force: true }); },
  };
}

// Opens a conversation, sends `req`, answers each relay with `onRelay(tool_use)` and resolves with every frame
// received and how the connection closed.
export function conversation(base, req, onRelay = () => ({ content: 'ok' }), { closeAfterRelay = false } = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${base}/conversation`);
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
