/* civil-time at its interface: time rules (R9–R17), basis kinds (R18), overdue (R19), spans (R24) and traces (R25),
 * each against the first profile's view and the test profile's (R27), on the profiles' own facts. The test profile's
 * weekend is Sunday alone, so no answer below can come from an assumed weekend. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateRule, due, overdueOn, span } from "../../../src/civil-time/index.mjs";
import { firstView, testView, ruleOf, day, minute } from "./helpers.mjs";

const LA = "America/Los_Angeles", HFX = "America/Halifax";
const ev = (view, name, anchor, extra = {}) => evaluateRule({ rule: ruleOf(view, name), anchor, view, ...extra });
const val = (r) => { assert.ok(r.due && r.due.value, JSON.stringify(r)); return r.due.value; };
const custom = (over) => ({ rule: "custom", applies_to: "claim", starts: "act", citation: "a test citation", status: "researched", basis: "2026-10-05", ...over });

test("R9 a day count: CCP § 12 (first day excluded, last included), forward and backward, calendar skipping nothing, business skipping every closed day", () => {
  const v = firstView(), t = testView();
  /* calendar: 10 days from 10-05 is 10-15 on both profiles' records rules (the first's a calendar count) */
  assert.equal(val(ev(v, "records_response", day("2026-10-05", LA))), "2026-10-15");
  /* business, test profile: weekend Sunday, 03-17 (Harbour Day) on its town list: Fri 13, Sat 14, Mon 16, Wed 18, Thu 19 */
  const r = ev(t, "records_answer", day("2026-03-12", HFX));
  assert.equal(val(r), "2026-03-19");
  assert.deepEqual(r.trace.skipped.map((s) => s.day), ["2026-03-15", "2026-03-17"]);
  assert.match(r.trace.skipped[0].why, /weekend \(sun\)/);
  assert.match(r.trace.skipped[1].why, /Harbour Day \(town\)/);
  /* backward, business: 3 business days before Thu 2026-03-19 on the test profile: Wed 18, Mon 16, Sat 14 */
  const back = evaluateRule({ rule: custom({ units: "days", amount: 3, count: "business", direction: "backward", closures: "town" }),
                              anchor: day("2026-03-19", HFX), view: t });
  assert.equal(val(back), "2026-03-14");
  /* calendar counts skip nothing, closures or weekend */
  const cal = evaluateRule({ rule: custom({ units: "days", amount: 5, count: "calendar", closures: "town" }), anchor: day("2026-03-12", HFX), view: t });
  assert.equal(val(cal), "2026-03-17");
  assert.deepEqual(cal.trace.skipped, []);
});

test("R9 with no closures selector, the holiday entries for all offices and those naming the office; with one, that list alone", () => {
  const v = firstView();
  const one = custom({ units: "days", amount: 1, count: "business" });
  /* 2026-11-11 is on the State Controller's list (M-191), not on the City offices' (M-190) */
  assert.equal(val(evaluateRule({ rule: one, anchor: day("2026-11-10", LA), view: v, office: "City Council" })), "2026-11-11");
  assert.equal(val(evaluateRule({ rule: one, anchor: day("2026-11-10", LA), view: v, office: "State Controller" })), "2026-11-12");
  /* a venue's entries, named {venue: kind} */
  assert.equal(val(evaluateRule({ rule: one, anchor: day("2026-09-24", LA), view: v, office: { venue: "records_petition" } })), "2026-09-28");
  /* an office no entry names, with no entry for all offices: the year is not covered */
  const none = evaluateRule({ rule: one, anchor: day("2026-11-10", LA), view: v, office: "Civil Grand Jury" });
  assert.equal(none.undetermined, true);
  assert.equal(none.code, "CALENDAR_UNCOVERED");
  /* a selector: the federal list, whatever the office */
  assert.equal(val(evaluateRule({ rule: { ...one, closures: "federal" }, anchor: day("2026-10-09", LA), view: v, office: "City Council" })), "2026-10-13");
  /* the test profile: an entry for one office adds to every office's year */
  const t = testView();
  assert.equal(val(evaluateRule({ rule: one, anchor: day("2026-08-13", HFX), view: t, office: "Town Clerk" })), "2026-08-15", "Fri 14 is the Clerk's records day");
  assert.equal(val(evaluateRule({ rule: one, anchor: day("2026-08-13", HFX), view: t, office: "Selectboard" })), "2026-08-14");
});

test("R9 the weekend is never assumed: with no weekend fact, a business count or a roll is undetermined with why; a calendar count without a roll is not", () => {
  for (const make of [firstView, testView]) {
    const v = make();
    delete v.weekend;
    const zone = v.time_zone.value;
    const b = evaluateRule({ rule: custom({ units: "days", amount: 3, count: "business" }), anchor: day("2026-10-05", zone), view: v });
    assert.equal(b.undetermined, true);
    assert.match(b.why, /weekend/);
    const roll = evaluateRule({ rule: custom({ units: "days", amount: 3, count: "calendar", roll: true }), anchor: day("2026-10-05", zone), view: v });
    assert.equal(roll.undetermined, true);
    const bh = evaluateRule({ rule: custom({ units: "business_hours", amount: 3 }), anchor: minute("2026-10-05T10:00", zone), view: v });
    assert.equal(bh.undetermined, true);
    assert.equal(val(evaluateRule({ rule: custom({ units: "days", amount: 3, count: "calendar" }), anchor: day("2026-10-05", zone), view: v })), "2026-10-08");
  }
});

test("R10 roll: a closed last day moves forward to the next open day, or backward to the previous; with no roll the last day stands", () => {
  const v = firstView();
  const r = ruleOf(v, "records_response");
  assert.equal(val(evaluateRule({ rule: r, anchor: day("2026-10-01", LA), view: v })), "2026-10-12");
  assert.equal(val(evaluateRule({ rule: { ...r, roll: undefined }, anchor: day("2026-10-01", LA), view: v })), "2026-10-11");
  /* test profile, backward (its filing_reply): 7 days before Mon 09-07 is Mon 08-31 (court vacation) → Sun 08-30 (weekend) → Sat 08-29 */
  const t = ev(testView(), "filing_reply", day("2026-09-07", HFX));
  assert.equal(val(t), "2026-08-29");
  assert.deepEqual(t.trace.roll[0].passed.map((p) => p.day), ["2026-08-31", "2026-08-30"]);
  /* and forward on a month period (its appeal_window): 06-30 + 2 months is Sun 08-30 → Mon 08-31 (closed) → Tue 09-01 */
  assert.equal(val(ev(testView(), "appeal_window", day("2026-06-30", HFX))), "2026-09-01");
});

test("R10 a statutory period rolls on the closures its law names; a practice calendar is answered beside it, labelled observed practice, never as the rule", () => {
  const v = firstView();
  const r = ev(v, "records_response", day("2026-09-15", LA));
  assert.equal(r.due.value, "2026-09-28");
  assert.equal(r.trace.closures, "judicial");
  assert.deepEqual(r.observed.map((o) => [o.label, o.closures, o.due.value]), [["observed practice", "city", "2026-09-25"]]);
  /* a practice calendar the caller passes: answered beside, the rule's answer unchanged */
  const t = testView();
  /* the test profile's own observed list: the court closes 12-24 too (Tue 22, Wed 23, Thu 24, Sat 26, Mon 28 against Tue 29) */
  const o = ev(t, "records_answer", day("2026-12-21", HFX));
  assert.deepEqual([o.due.value, o.observed[0].closures, o.observed[0].due.value], ["2026-12-28", "court", "2026-12-29"]);
  const p = evaluateRule({ rule: { ...ruleOf(t, "records_answer"), observed: undefined }, anchor: day("2026-12-21", HFX), view: t, practice: "court" });
  assert.equal(p.due.value, "2026-12-28");
  assert.equal(p.observed[0].label, "observed practice");
  assert.equal(p.observed[0].due.value, "2026-12-29");
});

test("R11 hours count clock hours from the anchor's instant, forward or backward, across a daylight-saving change, and never roll", () => {
  const v = firstView();
  const h = (amount, direction, anchor) => evaluateRule({ rule: custom({ units: "hours", amount, direction }), anchor, view: v });
  assert.equal(val(h(24, "forward", minute("2026-11-01T00:00", LA))), "2026-11-01T23:00", "the 25-hour day");
  assert.equal(val(h(24, "backward", minute("2026-03-09T00:00", LA))), "2026-03-07T23:00", "the 23-hour day");
  const sat = h(72, "backward", minute("2026-10-20T18:00", LA));
  assert.equal(val(sat), "2026-10-17T18:00");
  assert.deepEqual(sat.trace.roll, [], "an hours due on a Saturday stands");
  assert.equal(sat.due.precision, "minute");
  /* a day-precision anchor has no time to count from */
  assert.equal(h(24, "forward", day("2026-10-20", LA)).code, "ANCHOR_UNDETERMINED");
});

test("R11 business hours count only the hours of days not closed, forward and backward, on the rule's closure list", () => {
  const t = testView();
  /* its harbour_notice, 16 business hours back from Mon 03-16 10:00: Mon 10 h, Sun skipped, Sat 6 h → Sat 03-14 18:00 */
  assert.equal(val(ev(t, "harbour_notice", minute("2026-03-16T10:00", HFX))), "2026-03-14T18:00");
  /* forward: Sat 20:00 + 4 h, Sun skipped, Mon 12 h → Mon 03-16 12:00 */
  const fwd = evaluateRule({ rule: { ...ruleOf(t, "harbour_notice"), direction: "forward" }, anchor: minute("2026-03-14T20:00", HFX), view: t });
  assert.equal(val(fwd), "2026-03-16T12:00");
  assert.deepEqual(fwd.trace.skipped.map((s) => s.day), ["2026-03-15"]);
  /* across the holiday: back from Wed 03-18 06:00: Wed 6 h, Tue 03-17 (Harbour Day) skipped, Mon 10 h → Mon 03-16 14:00 */
  assert.equal(val(ev(t, "harbour_notice", minute("2026-03-18T06:00", HFX))), "2026-03-16T14:00");
  /* the first profile, OMC's 48 business hours on the City's list */
  assert.equal(val(ev(firstView(), "omc_special_meeting_notice", minute("2026-09-09T18:00", LA))), "2026-09-04T18:00", "Labor Day skipped");
});

test("R12 an extension is computed from the original due as R9–R10 count it; where its start is left open, an uncertain date with both candidates", () => {
  const v = firstView();
  /* FOIA: a business count ends on an open day, so both readings of the extension's start agree */
  assert.equal(ev(v, "foia_response", day("2026-10-05", LA)).extension.due.value, "2026-11-18");
  /* CPRA: day 10 is 09-25 (Native American Day, a judicial holiday), rolled to 09-28; +14 from either: 10-09 or 10-12 */
  const r = ev(v, "records_response", day("2026-09-15", LA));
  assert.deepEqual(r.extension.due.candidates.map((c) => c.value), ["2026-10-09", "2026-10-12"]);
  assert.match(r.trace.extension.notes.join(" "), /K1504 \(2\)/);
  /* where both readings agree, one date */
  assert.equal(ev(v, "records_response", day("2026-10-05", LA)).extension.due.value, "2026-10-29");
  /* the test profile: due Sat 03-14; 5 business days more: Mon 16, (Tue 17 closed), Wed 18, Thu 19, Fri 20, Sat 21 */
  const t = ev(testView(), "records_answer", day("2026-03-09", HFX));
  assert.equal(t.due.value, "2026-03-14");
  assert.equal(t.extension.due.value, "2026-03-21");
  assert.equal(t.extension.citation, "Test Stat. § 1.141");
});

test("R13 a month or year period lands on the same day-number; with no such day, the target month's last day and the next month's first", () => {
  const v = firstView();
  const m = (amount, units = "months") => custom({ units, amount });
  assert.equal(val(evaluateRule({ rule: m(6), anchor: day("2026-04-17", LA), view: v })), "2026-10-17");
  const end = evaluateRule({ rule: m(6), anchor: day("2026-08-31", LA), view: v });
  assert.deepEqual(end.due.candidates.map((c) => c.value), ["2027-02-28", "2027-03-01"]);
  assert.deepEqual(evaluateRule({ rule: m(1), anchor: day("2028-01-31", LA), view: v }).due.candidates.map((c) => c.value), ["2028-02-29", "2028-03-01"]);
  assert.deepEqual(evaluateRule({ rule: m(1, "years"), anchor: day("2024-02-29", LA), view: v }).due.candidates.map((c) => c.value), ["2025-02-28", "2025-03-01"]);
  assert.deepEqual(evaluateRule({ rule: { ...m(3), direction: "backward" }, anchor: day("2026-05-31", LA), view: v }).due.candidates.map((c) => c.value), ["2026-02-28", "2026-03-01"]);
  /* the test profile: 07-31 + 2 months has no 31st; and its own appeal_window rolls on the court list */
  assert.deepEqual(evaluateRule({ rule: m(2), anchor: day("2026-07-31", HFX), view: testView() }).due.candidates.map((c) => c.value), ["2026-09-30", "2026-10-01"]);
  assert.deepEqual(ev(testView(), "appeal_window", day("2026-06-29", HFX)).due.value, "2026-08-29");
});

test("R14 tolled days are not counted; a rule due by close of business is due at the governing office's close, or at the day with why", () => {
  const v = firstView();
  /* 10 calendar days from 10-05 with 10-07..10-09 tolled: 10-18 (Sun), rolled to Mon 10-19 */
  const r = ev(v, "records_response", day("2026-10-05", LA), { tolled: [{ from: "2026-10-07", to: "2026-10-09" }] });
  assert.equal(r.due.value, "2026-10-19");
  assert.deepEqual(r.trace.skipped.filter((s) => /tolled/.test(s.why)).map((s) => s.day), ["2026-10-07", "2026-10-08", "2026-10-09"]);
  assert.equal(ev(v, "records_response", day("2026-10-05", LA), { tolled: [{ from: "2026-10-09", to: "2026-10-07" }] }).refused, "DATE_INVALID");
  /* close of business: the test profile's registry_answer (4 business days, court list) at the Town Clerk's close,
     12:00 on Fridays */
  const t = testView();
  assert.deepEqual(ev(t, "registry_answer", day("2026-10-05", HFX), { office: "Town Clerk" }).due, { value: "2026-10-09T12:00", precision: "minute", zone: HFX });
  /* a due day the hours list no opening for (Saturday): the day, with why */
  const sat = ev(t, "registry_answer", day("2026-10-06", HFX), { office: "Town Clerk" });
  assert.deepEqual(sat.due, { value: "2026-10-10", precision: "day", zone: HFX });
  assert.match(sat.trace.notes.join(" "), /close of business is undetermined/);
  /* the test profile's tolling: its claim_notice, 90 days from 01-05 is Sun 04-05 → Mon 04-06; with 03-01..03-03 tolled, Wed 04-08 */
  assert.equal(ev(t, "claim_notice", day("2026-01-05", HFX)).due.value, "2026-04-06");
  assert.equal(ev(t, "claim_notice", day("2026-01-05", HFX), { tolled: [{ from: "2026-03-01", to: "2026-03-03" }] }).due.value, "2026-04-08");
  /* the first profile: the City Auditor closes at 17:00; the City Council has no hours held */
  const cob = custom({ units: "days", amount: 2, count: "business", due_at: "close_of_business" });
  assert.equal(val(evaluateRule({ rule: cob, anchor: day("2026-10-05", LA), view: v, office: "City Auditor" })), "2026-10-07T17:00");
  const none = evaluateRule({ rule: cob, anchor: day("2026-10-05", LA), view: v, office: "City Council" });
  assert.equal(none.due.value, "2026-10-07");
  assert.match(none.trace.notes.join(" "), /holds no hours/);
  /* a stated time */
  assert.equal(val(evaluateRule({ rule: { ...cob, due_at: "09:30" }, anchor: day("2026-10-05", LA), view: v, office: "City Council" })), "2026-10-07T09:30");
});

test("R15 the anchor: its local day in the governing zone; after a channel's cutoff, the next open day; a closed day moves only where a receipt rule says so", () => {
  const v = firstView();
  /* 2026-10-06T05:00Z is 22:00 on 10-05 in the view's zone */
  assert.equal(ev(v, "records_response", "2026-10-06T05:00:00Z").due.value, "2026-10-15");
  /* the first profile's records venue: received on Sunday 10-04 counts from Monday 10-05 (the City Attorney's guide) */
  const sun = ev(v, "records_response", day("2026-10-04", LA));
  assert.equal(sun.due.value, "2026-10-15");
  assert.equal(sun.trace.receipt.to, "2026-10-05");
  /* the test profile: its records venue's cutoff is 16:30, and a request received on a closed day counts from the next
     open day on the rule's list (Sun 03-15 → Mon 03-16; Harbour Day 03-17 → 03-18) */
  const t = testView();
  assert.equal(ev(t, "records_answer", minute("2026-03-12T16:29", HFX)).due.value, "2026-03-19");
  const late = ev(t, "records_answer", minute("2026-03-12T16:31", HFX));
  assert.equal(late.due.value, "2026-03-20");
  assert.deepEqual([late.trace.cutoff.from, late.trace.cutoff.to], ["2026-03-12", "2026-03-13"]);
  assert.equal(ev(t, "records_answer", day("2026-03-15", HFX)).due.value, "2026-03-23");
  assert.equal(ev(t, "records_answer", day("2026-03-17", HFX)).due.value, "2026-03-24");
  /* a rule whose venue holds no channel facts counts from the actual day, closed or not */
  assert.equal(val(evaluateRule({ rule: custom({ units: "days", amount: 1, count: "calendar" }), anchor: minute("2026-03-14T23:00", HFX), view: t })), "2026-03-15");
  assert.equal(val(evaluateRule({ rule: custom({ units: "days", amount: 1, count: "business", closures: "town" }), anchor: day("2026-03-15", HFX), view: t })), "2026-03-16");
  /* applies_on: the Monday rule answers only a Monday meeting; the test profile's, only Friday or Saturday */
  const tue = ev(v, "omc_special_meeting_monday", minute("2026-10-20T18:00", LA));
  assert.equal(tue.code, "RULE_NOT_APPLICABLE");
  assert.equal(val(ev(t, "notice_of_sitting_friday", minute("2026-10-09T19:00", HFX))), "2026-10-07T15:00");
  assert.equal(ev(t, "notice_of_sitting_friday", minute("2026-10-08T19:00", HFX)).code, "RULE_NOT_APPLICABLE");
});

test("R16 undetermined with why: an uncovered year, a withheld fact, a disputed or absent entry, an UNMEASURED basis, an undetermined anchor, a rule form not counted", () => {
  const v = firstView();
  /* the judicial list holds no 2027 */
  const y = ev(v, "records_response", day("2026-12-28", LA));
  assert.equal(y.code, "CALENDAR_UNCOVERED");
  assert.match(y.why, /2027/);
  /* withheld as a conflict */
  const c = firstView();
  delete c.weekend;
  c.conflicts = [{ at: "weekend", values: [], says: "the profiles disagree" }];
  assert.equal(ev(c, "records_response", day("2026-10-01", LA)).code, "FACT_WITHHELD");
  /* factOf: disputed and absent are undetermined; unconfirmed and corrected compute and say so */
  const st = (status, extra = {}) => () => ({ status, ...extra });
  assert.equal(ev(v, "records_response", day("2026-10-01", LA), { factOf: st("disputed") }).code, "FACT_DISPUTED");
  assert.equal(ev(v, "records_response", day("2026-10-01", LA), { factOf: st("absent", { why: "no fact" }) }).code, "FACT_ABSENT");
  assert.equal(ev(v, "records_response", day("2026-10-01", LA), { factOf: () => null }).code, "FACT_ABSENT");
  const un = ev(v, "records_response", day("2026-10-01", LA), { factOf: st("unconfirmed") });
  assert.equal(un.due.value, "2026-10-12");
  assert.match(un.trace.calendar.notes.join(" "), /unconfirmed calendar/);
  const cor = ev(v, "records_response", day("2026-09-30", LA), { factOf: st("corrected", { value: [{ date: "2026-10-12", name: "corrected in" }], by: "a member", at: "2026-10-02" }) });
  assert.equal(cor.due.value, "2026-10-13", "the corrected list governs");
  assert.match(cor.trace.calendar.notes.join(" "), /corrected on this instance by a member/);
  /* UNMEASURED */
  assert.equal(evaluateRule({ rule: custom({ units: "days", amount: 1, count: "calendar", basis: "UNMEASURED" }), anchor: day("2026-10-01", LA), view: v }).code, "UNMEASURED");
  /* an undetermined anchor */
  assert.equal(evaluateRule({ rule: ruleOf(v, "records_response"), anchor: { undetermined: true, why: "x" }, view: v }).code, "ANCHOR_UNDETERMINED");
  assert.equal(ev(v, "records_response", { value: "2026-10/..", precision: "edtf", zone: LA }).code, "ANCHOR_UNDETERMINED");
  /* rule forms */
  for (const [over, field] of [[{ units: "weeks", amount: 1 }, "units"], [{ units: "days", amount: 0, count: "calendar" }, "amount"],
    [{ units: "days", amount: 1.5, count: "calendar" }, "amount"], [{ units: "days", amount: 1, count: "court" }, "count"],
    [{ units: "days", amount: 1 }, "count"], [{ units: "hours", amount: 1, count: "calendar" }, "count"],
    [{ units: "days", amount: 1, count: "calendar", direction: "sideways" }, "direction"], [{ units: "days", amount: 1, count: "calendar", roll: "yes" }, "roll"],
    [{ units: "days", amount: 1, count: "calendar", due_at: "noon" }, "due_at"], [{ units: "days", amount: 1, count: "calendar", extension: { days: 0 } }, "extension"]]) {
    const r = evaluateRule({ rule: custom(over), anchor: day("2026-10-01", LA), view: v });
    assert.equal(r.code, "RULE_INVALID", field);
    assert.equal(r.field, field);
  }
  /* a computation the view does not hold, or one not counted here */
  assert.equal(evaluateRule({ rule: custom({ units: "days", amount: 1, count: "calendar", computation: "nope" }), anchor: day("2026-10-01", LA), view: v }).code, "FACT_ABSENT");
  const odd = firstView();
  odd.computation = [{ key: "ccp_12", rule: "include_both" }];
  assert.equal(ev(odd, "records_response", day("2026-10-01", LA)).code, "RULE_INVALID");
  /* a closure list the view does not hold */
  assert.equal(evaluateRule({ rule: custom({ units: "days", amount: 1, count: "business", closures: "lunar" }), anchor: day("2026-10-01", LA), view: v }).code, "FACT_ABSENT");
  /* the legacy shape (days: n, no units) reads as a day count */
  assert.equal(val(evaluateRule({ rule: { rule: "x", days: 3, count: "calendar", starts: "act" }, anchor: day("2026-10-01", LA), view: v })), "2026-10-04");
  assert.throws(() => evaluateRule({ rule: ruleOf(v, "records_response"), view: v }), TypeError);
  assert.throws(() => evaluateRule({ rule: ruleOf(v, "records_response"), anchor: day("2026-10-01", LA) }), TypeError);
});

test("R17 an uncertain date is {due: {candidates: [earliest, latest]}}: from an EDTF anchor, a month end or an open extension", () => {
  const v = firstView();
  const r = ev(v, "records_response", { value: "2026-10", precision: "edtf", zone: LA });
  /* 10-01 → 10-12; 10-31, a Saturday, is received Monday 11-02 (the venue's receipt rule) → 11-12 */
  assert.deepEqual(r.due.candidates.map((c) => c.value), ["2026-10-12", "2026-11-12"]);
  for (const c of r.due.candidates) assert.equal(c.precision, "day");
  const t = ev(testView(), "records_answer", { value: "2026-03-12/2026-03-13", precision: "edtf", zone: HFX });
  assert.deepEqual(t.due.candidates.map((c) => c.value), ["2026-03-19", "2026-03-20"]);
});

test("R18 due: the four basis kinds; law_set only for rule; dependency moves with the event it precedes; an unknown kind is refused", () => {
  const v = firstView();
  const rule = due({ basis: "rule", rule: ruleOf(v, "records_response"), anchor: day("2026-10-05", LA), view: v });
  assert.deepEqual([rule.due.value, rule.basis_kind, rule.law_set], ["2026-10-15", "rule", true]);
  assert.ok(rule.trace);
  const com = due({ basis: "commitment", date: day("2026-11-01", LA), citation: "the body's letter of 2026-10-02" });
  assert.deepEqual([com.due.value, com.basis_kind, com.law_set, com.trace.citation], ["2026-11-01", "commitment", false, "the body's letter of 2026-10-02"]);
  const win = due({ basis: "window", date: day("2026-11-03", LA) });
  assert.deepEqual([win.basis_kind, win.law_set], ["window", false]);
  const dep = (meeting) => due({ basis: "dependency", precedes: day(meeting, LA), lead: 7, why: "comments before the hearing", view: v });
  assert.deepEqual([dep("2026-10-20").due.value, dep("2026-10-27").due.value], ["2026-10-13", "2026-10-20"]);
  assert.equal(dep("2026-10-20").law_set, false);
  const bus = due({ basis: "dependency", precedes: day("2026-03-18", HFX), lead: { amount: 3, count: "business", closures: "town" }, view: testView() });
  assert.equal(bus.due.value, "2026-03-13", "Mon 16, Sat 14, Fri 13 (Tue 17 and Sun 15 closed)");
  assert.equal(due({ basis: "deadline" }).refused, "BASIS_UNKNOWN");
  assert.throws(() => due({}), TypeError);
  const undet = due({ basis: "rule", rule: ruleOf(v, "records_response"), anchor: day("2026-12-28", LA), view: v });
  assert.deepEqual([undet.undetermined, undet.basis_kind, undet.law_set], [true, "rule", true]);
});

test("R19 overdueOn: on the at's local day in the due's zone, never the UTC day; group takes the earliest candidate, body only after the latest", () => {
  const d = day("2026-10-15", LA);
  /* 2026-10-16T05:00Z is still 10-15 in LA: not overdue, though the UTC day is 10-16 */
  assert.equal(overdueOn({ due: d, at: "2026-10-16T05:00:00Z", side: "group" }), "not_overdue");
  assert.equal(overdueOn({ due: d, at: "2026-10-16T07:00:00Z", side: "body" }), "overdue");
  /* a minute due: overdue from the next minute on */
  const noon = minute("2026-10-16T12:00", LA);
  assert.equal(overdueOn({ due: noon, at: "2026-10-16T19:00:59Z", side: "body" }), "not_overdue");
  assert.equal(overdueOn({ due: noon, at: "2026-10-16T19:01:00Z", side: "body" }), "overdue");
  /* candidates */
  const u = { candidates: [day("2026-10-09", LA), day("2026-10-12", LA)] };
  assert.equal(overdueOn({ due: u, at: "2026-10-10T19:00:00Z", side: "group" }), "overdue");
  const between = overdueOn({ due: u, at: "2026-10-10T19:00:00Z", side: "body" });
  assert.equal(between.undetermined, true);
  assert.match(between.why, /^possibly overdue: undetermined, because/);
  assert.equal(overdueOn({ due: u, at: "2026-10-13T19:00:00Z", side: "body" }), "overdue");
  assert.equal(overdueOn({ due: u, at: "2026-10-09T19:00:00Z", side: "body" }), "not_overdue");
  /* a result of evaluateRule or due is read through its due; undetermined stays undetermined */
  const r = evaluateRule({ rule: ruleOf(firstView(), "records_response"), anchor: day("2026-10-05", LA), view: firstView() });
  assert.equal(overdueOn({ due: r, at: "2026-10-16T08:00:00Z", side: "body" }), "overdue");
  assert.equal(overdueOn({ due: { undetermined: true, why: "x" }, at: "2026-10-16T08:00:00Z", side: "body" }).undetermined, true);
  assert.equal(overdueOn({ due: d, at: "2026-10-16", side: "body" }).refused, "DATE_INVALID");
  assert.equal(overdueOn({ due: d, at: "2026-10-16T08:00:00Z", side: "agency" }).refused, "SIDE_UNKNOWN");
  assert.throws(() => overdueOn({ due: d, side: "body" }), TypeError);
});

test("R24 span: days, business days, hours, months and years on local days; min and max bound every reading and are equal when exact", () => {
  const v = firstView(), t = testView();
  assert.deepEqual(pick(span(day("2026-10-05", LA), day("2026-10-15", LA), { unit: "days" })), [10, 10]);
  assert.deepEqual(pick(span(day("2026-10-15", LA), day("2026-10-05", LA), { unit: "days" })), [-10, -10]);
  assert.deepEqual(pick(span({ value: "2026-10", precision: "edtf", zone: LA }, day("2026-11-15", LA), { unit: "days" })), [15, 45]);
  /* local days: 2026-10-06T05:00Z is 10-05 in LA */
  assert.deepEqual(pick(span("2026-10-06T05:00:00Z", day("2026-10-06", LA), { unit: "days" })), [0, 0]);
  /* business days as R9 counts: the test profile, 10-07 to 10-15 */
  assert.deepEqual(pick(span(day("2026-03-12", HFX), day("2026-03-19", HFX), { unit: "business days", view: t, closures: "town" })), [5, 5]);
  assert.deepEqual(pick(span(day("2026-10-05", LA), day("2026-10-15", LA), { unit: "business days", view: v, office: "City Council" })), [8, 8]);
  const noWk = firstView(); delete noWk.weekend;
  assert.equal(span(day("2026-10-05", LA), day("2026-10-15", LA), { unit: "business days", view: noWk }).undetermined, true);
  /* hours across the autumn change */
  assert.deepEqual(pick(span(minute("2026-11-01T00:00", LA), minute("2026-11-02T00:00", LA), { unit: "hours" })), [25, 25]);
  assert.deepEqual(pick(span(day("2026-11-01", LA), day("2026-11-02", LA), { unit: "hours" })), [0, 49]);
  /* months and years */
  assert.deepEqual(pick(span(day("2026-01-31", LA), day("2026-02-28", LA), { unit: "months" })), [0, 0]);
  assert.deepEqual(pick(span(day("2026-01-15", LA), day("2026-03-15", LA), { unit: "months" })), [2, 2]);
  assert.deepEqual(pick(span(day("2020-02-29", LA), day("2026-02-28", LA), { unit: "years" })), [5, 5]);
  assert.deepEqual(pick(span({ value: "2020", precision: "edtf", zone: LA }, day("2026-06-30", LA), { unit: "years" })), [5, 6]);
  assert.equal(span({ value: "2020/..", precision: "edtf", zone: LA }, day("2026-06-30", LA), { unit: "days" }).undetermined, true);
  assert.equal(span(day("2026-01-01", LA), day("2026-02-01", LA), { unit: "weeks" }).refused, "UNIT_UNKNOWN");
  assert.throws(() => span(day("2026-01-01", LA), day("2026-02-01", LA)), TypeError);
});
const pick = (r) => { assert.ok(r && Number.isInteger(r.min), JSON.stringify(r)); assert.ok(r.trace); return [r.min, r.max]; };

test("R25 traces: the rule and citation, the anchor, each skipped day with why, roll, extension, cutoff, each entry's status, and the runtime's tz and ICU versions", () => {
  const v = firstView();
  const r = ev(v, "records_response", day("2026-09-04", LA), { factOf: () => ({ status: "unconfirmed" }) });
  const tr = r.trace;
  assert.equal(tr.rule, "records_response");
  assert.equal(tr.citation, ruleOf(v, "records_response").citation);
  assert.deepEqual(tr.anchor, day("2026-09-04", LA));
  assert.equal(tr.anchor_day, "2026-09-04");
  assert.equal(r.due.value, "2026-09-14");
  assert.equal(tr.closures, "judicial");
  assert.ok(tr.calendar.entries.every((e) => e.status === "unconfirmed" && e.list === "judicial"));
  assert.ok(tr.extension && tr.extension.citation === ruleOf(v, "records_response").extension.citation);
  for (const k of ["tz", "icu"]) assert.equal(typeof tr.runtime[k], "string");
  assert.equal(tr.runtime.tz, process.versions.tz || "unknown");
  assert.equal(tr.runtime.icu, process.versions.icu || "unknown");
  /* a rolled and a skipped day, each with why */
  const s = ev(v, "records_response", day("2026-08-26", LA));
  assert.deepEqual(s.trace.roll[0].passed.map((p) => [p.day, p.why]),
    [["2026-09-05", "weekend (sat)"], ["2026-09-06", "weekend (sun)"], ["2026-09-07", "Labor Day (judicial)"]]);
  const b = ev(testView(), "records_answer", minute("2026-03-12T16:45", HFX));
  assert.equal(b.trace.cutoff.time, "16:30");
  assert.equal(b.trace.cutoff.citation, "Test Stat. § 1.105");
  assert.ok(b.trace.skipped.every((x) => typeof x.why === "string" && x.why.length));
  /* due, span and expandRecurrence carry one too (expandRecurrence: recurrence.test.mjs) */
  assert.ok(due({ basis: "window", date: day("2026-11-03", LA) }).trace.runtime);
  assert.ok(span(day("2026-10-05", LA), day("2026-10-15", LA), { unit: "days" }).trace.runtime);
});
