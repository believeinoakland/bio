/* POST /render (R7): the safe view. R1's and R2's checks for one target, then the copy is streamed to the
 * `SafeViewRenderer` image (container/renderer.mjs), whose answer, a PDF of page images and its headers, passes through. */
import { SAFE_VIEW_DPI, SAFE_VIEW_PAGES_MAX, SAFE_VIEW_BYTES_MAX, RENDER_TIME_MS, SCAN_LIMITS } from './limits.mjs';
import { normaliseTarget, knownStore, sizeTarget, targetStream } from './store.mjs';
import { localize } from '../../bio-plane/src/setup-words/index.mjs';

const STATUS = { NOT_FOUND: 404, DIGEST_MISMATCH: 409, TOO_LARGE: 413 };
const refuse = (status, code, extra = {}) => new Response(JSON.stringify({ ok: false, code, ...extra }),
  { status, headers: { 'content-type': 'application/json' } });
const KNOWN = new Set(['ENCRYPTED', 'NOT_RENDERABLE', 'TIME_LIMIT', 'RENDER_FAILED']);
const PASSED = ['content-type', 'x-derived-sha256', 'x-pages', 'x-source-pages', 'x-truncated', 'x-source-pages-exact'];
/** R7 (G136b): a refusal of the render itself says whether a later try can succeed: `transient` (the render ran out of
 *  time, or the renderer was not reached: the caller retries with back-off) or `final` (this document will not render). */
const failed = (status, code, cls, extra = {}) => refuse(status, code, { class: cls, ...extra });
/** The renderer's figures, quoted from the table by this Worker (its image cannot import it). */
const figures = () => `dpi=${SAFE_VIEW_DPI}&max=${SAFE_VIEW_PAGES_MAX}&bytes=${SAFE_VIEW_BYTES_MAX}&ms=${RENDER_TIME_MS}`
  + `&entries=${SCAN_LIMITS.max_files}&directory=${SCAN_LIMITS.zip_directory}`;
/** The renderer's PDF as a stream that ends in an error past `max` bytes: the image cuts the view itself, so this holds
 *  only against an image that does not. */
const held = (body, max) => {
  let n = 0;
  return body.pipeThrough(new TransformStream({ transform(chunk, c) { n += chunk.byteLength; if (n > max) c.error(new Error('SAFE_VIEW_BYTES_MAX')); else c.enqueue(chunk); } }));
};

/** The target's check, shared with the outside tools' routes: `{t, store}` once it passes, else `{refusal}`, a refusal Response. */
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
    r = await deps.renderer(`/render?route=${body.route}&${figures()}`,
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
  if (!r) return failed(503, 'RENDER_FAILED', 'transient', { message: localize('file-scanner.render.the_renderer_could_not', 'the renderer could not be reached') });
  if (r.status !== 200) {
    const e = await r.json().catch(() => ({}));
    const code = KNOWN.has(e.code) ? e.code : 'RENDER_FAILED';
    const message = code === 'RENDER_FAILED' && e.reason === 'FIRST_PAGE_OVER_BOUND' ? localize('file-scanner.render.the_first_page_is_over_the_limit', 'the first page of the safe view is over the limit of {limit} bytes', { limit: String(SAFE_VIEW_BYTES_MAX) })
      : code === 'NOT_RENDERABLE' ? (typeof e.message === 'string' && e.message ? e.message.slice(0, 300) : undefined)
      : code === 'RENDER_FAILED' ? String(e.message || localize('file-scanner.render.the_renderer_answered_status', 'the renderer answered {status}', { status: String(r.status) })).slice(0, 300) : undefined;
    return failed(code === 'TIME_LIMIT' ? 504 : code === 'RENDER_FAILED' ? 500 : 422, code, code === 'TIME_LIMIT' ? 'transient' : 'final', message ? { message } : {});
  }
  const declared = Number(r.headers.get('content-length'));
  if (declared > SAFE_VIEW_BYTES_MAX) {
    await r.body?.cancel().catch(() => {});
    return failed(500, 'RENDER_FAILED', 'final', { message: localize('file-scanner.render.the_safe_view_is_over_the_limit', 'the safe view is {bytes} bytes, over the limit of {limit}', { bytes: String(declared), limit: String(SAFE_VIEW_BYTES_MAX) }) });
  }
  const headers = new Headers();
  for (const h of PASSED) if (r.headers.get(h) !== null) headers.set(h, r.headers.get(h));
  return new Response(held(r.body, SAFE_VIEW_BYTES_MAX), { status: 200, headers });
}
