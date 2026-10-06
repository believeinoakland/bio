/* plane (B2, K1674, K1684; control-plane R53; agent-worker R54, R56; credentials R24, R25, R27): `op=ask`'s handler. A
   member's own session (or a grant control-plane admitted, handed as `grantMember`) asks; on the `bio` object, where
   credentials live, the member's short-lived read-only grant is minted at that act, the member's own account reference
   is unsealed for this one ask and their suggestions switch read, and the question goes to agent-worker's `/ask` with
   the grant and the account. agent-worker's answer (its NDJSON stream, or its plain refusal) is handed back unchanged.
   The secret leaves the object only in that one call and is kept nowhere; every refusal is its owner's, in its words. */
import { credentialsOf } from "../credentials/index.mjs";
import { instanceSetupOf } from "../setup.mjs";

const json = (body, status) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const idOf = (m) => (typeof m === "string" && m.startsWith("member:") ? m.slice(7) : m);

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
                 session: viaSession ? url.searchParams.get("token") : null,
                 grant: viaSession ? null : url.searchParams.get("token") };
  return env.STORE.get(env.STORE.idFromName("bio")).ask(args);
}

/** On the `bio` object: mint the grant (unless one was presented), unseal the account, read the suggestions switch,
 *  and post the ask. */
export async function askOnObject(ctx, env, { member, session = null, grant = null, question, conversation, store = null }) {
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function")
    return json({ ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "no assistant member is bound to this plane. Nothing was asked." }, 503);
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
  let ref = await c.accountReferenceFor({ member, act: { kind: "ask", member } });
  if (!ref || ref.ok !== true) return json(ref, 409);
  let suggestions = false;
  try { const st = c.accountReferenceState({ member, viewer: member }); suggestions = !!(st && st.ok === true && st.suggestions === true); }
  catch { suggestions = false; }
  const out = JSON.stringify({ question, ...(conversation !== undefined ? { conversation } : {}), ...(store ? { store } : {}),
                               grant: token, account: { kind: ref.kind, secret: ref.secret, member, suggestions } });
  ref = null;
  let res;
  try {
    res = await w.fetch("https://agent-worker/ask", { method: "POST", headers: { "content-type": "application/json" }, body: out });
  } catch {
    return json({ ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member did not answer. Nothing was kept." }, 502);
  }
  return new Response(res.body, { status: res.status, headers: res.headers });
}
