import { localize } from "../setup-words/index.mjs";
/* escalation's ops map (R25; `build/extraction/legacy-store.md` §4.2 (6), §4.4 (8); `build/plan/current.md` rule 5;
 * K760's pattern): the ten route arms the legacy store named (N216, K262), with R27's `declinetoescalate`, R28's
 * `escalationstatus` (DEC-89), R29's `escalationreasondraft` (K1025, N485) and R31's `escalationstoppursuing` and
 * `escalationreopen` (T45), as one object the composition root
 * spreads into its route map (K671). Each arm is a function of no arguments that answers what the named service
 * answers. `author` and `viewer` are the control plane's stamps, read from the query and set after the body's fields,
 * so a body never supplies them; which credential reaches an op is `op-declarations`' and `control-plane`'s, never
 * this map's. R37 (T47; N983, K3027): the three reads, `escalation`, `escalationsdue` and `escalationreasondraft`, are
 * evaluated at the server's instant, the module's own clock (`escalationOf`'s `now`): no arm passes an instant, and a
 * `now` in the query or the body is never read, so a request carrying one answers exactly as the same request without
 * it. An in-plane caller (monitoring's tick, queue-producers) still passes `nowMs` to the service itself. */

/** A query number: absent when the query does not state it or states it empty, else `Number` of what it states. */
const numberParam = (url, k) => { const v = url.searchParams.get(k); return v === null || v === "" ? undefined : Number(v); };

/** R25: the route arms over an `Escalation` instance, the request's URL and its parsed body. */
export function escalationOps(escalation, url, body) {
  const q = (k) => url.searchParams.get(k);
  const act = (name) => () => escalation[name]({ ...(body || {}), author: q("author"), viewer: q("viewer") });
  return {
    escalationopen: act("escalationOpen"),
    escalation: () => escalation.escalationRead({ id: q("id"), viewer: q("viewer") }),
    escalationattach: act("escalationAttach"),
    escalationevaluate: act("escalationEvaluate"),
    escalationadvance: act("escalationAdvance"),
    escalationdecline: act("escalationDecline"),
    escalationend: act("escalationEnd"),
    escalationsuspend: act("escalationSuspend"),
    escalationresume: act("escalationResume"),
    escalationstoppursuing: act("escalationStopPursuing"),
    escalationreopen: act("escalationReopen"),
    escalationsdue: () => escalation.escalationsDue({ limit: numberParam(url, "limit"), viewer: q("viewer") }),
    declinetoescalate: act("declineToEscalate"),
    escalationstatus: () => escalation.escalationStatus({ determination: q("determination"), viewer: q("viewer") }),
    escalationreasondraft: () => escalation.escalationReasonDraft({ determination: q("determination"),
                                                                     viewer: q("viewer") }),
  };
}

/* R38 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  declinetoescalate: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("escalation.declared.declinetoescalate", "determination-directed: a member declines, with a reason, to escalate a live noncompliant determination, keyed by determination id; prose only, corrected forward, and a later opening supersedes it"),
    fields: { accepts: ["determination","reason"], requires: ["determination","reason"] } },
  escalationopen: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: "act.escalationopen.does",
    fields: { accepts: ["determination","reason"], requires: ["determination","reason"] } },
  escalationattach: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: "act.escalationattach.label.matter",
    fields: { accepts: ["id","action","purpose","standards","reason"], requires: ["id","action","reason"] } },
  escalationevaluate: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("escalation.declared.escalationevaluate", "escalation-directed: a member reads a counterparty's response with a reason, keyed by escalation id; appends to its log"),
    fields: { accepts: ["id","response","reading","reason"], requires: ["id","reading","reason"] } },
  escalationadvance: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("escalation.declared.escalationadvance", "escalation-directed: a member advances an escalation along an edge with a reason, keyed by escalation id; appends to its log"),
    fields: { accepts: ["id","to","reason"], requires: ["id","to","reason"] } },
  escalationdecline: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("escalation.declared.escalationdecline", "escalation-directed: a member declines a proposed stage for now with a reason, keyed by escalation id; appends to its log"),
    fields: { accepts: ["id","to","reason"], requires: ["id","to","reason"] } },
  escalationend: { classes: ["admin","member","probe"], mutating: true, weight: "terminal", description: localize("escalation.declared.escalationend", "escalation-directed: a member ends an escalation, keyed by escalation id; appends to its log, never reopened"),
    fields: { accepts: ["id"], requires: ["id"] } },
  escalationsuspend: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("escalation.declared.escalationsuspend", "escalation-directed: a member suspends an escalation with a reason, keyed by escalation id; appends to its log"),
    fields: { accepts: ["id","reason"], requires: ["id","reason"] } },
  escalationresume: { classes: ["admin","member","probe"], mutating: true, weight: "reversible", description: localize("escalation.declared.escalationresume", "escalation-directed: a member resumes a suspended escalation at its stage, keyed by escalation id; appends to its log"),
    fields: { accepts: ["id","reason"], requires: ["id"] } },
  escalationstoppursuing: { classes: ["admin","member","probe"], machineClasses: [], mutating: true, weight: "reasoned", description: "act.escalationstoppursuing.does",
    fields: { accepts: ["id","reason"], requires: ["id","reason"] } },
  escalationreopen: { classes: ["admin","member","probe"], machineClasses: [], mutating: true, weight: "reasoned", description: "act.escalationreopen.does",
    fields: { accepts: ["id","reason"], requires: ["id","reason"] } },
});
