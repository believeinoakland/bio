// Standalone fake API (own process, outside the CPU cgroup). usage: node fakeserver.mjs PORT LATENCY_MS MODE(tools|judge)
// Control: GET /__log -> JSON log; GET /__reset -> clears log and script step.
import { fakeApi } from './fakeapi.mjs';
import { createServer } from 'node:http';
const [port, lat, mode] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const script = mode === 'judge'
  ? [{ text: JSON.stringify({ verdict: 'PRESENT', confidence: 0.9, reason: 'matches snippet' }) }]
  : [{ tool: 'mcp__relay__meaningrows', input: { rows: 'leg' } }, { tool: 'mcp__relay__report', input: { state: 'PRESENT' } }, { text: 'OK' }];
const api = fakeApi({ script, latencyMs: lat, cycle: true });
const inner = api.server.listeners('request')[0];
api.server.removeAllListeners('request');
api.server.on('request', (req, res) => {
  if (req.url === '/__log') { res.end(JSON.stringify(api.log)); return; }
  if (req.url === '/__reset') { api.log.length = 0; api.reset(); res.end('ok'); return; }
  inner(req, res);
});
api.server.listen(port, '127.0.0.1', () => console.log('fake listening', port));
