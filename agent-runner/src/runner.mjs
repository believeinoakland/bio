// One conversation request run as one Agent SDK query (R1–R4, R8–R10): Claude Code unmodified, with nothing of its own
// switched on, the member's credential only in that query's environment, and every tool a relay to the caller.
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const RELAY_SERVER = 'relay';
export const DETAIL_MAX = 300;
export const MAX_TURNS_BOUND = 100;
const CREDENTIAL_VAR = { subscription: 'CLAUDE_CODE_OAUTH_TOKEN', apikey: 'ANTHROPIC_API_KEY' };
const TOOL_NAME = /^[A-Za-z0-9_-]{1,64}$/;
// Claude Code's own traffic other than the model's API (telemetry, error reports, updates) is switched off (R10).
const QUIET = {
  DISABLE_TELEMETRY: '1', DISABLE_ERROR_REPORTING: '1', DISABLE_AUTOUPDATER: '1',
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
};
const PATH = '/usr/local/bin:/usr/bin:/bin';

const fail = (code, detail) => ({ ok: false, code, detail });
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// Never lets the secret out: every outward string passes through here (R8).
export function scrub(text, secret, max = DETAIL_MAX) {
  let s = String(text ?? '');
  if (secret) s = s.split(secret).join('[redacted]');
  return s.slice(0, max);
}

export function credentialOf(request) {
  const c = request && request.credential;
  if (!c || typeof c !== 'object' || !CREDENTIAL_VAR[c.kind] || typeof c.secret !== 'string' || !c.secret) return null;
  return { variable: CREDENTIAL_VAR[c.kind], secret: c.secret };
}

// The rest of a conversation request's shape; null when it is whole.
export function shapeFault(r) {
  const str = (x) => typeof x === 'string';
  if (!str(r.model) || !r.model) return 'model must be a non-empty string';
  if (!str(r.system)) return 'system must be a string';
  if (!str(r.prompt) || !r.prompt) return 'prompt must be a non-empty string';
  if (!Number.isInteger(r.max_turns) || r.max_turns < 1 || r.max_turns > MAX_TURNS_BOUND)
    return `max_turns must be an integer from 1 to ${MAX_TURNS_BOUND}`;
  if (!Array.isArray(r.tools)) return 'tools must be an array';
  const seen = new Set();
  for (const t of r.tools) {
    if (!t || !TOOL_NAME.test(t.name) || seen.has(t.name)) return 'each tool needs a distinct name of [A-Za-z0-9_-]{1,64}';
    if (!str(t.description)) return `tool ${t.name}: description must be a string`;
    if (!t.input_schema || typeof t.input_schema !== 'object' || Array.isArray(t.input_schema))
      return `tool ${t.name}: input_schema must be an object`;
    seen.add(t.name);
  }
  return null;
}

export function usageOf(result) {
  const u = (result && result.usage) || {};
  return {
    input_tokens: num(u.input_tokens), output_tokens: num(u.output_tokens),
    cache_read_input_tokens: num(u.cache_read_input_tokens),
    cache_creation_input_tokens: num(u.cache_creation_input_tokens),
    total_cost_usd: num(result && result.total_cost_usd),
  };
}

// The relay server (R3): the model sees exactly the request's tools; a call goes to the caller as a relay and the
// caller's tool_result comes back as the tool's result.
export function relayServer(sdk, tools, relay) {
  const server = new sdk.McpServer({ name: RELAY_SERVER, version: '1' }, { capabilities: { tools: {} } });
  const named = new Map(tools.map((t) => [t.name, t]));
  server.server.setRequestHandler(sdk.ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.input_schema })),
  }));
  server.server.setRequestHandler(sdk.CallToolRequestSchema, async (req) => {
    const { name, arguments: input } = req.params;
    if (!named.has(name)) return { content: [{ type: 'text', text: `no tool named ${name}` }], isError: true };
    const r = await relay(name, input ?? {});
    const content = typeof r.content === 'string' ? [{ type: 'text', text: r.content }]
      : Array.isArray(r.content) ? r.content : [{ type: 'text', text: JSON.stringify(r.content ?? null) }];
    return r.is_error ? { content, isError: true } : { content };
  });
  return { type: 'sdk', name: RELAY_SERVER, instance: server };
}

// Runs `request` over `channel` ({send(obj), close()}); returns the handlers the connection feeds:
// `toolResult(frame)` and `closed()`. The answer is sent on the channel and the promise resolves with it.
export function converse(sdk, request, channel, { tmpRoot = tmpdir(), version = '0' } = {}) {
  const cred = credentialOf(request);
  const pending = new Map();
  let ended = false, n = 0;
  const abort = new AbortController();
  const answer = (a) => { if (!ended) { ended = true; channel.send(a); channel.close(); } return a; };
  const handlers = {
    toolResult(tr) {
      const p = tr && pending.get(tr.id);
      if (p) { pending.delete(tr.id); p.resolve(tr); }
    },
    closed() {
      if (ended) return;
      ended = true;
      abort.abort();
      for (const p of pending.values()) p.reject(new Error('the connection closed'));
      pending.clear();
    },
  };
  const run = async () => {
    if (!cred) return answer(fail('NO_CREDENTIAL', 'the request carries no usable credential'));
    const fault = shapeFault(request);
    if (fault) return answer(fail('BAD_REQUEST', fault));
    const dir = await mkdtemp(join(tmpRoot, 'agent-runner-'));
    let stderr = '';
    try {
      for (const d of ['home', 'tmp', 'work']) await mkdir(join(dir, d));
      const relay = (name, input) => new Promise((resolve, reject) => {
        if (ended) return reject(new Error('the connection closed'));
        const id = `relay_${++n}`;
        pending.set(id, { resolve, reject });
        channel.send({ tool_use: { id, name, input } });
      });
      const options = {
        model: request.model,
        systemPrompt: request.system,
        tools: [],
        settingSources: [],
        persistSession: false,
        strictMcpConfig: true,
        skills: [],
        plugins: [],
        maxTurns: request.max_turns,
        mcpServers: { [RELAY_SERVER]: relayServer(sdk, request.tools, relay) },
        allowedTools: request.tools.map((t) => `mcp__${RELAY_SERVER}__${t.name}`),
        permissionMode: 'dontAsk',
        cwd: join(dir, 'work'),
        env: {
          PATH, HOME: join(dir, 'home'), TMPDIR: join(dir, 'tmp'), CLAUDE_CONFIG_DIR: dir, ...QUIET,
          CLAUDE_AGENT_SDK_CLIENT_APP: `agent-runner/${version}`,
          [cred.variable]: cred.secret,
        },
        abortController: abort,
        stderr: (s) => { stderr = (stderr + s).slice(-4096); },
      };
      let result = null;
      for await (const m of sdk.query({ prompt: request.prompt, options })) if (m && m.type === 'result') result = m;
      if (ended) return null;
      if (!result) return answer(fail('SDK_ERROR', scrub(stderr || 'the query ended with no result', cred.secret)));
      if (result.subtype === 'error_max_turns')
        return answer(fail('MAX_TURNS', `stopped after ${result.num_turns} turns (max_turns ${request.max_turns})`));
      if (result.subtype !== 'success' || result.is_error) {
        const why = (result.errors && result.errors.join('; ')) || result.result || result.subtype;
        return answer(fail('SDK_ERROR', scrub(why, cred.secret)));
      }
      return answer({ ok: true, result: scrub(result.result, cred.secret, Infinity), stop_reason: result.stop_reason ?? null,
        num_turns: result.num_turns, usage: usageOf(result) });
    } catch (e) {
      if (ended) return null;
      return answer(fail('SDK_ERROR', scrub((e && e.message) || e, cred.secret)));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  };
  handlers.done = run();
  return handlers;
}
