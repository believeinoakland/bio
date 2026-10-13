# filing-templates (T47)

**Status** · session_01Ake8QYuohMnTaZ46LkyKsD · depth 2 · WORKING · handled B1

## J1 · QUESTION

Where does the `@records-request` content go? The profile templates are R40/R81/R87 entries of an `action_kinds` kind in `jurisdictions/profiles/oakland-alameda.mjs`, a path of `jurisdictions` (L1, closed), which I may not write; and my R18 keeps template wording out of this module's code. R40 also requires `authored_by` and `approved_by` (two different names) and R87 (b) `name` and `sources`, which no one has yet (no writer, no reviewer, no approver named; N858).

My best reading, which I carry out unless you answer otherwise: I write the two templates ("Records request", purpose `initial`; "Records request with immediate disclosure", purpose `immediate_disclosure`, OMC § 2.20.230) in full in my job record, as profile entries ready to paste (R40/R81/R87 fields: `id`, `name`, `use: file`, `text` using only `FILING_BLANKS` names, `notes`, `sources` from DEC-209 (1)-(2), `authored_by`/`approved_by`/`reviews` left for the named people), each checked here by `blanksOf` and by R15's read with and without a professional review (test-only copies, the test profile's place names, not product data). Nothing is written into any profile, so no member is offered either (the hold, K3081). A later jurisdictions job places them once Bob names the writer and reviewer. If the period, form and cost limit need blanks that `FILING_BLANKS` lacks (R19 freezes it), I write those parts with the existing blanks and report the gap rather than add blanks.

The gap, concretely: DEC-209 (3) asks for the records, the period, the form and a cost limit as fields filling the template, and `filings` R55 fills only blanks the template names; `FILING_BLANKS` (R19) has `law`, `venue`, `counterparty_*`, `group`, `date` but no `records`, `period`, `form` or `cost_limit`. Adding them is a change to R19 (and `filings` reads the set). Unless you add them by CHANGE, the drafts write those parts as bracketed instructions for the member to replace by hand, and I report the four missing blanks.
