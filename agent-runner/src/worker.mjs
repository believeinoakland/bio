// The Worker that hosts the container (R12, R13): the Container Durable Object class `AgentRunner`, which agent-worker's
// `RUNNER` binding names. Each instance runs this module's image and passes every request it receives to the image's
// one port unchanged, the conversation's WebSocket upgrade included, so R1–R6 answer exactly as the image answers
// them. It adds no route of its own, holds no credential and passes the image no environment (R8), and has no binding
// but its own class's. Its exceptions: R15's default export (wrangler builds a module without one as a service worker
// and refuses its Durable Object), which answers R6's 404 to anything reaching it other than through the class; R26's
// JSON answer when the library cannot start the container or reach its port; R25's hold, which keeps the container
// awake through a member's sign-in; and R30's lines, one per lifecycle event and per egress call.
//
// R10's egress is applied here from the member's own configuration (`fleet-member.json` `egress`): the container has
// no internet but the listed hosts, and its HTTPS goes through Cloudflare's outbound interception, whose CA the image
// trusts (`Dockerfile`, NODE_EXTRA_CA_CERTS).
import { Container, ContainerProxy } from '@cloudflare/containers';
import member from '../fleet-member.json' with { type: 'json' };
import { SIGNIN_HOLD_MS, WAITING_HEADER, TRACE_HEADER } from './waits.mjs';

const UNKNOWN = JSON.stringify({ ok: false, code: 'UNKNOWN' });
// R25: the one key of the class's own storage, the hold's deadline (ms since the epoch).
const HOLD_KEY = 'signin_hold_until';
const LIBRARY_DETAIL_MAX = 120;
const STARTED_WORDS = 'Your group\'s Civicsmith could not start its Claude connection just now. Wait a minute, then try again.';

const log = (line) => console.log(JSON.stringify(line));
// The first 12 hex characters of the Durable Object id (R30).
const instanceRef = (id) => String(id ?? '').replace(/[^0-9a-f]/gi, '').slice(0, 12).toLowerCase();
// A path with each segment longer than 24 characters as `:id`; never a query (R30).
const pathTemplate = (url) => {
  let p;
  try { p = new URL(url).pathname; } catch { return null; }
  return p.split('/').map((seg) => (seg.length > 24 ? ':id' : seg)).join('/');
};
// The library's words, scrubbed as R29 says and cut to 120 characters (R26).
const libraryWords = (text) => String(text ?? '')
  .replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s?#]*)[?#]\S*/gi, '$1')
  .replace(/sk-ant-\S*/g, '[redacted]')
  .replace(/eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g, '[redacted]')
  .replace(/[A-Za-z0-9._-]{32,}/g, '[redacted]')
  .replace(/\s+/g, ' ').trim().slice(0, LIBRARY_DETAIL_MAX);
const traceOf = (request) => { const v = request.headers.get(TRACE_HEADER); return v && /^[A-Za-z0-9._:-]{1,128}$/.test(v) ? v : crypto.randomUUID(); };

// R30: one egress handler per allowed host, passing the request to `fetch` unchanged and logging what it reached and
// Anthropic's status, never its query, headers or body. The library refuses any other host before a handler runs (R10).
function egressHandler(host) {
  return async (request, env, ctx) => {
    const t0 = Date.now();
    const line = { event: 'runner.egress', instance_ref: instanceRef(ctx && ctx.containerId), host, method: request.method,
      path_template: pathTemplate(request.url) };
    try {
      const res = await fetch(request);
      log({ ...line, status: res.status, ms: Date.now() - t0 });
      return res;
    } catch (e) {
      log({ ...line, status: null, ms: Date.now() - t0 });
      throw e;
    }
  };
}

// The library's outbound proxy, reachable only through `ctx.exports` (it is what applies `allowedHosts`).
export { ContainerProxy };

export class AgentRunner extends Container {
  defaultPort = member.image.port;
  // A conversation's instance sleeps soon after its connection ends (R9); a sign-in holds it awake to its outcome (R25).
  sleepAfter = '2m';
  enableInternet = false;
  allowedHosts = [...member.egress];
  interceptHttps = true;
  // Assigned, not declared, so the library's setter registers them for its proxy (R30).
  static { this.outboundByHost = Object.fromEntries(member.egress.map((h) => [h, egressHandler(h)])); }
  static HOLD_KEY = HOLD_KEY;

  get instanceRef() { return instanceRef(this.ctx.id); }
  async held() {
    const until = await this.ctx.storage.get(HOLD_KEY);
    return typeof until === 'number' && Date.now() < until;
  }
  async lifecycle(what, extra = {}) {
    let hold = false;
    try { hold = await this.held(); } catch { /* storage unread: no hold */ }
    log({ event: 'runner.lifecycle', instance_ref: this.instanceRef, what, ...extra, signin_hold: hold });
  }

  // Every request goes to the image's one port; a caller cannot pick another. R26: an answer that is not the image's
  // JSON (the library's own text) is answered JSON 503 RUNNER_NOT_STARTED. R25: a sign-in's answers set and clear the
  // hold, read from their path, status and the waiting header alone, never a body.
  async fetch(request) {
    let res;
    try { res = await this.containerFetch(request, this.defaultPort); }
    catch (e) { res = new Response(`Failed to reach the container: ${e && e.message ? e.message : e}`, { status: 500 }); }
    if (res.status !== 101 && !/^application\/json\b/i.test(res.headers.get('content-type') || '')) {
      const said = libraryWords(await res.text().catch(() => ''));
      res = new Response(JSON.stringify({ ok: false, code: 'RUNNER_NOT_STARTED', status: res.status, detail: STARTED_WORDS,
        library_detail: said, trace: traceOf(request) }), { status: 503, headers: { 'content-type': 'application/json' } });
    }
    if (request.method === 'POST') await this.holdAfter(new URL(request.url).pathname, res);
    return res;
  }

  async holdAfter(path, res) {
    const waiting = res.headers.get(WAITING_HEADER) === '1';
    if (path === '/signin') {
      if (res.status === 200) await this.ctx.storage.put(HOLD_KEY, Date.now() + SIGNIN_HOLD_MS);
      else await this.ctx.storage.delete(HOLD_KEY);
    } else if (path === '/signin/code') {
      if (res.status === 200 || (res.status === 409 && !waiting)) await this.ctx.storage.delete(HOLD_KEY);
    } else if (path === '/signout') {
      await this.ctx.storage.delete(HOLD_KEY);
    }
  }

  // R25: the sleep timer never ends a waiting sign-in. While the hold is in force the timeout is renewed and nothing
  // stops; past its deadline it is cleared and `sleepAfter` governs as before.
  async onActivityExpired() {
    if (await this.held()) {
      await this.lifecycle('held_awake');
      this.renewActivityTimeout();
      return;
    }
    await this.ctx.storage.delete(HOLD_KEY);
    await this.lifecycle('activity_expired');
    return super.onActivityExpired();
  }

  // R30: the lifecycle, one line each.
  async startAndWaitForPorts(...args) {
    this.startedAt = Date.now();
    await this.lifecycle('start');
    return super.startAndWaitForPorts(...args);
  }
  async onStart() {
    await this.lifecycle('started', this.startedAt ? { ms: Date.now() - this.startedAt } : {});
    return super.onStart();
  }
  async onStop(params) {
    await this.lifecycle('stop');
    return super.onStop(params);
  }
  async onError(error) {
    // The library's own handler only prints the raw error and rethrows; this line replaces its print (R29's scrub).
    await this.lifecycle('error', { error_head: libraryWords(error && error.message ? error.message : error) });
    throw error;
  }
}

// R15: the module's default export, so wrangler deploys the class and its container. It holds no state.
export default {
  fetch() {
    return new Response(UNKNOWN, { status: 404, headers: { 'content-type': 'application/json' } });
  },
};
