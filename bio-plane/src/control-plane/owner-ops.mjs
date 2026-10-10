/* control-plane R71 (T41; N820; K2560, K2569, K2570), R72 (K2458): THE DOOR'S OWN MAP, for the ops `op-declarations` R43
   and R45 declare whose owners export a service and no arm for it. Each arm calls the owner's exported service by name,
   holds no behaviour of its own (a refusal is the owner's, answered as given), and reads its stamps AFTER the body, so a
   body's copy of `by`, `viewer` or `principal` never wins (R29; the door also deletes any the caller sent, R17).

   `plane` spreads this map into its route map (R5) beside the owners' own, handing it each owner's one instance through
   `of`, a set of getters (`of.aiUse()`, `of.aiRuns()`, `of.caseAuthoring()`, `of.review()`, `of.legEarning()`,
   `of.capture()`, `of.steps()`, `of.investigation()`, `of.questionExplorer()`), each asked only when its op is served. */

/* The `by` stamp is the actor in the viewer's form (`member:<id>`, the founder's `admin`, a machine `class:<cls>`); the
   owners that compare a bare member id with their roster are handed the bare id, and a machine stamp unchanged, so the
   owner refuses it by name. */
const bare = (by) => (typeof by === "string" && by.startsWith("member:") ? by.slice("member:".length) : by ?? null);
/* steps, investigation and question-explorer ask membership's `positionalMember` of their actor, so the founder's
   session (`admin` in the viewer's form) is handed as its positional identity, `member:admin`. */
const positional = (by) => (by === "admin" ? "member:admin" : by ?? null);
/* only the fields an act names cross from the body: a machine arm's `run` or a caller's `at` never does */
const pick = (b, keys) => Object.fromEntries(keys.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));

export function controlPlaneOwnerOps(of, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  /* a field the caller may send in the address or the body, the body's first */
  const f = (k) => (b[k] !== undefined ? b[k] : q(k));
  return {
    /* ai-use R10, R11 (K2569): an estimate and an actual, answered only to the paying account's owners. */
    aiestimate: () => of.aiUse().estimate({ owner: f("owner"), use: f("use"), mode: f("mode"),
                                            count: b.count !== undefined ? b.count : q("count") === null ? undefined : Number(q("count")),
                                            viewer: q("viewer") }),
    aiactual: () => of.aiUse().actualOf({ run: f("run"), act: f("act"), viewer: q("viewer") }),
    /* ai-runs R74, R73 (K2569): a batch of runs over steps, opened as `airunopen` is (the run's principal, its actor and
       viewer the door's), and the group's test bar's set and read. */
    stepsrunai: () => of.aiRuns().openMany({ ...b, principalPlane: q("principal") ?? q("by"), actor: q("by"), viewer: q("viewer") }),
    grouptestset: () => of.aiRuns().groupTestSet({ ...b, by: q("by") }),
    grouptestresults: () => of.aiRuns().groupTestResults({ part: f("part"), viewer: q("viewer") }),
    /* case-authoring R64 (K2569): a proposed account of a case, labelled with its proposer as `whatchangedpropose`'s are. */
    accountpropose: () => of.caseAuthoring().accountPropose({ ...b, proposedBy: bare(q("by")), viewer: q("viewer") }),
    accountdrafts: () => of.caseAuthoring().accountDrafts({ case: f("case"), viewer: q("viewer") }),
    /* review R30, R31, R33 (K2529): the approval rule, an approval, and the comments on a case (`draft` optional). */
    approvalruleset: () => of.review().approvalRuleSet({ approvers: b.approvers, by: bare(q("by")) }),
    caseapprove: () => of.review().caseApprove({ case: f("case"), edition: f("edition"), docSha: f("docSha"),
                                                 reason: f("reason"), by: bare(q("by")) }),
    reviewcomments: () => of.review().reviewCommentsFor({ case: f("case"), edition: f("edition"), viewer: q("viewer"),
                                                          draft: f("draft") ?? null,
                                                          limit: f("limit") === null || f("limit") === undefined ? null : Number(f("limit")) }),
    /* leg-earning R14 (K2569): the projects a question is shown on, as the viewer may see them. */
    projectsshownon: () => of.legEarning().projectsShownOn({ id: f("id"), viewer: q("viewer") }),

    /* capture R86 (R72; K2458): a member's upload, the request's raw body handed on as `bytes` (a stream, never read
       here), its words from the address, `by` the door's. Capture's own map holds no arm for it, so this one calls its
       service by name, as R71's do. */
    captureupload: () => of.capture().uploadCapture({ bytes: body, statement: q("statement"), name: q("name"),
                                                      within: q("within"), by: q("by") }),
    /* R71 (steps R9): STORE-INTERNAL, no spec, so no caller reaches it (R2): the door ties a member's landed capture to
       the step she named, `recordProduct` asked only for a step she may see; one she may not is answered as steps
       answers an unseen step. */
    capturestepproduct: () => {
      const s = of.steps(), seen = s.step({ step: b.step, viewer: q("viewer") });
      if (!seen || seen.ok !== true) return seen;
      return s.recordProduct({ step: b.step, record: { kind: "capture", id: b.capture }, by: positional(q("by")) });
    },

    /* steps R1–R24 (K2560, K2570): a step's acts, `by` the door's; its reads, `viewer` the door's. */
    ...acts(() => of.steps(), {
      stepcreate: ["stepCreate", ["place", "work", "byWhen", "project"]],
      stepstart: ["stepStart", ["step"]],
      stepend: ["stepEnd", ["step", "end", "outcomes", "learned", "reason"]],
      stepdelete: ["stepDelete", ["step", "question"]],
      steprefer: ["stepRefer", ["step", "question"]],
      stepproduct: ["stepProduct", ["step", "record"]],
      stepwait: ["stepWait", ["step", "on"]],
      stepwaitremove: ["stepWaitRemove", ["wait"]],
      stepreminder: ["stepReminder", ["step", "at"]],
      stepcostadd: ["stepCostAdd", ["step", "kind", "amount", "currency", "what"]],
      stepcostremove: ["stepCostRemove", ["cost"]],
      costmessage: ["costMessage", ["step", "text"]],
      questionfollow: ["questionFollow", ["question", "on"]],
      stepaccept: ["stepAccept", ["proposal", "form", "work", "project", "reason"]],
      stepoutcome: ["stepOutcome", ["step", "question", "outcome"]],
      steplearn: ["stepLearn", ["step", "text"]],
      stepbywhen: ["stepByWhen", ["step", "byWhen"]],
    }, b, q),
    ...reads(() => of.steps(), {
      stepslike: ["stepsLike", ["work", "questions", "limit"]],
      stepproposals: ["stepProposals", ["after", "limit"]],
      costmessages: ["costMessages", []],
      questionfollowstate: ["following", ["question"]],
      stepproducts: ["productsOf", ["step"]],
      recordsteps: ["stepsOf", ["record"]],   /* the instance's method, not the factory */
    }, f, q),
    /* `steps`: one step by its id, else the steps on a question, in a project, or the group's */
    steps: () => {
      const s = of.steps(), viewer = q("viewer"), page = { state: f("state"), after: f("after"), limit: f("limit") };
      if (f("step")) return s.step({ step: f("step"), viewer });
      if (f("question")) return s.stepsOn({ question: f("question"), viewer, ...page });
      if (f("project")) return s.stepsIn({ project: f("project"), viewer, ...page });
      return s.stepsOfGroup({ viewer, ...page });
    },

    /* investigation R1–R20 (K2560): its acts and reads; `milestonereminder`'s `at` is the body's calendar day,
       untouched; `milestonerevise` hands on only the fields the body names. */
    ...acts(() => of.investigation(), {
      milestoneset: ["milestoneSet", ["project", "name", "date", "waitsOn"]],
      milestonerevise: ["milestoneRevise", ["milestone", "name", "date", "waitsOn"]],
      milestoneremove: ["milestoneRemove", ["milestone", "reason"]],
      milestoneitemremove: ["milestoneItemRemove", ["milestone", "item", "reason"]],
      milestonereminder: ["milestoneReminder", ["milestone", "at"]],
      reportkeep: ["reportKeep", ["project", "question", "text", "since", "corrects"]],
      interviewkeep: ["interviewKeep", ["project", "answers", "from_draft"]],
      narrativeclaim: ["narrativeClaim", ["project", "source", "text", "about"]],
      claimfindstep: ["claimFindStep", ["claim", "question"]],
      claimfound: ["claimFound", ["claim", "record", "step"]],
      planaccept: ["planAccept", ["proposal", "form", "text", "reason"]],
      projectwatch: ["projectWatch", ["project"]],
      projectclosewithgaps: ["projectCloseWithGaps", ["project", "reason", "note"]],
    }, b, q),
    ...reads(() => of.investigation(), {
      milestones: ["milestonesOf", ["project"]],
      reportdraft: ["reportDraft", ["project", "question"]],
      reports: ["reportsOf", ["project"]],
      interview: ["interviewOf", ["project"]],
      interviewform: ["interviewForm", ["project"]],
      claims: ["claimsOf", ["project"]],
      investigationproposals: ["planProposals", ["project"]],
      quietstate: ["quietState", ["project"]],
      projectstanding: ["projectStanding", ["project"]],
    }, f, q),

    /* question-explorer R6 (K2570): a find taken up or muted by the member it was offered to; its doors read by her
       sight, a find not offered to her answered as absent, in the owner's own words (EXPLORE_NO_SUCH_FIND). */
    ...acts(() => of.questionExplorer(), {
      findaccept: ["findAccept", ["find", "question", "form", "edit"]],
      findmute: ["findMute", ["find", "question"]],
    }, b, q),
    finddoors: () => {
      const e = of.questionExplorer(), find = f("find"), question = f("question");
      const doors = e.findDoors({ find, question, viewer: q("viewer") });
      return doors ?? e.findMute({ find, question, by: null });
    },
  };
}

/* An act: the named fields from the body, then `by`, the door's, as the owner's positional identity. */
function acts(owner, table, b, q) {
  return Object.fromEntries(Object.entries(table).map(([op, [method, keys]]) =>
    [op, () => owner()[method]({ ...pick(b, keys), by: positional(q("by")) })]));
}
/* A read: the named fields from the address or the body, then `viewer`, the door's. */
function reads(owner, table, f, q) {
  return Object.fromEntries(Object.entries(table).map(([op, [method, keys]]) =>
    [op, () => owner()[method]({ ...Object.fromEntries(keys.map((k) => [k, f(k)]).filter(([, v]) => v !== undefined && v !== null)),
                                 viewer: q("viewer") })]));
}
