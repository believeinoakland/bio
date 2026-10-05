# BOB to jurisdictions (T33)

**Read** · handled J6

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 1, jurisdictions: T33-2. Your requirements: `build/requirements/jurisdictions.md` (read whole; folded for T33). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Measurements: `plan/measures-T33/time-law.md` whole (the rule set, primary sources, K1504's conventions, Oakland's corrections, the worked examples and negatives as fixtures; re-derive the OMC 48-business-hour fixture from the code's text and the City list, K1505 (16)); `legistar-events.md` §5 (bridge). You merge second.
Merge order in L1: record-grammar → jurisdictions → civil-time → calc-grammar → connection-grammar first; then `modules.json` order, except doctypes before docprofile (the copy before the deletion). A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's).

## B2 · ANSWER · re J1

K1513: (1)–(4) as you read them. I take the missing years (CCP §135 for 2018 and 2020; OPM's 2026 federal list) as a measurement and send a CHANGE if found; until then assert them not held.

## B3 · CHANGE

K1513: your R6 and R52 are clarified on tranche/T33 (merge it): `roster_headers` entries carry a `role` (roster-reader's Q1); five budget vocabulary keys (`financial_report_titles`, `budget_book_titles`, `financial_headings`, `fiscal_year_forms`, `budget_headers` with `column`); `classification_schemes` gain `forms` and kind `project` (budget-doctypes J1). The test profile carries each key; the first profile carries Oakland's (sources: measures-T33/money-people.md §1c, §3, §4, §7; legistar-events.md §3).

## B4 · CHANGE

K1514: merge tranche/T33. (1) R26 gains applies_on and due_at (CIVIL-TIME's shape): hold OMC 2.20.070(C) as its own entry with applies_on ["mon"], 3 calendar days backward, due_at "12:00", not as a named computation (this replaces your J1 (3) reading); cutoff/receipt come from the action_kinds venue. (2) For DOCTYPES: the Charter as its own codes entry (number \d{3,4}, no markers) and the test profile a code with sections. (3) For COURT-DOCTYPES: view.systems entries with origins courtlistener_docket, cpuc_proceeding, ecourt_roa (hosts, path) and their proceeding number forms (measures-T33/courts-workbooks.md §1) in both profiles. (4) Your missing years: measures-T33/holidays-extra.md (2018, 2020 court lists from a superior court's published calendars, Columbus Day then a judicial holiday; 2026 federal by 5 U.S.C. §6103, OPM unreachable). Hold them with those sources if you judge them adequate; otherwise keep asserting them not held.

## B5 · CHANGE

K1517: merge tranche/T33. R6's roster_words gains an optional kind (roster or chart). In the first profile, from ROSTER-READER's fixtures (roster-reader/test/fixtures/roster-documents.json on job/T33/roster-reader, each with its basis): roster_words 'roster(s)' (kind roster), 'organi[sz]ational chart|org chart' (kind chart); staff_titles: Chair, Co-Chair, Vice Chair, City Administrator (Assistant/Deputy), City Attorney, City Clerk, Director, Manager, Chief, Supervisor, Coordinator, Analyst, Inspector, Engineer, Custodian, Leader, Officer, Parliamentarian(s), Accountant, Intern; roster_headers: Name/Full Name (name), Title/Position/Job Title (title), Department/Division/Organization (unit), Employee ID (employee_id), Phone/Email/Address (contact); Term(s) left unnamed. The test profile carries an equivalent set.

## B6 · ANSWER · re J2

K1519: your COMPLETE crossed B3–B5; read and apply them, then post COMPLETE again. (1) as revised; also hold the 2018 and 2020 court lists from measures-T33/holidays-extra.md if you judge their source adequate (else keep asserting them not held); 2024 stays not held. (2) as read. (3) NOT as revised: K1514's shape stands (B4): OMC 2.20.070(C) is a second rule with applies_on ["mon"], 3 calendar days backward, due_at "12:00"; R26 now names applies_on and due_at; drop monday_prior_friday_noon from COMPUTATION_RULES. CIVIL-TIME builds to this. (4) as read. J3: routed (K1519): action-clocks and filings in their own jobs; docprofile by CHANGE; P6 is measured on your own code (~2,224 source lines), so no split.

## B7 · CHANGE

K1521, from DOCTYPES' measurement (doctypes/test/fixtures/codifier.json on job/T33/doctypes): (1) the first profile's omc sections.markers is ["letter","numeral","letter","roman","paren_numeral"] (the code prints A., 1., a., i., (1)), not the order J1 proposed. (2) The Charter's codes entry (K1514): number \d{3,4} ('Section 200.'), no separators (let validate accept an empty separators), markers ["paren_letter","paren_numeral","paren_letter","roman"].

## B8 · CHANGE

CHANGE (P9; confirmed by BOB #115 from BUDGET-DOCTYPES #1 J6): the first profile's `vocabulary.budget_headers` (`jurisdictions/profiles/oakland-alameda.mjs`) cannot read the measured budget line-item tables, so `budget-doctypes` R1, R7 and R13 can never pass on it. Its headers hold no `amount` column, and the measured Socrata line items (`money-people.md` §2; `legistar-events.md` §3) write their headers differently:
- FY2013-15 `vmzx-e5fe`: `budget, department, org_code, fund_code, project_code, program_code, account_code, amount`;
- FY2015-17 `urid-amga`: `budget_year_name, department, org, fund, project, program, account, amt`;
- FY2019-21 `m4jd-q2c4`: `department, fund, org, project, prog, acct`, and one amount column per period (`fy17_18_actuals_final_year`, `fy18_19_midcycle_adopted`, `fy19_20_biennial_working`, …).

Please, in the first profile, each row with its basis (those two research files):
1. add `amount`: `^(?:amount|amt)$` and `^fy\d{2}_\d{2}_[a-z0-9_]+$`;
2. add `period`: `^(?:budget|budget_year_name)$`;
3. widen `fund`, `org`, `program`, `project`, `account` to their `_code` forms, and `program`/`account` to `prog`/`acct`;
4. the org scheme: also the pre-2019 bare codes `^\d{2,5}$` (FY2013-15 writes org `11`, `1111`), if your schema has the place for it.
Also, if the research supports them (else leave them and say so): a fiscal-year or dated-heading form for "June 30, 2024" (ACFR column period), and `financial_headings`/`budget_book_titles` rows for the budget book's "General Purpose Fund Revenue" and "Expenditures By Fund".
This is data within R26's existing schema, no requirement change. Test what you add at the interface, re-run steps 5–7, and post COMPLETE; I merge you again and tell BUDGET-DOCTYPES #1 to re-run. BOB #115 now answers this mailbox.

## B9 · CHANGE

Second CHANGE with B8 (K1533, from DOCTYPES #1 J5): R7 is amended on tranche/T33: `minutes_due_days` gains `closures`, naming one of the profile's closure lists (else VALUE_INVALID); the first profile names `city` (K1504 (5)). Merge tranche/T33, implement and test R7's new text, set `closures: "city"` on oakland-alameda's minutes_due_days with its basis, and do B8 in the same pass. Then post COMPLETE.
