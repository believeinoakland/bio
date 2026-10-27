# T53's English-in-tests conversion entries, by module (PLANNING L45)

**Status** · READY (L56) · Entries for BOB · PLANNING #4, 2026-10-27, from K5565 (BOB's, TESTS-SWEEP S5): TESTS-SWEEP converts only the certain sites (class A literals and the 34 regexes equal to one key's whole value); the words check gains a recorded baseline and refuses English in any new or changed test; **every other site is a conversion entry of its module's T53 job, done in this tranche (P19), never deferred.** Counts from `tests-sweep/CENSUS.md` (lane/tests-sweep @ bae2b6df) and `tests-sweep/CENSUS-RX.md` (S5), read by each job at START for its own sites (its rows of both files; L37 R2's rule for a many-module file).

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.

**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).

| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 1 | setup-words | 0 / 0 | 0 / 1 / 1 (1) |  |
| 1 | record-grammar | 0 / 2 | 2 / 5 / 9 (3) | only this · sonnet-5-5 |
| 1 | jurisdictions | 0 / 6 | 2 / 4 / 3 (7) |  |
| 1 | civil-time | 0 / 0 | 4 / 1 / 1 (2) |  |
| 1 | calc-grammar | 0 / 0 | 4 / 1 / 1 (3) | only this · sonnet-5-5 |
| 1 | connection-grammar | 0 / 0 | 0 / 0 / 1 (1) |  |
| 1 | test-support | 0 / 0 | 0 / 1 / 4 (1) |  |
| 1 | runtime-limits | 0 / 0 | 0 / 3 / 2 (2) |  |
| 1 | signatures | 0 / 0 | 0 / 0 / 1 (1) |  |
| 1 | bundler | 0 / 2 | 8 / 63 / 77 (7) |  |
| 1 | court-citations | 0 / 0 | 1 / 2 / 3 (1) | only this · sonnet-5-5 |
| 1 | id-spaces | 0 / 0 | 29 / 7 / 14 (2) | only this · sonnet-5-5 |
| 1 | subresources | 0 / 0 | 0 / 2 / 2 (1) | only this · sonnet-5-5 |
| 1 | office-readers | 0 / 0 | 0 / 0 / 3 (3) |  |
| 1 | odf-reader | 0 / 0 | 1 / 9 / 4 (3) | only this · sonnet-5-5 |
| 1 | pdf-reader | 0 / 0 | 0 / 0 / 5 (1) | only this · haiku-5-5 |
| 1 | text-chain | 0 / 0 | 11 / 0 / 2 (4) |  |
| 1 | docprofile | 0 / 0 | 4 / 10 / 2 (4) | only this · sonnet-5-5 |
| 1 | doctypes | 0 / 1 | 1 / 9 / 9 (6) | only this · sonnet-5-5 |
| 1 | legistar-reader | 0 / 0 | 0 / 2 / 0 (1) | only this · sonnet-5-5 |
| 1 | roster-reader | 0 / 1 | 1 / 3 / 2 (2) | only this · sonnet-5-5 |
| 1 | court-doctypes | 0 / 1 | 3 / 22 / 6 (2) |  |
| 1 | budget-doctypes | 0 / 1 | 0 / 0 / 4 (1) | only this · sonnet-5-5 |
| 1 | image-codecs | 0 / 0 | 0 / 1 / 3 (2) | only this · sonnet-5-5 |
| 1 | pdf-pixels | 0 / 0 | 0 / 0 / 2 (2) | only this · haiku-5-5 |
| 1 | image-cover | 0 / 0 | 0 / 0 / 1 (1) |  |
| 1 | doc-clean | 0 / 0 | 0 / 1 / 6 (3) |  |
| 1 | pdf-worker | 0 / 0 | 0 / 2 / 0 (1) | only this · sonnet-5-5 |
| 1 | ocr-worker | 0 / 0 | 1 / 11 / 0 (1) | only this · sonnet-5-5 |
| 1 | sheet-worker | 0 / 0 | 0 / 1 / 1 (1) | only this · sonnet-5-5 |
| 1 | file-scanner | 0 / 1 | 0 / 1 / 2 (3) |  |
| 2 | member-roster | 0 / 0 | 8 / 1 / 4 (8) |  |
| 2 | record-core | 0 / 0 | 2 / 5 / 4 (8) |  |
| 2 | membership | 0 / 1 | 8 / 2 / 3 (8) |  |
| 2 | project-roster | 0 / 0 | 1 / 1 / 2 (3) | only this · sonnet-5-5 |
| 2 | ai-accounts | 0 / 0 | 12 / 7 / 4 (11) |  |
| 2 | credentials | 0 / 0 | 13 / 4 / 0 (9) |  |
| 2 | promotion | 0 / 2 | 3 / 15 / 13 (13) |  |
| 3 | provenance | 0 / 1 | 16 / 20 / 30 (13) |  |
| 3 | attestation | 0 / 0 | 8 / 1 / 0 (3) | only this · sonnet-5-5 |
| 3 | provenance-routes | 0 / 0 | 5 / 10 / 5 (6) | only this · sonnet-5-5 |
| 3 | capture-sources | 1 / 1 | 17 / 11 / 13 (7) | only this · sonnet-5-5 |
| 3 | acquisition | 0 / 0 | 9 / 18 / 28 (16) |  |
| 3 | capture | 0 / 0 | 11 / 3 / 10 (11) |  |
| 3 | doorbell | 0 / 0 | 3 / 1 / 0 (2) |  |
| 3 | file-safety | 0 / 0 | 5 / 1 / 0 (4) |  |
| 3 | sources | 0 / 0 | 1 / 0 / 1 (2) |  |
| 4 | calibration | 0 / 0 | 2 / 0 / 0 (1) | only this · haiku-5-5 |
| 4 | reading-pipeline | 0 / 0 | 69 / 12 / 30 (24) |  |
| 4 | extraction | 0 / 0 | 26 / 16 / 8 (20) |  |
| 4 | content | 0 / 0 | 24 / 7 / 20 (12) |  |
| 5 | entities | 0 / 2 | 7 / 18 / 19 (13) |  |
| 5 | events | 0 / 0 | 1 / 0 / 7 (4) |  |
| 5 | connections | 0 / 0 | 3 / 1 / 1 (4) |  |
| 5 | observation-log | 0 / 0 | 18 / 9 / 19 (7) |  |
| 5 | law-relations | 0 / 0 | 7 / 0 / 3 (3) | only this · haiku-5-5 |
| 5 | standards | 0 / 1 | 25 / 3 / 19 (14) | only this · sonnet-5-5 |
| 5 | progressions | 0 / 0 | 7 / 2 / 3 (5) | only this · sonnet-5-5 |
| 5 | money | 0 / 0 | 0 / 1 / 3 (3) |  |
| 5 | money-checks | 0 / 0 | 2 / 0 / 0 (1) | only this · haiku-5-5 |
| 5 | duties | 0 / 1 | 14 / 6 / 15 (10) |  |
| 5 | people | 0 / 1 | 6 / 2 / 12 (8) | only this · sonnet-5-5 |
| 5 | explore | 0 / 1 | 1 / 0 / 3 (4) |  |
| 5 | bias | 0 / 0 | 15 / 0 / 0 (5) | only this · haiku-5-5 |
| 5 | query-language | 0 / 1 | 1 / 5 / 9 (5) | only this · sonnet-5-5 |
| 5 | retrieval-browse | 0 / 1 | 4 / 9 / 8 (9) | only this · sonnet-5-5 |
| 5 | retrieval | 0 / 0 | 25 / 6 / 16 (13) | only this · sonnet-5-5 |
| 5 | calculations | 0 / 0 | 11 / 5 / 4 (10) |  |
| 5 | workbooks | 0 / 1 | 1 / 1 / 4 (3) | only this · sonnet-5-5 |
| 6 | inquiry-grammar | 0 / 0 | 5 / 13 / 20 (6) | only this · sonnet-5-5 |
| 6 | leg-earning | 2 / 0 | 15 / 5 / 5 (6) |  |
| 6 | inquiry | 0 / 0 | 16 / 31 / 31 (23) |  |
| 6 | hypotheses | 0 / 0 | 0 / 2 / 2 (3) | only this · sonnet-5-5 |
| 6 | steps | 0 / 0 | 0 / 0 / 1 (1) | only this · haiku-5-5 |
| 6 | citation | 0 / 0 | 1 / 3 / 7 (8) |  |
| 6 | basis-version-grammar | 0 / 0 | 0 / 0 / 3 (1) | only this · haiku-5-5 |
| 6 | basis-versions | 0 / 1 | 6 / 5 / 10 (10) |  |
| 6 | strength | 0 / 0 | 8 / 4 / 7 (6) |  |
| 6 | contradiction | 0 / 1 | 20 / 3 / 10 (11) | only this · sonnet-5-5 |
| 6 | run-rules | 0 / 0 | 27 / 52 / 7 (10) |  |
| 6 | ai-use | 1 / 0 | 0 / 0 / 1 (1) |  |
| 6 | ai-runs | 0 / 1 | 9 / 5 / 6 (11) |  |
| 6 | run-productions | 0 / 0 | 5 / 7 / 6 (3) | only this · sonnet-5-5 |
| 6 | capture-requests | 0 / 1 | 9 / 7 / 12 (9) | only this · sonnet-5-5 |
| 6 | reading-guides | 0 / 0 | 4 / 0 / 2 (3) |  |
| 6 | skills | 0 / 0 | 9 / 52 / 4 (14) | only this · sonnet-5-5 |
| 6 | question-explorer | 0 / 0 | 0 / 0 / 1 (1) | only this · haiku-5-5 |
| 6 | answers | 0 / 0 | 2 / 0 / 2 (3) | only this · haiku-5-5 |
| 6 | agent-model | 0 / 0 | 1 / 0 / 3 (1) |  |
| 6 | agent-runner | 0 / 0 | 0 / 2 / 1 (2) |  |
| 6 | agent-steps | 0 / 0 | 3 / 20 / 3 (9) |  |
| 6 | agent-worker | 0 / 0 | 9 / 43 / 57 (17) |  |
| 7 | intent | 0 / 0 | 12 / 0 / 8 (6) | only this · haiku-5-5 |
| 7 | investigation | 0 / 1 | 6 / 3 / 3 (4) |  |
| 7 | reevaluation | 0 / 1 | 28 / 8 / 11 (13) | only this · sonnet-5-5 |
| 8 | case-grammar | 1 / 2 | 6 / 13 / 10 (8) |  |
| 8 | corpus-export | 0 / 0 | 4 / 0 / 0 (3) |  |
| 8 | case-carriage | 0 / 0 | 2 / 0 / 2 (3) | only this · haiku-5-5 |
| 8 | case-tensions | 0 / 0 | 0 / 1 / 0 (1) | only this · sonnet-5-5 |
| 8 | publication | 0 / 0 | 6 / 6 / 4 (12) |  |
| 8 | publish-schedule | 0 / 0 | 0 / 0 / 1 (1) | only this · haiku-5-5 |
| 8 | docket | 0 / 0 | 0 / 3 / 7 (4) |  |
| 8 | public-read | 0 / 0 | 7 / 10 / 14 (14) |  |
| 8 | network-notices | 0 / 0 | 0 / 1 / 3 (4) |  |
| 8 | case-catalogue | 0 / 0 | 0 / 1 / 0 (1) |  |
| 8 | ratification | 0 / 0 | 17 / 24 / 12 (19) |  |
| 8 | case-checker | 0 / 0 | 0 / 23 / 4 (5) |  |
| 8 | case-import | 0 / 0 | 7 / 0 / 7 (6) |  |
| 8 | case-disclosures | 0 / 1 | 1 / 1 / 2 (3) |  |
| 8 | case-account | 0 / 0 | 3 / 0 / 0 (1) | only this · haiku-5-5 |
| 8 | case-inputs | 0 / 0 | 6 / 8 / 6 (8) |  |
| 8 | case-authoring | 1 / 1 | 19 / 7 / 13 (12) |  |
| 8 | review | 0 / 0 | 11 / 4 / 10 (8) |  |
| 8 | case-check | 0 / 0 | 0 / 0 / 1 (1) |  |
| 9 | conformance | 0 / 1 | 19 / 8 / 23 (14) |  |
| 9 | consequences | 0 / 0 | 8 / 2 / 7 (5) | only this · sonnet-5-5 |
| 9 | action-grammar | 0 / 0 | 7 / 11 / 6 (6) | only this · sonnet-5-5 |
| 9 | action-records | 0 / 2 | 7 / 5 / 6 (3) | only this · sonnet-5-5 |
| 9 | actions | 0 / 1 | 12 / 9 / 4 (9) |  |
| 9 | action-holds | 0 / 0 | 1 / 1 / 2 (2) | only this · sonnet-5-5 |
| 9 | action-clocks | 0 / 0 | 4 / 7 / 3 (5) |  |
| 9 | filing-templates | 0 / 2 | 0 / 0 / 1 (1) |  |
| 9 | filings | 0 / 1 | 2 / 1 / 3 (3) |  |
| 9 | escalation | 2 / 0 | 26 / 0 / 3 (12) | only this · haiku-5-5 |
| 9 | action-plans | 0 / 0 | 10 / 0 / 2 (8) |  |
| 9 | plan-work | 0 / 0 | 0 / 0 / 2 (2) | only this · haiku-5-5 |
| 10 | monitoring | 0 / 0 | 22 / 8 / 26 (13) |  |
| 10 | following | 0 / 0 | 14 / 1 / 3 (7) |  |
| 10 | link-sweep | 0 / 0 | 1 / 4 / 7 (4) | only this · sonnet-5-5 |
| 10 | scheduler | 0 / 0 | 0 / 0 / 1 (1) |  |
| 11 | wizard-scripts | 1 / 0 | 7 / 10 / 7 (9) |  |
| 11 | op-grades | 0 / 0 | 14 / 57 / 4 (17) |  |
| 11 | affordances | 0 / 0 | 4 / 3 / 4 (7) |  |
| 11 | tasks | 0 / 1 | 0 / 3 / 2 (2) |  |
| 11 | machinery-producers | 0 / 0 | 1 / 6 / 6 (3) | only this · sonnet-5-5 |
| 11 | action-producers | 0 / 0 | 3 / 3 / 4 (5) |  |
| 11 | queue-producers | 0 / 0 | 1 / 3 / 1 (3) |  |
| 11 | notice-producers | 0 / 0 | 3 / 0 / 7 (6) |  |
| 11 | queue | 0 / 1 | 4 / 40 / 2 (13) |  |
| 11 | translations | 0 / 0 | 4 / 2 / 0 (3) | only this · sonnet-5-5 |
| 11 | instance-setup | 0 / 1 | 11 / 15 / 19 (15) |  |
| 11 | op-declarations | 0 / 0 | 1 / 4 / 2 (5) |  |
| 11 | answer-envelope | 0 / 0 | 0 / 1 / 4 (3) |  |
| 11 | store-door | 0 / 0 | 2 / 1 / 1 (3) |  |
| 11 | signin-door | 0 / 0 | 0 / 1 / 0 (1) | only this · sonnet-5-5 |
| 11 | store-assembly | 0 / 0 | 0 / 12 / 12 (13) |  |
| 11 | store-request | 0 / 0 | 0 / 1 / 0 (1) |  |
| 11 | interface-shell | 0 / 0 | 0 / 8 / 6 (8) |  |
| 11 | screens-entry | 0 / 0 | 4 / 2 / 2 (5) |  |
| 11 | screens-wizards | 0 / 0 | 0 / 0 / 1 (1) |  |
| 11 | screens-settings | 0 / 0 | 3 / 1 / 1 (4) |  |
| 11 | screens-intake | 0 / 3 | 1 / 4 / 17 (10) |  |
| 11 | screens-daily | 0 / 5 | 2 / 1 / 6 (7) |  |
| 11 | screens-inquiry | 0 / 13 | 1 / 0 / 6 (6) |  |
| 11 | screens-investigate | 0 / 0 | 2 / 4 / 2 (7) |  |
| 11 | screens-publish | 0 / 4 | 2 / 7 / 5 (6) |  |
| 11 | screens-action | 1 / 8 | 0 / 1 / 6 (6) |  |
| 11 | control-plane | 0 / 0 | 2 / 6 / 4 (10) |  |
| 11 | plane | 0 / 0 | 1 / 1 / 12 (8) |  |
| 11 | installer-steps | 0 / 0 | 0 / 0 / 1 (1) |  |
| 11 | installer | 2 / 0 | 16 / 29 / 26 (9) |  |
| 11 | site | 0 / 0 | 0 / 3 / 2 (2) |  |
| 11 | stewards | 0 / 0 | 0 / 4 / 3 (1) |  |
| 11 | journey-check | 0 / 2 | 3 / 31 / 27 (10) |  |
| ? | ? | 1 / 2 | 0 / 1 / 12 (1) |  |
"?" rows (one literal and 13 regex sites whose files `census.mjs` could not place) go to the job that owns each file, named at START by `build/modules.json`'s paths (BOB's).

## For BOB (P17, lower-level)

1. **Decided (BOB #324, P7, P19):** ordinary jobs of their layer, models as marked. **Fifty-eight modules gain a job only for this entry**, so R1 grows by that many jobs (layers 1-11). Recommend they run as ordinary jobs of their layer, each with this one entry; a module whose sites are all C (test input) may close in one session with its reasoning. Alternative: a mechanical-pass job per layer under §5.10, which P7 allows only for mechanical work, and B sites are not mechanical.
2. Before R1 (1) in the plan: the words check's baseline (K5565 (2)) merges with TESTS-SWEEP's sweep, so no R1 job adds a file to it.
