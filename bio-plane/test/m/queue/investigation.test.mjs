/* T40's and T41's kinds at queue's interface (N812, N814, N820; K2371, K2376 (2), K2418, K2484, K2523): the AI accounts'
   three FINDINGs and `notice-producers` R17's ten kinds in their classes with their sentences (R1); their dispositions
   (R12's T40 clause, R52), over a stubbed `notice-producers.noticeItems` minting each as its requirement keys it; and
   the project arm of `op=proposedispose` as a question's set-aside (R27's T40 clause), read by the real `investigation`
   module through the reader queue registers with it (K2523). Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { Queue, QUEUE_ACT_CHECKS, queueOf } from "../../../src/queue/index.mjs";
import { classOfKind, QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS } from "../../../src/queuestate.mjs";
import { world as investigationWorld, ANN, BOB, P1, P2, Q2, Q3 } from "../investigation/fixture.mjs";

/* R1: each kind, its class (notice-producers R16, R17; K2484) and what its sentence says. */
const KINDS = {
  "explore-ask":               ["FINDING", /one of your accounts may explore today; approve it or let the day pass/],
  "ai-limit-reached":          ["FINDING", /a limit of an account you own was reached in this period/],
  "project-account-suspended": ["FINDING", /a project's sign-in account stopped serving because a second member joined/],
  "question-find":             ["FINDING", /the machine found something that may bear on a question you follow; labelled as the machine's work/],
  "step-later-found":          ["FINDING", /something a step looked for and did not find has since arrived/],
  "step-date-due":             ["OBLIGATION", /a step you set a date on has passed that date and is not ended/],
  "step-reminder":             ["OBLIGATION", /a reminder you asked for on a step's date; answer it with another reminder or none/],
  "milestone-overdue":         ["FINDING", /a milestone of a project you take part in has passed its date/],
  "milestone-reminder":        ["OBLIGATION", /a reminder you asked for on a milestone/],
  "project-quiet":             ["FINDING", /a project you take part in has gone quiet: its objective, its condition and what the record still lacks; write it up, keep watching, close it with its gaps, or revise the objective/],
  "step-cost-shared":          ["FINDING", /a costed step serves questions several projects you own draw on/],
  "step-cost-message":         ["FINDING", /an owner of another project sharing a costed step sent you a message about its cost/],
  "review-comment-left-out":   ["FINDING", /your comments on a case's review copy were not included in its published edition; you may file a response in its docket/],
};

test("R1: the AI accounts' three kinds and notice-producers R17's ten answer their classes, each with its sentence; near-misses answer null", () => {
  for (const [k, [cls, says]] of Object.entries(KINDS)) {
    assert.equal(classOfKind(k), cls, k);
    assert.match((cls === "OBLIGATION" ? QUEUE_OBLIGATION_KINDS : QUEUE_FINDING_KINDS)[k], says, k);
  }
  // negative control: near-misses and published ids are no kind
  for (const v of ["explore", "explore-asks", "ai-limit", "project-account", "question-finds", "step-later", "step-due",
                   "milestone", "milestone-overdue ", "MILESTONE-REMINDER", "project_quiet", "step-cost", "review-comment",
                   "FINDING::question-find", "OBLIGATION::step-date-due"])
    assert.equal(classOfKind(v), null, v);
});

/* The world: PRJ-A and PRJ-B, alice and bob joined to both; INQ-D drawn on by both; INQ-L under no project. */
function noticed(items) {
  const w = world({ notices: { noticeItems: (a) => ({ facts: {}, items: items.map(({ home, ...it }) => ({
    ...it, case: a.homesOf([home]), summary: it.kind, detail: null,
    basis: { source: "notice-producers", detail: "stubbed as its requirement keys it" },
    age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
    options: a.optionsOf([home]) })) }) } });
  for (const m of ["alice", "bob"]) w.member(m);
  for (const p of ["PRJ-A", "PRJ-B"]) { w.bundle(p, "project"); w.join(p, "alice"); w.join(p, "bob"); }
  w.bundle("INQ-D", "inquiry"); w.cite("PRJ-A", "INQ-D"); w.cite("PRJ-B", "INQ-D");
  w.bundle("INQ-L", "inquiry");
  return w;
}
const item = (kind, home = "INQ-D", tag = "1") => ({ id: `${classOfKind(kind)}::${kind}::${home}::${tag}`, class: classOfKind(kind),
  kind, subject: { kind: "bundle", id: home }, home });

test("R12: an explore-ask names exploreapprove, ai-limit-reached and project-account-suspended name queuemute, none available, homed or not", () => {
  const kinds = ["explore-ask", "ai-limit-reached", "project-account-suspended"];
  const w = noticed([...kinds.map((k) => item(k)), ...kinds.map((k) => item(k, "INQ-L")),
                     item("security-level-high")]);
  const f = byId(w.feed("alice"));
  for (const home of ["INQ-D", "INQ-L"])
    for (const [k, door] of [["explore-ask", "exploreapprove"], ["ai-limit-reached", "queuemute"], ["project-account-suspended", "queuemute"]]) {
      const d = f[item(k, home).id].disposition;
      assert.deepEqual([d.available, d.op, d.scope, d.key, d.instead], [false, null, null, null, door], `${k} ${home}`);
      assert.equal(d.projects, undefined, "no team is named for an account's notice");
    }
  // negative control: another FINDING under the same homes keeps R12's project-scoped disposition
  const other = f[item("security-level-high").id].disposition;
  assert.deepEqual([other.available, other.scope, other.projects], [true, "project", ["PRJ-A", "PRJ-B"]]);
  // each is quieted by its recipient alone: the item mute is accepted, writing only that member's row
  const m = w.q.queueMute({ member: "alice", viewer: "member:alice", item: item("ai-limit-reached").id });
  assert.deepEqual([m.ok, m.item_class], [true, "FINDING"]);
  const g = byId(w.feed("bob"));
  assert.ok(g[item("ai-limit-reached").id], "bob's feed did not move");
});

test("R52: question-find project-scoped with findaccept, hypothesishold and stepcreate; outside a project home, a personal mute", () => {
  const w = noticed([item("question-find"), item("question-find", "INQ-L"), item("milestone-overdue", "INQ-L")]);
  const f = byId(w.feed("alice"));
  const d = f[item("question-find").id].disposition;
  assert.deepEqual([d.available, d.op, d.scope, d.key, d.finding, d.projects, d.requires, d.acts, d.keyed_on],
    [true, "proposedispose", "project", null, item("question-find").id, ["PRJ-A", "PRJ-B"], ["project", "finding"],
     ["findaccept", "hypothesishold", "stepcreate"], ["project", "finding"]]);
  const lone = f[item("question-find", "INQ-L").id].disposition;
  assert.deepEqual([lone.available, lone.reason, lone.projects, lone.instead, lone.acts],
    [false, "no_project_scope", [], "queuemute", ["findaccept", "hypothesishold", "stepcreate"]]);
  // negative control: another project-scoped kind with no project home names no personal mute
  const other = f[item("milestone-overdue", "INQ-L").id].disposition;
  assert.deepEqual([other.available, other.reason, other.instead, other.acts], [false, "no_project_scope", null, undefined]);
});

test("R52: step-later-found names stepend, project-quiet its three doors; the cost items, milestone-overdue and review-comment-left-out R12's project scope with no act", () => {
  const plain = ["step-cost-shared", "step-cost-message", "milestone-overdue", "review-comment-left-out"];
  const w = noticed([item("step-later-found"), item("project-quiet"), ...plain.map((k) => item(k))]);
  const f = byId(w.feed("alice"));
  for (const [k, acts] of [["step-later-found", ["stepend"]], ["project-quiet", ["projectwatch", "projectclosewithgaps", "objectivecondition"]],
                           ...plain.map((k) => [k, undefined])]) {
    const d = f[item(k).id].disposition;
    assert.deepEqual([d.available, d.op, d.scope, d.projects, d.requires, d.acts], [true, "proposedispose", "project",
      ["PRJ-A", "PRJ-B"], ["project", "finding"], acts], k);
  }
  for (const k of ["step-later-found", "project-quiet", "question-find"]) assert.ok(Object.isFrozen(Queue.FINDING_ACTS[k]), k);
  // R13 holds for them: one project's decision removes it for that project only
  const pd = w.q.proposeDispose({ project: "PRJ-A", finding: item("project-quiet").id, kind: "project-quiet", to: "deferred",
                                  reason: "watching", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
  assert.equal(pd.ok, true);
  const after = byId(w.feed("alice"))[item("project-quiet").id];
  assert.deepEqual([after.disposition.projects, after.disposition.disposed_by], [["PRJ-B"], ["PRJ-A"]]);
  // negative control: an act no op declares is never named
  for (const k of Object.keys(Queue.FINDING_ACTS)) for (const a of Queue.FINDING_ACTS[k])
    assert.ok(!["projectclose", "setcondition"].includes(a), `${k}: ${a}`);
});

test("R52, R12, R28, R31: step-date-due names stepend, the two reminders their own reminder acts; each an OBLIGATION never muted", () => {
  const obl = (k) => ({ ...item(k), id: `OBLIGATION::${k}::STP-1::2026-09-01` });
  const doors = { "step-date-due": "stepend", "step-reminder": "stepreminder", "milestone-reminder": "milestonereminder" };
  const w = noticed(Object.keys(doors).map(obl));
  const f = byId(w.feed("alice"));
  for (const [k, door] of Object.entries(doors)) {
    const d = f[obl(k).id].disposition;
    assert.deepEqual([d.available, d.op, d.scope, d.reason, d.instead], [false, null, null, "an_obligation_is_resolved_not_disposed", door], k);
    assert.equal(Queue.doorOf(k), door, k);
    assert.match(d.detail, new RegExp(`op=${door}`), k);
    // R28: the bridge names the same door
    const b = w.q.proposeDispose({ key: obl(k).id, to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice" });
    assert.deepEqual([b.reason, b.class, b.kind, b.instead, b.check], ["CLASS_NOT_DISPOSED", "OBLIGATION", k, door, "C-33.44"], k);
    // R19, R31: never muted, by item or by kind
    assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", item: obl(k).id }).reason, "KIND_NOT_PERSONAL", k);
    assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-A", kinds: [k] }).reason, "KIND_NOT_PERSONAL", k);
  }
  // negative control: a task's door stays taskresolve
  assert.equal(Queue.doorOf("authority-undetermined"), "taskresolve");
  assert.equal(w.all(`SELECT count(*) c FROM queue_item_mutes`)[0].c + w.all(`SELECT count(*) c FROM queue_state`)[0].c, 0);
});

/* R27 (T40; K2371, N814): a question set aside by a project. Questions drawn on by one, two or three projects (one hidden
   from the caller), each project deciding for itself. */
function questions() {
  const w = world();
  for (const m of ["alice", "bob", "cat"]) w.member(m);
  for (const p of ["PRJ-A", "PRJ-B", "PRJ-H"]) w.bundle(p, "project");
  w.join("PRJ-A", "alice"); w.join("PRJ-A", "bob", { state: "invited" }); w.join("PRJ-B", "alice"); w.join("PRJ-B", "bob"); w.join("PRJ-H", "cat");
  w.bundle("INQ-1", "inquiry"); w.cite("PRJ-A", "INQ-1");
  w.bundle("INQ-3", "inquiry"); for (const p of ["PRJ-A", "PRJ-B", "PRJ-H"]) w.cite(p, "INQ-3");
  return w;
}
const as = (who, a) => ({ decidedBy: who, viewer: `member:${who}`, identity: `member:${who}`, ...a });

test("R27: a question's set-aside is this project arm: one project's decision, kept for it alone, never a move of the question's own state", () => {
  const w = questions();
  const state = () => w.all(`SELECT current_state s FROM bundles WHERE bundle_id='INQ-3'`)[0].s;
  const before = state();
  const r = w.q.proposeDispose(as("alice", { project: "PRJ-A", finding: "INQ-3", to: "deferred", reason: "later" }));
  assert.deepEqual([r.ok, r.scope, r.key, r.state, r.bundle], [true, "project", "PRJ-A::INQ-3", "deferred", null]);
  assert.equal(state(), before, "the question's own state did not move");
  assert.equal(w.q.projectDisposition({ project: "PRJ-A", question: "INQ-3" }), "deferred");
  for (const p of ["PRJ-B", "PRJ-H"]) assert.equal(w.q.projectDisposition({ project: p, question: "INQ-3" }), null, p);
  // another project decides for itself, and the first stands
  assert.equal(w.q.proposeDispose(as("bob", { project: "PRJ-B", finding: "INQ-3", to: "dismissed", reason: "no" })).ok, true);
  assert.deepEqual(["PRJ-A", "PRJ-B"].map((p) => w.q.projectDisposition({ project: p, question: "INQ-3" })), ["deferred", "dismissed"]);
  // re-decided: one decision per (project, question)
  w.q.proposeDispose(as("alice", { project: "PRJ-A", finding: "INQ-3", to: "dismissed", reason: "on reflection" }));
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions WHERE project_id='PRJ-A' AND finding_id='INQ-3'`)[0].c, 1);
  assert.equal(w.q.projectDisposition({ project: "PRJ-A", question: "INQ-3" }), "dismissed");
  // negative control: no decision, a blank or another question reads null, and a row of another state is not read as one
  for (const a of [{ project: "PRJ-A", question: "INQ-1" }, { project: "", question: "INQ-3" }, { project: "PRJ-A" }, {}])
    assert.equal(w.q.projectDisposition(a), null, JSON.stringify(a));
  w.run(`INSERT INTO finding_dispositions VALUES ('PRJ-A','INQ-1',NULL,'adopted','r','alice','t')`);
  assert.equal(w.q.projectDisposition({ project: "PRJ-A", question: "INQ-1" }), null);
});

test("R27: no refusal of the project arm depends on how many projects draw on the question, and none names another project", () => {
  const w = questions();
  /* each refusal of the arm, in R27's order, with `withFinding` saying whether the question is sent */
  const cases = [[{ project: "PRJ-A", to: "deferred", reason: "r" }, false, "NO_FINDING"],
                 [{ to: "deferred", reason: "r" }, true, "NO_PROJECT_SCOPE"],
                 [{ project: "PRJ-A", to: "adopted", reason: "r" }, true, "NOT_A_DISPOSITION"],
                 [{ project: "PRJ-A", to: "deferred", reason: " " }, true, "NO_REASON"],
                 [{ project: "PRJ-A", to: "deferred", reason: "x".repeat(161) }, true, "BAD_REASON"],
                 [{ project: "PRJ-A", to: "deferred", reason: "r", decidedBy: "" }, true, "NO_DECIDER"],
                 [{ project: "PRJ-NONE", to: "deferred", reason: "r" }, true, "NO_SUCH_PROJECT"],
                 [{ project: "PRJ-H", to: "deferred", reason: "r" }, true, "NO_SUCH_PROJECT"]];
  const strip = (r, q) => JSON.stringify(r).split(q).join("<Q>");
  for (const [c, withFinding, code] of cases) {
    const one = w.q.proposeDispose(as("alice", { ...c, ...(withFinding ? { finding: "INQ-1" } : {}) }));
    const three = w.q.proposeDispose(as("alice", { ...c, ...(withFinding ? { finding: "INQ-3" } : {}) }));
    assert.deepEqual([one.ok, one.reason], [false, code], JSON.stringify(c));
    assert.equal(strip(one, "INQ-1"), strip(three, "INQ-3"), `the same answer whatever draws on it: ${code}`);
    for (const p of ["PRJ-B", "PRJ-H"].filter((p) => p !== c.project))
      assert.ok(!JSON.stringify(three).includes(p), `${code} names no other project (${p})`);
  }
  // the participant refusal, the same for a question one project draws on and one three do
  const bobA = (q) => w.q.proposeDispose(as("bob", { project: "PRJ-A", finding: q, to: "deferred", reason: "r" }));
  assert.equal(bobA("INQ-1").reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(strip(bobA("INQ-1"), "INQ-1"), strip(bobA("INQ-3"), "INQ-3"));
  assert.ok(!/PRJ-B|PRJ-H/.test(JSON.stringify(bobA("INQ-3"))));
  // and success names this project alone
  const ok = w.q.proposeDispose(as("alice", { project: "PRJ-A", finding: "INQ-3", to: "deferred", reason: "r" }));
  assert.equal(ok.ok, true);
  assert.ok(!/PRJ-B|PRJ-H/.test(JSON.stringify(ok)));
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 1, "refusals wrote nothing");
  // negative control: the comparison above sees a difference when there is one
  assert.notEqual(strip(w.q.proposeDispose(as("alice", { project: "PRJ-A", finding: "INQ-1", to: "deferred", reason: "r" })), "INQ-1"),
                  strip(w.q.proposeDispose(as("alice", { project: "PRJ-B", finding: "INQ-1", to: "deferred", reason: "r" })), "INQ-1"));
  assert.equal(QUEUE_ACT_CHECKS.NO_PROJECT_SCOPE.check, "C-33.50");
});

test("R27 (K2523): queue registers its project arm with the real investigation module: a milestone waiting on a question this project set aside reads stuck", () => {
  const w = investigationWorld();
  w.clock = "2026-11-10T18:00:00.000Z";
  const q = queueOf(w.host, { record: w.record, membership: w.membership, start: false, investigation: w.inv,
                              now: () => Date.parse(w.clock) });
  q.migrate();
  const { milestone } = w.inv.milestoneSet({ project: P1, name: "N", date: "2026-11-20", waitsOn: [Q2], by: ANN });
  const read = () => w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones.find((m) => m.milestone === milestone);
  assert.equal(read().state, "open");
  // negative control: another project's decision on the same question leaves this project's milestone open
  const other = q.proposeDispose({ project: P2, finding: Q2, to: "dismissed", reason: "not for us", decidedBy: BOB.slice(7),
                                   viewer: BOB, identity: BOB });
  assert.equal(other.ok, true, JSON.stringify(other));
  assert.equal(read().state, "open");
  // this project's own deferral, through the arm, reads stuck, naming it
  const r = q.proposeDispose({ project: P1, finding: Q2, to: "deferred", reason: "later", decidedBy: ANN.slice(7),
                               viewer: ANN, identity: ANN });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([read().state, read().stuck_on], ["stuck", [{ kind: "question", ref: Q2, why: "deferred" }]]);
  // and its dismissal, re-decided, replaces it
  q.proposeDispose({ project: P1, finding: Q2, to: "dismissed", reason: "no", decidedBy: ANN.slice(7), viewer: ANN, identity: ANN });
  assert.deepEqual(read().stuck_on, [{ kind: "question", ref: Q2, why: "dismissed" }]);
  // the registration is queue's, once: a second reader is refused by investigation
  assert.equal(w.inv.registerProjectDisposition("other", () => null).ok, false);
  void Q3;
});
