# citation (T51)

**Status** · session_01HR7Gitf2AJ1JvJxN5iFCH2 · depth 2 · WORKING · handled B5

## J1 · REPORT

Flag for BOB (not changed here). `docs/development/ux-substrate/screens/words-reads.json` lists 61 citation strings as `unkeyed` (the design's list; `checks/words.mjs` does not count them, so `citation` has no failure). Several are member-read refusal `detail`s and session-log lines (for example "citations live on the citing object, and this is neither a case nor a question…", "the reasons appended to these citations would push bundle.md past the 1MB inline limit", the "Trigger: selection" and "Changes:" log lines). setup-words R13 names a refusal's `detail` among the sentences a member reads (K3964). I left them as the design's list has them: converting 61 member-facing refusal texts is a design call, not a check finding. Please settle with the design stream (K3944): convert them, or keep them unkeyed. Two lines I did key: the found-passage trigger and the every-member NOWHERE tail (citation.index.trigger_a_part_found_in_capture, citation.index.part_named_written_nowhere); rows.mjs is stale for them until the layer close, as setup-words --check notes.

## J2 · COMPLETE

CR-11 done; words (W) for citation done. Pushed as 0970c7aabc on job/T51/citation.

Entries applied:
- CR-11 (N1071, K3264): the sever-inquiry relay test (sever-inquiry.test.mjs, the last test) runs against the real inquiry answer. It divides the question through the booted inquiry (`divide`), then sever is refused by inquiry R64 with DIVIDED_CANNOT_RESTRUCTURE, target, from "divided" and its children, and the answer equals `dividedCannotRestructure` with handle and drift added. Nothing is written. The stub step (a registered fake promotion check) is gone.
- (W) words: the 1 inline finding (index.mjs trigger of a passage found by search) and the 3 testcopy findings (cite-write.test.mjs:123, found.test.mjs:236, 237) fixed. Also keyed: the every-member NOWHERE tail (index.mjs; citation.index.part_named_written_nowhere) and the test regexes that held the same sentences (found.test.mjs trigger lines; cite-write.test.mjs:133). Output text unchanged.
- (K3962) the 3 test copies of code sentences: fixed by localize equality (K3810).

Deferred: none in this module. Other modules: none found.
Flag: 61 citation strings are on words-reads.json `unkeyed` (see REPORT). Left as the design lists them, for BOB to settle.

Tests and checks:
- node --test bio-plane/test/m/citation/: 102 tests, 102 pass, 0 fail.
- node checks/format.mjs /home/user/bio: 176 modules, 0 failures.
- node checks/architecture.mjs /home/user/bio citation: 16 product files, 0 failures.
- node checks/coverage.mjs /home/user/bio citation: 15 of 15 live ids named by a test, 0 failures.
- node checks/words.mjs /home/user/bio citation: 0 failures (inline 0, testcopy 0).
- node checks/run.mjs /home/user/bio: citation has no finding. The tree-wide failures (words 3364, coverage 28) are other modules' and are not this job's.
- node bio-plane/src/setup-words/build.mjs --check: a stale-rows note naming the two new keys, as expected; no refusal naming citation.
- node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation: 5 files changed, 0 failures.

No pull request is opened (JOB step 1). The commit carries the session trailer but no model-name co-author line, because the model-identity rule forbids model identifiers in commits.

Size (session_018wkgQYFa889na4frSPWfKx): test runs 1, module lines 1486

## J3 · COMPLETE

B2 done: every member-read sentence of citation is read through the list. Pushed as the commit "T51 citation (B2): member-read sentences read through the list" on job/T51/citation.

Converted (output text unchanged, ids citation.<file stem>.<slug>):
- Every refusal detail in index.mjs and recorded.mjs (the 61 design-unkeyed items, including the ones already keyed by an earlier codemod that the design list still named).
- The session-log lines that reach bundle.md: the Session headers (one id for one record, one for many; no ICU plural), Trigger: selection (both forms), Trigger: question, the "; for question" trailer, Changes: basis legs, Changes: cites edges, the Note trailer, and the set-moved note.
- The grammar labels passed to inquiry's extent check ("the part of the document this citation names") and the #document fallbacks ("the project's own bundle.md does not parse").

Kept unkeyed, listed for the record: none in the module source. The design list's one remaining counted entry is the frontmatter wiring line in splice.mjs (`- rel: ... target: ... status: ...`), which is record grammar, not prose.

Tests: every test that held a sentence now compares with localize by equality (cite-write, draw, query-drift, recorded, found), or asserts the key. Test copies are 0.

Checks:
- node --test bio-plane/test/m/citation/: 102 pass, 0 fail.
- node checks/words.mjs /home/user/bio citation: 0 failures (inline 0, testcopy 0, unkeyed 1: the splice wiring line above).
- node checks/format.mjs /home/user/bio: 176 modules, 0 failures.
- node checks/architecture.mjs /home/user/bio citation: 0 failures.
- node checks/coverage.mjs /home/user/bio citation: 15 of 15 live ids named, 0 failures.
- node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation: 9 files, 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: a stale-rows note (expected; rows regenerate at the layer close); no refusal naming citation.

Earlier pass (CR-11, J2): unchanged; this COMPLETE supersedes it.

Size (session_018wkgQYFa889na4frSPWfKx): test runs 5, module lines 1415

## J4 · COMPLETE

B3 done (K4015): the words check on citation is clean. Pushed on job/T51/citation as "T51 citation (B3): the NO_ROLE translation is read through the list".

Finding fixed: checks.mjs:21, the NO_ROLE translation (C-33.16) was a literal joined by + that copied the row refusal.NO_ROLE. It now reads word('refusal.NO_ROLE'); the text is equal to the row.

Unkeyed items kept: none. The module's remaining unkeyed count is 0.

Checks after the fix:
- node checks/words.mjs /home/user/bio citation: 0 failures (inline 0, testcopy 0, unkeyed 0). The check is run from the pulled process main (d424c32).
- node --test bio-plane/test/m/citation/: 102 pass, 0 fail.
- node checks/format.mjs /home/user/bio: 0 failures.
- node checks/architecture.mjs /home/user/bio citation: 0 failures.
- node checks/coverage.mjs /home/user/bio citation: 15 of 15 live ids, 0 failures.
- node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation: 10 files, 0 failures.
- node --test checks/test/*.test.mjs tools/test/*.test.mjs (process repo): 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: no refusal naming citation.

Size (session_018wkgQYFa889na4frSPWfKx): test runs 7, module lines 1412

## J5 · QUESTION

Two small judgments in entry 4 (the census declaration), my best readings first; I carry on with them.
1. `cite`'s `role` is required on a question's arm (NO_ROLE) but refused on a case's (ROLE_NOT_APPLICABLE). One op row cannot say both. Best reading: `requires: ["project", ["handle","found"]]`, `role` only in `accepts`; the question screens always send a role. If you want `role` required, the case-arm sends of `cite` (if any screen has one) would fail interface-shell's guard.
2. `cite`, `sever` and `reinstate` read `owner` from the address, but the door overwrites it server-side (control-plane/index.mjs:1944, selection ownership). Best reading: it is a stamp like `viewer`, so left out of `accepts`.
Also: build/modules.json gives `citation` no `uses` edge to `test-support`; the declared-ops tests import its helper (the pass added that edge to ten other modules). Please add it; until then the architecture check will name it.
