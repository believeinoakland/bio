# Diagnosis R7: installer reds and the intake missingkey

## 1. Installer reds (realsize x6, R8, R11, R20, R44)
- First bad commit: ede446bf2a (installer-steps R39/G1, "the plane's schedule set ... from the signed bundle"). Its parent passes requirements.test.mjs + realsize.test.mjs (60 pass, 0 fail, checked in a worktree, since removed).
- Root cause: newgroup/src/steps/uploads.mjs:19-20 (`cronsOf`) refuses a release whose bytes state no `bio-plane-crons/1` (planeCronsOfStream, steps/statements.mjs:78). Every built-in install/update throws `installer.fleet.why.program` ("this release's description of its program can't be read"), so 0 plane PUTs. The embedded signed 0.86.0 (newgroup/src/release.mjs, from 1a17154149) contains no `bio-plane-crons` / PLANE_CRONS_STATEMENT; only the unsigned source (bio-plane/src/control-plane/index.mjs:609, f7eec46ebe) has it.
- Tests that built a repository release from fixture sources (CAPABLE_SRC etc.) carry the statement; tests using RELEASE_SOURCE / REAL (built-in) do not, so they alone go red.
- Owner: installer-steps (the new refusal) meeting the release process (signed bundle predates the statement).
- Verdict: DEFECT in the release, not a stale test. Fix: cut and sign a plane release that includes PLANE_CRONS_STATEMENT (0.87.0), re-run embed-release.mjs; failing-first test: installer asserts the embedded RELEASE_SOURCE states `bio-plane-crons/1` (a new assertion in embed.test.mjs, red today). A test-only patch (append CRONS_STATEMENT to RELEASE_SOURCE) would hide that the real built-in installer is broken.
- Why missed: the gate ran on the source tree; the signed embed is only exercised by these tests, and ede446bf2a's round did not run requirements/realsize.

## 2. missingkey refusal.PROMOTE_NOT_A_PARTICIPANT (r7-project-picker.test.mjs:31)
- The check (civicos-process/checks/words.mjs:438) reads keys from design words.json (docs/development/ux-substrate/screens/words.json), not rows.mjs. The row is there only on the design branch (21d62cc33b, origin/claude/gallant-brown-zg0wc1), not on the tranche tip (0 matches).
- The member sentence is a code stand-in: promotion/index.mjs:708 `localize(key, en)`, built into rows.mjs (origin "code") and words-unreviewed.json:45140.
- Verdict: not a code or test defect. The test is guarded (`hasWord(...) ?`, falls back to project.notmember). The fix is the design row arriving: merge the design stream's words.json (21d62cc33b) into main/tranche. No stand-in in screens-intake is needed (capture.mjs:79 already guards). If the check must be green before then, the test line 31 is the only test-side option (no change recommended).
- Owner: UX-DESIGN stream (merge); screens-intake and promotion unchanged.
