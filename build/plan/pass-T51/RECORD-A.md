# Declaration pass T51: record of group A (continuation of RECORD.md part 1)

Worker: sonnet, group A (ai-accounts, money, actions, contradiction, standards, translations, consequences, action-clocks, doorbell, bias, explore, answers, docket, strength, attestation, case-tensions, corpus-export, reading-guides, lines). Not committed. The rule is part 1's (copy class, mutating, weight and description from the hand rows; accepts and requires read from the arm whole; door-stamped names and the shell's `reason` are not accepts; conditional requirements left out; a hand-sentence description is `localize("<module>.declared.<op>", <sentence>)`; no hand description: the registry label key) with BOB's K4204 addition (no op-grades row and not mutating: weight `read`). No arm was changed. Method: the part-1 generator, extended (declarations added to an existing `DECLARED_OPS`; refusals matched by code, by `{code, end}` / `{code, arm}` / `{code, whyHas}` where one code serves several fields); the scratchpad tools are in `/tmp/claude-0/sA/` (not part of the repository).

## Declared (44 ops, 15 modules)
| module | requirement | ops |
|---|---|---|
| ai-accounts | R36 | projectkeyset, projectsigninset, projectaccountremove, projectaccountswitch, projectaikeepaway, projectkeynoticeseen (beside part 1's R35) |
| money | R27 | recordfact, createset, include, exclude, reconcile, committedagainstpaid, authoritychain |
| actions | R109 | actionmove, actionlaws, actionrisktier, actioncorrespond, actioncreate, addresseesuggest |
| contradiction | R60 | contradictionresolve |
| standards | R62 | standarddeclare, standardadopt, lawrelate, courtlink (beside part 1's R61) |
| consequences | R26 | consequencerecord, consequencerevise, addressedrecord, successrecord |
| action-clocks | R25 | reminderset, reminderanswer, clockadopt |
| bias | R51 | biasmanifest, biasinhale, biasadopt (beside part 1's R50) |
| explore | R27 | explore, explorepreset |
| answers | R36 | ruleanswer, standingquestionset, standingquestionend (declaration in `answers/ops.mjs`) |
| strength | R41 | strengthbarset |
| attestation | R11 | attest (declaration in `attestation/ops.mjs`, beside `attestOp`; the test drives `attestOp` with the plane's helpers as `ops.test.mjs` does) |
| case-tensions | R12 | attribute |
| corpus-export | R12 | exportlog (beside part 1's R11) |
| lines | R25 | recordline |
doorbell and reading-guides: every `pass` op was already declared by part 1; nothing to do.
Each module with new ops has one `declared-ops.test.mjs` (part 1's file extended where there was one) and one new requirement line marked `*(not yet met: T51)*`. Additions are beside the ops map; `localize` imported where the module lacked it.
Weights: `biasmanifest`, `biasinhale` and `exportlog` have no op-grades row and op-declarations marks them not mutating, so weight `read` (K4204); their description is the registry label key (`act.biasmanifest.label.bias`, `act.biasinhale.label.bias`, `act.exportlog.label.group`), as is `contradictionresolve`'s (`act.contradictionresolve.label.contradiction`: hand description absent). Both op-declarations' and op-grades' `registerDeclaredOps` accept every row of the tree (checked with a script).

## Judgments (17): declared nothing
| module | op | sentence that stopped it |
|---|---|---|
| ai-accounts | accountusesset | a missing `owner` is refused NOT_YOUR_ACCOUNT, the code of every principal that is not the actor, which names no field, so the field it requires cannot be stated as the refusal names it (as part 1's `captureaccount`) |
| action-clocks | clockpropose | its arm is in control-plane/owner-ops.mjs, a later module than action-clocks, so action-clocks' test cannot import it (architecture) and `declaredOpHolds` cannot be run against the door's arm there (as part 1's `captureupload`) |
| explore | exploreverify | in its single-connection mode a missing `kind`, `as_of`, `method` or `id` is answered `ok: true, matches: false` (not a refusal) and a `chain` field replaces all of them, so what it requires cannot be stated as a refusal names it |
| contradiction | contradictiondismiss | op-grades' own test (ladder.test.mjs:165) copies the start of its hand description, so repeating that sentence in this declaration (op-grades R50 requires it equal) fails the words check's testcopy arm in a module the pass may not edit |
| contradiction | contradictionclarify | same as contradictiondismiss (ladder.test.mjs:165) |
| contradiction | contradictiontakeup | same as contradictiondismiss (ladder.test.mjs:165) |
| contradiction | contradictionoptin | same arm: ladder.test.mjs:169 copies the start of its hand description |
| contradiction | contradictionrespond | same arm: ladder.test.mjs:169 |
| docket | docketfile | same arm: op-grades owners.test.mjs:79 copies its hand description |
| docket | docketpost | same arm: owners.test.mjs:79 |
| ai-accounts | aikeepaway | same arm: op-grades t36.test.mjs:113 copies its hand description |
| translations | translationadopt | same arm: op-grades t37.test.mjs:20 copies its hand description |
| translations | translationconfirm | same arm: t37.test.mjs:20 |
| translations | translationrevert | same arm: t37.test.mjs:20 |
| translations | translationgrant | same arm: t37.test.mjs:29 |
| translations | translationdraft | same arm: t37.test.mjs:30 |
| strength | projectbarset | same arm: op-grades t47.test.mjs:74 copies its hand description |
These fourteen testcopy judgments were found by the checks run (8 testcopy findings, one per op-grades test line; all 14 declarations repeating those sentences were then taken out; with them out the words check shows 0). docket and translations therefore have no declaration, test file or requirement line from this pass (their files are as before). `registerDeclaredOps` and the declared test of each judged op are BOB's to give to the module's own wave-2 job (or to resolve by re-wording op-grades' tests).

## UNCERTAIN
- UNCERTAIN: conditional requirements left out of `requires`: standarddeclare `text` (needed only while `held` is text, the default), `period`; standardadopt takes only `proposal` (cite, kind, issuer, text can come from the proposal); consequencerecord `basis` (asked only when a `measure` is given) and `measure`, `causation`; recordfact `stage` (only while phase is actual); actionmove `resolution`; clarify's per-choice fields and so on (contradiction clarify is judged, see above); explorepreset every field but `preset` (they depend on the preset); standingquestionset `question`; strengthbarset `group` (defaults to the store's group); ruleanswer `args`, `at`.
- UNCERTAIN: alternatives. `lawrelate` and `courtlink` declare each of type, from, to, citation, reason as an alternative with `proposal` (an adopted proposal supplies them); `docketfile` (declared by this pass but then taken out, see judgments) had edition, from, capture, kind, proposed as alternatives with `takesBack`; `reminderset` `[on, from]`; `standingquestionset` `[query, find]`; `strengthbarset` `[capture, connection]`; `actioncorrespond` `[account, artifact_sha]`; `attribute` `[observation, capture]`.
- UNCERTAIN: one refusal code serving two or more fields is taken as naming each (`NO_ENDS` for from and to of `recordline`; `NO_SUCH_FACT` for a and b of `reconcile`; `ATTRIBUTION_NOT_REACHED` for caseId and edition of `attribute`; `NO_SUCH_STANDARD` told apart by its `end`; `REMINDER_REFUSED` by its `arm`; `NO_NODE` of `explore` by its words).
- UNCERTAIN: `translationdraft` is routed by the door itself (store-door/dispatch.mjs:466, same four fields, same refusals); it was in any case judged above. Its `assistant` argument is the door's, not an accept.
- UNCERTAIN: `addresseesuggest` accepts `action` and `subject` from the query or the body; `ruleanswer` `service`, `args`, `at` (its `grant`, `use` stamps are the door's); `standingquestionset` accepts `owner` (read from the query, not a stamp); `actioncorrespond` accepts `speaker` (read from query or body, not stamped).
- UNCERTAIN: `attest` (a Worker arm, not an ops-map arm) accepts `sha256`, `archive`, `locator`; its DECLARED_OPS sits in `attestation/ops.mjs` (the arm's own file).
- UNCERTAIN: requirement lines were appended at the end of each file; the Status headers were not touched.
- UNCERTAIN: section 4's `lines/recordline` check is confirmed: `recordline` takes kinds `custodian_of` and `responsible_for` (the test records `custodian_of` between an office and a body with a statement basis and an optional validity).

## Uses needed (do not edit modules.json): `test-support` in `uses` of
action-clocks, actions, answers, case-tensions, consequences, contradiction, explore, lines, money, strength (architecture check: 10 findings, nothing else). ai-accounts, standards, bias, corpus-export, attestation, doorbell, reading-guides have it.

## New words keys missing from the table
None reported by the words check (missingkey 0). The new `localize` ids (`<module>.declared.<op>`) make `bio-plane/src/setup-words/rows.mjs` / `words-unreviewed.json` stale for BOB's regeneration; the ids are those of the 44 declared ops with a hand sentence, i.e. every op above except `contradictionresolve`, `biasmanifest`, `biasinhale` and `exportlog` (label keys).

## Checks (temporary index with my new files; `checks-A2.txt` in the scratchpad)
format 0; architecture 10 (the `test-support` edges above); channels 0; words 0 (inline 0, testcopy 0, missingkey 0); coverage: no finding in any module of group A (the 26 findings are other modules' ids named by no test: other workers' new files are not in my temporary index, and part 1's seven baseline failures).

## Tests (node --test --test-force-exit on each module's test files; before = first run before any edit, under a machine load of 100+, after = final)
| module | before | after |
|---|---|---|
| ai-accounts | 111 pass 0 fail | 127 pass 0 fail |
| money | 72 / 0 | 79 / 0 |
| actions | 134 / 1 (read.test.mjs, file-level, load) | 148 / 0 |
| contradiction | 120 / 0 | 121 / 0 |
| standards | 99 / 1 (inforce.test.mjs, file-level, load) | 110 / 0 |
| translations | 23 / 2 (module, translations .test.mjs, file-level, load) | 32 / 0 |
| consequences | 61 / 1 (carry.test.mjs, file-level, load) | 69 / 0 |
| action-clocks | 63 / 2 (adopt, calendar .test.mjs, file-level, load) | 80 / 0 |
| doorbell | 67 / 1 (doorbell.test.mjs, file-level, load) | 77 / 0 |
| bias | 75 / 0 | 78 / 0 |
| explore | 46 / 6 (mx1a.test.mjs time-budget tests, load) | 54 / 3 (the same file's time-budget tests, load; mx1a.test.mjs alone: 4 / 0) |
| answers | 64 / 0 | 67 / 0 |
| docket | 80 / 0 | 80 / 0 (no declaration) |
| strength | 159 / 2 (R28 "no analyst's word"; R6, R22 "withheld whole") | 160 / 2 (the same two) |
| attestation | 32 / 0 | 33 / 0 |
| case-tensions | 23 / 0 | 24 / 0 |
| corpus-export | 26 / 0 | 27 / 0 |
| reading-guides | 61 / 0 | 61 / 0 |
| lines | 31 / 1 (invariants.test.mjs, file-level, load) | 36 / 0 |
The only reds left are the two pre-existing strength tests and explore's load-sensitive time budgets (green alone). Census (interface-shell declared.test.mjs): 7 pass, 0 fail; `declared N of M` rises with every group's declarations (it read 149 of 299 with the three workers' files in the tree).

## What remains
Nothing of group A's `pass` ops is unreached: each is declared above or in the judgments table.
