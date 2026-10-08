// The container's Node entry: `GET /version` (R5), the conversation connection `GET /conversation` (R1–R4), the
// member's own sign-in `POST /signin`, `/signin/code`, `/signin/state`, `/signout` (R17–R21), and 404 `UNKNOWN` for
// anything else (R6). It logs nothing of a request (R8).
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isUpgrade, accept } from './ws.mjs';
import { converse } from './runner.mjs';
import { signinOf, memberOk } from './signin.mjs';

export const NAME = 'agent-runner';
export const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
export const CONVERSATION_PATH = '/conversation';

// The SDK and the MCP server classes the relay needs; tests pass their own.
export async function realSdk() {
  const [{ query }, { McpServer }, types] = await Promise.all([
    import('@anthropic-ai/claude-agent-sdk'), import('@modelcontextprotocol/sdk/server/mcp.js'),
    import('@modelcontextprotocol/sdk/types.js')]);
  return { query, McpServer, ListToolsRequestSchema: types.ListToolsRequestSchema,
    CallToolRequestSchema: types.CallToolRequestSchema };
}

const pathOf = (req) => (req.url || '').split('?')[0];
const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};
const unknown = { ok: false, code: 'UNKNOWN' };
export const BODY_MAX = 16 * 1024;

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

// The sign-in's four steps (R17–R20): each takes `{member}`, R18 also `code`.
const SIGNIN_ROUTES = {
  '/signin': (s, b) => s.start(b.member),
  '/signin/code': (s, b) => s.code(b.member, b.code),
  '/signin/state': (s, b) => s.state(b.member),
  '/signout': (s, b) => s.signout(b.member),
};

// The runner's host factory: an http.Server not yet listening. `signin` is the instance's sign-in (src/signin.mjs).
export function agentRunnerOf({ sdk, tmpRoot, signin = signinOf() } = {}) {
  const server = createServer(async (req, res) => {
    const path = pathOf(req);
    if (req.method === 'GET' && path === '/version') return json(res, 200, { ok: true, name: NAME, version: VERSION });
    if (req.method === 'POST' && Object.hasOwn(SIGNIN_ROUTES, path)) {
      const body = await bodyOf(req);
      if (!body) return json(res, 400, { ok: false, code: 'BAD_REQUEST' });
      if (!memberOk(body.member)) return json(res, 400, { ok: false, code: 'BAD_MEMBER' });
      try {
        const { status, body: answer } = await SIGNIN_ROUTES[path](signin, body);
        return json(res, status, answer);
      } catch {
        return json(res, 502, { ok: false, code: 'SIGNIN_UNAVAILABLE', detail: 'the sign-in could not be run' });
      }
    }
    json(res, 404, unknown);
  });
  server.on('upgrade', (req, socket, head) => {
    if (req.method !== 'GET' || pathOf(req) !== CONVERSATION_PATH || !isUpgrade(req)) {
      const body = JSON.stringify(unknown);
      socket.end(`HTTP/1.1 404 Not Found\r\ncontent-type: application/json\r\ncontent-length: ${body.length}\r\nconnection: close\r\n\r\n${body}`);
      return;
    }
    const conn = accept(req, socket, head);
    let run = null;
    conn.onClose = () => run && run.closed();
    conn.onMessage = (text) => {
      let frame;
      try { frame = JSON.parse(text); } catch { frame = undefined; }
      if (run) return frame && frame.tool_result && run.toolResult(frame.tool_result);
      if (!frame || typeof frame !== 'object' || Array.isArray(frame)) {
        conn.send({ ok: false, code: 'BAD_REQUEST', detail: 'the first frame must be a conversation request' });
        return conn.close();
      }
      run = converse(sdk, frame, conn, { tmpRoot, version: VERSION, signin });
    };
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 8080;
  agentRunnerOf({ sdk: await realSdk() }).listen(port, () => console.log(`${NAME} ${VERSION} listening on ${port}`));
}
