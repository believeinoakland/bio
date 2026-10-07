/* plane (B2, K1674, K1684; control-plane R53; agent-worker R6, R54, R56; credentials R25, R27, R35; K1755, K1798, K1806):
   `op=ask`'s handler. A member's own session (or a grant control-plane admitted, handed as `grantMember`) asks; on the
   `bio` object, where credentials live, the member's short-lived read-only grant is minted at that act, the account that
   serves the member's ask (`credentials.accountFor`: their own reference, else the group's API key while held and on) is
   unsealed for this one ask, the switch that governs it read, and the question goes to agent-worker's `/ask` with the
   grant and the account in agent-worker R6's shape. agent-worker's answer (its NDJSON stream, or its plain refusal) is handed back unchanged.
   The secret leaves the object only in that one call and is kept nowhere; every refusal is its owner's, in its words. */
import { credentialsOf } from "../credentials/index.mjs";
import { instanceSetupOf } from "../setup.mjs";
import { answersOf } from "../answers/index.mjs";

const json = (body, status) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const idOf = (m) => (typeof m === "string" && m.startsWith("member:") ? m.slice(7) : m);

/* F1 (K1874; admission R20): the session or grant the caller presented, read where admission read it: the
   `Authorization` header when it is exactly `Bearer <value>`, else the JSON body's `token`, else, for T35's release
   only, the query's `token`. Never anything else of the request. */
const BEARER = /^bearer ([\x21-\x7e]+)$/i;
function presentedToken(req, url, body) {
  const m = BEARER.exec(req.headers.get("authorization") || "");
  if (m) return m[1];
  if (body && typeof body === "object" && !Array.isArray(body) && typeof body.token === "string" && body.token !== "")
    return body.token;
  return url.searchParams.get("token");
}

/** The door's arm (in the Worker): admits only a member's own session or a presented grant's member, reads the body,
 *  and asks the `bio` object, which answers through `askOnObject`. */
export async function askOp({ req, url, env, viaSession, sessMember, grantMember }) {
  const member = viaSession && sessMember ? `member:${idOf(sessMember)}` : typeof grantMember === "string" && grantMember ? grantMember : null;
  if (!member)
    return json({ ok: false, reason: "ASK_NOT_A_MEMBER", detail: "an ask is a member's own act, from their own session or "
      + "the grant minted at it. Nothing was asked." }, 403);
  if (req.method !== "POST") return json({ ok: false, reason: "METHOD_NOT_ALLOWED", detail: "an ask is a POST" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ ok: false, reason: "BAD_JSON", detail: "the ask's body is not JSON" }, 400); }
  const named = url.searchParams.get("store");
  const args = { member, question: body && body.question, conversation: body && body.conversation,
                 store: named ? named : null,
                 session: viaSession ? presentedToken(req, url, body) : null,
                 grant: viaSession ? null : presentedToken(req, url, body) };
  return env.STORE.get(env.STORE.idFromName("bio")).ask(args);
}

/** On the `bio` object: mint the grant (unless one was presented), unseal the account, read the suggestions switch,
 *  and post the ask. */
export async function askOnObject(ctx, env, { member, session = null, grant = null, question, conversation, store = null }) {
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function")
    return json({ ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "your group's Civicsmith has no assistant bound to it. Nothing was asked." }, 503);
  /* K1690 (instance-setup R55): while the copy's assistant is off, every ask is refused ASSISTANT_OFF, before any grant
     is minted or any account read. */
  const off = instanceSetupOf(ctx, env).assistantGate();
  if (off) return json(off, 403);
  const c = credentialsOf(ctx);
  let token = grant;
  if (!token) {
    const g = await c.aiGrantMint({ member, by: member, session });
    if (!g || g.ok !== true) return json(g, 403);
    token = g.token;
  }
  /* K1806 (agent-worker R6, R54; credentials R35; K1755, K1798): the account that serves this ask, carried as
     `{kind, level, secret, member, suggestions}`: R35's `key` named `secret`, `level` `member` for the member's own
     reference or `group` for the group's API key. The member's own switch is read from their reference's state
     (credentials R25); the group key's switch has no in-plane read for a member's act (K1798), so an ask it serves offers
     no suggestion, as by default. */
  let ref = await c.accountFor({ member, act: { kind: "ask", member } });
  if (!ref || ref.ok !== true) return json(ref, 409);
  let suggestions = false;
  if (ref.level === "member")
    try { const st = c.accountReferenceState({ member, viewer: member }); suggestions = !!(st && st.ok === true && st.suggestions === true); }
    catch { suggestions = false; }
  const out = JSON.stringify({ question, ...(conversation !== undefined ? { conversation } : {}), ...(store ? { store } : {}),
                               grant: token, account: { kind: ref.kind, level: ref.level, secret: ref.key, member, suggestions } });
  ref = null;
  let res;
  try {
    res = await w.fetch("https://agent-worker/ask", { method: "POST", headers: { "content-type": "application/json" }, body: out });
  } catch {
    return json({ ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member did not answer. Nothing was kept." }, 502);
  }
  return new Response(res.body, { status: res.status, headers: res.headers });
}

/** plane R19 (N686; K1837, K1841, K2038, K2041, K2062; control-plane R57, agent-worker R59, credentials R27, R35, R37):
 *  on the `bio` object, the draft's account and grant, the `/draft` twin of `askOnObject`. control-plane's door, past
 *  every refusal its own and the owner's, asks it with `draftAsk`'s shape, `{op, member, session, told, act, field,
 *  firsthand, pack}`. While the copy's assistant is off it is refused `ASSISTANT_OFF` (instance-setup R55); it resolves
 *  the account that serves the member's own act (`accountFor`, an `ask`-kind act: a draft is the member's own read-only
 *  ask), reads that account's `suggestions` switch (the member's own reference's, credentials R25; the group key's, its
 *  R37), mints the member's ask grant only when `suggestions` is on and the field is not firsthand (DEC-153 (2), K1841
 *  (2)), and posts `{task, told, account, grant?, pack?, firsthand?}` to agent-worker's `/draft` in its R6 wire shape,
 *  the pack the door holds sent only with no grant (agent-worker R59). It answers a Response at agent-worker's status:
 *  agent-worker's JSON as given (or the refusal that ended it first) with `grant` (null when none), `suggestions` and
 *  `read`, the strings of that grant's read log on this object (`answers.readLog`, its R1, R2; `[]` with no grant), so
 *  the door checks the draft against them (`wizard-scripts.checkDraft`) and counts its usage. The door answers the
 *  member and never the grant. The secret leaves the object only in that one call. */
export async function draftOnObject(ctx, env, { op = null, member = null, session = null, told = null, act = null, field = null,
                                                firsthand = false, pack = null } = {}) {
  const who = member === null || member === undefined || member === "" ? null : `member:${idOf(member)}`;
  const readOf = (grant) => {
    if (!grant) return [];
    try { return [...answersOf(ctx).readLog(grant).index.keys()]; } catch { return []; }
  };
  const out = (status, answer, grant = null, suggestions = false) =>
    json({ ...(answer && typeof answer === "object" && !Array.isArray(answer) ? answer : { ok: false, answer }),
           grant, suggestions, read: readOf(grant) }, status);
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function")
    return out(503, { ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "your group's Civicsmith has no assistant bound to it. Nothing was drafted." });
  const off = instanceSetupOf(ctx, env).assistantGate();
  if (off) return out(403, off);
  const c = credentialsOf(ctx);
  let ref = await c.accountFor({ member: who, act: { kind: "ask", member: who } });
  if (!ref || ref.ok !== true) return out(409, ref);
  let suggestions = false;
  try {
    if (ref.level === "member") { const st = c.accountReferenceState({ member: who, viewer: who }); suggestions = !!(st && st.ok === true && st.suggestions === true); }
    else { const g = c.groupKeySwitches(); suggestions = !!(g && g.suggestions === true); }
  } catch { suggestions = false; }
  let grant = null;
  if (suggestions && firsthand !== true) {
    const g = await c.aiGrantMint({ member: who, by: who, session });
    if (!g || g.ok !== true) return out(403, g, null, suggestions);
    grant = g.token;
  }
  const task = op === "writinghelp" ? { op, act, field } : { op };
  const body = JSON.stringify({ task, told, account: { kind: ref.kind, level: ref.level, secret: ref.key, member: who, suggestions },
                                ...(grant ? { grant } : pack != null ? { pack } : {}), ...(firsthand === true ? { firsthand: true } : {}) });
  ref = null;
  let res;
  try {
    res = await w.fetch("https://agent-worker/draft", { method: "POST", headers: { "content-type": "application/json" }, body });
  } catch {
    return out(502, { ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member did not answer. Nothing was kept." }, grant, suggestions);
  }
  let answer;
  try { answer = await res.json(); }
  catch { return out(502, { ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member's answer was not JSON. Nothing was kept." }, grant, suggestions); }
  return out(res.status, answer, grant, suggestions);
}
