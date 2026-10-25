# answer-envelope (T51)

**Status** · session_018t8F8zPApmVgDX2vg3Mdb4 · depth 2 · COMPLETE · handled B5

## J1 · COMPLETE

T51-109 answer-envelope: done at cdcb5f4bfc (on job/T51/answer-envelope, merged tranche/T51 at fe5d5656fb).

Entries applied:
- T51-109 (the entry): the stale comments are fixed. checks.mjs:23 now says the legacy civicos-ui screens read the "unknown op" sentence until that folder is deleted (CR-5), and page-policy.test.mjs's header and test title no longer name the signer page. page-policy.test.mjs no longer imports SIGN_HTML; the signer-page case leaves its test (the page is deleted by control-plane's T51-123).
- The words check (words.mjs, answer-envelope): 1 finding, the families.test.mjs hand-list of five route and attest codes, now read from provenance-routes' ROUTE_MARK_CHECKS and attestation's ATTEST_CHECKS. Result: 0 failures.
- The words-pass testcopies (words-pass file, 4 lines): the catalogue-end and families copies were already gone; the two envelope.test.mjs copies of "requires sha256=<64 lowercase hex>" (lines 290, 292) are now a fixture that copies no product sentence. Result: 0 failures.
- The four inherited reds (catalogue-end.test.mjs:17, :80, :124, families.test.mjs:686): cleared by re-pinning rows-before-r43.json. STANDARD_PROPOSER_UNNAMED re-pinned b037fb193ecd187e -> f949b28d7eef8c30 as K4010 §2 says. The tip has moved since K4010: nine more rows drifted and are re-pinned to the sentence each now reads by key (see REPORT below): CANDIDATE_NO_PROPOSALS, CAPTURE_REQUEST_NO_RUN, CAPTURE_REQUEST_RENDER_MALFORMED, LIFECYCLE_TOKEN_MALFORMED, PHASE_MALFORMED, SUBJECT_MALFORMED, TEMPLATE_KIND_REFUSED, VERSION_CURRENT_NO_PROJECT, VERSION_STRENGTH_UNKNOWN_STATE. changed.note names each.
- You inherited: T51-109 removes page-policy.test.mjs's import of signpage.mjs. Done.

Deferred: none.

REPORT (for BOB, against other modules and the words pass):
1. The words pass (K3949, K3930) did not hold "character for character" for these rows. Each row's words.json sentence differs from the sentence its owner's code carried before the pass: contradiction C-93.4 CANDIDATE_NO_PROPOSALS reads "judgment" where the code had "judgement"; I checked CANDIDATE_NO_PROPOSALS and PHASE_MALFORMED against their pre-pass text; the other seven moved the same way (digest changed, same check and code). I re-pinned them as owners' rows now declare them (the T50-25 precedent), so the pin guard is quiet, but the change is a wording change that the pass's proof did not state. Please confirm these are the intended words; if not, owners must restore them and the rows must be re-keyed.
2. standards' commit 4c43e67e3f changed C-112.14's text from "labelled" to "labeled" under a "no wording change" message (already in K4010 §2). Pinned here as f949b28d7eef8c30.
3. control-plane (T51-123) should drop the signer page: after it, nothing in answer-envelope tests the signer page's policy. bio-plane/src/answer-envelope/index.mjs:15 still names "the signer page" in a comment; accurate until T51-123 deletes the page, so I left it.
4. The repository-wide words run shows 1,096 failures across other modules (wizard-scripts and others). Not answer-envelope's; not touched.

Requirement lines: no requirement text changed by this job. R6's text still names the signer page; that is BOB's edit at the fold.

Checks (run in this job, summary lines):
- node checks/run.mjs /home/user/bio (process repo @ a4c42ff): format: 176 modules, 175 requirements files; 0 failures. architecture: 3649 product files; 0 failures. words: 175 modules; answer-envelope 0 findings after the two fixes (repo total 1096 failures in other modules, see REPORT 4).
- node checks/words.mjs /home/user/bio answer-envelope: 1 modules, 1528 string literals; 0 failures.
- node checks/architecture.mjs /home/user/bio answer-envelope: 10 product files, 127 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio answer-envelope: 18 of 18 live requirement ids named by a test; 0 failures.
- node checks/ownership.mjs /home/user/bio answer-envelope tranche/T51 job/T51/answer-envelope: 6 files changed by answer-envelope; 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: "words-unreviewed.json is stale or absent" (the stale-rows note the entry expects; no refusal naming answer-envelope).
- node --test test/m/answer-envelope/ (bio-plane): tests 41, pass 41, fail 0.

Size (session_01KHeJpKJpVgMFJJ24YKGUBJ): test runs 8, module lines 890

## J2 · COMPLETE

K4205 (T51 fix round, FR-51) done at 14999b1464 on job/T51/answer-envelope.

Entries applied:
- K4205: `rows.NO_REVIEW_COPY` in `bio-plane/test/m/answer-envelope/rows-before-r43.json` re-pinned to `["C-87.1","98c5b7df4bccde75"]`, the digest computed from the row's current translation (`refusal.NO_REVIEW_COPY`, words.json), not copied from the diagnosis. `changed.note` gains one sentence naming the cause (design B411 live walk, 3f8b0d2dc8). A full comparison of all 900+ pinned codes found no other stale pin, so no other pin moved.
- Not done: the "better" option (the snapshot reads a word row's digest at test time). R7 requires a pinned digest to move with a re-wording under a ruling, and a test-time read would stop the pin checking anything. Your requirement does not allow it, so I kept the re-pin. If you want the cheaper form (skip the digest compare for keyed rows, as the diagnosis suggests), that is a requirement change for you to decide.
- The control: before the re-pin the four tests were red on this exact pin (the diagnosis records the failure); the in-test negative controls (old pin seen, bare-code and changed-sentence controls) still run and pass.

Deferred: none.

REPORT (other modules, not changed by this job):
1. `node checks/run.mjs /home/user/bio` (coverage) shows live requirement ids named by no test in seven other modules: agent-harness R17; agent-runner R36 R37 R38 R40; citation R16 R17 R18; installer-steps R26 R31; journey-check R19; link-sweep R13 R14 R15; monitoring R75 R76 R77. Not answer-envelope's; I did not touch them.
2. Architecture and words for the whole repo show 0 failures; format shows 0 failures.

Checks run (summary lines):
- node checks/format.mjs /home/user/bio: 175 modules, 175 requirements files; 0 failures.
- node checks/architecture.mjs /home/user/bio answer-envelope: 10 product files, 127 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio answer-envelope: 18 of 18 live requirement ids named by a test; 0 failures.
- node checks/ownership.mjs /home/user/bio answer-envelope tranche/T51 job/T51/answer-envelope: 1 files changed by answer-envelope; 0 failures.
- node checks/run.mjs /home/user/bio: architecture 0 failures; words 0 failures; coverage 7 failures in other modules (REPORT 1).
- node --test --test-force-exit test/m/answer-envelope/ (in bio-plane): tests 41, pass 41, fail 0 (catalogue-end :17, :80, :124 and families :689 among them).

Size (session_01FvmPgUS1f2D4dmmfN6kjNh): test runs 1, module lines 890

## J3 · REPORT

Other modules, found by `node checks/run.mjs /home/user/bio` at this tip (not answer-envelope's; not touched):
1. Coverage: live requirement ids named by no test: agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31; journey-check R19. Coverage reports 6449 of 6456 named (4 failures). The other three modules listed in J2's REPORT are now covered.
2. Architecture (3917 product files), format (175 modules), channels (2 participants) and words (175 modules; 0 failures) show 0 failures.

## J4 · COMPLETE

K4291 (CHANGE: the 16 tests red on `adminendorse: registered after the first read (R81)`) done at 20d0e9c9bc on job/T51/answer-envelope.

Entries applied:
- K4291, the walk: `families.test.mjs`'s `unreached()` imports `bio-plane/src/plane/register.mjs` before its first walk, as following's R1 fix does (8d76643e0c, plane R68). With that, the TypeError is gone and every walk-based test runs.
- The same red, one more: `families.test.mjs`' link-sweep test (R2, R7; K1207, N506) pinned three codes, C-18.16–C-18.18. link-sweep's `SWEEP_CHECKS` now also holds C-18.24, `MACHINE_CANNOT_SET_SWEEP` (link-sweep R13, K4189; monitoring took C-18.22 and C-18.23). The expected list now names four codes and the test title names C-18.24. The check that every row decorates with its own check and words is unchanged, and so are the negative controls.
- Not changed: no requirement line, no source file, and no negative control. Tests only.

Deferred: none.

REPORT (sent as J3, other modules, not changed by this job): agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31; journey-check R19 are named by no test (coverage: 4 failures).

Checks run (summary lines):
- node --test --test-force-exit test/m/answer-envelope/ (in bio-plane, after the lockfile `node_modules` were present where the module needs them): tests 41, pass 41, fail 0. Before the fix: the walk TypeError on the R2/R7 family tests, 15 of them, and the link-sweep row assertion.
- node checks/format.mjs /home/user/bio (via checks/run.mjs): 175 modules, 175 requirements files; 0 failures.
- node checks/run.mjs /home/user/bio (process repo at a4c42ff34): format 0 failures; architecture: 3917 product files, 13487 relative imports; 0 failures; coverage: 6449 of 6456 live requirement ids named by a test; 4 failures, none in answer-envelope (REPORT); channels: 2 participants, 1314 outbox commits read; 0 failures; words: 175 modules, 641311 string literals read, 18009 words; 0 failures.
- node checks/ownership.mjs /home/user/bio answer-envelope tranche/T51 job/T51/answer-envelope: 1 files changed by answer-envelope; 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: rows.mjs and words-unreviewed.json match words.json and the source (not regenerated).

Size (session_01LY4Tk2jtCcFd4L7Syr6Sak): test runs 3, module lines 890
