/* admission's test harness: a fake `env` whose `STORE` is shaped like a Durable Object namespace and records every
   inner request, the reader the door passes in (`doAnswer`'s contract: `{answered, result, correlation?}`), the
   callers, and a `gate` driver that runs the gates in the door's order (R1, R20's address gate, R17/R19's query gate,
   R6's lookup, R2, R3, then `admit` and R12) and answers the first refusal, silence or admission. Every test drives the module at its interface. */
import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";

export const A = await import("../../../src/admission/index.mjs");
export const C = await import("../../../src/admission/checks.mjs");
export const O = await import("../../../src/op-declarations/index.mjs");

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const hex64 = () => randomBytes(32).toString("hex");
export const aik = () => `aik-${hex64()}`;
export const PLACES = /\b(oakland|alameda|berkeley|california|san francisco|bay area|emeryville|contra costa)\b/i;

/* The door's reader of a store reply, by its contract (control-plane R23, R25): `ok: true` is an answer; anything
   else, unreadable included, is not, and the store's internal error carries its correlation id. */
export async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  if (out.ok === true) return { answered: true, result: out.result };
  return typeof out.correlation === "string" ? { answered: false, result: undefined, correlation: out.correlation }
    : { answered: false, result: undefined };
}

const ok = (result) => new Response(JSON.stringify({ ok: true, result }));

/** A fake env. `sessions` maps a 64-hex token to its session row; `creds` maps an `aik-` value to its credential row
 *  (looked up by SHA-256, as the module asks). Each inner request is recorded with its route, query, body and `x-bio-`
 *  headers. `answer(call)` may return a Response to override a route. */
export function makeEnv({ sessions = {}, creds = {}, answer = null, omit = [] } = {}) {
  const calls = [];
  const bySha = new Map(Object.entries(creds).map(([v, c]) => [sha(v), c]));
  const env = {
    ADMIN_TOKEN: hex64(), MEMBER_TOKEN: hex64(), PROBE_TOKEN: hex64(), DAEMON_TOKEN: hex64(),
    calls,
    STORE: {
      idFromName(n) { return n; },
      get(id) {
        return {
          async fetch(input, init) {
            const isReq = typeof input === "object" && input !== null && typeof input.url === "string";
            const u = new URL(isReq ? input.url : String(input));
            const method = (isReq ? input.method : init?.method) || "GET";
            let raw = null;
            try { raw = isReq ? await input.clone().text() : (typeof init?.body === "string" ? init.body : null); } catch { raw = null; }
            let body = null;
            try { body = raw ? JSON.parse(raw) : null; } catch { body = null; }
            const hs = isReq ? input.headers : new Headers(init?.headers || {});
            const headers = Object.fromEntries([...hs].filter(([k]) => k.startsWith("x-bio-")));
            const call = { ns: id, route: u.pathname.slice(1), params: Object.fromEntries(u.searchParams), href: u.href,
                           method, body, raw: raw ?? "", headers };
            calls.push(call);
            if (answer) { const r = await answer(call); if (r) return r; }
            /* store-door's hand-over (its R9, K2038): `x-bio-session` reaches credentials' map as `t`,
               `x-bio-credential-sha` as `sha`, on the in-process URL; the request's own address carries neither */
            const HAND = { t: "x-bio-session", sha: "x-bio-credential-sha" };
            const arg = (k) => headers[HAND[k]] ?? null;
            if (call.route === "session") return ok({ session: sessions[arg("t")] ?? null });
            if (call.route === "aicredentiallook") {
              const c = bySha.get(arg("sha"));
              return ok(c ? { found: true, credential: c } : { found: false });
            }
            return ok({ ok: true });
          },
        };
      },
    },
  };
  for (const k of omit) delete env[k];
  return env;
}

export const founder = (caps = []) => ({ role: "admin", capabilities: caps, administer: true, rootOfTrust: true, handle: "founder" });
export const member = (id, caps = []) => ({ role: `member:${id}`, capabilities: caps, administer: false, rootOfTrust: false, handle: id });
export const cred = (extra = {}) => ({ tokenId: "agent-1", principal: "member:ann", writes: [], revoked: false,
                                       confinedTo: null, taskScope: "t", ...extra });

/** Every kind of caller: sessions S, agent credentials K, and the four bindings on `env`. */
export function world(opts = {}) {
  const allCaps = opts.caps ?? ["contribute", "publish", "create_projects"];
  const S = { founder: hex64(), ann: hex64(), bare: hex64() };
  const K = { ann: aik(), revoked: aik(), confined: aik(), org: aik() };
  const sessions = { [S.founder]: founder(allCaps), [S.ann]: member("ann", allCaps), [S.bare]: member("bea", []),
                     ...(opts.sessions || {}) };
  const creds = {
    [K.ann]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: opts.writes ?? [] }),
    [K.revoked]: cred({ tokenId: "agent-old", revoked: true, revokedAt: "2026-09-01", revokedBy: "ann" }),
    [K.confined]: cred({ tokenId: "agent-sandbox", confinedTo: "scratch" }),
    [K.org]: cred({ tokenId: "agent-org", principal: "class:ai" }),
    ...(opts.creds || {}),
  };
  const env = makeEnv({ sessions, creds, answer: opts.answer, omit: opts.omit });
  return { env, S, K };
}

/** The door's `presentedCredential` answer for `token` sent in a JSON body, for the gates called on their own. */
export const presenting = (token) => A.presentedCredential({ body: token === undefined ? null : { token } });

export const urlOf = (params = {}) => {
  const u = new URL("https://plane.example/api");
  for (const [k, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(k, v);
  return u;
};

/** A request carrying `token`: `via` "header" (`Authorization: Bearer`, the default), "body" (a JSON body's `token`)
 *  or "query" (the address, which R20 refuses). Answers `{ url, req, body }`. */
export function requestOf({ token, params = {}, via = "header", method = "POST", extraBody = {} } = {}) {
  const url = urlOf({ ...params, ...(via === "query" ? { token } : {}) });
  const headers = new Headers();
  if (via === "header" && token !== undefined && token !== null && token !== "") headers.set("authorization", `Bearer ${token}`);
  const body = method === "GET" ? null : { ...extraBody, ...(via === "body" && token !== undefined ? { token } : {}) };
  const req = new Request(url, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { url, req, body };
}

/** The gates in the door's order, for a request naming `op` with `token` and `params`. Answers one of
 *  `{ refusal }`, `{ silent }`, `{ public: true, url }` (a public op past R1–R3) or `{ caller, url, credential }`.
 *  `via` sends the credential: "header" by default, "body", or "query" (refused by R20's gate). */
export async function gate(env, { op, token, params = {}, method = "POST", tables, via = "header" }) {
  const { url, req, body } = requestOf({ token, params, via, method });
  const spec = Object.hasOwn(O.OPS, op) ? O.OPS[op] : undefined;
  assert.ok(spec, `test asks an op with a spec: ${op}`);
  const ns = A.namespaceGate(url);
  if (ns) return { refusal: ns };
  const credential = A.presentedCredential({ req, url, body });
  const inAddress = A.credentialAddressGate(url, credential);
  if (inAddress) return { refusal: inAddress };
  A.queryGate(url, op, credential);
  const presented = await A.aiCredentialPresented(url, env, doAnswer, { credential, op });
  if (presented.silent) return { silent: presented.silent };
  const confined = A.confinedNamespaceGate(url, presented.cred);
  if (confined) return { refusal: confined };
  const pinned = A.pinnedNamespaceGate(url, op, spec);
  if (pinned) return { refusal: pinned };
  if (spec.classes === null) return { public: true, url, credential };
  const a = await A.admit({ url, env, op, spec, method, presented, doAnswer, credential, ...(tables ? { tables } : {}) });
  if (!a.caller) return a;
  const fence = A.bearerFence(op, a.caller);
  if (fence) return { refusal: fence };
  return { caller: a.caller, url, credential };
}

/** Session tables of op-declarations' shape, arranged from its own (which are frozen) by `edit(member, admin, decided)`. */
export function arranged(edit) {
  const member = new Set(O.SESSION_OPS.member), admin = new Set(O.SESSION_OPS.admin);
  const decided = { ...O.UNATTENDED_BY_DECISION };
  edit(member, admin, decided);
  return { SESSION_OPS: { member, admin }, UNATTENDED_BY_DECISION: decided };
}

/** A refusal as the module answers one: its status, `ok:false`, the code as `reason` and `code`, its C-number and row's
 *  sentence, and no credential value anywhere in it (R15). */
export function refused(r, status, code, check, secrets = []) {
  assert.ok(r && r.refusal, `${code}: expected a refusal, got ${JSON.stringify(r).slice(0, 300)}`);
  const { status: st, body } = r.refusal;
  assert.equal(st, status, `${code}: ${JSON.stringify(body).slice(0, 300)}`);
  assert.equal(body.ok, false);
  assert.equal(body.reason, code);
  assert.equal(body.code, code);
  assert.equal(body.check, check);
  assert.equal(typeof body.translation, "string");
  assert.ok(body.translation.length > 0);
  const text = JSON.stringify(body);
  for (const s of secrets) if (s) assert.equal(text.includes(s), false, `${code} carries a credential`);
  assert.doesNotMatch(text, PLACES);
  return body;
}

/** The inner requests that are not the credential lookups. */
export const opCalls = (env) => env.calls.filter((c) => c.route !== "session" && c.route !== "aicredentiallook");
