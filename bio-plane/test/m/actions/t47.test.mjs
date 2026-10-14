/* actions' T47 entry at its interface (T47-38; N960; K3027 doubt 12): R100, `actionZone(fm, view)`, the one zone an
   action's clock is read in, and R12, R25, R51, R92 and R98 each judged in it. The worlds hold two active profiles of
   different zones (the test profile's America/Halifax, UTC-3 in September, and oakland-alameda's America/Los_Angeles,
   UTC-7), so the combined view states no zone of its own (`zoneOf(place())` is null) and only the profile that gives
   the action's office or venue can. Each arm beside its control: with one active profile R100 equals `zoneOf(place())`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const M = V("alice");
const TWO = ["test-port-ellery", "oakland-alameda"];
const view = (ids) => combine(ids).view;
const HALIFAX = "America/Halifax", LA = "America/Los_Angeles";
/* An office the test profile gives (Halifax), one oakland-alameda gives (Los Angeles), and one no profile gives. */
const office = (role, body) => ["counterparty:", "  state: named", `  role: ${role}`, `  body: ${body}`];
const HAL = office("Town Clerk", "City of Port Ellery");
const LAX = office("Controller", "Finance Department");
const NONE = office("Town Clerk", "Town of Port Ellery");
const UNDET = ["counterparty:", "  state: undetermined", "  basis: not yet known"];
const fm = (cp, kind = "other") => {
  const o = { action_kind: kind };
  if (cp === UNDET) o.counterparty = { state: "undetermined", basis: "not yet known" };
  else o.counterparty = { state: "named", role: cp[2].slice(8), body: cp[3].slice(8) };
  return o;
};
/* A pending entry due on 28 September. */
const DUE = ["clock:", '  - text: "reply"', '    description: "d"', "    date: 2026-09-28", "    basis: Act s.2", "    status: pending"];
/* 22:00 on the 28th in Los Angeles, 02:00 on the 29th in Halifax; then 01:00 on the 29th in Los Angeles. */
const BETWEEN = Date.parse("2026-09-29T05:00:00Z"), AFTER = Date.parse("2026-09-29T08:00:00Z");

test("R100 actionZone is a module-level function: the zone of the active profile that gives the action's office, or its kind's venue, else the view's own; null with none held; it never throws", () => {
  assert.equal(typeof actions.actionZone, "function");
  const two = view(TWO);
  assert.equal(actions.zoneOf(two), null, "two profiles of different zones: the combined view withholds its zone");
  assert.equal(actions.actionZone(fm(HAL), two), HALIFAX, "an office the test profile gives");
  assert.equal(actions.actionZone(fm(LAX), two), LA, "an office the second profile gives: the second's zone");
  assert.equal(actions.actionZone({ ...fm(LAX), counterparty: { state: "named", kind: "office", role: "Controller" } }, two), LA,
    "an office stating no body is matched by its role");
  assert.equal(actions.actionZone(fm(NONE), two), null, "an office no profile gives, and no zone the view states");
  assert.equal(actions.actionZone(fm(UNDET, "bylaw_complaint"), two), HALIFAX, "a kind whose venue the test profile gives");
  assert.equal(actions.actionZone(fm(UNDET, "records_petition"), two), LA, "a kind whose venue the second profile gives");
  assert.equal(actions.actionZone(fm(UNDET, "other"), two), null, "no office and no venue");
  const press = { action_kind: "media", counterparty: { state: "named", kind: "press", role: "Controller", organisation: "Finance Department" } };
  assert.equal(actions.actionZone(press, two), null, "a press addressee is no office");
  /* the control: one active profile; every action reads the view's own zone, as zoneOf(place()) does */
  for (const ids of [["test-port-ellery"], ["oakland-alameda"]]) {
    const one = view(ids);
    for (const f of [fm(HAL), fm(LAX), fm(NONE), fm(UNDET), fm(UNDET, "bylaw_complaint"), {}, null])
      assert.equal(actions.actionZone(f, one), actions.zoneOf(one), `${ids} ${JSON.stringify(f)}`);
  }
  for (const v of [null, undefined, "", "America/Halifax", 7, []]) assert.equal(actions.actionZone(fm(HAL), v), null, String(v));
  const hostile = new Proxy({}, { get() { throw new Error("no"); } });
  assert.doesNotThrow(() => actions.actionZone(hostile, two));
  assert.doesNotThrow(() => actions.actionZone(fm(HAL), hostile));
  assert.equal(actions.actionZone(fm(HAL), hostile), null);
  /* the view this module reads (R10) is the one handed: the instance's own answers the same */
  const w = world({ profiles: TWO });
  assert.equal(actions.zoneOf(w.a.place()), null);
  assert.equal(actions.actionZone(fm(LAX), w.a.governingView()), LA);
  assert.equal(actions.actionZone(fm(LAX), world().a.governingView()), actions.zoneOf(world().a.place()));
});

test("R100 R12 actionFacts' clock_overdue is judged in the action's zone: an office the second profile gives reads the second's local day, where zoneOf(place()) is null", () => {
  const w = world({ profiles: TWO });
  const lax = actionMd(A, [...LAX, "action_kind: other", ...DUE]), hal = actionMd(B, [...HAL, "action_kind: other", ...DUE]);
  const v = w.a.governingView();
  assert.equal(actions.actionFacts(lax, BETWEEN, v).clock_overdue, false, "still the 28th in Los Angeles");
  assert.equal(actions.actionFacts(hal, BETWEEN, v).clock_overdue, true, "already the 29th in Halifax");
  assert.equal(actions.actionFacts(lax, AFTER, v).clock_overdue, true, "the 29th in Los Angeles");
  /* the facts retrieval projects are the same read */
  const facts = w.reg.facts[0].fn;
  assert.deepEqual([facts(lax, BETWEEN).clock_overdue, facts(hal, BETWEEN).clock_overdue, facts(lax, AFTER).clock_overdue],
    [false, true, true]);
  /* the group's zone alone (R68) states none: undetermined, never the UTC day */
  assert.equal(actions.actionFacts(lax, BETWEEN, actions.zoneOf(w.a.place())).clock_overdue, null);
  assert.equal(facts(actionMd(C, [...NONE, "action_kind: other", ...DUE]), AFTER).clock_overdue, null, "no zone held for it");
  /* the control: one profile, the same answer as its zone */
  const one = world();
  const p = one.a.place();
  for (const at of [BETWEEN, AFTER])
    assert.equal(one.reg.facts[0].fn(lax, at).clock_overdue, actions.actionFacts(lax, at, actions.zoneOf(p)).clock_overdue);
});

test("R100 R25 R92 the read's clock_overdue and lifecycle day, and openItemsWith's clock_overdue, are read in the action's zone", () => {
  const w = world({ profiles: TWO });
  assert.equal(w.promote(A, actionMd(A, [...LAX, "action_kind: other", ...DUE])).ok, true);
  assert.equal(w.promote(B, actionMd(B, [...LAX, "action_kind: other"])).ok, true);
  assert.equal(w.a.actionLaws({ target: A, laws: [{ level: "city", citation: "Code s.1" }], viewer: M, author: M }).ok, true);
  const sent = w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-01", account: "we sent it", dueBy: "2026-09-28",
                                      dueCite: "Code s.1", viewer: M, author: M });
  assert.equal(sent.ok, true, JSON.stringify(sent).slice(0, 300));
  const due = (r) => r.lifecycle.entries.find((e) => e.ord === 0).due.status;
  const early = w.a.actionRead({ id: A, viewer: M, now: BETWEEN });
  assert.deepEqual([early.ok, early.clock_overdue, due(early)], [true, false, "open"], "the 28th in Los Angeles");
  const late = w.a.actionRead({ id: A, viewer: M, now: AFTER });
  assert.deepEqual([late.clock_overdue, due(late)], [true, "passed_unanswered"], "the 29th in Los Angeles");
  w.clock.ms = BETWEEN;
  assert.equal(w.a.openItemsWith({ action: B, viewer: M }).items.find((x) => x.action === A).clock_overdue, false);
  w.clock.ms = AFTER;
  const open = w.a.openItemsWith({ action: B, viewer: M });
  assert.deepEqual([open.items.find((x) => x.action === A).clock_overdue, open.overdue_replies], [true, 1]);
  /* the control: an office no profile gives reads no zone, so its clock is undetermined, never the UTC day */
  assert.equal(w.promote(C, actionMd(C, [...NONE, "action_kind: other", ...DUE])).ok, true);
  assert.equal(w.a.actionRead({ id: C, viewer: M, now: AFTER }).clock_overdue, null);
});

test("R100 R51 the audit's action arm is handed the action's zone: a pending entry is past its date on that local day", () => {
  const w = world({ profiles: TWO });
  const image = (md) => ({ files: new Map([["bundle.md", md]]) });
  const past = (md) => w.a.audit(image(md)).some((f) => /2026-09-28/.test(String(f.message)) && /past|overdue|passed/i.test(String(f.message)));
  w.clock.ms = BETWEEN;
  const lax = actionMd(A, [...LAX, "action_kind: other", ...DUE]), hal = actionMd(B, [...HAL, "action_kind: other", ...DUE]);
  assert.equal(past(lax), false, "still the 28th in Los Angeles");
  assert.equal(past(hal), true, "the 29th in Halifax");
  w.clock.ms = AFTER;
  assert.equal(past(lax), true, "the 29th in Los Angeles");
});

test("R100 R98 R33 the mechanical clock write judges a timed entry, and a date-only entry, in the action's zone; refused before it, moved after", () => {
  const w = world({ profiles: TWO });
  const recheck = { writer: "mechanical", operation: "deadline-recheck" };
  const overdue = (id) => w.promote(id, w.text(id).replace("status: pending", "status: overdue"), { author: MACHINE, extra: recheck });
  assert.equal(w.promote(A, actionMd(A, [...LAX, "action_kind: other", ...DUE, "    due_at: 2026-09-28T17:00"])).ok, true);
  assert.equal(w.promote(B, actionMd(B, [...LAX, "action_kind: other", ...DUE])).ok, true);
  w.clock.ms = Date.parse("2026-09-28T23:59:00Z");        /* 16:59 in Los Angeles; 20:59 in Halifax */
  assert.equal(overdue(A).reason, "CLOCK_STATUS_NOT_MECHANICAL", "17:00 in Los Angeles has not passed");
  w.clock.ms = Date.parse("2026-09-29T00:00:00Z");
  assert.equal(overdue(A).ok, true, "17:00 in Los Angeles has passed");
  w.clock.ms = BETWEEN;
  assert.equal(overdue(B).reason, "CLOCK_STATUS_NOT_MECHANICAL", "a date only: still the 28th in Los Angeles");
  w.clock.ms = AFTER;
  assert.equal(overdue(B).ok, true, "a date only: the 29th in Los Angeles");
});
