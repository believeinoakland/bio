/* plan-work R7, R8, R9: where the plan stands, the status report drafted from it and kept, and the watch reader. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, code, by, V, MACHINE, ms, OFFICE, option, choose } from "./fixture.mjs";
import { noSuchPlan, refusePlanClosed } from "../../../src/action-plans/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { DRAFT_LABEL } from "../../../src/plan-work/index.mjs";

/* A plan with: a started action awaiting a response with a pending entry; an overridden breach action; a declined
   option; a scenario set aside; an escalation; a held project and a hold due on the action. */
function setup() {
  const w = world();
  const s = w.started({ subjects: [w.S1], dates: [{ date: "2026-11-01", basis: "the records statute" }] });
  w.correspond(s.action, "sent", "2026-10-01");
  w.actions.actionMove({ target: s.action, to: "active", reason: "sent", ...by("bob") });
  w.actions.actionMove({ target: s.action, to: "awaiting_response", reason: "asked", ...by("bob") });
  /* an overridden breach action: started from the plan, then revised by a member to state the breach with its
     override's ground and reason (actions R8, R74) */
  const o = option(w, { subjects: [w.SI], addressee: OFFICE });
  choose(w, [o]);
  const b = w.ap.optionStart({ plan: w.PL, option: o, kind: "other", ...by("bob") });
  assert.equal(b.ok, true, JSON.stringify(b));
  const head = w.record.head(b.action);
  const text = w.text(b.action).replace("\ncorrespondence: []", ["", "breach: true", "premise_override:", "  ground_kind: irreversible_act",
    '  ground_what: "the hall is to be demolished"', "  ground_when: 2026-10-12T19:00",
    '  reason: "the meeting is on Monday"', "correspondence: []"].join("\n"));
  const rev = w.promotion.promote({ bundleId: b.action, base: head.bundleSha, snapKey: "ovr1", author: V("bob"),
    files: [{ path: "bundle.md", text }], meta: { object_type: "action" } });
  assert.equal(rev.ok, true, JSON.stringify(rev).slice(0, 400));
  const d = option(w, { summary: "Call the papers" });
  w.ap.optionDispose({ plan: w.PL, options: [d], disposition: "declined", reason: "too early to go public", ...by("bob") });
  w.ap.scenarioSet({ plan: w.PL, scenario: 2, name: "Loud line", phases: [{ id: "x", name: "X", options: [], starts: "plan_start" }], ...by("bob") });
  assert.equal(w.ap.scenarioSetAside({ plan: w.PL, scenario: 2, reason: "we chose the quiet line", ...by("bob") }).ok, true);
  w.escalations.set(w.D, [{ id: "ESC-2026-0001-e", state: "open", stage: 2, history: [] }]);
  /* action-holds, real: a hold in place on the project; a legal pressure mark on the action's reply, no hold yet (due) */
  assert.equal(w.holds.actionHold({ project: w.P, hold: "in_place", reason: "a letter from their lawyer", ...by("bob") }).ok, true);
  const reply = w.correspond(s.action, "received", "2026-10-02");
  const mark = w.holds.actionPressure({ target: s.action, ord: reply, pressure: { kind: "legal", note: "a lawyer's letter" }, ...by("bob") });
  assert.equal(mark.ok, true, JSON.stringify(mark));
  w.dueOrd = reply;
  return { w, s, b, d };
}

test("R7: whereItStands answers waits with their basis, next dates, holds, overrides with reasons, declined options and set-aside scenarios with reasons, escalations and watches; writes nothing", () => {
  const { w, s, b, d } = setup();
  /* an action outside the plan and its project, with a legal mark and no hold: never the plan's (the control below) */
  const other = w.actions.actionCreate({ document: w.text(s.action).replace(/plan: .*\n/, "").replace(/option: .*\n/, "")
    .replace(/\nproject: .*\n/, "\n"), ...by("bob") });
  assert.equal(other.ok, true, JSON.stringify(other));
  const o = w.correspond(other.id, "received", "2026-10-02");
  assert.equal(w.holds.actionPressure({ target: other.id, ord: o, pressure: { kind: "legal", note: "x" }, ...by("bob") }).ok, true);
  /* the first read reaches the modules action-holds reads (docket, publication), which create their tables */
  w.pw.whereItStands({ plan: w.PL, viewer: V("bob") });
  const rows = w.snapshot();
  const r = w.pw.whereItStands({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const entry = r.waits.find((x) => x.action === s.action && x.entry === 0);
  assert.deepEqual([entry.date, entry.basis, entry.owed_by], ["2026-11-01", "the records statute", "undetermined"]);
  const resp = r.waits.find((x) => x.action === s.action && x.waiting === "response");
  assert.equal(resp.since, "2026-10-01"); assert.ok(resp.basis);
  assert.deepEqual(r.next.map((x) => [x.kind, x.at]), [["clock", "2026-11-01"]]);
  assert.deepEqual(r.overrides.map((x) => [x.action, x.reason, x.by, x.ground && x.ground.kind]),
    [[b.action, "the meeting is on Monday", V("bob"), "irreversible_act"]]);
  assert.deepEqual(r.declined.map((x) => [x.option, x.reason]), [[d, "too early to go public"]]);
  assert.deepEqual(r.set_aside.map((x) => [x.scenario, x.reason]), [[2, "we chose the quiet line"]]);
  assert.deepEqual(r.escalations.map((x) => [x.escalation, x.state, x.stage]).slice(0, 1), [["ESC-2026-0001-e", "open", 2]]);
  assert.deepEqual(r.holds.project.map((x) => [x.project, x.held, x.recorded_by]), [[w.P, true, V("bob")]]);
  assert.deepEqual(r.holds.due.map((x) => [x.action, x.ord]), [[s.action, w.dueOrd]], "the plan's actions' marks with no hold");
  assert.equal(r.watches.state, "undetermined", "no watch reader registered");
  assert.equal(r.matters.length, 3);
  /* every item names its source */
  for (const sec of ["matters", "waits", "next", "overrides", "declined", "set_aside", "escalations"])
    for (const x of r[sec]) assert.ok(x.source && x.source.module, `${sec}: ${JSON.stringify(x)}`);
  assert.deepEqual(w.snapshot(), rows, "a read writes nothing");
  assert.deepEqual(w.pw.whereItStands({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") }).holds.due.map((x) => x.action), [s.action]);
  assert.deepEqual(w.pw.whereItStands({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  /* an action the viewer may not see is withheld whole */
  w.hide(V("alice"), b.action);
  assert.doesNotMatch(JSON.stringify(w.pw.whereItStands({ plan: w.PL, viewer: V("alice") })), new RegExp(b.action));
});

test("R7: at start the module registers whereItStands with action-plans as the closing summary; the close keeps its answer frozen", () => {
  const { w } = setup();
  assert.deepEqual(w.pw.registered.close_snapshot, { ok: true, module: "plan-work" });
  /* action-plans' one registration: a second is refused */
  assert.equal(w.ap.registerCloseSnapshot("following", () => ({})).code, "LISTENER_DECLARED");
  const now = w.pw.whereItStands({ plan: w.PL, viewer: null });
  const c = w.ap.planClose({ id: w.PL, reason: "the hall is saved", ...by("bob") });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.summary.state, "stated"); assert.equal(c.summary.by, "plan-work");
  assert.deepEqual(c.summary.value.declined, now.declined);
  assert.deepEqual(c.summary.value.overrides, now.overrides);
  assert.equal(c.summary.value.state, "open", "read at the instant of closing, before the close landed");
  /* a later change does not alter the stored summary */
  const kept = w.ap.planRead({ id: w.PL, viewer: V("bob") }).closed.summary;
  assert.deepEqual(kept, c.summary);
  /* a plan the module cannot read throws, so action-plans stores the summary undetermined (its R44) */
  assert.throws(() => w.pw.closeSnapshot({ plan: "PLN-2026-0999-plan" }));
  /* holds read as undetermined when this host holds no hold reads */
  const w2 = world({ deps: { actionHolds: null } });
  assert.equal(w2.pw.whereItStands({ plan: w2.PL, viewer: V("bob") }).holds.state, "undetermined");
});

test("R8: statusReportDraft is a sourced list assembled from R7, labelled machine work; a draft carries no sentence that is not one of R7's items", () => {
  const { w } = setup();
  const r = w.pw.statusReportDraft({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") });
  const stands = w.pw.whereItStands({ plan: w.PL, nowMs: ms("2026-10-10T00:00:00Z"), viewer: V("bob") });
  assert.deepEqual(r.label, DRAFT_LABEL); assert.equal(r.label.machine_work, true);
  /* control: every item is one of R7's, whole, with its section */
  const fromR7 = [];
  for (const sec of ["matters", "waits", "next", "overrides", "declined", "set_aside", "escalations"])
    for (const x of stands[sec]) fromR7.push({ section: sec, ...x });
  for (const sec of ["holds", "watches"]) fromR7.push({ section: sec, ...stands[sec] });
  assert.deepEqual(r.items, fromR7);
  const keys = new Set(Object.keys(r));
  assert.deepEqual([...keys].sort(), ["as_of", "items", "label", "ok", "plan"], "no prose beside the items and the label");
  assert.deepEqual(w.pw.statusReportDraft({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
});

test("R8: statusReportSave keeps a member's report of 1 to 8,000 characters with the plan; never required, never published", () => {
  const { w } = setup();
  const save = (extra = {}) => w.pw.statusReportSave({ plan: w.PL, text: "Where we are: waiting on the clerk.", ...by("alice"), ...extra });
  assert.equal(code(save({ author: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.deepEqual(save(by("dave")), noSuchPlan(w.PL));
  for (const text of ["", "x".repeat(8001)]) assert.equal(code(save({ text })), "PLAN_WORK_TEXT_REFUSED");
  assert.equal(code(save({ from: "a\nb" })), "PLAN_WORK_TEXT_REFUSED");
  assert.equal(save({ text: "x".repeat(8000) }).ok, true);
  const r = save({ text: "Para one.\n\nPara two.", from: "2026-10-01T12:00:00Z" });
  assert.equal(r.ok, true);
  assert.deepEqual(w.pw.statusReports({ plan: w.PL, viewer: V("bob") }).reports.map((x) => [x.report, x.by, x.from]),
    [[1, V("alice"), null], [2, V("alice"), "2026-10-01T12:00:00Z"]]);
  /* never required: a plan with no report closes */
  const w2 = world();
  assert.equal(w2.ap.planClose({ id: w2.PL, reason: "done", ...by("bob") }).ok, true);
  assert.deepEqual(w2.pw.statusReportSave({ plan: w2.PL, text: "late", ...by("bob") }), refusePlanClosed(w2.PL));
});

test("R9: registerWatchReader takes one registration; its reader answers the plan's watches with their end dates, read by R7; a throwing reader reads undetermined", () => {
  const w = world();
  const seen = [];
  const reader = ({ plan, viewer }) => { seen.push([plan, viewer]); return [{ watch: "WCH-1", address: "the clerk's page", ends: "2027-01-01" }]; };
  assert.deepEqual(w.pw.registerWatchReader("following", reader), { ok: true, module: "following" });
  /* control: a second registration is refused */
  const again = w.pw.registerWatchReader("monitoring", () => []);
  assert.equal(code(again), "LISTENER_DECLARED"); assert.equal(again.check, MEMBERSHIP_CHECKS.LISTENER_DECLARED.check);
  assert.equal(code(w.pw.registerWatchReader("following", reader)), "LISTENER_DECLARED");
  const r = w.pw.whereItStands({ plan: w.PL, viewer: V("bob") });
  assert.deepEqual(r.watches, { state: "read", watches: [{ watch: "WCH-1", address: "the clerk's page", ends: "2027-01-01", source: { module: "following" } }] });
  assert.deepEqual(seen.at(-1), [w.PL, V("bob")]);
  const w2 = world();
  w2.pw.registerWatchReader("following", () => { throw new Error("down"); });
  assert.equal(w2.pw.whereItStands({ plan: w2.PL, viewer: V("bob") }).watches.state, "undetermined");
  const w3 = world();
  assert.equal(code(w3.pw.registerWatchReader("", reader)), "LISTENER_MALFORMED");
  assert.equal(code(w3.pw.registerWatchReader("following", null)), "LISTENER_MALFORMED");
});
