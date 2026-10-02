/* escalation's ops map (R25; `build/extraction/legacy-store.md` §4.2 (6), §4.4 (8); `build/plan/current.md` rule 5;
 * K760's pattern): the ten route arms the legacy store named (N216, K262), with R27's `declinetoescalate`, R28's
 * `escalationstatus` (DEC-89) and R29's `escalationreasondraft` (K1025, N485), as one object the composition root
 * spreads into its route map (K671). Each arm is a function of no arguments that answers what the named service
 * answers. `author` and `viewer` are the control plane's stamps, read from the query and set after the body's fields,
 * so a body never supplies them; which credential reaches an op is `op-declarations`' and `control-plane`'s, never
 * this map's. */

/** A query number: absent when the query does not state it or states it empty, else `Number` of what it states. */
const numberParam = (url, k) => { const v = url.searchParams.get(k); return v === null || v === "" ? undefined : Number(v); };

/** R25: the route arms over an `Escalation` instance, the request's URL and its parsed body. */
export function escalationOps(escalation, url, body) {
  const q = (k) => url.searchParams.get(k);
  const act = (name) => () => escalation[name]({ ...(body || {}), author: q("author"), viewer: q("viewer") });
  return {
    escalationopen: act("escalationOpen"),
    escalation: () => escalation.escalationRead({ id: q("id"), nowMs: numberParam(url, "now"), viewer: q("viewer") }),
    escalationattach: act("escalationAttach"),
    escalationevaluate: act("escalationEvaluate"),
    escalationadvance: act("escalationAdvance"),
    escalationdecline: act("escalationDecline"),
    escalationend: act("escalationEnd"),
    escalationsuspend: act("escalationSuspend"),
    escalationresume: act("escalationResume"),
    escalationsdue: () => escalation.escalationsDue({ nowMs: numberParam(url, "now"), limit: numberParam(url, "limit"),
                                                      viewer: q("viewer") }),
    declinetoescalate: act("declineToEscalate"),
    escalationstatus: () => escalation.escalationStatus({ determination: q("determination"), viewer: q("viewer") }),
    escalationreasondraft: () => escalation.escalationReasonDraft({ determination: q("determination"),
                                                                     nowMs: numberParam(url, "now"), viewer: q("viewer") }),
  };
}
