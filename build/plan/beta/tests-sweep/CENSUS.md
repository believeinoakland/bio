# Census of English in tests — S2 (2026-10-27, branch lane/tests-sweep @ bae2b6df)

Tools: `census.mjs` (string literals that read as sentences, via the words check scanner), `classify.mjs` (A/B/C). Both read-only.

## Totals

- Sentence-like string literals in tracked test files: 9,780 in 1,593 files (loose upper bound: includes test input data).
- In assertion position (assert*, includes, has, match): 948. **A** 31 (13 files): text is already a `words.json` value; convert to the key, mechanical. **B** 135 (86 files): text exists only inline in a module product source; a test cannot assert a key until the module gives one (a T53 job, P7, rethink option A). **C** 782 (327 files): in neither; test data or echoed input, not product English.
- Regex assertions (`assert.match(x, /three or more words/)`), not in the figures above: 3,634 lines in 653 files (`rx-files.txt`). Their product source is not yet classified.
- The words check finds 0 of these today: its testcopy arm needs a whole-`en` copy or a 25-character substring of `words.json`.

## Class A and B by module (files)

| module | A files | B files |
|---|---|---|
| screens-inquiry | 0 | 13 |
| screens-action | 1 | 8 |
| jurisdictions | 0 | 6 |
| screens-daily | 0 | 5 |
| screens-publish | 0 | 4 |
| case-grammar | 1 | 2 |
| ? | 1 | 2 |
| screens-intake | 0 | 3 |
| capture-sources | 1 | 1 |
| case-authoring | 1 | 1 |
| escalation | 2 | 0 |
| leg-earning | 2 | 0 |
| installer | 2 | 0 |
| action-records | 0 | 2 |
| bundler | 0 | 2 |
| entities | 0 | 2 |
| filing-templates | 0 | 2 |
| journey-check | 0 | 2 |
| promotion | 0 | 2 |
| record-grammar | 0 | 2 |
| ai-use | 1 | 0 |
| wizard-scripts | 1 | 0 |
| queue | 0 | 1 |
| actions | 0 | 1 |
| ai-runs | 0 | 1 |
| basis-versions | 0 | 1 |
| capture-requests | 0 | 1 |
| case-disclosures | 0 | 1 |
| conformance | 0 | 1 |
| contradiction | 0 | 1 |
| duties | 0 | 1 |
| explore | 0 | 1 |
| filings | 0 | 1 |
| instance-setup | 0 | 1 |
| investigation | 0 | 1 |
| membership | 0 | 1 |
| people | 0 | 1 |
| provenance | 0 | 1 |
| query-language | 0 | 1 |
| reevaluation | 0 | 1 |
| retrieval-browse | 0 | 1 |
| standards | 0 | 1 |
| tasks | 0 | 1 |
| workbooks | 0 | 1 |
| budget-doctypes | 0 | 1 |
| court-doctypes | 0 | 1 |
| doctypes | 0 | 1 |
| file-scanner | 0 | 1 |
| roster-reader | 0 | 1 |
