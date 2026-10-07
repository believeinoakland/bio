/* Adapters of kind `scan` (R5, R22, R30), one per catalogued scanner. Each sends the bytes and the tool's required
 * parameters and nothing else (no file name: a fixed neutral part name; no address, member, callback or metadata) and
 * answers raw per-engine results `{engine?, engine_version?, signatures?, result, findings, vendor_ref?, detail?}`,
 * which routes.mjs makes verdicts. Endpoints and answers follow study N710 §2 and N705 §2; where the vendor's page left
 * a field unconfirmed, the field named here is this adapter's assumption, held by its stub test and confirmed at the
 * release's live measurement (R17). */
import { ToolError, jsonOf, multipart, sleep, clientToken, hostPart, portPart } from './net.mjs';

const POLL_MS = 2_000;
const basic = (a, b) => `Basic ${btoa(`${a}:${b}`)}`;
export const baseOf = (ctx) => (ctx.spec.host ? `https://${String(ctx.spec.host).replace(/^https?:\/\//, '').replace(/\/$/, '')}` : `https://${ctx.net.allowed[0]}`);

// Scanii (N705 §2.1): one synchronous call, one findings list; a malware finding names `content.malicious.*`.
const scanii = {
  async scan(ctx, file) {
    const mp = multipart({}, 'file', file);
    const j = await jsonOf(await ctx.net.http(`${baseOf(ctx)}/v2.1/files`, { method: 'POST',
      headers: { ...mp.headers, authorization: basic(ctx.cred('api_key'), ctx.cred('api_secret')) }, body: mp.body }));
    const findings = (j.findings || []).filter((f) => /malicious|malware|virus|trojan|eicar/i.test(f));
    return [{ result: findings.length ? 'found' : 'clean', findings, vendor_ref: j.id }];
  },
};

// MetaDefender, Cloud and Core (N705 §2.2, N710 §2): upload, then poll by `data_id`; one result per engine. On the
// Cloud, every request carries the private mode's headers (R22) and `GET /v4/apikey/` confirms it before a send: the
// assumed answer states `paid_mode: true` and `private_scanning: true`. An answer stating `sample_sharing: 1` (or
// `private_processing: 0`) contradicts the mode.
export function metadefenderBase(ctx) {
  return ctx.cloud ? 'https://api.metadefender.com/v4' : baseOf(ctx);
}
export async function metadefenderModeCheck(ctx) {
  const j = await jsonOf(await ctx.net.http(`${metadefenderBase(ctx)}/apikey/`, { headers: { apikey: ctx.cred('api_key'), ...ctx.modeParams } }));
  return j.paid_mode === true && j.private_scanning === true;
}
export function metadefenderContradicts(j) {
  const on = (v) => v === 1 || v === '1' || v === true;
  const off = (v) => v === 0 || v === '0' || v === false;
  return on(j.sample_sharing) || off(j.private_processing);
}
export async function metadefenderUpload(ctx, file, extra = {}) {
  const headers = { apikey: ctx.cred('api_key'), 'content-type': 'application/octet-stream',
    'content-length': String(file.bytes), ...(ctx.cloud ? ctx.modeParams : {}), ...extra };
  const j = await jsonOf(await ctx.net.http(`${metadefenderBase(ctx)}/file`, { method: 'POST', headers, body: file.stream() }));
  if (ctx.cloud && metadefenderContradicts(j)) throw new ToolError('PRIVATE_MODE_NOT_HONOURED');
  if (!j.data_id) throw new ToolError('SERVICE_REFUSED', { status: 502 });
  return j.data_id;
}
export async function metadefenderPoll(ctx, id, done) {
  for (;;) {
    const j = await jsonOf(await ctx.net.http(`${metadefenderBase(ctx)}/file/${encodeURIComponent(id)}`,
      { headers: { apikey: ctx.cred('api_key'), ...(ctx.cloud ? ctx.modeParams : {}) } }));
    if (ctx.cloud && metadefenderContradicts(j)) throw new ToolError('PRIVATE_MODE_NOT_HONOURED');
    if (done(j)) return j;
    if (ctx.net.left() <= POLL_MS) throw new ToolError('TIME_LIMIT');
    await sleep(POLL_MS);
  }
}
const metadefender = (cloud) => ({
  cloud,
  modeCheck: cloud ? metadefenderModeCheck : undefined,
  async scan(ctx, file) {
    const id = await metadefenderUpload(ctx, file);
    const j = await metadefenderPoll(ctx, id, (x) => x.scan_results && x.scan_results.progress_percentage === 100);
    return Object.entries(j.scan_results.scan_details || {}).map(([engine, e]) => {
      const threat = e.threat_found ? [String(e.threat_found)] : [];
      const found = threat.length > 0 || e.scan_result_i === 1 || e.scan_result_i === 2;
      return { engine, engine_version: e.eng_version || undefined, signatures: e.def_time ? { def_time: e.def_time } : null,
        result: found ? 'found' : 'clean', findings: found ? (threat.length ? threat : ['infected']) : [], vendor_ref: id };
    });
  },
});

// Generic ICAP (R30): RFC 3507 RESPMOD over TCP or TLS. `204`, or `200` with no infection header, is clean;
// `X-Infection-Found` or `X-Virus-ID` names the finding; any other status is `unknown`, `ICAP:<status>`.
export function icapRequest(host, port, service, length) {
  const resHdr = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${length}\r\n\r\n`;
  return { head: `RESPMOD icap://${host}:${port}/${service} ICAP/1.0\r\nHost: ${host}\r\nAllow: 204\r\n`
    + `Encapsulated: res-hdr=0, res-body=${resHdr.length}\r\n\r\n${resHdr}` };
}
export function icapVerdict(text) {
  const status = Number((/^ICAP\/1\.0 (\d{3})/.exec(text) || [])[1]);
  const header = (name) => { const m = new RegExp(`^${name}:\\s*(.+)$`, 'mi').exec(text.split('\r\n\r\n')[0]); return m ? m[1].trim() : null; };
  if (status === 204) return { result: 'clean', findings: [] };
  if (status === 200) {
    const inf = header('X-Infection-Found'), id = header('X-Virus-ID');
    if (!inf && !id) return { result: 'clean', findings: [] };
    const names = [];
    if (inf) { const t = /Threat=([^;]+)/i.exec(inf); names.push(t ? t[1].trim() : inf); }
    if (id) names.push(id);
    return { result: 'found', findings: [...new Set(names)] };
  }
  return { result: 'unknown', findings: [], detail: `ICAP:${Number.isFinite(status) ? status : 'unreadable'}` };
}
const icap = {
  async scan(ctx, file) {
    const host = hostPart(ctx.spec.host), port = portPart(ctx.spec.host, ctx.config.tls ? 11344 : 1344);
    const socket = await ctx.net.tcp(host, port, ctx.config.tls ? { secureTransport: 'on' } : {});
    const enc = new TextEncoder();
    const w = socket.writable.getWriter();
    try {
      await w.write(enc.encode(icapRequest(host, port, ctx.config.service || 'avscan', file.bytes).head));
      const reader = file.stream().getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value.length) { await w.write(enc.encode(`${value.length.toString(16)}\r\n`)); await w.write(value); await w.write(enc.encode('\r\n')); }
      }
      await w.write(enc.encode('0\r\n\r\n'));
      const r = socket.readable.getReader();
      let text = '';
      const dec = new TextDecoder();
      while (!text.includes('\r\n\r\n')) {
        const { done, value } = await r.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        if (ctx.net.left() <= 0) throw new ToolError('TIME_LIMIT');
      }
      return [icapVerdict(text)];
    } catch (e) {
      if (e instanceof ToolError) throw e;
      throw new ToolError('SERVICE_UNREACHABLE');
    } finally { try { await socket.close(); } catch { /* closed */ } }
  },
};

// Microsoft Defender for Storage (azure_blob, R30): the bytes written to the organization's own blob container under a
// random name, the blob's scan-result index tag read until present, the blob deleted after.
const RESULT_TAG = 'Malware Scanning scan result';
export function blobTag(xml) {
  for (const m of String(xml).matchAll(/<Tag>\s*<Key>([^<]*)<\/Key>\s*<Value>([^<]*)<\/Value>\s*<\/Tag>/g)) if (m[1] === RESULT_TAG) return m[2];
  return null;
}
const defender = {
  async scan(ctx, file) {
    const token = await clientToken(ctx.net, `https://login.microsoftonline.com/${encodeURIComponent(String(ctx.config.tenant_id || ''))}/oauth2/v2.0/token`,
      { client_id: ctx.cred('client_id'), client_secret: ctx.cred('client_secret'), scope: 'https://storage.azure.com/.default' });
    const account = String(ctx.config.storage_account || '');
    if (!/^[a-z0-9]{3,24}$/.test(account) || !/^[a-z0-9-]{3,63}$/.test(String(ctx.config.container || ''))) throw new ToolError('SERVICE_REFUSED', { status: 400 });
    const blob = `https://${account}.blob.core.windows.net/${ctx.config.container}/${crypto.randomUUID()}`;
    const h = { authorization: `Bearer ${token}`, 'x-ms-version': '2021-08-06' };
    const put = await ctx.net.http(blob, { method: 'PUT', headers: { ...h, 'x-ms-blob-type': 'BlockBlob', 'content-length': String(file.bytes) }, body: file.stream() });
    if (!put.ok) throw new ToolError('SERVICE_REFUSED', { status: put.status });
    try {
      for (;;) {
        const r = await ctx.net.http(`${blob}?comp=tags`, { headers: h });
        if (!r.ok) throw new ToolError('SERVICE_REFUSED', { status: r.status });
        const tag = blobTag(await r.text());
        if (tag === 'No threats found') return [{ result: 'clean', findings: [] }];
        if (tag === 'Malicious') return [{ result: 'found', findings: ['Malicious'] }];
        if (tag) return [{ result: 'unknown', findings: [], detail: `DEFENDER:${tag}` }];
        if (ctx.net.left() <= POLL_MS) throw new ToolError('TIME_LIMIT');
        await sleep(POLL_MS);
      }
    } finally {
      await ctx.net.http(blob, { method: 'DELETE', headers: h }).catch(() => {});
    }
  },
};

// SophosLabs Intelix (static file analysis; its dynamic analysis is in sandboxes.mjs): an OAuth token, then submit
// and poll the report by job id. The report's `score` (0–100, lower is worse) is read as: under 20 malicious, 20–29
// suspicious, otherwise clean (assumed bands, held by the stub).
export async function intelixToken(ctx) {
  return clientToken(ctx.net, 'https://api.labs.sophos.com/oauth2/token',
    { client_id: ctx.cred('client_id'), client_secret: ctx.cred('client_secret'), basic: true });
}
export const intelixHost = (ctx) => ctx.net.allowed[0];
export function intelixResult(report) {
  const score = Number(report && report.score);
  const names = [report && (report.malwareName || (report.detection && report.detection.name))].filter(Boolean);
  if (score < 20) return { result: 'found', findings: names.length ? names : ['malicious'] };
  if (score < 30) return { result: 'suspicious', findings: names.length ? names : ['suspicious'] };
  return { result: 'clean', findings: [] };
}
export async function intelixSubmit(ctx, file, kind) {
  const token = await intelixToken(ctx);
  const mp = multipart({}, 'file', file);
  const j = await jsonOf(await ctx.net.http(`https://${intelixHost(ctx)}/analysis/file/${kind}/v1`,
    { method: 'POST', headers: { ...mp.headers, authorization: token }, body: mp.body }));
  return { token, j };
}
const intelix = {
  async scan(ctx, file) {
    const { token, j: first } = await intelixSubmit(ctx, file, 'static');
    let j = first;
    while (j.jobStatus !== 'SUCCESS') {
      if (!j.jobId) throw new ToolError('SERVICE_REFUSED', { status: 502 });
      if (ctx.net.left() <= POLL_MS) throw new ToolError('TIME_LIMIT');
      await sleep(POLL_MS);
      j = await jsonOf(await ctx.net.http(`https://${intelixHost(ctx)}/analysis/file/static/v1/reports/${encodeURIComponent(j.jobId)}`,
        { headers: { authorization: token } }));
    }
    const r = intelixResult(j.report);
    return [{ ...r, result: r.result === 'suspicious' ? 'found' : r.result, vendor_ref: j.jobId }];
  },
};

export const SCANNERS = Object.freeze({
  scanii, 'metadefender-cloud': metadefender(true), 'metadefender-core': metadefender(false), icap,
  'defender-storage': defender, 'sophos-intelix': intelix,
});
