/* civil-time at its interface: local days, bounds, EDTF, comparison, calendar dates, day ranges, the zone-less join
 * and validity (R1–R8, R22, R23). The zones used are the two profiles' (`time_zone`) and zones whose changes fall at
 * midnight or by half an hour, so no answer can rest on a zone's habits. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { localDay, bounds, parseEdtf, compare, isCalendarDate, dayRange, joinLocal, validAt } from "../../../src/civil-time/index.mjs";
import { firstView, testView, day, minute } from "./helpers.mjs";

const LA = firstView().time_zone.value, HFX = testView().time_zone.value;
const ZONES = [LA, HFX, "UTC", "Australia/Sydney", "America/Santiago", "Australia/Lord_Howe", "Asia/Kolkata", "Pacific/Chatham"];
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
/* An independent reading of a local day: the runtime's own calendar formatting. */
const oracleDay = (ms, zone) => new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));

test("R1 localDay: every half hour of 2026 in eight zones falls on the day the runtime's calendar names, across every daylight-saving change", () => {
  const t0 = Date.UTC(2026, 0, 1), t1 = Date.UTC(2027, 0, 1);
  for (const z of ZONES) for (let t = t0; t < t1; t += 1800e3) assert.equal(localDay(iso(t), z), oracleDay(t, z), `${iso(t)} in ${z}`);
  /* the seconds either side of local midnight, on change days */
  assert.equal(localDay("2026-03-08T07:59:59Z", LA), "2026-03-07");
  assert.equal(localDay("2026-03-08T08:00:00Z", LA), "2026-03-08");
  assert.equal(localDay("2026-11-02T07:59:59Z", LA), "2026-11-01");
  assert.equal(localDay("2026-11-02T08:00:00Z", LA), "2026-11-02");
  assert.equal(localDay("2026-09-06T03:59:59Z", "America/Santiago"), "2026-09-05");
  assert.equal(localDay("2026-09-06T04:00:00Z", "America/Santiago"), "2026-09-06");
});

test("R1 localDay: an unknown zone is refused ZONE_INVALID; a malformed instant DATE_INVALID; a wrong type throws TypeError", () => {
  for (const z of ["Mars/Olympus", "", "+05:00", "PST8PDT/x", "America/"]) assert.equal(localDay("2026-10-05T12:00:00Z", z).refused, "ZONE_INVALID", z);
  for (const s of ["2026-10-05", "2026-10-05T12:00:00", "2026-10-05T12:00:00.000Z", "2026-13-05T12:00:00Z", "2026-02-30T12:00:00Z", "2026-10-05T24:00:00Z"])
    assert.equal(localDay(s, LA).refused, "DATE_INVALID", s);
  assert.throws(() => localDay(1, LA), TypeError);
  assert.throws(() => localDay("2026-10-05T12:00:00Z"), TypeError);
});

test("R2 bounds: a day covers its local day, 23 or 25 hours across a change, and in every zone [first instant, next day's first instant)", () => {
  assert.deepEqual(bounds(day("2026-03-08", LA)), { earliest: "2026-03-08T08:00:00Z", latest: "2026-03-09T07:00:00Z" });
  assert.deepEqual(bounds(day("2026-11-01", LA)), { earliest: "2026-11-01T07:00:00Z", latest: "2026-11-02T08:00:00Z" });
  /* midnight swallowed by the change: the day begins at 01:00 */
  assert.deepEqual(bounds(day("2026-09-06", "America/Santiago")), { earliest: "2026-09-06T04:00:00Z", latest: "2026-09-07T03:00:00Z" });
  /* a half-hour change */
  assert.deepEqual(bounds(day("2026-04-05", "Australia/Lord_Howe")), { earliest: "2026-04-04T13:00:00Z", latest: "2026-04-05T13:30:00Z" });
  for (const z of ZONES) {
    for (let n = 0; n < 365; n++) {
      const d = new Date(Date.UTC(2026, 0, 1 + n)).toISOString().slice(0, 10);
      const b = bounds(day(d, z));
      const lo = Date.parse(b.earliest), hi = Date.parse(b.latest);
      assert.equal(oracleDay(lo, z), d, `${d} ${z} start`);
      assert.notEqual(oracleDay(lo - 1000, z), d, `${d} ${z} the instant before`);
      assert.notEqual(oracleDay(hi, z), d, `${d} ${z} end`);
      assert.equal(oracleDay(hi - 1000, z), d, `${d} ${z} last second`);
    }
  }
});

test("R2 bounds: a minute covers its minute and a second its second; a wall time met twice covers both; one skipped is refused", () => {
  assert.deepEqual(bounds(minute("2026-10-05T18:00", LA)), { earliest: "2026-10-06T01:00:00Z", latest: "2026-10-06T01:01:00Z" });
  assert.deepEqual(bounds({ value: "2026-10-05T18:00:07", precision: "second", zone: LA }), { earliest: "2026-10-06T01:00:07Z", latest: "2026-10-06T01:00:08Z" });
  assert.deepEqual(bounds(minute("2026-11-01T01:30", LA)), { earliest: "2026-11-01T08:30:00Z", latest: "2026-11-01T09:31:00Z" });
  assert.equal(bounds(minute("2026-03-08T02:30", LA)).refused, "DATE_INVALID");
});

test("R2 bounds: an EDTF value covers its widest reading; an open end is null; malformed values and values not of their precision's form are refused", () => {
  assert.deepEqual(bounds({ value: "2026", precision: "edtf", zone: "UTC" }), { earliest: "2026-01-01T00:00:00Z", latest: "2027-01-01T00:00:00Z" });
  assert.deepEqual(bounds({ value: "2026-10", precision: "edtf", zone: LA }), { earliest: "2026-10-01T07:00:00Z", latest: "2026-11-01T07:00:00Z" });
  assert.deepEqual(bounds({ value: "2026-10-05/..", precision: "edtf", zone: "UTC" }), { earliest: "2026-10-05T00:00:00Z", latest: null });
  assert.deepEqual(bounds({ value: "/2026-10-05", precision: "edtf", zone: "UTC" }), { earliest: null, latest: "2026-10-06T00:00:00Z" });
  for (const [value, precision] of [["2026-10-5", "day"], ["2026-02-29", "day"], ["2026-10-05T18:00", "day"], ["2026-10-05", "minute"],
    ["2026-10-05T25:00", "minute"], ["2026-10-05T18:00", "second"], ["2026-10-05T18:00:60", "second"], ["nope", "edtf"], ["2026-10-05", "week"]])
    assert.equal(bounds({ value, precision, zone: "UTC" }).refused, "DATE_INVALID", `${value} at ${precision}`);
  assert.equal(bounds({ value: "2026-10-05", precision: "day", zone: "Nowhere/Town" }).refused, "ZONE_INVALID");
  assert.throws(() => bounds({ value: 20261005, precision: "day", zone: "UTC" }), TypeError);
  assert.throws(() => bounds(null), TypeError);
});

test("R3 parseEdtf: level 1 read whole: qualifiers, unspecified digits, seasons, open and unknown interval ends, Y-years", () => {
  const p = (s) => { const r = parseEdtf(s); assert.ok(!r.refused, `${s}: ${r.why}`); return r; };
  const ends = (s) => { const r = p(s); return [r.earliest, r.latest]; };
  assert.deepEqual(ends("2026"), ["2026-01-01", "2026-12-31"]);
  assert.deepEqual(ends("2024-02"), ["2024-02-01", "2024-02-29"]);
  assert.deepEqual(ends("2026-10-05"), ["2026-10-05", "2026-10-05"]);
  assert.deepEqual(ends("2026-10-05T18:00:00Z"), ["2026-10-05", "2026-10-05"]);
  assert.deepEqual(ends("-0044-03-15"), ["-0044-03-15", "-0044-03-15"]);
  for (const [s, q] of [["2026?", "uncertain"], ["2026~", "approximate"], ["2026-10%", "both"]]) {
    const r = p(s);
    assert.equal(r.qualifiers.uncertain, q !== "approximate", s);
    assert.equal(r.qualifiers.approximate, q !== "uncertain", s);
  }
  assert.deepEqual(ends("201X"), ["2010-01-01", "2019-12-31"]);
  assert.deepEqual(ends("20XX"), ["2000-01-01", "2099-12-31"]);
  assert.deepEqual(ends("2004-XX"), ["2004-01-01", "2004-12-31"]);
  assert.deepEqual(ends("1985-04-XX"), ["1985-04-01", "1985-04-30"]);
  assert.deepEqual(ends("1985-XX-XX"), ["1985-01-01", "1985-12-31"]);
  assert.equal(p("1985-04-XX").qualifiers.unspecified, true);
  assert.deepEqual(ends("2001-21"), ["2001-03-01", "2001-05-31"]);
  assert.deepEqual(ends("2001-22"), ["2001-06-01", "2001-08-31"]);
  assert.deepEqual(ends("2001-23"), ["2001-09-01", "2001-11-30"]);
  assert.deepEqual(ends("2001-24"), ["2001-01-01", "2002-02-28"]);
  assert.equal(p("2001-24").qualifiers.season, true);
  assert.deepEqual(ends("1964/2008"), ["1964-01-01", "2008-12-31"]);
  assert.deepEqual(ends("2004-06/2006-08"), ["2004-06-01", "2006-08-31"]);
  assert.deepEqual(ends("1985-04-12/.."), ["1985-04-12", null]);
  assert.deepEqual(ends("../1985-04-12"), [null, "1985-04-12"]);
  assert.deepEqual(ends("1985-04-12/"), ["1985-04-12", null]);
  assert.deepEqual(ends("/1985-04-12"), [null, "1985-04-12"]);
  assert.equal(p("1985-04-12/..").qualifiers.end, "open");
  assert.equal(p("1985-04-12/").qualifiers.end, "unknown");
  assert.equal(p("../1985").qualifiers.start, "open");
  assert.deepEqual(ends("1984?/2004~"), ["1984-01-01", "2004-12-31"]);
  assert.deepEqual(ends("Y170000002"), ["+170000002-01-01", "+170000002-12-31"]);
  assert.deepEqual(ends("Y-170000002"), ["-170000002-01-01", "-170000002-12-31"]);
});

test("R4 parseEdtf: every level-2 feature is refused EDTF_UNSUPPORTED naming it; anything not EDTF is refused DATE_INVALID", () => {
  for (const [s, feature] of [["[1667,1668]", "set"], ["{1667,1668}", "set"], ["Y17E7", "exponential"], ["1950S2", "significant"],
    ["2004-?06-11", "component"], ["?2004-06-11", "component"], ["2004?-06-11", "component"], ["2001-25", "grouping 25"], ["2001-41", "grouping 41"],
    ["1XXX", "unspecified digits"], ["156X-12-25", "unspecified"], ["1985-XX-12", "unspecified month"]]) {
    const r = parseEdtf(s);
    assert.equal(r.refused, "EDTF_UNSUPPORTED", s);
    assert.match(r.why, new RegExp(feature, "i"), s);
  }
  for (const s of ["", "abc", "2026-13", "2026-02-30", "26-10-05", "Y2026", "2026/2025", "../..", "2026-10-05T18:00:00Z?", "2001-42", "2026 ", "1/2/3"])
    assert.equal(parseEdtf(s).refused, "DATE_INVALID", JSON.stringify(s));
  assert.throws(() => parseEdtf(2026), TypeError);
});

test("R5 compare: before or after only when the spans do not overlap; otherwise undetermined, naming the overlap; a day is never its midnight", () => {
  const a = day("2026-10-05", LA);
  assert.equal(compare(a, day("2026-10-06", LA)), "before");
  assert.equal(compare(day("2026-10-06", LA), a), "after");
  const same = compare(a, day("2026-10-05", LA));
  assert.equal(same.undetermined, true);
  assert.match(same.why, /both are 2026-10-05 at day precision/);
  /* a minute inside the day: neither before nor after */
  const inside = compare(a, minute("2026-10-05T00:00", LA));
  assert.equal(inside.undetermined, true);
  assert.match(inside.why, /overlap/);
  assert.equal(compare(minute("2026-10-04T23:59", LA), a), "before");
  /* zones: the same named day in two zones overlaps; 18:00 in LA is after the UTC day 2026-10-05 */
  assert.equal(compare(day("2026-10-05", "UTC"), day("2026-10-05", LA)).undetermined, true);
  assert.equal(compare(minute("2026-10-05T18:00", LA), day("2026-10-05", "UTC")), "after");
  /* instants are second-precision spans; the same instant twice is undetermined */
  assert.equal(compare("2026-10-05T00:00:00Z", "2026-10-05T00:00:01Z"), "before");
  assert.equal(compare("2026-10-05T00:00:00Z", "2026-10-05T00:00:00Z").undetermined, true);
  /* EDTF bands */
  assert.equal(compare({ value: "2004", precision: "edtf", zone: "UTC" }, { value: "2005-01", precision: "edtf", zone: "UTC" }), "before");
  assert.equal(compare({ value: "200X", precision: "edtf", zone: "UTC" }, { value: "2005", precision: "edtf", zone: "UTC" }).undetermined, true);
});

test("R5 compare: an open or unknown end makes undetermined any comparison it could decide, and leaves one its known end decides", () => {
  const e = (value) => ({ value, precision: "edtf", zone: "UTC" });
  const openEnd = compare(e("2004/.."), e("2010"));
  assert.equal(openEnd.undetermined, true);
  assert.match(openEnd.why, /open end/);
  assert.equal(compare(e("2004/"), e("2010")).undetermined, true);
  assert.equal(compare(e("2012/.."), e("2010")), "after");
  assert.equal(compare(e("../2004"), e("2010")), "before");
  assert.equal(compare(e("../2012"), e("2010")).undetermined, true);
  /* refusals pass through */
  assert.equal(compare(e("2004"), day("2026-02-30", "UTC")).refused, "DATE_INVALID");
});

test("R6 isCalendarDate: true exactly for real days of the proleptic Gregorian calendar, checked against every day of 1599–2401", () => {
  assert.equal(isCalendarDate("2024-02-29"), true);
  assert.equal(isCalendarDate("2026-02-31"), false);
  assert.equal(isCalendarDate("2026-13-01"), false);
  for (const s of ["2026-1-01", "2026-01-1", "20260101", " 2026-01-01", "2026-01-01T00:00", "2026-00-10", "2026-01-00", "", null, 20260101])
    assert.equal(isCalendarDate(s), false, String(s));
  const MS = 86400e3;
  for (let t = Date.UTC(1599, 0, 1); t < Date.UTC(2402, 0, 1); t += MS) {
    const d = new Date(t).toISOString().slice(0, 10);
    assert.equal(isCalendarDate(d), true, d);
  }
  for (let y = 1599; y <= 2401; y++) {
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    assert.equal(isCalendarDate(`${y}-02-29`), leap, `${y}-02-29`);
    for (const m of ["04", "06", "09", "11"]) assert.equal(isCalendarDate(`${y}-${m}-31`), false);
  }
  assert.equal(isCalendarDate("0000-02-29"), true);
  assert.equal(isCalendarDate("1900-02-29"), false);
});

test("R7 dayRange: the first instant of the first day to the first instant after the last, in the zone; inverted and invalid days refused", () => {
  assert.deepEqual(dayRange("2026-10-01", "2026-10-05", LA), { start: "2026-10-01T07:00:00Z", end: "2026-10-06T07:00:00Z" });
  assert.deepEqual(dayRange("2026-11-01", "2026-11-01", LA), { start: "2026-11-01T07:00:00Z", end: "2026-11-02T08:00:00Z" });
  assert.deepEqual(dayRange("2026-03-01", "2026-03-31", HFX), { start: "2026-03-01T04:00:00Z", end: "2026-04-01T03:00:00Z" });
  for (const z of ZONES) {
    const r = dayRange("2026-01-01", "2026-12-31", z);
    assert.equal(r.start, bounds(day("2026-01-01", z)).earliest);
    assert.equal(r.end, bounds(day("2026-12-31", z)).latest);
  }
  assert.equal(dayRange("2026-10-05", "2026-10-04", LA).refused, "RANGE_INVERTED");
  assert.equal(dayRange("2026-02-30", "2026-03-04", LA).refused, "DATE_INVALID");
  assert.equal(dayRange("2026-03-01", "2026-3-04", LA).refused, "DATE_INVALID");
  assert.equal(dayRange("2026-03-01", "2026-03-04", "Atlantis/Main").refused, "ZONE_INVALID");
  assert.throws(() => dayRange("2026-03-01", null, LA), TypeError);
});

test("R8 joinLocal: a zone-less date (or with T00:00:00) and an h:mm AM/PM time, case and spacing folded, give a minute in the zone", () => {
  const want = { value: "2026-10-05T18:00", precision: "minute", zone: LA };
  for (const t of ["6:00 PM", "06:00 PM", "6:00PM", "6:00 pm", " 6:00   p.m. ", "6 : 00 Pm"]) assert.deepEqual(joinLocal("2026-10-05", t, LA), want, t);
  assert.deepEqual(joinLocal("2026-10-05T00:00:00", "6:00 PM", LA), want);
  assert.equal(joinLocal("2026-10-05", "12:00 AM", LA).value, "2026-10-05T00:00");
  assert.equal(joinLocal("2026-10-05", "12:30 PM", LA).value, "2026-10-05T12:30");
  assert.equal(joinLocal("2026-10-05", "11:59 PM", LA).value, "2026-10-05T23:59");
  /* every minute of a day written both ways agrees */
  for (let m = 0; m < 1440; m++) {
    const h24 = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0");
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    assert.equal(joinLocal("2026-10-05", `${h12}:${mm} ${h24 < 12 ? "AM" : "PM"}`, HFX).value, `2026-10-05T${String(h24).padStart(2, "0")}:${mm}`);
  }
});

test("R8 joinLocal: a wall time met twice is undetermined with both instants; one that never occurs is undetermined with why; unreadable is refused", () => {
  const twice = joinLocal("2026-11-01T00:00:00", "1:30 AM", LA);
  assert.equal(twice.undetermined, true);
  assert.deepEqual(twice.candidates, ["2026-11-01T08:30:00Z", "2026-11-01T09:30:00Z"]);
  const gap = joinLocal("2026-03-08", "2:30 AM", LA);
  assert.equal(gap.undetermined, true);
  assert.match(gap.why, /does not occur/);
  for (const t of ["18:00", "6 PM", "13:00 PM", "0:30 AM", "6:60 PM", "six PM", ""]) assert.equal(joinLocal("2026-10-05", t, LA).refused, "DATE_INVALID", t);
  for (const d of ["2026-10-05T18:00:00", "10/05/2026", "2026-02-30"]) assert.equal(joinLocal(d, "6:00 PM", LA).refused, "DATE_INVALID", d);
  assert.equal(joinLocal("2026-10-05", "6:00 PM", "Not/AZone").refused, "ZONE_INVALID");
  assert.throws(() => joinLocal("2026-10-05", 18, LA), TypeError);
});

const valid = (from, to, extra = {}) => ({ valid: { from, to, precision: "day", zone: LA, ...extra }, basis: "M-1" });
test("R22 validAt: out wholly before from or wholly after to; in wholly within both; otherwise undetermined; a null bound is not stated, never always", () => {
  const v = valid("2026-01-01", "2026-12-31");
  assert.equal(validAt(v, day("2025-12-31", LA)), "out");
  assert.equal(validAt(v, day("2027-01-01", LA)), "out");
  assert.equal(validAt(v, day("2026-01-01", LA)), "in");
  assert.equal(validAt(v, day("2026-12-31", LA)), "in");
  assert.equal(validAt(v, minute("2026-06-01T12:00", LA)), "in");
  assert.equal(validAt(v, "2026-06-01T12:00:00Z"), "in");
  /* a band straddling a bound */
  const straddle = validAt(v, { value: "2025-12/2026-01", precision: "edtf", zone: LA });
  assert.equal(straddle.undetermined, true);
  /* null bounds */
  const noEnd = validAt(valid("2026-01-01", null), day("2026-06-01", LA));
  assert.equal(noEnd.undetermined, true);
  assert.match(noEnd.why, /no end is stated/);
  assert.equal(validAt(valid("2026-01-01", null), day("2025-06-01", LA)), "out");
  const noStart = validAt(valid(null, "2026-12-31"), day("2026-06-01", LA));
  assert.match(noStart.why, /no start is stated/);
  assert.equal(validAt(valid(null, "2026-12-31"), day("2027-06-01", LA)), "out");
  assert.equal(validAt(valid(null, null), day("2027-06-01", LA)).undetermined, true);
  /* bounds compared as R5 compares: the day 2026-01-01 in LA against a UTC instant just before its start */
  assert.equal(validAt(v, "2026-01-01T07:59:59Z"), "out");
  assert.equal(validAt(v, "2026-01-01T08:00:00Z"), "in");
  /* EDTF bounds */
  assert.equal(validAt({ valid: { from: "2026", to: "2026", precision: "edtf", zone: "UTC" } }, day("2026-07-01", "UTC")), "in");
});

test("R23 validAt: an event bound resolves through its `at`; without it the bound is undetermined; value and event together are refused; the view gives the zone", () => {
  const ev = (at) => ({ event: "EVT-0000000000000001", edge: "start", ...(at ? { at } : {}) });
  assert.equal(validAt(valid(ev(minute("2026-03-01T09:00", LA)), "2026-12-31"), day("2026-06-01", LA)), "in");
  assert.equal(validAt(valid(ev("2026-03-01T17:00:00Z"), "2026-12-31"), day("2026-02-01", LA)), "out");
  const un = validAt(valid(ev(), "2026-12-31"), day("2026-06-01", LA));
  assert.equal(un.undetermined, true);
  assert.match(un.why, /bounding event is not resolved/);
  assert.equal(validAt(valid(ev(), "2026-12-31"), day("2027-06-01", LA)), "out", "the stated bound still decides");
  assert.equal(validAt(valid({ value: "2026-01-01", event: "EVT-0000000000000001", edge: "start" }, null), day("2026-06-01", LA)).refused, "BOUND_BOTH");
  /* the zone defaults to the view's time_zone */
  const noZone = { valid: { from: "2026-01-01", to: "2026-12-31", precision: "day" } };
  assert.equal(validAt(noZone, "2026-01-01T07:59:59Z", { view: firstView() }), "out");
  assert.equal(validAt(noZone, "2026-01-01T07:59:59Z", { view: testView() }), "in", "Halifax's day had begun");
  assert.equal(validAt(noZone, day("2026-06-01", LA)).undetermined, true, "no zone stated and no view");
  assert.throws(() => validAt(null, day("2026-06-01", LA)), TypeError);
});
