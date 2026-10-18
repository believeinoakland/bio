// T1: real runner converse() + real SDK + real bundled CLI binary, against a local fake API. Measures wall per phase.
import { fakeApi } from './fakeapi.mjs';
import { pathToFileURL } from 'node:url';
const RT = process.argv[2];
const { converse, relayServer } = await import(pathToFileURL(RT + '/src/runner.mjs'));
const { realSdk } = await import(pathToFileURL(RT + '/src/entry.mjs'));
const latency = Number(process.argv[3] || 0);
const sdk0 = await realSdk();
const api = fakeApi({ latencyMs: latency, script: [
  { tool: 'mcp__relay__meaningrows', input: { rows: 'leg' } },
  { tool: 'mcp__relay__report', input: { state: 'PRESENT' } },
  { text: 'OK' } ] });
const port = await api.listen();
let t0 = Date.now();
const sdk = { ...sdk0, query: ({ prompt, options }) => {
  options.env = { ...options.env, ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}` };
  const q = sdk0.query({ prompt, options });
  return (async function*(){ let first=true; for await (const m of q) { if (first) { console.log('first SDK message', m.type, m.subtype, Date.now()-t0,'ms'); first=false; } if (m.type==='system'&&m.subtype==='init') console.log('init', Date.now()-t0); yield m; } })();
}};
const events = [];
const channel = { send: (o) => { events.push([Date.now()-t0, o]); if (o.tool_use) setTimeout(() => h.toolResult({ id: o.tool_use.id, content: 'ROW' }), 5); }, close(){} };
const req = { credential: { kind:'signin', member:'m', secret:'sk-ant-oat01-FAKE' }, model:'claude-sonnet-5-5', system:'s', prompt:'USER:\nhi',
  tools:[{name:'meaningrows',description:'d',input_schema:{type:'object',properties:{rows:{type:'string'}}}},{name:'report',description:'d',input_schema:{type:'object',properties:{state:{type:'string'}}}}],
  max_turns: 12, effort: 'low' };
t0 = Date.now();
const cpu0 = process.cpuUsage();
const h = converse(sdk, req, channel, { log: (l) => console.log('runner line', JSON.stringify(l)) });
await h.done;
console.log('total ms', Date.now()-t0);
for (const [t,e] of events) console.log(t, JSON.stringify(e).slice(0,160));
console.log('api requests', JSON.stringify(api.log.map(l=>({dt:l.t-t0,url:l.url,model:l.model,tools:l.tools,bytes:l.bytes}))));
process.exit(0);
