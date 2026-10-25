# duties (T51)

**Status** · session_0183nvKGgohACwBMciK6jGZB · depth 2 · WORKING · handled B7

## J1 · REPORT

`checks/run.mjs /home/user/bio` exits 1, all in other modules (duties is not among them). Coverage: 172 modules, 5808 of 5896 live requirement ids named by a test, 13 failures, none in `duties`:
- agent-harness: R17
- agent-runner: R36 R37 R38 R40
- agent-steps: all 49 live ids (R1–R49)
- agent-worker: R119
- basis-versions: R55
- case-grammar: R33
- entities: R57 R58 R59 R60 R61
- explore: R26
- journey-check: R19
- people: R40 R41
- progressions: R46
- retrieval-browse: all 18 live ids (R1–R18)
- retrieval: R87 R89 R90

Not changed by me; these belong to each module's job. Also for BOB: on `tranche/T51` (6aa6e18785) the K3811 team→group pass has not yet changed `duty.reason.deadline_not_held` in `words.json` or `checks.mjs`:31. Both still say "team" and agree, so R33 is green. When the pass lands, its twin rule should edit both together; R33 asserts equality with the file's `en`, so it should stay green.

## J2 · COMPLETE

T51-37 · duties (N1244, red #29). No code changed: the entry's red is green on the current tip.

Applied: confirmed `t48-reasons.test.mjs` R33 green (9 of 9 in that file). `checks.mjs`:31 already equals `words.json`'s `en` verbatim. Deferred: none.

Tests: `node --test bio-plane/test/m/duties/*.test.mjs`: 74 pass, 0 fail.
Checks (process repo, product `/home/user/bio`): format 0 failures (174 modules); architecture `duties` 0 failures; coverage `duties` 33 of 33 live ids named by a test, 0 failures; ownership `tranche/T51` `job/T51/duties` 0 failures; `run.mjs` exits 1 on other modules only (see REPORT).

Size (session_01Ws4NENFkwXyb87BcFTppXf): test runs 2, module lines 2242.

## J3 · COMPLETE

T51-194 · duties (words, the pass's 15 findings) applied; no requirement changed; commit 3f3ec4a099.

Applied, by the words rule (K3949, K3957, K3962):
- `index.mjs`: 12 inline sentences and 15 plain findings through `localize('duties.index.<slug>', en, vars)`, every value a `String(...)`, so the text is what it was. Five that equal a row read it by key: the precision-held, stated-review-date, read-names-member and undetermined-date-asked reasons, as `word(...)`.
- `vocab.mjs`: the two connection words `is owed to` and `holds the power` are copies of rows. It stays a leaf (inquiry-grammar imports it, K1799), so it holds `wordKey`; `index.mjs` resolves them with `word` and exports the resolved `CONNECTION_KINDS`. Ruling K3990.
- Tests: `t46-words` drops T45's three old sentences and the copied refusal sentence (its translation is pinned by the existing hash of the kept rows); `acts` uses a stated reason of its own in place of the copied one; `occurrences` compares the trigger-source error with `localize`.
- Keyed civil-time reasons (CR-1): `t48-reasons` and `occurrences` (R10, R33) now assert `why.key` and read text through `reasonText`. These were the four reds named by R18 and R33; they are green now.

Deferred: none.

Found in other modules (not changed here, P9):
- notice-producers `test/m/notice-producers/duties.test.mjs`:256, 410, 423, 427 copy sentences of civil-time and of its own (`possibly overdue: undetermined, because ...`, `What starts the clock ...`). The full run lists them as testcopy; they need the same key treatment in that module's job.
- Other modules' hand-lists of duties' ops (affordances `t33.test.mjs`:63, answers `scope.test.mjs`:23, op-grades `t45.test.mjs`:68) are the handlist arm's failures. Those modules own the lists.
- setup-words `rows.mjs` is stale for the new `duties.index.*` ids: expected; BOB regenerates it at the layer close.

Tests and checks:
- `node --test bio-plane/test/m/duties/*.test.mjs`: 74 pass, 0 fail.
- `checks/words.mjs /home/user/bio duties`: 0 failures (inline 0, plain 0, testcopy 0).
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio duties`: 0 failures.
- `checks/coverage.mjs /home/user/bio duties`: 33 of 33 live ids named by a test.
- `checks/ownership.mjs /home/user/bio duties tranche/T51 job/T51/duties`: 0 failures.
- `setup-words/build.mjs --check`: the stale-rows note only, naming duties ids (expected); no refusal.
- `checks/run.mjs /home/user/bio`: exits 1 on other modules; duties has no failure in it.

Size (session_015fij5CNkGX79gtEuBYtYeY): test runs 3, module lines 2208.

Ruling for BOB to record (this job's ownership does not include build/rulings.md):
- vocab.mjs stays a leaf (inquiry-grammar imports it, K1799), so the two connection words it holds are `wordKey`s, resolved in index.mjs with `word` (duties.word.owed, duties.word.holds_power); keyed civil-time reasons are relayed as {key, vars}, and duties' tests assert the key (reasonText for text). Proposed as K3990.

Commits on job/T51/duties: 3f3ec4a099 (the words pass), then the revert of build/rulings.md to tranche/T51's (ownership).

## J4 · REPORT

B3 (CHANGE, K3997) applied; not COMPLETE yet: it needs lines and local-facts merged into tranche/T51 first.

Applied on job/T51/duties (commits a3e567b71d, 973a345016):
- `index.mjs`: the holder read of lines' `holderAt` now reads `h.undetermined === true` and `h.why` as a key, through lines' `reasonText` (exported by lines' job branch, J4); the sentence fills `duty decider` text as before.
- `response.test.mjs`: the drafted group rule carries `effective_from: "2026-01-01"` (local-facts R18, DEC-341).

Tranche/T51 was merged at 3ef1afe710 (K3997). Lines and local-facts are not merged into it yet, so I tested against their job branches in a scratch worktree (removed afterwards):
- with job/T51/lines and job/T51/local-facts: 70 pass, 4 fail. The 4 are R27 and R19 of `uses` tests, which read `lines.why.no_line_covers` through `word()`: `rows.mjs` has no lines rows yet (UNKNOWN_WORD). They pass once BOB regenerates rows at the layer close; the holder path itself is covered by these tests after the merge.
- on the current tranche (lines not merged): the module fails to load, because lines' `reasonText` is not exported yet. This is why I wait rather than merge.
- R5 over real local-facts (response.test) is red on the current tranche only because local-facts has not merged; it is green on job/T51/local-facts.

Waiting on BOB: merge job/T51/lines and job/T51/local-facts into tranche/T51 (and regenerate setup-words rows, or confirm that the `uses` tests may be re-run after that). Then tell me, and I will merge tranche/T51, re-run the duties tests and checks, and post COMPLETE.

Checks run before this report: words 0 failures, format 0, architecture 0, coverage 33 of 33, ownership 0 failures, setup-words --check: stale-rows note only.

## J5 · COMPLETE

T51-194 · duties COMPLETE, after B3, B4 and B5 (lines, events and local-facts merged into tranche/T51; merged here at 3ef1afe710 and later).

Applied since J3:
- B3 (K3997): the holder read of lines' `holderAt` takes `h.undetermined === true` and `h.why` as a key, through lines' `reasonText`. Drafted group rules carry `effective_from` (local-facts R18, DEC-341) in `response.test.mjs`.
- Test label in `acts.test.mjs` no longer copies a words row (found by the full run's words arm).

Changes on job/T51/duties: a3e567b71d, 973a345016, 01ddb3a60c, plus the tranche merges. No requirement changed; nothing deferred.

Found in other modules (P9, not changed here):
- notice-producers `test/m/notice-producers/duties.test.mjs`:256, 410, 423, 427 copy sentences (testcopy in the full run).
- Handlist arm, other modules' hand-lists of duties' ops: affordances `t33.test.mjs`:63, answers `scope.test.mjs`:23, op-grades `t45.test.mjs`:68.

Tests and checks (on the merged tranche):
- `node --test bio-plane/test/m/duties/*.test.mjs`: 74 pass, 0 fail.
- `checks/words.mjs … duties`: 0 failures.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … duties`: 0 failures. `checks/coverage.mjs … duties`: 33 of 33 named.
- `checks/ownership.mjs … duties tranche/T51 job/T51/duties`: 0 failures.
- `setup-words/build.mjs --check`: no refusal naming duties (stale-rows note only, expected).
- `checks/run.mjs /home/user/bio`: exits 1 on other modules only; the duties entries in the full run are the notice-producers and handlist items above, none in duties' own tests except the one fixed in this round.

Ruling for BOB to record: K3990 (proposed in J3), unchanged.

Size (session_015fij5CNkGX79gtEuBYtYeY): test runs 6, module lines 2210.

## J6 · COMPLETE

COMPLETE again, after B6 (K4000): tranche/T51 merged at 41359f2b1e, with lines, local-facts and the regenerated setup-words rows.

Tests and checks on the merged tree:
- `node --test bio-plane/test/m/duties/*.test.mjs`: 74 pass, 0 fail (including the R27 and R19 uses tests that failed before the rows were regenerated).
- `checks/words.mjs … duties`: 0 failures. `checks/format.mjs`: 0 failures. `checks/architecture.mjs … duties`: 0 failures. `checks/coverage.mjs … duties`: 33 of 33 named. `checks/ownership.mjs … duties tranche/T51 job/T51/duties`: 0 failures.
- `setup-words/build.mjs --check`: no refusal naming duties.

Nothing changed in code since J5 (01ddb3a60c); this round is the merge only. Nothing deferred. Ruling K3990 remains proposed for BOB to record.

Size (session_015fij5CNkGX79gtEuBYtYeY): test runs 7, module lines 2210.
