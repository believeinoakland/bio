# budget-doctypes (T33)

**Status** · session_01KjUzvZtRDGcKxhimDx7Tpo · depth 2 · WORKING · handled B6

## Completion

**Paths and uses (for `modules.json`).** paths `["budget-doctypes/"]`, tests `["budget-doctypes/test/"]`. Final uses: `jurisdictions`, `docprofile`, `office-readers` and `pdf-reader`. `jurisdictions` is added because the tests read the test profile and the first profile through `combine`, with nothing added (R12; B4, B6). `pdf-reader` stays: its output shape (I2 pages, `no_text_layer` and `image_unread` markers, R16 `images`) is read, and nothing is imported from it. The architecture check passes with these uses and fails without `jurisdictions`.

**Entries applied.** T33-17, the whole module, new: R1–R14.
- `index.mjs`: the three types `financial_report`, `budget_book` and `budget_table` (`contract: SUBSTANCE`), `BUDGET_TYPES` in registration order, and `registerBudgetTypes(register)`, which registers each type once per register function. Detection (R1): for a PDF, its own title words from the view in its opening 4,000 characters, plus a structural floor of 10 lines bearing a figure. For a sheet, a header row naming a fund or org column and an amount column by the view's header words, read from R30 cells, or from the text's first lines when no cells are supplied.
- `figures.mjs`: the place-free print conventions. A figure is a token as printed; a lone `$`, `-$` or `%` split off by the text layer is rejoined. Trailing figures are cells, and a figure inside a label stays in the label. Also here: the chart-label shape (R5), the wrapped-label rule (R3), the scale phrases (R2), and the table captions and sentence rules.
- `tables.mjs`: R2–R6. The reader works over `ctx.text`, with every row's `source` from `ctx.locate`. Table regions run between sentences and headings. The header is read from the lines above a table, and the title, period and scale from the lines above or below it. Usability is measured at the 85% modal share and needs headers. A total row whose figure count differs from the modal count is marked `span`. A figure-only line with no label read beside it is its own row, with `label: null` and a `label_why`. `pages_unread` lists the pages with no text layer, and `unread` lists image-only tables: a captioned page with no table read under a painted image.
- OCR (R6, the choice K1511 left to this job; carriage as BOB accepted in B3): `ctx.supplied.ocr` is `[{page, engine, regions}]`, read only for a budget book's image-only table or text-less page, and marked `method: "ocr"` with its `engine`. A financial report never reads OCR (R4).
- `lines.mjs`: R7 and R8, from `office-readers` R30 cells only. Codes are read by the view's `classification_schemes` forms; a code with no matching form is kept as written, with `form: null` and why. A wide table (one amount column per period) takes each amount's period and phase from its column header, as written. A row with no fund or org code goes to `unread`, with why. The key is fund, org, program, project, account, period and phase, as written, with a repeat numbered. Groupings are per department and period, never carried or merged across periods.
- `assess.mjs`: R9. PDF tables are matched by title and page and rows by label; budget lines are matched by key. Events come only from the catalogue (`outcome_changed`, `item_added`, `delisted`, and `item_changed` for an org moved within a period). A reading with nothing read on either side is a failed read (`meaningful: null`).
- `view.mjs`: every word comes from the view under K1513's keys (`jurisdictions` R6, R52). A scheme's listed `codes` count as forms of exactly those codes. `department_code` reads `organisation` forms, which is where the first profile files its department codes. Heading matching tolerates letter spacing such as "Gove rnme nt" (M-M0c's defect) and an undecoded ligature such as "Classi\u0000cation" (B5).
- After K1526 and K1538 (B4, B6): the tests read the two profiles' own facts only, with no supplements. A caption ("SCHEDULE 1") and a dated line ("June 30, 2024") describe a table and are never a row. A table with no period carries `period_why`, because the first profile holds no form for a dated heading (B6).
- Fixtures (R13): pages of the four measured PDFs (ACFR FY2014, FY2019 and FY2024; budget book FY2023-25), as tier 2 supplies them, with tier 1's images and tier 1's own text of three FY2024 pages. Also the M-M1 200-figure CSV, and two cycles of Socrata line items (FY2013-15 `vmzx-e5fe`, FY2019-21 `m4jd-q2c4`). `test/fixtures/build.mjs` rebuilds the PDF fixtures, and `test/fixtures/README.md` gives each fixture's provenance. Tier 1 cannot decode FY2014 (no `/ToUnicode`), FY2019 (encrypted) or the budget book's page 137, which is why the fixtures use tier 2.

**Measured results.** Every measured ACFR table is usable: FY2014 pp. 46, 48, 148, 167, 169; FY2024 pp. 49, 51, 179, 204, 212, in both tiers; FY2019 pp. 50, 158. Each is at 94–100%, above M-55's shares. That includes FY2014's Balance Sheet (82% in M-55, 100% here) and S1 FY2024 (72% in M-55, 100% here: each subtotal row's ten figures sit in its ten columns, K1520). Budget book: pp. 196, 241, 283 and 148 are usable; p148 has its 9 chart-label pairs in `skipped`; p17 is `unread` with its image's rectangle. All 200 figures of M-M1 are found exactly as printed (182 of 200 on tier 1's text; the 18 missed are p137, which tier 1 cannot decode). FY2024 p50 (Statement of Activities) reads not usable at 60%: it prints blank cells with no dash, so this is stated, not forced.

**Deferred.**
- Header alignment: `columns` holds the header lines as written. Matching each header word to a cell's column cannot be read from either tier's text: both give one line per header row with single spaces, or one word per line. Deferred until a producer gives positions. Usability does not depend on it.
- J4 (open): R13's parenthesis names FY2014's Balance Sheet as a `span` case. Read correctly, that page has no span (its total row holds all 7 cells), so `span` is tested on a test-profile table. If BOB re-words R13, nothing in the code changes.

**Found in other modules** (reported).
- `jurisdictions` lacked the keys this module reads (J1, answered by K1513). Its first-profile budget headers then lacked `amount`, `period` and the Socrata spellings (J6, BLOCKED, cause: tests). K1538 fixed both, and the three tests that failed on them now pass.
- `docprofile` `readText` did not hand a type the supplied structure (J3). It is now R37 (K1520), not yet met. Until then a caller passes `ctx.supplied`, and `pipeline.assess` reads only `text`, so a budget table compared there is stated as a failed read.
- `office-readers` R30 was needed for column positions (J3). It is merged, and the tests use its cells.
- Generated artifacts: none stale. This module is in no bundle.

**Tests and checks run** (on 69146b3e98, after merging `tranche/T33` @ B6):
- `node --test budget-doctypes/test/`: tests 27, pass 27, fail 0. Every live id R1–R14 is named in a test's title.
- Layer tests: none (manifest). No service I provide is used by another module yet.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture budget-doctypes`: 17 product files, 20 relative imports; 0 failures. `coverage budget-doctypes`: 14 of 14 live requirement ids named by a test; 0 failures. `ownership budget-doctypes tranche/T33`: 18 files changed; 0 failures. The architecture, coverage and ownership checks were run with the paths and uses above written into a scratch copy of `modules.json`, not committed, because the module's row is empty until BOB writes it at merge.

Size (session_01KjUzvZtRDGcKxhimDx7Tpo): test runs 22, module lines 1740

## J1 · QUESTION

**The profile keys my R1, R7 and R12 read do not exist in `jurisdictions`' requirements.** budget-doctypes R1 and R12 take report titles, statement and schedule headings, fiscal-year forms and header words from "the view (`jurisdictions` vocabulary under this module's keys)", and R7 reads codes "by the forms of the view's classification scheme (`fund`, `org`, `program`, `project`, `account`)". But `jurisdictions` R6's `vocabulary` is a closed key set that names keys for doctypes, legistar-reader and roster-reader only, so a profile carrying budget keys is refused `UNKNOWN_VOCABULARY`. And R52's `classification_schemes` (`{scheme, label, kind, codes?, basis}`, kinds `fund organisation account object program function`) has no code form and no `project` kind.

**My best reading, which I am building to now** (a change to `jurisdictions`, so it is yours to route to its job, T33-2):
1. `vocabulary` gains five known keys, each `{pattern, basis}` unless noted:
   - `financial_report_titles`: the words a financial report names itself by (for example "Annual Comprehensive Financial Report", "Comprehensive Annual Financial Report");
   - `budget_book_titles`: the words a budget book names itself by (for example "Adopted Policy Budget", "Proposed Policy Budget");
   - `financial_headings`: statement and schedule headings (for example "Statement of Net Position", "Balance Sheet", "Budget and Actual", "Statistical Schedule", "Summary Table By Fund");
   - `fiscal_year_forms`: how a fiscal year is written in a title or column (for example `FY\s?\d{2,4}(-\d{2,4})?`, "Fiscal Year Ended June 30, 2024");
   - `budget_headers`: `{column, pattern, basis}`, `column` one of `fund`, `org`, `department`, `department_code`, `program`, `project`, `account`, `amount`, `period`, `phase`: the header words of a budget line-item table.
2. A `classification_schemes` entry may carry `forms: [{re, flags?}]` (a code's written forms, for example `FD_\d{4}` or `\d{4}` for a fund, `OR_\d{5}` for an org), and `kind` gains `project`. I read R7's `org` as R52's `organisation`.
3. The test profile carries each key; the first profile carries Oakland's (sources: `measures-T33/money-people.md` §1c, §3, §4, §7; `legistar-events.md` §3).
Place-free words stay in my code: "in thousands" and the other scale phrases, "Total", the dash and parenthesis conventions, and the chart-label shape (R12).

Until the jurisdictions job adds these keys, my tests pass these keys in `ctx.view` directly, built from the two profiles plus the keys above. Once the keys are in the profiles, the tests switch to `jurisdictions.combine`. This does not stop me: I am carrying on.

## J2 · QUESTION

**R13's "Statistical Schedule 1 of FY2024 giving its subtotal rows as `span`" rests on how the measurement counted, not on the page.** M-55 (`money-people.md` §7) read S1 at 72% with "subtotal rows span columns". It used `pdftotext -layout` and a tokenizer that counted a lone `$` as a token. S1's three "Total net position" rows print `$ (268,759) $ (155,462) …`, a `$` before each of the ten figures, so they looked like rows with too many cells. The page itself prints ten figures in each subtotal row, one per year column. The plane's text gives the same: tier 1 (`pdf-reader`) and tier 2 (`pdf-worker`, unpdf) both read every S1 row, subtotals included, at the modal 10 cells, and the table is 100% usable.

R3 marks a row `span: true` only "whose figures span columns". Marking S1's subtotals `span` would place no figure differently, and it would mislabel a row the page prints in its columns.

**My best reading, which I am building to:** R13's S1 clause is tested as "S1 FY2024 read usable, with each subtotal row's ten figures in its ten columns, and none marked `span`". R3's `span` is tested where a total row really holds a different number of cells: FY2014's Balance Sheet (page 48, tier 2) and a synthetic test-profile table. If you want the literal reading instead, it needs a requirement change: a total row marked `span` whatever its count.

## J3 · REPORT

Two things in other modules that this module's reading depends on. Neither blocks the job: I code against both as described, and my tests supply them.

1. **`docprofile` (`readText`, R19/R20): a content type is not given the supplied text's structure.** `readText` gives a type's `parse` the flattened `text` and `locate`, but not the I2 object itself. So a type cannot see a page that has no text layer (an empty page drops out of the flattened text), the `image_unread` markers, `pdf-reader`'s `images`, an OCR transcription, or a sheet's typed cells (`office-readers` R30). Without these, budget-doctypes R4 (`pages_unread`), R6 (image tables) and R7 (budget lines from cells) cannot be met through `readText`. My reading: the caller puts the I2 object on the context as `ctx.supplied`, and `readText`'s spread passes it on today. The cleaner fix is in docprofile: `readText` passes `supplied` (or its `pages`, `undetermined`, `images`, `sheets` and `ocr`) on the doctype ctx. `pipeline.assess` gives a type only `text`, so a budget table compared there reads no rows and is stated as a failed read (R9), never as an emptied table. That is for docprofile's job (T33-12) or a later entry.
2. **`office-readers` R30 (T33-10) is what makes R7 possible.** `csvEntry.text()` today joins a row's non-empty fields with tabs, so a row with an empty cell loses its column positions (measured on Socrata `m4jd-q2c4`: rows of 20 to 30 fields under a 30-column header). budget-doctypes reads lines only from R30's `cells`, and states a sheet with no cells as unread. Its tests build R30-shaped cells from the CSV fixtures until R30 merges, and they use `csvEntry.text()`'s own cells whenever present.

Also, for the OCR path (K1511 left the choice to this job): a transcription is carried as `supplied.ocr: [{page, engine, regions: [{text, source}]}]`, which is `ocr-worker`'s page answer plus the engine's name. It is read only for a budget book's image-only tables or pages. A financial report is never read from OCR (R4).

## J4 · QUESTION

**This replaces nothing; it corrects my J2 about K1520's new R13 wording.** In J2 I said a total row in FY2014's Balance Sheet (page 48) holds a different number of cells. That came from a reader defect I have since fixed. Tier 2 prints two figure-only lines on that page with no label beside them ("Due from Oakland Redevelopment Successor Agency" and "Accrued payroll": their labels are not in the text). My reader had appended those lines to the row above, giving a 14-cell row. Each is now a row of its own, with `label: null` and a `label_why`.

Read correctly, "TOTAL FUND BALANCES (DEFICITS)" holds its 7 figures in 7 columns, and page 48 is usable at 100%. Across every measured page I hold (FY2014 pp. 46, 48, 148, 167, 169; FY2019 pp. 50, 158; FY2024 pp. 49, 50, 51, 57, 179, 204, 212, in both tiers; the budget book pp. 137, 148, 196, 241, 283), no total row prints fewer cells than its table's columns.

**My best reading, which I am building to:** R13's parenthesis reads "R3's `span` tested on a test-profile table, where a total row holds a different number of cells". FY2014's Balance Sheet is tested as usable, with its total row in its columns and not marked `span`. If you want R13 re-worded to match, that is yours; nothing else changes.

## J5 · COMPLETE

T33-17 is applied: R1–R14, the whole module. The details are under "Completion" in this record.
- **Paths, for `modules.json`:** `["budget-doctypes/"]`; tests `["budget-doctypes/test/"]`. **Uses:** `jurisdictions` (added: the tests read both profiles through `combine`), `docprofile`, `office-readers`, `pdf-reader` (its output shape is read; nothing is imported).
- **Tests:** 27 pass, 0 fail. The checks pass with 0 failures: format, architecture, coverage (14 of 14 ids) and ownership, the last three run against a scratch copy of `modules.json` holding the paths above.
- **Measured:** every measured ACFR table is usable (FY2014, FY2019 and FY2024, in both tiers). Budget book pp. 196, 241, 283 and 148 are usable, with p148's chart labels skipped. p17 is unread. All 200 M-M1 figures are found as printed. Two Socrata cycles give their groupings per period.
- **Open:** J4. R13's parenthesis names FY2014 p48 as a span case, but read correctly that page has none. I test `span` on a test-profile table. If you re-word R13, no code changes.
- **Merge order:** after `jurisdictions` (K1513's keys; until then the tests add the keys to the views only where the profile lacks them). It does not wait on docprofile's R37: until R37 is met, a caller passes `ctx.supplied`.

## J6 · BLOCKED

**BLOCKED (cause: tests): the first profile's `budget_headers` cannot read the measured budget line-item tables.** I applied B4: merged `tranche/T33`, dropped every test-only supplement (the views are now `combine` of the two profiles, nothing added), and re-ran on the profiles' own facts. Result: 24 tests pass and 3 fail. All three fail on one fact in `jurisdictions`' first-profile data, not on this module's code:
- R1 "a budget line-item sheet is matched…"
- R7 "each budget line keyed on fund and org…"
- R13 "a budget line-item table of each of two cycles gives its departments' groupings"

**The fact.** `oakland-alameda`'s `budget_headers` hold `^Fund$`, `^Org$`, `^Program$`, `^Account$`, `^Project$` and `^Department$`, and **no `amount` column**. So R1's header test (a fund or org column *and* an amount column) can never pass on the first profile. Also, the measured tables are the Socrata line items (`money-people.md` §2; `legistar-events.md` §3), and their headers are written differently:
- FY2013-15 `vmzx-e5fe`: `budget, department, org_code, fund_code, project_code, program_code, account_code, amount`.
- FY2015-17 `urid-amga`: `budget_year_name, department, org, fund, project, program, account, amt`.
- FY2019-21 `m4jd-q2c4`: `department, fund, org, project, prog, acct`, and one amount column per period: `fy17_18_actuals_final_year`, `fy18_19_midcycle_adopted`, `fy19_20_biennial_working`, and the rest.

**What would make the three pass** (first-profile data, the jurisdictions job's): `budget_headers` gain
- `amount`: `^(?:amount|amt)$` and `^fy\d{2}_\d{2}_[a-z0-9_]+$`;
- `period`: `^(?:budget|budget_year_name)$`;
- `fund`, `org`, `program`, `project`, `account` widened to the `_code` forms and to `prog` and `acct`.

The org scheme's forms need the pre-2019 bare codes (`^\d{2,5}$`: FY2013-15 writes org `11`, `1111`). Without them those orgs are read with `form: null` and why, which R7 allows, so this is not a blocker.

**Not failing, but thinner readings on the first profile's facts** (for the same job if you wish):
- no form for a dated heading ("June 30, 2024"), so the ACFR tables' `period_as_written` is null;
- no heading for the budget book's "General Purpose Fund Revenue" or "Expenditures By Fund", so those titles are null with `title_why`;
- the "Citywide Classification Summary" pattern cannot match the text's broken "fi" ligature (`Classi\u0000cation`).

**Code changes in this round:**
- a scheme's listed `codes` now count as forms (the test profile's funds are a code list);
- `department_code` reads forms of kind `organisation` (the first profile files its `DP…` department codes there; R52 has no department kind);
- a caption ("SCHEDULE 1") and a dated line ("June 30, 2024") now describe a table and never become a row. Before, they were rows only when a view heading did not cover them.

The checks (format, architecture, coverage 14/14, ownership) all report 0 failures, run against a scratch `modules.json` as before. Pushed at 91925e1f86.

I need the jurisdictions CHANGE above, or your reading if you see it otherwise. The rest of the job is done, and I will re-run and post COMPLETE when the profile changes.
