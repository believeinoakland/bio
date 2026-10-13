# filings (T47)

**Status** · session_01Hr4JrN5a2WxdtUg3TH5AVM · depth 2 · WORKING · handled B3

## J1 · QUESTION

Three readings for T47-90; I am building on each now and will change course if you rule otherwise.

1. **R54 "recorded on the `sent` entry".** `actions.actionCorrespond` (its R15–R16, code lines 1624–1934) takes no `reference`, and a filings job may not change actions. My reading: filings records `reference` on its own sending row (`filing_sendings`, the row that names the `sent` entry by `ord` and is named by it, R7's link both ways), validated before actions is called, and answers it in `filingRecordSent` and in `filingsFor`'s `sending.reference` (R13). The entry's own bytes in the action are unchanged. If you want the reference in the action's ledger itself, that is an `actions` requirement (a new optional key on `actionCorrespond`), and filings would pass it through. Refusal order: after `SECOND_APPROVAL_NEEDED`, before actions' refusals.
2. **R55 for `communicationPrepare`.** A communication reads no template and fills nothing from the record (R23). My reading: "the blanks the template names" means the blanks (`{{name}}`) the member's words name; each fill replaces its blank, labelled the member's; a blank no fill names stays as written (as today); any fill on a text assembled from the record (`document_infraction`, `chance_to_fix`) is `FILL_UNKNOWN_BLANK`. DEC-209's mockup posts period, form and cost limit to `communicationprepare`, which fits this reading. For `filingPrepare`, a fill may name any blank the template's or words' text names, and it takes the place of the record's value (labelled, source `fills:<preparer>`). A value that is not non-empty UTF-8 text of at most 65,536 bytes is `TEXT_UNWRITABLE` (naming its blank); fills that are not a map of names is `FILL_UNKNOWN_BLANK` with `blank: null`.
3. **Rows.** `SENT_REFERENCE_MALFORMED` is C-115.57 and `FILL_UNKNOWN_BLANK` C-115.58 (next free, in requirement order). Translations are mine (no words.json key holds them); they wait for T48's stamp under rule 5 (2).

Reports, not questions:
- (filing-templates) DEC-209 (3)'s period, form and cost limit cannot be `{{blanks}}` of a filing template: `FILING_BLANKS` (its R19) has no such names, so `blanksOf` refuses them (`TEMPLATE_BLANK_UNKNOWN`). The mockup's route through `communicationPrepare` works today; a CPRA *template* naming them needs R19 to grow.
- (action-producers) R25 "naming what is asked" has no field in R53's shape `{filing, action, project, approved_by, approved_at}`; it reads the action itself.
