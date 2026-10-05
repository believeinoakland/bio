/* civil-time at its interface: bounded recurrences (R20, with R25's trace) and fiscal periods (R21), in each
 * profile's zone and on each profile's fiscal-year facts (R27). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { expandRecurrence, fiscalPeriod } from "../../../src/civil-time/index.mjs";
import { firstView, testView, day, minute } from "./helpers.mjs";

const LA = firstView().time_zone.value, HFX = testView().time_zone.value;
const ex = (rrule, dtstart, zone, from, to) => {
  const r = expandRecurrence({ rrule, dtstart, zone, from, to });
  assert.ok(Array.isArray(r.instances), JSON.stringify(r));
  return r;
};
const values = (r) => r.instances.map((i) => i.value);

test("R20 WEEKLY with INTERVAL and BYDAY, wall time kept across daylight-saving changes in both profiles' zones", () => {
  for (const zone of [LA, HFX]) {
    const r = ex("FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH", "2026-10-06T18:00", zone, "2026-10-01", "2026-11-30");
    assert.deepEqual(values(r), ["2026-10-06T18:00", "2026-10-08T18:00", "2026-10-20T18:00", "2026-10-22T18:00",
      "2026-11-03T18:00", "2026-11-05T18:00", "2026-11-17T18:00", "2026-11-19T18:00"], zone);
    assert.equal(r.truncated, false);
    assert.ok(r.instances.every((i) => i.precision === "minute" && i.zone === zone));
  }
  const la = ex("FREQ=WEEKLY;BYDAY=TU", "2026-10-27T18:00", LA, "2026-10-01", "2026-11-09");
  assert.deepEqual(la.instances.map((i) => i.instant), ["2026-10-28T01:00:00Z", "2026-11-04T02:00:00Z"], "the UTC instant moves; the wall time does not");
  /* no BYDAY: dtstart's weekday */
  assert.deepEqual(values(ex("FREQ=WEEKLY", "2026-10-07T09:00", HFX, "2026-10-01", "2026-10-22")), ["2026-10-07T09:00", "2026-10-14T09:00", "2026-10-21T09:00"]);
});

test("R20 MONTHLY with ordinal BYDAY, BYMONTHDAY (negative too) and BYSETPOS; YEARLY; a wall time the clocks skip moves past the gap", () => {
  assert.deepEqual(values(ex("FREQ=MONTHLY;BYDAY=1TU,3TU", "2026-01-06T18:00", LA, "2026-10-01", "2026-12-31")),
    ["2026-10-06T18:00", "2026-10-20T18:00", "2026-11-03T18:00", "2026-11-17T18:00", "2026-12-01T18:00", "2026-12-15T18:00"]);
  assert.deepEqual(values(ex("FREQ=MONTHLY;BYDAY=-1FR", "2026-01-30T10:00", HFX, "2026-09-01", "2026-12-31")),
    ["2026-09-25T10:00", "2026-10-30T10:00", "2026-11-27T10:00", "2026-12-25T10:00"]);
  assert.deepEqual(values(ex("FREQ=MONTHLY;BYMONTHDAY=15,-1", "2026-01-15T09:00", LA, "2026-01-01", "2026-03-31")),
    ["2026-01-15T09:00", "2026-01-31T09:00", "2026-02-15T09:00", "2026-02-28T09:00", "2026-03-15T09:00", "2026-03-31T09:00"]);
  /* the last weekday of each month */
  assert.deepEqual(values(ex("FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1", "2026-01-30T17:00", LA, "2026-01-01", "2026-06-01")),
    ["2026-01-30T17:00", "2026-02-27T17:00", "2026-03-31T17:00", "2026-04-30T17:00", "2026-05-29T17:00"]);
  /* a 31st: months without one are skipped (RFC 5545) */
  assert.deepEqual(values(ex("FREQ=MONTHLY", "2026-01-31T09:00", LA, "2026-01-01", "2026-06-01")), ["2026-01-31T09:00", "2026-03-31T09:00", "2026-05-31T09:00"]);
  /* YEARLY: Feb 29 only in leap years; BYDAY with an ordinal in the year */
  assert.deepEqual(values(ex("FREQ=YEARLY", "2024-02-29T12:00", LA, "2024-01-01", "2025-12-31")), ["2024-02-29T12:00"]);
  assert.deepEqual(values(ex("FREQ=YEARLY;BYDAY=1MO", "2026-01-05T12:00", HFX, "2026-01-01", "2027-12-31")), ["2026-01-05T12:00", "2027-01-04T12:00"]);
  /* 02:30 on the spring change does not occur: the instance is the time after the gap */
  const gap = ex("FREQ=WEEKLY;BYDAY=SU", "2026-03-01T02:30", LA, "2026-03-01", "2026-03-16");
  assert.deepEqual(values(gap), ["2026-03-01T02:30", "2026-03-08T03:30", "2026-03-15T02:30"]);
  assert.match(gap.trace.notes.join(" "), /does not occur/);
});

test("R20 EXDATE and UNTIL; at most 24 months after from or 500 instances, whichever first, truncated: true", () => {
  assert.deepEqual(values(ex("FREQ=WEEKLY;BYDAY=TU;EXDATE=20261013T180000", "2026-10-06T18:00", LA, "2026-10-01", "2026-10-31")),
    ["2026-10-06T18:00", "2026-10-20T18:00", "2026-10-27T18:00"]);
  assert.deepEqual(values(ex("RRULE:FREQ=WEEKLY;BYDAY=TU\nEXDATE:20261020", "2026-10-06T18:00", LA, "2026-10-01", "2026-10-31")),
    ["2026-10-06T18:00", "2026-10-13T18:00", "2026-10-27T18:00"]);
  assert.deepEqual(values(ex("FREQ=WEEKLY;BYDAY=TU;UNTIL=20261020T235959Z", "2026-10-06T18:00", LA, "2026-10-01", "2026-12-31")),
    ["2026-10-06T18:00", "2026-10-13T18:00"]);
  assert.deepEqual(values(ex("FREQ=WEEKLY;BYDAY=TU;UNTIL=20261020", "2026-10-06T18:00", LA, "2026-10-01", "2026-12-31")),
    ["2026-10-06T18:00", "2026-10-13T18:00", "2026-10-20T18:00"]);
  /* 24 months */
  const long = ex("FREQ=MONTHLY;BYMONTHDAY=1", "2020-01-01T09:00", LA, "2026-10-01", "2035-01-01");
  assert.equal(long.truncated, true);
  assert.equal(long.instances.length, 24);
  assert.equal(long.instances[0].value, "2026-10-01T09:00");
  assert.equal(long.instances.at(-1).value, "2028-09-01T09:00");
  /* 500 instances */
  const daily = ex("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU", "2026-01-01T09:00", HFX, "2026-01-01", "2027-12-31");
  assert.equal(daily.instances.length, 500);
  assert.equal(daily.truncated, true);
  /* within both limits: not truncated */
  assert.equal(ex("FREQ=MONTHLY;BYMONTHDAY=1", "2026-01-01T09:00", LA, "2026-01-01", "2026-12-31").truncated, false);
  assert.ok(long.trace.runtime && typeof long.trace.runtime.tz === "string", "R25: the trace");
});

test("R20 any other part is refused RRULE_UNSUPPORTED, naming it; a malformed rule DATE_INVALID; an unknown zone ZONE_INVALID", () => {
  for (const [rule, part] of [["FREQ=DAILY", "FREQ=DAILY"], ["FREQ=HOURLY", "FREQ=HOURLY"], ["FREQ=WEEKLY;COUNT=5", "COUNT"], ["FREQ=YEARLY;BYMONTH=3", "BYMONTH"],
    ["FREQ=WEEKLY;BYHOUR=9", "BYHOUR"], ["FREQ=WEEKLY;WKST=SU", "WKST"], ["FREQ=MONTHLY;BYYEARDAY=1", "BYYEARDAY"], ["FREQ=MONTHLY;BYWEEKNO=1", "BYWEEKNO"],
    ["FREQ=WEEKLY;BYMINUTE=0", "BYMINUTE"], ["FREQ=WEEKLY;BYSECOND=0", "BYSECOND"], ["FREQ=WEEKLY;RDATE=20261001", "RDATE"]]) {
    const r = expandRecurrence({ rrule: rule, dtstart: "2026-10-06T18:00", zone: LA, from: "2026-10-01", to: "2026-12-31" });
    assert.equal(r.refused, "RRULE_UNSUPPORTED", rule);
    assert.match(r.why, new RegExp(part), rule);
  }
  for (const rule of ["", "BYDAY=TU", "FREQ=WEEKLY;INTERVAL=0", "FREQ=WEEKLY;BYDAY=XX", "FREQ=WEEKLY;BYDAY=1TU", "FREQ=MONTHLY;BYMONTHDAY=0", "FREQ=WEEKLY;UNTIL=2026",
    "FREQ=WEEKLY;FREQ=WEEKLY", "FREQ=WEEKLY;BYSETPOS=0", "FREQ"])
    assert.equal(expandRecurrence({ rrule: rule, dtstart: "2026-10-06T18:00", zone: LA, from: "2026-10-01", to: "2026-12-31" }).refused, "DATE_INVALID", rule);
  assert.equal(expandRecurrence({ rrule: "FREQ=WEEKLY", dtstart: "2026-10-06T18:00", zone: "Moon/Base", from: "2026-10-01", to: "2026-12-31" }).refused, "ZONE_INVALID");
  assert.throws(() => expandRecurrence({ rrule: "FREQ=WEEKLY", zone: LA, from: "2026-10-01", to: "2026-12-31" }), TypeError);
});

test("R21 fiscalPeriod: the fiscal year holding a date under the body's fiscal_year fact, with start and end days; none held, or a band across two, undetermined", () => {
  const v = firstView(), t = testView();
  assert.deepEqual(fiscalPeriod({ date: day("2026-10-05", LA), body: "Oakland City Council", view: v }), { label: "FY2026-27", start: "2026-07-01", end: "2027-06-30" });
  assert.deepEqual(fiscalPeriod({ date: day("2026-06-30", LA), body: "Oakland City Council", view: v }), { label: "FY2025-26", start: "2025-07-01", end: "2026-06-30" });
  assert.deepEqual(fiscalPeriod({ date: "2026-07-01", body: "any body", view: v }), { label: "FY2026-27", start: "2026-07-01", end: "2027-06-30" });
  /* the local day governs: 2026-07-01T05:00Z is still 06-30 in LA */
  assert.equal(fiscalPeriod({ date: { value: "2026-07-01T05:00:00", precision: "second", zone: "UTC" }, body: "x", view: v }).label, "FY2026-27");
  assert.equal(fiscalPeriod({ date: minute("2026-06-30T22:00", LA), body: "x", view: v }).label, "FY2025-26");
  /* the test profile: April, named by its start, for the Selectboard only */
  assert.deepEqual(fiscalPeriod({ date: day("2026-03-31", HFX), body: "Port Ellery Selectboard", view: t }), { label: "FY2025", start: "2025-04-01", end: "2026-03-31" });
  assert.deepEqual(fiscalPeriod({ date: day("2026-04-01", HFX), body: "Port Ellery Selectboard", view: t }), { label: "FY2026", start: "2026-04-01", end: "2027-03-31" });
  const none = fiscalPeriod({ date: day("2026-04-01", HFX), body: "Port Ellery Harbour District", view: t });
  assert.equal(none.undetermined, true);
  assert.match(none.why, /fiscal year for Port Ellery Harbour District/);
  /* EDTF across two fiscal years */
  const two = fiscalPeriod({ date: { value: "2026", precision: "edtf", zone: LA }, body: "x", view: v });
  assert.equal(two.undetermined, true);
  assert.deepEqual(two.candidates.map((c) => c.label), ["FY2025-26", "FY2026-27"]);
  assert.equal(fiscalPeriod({ date: { value: "2026-08", precision: "edtf", zone: LA }, body: "x", view: v }).label, "FY2026-27");
  /* withheld as a conflict */
  const c = firstView(); delete c.fiscal_year; c.conflicts = [{ at: "fiscal_year", values: [], says: "disagree" }];
  assert.match(fiscalPeriod({ date: day("2026-10-05", LA), body: "x", view: c }).why, /withheld/);
  assert.throws(() => fiscalPeriod({ date: day("2026-10-05", LA), view: v }), TypeError);
});
