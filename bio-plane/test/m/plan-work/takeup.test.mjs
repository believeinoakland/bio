/* plan-work R11, R13: taking up an item herself; a matter's adopted promise-duties. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, code, by, V, MACHINE, ms } from "./fixture.mjs";
import { noSuchPlan, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";
import { PLAN_WORK_CHECKS } from "../../../src/plan-work/index.mjs";
import { INTERNAL as DUTIES_INTERNAL } from "../../../src/duties/index.mjs";
import { escalationRead } from "../escalation/fixtures.mjs";
import { transitionsUnknownDuty } from "../duties/fixtures.mjs";

/* duties R14 answers a read for a duty it does not hold as no transitions, never a refusal */
const unknownDuty = transitionsUnknownDuty().read;

function setup() {
  const w = world();
  const s = w.started({ subjects: [w.S1], dates: [{ date: "2026-11-01", basis: "statute" }] });
  w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main",
    phases: [{ id: "ask", name: "Ask", options: [s.option], starts: "plan_start", checkpoint: { after_days: 10 } }], ...by("bob") });
  const refused = escalationRead().unknownAnswer;
  w.stand.escalation.escalationRead = ({ id, viewer }) => (viewer === V("dave") || id !== "ESC-2026-0001-e" ? refused
    : { ok: true, id, stage: 3, history: [], proposed: [{ from: 3, to: 4, ids: [], instant: "2026-10-20T00:00:00Z" }] });
  /* on the project: an action started from a plan carries no project, so a hold on it is seen by every member (J2 (a)) */
  const h = w.holds.actionHold({ project: w.P, hold: "in_place", reason: "a letter from their lawyer", ...by("bob") });
  assert.equal(h.ok, true, JSON.stringify(h));
  return { w, s };
}
const ITEMS = (w, s) => ({
  clock: { kind: "clock", action: s.action, entry: 0 },
  checkpoint: { kind: "checkpoint", plan: w.PL, scenario: 1, phase: "ask" },
  escalation_stage: { kind: "escalation_stage", escalation: "ESC-2026-0001-e", stage: 4 },
  hold: { kind: "hold", project: w.P },
});

test("R11: itemTakeUp: a member who can see a clock entry, a checkpoint, a proposed escalation stage or a hold routes its to-dos to herself; a take-up by the member herself lands", () => {
  const { w, s } = setup();
  for (const [k, item] of Object.entries(ITEMS(w, s))) {
    const r = w.pw.itemTakeUp({ item, ...by("alice") });
    assert.equal(r.ok, true, `${k}: ${JSON.stringify(r)}`);
    assert.deepEqual([r.item.kind, r.by], [k, V("alice")]);
  }
  /* control: `for` naming herself lands */
  assert.equal(w.pw.itemTakeUp({ item: ITEMS(w, s).clock, for: V("alice"), ...by("alice") }).ok, true);
  const l = w.pw.takeUpsFor({});
  assert.deepEqual(l.items.map((x) => [x.item.kind, x.member]),
    [["clock", V("alice")], ["checkpoint", V("alice")], ["escalation_stage", V("alice")], ["hold", V("alice")], ["clock", V("alice")]]);
  assert.equal(l.truncated, false); assert.equal(l.cursor, null);
});

test("R11: refusals: MACHINE_CANNOT_PLAN; NO_SUCH_ITEM, absent and invisible alike; OPTION_KEY_REFUSED for any `for` naming another member", () => {
  const { w, s } = setup();
  const items = ITEMS(w, s);
  const m = w.pw.itemTakeUp({ item: items.clock, ...by("alice"), author: MACHINE });
  assert.equal(code(m), "MACHINE_CANNOT_PLAN"); assert.equal(m.check, ACTION_PLAN_CHECKS.MACHINE_CANNOT_PLAN.check);
  const absent = [{ kind: "clock", action: s.action, entry: 7 }, { kind: "clock", action: "ACTN-2026-0999", entry: 0 },
    { kind: "checkpoint", plan: w.PL, scenario: 1, phase: "none" }, { kind: "checkpoint", plan: w.PL, scenario: 9, phase: "ask" },
    { kind: "escalation_stage", escalation: "ESC-2026-0001-e", stage: 6 }, { kind: "hold", target: "ACTN-2026-0999" }, { kind: "hold", project: w.Q },
    { kind: "assignment" }, null, "clock"];
  for (const item of absent) {
    const r = w.pw.itemTakeUp({ item, ...by("alice") });
    assert.equal(code(r), "NO_SUCH_ITEM", JSON.stringify(item)); assert.equal(r.check, PLAN_WORK_CHECKS.NO_SUCH_ITEM.check);
  }
  /* invisible alike: dave sees none of P's items, answered exactly as an absent one */
  w.hide(V("dave"), s.action);
  const absentAnswer = w.pw.itemTakeUp({ item: absent[1], ...by("dave") });
  for (const item of Object.values(items)) assert.deepEqual(w.pw.itemTakeUp({ item, ...by("dave") }), absentAnswer);
  /* NO_SUCH_ITEM is asked before the key */
  assert.equal(code(w.pw.itemTakeUp({ item: absent[1], for: V("bob"), ...by("alice") })), "NO_SUCH_ITEM");
  for (const extra of [{ for: V("bob") }, { for: "bob" }, { assignee: V("bob") }]) {
    const r = w.pw.itemTakeUp({ item: items.clock, ...by("alice"), ...extra });
    assert.equal(code(r), "OPTION_KEY_REFUSED", JSON.stringify(extra));
  }
  assert.equal(w.count("pw_takeups"), 0, "nothing was written");
});

test("R11: takeUpsFor pages after a cursor and, for a viewer, lists only items she may still see", () => {
  const { w, s } = setup();
  const items = ITEMS(w, s);
  for (let i = 0; i < 3; i++) w.pw.itemTakeUp({ item: items.clock, ...by("bob") });
  w.pw.itemTakeUp({ item: items.hold, ...by("alice") });
  const p1 = w.pw.takeUpsFor({ limit: 2 });
  assert.deepEqual([p1.items.length, p1.truncated, p1.cursor], [2, true, 2]);
  const p2 = w.pw.takeUpsFor({ after: p1.cursor, limit: 2 });
  assert.deepEqual(p2.items.map((x) => x.take_up), [3, 4]);
  w.hide(V("dave"), s.action);
  assert.deepEqual(w.pw.takeUpsFor({ viewer: V("dave") }).items, []);
});

const KEY = (w) => `outcome:${w.D}#STD-2026-0001-a`;

test("R13: matterPromiseDuties reads the adopted duties arising in the captures of the received entries of the plan's actions serving the matter, with all_met and partial", () => {
  const { w, s } = setup();
  w.correspond(s.action, "sent");
  /* two replies held as captures, and one held as a member's account (no capture to read) */
  const SHA = w.capture("We will repair the lights by May."), SHA2 = w.capture("And publish the schedule.");
  w.correspond(s.action, "received", "2026-10-03", { artifactSha: SHA });
  w.correspond(s.action, "received", "2026-10-04", { artifactSha: SHA2 });
  w.correspond(s.action, "received", "2026-10-04");
  /* another matter's action: its capture is not read for S1 */
  const t = w.started({ subjects: [w.S3], summary: "Other" });
  w.correspond(t.action, "received", "2026-10-05", { artifactSha: w.capture("Another matter's reply.") });
  w.dutiesAnswer = ({ captures }) => ({ ok: true, captures, duties: [{ duty_id: "DUT-1", arising_in: SHA, occurrences: [{ state: "met" }] }],
                                        all_met: true, partial: true });
  const r = w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") });
  assert.deepEqual(w.dutyCalls.at(-1), { captures: [SHA, SHA2], asOf: "2026-10-10T00:00:00Z", viewer: V("bob") });
  assert.deepEqual([r.all_met, r.partial, r.duties.map((d) => d.duty_id)], [true, true, ["DUT-1"]]);
  /* the module's own read (no viewer) is duties' internal reader */
  w.pw.matterPromiseDuties({ plan: w.PL, matter: KEY(w) });
  assert.equal(w.dutyCalls.at(-1).viewer, DUTIES_INTERNAL);
  /* MATTER_NOT_OF_PLAN, and the plan's own answer for one the viewer may not see */
  assert.equal(code(w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S2, viewer: V("bob") })), "MATTER_NOT_OF_PLAN");
  assert.deepEqual(w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, viewer: V("dave") }), noSuchPlan(w.PL));
});

test("R13: control: a matter with no promise answers all_met false with no duties; a failing read never throws", () => {
  const { w, s } = setup();
  w.correspond(s.action, "received", "2026-10-03");
  const r = w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, viewer: V("bob") });
  assert.deepEqual([r.ok, r.all_met, r.duties, r.partial], [true, false, [], false]);
  assert.equal(w.dutyCalls.length, 0, "no capture, nothing asked");
  w.correspond(s.action, "received", "2026-10-04", { artifactSha: w.capture("A promise.") });
  w.dutiesAnswer = () => { throw new Error("down"); };
  const bad = w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, viewer: V("bob") });
  assert.deepEqual([bad.ok, bad.all_met, bad.duties], [true, false, []]);
  assert.ok(bad.undetermined);
  const rows = w.snapshot();
  w.dutiesAnswer = null;
  w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), rows, "writes nothing");
});

/* R15's world: two adopted duties arising in the matter's captures, each with one occurrence, all read met. */
function promised() {
  const { w, s } = setup();
  w.correspond(s.action, "sent");
  const SHA = w.capture("We will repair the lights by May."), SHA2 = w.capture("And publish the schedule.");
  w.correspond(s.action, "received", "2026-10-03", { artifactSha: SHA });
  w.correspond(s.action, "received", "2026-10-04", { artifactSha: SHA2 });
  const state = { "DUT-1": "met", "DUT-2": "met_late" };
  w.dutiesAnswer = ({ captures }) => {
    const duties = [["DUT-1", SHA], ["DUT-2", SHA2]].map(([id, cap]) => ({ duty_id: id, arising_in: cap, occurrences: [{ key: `OCC-${id}`, state: state[id] }] }));
    return { ok: true, captures, duties, all_met: duties.every((d) => ["met", "met_late"].includes(d.occurrences[0].state)) };
  };
  const t = (id, st, asOf) => ({ duty_id: id, occurrence_key: `OCC-${id}`, state: st, as_of: asOf, at: asOf, cause: "derived", evidence: null, by: null });
  w.transitions = [t("DUT-1", "pending", "2026-10-03T00:00:00Z"), t("DUT-1", "met", "2026-10-05T09:00:00Z"),
                   t("DUT-2", "pending", "2026-10-04T00:00:00Z"), t("DUT-2", "met_late", "2026-10-08T17:30:00Z")];
  return { w, s, state, t, read: (viewer = V("bob")) => w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, nowMs: ms("2026-10-10T00:00:00Z"), viewer }) };
}

test("R15: matterPromiseDuties answers met_at, the instant the last of the matter's duties was read met, from duties' recorded readings", () => {
  const { w, read } = promised();
  const r = read();
  assert.deepEqual([r.all_met, r.met_at], [true, "2026-10-08T17:30:00Z"], "two duties met on different days: the later instant (a promise kept late is kept)");
  /* read through duties' recorded readings, per occurrence, at the reader's sight */
  assert.deepEqual(w.transitionCalls.slice(-2), [{ dutyId: "DUT-1", occurrenceKey: "OCC-DUT-1", viewer: V("bob") },
                                                 { dutyId: "DUT-2", occurrenceKey: "OCC-DUT-2", viewer: V("bob") }]);
  /* the module's own read (following's, with no member's sight) is duties' internal reader, and answers the same */
  const own = w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, nowMs: ms("2026-10-10T00:00:00Z") });
  assert.equal(own.met_at, "2026-10-08T17:30:00Z"); assert.equal(w.transitionCalls.at(-1).viewer, DUTIES_INTERNAL);
  /* a duty read met, then not, then met again: the instant is the start of the reading that stands */
  w.transitions.push({ ...w.transitions[3], state: "overdue", as_of: "2026-10-09T00:00:00Z" },
                     { ...w.transitions[3], state: "met_late", as_of: "2026-10-09T12:00:00Z" },
                     { ...w.transitions[3], state: "met_late", as_of: "2026-10-09T18:00:00Z" });
  assert.equal(read().met_at, "2026-10-09T12:00:00Z");
});

test("R15: control: with one duty unmet, met_at is null; a met reading not yet recorded is null with why, never guessed", () => {
  const { w, state, read } = promised();
  state["DUT-2"] = "pending";
  const r = read();
  assert.deepEqual([r.all_met, r.met_at], [false, null]);
  assert.equal(w.transitionCalls.length, 0, "not all met: no reading is asked");
  /* all derived met, but duties has recorded no met reading for one occurrence yet */
  state["DUT-2"] = "met";
  w.transitions = w.transitions.filter((x) => !(x.duty_id === "DUT-2" && x.state !== "pending"));
  const u = read();
  assert.deepEqual([u.all_met, u.met_at], [true, null]); assert.match(u.met_at_why, /DUT-2/);
  /* the readings cannot be read: null with why, never a throw */
  w.transitionsAnswer = () => { throw new Error("down"); };
  const f = read();
  assert.deepEqual([f.ok, f.all_met, f.met_at], [true, true, null]); assert.ok(f.met_at_why);
  w.transitionsAnswer = () => unknownDuty;
  assert.equal(read().met_at, null);
  /* a matter with no promise answers met_at null */
  const { w: w2, s: s2 } = setup();
  w2.correspond(s2.action, "received", "2026-10-03");
  assert.equal(w2.pw.matterPromiseDuties({ plan: w2.PL, matter: w2.S1, viewer: V("bob") }).met_at, null);
  const rows = w.snapshot();
  w.transitionsAnswer = null;
  read();
  assert.deepEqual(w.snapshot(), rows, "writes nothing");
});

test("R17: matterPromiseDuties takes nowMs, the instant the duties are read as of; this module's clock when absent", () => {
  const { w, read } = promised();
  read();
  assert.equal(w.dutyCalls.at(-1).asOf, "2026-10-10T00:00:00Z", "nowMs is duties' asOf");
  w.clock.now = "2026-10-11T08:30:00Z";
  w.pw.matterPromiseDuties({ plan: w.PL, matter: w.S1, viewer: V("bob") });
  assert.equal(w.dutyCalls.at(-1).asOf, "2026-10-11T08:30:00Z", "absent: the module's clock");
});

test("R17: met_at is the as_of of the first reading of the unbroken met run that ends each occurrence's recorded transitions, the latest of those; never an instant of the derivation", () => {
  const { w, t, read } = promised();
  /* control: read overdue, then met, then met again: the first met reading's as_of */
  w.transitions = [t("DUT-1", "overdue", "2026-10-03T00:00:00Z"), t("DUT-1", "met", "2026-10-04T10:00:00Z"), t("DUT-1", "met", "2026-10-06T10:00:00Z"),
                   t("DUT-2", "met_late", "2026-10-02T00:00:00Z")];
  const r = read();
  assert.deepEqual([r.all_met, r.met_at], [true, "2026-10-04T10:00:00Z"]);
  assert.equal("met_at_why" in r, false, "no why when met_at is an instant");
  /* a run broken and begun again: its new start */
  w.transitions.push(t("DUT-2", "overdue", "2026-10-05T00:00:00Z"), t("DUT-2", "met_late", "2026-10-07T00:00:00Z"));
  assert.equal(read().met_at, "2026-10-07T00:00:00Z");
  /* never the derivation's instant: the occurrences duties derives carry other instants, and none is answered */
  const derived = w.dutiesAnswer;
  w.dutiesAnswer = (a) => { const x = derived(a); x.duties.forEach((d) => d.occurrences.forEach((o) => { o.as_of = "2026-10-10T00:00:00Z"; o.met_at = "2026-10-09T00:00:00Z"; })); return x; };
  assert.equal(read().met_at, "2026-10-07T00:00:00Z");
});

test("R17: when all_met holds but met_at cannot be stated, met_at is null with met_at_why; met_at_why is absent when all_met is false", () => {
  const { w, t, state, read } = promised();
  /* control: an occurrence whose last reading is overdue (derived met since, not yet recorded) answers null with its why */
  w.transitions = [t("DUT-1", "met", "2026-10-04T10:00:00Z"), t("DUT-2", "met_late", "2026-10-05T00:00:00Z"), t("DUT-2", "overdue", "2026-10-06T00:00:00Z")];
  const r = read();
  assert.deepEqual([r.ok, r.all_met, r.met_at], [true, true, null]);
  assert.equal(typeof r.met_at_why, "string"); assert.match(r.met_at_why, /DUT-2/);
  /* readings that cannot be read: null with why */
  w.transitionsAnswer = () => unknownDuty;
  const u = read();
  assert.deepEqual([u.met_at, typeof u.met_at_why], [null, "string"]);
  w.transitionsAnswer = null;
  /* all_met false: met_at null and no why */
  state["DUT-1"] = "pending";
  const f = read();
  assert.deepEqual([f.all_met, f.met_at, "met_at_why" in f], [false, null, false]);
  /* a matter with no promise: all_met false, no why */
  const { w: w2, s: s2 } = setup();
  w2.correspond(s2.action, "received", "2026-10-03");
  assert.equal("met_at_why" in w2.pw.matterPromiseDuties({ plan: w2.PL, matter: w2.S1, viewer: V("bob") }), false);
});
