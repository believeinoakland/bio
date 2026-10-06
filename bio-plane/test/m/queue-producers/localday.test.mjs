/* R36 and R25 (C-3b; K1444 (iii); T33-81): every day this module derives or compares is the local day in the subject's zone,
   through civil-time, never the UTC day; with no zone held, the day and the age are undetermined, stated. Driven at
   feedItems' interface in a zone west of UTC at the day boundary, where the UTC day and the local day differ: the read's
   instant, 2026-09-01T00:00:00Z, is 2026-08-31 17:00 in Los Angeles. The zone is the one actions R12 reads (`actions.place()`'s
   `time_zone`), or the action item's own `zone` when its provider names one. Each case is checked against the reading the
   UTC day would have given, so a regression to UTC fails by name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW } from "./world.mjs";

const LA = "America/Los_Angeles";
const page = (items) => ({ ok: true, items, limit: 500, truncated: false, cursor: null });
const placeOf = (zone) => () => (zone === null ? { time_zone: null } : { time_zone: { value: zone, status: "ruled", basis: "TEST" } });
const notice = (id, status, extra = {}) => ({ notice: id, status, opened_at: "2026-05-01T10:00:00Z", revisions: [], attestations: [],
  level: null, next_monthly: null, lapse_date: null, missed_monthlies: [], ...extra });
const ms = (s) => Date.parse(s);

/* Every provider whose days R36 governs, answering one subject each; `zone` the instance's (null: none held). */
function zoned(zone, extra = {}) {
  const w = world({
    actions: { place: placeOf(zone) },
    actionClocks: {
      overdueClocks: () => page([
        { action: "ACT-1", ord: 0, date: "2026-08-29", basis: "b", text: "t", status: "pending", past: true, project: "PRJ-1",
          created_by: "alice", local_day: "2026-08-31" },
        { action: "ACT-2", ord: 0, date: "2026-08-29", basis: "b", text: "t", status: "pending", past: true, project: "PRJ-1",
          created_by: "alice", zone: "Asia/Tokyo", local_day: "2026-09-01" }]),
      remindersDue: () => page([
        { action: "ACT-1", ord: 0, date: "2026-09-12", basis: "b", text: "t", on: "2026-08-31", set_by: "alice", project: "PRJ-1" }]),
      calendarFactsRead: () => ({ ok: true, paths: [{ path: "profile:p/holidays/2025/*", actions: [{ action: "ACT-1", project: "PRJ-1", created_by: "alice" }] }],
                                  actions_limit: 500, truncated: false }),
    },
    actionPlans: { checkpointsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
      { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 1, phase: "day", set_by: "alice", due: "2026-08-28" },
      { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 1, phase: "instant", set_by: "alice", due: "2026-08-31T05:00:00Z" }] }) },
    localFacts: { factsDue: () => ({ ok: true, unknown: [], absent: [], due: [
      { path: "profile:p/holidays/2025/*", fact: { profile: "p", fact: "holidays", year: 2025 }, status: "unconfirmed", due: true,
        why: "w", latest: null, due_from: "2024-11-01" }] }) },
    networkNotices: { noticesOf: ({ project }) => ({ ok: true, project, sealed_weeks: [], methodVersion: 1, notices: project !== "PRJ-1" ? [] : [
      notice("WO-NEAR", "open", { lapse_date: "2026-09-07" }),
      notice("WO-EDGE", "open", { lapse_date: "2026-09-08" }),
      notice("WO-CLOSED", "closed", { attestations: [{ kind: "closed", as_of: "2026-08-02", json: {} }] })] }) },
    ...extra,
  });
  w.member("alice"); w.bundle("PRJ-1", "project"); w.bundle("ACT-1", "action"); w.bundle("ACT-2", "action");
  w.join("PRJ-1", "alice", { owner: true });
  return w;
}

test("R36: west of UTC at the day boundary, every day this module derives is the local day in the subject's zone, never the UTC day", () => {
  const m = byId(zoned(LA).read("alice"));
  /* R15: overdue from the first instant after the entry's local day; the UTC reading would say 2026-08-30T00:00:00Z, 2 days */
  const overdue = m["CONDITION::action-clock-overdue::ACT-1::0"];
  assert.deepEqual(overdue.age, { state: "determined", since: "2026-08-30T07:00:00Z", ms: NOW - ms("2026-08-30T07:00:00Z"), days: 1 },
    "R15's age: from local midnight after 2026-08-29 in Los Angeles; one local day, 2026-08-30 to 2026-08-31");
  assert.equal(overdue.basis.zone, LA, "the zone the day was taken in is stated");
  /* R15: an action whose provider names its own zone is aged in that zone, not the instance's */
  const tokyo = m["CONDITION::action-clock-overdue::ACT-2::0"];
  assert.deepEqual(tokyo.age, { state: "determined", since: "2026-08-29T15:00:00Z", ms: NOW - ms("2026-08-29T15:00:00Z"), days: 2 },
    "the item's own zone first: local midnight after 2026-08-29 in Tokyo; 2026-08-30 to 2026-09-01");
  assert.equal(tokyo.basis.zone, "Asia/Tokyo");
  /* R16: a checkpoint's day ages from its first local instant; one stated as an instant is read on its local day */
  const day = m["OBLIGATION::plan-checkpoint-due::PLN-1::1::day"];
  assert.deepEqual(day.age, { state: "determined", since: "2026-08-28T07:00:00Z", ms: NOW - ms("2026-08-28T07:00:00Z"), days: 3 });
  const inst = m["OBLIGATION::plan-checkpoint-due::PLN-1::1::instant"];
  assert.deepEqual(inst.age, { state: "determined", since: "2026-08-31T05:00:00Z", ms: NOW - ms("2026-08-31T05:00:00Z"), days: 1 },
    "2026-08-31T05:00Z is 2026-08-30 in Los Angeles: one local day to 2026-08-31 (the UTC day would say none)");
  /* R18: the reminder's day ages from its first local instant; the UTC reading would say 2026-08-31T00:00:00Z, a full day */
  const reminder = m["OBLIGATION::action-reminder::ACT-1::0::2026-08-31"];
  assert.deepEqual(reminder.age, { state: "determined", since: "2026-08-31T07:00:00Z", ms: 17 * 3600000, days: 0 },
    "the reminder's day has come in Los Angeles seventeen hours ago, no whole day");
  /* R21: the day a fact fell due is a local day of its profile's zone */
  const fact = m["OBLIGATION::local-fact-due::profile:p/holidays/2025/*::unconfirmed"];
  assert.deepEqual(fact.age, { state: "determined", since: "2024-11-01T07:00:00Z", ms: NOW - ms("2024-11-01T07:00:00Z"), days: 668 });
  /* R27: the lapse window opens 7 local days before the lapse; the local day is 2026-08-31, so a lapse on 2026-09-08 is not
     yet within it (the UTC day, 2026-09-01, would have raised it), and one on 2026-09-07 is */
  assert.ok(m["CONDITION::notice-lapse-near::WO-NEAR"], "a lapse within 7 local days");
  assert.deepEqual(m["CONDITION::notice-lapse-near::WO-NEAR"].age,
    { state: "determined", since: "2026-08-31T07:00:00Z", ms: 17 * 3600000, days: 0 }, "aged from the local day the window opened");
  assert.equal(m["CONDITION::notice-lapse-near::WO-EDGE"], undefined, "8 local days away: not yet within the window");
  /* R27: 30 local days from a closing stated only as a day: 2026-08-02 to 2026-08-31 is 29, so it stands (UTC: 30, gone) */
  assert.deepEqual(m["CONDITION::notice-project-closed::WO-CLOSED"].age,
    { state: "determined", since: "2026-08-02T07:00:00Z", ms: NOW - ms("2026-08-02T07:00:00Z"), days: 29 });
  /* one local day later, the edge cases turn */
  const later = byId(zoned(LA).read("alice", "member:alice", { now: ms("2026-09-01T07:00:00Z") }));
  assert.ok(later["CONDITION::notice-lapse-near::WO-EDGE"], "at local midnight of 2026-09-01 the window opens");
  assert.equal(later["CONDITION::notice-project-closed::WO-CLOSED"], undefined, "and the thirtieth local day has come");
  assert.equal(later["CONDITION::action-clock-overdue::ACT-1::0"].age.days, 2);
});

test("R25: an item's due is the local day in the subject's zone, YYYY-MM-DD: the clock entry's date as the action's local day, a checkpoint's instant read on its local day", () => {
  const m = byId(zoned(LA).read("alice"));
  assert.equal(m["CONDITION::action-clock-overdue::ACT-1::0"].due, "2026-08-29", "R15: the entry's date, a local day of the action's zone");
  assert.equal(m["OBLIGATION::action-reminder::ACT-1::0::2026-08-31"].due, "2026-09-12", "R18: the entry's date, not the reminder's day");
  assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::day"].due, "2026-08-28", "R16: a checkpoint stated as a day");
  assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::instant"].due, "2026-08-30",
    "R16: 2026-08-31T05:00:00Z is 2026-08-30 in the instance profile's zone, never the UTC day 2026-08-31");
  assert.equal(byId(zoned("Asia/Tokyo").read("alice"))["OBLIGATION::plan-checkpoint-due::PLN-1::1::instant"].due, "2026-08-31");
  const carrying = Object.values(m).filter((i) => "due" in i).map((i) => i.kind);
  assert.deepEqual([...new Set(carrying)].sort(), ["action-clock-overdue", "action-reminder", "plan-checkpoint-due"],
    "no other item this module produces carries due");
});

test("R36: with no zone held, the day and the age are undetermined, stated, never computed on UTC", () => {
  for (const zone of [null, "Mars/Olympus_Mons"]) {
    const m = byId(zoned(zone).read("alice"));
    const why = (it) => [it.age.state, it.age.reason];
    const undetermined = ["undetermined", "zone_undetermined"];
    assert.deepEqual(why(m["CONDITION::action-clock-overdue::ACT-1::0"]), undetermined, `${zone}: R15's age`);
    assert.match(m["CONDITION::action-clock-overdue::ACT-1::0"].age.detail, /never counted on the UTC day/);
    assert.equal(m["CONDITION::action-clock-overdue::ACT-1::0"].basis.zone, null, "no zone is stated as none");
    assert.equal(m["CONDITION::action-clock-overdue::ACT-1::0"].due, "2026-08-29", "the entry's date is already the action's local day");
    assert.deepEqual(m["CONDITION::action-clock-overdue::ACT-2::0"].age.days, 2, "an item naming its own zone is aged in it still");
    assert.deepEqual(why(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::day"]), undetermined, `${zone}: R16's age`);
    assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::day"].due, "2026-08-28", "a checkpoint stated as a day keeps its day");
    assert.deepEqual(why(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::instant"]), undetermined);
    assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::instant"].due, null, "an instant has no local day without a zone");
    assert.deepEqual(why(m["OBLIGATION::action-reminder::ACT-1::0::2026-08-31"]), undetermined, `${zone}: R18's age`);
    assert.deepEqual(why(m["OBLIGATION::local-fact-due::profile:p/holidays/2025/*::unconfirmed"]), undetermined, `${zone}: R21's age`);
    /* R27: no item is withheld for want of a zone: the lapse window is read at the latest local day any zone has reached */
    assert.ok(m["CONDITION::notice-lapse-near::WO-EDGE"], "possibly within 7 days somewhere: raised, its age undetermined");
    assert.deepEqual(why(m["CONDITION::notice-lapse-near::WO-EDGE"]), undetermined);
    assert.ok(m["CONDITION::notice-project-closed::WO-CLOSED"], "a closing stated as a day stands while its 30 days cannot be counted");
    assert.deepEqual(why(m["CONDITION::notice-project-closed::WO-CLOSED"]), undetermined);
    assert.ok(!JSON.stringify(Object.values(m).map((i) => i.age)).includes("T00:00:00Z"), "no age is dated at a UTC midnight");
  }
});

test("R15 (K1658): the overdue item states action-clocks' local day and the entry's basis kind, and counts the entries left out for want of a zone across every page read", () => {
  const basisOf = { kind: "rule", citation: "Gov. Code 7922.535" };
  const entry = { action: "ACT-1", ord: 0, date: "2026-08-29", basis: "b", text: "t", status: "pending", past: true, project: "PRJ-1",
    created_by: "alice", local_day: "2026-08-31", basis_of: basisOf };
  const w = zoned(LA, { actionClocks: {
    overdueClocks: (a) => (a.after
      ? { ...page([{ ...entry, ord: 1 }]), zone_undetermined: 3 }
      : { ...page([entry]), truncated: true, cursor: "ACT-1#0", zone_undetermined: 2 }),
    remindersDue: () => page([]), calendarFactsRead: () => ({ ok: true, paths: [], actions_limit: 500, truncated: false }) } });
  const it = byId(w.read("alice"))["CONDITION::action-clock-overdue::ACT-1::0"];
  assert.equal(it.basis.local_day, "2026-08-31", "the action's local day the entry was judged past on");
  assert.deepEqual(it.basis.basis_of, basisOf, "its basis kind (action-clocks R7), as the provider names it");
  assert.equal(it.basis.bound.zone_undetermined, 5, "pending entries of actions with no zone held, left out: 2 + 3, stated, never judged on UTC");
  assert.equal(byId(w.read("alice"))["CONDITION::action-clock-overdue::ACT-1::1"].basis.bound.zone_undetermined, 5);
});

test("R15, R18 (N609; K1675): each item's days are read in its own zone as action-clocks carries it, else in actions' zone; the zone is stated", () => {
  const tokyo = { action: "ACT-2", ord: 0, date: "2026-09-12", basis: "b", text: "t", on: "2026-08-31", set_by: "alice", project: "PRJ-1",
    zone: "Asia/Tokyo" };
  for (const instance of [LA, null]) {
    const w = zoned(instance, { actionClocks: {
      overdueClocks: () => page([{ action: "ACT-2", ord: 0, date: "2026-08-29", basis: "b", text: "t", status: "pending", past: true,
        project: "PRJ-1", created_by: "alice", zone: "Asia/Tokyo", local_day: "2026-09-01" }]),
      remindersDue: () => page([tokyo, { ...tokyo, action: "ACT-1", zone: undefined }]),
      calendarFactsRead: () => ({ ok: true, paths: [], actions_limit: 500, truncated: false }) } });
    const m = byId(w.read("alice"));
    /* R18: the reminder's day 2026-08-31 begins at 2026-08-30T15:00Z in Tokyo; Tokyo's day at the read is 2026-09-01 */
    const own = m["OBLIGATION::action-reminder::ACT-2::0::2026-08-31"];
    assert.deepEqual(own.age, { state: "determined", since: "2026-08-30T15:00:00Z", ms: NOW - ms("2026-08-30T15:00:00Z"), days: 1 },
      `${instance}: R18 reads the reminder's own zone`);
    assert.equal(own.basis.zone, "Asia/Tokyo");
    assert.equal(own.due, "2026-09-12", "the entry's date, a local day of that zone, carried as it is");
    /* R15: the overdue entry, aged in its own zone whatever the instance's */
    assert.equal(m["CONDITION::action-clock-overdue::ACT-2::0"].basis.zone, "Asia/Tokyo");
    assert.equal(m["CONDITION::action-clock-overdue::ACT-2::0"].age.since, "2026-08-29T15:00:00Z");
    /* an item carrying no zone falls back to actions' zone, and with none held its age is undetermined */
    const fallback = m["OBLIGATION::action-reminder::ACT-1::0::2026-08-31"];
    assert.equal(fallback.basis.zone, instance);
    if (instance) assert.equal(fallback.age.since, "2026-08-31T07:00:00Z");
    else assert.deepEqual([fallback.age.state, fallback.age.reason], ["undetermined", "zone_undetermined"]);
  }
});
