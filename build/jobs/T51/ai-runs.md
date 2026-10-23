# ai-runs (T51)

**Status** · session_01XtbBmQVJFxMDuhJvHpZXHZ · depth 2 · WAITING ON BOB (J4) · handled B2

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
