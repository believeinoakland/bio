/* admission: WHO MAY CALL AN OP, judged before the op runs (R1–R22). The namespace a request addresses, the class its
   credential gives, the agent credential's confinement and task scope, the session's reach and capabilities, and the
   fences a bearer meets. It decides whether a caller is admitted and as whom, and answers a refusal that names why; it
   never runs an op or answers one.

   Copied from `control-plane/index.mjs` at the control-plane split (T18, K617, K624 (1), (2)): `classify`, `scopeFor`,
   the namespace gates, the agent credential's resolution, confinement and task scope, `resolveSession`, `sessionOpGate`,
   the admission region of `makeFetch` (as `admit`), the bearer fences (as `bearerFence`) and the mint's declarations.
   Control-plane's own T18 job, after this module merged, deleted its copy; its door calls these (control-plane R28).

   THE SHAPE OF AN ANSWER. A gate answers `null` to admit, or a REFUSAL: `{ status, body }`, `body` the whole refusal
   (`ok: false`, the code as `reason` and `code`, its row's `check` and `translation`, and the gate's own fields), which
   the door answers at `status` as given, in its envelope. Each code is a STRING LITERAL at its site inside its DEC-49
   region, and each refusal is built whole there: no caller adds a field to it or reads its code from a variable, so
   every verdict is stated where it is minted (N411: the door's `...scoped.error` spread, which inherited the agent
   gate's code at the admission region, is gone). A store this module asks (the agent credential's row, a session) is
   asked through the door's reader, `doAnswer`, passed in, and a store that does not answer is a SILENCE,
   `{ silent: { op, correlation? } }`, which the door answers as its own 502 (R6; control-plane R23) and never as a
   statement about the caller.

   T35 (T35-71; F1, F4, F12, N703, K1934 (5)): every gate judges the credential `presentedCredential` answers (R20: the
   `Authorization` header's, else the JSON body's, else, for T35's release only, the query's), the binding classes are
   compared as digests in constant time (R5), an expired agent credential is refused by name (R10), the credential-free
   ops meet one window per source (R21), and the refusals R22 names are counted in credentials' security tally. */
import { liveToken, sha256hex } from "../tokens.mjs";
import { MACHINE_CLASS_PREFIX } from "../record-grammar/index.mjs";
import { OPS, SESSION_OPS, NEEDS, UNATTENDED_BY_DECISION, GOVERNANCE_ACTIONS, IDENTITY_ACTIONS } from "../op-declarations/index.mjs";
import { ADMISSION_CHECKS, NAMESPACE_CHECKS, AI_SCOPE_CHECKS, OPERATOR_FENCE_CHECKS, GROUP_IDENTITY_FENCE_CHECKS } from "./checks.mjs";

export const SCRATCH = "scratch";
/* D-456 (C-78.1): the namespaces, exact and case-sensitive (a Durable Object name is an exact string). */
export const NAMESPACES = Object.freeze(["bio", SCRATCH]);

/* A row's DEC-49 fields, read from the ONE row. It THROWS rather than returning a partial row: DEC-49 exists because a
   refusal once shipped `translation: undefined` to a member, and a throw is a loud failure where a missing sentence is
   a silent one that reaches a person. */
function rowOf(table, family, code) {
  const row = table[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`admission: ${code} has no ${family} row with a canned translation `
                  + `(DEC-49). A code with no sentence behind it must not reach a member.`);
  return { code, check: row.check, translation: row.translation };
}
const admissionRow = (code) => rowOf(ADMISSION_CHECKS, "ADMISSION_CHECKS", code);
const namespaceRow = (code) => rowOf(NAMESPACE_CHECKS, "NAMESPACE_CHECKS", code);
const aiScopeRow = (code) => rowOf(AI_SCOPE_CHECKS, "AI_SCOPE_CHECKS", code);
const operatorFenceRow = (code) => rowOf(OPERATOR_FENCE_CHECKS, "OPERATOR_FENCE_CHECKS", code);
const identityFenceRow = (code) => rowOf(GROUP_IDENTITY_FENCE_CHECKS, "GROUP_IDENTITY_FENCE_CHECKS", code);

/* ===================================================================================================================
 * NAMESPACES, BEFORE ANY CREDENTIAL IS JUDGED (R1–R4)
 * =================================================================================================================== */

/* R1 (D-456, C-78.1) — A NAMESPACE THAT DOES NOT EXIST IS REFUSED BY NAME, FOR EVERY CALLER, AT THE FRONT DOOR.
   `store=biosmoke-pdf`, `store=Scratch` and an empty `store=` once all addressed the REAL record, and a live
   verification whose no-write guarantee is naming its namespace (D-325) wrote production while believing it was
   elsewhere. This runs once, before a credential is classified, so every class and the no-credential path meet one
   refusal from one governed span. `store=` absent is not a refusal. Nothing is read or written when this answers. */
export function namespaceGate(url) {
  if (!url.searchParams.has("store")) return null;
  const asked = url.searchParams.get("store");
  if (NAMESPACES.includes(asked)) return null;
  /* DEC-49 REGION is-namespace-gate */
  return { status: 400, body: { ok: false, reason: "NAMESPACE_UNKNOWN", ...namespaceRow("NAMESPACE_UNKNOWN"),
           error: `no namespace ${JSON.stringify(asked.slice(0, 80))} exists on this instance`,
           asked: asked.slice(0, 80), namespaces: [...NAMESPACES] } };
  /* END DEC-49 REGION is-namespace-gate */
}

/* R3 (D-461, C-78.2) — A PUBLIC OP THAT ALWAYS ANSWERS FROM `bio` REFUSES `store=scratch` BY NAME. `op=knock&store=scratch`
   once filed a knock in the REAL record's inbox and answered `ok`. Refuse, never redirect: the caller is told. THE SET
   IS INVERTED ON PURPOSE: it lists the public ops that DO address scratch (each reads `store=` itself), so a public op
   added later is refused `store=scratch` until somebody makes it answer from scratch and lists it here — the unlisted
   default is the refusal, never the real record. Gated ops take their namespace from `scopeFor`.
   T34 (DEC-133, DEC-132; R3 as amended): the two doors and `groupdescription` join, since each namespace holds its own
   website key, join link and description, as it holds its own invitations and identity. */
export const SCRATCH_ADDRESSING_PUBLIC_OPS = Object.freeze(["invitelook", "enroll", "instancegroup", "groupidentity",
                                                            "websiteinvite", "joinlinkinvite", "groupdescription"]);
export function pinnedNamespaceGate(url, op, spec) {
  if (spec.classes !== null || SCRATCH_ADDRESSING_PUBLIC_OPS.includes(op)) return null;
  if (url.searchParams.get("store") !== SCRATCH) return null;
  /* DEC-49 REGION is-pinned-namespace-gate */
  return { status: 400, body: { ok: false, reason: "NAMESPACE_PINNED", ...namespaceRow("NAMESPACE_PINNED"),
           error: `op=${op} always answers from the bio namespace and has no ${SCRATCH} counterpart; nothing was read or written`,
           op, asked: SCRATCH, pinned: "bio" } };
  /* END DEC-49 REGION is-pinned-namespace-gate */
}

/* R17, R19 — WHAT A REQUEST'S QUERY MAY NOT CARRY, judged once, after R1 and before the agent credential is looked up
   (R6) or its confinement applied (R2). It never refuses and answers `null`; it removes from the URL what the op takes
   from the request's BODY ONLY, so no later reader of the URL (the door's relay, a reader of `store=`, a log of the
   address) can take it from there, and a secret is never kept in an address:
     - the DOORS (`websiteinvite`, the group's website's call; `joinlinkinvite`, the join page's call; R17) are admitted
       with no credential, and whoever calls, nothing about the caller reaches the act: the caller's `token` is removed
       too, so no credential is looked up, no confinement applies and no reader sees a caller; the act is recorded only
       as its door's (`membership` R105). The key or link and the cover are the body's; one sent in the query is gone,
       and the call answers as `membership` answers a missing key or link. The daily cap is `membership`'s (its R101,
       R104), relayed by the door; admission's one limit is R21's per-source window, over every public op alike.
     - `groupkeyset` (R19): the group's API key is the body's; one sent in the query is gone, and the call answers as
       `credentials` answers an empty key (`NO_SECRET`). The session's `token` stays: the act is a session's own.
   Every other op's URL is left as it came. */
export const PUBLIC_DOORS = Object.freeze(["joinlinkinvite", "websiteinvite"]);
export const BODY_ONLY_FIELDS = Object.freeze({
  websiteinvite: Object.freeze(["cover", "key"]),
  joinlinkinvite: Object.freeze(["cover", "link"]),
  groupkeyset: Object.freeze(["key"]),
});
/* R20 (T35) — and when the door passes its `presentedCredential` answer, a query `token` or `secret` beside a
   credential the header or body carried is removed too, so it is not read, compared or passed on by any later reader of the URL. */
export function queryGate(url, op, credential = null) {
  const fields = Object.hasOwn(BODY_ONLY_FIELDS, op) ? BODY_ONLY_FIELDS[op] : [];
  for (const k of fields) url.searchParams.delete(k);
  if (PUBLIC_DOORS.includes(op)) url.searchParams.delete("token");
  if (credential && typeof credential === "object") {
    const q = presentedCredential({ url });
    /* the query's token is the one presented only when it equals it and the credential was read from the address */
    if (credential.token && (credential.token !== q.token || !credential.inAddress)) url.searchParams.delete("token");
    if (credential.secret !== null && credential.secret !== undefined && !(q.secret === credential.secret && q.inAddress))
      url.searchParams.delete("secret");
  }
  return null;
}

/* R2 (D-463, C-78.3) — A CREDENTIAL MINTED CONFINED TO `scratch` ADDRESSES `scratch` ON EVERY CALL IT MAKES.
   The per-call discipline of naming `store=scratch` failed twice where it was measured (D-456, D-461), so the property
   is the credential's ROW, judged here ONCE, ahead of the public ops, of `classify` and of `scopeFor`, and the door
   keeps that order (control-plane R28). Two arms, both the confinement:
     - a `store=` NAMED as anything but `scratch` is REFUSED BY NAME (`bio` with the rest);
     - a `store=` ABSENT is SET to `scratch` on the URL, so every later reader of the namespace (`scopeFor`'s answer, a
       public op reading `store=` itself) reads `scratch`, and the answer's `store` says so. A confined caller reaching
       a bio-pinned public op then meets R3, which is why R2 runs first.
   NOT CONFINED, AND MEASURED SO: the credential's own row and a session are read from `bio` (resolving who a caller is
   is not addressing the record's content), and the four binding classes have no row to carry the property. */
export function confinedNamespaceGate(url, cred) {
  if (!cred || cred.confinedTo !== SCRATCH) return null;
  if (url.searchParams.has("store") && url.searchParams.get("store") !== SCRATCH) {
    /* DEC-49 REGION is-confined-namespace-gate */
    return { status: 403, body: { ok: false, reason: "NAMESPACE_CONFINED", ...namespaceRow("NAMESPACE_CONFINED"),
             error: `credential '${String(cred.tokenId).slice(0, 60)}' is confined to the ${SCRATCH} `
                  + `namespace for its whole life and cannot address `
                  + `${JSON.stringify(String(url.searchParams.get("store")).slice(0, 80))}; nothing was read or written`,
             tokenId: cred.tokenId, asked: String(url.searchParams.get("store")).slice(0, 80),
             confinedTo: SCRATCH } };
    /* END DEC-49 REGION is-confined-namespace-gate */
  }
  url.searchParams.set("store", SCRATCH);
  return null;
}

/* R4 — WHERE AN ADMITTED CALLER LANDS. `{ name }` or `{ error }` (answered by `admit` as SCOPE_REFUSED, C-38.6). The
   probe class is confined to `scratch` by REFUSAL, never by silent redirection, and an absent `store=` is `scratch`
   for it; every other class lands in `scratch` when `store=scratch` is given, else `bio`. THE DAEMON CLASS IS NOT
   CONFINED, BY DECISION (REC-33): its two verbs write the REAL record's reachability and bytes, so what bounds it is
   the op table, not the namespace. A `store=` naming no namespace is refused here too (D-456), should a caller skip R1. */
export function scopeFor(cls, url) {
  const named = url.searchParams.has("store");
  const asked = url.searchParams.get("store");
  if (named && !NAMESPACES.includes(asked))
    return { error: `no namespace ${JSON.stringify(asked)} exists on this instance; the namespaces are ${NAMESPACES.join(" and ")}` };
  if (cls === "probe") return named && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}

/* ===================================================================================================================
 * AUTHENTICATION (R5–R7)
 * =================================================================================================================== */

/* R20 (F1; K1874) — WHERE A CREDENTIAL IS READ: a request's header or body, never its address. `{ token, secret,
   inAddress }`, and it never throws, whatever `req`, `url` and `body` are:
     - `token` (a session token, an `aik-` credential, an ask's grant, a binding token): the `Authorization` header when
       it is exactly `Bearer <value>` (the scheme in any case, one space, printable characters and no space), else a JSON
       object body's non-empty string `token`, else, for T35's release only, the query's `token`. A header in any other
       form presents no token of its own.
     - `secret` (a review or template grant's): the JSON body's string `secret`, else, for T35's release only, the
       query's.
     - `inAddress`: true exactly when either value was read from the query. A header's or body's value is always the
       one used; a query value beside it is not read.
   `body` is what the door parsed once (a GET has none). */
const BEARER = /^bearer ([\x21-\x7e]+)$/i;
export function presentedCredential({ req = null, url = null, body = null } = {}) {
  let token = null, secret = null, inAddress = false;
  try {
    const h = req && req.headers && typeof req.headers.get === "function" ? req.headers.get("authorization") : null;
    const m = typeof h === "string" ? BEARER.exec(h) : null;
    if (m) token = m[1];
  } catch { token = null; }
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : null;
  let q = null;
  try { q = url && url.searchParams ? url.searchParams : null; } catch { q = null; }
  if (!token && b && typeof b.token === "string" && b.token !== "") token = b.token;
  if (!token && q) {
    const t = q.get("token");
    if (typeof t === "string" && t !== "") { token = t; inAddress = true; }
  }
  if (b && typeof b.secret === "string") secret = b.secret;
  else if (q && q.has("secret")) { secret = q.get("secret") ?? ""; inAddress = true; }
  return { token, secret, inAddress };
}

/* R20: what a request whose credential was read from its address carries in its answer (control-plane adds it); the
   one name `publication` R73 uses for its review door. */
export const CREDENTIAL_IN_ADDRESS = "CREDENTIAL_IN_ADDRESS";

/* The credential a gate judges: the door's `presentedCredential` answer when it passes one, else the URL's alone (a
   caller written before R20, which hands this module no request or body). */
const credentialOf = (credential, url) =>
  credential && typeof credential === "object" ? credential : presentedCredential({ url });

/* R5 (REC-33, DEC-37; T35, F12) — THE FOUR BINDING CLASSES. A token equal to a binding gives its class only while the
   binding is LIVE (set, and never a published value: runtime-limits `liveToken`). Checked in the order admin, member,
   probe, daemon, so one value bound twice gives the WIDER class rather than a silent narrowing. The daemon class is the
   unattended path, not the monitor: a later unattended consumer belongs here, not in a fifth class.
   IN CONSTANT TIME: the presented value and each binding are compared as their SHA-256 digests (equal length whatever
   was sent), every byte of all four, with no early exit, and every binding's liveness is asked, so the time taken says
   neither whether a binding matched, nor which, nor where two values first differ. */
const digestOf = async (v) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(v))));
function sameDigest(a, b) {
  let d = 0;
  for (let i = 0; i < 32; i++) d |= a[i] ^ b[i];
  return d === 0;
}
const BINDINGS = Object.freeze([["ADMIN_TOKEN", "admin"], ["MEMBER_TOKEN", "member"], ["PROBE_TOKEN", "probe"],
                                ["DAEMON_TOKEN", "daemon"]]);
export async function classify(token, env) {
  if (typeof token !== "string" || token === "") return null;
  const presented = await digestOf(token);
  const verdicts = [];
  for (const [k] of BINDINGS) {
    const bound = env ? env[k] : undefined;
    const equal = sameDigest(presented, await digestOf(typeof bound === "string" ? bound : ""));
    const live = await liveToken(bound);
    verdicts.push(equal && live);
  }
  let cls = null;
  for (let i = BINDINGS.length - 1; i >= 0; i--) if (verdicts[i]) cls = BINDINGS[i][1];
  return cls;
}

/* The presented shape of an agent credential. Deliberately NOT the 64-hex of a session token, so "an agent credential
   that did not resolve" and "a session that did not resolve" stay two answers. */
export const AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;
const SESSION_TOKEN_SHAPE = /^[0-9a-f]{64}$/;
const bioStore = (env) => env.STORE.get(env.STORE.idFromName("bio"));

/* R6, R20 (K2038) — HOW A LOOKUP REACHES THE STORE: in a header, never the address. `x-bio-session` carries the token
   `session` resolves, `x-bio-credential-sha` the digest `aicredentiallook` resolves; `store-door` hands each to
   credentials' map (its R9), so nothing of the credential is in the address of the store's request. */
const lookup = (env, route, header, value) =>
  bioStore(env).fetch(new Request(`http://do/${route}`, { method: "GET", headers: { [header]: value } }));

/* R6 (D-199 (2), D-463) — THE PRESENTED `ai` CREDENTIAL, RESOLVED ONCE PER REQUEST against `bio`'s credential rows,
   through `credentials.aiCredentialLook` (its R15) by the store's route `aicredentiallook`, by its SHA-256 (the value
   never crosses to the store, and the digest travels in a header). Once, because the confinement (R2) needs the row before
   anything else runs and two lookups could disagree across a revocation. The SHAPE is checked before the store is
   asked. `{ cred }` (null when none is presented or none is known) or `{ silent }` (REC-52: a store that did not
   answer is not "this credential is unknown"). `credential` is the door's `presentedCredential` answer (R20); `op`,
   when given, lets a public door (R17) present nothing: whoever calls it, no credential of theirs is looked up. */
export async function aiCredentialPresented(url, env, doAnswer, { credential = null, op = null } = {}) {
  if (op !== null && PUBLIC_DOORS.includes(op)) return { cred: null };
  const t = credentialOf(credential, url).token;
  if (!t || !AI_TOKEN_SHAPE.test(t)) return { cred: null };
  const out = await doAnswer(lookup(env, "aicredentiallook", "x-bio-credential-sha", await sha256hex(t)));
  if (!out.answered) return { silent: { op: "aicredentiallook", correlation: out.correlation } };
  return { cred: out.result?.found ? out.result.credential : null };
}

/* R6 — A SIGNED-IN SESSION, RESOLVED THROUGH `credentials.session` (its R5, which owns sessions since T19, K637)
   against `bio` by the store's route `session`, the token in a header (R20). `{ sess }` (null for none) or
   `{ silent }`. */
async function sessionPresented(t, env, doAnswer) {
  const out = await doAnswer(lookup(env, "session", "x-bio-session", t));
  if (!out.answered) return { silent: { op: "session", correlation: out.correlation } };
  return { sess: out.result?.session ?? null };
}

/* REC-132 / D-422 — WHO A SESSION IS, IN TWO HALVES KEPT APART. `viewer` is what it may SEE (the founder's is the bare
   `admin`, `viewerPredicate`'s root-administrator spelling; every other session `member:<id>`); `identity` is WHO it is
   (`member:<id>`, the founder's `member:admin`), for authorship, ownership and positional facts; `member` the folded
   id. The founder is told apart by the session's ROLE, never by the folded name (`memberAdd` reserves the id). */
export function resolveSession(sess) {
  const r = sess && typeof sess.role === "string" ? sess.role : "";
  const member = r.startsWith("member:") ? r.slice(7) : r;
  return {
    viewer: r === "admin" ? "admin" : `member:${member}`,
    identity: `member:${member}`,
    member,
  };
}

/* ===================================================================================================================
 * THE AGENT CREDENTIAL'S REACH (R10, R13)
 * =================================================================================================================== */

/* THE FLOOR, AND IT IS THE WHOLE FENCE (PL-4): an `ai` credential reaches only where a MEMBER class is admitted, one
   property of the op table read live. The unattended verbs carry no member class by construction, so they are outside
   every scope anybody can author, and no row of the table names `ai` (op-declarations R2), so this is the only door.
   D-586: an act R12 refuses to every bearer (the §4 governance acts, the group-identity acts) is a named
   administrator's own session act, so no agent reaches it. REC-159: a row that bounds machine credentials by
   `machineClasses` hands an agent nothing. A public op (`classes: null`) answers false: the fail-closed direction. */
export function aiReachesAsMember(spec, op) {
  if (GOVERNANCE_ACTIONS.includes(op) || IDENTITY_ACTIONS.includes(op)) return false;
  return !!spec && Array.isArray(spec.classes) && spec.classes.includes("member")
    && !Array.isArray(spec.machineClasses);
}

/* R10 — THE GATE ON EVERY CALL. READS ARE THE FLOOR AND WRITES ARE THE DECLARATION: an agent reaches every non-mutating
   op a member reaches (what it SEES is bounded by the viewer stamped from its principal), and a mutating op must also
   be among its declared writes. The floor is re-evaluated here on every call, with the gate's own code, because a row
   can outlive the rule that admitted it. THERE IS NO OP NAME IN THIS FUNCTION: the fence is a shape. `{ refusal }`
   (built whole, `op` and `cls` included, so the admission passes it on unchanged: N411) or `{ ok, viewer }`. */
export function aiTaskScope(cred, op, spec) {
  /* DEC-49 REGION is-ai-task-scope */
  if (cred.revoked)
    return { refusal: { status: 403, body: { ok: false, reason: "AI_CREDENTIAL_REVOKED", ...aiScopeRow("AI_CREDENTIAL_REVOKED"),
      detail: `credential '${String(cred.tokenId).slice(0, 60)}' was withdrawn on ${cred.revokedAt} by `
      + `${cred.revokedBy}. The entry and the date are kept rather than deleted, so what it did while `
      + `it was live stays readable.`,
      tokenId: cred.tokenId, revokedAt: cred.revokedAt, op, cls: "ai" } } };

  /* T35 (K1934 (5); credentials R42): an EXPIRED credential is refused by name, as a revoked one is, before any scope
     is judged; one both revoked and expired was answered above. 401: it no longer authenticates anybody. */
  if (cred.expired === true)
    return { refusal: { status: 401, body: { ok: false, reason: "AI_CREDENTIAL_EXPIRED", ...aiScopeRow("AI_CREDENTIAL_EXPIRED"),
      detail: `credential '${String(cred.tokenId).slice(0, 60)}' expired on ${cred.expiresAt}. An agent credential `
      + `lives for the days it was minted with and is never renewed: a member mints a new one to replace it, and `
      + `the entry stays, so what it did while it was live stays readable.`,
      tokenId: cred.tokenId, expiresAt: cred.expiresAt ?? null, op, cls: "ai" } } };

  if (!aiReachesAsMember(spec, op))
    return { refusal: { status: 403, body: { ok: false, reason: "AI_BEYOND_TASK_SCOPE", ...aiScopeRow("AI_BEYOND_TASK_SCOPE"),
      detail: `no member of this group reaches '${String(op).slice(0, 60)}', so no declared scope reaches it `
      + `either. An agent is confined to what a member could do themselves, which is a property of the `
      + `operation rather than a list kept anywhere.`,
      op, tokenId: cred.tokenId, taskScope: cred.taskScope, declared: cred.writes, cls: "ai" } } };

  if (spec.mutating && !cred.writes.includes(op))
    return { refusal: { status: 403, body: { ok: false, reason: "AI_BEYOND_TASK_SCOPE", ...aiScopeRow("AI_BEYOND_TASK_SCOPE"),
      detail: `credential '${String(cred.tokenId).slice(0, 60)}' declares the task scope '${cred.taskScope}', `
      + `whose writes are ${cred.writes.length ? cred.writes.join(", ") : "(none)"}. Widening it is an `
      + `authored, dated act by a member on the record (D-199 (2)/(3)), not something the agent holding `
      + `it can ask for.`,
      op, tokenId: cred.tokenId, taskScope: cred.taskScope, declared: cred.writes, cls: "ai" } } };
  /* END DEC-49 REGION is-ai-task-scope */

  return { ok: true, viewer: cred.principal };
}

/* R13 — THE DECLARATION, judged once when a member AUTHORS it, apart from the gate (PL-4: one predicate at two points
   leaves one code unreachable). An op no spec declares is a sentence nothing enforces (C-29.8); an op no member
   reaches is outside every scope (C-29.9), the governance and identity acts included. `{ refusal }` or `{ writes }`
   (trimmed, de-duplicated, sorted). The detail for C-29.9 says which property of the op's row refused it (REC-162). */
export function aiScopeDeclaration(writes) {
  const asked = Array.isArray(writes) ? writes.map((w) => String(w ?? "").trim()).filter(Boolean) : [];

  /* DEC-49 REGION is-ai-scope-declaration */
  for (const op of asked) {
    if (!Object.prototype.hasOwnProperty.call(OPS, op))
      return { refusal: { status: 403, body: { ok: false, reason: "AI_SCOPE_UNKNOWN_OP", ...aiScopeRow("AI_SCOPE_UNKNOWN_OP"),
        detail: `'${op.slice(0, 60)}' is not an operation this instance performs. A scope naming something `
        + `nothing recognises would sit in the record looking like a permission and meaning nothing, `
        + `which is exactly what declaring the scope on the record rather than in a settings row is `
        + `for (D-199 (2)).`, op } } };
    if (!aiReachesAsMember(OPS[op], op))
      return { refusal: { status: 403, body: { ok: false, reason: "AI_SCOPE_BEYOND_MEMBER_REACH", ...aiScopeRow("AI_SCOPE_BEYOND_MEMBER_REACH"),
        detail: Array.isArray(OPS[op].machineClasses)
          ? `'${op.slice(0, 60)}' is reached by a member only from that member's own signed-in `
            + `session, and no agent credential is among the credentials it admits, so it cannot be `
            + `handed to an agent. This is a property of the operation and not a list of forbidden `
            + `ones: its OPS row names the credentials that reach it, and an agent's is not one.`
          : `'${op.slice(0, 60)}' is not reachable by a member of this group, so it cannot be handed `
            + `to an agent. This is a property of the operation and not a list of forbidden ones: the `
            + `unattended worker's own verbs carry no member class by construction, so they are `
            + `outside every scope anybody can author.`,
        op, classes: Array.isArray(OPS[op].classes) ? OPS[op].classes : null } } };
  }
  /* END DEC-49 REGION is-ai-scope-declaration */

  return { writes: [...new Set(asked)].sort() };
}

/* R13 (D-463, C-29.10) — WHAT MAY BE WRITTEN AS A CONFINEMENT. `scratch` is the only one, matched EXACTLY (nothing
   trimmed or folded); `bio` is refused with the rest, because a row "confined to bio" would be a fence that holds
   nothing. ABSENT (omitted, null, undefined) is the only silence and mints an unconfined credential; a present empty
   string is a value and is refused. `{ refusal }` or `{ confinedTo }`. */
export function aiConfinementDeclaration(confinedTo) {
  if (confinedTo === null || confinedTo === undefined) return { confinedTo: null };
  const asked = String(confinedTo);

  /* DEC-49 REGION is-ai-confinement-declaration */
  if (asked !== SCRATCH)
    return { refusal: { status: 403, body: { ok: false, reason: "AI_CONFINEMENT_NOT_SCRATCH", ...aiScopeRow("AI_CONFINEMENT_NOT_SCRATCH"),
      detail: `'${asked.slice(0, 80)}' is not a confinement a credential can carry. The one namespace a credential `
      + `may be bound to for its whole life is ${JSON.stringify(SCRATCH)}; ${JSON.stringify("bio")} is where `
      + `every unconfined credential already lands, so recording it as a confinement would put a fence in the `
      + `record that holds nothing (D-199 (2)). The name is matched exactly, so a capital letter or a stray space `
      + `is a different name. Leave the field out altogether to mint an unconfined credential.`,
      asked: asked.slice(0, 80), confinements: [SCRATCH] } } };
  /* END DEC-49 REGION is-ai-confinement-declaration */

  return { confinedTo: SCRATCH };
}

const hexOf = (raw) => [...raw].map((x) => x.toString(16).padStart(2, "0")).join("");

/* R13 — THE MINT'S HALF THAT IS ADMISSION'S. The declaration and the confinement are judged BEFORE anything is written
   (a scope the gate would refuse must not enter the record at all), then the credential's value is generated HERE:
   `aik-` and 32 random bytes in hex. The door forwards `secretSha` and the normalised `writes` and `confinedTo` (never
   the caller's spelling) to credentials' mint (its R12) and returns `secret` once, in the minting answer only; the
   store never holds the value. `{ refusal }` (with `op` and `cls`) or `{ secret, secretSha, writes, confinedTo }`. */
export async function aiCredentialMint(asked, cls) {
  const a = asked && typeof asked === "object" && !Array.isArray(asked) ? asked : {};
  const declared = aiScopeDeclaration(a.writes);
  if (declared.refusal) return { refusal: { status: declared.refusal.status, body: { ...declared.refusal.body, op: "aicredentialmint", cls } } };
  const confinement = aiConfinementDeclaration(a.confinedTo);
  if (confinement.refusal) return { refusal: { status: confinement.refusal.status, body: { ...confinement.refusal.body, op: "aicredentialmint", cls } } };
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  const secret = `aik-${hexOf(raw)}`;
  return { secret, secretSha: await sha256hex(secret), writes: declared.writes, confinedTo: confinement.confinedTo };
}

/* R13 (REC-126, DEC-31) — A REVIEW GRANT'S READ SECRET, on the agent credential's rule: 32 random bytes, base64url,
   behind a version prefix; generated here, returned once in the granting answer, passed on only as its SHA-256. It is a
   READ credential only: `classify` never admits it. */
export async function reviewGrantSecret() {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  const secret = "rv1_" + btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return { secret, secretSha: await sha256hex(secret) };
}

/* ===================================================================================================================
 * ADMISSION, IN ORDER (R8–R11)
 * =================================================================================================================== */

/* R8 (D-270, REC-162) — THE SESSION GATE, three sentences where one was false for two. A REFUSAL MAY STATE ONLY WHAT
   THE SYSTEM CAN SUPPORT, ordered from most to least supportable: (b) another session's set holds the op — about THIS
   caller, always sayable, naming which session reaches it (`SESSION_OPS.admin` is the founder's password session
   alone; an enrolled administrator signs in as a member); (a) a recorded decision reserves it to a credential — a
   design claim, sayable only with its citation in `recorded`; (c) neither — the fact, and no invented rationale, since
   a false rationale suppresses its own bug report. `error` keeps the legacy sentence beside each code. `capture`'s GET
   is a read. Not one op moves between sets here: only what a caller is TOLD. `null` or a refusal. `tables` are
   op-declarations' own (`SESSION_OPS`, `UNATTENDED_BY_DECISION`), frozen data (its R5); a caller may hand in others of
   the same shape, so an arrangement the declared tables do not hold today (an op only a member's set holds) is still
   driven. */
const DECLARED = Object.freeze({ SESSION_OPS, UNATTENDED_BY_DECISION });
export function sessionOpGate(kind, op, spec, method, tables = DECLARED) {
  const { SESSION_OPS, UNATTENDED_BY_DECISION } = tables;
  if (!spec.mutating || (op === "capture" && method === "GET") || SESSION_OPS[kind].has(op))
    return null;

  /* DEC-49 REGION is-session-op-gate */
  if (SESSION_OPS.admin.has(op))
    return { status: 403, body: { ok: false, reason: "SESSION_ROLE_CANNOT_REACH_OP", ...admissionRow("SESSION_ROLE_CANNOT_REACH_OP"),
      error: "this operation is reserved to the founder's session",
      detail: `'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only the founder's: `
      + `the password session made when this instance was claimed with its root credential. This is `
      + `a member's session, which is what every enrolled member signs in with, an administrator of `
      + `this group included — so an administrator's session is refused this exactly as this one is, `
      + `and nothing here says whether you are one. There is no machine credential to go and find: `
      + `the founder performs this from their own browser.`,
      op, session: kind, reachedBy: "founder" } };
  if (SESSION_OPS.member.has(op))
    return { status: 403, body: { ok: false, reason: "SESSION_ROLE_CANNOT_REACH_OP", ...admissionRow("SESSION_ROLE_CANNOT_REACH_OP"),
      error: "this operation is reserved to a member's own session",
      detail: `'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only a member's `
      + `own, and this is the founder's session. There is no machine credential to go and find: `
      + `a member performs this from their own browser.`,
      op, session: kind, reachedBy: "member" } };
  const recorded = UNATTENDED_BY_DECISION[op];
  if (recorded)
    return { status: 403, body: { ok: false, reason: "MACHINE_CREDENTIAL_REQUIRED", ...admissionRow("MACHINE_CREDENTIAL_REQUIRED"),
      error: "this operation requires a machine credential, not a signed-in session",
      detail: `'${String(op).slice(0, 60)}' is on the unattended path. No signed-in session of any role `
      + `reaches it, the founder's included; it answers to a credential held in the hosting `
      + `account. This instance holds a decision on record saying so, cited in 'recorded' so you `
      + `can check it. Nothing here says a machine is trusted more than a person (DEC-52 rules the `
      + `opposite): it says which credential this verb is addressed to.`,
      op, recorded } };
  return { status: 403, body: { ok: false, reason: "SESSION_ROUTE_NOT_RECORDED", ...admissionRow("SESSION_ROUTE_NOT_RECORDED"),
    error: "no signed-in session reaches this operation, and no decision on record says why",
    detail: `'${String(op).slice(0, 60)}' is reachable by no session of any role, and this instance holds `
    + `no recorded decision that it is not meant for a person. The plane will not invent one: a `
    + `member told an absence is a decision stops reporting it as the gap it may well be. If you `
    + `expected to perform this, that expectation is worth filing rather than working around.`,
    op } };
  /* END DEC-49 REGION is-session-op-gate */
}

/* R11 (C-38.5) — THE ONE SITE OF `NOT_CAPABLE`. A session missing the capability an act needs, naming `needs` and the
   capabilities it holds (sorted), with a sentence that names no capability (the surface renders `needs`). Both of its
   conditions answer through here: the op's own `NEEDS` (`admit`) and a project's creation (`projectCreationGate`). */
function notCapable(op, needs, caps, detail) {
  /* DEC-49 REGION is-not-capable */
  return { status: 403, body: { ok: false, reason: "NOT_CAPABLE", ...admissionRow("NOT_CAPABLE"),
           op, needs, held: [...caps].sort(), detail } };
  /* END DEC-49 REGION is-not-capable */
}

/* R11 (section 5) — A PROJECT IS CREATED BY PROMOTING A BUNDLE WITH NO BASE WHOSE TYPE IS `project`, so there is no op
   for `NEEDS` to name: the door asks this in op=promote's stamp block, from the payload, for a session's creation.
   `caps` is the session's capability set (`caller.caps`). `null` when it holds `create_projects`. */
export function projectCreationGate(caps) {
  if (caps && caps.has("create_projects")) return null;
  return notCapable("promote", "create_projects", caps || [],
    "creating a project needs the create-projects capability. This account may still "
    + "contribute to projects it has been invited to, if it holds contribute.");
}

/* R5–R11 — THE ADMISSION (REC-79, C-38): every refusal a caller meets before their op runs, in this order, for a gated
   op (`spec.classes` a list; the namespace gates R1–R3 and the public ops come first, at the door):
     a binding class (R5), else the presented agent credential (R6, `presented` from `aiCredentialPresented`), else a
     session token resolved (R6) and judged: `export` refused (R8's ROOT_OF_TRUST_REQUIRED, section 8.1), then the
     session gate (R8); no class (R7); the agent's task scope (R10) or the class list (R9: `machineClasses` for a caller
     not arriving by a session, where the spec gives it); the session's capability (R11); the landing (R4).
   Answers `{ refusal }`, `{ silent }` (the session lookup's store did not answer) or `{ caller }`:
     `{ cls, viaSession, member, viewer, identity, rights, caps, aiCred, storeName }` — the session's halves and
     capabilities only for a session (`caps` a Set), `aiCred` only for an agent, `storeName` the namespace it lands in.
   `tables`, as `sessionOpGate`'s. `credential` is the door's `presentedCredential` answer (R20), the one credential
   judged here; absent, the URL's alone. */
export async function admit({ url, env, op, spec, method, presented, doAnswer, tables = DECLARED, credential = null }) {
  const t = credentialOf(credential, url).token;
  let cls = await classify(t, env);
  let viaSession = false, sess = null, halves = { member: null, viewer: null, identity: null };
  let aiCred = null;
  if (!cls && presented?.cred) { cls = "ai"; aiCred = presented.cred; }

  /* DEC-49 REGION is-admission
     A store silence in here (`{ silent }`) is not an admission refusal: the plane declines to say anything about who
     somebody is when it could not look (REC-52), and the door answers it with its own code. */
  if (!cls) {
    if (t && SESSION_TOKEN_SHAPE.test(t)) {
      const looked = await sessionPresented(t, env, doAnswer);
      if (looked.silent) return { silent: looked.silent };
      if (looked.sess) {
        const kind = looked.sess.role === "admin" ? "admin" : "member";
        /* Section 8.1, before the session gate so the answer states the actual rule: the root of trust is the token in
           the hosting account, and a session (the founder's own browser included) is not it. */
        if (op === "export")
          return { refusal: { status: 403, body: { ok: false, reason: "ROOT_OF_TRUST_REQUIRED", ...admissionRow("ROOT_OF_TRUST_REQUIRED"), op,
            detail: "a full working-corpus export needs the ADMIN_TOKEN-class credential itself, not a "
                  + "signed-in session, and not in-app administrator status. A session is derived from a "
                  + "password; the root of trust is the token held in the hosting account. This refuses "
                  + "the founder's own browser too, which is the one place in this system where being "
                  + "the founder is not enough. The published record needs no credential at all: see "
                  + "op=publishedmanifest." } } };
        const gated = sessionOpGate(kind, op, spec, method, tables);
        if (gated) return { refusal: gated };
        cls = kind;
        sess = looked.sess;
        halves = resolveSession(sess);
        viaSession = true;
      }
    }
  }
  if (!cls) return { refusal: { status: 401, body: { ok: false, reason: "NOT_AUTHENTICATED", ...admissionRow("NOT_AUTHENTICATED"),
    error: "unauthenticated" } } };
  /* PL-11 / D-199 (1): CLASS PLUS SCOPE, and for the `ai` class the scope is the whole of it (no row names `ai`). Its
     refusal is built whole inside `aiTaskScope`'s own region and passed on as it is (N411). */
  if (cls === "ai") {
    const scoped = aiTaskScope(aiCred, op, spec);
    if (scoped.refusal) return { refusal: scoped.refusal };
  } else if (!(viaSession || !Array.isArray(spec.machineClasses) ? spec.classes : spec.machineClasses).includes(cls)) {
    /* REC-159: a row carrying `machineClasses` judges a caller that did NOT arrive by a session against THAT list. */
    return { refusal: { status: 403, body: { ok: false, reason: "CLASS_FORBIDDEN", ...admissionRow("CLASS_FORBIDDEN"),
      error: "forbidden for token class", op, cls } } };
  }
  /* Section 5: only a SESSION carries capabilities; a binding class holds none and is bounded by the class list.
     `capture`'s GET is a read. */
  const caps = viaSession ? new Set(sess.capabilities || []) : null;
  if (viaSession) {
    const needs = NEEDS[op];
    if (needs && !(op === "capture" && method === "GET") && !caps.has(needs))
      return { refusal: notCapable(op, needs, caps,
        `this account does not hold the ${needs} capability. Capabilities are set by an `
        + `administrator, so ask one to grant it rather than looking for another route.`) };
  }
  const scope = scopeFor(cls, url);
  if (scope.error) return { refusal: { status: 403, body: { ok: false, reason: "SCOPE_REFUSED", ...admissionRow("SCOPE_REFUSED"),
    error: scope.error, tokenClass: cls } } };
  /* END DEC-49 REGION is-admission */

  return { caller: { cls, viaSession, member: halves.member, viewer: halves.viewer, identity: halves.identity,
                     rights: sess, caps, aiCred, storeName: scope.name } };
}

/* R12 (D-136 applying D-421; REC-164) — THE BEARER FENCES. A bearer (any caller not arriving by a session) asking for a
   §4 governance act is refused C-32.17, and for a group-identity act C-64.4, each naming its class. THE PREDICATE IS HOW
   THE CALLER ARRIVED, NOT WHICH TOKEN IT HELD, so every bearer class, and one added tomorrow, is refused, and no class
   list appears here to go stale. A fence and not only the roster's NOT_AN_ADMIN, because that refusal's sentence would
   be false here: a token is not a member who failed to be an administrator. The door asks this after `admit` and
   before any handler (control-plane R28). `null` or a refusal. */
export function bearerFence(op, caller) {
  if (caller.viaSession) return null;
  const cls = caller.cls;
  /* DEC-49 REGION is-operator-governance-act */
  if (GOVERNANCE_ACTIONS.includes(op))
    return { status: 403, body: { ok: false, reason: "OPERATOR_TOKEN_CANNOT_GOVERN",
      ...operatorFenceRow("OPERATOR_TOKEN_CANNOT_GOVERN"), op, tokenClass: cls,
      detail: `section 4 governance is a named administrator's own act, delivered through that `
            + `administrator's own signed-in session. The credential that asked is the operator's `
            + `\`${cls}\`-class bearer token, which holds no position on the roster: it cannot be `
            + `one of the administrators whose consensus §4.7 requires, and a vote it delivered `
            + `would be attributed to whoever the caller named. Sign in as the administrator and `
            + `do it there (D-136, applying D-421).` } };
  /* END DEC-49 REGION is-operator-governance-act */
  /* DEC-49 REGION is-group-identity-session */
  if (IDENTITY_ACTIONS.includes(op))
    return { status: 403, body: { ok: false, reason: "GROUP_IDENTITY_NEEDS_SESSION",
      ...identityFenceRow("GROUP_IDENTITY_NEEDS_SESSION"), op, tokenClass: cls,
      detail: `the group's display name and its domain claim are set by a named administrator's own signed-in `
            + `session, and the record names who set each one (Publication §7). The credential that asked is the `
            + `operator's \`${cls}\`-class bearer token, which holds no place on the roster. Nothing was changed.` } };
  /* END DEC-49 REGION is-group-identity-session */
  return null;
}

/* ===================================================================================================================
 * WHO IS ASKING, FOR THE DOOR'S STAMPS AND THE PUBLIC READS
 * =================================================================================================================== */

/* THE VIEWER AN ADMITTED CALLER IS STAMPED WITH (D-15, D-199 (4)): a session's viewer; an agent's PRINCIPAL (a
   member-scoped key sees what its member sees, an organisation key what an instance credential sees); a binding class
   `class:<cls>`. N407 (K649 (4)): an agent's viewer CARRIES ITS CREDENTIAL, `{ stamp, aiCred }`, because a member-scoped
   agent's stamp is its minter's (`member:<minter>`) and cannot be told from the member by its stamp; ratification R18's
   pre-flight reads `aiCred` and holds the agent to the machine fences. `carry: false` answers the stamp alone (a query
   parameter is a string). */
export function callerViewer(caller, { carry = true } = {}) {
  if (caller.viaSession) return caller.viewer;
  if (caller.cls === "ai") return carry ? { stamp: caller.aiCred.principal, aiCred: caller.aiCred } : caller.aiCred.principal;
  return `${MACHINE_CLASS_PREFIX}${caller.cls}`;
}

/* REC-130 / REC-163 — WHO IS ASKING, FOR A PUBLIC OP THAT ANSWERS WORKING MATERIAL ONLY TO SOME (op=instancegroup's
   whole row, op=groupidentity's claim, an unsigned case document, a review copy read without a secret). IT NEVER
   REFUSES: an absent, unknown, expired or out-of-scope credential is no one (`""`), so a caller without standing cannot
   tell "unsigned" from "absent". A binding class stands as `class:<cls>` only when `OPS.index` admits it and R4 lands it
   in the store this op reads (so `daemon`, two verbs, and `probe` outside scratch read as strangers); a session as its
   viewer; an agent as its principal when R10 admits it to `index`. `cls` beside the viewer names the class the caller
   would carry through the gate. The only non-answer is a store silence, `{ silent }`. `presented` is the front door's
   `aiCredentialPresented` answer's `cred` (one lookup, one row); `undefined` asks the store here. `credential`, as
   `admit`'s (R20). */
export async function readerOf(url, env, storeName, presented, doAnswer, credential = null) {
  const c = credentialOf(credential, url);
  const t = c.token;
  if (!t) return { viewer: "" };
  const cls = await classify(t, env);
  if (cls) {
    const scope = scopeFor(cls, url);
    const inScope = OPS.index.classes.includes(cls) && !scope.error && scope.name === storeName;
    return { viewer: inScope ? `${MACHINE_CLASS_PREFIX}${cls}` : "", cls };
  }
  if (AI_TOKEN_SHAPE.test(t)) {
    let cred = presented;
    if (cred === undefined) {
      const looked = await aiCredentialPresented(url, env, doAnswer, { credential: c });
      if (looked.silent) return { silent: looked.silent };
      cred = looked.cred;
    }
    const scoped = cred ? aiTaskScope(cred, "index", OPS.index) : null;
    return { viewer: scoped && !scoped.refusal ? scoped.viewer : "", cls: "ai" };
  }
  if (SESSION_TOKEN_SHAPE.test(t)) {
    const looked = await sessionPresented(t, env, doAnswer);
    if (looked.silent) return { silent: looked.silent };
    if (!looked.sess) return { viewer: "" };
    return { viewer: resolveSession(looked.sess).viewer, cls: looked.sess.role === "admin" ? "admin" : "member" };
  }
  return { viewer: "" };
}

/* ===================================================================================================================
 * WHO IS CALLING, AND THE DOOR'S WINDOW (R21); THE SECURITY TALLY (R22)
 * =================================================================================================================== */

/* R21 (F4; K1881; DEC-166) — WHO IS CALLING IS KNOWN ONLY AS A COUNTRY AND A KEYED FINGERPRINT. `countryOf` answers
   Cloudflare's two-character label for the request (`request.cf.country`), or `null`; nothing else of where the
   request came from is read. */
export function countryOf(req) {
  try {
    const c = req && req.cf ? req.cf.country : null;
    return typeof c === "string" && /^[A-Z0-9]{2}$/.test(c) ? c : null;
  } catch { return null; }
}

/* R21 — THE WINDOW'S BOUND, BOB's under K1881 (a protective limit that refuses only abuse): at most `limit` requests
   to the public ops per source in any `windowMs`, estimated by `capture` R31's two buckets. `stated` is composed from
   the same constants, so the sentence and the gate cannot drift apart. */
export const DOOR_WINDOW = Object.freeze({ limit: 300, windowMs: 10 * 60 * 1000 });
export const DOOR_WINDOW_STATED =
  `at most ${DOOR_WINDOW.limit} requests from one source in any ${DOOR_WINDOW.windowMs / 60000} minutes`;

/* R21: the two-bucket sliding estimate, `prev × (1 − elapsed/W) + cur`, `elapsedFrac` the share of the current
   bucket's window already gone. */
export function doorWindowEstimate({ prev = 0, cur = 0, elapsedFrac = 0 } = {}) {
  const f = Math.min(1, Math.max(0, Number(elapsedFrac) || 0));
  return (Number(prev) || 0) * (1 - f) + (Number(cur) || 0);
}

/* R21: how long, in whole seconds (at least 1), until a refused source's estimate is under the bound again. A refused
   request is not counted, so the estimate only falls: within this bucket as `prev` ages out, else in the next bucket
   as `cur` (then the previous) ages out. */
export function doorRetryAfter({ prev = 0, cur = 0, elapsedFrac = 0, limit = DOOR_WINDOW.limit,
                                 windowMs = DOOR_WINDOW.windowMs } = {}) {
  const f = Math.min(1, Math.max(0, Number(elapsedFrac) || 0));
  const p = Number(prev) || 0, c = Number(cur) || 0;
  let waitFrac;
  if (c < limit && p > 0) waitFrac = Math.max(0, 1 - (limit - c) / p - f);
  else if (c >= limit) waitFrac = (1 - f) + Math.max(0, 1 - limit / c);
  else waitFrac = 0;
  /* The estimate must be strictly under the bound, so a wait landing exactly on it is a tick longer. */
  return Math.max(1, Math.ceil((waitFrac * windowMs) / 1000) + 1);
}

/* R21 — THE REFUSAL: 429, the bound in `stated`, the wait in `retryAfter`. It names no address, fingerprint or
   credential, and says nothing of who the caller is (R15): the window knows neither. */
export function doorRateLimited(retryAfter) {
  const wait = Math.max(1, Math.ceil(Number(retryAfter) || 1));
  /* DEC-49 REGION is-door-window */
  return { status: 429, body: { ok: false, reason: "DOOR_RATE_LIMITED", ...admissionRow("DOOR_RATE_LIMITED"),
    detail: `too many requests to the operations anyone may call reached this group's Civicsmith from one source in `
      + `a short time, so this one was turned away before the operation ran; nothing was read or written. Try again `
      + `in ${wait} seconds.`,
    stated: DOOR_WINDOW_STATED, retryAfter: wait } };
  /* END DEC-49 REGION is-door-window */
}

/* R21 — WHO IS CALLING, AS A KEYED FINGERPRINT: the connecting address as Cloudflare states it (`CF-Connecting-IP`),
   digested as `capture` R56 digests it (HMAC-SHA-256, its first 16 bytes in hex, under the same key). In the Worker
   that key is at hand only when the `KNOCK_FINGERPRINT_KEY` binding is set; otherwise it is capture's own, held in the
   store, and this answers `null`: the door then stamps the `source` the window's store side answers (`doorWindowGate`,
   K2038). A request that states no address is one shared source of its own (`UNSTATED_SOURCE`, not a digest, so it
   never equals one). The address is read here, digested, and dropped; it is never kept, logged or answered. */
export const UNSTATED_SOURCE = "unstated";
function connectingAddress(req) {
  try {
    const a = req && req.headers && typeof req.headers.get === "function" ? req.headers.get("cf-connecting-ip") : null;
    return typeof a === "string" && a.trim() !== "" ? a.trim() : null;
  } catch { return null; }
}
export async function sourceOf(req, env) {
  const address = connectingAddress(req);
  if (address === null) return UNSTATED_SOURCE;
  const bound = env && typeof env.KNOCK_FINGERPRINT_KEY === "string" && env.KNOCK_FINGERPRINT_KEY ? env.KNOCK_FINGERPRINT_KEY : null;
  if (!bound) return null;
  const te = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", te.encode(bound), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, te.encode(address)));
  return hexOf(mac).slice(0, 32);
}

/* R21 — THE WINDOW, AS THE FIRST GATE OF THE PUBLIC OPS (control-plane R28's order): every request to an op whose spec
   is public (`classes: null`), whoever calls and whatever it presents, is asked of its source's window in the store
   (`doorwindow`, this module's store map, `window.mjs`), the connecting address in the request's body. A request to
   any other op is never counted or refused here. Answers `{ refusal }` (R21's 429, nothing of the op read or written)
   or `{ source }` (the fingerprint the store answered, for the door's stamps; `null` when it could not be read). A
   window that cannot be read or written ADMITS the request (it fails open, so a fault in it never refuses a caller)
   and is named in the log by its correlation id only. */
export async function doorWindowGate({ req = null, env = null, spec = null, doAnswer = null, now = null } = {}) {
  if (!spec || spec.classes !== null) return { source: null };
  let out = null;
  try {
    const body = { address: connectingAddress(req) };
    if (now !== null) body.now = now;
    const asked = bioStore(env).fetch(new Request("http://do/doorwindow", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
    out = typeof doAnswer === "function" ? await doAnswer(asked) : null;
  } catch { out = null; }
  if (!out || !out.answered || !out.result || typeof out.result !== "object") {
    console.warn(`admission: the door's window was not read; the request is admitted (correlation ${
      out && typeof out.correlation === "string" ? out.correlation : "none"})`);
    return { source: null };
  }
  const r = out.result;
  if (r.refused === true) return { refusal: doorRateLimited(r.retryAfter) };
  return { source: typeof r.source === "string" ? r.source : null };
}

/* R22 (N703; K1875; DEC-165, DEC-166; credentials R44) — THE REFUSALS COUNTED IN THE SECURITY TALLY, and their kind. */
const CREDENTIAL_REFUSED_ANYWHERE = Object.freeze(["AI_CREDENTIAL_REVOKED", "AI_CREDENTIAL_EXPIRED"]);
const CREDENTIAL_REFUSED_AT = Object.freeze({
  invitelook: Object.freeze(["NO_SUCH_INVITATION"]),
  enroll: Object.freeze(["NO_SUCH_INVITATION"]),
  websiteinvite: Object.freeze(["WEBSITE_KEY_UNKNOWN"]),
  joinlinkinvite: Object.freeze(["NO_SUCH_JOIN_LINK"]),
});
const RATE_REFUSED = Object.freeze(["DOOR_RATE_LIMITED", "WEBSITE_DAILY_CAP", "JOIN_LINK_DAILY_CAP"]);

/* An answer's refusal code, however the door holds it: a refusal `{status, body}`, a body, or a relayed result. */
function refusalCode(answer) {
  if (!answer || typeof answer !== "object") return null;
  const b = answer.body && typeof answer.body === "object" ? answer.body : answer;
  if (b.ok === true) return null;
  const c = typeof b.code === "string" ? b.code : typeof b.reason === "string" ? b.reason : null;
  return c;
}

/* `presented`: what the refused request presented — the door's `presentedCredential` answer (`token`), and the agent
   credential's row when one was looked up (`cred`). It names a member when it is a session (a session token's shape)
   or an agent credential whose principal is a member; then no country is placed (DEC-166 (2)). */
function namesMember(presented) {
  const p = presented && typeof presented === "object" ? presented : {};
  const cred = p.cred && typeof p.cred === "object" ? p.cred : null;
  if (cred && typeof cred.principal === "string" && cred.principal.startsWith("member:")) return true;
  return typeof p.token === "string" && SESSION_TOKEN_SHAPE.test(p.token);
}

/* R22: the kind a refusal is counted as, or null for one that is not counted. Pure. */
export function securityKindOf({ op = null, answer = null, presented = null } = {}) {
  const code = refusalCode(answer);
  if (!code) return null;
  if (RATE_REFUSED.includes(code)) return "rate";
  if (CREDENTIAL_REFUSED_ANYWHERE.includes(code)) return "credential";
  if (typeof op === "string" && Object.hasOwn(CREDENTIAL_REFUSED_AT, op) && CREDENTIAL_REFUSED_AT[op].includes(code))
    return "credential";
  /* an `aik-`-shaped credential no row knows: refused as no one (R7), counted as a refused key */
  const p = presented && typeof presented === "object" ? presented : {};
  if (code === "NOT_AUTHENTICATED" && typeof p.token === "string" && AI_TOKEN_SHAPE.test(p.token) && !p.cred)
    return "credential";
  return null;
}

/* R22 — ONE COUNT PER REFUSAL, through `credentials.securityCount({kind, country})` (its R44). This module answers
   it for each refusal it gives and `control-plane` calls it for each refusal it relays. Only the kind and the country
   would cross: no address, fingerprint, credential, handle, role, op or time. THE STORE WRITE IS DEFERRED (K2038, to
   T36, N744): credentials' map has no `securitycount` route yet, so this classifies and answers what it would count,
   `{ kind, country }`, or `null`, and writes nothing; it never throws and never changes the refusal. */
export async function securityTally({ op = null, answer = null, presented = null, req = null } = {}) {
  try {
    const kind = securityKindOf({ op, answer, presented });
    if (!kind) return null;
    return { kind, country: namesMember(presented) ? null : countryOf(req) };
  } catch { return null; }
}
