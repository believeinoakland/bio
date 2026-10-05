# Study: TIME (A-TIME, BOB #110 study, 2026-10-05)

Analyst for TIME. Read whole: `constructs-brief.md`, `digest/TIME.md` (1–1455), `digest/DOCTRINE-REGISTER.md` (1–2814), `digest/CROSS-REGISTER.md` (1–1049), and the `## Modules` sections of `notes/M1.md`–`M5.md`. Code and requirements re-checked on `tranche/T32` @ `09837e3ddc` (§9). "Digest" cites name the reader's source and line; `D<n>`/`X<n>` are register entries.

## 1. Anticipated needs

Centrality: **core** (most groups, most weeks), **regular** (common journeys), **occasional**.

| # | Need | In a member's words | Evidence | Centrality |
|---|---|---|---|---|
| **A** | **Deadlines a public body owes** | | | |
| A1 | Statutory response deadline on the group's own request, counted by the law's rule (calendar days, roll past weekend/holiday, extension, tolling) | "Our CPRA went in Thursday 19 March; when is the City late?" | RM §1 L241–258 ("expired March 30"; C1 notes +10 days lands on Sunday 29th, so a roll-forward is implied); CCP §12 rule ([FAC](https://firstamendmentcoalition.org/2009/06/when-does-the-10-days-count-start-with-a-cpra-request)); FOIA 20 working days, tolling, +10 ([NARA](https://foia.blogs.archives.gov/2011/09/29/twenty-days-or-not)); journey 5 steps 6, 8 | core |
| A2 | A body's own commitments and target dates (implementation deadlines, audit-recommendation dates) | "They promised to implement the audit by October 2023. Where are they now?" | RM §1 L219–232; auditors track target dates ([Seattle](https://seattle.gov/cityauditor/recommendations), [San Diego](https://www.sandiego.gov/sites/default/files/recommendation_follow_up_report_ending_june_30_2023.pdf)) | core |
| A3 | Time standards in policy or law, measured per act | "Are potholes fixed within the time the city's own policy sets?" "Certified within 30 days of the canvass?" | journey 4 step 4; journey 6 steps 2–3 (period and per-record timestamps); matter page VM L20 ("certified on day 21") | core |
| A4 | Contract, franchise, settlement and consent-decree deadlines over years | "Track each deliverable the hauler owes, and the monitor's reports." | journeys §3 contract and franchise rows; RM §1 L279–281 (23-year consent decree); Chicago missed "37 of 50" deadlines ([WTTW](https://news.wttw.com/2019/11/15/federal-monitor-cpd-lagging-behind-consent-decree-compliance)) | regular |
| A5 | Recurring procedural duties: agenda before a meeting, minutes after it, annual reports (ACFR) | "Minutes for the 28 July committee meeting were due 18 August and aren't up." | CF §8 src 689–717; CONSTRUCTS l.196–199 (rule versus instance); Brown Act 72 h / 24 h (Gov. Code 54954.2, 54956, [leginfo](https://www.leginfo.ca.gov/pub/15-16/bill/asm/ab_2251-2300/ab_2257_bill_20160411_amended_asm_v98.htm)); Oakland special meetings 48 h "not counting weekends or holidays" (OMC 2.20.070, [City](https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/Open-Government/Open-Meetings)); SR §4.2 (ACFR as a dated recheck trigger) | core for meeting watchers |
| **B** | **Deadlines the group must meet** | | | |
| B1 | Filing and limitation windows (claims, election contest, appeal, referral) | "Can we still file? The claim window is six months from when we knew." | CM plan 2 (CM 939–941, grand-jury window); VF L50 (election-contest window); Gov. Code 911.2, six months or one year from accrual ([code](https://california.public.law/codes/ca_gov't_code_section_911.2)); filings R9 | regular, high stakes |
| B2 | Windows the group sets: right of reply, checkpoints, reminders | "Give them 14 days to respond, and remind me the day before." | DEC-13 (7–30 days); action-plans R14–R17, R29; DEC-94 | regular |
| B3 | Retention clocks and a litigation hold | "We got a preservation demand. Stop deleting." | DEC-61, DEC-113 | occasional |
| **C** | **Counting on a real calendar** | | | |
| C1 | Business days, per-office holidays, the office's time zone and hours, "received after close", channel cut-offs (e-filing outage, "deemed filed") | "Friday 3 July: is the court closed but the City open?" | research-oakland-calendar M-NEW-2–7 (07-03 closes the county and court, not City or State; e-filing down on the 4th Friday; cut-off unknown); FRCP 6(a), with hours and clerk inaccessibility ([rule](https://www.courtrules.net/federal/civil-procedure/rule-6)) | core enabler |
| C2 | Periods counted backward from an event (notice periods), and in hours | "Was the special meeting noticed 48 business hours ahead?" | Brown Act, OMC 2.20.070 (above); VF L22 (an assistant-proposed open-meeting notice standard) | regular |
| **D** | **Recurring meetings** | | | |
| D1 | A body's schedule ("2nd and 4th Tuesday"), the next agenda, cancellations and reschedules, watching "per meeting" | "Watch for the next agenda." "Tell me if the Rules Committee meeting was cancelled." | journeys §3 public meeting row; DP L215–219 (Calendar.aspx, 8 of 18 cancelled); SR §4.1 `per_meeting`; UC-031 | core for meeting watchers |
| **E** | **As of a date** | | | |
| E1 | Which law was in force on the act's date, across amendment and recodification | "Did the 2023 recodification change the rule they broke in 2021?" | RM App B L1083 ("Recodified 2023 by AB 473"); UC-063; conformance R3 | core for any determination |
| E2 | Who held an office when (approximate and partial tenures) | "Who was Finance Director when the transfers ran (about 2019–2021)?" | RM App A L1051–1072; journeys §6 "Offices and who held them" | regular |
| E3 | What a page said on a date; dataset vintages | "What did the budget page say in March?" | FA L1 Fn3 L167–178; X59; acquisition R32 (Memento); CF §8.3 (APN vintages) | regular |
| **F** | **Periods** | | | |
| F1 | Fiscal years and biennial budgets, and their mapping to dates; bodies differ | "Every contract over $250k on fund 3100 since FY2019." | RM §1 L234–239; CF §12 src 1173, 1202–1209 (hand-mapped to "award date >= 2019-07-01"); 46 states start 1 July, others differ, cities choose ([LegalClarity](https://legalclarity.org/how-state-fiscal-years-work-dates-and-budget-cycles/), [CA Senate analysis](https://www.leginfo.ca.gov/pub/09-10/bill/asm/ab_2651-2700/ab_2663_cfa_20100817_161925_sen_floor.html)) | core for money work |
| F2 | A claim's own period, in the city's words | "Over what period is '90% filled' measured?" | journey 6 step 2 ("Undetermined, because the city does not define it") | regular |
| **G** | **Dates in documents; chronology** | | | |
| G1 | A document's own dates (meeting, adoption, effective, hearing, period covered, edit instants) | "The figure changed three days before publication." | DEC-5, DEC-11; CF §8.2 src 965–968 (out of order needs the document's own date); acquisition R8 | core enabler |
| G2 | Imprecise dates | "Sometime between FY2021 and FY2024." "Finance Director about 2019–2021." | RM §1 L234–239; App A | regular |
| G3 | A cited chronology across documents; sequence without causation | "The emergency was declared two weeks after the contract was signed." "They said X in March and Y in October." | IS §5 src 361–365; CM §CONTRADICTION (Bob 2026-09-17); DEC-77.2 (timeline form); DEC-14; Everlaw's evidence-backed fact timelines ([Everlaw](https://support.everlaw.com/hc/en-us/articles/42469701435803)); counsel packet chronology (RM §8) | core |
| **H** | **Lateness and patterns** | | | |
| H1 | One late item versus a pattern of lateness | "Minutes were late at 38 of 41 meetings since January 2024." | FA L2 Fn4 L311–313; CF §13.1 src 1563–1567 | regular |
| H2 | Non-response as a dated outcome | "We asked on this date; nothing came back by that date." | CM §8 D-181; DEC-14 | core |
| **I** | **Time in questions and search** | | | |
| I1 | Relative and range questions answered correctly | "Show me what came in over the weekend on Sewer Fund." "What's due this week?" | DEC-27 src 1810; DEC-110 (sort by time due) | regular |
| **J** | **Saying when** | | | |
| J1 | Every wait says by when; dates written out; times with their zone | "Waiting on the City Clerk's reply, due 14 October." | DEC-98.2; BR §5 L138 | core (UX) |

## 2. Levels of support

| Level | What a member can do |
|---|---|
| **L0 Record time** | Prove what bytes existed when, see every version of a page and the record's own dated, append-only history. |
| **L1 Stated dates** | Type a date with its basis on their own action; see it marked overdue on the day after, reminded only as they asked. |
| **L2 Computed on the local calendar** | Have a deadline proposed from a profile rule and counted the law's way: calendar or business days, the office's holidays, time zone and hours, roll-forward, extension, tolling, hours-based and backward periods, any start event, with the calendar's confirmation stated or "undetermined" with why. |
| **L3 Civic calendar and a body's duties** | Before anything is published: watch a body's meeting schedule; track what a body owes (agenda, minutes, reports, commitments, contract dates) anchored on the real event's date; use fiscal periods; ask what law was in force and who held an office on a date. |
| **L4 Temporal evidence** | Use document dates (including imprecise ones) as graded evidence; build a cited chronology across documents and inquiries; tell legitimate change over time from contradiction; measure lateness as a pattern with its denominator; read a page or a search as of a date. |
| **L5 Assisted** | Ask in plain words ("what is due", "what was in force", "when did this change") and get cited answers, with proposed deadlines, periods and dates labelled as machine work for a member to adopt. |

Needs mapped to the lowest level that serves them: **L0** E3 (partly). **L1** B2, B3, J1. **L2** A1, B1, C1, C2. **L3** A2, A3, A4, A5, D1, E1, E2, F1, F2. **L4** G1, G2, G3, H1, H2 (H2's dated outcome is L1; graded as a leg it is L4, D113). **L5** I1, plus the assisted forms of every other need.
