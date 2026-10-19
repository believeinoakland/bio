# run-productions (T51)

**Status** · session_01W8n89yfSFWhfBxwhhKKJLr · depth 2 · WORKING · handled B0

## J1 · REPORT

Found outside run-productions, not changed by this job (for BOB to route to the owning modules):

- The repository-wide `checks/run.mjs` words arm reports 3361 failures in other modules (inline 2455, plain 844, testcopy 734, handlist 172, unkeyed 2062 not counted), and the coverage arm 28 failures, all outside run-productions. run-productions' own words and coverage arms are clean (below).
- `bio-plane/src/setup-words/build.mjs --check` reports rows.mjs stale. That is the expected stale-rows note: the new ids `run-productions.index.*` are not yet in rows.mjs, which BOB regenerates at the layer close. No refusal names run-productions.

## J2 · COMPLETE

CR-10 done; everything in the entry is applied. Nothing deferred.

Entry applied:
- (W) the two words findings: the earned link's reason (index.mjs ~813) now reads its three shapes through localize: run-productions.index.link_source_own, link_shared_identifier, link_date_alone, link_name_alone (and link_name_alone for the name case).
- (K3957) the five plain findings, each a sentence a member reads, so each through localize: index.mjs:84 proposed_connection_says, :88 bearing_note_says, :633 the_extract_role_works (NO_RUN), :640 no_such_run_is_open (NO_SUCH_RUN, with {runId}), :816 earned_undetermined_quote. None is developer or wire text, so nothing is listed as unkeyed for the design.
- R26 (a suggestion on a divided question): no code change was needed. suggest reaches basis-versions' appendVersion, which answers inquiry's DIVIDED_CANNOT_RESTRUCTURE (from "divided"), and suggest relays it unchanged with its R2 memo. The new test is bio-plane/test/m/run-productions/divided.test.mjs (3 tests, named R26): the real inquiry and basis-versions refuse with that code, nothing is written, bundle_sha and bytes are unchanged, the verbatim resubmit answers the memo, and a control on an open question reaches the write (stand-in promotion, as the other suggest tests use).
- Fixture: bio-plane/test/m/run-productions/fixture.mjs inquiryMd now writes surfaced_by: human, which the real inquiry grammar (C-2.8) requires. Test fixture only.

Commit 36e59d5477 on job/T51/run-productions, pushed. I opened no pull request (JOB step 1).

Tests and checks (run from civicos-process against /home/user/bio):
- node --test bio-plane/test/m/run-productions/: 62 pass, 0 fail (5 test runs in all this session).
- checks/words.mjs run-productions: 0 failures (was 7). Repo-wide run: see REPORT.
- checks/format.mjs: 0 failures.
- checks/architecture.mjs run-productions: 0 failures.
- checks/coverage.mjs run-productions: 26 of 26 live requirement ids named by a test, 0 failures (R26 is now named by divided.test.mjs; its "not yet met" status line in the requirements is BOB's to change, and I left it).
- checks/ownership.mjs run-productions tranche/T51 job/T51/run-productions: 4 files, 0 failures.
- setup-words build.mjs --check: stale rows.mjs only, as expected.

Size (session_01W8n89yfSFWhfBxwhhKKJLr): test runs 5, module lines 2237
