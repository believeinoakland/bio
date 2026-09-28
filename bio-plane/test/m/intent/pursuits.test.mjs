/* intent's goals (R8) and aspirations (R9–R14), and both as record documents (R26). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE } from "./fixture.mjs";

const strip = (r) => { const { detail, goal, aspiration, project, ...rest } = r; return rest; };
const manifestCount = (w, id) => w.rows(`SELECT COUNT(*) AS n FROM manifest WHERE bundle_id=?`, id)[0].n;

test("R8 declareGoal, linkObjective and closeGoal each refuse a machine; empty statement or bounds, unseen goal or aspiration, and a close without a reason are refused; nothing is written by a refusal", () => {
  const w = seeded();
  const g = w.i.declareGoal({ statement: "Recover the contract files", bounds: "the 2026 procurement cycle", author: V("bob") });
  assert.equal(g.ok, true);
  for (const who of ["", null, MACHINE]) {
    assert.equal(w.i.declareGoal({ statement: "s", bounds: "b", author: who }).reason, "MACHINE_CANNOT_DECLARE_GOAL");
    assert.equal(w.i.linkObjective({ goal: g.goal, project: w.P, author: who }).reason, "MACHINE_CANNOT_DECLARE_GOAL");
    assert.equal(w.i.closeGoal({ goal: g.goal, reason: "r", author: who }).reason, "MACHINE_CANNOT_DECLARE_GOAL");
  }
  const snap = w.snapshot();
  for (const [statement, bounds] of [["", "b"], ["s", ""], ["  ", "  "], [null, "b"]])
    assert.equal(w.i.declareGoal({ statement, bounds, author: V("bob") }).reason, "NO_STATEMENT");
  assert.equal(w.i.declareGoal({ statement: "s", bounds: "b", aspiration: "ASP-2026-0099", author: V("bob") }).reason, "NO_SUCH_ASPIRATION");
  assert.equal(w.i.linkObjective({ goal: "GOAL-2026-0099", project: w.P, author: V("bob") }).reason, "NO_SUCH_GOAL");
  assert.equal(w.i.closeGoal({ goal: "GOAL-2026-0099", reason: "r", author: V("bob") }).reason, "NO_SUCH_GOAL");
  /* a goal the author may not see answers as an absent one */
  const unseen = w.i.closeGoal({ goal: g.goal, reason: "r", author: V("bob"), viewer: "nobody" });
  assert.deepEqual(strip(unseen), strip(w.i.closeGoal({ goal: "GOAL-2026-0099", reason: "r", author: V("bob"), viewer: "nobody" })));
  assert.equal(w.i.closeGoal({ goal: g.goal, reason: "  ", author: V("bob") }).reason, "NO_REASON");
  assert.deepEqual(w.snapshot(), snap, "no refusal wrote anything");
  for (const r of [unseen, w.i.declareGoal({ statement: "", bounds: "", author: V("bob") })]) assert.ok(r.check && r.translation);
});

test("R8 linkObjective records the decomposition as the author's dated claim and needs the author joined in the project; a goal carries no progress figure; a closed goal stays readable with its objectives and reason", () => {
  const w = seeded();
  const g = w.i.declareGoal({ statement: "Recover the contract files", bounds: "this cycle", author: V("bob") }).goal;
  assert.equal(w.i.linkObjective({ goal: g, project: w.P, author: V("carol") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.i.linkObjective({ goal: g, project: w.P, author: V("dave") }).reason, "NO_SUCH_PROJECT");
  const l = w.i.linkObjective({ goal: g, project: w.P, author: V("bob") });
  assert.equal(l.ok, true);
  assert.equal(l.by, V("bob"));
  assert.equal(l.at, w.clock.now);
  assert.deepEqual(w.fm(g).objectives, [{ project: w.P, by: V("bob"), at: w.clock.now }]);
  assert.equal(w.i.linkObjective({ goal: g, project: w.P, author: V("alice") }).already, true);
  const open = w.i.readGoal({ goal: g, viewer: V("bob") }).goal;
  assert.deepEqual(Object.keys(open).sort(), ["aspiration", "at", "author", "bounds", "closed_reason", "id", "objectives", "state", "statement"]);
  assert.ok(!Object.keys(open).some((k) => /progress|share|percent|complet|count/.test(k)), "no progress figure on a goal");
  const c = w.i.closeGoal({ goal: g, reason: "The files were recovered.", author: V("bob") });
  assert.equal(c.ok, true);
  assert.equal(w.i.closeGoal({ goal: g, reason: "again", author: V("bob") }).reason, "PURSUIT_ENDED");
  assert.equal(w.i.linkObjective({ goal: g, project: w.P, author: V("bob") }).reason, "PURSUIT_ENDED");
  const closed = w.i.readGoal({ goal: g, viewer: V("dave") }).goal;
  assert.equal(closed.state, "closed");
  assert.equal(closed.closed_reason, "The files were recovered.");
  assert.equal(closed.statement, "Recover the contract files");
  assert.equal(closed.bounds, "this cycle");
  assert.deepEqual(closed.objectives, [], "dave may not see the project, so it is not listed to him");
  assert.equal(w.i.readGoal({ goal: g, viewer: V("bob") }).goal.objectives[0].project, w.P);
});

test("R9 a machine is refused; a member aspiration only by that member (NOT_YOURS); a project one by a member joined in it; a group one only by an active administrator, the founder included (GROUP_ASPIRATION_NOT_ADMIN); every aspiration is readable by every member", () => {
  const w = seeded();
  w.st.sql.exec(`INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES ('admin', 's', 'h', 1, 't')`);
  for (const who of ["", MACHINE])
    assert.equal(w.i.declareAspiration({ scope: "group", statement: "s", author: who }).reason, "MACHINE_CANNOT_DECLARE_ASPIRATION");
  assert.equal(w.i.declareAspiration({ scope: "member", owner: "carol", statement: "s", author: V("bob") }).reason, "NOT_YOURS");
  const mine = w.i.declareAspiration({ scope: "member", owner: "bob", statement: "Read every contract", author: V("bob") });
  assert.equal(mine.ok, true);
  assert.equal(w.i.declareAspiration({ scope: "project", owner: w.P, statement: "s", author: V("carol") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.i.declareAspiration({ scope: "project", owner: w.P, statement: "s", author: V("dave") }).reason, "NO_SUCH_PROJECT");
  const proj = w.i.declareAspiration({ scope: "project", owner: w.P, statement: "Name every signatory", author: V("bob") });
  assert.equal(proj.ok, true);
  assert.equal(w.i.declareAspiration({ scope: "group", statement: "s", author: V("bob") }).reason, "GROUP_ASPIRATION_NOT_ADMIN");
  w.member("eve", { role: "admin", status: "revoked" });
  assert.equal(w.i.declareAspiration({ scope: "group", statement: "s", author: V("eve") }).reason, "GROUP_ASPIRATION_NOT_ADMIN", "an inactive administrator");
  const grp = w.i.declareAspiration({ scope: "group", statement: "Open procurement", author: V("alice") });
  assert.equal(grp.ok, true);
  const founder = w.i.declareAspiration({ scope: "group", statement: "Keep the record honest", author: "admin" });
  assert.equal(founder.ok, true, "the founder is an administrator");
  assert.equal(w.fm(grp.aspiration).author, V("alice"), "the act is attributed");
  assert.equal(w.fm(grp.aspiration).created, w.clock.now, "and dated");
  for (const bad of [{ scope: "team", statement: "s" }, { scope: "project", statement: "s" }, { scope: "group", owner: "x", statement: "s" }])
    assert.equal(w.i.declareAspiration({ ...bad, author: V("alice") }).reason, "BAD_SCOPE");
  assert.equal(w.i.declareAspiration({ scope: "group", statement: "", author: V("alice") }).reason, "NO_STATEMENT");
  /* revising and retiring follow the same rule */
  assert.equal(w.i.retireAspiration({ aspiration: mine.aspiration, taught: "t", author: V("carol") }).reason, "NOT_YOURS");
  assert.equal(w.i.recordDeadEnd({ aspiration: grp.aspiration, note: "n", author: V("bob") }).reason, "GROUP_ASPIRATION_NOT_ADMIN");
  assert.equal(w.i.recordDeadEnd({ aspiration: proj.aspiration, note: "n", author: V("carol") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  /* readable by every member: dave, in no project, reads each one's pursuit record */
  for (const a of [mine, proj, grp]) assert.equal(w.i.pursuitOf({ aspiration: a.aspiration, viewer: V("dave") }).ok, true);
  assert.equal(w.i.contacts({ viewer: V("dave") }).ok, true);
});

test("R10 a project holds every held group aspiration unless it records a departure, which needs a reason and is answered as notable wherever the project's aspirations are read", () => {
  const w = seeded();
  const a1 = w.i.declareAspiration({ scope: "group", statement: "Open procurement", author: V("alice") }).aspiration;
  const a2 = w.i.declareAspiration({ scope: "group", statement: "Plain language", author: V("alice") }).aspiration;
  const mineA = w.i.declareAspiration({ scope: "member", owner: "bob", statement: "Mine", author: V("bob") }).aspiration;
  let r = w.i.aspirationsFor({ project: w.P, viewer: V("bob") });
  assert.deepEqual(r.aspirations.map((a) => a.id).sort(), [a1, a2].sort());
  assert.equal(w.i.departFrom({ project: w.P, aspiration: a1, reason: "", author: V("bob") }).reason, "NO_REASON");
  assert.equal(w.i.departFrom({ project: w.P, aspiration: a1, reason: "r", author: MACHINE }).reason, "MACHINE_CANNOT_DECLARE_ASPIRATION");
  assert.equal(w.i.departFrom({ project: w.P, aspiration: a1, reason: "r", author: V("carol") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.i.departFrom({ project: w.P, aspiration: mineA, reason: "r", author: V("bob") }).reason, "BAD_SCOPE");
  assert.equal(w.i.departFrom({ project: w.P, aspiration: "ASP-2026-0099", reason: "r", author: V("bob") }).reason, "NO_SUCH_ASPIRATION");
  const d = w.i.departFrom({ project: w.P, aspiration: a1, reason: "This project studies a sealed process.", author: V("bob") });
  assert.equal(d.ok, true);
  assert.equal(d.notable, true);
  r = w.i.aspirationsFor({ project: w.P, viewer: V("bob") });
  assert.deepEqual(r.aspirations.map((a) => a.id), [a2]);
  assert.deepEqual(r.departures, [{ aspiration: a1, reason: "This project studies a sealed process.", author: V("bob"), at: w.clock.now, notable: true }]);
  /* another project still holds it */
  const Q = w.project("Second", "bob");
  assert.ok(w.i.aspirationsFor({ project: Q, viewer: V("bob") }).aspirations.some((a) => a.id === a1));
});

test("R11 retireAspiration requires what it taught (NO_LESSON); a retired aspiration and its pursuit record stay readable; recordDeadEnd appends a dated, authored entry that is never removed", () => {
  const w = seeded();
  const a = w.i.declareAspiration({ scope: "project", owner: w.P, statement: "Name every signatory", author: V("bob") }).aspiration;
  assert.equal(w.i.recordDeadEnd({ aspiration: a, note: "", author: V("bob") }).reason, "NO_NOTE");
  assert.equal(w.i.recordDeadEnd({ aspiration: a, note: "The register was sealed.", author: V("bob") }).ok, true);
  w.clock.now = "2026-09-29T00:00:00Z";
  assert.equal(w.i.recordDeadEnd({ aspiration: a, note: "## Not a heading\nThe clerk had no copy.", author: V("alice") }).ok, true);
  assert.equal(w.i.retireAspiration({ aspiration: a, taught: "", author: V("bob") }).reason, "NO_LESSON");
  const r = w.i.retireAspiration({ aspiration: a, taught: "Signatories are in the minutes, not the register.", author: V("bob") });
  assert.equal(r.ok, true);
  assert.equal(w.i.retireAspiration({ aspiration: a, taught: "again", author: V("bob") }).reason, "PURSUIT_ENDED");
  /* a dead end after retirement is still recorded; nothing earlier is removed */
  assert.equal(w.i.recordDeadEnd({ aspiration: a, note: "Late note.", author: V("bob") }).ok, true);
  const p = w.i.pursuitOf({ aspiration: a, viewer: V("dave") });
  assert.equal(p.aspiration.state, "retired");
  assert.equal(p.taught, "Signatories are in the minutes, not the register.");
  assert.deepEqual(p.dead_ends.map((d) => [d.at, d.author]), [["2026-09-28T01:00:00Z", V("bob")], ["2026-09-29T00:00:00Z", V("alice")],
                                                              ["2026-09-29T00:00:00Z", V("bob")]]);
  assert.equal(p.dead_ends[0].note, "The register was sealed.");
  assert.match(p.dead_ends[1].note, /The clerk had no copy/);
  assert.equal(manifestCount(w, a), 5, "each act is a revision; every earlier one is kept in history");
});

test("R12 aspirationsFor answers those in force — the group's less departures (each listed with its reason), the project's, the member's — each with its scope, no precedence stated and nothing resolved between them", () => {
  const w = seeded();
  const g1 = w.i.declareAspiration({ scope: "group", statement: "Publish quickly", author: V("alice") }).aspiration;
  const g2 = w.i.declareAspiration({ scope: "group", statement: "Publish only when certain", author: V("alice") }).aspiration;
  const pr = w.i.declareAspiration({ scope: "project", owner: w.P, statement: "Follow the money", author: V("bob") }).aspiration;
  const mb = w.i.declareAspiration({ scope: "member", owner: "bob", statement: "Learn the codes", author: V("bob") }).aspiration;
  const other = w.i.declareAspiration({ scope: "member", owner: "carol", statement: "Carol's", author: V("carol") }).aspiration;
  const retired = w.i.declareAspiration({ scope: "group", statement: "Old", author: V("alice") }).aspiration;
  w.i.retireAspiration({ aspiration: retired, taught: "done", author: V("alice") });
  w.i.departFrom({ project: w.P, aspiration: g1, reason: "We publish on a fixed date.", author: V("bob") });
  const r = w.i.aspirationsFor({ project: w.P, member: "bob", viewer: V("bob") });
  assert.deepEqual(r.aspirations.map((a) => [a.id, a.scope]), [[g2, "group"], [pr, "project"], [mb, "member"]]);
  assert.deepEqual(r.departures.map((d) => [d.aspiration, d.reason]), [[g1, "We publish on a fixed date."]]);
  assert.equal(r.precedence, null);
  assert.ok(!r.aspirations.some((a) => "rank" in a || "priority" in a || "precedence" in a));
  assert.ok(!r.aspirations.some((a) => a.id === other || a.id === retired));
  const group = w.i.aspirationsFor({ viewer: V("dave") });
  assert.deepEqual(group.aspirations.map((a) => a.id), [g1, g2], "two that pull apart are both held; nothing is resolved");
  assert.equal(w.i.aspirationsFor({ project: w.P, viewer: V("dave") }).reason, "NO_SUCH_PROJECT");
});

test("R13 contacts lists each pair of held aspirations naming a common entity or progression, with what they share, and never says two contradict", () => {
  const w = seeded();
  w.entity("ENT-1"); w.entity("ENT-2");
  w.define("proc"); w.define("meet");
  const a = w.i.declareAspiration({ scope: "group", statement: "A", entities: ["ENT-1"], progressions: ["proc"], author: V("alice") }).aspiration;
  const b = w.i.declareAspiration({ scope: "project", owner: w.P, statement: "B", entities: ["ENT-1", "ENT-2"], author: V("bob") }).aspiration;
  const c = w.i.declareAspiration({ scope: "member", owner: "bob", statement: "C", progressions: ["proc", "meet"], author: V("bob") }).aspiration;
  w.i.declareAspiration({ scope: "member", owner: "carol", statement: "D", entities: ["ENT-2"], author: V("carol") });
  assert.equal(w.i.declareAspiration({ scope: "group", statement: "E", entities: ["ENT-9"], author: V("alice") }).reason, "NO_SUCH_ENTITY");
  assert.equal(w.i.declareAspiration({ scope: "group", statement: "E", progressions: ["nope"], author: V("alice") }).reason, "NO_SUCH_PROGRESSION");
  const r = w.i.contacts({ viewer: V("dave") });
  const pairs = r.contacts.map((x) => [x.a, x.b, x.shared]);
  assert.deepEqual(pairs.find((p) => p[0] === a && p[1] === b)[2], { entities: ["ENT-1"], progressions: [] });
  assert.deepEqual(pairs.find((p) => p[0] === a && p[1] === c)[2], { entities: [], progressions: ["proc"] });
  assert.equal(r.contacts.length, 3, "a–b, a–c, b–d (ENT-2)");
  const text = JSON.stringify(r);
  assert.ok(!/contradict|conflict|oppos/i.test(text.replace(/does not say whether they agree/g, "")), "never says they contradict");
});

test("R14 pursuitOf answers the goals and objectives opened under the aspiration, the proposals triaged under them with each act and reason, the capture requests named in them with their outcome, and the dead ends; no completion figure", async () => {
  const w = seeded();
  w.entity("ENT-1");
  w.define();
  await w.thread("ENT-1", { need: "A" });     // award and contract missing: a progression proposal
  const a = w.i.declareAspiration({ scope: "group", statement: "Open procurement", author: V("alice") }).aspiration;
  const g = w.i.declareGoal({ statement: "The award files", bounds: "this cycle", aspiration: a, author: V("bob") }).goal;
  w.i.declareGoal({ statement: "Unrelated", bounds: "b", author: V("bob") });
  w.i.linkObjective({ goal: g, project: w.P, author: V("bob") });
  w.i.registerSource("monitoring", () => [{ key: "fetch-1", kind: "capture-failed", grade: null,
    basis: { capture_requests: ["CREQ-1", "CREQ-2"] }, instances: [{ url: "https://example.org/a" }] }]);
  w.outcomes.set("CREQ-1", { state: "captured" });
  const open = w.i.proposals({ project: w.P, viewer: V("bob") }).proposals;
  const prog = open.find((p) => p.source === "progressions");
  const mon = open.find((p) => p.source === "monitoring");
  assert.equal(w.i.triage({ proposal: prog.key, act: "defer", project: w.P, reason: "After the audit.", author: V("bob"), viewer: V("bob") }).ok, true);
  assert.equal(w.i.triage({ proposal: mon.key, act: "dismiss", project: w.P, reason: "Known outage.", author: V("bob"), viewer: V("bob") }).ok, true);
  w.i.recordDeadEnd({ aspiration: a, note: "No index exists.", author: V("alice") });
  const p = w.i.pursuitOf({ aspiration: a, viewer: V("bob") });
  assert.deepEqual(p.goals.map((x) => x.id), [g]);
  assert.deepEqual(p.goals[0].objectives.map((o) => o.project), [w.P]);
  assert.deepEqual(p.triaged.map((t) => [t.proposal, t.act, t.reason]), [[prog.key, "defer", "After the audit."], [mon.key, "dismiss", "Known outage."]]);
  assert.deepEqual(p.capture_requests, [{ request: "CREQ-1", outcome: { state: "captured" } }, { request: "CREQ-2", outcome: null }]);
  assert.deepEqual(p.dead_ends.map((d) => d.note), ["No index exists."]);
  assert.ok(!/progress|percent|complet|share/i.test(Object.keys(p).join(" ")), "no completion figure");
  assert.equal(w.i.pursuitOf({ aspiration: "ASP-2026-0099", viewer: V("bob") }).reason, "NO_SUCH_ASPIRATION");
});

test("R26 aspirations and goals are record documents of two new types with history, the gate and authored revisions: held → retired and open → closed, no other move accepted, and the pursuit record survives abandonment", () => {
  const w = seeded();
  const a = w.i.declareAspiration({ scope: "group", statement: "Open procurement", author: V("alice") }).aspiration;
  const g = w.i.declareGoal({ statement: "The files", bounds: "this cycle", aspiration: a, author: V("bob") }).goal;
  assert.match(a, /^ASP-2026-\d{4}$/);
  assert.match(g, /^GOAL-2026-\d{4}$/);
  assert.equal(w.record.head(a).type, "aspiration");
  assert.equal(w.record.head(g).type, "goal");
  assert.equal(w.record.head(a).currentState, "held");
  assert.equal(w.record.head(g).currentState, "open");
  /* no other move: straight to a state the machine does not name, backwards, or created at the end */
  const move = (id, from, to, author) => w.revise(id, w.text(id).replace(`current_state: ${from}`, `current_state: ${to}`), author);
  assert.equal(move(a, "held", "open", V("alice")).reason, "PURSUIT_STATE_MOVE_UNDECLARED");
  assert.equal(move(g, "open", "held", V("bob")).reason, "PURSUIT_STATE_MOVE_UNDECLARED");
  assert.equal(move(a, "held", "retired", V("alice")).reason, "NO_LESSON", "retiring through the gate needs its lesson too");
  assert.equal(move(g, "open", "closed", V("bob")).reason, "NO_REASON");
  const born = w.text(g).replace(g, "GOAL-2026-0777").replace("current_state: open", "current_state: closed");
  assert.equal(w.create("GOAL-2026-0777", born, V("bob")).reason, "PURSUIT_STATE_MOVE_UNDECLARED");
  /* a machine writes neither type, even through the raw promotion */
  assert.equal(move(g, "open", "open", MACHINE).reason, "MACHINE_CANNOT_DECLARE_GOAL");
  assert.equal(w.create("ASP-2026-0777", w.text(a).replace(a, "ASP-2026-0777"), MACHINE).reason, "MACHINE_CANNOT_DECLARE_ASPIRATION");
  /* an authored revision is kept beside every earlier one */
  assert.equal(w.i.closeGoal({ goal: g, reason: "Abandoned: the office closed.", author: V("bob") }).ok, true);
  assert.equal(w.i.retireAspiration({ aspiration: a, taught: "It needs a law, not a request.", author: V("alice") }).ok, true);
  assert.equal(move(a, "retired", "held", V("alice")).reason, "PURSUIT_STATE_MOVE_UNDECLARED");
  assert.equal(move(g, "closed", "open", V("bob")).reason, "PURSUIT_STATE_MOVE_UNDECLARED");
  assert.equal(manifestCount(w, g), 2);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM history WHERE bundle_id=?`, g)[0].n, 1);
  assert.deepEqual(w.fm(g).state_history.map((h) => [h.from_state, h.to_state, h.author]), [["open", "closed", V("bob")]]);
  assert.deepEqual(w.fm(a).state_history.map((h) => [h.from_state, h.to_state, h.author]), [["held", "retired", V("alice")]]);
  const p = w.i.pursuitOf({ aspiration: a, viewer: V("dave") });
  assert.equal(p.goals[0].state, "closed");
  assert.equal(p.goals[0].closed_reason, "Abandoned: the office closed.");
  /* a goal is not opened under a retired aspiration */
  assert.equal(w.i.declareGoal({ statement: "s", bounds: "b", aspiration: a, author: V("bob") }).reason, "PURSUIT_ENDED");
});
