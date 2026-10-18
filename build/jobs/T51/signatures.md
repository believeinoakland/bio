# signatures (T51)

**Status** · session_015VZKTseC9t96t8nkHmNfYn · depth 2 · COMPLETE · handled B4

## J1 · BLOCKED

BLOCKED (cause: needs Bob).
NEEDS BOB: approve the one Bash act that deletes the signing page's tests in bio-plane/test/m/signatures/signatures.test.mjs (lines 977-1394: R25, R30, R31, R32, R37/R39/R42 page tests, their loadPage and sign helpers; plus lines 22-23, 34, 1418, 1464, 1477 imports and references), and the whole file bio-plane/test/m/signatures/signer-keys.test.mjs (every test in it is a page test of retired R43, R44, R32), by git rm. The permission check refused the sed/git call that would make these edits (the auto-mode classifier, 'Security Test Removal'). I have not worked around the refusal; no file in the module has changed yet.
Why: BOB's START note 1 and the T51-124 entry name these deletions. Everything else in the job is ready to follow: release-signer.test.mjs needs the page import (line 20) and two page-derived checks rewritten against node:crypto, and the rest of the checks are next.
Standing rule question for Bob: if the permission rule should allow these deletions, the settings rule (the Bash command) decides; otherwise say which lines to keep.

## J2 · BLOCKED

BLOCKED (cause: needs Bob). NEEDS BOB: approve Bash for the removal in bio-plane/test/m/signatures/signatures.test.mjs of the page tests moved to signpage.test.mjs (sed -i deleting lines 977-1394 and the page imports at 22-23, 34, 1418, 1464, 1477). The permission check refused it again: 'Security Test Removal' (auto mode). The same check also refused 'node --test' on the module's test files, so I cannot run the tests. Done so far: signpage.test.mjs created with the page tests copied unchanged (13 pass, run before the refusal); release-signer.test.mjs rewritten (page import and page checks replaced by node:crypto; NOT yet run). Not done: the removal above, signatures.test.mjs run, checks, COMPLETE. I have not worked around the refusals.

## J3 · COMPLETE

COMPLETE. Entries applied: T51-124 (retirements already folded in the requirements; the page's tests moved out per B2/B3 and the approval). Tests: signatures 51 pass 0 fail; signpage 13 pass; release-signer 13 pass; release-notice 23 pass; signer-keys 9 pass (left as is, per B2). Checks: format 0 failures; architecture 0 failures (signatures); coverage 48 of 48 live ids named by a test (signatures); ownership tranche/T51 0 failures; run.mjs: channels 0 failures; coverage fails in OTHER modules only (agent-harness R17, agent-runner R36 R37 R38 R40, bundler R36 R37, journey-check R19, office-readers R34, pdf-reader R39, project-roster R35 R36): not this module's; reported. Deferred: none. Found elsewhere: bundler and fleet/bundle tests import signpage/sign-release.html and will need the page's move at the merge (BOB). Size (session_01JyN2szAX3kLAZzz8syqiPy): test runs 6, module lines 917 (sshsig.mjs 560, tsa.mjs 224, sign-sshsig.mjs 133).

## J4 · COMPLETE

COMPLETE. Entry applied: T51-173 (words pass, the 25 findings in build/plan/words-pass/signatures.md). All 25 were test copies: 14 in signer-keys.test.mjs and 11 in signpage.test.mjs. Each literal now reads the page's sentence or label through word() with its words.json key (sign-release.*): public.both, raw.title, recovery.public/private, ratify/notice/docket.intro, .signature, .paste.id, .covers (with vars), and the record/notice/docket checks. signpage.test.mjs imports word. Two comparisons changed in kind, not in what they prove: the markup check compares the whitespace-normalized markup, and the rendered-output check compares the visible text (tags stripped, whitespace normalized), because the id sits in a <code> element and the sentence wraps. No module code, no page file, no generated artifact changed; no new ids, no test removed or weakened.
Tests: node --test test/m/signatures/ : 109 pass, 0 fail.
Checks (checks/run.mjs and the per-module runs): format 0 failures; architecture (signatures) 0 failures; coverage (signatures) 48 of 48 live ids named by a test, 0 failures; words (signatures) 0 failures; ownership tranche/T51 job/T51/signatures 0 failures (3 files changed by signatures); channels 0 failures.
Deferred: none.
Found in other modules (not this job's; run.mjs reports them on the base): the words check shows testcopy findings in other modules (wizard-scripts and others: 2796 failures repo-wide), and the coverage check shows 33 failures in other modules (none in signatures). Inherited per the START; listed here for BOB.
Size (session_015VZKTseC9t96t8nkHmNfYn): test runs 3, module lines 917 (sshsig.mjs 560, tsa.mjs 224, sign-sshsig.mjs 133).
Commit 44bdff229b pushed to job/T51/signatures.
