# filing-templates (T47)

**Status** · session_01Ake8QYuohMnTaZ46LkyKsD · depth 2 · WORKING · handled B2

## J1 · QUESTION

Where does the `@records-request` content go? The profile templates are R40/R81/R87 entries of an `action_kinds` kind in `jurisdictions/profiles/oakland-alameda.mjs`, a path of `jurisdictions` (L1, closed), which I may not write; and my R18 keeps template wording out of this module's code. R40 also requires `authored_by` and `approved_by` (two different names) and R87 (b) `name` and `sources`, which no one has yet (no writer, no reviewer, no approver named; N858).

My best reading, which I carry out unless you answer otherwise: I write the two templates ("Records request", purpose `initial`; "Records request with immediate disclosure", purpose `immediate_disclosure`, OMC § 2.20.230) in full in my job record, as profile entries ready to paste (R40/R81/R87 fields: `id`, `name`, `use: file`, `text` using only `FILING_BLANKS` names, `notes`, `sources` from DEC-209 (1)-(2), `authored_by`/`approved_by`/`reviews` left for the named people), each checked here by `blanksOf` and by R15's read with and without a professional review (test-only copies, the test profile's place names, not product data). Nothing is written into any profile, so no member is offered either (the hold, K3081). A later jurisdictions job places them once Bob names the writer and reviewer. If the period, form and cost limit need blanks that `FILING_BLANKS` lacks (R19 freezes it), I write those parts with the existing blanks and report the gap rather than add blanks.

The gap, concretely: DEC-209 (3) asks for the records, the period, the form and a cost limit as fields filling the template, and `filings` R55 fills only blanks the template names; `FILING_BLANKS` (R19) has `law`, `venue`, `counterparty_*`, `group`, `date` but no `records`, `period`, `form` or `cost_limit`. Adding them is a change to R19 (and `filings` reads the set). Unless you add them by CHANGE, the drafts write those parts as bracketed instructions for the member to replace by hand, and I report the four missing blanks.

## J2 · REPORT

Two findings in `filings`, from R30 and R31 (both met here, pushed at 362e7b3253).

(1) R31 turns four `filings` tests red until its T47-90 job (R55) merges. `filings` `#fill` (index.mjs:594) reads `values[n]` for every name in `FILING_BLANKS` and then `val.why`; for `records`, `period`, `form`, `cost_limit` it holds no value, so `val` is undefined and `filingPrepare` throws a TypeError, not an unfilled marker. Hit by prepare.test.mjs:106 and premise.test.mjs:21 (their texts name every key of `FILING_BLANKS`): 93 pass, 4 fail on this branch; 97/97 before R31. It is a latent flaw against `filings` R3 (an unfilled blank is a visible marker listed with why): any blank `FILING_BLANKS` holds and the record has no source for crashes. The fix is `filings`': treat a missing value as unfilled (`val ?? {why: ...}`), and R55's fills for the four. The merge order already puts filings after me; name these four as a red at my merge until T47-90.

(2) A third site spells C-125.4. `filings` index.mjs:685 answers `TEMPLATE_BLANK_UNKNOWN` itself for a member's own words (`blanksOf` there, then `templatesRow` adds my row), so the code is minted outside this module, against K231/K275 and R30's "no other site spells the code". My R30 test checks my module's files only, so it passes. To close it: this module exports the one function (today the private `#blankUnknown`) as a provided service, e.g. `blankUnknownRefusal(text, extra)` answering the refusal with its row or null, and `filings` calls it at :685. That changes a service I provide, so it needs R30 (and filings') wording first; I can do my half in this job on a CHANGE. Otherwise it waits for a later tranche and I list it as found.

Also: R30/R31 stale the plane bundle and `program.mjs` (rule 5 (4), regenerated at L9's close).
