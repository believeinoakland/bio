# ai-accounts (T51)

**Status** · session_01KopXm8kekeG6vTeWVbAtkx · depth 2 · COMPLETE · handled B6

## J1 · COMPLETE

Completion of T51-175 (ai-accounts, the words findings). Commit 3669033966 on job/T51/ai-accounts (merge of tranche/T51 at 888af5c935 in 5e41146262 first, K1991).

**Entries applied (build/plan/words-pass/ai-accounts.md):**
- inline `index.mjs` (was :1169): the keep-away reason's suffix "; this one has {length}" is now its own `localize('ai-accounts.index.this_one_has', ...)`, filled into the sentence as before; the sentence text is unchanged.
- plain `index.mjs` (was :313, :585, :1178): the three act phrases given to `#adminBar` ("switching the team key's assistant settings", "reading the team key's assistant settings", "keeping the team's material away from every assistant") are `localize` reads, ids `ai-accounts.index.switching_the_team_keys`, `...reading_the_team_keys_assistant`, `...keeping_the_teams_material_away`. Each phrase is a member-facing detail (membership's notAnAdmin fills it into "{what} is an administrator's act"), so none is reported to BOB as a non-member string.
- testcopy (the four in the findings): `t35-misc.test.mjs` compares the seal refusal's translation with `word('refusal.ACCOUNT_SEAL_UNAVAILABLE')` and its detail, and the two member-key and reference details, with `localize(id, en)`; `seams.test.mjs` (:524) compares KEPT_AWAY_UNREADABLE's detail with `localize('ai-accounts.index.whether_the_team_keeps_its', en)`.
- Found on the words check after the first fix (same en copied by the module's other tests): `group-key`, `t36`, `t40` and `t41` compare the notAnAdmin detail with `localize(id, en)` for the same three phrases.

**Deferred:** none.

**Reports about other modules:** none raised by this job. Observed on the repo-wide run (`checks/run.mjs`, not this module's): coverage 33 failures and words 4293 failures, in other modules (for example wizard-scripts' testcopy findings); none names ai-accounts. Those are inherited reds of the plan's rule 5, not this job's.

**Tests and checks (run on the committed head 3669033966, or on the working tree before the commit where noted):**
- `node --test bio-plane/test/m/ai-accounts/`: tests 114, pass 114, fail 0 (run twice: after the source change, and after the test copies were fixed).
- `checks/words.mjs /home/user/bio ai-accounts`: 0 failures.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio ai-accounts`: 18 product files, 0 failures.
- `checks/coverage.mjs /home/user/bio ai-accounts`: 34 of 34 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`: 8 files changed by ai-accounts (the seven module files and this record), 0 failures.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage and words carry the other modules' failures above, with no line naming ai-accounts.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (rows.mjs is BOB's to regenerate at the layer close); no refusal naming ai-accounts.

**Reading:** the requirements (both parts), the entry, build/layers.md (whole), the words findings, the module's own code and tests, the tests the findings name. The word-test sentence in `t35-misc.test.mjs:145` (a substring of the unknown-kind detail) is a copy the check does not flag; left as it was.

**Commit note:** the commit carries the Claude-Session line only; the model-name Co-Authored-By line is left out because the session's rule forbids a model identifier in a commit.

Size (session_01UqVXapoj5wpdUoADSpasF2): test runs 2, module lines 2147

## J2 · COMPLETE

CHANGE B2 applied (K3974). Tranche/T51 merged first (14905d7049 on the job branch, no rebase).
- `t35-misc.test.mjs`:145 (the unknown-kind detail) now compares the whole detail with `localize('ai-accounts.index.the_kind_your_teams_civicsmith', en, { ACCOUNT_KINDS: 'apikey' })` by equality; the product reads that detail by `localize` already (index.mjs:392).
- Tests: `node --test bio-plane/test/m/ai-accounts/` 114 pass, 0 fail.
- Checks: words 0 failures (testcopy 0); format 0; architecture 0; coverage 34 of 34 ids named, 0 failures; ownership 0 failures; setup-words --check shows the stale-rows note only, expected.
- Committed and pushed; state COMPLETE.
Size (session_01UqVXapoj5wpdUoADSpasF2): test runs 3, module lines 2147

## J3 · COMPLETE

CHANGE B3 applied (K3980). Tranche/T51 merged first (no rebase).
- `seams.test.mjs` R25 arms (was :173, :176, :183, :186): the two sentences are credentials' localize texts (credentials.index.an_asks_grant_is, credentials.index.a_standing_question_runs); the test now builds each with localize(id, en) and compares the detail with that value.
- Tests: node --test bio-plane/test/m/ai-accounts/ 114 pass, 0 fail.
- Checks: words 0 failures (testcopy 0); format 0; architecture 0; coverage 34 of 34, 0 failures; ownership 0 failures.
- Committed and pushed; state COMPLETE.
Size (session_01UqVXapoj5wpdUoADSpasF2): test runs 4, module lines 2147

## J4 · COMPLETE

Completion of T51-175 (ai-accounts, RW words round). Commit e9f791fd5f on job/T51/ai-accounts (tranche/T51 merged at 70f8d6f8b9 range, no rebase).

Entries applied:
- the five findings of `checks/words.mjs` (civicos-process e8ac153): index.mjs:197 (`ai-accounts.index.only_an_active_member_holds`), :1110 (`the_teams_key_serves_only`), :1246 (`this_project_keeps_its_material`), :217 (`this_member_holds_no_claude_key`), :220 (`no_claude_account_serves_this`). Each is now `localize(id, en)` with the English unchanged, one string literal. The :217 id differs from the existing `this_member_holds_no_claude` (a different sentence) to keep ids unique.

Deferred: none. Reports about other modules: none raised by this job.

Tests and checks:
- `node --test bio-plane/test/m/ai-accounts/*.test.mjs`: tests 114, pass 114, fail 0.
- `checks/words.mjs /home/user/bio ai-accounts`: 0 failures (inline 0, plain 0, testcopy 0).
- `checks/format.mjs /home/user/bio`: 176 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio ai-accounts`: 18 product files, 0 failures.
- `checks/coverage.mjs /home/user/bio ai-accounts`: 34 of 34 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`: 1 file changed by ai-accounts, 0 failures.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage 22 failures and words 1625 failures, all in other modules (no line names ai-accounts).
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only, naming word 16079 (ai-accounts.index.no_claude_account_serves_this), expected until BOB regenerates rows.mjs at the layer close; no refusal naming ai-accounts.

Size (session_011YKG2GaVfSwqT6prQmCaJM): test runs 3, module lines 2141

## J5 · COMPLETE

Completion of the fix round's job FR-54 (K4206, B5). Commit ce28481a75 on job/T51/ai-accounts.

**Entries applied**
1. **K4206**: `accountusesset` is declared in `DECLARED_OPS` (`bio-plane/src/ai-accounts/index.mjs`), beside the ops map. Class, machine classes, mutating and weight are the family's own (`classes` admin and member, `machineClasses` [], `mutating` true, `weight` `substrate`, the grade `op-grades` t41 gives the op, as `projectaccountswitch`'s). Description: `localize("ai-accounts.declared.accountusesset", ...)`, a sentence from that grade's `is`. `accepts` and `requires` are `owner`, `switch`, `on`, read from the arm (`accountUsesSet`; `by` is the stamp).
   - The arm refused each absent field without naming it, so the declaration could not hold (P8). Fixed in the arm, as the entry asks: an absent owner is refused NOT_YOUR_ACCOUNT with a detail naming `owner`; an absent switch is refused UNKNOWN_SWITCH with a detail naming `switch`; an absent `on` is refused SWITCH_VALUE_INVALID with a detail naming `on`. A request with a machine `by` and no owner keeps MACHINE_CANNOT_HOLD_ACCOUNT. Every other refusal is unchanged; an unknown switch name, a bad value and NO_ACCOUNT keep their sentences.
   - Requirement: NEW **R37** for BOB to add (text below). The requirements file is not written by this job.
   - Test: `declared-ops.test.mjs` holds `declaredOpHolds` for `accountusesset` (values owner `member:ann`, switch `ask`, on `true`). `accountusesset-fields.test.mjs` names the three refusals, each writing nothing, and the controls (an unknown owner, a machine with no owner, an unknown switch, a bad value, a named member with no account) keep their answers.
   - Fail first: the refusal test fails on the arm as it stood at the job's start (1 of 2 fails) and passes on the change; the controls pass on both.
   - `test-support` is in the module's `uses` already; nothing for BOB to add.

**Deferred:** none.

**Reports about other modules:** none. Observed on the repository-wide `checks/run.mjs`: coverage fails in agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep and monitoring (their own ids R17, R36–R38, R16–R18, R26, R31, R19, R13–R15, R75–R77), none in ai-accounts. Words 0 failures.

**Generated artifacts this change makes stale (for BOB at the layer close; not regenerated here):**
- `bio-plane/src/setup-words/rows.mjs` (and `words-unreviewed.json`): four new word ids to add by its build: `ai-accounts.declared.accountusesset`, `ai-accounts.index.the_request_names_no_switch`, `ai-accounts.index.the_request_names_no_owner`, `ai-accounts.index.the_request_gives_no_on`. Until then each falls back to its English, as `localize` does for a missing row.
- `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle, `npm run build` in `bio-plane/`): it carries this module's source.

**Requirement for BOB (R37, next free id):**
- **R37** (T51; K4206; op-declarations R80, op-grades R49, test-support R15) The module declares `accountusesset` in `DECLARED_OPS`: class admin and member, `machineClasses` [], mutating, weight `substrate`, its arm's fields `owner`, `switch`, `on` as both accepts and requires. A request naming no owner is refused NOT_YOUR_ACCOUNT naming `owner` (a machine caller with none keeps MACHINE_CANNOT_HOLD_ACCOUNT); naming no switch, UNKNOWN_SWITCH naming `switch`; giving no `on`, SWITCH_VALUE_INVALID naming `on`. Every other refusal of `accountUsesSet` is unchanged. Test: `declared-ops.test.mjs` (`declaredOpHolds`) and `accountusesset-fields.test.mjs`, with the controls.

**Tests and checks**
- `node --test bio-plane/test/m/ai-accounts/`: tests 131, pass 131, fail 0, skipped 0.
- `node checks/format.mjs`: 0 failures.
- `node checks/architecture.mjs /home/user/bio ai-accounts`: 0 failures.
- `node checks/coverage.mjs /home/user/bio ai-accounts`: 36 of 36 live ids named (R37 is not yet in the requirements file).
- `node checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`: 4 files, 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture and words 0 failures; coverage 7 failures, none in ai-accounts (above). Words for this module: 0 findings.

Size (session_01VSp5XBxGxE7tGFz3UQ7JAM): test runs 4, module lines 2188

## Fix round 10, Wave A batch 2 (AI-ACCOUNTS #6, session_012zC89ytoyYon28aQ3j1D4U; B6)

Merged `origin/tranche/T51` into the branch first (record-core's `fixtures.mjs` was not on the branch point).

**Fixtures published** (`bio-plane/test/m/ai-accounts/fixtures.mjs`, new; each called and checked against the real answer in `fixtures.test.mjs`, 14 tests): `accountForRefused`, `accountForResult`, `accountReference`, `accountsServing`, `keepAwaySet`, `keepAwayState`, `keepAwayUnreadable`, `keptAwayGroup`, `keptAwayProject`, `keptAwayUnreadable`, `noAccount`, `subscriptionDisconnect`, `switchedOff`, `tokenMalformedHold`. All run the real module over `world()`.
- Shapes for users: `accountForRefused`/`noAccount`/`accountForResult`/`subscriptionDisconnect`/`keepAwaySet`/`keepAwayUnreadable` return the answer itself; `accountReference` returns `{without, with}`; `accountsServing` returns `{accounts, accountFor, member, key, world}`; `keepAwayState` returns `{kept, off}`; `keptAwayGroup`, `keptAwayProject`, `keptAwayUnreadable` return `{aiKeptAway, accountFor}`; `tokenMalformedHold` returns `{tooShort, notAString, held}`. `accountReference` is the real `accountReferenceState` (the op is `accountreference`).
- **Brief against code:** the brief says NO_ACCOUNT carries check C-29.1; the module's check table gives `C-29.20`. The fixture is the real answer, so `C-29.20`; its users must not assert C-29.1. For BOB: the brief's number is wrong, not the module.

**Own lines (8 of 8):** `fixture.mjs` stub record-core replaced by record-core's `coreOver` (`coreOf(db)` adds a `declared` read over `declaredTables()` for the tests that inspect declarations; the hand-made `bundles` table and insert became `addBundle`): lines 33, 44, 51, 53, 54 done. `seam.test.mjs:68,71` and `seams.test.mjs:340` take `tableDeclarationRefusals` answers: done. `node checks/fixtures.mjs . ai-accounts --list`: 0 failures, 1 accepted (own).

**Markers added:**
- `bio-plane/test/m/ai-accounts/fixture.mjs:68` `// fixtures-own: harness - sets the test's own fact that the registered claimed seam reads (credentials, later in the order, is never built here)`: the line below it, `claim()`, a world helper named like an op that sets the fact membership's claimed seam reads, no module's answer.
Generic markers added: none.

**Deferred:** none. **Reports about other modules:** none; no stale generated artifact (no source changed).

**Tests and checks**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/ai-accounts/`: tests 145, pass 145, fail 0.
- Impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): affordances 2, translations 7, instance-setup 3 (+ ai-accounts); their 71 tests (non-ai-accounts): pass 71, fail 0.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs ai-accounts`: 0 failures. `checks/coverage.mjs ai-accounts`: 37 of 37 live ids named, 0 failures. `checks/ownership.mjs ai-accounts tranche/T51`: 0 failures. `checks/fixtures.mjs . ai-accounts`: 0 failures.

Size (session_012zC89ytoyYon28aQ3j1D4U): test runs 9, module lines 2188

## J6 · COMPLETE · re B6

COMPLETE fix round 10 Wave A batch 2. 14 fixtures published (bio-plane/test/m/ai-accounts/fixtures.mjs, 14 tests in fixtures.test.mjs); 8 own lines re-pointed to record-core coreOver / tableDeclarationRefusals (tranche/T51 merged in first); fixtures check 0 failures. Marker added: fixture.mjs:68 'fixtures-own: harness' for claim() (world helper named like an op). No generic markers. Brief says NO_ACCOUNT check C-29.1; the module's real check is C-29.20 (fixture follows the code; users must not assert C-29.1). Module tests 145/145; impact users (affordances, translations, instance-setup) 71/71; format, architecture, coverage (37/37), ownership 0 failures. Record: build/jobs/T51/ai-accounts.md. Size (session_012zC89ytoyYon28aQ3j1D4U): test runs 9, module lines 2188.
