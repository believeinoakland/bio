/* The worked deadline examples of `build/plan/measures-T33/time-law.md` §3, held as fixtures with their sources
 * (R57; K1504, K1505 (16)). Counting them is `civil-time`'s (its R29), never this module's: this module's tests show
 * only that the first profile supplies, with a citation, every fact each fixture needs.
 *
 * Each row: `id`, `kind` (P published, R official record, C the code's own example, E a published example that is
 * wrong, negative only, D derived), `rule` (the first profile's rule it counts, or null when the fixture's own
 * `court_rule` is a court-procedure period outside R56's set), `start` (the anchor), `expected` (the due; null for an
 * E row, whose statutory answer is in `statutory`), `negative` (an answer that must not be reached, or must be
 * refused), `needs` (the profile facts the count reads: a closure list and the years it must cover, the weekend, the
 * computation, a receipt or cutoff rule), `source`, and for D rows `derived: true` (used as a positive only after a
 * second source confirms it, P7). */

export const FIXTURES = [
  { id: "P1", kind: "P", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 1005(b)", units: "days", amount: 16, count: "business", direction: "backward", starts: "hearing" },
    start: "2018-06-18", expected: "2018-05-24", negative: "2018-05-25", why_negative: "Memorial Day 2018-05-28 counted",
    needs: { closures: "judicial", years: [2018], weekend: true }, source: "saclaw.org/resource_library/calculate-deadlines-to-file-and-serve/" },
  { id: "P2", kind: "P", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 1005(b) (service by mail, +5 calendar days)", units: "days", amount: 5, count: "calendar", direction: "backward", starts: "hearing", roll: true },
    start: "2018-06-18", expected: "2018-05-18", negative: "2018-05-19", why_negative: "no backward roll",
    needs: { closures: "judicial", years: [2018], weekend: true }, source: "saclaw.org/resource_library/calculate-deadlines-to-file-and-serve/" },
  { id: "P3", kind: "P", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 2030.260", units: "days", amount: 30, count: "calendar", direction: "forward", starts: "served", roll: true },
    start: "2026-04-01", expected: "2026-05-01", negative: "2026-04-30", why_negative: "the start day counted",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "litigationbythenumbers.com/getting-date-right.html" },
  { id: "P4", kind: "P", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 12 (20 calendar days)", units: "days", amount: 20, count: "calendar", direction: "forward", starts: "served", roll: true },
    start: "2026-04-03", expected: "2026-04-23", negative: "2026-04-24", why_negative: "a court holiday mid-period wrongly excluded",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "rulesofcivilprocedure.com/guides/computing-deadlines/" },
  { id: "P5", kind: "P", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. §§ 12, 12a (30 days, personal service)", units: "days", amount: 30, count: "calendar", direction: "forward", starts: "served", roll: true },
    start: "2020-10-01", expected: "2020-11-02", negative: "2020-10-31", why_negative: "no roll past Saturday",
    needs: { closures: "judicial", years: [2020], weekend: true, computation: "ccp_12" }, source: "evanwalkerlaw.com/blog/how-to-calendar-dates-in-california-court/" },
  { id: "P6", kind: "P", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 1005(b) (2020 calendar)", units: "days", amount: 16, count: "business", direction: "backward", starts: "hearing" },
    start: "2020-10-30", expected: "2020-10-07", negative: "2020-10-08", why_negative: "2026's § 135 list applied to 2020 (Columbus Day was then a judicial holiday)",
    needs: { closures: "judicial", years: [2020], weekend: true }, source: "evanwalkerlaw.com/blog/how-to-calendar-dates-in-california-court/; AB 855 (leginfo)" },
  { id: "E1", kind: "E", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 1013(a) (mail, +5 calendar days added to 30)", units: "days", amount: 35, count: "calendar", direction: "forward", starts: "served", roll: true },
    start: "2020-10-01", expected: null, statutory: "2020-11-05", negative: "2020-11-06", why_negative: "the published answer (day 30 put at Nov 1)",
    needs: { closures: "judicial", years: [2020], weekend: true, computation: "ccp_12" }, source: "evanwalkerlaw.com/blog/how-to-calendar-dates-in-california-court/" },
  { id: "E2", kind: "E", rule: null, court_rule: { citation: "Cal. Code Civ. Proc. § 1010.6 (electronic service, +2 court days)", units: "days", amount: 2, count: "business", direction: "forward", starts: "served" },
    start: "2020-10-01", expected: null, statutory: "2020-11-03", negative: "2020-11-04", why_negative: "the published answer",
    needs: { closures: "judicial", years: [2020], weekend: true }, source: "evanwalkerlaw.com/blog/how-to-calendar-dates-in-california-court/" },
  { id: "R1", kind: "R", rule: "claim_suit_after_rejection", start: "2023-11-17", expected: "2024-05-17", negative: "2024-05-18", why_negative: "a day past six months",
    needs: { closures: "judicial", years: [2024], weekend: true }, source: "Santa Barbara Super. Ct., tentative ruling 24CV05742 (santabarbara.courts.ca.gov)" },
  { id: "C1", kind: "C", rule: "omc_special_meeting_monday", start: "2026-10-19T00:00", monday_rule: true,
    expected: "2026-10-16T12:00", negative: "2026-10-16T12:01", why_negative: "posting after noon on the preceding Friday is refused",
    needs: {}, source: "OMC 2.20.070(C) (Municode API); City Attorney Brown Act/Sunshine overview 2021-04 p. 10" },
  { id: "O1", kind: "R", rule: "records_response", start: "2026-10-05", expected: "2026-10-15", negative: "2026-10-14",
    needs: { closures: "city", observed: true, years: [2026], weekend: true, computation: "ccp_12" }, source: "NextRequest 26-11824" },
  { id: "O2", kind: "R", rule: "records_response", start: "2026-10-01", expected: "2026-10-12", negative: "2026-10-11", why_negative: "no roll past Sunday",
    needs: { closures: "city", observed: true, years: [2026], weekend: true, computation: "ccp_12" }, source: "NextRequest 26-11728" },
  { id: "O3", kind: "R", rule: "records_response", start: "2026-09-30", expected: "2026-10-12", negative: "2026-10-10", why_negative: "no roll past Saturday",
    needs: { closures: "city", observed: true, years: [2026], weekend: true, computation: "ccp_12" }, source: "NextRequest 26-11682" },
  { id: "O4", kind: "R", rule: "records_response", start: "2026-08-26", expected: "2026-09-08", negative: "2026-09-07", why_negative: "Labor Day not a closure",
    needs: { closures: "city", observed: true, years: [2026], weekend: true, computation: "ccp_12" }, source: "NextRequest 26-10008" },
  { id: "O5", kind: "R", rule: "records_response", start: "2026-10-02", expected: "2026-10-12", negative: "2026-10-13", why_negative: "Columbus Day taken as a closure",
    needs: { closures: "city", observed: true, years: [2026], weekend: true, computation: "ccp_12" }, source: "NextRequest 26-11741" },
  { id: "O6", kind: "R", rule: "records_response", start: "2026-09-15", expected: "2026-09-25", practice: true,
    negative: null, why_negative: "see N6: this is the City's observed practice, not the statutory answer",
    needs: { closures: "city", observed: true, years: [2026], weekend: true, computation: "ccp_12" }, source: "NextRequest (33 requests dated 09/15 → 09/25)" },
  { id: "N6", kind: "D", rule: "records_response", start: "2026-09-15", expected: "2026-09-28", negative: "2026-09-25",
    why_negative: "the City-practice answer, flagged as observed practice, never the statutory one",
    needs: { closures: "judicial", years: [2026], weekend: true, computation: "ccp_12" }, source: "Cal. Code Civ. Proc. §§ 12, 12a, 135 (leginfo); K1504 (1)" },
  { id: "F1", kind: "D", derived: true, rule: "foia_response", start: "2026-10-05", expected: "2026-11-03", negative: "2026-11-02", why_negative: "Columbus Day 10-12 counted",
    needs: { closures: "federal", years: [2026], weekend: true }, source: "5 U.S.C. § 552(a)(6)(A)(i); 5 U.S.C. § 6103(a)" },
  { id: "F2", kind: "D", derived: true, rule: "foia_response", extension: true, start: "2026-10-05", expected: "2026-11-18", negative: "2026-11-17", why_negative: "Veterans Day 11-11 counted",
    needs: { closures: "federal", years: [2026], weekend: true }, source: "5 U.S.C. § 552(a)(6)(B)(i)" },
  { id: "F3", kind: "D", derived: true, rule: "foia_response", start: "2026-11-04", expected: "2026-12-04", negative: "2026-12-03", why_negative: "Thanksgiving 11-26 counted",
    needs: { closures: "federal", years: [2026], weekend: true }, source: "5 U.S.C. § 552(a)(6)(A)(i)" },
];

/* The OMC 48-business-hour fixture, re-derived by this job from the code's plain text and the City's list (K1505
 * (16)): "at least forty-eight (48) hours (excluding Saturdays, Sundays and holidays) before the time of the meeting
 * set forth in the agenda" (OMC 2.20.070), the holidays being the City's (M-190; K1504 (5)), on which 2026-10-12
 * (Columbus Day) is not a closure. Counting back 48 hours from Wed 2026-10-14 18:00 crosses Tuesday and Monday, both
 * open, so notice is due by Mon 2026-10-12 18:00. time-law §3's "Fri 2026-10-09 18:00" counts 10-12 as a holiday and
 * is held here as the negative. */
export const OMC_48 = {
  id: "OMC-48", kind: "D", derived: true, rule: "omc_special_meeting_notice",
  text: "at least forty-eight (48) hours (excluding Saturdays, Sundays and holidays) before the time of the meeting set forth in the agenda",
  start: "2026-10-14T18:00", expected: "2026-10-12T18:00",
  negatives: [{ at: "2026-10-09T18:00", why: "2026-10-12 wrongly excluded as a holiday (time-law §3's derived row)" },
    { at: "2026-10-12T18:01", why: "a minute late" }],
  needs: { closures: "city", years: [2026], weekend: true }, source: "OMC 2.20.070 (Municode API, Supp. 103); City holiday list M-190",
};

/* time-law §3's other derived timed check: the Brown Act's 72 clock hours before a regular meeting. */
export const BROWN_72 = {
  id: "BA-72", kind: "D", derived: true, rule: "agenda_posting_regular", start: "2026-10-20T18:00", expected: "2026-10-17T18:00",
  negatives: [{ at: "2026-10-17T18:01", why: "a minute late" }], needs: {}, source: "Cal. Gov. Code § 54954.2(a)(1)",
};
