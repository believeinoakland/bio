# link-sweep (T51)

**Status** · session_014LubSgUXQ2457eSNMheo6B · depth 2 · WORKING · handled B8

## Completion (T51-242, words)

**Entries applied.** T51-242: the three inline findings and the twelve plain findings of `build/plan/words-pass/link-sweep.md`, each read through `localize('link-sweep.<file stem>.<slug>', en, vars)`; the sentences the rule binds that the check does not count (under five words, punctuated, or held in a refusal's construct or detail) converted too (setup-words R13).

Changes, by file (commit `1af3138760`):
- `checks.mjs`: the grammar's messages (`is missing`, the id, `must be boolean`, `must be an object`, the budget's sentence) through `localize`.
- `sweep-match.mjs`: every refusal's construct and detail through `localize`, since `SWEEP_TERM_REFUSED` shows both to members.
- `sweep.mjs`: the three inline and plain findings; the standing's reasons now carry a code (`not_ratified`, `definition`, `paused`, `daemon_off`, `closed`, `held`) that `plan()` compares, and the sentence is rendered for members beside it (K3971: no code compares a sentence); the run's note, its observation details, the scope check's details and the promotion refusal's default through `localize`.
- `sweep-grammar.test.mjs`, `sweep-run.test.mjs`: the sentences they had copied are read through `localize` and compared by equality.

Choices, for BOB's record: a sentence whose text is a code fragment (`out_of_scope_redirect to {target}`, `format_excluded; {format}`) keeps its wording byte for byte, so the observation log reads as before. No `localize` id is shared between two sentences.

**Deferred.** None.

**Found in another module.** None in this job. The repo-wide runs below show other modules' open findings; none names `link-sweep`.

**Tests and checks** (run after the last change):
- `node --test test/m/link-sweep/*.test.mjs` (bio-plane): tests 29, pass 29, fail 0.
- `node checks/words.mjs /home/user/bio link-sweep`: inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 0; 0 failures (was 15).
- `node checks/words.mjs /home/user/bio monitoring following link-sweep scheduler`: 60 failures, none naming `link-sweep` (other modules' lines).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio link-sweep`: 0 failures.
- `node checks/coverage.mjs /home/user/bio link-sweep`: 12 of 12 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio link-sweep tranche/T51 job/T51/link-sweep`: 6 files changed by link-sweep; 0 failures.
- `node checks/run.mjs /home/user/bio` (saved output, grep for `link-sweep`: none): format 0 failures, architecture 0, channels 0; coverage 24 failures and words 1161 failures, all in other modules; exit 1 from those.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for `link-sweep.checks.is_missing` (expected: `rows.mjs` is regenerated at the layer close; not edited here). No refusal.

**Size (session_01HmAPWZPEejc5eMANEyUgYq):** test runs 1, module lines 1106.

## J1 · COMPLETE

T51-242 (words) done on job/T51/link-sweep at 1af3138760 (code, tests) and the record's completion section. Words check for link-sweep: 0 failures (was 15). Module tests 29/29 pass. Format, architecture, coverage, ownership: 0 failures. setup-words --check: the expected stale-rows note for link-sweep.checks.is_missing only. Other modules' repo-wide findings (run.mjs words 1161, coverage 24; cross-module words 60) name no link-sweep line. Deferred: none. Waiting on BOB (J1).

## J2 · REPORT

Entries 1-4 (R13 sweepSet, R14 sweepRatify, R15 DECLARED_OPS for sweeps, sweepset, sweepratify) are built and pushed on job/T51/link-sweep, with tests (sweep-write.test.mjs, declared-ops.test.mjs; seam.test.mjs updated for the new row and ops). Three things are BOB's:

1. monitoring R77's `sweepHost().write` is not on tranche/T51 nor on job/T51/monitoring yet (checked just now). My arms call `host.write({bundle, mutate, author, viewer, log})` as R77 states it (mutate edits the parsed object in place and returns it; log is the Session Log sentence). I ran my 39 tests against a throwaway stand-in of `write` kept outside the repo (all pass); they must be re-run against monitoring's real one. I will merge tranche/T51 after monitoring merges. Please tell me when it has, or say if the `write` shape differs.
2. modules.json: `link-sweep` does not use `test-support`, so `node checks/architecture.mjs` fails on declared-ops.test.mjs ("imports bio-plane/test/declared-ops.mjs of test-support, which link-sweep does not declare in uses"). B2 says no edge to add; money and others have it. Please add `test-support` to link-sweep's uses.
3. plane (not mine): `bio-plane/src/plane/store.mjs:863` calls `linkSweepOps(linkSweepOf(ctx), url)` without the body; `sweepset` and `sweepratify` read the POST body, so that line needs `, body` as every neighbour has. Until plane does so the two ops get an empty body.
Also for the record: the new row MACHINE_CANNOT_SET_SWEEP took C-18.24 (monitoring's two new rows should take C-18.22 and C-18.23; renumber if they differ). Its translation is read by localize('link-sweep.checks.machine_cannot_set_sweep') since refusal.* rows do not exist in rows.mjs yet.

## J3 · COMPLETE

FR-37 (B2) complete on job/T51/link-sweep.

Entries applied: 1 (R13 `sweepSet`, `op=sweepset`), 2 (R14 `sweepRatify`, `op=sweepratify`), 3 (R15 `DECLARED_OPS` extended with `sweepset`, `sweepratify`; the ratify screen's words by key), 4 (the `sweeps` declaration, already present, kept as is). Requirement lines R13–R15 are BOB's own (written K4189, still marked *(not yet met: T51)*; every id is now named by a test, so BOB may lift the mark). No new R line of mine was needed: R15 states all three declared ops.

Against monitoring's real writer: after merging tranche/T51 (monitoring R77 is on it), `sweepHost().write({bundle, mutate, author, viewer, log})` has the shape J2 assumed; my 39 tests, which ran earlier against a stand-in, pass against it unchanged. Row `MACHINE_CANNOT_SET_SWEEP` stands at C-18.24 (B5).

Deferred: none. Found in another module: the plane's `store.mjs:863` missing `body` (already sent to the plane by BOB, B5); otherwise none. Hand rows in `op-declarations`/`op-grades` for `sweepset`, `sweepratify`, `sweeps` can go now that this module declares them.

Tests and checks (run after the last change, process repo pulled):
- `node --test test/m/link-sweep/*.test.mjs` (bio-plane): tests 39, pass 39, fail 0.
- format: 175 modules, 0 failures. architecture link-sweep: 0 failures. coverage link-sweep: 15 of 15 live ids named; 0 failures. ownership: 7 files changed by link-sweep; 0 failures.
- words link-sweep: 0 failures; words monitoring following link-sweep scheduler: 0 failures (dev 3, unkeyed 52 are other modules').
- setup-words `build.mjs --check`: stale-rows note only (names ai-accounts, not this module); no refusal.
- `checks/run.mjs` full run not repeated this restart; the per-check runs above cover format, architecture, coverage, words and ownership for this module.

Size (session_01Th8FDaUxr9PkjaKXvKcKvP): test runs 2, module lines 1230

## J4 · COMPLETE

B6 (CHANGE, K4230) applied on job/T51/link-sweep at cf794caf96 (tranche/T51 merged first, 11c04574b5).

**Entries applied.** `needs` added to the two mutating rows of `DECLARED_OPS` (bio-plane/src/link-sweep/index.mjs): `sweepset` and `sweepratify`, each `needs: "contribute"`.

**Choice and why.** `contribute`. A member's act on a team's sweeps is a member's own bundle-directed write that fetches nothing, the same shape as monitoring's `namedrequestset`, which declares `needs: "contribute"`. The owner-only ratify is refused by the arm (R3, R14: SWEEP_RATIFY_NOT_AN_OWNER), not by a capability. A stop by any writer is also `contribute`. `administer` is not a working capability in op-capabilities (it moves only by the roster's own mechanism), so it was not an option.

**Requirement line.** R15 amended in build/requirements/link-sweep.md (K4230): every mutating row declares its `needs`; `contribute` for both.

**Test.** declared-ops.test.mjs, "R15 link-sweep declares a need on every mutating op it serves ...": the shape check (no mutating row without `needs`, checked on this module's own rows; op-declarations is not imported), pins `contribute` on both, and a control names a mutating row with no need and passes a read. Written first and seen failing (sweepset and sweepratify listed as missing `needs`), then the two rows edited.

**Deferred.** None.

**Found in another module.** None in this job.

**Tests and checks** (after the last change):
- `node --test test/m/link-sweep/` (bio-plane): tests 40, pass 40, fail 0.
- `node checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio link-sweep`: 0 failures.
- `node checks/coverage.mjs /home/user/bio link-sweep`: 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/words.mjs /home/user/bio link-sweep`: 0 failures.
- `node checks/run.mjs /home/user/bio` (saved output, grep for `link-sweep`: none): format 0 failures, architecture 1 failure, channels 0, coverage 4 failures, words 27 failures, all in other modules (run exit 1 from those).
- `node bio-plane/src/setup-words/build.mjs --check`: "words-unreviewed.json is stale or absent". This job changed no sentence a member reads, so it is not from this change; no refusal names link-sweep.
- `node checks/ownership.mjs /home/user/bio link-sweep tranche/T51 job/T51/link-sweep`: 1 failure, `build/requirements/link-sweep.md` outside link-sweep's paths, tests and job record. Per B3 that listing of the one requirements file is accepted at merge.

**Size (session_011Wj2qq9nxhTBq6sjHBwEG7):** test runs 3, module lines 1230.

## J5 · COMPLETE

B7 (CHANGE, K4247) applied on job/T51/link-sweep at b79e0bbc0a (tranche/T51 merged first, ec4eb7f40c).

**Entries applied.** The `sweeps` row in `DECLARED_OPS` (bio-plane/src/link-sweep/index.mjs) is `weight: "read"`; it was `"reversible"`. The row writes nothing (`mutating: false`), so op-grades refuses a rung on it (`rung-on-read`, its R49). op-grades' hand row for `sweeps` is a read (NON_ACTS), so the two agree: `registerDeclaredOps` answers `agreed: ["sweeps"]` and registers `sweepset` and `sweepratify`, with no refusal.

**Test.** declared-ops.test.mjs, "R15 link-sweep's sweeps row is a read: ...". It registers the module's whole `DECLARED_OPS` through a fresh op-grades instance: no refusal, `agreed` is `["sweeps"]`, `registered` is the two mutating ops, and `RUNGS` holds no `sweeps`. Control: a copy of the row with `weight: "reversible"` is refused `DECLARED_OP_BAD_WEIGHT`, naming `sweeps` and `rung-on-read`. The test was written after the weight change, so it was not seen failing against the old row; the control is that check. Its first run failed on my own assertion (the answer lists `sweeps` under `agreed`, not `registered`); the assertion was corrected to that shape, nothing else changed.

**Plane.** `node --test bio-plane/test/m/plane/` (run from /home/user/bio after merging tranche/T51): tests 45, pass 6, fail 39. All 39 failures are `DECLARED_OP_BAD_WEIGHT: groupdescriptiondraft rung-on-read`, refused whole at the plane's start. None names `sweeps` or any link-sweep op. `groupdescriptiondraft` is not link-sweep's; B7 says STORE-DOOR #14 fixes that row. I did not run the plane before the weight change, so I cannot give the count from before it.

**Requirement line for BOB (R15 amendment).** Add to R15, after "(`sweeps`)": "`sweeps` is a read (`weight: "read"`: it writes nothing, so a rung on it is refused, op-grades R49); op-grades' hand row agrees." Test: declared-ops.test.mjs, the registration test above. I did not edit build/requirements/link-sweep.md; BOB may write this line from this record.

**For BOB, a question (not changed here).** bio-plane/src/op-grades/marks.mjs lists `sweeps` as "Reversible" (the design kit's drawn mark, source `kit`). Its header says the table grades nothing, so it does not cause this refusal. It still differs from the declared "read", so the design may want its mark for a read changed. This is UX design's to answer; this job did not touch op-grades.

**Deferred.** None.

**Found in another module.** `groupdescriptiondraft`: its declared row reads with a rung, and it is what refuses the plane's start now (see Plane). STORE-DOOR #14 owns it, per B7.

**Tests and checks** (after the commit b79e0bbc0a):
- `node --test test/m/link-sweep/*.test.mjs` (bio-plane): tests 41, pass 41, fail 0.
- format (`checks/format.mjs /home/user/bio`): 175 modules, 175 requirements files; 0 failures.
- architecture link-sweep: 0 failures. coverage link-sweep: 15 of 15 live requirement ids named by a test; 0 failures.
- words link-sweep: 0 failures.
- ownership (`checks/ownership.mjs /home/user/bio link-sweep tranche/T51 job/T51/link-sweep`): 3 files changed by link-sweep; 0 failures.
- `checks/run.mjs /home/user/bio` (saved output): exit 1, from other modules' findings only (words 31 failures, of which testcopy 24, missingkey 6, inline 1; dev 266 and unkeyed 1977 are counted, not failures). Grep for `link-sweep`: none.
- Before tests (K4113): `npm ci --ignore-scripts` in agent-runner, bio-plane/src/journey-check, file-scanner, sheet-worker, site, all missing node_modules.

**Size (session_01TKfaRpezEfw8cgXa711BFo):** test runs 4, module lines 1230.

## Completion (fix round 10, Wave A batch 5; LINK-SWEEP #7, B8)

**Causes done.**
- `capture-requests/sweepScopeRegistrar` (fixture.mjs:74, FIX-E): `stubCaptureRequests` is gone. `world()` builds the real `captureRequestsOf` (migrated) and wraps it in `recordingCaptureRequests`, which delegates `registerSweepScope` to the real one and only records what it accepted, so a test reaches the registered check. The slot's `LISTENER_DECLARED` refusal is now the real one. capture-requests has no `fixtures.mjs` on the branch, so the real module is the fixture.
- `acquisition/acquireRefusals` (fixture.mjs:201, FIX-E): the scripted site's refusal for a missing or failing address is `acquireRefusals({kind: "source_refused"})` from `test/m/acquisition/fixtures.mjs` (the real 502 SOURCE_REFUSED). The source's status in the body is the provider's (410); no link-sweep test reads it (`fail: 503` stays an input only).
- Three contracts run against the real code, all in the new `bio-plane/test/m/link-sweep/contracts.test.mjs`, each value stated as data: `// fixtures-run: monitoring sweep-fence`, `// fixtures-run: monitoring sweep-mutate`, `// fixtures-run: capture-requests sweep-scope`.

**Values the users must equal (real answers; the users change where theirs differ).**
- `sweep-fence`: the refusal is `{ok:false, reason:"SWEEP_NOT_A_MEMBER", code:"SWEEP_NOT_A_MEMBER", check:"C-18.17", translation, detail, sweeps:[ids]}`; admitted is `null`. monitoring's stand-in (`{ok, reason, code, detail}` only) lacks `check`, `translation` and `sweeps`.
- `sweep-mutate`: `{ok:false, reason:"NO_SUCH_SWEEP", code:"NO_SUCH_SWEEP", sweep:<name>, detail}`, never `reason` alone. monitoring's `{ok:false, reason:"NO_SUCH_SWEEP", detail:"no such sweep"}` lacks `code` and `sweep`.
- `sweep-scope`: `{ok:false, reason: unknown|unratified|held|out-of-scope, detail?}` (`unratified` carries no detail) or `{ok:true, scope:[the sweep's sources]}`; in scope is equal or continuing at a `/` (`…/council`, `…/council/x` in; `…/councilor` out); an empty locator list is `out-of-scope`, "no locator was named".

**Fixture lines.** `checks/fixtures.mjs . link-sweep --list`: answer 0, stub 0, code 0, contract 0; 0 failures. Lines left: none. No `fixtures-own` or `fixtures-generic` marker added. The three `fixtures-run` lines show `orphan-run` for monitoring (2) and capture-requests (1) until their markers are merged.

**Needs BOB (one item).** `architecture link-sweep` fails on `fixture.mjs`, which imports `acquisition/fixtures.mjs` while `link-sweep` does not declare `acquisition` in `uses` (`build/modules.json`, line 144). The requirement text already names acquisition (R5, R31). Adding `"acquisition"` to link-sweep's `uses` clears it; modules.json is not mine to edit. Every other check is green.

**Deferred.** None. **Found in another module.** `node bio-plane/src/setup-words/build.mjs --check` reports `rows.mjs` stale at word 20125 (basis-version-grammar); not mine, and it fails the same without my change.

**Tests and checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/link-sweep/*.test.mjs`: tests 44, pass 44, fail 0.
- `bio-plane/test/m/scheduler/consumers.test.mjs` (the one user of link-sweep's fixture, named by impact): tests 13, pass 13, fail 0.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: link-sweep 7/7, scheduler 1/20; affected modules 2 of 178.
- format: 178 modules; 0 failures. coverage link-sweep: 15 of 15 ids named; 0 failures. words link-sweep: 0 failures. ownership link-sweep tranche/T51: 0 failures. fixtures link-sweep: 0 failures. architecture link-sweep: 1 failure (the `uses` item above).

**Size (session_014LubSgUXQ2457eSNMheo6B):** test runs 8, module lines 1230.
