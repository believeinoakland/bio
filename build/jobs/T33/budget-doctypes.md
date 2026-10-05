# budget-doctypes (T33)

**Status** · session_01KjUzvZtRDGcKxhimDx7Tpo · depth 2 · WORKING · handled B1

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
