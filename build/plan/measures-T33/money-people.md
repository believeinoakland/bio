# T33 desk measures: MONEY and PEOPLE (M-M0a, M-M0b, M-M0c, M-M2, M-M3, M-M1 fixture, M-P1, M-P3, M-55)

Desk research for BOB #114, done 2026-10-05 on branch `tranche/T32`. It feeds `build/plan/draft-T33-entries-B.md` §(e) (MONEY stage 0 and the M-items) and `build/plan/draft-T33-entries-C.md` §(d) (PEOPLE), against the ladders in `docs/architecture/BIO_Capability_Ladders_v0_1.md` §5A and §5C. Every source was fetched on 2026-10-05 unless a date is given. No credential was used. Transparent California CSV downloads need a login, so they were not used: M-P1 was read from its public, robots-permitted agency pages instead.

| # | Measure | Verdict | Consequence in one line |
|---|---|---|---|
| 1a | M-M0a OpenGov export and basis | **PARTIAL** | The basis is stated: budgets are GAAP, modified accrual, for General, Special Revenue, Enterprise, Internal Service and Capital Project funds. The OpenGov portal is a JavaScript app with no export that can be reached without a browser. The machine-readable line-item budgets on Socrata stop at FY2019-21. The money job reads the Socrata CSVs and ACFR/budget PDFs. An OpenGov export is a later entry, after someone exports one CSV by hand to fix its columns. |
| 1b | M-M0b vendor-payment ledger | **NO-GO** | Oakland publishes no checkbook or payment ledger. The only payment-level table is one 166-row public-records release from 2007-08. `reconcile` and `committedAgainstPaid` have no public Oakland payments side, so they ship on fixtures and are marked "needs a payments source". |
| 1c | M-M0c ACFR text layer | **GO** | All 14 ACFRs, FY2012 to FY2025, have a full text layer (86 to 94% of pages hold over 200 characters; the rest are blank, divider, cover, certificate or organization-chart pages). No OCR is needed for ACFRs. |
| 2 | M-M2 money-table census | **GO** | See §2: 10 budget line-item tables (4,487 to 66,354 rows), 14 campaign tables (up to 100,032 rows), lobbyist and behested-payment tables, 15 payroll years (4,949 to 6,158 rows a year), and 65 to 91 "(in thousands)" tables in each ACFR. There is no contract register. |
| 3 | M-M3 award-to-payment keys | **NO-GO (public)** | Budgets carry the chart-of-accounts keys (fund, org, project, program, account). No public table carries a contract number or vendor id alongside a payment. The join can be built only on records obtained through a public-records request. |
| 4 | M-M1 fixture | **GO (assembled)** | §4 holds 200 figures from 2 ACFRs and 1 budget book: 53 negatives, 13 percentages, 9 FTE counts, 151 figures "in thousands", 2 minus-sign negatives, a printed `$0`, and percentages in parentheses that are not negatives. |
| 5 | M-P1 payroll people and turnover | **GO** | The ten years 2015 to 2024 hold 10,850 distinct people, with about 4,700 to 5,400 a year and 10 to 16% leaving each year (about 1,300 joins plus leaves a year). PEOPLE is sized at about 11k people a decade per city. The CSV source needs a login, so the import source is a ruling. |
| 6 | M-P3 Form 700 | **PARTIAL** | The NetFile public API returns a JSON index of 18,933 Oakland statements (2010 to 2026) with no login: about 900 to 1,200 annual filers a year and 3,790 distinct filers. The statements themselves are PDFs. Filled-in values extract as text, but the form's own labels use a shifted font encoding. Entering 2b rows by hand from cited extents remains the T33 path. |
| 7 | M-55 table extraction | **GO for ACFRs, PARTIAL for budget books** | ACFR tables extract with consistent columns (median 94% of rows at the modal column count across 10 tables). Budget-book tables are mixed: OpenGov page renders are clean, but some summary tables are images, and chart labels interleave with tables. An ACFR reader can move; a budget-book reader needs an image fallback and a chart-skip rule. |

---

## 1. M-M0: the basis, the payments ledger, the ACFR text layer

### 1a. M-M0a: OpenGov export format and basis statement: PARTIAL

**Sources**
- OpenGov budget book "C-2 Budget Guide & Background, Adopted FY23-25", https://stories.opengov.com/oaklandca/published/yyE4hSYfk3. It links the Transparency Portal at https://oaklandca.opengov.com/transparency/ (#/72215, an expenses view).
- FY2023-25 Adopted Policy Budget (PDF, 653 pages, 41.5 MB), https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/fiscal-years/2023-2025-budget/fy23-25-adopted-budget-book-final-reduced-size.pdf, PDF page 81 "BASIS OF BUDGETING".
- ACFR FY2024, PDF page 168 (Notes to RSI), "Budgetary Basis of Accounting".
- Socrata catalog API, `https://api.us.socrata.com/api/catalog/v1?domains=data.oaklandca.gov` (739 assets).

**Basis, quoted.** From the budget book, page 81:

> "The City of Oakland's basis of budgeting for its major fund groups (General Funds, Special Revenue Funds, Enterprise Funds, Internal Service Funds and Capital Project Funds) are the Generally Accepted Accounting Principles (GAAP), and the modified accrual basis of accounting. … The exceptions are debt service, compensated absences, and claims and judgments, which are budgeted as expenditures according to when the payments are due. The City's basis of budgeting is the same as the basis of accounting used in the City's audited financial statements."

From ACFR FY2024, page 168:

> "The City adopts budgets each fiscal year on a basis of accounting which is substantially the same as … (GAAP) except for certain investment earnings."

The same note says that the Federal/State Grant Fund, the Low and Moderate Income Housing Asset Fund and the Municipal Capital Improvement Fund are budgeted on a multi-year basis. These three funds are excluded from the budget-to-actual schedules. Budget-to-actual is also not presented for proprietary or fiduciary funds.

**Export format.**
- `oaklandca.opengov.com/transparency` is a single-page JavaScript app. A direct GET of a view path returns 404 or the app shell, with no data. The CSV download is a button in the browser; its columns were **not verified**.
- The machine-readable route that does work is Socrata. Each budget release is a flat CSV/JSON table keyed by the Oracle chart of accounts (fund, org, project, program, account; see §2). The newest are FY2019-21 Adopted (`m4jd-q2c4`, 46,859 rows) and FY2019-21 Proposed (`aeya-c8st`, 46,492 rows). Both carry an actuals column, `fy17_18_actuals_final`. No FY2021-23 or later line-item table is on Socrata.
- One format trap: `urid-amga` (FY2015-17) stores amounts as text with a leading `* ` and thousands commas, for example `"* 5,632,522"`.

**Plan consequence.** The basis question is closed: budget and ACFR are the same basis (modified accrual), except the three multi-year funds and investment earnings. The money job records `basis = modified-accrual (budgetary ≈ GAAP)` per document. Stage 0's import is the Socrata tables plus the PDFs. An OpenGov-export importer stays out of T33 until one CSV is exported by hand from a browser to fix its columns. That is a two-minute task for any member, and it needs neither Bob nor a decision.

### 1b. M-M0b: vendor-payment ledger: NO-GO

- The Socrata catalog has no "checkbook", "vendor payment", "general ledger", "payroll" or "procurement" dataset (searches of 2026-10-05). The only payment-level table is `pydt-5ccu`, "Progressive Solutions Payments Public Records Request # 9643": 166 rows from 2007-08, with columns supplier, supplier_num, invoice_date, invoice_amount, gl_date, description, terms and payment_method.
- The OpenGov finance story (https://stories.opengov.com/oaklandca/published/k8knapdzqfn) links only the budget and actuals Transparency view.
- Vendors see their own payment status in iSupplier, which needs a login.
- San Francisco, by contrast, publishes vouchers (data.sf.gov `n9pm-xkyq`). It could serve as a non-Oakland test source.

**Plan consequence.** `reconcile` and `committedAgainstPaid` cannot be measured on public Oakland data. Build them on fixtures, plus optionally SF vouchers, and mark the Oakland payments side "awaits a records request". A NextRequest public-records request (https://oaklandca.nextrequest.com/) for an iSupplier/Oracle AP extract is the route. Whether to file one is Bob's call only if it would be made in the group's name.

### 1c. M-M0c: ACFR text layer, FY2012 to FY2025: GO

The listing page https://www.oaklandca.gov/Government/Finance-Budget/Financial-Reporting/Annual-Comprehensive-Financial-Reports blocks curl through Akamai, but WebFetch reads it. The PDFs download directly. Each was run through `pdftotext -layout`.

| FY | file | pages | pages >200 chars | producer |
|---|---|---|---|---|
| 2012 | 2012-comprehensive-annual-financial-report-pdf.pdf | 219 | 205 | Acrobat Distiller 8 |
| 2013 | 2013-comprehensive-annual-financial-report-pdf.pdf | 153 | 142 | Distiller 11 |
| 2014 | 2014-comprehensive-annual-financial-report-pdf.pdf | 197 | 183 | Distiller 11 |
| 2015 | 2015-comprehensive-annual-financial-report-pdf.pdf | 215 | 188 | Distiller 11 |
| 2016 | 2016-comprehensive-annual-financial-report-pdf.pdf | 217 | 187 | Distiller 11 |
| 2017 | cafr-2017.pdf | 204 | 186 | Distiller 11 |
| 2018 | cafr-2018.pdf | 206 | 184 | Distiller 11 |
| 2019 | city-of-oakland-cafr-ye-6.30.2019-final-12.13.2019.pdf | 199 | 182 | WebFilings |
| 2020 | cafr-2020.pdf | 216 | 187 | Distiller 15 |
| 2021 | city-of-oakland-annual-comprehensive-financial-report-fy2021_2022-01-11-000557_bnea.pdf | 213 | 184 | Acrobat Pro DC |
| 2022 | city-of-oakland-fy22-acfr.pdf | 216 | 186 | Acrobat Pro |
| 2023 | 2023-city-of-oakland-acfr_final-122723.pdf | 218 | 188 | Wdesk |
| 2024 | 2024-city-of-oakland-acfr_final-121324.pdf | 224 | 192 | Wdesk |
| 2025 | 2025-city-of-oakland-acfr_final-123025.pdf | 224 | 192 | Wdesk |

All files are under `https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/financial-reporting/annual-comprehensive-financial-reports/`. Pages with little text are covers, dividers, "intentionally left blank" pages, the GFOA certificate and the organization chart, which are images. No financial statement is an image.

**One defect.** FY2014 (and other Distiller years) inserts letter spacing in some headers, for example "Primary Gove rnme nt". The column headers need whitespace-tolerant matching. The numbers are unaffected.

**Plan consequence.** No OCR dependency for the ACFR reader. Stage 0 can ingest all 14 years.

## 2. M-M2: money-table census: GO

Row counts are from the Socrata `$select=count(*)` query on 2026-10-05. All Socrata tables export as CSV or JSON from `https://data.oaklandca.gov/resource/<id>.json` (SODA 2), with no key needed at this volume.

| Family | Table (Socrata id or source) | Rows | Format and keys | Last updated |
|---|---|---|---|---|
| Budget line items | FY2013-15 Proposed `b8mb-8tti` | 17,579 | CSV; org, fund, program, account, amount | 2013-04 |
| | FY2013-15 Adopted `vmzx-e5fe` | 17,862 | + project | 2014-03 |
| | FY2014-15 Midcycle Adopted `d46c-ikcm` | 9,120 | | 2015-03 |
| | FY14-15 to FY15-17 comparison `exad-dv4t` | 19,064 | 3 year columns | 2015-05 |
| | FY2015-17 Proposed `w4j2-chmt` | 20,652 | | 2015-04 |
| | FY2015-17 Adopted `urid-amga` | 20,889 | amount is text `"* 5,632,522"` | 2015-11 |
| | FY2017-19 Proposed expenditures `4ewt-5m6f` | 66,354 | | 2017-04 |
| | FY2017-19 Proposed revenues `em9r-f4zg` | 4,487 | | 2017-04 |
| | FY2019-21 Proposed `aeya-c8st` | 46,492 | + FY17-18 actuals column | 2019-05 |
| | FY2019-21 Adopted `m4jd-q2c4` | 46,859 | + FY17-18 actuals column | 2019-12 |
| Budget, FY2021 onward | OpenGov Transparency (`oaklandca.opengov.com/transparency`) and budget-book PDFs | n/a | JavaScript app; PDF | live |
| Financial report | ACFR PDFs FY2012-25 (§1c) | 65 (FY2014) to 91 (FY2024) pages headed "(in thousands)"; 21-22 statistical schedules | PDF with text layer | annual, December |
| Payroll | Transparent California, Oakland, 2011-2025 | 4,949 to 6,158 a year (§5) | HTML pages public; CSV behind login | 2025 present |
| Payments | `pydt-5ccu` (one public-records release) | 166 | supplier_num, invoice, GL date | 2015 |
| Contracts | `3fhs-xfjc` "Contracts Awarding" | 5 | aggregates by race only | 2018 |
| | `gbwk-gp4h` cultural grants FY14-15 | 102 | | 2015 |
| Campaign (NetFile to Socrata, nightly) | Form 460 Summary `rsxe-vvuw` | 100,032 | filer_id, report_num, line_item | 2026-10-05 |
| | 460 Sch A contributions `3xq4-ermg` | 73,043 | filer_id, tran_id | same |
| | 460 Sch E payments made `bvfu-nq99` | 28,292 | | same |
| | 460 Sch F accrued `9gcg-vghr` | 6,655 | | same |
| | 460 Sch G agent payments `xuui-k2nt` | 4,013 | | same |
| | 460 Sch D `x5eg-xkea` | 2,723 | | same |
| | 460 Sch B1 loans `qaa7-q29f` | 1,335 | | same |
| | 460 Sch C non-monetary `ba44-jqtm` | 911 | | same |
| | 460 Sch I `jft9-u9bd` | 443 | | same |
| | 461 `ub5g-m92u` | 550 | includes `expn_chkno` | same |
| | 496 IEs `jkj3-8yq3` | 1,435 | | same |
| | 497 late contributions `qact-u8hq` | 2,006 | | same |
| | Show Me the Money candidate expenditures `yjtu-3cj6` | 10,087 | filing_id, tran_id | 2024-10 |
| Influence | Behested payments, Form 803 `f4dq-mk8d` | 224 | | 2026-08 |
| | Lobbyist clients `ss9a-d595` | 2,897 | | 2026-10 |
| | Lobbyist contacts `ucs9-a92d` | 5,481 | | 2026-10 |
| | Lobbyist contributions `xvc7-ctj7` | 31 | | 2026-10 |

The NetFile public API is the upstream for the campaign tables, and also offers its own CSV exports: `https://netfile.com/api/public/sites/api/CampaignExport/yearly`, `…/exportfilingcsv`, `…/exporttransactioncsv`, with `aid=COAK`.

**Plan consequence.** The campaign family is the richest public money table (about 225,000 rows, refreshed daily) and carries stable `filer_id`/`tran_id` keys. It is the natural first `MSR-` trail and attribution set. Budget line items exist for FY2013 to FY2021 only. Later years come from PDFs or OpenGov.

## 3. M-M3: identifiers joining awards and contracts to payments: NO-GO on public data

| Key | Where it appears publicly | Where it is missing |
|---|---|---|
| Fund (`FD_1010`, `1010`) | every budget table; budget book; ACFR fund names (names only, no numbers, in the statements) | payments |
| Org (`OR_01111`), Program (`PG_IP01`), Account (`51111`) | budget tables | ACFR |
| Project (`PJ_1000001`, 7 digits) | budget tables (FY13-15 Adopted onward); CIP pages of the budget book; council resolutions in Legistar ("Project No. 100xxxx") | payments, contracts |
| Supplier number (`87023`) | only `pydt-5ccu` (166 rows, 2007-08) | everything else |
| Contract or PO number | inside the free-text `description` of `pydt-5ccu` (for example "M 08A053"); in Legistar resolutions and staff reports as text | no structured column anywhere |
| Campaign `filer_id`, `tran_id`, `report_num`; 461 `expn_chkno` | campaign tables | n/a (campaign money only) |
| Legistar `MatterId` and resolution number | Legistar API (awards authorised by council) | payments |

Bid results go to www.CIPList.com, and awards to firms are named on https://www.oaklandca.gov/topics/capital-contracts-division. Neither is a table with ids.

**Plan consequence.** Award (Legistar resolution, with project number in text) to budget (project key) is joinable on public data, by text extraction of the project number. Award or budget to payment is not. The T33 money job should ship `committedAgainstPaid` with the join keys typed (fund, project, supplier, contract) and test it on fixtures. The public demo shows authorised against budgeted, not paid. A payment join waits on a records-request extract carrying supplier_num and PO numbers.

## 4. M-M1 fixture: 200 ACFR and budget figures

**Documents** (`pdf_page` is the 1-based PDF page index, not the printed folio):
- **A24**: ACFR FY2024, https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/financial-reporting/annual-comprehensive-financial-reports/2024-city-of-oakland-acfr_final-121324.pdf. p49 Statement of Net Position, p50 Statement of Activities, p57 Statement of Cash Flows (proprietary), p212 Statistical Schedule 9 (property tax levies and collections). The statements are "(In thousands)".
- **A19**: ACFR FY2019, https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/financial-reporting/annual-comprehensive-financial-reports/city-of-oakland-cafr-ye-6.30.2019-final-12.13.2019.pdf. p50 Statement of Cash Flows, p158 Budget and Actual, nonmajor special revenue funds ("(In Thousands)").
- **BB23**: FY2023-25 Adopted Policy Budget, https://www.oaklandca.gov/files/assets/city/v/1/finance/documents/fiscal-years/2023-2025-budget/fy23-25-adopted-budget-book-final-reduced-size.pdf. p137 Significant Changes (FTE and dollars), p148 General Purpose Fund Revenue (OpenGov render), p241 Summary Table By Fund. Whole dollars.

**Conventions.**
- `as_read` is the token exactly as `pdftotext -layout` gives it, with runs of spaces collapsed to one. Inside the CSV it is quoted when it holds a comma.
- `expected` is the exact decimal after applying `scale`. "in thousands" means ×1000. Percentages keep the printed number with unit `percent` and are not divided by 100.
- `sign` is the economic sign. Parentheses mean negative, except for a parenthesised percentage after a dollar figure on the OpenGov chart labels (F194, F196, F198, F200), which is a share. `-$9,794,467` (F179, F180) is a negative written with a leading minus.
- An em dash (`—`) is a printed nil. Dashes are not rows here but they hold column positions, and the `column` value accounts for them.
- F005 and F006 are figures printed inside a row label (allowances), also in thousands.
- Every `as_read` was checked to occur on its page.

Counts: 200 figures. By sign, 147 positive and 53 negative. By unit, 178 USD, 13 percent and 9 FTE. By scale, 151 in thousands and 49 as printed. By document, 112 from A24, 48 from A19 and 40 from BB23.

```csv
id,doc,pdf_page,row_label,column,as_read,scale,expected,unit,sign,note
F001,A24,49,Cash and investments,Governmental Activities,"$ 1,405,595",in thousands,1405595000,USD,+,
F002,A24,49,Cash and investments,Business-type Activities,"$ 99,327",in thousands,99327000,USD,+,
F003,A24,49,Cash and investments,Total,"$ 1,504,922",in thousands,1504922000,USD,+,
F004,A24,49,Cash and investments,Port of Oakland,"$ 678,654",in thousands,678654000,USD,+,
F005,A24,49,Receivables (net of allowance for uncollectibles of,(figure inside row label),"$19,634",in thousands,19634000,USD,+,
F006,A24,49,the City and,(figure inside row label),"$2,379",in thousands,2379000,USD,+,
F007,A24,49,Accrued interest,Governmental Activities,"18,093",in thousands,18093000,USD,+,
F008,A24,49,Accrued interest,Business-type Activities,"1,149",in thousands,1149000,USD,+,
F009,A24,49,Accrued interest,Total,"19,242",in thousands,19242000,USD,+,
F010,A24,49,Property taxes,Governmental Activities,"25,552",in thousands,25552000,USD,+,
F011,A24,49,Property taxes,Total,"25,552",in thousands,25552000,USD,+,
F012,A24,49,Accounts receivable,Governmental Activities,"66,091",in thousands,66091000,USD,+,
F013,A24,49,Accounts receivable,Business-type Activities,"19,166",in thousands,19166000,USD,+,
F014,A24,49,Accounts receivable,Total,"85,257",in thousands,85257000,USD,+,
F015,A24,49,Accounts receivable,Port of Oakland,"47,092",in thousands,47092000,USD,+,
F016,A24,49,Grants receivable,Governmental Activities,"57,240",in thousands,57240000,USD,+,
F017,A24,49,Grants receivable,Total,"57,240",in thousands,57240000,USD,+,
F018,A24,49,Lease receivable,Governmental Activities,"40,502",in thousands,40502000,USD,+,
F019,A24,49,Lease receivable,Total,"40,502",in thousands,40502000,USD,+,
F020,A24,49,Lease receivable,Port of Oakland,"971,597",in thousands,971597000,USD,+,
F021,A24,49,Due from Port,Governmental Activities,"8,996",in thousands,8996000,USD,+,
F022,A24,49,Due from Port,Total,"8,996",in thousands,8996000,USD,+,
F023,A24,49,Due from Oakland Redevelopment Successor Agency (ORSA),Governmental Activities,"2,754",in thousands,2754000,USD,+,
F024,A24,49,Due from Oakland Redevelopment Successor Agency (ORSA),Total,"2,754",in thousands,2754000,USD,+,
F025,A24,49,Due from custodial funds,Governmental Activities,123,in thousands,123000,USD,+,
F026,A24,49,Due from custodial funds,Total,123,in thousands,123000,USD,+,
F027,A24,49,Internal balances,Governmental Activities,996,in thousands,996000,USD,+,
F028,A24,49,Internal balances,Business-type Activities,(996),in thousands,-996000,USD,-,
F029,A24,49,Due from other governments,Governmental Activities,"12,626",in thousands,12626000,USD,+,
F030,A24,49,Due from other governments,Total,"12,626",in thousands,12626000,USD,+,
F031,A24,49,Inventories,Governmental Activities,"1,493",in thousands,1493000,USD,+,
F032,A24,49,Inventories,Total,"1,493",in thousands,1493000,USD,+,
F033,A24,49,Restricted assets: Cash and investments,Governmental Activities,"393,789",in thousands,393789000,USD,+,
F034,A24,49,Restricted assets: Cash and investments,Business-type Activities,283,in thousands,283000,USD,+,
F035,A24,49,Restricted assets: Cash and investments,Total,"394,072",in thousands,394072000,USD,+,
F036,A24,49,Restricted assets: Cash and investments,Port of Oakland,"116,202",in thousands,116202000,USD,+,
F037,A24,50,General government,Expenses,"$ 294,276",in thousands,294276000,USD,+,
F038,A24,50,General government,Charges for Services,"$ 17,066",in thousands,17066000,USD,+,
F039,A24,50,General government,Operating Grants,"$ 5,220",in thousands,5220000,USD,+,
F040,A24,50,General government,Capital Grants,"$ 14,568",in thousands,14568000,USD,+,
F041,A24,50,General government,Governmental Activities,"$ (257,422)",in thousands,-257422000,USD,-,
F042,A24,50,General government,Total,"$ (257,422)",in thousands,-257422000,USD,-,
F043,A24,50,Public safety,Expenses,"592,035",in thousands,592035000,USD,+,
F044,A24,50,Public safety,Charges for Services,"27,020",in thousands,27020000,USD,+,
F045,A24,50,Public safety,Operating Grants,"9,305",in thousands,9305000,USD,+,
F046,A24,50,Public safety,Governmental Activities,"(555,710)",in thousands,-555710000,USD,-,
F047,A24,50,Public safety,Total,"(555,710)",in thousands,-555710000,USD,-,
F048,A24,50,Community and human services,Expenses,"182,920",in thousands,182920000,USD,+,
F049,A24,50,Community and human services,Charges for Services,"6,373",in thousands,6373000,USD,+,
F050,A24,50,Community and human services,Operating Grants,"67,164",in thousands,67164000,USD,+,
F051,A24,50,Community and human services,Governmental Activities,"(109,383)",in thousands,-109383000,USD,-,
F052,A24,50,Community and human services,Total,"(109,383)",in thousands,-109383000,USD,-,
F053,A24,50,Community and economic development,Expenses,"157,414",in thousands,157414000,USD,+,
F054,A24,50,Community and economic development,Charges for Services,"60,939",in thousands,60939000,USD,+,
F055,A24,50,Community and economic development,Operating Grants,"26,460",in thousands,26460000,USD,+,
F056,A24,50,Community and economic development,Governmental Activities,"(70,015)",in thousands,-70015000,USD,-,
F057,A24,50,Community and economic development,Total,"(70,015)",in thousands,-70015000,USD,-,
F058,A24,50,Public works and transportation,Expenses,"190,206",in thousands,190206000,USD,+,
F059,A24,50,Public works and transportation,Charges for Services,"74,856",in thousands,74856000,USD,+,
F060,A24,50,Public works and transportation,Operating Grants,"27,998",in thousands,27998000,USD,+,
F061,A24,57,Cash receipts from interfund services provided $,Internal Service Funds,"$ 124,801",in thousands,124801000,USD,+,
F062,A24,57,Cash received from customers and users,Sewer Service Fund,"77,503",in thousands,77503000,USD,+,
F063,A24,57,Cash received from customers and users,Parks and Recreation,4,in thousands,4000,USD,+,
F064,A24,57,Cash received from customers and users,Total,"77,507",in thousands,77507000,USD,+,
F065,A24,57,Cash received from tenants for rents,Parks and Recreation,267,in thousands,267000,USD,+,
F066,A24,57,Cash received from tenants for rents,Total,267,in thousands,267000,USD,+,
F067,A24,57,Cash from other sources,Sewer Service Fund,18,in thousands,18000,USD,+,
F068,A24,57,Cash from other sources,Total,18,in thousands,18000,USD,+,
F069,A24,57,Cash from other sources,Internal Service Funds,"3,782",in thousands,3782000,USD,+,
F070,A24,57,Cash paid to employees,Sewer Service Fund,"(23,458)",in thousands,-23458000,USD,-,
F071,A24,57,Cash paid to employees,Parks and Recreation,(126),in thousands,-126000,USD,-,
F072,A24,57,Cash paid to employees,Total,"(23,584)",in thousands,-23584000,USD,-,
F073,A24,57,Cash paid to employees,Internal Service Funds,"(35,790)",in thousands,-35790000,USD,-,
F074,A24,57,Cash paid to suppliers,Sewer Service Fund,"(34,055)",in thousands,-34055000,USD,-,
F075,A24,57,Cash paid to suppliers,Parks and Recreation,"(1,348)",in thousands,-1348000,USD,-,
F076,A24,57,Cash paid to suppliers,Total,"(35,403)",in thousands,-35403000,USD,-,
F077,A24,57,Cash paid to suppliers,Internal Service Funds,"(59,167)",in thousands,-59167000,USD,-,
F078,A24,57,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Sewer Service Fund,"20,008",in thousands,20008000,USD,+,
F079,A24,57,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Parks and Recreation,"(1,203)",in thousands,-1203000,USD,-,
F080,A24,57,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Total,"18,805",in thousands,18805000,USD,+,
F081,A24,57,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Internal Service Funds,"33,626",in thousands,33626000,USD,+,
F082,A24,57,Proceeds from (repayment of) interfund loans,Parks and Recreation,272,in thousands,272000,USD,+,
F083,A24,57,Proceeds from (repayment of) interfund loans,Total,272,in thousands,272000,USD,+,
F084,A24,57,Proceeds from (repayment of) interfund loans,Internal Service Funds,(75),in thousands,-75000,USD,-,
F085,A24,57,Transfers in,Parks and Recreation,711,in thousands,711000,USD,+,
F086,A24,57,Transfers in,Total,711,in thousands,711000,USD,+,
F087,A24,57,Transfers out,Sewer Service Fund,"(1,628)",in thousands,-1628000,USD,-,
F088,A24,57,Transfers out,Parks and Recreation,(1),in thousands,-1000,USD,-,
F089,A24,212,2015,Taxes Levied,"$ 92,969",in thousands,92969000,USD,+,
F090,A24,212,2015,Collected Amount,"$ 91,419",in thousands,91419000,USD,+,
F091,A24,212,2015,Collected % of Levy,98.33 %,as printed,98.33,percent,+,
F092,A24,212,2015,Total Collections Amount,"$ 91,419",in thousands,91419000,USD,+,
F093,A24,212,2015,Total % of Levy,98.33 %,as printed,98.33,percent,+,
F094,A24,212,2016,Taxes Levied,"101,746",in thousands,101746000,USD,+,
F095,A24,212,2016,Collected Amount,"99,849",in thousands,99849000,USD,+,
F096,A24,212,2016,Collected % of Levy,98.14 %,as printed,98.14,percent,+,
F097,A24,212,2016,Total Collections Amount,"99,849",in thousands,99849000,USD,+,
F098,A24,212,2016,Total % of Levy,98.14 %,as printed,98.14,percent,+,
F099,A24,212,2017,Taxes Levied,"108,686",in thousands,108686000,USD,+,
F100,A24,212,2017,Collected Amount,"106,799",in thousands,106799000,USD,+,
F101,A24,212,2017,Collected % of Levy,98.26 %,as printed,98.26,percent,+,
F102,A24,212,2017,Total Collections Amount,"106,799",in thousands,106799000,USD,+,
F103,A24,212,2017,Total % of Levy,98.26 %,as printed,98.26,percent,+,
F104,A24,212,2018,Taxes Levied,"116,778",in thousands,116778000,USD,+,
F105,A24,212,2018,Collected Amount,"115,061",in thousands,115061000,USD,+,
F106,A24,212,2018,Collected % of Levy,98.53 %,as printed,98.53,percent,+,
F107,A24,212,2018,Total Collections Amount,"115,061",in thousands,115061000,USD,+,
F108,A24,212,2018,Total % of Levy,98.53 %,as printed,98.53,percent,+,
F109,A24,212,2019,Taxes Levied,"122,790",in thousands,122790000,USD,+,
F110,A24,212,2019,Collected Amount,"121,081",in thousands,121081000,USD,+,
F111,A24,212,2019,Collected % of Levy,98.61 %,as printed,98.61,percent,+,
F112,A24,212,2019,Total Collections Amount,"121,081",in thousands,121081000,USD,+,
F113,A19,50,Cash received from customers and users,Sewer Service,"$ 71,489",in thousands,71489000,USD,+,
F114,A19,50,Cash received from customers and users,Total,"$ 71,489",in thousands,71489000,USD,+,
F115,A19,50,Cash received from customers and users,Internal Service Funds,"$ 88,626",in thousands,88626000,USD,+,
F116,A19,50,Cash received from tenants for rents,Parks and Recreation,539,in thousands,539000,USD,+,
F117,A19,50,Cash received from tenants for rents,Total,539,in thousands,539000,USD,+,
F118,A19,50,Cash from other sources,Sewer Service,17,in thousands,17000,USD,+,
F119,A19,50,Cash from other sources,Total,17,in thousands,17000,USD,+,
F120,A19,50,Cash from other sources,Internal Service Funds,584,in thousands,584000,USD,+,
F121,A19,50,Cash paid to employees,Sewer Service,"(12,244)",in thousands,-12244000,USD,-,
F122,A19,50,Cash paid to employees,Parks and Recreation,(146),in thousands,-146000,USD,-,
F123,A19,50,Cash paid to employees,Total,"(12,390)",in thousands,-12390000,USD,-,
F124,A19,50,Cash paid to employees,Internal Service Funds,"(25,611)",in thousands,-25611000,USD,-,
F125,A19,50,Cash paid to suppliers,Sewer Service,"(25,509)",in thousands,-25509000,USD,-,
F126,A19,50,Cash paid to suppliers,Parks and Recreation,(409),in thousands,-409000,USD,-,
F127,A19,50,Cash paid to suppliers,Total,"(25,918)",in thousands,-25918000,USD,-,
F128,A19,50,Cash paid to suppliers,Internal Service Funds,"(42,901)",in thousands,-42901000,USD,-,
F129,A19,50,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Sewer Service,"33,753",in thousands,33753000,USD,+,
F130,A19,50,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Parks and Recreation,(16),in thousands,-16000,USD,-,
F131,A19,50,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Total,"33,737",in thousands,33737000,USD,+,
F132,A19,50,NET CASH PROVIDED BY (USED IN) OPERATING ACTIVITIES,Internal Service Funds,"20,698",in thousands,20698000,USD,+,
F133,A19,50,Proceeds from interfund loans,Parks and Recreation,62,in thousands,62000,USD,+,
F134,A19,50,Proceeds from interfund loans,Total,62,in thousands,62000,USD,+,
F135,A19,158,Sales and use tax,TSC Original,"$ 27,268",in thousands,27268000,USD,+,
F136,A19,158,Sales and use tax,TSC Final,"$ 27,268",in thousands,27268000,USD,+,
F137,A19,158,Sales and use tax,TSC Actual,"$ 30,265",in thousands,30265000,USD,+,
F138,A19,158,Sales and use tax,TSC Variance,"$ 2,997",in thousands,2997000,USD,+,
F139,A19,158,Gas tax,Gas Tax Original,"17,989",in thousands,17989000,USD,+,
F140,A19,158,Gas tax,Gas Tax Final,"17,989",in thousands,17989000,USD,+,
F141,A19,158,Gas tax,Gas Tax Actual,"16,409",in thousands,16409000,USD,+,
F142,A19,158,Gas tax,Gas Tax Variance,"(1,580)",in thousands,-1580000,USD,-,
F143,A19,158,Fines and penalties,TSC Original,"1,200",in thousands,1200000,USD,+,
F144,A19,158,Fines and penalties,TSC Final,"1,200",in thousands,1200000,USD,+,
F145,A19,158,Fines and penalties,TSC Actual,677,in thousands,677000,USD,+,
F146,A19,158,Fines and penalties,TSC Variance,(523),in thousands,-523000,USD,-,
F147,A19,158,Interest and investment income,TSC Actual,386,in thousands,386000,USD,+,
F148,A19,158,Interest and investment income,TSC Variance,386,in thousands,386000,USD,+,
F149,A19,158,Interest and investment income,Gas Tax Actual,71,in thousands,71000,USD,+,
F150,A19,158,Interest and investment income,Gas Tax Variance,71,in thousands,71000,USD,+,
F151,A19,158,Charges for services,TSC Original,115,in thousands,115000,USD,+,
F152,A19,158,Charges for services,TSC Final,115,in thousands,115000,USD,+,
F153,A19,158,Charges for services,TSC Actual,177,in thousands,177000,USD,+,
F154,A19,158,Charges for services,TSC Variance,62,in thousands,62000,USD,+,
F155,A19,158,Charges for services,Gas Tax Original,7,in thousands,7000,USD,+,
F156,A19,158,Charges for services,Gas Tax Final,7,in thousands,7000,USD,+,
F157,A19,158,Charges for services,Gas Tax Variance,(7),in thousands,-7000,USD,-,
F158,A19,158,Federal and state grants and subventions,TSC Original,"6,671",in thousands,6671000,USD,+,
F159,A19,158,Federal and state grants and subventions,TSC Final,"13,271",in thousands,13271000,USD,+,
F160,A19,158,Federal and state grants and subventions,TSC Actual,"6,430",in thousands,6430000,USD,+,
F161,BB23,137,OPD FD_1010 Section Sergeant of Police (PERS) (80 Hr).PS179,FY23-24 FTE Change,(1.00),as printed,-1.00,FTE,-,
F162,BB23,137,OPD FD_1010 Section Sergeant of Police (PERS) (80 Hr).PS179,FY23-24 Change,"(349,792)",as printed,-349792,USD,-,
F163,BB23,137,OPD FD_1010 Section Sergeant of Police (PERS) (80 Hr).PS179,FY24-25 FTE Change,(1.00),as printed,-1.00,FTE,-,
F164,BB23,137,OPD FD_1010 Section Sergeant of Police (PERS) (80 Hr).PS179,FY24-25 Change,"(359,940)",as printed,-359940,USD,-,
F165,BB23,137,OPD FD_1010 Operations Center Sergeant of Police (PERS) (80 Hr).PS179,FY23-24 FTE Change,(1.00),as printed,-1.00,FTE,-,
F166,BB23,137,OPD FD_1010 Operations Center Sergeant of Police (PERS) (80 Hr).PS179,FY23-24 Change,"(341,882)",as printed,-341882,USD,-,
F167,BB23,137,OPD FD_1010 Operations Center Sergeant of Police (PERS) (80 Hr).PS179,FY24-25 FTE Change,(1.00),as printed,-1.00,FTE,-,
F168,BB23,137,OPD FD_1010 Operations Center Sergeant of Police (PERS) (80 Hr).PS179,FY24-25 Change,"(351,811)",as printed,-351811,USD,-,
F169,BB23,137,OPD FD_1010 Continue to freeze 3.0 FTE Police Officers in Homicide Pol,FY23-24 FTE Change,(3.00),as printed,-3.00,FTE,-,
F170,BB23,137,OPD FD_1010 Continue to freeze 3.0 FTE Police Officers in Homicide Pol,FY23-24 Change,"(831,399)",as printed,-831399,USD,-,
F171,BB23,137,OPD FD_1010 Continue to freeze 3.0 FTE Police Officers in Homicide Pol,FY24-25 FTE Change,(3.00),as printed,-3.00,FTE,-,
F172,BB23,137,OPD FD_1010 Continue to freeze 3.0 FTE Police Officers in Homicide Pol,FY24-25 Change,"(855,606)",as printed,-855606,USD,-,
F173,BB23,137,OPD FD_1010 Continue to freeze 4.0 FTE Police Officers in Special Oper,FY23-24 FTE Change,(4.00),as printed,-4.00,FTE,-,
F174,BB23,137,OPD FD_1010 Continue to freeze 4.0 FTE Police Officers in Special Oper,FY23-24 Change,"(1,177,038)",as printed,-1177038,USD,-,
F175,BB23,137,OPD FD_1010 Continue to freeze 4.0 FTE Police Officers in Special Oper,FY24-25 FTE Change,(4.00),as printed,-4.00,FTE,-,
F176,BB23,137,OPD FD_1010 Continue to freeze 4.0 FTE Police Officers in Special Oper,FY24-25 Change,"(1,211,279)",as printed,-1211279,USD,-,
F177,BB23,137,OPD FD_1010 Crimes and Task Forces Police Officer (PERS) (80 Hr).PS168,FY23-24 FTE Change,(7.00),as printed,-7.00,FTE,-,
F178,BB23,137,OPD FD_1010 Crimes and Task Forces Police Officer (PERS) (80 Hr).PS168,FY23-24 Change,"(1,990,700)",as printed,-1990700,USD,-,
F179,BB23,241,General Funds FD_1150 Non Departmental and Port,FY23-24 Biennial,"-$9,794,467",as printed,-9794467,USD,-,leading minus before $ (not parentheses)
F180,BB23,241,General Funds FD_1150 Non Departmental and Port,FY24-25 Biennial,"-$10,066,079",as printed,-10066079,USD,-,leading minus before $ (not parentheses)
F181,BB23,148,Property Tax,FY21-22-Actuals,"$258,968,959",as printed,258968959,USD,+,whole dollars
F182,BB23,148,Property Tax,FY22-23-Midcycle,"$265,493,946",as printed,265493946,USD,+,whole dollars
F183,BB23,148,Property Tax,FY23-24-Biennial,"$294,168,232",as printed,294168232,USD,+,whole dollars
F184,BB23,148,Property Tax,FY24-25-Biennial,"$308,925,155",as printed,308925155,USD,+,whole dollars
F185,BB23,148,Sales Tax,FY21-22-Actuals,"$64,165,885",as printed,64165885,USD,+,whole dollars
F186,BB23,148,Sales Tax,FY22-23-Midcycle,"$62,600,000",as printed,62600000,USD,+,whole dollars
F187,BB23,148,Sales Tax,FY23-24-Biennial,"$67,689,746",as printed,67689746,USD,+,whole dollars
F188,BB23,148,Sales Tax,FY24-25-Biennial,"$69,652,297",as printed,69652297,USD,+,whole dollars
F189,BB23,148,Vehicle License Fee,FY21-22-Actuals,"$503,129",as printed,503129,USD,+,whole dollars
F190,BB23,148,Vehicle License Fee,FY22-23-Midcycle,$0,as printed,0,USD,+,"printed $0 (zero, not blank)"
F191,BB23,148,Vehicle License Fee,FY23-24-Biennial,$0,as printed,0,USD,+,"printed $0 (zero, not blank)"
F192,BB23,148,Vehicle License Fee,FY24-25-Biennial,$0,as printed,0,USD,+,"printed $0 (zero, not blank)"
F193,BB23,148,Utility Consumption Tax,chart label FY24-25 amount,"$61,865,265",as printed,61865265,USD,+,whole dollars
F194,BB23,148,Utility Consumption Tax,chart label FY24-25 share of GPF revenue,(7.3%),as printed,7.3,percent,+,"parenthesised percentage is a share, not a negative"
F195,BB23,148,Business License Tax,chart label FY24-25 amount,"$128,138,817",as printed,128138817,USD,+,whole dollars
F196,BB23,148,Business License Tax,chart label FY24-25 share of GPF revenue,(15.1%),as printed,15.1,percent,+,"parenthesised percentage is a share, not a negative"
F197,BB23,148,Real Estate Transfer Tax,chart label FY24-25 amount,"$124,257,777",as printed,124257777,USD,+,whole dollars
F198,BB23,148,Real Estate Transfer Tax,chart label FY24-25 share of GPF revenue,(14.7%),as printed,14.7,percent,+,"parenthesised percentage is a share, not a negative"
F199,BB23,148,Property Tax,chart label FY24-25 amount,"$308,925,155",as printed,308925155,USD,+,whole dollars
F200,BB23,148,Property Tax,chart label FY24-25 share of GPF revenue,(36.5%),as printed,36.5,percent,+,"parenthesised percentage is a share, not a negative"
```


## 5. M-P1: distinct people and turnover in ten payroll years (2015 to 2024): GO

**Source.** Transparent California, City of Oakland salaries, https://transparentcalifornia.com/salaries/{year}/oakland/ (public pages; robots.txt disallows only `/salaries/all/` and `/salaries/search/`). The per-year record totals come from the page data: 2011 5,571; 2012 5,373; 2013 5,386; 2014 6,158; 2015 5,416; 2016 5,483; 2017 5,894; 2018 5,840; 2019 5,933; 2020 5,669; 2021 5,327; 2022 4,959; 2023 5,100; 2024 5,119; 2025 4,949. The CSV download needs a login, so the ten years 2015 to 2024 were read from the paginated agency pages (25 rows a page, about 2,150 requests, rate-limited), keeping only id, name and job title.

**Coverage.** 98.8 to 99.4% of each year's records were captured. The gaps are scattered single ids, consistent with an unstable sort across pages, so they are not a contiguous block. Each missing record can count once as a false leaver and once as a false joiner, so the leave rates below may be high by up to about 1 point.

**Identity rule.** A person is a normalized full name (lowercase, letters only). A looser first-plus-last-token rule changes the leave rates by at most 0.4 points, so middle-name variance is small. Same-name collisions are not separated, which is a lower bound on distinct people.

| Years | Distinct people in first year | Stayed | Joined (in second year only) | Left (in first year only) | Leave rate |
|---|---|---|---|---|---|
| 2015→2016 | 5,359 | 4,760 | 656 | 599 | 11.2% |
| 2016→2017 | 5,416 | 4,551 | 685 | 865 | 16.0% |
| 2017→2018 | 5,236 | 4,608 | 669 | 628 | 12.0% |
| 2018→2019 | 5,277 | 4,508 | 695 | 769 | 14.6% |
| 2019→2020 | 5,203 | 4,516 | 501 | 687 | 13.2% |
| 2020→2021 | 5,017 | 4,208 | 513 | 809 | 16.1% |
| 2021→2022 | 4,721 | 4,122 | 776 | 599 | 12.7% |
| 2022→2023 | 4,898 | 4,273 | 767 | 625 | 12.8% |
| 2023→2024 | 5,040 | 4,518 | 547 | 522 | 10.4% |

Over the ten years there are **10,850 distinct people** (10,577 on the loose rule), and **1,941** appear in every year. Annual turnover runs from **10% to 16%**, which means about 520 to 870 leavers and 500 to 780 joiners a year.

In 2017 to 2021 the source carries one record per job held in the year, about 600 records a year beyond the people count. Example: the same name appears as "Lieutenant Of Police" and "Captain Of Police" in 2019. In the other years it carries one record per person.

**Plan consequence.** PEOPLE should be sized for about 11,000 people per decade of payroll in one city, with about 5,000 live in a year and about 1,300 identity events a year (joins plus leaves). The 50,000-line person page in M-P5 is generous for staff. The payroll source gives in-year role changes for some years only, so the people job must not infer "no promotion" from a single record. Transparent California's CSV route needs an account. For an import, the City's own payroll release (it supplies Transparent California, and the State Controller's GCC publishes positions without names) is the cleaner source. Which one to use is a sourcing ruling, not Bob's.

## 6. M-P3: Form 700 filer counts and filing officers' portals: PARTIAL

**Portals.**
- City of Oakland (City Clerk as filing officer): https://public.netfile.com/pub/?aid=COAK, which redirects to https://netfile.com/public/COAK/sei. Linked from https://www.oaklandca.gov/Government/Elections/Statement-of-Economic-InterestForm-700.
- Statements of officials who file with the FPPC (for example, Council members as 87200 filers) are also searchable at https://www.fppc.ca.gov/transparency/form-700-filed-by-public-officials/form700-search.html.
- The Port of Oakland and Oakland Unified are separate filing officers and were not measured.

**Machine-readable index.** The portal's own API answers without login or captcha:
`POST https://netfile.com/api/public/sites/api/searchfilings`, body `{"aid":"COAK","getArchived":true,"search":"","searchSchedules":[],"currentPage":1,"pageSize":1000}`.
Each item is JSON with filerName, departmentName, positionName, statementType, period (year, periodStart, periodEnd), filingDate, filingId (GUID) and formName (`fppc700_YYYY`).

| Period year | Annual-statement filers | All statements (any type) |
|---|---|---|
| 2015 | 877 | 1,121 |
| 2016 | 904 | 1,087 |
| 2017 | 908 | 1,109 |
| 2018 | 875 | 1,055 |
| 2019 | 895 | 1,090 |
| 2020 | 1,023 | 1,175 |
| 2021 | 1,073 | 1,304 |
| 2022 | 1,101 | 1,355 |
| 2023 | 1,198 | 1,464 |
| 2024 | 1,134 | 1,369 |
| 2025 | 1,087 | 1,357 |

The index holds 18,933 statements in total for 2010 to 2026: 15,986 Annual, 2,035 Assuming Office, 892 Leaving Office and 19 Candidate. There are 3,790 distinct filer names, spread across 274 department or unit strings in 2024.

**Documents.** `GET https://netfile.com/api/public/sites/api/SeiDocuments/download/{filingId}?aid=COAK&name=…&date=…` returns the e-filed PDF (tested: 3 pages, 454 KB, text layer). The filled-in values extract cleanly (name, agency, position, dates, schedule boxes ticked). The printed form labels come out in a shifted glyph encoding (for example `67$7(0(17` for "STATEMENT"), so a reader must anchor on field positions, not label text. The index's schedule-count fields (`coverDetailsScheduleA1Count` and others) are all 0, so they are not populated. Schedule contents (A-1 investments, B real property, C income) are therefore PDF-only.

**Plan consequence.** The filer index (who, which department, which year, which statement) can be imported as structured rows in T33, which gives PEOPLE an office-holding signal for about 1,100 designated filers a year. Interests (2b) stay member-entered from cited PDF extents, as the draft says. An automated Form 700 reader is a later entry and remains under the P6 (docprofile) constraint.

## 7. M-55 re-measured: table extraction from budget and ACFR PDFs

Method: `pdftotext -layout`; a figure tokenizer that counts `—` as a cell; for each table, the share of numeric rows (2 or more figures) whose cell count equals the table's modal count. A table counts as **usable** at 85% or more with headers present in the text layer.

| Doc | PDF page | Table | Rows | Modal cols | Rows at modal | Usable |
|---|---|---|---|---|---|---|
| ACFR FY2014 | 46 | Statement of Net Position | 41 | 4 | 95% | yes |
| | 48 | Balance Sheet, Governmental Funds | 34 | 7 | 82% | yes, after merging wrapped labels |
| | 148 | Budget and Actual, special revenue | 28 | 12 | 92% | yes |
| | 167 | Stat. Sched. 1 Net Position by Component | 11 | 10 | 100% | yes |
| | 169 | Stat. Sched. 3 Program Revenues | 14 | 10 | 100% | yes |
| ACFR FY2024 | 49 | Statement of Net Position | 48 | 4 | 100% | yes |
| | 51 | Balance Sheet, Governmental Funds | 35 | 7 | 82% | yes, after merging wrapped labels |
| | 179 | Budget and Actual, other governmental | 19 | 8 | 89% | yes |
| | 204 | Stat. Sched. 1 Net Position by Component | 11 | 10 | 72% | partial: subtotal rows span columns |
| | 212 | Stat. Sched. 9 Property Tax Levies | 20 | 5 | 100% | yes |
| Budget FY2023-25 | 17 | Table 1 Revenues, Expenditures & FTE | 0 | n/a | n/a | **no: raster image** |
| | 148 | GPF Revenue (OpenGov render) | 26 | 4 | 65% | partial: chart labels interleave; the table block alone is 100% |
| | 196 | Citywide Classification Summary | 41 | 3 | 97% | yes |
| | 241 | Summary Table By Fund | 51 | 2 | 100% | yes; labels wrap; negatives as `-$` |
| | 283 | Expenditures By Fund (dept page) | 5 | 4 | 100% | yes |

The ACFRs score 9 of 10 usable and 1 partial. The budget book scores 3 of 5 usable, 1 partial and 1 image-only. Across the whole budget book, 83 of 653 pages carry a large raster image. Some are photos, but the summary tables on p17 and similar pages are images.

**Plan consequence.** An ACFR reader on the text layer can move in T33, with wrapped-label merging and a span rule for statistical subtotals. A budget-book reader can move for the OpenGov-rendered pages, which is most of the book. It must skip the chart-label block (the line before the `Type` header) and treat image-only tables as "not read". OCR is not needed for T33.

## 8. What blocks a T33 entry

- **Nothing blocks the MONEY stage-0 import** of ACFR PDFs (FY2012-25), the Socrata budget tables (FY2013-21) and the campaign tables. The basis is known.
- **`reconcile` and `committedAgainstPaid` against real Oakland payments are blocked** (M-M0b and M-M3 NO-GO). Ship them on fixtures; the payments side waits on a records request.
- **Budget data for FY2021 onward in machine form** waits on one hand-exported OpenGov CSV, to fix the importer's columns. Until then the PDFs serve.
- **M-M1** can run in the job on the §4 fixture.
- **PEOPLE** is not blocked. Whether payroll comes from Transparent California (account) or a City release is a sourcing ruling for BOB.
- **The Form 700 index import** can move. Interests stay hand-entered, and the reader stays behind P6.
