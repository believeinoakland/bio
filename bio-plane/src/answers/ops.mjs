/* answers' ops map: route arms keyed by op name, each a function of no arguments answering what its service answers.
 * The stamps (`viewer`, `by`, and the grant an ask reads under) are the control plane's, read from `url`'s query, never
 * from the body; an act's arguments are read from the body. Which credential reaches each op is `op-declarations`'. */

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const q = (url, k) => (url && url.searchParams ? url.searchParams.get(k) : null);

export function answersOps(a, url, body) {
  const b = plain(body) ? body : {};
  const viewer = q(url, "viewer");
  const grant = q(url, "grant");
  return {
    /* R7: the door to every rule service (ASK_SCOPE's `rule`) */
    rule: () => a.ruleAnswer({ service: q(url, "service") ?? b.service ?? null, args: plain(b.args) ? b.args : {},
                               at: q(url, "at") ?? b.at ?? null, viewer, grant }),
    /* R4: an answer checked against the grant's read log before it is shown */
    answercheck: () => a.check({ answer: b.answer ?? null, grant, viewer, mode: "ask" }),
    /* R13 */
    asktallies: () => a.tallies({ viewer, from: q(url, "from") ?? b.from ?? null, to: q(url, "to") ?? b.to ?? null }),
    ruleservicesswitch: () => a.ruleServicesSwitch({ on: b.on === true, by: viewer }),
    /* R15–R20 */
    /* R15, R28: a saved query or a find (`{scope, kinds, term?}`, as `retrieval.findIn` takes them) */
    standingset: () => a.standingQuestionSet({ author: viewer, owner: q(url, "owner"), question: b.question ?? null,
                                                query: b.query ?? null, find: b.find ?? null, cadence: b.cadence ?? null,
                                                ends: b.ends ?? null }),
    standing: () => (q(url, "id") ?? b.id ? a.standingQuestionRead({ id: q(url, "id") ?? b.id, viewer })
                                           : a.standingQuestionsOf({ viewer })),
    standingend: () => a.standingQuestionEnd({ id: q(url, "id") ?? b.id ?? null, author: viewer }),
    standinganswers: () => a.standingAnswersFor({ member: viewer, after: q(url, "after") ?? b.after ?? null,
                                                  limit: q(url, "limit") ?? b.limit ?? null }),
    standingaiswitch: () => a.standingAiSwitch({ on: b.on === true, by: viewer }),
  };
}
