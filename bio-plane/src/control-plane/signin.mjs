/* control-plane R65 (T37; N708, DEC-156; K2134, K2147, K2200 (9); agent-worker R66, R67; credentials R16, R35, R43):
   A MEMBER'S OWN CLAUDE SIGN-IN, RELAYED TO THEIR OWN RUNNER. `op=subscriptionsignin` reaches agent-worker's `POST /signin`
   through the `AGENT_WORKER` binding with `{member, step, code?}`: `member` the door's stamp (the session's `by`), never a
   value the caller sends; `step` and `code` the request body's alone. `start` and `code` are refused while the group keeps
   its material away from AI, as `credentials.aiKeptAway()` answers it (its R35, the one site of `AI_KEPT_AWAY`, asked
   through the store's internal `aikeptaway`), with nothing sent; `state` and `signout` are always sent. The runner's
   answer is relayed as given, status and body; a `code` or `state` answer carrying `connected: true` for that member is
   recorded through `credentials.subscriptionConnected({member})` (its R43, the store's internal `subscriptionconnected`),
   and only then. The member's own `subscriptiondisconnect` and their revocation (credentials R16: `memberset` to
   `revoked`, a carried `adminremove`) send `step: "signout"` for that member, and a runner that cannot be reached changes
   neither act's answer. The code passes through and is kept nowhere here: it is never logged, stored, echoed or put in an
   answer by this module (R30; agent-worker R67). */

export const SIGNIN_STEPS = Object.freeze(["start", "code", "state", "signout"]);
/* The steps that start or complete a sign-in, refused under keep-away (K2200 (9)); `state` and `signout` never are. */
const KEPT_AWAY_STEPS = Object.freeze(["start", "code"]);

const unbound = () => ({ status: 503, body: { ok: false, reason: "AGENT_WORKER_UNBOUND",
  detail: "your group's Civicsmith has no assistant bound to it, so nothing was sent to your sign-in." } });
const silent = (why) => ({ status: 502, body: { ok: false, reason: "AGENT_WORKER_SILENT",
  detail: `the assistant member ${why}. Nothing was kept.` } });

/** The member a store answer of the door's forward signs out (R65): the session's own member on its own
 *  `subscriptiondisconnect`, the revoked member on `memberset` to `revoked` and on a carried `adminremove`; else null.
 *  `asked` is the request's body, `result` the store's answered result, `by` the door's stamp for the caller. */
export function leaverOf(op, asked, result, by) {
  if (!result || typeof result !== "object" || result.ok !== true) return null;
  const a = asked && typeof asked === "object" && !Array.isArray(asked) ? asked : {};
  const memberOf = (id) => (typeof id === "string" && id.trim() !== ""
    ? (id.startsWith("member:") ? id : `member:${id}`) : null);
  if (op === "subscriptiondisconnect") return typeof by === "string" && by ? by : null;
  if (op === "memberset" && a.status === "revoked") return memberOf(result.memberId ?? a.memberId);
  if (op === "adminremove" && result.removed === true) return memberOf(result.memberId ?? a.memberId);
  return null;
}

/** One step sent to agent-worker's `/signin`: `{status, body}` as the runner answered it, or the door's own ending. */
async function send(env, payload) {
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function") return unbound();
  let res;
  try {
    res = await w.fetch("https://agent-worker/signin", { method: "POST", headers: { "content-type": "application/json" },
                                                          body: JSON.stringify(payload) });
  } catch { return silent("did not answer"); }
  let body;
  try { body = await res.json(); } catch { return silent("answered no JSON"); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return silent("answered no JSON object");
  return { status: res.status, body };
}

/** `op=subscriptionsignin` (R65). `member` is the door's stamp, `asked` the request's parsed body (the address is never
 *  read: admission R20 refuses a credential there and `step` and `code` are the body's), `store(path, init)` asks the
 *  caller's store through `doAnswer`. Answers `{status, body}`, or `{unread}`, the store's own answer to the keep-away
 *  question when it refused it or did not answer, which the door answers as any store refusal or silence. */
export async function subscriptionSignin({ env, member, asked, store }) {
  const a = asked && typeof asked === "object" && !Array.isArray(asked) ? asked : {};
  const step = typeof a.step === "string" ? a.step : null;
  if (KEPT_AWAY_STEPS.includes(step)) {
    /* fail closed: a store that refuses the question or does not answer sends nothing, answered as the door answers it */
    const kept = await store("aikeptaway", { method: "POST", body: "{}" });
    if (kept.refused || !kept.answered) return { unread: kept };
    const k = kept.result;
    if (!k || typeof k !== "object" || k.ok !== true)
      return { status: 403, body: { ok: false, ...(k && typeof k === "object" ? k : {}) } };
  }
  /* agent-worker R66 judges `step` and `code` (BAD_STEP, BAD_CODE); the door adds nothing and sends `code` only for its step */
  const payload = { member, step: a.step ?? null, ...(step === "code" ? { code: a.code } : {}) };
  const out = await send(env, payload);
  if ((step === "code" || step === "state") && out.body?.ok === true && out.body.connected === true
      && (out.body.member === undefined || out.body.member === member)) {
    /* credentials R43: the fact only, the member alone; a record that fails changes nothing of the answer */
    try { await store(`subscriptionconnected?by=${encodeURIComponent(member)}`, { method: "POST", body: "{}" }); }
    catch { /* the fact is status, never a gate */ }
  }
  return out;
}

/** R65: `step: "signout"` for a member who left (`leaverOf`), best effort: nothing it answers reaches the act's caller. */
export async function signoutLeaver(env, member) {
  if (!member) return;
  try { await send(env, { member, step: "signout" }); } catch { /* never changes the act's answer */ }
}
