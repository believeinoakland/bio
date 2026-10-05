# jurisdictions (T33)

**Status** · session_016rKi7FqGrzSeDuh4w2sUJ7 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four points where R26/R46/R56/R57 leave a choice; I carry on with my best reading of each and will bring the work in line with your answer.

1. **Fixtures whose facts no source in hand gives (R57 "the first profile supplies every fact each fixture needs").** P1–P6, E1, E2 and R1 count court-procedure periods outside R56's rule set (CCP §§1005(b), 1013(a), 1010.6, 2030.260; Gov. Code §945.6(a)(1)); P1 needs the judicial holidays of 2018 and P6 those of 2020 (time-law.md gives only Memorial Day 2018 and the 2020 Columbus Day point, and R33 makes a listed year complete); F1–F3 need the 2026 federal legal public holidays (5 U.S.C. §6103(a), "not fetched" in time-law). R44 forbids writing a calendar fact without a source.
   **Best reading:** the fixtures hold their court rule as fixture data with its citation (the profile holds only R56's rules plus §945.6(a)(1), which I add as a Claims Act rule, `applies_to: claim`); the first profile holds `weekend`, the CCP §12 `computation`, the CCP §135 list for 2026 (M-189's dates) and the City list 2026 (M-190); for 2018, 2020 and the federal 2026 list the test asserts the year is NOT held (so a count there is undetermined) and labels those rows "needs a measured year". I REPORT the three missing years as a measurement to take (CCP §135 lists for 2018 and 2020; OPM's 2026 federal list). If you would rather I derive and hold them from the statutes' text (basis `2026-10-05 time-law`), say so.

2. **`applies_to` for a body's own obligation** (Brown Act §54954.2(a)(1) 72 h, §54956(a) 24 h, OMC 2.20.070 48 business hours): R26 allows only a kind or `claim`. **Best reading:** `applies_to: "public_comment"` (the group's act whose timing the posting governs), `starts: "act"` (the meeting), `direction: backward`. Claims Act §911.2(a): `applies_to: claim`, `starts: "act"` (accrual).

3. **OMC 2.20.070(C)'s Monday rule** (notice timely if made by noon on the preceding Friday): no R26/R46 field holds it, and R46 names one `computation` rule. **Best reading:** a `computation` entry `{key: "omc_monday_special", rule: "monday_prior_friday_noon", citation: "OMC 2.20.070(C)"}` named by a second rule `omc_special_notice_monday` (applies when the meeting is on a Monday); validate accepts `computation.rule` from {`exclude_first_include_last`, `monday_prior_friday_noon`}. civil-time would count it.

4. **The OMC 48-business-hour fixture, re-derived (K1505 (16)).** From the code's text ("48 hours (excluding Saturdays, Sundays and holidays)") and the City list (M-190, which has no 2026-10-12): a meeting Wed 2026-10-14 18:00 is noticed by **Mon 2026-10-12 18:00**, not time-law's Fri 2026-10-09 18:00 (which counts 10-12 as a holiday). I hold Mon 10-12 18:00 as expected and Fri 10-09 18:00 (Columbus Day wrongly excluded) and Mon 10-12 18:01 as negatives. No answer needed unless you disagree; civil-time's job should use the same row.
