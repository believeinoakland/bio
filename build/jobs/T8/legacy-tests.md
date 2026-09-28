# legacy-tests (T8)

**Status** · session_01CbeAzHStemFoTD8gQHPzK6 · depth 2 · RUNNING until 2026-09-28T14:09:47Z (final old battery, 369 suites) · handled B2

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
- Family 4 (layers 9–11), commit 682a122808: action-loop LOAD → 79/3, actionquote LOAD → 46/2, rec195 LOAD → 38/2 (all five reds the escalation purge, J2); counterparty LOAD → 47/0, d147 LOAD → 66/0, d149 LOAD → 48/0, rec214 LOAD → 52/0, risk-tier LOAD → 90/0 (imports from `src/actions/`, kinds actions offers, R9's office counterparty; count arms retired for `test/m/actions/read.test.mjs` "R37 R36 …" and `test/m/record-core/record-core.test.mjs` "R22 R23 R24 R46 …"; d147 drives the new C-94.12); affordances LOAD → 100/0 (vocabulary pins on actions' objects, fixture `records_request`, N177's `CAPTURE_ACTS.map(decorate)` scan retired naming `test/m/affordances/` plane.test.mjs R21 and services.test.mjs R11); rung-ladder 45/4 → 48/0 (N177's two `decorateAct` scans retired naming services.test.mjs R11 and plane.test.mjs R24; the NO UNBACKED CLAIM and ROUTES scans read T8's op maps and follow module-level refusal helpers); acquire LOAD → 97/0 (N80); d311 11/2 → 20/1 (N45, affordances); aicredential 95/2 → 97/0; airun 126/8 → 134/0 (ARM S1–S6 on `src/scheduler/index.mjs`, 15 consumers from its print); scheduler 39/12 → 47/4 (block 4 on the module; FL-4's four stay); monitor-cadence LOAD → 67/0; d334 32/9 → 41/0; daemon-token 54/2 → 56/0; gathering's control text; civicos-ui bias-vocabulary 74/7 → 75/6 and add-surface LOAD → fails at the first new type (both: `app.html` lacks the six new types' entries, legacy-ui, ruling 4). Controls re-anchored on copies: `scheduler.control.mjs`, `d334-monitor-credential.control.sh`; `drive.control.mjs` already matched.

## J2 · REPORT

BEHAVIOUR CHANGE on the plane (product red, not re-pinned), owner **escalation** (or legacy-store's construction, N216): record-core's purge fails `no such table: escalations`, so every `op=purge` (a bundle's and the whole store's) answers `ok:false`. `escalationOf()` declares its five tables to purge (`src/escalation/index.mjs`), but its `migrate()` (line 136, `migrateEscalation`) is called by nobody: neither the factory nor `store.mjs`' boot. Monitoring constructs escalation lazily (`src/monitoring/index.mjs` 337), so the declaration reaches purge and the tables do not exist. Measured: action-loop 79/3, actionquote 46/2, rec195-laws-proposal 38/2, all five reds this purge; on a scratch copy with `migrate()` called in `escalationOf`, 81/0, 49/0, 40/0. Fix: escalation migrates at construction (as other layer-9 modules do), or legacy-store does before the declaration is read.

Also (for next plan): **instance-setup**'s `setup.mjs` `mdFor` writes a named counterparty as `{state: named, name}`, which actions R9 refuses on a creation (risk-tier's page-writer fixture now passes an undetermined counterparty).

Layers 9–11 family committed (682a122808): 23 files; the rest of the job continues.
- Family 2 (bounds, reads, ratchets), commit 850582d379: gate-reads 110/5 → 133/2 (intent's `aspirationcontacts`, `pursuit`, `intentproposals` and reevaluation's `reevaluationnotices` driven on a hidden project and classified GATED, N199/N200; publication's reads re-pointed); bounds crashed → 210/3 (fixture's action kind and counterparty; a T8 re-inline pass, new helper `t8-extracted.mjs` since `t5-extracted.mjs` is shared with civicos-ui; roster 58 → 69 from print, intent's four caps driven, `navchanges`/`reevaluationnotices` driven by `test/m/capture` N187's test and `test/m/reevaluation/sweep.test.mjs`); derivation-bounds 60/13 → 69/4 (census 196 → 203 from print; nine arrivals reported, not taken); meaning-bounds 89/7 → 92/4; hygiene 1332/3 → 1346/1; identity-claims 32/1 → 33/0; project-sight 241/2 → 248/1; capturerequests 135/1 → 140/0 (block 8a drives CAPTURE_FETCH_FAILED and CAPTURE_REQUEST_NOT_RETRYABLE); observation-log 129/2 → 130/1 (K6d lease past the wall clock); observation-meaning 74/1 → 75/0; m025-arm-anchor-witness 25/1 (8 → 7 dead anchors); `m025-arm-census.mjs`' `newgroup/test/` text (INSTALLER #1 J2.3). Unchanged: airuns 54/0, overdue-successor 22/0 (N179 green), run-conditions 56/3, observation-content 74/1, skillsequencing 26/1, strengthpair 90/1. No arm retired.

## J3 · REPORT

BEHAVIOUR CHANGE (product red, left unclassified in gate-reads, not re-pinned), owner **monitoring** (R32; hidden projects): `op=monitoring` (`monitoring()`, `src/monitoring/index.mjs` 1684) filters each row by sight of its `bundle` only, but a row carries `versions` and `newer_unmonitored` from `schedule()`, which can name a hidden project's material; driven in gate-reads on carol's hidden project, dave (not a member) received its id. Each field naming another bundle wants the viewer's sight too (as `op=versionnotice` withholds).

Also for next plan (the rest at COMPLETE): intent's row limits `MEASURE_MAX`, `DEPARTURES_MAX`, `SET_ASIDE_MAX` are driven by no test, intent's own included (bounds PIN); new unbounded reads actions `pendingClocks`, `project` and publication `#promoteNamedEdges` (derivation-bounds); meaning-bounds' `caseratify` RETURN-DELEGATE cannot see publication's `commitCaseEdition` through the held service (the reader wants redesign; publication).
- Family 1 (guard, refusal and catalogue suites), commit 4c0be5bbc0: the guard 146 → 126 failures (arm C reads a function-local refusal alias and a conditional code; floors re-pinned from its print, each checked by name against the T8 opening tree; `LIFECYCLE_TEXT_UNWRITABLE` leaves MULTI_SITE_CANDIDATES, consolidated by actions; the 126 are every one another module's, below); `civicos-ui/test/refusal-codes.test.mjs` 158 → 167/0 (ARM 16a–d drive the new spellings both ways); refusal-wire 37/5 → 41/1; machinefences-dec49 66/7 → 88/1; machine-fences threw → 91/1 (earned connection, `records_request`, block (xvi) drives C-32.20); shadowed-refusals threw → 45/0; fence-e2e 49/6 → 55/0; check-firing 98/2 → 100/0 and conformance 54/3 → 57/0 (C-2.10's action arms and C-11.1 judged with actions' `checkActionExtension`, R37); d526 29/2 → 31/0, d510 17/2 → 19/0, d547 0/1 → 14/0 (fixtures); d484 28/2 → 30/0; versionstate 88/1 → 89/0; d470 10/3 → 11/2 (1.37.0 and 1.38.0 rows from the suite's print on each commit's tree, matching PROMOTION #6/#7; A5 1.38.0; A1 floors from print; 13/0 on f16a6c55b1); plane-envelope LOAD → 60/4; publishedcase LOAD → 130/0; d150 LOAD → 64/0; d507 LOAD → 63/0; d448 LOAD → 131/0; d278 19/0 and ratify 43/0 unchanged (ratify reads `CATALOG_VERSION`, no literal). Controls run whole on scratch copies, AS DECLARED: shadowed-refusals 11/11, fence-e2e 7/7, d526 6/6, d470 11/11; re-anchored (anchors once, baselines red): machine-fences, refusal-wire, d507, d448 controls, nc-pl12. Not re-anchored: `civicos-ui/test/refusal-codes.control.mjs` (stale since T5/T7; its precondition, the guard green, cannot hold).
- B2 (K267–K269) merged (93a12a6de4): gate-reads 134/1 → 135/0, `monitoring` classified GATED (R32's sight fix; J3's leak cleared). Escalation's migration clears the purge reds of J2 (re-measured in the final battery).
- Family 3 (layer 8), commit 7aebb76737: case-opened 10/21 → 31/0; caseobject LOAD → 19/0 (earned connection C); caseflip 58/1 → 59/0; caselifecycle 63/4 → 68/0; casepin 31/3 → 34/0; casesign 76/1 → 77/0; caseratify-conclusion LOAD → 22/0 (§3 on case-authoring R7's re-preparation in place); ratify-authority 29/3 → 52/0; multicase LOAD → 21/0; mk7-attribution 4/1 → 33/0; frontier-chunk 12/3 → 15/1; reviewcopy 95/3 → 98/0; reviewcopy-inband 29/2 → 31/0; rec217 LOAD → 27/0; d543 11/1 → 11/1 (now reevaluation's hand stamp); opaque-ids 32/3 → 35/0; mint-ledger 23/3 → 26/0; bias 135/3 → 138/0; caseproduction 80/6 → 86/0; publish LOAD → 100/0 (§9 creates the old-shape table in a bare DO of the same storage, then the plane's `migratePublication` re-keys it); projection-noproject 25/1 → 26/0; versionnotice 39/2 → 42/0 (the witness waits for reevaluation's notice sweep, R14/R25); citeproject-inquiry LOAD → 37/0; deliverer 19/1 → 20/0; signer-enrolment 30/2 → 32/0; machine-attest 33/3 → 36/0; operator-attest 10/8 → 18/0; testify 49/1 → 58/0; testimonyaxis 38/1 → 51/0; provenance-chain 70/1 → 71/0; repair-reachability 45/1 → 46/0; readingname 99/1 → 100/0; ratify-envelope 32/3 → 35/0; civicos-ui several-cases-choice 14/1 → 15/0. reevaluation LOAD → 69/5: its INQ_MOVED leg (an inquiry target, which can earn nothing but testimony's D, and D would move the frozen pair) is ungraded, C-2.8's undetermined leg, and its obligation-leg pin expects the nulls; the authored-B-through-obligation shape is no longer exercised there (REC-118's ceiling stays held by `rec118-reeval-earned`): a judgement BOB may reverse. Controls re-anchored (anchors once) and run on copies AS DECLARED: caseratify-conclusion, ratify-authority 8/8, opaque-ids 5/5, deliverer 6/6, signer-enrolment 7/7 (dead since T3), machine-attest 4/4, caseproduction 10/10, reviewcopy, reviewcopy-inband; casesign arm g 3 fails where 2 recorded. NOT AS DECLARED: operator-attest (arms admin, member, probe, tokenstring each miss one declared failure: a later guard now stops the case); frontier-chunk (D443-6's product red); caseobject arms c–e no longer bite. Not run: case-project-conclusion, case-edition-conclusion (anchors re-set); civicos-ui several-cases-choice.control's BEFORE arm restores pre-module files whole and cannot work in a modular tree (deferred: wants re-deriving).

## J4 · REPORT

BEHAVIOUR CHANGE (product red, not re-pinned), owners **promotion** (R39, step order) and **legacy-store**'s construction (K252's chain): promotion is built with no `order`, so steps run in registration order, and the chain `actionsOf` → `void a.conformance` → reevaluation → `inquiryOf` now registers inquiry's step before connections'. Inquiry's projection then reads `refs` before connections writes them, so the superseded-by index is never written for a new superseder and supersession obligations vanish. Red: reevaluation 69/5, rec114-leg-earned 33/3, rec118-reeval-earned 10/19, frontier-chunk D443-6. Confirmed on a scratch copy: registering connections' step first makes all four green (74/0, 36/0, 29/0, 16/0). Fix: an explicit `order` (connections before inquiry), or construction order.

Also: **reevaluation** `src/reevaluation/index.mjs` 909 spells a whole-second stamp by hand (`.replace(/\.\d+Z$/,"Z")`, T8 commit b6d4308734), D-543 (d543-instant-precision 11/1). The rest at COMPLETE; the whole battery re-runs now.
