/* local-facts: factStatus (R2) and the horizons (R3). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, P, TP, NOW, written } from "./fixture.mjs";
import { LOCAL_FACT_STATUSES } from "../../../src/local-facts/index.mjs";

const SRC = { source: "the clerk's posted notice" };

test("R2 one fact unconfirmed: its status, no latest act, the profile's value with its status and basis, and the profile's value governing", () => {
  const w = world();
  const s = w.status(P.tz);
  assert.equal(s.ok, true);
  assert.equal(s.status, "unconfirmed");
  assert.equal(s.latest, null);
  assert.deepEqual(s.profile, { value: "America/Halifax", status: "researched", basis: "TEST" });
  assert.deepEqual(s.governs, { value: "America/Halifax", origin: "profile" });
  assert.deepEqual(s.fact, { profile: TP, fact: "time_zone" });
  const h = w.status(P.y2026clerk);
  assert.deepEqual(h.profile, { value: [{ date: "2026-08-14", name: "Clerk's records day" }], status: "ruled", basis: "TEST" });
  const o = w.status(P.clerkHours);
  assert.equal(o.profile.value.weekly.length, 9);
});

test("R2 each status: confirmed with the latest act's member, date and how; corrected, the correction governing and marked; disputed; absent", () => {
  const w = world();
  w.act(P.tz, "confirm", { how: "the town's page at an address" });
  let s = w.status(P.tz);
  assert.equal(s.status, "confirmed");
  assert.deepEqual(s.latest, { act: "confirm", by: V("bob"), at: "2026-09-28T01:00:00Z", how: "the town's page at an address" });
  w.at("2026-09-29T10:00:00Z").act(P.tz, "correct", { by: V("carol"), value: "America/Moncton", ...SRC });
  s = w.status(P.tz);
  assert.equal(s.status, "corrected");
  assert.deepEqual(s.governs, { value: "America/Moncton", origin: "corrected", source: SRC.source,
                                says: `corrected locally by ${V("carol")}, 2026-09-29` });
  assert.equal(s.profile.value, "America/Halifax", "the profile's value is shown beside it");
  w.at("2026-09-30T10:00:00Z").act(P.tz, "dispute", { by: V("dan"), how: "a filing came back" });
  s = w.status(P.tz);
  assert.equal(s.status, "disputed");
  assert.equal(s.latest.by, V("dan"));
  assert.equal(s.governs.value, "America/Moncton", "the correction still governs until a later act changes it");
  /* absent: no active profile, and a fact withheld as a conflict */
  const none = world({ profiles: [] });
  assert.equal(none.status(P.tz).reason, "NO_SUCH_FACT", "no active profile names it");
  const two = written("test-two", { time_zone: { value: "Europe/Lisbon", status: "researched", basis: "TEST" } });
  const c = world({ profiles: [TP, "test-two"], own: [two] });
  c.act(P.tz, "confirm");
  s = c.status(P.tz);
  assert.equal(s.status, "absent");
  assert.equal(s.governs, null);
  assert.match(s.why, /disagree/);
  assert.equal(s.latest.act, "confirm", "its acts are still read");
  /* the same fact given alike by two profiles is held once, named by either profile's path */
  const same = written("test-same", { time_zone: { value: "America/Halifax", status: "researched", basis: "TEST" } });
  const d = world({ profiles: [TP, "test-same"], own: [same] });
  assert.equal(d.status("test-same/time_zone").status, "unconfirmed");
  assert.equal(d.status(P.tz).status, "unconfirmed");
  assert.deepEqual(new Set([...LOCAL_FACT_STATUSES]), new Set(["confirmed", "unconfirmed", "corrected", "disputed", "absent"]));
});

test("R2 a confirmation is of the value that governed when made: a later correction confirmed by a later confirm reads confirmed; a changed value lapses it", () => {
  const w = world();
  w.act(P.tz, "correct", { value: "America/Moncton", ...SRC });
  w.at("2026-09-29T00:00:00Z").act(P.tz, "confirm", { by: V("carol") });
  const s = w.status(P.tz);
  assert.equal(s.status, "confirmed", "R3: a correction is itself confirmed by a later confirm");
  assert.equal(s.governs.value, "America/Moncton");
  /* the profile's value changes under a confirmation (a new release): it no longer counts */
  const before = written("test-moves", { time_zone: { value: "Europe/Lisbon", status: "researched", basis: "TEST" } });
  const own = [before];
  const m = world({ profiles: ["test-moves"], own });
  m.act("test-moves/time_zone", "confirm");
  assert.equal(m.status("test-moves/time_zone").status, "confirmed");
  before.time_zone.value = "Europe/Madrid";
  const after = m.status("test-moves/time_zone");
  assert.equal(after.status, "unconfirmed");
  assert.match(after.why, /has since changed/);
  assert.equal(after.lapsed.act, "confirm", "naming the confirmation that no longer counts");
});

test("R2 without a path: every fact of the active profiles once, corrections and disputes first; the instance transmits nothing", () => {
  const w = world();
  w.act(P.y2027, "dispute");
  w.act(P.venueHours, "correct", { value: { weekly: [{ day: "mon", open: "08:00", close: "17:00" }] }, ...SRC });
  w.act(P.tz, "confirm");
  const all = w.lf.factStatus({ viewer: V("bob") });
  assert.equal(all.ok, true);
  assert.equal(all.count, 9);
  assert.deepEqual(new Set(all.facts.map((f) => f.path)), new Set(Object.values(P)));
  assert.deepEqual(all.facts.slice(0, 2).map((f) => f.status).sort(), ["corrected", "disputed"]);
  assert.ok(all.facts.slice(2).every((f) => f.status !== "corrected" && f.status !== "disputed"));
  assert.equal(all.facts.find((f) => f.path === P.tz).status, "confirmed");
  /* a viewer membership refuses sees no fact; NO_SUCH_FACT for an unnamed path */
  assert.equal(w.lf.factStatus({ viewer: "nobody" }).count, 0);
  assert.equal(w.status(P.tz, "nobody").reason, "NO_SUCH_FACT");
  assert.equal(w.status("not/a/path").reason, "NO_SUCH_FACT");
  assert.equal(w.status(`${TP}/time_zone/x`).reason, "NO_SUCH_FACT");
  /* a path R6 names that the active profiles hold no fact at reads absent (and may not be acted on, R1) */
  const y = w.status(`${TP}/holidays/2030`);
  assert.equal(y.status, "absent");
  assert.match(y.why, /no active jurisdiction profile holds/);
});

/* The test profile's zone is America/Halifax: UTC-3 in daylight time (to 1 November 2026, 02:00), UTC-4 after. Every
   boundary below is that zone's local midnight, and the instant a second before it is still the day before, though its
   UTC day is already the next (R3: never the UTC day). */

test("R3 a holiday year's confirmation lasts until the year ends at the zone's local midnight, then reads unconfirmed naming it", () => {
  const w = world();
  w.act(P.y2026, "confirm", { how: "the town's holiday schedule" });
  assert.equal(w.at("2027-01-01T03:59:59Z").status(P.y2026).status, "confirmed", "already 2027 in UTC, still 2026 locally");
  const s = w.at("2027-01-01T04:00:00Z").status(P.y2026);
  assert.equal(s.status, "unconfirmed");
  assert.equal(s.lapses_on, "2027-01-01");
  assert.deepEqual(s.lapsed, { act: "confirm", by: V("bob"), at: "2026-09-28T01:00:00Z", how: "the town's holiday schedule" });
  assert.match(s.why, /confirmation by member:bob on 2026-09-27 lapsed on 2027-01-01/);
  /* a year confirmed early lasts until its own end */
  w.at("2026-02-01T00:00:00Z").act(P.y2027, "confirm");
  assert.equal(w.at("2027-12-31T12:00:00Z").status(P.y2027).status, "confirmed");
  assert.equal(w.at("2028-01-01T03:59:59Z").status(P.y2027).status, "confirmed");
  assert.equal(w.at("2028-01-01T04:00:00Z").status(P.y2027).status, "unconfirmed");
});

test("R3 a holiday year not confirmed by 1 November of the year before is due, from that local midnight", () => {
  const w = world();
  let s = w.at("2026-11-01T02:59:59Z").status(P.y2027);
  assert.equal(s.status, "unconfirmed");
  assert.equal(s.due, false, "1 November in UTC, still 31 October locally");
  assert.equal(s.due_from, "2026-11-01");
  s = w.at("2026-11-01T03:00:00Z").status(P.y2027);
  assert.equal(s.due, true);
  w.act(P.y2027, "confirm");
  assert.equal(w.status(P.y2027).due, false, "confirmed, it is no longer due");
});

test("R3 an office's hours and the time zone lapse 183 local days after confirmation, at the local day boundary", () => {
  for (const path of [P.clerkHours, P.venueHours, P.tz]) {
    for (const at of ["2026-01-10T15:00:00Z", "2026-01-11T02:30:00Z"]) {   /* both on 2026-01-10 locally */
      const w = world();
      w.at(at).act(path, "confirm");
      assert.equal(w.at("2026-07-12T02:59:59Z").status(path).status, "confirmed", `${path} ${at} on local day 182`);
      const s = w.at("2026-07-12T03:00:00Z").status(path);
      assert.equal(s.status, "unconfirmed", `${path} ${at} on local day 183`);
      assert.equal(s.lapses_on, "2026-07-12");
      assert.equal(s.due, true);
    }
  }
});

test("R3 the days are the zone that governs here: a member's correction of the time zone moves every horizon of the profile", () => {
  const w = world();
  /* 2026-01-10T03:00Z is 2026-01-10 in Tokyo and 2026-01-09 in Halifax: in Halifax the confirmation would lapse at
     2026-07-11T03:00Z; in Tokyo, the zone that governs once corrected, at 2026-07-12 00:00 local, 2026-07-11T15:00Z */
  w.at("2026-01-10T03:00:00Z").act(P.clerkHours, "confirm");
  w.act(P.tz, "correct", { value: "Asia/Tokyo", source: "the clerk's notice" });
  assert.equal(w.status(P.tz).governs.says, "corrected locally by member:bob, 2026-01-10");
  assert.equal(w.at("2026-07-11T14:59:59Z").status(P.clerkHours).status, "confirmed");
  const s = w.at("2026-07-11T15:00:00Z").status(P.clerkHours);
  assert.equal(s.status, "unconfirmed");
  assert.equal(s.lapses_on, "2026-07-12");
});

test("R3 a profile with no time zone answers the horizon undetermined, saying so, never on the UTC day", () => {
  const nozone = written("test-nozone", { holidays: [{ year: 2026, days: [{ date: "2026-01-01", name: "New Year's Day" }],
                                                      status: "researched", basis: "TEST" }] });
  const w = world({ profiles: ["test-nozone"], own: [nozone] });
  const path = "test-nozone/holidays/2026";
  let s = w.status(path);
  assert.equal(s.status, "unconfirmed");
  assert.equal(s.due, null);
  assert.equal(s.horizon.undetermined, true);
  assert.match(s.horizon.why, /no time zone/);
  w.act(path, "confirm");
  s = w.status(path);
  assert.equal(s.status, "unconfirmed", "a confirmation whose horizon is undetermined is not shown in force");
  assert.equal(s.lapsed.act, "confirm");
  assert.match(s.why, /cannot be shown in force: .*no time zone/);
  assert.equal(s.latest.at, "2026-09-28T01:00:00Z", "the act's instant, whole, not a UTC day");
  const due = w.lf.factsDue({});
  assert.deepEqual(due.due.map((d) => [d.path, d.status, d.due, d.horizon.undetermined]), [[path, "unconfirmed", null, true]]);
  /* the negative control: the same year in a zoned profile is determined */
  assert.equal(world().status(P.y2026).horizon, undefined);
});

test("R3 a correction governs until a later act; it does not lapse", () => {
  const w = world();
  w.at("2026-01-01T00:00:00Z").act(P.clerkHours, "correct", { value: { weekly: [{ day: "mon", open: "09:00", close: "10:00" }] }, ...SRC });
  const s = w.at("2027-06-01T00:00:00Z").status(P.clerkHours);
  assert.equal(s.status, "corrected");
  assert.equal(s.governs.origin, "corrected");
  w.act(P.clerkHours, "dispute");
  assert.equal(w.status(P.clerkHours).status, "disputed");
});

test("R2 R6 the office calendar's path names its own entry, never a named closure list's entry for the same year (jurisdictions R47)", () => {
  const listed = written("test-lists", { time_zone: { value: "America/Halifax", status: "researched", basis: "TEST" },
    holidays: [{ year: 2026, list: "court", citation: "the court's rule", days: [{ date: "2026-08-31", name: "Court day" }], status: "ruled", basis: "TEST" },
               { year: 2026, days: [{ date: "2026-01-01", name: "New Year's Day" }], status: "researched", basis: "TEST" }] });
  const w = world({ profiles: ["test-lists"], own: [listed] });
  assert.deepEqual(w.status("test-lists/holidays/2026").profile.value, [{ date: "2026-01-01", name: "New Year's Day" }]);
  assert.deepEqual(w.status("test-lists/holidays/2026/list=court").profile.value, [{ date: "2026-08-31", name: "Court day" }]);
  assert.deepEqual(w.lf.factStatus({}).facts.map((f) => f.path).sort(),
                   ["test-lists/holidays/2026", "test-lists/holidays/2026/list=court", "test-lists/time_zone"]);
  /* a correction of the office calendar replaces its days only, validated as the profile's own field */
  assert.equal(w.act("test-lists/holidays/2026", "correct", { value: [{ date: "2026-07-01", name: "A day" }], ...SRC }).ok, true);
  assert.deepEqual(w.status("test-lists/holidays/2026").governs.value, [{ date: "2026-07-01", name: "A day" }]);
  assert.deepEqual(w.status("test-lists/holidays/2026/list=court").governs, { value: [{ date: "2026-08-31", name: "Court day" }], origin: "profile" });
});

test("R1 R2 R3 R4 R6 a named closure list's year is a fact as any holiday year is: confirmed, corrected and disputed by year apart from the office calendar's", () => {
  const w = world();
  const court = w.status(P.y2026courtList);
  assert.deepEqual([court.status, court.profile.status, court.profile.basis], ["unconfirmed", "ruled", "TEST"]);
  assert.deepEqual(court.profile.value.map((d) => d.date), ["2026-01-01", "2026-08-31", "2026-12-24", "2026-12-25"]);
  assert.deepEqual(court.fact, { profile: TP, fact: "holidays", year: 2026, list: "court" });
  assert.equal(court.due_from, "2025-11-01", "R3: due from 1 November of the year before");
  /* R1: a member confirms the court's list; the office calendar and the town's list are untouched */
  assert.equal(w.act(P.y2026courtList, "confirm", { how: "the court's posted holiday rule" }).ok, true);
  assert.equal(w.status(P.y2026courtList).status, "confirmed");
  assert.equal(w.status(P.y2026).status, "unconfirmed");
  assert.equal(w.status(P.y2026townList).status, "unconfirmed");
  /* R3: it lasts until the year ends at the profile zone's local midnight */
  assert.equal(w.at("2027-01-01T03:59:59Z").status(P.y2026courtList).status, "confirmed");
  const lapsed = w.at("2027-01-01T04:00:00Z").status(P.y2026courtList);
  assert.deepEqual([lapsed.status, lapsed.lapses_on, lapsed.lapsed.act], ["unconfirmed", "2027-01-01", "confirm"]);
  /* R1, R2: a correction of the town's list governs it alone, validated as that entry's own field */
  w.at(NOW);
  const town = [{ date: "2026-01-01", name: "New Year's Day" }, { date: "2026-12-25", name: "Christmas Day" }];
  assert.equal(w.act(P.y2026townList, "correct", { value: [{ date: "2027-01-01", name: "outside its year" }], ...SRC }).reason,
               "FACT_VALUE_REFUSED");
  assert.equal(w.act(P.y2026townList, "correct", { value: town, ...SRC }).ok, true);
  assert.deepEqual([w.status(P.y2026townList).status, w.status(P.y2026townList).governs.value], ["corrected", town]);
  assert.equal(w.status(P.y2026).governs.origin, "profile");
  assert.equal(w.status(P.y2026courtList).governs.origin, "profile");
  /* a dispute of the office calendar leaves both lists as they were */
  w.act(P.y2026, "dispute");
  assert.deepEqual([P.y2026, P.y2026courtList, P.y2026townList].map((p) => w.status(p).status), ["disputed", "confirmed", "corrected"]);
  /* R4: the list's year is listed due on its own; asked by path, only it */
  w.act(P.y2026courtList, "dispute");
  const due = w.lf.factsDue({ paths: [P.y2026courtList, P.y2026townList] });
  assert.deepEqual(due.due.map((d) => [d.path, d.status]), [[P.y2026courtList, "disputed"]]);
  /* a list R6 names that no active profile holds reads absent, and may not be acted on */
  const none = `${TP}/holidays/2026/list=harbour`;
  assert.equal(w.status(none).status, "absent");
  assert.deepEqual(w.lf.factsDue({ paths: [none] }).absent, [none]);
  assert.equal(w.act(none, "confirm").reason, "NO_SUCH_FACT");
  assert.equal(w.act(`${TP}/holidays/2027/list=court`, "confirm").reason, "NO_SUCH_FACT", "the court's list holds no 2027");
});

test("R2 R6 a named closure list's year that the active profiles disagree on is withheld, and reads absent", () => {
  const other = written("test-court", { holidays: [{ year: 2026, list: "court", citation: "another rule",
    days: [{ date: "2026-02-02", name: "Another day" }], status: "ruled", basis: "TEST" }] });
  const w = world({ profiles: [TP, "test-court"], own: [other] });
  const s = w.status(P.y2026courtList);
  assert.equal(s.status, "absent");
  assert.match(s.why, /disagree/);
  assert.equal(w.act(P.y2026courtList, "dispute").ok, true, "still named in an active profile, so it may be acted on (R1)");
  /* the negative control: the town's list, given by one profile only, is held */
  assert.equal(w.status(P.y2026townList).status, "unconfirmed");
});
