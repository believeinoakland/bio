/* R71, R72 (K2560, K2569, K2570, K2458): THE DOOR'S OWN MAP (`owner-ops.mjs`), driven at its interface with recording
   owners: each op calls its owner's service by name, with the fields the act names and the door's stamps read after the
   body, so a body's `by`, `viewer` or `principal` never wins (R29). Negative controls throughout (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { controlPlaneOwnerOps } from "../../../src/control-plane/owner-ops.mjs";

const FORGED = "member:forged-by-caller";
/* A recording owner: every method answers `{ok: true, method, args}` and is logged. */
function recorder(answers = {}) {
  const log = [];
  return { log, owner: new Proxy({}, { get: (_, method) => (args) => {
    log.push({ method, args });
    return Object.hasOwn(answers, method) ? answers[method](args) : { ok: true, method, args };
  } }) };
}
function owners(answers) {
  const r = recorder(answers);
  const of = Object.fromEntries(["aiUse", "aiRuns", "caseAuthoring", "review", "legEarning", "capture", "steps",
                                 "investigation", "questionExplorer"].map((k) => [k, () => r.owner]));
  return { of, log: r.log };
}
const serve = (op, { query = {}, body, answers } = {}) => {
  const { of, log } = owners(answers);
  const url = new URL("http://do/" + op);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const out = controlPlaneOwnerOps(of, url, body)[op]();
  return { out, log };
};

/* op → [service, fields the act names, the stamp the service takes and its expected value for `by: member:ann`] */
const ACTS = {
  stepcreate: ["stepCreate", { place: { project: "PRJ-1" }, work: "ask the clerk", byWhen: null, project: "PRJ-1" }],
  stepstart: ["stepStart", { step: "STP-1" }], stepend: ["stepEnd", { step: "STP-1", end: "ended", outcomes: { "INQ-1": "helped" } }],
  stepdelete: ["stepDelete", { step: "STP-1", question: "INQ-1" }], steprefer: ["stepRefer", { step: "STP-1", question: "INQ-1" }],
  stepproduct: ["stepProduct", { step: "STP-1", record: "INFO-1" }], stepwait: ["stepWait", { step: "STP-1", on: { date: "2026-11-02" } }],
  stepwaitremove: ["stepWaitRemove", { wait: 3 }], stepreminder: ["stepReminder", { step: "STP-1", at: "2026-11-02" }],
  stepcostadd: ["stepCostAdd", { step: "STP-1", kind: "fee", amount: "12.50", currency: "USD", what: "copies" }],
  stepcostremove: ["stepCostRemove", { cost: 2 }], costmessage: ["costMessage", { step: "STP-1", text: "split it?" }],
  questionfollow: ["questionFollow", { question: "INQ-1", on: true }],
  stepaccept: ["stepAccept", { proposal: 4, form: "as_proposed" }],
  stepoutcome: ["stepOutcome", { step: "STP-1", question: "INQ-1", outcome: "dead_end" }],
  steplearn: ["stepLearn", { step: "STP-1", text: "the office is closed Fridays" }],
  stepbywhen: ["stepByWhen", { step: "STP-1", byWhen: { date: "2026-12-01", basis: "own" } }],
  milestoneset: ["milestoneSet", { project: "PRJ-1", name: "Hearing", date: "2026-12-01", waitsOn: ["INQ-1"] }],
  milestonerevise: ["milestoneRevise", { milestone: 1, name: "Hearing (moved)" }],
  milestoneremove: ["milestoneRemove", { milestone: 1, reason: "cancelled" }],
  milestoneitemremove: ["milestoneItemRemove", { milestone: 1, item: "INQ-1", reason: "answered" }],
  milestonereminder: ["milestoneReminder", { milestone: 1, at: "2026-11-30" }],
  reportkeep: ["reportKeep", { project: "PRJ-1", text: "where we are" }],
  interviewkeep: ["interviewKeep", { project: "PRJ-1", answers: ["a", "b", "c", "d", "e", "f"] }],
  narrativeclaim: ["narrativeClaim", { project: "PRJ-1", source: { own: true }, text: "the permit lapsed" }],
  claimfindstep: ["claimFindStep", { claim: 1, question: "INQ-1" }],
  claimfound: ["claimFound", { claim: 1, record: "INFO-1", step: "STP-1" }],
  planaccept: ["planAccept", { proposal: 2, form: "as_proposed" }], projectwatch: ["projectWatch", { project: "PRJ-1" }],
  projectclosewithgaps: ["projectCloseWithGaps", { project: "PRJ-1", reason: "abandoned", note: "no one left" }],
  findaccept: ["findAccept", { find: "F-1", question: "INQ-1", form: "as_proposed" }],
  findmute: ["findMute", { find: "F-1", question: "INQ-1" }],
};

test("R71 (K2560, K2570): each act of steps, investigation and question-explorer calls its owner's service by name with the fields the act names and `by` the door's, never the body's; a machine arm's `run` and a caller's `at` or `viewer` do not cross (negative control: the founder's `admin` is handed as `member:admin`)", () => {
  for (const [op, [method, fields]] of Object.entries(ACTS)) {
    const { out, log } = serve(op, { query: { by: "member:ann", viewer: FORGED },
                                     body: { ...fields, by: FORGED, viewer: FORGED, run: "RUN-forged", ...(fields.at ? {} : { at: "1999-01-01" }) } });
    assert.equal(out.ok, true, op);
    assert.deepEqual(log, [{ method, args: { ...fields, by: "member:ann" } }], op);
  }
  const { log } = serve("stepstart", { query: { by: "admin" }, body: { step: "STP-1" } });
  assert.equal(log[0].args.by, "member:admin");
  const machine = serve("stepstart", { query: { by: "class:ai/agent-1" }, body: { step: "STP-1" } });
  assert.equal(machine.log[0].args.by, "class:ai/agent-1", "a machine stamp is handed as it is, for the owner to refuse");
});

const READS = {
  stepslike: ["stepsLike", { work: "ask the clerk" }], stepproposals: ["stepProposals", { after: "5", limit: "10" }],
  costmessages: ["costMessages", {}], questionfollowstate: ["following", { question: "INQ-1" }],
  stepproducts: ["productsOf", { step: "STP-1" }], recordsteps: ["stepsOf", { record: "INFO-1" }],
  milestones: ["milestonesOf", { project: "PRJ-1" }], reportdraft: ["reportDraft", { project: "PRJ-1", question: "INQ-1" }],
  reports: ["reportsOf", { project: "PRJ-1" }], interview: ["interviewOf", { project: "PRJ-1" }],
  interviewform: ["interviewForm", { project: "PRJ-1" }], claims: ["claimsOf", { project: "PRJ-1" }],
  investigationproposals: ["planProposals", { project: "PRJ-1" }], quietstate: ["quietState", { project: "PRJ-1" }],
  projectstanding: ["projectStanding", { project: "PRJ-1" }],
};

test("R71 (K2560, K2570): each read calls its owner's service by name with the fields from the address and `viewer` the door's, never the caller's (negative control: a body's `viewer` loses to the stamp)", () => {
  for (const [op, [method, fields]] of Object.entries(READS)) {
    const { log } = serve(op, { query: { ...fields, viewer: "member:ann" }, body: { viewer: FORGED } });
    assert.deepEqual(log, [{ method, args: { ...fields, viewer: "member:ann" } }], op);
  }
});

test("R71: `steps` reads one step by its id, else a question's, a project's or the group's steps, by the viewer's sight (negative control: no caller's viewer)", () => {
  const cases = [[{ step: "STP-1" }, "step"], [{ question: "INQ-1" }, "stepsOn"], [{ project: "PRJ-1" }, "stepsIn"], [{}, "stepsOfGroup"]];
  for (const [query, method] of cases) {
    const { log } = serve("steps", { query: { ...query, viewer: "member:ann" }, body: { viewer: FORGED } });
    assert.equal(log[0].method, method);
    assert.equal(log[0].args.viewer, "member:ann");
  }
});

test("R71 (K2570): `finddoors` answers the find's doors to the member it was offered to, and a find not offered to her as absent, in question-explorer's own words, writing nothing (negative control: an offered find's doors are answered)", () => {
  const offered = serve("finddoors", { query: { find: "F-1", question: "INQ-1", viewer: "member:ann" },
                                       answers: { findDoors: () => ({ find: "F-1", question: "INQ-1", doors: ["accept"] }) } });
  assert.deepEqual(offered.out, { find: "F-1", question: "INQ-1", doors: ["accept"] });
  const absent = serve("finddoors", { query: { find: "F-9", question: "INQ-1", viewer: "member:ann" },
                                      answers: { findDoors: () => null, findMute: (a) => ({ ok: false, reason: "EXPLORE_NO_SUCH_FIND", args: a }) } });
  assert.equal(absent.out.reason, "EXPLORE_NO_SUCH_FIND");
  assert.equal(absent.log[1].args.by, null, "asked as no one, so nothing is muted");
});

test("R71 (K2569): the ops whose owners export no arm call their services by name, stamps read after the body (`by` bare where the owner compares a member id; `viewer`, `principal` and `actor` the door's) (negative controls: the body's forged stamps lose)", () => {
  const q = { by: "member:ann", viewer: "member:ann", principal: "member:ann" };
  const forged = { by: FORGED, viewer: FORGED, proposedBy: FORGED, principalPlane: FORGED, actor: FORGED };
  const want = {
    aiestimate: ["estimate", { owner: "member:ann", use: "run", count: 2, viewer: "member:ann" }],
    aiactual: ["actualOf", { run: "RUN-1", viewer: "member:ann" }],
    grouptestresults: ["groupTestResults", { part: "explore", viewer: "member:ann" }],
    accountdrafts: ["accountDrafts", { case: "CASE-1", viewer: "member:ann" }],
    approvalruleset: ["approvalRuleSet", { approvers: ["bea"], by: "ann" }],
    caseapprove: ["caseApprove", { case: "CASE-1", edition: "1", docSha: "d", reason: "fine", by: "ann" }],
    projectsshownon: ["projectsShownOn", { id: "INQ-1", viewer: "member:ann" }],
  };
  for (const [op, [method, args]] of Object.entries(want)) {
    const { log } = serve(op, { query: q, body: { ...args, ...forged } });
    assert.equal(log[0].method, method, op);
    for (const [k, v] of Object.entries(args)) assert.deepEqual(log[0].args[k], v, `${op}.${k}`);
  }
  let { log } = serve("stepsrunai", { query: q, body: { steps: ["STP-1"], mode: "investigate", ...forged } });
  assert.deepEqual([log[0].method, log[0].args.principalPlane, log[0].args.actor, log[0].args.viewer, log[0].args.steps],
                   ["openMany", "member:ann", "member:ann", "member:ann", ["STP-1"]]);
  ({ log } = serve("grouptestset", { query: q, body: { part: "explore", matter: "m", answers: "a", ...forged } }));
  assert.deepEqual([log[0].method, log[0].args.by, log[0].args.part], ["groupTestSet", "member:ann", "explore"]);
  ({ log } = serve("accountpropose", { query: q, body: { case: "CASE-1", framing: "f", text: "t", ...forged } }));
  assert.deepEqual([log[0].method, log[0].args.proposedBy, log[0].args.viewer, log[0].args.case], ["accountPropose", "ann", "member:ann", "CASE-1"]);
  ({ log } = serve("reviewcomments", { query: { ...q, case: "CASE-1", edition: "2" }, body: { viewer: FORGED } }));
  assert.deepEqual([log[0].method, log[0].args.viewer, log[0].args.draft], ["reviewCommentsFor", "member:ann", null], "`draft` optional");
  ({ log } = serve("reviewcomments", { query: { ...q, case: "CASE-1", draft: "DRAFT-1" } }));
  assert.equal(log[0].args.draft, "DRAFT-1");
});

test("R72 (capture R86): `captureupload` hands the request's raw body to capture's `uploadCapture` as `bytes`, unread, its words from the address and `by` the door's (negative control: nothing but the bytes is taken from the body)", () => {
  const stream = new ReadableStream();
  const { log } = serve("captureupload", { query: { by: "ann", statement: "she gave it to me", name: "a.pdf", within: "PRJ-1" }, body: stream });
  assert.equal(log[0].method, "uploadCapture");
  assert.equal(log[0].args.bytes, stream);
  assert.deepEqual([log[0].args.by, log[0].args.statement, log[0].args.name, log[0].args.within], ["ann", "she gave it to me", "a.pdf", "PRJ-1"]);
});

test("R71 (steps R9): the store-internal `capturestepproduct` ties a landed capture to a step the member may see through `recordProduct`, and a step she may not see ties nothing, answered as steps answers it (negative control)", () => {
  const sha = "b".repeat(64);
  const seen = serve("capturestepproduct", { query: { viewer: "member:ann", by: "member:ann" }, body: { step: "STP-1", capture: sha } });
  assert.deepEqual(seen.log.map((l) => l.method), ["step", "recordProduct"]);
  assert.deepEqual(seen.log[1].args, { step: "STP-1", record: { kind: "capture", id: sha }, by: "member:ann" });
  const unseen = serve("capturestepproduct", { query: { viewer: "member:bea", by: "member:bea" }, body: { step: "STP-1", capture: sha },
                                               answers: { step: () => ({ ok: false, reason: "NO_SUCH_STEP" }) } });
  assert.deepEqual([unseen.out.reason, unseen.log.map((l) => l.method)], ["NO_SUCH_STEP", ["step"]]);
});
