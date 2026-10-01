# Research: the first profile's calendar and offices (Oakland and Alameda County)

Research worker for BOB #86, tranche T20, 2026-10-01. Brief: `build/plan/draft-filing-templates.md` §2 and §5;
`build/requirements/jurisdictions.md` R24, R25, R33. Profile: `jurisdictions/profiles/oakland-alameda.mjs`.

**Offices the profile names** (read from the file, lines 199–225):

| kind | role / name | body | level |
| --- | --- | --- | --- |
| counterparty | Controller | City of Oakland Finance Department | city |
| counterparty | City Council | Oakland City Council | city |
| counterparty | Civil Grand Jury | Alameda County Civil Grand Jury | county |
| counterparty | City Auditor | Office of the City Auditor, City of Oakland | city |
| counterparty | State Controller | California State Controller's Office | state |
| venue (`records_request`) | the City's public records request portal (NextRequest) | `how: portal` | — |
| venue (`records_petition`) | Alameda County Superior Court | `how: court` | — |

**Instrument.** `curl` through the container's egress proxy (captured bytes hashed with `sha256sum`; captures and
their text extractions are in the scratchpad's `cap/` folder), and the harness's WebFetch tool where the host refused
`curl` (www.oaklandca.gov answers 403 to `curl`; WebFetch reached it). PDFs fetched by WebFetch were saved by the
harness and read with `pdftotext -layout` (poppler); their SHA-256 is of the saved bytes. Web searches were used only to
locate the primary pages. Retrieval date for everything: **2026-10-01**. The proposed entries below are numbered
`M-NEW-<n>`; BOB assigns real `M-<n>` numbers when filing.

---

## Proposed measurement entries

## M-NEW-1 · 2026-10-01 · T20 calendar research — THE TIME ZONE of Oakland and Alameda County is **`America/Los_Angeles`**

**Value.** `time_zone: "America/Los_Angeles"`.

**Source 1 (the jurisdiction's own law).** California Government Code § 6808, "California Code, GOV 6808.", published by
the California Legislature (leginfo), <https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=6808.>.
Retrieved 2026-10-01; capture sha256 `ee445a72608834b0362f780631eefc3aefb5bc105ed7356fc03d51b52f36acc6`.
Quoted: *"(a) The standard time within the state is that of the fifth zone designated by federal law as Pacific standard
time (15 U.S.C. Secs. 261 and 263). (b) The standard time within the state shall advance by one hour during the daylight
saving time period commencing at 2 a.m. on the second Sunday of March of each year and ending at 2 a.m. on the first
Sunday of November of each year."*

**Source 2 (the IANA name).** IANA Time Zone Database, release `2026e`, <https://data.iana.org/time-zones/tzdata-latest.tar.gz>,
published by IANA. Retrieved 2026-10-01; tarball sha256 `b26882805f26aac59d5b222978e6580484b834ccdc98be89df2f05a6dc53a652`.
Quoted, file `northamerica`: *"# US Pacific time, represented by Los Angeles"* / *"# California, northern Idaho (…),"*;
and file `zone1970.tab`: *"US	+340308-1181434	America/Los_Angeles	Pacific"*.

**What is NOT measured.** Nothing about any office's own clock; the zone is the state's statutory time applied to the
whole profile.

## M-NEW-2 · 2026-10-01 · T20 calendar research — ALAMEDA COUNTY's 2026 holidays: **12 closure dates**, Thanksgiving counted as two; **2027 NOT published**

**Value (2026, county offices).** 2026-01-01 New Year's Day; 2026-01-19 Martin Luther King Jr.'s Birthday (observed);
2026-02-12 Lincoln's Birthday; 2026-02-16 Washington's Birthday (observed); 2026-05-25 Memorial Day; 2026-06-19
Juneteenth; 2026-07-03 Independence Day; 2026-09-07 Labor Day; 2026-11-11 Veteran's Day; 2026-11-26 Thanksgiving;
2026-11-27 Thanksgiving (Friday); 2026-12-25 Christmas.

**Source.** "County Holidays | Alameda County", published by the County of Alameda,
<https://acgov.org/government/holidays.htm>. Retrieved 2026-10-01; capture sha256
`95d78c09114f2eb9972ed29511b143b9417136ae6d35efb46eb749cfa8ce9b10`.

**Quoted** (page text, the 2026 list whole): *"County offices will be closed on these days:"* … *"2026 / New Year's Day /
Thursday, January 1 / Martin Luther King Jr.'s Birthday / Observed, Monday, January 19 / Lincoln's Birthday / Thursday,
February 12 / Washington's Birthday / Observed, Monday, February 16 / Memorial Day / Observed, Monday, May 25 / Juneteenth /
Friday, June 19 / Independence Day / Friday, July 3 / Labor Day / Observed, Monday, September 7 / Veteran's Day /
Wednesday, November 11 / Thanksgiving / Observed, Thursday/Friday, November 26 & 27 / Christmas / Friday, December 25"*.

**Notes.** The page lists 2025 and 2026 only; **no 2027 list is published** there. A further item, *"New Year's Day 2022 /
Observed, Friday, December 31"*, sits inside an HTML comment in the 2026 list (`<!-- … -->`) and is not displayed; it is
not counted. The county list does NOT include March 31 or the fourth Friday in September (contrast M-NEW-3).
**Applies to:** county offices. Which profile office it governs is in "Facts not sourced" (the Civil Grand Jury).

## M-NEW-3 · 2026-10-01 · T20 calendar research — THE SUPERIOR COURT OF ALAMEDA COUNTY's 2026 holidays: **14 dates**; **2027 NOT published by the court**

**Value (2026, venue "Alameda County Superior Court").** 2026-01-01 New Year's Day; 2026-01-19 Martin Luther King Jr.'s
Birthday; 2026-02-12 Lincoln's Birthday; 2026-02-16 Washington's Birthday; 2026-03-31 "Pursuant to Code of Civil
Procedure Section 135"; 2026-05-25 Memorial Day; 2026-06-19 Juneteenth; 2026-07-03 Independence Day; 2026-09-07 Labor
Day; 2026-09-25 Native American Day; 2026-11-11 Veteran's Day; 2026-11-26 Thanksgiving Day; 2026-11-27 Day after
Thanksgiving; 2026-12-25 Christmas Day.

**Source.** "Holidays | Superior Court of California | County of Alameda", published by the Superior Court of California,
County of Alameda, <https://www.alameda.courts.ca.gov/general-information/holidays>. Retrieved 2026-10-01; capture sha256
`73cdd168b80bed09dffa3a350f8ebbd811a84b717c44106a9f333170bdccfcb2`.

**Quoted** (table whole): *"Superior Court Holiday Calendar / 2026 Holidays / Date / Holiday / Thursday, January 1, 2026 /
New Year's Day / Monday, January 19, 2026 / Martin Luther King Jr.'s Birthday / Thursday, February 12, 2026 / Lincoln's
Birthday / Monday, February 16, 2026 / Washington's Birthday / Tuesday, March 31, 2026 / Pursuant to Code of Civil
Procedure Section 135 / Monday, May 25, 2026 / Memorial Day / Friday, June 19, 2026 / Juneteenth / Friday, July 3, 2026 /
Independence Day / Monday, September 7, 2026 / Labor Day / Friday, September 25, 2026 / Native American Day / Wednesday,
November 11, 2026 / Veteran's Day / Thursday, November 26, 2026 / Thanksgiving Day / Friday, November 27, 2026 / Day after
Thanksgiving / Friday, December 25, 2026 / Christmas Day"*.

**Notes.** The court's page lists 2026 only. Other California superior courts' pages (San Bernardino, Riverside, etc.)
were seen in search results to list 2027 judicial holidays; they are other courts' publications, not this venue's, and
are **not** used: 2027 for this venue is not published by it and is not guessed.

## M-NEW-4 · 2026-10-01 · T20 calendar research — THE CITY OF OAKLAND's 2026 designated holidays: **13 dates** (one a Saturday, no weekday observance); **2027 NOT published**

**Value (2026, City of Oakland employees' designated holidays).** 2026-01-01 New Year's Day; 2026-01-19 Dr. Martin Luther
King, Jr. Day; 2026-02-16 President's Day; 2026-03-31 Cesar Chavez Day; 2026-05-25 Memorial Day; 2026-06-19 Juneteenth
National Independence Day; 2026-07-04 Independence Day (a Saturday); 2026-09-07 Labor Day; 2026-09-09 Admissions Day;
2026-11-11 Veterans Day; 2026-11-26 Thanksgiving Day; 2026-11-27 Day After Thanksgiving; 2026-12-25 Christmas Day.

**Source 1 (the dated list).** "City of Oakland Full-Time & Part-Time 2026 Employees Employee Benefits Guide" (PDF title
metadata; cover: "GUIDE EMPLOYEE BENEFITS JANUARY 1, 2026 - DECEMBER 31, 2026 CITY OF OAKLAND"), published by the City of
Oakland Human Resources Management Department,
<https://www.oaklandca.gov/files/assets/city/v/2/human-resources/documents/working-for-oakland/employee-benefits/benefit-documents/employee-benefity-guide-full-time-and-permanent-part-time.pdf>
(PDF ModDate 2026-06-01). Retrieved 2026-10-01; sha256 `ed9a0d088b597c4df9445e1e51871c8a5d32a4a6ce544ea20bc2f715ada56f04`.
Quoted, page 6 "2026 Holiday Schedule": *"New Year's Day January 01 Wednesday / Dr. Martin Luther King, Jr. Day January 19
Monday / President's Day February 16 Monday / Cesar Chavez Day March 31 Tuesday / Memorial Day May 25 Monday / Juneteenth
National Independence Day June 19 Friday / Independence Day July 04 Saturday / Labor Day September 07 Monday / Admissions
Day September 09 Wednesday / Veterans Day November 11 Wednesday / Thanksgiving Day November 26 Thursday / Day After
Thanksgiving November 27 Friday / Christmas Day December 25 Friday"*; and *"If a designated holiday falls upon a normal day
off which is either a Saturday; as to an employee who works a Monday through Friday workweek, … shall thereafter receive one
(1) additional day of vacation."*

**Source 2 (the rule, two labour agreements).** "Memorandum of Understanding between City of Oakland and IFPTE Local 21,
July 1, 2025 – June 30, 2026", Article 11, published by the City of Oakland,
<https://www.oaklandca.gov/files/assets/city/v/3/human-resources/documents/working-for-oakland/unions/union-contracts/ifpte-local-21-mou-2025-2026-final.pdf>,
sha256 `c782d5848329069e12c2265856890ddafe54935e90a93141653bc052e485cef8`; and "Memorandum of Understanding – City of
Oakland and SEIU, Local 1021, July 1, 2025 to June 30, 2026", Article 11 "Paid Holidays (Applies to SB1, SC1, and SD1
only)", <https://www.oaklandca.gov/files/assets/city/v/3/human-resources/documents/working-for-oakland/unions/seiu/seiu-mou-2025-2026-final-202603.pdf>,
sha256 `93d09cb8419ed6117ecb58a8e8967a5cc976877207114c0da26ab81c9babf96e`. Both retrieved 2026-10-01. Quoted (Local 21,
§11.1; SEIU's list is the same thirteen days in the same words but for "March 31st "Cesar Chavez Day"" and "June 19th,
known as "Juneteenth""): *"The following days of each year are designated holidays: 11.1.1 January 1st. 11.1.2 The third
Monday in January, known as "Martin Luther King Day." 11.1.3 The third Monday in February, known as "Presidents' Day."
11.1.4 March 31st, known as "Cesar Chavez Day." 11.1.5 The last Monday in May known as "Memorial Day." 11.1.6 June 19th,
known as "Juneteenth National Independence Day." 11.1.7 July 4th. 11.1.8 The first Monday in September, known as "Labor
Day." 11.1.9 September 9th, known as "Admission Day." 11.1.10 November 11th, known as "Veterans' Day." 11.1.11 The
Thursday in November appointed as "Thanksgiving Day." 11.1.12 The Friday after "Thanksgiving Day." 11.1.13 December
25th."*

**Caveats (must travel with the fact).**
1. **These are the employees' designated (paid) holidays, not a published list of "office closed" days.** No page of the
   City found says in so many words that its offices close on them; www.oaklandca.gov's City Hall, Contact Us, City Clerk
   and City Council pages state no holiday closures (WebFetch, 2026-10-01). Reading them as closure days is an inference
   BOB should rule on.
2. **Independence Day falls on Saturday 2026-07-04 and the City designates no weekday in its place** (an employee instead
   receives a vacation day, per the quoted rule). So Friday 2026-07-03 is NOT a City holiday, whereas it is for the county
   (M-NEW-2), the court (M-NEW-3) — and is not for the state (M-NEW-5).
3. **Page 5 of the same guide qualifies two dates:** its calendar reads *"9 Admissions Day (HVA)*"* and *"11 Veteran's Day
   (HVA)*"* with the footnote *"*If applicable"*; "HVA" is not defined anywhere in the guide's text. Page 6 and both MOUs
   list the two days without qualification. This is one publisher's internal ambiguity, not two conflicting sources;
   it is flagged so BOB can decide whether 2026-09-09 and 2026-11-11 stand.
4. The guide misprints the weekday of New Year's Day (*"January 01 Wednesday"*; 2026-01-01 is a Thursday). The date is
   unaffected.
5. Both MOUs expired 2026-06-30; no successor agreement was located. **No City of Oakland 2027 holiday list was found;
   2027 is NOT published** and is not computed from the MOU rule.
6. **Christmas Eve / New Year's Eve.** The MOUs give some employees partial paid time off on December 24, 26, 31 or
   January 2 *"granted by the department head, subject to the need to provide public services"*; these are not designated
   holidays and are not listed.

**Context, not used for the profile's offices.** The Oakland Public Library (a City department, not a profile office)
publishes "Holiday Closures | Oakland Public Library", <https://oaklandlibrary.org/holiday-closures/> (sha256
`ca1464c3fe9c9ef6eccd2701761b17a860d82a055e2c9beb71a7cf1bfcb1377b`), whose 2026 list is the thirteen days above plus
*"Christmas Eve - Thursday, December 24"* and *"New Year's Eve - Thursday, December 31st *All Oakland Public Library
Branches will be closed at 5:30 pm"*, and whose 2027 list so far reads only *"New Year's Day - Friday, January 1"*. It
confirms that a City department closes on Admission Day and Veterans Day in 2026; it says nothing of the Finance
Department, the Council or the Auditor.

## M-NEW-5 · 2026-10-01 · T20 calendar research — THE STATE OF CALIFORNIA's 2026 holidays (state employees): **11 dates**, one a Saturday; **2027 NOT published**

**Value (2026, state offices, for the State Controller's Office).** 2026-01-01 New Year's Day; 2026-01-19 Martin Luther
King Jr. Day; 2026-02-16 Presidents' Day; 2026-03-31 Cesar Chavez Day; 2026-05-25 Memorial Day; 2026-07-04 Independence
Day (Saturday); 2026-09-07 Labor Day; 2026-11-11 Veteran's Day; 2026-11-26 Thanksgiving Day; 2026-11-27 Day after
Thanksgiving; 2026-12-25 Christmas Day.

**Source 1.** "State Holidays - CalHR Website", published by the California Department of Human Resources (CalHR),
<https://www.calhr.ca.gov/about-calhr/divisions-programs/personnel-management/leave-benefits/state-holidays/>. Retrieved
2026-10-01; capture sha256 `6ef7b4250ed56a82d6ab02502a9f49285b840470dd50bff18ea6aea754104b8b`. Quoted: *"2026 Holiday
Dates / Thursday, January 1 / Monday, January 19 / Monday, February 16 / Tuesday, March 31 / Monday, May 25 / Saturday,
July 4* / Monday, September 7 / Wednesday, November 11** / Thursday, November 26 / Friday, November 27 / Friday, December
25 / *When a holiday falls on a Saturday, employees shall receive holiday credit. When a holiday falls on a Sunday, the
holiday is observed on the following Monday. **When November 11 falls upon a Saturday, the preceding Friday is
observed."*

**Source 2 (names for the dates).** "2026-Holidays-and-Paydays.hol", CalHR,
<https://www.calhr.ca.gov/wp-content/uploads/sites/361/2025/12/2026-Holidays-and-Paydays.hol>, sha256
`d029eda36193f97cf70502f31567711bea4396ec9dc4fc2f16ae17a667378a41`. Quoted: *"[California State Holidays 2026] 11 /
New Year's Day, 2026/01/01 / Martin Luther King Jr. Day, 2026/01/19 / Presidents' Day, 2026/02/16 / Cesar Chavez Day
(Observed), 2026/03/31 / Memorial Day, 2026/05/25 / Independence Day, 2026/07/04 / Labor Day, 2026/09/07 / Veteran's
Day, 2026/11/11 / Thanksgiving Day, 2026/11/26 / Day after Thanksgiving, 2026/11/27 / Christmas Day, 2026/12/25"*.

**Notes.** Juneteenth (June 19) and Native American Day are, on the same page, days a state employee *may elect* in place of
a personal holiday (*"Government Code section 19853 allows most state employees the option to elect to receive eight
hours of holiday credit in lieu of … personal holiday … for the following holidays: … June 19th, known as "Juneteenth".
The fourth Friday in September, known as "Native American Day"."*), not state holidays, so they are not listed. A
secondary site seen in search results gave Friday 2026-07-03 as an observed state holiday; CalHR's own page contradicts
it (Saturday → holiday credit, no observed Friday), and the secondary site is not a source. CalHR's list is the State's
as employer; it is the best primary source for a state office's closures, but it is not a page of the State Controller's
Office itself (whose site refused this instrument; see "Facts not sourced"). The page shows **no 2027 list**, and the file
`2027-Holidays-and-Paydays.hol` does not exist at the 2026/08–2026/12 upload paths (404), so **2027 is NOT published**.

## M-NEW-6 · 2026-10-01 · T20 calendar research — THE OFFICE OF THE CITY AUDITOR's hours: **Monday to Friday, 8:30 am to 5:00 pm**

**Source.** "Contact - Oakland Auditor", published by the Office of the City Auditor, City of Oakland,
<https://www.oaklandauditor.com/contact/>. Retrieved 2026-10-01; capture sha256
`e71f9d60c03c15381d15617e9895a714922ea3d8670998e8190ef41180035f60`. Quoted: *"Address / 1 Frank H. Ogawa Plaza / 4th
Floor / Oakland, CA 94612 / Phone / Phone: (510) 238-3378 / Fax: (510) 238-7640 / TDD: (510) 839-6451 / Hours / Monday
through Friday / 8:30 am to 5:00 pm"*.

**Value.** `hours: {weekly: [Mon–Fri 08:30–17:00]}`; no closed note on the page.

## M-NEW-7 · 2026-10-01 · T20 calendar research — THE SUPERIOR COURT's civil clerk's office (René C. Davidson Courthouse): **in person Mon–Thu 8:30–15:00, Fri 8:30–14:00; drop box Mon–Thu 15:00–16:00, Fri 14:00–16:00**

**Source 1.** "Oakland - René C. Davidson Courthouse | Superior Court of California | County of Alameda", published by the
Superior Court of California, County of Alameda, <https://www.alameda.courts.ca.gov/location/oakland-rene-c-davidson-courthouse>.
Retrieved 2026-10-01; capture sha256 `c5763e1a4f373eecf366af74ba48a5c8af5cb1c81495819740282c914e3d3204`. Quoted:
*"Oakland - René C. Davidson Courthouse / 1225 Fallon Street Oakland, CA 94612 / 510-891-6000 / Building Information /
Building hours: Monday - Friday: / 8:30am - 4:30pm / … Civil / Service Hours: / In Person: / Monday - Thursday 8:30
a.m.-3:00 p.m. / In Person: / Friday 8:30 a.m.-2:00 p.m. / Phone: / Monday - Friday 8:30 a.m.-3:00 p.m. / Dropbox: /
Monday - Thursday 3:00 p.m.-4:00 p.m. / Dropbox: / Friday 2:00 p.m.-4:00 p.m."*

**Source 2 (why this clerk's office).** "Civil | Superior Court of California | County of Alameda",
<https://www.alameda.courts.ca.gov/divisions/civil>, sha256 `c2b301531ec7c52cb5bb99b1a53cf7318a29ab48d4fe111cdba2f00870fb489f`:
*"Writ matters are assigned to Departments 24, 25 and 303"*; and "Oakland - Administration Building | …",
<https://www.alameda.courts.ca.gov/location/oakland-administration-building>, sha256
`4fb397c7d6b25afaf65b0d89d697505cc417e7956fda3e07c5c180f1a03dfc0c`: *"Departments: 14-25 / The clerk's office for cases
heard in these departments is in the Rene C. Davidson Courthouse."* The civil page lists four civil court locations
(*"Alameda / Hayward / Oakland - Admin. Building / Oakland - René C. Davidson"*); Hayward's civil hours read the same as
René C. Davidson's (capture sha256 `a3d8e068a3bfd92111ac34f738b65cabc7d82faf10cdf909744ba02596d7b5a1`).

**Source 3 (electronic filing).** "Civil e-Filing | Superior Court of California | County of Alameda",
<https://www.alameda.courts.ca.gov/online-services/e-filing/civil-e-filing>, sha256
`34253beab132da44798c0ced743da013221615b8310a1c322ef4dc54e33a8c2d`: *"NOTE: Civil e-filing is not available after
Midnight on the 4th Friday of each month due to system maintenance. Availability of the system will resume by 12:00 pm on
Saturday."* (The page's other hours or a "deemed filed" cut-off were not found in the capture; not stated.)

**Value.** On the venue: `hours: {weekly: [Mon–Thu 08:30–15:00, Fri 08:30–14:00], closed_note: "Civil clerk's office,
René C. Davidson Courthouse, 1225 Fallon Street, in person; drop box Mon–Thu 15:00–16:00, Fri 14:00–16:00; civil e-filing
unavailable from midnight on the 4th Friday of each month until 12:00 pm Saturday"}`. The profile names the venue only as
"Alameda County Superior Court"; that a records petition goes to this clerk's office rests on the writ-department
assignment quoted, which BOB may prefer to state in the venue's name.

## M-NEW-8 · 2026-10-01 · T20 calendar research — THE CIVIL GRAND JURY's office: address and contact published, **no hours published**

**Source.** "Grand Jury |" (home) and "Submit Complaint | Grand Jury", published by the Alameda County Civil Grand Jury
(County of Alameda domain), <https://grandjury.acgov.org/> (sha256 `00e7e0db67429151e74a72c0825f84ffb8c9ea6d87f7f9e0dcc50faded0a9f42`)
and <https://grandjury.acgov.org/submit-complaint/>. Retrieved 2026-10-01. Quoted: *"ALAMEDA COUNTY GRAND JURY / 1401
Lakeside Drive, Suite 1104 / Oakland, CA • 94612 / +01 (510) 272-6259 / grand.jury@acgov.org"*; *"All complaints are
received directly at the offices of the Grand Jury."*; *"If you wish to file an anonymous complaint, please use the paper
form and mail or fax it to the Grand Jury."* The court's page (<https://www.alameda.courts.ca.gov/general-information/jury-service/civil-grand-jury>,
sha256 `5aa3e921c237308e1543fe0f1f576790ade572979434497428e881ca1cea114b`): *"The Civil Grand Jury is convened by the
court"*; *"The jury typically meets on Wednesdays and Thursdays"* (jurors' meeting days, not office hours).

**Value.** Hours: **undetermined (not published)**. Recorded as a negative finding so the profile does not later infer one.

## M-NEW-9 · 2026-10-01 · T20 calendar research — THE CITY OF OAKLAND FINANCE DEPARTMENT, Controller's Bureau: **phone only, no hours published**

**Source.** "Contact the Finance Department", published by the City of Oakland,
<https://www.oaklandca.gov/Government/Finance-Budget/Contact-the-Finance-Department>. Retrieved 2026-10-01 by WebFetch
(the host refuses `curl` with 403, so no byte capture or hash). Quoted: *"Finance Department Administration / Phone:
510-238-2220 / TTY: 510-238-3254 / Controller's Bureau / Phone: 510-238-3280 / Treasury Bureau / Phone: 510-238-3201"*.
The same page gives hours for other Finance units only, e.g. Local Tax Customer Service *"Hours: Mon, Tues, Thurs, Fri:
8 am - 4 pm; Wed: 9:30 am - 4 pm"* (250 Frank H Ogawa Plaza, Suite 1320) and Citywide Collections, Liens, Audit, SPARE
*"Hours: Mon to Fri: 8 am - 12 pm & 1 pm - 4 pm"* (150 Frank H Ogawa Plaza, Suite 5342).

**Value.** Controller's hours: **undetermined (not published)**. The other units' hours are not the profile's Controller
and are not proposed for it.

## M-NEW-10 · 2026-10-01 · T20 calendar research — THE OAKLAND CITY COUNCIL: **no office hours published**

**Source.** "City Council & Leadership", published by the City of Oakland,
<https://www.oaklandca.gov/departments/oakland-city-council>, and "City Hall",
<https://www.oaklandca.gov/Government/City-Council-Leadership/City-Hall>. Retrieved 2026-10-01 by WebFetch (no byte
capture: 403 to `curl`). The Council page gives each member's phone and e-mail and *"1 Frank H. Ogawa Plaza, Oakland, CA
94612"*; neither page states hours. The City Clerk's page (<https://www.oaklandca.gov/departments/city-clerk>) states
*"Monday - Friday 8:30 AM - 5:00 PM"*, but those are the Clerk's hours, a different office the profile does not name;
they are **not** proposed for the Council.

**Value.** Council hours: **undetermined (not published)**.

---

## Summary: proposed profile values (status `researched`, each unconfirmed until a member confirms)

| fact | proposed value | basis | notes |
| --- | --- | --- | --- |
| `time_zone` | `America/Los_Angeles` | M-NEW-1 | |
| `holidays` 2026, Alameda County offices (no profile office assigned yet) | 01-01, 01-19, 02-12, 02-16, 05-25, 06-19, 07-03, 09-07, 11-11, 11-26, 11-27, 12-25 | M-NEW-2 | the county's list; whether it governs the Grand Jury is undetermined (below) |
| `holidays` 2026, venue Alameda County Superior Court | 01-01, 01-19, 02-12, 02-16, 03-31, 05-25, 06-19, 07-03, 09-07, 09-25, 11-11, 11-26, 11-27, 12-25 | M-NEW-3 | R33 today keys holidays by office role; the venue needs `holidays.offices` to admit a venue name, or a ruling |
| `holidays` 2026, `offices: ["Controller", "City Council", "City Auditor"]` | 01-01, 01-19, 02-16, 03-31, 05-25, 06-19, 07-04 (Sat), 09-07, 09-09, 11-11, 11-26, 11-27, 12-25 | M-NEW-4 | employees' designated holidays read as closure days (caveat 1); 09-09 and 11-11 carry "(HVA)* If applicable" on one page (caveat 3); no weekday for 07-04 |
| `holidays` 2026, `offices: ["State Controller"]` | 01-01, 01-19, 02-16, 03-31, 05-25, 07-04 (Sat), 09-07, 11-11, 11-26, 11-27, 12-25 | M-NEW-5 | CalHR's state list, not the SCO's own page |
| `holidays` 2027, every office | **not listed** | M-NEW-2–5 | no 2027 schedule published by the county, the court, the City or CalHR on 2026-10-01 (R33: a year is listed only when complete) |
| City Auditor `hours` | Mon–Fri 08:30–17:00 | M-NEW-6 | |
| Superior Court venue `hours` | Mon–Thu 08:30–15:00, Fri 08:30–14:00; closed_note as M-NEW-7 | M-NEW-7 | civil clerk's office, René C. Davidson Courthouse |
| Civil Grand Jury `hours` | not published | M-NEW-8 | |
| Controller `hours` | not published | M-NEW-9 | |
| City Council `hours` | not published | M-NEW-10 | |
| State Controller `hours` | not sourced | — | see below |
| NextRequest portal venue `hours` | none researched | — | an online portal; no hours sought or stated |

## Facts that could not be sourced (left undetermined; nothing guessed)

1. **2027 holidays for every office.** Not published by the County of Alameda (holidays page lists 2025–2026), the Superior
   Court (2026 only), the City of Oakland (2026 guide; MOUs expired 2026-06-30; no successor found), or CalHR (2026 only;
   no 2027 file). Other courts' 2027 lists exist but are not this venue's.
2. **State Controller's Office hours, and the SCO's own holiday statement.** www.sco.ca.gov and sco.ca.gov answered 403
   to both `curl` and WebFetch on every page tried (`contact_us.html`, `eo_about_records.html`,
   `sco_ServiceCourtFilings.html`, `Files-EO/SCO_public_records.pdf`). A third-party directory (211 LA) shown in search
   results gives Mon–Fri 8–5 at 300 Capitol Mall; it is secondary and not recorded. A member or a later instrument with
   access should read the SCO's own page.
3. **City Council hours** — not published on the City's Council or City Hall pages (M-NEW-10).
4. **Controller's Bureau (Finance Department) hours** — not published (M-NEW-9).
5. **Civil Grand Jury hours** — not published (M-NEW-8).
6. **Which holiday list governs the Civil Grand Jury.** It is convened by the court (M-NEW-8) but its site is on the
   county's domain and its office is at a county building; neither the county, the court nor the jury publishes the jury
   office's closure days. County (M-NEW-2) and court (M-NEW-3) lists differ by 2026-03-31 and 2026-09-25. Undetermined.
7. **Whether City of Oakland offices actually close on the City's designated holidays**, and whether 2026-09-09 and
   2026-11-11 apply to the Finance Department, the Council and the Auditor (the guide's undefined "(HVA)* If
   applicable"). No City page found states office closures. A member's call to the City Clerk (510-238-3226) or the
   Auditor would settle it.
8. **Civil e-filing's "deemed filed" cut-off time** at the Superior Court — not found on the captured e-filing page.

## Rulings BOB may need (surfaced, not decided)

- R33's `holidays` and the plan's `offices` field name counterparty **roles**; the court is a **venue** (R25), so its own
  list (M-NEW-3) needs either `offices` to admit a venue name or a separate venue holiday list.
- Whether an employer's designated-holiday list (City MOUs, CalHR) counts as an office's closure list for R33.
- Whether to state the venue more precisely as the civil clerk's office at the René C. Davidson Courthouse.
