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

## 3. What exists now

"Reach" is the legacy UI (`civicos-ui/app.html`, the only member interface), counted by M1–M5 and checked against code where marked ✓.

| Module (layer) | What it provides for TIME (R ids) | Built | Member reach | AI | 
|---|---|---|---|---|
| record-grammar, record-core (1, 2) | UTC instants to the second (`ISO_TS_RE`, `stampInstant`); append-only state history; D-516/D-573: ordering inside a precision band reads undetermined | yes | implicit everywhere | — |
| jurisdictions (1) | R7 `minutes_due_days`; R26 deadline rules `{rule, applies_to, days, count calendar\|business, starts received\|filed\|act\|known, extension?, citation}`; R33/R43 holidays per year and office; R41 `time_zone`; R42 `hours`; R44 status researched\|ruled ✓ | yes; Oakland profile ✓ holds 1 rule (records_response, UNMEASURED), 2026 holidays only for 3 office groups, TZ, hours for 2 offices, no fiscal year, meetings or notice rules | `profiles` UI 0 | plan mode reads `deadlines` (agent-worker R51), not deployed |
| docprofile (1) | R15 temporal connections with `expected_by` = meeting date + `minutes_due_days`; calendar window and events (cancelled, delisted…) | yes, but produced only inside `assess` and not stored; the agenda and minutes readers parse only "Month D, YYYY" (meeting-agenda.mjs:84–91) and the calendar reader only M/D/YYYY (meeting-calendar.mjs:41–45), both at UTC midnight | inside `acquire` | — |
| office-readers, odf-reader (1) | R10 tracked-change and comment dates, core created/modified (DEC-5) | yes; not indexed as text | inside `acquire` | — |
| provenance, acquisition (3) | capture instant, version chain, RFC 3161 co-attestation, Memento R32 | yes; Memento always asks "now" (acquisition/index.mjs:291–293) | `acquire` UI 9; version notice UI 2 | capture requests |
| extraction, content (4) | reading `at`, re-read history, graded version notice R29–R31 | yes; a reading's `at` is the capture instant (reading-pipeline :741): **no document date** | `versionnotice`, `versionadopt` | EXTRACT proposes (not deployed) |
| progressions (5) | R16 `overdue_successor` and R17 `overdueScan` from a group-declared `within` ("n day\|week\|month\|year") | yes ✓; anchor = capture's reading instant, else registration (:861–870), never the event's own date; fixed 86,400,000 ms days; no business days, holidays or zone | **reachable**: progression screen (`progression`, `instance`, `proposals`, `progressiondefine`, `thread`, `discharge`) | DEC-52 lets a machine thread |
| observation-log, query-language, retrieval (5) | dated looks, `last_verified`; `due`, `overdue` and range search over record metadata | yes; ✓ ranges compared as strings (`created:2026-01-01..2026-01-31` drops the 31st's stamped rows, query.mjs:1693–1701); `overdue` is the flag cached at last write, unmarked | `search` UI 24 | sub-sessions write queries |
| inquiry-grammar, inquiry (6) | recheck triggers with optional date; `time_or_occasion` and `later_over_earlier` tokens | yes; trigger dates read by no module; canons are labels nothing applies | inquiry screens | CHECK only deployed |
| intent, reevaluation (7) | ageing 30 calendar days; `since`; version adopt or keep | yes | queue items; `versionkeep` UI 0 | — |
| local-facts (9) | R1–R4 member confirms holidays, hours, zone; horizons (holiday year due 1 Nov before; hours and zone lapse 183 days) | yes | `factconfirm` UI 0; `local-fact-due` reaches the queue, but its door cannot be opened | never (R5) |
| standards, conformance (9) | `inForce(id, date)` → in_force \| not_in_force \| undetermined (R7, null bound = not stated); determination in force at the act's date or each end of its period (R3) | yes | UI 0 for every op | proposal acts with no AI caller |
| actions (9) | `clock[] {text, description, date, basis, status}`; R12 overdue against the UTC day; R25 records-request lifecycle with elapsed days and `passed_unanswered` | yes | **reachable**: clocks typed on an action document in the add flow (app.html l3380–3393); `clock_next`/`clock_overdue` shown via `projection`; `actioncorrespond` | — |
| action-clocks (9) | R1 `pendingClocks`, R2 `clockPropose`, R3 `overdueClocks`, R4–R6 reminders, R7 "no date computed into the record; overdue derived at read", R10–R12 calendar status | yes ✓; `computeDeadline` (:694–749): starts only `filed`/`received`; **no roll-forward**; **Saturday–Sunday hard-coded** (:744); start = the UTC date of the ledger instant; `extension` never computed; zone and hours never used | `reminderset`/`reminderanswer` UI 0; `clockPropose` has no op | none |
| filings, escalation, action-plans (9) | R9 chronology (one action) and claim deadlines; escalation R2 trigger age from record dates, R6 stage 3 clock; plans: regulated dates `{date, basis}`, checkpoints `{after_days}` 1–3,650, R19 date checks | yes | UI 0 for every op | plan mode `deployed: false` |
| monitoring, scheduler (10) | cadences hourly…monthly, `per_meeting` = null "not a clock this plane can compute"; R34/R50 `deadline-recheck` marks pending→overdue on the UTC day | yes ✓; the scheduler's 19 consumers include `deadline-recheck`, `overdue-scan`, `intent-age`, `notice-sweep` (scheduler/index.mjs:44–49); the C9/X54 finding "nothing calls deadlineRecheck" is stale (built T18, K719) | queue items only; monitoring ops UI 0 | — |
| queue, queue-producers, tasks (11) | kinds `action-clock-overdue` (Signal, once), `action-reminder`, `plan-checkpoint-due`, `local-fact-due`, `overdue_successor`; sort by `due` (DEC-110) | yes; `due` is a UTC day | `queue` UI 23, but the UI sends no sort, never renders `due`, and offers only "Forward / Mark resolved" (no per-kind door); tasks carry no due date | — |

**Placement on the ladder.**
- **Built: L1, about half of L2, and fragments of L3 and L4.**
  - L1 is complete.
  - Of L2: calendar and business days, per-office holidays and confirmation status are built. Roll-forward, local days, hours, backward periods, `act` and `known` starts, extension and tolling are not.
  - Of L3: progressions on calendar intervals, anchored on capture time, and `standards.inForce`. Meetings, fiscal periods and office holders are absent.
  - Of L4: the version chain, one action's chronology and dated history.
  - L5: none.
- **What a member can use today: L1**, plus one L3 fragment (progression overdue findings, measured from when the group captured the predecessor, not from when the meeting happened).
- The rest sits in layer 9 behind zero UI calls (X191), or is not deployed.
- The design team's own summary agrees (journeys §6 "Meetings and time", design branch): "Deadlines count calendar or business days against the group's holidays. There is no model of a recurring meeting, days are counted in universal time, and the group's time zone and office hours are stored but not used."

**A concrete defect.** For the Roadmap's own CPRA example (received Thu 2026-03-19, 10 calendar days), `computeDeadline` answers 2026-03-29, a Sunday. The law's count, and the Roadmap, give Monday 30 March (CCP §12). If a member adopts that proposed date, the deadline-recheck marks the City overdue at the start of 30 March in UTC, which is 17:00 Pacific on Sunday 29 March. That is more than a day before the City's time actually ran out, at the end of Monday 30 March. The record would make a false claim about a body, the overclaim D77 ranks worst.

## 4. Gaps

| # | Needs | Missing capability | Severity |
|---|---|---|---|
| G1 | A1, B1, C1 | **Correct counting.** No roll-forward when a period ends on a closed day. Days are UTC, not the office's local day. The weekend is hard-coded (D211, Conflicts #48). The profile `time_zone` and `hours` are confirmed but never used. `extension` is never computed. No tolling. No `act` or `known` start, so claim windows are undetermined. No hours-based periods. | **blocks core**: wrong dates produce false overdue claims (§3) |
| G2 | A2–A5 | **What a body owes, before publication.** Deadlines live only on the group's own actions (layer 9: X3, X16, X66). A body's duty can be tracked only as a progression stage with a bare interval the group types. Nothing carries a body's own commitment, a policy time standard, an audit target date or a contract date as a due date with its basis, and the queue has no item kind for a statutory deadline during investigation (X66). | **blocks core** |
| G3 | A5, H1 | **Anchoring on the event.** Progressions measure from capture time, not from the meeting or act (§3). Out-of-order detection waits on document dates (CF §8.2 src 965–968). | **blocks core** for meeting chains; findings can be wrong in either direction |
| G4 | A5, C2, D1 | **Meetings and notice.** No recurring-schedule model (`per_meeting` is unschedulable, monitoring :133–137). No backward notice periods (72 h before, 48 business hours before). Cancellation and reschedule events are not tied to expected meetings. | **blocks core** for meeting watchers |
| G5 | all | **Member surfaces.** Clocks, reminders, calendar confirmation, plan checkpoints, standards in force and escalation clocks have 0 UI calls. Queue items for them render, but nothing can answer them (M5). `due` is never shown or sorted. | **blocks core** use of what is built (Bob's UX) |
| G6 | F1, F2 | **Fiscal and claim periods.** No fiscal-year fact per body. FY labels are hand-mapped to dates. A claim's period cannot be stated and checked. | **degrades core** (money work) |
| G7 | G1, G2 | **Document dates.** Readers emit dates only for some doctypes, English long form only. Dates are not stored, indexed or graded. Imprecise dates cannot be represented (`DATE_RE` is shape only and accepts 2026-02-31, inquiry-grammar). | **degrades core**; blocks G3's fix |
| G8 | G3, H2 | **Chronology.** Only one action's chronology exists (filings R9). There is no cross-document or cross-inquiry timeline, the DEC-77 timeline form is unbuilt, and CF §9.1 says of timelines "partly; nothing assembles them". | **degrades core** |
| G9 | E1, E2, E3 | **As-of.** Only `standards` has a period, and only whole-standard supersession: recodification at a new address falls outside the version doctrine (X73). No office-holder tenure (ORGANISATIONS). Memento cannot be asked for a past date. Search covers only the current text (CSD §4.1). | **degrades core** (determinations) |
| G10 | — | **One engine.** Six clock designs with no stated relation (INVENTORY §3; X60) and four separate day computations (action-clocks, monitoring, queue-producers, progressions), against D81 "one check codebase" and D320 "one quantity under one name". | **degrades**: each defect must be fixed four times |
| G11 | I1 | **Search and questions.** Lexical date ranges (§3); `overdue` cached and unmarked; no `dated:` or fiscal field; no plain-language time question (X153). | **degrades** |
| G12 | H1 | **Patterns.** The lateness-pattern measure (CF §13.1) is deferred, and there is no cross-action index of passed due dates (CM 266–267). | **degrades** (regular work) |
| G13 | A2 | **Recheck triggers.** Inquiry recheck-trigger dates are validated and never acted on (M3). | nice to have (a dated wait on an inquiry would serve A2) |
| G14 | C1 | **Calendar data.** The first profile has no 2027 holidays (none published), no hours for 3 offices, one deadline rule; every other deadline a group needs is unencoded. | **degrades core**: data, not code |

## 5. Proposed architecture

**Target: L3 across the product, L4 for document dates, chronology and as-of, L5 by stages.** Why:
- Bob's ask goes beyond court deadlines.
- Every "front door" in the journeys passes through a body's time duty before anything is published (journey 4 step 4; X21).
- Most of L2 is already built and only needs correcting.
- L3 and L4 can reuse three patterns the product already proves: version pinning, the dated append-only history, and "derived on read".

L5 rides on the assistant's FIND, which is not built (X145, X153); it waits for that.

**Adopt, rather than invent:**
- **Period computation as the law states it.** Exclude the trigger day, include the last day, roll forward past a closed day (CCP §12/§12a; [FRCP 6(a)](https://www.courtrules.net/federal/civil-procedure/rule-6)). Periods may be in hours, may count backward from an event, and may be extended when the clerk's office is inaccessible. Extensions and tolling follow FOIA's shape (written notice with a date certain; one tolling while waiting on the requester; [NARA](https://foia.blogs.archives.gov/2011/09/29/twenty-days-or-not)). Each convention is a profile fact with its citation, not code.
- **iCalendar RRULE** (RFC 5545 §3.3.10, [icalendar.org](https://www.icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html)), a subset, for meeting schedules and recurring duties: `FREQ=MONTHLY;BYDAY=2TU,4TU`, plus BYMONTHDAY, BYSETPOS, EXDATE and UNTIL.
- **The Open Civic Data Event** ([OCD](https://open-civic-data.readthedocs.io/en/latest/data/event.html)) as the shape of an observed meeting: a zone-qualified `start_time`, `timezone`, and `status` cancelled | tentative | confirmed | passed. The Legistar Web API `GET v1/{Client}/Events` ([help](https://webapi.legistar.com/Help)) becomes a capture source declared in the profile's `systems`.
- **ISO 8601 with EDTF level 1** (ISO 8601-2:2019; [LoC](https://www.loc.gov/standards/datetime/)) for imprecise document and tenure dates: `2019~`, `2021?/2024?`, `2026-03-XX`, open intervals. Comparisons are three-valued (before, after, undetermined), as D-516 already rules for instants.
- **Valid time versus transaction time** (bitemporal; [SQL:2011](https://en.wikipedia.org/wiki/SQL:2011)). When a fact was true in the world is kept apart from when the record learned it. This already exists in two places: MKD's `observed_at` beside the write time, and a standard's `period` beside its declaration.
- **The OCDS `Period`** (`startDate`, `endDate`, `maxExtentDate`, `durationInDays`; [OCDS](https://prozorro-api-docs.readthedocs.io/en/latest/standard/util.html)) for contract periods.
- **Akoma Ntoso's event-bounded intervals** (`eventRef`, and `timeInterval` with start and end given as events; [OASIS](https://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/os-part2-specs_xsd_Element_timeInterval.html)) as LAW's model of in-force periods. TIME evaluates them.
- **IANA zones through `Intl`** (V8/ICU). `Temporal` (shipped in Chrome 144, [InfoQ](https://www.infoq.com/news/2026/02/chrome-temporal-date-api)) is used once its presence on Workers is measured.
- **Holiday libraries as research aids only.** date-holidays and OpenHolidays ([date-holidays](https://unpkg.com/date-holidays@3.33.0/README.md), [OpenHolidays](https://public-api.org/api/1463/openholidays-api)) may help locate dates. Doctrine says a holiday list belongs to its publisher (M-NEW-3) and a secondary site is never a source (D197).

**Data model.** Value types are pure, objects are recorded, and computed dates are derived on read and never stored (D245; action-clocks R7).

1. **Civil date** `{value: EDTF-L1, zone?: IANA, source: {extent | ledger | member}, method: reader | ai | member}`. A day is the local day of the zone that governs the office or venue, not UTC. Record instants stay UTC (TAD §10.10).
2. **Period** `{start, end, max_extent?}` in civil dates. A null bound means "not stated", never "always" (standards Terms, generalised). **Fiscal period**: profile fact `fiscal_year {start: MM-DD, label: "FY2025-26" | "FY26", bodies?, status, basis}`, and FY labels map to periods both ways.
3. **Time rule** (profile `deadlines`, R26 widened): `{rule, applies_to: action kind | claim | duty kind | meeting kind, amount, unit: day | business_day | hour | business_hour | week | month | year, direction: after | before, anchor: received | filed | act | known | event_start | period_end | stated, roll: forward | backward | none, closed: [weekend, holidays of the office], extension?: {amount, unit, when, requires: notice}, tolling?: [{when, citation}], citation, basis, status}`. Two new profile facts carry its conventions: `weekend` (with basis; it replaces the hard-coded Saturday and Sunday) and `computation` (the jurisdiction's default counting convention, ruled from its statute, e.g. CCP §12). Office channels gain `cutoff` ("deemed filed" time) and `outages`. All of these are confirmable through `local-facts`.
4. **Recurrence** `{body: entity id, kind, rrule, zone, valid: period, source: capture or extent of the rules of procedure or adopted calendar, basis}`. Instances are expanded on read. **Observed meeting**: an OCD-shaped event read from a calendar capture, with its status. A recurrence never asserts that a meeting happened; it only expects one (X45, D241).
5. **Dated fact** (a document's own date) `{capture, extent, kind: meeting | adopted | effective | signed | published | hearing | period_covered | edited, value: civil date, method, grade, decided_by?}`. Reader-stated dates are data with their method. AI-extracted dates are labelled proposals that a member accepts (D3, D53). Each is a dated, versioned row, never overwritten (D235).
6. **Expectation** (the canon's own term, CONSTRUCTS l.196) has a rule and instances:
   - The rule is a progression stage's timing or a single-stage duty. It holds `{owner: counterparty | group, basis_kind: law | measured_practice | commitment | group_window, rule ref or interval, basis}`.
   - An instance is `{anchor dated fact or ledger entry, due: derived civil date or band, state: open | met | met_late | passed_unanswered | undetermined, why, calendar status}`.
   - The member-facing word is "Obligation" for a body's duty (DEC-107). In code it stays `expectation`, so the queue's OBLIGATION class does not collide (D314).
   - Group-side clocks (action `clock[]`, checkpoints, reminders) keep their models, but every computation goes through the same engine.
7. **Validity** `{valid: period, as_of_read(date) → in | out | undetermined + why}`. This generalises `standards.inForceAt`. It is used for standards (LAW), office tenures and relations (ORGANISATIONS), dataset vintages and the expiry of an adopted rule.
8. **Chronology** (a read, never stored): `{scope: inquiry | project | entity | action, items: [{civil date or band, what, cite, kind}], ties and bands stated undetermined (D-573)}`. It orders facts and never composes narrative (PS VIOLATE 1). Its timeline view serves DEC-77.2.

**Module changes.** A product module or layer change is Bob's; `uses` edges are BOB's. The positions below were checked against `build/modules.json`.

- **New `civil-time` (layer 1, directly after `jurisdictions`; pure, with no store, network or clock).**
  - What it does: local day from an instant and a zone; EDTF parsing and three-valued comparison; time-rule evaluation (units, direction, roll, closures, extension, tolling); RRULE-subset expansion with bounds; fiscal-period mapping; `validAt`.
  - Each answer carries a trace: the rule, the citation, the days skipped and why, and the zone and ICU version used.
  - Uses: record-grammar, jurisdictions.
  - It replaces `action-clocks.computeDeadline` (kept as a delegate), `progressions.intervalDeadlineMs`, monitoring's and queue-producers' UTC-day comparisons, and query-language's lexical time coercion.
  - Estimated 1,500–2,500 lines.
- **Move `local-facts` from the head of layer 9 to the head of layer 5** (position 72 → before `entities`, position 36). Its uses (record-grammar, jurisdictions, record-core, membership) are all earlier, so no edge breaks. Its users (action-clocks, filings, affordances, queue-producers, control-plane, plane) are all later, so they are unaffected. Membership's `MODULE_ORDER` (R83) is re-pinned, as at T27 and T28. This lets progressions, monitoring and chronology read confirmed calendars (X9).
- **New `chronology` (layer 5, after `connections`, before `progressions`).** It holds dated facts and docprofile's temporal connections, kept as their own kind (D192), and answers `datesOf(capture)`, `ownDate(capture, kind)` and `chronology({scope})`. Uses: extraction, content, entities, connections, local-facts, civil-time.
- **`jurisdictions` (1):** R26 widened as in model item 3; new sections `weekend`, `computation`, `fiscal_year`, `recurrences`, `notice_rules` (as `direction: before` rules), and channel `cutoff`/`outages`. Each fact carries a status (R44) and is withheld on disagreement (R15).
- **`docprofile` / `extraction` (1/4):** readers emit typed dated facts in the profile's date grammar (not only English long form); the meeting calendar emits observed meetings.
- **`progressions` (5):**
  - R16 anchors on `chronology.ownDate` of the predecessor's event. When none is stated, the anchor is undetermined, and the capture instant is shown only as a latest-possible bound.
  - `within` may name a profile rule, computed by civil-time.
  - A stage gains `basis_kind`.
  - A single-stage expectation covers commitments, audit targets and contract dates.
  - The out-of-order shape is unblocked.
  - New uses: chronology, local-facts, civil-time, jurisdictions.
- **`monitoring` (10):** `per_meeting` cadence follows the expanded recurrence (watch the agenda page from the notice period before each meeting, and the minutes page from the practice interval after it). The overdue mark uses the office's local day. Gains local-facts and civil-time.
- **`action-clocks`, `filings`, `escalation`, `action-plans` (9):** delegate counting to civil-time. `clockPropose` gains an op (reached today only inside `filingsent`). A clock entry may carry `{rule, anchor}`, so the member's stated date can be checked against the rule's computation and a mismatch shown (never re-dated, actions R33).
- **`queue`, `queue-producers` (11):** `due` is a local civil date with its zone. A new item kind `expectation-due`, a body's duty with its derivation (X175), is subject to DEC-10's relevance filter (connected to a focus or project).
- **`query-language`, `retrieval` (5):** inclusive local-day ranges; `asOf` notes on `due` and `overdue`; `dated:` and `fy:` fields by registration (X27).
- **`inquiry` (6):** recheck triggers become dated waits, read by a scheduler consumer, each stating what, from whom and by when (DEC-98).

**The AI's role.**
- **EXTRACT** proposes dated facts, periods and imprecise dates, labelled and graded no higher than the method earns. Temporal taggers normalise only about 70–78% of values correctly ([ACL wiki](https://aclweb.org/aclwiki/Temporal_Information_Extraction_(State_of_the_art))), so a member accepts each one.
- **FIND** answers time questions as cited reads: what is due, what was in force on a date, when a page changed. It resolves relative phrases through civil-time in the instance's zone and states the window it used ("over the weekend = Sat 3 Oct 00:00 – Sun 4 Oct 23:59 PDT").
- **Plan mode** proposes clock entries from profile rules (`clockPropose`) and flags unreachable windows (action-plans R19).
- The AI never invents a rule the profile does not hold (D250), never confirms a calendar fact (D15), and never runs on a schedule (D13). Periodic work stays mechanical, on the scheduler.
- BOB's research workers may still research calendar facts, as `researched` measurements a member confirms (K903 (6), D199).

**Doctrine kept.**
- No deadline invented (D250). A computed date is derived, never stored (D245; action-clocks R7; CM D-147, D-149 "the plane encodes no law's rules": rules stay profile data with citations, proposed and adopted, and so never "stale silently").
- Every deadline names its basis (layers.md layer 9; D256).
- A due threshold raises a question and never asserts a violation (D241). Practice and law stay labelled apart (X45).
- Undetermined, never a default (D55, D56; jurisdictions R27). Combine never chooses between profiles (jurisdictions R15).
- No jurisdiction in code (D196): the weekend moves into data.
- A member confirms local facts (D15, D198).
- Reminders are the member's own, with no outside channel, and overdue is told once (D238, D336; DEC-94).
- A missed checkpoint is never a finding (D234).
- Sequence is not causation (D75). Time or occasion dissolves a contradiction only with evidence (D93).
- Temporal and referential relations are not collapsed (D192). Event types come from one catalogue (D361).
- One rule in one place (D81, D368). One alarm (D252).
- The surface renders the plane's dates and never computes them (D22). An authored edge is never re-pointed (D182).
- The record never claims more than it can support (D77). Hence the band rule proposed in §8 D1.

**Runtime and deployment.**
- Everything is pure computation, milliseconds per call, well inside the 30 s default CPU budget ([limits](https://developers.cloudflare.com/workers/platform/limits/)).
- RRULE expansion is bounded (24 months or 500 instances per rule, `truncated` stated).
- Periodic work joins the one reconciling Durable Object alarm as consumers (SCHEDULER.md: "Do NOT add a second alarm or a cron"). Each consumer wakes at the next local midnight of the governing zone, computed by civil-time. Alarms are at-least-once with retries ([DO alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)), so marks stay idempotent, as `deadline-recheck`'s are.
- Zone rules come from the runtime's ICU. tzdata changed three times in 2026 ([IANA](https://www.iana.org/time-zones/releases)), so traces name the ICU/tz version.
- No outside service or key is needed (sovereignty, D201). The Legistar Events API is fetched by `acquisition` like any public source.
- Each instance needs only profile data: a release ships new rules, and each group confirms them locally.

## 6. How to proceed

**Stage 1: correct clocks, and a member can use them (L2 complete; L1 reachable).**
- **Unlocks:** journey 5 (records request: due date set from the law, overdue once), journey 13 and experience (k) (plan, reminders, checkpoints), experience (h), UC-118, UC-127, UC-164, UC-165, and the claim windows in the counsel packet (B1).
- **Work:**
  - Build `civil-time`.
  - Widen R26 and add `weekend` and `computation`.
  - Delegate the four day computations to `civil-time` (action-clocks, monitoring, queue-producers, progressions' interval).
  - Use the local day.
  - Add an op for `clockPropose`.
  - Fix query-language's date ranges and `asOf` notes.
  - Move `local-facts`.
  - Encode a first rule set in the Oakland profile and the test profile, each with a citation and status: CPRA (with extension), Brown Act agenda 72 h and 24 h, OMC special-meeting 48 business hours, Government Claims Act 6 and 12 months, FOIA 20 working days.
  - Bob's UX: a member surface for clocks, reminders and calendar confirmation (G5). Without it Stage 1 changes nothing a member sees.
- **Size:** 1 new module; about 9 modules amended (jurisdictions, local-facts placement, action-clocks, filings, monitoring, queue-producers, queue, query-language, progressions); about 30–40 requirements.
- **Measure first:**
  1. On the deployed plane: `Intl` IANA zones, and whether `Temporal` is present (no Workers changelog entry found).
  2. A fixture of 20 published, worked deadline examples (city CPRA policies, court clerk calculators, FOIA guidance), each with a negative control (P7).
  3. How many clock entries members have typed, and how many differ from the rule's computation.

**Stage 2: what a body owes, and its meetings (L3 core; L4 document dates).**
- **Trigger:** Stage 1 is merged and a group watches a body's meetings or follows up an audit or commitment. This is the journeys' §3 "public meeting", "contract" and "problem they live with" rows, and the "Meetings and time" row Bob was promised an answer on (5 October).
- **Work:**
  - `chronology` with reader-stated dated facts.
  - Progressions anchored on the event, with `within` able to name a rule and single-stage expectations.
  - Recurrence in the profile, and observed meetings from calendar readings.
  - `per_meeting` monitoring.
  - The `expectation-due` queue kind.
  - `fiscal_year` and FY mapping.
- **Size:** 1 new module, about 6 amended, about 35–45 requirements.
- **Measure first:**
  1. Date accuracy of the meeting-calendar, agenda and minutes readers on three bodies' captures.
  2. Oakland's actual minutes lag. It is unmeasured (DP L332–334), and Stage 2 turns `minutes_due_days` from UNMEASURED into measured practice, or leaves it a group expectation.

**Stage 3: as-of and patterns (L4).**
- **Trigger:** the first of these:
  - a determination that needs the law in force at the act's date before publication (with LAW's stage);
  - an office-holder question (with ORGANISATIONS' stage);
  - a contradiction inquiry over a reversal (DEC-77 timeline).
- **Work:**
  - `validAt` used across standards, tenures and relations.
  - Recodification as a supersession that crosses addresses (with LAW).
  - Memento asked for a date (acquisition R32 with `acceptDatetime(date)`).
  - The CF §13.1 lateness pattern, with its denominator, and a cross-action lateness index.
  - The timeline view.
  - The counsel-packet chronology widened to the project's scope.
- **Size:** no new module expected; about 6 amended.

**Stage 4: assisted time (L5).**
- **Trigger:** FIND and plan mode are deployed (agent-worker R40, R48; T32 C2).
- **Work:** FIND's time reads and EXTRACT's dated-fact proposals, measured for acceptance rate (DEC-95's guard) before any wider use (D40).

**Risks and their containment.**
1. **A false overdue claim against a body.**
   - Contained by computing in local days with roll-forward.
   - Uncertain dates produce a band (§8 D1).
   - Every derived due date shows its trace (X175).
   - Statute-sourced fixtures, each with a negative control.
2. **Encoded law going stale** (D-149's fear).
   - Rules are profile data with citation, status and a confirmation horizon (local-facts R3).
   - When a cited provision changes, the version notice flags it (content R29–R31).
   - A rule is never applied to an action without a member adopting the proposal (§8 D2).
3. **Profile burden for new jurisdictions.**
   - Absent rules read undetermined (jurisdictions R27), so nothing breaks.
   - Rule sets are researched as measurements (the K903 (6) process).
   - A group confirms them locally.
4. **Six clock designs becoming seven.** One engine; every caller delegates (G10).
5. **Nagging.** DEC-94 is unchanged. Body duties reach the queue only under DEC-10's relevance filter, once.
6. **Extracted dates taken as fact.** They are labelled proposals with their grade, accepted by a member; a reader that finds no date is a failed reader (D101).
7. **Layer churn.** Only `local-facts` moves. Its edges were checked, so no user breaks.

## 7. Interfaces with the other constructs

| Construct | TIME needs from it | TIME supplies to it |
|---|---|---|
| **ORGANISATIONS** | Offices, bodies and venues as entity ids with parent and employer, so the right closure calendar, hours and zone apply (X39; today an office is a `{role, body}` string). The body a recurrence belongs to. The obligation object, who owes what to whom (X28), which owns the duty. | `validAt` and EDTF tenures for "who held the office when" (E2). Recurrence for a body's meetings. The `due` part and the expectation instance of an obligation. Validity on relations (reports to, contracts with). |
| **LAW** | Deadline and notice rules linked to held provisions, not citation strings (X41). Amendment and repeal events and periods in force (Akoma Ntoso-style). Recodification across addresses (X73). The statutes that set calendars (CCP §12, holiday statutes, Gov. Code §6808). | Interval evaluation for "in force on date" with undetermined bounds. Computation of any period a provision states. Fiscal periods for budget-as-law. Recheck when a cited rule's text changes. |
| **COURTS** | Court calendars and clerk channels (filing cut-offs, outages), court computation rules (FRCP 6-type), case events from dockets. | The rule engine and band rule for court deadlines. Chronology of a proceeding. Limitation windows (`known`/`act` anchors) for the counsel packet. The litigation-hold clock (DEC-113). |
| **ANALYSIS** | Computation and grading of lateness rates and durations (consequences' `time` unit). Per-record timestamps from datasets (journey 6). | Fiscal-period mapping and period algebra for budget against actuals by FY. Local-day bucketing. Denominators of "due in period" for lateness patterns (CF §13.1). As-of dataset vintages. |
| **QUESTIONS** | Plain-language interpretation of time phrases; FIND deployed. | `civil-time` reads as plane ops: the resolved window, due items, in-force answers and change dates, each cited and with undetermined stated (X142, X168). The assistant holds no copy of the rules (DEC-27). |

## 8. Decisions for Bob

Recommendations first; each is policy, doctrine, requirement meaning, layer or module architecture, or UX.

- **D1 (doctrine: what the record may claim about time).** When a deadline's date is uncertain (an unconfirmed or ambiguous holiday such as the City's "(HVA) If applicable" days, a date-only anchor, an imprecise event date), how is it counted?
  - (a) Always err early. This is K941's reading: "it errs early, the safe side for a group's deadline".
  - (b) Direction-aware: a deadline the group must meet uses the earliest candidate date, while a deadline a body must meet is "overdue" only after the latest candidate date. Between the two, the item reads "possibly overdue: undetermined, because …", the D-516 band applied to civil dates.
  - (c) Undetermined whenever any input is uncertain.
  - **Recommend (b).** (a) makes premature claims about bodies, the overclaim D77 forbids; (c) hides most real deadlines.
- **D2 (requirement meaning: who starts a body's clock).** May a deadline computed from a profile rule track a body's duty, and raise a finding about it, without a member's act?
  - DEC-10 licenses tracking because "the due-by was AUTHORED" (X37), and D-149 keeps law's rules out of the plane.
  - **Recommend:** computed deadlines stay proposals (as `clockPropose` today); a member adopts one in one act, and from then it tracks and notifies once. This applies equally to actions and to a body's duties.
- **D3 (architecture: a new product module).** Add `civil-time`, pure, in layer 1, as the one engine for every date computation (§5). **Recommend yes.** Six designs and four day computations are the defect class D81 forbids.
- **D4 (architecture: change a layer).** Move `local-facts` from layer 9 to the head of layer 5, so investigation-time modules can read confirmed calendars. **Recommend yes.** No `uses` edge breaks (checked against `modules.json`).
- **D5 (architecture: a new product module).** Add `chronology` in layer 5 (document dates, temporal connections, the chronology read).
  - The alternative is to fold it into `extraction` and `connections`.
  - **Recommend a separate module:** D192 keeps temporal and referential relations apart, `connections` is already about 2,700 lines, and progressions, inquiry, filings and the assistant all read it.
- **D6 (requirement meaning: progressions R16).** A body's overdue duty runs from the event's own date (the meeting, the act) and never from when the group captured the document. Without a stated date it is undetermined, with the capture date shown as a bound. **Recommend yes.** The present anchor can misdate findings in both directions.
- **D7 (requirement meaning: the governing day).** "A deadline is met by anything on its day" (actions R12) is read in the local day of the office or venue's jurisdiction, and a rule may say "by close of business" using the office's hours. Today it means the UTC day. **Recommend local day.** It is also what BR §5's "times with their zone" needs.
- **D8 (requirement scope: the profile grammar).** Widen the profile to hold notice periods counted backward, rules in hours, tolling, `known`/`act` anchors, meeting recurrences, fiscal years, the weekend and the jurisdiction's counting convention, each sourced and confirmable (K1: data, not code). **Recommend yes.**
- **D9 (UX).** Where time appears for members:
  - due dates written out with their zone on the queue (sorted by due, DEC-110), the action page and the plan;
  - a "Calendar facts" place reached from the queue's `local-fact-due` item, to confirm, correct or dispute;
  - each body's "Expected" list (next meeting, next agenda, minutes due) on its subject page;
  - a timeline view in the contradiction inquiry and the project.
  - **Recommend** placing all of these in existing constructs (D231), with no new top-level screen.
- **D10 (policy: outside channels).** Should members be able to export the group's deadlines to their own calendar (.ics)?
  - DEC-94 (3) bars any outside channel; a subscription feed would be one.
  - **Recommend no for now.** The trigger to revisit is members asking.

**Decided by BOB, reported:**
- the RRULE subset (FREQ WEEKLY, MONTHLY, YEARLY; BYDAY with ordinal; BYMONTHDAY; BYSETPOS; EXDATE; UNTIL);
- EDTF level 1;
- `Intl` until `Temporal` is measured on Workers;
- expansion bounds of 24 months or 500 instances;
- record instants stay UTC (D-516);
- traces name the tz/ICU version;
- module names `civil-time` and `chronology`, and their positions in §5;
- query ranges inclusive by local day;
- `expectation` as the code word and "Obligation" as the member word (DEC-107).

## 9. Sources opened

Beyond the digest and registers:
- **Repository** (`tranche/T32` @ `09837e3ddc`):
  - Requirements and design: `build/layers.md` (whole); `build/modules.json` (order, uses and users of jurisdictions, local-facts, action-clocks, progressions, monitoring, scheduler, standards, docprofile, entities, connections, intent, queue-producers, actions, extraction, content, record-core); `build/requirements/action-clocks.md`, `jurisdictions.md`, `local-facts.md` (whole); `progressions.md` (R1–R22, R33, R35).
  - Code: `bio-plane/src/action-clocks/index.mjs` :640–760; `filings/dates.mjs` (whole); `scheduler/index.mjs` :36–60; `monitoring/index.mjs` :128–170, :2740–2830; `progressions/index.mjs` :95–120, :845–880; `query.mjs` :104–123, :1688–1705; `jurisdictions/profiles/oakland-alameda.mjs` :170–291; grep for `time_zone` and `extension` across `bio-plane/src`.
  - Rulings: `build/rulings.md` entries K108, K611, K613, K719, K841, K921, K925, K934, K936, K941, K1000, K1051.
  - Design branch: `origin/claude/gallant-brown-zg0wc1:docs/development/ux-substrate/journeys.html` §3 and §6.
- **URLs:**
  - Computing deadlines: https://firstamendmentcoalition.org/2009/06/when-does-the-10-days-count-start-with-a-cpra-request · https://www.losaltosca.gov/169/California-Public-Records-Act · https://www.courtrules.net/federal/civil-procedure/rule-6 · https://foia.blogs.archives.gov/2011/09/29/twenty-days-or-not · https://www.law.cornell.edu/cfr/text/5/10000.8 · https://california.public.law/codes/ca_gov't_code_section_911.2
  - Meetings and notice: https://www.leginfo.ca.gov/pub/15-16/bill/asm/ab_2251-2300/ab_2257_bill_20160411_amended_asm_v98.htm · https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/Open-Government/Open-Meetings
  - Standards and data models: https://www.icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html · https://www.loc.gov/standards/datetime/ · https://open-civic-data.readthedocs.io/en/latest/data/event.html · https://webapi.legistar.com/Help · https://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/os-part2-specs_xsd_Element_timeInterval.html · https://en.wikipedia.org/wiki/SQL:2011 · https://prozorro-api-docs.readthedocs.io/en/latest/standard/util.html
  - Fiscal years: https://legalclarity.org/how-state-fiscal-years-work-dates-and-budget-cycles/ · https://www.leginfo.ca.gov/pub/09-10/bill/asm/ab_2651-2700/ab_2663_cfa_20100817_161925_sen_floor.html
  - How the work is done: https://aclweb.org/aclwiki/Temporal_Information_Extraction_(State_of_the_art) · https://support.everlaw.com/hc/en-us/articles/42469701435803 · https://www.muckrock.com/about/how-we-work/ · https://seattle.gov/cityauditor/recommendations · https://www.sandiego.gov/sites/default/files/recommendation_follow_up_report_ending_june_30_2023.pdf · https://news.wttw.com/2019/11/15/federal-monitor-cpd-lagging-behind-consent-decree-compliance
  - Holiday data: https://unpkg.com/date-holidays@3.33.0/README.md · https://public-api.org/api/1463/openholidays-api
  - Runtime: https://developers.cloudflare.com/durable-objects/api/alarms/ · https://developers.cloudflare.com/workers/platform/limits/ · https://developers.cloudflare.com/workers/platform/changelog/ · https://www.infoq.com/news/2026/02/chrome-temporal-date-api · https://nodejs.org/en/blog/release/v26.0.0 · https://www.iana.org/time-zones/releases
