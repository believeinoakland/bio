# legacy-tests (T8)

**Status** · session_01CbeAzHStemFoTD8gQHPzK6 · depth 2 · RUNNING until 2026-09-28T13:37:40Z (four worker families re-anchoring the old battery) · handled B1

## J1 · REPORT

The old battery on this tree (job/T8/legacy-tests = tranche/T8 @ a674760185 plus mail commits; every `bio-plane/test/*.test.mjs`, 369 suites, four at a time): **282 green, 87 red** (legacy-index measured 87 on its branch). Red suites, by name, with their print (`LOAD` = throws or fails to import before its count):

- acquire LOAD: SyntaxError: The requested module '../src/affordances.mjs' does not provide an export named 'ACQUIRE_GRADE_NOTE'
- action-loop LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'consequenceState'
- actionquote LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'QUOTE_CHECKS'
- affordances LOAD:   if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
- aicredential 95 pass, 2 fail
- airun 126 pass, 8 fail
- bias 135 pass, 3 fail
- bounds LOAD: stack: /home/user/bio/bio-plane/node_modules/@cloudflare/workerd-linux-64/bin/workerd@53fab6e /home/user/bio/bio-plane/node_modules/@cloudflare/worker
- capturerequests 132 pass, 4 fail
- case-opened 10 pass, 21 fail
- caseflip 58 passed, 1 failed
- caselifecycle 63 pass, 4 fail
- caseobject LOAD:     throw new Error(`ratifyCase: op=publish did not succeed: ${JSON.stringify(pub)}`);
- casepin 31 passed, 3 failed
- caseproduction 80 pass, 6 fail
- caseratify-conclusion LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'CASE_CONCLUSION_CHECKS'
- casesign 76 pass, 1 fail
- check-firing 98 pass, 2 fail
- citeproject-inquiry LOAD:   if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
- conformance 54 pass, 3 fail
- counterparty LOAD: TypeError: Cannot read properties of undefined (reading 'errors')
- d147-records-lifecycle LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'DUE_UNDETERMINED_SAYS'
- d149-governing-laws LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'GOVERNING_LAW_CHECKS'
- d150-statement-acknowledgement LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'STATEMENT_ACK_CHECKS'
- d311-roster-affordances 11 passed, 2 failed
- d334-monitor-credential 32 passed, 9 failed
- d448-review-copy-translation LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'REVIEW_COPY_CHECKS'
- d470-catalog-census 10 pass, 3 fail
- d484-refusal-translation 28 pass, 2 fail
- d507-statement-ack-translation LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'STATEMENT_ACK_CHECKS'
- d510-promoted-type 17 passed, 2 failed
- d526-refusal-order 29 passed, 2 failed
- d543-instant-precision 11 pass, 1 fail
- d547-revision-retype 0 passed, 1 failed
- daemon-token 54 passed, 2 failed
- deliverer 19 pass, 1 fail
- derivation-bounds 60 pass, 13 fail
- fence-e2e 49 pass, 6 fail
- frontier-chunk 12 passed, 3 failed
- gate-reads 110 pass, 5 fail
- hygiene 1332 pass, 3 fail
- identity-claims 32 pass, 1 fail
- m025-arm-anchor-witness 25 pass, 1 fail
- machine-attest 33 pass, 3 fail
- machine-fences LOAD:   if (!a.ok) throw new Error(`promote ${id}: ${JSON.stringify(a).slice(0, 700)}`);
- machinefences-dec49 66 pass, 7 fail
- meaning-bounds 89 pass, 7 fail
- mint-ledger 23 passed, 3 failed
- mk7-attribution 4 pass, 1 fail
- monitor-cadence LOAD: TypeError: Cannot read properties of null (reading '1')
- multicase LOAD: TypeError: Cannot read properties of undefined (reading 'check')
- observation-content 74 pass, 1 fail
- observation-log 129 pass, 2 fail
- observation-meaning 74 pass, 1 fail
- opaque-ids 32 passed, 3 failed
- operator-attest 10 pass, 8 fail
- plane-envelope LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'PUBLISHED_READ_CHECKS'
- project-sight 241 passed, 2 failed
- projection-noproject 25 pass, 1 fail
- provenance-chain 70 pass, 1 fail
- publish LOAD: Error: NOT NULL constraint failed: published_bundles.edition: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_NOTNULL)
- publishedcase LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'PUBLISHED_READ_CHECKS'
- ratify-authority 29 pass, 3 fail
- ratify-envelope 32 pass, 3 fail
- readingname 99 pass, 1 fail
- rec114-leg-earned 33 pass, 3 fail
- rec118-reeval-earned 10 pass, 19 fail
- rec195-laws-proposal LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'GOVERNING_LAWS_MAX'
- rec214-risk-tier-revision LOAD: SyntaxError: The requested module '../checks/bio-checks.mjs' does not provide an export named 'RISK_TIER_REVISION_CHECKS'
- rec217-draft-binding LOAD: TypeError: Cannot read properties of undefined (reading 'check')
- reevaluation LOAD: if (!pub1.ok) throw new Error(`publish 1: ${JSON.stringify(pub1)}`);
- refusal-wire 37 pass, 5 fail
- repair-reachability 45 pass, 1 fail
- reviewcopy 95 pass, 3 fail
- reviewcopy-inband 29 pass, 2 fail
- risk-tier LOAD:     if (r?.ok !== true) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
- run-conditions 56 pass, 3 fail
- rung-ladder 45 pass, 4 fail
- scheduler 39 passed, 12 failed
- shadowed-refusals LOAD:   if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 600)}`);
- signer-enrolment 30 pass, 2 fail
- skillsequencing 26 pass, 1 fail
- strengthpair 90 pass, 1 fail
- testify 49 pass, 1 fail
- testimonyaxis 38 pass, 1 fail
- versionnotice 39 pass, 2 fail
- versionstate 88 pass, 1 fail

civicos-ui: `node civicos-ui/check-refusal-codes.mjs` 146 failures; `check-semantics.mjs` the N68 docprofile red; `test/refusal-codes.test.mjs` 158 green; `bias-vocabulary` 74/7; `add-surface` does not load (`ACQUIRE_GRADE_NOTE` left affordances, N80); `several-cases-choice` 14/1; `case-frozen-pair` 24/0.

I now work the bullet's items, suite by suite, and measure against this.

## Progress (working notes; the COMPLETE entry supersedes)

- Baseline in J1: 87 of 369 old suites red; the guard 146 failures.
- Work split into four families, each worked by an agent inside this session, each suite owned by one: (1) the DEC-49 guard and the refusal/catalogue suites (with d470's 1.37.0/1.38.0 rows); (2) bounds, reads and walked ratchets; (3) layer 8's case, publication and review suites, the hunch-debt fixtures, `publish` §9; (4) layers 9–11: actions, scheduler, monitoring, affordances, rung-ladder (N177), civicos-ui's two surface suites.
- Next: fold each family's result, commit, re-run the whole battery, checks, COMPLETE.
