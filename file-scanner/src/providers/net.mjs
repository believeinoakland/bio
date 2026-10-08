/* The one way an adapter reaches its tool (R12, R13, K1874): a request goes only to a host its descriptor states for
 * the spec's region (or the spec's own host, for a template or a product on the organization's servers), over the
 * Workers VPC binding for a tunnelled tool, within PROVIDER_TIMEOUT_MS of the call's start; credentials ride in a
 * header, a body or the transport's own authentication, never in an address. Failures become `ToolError`s whose code
 * is a verdict's `reason` (R5). Nothing here logs. */
import { PROVIDER_TIMEOUT_MS } from '../limits.mjs';

export class ToolError extends Error {
  constructor(code, extra = {}) { super(code); this.code = code; Object.assign(this, extra); }
}

/** Whether `host` is one of `allowed` (a `*.domain` entry stands for any host under it). */
export function hostAllowed(host, allowed) {
  const h = String(host || '').toLowerCase();
  return allowed.some((a) => (a.startsWith('*.') ? h.endsWith(a.slice(1)) && h.length > a.length - 1 : h === a));
}

/** The hosts one call may reach, from its descriptor and spec. */
export function callHosts(d, spec) {
  if (d.host_from_spec || d.template) return spec.host ? [hostPart(spec.host)] : [];
  if (Array.isArray(d.hosts)) return d.hosts;
  const list = d.hosts[spec.region];
  if (list && list.length === 0) return spec.host ? [hostPart(spec.host)] : [];
  return list || [];
}
export const hostPart = (h) => String(h).replace(/^[a-z]+:\/\//i, '').split('/')[0].replace(/:\d+$/, '').toLowerCase();
export const portPart = (h, fallback) => { const m = /:(\d+)(?:\/|$)/.exec(String(h).replace(/^[a-z]+:\/\//i, '')); return m ? Number(m[1]) : fallback; };

const NEUTRAL = 'sample';

/** A multipart body streaming the file under a fixed neutral name, with `fields` before it. */
export function multipart(fields, fileField, file) {
  const boundary = `----civicsmith${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  const enc = new TextEncoder();
  let head = '';
  for (const [k, v] of Object.entries(fields)) head += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
  head += `--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${NEUTRAL}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const a = enc.encode(head), z = enc.encode(`\r\n--${boundary}--\r\n`);
  const src = file.stream();
  const body = new ReadableStream({
    async start(c) { c.enqueue(a); },
    async pull(c) {
      const reader = src.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        c.enqueue(value);
      }
      c.enqueue(z);
      c.close();
    },
  });
  return { body, headers: { 'content-type': `multipart/form-data; boundary=${boundary}`, 'content-length': String(a.length + file.bytes + z.length) } };
}

/** The call's network: `http(url, init)` and `tcp(host, port, options)`, guarded as above. */
export function makeNet(deps, d, spec, started) {
  const allowed = callHosts(d, spec);
  const left = () => PROVIDER_TIMEOUT_MS - (deps.now() - started);
  const guard = (host, port) => {
    if (!hostAllowed(host, allowed)) throw new ToolError('HOST_NOT_ALLOWED', { host });
    if (Number(port) === 25) throw new ToolError('PORT_REFUSED');
  };
  async function http(url, init = {}) {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new ToolError('HOST_NOT_ALLOWED', { host: u.host });
    if (u.username || u.password) throw new ToolError('TOOL_ADDRESS_HAS_CREDENTIAL');
    guard(u.hostname, u.port);
    if (left() <= 0) throw new ToolError('TIME_LIMIT');
    const via = d.reach === 'tunnel' ? deps.vpc && ((req) => deps.vpc.fetch(req)) : (req) => deps.fetch(req);
    if (!via) throw new ToolError('REACH_NOT_BOUND');
    const signal = AbortSignal.timeout(left());
    const opts = { ...init, signal };
    if (init.body && typeof init.body.getReader === 'function') opts.duplex = 'half';
    try {
      return await via(new Request(url, opts));
    } catch (e) {
      if (signal.aborted || (e && e.name === 'TimeoutError')) throw new ToolError('TIME_LIMIT');
      throw new ToolError('SERVICE_UNREACHABLE');
    }
  }
  async function tcp(host, port, options = {}) {
    guard(host, port);
    const connect = d.reach === 'tunnel' ? deps.vpc && deps.vpc.connect && ((a, o) => deps.vpc.connect(a, o)) : deps.connect;
    if (!connect) throw new ToolError(d.reach === 'tunnel' ? 'REACH_NOT_BOUND' : 'SERVICE_UNREACHABLE');
    try { return connect({ hostname: host, port }, options); } catch { throw new ToolError('SERVICE_UNREACHABLE'); }
  }
  return { http, tcp, left, allowed };
}

/** A tool's JSON answer, or the refusal it is (`SERVICE_REFUSED` with its status). */
export async function jsonOf(res) {
  if (!res.ok) { await res.body?.cancel().catch(() => {}); throw new ToolError('SERVICE_REFUSED', { status: res.status }); }
  try { return await res.json(); } catch { throw new ToolError('SERVICE_REFUSED', { status: res.status }); }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** An OAuth 2.0 client-credentials token, the secret in the body (never the address). */
export async function clientToken(net, url, { client_id, client_secret, scope, basic }) {
  const form = new URLSearchParams({ grant_type: 'client_credentials' });
  const headers = { 'content-type': 'application/x-www-form-urlencoded' };
  if (basic) headers.authorization = `Basic ${btoa(`${client_id}:${client_secret}`)}`;
  else { form.set('client_id', client_id); form.set('client_secret', client_secret); }
  if (scope) form.set('scope', scope);
  const j = await jsonOf(await net.http(url, { method: 'POST', headers, body: form.toString() }));
  if (!j.access_token) throw new ToolError('SERVICE_REFUSED', { status: 401 });
  return j.access_token;
}
