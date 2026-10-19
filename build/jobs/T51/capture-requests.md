# capture-requests (T51)

**Status** · session_019pe7uRW2gPXhRG61G9zuCe · depth 2 · COMPLETE · handled B2

## Completion (T51-59 · red #27, N1243)

**Entry applied.** T51-59: `bio-plane/test/m/capture-requests/plane.test.mjs`, the R48 (T50) test, its ghost arm.

**Diagnosis (no source fault).** The test's ghost arm sent `acquire` with `for: "INQ-2026-9999-none"`, a question no inquiry answers to. Control-plane R105 (T50, `build/requirements/control-plane.md`) refuses such a `for` at the door as acquisition's `BAD_FOR` (C-139.21) before any fetch, so `holdAcquired` failed on its first assertion. The reader itself (`capturedFor`, R48) answers that case as the spec states, and the unit test `t50.test.mjs` (R48, "a question not held") asserts it.

**Change.** The ghost arm now asserts what the plane does: `acquire` answers `ok: false, code: BAD_FOR, check: C-139.21`, and no fetch is made for the ghost address. The test's title is amended to say so. Nothing else in the test changed; the control arm (no `for`, no request) is unchanged.

**Decision for Bob to file in `build/rulings.md` (lower-level, recorded here per JOB rule 1).** The plane cannot reach the reader's withheld branch through `acquire`, because R105 requires the question visible at acquire time. Reaching it at plane level would need a question a viewer loses sight of after acquisition, which means a hidden-project fixture (project creation, owner claim, visibility) that this test does not build. I chose the R105 assertion over that fixture. The withheld branch stays covered at unit level.

**Deferred.** None.

**Found in another module.** None from my reading of this module's code and tests.

**Reading.** Read whole: the module's requirements (public and private parts), this job's entry, `build/layers.md`, `bio-plane/src/capture-requests/index.mjs` (1,943 lines, in six reads), `checks.mjs`, `schema.mjs`, the R48 section of `plane.test.mjs`, and `t50.test.mjs`. For the services the entry touches, I read R105's text and acquisition R47's summary from the T50 job record, but not capture R83/R94 whole. I ran the module's other test files without reading them.

**Tests and checks.**
- `plane.test.mjs`: 7 of 7 pass (before the change, the R48 T50 test failed with `BAD_FOR`).
- All `test/m/capture-requests/*.test.mjs`: 127 of 127 pass.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio capture-requests`: 0 failures.
- `checks/coverage.mjs /home/user/bio capture-requests`: 56 of 56 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio capture-requests tranche/T51 job/T51/capture-requests`: 0 failures (1 file changed).
- `checks/run.mjs /home/user/bio`: no capture-requests line. Its 24 failures are coverage gaps in other modules (for example agent-steps, interface-shell, screens-inquiry), not this one.

**Stale text noted, not changed.** The requirements' Size note says "about 1,050 lines"; the module's own code is 2,653 lines (`index.mjs` 1,943, `checks.mjs` 454, `schema.mjs` 256). The requirements file is not this job's to edit, so I report it to Bob.

**Size (session_01Qs8rZ8r9tU9hSh4VTyESSo): test runs 3, module lines 2653.**

## J1 · COMPLETE

T51-59 done (red #27, N1243). plane.test.mjs R48 ghost arm: the 'for' naming no question is refused BAD_FOR (control-plane R105, C-139.21) before any fetch; the arm now asserts that refusal and no fetch. No source fault. Plane test 7/7; all module tests 127/127; format, architecture, coverage (56/56) and ownership pass. checks/run.mjs shows no capture-requests line (24 coverage gaps are other modules). For Bob to file in build/rulings.md: the plane cannot reach the withheld branch through acquire (R105 needs the question visible at acquire time); unit coverage in t50 stays. Pushed to job/T51/capture-requests at d552c1f40d. No PR opened, per JOB step 1. Full record: build/jobs/T51/capture-requests.md.

## Completion (T51-213 · the words pass, K3949, K3957, K3962)

**Entries applied.** T51-213: all 18 findings of `checks/words.mjs` listed in `build/plan/words-pass/capture-requests.md`, the 3 `plain` findings (K3957) and the 3 test copies of code sentences (K3962), each by the words rule.
- `index.mjs` 1077, 1080 and the stitched tail: the bundle summary, both branches (a run's request and a member's own request), and its bytes sentence, through `localize` (`capture-requests.index.document_served_run`, `…document_served_member`, `…filed_under_the_sweep`, `…under_the_question`, `…bytes_exactly_as_served`).
- `index.mjs` 263: the no-run note, `localize` `capture-requests.index.pass_run_the_run_asking`.
- `index.mjs` 673, 675, 676 and the copy at 673: the held-expiry word's pieces through `localize` (`render_never_performed`, `nothing_fetched_after_expiry`, `reason_last_given`, `no_further_detail`); the fallback "(no code: never attempted)" through the existing row `word("capture-requests.code_attempted")`.
- `index.mjs` 948: the sweep name refusal, `localize` `capture-requests.index.not_a_sweep_name`.
- `index.mjs` 647, 1111 and 1708 (plain): `localize` `capture-requests.index.no_daemon_credential_bound`, `…promotion_did_not_complete`, `…is_not_a_sweep_your_team` (the last is `SWEEP_REFUSALS.unknown`).
- Test copies: `fixture.mjs` 102–105 now carry fixture wording, not the product's (the run's whole-tree check also found 104–105, copied from acquisition's `localize`); `t34.test.mjs` 132–139 compares each named C-28 translation with `word("refusal.<CODE>")` by equality, holding no sentence; `t34.test.mjs` 13 and `t50.test.mjs` 11 reworded the assertion messages (each copied a words row).
- Beyond the findings, the same words rule (R13): `checks.mjs` C-28.1, C-28.4, C-28.16 and C-28.21 translations read `word("refusal.<CODE>")` (their rows exist; the first two now show the list's spelling, e.g. "authorizes"); `index.mjs` 288 (the host-readability detail, neither flagged nor on the design's unkeyed list) through `localize` `capture-requests.index.no_host_readable`; `t35.test.mjs` 467 and `sweep.test.mjs` 97 hold the sweep sentence through `localize`, not a regular expression.

**Deferred.** None. The rest of this module's inline literals (the design's `unkeyed` list, 64 entries) stay in source, as DEC-258 and DEC-260 keep them (K3944).

**Found in another module.** None in code.

**For Bob (not my decisions).**
1. The design's `words-reads.json` unkeyed list spells several of this module's sentences "your group's Civicsmith" (the no-daemon-credential detail, the promotion detail, the step tie, the scope-check detail, the unknown-sweep detail). The source and the words rows say "your team's Civicsmith". R54 says "group". One of them is stale; the design stream should say which, and the list's entries will then match.
2. `checks/words.mjs` does not count a `+` chain of pure string literals that ends in a sentence (the case of 288 above). Those are invisible to the check; R13 binds them, so they need the check's stitched arm extended or a review pass.
3. `rows.mjs` is stale (`setup-words/build.mjs --check` says so). I did not regenerate it; BOB regenerates at the layer close.

**Reading.** Read whole: `build/requirements/capture-requests.md` (both parts), `build/layers.md`, `bio-plane/src/capture-requests/index.mjs` (1,909 lines), `checks.mjs` (403), `setup-words/index.mjs`, the words-pass file, and the test files that hold findings (`fixture.mjs`, `t34.test.mjs`, `t50.test.mjs`); the job entry and the tranche merge. I ran the module's other test files without reading them, and read `t35.test.mjs` and `sweep.test.mjs` only at the lines the findings name.

**Tests and checks.**
- `node --test bio-plane/test/m/capture-requests/*.test.mjs`: 127 of 127 pass (before the fixture and line-288 edits, and after both).
- Related tests (`acquisition/sweep-scope`, `co-archive`, `checks`, `selflink-render`; `scheduler/plane`, `producers`; `inquiry/document-waits`; `plane/sweep`; `record-core`; `skills/lookup`): 153 of 153 pass.
- `checks/words.mjs /home/user/bio capture-requests`: 0 failures (it was 23 before the pass: 9 inline, 3 plain, 11 testcopy).
- `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs /home/user/bio capture-requests`: 0 failures. `checks/coverage.mjs /home/user/bio capture-requests`: 56 of 56 live ids named, 0 failures.
- `checks/run.mjs /home/user/bio`: no capture-requests line; its other failures are in other modules.
- `bio-plane/src/setup-words/build.mjs --check`: `rows.mjs` stale (expected, not regenerated); no refusal names this module.
- `checks/ownership.mjs` after the commit: see the posted COMPLETE.

**Size (session_019pe7uRW2gPXhRG61G9zuCe): test runs 4, module lines 2559.**

## J2 · COMPLETE

T51-213 is done (the words pass for capture-requests), committed and pushed at c85a755476. Record: build/jobs/T51/capture-requests.md, section "Completion (T51-213)".

Done: all 18 findings of checks/words.mjs, the 3 plain sentences (K3957) and the 3 test copies (K3962). Also the C-28 translations that still held literal text now read their words rows, and one unflagged sentence (index.mjs:288) is keyed. Nothing deferred. The design's unkeyed list stays in source.

Checks: words 0 failures (was 23); module tests 127/127; related tests 153/153; format, architecture, coverage (56/56) and ownership (8 files, this module only) all 0 failures. checks/run.mjs has no capture-requests line.

For Bob, not decided here:
1. The words-reads.json unkeyed list says "your group's Civicsmith" for several sentences; the source and the words rows say "your team's". One is stale.
2. checks/words.mjs does not count punctuated pure-literal "+" chains, so such sentences are invisible to it (R13 binds them).
3. rows.mjs is stale; not regenerated (BOB regenerates at the layer close).

No PR opened, per JOB step 1.
