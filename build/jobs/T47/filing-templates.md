# filing-templates (T47)

**Status** · session_01Ake8QYuohMnTaZ46LkyKsD · depth 2 · COMPLETE · handled B3


## Record (FILING-TEMPLATES #10)

**Read whole (P20):** `build/requirements/filing-templates.md`; the public parts of `jurisdictions` (R40, R81, R87 for the template shape), `record-grammar`, `record-core`, `membership`, `action-grammar` as my Uses name them; layer 9's contract; my plan entry T47-41 and BOB's START; every file of my code (`index.mjs`, `checks.mjs`, `blanks.mjs`, `schema.mjs`) and of my tests (`fixture.mjs` and the eight test files). Also DEC-209 (the sources) and `filings` index.mjs around `#fill` and `filingPrepare`, to find what my change touched.

**Entries applied**
- **R30** (N957, K231): C-125.4 `TEMPLATE_BLANK_UNKNOWN` is minted at one site, `#blankUnknown` (region `is-template-blank`), which both conditions call: R2's text check (`#textRefusal`, so R3, R4, R6) and R15's profile read (`#profileRefusal`). The row's `where` now names it; code, number, translation and each answer's detail and fields unmoved. `templateRead` no longer spells the code (it reads the refusal's `blank`). Tests: `r30.test.mjs` (both sites answer alike, with controls; the `where`, its region, and the code spelled nowhere else in the module). `t46-words.test.mjs`'s pin over the unchanged rows reads C-125.4 at its T46 `where`, so it still proves nothing else moved.
- **R31** (DEC-209 (3), K3120, BOB's B2): `FILING_BLANKS` gains `records`, `period`, `form`, `cost_limit` with their sentences, after the fifteen moved ones, which are unchanged. Tests: `r31.test.mjs`; R19's test now pins the fifteen first and in order.
- **The `@records-request` content** (N858, Bob K3060 D13, DEC-209, K3081; placement by BOB's B2, K3120): both templates are written below as entries ready to place in the Oakland profile's `records_request` kind. They are written into no profile, so no member is offered either (the hold). Placing them needs a `jurisdictions` job once Bob names the writer, a professional reviews them, and someone other than the writer approves them.

**Checked on copies** (scratch only: no product file or test holds this wording, R18). Each text's blanks are all in `FILING_BLANKS` (`counterparty_role`, `group`, `records`, `period`, `form`, `cost_limit`, `date`); 1,258 and 1,454 bytes. On a copy of the Oakland profile carrying them as they stand (attribution blank): `jurisdictions.validate` refuses them (`authored_by`, `approved_by`, `approved_at`), so they cannot be placed unattributed, and `offeredVersion` answers `TEMPLATE_NOT_REVIEWED` with lacks `writer`, `professional_review`, `approver` for each. The control, the same copy with stand-in names and a stand-in professional `no_concerns` review: validates; both are offered; `@records-request` and `@records-request-with-immediate-disclosure` resolve to them.

**What the professional review should check** (from DEC-209 and my own reading): whether OMC § 2.20.230 requires the heading "Immediate Disclosure Request" and how it lets the three days be extended (DEC-209 (6) did not confirm either); that § 7922.540's wording (names and titles of those responsible) is cited as the statute says; that the 10-day and 14-day sentences match § 7922.535. There is no blank for the signing member's name: the text ends with the group and the date. If the member's name is wanted, that is another blank.

### The templates

#### Records request (`TPL-oakland-records-request`, purpose `initial`)

```js
{
  id: "TPL-oakland-records-request",
  version: 1,
  purpose: "initial",
  name: "Records request",
  use: "file",
  text: "To the {{counterparty_role}}:\n\nUnder the California Public Records Act (Government Code § 7920.000 and following), {{group}} requests copies of these public records:\n\n{{records}}\n\nThe records requested cover this period: {{period}}.\n\nWhere a record exists in electronic form, please provide it electronically, as {{form}} if you hold it that way, or otherwise in an electronic format you already hold (Government Code § 7922.570).\n\nIf any part of a record is exempt from disclosure, please release every reasonably segregable part that is not (§ 7922.525(b)), and give any refusal in writing, with the names and titles of the people responsible for it (§ 7922.540).\n\nIf this request is unclear, or would return far more than is needed, please contact us so we can focus it together (§ 7922.600).\n\nPlease tell us within 10 days whether you hold disclosable records and when they will be available (§ 7922.535(a)). Any extension needs written notice and may not exceed 14 days (§ 7922.535(b), (c)).\n\nWe ask to pay only the direct cost of duplication (§ 7922.530(a)), and for electronic records only the direct cost of producing the copy (§ 7922.575). If the cost will be more than {{cost_limit}}, please tell us before going ahead.\n\n{{group}}\n{{date}}",
  notes: "Describe the records, not why you want them: the law does not let the office limit access because of why a request is made (§ 7921.300), and the City's portal shows this text to anyone. Sent through the portal, add contact details to receive updates and the records; note the portal's request number when you send it.",
  sources: [
    {
      citation: "Cal. Gov. Code § 7920.000 and following (California Public Records Act), via FindLaw, current as of 1 January 2026"
    },
    {
      citation: "Cal. Gov. Code § 7921.300 (no limit on access because of a request's purpose)"
    },
    {
      citation: "Cal. Gov. Code § 7922.525(b) (the reasonably segregable rest released)"
    },
    {
      citation: "Cal. Gov. Code § 7922.530(a), (b) (direct cost of duplication; own equipment)"
    },
    {
      citation: "Cal. Gov. Code § 7922.535(a)-(c) (answer within 10 days; extension by written notice, at most 14 days)"
    },
    {
      citation: "Cal. Gov. Code § 7922.540 (a refusal in writing, naming those responsible)"
    },
    {
      citation: "Cal. Gov. Code § 7922.570 (electronic records in an electronic format the agency holds)"
    },
    {
      citation: "Cal. Gov. Code § 7922.575 (cost of producing an electronic copy)"
    },
    {
      citation: "Cal. Gov. Code § 7922.600 (help to focus a request)"
    },
    {
      citation: "Oakland City public records request portal, oaklandca.nextrequest.com, read 13 October 2026 (request text shown to anyone)"
    }
  ],
  authored_by: "",
  contributors: [],
  reviews: [],
  approved_by: "",
  approved_at: "",
  basis: "K3081"
}
```

The text as a member reads it:

> To the {{counterparty_role}}:
> 
> Under the California Public Records Act (Government Code § 7920.000 and following), {{group}} requests copies of these public records:
> 
> {{records}}
> 
> The records requested cover this period: {{period}}.
> 
> Where a record exists in electronic form, please provide it electronically, as {{form}} if you hold it that way, or otherwise in an electronic format you already hold (Government Code § 7922.570).
> 
> If any part of a record is exempt from disclosure, please release every reasonably segregable part that is not (§ 7922.525(b)), and give any refusal in writing, with the names and titles of the people responsible for it (§ 7922.540).
> 
> If this request is unclear, or would return far more than is needed, please contact us so we can focus it together (§ 7922.600).
> 
> Please tell us within 10 days whether you hold disclosable records and when they will be available (§ 7922.535(a)). Any extension needs written notice and may not exceed 14 days (§ 7922.535(b), (c)).
> 
> We ask to pay only the direct cost of duplication (§ 7922.530(a)), and for electronic records only the direct cost of producing the copy (§ 7922.575). If the cost will be more than {{cost_limit}}, please tell us before going ahead.
> 
> {{group}}
> {{date}}

#### Records request with immediate disclosure (`TPL-oakland-records-request-immediate`, purpose `immediate_disclosure`)

```js
{
  id: "TPL-oakland-records-request-immediate",
  version: 1,
  purpose: "immediate_disclosure",
  name: "Records request with immediate disclosure",
  use: "file",
  text: "IMMEDIATE DISCLOSURE REQUEST\n\nTo the {{counterparty_role}}:\n\nThis is an Immediate Disclosure Request under the Oakland Sunshine Ordinance (Oakland Municipal Code § 2.20.230). Under it and the California Public Records Act (Government Code § 7920.000 and following), {{group}} requests copies of these public records:\n\n{{records}}\n\nThe records requested cover this period: {{period}}.\n\nWhere a record exists in electronic form, please provide it electronically, as {{form}} if you hold it that way, or otherwise in an electronic format you already hold (Government Code § 7922.570).\n\nIf any part of a record is exempt from disclosure, please release every reasonably segregable part that is not (§ 7922.525(b)), and give any refusal in writing, with the names and titles of the people responsible for it (§ 7922.540).\n\nIf this request is unclear, or would return far more than is needed, please contact us so we can focus it together (§ 7922.600).\n\nAs an Immediate Disclosure Request, please answer within three business days (Oakland Municipal Code § 2.20.230). If any part cannot be answered in that time, please say which and when, as the California Public Records Act allows (§ 7922.535).\n\nWe ask to pay only the direct cost of duplication (§ 7922.530(a)), and for electronic records only the direct cost of producing the copy (§ 7922.575). If the cost will be more than {{cost_limit}}, please tell us before going ahead.\n\n{{group}}\n{{date}}",
  notes: "Describe the records, not why you want them: the law does not let the office limit access because of why a request is made (§ 7921.300), and the City's portal shows this text to anyone. Sent through the portal, add contact details to receive updates and the records; note the portal's request number when you send it. For the reviewer: DEC-209 (6) did not confirm from the ordinance's text whether the heading \"Immediate Disclosure Request\" is required, or the ordinance's own words for extending the three days.",
  sources: [
    {
      citation: "Cal. Gov. Code § 7920.000 and following (California Public Records Act), via FindLaw, current as of 1 January 2026"
    },
    {
      citation: "Cal. Gov. Code § 7921.300 (no limit on access because of a request's purpose)"
    },
    {
      citation: "Cal. Gov. Code § 7922.525(b) (the reasonably segregable rest released)"
    },
    {
      citation: "Cal. Gov. Code § 7922.530(a), (b) (direct cost of duplication; own equipment)"
    },
    {
      citation: "Cal. Gov. Code § 7922.535(a)-(c) (answer within 10 days; extension by written notice, at most 14 days)"
    },
    {
      citation: "Cal. Gov. Code § 7922.540 (a refusal in writing, naming those responsible)"
    },
    {
      citation: "Cal. Gov. Code § 7922.570 (electronic records in an electronic format the agency holds)"
    },
    {
      citation: "Cal. Gov. Code § 7922.575 (cost of producing an electronic copy)"
    },
    {
      citation: "Cal. Gov. Code § 7922.600 (help to focus a request)"
    },
    {
      citation: "Oakland City public records request portal, oaklandca.nextrequest.com, read 13 October 2026 (request text shown to anyone)"
    },
    {
      citation: "Oakland Municipal Code § 2.20.230 (Sunshine Ordinance: Immediate Disclosure Request, three business days)"
    }
  ],
  authored_by: "",
  contributors: [],
  reviews: [],
  approved_by: "",
  approved_at: "",
  basis: "K3081"
}
```

The text as a member reads it:

> IMMEDIATE DISCLOSURE REQUEST
> 
> To the {{counterparty_role}}:
> 
> This is an Immediate Disclosure Request under the Oakland Sunshine Ordinance (Oakland Municipal Code § 2.20.230). Under it and the California Public Records Act (Government Code § 7920.000 and following), {{group}} requests copies of these public records:
> 
> {{records}}
> 
> The records requested cover this period: {{period}}.
> 
> Where a record exists in electronic form, please provide it electronically, as {{form}} if you hold it that way, or otherwise in an electronic format you already hold (Government Code § 7922.570).
> 
> If any part of a record is exempt from disclosure, please release every reasonably segregable part that is not (§ 7922.525(b)), and give any refusal in writing, with the names and titles of the people responsible for it (§ 7922.540).
> 
> If this request is unclear, or would return far more than is needed, please contact us so we can focus it together (§ 7922.600).
> 
> As an Immediate Disclosure Request, please answer within three business days (Oakland Municipal Code § 2.20.230). If any part cannot be answered in that time, please say which and when, as the California Public Records Act allows (§ 7922.535).
> 
> We ask to pay only the direct cost of duplication (§ 7922.530(a)), and for electronic records only the direct cost of producing the copy (§ 7922.575). If the cost will be more than {{cost_limit}}, please tell us before going ahead.
> 
> {{group}}
> {{date}}

- **R32** (B3 CHANGE, K3124): the one site is provided: `blankUnknownRefusal(text, extra)` (was the private `#blankUnknown`), exported; R2's check and R15's read answer through it; the row's `where` names it; `filings` R56 calls it. Tests: `r32.test.mjs` (the answer naming the blank, extra merged; control null; a draft's refusal equal to the export's); `r30.test.mjs` re-pointed to the export.

**Deferred:** none of my own.

**Found in another module** (reported as J2):
1. `filings` `#fill` (index.mjs:594) throws instead of leaving an unfilled marker when a blank in `FILING_BLANKS` has no value in the record (against `filings` R3). R31 makes it reachable: `filings` tests 93 pass, 4 fail with R31 (97/97 before). The fix is `filings`' (T47-90, R55).
2. `filings` index.mjs:685 spells C-125.4 `TEMPLATE_BLANK_UNKNOWN` itself for a member's own words: a third site, against K231/K275. Taken by BOB (K3124): R32 here, `filings` R56 calls it.
3. Generated artifacts made stale: the plane bundle and `program.mjs` (rule 5 (4)).

**Tests and checks**
- `node --test bio-plane/test/m/filing-templates/`: after R32, tests 72, pass 72, fail 0.
- Users (P11): filings 93/97 (the 4 above, red only with R31); wizard-scripts 82/82; action-producers 45/45; affordances 238/245, answer-envelope 25/33, control-plane 235/242, plane 218/223: the same failures on the tranche without my change (inherited, rule 5).
- `format`: 0 failures. `architecture` (filing-templates): 0 failures. `coverage` (filing-templates): 32 of 32 live ids named by a test, 0 failures. `ownership` (tranche/T47): 8 files, 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0 (3,106 files), channels 0; coverage 36 failures, all other modules' ids not yet met in T47 (rule 5 (1)), none of mine.

Size (session_01Ake8QYuohMnTaZ46LkyKsD): test runs 9, module lines 1884

## J1 · QUESTION

Where does the `@records-request` content go? The profile templates are R40/R81/R87 entries of an `action_kinds` kind in `jurisdictions/profiles/oakland-alameda.mjs`, a path of `jurisdictions` (L1, closed), which I may not write; and my R18 keeps template wording out of this module's code. R40 also requires `authored_by` and `approved_by` (two different names) and R87 (b) `name` and `sources`, which no one has yet (no writer, no reviewer, no approver named; N858).

My best reading, which I carry out unless you answer otherwise: I write the two templates ("Records request", purpose `initial`; "Records request with immediate disclosure", purpose `immediate_disclosure`, OMC § 2.20.230) in full in my job record, as profile entries ready to paste (R40/R81/R87 fields: `id`, `name`, `use: file`, `text` using only `FILING_BLANKS` names, `notes`, `sources` from DEC-209 (1)-(2), `authored_by`/`approved_by`/`reviews` left for the named people), each checked here by `blanksOf` and by R15's read with and without a professional review (test-only copies, the test profile's place names, not product data). Nothing is written into any profile, so no member is offered either (the hold, K3081). A later jurisdictions job places them once Bob names the writer and reviewer. If the period, form and cost limit need blanks that `FILING_BLANKS` lacks (R19 freezes it), I write those parts with the existing blanks and report the gap rather than add blanks.

The gap, concretely: DEC-209 (3) asks for the records, the period, the form and a cost limit as fields filling the template, and `filings` R55 fills only blanks the template names; `FILING_BLANKS` (R19) has `law`, `venue`, `counterparty_*`, `group`, `date` but no `records`, `period`, `form` or `cost_limit`. Adding them is a change to R19 (and `filings` reads the set). Unless you add them by CHANGE, the drafts write those parts as bracketed instructions for the member to replace by hand, and I report the four missing blanks.

## J2 · REPORT

Two findings in `filings`, from R30 and R31 (both met here, pushed at 362e7b3253).

(1) R31 turns four `filings` tests red until its T47-90 job (R55) merges. `filings` `#fill` (index.mjs:594) reads `values[n]` for every name in `FILING_BLANKS` and then `val.why`; for `records`, `period`, `form`, `cost_limit` it holds no value, so `val` is undefined and `filingPrepare` throws a TypeError, not an unfilled marker. Hit by prepare.test.mjs:106 and premise.test.mjs:21 (their texts name every key of `FILING_BLANKS`): 93 pass, 4 fail on this branch; 97/97 before R31. It is a latent flaw against `filings` R3 (an unfilled blank is a visible marker listed with why): any blank `FILING_BLANKS` holds and the record has no source for crashes. The fix is `filings`': treat a missing value as unfilled (`val ?? {why: ...}`), and R55's fills for the four. The merge order already puts filings after me; name these four as a red at my merge until T47-90.

(2) A third site spells C-125.4. `filings` index.mjs:685 answers `TEMPLATE_BLANK_UNKNOWN` itself for a member's own words (`blanksOf` there, then `templatesRow` adds my row), so the code is minted outside this module, against K231/K275 and R30's "no other site spells the code". My R30 test checks my module's files only, so it passes. To close it: this module exports the one function (today the private `#blankUnknown`) as a provided service, e.g. `blankUnknownRefusal(text, extra)` answering the refusal with its row or null, and `filings` calls it at :685. That changes a service I provide, so it needs R30 (and filings') wording first; I can do my half in this job on a CHANGE. Otherwise it waits for a later tranche and I list it as found.

Also: R30/R31 stale the plane bundle and `program.mjs` (rule 5 (4), regenerated at L9's close).

## J3 · COMPLETE

T47-41 complete: R30 (C-125.4 at one site, #blankUnknown) and R31 (records, period, form, cost_limit) met and tested; filing-templates 70/70; format, architecture, coverage (31/31), ownership 0 failures; checks/run.mjs: architecture 0, coverage reds all other modules' (rule 5 (1)). The two records-request templates are written whole in my record as Oakland profile entries ready to place, checked on copies, placed in no profile (held, K3081). At my merge: filings' 4 tests go red until T47-90 (J2 (1)). Still open for you: J2 (2), the third C-125.4 site in filings. Record: build/jobs/T47/filing-templates.md.

## J4 · COMPLETE · re B3

B3 applied: R32 met. blankUnknownRefusal(text, extra) exported as C-125.4's one site (region is-template-blank, the row's where names it); R2's check and R15's read answer through it. r32.test.mjs with its control; r30.test.mjs re-pointed. filing-templates 72/72; format, architecture, coverage (32/32), ownership 0 failures. filings still 93/97 here (the #fill TypeError, fixed on its own branch per B3). Record updated.
