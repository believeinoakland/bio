/* signin-door: THE STORE'S HALF OF THE SIGN-IN DOOR (R2, R4, R5). Store-internal routes with no op spec
   (`op-declarations` R6), reached only by the door's own requests from the Worker (`index.mjs`), never by a caller: each
   asks `credentials` in process for what is in-plane there (its R64 `disclosureDue`, R70 `subscriptionTokenHold` and
   `subscriptionTokenRefused`), or keeps and reads R5's bounded trace. The plane spreads `signinDoorOps` into the store's
   one route map (the `credentialsOps` pattern); `c` is the store's `credentials` (`credentialsOf(ctx)`), `url` carries
   the door's stamp `by` in its query, read after the body, `body` the parsed body, `env` the store's environment.

   R2: `signindisclosuredue?by=<member>` answers `credentials.disclosureDue({member})`'s refusal as given, or
   `{ok: true}` when it answers null (the `aikeptaway` form, `store-door` R10).
   R4: `signintokenhold?by=<member>` hands `{token, validFor}` from the body to `subscriptionTokenHold` for that member
   and answers its result, which never carries the token; `signintokenrefused?by=<member>` calls
   `subscriptionTokenRefused`.
   R5: `signintracekeep` keeps one line (only `TRACE_FIELDS`, each a short scalar) and `signintraceread` answers the last
   `SIGNIN_TRACE_MAX` lines, both on a test instance only: elsewhere nothing is kept and no line is read (the refusal
   `SIGNINTRACE_NOT_TEST` is the door's, its one site, `index.mjs`'s `signintrace`; K231, K3143). The trace is held in
   the store object's memory, never in a table: bounded, lost when the object is evicted, and holding no token, secret or code. */
import { SIGNIN_TRACE_MAX, TRACE_FIELDS, testInstanceOf } from "./index.mjs";

/* R5: one trace per store's `credentials` (one per store object), oldest first. */
const TRACES = new WeakMap();
/* R5: a kept field is a short scalar; anything longer or of another kind is not kept. */
const FIELD_MAX = 200;
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function traceOf(c) {
  let t = TRACES.get(c);
  if (!t) { t = []; TRACES.set(c, t); }
  return t;
}

/** R5: the line as kept: only the named fields, each a boolean, a finite number or a string of at most 200 characters. */
export function keptLine(line) {
  if (!isObject(line)) return null;
  const out = {};
  for (const k of TRACE_FIELDS) {
    const v = line[k];
    if (typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && v.length <= FIELD_MAX))
      out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

export function signinDoorOps(c, url, body, env) {
  const by = () => url.searchParams.get("by");
  const b = isObject(body) ? body : {};
  return {
    signindisclosuredue: () => c.disclosureDue({ member: by() }) ?? { ok: true },
    signintokenhold: () => c.subscriptionTokenHold({ member: by(), token: b.token ?? null, validFor: b.validFor ?? null }),
    signintokenrefused: () => c.subscriptionTokenRefused({ member: by() }),
    signintracekeep: () => {
      if (!testInstanceOf(env)) return { ok: true, kept: false };
      const line = keptLine(b.line);
      if (!line) return { ok: true, kept: false };
      const t = traceOf(c);
      t.push(line);
      if (t.length > SIGNIN_TRACE_MAX) t.splice(0, t.length - SIGNIN_TRACE_MAX);
      return { ok: true, kept: true };
    },
    signintraceread: () => ({ ok: true, max: SIGNIN_TRACE_MAX, lines: testInstanceOf(env) ? traceOf(c).slice() : [] }),
  };
}
