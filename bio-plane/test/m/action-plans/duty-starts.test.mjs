/* action-plans R14 (R38's form), R38, R23 and R35 for an obligation: a phase started by a duty occurrence's state, read
   through the real `duties` module (built by its own test world over its real modules, T33-35), so an overdue response
   activates the next step; the group's own checkpoint stays never a finding. The duty: the clerk's records response,
   triggered 2026-02-02, due 2026-02-12 under the fictional view's rule (duties' fixture). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, MACHINE, by, ms } from "./fixture.mjs";
import { world as dutiesWorld, BOB, CAROL } from "../duties/fixture.mjs";

const code = (r) => r.code ?? r.reason;
const at = (w, iso) => { w.clock.now = iso; };
const setup = (opts = {}) => {
  const dw = dutiesWorld();
  const w = seeded({ duties: dw.duties, ...opts });
  at(w, "2026-01-10T12:00:00Z");
  opened(w, [w.SI, w.S1]);
  w.A = option(w); w.B = option(w, { summary: "Ask the auditor" });
  choose(w, [w.A, w.B]);
  w.dw = dw;
  w.DUT = dw.declare().duty_id;
  w.OCC = dw.duties.occurrencesOf({ dutyId: w.DUT, asOf: "2026-03-01T00:00:00Z", viewer: BOB }).occurrences[0].key;
  return w;
};
const set = (w, phases, extra = {}) => w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main line", phases, ...by("bob"), ...extra });
const ask = (w, extra = {}) => ({ id: "ask", name: "Ask", options: [w.A], starts: "plan_start", ...extra });
const next = (w, starts = {}, extra = {}) => ({ id: "next", name: "Next", options: [w.B],
  starts: { when_duty: { duty: w.DUT }, state: "overdue", ...starts }, ...extra });
const phase = (w, nowIso, id = "next", viewer = V("bob")) =>
  w.ap.planRead({ id: w.PL, nowMs: ms(nowIso), viewer }).scenarios[0].phases.find((p) => p.id === id);

test("R14 R38: a phase may start on a duty occurrence's state; the form is checked, and the duty is one the author may see", () => {
  const w = setup();
  const ok = set(w, [ask(w), next(w)]);
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.deepEqual(ok.phases[1].starts, { when_duty: { duty: w.DUT }, state: "overdue" });
  for (const state of ["met", "met_late", "overdue", "undetermined"])
    assert.equal(set(w, [ask(w), next(w, { state })]).ok, true, state);
  /* malformed: an unknown state (pending and discharged are not among R38's), a duty that is not DUT-, extra keys */
  for (const starts of [{ state: "pending" }, { state: "discharged" }, { state: undefined },
                        { when_duty: { duty: "ENT-2026-0001" } }, { when_duty: { duty: w.DUT, extra: 1 } },
                        { when_duty: w.DUT }, { reaches: "resolved" }, { when_duty: { duty: w.DUT, occurrence: "bad key!" } }]) {
    const r = set(w, [ask(w), next(w, starts)]);
    assert.equal(code(r), "PHASE_MALFORMED", JSON.stringify(starts)); assert.equal(r.index, 1);
  }
  /* an occurrence named is one of the duty's own */
  assert.equal(set(w, [ask(w), next(w, { when_duty: { duty: w.DUT, occurrence: w.OCC } })]).ok, true);
  const foreign = set(w, [ask(w), next(w, { when_duty: { duty: w.DUT, occurrence: "OCC-0000" } })]);
  assert.equal(code(foreign), "PHASE_MALFORMED"); assert.equal(foreign.index, 1);
  /* NO_SUCH_DUTY, duties' own answer: absent and unseen alike, and nothing written */
  const fenced = w.dw.declare({ project: w.dw.project("carol") }, CAROL).duty_id;
  const before = w.ap.planRead({ id: w.PL, viewer: V("bob") }).scenarios[0].version;
  const absent = set(w, [ask(w), next(w, { when_duty: { duty: "DUT-2026-9999" } })]);
  const unseen = set(w, [ask(w), next(w, { when_duty: { duty: fenced } })]);
  assert.equal(code(absent), "NO_SUCH_DUTY"); assert.equal(code(unseen), "NO_SUCH_DUTY");
  assert.deepEqual({ ...absent, duty_id: null }, { ...unseen, duty_id: null });
  assert.equal(w.ap.planRead({ id: w.PL, viewer: V("bob") }).scenarios[0].version, before);
  /* a machine still schedules nothing (R24) */
  assert.equal(code(set(w, [ask(w), next(w)], { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_SCHEDULE");
});

test("R38: an overdue response activates the next step: derived when read, never stored, and answered as a question with its derivation", () => {
  const w = setup();
  set(w, [ask(w), next(w)]);
  const rows = w.snapshot();
  /* before the due date: pending, the phase waits */
  const early = phase(w, "2026-02-05T00:00:00Z");
  assert.equal(early.started, false);
  assert.equal(early.duty_start.occurrence, w.OCC);
  assert.equal(early.duty_start.state, "pending");
  assert.equal(early.duty_start.holds, false);
  assert.equal(early.duty_start.read_from, "derived");
  /* after it, with no matching event held: overdue, so the phase starts the day after the due date */
  const late = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(late.duty_start.state, "overdue");
  assert.equal(late.duty_start.holds, true);
  assert.equal(late.started, true);
  assert.equal(late.started_at, "2026-02-13T00:00:00Z");
  assert.equal(late.duty_start.derivation.due_date.value, "2026-02-12");
  assert.equal(late.duty_start.derivation.basis_kind, "rule");
  assert.match(late.duty_start.question, /this is a question, not a finding/);
  assert.doesNotMatch(JSON.stringify(late.duty_start), /violat|breach/i);
  /* reading changed nothing: the start is derived, never stored */
  assert.deepEqual(w.snapshot(), rows);
  /* the same phase, waiting for met, does not start on an overdue occurrence */
  set(w, [ask(w), next(w, { state: "met" })]);
  const notMet = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(notMet.started, false); assert.equal(notMet.duty_start.holds, false); assert.equal(notMet.duty_start.state, "overdue");
});

test("R38: the occurrence's latest recorded transition governs, as known at the read; with none, its derived state", () => {
  const w = setup();
  set(w, [ask(w), next(w, { state: "met" })]);
  /* duties' clock stamps the recording at 2026-03-02T12:00:00Z (its fixture); the transition says met as of 20 February */
  const t = w.dw.duties.recordTransition({ dutyId: w.DUT, occurrenceKey: w.OCC, state: "met", asOf: "2026-02-20T00:00:00Z",
                                           cause: "the clerk's letter of 20 February answered it", by: BOB });
  assert.equal(t.ok, true, JSON.stringify(t));
  /* read before the recording: the derived state (overdue) stands, as known then */
  const before = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(before.duty_start.read_from, "derived"); assert.equal(before.duty_start.state, "overdue");
  assert.equal(before.started, false);
  /* read after it: the recorded met governs, and the phase starts from its as_of */
  const after = phase(w, "2026-03-10T00:00:00Z");
  assert.equal(after.duty_start.read_from, "recorded");
  assert.equal(after.duty_start.state, "met");
  assert.equal(after.duty_start.transition.as_of, "2026-02-20T00:00:00Z");
  assert.equal(after.duty_start.holds, true);
  assert.equal(after.started_at, "2026-02-20T00:00:00Z");
  /* an overdue phase on the same occurrence no longer holds once met is recorded */
  set(w, [ask(w), next(w)]);
  assert.equal(phase(w, "2026-03-10T00:00:00Z").started, false);
  assert.equal(phase(w, "2026-03-01T00:00:00Z").started, true);
});

test("R38: occurrence absent names the next one triggered after the phase's predecessor started; a branch leading here is that predecessor", () => {
  const w = setup();
  /* no predecessor: the scenario's setting (10 January) is the anchor, and the 2 February occurrence is the next */
  set(w, [ask(w), next(w)]);
  assert.equal(phase(w, "2026-03-01T00:00:00Z").duty_start.occurrence, w.OCC);
  /* set after the trigger: no occurrence has been triggered since, so the phase does not start */
  at(w, "2026-02-20T12:00:00Z");
  set(w, [ask(w), next(w)]);
  const none = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(none.started, false); assert.equal(none.duty_start.occurrence, null); assert.equal(none.duty_start.holds, false);
  /* named, the occurrence is read whatever the anchor; the start is never before its phase began to wait */
  set(w, [ask(w), next(w, { when_duty: { duty: w.DUT, occurrence: w.OCC } })]);
  const named = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(named.started, true); assert.equal(named.started_at, "2026-02-20T12:00:00Z");
  /* a branch leads here: until it is judged that way, nothing is read; judged not_met on 25 January, the anchor is then */
  at(w, "2026-01-10T12:00:00Z");
  set(w, [ask(w, { checkpoint: { after_days: 10 }, branches: { not_met: "next" } }), next(w)]);
  const waiting = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(waiting.started, false); assert.equal(waiting.duty_start.holds, false); assert.equal(waiting.duty_start.state, null);
  at(w, "2026-01-25T12:00:00Z");
  const j = w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "ask", judged: "not_met", note: "no answer yet", ...by("bob") });
  assert.equal(j.ok, true, JSON.stringify(j)); assert.deepEqual(j.leads_to, ["next"]);
  const led = phase(w, "2026-03-01T00:00:00Z");
  assert.equal(led.duty_start.occurrence, w.OCC); assert.equal(led.started, true); assert.equal(led.started_at, "2026-02-13T00:00:00Z");
  /* judged met, the branch does not lead here, so the phase never starts */
  at(w, "2026-01-10T12:00:00Z");
  set(w, [ask(w, { checkpoint: { after_days: 10 }, branches: { not_met: "next" } }), next(w)]);
  at(w, "2026-01-25T12:00:00Z");
  w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "ask", judged: "met", ...by("bob") });
  assert.equal(phase(w, "2026-03-01T00:00:00Z").started, false);
});

test("R38 R17: a duty-started phase's checkpoint comes due from its start, in the internal due read", () => {
  const w = setup();
  set(w, [ask(w), next(w, {}, { checkpoint: { after_days: 7 } })]);
  const due = (iso) => w.ap.checkpointsDue({ nowMs: ms(iso) }).items.filter((x) => x.phase === "next");
  assert.deepEqual(due("2026-02-15T00:00:00Z"), []);
  const items = due("2026-02-21T00:00:00Z");
  assert.equal(items.length, 1);
  assert.equal(items[0].due, "2026-02-20T00:00:00Z");
  assert.equal(items[0].days_since_due, 1);
});

test("R38 R23: a duty occurrence is the body's, never the group's: a checkpoint judged not_met records nothing in duties and is no finding", () => {
  const w = setup();
  at(w, "2026-01-10T12:00:00Z");
  set(w, [ask(w, { checkpoint: { after_days: 10 }, branches: { not_met: "next" } }), next(w)]);
  const trans = () => w.dw.duties.transitionsOf({ dutyId: w.DUT, viewer: BOB }).count;
  const occ = () => JSON.stringify(w.dw.duties.occurrencesOf({ dutyId: w.DUT, asOf: "2026-03-01T00:00:00Z", viewer: BOB }).occurrences.map((o) => [o.key, o.state]));
  const [t0, o0] = [trans(), occ()];
  at(w, "2026-01-25T12:00:00Z");
  assert.equal(w.ap.checkpointRecord({ plan: w.PL, scenario: 1, phase: "ask", judged: "not_met", ...by("bob") }).ok, true);
  assert.equal(trans(), t0); assert.equal(occ(), o0);
  const read = w.ap.planRead({ id: w.PL, nowMs: ms("2026-03-01T00:00:00Z"), viewer: V("bob") });
  const askPhase = read.scenarios[0].phases.find((p) => p.id === "ask");
  assert.equal(askPhase.judgement.judged, "not_met");
  assert.equal(askPhase.duty_start, undefined, "the group's own phase carries no duty reading");
  assert.doesNotMatch(JSON.stringify(read.checks), /overdue|violat|finding/i);
  assert.equal(read.scenarios[0].phases.find((p) => p.id === "next").duty_start.question !== undefined, true,
    "the body's overdue occurrence is a question");
});

test("R38 R35: an obligation the viewer may not see is withheld whole from the read, and the plan says out_of_view", () => {
  const w = setup();
  const bobs = w.dw.declare({ project: w.dw.project("bob") }).duty_id;
  assert.equal(set(w, [ask(w), next(w, { when_duty: { duty: bobs } })]).ok, true);
  const bob = w.ap.planRead({ id: w.PL, nowMs: ms("2026-03-01T00:00:00Z"), viewer: V("bob") });
  assert.equal(bob.scenarios[0].phases[1].starts.when_duty.duty, bobs);
  assert.equal(bob.out_of_view, undefined);
  /* carol, joined to the plan's project, may not see the project of bob's the obligation sits in */
  w.join(w.P, "carol");
  const carol = w.ap.planRead({ id: w.PL, nowMs: ms("2026-03-01T00:00:00Z"), viewer: V("carol") });
  const ph = carol.scenarios[0].phases[1];
  assert.equal(ph.starts.when_duty, undefined);
  assert.equal(ph.duty_start, undefined);
  assert.equal(carol.out_of_view, true);
  assert.doesNotMatch(JSON.stringify(carol), new RegExp(bobs));
});

test("R38: without the duties provider, a read that needs it answers PLAN_PROVIDER_UNAVAILABLE, never in part", () => {
  const dw = dutiesWorld();
  const w = seeded({ duties: dw.duties });
  opened(w, [w.SI, w.S1]);
  const A = option(w); choose(w, [A]);
  const DUT = dw.declare().duty_id;
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "M", phases: [
    { id: "n", name: "N", options: [A], starts: { when_duty: { duty: DUT }, state: "overdue" } }], ...by("bob") }).ok, true);
  const bare = seeded({ omit: ["duties"] });
  opened(bare, [bare.SI, bare.S1]);
  const B = option(bare); choose(bare, [B]);
  const r = bare.ap.scenarioSet({ plan: bare.PL, scenario: 1, name: "M", phases: [
    { id: "n", name: "N", options: [B], starts: { when_duty: { duty: DUT }, state: "overdue" } }], ...by("bob") });
  assert.equal(code(r), "PLAN_PROVIDER_UNAVAILABLE"); assert.equal(r.provider, "duties");
  /* a plan with no obligation's phase never asks for it */
  assert.equal(bare.ap.scenarioSet({ plan: bare.PL, scenario: 1, name: "M", phases: [
    { id: "n", name: "N", options: [B], starts: "plan_start" }], ...by("bob") }).ok, true);
  assert.equal(bare.ap.planRead({ id: bare.PL, viewer: V("bob") }).ok, true);
});
