// One conversation request run as one Agent SDK query (R1–R4, R8–R10, R28): Claude Code unmodified, with nothing of its
// own switched on, on the member's held token (`CLAUDE_CODE_OAUTH_TOKEN`, AT-22) in that query's environment only, and
// every tool a relay to the caller. It writes one JSON line per conversation (R29), never its content or its token.
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DETAIL_MAX, QUIET, PATH, passed, scrub } from './env.mjs';

export const RELAY_SERVER = 'relay';
export { DETAIL_MAX, scrub };
export const MAX_TURNS_BOUND = 100;
const TOOL_NAME = /^[A-Za-z0-9_-]{1,64}$/;
// The SDK's own sign of Anthropic refusing the token (sdk.d.ts `SDKAssistantMessageError`, 0.3.289; START, K3068):
// an assistant or `api_retry` message carrying this error, then a query that does not succeed (R28).
export const AUTH_FAILED = 'authentication_failed';

const fail = (code, detail) => ({ ok: false, code, detail });
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// The request's one credential (R2 as R28 amends it): `{kind: "signin", member, secret}`, `secret` the token
// `credentials` holds for the member. Anything but a `signin` credential naming a member is null (NO_CREDENTIAL); one
// whose `secret` is not a non-empty string is `{member, secret: null}` (SIGNIN_NOT_HELD). No key of any other kind is
// ever read.
export function credentialOf(request) {
  const c = request && request.credential;
  if (!c || typeof c !== 'object' || Array.isArray(c) || c.kind !== 'signin') return null;
  if (typeof c.member !== 'string' || c.member.length === 0) return null;
  return { member: c.member, secret: typeof c.secret === 'string' && c.secret.length > 0 ? c.secret : null };
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

// A page's picture (R24): the one media type, and base64 as the caller sends it (`agent-model` R14).
export const IMAGE_MEDIA_TYPE = 'image/png';
// Linear in the picture's size (a page is megabytes): a grouped, repeated pattern overflows the regex engine's stack.
const base64 = (s) => typeof s === 'string' && s.length > 0 && s.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(s);

// Why an `image` block is not one R24 passes, or null: `{type: "image", source: {type: "base64", media_type, data}}`.
// The fault names the field, never the bytes (R8).
export function imageFault(b) {
  const s = b.source;
  if (!s || typeof s !== 'object' || Array.isArray(s) || s.type !== 'base64')
    return 'an image block must be {type: "image", source: {type: "base64", media_type, data}}';
  if (s.media_type !== IMAGE_MEDIA_TYPE) return `an image block's media_type must be ${IMAGE_MEDIA_TYPE}`;
  if (!base64(s.data)) return 'an image block\'s data must be base64';
  return null;
}

// The caller's tool_result content as the MCP tool's content (R3, R24): a string is one text item; each `image` block in
// R14's shape becomes MCP's image item, its media type and bytes unchanged and in its place among the rest, which pass
// as given. Any other image block makes the whole result the tool's error naming the fault, no bytes passed.
export function toolContent(r) {
  if (typeof r.content === 'string') return { content: [{ type: 'text', text: r.content }] };
  if (!Array.isArray(r.content)) return { content: [{ type: 'text', text: JSON.stringify(r.content ?? null) }] };
  const content = [];
  for (const b of r.content) {
    if (!b || b.type !== 'image') { content.push(b); continue; }
    const fault = imageFault(b);
    if (fault) return { content: [{ type: 'text', text: `the picture was not passed: ${fault}` }], fault: true };
    content.push({ type: 'image', data: b.source.data, mimeType: b.source.media_type });
  }
  return { content };
}

// The relay server (R3): the model sees exactly the request's tools; a call goes to the caller as a relay and the
// caller's tool_result comes back as the tool's result (a page's picture as MCP's image content, R24).
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
    const { content, fault } = toolContent(r);
    return r.is_error || fault ? { content, isError: true } : { content };
  });
  return { type: 'sdk', name: RELAY_SERVER, instance: server };
}

// Runs `request` over `channel` ({send(obj), close()}); returns the handlers the connection feeds:
// `toolResult(frame)` and `closed()`. The answer is sent on the channel and the promise resolves with it. `sdk` may be
// a promise: a conversation that arrives before the SDK has loaded waits for it (R26). `log` takes the one line (R29).
export function converse(sdk, request, channel, { tmpRoot = tmpdir(), version = '0', trace = null, memberRef = null,
  log = (line) => console.log(JSON.stringify(line)) } = {}) {
  const cred = credentialOf(request);
  const secret = cred && cred.secret;
  const pending = new Map();
  const t0 = Date.now();
  let ended = false, n = 0, turns = null;
  const abort = new AbortController();
  const line = (a) => {
    const outcome = a.ok ? 'ok' : ['NO_CREDENTIAL', 'SIGNIN_NOT_HELD', 'BAD_REQUEST', 'SIGNIN_TOKEN_REFUSED'].includes(a.code) ? 'refused' : 'failed';
    log({ event: 'conversation.runner', ...(trace ? { trace } : {}), member_ref: memberRef, outcome,
      ...(a.ok ? {} : { code: a.code }), ms: Date.now() - t0, num_turns: turns });
  };
  const answer = (a) => { if (!ended) { ended = true; line(a); channel.send(a); channel.close(); } return a; };
  const handlers = {
    toolResult(tr) {
      const p = tr && pending.get(tr.id);
      if (p) { pending.delete(tr.id); p.resolve(tr); }
    },
    closed() {
      if (ended) return;
      ended = true;
      line({ ok: false, code: 'CLOSED' });
      abort.abort();
      for (const p of pending.values()) p.reject(new Error('the connection closed'));
      pending.clear();
    },
  };
  const run = async () => {
    if (!cred) return answer(fail('NO_CREDENTIAL', 'the request carries no usable credential'));
    if (!secret) return answer(fail('SIGNIN_NOT_HELD', 'no Claude sign-in is held for this member: connect Claude again'));
    const fault = shapeFault(request);
    if (fault) return answer(fail('BAD_REQUEST', fault));
    let kit;
    try { kit = await sdk; } catch { return answer(fail('SDK_ERROR', 'the Agent SDK could not be loaded')); }
    if (ended) return null;
    const dir = await mkdtemp(join(tmpRoot, 'agent-runner-'));
    let stderr = '', authFailed = false;
    const refused = () => answer(fail('SIGNIN_TOKEN_REFUSED', 'Anthropic refused this member\'s Claude sign-in: connect Claude again'));
    try {
      for (const d of ['home', 'tmp', 'work', 'claude']) await mkdir(join(dir, d));
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
        mcpServers: { [RELAY_SERVER]: relayServer(kit, request.tools, relay) },
        allowedTools: request.tools.map((t) => `mcp__${RELAY_SERVER}__${t.name}`),
        permissionMode: 'dontAsk',
        cwd: join(dir, 'work'),
        // The held token in this query's environment only (AT-22's way), a fresh config directory gone with the
        // query, and no API key (R28, R9).
        env: {
          PATH, ...passed(), HOME: join(dir, 'home'), TMPDIR: join(dir, 'tmp'), ...QUIET,
          CLAUDE_AGENT_SDK_CLIENT_APP: `agent-runner/${version}`, CLAUDE_CONFIG_DIR: join(dir, 'claude'),
          CLAUDE_CODE_OAUTH_TOKEN: secret,
        },
        abortController: abort,
        stderr: (s) => { stderr = (stderr + s).slice(-4096); },
      };
      let result = null;
      for await (const m of kit.query({ prompt: request.prompt, options })) {
        if (m && m.error === AUTH_FAILED && (m.type === 'assistant' || (m.type === 'system' && m.subtype === 'api_retry'))) authFailed = true;
        if (m && m.type === 'result') result = m;
      }
      if (ended) return null;
      turns = result ? num(result.num_turns) : null;
      const ok = result && result.subtype === 'success' && !result.is_error;
      if (!ok && authFailed) return refused();
      if (!result) return answer(fail('SDK_ERROR', scrub(stderr || 'the query ended with no result', secret)));
      if (result.subtype === 'error_max_turns')
        return answer(fail('MAX_TURNS', `stopped after ${result.num_turns} turns (max_turns ${request.max_turns})`));
      if (!ok) {
        const why = (result.errors && result.errors.join('; ')) || result.result || result.subtype;
        return answer(fail('SDK_ERROR', scrub(why, secret)));
      }
      return answer({ ok: true, result: scrub(result.result, secret, Infinity), stop_reason: result.stop_reason ?? null,
        num_turns: result.num_turns, usage: usageOf(result) });
    } catch (e) {
      if (ended) return null;
      if (authFailed) return refused();
      return answer(fail('SDK_ERROR', scrub((e && e.message) || e, secret)));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  };
  handlers.done = run();
  return handlers;
}
