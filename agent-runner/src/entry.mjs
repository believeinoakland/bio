// The container's Node entry: `GET /version` (R5), the conversation connection `GET /conversation` (R1–R4), and 404
// `UNKNOWN` for anything else (R6). It logs nothing of a request (R8).
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isUpgrade, accept } from './ws.mjs';
import { converse } from './runner.mjs';

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

// The runner's host factory: an http.Server not yet listening.
export function agentRunnerOf({ sdk, tmpRoot } = {}) {
  const server = createServer((req, res) => {
    if (req.method === 'GET' && pathOf(req) === '/version') return json(res, 200, { ok: true, name: NAME, version: VERSION });
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
      run = converse(sdk, frame, conn, { tmpRoot, version: VERSION });
    };
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 8080;
  agentRunnerOf({ sdk: await realSdk() }).listen(port, () => console.log(`${NAME} ${VERSION} listening on ${port}`));
}
