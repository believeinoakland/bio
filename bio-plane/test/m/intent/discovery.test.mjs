/* intent's discovery loop: R15 (sources and the open proposals), R16 (triage), R17 (ageing what an assistant
   surfaced), R20 (an assistant proposes and adopts at no point). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, DAY } from "./fixture.mjs";

/* Two entities missing the same required stage of `proc`: one progression proposal carrying both instances. */
async function withProposals() {
  const w = seeded();
  w.entity("ENT-1"); w.entity("ENT-2");
  w.define();
  await w.thread("ENT-1", { need: "A" });
  await w.thread("ENT-2", { need: "B" });
  return w;
}

test("R15 a later module registers a proposal source once (SOURCE_DECLARED, SOURCE_MALFORMED); proposals answers every open proposal from every source with its grade and basis, progressions' feed read directly, one check across many subjects one proposal carrying its instances", async () => {
  const w = await withProposals();
  assert.equal(w.i.registerSource("monitoring", "not a function").reason, "SOURCE_MALFORMED");
  assert.equal(w.i.registerSource("", () => []).reason, "SOURCE_MALFORMED");
  assert.equal(w.i.registerSource("progressions", () => []).reason, "SOURCE_MALFORMED", "progressions is read directly");
  const seen = [];
  assert.equal(w.i.registerSource("monitoring", (a) => { seen.push(a); return [
    { key: "c-1", kind: "capture-failed", grade: "C", basis: { check: "C-28.17" }, instances: [{ url: "a" }, { url: "b" }] },
    { nokey: true }] ; }).ok, true);
  const again = w.i.registerSource("monitoring", () => []);
  assert.equal(again.reason, "SOURCE_DECLARED");
  assert.ok(again.check && again.translation);
  w.i.registerSource("scheduler", () => { throw new Error("down"); });
  const r = w.i.proposals({ viewer: V("bob") });
  assert.equal(r.ok, true);
  const prog = r.proposals.filter((p) => p.source === "progressions");
  assert.deepEqual(prog.map((p) => p.key).sort(), ["progressions::proc::award", "progressions::proc::contract"]);
  const award = prog.find((p) => p.key === "progressions::proc::award");
  assert.deepEqual(award.instances.map((i) => i.entity_id).sort(), ["ENT-1", "ENT-2"], "one proposal carries both instances");
  assert.equal(award.grade, null, "undetermined grades are not invented");
  assert.equal(award.basis.stage_key, "award");
  assert.equal(award.basis.definition_version, 1);
  const mon = r.proposals.find((p) => p.source === "monitoring");
  assert.deepEqual([mon.key, mon.kind, mon.grade, mon.basis, mon.instances.length], ["monitoring::c-1", "capture-failed", "C", { check: "C-28.17" }, 2]);
  assert.ok(r.proposals.every((p) => "grade" in p && "basis" in p && "surfaced_by" in p));
  assert.deepEqual(seen.at(-1), { project: null, viewer: V("bob") });
  assert.equal(r.count, r.proposals.length);
});

test("R16 adopt records the proposal in the named project's objective with who and when; question opens a question at surfaced through inquiry with the proposal as its basis; defer and dismiss need a reason and a progression proposal is decided through progressions; a set-aside proposal stays readable with its reason", async () => {
  const w = await withProposals();
  w.i.registerSource("monitoring", () => [{ key: "c-1", kind: "capture-failed", grade: null, basis: { n: 1 }, instances: [] },
                                          { key: "c-2", kind: "capture-failed", grade: null, basis: { n: 2 }, instances: [] },
                                          { key: "c-3", kind: "capture-failed", grade: null, basis: { n: 3 }, instances: [] }]);
  assert.equal(w.i.triage({ proposal: "monitoring::c-1", act: "keep", author: V("bob") }).reason, "TRIAGE_ACT_UNKNOWN");
  assert.equal(w.i.triage({ proposal: "monitoring::zzz", act: "adopt", project: w.P, author: V("bob") }).reason, "NO_SUCH_PROPOSAL");
  assert.equal(w.i.triage({ proposal: "monitoring::c-1", act: "adopt", author: V("bob") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.i.triage({ proposal: "monitoring::c-1", act: "adopt", project: w.P, author: V("carol") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  for (const act of ["defer", "dismiss"])
    assert.equal(w.i.triage({ proposal: "monitoring::c-2", act, reason: " ", author: V("bob") }).reason, "NO_REASON");
  /* adopt */
  const a = w.i.triage({ proposal: "monitoring::c-1", act: "adopt", project: w.P, author: V("bob"), viewer: V("bob") });
  assert.equal(a.ok, true);
  assert.deepEqual(w.fm(w.P).objective_adoptions, [{ proposal: "monitoring::c-1", source: "monitoring", by: V("bob"), at: w.clock.now }]);
  assert.match(w.text(w.P), /Proposal adopted \| member:bob/);
  /* question, by a member */
  const q = w.i.triage({ proposal: "monitoring::c-3", act: "question", author: V("bob"), viewer: V("bob") });
  assert.equal(q.ok, true);
  assert.equal(q.surfaced_by, "human");
  assert.equal(w.record.head(q.inquiry).type, "inquiry");
  assert.equal(w.record.head(q.inquiry).currentState, "surfaced");
  assert.equal(w.fm(q.inquiry).surfaced_from, "monitoring::c-3");
  assert.match(w.text(q.inquiry), /## What It Rests On\n\nSurfaced from the proposal monitoring::c-3/);
  /* defer a progression proposal: decided through progressions (its R20–R22), which ages the finding there */
  const d = w.i.triage({ proposal: "progressions::proc::award", act: "defer", reason: "After the audit.", author: V("bob"), viewer: V("bob") });
  assert.equal(d.ok, true);
  assert.equal(d.progressions.state, "deferred");
  assert.deepEqual(w.rows(`SELECT state, reason, decided_by FROM proposal_dispositions`), [{ state: "deferred", reason: "After the audit.", decided_by: V("bob") }]);
  const dm = w.i.triage({ proposal: "monitoring::c-2", act: "dismiss", reason: "A known outage.", author: V("bob"), viewer: V("bob") });
  assert.equal(dm.ok, true);
  /* a progressions refusal is relayed, and nothing is recorded */
  const before = w.count("intent_triage");
  const bad = w.i.triage({ proposal: "progressions::proc::contract", act: "dismiss", reason: 'Not "ours".', author: V("bob") });
  assert.equal(bad.reason, "BAD_REASON");
  assert.equal(w.count("intent_triage"), before);
  assert.equal(w.i.triage({ proposal: "progressions::proc::contract", act: "dismiss", reason: "Contracts are optional here.",
                            author: V("bob") }).ok, true);
  /* none is open again; the set-aside ones stay readable with their reasons */
  const r = w.i.proposals({ viewer: V("bob") });
  assert.deepEqual(r.proposals.map((p) => p.key), []);
  assert.deepEqual(r.set_aside.map((s) => [s.key, s.act, s.reason, s.author]).sort(),
                   [["monitoring::c-2", "dismiss", "A known outage.", V("bob")], ["progressions::proc::award", "defer", "After the audit.", V("bob")],
                    ["progressions::proc::contract", "dismiss", "Contracts are optional here.", V("bob")]]);
  assert.equal(w.i.triage({ proposal: "monitoring::c-2", act: "adopt", project: w.P, author: V("bob") }).reason, "NO_SUCH_PROPOSAL");
});

test("R16 a machine may question and is refused every other act (MACHINE_CANNOT_TRIAGE); its question is surfaced by an agent, under its run", async () => {
  const w = await withProposals();
  const pkgs = [];
  w.promotion.registerStep("ai-runs", { check: (c) => { if (!c.head && c.promotedType === "inquiry") pkgs.push(c.pkg); return null; } });
  for (const act of ["adopt", "defer", "dismiss"])
    for (const who of [MACHINE, "", null]) {
      const r = w.i.triage({ proposal: "progressions::proc::award", act, project: w.P, reason: "r", author: who });
      assert.equal(r.reason, "MACHINE_CANNOT_TRIAGE");
      assert.ok(r.check && r.translation);
    }
  const q = w.i.triage({ proposal: "progressions::proc::award", act: "question", author: MACHINE, run: "RUN-1",
                         assistantPrincipal: "class:ai" });
  assert.equal(q.ok, true);
  assert.equal(q.surfaced_by, "agent");
  assert.equal(w.fm(q.inquiry).surfaced_by, "agent");
  assert.equal(pkgs.at(-1).run, "RUN-1", "the surfacing step (ai-runs R25) sees the run");
  assert.equal(pkgs.at(-1).assistantPrincipal, "class:ai");
  assert.match(w.fm(q.inquiry).title, /award/);
});

test("R17 a question surfaced by a machine that no member acted on within the ageing interval moves to deferred with the recorded reason, through inquiry's dispose under a plane actor; nothing is deleted", async () => {
  const w = seeded();
  const at = (days) => new Date(Date.parse("2026-09-28T00:00:00Z") - days * DAY).toISOString().replace(/\.\d+Z$/, "Z");
  w.inquiry("INQ-2026-0001", { created: at(40) });                       // aged
  w.inquiry("INQ-2026-0002", { created: at(10) });                       // too young
  w.inquiry("INQ-2026-0003", { created: at(40), surfacedBy: "human", author: V("bob") });   // a member's question
  w.inquiry("INQ-2026-0004", { created: at(40) });                       // a member acted on it
  w.revise("INQ-2026-0004", w.text("INQ-2026-0004").replace("Question INQ-2026-0004?\n", "Question INQ-2026-0004, narrowed?\n"), V("bob"));
  w.inquiry("INQ-2026-0005", { created: at(40), state: "open" });        // no longer surfaced
  const nowMs = Date.parse("2026-09-28T00:00:00Z");
  const r = await w.i.ageSurfaced(nowMs);
  assert.equal(r.ok, true);
  assert.deepEqual(r.aged, ["INQ-2026-0001"]);
  assert.deepEqual(r.refused, []);
  assert.equal(r.interval_days, 30);
  const fm = w.fm("INQ-2026-0001");
  assert.equal(fm.current_state, "deferred");
  assert.equal(fm.disposition_reason, "surfaced by an assistant; no member acted within 30 days");
  assert.equal(fm.state_history.at(-1).author, "plane:intent");
  assert.deepEqual(w.calls.selections.map((s) => [s.ids, s.owner, s.kind]), [[["INQ-2026-0001"], "plane:intent", "enumerated"]]);
  assert.deepEqual(w.calls.dispose.map((d) => [d.handle, d.to, d.reason, d.owner, d.author]),
                   [["sel-1", "deferred", "surfaced by an assistant; no member acted within 30 days", "plane:intent", "plane:intent"]]);
  for (const id of ["INQ-2026-0002", "INQ-2026-0003", "INQ-2026-0004"]) assert.equal(w.fm(id).current_state, "surfaced", id);
  for (let n = 1; n <= 5; n++) assert.ok(w.record.head(`INQ-2026-000${n}`), "nothing is deleted");
  /* the interval is an instance setting */
  w.record.setSetting("intent_ageing_days", 5, V("alice"));
  const again = await w.i.ageSurfaced(nowMs);
  assert.deepEqual(again.aged, ["INQ-2026-0002"]);
  assert.equal(w.fm("INQ-2026-0002").disposition_reason, "surfaced by an assistant; no member acted within 5 days");
  assert.deepEqual((await w.i.ageSurfaced(nowMs)).aged, [], "a deferred question is not aged twice");
});

test("R20 an assistant proposes at any point and adopts at none: every act that adopts, dismisses, defers, sets a condition, links, declares, departs, closes or retires refuses a machine, and writes nothing", async () => {
  const w = await withProposals();
  const a = w.i.declareAspiration({ scope: "group", statement: "Open procurement", author: V("alice") }).aspiration;
  const g = w.i.declareGoal({ statement: "s", bounds: "b", author: V("bob") }).goal;
  const snap = w.snapshot();
  const cond = { progression: "proc", entity: "ENT-1", required: { grade: "B", stages: [] }, satisfied: { share: 50 } };
  for (const m of [MACHINE, "class:daemon", "", null]) {
    const acts = [
      ["setCondition", w.i.setCondition({ project: w.P, condition: cond, author: m })],
      ["declareGoal", w.i.declareGoal({ statement: "s", bounds: "b", author: m })],
      ["linkObjective", w.i.linkObjective({ goal: g, project: w.P, author: m })],
      ["closeGoal", w.i.closeGoal({ goal: g, reason: "r", author: m })],
      ["declareAspiration", w.i.declareAspiration({ scope: "group", statement: "s", author: m })],
      ["departFrom", w.i.departFrom({ project: w.P, aspiration: a, reason: "r", author: m })],
      ["recordDeadEnd", w.i.recordDeadEnd({ aspiration: a, note: "n", author: m })],
      ["retireAspiration", w.i.retireAspiration({ aspiration: a, taught: "t", author: m })],
      ["adopt", w.i.triage({ proposal: "progressions::proc::award", act: "adopt", project: w.P, author: m })],
      ["defer", w.i.triage({ proposal: "progressions::proc::award", act: "defer", reason: "r", author: m })],
      ["dismiss", w.i.triage({ proposal: "progressions::proc::award", act: "dismiss", reason: "r", author: m })],
      ["workObjective", await w.i.workObjective({ project: w.P, author: m, run: { run: "R" } })],
    ];
    for (const [name, r] of acts) {
      assert.equal(r.ok, false, `${name} by ${m}`);
      assert.match(r.reason, /^MACHINE_CANNOT_/, `${name} by ${m}: ${r.reason}`);
      assert.ok(r.check && r.translation);
    }
  }
  assert.deepEqual(w.snapshot(), snap, "nothing was written");
  assert.equal(w.calls.open.length, 0);
  /* and it may propose: a machine's question lands */
  assert.equal(w.i.triage({ proposal: "progressions::proc::award", act: "question", author: MACHINE }).ok, true);
});

test("R27 ageDue answers the earliest ageing instant of any ageable question, past or not, and ageWake the earliest later than now; each null with none; a question R17 could not move stays due and is never woken for; both write nothing and never throw", async () => {
  const w = seeded();
  const T = Date.parse("2026-09-28T00:00:00Z");
  const at = (days) => new Date(T - days * DAY).toISOString().replace(/\.\d+Z$/, "Z");
  assert.equal(w.i.ageDue(T), null, "no question: nothing due");
  assert.equal(w.i.ageWake(T), null);
  w.inquiry("INQ-2026-0001-question", { created: at(40) });                       // ageing instant T - 10 days
  w.inquiry("INQ-2026-0002-question", { created: at(10) });                       // T + 20 days
  w.inquiry("INQ-2026-0003-question", { created: at(5) });                        // T + 25 days
  w.inquiry("INQ-2026-0004-question", { created: at(50), surfacedBy: "human", author: V("bob") });   // not ageable
  w.inquiry("INQ-2026-0005-question", { created: at(60) });                       // a member acted: not ageable
  w.revise("INQ-2026-0005-question", w.text("INQ-2026-0005-question").replace("## Question", "## Question\n\nNarrowed."), V("bob"));
  w.inquiry("INQ-2026-0006-question", { created: at(70), state: "open" });        // no longer surfaced
  const snap = w.snapshot();
  assert.equal(w.i.ageDue(T), T - 10 * DAY, "the earliest, past or not");
  assert.equal(w.i.ageWake(T), T + 20 * DAY, "the earliest later than now");
  assert.equal(w.i.ageWake(new Date(T + 20 * DAY).toISOString()), T + 25 * DAY, "ISO text reads as the same instant; strictly later");
  assert.equal(w.i.ageWake(T + 25 * DAY), null, "none later");
  assert.deepEqual(w.snapshot(), snap, "the reads write nothing");
  /* the interval is the instance's setting, as R17's */
  w.record.setSetting("intent_ageing_days", 5, V("alice"));
  assert.equal(w.i.ageDue(T), T - 35 * DAY);
  assert.equal(w.i.ageWake(T), null, "every ageable question is past its instant at 5 days");
  w.record.setSetting("intent_ageing_days", 30, V("alice"));
  /* a question R17 tried and could not move stays due, tried again at a later firing, and is never woken for */
  const dispose = w.stand.inquiry.dispose;
  w.stand.inquiry.dispose = () => ({ ok: false, reason: "HELD_ELSEWHERE" });
  const r = await w.i.ageSurfaced(T);
  assert.deepEqual(r.aged, []);
  assert.deepEqual(r.refused.map((x) => x.id), ["INQ-2026-0001-question"]);
  assert.equal(w.i.ageDue(T), T - 10 * DAY, "still due");
  assert.equal(w.i.ageWake(T), T + 20 * DAY, "not woken for");
  w.stand.inquiry.dispose = dispose;
  assert.deepEqual((await w.i.ageSurfaced(T)).aged, ["INQ-2026-0001-question"], "tried again, and moved");
  assert.equal(w.i.ageDue(T), T + 20 * DAY, "a moved question is no longer ageable");
  /* never throws: a record that fails under it answers null */
  const broken = seeded();
  broken.record.listByType = () => { throw new Error("down"); };
  assert.equal(broken.i.ageDue(T), null);
  assert.equal(broken.i.ageWake(T), null);
});
