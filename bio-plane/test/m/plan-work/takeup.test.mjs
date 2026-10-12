/* plan-work R11, R13: taking up an item herself; a matter's adopted promise-duties. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, code, by, V, MACHINE, ms } from "./fixture.mjs";
import { noSuchPlan, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";
import { PLAN_WORK_CHECKS } from "../../../src/plan-work/index.mjs";
import { INTERNAL as DUTIES_INTERNAL } from "../../../src/duties/index.mjs";

function setup() {
  const w = world();
  const s = w.started({ subjects: [w.S1], dates: [{ date: "2026-11-01", basis: "statute" }] });
  w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main",
    phases: [{ id: "ask", name: "Ask", options: [s.option], starts: "plan_start", checkpoint: { after_days: 10 } }], ...by("bob") });
  w.stand.escalation.escalationRead = ({ id, viewer }) => (viewer === V("dave") || id !== "ESC-2026-0001-e" ? { ok: false, reason: "NO_SUCH_ESCALATION" }
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
