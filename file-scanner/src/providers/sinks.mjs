/* Adapters of kind `log_sink` (R27, R30; K1892): `forward(ctx, record)` sends the counts record, already checked, in the
 * tool's transport shape and nothing else: no file digest, name, member, address or request detail. */
import { ToolError, jsonOf, clientToken, hostPart, portPart } from './net.mjs';
import { baseOf } from './scanners.mjs';

const ok = async (res) => { if (!res.ok) { await res.body?.cancel().catch(() => {}); throw new ToolError('SERVICE_REFUSED', { status: res.status }); } };
const json = (body) => ({ 'content-type': 'application/json', body: JSON.stringify(body) });
const post = (ctx, url, headers, payload) => ctx.net.http(url, { method: 'POST', headers: { ...headers, 'content-type': payload['content-type'] }, body: payload.body });

// Splunk HTTP Event Collector: `{"event": record}`, the token in Splunk's own header.
const splunk = {
  async forward(ctx, record) {
    const j = await jsonOf(await post(ctx, `${baseOf(ctx)}/services/collector/event`, { authorization: `Splunk ${ctx.cred('hec_token')}` }, json({ event: record })));
    if (j.code !== undefined && j.code !== 0) throw new ToolError('SERVICE_REFUSED', { status: 400 });
  },
};

// Microsoft Sentinel through the Logs Ingestion API: a JSON array to the data collection rule's stream.
const sentinel = {
  async forward(ctx, record) {
    const token = await clientToken(ctx.net, `https://login.microsoftonline.com/${encodeURIComponent(String(ctx.config.tenant_id || ''))}/oauth2/v2.0/token`,
      { client_id: ctx.cred('client_id'), client_secret: ctx.cred('client_secret'), scope: 'https://monitor.azure.com//.default' });
    const host = hostPart(ctx.config.endpoint || '');
    const dcr = encodeURIComponent(String(ctx.config.dcr_id || '')), stream = encodeURIComponent(String(ctx.config.stream || ''));
    await ok(await post(ctx, `https://${host}/dataCollectionRules/${dcr}/streams/${stream}?api-version=2023-01-01`,
      { authorization: `Bearer ${token}` }, json([record])));
  },
};

// Google Security Operations, ImportLogs: a service account's signed assertion exchanged for a token, then one log
// entry whose data is the record; its times are the period's end.
const b64url = (b) => btoa(typeof b === 'string' ? b : String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function googleToken(ctx) {
  let key;
  try { key = JSON.parse(ctx.cred('service_account_key')); } catch { throw new ToolError('CREDENTIALS_MISSING'); }
  const pem = String(key.private_key || '').replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  let signer;
  try {
    signer = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  } catch { throw new ToolError('CREDENTIALS_MISSING'); }
  const iat = Math.floor(ctx.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat + 600 }))}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', signer, new TextEncoder().encode(unsigned));
  const form = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(sig)}` });
  const j = await jsonOf(await ctx.net.http('https://oauth2.googleapis.com/token',
    { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form.toString() }));
  if (!j.access_token) throw new ToolError('SERVICE_REFUSED', { status: 401 });
  return j.access_token;
}
const secops = {
  async forward(ctx, record) {
    const token = await googleToken(ctx);
    const c = ctx.config;
    const seg = (v) => encodeURIComponent(String(v || ''));
    const host = ctx.net.allowed.find((h) => h.endsWith('-chronicle.googleapis.com'));
    const url = `https://${host}/v1alpha/projects/${seg(c.project)}/locations/${seg(c.location)}/instances/${seg(c.instance)}/logTypes/${seg(c.log_type)}/logs:import`;
    const data = btoa(JSON.stringify(record));
    await ok(await post(ctx, url, { authorization: `Bearer ${token}` },
      json({ inline_source: { logs: [{ data, log_entry_time: record.period.to, collection_time: record.period.to }] } })));
  },
};

// Elastic `_bulk`: one index action and the record, as newline-delimited JSON.
const elastic = {
  async forward(ctx, record) {
    const index = String(ctx.config.index || 'civicsmith-security-counts');
    const body = `${JSON.stringify({ index: { _index: index } })}\n${JSON.stringify(record)}\n`;
    const j = await jsonOf(await ctx.net.http(`${baseOf(ctx)}/_bulk`, { method: 'POST',
      headers: { authorization: `ApiKey ${ctx.cred('api_key')}`, 'content-type': 'application/x-ndjson' }, body }));
    if (j.errors) throw new ToolError('SERVICE_REFUSED', { status: 400 });
  },
};

// Syslog, RFC 5424 over TLS (RFC 5425's octet-counted framing): facility log audit (13), severity informational (6);
// no host name, the period's end as the time, the record as the message.
export function syslogFrame(record) {
  const msg = `<110>1 ${record.period.to} - civicsmith - security-counts - ${JSON.stringify(record)}`;
  return `${new TextEncoder().encode(msg).length} ${msg}`;
}
const syslog = {
  async forward(ctx, record) {
    const socket = await ctx.net.tcp(hostPart(ctx.spec.host), portPart(ctx.spec.host, 6514), { secureTransport: 'on' });
    const w = socket.writable.getWriter();
    try { await w.write(new TextEncoder().encode(syslogFrame(record))); await w.close(); }
    catch { throw new ToolError('SERVICE_UNREACHABLE'); }
    finally { try { await socket.close(); } catch { /* closed */ } }
  },
};

// Any HTTPS endpoint: the record as a JSON POST, the token as a bearer.
const webhook = {
  async forward(ctx, record) {
    const path = String(ctx.config.path || '/');
    if (!path.startsWith('/') || /[?#]/.test(path)) throw new ToolError('SERVICE_REFUSED', { status: 400 });
    await ok(await post(ctx, `${baseOf(ctx)}${path}`, { authorization: `Bearer ${ctx.cred('token')}` }, json(record)));
  },
};

export const SINKS = Object.freeze({ 'splunk-hec': splunk, sentinel, 'google-secops': secops, elastic, 'syslog-tls': syslog, 'https-webhook': webhook });
