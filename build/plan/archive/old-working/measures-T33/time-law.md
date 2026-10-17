# T33 measures: TIME and LAW (desk research)

Taken 2026-10-05 by a desk-research worker for BOB #114, on `tranche/T32`. All sources were fetched on **2026-10-05**. Inputs for `draft-T33-entries-A.md` §(e) (TIME, LAW) and ladder TIME §4 and LAW §6.

| # | Measure | Verdict |
|---|---|---|
| 1 | First sourced rule set (K1445) | **GO.** Every rule has a primary source. Three conventions need a BOB ruling (see 1c). |
| 2 | Oakland `records_response`, five counterparties, other UNMEASURED values | **GO.** All of them are sourced. One value is contradicted (`minutes_due_days`). |
| 3 | 20 worked examples, each with a negative control | **PARTIAL.** 20 rows: 15 published or official-record rows are usable, 2 published rows are wrong and serve only as negatives, 3 FOIA rows are derived. No published FOIA example was found. |
| 4 | How the OMC is served; codifier lag | **GO.** The library page is an Angular shell, but the open JSON API returns text. Lag is 78–276 days per supplement and 230 days today. |
| 5 | Section-boundary accuracy | **NO-GO for today's reader** (0/50). **GO for the source**, since the API returns one doc per section. |

---

## 1. First sourced rule set

Primary source for every California section: `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=<CODE>&sectionNum=<N>`. FOIA comes from `https://www.law.cornell.edu/uscode/text/5/552`. The OMC comes from `https://api.municode.com/CodesContent?jobId=494401&nodeId=TIT2ADPE_CH2.20PUMEPURE&productId=16308` (Supp. 103).

| Rule | Operative text (quoted) | Units | Direction / anchor | Roll | Extension |
|---|---|---|---|---|---|
| CPRA, Gov. Code §7922.535(a),(b) | "within 10 days from receipt of the request, determine whether the request … seeks copies of disclosable public records"; (b) "In unusual circumstances … may be extended by written notice … The notice shall not specify a date that would result in an extension for more than 14 days." | days (calendar, under CCP §12) | forward from receipt | CCP §12a (Sat + CCP §135 holidays) | ≤14 days, by written notice, for the six listed "unusual circumstances" (c)(1)–(6) |
| Brown Act regular, Gov. Code §54954.2(a)(1) | "At least 72 hours before a regular meeting, the legislative body … shall post an agenda" | clock hours | backward from meeting time | none (hours) | none |
| Brown Act special, Gov. Code §54956(a)(1),(2) | notice "shall be received at least 24 hours before the time of the meeting"; "The call and notice shall be posted at least 24 hours prior to the special meeting" (amended by SB 707, eff. 2026-01-01) | clock hours | backward | none | none |
| **OMC 2.20.070 (special meetings)** | "at least forty-eight (48) hours (excluding Saturdays, Sundays and holidays) before the time of the meeting set forth in the agenda". (C): "if a special meeting is called for a Monday, notice shall be deemed timely made if … made no later than 12:00 p.m. (noon) on the preceding Friday". Off-site meeting: "at least ten days prior". | business hours (weekday hours, excluding holidays) | backward from meeting time | excluded hours (no roll) | Monday special exception: noon on the prior Friday. Off-site: 10 days. |
| OMC 2.20.080 (regular meetings) | Agenda posted and filed "no later than ten days before the date of the meeting" (Council, Port, PEC). Others: Brown Act + clerk filing "at least seventy-two (72) hours". Amendments allowed until "seventy-two (72) hours before". | days / hours | backward | — | — |
| *Note on the brief* | The brief's "OMC 2.20.070 = 48 business hours" is **correct**. The section is titled *Special meetings*; regular meetings are 2.20.080 (10 days). | | | | |
| Gov. Claims Act, Gov. Code §911.2(a) | "not later than six months after the accrual" (death, personal injury, personal property, growing crops); "not later than one year after the accrual" (any other) | calendar months / year | forward from accrual | CCP §12a | late-claim application §911.4 (out of scope) |
| Related: §912.4(a) / §945.6(a)(1) | Board acts "within 45 days after the claim has been presented"; suit "not later than six months after the date such notice is personally delivered or deposited in the mail" | days / months | forward | CCP §12a | §912.4(b): extension by written agreement |
| FOIA, 5 U.S.C. §552(a)(6)(A)(i), (B)(i) | "determine within 20 days (excepting Saturdays, Sundays, and legal public holidays) after the receipt of any such request"; (B)(i): "No such notice shall specify a date that would result in an extension for more than ten working days" | working days | forward from receipt by the proper component (≤10 days after receipt by any component) | built in (non-working days are not counted) | +10 working days; tolling (A)(ii)(I)/(II) |
| CCP §12 (= Gov. Code §6800, same words) | "computed by excluding the first day, and including the last, unless the last day is a holiday, and then it is also excluded" | — | — | — | — |
| CCP §12a(a) | "If the last day … is a holiday, then that period is hereby extended to and including the next day that is not a holiday. … 'holiday' means all day on Saturdays, all holidays specified in Section 135 and … Section 12b" | — | — | forward roll | (b): applies to any "code or statute, ordinance, rule, or regulation" |
| CCP §135 | Judicial holidays = Gov. Code §6700 days except Lunar New Year, Diwali, Genocide Remembrance Day (Apr 24), Admission Day, **Columbus Day** (amended by AB 268, eff. 2026-01-01); plus "Every Saturday and the day after Thanksgiving" | — | — | — | — |
| Gov. Code §6700 | State holiday list, **amended by Stats. 2026 ch. 7 (AB 2156), eff. 2026-03-26**: adds Farmworkers Day (Mar 31), Genocide Remembrance Day, Diwali, Lunar New Year. (20)(B): optional for cities. | — | — | — | — |

### 1c. Conventions the sources leave to BOB (ruling items, not blockers)

1. **Which closure calendar rolls a CPRA deadline?** By law (CCP §12a) it is the judicial list of §135. In practice, Oakland's portal uses the City's paid-holiday list (M-190). The two differ on 2026-09-25 (Native American Day): see fixtures O6/N6. The profile already keeps both lists. The engine needs a per-rule `closures` selector.
2. **Where the CPRA 14-day extension is counted from**: day 10 before the roll, or the rolled due date. The statute is silent; the fixtures below count it from day 10 before the roll.
3. **Weekend receipt.** Oakland's staff guide (§5, City Attorney, PDF dated 2025-04-29) says a request is "received … on the next business day if submitted on a non-business day". The City's own portal does this inconsistently (Sun 10-04 → due 10-14 for 144 requests, but → 10-15 for 38). This bears on §7 item 1 (`received`).
4. **Calendar-month end** for §911.2 six months (e.g. accrual on Aug 31). No primary source was found here (Gov. Code §14 / CCP §17 define "month" as a calendar month). The month-end clamp is unsourced.
5. **OMC 48 business hours with a holiday** inside the window: the text says "excluding … holidays", but it does not say which holiday list. The City list (M-190) is the natural choice.

---

## 2. Oakland profile: UNMEASURED values (`jurisdictions/profiles/oakland-alameda.mjs`)

| Line | Item | Primary source found | Result |
|---|---|---|---|
| 247–249 | `records_response` 10 calendar days from `received`, extension 14 days | Gov. Code §7922.535(a),(b) (leginfo, quoted above). The City's own practice (portal due dates, §3) matches 10 calendar days with a forward roll. | **Sourced.** Days, count and extension all match. Also add the CCP §12/12a computation. |
| — (missing rule) | Oakland Immediate Disclosure Request | OMC 2.20.230: "satisfied no later than three business days"; written determination "within seven days of the date of the request"; records "no later than fourteen (14) days after the written determination" | **New candidate rule** (3 business days) for the first rule set. |
| 180 | `practice.minutes_due_days` 21 | OMC 2.20.160: "draft minutes … no later than ten business days after the meeting"; adopted minutes "no later than five business days after the meeting at which the minutes are adopted" | **Contradicted.** The code says 10 *business* days (draft). Replace the value or re-basis it. |
| 201–202 | `standard_sources` Gov. Code | leginfo.legislature.ca.gov (official) | Sourced. |
| 208 | Controller, City of Oakland Finance Department, not elected | Oakland Charter §504(e): City Administrator "may appoint a Director of Finance to act under the City Administrator's direction" (Municode Charter Art. V). The bureau's name was not in the charter. | Sourced: appointed, not elected. |
| 209 | City Council, elected | Charter §200: "eight Councilmembers, nominated and elected" | Sourced. |
| 210 | Alameda County Civil Grand Jury, not elected, oversight | Penal Code §888 (citizens "returned … before a court"; civil-concern inquiry); §925a ("may at any time examine the books and records of any incorporated city") | Sourced. |
| 211–215 | City Auditor, elected, oversight | Charter §403(1): "The City Auditor shall be nominated and elected in the same manner … as the Mayor" | Sourced. |
| 216 | State Controller, elected | Cal. Const. art. V §11: "…Controller … shall be elected" (leginfo CONS) | Sourced. |
| 220 | Venue: NextRequest portal | `https://oaklandca.nextrequest.com/client/requests` is live, with 118,270 requests on 2026-10-05; the staff guide names Next Request | Sourced (measured). |
| 235 | `records_petition` venue: Alameda County Superior Court | Gov. Code §7923.100: "verified petition to the superior court of the county where the records or some part thereof are situated" | Sourced. |
| 182, 186–187 | `locale`, `search_terms` | Configuration choices, not law | No primary source is applicable. This is BOB's ruling, not a measure. |
| 224, 226, 228; 255, 257 | action kinds without tier; legal organisations | Not legal rules (URLs not re-measured here) | Out of scope for this measure. |

---

## 3. Worked deadline fixtures (20), each with a negative control

Kinds: **P** = published worked example (third-party guide); **R** = official record (published by the agency or court); **C** = example stated in the code itself; **E** = a published example that is *wrong* (negative only); **D** = derived by the worker (no published example was found, so it needs a second source before it is used as a positive).

| # | K | Rule | Start | Expected due | Negative (must differ / be refused) | Source |
|---|---|---|---|---|---|---|
| P1 | P | CCP §1005(b): 16 court days back; Memorial Day 2018-05-28 | hearing Mon 2018-06-18 | 2018-05-24 | 2018-05-25 (holiday counted) | saclaw.org/resource_library/calculate-deadlines-to-file-and-serve/ |
| P2 | P | CCP §1005 mail: +5 calendar days back; weekend rolls *back* to the court day | same | Fri 2018-05-18 | Sat 2018-05-19 (no backward roll) | same |
| P3 | P | CCP §2030.260: 30 calendar days, CCP §12 | served Apr 1 (2026) | Fri 2026-05-01 | 2026-04-30 (start day counted) | litigationbythenumbers.com/getting-date-right.html |
| P4 | P | 20 calendar days; Mon 13 Apr court holiday mid-period has no effect | served Fri 2026-04-03 | Thu 2026-04-23 | Fri 2026-04-24 (holiday wrongly excluded) | rulesofcivilprocedure.com/guides/computing-deadlines/ |
| P5 | P | 30 days, personal service, CCP §12a roll | served 2020-10-01 | Mon 2020-11-02 (day 30 is Sat 10-31) | Sat 2020-10-31 (no roll) | evanwalkerlaw.com/blog/how-to-calendar-dates-in-california-court/ |
| P6 | P | CCP §1005, 16 court days back, **2020 calendar** (Columbus Day was then a judicial holiday; AB 855 later swapped it for Native American Day) | hearing Fri 2020-10-30 | 2020-10-07 | 2020-10-08 (2026's §135 list applied to 2020) | same; AB 855 bill text (leginfo) |
| E1 | E | CCP §1013(a) mail +5 calendar days added to 30 | served 2020-10-01 | **2020-11-05** by statute | the published 2020-11-06 (its arithmetic puts day 30 at Nov 1) must **not** be matched | same (Evan Walker) |
| E2 | E | CCP §1010.6 e-service +2 court days | served 2020-10-01 | **2020-11-03** by statute | the published 2020-11-04 must **not** be matched | same |
| R1 | R | Gov. Code §945.6(a)(1): six months from mailing of rejection | 2023-11-17 | 2024-05-17 | 2024-05-18 | Santa Barbara Super. Ct. tentative ruling, 24CV05742 (santabarbara.courts.ca.gov/system/files/tentative-rulings/demurrer-24cv05742.pdf) |
| C1 | C | OMC 2.20.070(C): Monday special meeting | meeting Mon 2026-10-19 | Fri 2026-10-16 12:00 | posting at Fri 2026-10-16 12:01 refused | OMC 2.20.070 (Municode API); CAO Brown Act/Sunshine overview 2021-04 p.10 |
| O1 | R | CPRA 10 days (Oakland portal) | Mon 2026-10-05 | Thu 2026-10-15 | 2026-10-14 | NextRequest 26-11824 |
| O2 | R | same; Sun → Mon roll | Thu 2026-10-01 | Mon 2026-10-12 | Sun 2026-10-11 | NextRequest 26-11728 |
| O3 | R | same; Sat → Mon roll | Wed 2026-09-30 | Mon 2026-10-12 | Sat 2026-10-10 | NextRequest 26-11682 |
| O4 | R | same; Sat → Labor Day → Tue | Wed 2026-08-26 | Tue 2026-09-08 | Mon 2026-09-07 | NextRequest 26-10008 |
| O5 | R | same; Columbus Day (10-12) is *not* a closure | Fri 2026-10-02 | Mon 2026-10-12 | Tue 2026-10-13 | NextRequest 26-11741 |
| O6 | R | same; Native American Day **not** on the City list | Tue 2026-09-15 | Fri 2026-09-25 (City practice) | — see N6 | NextRequest (33 requests dated 09/15 → 09/25) |
| N6 | D | CPRA under CCP §12a with the §135 list | Tue 2026-09-15 | Mon 2026-09-28 (law) | Fri 2026-09-25 must be flagged as the *City-practice* answer, not the statutory one | CCP §§12, 12a, 135 (leginfo). Ruling 1c-1. |
| F1 | D | FOIA 20 working days; Columbus Day is a federal holiday | rcvd Mon 2026-10-05 | Tue 2026-11-03 | Mon 2026-11-02 (Oct 12 counted) | 5 U.S.C. §552(a)(6)(A)(i); legal public holidays per 5 U.S.C. §6103(a) (not fetched) |
| F2 | D | FOIA + 10 working-day extension; Veterans Day 11-11 | rcvd Mon 2026-10-05 | Wed 2026-11-18 | Tue 2026-11-17 | §552(a)(6)(B)(i) |
| F3 | D | FOIA; Thanksgiving 11-26 | rcvd Wed 2026-11-04 | Fri 2026-12-04 | Thu 2026-12-03 | same |

Totals: 15 usable positives (P1–P6, R1, C1, O1–O6, plus N6 as a law-versus-practice pair), 2 negative-only rows (E1–E2) and 3 derived rows (F1–F3). **What is missing:** a published FOIA worked example (agency guides state the rule without dates), a published Brown Act 72 h/24 h example, and a published §911.2 six-month or one-year example. Derived timed checks that jobs can use as inputs: Brown Act regular meeting Tue 2026-10-20 18:00 → posted by Sat 2026-10-17 18:00 (negative: 18:01). OMC 48 business hours: meeting Wed 2026-10-14 18:00 → Fri 2026-10-09 18:00 (Columbus Day is not a City holiday; negative: Mon 10-12 18:00).

The portal source is `https://oaklandca.nextrequest.com/client/requests?page_number=N` (JSON, public). The worker read 3,000 requests; the modal gaps are 10/11/12/13 days, matching a 10-day count with a forward roll on the City list. Only ids and dates are recorded here; the request text holds personal data and is **not** to be copied into fixtures.

---

## 4. How the official Oakland Municipal Code is served; codifier lag

**How it is served.** `library.municode.com/ca/oakland/codes/code_of_ordinances?nodeId=…` returns a 6,095-byte Angular shell (`ng-app="mcc.library_desktop"`) with **no code text**. An un-rendered fetch yields nothing, and docprofile classifies it as `client_rendered` (shell). The same library is backed by an **open JSON API** that needs no key:

| Endpoint (api.municode.com) | Gives |
|---|---|
| `Clients/stateAbbr?stateAbbr=ca` | Oakland = ClientID 3637 |
| `ClientContent/3637` | products: Code of Ordinances 16308, Planning Code 16490 |
| `Jobs/latest/16308`, `Jobs/product/16308` | supplement history, with `BannerText` "Codified through Ordinance No. …, passed …" and `OnlinePostDate` |
| `codesToc/children?jobId&nodeId&productId` | the table of contents, with stable node ids |
| `CodesContent?jobId&nodeId&productId` | `Docs[]`, one per section, each with `Id`, `Title` and HTML `Content` (history notes included), plus `NewOrds` (OrdBank pending ordinances) |

The PDF is `hasPdfDownloadEnabled:false` for the Code of Ordinances. The Charter is returned as article-level docs (sections sit inside the article HTML, not as separate nodes).

**Codifier lag.** Legistar enactment dates come from `webapi.legistar.com/v1/oakland/matters?$filter=startswith(MatterEnactmentNumber,'138')`. **`MatterEnactmentDate` is null on all 99 ordinances**, so the measure used `MatterPassedDate`.

| Ordinance | Legistar passed | Subject (OMC) | Municode supplement | Online | Lag (days) |
|---|---|---|---|---|---|
| 13853 | 2025-07-15 | Title 15 impact fees | Supp 100 | 2025-10-01 | 78 |
| 13858 | 2025-09-15 | 6.04 Animal control | Supp 101 | 2026-05-21 | 248 |
| 13870 | 2025-12-16 | Fire Code | Supp 102 | 2026-09-18 | 276 |
| 13873 | 2026-02-17 | 9.08.260 | Supp 103 | 2026-10-05 | 230 |
| 13849 | 2025-06-17 (Municode lists 6-3-2025) | Campaign Reform Act (temporary) | Supp 103 | 2026-10-05 | 475 |
| 13872 | 2026-01-06 | Campaign Reform Act amendment | **not in the supplement history** through Supp 103 | — | open |
| 13885, 13896 | 2026-06-16, 2026-09-15 | 3.08; Cultural Affairs Comm. | not yet codified | — | ≥20–111 so far |

Today the code is current through 2026-02-17 (Supp 103, posted 2026-10-05). That is a **230-day gap**; 24 ordinances (13874–13897) were passed after it. Two further notes for `standards`: (a) the Legistar and Municode dates can disagree (13849: passed 06-17 versus listed 06-03); (b) an ordinance can be missing from the codifier's history table (13872). Both support `copy: codifier`, `current_through` and an "undetermined" answer.

---

## 5. Section-boundary accuracy

**Captures in the repo:** none of OMC code pages. `git ls-tree origin/study/constructs` has no omc/municode path. `docprofile/test/fixtures/fw18-doctypes.json` holds Legistar *instruments* (ordinances or resolutions), not code sections.

**What was run.** `docprofile/doctypes/regulation.mjs` (today's reader) with the `HELD` view, on **50 OMC sections** fetched from the API (OMC 2.20.010–2.20.300 and 8.22.x), one at a time and concatenated:

| Check | Result |
|---|---|
| Sections detected as `regulation` | 0 / 50 (no enacting formula: a code page is not an instrument) |
| Section boundaries recovered from the concatenated text | 0 / 50 (1 number matched, and only as a cross-reference) |
| Entities emitted | 11 `code_section` citations, for example `omc:5.04.110`, all cross-references |

**Assessment.** Today's regulation reader has no section segmentation. "Regulation sections (1a)" is new work, not tuning. The source structure is good. The API delivers one doc per section, with the heading pattern `^\d+\.\d+\.\d+[A-Z]? - Title\.`, the subsection markers `A.`/`1.`/`(a)` in the HTML, and a trailing history note `(Ord. NNNNN § n, YYYY; …)`. So capturing the code through the API gives 100% boundaries by construction. A text-only reader is needed only for captured PDFs, the Planning Code PDF or the Charter. **Captures needed for a real accuracy figure:** about 50 sections captured the way the plane will capture them (the API JSON, or rendered pages), plus about 10 Charter sections (article-level docs), stored under `docprofile/test/fixtures/` with provenance.

---

### What this means for T33 entries

- `jurisdictions` (L1, TIME/LAW): unblocked. Add the OMC 2.20.230 IDR rule, correct `minutes_due_days`, record the copy status `codifier` with `current_through` from `Jobs/latest`. Needs BOB's rulings 1c-1 to 1c-5.
- `civil-time` (L1): fixtures P1–P6, R1, C1, O1–O6 and N6 are ready. Clock-hour, business-hour and backward rules (Brown Act, OMC) and FOIA lack published examples, so they rest on derived rows. That is PARTIAL against P7.
- `standards` (L5) and the regulation-sections reader: measure-first "how the official code is served" is answered (use the API, not the shell). Codifier lag is measured. Section-boundary accuracy cannot be measured on today's reader (0/50); the 1a job builds the segmenter and its fixtures.
