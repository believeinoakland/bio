# filings (T47)

**Status** · session_01Hr4JrN5a2WxdtUg3TH5AVM · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Three readings for T47-90; I am building on each now and will change course if you rule otherwise.

1. **R54 "recorded on the `sent` entry".** `actions.actionCorrespond` (its R15–R16, code lines 1624–1934) takes no `reference`, and a filings job may not change actions. My reading: filings records `reference` on its own sending row (`filing_sendings`, the row that names the `sent` entry by `ord` and is named by it, R7's link both ways), validated before actions is called, and answers it in `filingRecordSent` and in `filingsFor`'s `sending.reference` (R13). The entry's own bytes in the action are unchanged. If you want the reference in the action's ledger itself, that is an `actions` requirement (a new optional key on `actionCorrespond`), and filings would pass it through. Refusal order: after `SECOND_APPROVAL_NEEDED`, before actions' refusals.
2. **R55 for `communicationPrepare`.** A communication reads no template and fills nothing from the record (R23). My reading: "the blanks the template names" means the blanks (`{{name}}`) the member's words name; each fill replaces its blank, labelled the member's; a blank no fill names stays as written (as today); any fill on a text assembled from the record (`document_infraction`, `chance_to_fix`) is `FILL_UNKNOWN_BLANK`. DEC-209's mockup posts period, form and cost limit to `communicationprepare`, which fits this reading. For `filingPrepare`, a fill may name any blank the template's or words' text names, and it takes the place of the record's value (labelled, source `fills:<preparer>`). A value that is not non-empty UTF-8 text of at most 65,536 bytes is `TEXT_UNWRITABLE` (naming its blank); fills that are not a map of names is `FILL_UNKNOWN_BLANK` with `blank: null`.
3. **Rows.** `SENT_REFERENCE_MALFORMED` is C-115.57 and `FILL_UNKNOWN_BLANK` C-115.58 (next free, in requirement order). Translations are mine (no words.json key holds them); they wait for T48's stamp under rule 5 (2).

Reports, not questions:
- (filing-templates) DEC-209 (3)'s period, form and cost limit cannot be `{{blanks}}` of a filing template: `FILING_BLANKS` (its R19) has no such names, so `blanksOf` refuses them (`TEMPLATE_BLANK_UNKNOWN`). The mockup's route through `communicationPrepare` works today; a CPRA *template* naming them needs R19 to grow.
- (action-producers) R25 "naming what is asked" has no field in R53's shape `{filing, action, project, approved_by, approved_at}`; it reads the action itself.

## J2 · COMPLETE

**Completion record, T47-90 (filings).**

**Entries applied** (readings confirmed by B3, K3122):
- **R53** `approvedUnsent({viewer})`: each draft or communication that is approved and not recorded sent, on an action the viewer may see and drawing on no project it may not see (K316, as R13 lists). Each item is `{filing, action, project, approved_by, approved_at}`; `project` is the action's, else the one the draft drew on. Oldest approval first, at most 200, with `truncated`. It writes nothing and has no refusal. It is a service only, with no op: action-producers R25 reads it in-process.
- **R54** `filingRecordSent` takes `reference` (one line, 1–100 code points, kept as given). It is stored on filings' sending row (new column `filing_sendings.reference`, the row linked both ways to the `sent` entry). It is answered by `filingRecordSent` and by `filingsFor`'s `sending.reference` (null when none was given). `SENT_REFERENCE_MALFORMED` (C-115.57) comes after `SECOND_APPROVAL_NEEDED` and before actions' refusals. The op `filingsent` reads `reference` from the body.
- **R55** `fills` on `filingPrepare` (any blank the template's or the words' text names; the member's value takes the record's place) and on `communicationPrepare` (the blanks the member's words name; the rest stay as written). Each filled blank has source `fills:<preparer>` and label `{kind: "member_fill", by, machine_work, says}`. `FILL_UNKNOWN_BLANK` (C-115.58) covers a name the text does not hold, or fills that are not a map; it is asked after R1's and R28's refusals and before the marks. A value that is not text gets `TEXT_UNWRITABLE`, naming the blank. The ops read `fills` from the body.
- **B2** (filing-templates R31's member-filled blanks): `#fill` now leaves a `FILING_BLANKS` name the record never fills unfilled, with why. Before this it would have thrown on `values[n]` undefined once `records`, `period`, `form` and `cost_limit` arrive. The test of R55 with one of them waits for your CHANGE when filing-templates merges.

**Read:** my requirements and all my code (index, checks, schema, outward, dates) and tests (fixture plus 14 files), whole, by me (about 564 KB). A helper read in full and digested, citing sections: actions R15–R16 and R43, filing-templates R2, R19, R25 and their exports, action-producers R25, the C-115 census, DEC-209 and DEC-212, layer 9's contract, and membership R43. No flaw found in my own module beyond the B2 fix.

**Deferred:** none.

**Other modules:** both notes in J1 (filing-templates, met by R31; action-producers R25's "what is asked" is read from the action). The rows C-115.57 and .58 are new and wait for T48's stamp (rule 5 (2)). The plane bundle is stale, as rule 5 (4) expects.

**Tests and checks:**
- filings `test/m/filings/`: 105 pass, 0 fail.
- Users, on tranche/T47 versus this branch, identical: escalation 85/0, action-plans 79/0, plan-work 45/0, action-producers 45/0, affordances 238/7, op-declarations 144/12, answer-envelope 25/8. The reds are pre-existing on the tranche; none is added.
- `checks/run.mjs`: format 0 failures; architecture 0 failures; coverage 36 failures, none of them filings (54/54); channels 0; ownership 0 (6 files).

Size (session_01Hr4JrN5a2WxdtUg3TH5AVM): test runs 9, module lines 3547
