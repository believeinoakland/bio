# ai-runs (T51)

**Status** · session_019UFFfaJbR6QhDzY4q1jnEB · depth 2 · COMPLETE · handled B5

## J1 · REPORT

The words check (checks/run.mjs, after the T51-210 conversion) reports one finding outside ai-runs: inline `bio-plane/src/run-rules/checks.mjs:259` [plain] "src/ai-runs/index.mjs groupTestSet, reached from the team's test in...". The sentence is run-rules' own (a catalogue row's text naming ai-runs' path and "team's test"); it is run-rules' to convert (its job, or its R-entry), not ai-runs'. ai-runs does not touch run-rules' files. Noted for BOB; no ai-runs action.

## J2 · COMPLETE

**Entries applied: T51-210 (words, K3949, K3957, K3962).** Every finding in `build/plan/words-pass/ai-runs.md` is fixed by the words rule; no text changed, each sentence is read through `localize('ai-runs.index.<slug>', en, vars)` with its `en` equal to the rendered text.

- Inline, index.mjs:1624 (usage is not a list): `ai-runs.index.usage_is_a_list`.
- Inline, index.mjs:3269 (entry is not an object): `ai-runs.index.the_entry_is_not`.
- Plain, index.mjs:1062 (the investigation note, the whole three-literal note): `ai-runs.index.starting_an_investigation_over`.
- Plain, index.mjs:1175 (re-examination open): `ai-runs.index.a_re_examination_of_this`.
- Plain, index.mjs:1191 (exploring run needs a step): `ai-runs.index.an_exploring_run_works`.
- Plain, index.mjs:1194 (a run works one step): `ai-runs.index.a_run_works_one`.
- Plain, index.mjs:1307 (steps not reachable): `ai-runs.index.the_runs_own_step`.
- Plain, index.mjs:1587 (tick note, project participation): `ai-runs.index.continuing_a_run_over`.
- Plain, index.mjs:1668 (segment end, two ternary arms): `ai-runs.index.the_runs_work_is_done`, `ai-runs.index.the_runs_work_is_not_done`.
- Plain, index.mjs:1823 (close note, project participation): `ai-runs.index.closing_a_run_over`.
- Plain, index.mjs:2266 (dispatch no acceptance): `ai-runs.index.no_acceptance_within_the_bound`.
- Plain, index.mjs:3272 (usage entry could not be counted): `ai-runs.index.it_could_not_be_counted`.
- Test copy, test/m/ai-runs/converts.test.mjs (the MEM resumption row, :322-324): the expectation is now `word('ai-runs.says.resumption_dispatched', { why: localize('ai-runs.index.a_members_credential_opened_it', en) })`, the same en the code holds, so the row compares with the key's sentence, not a copy of it.

Ids are new, none existed in `rows.mjs` or the module (checked). No judgment was needed: each finding is member-readable (a refusal's `detail` or `note`, or a log entry's text), so none is listed as unkeyed. No deferrals.

**Other modules (found, not changed).** The words check reports one finding outside this module, `bio-plane/src/run-rules/checks.mjs:259` [plain] "src/ai-runs/index.mjs groupTestSet, reached from the team's test in...". It is run-rules' sentence; REPORT sent to BOB separately.

**Checks and tests run (after merging tranche/T51 at 56 commits ahead, head be687192ed):**
- `node --test test/m/ai-runs/`: 132 tests, 132 pass, 0 fail (run twice, before and after the merge).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirement files; 0 failures.
- `node checks/architecture.mjs /home/user/bio ai-runs`: 26 product files, 95 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio ai-runs`: 58 of 58 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio ai-runs tranche/T51 job/T51/ai-runs`: 3 files changed by ai-runs (the two code files and this record); 0 failures.
- `node checks/run.mjs /home/user/bio`: no finding names ai-runs' own files; the one line naming ai-runs is the run-rules finding above.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only, naming the new ids; `rows.mjs` is BOB's regeneration at the layer close, not edited here.

Size (session_013Tga7i7jYNnsamprMqvJ3m): test runs 2, module lines 3804 (`bio-plane/src/ai-runs/*.mjs`, index.mjs and schema.mjs).

## J3 · COMPLETE

**CHANGE B2 (K4015) handled.** Pulled civicos-process `main` @ d424c32. `node checks/words.mjs /home/user/bio ai-runs` first showed one finding, which the new `+`-chain folding exposed: `bio-plane/src/ai-runs/index.mjs` (the planning-run refusal for a caller who is not a member) is now `localize('ai-runs.index.only_a_member_starts', en)`, the text unchanged. Commit on `job/T51/ai-runs`; tranche/T51 merged in again (no change to ai-runs' files).

**Checks, after the fix:**
- `node checks/words.mjs /home/user/bio ai-runs`: 1 module, 5590 literals read; inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, unkeyed 0; 0 failures.
- `node --test test/m/ai-runs/`: 132 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 0 failures. `node checks/architecture.mjs /home/user/bio ai-runs`: 0 failures. `node checks/coverage.mjs /home/user/bio ai-runs`: 58 of 58, 0 failures.
- `node checks/ownership.mjs /home/user/bio ai-runs tranche/T51 job/T51/ai-runs`: 3 files changed by ai-runs; 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only, naming ids from this module and others; `rows.mjs` is BOB's regeneration at the layer close.

**Unkeyed list:** none. No sentence in this module is judged as one no person reads.

**Deferred:** none. The run-rules finding from the first COMPLETE (`bio-plane/src/run-rules/checks.mjs:259`) is reported to BOB separately and is not this module's.

Size (session_013Tga7i7jYNnsamprMqvJ3m): test runs 4 (module suite 3, words check 1 more after the fix ... see the earlier record), module lines 3804 (`bio-plane/src/ai-runs/*.mjs`, index.mjs and schema.mjs).

## J4 · REPORT

G83 change applied on job/T51/ai-runs (commit 625c07d7). Not COMPLETE: the suite cannot load until runtime-limits' store-place.mjs is on tranche/T51.

**Applied (START B3)**
- `bio-plane/src/ai-runs/index.mjs`: imports `storeId`, `storeStub` from `../store-place.mjs`; the own-namespace comparison (`#ownNamespace`, was :2106) is `this.ctx.id.equals(storeId(this.env, name))`; the look-up of the `bio` room from the scratch object (`#credentialLook`, was :2155) is `storeStub(this.env || {}, "bio").fetch(...)`. Nothing else changed; logical names and R2 prefixes are untouched.
- New test `bio-plane/test/m/ai-runs/g83-location.test.mjs` (3 tests, R18 and R28 named): drives `wake` through the scratch object with a recording `env.STORE`, reading each `idFromName` and `get` argument. Run against the unchanged code first: the STORE_LOCATION case and the STORE_GENERATION case are red; the "neither binding" control is green (today's calls). The file does not import the helper.

**Blocked on runtime-limits (merge 7)**
- `node --test test/m/ai-runs/` now fails to load in all 25 files: `ERR_MODULE_NOT_FOUND` for `bio-plane/src/store-place.mjs`. The file is not on tranche/T51 yet (checked at this push).
- Not COMPLETE, per your START. When you post the runtime-limits CHANGE I will merge tranche/T51, run the ai-runs suite, and then the checks.
- One verification attempt on a scratch copy with a stand-in helper was refused by the permission check; I did not retry it.

**Checks run now (working tree at 625c07d7)**
- format: 176 modules, 176 requirement files, 0 failures.
- coverage ai-runs: 59 of 59 live requirement ids named by a test, 0 failures.
- architecture ai-runs: 0 failures; 1 relative import names no tracked file (store-place.mjs, runtime-limits' file), not judged until it merges.
- ownership: to run after the merge (the committed diff is ai-runs' two code files plus the record).

**For BOB**
- Seam: `#ownNamespace` assumes admission's `scopeFor` routes by `storeId` (the same room name). Until admission's job (merge 154) lands, the scope routes by `idFromName`, so a generation-named room would not match in the rare case the object's id came from there. Admission owns that; noted, nothing changed here.
- Deferred: none. Other modules: none found beyond the seam above. Generated artifacts: none touched.
- The `#ownNamespace` doc comment still says `scopeFor` routes to `idFromName("bio")`; left for the admission job's words.

## J5 · COMPLETE

G83 is done in ai-runs: the job is COMPLETE on job/T51/ai-runs (head ff8923d2), with runtime-limits' CHANGE (K4757) merged.

**Entries applied (START B3, CHANGE B4)**
- `bio-plane/src/ai-runs/index.mjs`: the own-namespace comparison (`#ownNamespace`) uses `storeId(this.env, name)`; the `bio` look-up from the scratch object (`#credentialLook`) uses `storeStub(this.env || {}, "bio")`. Import from `../store-place.mjs`. Logical names and R2 prefixes unchanged.
- `bio-plane/test/m/ai-runs/g83-location.test.mjs`: three tests (R18, R28), failing first (the hint and generation cases were red before the change; the no-binding control was green).

**Deferred:** none. **Other modules:** none needing a change. **Generated artifacts:** none touched.

**Checks (at ff8923d2)**
- `node --test test/m/ai-runs/`: 137 tests, 137 pass, 0 fail.
- format: 176 modules, 176 requirement files, 0 failures.
- architecture ai-runs: 28 product files, 100 relative imports, 0 naming no tracked file, 0 failures.
- coverage ai-runs: 59 of 59 live requirement ids named by a test, 0 failures.
- ownership ai-runs (tranche/T51 to job/T51/ai-runs): 3 files changed by ai-runs, 0 failures.
- words ai-runs: 5,742 literals, 0 failures.
- impact (`node build/plan/impact.mjs origin/tranche/T51 HEAD`): 55 of 176 modules affected. The tool reports the shared table change (`DECLARED_OPS` in ai-runs/index.mjs). The users' suites that fail are listed below; none is caused by this change.

**Impacted users (job branch alone, then the tranche tip):**
- `scheduler`, `queue`, `screens-wizards`: pass.
- `affordances` R55 (sever/reinstate): fails on the tranche tip too. Not this change.
- `control-plane` R123, R125 (40 MB five-part upload): fails on the tranche tip too. Not this change.
- `plane` R84 G41 (200,000-row xlsx), R86 G48 (c1), R24 (DEC-149 words): each fails on the tranche tip too. Not this change.
- `plane` R77 L (two cases) and R79 L: failed in my parallel run, pass alone on the job branch. Load-sensitive timing tests; not this change.

**For BOB:** the five pre-existing failures above (affordances R55; control-plane R123; plane R84, R86, R24) are on the tranche tip now. Each is reported here, not fixed (they are other modules'). The timing tests (plane R77 L, R79 L) need a quiet run to show green; they failed only under parallel load.

**Size (session_01XtbBmQVJFxMDuhJvHpZXHZ): test runs 11, module lines 3812** (`bio-plane/src/ai-runs/*.mjs`).

## J6 · COMPLETE

AI-RUNS #28 · fix round 10, Wave A batch 4 (B5): four fixtures published, nine own lines re-pointed. Tests only; no source and no requirement changed, no new requirement id.

**Published** in `bio-plane/test/m/ai-runs/fixtures.mjs` (new), each made by the real code at test time, each called and checked by `fixtures.test.mjs` (R18, R52 R78, R5 R37, R45):
- `airunDispatchRefusal(code)`: MEMBER_RUN_MODE_NOT_ADMITTED and AI_RUN_NOT_PRINCIPAL from `dispatchMemberRun`; ACCOUNT_MEMBER_NOT_ACTIVE (ai-accounts' row) and AI_RUN_CREDENTIAL_MALFORMED (credentials' row) from the real `aiRunCredentialMint`, the call the dispatch relays unchanged.
- `airunOpenRefusal(code)`: AI_RUN_MODE_NOT_DEPLOYED and AI_NO_ACCOUNT from the real `open`; AI_LIMIT_REACHED is ai-use's own published `ceilingRefusal()` (fields whose, period, use) which the open relays.
- `airunRefusal()`: `notPrincipal` (airunclose) and `tickNotPrincipal` (airuntick) by a caller who is not the principal (AI_RUN_NOT_PRINCIPAL, C-22.12, translation); `unseenRead` / `unseenLog` (op airun / airunlog by a viewer who cannot see the run) and `unknownRead`. A read the viewer may not see answers `{found: false}`, the same as an unknown run: there is no separate "not visible" code in ai-runs (agent-worker's AI_RUN_NOT_VISIBLE, requirements.test.mjs:467, is a code no product file gives; that job replaces it by this answer or by AI_RUN_NOT_PRINCIPAL).
- `tickStateTooLarge({bytes})`: the real tick's AI_RUN_STATE_TOO_LARGE, C-22.18, with `bytes` and `limit` (262,144).

**Own lines (9), all done or waiting:**
- inquiry/migratedSurfacing: world.mjs `inquiryStub` removed (the world now leaves `inquiry` to the module's own default, the real inquiry over its storage); plan.test.mjs R27 takes inquiry's fixture (`migratedSurfacing()`: its real inquiry, the migrated and the plain question, the real answer).
- steps/stepsWorld: world.mjs `stepsStub` removed; t41.test.mjs (B2, both R73, R74) and t46.test.mjs:108 and words.test.mjs (two tests) take steps' fixture (`stepsWorld()`: the real steps with its recorded acts, the real visibility, the real refusals). Judgment points: ids are steps' own now (no `STP-1`); a step the opener cannot see is a step in a hidden project's question (`QH` of steps' `fixture.mjs`, with `CAT`, `QP1`); B2 drives the run holder through steps' real `stepCreate` (the holder is steps' to ask), and a member's own credential `member:ann/tok-ann` is no machine to steps, so steps never asks the holder for it (the old direct `fn(ANN_CRED, "R2")` check had no counterpart at steps' interface and is gone; the machine arms, the system identities, the principal's sight and the ended run are checked there). The real steps accepted `recordProduct` with `{kind: "capture", id}` for a capture the world registers (`world.capture`), so no mismatch between ai-runs and steps' interface was found.
- CODE: reexam.test.mjs:111 now uses `PLAN_NOT_OPEN` with its real check `C-124.61` (no marker needed; the check accepts it).
- FIX-L markers, waiting for their providers' `fixtures-run` (shown as `contract-no-run` until merged): plan.test.mjs:94 `// fixtures-contract: action-plans plan-open-check`; scheduler.test.mjs:238 and t46.test.mjs:352 `// fixtures-contract: agent-worker dispatch-refusal` (the invented `{reason: "NO"}` at status 403 replaced by agent-worker's real `BAD_BODY` at 400; the assertions read the dispatch state only, which is unchanged).

**Markers added:** three `fixtures-contract` lines above. No `fixtures-own`, no `fixtures-generic`.

**Left in the live list (named, waiting):** plan.test.mjs:95 (action-plans), scheduler.test.mjs:239 and t46.test.mjs:353 (agent-worker): `contract-no-run` until their providers' `fixtures-run` lines merge. `orphan-run`: none (I wrote no `fixtures-run`; the users of my four fixtures are screens-inquiry (assistant.test.mjs:190, :225), agent-steps (interface.test.mjs:36, :207, :281 per part-5), agent-worker (requirements.test.mjs:467, :516, :1032), who re-point in their own jobs).

**Other modules:** none found. Note for the users of `airunRefusal`: agent-worker's `AI_RUN_NOT_VISIBLE` and agent-steps' `CLOSE_REFUSED`/`AI_LOG_REFUSED` are codes no product file gives (part-2 "Codes to confirm"); the real ones are in this fixture's answers.

**Run:** ai-runs tests, all 25 files: 141 tests, 141 pass, 0 fail. `checks/fixtures.mjs /home/user/bio ai-runs --list`: 3 failures, all contract-no-run (above); stub 0, code 0, answer 3. `checks/format.mjs`: 178 modules, 0 failures. `checks/words.mjs ... ai-runs`: 0 failures. `checks/architecture.mjs`: 0 failures. `checks/coverage.mjs`: 59 of 59 live requirement ids named, 0 failures. `checks/ownership.mjs ... tranche/T51 job/T51/ai-runs`: 0 failures. `build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 178 (tests only), so no user's tests to run. Generated artifacts made stale: none.

Size (session_013fMeokVqHBqehW2ZZc86MS): test runs 14, module lines 3812

## J7 · COMPLETE

AI-RUNS #29 · fix round 10, follow-up 21 (B6): plan-open-check contract. Test only; no source, requirement or id change.

**Applied.** `bio-plane/test/m/ai-runs/plan.test.mjs:95` (R47): the hand-built open-check refusal now carries `code: "PLAN_CLOSED"` and `check: "C-124.10"`, the real answer of action-plans' open check for a closed plan (`fixtures.test.mjs`, `fixtures-run: ai-runs plan-open-check`, read whole first). Its `translation`, `detail` and `extra` are unchanged; the test still checks relay unchanged. Commit 50f8d6e49d on job/T51/ai-runs.

**Checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/ai-runs/*.test.mjs`: 141 tests, 141 pass, 0 fail.
- `checks/fixtures.mjs /home/user/bio ai-runs --list`: plan.test.mjs:95 now `accepted(plan-open-check)`. Two failures remain, both my own FIX-L markers waiting on agent-worker's `fixtures-run: ai-runs dispatch-refusal` (not this follow-up's scope): scheduler.test.mjs:239 and t46.test.mjs:353, `contract-no-run`. No `fixtures-own` or `fixtures-generic` marker added.
- `checks/format.mjs /home/user/bio`: 178 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio ai-runs`: 0 failures.
- `checks/coverage.mjs /home/user/bio ai-runs`: 59 of 59 live requirement ids named, 0 failures.
- `checks/words.mjs /home/user/bio ai-runs`: 0 failures.
- `checks/ownership.mjs /home/user/bio ai-runs tranche/T51 job/T51/ai-runs`: 1 file changed by ai-runs, 0 failures.

**Deferred:** none. **Other modules:** none found. **Generated artifacts made stale:** none.

**Note for BOB:** the job branch was 458 commits behind origin at start; my first `mail start` hit a rebase conflict on my own record. I aborted it, kept the old local branch as `stale/ai-runs-local` (its one start commit, af267bbab9), reset to origin/job/T51/ai-runs and re-ran start as the job's instructions say. Nothing from the stale branch was lost or merged.

Size (session_019UFFfaJbR6QhDzY4q1jnEB): test runs 1, module lines 3812
