/* POST /render (R7): the safe view. R1's and R2's checks for one target, then the copy is streamed to the
 * `SafeViewRenderer` image (container/renderer.mjs), whose answer, a PDF of page images and its headers, passes through. */
import { SAFE_VIEW_DPI, SAFE_VIEW_PAGES_MAX } from './limits.mjs';
import { normaliseTarget, knownStore, sizeTarget, targetStream } from './store.mjs';

const STATUS = { NOT_FOUND: 404, DIGEST_MISMATCH: 409, TOO_LARGE: 413 };
const refuse = (status, code, extra = {}) => new Response(JSON.stringify({ ok: false, code, ...extra }),
  { status, headers: { 'content-type': 'application/json' } });
const KNOWN = new Set(['ENCRYPTED', 'NOT_RENDERABLE', 'TIME_LIMIT', 'RENDER_FAILED']);
const PASSED = ['content-type', 'x-derived-sha256', 'x-pages', 'x-source-pages', 'x-truncated'];

/** The target's check and copy, shared with the outside tools' routes: `{ok:true, t, bytes}` or a refusal Response. */
export async function checkOne(deps, body) {
  if (!body || !knownStore(body.store)) return { refusal: refuse(400, 'NAMESPACE_UNKNOWN') };
  const t = normaliseTarget(body.target);
  if (!t) return { refusal: refuse(400, 'BAD_TARGET') };
  if (!deps.bucket) return { refusal: refuse(503, 'R2_NOT_CONFIGURED') };
  return { t, store: body.store };
}

export async function render(deps, body) {
  const c = await checkOne(deps, body);
  if (c.refusal) return c.refusal;
  if (body.route !== 'pdf' && body.route !== 'office') return refuse(400, 'NOT_RENDERABLE');
  const size = await sizeTarget(deps.bucket, c.store, c.t);
  if (!size.ok) return refuse(STATUS[size.reason], size.reason);
  const { stream, outcome } = targetStream(deps.bucket, c.store, c.t);
  let r;
  try {
    r = await deps.renderer(`/render?route=${body.route}&dpi=${SAFE_VIEW_DPI}&max=${SAFE_VIEW_PAGES_MAX}`,
      { method: 'POST', body: stream, duplex: 'half' });
  } catch { r = null; }
  // An answer that came before the copy was read whole settles nothing about the bytes: a refusal stands, a PDF does not.
  const PENDING = {};
  let o = await Promise.race([outcome, new Promise((res) => setTimeout(() => res(PENDING), 0))]);
  if (o === PENDING) {
    if (r && r.status === 200) { await r.body?.cancel().catch(() => {}); r = null; }
    o = { ok: true };
  }
  if (!o.ok) return refuse(STATUS[o.reason] || 409, o.reason in STATUS ? o.reason : 'DIGEST_MISMATCH');
  if (!r) return refuse(503, 'RENDER_FAILED', { message: 'the renderer could not be reached' });
  if (r.status !== 200) {
    const e = await r.json().catch(() => ({}));
    const code = KNOWN.has(e.code) ? e.code : 'RENDER_FAILED';
    const message = code === 'RENDER_FAILED' ? String(e.message || `the renderer answered ${r.status}`).slice(0, 300) : undefined;
    return refuse(code === 'TIME_LIMIT' ? 504 : code === 'RENDER_FAILED' ? 500 : 422, code, message ? { message } : {});
  }
  const headers = new Headers();
  for (const h of PASSED) if (r.headers.get(h) !== null) headers.set(h, r.headers.get(h));
  return new Response(r.body, { status: 200, headers });
}
