/* civil-time's tests: the jurisdiction views every service is tested against (R27): the first profile and the test
 * profile, through `jurisdictions.combine`. Until `jurisdictions`' T33 job (T33-2) merges, the facts T33 adds to the
 * profiles (R26 widened, R46–R49) are supplied here from their primary sources (`measures-T33/time-law.md` §1;
 * K1513 adopted this reading), each with its citation, and merged into the real view; a fact the profile already holds
 * is never overwritten except the `UNMEASURED` records rule, which T33-2 re-sources. Counting is this module's; the
 * facts are the profiles'. Historical closure-list years (2018, 2020, 2024) that the worked examples count through
 * are fixture data for those examples, each with its citation. */
import { combine } from "../../../../jurisdictions/index.mjs";

const h = (date, name) => ({ date, name });
const yearList = (list, year, days, citation, basis) => ({ year, list, days, citation, status: "researched", basis });

/* CCP §135 judicial holidays, as the Superior Court's calendars list them (M-189 for 2026). */
const JUDICIAL = [
  yearList("judicial", 2018, [h("2018-01-01", "New Year's Day"), h("2018-01-15", "Martin Luther King Jr. Day"), h("2018-02-12", "Lincoln Day"),
    h("2018-02-19", "Washington Day"), h("2018-03-30", "Cesar Chavez Day (observed)"), h("2018-05-28", "Memorial Day"),
    h("2018-07-04", "Independence Day"), h("2018-09-03", "Labor Day"), h("2018-09-10", "Admission Day (observed)"),
    h("2018-10-08", "Columbus Day"), h("2018-11-12", "Veterans Day (observed)"), h("2018-11-22", "Thanksgiving Day"),
    h("2018-11-23", "Day after Thanksgiving"), h("2018-12-25", "Christmas Day")], "Code Civ. Proc. § 135 (2018)", "2026-10-05"),
  yearList("judicial", 2020, [h("2020-01-01", "New Year's Day"), h("2020-01-20", "Martin Luther King Jr. Day"), h("2020-02-12", "Lincoln Day"),
    h("2020-02-17", "Washington Day"), h("2020-03-31", "Cesar Chavez Day"), h("2020-05-25", "Memorial Day"),
    h("2020-07-03", "Independence Day (observed)"), h("2020-09-07", "Labor Day"), h("2020-09-09", "Admission Day"),
    h("2020-10-12", "Columbus Day"), h("2020-11-11", "Veterans Day"), h("2020-11-26", "Thanksgiving Day"),
    h("2020-11-27", "Day after Thanksgiving"), h("2020-12-25", "Christmas Day")], "Code Civ. Proc. § 135 (2020, before AB 855)", "2026-10-05"),
  yearList("judicial", 2024, [h("2024-01-01", "New Year's Day"), h("2024-01-15", "Martin Luther King Jr. Day"), h("2024-02-12", "Lincoln Day"),
    h("2024-02-19", "Washington Day"), h("2024-04-01", "Cesar Chavez Day (observed)"), h("2024-05-27", "Memorial Day"),
    h("2024-06-19", "Juneteenth"), h("2024-07-04", "Independence Day"), h("2024-09-02", "Labor Day"), h("2024-09-09", "Admission Day"),
    h("2024-09-27", "Native American Day"), h("2024-11-11", "Veterans Day"), h("2024-11-28", "Thanksgiving Day"),
    h("2024-11-29", "Day after Thanksgiving"), h("2024-12-25", "Christmas Day")], "Code Civ. Proc. § 135 (2024)", "2026-10-05"),
  yearList("judicial", 2026, [h("2026-01-01", "New Year's Day"), h("2026-01-19", "Martin Luther King Jr.'s Birthday"),
    h("2026-02-12", "Lincoln's Birthday"), h("2026-02-16", "Washington's Birthday"), h("2026-03-31", "Pursuant to CCP § 135"),
    h("2026-05-25", "Memorial Day"), h("2026-06-19", "Juneteenth"), h("2026-07-03", "Independence Day"), h("2026-09-07", "Labor Day"),
    h("2026-09-25", "Native American Day"), h("2026-11-11", "Veteran's Day"), h("2026-11-26", "Thanksgiving Day"),
    h("2026-11-27", "Day after Thanksgiving"), h("2026-12-25", "Christmas Day")], "Code Civ. Proc. §§ 12a, 135", "M-189"),
];
/* The City's holiday list (M-190): Columbus Day and Native American Day are not on it. */
const CITY = yearList("city", 2026, [h("2026-01-01", "New Year's Day"), h("2026-01-19", "Dr. Martin Luther King, Jr. Day"),
  h("2026-02-16", "President's Day"), h("2026-03-31", "Cesar Chavez Day"), h("2026-05-25", "Memorial Day"),
  h("2026-06-19", "Juneteenth National Independence Day"), h("2026-07-04", "Independence Day"), h("2026-09-07", "Labor Day"),
  h("2026-11-26", "Thanksgiving Day"), h("2026-11-27", "Day After Thanksgiving"), h("2026-12-25", "Christmas Day")],
  "City of Oakland holiday list", "M-190");
/* Legal public holidays, 5 U.S.C. § 6103(a) (derived rows F1–F3: not fetched, time-law §3). */
const FEDERAL = yearList("federal", 2026, [h("2026-01-01", "New Year's Day"), h("2026-01-19", "Birthday of Martin Luther King, Jr."),
  h("2026-02-16", "Washington's Birthday"), h("2026-05-25", "Memorial Day"), h("2026-06-19", "Juneteenth"),
  h("2026-07-03", "Independence Day (observed)"), h("2026-09-07", "Labor Day"), h("2026-10-12", "Columbus Day"),
  h("2026-11-11", "Veterans Day"), h("2026-11-26", "Thanksgiving Day"), h("2026-12-25", "Christmas Day")], "5 U.S.C. § 6103(a)", "2026-10-05");

const sourced = { status: "researched", basis: "2026-10-05" };
export const FIRST_FACTS = {
  weekend: { days: ["sat", "sun"], citation: "Code Civ. Proc. § 12a(a); Gov. Code § 6700", ...sourced },
  computation: [{ key: "ccp_12", rule: "exclude_first_include_last", citation: "Code Civ. Proc. § 12; Gov. Code § 6800", ...sourced }],
  holidays: [...JUDICIAL, CITY, FEDERAL],
  receipt: { kind: "records_request", receipt: { rule: "next_business_day", citation: "City Attorney, CPRA staff guide § 5 (2025-04-29)", ...sourced } },
  fiscal_year: [{ body: "*", start: "07-01", named_by: "end", label: "FY{start}-{end2}", ...sourced }],
  deadlines: [
    { rule: "records_response", applies_to: "records_request", units: "days", amount: 10, count: "calendar", starts: "received",
      roll: true, closures: "judicial", computation: "ccp_12",
      extension: { days: 14, count: "calendar", when: "unusual circumstances, by written notice", citation: "Gov. Code § 7922.535(b)" },
      observed: { closures: "city", status: "researched", basis: "M-190" },
      citation: "Gov. Code § 7922.535(a); Code Civ. Proc. §§ 12, 12a", ...sourced },
    { rule: "brown_act_regular_agenda", applies_to: "claim", units: "hours", amount: 72, direction: "backward", starts: "act",
      citation: "Gov. Code § 54954.2(a)(1)", ...sourced },
    { rule: "omc_special_meeting_notice", applies_to: "claim", units: "business_hours", amount: 48, direction: "backward", starts: "act",
      closures: "city", citation: "OMC 2.20.070", ...sourced },
    { rule: "omc_special_meeting_notice_monday", applies_to: "claim", units: "days", amount: 3, count: "calendar", direction: "backward",
      starts: "act", applies_on: ["mon"], due_at: "12:00", citation: "OMC 2.20.070(C)", ...sourced },
    { rule: "government_claim", applies_to: "claim", units: "months", amount: 6, starts: "act", roll: true, closures: "judicial",
      computation: "ccp_12", citation: "Gov. Code §§ 911.2(a), 945.6(a)(1)", ...sourced },
    { rule: "foia_response", applies_to: "claim", units: "days", amount: 20, count: "business", starts: "received", closures: "federal",
      extension: { days: 10, count: "business", from: "rolled", when: "unusual circumstances", citation: "5 U.S.C. § 552(a)(6)(B)(i)" },
      citation: "5 U.S.C. § 552(a)(6)(A)(i)", ...sourced },
  ],
};

/* The test profile's T33 facts: made up (TEST), and different from the first profile's in each. */
const TEST = { status: "researched", basis: "TEST" };
export const TEST_FACTS = {
  weekend: { days: ["fri", "sat"], citation: "Test Stat. § 0.10", ...TEST },
  computation: [{ key: "pe_count", rule: "exclude_first_include_last", citation: "Test Stat. § 0.12", ...TEST }],
  holidays: [
    yearList("statute_days", 2026, [h("2026-10-12", "Harbour Regatta Day"), h("2026-12-25", "Christmas Day")], "Test Stat. § 0.14", "TEST"),
    yearList("clerk_practice", 2026, [h("2026-10-12", "Harbour Regatta Day"), h("2026-10-13", "Clerk's closure")], "Test Clerk notice", "TEST"),
  ],
  receipt: { kind: "records_request", cutoff: { time: "16:00", citation: "P.E.B.L. § 4.3", ...TEST } },
  fiscal_year: [{ body: "Port Ellery Selectboard", start: "04-01", named_by: "start", label: "FY{start}", ...TEST }],
  deadlines: [
    { rule: "records_answer", applies_to: "records_request", units: "days", amount: 5, count: "business", starts: "received",
      closures: "statute_days", computation: "pe_count", roll: true,
      extension: { days: 5, count: "business", when: "the records are held off site", citation: "Test Stat. § 1.141" },
      observed: { closures: "clerk_practice", status: "researched", basis: "TEST" },
      citation: "Test Stat. § 1.140", ...TEST },
    { rule: "harbour_notice", applies_to: "claim", units: "business_hours", amount: 24, direction: "backward", starts: "act",
      closures: "statute_days", due_at: "close_of_business", citation: "P.E.B.L. § 9", ...TEST },
  ],
};

function merge(view, facts) {
  const v = structuredClone(view);
  if (!v.weekend) v.weekend = facts.weekend;
  if (!Array.isArray(v.computation)) v.computation = facts.computation;
  if (!Array.isArray(v.fiscal_year)) v.fiscal_year = facts.fiscal_year;
  v.holidays = Array.isArray(v.holidays) ? v.holidays : [];
  for (const x of facts.holidays) if (!v.holidays.some((y) => y.list === x.list && y.year === x.year)) v.holidays.push(x);
  v.deadlines = Array.isArray(v.deadlines) ? v.deadlines : [];
  for (const d of facts.deadlines) {
    const i = v.deadlines.findIndex((x) => x.rule === d.rule && x.applies_to === d.applies_to);
    if (i < 0) v.deadlines.push(d);
    else if (v.deadlines[i].basis === "UNMEASURED" || v.deadlines[i].units === undefined) v.deadlines[i] = d;
  }
  const k = (v.action_kinds || []).find((x) => x.kind === facts.receipt.kind);
  if (k && k.venue) {
    if (facts.receipt.receipt && !k.venue.receipt) k.venue.receipt = facts.receipt.receipt;
    if (facts.receipt.cutoff && !k.venue.cutoff) k.venue.cutoff = facts.receipt.cutoff;
  }
  return v;
}

function viewOf(id, facts) {
  const r = combine([id]);
  if (!r.ok) throw new Error(`combine([${id}]) failed: ${JSON.stringify(r.errors)}`);
  return merge(r.view, facts);
}

/** The first profile's view and the test profile's, each a fresh copy. */
export const firstView = () => viewOf("oakland-alameda", FIRST_FACTS);
export const testView = () => viewOf("test-port-ellery", TEST_FACTS);
export const ruleOf = (view, name) => {
  const r = view.deadlines.find((d) => d.rule === name);
  if (!r) throw new Error(`no rule ${name} in ${view.id}`);
  return r;
};
export const day = (value, zone) => ({ value, precision: "day", zone });
export const minute = (value, zone) => ({ value, precision: "minute", zone });
