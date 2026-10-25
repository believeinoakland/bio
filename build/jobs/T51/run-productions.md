# run-productions (T51)

**Status** · session_01DmrwrogYnk1Yq7FyATTh2Y · depth 2 · RUNNING until 2026-10-25T10:33:17Z (agent-worker tests named by impact) · handled B2

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

## J3 · COMPLETE

CHANGE B2 (K4015) done. Commit c6815681ed on job/T51/run-productions, pushed; tranche/T51 merged in first.

The new words check found four more member-read sentences, all converted by localize with run-productions.index.<slug> ids, each a single literal:
- EXTRACT_PROPOSALS_SAYS (index.mjs:76): extract_proposals_says
- EXTRACT_PROPOSAL_ROW_SAYS (:79): extract_proposal_row_says
- READ_PAGES_SAYS (:86): read_pages_says
- CONNECTION_PERSON_NO_ROLE detail (:928): connection_person_no_role

Nothing judged as text no person reads, so nothing is listed for the unkeyed list.

Tests and checks, from civicos-process against /home/user/bio:
- node --test bio-plane/test/m/run-productions/: 62 pass, 0 fail.
- checks/words.mjs run-productions: 0 failures (was 4 after the CHANGE).
- checks/format.mjs: 0 failures. checks/architecture.mjs run-productions: 0 failures.
- checks/coverage.mjs run-productions: 26 of 26 live ids named, 0 failures.
- checks/ownership.mjs run-productions tranche/T51 job/T51/run-productions: 4 files, 0 failures.
- setup-words build.mjs --check: rows.mjs stale, the expected note (BOB regenerates at layer close).

Size (session_01W8n89yfSFWhfBxwhhKKJLr): test runs 6, module lines 2237

## J4 · COMPLETE

CHANGE B3 (K4206) done, and the requirement lines B4 asks for are written. Commit cd74e2ac40 on job/T51/run-productions, pushed. I did not merge tranche/T51 in this round; the ownership check ran against it as listed above.

Entries applied:
- (K4206) `DECLARED_OPS` for `suggest`, beside `runProductionsOps` in `bio-plane/src/run-productions/index.mjs`: `classes` admin, member, probe; `mutating` true; `weight` `reversible`; `description` `localize("run-productions.declared.suggest", <op-grades' non-act sentence for suggest>)`, the same sentence the hand row holds, so registration finds no DECLARED_OP_DISAGREES. `fields.accepts` are the twelve fields the arm reads (target, kind, run, name, description, claim, relationship, derived_from, level, observed_at, grounds, legs). `fields.requires` are target, kind, run, description. `stamps` and `machineClasses` are not declared: the hand rows derive them from the family tables, and restating them risks disagreement.
- Requirement R27 (new, your B4 line): written in `build/requirements/run-productions.md`, marked *(not yet met: T51)* and in the Status line. The mark is for you to clear when you merge, as with J1 and J2.
- Test: `bio-plane/test/m/run-productions/declared-ops.test.mjs`, three tests, each naming R27. It calls `declaredOpHolds` (test-support) over the ops map as the door calls it (`runProductionsOps`, a URL and a body), with a fresh store per call. A control covers the kind refusal.

Choices and why:
- `name` is not in `requires`. With the real basis-versions, an absent name is refused `BASIS_VERSION_REFUSED` with an empty detail (checked by a scratch run against the real module). R3 relays that refusal unchanged, so it names no field and the declaration cannot claim it. The fixture's stand-in `appendVersion` throws a TypeError on an empty name, because it reads back a version the empty name never creates. That is a fixture artifact, not a module flaw; the test supplies a name.
- P8 fix in my arm: the `SUGGEST_UNKNOWN_KIND` detail now begins `pass kind=<one of §9's kinds>:`, so the refusal names the field. Its code, check and translation are unchanged. No existing test pins the detail text.

Deferred: nothing.

Found outside run-productions (not changed here):
- `checks/run.mjs /home/user/bio` reports 16 failures, none in run-productions. Coverage (5 modules): agent-harness R17; agent-runner R37, R38, R40; installer-steps R26, R31; journey-check R19; link-sweep R13, R14, R15. Words: op-grades' testcopy findings (15, in owners.test.mjs, t36, t41, t46, t47, t48, t49) and one inline finding in strength/method.mjs:349. For BOB to route to the owning modules.

Tests and checks (from civicos-process against /home/user/bio):
- `node --test bio-plane/test/m/run-productions/`: 65 pass, 0 fail (the 62 from before plus 3 new). Before the change the new file failed on the missing `DECLARED_OPS` export.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio run-productions`: 0 failures.
- `checks/coverage.mjs /home/user/bio run-productions`: 27 of 27 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio run-productions tranche/T51 job/T51/run-productions`: 4 files changed, 1 failure: `build/requirements/run-productions.md` is outside run-productions' paths, tests and job record. Your B4 accepts that listing at merge.
- `checks/run.mjs /home/user/bio`: no finding for run-productions (the repo-wide list above is other modules').

Size (session_017HzxWiogmpDtrEeVS4YKyV): test runs 5, module lines 2239
