/* investigation R1–R5: milestones, their state derived on read, the one notice each overdue one gives, never shared,
   and never a finding. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, CAT, DAN, OUT, AI, P1, P2, PH, Q1, Q2, Q3, QH } from "./fixture.mjs";

test("R1: milestoneSet, by a joined participant, waits on the project's questions and its steps; each refusal writes nothing", () => {
  const w = world();
  const s = w.step();
  const before = w.snapshot();
  const set = (args) => w.inv.milestoneSet({ project: P1, name: "Contract in hand", date: "2026-11-14", waitsOn: [Q1, s], by: ANN, ...args });
  assert.equal(set({ name: "" }).code, "MILESTONE_NO_NAME");
  assert.equal(set({ name: "x".repeat(201) }).code, "MILESTONE_NO_NAME");
  assert.equal(set({ date: "14 November" }).code, "MILESTONE_BAD_DATE");
  assert.equal(set({ date: "2026-02-30" }).code, "MILESTONE_BAD_DATE");
  assert.equal(set({ waitsOn: [] }).code, "MILESTONE_WAITS_ON_NOTHING");
  assert.equal(set({ waitsOn: null }).code, "MILESTONE_WAITS_ON_NOTHING");
  /* an item not of this project is answered as absent: a question P1 does not draw on, a hidden one, a step elsewhere */
  assert.equal(set({ waitsOn: [Q3] }).code, "MILESTONE_ITEM_UNKNOWN");
  assert.equal(set({ waitsOn: [QH] }).code, "MILESTONE_ITEM_UNKNOWN");
  const elsewhere = w.step({ place: { questions: [Q3] }, by: BOB });
  assert.equal(set({ waitsOn: [elsewhere] }).code, "MILESTONE_ITEM_UNKNOWN");
  assert.equal(set({ waitsOn: ["STP-2026-aaaaaaaaaaaaaaaa"] }).code, "MILESTONE_ITEM_UNKNOWN");
  /* who: a joined participant; an invited one is not; a stranger to a discoverable project sees it at EXISTENCE; a hidden
     one is absent; a machine is refused */
  assert.equal(set({ by: OUT }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(set({ by: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.inv.milestoneSet({ project: PH, name: "n", date: "2026-11-14", waitsOn: [QH], by: DAN }).code, "NO_SUCH_PROJECT");
  assert.equal(set({ by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(set({ by: null }).code, "NO_SUCH_PROJECT");
  assert.equal(w.snapshot(), before, "no refusal wrote anything");
  const ok = set({ by: BOB });
  assert.equal(ok.ok, true);
  const m = w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones[0];
  assert.deepEqual(m.items.map((i) => [i.kind, i.ref]), [["question", Q1], ["step", s]]);
  assert.equal(m.by, "bob-h");
  assert.deepEqual(m.history.map((h) => h.act), ["set"]);
});

test("R1: milestoneRevise, milestoneRemove and milestoneItemRemove, each with history and a reason where one is owed", () => {
  const w = world();
  const s = w.step();
  const { milestone } = w.inv.milestoneSet({ project: P1, name: "A", date: "2026-11-14", waitsOn: [Q1], by: ANN });
  assert.equal(w.inv.milestoneRevise({ milestone, name: "", by: ANN }).code, "MILESTONE_NO_NAME");
  assert.equal(w.inv.milestoneRevise({ milestone, waitsOn: [Q3], by: ANN }).code, "MILESTONE_ITEM_UNKNOWN");
  assert.equal(w.inv.milestoneRevise({ milestone: 99, name: "B", by: ANN }).code, "NO_SUCH_MILESTONE");
  assert.equal(w.inv.milestoneRevise({ milestone, name: "B", by: DAN }).code, "NO_SUCH_MILESTONE", "not seen: as absent");
  assert.equal(w.inv.milestoneRevise({ milestone, name: "B", by: OUT }).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.inv.milestoneRevise({ milestone, name: "B", date: "2026-12-01", waitsOn: [s], by: BOB }).ok, true);
  let m = w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones[0];
  assert.deepEqual([m.name, m.date, m.items.length], ["B", "2026-12-01", 2]);
  assert.deepEqual(m.history[1].detail, { name: { from: "A", to: "B" }, date: { from: "2026-11-14", to: "2026-12-01" }, added: [{ kind: "step", ref: s }] });
  assert.equal(w.inv.milestoneItemRemove({ milestone, item: Q1, reason: "", by: ANN }).code, "INVESTIGATION_NO_REASON");
  assert.equal(w.inv.milestoneItemRemove({ milestone, item: Q2, reason: "r", by: ANN }).code, "MILESTONE_ITEM_UNKNOWN");
  assert.equal(w.inv.milestoneItemRemove({ milestone, item: Q1, reason: "We set this question aside.", by: ANN }).ok, true);
  m = w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones[0];
  assert.deepEqual(m.items.find((i) => i.ref === Q1).removed, { by: "ann-h", at: m.items.find((i) => i.ref === Q1).removed.at, reason: "We set this question aside." });
  assert.equal(w.inv.milestoneRemove({ milestone, reason: "", by: ANN }).code, "INVESTIGATION_NO_REASON");
  assert.equal(w.inv.milestoneRemove({ milestone, reason: "The meeting moved.", by: ANN }).ok, true);
  assert.deepEqual(w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones, []);
  assert.deepEqual(w.rows(`SELECT act FROM inv_milestone_history WHERE milestone_id = ? ORDER BY seq`, milestone).map((r) => r.act),
    ["set", "revise", "item_remove", "remove"], "the history stays");
  assert.equal(w.inv.milestoneRevise({ milestone, name: "C", by: ANN }).code, "NO_SUCH_MILESTONE", "a removed one is gone");
});

test("R2: met only when each item is done (this project's conclusion; a step ended); deferred, dismissed or set aside reads stuck, naming it; nearing and overdue only display", () => {
  const w = world();
  w.clock = "2026-11-10T18:00:00.000Z";
  const s = w.step(), t = w.step({ work: "Read the minutes" });
  const { milestone } = w.inv.milestoneSet({ project: P1, name: "M", date: "2026-11-14", waitsOn: [Q1, s], by: ANN });
  const read = () => w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones.find((m) => m.milestone === milestone);
  let m = read();
  assert.deepEqual([m.state, m.nearing, m.overdue], ["open", true, false]);
  /* another project's conclusion does not count */
  w.drawn.set(P2, [{ inquiry: Q1, stance: "concluded" }]);
  w.end(s);
  assert.equal(read().state, "open");
  assert.deepEqual(read().items.map((i) => i.state), ["open", "done"]);
  /* this project's conclusion does */
  w.drawn.set(P1, [{ inquiry: Q1, stance: "concluded" }, { inquiry: Q2 }]);
  m = read();
  assert.deepEqual([m.state, m.nearing, m.overdue], ["met", false, false]);
  /* a step set aside is not done: stuck, naming it, never met */
  w.inv.milestoneRevise({ milestone, waitsOn: [t], by: ANN });
  w.end(t, "set_aside");
  m = read();
  assert.equal(m.state, "stuck");
  assert.deepEqual(m.stuck_on, [{ kind: "step", ref: t, why: "set_aside" }]);
  /* a member takes it off, recorded; met again */
  w.inv.milestoneItemRemove({ milestone, item: t, reason: "Not needed after all.", by: ANN });
  assert.equal(read().state, "met");
  /* a question this project deferred: its own state, and a registered project disposition */
  const { milestone: m2 } = w.inv.milestoneSet({ project: P1, name: "N", date: "2026-11-01", waitsOn: [Q2], by: ANN });
  const n = () => w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones.find((x) => x.milestone === m2);
  assert.deepEqual([n().state, n().overdue, n().nearing], ["open", true, false], "past its date and not met");
  w.inv.registerProjectDisposition("queue", ({ project, question }) => (project === P1 && question === Q2 ? "dismissed" : null));
  assert.deepEqual([n().state, n().stuck_on], ["stuck", [{ kind: "question", ref: Q2, why: "dismissed" }]]);
  const w2 = world();
  const { milestone: m3 } = w2.inv.milestoneSet({ project: P1, name: "D", date: "2026-11-01", waitsOn: [Q2], by: ANN });
  w2.state(Q2, "deferred");
  assert.deepEqual(w2.inv.milestonesOf({ project: P1, viewer: ANN }).milestones.find((x) => x.milestone === m3).stuck_on, [{ kind: "question", ref: Q2, why: "deferred" }]);
  /* no time zone: nearing and overdue are undetermined, the state stands */
  const w3 = world({ zone: false });
  w3.inv.milestoneSet({ project: P1, name: "Z", date: "2026-11-01", waitsOn: [Q2], by: ANN });
  const z = w3.inv.milestonesOf({ project: P1, viewer: ANN }).milestones[0];
  assert.deepEqual([z.state, z.nearing, z.overdue], ["open", null, null]);
});

test("R3: milestonesOverdue answers each overdue milestone once to each joined participant, keyed per milestone and date; a reminder she asked for, to her alone on that day; nothing else", () => {
  const w = world();
  const { milestone } = w.inv.milestoneSet({ project: P1, name: "M", date: "2026-11-01", waitsOn: [Q1], by: ANN });
  w.inv.milestoneSet({ project: P1, name: "Later", date: "2026-12-01", waitsOn: [Q1], by: ANN });
  const at = "2026-11-05T18:00:00Z";
  const ann = w.inv.milestonesOverdue({ viewer: ANN, at }).due;
  const bob = w.inv.milestonesOverdue({ viewer: BOB, at }).due;
  assert.deepEqual(ann.map((d) => [d.kind, d.milestone]), [["overdue", milestone]]);
  assert.equal(ann[0].key, bob[0].key, "one key per milestone and date");
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: OUT, at }).due, [], "an invited participant is not told");
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: DAN, at }).due, [], "nor anyone outside");
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: AI, at }).due, []);
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: ANN, at: "2026-10-30T18:00:00Z" }).due, [], "not before its date");
  /* re-dated: a new key, told once more */
  w.inv.milestoneRevise({ milestone, date: "2026-11-02", by: ANN });
  assert.notEqual(w.inv.milestonesOverdue({ viewer: ANN, at }).due[0].key, ann[0].key);
  /* met: not overdue */
  w.drawn.set(P1, [{ inquiry: Q1, stance: "concluded" }, { inquiry: Q2 }]);
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: ANN, at }).due, []);
  /* a reminder: hers alone, on that day only */
  const late = w.rows(`SELECT milestone_id FROM inv_milestones WHERE name = 'Later'`)[0].milestone_id;
  assert.equal(w.inv.milestoneReminder({ milestone: late, at: "soon", by: BOB }).code, "MILESTONE_BAD_DATE");
  assert.equal(w.inv.milestoneReminder({ milestone: late, at: "2026-11-20", by: AI }).code, "INVESTIGATION_MEMBER_ONLY");
  assert.equal(w.inv.milestoneReminder({ milestone: late, at: "2026-11-20", by: BOB }).ok, true);
  const day = "2026-11-20T18:00:00Z";
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: BOB, at: day }).due.map((d) => d.kind), ["reminder"]);
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: ANN, at: day }).due, []);
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: BOB, at: "2026-11-21T18:00:00Z" }).due, [], "on that day only");
  /* no time zone: nothing is told, and the answer says why */
  const w2 = world({ zone: false });
  w2.inv.milestoneSet({ project: P1, name: "M", date: "2026-11-01", waitsOn: [Q1], by: ANN });
  assert.equal(w2.inv.milestonesOverdue({ viewer: ANN, at }).undetermined, true);
});

test("R4: milestones are never shared: another project drawing on the same question sets its own; no answer about one reaches outside its project", () => {
  const w = world();
  w.drawn.set(P2, [{ inquiry: Q1 }, { inquiry: Q3 }]);
  w.inv.milestoneSet({ project: P1, name: "Ours", date: "2026-11-01", waitsOn: [Q1], by: ANN });
  assert.deepEqual(w.inv.milestonesOf({ project: P2, viewer: BOB }).milestones, [], "P2 draws on Q1 and sees none of P1's");
  assert.equal(w.inv.milestoneSet({ project: P2, name: "Theirs", date: "2026-12-01", waitsOn: [Q1], by: BOB }).ok, true);
  assert.deepEqual(w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones.map((m) => m.name), ["Ours"]);
  assert.equal(w.inv.milestonesOf({ project: P1, viewer: DAN }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.inv.milestonesOf({ project: PH, viewer: DAN }).code, "NO_SUCH_PROJECT");
  assert.equal(w.inv.milestonesOf({ project: PH, viewer: CAT }).ok, true, "the negative control: its own participant reads it");
  /* the overdue notice for P2's member names only P2's milestone */
  const due = w.inv.milestonesOverdue({ viewer: BOB, at: "2026-12-05T18:00:00Z" }).due;
  assert.deepEqual(due.map((d) => [d.project, d.name]).sort(), [[P1, "Ours"], [P2, "Theirs"]], "Bob is in both projects");
  assert.deepEqual(w.inv.milestonesOverdue({ viewer: DAN, at: "2026-12-05T18:00:00Z" }).due, []);
});

test("R5: a milestone is the group's own date: never a duty, standard, clock or finding; nothing registers it as one", () => {
  const w = world();
  const { milestone } = w.inv.milestoneSet({ project: P1, name: "Before the board meeting", date: "2026-11-14", waitsOn: [Q1], by: ANN });
  const m = w.inv.milestonesOf({ project: P1, viewer: ANN }).milestones[0];
  const words = JSON.stringify(m);
  for (const k of ["duty", "standard", "clock", "finding", "breach", "deadline_basis", "law"]) assert.equal(words.includes(`"${k}`), false, k);
  /* it is held in this module's own tables only: no bundle, no leg, no observation, no promotion was written */
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM bundles`)[0].n, 7, "the fixture's seven bundles, no more");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM observation_log`)[0].n, 0);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM inquiry_basis`)[0].n, 0);
  /* the negative control: it is held, here */
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM inv_milestones WHERE milestone_id = ?`, milestone)[0].n, 1);
});
