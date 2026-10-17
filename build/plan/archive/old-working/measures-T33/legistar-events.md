# T33 desk measures: Legistar, events, budget codes, hubs

Desk research for BOB #114, taken 2026-10-05 before T33 opens. It covers M-P2, M-V1, M-V2, M-V3, the budget department codes, the bridge resolution estimate and the initial M-P4 hub thresholds. All API reads were keyless GETs of the Legistar Web API and Socrata, made on 2026-10-05. Nothing is committed beside this file. The captured JSON and PDFs used here are in the session scratchpad only (see §7).

## Summary

| Measure | Verdict | Plan consequence |
|---|---|---|
| M-P2 Persons/OfficeRecords | **PARTIAL** | Seats exist for the Council and its committees only. The 42 boards and commissions are absent. End dates are unreliable, so the seed must be dated "as recorded by Legistar" (K1443) and needs a staleness rule. |
| M-V2 Events coverage, zone | **GO** | 572 events over three years. 100% of `EventDate` values are midnight with no zone, and the time is a separate `h:mm AM/PM` string, so `civil-time` must join them in America/Los_Angeles (profile `time_zone`, M-187). `EventAgendaLastPublishedUTC` is the last publication, not the first. |
| Budget department/org codes | **GO** (org, fund); **PARTIAL** (department) | Org codes are 95–98% stable from cycle to cycle. Department groupings were reorganised (FY13-15→15-17) and recoded (DP codes from FY19-21). Key on org/fund codes and treat departments as dated groupings. |
| M-V1 reader date accuracy | **GO** | 36/36 dates correct (3 bodies × 6 events × agenda+minutes). The readers return the date only. The start time is not read from agendas. Minutes give convened/adjourned as text. |
| M-V3 50-event gold set | **GO** | 50 events across 27 Legistar bodies, 2024–2026. Each is checked against its agenda PDF masthead (50/50 agree). Table in §5. |
| Bridge resolution | **PARTIAL** | 3/5 profile counterparties resolve (all 3 city-level ones), but only after normalisation. Exact match is 0/5. |
| M-P4 hub thresholds | **GO** (initial) | Proposed thresholds are in §6. |

**Can a Legistar reader and following be built and tested against captured Legistar JSON? Yes.** The API is keyless, stable and paged at 1,000 rows (`$top`/`$skip`; OfficeRecords has 1,262 rows, so paging is required). Fixtures to capture into the job's test tree are `bodies`, `persons`, `officerecords` (both pages) and `events` for 2023-10 to 2026-10, plus `events/{id}` for the 50 gold events. None is in the repository today. The only Legistar-shaped fixtures are PDFs (`bio-plane/test/fixtures/legistar-agenda-1425405.pdf`, `cpdf20/legistar-*.pdf`) and `bio-plane/test/m/entities/legistar-1425405-refs.json`, and none of these is a Web API JSON capture. So item 2a ("could move if the reader is built and tested against captured Legistar JSON") is unblocked by desk work, provided the job captures the fixtures itself. Live following still needs a deployed copy.

## 1. M-P2 — Persons and OfficeRecords

Sources: https://webapi.legistar.com/v1/oakland/persons (591 rows), /officerecords (1,262 rows over 2 pages), /bodies (151 rows), all read 2026-10-05. The latest `OfficeRecordLastModifiedUtc` is 2026-09-14.

| Fact | Value |
|---|---|
| OfficeRecords with a start date | 1,262 / 1,262 (100%) |
| with an end date | 1,208 / 1,262 (95.7%) |
| `OfficeRecordTitle` | null in 100% of rows. The role is only `MemberType`: Member 1,135, Chair 126 |
| Seat granularity | No district or seat identifier. A record is person × meeting-body × date range |
| Body types (151) | Requestors 52 (departments and people as sponsors, not meeting bodies), Committee 49, Special Meeting 26, City Council 19, Rules 4, Other 1 |
| Meeting bodies → real organisations | 99 non-requestor bodies collapse to about 71 names after stripping Special/Concurrent/CANCELLED, and to about 10 live organisations: the Council, 6 standing committees (Rules, F&M, CED, PS, LE, PWT, with Education Partnership intermittent), ORSA, GHAD, JPFA and City/Port Liaison |
| Boards and commissions | **None** of the 42 on https://www.oaklandca.gov/Government/Boards-Commissions (read 2026-10-05) has OfficeRecords. Public Ethics Commission and Business Tax Board appear only as Requestors |
| Data quality | Stale holders: Dan Kalb (term ended January 2023) and Lynette McElhaney (term ended January 2021) are still "active" in 2026 on some committee bodies. Duplicate person: "Kevin  Jenkins" (double space) and "Kevin Jenkins". End dates run up to 2030 (planned term ends) |

Contact fields present, all to be dropped (K1485):

| Field | Rows non-empty |
|---|---|
| `PersonEmail` | 458 / 591 |
| `PersonPhone` | 51 |
| `PersonFax` | 30 |
| `PersonAddress1` | 10 |
| `PersonWWW` | 8 |
| `PersonPhone2`, `PersonEmail2` | 0 |
| `OfficeRecordEmail` | 564 / 1,262 |

Distinct persons holding a record active in each year, for selected bodies (2016 → 2026):

| Body (Legistar name) | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Meeting of the Oakland City Council | 8 | 8 | 0 | 8 | 8 | 8 | 1 | 1 | 1 | 0 | 0 |
| Concurrent Meeting of ORSA and the City Council (*) | 5 | 5 | 5 | 7 | 7 | 12 | 10 | 8 | 7 | 12 | 8 |
| *Rules & Legislation Committee | 4 | 5 | 4 | 7 | 5 | 5 | 4 | 4 | 3 | 5 | 4 |
| *Public Safety Committee | 4 | 5 | 4 | 8 | 4 | 5 | 2 | 2 | 2 | 5 | 4 |
| *Community & Economic Development Cttee | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 2 | 2 | 6 | 5 |
| *Finance & Management Committee | 4 | 5 | 4 | 6 | 2 | 2 | 0 | 1 | 1 | 6 | 5 |
| *Life Enrichment Committee | 4 | 7 | 4 | 5 | 5 | 2 | 2 | 1 | 1 | 4 | 4 |
| *Public Works Committee / PWT | 4 | 6 | 4 | 4 | 4 | 2 | 2 | 4 | 4 | 4 | 4 |
| City/Port Liaison Committee | 0 | 0 | 0 | 7 | 7 | 0 | 0 | 4 | 4 | 4 | 3 |
| All 49 bodies with records in range (sum) | 165 | 191 | 125 | 215 | 137 | 164 | 107 | 83 | 67 | 156 | 151 |

The Council's seats are kept on whichever Council body variant the clerk used, which shifted after 2021. The 2022–2024 dip is upkeep, not vacancy.

**PARTIAL.** Seeding Council and committee `seat_on`/`holds` lines from Legistar works, but needs four conditions:
- (a) a body-variant → organisation map, which is profile data;
- (b) seats keyed person × organisation, with no district;
- (c) dates as asserted by Legistar, never as truth, with a staleness check against events attendance;
- (d) person de-duplication on whitespace-normalised names.

Boards and commissions need another source (city web pages), outside 1b.

## 2. M-V2 — Events coverage and zone

Source: `events?$filter=EventDate ge datetime'2023-10-01' and EventDate lt datetime'2026-10-06'`, read 2026-10-05. 572 rows: 2023 Q4 54, 2024 201, 2025 186, 2026 to date 131.

| Fact | Value |
|---|---|
| `EventDate` at midnight `T00:00:00` | 572 / 572 (100%) |
| `EventDate` carrying a zone or offset | 0 / 572 (0%) |
| `EventTime` present | 572 / 572, format `h:mm AM` / `hh:mm PM`, with no zone |
| `EventAgendaFile` / `EventMinutesFile` | 546 / 430 |
| `EventAgendaLastPublishedUTC` / `EventMinutesLastPublishedUTC` | 548 / 430 (UTC by name; the value has no `Z`) |
| `EventLastModifiedUtc` | 572 |
| Agenda status | FINAL 371, SUPPLEMENTAL 199, HIDDEN 2; minutes FINAL 416, DRAFT 156 |
| Cancelled events (body name or comment says CANCEL) | 134 (23%) |
| Agenda last-published after the meeting start | 10 of 548; published 0–72 h before the start: 133 |

Events by body (top rows; 2023 is Q4 only):

| Body | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|
| *Rules & Legislation Committee | 9 | 33 | 36 | 22 |
| *Community & Economic Development Cttee | 3 | 16 | 17 | 10 |
| * Public Works And Transportation Cttee | 4 | 17 | 13 | 12 |
| Special Concurrent Meeting of ORSA/Council | 4 | 15 | 18 | 6 |
| *Finance & Management Committee | 3 | 13 | 13 | 11 |
| *Life Enrichment Committee | 3 | 15 | 10 | 12 |
| * Concurrent Meeting of ORSA and the City Council | 3 | 12 | 13 | 10 |
| *Public Safety Committee | 2 | 11 | 7 | 10 |
| "- CANCELLED"/"- CANCELLATION" variants (7 bodies, summed) | 17 | 46 | 36 | 25 |
| others (13 bodies) | 6 | 23 | 23 | 13 |
| **Total** | 54 | 201 | 186 | 131 |

**GO.** Plan consequences:
- (1) The start instant is `EventDate[0:10] + EventTime`, interpreted in the profile's `time_zone`. 100% of rows need it, so it is the rule, not an edge case.
- (2) Cancellation is a separate body ("… - CANCELLED"), not a status. The reader must fold it onto the base body as `status: cancelled`.
- (3) `EventAgendaLastPublishedUTC` is overwritten on each supplemental republish (199 SUPPLEMENTAL). It cannot stand for first posting, so a `publication` event's time is the first time BIO observes a new `LastPublished` value, recorded as observed, or a captured agenda's own "Printed on" line.
- (4) There are about 190 events a year, so a 3-year backfill is about 570 rows: one page.

## 3. Budget department and org codes

Sources (Socrata, data.oaklandca.gov, read 2026-10-05): FY13-15 adopted `vmzx-e5fe`; FY15-17 adopted `urid-amga`; FY19-21 adopted `m4jd-q2c4` (proposed `aeya-c8st`). FY25-27 adopted budget book PDF: https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/fiscal-years/2025-2027-budget/fy25-27-adopted-budget-book-full-10.10.25-reduced-size.pdf (10 Oct 2025). Open data has no budget line-item dataset after FY19-21. FY21-23 onward is on OpenGov stories only (https://stories.opengov.com/oaklandca/), with no code-level export found.

| Comparison | Older orgs | Newer orgs | Older codes still present | Same code, same description |
|---|---|---|---|---|
| FY13-15 → FY15-17 | 346 | 357 | 327 (95%) | 318 |
| FY15-17 → FY19-21 | 357 | 438 | 350 (98%) | 326 |

Departments are less stable. FY13-15 had "Administrative Services" and "Community Services". By FY15-17 these were split into Finance, HRM, IT, Human Services, Parks & Rec and EWD, and Race & Equity and Public Ethics were added. FY19-21 introduced coded departments (`DP010` Mayor … `DP1000` Police, `DP350` DOT, `DP660` Police Commission, `DP700` Violence Prevention, `DPCC0` Council; 27 codes). Fund 1010 (General Purpose Fund) is unchanged from FY13 to the FY25-27 book. The FY25-27 book prints no org or department codes.

**GO for org and fund codes, PARTIAL for departments.** The `money`/ORG plan should:
- key budget lines on org and fund codes, which are stable from cycle to cycle;
- treat a department as a dated grouping of orgs, which can be reorganised;
- not promise a code-level budget import for FY21-27 until an OpenGov export is found. Only names are available for those years.

## 4. M-V1 — today's readers on meeting dates

Readers: `docprofile/doctypes/meeting-agenda.mjs` (date = first `Weekday, Month d, yyyy` line in the first 60 lines) and `meeting-minutes.mjs` (same rule, plus `convened`/`adjourned`). Repository fixtures found:
- `bio-plane/test/fixtures/legistar-agenda-1425405.pdf` (Rules, 2026-07-16)
- `cpdf20/legistar-73450/73545/73550/73618.pdf` (staff reports, not agendas)
- `d460/agenda-p1/p2.pdf` (no text layer)
- `reading-pipeline/fixtures/ncpc-zoom-meeting-dates.pdf` (an NCPC schedule, many dates per document)
- `ocr-worker/test/fixtures/agenda-two-scanned-pages.pdf` (scanned)

`origin/study/constructs` adds only study notes (`study/constructs/phase2/studies/EVENTS.md`). Because the repository holds only one agenda, I captured a sample for this measure: 6 events per body for 3 bodies, agenda and minutes PDFs from `EventAgendaFile`/`EventMinutesFile`, converted with `pdftotext` in both raw and default modes. I called the readers' `parse({text})` directly.

| Body | Agenda dates correct | Minutes dates correct |
|---|---|---|
| *Rules & Legislation Committee | 6/6 | 6/6 |
| *Public Safety Committee | 6/6 | 6/6 |
| * Concurrent Meeting of ORSA and the City Council | 6/6 | 6/6 |
| **Total** | **18/18** | **18/18** (both text modes) |

Examples of minutes `convened`/`adjourned` output: "Convened At 10:48 A.M." / "Adjourned The Meeting At 12:24 P.M.". The scheduled time is 10:30 AM, so the actual start differs from the scheduled one.

**GO, with caveats:**
- All 36 documents come from the one Legistar template, so this says nothing about board and commission agendas published elsewhere.
- The agenda reader returns `date` only. The printed start time ("10:30 AM", the line after the date) is not read. Adding it is a small change.
- `convened`/`adjourned` are text, not instants.
- None of the outputs carries a zone. `civil-time` must attach the profile zone.

## 5. M-V3 — 50-event gold set

Selection: round-robin over the 27 Legistar bodies with agenda files, 2024-01-01 to 2026-10-04, seed 50. "Agenda agrees" means the agenda PDF's masthead date and time line equals `EventDate`+`EventTime` (checked 2026-10-05; 50/50). The zone is America/Los_Angeles, with the offset computed per date: 32 rows at −07:00 and 18 at −08:00, so the set exercises DST. Kinds: regular 12, special 20, concurrent 4, cancelled 14. "Kind" is derived from the body name, because Legistar has no kind field. Source URL: the API event record. Its `EventInSiteURL` and `EventAgendaFile` give the human page and the PDF.

| # | Body (as Legistar names it) | Kind | Start (zoned) | Source | Agenda agrees |
|---|---|---|---|---|---|
| 1 | *Finance and Management Committee - CANCELLED | cancelled | 2024-01-09T09:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9016 | yes |
| 2 | * Public Works And Transportation Committee | regular | 2024-03-26T11:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9077 | yes |
| 3 | *Special Rules and Legislation Committee | special | 2024-03-28T10:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9098 | yes |
| 4 | *Public Safety Committee | regular | 2024-04-09T18:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9087 | yes |
| 5 | *Life Enrichment Committee | regular | 2024-04-23T16:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9095 | yes |
| 6 | Special Concurrent Meeting of the Education Partnership Committee and the Oakland Unified School District Board of Education | special | 2024-05-06T16:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9117 | yes |
| 7 | Concurrent Meeting of the Oakland Redevelopment Successor Agency/City Council/Geologic Hazard Abatement District Board | concurrent | 2024-06-04T15:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9121 | yes |
| 8 | *Special Concurrent Meeting of the Oakland Redevelopment Agency/City Council | special | 2024-06-12T15:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9119 | yes |
| 9 | *Finance & Management Committee | regular | 2024-07-09T09:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9145 | yes |
| 10 | *Life Enrichment Committee - CANCELLED | cancelled | 2024-07-09T16:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9148 | yes |
| 11 | *Community and Economic Development Committee - CANCELLED | cancelled | 2024-07-09T13:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9161 | yes |
| 12 | Office of the Mayor Annual Recess Agenda | special | 2024-08-20T08:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9168 | yes |
| 13 | *Special Concurrent Meeting of the Oakland Redevelopment Agency/City Council | special | 2024-10-07T09:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9205 | yes |
| 14 | *Finance and Management Committee - CANCELLED | cancelled | 2024-10-22T09:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9210 | yes |
| 15 | *Special Finance & Management Committee | special | 2024-10-22T09:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9197 | yes |
| 16 | * Special Concurrent Meeting of the Oakland City Council, SSOC, CPAB, and Police Commission | special | 2024-10-29T18:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9206 | yes |
| 17 | * Concurrent Meeting of the Oakland Redevelopment Successor Agency and the City Council | concurrent | 2024-11-12T15:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9215 | yes |
| 18 | *Special Finance & Management Committee | special | 2024-11-19T08:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9217 | yes |
| 19 | *Rules and Legislation Committee - CANCELLED | cancelled | 2024-11-28T10:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9235 | yes |
| 20 | *Public Works And Transportation Committee - CANCELLED | cancelled | 2024-12-10T11:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9240 | yes |
| 21 | *Special Community & Economic Development Committee | special | 2024-12-10T13:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9229 | yes |
| 22 | * Special Public Works And Transportation Committee | special | 2024-12-10T10:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9228 | yes |
| 23 | *Rules & Legislation Committee | regular | 2025-01-30T10:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9269 | yes |
| 24 | *Special Public Safety Committee | special | 2025-02-25T16:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9285 | yes |
| 25 | Meeting of the Oakland City Council  - CANCELLATION | cancelled | 2025-04-01T15:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9309 | yes |
| 26 | *Public Safety Committee - CANCELLED | cancelled | 2025-04-08T18:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9315 | yes |
| 27 | Meeting of the Oakland City Council  - CANCELLATION | cancelled | 2025-05-20T15:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9338 | yes |
| 28 | *Public Works And Transportation Committee - CANCELLED | cancelled | 2025-07-08T11:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9378 | yes |
| 29 | *Community & Economic Development Committee | regular | 2025-07-22T13:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9381 | yes |
| 30 | Office of the Mayor Annual Recess Agenda | special | 2025-08-19T08:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9388 | yes |
| 31 | Special Concurrent Meeting of the Oakland Redevelopment Successor Agency/City Council | special | 2025-09-15T09:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9391 | yes |
| 32 | *Special Education Partnership Committee | special | 2025-09-22T15:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9393 | yes |
| 33 | * Special Public Works And Transportation Committee | special | 2025-09-30T11:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9402 | yes |
| 34 | *Life Enrichment Committee - CANCELLED | cancelled | 2025-10-28T16:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9418 | yes |
| 35 | *Rules & Legislation Committee | regular | 2025-11-06T10:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9422 | yes |
| 36 | *Special Life Enrichment Committee | special | 2025-11-18T16:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9428 | yes |
| 37 | *Rules and Legislation Committee - CANCELLED | cancelled | 2025-11-27T10:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9441 | yes |
| 38 | Special Concurrent Meeting of the Oakland Redevelopment Successor Agency/City Council | special | 2025-12-16T13:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9450 | yes |
| 39 | * Concurrent Meeting of the Oakland Redevelopment Successor Agency and the City Council | concurrent | 2026-01-06T15:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9451 | yes |
| 40 | *Life Enrichment Committee | regular | 2026-01-13T16:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9457 | yes |
| 41 | *Public Safety Committee - CANCELLED | cancelled | 2026-01-27T18:00:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9469 | yes |
| 42 | *Community and Economic Development Committee - CANCELLED | cancelled | 2026-01-27T13:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9465 | yes |
| 43 | * Public Works And Transportation Committee | regular | 2026-02-10T11:30:00-08:00 | https://webapi.legistar.com/v1/oakland/events/9473 | yes |
| 44 | *Public Safety Committee | regular | 2026-03-10T18:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9492 | yes |
| 45 | *Special Rules and Legislation Committee | special | 2026-03-12T09:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9506 | yes |
| 46 | *Community & Economic Development Committee | regular | 2026-03-24T13:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9498 | yes |
| 47 | *Special Community & Economic Development Committee | special | 2026-04-21T13:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9518 | yes |
| 48 | *Special Public Safety Committee | special | 2026-04-21T18:00:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9520 | yes |
| 49 | Concurrent Meeting of the Oakland Redevelopment Successor Agency/City Council/Geologic Hazard Abatement District Board | concurrent | 2026-07-07T15:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9559 | yes |
| 50 | *Finance & Management Committee | regular | 2026-09-22T09:30:00-07:00 | https://webapi.legistar.com/v1/oakland/events/9580 | yes |

## 6. M-P4 — hub sizes and initial thresholds

| Hub candidate | Size | Source (read 2026-10-05) |
|---|---|---|
| City of Oakland as employer (payroll rows, 2024) | 5,119 records | https://transparentcalifornia.com/salaries/2024/oakland/ |
| City authorised positions FY25-26 / FY26-27 | 4,483.76 / 4,478.75 FTE | FY25-27 adopted budget book, Position Summary by Fund |
| General Purpose Fund 1010 positions FY25-26 | 2,372.2 FTE ("General Funds total") | same |
| Boards, commissions and committees | 42 | https://www.oaklandca.gov/Government/Boards-Commissions |
| Legistar live meeting organisations | about 10 (Council and committees) | /bodies, §1 |
| Legistar matters introduced in 2025 | 852 | /matters, filtered on `MatterIntroDate` |
| Legistar events a year | about 190 | §2 |
| Campaign Schedule A contributions, all years | 73,043 rows, 331 filers; largest filer (IAFF Local 55 PAC) 6,926 | `3xq4-ermg` |
| Lobbyist contacts with officials, all years | 5,481 rows, 216 officials; the most-lobbied official 247 | `ucs9-a92d` |
| Org codes in one budget | 438 (FY19-21) | §3 |

No public line-level checkbook or vendor-payment dataset exists on data.oaklandca.gov. The largest funds' transaction counts were therefore **not findable**. Fund 1010 is the obvious fund hub: it carries about half of all positions.

Proposed initial thresholds, to be re-measured on a real group:
- **Named a hub ("too common to walk")** when an entity's shared set exceeds **1,000** members. This equals the per-hop fan-out bound. It catches the City as employer (5,119), Fund 1010 and any large PAC's contributor set (6,926), and leaves boards (at most about 15 seats each) and committees walkable.
- **Co-mention hub** (B1a.6, X110): keep **> 32 documents** as drafted. For scale, a committee with about 35 meetings a year (Rules) crosses it within a year. That is expected: a body is a hub of co-mention.
- **Warn band 250–1,000**: walk, but report the set size. This covers a large department, a mid-size fund, a heavily lobbied official, or 852 matters a year on the Council.
- The synthetic fixture's "5,000-employee employer" in draft B §(e) M-X1 matches the measured 5,119.

## 7. Captures and how the job should reproduce them

- Legistar: `https://webapi.legistar.com/v1/oakland/{bodies,persons,officerecords,events}` with `$top=1000&$skip=n`. The events filter is the OData `datetime'YYYY-MM-DD'` form. No key, no auth, HTTP 200. Sizes on 2026-10-05: bodies 84 KB, persons 357 KB, officerecords 821 KB (first page), events (3 years) about 600 KB.
- Socrata: `https://data.oaklandca.gov/resource/{id}.json` with SoQL `$select`/`$group`.
- The scratchpad copies are session-local and are not committed. The reader job should capture its own fixtures under its test tree, with personal contact fields stripped from `persons`/`officerecords` before commit (K1485).
