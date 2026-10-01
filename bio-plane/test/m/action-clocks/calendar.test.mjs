/* action-clocks' calendar: a business count states the confirmation of every holiday year it reads and counts on the value
   that governs on this instance, for the offices the action is addressed to or filed at (R10; jurisdictions R43;
   local-facts R2); and the local facts a live deadline reads (R11). On the test profile, and on the first profile's
   office-specific 2026 entries (M-189–M-191; K936). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import { factPath } from "../../../src/local-facts/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const M = V("alice"), BOB = V("bob");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d";
const TEST = combine(["test-port-ellery"]).view, FIRST = combine(["oakland-alameda"]).view;
const office = (role, body) => ({ state: "named", role, body });
const fm = (counterparty, action_kind, at) => ({ counterparty, action_kind, correspondence: [{ direction: "received", at }] });
const R5 = { rule: "r", days: 5, count: "business", starts: "received" };
const count = (d, f, view, factOf) => clocks.computeDeadline(d, f, view, factOf === undefined ? {} : { factOf });
/* The paths of the holiday entries of a view for a year, keyed by their offices ("all" for every office). */
const pathOf = (view, year, offices = null) => {
  const h = view.holidays.find((x) => x.year === year && JSON.stringify(x.offices ?? null) === JSON.stringify(offices));
  return factPath({ profile: h.profile, fact: "holidays", year, ...(offices ? { offices } : {}) });
};
const CLERK = office("Town Clerk", "City of Port Ellery"), SELECT = office("Selectboard", "Port Ellery Selectboard");
const CPL = (role, body) => ["counterparty:", "  state: named", `  role: ${role}`, `  body: ${body}`];

test("R10 a business count reads the holiday entries for all offices and those naming the action's ONE office (its addressee when a named office, else its kind's venue; K986), and no other office's", () => {
  /* Wednesday 2026-08-12: the Town Clerk's office alone is closed Friday 14 August (an entry naming it). */
  assert.equal(count(R5, fm(CLERK, "records_request", "2026-08-12"), TEST).date, "2026-08-20", "the Clerk's closure is counted");
  assert.equal(count(R5, fm(SELECT, "records_request", "2026-08-12"), TEST).date, "2026-08-19", "for another office it is not");
  /* Friday 2026-08-28: the venue of a commitment claim is closed Monday 31 August; a records request's is not. With no
     office addressed, the venue decides; with an office addressed, the addressee does. */
  const one = { ...R5, days: 1 }, AUD = { state: "audience", description: "residents" };
  assert.equal(count(one, fm(AUD, "commitment_claim", "2026-08-28"), TEST).date, "2026-09-01", "the venue's closure is counted");
  assert.equal(count(one, fm(AUD, "records_request", "2026-08-28"), TEST).date, "2026-08-31");
  assert.equal(count(one, fm(SELECT, "commitment_claim", "2026-08-28"), TEST).date, "2026-08-31", "the addressee, not the venue");
  /* the all-offices entry binds every office: Friday 3 July. */
  for (const f of [fm(CLERK, "records_request", "2026-07-01"), fm({ state: "audience", description: "residents" }, "other", "2026-07-01")])
    assert.equal(count(R5, f, TEST).date, "2026-07-09");
  /* the entries read are stated, each once, the others' not. */
  const read = count(R5, fm(CLERK, "records_request", "2026-08-12"), TEST).calendar.years.map((y) => [y.year, y.offices]);
  assert.deepEqual(read, [[2026, null], [2026, ["Town Clerk"]]]);
  assert.deepEqual(clocks.actionOffices(fm(CLERK, "commitment_claim", "2026-08-28"), TEST),
    [{ role: "Town Clerk", body: "City of Port Ellery" }]);
  assert.deepEqual(clocks.actionOffices(fm(AUD, "commitment_claim", "2026-08-28"), TEST), [{ venue: "commitment_claim" }]);
  assert.deepEqual(clocks.actionOffices(fm({ state: "named", kind: "press", role: "Reporter", organisation: "x" }, "other", "x"), TEST), [],
    "a named non-office and a kind with no venue are no office");
});

test("R10 on the first profile's office-specific 2026 entries (M-189–M-191): each office counts on its own entry; an office no entry names, with no entry for all offices, leaves the year undetermined", () => {
  const one = { ...R5, days: 1 }, two = { ...R5, days: 2 };
  const audience = { state: "audience", description: "the court" };
  /* Tuesday 2026-11-10: the State Controller's offices close 11 November (M-191); the city's offices do not (M-190). */
  const state = count(one, fm(office("State Controller", "California State Controller's Office"), "other", "2026-11-10"), FIRST);
  assert.deepEqual([state.date, state.calendar.years.map((y) => y.basis)], ["2026-11-12", ["M-191"]]);
  const city = count(one, fm(office("Controller", "City of Oakland Finance Department"), "other", "2026-11-10"), FIRST);
  assert.deepEqual([city.date, city.calendar.years.map((y) => y.basis)], ["2026-11-11", ["M-190"]]);
  /* Thursday 2026-07-02: the court (the venue of a records petition) closes Friday 3 July (M-189); the city on Saturday 4th. */
  const court = count(two, fm(audience, "records_petition", "2026-07-02"), FIRST);
  assert.deepEqual([court.date, court.calendar.years.map((y) => y.basis)], ["2026-07-07", ["M-189"]]);
  assert.equal(count(two, fm(office("City Auditor", "Office of the City Auditor, City of Oakland"), "other", "2026-07-02"), FIRST).date, "2026-07-06");
  /* an office no entry names: undetermined, naming it; so is an action with no office, the year having no entry for all. */
  const jury = count(one, fm(office("Civil Grand Jury", "Alameda County Civil Grand Jury"), "other", "2026-07-02"), FIRST);
  assert.equal(jury.date, null); assert.match(jury.why, /Civil Grand Jury/); assert.match(jury.why, /2026/);
  const none = count(one, fm(audience, "other", "2026-07-02"), FIRST);
  assert.equal(none.date, null); assert.match(none.why, /does not list/);
  /* the addressee is the office even where the kind has a venue an entry names: the jury, no entry naming it. */
  assert.equal(count(two, fm(office("Civil Grand Jury", "Alameda County Civil Grand Jury"), "records_petition", "2026-07-02"), FIRST).date, null);
  /* a request to the City Auditor counts on M-190's entry, though the kind's venue (the portal) is named by none. */
  const auditor = count(one, fm(office("City Auditor", "Office of the City Auditor, City of Oakland"), "records_request", "2026-11-10"), FIRST);
  assert.deepEqual([auditor.date, auditor.calendar.years.map((y) => y.basis)], ["2026-11-11", ["M-190"]]);
  /* the same office in the next year, which the profile does not list: undetermined. */
  assert.match(count(one, fm(office("Controller", "x"), "other", "2026-12-31"), FIRST).why, /2027/);
});

test("R10 the count states each year's confirmation through local-facts: unconfirmed, confirmed, corrected (counting on the correction, naming its member and date), and undetermined when disputed; a calendar count states none", () => {
  const w = world();
  const clerk = pathOf(TEST, 2026, ["Town Clerk"]), all26 = pathOf(TEST, 2026);
  w.action(A, CPL("Town Clerk", "City of Port Ellery"));
  w.actions.actionCorrespond({ target: A, direction: "received", at: "2026-08-12", account: "got it", viewer: M, author: M });
  const propose = () => w.c.clockPropose({ target: A, rule: "records_answer", proposer: M, viewer: M }).proposal;
  const act = (path, a, x = {}) => {
    const r = w.localFacts.factConfirm({ path, act: a, how: "the clerk's published calendar, read 2026-09-28", by: M, viewer: M, ...x });
    assert.equal(r.ok, true, JSON.stringify(r)); return r;
  };
  /* no member has confirmed: counted, and said to be counted on an unconfirmed calendar, naming the source. */
  let p = propose();
  assert.equal(p.entry.date, "2026-08-20");
  assert.equal(p.calendar.status, "unconfirmed");
  assert.deepEqual(p.calendar.years.map((y) => [y.path, y.status]), [[all26, "unconfirmed"], [clerk, "unconfirmed"]]);
  assert.equal(p.calendar.says.length, 2);
  for (const s of p.calendar.says) assert.match(s, /^counted on an unconfirmed calendar \(TEST, /);
  /* one confirmed, one not: still unconfirmed, the confirmed one not named among what is said. */
  act(all26, "confirm");
  p = propose();
  assert.deepEqual([p.calendar.status, p.calendar.says.length, p.entry.date], ["unconfirmed", 1, "2026-08-20"]);
  /* both confirmed: counted as before, nothing said. */
  act(clerk, "confirm");
  p = propose();
  assert.deepEqual([p.calendar.status, p.calendar.says, p.entry.date], ["confirmed", [], "2026-08-20"]);
  assert.ok(p.calendar.years.every((y) => y.status === "confirmed"));
  /* corrected: the correction governs (the Clerk is open on 14 August), naming the member and the date. */
  const c = act(clerk, "correct", { by: BOB, viewer: BOB, value: { year: 2026, offices: ["Town Clerk"], days: [], status: "ruled", basis: "TEST" },
                                    source: "the clerk's notice of 2026-09-20" });
  p = propose();
  assert.deepEqual([p.calendar.status, p.entry.date], ["corrected", "2026-08-19"]);
  const y = p.calendar.years.find((x) => x.path === clerk);
  assert.deepEqual([y.status, y.corrected_by, y.corrected_at], ["corrected", BOB, c.at]);
  assert.equal(p.calendar.says.length, 1);
  assert.ok(p.calendar.says[0].includes(BOB) && p.calendar.says[0].includes(c.at), p.calendar.says[0]);
  /* disputed: undetermined, with why; nothing is counted. */
  act(all26, "dispute", { by: BOB, viewer: BOB });
  p = propose();
  assert.equal(p.entry.date, null); assert.match(p.undetermined, /disputed/);
  assert.equal(w.rows(`SELECT date FROM action_clock_proposals WHERE bundle_id=?`, A)[0].date, null);
  /* a local-facts that cannot answer reads as absent: undetermined. */
  const absent = clocks.computeDeadline(R5, fm(CLERK, "records_request", "2026-08-12"), TEST, { factOf: () => ({ status: "absent", why: "x" }) });
  assert.equal(absent.date, null); assert.match(absent.why, /cannot be read/);
  /* a calendar count reads no holiday and states none. */
  const cal = clocks.computeDeadline({ ...R5, count: "calendar" }, fm(CLERK, "records_request", "2026-08-12"), TEST, { factOf: () => { throw new Error("read"); } });
  assert.deepEqual(cal, { date: "2026-08-17", start: "2026-08-12" });
  /* a pure caller that reads no confirmation says so. */
  assert.equal(count(R5, fm(CLERK, "records_request", "2026-08-12"), TEST).calendar.status, "not_read");
});

test("R11 calendarFactsRead lists, once each, the holiday entries and office hours a live business-day deadline reads, from this year to its latest pending entry's (at least the next), with the actions reading each; writes nothing", () => {
  const w = world();
  w.action(A, [...CPL("Town Clerk", "City of Port Ellery"), "clock:", ...CLK("2028-03-01"), ...CLK("2029-01-05", "met")]);
  w.action(B, CPL("Town Clerk", "City of Port Ellery"));
  w.promote(C, actionMd(C, [...CPL("Selectboard", "Port Ellery Selectboard"), "action_kind: bylaw_complaint"]));
  w.action(D, CPL("Selectboard", "Port Ellery Selectboard"));
  w.actions.actionMove({ target: D, to: "abandoned", reason: "dropped", viewer: M, author: M });
  const before = w.rows(`SELECT (SELECT COUNT(*) FROM manifest) AS m, (SELECT COUNT(*) FROM action_reminders) AS r`);
  const r = w.c.calendarFactsRead({ viewer: M });
  const hours = (o) => factPath({ profile: "test-port-ellery", fact: "hours", office: o });
  const want = [
    [pathOf(TEST, 2026), [A, B]], [pathOf(TEST, 2026, ["Town Clerk"]), [A, B]], [pathOf(TEST, 2027), [A, B]],
    [hours({ role: "Town Clerk", body: "City of Port Ellery" }), [A, B]],
  ].sort((x, y) => (x[0] < y[0] ? -1 : 1));
  assert.deepEqual(r.paths.map((p) => [p.path, p.actions]), want,
    "a kind with no business deadline (C) reads nothing; a closed action (D) reads nothing; 2028 is not listed, so is no fact; another office's entry, and the venue's hours (the addressee is the office), are not read");
  assert.equal(new Set(r.paths.map((p) => p.path)).size, r.paths.length, "once each");
  assert.deepEqual([r.as_of, r.actions_limit, r.truncated], ["2026-09-28", 500, false]);
  assert.deepEqual(w.rows(`SELECT (SELECT COUNT(*) FROM manifest) AS m, (SELECT COUNT(*) FROM action_reminders) AS r`), before, "writes nothing");
  /* an action addressing no office reads its kind's venue's hours. */
  w.promote("ACTN-2026-0005-e", actionMd("ACTN-2026-0005-e", ["counterparty:", "  state: audience", "  description: residents", "action_kind: records_request"]));
  assert.deepEqual(w.c.calendarFactsRead({ viewer: M }).paths.find((p) => p.path === hours({ kind: "records_request" })).actions, ["ACTN-2026-0005-e"]);
  /* the horizon moves with the instance clock: from 2027, the 2026 entries are no longer read. */
  const later = w.c.calendarFactsRead({ viewer: M, now: Date.parse("2027-02-01T00:00:00Z") });
  assert.deepEqual(later.paths.map((p) => p.path).filter((x) => x.includes("2026")), []);
  assert.ok(later.paths.some((p) => p.path === pathOf(TEST, 2027)));
  /* only visible actions; with no active profile, nothing is read. */
  assert.deepEqual(w.c.calendarFactsRead({ viewer: "nobody" }).paths, []);
  const bare = world({ profiles: null });
  bare.action(A, CPL("Town Clerk", "City of Port Ellery"));
  assert.deepEqual(bare.c.calendarFactsRead({ viewer: M }).paths, []);
});

test("R11 at most 500 actions are read, `truncated` stated", () => {
  const w = world();
  const id = (i) => `ACTN-2026-${String(i).padStart(4, "0")}-z`;
  for (let i = 1; i <= 501; i++) w.promote(id(i), actionMd(id(i), [...CPL("Town Clerk", "City of Port Ellery"), "action_kind: records_request"]));
  const r = w.c.calendarFactsRead({ viewer: M });
  assert.equal(r.truncated, true);
  assert.equal(r.paths[0].actions.length, 500);
  assert.ok(!r.paths[0].actions.includes(id(501)));
});
