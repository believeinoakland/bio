/* question-explorer: choosing what is worth exploring and opening the run (R1, R2, R3's run path and sign-in, R9's
   choice, R12's estimate). Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, Q, Q2, Q3, PROJ, ENT, PERSON, CAP, DOC } from "./fixture.mjs";
import { EXPLORE_QUESTIONS_PER_TICK, EXPLORE_BOUNDS } from "../../../src/question-explorer/index.mjs";

test("R1: exploreDue, exploreWake and exploreTick for the scheduler; exploreAllowed decides each owner and question; null opens one run, at most one a question a day", () => {
  const w = world().standard();
  w.explore.group = "yes";
  assert.equal(w.p.exploreDue(w.clock.now), 1);
  assert.equal(w.p.exploreWake(w.clock.now), w.clock.now, "due now, answered in now's own form");
  assert.equal(w.p.exploreWake(Date.parse(w.clock.now)), Date.parse(w.clock.now));
  const t = w.p.exploreTick(w.clock.now);
  assert.equal(t.opened.length, 1);
  assert.deepEqual(w.calledAs("exploreAllowed").map((a) => [a.owner, a.question]), [["group", Q]]);
  /* Negative control: the same day, nothing more is due, and a second tick opens nothing. */
  assert.equal(w.p.exploreDue(w.clock.now), 0);
  assert.equal(w.p.exploreWake(w.clock.now), null);
  assert.equal(w.p.exploreTick(w.clock.now).opened.length, 0);
  assert.equal(w.calledAs("open").length, 1);
});

test("R1: a refusal from exploreAllowed opens nothing and the next owner is asked; {ask: true} records exploreAsk with the questions and their estimate, and nothing runs that day without approval", () => {
  const w = world().standard();
  w.question(Q2, { recipients: ["alice"] });
  w.drawing[Q] = [PROJ];
  w.project(PROJ, ["alice"], { owners: ["alice"] });
  w.explore.group = "no";
  w.explore[`project:${PROJ}`] = "ask";
  const t = w.p.exploreTick(w.clock.now);
  assert.equal(t.opened.length, 0, "nothing runs without approval");
  assert.equal(w.calledAs("open").length, 0);
  const asks = w.calledAs("exploreAsk");
  assert.equal(asks.length, 1, "one Ask per owner per tick");
  assert.equal(asks[0].owner, `project:${PROJ}`);
  assert.deepEqual(asks[0].what.questions, [Q]);
  assert.deepEqual(asks[0].what.estimate, { low: 0.1, high: 0.3, unit: "usd" });
  /* The Ask waits an hour before it is looked at again (Q2, refused by every owner, not again that day); then,
     approved, the run opens that day. */
  assert.equal(w.p.exploreDue(w.clock.now), 0);
  assert.equal(w.p.exploreWake(w.clock.now), "2026-10-10T10:00:00Z");
  w.approved.add(`project:${PROJ}`);
  w.clock.now = "2026-10-10T10:00:00Z";
  const t2 = w.p.exploreTick(w.clock.now);
  assert.deepEqual(t2.opened.map((o) => [o.question, o.owner]), [[Q, `project:${PROJ}`]]);
});

test("R2: worth exploring: open or surfaced, at least one member receives its finds, and never explored or a capture resolving to its subject entity gained since its last run; bounded at 200 a tick", () => {
  const w = world().standard();
  w.entity(ENT, "body");
  w.question(Q2, { subject: ENT, recipients: ["bob"] });
  w.question(Q3, { recipients: [] });
  w.bundle("INQ-2026-0004-t", "inquiry", null, { state: "concluded" });
  const ids = () => w.p.questionsWorthExploring({ at: w.clock.now }).map((x) => x.question);
  assert.deepEqual(ids().sort(), [Q, Q2].sort(), "Q3 has no recipient; a concluded question is not open or surfaced");
  w.bundle(Q3, "inquiry", null, { state: "surfaced" });
  w.recipients[Q3] = ["carol"];
  assert.ok(ids().includes(Q3), "surfaced counts");
  w.explore.group = "yes";
  w.p.exploreTick(w.clock.now);
  w.clock.now = "2026-10-11T09:00:00Z";
  /* Negative control: explored, with no new capture of its subject, Q2 is not worth exploring again. */
  assert.deepEqual(ids(), []);
  w.resolve(CAP, DOC, ENT);
  assert.deepEqual(ids(), [Q2], "a capture resolving to Q2's subject entity since its last run");
  assert.equal(EXPLORE_QUESTIONS_PER_TICK, 200);
  for (let i = 10; i < 230; i++) w.question(`INQ-2026-${String(i).padStart(4, "0")}-x`, { recipients: ["alice"] });
  assert.ok(w.p.questionsWorthExploring({ at: w.clock.now }).length <= 200, "at most 200 read a tick");
});

test("R2: R9 holds before it: a question about a person no member tied is never chosen; one a member raised about that person is", () => {
  const w = world().standard();
  w.entity(PERSON, "person");
  w.question(Q2, { subject: PERSON, surfacedBy: "agent", recipients: ["alice"] });
  w.question(Q3, { subject: PERSON, surfacedBy: "human", recipients: ["alice"] });
  const ids = w.p.questionsWorthExploring({ at: w.clock.now }).map((x) => x.question);
  assert.ok(!ids.includes(Q2), "machine-surfaced, about a person no member tied");
  assert.ok(ids.includes(Q3), "negative control: a member raised it about that person");
});

test("R3: the run opens through ai-runs in the investigate run path, origin explore, use explore, the paying owner its principal and ai-use R6's label, as a system step on the question", () => {
  const w = world().standard();
  const o = w.openRun("group");
  const [made] = w.calledAs("stepCreate");
  assert.deepEqual(made.place, { questions: [Q] });
  assert.equal(made.by, "class:ai", "a system step, a machine doer");
  assert.equal(made.run, o.run, "for the run it is about to open");
  assert.equal(made.enabled_by, "group");
  const [open] = w.calledAs("open");
  assert.deepEqual([open.mode, open.origin, open.use, open.step, open.principalClaude, open.contextType, open.contextId],
                   ["investigate", "explore", "explore", o.step, "group", "inquiry", Q]);
  assert.deepEqual(open.enabledBy, { kind: "machine", enabled_by: "group" });
  assert.deepEqual(open.bounds.map((b) => b.bound), EXPLORE_BOUNDS.map((b) => b.bound));
  assert.ok(open.bounds.some((b) => b.bound === "pages"), "R13's pages bound declared");
  /* Negative control: a refused open leaves no run and deletes its untouched step. */
  const w2 = world().standard();
  w2.openRefuse = { ok: false, code: "AI_RUN_MODE_NOT_DEPLOYED" };
  w2.explore.group = "yes";
  const t = w2.p.exploreTick(w2.clock.now);
  assert.equal(t.opened.length, 0);
  assert.equal(w2.count("explore_runs"), 0);
  assert.deepEqual(w2.calledAs("stepDelete").map((a) => a.step), ["STP-2026-00001"]);
});

test("R3: a principal served by a sign-in explores only while that sign-in account's explore use is on; off (its default) it is refused as any account whose explore use is off (credentials R55, the real module)", () => {
  const w = world().standard();
  w.recipients[Q] = ["alice"];
  w.explore["member:alice"] = "yes";
  assert.equal(w.credentials.subscriptionConnected({ member: "alice" }).ok, true);
  /* Off: the sign-in's switch at its default, no. */
  const off = w.p.exploreTick(w.clock.now);
  assert.equal(off.opened.length, 0);
  assert.equal(w.calledAs("open").length, 0);
  assert.equal(w.calledAs("exploreAllowed").filter((a) => a.owner === "member:alice").length, 0, "refused before ai-use is asked");
  /* On: set by the member's own act. */
  w.clock.now = "2026-10-11T09:00:00Z";
  assert.equal(w.credentials.accountUsesSet({ owner: "member:alice", switch: "explore", on: "yes", by: "member:alice" }).ok, true);
  const on = w.p.exploreTick(w.clock.now);
  assert.deepEqual(on.opened.map((o) => o.owner), ["member:alice"]);
  assert.equal(w.calledAs("open")[0].principalClaude, "member:alice");
});

test("R12: each Ask item and each run carries ai-use R10's estimate before", () => {
  const w = world().standard();
  const o = w.openRun("group");
  assert.deepEqual(o.estimate, { low: 0.1, high: 0.3, unit: "usd" });
  assert.deepEqual(w.calledAs("estimate")[0], { owner: "group", use: "explore", mode: "investigate", at: w.clock.now });
  assert.deepEqual(w.p.runCost({ run: o.run, viewer: "member:dana" }).estimate, { low: 0.1, high: 0.3, unit: "usd" });
});
