/* The installer's way to Cloudflare's management API (R66; F4, F6): one request function that waits out a slow, rate-limited
 * (429) or transiently failed (5xx or no answer) reply, backing off within one stated bound and drawing each wait; an
 * expired or revoked permission (401) ends the run asking for the founder's approval again (F6, R71), and a reply that
 * never comes right within the bound is a lasting failure, named as one.
 *
 * Waits are counted in NOMINAL seconds (the delays asked for), not read from a clock, so they are the same in a test that
 * makes every timer immediate and on the platform. */

/* R66: the bound `screen.install.progress.retrying` states in minutes. The word list gives none; the job proposes it from the
   measures of install-situations.md (S5, S8: a cold address answered after 6.7 s once and "a few minutes" otherwise; a
   fresh Worker's first start missed 30 s) and BOB sets it. */
export const WAIT_BOUND_MINUTES = 5;
const BACKOFF_FIRST_S = 2, BACKOFF_CAP_S = 30;

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* The request failed in a way that waiting can mend: a rate limit, a server error, or no answer at all. */
export const transient = (e) => !!e && !e.final && (e.status === 429 || e.status >= 500 || e.network === true);

export class Lasting extends Error {
  constructor(cause) { super(cause.message); this.lasting = true; this.cause = cause; this.status = cause.status; this.code = cause.code; }
}
export class ApproveAgain extends Error {
  constructor() { super("the permission was revoked or has expired"); this.approveAgain = true; }
}

/* A run's connection to Cloudflare: the access token (in this object only, held for the seconds the run takes) and what a
   wait is drawn through. `bearer` is read only where a request is made. */
export class Session {
  #token;
  constructor(token, onWait = null) { this.#token = token; this.onWait = onWait; }
  get bearer() { return "Bearer " + this.#token; }
  toString() { return "[session]"; }
}

/* Waits for `fn` to succeed while its failures are transient, nominal bound `minutes`. `onWait(waitedS, boundS)` is told
   before each wait. A failure that is not transient throws as it is; one still transient at the bound throws Lasting. */
export async function patiently(fn, { onWait = null, minutes = WAIT_BOUND_MINUTES } = {}) {
  const bound = minutes * 60;
  let waited = 0, delay = BACKOFF_FIRST_S;
  for (;;) {
    try { return await fn(); }
    catch (e) {
      if (e && e.approveAgain) throw e;
      if (!transient(e)) throw e;
      if (waited >= bound) throw new Lasting(e);
      if (onWait) await onWait(waited, bound);
      await sleep(delay * 1000);
      waited += delay; delay = Math.min(delay * 2, BACKOFF_CAP_S);
    }
  }
}

const IDEMPOTENT = new Set(["GET", "PUT", "DELETE", "HEAD"]);

/* One Cloudflare API call; `init.idem` marks a POST that is safe to repeat. */
export async function cf(session, path, init = {}, base) {
  const { idem = false, ...rest } = init;
  const method = (rest.method || "GET").toUpperCase();
  const attempt = async () => {
    let r;
    try {
      r = await fetch(base + path, { ...rest, headers: {
        authorization: session.bearer,
        ...(rest.body instanceof FormData ? {} : { "content-type": "application/json" }),
        ...(rest.headers || {}) } });
    } catch (e) { const err = new Error(String(e && e.message || e)); err.network = true; throw err; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) {
      const e = new Error(j.errors?.[0]?.message || `HTTP ${r.status}`);
      e.code = j.errors?.[0]?.code;
      e.status = r.status;
      if (r.status === 401) throw Object.assign(new ApproveAgain(), { status: 401, apiMessage: e.message });
      throw e;
    }
    return j.result;
  };
  const retryable = IDEMPOTENT.has(method) || idem;
  return patiently(async () => {
    try { return await attempt(); }
    catch (e) {
      /* A POST that is not safe to repeat is repeated only when the platform said it did nothing (429). */
      if (!retryable && e.status !== 429) e.final = true;
      throw e;
    }
  }, { onWait: session.onWait });
}
