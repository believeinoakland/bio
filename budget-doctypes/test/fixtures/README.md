# budget-doctypes fixtures

Captured 2026-10-05 for R13 (`build/plan/measures-T33/money-people.md` §1c, §4 and §7; `legistar-events.md` §3).

| file | what | source |
|---|---|---|
| `a24.json` | ACFR FY2024: pages 1, 4, 49, 50, 51, 57, 179, 204, 212 (tier 2), and pages 49, 204, 212 as tier 1 reads them | `2024-city-of-oakland-acfr_final-121324.pdf`, sha256 in the file |
| `a14.json` | ACFR FY2014: pages 1, 2, 3, 46, 48, 148, 167, 169 | `2014-comprehensive-annual-financial-report-pdf.pdf` |
| `a19.json` | ACFR FY2019: pages 1, 2, 3, 50, 158 | `city-of-oakland-cafr-ye-6.30.2019-final-12.13.2019.pdf` |
| `bb23.json` | FY2023-25 Adopted Policy Budget: pages 1, 2, 11, 17, 137, 148, 196, 241, 283, with tier 1's image list for them | `fy23-25-adopted-budget-book-final-reduced-size.pdf` |
| `m-m1-figures.csv` | the M-M1 fixture: 200 figures with their pages and `as_read` | `money-people.md` §4, copied whole |
| `fy2013-15-adopted.csv` | the FY2013-15 Adopted line-item budget, the City Council, Mayor and City Clerk rows (574) | Socrata `vmzx-e5fe`, `$where=department in('City Council','Mayor','City Clerk')`, `$order=:id` |
| `fy2019-21-adopted.csv` | the FY2019-21 Adopted line-item budget, the Mayor and City Council rows (366) | Socrata `m4jd-q2c4`, `$where=department in('DP010 - Mayor','DPCC0 - City Council','DP020 - City Clerk')`, `$order=:id` |

The PDF fixtures are rebuilt by `build.mjs` (its header says how). The CSVs are the API's CSV export, unchanged.
