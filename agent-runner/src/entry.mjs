// The container's Node entry: `GET /version` (R5, with its capabilities), the conversation connection `GET /conversation` (R1–R4,
// R28), the member's sign-in `POST /signin`, `/signin/code`, `/signin/state`, `/signout` (R17–R21 as R27 and R31 amend
// them), and 404 `UNKNOWN` for anything else (R6). It listens before the Agent SDK has loaded (R26), and writes one JSON
// line per sign-in step and per conversation (R29), never a code, token, secret, address, body or header.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isUpgrade, accept } from './ws.mjs';
import { converse } from './runner.mjs';
import { signinOf, memberOk, WORDS } from './signin.mjs';
import { WAITING_HEADER, TRACE_HEADER, MEMBER_REF_HEADER } from './waits.mjs';

export const NAME = 'agent-runner';
export const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
export const CONVERSATION_PATH = '/conversation';
// Each optional relay this image carries (R5): "image", a page's picture in a tool result (R24).
export const CAPABILITIES = Object.freeze(['image']);

// The SDK and the MCP server classes the relay needs; tests pass their own.
export async function realSdk() {
  const [{ query }, { McpServer }, types] = await Promise.all([
    import('@anthropic-ai/claude-agent-sdk'), import('@modelcontextprotocol/sdk/server/mcp.js'),
    import('@modelcontextprotocol/sdk/types.js')]);
  return { query, McpServer, ListToolsRequestSchema: types.ListToolsRequestSchema,
    CallToolRequestSchema: types.CallToolRequestSchema };
}

const pathOf = (req) => (req.url || '').split('?')[0];
const json = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
};
const unknown = { ok: false, code: 'UNKNOWN' };
export const BODY_MAX = 16 * 1024;
// A caller's header value as a log field: a short run of safe characters, else null (R29).
const headerOf = (req, name) => { const v = req.headers[name]; return typeof v === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(v) ? v : null; };

// A request's JSON object body, or undefined when it is not one (or is over BODY_MAX).
const bodyOf = (req) => new Promise((resolve) => {
  const parts = []; let n = 0, over = false;
  req.on('data', (d) => { n += d.length; if (n > BODY_MAX) over = true; else parts.push(d); });
  req.on('end', () => {
    if (over) return resolve(undefined);
    try { const v = JSON.parse(Buffer.concat(parts).toString('utf8')); resolve(v && typeof v === 'object' && !Array.isArray(v) ? v : undefined); }
    catch { resolve(undefined); }
  });
  req.on('error', () => resolve(undefined));
});

// The sign-in's four steps (R17–R20): each takes `{member}`, R18 also `code` and `attempt` (R31).
const SIGNIN_ROUTES = {
  '/signin': ['start', (s, b) => s.start(b.member)],
  '/signin/code': ['code', (s, b) => s.code(b.member, b.code, b.attempt)],
  '/signin/state': ['state', (s, b) => s.state(b.member)],
  '/signout': ['signout', (s, b) => s.signout(b.member)],
};
// The log line's own fields (R29), in this order; a step's result may add only these.
const LINE_FIELDS = ['attempt', 'binary_present', 'binary_exit', 'said_head', 'address_host', 'ms_to_address',
  'ms_to_outcome', 'waited_s', 'waiting'];

// The runner's host factory: an http.Server not yet listening. `sdk` is the SDK or a promise of it (R26); `signin` is
// the instance's sign-in (src/signin.mjs); `log` takes each line (R29).
export function agentRunnerOf({ sdk, tmpRoot, signin = signinOf(), log = (line) => console.log(JSON.stringify(line)) } = {}) {
  let served = false;
  const server = createServer(async (req, res) => {
    const path = pathOf(req);
    if (req.method === 'GET' && path === '/version') return json(res, 200, { ok: true, name: NAME, version: VERSION, capabilities: CAPABILITIES });
    if (req.method === 'POST' && Object.hasOwn(SIGNIN_ROUTES, path)) {
      const t0 = Date.now(), cold = !served;
      served = true;
      const trace = headerOf(req, TRACE_HEADER) || randomUUID();
      const [step, run] = SIGNIN_ROUTES[path];
      const body = await bodyOf(req);
      let r;
      if (!body) r = { status: 400, body: { ok: false, code: 'BAD_REQUEST', detail: WORDS.BAD_REQUEST }, log: { code: 'BAD_REQUEST' } };
      else if (!memberOk(body.member)) r = { status: 400, body: { ok: false, code: 'BAD_MEMBER', detail: WORDS.BAD_MEMBER }, log: { code: 'BAD_MEMBER' } };
      else {
        try { r = await run(signin, body); }
        catch { r = { status: 502, body: { ok: false, code: 'SIGNIN_UNAVAILABLE', detail: WORDS.NOT_RUN }, log: { code: 'SIGNIN_UNAVAILABLE', arm: 'not_run' } }; }
      }
      const ms = Date.now() - t0, uptime_s = Math.round(process.uptime());
      const age = signin.waitingAge ? signin.waitingAge() : undefined;
      const answer = { ...r.body, trace, trace_detail: { ms, cold, uptime_s, ...(age !== undefined ? { waiting_age_s: age } : {}) } };
      const fields = Object.fromEntries(LINE_FIELDS.filter((k) => r.log && r.log[k] !== undefined).map((k) => [k, r.log[k]]));
      log({ event: 'signin.runner', trace, attempt: null, step, member_ref: headerOf(req, MEMBER_REF_HEADER),
        outcome: r.status === 200 ? 'ok' : r.status >= 500 ? 'failed' : 'refused', ...(r.body.ok ? {} : { code: r.body.code }),
        status: r.status, ms, cold, uptime_s, binary_present: signin.binaryPresent ?? null, ...fields });
      return json(res, r.status, answer, { [WAITING_HEADER]: signin.waiting ? '1' : '0' });
    }
    json(res, 404, unknown);
  });
  server.on('upgrade', (req, socket, head) => {
    if (req.method !== 'GET' || pathOf(req) !== CONVERSATION_PATH || !isUpgrade(req)) {
      const body = JSON.stringify(unknown);
      socket.end(`HTTP/1.1 404 Not Found\r\ncontent-type: application/json\r\ncontent-length: ${body.length}\r\nconnection: close\r\n\r\n${body}`);
      return;
    }
    served = true;
    const trace = headerOf(req, TRACE_HEADER), memberRef = headerOf(req, MEMBER_REF_HEADER);
    const conn = accept(req, socket, head);
    let run = null;
    conn.onClose = () => run && run.closed();
    conn.onMessage = (text) => {
      let frame;
      try { frame = JSON.parse(text); } catch { frame = undefined; }
      if (run) return frame && frame.tool_result && run.toolResult(frame.tool_result);
      if (!frame || typeof frame !== 'object' || Array.isArray(frame)) {
        log({ event: 'conversation.runner', ...(trace ? { trace } : {}), member_ref: memberRef, outcome: 'refused', code: 'BAD_REQUEST', ms: 0, num_turns: null });
        conn.send({ ok: false, code: 'BAD_REQUEST', detail: 'the first frame must be a conversation request' });
        return conn.close();
      }
      run = converse(sdk, frame, conn, { tmpRoot, version: VERSION, trace, memberRef, log });
    };
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 8080;
  // R26: listen first; the SDK loads behind it, and a conversation that arrives sooner waits for it.
  const sdk = realSdk();
  sdk.catch(() => {});
  agentRunnerOf({ sdk }).listen(port, () => console.log(JSON.stringify({ event: 'runner.listening', name: NAME, version: VERSION, port })));
}
