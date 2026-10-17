// The copy's own log of a remote conversation and sign-in (R39; K3608, K1874): one JSON line per step, none missing,
// written by the code that makes the step, so what the copy sent and received is known from its own lines and not from
// the plane's log, which has no sizes and missed calls (HAND S9). A line is built only from the closed list of fields
// below: the step's name, its outcome and refusal code, its status, its time and byte counts, and a digest prefix of the
// session's id; a credential, code, conversation credential, prompt, tool content, answer text or header has no field
// and so is never logged. It runs under Node and in a Worker (Web Crypto only).
export const REMOTE_EVENT = 'remote.runner';
export const REMOTE_STEPS = Object.freeze(['signin.start', 'signin.code', 'create', 'prompt', 'tool', 'answer', 'end']);
export const SESSION_REF_HEX = 12;
const SAFE = /^[A-Za-z0-9._:-]{1,128}$/;
const CODE = /^[A-Z][A-Z0-9_]{0,63}$/;
const OUTCOMES = ['ok', 'refused', 'failed'];

const count = (x) => (Number.isInteger(x) && x >= 0 ? x : 0);
const safe = (v) => (typeof v === 'string' && SAFE.test(v) ? v : null);

// The first 12 hex characters of the SHA-256 of a session's id: enough to join lines, never the id itself.
export async function sessionRef(id) {
  if (typeof id !== 'string' || id.length === 0) return null;
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, SESSION_REF_HEX);
}

// One conversation's or sign-in's log. `trace` and `memberRef` are the caller's headers (R29), a trace minted here when
// none is safe; `conv` names the conversation, minted when none is given. `step(name, run)` runs `run()`, which answers
// `{status, bytes_in, bytes_out, outcome?, code?, session?}`, and writes exactly one line for it, also when it throws
// (outcome `failed`, the error's own `code` when it is a code, else `REMOTE_UNAVAILABLE`, and the error's byte counts
// when it carries them); it answers what `run` answered, or rethrows.
export function remoteLog({ trace, memberRef = null, conv, log = (line) => console.log(JSON.stringify(line)), now = Date.now } = {}) {
  const ids = { trace: safe(trace) || crypto.randomUUID(), member_ref: safe(memberRef), conv: safe(conv) || crypto.randomUUID() };
  const write = async (step, ms, r) => {
    const outcome = OUTCOMES.includes(r.outcome) ? r.outcome : 'failed';
    const code = typeof r.code === 'string' && CODE.test(r.code) ? r.code : undefined;
    const ref = await sessionRef(r.session).catch(() => null);
    log({ event: REMOTE_EVENT, ...ids, step, outcome, ...(code && outcome !== 'ok' ? { code } : {}),
      status: Number.isInteger(r.status) ? r.status : null, ms, bytes_in: count(r.bytes_in), bytes_out: count(r.bytes_out),
      ...(ref ? { session_ref: ref } : {}) });
  };
  return {
    ...ids,
    async step(name, run) {
      if (!REMOTE_STEPS.includes(name)) throw new TypeError(`no remote step named ${String(name).slice(0, 40)}`);
      const t0 = now();
      let r;
      try { r = await run(); } catch (e) {
        await write(name, now() - t0, { outcome: 'failed', code: e && CODE.test(e.code || '') ? e.code : 'REMOTE_UNAVAILABLE',
          status: e && e.status, bytes_in: e && e.bytes_in, bytes_out: e && e.bytes_out, session: e && e.session });
        throw e;
      }
      await write(name, now() - t0, { outcome: 'ok', ...(r || {}) });
      return r;
    },
  };
}
