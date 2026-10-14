/* plan-work R3, R4: the plan's one timeline, and the reviews a member sets herself. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, code, by, V, MACHINE, ms, choose, option } from "./fixture.mjs";
import { noSuchPlan, refusePlanClosed } from "../../../src/action-plans/index.mjs";
import { PLAN_WORK_CHECKS } from "../../../src/plan-work/index.mjs";

const DATES = [{ date: "2026-11-01", basis: "the records statute, ten days" }, { date: "2026-12-15", basis: "the order of 2026" }];

/* A plan with: a started action (sent 10-01, received 10-03, moved), two pending clock entries; a scenario whose first
   phase holds the action's option with a checkpoint after 20 days; an escalation proposing stage 4. */
function setup() {
  const w = world();
  const s = w.started({ subjects: [w.S1], dates: DATES });
  w.correspond(s.action, "sent", "2026-10-01");
  w.correspond(s.action, "received", "2026-10-03");
  w.actions.actionMove({ target: s.action, to: "active", reason: "under way", ...by("bob") });
  const r = w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main line",
    phases: [{ id: "ask", name: "Ask", options: [s.option], starts: "plan_start", checkpoint: { after_days: 20 } }], ...by("bob") });
  assert.equal(r.ok, true, JSON.stringify(r));
  w.escalations.set(w.D, [{ id: "ESC-2026-0001-e", state: "open", stage: 3, history: [] }]);
  w.stand.escalation.escalationRead = ({ id }) => ({ ok: true, id, stage: 3, history: [],
    proposed: [{ from: 3, to: 4, stage: "stage four", ids: [s.action], instant: "2026-10-20T00:00:00Z" }] });
  return { w, s };
}

test("R3: every act on the plan's actions and every coming date, in date order, with `next` from nowMs at most 10; writes nothing", () => {
  const { w, s } = setup();
  const rows = w.snapshot();
  const t = w.pw.planTimeline({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") });
  assert.equal(t.ok, true, JSON.stringify(t));
  const kinds = t.items.map((x) => x.kind);
  for (const k of ["sent", "received", "move", "clock", "phase_start", "checkpoint", "escalation_stage"]) assert.ok(kinds.includes(k), k);
  /* in date order */
  const at = t.items.map((x) => ms(x.at));
  assert.deepEqual(at, [...at].sort((a, b) => a - b));
  /* clock entries carry their basis and owed_by (undetermined when the entry does not say, never defaulted) */
  const clocks = t.items.filter((x) => x.kind === "clock");
  assert.deepEqual(clocks.map((c) => [c.at, c.basis, c.owed_by, c.action, c.entry]),
    [["2026-11-01", DATES[0].basis, "undetermined", s.action, 0], ["2026-12-15", DATES[1].basis, "undetermined", s.action, 1]]);
  /* the escalation's proposed stage, dated by when its trigger was met */
  assert.deepEqual(t.items.filter((x) => x.kind === "escalation_stage").map((x) => [x.at, x.to]), [["2026-10-20T00:00:00Z", 4]]);
  /* next: the coming dates only, from nowMs, in order */
  assert.ok(t.next.every((x) => x.coming && ms(x.at) >= ms("2026-10-09T00:00:00Z")));
  assert.deepEqual(t.next.map((x) => x.kind), ["escalation_stage", "checkpoint", "clock", "clock"]);
  assert.equal(t.items.filter((x) => x.kind === "sent")[0].coming, false, "an act done is never coming");
  assert.deepEqual(w.snapshot(), rows, "a read writes nothing");
  /* at most 10 */
  for (let i = 0; i < 12; i++) w.started({ subjects: [w.S1], summary: `Ask again ${i}`, dates: [{ date: "2027-01-0" + ((i % 9) + 1), basis: "b" }] });
  const many = w.pw.planTimeline({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") });
  assert.equal(many.next.length, 10);
  assert.ok(many.items.filter((x) => x.coming).length > 10);
});

test("R3: what the viewer may not see is withheld whole; an outsider reads the plan as absent", () => {
  const { w, s } = setup();
  w.hide(V("alice"), s.action);
  const t = w.pw.planTimeline({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("alice") });
  assert.equal(t.items.some((x) => x.action === s.action), false, "no item of an unseen action, not even its id");
  assert.doesNotMatch(JSON.stringify(t), new RegExp(s.action));
  assert.deepEqual(w.pw.planTimeline({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  /* control: bob sees it */
  assert.ok(w.pw.planTimeline({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") }).items.some((x) => x.action === s.action));
});

const WEEKLY = { rrule: "FREQ=WEEKLY;BYDAY=MO", dtstart: "2026-10-05", zone: "America/Los_Angeles" };
const rhythm = (w, recurrence, extra = {}) => w.pw.planReviewRhythm({ plan: w.PL, recurrence, ...by("bob"), ...extra });

test("R4: planReviewRhythm sets or removes a member's own reminder; malformed is REVIEW_RHYTHM_REFUSED; a machine and an unseen or closed plan are refused", () => {
  const w = world();
  assert.equal(code(rhythm(w, WEEKLY, { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.deepEqual(rhythm(w, WEEKLY, by("dave")), noSuchPlan(w.PL));
  for (const bad of [{ rrule: "FREQ=DAILY", dtstart: "2026-10-05", zone: "America/Los_Angeles" },
                     { rrule: "FREQ=WEEKLY;BYHOUR=9", dtstart: "2026-10-05", zone: "America/Los_Angeles" },
                     { rrule: "FREQ=WEEKLY", dtstart: "next monday", zone: "America/Los_Angeles" },
                     { rrule: "FREQ=WEEKLY", dtstart: "2026-10-05", zone: "Mars/Olympus" }, "weekly", 7, {}]) {
    const r = rhythm(w, bad);
    assert.equal(code(r), "REVIEW_RHYTHM_REFUSED", JSON.stringify(bad));
    assert.equal(r.check, PLAN_WORK_CHECKS.REVIEW_RHYTHM_REFUSED.check);
  }
  assert.equal(w.count("pw_rhythms"), 0);
  const ok = rhythm(w, WEEKLY);
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.deepEqual(ok.recurrence, WEEKLY);
  assert.equal(rhythm(w, { rrule: "FREQ=MONTHLY;BYMONTHDAY=1", dtstart: "2026-11-01", zone: "UTC" }).ok, true);
  assert.equal(rhythm(w, null).ok, true, "null removes it");
  assert.equal(w.count("pw_rhythms"), 3, "each statement appended");
  assert.deepEqual(w.pw.planReviews({ plan: w.PL, viewer: V("bob") }).rhythm, null);
  w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") });
  assert.deepEqual(rhythm(w, WEEKLY), refusePlanClosed(w.PL));
});

test("R4: planReviewsDue answers one item per due review, told once; no rhythm, no item", () => {
  const w = world();
  const due = (iso) => w.pw.planReviewsDue({ nowMs: ms(iso) }).items;
  /* control: a plan with no rhythm is never due */
  assert.deepEqual(due("2027-06-01T00:00:00Z"), []);
  rhythm(w, WEEKLY);
  assert.deepEqual(due("2026-10-04T00:00:00Z"), [], "before the first occurrence");
  const a = due("2026-10-06T20:00:00Z");
  assert.equal(a.length, 1);
  assert.deepEqual([a[0].plan, a[0].project, a[0].member, a[0].day], [w.PL, w.P, V("bob"), "2026-10-05"]);
  /* the same occurrence later in the week is the same one item, and the next Monday's is the next */
  assert.deepEqual(due("2026-10-09T00:00:00Z"), a);
  /* a review recorded after it: not due until the next occurrence */
  w.clock.now = "2026-10-07T10:00:00Z";
  assert.equal(w.pw.planReviewRecord({ plan: w.PL, decided: "Keep waiting for the clerk.", ...by("alice") }).ok, true);
  assert.deepEqual(due("2026-10-09T00:00:00Z"), []);
  const b = due("2026-10-13T20:00:00Z");
  assert.deepEqual(b.map((x) => x.day), ["2026-10-12"]);
  /* removed: no item; a closed plan: no item */
  rhythm(w, null);
  assert.deepEqual(due("2026-10-20T20:00:00Z"), []);
  rhythm(w, WEEKLY);
  assert.equal(due("2026-10-20T20:00:00Z").length, 1);
  w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") });
  assert.deepEqual(due("2026-10-20T20:00:00Z"), []);
});

test("R4: planReviewOpen answers what changed since the last review entry: responses recorded, dates passed, marks", () => {
  const w = world();
  const s = w.started({ subjects: [w.S1], dates: [{ date: "2026-10-04", basis: "statute" }, { date: "2026-12-01", basis: "order" }] });
  w.correspond(s.action, "sent", "2026-10-01");
  w.clock.now = "2026-10-02T12:00:00Z";
  w.pw.planReviewRecord({ plan: w.PL, decided: "Wait for the reply.", ...by("bob") });
  w.clock.now = "2026-10-05T12:00:00Z";
  w.correspond(s.action, "received", "2026-10-05");
  w.ap.planMark({ plan: w.PL, marks: [{ kind: "option_changed", option: s.option, why: "x" }], cause: { action: s.action, ord: 1 } });
  const r = w.pw.planReviewOpen({ plan: w.PL, nowMs: ms("2026-10-06T00:00:00Z"), viewer: V("bob") });
  assert.equal(r.since, "2026-10-02T12:00:00Z");
  assert.equal(r.last_review.decided, "Wait for the reply.");
  assert.deepEqual(r.responses.map((x) => [x.action, x.at]), [[s.action, "2026-10-05"]]);
  assert.deepEqual(r.dates_passed.map((x) => [x.kind, x.at]), [["clock", "2026-10-04"]]);
  /* the response itself set off a re-examination (its mark), and the mark written by hand: both since the review */
  assert.deepEqual(r.marks.map((x) => [x.kind, x.why]), [["option_changed", `a response was recorded on ${s.action}, the action this option started`], ["option_changed", "x"]]);
  /* after a new review entry nothing has changed */
  w.clock.now = "2026-10-06T00:00:00Z";
  w.pw.planReviewRecord({ plan: w.PL, decided: "Read the reply.", ...by("bob") });
  const again = w.pw.planReviewOpen({ plan: w.PL, nowMs: ms("2026-10-06T01:00:00Z"), viewer: V("bob") });
  assert.deepEqual([again.responses, again.dates_passed, again.marks], [[], [], []]);
  assert.deepEqual(w.pw.planReviewOpen({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
});

test("R4: planReviewRecord records a dated review entry of 1 to 4,000 characters, kept in order", () => {
  const w = world();
  const rec = (decided, extra = {}) => w.pw.planReviewRecord({ plan: w.PL, decided, ...by("bob"), ...extra });
  assert.equal(code(rec("x", { author: MACHINE })), "MACHINE_CANNOT_PLAN");
  for (const bad of ["", "   ", "x".repeat(4001), null]) {
    const r = rec(bad);
    assert.equal(code(r), "PLAN_WORK_TEXT_REFUSED"); assert.equal(r.max, 4000); assert.equal(r.field, "decided");
  }
  assert.equal(rec("x".repeat(4000)).ok, true);
  assert.equal(rec("We chose to wait.\nAnd to ask again in May.").ok, true, "several lines are allowed");
  const l = w.pw.planReviews({ plan: w.PL, viewer: V("alice") });
  assert.deepEqual(l.reviews.map((x) => [x.review, x.by, x.at]), [[1, V("bob"), "2026-10-01T12:00:00Z"], [2, V("bob"), "2026-10-01T12:00:00Z"]]);
});

test("R18: each due item also carries recurrence, the rhythm as the member set it with who and when, and since, the local day of the last review else of the rhythm's setting, in the rhythm's zone", () => {
  const w = world();
  const due = (iso) => w.pw.planReviewsDue({ nowMs: ms(iso) }).items;
  w.clock.now = "2026-10-03T05:00:00Z";             /* 2 October, 22:00 in Los Angeles */
  rhythm(w, WEEKLY);
  /* control: one never reviewed answers the day its rhythm was set, in the rhythm's zone */
  const a = due("2026-10-06T20:00:00Z");
  assert.equal(a.length, 1);
  assert.deepEqual(a[0].recurrence, { ...WEEKLY, by: V("bob"), at: "2026-10-03T05:00:00Z" });
  assert.deepEqual(a[0].since, { day: "2026-10-02", from: "rhythm_set" });
  /* its other fields are unchanged */
  assert.deepEqual([a[0].plan, a[0].project, a[0].member, a[0].day, a[0].zone], [w.PL, w.P, V("bob"), "2026-10-05", WEEKLY.zone]);
  /* control: a plan reviewed once answers that review's day, in the rhythm's zone */
  w.clock.now = "2026-10-08T03:00:00Z";             /* 7 October, 20:00 in Los Angeles */
  assert.equal(w.pw.planReviewRecord({ plan: w.PL, decided: "Keep waiting.", ...by("alice") }).ok, true);
  assert.deepEqual(due("2026-10-09T00:00:00Z"), [], "told once: reviewed since");
  const b = due("2026-10-13T20:00:00Z");
  assert.deepEqual(b.map((x) => [x.day, x.since]), [["2026-10-12", { day: "2026-10-07", from: "review" }]]);
  assert.deepEqual(b[0].recurrence, { ...WEEKLY, by: V("bob"), at: "2026-10-03T05:00:00Z" });
  /* a rhythm set again names its new setting, and the review's day is read in its zone (UTC: the 8th) */
  w.clock.now = "2026-10-14T12:00:00Z";
  rhythm(w, { rrule: "FREQ=MONTHLY;BYMONTHDAY=15", dtstart: "2026-10-15", zone: "UTC" }, by("bob"));
  const c = due("2026-10-15T12:00:00Z");
  assert.deepEqual(c.map((x) => [x.recurrence.rrule, x.recurrence.at, x.since]),
    [["FREQ=MONTHLY;BYMONTHDAY=15", "2026-10-14T12:00:00Z", { day: "2026-10-08", from: "review" }]]);
});
