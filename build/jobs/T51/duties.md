# duties (T51)

**Status** · session_01MyQq2MvqjNMyK2TgY7expN · depth 2 · COMPLETE · handled B7

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

## J7 · COMPLETE

Fix round 10, Wave A batch 2 (B7): done. No code or requirement of duties changed; tests only.

Fixtures published in `bio-plane/test/m/duties/fixtures.mjs` (new), each made by the real code at test time, each with a test in `fixtures.test.mjs` naming its requirements:
- `occurrencesOf` (R9, R10, R12): a met and an overdue occurrence over real events, an undetermined one, and NO_SUCH_DUTY.
- `occurrences` (R9, R11): the read without a window; NO_SUCH_DUTY for an absent id and for a viewer naming no member (`unseen`). The real method is `occurrencesOf` and it requires `asOf`; following's stand-in omits it, so its re-point must pass `asOf`.
- `recordTransitionsAnswers` (R13): an empty pass, an unfinished pass `{done:false, cursor:"DUT-..."}`, and the finishing pass from that cursor.
- `transitionsUnknownDuty` (R14), in place of the asked `transitionsRefusal`: see the finding below.

**Finding for BOB (K4426, a real path gives none):** `transitionsOf` never answers NO_SUCH_DUTY. For an unknown duty it answers `{ok:true, transitions:[], count:0}`, and requirements R14 state no refusal. So `transitionsRefusal` cannot be made by real code. plan-work's `takeup.test.mjs`:175, 221 and its fixture.mjs hand-build `{ok:false, reason:"NO_SUCH_DUTY"}` for it, an answer no provider gives. I published the real answer as `transitionsUnknownDuty`. plan-work should take that (its `met_at` case for an unreadable reading), or, if it must test a failing read, treat it as a fault (a throw, which its code already covers). If BOB wants `transitionsOf` to refuse an unknown duty, that is a requirements change (R14) first.

Own line: standards/bindsAt, `policies.test.mjs`:207: the Proxy over `standards.bindsAt` is gone. The test now records a real adoption (a council ordinance adopts a company's policy through the real `standards.adoptionRecord`) and the real `bindsAt` answers; the council is bound, the clerk is refused NOT_ACTING_FOR_PUBLIC as before.

Markers added: no `fixtures-own`, no `fixtures-generic`, no `fixtures-contract`.

Tests and checks:
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/duties/*.test.mjs`: 79 pass, 0 fail.
- `checks/fixtures.mjs . duties --list`: 0 failures, answer 0 (was 1).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs . duties`: 0 failures. `checks/coverage.mjs . duties`: 34 of 34 named. `checks/words.mjs . duties`: 0 failures. `checks/ownership.mjs . duties tranche/T51 job/T51/duties`: 0 failures.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 178 (duties), 2 test files, both run above.

Other modules (P9, not changed): none new beyond the plan-work item above.

Size (session_0183nvKGgohACwBMciK6jGZB): test runs 5, module lines 2210.

## J5 · COMPLETE

Follow-up 38 (K5108; test files only; QUEUE #36). queue's `noticed.test.mjs:292` table needs `dutiesOf` and `occurrencesOf` answers for a viewer, published by the real module.

Applied:
- `bio-plane/test/m/duties/fixtures.mjs`: new export `dutiesForViewer()` (no arguments), returning `{duties, asOf, entity, viewer, holder, dutyId, absentId, none, noneOccurrences, held, heldOccurrences}`.
  - `none`: `dutiesOf({entity, as: "obligor", viewer})` over a record holding no duty: `{ok: true, entity, as: "obligor", duties: [], count: 0, limit: 100, truncated: false}`.
  - `noneOccurrences`: `occurrencesOf({dutyId: absentId, asOf, viewer})` for an id the record does not hold: `{ok: false, reason: "NO_SUCH_DUTY"}`.
  - `held`: `dutiesOf` over the one duty the holder sees (`duties` is `[dutyId]`).
  - `heldOccurrences`: `occurrencesOf` for that duty over a window holding none of its triggers: `{ok: true, ..., occurrences: []}`.
- `bio-plane/test/m/duties/fixtures.test.mjs`: one test naming R7 and R9, checking each answer and that the held listing equals the module's direct answer.
- No `fixtures-own` or `fixtures-generic` marker added; no stub.

For queue (its user re-points): the stub's `occurrencesOf` → `{ok: true, occurrences: []}` matches the real answer for a held duty with no occurrence in the window. A viewer holding no duty has no duty id to read, so the real `occurrencesOf` answers `NO_SUCH_DUTY`, not an empty list. notice-producers asks `occurrencesOf` only for duties `dutiesOf` returned, so this is not a product defect and nothing is reported as one.

Merged `origin/tranche/T51` (ebaa7e8b8f) into the job branch before `mail start`, as the START required.

Deferred: none. Found in other modules: none.

Tests and checks:
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/duties/fixtures.test.mjs`: 5 pass, 0 fail.
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/duties/*.test.mjs`: 80 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures (178 modules).
- `checks/fixtures.mjs /home/user/bio duties`: 0 failures (answer 0, stub 0, code 0).
- `checks/architecture.mjs /home/user/bio duties`: 0 failures.
- `checks/coverage.mjs /home/user/bio duties`: 34 of 34 live ids named by a test.
- `checks/words.mjs /home/user/bio duties`: 0 failures.
- `checks/ownership.mjs /home/user/bio duties tranche/T51 job/T51/duties`: 0 failures.

Size (session_01MyQq2MvqjNMyK2TgY7expN): test runs 3, module lines 2217.

## J8 · COMPLETE

Follow-up 38 (test files only) done. New export bio-plane/test/m/duties/fixtures.mjs dutiesForViewer() (no arguments) returns {duties, asOf, entity, viewer, holder, dutyId, absentId, none, noneOccurrences, held, heldOccurrences}: none = dutiesOf for an entity holding no duty ({ok:true, duties:[]}); noneOccurrences = occurrencesOf for an absent id (NO_SUCH_DUTY); held = dutiesOf for the one duty the holder sees; heldOccurrences = occurrencesOf over a window with no trigger ({ok:true, occurrences:[]}). Note for queue: a viewer holding no duty has no duty id to read, so the real occurrencesOf answers NO_SUCH_DUTY, not an empty list; no product defect. Tests: duties 80 pass, 0 fail; checks format, fixtures, architecture, coverage (34 of 34), words, ownership all 0 failures. Record J5 on job/T51/duties (commit e1fe3926df).
